// Transliterator berbasis aturan untuk mengubah ejaan Latin Jawa ke Aksara Jawa (Unicode U+A980..U+A9DF).
// Gunakan huruf 'e' untuk pepet (ꦼ) dan 'é' atau 'è' untuk taling (ꦺ).

const NGLEGENA: Record<string, string> = {
  h: 'ꦲ',
  n: 'ꦤ',
  c: 'ꦕ',
  r: 'ꦫ',
  k: 'ꦏ',
  d: 'ꦢ',
  t: 'ꦠ',
  s: 'ꦱ',
  w: 'ꦮ',
  l: 'ꦭ',
  p: 'ꦥ',
  dh: 'ꦝ',
  j: 'ꦗ',
  y: 'ꦪ',
  ny: 'ꦚ',
  m: 'ꦩ',
  g: 'ꦒ',
  b: 'ꦧ',
  th: 'ꦛ',
  ng: 'ꦔ',
};

const SANDHANGAN_SWARA: Record<string, string> = {
  a: '',
  i: 'ꦶ',
  u: 'ꦸ',
  e: 'ꦼ',
  é: 'ꦺ',
  è: 'ꦺ',
  o: 'ꦺꦴ',
};

const PANYIGEG: Record<string, string> = {
  ng: 'ꦁ',
  r: 'ꦂ',
  h: 'ꦃ',
};

const PANGKON = '꧀';
const PADA_LUNGSI = '꧉';
const PADA_LINGSA = '꧈';

const CONSONANTS = [
  'dh',
  'th',
  'ny',
  'ng',
  'h',
  'n',
  'c',
  'r',
  'k',
  'd',
  't',
  's',
  'w',
  'l',
  'p',
  'j',
  'y',
  'm',
  'g',
  'b',
];

function isVowel(ch: string): boolean {
  return ch === 'a' || ch === 'i' || ch === 'u' || ch === 'e' || ch === 'é' || ch === 'è' || ch === 'o';
}

function matchConsonant(text: string, index: number): string | null {
  const rest = text.slice(index);
  for (const c of CONSONANTS) {
    if (rest.startsWith(c)) {
      return c;
    }
  }
  return null;
}

function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/f/g, 'p')
    .replace(/v/g, 'p')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/x/g, 'ks');
}

function transliterateWord(rawWord: string): string {
  const word = normalizeWord(rawWord);
  let i = 0;
  let out = '';

  while (i < word.length) {
    const ch = word[i];

    if (isVowel(ch)) {
      out += NGLEGENA.h + SANDHANGAN_SWARA[ch];
      i += 1;
      continue;
    }

    const cons = matchConsonant(word, i);
    if (!cons) {
      i += 1;
      continue;
    }

    const afterCons = i + cons.length;
    const nextChar = word[afterCons] ?? '';

    if (nextChar && isVowel(nextChar)) {
      out += NGLEGENA[cons] + SANDHANGAN_SWARA[nextChar];
      i = afterCons + 1;
      continue;
    }

    // Konsonan mati di akhir kata atau sebelum konsonan lain.
    // Gunakan sandhangan panyigeg wanda bila 'ng', 'r', atau 'h' tidak diikuti vokal.
    if (cons in PANYIGEG) {
      out += PANYIGEG[cons];
      i = afterCons;
      continue;
    }

    // Semivokal 'r' atau 'y' setelah konsonan hidup memakai cakra (ꦿ) atau pengkal (ꦾ) bila diikuti vokal.
    if ((nextChar === 'r' || nextChar === 'y') && word[afterCons + 1] && isVowel(word[afterCons + 1])) {
      const med = nextChar === 'r' ? 'ꦿ' : 'ꦾ';
      const v = word[afterCons + 1];
      out += NGLEGENA[cons] + med + SANDHANGAN_SWARA[v];
      i = afterCons + 2;
      continue;
    }

    out += NGLEGENA[cons] + PANGKON;
    i = afterCons;
  }

  return out;
}

export function latinToAksara(input: string): string {
  if (!input || !input.trim()) {
    return '';
  }

  const tokens = input.trim().split(/(\s+|[.,;!?])/);
  let result = '';

  for (const token of tokens) {
    if (!token) continue;
    if (/^\s+$/.test(token)) {
      continue;
    }
    if (token === '.') {
      result += PADA_LUNGSI + ' ';
      continue;
    }
    if (token === ',' || token === ';') {
      result += PADA_LINGSA + ' ';
      continue;
    }
    if (/^[!?]$/.test(token)) {
      result += PADA_LUNGSI + ' ';
      continue;
    }
    const clean = token.replace(/[^a-zA-ZéèÉÈ]/g, '');
    if (clean) {
      result += transliterateWord(clean);
    }
  }

  return result.trim();
}

export interface AksaraBreakdownItem {
  latin: string;
  aksara: string;
  catatan: string;
}

