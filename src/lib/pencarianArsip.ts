import {
  DAFTAR_BEDAH_TWIN,
  DAFTAR_SUMBER,
  DINDING_MATRIX,
  KOLEKSI_COVERFLOW,
  LAKON_KIJANG_KENCANA,
  ambilTeks,
  type BahasaAktif,
  type KodeSumber,
  type SpesimenBedahId,
} from '../content/pusaka.ts';
import { DAFTAR_CARAKAN, type KartuCarakan } from './aksara.ts';

export type KategoriPencarian =
  | 'semua'
  | 'pusaka'
  | 'anatomi'
  | 'pakeliran'
  | 'aksara'
  | 'pustaka';

export type AksiNavigasiPencarian =
  | { jenis: 'twin'; bendaId: SpesimenBedahId; titikId?: string }
  | { jenis: 'suluk'; trackIdx: number }
  | { jenis: 'pakeliran'; babakIdx: number }
  | { jenis: 'kawruh-aksara'; carakanLatin: string }
  | { jenis: 'kawruh-pustaka' };

export interface ItemPencarianArsip {
  id: string;
  kategori: Exclude<KategoriPencarian, 'semua'>;
  judul: string;
  subjudul: string;
  meta: string;
  aksara?: string;
  sumber: KodeSumber[];
  kataKunci: string;
  aksi: AksiNavigasiPencarian;
}

export interface JejakKurasi {
  spesimenDiteliti: SpesimenBedahId[];
  sulukDidengar: SpesimenBedahId[];
  babakPakeliran: number[];
  favoritIds: SpesimenBedahId[];
  skorKuisTertinggi: number;
}

const JEJAK_STORAGE_KEY = 'kelir_jejak_v1';

export function jejakKurasiKosong(): JejakKurasi {
  return {
    spesimenDiteliti: [],
    sulukDidengar: [],
    babakPakeliran: [],
    favoritIds: [],
    skorKuisTertinggi: 0,
  };
}

/** Membaca progres eksplorasi kurasi dari localStorage dengan aman. */
export function bacaJejakKurasi(): JejakKurasi {
  if (typeof window === 'undefined') return jejakKurasiKosong();
  try {
    const raw = window.localStorage.getItem(JEJAK_STORAGE_KEY);
    if (!raw) return jejakKurasiKosong();
    const parsed = JSON.parse(raw) as Partial<JejakKurasi>;
    return {
      spesimenDiteliti: Array.isArray(parsed.spesimenDiteliti) ? parsed.spesimenDiteliti : [],
      sulukDidengar: Array.isArray(parsed.sulukDidengar) ? parsed.sulukDidengar : [],
      babakPakeliran: Array.isArray(parsed.babakPakeliran) ? parsed.babakPakeliran : [],
      favoritIds: Array.isArray(parsed.favoritIds) ? parsed.favoritIds : [],
      skorKuisTertinggi:
        typeof parsed.skorKuisTertinggi === 'number' ? parsed.skorKuisTertinggi : 0,
    };
  } catch {
    return jejakKurasiKosong();
  }
}

/** Menyimpan progres eksplorasi kurasi ke localStorage secara idempoten. */
export function simpanJejakKurasi(jejak: JejakKurasi): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(JEJAK_STORAGE_KEY, JSON.stringify(jejak));
  } catch {
    // Abaikan kuota penuh atau mode privat peramban
  }
}

