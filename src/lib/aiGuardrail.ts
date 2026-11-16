import type { BahasaAktif } from '../content/pusaka.ts';
import { konversiTeksKeAksaraAman } from './aksara.ts';

export const BATAS_KARAKTER_TANYA = 280;
export const BATAS_KARAKTER_PUJANGGA = 120;
export const BATAS_KARAKTER_KRAMA = 140;
export const BATAS_KARAKTER_TUR = 100;
export const BATAS_KARAKTER_OUTPUT_AI = 1100;

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
  /<\s*\/?\s*(?:system|developer|assistant|tool|function|prompt|instructions?|pertanyaan_pengguna|bukti_arsip_s1_s7|instruksi_kurasi|script|iframe|svg)\b|<<\s*sys\s*>>|\[\s*\/?\s*inst\s*\]|###\s*(?:system|instruction|developer|assistant|human)\s*:/gi;

const POLA_INJEKSI_PROMPT: RegExp[] = [
  /\bignore\s+(?:all\s+|the\s+|any\s+|previous\s+|prior\s+|above\s+){1,3}(?:instructions?|rules?|prompts?|constraints?|system|guidelines?)\b/i,
  /\babaikan\s+(?:semua\s+|seluruh\s+)?(?:instruksi|aturan|perintah|panduan|sistem|larangan)\b/i,
  /\blupakan\s+(?:semua\s+|seluruh\s+)?(?:instruksi|aturan|peran|konteks)\b/i,
  /\bforget\s+(?:all\s+|your\s+|previous\s+|prior\s+)*(?:instructions?|rules?|constraints?|persona)\b/i,
  /\boverride\s+(?:system|rules?|instructions?|guardrails?|safety|filters?)\b/i,
  /\b(?:bypass|circumvent|disable|matikan|lewati)\s+(?:guardrails?|safety|filter|keamanan|batas|aturan)\b/i,
  /\b(?:jailbreak|dan\s+mode|developer\s+mode|god\s+mode|unfiltered\s+mode|mode\s+tanpa\s+batas)\b/i,
  /\b(?:act\s+as|pretend\s+(?:you\s+are|to\s+be)|bertindak(?:lah)?\s+sebagai|berpura-pura(?:lah)?\s+(?:jadi|sebagai)|roleplay\s+as|you\s+are\s+now)\s+(?:an?\s+|seorang\s+)?(?:developer|admin|hacker|unfiltered|uncensored|chatgpt|gpt|python|coder|programmer|terminal|linux|bot\s+bebas|ai\s+tanpa\s+batas)\b/i,
  /\b(?:system|developer|hidden|secret|internal)\s+prompt\b/i,
  /\binstruksi\s+(?:sistem|system|developer|rahasia|asli)\b/i,
  /<\s*script\b|javascript:|onerror\s*=|onload\s*=|\bunion\s+select\b|\bdrop\s+table\b/i,
];

const POLA_EXFILTRASI_RAHASIA: RegExp[] = [
  /\b(?:api[_\s-]?key|gemini[_\s-]?api[_\s-]?key|secret[_\s-]?key|access[_\s-]?token|private[_\s-]?key|process\.env|\.env(?:\.local)?|environment\s+variables?|variabel\s+lingkungan|kunci\s+api|source\s+code|kode\s+backend|file\s+\.env)\b/i,
  /\b(?:reveal|show|print|dump|leak|output|display|repeat|echo|tampilkan|sebutkan|bocorkan|cetak|tulis\s+ulang|berikan)\b.{0,36}\b(?:system\s+prompt|system\s+instruction|hidden\s+prompt|prompt\s+asli|instruksi\s+asli|konfigurasi|rahasia|credentials?|password|token|env|api\s*key)\b/i,
  /AIza[0-9A-Za-z_-]{12,}/,
  /\b(?:sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,})\b/,
];

