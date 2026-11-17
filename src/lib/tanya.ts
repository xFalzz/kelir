import {
  DAFTAR_BEDAH_TWIN,
  DAFTAR_BENDA,
  DAFTAR_SUMBER,
  KAWRUH_FILOSOFI,
  KRONIK_SEJARAH_BUDAYA,
  LAKON_KIJANG_KENCANA,
  ambilTeks,
  type BahasaAktif,
  type BendaPusaka,
  type KodeSumber,
  type MultiTeks,
  type TeksLokal,
} from '../content/pusaka.ts';
import {
  cariKonteksNusantara,
  cariKonteksWilayahNusantara,
} from '../content/nusantaraKB.ts';
import {
  BATAS_KARAKTER_TANYA,
  apakahAdaSinyalArsipS1S7,
  apakahTopikBudayaIndonesia,
  auditDanBersihkanOutputAI,
  bersihkanInputPengguna,
  deteksiSeranganAtauLuarTopik,
  hilangkanEmDashAI,
  pesanPenolakanKeamanan,
  rapikanParagrafResponsAI,
} from './aiGuardrail.ts';

export const MODEL_AI_PAMOMONG = 'Pamomong Nusantara' as const;

export type ModePenyediaPamomong =
  | 'pamomong-live'
  | 'bm25-kurasi-lokal'
  | 'bm25-api-terverifikasi';

export interface KonteksUnsurKurasi {
  judulUnsur?: string;
  material?: string;
  fungsiTeknis?: string;
  ringkasan?: string;
}

export interface ButirBuktiTanya {
  id: string;
  judul: string;
  kategori: string;
  kutipan: string;
  sumber: KodeSumber[];
  skorRelatif: number;
}

export interface HasilTanya {
  jawaban: string;
  sumber: KodeSumber[];
  mode: ModePenyediaPamomong;
  modelNama: typeof MODEL_AI_PAMOMONG;
  statusGrounding: 'terbukti' | 'eksplorasi-nusantara' | 'ringkasan-benda' | 'luar-korpus';
  skorKeyakinan: number;
  kataKunciCocok: string[];
  latensiMs: number;
  butirBukti: ButirBuktiTanya[];
  rujukan: Array<{ kode: KodeSumber; judul: string; lembaga: string }>;
}

interface DokumenKorpus {
  id: string;
  bendaId?: BendaPusaka['id'];
  judul: MultiTeks;
  kategori: MultiTeks;
  teks: MultiTeks;
  sumber: KodeSumber[];
  tokens: string[];
  tf: Map<string, number>;
  teksNormal: string;
}

const STOPWORDS = new Set([
  'apa', 'mengapa', 'kenapa', 'bagaimana', 'siapa', 'kapan', 'dimana', 'di', 'ke',
  'dari', 'yang', 'dan', 'pada', 'untuk', 'dengan', 'tentang', 'ini', 'itu', 'atau',
  'dalam', 'seperti', 'adalah', 'agar', 'secara', 'juga', 'oleh', 'soal', 'berapa',
  'dapat', 'bisa', 'menapa', 'kenging', 'kados', 'pundi', 'wonten', 'lan', 'kalih',
  'ing', 'saha', 'inggih', 'kangge',
  // English stopwords
  'the', 'why', 'how', 'what', 'who', 'where', 'when', 'is', 'are', 'was', 'were',
  'does', 'do', 'did', 'into', 'from', 'with', 'about', 'for', 'and', 'between',
  'that', 'this', 'can', 'many', 'within', 'their', 'these', 'such', 'have',
]);

