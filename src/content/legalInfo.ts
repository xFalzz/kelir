import type { MultiTeks } from './pusaka.ts';

export type TabLegalModal = 'syarat' | 'privasi' | 'kontak';

export interface PasalDokumenLegal {
  kode: string;
  judul: MultiTeks;
  isi: MultiTeks;
  butir?: MultiTeks[];
}

export interface KanalKontakResmi {
  id: 'email' | 'website' | 'instagram';
  label: MultiTeks;
  nilai: string;
  tautan: string;
  eksternal: boolean;
  dapatDisalin: boolean;
  keterangan: MultiTeks;
}

export interface TopikKorespondensi {
  kode: string;
  judul: MultiTeks;
  ringkas: MultiTeks;
}

export const METADATA_LEGAL = {
  eyebrow: {
    id: 'TATA KELOLA & KONTAK · KELIR',
    en: 'GOVERNANCE & CONTACT · KELIR',
    jw: 'TATA KELOLA & KONTAK · KELIR',
  } satisfies MultiTeks,
  tanggalBerlaku: {
    id: 'Pembaruan: Nov 2026 · v1.4',
    en: 'Updated: Nov 2026 · v1.4',
    jw: 'Anyar: Nov 2026 · v1.4',
  } satisfies MultiTeks,
  tabLabel: {
    syarat: {
      id: 'Syarat & Ketentuan',
      en: 'Terms & Conditions',
      jw: 'Sarat & Katentuan',
    },
    privasi: {
      id: 'Kebijakan Privasi',
      en: 'Privacy Policy',
      jw: 'Kawicaksanan Privasi',
    },
    kontak: {
      id: 'Hubungi Kami',
      en: 'Contact Us',
      jw: 'Hubungi Kula',
    },
  } satisfies Record<TabLegalModal, MultiTeks>,
};

export const RINGKASAN_TAB_LEGAL: Record<
  TabLegalModal,
  { judul: MultiTeks; pengantar: MultiTeks; lencana: MultiTeks }
> = {
  syarat: {
    judul: {
      id: 'Syarat & Ketentuan',
      en: 'Terms & Conditions',
      jw: 'Sarat & Katentuan',
    },
    lencana: {
      id: 'EDUKATIF · S1–S7',
      en: 'EDUCATIONAL · S1–S7',
      jw: 'EDUKATIF · S1–S7',
    },
    pengantar: {
      id: 'Ketentuan ringkas mengenai etika akses edukatif, atribusi arsip S1–S7, dan batas layanan KELIR.',
      en: 'Concise rules governing educational access, S1–S7 archive attribution, and KELIR service scope.',
      jw: 'Katentuan ringkes babagan etika akses pasinaon, rujukan S1–S7, lan wates layanan KELIR.',
    },
  },
  privasi: {
    judul: {
      id: 'Kebijakan Privasi',
      en: 'Privacy Policy',
      jw: 'Kawicaksanan Privasi',
    },
    lencana: {
      id: '100% LOKAL · TANPA PELACAK',
      en: '100% ON-DEVICE · NO TRACKERS',
      jw: '100% LOKAL · TANPA PELACAK',
    },
    pengantar: {
      id: 'Kamera gestur, audio karawitan, serta progres belajar berjalan lokal di perangkat tanpa cookie pelacak.',
      en: 'Gesture tracking, gamelan audio synthesis, and learning progress stay local without tracking cookies.',
      jw: 'Kamera gestur, audio karawitan, lan progres pasinaon lumaku lokal ing piranti tanpa pelacak.',
    },
  },
  kontak: {
    judul: {
      id: 'Hubungi Kami',
      en: 'Contact Us',
      jw: 'Hubungi Kula',
    },
    lencana: {
      id: 'KORESPONDENSI RESMI',
      en: 'OFFICIAL CHANNELS',
      jw: 'KANAL RESMI',
    },
    pengantar: {
      id: 'Hubungi pengembang dan kurator teknis KELIR untuk koreksi arsip, riset, maupun dukungan teknis.',
      en: 'Reach the KELIR developer and curator for archival corrections, academic collaboration, or technical support.',
      jw: 'Hubungi pangembang lan kurator teknis KELIR kangge koreksi arsip, panaliten, utawi teknis.',
    },
  },
};

