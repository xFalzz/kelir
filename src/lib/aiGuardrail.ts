import type { BahasaAktif } from '../content/pusaka.ts';
import { konversiTeksKeAksaraAman } from './aksara.ts';

export const BATAS_KARAKTER_TANYA = 320;
export const BATAS_KARAKTER_PUJANGGA = 140;
export const BATAS_KARAKTER_KRAMA = 160;
export const BATAS_KARAKTER_TUR = 120;
export const BATAS_KARAKTER_OUTPUT_AI = 1450;

export type KategoriKeamananAI =
  | 'aman'
  | 'kosong'
  | 'injeksi-prompt'
  | 'kebocoran-rahasia'
  | 'luar-topik';

export type HasilPemeriksaanInput =
  | {
      aman: true;
      kategori: 'aman';
      inputBersih: string;
    }
  | {
      aman: false;
      kategori: Exclude<KategoriKeamananAI, 'aman'>;
      inputBersih: string;
    };

export interface HasilValidasiTemaPujangga {
  aman: boolean;
  kategori: KategoriKeamananAI;
  temaBersih: string;
  pesanKeamanan?: string;
}

export interface OpsiAuditOutput {
  minKarakter?: number;
  maxKarakter?: number;
  wajibJangkarBudaya?: boolean;
}

const DELIMITER_BERBAHAYA_RE =
  /<\s*\/?\s*(?:system|developer|assistant|tool|function|prompt|instructions?|pertanyaan_pengguna|bukti_arsip_s1_s7|instruksi_kurasi|spesimen_terkurasi|tema_budaya|frasa_pengguna|daftar_titik|preferensi_pengguna|script|iframe|svg)\b|<<\s*sys\s*>>|\[\s*\/?\s*inst\s*\]|###\s*(?:system|instruction|developer|assistant|human)\s*:/gi;

const POLA_INJEKSI_PROMPT: RegExp[] = [
  /\bignore\s+(?:all\s+|the\s+|any\s+|previous\s+|prior\s+|above\s+){1,3}(?:instructions?|rules?|prompts?|constraints?|system|guidelines?)\b/i,
  /\bdisregard\s+(?:all\s+|the\s+|any\s+|previous\s+|prior\s+){1,3}(?:instructions?|rules?|prompts?|constraints?|system)\b/i,
  /\babaikan\s+(?:semua\s+|seluruh\s+)?(?:instruksi|aturan|perintah|panduan|sistem|larangan)\b/i,
  /\blupakan\s+(?:semua\s+|seluruh\s+)?(?:instruksi|aturan|peran|konteks|peranmu)\b/i,
  /\bforget\s+(?:all\s+|your\s+|previous\s+|prior\s+)*(?:instructions?|rules?|constraints?|persona|role)\b/i,
  /\boverride\s+(?:system|rules?|instructions?|guardrails?|safety|filters?|developer)\b/i,
  /\b(?:bypass|circumvent|disable|matikan|lewati|jebol|tembus)\s+(?:guardrails?|safety|filter|keamanan|batas|aturan|pagar)\b/i,
  /\b(?:jailbreak|dan\s+mode|developer\s+mode|god\s+mode|unfiltered\s+mode|mode\s+tanpa\s+batas|do\s+anything\s+now)\b/i,
  /\b(?:act\s+as|pretend\s+(?:you\s+are|to\s+be)|bertindak(?:lah)?\s+sebagai|berpura-pura(?:lah)?\s+(?:jadi|sebagai)|roleplay\s+as|you\s+are\s+(?:now|no\s+longer))\s+(?:an?\s+|seorang\s+)?(?:developer|admin|hacker|unfiltered|uncensored|chatgpt|gpt|python|coder|programmer|terminal|linux|bot\s+bebas|ai\s+tanpa\s+batas|pamomong)\b/i,
  /\b(?:system|developer|hidden|secret|internal|initial|original)\s+(?:prompt|instruction|instructions|directive|directives|message)\b/i,
  /\binstruksi\s+(?:sistem|system|developer|rahasia|asli|tersembunyi)\b/i,
  /\b(?:hypothetical|fictional|simulation|skenario\s+fiksi|anggaplah|misalkan|seolah-olah)\b.{0,45}\b(?:no\s+rules|no\s+restrictions|tanpa\s+aturan|tanpa\s+batas|reveal|bocorkan|api\s*key|system\s*prompt|jailbreak)\b/i,
  /\b(?:base64|rot13|hexadecimal|unicode\s+escape)\b.{0,35}\b(?:decode|encode|system|prompt|key|secret|eval|instruksi)\b/i,
  /<\s*script\b|javascript:|onerror\s*=|onload\s*=|\bunion\s+select\b|\bdrop\s+table\b/i,
];

