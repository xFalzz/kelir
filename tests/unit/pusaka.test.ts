import { describe, expect, it } from 'vitest';
import {
  DAFTAR_BEDAH_TWIN,
  DAFTAR_BENDA,
  DAFTAR_SUMBER,
  DINDING_MATRIX,
  KOLEKSI_COVERFLOW,
  KOLEKSI_ETALASE,
  KRONIK_SEJARAH_BUDAYA,
  LAKON_KIJANG_KENCANA,
  ambilTeks,
} from '../../src/content/pusaka.ts';
import { jawabDariKurasiLokal } from '../../src/lib/tanya.ts';

describe('Kurasi Pusaka, Kronik & Asisten BM25 Terikat Sumber S1-S7', () => {
  it('memuat tepat 5 pusaka utama dengan koordinat titikInfo valid', () => {
    expect(DAFTAR_BENDA).toHaveLength(5);
    expect(KRONIK_SEJARAH_BUDAYA).toHaveLength(5);
    for (const b of DAFTAR_BENDA) {
      expect(b.titikInfo.length).toBeGreaterThanOrEqual(3);
      expect(b.sulukLarik.length).toBeGreaterThanOrEqual(5);
      for (const s of b.sumber) {
        expect(DAFTAR_SUMBER[s]).toBeDefined();
      }
    }
  });

  it('memuat 4 babak epik Kijang Kencana serta etalase dan dinding matriks berkode arsip bebas domain .id', () => {
    expect(LAKON_KIJANG_KENCANA.daftarBabak).toHaveLength(4);
    expect(KOLEKSI_ETALASE.length).toBeGreaterThanOrEqual(6);
    expect(DINDING_MATRIX.length).toBe(12);
    for (const plate of DINDING_MATRIX) {
      expect(plate.kodeArsip).toMatch(/^KLR-\d{2}/);
      expect(plate.aksara.length).toBeGreaterThan(0);
      expect(plate.sub).not.toContain('.id');
      expect(plate.spesifikasi).not.toContain('.id');
      if (plate.halamanTarget && plate.halamanTarget !== 'twin') {
        expect(plate.halamanTarget).toBe('kawruh');
        expect(plate.anchorTarget).toBe('aksara');
      } else {
        const benda = DAFTAR_BENDA.find((b) => b.id === plate.bendaId);
        expect(benda).toBeDefined();
        expect(benda?.titikInfo.some((t) => t.id === plate.titikId)).toBe(true);
      }
    }
    for (const item of KOLEKSI_ETALASE) {
      expect(item.kodeArsip).toMatch(/^KLR-\d{2}/);
      expect(item.spesifikasi).not.toContain('.id');
      expect(item.subjudul).not.toContain('.id');
      if (item.halamanTarget && item.halamanTarget !== 'twin') {
        expect(item.halamanTarget).toBe('pakeliran');
      } else {
        const benda = DAFTAR_BENDA.find((b) => b.id === item.bendaId);
        expect(benda).toBeDefined();
        expect(benda?.titikInfo.some((t) => t.id === item.titikId)).toBe(true);
      }
    }
    for (const b of DAFTAR_BENDA) {
      expect(b.zonaKode).not.toContain('.id');
      expect(b.spesifikasiKurasi.length).toBeGreaterThanOrEqual(3);
    }
    for (const k of KRONIK_SEJARAH_BUDAYA) {
      expect(k.kodeArsip).not.toContain('.id');
    }
  });

  it('memuat 7 koleksi Coverflow 3D lengkap termasuk Kidang & Blencong serta Prasasti Hanacaraka U+A980', () => {
    expect(KOLEKSI_COVERFLOW).toHaveLength(7);
    expect(KOLEKSI_COVERFLOW.map((c) => c.id)).toContain('cf-kidang');
    expect(KOLEKSI_COVERFLOW.map((c) => c.id)).toContain('cf-hanacaraka');
    for (const item of KOLEKSI_COVERFLOW) {
      expect(item.metrikKurasi).toHaveLength(4);
      expect(item.anatomiKritis.length).toBeGreaterThanOrEqual(4);
      for (const part of item.anatomiKritis) {
        expect(part.titikId && part.titikId.length > 3).toBe(true);
        expect(part.material && ambilTeks(part.material, 'id').length > 5).toBe(true);
        expect(part.material && ambilTeks(part.material, 'en').length > 5).toBe(true);
        expect(part.fungsiTeknis && ambilTeks(part.fungsiTeknis, 'id').length > 5).toBe(true);
        expect(part.fungsiTeknis && ambilTeks(part.fungsiTeknis, 'en').length > 5).toBe(true);
      }
      expect(item.sulukLarik.length).toBeGreaterThanOrEqual(5);
      expect(ambilTeks(item.jenisSuluk, 'id').length).toBeGreaterThan(8);
      expect(ambilTeks(item.jenisSuluk, 'en').length).toBeGreaterThan(8);
      expect(item.larasPathet).toContain('Slendro');
      expect(item.catatanDalang.id.length).toBeGreaterThan(25);
      expect(item.catatanDalang.en.length).toBeGreaterThan(25);
      expect(item.catatanDalang.jw.length).toBeGreaterThan(20);
      expect(item.kodeArsip).not.toContain('.id');
      expect(item.penjelasanLengkap.id.length).toBeGreaterThan(80);
      expect(item.penjelasanLengkap.en.length).toBeGreaterThan(80);
      for (const s of item.sumber) {
        expect(DAFTAR_SUMBER[s]).toBeDefined();
      }
    }
  });

  it('memuat 7 spesimen Digital Twin Bedah 3D beranatomi teknis lengkap S1-S7', () => {
    expect(DAFTAR_BEDAH_TWIN).toHaveLength(7);
    expect(DAFTAR_BEDAH_TWIN.map((s) => s.id)).toEqual([
      'keris',
      'saron',
      'batik',
      'joglo',
      'wayang',
      'kidang',
      'hanacaraka',
    ]);
    for (const sp of DAFTAR_BEDAH_TWIN) {
      expect(sp.titikInfo.length).toBeGreaterThanOrEqual(4);
      expect(sp.parameterCad?.length).toBeGreaterThanOrEqual(3);
      expect(sp.zonaKode).not.toContain('.id');
      for (const t of sp.titikInfo) {
        expect(t.material && ambilTeks(t.material, 'id').length > 5).toBe(true);
        expect(t.material && ambilTeks(t.material, 'en').length > 5).toBe(true);
        expect(t.fungsiTeknis && ambilTeks(t.fungsiTeknis, 'id').length > 5).toBe(true);
        expect(t.fungsiTeknis && ambilTeks(t.fungsiTeknis, 'en').length > 5).toBe(true);
        for (const s of t.sumber) {
          expect(DAFTAR_SUMBER[s]).toBeDefined();
        }
      }
    }
  });

  it('mesin BM25 menemukan bukti terkalibrasi dan ekspansi sinonim lintas bahasa', () => {
    const resKeris = jawabDariKurasiLokal('keris', 'Mengapa Keris Luk 5 bermakna Pandawa?');
    expect(resKeris.statusGrounding).toBe('terbukti');
    expect(resKeris.sumber).toContain('S1');
    expect(resKeris.butirBukti.length).toBeGreaterThanOrEqual(1);
    expect(resKeris.skorKeyakinan).toBeGreaterThanOrEqual(60);

    const resGempaJoglo = jawabDariKurasiLokal('joglo', 'Mengapa Joglo tahan getaran lindhu gempa?');
    expect(resGempaJoglo.statusGrounding).toBe('terbukti');
    expect(resGempaJoglo.sumber).toContain('S6');
    expect(resGempaJoglo.jawaban.toLowerCase()).toMatch(/umpak|seismik|saka guru/);

    const resWayang = jawabDariKurasiLokal('wayang', 'Siapa Kijang Kencana dalam Ramayana?');
    expect(resWayang.sumber.some((s) => s === 'S3' || s === 'S5')).toBe(true);
  });

  it('menjaga integritas tanpa halusinasi pada pertanyaan di luar korpus S1-S7', () => {
    const resOod = jawabDariKurasiLokal('keris', 'Berapa kurs saham teknologi Nasdaq kemarin?');
    expect(resOod.statusGrounding).toBe('luar-korpus');
    expect(resOod.skorKeyakinan).toBe(0);
    expect(resOod.butirBukti).toHaveLength(0);
  });
});
