export interface KartuCarakan {
  latin: string;
  aksara: string;
  lafal: string;
  contohKata: string;
  contohAksara: string;
  artiContoh: { id: string; en: string; jw: string };
}

export type KategoriAksara =
  | 'nglegena'
  | 'sandhangan'
  | 'pasangan'
  | 'swara-rekaan'
  | 'murda'
  | 'angka-pada';

export type PakemTransliterasi = 'standar' | 'lengkap-murda';

export interface ItemAksaraLengkap {
  id: string;
  kategori: KategoriAksara;
  subKelompok: { id: string; en: string; jw: string };
  nama: string;
  aksara: string;
  kodeUnicode: string;
  lafal: string;
  sisipTeks: string;
  contohKata: string;
  contohAksara: string;
  artiContoh: { id: string; en: string; jw: string };
  fungsi: { id: string; en: string; jw: string };
}

export interface DefinisiKategoriAksara {
  id: KategoriAksara;
  kode: string;
  label: { id: string; en: string; jw: string };
  ringkasan: { id: string; en: string; jw: string };
}

const KONSONAN_MAP: Record<string, string> = {
  ha: '\uA9B2',
  na: '\uA9A4',
  ca: '\uA995',
  ra: '\uA9AB',
  ka: '\uA98F',
  da: '\uA9A2',
  ta: '\uA9A0',
  sa: '\uA9B1',
  wa: '\uA9AE',
  la: '\uA9AD',
  pa: '\uA9A5',
  dha: '\uA9A3',
  ja: '\uA997',
  ya: '\uA9AA',
  nya: '\uA99A',
  ma: '\uA9A9',
  ga: '\uA992',
  ba: '\uA9A7',
  tha: '\uA99B',
  nga: '\uA994',
};

const DASAR_KONSONAN: Array<[string, string]> = [
  ['ny', '\uA99A'],
  ['ng', '\uA994'],
  ['dh', '\uA9A3'],
  ['th', '\uA99B'],
  ['h', '\uA9B2'],
  ['n', '\uA9A4'],
  ['c', '\uA995'],
  ['r', '\uA9AB'],
  ['k', '\uA98F'],
  ['d', '\uA9A2'],
  ['t', '\uA9A0'],
  ['s', '\uA9B1'],
  ['w', '\uA9AE'],
  ['l', '\uA9AD'],
  ['p', '\uA9A5'],
  ['j', '\uA997'],
  ['y', '\uA9AA'],
  ['m', '\uA9A9'],
  ['g', '\uA992'],
  ['b', '\uA9A7'],
];

const REKAAN_KONSONAN: Array<[string, string]> = [
  ['kh', '\uA98F\uA9B3'],
  ['dz', '\uA9A2\uA9B3'],
  ['gh', '\uA992\uA9B3'],
  ['f', '\uA9A5\uA9B3'],
  ['v', '\uA9A5\uA9B3'],
  ['z', '\uA997\uA9B3'],
];

const MURDA_KAPITAL_MAP: Record<string, string> = {
  '\uA9A4': '\uA99F', // Na -> Na Murda
  '\uA98F': '\uA991', // Ka -> Ka Murda
  '\uA9A0': '\uA9A1', // Ta -> Ta Murda
  '\uA9B1': '\uA9AF', // Sa -> Sa Murda
  '\uA9A5': '\uA9A6', // Pa -> Pa Murda
  '\uA99A': '\uA998', // Nya -> Nya Murda
  '\uA992': '\uA993', // Ga -> Ga Murda
  '\uA9A7': '\uA9A8', // Ba -> Ba Murda
};

const SWARA_KAPITAL_MAP: Record<string, string> = {
  a: '\uA984',
  i: '\uA986',
  u: '\uA988',
  e: '\uA98C',
  é: '\uA98C',
  è: '\uA98C',
  ê: '\uA98C',
  o: '\uA98E',
};

const SANDHANGAN_VOKAL: Record<string, string> = {
  a: '',
  i: '\uA9B6',
  u: '\uA9B8',
  e: '\uA9BA',
  é: '\uA9BA',
  è: '\uA9BA',
  ê: '\uA9BC',
  o: '\uA9BA\uA9B4',
};

const ANGKA_JAWA: Record<string, string> = {
  '0': '\uA9D0',
  '1': '\uA9D1',
  '2': '\uA9D2',
  '3': '\uA9D3',
  '4': '\uA9D4',
  '5': '\uA9D5',
  '6': '\uA9D6',
  '7': '\uA9D7',
  '8': '\uA9D8',
  '9': '\uA9D9',
};

const VOKAL_REGEX = /[aiueéoêéè]/;

function normalisasiHuruf(ch: string, lengkap: boolean): string {
  const lower = ch.toLowerCase();
  if (lower === 'ê' || lower === 'ë') return 'ê';
  if (lower === 'é' || lower === 'è') return 'e';
  if (lower === 'q') return 'k';
  if (!lengkap) {
    if (lower === 'f' || lower === 'v') return 'p';
    if (lower === 'z') return 'j';
  }
  return lower;
}

function bacaKonsonan(
  teks: string,
  idx: number,
  lengkap: boolean,
): { simbol: string; panjang: number } | null {
  if (lengkap) {
    for (const [kunci, simbol] of REKAAN_KONSONAN) {
      if (teks.startsWith(kunci, idx)) {
        return { simbol, panjang: kunci.length };
      }
    }
  }
  for (const [kunci, simbol] of DASAR_KONSONAN) {
    if (teks.startsWith(kunci, idx)) {
      return { simbol, panjang: kunci.length };
    }
  }
  return null;
}

/**
 * Mengonversi kalimat Latin menjadi untaian Aksara Jawa (Unicode Hanacaraka).
 * Mendukung mode `standar` (Carakan + Sandhangan + Pangkon) serta mode `lengkap-murda`
 * (menambahkan Aksara Murda pada huruf kapital kehormatan, Aksara Swara, Pa Cerek/Nga Lelet, Rekaan, & Pada Adeg-Adeg).
 */