const POLA_EXFILTRASI_RAHASIA: RegExp[] = [
  /\b(?:api[_\s-]?key|gemini[_\s-]?api[_\s-]?key|secret[_\s-]?key|access[_\s-]?token|private[_\s-]?key|process\.env|\.env(?:\.local)?|environment\s+variables?|variabel\s+lingkungan|kunci\s+api|source\s+code|kode\s+backend|file\s+\.env)\b/i,
  /\b(?:reveal|show|print|dump|leak|output|display|repeat|recite|echo|spell|tampilkan|sebutkan|bocorkan|cetak|tulis\s+ulang|ulangi|bacakan|berikan)\b.{0,40}\b(?:system\s+prompt|system\s+instruction|hidden\s+prompt|initial\s+instructions?|prompt\s+asli|instruksi\s+asli|instruksi\s+sistem|instruksimu|konfigurasi|rahasia|credentials?|password|token|env|api\s*key)\b/i,
  /\b(?:read|open|cat|print|dump|akses|baca|lihat|ambil)\s+(?:file\s+|isi\s+)?(?:package\.json|\.env|vite\.config|tsconfig|src\/|server\/|api\/|etc\/passwd|id_rsa)\b/i,
  /AIza[0-9A-Za-z_-]{12,}/,
  /\b(?:sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/,
];

const POLA_LUAR_TOPIK: RegExp[] = [
  // Pemrograman, skrip, & keamanan siber
  /\b(?:python|javascript|typescript|svelte|react|nextjs|nodejs|php|golang|rust|c\+\+|html|css|sql|mysql|postgres|mongodb|docker|kubernetes|bash\s+script|powershell|regex|algoritma\s+sorting|leetcode|github\s+action|coding|debug\s+code|exploit|malware|ransomware|phishing|ddos|brute\s*force|xss|sql\s+injection)\b/i,
  /\b(?:buatkan|tulis|bikin|generate|write)\s+(?:satu\s+|sebuah\s+)?(?:kode|coding|script|program|aplikasi|website|api|bot|query\s+sql|rumus\s+excel|fungsi)\b/i,
  // Kripto, saham, finansial komersial & judi
  /\b(?:bitcoin|btc|ethereum|eth|solana|crypto|cryptocurrency|kripto|blockchain|nft|binance|forex|trading\s+saham|saham|stock\s+market|indeks\s+saham|nasdaq|ihsg|reksadana|pinjol|pinjaman\s+online|slot\s+gacor|judi\s+online|judol|togel|casino|taruhan|kurs\s+(?:dollar|usd|yen|euro)|nilai\s+tukar)\b/i,
  // Politik modern, olahraga, gadget, harga/komersial, medis, resep masak praktis, tugas eksakta
  /\b(?:pemilu|pilpres|pilkada|kampanye|partai\s+politik|gubernur|bupati|walikota|dpr\s+ri|presiden\s+(?:amerika|as|usa|prancis|rusia|indonesia)|skor\s+(?:bola|pertandingan)|liga\s+inggris|champions\s+league|piala\s+dunia|sepak\s+bola|messi|ronaldo|harga\s+(?:iphone|samsung|laptop|rtx|bbm|bitcoin|tiket|emas)|jadwal\s+(?:pesawat|kereta|penerbangan|krl|sholat)|cek\s+resi|lowongan\s+kerja|cpns|download\s+(?:film|lagu|apk)|cheat\s+game|diagnosa\s+penyakit|resep\s+(?:masak|masakan|nasi\s+goreng|kue|rendang|seblak|bumbu)|dosis\s+obat|obat\s+(?:demam|batuk|kanker|diabetes)|ramalan\s+(?:cuaca|zodiak)|prediksi\s+cuaca|kerjakan\s+(?:pr|tugas\s+matematika|soal\s+kalkulus)|hitung\s+integral|rumus\s+(?:luas|volume|fisika)|lirik\s+lagu\s+(?:pop|kpop|rock|dangdut)|translate\s+to\s+(?:french|spanish|korean|japanese)|terjemahkan\s+ke\s+bahasa\s+(?:korea|jepang|arab|prancis))\b/i,
  // Fragmen sintaks kode eksplisit
  /(?:[{};]{2,}|=>|\bdef\s+\w+\s*\(|\bfunction\s+\w+\s*\(|\bconsole\.log\(|\bimport\s+\w+\s+from\b|\beval\s*\(|child_process)/,
];

const SINYAL_ARSIP_S1S7_RE =
  /\b(?:S[1-7]|keris|dhuwung|pamor|luk\s*(?:5|lima|gangsal|\d+)?|pendok|warangka|pesi|ganja|wilah|empu|gamelan|saron|slendro|pelog|laras|peking|pijetan|demung|batik\s+kawung|kawung|canting|soga|malam|nglorod|joglo|pendopo|pendhapa|sakaguru|saka\s*guru|umpak|tumpang\s*sari|purus|wayang\s+kulit|ringgit\s+wacucal|kelir|blencong|dalang|dhalang|pakeliran|cempurit|tuding|tatahan|sunggingan|kijang\s+kencana|kidang|aranya\s*kanda|ramayana|hanacaraka|carakan|nglegena|pasangan|sandhangan|a980|sangkan|paraning|dumadi|memayu|hayuning|bawana|sonobudoyo|perpusnas)\b/i;

const KONSEP_BUDAYA_NUSANTARA_RE =
  /\b(?:budaya|kebudayaan|adat|istiadat|tradisi|tradisional|kearifan(?:\s+lokal)?|warisan|pusaka|kesenian|seni|tari|tarian|musik|instrumen|alat\s+musik|rumah\s+adat|arsitektur|pakaian\s+adat|baju\s+adat|busana|wastra|tenun|ikat|songket|ulos|tapis|sasirangan|gringsing|batik|kriya|ukiran|pahatan|anyaman|noken|senjata\s+tradisional|rencong|kujang|mandau|badik|celurit|tombak|aksara|lontara|kawi|pallawa|bahasa\s+daerah|sastra|pantun|gurindam|syair|macapat|tembang|hikayat|babad|kakawin|epos|legenda|mitologi|cerita\s+rakyat|folklore|candi|prasasti|kerajaan|kesultanan|keraton|istana|upacara|ritual|sesaji|kuliner\s+tradisional|tumpeng|rendang|pencak\s+silat|subak|pinisi|fahombo|lompat\s+batu|ngaben|rambu\s+solo|sekaten|grebeg|nyadran|kasada|tabuik|tiwah|seren\s+taun|peusijuek|bakar\s+batu|mitoni|tedhak\s+siten|selamatan|nyepi|ogoh-ogoh|galungan|kuningan|ondel-ondel|debus|zapin|wae\s+rebo|dalihan\s+na\s+tolu|baju\s+bodo|kebaya|blangkon|udeng|gotong\s+royong|bhinneka(?:\s+tunggal\s+ika)?|sutasoma|nagarakretagama|pararaton|la\s+galigo|sumpah\s+palapa|sumpah\s+pemuda|gajah\s+mada|hayam\s+wuruk|borobudur|prambanan|ratu\s+boko|muaro\s+jambi|majapahit|sriwijaya|singasari|pajajaran|demak|mataram|kutai|tarumanagara|gowa|tallo|ternate|tidore|saman|pendet|kecak|barong|legong|piring|randai|jaipong|merak|reog|ponorogo|jathilan|ludruk|ketoprak|lenong|golek|topeng|tor-?tor|cakalele|yospan|angklung|calung|kecapi|suling|sasando|kolintang|tifa|talempong|saluang|gondang|sampek|gendang|rumah\s+gadang|gadang|tongkonan|honai|bolon|betang|lamin|omo\s+sebua|baileo|limas|mega\s+mendung|sekar\s+jagad|suku|etnis|etnik|filosofi|makna|sejarah|asal-usul|nusantara|nuswantara|indonesia|unesco|karawitan|gending|gendhing|pathet|culture|cultural|heritage|traditional|indigenous|ethnic|tribe|dance|music|instrument|architecture|temple|kingdom|textile|weaving|script|ceremony|ritual|folklore|archipelago|indonesian)\b/gi;

const WILAYAH_BUDAYA_NUSANTARA_RE =
  /\b(?:aceh|gayo|sumatera|sumatra|batak|karo|toba|nias|minang|minangkabau|padang|pariaman|melayu|riau|jambi|palembang|bengkulu|rejang|lampung|banten|baduy|betawi|sunda|cirebon|jawa|yogyakarta|jogja|surakarta|solo|banyumas|tengger|oseng|madura|bali|sasak|lombok|sumbawa|bima|sumba|flores|manggarai|rote|savu|timor|ntb|ntt|kalimantan|borneo|dayak|banjar|kutai|sulawesi|bugis|makassar|toraja|mandar|minahasa|gorontalo|kaili|buton|maluku|ambon|tanimbar|halmahera|papua|asmat|dani|kamoro|sentani|baliem|bajo)\b/gi;

const JANGKAR_BUDAYA_OUTPUT_RE =
  /\b(?:S[1-7]|keris|dhuwung|pamor|luk|pendok|warangka|gamelan|saron|slendro|pelog|laras|wilah|peking|gong|kenong|batik|kawung|canting|soga|malam|wastra|joglo|pendopo|pendhapa|sakaguru|umpak|tumpang|wayang|kelir|blencong|dalang|dhalang|pakeliran|cempurit|tuding|tatahan|sunggingan|rama|sinta|rahwana|kijang|kidang|hanacaraka|aksara|carakan|nglegena|pasangan|sandhangan|jawa|jawi|javanese|nusantara|nuswantara|indonesia|indonesian|archipelago|karaton|keraton|mataram|unesco|sonobudoyo|pusaka|budaya|kebudayaan|adat|tradisi|tradisional|filosofi|piwulang|pitutur|memayu|sangkan|eling|waspada|budi|luhur|karawitan|gending|gendhing|tembang|pathet|tari|tarian|musik|instrumen|rumah\s+adat|arsitektur|pakaian\s+adat|senjata|candi|kerajaan|kesultanan|upacara|ritual|kearifan|suku|etnis|warisan|sejarah|kriya|tenun|songket|ulos|tapis|sasirangan|noken|rencong|kujang|mandau|badik|angklung|sasando|kolintang|tifa|talempong|saluang|gondang|sampek|saman|pendet|kecak|barong|jaipong|piring|reog|tortor|tor-tor|cakalele|yospan|gadang|tongkonan|honai|bolon|betang|lamin|baileo|limas|subak|pinisi|ngaben|fahombo|tabuik|tiwah|borobudur|prambanan|majapahit|sriwijaya|singasari|pajajaran|kutai|lontara|sunda|cirebon|aceh|gayo|batak|nias|minang|minangkabau|melayu|lampung|betawi|madura|bali|lombok|sasak|sumba|flores|rote|dayak|banjar|bugis|makassar|toraja|minahasa|maluku|papua|asmat|dani|bhinneka|sutasoma|gotong\s+royong|pencak\s+silat|tumpeng|rendang|heritage|shadow|bronze|blade|architecture|wooden|copper|script|unicode|a980|cultural|culture|dance|folklore|indigenous|ethnic|ritual|ceremony|kingdom|temple|textile|weaving|ati|manah|rahayu|tentrem)\b/i;

const TOKEN_TOLAK_KEAMANAN_RE = /\[\s*TOLAK_KEAMANAN\s*\]/i;
const TOKEN_LUAR_DOMAIN_RE = /\[\s*LUAR_DOMAIN_BUDAYA\s*\]/i;

const KEBOCORAN_OUTPUT_RE: RegExp[] = [
  /AIza[0-9A-Za-z_-]{12,}/,
  /\b(?:GEMINI_API_KEY|KELIR_DISABLE_LIVE_GEMINI|process\.env|Bearer\s+[A-Za-z0-9._-]{10,}|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/i,
  /<\s*\/?\s*(?:system|developer|assistant|pertanyaan_pengguna|bukti_arsip_s1_s7|instruksi_kurasi|spesimen_terkurasi|tema_budaya|frasa_pengguna|daftar_titik|preferensi_pengguna|script)\b/i,
  /\[\s*(?:TOLAK_KEAMANAN|LUAR_DOMAIN_BUDAYA)\s*\]/i,
  /\b(?:ASISTEN_PAMOMONG_KELIR|PUJANGGA_KELIR|BUKTI\s+ARSIP\s+S1-S7)\b/,
  /(?:```|https?:\/\/)/i,
  /\b(?:as\s+an\s+ai\s+language\s+model|as\s+a\s+large\s+language\s+model|sebagai\s+model\s+bahasa\s+ai|sebagai\s+ai\s+buatan)\b/i,
  /\b(?:console\.log\(|SELECT\s+\*\s+FROM|import\s+\{[^}]+\}\s+from)\b/i,
];

function sesuaikanBahasaAksara(bahasa: BahasaAktif, teks: { id: string; en: string; jw: string }): string {
  if (bahasa === 'en') return teks.en;
  if (bahasa === 'jw') return teks.jw;
  if (bahasa === 'aks') return konversiTeksKeAksaraAman(teks.jw);
  return teks.id;
}

/**
 * Membersihkan karakter tak tampak, delimiter injeksi, dan membatasi panjang input pengguna.
 */
export function bersihkanInputPengguna(teks: string, maxLen = BATAS_KARAKTER_TANYA): string {
  if (typeof teks !== 'string') return '';
  return teks
    .normalize('NFKC')
    .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/```+/g, ' ')
    .replace(DELIMITER_BERBAHAYA_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function buatVarianDeobfuskasi(norm: string): { tanpaPemisah: string; leetDecoded: string } {
  let decoded = norm;
  if (/%[0-9a-f]{2}/i.test(norm)) {
    try {
      decoded = decodeURIComponent(norm);
    } catch {
      decoded = norm;
    }
  }
  const tanpaCombining = decoded
    .replace(/\p{M}/gu, '')
    .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '');

  // Satukan huruf tunggal terpecah tanda titik/garis bawah seperti "p.r.o.m.p.t" atau "a_p_i_k_e_y"
  const tanpaPemisah = tanpaCombining.replace(/(?<=\b[a-z0-9])[._-]+(?=[a-z0-9](?:\b|[._-]))/gi, '');

  const PETA_LEET: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    $: 's',
  };
  const leetDecoded = tanpaPemisah.replace(/\b[a-z0-9_$@-]{3,}\b/gi, (tok) => {
    if (!/[a-z]/i.test(tok) || !/[0-9@$]/.test(tok)) return tok;
    return tok.replace(/[013457@$]/g, (ch) => PETA_LEET[ch] ?? ch);
  });

  return { tanpaPemisah, leetDecoded };
}

/**
 * Memeriksa input pengguna terhadap injeksi prompt, obfuskasi jailbreak,
 * upaya exfiltrasi rahasia, maupun topik di luar ranah budaya Nusantara & KELIR.
 */
export function deteksiSeranganAtauLuarTopik(
  teksRaw: string,
  maxLen = BATAS_KARAKTER_TANYA,
): HasilPemeriksaanInput {
  const norm =
    typeof teksRaw === 'string'
      ? teksRaw
          .normalize('NFKC')
          .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

  const inputBersih = bersihkanInputPengguna(norm, maxLen);
  if (!inputBersih) {
    return { aman: false, kategori: 'kosong', inputBersih: '' };
  }

  const { tanpaPemisah, leetDecoded } = buatVarianDeobfuskasi(norm);
  const kandidatKeamanan = [norm, inputBersih, tanpaPemisah, leetDecoded];

  for (const re of POLA_EXFILTRASI_RAHASIA) {
    if (kandidatKeamanan.some((v) => re.test(v))) {
      return { aman: false, kategori: 'kebocoran-rahasia', inputBersih };
    }
  }

  if (DELIMITER_BERBAHAYA_RE.test(norm) || DELIMITER_BERBAHAYA_RE.test(tanpaPemisah)) {
    DELIMITER_BERBAHAYA_RE.lastIndex = 0;
    return { aman: false, kategori: 'injeksi-prompt', inputBersih };
  }
  DELIMITER_BERBAHAYA_RE.lastIndex = 0;

  for (const re of POLA_INJEKSI_PROMPT) {
    if (kandidatKeamanan.some((v) => re.test(v))) {
      return { aman: false, kategori: 'injeksi-prompt', inputBersih };
    }
  }

  for (const re of POLA_LUAR_TOPIK) {
    if (re.test(norm) || re.test(inputBersih) || re.test(tanpaPemisah)) {
      return { aman: false, kategori: 'luar-topik', inputBersih };
    }
  }

  return { aman: true, kategori: 'aman', inputBersih };
}

/**
 * Menguji apakah input memuat sinyal kuat budaya/tradisi/sejarah Indonesia & Nusantara di luar atau di dalam S1–S7.
 */
export function apakahAdaSinyalArsipS1S7(teks: string): boolean {
  return SINYAL_ARSIP_S1S7_RE.test(teks);
}

export function apakahTopikBudayaIndonesia(teksRaw: string): {
  relevanBudaya: boolean;
  kataKunciTerdeteksi: string[];
} {
  const cek = deteksiSeranganAtauLuarTopik(teksRaw, BATAS_KARAKTER_TANYA);
  if (!cek.aman) {
    return { relevanBudaya: false, kataKunciTerdeteksi: [] };
  }
  const teks = cek.inputBersih;
  const cocokSet = new Set<string>();
  const konsepHits = teks.match(KONSEP_BUDAYA_NUSANTARA_RE) ?? [];
  for (const m of konsepHits) {
    cocokSet.add(m.toLowerCase());
  }
  const wilayahHits = teks.match(WILAYAH_BUDAYA_NUSANTARA_RE) ?? [];
  for (const w of wilayahHits) {
    cocokSet.add(w.toLowerCase());
  }
  const adaArsip = apakahAdaSinyalArsipS1S7(teks);
  // Wajib memiliki konsep budaya/warisan nyata (atau istilah S1–S7), bukan sekadar menyebut nama kota dalam topik umum
  const relevanBudaya = adaArsip || konsepHits.length > 0;
  return {
    relevanBudaya,
    kataKunciTerdeteksi: [...cocokSet].slice(0, 6),
  };
}

/**
 * Mendeteksi sentinel penolakan semantik dari keluaran Gemini 3.8 Live bila lolos penyaringan awal.
 */
export function deteksiTokenPenolakanModel(teks: string): 'injeksi-prompt' | 'luar-topik' | null {
  if (!teks) return null;
  if (TOKEN_TOLAK_KEAMANAN_RE.test(teks)) return 'injeksi-prompt';
  if (TOKEN_LUAR_DOMAIN_RE.test(teks)) return 'luar-topik';
  return null;
}

/**
 * Pesan penolakan standar tanpa menggemakan payload berbahaya milik pengguna.
 */
export function pesanPenolakanKeamanan(
  kategori: Exclude<KategoriKeamananAI, 'aman'>,
  bahasa: BahasaAktif,
): string {
  if (kategori === 'injeksi-prompt' || kategori === 'kebocoran-rahasia') {
    return sesuaikanBahasaAksara(bahasa, {
      id: 'Permintaan ditolak oleh pagar keamanan Pamomong KELIR. Asisten ini berfokus pada kajian warisan budaya Indonesia & arsip S1–S7, serta tidak dapat mengubah instruksi maupun membuka konfigurasi sistem internal.',
      en: 'Request blocked by KELIR Pamomong security guardrails. This assistant is dedicated strictly to Indonesian cultural heritage and S1–S7 archives, and cannot override instructions or disclose internal system details.',
      jw: 'Panyuwunan dipunwatesi dening pager keamanan Pamomong KELIR. Asisten punika namung ngladeni pasinaon kabudayan Nuswantara saha arsip S1–S7, lan boten saged ngowahi aturan utawa mbikak konfigurasi internal.',
    });
  }

  return sesuaikanBahasaAksara(bahasa, {
    id: 'Pertanyaan tersebut berada di luar cakupan budaya & warisan Nusantara terverifikasi. Ajukan topik seputar adat istiadat daerah di Indonesia, tarian/musik tradisional, rumah adat, wastra, aksara daerah, candi/kerajaan, atau koleksi kurasi KELIR S1–S7.',
    en: 'The query lies outside our verified Indonesian cultural heritage and curatorial scope. Please ask about regional arts, traditional architecture, textiles, dances, scripts, history across Indonesia, or KELIR curated collections S1–S7.',
    jw: 'Pitakonan punika dumunung ing njaba cakupan kabudayan saha warisan Nuswantara. Mangga tanglet babagan adat daerah ing Indonesia, tari lan gangsa tradisional, griya adat, wastra, aksara, candhi/karajan, utawa koleksi KELIR S1–S7.',
  });
}

function validasiTeksStudio(
  raw: string,
  maxLen: number,
  defaultVal: string,
  bahasa: BahasaAktif,
  pesanTolak: { id: string; en: string; jw: string },
): HasilValidasiTemaPujangga {
  const cek = deteksiSeranganAtauLuarTopik(raw, maxLen);
  if (cek.kategori === 'kosong') {
    return {
      aman: true,
      kategori: 'aman',
      temaBersih: defaultVal,
    };
  }

  if (!cek.aman) {
    return {
      aman: false,
      kategori: cek.kategori,
      temaBersih: defaultVal,
      pesanKeamanan: sesuaikanBahasaAksara(bahasa, pesanTolak),
    };
  }

  return {
    aman: true,
    kategori: 'aman',
    temaBersih: cek.inputBersih,
  };
}

/**
 * Memvalidasi tema masukan mode Pujangga & Suara agar tetap aman dan bertemakan budaya/refleksi luhur.
 */
export function validasiTemaPujangga(
  temaRaw: string,
  bahasa: BahasaAktif,
): HasilValidasiTemaPujangga {
  return validasiTeksStudio(
    temaRaw,
    BATAS_KARAKTER_PUJANGGA,
    'Harmoni Pendopo & Pusaka',
    bahasa,
    {
      id: 'Tema tidak sesuai pagar budaya KELIR atau mengandung instruksi sistem sehingga dialihkan otomatis ke bait pitutur arsip S1–S7.',
      en: 'The submitted theme fell outside KELIR cultural safety rules and was safely redirected to verified S1–S7 archival verse.',
      jw: 'Tema boten trep kalih pager budaya KELIR mula dipunpindhah kanthi aman dhumateng gurit pitutur arsip S1–S7.',
    },
  );
}

/**
 * Memvalidasi frasa masukan mode Pemandu Tata Krama & Aksara Jawa AI.
 */
export function validasiInputKrama(
  frasaRaw: string,
  bahasa: BahasaAktif,
): HasilValidasiTemaPujangga {
  return validasiTeksStudio(
    frasaRaw,
    BATAS_KARAKTER_KRAMA,
    'Permisi, saya ingin belajar tata krama dan gamelan pendopo',
    bahasa,
    {
      id: 'Frasa ditolak oleh pagar keamanan KELIR atau berada di luar konteks tata krama budaya sehingga dialihkan ke contoh ungkapan arsip S5–S7.',
      en: 'The phrase violated KELIR cultural safety rules and was safely switched to an archival Javanese etiquette greeting (S5–S7).',
      jw: 'Ukara dipuntolak pager keamanan KELIR lan dipunpindhah dhumateng tuladha unggah-ungguh arsip S5–S7.',
    },
  );
}

/**
 * Memvalidasi catatan minat opsional untuk Perencana Rute Tur Spasial AI.
 */
export function validasiCatatanTur(
  catatanRaw: string,
  bahasa: BahasaAktif,
): HasilValidasiTemaPujangga {
  return validasiTeksStudio(catatanRaw, BATAS_KARAKTER_TUR, '', bahasa, {
    id: 'Catatan rute tidak sesuai ranah budaya KELIR S1–S7 sehingga disetel otomatis ke profil kurasi standar.',
    en: 'The tour note fell outside KELIR cultural safety rules and was safely reset to standard archival routing.',
    jw: 'Cathetan rute boten trep kalih pager budaya S1–S7 lan dipunwangsulaken dhumateng rute baku.',
  });
}

/**
 * Memastikan teks keluaran masih berjangkar pada khazanah budaya KELIR / pustaka S1-S7.
 */
export function memilikiJangkarBudaya(teks: string): boolean {
  return JANGKAR_BUDAYA_OUTPUT_RE.test(teks) || /[\uA980-\uA9DF]/.test(teks);
}

/**
 * Mendeteksi kebocoran kunci API, echo instruksi sistem, blok kode, atau URL halusinasi dalam output LLM.
 */
export function terindikasiKebocoranAtauHalusinasi(teks: string): boolean {
  if (!teks) return true;
  return KEBOCORAN_OUTPUT_RE.some((re) => re.test(teks));
}

/**
 * Mengaudit dan membersihkan teks keluaran AI sebelum ditampilkan atau disimpan ke cache.
 * Mengembalikan null bila output terdeteksi bocor, melenceng dari budaya, atau tidak jelas.
 */
export function auditDanBersihkanOutputAI(
  teksRaw: string,
  opts: OpsiAuditOutput = {},
): string | null {
  if (typeof teksRaw !== 'string') return null;
  const minKarakter = opts.minKarakter ?? 18;
  const maxKarakter = opts.maxKarakter ?? BATAS_KARAKTER_OUTPUT_AI;
  const wajibJangkarBudaya = opts.wajibJangkarBudaya ?? true;

  const trimmed = teksRaw
    .normalize('NFKC')
    .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\u2014/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (trimmed.length < minKarakter || trimmed.length > maxKarakter) {
    return null;
  }

  if (terindikasiKebocoranAtauHalusinasi(trimmed)) {
    return null;
  }

  if (wajibJangkarBudaya && !memilikiJangkarBudaya(trimmed)) {
    return null;
  }

  return trimmed;
}

const riwayatLaju = new Map<string, number[]>();

/**
 * Pembatas laju geser sederhana per sumber permintaan pada endpoint HTTP (/api/tanya, /api/ai-studio).
 */
export function periksaBatasLajuAI(
  kunci: string,
  maksPerMenit = 60,
): { diizinkan: boolean; sisa: number } {
  const sekarang = Date.now();
  const jendelaMs = 60_000;
  const daftar = (riwayatLaju.get(kunci) ?? []).filter((t) => sekarang - t < jendelaMs);
  if (daftar.length >= maksPerMenit) {
    riwayatLaju.set(kunci, daftar);
    return { diizinkan: false, sisa: 0 };
  }
  daftar.push(sekarang);
  riwayatLaju.set(kunci, daftar);
  if (riwayatLaju.size > 500) {
    const oldest = riwayatLaju.keys().next().value;
    if (oldest !== undefined) riwayatLaju.delete(oldest);
  }
  return { diizinkan: true, sisa: Math.max(0, maksPerMenit - daftar.length) };
}
