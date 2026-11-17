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
    id: 'PUSAT TATA KELOLA, PRIVASI & KONTAK · KELIR ꦏꦼꦭꦶꦂ',
    en: 'GOVERNANCE, PRIVACY & CONTACT CENTER · KELIR ꦏꦼꦭꦶꦂ',
    jw: 'PUSAT TATA KELOLA, PRIVASI & KONTAK · KELIR ꦏꦼꦭꦶꦂ',
  } satisfies MultiTeks,
  tanggalBerlaku: {
    id: 'Diperbarui: November 2026 · Versi Kurasi 1.4',
    en: 'Updated: November 2026 · Curation Version 1.4',
    jw: 'Kaanyarake: November 2026 · Versi Kurasi 1.4',
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
      id: 'Syarat & Ketentuan Penggunaan KELIR',
      en: 'KELIR Terms & Conditions of Use',
      jw: 'Sarat & Katentuan Panggunaan KELIR',
    },
    lencana: {
      id: 'EDUKATIF · NON-KOMERSIAL · RUJUKAN S1–S7',
      en: 'EDUCATIONAL · NON-COMMERCIAL · S1–S7 ARCHIVES',
      jw: 'EDUKATIF · NON-KOMERSIAL · RUJUKAN S1–S7',
    },
    pengantar: {
      id: 'Dokumen ini mengatur hak akses, etika penggunaan ilmiah, perlindungan kekayaan intelektual, serta batas layanan pada eksibisi spasial 3D dan asisten budaya KELIR.',
      en: 'These terms govern access rights, scholarly usage etiquette, intellectual property protections, and service boundaries for the KELIR 3D spatial exhibition and cultural assistant.',
      jw: 'Dhokumen punika ngatur hak akses, etika pasinaon ilmiah, pangreksan kagungan intelektual, saha wates layanan ing eksibisi spasial 3D lan asisten budaya KELIR.',
    },
  },
  privasi: {
    judul: {
      id: 'Kebijakan Privasi & Keamanan Data Lokal',
      en: 'Privacy Policy & Local-First Data Protection',
      jw: 'Kawicaksanan Privasi & Keamanan Data Lokal',
    },
    lencana: {
      id: '100% PEMROSESAN LOKAL · TANPA AKUN WAJIB',
      en: '100% LOCAL DEVICE PROCESSING · NO ACCOUNT REQUIRED',
      jw: '100% PROSES LOKAL · TANPA AKUN WAJIB',
    },
    pengantar: {
      id: 'KELIR dibangun dengan prinsip minimisasi data: kamera gestur, audio karawitan, ekspor sertifikat, serta riwayat belajar diproses langsung pada peramban Anda tanpa pelacakan iklan pihak ketiga.',
      en: 'KELIR is engineered around strict data minimization: gesture tracking, gamelan synthesis, certificate exports, and learning history are processed locally in your browser without ad-tech tracking.',
      jw: 'KELIR karancang kanthi prinsip minimisasi data: kamera gestur, swara karawitan, ekspor piagam, saha cathetan pasinaon lumaku langsung ing peramban panjenengan tanpa pelacakan iklan.',
    },
  },
  kontak: {
    judul: {
      id: 'Hubungi Pengelola & Pengembang KELIR',
      en: 'Contact KELIR Developer & Technical Curator',
      jw: 'Hubungi Pangelola & Pangembang KELIR',
    },
    lencana: {
      id: 'RESPON RESMI · KORESPONDENSI LANGSUNG',
      en: 'DIRECT CORRESPONDENCE · VERIFIED CHANNELS',
      jw: 'WANGSULAN RESMI · KANAL LANGSUNG',
    },
    pengantar: {
      id: 'Kami terbuka terhadap saran kuratorial warisan budaya Nusantara, masukan teknis maupun aksesibilitas, serta kerja sama riset, pendidikan, dan institusi kebudayaan.',
      en: 'We welcome curatorial feedback on Indonesian cultural heritage, technical or accessibility reports, and collaborations across research, education, and cultural institutions.',
      jw: 'Kula tinarbuka tumrap pamrayogi kurasi warisan budaya Nuswantara, lapuran teknis saha aksesibilitas, tuwin kerja sama panaliten, pamulangan, lan institusi kabudayan.',
    },
  },
};

