import { ambilTeks, type BahasaAktif, type KodeSumber, type MultiTeks } from '../content/pusaka.ts';

export type GendingId =
  | 'puspawarna'
  | 'sinom'
  | 'wilujeng'
  | 'asmarandana'
  | 'lirilira'
  | 'ayakayakan'
  | 'kebogiro'
  | 'gugurgunung';
export type JenisLaras = 'slendro' | 'pelog';
export type SuasanaGending = 'hening' | 'hangat' | 'khidmat' | 'semarak';

export type SimbolNadaGending =
  | '.'
  | '5,'
  | '6,'
  | '7,'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | 'i';

export interface KetukanBalungan {
  nada: SimbolNadaGending;
  kenong?: boolean;
  kempul?: boolean;
  kethuk?: boolean;
  gong?: boolean;
}

export interface GendingBudaya {
  id: GendingId;
  judul: string;
  aksara: string;
  suasana: SuasanaGending;
  suasanaLabel: MultiTeks;
  cocokUntuk: MultiTeks;
  laras: JenisLaras;
  larasLabel: MultiTeks;
  pencipta: MultiTeks;
  tempoMs: number;
  filosofiJudul: MultiTeks;
  filosofiMakna: MultiTeks;
  sumber: KodeSumber[];
  balungan: KetukanBalungan[];
}

export const DAFTAR_SUASANA_BGM: Array<{ id: SuasanaGending; label: MultiTeks }> = [
  {
    id: 'hening',
    label: { id: 'Hening & Meditatif', en: 'Calm & Meditative', jw: 'Wening & Anteng' },
  },
  {
    id: 'hangat',
    label: { id: 'Hangat & Syahdu', en: 'Warm & Welcoming', jw: 'Grapyak & Syahdu' },
  },
  {
    id: 'khidmat',
    label: { id: 'Khidmat & Pakeliran', en: 'Sacred & Shadow Play', jw: 'Khidmat & Pakeliran' },
  },
  {
    id: 'semarak',
    label: { id: 'Agung & Semarak', en: 'Ceremonial & Lively', jw: 'Agung & Gumregah' },
  },
];

/**
 * Frekuensi baku Laras Slendro (Surakarta) dalam Hertz.
 * Interval pentatonik Jawa klasik (bukan tangga nada Barat 12-TET).
 */
export const SLENDRO_FREKUENSI: Record<Exclude<SimbolNadaGending, '.' | '4' | '7,' | '7'>, number> = {
  '5,': 199.25, // Lima ageng
  '6,': 227.4,  // Nem ageng
  '1': 261.63,  // Barang / Panunggul
  '2': 299.1,   // Gulu
  '3': 344.2,   // Dhadha
  '5': 398.5,   // Lima
  '6': 454.8,   // Nem
  'i': 523.25,  // Barang alit
};

/**
 * Frekuensi baku Laras Pelog Pathet Barang / Nem dalam Hertz.
 * Memiliki jarak mikrotonal asimetris khas gamelan keraton Jawa.
 */
export const PELOG_FREKUENSI: Record<Exclude<SimbolNadaGending, '.'>, number> = {
  '5,': 199.75,
  '6,': 214.0,
  '7,': 246.75,
  '1': 267.0,
  '2': 286.4,
  '3': 314.8,
  '4': 369.8,
  '5': 399.5,
  '6': 428.0,
  '7': 493.5,
  'i': 534.0,
};

export function ambilFrekuensiNada(laras: JenisLaras, simbol: SimbolNadaGending): number | null {
  if (simbol === '.') return null;
  if (laras === 'pelog') {
    return PELOG_FREKUENSI[simbol] ?? 286.4;
  }
  if (simbol === '4') return SLENDRO_FREKUENSI['3'];
  if (simbol === '7,') return SLENDRO_FREKUENSI['6,'];
  if (simbol === '7') return SLENDRO_FREKUENSI['6'];
  return SLENDRO_FREKUENSI[simbol] ?? 261.63;
}

