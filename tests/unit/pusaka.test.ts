import { describe, expect, it } from 'vitest';
import {
  DAFTAR_BENDA,
  DAFTAR_SUMBER,
  DINDING_MATRIX,
  KOLEKSI_ETALASE,
  KRONIK_SEJARAH_BUDAYA,
  LAKON_KIJANG_KENCANA,
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
    }
    for (const item of KOLEKSI_ETALASE) {
      expect(item.kodeArsip).toMatch(/^KLR-\d{2}/);
      expect(item.spesifikasi).not.toContain('.id');
      expect(item.subjudul).not.toContain('.id');
    }
    for (const b of DAFTAR_BENDA) {
      expect(b.zonaKode).not.toContain('.id');
      expect(b.spesifikasiKurasi.length).toBeGreaterThanOrEqual(3);
    }
    for (const k of KRONIK_SEJARAH_BUDAYA) {
      expect(k.kodeArsip).not.toContain('.id');
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
