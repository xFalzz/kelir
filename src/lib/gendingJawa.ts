import { ambilTeks, type BahasaAktif, type KodeSumber, type MultiTeks } from '../content/pusaka.ts';

export type GendingId = 'puspawarna' | 'wilujeng' | 'lirilira' | 'kebogiro';
export type JenisLaras = 'slendro' | 'pelog';

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
  laras: JenisLaras;
  larasLabel: MultiTeks;
  pencipta: MultiTeks;
  tempoMs: number;
  filosofiJudul: MultiTeks;
  filosofiMakna: MultiTeks;
  sumber: KodeSumber[];
  balungan: KetukanBalungan[];
}

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
    id: 'wilujeng',
    judul: 'Ladrang Wilujeng',
    aksara: 'ꦭꦢꦿꦁꦮꦶꦭꦸꦗꦼꦁ',
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
    id: 'lirilira',
    judul: 'Tembang Lir-Ilir',
    aksara: 'ꦠꦼꦩ꧀ꦧꦁꦭꦶꦂꦲꦶꦭꦶꦂ',
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
    id: 'kebogiro',
    judul: 'Lancaran Kebo Giro',
    aksara: 'ꦭꦚ꧀ꦕꦫꦤ꧀ꦏꦼꦧꦺꦴꦒꦶꦫꦺꦴ',
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
];

export function cariGendingById(id: GendingId): GendingBudaya {
  return REPERTOAR_GENDING_JAWA.find((g) => g.id === id) ?? REPERTOAR_GENDING_JAWA[0];
}

export function ambilDeskripsiFilosofiGending(
  g: GendingBudaya,
  bahasa: BahasaAktif,
): { judul: string; laras: string; pencipta: string; filosofiJudul: string; filosofiMakna: string } {
  return {
    judul: g.judul,
    laras: ambilTeks(g.larasLabel, bahasa),
    pencipta: ambilTeks(g.pencipta, bahasa),
    filosofiJudul: ambilTeks(g.filosofiJudul, bahasa),
    filosofiMakna: ambilTeks(g.filosofiMakna, bahasa),
  };
}