export const CONTOH_TERUJI: AksaraBreakdownItem[] = [
  {
    latin: 'hanacaraka datasawala padhajayanya magabathanga',
    aksara: 'ꦲꦤꦕꦫꦏꦢꦠꦱꦮꦭꦥꦝꦗꦪꦚꦩꦒꦧꦛꦔ',
    catatan: '20 aksara nglegena dasar (Carakan).',
  },
  {
    latin: 'kelir',
    aksara: 'ꦏꦼꦭꦶꦂ',
    catatan: 'ka + pepet (ꦼ) + la + wulu (ꦶ) + layar (ꦂ).',
  },
  {
    latin: 'keris',
    aksara: 'ꦏꦼꦫꦶꦱ꧀',
    catatan: 'ka + pepet (ꦼ) + ra + wulu (ꦶ) + sa + pangkon (꧀).',
  },
  {
    latin: 'gamelan',
    aksara: 'ꦒꦩꦼꦭꦤ꧀',
    catatan: 'ga + ma + pepet (ꦼ) + la + na + pangkon (꧀).',
  },
  {
    latin: 'wayang kulit',
    aksara: 'ꦮꦪꦁꦏꦸꦭꦶꦠ꧀',
    catatan: 'wa + ya + cecak (ꦁ) + ka + suku (ꦸ) + la + wulu (ꦶ) + ta + pangkon (꧀).',
  },
  {
    latin: 'saron',
    aksara: 'ꦱꦫꦺꦴꦤ꧀',
    catatan: 'sa + ra + taling-tarung (ꦺꦴ) + na + pangkon (꧀).',
  },
];

export interface KartuCarakan {
  latin: string;
  aksara: string;
  baris: number;
  contohKata: string;
  artiContoh: string;
}

export interface BarisFilosofiCarakan {
  nomor: number;
  bunyi: string;
  aksara: string;
  makna: string;
}

export const FILOSOFI_BARIS_CARAKAN: BarisFilosofiCarakan[] = [
  {
    nomor: 1,
    bunyi: 'Ha Na Ca Ra Ka',
    aksara: 'ꦲ ꦤ ꦕ ꦫ ꦏ',
    makna: 'Ada utusan (kehidupan dan amanah ilmu pengetahuan yang diembankan kepada manusia).',
  },
  {
    nomor: 2,
    bunyi: 'Da Ta Sa Wa La',
    aksara: 'ꦢ ꦠ ꦱ ꦮ ꦭ',
    makna: 'Saling beradu argumen dan menguji kebenaran dengan teguh.',
  },
  {
    nomor: 3,
    bunyi: 'Pa Dha Ja Ya Nya',
    aksara: 'ꦥ ꦝ ꦗ ꦪ ꦚ',
    makna: 'Sama-sama kuat, seimbang dalam ilmu dan kebijaksanaan.',
  },
  {
    nomor: 4,
    bunyi: 'Ma Ga Ba Tha Nga',
    aksara: 'ꦩ ꦒ ꦧ ꦛ ꦔ',
    makna: 'Menyadari batas diri di hadapan sang pencipta setelah menuntaskan dharma.',
  },
];

export const DAFTAR_20_CARAKAN: KartuCarakan[] = [
  { latin: 'ha', aksara: 'ꦲ', baris: 1, contohKata: 'hana', artiContoh: 'ada / keberadaan' },
  { latin: 'na', aksara: 'ꦤ', baris: 1, contohKata: 'nagara', artiContoh: 'negeri / keraton' },
  { latin: 'ca', aksara: 'ꦕ', baris: 1, contohKata: 'canting', artiContoh: 'alat lukis batik tulis' },
  { latin: 'ra', aksara: 'ꦫ', baris: 1, contohKata: 'rama', artiContoh: 'ksatria pemanah Ramayana' },
  { latin: 'ka', aksara: 'ꦏ', baris: 1, contohKata: 'kelir', artiContoh: 'layar bentang wayang' },
  { latin: 'da', aksara: 'ꦢ', baris: 2, contohKata: 'dalang', artiContoh: 'penutur lakon wayang' },
  { latin: 'ta', aksara: 'ꦠ', baris: 2, contohKata: 'tuding', artiContoh: 'tangkai penggerak tangan wayang' },
  { latin: 'sa', aksara: 'ꦱ', baris: 2, contohKata: 'saron', artiContoh: 'instrumen bilah gamelan' },
  { latin: 'wa', aksara: 'ꦮ', baris: 2, contohKata: 'wayang', artiContoh: 'bayangan pertunjukan' },
  { latin: 'la', aksara: 'ꦭ', baris: 2, contohKata: 'lakon', artiContoh: 'alur kisah pertunjukan' },
  { latin: 'pa', aksara: 'ꦥ', baris: 3, contohKata: 'pamor', artiContoh: 'corak tempa lipat bilah keris' },
  { latin: 'dha', aksara: 'ꦝ', baris: 3, contohKata: 'dhadha', artiContoh: 'nada ke-3 laras slendro' },
  { latin: 'ja', aksara: 'ꦗ', baris: 3, contohKata: 'joglo', artiContoh: 'arsitektur pendopo Jawa' },
  { latin: 'ya', aksara: 'ꦪ', baris: 3, contohKata: 'yogyakarta', artiContoh: 'pusat budaya Jawa' },
  { latin: 'nya', aksara: 'ꦚ', baris: 3, contohKata: 'nyamplungan', artiContoh: 'wadah malam pada canting' },
  { latin: 'ma', aksara: 'ꦩ', baris: 4, contohKata: 'malam', artiContoh: 'lilin perintang warna batik' },
  { latin: 'ga', aksara: 'ꦒ', baris: 4, contohKata: 'gamelan', artiContoh: 'ansambel karawitan Jawa' },
  { latin: 'ba', aksara: 'ꦧ', baris: 4, contohKata: 'batik', artiContoh: 'wastra tulis malam Nusantara' },
  { latin: 'tha', aksara: 'ꦛ', baris: 4, contohKata: 'kethuk', artiContoh: 'instrumen penanda irama' },
  { latin: 'nga', aksara: 'ꦔ', baris: 4, contohKata: 'gunungan', artiContoh: 'kayon pohon kehidupan' },
];

