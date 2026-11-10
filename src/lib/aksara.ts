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
