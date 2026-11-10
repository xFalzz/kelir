import { describe, it, expect } from 'vitest';
import {
  DAFTAR_BENDA,
  DAFTAR_LISENSI,
  DAFTAR_SUMBER,
  KRONIK_SEJARAH_BUDAYA,
  LAKON_KIJANG_KENCANA,
  ambilTeks,
} from '../../src/content/pusaka';
import { jawabDariKurasiLokal } from '../../src/lib/tanya';

describe('Validasi skema konten kurasi dan sumber (R-17, R-36, R-38)', () => {
  it('setiap benda memiliki sumber dan lisensi yang terdaftar', () => {
    const kodeSumberValid = new Set(DAFTAR_SUMBER.map((s) => s.kode));
    const idLisensiValid = new Set(DAFTAR_LISENSI.map((l) => l.id));

    expect(DAFTAR_BENDA.length).toBeGreaterThanOrEqual(3);

    for (const benda of DAFTAR_BENDA) {
      expect(idLisensiValid.has(benda.lisensiRef)).toBe(true);
      expect(benda.sumber.length).toBeGreaterThan(0);
      for (const s of benda.sumber) {
        expect(kodeSumberValid.has(s)).toBe(true);
      }
      expect(benda.titikInfo.length).toBeGreaterThanOrEqual(4);
      for (const titik of benda.titikInfo) {
        expect(titik.sumber.length).toBeGreaterThan(0);
        for (const ts of titik.sumber) {
          expect(kodeSumberValid.has(ts)).toBe(true);
        }
      }
    }
  });

  it('setiap babak lakon memiliki sumber terverifikasi', () => {
    const kodeSumberValid = new Set(DAFTAR_SUMBER.map((s) => s.kode));
    expect(LAKON_KIJANG_KENCANA.babak.length).toBe(4);
    for (const babak of LAKON_KIJANG_KENCANA.babak) {
      expect(babak.sumber.length).toBeGreaterThan(0);
      for (const s of babak.sumber) {
        expect(kodeSumberValid.has(s)).toBe(true);
      }
    }
  });

  it('ambilTeks mengembalikan Aksara Jawa untuk mode aksara dan status draf untuk Jawa', () => {
    const benda = DAFTAR_BENDA[0];
    const idMode = ambilTeks(benda.nama, 'id');
    const jvMode = ambilTeks(benda.nama, 'jv');
    const aksMode = ambilTeks(benda.nama, 'aksara');

    expect(idMode.status).toBe('ditinjau');
    expect(jvMode.status).toBe('draf');
    expect(aksMode.utama).toContain('ꦝ');
  });

  it('jawabDariKurasiLokal menjawab pertanyaan anatomi dan menolak topik luar cakupan', () => {
    const jwbPamor = jawabDariKurasiLokal('keris', 'Bagaimana pamor terbentuk?');
    expect(jwbPamor.ditemukanDiKurasi).toBe(true);
    expect(jwbPamor.sumberKode).toContain('S1');

    const jwbLuar = jawabDariKurasiLokal('keris', 'Berapa harga saham kripto hari ini?');
    expect(jwbLuar.ditemukanDiKurasi).toBe(false);
    expect(jwbLuar.jawaban).toContain('di luar cakupan');
  });

  it('setiap benda memiliki kronik sejarah ZEGGO (01..05) dan 5 bab scrollytelling 3D Townhouse', () => {
    for (const benda of DAFTAR_BENDA) {
      const kronik = KRONIK_SEJARAH_BUDAYA[benda.id];
      expect(kronik).toBeDefined();
      expect(kronik.nomorIndeks).toMatch(/^0[1-5]$/);
      expect(kronik.metrik.length).toBe(3);
      expect(kronik.linimasaSejarah.length).toBe(3);
      expect(kronik.langkahScroll3D.length).toBe(5);
    }
  });
});
