export type BahasaAktif = 'id' | 'jw' | 'aks';

export type KodeSumber = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';

export interface MultiTeks {
  id: string;
  jw: string;
}

export interface SumberKajian {
  kode: KodeSumber;
  judul: string;
  lembaga: string;
  tahun: string;
  tautan: string;
  ringkasan: string;
}

export interface TitikInfoPusaka {
  id: string;
  judul: MultiTeks;
  posisi: [number, number, number];
  ringkasan: MultiTeks;
  sumber: KodeSumber[];
}

export interface BendaPusaka {
  id: 'keris' | 'saron' | 'batik' | 'joglo' | 'wayang';
  nomorUrut: string;
  dioramaLabel: string;
  zonaKode: string;
  badgeStatus?: string;
  warnaAksen: string;
  nama: MultiTeks;
  subjudul: MultiTeks;
  kategori: MultiTeks;
  asal: MultiTeks;
  spesifikasiKurasi: Array<{ label: string; nilai: string }>;
  ringkas: MultiTeks;
  sejarahSingkat: MultiTeks;
  filosofi: MultiTeks;
  sulukLarik: MultiTeks[];
  sumber: KodeSumber[];
  titikInfo: TitikInfoPusaka[];
  pertanyaanContoh: string[];
}

export interface BabakLakon {
  id: string;
  nomor: number;
  judul: MultiTeks;
  lokasi: MultiTeks;
  narasiDalang: MultiTeks;
  suluk: string;
  posisiAwalRama: number;
  posisiAwalKidang: number;
  sumber: KodeSumber[];
}

export interface LakonWayang {
  id: string;
  judul: MultiTeks;
  sumberEpos: MultiTeks;
  sumber: KodeSumber[];
  daftarBabak: BabakLakon[];
}

export interface KronikPusaka {
  bendaId: BendaPusaka['id'];
  nomor: string;
  kodeArsip: string;
  judul: MultiTeks;
  sorotan: MultiTeks;
  narasiMendalam: MultiTeks;
  metrik: Array<{ label: string; nilai: string; persen: number }>;
  pose3D: {
    rotasiY: number;
    zoom: number;
    explode: number;
    kameraTarget: [number, number, number];
    kameraPosisi: [number, number, number];
  };
  sumber: KodeSumber[];
}

export interface KawruhFilosofi {
  id: string;
  istilah: string;
  aksara: string;
  judul: MultiTeks;
  makna: MultiTeks;
  keterkaitan: MultiTeks;
  sumber: KodeSumber[];
}

export interface ItemEtalase {
  id: string;
  bendaId: BendaPusaka['id'];
  titikId?: string;
  halamanTarget?: 'twin' | 'pakeliran' | 'kawruh';
  anchorTarget?: string;
  kategoriKey: 'tosan-aji' | 'karawitan' | 'wastra' | 'arsitektur' | 'pakeliran';
  judul: string;
  subjudul: string;
  kodeArsip: string;
  spesifikasi: string;
  aksara: string;
  aksen: string;
  ikonTipe: BendaPusaka['id'];
}

export interface MatrixItem {
  id: string;
  label: string;
  sub: string;
  aksara: string;
  kodeArsip: string;
  spesifikasi: string;
  bendaId?: BendaPusaka['id'];
  titikId?: string;
  halamanTarget?: 'twin' | 'pakeliran' | 'kawruh';
  anchorTarget?: string;
  ctaLabel?: string;
  warna: string;
  pola: 'grid' | 'gelombang' | 'cakra' | 'bilah' | 'gunungan';
}

export function ambilTeks(teks: MultiTeks, bahasa: BahasaAktif): string {
  return bahasa === 'id' ? teks.id : teks.jw;
}

const AKSEN_TEMA_BENDA: Record<BendaPusaka['id'], { terang: string; malam: string }> = {
  keris: { terang: '#c24117', malam: '#f27c4e' },
  saron: { terang: '#8c6014', malam: '#e6ba63' },
  batik: { terang: '#a8521f', malam: '#ed9158' },
  joglo: { terang: '#445b6e', malam: '#93b7d1' },
  wayang: { terang: '#a32b20', malam: '#ed6d5e' },
};

/** Mengembalikan warna aksen pusaka berdasar kontras tema terang/malam. */
export function ambilAksenBenda(id: BendaPusaka['id'], tema: 'malam' | 'terang'): string {
  return AKSEN_TEMA_BENDA[id][tema];
}

export const DAFTAR_SUMBER: Record<KodeSumber, SumberKajian> = {
  S1: {
    kode: 'S1',
    judul: 'Indonesian Keris — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2008',
    tautan: 'https://ich.unesco.org/en/RL/indonesian-keris-00112',
    ringkasan:
      'Penetapan Keris Indonesia sebagai Warisan Budaya Takbenda, membahas fungsi spiritual, tata tempa pamor besi-nikel oleh empu, serta anatomi bilah dan warangka.',
  },
  S2: {
    kode: 'S2',
    judul: 'Indonesian Batik — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2009',
    tautan: 'https://ich.unesco.org/en/RL/indonesian-batik-00170',
    ringkasan:
      'Dokumentasi teknik rintang malam menggunakan canting tulis, makna motif klasik keraton seperti Kawung dan Parang, serta siklus hidup manusia dalam wastra.',
  },
  S3: {
    kode: 'S3',
    judul: 'Wayang Puppet Theatre — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2008',
    tautan: 'https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063',
    ringkasan:
      'Penjelasan pertunjukan wayang kulit berlayar kelir dan lampu blencong, tatahan kulit kerbau bertangkai tanduk cempurit/tuding, serta peran dalang.',
  },
  S4: {
    kode: 'S4',
    judul: 'Gamelan — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2021',
    tautan: 'https://ich.unesco.org/en/RL/gamelan-01607',
    ringkasan:
      'Struktur instrumen karawitan Jawa meliputi bilah perunggu saron, kendang, gong ageng, sistem pelarasan Slendro & Pelog, serta nilai gotong royong musikal.',
  },
  S5: {
    kode: 'S5',
    judul: 'Kajian Lakon Ramayana Tradisi Yogyakarta & Surakarta',
    lembaga: 'Museum Sonobudoyo & ISI Surakarta',
    tahun: '2019',
    tautan: 'https://sonobudoyo.jogjaprov.go.id',
    ringkasan:
      'Dokumentasi struktur pakeliran Ramayana epik Aranya Kanda mengenai muslihat Marica berwujud Kijang Kencana, suluk dalang, serta sabetan panah Sri Rama.',
  },
  S6: {
    kode: 'S6',
    judul: 'Arsitektur Vernakular Jawa: Konstruksi Pendopo Joglo & Tumpang Sari',
    lembaga: 'Kemdikbud RI — Direktorat Pelindungan Kebudayaan',
    tahun: '2020',
    tautan: 'https://kebudayaan.kemdikbud.go.id',
    ringkasan:
      'Studi sambungan pasak kayu jati tanpa paku logam pada empat saka guru Joglo, penutup atap tajug berundak, dan hierarki ruang pendopo-pringgitan-dalem.',
  },
  S7: {
    kode: 'S7',
    judul: 'Pedoman Ejaan & Transliterasi Aksara Jawa (Hanacaraka)',
    lembaga: 'Kongres Bahasa Jawa & Perpustakaan Nasional RI',
    tahun: '2021',
    tautan: 'https://www.perpusnas.go.id',
    ringkasan:
      'Aturan standar 20 aksara nglegena Hanacaraka, pasangan, sandhangan swara, panyigeg wanda, serta standar pengkodean Unicode blok U+A980–U+A9DF.',
  },
};