export const PASAL_SYARAT_KETENTUAN: PasalDokumenLegal[] = [
  {
    kode: 'PASAL 01',
    judul: {
      id: 'Tujuan Edukasi Non-Komersial',
      en: 'Non-Commercial Educational Scope',
      jw: 'Ancas Pasinaon Non-Komersial',
    },
    isi: {
      id: 'KELIR adalah eksibisi web edukatif nirlaba untuk pembelajaran sejarah, arsitektur Pendopo, pusaka 3D, aksara Jawa U+A980, dan budaya Nusantara.',
      en: 'KELIR is a non-commercial educational web platform built for Indonesian heritage study, 3D artifact exploration, and Javanese script learning.',
      jw: 'KELIR punika platform web edukatif nirlaba kangge pasinaon sejarah, pusaka 3D, aksara Jawi U+A980, lan budaya Nuswantara.',
    },
  },
  {
    kode: 'PASAL 02',
    judul: {
      id: 'Kekayaan Intelektual & Rujukan S1–S7',
      en: 'Intellectual Property & S1–S7 Attribution',
      jw: 'Kagungan Intelektual & Rujukan S1–S7',
    },
    isi: {
      id: 'Kode aplikasi, model 3D prosedural, dan sintesis audio dimiliki pengembang; rujukan historis bersumber dari UNESCO ICH, Kemdikbud RI, Museum Sonobudoyo, dan Perpusnas RI.',
      en: 'Application code, procedural 3D meshes, and audio synthesis belong to the developer; historical references cite UNESCO ICH, Kemdikbud RI, Sonobudoyo, and Perpusnas RI.',
      jw: 'Kode aplikasi, model 3D, lan sintesis audio kagungan pangembang; rujukan sejarah saking UNESCO ICH, Kemdikbud RI, Sonobudoyo, lan Perpusnas RI.',
    },
  },
  {
    kode: 'PASAL 03',
    judul: {
      id: 'Etika Penggunaan & Larangan',
      en: 'Fair Use & Prohibited Actions',
      jw: 'Etika Panggunaan & Larangan',
    },
    isi: {
      id: 'Pengunjung bebas mengunduh potret 3D dan Piagam Kurator dengan mencantumkan kredit KELIR, serta dilarang melakukan:',
      en: 'Visitors may download 3D snapshots and Curator Certificates with KELIR credit, and must refrain from:',
      jw: 'Pangguna kepareng ngundhuh potret 3D lan Piagam Kurator kanthi kredit KELIR, saha dipun-larang:',
    },
    butir: [
      {
        id: 'Scraping otomatis massal atau manipulasi batas laju layanan.',
        en: 'Automated mass scraping or bypassing API rate limits.',
        jw: 'Scraping otomatis utawi ngakali wates laju sistem.',
      },
      {
        id: 'Injeksi prompt (jailbreak) atau ekstraksi konfigurasi server pada AI Pamomong.',
        en: 'Prompt-injection attacks or server secret extraction attempts against Pamomong AI.',
        jw: 'Injeksi prompt (jailbreak) utawi njupuk rahasia server ing AI Pamomong.',
      },
      {
        id: 'Klaim komersial sepihak atas warisan budaya komunal Nusantara.',
        en: 'Misrepresenting communal Indonesian heritage as exclusive commercial property.',
        jw: 'Ngeklaim warisan budaya komunal dados kagungan komersial pribadi.',
      },
    ],
  },
  {
    kode: 'PASAL 04',
    judul: {
      id: 'Asisten AI Pamomong Nusantara',
      en: 'Pamomong Nusantara AI Disclaimer',
      jw: 'Asisten AI Pamomong Nusantara',
    },
    isi: {
      id: 'Penjelasan AI memadukan korpus kurasi S1–S7 dan pengetahuan Nusantara sebagai panduan belajar, bukan pengganti arsip manuskrip primer dalam sitasi akademik formal.',
      en: 'AI responses combine curated S1–S7 indexing with Nusantara knowledge as a study guide rather than a substitute for primary manuscripts.',
      jw: 'Wangsulan AI nggabungake indeks S1–S7 lan kawruh Nuswantara kangge pasinaon umum, sanes panggantos naskah manuskrip primer.',
    },
  },
  {
    kode: 'PASAL 05',
    judul: {
      id: 'Ketersediaan & Batas Tanggung Jawab',
      en: 'Service Availability & Liability',
      jw: 'Sumadyaning Layanan & Wates Jawab',
    },
    isi: {
      id: 'Platform disediakan sebagaimana adanya tanpa jaminan bebas gangguan jaringan pengguna, keterbatasan WebGL peramban lawas, atau pemeliharaan layanan AI.',
      en: 'KELIR is provided as-is without liability for client network drops, legacy WebGL hardware limits, or upstream AI downtime.',
      jw: 'Platform kacawisake miturut kawontenanipun tanpa tanggung jawab tumrap gangguan jaringan utawi watesan WebGL piranti lawas.',
    },
  },
  {
    kode: 'PASAL 06',
    judul: {
      id: 'Hukum Berlaku & Pembaruan',
      en: 'Governing Law & Updates',
      jw: 'Hukum Lumaku & Panganyaran',
    },
    isi: {
      id: 'Ketentuan ini tunduk pada hukum Republik Indonesia dan dapat diperbarui mengikuti pengembangan fitur KELIR.',
      en: 'These terms follow the laws of the Republic of Indonesia and may be updated as platform features evolve.',
      jw: 'Katentuan punika manut hukum Republik Indonesia lan saged kaanyarake nalika wonten fitur enggal.',
    },
  },
];

