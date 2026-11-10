import { latinToAksara } from '../lib/aksara';

export type BahasaMode = 'id' | 'jv' | 'aksara';
export type StatusTinjauan = 'ditinjau' | 'draf';

export interface TeksJawa {
  teks: string;
  ejaanAksara: string;
  status: StatusTinjauan;
  catatanStatus: string;
}

export interface TeksMultibahasa {
  id: string;
  jv: TeksJawa;
}

export interface SumberRujukan {
  kode: string;
  judul: string;
  lembaga: string;
  tahun: string;
  url: string;
  ringkasan: string;
}

export interface LisensiAset {
  id: string;
  nama: string;
  dipakaiDi: string;
  pembuat: string;
  sumberUrl: string;
  lisensi: string;
}

export interface TitikInfoBenda {
  id: string;
  label: TeksMultibahasa;
  posisi3D: [number, number, number];
  kameraTarget: [number, number, number];
  uraian: TeksMultibahasa;
  sumber: string[];
}

export interface BendaPusaka {
  id: 'keris' | 'saron' | 'wayang';
  nama: TeksMultibahasa;
  subjudul: TeksMultibahasa;
  kategori: string;
  tahunUnesco: string;
  berkasUnesco: string;
  ringkasan: TeksMultibahasa;
  peranPanggung: string;
  lisensiRef: string;
  sumber: string[];
  titikInfo: TitikInfoBenda[];
}

export interface BabakLakon {
  nomor: number;
  judul: TeksMultibahasa;
  narasi: TeksMultibahasa;
  petunjukDalang: string;
  posisiAwalRama: number;
  posisiAwalKidang: number;
  sumber: string[];
}

export interface LakonWayang {
  id: string;
  judul: TeksMultibahasa;
  subjudul: TeksMultibahasa;
  eposAsal: string;
  tokohKanan: string;
  tokohKiri: string;
  sumber: string[];
  babak: BabakLakon[];
}

export const DAFTAR_SUMBER: SumberRujukan[] = [
  {
    kode: 'S1',
    judul: 'Indonesian Kris (Berkas 00112)',
    lembaga: 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity',
    tahun: '2005 / 2008',
    url: 'https://ich.unesco.org/en/RL/indonesian-kris-00112',
    ringkasan:
      'Keris Indonesia diproklamasikan oleh UNESCO pada tahun 2005 dan dicantumkan dalam Daftar Representatif pada tahun 2008 sebagai belati asimetris yang memiliki fungsi fisik sekaligus nilai spiritual serta ditempa oleh empu melalui teknik lipat logam (pamor).',
  },
  {
    kode: 'S2',
    judul: 'Gamelan (Berkas 01760)',
    lembaga: 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity',
    tahun: '2021',
    url: 'https://ich.unesco.org/en/RL/gamelan-01760',
    ringkasan:
      'Ansambel perkusi tradisional Indonesia yang terdiri atas bilah dan pencon logam tempa, kendang, rebab, dan suling; relief instrumennya tercatat sejak abad ke-8 di Candi Borobudur dan ditetapkan UNESCO pada Desember 2021.',
  },
  {
    kode: 'S3',
    judul: 'Wayang puppet theatre (Berkas 00063)',
    lembaga: 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity',
    tahun: '2003 / 2008',
    url: 'https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063',
    ringkasan:
      'Teater boneka bayangan Jawa (wayang kulit) dan kayu (wayang golek) yang dimainkan oleh dalang di depan layar bercahaya dengan iringan gamelan, mengisahkan epos Ramayana, Mahabharata, dan cerita lokal.',
  },
  {
    kode: 'S4',
    judul: 'Koleksi Etnografi & Historika Museum Negeri Sonobudoyo',
    lembaga: 'Dinas Kebudayaan (Kundha Kabudayan) Daerah Istimewa Yogyakarta',
    tahun: '1935 / 2026',
    url: 'https://sonobudoyo.jogjaprov.go.id',
    ringkasan:
      'Museum sejarah dan kebudayaan Jawa di Jl. Pangurakan No. 6 Yogyakarta (diresmikan 6 November 1935, dirancang Ir. Thomas Karsten) yang menyimpan dan mendokumentasikan koleksi keris, perangkat gamelan, dan wayang kulit purwa.',
  },
  {
    kode: 'S5',
    judul: 'Ramayana (Aranya Kanda: Maricha and the Golden Deer)',
    lembaga: 'Encyclopaedia Britannica',
    tahun: '2024',
    url: 'https://www.britannica.com/topic/Ramayana-Indian-epic',
    ringkasan:
      'Dokumentasi episode penculikan Sita di hutan Dandaka ketika raksasa Marica berubah menjadi kijang emas berkilau perak untuk memancing Rama menjauh dari pertapaan dan menirukan teriakan suara Rama saat terpanah.',
  },
  {
    kode: 'S6',
    judul: 'The Unicode Standard: Javanese Block (U+A980–U+A9DF)',
    lembaga: 'The Unicode Consortium',
    tahun: '2023',
    url: 'https://www.unicode.org/charts/PDF/UA980.pdf',
    ringkasan:
      'Spesifikasi pengodean karakter Aksara Jawa yang mencakup 20 aksara nglegena, sandhangan swara, sandhangan panyigeg wanda, pangkon, dan tanda baca pada.',
  },
];

