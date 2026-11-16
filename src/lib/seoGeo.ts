import {
  DAFTAR_SUMBER,
  DINDING_MATRIX,
  KOLEKSI_COVERFLOW,
  ambilTeks,
  type BahasaAktif,
} from '../content/pusaka.ts';

export type HalamanSeoId = 'beranda' | 'twin' | 'koleksi' | 'pakeliran' | 'kawruh';

export interface InfoSeoHalaman {
  title: string;
  description: string;
  keywords: string;
  pathQuery: string;
  geoTopic: string;
}

export const SITE_CANONICAL_FALLBACK = 'https://xfalzz.github.io/kelir';

export const META_HALAMAN_SEO: Record<HalamanSeoId, InfoSeoHalaman> = {
  beranda: {
    title: 'KELIR · Eksibisi Spasial 3D Pusaka Jawa, Digital Twin & Pakeliran',
    description:
      'Kelir memetakan Keris Luk 5, Gamelan Saron Laras Slendro 6 bilah, Batik Kawung, Pendopo Joglo Tumpang Sari, dan Wayang Kulit Purwa ke dalam 5 ruang WebGL 3D kurasi S1–S7.',
    keywords:
      'Kelir, Pusaka Jawa 3D, Digital Twin Keris, Saron Slendro, Batik Kawung, Arsitektur Joglo, Wayang Kulit Blencong, Aksara Jawa Hanacaraka',
    pathQuery: '/?hal=beranda',
    geoTopic: 'Arsitektur diorama 3D Pendopo Budaya Jawa, Indeks 12 Anatomi Pusaka (KLR-01–KLR-12), dan Etalase Lapisan Budaya',
  },
  twin: {
    title: 'Digital Twin CAD 3D Pusaka · KELIR Studio Bedah Anatomi',
    description:
      'Bedah anatomi CAD 3D 7 koleksi (Keris Luk 5, Saron 6 Bilah, Batik Kawung, Joglo, Wayang & Blencong, Kidang Kencana, Prasasti Hanacaraka U+A980) mode PBR, Hibrida & X-Ray CAD.',
    keywords:
      'Digital Twin Pusaka, Bedah 3D Keris Luk 5, Pelita Blencong 3D, Kidang Kencana, Prasasti Hanacaraka, Saron Laras Slendro 6 Bilah',
    pathQuery: '/?hal=twin',
    geoTopic: 'Inspeksi CAD X-Ray dan model 3D eksplosif anatomi terperinci 7 koleksi pusaka & aksara Nusantara',
  },
  koleksi: {
    title: 'Galeri Coverflow 3D & Suluk Pakeliran · KELIR Archive Vol. I',
    description:
      'Jelajahi 7 koleksi pusaka, Kidang Kencana & Blencong, serta Prasasti Hanacaraka U+A980 dalam galeri Coverflow WebGL 3D realistis S1–S7 lengkap dengan anatomi dan suluk.',
    keywords:
      'Galeri Coverflow 3D Pusaka, Suluk Dalang Jawa, Kidang Kencana Blencong, Prasasti Hanacaraka U+A980, UNESCO ICH Indonesia',
    pathQuery: '/?hal=koleksi',
    geoTopic: 'Kurasi Coverflow 3D PBR 7 spesimen pusaka Jawa, pakeliran Blencong, dan prasasti Hanacaraka S1–S7',
  },
  pakeliran: {
    title: 'Panggung Pakeliran Ramayana 3D · Lakon Kijang Kencana · KELIR',
    description:
      'Simulasi panggung kelir bayangan 3D epik Aranya Kanda bersama Sri Rama, Kidang Kencana, Gunungan Kayon, sorot lampu Blencong, sabetan dalang, serta kendali gestur 21 titik.',
    keywords:
      'Wayang Kulit 3D, Lakon Kijang Kencana, Pakeliran Ramayana, Kendali Gestur Dalang, Blencong Wayang',
    pathQuery: '/?hal=pakeliran',
    geoTopic: 'Simulasi pakeliran bayangan 3D empat babak Lakon Kijang Kencana dengan kontrol gestur lokal',
  },
  kawruh: {
    title: 'Pamomong BM25 AI & Lab Aksara Jawa Hanacaraka · KELIR',
    description:
      'Tanya jawab budaya berbasis temu-balik BM25 terikat arsip S1–S7 tanpa halusinasi, instrumen 3D Astrolabe Horologis, transliterasi Hanacaraka Unicode U+A980–U+A9DF, serta ledger sumber resmi.',
    keywords:
      'Aksara Jawa Hanacaraka Unicode U+A980, Pamomong AI Budaya Jawa, BM25 Cultural RAG, Transliterasi Carakan Jawa',
    pathQuery: '/?hal=kawruh',
    geoTopic: 'Asisten RAG BM25 nol-halusinasi berbasis sumber S1–S7 dan laboratorium transliterasi Aksara Jawa U+A980',
  },
};