export const PASAL_KEBIJAKAN_PRIVASI: PasalDokumenLegal[] = [
  {
    kode: 'PRIVASI 01',
    judul: {
      id: 'Tanpa Akun & Penyimpanan Lokal',
      en: 'No Account & Local-Only Preferences',
      jw: 'Tanpa Akun & Simpenan Lokal',
    },
    isi: {
      id: 'KELIR bebas iklan dan tidak memerlukan akun; tema, bahasa, dan Paspor Jejak Kurasi (kelir_jejak_v1) tersimpan murni di localStorage perangkat Anda.',
      en: 'KELIR requires no sign-in and uses zero ad trackers; theme, language, and trail progress (kelir_jejak_v1) stay purely in localStorage.',
      jw: 'KELIR tanpa akun lan iklan; tema, basa, lan Paspor Jejak Kurasi (kelir_jejak_v1) kasimpen murni ing localStorage piranti panjenengan.',
    },
  },
  {
    kode: 'PRIVASI 02',
    judul: {
      id: 'Kamera Gestur 3D Lokal (MediaPipe)',
      en: 'On-Device Gesture Camera (MediaPipe)',
      jw: 'Kamera Gestur 3D Lokal (MediaPipe)',
    },
    isi: {
      id: 'Aliran webcam diproses lokal di memori peramban via MediaPipe Hands (21 titik tangan). Tidak ada foto atau video yang diunggah maupun disimpan ke server.',
      en: 'Webcam input runs strictly in browser memory via MediaPipe Hands (21 landmarks); zero frames or recordings ever leave your device.',
      jw: 'Kamera kaolah langsung ing memori peramban lumantar MediaPipe Hands (21 titik asta) tanpa ngirim foto utawi video menyang server.',
    },
  },
  {
    kode: 'PRIVASI 03',
    judul: {
      id: 'Audio & Render Piagam Klien-Sisi',
      en: 'Client-Side Audio & Certificate Render',
      jw: 'Audio & Render Piagam ing Piranti',
    },
    isi: {
      id: 'Sintesis Karawitan WebAudio, potret 3D, dan pencetakan nama Piagam Kurator diolah langsung di perangkat Anda tanpa pencatatan basis data.',
      en: 'Karawitan WebAudio synthesis, 3D PNG snapshots, and Curator Certificates render entirely client-side without database logging.',
      jw: 'Swara Karawitan, potret 3D, lan Piagam Kurator kaolah penuh ing piranti panjenengan tanpa cathetan server.',
    },
  },
  {
    kode: 'PRIVASI 04',
    judul: {
      id: 'Kueri Asisten AI Pamomong',
      en: 'Pamomong AI Query Handling',
      jw: 'Pangolahan Pitakenan AI Pamomong',
    },
    isi: {
      id: 'Teks pertanyaan budaya dikirim ke layanan Pamomong Nusantara hanya untuk menyusun jawaban dan audio; hindari memasukkan data sensitif pribadi.',
      en: 'Submitted cultural prompts are processed by Pamomong Nusantara solely to generate explanations and audio; avoid entering personal data.',
      jw: 'Teks pitakenan budaya kakirim dhateng Pamomong Nusantara namung kangge damel wangsulan; sampun nglebokake data pribadi rahasia.',
    },
  },
  {
    kode: 'PRIVASI 05',
    judul: {
      id: 'Kendali Hapus Data Pengguna',
      en: 'Full User Control & Data Removal',
      jw: 'Kendali & Pambusakan Data',
    },
    isi: {
      id: 'Anda bebas mencabut izin kamera atau menghapus data situs peramban kapan saja. Pertanyaan privasi dapat diarahkan ke nawfalirfan005@gmail.com.',
      en: 'You may revoke camera access or clear browser site storage at any time, or send privacy inquiries to nawfalirfan005@gmail.com.',
      jw: 'Panjenengan saged mateni izin kamera utawi mbusak data situs kapan mawon, utawi ngirim pitakenan menyang nawfalirfan005@gmail.com.',
    },
  },
];