/** Membangun indeks pencarian lintas halaman sesuai bahasa UI aktif. */
export function bangunIndeksPencarian(bahasa: BahasaAktif): ItemPencarianArsip[] {
  const hasil: ItemPencarianArsip[] = [];

  for (const b of DAFTAR_BEDAH_TWIN) {
    const nama = ambilTeks(b.nama, bahasa);
    const subjudul = ambilTeks(b.subjudul, bahasa);
    const kat = ambilTeks(b.kategori, bahasa);
    const ringkas = ambilTeks(b.ringkas, bahasa);
    const namaSemua = `${b.nama.id} ${b.nama.en} ${b.nama.jw} ${b.subjudul.id} ${b.subjudul.en}`;

    hasil.push({
      id: `pusaka-${b.id}`,
      kategori: 'pusaka',
      judul: nama,
      subjudul,
      meta: `${b.nomorUrut} · ${kat} · ${b.sumber.join(', ')}`,
      aksara: b.aksara,
      sumber: b.sumber,
      kataKunci: `${b.id} ${nama} ${namaSemua} ${kat} ${ringkas} ${b.sumber.join(' ')}`.toLowerCase(),
      aksi: { jenis: 'twin', bendaId: b.id, titikId: b.titikInfo[0]?.id },
    });

    for (const t of b.titikInfo) {
      const judulTitik = ambilTeks(t.judul, bahasa);
      const ringkasanTitik = ambilTeks(t.ringkasan, bahasa);
      const matTitik = t.material ? ambilTeks(t.material, bahasa) : '';
      hasil.push({
        id: `anatomi-${b.id}-${t.id}`,
        kategori: 'anatomi',
        judul: judulTitik,
        subjudul: `${nama} · ${ringkasanTitik}`,
        meta: `${t.sumber.join(', ')}`,
        sumber: t.sumber,
        kataKunci:
          `${t.id} ${judulTitik} ${t.judul.id} ${t.judul.en} ${matTitik} ${ringkasanTitik} ${nama}`.toLowerCase(),
        aksi: { jenis: 'twin', bendaId: b.id, titikId: t.id },
      });
    }
  }

  KOLEKSI_COVERFLOW.forEach((cf, idx) => {
    const namaCf = ambilTeks(cf.nama, bahasa);
    const judulSuluk = ambilTeks(cf.jenisSuluk, bahasa);
    const laras = ambilTeks(cf.larasPathet, bahasa);
    hasil.push({
      id: `suluk-${cf.artefakId}`,
      kategori: 'pusaka',
      judul: `${namaCf} · ${judulSuluk}`,
      subjudul: `${laras} · ${ambilTeks(cf.instrumenPengiring, bahasa)}`,
      meta: `${cf.kodeArsip} · SULUK`,
      aksara: cf.aksara,
      sumber: cf.sumber,
      kataKunci:
        `suluk ${cf.artefakId} ${namaCf} ${judulSuluk} ${laras} ${cf.kodeArsip}`.toLowerCase(),
      aksi: { jenis: 'suluk', trackIdx: idx },
    });
  });

  for (const m of DINDING_MATRIX) {
    const labelM = ambilTeks(m.label, bahasa);
    const subM = ambilTeks(m.sub, bahasa);
    hasil.push({
      id: `matrix-${m.id}`,
      kategori: 'anatomi',
      judul: labelM,
      subjudul: subM,
      meta: `${m.kodeArsip} · ${ambilTeks(m.spesifikasi, bahasa)}`,
      aksara: m.aksara,
      sumber: [],
      kataKunci: `${m.id} ${labelM} ${subM} ${m.kodeArsip}`.toLowerCase(),
      aksi:
        m.halamanTarget === 'pakeliran'
          ? { jenis: 'pakeliran', babakIdx: 0 }
          : m.halamanTarget === 'kawruh'
            ? { jenis: 'kawruh-aksara', carakanLatin: 'ha' }
            : { jenis: 'twin', bendaId: m.bendaId ?? 'keris', titikId: m.titikId },
    });
  }

  LAKON_KIJANG_KENCANA.daftarBabak.forEach((bab, idx) => {
    const jBab = ambilTeks(bab.judul, bahasa);
    const loc = ambilTeks(bab.lokasi, bahasa);
    hasil.push({
      id: `pakeliran-babak-${bab.id}`,
      kategori: 'pakeliran',
      judul: `${String(bab.nomor).padStart(2, '0')} · ${jBab}`,
      subjudul: `${loc} · ${ambilTeks(bab.narasiDalang, bahasa)}`,
      meta: `${bab.sumber.join(', ')} · RAMAYANA`,
      sumber: bab.sumber,
      kataKunci:
        `pakeliran ramayana babak ${bab.nomor} ${jBab} ${bab.judul.id} ${bab.judul.en} ${loc}`.toLowerCase(),
      aksi: { jenis: 'pakeliran', babakIdx: idx },
    });
  });

  for (const c of DAFTAR_CARAKAN) {
    const arti = ambilTeks(c.artiContoh, bahasa);
    hasil.push({
      id: `carakan-${c.latin}`,
      kategori: 'aksara',
      judul: `${c.latin.toUpperCase()} (${c.aksara}) · ${c.contohKata}`,
      subjudul: `${c.contohAksara} · ${arti}`,
      meta: 'HANACARAKA U+A980 · S7',
      aksara: c.aksara,
      sumber: ['S7'],
      kataKunci: `aksara hanacaraka ${c.latin} ${c.lafal} ${c.contohKata} ${arti}`.toLowerCase(),
      aksi: { jenis: 'kawruh-aksara', carakanLatin: c.latin },
    });
  }

  (Object.keys(DAFTAR_SUMBER) as KodeSumber[]).forEach((kode) => {
    const s = DAFTAR_SUMBER[kode];
    hasil.push({
      id: `pustaka-${kode}`,
      kategori: 'pustaka',
      judul: `${s.kode} · ${s.judul}`,
      subjudul: `${s.lembaga} (${s.tahun}) · ${ambilTeks(s.ringkasan, bahasa)}`,
      meta: s.lembaga,
      sumber: [s.kode],
      kataKunci: `${s.kode} ${s.judul} ${s.lembaga} ${s.tahun} ${s.ringkasan.id} ${s.ringkasan.en}`.toLowerCase(),
      aksi: { jenis: 'kawruh-pustaka' },
    });
  });

  return hasil;
}

/** Menyaring dan mengurutkan entri indeks berdasarkan kueri serta kategori. */
export function cariDalamArsip(
  indeks: ItemPencarianArsip[],
  kueri: string,
  kategori: KategoriPencarian = 'semua',
  batas = 18,
): ItemPencarianArsip[] {
  const tersegmentasi = kategori === 'semua' ? indeks : indeks.filter((it) => it.kategori === kategori);
  const q = kueri.trim().toLowerCase();
  if (!q) return tersegmentasi.slice(0, batas);

  const token = q.split(/\s+/).filter(Boolean);
  const scored: Array<{ item: ItemPencarianArsip; skor: number }> = [];

  for (const item of tersegmentasi) {
    const judulLower = item.judul.toLowerCase();
    const gabungan = `${judulLower} ${item.subjudul.toLowerCase()} ${item.kataKunci}`;
    let cocokSemua = true;
    let skor = 0;

    for (const t of token) {
      if (!gabungan.includes(t)) {
        cocokSemua = false;
        break;
      }
      if (judulLower.startsWith(t)) skor += 8;
      else if (judulLower.includes(t)) skor += 5;
      else skor += 2;
    }

    if (cocokSemua) {
      if (item.kategori === 'pusaka') skor += 2;
      scored.push({ item, skor });
    }
  }

  scored.sort((a, b) => b.skor - a.skor);
  return scored.slice(0, batas).map((s) => s.item);
}

/** Mencari objek KartuCarakan berdasarkan huruf latinnya. */
export function temukanCarakanByLatin(latin: string): KartuCarakan | undefined {
  return DAFTAR_CARAKAN.find((c) => c.latin.toLowerCase() === latin.toLowerCase());
}