/** Peta ekspansi sinonim lintas Indonesia–Jawa–Inggris untuk akurasi temu balik semantik lokal. */
const SINONIM_BUDAYA: Record<string, string[]> = {
  gempa: ['seismik', 'lindhu', 'getaran', 'umpak', 'lentur', 'earthquake', 'seismic'],
  earthquake: ['gempa', 'seismic', 'seismik', 'lindhu', 'umpak', 'joglo'],
  earthquakes: ['gempa', 'seismic', 'seismik', 'lindhu', 'umpak', 'joglo'],
  seismic: ['gempa', 'lindhu', 'umpak', 'joglo', 'saka'],
  seismik: ['gempa', 'getaran', 'umpak'],
  lindhu: ['gempa', 'umpak', 'joglo', 'saka'],
  paku: ['purus', 'pasak', 'sambungan', 'konstruksi', 'nail', 'nails', 'peg', 'joinery'],
  nail: ['paku', 'purus', 'pasak', 'joinery', 'joglo'],
  nails: ['paku', 'purus', 'pasak', 'joinery', 'joglo'],
  joinery: ['purus', 'pasak', 'sambungan', 'joglo', 'tumpang'],
  purus: ['pasak', 'paku', 'sambungan', 'kayu', 'mortise'],
  pasak: ['purus', 'paku', 'sambungan', 'peg'],
  pamor: ['nikel', 'meteorit', 'warangan', 'besi', 'tempa', 'wutah', 'meteorite', 'nickel'],
  meteorite: ['meteorit', 'pamor', 'nikel', 'nickel', 'keris'],
  pandawa: ['luk', 'lima', 'keris', 'kesatria', 'pandava', 'wave'],
  pandava: ['pandawa', 'luk', 'lima', 'keris', 'dhuwung'],
  keris: ['dhuwung', 'wilah', 'ganja', 'pamor', 'pandawa', 'luk'],
  dhuwung: ['keris', 'wilah', 'ganja', 'pamor', 'pandawa'],
  blade: ['wilah', 'bilah', 'keris', 'pamor', 'ganja'],
  ganja: ['wilah', 'bilah', 'manunggaling', 'keris'],
  slendro: ['laras', 'gamelan', 'karawitan', 'gangsa', 'saron', 'perunggu', 'bronze'],
  gamelan: ['slendro', 'saron', 'gangsa', 'karawitan', 'gong', 'bronze', 'pijetan'],
  bronze: ['gangsa', 'perunggu', 'saron', 'slendro', 'copper', 'tin'],
  saron: ['gangsa', 'slendro', 'gamelan', 'wilah', 'pijetan'],
  krawangan: ['tatahan', 'wacucal', 'kulit', 'wayang', 'cempurit', 'leather', 'buffalo'],
  wayang: ['ringgit', 'kelir', 'blencong', 'cempurit', 'tuding', 'puppet', 'shadow'],
  puppet: ['wayang', 'kulit', 'blencong', 'kelir', 'cempurit', 'tuding'],
  shadow: ['wayang', 'kelir', 'blencong', 'bayangan', 'silhouette'],
  blencong: ['pelita', 'minyak', 'lampu', 'bayangan', 'kelir', 'lamp', 'flame', 'coconut'],
  ramayana: ['rama', 'shinta', 'kidang', 'kencana', 'marica', 'aranya', 'kanda', 'gendewa'],
  kijang: ['kidang', 'kencana', 'marica', 'ramayana', 'deer', 'golden'],
  kidang: ['kijang', 'kencana', 'marica', 'deer', 'golden'],
  deer: ['kidang', 'kijang', 'kencana', 'marica', 'aranya'],
  aksara: ['hanacaraka', 'carakan', 'unicode', 'sandhangan', 'pasangan', 'nglegena', 'script'],
  hanacaraka: ['aksara', 'carakan', 'unicode', 's7', 'nglegena', 'pasangan', 'sandhangan'],
  unicode: ['a980', 'hanacaraka', 'carakan', 'aksara', 'nglegena'],
  script: ['aksara', 'hanacaraka', 'carakan', 'nglegena', 'unicode'],
  batik: ['kawung', 'canting', 'malam', 'soga', 'wastra', 'kiblat', 'wax', 'nglorod'],
  kawung: ['batik', 'kiblat', 'pancer', 'canting', 'soga', 'larangan', 'forbidden'],
  wax: ['malam', 'canting', 'batik', 'nglorod', 'beeswax'],
};