function resolveBaseOrigin(origin?: string): string {
  if (origin && origin.startsWith('http')) return origin.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return SITE_CANONICAL_FALLBACK;
}

/**
 * Membangun grafik Schema.org JSON-LD (WebSite, WebApplication, ItemList, FAQPage) untuk SEO dan GEO.
 */
export function bangunJsonLdGraph(hal: HalamanSeoId = 'beranda', origin?: string): Record<string, unknown> {
  const baseUrl = resolveBaseOrigin(origin);
  const seoHalaman = META_HALAMAN_SEO[hal] ?? META_HALAMAN_SEO.beranda;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: 'KELIR · Eksibisi Spasial 3D Pusaka Jawa',
        alternateName: 'ꦏꦼꦭꦶꦂ KELIR Spatial Heritage Archive',
        url: baseUrl,
        inLanguage: ['id-ID', 'en-US', 'jv'],
        description: META_HALAMAN_SEO.beranda.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/?hal=kawruh&q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${baseUrl}/#webapp`,
        name: seoHalaman.title,
        url: `${baseUrl}${seoHalaman.pathQuery}`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript, WebGL',
        inLanguage: ['id-ID', 'en-US', 'jv'],
        isAccessibleForFree: true,
        about: seoHalaman.geoTopic,
        citation: Object.values(DAFTAR_SUMBER).map((s) => `${s.kode}: ${s.judul} (${s.lembaga}, ${s.tahun}) — ${s.tautan}`),
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}/#koleksi-pusaka`,
        name: 'Daftar 7 Koleksi Coverflow, 5 Pusaka Utama & 12 Unsur KELIR',
        numberOfItems: KOLEKSI_COVERFLOW.length,
        itemListElement: KOLEKSI_COVERFLOW.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'CreativeWork',
            name: b.nama.id,
            alternateName: b.nama.jw,
            description: b.penjelasanLengkap.id,
            spatialCoverage: b.asal.id,
            keywords: b.metrikKurasi
              .map((s) => `${ambilTeks(s.label, 'id')}: ${ambilTeks(s.nilai, 'id')}`)
              .join(', '),
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq-kurasi`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Mengapa Keris Luk 5 identik dengan filosofi Pandawa Lima?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Wilah berjumlah lima kelokan asimetris melambangkan keteguhan hati lima kesatria Pandawa dan keseimbangan langkah spiritual, sedangkan ganja dan wilah melambangkan manunggaling kawula lan gusti (Sumber S1 UNESCO ICH).',
            },
          },
          {
            '@type': 'Question',
            name: 'Berapa bilah dan komposisi logam Saron Laras Slendro di KELIR?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Saron Demung Laras Slendro di KELIR memodelkan 6 bilah nada pentatonik (1 2 3 5 6 i) berbahan perunggu gangsa dengan rasio paduan 78% tembaga dan 22% timah putih (Sumber S4 UNESCO ICH Gamelan).',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana konstruksi Tumpang Sari pada Pendopo Joglo bertahan tanpa paku besi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Empat tiang utama Saka Guru ditumpukan pada batu Umpak dan dikunci sambungan purus kayu jati 12 undakan Tumpang Sari tanpa paku logam sehingga lentur meredam getaran seismik (Sumber S6 Kemdikbud RI).',
            },
          },
          {
            '@type': 'Question',
            name: 'Apa peran lampu Blencong dan tatahan kulit pada Wayang Kulit Purwa?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Pelita minyak kelapa Blencong menggantung di atas kelir untuk menyorot ratusan tusukan tatahan kulit kerbau bertangkai tanduk cempurit dan tuding, menghasilkan bayangan hidup di layar blacu (Sumber S3 UNESCO ICH Wayang).',
            },
          },
        ],
      },
      {
        '@type': 'Dataset',
        '@id': `${baseUrl}/#indeks-anatomi`,
        name: 'Indeks 12 Anatomi Pusaka Nusantara KLR-01 hingga KLR-12',
        description:
          'Pemetaan 12 unsur arsitektur, metalurgi, wastra, pakeliran, dan blok Unicode Aksara Jawa U+A980 terhubung sumber resmi S1–S7.',
        variableMeasured: DINDING_MATRIX.map(
          (m) => `${m.kodeArsip} ${ambilTeks(m.label, 'id')} (${ambilTeks(m.spesifikasi, 'id')})`,
        ),
      },
    ],
  };
}