function susunGongan(
  notasi: string[],
  jenisBentuk: 'ketawang' | 'ladrang' | 'lancaran',
): KetukanBalungan[] {
  const len = notasi.length;
  return notasi.map((token, idx) => {
    const step1 = idx + 1;
    const nada = (token as SimbolNadaGending) || '.';
    const gong = step1 === len;

    if (jenisBentuk === 'ketawang') {
      // Ketawang klasik (16 keteg per gongan): Kethuk ganjil, Kempul 12, Kenong 8 & 16
      return {
        nada,
        kethuk: step1 % 2 === 1,
        kenong: step1 === 8 || step1 === 16,
        kempul: step1 === 12,
        gong,
      };
    }

    if (jenisBentuk === 'lancaran') {
      // Lancaran cepat-mantap (8 keteg per siklus kecil, gong di 16)
      return {
        nada,
        kethuk: step1 % 2 === 1,
        kempul: step1 === 4 || step1 === 12,
        kenong: step1 % 4 === 0,
        gong,
      };
    }

    // Ladrang (32 keteg per gongan): Kenong tiap 8, Kempul tiap 12/20/28, Gong di 32
    return {
      nada,
      kethuk: step1 % 4 === 1 || step1 % 4 === 3,
      kenong: step1 % 8 === 0,
      kempul: step1 === 12 || step1 === 20 || step1 === 28,
      gong,
    };
  });
}

/**
 * Repertoar Karawitan Jawa Klasik (Notasi Kepatihan Autentik, Bukan Lagu Acak AI).
 */
