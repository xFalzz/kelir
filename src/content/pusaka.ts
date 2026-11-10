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

export type IdPusaka = 'keris' | 'saron' | 'batik' | 'joglo' | 'wayang';

export interface BendaPusaka {
  id: IdPusaka;
  nama: TeksMultibahasa;
  subjudul: TeksMultibahasa;
  kategori: string;
  tahunUnesco: string;
  berkasUnesco: string;
  ringkasan: TeksMultibahasa;
  peranPanggung: string;
  labelAksi3D: string;
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
      'Teater boneka Jawa dan Nusantara yang dimainkan oleh dalang dengan iringan gamelan, mengisahkan epos Ramayana, Mahabharata, dan filosofi sangkan paraning dumadi melalui simbol Gunungan (Kayon).',
  },
  {
    kode: 'S4',
    judul: 'Koleksi Etnografi, Arsitektur Joglo, & Historika Museum Negeri Sonobudoyo',
    lembaga: 'Dinas Kebudayaan (Kundha Kabudayan) Daerah Istimewa Yogyakarta',
    tahun: '1935 / 2026',
    url: 'https://sonobudoyo.jogjaprov.go.id',
    ringkasan:
      'Museum sejarah dan kebudayaan Jawa di Jl. Pangurakan No. 6 Yogyakarta (diresmikan 6 November 1935, dirancang Ir. Thomas Karsten dengan konstruksi pendopo Joglo bertumpangsari) yang mendokumentasikan tosan aji, gamelan, batik klasik, arsitektur kayu Jawa, dan wayang.',
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
    judul: 'The Unicode Standard: Javanese Block (U+A980..U+A9DF)',
    lembaga: 'The Unicode Consortium',
    tahun: '2023',
    url: 'https://www.unicode.org/charts/PDF/UA980.pdf',
    ringkasan:
      'Spesifikasi pengodean karakter Aksara Jawa yang mencakup 20 aksara nglegena, sandhangan swara, sandhangan panyigeg wanda, pangkon, dan tanda baca pada.',
  },
  {
    kode: 'S7',
    judul: 'Indonesian Batik (Berkas 00170)',
    lembaga: 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity',
    tahun: '2009',
    url: 'https://ich.unesco.org/en/RL/indonesian-batik-00170',
    ringkasan:
      'Warisan budaya takbenda Indonesia yang ditetapkan UNESCO pada 2 Oktober 2009, mencakup teknik rintang warna menggunakan lilin malam panas dengan canting tulis maupun cap tembaga pada kain katun dan sutra beserta filosofi motif Parang dan Kawung.',
  },
];