export const DAFTAR_BENDA: BendaPusaka[] = [
  {
    id: 'keris',
    nomorUrut: '01',
    dioramaLabel: 'BESALEN EMPU',
    zonaKode: 'ZON-01 · BESALEN MATARAM',
    badgeStatus: 'UNESCO 2008',
    warnaAksen: '#d1491b',
    nama: { id: 'Keris Luk 5', jw: 'Dhuwung Luk Lima' },
    subjudul: {
      id: 'Pandawa Lima & Tata Tempa Pamor Besi-Nikel',
      jw: 'Pandhawa Lima saha Pamor Wesi-Nikel',
    },
    kategori: { id: 'Tosan Aji', jw: 'Tosan Aji' },
    asal: { id: 'Keraton Surakarta & Yogyakarta', jw: 'Kraton Surakarta saha Ngayogyakarta' },
    spesifikasiKurasi: [
      { label: 'Katalog', nilai: 'KLR-01 · S1' },
      { label: 'Material', nilai: 'Baja Inti & Nikel' },
      { label: 'Bentuk', nilai: 'Luk 5 Simetris' },
    ],
    ringkas: {
      id: 'Senjata spiritual berbilah lima kelokan simetris lambang lima kebajikan Pandawa dan keteguhan empu.',
      jw: 'Gaman spiritual kanthi luk lima pralambang kautaman Pandhawa lan kasetyaning empu.',
    },
    sejarahSingkat: {
      id: 'Sejak masa Mataram Hindu hingga Mataram Islam, empu menempa lapisan besi, baja inti, serta batu meteorit berkadar nikel tinggi menjadi ratusan lipatan tempa. Di Jawa, luk berjumlah ganjil selalu memiliki makna doa dan keteguhan diri.',
      jw: 'Wiwit jaman Mataram Kuna nganti Mataram Islam, empu nempa lapisan wesi, waja, lan watu meteorit nikel dadi atusan lipatan pamor. Wilahan kanthi luk ganjil tansah ngemu donga lan kasetyan.',
    },
    filosofi: {
      id: 'Manunggaling kawula lan gusti terwujud lewat penyatuan ganja (penopang horizontal) dan wilah (bilah vertikal) sebagai simbol keselarasan batin.',
      jw: 'Manunggaling kawula gusti kawujud ing nyawijining ganja lan wilah minangka pralambang larasing lahir batin.',
    },
    sulukLarik: [
      {
        id: 'Api prapen besalen menyala lirih di ufuk subuh,',
        jw: 'Geni prapen besalen murub alus ing wayah bangun esuk,',
      },
      {
        id: 'Besi pilihan, baja inti, dan meteorit nikel dilipat beratus kali,',
        jw: 'Wesi pilihan, waja inti, lan nikel meteorit dilipet atusan kaping,',
      },
      {
        id: 'Membentuk pamor Beras Wutah di atas lima kelokan Pandawa,',
        jw: 'Mujudake pamor Wos Wutah ing dhuwur luk lima Pandhawa,',
      },
      {
        id: 'Ganja mendatar memeluk wilah menjulang ke angkasa,',
        jw: 'Ganja malang ngrangkul wilah kang njujug langit,',
      },
      {
        id: 'Bukan alat melukai, melainkan pengingat laku utama manusia.',
        jw: 'Dudu piranti nyiderani, nanging pangeling laku utama manungsa.',
      },
    ],
    sumber: ['S1', 'S7'],
    titikInfo: [
      {
        id: 'keris-wilah',
        judul: { id: 'Wilah & Lima Kelokan (Luk 5)', jw: 'Wilah saha Luk Lima' },
        posisi: [0, 1.35, 0.14],
        ringkasan: {
          id: 'Lima kelokan asimetris yang melambangkan keteguhan hati lima kesatria Pandawa dan keseimbangan langkah.',
          jw: 'Luk lima pralambang kasetyan lan kawicaksanan Pandhawa.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-pamor',
        judul: { id: 'Pamor Beras Wutah', jw: 'Pamor Wos Wutah' },
        posisi: [0.06, 0.45, 0.12],
        ringkasan: {
          id: 'Lapisan kontras antara besi gelap hasil rendaman warangan dan logam nikel terang sebagai simbol kelimpahan rezeki.',
          jw: 'Lapisan kontras wesi ireng warangan lan nikel padhang lambang kamakmuran.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-ganja',
        judul: { id: 'Ganja (Pangkal Wilah)', jw: 'Ganja Dhuwung' },
        posisi: [0, -0.35, 0.12],
        ringkasan: {
          id: 'Bagian melintang yang menyatukan pesi tangkai dengan bilah tajam, melambangkan bumi yang menopang cita-cita luhur.',
          jw: 'Perangan malang kang nyawijekake pesi lan wilah.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-hulu',
        judul: { id: 'Ukiran Hulu & Mendak', jw: 'Deder Ukir saha Mendhak' },
        posisi: [-0.04, -1.05, 0.12],
        ringkasan: {
          id: 'Pegangan kayu trembalo berukir patra dan cincin logam berpermata untuk menjaga ergonomi genggaman.',
          jw: 'Cecekelan kayu trembalo ukir lan mendhak cincin logam.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-warangka',
        judul: { id: 'Warangka Gayaman & Pendok', jw: 'Warangka Gayaman saha Pendhok' },
        posisi: [0.56, -0.22, -0.38],
        ringkasan: {
          id: 'Sarung pelindung bilah dari kayu kemuning-timoho berpadu selubung logam berukir (pendok) guna menjaga ketajaman dan wibawa keris.',
          jw: 'Wadhah wilah saking kayu kemuning pinasangan pendhok kuningan kangge njaga dhuwung.',
        },
        sumber: ['S1'],
      },
    ],
    pertanyaanContoh: [
      'Mengapa Keris Luk 5 identik dengan filosofi Pandawa?',
      'Bagaimana cara empu membentuk motif pamor di bilah keris?',
      'Apa arti kesatuan ganja dan wilah pada dhuwung?',
    ],
  },
  {
    id: 'saron',
    nomorUrut: '02',
    dioramaLabel: 'BALE KARAWITAN',
    zonaKode: 'ZON-02 · KARAWITAN SLENDRO',
    badgeStatus: 'UNESCO 2021',
    warnaAksen: '#9a6c1d',
    nama: { id: 'Saron Laras Slendro', jw: 'Saron Barung Slendro' },
    subjudul: {
      id: 'Enam Bilah Perunggu & Rancakan Kayu Jati Ukir',
      jw: 'Enem Wilah Gangsa saha Rancakan Jati Ukir',
    },
    kategori: { id: 'Karawitan', jw: 'Karawitan' },
    asal: { id: 'Jawa Tengah & Yogyakarta', jw: 'Jawa Tengah saha Ngayogyakarta' },
    spesifikasiKurasi: [
      { label: 'Katalog', nilai: 'KLR-02 · S4' },
      { label: 'Paduan', nilai: 'Gangsa 78/22' },
      { label: 'Larasan', nilai: 'Slendro 6 Bilah' },
    ],
    ringkas: {
      id: 'Instrumen pembawa kerangka melodi (balungan) dalam ansambel gamelan dengan enam bilah nada Slendro jernih.',
      jw: 'Piranti panyangga lagu pokok (balungan) ing gamelan kanthi swara gangsa kang bening.',
    },
    sejarahSingkat: {
      id: 'Dipadukan dari perunggu gangsa (campuran tembaga dan timah putih berkualitas tinggi), bilah saron ditempa serta dilaras melalui pengikisan ketebalan agar menghasilkan dengung harmonis yang saling menimpali.',
      jw: 'Kagawe saka gangsa (campuran tembaga lan timah), wilah saron ditempa lan dilaras nganti ngasilake swara kang gumelar endah.',
    },
    filosofi: {
      id: 'Permainan tabuh diikuti teknik pijetan (meredam nada sebelumnya menggunakan ibu jari dan telunjuk kiri) melatih fokus serta pengendalian diri.',
      jw: 'Nabuh sinambi mijet wilah sadurunge nglatih konsentrasi saha ngendhaleni hawa nafsu.',
    },
    sulukLarik: [
      {
        id: 'Enam bilah perunggu gangsa berbaris rapi di atas palungan jati,',
        jw: 'Enem wilah gangsa jajar runtut ing dhuwur rancakan jati,',
      },
      {
        id: 'Laras Slendro membawa lima nada pentatonis sejajar,',
        jw: 'Laras Slendro nggawa limang swara pentatonis kang timbang,',
      },
      {
        id: 'Tangan kanan memukul ganden, tangan kiri memijet getaran lama,',
        jw: 'Tangan tengen nabuh ganden, tangan kiwa nyigeg swara lawas,',
      },
      {
        id: 'Menjaga kerangka balungan gending tetap ajeg bersatu,',
        jw: 'Njaga balungan gendhing supaya tetep runtut nyawiji,',
      },
      {
        id: 'Harmoni muncul bukan karena suara keras, melainkan saling mendengar.',
        jw: 'Larasing swara tuwuh dudu amarga banter, nanging padha ngrungokake.',
      },
    ],
    sumber: ['S4'],
    titikInfo: [
      {
        id: 'saron-wilah',
        judul: { id: 'Enam Bilah Perunggu Gangsa', jw: 'Enem Wilah Gangsa' },
        posisi: [0, 0.42, 0.2],
        ringkasan: {
          id: 'Enam bilah nada 1–2–3–5–6–i bertumpu pada paku penyangga (tawonan) agar getaran bebas bergema.',
          jw: 'Enem wilah nada 1–2–3–5–6–i kang gumantung ing tawonan.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-rancakan',
        judul: { id: 'Palungan Resonator Kayu Jati', jw: 'Rancakan Kayu Jati' },
        posisi: [-0.8, 0.05, 0.25],
        ringkasan: {
          id: 'Badan berongga dari kayu jati tua yang berfungsi memantulkan gelombang akustik ke telinga pendengar.',
          jw: 'Awak rancakan krowok kanggo mantulake swara.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-ganden',
        judul: { id: 'Tabuh Ganden Kayu Sawo', jw: 'Tabuh Gandhen Kayu Sawo' },
        posisi: [1.15, 0.48, 0.3],
        ringkasan: {
          id: 'Pemukul berbentuk palu lunak dari kayu sawo untuk memperoleh serangan suara hangat tanpa merusak bilah.',
          jw: 'Gandhen kayu sawo kanggo ngasilake swara alus tanpa ngrusak wilah.',
        },
        sumber: ['S4'],
      },
    ],
    pertanyaanContoh: [
      'Bagaimana teknik memijet nada pada permainan Saron?',
      'Apa perbedaan fungsi Saron Barung dengan Demung dan Peking?',
      'Mengapa logam gangsa saron memakai campuran tembaga dan timah?',
    ],
  },
  {
    id: 'batik',
    nomorUrut: '03',
    dioramaLabel: 'GAZEBO WASTRA',
    zonaKode: 'ZON-03 · WASTRA KAWUNG',
    badgeStatus: 'UNESCO 2009',
    warnaAksen: '#b85d28',
    nama: { id: 'Batik Tulis Kawung', jw: 'Sinjang Batik Kawung' },
    subjudul: {
      id: 'Motif Larangan Keraton & Geometri Empat Penjuru',
      jw: 'Motif Awisan Kraton saha Sekawan Keblat',
    },
    kategori: { id: 'Wastra Pusaka', jw: 'Wastra Pusaka' },
    asal: { id: 'Yogyakarta & Solo (Mataram)', jw: 'Ngayogyakarta saha Surakarta' },
    spesifikasiKurasi: [
      { label: 'Katalog', nilai: 'KLR-03 · S2' },
      { label: 'Media', nilai: 'Katun Primissima' },
      { label: 'Pewarna', nilai: 'Soga & Indigo' },
    ],
    ringkas: {
      id: 'Wastra bermotif empat kelopak buah aren simetris hasil torehan malam cair canting tulis sebagai lambang kebijaksanaan adil.',
      jw: 'Kain mawa gambar sekawan kuncup aren kang ditulis nganggo canting malam pralambang adil lan wicaksana.',
    },
    sejarahSingkat: {
      id: 'Pada abad ke-18, motif Kawung termasuk "batik larangan" (awisan dalem) yang hanya dikenakan keluarga keraton. Proses pengerjaannya memakan waktu berbulan-bulan dengan pencelupan warna alam soga dan tarum indigo.',
      jw: 'Ing abad kaping-18, motif Kawung klebu batik larangan kraton kanthi pewarna alam soga coklat lan wedel biru indigo.',
    },
    filosofi: {
      id: 'Empat bulatan melingkari satu pusat mengajarkan konsep Kiblat Papat Lima Pancer — pengendalian diri di antara empat penjuru dunia.',
      jw: 'Sekawan bunderan ngubengi punjer ngemot piwulang Keblat Papat Lima Pancer.',
    },
    sulukLarik: [
      {
        id: 'Mori putih dibentang lembut di hadapan perapian anglo hangat,',
        jw: 'Mori putih gumelar alus ing ngarep anglo anget,',
      },
      {
        id: 'Canting tembaga menorehkan malam cair mengikuti pola simetris,',
        jw: 'Canthing tembaga nggambar malam panas manut pola simetris,',
      },
      {
        id: 'Empat bulatan buah aren mengelilingi satu titik pancer,',
        jw: 'Sekawan bunderan kolang-kaling ngubengi siji punjer,',
      },
      {
        id: 'Soga jingga kecoklatan berpadu pekatnya biru daun tarum,',
        jw: 'Werna soga coklat nyawiji karo biru wedel godhong tom,',
      },
      {
        id: 'Kesabaran berbulan-bulan menjelma doa pelindung pemakainya.',
        jw: 'Kasabaran sasasi-sasi dadi donga pangayoman kanggo kang ngagem.',
      },
    ],
    sumber: ['S2'],
    titikInfo: [
      {
        id: 'batik-pusat',
        judul: { id: 'Simetri Pancer & Empat Kelopak', jw: 'Punjer saha Sekawan Kelopak' },
        posisi: [0, 0.3, 0.3],
        ringkasan: {
          id: 'Pola geometris buah aren yang mengingatkan bahwa pemimpin sejati menjaga keseimbangan pusat batin.',
          jw: 'Pola geometris kolang-kaling pangeling kasaimbangan batin.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-canting',
        judul: { id: 'Canting Tembaga & Lilin Malam', jw: 'Canthing Tembaga saha Malam' },
        posisi: [0.85, 0.55, 0.35],
        ringkasan: {
          id: 'Ujung paruh tembaga berukuran presisi (cecekan hingga klowong) guna menutup serat kain sebelum celup.',
          jw: 'Cucuk tembaga alus kanggo nutup serat mori sadurunge dicelup.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-soga',
        judul: { id: 'Pewarnaan Soga & Lorod', jw: 'Wedelan Soga saha Nglorod' },
        posisi: [-0.85, -0.35, 0.22],
        ringkasan: {
          id: 'Ekstrak kulit kayu tingi, tegeran, dan jambal yang memunculkan gradasi hangat khas Jawa Tengah.',
          jw: 'Ekstrak kulit kayu alami kang nuwuhake werna coklat soga anget.',
        },
        sumber: ['S2'],
      },
    ],
    pertanyaanContoh: [
      'Mengapa motif Kawung dahulu berstatus batik larangan keraton?',
      'Bagaimana urutan proses nyanting hingga nglorod batik tulis?',
      'Apa makna filosofi Keblat Papat Lima Pancer di motif Kawung?',
    ],
  },
  {
    id: 'joglo',
    nomorUrut: '04',
    dioramaLabel: 'PENDOPO AGUNG',
    zonaKode: 'ZON-04 · PENDOPO JOGLO',
    badgeStatus: 'WARISAN ARSITEKTUR',
    warnaAksen: '#516778',
    nama: { id: 'Pendopo Joglo', jw: 'Pendhapa Ageng Joglo' },
    subjudul: {
      id: 'Konstruksi Pasak Kayu Jati & Brunjung Tumpang Sari',
      jw: 'Konstruksi Pasak Jati saha Tumpang Sari',
    },
    kategori: { id: 'Arsitektur Tradisional', jw: 'Arsitektur Jawi' },
    asal: { id: 'Jawa Tengah, Yogyakarta, & Jawa Timur', jw: 'Tlatah Jawi' },
    spesifikasiKurasi: [
      { label: 'Katalog', nilai: 'KLR-04 · S6' },
      { label: 'Struktur', nilai: '4 Saka Guru Jati' },
      { label: 'Sambungan', nilai: 'Pasak Purus Lentur' },
    ],
    ringkas: {
      id: 'Bangunan vernakular tahan gempa dengan empat tiang utama saka guru dan langit-langit bertingkat tanpa sebatang pun paku besi.',
      jw: 'Wewangunan tahan lindhu nganggo sekawan saka guru saha tumpang sari tanpa paku wesi.',
    },
    sejarahSingkat: {
      id: 'Struktur atap limasan menjulang tinggi (brunjung) menciptakan efek cerobong alami yang mendinginkan ruang pendopo tropis sekaligus menunjukkan kesetaraan interaksi sosial yang terbuka dari segala penjuru.',
      jw: 'Payon brunjung kang dhuwur nyiptaake sirkulasi hawa adhem saha nuduhake sipat blaka lan terbuka.',
    },
    filosofi: {
      id: 'Undakan Tumpang Sari menyusun balok jati semakin mengerucut ke puncak — lambang naiknya kesadaran spiritual manusia dari urusan dunia menuju pencipta.',
      jw: 'Undhakan tumpang sari kang saya munggah saya nyawiji minangka pralambang laku spiritual manungsa.',
    },
    sulukLarik: [
      {
        id: 'Empat tiang kayu jati tua berdiri teguh di atas batu umpak,',
        jw: 'Sekawan saka guru kayu jati ngadeg jejeg ing dhuwur umpak,',
      },
      {
        id: 'Saling bertaut melalui pasak kayu purus tanpa paku besi,',
        jw: 'Gegandhengan nganggo pasak kayu purus tanpa paku wesi,',
      },
      {
        id: 'Balok tumpang sari bersusun menyangga atap brunjung menjulang,',
        jw: 'Balok tumpang sari kasusun rapet nyangga brunjung dhuwur,',
      },
      {
        id: 'Tanpa dinding pengadang, pendopo menyambut tamu dari segala penjuru,',
        jw: 'Tanpa pager kanggo nutup, pendhapa nampa tamu saka kabeh arah,',
      },
      {
        id: 'Lentur mengikuti ayunan gempa, teduh melindungi masyarakatnya.',
        jw: 'Lentur ngetutake oyaging lindhu, ayom ngayomi kabeh kulawarga.',
      },
    ],
    sumber: ['S6'],
    titikInfo: [
      {
        id: 'joglo-sakaguru',
        judul: { id: 'Empat Saka Guru & Batu Umpak', jw: 'Sekawan Saka Guru saha Umpak' },
        posisi: [-0.72, -0.32, 0.72],
        ringkasan: {
          id: 'Empat kolom kayu jati masif yang berdiri lentur di atas umpak batu andesit guna meredam getaran seismik tanah.',
          jw: 'Sekawan cagak kayu jati kang ngadeg lentur ing umpak watu andesit.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-tumpangsari',
        judul: { id: 'Susunan Tumpang Sari Bertingkat', jw: 'Undhakan Tumpang Sari' },
        posisi: [0, 0.76, 0.1],
        ringkasan: {
          id: 'Susunan balok bertingkat simetris di atas blandar pamanjang yang mendistribusikan beban atap secara merata.',
          jw: 'Balok tumpuk simetris kang mbagi aboting payon.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-brunjung',
        judul: { id: 'Atap Brunjung & Penanggap', jw: 'Payon Brunjung saha Penanggap' },
        posisi: [0, 1.45, 0],
        ringkasan: {
          id: 'Puncak atap bersudut curam yang memicu sirkulasi udara panas naik ke luar serta memancarkan wibawa bangunan.',
          jw: 'Pucuk payon dhuwur kanggo metokake hawa panas.',
        },
        sumber: ['S6'],
      },
    ],
    pertanyaanContoh: [
      'Mengapa Pendopo Joglo dikenal tangguh menghadapi guncangan gempa?',
      'Apa perbedaan ruang Pendopo, Pringgitan, dan Dalem Ageng?',
      'Bagaimana teknik sambungan pasak kayu tanpa paku besi bekerja?',
    ],
  },
  {
    id: 'wayang',
    nomorUrut: '05',
    dioramaLabel: 'PANGGUNG KELIR',
    zonaKode: 'ZON-05 · PANGGUNG PAKELIRAN',
    badgeStatus: 'UNESCO 2008',
    warnaAksen: '#b33025',
    nama: { id: 'Wayang Kulit Purwa', jw: 'Ringgit Wacucal Purwa' },
    subjudul: {
      id: 'Tatahan Kulit Kerbau, Prada Emas & Tangkai Cempurit',
      jw: 'Tatahan Wacucal Kebo, Prada Mas saha Cempurit',
    },
    kategori: { id: 'Seni Pakeliran', jw: 'Seni Pakeliran' },
    asal: { id: 'Surakarta, Yogyakarta & Jawa Timur', jw: 'Tlatah Jawi' },
    spesifikasiKurasi: [
      { label: 'Katalog', nilai: 'KLR-05 · S3' },
      { label: 'Media', nilai: 'Kulit Kebo & Prada' },
      { label: 'Tangkai', nilai: 'Cempurit Tanduk' },
    ],
    ringkas: {
      id: 'Karya rupa datar dua muka dari kulit kerbau berlubang halus yang dihidupkan bayangan lampu blencong dan gerakan dalang.',
      jw: 'Karya rupa kulit kebo tinatah alus kang urip dening cahya blencong lan olahing dhalang.',
    },
    sejarahSingkat: {
      id: 'Dikerjakan melalui ratusan tusukan pahat khusus (tatah) agar tembus cahaya ketika disinari blencong. Lapisan prada kertas emas dan pigmen sungging memberi dimensi visual baik di sisi penonton langsung maupun bayangan kelir.',
      jw: 'Digarap nganggo atusan tatahan bolongan alus supaya tembus cahya blencong lan dipulas prada mas.',
    },
    filosofi: {
      id: 'Layar kelir membentang laksana alam semesta, gedebog pisang tempat menancapkan lakon, lampu blencong laksana pelita akal budi, dan dalang penggerak kehendak.',
      jw: 'Kelir minangka jagad raya, gedebog minangka bumi, blencong minangka pepadhang urip, lan dhalang minangka pamurbeng lakon.',
    },
    sulukLarik: [
      {
        id: 'Layar blacu putih dibentangkan kencang menghadapi ruang gelap,',
        jw: 'Kelir mori putih pinenthang kenceng ngadhepi petenging wengi,',
      },
      {
        id: 'Lampu blencong menyala, melempar bayangan panjang ke permukaan kain,',
        jw: 'Lampu blencong murub, mbuwang ayang-ayang dawa ing kelir,',
      },
      {
        id: 'Tangkai tanduk kerbau berputar di jemari sang dalang,',
        jw: 'Cempurit sungu kebo mubeng ing drijining ki dhalang,',
      },
      {
        id: 'Ketukan keprak kayu membelah sunyi sebelum perang kembang dimulai,',
        jw: 'Thuthukan keprak nyigar sepi sadurunge perang kembang kawiwitan,',
      },
      {
        id: 'Semua tokoh akhirnya dicabut kembali ke kotak kayu dalam hening fajar.',
        jw: 'Kabeh paraga pungkasane sinimpen maneh ing kothak wayang ing wayah esuk.',
      },
    ],
    sumber: ['S3', 'S5'],
    titikInfo: [
      {
        id: 'wayang-sungging',
        judul: { id: 'Tatahan Halus & Prada Emas', jw: 'Tatahan saha Prada Mas' },
        posisi: [0, 0.55, 0.08],
        ringkasan: {
          id: 'Pahatan pola kawung, seritan, dan sembulihan pada kulit kerbau kering agar cahaya menembus indah.',
          jw: 'Ukiran bolong alus ing kulit kebo supaya nembus sorot blencong.',
        },
        sumber: ['S3'],
      },
      {
        id: 'wayang-tuding',
        judul: { id: 'Engsel Tangan & Tangkai Tuding', jw: 'Sendi Tangan saha Tuding' },
        posisi: [0.58, 0.08, 0.08],
        ringkasan: {
          id: 'Bahu dan siku bertaut tali senar yang dikendalikan dua batang tanduk kerbau putih lentur (tuding).',
          jw: 'Sikut lan pundhak tinangsulan benang saha digerakake nganggo tuding.',
        },
        sumber: ['S3', 'S5'],
      },
      {
        id: 'wayang-cempurit',
        judul: { id: 'Cempurit Utama (Gapit Tanduk)', jw: 'Cempurit Utami' },
        posisi: [0, -1.05, 0.05],
        ringkasan: {
          id: 'Tangkai penjepit tulang tengah dari tanduk kerbau melengkung yang ditancapkan ke batang pisang panggung.',
          jw: 'Gapit sungu kebo ing tengahing awak wayang kanggo nancep ing gedebog.',
        },
        sumber: ['S3'],
      },
      {
        id: 'wayang-blencong',
        judul: { id: 'Pelita Minyak Blencong', jw: 'Lampu Blencong Kuningan' },
        posisi: [-1.18, 0.92, 0.28],
        ringkasan: {
          id: 'Lampu minyak kelapa kuningan bersayap garuda dengan sumbu api menyala yang memancarkan bayangan tatahan wayang ke kelir blacu.',
          jw: 'Pelita kuningan isi lenga klentik mawa swiwi garuda kang madhangi tatahan wayang ing kelir.',
        },
        sumber: ['S3'],
      },
    ],
    pertanyaanContoh: [
      'Apa fungsi tangkai cempurit dan tuding saat dalang menyabet wayang?',
      'Mengapa kulit kerbau digunakan dalam pembuatan wayang kulit purwa?',
      'Bagaimana kisah epik Kijang Kencana dalam pakeliran Ramayana?',
    ],
  },
];

export const KRONIK_SEJARAH_BUDAYA: KronikPusaka[] = [
  {
    bendaId: 'keris',
    nomor: '01',
    kodeArsip: 'KLR-KRN-01 · S1 / S7',
    judul: {
      id: 'Tempaan Pamor & Keseimbangan Lima Kelokan',
      jw: 'Tempahan Pamor saha Kasaimbangan Luk Lima',
    },
    sorotan: {
      id: 'Dari perapian besi prapen hingga lipatan meteorit nikel, setiap detail bilah adalah meditasi ketepatan.',
      jw: 'Saka prapen wesi nganti lipetan nikel meteorit, saben perangan bilah minangka olah rasa katelitian.',
    },
    narasiMendalam: {
      id: 'Dalam anatomi keris Jawa, bilah berkelok ganjil seperti Luk 5 ditempa melalui ratusan pemanasan bersuhu seribu derajat. Lapisan baja inti di bagian tengah diapit besi lunak dan campuran nikel berkilau keperakan.',
      jw: 'Wilah dhuwung luk ganjil ditempa liwat atusan lipetan ing geni prapen kanthi inti waja lan pamor nikel sumunar.',
    },
    metrik: [
      { label: 'Lapisan Lipat Tempa', nilai: '128–512 Lipatan', persen: 92 },
      { label: 'Struktur Kelok Simetris', nilai: 'Luk 5 (Pandawa)', persen: 84 },
      { label: 'Kesesuaian Arsip S1', nilai: 'Terverifikasi UNESCO', persen: 100 },
    ],
    pose3D: {
      rotasiY: 0.45,
      zoom: 1,
      explode: 0.35,
      kameraTarget: [-2.4, 1.35, -1.5],
      kameraPosisi: [2.2, 4.4, 4.6],
    },
    sumber: ['S1', 'S7'],
  },
  {
    bendaId: 'saron',
    nomor: '02',
    kodeArsip: 'KLR-KRN-02 · S4',
    judul: {
      id: 'Akustik Bilah Gangsa & Disiplin Pelarasan',
      jw: 'Akustik Wilah Gangsa saha Disiplin Pelarasan',
    },
    sorotan: {
      id: 'Nada Slendro tidak lahir dari suara tunggal, melainkan getaran kolektif yang ditahan oleh kendali tangan kiri.',
      jw: 'Swara Slendro ora mung tuwuh saka swara siji, nanging getaran bebarengan kang dijaga panyigeging asta.',
    },
    narasiMendalam: {
      id: 'Setiap bilah perunggu pada Saron Barung disangga paku tawonan beralas lilitan tali rotan di titik simpul getaran (nodal point), sehingga resonansi memantul bersih masuk ke palungan kayu jati tua.',
      jw: 'Saben wilah gangsa pinasang ing tawonan sabarung supaya gema swara mlebu resik ing rancakan jati.',
    },
    metrik: [
      { label: 'Komposisi Logam Gangsa', nilai: 'Tembaga 78% · Timah 22%', persen: 88 },
      { label: 'Stabilitas Laras Slendro', nilai: 'Interval Ekuipentatonik', persen: 95 },
      { label: 'Kesesuaian Arsip S4', nilai: 'Terverifikasi UNESCO', persen: 100 },
    ],
    pose3D: {
      rotasiY: 0.9,
      zoom: 1.05,
      explode: 0.45,
      kameraTarget: [2.3, 1.25, -1.3],
      kameraPosisi: [6.4, 4.2, 4.8],
    },
    sumber: ['S4'],
  },
  {
    bendaId: 'batik',
    nomor: '03',
    kodeArsip: 'KLR-KRN-03 · S2',
    judul: {
      id: 'Geometri Pancer & Ketekunan Malam Cair',
      jw: 'Geometri Puncer saha Katelatenan Malam',
    },
    sorotan: {
      id: 'Sebelum warna masuk ke serat mori, setiap lengkung simetris harus dilindungi tetesan malam tembaga tanpa putus.',
      jw: 'Sadurunge werna nyerep ing mori, saben lengkung kudu dijaga nganggo tetesan malam canthing.',
    },
    narasiMendalam: {
      id: 'Proses batik tulis tidak mengenal jalan pintas digital: dari pemolaan nglowongi, pengisian motif halus isen-isen cecekan, penutupan bidang nembok, pencelupan tarum atau soga, hingga pelorodan air mendidih.',
      jw: 'Proses batik tulis kawiwitan saka nglowongi, isen-isen cecekan, nembok, wedelan soga, nganti nglorod.',
    },
    metrik: [
      { label: 'Siklus Pencelupan Alam', nilai: '12–24 Kali Celup', persen: 90 },
      { label: 'Ketelitian Garis Canting', nilai: '0.4 mm Paruh Tembaga', persen: 86 },
      { label: 'Kesesuaian Arsip S2', nilai: 'Terverifikasi UNESCO', persen: 100 },
    ],
    pose3D: {
      rotasiY: -0.35,
      zoom: 1.08,
      explode: 0.25,
      kameraTarget: [-2.2, 1.2, 2.3],
      kameraPosisi: [2.2, 4.3, 7.6],
    },
    sumber: ['S2'],
  },
  {
    bendaId: 'joglo',
    nomor: '04',
    kodeArsip: 'KLR-KRN-04 · S6',
    judul: {
      id: 'Struktur Tahan Gempa Tanpa Paku Logam',
      jw: 'Struktur Tahan Lindhu Tanpa Paku Wesi',
    },
    sorotan: {
      id: 'Keempat Saka Guru berdiri bebas di atas umpak batu; saat bumi bergetar, bangunan berayun lentur tanpa patah.',
      jw: 'Sekawan saka guru ngadeg ing umpak watu; nalika lindhu teka, wewangunan lentur melu obah tanpa tugel.',
    },
    narasiMendalam: {
      id: 'Sistem sambungan pasak purus dan uleng tumpang sari bertingkat menyalurkan gaya gravitasi atap brunjung ke empat sudut utama. Ruang pendopo yang tanpa tembok menjadi tempat rembuk warga.',
      jw: 'Sambungan purus saha tumpang sari mbagi boboting brunjung menyang sekawan sudut saka guru.',
    },
    metrik: [
      { label: 'Efisiensi Redaman Seismik', nilai: 'Sendi Umpak Lentur', persen: 96 },
      { label: 'Ventilasi Termal Cerobong', nilai: 'Sudut Brunjung Curam', persen: 91 },
      { label: 'Kesesuaian Arsip S6', nilai: 'Terverifikasi Kemdikbud', persen: 100 },
    ],
    pose3D: {
      rotasiY: 0.65,
      zoom: 1,
      explode: 0.55,
      kameraTarget: [0, 1.85, 0],
      kameraPosisi: [5.4, 5.2, 5.8],
    },
    sumber: ['S6'],
  },
  {
    bendaId: 'wayang',
    nomor: '05',
    kodeArsip: 'KLR-KRN-05 · S3 / S5',
    judul: {
      id: 'Teater Bayangan, Tatah Prada & Blencong',
      jw: 'Teater Ayang-Ayang, Tatah Prada saha Blencong',
    },
    sorotan: {
      id: 'Satu layar kain putih, dua batang tanduk lentur, dan nyala minyak kelapa melahirkan ratusan watak tokoh epik.',
      jw: 'Kelir mori siji, cempurit tanduk loro, saha lampu blencong nuwuhake atusan watak tokoh epik.',
    },
    narasiMendalam: {
      id: 'Pemesin bayangan Nusantara sejak abad ke-10 tidak hanya menatah siluet tepi, melainkan melubangi ornamen dalam kulit kerbau agar cahaya lampu blencong memancarkan tekstur renda bercahaya pada layar kelir.',
      jw: 'Wayang kulit purwa ora mung diukir pinggire, nanging tinatah bolongan alus supaya cahya blencong nembus endah.',
    },
    metrik: [
      { label: 'Artikulasi Sendi Lengan', nilai: 'Pundhak · Sikut · Tuding', persen: 94 },
      { label: 'Ketahanan Bahan Kulit', nilai: 'Wacucal Kebo Pilihan', persen: 89 },
      { label: 'Kesesuaian Arsip S3 & S5', nilai: 'Terverifikasi UNESCO & Museum', persen: 100 },
    ],
    pose3D: {
      rotasiY: 0.15,
      zoom: 1.12,
      explode: 0.4,
      kameraTarget: [2.5, 1.35, 2.3],
      kameraPosisi: [6.8, 4.1, 7.2],
    },
    sumber: ['S3', 'S5'],
  },
];

export const LAKON_KIJANG_KENCANA: LakonWayang = {
  id: 'kijang-kencana',
  judul: {
    id: 'Lakon Kijang Kencana (Aranya Kanda)',
    jw: 'Lakon Kidang Kencana (Aranya Kanda)',
  },
  sumberEpos: {
    id: 'Epos Ramayana Tradisi Pakeliran Yogyakarta & Surakarta',
    jw: 'Serat Ramayana Tradhisi Pakeliran Jawi',
  },
  sumber: ['S3', 'S5'],
  daftarBabak: [
    {
      id: 'babak-1',
      nomor: 1,
      judul: { id: 'Babak I · Kemilau Muslihat di Tepi Dandaka', jw: 'Babak I · Kumelap Tipuan ing Wana Dandaka' },
      lokasi: { id: 'Pertapaan Hutan Dandaka', jw: 'Pertapan Wana Dandaka' },
      narasiDalang: {
        id: 'Atas perintah Rahwana, raksasa Marica menyamar menjadi Kijang Kencana berbulu keemasan untuk memancing perhatian Dewi Shinta jauh dari perlindungan Sri Rama.',
        jw: 'Saking dhawuhing Prabu Dasamuka, Marica malih rupa dadi Kidang Kencana mawa wulu mas kanggo ngapusi Dewi Sinta.',
      },
      suluk: 'Lir kilat kencana sumorot ing madyaning wana peteng, mripat nggoda manah kang suci...',
      posisiAwalRama: 0.46,
      posisiAwalKidang: -0.58,
      sumber: ['S5'],
    },
    {
      id: 'babak-2',
      nomor: 2,
      judul: { id: 'Babak II · Kejaran Langkah Lintas Rimba', jw: 'Babak II · Pangoyaking Laku ing Tengah Rimba' },
      lokasi: { id: 'Lembah Rerumputan Timur Hutan', jw: 'Lembah Suket Sisih Wetan Wana' },
      narasiDalang: {
        id: 'Demi memenuhi permintaan tulus Dewi Shinta, Sri Rama melangkah mengejar sang kijang. Setiap kali hampir terjangkau, Kijang Kencana melompat menjauh menyeret Rama kian dalam ke hutan.',
        jw: 'Kanggo nyembadani panyuwuning garwa, Sri Rama ngoyak Kidang Kencana nganti saya adoh saka pondhok.',
      },
      suluk: 'Drenging tekad sang satriya pinandhita, njangkah ngliwati jurang lan rerimbunan...',
      posisiAwalRama: 0.34,
      posisiAwalKidang: -0.34,
      sumber: ['S5'],
    },
    {
      id: 'babak-3',
      nomor: 3,
      judul: { id: 'Babak III · Bidikan Gendewa Guwawijaya', jw: 'Babak III · Panah Wasesa Guwawijaya' },
      lokasi: { id: 'Tebing Batu Terang Bulan', jw: 'Tebing Watu Padhang Rembulan' },
      narasiDalang: {
        id: 'Tatkala menyadari adanya hawa sihir raksasa, Sri Rama berhenti mantap, menarik busur pusaka Guwawijaya dan melepaskan anak panah bermantra tepat menembus wujud samaran.',
        jw: 'Sanalika mangerti tipu daya raksasa, Sri Rama narik gendewa Guwawijaya lan ngluncurake jemparing pusaka.',
      },
      suluk: 'Swoosh! Pamor waja muluk lumepas saking tali gendewa kenceng tanpa ragu...',
      posisiAwalRama: 0.56,
      posisiAwalKidang: -0.45,
      sumber: ['S3', 'S5'],
    },
    {
      id: 'babak-4',
      nomor: 4,
      judul: { id: 'Babak IV · Gema Suara Palsu & Pelajaran Waspada', jw: 'Babak IV · Swara Tipuan saha Piwulang Wicaksana' },
      lokasi: { id: 'Kabut Senja Wana Dandaka', jw: 'Pedhut Sore ing Wana Dandaka' },
      narasiDalang: {
        id: 'Sebelum sirna kembali ke rupa asli Marica, sang kijang menirukan suara serak Sri Rama memanggil Laksmana. Muslihat ganda ini mewariskan pesan abadi tentang ketenangan batin di hadapan godaan gemerlap semu.',
        jw: 'Sadurunge sirna balik rupa Marica, kidang nirake swara Rama nyuwun tulung Laksmana — piwulang tumrap kasadaran batin.',
      },
      suluk: 'Ampun gumunan ing cahya emas semu, amarga katentreman sejati dumunung ing ati kang eling...',
      posisiAwalRama: 0.25,
      posisiAwalKidang: -0.68,
      sumber: ['S5'],
    },
  ],
};

export const KAWRUH_FILOSOFI: KawruhFilosofi[] = [
  {
    id: 'kawruh-sangkan',
    istilah: 'Sangkan Paraning Dumadi',
    aksara: 'ꦱꦁꦏꦤ꧀ꦥꦫꦤꦶꦁꦢꦸꦩꦢꦶ',
    judul: {
      id: 'Kesadaran Asal & Tujuan Keberadaan',
      jw: 'Kasadaran Asal saha Tujuan Gesang',
    },
    makna: {
      id: 'Prinsip filosofis bahwa setiap penciptaan benda budaya (dari penempaan keris hingga panggung kelir) merupakan cermin perjalanan manusia mengenal asal dan arah kembalinya.',
      jw: 'Piwulang luhur yen saben karya budaya dadi pangilon tumrap manungsa mangerteni sangkan parane.',
    },
    keterkaitan: {
      id: 'Tergambar pada transisi bentuk Gunungan Wayang dari dasar laut/bumi menuju puncak api spiritual.',
      jw: 'Katon ing wujud Gunungan Wayang wiwit dhasar lemah nganti pucuk geni spiritual.',
    },
    sumber: ['S1', 'S3'],
  },
  {
    id: 'kawruh-memayu',
    istilah: 'Memayu Hayuning Bawana',
    aksara: 'ꦩꦼꦩꦪꦸꦲꦪꦸꦤꦶꦁꦧꦮꦤ',
    judul: {
      id: 'Memperindah Harmoni Dunia & Alam',
      jw: 'Ngendahake Katentremaning Jagad',
    },
    makna: {
      id: 'Amanat menjaga kelestarian alam dan tata sosial. Terlihat pada pemilihan pewarna tumbuhan alami batik soga, kayu jati terbarukan joglo, dan pelarasan suara alam gamelan.',
      jw: 'Amanat njaga lestarining alam saha tata sosial, katon ing pewarna alam batik soga lan kayu joglo.',
    },
    keterkaitan: {
      id: 'Pendopo Joglo dibangun terbuka tanpa tembok pemisah guna merawat kerukunan antarsesama.',
      jw: 'Pendhapa Joglo kagiyut terbuka tanpa pager minangka papan sarasehan warga.',
    },
    sumber: ['S2', 'S4', 'S6'],
  },
];

export const KEUNGGULAN_SISTEM = [
  {
    nomor: '01',
    judul: { id: 'Geometri Prosedural & Pencahayaan HDR', jw: 'Geometri Prosedural saha Cahya HDR' },
    teks: {
      id: 'Struktur pendopo, lengkung luk keris, dan sendi wayang kulit dibangun sebagai model WebGL PBR dengan pemetaan tekstur kayu, perunggu, dan pamor di bawah pencahayaan HDR studio.',
      jw: 'Pendhapa, luk keris, lan sendi wayang kawangun ing WebGL PBR mawa tekstur kayu, gangsa, lan pamor ing cahya HDR studio.',
    },
  },
  {
    nomor: '02',
    judul: { id: 'Urai Komponen & Kawat X-Ray CAD', jw: 'Urai Komponen saha Kawat X-Ray CAD' },
    teks: {
      id: 'Alihkan tampilan secara presisi antara permukaan material nyata, lapisan hibrida, dan garis struktur X-Ray untuk memeriksa sambungan pasak, pesi, dan tatahan yang lazim tersembunyi.',
      jw: 'Gantinen antawisipun rupa nyata, hibrida, lan garis X-Ray kangge nliti pasak, pesi, saha tatahan alus.',
    },
  },
  {
    nomor: '03',
    judul: { id: 'Sintesis Akustik Karawitan Real-Time', jw: 'Sintesis Akustik Karawitan Wektu-Nyata' },
    teks: {
      id: 'Nada pentatonik laras Slendro pada bilah saron, gema gong ageng, keprak dalang, hingga desis besi keris disintesis langsung oleh mesin Web Audio sesuai karakter akustik tiap instrumen.',
      jw: 'Nada pentatonik laras Slendro ing wilah saron, gong ageng, keprak dhalang, lan hunusan dhuwung kasintesis langsung dening Web Audio.',
    },
  },
  {
    nomor: '04',
    judul: { id: 'Kinematika Tangan 21-Titik di Perangkat', jw: 'Kinematika Asta 21-Titik Lokal' },
    teks: {
      id: 'Model pengenalan gestur MediaPipe memproses pergerakan tangan sepenuhnya secara luring untuk mengendalikan rotasi pusaka, pembesaran detail, dan sabetan dua tokoh wayang.',
      jw: 'Model pangolah gestur MediaPipe lumaku ing piranti piyambak tanpa ngirim gambar kangge muter pusaka lan nglakokake wayang.',
    },
  },
];

export const PILAR_NILAI = [
  {
    nomor: '01',
    judul: { id: 'Dokumentasi Akurasi Tinggi', jw: 'Dokumentasi Akurasi Inggil' },
    sorot: { id: 'KONSERVASI SPASIAL', jw: 'KONSERVASI SPASIAL' },
    teks: {
      id: 'Merekam proporsi arsitektur Joglo, lipatan pamor besi-nikel, dan ukiran tatahan kulit ke dalam arsip tiga dimensi yang dapat diperiksa dari seluruh sudut.',
      jw: 'Nyathet proporsi arsitektur Joglo, lipetan pamor wesi-nikel, lan tatahan kulit ing arsip telung dhimensi.',
    },
  },
  {
    nomor: '02',
    judul: { id: 'Pembelajaran Eksploratif', jw: 'Pasinaon Eksploratif' },
    sorot: { id: 'INTERAKSI LANGSUNG', jw: 'INTERAKSI LANGSUNG' },
    teks: {
      id: 'Membuka pemahaman budaya melalui praktik langsung: dengarkan laras Slendro tiap bilah saron, urai bagian keris satu per satu, dan gerakkan tokoh Sri Rama di kelir.',
      jw: 'Mbukak pangertosan budaya lumantar praktik: mirengake laras saron, ngurai bageyan dhuwung, lan nglakokake wayang.',
    },
  },
  {
    nomor: '03',
    judul: { id: 'Keterlacakan Rujukan S1–S7', jw: 'Rujukan Resmi S1–S7' },
    sorot: { id: 'STANDAR KEPUSTAKAAN', jw: 'STANDAR KEPUSTAKAAN' },
    teks: {
      id: 'Seluruh istilah anatomi, narasi kronik, dan sistem tanya-jawab Pamomong mengacu secara eksplisit pada arsip UNESCO ICH, Museum Sonobudoyo, serta Perpusnas RI.',
      jw: 'Sedaya istilah anatomi, narasi kronik, lan Pamomong ngrujuk dhumateng arsip UNESCO ICH, Museum Sonobudoyo, lan Perpusnas RI.',
    },
  },
];

export const KOLEKSI_ETALASE: ItemEtalase[] = [
  {
    id: 'et-keris-pamor',
    bendaId: 'keris',
    titikId: 'keris-pamor',
    kategoriKey: 'tosan-aji',
    judul: 'Pamor Beras Wutah',
    subjudul: 'Lipatan Nikel Meteorit & Warangan',
    kodeArsip: 'KLR-01 · S1',
    spesifikasi: 'Tosan Aji Mataram · Bilah Luk 5',
    aksara: 'ꦥꦩꦺꦴꦂ',
    aksen: '#d1491b',
    ikonTipe: 'keris',
  },
  {
    id: 'et-saron-slendro',
    bendaId: 'saron',
    titikId: 'saron-wilah',
    kategoriKey: 'karawitan',
    judul: 'Wilah Perunggu 6 Nada',
    subjudul: 'Laras Slendro · Pijetan Balungan',
    kodeArsip: 'KLR-02 · S4',
    spesifikasi: 'Paduan Gangsa 78/22 · Plisir Jati',
    aksara: 'ꦱꦫꦺꦴꦤ꧀',
    aksen: '#9a6c1d',
    ikonTipe: 'saron',
  },
  {
    id: 'et-batik-kawung',
    bendaId: 'batik',
    titikId: 'batik-pusat',
    kategoriKey: 'wastra',
    judul: 'Simetri Kiblat Papat',
    subjudul: 'Canting Tembaga & Celup Soga',
    kodeArsip: 'KLR-03 · S2',
    spesifikasi: 'Katun Primissima · Rintang Malam',
    aksara: 'ꦏꦮꦸꦁ',
    aksen: '#b85d28',
    ikonTipe: 'batik',
  },
  {
    id: 'et-joglo-tumpangsari',
    bendaId: 'joglo',
    titikId: 'joglo-tumpangsari',
    kategoriKey: 'arsitektur',
    judul: 'Undakan Tumpang Sari',
    subjudul: 'Pasak Purus Jati Tanpa Paku',
    kodeArsip: 'KLR-04 · S6',
    spesifikasi: '4 Saka Guru · Atap Tajug Brunjung',
    aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    aksen: '#516778',
    ikonTipe: 'joglo',
  },
  {
    id: 'et-wayang-rama',
    bendaId: 'wayang',
    titikId: 'wayang-sungging',
    kategoriKey: 'pakeliran',
    judul: 'Satria Sri Rama',
    subjudul: 'Tatahan Wacucal Kebo & Cempurit',
    kodeArsip: 'KLR-05 · S3',
    spesifikasi: 'Kulit Perkamen · Tanduk Kerbau',
    aksara: 'ꦫꦩ',
    aksen: '#b33025',
    ikonTipe: 'wayang',
  },
  {
    id: 'et-wayang-kidang',
    bendaId: 'wayang',
    halamanTarget: 'pakeliran',
    kategoriKey: 'pakeliran',
    judul: 'Kidang Kencana 3D',
    subjudul: 'Panggung Pakeliran · Aranya Kanda',
    kodeArsip: 'KLR-06 · S5',
    spesifikasi: 'Artikulasi Sendi Ganda · Prada Mas',
    aksara: 'ꦏꦶꦢꦁ',
    aksen: '#9a6c1d',
    ikonTipe: 'wayang',
  },
  {
    id: 'et-keris-warangka',
    bendaId: 'keris',
    titikId: 'keris-warangka',
    kategoriKey: 'tosan-aji',
    judul: 'Warangka Gayaman Jati',
    subjudul: 'Pendok Bunton & Mendak Permata',
    kodeArsip: 'KLR-07 · S1',
    spesifikasi: 'Kayu Timoho Pelet · Kunyit Pendok',
    aksara: 'ꦮꦫꦁꦏ',
    aksen: '#d1491b',
    ikonTipe: 'keris',
  },
  {
    id: 'et-joglo-umpak',
    bendaId: 'joglo',
    titikId: 'joglo-sakaguru',
    kategoriKey: 'arsitektur',
    judul: 'Sendi Umpak Andesit',
    subjudul: 'Peredam Getar Gempa Nusantara',
    kodeArsip: 'KLR-08 · S6',
    spesifikasi: 'Batu Candi Pahat · Sendi Dinamis',
    aksara: 'ꦲꦸꦩ꧀ꦥꦏ꧀',
    aksen: '#516778',
    ikonTipe: 'joglo',
  },
];

export const DINDING_MATRIX: MatrixItem[] = [
  { id: 'm01', label: 'Luk 5', sub: 'Tosan Aji', aksara: 'ꦭꦸꦏ꧀', kodeArsip: 'KLR-01 · S1', spesifikasi: 'Bilah Tempa Pandawa', bendaId: 'keris', titikId: 'keris-wilah', warna: '#d1491b', pola: 'cakra' },
  { id: 'm02', label: 'Slendro', sub: 'Karawitan', aksara: 'ꦱ꧀ꦭꦺꦤ꧀ꦢꦿ', kodeArsip: 'KLR-02 · S4', spesifikasi: 'Larasan Pentatonik 6 Bilah', bendaId: 'saron', titikId: 'saron-wilah', warna: '#9a6c1d', pola: 'bilah' },
  { id: 'm03', label: 'Kawung', sub: 'Wastra Soga', aksara: 'ꦏꦮꦸꦁ', kodeArsip: 'KLR-03 · S2', spesifikasi: 'Geometri Papat Pancer', bendaId: 'batik', titikId: 'batik-pusat', warna: '#b85d28', pola: 'grid' },
  { id: 'm04', label: 'Joglo', sub: 'Tumpang Sari', aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ', kodeArsip: 'KLR-04 · S6', spesifikasi: 'Pasak Kayu Tanpa Paku', bendaId: 'joglo', titikId: 'joglo-tumpangsari', warna: '#516778', pola: 'grid' },
  { id: 'm05', label: 'Sri Rama', sub: 'Pakeliran', aksara: 'ꦫꦩ', kodeArsip: 'KLR-05 · S3', spesifikasi: 'Wacucal Tatah Krawangan', bendaId: 'wayang', titikId: 'wayang-sungging', warna: '#b33025', pola: 'gunungan' },
  { id: 'm06', label: 'Pamor', sub: 'Beras Wutah', aksara: 'ꦥꦩꦺꦴꦂ', kodeArsip: 'KLR-06 · S1', spesifikasi: 'Meteorit Nikel-Besi', bendaId: 'keris', titikId: 'keris-pamor', warna: '#d1491b', pola: 'gelombang' },
  { id: 'm07', label: 'Gangsa', sub: 'Gamelan', aksara: 'ꦒꦁꦱ', kodeArsip: 'KLR-07 · S4', spesifikasi: 'Tembaga & Timah 78/22', bendaId: 'saron', titikId: 'saron-wilah', warna: '#9a6c1d', pola: 'bilah' },
  { id: 'm08', label: 'Canting', sub: 'Rintang Malam', aksara: 'ꦕꦤ꧀ꦛꦶꦁ', kodeArsip: 'KLR-08 · S2', spesifikasi: 'Cucuk Tembaga Presisi', bendaId: 'batik', titikId: 'batik-canting', warna: '#b85d28', pola: 'cakra' },
  { id: 'm09', label: 'Brunjung', sub: 'Atap Tajug', aksara: 'ꦧꦿꦸꦚ꧀ꦗꦸꦁ', kodeArsip: 'KLR-09 · S6', spesifikasi: 'Puncak Trapesium Pendopo', bendaId: 'joglo', titikId: 'joglo-brunjung', warna: '#516778', pola: 'gunungan' },
  { id: 'm10', label: 'Blencong', sub: 'Pelita Kelir', aksara: 'ꦧ꧀ꦭꦺꦚ꧀ꦕꦺꦴꦁ', kodeArsip: 'KLR-10 · S3', spesifikasi: 'Sorot Sumbu Minyak Kelapa', bendaId: 'wayang', titikId: 'wayang-blencong', warna: '#b33025', pola: 'cakra' },
  { id: 'm11', label: 'Ganja', sub: 'Pangkal Bilah', aksara: 'ꦒꦚ꧀ꦗ', kodeArsip: 'KLR-11 · S1', spesifikasi: 'Penyatuan Lingga & Yoni', bendaId: 'keris', titikId: 'keris-ganja', warna: '#d1491b', pola: 'bilah' },
  { id: 'm12', label: 'Hanacaraka', sub: 'Aksara Jawa', aksara: 'ꦲꦤꦕꦫꦏ', kodeArsip: 'KLR-12 · S7', spesifikasi: 'Blok Unicode U+A980', halamanTarget: 'kawruh', anchorTarget: 'aksara', ctaLabel: 'Lab Aksara \u2192', warna: '#9a6c1d', pola: 'grid' },
];