function asMulti(v: TeksLokal): MultiTeks {
  if (typeof v === 'string') return { id: v, en: v, jw: v };
  return v;
}

function normalisasiToken(teks: string): string[] {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((kata) => kata.length > 2 && !STOPWORDS.has(kata));
}

function ekspansiKueri(tokens: string[]): { semuaToken: string[]; bobot: Map<string, number> } {
  const bobot = new Map<string, number>();
  for (const t of tokens) {
    bobot.set(t, (bobot.get(t) ?? 0) + 1.0);
    const sinonim = SINONIM_BUDAYA[t];
    if (sinonim) {
      for (const s of sinonim) {
        if (!bobot.has(s)) {
          bobot.set(s, 0.55);
        }
      }
    }
  }
  return { semuaToken: [...bobot.keys()], bobot };
}

function bangunDaftarRujukan(kodeDaftar: KodeSumber[]) {
  const unik = [...new Set(kodeDaftar)];
  return unik.map((kode) => ({
    kode,
    judul: DAFTAR_SUMBER[kode].judul,
    lembaga: DAFTAR_SUMBER[kode].lembaga,
  }));
}

function buatDokumenKorpus(): {
  docs: DokumenKorpus[];
  idf: Map<string, number>;
  avgDocLen: number;
} {
  const rawDocs: Array<Omit<DokumenKorpus, 'tokens' | 'tf' | 'teksNormal'>> = [];

  for (const sp of DAFTAR_BEDAH_TWIN) {
    const mappedBendaId: BendaPusaka['id'] =
      sp.id === 'kidang' ? 'wayang' : sp.id === 'hanacaraka' ? 'keris' : sp.id;

    for (const t of sp.titikInfo) {
      rawDocs.push({
        id: `titik-${t.id}`,
        bendaId: mappedBendaId,
        judul: {
          id: `${sp.nama.id} · ${t.judul.id}`,
          en: `${sp.nama.en} · ${t.judul.en}`,
          jw: `${sp.nama.jw} · ${t.judul.jw}`,
        },
        kategori: sp.kategori,
        teks: {
          id: `${t.judul.id}: ${t.ringkasan.id}`,
          en: `${t.judul.en}: ${t.ringkasan.en}`,
          jw: `${t.judul.jw}: ${t.ringkasan.jw}`,
        },
        sumber: t.sumber,
      });
    }

    rawDocs.push({
      id: `sejarah-${sp.id}`,
      bendaId: mappedBendaId,
      judul: {
        id: `Sejarah & Filosofi ${sp.nama.id}`,
        en: `History & Philosophy of ${sp.nama.en}`,
        jw: `Sejarah saha Falsafah ${sp.nama.jw}`,
      },
      kategori: sp.kategori,
      teks: {
        id: `${sp.sejarahSingkat.id} Secara filosofis, ${sp.filosofi.id}`,
        en: `${sp.sejarahSingkat.en} Philosophically, ${sp.filosofi.en}`,
        jw: `${sp.sejarahSingkat.jw} Kanthi falsafah, ${sp.filosofi.jw}`,
      },
      sumber: sp.sumber,
    });
  }

  for (const bab of LAKON_KIJANG_KENCANA.daftarBabak) {
    const sulukMt = asMulti(bab.suluk);
    rawDocs.push({
      id: `lakon-${bab.id}`,
      bendaId: 'wayang',
      judul: {
        id: `${bab.judul.id} (${bab.lokasi.id})`,
        en: `${bab.judul.en} (${bab.lokasi.en})`,
        jw: `${bab.judul.jw} (${bab.lokasi.jw})`,
      },
      kategori: {
        id: 'Pakeliran Ramayana',
        en: 'Ramayana Shadow Theatre',
        jw: 'Pakeliran Ramayana',
      },
      teks: {
        id: `${bab.narasiDalang.id} ${sulukMt.id}`,
        en: `${bab.narasiDalang.en} "${sulukMt.en}"`,
        jw: `${bab.narasiDalang.jw} ${sulukMt.jw}`,
      },
      sumber: bab.sumber,
    });
  }

  for (const k of KAWRUH_FILOSOFI) {
    rawDocs.push({
      id: `kawruh-${k.id}`,
      judul: {
        id: `Kawruh ${k.istilah}: ${k.judul.id}`,
        en: `${k.istilah}: ${k.judul.en}`,
        jw: `Kawruh ${k.istilah}: ${k.judul.jw}`,
      },
      kategori: {
        id: 'Filsafat Kebudayaan Jawa',
        en: 'Javanese Cultural Philosophy',
        jw: 'Falsafah Kabudayan Jawi',
      },
      teks: {
        id: `${k.makna.id} ${k.keterkaitan.id}`,
        en: `${k.makna.en} ${k.keterkaitan.en}`,
        jw: `${k.makna.jw} ${k.keterkaitan.jw}`,
      },
      sumber: k.sumber,
    });
  }

  for (const kr of KRONIK_SEJARAH_BUDAYA) {
    rawDocs.push({
      id: `kronik-${kr.nomor}`,
      bendaId: kr.bendaId,
      judul: {
        id: `Kronik ${kr.nomor} · ${kr.judul.id}`,
        en: `Chronicle ${kr.nomor} · ${kr.judul.en}`,
        jw: `Kronik ${kr.nomor} · ${kr.judul.jw}`,
      },
      kategori: { id: kr.kodeArsip, en: kr.kodeArsip, jw: kr.kodeArsip },
      teks: {
        id: `${kr.sorotan.id} ${kr.narasiMendalam.id}`,
        en: `${kr.sorotan.en} ${kr.narasiMendalam.en}`,
        jw: `${kr.sorotan.jw} ${kr.narasiMendalam.jw}`,
      },
      sumber: kr.sumber,
    });
  }

  for (const s of Object.values(DAFTAR_SUMBER)) {
    const r = asMulti(s.ringkasan);
    rawDocs.push({
      id: `sumber-${s.kode}`,
      judul: { id: `${s.kode} · ${s.judul}`, en: `${s.kode} · ${s.judul}`, jw: `${s.kode} · ${s.judul}` },
      kategori: { id: s.lembaga, en: s.lembaga, jw: s.lembaga },
      teks: r,
      sumber: [s.kode],
    });
  }

  const df = new Map<string, number>();
  let totalLen = 0;

  const docs: DokumenKorpus[] = rawDocs.map((d) => {
    const gabungan = `${d.judul.id} ${d.judul.en} ${d.judul.jw} ${d.kategori.id} ${d.kategori.en} ${d.teks.id} ${d.teks.en} ${d.teks.jw}`;
    const tokens = normalisasiToken(gabungan);
    totalLen += tokens.length;
    const tf = new Map<string, number>();
    for (const tok of tokens) {
      tf.set(tok, (tf.get(tok) ?? 0) + 1);
    }
    for (const unikTok of tf.keys()) {
      df.set(unikTok, (df.get(unikTok) ?? 0) + 1);
    }
    return {
      ...d,
      tokens,
      tf,
      teksNormal: gabungan.toLowerCase(),
    };
  });

  const N = docs.length;
  const idf = new Map<string, number>();
  for (const [term, freq] of df.entries()) {
    idf.set(term, Math.log(1 + (N - freq + 0.5) / (freq + 0.5)));
  }

  return { docs, idf, avgDocLen: Math.max(totalLen / Math.max(N, 1), 1) };
}

