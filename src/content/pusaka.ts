import { konversiTeksKeAksaraAman } from '../lib/aksara.ts';

export type BahasaAktif = 'id' | 'en' | 'jw' | 'aks';

export type KodeSumber = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';

export interface MultiTeks {
  id: string;
  en: string;
  jw: string;
}

export type TeksLokal = MultiTeks | string;

export interface SumberKajian {
  kode: KodeSumber;
  judul: string;
  lembaga: string;
  tahun: string;
  tautan: string;
  ringkasan: MultiTeks;
}

export interface TitikInfoPusaka {
  id: string;
  judul: MultiTeks;
  posisi: [number, number, number];
  explodeVec?: [number, number, number];
  material?: TeksLokal;
  fungsiTeknis?: TeksLokal;
  ringkasan: MultiTeks;
  sumber: KodeSumber[];
}

export type SpesimenBedahId = 'keris' | 'saron' | 'batik' | 'joglo' | 'wayang' | 'kidang' | 'hanacaraka';

export interface BendaPusaka {
  id: 'keris' | 'saron' | 'batik' | 'joglo' | 'wayang';
  nomorUrut: string;
  dioramaLabel: TeksLokal;
  zonaKode: string;
  badgeStatus?: TeksLokal;
  aksara?: string;
  warnaAksen: string;
  nama: MultiTeks;
  subjudul: MultiTeks;
  kategori: MultiTeks;
  asal: MultiTeks;
  spesifikasiKurasi: Array<{ label: TeksLokal; nilai: TeksLokal }>;
  parameterCad?: Array<{ label: TeksLokal; nilai: TeksLokal }>;
  ringkas: MultiTeks;
  sejarahSingkat: MultiTeks;
  filosofi: MultiTeks;
  sulukLarik: MultiTeks[];
  sumber: KodeSumber[];
  titikInfo: TitikInfoPusaka[];
  pertanyaanContoh: TeksLokal[];
}

export interface SpesimenBedahTwin extends Omit<BendaPusaka, 'id'> {
  id: SpesimenBedahId;
  halamanKelanjutan?: { id: 'pakeliran' | 'kawruh'; anchor?: string; label: TeksLokal };
}

export interface BabakLakon {
  id: string;
  nomor: number;
  judul: MultiTeks;
  lokasi: MultiTeks;
  narasiDalang: MultiTeks;
  suluk: TeksLokal;
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
  metrik: Array<{ label: TeksLokal; nilai: TeksLokal; persen: number }>;
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
  judul: TeksLokal;
  subjudul: TeksLokal;
  kodeArsip: string;
  spesifikasi: TeksLokal;
  aksara: string;
  aksen: string;
  ikonTipe: BendaPusaka['id'];
}

export interface MatrixItem {
  id: string;
  label: TeksLokal;
  sub: TeksLokal;
  aksara: string;
  kodeArsip: string;
  spesifikasi: TeksLokal;
  bendaId?: BendaPusaka['id'];
  titikId?: string;
  halamanTarget?: 'twin' | 'pakeliran' | 'kawruh';
  anchorTarget?: string;
  ctaLabel?: TeksLokal;
  warna: string;
  pola: 'grid' | 'gelombang' | 'cakra' | 'bilah' | 'gunungan';
}

export interface ItemCoverflow {
  id: string;
  artefakId: BendaPusaka['id'] | 'kidang' | 'hanacaraka';
  bendaId: BendaPusaka['id'];
  titikId?: string;
  halamanTarget: 'twin' | 'pakeliran' | 'kawruh';
  anchorTarget?: string;
  ctaLabel: TeksLokal;
  nomorUrut: string;
  kodeArsip: string;
  badgeStatus: TeksLokal;
  aksara: string;
  kategori: MultiTeks;
  nama: MultiTeks;
  subjudul: MultiTeks;
  asal: MultiTeks;
  penjelasanLengkap: MultiTeks;
  filosofi: MultiTeks;
  metrikKurasi: Array<{ label: TeksLokal; nilai: TeksLokal }>;
  anatomiKritis: Array<{
    titikId?: string;
    judul: TeksLokal;
    ringkas: TeksLokal;
    material?: TeksLokal;
    fungsiTeknis?: TeksLokal;
    sumber: KodeSumber[];
  }>;
  sulukLarik: MultiTeks[];
  jenisSuluk: TeksLokal;
  larasPathet: string;
  instrumenPengiring: TeksLokal;
  tempoKeterangan: TeksLokal;
  catatanDalang: MultiTeks;
  sumber: KodeSumber[];
  kuratorPilihan?: boolean;
}

export function ambilTeks(teks: TeksLokal, bahasa: BahasaAktif): string {
  if (typeof teks === 'string') {
    return bahasa === 'aks' ? konversiTeksKeAksaraAman(teks) : teks;
  }
  if (bahasa === 'en') return teks.en;
  if (bahasa === 'jw') return teks.jw;
  if (bahasa === 'aks') return konversiTeksKeAksaraAman(teks.jw);
  return teks.id;
}

const AKSEN_TEMA_BENDA: Record<BendaPusaka['id'] | 'kidang' | 'hanacaraka', { terang: string; malam: string }> = {
  keris: { terang: '#c24117', malam: '#f27c4e' },
  saron: { terang: '#8c6014', malam: '#e6ba63' },
  batik: { terang: '#a8521f', malam: '#ed9158' },
  joglo: { terang: '#445b6e', malam: '#93b7d1' },
  wayang: { terang: '#a32b20', malam: '#ed6d5e' },
  kidang: { terang: '#a32b20', malam: '#e6ba63' },
  hanacaraka: { terang: '#8c6014', malam: '#e0b35a' },
};

/** Mengembalikan warna aksen pusaka berdasar kontras tema terang/malam. */
export function ambilAksenBenda(id: BendaPusaka['id'] | 'kidang' | 'hanacaraka', tema: 'malam' | 'terang'): string {
  return AKSEN_TEMA_BENDA[id][tema];
}

export const DAFTAR_SUMBER: Record<KodeSumber, SumberKajian> = {
  S1: {
    kode: 'S1',
    judul: 'Indonesian Keris — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2008',
    tautan: 'https://ich.unesco.org/en/RL/indonesian-keris-00112',
    ringkasan: {
      id: 'Penetapan Keris Indonesia sebagai Warisan Budaya Takbenda, membahas fungsi spiritual, tata tempa pamor besi-nikel oleh empu, serta anatomi bilah dan warangka.',
      en: 'UNESCO Intangible Cultural Heritage inscription detailing the spiritual philosophy of the Indonesian Keris, meteorite nickel-iron forge lamination by the empu, and blade-sheath anatomy.',
      jw: 'Panetepan Dhuwung Indonesia minangka Warisan Budaya Takbenda UNESCO, ngemot falsafah spiritual, tata tempa pamor wesi-nikel empu, lan anatomi wilah saha warangka.',
    },
  },
  S2: {
    kode: 'S2',
    judul: 'Indonesian Batik — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2009',
    tautan: 'https://ich.unesco.org/en/RL/indonesian-batik-00170',
    ringkasan: {
      id: 'Dokumentasi teknik rintang malam menggunakan canting tulis, makna motif klasik keraton seperti Kawung dan Parang, serta siklus hidup manusia dalam wastra.',
      en: 'Official UNESCO dossier on beeswax-resist dyeing with the copper canting, symbolic court motifs including Kawung and Parang, and human life-cycle textiles.',
      jw: 'Dokumentasi teknik rintang malam nganggo canthing tulis, teges motif klasik kraton kayata Kawung lan Parang, saha siklus gesang ing wastra.',
    },
  },
  S3: {
    kode: 'S3',
    judul: 'Wayang Puppet Theatre — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2008',
    tautan: 'https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063',
    ringkasan: {
      id: 'Penjelasan pertunjukan wayang kulit berlayar kelir dan lampu blencong, tatahan kulit kerbau bertangkai tanduk cempurit/tuding, serta peran dalang.',
      en: 'UNESCO reference on Javanese shadow puppetry staged before the white kelir cloth and oil blencong lamp, buffalo-hide perforation craft, horn control rods, and the dalang.',
      jw: 'Katrangan pagelaran ringgit wacucal kanthi kelir mori saha pelita blencong, tatahan wacucal kebo gagang cempurit sungu, lan jejering ki dhalang.',
    },
  },
  S4: {
    kode: 'S4',
    judul: 'Gamelan — Intangible Cultural Heritage',
    lembaga: 'UNESCO ICH',
    tahun: '2021',
    tautan: 'https://ich.unesco.org/en/RL/gamelan-01607',
    ringkasan: {
      id: 'Struktur instrumen karawitan Jawa meliputi bilah perunggu saron, kendang, gong ageng, sistem pelarasan Slendro & Pelog, serta nilai gotong royong musikal.',
      en: 'UNESCO archival monograph covering Javanese karawitan ensemble structure, 78/22 bronze saron keys, gong ageng, Slendro and Pelog tuning systems, and communal harmony.',
      jw: 'Struktur piranti karawitan Jawi kalebet wilah gangsa saron, kendhang, gong ageng, laras Slendro saha Pelog, lan piwulang gotong royong swara.',
    },
  },
  S5: {
    kode: 'S5',
    judul: 'Kajian Lakon Ramayana Tradisi Yogyakarta & Surakarta',
    lembaga: 'Museum Sonobudoyo & ISI Surakarta',
    tahun: '2019',
    tautan: 'https://sonobudoyo.jogjaprov.go.id',
    ringkasan: {
      id: 'Dokumentasi struktur pakeliran Ramayana epik Aranya Kanda mengenai muslihat Marica berwujud Kijang Kencana, suluk dalang, serta sabetan panah Sri Rama.',
      en: 'Research archive on Yogyakarta-Surakarta Ramayana shadow theatre detailing the Aranya Kanda Golden Deer deception by Marica, dalang chants, and Sri Rama’s arrow stroke.',
      jw: 'Dokumentasi pakeliran Ramayana epos Aranya Kanda babagan tipu daya Marica wujud Kidang Kencana, suluk dhalang, lan jemparing Sri Rama.',
    },
  },
  S6: {
    kode: 'S6',
    judul: 'Arsitektur Vernakular Jawa: Konstruksi Pendopo Joglo & Tumpang Sari',
    lembaga: 'Kemdikbud RI — Direktorat Pelindungan Kebudayaan',
    tahun: '2020',
    tautan: 'https://kebudayaan.kemdikbud.go.id',
    ringkasan: {
      id: 'Studi sambungan pasak kayu jati tanpa paku logam pada empat saka guru Joglo, penutup atap tajug berundak, dan hierarki ruang pendopo-pringgitan-dalem.',
      en: 'Architectural engineering study of peg-locked teak joinery without iron nails across four Joglo saka guru columns, tiered tajug roofing, and spatial hierarchy.',
      jw: 'Panaliten sambungan pasak kayu jati tanpa paku wesi ing sekawan saka guru Joglo, payon tajug undhakan, saha tata ruang pendhapa-pringgitan-dalem.',
    },
  },
  S7: {
    kode: 'S7',
    judul: 'Pedoman Ejaan & Transliterasi Aksara Jawa (Hanacaraka)',
    lembaga: 'Kongres Bahasa Jawa & Perpustakaan Nasional RI',
    tahun: '2021',
    tautan: 'https://www.perpusnas.go.id',
    ringkasan: {
      id: 'Aturan standar 20 aksara nglegena Hanacaraka, pasangan, sandhangan swara, panyigeg wanda, serta standar pengkodean Unicode blok U+A980–U+A9DF.',
      en: 'Official orthography guide governing the 20 Hanacaraka nglegena consonants, conjunct pasangan forms, vowel diacritics (sandhangan), and Unicode block U+A980–U+A9DF.',
      jw: 'Paugeran baku kalih dasa aksara nglegena Hanacaraka, pasangan, sandhangan swara, panyigeg wanda, lan standar Unicode blok U+A980–U+A9DF.',
    },
  },
};

