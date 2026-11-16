import {
  DAFTAR_BENDA,
  DAFTAR_SUMBER,
  KAWRUH_FILOSOFI,
  KRONIK_SEJARAH_BUDAYA,
  LAKON_KIJANG_KENCANA,
  type BendaPusaka,
  type KodeSumber,
} from '../content/pusaka.ts';

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
  mode: 'bm25-kurasi-lokal' | 'bm25-api-terverifikasi';
  statusGrounding: 'terbukti' | 'ringkasan-benda' | 'luar-korpus';
  skorKeyakinan: number;
  kataKunciCocok: string[];
  latensiMs: number;
  butirBukti: ButirBuktiTanya[];
  rujukan: Array<{ kode: KodeSumber; judul: string; lembaga: string }>;
}

interface DokumenKorpus {
  id: string;
  bendaId?: BendaPusaka['id'];
  judul: string;
  kategori: string;
  teks: string;
  sumber: KodeSumber[];
  tokens: string[];
  tf: Map<string, number>;
  teksNormal: string;
}

const STOPWORDS = new Set([
  'apa',
  'mengapa',
  'kenapa',
  'bagaimana',
  'siapa',
  'kapan',
  'dimana',
  'di',
  'ke',
  'dari',
  'yang',
  'dan',
  'pada',
  'untuk',
  'dengan',
  'tentang',
  'ini',
  'itu',
  'atau',
  'dalam',
  'seperti',
  'adalah',
  'agar',
  'secara',
  'juga',
  'oleh',
  'soal',
  'berapa',
  'dapat',
  'bisa',
]);

