import {
  DAFTAR_BENDA,
  DAFTAR_SUMBER,
  LAKON_KIJANG_KENCANA,
  type BendaPusaka,
} from '../content/pusaka.ts';

export interface JawabanTanya {
  jawaban: string;
  sumberKode: string[];
  modePenyedia: 'gemini' | 'meta' | 'kurasi-lokal';
  ditemukanDiKurasi: boolean;
}

export const CONTOH_PERTANYAAN: Record<BendaPusaka['id'], string[]> = {
  keris: [
    'Apa perbedaan fungsi wilah, ganja, dan warangka pada keris?',
    'Bagaimana motif pamor pada bilah keris terbentuk?',
    'Kapan keris Indonesia diakui oleh UNESCO?',
  ],
  saron: [
    'Apa fungsi rancakan dan tabuh pada instrumen saron gamelan?',
    'Bagaimana teknik menabuh saron agar dengung bilah tidak bertabrakan?',
    'Kapan gamelan Indonesia ditetapkan oleh UNESCO?',
  ],
  batik: [
    'Apa fungsi nyamplungan dan cucuk pada canting tulis tembaga?',
    'Mengapa malam (lilin batik) dapat merintang warna pada kain mori?',
    'Kapan Batik Indonesia ditetapkan oleh UNESCO?',
  ],
  joglo: [
    'Apa fungsi empat tiang Saka Guru dan konstruksi Tumpang Sari pada Joglo?',
    'Mengapa umpak batu andesit membuat bangunan Joglo tahan guncangan gempa?',
    'Apa perbedaan atap Brunjung dan Penanggap pada arsitektur Joglo Jawa?',
  ],
  wayang: [
    'Apa fungsi Gunungan (Kayon) dalam pembabakan pertunjukan wayang?',
    'Apa perbedaan fungsi cempurit (gapit) dan tuding pada wayang?',
    'Apa peran Marica sebagai Kijang Kencana dalam lakon Ramayana?',
  ],
};