export const PASAL_SYARAT_KETENTUAN: PasalDokumenLegal[] = [
  {
    kode: 'PASAL 01',
    judul: {
      id: 'Ruang Lingkup Layanan & Tujuan Edukasi',
      en: 'Scope of Service & Educational Purpose',
      jw: 'Jembar Layanan & Ancas Pamulangan',
    },
    isi: {
      id: 'KELIR (Spatial Heritage Archive) adalah aplikasi web edukatif nirlaba yang menyajikan diorama arsitektur Pendopo, bedah anatomi 3D pusaka (Keris, Saron, Batik Kawung, Joglo, Wayang Purwa), panggung Pakeliran, laboratorium Aksara Jawa U+A980, serta asisten kuratorial AI. Dengan mengakses situs ini, pengunjung menyetujui pemanfaatan fitur secara wajar untuk pembelajaran, riset, dan apresiasi budaya.',
      en: 'KELIR (Spatial Heritage Archive) is a non-commercial educational web platform presenting Pendopo architectural dioramas, 3D artifact dissection, Pakeliran shadow theatre, a Javanese script U+A980 laboratory, and a cultural AI assistant for learning, research, and heritage appreciation.',
      jw: 'KELIR punika platform web edukatif nirlaba ingkang nyawisake diorama Pendhapa, bedhah anatomi 3D pusaka, panggung Pakeliran, laboratorium Aksara Jawi U+A980, lan asisten AI kabudayan kangge pasinaon saha panaliten.',
    },
  },
  {
    kode: 'PASAL 02',
    judul: {
      id: 'Kekayaan Intelektual, Kode & Atribusi Sumber Primer (S1–S7)',
      en: 'Intellectual Property & Primary Archive Attribution (S1–S7)',
      jw: 'Kagungan Intelektual & Atribusi Pustaka Primer (S1–S7)',
    },
    isi: {
      id: 'Seluruh kode antarmuka, geometri WebGL prosedural, sintesis audio Karawitan WebAudio, dan penyusunan naskah digital merupakan karya pengembang KELIR. Pengetahuan historis warisan budaya tetap menjadi milik publik/komunal serta dirujukkan secara transparan kepada UNESCO ICH, Kemdikbud RI, Museum Sonobudoyo, Perpustakaan Nasional RI, dan Konsorsium Unicode.',
      en: 'All application code, procedural WebGL meshes, synthesized WebAudio acoustics, and curated UI copy remain the intellectual work of the KELIR developer, while traditional heritage knowledge is attributed to public institutions (UNESCO ICH, Indonesian Ministry of Culture, Sonobudoyo Museum, National Library RI, and the Unicode Consortium).',
      jw: 'Sedaya kode antarmuka, geometri WebGL prosedural, sintesis swara Karawitan, lan naskah kuratorial minangka karya pangembang KELIR, dene kawruh tradisi kapundhut kanthi jujur saking UNESCO ICH, Kemdikbud RI, Museum Sonobudoyo, lan Perpusnas RI.',
    },
  },
  {
    kode: 'PASAL 03',
    judul: {
      id: 'Etika Akses & Larangan Penyalahgunaan Sistem',
      en: 'Fair Use Etiquette & Prohibited Conduct',
      jw: 'Etika Panggunaan & Larangan Tumindak Ala',
    },
    isi: {
      id: 'Pengguna diperbolehkan mengunduh potret 3D (.png) maupun Piagam Kurator untuk kepentingan tugas akademik atau portofolio non-komersial dengan mencantumkan kredit KELIR. Pengguna dilarang keras melakukan hal-hal berikut:',
      en: 'Visitors may download 3D studio portraits (.png) and Curator Certificates for non-commercial academic or educational use with proper attribution. Visitors are strictly prohibited from:',
      jw: 'Pangguna dipun-parengake ngundhuh potret 3D (.png) utawi Piagam Kurator kangge kaperluan pasinaon non-komersial kanthi nyebataken kredit KELIR, lan dipun-larang tumindak ing ngandhap punika:',
    },
    butir: [
      {
        id: 'Melakukan penarikan data otomatis massal (scraping), serangan beban berlebih (DoS), atau manipulasi pembatas laju permintaan AI.',
        en: 'Executing automated mass scraping, denial-of-service floods, or bypassing AI rate limits.',
        jw: 'Nindakake scraping data massal, serangan beban server, utawi ngakali wates laju AI.',
      },
      {
        id: 'Mengirimkan injeksi prompt (jailbreak), ekstraksi rahasia lingkungan server, maupun muatan kode berbahaya ke antarmuka Asisten Pamomong.',
        en: 'Submitting prompt-injection attacks, system-secret extraction attempts, or malicious payloads to the Pamomong AI endpoints.',
        jw: 'Ngirim injeksi prompt (jailbreak), upaya njupuk rahasia sistem, utawi skrip ala menyang Asisten Pamomong.',
      },
      {
        id: 'Mengklaim materi kurasi maupun karya budaya kolektif Nusantara sebagai hak eksklusif komersial tanpa dasar hukum yang sah.',
        en: 'Misrepresenting curated materials or communal Indonesian cultural heritage as exclusive commercial property.',
        jw: 'Ngeklaim materi kurasi utawi warisan budaya komunal Nuswantara minangka kagungan komersial pribadi.',
      },
    ],
  },
  {
    kode: 'PASAL 04',
    judul: {
      id: 'Layanan Asisten AI Budaya Nusantara (Pamomong Nusantara)',
      en: 'Cultural AI Assistant Disclaimer (Pamomong Nusantara)',
      jw: 'Layanan Asisten AI Budaya Nuswantara (Pamomong Nusantara)',
    },
    isi: {
      id: 'Asisten Pamomong & AI Studio memanfaatkan agen AI Pamomong Nusantara dan korpus lokal terindeks BM25 guna memberikan penjelasan lintas budaya Nusantara. Khusus topik di luar 6 koleksi spesimen inti museum, AI berstatus Eksplorasi Nusantara dan tidak menggantikan konsultasi arsip fisik apabila dikutip dalam publikasi ilmiah tingkat lanjut.',
      en: 'The Pamomong Assistant & AI Studio combines the Pamomong Nusantara AI agent with a local BM25 S1–S7 corpus to support nationwide Indonesian cultural inquiry. General Nusantara explorations outside the six core specimens serve as educational synthesis rather than formal primary manuscript citations.',
      jw: 'Asisten Pamomong & AI Studio nggunakake agen AI Pamomong Nusantara lan indeks BM25 kangge njlentrehake kabudayan Nuswantara. Topik njabaning enem koleksi inti museum kalebu Eksplorasi Nuswantara kangge pasinaon umum.',
    },
  },
  {
    kode: 'PASAL 05',
    judul: {
      id: 'Ketersediaan Platform & Batas Tanggung Jawab',
      en: 'Service Availability & Limitation of Liability',
      jw: 'Sumadyaning Layanan & Wates Tanggung Jawab',
    },
    isi: {
      id: 'KELIR disediakan dalam kondisi "sebagaimana adanya" (as-is). Pengembang senantiasa menjaga ketepatan teknis dan keakuratan materi, namun tidak bertanggung jawab atas gangguan jaringan perangkat pengguna, keterbatasan WebGL pada GPU lawas, maupun pemeliharaan layanan AI eksternal.',
      en: 'KELIR is provided "as-is". While reasonable care is taken to maintain accuracy and stability, the maintainer is not liable for client-side network outages, legacy GPU WebGL limitations, or upstream AI API maintenance windows.',
      jw: 'KELIR kacawisake miturut kawontenanipun (as-is). Pangembang tansah njagi kaleresan materi, nanging boten tanggung jawab tumrap gangguan jaringan pangguna utawi watesan GPU piranti lawas.',
    },
  },
  {
    kode: 'PASAL 06',
    judul: {
      id: 'Hukum yang Berlaku & Pembaruan Syarat',
      en: 'Governing Law & Amendments',
      jw: 'Hukum ingkang Lumaku & Panganyaran Sarat',
    },
    isi: {
      id: 'Ketentuan ini ditafsirkan selaras dengan peraturan perundang-undangan Republik Indonesia (termasuk ketentuan ITE dan Pemajuan Kebudayaan). Pengelola berhak menyempurnakan isi dokumen sewaktu-waktu seiring penambahan fitur baru.',
      en: 'These terms are governed by the applicable laws of the Republic of Indonesia. The maintainer reserves the right to refine these provisions whenever platform capabilities evolve.',
      jw: 'Katentuan punika katurut miturut pranatan hukum Republik Indonesia. Pangelola gadhah hak nganyari isi dhokumen nalika wonten tambahan fitur enggal.',
    },
  },
];