export const DAFTAR_LISENSI: LisensiAset[] = [
  {
    id: 'G1',
    nama: 'Geometri 3D Prosedural Keris Jawa (wilah, ganja, pamor, hulu, warangka)',
    dipakaiDi: 'Ruang Pegang 3D',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G2',
    nama: 'Geometri 3D Prosedural Saron Gamelan (wilah perunggu, rancakan, tabuh)',
    dipakaiDi: 'Ruang Pegang 3D',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G3',
    nama: 'Geometri 3D Prosedural Wayang Kulit Purwa & Panggung Kelir',
    dipakaiDi: 'Ruang Pegang 3D & Panggung Kelir',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/WayangStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'F1',
    nama: 'Font Noto Sans Javanese',
    dipakaiDi: 'Render Aksara Jawa (U+A980–U+A9DF)',
    pembuat: 'Google & Monotype',
    sumberUrl: 'https://fontsource.org/fonts/noto-sans-javanese',
    lisensi: 'SIL Open Font License (OFL) 1.1',
  },
  {
    id: 'F2',
    nama: 'Font Fraunces Variable & Atkinson Hyperlegible',
    dipakaiDi: 'Tipografi Judul & Isi Antarmuka',
    pembuat: 'Undercase Type & Braille Institute of America',
    sumberUrl: 'https://fontsource.org',
    lisensi: 'SIL Open Font License (OFL) 1.1',
  },
  {
    id: 'M1',
    nama: 'MediaPipe Tasks Vision + Hand Landmarker Model',
    dipakaiDi: 'Pelacakan Tangan Lokal di Browser',
    pembuat: 'Google',
    sumberUrl: 'https://www.npmjs.com/package/@mediapipe/tasks-vision',
    lisensi: 'Apache License 2.0',
  },
];

const CATATAN_DRAF_JAWA =
  'Draf terjemahan Bahasa Jawa Krama; menunggu verifikasi akhir penutur ahli Bahasa Jawa.';