const POLA_LUAR_TOPIK: RegExp[] = [
  // Pemrograman, skrip, & keamanan siber
  /\b(?:python|javascript|typescript|svelte|react|nextjs|nodejs|php|golang|rust|c\+\+|html|css|sql|mysql|postgres|mongodb|docker|kubernetes|bash\s+script|powershell|regex|algoritma\s+sorting|leetcode|github\s+action|coding|debug\s+code|exploit|malware|ransomware|phishing|ddos|brute\s*force)\b/i,
  /\b(?:buatkan|tulis|bikin|generate|write)\s+(?:satu\s+|sebuah\s+)?(?:kode|coding|script|program|aplikasi|website|api|bot|query\s+sql|rumus\s+excel|fungsi)\b/i,
  // Kripto, saham, & judi
  /\b(?:bitcoin|btc|ethereum|eth|solana|crypto|cryptocurrency|kripto|blockchain|nft|binance|forex|trading\s+saham|saham|stock\s+market|indeks\s+saham|nasdaq|ihsg|reksadana|pinjol|slot\s+gacor|judi\s+online|judol|togel|casino|taruhan)\b/i,
  // Politik modern, olahraga, gadget, medis, resep, tugas sekolah umum
  /\b(?:pemilu|pilpres|kampanye|partai\s+politik|presiden\s+(?:amerika|as|usa|prancis|rusia|indonesia)|skor\s+bola|liga\s+inggris|champions\s+league|piala\s+dunia|sepak\s+bola|messi|ronaldo|harga\s+(?:iphone|samsung|laptop|rtx|bbm|bitcoin)|diagnosa\s+penyakit|resep\s+(?:masak|nasi\s+goreng|kue|rendang|seblak)|dosis\s+obat|obat\s+(?:demam|batuk|kanker|diabetes)|ramalan\s+(?:cuaca|zodiak)|kerjakan\s+(?:pr|tugas\s+matematika|soal\s+kalkulus)|hitung\s+integral|lirik\s+lagu\s+(?:pop|kpop|rock|dangdut)|translate\s+to\s+(?:french|spanish|korean|japanese)|terjemahkan\s+ke\s+bahasa\s+(?:korea|jepang|arab|prancis))\b/i,
  // Fragmen sintaks kode eksplisit
  /(?:[{};]{2,}|=>|\bdef\s+\w+\s*\(|\bfunction\s+\w+\s*\(|\bconsole\.log\(|\bimport\s+\w+\s+from\b)/,
];

const JANGKAR_BUDAYA_OUTPUT_RE =
  /\b(?:S[1-7]|keris|dhuwung|pamor|luk|pendok|warangka|gamelan|saron|slendro|pelog|laras|wilah|peking|gong|kenong|batik|kawung|canting|soga|malam|wastra|joglo|pendopo|pendhapa|sakaguru|umpak|tumpang|wayang|kelir|blencong|dalang|dhalang|pakeliran|cempurit|tuding|tatahan|sunggingan|rama|sinta|rahwana|kijang|kidang|hanacaraka|aksara|carakan|nglegena|pasangan|sandhangan|jawa|jawi|javanese|nusantara|nuswantara|karaton|keraton|mataram|unesco|sonobudoyo|pusaka|budaya|filosofi|piwulang|pitutur|memayu|sangkan|eling|waspada|budi|luhur|karawitan|gending|gendhing|tembang|pathet|heritage|shadow|bronze|blade|architecture|wooden|copper|script|unicode|a980|ati|manah|rahayu|tentrem)\b/i;

const KEBOCORAN_OUTPUT_RE: RegExp[] = [
  /AIza[0-9A-Za-z_-]{12,}/,
  /\b(?:GEMINI_API_KEY|KELIR_DISABLE_LIVE_GEMINI|process\.env|Bearer\s+[A-Za-z0-9._-]{10,}|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,})\b/i,
  /<\s*\/?\s*(?:system|developer|assistant|pertanyaan_pengguna|bukti_arsip_s1_s7|instruksi_kurasi|script)\b/i,
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
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/```+/g, ' ')
    .replace(DELIMITER_BERBAHAYA_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/**
 * Memeriksa input pengguna terhadap injeksi prompt, upaya exfiltrasi rahasia,
 * maupun topik di luar ranah budaya KELIR S1-S7 (termasuk serangan piggyback).
 */
export function deteksiSeranganAtauLuarTopik(
  teksRaw: string,
  maxLen = BATAS_KARAKTER_TANYA,
): HasilPemeriksaanInput {
  const norm =
    typeof teksRaw === 'string'
      ? teksRaw
          .normalize('NFKC')
          .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

  const inputBersih = bersihkanInputPengguna(norm, maxLen);
  if (!inputBersih) {
    return { aman: false, kategori: 'kosong', inputBersih: '' };
  }

  for (const re of POLA_EXFILTRASI_RAHASIA) {
    if (re.test(norm) || re.test(inputBersih)) {
      return { aman: false, kategori: 'kebocoran-rahasia', inputBersih };
    }
  }

  if (DELIMITER_BERBAHAYA_RE.test(norm)) {
    DELIMITER_BERBAHAYA_RE.lastIndex = 0;
    return { aman: false, kategori: 'injeksi-prompt', inputBersih };
  }
  DELIMITER_BERBAHAYA_RE.lastIndex = 0;

  for (const re of POLA_INJEKSI_PROMPT) {
    if (re.test(norm) || re.test(inputBersih)) {
      return { aman: false, kategori: 'injeksi-prompt', inputBersih };
    }
  }

  for (const re of POLA_LUAR_TOPIK) {
    if (re.test(norm) || re.test(inputBersih)) {
      return { aman: false, kategori: 'luar-topik', inputBersih };
    }
  }

  return { aman: true, kategori: 'aman', inputBersih };
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
      id: 'Permintaan ditolak oleh pagar keamanan Pamomong KELIR. Asisten ini hanya melayani kajian budaya Nusantara berbasis arsip S1–S7 dan tidak dapat mengubah instruksi maupun membuka konfigurasi internal.',
      en: 'Request blocked by KELIR Pamomong security guardrails. This assistant operates strictly within verified S1–S7 Nusantara heritage archives and cannot override instructions or disclose internal system details.',
      jw: 'Panyuwunan dipunwatesi dening pager keamanan Pamomong KELIR. Asisten punika namung ngladeni pasinaon kabudayan Nuswantara arsip S1–S7 lan boten saged ngowahi aturan utawa mbikak konfigurasi internal.',
    });
  }

  return sesuaikanBahasaAksara(bahasa, {
    id: 'Pertanyaan tersebut berada di luar cakupan korpus budaya terverifikasi S1–S7. Untuk menjaga akurasi tanpa halusinasi, ajukan topik khusus seputar Keris Mataram, Gamelan Saron Slendro, Batik Kawung, Pendopo Joglo, Lakon Wayang Kulit, atau Aksara Hanacaraka.',
    en: 'The query lies outside our verified S1–S7 curatorial corpus. To preserve strict zero-hallucination accuracy, ask specifically about the Keris blade, Saron Slendro gamelan, Batik Kawung, Joglo architecture, Shadow Puppetry, or the Hanacaraka script.',
    jw: 'Pitakonan punika dumunung ing njaba cakupan korpus budaya S1–S7. Kangge njagi leresipun katrangan tanpa pangira-ira, mangga tanglet babagan Dhuwung, Saron Slendro, Batik Kawung, Pendhapa Joglo, Pakeliran Wayang, utawa Aksara Hanacaraka.',
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
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
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