/** Peta ekspansi sinonim lintas Indonesia-Jawa untuk akurasi temu balik semantik lokal. */
const SINONIM_BUDAYA: Record<string, string[]> = {
  gempa: ['seismik', 'lindhu', 'getaran', 'umpak', 'lentur'],
  seismik: ['gempa', 'getaran', 'umpak'],
  paku: ['purus', 'pasak', 'sambungan', 'konstruksi'],
  purus: ['pasak', 'paku', 'sambungan', 'kayu'],
  pasak: ['purus', 'paku', 'sambungan'],
  pamor: ['nikel', 'meteorit', 'warangan', 'besi', 'tempa', 'wutah'],
  meteorit: ['nikel', 'pamor', 'besi'],
  pandawa: ['luk', 'lima', 'keris', 'kesatria'],
  slendro: ['laras', 'gamelan', 'karawitan', 'gangsa', 'saron', 'perunggu'],
  gamelan: ['slendro', 'saron', 'gangsa', 'karawitan', 'gong'],
  krawangan: ['tatahan', 'wacucal', 'kulit', 'wayang', 'cempurit'],
  blencong: ['pelita', 'minyak', 'lampu', 'bayangan', 'kelir'],
  ramayana: ['rama', 'shinta', 'kidang', 'kencana', 'marica', 'aranya', 'kanda', 'gendewa'],
  kijang: ['kidang', 'kencana', 'marica', 'ramayana'],
  kidang: ['kijang', 'kencana', 'marica'],
  aksara: ['hanacaraka', 'carakan', 'unicode', 'sandhangan', 'pasangan', 'nglegena'],
  hanacaraka: ['aksara', 'carakan', 'unicode', 's7'],
  batik: ['kawung', 'canting', 'malam', 'soga', 'wastra', 'kiblat'],
};

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

  for (const b of DAFTAR_BENDA) {
    for (const t of b.titikInfo) {
      rawDocs.push({
        id: `titik-${t.id}`,
        bendaId: b.id,
        judul: `${b.nama.id} · ${t.judul.id}`,
        kategori: b.kategori.id,
        teks: `${t.judul.id} — ${t.ringkasan.id}`,
        sumber: t.sumber,
      });
    }

    rawDocs.push({
      id: `sejarah-${b.id}`,
      bendaId: b.id,
      judul: `Sejarah & Filosofi ${b.nama.id}`,
      kategori: b.kategori.id,
      teks: `${b.sejarahSingkat.id} Secara filosofis, ${b.filosofi.id}`,
      sumber: b.sumber,
    });
  }

  for (const bab of LAKON_KIJANG_KENCANA.daftarBabak) {
    rawDocs.push({
      id: `lakon-${bab.id}`,
      bendaId: 'wayang',
      judul: `${bab.judul.id} (${bab.lokasi.id})`,
      kategori: 'Pakeliran Ramayana',
      teks: `${bab.narasiDalang.id} ${bab.suluk}`,
      sumber: bab.sumber,
    });
  }

  for (const k of KAWRUH_FILOSOFI) {
    rawDocs.push({
      id: `kawruh-${k.id}`,
      judul: `Kawruh ${k.istilah}: ${k.judul.id}`,
      kategori: 'Filsafat Kebudayaan Jawa',
      teks: `${k.makna.id} ${k.keterkaitan.id}`,
      sumber: k.sumber,
    });
  }

  for (const kr of KRONIK_SEJARAH_BUDAYA) {
    rawDocs.push({
      id: `kronik-${kr.nomor}`,
      bendaId: kr.bendaId,
      judul: `Kronik ${kr.nomor} · ${kr.judul.id}`,
      kategori: kr.kodeArsip,
      teks: `${kr.sorotan.id} ${kr.narasiMendalam.id}`,
      sumber: kr.sumber,
    });
  }

  for (const s of Object.values(DAFTAR_SUMBER)) {
    rawDocs.push({
      id: `sumber-${s.kode}`,
      judul: `${s.kode} · ${s.judul}`,
      kategori: s.lembaga,
      teks: s.ringkasan,
      sumber: [s.kode],
    });
  }

  const df = new Map<string, number>();
  let totalLen = 0;

  const docs: DokumenKorpus[] = rawDocs.map((d) => {
    const gabungan = `${d.judul} ${d.kategori} ${d.teks}`;
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

const KORPUS_INDEKS = buatDokumenKorpus();
const BM25_K1 = 1.4;
const BM25_B = 0.65;
const AMBANG_ABSTAIN_BM25 = 0.85;

/**
 * Mesin retrieval BM25 + ekspansi sinonim budaya & guard halusinasi terikat sumber S1-S7.
 */
export function jawabDariKurasiLokal(bendaId: BendaPusaka['id'], pertanyaanRaw: string): HasilTanya {
  const mulai = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const benda = DAFTAR_BENDA.find((item) => item.id === bendaId) ?? DAFTAR_BENDA[0];
  const pertanyaan = pertanyaanRaw.trim();
  const selesai = () =>
    Math.max(0.2, Number((((typeof performance !== 'undefined' ? performance.now() : Date.now()) - mulai)).toFixed(2)));

  if (!pertanyaan) {
    return {
      jawaban: `${benda.nama.id} (${benda.subjudul.id}): ${benda.ringkas.id} ${benda.filosofi.id}`,
      sumber: benda.sumber,
      mode: 'bm25-kurasi-lokal',
      statusGrounding: 'ringkasan-benda',
      skorKeyakinan: 92,
      kataKunciCocok: [benda.id],
      latensiMs: selesai(),
      butirBukti: [
        {
          id: `ringkas-${benda.id}`,
          judul: `${benda.nama.id} · Ringkasan Kuratorial`,
          kategori: benda.kategori.id,
          kutipan: benda.sejarahSingkat.id,
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

  for (const doc of KORPUS_INDEKS.docs) {
    let skor = 0;
    const cocokSet = new Set<string>();
    const dl = doc.tokens.length;

    for (const term of semuaToken) {
      const termFreq = doc.tf.get(term) ?? 0;
      const w = bobot.get(term) ?? 1;
      if (termFreq > 0) {
        const idf = KORPUS_INDEKS.idf.get(term) ?? 1.0;
        const tfNorm = (termFreq * (BM25_K1 + 1)) / (termFreq + BM25_K1 * (1 - BM25_B + BM25_B * (dl / KORPUS_INDEKS.avgDocLen)));
        skor += idf * tfNorm * w;
        cocokSet.add(term);
      } else if (term.length >= 4 && doc.teksNormal.includes(term)) {
        // Kecocokan morfologi prefiks/infiks bahasa Jawa-Indonesia
        const idf = KORPUS_INDEKS.idf.get(term) ?? 0.9;
        skor += idf * 0.48 * w;
        cocokSet.add(term);
      }
    }

    if (skor > 0) {
      if (kueriNormal.length > 5 && doc.teksNormal.includes(kueriNormal)) {
        skor += 2.2;
      }
      // Bonus konteks halus hanya jika ada kecocokan substansial, bukan pemicu halusinasi
      if (doc.bendaId === benda.id) {
        skor += 0.35;
      }
      terperingkat.push({ doc, skor, cocok: [...cocokSet] });
    }
  }

  terperingkat.sort((a, b) => b.skor - a.skor);

  if (terperingkat.length === 0 || terperingkat[0].skor < AMBANG_ABSTAIN_BM25) {
    return {
      jawaban: `Pertanyaan "${pertanyaan}" berada di luar cakupan korpus terverifikasi S1–S7. Untuk menjaga akurasi tanpa halusinasi, ajukan topik seputar Keris, Gamelan Saron, Batik Kawung, Pendopo Joglo, Lakon Wayang Kulit, atau Aksara Hanacaraka.`,
      sumber: benda.sumber,
      mode: 'bm25-kurasi-lokal',
      statusGrounding: 'luar-korpus',
      skorKeyakinan: 0,
      kataKunciCocok: [],
      latensiMs: selesai(),
      butirBukti: [],
      rujukan: bangunDaftarRujukan(benda.sumber),
    };
  }

  const topSkor = terperingkat[0].skor;
  const buktiPilihan = terperingkat.slice(0, 3);
  const utama = buktiPilihan[0];
  const kedua = buktiPilihan[1];

  const sumberGabungan: KodeSumber[] = [
    ...new Set(buktiPilihan.flatMap((item) => item.doc.sumber)),
  ];

  // Sintesis terstruktur 1-2 bukti terkuat bila bukti kedua juga sangat relevan
  const sintesisTeks =
    kedua && kedua.skor >= topSkor * 0.62 && kedua.doc.id !== utama.doc.id
      ? `${utama.doc.judul}: ${utama.doc.teks}\n\nKonteks penguat dari arsip ${kedua.doc.judul}: ${kedua.doc.teks}`
      : `${utama.doc.judul}: ${utama.doc.teks}`;

  const skorKeyakinan = Math.min(99, Math.max(54, Math.round(52 + Math.min(topSkor, 9.5) * 4.9)));

  return {
    jawaban: sintesisTeks,
    sumber: sumberGabungan,
    mode: 'bm25-kurasi-lokal',
    statusGrounding: 'terbukti',
    skorKeyakinan,
    kataKunciCocok: [...new Set(buktiPilihan.flatMap((item) => item.cocok))].slice(0, 6),
    latensiMs: selesai(),
    butirBukti: buktiPilihan.map((item) => ({
      id: item.doc.id,
      judul: item.doc.judul,
      kategori: item.doc.kategori,
      kutipan: item.doc.teks,
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
): Promise<HasilTanya> {
  try {
    const resp = await fetch('/api/tanya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bendaId, pertanyaan }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as HasilTanya;
      if (data && typeof data.jawaban === 'string' && Array.isArray(data.butirBukti)) {
        return { ...data, mode: 'bm25-api-terverifikasi' };
      }
    }
  } catch {
    // Mode pratinjau statis atau luring: gunakan indeks BM25 lokal langsung
  }

  return jawabDariKurasiLokal(bendaId, pertanyaan);
}
