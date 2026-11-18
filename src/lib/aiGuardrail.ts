import type { BahasaAktif } from '../content/pusaka.ts';
import { konversiTeksKeAksaraAman } from './aksara.ts';

export const BATAS_KARAKTER_TANYA = 320;
export const BATAS_KARAKTER_PUJANGGA = 140;
export const BATAS_KARAKTER_KRAMA = 160;
export const BATAS_KARAKTER_TUR = 120;
export const BATAS_KARAKTER_OUTPUT_AI = 4200;

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

const DELIMITER_PAT_SRC =
  '<\\s*\\/?\\s*(?:system|developer|assistant|tool|function|prompt|instructions?|pertanyaan_pengguna|bukti_arsip_s1_s7|referensi_nusantara|unsur_anatomi_3d|instruksi_kurasi|spesimen_terkurasi|tema_budaya|frasa_pengguna|daftar_titik|preferensi_pengguna|script|iframe|svg)\\b|<<\\s*sys\\s*>>|\\[\\s*\\/?\\s*inst\\s*\\]|###\\s*(?:system|instruction|developer|assistant|human)\\s*:';
const DELIMITER_BERBAHAYA_RE = new RegExp(DELIMITER_PAT_SRC, 'gi');
const DELIMITER_BERBAHAYA_TEST_RE = new RegExp(DELIMITER_PAT_SRC, 'i');

const HOMOGLYPH_MAP: Record<string, string> = {
  '\u0430': 'a', '\u0410': 'a',
  '\u0435': 'e', '\u0415': 'e',
  '\u0456': 'i', '\u0406': 'i',
  '\u043E': 'o', '\u041E': 'o',
  '\u0440': 'p', '\u0420': 'p',
  '\u0441': 'c', '\u0421': 'c',
  '\u0443': 'y', '\u0423': 'y',
  '\u0445': 'x', '\u0425': 'x',
  '\u043A': 'k', '\u041A': 'k',
  '\u043D': 'h', '\u041D': 'h',
  '\u043C': 'm', '\u041C': 'm',
  '\u0442': 't', '\u0422': 't',
  '\u0432': 'b', '\u0412': 'b',
  '\u03B1': 'a', '\u03B5': 'e',
  '\u03B9': 'i', '\u03BF': 'o',
  '\u03C1': 'p', '\u03C4': 't',
};