let cacheKorpusIndeks: ReturnType<typeof buatDokumenKorpus> | null = null;

function getKorpusIndeks() {
  if (!cacheKorpusIndeks) {
    cacheKorpusIndeks = buatDokumenKorpus();
  }
  return cacheKorpusIndeks;
}
const BM25_K1 = 1.4;
const BM25_B = 0.65;
const AMBANG_ABSTAIN_BM25 = 1.05;

const KATA_DOMAIN_BUDAYA = new Set([
  'keris', 'dhuwung', 'luk', 'pamor', 'ganja', 'wilah', 'pandawa', 'pandava', 'empu', 'warangka', 'besalen',
  'saron', 'slendro', 'pelog', 'gamelan', 'gangsa', 'karawitan', 'pijetan', 'balungan', 'gong', 'barung', 'demung', 'peking',
  'batik', 'kawung', 'canting', 'malam', 'soga', 'indigo', 'nglorod', 'wastra', 'kiblat', 'pancer', 'anglo', 'gawangan',
  'joglo', 'pendopo', 'pendhapa', 'saka', 'tumpang', 'sari', 'umpak', 'purus', 'pasak', 'tajug', 'brunjung', 'gempa', 'seismic', 'earthquake', 'earthquakes', 'lindhu', 'joinery', 'nails', 'nail',
  'wayang', 'ringgit', 'blencong', 'kelir', 'cempurit', 'tuding', 'tatahan', 'sunggingan', 'ramayana', 'rama', 'shinta', 'sita', 'marica', 'kidang', 'kijang', 'aranya', 'kanda', 'gendewa', 'guwawijaya', 'puppet', 'shadow', 'deer',
  'hanacaraka', 'aksara', 'carakan', 'unicode', 'a980', 'sandhangan', 'pasangan', 'nglegena', 'suluk', 'dalang', 'dhalang', 'pakeliran', 'sabetan', 'keprak',
  'sonobudoyo', 'perpusnas', 'kemdikbud', 'manunggaling', 'memayu', 'hayuning', 'bawana', 'sangkan', 'paraning', 'dumadi', 'blade', 'bronze',
]);