// Pencocokan fakta deterministik dari basis data kurasi agar aplikasi tetap menjawab akurat
// meskipun tanpa kunci API eksternal atau saat koneksi internet terputus.
export function jawabDariKurasiLokal(
  bendaId: BendaPusaka['id'],
  pertanyaanRaw: string,
): JawabanTanya {
  const q = pertanyaanRaw.toLowerCase().trim();
  const benda = DAFTAR_BENDA.find((b) => b.id === bendaId) ?? DAFTAR_BENDA[0];

  const topikDiluarCakupan =
    /harga|jual|beli|toko|ramalan|jodoh|politik|presiden|saham|kripto|resep|masak|cuaca|bola/.test(q);
  if (topikDiluarCakupan) {
    return {
      jawaban:
        'Informasi tersebut berada di luar cakupan teks kurasi Kelir. Asisten ini hanya menjawab pertanyaan mengenai struktur warisan budaya Jawa (Keris, Saron Gamelan, Batik Tulis, Arsitektur Joglo, Wayang & Gunungan), lakon Kijang Kencana, dan sumber pustaka yang tercatat.',
      sumberKode: benda.sumber,
      modePenyedia: 'kurasi-lokal',
      ditemukanDiKurasi: false,
    };
  }

  if (/unesco|tahun|diakui|ditetapkan|berkas/.test(q)) {
    return {
      jawaban: `${benda.nama.id} tercatat pada daftar Warisan Budaya Takbenda UNESCO tahun ${benda.tahunUnesco} (nomor berkas ${benda.berkasUnesco}). ${benda.ringkasan.id}`,
      sumberKode: benda.sumber,
      modePenyedia: 'kurasi-lokal',
      ditemukanDiKurasi: true,
    };
  }

  if (/kijang|kidang|marica|rama|sinta|laksmana|rahwana|dandaka|ramayana|lakon/.test(q)) {
    const ringkasanBabak = LAKON_KIJANG_KENCANA.babak
      .map((b) => `${b.judul.id}: ${b.narasi.id}`)
      .join(' ');
    return {
      jawaban: `Dalam ${LAKON_KIJANG_KENCANA.judul.id} (${LAKON_KIJANG_KENCANA.eposAsal}): ${ringkasanBabak}`,
      sumberKode: LAKON_KIJANG_KENCANA.sumber,
      modePenyedia: 'kurasi-lokal',
      ditemukanDiKurasi: true,
    };
  }

  if (/museum|sonobudoyo|yogyakarta|jogja|lokasi/.test(q)) {
    const s4 = DAFTAR_SUMBER.find((s) => s.kode === 'S4');
    return {
      jawaban:
        s4?.ringkasan ??
        'Koleksi rujukan keris, gamelan, dan wayang kulit purwa didokumentasikan di Museum Negeri Sonobudoyo Yogyakarta.',
      sumberKode: ['S4'],
      modePenyedia: 'kurasi-lokal',
      ditemukanDiKurasi: true,
    };
  }

  // Periksa kecocokan dengan titik info spesifik pada seluruh benda
  for (const b of [benda, ...DAFTAR_BENDA.filter((x) => x.id !== benda.id)]) {
    for (const titik of b.titikInfo) {
      const kataKunci = [
        titik.id.toLowerCase(),
        ...titik.label.id.toLowerCase().split(/[^a-z0-9]+/),
      ].filter((k) => k.length >= 3);
      if (kataKunci.some((k) => q.includes(k))) {
        return {
          jawaban: `${titik.label.id} pada ${b.nama.id}: ${titik.uraian.id}`,
          sumberKode: titik.sumber,
          modePenyedia: 'kurasi-lokal',
          ditemukanDiKurasi: true,
        };
      }
    }
  }

  // Jika menanyakan fungsi/bagian benda secara umum
  if (/bagian|struktur|anatomi|fungsi|apa itu|jelaskan|komponen|perbedaan/.test(q)) {
    const bagianStr = benda.titikInfo
      .map((t) => `${t.label.id}: ${t.uraian.id}`)
      .join(' ');
    return {
      jawaban: `${benda.ringkasan.id} Bagian-bagian utamanya meliputi: ${bagianStr}`,
      sumberKode: benda.sumber,
      modePenyedia: 'kurasi-lokal',
      ditemukanDiKurasi: true,
    };
  }

  return {
    jawaban: `Pertanyaan Anda belum tercakup secara spesifik di dalam teks kurasi ${benda.nama.id}. Sesuai aturan anti-halusinasi Kelir, kami tidak menebak di luar sumber. Ringkasan yang terverifikasi untuk ${benda.nama.id}: ${benda.ringkasan.id}`,
    sumberKode: benda.sumber,
    modePenyedia: 'kurasi-lokal',
    ditemukanDiKurasi: false,
  };
}

export async function tanyakanKeAsisten(
  bendaId: BendaPusaka['id'],
  pertanyaan: string,
): Promise<JawabanTanya> {
  const bersih = pertanyaan.trim().slice(0, 280);
  if (!bersih) {
    throw new Error('Tuliskan pertanyaan terlebih dahulu sebelum mengirim.');
  }

  try {
    const resp = await fetch('/api/tanya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bendaId, pertanyaan: bersih }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as Partial<JawabanTanya>;
      if (data && typeof data.jawaban === 'string' && Array.isArray(data.sumberKode)) {
        return {
          jawaban: data.jawaban,
          sumberKode: data.sumberKode,
          modePenyedia: data.modePenyedia ?? 'kurasi-lokal',
          ditemukanDiKurasi: Boolean(data.ditemukanDiKurasi),
        };
      }
    }
  } catch {
    // Gunakan mesin pencocokan kurasi lokal bila endpoint serverless tidak aktif atau gagal.
  }

  return jawabDariKurasiLokal(bendaId, bersih);
}