function setMetaContent(selector: string, content: string): void {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute('content', content);
}

const TITLE_TERJEMAHAN: Record<HalamanSeoId, { en: string; jw: string }> = {
  beranda: {
    en: 'KELIR · 3D Spatial Exhibition of Javanese Heritage, Digital Twin & Shadow Theatre',
    jw: 'KELIR · Eksibisi Spasial 3D Pusaka Jawi, Digital Twin & Pakeliran',
  },
  twin: {
    en: '3D CAD Digital Twin Studio · KELIR Heritage Anatomical Dissection',
    jw: 'Digital Twin CAD 3D Pusaka · Studio Bedhah Anatomi KELIR',
  },
  koleksi: {
    en: '3D Coverflow Gallery & Dalang Suluk Repertoire · KELIR Archive Vol. I',
    jw: 'Galeri Coverflow 3D & Suluk Pakeliran · Arsip KELIR Jilid I',
  },
  pakeliran: {
    en: '3D Ramayana Shadow Stage · Epic of the Golden Deer · KELIR',
    jw: 'Panggung Pakeliran Ramayana 3D · Lakon Kidang Kencana · KELIR',
  },
  kawruh: {
    en: 'Pamomong BM25 Cultural RAG & Hanacaraka Script Lab · KELIR',
    jw: 'Mesin Pamomong BM25 & Lab Aksara Hanacaraka · KELIR',
  },
};

/**
 * Menyinkronkan judul, deskripsi meta, canonical URL, Open Graph, Twitter Card,
 * serta skema JSON-LD sesuai halaman aktif dan bahasa pilihan di sisi peramban.
 */
export function sinkronkanSeoHalaman(hal: HalamanSeoId, bahasa: BahasaAktif = 'id'): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const info = META_HALAMAN_SEO[hal] ?? META_HALAMAN_SEO.beranda;
  const origin = resolveBaseOrigin();
  const canonicalUrl = `${origin}${info.pathQuery}`;
  const localizedTitle =
    bahasa === 'en'
      ? TITLE_TERJEMAHAN[hal].en
      : bahasa === 'jw' || bahasa === 'aks'
        ? TITLE_TERJEMAHAN[hal].jw
        : info.title;

  document.title = localizedTitle;
  setMetaContent('meta[name="description"]', info.description);
  setMetaContent('meta[name="keywords"]', info.keywords);
  setMetaContent('meta[property="og:title"]', localizedTitle);
  setMetaContent('meta[property="og:description"]', info.description);
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:title"]', localizedTitle);
  setMetaContent('meta[name="twitter:description"]', info.description);

  const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.setAttribute('href', canonicalUrl);

  const jsonLdScript = document.getElementById('kelir-jsonld');
  if (jsonLdScript) {
    jsonLdScript.textContent = JSON.stringify(bangunJsonLdGraph(hal, origin));
  }
}

/**
 * Memperbarui meta theme-color peramban saat tema beralih antara terang dan malam.
 */
export function sinkronkanTemaBrowser(tema: 'malam' | 'terang'): void {
  if (typeof document === 'undefined') return;
  setMetaContent('meta[name="theme-color"]', tema === 'malam' ? '#12100e' : '#f6f4ef');
}