/**
 * Mesin retrieval BM25 lintas bahasa + ekspansi sinonim budaya & guard halusinasi terikat sumber S1–S7.
 */
export function jawabDariKurasiLokal(
  bendaId: BendaPusaka['id'],
  pertanyaanRaw: string,
  bahasa: BahasaAktif = 'id',
): HasilTanya {
  const mulai = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const benda = DAFTAR_BENDA.find((item) => item.id === bendaId) ?? DAFTAR_BENDA[0];
  const selesai = () =>
    Math.max(0.2, Number((((typeof performance !== 'undefined' ? performance.now() : Date.now()) - mulai)).toFixed(2)));

  const pemeriksaan = deteksiSeranganAtauLuarTopik(pertanyaanRaw, BATAS_KARAKTER_TANYA);
  if (!pemeriksaan.aman && pemeriksaan.kategori !== 'kosong') {
    return {
      jawaban: pesanPenolakanKeamanan(pemeriksaan.kategori, bahasa),
      sumber: [],
      mode: 'bm25-kurasi-lokal',
      modelNama: MODEL_AI_PAMOMONG,
      statusGrounding: 'luar-korpus',
      skorKeyakinan: 0,
      kataKunciCocok: [],
      latensiMs: selesai(),
      butirBukti: [],
      rujukan: [],
    };
  }

  const pertanyaan = pemeriksaan.inputBersih;

  if (!pertanyaan) {
    return {
      jawaban: `${ambilTeks(benda.nama, bahasa)} (${ambilTeks(benda.subjudul, bahasa)}): ${ambilTeks(benda.ringkas, bahasa)} ${ambilTeks(benda.filosofi, bahasa)}`,
      sumber: benda.sumber,
      mode: 'bm25-kurasi-lokal',
      modelNama: MODEL_AI_PAMOMONG,
      statusGrounding: 'ringkasan-benda',
      skorKeyakinan: 92,
      kataKunciCocok: [benda.id],
      latensiMs: selesai(),
      butirBukti: [
        {
          id: `ringkas-${benda.id}`,
          judul: ambilTeks(
            {
              id: `${benda.nama.id} · Ringkasan Kuratorial`,
              en: `${benda.nama.en} · Curatorial Summary`,
              jw: `${benda.nama.jw} · Ringkesan Kuratorial`,
            },
            bahasa,
          ),
          kategori: ambilTeks(benda.kategori, bahasa),
          kutipan: ambilTeks(benda.sejarahSingkat, bahasa),
          sumber: benda.sumber,
          skorRelatif: 100,
        },
      ],
      rujukan: bangunDaftarRujukan(benda.sumber),
    };
  }

  const tokensDasar = normalisasiToken(pertanyaan);
  const { semuaToken, bobot } = ekspansiKueri(tokensDasar);
  const kueriNormal = tokensDasar.join(' ');

  const terperingkat: Array<{
    doc: DokumenKorpus;
    skor: number;
    cocok: string[];
  }> = [];

  const korpus = getKorpusIndeks();
  for (const doc of korpus.docs) {
    let skor = 0;
    const cocokSet = new Set<string>();
    const dl = doc.tokens.length;

    for (const term of semuaToken) {
      const termFreq = doc.tf.get(term) ?? 0;
      const w = bobot.get(term) ?? 1;
      if (termFreq > 0) {
        const idf = korpus.idf.get(term) ?? 1.0;
        const tfNorm = (termFreq * (BM25_K1 + 1)) / (termFreq + BM25_K1 * (1 - BM25_B + BM25_B * (dl / korpus.avgDocLen)));
        skor += idf * tfNorm * w;
        cocokSet.add(term);
      } else if (term.length >= 5 && doc.teksNormal.includes(term)) {
        const idf = korpus.idf.get(term) ?? 0.9;
        skor += idf * 0.48 * w;
        cocokSet.add(term);
      }
    }

    if (skor > 0) {
      if (kueriNormal.length > 5 && doc.teksNormal.includes(kueriNormal)) {
        skor += 2.2;
      }
      if (doc.bendaId === benda.id) {
        skor += 0.35;
      }
      terperingkat.push({ doc, skor, cocok: [...cocokSet] });
    }
  }

  terperingkat.sort((a, b) => b.skor - a.skor);

  const hasDomainToken =
    tokensDasar.some((t) => KATA_DOMAIN_BUDAYA.has(t)) ||
    semuaToken.some((t) => KATA_DOMAIN_BUDAYA.has(t));
  const adaSinyalArsipS1S7 = hasDomainToken || apakahAdaSinyalArsipS1S7(pertanyaan);
  const infoNusantara = apakahTopikBudayaIndonesia(pertanyaan);
  const topHit = terperingkat[0];
  const lolosValidasiKorpus =
    Boolean(topHit) &&
    topHit.skor >= AMBANG_ABSTAIN_BM25 &&
    (adaSinyalArsipS1S7 || (!infoNusantara.relevanBudaya && topHit.cocok.length >= 2 && topHit.skor >= 2.2));

  if (!lolosValidasiKorpus) {
    if (infoNusantara.relevanBudaya) {
      let entriNusantara = cariKonteksNusantara(pertanyaan, 2);
      if (entriNusantara.length === 0) {
        entriNusantara = cariKonteksWilayahNusantara(pertanyaan, 2);
      }
      if (entriNusantara.length > 0) {
        const utama = entriNusantara[0];
        const judul = ambilTeks(utama.judul, bahasa);
        const wil = ambilTeks(utama.wilayah, bahasa);
        const sejarah = ambilTeks(utama.intiSejarah, bahasa);
        const teknis = ambilTeks(utama.unsurTeknis, bahasa);
        const filosofi = ambilTeks(utama.maknaFilosofis, bahasa);
        const kedua = entriNusantara[1];
        const sambunganKedua = kedua
          ? `\n\n${ambilTeks(kedua.judul, bahasa)} (${ambilTeks(kedua.wilayah, bahasa)}): ${ambilTeks(kedua.intiSejarah, bahasa)} ${ambilTeks(kedua.maknaFilosofis, bahasa)}`
          : '';
        return {
          jawaban: hilangkanEmDashAI(`${judul} (${wil}): ${sejarah}\n\n${teknis}\n\n${filosofi}${sambunganKedua}`),
          sumber: [],
          mode: 'bm25-kurasi-lokal',
          modelNama: MODEL_AI_PAMOMONG,
          statusGrounding: 'eksplorasi-nusantara',
          skorKeyakinan: 92,
          kataKunciCocok: [
            ...new Set([
              ...infoNusantara.kataKunciTerdeteksi,
              ...entriNusantara.flatMap((e) => e.kataKunci.slice(0, 2)),
            ]),
          ].slice(0, 6),
          latensiMs: selesai(),
          butirBukti: [],
          rujukan: [],
        };
      }

      const pesanEksplorasi = ambilTeks(
        {
          id: 'Topik warisan budaya atau situs Nusantara ini teridentifikasi dalam cakupan sejarah Indonesia, namun detail spesifiknya belum tersimpan lengkap di indeks arsip luring perangkat. Saat terhubung ke server Pamomong Nusantara aktif, tanyakan ulang topik ini untuk memperoleh uraian lokasi, isi kompleks, serta filosofinya secara menyeluruh; atau jelajahi koleksi arsip luring seperti Taman Sari Yogyakarta, Prambanan, Trowulan, Tari Saman, Rumah Gadang, Subak Bali, Pinisi, dan Noken Papua.',
          en: 'This Indonesian heritage topic or landmark falls within Nusantara cultural scope, though its specific record is not yet stored in the local offline index. Reconnect to the live Pamomong Nusantara server for a complete geographical, structural, and historical dossier, or explore offline entries including Taman Sari Yogyakarta, Prambanan, Trowulan, Saman Dance, Rumah Gadang, Balinese Subak, Pinisi, and Papua Noken.',
          jw: 'Topik warisan budaya utawi papan sejarah punika mlebet cakupan kabudayan Indonesia, nanging rincianipun dereng kasimpen jangkep wonten indeks arsip luring piranti. Sambungaken kalih server Pamomong Nusantara aktif kangge andharan lokasi lan sejarah ingkang langkung jembar.',
        },
        bahasa,
      );
      return {
        jawaban: hilangkanEmDashAI(pesanEksplorasi),
        sumber: [],
        mode: 'bm25-kurasi-lokal',
        modelNama: MODEL_AI_PAMOMONG,
        statusGrounding: 'eksplorasi-nusantara',
        skorKeyakinan: 86,
        kataKunciCocok: infoNusantara.kataKunciTerdeteksi,
        latensiMs: selesai(),
        butirBukti: [],
        rujukan: [],
      };
    }

    return {
      jawaban: pesanPenolakanKeamanan('luar-topik', bahasa),
      sumber: [],
      mode: 'bm25-kurasi-lokal',
      modelNama: MODEL_AI_PAMOMONG,
      statusGrounding: 'luar-korpus',
      skorKeyakinan: 0,
      kataKunciCocok: [],
      latensiMs: selesai(),
      butirBukti: [],
      rujukan: [],
    };
  }

  const topSkor = terperingkat[0].skor;
  const buktiPilihan = terperingkat.slice(0, 3);
  const utama = buktiPilihan[0];
  const kedua = buktiPilihan[1];
  const ketiga = buktiPilihan[2];

  const sumberGabungan: KodeSumber[] = [
    ...new Set(buktiPilihan.flatMap((item) => item.doc.sumber)),
  ];

  const bagianParagraf: string[] = [
    `${ambilTeks(utama.doc.judul, bahasa)}: ${ambilTeks(utama.doc.teks, bahasa)}`,
  ];
  if (kedua && kedua.skor >= topSkor * 0.56 && kedua.doc.id !== utama.doc.id) {
    bagianParagraf.push(
      ambilTeks(
        {
          id: `Konteks pelengkap (${kedua.doc.judul.id}): ${kedua.doc.teks.id}`,
          en: `Corroborating archive context (${kedua.doc.judul.en}): ${kedua.doc.teks.en}`,
          jw: `Katrangan panyengkuyung (${kedua.doc.judul.jw}): ${kedua.doc.teks.jw}`,
        },
        bahasa,
      ),
    );
  }
  if (ketiga && ketiga.skor >= topSkor * 0.58 && ketiga.doc.id !== utama.doc.id && ketiga.doc.id !== kedua?.doc.id) {
    bagianParagraf.push(
      ambilTeks(
        {
          id: `Sudut kajian tambahan (${ketiga.doc.judul.id}): ${ketiga.doc.teks.id}`,
          en: `Additional perspective (${ketiga.doc.judul.en}): ${ketiga.doc.teks.en}`,
          jw: `Sudhut kajian tambahan (${ketiga.doc.judul.jw}): ${ketiga.doc.teks.jw}`,
        },
        bahasa,
      ),
    );
  }
  const sintesisTeks = hilangkanEmDashAI(bagianParagraf.join('\n\n'));

  const skorKeyakinan = Math.min(99, Math.max(54, Math.round(52 + Math.min(topSkor, 9.5) * 4.9)));

  return {
    jawaban: sintesisTeks,
    sumber: sumberGabungan,
    mode: 'bm25-kurasi-lokal',
    modelNama: MODEL_AI_PAMOMONG,
    statusGrounding: 'terbukti',
    skorKeyakinan,
    kataKunciCocok: [...new Set(buktiPilihan.flatMap((item) => item.cocok))].slice(0, 6),
    latensiMs: selesai(),
    butirBukti: buktiPilihan.map((item) => ({
      id: item.doc.id,
      judul: ambilTeks(item.doc.judul, bahasa),
      kategori: ambilTeks(item.doc.kategori, bahasa),
      kutipan: ambilTeks(item.doc.teks, bahasa),
      sumber: item.doc.sumber,
      skorRelatif: Math.round((item.skor / topSkor) * 100),
    })),
    rujukan: bangunDaftarRujukan(sumberGabungan),
  };
}