export const DAFTAR_LISENSI: LisensiAset[] = [
  {
    id: 'G1',
    nama: 'Model 3D Volumetrik Keris Jawa Luk 5 & Animasi Cabut Warangka',
    dipakaiDi: 'Ruang Pegang 3D & Pratinjau Pintu',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G2',
    nama: 'Model 3D Volumetrik Saron Barung Gamelan & Sintesis Audio Laras Slendro',
    dipakaiDi: 'Ruang Pegang 3D',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G3',
    nama: 'Model 3D Volumetrik Canting Tulis, Gawangan, Anglo Malam, & Kain Batik Kawung-Parang',
    dipakaiDi: 'Ruang Pegang 3D',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G4',
    nama: 'Model 3D Volumetrik Arsitektur Pendopo Joglo, Saka Guru, Tumpang Sari, & Umpak (Exploded View)',
    dipakaiDi: 'Ruang Pegang 3D',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/ArtifactStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'G5',
    nama: 'Model 3D Volumetrik Berartikulasi Wayang Satria, Kidang Kencana, & Gunungan (Kayon)',
    dipakaiDi: 'Ruang Pegang 3D & Panggung Budaya',
    pembuat: 'Tim Pengembang Kelir (kode asli)',
    sumberUrl: 'src/scenes/WayangStage.ts',
    lisensi: 'Karya asli proyek ini (MIT License)',
  },
  {
    id: 'P1',
    nama: 'Tekstur PBR 1K Kayu Jati Gelap, Kulit, & Studio HDRI (dark_wood, brown_leather, studio_small_08)',
    dipakaiDi: 'Material 3D Hulu/Warangka, Rancakan, Gawangan, Saka Guru Joglo, & Pencahayaan IBL',
    pembuat: 'Poly Haven (Rob Tuytel, Amal Kumar, Sergej Majboroda)',
    sumberUrl: 'https://polyhaven.com',
    lisensi: 'CC0 1.0 Universal (Public Domain Dedication)',
  },
  {
    id: 'F1',
    nama: 'Font Noto Sans Javanese',
    dipakaiDi: 'Render Aksara Jawa (U+A980..U+A9DF)',
    pembuat: 'Google & Monotype',
    sumberUrl: 'https://fontsource.org/fonts/noto-sans-javanese',
    lisensi: 'SIL Open Font License (OFL) 1.1',
  },
  {
    id: 'F2',
    nama: 'Font Fraunces Variable, Atkinson Hyperlegible, & JetBrains Mono',
    dipakaiDi: 'Tipografi Judul, Isi Antarmuka, & Telemetri Teknis',
    pembuat: 'Undercase Type, Braille Institute of America, & JetBrains',
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
      id: 'Tosan aji asimetris berpamor Wos Wutah dan bersarung kayu jati gayaman',
      jv: {
        teks: 'Pusaka wilah asimetris mawi pamor lan warangka kajeng',
        ejaanAksara: 'pusaka wilah mawi pamor lan warangka kajeng',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Tosan Aji / Metalurgi Nusantara',
    tahunUnesco: '2005 / 2008',
    berkasUnesco: '00112',
    ringkasan: {
      id: 'Keris adalah pusaka belati asimetris khas Nusantara yang tercatat di UNESCO sejak 2005/2008. Sebuah keris terdiri atas tiga kesatuan utama: bilah logam (wilah) bersama ganja, gagang ukir (hulu/deder), dan sarung kayu (warangka). Penempaannya dilakukan oleh seorang empu dengan melipat puluhan lapis besi dan logam nikel hingga melahirkan motif pamor.',
      jv: {
        teks: 'Dhuwung utawi keris punika pusaka khas Nusantara ingkang kaserat dening UNESCO wiwit warsa 2005 lan 2008. Wujudipun dumadi saking tigang perangan utama, inggih punika wilah kaliyan ganja, deder utawi ukiran, saha warangka kajeng ingkang katempa dening empu.',
        ejaanAksara: 'dhuwung utawi keris punika pusaka jawi ingkang katempa déning empu.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Simbol keahlian metalurgi tempa lipat empu Jawa dan kelengkapan busana adat upacara.',
    labelAksi3D: 'Cabut / Sarungkan Bilah Keris',
    lisensiRef: 'G1',
    sumber: ['S1', 'S4'],
    titikInfo: [
      {
        id: 'wilah',
        label: {
          id: 'Wilah (Bilah Utama Luk 5)',
          jv: {
            teks: 'Wilah (Awak Dhuwung)',
            ejaanAksara: 'wilah dhuwung',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.55, 0.04],
        kameraTarget: [0, 0.45, 0],
        uraian: {
          id: 'Wilah adalah badan utama keris yang ditempa dari campuran besi, baja, dan bahan pamor. Bentuknya dapat lurus (kalis) atau berkelok (luk) dengan jumlah kelokan yang selalu ganjil, seperti luk 5 yang melambangkan keteguhan bicara dan kepemimpinan.',
          jv: {
            teks: 'Wilah inggih punika perangan utami dhuwung ingkang katempa saking campuran wesi, waja, lan pamor. Wujudipun saged leres utawi mawi luk ingkang cacahipun tansah ganjil.',
            ejaanAksara: 'wilah punika awak utami dhuwung saking wesi lan pamor.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1', 'S4'],
      },
      {
        id: 'ganja',
        label: {
          id: 'Ganja & Kembang Kacang',
          jv: {
            teks: 'Ganja (Perangan Ngandhap Wilah)',
            ejaanAksara: 'ganja dhuwung',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.16, -0.2, 0.05],
        kameraTarget: [0.05, -0.18, 0],
        uraian: {
          id: 'Ganja terletak melintang di pangkal bawah bilah menyerupai cicak (sirah cecak dan buntut urang) sehingga membuat pangkal keris tampak melebar asimetris, berdampingan dengan lengkungan kembang kacang di sisi depan.',
          jv: {
            teks: 'Ganja mapan malang wonten ing ngandhap wilah satemah wujudipun dhuwung katon asimetris. Perangan punika katempa piyambak lajeng dipunrapetaken wonten ing pesi.',
            ejaanAksara: 'ganja mapan malang ing ngandhap wilah dhuwung.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1', 'S4'],
      },
      {
        id: 'pamor',
        label: {
          id: 'Pamor Wos Wutah (Alur Tempa)',
          jv: {
            teks: 'Pamor (Serat Tempaan Logam)',
            ejaanAksara: 'pamor wesi aji',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.03, 0.18, 0.05],
        kameraTarget: [0, 0.18, 0],
        uraian: {
          id: 'Pamor adalah guratan keperakan pada permukaan bilah yang muncul dari teknik tempa lipat logam berbeda jenis oleh empu dan dipertegas melalui proses warangan. Motif Wos Wutah (beras tumpah) melambangkan harapan kesejahteraan.',
          jv: {
            teks: 'Pamor inggih punika serat pethak ing lumahing wilah ingkang mijil saking teknik tempa lipat dening empu. Saben corak pamor nyimpen kawruh metalurgi tradisional.',
            ejaanAksara: 'pamor mijil saking tempaan lipat logam déning empu.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S1'],
      },
      {
        id: 'warangka',
        label: {
          id: 'Hulu Nunggak Semi & Warangka Gayaman',
          jv: {
            teks: 'Deder lan Warangka (Ukiran saha Sarung)',
            ejaanAksara: 'deder lan warangka',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.36, -0.48, 0.06],
        kameraTarget: [-0.2, -0.45, 0],
        uraian: {
          id: 'Hulu (deder) gaya Yogyakarta berbentuk merunduk (nunggak semi) dengan cincin mendak berpermata, sedangkan warangka adalah sarung kayu pelindung bilah bergaya gayaman yang dilapisi selubung logam keemasan (pendok blewah).',
          jv: {
            teks: 'Deder inggih punika cepengan kajeng ingkang dipunukir, dene warangka punika sarung pangreksa wilah ingkang limrahipun mawi gagrag gayaman utawi ladrang saha dipunlapisi pendok.',
            ejaanAksara: 'deder lan warangka kajeng kagem nyarungaken wilah.',
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
        teks: 'Saron Gangsa (Gamelan)',
        ejaanAksara: 'saron gangsa',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Instrumen 7 bilah perunggu tempa pembawa kerangka melodi (balungan)',
      jv: {
        teks: 'Ricikan wilah gangsa ingkang nyepeng balungan gendhing',
        ejaanAksara: 'ricikan wilah gangsa balungan gendhing',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Karawitan / Musik Tradisional',
    tahunUnesco: '2021',
    berkasUnesco: '01760',
    ringkasan: {
      id: 'Gamelan ditetapkan UNESCO pada Desember 2021 sebagai ansambel perkusi tradisional Indonesia. Saron barung termasuk kelompok ricikan bilah perunggu (gangsa) yang bertugas memainkan kerangka lagu (balungan) dalam laras slendro maupun pelog.',
      jv: {
        teks: 'Gamelan katetepaken dening UNESCO ing wulan Desember 2021 minangka karawitan tradisional Indonesia. Saron kalebet ricikan wilah gangsa ingkang ngayahi jejibahan nabuh balungan gendhing.',
        ejaanAksara: 'gamelan punika gangsa jawi ingkang katetepaken déning unesco.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Penjaga alur melodi utama (balungan) dalam konser karawitan, upacara adat, dan pertunjukan.',
    labelAksi3D: 'Mainkan / Hentikan Gending Lancaran',
    lisensiRef: 'G2',
    sumber: ['S2', 'S4'],
    titikInfo: [
      {
        id: 'wilah-saron',
        label: {
          id: 'Wilah Gangsa (7 Bilah Perunggu)',
          jv: {
            teks: 'Wilah Gangsa (Wolu utawi Pitung Wilah)',
            ejaanAksara: 'wilah gangsa saron',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.14, 0.05],
        kameraTarget: [0, 0.08, 0],
        uraian: {
          id: 'Deretan tujuh bilah logam perunggu tempa berprofil cembung (uger) yang disusun dari ukuran besar (nada rendah 6̣) di kiri ke ukuran lebih kecil (nada tinggi 1̇) di kanan menurut laras slendro.',
          jv: {
            teks: ' Urutan pitung wilah gangsa ingkang katata saking ukuran ageng ing sisih kiwa dumugi ukuran alit ing sisih tengen miturut laras slendro utawi pelog.',
            ejaanAksara: 'urutan wilah gangsa miturut laras sléndro lan pélog.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
      {
        id: 'rancakan',
        label: {
          id: 'Rancakan (Kotak Resonator Ukir)',
          jv: {
            teks: 'Rancakan (Wadhah Kajeng)',
            ejaanAksara: 'rancakan kajeng',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, -0.18, 0.24],
        kameraTarget: [0, -0.15, 0],
        uraian: {
          id: 'Wadah kayu jati berongga di bawah bilah dengan ukiran sulur lung-lungan prada emas yang berfungsi sebagai ruang gema akustik bersama ketika bilah ditabuh.',
          jv: {
            teks: 'Wadhah kajeng berongga ing ngandhap wilah ingkang gadhah guna minangka papan kumandhanging swanten nalika wilah dipuntabuh.',
            ejaanAksara: 'rancakan kajeng papan kumandhanging swanten saron.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
      {
        id: 'tabuh',
        label: {
          id: 'Tabuh (Pemukul Kayu Miring)',
          jv: {
            teks: 'Tabuh Saron (Panabuh Kajeng)',
            ejaanAksara: 'tabuh saron kajeng',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.35, 0.36, 0.16],
        kameraTarget: [0.25, 0.28, 0.08],
        uraian: {
          id: 'Pemukul kayu bubut berbentuk menyerupai palu miring yang dipegang tangan kanan, sementara tangan kiri memencet bilah sebelumnya (teknik pathetan) agar dengung nada tidak saling bertabrakan.',
          jv: {
            teks: 'Panabuh kajeng awujud gandhen miring ingkang dipuncepeng asta tengen, dene asta kiwa dipunginakaken kagem mathet wilah supados swantenipun resik.',
            ejaanAksara: 'tabuh saron dipuncepeng asta tengen kagem nabuh wilah.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
      {
        id: 'pencon-paku',
        label: {
          id: 'Paku & Kasuran Penyangga',
          jv: {
            teks: 'Paku lan Bantalan Wilah',
            ejaanAksara: 'paku lan bantalan wilah',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.48, 0.12, 0.14],
        kameraTarget: [-0.4, 0.1, 0],
        uraian: {
          id: 'Pasak logam kecil dan bantalan tali lunak (kasuran) di tepi rancakan yang menahan posisi tiap bilah melalui dua lubang ujungnya tanpa mematikan getaran akustik perunggu.',
          jv: {
            teks: 'Paku logam alit saha bantalan ing pinggir rancakan ingkang nyangga saben wilah supados tetep saged kumandhang kanthi sae.',
            ejaanAksara: 'paku alit nyangga wilah supados kumandhang saé.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S2', 'S4'],
      },
    ],
  },
  {
    id: 'batik',
    nama: {
      id: 'Batik Tulis & Canting',
      jv: {
        teks: 'Bathik Serat lan Canthing',
        ejaanAksara: 'bathik serat lan canthing',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Kriya tekstil rintang warna malam panas bermotif Kawung dan Parang',
      jv: {
        teks: 'Kriya wastra mawi malam benter corak kawung lan parang',
        ejaanAksara: 'kriya wastra mawi malam corak kawung lan parang',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Wastra / Kriya Tekstil',
    tahunUnesco: '2009',
    berkasUnesco: '00170',
    ringkasan: {
      id: 'Batik Indonesia ditetapkan UNESCO pada 2 Oktober 2009 (Berkas 00170). Pembatik menggunakan canting tulis bertangkai bambu dan berwadah tembaga untuk menorehkan lilin malam panas di atas kain mori yang tersampir pada gawangan kayu, membentuk ragam hias filosofis seperti Kawung dan Parang.',
      jv: {
        teks: 'Bathik Indonesia katetepaken dening UNESCO ing warsa 2009. Pambathik ngginakaken canthing tembaga kagem nyorekaken malam benter wonten ing mori ingkang kasampiraken ing gawangan kajeng.',
        ejaanAksara: 'bathik jawi katetepaken déning unesco minangka warisan budaya.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Busana tradisional sarat makna filosofis siklus kehidupan masyarakat Jawa dari lahir hingga dewasa.',
    labelAksi3D: 'Gerakkan / Jeda Canting Membatik',
    lisensiRef: 'G3',
    sumber: ['S7', 'S4'],
    titikInfo: [
      {
        id: 'canting-tulis',
        label: {
          id: 'Canting Tulis (Nyamplungan & Cucuk)',
          jv: {
            teks: 'Canthing Serat (Nyamplungan lan Cucuk)',
            ejaanAksara: 'canthing serat tembaga',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.18, 0.36, 0.22],
        kameraTarget: [0.1, 0.25, 0.1],
        uraian: {
          id: 'Alat lukis khusus batik yang terdiri atas gagang bambu/kayu (gagang terong), mangkuk penampung malam cair dari tembaga (nyamplungan), dan pipa cerat halus (cucuk) tempat mengalirnya titik dan garis malam.',
          jv: {
            teks: 'Piranti mirunggan kagem mbathik ingkang dumadi saking gagang pring, wadhah malam tembaga ingkang winastan nyamplungan, saha cucuk alit.',
            ejaanAksara: 'canthing dumadi saking gagang nyamplungan lan cucuk.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S7', 'S4'],
      },
      {
        id: 'kain-kawung-parang',
        label: {
          id: 'Motif Kawung & Parang Sogan',
          jv: {
            teks: 'Corak Kawung lan Parang Sogan',
            ejaanAksara: 'corak kawung lan parang',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.12, 0.05],
        kameraTarget: [0, 0.1, 0],
        uraian: {
          id: 'Motif geometris empat bulatan Kawung melambangkan kesempurnaan dan pengendalian diri (kiblat papat lima pancer), sedangkan diagonal Parang melambangkan kesinambungan perjuangan bagai ombak samudra.',
          jv: {
            teks: 'Corak sekawan bunderan Kawung pralambang kasampurnan lan pangendhalian dhiri, dene garisan miring Parang pralambang semangat ingkang boten kendhat.',
            ejaanAksara: 'corak kawung lan parang nyimpen piwulang luhur.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S7', 'S4'],
      },
      {
        id: 'gawangan-kayu',
        label: {
          id: 'Gawangan Kayu Ukir (Penyangga Mori)',
          jv: {
            teks: 'Gawangan Kajeng (Panyangga Mori)',
            ejaanAksara: 'gawangan kajeng bathik',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.45, 0.42, -0.05],
        kameraTarget: [-0.25, 0.25, 0],
        uraian: {
          id: 'Palang penyangga dari kayu jati atau bambu berukir tempat membentangkan lembaran kain mori agar pembatik leluasa menggerakkan canting dari sisi atas dan menahan kain dengan tangan kiri.',
          jv: {
            teks: 'Palang panyangga saking kajeng jati kagem nyampiraken kain mori supados pambathik gampil anggenipun nyorekaken malam.',
            ejaanAksara: 'gawangan kajeng kagem nyampiraken kain mori.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S7', 'S4'],
      },
      {
        id: 'wajan-malam',
        label: {
          id: 'Wajan & Anglo Malam Panas',
          jv: {
            teks: 'Wajan lan Anglo Malam Benter',
            ejaanAksara: 'wajan lan anglo malam',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.52, -0.26, 0.24],
        kameraTarget: [0.4, -0.22, 0.15],
        uraian: {
          id: 'Wajan kecil di atas tungku tanah liat (anglo) yang menjaga suhu lilin malam (campuran gondorukem, parafin, dan lilin lebah) agar tetap cair dan meresap sempurna ke serat kain.',
          jv: {
            teks: 'Wajan alit ing nginggil anglo siti ingkang njagi benteripun malam supados tetep cuwer lan saged rumesep ing serat mori.',
            ejaanAksara: 'wajan alit njagi malam supados tetep cuwér.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S7', 'S4'],
      },
    ],
  },
  {
    id: 'joglo',
    nama: {
      id: 'Pendopo Joglo Jawa',
      jv: {
        teks: 'Pendhapi Joglo Jawi',
        ejaanAksara: 'pendhapi joglo jawi',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Arsitektur kayu tahan gempa bersistem Saka Guru, Tumpang Sari, dan Umpak',
      jv: {
        teks: 'Wewangunan kajeng mawi saka guru, tumpang sari, lan umpak sela',
        ejaanAksara: 'wewangunan joglo mawi saka guru lan tumpang sari',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Arsitektur Tradisional / Konstruksi',
    tahunUnesco: '1935 / Warisan DIY',
    berkasUnesco: 'Sonobudoyo',
    ringkasan: {
      id: 'Rumah dan Pendopo Joglo merupakan puncak rekayasa arsitektur kayu tradisional Yogyakarta dan Jawa Tengah. Struktur intinya ditopang oleh empat tiang utama (Saka Guru) yang berdiri di atas batu sendi (Umpak) tanpa paku mati, mengunci balok bersusun (Tumpang Sari) dan atap tinggi (Brunjung) sehingga lentur meredam guncangan gempa bumi.',
      jv: {
        teks: 'Pendhapi Joglo punika wewangunan kajeng utami ing Ngayogyakarta lan Jawi Tengah. Adeganipun kasangga dening sekawan Saka Guru ing nginggil umpak sela saha balok tumpang sari ingkang kukuh.',
        ejaanAksara: 'pendhapi joglo kasangga déning sekawan saka guru.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Ruang publik terbuka tempat musyawarah warga, latihan tari, karawitan gamelan, dan pergelaran budaya.',
    labelAksi3D: 'Bedah Struktur 3D (Exploded View)',
    lisensiRef: 'G4',
    sumber: ['S4'],
    titikInfo: [
      {
        id: 'atap-brunjung',
        label: {
          id: 'Atap Brunjung & Penanggap (Tajug Joglo)',
          jv: {
            teks: 'Payon Brunjung lan Pananggap',
            ejaanAksara: 'payon brunjung joglo',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.56, 0.08],
        kameraTarget: [0, 0.42, 0],
        uraian: {
          id: 'Bagian atap tengah yang menjulang tinggi berbentuk trapesium curam menyerupai gunung (simbol Mahameru), dikelilingi atap penanggap yang lebih landai untuk mengalirkan air hujan tropis dan menciptakan sirkulasi udara sejuk.',
          jv: {
            teks: 'Perangan payon tengah ingkang inggil kados redi minangka pralambang Mahameru, dipunkupengi payon pananggap ingkang langkung landhai.',
            ejaanAksara: 'payon brunjung inggil kados redi mahaméru.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S4'],
      },
      {
        id: 'tumpang-sari',
        label: {
          id: 'Tumpang Sari (Balok Susun Bersendi)',
          jv: {
            teks: 'Tumpang Sari (Balok Susun Ukir)',
            ejaanAksara: 'tumpang sari kajeng',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0, 0.24, 0.22],
        kameraTarget: [0, 0.2, 0],
        uraian: {
          id: 'Susunan balok kayu jati bertingkat (tumpang sari jero dan tumpang sari jaba) di atas blandar-pengeret yang saling mengunci dengan pasak (purus) dan membentuk langit-langit piramida terbalik (uleng) berukir emas.',
          jv: {
            teks: 'Urutan balok kajeng jati matumpa-tumpa ing nginggil blandar lan pengeret ingkang sami ngunci mawi purus tanpa paku wesi.',
            ejaanAksara: 'tumpang sari ngunci balok kajeng mawi purus.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S4'],
      },
      {
        id: 'saka-guru',
        label: {
          id: 'Empat Saka Guru (Tiang Utama Pusat)',
          jv: {
            teks: 'Sekawan Saka Guru (Saka Utami)',
            ejaanAksara: 'sekawan saka guru',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.24, -0.05, 0.24],
        kameraTarget: [0.12, -0.05, 0.12],
        uraian: {
          id: 'Empat tiang kayu jati utuh di pusat bangunan yang menopang beban atap brunjung dan melambangkan empat penjuru mata angin yang menyatu pada pusat keseimbangan.',
          jv: {
            teks: 'Sekawan saka kajeng jati ing tengahing wewangunan ingkang nyangga bobot payon brunjung saha pralambang kiblat papat.',
            ejaanAksara: 'sekawan saka guru nyangga tengahing pendhapi.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S4'],
      },
      {
        id: 'umpak-batu',
        label: {
          id: 'Umpak Batu Andesit (Fondasi Peredam Gempa)',
          jv: {
            teks: 'Umpak Sela Andesit ( Dhasar Saka)',
            ejaanAksara: 'umpak séla andésit',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.24, -0.34, 0.24],
        kameraTarget: [0.15, -0.3, 0.15],
        uraian: {
          id: 'Landasan batu vulkanik berbentuk trapesium berukir padma (teratai) di bawah tiap tiang kayu. Umpak mencegah kelembapan tanah merusak kayu sekaligus bertindak sebagai isolator geser saat terjadi gempa bumi.',
          jv: {
            teks: 'Landhesan sela awujud trapesium ing ngandhap saka kajeng ingkang nyegah kayu saking telesing siti saha nahan lindhu.',
            ejaanAksara: 'umpak séla nyangga saka kajeng supados kukuh.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S4'],
      },
    ],
  },
  {
    id: 'wayang',
    nama: {
      id: 'Wayang & Gunungan 3D',
      jv: {
        teks: 'Ringgit Purwa lan Kayon',
        ejaanAksara: 'ringgit purwa lan kayon',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    subjudul: {
      id: 'Pahatan 3D tokoh satria bersendi tuding dan pohon hayat Gunungan (Kayon)',
      jv: {
        teks: 'Wangun 3D ringgit satriya mawi tuding lan gunungan kayon',
        ejaanAksara: 'ringgit satriya mawi cempurit lan kayon',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    kategori: 'Seni Pertunjukan & Tatah Sungging',
    tahunUnesco: '2003 / 2008',
    berkasUnesco: '00063',
    ringkasan: {
      id: 'Wayang ditetapkan UNESCO pada 2003 dan 2008 (Berkas 00063). Selain boneka tokoh satria yang memiliki sendi bahu-siku berpenggerak tuding dan gapit tanduk, pertunjukan wayang selalu dibuka dan ditutup dengan tancapan Gunungan (Kayon) yang melambangkan jagat raya beserta pohon kehidupan Kalpataru.',
      jv: {
        teks: 'Wayang katetepaken dening UNESCO ing warsa 2003 lan 2008. Kejawi paraga satriya ingkang dipunobahaken mawi gapit lan tuding, lampahan ringgit tansah kabikak mawi Gunungan utawi Kayon.',
        ejaanAksara: 'wayang lan kayon punika warisan budaya jawi.',
        status: 'draf',
        catatanStatus: CATATAN_DRAF_JAWA,
      },
    },
    peranPanggung:
      'Pemeran utama lakon epos Ramayana dan simbol makrokosmos (Gunungan/Kayon) di atas panggung.',
    labelAksi3D: 'Gerakkan Sendi Tuding & Busur Panah',
    lisensiRef: 'G5',
    sumber: ['S3', 'S4', 'S5'],
    titikInfo: [
      {
        id: 'awak-tatahan',
        label: {
          id: 'Awak Wayang & Gelung Supit Urang',
          jv: {
            teks: 'Awak Ringgit (Tatahan lan Sunggingan)',
            ejaanAksara: 'awak ringgit tatahan',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.12, 0.34, 0.06],
        kameraTarget: [0.1, 0.28, 0],
        uraian: {
          id: 'Pahatan mahkota gelung supit urang dan badan satria berhias praba serta kain dodot yang diukir berlapis (tatah sungging) dengan gradasi warna prada emas, merah sogan, dan hitam.',
          jv: {
            teks: 'Pahatan gelung supit urang saha awak satriya ingkang dipuntatah alus lan dipunsungging mawi pulas prada emas.',
            ejaanAksara: 'awak ringgit dipuntatah lan dipunsungging.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3', 'S4'],
      },
      {
        id: 'cempurit',
        label: {
          id: 'Cempurit / Gapit (Tangkai Tanduk)',
          jv: {
            teks: 'Cempurit utawi Gapit (Cepengan Utami)',
            ejaanAksara: 'cempurit utawi gapit',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.12, -0.42, 0.05],
        kameraTarget: [0.1, -0.35, 0],
        uraian: {
          id: 'Tangkai penyangga tegak dari tanduk kerbau yang menjepit poros tubuh wayang dari mahkota hingga ke bawah kaki untuk dipegang dalang atau ditancapkan pada gedebog.',
          jv: {
            teks: 'Tangkai panyangga saking sungu maesa ingkang njepit awak ringgit saking nginggil dumugi ngandhap kagem dipuncepeng dhalang.',
            ejaanAksara: 'cempurit saking sungu kagem nyepeng ringgit.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3', 'S4'],
      },
      {
        id: 'tuding',
        label: {
          id: 'Sendi Lengan, Tuding, & Busur Gendewa',
          jv: {
            teks: 'Tuding (Tangkai Pangobah Asta)',
            ejaanAksara: 'tuding pangobah asta',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [0.42, 0.08, 0.08],
        kameraTarget: [0.3, 0.08, 0],
        uraian: {
          id: 'Lengan wayang memiliki dua engsel (bahu dan siku) yang dihubungkan tangkai tuding serta busur panah Gendewa, memungkinkan gerakan memanah dan sabetan yang hidup di tangan dalang.',
          jv: {
            teks: 'Asta ringgit gadhah sendhi pundhak lan sikut ingkang kasambung kaliyan tuding supados saged obah luwes nalika menthang gendhewa.',
            ejaanAksara: 'tuding kagem ngobahaken asta ringgit.',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        sumber: ['S3', 'S4'],
      },
      {
        id: 'kelir-blencong',
        label: {
          id: 'Gunungan (Kayon) & Pohon Kalpataru',
          jv: {
            teks: 'Gunungan utawi Kayon (Pohon Hayat)',
            ejaanAksara: 'gunungan utawi kayon',
            status: 'draf',
            catatanStatus: CATATAN_DRAF_JAWA,
          },
        },
        posisi3D: [-0.32, 0.18, -0.06],
        kameraTarget: [-0.25, 0.15, -0.04],
        uraian: {
          id: 'Pahatan 3D berbentuk pucuk gunung (meru) yang memuat gapura candi, penjaga raksasa, dan pohon kehidupan Kalpataru; digunakan dalang sebagai penanda pergantian babak, angin, api, atau hutan.',
          jv: {
            teks: 'Wangun meru ingkang ngemot gapura candhi lan wit Kalpataru minangka pratandha gantosipun babak, wana, utawi dahana.',
            ejaanAksara: 'kayon pratandha gantosipun babak ing pakeliran.',
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
      teks: 'Cariyos Ramayana (Aranya Kanda): Paekanipun Marica ing Wana Dandaka',
      ejaanAksara: 'cariyos ramayana ing wana dandaka',
      status: 'draf',
      catatanStatus: CATATAN_DRAF_JAWA,
    },
  },
  eposAsal: 'Ramayana · Kitab ke-3 (Aranya Kanda)',
  tokohKanan: 'Sri Rama (Satria Pemanah 3D)',
  tokohKiri: 'Kidang Kencana (Penjelmaan Marica 3D)',
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
          teks: 'Sri Rama, Dewi Sinta, saha Laksmana dedunung ing pertapan Wana Dandaka. Prabu Dasamuka saking Ngalengka nyusun paeka kaliyan ditya Marica ingkang saged malih rupa supados misahaken Rama saking Sinta.',
          ejaanAksara: 'sri rama lan dewi sinta ing wana dandaka.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Tempatkan Sri Rama di sisi kanan panggung dan Kidang Kencana mulai tampak dari tepi kiri hutan.',
      posisiAwalRama: 0.55,
      posisiAwalKidang: -0.65,
      sumber: ['S3', 'S5'],
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
          teks: 'Marica malih wujud dados kidang kencana ingkang mlumpat endah ing celak pertapan. Dewi Sinta kapencut lajeng nyuwun Rama nyepeng kidang punika, nanging Laksmana ngemutaken bilih kidang punika patut dipunwaspaosaken.',
          ejaanAksara: 'marica malih wujud dados kidang kencana.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Gerakkan tangan kiri (atau slider kiri) mendekat lalu menjauh untuk memperagakan lompatan kijang emas yang memancing perhatian.',
      posisiAwalRama: 0.35,
      posisiAwalKidang: -0.15,
      sumber: ['S3', 'S5'],
    },
    {
      nomor: 3,
      judul: {
        id: 'Babak 3: Pengejaran dan Suara Palsu',
        jv: {
          teks: 'Babak 3: Pangoyak saha Swanten Palsu',
          ejaanAksara: 'babak telu pangoyak kidang',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      narasi: {
        id: 'Rama menitipkan penjagaan Sinta kepada Laksmana lalu mengejar kijang emas jauh ke dalam hutan. Ketika anak panah Rama mengenai sasaran, Marica kembali ke wujud raksasa dan berteriak menirukan suara Rama meminta pertolongan Sinta dan Laksmana.',
        jv: {
          teks: 'Rama masrahaken penjagaan Sinta dhumateng Laksmana lajeng ngoyak kidang kencana mlebet wana. Nalika jemparingipun Rama ngenani sasaran, Marica wangsul dhateng wujud aslinipun saha njerit niru swantenipun Rama nyuwun tulung.',
          ejaanAksara: 'jemparing sri rama ngenani kidang kencana.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Pertemukan Sri Rama ke arah Kidang Kencana di sisi kiri untuk menggambarkan saat panah dilepaskan.',
      posisiAwalRama: -0.1,
      posisiAwalKidang: -0.55,
      sumber: ['S3', 'S5'],
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
        id: 'Teriakan palsu itu membuat Sinta cemas dan mendesak Laksmana menyusul Rama, sehingga pertapaan kehilangan penjaganya dan Rahwana datang menyamar sebagai pertapa. Dalam tradisi budaya Jawa, lakon ini menjadi pengingat agar manusia tidak tergesa-gesa tertipu oleh kemilau lahiriah.',
        jv: {
          teks: 'Jeritan palsu punika ndadosaken Sinta kuwatos lan ngakon Laksmana nusul Rama, satemah pertapan suwung lan Dasamuka rawuh nyamar dados pandhita. Lampahan punika paring piwulang supados manungsa boten gampil kapusan dening gebyar lair.',
          ejaanAksara: 'manungsa sampun ngantos kapusan gebyar lair.',
          status: 'draf',
          catatanStatus: CATATAN_DRAF_JAWA,
        },
      },
      petunjukDalang:
        'Kembalikan kedua tokoh ke tengah layar kelir sebagai penutup babak dan renungan cerita.',
      posisiAwalRama: 0.25,
      posisiAwalKidang: -0.25,
      sumber: ['S3', 'S5'],
    },
  ],
};

export interface MetrikSpesifikasiBudaya {
  label: string;
  nilai: string;
  keterangan: string;
}

export interface TahapSejarahBudaya {
  periode: string;
  judul: string;
  uraian: string;
}

export interface LangkahScroll3D {
  nomor: string;
  bab: string;
  tempat: string;
  judul: string;
  uraian: string;
  rotasiY: number;
  rotasiX: number;
  zoom: number;
  indeksTitik: number;
}

export interface KronikSejarahBenda {
  nomorIndeks: string;
  eraSejarah: string;
  asalDaerah: string;
  intisariSains: string;
  metrik: MetrikSpesifikasiBudaya[];
  linimasaSejarah: TahapSejarahBudaya[];
  langkahScroll3D: LangkahScroll3D[];
}

export const KRONIK_SEJARAH_BUDAYA: Record<IdPusaka, KronikSejarahBenda> = {
  keris: {
    nomorIndeks: '01',
    eraSejarah: 'Abad ke-9 M (Prasasti & Relief Candi) hingga Kasultanan Yogyakarta',
    asalDaerah: 'Yogyakarta & Jawa Tengah · Koleksi Tosan Aji Sonobudoyo',
    intisariSains:
      'Metalurgi tempa lipat heterogen (besi, baja, dan batu meteorit/nikel) yang menghasilkan kontras lapisan kristal mikroskopis bernama pamor.',
    metrik: [
      {
        label: 'Teknik Metalurgi',
        nilai: 'Tempa Lipat 64+ Lapis',
        keterangan: 'Penyatuan besi tempa ulet, baja keras (waja), dan nikel pamor melalui suhu tungku arang jati.',
      },
      {
        label: 'Geometri Bilah',
        nilai: 'Luk 5 Asimetris',
        keterangan: 'Jumlah kelokan selalu ganjil; Luk 5 melambangkan kefasihan tutur dan keteguhan kepemimpinan.',
      },
      {
        label: 'Pengakuan Dunia',
        nilai: 'UNESCO 00112',
        keterangan: 'Diproklamasikan tahun 2005 dan masuk Daftar Representatif Warisan Budaya Takbenda 2008.',
      },
    ],
    linimasaSejarah: [
      {
        periode: 'Abad ke-9 .. ke-10 M',
        judul: 'Prototipe Belati Asimetris pada Prasasti & Relief Candi Jawa Kuno',
        uraian:
          'Bukti arkeologis bentuk awal belati tikam berbilah lebar muncul pada prasasti perunggu dan relief candi-candi periode Mataram Kuno di Jawa Tengah.',
      },
      {
        periode: 'Abad ke-14 .. ke-15 M',
        judul: 'Pematangan Dhapur & Pamor pada Era Majapahit',
        uraian:
          'Para empu menyempurnakan proporsi condong leleh (kemiringan bilah terhadap ganja) dan teknik tempa lipat pamor meteorit hingga melahirkan pakem dhapur keris.',
      },
      {
        periode: 'Abad ke-18 M .. Kini',
        judul: 'Estetika Warangka Gayaman Yogyakarta & Pelestarian UNESCO',
        uraian:
          'Di lingkungan Kasultanan Yogyakarta, keris menjadi kelengkapan busana adat dengan sarung kayu gayaman/ladrang berpendok emas dan dirawat melalui tradisi jamasan.',
      },
    ],
    langkahScroll3D: [
      {
        nomor: '01',
        bab: 'Ikhtisar & Sejarah',
        tempat: 'UNESCO 00112 · Tosan Aji',
        judul: 'Mahakarya Metalurgi Tempa Lipat Empu Jawa',
        uraian:
          'Perhatikan proporsi utuh Keris Luk 5 beserta Warangka Gayaman kayu jati. Bilah ditempa miring (condong leleh) sebagai lambang sikap hormat dan kerendahan hati.',
        rotasiY: 0.28,
        rotasiX: 0.08,
        zoom: 2.65,
        indeksTitik: 0,
      },
      {
        nomor: '02',
        bab: 'Wilah Luk 5',
        tempat: 'Titik Anatomi 01 · Bilah Utama',
        judul: 'Kelokan Ganjil Luk 5 & Ketajaman Ilmu',
        uraian:
          'Kamera mendekat ke punggung bilah (wilah). Lima kelokan melambangkan kemampuan mengendalikan pancaindra dan keteguhan menjaga amanah.',
        rotasiY: -0.15,
        rotasiX: 0.18,
        zoom: 2.05,
        indeksTitik: 0,
      },
      {
        nomor: '03',
        bab: 'Ganja & Kembang Kacang',
        tempat: 'Titik Anatomi 02 · Pangkal Asimetris',
        judul: 'Penyatuan Wilah dan Ganja (Curiga Manjing Warangka)',
        uraian:
          'Di pangkal bilah terdapat ganja melintang menyerupai sirah cecak dan gelung kembang kacang di sisi depan yang melindungi jari pemegang.',
        rotasiY: 0.52,
        rotasiX: -0.08,
        zoom: 1.95,
        indeksTitik: 1,
      },
      {
        nomor: '04',
        bab: 'Pamor Wos Wutah',
        tempat: 'Titik Anatomi 03 · Serat Logam',
        judul: 'Guratan Keperakan Nikel dari Proses Warangan',
        uraian:
          'Alur putih keperakan pada permukaan bilah muncul saat larutan warangan menghitamkan besi namun membiarkan lapisan nikel tetap berkilau.',
        rotasiY: -0.42,
        rotasiX: 0.06,
        zoom: 1.9,
        indeksTitik: 2,
      },
      {
        nomor: '05',
        bab: 'Hulu & Warangka',
        tempat: 'Titik Anatomi 04 · Kayu Jati & Pendok',
        judul: 'Deder Nunggak Semi & Sarung Gayaman Berpendok Emas',
        uraian:
          'Gagang kayu jati berukir merunduk dipadukan cincin mendak berpermata dan warangka gayaman berlapis pendok emas.',
        rotasiY: 0.68,
        rotasiX: -0.16,
        zoom: 2.25,
        indeksTitik: 3,
      },
    ],
  },
  saron: {
    nomorIndeks: '02',
    eraSejarah: 'Abad ke-8 M (Relief Candi Borobudur) hingga Karawitan Keraton',
    asalDaerah: 'Yogyakarta & Surakarta · Ansambel Gangsa Laras Slendro',
    intisariSains:
      'Akustik metalurgi paduan perunggu timah tinggi (gangsa: 10 bagian tembaga + 3 bagian timah putih) dengan ruang resonansi kolektif pada kotak kayu rancakan.',
    metrik: [
      {
        label: 'Paduan Logam Gangsa',
        nilai: 'Cu-Sn (Tiga-Sepuluh)',
        keterangan: 'Perbandingan 10 tembaga dan 3 timah putih yang ditempa panas agar tidak pecah dan berdering jernih.',
      },
      {
        label: 'Sistem Tangga Nada',
        nilai: '7 Wilah Laras Slendro',
        keterangan: 'Susunan bilah cembung dari nada rendah Nem Ageng (6̣) hingga Ji Alit (1̇) pembawa balungan gending.',
      },
      {
        label: 'Pengakuan Dunia',
        nilai: 'UNESCO 01760',
        keterangan: 'Ditetapkan UNESCO pada Desember 2021 sebagai warisan budaya takbenda ansambel karawitan Indonesia.',
      },
    ],
    linimasaSejarah: [
      {
        periode: 'Abad ke-8 .. ke-9 M',
        judul: 'Relief Instrumen Bilah Logam pada Dinding Candi Borobudur',
        uraian:
          'Pahatan batu Candi Borobudur telah mendokumentasikan ansambel perkusi bilah logam dan gong yang dimainkan dalam upacara keagamaan dan istana.',
      },
      {
        periode: 'Abad ke-15 .. ke-18 M',
        judul: 'Pembakuan Ricikan Balungan dalam Gamelan Ageng Keraton',
        uraian:
          'Saron barung ditetapkan sebagai tulang punggung melodi pokok (balungan) yang memandu instrumen garap lainnya dalam laras slendro dan pelog.',
      },
      {
        periode: 'Abad ke-20 .. 2021',
        judul: 'Pedagogi Karawitan Dunia & Penetapan UNESCO 01760',
        uraian:
          'Gamelan dipelajari di ratusan universitas dunia sebagai model musik ansambel kolaboratif dan resmi diakui UNESCO pada tahun 2021.',
      },
    ],
    langkahScroll3D: [
      {
        nomor: '01',
        bab: 'Ikhtisar & Sejarah',
        tempat: 'UNESCO 01760 · Karawitan',
        judul: 'Penjaga Kerangka Melodi (Balungan) Gamelan Jawa',
        uraian:
          'Saron Barung menyatukan 7 bilah perunggu tempa di atas rancakan kayu jati berukir prada emas.',
        rotasiY: 0.22,
        rotasiX: 0.24,
        zoom: 2.65,
        indeksTitik: 0,
      },
      {
        nomor: '02',
        bab: '7 Wilah Gangsa',
        tempat: 'Titik Anatomi 01 · Bilah Perunggu',
        judul: 'Profil Cembung (Uger) & Penalaan Kikir Tangan',
        uraian:
          'Tiap bilah perunggu ditempa cembung di bagian tengah untuk memusatkan gelombang akustik dan ditala secara presisi oleh pande gamelan.',
        rotasiY: 0.04,
        rotasiX: 0.42,
        zoom: 2.1,
        indeksTitik: 0,
      },
      {
        nomor: '03',
        bab: 'Rancakan Resonator',
        tempat: 'Titik Anatomi 02 · Kotak Gema',
        judul: 'Rongga Akustik Kayu Jati Berukir Lung-lungan Emas',
        uraian:
          'Kotak kayu berongga di bawah bilah memperkuat frekuensi dasar perunggu sehingga denting saron terdengar bulat di seluruh ruang pendopo.',
        rotasiY: -0.35,
        rotasiX: 0.08,
        zoom: 2.2,
        indeksTitik: 1,
      },
      {
        nomor: '04',
        bab: 'Tabuh & Teknik Pithat',
        tempat: 'Titik Anatomi 03 · Pemukul Kayu',
        judul: 'Koordinasi Tangan Kanan Menabuh & Tangan Kiri Memencet',
        uraian:
          'Pemukul kayu miring diayunkan tangan kanan, sementara jari tangan kiri meredam bilah sebelumnya agar gema nada tetap bersih.',
        rotasiY: 0.48,
        rotasiX: 0.22,
        zoom: 2.0,
        indeksTitik: 2,
      },
      {
        nomor: '05',
        bab: 'Paku & Kasuran',
        tempat: 'Titik Anatomi 04 · Suspensi Akustik',
        judul: 'Bantalan Kasuran yang Menjaga Getaran Bebas Bilah',
        uraian:
          'Tali bantalan lunak dan paku penyangga di kedua ujung bilah ditempatkan tepat pada titik simpul gelombang (node) agar bilah berdering panjang.',
        rotasiY: -0.52,
        rotasiX: 0.28,
        zoom: 2.05,
        indeksTitik: 3,
      },
    ],
  },
  batik: {
    nomorIndeks: '03',
    eraSejarah: 'Abad ke-12 M hingga Tradisi Batik Tulis Pedalaman Keraton',
    asalDaerah: 'Yogyakarta & Surakarta · Wastra Sogan Klasik',
    intisariSains:
      'Kimia rintang warna (wax-resist dyeing) menggunakan cairan lilin malam bersuhu 60..70 °C yang menahan penetrasi zat warna alam soga pada serat selulosa kain mori.',
    metrik: [
      {
        label: 'Sains Rintang Warna',
        nilai: 'Malam Panas 65 °C',
        keterangan: 'Campuran gondorukem, damar, parafin, dan lilin lebah yang menutup pori serat kain mori.',
      },
      {
        label: 'Instrumen Presisi',
        nilai: 'Canting Cucuk Tembaga',
        keterangan: 'Logam tembaga menyimpan panas merata sehingga cairan malam mengalir stabil membentuk titik (cecek) dan garis.',
      },
      {
        label: 'Pengakuan Dunia',
        nilai: 'UNESCO 00170',
        keterangan: 'Ditetapkan UNESCO pada 2 Oktober 2009 sebagai Warisan Budaya Takbenda Kemanusiaan.',
      },
    ],
    linimasaSejarah: [
      {
        periode: 'Abad ke-12 .. ke-16 M',
        judul: 'Ragam Hias Geometris Kawung & Parang pada Arca dan Naskah Kuno',
        uraian:
          'Pola empat bulatan bersinggungan (Kawung) dan sulur miring (Parang) terpahat pada busana arca-arca batu periode Kediri hingga Majapahit.',
      },
      {
        periode: 'Abad ke-18 .. ke-19 M',
        judul: 'Aturan Awisan Dalem (Motif Larangan) & Pewarna Alam Sogan',
        uraian:
          'Di keraton Yogyakarta dan Surakarta, motif tertentu memiliki tata aturan filosofis khusus dan diwarnai dengan kulit kayu soga tingi, jambal, dan tegeran.',
      },
      {
        periode: '2 Oktober 2009 .. Kini',
        judul: 'Hari Batik Nasional & Pelestarian Kriya Canting Tulis',
        uraian:
          'Pengakuan UNESCO mengukuhkan batik tulis sebagai simbol identitas nasional yang memadukan sains kimia tekstil dan meditasi kesabaran.',
      },
    ],
    langkahScroll3D: [
      {
        nomor: '01',
        bab: 'Ikhtisar & Sejarah',
        tempat: 'UNESCO 00170 · Wastra Nusantara',
        judul: 'Sains Rintang Warna Malam & Filosofi Siklus Kehidupan',
        uraian:
          'Eksibisi 3D menampilkan kain mori pada gawangan kayu jati, canting tembaga yang menggoreskan jejak malam emas, serta anglo dan wajan pemanas.',
        rotasiY: 0.32,
        rotasiX: 0.16,
        zoom: 2.65,
        indeksTitik: 0,
      },
      {
        nomor: '02',
        bab: 'Canting Tulis',
        tempat: 'Titik Anatomi 01 · Nyamplungan & Cucuk',
        judul: 'Pena Tembaga Penyimpan Kalor Malam Cair',
        uraian:
          'Wadah nyamplungan tembaga menjaga viskositas malam cair agar keluar secara terukur melalui pipa cucuk ke permukaan kain.',
        rotasiY: 0.18,
        rotasiX: 0.22,
        zoom: 1.95,
        indeksTitik: 0,
      },
      {
        nomor: '03',
        bab: 'Motif Kawung & Parang',
        tempat: 'Titik Anatomi 02 · Geometri Filosofis',
        judul: 'Kiblat Papat Lima Pancer & Kesinambungan Perjuangan',
        uraian:
          'Empat bulatan Kawung melambangkan kemurnian hati dan keseimbangan kosmos, sementara lereng Parang melambangkan keteguhan yang tak pernah putus.',
        rotasiY: -0.08,
        rotasiX: 0.12,
        zoom: 2.0,
        indeksTitik: 1,
      },
      {
        nomor: '04',
        bab: 'Gawangan Kayu',
        tempat: 'Titik Anatomi 03 · Penyangga Kain',
        judul: 'Ergonomi Kerja Pembatik di Atas Palang Kayu Jati',
        uraian:
          'Gawangan kayu menahan bentangan kain mori agar tangan kiri pembatik dapat menyangga bagian bawah kain saat tangan kanan melukis.',
        rotasiY: -0.45,
        rotasiX: 0.18,
        zoom: 2.25,
        indeksTitik: 2,
      },
      {
        nomor: '05',
        bab: 'Wajan & Anglo',
        tempat: 'Titik Anatomi 04 · Termodinamika Malam',
        judul: 'Tungku Terakota & Kestabilan Suhu Malam Panas',
        uraian:
          'Bara arang di dalam anglo tanah liat menjaga malam di wajan besi tetap cair tanpa hangus, ditandai uap tipis yang membubung.',
        rotasiY: 0.58,
        rotasiX: -0.14,
        zoom: 2.05,
        indeksTitik: 3,
      },
    ],
  },
  joglo: {
    nomorIndeks: '04',
    eraSejarah: 'Warisan Arsitektur Jawa Kuno hingga Pendopo Agung Sonobudoyo (1935)',
    asalDaerah: 'Daerah Istimewa Yogyakarta & Jawa Tengah',
    intisariSains:
      'Rekayasa struktur kayu tahan gempa berbasis sambungan takik-pasak (cathokan & purus) tanpa paku besi dan isolator geser batu andesit (umpak).',
    metrik: [
      {
        label: 'Inti Struktur',
        nilai: '4 Saka Guru & Umpak',
        keterangan: 'Empat tiang kayu jati utama berdiri bebas di atas batu sendi andesit untuk meredam gaya geser gempa.',
      },
      {
        label: 'Konstruksi Langit-langit',
        nilai: 'Tumpang Sari 5 Tingkat',
        keterangan: 'Susunan balok kayu mengunci secara cincin (ring beam) yang mendistribusikan beban atap secara merata.',
      },
      {
        label: 'Rujukan Cagar Budaya',
        nilai: 'Sonobudoyo 1935',
        keterangan: 'Dirancang dengan prinsip konstruksi pendopo Joglo klasik di jantung kawasan budaya Yogyakarta.',
      },
    ],
    linimasaSejarah: [
      {
        periode: 'Abad ke-9 .. ke-14 M',
        judul: 'Evolusi Atap Tajug & Struktur Tiang Kayu di Tanah Vulkanik Jawa',
        uraian:
          'Masyarakat Jawa mengembangkan bangunan kayu bersendi batu umpak yang mampu bertahan menghadapi aktivitas seismik gunung berapi.',
      },
      {
        periode: 'Abad ke-17 .. ke-19 M',
        judul: 'Kanonisasi Pendopo Joglo dengan Atap Brunjung & Tumpang Sari',
        uraian:
          'Bentuk atap menjulang tinggi (brunjung) di atas empat Saka Guru menjadi ciri khas bangunan bangsal keraton dan pendopo kabupaten.',
      },
      {
        periode: '1935 .. Kini',
        judul: 'Pendopo Museum Sonobudoyo & Kajian Rekayasa Tahan Gempa Modern',
        uraian:
          'Arsitek modern dan peneliti struktur bangunan mengkaji sambungan purus-cathokan Joglo sebagai sistem peredam energi gempa pasif yang brilian.',
      },
    ],
    langkahScroll3D: [
      {
        nomor: '01',
        bab: 'Ikhtisar & Sejarah',
        tempat: 'Cagar Budaya DIY · Rekayasa Kayu',
        judul: 'Harmoni Kosmologi Gunung Mahameru & Ketahanan Gempa',
        uraian:
          'Model 3D Pendopo Joglo memperlihatkan kesatuan fondasi umpak, tiang Saka Guru, balok Tumpang Sari, dan atap Brunjung terakota.',
        rotasiY: 0.42,
        rotasiX: 0.18,
        zoom: 2.65,
        indeksTitik: 0,
      },
      {
        nomor: '02',
        bab: 'Atap Brunjung',
        tempat: 'Titik Anatomi 01 · Tajug Puncak',
        judul: 'Kemiringan Curam Pengalir Hujan Tropis & Sirkulasi Udara',
        uraian:
          'Atap tengah yang menjulang tinggi menciptakan ruang udara panas naik ke puncak, menjaga lantai pendopo tetap sejuk tanpa dinding penutup.',
        rotasiY: 0.15,
        rotasiX: 0.32,
        zoom: 2.15,
        indeksTitik: 0,
      },
      {
        nomor: '03',
        bab: 'Tumpang Sari',
        tempat: 'Titik Anatomi 02 · Balok Bersusun',
        judul: 'Kunci Cincin Kayu Jati Tanpa Paku Besi',
        uraian:
          'Lima lapis balok Tumpang Sari saling mengunci di atas Saka Guru; ketika diguncang gempa, gesekan antarkayu menyerap energi kinetik.',
        rotasiY: -0.28,
        rotasiX: 0.08,
        zoom: 2.0,
        indeksTitik: 1,
      },
      {
        nomor: '04',
        bab: 'Empat Saka Guru',
        tempat: 'Titik Anatomi 03 · Tiang Inti',
        judul: 'Poros Penyangga Pusat Empat Penjuru Mata Angin',
        uraian:
          'Empat tiang kayu jati utuh menyalurkan beban vertikal atap langsung ke batu umpak sembari menjaga kelenturan rangka tengah.',
        rotasiY: 0.55,
        rotasiX: -0.05,
        zoom: 2.05,
        indeksTitik: 2,
      },
      {
        nomor: '05',
        bab: 'Umpak Andesit',
        tempat: 'Titik Anatomi 04 · Isolator Seismik',
        judul: 'Sendi Batu Vulkanik Peredam Getaran Tanah',
        uraian:
          'Kaki tiang tidak ditanam mati ke tanah melainkan bertumpu di atas umpak batu andesit, mencegah pelapukan kayu dan memutus rambatan gempa.',
        rotasiY: -0.48,
        rotasiX: -0.18,
        zoom: 2.1,
        indeksTitik: 3,
      },
    ],
  },
  wayang: {
    nomorIndeks: '05',
    eraSejarah: 'Abad ke-10 M (Prasasti Balitung 907 M) hingga Pakeliran Klasik',
    asalDaerah: 'Yogyakarta & Jawa Tengah · Seni Tatah Sungging & Pedalangan',
    intisariSains:
      'Optika proyeksi bayangan lampu minyak blencong di atas layar kain mori (kelir) melalui pahatan tembus berlubang (krawangan) dan artikulasi sendi mekanis.',
    metrik: [
      {
        label: 'Teknik Kriya Pahat',
        nilai: 'Tatah Krawangan 3D',
        keterangan: 'Ratusan pahatan lubang halus (inten-intenan, sembuliyan) agar cahaya blencong menembus bayangan.',
      },
      {
        label: 'Mekanisme Gerak',
        nilai: 'Gapit Tanduk & Tuding',
        keterangan: 'Poros utama tanduk kerbau (cempurit) dan engsel dua ruas lengan untuk olah sabetan dalang.',
      },
      {
        label: 'Pengakuan Dunia',
        nilai: 'UNESCO 00063',
        keterangan: 'Diproklamasikan UNESCO pada 7 November 2003 sebagai Masterpiece of Oral and Intangible Heritage.',
      },
    ],
    linimasaSejarah: [
      {
        periode: '907 M (Prasasti Balitung)',
        judul: 'Catatan Tertua Pertunjukan Wayang ("Si Galigi Mawayang")',
        uraian:
          'Prasasti Tembaga Dyah Balitung tahun 907 M mencatat pertunjukan mawayang yang membawakan kisah kepahlawanan bagi para dewa dan masyarakat.',
      },
      {
        periode: 'Abad ke-16 .. ke-18 M',
        judul: 'Penyempurnaan Tatah-Sungging, Sendi Lengan, & Gunungan Kayon',
        uraian:
          'Para seniman dan wali menyempurnakan proporsi wayang purwa, artikulasi sendi bahu-siku bertuding, serta simbol pohon kehidupan Gunungan (Kayon).',
      },
      {
        periode: '7 November 2003 .. Kini',
        judul: 'Pengakuan UNESCO 00063 & Hari Wayang Nasional',
        uraian:
          'UNESCO mengukuhkan teater boneka wayang sebagai mahakarya sastra lisan, seni rupa tatah-sungging, dan filsafat etika Nusantara.',
      },
    ],
    langkahScroll3D: [
      {
        nomor: '01',
        bab: 'Ikhtisar & Sejarah',
        tempat: 'UNESCO 00063 · Pakeliran',
        judul: 'Perpaduan Sastra Epos, Kriya Tatah-Sungging, & Seni Bayangan',
        uraian:
          'Amati kedalaman relief 3D Sri Rama dan Gunungan Kayon lengkap dengan lubang pahatan krawangan yang ditembus cahaya lampu blencong.',
        rotasiY: 0.22,
        rotasiX: 0.08,
        zoom: 2.65,
        indeksTitik: 0,
      },
      {
        nomor: '02',
        bab: 'Awak & Gelung',
        tempat: 'Titik Anatomi 01 · Tatah Sungging',
        judul: 'Mahkota Gelung Supit Urang, Praba, & Dodot Parang Sogan',
        uraian:
          'Setiap bagian tubuh dipahat bertingkat dan disungging dengan gradasi warna prada emas, merah sogan, dan hitam.',
        rotasiY: -0.22,
        rotasiX: 0.16,
        zoom: 2.0,
        indeksTitik: 0,
      },
      {
        nomor: '03',
        bab: 'Cempurit Tanduk',
        tempat: 'Titik Anatomi 02 · Gapit Utama',
        judul: 'Tulang Punggung Tanduk Kerbau Penjepit Wayang',
        uraian:
          'Gapit tanduk kerbau menjepit wayang dari puncak mahkota hingga meruncing di bagian bawah untuk ditancapkan ke batang pisang (gedebog).',
        rotasiY: 0.42,
        rotasiX: -0.18,
        zoom: 2.1,
        indeksTitik: 1,
      },
      {
        nomor: '04',
        bab: 'Tuding & Gendewa',
        tempat: 'Titik Anatomi 03 · Engsel Sendi',
        judul: 'Artikulasi Dua Lengan & Busur Panah Ksatria',
        uraian:
          'Sendi bahu dan siku yang dihubungkan tangkai tuding memungkinkan Sri Rama merentangkan busur Gendewa dan melesatkan panah Guwawijaya.',
        rotasiY: 0.52,
        rotasiX: 0.06,
        zoom: 1.95,
        indeksTitik: 2,
      },
      {
        nomor: '05',
        bab: 'Gunungan Kayon',
        tempat: 'Titik Anatomi 04 · Simbol Jagat Raya',
        judul: 'Gapura Candi, Banaspati, & Pohon Kehidupan Kalpataru',
        uraian:
          'Gunungan 3D di sisi kiri menampilkan pahatan tembus gapura beratap bertingkat, penjaga kembar, dan sulur pohon hayat.',
        rotasiY: -0.45,
        rotasiX: 0.12,
        zoom: 2.05,
        indeksTitik: 3,
      },
    ],
  },
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