export function latinKeAksaraJawa(
  kalimat: string,
  opsi?: { pakem?: PakemTransliterasi },
): string {
  if (!kalimat.trim()) return '';

  const lengkap = opsi?.pakem === 'lengkap-murda';
  const asliChars = [...kalimat.trim().replace(/X/g, 'Ks').replace(/x/g, 'ks')];
  const ternormalisasi = asliChars.map((c) => normalisasiHuruf(c, lengkap)).join('');
  let hasil = lengkap ? '\uA9CB ' : '';
  let i = 0;
  let baruAwalKata = true;
  let murdaDipakaiDiKata = false;

  while (i < ternormalisasi.length) {
    const ch = ternormalisasi[i];
    const chAsli = asliChars[i] ?? ch;
    const isKapital = lengkap && chAsli !== chAsli.toLowerCase() && chAsli === chAsli.toUpperCase();

    if (ch === ' ' || ch === '\t' || ch === '\n') {
      hasil += ch;
      baruAwalKata = true;
      murdaDipakaiDiKata = false;
      i++;
      continue;
    }

    if (ch === ',') {
      hasil += '\uA9C8 ';
      baruAwalKata = true;
      murdaDipakaiDiKata = false;
      i++;
      continue;
    }

    if (ch === '.') {
      hasil += '\uA9C9';
      baruAwalKata = true;
      murdaDipakaiDiKata = false;
      i++;
      continue;
    }

    if (ANGKA_JAWA[ch]) {
      let angka = '';
      while (i < ternormalisasi.length && ANGKA_JAWA[ternormalisasi[i]]) {
        angka += ANGKA_JAWA[ternormalisasi[i]];
        i++;
      }
      hasil += `\uA9C7${angka}\uA9C7`;
      baruAwalKata = false;
      continue;
    }

    // Mode Lengkap: Pa Cerek (ꦉ) untuk suku kata rê & Nga Lelet (ꦊ) untuk lê
    if (lengkap && ternormalisasi.startsWith('rê', i)) {
      hasil += '\uA989';
      i += 2;
      baruAwalKata = false;
      continue;
    }
    if (lengkap && ternormalisasi.startsWith('lê', i)) {
      hasil += '\uA98A';
      i += 2;
      baruAwalKata = false;
      continue;
    }

    // Vokal berdiri: gunakan Aksara Swara jika huruf awal kata berkapital pada pakem lengkap, atau Ha + Sandhangan
    if (VOKAL_REGEX.test(ch)) {
      if (lengkap && baruAwalKata && isKapital && SWARA_KAPITAL_MAP[ch]) {
        hasil += SWARA_KAPITAL_MAP[ch];
      } else {
        const bunyiVokal = ch === 'e' ? 'ê' : ch;
        hasil += KONSONAN_MAP.ha + (SANDHANGAN_VOKAL[bunyiVokal] ?? '');
      }
      baruAwalKata = false;
      i++;
      continue;
    }

    // Tangkap penutup suku kata khusus (-ng, -r, -h) sebelum konsonan berikutnya atau akhir kata
    if (ternormalisasi.startsWith('ng', i) && !VOKAL_REGEX.test(ternormalisasi[i + 2] ?? '')) {
      hasil += '\uA981';
      baruAwalKata = false;
      i += 2;
      continue;
    }
    if (
      ch === 'r' &&
      !VOKAL_REGEX.test(ternormalisasi[i + 1] ?? '') &&
      hasil.length > 0 &&
      !/\s$/.test(hasil)
    ) {
      hasil += '\uA982';
      baruAwalKata = false;
      i++;
      continue;
    }
    if (
      ch === 'h' &&
      !VOKAL_REGEX.test(ternormalisasi[i + 1] ?? '') &&
      hasil.length > 0 &&
      !/\s$/.test(hasil)
    ) {
      hasil += '\uA983';
      baruAwalKata = false;
      i++;
      continue;
    }

    const konsonan = bacaKonsonan(ternormalisasi, i, lengkap);
    if (!konsonan) {
      i++;
      continue;
    }

    let simbol = konsonan.simbol;
    const langkahKons = konsonan.panjang;
    let langkah = langkahKons;

    // Pada mode lengkap, huruf awal kata berkapital (atau konsonan Murda pertama) memakai Aksara Murda bila tersedia
    if (lengkap && baruAwalKata && isKapital && !murdaDipakaiDiKata && MURDA_KAPITAL_MAP[simbol]) {
      simbol = MURDA_KAPITAL_MAP[simbol];
      murdaDipakaiDiKata = true;
    }

    // Cek gugus konsonan sisipan -r- (cakra / cakra keret) atau -y- (pengkal)
    let sisipan = '';
    const setelahKonsonan = ternormalisasi[i + langkah] ?? '';
    const vokalSesudahSisipan = ternormalisasi[i + langkah + 1] ?? '';
    if (setelahKonsonan === 'r' && vokalSesudahSisipan === 'ê' && lengkap) {
      sisipan = '\uA9BD';
      hasil += simbol + sisipan;
      baruAwalKata = false;
      i += langkah + 2;
      continue;
    } else if (setelahKonsonan === 'r' && VOKAL_REGEX.test(vokalSesudahSisipan)) {
      sisipan = '\uA9BF';
      langkah += 1;
    } else if (setelahKonsonan === 'y' && VOKAL_REGEX.test(vokalSesudahSisipan)) {
      sisipan = '\uA9BE';
      langkah += 1;
    }

    const vokalBerikut = ternormalisasi[i + langkah] ?? '';
    if (VOKAL_REGEX.test(vokalBerikut)) {
      const sandhangan =
        vokalBerikut === 'e' &&
        (ternormalisasi.startsWith('kelir', Math.max(0, i - 1)) ||
          ternormalisasi.startsWith('serat', Math.max(0, i - 1)) ||
          ternormalisasi.startsWith('dalem', Math.max(0, i - 1)))
          ? SANDHANGAN_VOKAL['ê']
          : (SANDHANGAN_VOKAL[vokalBerikut] ?? '');
      hasil += simbol + sisipan + sandhangan;
      baruAwalKata = false;
      i += langkah + 1;
    } else {
      hasil += simbol + sisipan + '\uA9C0';
      baruAwalKata = false;
      i += langkah;
    }
  }

  return hasil.replace(/\s+/g, ' ').trim();
}

/**
 * Mengonversi prosa Jawa menjadi Aksara Jawa sembari menjaga kode arsip/teknis standar
 * (seperti S1–S7, U+A980, 3D, CAD, PBR, BM25, BPM, ms, angka) tetap terbaca presisi.
 */