/**
 * Alias untuk kompatibilitas endpoint serverless (/api/tanya.ts).
 */
export const jawabLokalDariKurasi = jawabDariKurasiLokal;

export async function tanyakanKeAsisten(
  bendaId: BendaPusaka['id'],
  pertanyaan: string,
  bahasa: BahasaAktif = 'id',
  konteksUnsur?: KonteksUnsurKurasi,
): Promise<HasilTanya> {
  const pemeriksaan = deteksiSeranganAtauLuarTopik(pertanyaan, BATAS_KARAKTER_TANYA);
  if (!pemeriksaan.aman && pemeriksaan.kategori !== 'kosong') {
    return jawabDariKurasiLokal(bendaId, pertanyaan, bahasa);
  }
  const pertanyaanBersih = bersihkanInputPengguna(pertanyaan, BATAS_KARAKTER_TANYA);

  try {
    const resp = await fetch('/api/tanya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bendaId, pertanyaan: pertanyaanBersih, bahasa, konteksUnsur }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as Partial<HasilTanya>;
      if (data && typeof data.jawaban === 'string' && Array.isArray(data.butirBukti)) {
        const audited = auditDanBersihkanOutputAI(rapikanParagrafResponsAI(data.jawaban), {
          minKarakter: 18,
          maxKarakter: 3800,
          wajibJangkarBudaya: data.statusGrounding !== 'luar-korpus',
        });
        if (audited) {
          return {
            ...(data as HasilTanya),
            jawaban: audited,
            mode: data.mode === 'pamomong-live' ? 'pamomong-live' : 'bm25-api-terverifikasi',
            modelNama: MODEL_AI_PAMOMONG,
          };
        }
      }
    }
  } catch {
    // Mode pratinjau statis atau luring: gunakan indeks BM25 & Ensiklopedia Nusantara lokal
  }

  return jawabDariKurasiLokal(bendaId, pertanyaanBersih, bahasa);
}