export const KONTAK_PENGELOLA: KanalKontakResmi[] = [
  {
    id: 'email',
    label: {
      id: 'EMAIL RESMI',
      en: 'OFFICIAL EMAIL',
      jw: 'EMAIL RESMI',
    },
    nilai: 'nawfalirfan005@gmail.com',
    tautan: 'mailto:nawfalirfan005@gmail.com?subject=KELIR%20-%20Korespondensi',
    eksternal: false,
    dapatDisalin: true,
    keterangan: {
      id: 'Kurasi arsip, koreksi pustaka & kemitraan.',
      en: 'Archival curation, references & partnerships.',
      jw: 'Kurasi arsip, koreksi pustaka & kemitraan.',
    },
  },
  {
    id: 'website',
    label: {
      id: 'WEBSITE & PORTOFOLIO',
      en: 'WEBSITE & PORTFOLIO',
      jw: 'WEBSITE & PORTOFOLIO',
    },
    nilai: 'https://nawfal.vercel.app',
    tautan: 'https://nawfal.vercel.app',
    eksternal: true,
    dapatDisalin: true,
    keterangan: {
      id: 'Profil pengembang & karya rekayasa 3D/AI.',
      en: 'Developer profile & interactive 3D/AI works.',
      jw: 'Profil pangembang & karya rekayasa 3D/AI.',
    },
  },
  {
    id: 'instagram',
    label: {
      id: 'INSTAGRAM',
      en: 'INSTAGRAM',
      jw: 'INSTAGRAM',
    },
    nilai: '@nawfaljr__',
    tautan: 'https://www.instagram.com/nawfaljr__/',
    eksternal: true,
    dapatDisalin: false,
    keterangan: {
      id: 'Pesan langsung & pembaruan fitur KELIR.',
      en: 'Direct messages & KELIR feature updates.',
      jw: 'Pesen langsung & warta fitur KELIR.',
    },
  },
];

export const TOPIK_KORESPONDENSI: TopikKorespondensi[] = [
  {
    kode: '01',
    judul: {
      id: 'Koreksi Kurasi Budaya',
      en: 'Cultural Reference Audit',
      jw: 'Koreksi Kurasi Budaya',
    },
    ringkas: {
      id: 'Istilah daerah, Hanacaraka, laras gending, atau artefak.',
      en: 'Regional terms, Javanese script, gamelan tuning, or artifacts.',
      jw: 'Istilah dhaerah, Hanacaraka, notasi gending, utawi pusaka.',
    },
  },
  {
    kode: '02',
    judul: {
      id: 'Riset & Institusi',
      en: 'Academic & Museums',
      jw: 'Panaliten & Institusi',
    },
    ringkas: {
      id: 'Pameran sekolah, riset mahasiswa & dokumentasi museum.',
      en: 'School showcases, academic research & museum archives.',
      jw: 'Pameran sekolah, panaliten & dokumentasi museum.',
    },
  },
  {
    kode: '03',
    judul: {
      id: 'Teknis & Privasi',
      en: 'Technical & Privacy',
      jw: 'Teknis & Privasi',
    },
    ringkas: {
      id: 'Kendala WebGL, aksesibilitas, atau pertanyaan privasi data.',
      en: 'WebGL bugs, accessibility improvements, or privacy inquiries.',
      jw: 'Kendala WebGL, aksesibilitas, utawi pitakenan privasi.',
    },
  },
];

export const KONTAK_META_TEKS = {
  roleBadge: {
    id: 'PENGEMBANG & KURATOR · NAWFAL IRFAN',
    en: 'DEVELOPER & CURATOR · NAWFAL IRFAN',
    jw: 'PANGEMBANG & KURATOR · NAWFAL IRFAN',
  } satisfies MultiTeks,
  slaCatatan: {
    id: 'Respons email 1–2 hari kerja',
    en: 'Email reply in 1–2 business days',
    jw: 'Wangsulan email 1–2 dinten kerja',
  } satisfies MultiTeks,
  bukaKanal: {
    id: 'Buka ↗',
    en: 'Open ↗',
    jw: 'Bukak ↗',
  } satisfies MultiTeks,
  kirimEmail: {
    id: 'Email ↗',
    en: 'Email ↗',
    jw: 'Email ↗',
  } satisfies MultiTeks,
  salin: {
    id: 'Salin',
    en: 'Copy',
    jw: 'Salin',
  } satisfies MultiTeks,
  tersalin: {
    id: 'Tersalin ✓',
    en: 'Copied ✓',
    jw: 'Kasalina ✓',
  } satisfies MultiTeks,
  tutupModal: {
    id: 'Tutup ✕',
    en: 'Close ✕',
    jw: 'Tutup ✕',
  } satisfies MultiTeks,
  footerCredit: {
    id: 'KELIR Spatial Heritage Archive · Nawfal Irfan',
    en: 'KELIR Spatial Heritage Archive · Nawfal Irfan',
    jw: 'KELIR Spatial Heritage Archive · Nawfal Irfan',
  } satisfies MultiTeks,
};