export const PASAL_KEBIJAKAN_PRIVASI: PasalDokumenLegal[] = [
  {
    kode: 'PRIVASI 01',
    judul: {
      id: 'Penyimpanan Lokal & Preferensi Pengunjung',
      en: 'Local Storage & Visitor Preferences Only',
      jw: 'Panyimpenan Lokal & Preferensi Pangguna',
    },
    isi: {
      id: 'KELIR tidak mewajibkan pendaftaran akun, tidak memasang cookie iklan, dan tidak menjual data perilaku pengguna. Preferensi tema (Terang/Malam), pilihan bahasa (ID/EN/JW/AKS), skala keterbacaan, serta Paspor Jejak Kurasi (kelir_jejak_v1) disimpan murni di localStorage peramban perangkat Anda.',
      en: 'KELIR requires no user accounts, uses zero advertising cookies, and never sells telemetry. Theme preferences, language selection, text-scaling settings, and Curator Trail progress (kelir_jejak_v1) reside solely in your browser localStorage.',
      jw: 'KELIR boten mbetahake akun, boten masang cookie iklan, lan boten sadean data. Pilihan tema, basa, skala teks, saha Paspor Jejak Kurasi (kelir_jejak_v1) kasimpen murni ing localStorage piranti panjenengan.',
    },
  },
  {
    kode: 'PRIVASI 02',
    judul: {
      id: 'Kamera Gestur 3D Berjalan 100% di Perangkat (MediaPipe)',
      en: '100% On-Device 3D Gesture Camera Processing',
      jw: 'Kamera Gestur 3D Lumaku 100% ing Piranti (MediaPipe)',
    },
    isi: {
      id: 'Apabila Anda mengaktifkan fitur Gestur 3D, aliran kamera hanya diproses secara real-time di dalam memori peramban melalui MediaPipe Hands untuk membaca 21 koordinat sendi tangan. Tidak ada gambar, tangkapan wajah, maupun rekaman video yang pernah diunggah, dikirim ke jaringan, atau disimpan ke server.',
      en: 'When you opt into 3D Gesture control, the webcam stream is analyzed strictly in local browser memory via MediaPipe Hands (21 landmark coordinates). Zero video frames, snapshots, or biometric records ever leave your device.',
      jw: 'Menawi fitur Gestur 3D kaaktifake, kamera namung kaolah langsung ing memori peramban lumantar MediaPipe Hands (21 titik sendi asta). Boten wonten gambar utawi video ingkang kakirim menyang server.',
    },
  },
  {
    kode: 'PRIVASI 03',
    judul: {
      id: 'Sintesis Audio WebAudio & Render Sertifikat Lokal',
      en: 'Client-Side WebAudio & PNG Certificate Rendering',
      jw: 'Swara WebAudio saha Render Piagam PNG Lokal',
    },
    isi: {
      id: 'Permainan wilah Gamelan Saron, 8 repertoar Karawitan latar, ekspor potret 3D (.png), dan pencetakan nama pada Piagam Kurator diproses seluruhnya pada Canvas dan WebAudio perangkat Anda tanpa mencatat identitas pribadi ke basis data.',
      en: 'Saron acoustics, 8 classical Karawitan tracks, 3D portrait PNG snapshots, and your visitor name on the Curator Certificate are rendered exclusively client-side via WebAudio and HTML5 Canvas without server-side logging.',
      jw: 'Unining wilah Saron, 8 gending Karawitan, undhuhan potret 3D (.png), lan pangecapan asma ing Piagam Kurator kaolah penuh ing piranti panjenengan tanpa mlebet basis data.',
    },
  },
  {
    kode: 'PRIVASI 04',
    judul: {
      id: 'Pemrosesan Kueri Asisten AI & Pagar Keamanan',
      en: 'Cultural AI Query Transmission & Privacy Guardrails',
      jw: 'Pangolahan Pitakenan AI Budaya & Pagar Keamanan',
    },
    isi: {
      id: 'Saat Anda mengirimkan pertanyaan atau tema pada Asisten Pamomong dan AI Studio, teks kueri budaya, mode analisis, dan bahasa terpilih dikirim ke mesin inferensi Pamomong Nusantara untuk menghasilkan jawaban maupun audio narasi. Mohon tidak memasukkan informasi sensitif pribadi (NIK, kata sandi, nomor rekening) ke kolom kueri budaya.',
      en: 'When you submit a cultural question or prompt to Pamomong AI or AI Studio, only the cultural prompt text, active tool mode, and language preference are sent to the Pamomong Nusantara inference service. Please avoid entering personal sensitive identifiers in cultural query fields.',
      jw: 'Nalika panjenengan ngirim pitakenan kabudayan dhateng Asisten Pamomong saha AI Studio, namung teks pitakenan budaya, mode, lan basa ingkang kakirim menyang layanan Pamomong Nusantara. Nyuwun sampun nglebokake data pribadi rahasia ing kolom pitakenan.',
    },
  },
  {
    kode: 'PRIVASI 05',
    judul: {
      id: 'Kendali Penuh & Penghapusan Data Pengguna',
      en: 'User Control & Data Deletion Rights',
      jw: 'Kendali Pangguna & Hak Pambusakan Data',
    },
    isi: {
      id: 'Anda memegang kendali penuh untuk mematikan izin kamera dari bilah alamat peramban kapan saja, menghentikan suara Karawitan melalui panel kontrol audio, serta membersihkan seluruh riwayat kurasi lewat fitur Hapus Data Situs / localStorage peramban. Pertanyaan privasi lebih lanjut dapat disampaikan ke nawfalirfan005@gmail.com.',
      en: 'You retain full control to revoke camera permissions from your browser settings at any time, mute audio playback, and clear all locally stored learning history by clearing browser site storage. Privacy inquiries may be sent directly to nawfalirfan005@gmail.com.',
      jw: 'Panjenengan gadhah kendali penuh mateni izin kamera ing peramban, nyimpen utawi mbusak riwayat lokal ing panyimpenan situs. Pitakenan bab privasi saged kakirim menyang nawfalirfan005@gmail.com.',
    },
  },
];