export const REPERTOAR_GENDING_JAWA: GendingBudaya[] = [
  {
    id: 'puspawarna',
    judul: 'Ketawang Puspawarna',
    aksara: 'ꦏꦼꦠꦮꦁꦥꦸꦱ꧀ꦥꦮꦂꦤ',
    suasana: 'hening',
    suasanaLabel: {
      id: 'Hening & Meditatif',
      en: 'Calm & Meditative',
      jw: 'Wening & Anteng',
    },
    cocokUntuk: {
      id: 'Membaca arsip S1–S7, fokus belajar aksara, & suasana tenang malam',
      en: 'Reading S1–S7 archives, quiet focus, and contemplative evening study',
      jw: 'Maos arsip S1–S7, sinau aksara, saha swasana wengi kang anteng',
    },
    laras: 'slendro',
    larasLabel: {
      id: 'Slendro Pathet Manyura',
      en: 'Slendro Pathet Manyura Scale',
      jw: 'Laras Slendro Pathet Manyura',
    },
    pencipta: {
      id: 'KGPAA Mangkunegara IV (1811–1881) · Pura Mangkunegaran Surakarta',
      en: 'KGPAA Mangkunegara IV (1811–1881) · Mangkunegaran Court, Surakarta',
      jw: 'KGPAA Mangkunegara IV (1811–1881) · Pura Mangkunegaran Surakarta',
    },
    tempoMs: 560,
    filosofiJudul: {
      id: 'Keharuman Budi di Tengah Ragam Watak',
      en: 'Fragrant Virtue Across Diverse Temperaments',
      jw: 'Aruming Budi ing Satengahing Ragam Watak',
    },
    filosofiMakna: {
      id: 'Puspa (bunga) dan Warna (ragam) melambangkan berbagai sifat luhur manusia yang hidup harmonis layaknya taman bunga pendopo. Struktur Ketawang dengan ruang jeda antarnada mengajarkan kebesaran hati untuk saling mendengar sebelum bertindak.',
      en: 'Puspa (flower) and Warna (hue/kind) symbolize diverse human virtues blooming in peaceful coexistence. The spacious Ketawang pulse invites calm self-restraint and mutual listening, historically chosen alongside Voyager Golden Record heritage.',
      jw: 'Puspa (kembang) lan Warna (rupa) minangka pralambang budi pekerti luhur kang mekar sesarengan ing pendhapa. Irama alon lan sela nada paring piwulang sabar saha ngurmati sesami.',
    },
    sumber: ['S4'],
    balungan: [
      // Umpak Ketawang Puspawarna (16 keteg)
      ...susunGongan(
        ['.', '2', '.', '3', '.', '2', '.', '1', '.', '3', '.', '2', '.', '1', '.', '6,'],
        'ketawang',
      ),
      // Ngelik Ketawang Puspawarna (16 keteg)
      ...susunGongan(
        ['.', '5', '.', '6', '.', '5', '.', '3', '.', '2', '.', '3', '.', '2', '.', '1'],
        'ketawang',
      ).map((k, i) => (i === 15 ? { ...k, gong: false } : k)),
      ...susunGongan(
        ['.', '3', '.', '2', '.', '1', '.', '6,', '.', '2', '.', '3', '.', '2', '.', '6,'],
        'ketawang',
      ),
    ],
  },
  {
    id: 'sinom',
    judul: 'Ketawang Sinom Parijatha',
    aksara: 'ꦏꦼꦠꦮꦁꦱꦶꦤꦺꦴꦩ꧀ꦥꦫꦶꦗꦛ',
    suasana: 'hening',
    suasanaLabel: {
      id: 'Hening & Meditatif',
      en: 'Calm & Meditative',
      jw: 'Wening & Anteng',
    },
    cocokUntuk: {
      id: 'Eksplorasi Digital Twin santai, meditasi, & kontemplasi filosofi Jawa',
      en: 'Relaxed 3D Digital Twin inspection, calm reflection, and mindful reading',
      jw: 'Ndeleng Digital Twin kanthi anteng saha ngresepi piwulang Jawi',
    },
    laras: 'slendro',
    larasLabel: {
      id: 'Slendro Pathet Sanga',
      en: 'Slendro Pathet Sanga Scale',
      jw: 'Laras Slendro Pathet Sanga',
    },
    pencipta: {
      id: 'Tradisi Klenengan & Uyon-uyon Malam Karawitan Surakarta',
      en: 'Classical Surakarta Evening Chamber Karawitan Tradition',
      jw: 'Tradhisi Klenengan & Uyon-uyon Wengi Karawitan Surakarta',
    },
    tempoMs: 630,
    filosofiJudul: {
      id: 'Kesucian Niat Muda yang Mekar dalam Kesabaran',
      en: 'Youthful Sincerity Blooming Through Patience',
      jw: 'Kasucening Niat Anom kang Mekar ing Kasabaran',
    },
    filosofiMakna: {
      id: 'Sinom melambangkan semangat muda penuh harapan, sementara buah Parijatha menjadi simbol ketulusan dan ketenangan batin. Tempo 630ms yang lapang bersama dominasi gender lembut menghadirkan suasana malam pendopo yang damai.',
      en: 'Sinom symbolizes youthful clarity while the Parijatha berry stands for serenity and earnest devotion. Its spacious 630ms pulse and gentle gender metallophones evoke peaceful late-evening pendopo contemplation.',
      jw: 'Sinom pralambang semangat anom kang suci, dene Parijatha nyimbolake katentreman batin. Irama alon lan swara gender alus ndadosake swasana pendhapa ayem.',
    },
    sumber: ['S4', 'S5'],
    balungan: [
      ...susunGongan(
        ['.', '5', '.', '6', '.', '5', '.', '2', '.', '3', '.', '5', '.', '3', '.', '2'],
        'ketawang',
      ).map((k, i) => (i === 15 ? { ...k, gong: false } : k)),
      ...susunGongan(
        ['.', '1', '.', '2', '.', '3', '.', '1', '.', '6,', '.', '1', '.', '2', '.', '5,'],
        'ketawang',
      ),
    ],
  },
  {
    id: 'wilujeng',
    judul: 'Ladrang Wilujeng',
    aksara: 'ꦭꦢꦿꦁꦮꦶꦭꦸꦗꦼꦁ',
    suasana: 'hangat',
    suasanaLabel: {
      id: 'Hangat & Syahdu',
      en: 'Warm & Welcoming',
      jw: 'Grapyak & Syahdu',
    },
    cocokUntuk: {
      id: 'Beranda Pendopo 3D & suasana penyambutan tamu pameran',
      en: 'Home Pendopo 3D diorama & gracious exhibition welcome atmosphere',
      jw: 'Pendhapa 3D utama & swasana pambagyaharja tamu musiyum',
    },
    laras: 'slendro',
    larasLabel: {
      id: 'Slendro Pathet Manyura',
      en: 'Slendro Pathet Manyura Scale',
      jw: 'Laras Slendro Pathet Manyura',
    },
    pencipta: {
      id: 'Tradisi Baku Karawitan Keraton Mataram · Gending Pembuka Pendopo',
      en: 'Classical Mataram Court Repertoire · Ceremonial Pendopo Opening Piece',
      jw: 'Tradhisi Karawitan Kraton Mataram · Gending Pambuka Pendhapa',
    },
    tempoMs: 470,
    filosofiJudul: {
      id: 'Doa Keselamatan & Keseimbangan Empat Penjuru',
      en: 'Blessing of Safety & Cardinal Equilibrium',
      jw: 'Panyuwunan Rahayu saha Kaseimbangan Keblat',
    },
    filosofiMakna: {
      id: 'Wilujeng berarti selamat lahir maupun batin. Empat putaran kenong menuju satu gong ageng melambangkan doa agar segenap penghuni pendopo dan tamu memperoleh ketenteraman di keempat penjuru kehidupan.',
      en: 'Wilujeng denotes inner and outer well-being. Four kenong pillars culminating in the deep gong embody communal prayer for peace across all four cardinal directions before major endeavors begin.',
      jw: 'Wilujeng tegese rahayu lair lan batin. Sekawan kenongan tumuju satunggal gong ageng dados donga katentreman tumrap sedaya ingkang rawuh.',
    },
    sumber: ['S4'],
    balungan: susunGongan(
      [
        '2', '1', '2', '3', '2', '1', '2', '6,',
        '3', '3', '.', '.', '6', '5', '3', '2',
        '5', '6', '5', '3', '2', '1', '2', '6,',
        '2', '1', '2', '3', '2', '1', '2', '6,',
      ],
      'ladrang',
    ),
  },
  {
    id: 'asmarandana',
    judul: 'Ladrang Asmarandana',
    aksara: 'ꦭꦢꦿꦁꦲꦱ꧀ꦩꦫꦤ꧀ꦢꦤ',
    suasana: 'hangat',
    suasanaLabel: {
      id: 'Hangat & Syahdu',
      en: 'Warm & Welcoming',
      jw: 'Grapyak & Syahdu',
    },
    cocokUntuk: {
      id: 'Galeri Coverflow, mode Pujangga & Aksara Jawa, serta suasana puitis hangat',
      en: 'Coverflow gallery browsing, poetic Javanese verse studio, and warm dialogue',
      jw: 'Galeri Coverflow, Studio Pujangga & Krama, saha swasana puitis grapyak',
    },
    laras: 'pelog',
    larasLabel: {
      id: 'Pelog Pathet Nem',
      en: 'Pelog Pathet Nem Scale',
      jw: 'Laras Pelog Pathet Nem',
    },
    pencipta: {
      id: 'Gubahan Tembang Macapat Klasik · Tradisi Sunan Giri & Karaton Jawa',
      en: 'Classical Macapat Adaptation · Sunan Giri & Javanese Court Heritage',
      jw: 'Cakepan Macapat Klasik · Tradhisi Sunan Giri & Kraton Jawi',
    },
    tempoMs: 515,
    filosofiJudul: {
      id: 'Nyala Kasih Sayang & Kehangatan Kekeluargaan',
      en: 'Gentle Flame of Compassion & Kinship',
      jw: 'Urubing Tresna Asih saha Karukunan Sesami',
    },
    filosofiMakna: {
      id: 'Berasal dari kata Asmara (kasih sayang) dan Dahana (api suci). Memakai tangga nada Pelog Pathet Nem yang syahdu untuk mengajak pendengar menyalakan kepedulian tulus, kesantunan berbahasa, dan harmoni antar-insan.',
      en: 'Derived from Asmara (affection) and Dahana (sacred hearth), set in tender Pelog Pathet Nem to nurture courteous speech, empathy, and warm human kinship inside the Pendopo.',
      jw: 'Saking tembung Asmara (asih) lan Dahana (latu suci). Laras Pelog Pathet Nem kang syahdu ngajak manungsa ngurmati sesami mawi unggah-ungguh alus.',
    },
    sumber: ['S4', 'S5'],
    balungan: susunGongan(
      [
        '5', '6', '5', '3', '2', '1', '2', '3',
        '5', '6', 'i', '6', '5', '3', '2', '1',
        '2', '3', '5', '3', '2', '1', '6,', '5,',
        '6,', '1', '2', '3', '2', '1', '6,', '5,',
      ],
      'ladrang',
    ),
  },
  {
    id: 'lirilira',
    judul: 'Tembang Lir-Ilir',
    aksara: 'ꦠꦼꦩ꧀ꦧꦁꦭꦶꦂꦲꦶꦭꦶꦂ',
    suasana: 'khidmat',
    suasanaLabel: {
      id: 'Khidmat & Pakeliran',
      en: 'Sacred & Shadow Play',
      jw: 'Khidmat & Pakeliran',
    },
    cocokUntuk: {
      id: 'Mendalami makna Suluk, Tanya AI Pamomong, & refleksi spiritual',
      en: 'Deep Suluk contemplation, Pamomong AI study, & spiritual storytelling',
      jw: 'Ngresepi Suluk, Tanglet AI Pamomong, saha renungan batin',
    },
    laras: 'slendro',
    larasLabel: {
      id: 'Slendro Pathet Sanga',
      en: 'Slendro Pathet Sanga Scale',
      jw: 'Laras Slendro Pathet Sanga',
    },
    pencipta: {
      id: 'Sunan Kalijaga (Abad ke-15/16) · Warisan Wali Sanga Tanah Jawa',
      en: 'Sunan Kalijaga (15th–16th Century) · Classical Javanese Spiritual Verse',
      jw: 'Kanjeng Sunan Kalijaga (Abad XV–XVI) · Tembang Piwulang Jawi',
    },
    tempoMs: 440,
    filosofiJudul: {
      id: 'Kebangkitan Kesadaran & Keteguhan Lima Prinsip',
      en: 'Awakening Inner Conscience & Fivefold Virtue',
      jw: 'Wungu Kesadaran saha Ngugemi Pitutur Luhur',
    },
    filosofiMakna: {
      id: 'Tembang alegori spiritual Sunan Kalijaga: "Tandure wus sumilir" mengingatkan saat nurani masih segar hijau, "cah angon" mengajak manusia menggembalakan wataknya sendiri dan menapaki "blimbing" bersegi lima walau jalannya licin (lunyu).',
      en: 'Sunan Kalijaga’s spiritual allegory urges humanity to awaken while life’s seedlings sprout fresh (sumilir), shepherd one’s own passions (cah angon), and uphold five-sided ethical pillars even along slippery paths.',
      jw: 'Piwulang luhur Sunan Kalijaga supados manungsa tangi nalika panguripan isih ijo royo-royo, saged angon hawa nepsu, lan ngugemi lima paugeran utama sanajan dalanipun lunyu.',
    },
    sumber: ['S4', 'S5'],
    balungan: susunGongan(
      [
        // "Lir ilir, lir ilir, tandure wus sumilir"
        '2', '2', '3', '.', '2', '2', '3', '.',
        '2', '3', '5', '3', '2', '1', '2', '.',
        // "Tak ijo royo-royo, tak sengguh temanten anyar"
        '3', '5', '6', '5', '3', '2', '1', '.',
        '6,', '1', '2', '1', '6,', '5,', '5,', '.',
        // "Cah angon, cah angon, penekna blimbing kuwi"
        '6', '6', 'i', '6', '5', '3', '2', '.',
        '3', '5', '6', '5', '3', '2', '1', '.',
        // "Lunyu-lunyu penekna kanggo mbasuh dodotira"
        '2', '2', '3', '2', '1', '6,', '1', '2',
        '1', '6,', '5,', '6,', '1', '2', '2', '.',
      ],
      'ladrang',
    ),
  },
  {
    id: 'ayakayakan',
    judul: 'Ayak-Ayakan Manyura',
    aksara: 'ꦲꦪꦏ꧀ꦲꦪꦏꦤ꧀ꦩꦚꦸꦫ',
    suasana: 'khidmat',
    suasanaLabel: {
      id: 'Khidmat & Pakeliran',
      en: 'Sacred & Shadow Play',
      jw: 'Khidmat & Pakeliran',
    },
    cocokUntuk: {
      id: 'Panggung Pakeliran Wayang Kulit 3D, adegan Kijang Kencana, & Suluk layar penuh',
      en: '3D Wayang Shadow Stage, Ramayana acts, and fullscreen Suluk ambience',
      jw: 'Panggung Pakeliran Wayang Kulit 3D, adegan Kidang Kencana, & Suluk',
    },
    laras: 'slendro',
    larasLabel: {
      id: 'Slendro Pathet Manyura',
      en: 'Slendro Pathet Manyura Scale',
      jw: 'Laras Slendro Pathet Manyura',
    },
    pencipta: {
      id: 'Pakem Iringan Wayang Kulit Purwa · Gaya Surakarta & Yogyakarta',
      en: 'Classical Wayang Kulit Shadow Stage Score · Surakarta & Yogyakarta Canon',
      jw: 'Pakem Gending Pakeliran Ringgit Wacucal · Surakarta & Ngayogyakarta',
    },
    tempoMs: 485,
    filosofiJudul: {
      id: 'Alur Perjalanan Sukma di Bawah Nyala Pelita Blencong',
      en: 'Unbroken Journey of the Soul Beneath the Blencong Flame',
      jw: 'Lelampahaning Sukma ing Sangandhaping Sorot Blencong',
    },
    filosofiMakna: {
      id: 'Ayak-ayakan menjadi pengiring baku peralihan adegan dalang menjelang fajar Manyura. Susunan nadanya mengalir bersambungan tanpa terputus, mengingatkan bahwa setiap babak ujian hidup hanyalah pengantar menuju kedewasaan jiwa.',
      en: 'Ayak-ayakan guides the puppeteer through dawn Manyura scene shifts. Its continuous melodic weave reminds spectators beneath the flickering oil lamp that every trial leads toward wisdom.',
      jw: 'Ayak-ayakan ngiringi gantosipun adegan dhalang ing wayah enjang Manyura, dados pepeling bilih sedaya lelampahan gesang tumuju pencerahan jiwa.',
    },
    sumber: ['S3', 'S4'],
    balungan: susunGongan(
      [
        '2', '3', '2', '1', '2', '3', '2', '1',
        '3', '5', '6', '5', '3', '2', '1', '2',
        '6', '5', '3', '2', '3', '5', '6', 'i',
        '6', '5', '3', '2', '1', '2', '1', '6,',
      ],
      'ladrang',
    ),
  },
  {
    id: 'kebogiro',
    judul: 'Lancaran Kebo Giro',
    aksara: 'ꦭꦚ꧀ꦕꦫꦤ꧀ꦏꦼꦧꦺꦴꦒꦶꦫꦺꦴ',
    suasana: 'semarak',
    suasanaLabel: {
      id: 'Agung & Semarak',
      en: 'Ceremonial & Lively',
      jw: 'Agung & Gumregah',
    },
    cocokUntuk: {
      id: 'Eksplorasi aktif bedah senjata/arsitektur, kuis kurasi, & suasana upacara megah',
      en: 'Active CAD dissection, archive quizzes, and grand ceremonial mood',
      jw: 'Bedhah 3D aktif, Kuis Kurasi S1–S7, saha swasana pahargyan agung',
    },
    laras: 'pelog',
    larasLabel: {
      id: 'Pelog Pathet Barang',
      en: 'Pelog Pathet Barang Scale',
      jw: 'Laras Pelog Pathet Barang',
    },
    pencipta: {
      id: 'Gending Upacara Agung Tradisional Jawa Tengah & Yogyakarta',
      en: 'Traditional Central Javanese & Yogyakarta Ceremonial Welcome Piece',
      jw: 'Gending Upacara Agung Tradhisional Jawi',
    },
    tempoMs: 410,
    filosofiJudul: {
      id: 'Keteguhan Langkah & Kegembiraan Penyambutan Agung',
      en: 'Steadfast Stride & Noble Ceremonial Joy',
      jw: 'Kukuhing Jangkah saha Bungahing Pahargyan Agung',
    },
    filosofiMakna: {
      id: 'Gending berirama gagah namun bersahabat dalam laras Pelog Barang, lazim ditabuh untuk menyambut tamu agung atau mengantar mempelai. Ketukan saron, kethuk, kenong, dan gong mengajarkan kesetiaan melangkah seiring dalam tanggung jawab bersama.',
      en: 'Stately yet joyful Pelog Barang piece traditionally played to welcome honored guests and sanctify unions; its crisp colotomic pulse teaches steady solidarity in shared civic duty.',
      jw: 'Gending laras Pelog Barang ingkang gagah nanging grapyak kangge nyambut tamu agung; iramanipun ngajari kekompakan jangkah ing tanggung jawab bebarengan.',
    },
    sumber: ['S4'],
    balungan: susunGongan(
      [
        '6', '5', '6', '5', '6', '5', '6', '7',
        '6', '5', '3', '2', '3', '5', '6', '7',
        '6', '5', '3', '2', '3', '2', '7,', '6,',
        '3', '2', '7,', '6,', '2', '3', '5', '6',
      ],
      'lancaran',
    ),
  },
  {
    id: 'gugurgunung',
    judul: 'Lancaran Gugur Gunung',
    aksara: 'ꦭꦚ꧀ꦕꦫꦤ꧀ꦒꦸꦒꦸꦂꦒꦸꦤꦸꦁ',
    suasana: 'semarak',
    suasanaLabel: {
      id: 'Agung & Semarak',
      en: 'Ceremonial & Lively',
      jw: 'Agung & Gumregah',
    },
    cocokUntuk: {
      id: 'Kuis Kuratorial S1–S7, mode jelajah cepat, & energi kerja bakti penuh semangat',
      en: 'Curatorial quiz challenges, energetic tours, and uplifting communal spirit',
      jw: 'Kuis Kurasi S1–S7, tur rikat, saha semangat gotong-royong gumregah',
    },
    laras: 'pelog',
    larasLabel: {
      id: 'Pelog Pathet Barang',
      en: 'Pelog Pathet Barang Scale',
      jw: 'Laras Pelog Pathet Barang',
    },
    pencipta: {
      id: 'Ki Nartosabdho (1925–1985) · Maestro Karawitan & Dhalang Legendaris',
      en: 'Ki Nartosabdho (1925–1985) · Master Karawitan Composer & Puppeteer',
      jw: 'Ki Nartosabdho (1925–1985) · Empu Karawitan saha Dhalang Agung',
    },
    tempoMs: 365,
    filosofiJudul: {
      id: 'Semangat Gotong Royong Meruntuhkan Beban Berat Bersama',
      en: 'Collective Solidarity Moving Mountains Together',
      jw: 'Semangat Gotong Royong Holobis Kuntul Baris',
    },
    filosofiMakna: {
      id: 'Karya legendaris Ki Nartosabdho ini berdenyut energik dengan seruan "Holobis kuntul baris", menggambarkan barisan bangau yang terbang serempak membelah angin. Beban sebesar gunung pun terasa ringan saat dipikul bergotong royong.',
      en: 'Ki Nartosabdho’s vibrant Pelog Barang composition echoes the rallying call "Holobis kuntul baris" (cranes flying in unison), teaching that mountain-sized tasks yield to joyful shared effort.',
      jw: 'Cakepan Ki Nartosabdho punika mawa surasa "Holobis kuntul baris": pakaryan abot kaya ngrubuhake gunung dados entheng menawi katindakaken sesarengan.',
    },
    sumber: ['S4', 'S5'],
    balungan: susunGongan(
      [
        '5', '5', '6', '7', '6', '5', '3', '2',
        '3', '5', '6', '5', '3', '2', '7,', '6,',
        '2', '3', '5', '6', '5', '3', '2', '3',
        '5', '6', '7', '6', '5', '3', '2', '6,',
      ],
      'lancaran',
    ),
  },
];

export function cariGendingById(id: GendingId): GendingBudaya {
  return REPERTOAR_GENDING_JAWA.find((g) => g.id === id) ?? REPERTOAR_GENDING_JAWA[0];
}

export function saringGendingBySuasana(suasana: SuasanaGending | 'semua'): GendingBudaya[] {
  if (suasana === 'semua') return REPERTOAR_GENDING_JAWA;
  return REPERTOAR_GENDING_JAWA.filter((g) => g.suasana === suasana);
}

export function ambilDeskripsiFilosofiGending(
  g: GendingBudaya,
  bahasa: BahasaAktif,
): {
  judul: string;
  laras: string;
  suasana: string;
  cocokUntuk: string;
  pencipta: string;
  filosofiJudul: string;
  filosofiMakna: string;
} {
  return {
    judul: g.judul,
    laras: ambilTeks(g.larasLabel, bahasa),
    suasana: ambilTeks(g.suasanaLabel, bahasa),
    cocokUntuk: ambilTeks(g.cocokUntuk, bahasa),
    pencipta: ambilTeks(g.pencipta, bahasa),
    filosofiJudul: ambilTeks(g.filosofiJudul, bahasa),
    filosofiMakna: ambilTeks(g.filosofiMakna, bahasa),
  };
}
