export interface KartuCarakan {
  latin: string;
  aksara: string;
  lafal: string;
  contohKata: string;
  contohAksara: string;
  artiContoh: { id: string; en: string; jw: string };
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

const SANDHANGAN_VOKAL: Record<string, string> = {
  a: '',
  i: '\uA9B6',
  u: '\uA9B8',
  e: '\uA9BA',
  'é': '\uA9BA',
  'è': '\uA9BA',
  'ê': '\uA9BC',
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

function normalisasiHuruf(ch: string): string {
  const lower = ch.toLowerCase();
  if (lower === 'ê' || lower === 'ë') return 'ê';
  if (lower === 'é' || lower === 'è') return 'e';
  if (lower === 'f' || lower === 'v') return 'p';
  if (lower === 'z') return 'j';
  if (lower === 'q') return 'k';
  if (lower === 'x') return 'ks';
  return lower;
}

function bacaKonsonan(teks: string, idx: number): { simbol: string; panjang: number } | null {
  for (const [kunci, simbol] of DASAR_KONSONAN) {
    if (teks.startsWith(kunci, idx)) {
      return { simbol, panjang: kunci.length };
    }
  }
  return null;
}

/**
 * Mengonversi kalimat Latin menjadi untaian Aksara Jawa (Unicode Hanacaraka).
 * Mendukung sandhangan swara, panyigeg wanda (cecak/layar/wignyan), serta pangkon.
 */
export function latinKeAksaraJawa(kalimat: string): string {
  if (!kalimat.trim()) return '';

  const ternormalisasi = [...kalimat].map(normalisasiHuruf).join('');
  let hasil = '';
  let i = 0;

  while (i < ternormalisasi.length) {
    const ch = ternormalisasi[i];

    if (ch === ' ' || ch === '\t' || ch === '\n') {
      hasil += ch;
      i++;
      continue;
    }

    if (ch === ',') {
      hasil += '\uA9C8 ';
      i++;
      continue;
    }

    if (ch === '.') {
      hasil += '\uA9C9';
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
      continue;
    }

    // Vokal berdiri di awal kata/suku kata ditopang ha (ꦲ)
    if (VOKAL_REGEX.test(ch)) {
      const bunyiVokal = ch === 'e' ? 'ê' : ch;
      hasil += KONSONAN_MAP.ha + (SANDHANGAN_VOKAL[bunyiVokal] ?? '');
      i++;
      continue;
    }

    // Tangkap penutup suku kata khusus (-ng, -r, -h) sebelum konsonan berikutnya atau akhir kata
    if (ternormalisasi.startsWith('ng', i) && !VOKAL_REGEX.test(ternormalisasi[i + 2] ?? '')) {
      hasil += '\uA981';
      i += 2;
      continue;
    }
    if (ch === 'r' && !VOKAL_REGEX.test(ternormalisasi[i + 1] ?? '') && hasil.length > 0 && !/\s$/.test(hasil)) {
      hasil += '\uA982';
      i++;
      continue;
    }
    if (ch === 'h' && !VOKAL_REGEX.test(ternormalisasi[i + 1] ?? '') && hasil.length > 0 && !/\s$/.test(hasil)) {
      hasil += '\uA983';
      i++;
      continue;
    }

    const konsonan = bacaKonsonan(ternormalisasi, i);
    if (!konsonan) {
      i++;
      continue;
    }

    let simbol = konsonan.simbol;
    let langkah = konsonan.panjang;

    // Cek gugus konsonan sisipan -r- (cakra) atau -y- (pengkal)
    let sisipan = '';
    const setelahKonsonan = ternormalisasi[i + langkah] ?? '';
    const vokalSesudahSisipan = ternormalisasi[i + langkah + 1] ?? '';
    if (setelahKonsonan === 'r' && VOKAL_REGEX.test(vokalSesudahSisipan)) {
      sisipan = '\uA9BF';
      langkah += 1;
    } else if (setelahKonsonan === 'y' && VOKAL_REGEX.test(vokalSesudahSisipan)) {
      sisipan = '\uA9BE';
      langkah += 1;
    }

    const vokalBerikut = ternormalisasi[i + langkah] ?? '';
    if (VOKAL_REGEX.test(vokalBerikut)) {
      // Gunakan e -> taling jika ada petanda é, atau pepet/taling kontekstual sederhana
      const sandhangan =
        vokalBerikut === 'e' &&
        (ternormalisasi.startsWith('kelir', Math.max(0, i - 1)) ||
          ternormalisasi.startsWith('serat', Math.max(0, i - 1)) ||
          ternormalisasi.startsWith('dalem', Math.max(0, i - 1)))
          ? SANDHANGAN_VOKAL['ê']
          : (SANDHANGAN_VOKAL[vokalBerikut] ?? '');
      hasil += simbol + sisipan + sandhangan;
      i += langkah + 1;
    } else {
      // Konsonan mati diberi pangkon
      hasil += simbol + sisipan + '\uA9C0';
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
  const polaToken = /(©|\b(?:KELIR|UNESCO|ICH|CAD|PBR|BM25|RAG|PWA|Pamomong|WebGL|WebAudio|MediaPipe|Unicode|BPM|HDR|X-Ray|3D|21-Titik)\b|U\+[A-F0-9]+|S\d(?:[–-]S?\d)?|KLR-[A-Z0-9-]+|\d+(?:[.,–-]\d+)?%?|\bms\b)/g;
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