export const KONTAK_PENGELOLA: KanalKontakResmi[] = [
  {
    id: 'email',
    label: {
      id: 'EMAIL RESMI / CONTACT PERSON',
      en: 'OFFICIAL EMAIL / CONTACT PERSON',
      jw: 'EMAIL RESMI / CONTACT PERSON',
    },
    nilai: 'nawfalirfan005@gmail.com',
    tautan:
      'mailto:nawfalirfan005@gmail.com?subject=KELIR%20%E2%80%94%20Korespondensi%20Kurasi%20%26%20Teknis',
    eksternal: false,
    dapatDisalin: true,
    keterangan: {
      id: 'Korespondensi kurasi arsip, koreksi referensi, kerja sama institusi & pertanyaan privasi/ketentuan.',
      en: 'Archival curation, reference corrections, institutional partnerships & legal/privacy inquiries.',
      jw: 'Korespondensi kurasi arsip, koreksi rujukan, kerja sama institusi & pitakenan privasi/katentuan.',
    },
  },
  {
    id: 'website',
    label: {
      id: 'WEBSITE & PORTOFOLIO RESMI',
      en: 'OFFICIAL WEBSITE & PORTFOLIO',
      jw: 'WEBSITE & PORTOFOLIO RESMI',
    },
    nilai: 'https://nawfal.vercel.app',
    tautan: 'https://nawfal.vercel.app',
    eksternal: true,
    dapatDisalin: true,
    keterangan: {
      id: 'Kunjungi profil pengembang, portofolio rekayasa web interaktif 3D/AI, dan proyek terkait.',
      en: 'Visit the developer profile, interactive 3D/AI engineering portfolio, and related works.',
      jw: 'Pirsani profil pangembang, portofolio rekayasa web interaktif 3D/AI, lan karya sanesipun.',
    },
  },
  {
    id: 'instagram',
    label: {
      id: 'INSTAGRAM PENGEMBANG',
      en: 'DEVELOPER INSTAGRAM',
      jw: 'INSTAGRAM PANGEMBANG',
    },
    nilai: '@nawfaljr__',
    tautan: 'https://www.instagram.com/nawfaljr__/',
    eksternal: true,
    dapatDisalin: false,
    keterangan: {
      id: 'Pesan langsung (DM), apresiasi visual, dan pembaruan pengembangan fitur KELIR.',
      en: 'Direct messages, visual showcase updates, and ongoing KELIR feature announcements.',
      jw: 'Pesen langsung (DM), apresiasi visual, lan warta pangembangan fitur KELIR.',
    },
  },
];