export function konversiTeksKeAksaraAman(kalimat: string): string {
  if (!kalimat.trim()) return '';
  const polaToken =
    /(©|\b(?:KELIR|UNESCO|ICH|CAD|PBR|BM25|RAG|PWA|Pamomong|WebGL|WebAudio|MediaPipe|Unicode|BPM|HDR|X-Ray|3D|21-Titik)\b|U\+[A-F0-9]+|S\d(?:[–-]S?\d)?|KLR-[A-Z0-9-]+|\d+(?:[.,–-]\d+)?%?|\bms\b)/g;
  const bagian = kalimat.split(polaToken);
  return bagian
    .map((frag) => {
      if (!frag) return '';
      if (polaToken.test(frag)) {
        polaToken.lastIndex = 0;
        return frag;
      }
      polaToken.lastIndex = 0;
      const converted = latinKeAksaraJawa(frag);
      const leadSpace = /^\s+/.test(frag) ? ' ' : '';
      const trailSpace = /\s+$/.test(frag) ? ' ' : '';
      return converted ? `${leadSpace}${converted}${trailSpace}` : frag;
    })
    .join('')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const DAFTAR_CARAKAN: KartuCarakan[] = [
  {
    latin: 'Ha',
    aksara: '\uA9B2',
    lafal: 'ha / a',
    contohKata: 'Hana',
    contohAksara: 'ꦲꦤ',
    artiContoh: { id: 'Ada / Wujud awal kehidupan', en: 'Existence / Origin of life', jw: 'Wonten / Wujud wiwitaning gesang' },
  },
  {
    latin: 'Na',
    aksara: '\uA9A4',
    lafal: 'na',
    contohKata: 'Nata',
    contohAksara: 'ꦤꦠ',
    artiContoh: { id: 'Menata tatanan / Raja', en: 'Order / Sovereign ruler', jw: 'Nata tatanan / Ratu' },
  },
  {
    latin: 'Ca',
    aksara: '\uA995',
    lafal: 'ca',
    contohKata: 'Caraka',
    contohAksara: 'ꦕꦫꦏ',
    artiContoh: { id: 'Utusan / Pembawa ajaran', en: 'Envoy / Bearer of teaching', jw: 'Utusan / Ngemban dhawuh' },
  },
  {
    latin: 'Ra',
    aksara: '\uA9AB',
    lafal: 'ra',
    contohKata: 'Rama',
    contohAksara: 'ꦫꦩ',
    artiContoh: { id: 'Sri Rama / Leluhur', en: 'Prince Rama / Revered elder', jw: 'Sri Rama / Leluhur' },
  },
  {
    latin: 'Ka',
    aksara: '\uA98F',
    lafal: 'ka',
    contohKata: 'Kelir',
    contohAksara: 'ꦏꦼꦭꦶꦂ',
    artiContoh: { id: 'Layar bentang pakeliran', en: 'Wayang shadow screen', jw: 'Layar bentang pakeliran' },
  },
  {
    latin: 'Da',
    aksara: '\uA9A2',
    lafal: 'da',
    contohKata: 'Datan',
    contohAksara: 'ꦢꦠꦤ꧀',
    artiContoh: { id: 'Tiada / Keselarasan', en: 'Transcendent stillness / Harmony', jw: 'Mboten / Kaselarasan' },
  },
  {
    latin: 'Ta',
    aksara: '\uA9A0',
    lafal: 'ta',
    contohKata: 'Tatah',
    contohAksara: 'ꦠꦠꦃ',
    artiContoh: { id: 'Pahat halus kulit wayang', en: 'Fine leather chisel perforation', jw: 'Pahat alus wacucal ringgit' },
  },
  {
    latin: 'Sa',
    aksara: '\uA9B1',
    lafal: 'sa',
    contohKata: 'Saron',
    contohAksara: 'ꦱꦫꦺꦴꦤ꧀',
    artiContoh: { id: 'Instrumen bilah gamelan', en: 'Bronze metallophone gamelan bar', jw: 'Piranti wilah gangsa gamelan' },
  },
  {
    latin: 'Wa',
    aksara: '\uA9AE',
    lafal: 'wa',
    contohKata: 'Wayang',
    contohAksara: 'ꦮꦪꦁ',
    artiContoh: { id: 'Bayangan / Pertunjukan kulit', en: 'Shadow / Leather puppetry theatre', jw: 'Wewayangan / Ringgit wacucal' },
  },
  {
    latin: 'La',
    aksara: '\uA9AD',
    lafal: 'la',
    contohKata: 'Lakon',
    contohAksara: 'ꦭꦏꦺꦴꦤ꧀',
    artiContoh: { id: 'Alur kisah pementasan', en: 'Sacred dramatic narrative arc', jw: 'Lampahan pagelaran pakeliran' },
  },
  {
    latin: 'Pa',
    aksara: '\uA9A5',
    lafal: 'pa',
    contohKata: 'Pamor',
    contohAksara: 'ꦥꦩꦺꦴꦂ',
    artiContoh: { id: 'Pola lapisan besi-nikel keris', en: 'Nickel-iron meteoric damask blade', jw: 'Polaning wesi-nikel wilah dhuwung' },
  },
  {
    latin: 'Dha',
    aksara: '\uA9A3',
    lafal: 'dha',
    contohKata: 'Dhapur',
    contohAksara: 'ꦣꦥꦸꦂ',
    artiContoh: { id: 'Wujud anatomi bilah keris', en: 'Classical typology of a keris blade', jw: 'Wujud anatomi wilahan dhuwung' },
  },
  {
    latin: 'Ja',
    aksara: '\uA997',
    lafal: 'ja',
    contohKata: 'Joglo',
    contohAksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    artiContoh: { id: 'Arsitektur atap berundak Jawa', en: 'Tiered Javanese pendopo roof architecture', jw: 'Wewangunan payon tajug berundak' },
  },
  {
    latin: 'Ya',
    aksara: '\uA9AA',
    lafal: 'ya',
    contohKata: 'Yaksa',
    contohAksara: 'ꦪꦏ꧀ꦱ',
    artiContoh: { id: 'Raksasa penjaga mandala', en: 'Giant guardian in classical epics', jw: 'Raksasa pangreksa mandala' },
  },
  {
    latin: 'Nya',
    aksara: '\uA99A',
    lafal: 'nya',
    contohKata: 'Nyata',
    contohAksara: 'ꦚꦠ',
    artiContoh: { id: 'Nyata dan berwujud', en: 'Manifest and truthful reality', jw: 'Wujud nyata saha sayekti' },
  },
  {
    latin: 'Ma',
    aksara: '\uA9A9',
    lafal: 'ma',
    contohKata: 'Malam',
    contohAksara: 'ꦩꦭꦩ꧀',
    artiContoh: { id: 'Lilin canting perintang warna batik', en: 'Natural beeswax batik dye resist', jw: 'Lilin canthing panutup werna sinjang' },
  },
  {
    latin: 'Ga',
    aksara: '\uA992',
    lafal: 'ga',
    contohKata: 'Gamelan',
    contohAksara: 'ꦒꦩꦼꦭꦤ꧀',
    artiContoh: { id: 'Ansambel musik karawitan', en: 'Traditional bronze orchestra', jw: 'Paguyuban karawitan gangsa Jawi' },
  },
  {
    latin: 'Ba',
    aksara: '\uA9A7',
    lafal: 'ba',
    contohKata: 'Batik',
    contohAksara: 'ꦧꦠꦶꦏ꧀',
    artiContoh: { id: 'Kain bermotif rintang malam', en: 'Wax-resist dyed ceremonial cloth', jw: 'Sinjang sinerat malam rintang werna' },
  },
  {
    latin: 'Tha',
    aksara: '\uA99B',
    lafal: 'tha',
    contohKata: 'Thika',
    contohAksara: 'ꦛꦶꦏ',
    artiContoh: { id: 'Keteraturan pola ukir', en: 'Rhythmic precision in carved relief', jw: 'Kateraturan ukiran tatahan' },
  },
  {
    latin: 'Nga',
    aksara: '\uA994',
    lafal: 'nga',
    contohKata: 'Ngarsa',
    contohAksara: 'ꦔꦂꦱ',
    artiContoh: { id: 'Di hadapan sang khalayak', en: 'In the presence of the assembly', jw: 'Ing ngarsaning pasamuan agung' },
  },
];

function unicodeCodeLabel(str: string): string {
  return [...str]
    .map((cp) => `U+${(cp.codePointAt(0) ?? 0).toString(16).toUpperCase()}`)
    .join(' + ');
}

export const KATEGORI_AKSARA_LIST: DefinisiKategoriAksara[] = [
  {
    id: 'nglegena',
    kode: '01 · CARAKAN (20)',
    label: { id: 'Nglegena', en: 'Nglegena', jw: 'Nglegena' },
    ringkasan: {
      id: 'Dua puluh aksara silabis dasar Hanacaraka berbunyi vokal bawaan /a/ dari Ha hingga Nga.',
      en: 'Twenty foundational syllabic Javanese letters with inherent /a/ vowel from Ha to Nga.',
      jw: 'Kalih dasa aksara baku Hanacaraka mawi swara dhasar /a/ wiwit Ha ngantos Nga.',
    },
  },
  {
    id: 'sandhangan',
    kode: '02 · PENANDA BUNYI (14)',
    label: { id: 'Sandhangan', en: 'Sandhangan', jw: 'Sandhangan' },
    ringkasan: {
      id: 'Pengubah vokal (Swara), penutup suku kata (Panyigeg Wanda), sisipan konsonan (Wyanjana), serta Pa Cerek & Nga Lelet.',
      en: 'Vowel modifiers (Swara), syllable codas (Panyigeg), medial clusters (Wyanjana), plus Pa Cerek & Nga Lelet.',
      jw: 'Pangubah swara (Swara), panyigeg wanda, wyanjana seselan, saha Pa Cerek lan Nga Lelet.',
    },
  },
  {
    id: 'pasangan',
    kode: '03 · AKSARA SAMBUNG (20)',
    label: { id: 'Pasangan', en: 'Pasangan', jw: 'Pasangan' },
    ringkasan: {
      id: 'Bentuk pasangan di bawah/samping aksara untuk mematikan vokal konsonan sebelumnya di tengah kata (ditampilkan menempel pada huruf ꦤ/ꦤ꧀).',
      en: 'Subjoined or postfixed consonant forms used to suppress preceding inherent vowels mid-word (shown attached to ꦤ꧀).',
      jw: 'Wujud pasangan kangge nyigeg swara aksara sadurunge ing satengahing tembung (kapacak nempel ing ꦤ꧀).',
    },
  },
  {
    id: 'swara-rekaan',
    kode: '04 · VOKAL & SERAPAN (10)',
    label: { id: 'Swara & Rekaan', en: 'Swara & Rekaan', jw: 'Swara & Rekaan' },
    ringkasan: {
      id: 'Aksara Swara (vokal murni A, I, U, E, O) serta Aksara Rekaan bertanda cecak telu (꦳) untuk bunyi serapan Kha, Dza, Fa/Va, Za, dan Gha.',
      en: 'Pure independent vowels (Aksara Swara) and cecak telu loan-phoneme letters (Kha, Dza, Fa/Va, Za, Gha).',
      jw: 'Aksara Swara kangge vokal murni lan Aksara Rekaan mawi cecak telu (꦳) kagem swara serapan.',
    },
  },
  {
    id: 'murda',
    kode: '05 · KAPITAL KEHORMATAN (8)',
    label: { id: 'Aksara Murda', en: 'Murda Script', jw: 'Aksara Murda' },
    ringkasan: {
      id: 'Delapan aksara kehormatan (Huruf Kapital) khusus untuk penulisan gelar bangsawan, nama tokoh agung, kraton, serta kota bersejarah.',
      en: 'Eight honorific capital letters reserved for royal titles, revered figures, palaces, and historic cities.',
      jw: 'Wolung aksara pakurmatan kangge nyerat asma luhur, gelar kraton, saha papan kabudayan.',
    },
  },
  {
    id: 'angka-pada',
    kode: '06 · NUMERIK & TANDA (14)',
    label: { id: 'Angka & Pada', en: 'Numerals & Pada', jw: 'Angka & Pada' },
    ringkasan: {
      id: 'Sepuluh digit Angka Jawa (0–9) diapit Pada Pangkat serta tanda baca klasik Pada Adeg-Adeg, Lingsa, dan Lungsi.',
      en: 'Ten Javanese numerals (0–9) flanked by Pada Pangkat alongside classical manuscript punctuation marks.',
      jw: 'Sedasa Angka Jawi (0–9) kaapit Pada Pangkat saha tandha waca klasik naskah Jawi.',
    },
  },
];

const SANDHANGAN_ITEMS: ItemAksaraLengkap[] = [
  {
    id: 'snd-wulu',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Swara', en: 'Vowel Diacritic', jw: 'Sandhangan Swara' },
    nama: 'Wulu (i)',
    aksara: 'ꦥꦶ',
    kodeUnicode: 'U+A9B6',
    lafal: '/i/ (pada ꦥ -> pi)',
    sisipTeks: 'Siti',
    contohKata: 'Siti',
    contohAksara: 'ꦱꦶꦠꦶ',
    artiContoh: { id: 'Tanah / Bumi pertiwi', en: 'Sacred earth / Soil', jw: 'Pasiten / Lemah' },
    fungsi: {
      id: 'Diletakkan di atas aksara nglegena untuk mengubah vokal bawaan /a/ menjadi /i/.',
      en: 'Placed above a base consonant to shift its inherent /a/ vowel to /i/.',
      jw: 'Mapan ing nginggiling aksara kangge ngowahi swara /a/ dados /i/.',
    },
  },
  {
    id: 'snd-suku',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Swara', en: 'Vowel Diacritic', jw: 'Sandhangan Swara' },
    nama: 'Suku (u)',
    aksara: 'ꦥꦸ',
    kodeUnicode: 'U+A9B8',
    lafal: '/u/ (pada ꦥ -> pu)',
    sisipTeks: 'Pusaka',
    contohKata: 'Pusaka',
    contohAksara: 'ꦥꦸꦱꦏ',
    artiContoh: { id: 'Benda warisan luhur', en: 'Sacred heirloom artifact', jw: 'Barang tilaran luhur' },
    fungsi: {
      id: 'Bersambung di kaki kanan aksara dasar untuk mengubah vokal menjadi /u/.',
      en: 'Attaches at the lower-right leg of a consonant to produce the /u/ vowel.',
      jw: 'Gathuk ing suku tengen aksara baku supados mungel /u/.',
    },
  },
  {
    id: 'snd-taling',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Swara', en: 'Vowel Diacritic', jw: 'Sandhangan Swara' },
    nama: 'Taling (é / è)',
    aksara: 'ꦥꦺ',
    kodeUnicode: 'U+A9BA',
    lafal: '/e/ taling (é/è)',
    sisipTeks: 'Lèlèh',
    contohKata: 'Keris Patrem',
    contohAksara: 'ꦏꦼꦫꦶꦱ꧀ꦥꦠꦽꦩ꧀',
    artiContoh: { id: 'Bunyi vokal é tajam', en: 'Crisp front /e/ vowel sound', jw: 'Swara taling é/è cetha' },
    fungsi: {
      id: 'Secara visual mendahului aksara dasar (dalam Unicode dikodekan sesudahnya) untuk bunyi /é/ atau /è/.',
      en: 'Visually precedes the consonant (encoded after in Unicode) to yield /e/.',
      jw: 'Wujudipun wonten ngajeng aksara baku kangge swara /é/ utawi /è/.',
    },
  },
  {
    id: 'snd-pepet',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Swara', en: 'Vowel Diacritic', jw: 'Sandhangan Swara' },
    nama: 'Pepet (ê)',
    aksara: 'ꦥꦼ',
    kodeUnicode: 'U+A9BC',
    lafal: '/ə/ schwa (pepet)',
    sisipTeks: 'Kelir',
    contohKata: 'Kelir',
    contohAksara: 'ꦏꦼꦭꦶꦂ',
    artiContoh: { id: 'Layar bentang pertunjukan wayang', en: 'Shadow theatre cloth screen', jw: 'Layar bentang pakeliran' },
    fungsi: {
      id: 'Lingkaran kecil lebih besar daripada Wulu di atas aksara untuk melafalkan bunyi /ê/ lemah (kecuali Ra & La).',
      en: 'Larger top ring producing the central schwa /ə/ sound (Ra & La use dedicated letters instead).',
      jw: 'Wujud bunderan ing nginggil kangge swara /ê/ pepet (kejawi Ra lan La).',
    },
  },
  {
    id: 'snd-taling-tarung',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Swara', en: 'Vowel Diacritic', jw: 'Sandhangan Swara' },
    nama: 'Taling Tarung (o)',
    aksara: 'ꦥꦺꦴ',
    kodeUnicode: 'U+A9BA + U+A9B4',
    lafal: '/o/ (pada ꦥ -> po)',
    sisipTeks: 'Joglo',
    contohKata: 'Joglo',
    contohAksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    artiContoh: { id: 'Arsitektur pendopo atap tajug', en: 'Tiered Javanese pendopo hall', jw: 'Pendhapa payon tajug berundak' },
    fungsi: {
      id: 'Kombinasi Taling di kiri dan Tarung di kanan yang mengapit aksara untuk melafalkan vokal /o/.',
      en: 'Combines Taling on the left and Tarung on the right around a base letter to encode /o/.',
      jw: 'Taling ing kiwa saha Tarung ing tengen ngapit aksara kangge swara /o/.',
    },
  },
  {
    id: 'snd-cecak',
    kategori: 'sandhangan',
    subKelompok: { id: 'Panyigeg Wanda', en: 'Syllable Coda', jw: 'Panyigeg Wanda' },
    nama: 'Cecak (-ng)',
    aksara: 'ꦥꦁ',
    kodeUnicode: 'U+A981',
    lafal: '-ng penutup suku',
    sisipTeks: 'Wayang',
    contohKata: 'Wayang',
    contohAksara: 'ꦮꦪꦁ',
    artiContoh: { id: 'Seni bayangan pakeliran', en: 'Classical shadow puppet art', jw: 'Ringgit wacucal Jawi' },
    fungsi: {
      id: 'Titik kecil di atas aksara yang menambahkan bunyi sengau -ng pada akhir suku kata.',
      en: 'Top dot adding a final nasal -ng coda without needing a Virama.',
      jw: 'Titik ing nginggil kangge nutup wanda mawi swara -ng.',
    },
  },
  {
    id: 'snd-layar',
    kategori: 'sandhangan',
    subKelompok: { id: 'Panyigeg Wanda', en: 'Syllable Coda', jw: 'Panyigeg Wanda' },
    nama: 'Layar (-r)',
    aksara: 'ꦥꦂ',
    kodeUnicode: 'U+A982',
    lafal: '-r penutup suku',
    sisipTeks: 'Pamor',
    contohKata: 'Pamor',
    contohAksara: 'ꦥꦩꦺꦴꦂ',
    artiContoh: { id: 'Motif lipatan besi-nikel keris', en: 'Forge-welded iron-nickel pattern', jw: 'Polaning wesi-nikel wilah keris' },
    fungsi: {
      id: 'Garis melengkung di atas aksara yang menggantikan aksara Ra mati sebagai penutup -r.',
      en: 'Curved stroke above the glyph serving as a final -r coda.',
      jw: 'Goresan mlengkung ing nginggil kangge panutup wanda -r.',
    },
  },
  {
    id: 'snd-wignyan',
    kategori: 'sandhangan',
    subKelompok: { id: 'Panyigeg Wanda', en: 'Syllable Coda', jw: 'Panyigeg Wanda' },
    nama: 'Wignyan (-h)',
    aksara: 'ꦥꦃ',
    kodeUnicode: 'U+A983',
    lafal: '-h hembusan akhir',
    sisipTeks: 'Tatah',
    contohKata: 'Tatah',
    contohAksara: 'ꦠꦠꦃ',
    artiContoh: { id: 'Teknik pahat tembus wayang', en: 'Chisel perforation craft', jw: 'Kagunan tatah krawangan ringgit' },
    fungsi: {
      id: 'Berdiri di sebelah kanan aksara untuk menutup suku kata dengan konsonan hembus -h.',
      en: 'Placed immediately right of a glyph to append a final breathy -h coda.',
      jw: 'Mapan ing sisih tengen aksara kangge nutup wanda mawi swara -h.',
    },
  },
  {
    id: 'snd-pangkon',
    kategori: 'sandhangan',
    subKelompok: { id: 'Panyigeg Wanda', en: 'Virama / Killer', jw: 'Patèn / Pangku' },
    nama: 'Pangkon (Patèn)',
    aksara: 'ꦥ꧀',
    kodeUnicode: 'U+A9C0',
    lafal: 'penghilang vokal',
    sisipTeks: 'Batik',
    contohKata: 'Batik',
    contohAksara: 'ꦧꦠꦶꦏ꧀',
    artiContoh: { id: 'Wastra malam rintang warna', en: 'Wax-resist dyed heritage textile', jw: 'Sinjang seratan malam rintang werna' },
    fungsi: {
      id: 'Mematikan vokal bawaan /a/ di akhir kata atau klausa (bila di tengah kata memicu Pasangan).',
      en: 'Suppresses the inherent /a/ at word/clause boundaries (triggers Pasangan mid-word).',
      jw: 'Nglulur swara /a/ ing pungkasaning tembung (ing tengah dados Pasangan).',
    },
  },
  {
    id: 'snd-cakra',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Wyanjana', en: 'Medial Cluster', jw: 'Wyanjana' },
    nama: 'Cakra (-r-)',
    aksara: 'ꦥꦿ',
    kodeUnicode: 'U+A9BF',
    lafal: 'sisipan -r- (pra)',
    sisipTeks: 'Krama',
    contohKata: 'Krama',
    contohAksara: 'ꦏꦿꦩ',
    artiContoh: { id: 'Tata krama tutur halus', en: 'Polite Javanese speech register', jw: 'Unggah-ungguh basa alus' },
    fungsi: {
      id: 'Garis melingkar ke bawah untuk menyisipkan konsonan -r- tepat di belakang konsonan awal.',
      en: 'Looping subscript stroke inserting a medial /r/ cluster (e.g. kra, pra, sri).',
      jw: 'Goresan ngubengi ngandhap aksara kangge seselan -r- (kra, pra).',
    },
  },
  {
    id: 'snd-keret',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Wyanjana', en: 'Medial Cluster', jw: 'Wyanjana' },
    nama: 'Cakra Keret (-rê-)',
    aksara: 'ꦥꦽ',
    kodeUnicode: 'U+A9BD',
    lafal: 'sisipan -rê- (prê)',
    sisipTeks: 'srêp',
    contohKata: 'Srêp',
    contohAksara: 'ꦱꦽꦥ꧀',
    artiContoh: { id: 'Sejuk menenteramkan hati', en: 'Cool, calm serenity', jw: 'Adhem tentreming manah' },
    fungsi: {
      id: 'Menggantikan gabungan Cakra + Pepet untuk menyisipkan gugus bunyi -rê- secara sekaligus.',
      en: 'Replaces Cakra + Pepet simultaneously to encode a medial /rə/ cluster.',
      jw: 'Nggantos Cakra + Pepet sesarengan kangge swara seselan -rê-.',
    },
  },
  {
    id: 'snd-pengkal',
    kategori: 'sandhangan',
    subKelompok: { id: 'Sandhangan Wyanjana', en: 'Medial Cluster', jw: 'Wyanjana' },
    nama: 'Pengkal (-y-)',
    aksara: 'ꦥꦾ',
    kodeUnicode: 'U+A9BE',
    lafal: 'sisipan -y- (pya)',
    sisipTeks: 'satya',
    contohKata: 'Satya',
    contohAksara: 'ꦱꦠꦾ',
    artiContoh: { id: 'Kesetiaan & ketulusan', en: 'Steadfast loyalty and truth', jw: 'Kasetyan lan katulusan' },
    fungsi: {
      id: 'Mengait ke kanan atas sebagai tanda gugus konsonan sisipan -y- di tengah suku kata.',
      en: 'Loops up on the right to represent a medial /j/ (-y-) consonant glide.',
      jw: 'Ngait menyang tengen kangge seselan konsonan -y-.',
    },
  },
  {
    id: 'snd-pa-cerek',
    kategori: 'sandhangan',
    subKelompok: { id: 'Aksara Bunyi Khusus', en: 'Special Vocalic Syllable', jw: 'Ganten Pepet' },
    nama: 'Pa Cerek (rê)',
    aksara: 'ꦉ',
    kodeUnicode: 'U+A989',
    lafal: 'rê (pengganti Ra+Pepet)',
    sisipTeks: 'rêga',
    contohKata: 'Rêga',
    contohAksara: 'ꦉꦒ',
    artiContoh: { id: 'Nilai / Kehormatan', en: 'Value / Worth', jw: 'Regi / Aji' },
    fungsi: {
      id: 'Dalam ejaan Hanacaraka, suku kata rê tidak boleh ditulis Ra + Pepet melainkan wajib memakai Pa Cerek.',
      en: 'Standard orthography mandates Pa Cerek instead of Ra + Pepet for the /rə/ syllable.',
      jw: 'Ing pakem Jawi, wanda rê wajib migunakake Pa Cerek boten Ra + Pepet.',
    },
  },
  {
    id: 'snd-nga-lelet',
    kategori: 'sandhangan',
    subKelompok: { id: 'Aksara Bunyi Khusus', en: 'Special Vocalic Syllable', jw: 'Ganten Pepet' },
    nama: 'Nga Lelet (lê)',
    aksara: 'ꦊ',
    kodeUnicode: 'U+A98A',
    lafal: 'lê (pengganti La+Pepet)',
    sisipTeks: 'lêsung',
    contohKata: 'Lêsung',
    contohAksara: 'ꦊꦱꦸꦁ',
    artiContoh: { id: 'Lesung kayu tradisi desa', en: 'Traditional wooden rice mortar', jw: 'Piranti numbuk pantun Jawi' },
    fungsi: {
      id: 'Menggantikan gabungan La + Pepet agar penulisan wanda lê mengikuti kaidah naskah Jawa.',
      en: 'Required standalone letter replacing La + Pepet in classical Javanese spelling.',
      jw: 'Nggantos La + Pepet supados panyeratan wanda lê trep pakem.',
    },
  },
];

const PASANGAN_DATA: Array<{ latin: string; base: string; pos: { id: string; en: string; jw: string }; sample: string; sampleWord: string; arti: { id: string; en: string; jw: string } }> = [
  { latin: 'Ha', base: '\uA9B2', pos: { id: 'Di samping kanan (jajar)', en: 'Postfixed (right)', jw: 'Ing tengen (jajar)' }, sample: 'ꦲꦛꦲ', sampleWord: 'Sih Ha', arti: { id: 'Sambung Ha (꧀ꦲ)', en: 'Conjunct Ha', jw: 'Pasangan Ha' } },
  { latin: 'Na', base: '\uA9A4', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor (gantung)' }, sample: 'ꦑꦤ꧀ꦢꦤ', sampleWord: 'Khanda', arti: { id: 'Pasangan Na', en: 'Subjoined Na', jw: 'Pasangan Na' } },
  { latin: 'Ca', base: '\uA995', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦚ꧀ꦕ', sampleWord: 'Panca', arti: { id: 'Lima asas Pandawa', en: 'Fivefold principle', jw: 'Gangsal asas luhur' } },
  { latin: 'Ra', base: '\uA9AB', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦕꦤ꧀ꦢꦿ', sampleWord: 'Candra', arti: { id: 'Bulan / Sangkalan', en: 'Moon / Chronogram', jw: 'Rembulan / Sangkala' } },
  { latin: 'Ka', base: '\uA98F', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦸꦱ꧀ꦠꦏ', sampleWord: 'Pustaka', arti: { id: 'Kitab / Rujukan', en: 'Manuscript / Archive', jw: 'Serat pustaka' } },
  { latin: 'Da', base: '\uA9A2', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦱꦧ꧀ꦢ', sampleWord: 'Sabda', arti: { id: 'Tutur ucapan', en: 'Sacred utterance', jw: 'Pangandikan' } },
  { latin: 'Ta', base: '\uA9A0', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦱꦏ꧀ꦠꦶ', sampleWord: 'Sakti', arti: { id: 'Daya linuwih', en: 'Spiritual potency', jw: 'Kasekten' } },
  { latin: 'Sa', base: '\uA9B1', pos: { id: 'Di samping kanan (jajar)', en: 'Postfixed (right)', jw: 'Ing tengen (jajar)' }, sample: 'ꦄꦏ꧀ꦱꦫ', sampleWord: 'Aksara', arti: { id: 'Huruf tulisan', en: 'Written script', jw: 'Seratan aksara' } },
  { latin: 'Wa', base: '\uA9AE', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦯꦸꦱ꧀ꦮ', sampleWord: 'Suswa', arti: { id: 'Sambung Wa', en: 'Conjunct Wa', jw: 'Pasangan Wa' } },
  { latin: 'La', base: '\uA9AD', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ', sampleWord: 'Joglo', arti: { id: 'Pendopo Joglo', en: 'Joglo hall', jw: 'Griya Joglo' } },
  { latin: 'Pa', base: '\uA9A5', pos: { id: 'Di samping kanan (jajar)', en: 'Postfixed (right)', jw: 'Ing tengen (jajar)' }, sample: 'ꦱꦸꦩ꧀ꦥꦃ', sampleWord: 'Sumpah', arti: { id: 'Ikrar kebudayaan', en: 'Solemn vow', jw: 'Janji luhur' } },
  { latin: 'Dha', base: '\uA9A3', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦤ꧀ꦝꦮ', sampleWord: 'Pandhawa', arti: { id: 'Lima kesatria Keris Luk 5', en: 'Five Pandava brothers', jw: 'Pandhawa gangsal' } },
  { latin: 'Ja', base: '\uA997', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦤ꧀ꦗꦶ', sampleWord: 'Panji', arti: { id: 'Kisah Panji Nusantara', en: 'Classical Panji tale', jw: 'Cariyos Panji' } },
  { latin: 'Ya', base: '\uA9AA', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦏꦂꦪ', sampleWord: 'Karya', arti: { id: 'Karya cipta kriya', en: 'Artistic craftsmanship', jw: 'Pakaryan luhur' } },
  { latin: 'Nya', base: '\uA99A', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦸꦚ꧀ꦗ', sampleWord: 'Punja', arti: { id: 'Sambung Nya', en: 'Conjunct Nya', jw: 'Pasangan Nya' } },
  { latin: 'Ma', base: '\uA9A9', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦄꦠ꧀ꦩ', sampleWord: 'Atma', arti: { id: 'Sukma & jiwa', en: 'Inner spirit / Soul', jw: 'Nyawa / Sukma' } },
  { latin: 'Ga', base: '\uA992', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦩꦂꦒ', sampleWord: 'Marga', arti: { id: 'Jalan / Lintasan', en: 'Pathway / Course', jw: 'Margi / Dalan' } },
  { latin: 'Ba', base: '\uA9A7', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦱꦩ꧀ꦧ', sampleWord: 'Samba', arti: { id: 'Sambung Ba', en: 'Conjunct Ba', jw: 'Pasangan Ba' } },
  { latin: 'Tha', base: '\uA99B', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦏꦤ꧀ꦛ', sampleWord: 'Kantha', arti: { id: 'Susunan berangkai', en: 'Joined sequence', jw: 'Rerangken wujud' } },
  { latin: 'Nga', base: '\uA994', pos: { id: 'Di bawah aksara', en: 'Subjoined below', jw: 'Ing ngisor' }, sample: 'ꦥꦁꦔ', sampleWord: 'Pangnga', arti: { id: 'Sambung Nga', en: 'Conjunct Nga', jw: 'Pasangan Nga' } },
];

const PASANGAN_ITEMS: ItemAksaraLengkap[] = PASANGAN_DATA.map((p) => ({
  id: `psg-${p.latin.toLowerCase()}`,
  kategori: 'pasangan',
  subKelompok: p.pos,
  nama: `Pasangan ${p.latin}`,
  aksara: `\uA9A4\uA9C0${p.base}`,
  kodeUnicode: `U+A9C0 + ${unicodeCodeLabel(p.base)}`,
  lafal: `...n-${p.latin.toLowerCase()}`,
  sisipTeks: p.sampleWord,
  contohKata: p.sampleWord,
  contohAksara: p.sample,
  artiContoh: p.arti,
  fungsi: {
    id: `Mematikan konsonan sebelumnya lalu menyambung bunyi /${p.latin.toLowerCase()}/ tanpa Pangkon. ${p.pos.id}.`,
    en: `Suppresses the preceding syllable's vowel and ligates /${p.latin.toLowerCase()}/ smoothly mid-word (${p.pos.en}).`,
    jw: `Nyigeg swara aksara ngajengipun lajeng nyambung unine /${p.latin.toLowerCase()}/. ${p.pos.jw}.`,
  },
}));

const SWARA_REKAAN_ITEMS: ItemAksaraLengkap[] = [
  {
    id: 'swr-a',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Swara (Vokal)', en: 'Aksara Swara Vowel', jw: 'Aksara Swara' },
    nama: 'Swara A',
    aksara: '\uA984',
    kodeUnicode: 'U+A984',
    lafal: '/a/ murni',
    sisipTeks: 'Arjuna',
    contohKata: 'Arjuna',
    contohAksara: 'ꦄꦂꦗꦸꦤ',
    artiContoh: { id: 'Tokoh kesatria Pandawa', en: 'Arjuna of the Pandavas', jw: 'Satriya Panengah Pandhawa' },
    fungsi: {
      id: 'Menegaskan pelafalan vokal /a/ murni pada awal kata asing atau nama kehormatan.',
      en: 'Denotes an independent /a/ vowel at the beginning of proper names or loanwords.',
      jw: 'Nandesake swara vokal /a/ murni wonten wiwitaning asma utawa tembung serapan.',
    },
  },
  {
    id: 'swr-i',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Swara (Vokal)', en: 'Aksara Swara Vowel', jw: 'Aksara Swara' },
    nama: 'Swara I',
    aksara: '\uA986',
    kodeUnicode: 'U+A986',
    lafal: '/i/ murni',
    sisipTeks: 'Indonesia',
    contohKata: 'Indonesia',
    contohAksara: 'ꦆꦤ꧀ꦢꦺꦴꦤꦺꦱꦾ',
    artiContoh: { id: 'Bangsa & kepulauan Nusantara', en: 'Republic of Indonesia', jw: 'Nagari Kesatuan Indonesia' },
    fungsi: {
      id: 'Melambangkan vokal /i/ berdiri sendiri tanpa menumpang aksara Ha + Wulu.',
      en: 'Represents independent initial /i/ without attaching Wulu to Ha.',
      jw: 'Aksara vokal /i/ mandhiri tanpa migunakake Ha + Wulu.',
    },
  },
  {
    id: 'swr-u',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Swara (Vokal)', en: 'Aksara Swara Vowel', jw: 'Aksara Swara' },
    nama: 'Swara U',
    aksara: '\uA988',
    kodeUnicode: 'U+A988',
    lafal: '/u/ murni',
    sisipTeks: 'Utara',
    contohKata: 'Utara',
    contohAksara: 'ꦈꦠꦫ',
    artiContoh: { id: 'Arah mata angin Lor', en: 'North cardinal point', jw: 'Kiblat Lor' },
    fungsi: {
      id: 'Dipakai sebagai huruf awal vokal /u/ yang harus dilafalkan jelas pada istilah khusus.',
      en: 'Marks an explicit initial /u/ vowel in proper nouns and borrowed terms.',
      jw: 'Kagem miwiti tembung kanthi swara /u/ murni lan cetha.',
    },
  },
  {
    id: 'swr-e',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Swara (Vokal)', en: 'Aksara Swara Vowel', jw: 'Aksara Swara' },
    nama: 'Swara E',
    aksara: '\uA98C',
    kodeUnicode: 'U+A98C',
    lafal: '/e/ murni',
    sisipTeks: 'Empu',
    contohKata: 'Empu',
    contohAksara: 'ꦌꦩ꧀ꦥꦸ',
    artiContoh: { id: 'Maha guru penempa keris', en: 'Master keris bladesmith', jw: 'Mpu pandhe dhuwung agung' },
    fungsi: {
      id: 'Vokal berdiri /e/ untuk kata benda, istilah asing, maupun tokoh terkemuka.',
      en: 'Independent initial /e/ letter for distinguished titles and borrowed terms.',
      jw: 'Vokal mandiri /e/ kangge asma utawa istilah mirunggan.',
    },
  },
  {
    id: 'swr-o',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Swara (Vokal)', en: 'Aksara Swara Vowel', jw: 'Aksara Swara' },
    nama: 'Swara O',
    aksara: '\uA98E',
    kodeUnicode: 'U+A98E',
    lafal: '/o/ murni',
    sisipTeks: 'Omah',
    contohKata: 'Omah',
    contohAksara: 'ꦎꦩꦃ',
    artiContoh: { id: 'Hunian tradisi Jawa', en: 'Traditional home', jw: 'Griya papan panggenan' },
    fungsi: {
      id: 'Menandai bunyi vokal /o/ awal yang tegas dan tidak menjadi Pasangan.',
      en: 'Independent /o/ vowel letter (Swara letters have no Pasangan subjoined forms).',
      jw: 'Tandhanipun vokal /o/ wiwitan lan boten gadhah wujuding Pasangan.',
    },
  },
  {
    id: 'rek-kha',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Rekaan', en: 'Loan Consonant', jw: 'Aksara Rekaan' },
    nama: 'Kha (Ka + ꦳)',
    aksara: '\uA98F\uA9B3',
    kodeUnicode: 'U+A98F + U+A9B3',
    lafal: 'kha / kh',
    sisipTeks: 'Khidmat',
    contohKata: 'Khidmat',
    contohAksara: 'ꦏ꦳ꦶꦢ꧀ꦩꦠ꧀',
    artiContoh: { id: 'Khusyuk & penuh takzim', en: 'Solemn reverence', jw: 'Khusyuk kebak pangabekti' },
    fungsi: {
      id: 'Aksara Ka diberi tanda Cecak Telu (꦳) di atas untuk melafalkan fonem serapan Arab /kh/.',
      en: 'Ka adorned with three-dot Cecak Telu above to represent loan phoneme /x/ (kh).',
      jw: 'Aksara Ka mawi Cecak Telu (꦳) kangge swara serapan Arab /kh/.',
    },
  },
  {
    id: 'rek-dza',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Rekaan', en: 'Loan Consonant', jw: 'Aksara Rekaan' },
    nama: 'Dza (Da + ꦳)',
    aksara: '\uA9A2\uA9B3',
    kodeUnicode: 'U+A9A2 + U+A9B3',
    lafal: 'dza / dz',
    sisipTeks: 'Dzikir',
    contohKata: 'Dzikir',
    contohAksara: 'ꦢ꦳ꦶꦏꦶꦂ',
    artiContoh: { id: 'Mengingat Sang Pencipta', en: 'Sacred remembrance chant', jw: 'Eling dhumateng Gusti' },
    fungsi: {
      id: 'Aksara Da dengan Cecak Telu guna menulis bunyi serapan /dz/.',
      en: 'Da with Cecak Telu denoting the borrowed voiced dental fricative /dz/.',
      jw: 'Aksara Da mawi Cecak Telu kangge nyerat swara /dz/.',
    },
  },
  {
    id: 'rek-fa',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Rekaan', en: 'Loan Consonant', jw: 'Aksara Rekaan' },
    nama: 'Fa / Va (Pa + ꦳)',
    aksara: '\uA9A5\uA9B3',
    kodeUnicode: 'U+A9A5 + U+A9B3',
    lafal: 'fa / va',
    sisipTeks: 'Falsafah',
    contohKata: 'Falsafah',
    contohAksara: 'ꦥ꦳ꦭ꧀ꦱꦥ꦳ꦃ',
    artiContoh: { id: 'Kebijaksanaan hakiki', en: 'Philosophical worldview', jw: 'Kawruh filsafat luhur' },
    fungsi: {
      id: 'Aksara Pa + Cecak Telu untuk mewakili bunyi labiodental /f/ atau /v/ serapan.',
      en: 'Pa combined with Cecak Telu to represent borrowed /f/ and /v/ consonants.',
      jw: 'Aksara Pa + Cecak Telu kangge swara serapan /f/ lan /v/.',
    },
  },
  {
    id: 'rek-za',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Rekaan', en: 'Loan Consonant', jw: 'Aksara Rekaan' },
    nama: 'Za (Ja + ꦳)',
    aksara: '\uA997\uA9B3',
    kodeUnicode: 'U+A997 + U+A9B3',
    lafal: 'za / z',
    sisipTeks: 'Zaman',
    contohKata: 'Zaman',
    contohAksara: 'ꦗ꦳ꦩꦤ꧀',
    artiContoh: { id: 'Masa sejarah & kurun waktu', en: 'Historical epoch / Era', jw: 'Jaman kala sejarah' },
    fungsi: {
      id: 'Aksara Ja diberi tiga titik di atas guna menuliskan bunyi /z/ serapan secara presisi.',
      en: 'Ja with Cecak Telu encoding borrowed /z/ sounds accurately.',
      jw: 'Aksara Ja mawi Cecak Telu kagem nyerat swara /z/.',
    },
  },
  {
    id: 'rek-gha',
    kategori: 'swara-rekaan',
    subKelompok: { id: 'Aksara Rekaan', en: 'Loan Consonant', jw: 'Aksara Rekaan' },
    nama: 'Gha (Ga + ꦳)',
    aksara: '\uA992\uA9B3',
    kodeUnicode: 'U+A992 + U+A9B3',
    lafal: 'gha / gh',
    sisipTeks: 'Ghaib',
    contohKata: 'Ghaib',
    contohAksara: 'ꦒ꦳ꦆꦧ꧀',
    artiContoh: { id: 'Dimensi kasat batin', en: 'Unseen spiritual realm', jw: 'Jagad niskala alus' },
    fungsi: {
      id: 'Aksara Ga bertanda Cecak Telu untuk menyerap fonem /gh/ pada naskah sastra keagamaan.',
      en: 'Ga with Cecak Telu representing the velar fricative /gh/ in classical literature.',
      jw: 'Aksara Ga + Cecak Telu kangge nyerat swara serapan /gh/.',
    },
  },
];

const MURDA_ITEMS: ItemAksaraLengkap[] = [
  {
    id: 'mrd-na',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Na Murda',
    aksara: '\uA99F',
    kodeUnicode: 'U+A99F',
    lafal: 'Na (Kapital)',
    sisipTeks: 'Nagara',
    contohKata: 'Nagara',
    contohAksara: 'ꦟꦒꦫ',
    artiContoh: { id: 'Negara / Wilayah berdaulat', en: 'Sovereign realm / State', jw: 'Praja agung' },
    fungsi: {
      id: 'Dipakai hanya satu kali per kata kehormatan sebagai tanda huruf besar resmi tradisional.',
      en: 'Used once per proper noun on the first eligible consonant as honorific capitalization.',
      jw: 'Kaginakake sepisan ing satembung kangge tandha pakurmatan aksara ageng.',
    },
  },
  {
    id: 'mrd-ka',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Ka Murda',
    aksara: '\uA991',
    kodeUnicode: 'U+A991',
    lafal: 'Ka (Kapital)',
    sisipTeks: 'Kraton',
    contohKata: 'Kraton',
    contohAksara: 'ꦑꦿꦠꦺꦴꦤ꧀',
    artiContoh: { id: 'Istana Keraton Nusantara', en: 'Royal Javanese palace court', jw: 'Kedhaton karaton agung' },
    fungsi: {
      id: 'Bentuk Murda untuk Ka pada nama keraton, raja, serta prasasti piagam kehormatan.',
      en: 'Honorific form of Ka used in palace names, royal decrees, and inscriptions.',
      jw: 'Wujud Murda saking Ka ing asmaning karaton lan serat piagam.',
    },
  },
  {
    id: 'mrd-ta',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Ta Murda',
    aksara: '\uA9A1',
    kodeUnicode: 'U+A9A1',
    lafal: 'Ta (Kapital)',
    sisipTeks: 'Tamansari',
    contohKata: 'Tamansari',
    contohAksara: 'ꦡꦩꦤ꧀ꦱꦫꦶ',
    artiContoh: { id: 'Situs Tamansari Yogyakarta', en: 'Royal water castle Yogyakarta', jw: 'Pesanggrahan Tamansari' },
    fungsi: {
      id: 'Memuliakan penulisan situs sejarah atau nama tokoh berawal bunyi /t/.',
      en: 'Marks reverence on historical sites and noble names beginning with /t/.',
      jw: 'Kangge ngurmati panyeratan papan sejarah utawi tokoh wiwitan /t/.',
    },
  },
  {
    id: 'mrd-sa',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Sa Murda',
    aksara: '\uA9AF',
    kodeUnicode: 'U+A9AF',
    lafal: 'Sa (Kapital)',
    sisipTeks: 'Surakarta',
    contohKata: 'Surakarta',
    contohAksara: 'ꦯꦸꦫꦏꦂꦠ',
    artiContoh: { id: 'Kota Budaya Surakarta Hadiningrat', en: 'Royal city of Surakarta (Solo)', jw: 'Kutha Budaya Surakarta' },
    fungsi: {
      id: 'Salah satu aksara Murda paling sering dijumpai pada gelar "Sri" maupun "Surakarta".',
      en: 'Commonly used for the royal title "Sri" and cities like Surakarta or Surabaya.',
      jw: 'Asring kaginakake ing gelar "Sri" saha kutha kados Surakarta.',
    },
  },
  {
    id: 'mrd-pa',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Pa Murda',
    aksara: '\uA9A6',
    kodeUnicode: 'U+A9A6',
    lafal: 'Pa (Kapital)',
    sisipTeks: 'Prabu',
    contohKata: 'Prabu',
    contohAksara: 'ꦦꦿꦧꦸ',
    artiContoh: { id: 'Gelar Raja / Maharaja', en: 'Sovereign monarch title', jw: 'Sebutan Nata Binathara' },
    fungsi: {
      id: 'Digunakan untuk gelar penguasa seperti Prabu, Pangeran, maupun Panembahan.',
      en: 'Honors regal titles including Prabu, Pangeran, and Panembahan.',
      jw: 'Kagem gelar agung kados Prabu, Pangeran, utawa Panembahan.',
    },
  },
  {
    id: 'mrd-nya',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Nya Murda',
    aksara: '\uA998',
    kodeUnicode: 'U+A998',
    lafal: 'Nya (Kapital)',
    sisipTeks: 'Nyai',
    contohKata: 'Nyai Roro',
    contohAksara: 'ꦘꦆꦫꦺꦴꦫꦺꦴ',
    artiContoh: { id: 'Sebutan kehormatan putri & sepuh', en: 'Traditional honorific title', jw: 'Sebutan pakurmatan putri' },
    fungsi: {
      id: 'Bentuk agung dari aksara Nya untuk gelar sebutan maupun nama terhormat.',
      en: 'Honorific counterpart to Nya in esteemed names and court titles.',
      jw: 'Wujud ageng saking aksara Nya ing asma lan sebutan terhormat.',
    },
  },
  {
    id: 'mrd-ga',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Ga Murda',
    aksara: '\uA993',
    kodeUnicode: 'U+A993',
    lafal: 'Ga (Kapital)',
    sisipTeks: 'Gusti',
    contohKata: 'Gusti',
    contohAksara: 'ꦓꦸꦱ꧀ꦠꦶ',
    artiContoh: { id: 'Tuhan YME / Gelar Bangsawan', en: 'The Almighty / High Noble Title', jw: 'Gusti Ingkang Maha Agung' },
    fungsi: {
      id: 'Lazim mengawali kata Gusti serta nama-nama bangsawan agung dalam naskah keraton.',
      en: 'Standard opening Murda letter for Gusti and high-ranking classical figures.',
      jw: 'Dados wiwitaning tembung Gusti lan asma bangsawan ing serat kraton.',
    },
  },
  {
    id: 'mrd-ba',
    kategori: 'murda',
    subKelompok: { id: 'Huruf Kapital Murda', en: 'Honorific Murda', jw: 'Aksara Murda' },
    nama: 'Ba Murda',
    aksara: '\uA9A8',
    kodeUnicode: 'U+A9A8',
    lafal: 'Ba (Kapital)',
    sisipTeks: 'Batara',
    contohKata: 'Batara',
    contohAksara: 'ꦨꦠꦫ',
    artiContoh: { id: 'Gelar dewa atau tokoh suci pewayangan', en: 'Deity epithet in classical epics', jw: 'Sebutan dewa pewayangan' },
    fungsi: {
      id: 'Penghormatan atas tokoh suci pewayangan seperti Batara Guru dan Bima.',
      en: 'Expresses reverence for epic figures such as Batara Guru and Bima.',
      jw: 'Kangge pakurmatan tokoh pewayangan kados Bathara Guru lan Bima.',
    },
  },
];

const ANGKA_PADA_ITEMS: ItemAksaraLengkap[] = [
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n): ItemAksaraLengkap => {
    const ch = String.fromCodePoint(0xa9d0 + n);
    return {
      id: `ang-${n}`,
      kategori: 'angka-pada',
      subKelompok: { id: 'Angka Jawa', en: 'Javanese Digit', jw: 'Angka Jawi' },
      nama: `Angka ${n}`,
      aksara: ch,
      kodeUnicode: `U+A9D${n}`,
      lafal: `digit ${n}`,
      sisipTeks: `${n}`,
      contohKata: n === 5 ? 'Keris Luk 5' : n === 6 ? 'Saron 6 Bilah' : `Tahun ${202}${n}`,
      contohAksara: `\uA9C7${ch}\uA9C7`,
      artiContoh: {
        id: `Penulisan angka ${n} wajib diapit Pada Pangkat (꧇)`,
        en: `Digit ${n} framed by Pada Pangkat (꧇)`,
        jw: `Seratan angka ${n} kaapit Pada Pangkat (꧇)`,
      },
      fungsi: {
        id: 'Digit numerik tradisional Jawa. Saat dipakai di tengah kalimat, diapit dua Pada Pangkat (꧇) agar tidak tertukar huruf.',
        en: 'Traditional Javanese numeral enclosed within Pada Pangkat (꧇) markers to distinguish it from syllables.',
        jw: 'Wilangan Jawi. Nalika wonten satengahing ukara, wajib kaapit kalih Pada Pangkat (꧇).',
      },
    };
  }),
  {
    id: 'pad-adeg',
    kategori: 'angka-pada',
    subKelompok: { id: 'Pada (Tanda Baca)', en: 'Pada Punctuation', jw: 'Tandha Waca Pada' },
    nama: 'Pada Adeg-Adeg',
    aksara: '\uA9CB',
    kodeUnicode: 'U+A9CB',
    lafal: 'pembuka paragraf',
    sisipTeks: 'Kelir',
    contohKata: 'Awal Kalimat / Alinea',
    contohAksara: '꧋ꦏꦼꦭꦶꦂ꧉',
    artiContoh: { id: 'Penanda mulai alinea/kalimat baru', en: 'Paragraph / Sentence opener', jw: 'Tandha wiwit alinea utawi ukara' },
    fungsi: {
      id: 'Mengawali paragraf atau kalimat pembuka naskah Jawa (sering berpadu pada awal kakawin atau babad).',
      en: 'Marks the start of a paragraph or opening sentence in classical Javanese prose.',
      jw: 'Miwiti satunggaling paragraf utawi ukara sepisan wonten naskah Jawi.',
    },
  },
  {
    id: 'pad-pangkat',
    kategori: 'angka-pada',
    subKelompok: { id: 'Pada (Tanda Baca)', en: 'Pada Punctuation', jw: 'Tandha Waca Pada' },
    nama: 'Pada Pangkat',
    aksara: '\uA9C7',
    kodeUnicode: 'U+A9C7',
    lafal: 'titik dua / pengapit angka',
    sisipTeks: '12',
    contohKata: '12 (Kalih Welas)',
    contohAksara: '꧇꧑꧒꧇',
    artiContoh: { id: 'Pengapit penulisan angka Jawa', en: 'Numeral delimiter & colon', jw: 'Pangapit angka saha tandha titik kalih' },
    fungsi: {
      id: 'Mengapit deretan Angka Jawa di awal dan akhir bilangan atau berfungsi sebagai tanda titik dua (:).',
      en: 'Frames Javanese numerals at start and end or acts as a grammatical colon.',
      jw: 'Ngapit deretan Angka Jawi supados cetha benten kalih aksara tembung.',
    },
  },
  {
    id: 'pad-lingsa',
    kategori: 'angka-pada',
    subKelompok: { id: 'Pada (Tanda Baca)', en: 'Pada Punctuation', jw: 'Tandha Waca Pada' },
    nama: 'Pada Lingsa (,)',
    aksara: '\uA9C8',
    kodeUnicode: 'U+A9C8',
    lafal: 'tanda koma (jeda)',
    sisipTeks: 'keris, saron',
    contohKata: 'Keris, Saron',
    contohAksara: 'ꦏꦼꦫꦶꦱ꧀꧈ꦱꦫꦺꦴꦤ꧀',
    artiContoh: { id: 'Jeda koma antarfrasa', en: 'Comma clause separator', jw: 'Tandha koma pemisah ukara' },
    fungsi: {
      id: 'Berfungsi sebagai tanda koma (,). Bila tepat sesudah Pangkon, Pangkon sudah menggantikan koma.',
      en: 'Equivalent to a comma (,). After Pangkon, Pangkon visually suffices before Lingsa rules.',
      jw: 'Minangka tandha koma (,) kangge jeda pamaosan satengahing ukara.',
    },
  },
  {
    id: 'pad-lungsi',
    kategori: 'angka-pada',
    subKelompok: { id: 'Pada (Tanda Baca)', en: 'Pada Punctuation', jw: 'Tandha Waca Pada' },
    nama: 'Pada Lungsi (.)',
    aksara: '\uA9C9',
    kodeUnicode: 'U+A9C9',
    lafal: 'tanda titik akhir',
    sisipTeks: 'Selesai.',
    contohKata: 'Akhir Kalimat',
    contohAksara: 'ꦥꦸꦂꦤ꧉',
    artiContoh: { id: 'Penutup kalimat sempurna', en: 'Full stop / Period', jw: 'Tandha titik pungkasan ukara' },
    fungsi: {
      id: 'Tanda titik (.) di penghujung kalimat; jika sebelumnya ada Pangkon, cukup ditulis Pada Lingsa saja.',
      en: 'Marks sentence end (.); reduces to Pada Lingsa immediately following a Virama.',
      jw: 'Tandha titik (.) ing pungkasan ukara; menawi sasampunipun Pangkon cekap Lingsa.',
    },
  },
];

const NGLEGENA_ITEMS: ItemAksaraLengkap[] = DAFTAR_CARAKAN.map((c, idx) => ({
  id: `ngl-${c.latin.toLowerCase()}`,
  kategori: 'nglegena',
  subKelompok: {
    id: `Carakan #${String(idx + 1).padStart(2, '0')}`,
    en: `Carakan #${String(idx + 1).padStart(2, '0')}`,
    jw: `Carakan #${String(idx + 1).padStart(2, '0')}`,
  },
  nama: c.latin,
  aksara: c.aksara,
  kodeUnicode: unicodeCodeLabel(c.aksara),
  lafal: c.lafal,
  sisipTeks: c.contohKata,
  contohKata: c.contohKata,
  contohAksara: c.contohAksara,
  artiContoh: c.artiContoh,
  fungsi: {
    id: `Aksara silabis baku berbunyi /${c.lafal}/. Dapat digabungkan dengan Sandhangan maupun bentuk Pasangannya.`,
    en: `Core syllabic glyph read as /${c.lafal}/; pairs with Sandhangan vowel signs and subjoined Pasangan.`,
    jw: `Aksara baku kanthi swara /${c.lafal}/. Saged dipunwuwuhi Sandhangan utawi Pasanganipun.`,
  },
}));

export const KATALOG_AKSARA_LENGKAP: ItemAksaraLengkap[] = [
  ...NGLEGENA_ITEMS,
  ...SANDHANGAN_ITEMS,
  ...PASANGAN_ITEMS,
  ...SWARA_REKAAN_ITEMS,
  ...MURDA_ITEMS,
  ...ANGKA_PADA_ITEMS,
];

export function ambilAksaraPerKategori(kategori: KategoriAksara): ItemAksaraLengkap[] {
  return KATALOG_AKSARA_LENGKAP.filter((item) => item.kategori === kategori);
}