export const DAFTAR_BENDA: BendaPusaka[] = [
  {
    id: 'keris',
    nomorUrut: '01',
    dioramaLabel: { id: 'BESALEN EMPU', en: 'EMPU SMITHY', jw: 'BESALEN EMPU' },
    zonaKode: 'ZON-01 · BESALEN MATARAM',
    badgeStatus: { id: 'UNESCO 2008', en: 'UNESCO 2008', jw: 'UNESCO 2008' },
    aksara: 'ꦏꦼꦫꦶꦱ꧀',
    warnaAksen: '#d1491b',
    nama: { id: 'Keris Luk 5', en: 'Keris Luk 5 (Five-Wave Blade)', jw: 'Dhuwung Luk Lima' },
    subjudul: {
      id: 'Pandawa Lima & Tata Tempa Pamor Besi-Nikel',
      en: 'Five Pandava Knights & Forged Nickel-Iron Pamor',
      jw: 'Pandhawa Lima saha Pamor Wesi-Nikel',
    },
    kategori: { id: 'Tosan Aji', en: 'Sacred Bladesmithing', jw: 'Tosan Aji' },
    asal: { id: 'Keraton Surakarta & Yogyakarta', en: 'Surakarta & Yogyakarta Courts', jw: 'Kraton Surakarta saha Ngayogyakarta' },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-01 · S1' },
      { label: { id: 'Material', en: 'Material', jw: 'Material' }, nilai: { id: 'Baja Inti & Nikel', en: 'Core Steel & Nickel', jw: 'Waja Inti & Nikel' } },
      { label: { id: 'Bentuk', en: 'Profile', jw: 'Wujud' }, nilai: { id: 'Luk 5 Simetris', en: '5-Wave Symmetrical', jw: 'Luk Lima Simetris' } },
    ],
    parameterCad: [
      { label: { id: 'Lipatan Tempa', en: 'Forge Layers', jw: 'Lipetan Tempaan' }, nilai: { id: '128–512 Lapis', en: '128–512 Fold Layers', jw: '128–512 Lapisan' } },
      { label: { id: 'Penampang Bilah', en: 'Cross-Section', jw: 'Penampang Wilah' }, nilai: { id: 'Heksagonal Ada-Ada', en: 'Hexagonal Spine (Ada-Ada)', jw: 'Heksagonal Ada-Ada' } },
      { label: { id: 'Sarung & Selut', en: 'Sheath & Ferrule', jw: 'Warangka & Selut' }, nilai: { id: 'Gayaman · Pendok Bunton', en: 'Gayaman · Gold Pendok', jw: 'Gayaman · Pendhok Bunton' } },
    ],
    ringkas: {
      id: 'Senjata spiritual berbilah lima kelokan simetris lambang lima kebajikan Pandawa dan keteguhan empu.',
      en: 'Spiritual heirloom dagger with five harmonic waves symbolizing the five Pandava virtues and ancestral bladesmithing devotion.',
      jw: 'Gaman spiritual kanthi luk lima pralambang kautaman Pandhawa lan kasetyaning empu.',
    },
    sejarahSingkat: {
      id: 'Sejak masa Mataram Hindu hingga Mataram Islam, empu menempa lapisan besi, baja inti, serta batu meteorit berkadar nikel tinggi menjadi ratusan lipatan tempa. Di Jawa, luk berjumlah ganjil selalu memiliki makna doa dan keteguhan diri.',
      en: 'From Hindu Mataram to Islamic Mataram courts, master smiths (empu) forge-welded iron, carbon core steel, and nickel-rich meteorite stone into hundreds of folded laminations. In Javanese tradition, an odd wave count embodies sacred prayer and steadfast resolve.',
      jw: 'Wiwit jaman Mataram Kuna nganti Mataram Islam, empu nempa lapisan wesi, waja, lan watu meteorit nikel dadi atusan lipetan pamor. Wilahan kanthi luk ganjil tansah ngemu donga lan kasetyan.',
    },
    filosofi: {
      id: 'Manunggaling kawula lan gusti terwujud lewat penyatuan ganja (penopang horizontal) dan wilah (bilah vertikal) sebagai simbol keselarasan batin.',
      en: 'Manunggaling kawula lan gusti — unity of servant and Creator — is crystallized in the interlock of the horizontal ganja base and rising vertical wilah blade.',
      jw: 'Manunggaling kawula gusti kawujud ing nyawijining ganja lan wilah minangka pralambang larasing lahir batin.',
    },
    sulukLarik: [
      {
        id: 'Api prapen besalen menyala lirih di ufuk subuh,',
        en: 'The smithy hearth glows gently against the indigo dawn,',
        jw: 'Geni prapen besalen murub alus ing wayah bangun esuk,',
      },
      {
        id: 'Besi pilihan, baja inti, dan meteorit nikel dilipat beratus kali,',
        en: 'Fine iron, core steel, and sky-born nickel folded a hundred times over,',
        jw: 'Wesi pilihan, waja inti, lan nikel meteorit dilipet atusan kaping,',
      },
      {
        id: 'Membentuk pamor Beras Wutah di atas lima kelokan Pandawa,',
        en: 'Blooming as scattered rice pamor along five Pandava curves,',
        jw: 'Mujudake pamor Wos Wutah ing dhuwur luk lima Pandhawa,',
      },
      {
        id: 'Ganja mendatar memeluk wilah menjulang ke angkasa,',
        en: 'Horizontal ganja cradles the vertical blade reaching heavenward,',
        jw: 'Ganja malang ngrangkul wilah kang njujug langit,',
      },
      {
        id: 'Bukan alat melukai, melainkan pengingat laku utama manusia.',
        en: 'Never forged to harm, but as an anchor of noble human conduct.',
        jw: 'Dudu piranti nyiderani, nanging pangeling laku utama manungsa.',
      },
    ],
    sumber: ['S1', 'S7'],
    titikInfo: [
      {
        id: 'keris-wilah',
        judul: { id: 'Wilah Luk 5, Ada-Ada & Kruwingan', en: 'Five-Wave Wilah, Ada-Ada Spine & Fullers', jw: 'Wilah Luk Lima saha Ada-Ada' },
        posisi: [0, 1.32, 0.14],
        explodeVec: [0, 0.72, 0.12],
        material: { id: 'Baja Inti Tempa Karbon Menengah', en: 'Medium-Carbon Forge-Welded Core Steel', jw: 'Waja Inti Tempa Karbon' },
        fungsiTeknis: {
          id: 'Punggung tengah ada-ada menguatkan kelenturan bilah tanpa patah',
          en: 'Central dorsal ada-ada ridge stiffens flex dynamics without brittle fracture',
          jw: 'Balung tengah ada-ada nguwatake wilah supaya tetep lentur tan tugel',
        },
        ringkasan: {
          id: 'Lima kelokan asimetris dengan tulang punggung ada-ada dan alur kruwingan yang melambangkan keteguhan hati lima kesatria Pandawa.',
          en: 'Five asymmetric curves flanked by a prominent dorsal ada-ada rib and paired kruwingan fullers representing the resilience of the five Pandava brothers.',
          jw: 'Luk lima kanthi balung ada-ada pralambang kasetyan lan kawicaksanan Pandhawa.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-pamor',
        judul: { id: 'Pamor Beras Wutah, Sogokan & Greneng', en: 'Beras Wutah Pamor, Sogokan Grooves & Greneng', jw: 'Pamor Wos Wutah saha Greneng' },
        posisi: [0.06, 0.25, 0.14],
        explodeVec: [0, 0.72, 0.12],
        material: { id: 'Lipatan Meteorit Fe-Ni + Warangan Arsenik', en: 'Fe-Ni Meteoric Laminate + Warangan Etch', jw: 'Lipetan Meteorit Fe-Ni + Warangan' },
        fungsiTeknis: {
          id: 'Kontras etsa kimia serta gerigi greneng dan alur sogokan penyeimbang pangkal bilah',
          en: 'Chemical arsenic-lime contrast etching paired with twin sogokan grooves and greneng teeth balancing the ricasso',
          jw: 'Kontras warangan lan ukiran alur sogokan saha greneng ing sorsoran wilah',
        },
        ringkasan: {
          id: 'Lapisan kontras antara besi gelap hasil rendaman warangan dan nikel terang, diperinci alur kembar sogokan, tikel alis, serta gerigi greneng di sorsoran.',
          en: 'Acid-darkened iron contrasting against silvery nickel strata, finished with twin sogokan blood grooves, tikel alis eyebrows, and serrated greneng fretwork.',
          jw: 'Lapisan kontras wesi ireng warangan lan nikel padhang mawa ukiran sogokan saha greneng.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-ganja',
        judul: { id: 'Ganja Sebit Rontal & Sekar Kacang', en: 'Sebit Rontal Ganja Guard & Sekar Kacang Curl', jw: 'Ganja Dhuwung saha Sekar Kacang' },
        posisi: [-0.02, -0.35, 0.12],
        explodeVec: [-0.24, 0.18, 0.44],
        material: { id: 'Besi Tempa Sirah Cecak — Buntut Urang', en: 'Hand-Forged Iron (Lizard Head to Shrimp Tail)', jw: 'Wesi Tempa Sirah Cecak — Buntut Urang' },
        fungsiTeknis: {
          id: 'Penopang horizontal pengunci persambungan wilah dengan batang pesi',
          en: 'Horizontal basal collar locking the wilah tang shoulder onto the wooden hilt shaft',
          jw: 'Panyangga malang pengunci sambungan antawisipun wilah lan batang pesi',
        },
        ringkasan: {
          id: 'Bagian melintang berkepala sirah cecak hingga ekor buntut urang yang menyatukan pesi tangkai dengan bilah sebagai lambang manunggaling kawula lan gusti.',
          en: 'Lateral base piece tapered from the rounded sirah cecak head to buntut urang tail, uniting tang and blade as a philosophical emblem of cosmic union.',
          jw: 'Perangan malang saking sirah cecak nganti buntut urang kang nyawijekake pesi lan wilah.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-pesi',
        judul: { id: 'Pesi Inti & Mendak Selut Mirah Delima', en: 'Pesi Tang & Jeweled Ruby Mendak Selut Collar', jw: 'Pesi saha Mendhak Selut Mirah' },
        posisi: [0, -0.52, 0.12],
        explodeVec: [0, -0.14, 0.36],
        material: { id: 'Baja Pesi Bulat · Perak/Emas Bertatah 16 Ruby', en: 'Cylindrical Core Tang · 16-Ruby Gilt Collar', jw: 'Pesi Waja Bunder · Perak/Emas Mirah' },
        fungsiTeknis: {
          id: 'Poros tancap bilah ke dalam pegangan sekaligus cincin peredam kejut mendak',
          en: 'Cylindrical axle seating the blade into the hilt while metallic mendak rings cushion vibration',
          jw: 'Poros tancap wilah mlebet deder saha cincin mendhak pangendhak getaran',
        },
        ringkasan: {
          id: 'Batang silinder pesi yang menembus mendak dan selut kuningan bertatah enam belas permata mirah delima sebagai pengunci konstruksi hulu.',
          en: 'Round steel pesi tang passing through an ornamental brass mendak and 16-ruby selut ferrule to anchor the ergonomic hilt assembly.',
          jw: 'Pesi baja kang nembus mendhak lan selut kuning emas mawa sesotya mirah delima.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-hulu',
        judul: { id: 'Ukiran Hulu Nunggak Semi Surakarta', en: 'Surakarta Nunggak Semi Carved Hilt', jw: 'Deder Ukir Nunggak Semi' },
        posisi: [-0.06, -1.02, 0.12],
        explodeVec: [-0.1, -0.68, 0],
        material: { id: 'Kayu Kemuning / Trembalo Ukir Patra', en: 'Carved Kemuning & Trembalo Hardwood', jw: 'Kayu Kemuning / Trembalo Ukir Patra' },
        fungsiTeknis: {
          id: 'Pegangan ergonomis melengkung dengan sabuk pahatan cecekan',
          en: 'Curved palm-contoured grip etched with recessed cecekan leaf friezes for non-slip control',
          jw: 'Cecekelan ergonomis melengkung mawa ukiran cecekan panyegah lunyu',
        },
        ringkasan: {
          id: 'Pegangan berlekuk gaya Nunggak Semi berukir patra dan bungkul membulat guna menjaga keseimbangan genggaman serta kenyamanan menghunus.',
          en: 'Curved Surakarta court Nunggak Semi hilt featuring traditional patra leaf relief and a bulbous pommel for balanced draw ergonomics.',
          jw: 'Cecekelan kayu trembalo model Nunggak Semi mawa ukiran patra alus.',
        },
        sumber: ['S1'],
      },
      {
        id: 'keris-warangka',
        judul: { id: 'Warangka Gayaman, Gandar & Pendok Bunton', en: 'Gayaman Boat-Hilt Sheath & Gold Pendok', jw: 'Warangka Gayaman saha Pendhok' },
        posisi: [0.46, -0.18, -0.28],
        explodeVec: [0.55, 0.08, -0.42],
        material: { id: 'Kayu Timoho Pelet · Selongsong Kuningan Emas', en: 'Marbled Timoho Wood · Gilt Brass Scabbard', jw: 'Kayu Timoho Pelet · Selongsong Kuningan' },
        fungsiTeknis: {
          id: 'Sarung pelindung gandar dan selubung logam pendok penolak oksidasi',
          en: 'Two-piece protective scabbard combining marbled timoho mouth with an oxidation-shielding gilt pendok oversleeve',
          jw: 'Wadhah pelindung gandar saha selubung pendhok panolak karat',
        },
        ringkasan: {
          id: 'Sarung pelindung bilah berhulu perahu Gayaman dari kayu kemuning-timoho berpadu selongsong pendok bunton berlapis emas yang dapat dibedah terpisah.',
          en: 'Boat-shaped Gayaman top throat carved from natural pelet-grained timoho wood sleeved into a closed gilt-brass pendok bunton oversheath.',
          jw: 'Wadhah wilah saking kayu kemuning pinasangan selongsong pendhok bunton kuningan.',
        },
        sumber: ['S1'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Mengapa Keris Luk 5 identik dengan filosofi Pandawa?',
        en: 'Why is the five-wave Keris Luk 5 associated with the Pandava knights?',
        jw: 'Kenging menapa Dhuwung Luk Lima kagandheng kalih falsafah Pandhawa?',
      },
      {
        id: 'Bagaimana cara empu membentuk motif pamor di bilah keris?',
        en: 'How does an empu forge nickel meteorite pamor patterns into a keris blade?',
        jw: 'Kados pundi empu ndamel motif pamor ing wilahan dhuwung?',
      },
      {
        id: 'Apa arti kesatuan ganja dan wilah pada dhuwung?',
        en: 'What does the unity of the horizontal ganja and vertical wilah symbolize?',
        jw: 'Menapa tegesipun nyawijining ganja lan wilah wonten dhuwung?',
      },
    ],
  },
  {
    id: 'saron',
    nomorUrut: '02',
    dioramaLabel: { id: 'BALE KARAWITAN', en: 'GAMELAN PAVILION', jw: 'BALE KARAWITAN' },
    zonaKode: 'ZON-02 · KARAWITAN SLENDRO',
    badgeStatus: { id: 'UNESCO 2021', en: 'UNESCO 2021', jw: 'UNESCO 2021' },
    aksara: 'ꦱꦫꦺꦴꦤ꧀',
    warnaAksen: '#9a6c1d',
    nama: { id: 'Saron Laras Slendro', en: 'Saron Barung (Slendro Bronze)', jw: 'Saron Barung Slendro' },
    subjudul: {
      id: 'Enam Bilah Perunggu & Rancakan Kayu Jati Ukir',
      en: 'Six Gangsa Bronze Keys & Carved Teak Trough',
      jw: 'Enem Wilah Gangsa saha Rancakan Jati Ukir',
    },
    kategori: { id: 'Karawitan', en: 'Classical Gamelan', jw: 'Karawitan' },
    asal: { id: 'Jawa Tengah & Yogyakarta', en: 'Central Java & Yogyakarta', jw: 'Jawa Tengah saha Ngayogyakarta' },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-02 · S4' },
      { label: { id: 'Paduan', en: 'Alloy', jw: 'Campuran' }, nilai: { id: 'Gangsa 78/22', en: '78/22 Cu-Sn Bronze', jw: 'Gangsa 78/22' } },
      { label: { id: 'Larasan', en: 'Scale', jw: 'Larasan' }, nilai: { id: 'Slendro 6 Bilah', en: 'Slendro 6 Keys', jw: 'Slendro 6 Wilah' } },
    ],
    parameterCad: [
      { label: { id: 'Tawonan & Pluntur', en: 'Pins & Cord', jw: 'Tawonan & Pluntur' }, nilai: { id: '12 Pasak + 2 Tali', en: '12 Pins + 2 Rails', jw: '12 Paku + 2 Tali' } },
      { label: { id: 'Resonator', en: 'Resonator', jw: 'Resonator' }, nilai: { id: 'Rancakan Jati Ukir', en: 'Carved Teak Box', jw: 'Rancakan Jati Ukir' } },
      { label: { id: 'Tabuh Nada', en: 'Mallet', jw: 'Tabuh Nada' }, nilai: { id: 'Gandhen Kayu Sawo', en: 'Sawo Wood Mallet', jw: 'Gandhen Kayu Sawo' } },
    ],
    ringkas: {
      id: 'Instrumen pembawa kerangka melodi (balungan) dalam ansambel gamelan dengan enam bilah nada Slendro jernih.',
      en: 'Nuclear melody (balungan) metallophone in Javanese gamelan tuned to a shimmering six-key pentatonic Slendro scale.',
      jw: 'Piranti panyangga lagu pokok (balungan) ing gamelan kanthi swara gangsa kang bening.',
    },
    sejarahSingkat: {
      id: 'Dipadukan dari perunggu gangsa (campuran 78% tembaga dan 22% timah putih berkualitas tinggi), bilah saron ditempa serta dilaras melalui pengikisan ketebalan agar menghasilkan dengung harmonis yang saling menimpali.',
      en: 'Cast from resonant bell bronze (78% copper and 22% pure tin), each convex saron key is hand-forged and scraped on its underside to tune shimmering acoustic partials across the ensemble.',
      jw: 'Kagawe saka gangsa (campuran 78% tembaga lan 22% timah), wilah saron ditempa lan dilaras nganti ngasilake swara kang gumelar endah.',
    },
    filosofi: {
      id: 'Permainan tabuh diikuti teknik pijetan (meredam nada sebelumnya menggunakan ibu jari dan telunjuk kiri) melatih fokus serta pengendalian diri.',
      en: 'Striking with the right mallet while muting the prior key with the left thumb and index finger (pijetan) disciplines attentiveness, mutual listening, and inner restraint.',
      jw: 'Nabuh sinambi mijet wilah sadurunge nglatih konsentrasi saha ngendhaleni hawa nafsu.',
    },
    sulukLarik: [
      {
        id: 'Enam bilah perunggu gangsa berbaris rapi di atas palungan jati,',
        en: 'Six cast-bronze keys lie aligned atop the carved teak resonator,',
        jw: 'Enem wilah gangsa jajar runtut ing dhuwur rancakan jati,',
      },
      {
        id: 'Laras Slendro membawa lima nada pentatonis sejajar,',
        en: 'Slendro tuning sounds five luminous tones in measured cadence,',
        jw: 'Laras Slendro nggawa limang swara pentatonis kang timbang,',
      },
      {
        id: 'Tangan kanan memukul ganden, tangan kiri memijet getaran lama,',
        en: 'Right hand strikes the mallet, left fingers gently hush the parting chime,',
        jw: 'Tangan tengen nabuh ganden, tangan kiwa nyigeg swara lawas,',
      },
      {
        id: 'Menjaga kerangka balungan gending tetap ajeg bersatu,',
        en: 'Holding the skeletal balungan melody steady as one voice,',
        jw: 'Njaga balungan gendhing supaya tetep runtut nyawiji,',
      },
      {
        id: 'Harmoni muncul bukan karena suara keras, melainkan saling mendengar.',
        en: 'Harmony never rises from loudness, only from deep mutual listening.',
        jw: 'Larasing swara tuwuh dudu amarga banter, nanging padha ngrungokake.',
      },
    ],
    sumber: ['S4'],
    titikInfo: [
      {
        id: 'saron-wilah',
        judul: { id: 'Enam Bilah Perunggu Gangsa 78/22', en: 'Six Cast Gangsa 78/22 Bronze Keys', jw: 'Enem Wilah Gangsa 78/22' },
        posisi: [0, 0.24, 0.22],
        explodeVec: [0, 0.68, 0],
        material: { id: 'Perunggu Tempa 78% Cu + 22% Sn', en: 'Hand-Forged 78% Copper + 22% Tin Bronze', jw: 'Gangsa Tempa 78% Cu + 22% Sn' },
        fungsiTeknis: {
          id: 'Pembangkit nada balungan 1–2–3–5–6–i bertubuh punggung cembung',
          en: 'Convex-crowned acoustic plates generating pure Slendro 1–2–3–5–6–i pitches',
          jw: 'Pembangkit swara balungan 1–2–3–5–6–i kanthi punggung cembung',
        },
        ringkasan: {
          id: 'Enam bilah nada Slendro berketebalan berjenjang (tinggi lebih tebal) untuk menghasilkan resonansi nyaring tanpa nada sumbang.',
          en: 'Six graduated bronze keys (thicker toward higher pitches) precisely shaped for bright overtone clarity and rapid melodic damping.',
          jw: 'Enem wilah nada 1–2–3–5–6–i kang ditempa dadi balungan gending.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-pluntur',
        judul: { id: '12 Paku Tawonan & Tali Pluntur', en: 'Twelve Tawonan Brass Pins & Pluntur Cord', jw: 'Paku Tawonan saha Pluntur' },
        posisi: [-0.35, 0.12, 0.26],
        explodeVec: [0, 0.2, 0],
        material: { id: 'Pasak Kuningan Berbalut Tali Serat Pilin', en: 'Turned Brass Pegs over Braided Fiber Rail', jw: 'Paku Kuningan saha Tali Serat Pluntur' },
        fungsiTeknis: {
          id: 'Suspensi titik simpul (nodal point) agar wilah bergetar merdeka tanpa membentur kayu',
          en: 'Suspends keys strictly at acoustic nodal points to prevent timber buzzing',
          jw: 'Nggantung wilah persis ing titik simpul getaran supaya ora nabrak kayu',
        },
        ringkasan: {
          id: 'Dua rel bantalan tali pluntur dan dua belas paku penyangga tawonan yang menopang bilah tepat di titik simpul getarnya.',
          en: 'Twin tensioned braided rails and twelve turned pins seating each bronze plate freely over its vibration nodes.',
          jw: 'Tali pluntur lan rolas paku tawonan kang nyangga getering wilah supaya tetep bening.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-rancakan',
        judul: { id: 'Palungan Resonator Kayu Jati Ukir', en: 'Carved Teak Trough Resonator (Rancakan)', jw: 'Rancakan Kayu Jati Ukir' },
        posisi: [-0.55, -0.24, 0.36],
        explodeVec: [0, -0.58, 0],
        material: { id: 'Kayu Jati Tua Kering Alami + Plinth Kaki', en: 'Seasoned Old-Growth Javanese Teak · Carved Feet', jw: 'Kayu Jati Tua Garing Alami + Plinth' },
        fungsiTeknis: {
          id: 'Ruang rongga penguat pantulan akustik frekuensi rendah-menengah',
          en: 'Open sound chamber amplifying fundamental lower-mid acoustic sustain',
          jw: 'Rongga swara kanggo nguwatake mantuling frekuensi tengah',
        },
        ringkasan: {
          id: 'Badan berongga dari kayu jati tua dengan panel tebeng ukir lung-lungan prada emas dan empat kaki bubut penopang akustik.',
          en: 'Hollow teak resonator housing gilded botanical lung-lungan reliefs on its front panels and four turned floor feet.',
          jw: 'Awak rancakan krowok nganggo ukiran lung-lungan prada kanggo mantulake swara.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-sayap',
        judul: { id: 'Sayap Haluan & Buritan Praba Emas', en: 'Gilded Crown Dragon Fins (Haluan & Buritan)', jw: 'Swiwi Rancakan Praba Emas' },
        posisi: [1.36, 0.08, 0.04],
        explodeVec: [0.72, -0.16, 0],
        material: { id: 'Kayu Jati Pahat Berbalut Prada Emas', en: 'Sculpted Teak Flanks with Gold Leaf Accents', jw: 'Kayu Jati Pahat Prada Emas' },
        fungsiTeknis: {
          id: 'Penutup ujung balungan serta simbol keagungan gaya Keraton Surakarta',
          en: 'Structural end-caps framing the key bed in classical Surakarta court symmetry',
          jw: 'Panutup pucuk rancakan saha tandha keagungan gaya Kraton Surakarta',
        },
        ringkasan: {
          id: 'Ujung kiri-kanan rancakan bermotif mahkota naga melengkung sebagai pengunci dinding kotak suara dan identitas stilistika gamelan.',
          en: 'Symmetrical dragon-crest prow and stern finials locking the sound box while crowning the ceremonial visual silhouette.',
          jw: 'Pucuk rancakan ukir makutha naga ing sisih kiwa lan tengen.',
        },
        sumber: ['S4'],
      },
      {
        id: 'saron-ganden',
        judul: { id: 'Tabuh Gandhen Kayu Sawo & Cincin Tembaga', en: 'Turned Sawo-Wood Mallet (Gandhen) & Copper Ring', jw: 'Tabuh Gandhen Kayu Sawo' },
        posisi: [1.18, 0.72, 0.48],
        explodeVec: [0.64, 0.48, 0.52],
        material: { id: 'Kayu Sawo Keras Bubut · Ring Tembaga', en: 'Dense Sawo Hardwood Head · Copper Banding', jw: 'Kayu Sawo Keras Bubut · Cincin Tembaga' },
        fungsiTeknis: {
          id: 'Penumbuk elastis pembentuk karakter serangan lembut pada perunggu panas',
          en: 'Elastic hardwood impact surface yielding warm bronze overtones without denting',
          jw: 'Panumbuk elastis pembentuk swara alus ing wilah gangsa',
        },
        ringkasan: {
          id: 'Pemukul berbentuk tong bubut bermahkota cincin tembaga dari kayu sawo berdensitas seimbang agar wilah tetap awet.',
          en: 'Lathe-turned barrel mallet carved from dense sawo timber reinforced with a copper band for clean tonal articulation.',
          jw: 'Gandhen bubut kayu sawo kanggo ngasilake swara alus tanpa ngrusak wilah.',
        },
        sumber: ['S4'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Bagaimana teknik memijet nada pada permainan Saron?',
        en: 'How does the pijetan damping technique work when playing the Saron?',
        jw: 'Kados pundi teknik mijet wilah nalika nabuh Saron?',
      },
      {
        id: 'Apa perbedaan fungsi Saron Barung dengan Demung dan Peking?',
        en: 'How do Saron Barung, Demung, and Peking differ in register and role?',
        jw: 'Menapa bedanipun Saron Barung kalih Demung lan Peking?',
      },
      {
        id: 'Mengapa logam gangsa saron memakai campuran tembaga dan timah?',
        en: 'Why are gamelan saron bars cast from a 78/22 copper-tin bronze alloy?',
        jw: 'Kenging menapa logam gangsa saron ngangge campuran tembaga lan timah?',
      },
    ],
  },
  {
    id: 'batik',
    nomorUrut: '03',
    dioramaLabel: { id: 'GAZEBO WASTRA', en: 'TEXTILE PAVILION', jw: 'GAZEBO WASTRA' },
    zonaKode: 'ZON-03 · WASTRA KAWUNG',
    badgeStatus: { id: 'UNESCO 2009', en: 'UNESCO 2009', jw: 'UNESCO 2009' },
    aksara: 'ꦏꦮꦸꦁ',
    warnaAksen: '#b85d28',
    nama: { id: 'Batik Tulis Kawung', en: 'Hand-Drawn Batik Kawung', jw: 'Sinjang Batik Kawung' },
    subjudul: {
      id: 'Motif Larangan Keraton & Geometri Empat Penjuru',
      en: 'Forbidden Court Motif & Four-Cardinal Symmetry',
      jw: 'Motif Awisan Kraton saha Sekawan Keblat',
    },
    kategori: { id: 'Wastra Pusaka', en: 'Sacred Textile Art', jw: 'Wastra Pusaka' },
    asal: { id: 'Yogyakarta & Solo (Mataram)', en: 'Yogyakarta & Solo (Mataram)', jw: 'Ngayogyakarta saha Surakarta' },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-03 · S2' },
      { label: { id: 'Media', en: 'Medium', jw: 'Media' }, nilai: { id: 'Katun Primissima', en: 'Primissima Cotton', jw: 'Katun Primissima' } },
      { label: { id: 'Pewarna', en: 'Natural Dye', jw: 'Pewarna' }, nilai: { id: 'Soga & Indigo', en: 'Soga Bark & Indigo', jw: 'Soga & Tom Indigo' } },
    ],
    parameterCad: [
      { label: { id: 'Resolusi Motif', en: 'Motif Fineness', jw: 'Alusing Motif' }, nilai: { id: 'Isèn Cecek & Sawut', en: 'Cecek Dots & Sawut Lines', jw: 'Isèn Cecek & Sawut' } },
      { label: { id: 'Suhu Malam', en: 'Wax Temp', jw: 'Suhu Malam' }, nilai: { id: '70°C – 85°C Stabil', en: '70°C – 85°C Thermal', jw: '70°C – 85°C Ajeg' } },
      { label: { id: 'Rangka Tulis', en: 'Working Frame', jw: 'Rangka Tulis' }, nilai: { id: 'Gawangan Kayu Jati', en: 'Teak Gawangan Stand', jw: 'Gawangan Kayu Jati' } },
    ],
    ringkas: {
      id: 'Wastra bermotif empat kelopak buah aren simetris hasil torehan malam cair canting tulis sebagai lambang kebijaksanaan adil.',
      en: 'Ceremonial wax-resist textile displaying four symmetrical palm-fruit lobes drawn by molten copper canting as an emblem of just governance.',
      jw: 'Kain mawa gambar sekawan kuncup aren kang ditulis nganggo canthing malam pralambang adil lan wicaksana.',
    },
    sejarahSingkat: {
      id: 'Pada abad ke-18, motif Kawung termasuk "batik larangan" (awisan dalem) yang hanya dikenakan keluarga keraton. Proses pengerjaannya memakan waktu berbulan-bulan dengan pencelupan warna alam soga dan tarum indigo.',
      en: 'In 18th-century Mataram courts, Kawung was restricted as a forbidden royal pattern (awisan dalem) reserved for court nobles, demanding months of freehand canting drawing and botanical immersion in amber soga bark and indigo.',
      jw: 'Ing abad kaping-18, motif Kawung klebu batik larangan kraton kanthi pewarna alam soga coklat lan wedel biru indigo.',
    },
    filosofi: {
      id: 'Empat bulatan melingkari satu pusat mengajarkan konsep Kiblat Papat Lima Pancer — pengendalian diri di antara empat penjuru dunia.',
      en: 'Four elliptical palm petals orbiting one shared origin embody Kiblat Papat Lima Pancer — mindful harmony anchoring the four cosmic compass directions.',
      jw: 'Sekawan bunderan ngubengi punjer ngemot piwulang Keblat Papat Lima Pancer.',
    },
    sulukLarik: [
      {
        id: 'Mori putih dibentang lembut di hadapan perapian anglo hangat,',
        en: 'Pure white primissima cotton rests gently before the warm clay charcoal stove,',
        jw: 'Mori putih gumelar alus ing ngarep anglo anget,',
      },
      {
        id: 'Canting tembaga menorehkan malam cair mengikuti pola simetris,',
        en: 'A slender copper spout traces molten beeswax along fourfold geometry,',
        jw: 'Canthing tembaga nggambar malam panas manut pola simetris,',
      },
      {
        id: 'Empat bulatan buah aren mengelilingi satu titik pancer,',
        en: 'Four carved palm seeds encircle one silent luminous center,',
        jw: 'Sekawan bunderan kolang-kaling ngubengi siji punjer,',
      },
      {
        id: 'Soga jingga kecoklatan berpadu pekatnya biru daun tarum,',
        en: 'Earth-warm soga bark dyes kiss the deep midnight blue of crushed indigo leaf,',
        jw: 'Werna soga coklat nyawiji karo biru wedel godhong tom,',
      },
      {
        id: 'Kesabaran berbulan-bulan menjelma doa pelindung pemakainya.',
        en: 'Months of meditative patience crystallize into silent prayer upon the cloth.',
        jw: 'Kasabaran sasasi-sasi dadi donga pangayoman kanggo kang ngagem.',
      },
    ],
    sumber: ['S2'],
    titikInfo: [
      {
        id: 'batik-pusat',
        judul: { id: 'Simetri Pancer, Sawut & Cecek Kawung', en: 'Central Pancer, Sawut Rays & Cecek Fill', jw: 'Punjer, Sawut saha Cecek Kawung' },
        posisi: [0, 0.22, 0.2],
        explodeVec: [0, 0.1, -0.48],
        material: { id: 'Katun Tenun Halus Primissima + Lilin Malam', en: 'Fine-Spun Primissima Cotton + Beeswax Resist', jw: 'Katun Primissima Alus + Lilin Malam' },
        fungsiTeknis: {
          id: 'Sistem resist rintang lilin menciptakan gradien garis sawut & cecek tajam',
          en: 'Liquid-wax capillary barrier preserves crisp un-dyed white sawut lines and dot matrices',
          jw: 'Sistem rintang malam njaga garis alus sawut lan titik cecek tetep tajem',
        },
        ringkasan: {
          id: 'Pola geometris buah aren berlapis isen-isen sawut dan cecek pitu serta bingkai Tumpal Kemada pengingat keseimbangan batin.',
          en: 'Quatrefoil geometry filled with delicate hair-fine sawut hatching, seven-dot cecek clusters, and triangular Tumpal Kemada borders.',
          jw: 'Pola geometris kolang-kaling mawa isen-isen sawut saha tumpal kemada.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-gawangan',
        judul: { id: 'Bingkai Gawangan Jati & Kaki Penyangga', en: 'Teak Gawangan Rail Frame & Stand', jw: 'Gawangan Kayu Jati' },
        posisi: [-1.1, 0.62, 0.12],
        explodeVec: [0, 0.54, 0],
        material: { id: 'Palang & Tiang Jati Sambung Pasak', en: 'Peg-Joined Teak Crossbar & Uprights', jw: 'Palang & Cagak Jati Sambung Pasak' },
        fungsiTeknis: {
          id: 'Menopang bentangan mori tanpa menyentuh meja agar tetes malam cepat membeku',
          en: 'Suspends cotton in free air above dust so molten wax solidifies symmetrically on both faces',
          jw: 'Nggantung kain mori ing hawa bebas supaya tetesan malam rikat garing',
        },
        ringkasan: {
          id: 'Rangka penyangga melintang berfinial tembaga di atas kaki berbentuk huruf T yang menjaga kestabilan kain saat proses nyanting.',
          en: 'Mortised freestanding teak crossbar topped with brass finials supporting cloth smoothly during rhythmic hand drawing.',
          jw: 'Rangka kayu jati panyangga kain mori nalika dipun-canthing.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-canting',
        judul: { id: 'Canting Klowong: Nyamplung, Cucuk & Gagang', en: 'Copper Canting Pen: Reservoir, Spout & Reed', jw: 'Canthing Tembaga saha Malam' },
        posisi: [0.68, 0.28, 0.68],
        explodeVec: [0.52, 0.38, 0.68],
        material: { id: 'Mangkuk Tembaga Tipis · Gagang Bambu Kering', en: 'Hand-Beaten Copper Bowl · Dried Bamboo Handle', jw: 'Nyamplung Tembaga · Gagang Pring Garing' },
        fungsiTeknis: {
          id: 'Pena kapiler pengalir lilin panas lewat cucuk berkalibrasi 0.5–2 mm',
          en: 'Thermally conductive micro-spout delivering 0.5–2 mm continuous wax lines across cotton grain',
          jw: 'Pena kapiler pengalir malam panas liwat cucuk ukuran 0.5–2 mm',
        },
        ringkasan: {
          id: 'Peralatan inti bermangkuk tembaga penampung malam (nyamplung), cincin pengikat cangklong, dan paruh cucuk untuk menutup pori serat kain.',
          en: 'Signature batik stylus combining a copper bowl reservoir, curved brass tang collar, and precision capillary tip.',
          jw: 'Wadhah nyamplung saha cucuk tembaga alus kanggo nutup serat mori sadurunge dicelup.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-anglo',
        judul: { id: 'Tungku Anglo Terakota & Wajan Malam Cair', en: 'Terracotta Anglo Brazier & Copper Wax Pan', jw: 'Anglo Terakota saha Wajan Malam' },
        posisi: [0.75, -0.68, 0.58],
        explodeVec: [0.6, -0.22, 0.58],
        material: { id: 'Tanah Liat Bakar (Anglo) · Wajan Tembaga Kupingan', en: 'Kiln-Fired Clay Anglo · Hand-Hammered Skillet', jw: 'Lemah Lempung Bakar (Anglo) · Wajan Tembaga' },
        fungsiTeknis: {
          id: 'Menjaga viskositas campuran gondorukem, parafin, dan lilin lebah tetap encer',
          en: 'Regulates gentle radiant heat keeping resin-paraffin-beeswax blend fluid without scorching',
          jw: 'Njaga suhu campuran malam gondorukem lan lilin tawon tetep cuwer',
        },
        ringkasan: {
          id: 'Perapian arang kayu tanah liat (anglo) pemanas wajan tembaga berisi lilin malam cair agar tidak mengeras ketika ditorehkan.',
          en: 'Traditional low clay charcoal stove cradling a copper pan that keeps golden beeswax fluid beside the artisan.',
          jw: 'Kompor tradhisional anglo lan wajan tembaga pamanas malam cair.',
        },
        sumber: ['S2'],
      },
      {
        id: 'batik-soga',
        judul: { id: 'Pewarnaan Alam Soga, Tarum & Lorod', en: 'Botanical Soga-Indigo Dyeing & Wax Boiling', jw: 'Wedelan Soga saha Nglorod' },
        posisi: [-0.72, -0.35, 0.18],
        explodeVec: [0, 0.1, -0.48],
        material: { id: 'Kulit Kayu Tingi-Tegeran-Jambal & Daun Indigofera', en: 'Tingi-Tegeran-Jambal Tree Bark & Indigofera Paste', jw: 'Kulit Kayu Tingi-Jambal saha Godhong Tom' },
        fungsiTeknis: {
          id: 'Pengikatan pigmen botani berulang disusul perebusan pelepasan lilin',
          en: 'Repeated multi-week botanical mordant baths culminating in boiling-water wax release (nglorod)',
          jw: 'Panyerapan warna alam bola-bali nganti proses godhogan nglorod malam',
        },
        ringkasan: {
          id: 'Tahap pencelupan pewarna botani soga coklat dan biru tarum sebelum perebusan nglorod untuk memunculkan motif utuh di seluruh helai kain.',
          en: 'Iterative immersion in botanical indigo and warm soga tree bark followed by nglorod boiling to reveal crisp ivory motifs.',
          jw: 'Ekstrak kulit kayu alami soga lan godhong tom nganti proses nglorod.',
        },
        sumber: ['S2'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Mengapa motif Kawung dahulu berstatus batik larangan keraton?',
        en: 'Why was the Batik Kawung motif historically restricted as forbidden court attire?',
        jw: 'Kenging menapa motif Kawung rumiyin kalebet sinjang larangan kraton?',
      },
      {
        id: 'Bagaimana urutan proses nyanting hingga nglorod batik tulis?',
        en: 'What is the full stage sequence from hand-drawing (nyanting) to boiling off wax (nglorod)?',
        jw: 'Kados pundi urutaning proses nyanting ngantos nglorod batik tulis?',
      },
      {
        id: 'Apa makna filosofi Keblat Papat Lima Pancer di motif Kawung?',
        en: 'What does Kiblat Papat Lima Pancer signify inside the Kawung motif?',
        jw: 'Menapa tegesipun Keblat Papat Lima Pancer ing motif Kawung?',
      },
    ],
  },
  {
    id: 'joglo',
    nomorUrut: '04',
    dioramaLabel: { id: 'PENDOPO AGUNG', en: 'GREAT PENDOPO', jw: 'PENDHAPA AGUNG' },
    zonaKode: 'ZON-04 · PENDOPO JOGLO',
    badgeStatus: { id: 'WARISAN ARSITEKTUR', en: 'HERITAGE ARCHITECTURE', jw: 'WARISAN ARSITEKTUR' },
    aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    warnaAksen: '#516778',
    nama: { id: 'Pendopo Joglo', en: 'Pendopo Joglo Architecture', jw: 'Pendhapa Ageng Joglo' },
    subjudul: {
      id: 'Konstruksi Pasak Kayu Jati & Brunjung Tumpang Sari',
      en: 'Nail-Free Teak Mortise Joinery & Tumpang Sari Tiers',
      jw: 'Konstruksi Pasak Jati saha Tumpang Sari',
    },
    kategori: { id: 'Arsitektur Tradisional', en: 'Vernacular Architecture', jw: 'Arsitektur Jawi' },
    asal: { id: 'Jawa Tengah, Yogyakarta, & Jawa Timur', en: 'Central Java, Yogyakarta & East Java', jw: 'Tlatah Jawi' },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-04 · S6' },
      { label: { id: 'Struktur', en: 'Core Frame', jw: 'Struktur' }, nilai: { id: '4 Saka Guru Jati', en: '4 Teak Saka Guru', jw: '4 Saka Guru Jati' } },
      { label: { id: 'Sambungan', en: 'Joinery', jw: 'Sambungan' }, nilai: { id: 'Pasak Purus Lentur', en: 'Flexible Purus Pegs', jw: 'Pasak Purus Lentur' } },
    ],
    parameterCad: [
      { label: { id: 'Rangka Puncak', en: 'Apex Frame', jw: 'Rangka Pucuk' }, nilai: { id: 'Tumpang Sari Berongga', en: 'Hollow Tumpang Sari', jw: 'Tumpang Sari Krowok' } },
      { label: { id: 'Peredam Seismik', en: 'Seismic Damper', jw: 'Peredam Lindhu' }, nilai: { id: 'Sendi Geser Umpak', en: 'Sliding Umpak Footing', jw: 'Sendi Geser Umpak' } },
      { label: { id: 'Material Atap', en: 'Roofing', jw: 'Material Payon' }, nilai: { id: 'Genteng Tanah Liat', en: 'Terracotta Clay Tiles', jw: 'Gentheng Lempung' } },
    ],
    ringkas: {
      id: 'Bangunan vernakular tahan gempa dengan empat tiang utama saka guru dan langit-langit bertingkat tanpa sebatang pun paku besi.',
      en: 'Earthquake-resilient Javanese pavilion erected upon four massive teak columns and stepped timber vaults without a single metal nail.',
      jw: 'Wewangunan tahan lindhu nganggo sekawan saka guru saha tumpang sari tanpa paku wesi.',
    },
    sejarahSingkat: {
      id: 'Struktur atap limasan menjulang tinggi (brunjung) menciptakan efek cerobong alami yang mendinginkan ruang pendopo tropis sekaligus menunjukkan kesetaraan interaksi sosial yang terbuka dari segala penjuru.',
      en: 'The steeply pitched brunjung crown generates natural convective updrafts that cool open-sided tropical gatherings while projecting open communal hospitality from all four compass sides.',
      jw: 'Payon brunjung kang dhuwur nyiptaake sirkulasi hawa adhem saha nuduhake sipat blaka lan terbuka.',
    },
    filosofi: {
      id: 'Undakan Tumpang Sari menyusun balok jati semakin mengerucut ke puncak — lambang naiknya kesadaran spiritual manusia dari urusan dunia menuju pencipta.',
      en: 'Each narrowing tier of the Tumpang Sari beam pyramid ascends toward a unified central apex, symbolizing spiritual elevation from worldly multiplicity toward the One.',
      jw: 'Undhakan tumpang sari kang saya munggah saya nyawiji minangka pralambang laku spiritual manungsa.',
    },
    sulukLarik: [
      {
        id: 'Empat tiang kayu jati tua berdiri teguh di atas batu umpak,',
        en: 'Four seasoned teak columns rest steady upon chiselled stone footings,',
        jw: 'Sekawan saka guru kayu jati ngadeg jejeg ing dhuwur umpak,',
      },
      {
        id: 'Saling bertaut melalui pasak kayu purus tanpa paku besi,',
        en: 'Interlocked strictly by wooden purus pegs without a single iron spike,',
        jw: 'Gegandhengan nganggo pasak kayu purus tanpa paku wesi,',
      },
      {
        id: 'Balok tumpang sari bersusun menyangga atap brunjung menjulang,',
        en: 'Stepped tumpang sari beams uplift the soaring brunjung crown,',
        jw: 'Balok tumpang sari kasusun rapet nyangga brunjung dhuwur,',
      },
      {
        id: 'Tanpa dinding pengadang, pendopo menyambut tamu dari segala penjuru,',
        en: 'Unwalled on every border, the pavilion welcomes guests from every wind,',
        jw: 'Tanpa pager kanggo nutup, pendhapa nampa tamu saka kabeh arah,',
      },
      {
        id: 'Lentur mengikuti ayunan gempa, teduh melindungi masyarakatnya.',
        en: 'Flexing safely when earth trembles, sheltering kinship beneath calm shade.',
        jw: 'Lentur ngetutake oyaging lindhu, ayom ngayomi kabeh kulawarga.',
      },
    ],
    sumber: ['S6'],
    titikInfo: [
      {
        id: 'joglo-brunjung',
        judul: { id: 'Atap Brunjung, Penanggap & Kuwungan Emas', en: 'Steep Brunjung Crown, Penanggap Skirt & Ridge Finial', jw: 'Payon Brunjung saha Wuwungan' },
        posisi: [0, 1.48, 0],
        explodeVec: [0, 1.12, 0],
        material: { id: 'Genteng Terakota Lempung & Makuta Bubungan', en: 'Fired Clay Terracotta Tiles & Ceramic Finials', jw: 'Gentheng Terakota saha Makutha Wuwungan' },
        fungsiTeknis: {
          id: 'Konveksi termal udara panas naik ke puncak dan menahan curah hujan tropis',
          en: 'Drives thermal stack ventilation upward while shedding heavy monsoon downpours',
          jw: 'Konveksi termal hawa panas munggah menyang pucuk lan nahan udan deres',
        },
        ringkasan: {
          id: 'Puncak atap bersudut curam di atas atap penanggap yang memicu efek cerobong alami sekaligus memancarkan wibawa bangunan.',
          en: 'Steeply angled pyramidal roof tier crowned above gentler outer penanggap slopes to cool air passively while conferring dignity.',
          jw: 'Pucuk payon dhuwur kanggo metokake hawa panas saha maringi kawibawan.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-tumpangsari',
        judul: { id: 'Tumpang Sari Berongga & Lampu Robyong', en: 'Hollow Tumpang Sari Vault & Brass Robyong Lamp', jw: 'Undhakan Tumpang Sari saha Robyong' },
        posisi: [0, 0.72, 0.08],
        explodeVec: [0, 0.72, 0],
        material: { id: 'Rangka Balok Jati Bertakik Purus (6–12 Undak)', en: 'Notched Old-Teak Beams in 6–12 Concentric Tiers', jw: 'Rangka Balok Jati Takikan Purus (6–12 Undhak)' },
        fungsiTeknis: {
          id: 'Menyalurkan gaya aksial dan puntir atap secara simetris ke empat kolom inti',
          en: 'Transfers colossal axial roof weight and wind torsion uniformly into the four core pillars',
          jw: 'Mbagi bobot aksial saha puntiran payon kanthi timbang ing sekawan saka guru',
        },
        ringkasan: {
          id: 'Susunan balok bingkai berongga mengerucut ke dalam (uleng) bermahkota lampu robyong di tengah ruangan utama pendopo.',
          en: 'Hollow corbeled ring-beam coffer tapering inward beneath the hanging brass robyong chandelier at the pavilion heart.',
          jw: 'Balok tumpuk krowok simetris ing dhuwur uleng kang mbagi aboting payon.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-sakaguru',
        judul: { id: 'Empat Saka Guru, Sunduk-Kili & Batu Umpak', en: 'Four Saka Guru Columns, Sunduk Ties & Stone Umpak', jw: 'Saka Guru, Sunduk saha Umpak' },
        posisi: [-0.62, -0.32, 0.54],
        explodeVec: [-0.31, -0.06, 0.27],
        material: { id: 'Kolom Kayu Jati Tua · Sambungan Cathokan-Purus', en: 'Solid Old-Growth Teak · Wedge-Locked Sunduk-Kili', jw: 'Cagak Kayu Jati Tua · Sambungan Cathokan-Purus' },
        fungsiTeknis: {
          id: 'Kerangka portal seismik lentur tanpa paku besi yang meredam guncangan tanah',
          en: 'Nail-free seismic portal frame resting freely on stone plinths to absorb ground tremors',
          jw: 'Rangka portal seismik lentur tanpa paku wesi kang nyuda getaran lindhu',
        },
        ringkasan: {
          id: 'Empat kolom kayu jati masif pengikat balok sunduk-pangeret yang berdiri fleksibel di atas umpak batu andesit guna meredam gempa.',
          en: 'Four central teak pillars locked by slotted sunduk-pangeret tie beams hovering atop trapezoidal andesite stones for earthquake damping.',
          jw: 'Sekawan cagak kayu jati saha sunduk ing dhuwur umpak watu andesit.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-penanggap',
        judul: { id: '12 Tiang Luar Penanggap & Serambi Terbuka', en: 'Twelve Outer Penanggap Columns & Open Veranda', jw: 'Soko Penanggap Keliling' },
        posisi: [1.15, -0.44, 0.32],
        explodeVec: [0.74, -0.18, 0.2],
        material: { id: '12 Kolom Kayu Jati Keliling', en: 'Twelve Perimeter Carved Teak Columns', jw: 'Rolas Cagak Kayu Jati Keliling' },
        fungsiTeknis: {
          id: 'Penyangga atap keliling penanggap pencipta akses ruang publik tanpa dinding',
          en: 'Supports sweeping perimeter eaves ensuring completely wall-less civic accessibility',
          jw: 'Panyangga payon penanggap keliling pencipta ruang kumpul tanpa pager',
        },
        ringkasan: {
          id: 'Barisan tiang tepi pendopo tanpa sekat dinding penutup yang mewujudkan filsafat keramahtamahan terbuka kepada sesama.',
          en: 'Outer gallery colonnade standing completely devoid of enclosing walls to physically express civic openness.',
          jw: 'Soko pananggap keliling tanpa pager minangka pralambang keterbukaan masyarakat.',
        },
        sumber: ['S6'],
      },
      {
        id: 'joglo-bebatur',
        judul: { id: 'Pelataran Bebatur Andesit Dua Tingkat', en: 'Two-Tier Andesite Bebatur Terrace Platform', jw: 'Bebatur Watu Andesit' },
        posisi: [0, -1.16, 0.85],
        explodeVec: [0, -0.74, 0],
        material: { id: 'Lantai Pondasi Batu Candi / Andesit', en: 'Dressed Volcanic Candi Andesite Masonry', jw: 'Pondhasi Watu Candi / Andesit' },
        fungsiTeknis: {
          id: 'Elevasi lantai ruang suci terhadap kelembaban tanah & banjir permukaan',
          en: 'Elevates all sacred timber joinery cleanly above monsoon runoff, soil dampness, and termites',
          jw: 'Ngangkat lantai kayu jati saking kelembaban lemah saha banjir',
        },
        ringkasan: {
          id: 'Dasar batur berundak dua yang mengangkat konstruksi kayu jati jauh dari kelembaban tanah dan rayap.',
          en: 'Two-stepped stone plinth lifting structural timbers far away from ground moisture and wood borers.',
          jw: 'Pondhasi batur watu andesit kalih undhakan pangayoman kayu saking lembab.',
        },
        sumber: ['S6'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Mengapa Pendopo Joglo dikenal tangguh menghadapi guncangan gempa?',
        en: 'Why are Javanese Joglo pavilions celebrated for earthquake resilience?',
        jw: 'Kenging menapa Pendhapa Joglo kondhang tangguh ngadhepi goncangan lindhu?',
      },
      {
        id: 'Apa perbedaan ruang Pendopo, Pringgitan, dan Dalem Ageng?',
        en: 'What distinguishes the spatial roles of Pendopo, Pringgitan, and Dalem Ageng?',
        jw: 'Menapa bedanipun papan Pendhapa, Pringgitan, lan Dalem Ageng?',
      },
      {
        id: 'Bagaimana teknik sambungan pasak kayu tanpa paku besi bekerja?',
        en: 'How does interlocking mortise-and-peg joinery work without metal nails?',
        jw: 'Kados pundi teknik sambungan pasak kayu tanpa paku wesi lumaku?',
      },
    ],
  },
  {
    id: 'wayang',
    nomorUrut: '05',
    dioramaLabel: { id: 'PANGGUNG KELIR', en: 'SHADOW SCREEN', jw: 'PANGGUNG KELIR' },
    zonaKode: 'ZON-05 · PANGGUNG PAKELIRAN',
    badgeStatus: { id: 'UNESCO 2008', en: 'UNESCO 2008', jw: 'UNESCO 2008' },
    aksara: 'ꦮꦪꦁ',
    warnaAksen: '#b33025',
    nama: { id: 'Wayang Kulit Purwa', en: 'Wayang Kulit Purwa Puppetry', jw: 'Ringgit Wacucal Purwa' },
    subjudul: {
      id: 'Tatahan Kulit Kerbau, Prada Emas & Tangkai Cempurit',
      en: 'Chiseled Buffalo Hide, Gold Leaf & Horn Control Rods',
      jw: 'Tatahan Wacucal Kebo, Prada Mas saha Cempurit',
    },
    kategori: { id: 'Seni Pakeliran', en: 'Shadow Theatre Art', jw: 'Seni Pakeliran' },
    asal: { id: 'Surakarta, Yogyakarta & Jawa Timur', en: 'Surakarta, Yogyakarta & East Java', jw: 'Tlatah Jawi' },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-05 · S3' },
      { label: { id: 'Media', en: 'Medium', jw: 'Media' }, nilai: { id: 'Kulit Kebo & Prada', en: 'Water Buffalo Hide & Gold', jw: 'Wacucal Kebo & Prada' } },
      { label: { id: 'Tangkai', en: 'Rods', jw: 'Gagang' }, nilai: { id: 'Cempurit Tanduk', en: 'Buffalo Horn Cempurit', jw: 'Cempurit Sungu Kebo' } },
    ],
    parameterCad: [
      { label: { id: 'Pahatan', en: 'Perforation', jw: 'Tatahan' }, nilai: { id: 'Krawangan & Seritan', en: 'Krawangan Filigree', jw: 'Krawangan & Seritan' } },
      { label: { id: 'Artikulasi', en: 'Jointing', jw: 'Sendi' }, nilai: { id: 'Bahu & Siku Senar', en: 'Chord-Hinged Shoulders', jw: 'Pundhak & Sikut Senar' } },
      { label: { id: 'Tata Cahaya', en: 'Lighting', jw: 'Cahya' }, nilai: { id: 'Blencong Minyak Kelapa', en: 'Blencong Oil Flame', jw: 'Blencong Lenga Klentik' } },
    ],
    ringkas: {
      id: 'Karya rupa datar dua muka dari kulit kerbau berlubang halus yang dihidupkan bayangan lampu blencong dan gerakan dalang.',
      en: 'Double-sided perforated buffalo leather puppet animated by flickering coconut-oil Blencong lamp light and the master dalang’s hand movements.',
      jw: 'Karya rupa kulit kebo tinatah alus kang urip dening cahya blencong lan olahing dhalang.',
    },
    sejarahSingkat: {
      id: 'Dikerjakan melalui ratusan tusukan pahat khusus (tatah) agar tembus cahaya ketika disinari blencong. Lapisan prada kertas emas dan pigmen sungging memberi dimensi visual baik di sisi penonton langsung maupun bayangan kelir.',
      en: 'Perforated through hundreds of steel tatah punches so blencong flame passes through intricate lattice cutouts, while polychrome sungging pigments and prada gold foil animate front-lit court performances.',
      jw: 'Digarap nganggo atusan tatahan bolongan alus supaya tembus cahya blencong lan dipulas prada mas.',
    },
    filosofi: {
      id: 'Layar kelir membentang laksana alam semesta, gedebog pisang tempat menancapkan lakon, lampu blencong laksana pelita akal budi, dan dalang penggerak kehendak.',
      en: 'The stretched cotton kelir embodies the cosmos, the soft banana trunk stage the grounded earth, the oil Blencong flame inner consciousness, and the dalang guiding intention.',
      jw: 'Kelir minangka jagad raya, gedebog minangka bumi, blencong minangka pepadhang urip, lan dhalang minangka pamurbeng lakon.',
    },
    sulukLarik: [
      {
        id: 'Layar blacu putih dibentangkan kencang menghadapi ruang gelap,',
        en: 'White unbleached cotton kelir stretches taut across the nocturnal hall,',
        jw: 'Kelir mori putih pinenthang kenceng ngadhepi petenging wengi,',
      },
      {
        id: 'Lampu blencong menyala, melempar bayangan panjang ke permukaan kain,',
        en: 'Warm Blencong flame awakens, casting breathing shadows across linen,',
        jw: 'Lampu blencong murub, mbuwang ayang-ayang dawa ing kelir,',
      },
      {
        id: 'Tangkai tanduk kerbau berputar di jemari sang dalang,',
        en: 'Curved buffalo-horn rods wheel delicately between the master dalang’s palms,',
        jw: 'Cempurit sungu kebo mubeng ing drijining ki dhalang,',
      },
      {
        id: 'Ketukan keprak kayu membelah sunyi sebelum perang kembang dimulai,',
        en: 'Iron and wooden keprak strikes fracture silence before battle unfolds,',
        jw: 'Thuthukan keprak nyigar sepi sadurunge perang kembang kawiwitan,',
      },
      {
        id: 'Semua tokoh akhirnya dicabut kembali ke kotak kayu dalam hening fajar.',
        en: 'By quiet daybreak every hero and demon returns calmly into the wooden chest.',
        jw: 'Kabeh paraga pungkasane sinimpen maneh ing kothak wayang ing wayah esuk.',
      },
    ],
    sumber: ['S3', 'S5'],
    titikInfo: [
      {
        id: 'wayang-sungging',
        judul: { id: 'Tatahan Halus & Prada Emas Kulit Kerbau', en: 'Intricate Leather Carving & Gold Prada Foil', jw: 'Tatahan saha Prada Mas' },
        posisi: [0, 0.38, 0.08],
        explodeVec: [0, 0.2, 0.38],
        material: { id: 'Kulit Perkamen Kerbau Kering · Kertas Prada', en: 'Sun-Cured Buffalo Parchment · Gilded Prada Leaf', jw: 'Wacucal Perkamen Kebo · Prada Emas' },
        fungsiTeknis: {
          id: 'Lubang pahat tembus cahaya untuk gradasi siluet hidup di atas kelir blacu',
          en: 'Light-transmitting filigree punctures creating luminous texture gradation across the screen',
          jw: 'Bolongan pahat tembus cahya kanggo gradasi bayangan ing kelir mori',
        },
        ringkasan: {
          id: 'Pahatan pola kawung, seritan, dan sembulihan pada kulit kerbau kering berlapis prada emas agar sorot cahaya menembus indah.',
          en: 'Microscopic kawung, seritan, and sembulihan leather perforations glazed with gold leaf so oil light shimmers clearly.',
          jw: 'Ukiran bolong alus ing kulit kebo supaya nembus sorot blencong.',
        },
        sumber: ['S3'],
      },
      {
        id: 'wayang-mahkota',
        judul: { id: 'Gelung Supit Urang, Sumping & Kalung Ulur', en: 'Supit Urang Crown, Ear Ornament & Ulur Necklace', jw: 'Gelung Supit Urang saha Sumping' },
        posisi: [0.08, 1.05, 0.08],
        explodeVec: [-0.15, 0.68, 0.45],
        material: { id: 'Tatah Krawang Kerbau + Pigmen Sungging Emas', en: 'Chiseled Parchment Filigree + Polychrome Paint', jw: 'Tatah Krawang Kebo + Sungging Mas' },
        fungsiTeknis: {
          id: 'Penanda ikonografi karakter alusan kesatria keraton pada siluet kepala',
          en: 'Encodes refined alusan noble temperament immediately via downcast eyes and crown contour',
          jw: 'Tandha ikonografi watak alusan satriya ing wujud sirah',
        },
        ringkasan: {
          id: 'Mahkota capit udang bermata gabahan sipit menunduk yang menandakan kewibawaan tenang tokoh kesatria utama Sri Rama.',
          en: 'Backward-curving lobster-claw crown and grain-shaped downcast eyes signifying Sri Rama’s serene heroic poise.',
          jw: 'Makutha supit urang mawa mripat gabahan tandha watak alusan Sri Rama.',
        },
        sumber: ['S3', 'S5'],
      },
      {
        id: 'wayang-tuding',
        judul: { id: 'Engsel Tangan Senar & Tangkai Tuding', en: 'Chord-Hinged Arms & Flexing Tuding Rods', jw: 'Sendi Tangan saha Tuding' },
        posisi: [0.58, 0.08, 0.08],
        explodeVec: [0.65, 0.1, 0.35],
        material: { id: 'Tanduk Kerbau Putih Lentur · Benang Senar', en: 'White Flexible Water-Buffalo Horn · Bone Chord Ties', jw: 'Sungu Kebo Putih Lentur · Senar Pengikat' },
        fungsiTeknis: {
          id: 'Pengendali artikulasi dua sendi bahu-siku serta busur gendewa',
          en: 'Articulates shoulder-elbow kinematics and arrow aiming with whip-spring horn rods',
          jw: 'Panggerak sendi pundhak-sikut saha gendewa nalika sabetan',
        },
        ringkasan: {
          id: 'Bahu dan siku bertaut tali senar yang dikendalikan dua batang tanduk kerbau putih lentur (tuding) ketika dalang menyabet.',
          en: 'Dual chord-pinned shoulder and elbow joints puppeteered swiftly via slim tapered buffalo-horn tuding sticks.',
          jw: 'Sikut lan pundhak tinangsulan benang saha digerakake nganggo tuding.',
        },
        sumber: ['S3', 'S5'],
      },
      {
        id: 'wayang-cempurit',
        judul: { id: 'Gapit Cempurit Tanduk & Dudukan Gedebog', en: 'Main Horn Spine (Cempurit) & Banana Trunk Stage', jw: 'Cempurit saha Gedebog' },
        posisi: [0, -1.12, 0.05],
        explodeVec: [0, -0.68, 0],
        material: { id: 'Tanduk Kerbau Penjepit · Batang Gedebog Pisang', en: 'Clamped Twin Horn Spine · Fresh Banana Trunk Stage', jw: 'Sungu Kebo Penjepit · Gedebog Pisang' },
        fungsiTeknis: {
          id: 'Rangka penegak tubuh kulit lentur sekaligus pasak tancap panggung',
          en: 'Split central spine clamping limp hide flat while staking cleanly into banana-pith sockets',
          jw: 'Rangka panegak awak wacucal saha pasak tancap ing panggung gedebog',
        },
        ringkasan: {
          id: 'Tangkai penjepit tulang tengah dari tanduk kerbau melengkung yang ditancapkan ke batang gedebog panggung saat adegan berlangsung.',
          en: 'Split steam-bent buffalo-horn spine supporting the entire silhouette vertically inside soft plantain-stem stage logs.',
          jw: 'Gapit sungu kebo ing tengahing awak wayang kanggo nancep ing gedebog.',
        },
        sumber: ['S3'],
      },
      {
        id: 'wayang-blencong',
        judul: { id: 'Pelita Minyak Blencong Bersayap Garuda', en: 'Garuda-Winged Brass Blencong Oil Lamp', jw: 'Lampu Blencong Kuningan' },
        posisi: [-1.18, 0.94, 0.28],
        explodeVec: [-0.72, 0.52, 0.35],
        material: { id: 'Cor Kuningan · Sumbu Katun Minyak Kelapa', en: 'Cast Golden Brass · Cotton Wick Coconut-Oil Reservoir', jw: 'Kuningan Cor · Sumbu Kapas Lenga Klentik' },
        fungsiTeknis: {
          id: 'Sumber pencahayaan tunggal hangat dinamis pencipta bayangan kelir',
          en: 'Single overhead warm point flame animating living shadow contrast across perforated hide',
          jw: 'Sumber cahya anget tunggal kang nguripake wewayangan kelir',
        },
        ringkasan: {
          id: 'Lampu minyak kelapa kuningan bersayap garuda dengan nyala api berkerdip alami pemancar bayangan tatahan wayang ke kelir blacu.',
          en: 'Garuda-flanked hanging brass oil lamp projecting warm organic light that breathes life into shadow figures.',
          jw: 'Pelita kuningan isi lenga klentik mawa swiwi garuda kang madhangi tatahan wayang ing kelir.',
        },
        sumber: ['S3'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Apa fungsi tangkai cempurit dan tuding saat dalang menyabet wayang?',
        en: 'What roles do the cempurit spine and tuding hand rods serve during puppet animation?',
        jw: 'Menapa ginanipun cempurit lan tuding nalika dhalang nyabet ringgit?',
      },
      {
        id: 'Mengapa kulit kerbau digunakan dalam pembuatan wayang kulit purwa?',
        en: 'Why is cured water-buffalo leather chosen for classical wayang puppet carving?',
        jw: 'Kenging menapa kulit kebo pinilih kangge ndamel ringgit wacucal purwa?',
      },
      {
        id: 'Bagaimana kisah epik Kijang Kencana dalam pakeliran Ramayana?',
        en: 'How does the Golden Deer deception unfold in the Ramayana Aranya Kanda?',
        jw: 'Kados pundi lampahan Kidang Kencana wonten ing pakeliran Ramayana?',
      },
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
      en: 'Meteorite Pamor Forging & Five-Wave Balance',
      jw: 'Tempahan Pamor saha Kasaimbangan Luk Lima',
    },
    sorotan: {
      id: 'Dari perapian besi prapen hingga lipatan meteorit nikel, setiap detail bilah adalah meditasi ketepatan.',
      en: 'From charcoal forge to nickel-iron meteorite lamination, every contour of the blade is a meditation on poise.',
      jw: 'Saka prapen wesi nganti lipetan nikel meteorit, saben perangan bilah minangka olah rasa katelitian.',
    },
    narasiMendalam: {
      id: 'Dalam anatomi keris Jawa, bilah berkelok ganjil seperti Luk 5 ditempa melalui ratusan pemanasan bersuhu seribu derajat. Lapisan baja inti di bagian tengah diapit besi lunak dan campuran nikel berkilau keperakan.',
      en: 'In classical keris metallurgy, an odd-numbered wave blade like Luk 5 undergoes hundreds of thousand-degree fold-weld cycles, sandwiching a high-carbon core between wrought iron and silvery meteoritic nickel seams.',
      jw: 'Wilah dhuwung luk ganjil ditempa liwat atusan lipetan ing geni prapen kanthi inti waja lan pamor nikel sumunar.',
    },
    metrik: [
      { label: { id: 'Lapisan Lipat Tempa', en: 'Forge Fold Layers', jw: 'Lapisan Lipet Tempaan' }, nilai: { id: '128–512 Lipatan', en: '128–512 Layers', jw: '128–512 Lipetan' }, persen: 92 },
      { label: { id: 'Struktur Kelok Simetris', en: 'Wave Profile', jw: 'Struktur Luk Simetris' }, nilai: { id: 'Luk 5 (Pandawa)', en: 'Luk 5 (Five Pandavas)', jw: 'Luk Lima (Pandhawa)' }, persen: 84 },
      { label: { id: 'Kesesuaian Arsip S1', en: 'S1 Archival Match', jw: 'Rujukan Arsip S1' }, nilai: { id: 'Terverifikasi UNESCO', en: 'UNESCO Verified', jw: 'Kabukten UNESCO' }, persen: 100 },
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
      en: 'Gangsa Bronze Acoustics & Tuning Discipline',
      jw: 'Akustik Wilah Gangsa saha Disiplin Pelarasan',
    },
    sorotan: {
      id: 'Nada Slendro tidak lahir dari suara tunggal, melainkan getaran kolektif yang ditahan oleh kendali tangan kiri.',
      en: 'Slendro resonance emerges not from solo dominance, but collective overtones tempered by left-hand muting discipline.',
      jw: 'Swara Slendro ora mung tuwuh saka swara siji, nanging getaran bebarengan kang dijaga panyigeging asta.',
    },
    narasiMendalam: {
      id: 'Setiap bilah perunggu pada Saron Barung disangga paku tawonan beralas lilitan tali rotan di titik simpul getaran (nodal point), sehingga resonansi memantul bersih masuk ke palungan kayu jati tua.',
      en: 'Every cast bronze Saron Barung bar sits atop brass pins wrapped with braided rattan strictly at acoustic nodal points, projecting warm resonance into the hollow teak resonator chamber.',
      jw: 'Saben wilah gangsa pinasang ing tawonan sabarung supaya gema swara mlebu resik ing rancakan jati.',
    },
    metrik: [
      { label: { id: 'Komposisi Logam Gangsa', en: 'Gangsa Bronze Alloy', jw: 'Campuran Logam Gangsa' }, nilai: { id: 'Tembaga 78% · Timah 22%', en: '78% Copper · 22% Tin', jw: 'Tembaga 78% · Timah 22%' }, persen: 88 },
      { label: { id: 'Stabilitas Laras Slendro', en: 'Slendro Modal Stability', jw: 'Kestabilan Laras Slendro' }, nilai: { id: 'Interval Ekuipentatonik', en: 'Equipentatonic Scale', jw: 'Interval Ekuipentatonik' }, persen: 95 },
      { label: { id: 'Kesesuaian Arsip S4', en: 'S4 Archival Match', jw: 'Rujukan Arsip S4' }, nilai: { id: 'Terverifikasi UNESCO', en: 'UNESCO Verified', jw: 'Kabukten UNESCO' }, persen: 100 },
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
      en: 'Cardinal Pancer Geometry & Molten Wax Devotion',
      jw: 'Geometri Puncer saha Katelatenan Malam',
    },
    sorotan: {
      id: 'Sebelum warna masuk ke serat mori, setiap lengkung simetris harus dilindungi tetesan malam tembaga tanpa putus.',
      en: 'Before botanical pigment enters a single cotton thread, every symmetrical curve must be sealed by unbroken wax drops.',
      jw: 'Sadurunge werna nyerep ing mori, saben lengkung kudu dijaga nganggo tetesan malam canthing.',
    },
    narasiMendalam: {
      id: 'Proses batik tulis tidak mengenal jalan pintas digital: dari pemolaan nglowongi, pengisian motif halus isen-isen cecekan, penutupan bidang nembok, pencelupan tarum atau soga, hingga pelorodan air mendidih.',
      en: 'Authentic hand-drawn batik refuses shortcuts: progressing through outline tracing (nglowongi), fine dotted micro-fills (isen-isen), broad field masking (nembok), multi-week natural dye baths, and boiling release.',
      jw: 'Proses batik tulis kawiwitan saka nglowongi, isen-isen cecekan, nembok, wedelan soga, nganti nglorod.',
    },
    metrik: [
      { label: { id: 'Siklus Pencelupan Alam', en: 'Natural Dye Cycles', jw: 'Siklus Wedelan Alam' }, nilai: { id: '12–24 Kali Celup', en: '12–24 Immersions', jw: '12–24 Celupan' }, persen: 90 },
      { label: { id: 'Ketelitian Garis Canting', en: 'Spout Precision', jw: 'Katelitian Paruh Canthing' }, nilai: { id: '0.4 mm Paruh Tembaga', en: '0.4 mm Copper Nib', jw: '0.4 mm Paruh Tembaga' }, persen: 86 },
      { label: { id: 'Kesesuaian Arsip S2', en: 'S2 Archival Match', jw: 'Rujukan Arsip S2' }, nilai: { id: 'Terverifikasi UNESCO', en: 'UNESCO Verified', jw: 'Kabukten UNESCO' }, persen: 100 },
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
      en: 'Nail-Free Seismic Timber Frame Engineering',
      jw: 'Struktur Tahan Lindhu Tanpa Paku Wesi',
    },
    sorotan: {
      id: 'Keempat Saka Guru berdiri bebas di atas umpak batu; saat bumi bergetar, bangunan berayun lentur tanpa patah.',
      en: 'Four Saka Guru trunks hover atop stone umpak bearings so earth tremors dissipate gently in elastic sway without shearing.',
      jw: 'Sekawan saka guru ngadeg ing umpak watu; nalika lindhu teka, wewangunan lentur melu obah tanpa tugel.',
    },
    narasiMendalam: {
      id: 'Sistem sambungan pasak purus dan uleng tumpang sari bertingkat menyalurkan gaya gravitasi atap brunjung ke empat sudut utama. Ruang pendopo yang tanpa tembok menjadi tempat rembuk warga.',
      en: 'Peg-locked purus joinery and concentric Tumpang Sari beam vaults redistribute towering brunjung dead-loads into four central pillars while keeping public perimeter aisles completely wall-free.',
      jw: 'Sambungan purus saha tumpang sari mbagi boboting brunjung menyang sekawan sudut saka guru.',
    },
    metrik: [
      { label: { id: 'Efisiensi Redaman Seismik', en: 'Seismic Damping Efficiency', jw: 'Efisiensi Peredam Lindhu' }, nilai: { id: 'Sendi Umpak Lentur', en: 'Elastic Stone Footing', jw: 'Sendi Umpak Lentur' }, persen: 96 },
      { label: { id: 'Ventilasi Termal Cerobong', en: 'Thermal Chimney Draft', jw: 'Sirkulasi Hawa Cerobong' }, nilai: { id: 'Sudut Brunjung Curam', en: 'Steep Brunjung Pitch', jw: 'Sudut Brunjung Dhuwur' }, persen: 91 },
      { label: { id: 'Kesesuaian Arsip S6', en: 'S6 Archival Match', jw: 'Rujukan Arsip S6' }, nilai: { id: 'Terverifikasi Kemdikbud', en: 'Kemdikbud Verified', jw: 'Kabukten Kemdikbud' }, persen: 100 },
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
      en: 'Shadow Theatre, Filigree Carving & Blencong Flame',
      jw: 'Teater Ayang-Ayang, Tatah Prada saha Blencong',
    },
    sorotan: {
      id: 'Satu layar kain putih, dua batang tanduk lentur, dan nyala minyak kelapa melahirkan ratusan watak tokoh epik.',
      en: 'One stretched white cloth, two buffalo-horn rods, and a flickering coconut-oil flame awaken hundreds of epic archetypes.',
      jw: 'Kelir mori siji, cempurit tanduk loro, saha lampu blencong nuwuhake atusan watak tokoh epik.',
    },
    narasiMendalam: {
      id: 'Pemesin bayangan Nusantara sejak abad ke-10 tidak hanya menatah siluet tepi, melainkan melubangi ornamen dalam kulit kerbau agar cahaya lampu blencong memancarkan tekstur renda bercahaya pada layar kelir.',
      en: 'Dating back to 10th-century Java, puppet smiths carve micro-filigree perforations inside water-buffalo parchment rather than mere outlines, transforming Blencong flame into glowing filigree silhouettes.',
      jw: 'Wayang kulit purwa ora mung diukir pinggire, nanging tinatah bolongan alus supaya cahya blencong nembus endah.',
    },
    metrik: [
      { label: { id: 'Artikulasi Sendi Lengan', en: 'Limb Articulation', jw: 'Artikulasi Sendi Asta' }, nilai: { id: 'Pundhak · Sikut · Tuding', en: 'Shoulder · Elbow · Rod', jw: 'Pundhak · Sikut · Tuding' }, persen: 94 },
      { label: { id: 'Ketahanan Bahan Kulit', en: 'Hide Durability', jw: 'Ketahanan Wacucal' }, nilai: { id: 'Wacucal Kebo Pilihan', en: 'Prime Buffalo Hide', jw: 'Wacucal Kebo Pilihan' }, persen: 89 },
      { label: { id: 'Kesesuaian Arsip S3 & S5', en: 'S3 & S5 Match', jw: 'Rujukan S3 & S5' }, nilai: { id: 'Terverifikasi UNESCO & Museum', en: 'UNESCO & Museum Verified', jw: 'Kabukten UNESCO & Museum' }, persen: 100 },
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
    en: 'The Golden Deer Epic (Aranya Kanda)',
    jw: 'Lakon Kidang Kencana (Aranya Kanda)',
  },
  sumberEpos: {
    id: 'Epos Ramayana Tradisi Pakeliran Yogyakarta & Surakarta',
    en: 'Classical Yogyakarta & Surakarta Ramayana Shadow Repertoire',
    jw: 'Serat Ramayana Tradhisi Pakeliran Jawi',
  },
  sumber: ['S3', 'S5'],
  daftarBabak: [
    {
      id: 'babak-1',
      nomor: 1,
      judul: {
        id: 'Babak I · Kemilau Muslihat di Tepi Dandaka',
        en: 'Act I · Shimmering Illusion at Dandaka Clearing',
        jw: 'Babak I · Kumelap Tipuan ing Wana Dandaka',
      },
      lokasi: { id: 'Pertapaan Hutan Dandaka', en: 'Dandaka Forest Hermitage', jw: 'Pertapan Wana Dandaka' },
      narasiDalang: {
        id: 'Atas perintah Rahwana, raksasa Marica menyamar menjadi Kijang Kencana berbulu keemasan untuk memancing perhatian Dewi Shinta jauh dari perlindungan Sri Rama.',
        en: 'Commanded by King Ravana, the shape-shifting giant Marica transforms into an iridescent golden deer to lure Lady Sita’s gaze and draw Sri Rama away from her sanctuary.',
        jw: 'Saking dhawuhing Prabu Dasamuka, Marica malih rupa dadi Kidang Kencana mawa wulu mas kanggo ngapusi Dewi Sinta.',
      },
      suluk: {
        id: 'Lir kilat kencana sumorot ing madyaning wana peteng, nggoda manah kang suci...',
        en: 'Like gilded lightning shimmering inside the shadowed forest, testing a serene and trusting heart...',
        jw: 'Lir kilat kencana sumorot ing madyaning wana peteng, mripat nggoda manah kang suci...',
      },
      posisiAwalRama: 0.46,
      posisiAwalKidang: -0.58,
      sumber: ['S5'],
    },
    {
      id: 'babak-2',
      nomor: 2,
      judul: {
        id: 'Babak II · Kejaran Langkah Lintas Rimba',
        en: 'Act II · Pursuit Across the Canopy',
        jw: 'Babak II · Pangoyaking Laku ing Tengah Rimba',
      },
      lokasi: { id: 'Lembah Rerumputan Timur Hutan', en: 'Eastern Grassland Glade', jw: 'Lembah Suket Sisih Wetan Wana' },
      narasiDalang: {
        id: 'Demi memenuhi permintaan tulus Dewi Shinta, Sri Rama melangkah mengejar sang kijang. Setiap kali hampir terjangkau, Kijang Kencana melompat menjauh menyeret Rama kian dalam ke hutan.',
        en: 'Honoring Sita’s gentle request, Sri Rama follows gracefully after the elusive deer. Whenever hand draws near, Kidang Kencana bounds further away, pulling the prince deeper into wilderness.',
        jw: 'Kanggo nyembadani panyuwuning garwa, Sri Rama ngoyak Kidang Kencana nganti saya adoh saka pondhok.',
      },
      suluk: {
        id: 'Drenging tekad sang satriya pinandhita, njangkah ngliwati jurang lan rerimbunan...',
        en: 'Steady strides the meditative warrior across deep ravines and tangled thickets...',
        jw: 'Drenging tekad sang satriya pinandhita, njangkah ngliwati jurang lan rerimbunan...',
      },
      posisiAwalRama: 0.34,
      posisiAwalKidang: -0.34,
      sumber: ['S5'],
    },
    {
      id: 'babak-3',
      nomor: 3,
      judul: {
        id: 'Babak III · Bidikan Gendewa Guwawijaya',
        en: 'Act III · Draw of the Guwawijaya Bow',
        jw: 'Babak III · Panah Wasesa Guwawijaya',
      },
      lokasi: { id: 'Tebing Batu Terang Bulan', en: 'Moonlit Stone Ridge', jw: 'Tebing Watu Padhang Rembulan' },
      narasiDalang: {
        id: 'Tatkala menyadari adanya hawa sihir raksasa, Sri Rama berhenti mantap, menarik busur pusaka Guwawijaya dan melepaskan anak panah bermantra tepat menembus wujud samaran.',
        en: 'Sensing demonic enchantment beneath the golden fur, Sri Rama halts calmly, draws his sacred heirloom bow Guwawijaya, and releases an enchanted shaft straight through the illusion.',
        jw: 'Sanalika mangerti tipu daya raksasa, Sri Rama narik gendewa Guwawijaya lan ngluncurake jemparing pusaka.',
      },
      suluk: {
        id: 'Pamor waja muluk lumepas saking tali gendewa kenceng tanpa ragu...',
        en: 'Swift! Folded steel breaks free from the drawn bowstring without a trace of doubt...',
        jw: 'Swoosh! Pamor waja muluk lumepas saking tali gendewa kenceng tanpa ragu...',
      },
      posisiAwalRama: 0.56,
      posisiAwalKidang: -0.45,
      sumber: ['S3', 'S5'],
    },
    {
      id: 'babak-4',
      nomor: 4,
      judul: {
        id: 'Babak IV · Gema Suara Palsu & Pelajaran Waspada',
        en: 'Act IV · False Echo & the Lesson of Vigilance',
        jw: 'Babak IV · Swara Tipuan saha Piwulang Wicaksana',
      },
      lokasi: { id: 'Kabut Senja Wana Dandaka', en: 'Dusk Mist in Dandaka Woods', jw: 'Pedhut Sore ing Wana Dandaka' },
      narasiDalang: {
        id: 'Sebelum sirna kembali ke rupa asli Marica, sang kijang menirukan suara serak Sri Rama memanggil Laksmana. Muslihat ganda ini mewariskan pesan abadi tentang ketenangan batin di hadapan godaan gemerlap semu.',
        en: 'Before reverting to Marica’s true ogre shape, the falling deer mimics Sri Rama’s voice calling desperately for Laksmana — leaving an enduring teaching against superficial glitter.',
        jw: 'Sadurunge sirna balik rupa Marica, kidang nirake swara Rama nyuwun tulung Laksmana — piwulang tumrap kasadaran batin.',
      },
      suluk: {
        id: 'Ampun gumunan ing cahya emas semu, amarga katentreman sejati dumunung ing ati kang eling...',
        en: 'Be never dazzled by fleeting golden gleam, for true serenity dwells only inside an awakened mind...',
        jw: 'Ampun gumunan ing cahya emas semu, amarga katentreman sejati dumunung ing ati kang eling...',
      },
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
      en: 'Awareness of Origin & Sacred Purpose',
      jw: 'Kasadaran Asal saha Tujuan Gesang',
    },
    makna: {
      id: 'Prinsip filosofis bahwa setiap penciptaan benda budaya (dari penempaan keris hingga panggung kelir) merupakan cermin perjalanan manusia mengenal asal dan arah kembalinya.',
      en: 'Classical Javanese teaching that every artisanal heirloom — from meteoric keris forging to the white shadow screen — mirrors humanity’s journey knowing where life originates and returns.',
      jw: 'Piwulang luhur yen saben karya budaya dadi pangilon tumrap manungsa mangerteni sangkan parane.',
    },
    keterkaitan: {
      id: 'Tergambar pada transisi bentuk Gunungan Wayang dari dasar laut/bumi menuju puncak api spiritual.',
      en: 'Mirrored visually in the Gunungan Cosmic Tree transitioning from earthly sea bases toward a single spiritual flame apex.',
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
      en: 'Stewarding Beauty & Balance of the Living World',
      jw: 'Ngendahake Katentremaning Jagad',
    },
    makna: {
      id: 'Amanat menjaga kelestarian alam dan tata sosial. Terlihat pada pemilihan pewarna tumbuhan alami batik soga, kayu jati terbarukan joglo, dan pelarasan suara alam gamelan.',
      en: 'Ethical duty to nurture ecological and social harmony — visible across plant-bark batik dyes, nail-free reusable joglo teak joinery, and collective gamelan tuning.',
      jw: 'Amanat njaga lestarining alam saha tata sosial, katon ing pewarna alam batik soga lan kayu joglo.',
    },
    keterkaitan: {
      id: 'Pendopo Joglo dibangun terbuka tanpa tembok pemisah guna merawat kerukunan antarsesama.',
      en: 'Open Joglo verandas eliminate dividing walls purposely to cultivate communal hospitality and transparency.',
      jw: 'Pendhapa Joglo kagiyut terbuka tanpa pager minangka papan sarasehan warga.',
    },
    sumber: ['S2', 'S4', 'S6'],
  },
];

export const KEUNGGULAN_SISTEM = [
  {
    nomor: '01',
    judul: {
      id: 'Geometri Prosedural & Pencahayaan HDR',
      en: 'Procedural 3D Geometry & Studio HDR Lighting',
      jw: 'Geometri Prosedural saha Cahya HDR',
    },
    teks: {
      id: 'Struktur pendopo, lengkung luk keris, dan sendi wayang kulit dibangun sebagai model WebGL PBR dengan pemetaan tekstur kayu, perunggu, dan pamor di bawah pencahayaan HDR studio.',
      en: 'Pendopo joinery, forged keris waves, and leather puppet hinges are procedurally sculpted as physically based WebGL meshes using textured timber, bell bronze, and crystalline pamor maps under HDR lighting.',
      jw: 'Pendhapa, luk keris, lan sendi wayang kawangun ing WebGL PBR mawa tekstur kayu, gangsa, lan pamor ing cahya HDR studio.',
    },
  },
  {
    nomor: '02',
    judul: {
      id: 'Urai Komponen & Kawat X-Ray CAD',
      en: 'Exploded Dissection & CAD X-Ray Wireframe',
      jw: 'Urai Komponen saha Kawat X-Ray CAD',
    },
    teks: {
      id: 'Alihkan tampilan secara presisi antara permukaan material nyata, lapisan hibrida, dan garis struktur X-Ray untuk memeriksa sambungan pasak, pesi, dan tatahan yang lazim tersembunyi.',
      en: 'Blend smoothly between realistic PBR shaders, hybrid structural overlays, and diagnostic CAD wireframe X-Ray views to inspect hidden tenons, tang axles, and filigree perforations.',
      jw: 'Gantinen antawisipun rupa nyata, hibrida, lan garis X-Ray kangge nliti pasak, pesi, saha tatahan alus.',
    },
  },
  {
    nomor: '03',
    judul: {
      id: 'Sintesis Akustik Karawitan Real-Time',
      en: 'Real-Time Karawitan Acoustic Synthesis',
      jw: 'Sintesis Akustik Karawitan Wektu-Nyata',
    },
    teks: {
      id: 'Nada pentatonik laras Slendro pada bilah saron, gema gong ageng, keprak dalang, hingga desis besi keris disintesis langsung oleh mesin Web Audio sesuai karakter akustik tiap instrumen.',
      en: 'Slendro bronze harmonics, deep Gong Ageng decay, sharp wooden keprak strikes, and subtle blade resonance are synthesized directly through Web Audio oscillators calibrated to each specimen.',
      jw: 'Nada pentatonik laras Slendro ing wilah saron, gong ageng, keprak dhalang, lan hunusan dhuwung kasintesis langsung dening Web Audio.',
    },
  },
  {
    nomor: '04',
    judul: {
      id: 'Kinematika Tangan 21-Titik di Perangkat',
      en: 'On-Device 21-Point Hand Gesture Control',
      jw: 'Kinematika Asta 21-Titik Lokal',
    },
    teks: {
      id: 'Model pengenalan gestur MediaPipe memproses pergerakan tangan sepenuhnya secara luring untuk mengendalikan rotasi pusaka, pembesaran detail, dan sabetan dua tokoh wayang.',
      en: 'Zero-upload local MediaPipe hand landmark inference lets visitors rotate 3D heirlooms, pinch-zoom structural details, and puppeteer dual shadow figures directly on-device.',
      jw: 'Model pangolah gestur MediaPipe lumaku ing piranti piyambak tanpa ngirim gambar kangge muter pusaka lan nglakokake wayang.',
    },
  },
];

export const PILAR_NILAI = [
  {
    nomor: '01',
    judul: { id: 'Dokumentasi Akurasi Tinggi', en: 'High-Precision Spatial Documentation', jw: 'Dokumentasi Akurasi Inggil' },
    sorot: { id: 'KONSERVASI SPASIAL', en: 'SPATIAL CONSERVATION', jw: 'KONSERVASI SPASIAL' },
    teks: {
      id: 'Merekam proporsi arsitektur Joglo, lipatan pamor besi-nikel, dan ukiran tatahan kulit ke dalam arsip tiga dimensi yang dapat diperiksa dari seluruh sudut.',
      en: 'Preserves traditional Joglo beam proportions, nickel-iron pamor metallurgy, and buffalo-hide perforations inside interactive 3D models inspectable from any angle.',
      jw: 'Nyathet proporsi arsitektur Joglo, lipetan pamor wesi-nikel, lan tatahan kulit ing arsip telung dhimensi.',
    },
  },
  {
    nomor: '02',
    judul: { id: 'Pembelajaran Eksploratif', en: 'Experiential Cultural Learning', jw: 'Pasinaon Eksploratif' },
    sorot: { id: 'INTERAKSI LANGSUNG', en: 'HANDS-ON DISCOVERY', jw: 'INTERAKSI LANGSUNG' },
    teks: {
      id: 'Membuka pemahaman budaya melalui praktik langsung: dengarkan laras Slendro tiap bilah saron, urai bagian keris satu per satu, dan gerakkan tokoh Sri Rama di kelir.',
      en: 'Invites active discovery: strike individual Slendro saron keys, separate keris sub-assemblies piece by piece, and choreograph Sri Rama’s bow across the shadow screen.',
      jw: 'Mbukak pangertosan budaya lumantar praktik: mirengake laras saron, ngurai bageyan dhuwung, lan nglakokake wayang.',
    },
  },
  {
    nomor: '03',
    judul: { id: 'Keterlacakan Rujukan S1–S7', en: 'Auditable Citation Lineage S1–S7', jw: 'Rujukan Resmi S1–S7' },
    sorot: { id: 'STANDAR KEPUSTAKAAN', en: 'ARCHIVAL RIGOR', jw: 'STANDAR KEPUSTAKAAN' },
    teks: {
      id: 'Seluruh istilah anatomi, narasi kronik, dan sistem tanya-jawab Pamomong mengacu secara eksplisit pada arsip UNESCO ICH, Museum Sonobudoyo, serta Perpusnas RI.',
      en: 'Every anatomical term, chronicle passage, and Pamomong retrieval citation traces explicitly to UNESCO ICH registers, Sonobudoyo Museum, Kemdikbud RI, and Perpusnas RI.',
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
    judul: { id: 'Pamor Beras Wutah', en: 'Beras Wutah Meteoric Pamor', jw: 'Pamor Wos Wutah' },
    subjudul: {
      id: 'Lipatan Nikel Meteorit & Warangan',
      en: 'Folded Nickel-Iron Meteorite & Acid Etch',
      jw: 'Lipetan Nikel Meteorit saha Warangan',
    },
    kodeArsip: 'KLR-01 · S1',
    spesifikasi: {
      id: 'Tosan Aji Mataram · Bilah Luk 5',
      en: 'Mataram Bladesmithing · Five-Wave Profile',
      jw: 'Tosan Aji Mataram · Wilah Luk Lima',
    },
    aksara: 'ꦥꦩꦺꦴꦂ',
    aksen: '#d1491b',
    ikonTipe: 'keris',
  },
  {
    id: 'et-saron-slendro',
    bendaId: 'saron',
    titikId: 'saron-wilah',
    kategoriKey: 'karawitan',
    judul: { id: 'Wilah Perunggu 6 Nada', en: 'Six-Key Bronze Slendro Bars', jw: 'Wilah Gangsa Enem Nada' },
    subjudul: {
      id: 'Laras Slendro · Pijetan Balungan',
      en: 'Slendro Tuning · Pijetan Damping',
      jw: 'Laras Slendro · Pijetan Balungan',
    },
    kodeArsip: 'KLR-02 · S4',
    spesifikasi: {
      id: 'Paduan Gangsa 78/22 · Plisir Jati',
      en: '78/22 Gangsa Bronze · Teak Trough',
      jw: 'Campuran Gangsa 78/22 · Rancakan Jati',
    },
    aksara: 'ꦱꦫꦺꦴꦤ꧀',
    aksen: '#9a6c1d',
    ikonTipe: 'saron',
  },
  {
    id: 'et-batik-kawung',
    bendaId: 'batik',
    titikId: 'batik-pusat',
    kategoriKey: 'wastra',
    judul: { id: 'Simetri Kiblat Papat', en: 'Cardinal Quatrefoil Symmetry', jw: 'Simetri Keblat Papat' },
    subjudul: {
      id: 'Canting Tembaga & Celup Soga',
      en: 'Copper Canting Wax & Natural Soga Dye',
      jw: 'Canthing Tembaga saha Wedelan Soga',
    },
    kodeArsip: 'KLR-03 · S2',
    spesifikasi: {
      id: 'Katun Primissima · Rintang Malam',
      en: 'Primissima Cotton · Wax Resist Craft',
      jw: 'Katun Primissima · Rintang Malam',
    },
    aksara: 'ꦏꦮꦸꦁ',
    aksen: '#b85d28',
    ikonTipe: 'batik',
  },
  {
    id: 'et-joglo-tumpangsari',
    bendaId: 'joglo',
    titikId: 'joglo-tumpangsari',
    kategoriKey: 'arsitektur',
    judul: { id: 'Undakan Tumpang Sari', en: 'Tiered Tumpang Sari Vault', jw: 'Undhakan Tumpang Sari' },
    subjudul: {
      id: 'Pasak Purus Jati Tanpa Paku',
      en: 'Nail-Free Teak Mortise Joinery',
      jw: 'Pasak Purus Jati Tanpa Paku',
    },
    kodeArsip: 'KLR-04 · S6',
    spesifikasi: {
      id: '4 Saka Guru · Atap Tajug Brunjung',
      en: '4 Saka Guru · Brunjung Crown Pitch',
      jw: '4 Saka Guru · Payon Brunjung',
    },
    aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    aksen: '#516778',
    ikonTipe: 'joglo',
  },
  {
    id: 'et-wayang-rama',
    bendaId: 'wayang',
    titikId: 'wayang-sungging',
    kategoriKey: 'pakeliran',
    judul: { id: 'Satria Sri Rama', en: 'Noble Hero Sri Rama', jw: 'Satriya Sri Rama' },
    subjudul: {
      id: 'Tatahan Wacucal Kebo & Cempurit',
      en: 'Buffalo-Hide Carving & Horn Rods',
      jw: 'Tatahan Wacucal Kebo & Cempurit',
    },
    kodeArsip: 'KLR-05 · S3',
    spesifikasi: {
      id: 'Kulit Perkamen · Tanduk Kerbau',
      en: 'Cured Hide · Buffalo Horn Spine',
      jw: 'Wacucal Perkamen · Sungu Kebo',
    },
    aksara: 'ꦫꦩ',
    aksen: '#b33025',
    ikonTipe: 'wayang',
  },
  {
    id: 'et-wayang-kidang',
    bendaId: 'wayang',
    halamanTarget: 'pakeliran',
    kategoriKey: 'pakeliran',
    judul: { id: 'Kidang Kencana 3D', en: 'Golden Deer Puppet 3D', jw: 'Kidang Kencana 3D' },
    subjudul: {
      id: 'Panggung Pakeliran · Aranya Kanda',
      en: 'Shadow Theatre · Aranya Kanda Epic',
      jw: 'Panggung Pakeliran · Aranya Kanda',
    },
    kodeArsip: 'KLR-06 · S5',
    spesifikasi: {
      id: 'Artikulasi Sendi Ganda · Prada Mas',
      en: 'Dual-Limb Articulation · Gold Leaf',
      jw: 'Sendi Ganda · Prada Mas',
    },
    aksara: 'ꦏꦶꦢꦁ',
    aksen: '#9a6c1d',
    ikonTipe: 'wayang',
  },
  {
    id: 'et-keris-warangka',
    bendaId: 'keris',
    titikId: 'keris-warangka',
    kategoriKey: 'tosan-aji',
    judul: { id: 'Warangka Gayaman Jati', en: 'Gayaman Scabbard & Gold Pendok', jw: 'Warangka Gayaman Jati' },
    subjudul: {
      id: 'Pendok Bunton & Mendak Permata',
      en: 'Gilt Oversleeve & Jeweled Collar',
      jw: 'Pendhok Bunton saha Mendhak Sesotya',
    },
    kodeArsip: 'KLR-07 · S1',
    spesifikasi: {
      id: 'Kayu Timoho Pelet · Kunyit Pendok',
      en: 'Timoho Wood · Brass Scabbard',
      jw: 'Kayu Timoho Pelet · Pendhok Kuningan',
    },
    aksara: 'ꦮꦫꦁꦏ',
    aksen: '#d1491b',
    ikonTipe: 'keris',
  },
  {
    id: 'et-joglo-umpak',
    bendaId: 'joglo',
    titikId: 'joglo-sakaguru',
    kategoriKey: 'arsitektur',
    judul: { id: 'Sendi Umpak Andesit', en: 'Andesite Seismic Umpak Bearing', jw: 'Sendi Umpak Andesit' },
    subjudul: {
      id: 'Peredam Getar Gempa Nusantara',
      en: 'Elastic Stone Footing Damper',
      jw: 'Peredam Getaran Lindhu Nuswantara',
    },
    kodeArsip: 'KLR-08 · S6',
    spesifikasi: {
      id: 'Batu Candi Pahat · Sendi Dinamis',
      en: 'Dressed Volcanic Stone · Floating Footing',
      jw: 'Watu Candhi Pahat · Sendi Dinamis',
    },
    aksara: 'ꦲꦸꦩ꧀ꦥꦏ꧀',
    aksen: '#516778',
    ikonTipe: 'joglo',
  },
];

export const DINDING_MATRIX: MatrixItem[] = [
  {
    id: 'm01',
    label: { id: 'Luk 5', en: 'Luk 5 Blade', jw: 'Luk Lima' },
    sub: { id: 'Tosan Aji', en: 'Bladesmithing', jw: 'Tosan Aji' },
    aksara: 'ꦭꦸꦏ꧀',
    kodeArsip: 'KLR-01 · S1',
    spesifikasi: { id: 'Bilah Tempa Pandawa', en: 'Pandava Five-Wave Forging', jw: 'Wilah Tempa Pandhawa' },
    bendaId: 'keris',
    titikId: 'keris-wilah',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#d1491b',
    pola: 'cakra',
  },
  {
    id: 'm02',
    label: { id: 'Slendro', en: 'Slendro Scale', jw: 'Laras Slendro' },
    sub: { id: 'Karawitan', en: 'Gamelan Music', jw: 'Karawitan' },
    aksara: 'ꦱ꧀ꦭꦺꦤ꧀ꦢꦿ',
    kodeArsip: 'KLR-02 · S4',
    spesifikasi: { id: 'Larasan Pentatonik 6 Bilah', en: '6-Key Pentatonic Harmonics', jw: 'Larasan Pentatonik 6 Wilah' },
    bendaId: 'saron',
    titikId: 'saron-wilah',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#9a6c1d',
    pola: 'bilah',
  },
  {
    id: 'm03',
    label: { id: 'Kawung', en: 'Kawung Motif', jw: 'Motif Kawung' },
    sub: { id: 'Wastra Soga', en: 'Sacred Textile', jw: 'Wastra Soga' },
    aksara: 'ꦏꦮꦸꦁ',
    kodeArsip: 'KLR-03 · S2',
    spesifikasi: { id: 'Geometri Papat Pancer', en: 'Four-Corner Axis Geometry', jw: 'Geometri Papat Puncer' },
    bendaId: 'batik',
    titikId: 'batik-pusat',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#b85d28',
    pola: 'grid',
  },
  {
    id: 'm04',
    label: { id: 'Joglo', en: 'Joglo Frame', jw: 'Pendhapa Joglo' },
    sub: { id: 'Tumpang Sari', en: 'Timber Vault', jw: 'Tumpang Sari' },
    aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    kodeArsip: 'KLR-04 · S6',
    spesifikasi: { id: 'Pasak Kayu Tanpa Paku', en: 'Nail-Free Teak Peg Joinery', jw: 'Pasak Kayu Tanpa Paku' },
    bendaId: 'joglo',
    titikId: 'joglo-tumpangsari',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#516778',
    pola: 'grid',
  },
  {
    id: 'm05',
    label: { id: 'Sri Rama', en: 'Sri Rama', jw: 'Sri Rama' },
    sub: { id: 'Pakeliran', en: 'Shadow Stage', jw: 'Pakeliran' },
    aksara: 'ꦫꦩ',
    kodeArsip: 'KLR-05 · S3',
    spesifikasi: { id: 'Wacucal Tatah Krawangan', en: 'Chiseled Buffalo-Hide Lattice', jw: 'Wacucal Tatah Krawangan' },
    bendaId: 'wayang',
    titikId: 'wayang-sungging',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#b33025',
    pola: 'gunungan',
  },
  {
    id: 'm06',
    label: { id: 'Pamor', en: 'Meteoric Pamor', jw: 'Pamor Dhuwung' },
    sub: { id: 'Beras Wutah', en: 'Beras Wutah', jw: 'Wos Wutah' },
    aksara: 'ꦥꦩꦺꦴꦂ',
    kodeArsip: 'KLR-06 · S1',
    spesifikasi: { id: 'Meteorit Nikel-Besi', en: 'Nickel-Iron Meteorite Forge', jw: 'Meteorit Nikel-Wesi' },
    bendaId: 'keris',
    titikId: 'keris-pamor',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#d1491b',
    pola: 'gelombang',
  },
  {
    id: 'm07',
    label: { id: 'Gangsa', en: 'Gangsa Bronze', jw: 'Gangsa 78/22' },
    sub: { id: 'Gamelan', en: 'Metallurgy', jw: 'Gamelan' },
    aksara: 'ꦒꦁꦱ',
    kodeArsip: 'KLR-07 · S4',
    spesifikasi: { id: 'Tembaga & Timah 78/22', en: '78/22 Copper-Tin Bell Bronze', jw: 'Tembaga & Timah 78/22' },
    bendaId: 'saron',
    titikId: 'saron-wilah',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#9a6c1d',
    pola: 'bilah',
  },
  {
    id: 'm08',
    label: { id: 'Canting', en: 'Copper Canting', jw: 'Canthing Tulis' },
    sub: { id: 'Rintang Malam', en: 'Beeswax Resist', jw: 'Rintang Malam' },
    aksara: 'ꦕꦤ꧀ꦛꦶꦁ',
    kodeArsip: 'KLR-08 · S2',
    spesifikasi: { id: 'Cucuk Tembaga Presisi', en: 'Precision Copper Nib Spout', jw: 'Cucuk Tembaga Presisi' },
    bendaId: 'batik',
    titikId: 'batik-canting',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#b85d28',
    pola: 'cakra',
  },
  {
    id: 'm09',
    label: { id: 'Brunjung', en: 'Brunjung Roof', jw: 'Payon Brunjung' },
    sub: { id: 'Atap Tajug', en: 'Pyramidal Pitch', jw: 'Payon Tajug' },
    aksara: 'ꦧꦿꦸꦚ꧀ꦗꦸꦁ',
    kodeArsip: 'KLR-09 · S6',
    spesifikasi: { id: 'Puncak Trapesium Pendopo', en: 'Convective Steep Roof Crown', jw: 'Pucuk Trapesium Pendhapa' },
    bendaId: 'joglo',
    titikId: 'joglo-brunjung',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#516778',
    pola: 'gunungan',
  },
  {
    id: 'm10',
    label: { id: 'Blencong', en: 'Blencong Lamp', jw: 'Pelita Blencong' },
    sub: { id: 'Pelita Kelir', en: 'Shadow Light', jw: 'Pelita Kelir' },
    aksara: 'ꦧ꧀ꦭꦺꦚ꧀ꦕꦺꦴꦁ',
    kodeArsip: 'KLR-10 · S3',
    spesifikasi: { id: 'Sorot Sumbu Minyak Kelapa', en: 'Warm Coconut-Oil Flame', jw: 'Sorot Lenga Klentik Alami' },
    bendaId: 'wayang',
    titikId: 'wayang-blencong',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#b33025',
    pola: 'cakra',
  },
  {
    id: 'm11',
    label: { id: 'Ganja', en: 'Ganja Guard', jw: 'Ganja Dhuwung' },
    sub: { id: 'Pangkal Bilah', en: 'Blade Collar', jw: 'Pangkal Wilah' },
    aksara: 'ꦒꦚ꧀ꦗ',
    kodeArsip: 'KLR-11 · S1',
    spesifikasi: { id: 'Penyatuan Lingga & Yoni', en: 'Lingga-Yoni Sacred Interlock', jw: 'Nyawijining Lingga & Yoni' },
    bendaId: 'keris',
    titikId: 'keris-ganja',
    ctaLabel: { id: 'Bedah 3D →', en: 'Dissect 3D →', jw: 'Bedhah 3D →' },
    warna: '#d1491b',
    pola: 'bilah',
  },
  {
    id: 'm12',
    label: { id: 'Hanacaraka', en: 'Hanacaraka', jw: 'Hanacaraka' },
    sub: { id: 'Aksara Jawa', en: 'Javanese Script', jw: 'Aksara Jawi' },
    aksara: 'ꦲꦤꦕꦫꦏ',
    kodeArsip: 'KLR-12 · S7',
    spesifikasi: { id: 'Blok Unicode U+A980', en: 'Unicode Block U+A980 Standard', jw: 'Standar Unicode U+A980' },
    halamanTarget: 'kawruh',
    anchorTarget: 'aksara',
    ctaLabel: { id: 'Lab Aksara →', en: 'Script Lab →', jw: 'Lab Aksara →' },
    warna: '#9a6c1d',
    pola: 'grid',
  },
];

const METADATA_TAMBAHAN_COVERFLOW: Record<
  BendaPusaka['id'],
  {
    aksara: string;
    metrikKeempat: { label: TeksLokal; nilai: TeksLokal };
    ctaLabel: MultiTeks;
    jenisSuluk: MultiTeks;
    larasPathet: string;
    instrumenPengiring: MultiTeks;
    tempoKeterangan: MultiTeks;
    catatanDalang: MultiTeks;
  }
> = {
  keris: {
    aksara: 'ꦏꦼꦫꦶꦱ꧀',
    metrikKeempat: {
      label: { id: 'Teknik Tempa', en: 'Forge Folding', jw: 'Teknik Tempa' },
      nilai: { id: '128–512 Lipat', en: '128–512 Layers', jw: '128–512 Lipetan' },
    },
    ctaLabel: { id: 'Bedah 3D Keris Luk 5', en: 'Dissect Keris Luk 5 in 3D', jw: 'Bedhah 3D Dhuwung Luk 5' },
    jenisSuluk: {
      id: 'Pathetan Nem Wantah · Suluk Besalen',
      en: 'Pathetan Nem Wantah · Forge Chant',
      jw: 'Pathetan Nem Wantah · Suluk Besalen',
    },
    larasPathet: 'Slendro Pathet Nem',
    instrumenPengiring: {
      id: 'Rebab, Gender Barung, Gambang & Gong',
      en: 'Rebab Spike Fiddle, Gender, Gambang & Gong',
      jw: 'Rebab, Gender Barung, Gambang saha Gong',
    },
    tempoKeterangan: { id: 'Khidmat · 62 BPM', en: 'Solemn · 62 BPM', jw: 'Khidmat · 62 BPM' },
    catatanDalang: {
      id: 'Dilantunkan pada pembuka jejer dengan nada tenang berat guna menggambarkan keheningan perapian besalen serta keteguhan laku tempa sang empu.',
      en: 'Chanted in the opening court scene (jejer) in calm grave timbre to evoke glowing smithy embers and the bladesmith’s focused discipline.',
      jw: 'Kasekar ing pambuka jejer kanthi swara anteng wibawa nggambarake sepihening besalen lan keteguhaning empu.',
    },
  },
  saron: {
    aksara: 'ꦱꦫꦺꦴꦤ꧀',
    metrikKeempat: {
      label: { id: 'Akustik Nada', en: 'Pitch System', jw: 'Akustik Nada' },
      nilai: { id: 'Laras Slendro', en: 'Slendro Scale', jw: 'Laras Slendro' },
    },
    ctaLabel: { id: 'Bedah 3D Saron Slendro', en: 'Dissect Saron Slendro in 3D', jw: 'Bedhah 3D Saron Slendro' },
    jenisSuluk: {
      id: 'Pathetan Sanga Wantah · Laras Karawitan',
      en: 'Pathetan Sanga Wantah · Bronze Resonance',
      jw: 'Pathetan Sanga Wantah · Laras Karawitan',
    },
    larasPathet: 'Slendro Pathet Sanga',
    instrumenPengiring: {
      id: '6 Bilah Saron Barung, Kenong & Kempul',
      en: '6-Key Saron Barung, Kenong & Kempul',
      jw: '6 Wilah Saron Barung, Kenong saha Kempul',
    },
    tempoKeterangan: { id: 'Keseimbangan · 70 BPM', en: 'Balanced · 70 BPM', jw: 'Samadya · 70 BPM' },
    catatanDalang: {
      id: 'Mengiringi peralihan suasana menuju keseimbangan gending pendopo; tekanan aksen mengikuti ketukan balungan 1–2–3–5–6–i yang saling diredam.',
      en: 'Guides modal transition toward balanced pendopo gending cadence where mallet strokes interweave with dampened 1–2–3–5–6–i pitches.',
      jw: 'Ngiringi owah-owahan swasana tumuju larasing gendhing pendhapa manut irama balungan 1–2–3–5–6–i.',
    },
  },
  batik: {
    aksara: 'ꦏꦮꦸꦁ',
    metrikKeempat: {
      label: { id: 'Pewarnaan', en: 'Natural Dye', jw: 'Pewarnaan' },
      nilai: { id: 'Soga & Tarum', en: 'Soga & Indigo', jw: 'Soga & Tarum' },
    },
    ctaLabel: { id: 'Bedah 3D Batik Kawung', en: 'Dissect Batik Kawung in 3D', jw: 'Bedhah 3D Batik Kawung' },
    jenisSuluk: {
      id: 'Sendhon Kloloran · Kontemplasi Wastra',
      en: 'Sendhon Kloloran · Textile Contemplation',
      jw: 'Sendhon Kloloran · Kontemplasi Wastra',
    },
    larasPathet: 'Slendro Pathet Sanga',
    instrumenPengiring: {
      id: 'Gender Penerus, Siter, Suling & Cempala',
      en: 'Gender Penerus, Siter Zither, Bamboo Flute',
      jw: 'Gender Penerus, Siter, Suling saha Cempala',
    },
    tempoKeterangan: { id: 'Lirih · 58 BPM', en: 'Gentle · 58 BPM', jw: 'Lirih · 58 BPM' },
    catatanDalang: {
      id: 'Sendhon bernuansa meditatif tanpa hentakan cempala keras, merefleksikan ketelitian berbulan-bulan di hadapan anglo dan kain mori primissima.',
      en: 'Meditative unpercussed sendhon sung softly without harsh wooden knocks, mirroring months of steady brushwork beside warm beeswax.',
      jw: 'Sendhon kanthi wirama lirih alus nggambarake kasabaran lan katelitian nyanting ing sangareping anglo.',
    },
  },
  joglo: {
    aksara: 'ꦗꦺꦴꦒ꧀ꦭꦺꦴ',
    metrikKeempat: {
      label: { id: 'Konstruksi', en: 'Roof Tiers', jw: 'Konstruksi' },
      nilai: { id: '12 Undak Brunjung', en: '12 Brunjung Tiers', jw: '12 Undhak Brunjung' },
    },
    ctaLabel: { id: 'Bedah 3D Pendopo Joglo', en: 'Dissect Pendopo Joglo in 3D', jw: 'Bedhah 3D Pendhapa Joglo' },
    jenisSuluk: {
      id: 'Suluk Pathet Nem Ageng · Pasewakan',
      en: 'Suluk Pathet Nem Ageng · Royal Assembly',
      jw: 'Suluk Pathet Nem Ageng · Pasewakan',
    },
    larasPathet: 'Slendro Pathet Nem',
    instrumenPengiring: {
      id: 'Gender Barung, Gambang Kayu & Gong Ageng',
      en: 'Gender Barung, Wooden Gambang & Gong Ageng',
      jw: 'Gender Barung, Gambang Kayu saha Gong Ageng',
    },
    tempoKeterangan: { id: 'Agung · 64 BPM', en: 'Majestic · 64 BPM', jw: 'Agung · 64 BPM' },
    catatanDalang: {
      id: 'Menandai pembukaan pasewakan agung di pendopo; dentang gong ageng berpadu gema balok jati Tumpang Sari meneguhkan suasana aman dan teduh.',
      en: 'Heralds formal court audience inside the open pavilion as deep gong vibrations echo warmly across tiered teak vaults.',
      jw: 'Nandhani pambukaning pasewakan agung ing pendhapa kanthi gema gong ageng saha keteguhan saka guru.',
    },
  },
  wayang: {
    aksara: 'ꦮꦪꦁ',
    metrikKeempat: {
      label: { id: 'Tata Cahaya', en: 'Lighting', jw: 'Tata Cahya' },
      nilai: { id: 'Pelita Blencong', en: 'Blencong Flame', jw: 'Pelita Blencong' },
    },
    ctaLabel: { id: 'Bedah 3D Wayang Purwa', en: 'Dissect Wayang Purwa in 3D', jw: 'Bedhah 3D Ringgit Purwa' },
    jenisSuluk: {
      id: 'Ada-Ada Girisa · Gara-Gara Pakeliran',
      en: 'Ada-Ada Girisa · Dramatic Turbulence',
      jw: 'Ada-Ada Girisa · Gara-Gara Pakeliran',
    },
    larasPathet: 'Slendro Pathet Manyura',
    instrumenPengiring: {
      id: 'Keprak Dhalang, Cempala & Gender',
      en: 'Metal Keprak Plates, Wooden Knock & Gender',
      jw: 'Keprak Dhalang, Cempala saha Gender',
    },
    tempoKeterangan: { id: 'Dinamis · 78 BPM', en: 'Dynamic · 78 BPM', jw: 'Dinamis · 78 BPM' },
    catatanDalang: {
      id: 'Ada-ada bertenaga yang dipicu ketukan keprak kayu untuk membangun ketegangan sebelum kemunculan tokoh atau adegan perang kembang.',
      en: 'Vigorous rhythmic ada-ada spurred by crisp bronze keprak strikes to heighten tension ahead of heroic duels and shadow combat.',
      jw: 'Ada-ada gumregah dipun-teteg thuthukan keprak dhalang kangge miwiti sabetan saha adegan perang kembang.',
    },
  },
};

export const KOLEKSI_COVERFLOW: ItemCoverflow[] = [
  ...DAFTAR_BENDA.map((benda, idx): ItemCoverflow => {
    const ekstra = METADATA_TAMBAHAN_COVERFLOW[benda.id];
    return {
      id: `cf-${benda.id}`,
      artefakId: benda.id,
      bendaId: benda.id,
      titikId: benda.titikInfo[0]?.id,
      halamanTarget: 'twin',
      ctaLabel: ekstra.ctaLabel,
      nomorUrut: benda.nomorUrut,
      kodeArsip: ambilTeks(benda.spesifikasiKurasi[0]?.nilai ?? `KLR-0${idx + 1}`, 'id'),
      badgeStatus: benda.badgeStatus ?? 'KURASI',
      aksara: ekstra.aksara,
      kategori: benda.kategori,
      nama: benda.nama,
      subjudul: benda.subjudul,
      asal: benda.asal,
      penjelasanLengkap: benda.sejarahSingkat,
      filosofi: benda.filosofi,
      metrikKurasi: [...benda.spesifikasiKurasi, ekstra.metrikKeempat],
      anatomiKritis: benda.titikInfo.map((t) => ({
        titikId: t.id,
        judul: t.judul,
        ringkas: t.ringkasan,
        material: t.material,
        fungsiTeknis: t.fungsiTeknis,
        sumber: t.sumber,
      })),
      sulukLarik: benda.sulukLarik,
      jenisSuluk: ekstra.jenisSuluk,
      larasPathet: ekstra.larasPathet,
      instrumenPengiring: ekstra.instrumenPengiring,
      tempoKeterangan: ekstra.tempoKeterangan,
      catatanDalang: ekstra.catatanDalang,
      sumber: benda.sumber,
      kuratorPilihan: idx === 0 || idx === 4,
    };
  }),
  {
    id: 'cf-kidang',
    artefakId: 'kidang',
    bendaId: 'wayang',
    titikId: 'wayang-blencong',
    halamanTarget: 'pakeliran',
    ctaLabel: {
      id: 'Mainkan di Panggung Kelir',
      en: 'Stage in Shadow Theatre',
      jw: 'Mainake ing Panggung Kelir',
    },
    nomorUrut: '06',
    kodeArsip: 'KLR-06 · S3, S5',
    badgeStatus: {
      id: 'PAKELIRAN & BLENCONG',
      en: 'SHADOW STAGE & OIL LAMP',
      jw: 'PAKELIRAN & BLENCONG',
    },
    aksara: 'ꦏꦶꦢꦁꦧ꧀ꦭꦺꦚ꧀ꦕꦺꦴꦁ',
    kategori: { id: 'Seni Pertunjukan', en: 'Performing Arts', jw: 'Pakeliran Jawi' },
    nama: { id: 'Kidang Kencana & Blencong', en: 'Golden Deer & Blencong Oil Lamp', jw: 'Kidang Kencana & Blencong' },
    subjudul: {
      id: 'Lakon Aranya Kanda & Lampu Minyak Sayap Garuda',
      en: 'Aranya Kanda Epic & Garuda-Winged Coconut Oil Lamp',
      jw: 'Lakon Aranya Kanda saha Pelita Blencong',
    },
    asal: {
      id: 'Museum Sonobudoyo & ISI Surakarta',
      en: 'Sonobudoyo Museum & ISI Surakarta',
      jw: 'Museum Sonobudoyo & Surakarta',
    },
    penjelasanLengkap: {
      id: 'Dalam epos Ramayana babak Aranya Kanda, Kidang Kencana adalah perwujudan sihir Marica dengan sunggingan emas berkilau yang menguji keteguhan batin Sri Rama dan Dewi Shinta. Di atas kelir blacu, lampu minyak kelapa Blencong bersayap Garuda memancarkan bayangan bergradasi lewat tatahan krawangan kulit kerbau dan tangkai cempurit tanduk.',
      en: 'Within the Ramayana Aranya Kanda episode, Kidang Kencana represents Marica’s gilded golden illusion testing the serene vigilance of Sri Rama and Dewi Shinta. Overhead, the winged brass Blencong lamp animates perforated buffalo-hide lattice across the cotton kelir.',
      jw: 'Ing epos Ramayana Aranya Kanda, Kidang Kencana mujudake wewujudan prada emas kang nguji ati. Lampu kuningan Blencong nyumunarake cahya anget ing layar kelir.',
    },
    filosofi: {
      id: 'Kilau emas Kidang Kencana mengingatkan kewaspadaan terhadap godaan lahiriah yang memalingkan kesadaran, sementara nyala Blencong melambangkan pelita kehidupan jagad pakeliran.',
      en: 'The glittering Golden Deer warns humanity against external allure that clouds clear discernment, while the flickering Blencong flame symbolizes luminous conscience sustaining life’s theatre.',
      jw: 'Kumelap emas Kidang Kencana paring pepeling supaya waspada marang godha semu, dene uriping Blencong pralambang pepadhanging jagad.',
    },
    metrikKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-06 · S3, S5' },
      { label: { id: 'Epos Lakon', en: 'Epic Chapter', jw: 'Epos Lakon' }, nilai: 'Aranya Kanda' },
      { label: { id: 'Pencahayaan', en: 'Illumination', jw: 'Cahya Kelir' }, nilai: { id: 'Minyak Kelapa Alami', en: 'Coconut Oil Wick', jw: 'Lenga Klentik Alami' } },
      { label: { id: 'Artikulasi', en: 'Articulation', jw: 'Sendi Gerak' }, nilai: { id: 'Sendi Leher & Kaki', en: 'Neck & Quadruped Joints', jw: 'Sendi Gulu & Sekawan Suku' } },
    ],
    anatomiKritis: [
      {
        titikId: 'kidang-blencong',
        judul: {
          id: 'Cawan Minyak & Sayap Garuda Blencong',
          en: 'Garuda-Winged Brass Oil Lamp & Reservoir',
          jw: 'Cawan Lenga & Swiwi Garuda Blencong',
        },
        ringkas: {
          id: 'Lampu cor kuningan berbentuk burung Garuda menggantung tepat di depan dalang untuk menciptakan bayangan lembut.',
          en: 'Cast brass Garuda oil lamp suspended directly before the dalang to cast living warm shadows across the screen.',
          jw: 'Lampu cor kuningan wujud manuk Garuda gumantung ing ngarep dhalang kanggo nyiptakake wewayangan anget.',
        },
        material: { id: 'Cor Kuningan Emas · Sumbu Katun Minyak Klentik', en: 'Cast Golden Brass · Cotton Coconut-Oil Wick', jw: 'Kuningan Emas · Sumbu Katun Lenga Klentik' },
        fungsiTeknis: {
          id: 'Proyektor cahaya hangat tunggal berkedip lembut penghidup bayangan kelir',
          en: 'Single warm organic point flame creating luminous shadow depth across perforated hide',
          jw: 'Proyektor cahya anget tunggal pangurip wewayangan ing kelir mori',
        },
        sumber: ['S3'],
      },
      {
        titikId: 'kidang-tanduk',
        judul: {
          id: 'Tanduk Bercabang & Sunggingan Prada Emas',
          en: 'Branched Gold-Leaf Antlers & Hinged Neck',
          jw: 'Sungon Emas saha Sendi Gulu Kidang',
        },
        ringkas: {
          id: 'Tanduk kidang berlekuk ganda dilapisi lembaran prada emas agar berkilau saat terkena sorot Blencong.',
          en: 'Forked antlers coated in authentic prada gold leaf angled cleanly to reflect warm lamp shimmer.',
          jw: 'Sungon bercabang prada emas mawa sendi gulu kang bisa noleh lincah nalika disorot Blencong.',
        },
        material: { id: 'Wacucal Kerbau Pahatan Tatah + Lapis Prada Emas', en: 'Carved Buffalo Hide + Prada Gold Foil', jw: 'Wacucal Kebo Pahatan Tatah + Lapis Prada' },
        fungsiTeknis: {
          id: 'Sendi leher berengsel agar dalang dapat menolehkan kepala kijang dengan lincah',
          en: 'Hinged neck linkage lets the puppeteer twist the startled deer’s head dynamically mid-flight',
          jw: 'Sendi gulu berengsel supaya dhalang bisa nolehake sirah kidang kanthi lincah',
        },
        sumber: ['S5'],
      },
      {
        titikId: 'kidang-badan',
        judul: {
          id: 'Badan Prada Emas, Pelana & Pola Tutul Rusa',
          en: 'Gilded Torso, Crimson Jewels & Dappled Coat',
          jw: 'Awak Prada Emas, Pelana saha Corak Kidang',
        },
        ringkas: {
          id: 'Punggung dan dada berpulas kalung permata merah-emas lengkap ukiran ekor melengkung simbol kelincahan hutan Dandaka.',
          en: 'Gilded torso adorned with painted crimson collar motifs and arched tail symbolizing supernatural speed.',
          jw: 'Awak prada emas pinulas kalung abang-emas lan buntut melengkung pralambang kelincahan Wana Dandaka.',
        },
        material: { id: 'Perkamen Kulit Kerbau · Sungging Merah Permata', en: 'Buffalo Parchment · Crimson-Gold Pigment', jw: 'Perkamen Wacucal Kebo · Sungging Abang Mas' },
        fungsiTeknis: {
          id: 'Pemantul kilau cahaya minyak kelapa yang membedakan tokoh ilusi di kelir',
          en: 'High-sheen surface glinting vibrantly against dark shadow backdrop to signify enchanted illusion',
          jw: 'Pamantul kilau cahya lenga klentik kang mbedakake paraga ilusi ing kelir',
        },
        sumber: ['S3', 'S5'],
      },
      {
        titikId: 'kidang-kaki',
        judul: {
          id: 'Sendi Ganda Empat Kaki & Cempurit Gedebog',
          en: 'Articulated Four Legs & Horn Cempurit Spine',
          jw: 'Sendi Sekawan Suku saha Cempurit Gedebog',
        },
        ringkas: {
          id: 'Engsel benang kulit menggerakkan lompatan lincah Kijang Kencana melintasi kelir hutan Dandaka.',
          en: 'Twin chord-bound fore and hind joints animate bounding leaps across banana-trunk stage logs.',
          jw: 'Engsel benang wacucal nggerakake lompating Kidang Kencana ngliwati kelir Wana Dandaka.',
        },
        material: { id: 'Tangkai Tanduk Kerbau & Benang Pengikat Sendi', en: 'Water-Buffalo Horn Spine & Rawhide Joint Cords', jw: 'Gagang Sungu Kebo & Benang Pengikat Sendi' },
        fungsiTeknis: {
          id: 'Kinematika empat tungkai melompat serta pasak penancap batang gedebog pisang',
          en: 'Quadruped bounding kinematics paired with a split horn peg planted into plantain-stem logs',
          jw: 'Kinematika sekawan suku melompat saha pasak tancap ing gedebog gedhang',
        },
        sumber: ['S3', 'S5'],
      },
    ],
    sulukLarik: [
      {
        id: 'Pelita blencong menyala hangat di atas kelir blacu putih,',
        en: 'The Blencong oil lamp glows warmly above stretched white cotton cloth,',
        jw: 'Pelita blencong murub anget ing ndhuwur kelir blacu,',
      },
      {
        id: 'Kilau Kidang Kencana menari di rimba Dandaka yang sunyi,',
        en: 'Golden shimmer of Kidang Kencana dances across quiet Dandaka thickets,',
        jw: 'Kumelap Kidang Kencana njoged ing tengah wana Dandaka,',
      },
      {
        id: 'Tatahan kulit kerbau menembus sorot api menjadi bayangan hidup,',
        en: 'Perforated buffalo leather filters flame into living breathing shadow,',
        jw: 'Tatahan wacucal kebo nembus cahya dadi wewayangan urip,',
      },
      {
        id: 'Sri Rama melepas panah Guwawijaya menyingkap tabir muslihat,',
        en: 'Sri Rama releases the Guwawijaya arrow, tearing apart enchanting deceit,',
        jw: 'Sri Rama nglepas jemparing Guwawijaya mbukak tipu daya,',
      },
      {
        id: 'Pelita kelir mengajarkan eling dan waspada sepanjang laku.',
        en: 'And the Kelir flame teaches stillness, mindfulness, and clear discernment.',
        jw: 'Padhanging kelir mulang eling lan waspada ing urip.',
      },
    ],
    jenisSuluk: {
      id: 'Ada-Ada Budhalan · Wana Dandaka',
      en: 'Ada-Ada Budhalan · Forest Pursuit',
      jw: 'Ada-Ada Budhalan · Wana Dandaka',
    },
    larasPathet: 'Slendro Pathet Sanga',
    instrumenPengiring: {
      id: 'Cempala, Keprak Besi, Gender & Suling',
      en: 'Cempala Knock, Iron Keprak, Gender & Suling',
      jw: 'Cempala, Keprak Wesi, Gender saha Suling',
    },
    tempoKeterangan: { id: 'Srepegan Tegang · 82 BPM', en: 'Urgent Srepegan · 82 BPM', jw: 'Srepegan Seru · 82 BPM' },
    catatanDalang: {
      id: 'Mengiringi perburuan Sri Rama mengejar Kijang Kencana di hutan Dandaka sebelum sabetan panah pusaka Guwawijaya menyingkap tipu daya Marica.',
      en: 'Drives the urgent forest pursuit across Dandaka before the release of Sri Rama’s consecrated arrow breaks Marica’s golden disguise.',
      jw: 'Ngiringi laku Sri Rama mburu Kidang Kencana ing wana Dandaka sadurunge jemparing Guwawijaya dipun-lepas.',
    },
    sumber: ['S3', 'S5'],
    kuratorPilihan: true,
  },
  {
    id: 'cf-hanacaraka',
    artefakId: 'hanacaraka',
    bendaId: 'keris',
    halamanTarget: 'kawruh',
    anchorTarget: 'aksara',
    ctaLabel: {
      id: 'Buka Lab Aksara U+A980',
      en: 'Open Script Lab U+A980',
      jw: 'Bukak Lab Aksara U+A980',
    },
    nomorUrut: '07',
    kodeArsip: 'KLR-12 · S7',
    badgeStatus: { id: 'UNICODE U+A980', en: 'UNICODE U+A980', jw: 'UNICODE U+A980' },
    aksara: 'ꦲꦤꦕꦫꦏ',
    kategori: { id: 'Filologi & Aksara', en: 'Philology & Script', jw: 'Filologi & Aksara Jawi' },
    nama: { id: 'Prasasti Hanacaraka U+A980', en: 'Hanacaraka Inscription Stele U+A980', jw: 'Prasasti Carakan U+A980' },
    subjudul: {
      id: '20 Aksara Nglegena, Pasangan & Sandhangan Swara Standar S7',
      en: '20 Carakan Nglegena Consonants, Conjuncts & Unicode U+A980–U+A9DF',
      jw: '20 Aksara Nglegena, Pasangan saha Sandhangan Swara',
    },
    asal: {
      id: 'Kongres Bahasa Jawa & Perpusnas RI',
      en: 'Javanese Language Congress & Perpusnas RI',
      jw: 'Kongres Basa Jawi & Perpusnas RI',
    },
    penjelasanLengkap: {
      id: 'Hanacaraka adalah sistem tulisan abugida Jawa berjumlah 20 aksara dasar (nglegena) yang secara resmi distandarkan ke dalam blok Unicode U+A980–U+A9DF sejak 2009. Setiap huruf dasar berbunyi vokal /a/ atau /ɔ/ dan dimodifikasi oleh sandhangan vokal (wulu, suku, taling, pepet) serta pasangan penutup suku kata (panyigeg wanda).',
      en: 'Hanacaraka is Java’s classical alphasyllabic abugida comprising 20 root consonants (nglegena) standardized into Unicode U+A980–U+A9DF since 2009. Each glyph carries inherent vowel sound modulated by crisp sandhangan vowel marks and conjunct pasangan glyphs.',
      jw: 'Hanacaraka mujudake sistem aksara abugida cacah 20 nglegena ing blok Unicode U+A980–U+A9DF kang kaubah swarane nganggo sandhangan lan pasangan.',
    },
    filosofi: {
      id: 'Rangkaian empat baris puisi Ha-Na-Ca-Ra-Ka hingga Ma-Ga-Ba-Tha-Nga merekam kisah pengabdian abadi dan kesetiaan dua utusan yang teguh memegang amanah.',
      en: 'Arranged as a four-stanza pangram poem (Ha-Na-Ca-Ra-Ka through Ma-Ga-Ba-Tha-Nga), the alphabet chronicles unwavering loyalty between two faithful messengers who perished honoring their oaths.',
      jw: 'Urutan Ha-Na-Ca-Ra-Ka nganti Ma-Ga-Ba-Tha-Nga nyaritakake kasetyan lan tanggung jawab marang amanah.',
    },
    metrikKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-12 · S7' },
      { label: { id: 'Blok Unicode', en: 'Unicode Block', jw: 'Blok Unicode' }, nilai: 'U+A980–U+A9DF' },
      { label: { id: 'Aksara Dasar', en: 'Root Consonants', jw: 'Aksara Nglegena' }, nilai: { id: '20 Carakan Nglegena', en: '20 Nglegena Glyphs', jw: '20 Carakan Nglegena' } },
      { label: { id: 'Klasifikasi', en: 'System Type', jw: 'Klasifikasi' }, nilai: { id: 'Abugida Jawa Kuna', en: 'Javanese Abugida', jw: 'Abugida Jawi Kuna' } },
    ],
    anatomiKritis: [
      {
        titikId: 'hanacaraka-lempeng',
        judul: {
          id: 'Lempeng Perunggu 20 Aksara Nglegena (Ha–Nga)',
          en: 'Bronze Tablet of 20 Nglegena Consonants (Ha–Nga)',
          jw: 'Lempeng Perunggu 20 Nglegena (Ha–Nga)',
        },
        ringkas: {
          id: 'Pelat perunggu gelap bertatah relief emas dua puluh huruf dasar carakan beserta tajuk Unicode U+A980–U+A9DF.',
          en: 'Patina bronze face embossed with all twenty root carakan glyphs and block header U+A980–U+A9DF.',
          jw: 'Lempeng perunggu patra emas isi rong puluh aksara dasar carakan Unicode U+A980.',
        },
        material: { id: 'Pelat Perunggu Patina Relief Timbul (Bump Engraved)', en: 'Patina Bronze Tablet · Raised Gold Engraving', jw: 'Pelat Perunggu Patina Relief Timbul' },
        fungsiTeknis: {
          id: 'Media prasasti empat bait aksara Ha–Na–Ca–Ra–Ka hingga Ma–Ga–Ba–Tha–Nga',
          en: 'Preserves the complete four-verse pangram matrix from Ha–Na–Ca–Ra–Ka to Ma–Ga–Ba–Tha–Nga',
          jw: 'Media prasasti sekawan larik Ha–Na–Ca–Ra–Ka nganti Ma–Ga–Ba–Tha–Nga',
        },
        sumber: ['S7'],
      },
      {
        titikId: 'hanacaraka-bingkai',
        judul: {
          id: 'Bingkai Ukir Jati & 4 Paku Sudut Kuningan',
          en: 'Carved Teak Frame & Four Brass Corner Bosses',
          jw: 'Pigura Jati saha 4 Paku Kuningan',
        },
        ringkas: {
          id: 'Pigura kayu jati solid berornamen empat kancing logam di sudut yang membungkus inti lempeng tembaga.',
          en: 'Solid court teak perimeter frame pinned with four faceted brass octahedra locking the core bronze plate.',
          jw: 'Pigura kayu jati mawa sekawan paku sudut kuningan penguat intining prasasti.',
        },
        material: { id: 'Kayu Jati Keraton · Empat Pin Oktahedron Kuningan', en: 'Court Teak Surround · Four Faceted Brass Rivets', jw: 'Kayu Jati Kraton · Sekawan Pin Oktahedron' },
        fungsiTeknis: {
          id: 'Penopang struktural sekaligus bingkai pengunci kelembaban pelat prasasti',
          en: 'Structural perimeter housing safeguarding bronze warping across humid tropical seasons',
          jw: 'Panyangga struktur lan bingkai pangunci kelembaban lempeng perunggu',
        },
        sumber: ['S7'],
      },
      {
        titikId: 'hanacaraka-mahkota',
        judul: {
          id: 'Mahkota Astrolabe Dua Cincin & Permata',
          en: 'Twin-Gimbal Brass Astrolabe Crest & Jewel',
          jw: 'Makutha Astrolabe Kalih Cincin & Sesotya',
        },
        ringkas: {
          id: 'Sepasang cincin horologis berputar di puncak bingkai melambangkan jembatan kesinambungan naskah kuno ke teknologi komputasi.',
          en: 'Revolving twin brass horological rings uniting ancient epigraphy directly with modern Unicode computing.',
          jw: 'Kalih cincin kuningan mubeng ing pucuk pigura pralambang kalestaren aksara ing jaman digital.',
        },
        material: { id: 'Cincin Kuningan Dual-Gimbal + Permata Oktahedron', en: 'Dual-Gimbal Spun Brass + Octahedral Gem', jw: 'Cincin Kuningan Dual-Gimbal + Sesotya' },
        fungsiTeknis: {
          id: 'Penanda keterhubungan literasi epigrafi klasik dengan pengkodean presisi',
          en: 'Astronomical crest signifying uninterrupted transition from stone inscription to precise digital code',
          jw: 'Tandha gandhenganipun epigrafi klasik kalihan kode digital presisi',
        },
        sumber: ['S7'],
      },
      {
        titikId: 'hanacaraka-alas',
        judul: {
          id: 'Pondasi Andesit Berundak Dua Penopang',
          en: 'Two-Step Andesite Foundation Plinth',
          jw: 'Dhasar Watu Andesit Undhak Kalih',
        },
        ringkas: {
          id: 'Dasar tumpuan batu andesit dua tingkat bertakik khusus agar seluruh bingkai prasasti berdiri tegak seimbang.',
          en: 'Precision-cut two-tier volcanic andesite base balancing the heavy tablet cleanly upright on curatorial stages.',
          jw: 'Tumpuan watu andesit kalih undhakan panyangga prasasti supaya ngadeg jejeg timbang.',
        },
        material: { id: 'Batu Andesit Candi Pahat Presisi', en: 'Precision-Dressed Candi Andesite Stone', jw: 'Watu Andesit Candhi Pahat Presisi' },
        fungsiTeknis: {
          id: 'Penstabil pusat massa vertikal agar lempeng berat berdiri mantap di panggung kurasi',
          en: 'Low-center-of-gravity stone footing anchoring heavy vertical epigraphic frames reliably',
          jw: 'Panegak pusat massa vertikal supaya lempeng anteb ngadeg mantep ing panggung kurasi',
        },
        sumber: ['S7'],
      },
    ],
    sulukLarik: [
      {
        id: 'Hana caraka mengisahkan utusan setia pembawa amanah,',
        en: 'Hana caraka speaks of two devoted envoys entrusted with a sacred pledge,',
        jw: 'Hana caraka nyritakake utusan kang setya ngemban dhawuh,',
      },
      {
        id: 'Data sawala memelihara teguhnya janji hingga batas akhir,',
        en: 'Data sawala neither faltered nor wavered, holding faith until the end,',
        jw: 'Data sawala ngugemi janji nganti pungkasan,',
      },
      {
        id: 'Padha jayanya menguji keluhuran dua kesatria kembar,',
        en: 'Padha jayanya matched their equal resolve, courage, and mastery as peers,',
        jw: 'Padha jayanya nandhingake kapinteran lan kasetyan,',
      },
      {
        id: 'Maga bathanga mewariskan pelajaran pengabdian sejati,',
        en: 'Maga bathanga left to posterity an immortal witness of true devotion,',
        jw: 'Maga bathanga ninggalake piwulang luhur abadi,',
      },
      {
        id: 'Kini aksara Jawa terbit utuh di ruang digital Unicode U+A980.',
        en: 'Today the Javanese script shines anew across Unicode block U+A980.',
        jw: 'Saiki aksara Jawi urip lestari ing jagad Unicode U+A980.',
      },
    ],
    jenisSuluk: {
      id: 'Sendhon Tlutur · Pangkur Carakan',
      en: 'Sendhon Tlutur · Carakan Elegy',
      jw: 'Sendhon Tlutur · Pangkur Carakan',
    },
    larasPathet: 'Slendro Pathet Manyura',
    instrumenPengiring: {
      id: 'Rebab, Sitering & Gambang Kayu',
      en: 'Rebab Fiddle, Siter & Wooden Gambang',
      jw: 'Rebab, Siteran saha Gambang Kayu',
    },
    tempoKeterangan: { id: 'Lugu Reflektif · 60 BPM', en: 'Reflective · 60 BPM', jw: 'Lugu Wening · 60 BPM' },
    catatanDalang: {
      id: 'Dibacakan layaknya tembang macapat Pangkur-carakan sebagai pangeling sejarah dua puluh aksara abugida dari prasasti batu menuju standar Unicode modern.',
      en: 'Recited gently in macapat Pangkur meter to honor twenty consonants bridging carved stone inscriptions and modern Unicode engineering.',
      jw: 'Dipun-waos kanthi wirama lugu ngelingake riwayat aksara carakan dumugi pangriptan Unicode modern.',
    },
    sumber: ['S7'],
    kuratorPilihan: false,
  },
];

/**
 * Daftar lengkap 7 spesimen untuk Studio Digital Twin / Bedah 3D (Halaman 02),
 * menggabungkan 5 pusaka utama dengan Kidang Kencana & Blencong serta Prasasti Hanacaraka U+A980.
 */
export const DAFTAR_BEDAH_TWIN: SpesimenBedahTwin[] = [
  ...DAFTAR_BENDA.map((b): SpesimenBedahTwin => ({
    ...b,
    halamanKelanjutan:
      b.id === 'wayang'
        ? {
            id: 'pakeliran',
            label: {
              id: 'Mainkan di Panggung Kelir',
              en: 'Stage in Shadow Theatre',
              jw: 'Mainake ing Panggung Kelir',
            },
          }
        : undefined,
  })),
  {
    id: 'kidang',
    nomorUrut: '06',
    dioramaLabel: { id: 'PAKELIRAN DANDAKA', en: 'DANDAKA STAGE', jw: 'PAKELIRAN DANDAKA' },
    zonaKode: 'ZON-06 · LAKON ARANYA KANDA',
    badgeStatus: {
      id: 'PAKELIRAN & BLENCONG',
      en: 'SHADOW STAGE & OIL LAMP',
      jw: 'PAKELIRAN & BLENCONG',
    },
    aksara: 'ꦏꦶꦢꦁꦧ꧀ꦭꦺꦚ꧀ꦕꦺꦴꦁ',
    warnaAksen: '#a32b20',
    nama: { id: 'Kidang Kencana & Blencong', en: 'Golden Deer & Blencong Oil Lamp', jw: 'Kidang Kencana & Blencong' },
    subjudul: {
      id: 'Lakon Aranya Kanda & Lampu Minyak Sayap Garuda',
      en: 'Aranya Kanda Epic & Garuda-Winged Coconut Oil Lamp',
      jw: 'Lakon Aranya Kanda saha Pelita Blencong',
    },
    kategori: { id: 'Seni Pertunjukan', en: 'Performing Arts', jw: 'Pakeliran Jawi' },
    asal: {
      id: 'Museum Sonobudoyo & ISI Surakarta',
      en: 'Sonobudoyo Museum & ISI Surakarta',
      jw: 'Museum Sonobudoyo & Surakarta',
    },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-06 · S3, S5' },
      { label: { id: 'Epos Lakon', en: 'Epic Chapter', jw: 'Epos Lakon' }, nilai: 'Aranya Kanda' },
      { label: { id: 'Artikulasi', en: 'Jointing', jw: 'Sendi' }, nilai: { id: 'Leher & 4 Kaki', en: 'Neck & 4 Legs', jw: 'Gulu & 4 Suku' } },
    ],
    parameterCad: [
      { label: { id: 'Tata Cahaya', en: 'Illumination', jw: 'Tata Cahya' }, nilai: { id: 'Minyak Kelapa Alami', en: 'Natural Coconut Oil', jw: 'Lenga Klentik Alami' } },
      { label: { id: 'Lapisan Permukaan', en: 'Surface Finish', jw: 'Lapisan Prada' }, nilai: { id: 'Prada Emas Perkamen', en: 'Gilded Gold Parchment', jw: 'Prada Emas Perkamen' } },
      { label: { id: 'Poros Penegak', en: 'Stage Mount', jw: 'Gagang Tancap' }, nilai: { id: 'Cempurit & Gedebog', en: 'Horn Rod & Banana Log', jw: 'Cempurit & Gedebog' } },
    ],
    ringkas: {
      id: 'Perwujudan Marica berkilau prada emas berartikulasi ganda yang disinari pelita minyak kuningan Blencong di layar blacu.',
      en: 'Double-jointed gilded Marica illusion deer sculpted for buffalo leather projection beneath the hanging brass Blencong lamp.',
      jw: 'Wewujudan prada emas kang murub dening sorot pelita Blencong ing kelir.',
    },
    sejarahSingkat: {
      id: 'Dalam epos Ramayana babak Aranya Kanda, Kidang Kencana adalah perwujudan sihir Marica dengan sunggingan emas berkilau yang menguji keteguhan batin Sri Rama dan Dewi Shinta. Di depan kelir blacu, lampu minyak kelapa Blencong bersayap Garuda menciptakan bayangan bergradasi lewat tatahan krawangan kulit kerbau.',
      en: 'In the Ramayana Aranya Kanda sequence, Kidang Kencana embodies Marica’s shimmering disguise testing Sri Rama’s insight. Overhead, the winged brass Blencong casts shifting gradients across finely chiseled buffalo-hide cutouts.',
      jw: 'Ing epos Ramayana Aranya Kanda, Kidang Kencana mujudake wewujudan prada emas kang nguji ati saha disorot lampu kuningan Blencong.',
    },
    filosofi: {
      id: 'Kilau emas Kidang Kencana mengingatkan kewaspadaan terhadap godaan lahiriah, sementara nyala Blencong melambangkan pelita kesadaran yang menghidupkan seluruh jagad pakeliran.',
      en: 'The Golden Deer warns against superficial allure while the Blencong flame symbolizes inner awakening animating the microcosm of the shadow stage.',
      jw: 'Kumelap emas Kidang Kencana paring pepeling supaya eling lan waspada, dene uriping Blencong pralambang pepadhanging jagad.',
    },
    sulukLarik: KOLEKSI_COVERFLOW.find((c) => c.id === 'cf-kidang')?.sulukLarik ?? [],
    sumber: ['S3', 'S5'],
    titikInfo: [
      {
        id: 'kidang-tanduk',
        judul: { id: 'Tanduk Bercabang Emas & Profil Kepala Kijang', en: 'Gilded Branched Antlers & Articulated Head', jw: 'Sungon Emas saha Sirah Kidang' },
        posisi: [0.58, 0.56, 0.04],
        explodeVec: [0.28, 0.48, 0.22],
        material: { id: 'Wacucal Kerbau Pahatan Tatah + Lapis Prada Emas', en: 'Chiseled Buffalo Hide + Prada Gold Foil', jw: 'Wacucal Kebo Pahatan Tatah + Prada Emas' },
        fungsiTeknis: {
          id: 'Sendi leher berengsel agar dalang dapat menolehkan kepala kijang lincah ke belakang',
          en: 'Hinged cervical pivot lets the dalang glance the deer backward gracefully',
          jw: 'Sendi gulu engsel supaya dhalang bisa nolehake sirah kidang lincah',
        },
        ringkasan: {
          id: 'Mahkota tanduk bercabang berlapis lembaran prada emas berlubang mata tembus cahaya untuk memikat perhatian di panggung bayangan.',
          en: 'Branched prada gold antlers with perforated light-transmitting eye cutouts designed to gleam across dark shadow backdrops.',
          jw: 'Sungon bercabang prada mas mawa sendi gulu kang bisa noleh lincah.',
        },
        sumber: ['S5'],
      },
      {
        id: 'kidang-badan',
        judul: { id: 'Badan Prada Emas, Pelana & Pola Tutul Rusa', en: 'Golden Prada Torso, Crimson Necklace & Dapples', jw: 'Awak Prada Emas & Pelana' },
        posisi: [0.18, -0.18, 0.04],
        explodeVec: [0, 0, 0],
        material: { id: 'Perkamen Kulit Kerbau · Sungging Merah Permata', en: 'Buffalo Parchment · Polychrome Crimson Gold', jw: 'Perkamen Wacucal Kebo · Sungging Abang Mas' },
        fungsiTeknis: {
          id: 'Pemantul kilau cahaya minyak kelapa yang membedakan tokoh ilusi dengan hewan biasa',
          en: 'High-luster surface shimmering beneath coconut-oil candlelight to signify enchanted form',
          jw: 'Pamantul kilau cahya lenga klentik kang mbedakake paraga ilusi lan kewan limrah',
        },
        ringkasan: {
          id: 'Punggung dan dada berpulas kalung permata merah-emas lengkap ukiran ekor melengkung simbol kelincahan hutan Dandaka.',
          en: 'Back and breast enameled with jewel crimson collars and curling tail filigree capturing swift movement in Dandaka Forest.',
          jw: 'Awak prada emas pinulas kalung merah-emas lan buntut melengkung endah.',
        },
        sumber: ['S3', 'S5'],
      },
      {
        id: 'kidang-kaki',
        judul: { id: 'Sendi Ganda Empat Kaki & Cempurit Gedebog', en: 'Quadruped Dual-Linkage Legs & Gedebog Peg', jw: 'Sendi Sekawan Suku saha Cempurit' },
        posisi: [0.42, -0.82, 0.04],
        explodeVec: [0.26, -0.32, 0.24],
        material: { id: 'Tangkai Tanduk Kerbau & Benang Pengikat Sendi', en: 'Water-Buffalo Horn Rod & Rawhide Joint Ties', jw: 'Gagang Sungu Kebo & Benang Sendi' },
        fungsiTeknis: {
          id: 'Kinematika empat tungkai melompat serta pasak penancap batang gedebog pisang',
          en: 'Four-limb bounding linkage combined with a central horn peg anchored into banana-trunk logs',
          jw: 'Kinematika sekawan suku melompat saha pasak tancap ing gedebog',
        },
        ringkasan: {
          id: 'Paha-betis artikulasi ganda di bagian depan dan belakang ditopang gapit cempurit tanduk kerbau yang bertumpu di batang pisang.',
          en: 'Dual-jointed front and rear limbs animated synchronously around a central buffalo-horn spine planted in stage pith.',
          jw: 'Sendi sikil ngarep-mburi lan gapit cempurit tanduk kebo tumancep ing gedebog.',
        },
        sumber: ['S3', 'S5'],
      },
      {
        id: 'kidang-blencong',
        judul: { id: 'Pelita Minyak Blencong Bersayap Garuda', en: 'Garuda-Winged Brass Blencong Oil Lamp', jw: 'Pelita Blencong Swiwi Garuda' },
        posisi: [-0.92, 0.96, 0.24],
        explodeVec: [-0.56, 0.24, 0.28],
        material: { id: 'Cor Kuningan Emas · Sumbu Katun Minyak Klentik', en: 'Cast Golden Brass · Cotton Coconut-Oil Wick', jw: 'Kuningan Cor Emas · Sumbu Lenga Klentik' },
        fungsiTeknis: {
          id: 'Proyektor cahaya hangat tunggal berkedip lembut untuk menghidupkan bayangan kelir',
          en: 'Suspended warm single-flame projector lending living flicker across perforated leather shadows',
          jw: 'Proyektor cahya anget tunggal pangurip wewayangan ing layar kelir',
        },
        ringkasan: {
          id: 'Cawan minyak kuningan gantung bersayap garuda dengan corong api berkedip alami tepat di muka dalang selama pagelaran.',
          en: 'Garuda-winged brass reservoir glowing continuously overhead in front of the dalang throughout the performance.',
          jw: 'Lampu kuningan gantung swiwi garuda isi lenga klentik kang nyumunarake wewayangan.',
        },
        sumber: ['S3'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Mengapa Kidang Kencana disungging keemasan dalam lakon Aranya Kanda?',
        en: 'Why is the Golden Deer gilded in gold within the Aranya Kanda episode?',
        jw: 'Kenging menapa Kidang Kencana kasungging prada mas wonten ing lakon Aranya Kanda?',
      },
      {
        id: 'Bagaimana nyala api Blencong memengaruhi hidupnya bayangan wayang kulit?',
        en: 'How does the flickering Blencong oil flame bring shadow puppets to life?',
        jw: 'Kados pundi uriping geni Blencong murubake wewayangan ringgit wacucal?',
      },
    ],
    halamanKelanjutan: {
      id: 'pakeliran',
      label: {
        id: 'Mainkan di Panggung Kelir',
        en: 'Stage in Shadow Theatre',
        jw: 'Mainake ing Panggung Kelir',
      },
    },
  },
  {
    id: 'hanacaraka',
    nomorUrut: '07',
    dioramaLabel: { id: 'SANGGAR CARAKAN', en: 'CARAKAN SCRIPTORIUM', jw: 'SANGGAR CARAKAN' },
    zonaKode: 'ZON-07 · AKSARA JAWA U+A980',
    badgeStatus: { id: 'UNICODE U+A980', en: 'UNICODE U+A980', jw: 'UNICODE U+A980' },
    aksara: 'ꦲꦤꦕꦫꦏ',
    warnaAksen: '#8c6014',
    nama: { id: 'Prasasti Hanacaraka U+A980', en: 'Hanacaraka Inscription Stele U+A980', jw: 'Prasasti Carakan U+A980' },
    subjudul: {
      id: '20 Aksara Nglegena, Pasangan & Sandhangan Swara Standar S7',
      en: '20 Carakan Nglegena Consonants, Conjuncts & Unicode U+A980–U+A9DF',
      jw: '20 Aksara Nglegena, Pasangan saha Sandhangan Swara',
    },
    kategori: { id: 'Filologi & Aksara', en: 'Philology & Script', jw: 'Aksara Jawi' },
    asal: {
      id: 'Kongres Bahasa Jawa & Perpusnas RI',
      en: 'Javanese Language Congress & Perpusnas RI',
      jw: 'Kongres Basa Jawi & Perpusnas RI',
    },
    spesifikasiKurasi: [
      { label: { id: 'Katalog', en: 'Catalogue', jw: 'Katalog' }, nilai: 'KLR-12 · S7' },
      { label: { id: 'Blok Unicode', en: 'Unicode Block', jw: 'Blok Unicode' }, nilai: 'U+A980–U+A9DF' },
      { label: { id: 'Aksara Dasar', en: 'Base Alphabet', jw: 'Aksara Dasar' }, nilai: { id: '20 Carakan Nglegena', en: '20 Nglegena Glyphs', jw: '20 Carakan Nglegena' } },
    ],
    parameterCad: [
      { label: { id: 'Lempeng Ukir', en: 'Engraved Tablet', jw: 'Lempeng Ukir' }, nilai: { id: 'Perunggu Patina 4 Baris', en: '4-Line Patina Bronze', jw: 'Perunggu Patina 4 Larik' } },
      { label: { id: 'Bingkai & Sudut', en: 'Frame & Corner', jw: 'Pigura & Sudut' }, nilai: { id: 'Kayu Jati + Paku Kuningan', en: 'Teak + Brass Corner Pins', jw: 'Jati + Paku Kuningan' } },
      { label: { id: 'Mahkota Horologis', en: 'Horological Crest', jw: 'Makutha Astrolabe' }, nilai: { id: 'Astrolabe Dual-Gimbal', en: 'Dual-Gimbal Astrolabe', jw: 'Astrolabe Dual-Gimbal' } },
    ],
    ringkas: {
      id: 'Prasasti perunggu berbingkai kayu jati dan cincin astrolabe horologis yang memuat 20 aksara nglegena Hanacaraka Unicode U+A980.',
      en: 'Engraved patina bronze tablet housed in royal teak with rotating astrolabe gimbal rings presenting the 20 Hanacaraka consonants in Unicode U+A980.',
      jw: 'Prasasti perunggu ukir 20 aksara nglegena Hanacaraka standar Unicode U+A980 ing pigura jati.',
    },
    sejarahSingkat: {
      id: 'Hanacaraka adalah sistem tulisan abugida Jawa berjumlah 20 aksara dasar (nglegena) yang secara resmi distandarkan ke dalam blok Unicode U+A980–U+A9DF sejak 2009. Setiap konsonan dasar bermuatan vokal bawaan /a/ atau /ɔ/ yang dapat diubah menggunakan sandhangan serta pasangan.',
      en: 'Hanacaraka is a classical Javanese abugida script of twenty syllabic root glyphs standardized in Unicode block U+A980–U+A9DF since 2009, modulated by sandhangan vowel signs and conjunct pasangan tails.',
      jw: 'Hanacaraka mujudake sistem aksara abugida cacah 20 nglegena ing blok Unicode U+A980–U+A9DF kang kaubah swarane nganggo sandhangan lan pasangan.',
    },
    filosofi: {
      id: 'Rangkaian empat baris Ha-Na-Ca-Ra-Ka hingga Ma-Ga-Ba-Tha-Nga merekam hikayat kesetiaan dua utusan yang memegang teguh amanah hingga akhir hayat.',
      en: 'Its four pangram lines from Ha-Na-Ca-Ra-Ka through Ma-Ga-Ba-Tha-Nga preserve an ethical fable of integrity, mutual loyalty, and duty.',
      jw: 'Urutan Ha-Na-Ca-Ra-Ka nganti Ma-Ga-Ba-Tha-Nga nyaritakake kasetyan lan tanggung jawab marang amanah.',
    },
    sulukLarik: KOLEKSI_COVERFLOW.find((c) => c.id === 'cf-hanacaraka')?.sulukLarik ?? [],
    sumber: ['S7'],
    titikInfo: [
      {
        id: 'hanacaraka-lempeng',
        judul: { id: 'Lempeng Perunggu 20 Aksara Nglegena', en: 'Bronze Tablet of 20 Nglegena Consonants', jw: 'Lempeng Perunggu 20 Nglegena' },
        posisi: [0, 0.04, 0.14],
        explodeVec: [0, 0.12, 0.46],
        material: { id: 'Pelat Perunggu Patina Relief Timbul (Bump Engraved)', en: 'Raised Bump-Engraved Patina Bronze Face', jw: 'Pelat Perunggu Patina Relief Timbul' },
        fungsiTeknis: {
          id: 'Media prasasti empat bait aksara Ha–Na–Ca–Ra–Ka hingga Ma–Ga–Ba–Tha–Nga',
          en: 'Inscribed display preserving all four classical syllabic stanzas cleanly',
          jw: 'Media prasasti sekawan larik Ha–Na–Ca–Ra–Ka nganti Ma–Ga–Ba–Tha–Nga',
        },
        ringkasan: {
          id: 'Pelat perunggu gelap bertatah relief emas dua puluh huruf dasar carakan beserta tajuk Unicode U+A980–U+A9DF.',
          en: 'Patina dark bronze face embossed with twenty gilded consonants beneath Unicode U+A980–U+A9DF epigraph heading.',
          jw: 'Lempeng perunggu patra emas isi rong puluh aksara dasar carakan Unicode U+A980.',
        },
        sumber: ['S7'],
      },
      {
        id: 'hanacaraka-bingkai',
        judul: { id: 'Bingkai Ukir Jati & 4 Paku Sudut Kuningan', en: 'Carved Teak Surround & Four Brass Bosses', jw: 'Pigura Jati saha Paku Kuningan' },
        posisi: [-0.78, 0.72, 0.08],
        explodeVec: [0, 0.04, -0.48],
        material: { id: 'Kayu Jati Keraton · Empat Pin Oktahedron Kuningan', en: 'Court Teak Perimeter · Four Faceted Brass Corner Pins', jw: 'Kayu Jati Kraton · Sekawan Pin Kuningan' },
        fungsiTeknis: {
          id: 'Penopang struktural sekaligus bingkai pengunci kelembaban pelat prasasti',
          en: 'Rigid structural collar preventing humidity warping across the central bronze sheet',
          jw: 'Panyangga struktural lan pengunci kelembaban lempeng perunggu',
        },
        ringkasan: {
          id: 'Pigura kayu jati solid berornamen empat kancing logam di sudut yang membungkus inti lempeng tembaga.',
          en: 'Solid court teak perimeter fitted with four corner octahedral brass anchors framing the bronze core.',
          jw: 'Pigura kayu jati mawa sekawan paku sudut kuningan penguat prasasti.',
        },
        sumber: ['S7'],
      },
      {
        id: 'hanacaraka-mahkota',
        judul: { id: 'Mahkota Astrolabe Dua Cincin & Permata', en: 'Dual-Gimbal Astrolabe Ring Crest & Jewel', jw: 'Makutha Astrolabe Kuningan' },
        posisi: [0, 1.38, 0.05],
        explodeVec: [0, 0.72, 0],
        material: { id: 'Cincin Kuningan Dual-Gimbal + Permata Oktahedron', en: 'Dual-Gimbal Spun Brass + Octahedral Gem', jw: 'Cincin Kuningan Dual-Gimbal + Sesotya' },
        fungsiTeknis: {
          id: 'Penanda keterhubungan literasi epigrafi klasik dengan pengkodean presisi masa kini',
          en: 'Spinning astronomical crest bridging ancient palm-leaf philology and contemporary digital standards',
          jw: 'Tandha gandhenganipun epigrafi klasik kalihan kode digital presisi',
        },
        ringkasan: {
          id: 'Sepasang cincin horologis berputar di puncak bingkai melambangkan jembatan kesinambungan naskah kuno ke teknologi komputasi.',
          en: 'Counter-rotating twin horological rings mounted overhead symbolizing seamless continuity from manuscripts to Unicode.',
          jw: 'Kalih cincin kuningan mubeng ing pucuk pigura pralambang kalestaren aksara ing jaman digital.',
        },
        sumber: ['S7'],
      },
      {
        id: 'hanacaraka-alas',
        judul: { id: 'Pondasi Andesit Berundak Dua Penopang', en: 'Two-Tier Stepped Andesite Stone Base', jw: 'Dhasar Watu Andesit' },
        posisi: [0, -1.24, 0.25],
        explodeVec: [0, -0.62, 0],
        material: { id: 'Batu Andesit Candi Pahat Presisi', en: 'Chiseled Candi Andesite Stone Block', jw: 'Watu Andesit Candhi Pahat Presisi' },
        fungsiTeknis: {
          id: 'Penstabil pusat massa vertikal agar lempeng berat berdiri seimbang di meja kurasi',
          en: 'Weighted stone foundation stabilizing vertical display balance on museum tables',
          jw: 'Panegak pusat massa vertikal supaya lempeng anteb ngadeg mantep',
        },
        ringkasan: {
          id: 'Dasar tumpuan batu andesit dua tingkat bertakik khusus agar seluruh bingkai prasasti berdiri tegak.',
          en: 'Slotted two-step andesite base cradling the heavy engraved stele squarely upright.',
          jw: 'Tumpuan watu andesit kalih undhakan panyangga prasasti.',
        },
        sumber: ['S7'],
      },
    ],
    pertanyaanContoh: [
      {
        id: 'Berapa jumlah aksara nglegena Hanacaraka pada standar Unicode U+A980?',
        en: 'How many nglegena root glyphs belong to the Hanacaraka Unicode U+A980 standard?',
        jw: 'Wonten pinten cacahipun aksara nglegena Hanacaraka ing standar Unicode U+A980?',
      },
      {
        id: 'Bagaimana peran pasangan dan sandhangan swara saat menulis kalimat Jawa?',
        en: 'How do pasangan conjuncts and sandhangan vowel marks work in Javanese orthography?',
        jw: 'Kados pundi ginanipun pasangan saha sandhangan swara nalika nyerat basa Jawi?',
      },
    ],
    halamanKelanjutan: {
      id: 'kawruh',
      anchor: 'aksara',
      label: {
        id: 'Buka Lab Aksara U+A980',
        en: 'Open Script Lab U+A980',
        jw: 'Bukak Lab Aksara U+A980',
      },
    },
  },
];