export const TOPIK_KORESPONDENSI: TopikKorespondensi[] = [
  {
    kode: '01',
    judul: {
      id: 'Koreksi Referensi & Kurasi Budaya',
      en: 'Cultural Curation & Reference Audit',
      jw: 'Koreksi Rujukan & Kurasi Budaya',
    },
    ringkas: {
      id: 'Masukan istilah daerah, transliterasi Hanacaraka, notasi laras karawitan, maupun usulan artefak baru.',
      en: 'Feedback on regional terminology, Javanese script orthography, gamelan tuning, or new artifact nominations.',
      jw: 'Pamrayogi istilah dhaerah, aksara Hanacaraka, notasi gending, utawi usulan pusaka enggal.',
    },
  },
  {
    kode: '02',
    judul: {
      id: 'Kolaborasi Pendidikan & Museum',
      en: 'Academic & Museum Collaboration',
      jw: 'Kolaborasi Pamulangan & Museum',
    },
    ringkas: {
      id: 'Integrasi eksibisi spasial untuk riset mahasiswa, pameran sekolah, maupun dokumentasi museum daerah.',
      en: 'Deploying spatial exhibitions for academic research, school workshops, or regional museum showcases.',
      jw: 'Kerja sama pameran digital kangge panaliten mahasiswa, sekolah, utawi museum dhaerah.',
    },
  },
  {
    kode: '03',
    judul: {
      id: 'Dukungan Teknis & Privasi',
      en: 'Technical, Accessibility & Privacy Support',
      jw: 'Dhukungan Teknis & Privasi',
    },
    ringkas: {
      id: 'Laporan bug WebGL lintas perangkat, peningkatan aksesibilitas pembaca layar, atau permintaan terkait privasi data.',
      en: 'Cross-device WebGL bug reports, screen-reader accessibility improvements, or privacy-related requests.',
      jw: 'Lapuran bug WebGL lintas piranti, peningkatan aksesibilitas, utawi panyuwunan bab privasi data.',
    },
  },
];