export const DAFTAR_BENDA: BendaPusaka[] = [
  {
    id: 'keris',
    nama: {
      id: 'Keris Jawa',
      jv: {
        teks: 'Dhuwung Jawi (Keris)',
        ejaanAksara: 'dhuwung jawi',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Belati asimetris berpamor dan bersarung kayu',
      jv: {
        teks: 'Pusaka wilah asimetris mawi pamor lan warangka kajeng',
        ejaanAksara: 'pusaka wilah mawi pamor lan warangka kajeng',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Tosan Aji / Senjata Pusaka',
    tahunUnesco: '2005 / 2008',
    berkasUnesco: '00112',
    ringkasan: {
      id: 'Keris adalah belati asimetris khas Nusantara yang tercatat di UNESCO sejak 2005/2008. Sebuah keris terdiri atas tiga kesatuan utama: bilah logam (wilah) bersama ganja, gagang ukir (hulu/deder), dan sarung kayu (warangka). Penempaannya dilakukan oleh seorang empu dengan melipat lapisan besi dan logam nikel hingga melahirkan motif pamor.',
      jv: {
        teks: 'Dhuwung utawi keris punika pusaka khas Nusantara ingkang kaserat dening UNESCO wiwit warsa 2005 lan 2008. Wujudipun dumadi saking tigang perangan utama, inggih punika wilah kaliyan ganja, deder utawi ukiran, saha warangka kajeng ingkang katempa dening empu.',
        ejaanAksara: 'dhuwung utawi keris punika pusaka jawi ingkang katempa déning empu.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Kelengkapan busana adat Jawa dan pusaka tokoh satria di dalam pertunjukan wayang.',
    lisensiRef: 'G1',
    sumber: ['S1', 'S4'],
    titikInfo: [
      {
        id: 'wilah',
        label: {
          id: 'Wilah (Bilah Utama)',
          jv: {
            teks: 'Wilah (Awak Dhuwung)',
            ejaanAksara: 'wilah dhuwung',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.55, 0.04],
        kameraTarget: [0, 0.5, 0],
        uraian: {
          id: 'Wilah adalah badan utama keris yang ditempa dari campuran besi, baja, dan bahan pamor. Bentuknya dapat lurus (kalis) atau berkelok (luk) dengan jumlah kelokan yang selalu ganjil.',
          jv: {
            teks: 'Wilah punika perangan utama dhuwung ingkang katempa saking campuran wesi, waja, lan pamor. Wujudipun saged leres utawi mawi luk ingkang cacahipun tansah ganjil.',
            ejaanAksara: 'wilah punika perangan utama dhuwung saking wesi lan pamor.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1', 'S4'],
      },
      {
        id: 'ganja',
        label: {
          id: 'Ganja (Pangkal Melintang)',
          jv: {
            teks: 'Ganja (Dasar Wilah)',
            ejaanAksara: 'ganja wilah',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.18, -0.22, 0.05],
        kameraTarget: [0, -0.2, 0],
        uraian: {
          id: 'Ganja terletak melintang di pangkal bawah bilah sehingga membuat pangkal keris tampak melebar dan tidak simetris. Bagian ini ditempa terpisah lalu disatukan rapat pada ekor bilah (pesi).',
          jv: {
            teks: 'Ganja mapan malang wonten ing sangandhapipun wilah pramila pangkal dhuwung katingal wiyar lan boten simetris.',
            ejaanAksara: 'ganja mapan malang ing ngisor wilah.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1', 'S4'],
      },
      {
        id: 'pamor',
        label: {
          id: 'Pamor (Alur Logam Tempa)',
          jv: {
            teks: 'Pamor (Corak Logam)',
            ejaanAksara: 'pamor logam',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.04, 0.18, 0.05],
        kameraTarget: [0, 0.18, 0],
        uraian: {
          id: 'Pamor adalah guratan keperakan pada permukaan bilah yang muncul dari teknik tempa lipat logam berbeda jenis oleh empu. Setiap pola pamor menyimpan ketelitian teknik metalurgi tradisional.',
          jv: {
            teks: 'Pamor inggih punika serat pethak ing lumahing wilah ingkang medal saking teknik tempa lipat logam dening empu.',
            ejaanAksara: 'pamor medal saking tempa lipat logam déning empu.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1'],
      },
      {
        id: 'warangka',
        label: {
          id: 'Hulu & Warangka (Gagang dan Sarung)',
          jv: {
            teks: 'Deder lan Warangka',
            ejaanAksara: 'deder lan warangka',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.32, -0.58, 0.06],
        kameraTarget: [-0.15, -0.55, 0],
        uraian: {
          id: 'Hulu (deder) adalah pegangan berukir kayu, sedangkan warangka adalah sarung pelindung bilah yang umumnya bergaya gayaman atau ladrang serta kerap dilapisi selubung logam (pendok).',
          jv: {
            teks: 'Deder punika cepengan dhuwung ingkang kaukir, dene warangka punika wadah kajeng kangge nyimpen wilah supados aman.',
            ejaanAksara: 'deder lan warangka kajeng kanggé nyimpen wilah.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1', 'S4'],
      },
    ],
  },
  {
    id: 'saron',
    nama: {
      id: 'Saron Gamelan',
      jv: {
        teks: 'Saron Gamelan Jawi',
        ejaanAksara: 'saron gamelan jawi',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Instrumen bilah perunggu pembawa kerangka melodi (balungan)',
      jv: {
        teks: 'Ricikan wilah gangsa pamomot lagu balungan gendhing',
        ejaanAksara: 'ricikan wilah gangsa balungan gendhing',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Karawitan / Ansambel Gamelan',
    tahunUnesco: '2021',
    berkasUnesco: '01760',
    ringkasan: {
      id: 'Gamelan ditetapkan UNESCO pada Desember 2021 sebagai ansambel perkusi tradisional Indonesia. Saron termasuk kelompok ricikan bilah logam yang bertugas memainkan kerangka lagu (balungan) dalam mengiringi upacara maupun pertunjukan wayang kulit.',
      jv: {
        teks: 'Gamelan katetepaken dening UNESCO ing wulan Desember 2021. Saron kalebet ricikan wilah gangsa ingkang nabuh balungan gendhing kangge ngiringi ringgit purwa.',
        ejaanAksara: 'saron kalebet ricikan gamelan kanggé ngiringi wayang.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Penjaga kerangka melodi gendhing yang mengatur suasana tenang maupun tegang sepanjang pertunjukan wayang.',
    lisensiRef: 'G2',
    sumber: ['S2', 'S4'],
    titikInfo: [
      {
        id: 'wilah-saron',
        label: {
          id: 'Wilah Gangsa (Bilah Perunggu)',
          jv: {
            teks: 'Wilah Gangsa',
            ejaanAksara: 'wilah gangsa',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.22, 0.05],
        kameraTarget: [0, 0.15, 0],
        uraian: {
          id: 'Deretan tujuh bilah logam tempa yang disusun dari ukuran besar (nada rendah) di kiri ke ukuran lebih kecil (nada tinggi) di kanan, ditala menurut laras slendro atau pelog.',
          jv: {
            teks: 'Jeaturan pitung wilah logam tempa ingkang dipunlaras miturut laras slendro utawi pelog.',
            ejaanAksara: 'pitung wilah gangsa laras sléndro utawi pélog.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
      {
        id: 'rancakan',
        label: {
          id: 'Rancakan (Kotak Resonator Kayu)',
          jv: {
            teks: 'Rancakan Kajeng',
            ejaanAksara: 'rancakan kajeng',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, -0.18, 0.22],
        kameraTarget: [0, -0.15, 0],
        uraian: {
          id: 'Wadah kayu berongga di bawah bilah yang berfungsi sebagai ruang gema suara ketika bilah ditabuh.',
          jv: {
            teks: 'Wadah kajeng ing sangandhapipun wilah ingkang dados papan kumandhanging swanten nalika wilah dipuntabuh.',
            ejaanAksara: 'wadhah kajeng papan kumandhanging swanten.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
      {
        id: 'tabuh',
        label: {
          id: 'Tabuh (Pemukul Kayu)',
          jv: {
            teks: 'Tabuh Saron',
            ejaanAksara: 'tabuh saron',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.55, 0.42, 0.25],
        kameraTarget: [0.4, 0.35, 0.15],
        uraian: {
          id: 'Pemukul kayu berbentuk menyerupai palu miring yang dipegang tangan kanan, sementara tangan kiri memencet bilah sebelumnya (teknik pathetan) agar dengung tidak saling bertabrakan.',
          jv: {
            teks: 'Piranti panabuh saking kajeng ingkang kacepeng asta tengen, dene asta kiwa nyepeng wilah sadèrèngipun supados swantenipun resik.',
            ejaanAksara: 'tabuh kajeng kacepeng asta tengen.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2'],
      },
      {
        id: 'pencon-paku',
        label: {
          id: 'Paku & Bantalan Penyangga',
          jv: {
            teks: 'Paku lan Bantalan',
            ejaanAksara: 'paku lan bantalan',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.48, 0.24, 0.12],
        kameraTarget: [-0.4, 0.2, 0],
        uraian: {
          id: 'Pasak logam kecil dan bantalan lunak di tepi rancakan yang menahan posisi tiap bilah tanpa mematikan getaran suaranya.',
          jv: {
            teks: 'Pasak alit lan bantalan ing pinggir rancakan kangge njagi posisi wilah supados tetep saged geter kanthi bening.',
            ejaanAksara: 'pasak alit njagi posisi wilah.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
    ],
  },
  {
    id: 'wayang',
    nama: {
      id: 'Wayang Kulit Purwa',
      jv: {
        teks: 'Ringgit Purwa (Wayang Kulit)',
        ejaanAksara: 'ringgit purwa wayang kulit',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Boneka kulit berukir (tatahan) yang memproyeksikan bayangan di kelir',
      jv: {
        teks: 'Ringgit cucal mawi tatahan ingkang menghasilkan ayang-ayang ing kelir',
        ejaanAksara: 'ringgit cucal mawi tatahan ing kelir',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Seni Pertunjukan / Teater Bayangan',
    tahunUnesco: '2003 / 2008',
    berkasUnesco: '00063',
    ringkasan: {
      id: 'Wayang kulit diproklamasikan UNESCO pada 2003 dan dicantumkan dalam Daftar Representatif pada 2008. Boneka pipih berlubang ukir halus ini digerakkan oleh dalang memakai tangkai utama (gapit/cempurit) dan tangkai tangan (tuding) di depan layar kain bercahaya blencong.',
      jv: {
        teks: 'Ringgit kulit katetepaken dening UNESCO wiwit warsa 2003 lan 2008. Ringgit punika dipunobahaken dening dhalang mawi cempurit lan tuding ing sangajengipun kelir ingkang kasorot blencong.',
        ejaanAksara: 'ringgit kulit dipunobahaken déning dhalang ing kelir.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Pemeran utama di layar kelir yang menghidupkan lakon Ramayana dan Mahabharata melalui bayangan.',
    lisensiRef: 'G3',
    sumber: ['S3', 'S4'],
    titikInfo: [
      {
        id: 'awak-tatahan',
        label: {
          id: 'Awak Wayang (Tatahan & Sunggingan)',
          jv: {
            teks: 'Awak Ringgit (Tatahan)',
            ejaanAksara: 'awak ringgit tatahan',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.35, 0.03],
        kameraTarget: [0, 0.35, 0],
        uraian: {
          id: 'Lembaran kulit yang dipahat berlubang-lubang halus (tatahan) dan diwarnai (sunggingan). Lubang-lubang pahatan inilah yang membuat bayangan wayang di kain kelir tampak bertekstur renda dan tidak sekadar blok hitam.',
          jv: {
            teks: 'Lembaran cucal ingkang dipuntatah alus lan dipunsungging, satemah ayang-ayangipun ing kelir katingal ngrawit.',
            ejaanAksara: 'lembaran cucal dipuntatah alus lan dipunsungging.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3', 'S4'],
      },
      {
        id: 'cempurit',
        label: {
          id: 'Cempurit / Gapit (Tangkai Utama)',
          jv: {
            teks: 'Cempurit utawi Gapit',
            ejaanAksara: 'cempurit utawi gapit',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, -0.45, 0.04],
        kameraTarget: [0, -0.4, 0],
        uraian: {
          id: 'Tangkai penyangga tegak dari tulang/tanduk atau kayu yang menjepit badan wayang dari atas hingga ke bawah kaki untuk dipegang dalang atau ditancapkan pada batang pisang (gedebog).',
          jv: {
            teks: 'Cepengan utama ingkang njepit awak ringgit saking nginggil dumugi ngandhap kangge dicepeng dhalang utawi katancepaken ing gedebog.',
            ejaanAksara: 'cepengan utama ingkang njepit awak ringgit.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3'],
      },
      {
        id: 'tuding',
        label: {
          id: 'Tuding (Tangkai Penggerak Tangan)',
          jv: {
            teks: 'Tuding Asta Ringgit',
            ejaanAksara: 'tuding asta ringgit',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.38, -0.1, 0.05],
        kameraTarget: [0.3, 0, 0],
        uraian: {
          id: 'Dua bilah tangkai ramping yang terhubung dengan sendi bahu dan siku wayang, memungkinkan dalang menggerakkan lengan boneka secara ekspresif saat berdialog atau bertarung.',
          jv: {
            teks: 'Tangkai alit ingkang nggayutaken sendi asta ringgit supados saged kaobahaken nalika guneman.',
            ejaanAksara: 'tangkai alit kanggé ngobahaken asta ringgit.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3'],
      },
      {
        id: 'kelir-blencong',
        label: {
          id: 'Kelir & Sorot Blencong',
          jv: {
            teks: 'Kelir lan Sorot Blencong',
            ejaanAksara: 'kelir lan sorot blencong',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.35, 0.25, -0.18],
        kameraTarget: [0, 0.2, -0.15],
        uraian: {
          id: 'Kelir adalah bentangan kain putih berbingkai kayu tempat bayangan jatuh, sedangkan blencong adalah lampu penyinar dari arah dalang. Jarak wayang terhadap kelir menentukan tajam atau membesarnya bayangan.',
          jv: {
            teks: 'Kelir punika kain pethak papan tibaning ayang-ayang, dene blencong punika lampu panyorot saking arah dhalang.',
            ejaanAksara: 'kelir punika kain papan tibaning ayang.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3', 'S4'],
      },
    ],
  },
];

export const LAKON_KIJANG_KENCANA: LakonWayang = {
  id: 'kijang-kencana',
  judul: {
    id: 'Lakon Kijang Kencana',
    jv: {
      teks: 'Lampahan Kidang Kencana',
      ejaanAksara: 'lampahan kidang kencana',
      status: 'draf',
      catatanStatus: CATATAN_DRAF_JAWA,
    },
  },
  subjudul: {
    id: 'Episode Ramayana (Aranya Kanda): Tipu daya Marica di Hutan Dandaka',
    jv: {
      teks: 'Episode Ramayana: Paeka Kala Marica wonten ing Wana Dandaka',
      ejaanAksara: 'paéka kala marica ing wana dandaka',
      status: 'draf',
      catatanStatus: CATATAN_DRAF_JAWA,
    },
  },
  eposAsal: 'Ramayana (Valmiki / Repertoar Wayang Kulit Purwa Jawa)',
  tokohKanan: 'Sri Rama (Satria Panah)',
  tokohKiri: 'Kidang Kencana (Penjelmaan Marica)',
  sumber: ['S3', 'S5'],
  babak: [
    {
      nomor: 1,
      judul: {
        id: 'Babak 1: Pengasingan di Hutan Dandaka',
        jv: {
          teks: 'Babak 1: Mesanggrah ing Wana Dandaka',
          ejaanAksara: 'babak siji wana dandaka',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      narasi: {
        id: 'Rama, Dewi Sinta, dan Laksmana hidup di pertapaan hutan Dandaka. Raja Alengka, Rahwana, menyusun siasat bersama raksasa Marica yang mampu berubah wujud untuk menjauhkan Rama dan Laksmana dari Sinta.',
        jv: {
          teks: 'Sri Rama, Dewi Sinta, lan Laksmana mesanggrah wonten ing Wana Dandaka. Prabu Dasamuka ngrancang paeka kaliyan Kala Marica ingkang saged malih rupa kangge misahaken Rama saking Sinta.',
          ejaanAksara: 'sri rama lan déwi sinta ing wana dandaka.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Gerakkan tangan kanan (atau slider kanan) untuk menegakkan figur Sri Rama di sisi kanan kelir.',
      posisiAwalRama: 0.48,
      posisiAwalKidang: -0.62,
      sumber: ['S5'],
    },
    {
      nomor: 2,
      judul: {
        id: 'Babak 2: Kemilau Kijang Emas',
        jv: {
          teks: 'Babak 2: Gebyaring Kidang Kencana',
          ejaanAksara: 'babak loro kidang kencana',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      narasi: {
        id: 'Marica menjelma menjadi seekor kijang emas berbintik perak yang melompat anggun di dekat pertapaan. Sinta terpikat dan meminta Rama menangkapnya, sementara Laksmana mengingatkan bahwa kijang itu patut dicurigai sebagai ilusi.',
        jv: {
          teks: 'Marica malih rupa dados kidang kencana ingkang mlumpat ing sakiwa tengenipun pertapan. Dewi Sinta kepencut lan nyuwun Rama nyepeng kidang punika, sanadyan Laksmana sampun ngemutaken bilih punika saged dados paeka.',
          ejaanAksara: 'marica malih rupa dados kidang kencana.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Gerakkan tangan kiri (atau slider kiri) untuk membawa Kidang Kencana mendekat ke tengah kelir lalu menjauh.',
      posisiAwalRama: 0.35,
      posisiAwalKidang: -0.18,
      sumber: ['S5'],
    },
    {
      nomor: 3,
      judul: {
        id: 'Babak 3: Pengejaran dan Suara Palsu',
        jv: {
          teks: 'Babak 3: Pambujengan lan Swanten Palsu',
          ejaanAksara: 'babak telu swanten palsu',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      narasi: {
        id: 'Rama menitipkan penjagaan Sinta kepada Laksmana lalu mengejar kijang emas jauh ke dalam hutan. Ketika anak panah Rama mengenai sasaran, Marica kembali ke wujud raksasa dan berteriak menirukan suara Rama meminta pertolongan Sinta dan Laksmana.',
        jv: {
          teks: 'Rama nitipaken Sinta dhateng Laksmana lajeng mbujeng kidang mlebet wana. Nalika jemparingipun Rama ngenani Marica, raseksa punika bali dhateng wujud aslinipun lan mbengok nirokaken swantenipun Rama nyuwun tulung.',
          ejaanAksara: 'rama mbujeng kidang lan nglepas jemparing.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Pertemukan gerak tangan kanan dan kiri di tengah kelir untuk memperagakan saat panah Rama membuka penyamaran Marica.',
      posisiAwalRama: 0.12,
      posisiAwalKidang: -0.12,
      sumber: ['S5'],
    },
    {
      nomor: 4,
      judul: {
        id: 'Babak 4: Pesan tentang Kewaspadaan',
        jv: {
          teks: 'Babak 4: Piwulang babagan Kawaspadan',
          ejaanAksara: 'babak papat piwulang kawaspadan',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      narasi: {
        id: 'Teriakan palsu itu membuat Sinta cemas dan mendesak Laksmana menyusul Rama, sehingga pertapaan kehilangan penjaganya dan Rahwana datang menyamar sebagai pertapa. Dalam tradisi wayang Jawa, lakon ini menjadi pengingat agar manusia tidak tergesa-gesa tertipu oleh kemilau lahiriah.',
        jv: {
          teks: 'Swanten palsu punika ndadosaken Sinta kuwatir lan ngutus Laksmana nyusul Rama, satemah pertapan suwung saking penjagaan. Ing tradhisi ringgit Jawi, lampahan punika paring piwulang supados manungsa tansah waspada lan boten gampil kabujuk gebyaring lair.',
          ejaanAksara: 'lampahan punika paring piwulang supados tansah waspada.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Jauhkan kedua wayang ke tepi kelir untuk menutup adegan dan periksa sumber pustaka di layar Sumber.',
      posisiAwalRama: 0.55,
      posisiAwalKidang: -0.55,
      sumber: ['S3', 'S5'],
    },
  ],
};

export function ambilTeks(item: TeksMultibahasa, mode: BahasaMode): {
  utama: string;
  pendampingLatin: string | null;
  status: StatusTinjauan;
  catatanStatus: string | null;
} {
  if (mode === 'id') {
    return {
      utama: item.id,
      pendampingLatin: null,
      status: 'ditinjau',
      catatanStatus: null,
    };
  }
  if (mode === 'jv') {
    return {
      utama: item.jv.teks,
      pendampingLatin: item.id,
      status: item.jv.status,
      catatanStatus: item.jv.catatanStatus,
    };
  }
  return {
    utama: latinToAksara(item.jv.ejaanAksara),
    pendampingLatin: `${item.jv.ejaanAksara} (${item.id})`,
    status: item.jv.status,
    catatanStatus: item.jv.catatanStatus,
  };
}