function normalisasiHomoglyph(teks: string): string {
  return teks.replace(/[\u0370-\u04FF]/g, (ch) => HOMOGLYPH_MAP[ch] ?? ch);
}

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
  /\b(?:pemilu|pilpres|pilkada|kampanye|partai\s+politik|gubernur|bupati|walikota|dpr\s+ri|presiden\s+(?:amerika|as|usa|prancis|rusia|indonesia)|skor\s+(?:bola|pertandingan)|liga\s+inggris|champions\s+league|piala\s+dunia|sepak\s+bola|messi|ronaldo|harga\s+(?:iphone|samsung|laptop|rtx|bbm|bitcoin|tiket|emas)|jadwal\s+(?:pesawat|kereta|penerbangan|krl|sholat)|cek\s+resi|lowongan\s+kerja|cpns|download\s+(?:film|lagu|apk)|cheat\s+game|diagnosa\s+penyakit|resep\s+(?:masak|masakan|nasi\s+goreng|kue|rendang|seblak|bumbu)|dosis\s+obat|obat\s+(?:demam|batuk|kanker|diabetes)|ramalan\s+(?:cuaca|zodiak|bintang)|prediksi\s+cuaca|zodiak|tarot|horoskop|kalori\s+\w+|penemu\s+(?:mesin\s+uap|bola\s+lampu|televisi|pesawat\s+terbang)|modern\s+steam\s+turbine|steam\s+engine\s+inventor|kerjakan\s+(?:pr|tugas\s+matematika|soal\s+kalkulus)|hitung\s+integral|rumus\s+(?:luas|volume|fisika|kimia)|lirik\s+lagu\s+(?:pop|kpop|rock|dangdut)|translate\s+to\s+(?:french|spanish|korean|japanese)|terjemahkan\s+ke\s+bahasa\s+(?:korea|jepang|arab|prancis))\b/i,
  // Fragmen sintaks kode eksplisit
  /(?:[{};]{2,}|=>|\bdef\s+\w+\s*\(|\bfunction\s+\w+\s*\(|\bconsole\.log\(|\bimport\s+\w+\s+from\b|\beval\s*\(|child_process)/,
];

const SINYAL_ARSIP_S1S7_RE =
  /\b(?:S[1-7]|keris|dhuwung|pamor|luk\s*(?:5|lima|gangsal|\d+)?|pendok|warangka|pesi|ganja|wilah|empu|gamelan|saron|slendro|pelog|laras|peking|pijetan|demung|batik\s+kawung|kawung|canting|soga|malam|nglorod|joglo|pendopo|pendhapa|sakaguru|saka\s*guru|umpak|tumpang\s*sari|purus|wayang\s+kulit|ringgit\s+wacucal|kelir|blencong|dalang|dhalang|pakeliran|cempurit|tuding|tatahan|sunggingan|kijang\s+kencana|kidang|aranya\s*kanda|ramayana|hanacaraka|carakan|nglegena|pasangan|sandhangan|a980|sangkan|paraning|dumadi|memayu|hayuning|bawana|sonobudoyo|perpusnas)\b/i;

const KONSEP_BUDAYA_NUSANTARA_RE =
  /\b(?:budaya|kebudayaan|adat|istiadat|tradisi|tradisional|kearifan(?:\s+lokal)?|warisan|pusaka|kesenian|seni|tari|tarian|musik|instrumen|alat\s+musik|rumah\s+adat|arsitektur|pakaian\s+adat|baju\s+adat|busana|wastra|tenun|ikat|songket|ulos|tapis|sasirangan|gringsing|endek|lurik|jumputan|batik|kriya|ukiran|pahatan|anyaman|noken|senjata\s+tradisional|rencong|kujang|mandau|badik|celurit|tombak|sumpit|aksara|lontara|kaganga|kawi|pallawa|bahasa\s+daerah|sastra|pantun|gurindam|syair|macapat|tembang|hikayat|babad|kakawin|epos|legenda|mitologi|cerita\s+rakyat|folklore|candi|prasasti|kerajaan|kesultanan|keraton|kraton|kedaton|istana|puri|pura|benteng|monumen|tugu|museum|cagar\s+budaya|situs(?:\s+(?:sejarah|budaya|purbakala|arkeologi))?|tempat\s+bersejarah|destinasi\s+(?:budaya|wisata\s+(?:sejarah|budaya))|desa\s+adat|kampung\s+(?:adat|wisata|batik)|pesanggrahan|bangsal|regol|gapura|panggung\s+krapyak|sumbu\s+filosofis|alun[\s-]*alun|taman\s*sari|tamansari|sumur\s+gumuling|pulo\s+kenongo|umbul\s+binangun|pasiraman|gedong\s+kenongo|urung[\s-]*urung|mangkunegaran|pakualaman|kasunanan|kasepuhan|kanoman|kacirebonan|maimun|pagaruyung|siak|sam\s+poo\s+kong|lawang\s+sewu|kota\s+lama|kota\s+tua|gedung\s+sate|monas|tugu\s+(?:jogja|yogyakarta|pahlawan|khatulistiwa)|taman\s+mini|tmii|vredeburg|vredenbrug|rotterdam|fort\s+rotterdam|belgica|nassau|duurstede|oranje|marlborough|speelwijk|banda\s+neira|jam\s+gadang|masjid\s+(?:agung|raya|menara\s+kudus|demak|baiturrahman)|menara\s+kudus|klenteng|vihara|wihara|punden|menhir|dolmen|sarkofagus|petilasan|makam\s+(?:raja|imogiri|wali)|imogiri|kotagede|kota\s+gede|malioboro|laweyan|kauman|trusmi|prambanan|sewu|mendut|pawon|plaosan|sojiwan|kalasan|sambisari|ratu\s+boko|ijo|sukuh|cetho|dieng|gedong\s+songo|penataran|jago|kidal|brahu|tikus|bajang\s+ratu|muara\s+takus|bahal|gunung\s+padang|sangiran|trinil|penglipuran|tenganan|besakih|tanah\s+lot|uluwatu|ulun\s+danu|tirta\s+empul|tampaksiring|goa\s+gajah|kampung\s+naga|ciptagelar|cireundeu|sade|bena|ke['’]?te\s+kesu|kete\s+kesu|londa|lemo|huta\s+siallagan|tomok|upacara|ritual|sesaji|kuliner\s+tradisional|tumpeng|rendang|papeda|gudeg|pempek|rawon|soto|bika\s+ambon|jamu|pencak\s+silat|subak|pinisi|phinsi|fahombo|hombo|lompat\s+batu|ngaben|rambu\s+solo|sekaten|grebeg|nyadran|kasada|tabuik|tiwah|seren\s+taun|peusijuek|bakar\s+batu|barapen|mitoni|tedhak\s+siten|selamatan|nyepi|ogoh-ogoh|galungan|kuningan|ondel-ondel|debus|dabus|zapin|wae\s+rebo|mbaru\s+niang|dalihan\s+na\s+tolu|tri\s+hita(?:\s+karana)?|siri['’]?\s*(?:na\s+pacce)?|pacce|mapalus|sasi|pela\s+gandong|piil\s+pesenggiri|huma\s+betang|pikukuh|karuhun|baju\s+bodo|kebaya|blangkon|udeng|gotong\s+royong|bhinneka(?:\s+tunggal\s+ika)?|sutasoma|nagarakretagama|pararaton|la\s+galigo|sumpah\s+palapa|sumpah\s+pemuda|gajah\s+mada|hayam\s+wuruk|hamengkubuwono|pakubuwono|sultan\s+agung|senopati|diponegoro|kartini|hasanuddin|pattimura|cut\s+nyak\s+dien|imam\s+bonjol|sisingamangaraja|mulawarman|purnawarman|ken\s+arok|airlangga|wali\s+songo|walisongo|borobudur|muaro\s+jambi|trowulan|majapahit|sriwijaya|singasari|pajajaran|demak|mataram|kutai|tarumanagara|samudera\s+pasai|gowa|tallo|ternate|tidore|saman|seudati|pendet|kecak|barong|legong|piring|randai|jaipong|merak|reog|ponorogo|jathilan|ebeg|sintren|lengger|ludruk|ketoprak|lenong|golek|topeng|beksan|serimpi|bedhaya|gandrung|hudoq|hudog|tor-?tor|cakalele|yospan|maengket|kabasaran|caci|likurai|karapan\s+sapi|pacu\s+jalur|sisingaan|trunyan|bau\s+nyale|peresean|angklung|calung|kecapi|suling|degung|gambang\s+kromong|sasando|kolintang|tifa|talempong|saluang|gondang|sampek|sape|gendang|kendhang|bonang|gong|rumah\s+gadang|gadang|rangkiang|tongkonan|alang|passura|honai|bolon|betang|lamin|omo\s+sebua|baileo|limas|mega\s+mendung|sekar\s+jagad|suku|etnis|etnik|filosofi|makna|sejarah|asal-usul|nusantara|nuswantara|indonesia|unesco|karawitan|gending|gendhing|pathet|culture|cultural|heritage|traditional|indigenous|ethnic|tribe|dance|music|instrument|architecture|temple|palace|fortress|monument|kingdom|textile|weaving|script|ceremony|ritual|folklore|archipelago|indonesian)\b/gi;

const WILAYAH_BUDAYA_NUSANTARA_RE =
  /\b(?:indonesia|nusantara|aceh|sabang|gayo|alas|sumatera|sumatra|medan|deli|batak|karo|toba|samosir|mandailing|nias|minang|minangkabau|padang|pariaman|bukittinggi|batusangkar|payakumbuh|melayu|riau|siak|kampar|pekanbaru|bintan|jambi|palembang|bengkulu|rejang|lampung|banten|baduy|serang|lebak|jakarta|batavia|betawi|sunda|bandung|bogor|cianjur|garut|tasikmalaya|cirebon|indramayu|jawa|yogyakarta|jogjakarta|jogja|sleman|bantul|kulon\s+progo|gunungkidul|surakarta|solo|magelang|klaten|semarang|kudus|demak|jepara|surabaya|malang|mojokerto|kediri|blitar|banyumas|banyuwangi|pekalongan|tengger|oseng|madura|bali|denpasar|ubud|gianyar|bangli|karangasem|tabanan|badung|klungkung|buleleng|sasak|lombok|sumbawa|bima|komodo|sumba|waingapu|flores|labuan\s+bajo|manggarai|rote|savu|sabu|alor|timor|kupang|ntb|ntt|kalimantan|borneo|pontianak|dayak|iban|ngaju|kenyah|banjar|banjarmasin|martapura|kutai|tenggarong|samarinda|palangkaraya|sulawesi|bugis|makassar|gowa|bulukumba|toraja|mandar|minahasa|manado|tomohon|gorontalo|kaili|palu|buton|baubau|kendari|maluku|ambon|tanimbar|kei|aru|halmahera|seram|buru|saparua|banda|ternate|tidore|papua|asmat|dani|kamoro|sentani|biak|yapen|mimika|merauke|wamena|sorong|manokwari|baliem|bajo|raja\s+ampat)\b/gi;

const KATA_TANYA_LOKASI_BUDAYA_RE =
  /\b(?:dimana|di\s+mana|letak|terletak|lokasi|berada|daerah\s+mana|kota\s+mana|provinsi\s+mana|pulau\s+mana|ada\s+apa(?:\s+saja)?|apa\s+saja|berisi\s+apa|bagian|kompleks|sejarah|asal[\s-]*usul|keunikan|keistimewaan|ceritakan|jelaskan|kenapa|mengapa|apa\s+itu|khas|peninggalan|tradisi|adat|budaya|where\s+is|located|what\s+is\s+(?:inside|in|at|there)|landmarks?|features?|history|wonten\s+pundi|menapa\s+kemawon)\b/i;

const JANGKAR_BUDAYA_OUTPUT_RE =
  /\b(?:S[1-7]|keris|dhuwung|pamor|luk|pendok|warangka|gamelan|saron|slendro|pelog|laras|wilah|peking|gong|kenong|bonang|batik|kawung|canting|soga|malam|wastra|joglo|pendopo|pendhapa|sakaguru|umpak|tumpang|wayang|kelir|blencong|dalang|dhalang|pakeliran|cempurit|tuding|tatahan|sunggingan|rama|sinta|rahwana|kijang|kidang|hanacaraka|aksara|carakan|nglegena|pasangan|sandhangan|jawa|jawi|javanese|nusantara|nuswantara|indonesia|indonesian|archipelago|karaton|keraton|kraton|kedaton|istana|benteng|monumen|tugu|museum|cagar|situs|pesanggrahan|bangsal|regol|gapura|panggung|sumur|umbul|pemandian|kolam|kompleks|taman\s*sari|tamansari|sumur\s+gumuling|pulo\s+kenongo|sumbu\s+filosofis|kotagede|imogiri|malioboro|laweyan|penglipuran|kampung\s+naga|jam\s+gadang|lawang\s+sewu|sam\s+poo\s+kong|kota\s+lama|kota\s+tua|gedung\s+sate|monas|maimun|pagaruyung|siak|vredeburg|rotterdam|belgica|banda\s+neira|samosir|danau\s+toba|gunung\s+padang|sangiran|dieng|gedong\s+songo|ratu\s+boko|sewu|mendut|mataram|unesco|sonobudoyo|pusaka|budaya|kebudayaan|adat|tradisi|tradisional|filosofi|piwulang|pitutur|memayu|sangkan|eling|waspada|budi|luhur|karawitan|gending|gendhing|tembang|pathet|tari|tarian|musik|instrumen|rumah\s+adat|arsitektur|pakaian\s+adat|senjata|candi|pura|masjid|kerajaan|kesultanan|sultan|raja|upacara|ritual|kearifan|suku|etnis|warisan|sejarah|lokasi|terletak|provinsi|kabupaten|kecamatan|kelurahan|kota|desa|pulau|kriya|tenun|ikat|songket|ulos|tapis|sasirangan|gringsing|endek|noken|rencong|kujang|mandau|badik|angklung|sasando|kolintang|tifa|talempong|saluang|gondang|sampek|sape|degung|saman|seudati|pendet|kecak|barong|jaipong|piring|randai|reog|jathilan|ebeg|sintren|tortor|tor-tor|cakalele|yospan|maengket|kabasaran|caci|hudoq|gadang|rangkiang|tongkonan|honai|bolon|betang|lamin|baileo|limas|wae\s+rebo|mbaru\s+niang|subak|pinisi|phinsi|ngaben|nyepi|ogoh-ogoh|fahombo|tabuik|tiwah|bau\s+nyale|barapen|bakar\s+batu|borobudur|prambanan|majapahit|sriwijaya|singasari|pajajaran|kutai|trowulan|lontara|kaganga|kawi|pallawa|sunda|cirebon|aceh|gayo|batak|nias|minang|minangkabau|melayu|lampung|betawi|baduy|madura|bali|lombok|sasak|sumba|flores|rote|dayak|banjar|bugis|makassar|toraja|minahasa|maluku|papua|asmat|dani|yogyakarta|jogja|surakarta|solo|semarang|bandung|jakarta|surabaya|medan|padang|palembang|makassar|manado|ambon|jayapura|ternate|tidore|bhinneka|sutasoma|gotong\s+royong|pencak\s+silat|tumpeng|rendang|papeda|gudeg|rawon|pempek|jamu|sasi|pela\s+gandong|mapalus|tri\s+hita|siri|pacce|dalihan\s+na\s+tolu|piil\s+pesenggiri|huma\s+betang|heritage|shadow|bronze|blade|architecture|wooden|copper|script|unicode|a980|cultural|culture|dance|folklore|indigenous|ethnic|ritual|ceremony|kingdom|temple|palace|fortress|monument|museum|historic|province|landmark|textile|weaving|ati|manah|rahayu|tentrem)\b/i;

const TOKEN_TOLAK_KEAMANAN_RE = /\[\s*TOLAK_KEAMANAN\s*\]/i;
const TOKEN_LUAR_DOMAIN_RE = /\[\s*LUAR_DOMAIN_BUDAYA\s*\]/i;

const KEBOCORAN_OUTPUT_RE: RegExp[] = [
  /AIza[0-9A-Za-z_-]{12,}/,
  /\b(?:GEMINI_API_KEY|KELIR_DISABLE_LIVE_GEMINI|process\.env|Bearer\s+[A-Za-z0-9._-]{10,}|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/i,
  /\bgemini(?:[-._\s]*\d+(?:\.\d+)?|\s+(?:live|flash|pro|ultra|api))\b/i,
  /\b(?:google\s+ai\s+studio|vertex\s*ai|generative\s+ai\s+sdk|chatgpt|openai)\b/i,
  /<\s*\/?\s*(?:system|developer|assistant|pertanyaan_pengguna|bukti_arsip_s1_s7|referensi_nusantara|unsur_anatomi_3d|instruksi_kurasi|spesimen_terkurasi|tema_budaya|frasa_pengguna|daftar_titik|preferensi_pengguna|script)\b/i,
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
  for (let pass = 0; pass < 3 && /%[0-9a-f]{2}/i.test(decoded); pass++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  const tanpaCombining = normalisasiHomoglyph(
    decoded
      .replace(/\p{M}/gu, '')
      .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, ''),
  );

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

  const homoNorm = normalisasiHomoglyph(norm);
  const { tanpaPemisah, leetDecoded } = buatVarianDeobfuskasi(norm);
  const kandidatKeamanan = [norm, homoNorm, inputBersih, tanpaPemisah, leetDecoded];

  for (const re of POLA_EXFILTRASI_RAHASIA) {
    if (kandidatKeamanan.some((v) => re.test(v))) {
      return { aman: false, kategori: 'kebocoran-rahasia', inputBersih };
    }
  }

  if (DELIMITER_BERBAHAYA_TEST_RE.test(norm) || DELIMITER_BERBAHAYA_TEST_RE.test(tanpaPemisah)) {
    return { aman: false, kategori: 'injeksi-prompt', inputBersih };
  }

  for (const re of POLA_INJEKSI_PROMPT) {
    if (kandidatKeamanan.some((v) => re.test(v))) {
      return { aman: false, kategori: 'injeksi-prompt', inputBersih };
    }
  }

  for (const re of POLA_LUAR_TOPIK) {
    if (re.test(norm) || re.test(homoNorm) || re.test(inputBersih) || re.test(tanpaPemisah)) {
      return { aman: false, kategori: 'luar-topik', inputBersih };
    }
  }

  return { aman: true, kategori: 'aman', inputBersih };
}

/**
 * Memeriksa dan membersihkan konteksUnsur bebas dari klien agar tidak menjadi vektor prompt injection.
 */
export function sanitasiKonteksUnsurAman(raw: unknown): {
  judulUnsur?: string;
  material?: string;
  fungsiTeknis?: string;
  ringkasan?: string;
} | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const src = raw as Record<string, unknown>;
  const ambilFieldAman = (val: unknown, maxLen: number): string | undefined => {
    if (typeof val !== 'string') return undefined;
    const cek = deteksiSeranganAtauLuarTopik(val, maxLen);
    if (!cek.aman) return undefined;
    return cek.inputBersih;
  };
  const judulUnsur = ambilFieldAman(src.judulUnsur, 120);
  const material = ambilFieldAman(src.material, 180);
  const fungsiTeknis = ambilFieldAman(src.fungsiTeknis, 200);
  const ringkasan = ambilFieldAman(src.ringkasan, 220);
  if (!judulUnsur && !material && !fungsiTeknis && !ringkasan) return undefined;
  return { judulUnsur, material, fungsiTeknis, ringkasan };
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
  const intentLokasiBudaya = wilayahHits.length > 0 && KATA_TANYA_LOKASI_BUDAYA_RE.test(teks);
  // Lolos bila memuat sinyal S1-S7, konsep budaya/situs bersejarah Indonesia, atau pertanyaan lokasi/sejarah di wilayah Nusantara yang aman
  const relevanBudaya = adaArsip || konsepHits.length > 0 || intentLokasiBudaya;
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
    id: 'Pertanyaan tersebut berada di luar cakupan budaya & warisan Nusantara terverifikasi. Ajukan topik seputar lokasi cagar budaya dan situs bersejarah di Indonesia, adat istiadat daerah, tarian/musik tradisional, rumah adat, wastra, aksara daerah, kerajaan, atau koleksi kurasi KELIR S1–S7.',
    en: 'The query lies outside our verified Indonesian cultural heritage and curatorial scope. Please ask about Indonesian historic sites and landmarks, regional arts, traditional architecture, textiles, dances, scripts, history, or KELIR curated collections S1–S7.',
    jw: 'Pitakonan punika dumunung ing njaba cakupan kabudayan saha warisan Nuswantara. Mangga tanglet babagan situs cagar budaya ing Indonesia, adat daerah, tari lan gangsa tradisional, griya adat, wastra, aksara, karajan, utawa koleksi KELIR S1–S7.',
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

/** Menghapus tanda baca em-dash (—) agar jawaban AI memakai koma atau titik dua yang rapi. */
export function hilangkanEmDashAI(teks: string): string {
  return teks
    .replace(/[ \t]*\u2014[ \t]*/g, ', ')
    .replace(/[ \t]+--[ \t]+/g, ', ')
    .replace(/[ \t]+,/g, ',')
    .replace(/,\s*,+/g, ',')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Memecah transkrip panjang satu blok tanpa jeda paragraf menjadi 2-3 paragraf kuratorial yang nyaman dibaca.
 */
export function rapikanParagrafResponsAI(teks: string): string {
  const bersih = teks.trim();
  if (!bersih || bersih.includes('\n\n') || bersih.length < 340) {
    return bersih;
  }
  const kalimat = bersih
    .split(/(?<=[.!?])\s+(?=[A-Z0-9\u00C0-\u024F\uA980-\uA9DF"“'‘(])/)
    .map((k) => k.trim())
    .filter(Boolean);
  if (kalimat.length < 4) {
    return bersih;
  }
  const jumlahGrup = kalimat.length >= 6 ? 3 : 2;
  const ukuran = Math.ceil(kalimat.length / jumlahGrup);
  const paragraf: string[] = [];
  for (let i = 0; i < kalimat.length; i += ukuran) {
    paragraf.push(kalimat.slice(i, i + ukuran).join(' '));
  }
  return paragraf.join('\n\n');
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

  const trimmed = hilangkanEmDashAI(
    teksRaw
      .normalize('NFKC')
      .replace(/[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, ''),
  )
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