export const KONTAK_META_TEKS = {
  roleBadge: {
    id: 'PENGEMBANG & KURATOR TEKNIS · NAWFAL IRFAN',
    en: 'LEAD DEVELOPER & TECHNICAL CURATOR · NAWFAL IRFAN',
    jw: 'PANGEMBANG & KURATOR TEKNIS · NAWFAL IRFAN',
  } satisfies MultiTeks,
  slaCatatan: {
    id: 'Estimasi respons korespondensi email profesional: 1–2 hari kerja.',
    en: 'Estimated professional email response window: 1–2 business days.',
    jw: 'Kinten-kinten wangsulan email profesional: 1–2 dinten nyambut damel.',
  } satisfies MultiTeks,
  bukaKanal: {
    id: 'Buka Tautan ↗',
    en: 'Open Link ↗',
    jw: 'Bukak Tautan ↗',
  } satisfies MultiTeks,
  kirimEmail: {
    id: 'Kirim Email ↗',
    en: 'Send Email ↗',
    jw: 'Kirim Email ↗',
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
    id: 'KELIR Spatial Heritage Archive · Dikelola oleh Nawfal Irfan',
    en: 'KELIR Spatial Heritage Archive · Maintained by Nawfal Irfan',
    jw: 'KELIR Spatial Heritage Archive · Kalola dening Nawfal Irfan',
  } satisfies MultiTeks,
};
