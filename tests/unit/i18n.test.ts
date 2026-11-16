import { describe, expect, it } from 'vitest';
import {
  DAFTAR_BENDA,
  DAFTAR_BEDAH_TWIN,
  KOLEKSI_COVERFLOW,
  KRONIK_SEJARAH_BUDAYA,
  ambilTeks,
} from '../../src/content/pusaka.ts';
import { DAFTAR_CARAKAN, konversiTeksKeAksaraAman } from '../../src/lib/aksara.ts';
import { DAFTAR_BAHASA, setI18nLanguage, tI18n } from '../../src/lib/i18n.ts';
import { jawabDariKurasiLokal } from '../../src/lib/tanya.ts';

describe('Mesin i18next, Empat Bahasa Resmi & RAG Lintas Bahasa', () => {
  it('mendukung 4 bahasa lengkap ID, EN, JW, AKS beserta terjemahan interpolasi i18next', () => {
    expect(DAFTAR_BAHASA.map((b) => b.id)).toEqual(['id', 'en', 'jw', 'aks']);

    expect(tI18n('id', 'hero.h1')).toContain('Menembus');
    expect(tI18n('en', 'hero.h1')).toContain('Entering');
    expect(tI18n('jw', 'hero.h1')).toContain('Nlusuri');
    expect(tI18n('aks', 'hero.h1')).toMatch(/[\uA980-\uA9DF]/);

    expect(
      tI18n('en', 'sulukModal.headMeta', {
        nomor: '01',
        total: 7,
        larik: 2,
        max: 5,
        src: 'S1',
      }),
    ).toContain('ITEM 01 OF 07');

    setI18nLanguage('en');
    expect(tI18n('id', 'nav.ctaTwin')).toBe('Bedah 3D');
    expect(tI18n('en', 'nav.ctaTwin')).toBe('3D Studio');
    setI18nLanguage('id');
  });

  it('mempertahankan kode teknis (S1-S7, U+A980, 3D, CAD) ketika teks diubah ke Aksara Jawa', () => {
    const out = konversiTeksKeAksaraAman('Studi S1-S7 CAD 3D Unicode U+A980 pusaka jawa');
    expect(out).toContain('S1-S7');
    expect(out).toContain('CAD');
    expect(out).toContain('3D');
    expect(out).toContain('U+A980');
    expect(out).toMatch(/[\uA980-\uA9DF]/);
  });

  it('melengkapi padanan terjemahan ID, EN, JW pada seluruh spesimen, coverflow, kronik & carakan', () => {
    for (const b of DAFTAR_BENDA) {
      expect(ambilTeks(b.nama, 'en').length).toBeGreaterThan(3);
      expect(ambilTeks(b.nama, 'jw').length).toBeGreaterThan(3);
      expect(ambilTeks(b.ringkas, 'en')).not.toBe(ambilTeks(b.ringkas, 'id'));
    }
    for (const sp of DAFTAR_BEDAH_TWIN) {
      expect(ambilTeks(sp.filosofi, 'en').length).toBeGreaterThan(20);
      expect(ambilTeks(sp.filosofi, 'jw').length).toBeGreaterThan(20);
    }
    for (const c of KOLEKSI_COVERFLOW) {
      expect(ambilTeks(c.penjelasanLengkap, 'en')).not.toBe(ambilTeks(c.penjelasanLengkap, 'id'));
      expect(ambilTeks(c.jenisSuluk, 'en')).not.toBe(ambilTeks(c.jenisSuluk, 'id'));
    }
    for (const k of KRONIK_SEJARAH_BUDAYA) {
      expect(ambilTeks(k.narasiMendalam, 'en').length).toBeGreaterThan(40);
    }
    for (const ca of DAFTAR_CARAKAN) {
      expect(ambilTeks(ca.artiContoh, 'en').length).toBeGreaterThan(2);
      expect(ambilTeks(ca.artiContoh, 'jw').length).toBeGreaterThan(2);
    }
  });

  it('menghasilkan jawaban BM25 RAG terlokalisasi dalam Bahasa Inggris maupun Indonesia', () => {
    const enRes = jawabDariKurasiLokal(
      'joglo',
      'Why does a Joglo Pendopo survive earthquakes without iron nails?',
      'en',
    );
    expect(enRes.statusGrounding).toBe('terbukti');
    expect(enRes.sumber).toContain('S6');
    expect(enRes.jawaban.toLowerCase()).toMatch(/earthquake|umpak|joinery|seismic/);

    const oodEn = jawabDariKurasiLokal('keris', 'What is today Tokyo stock market index?', 'en');
    expect(oodEn.statusGrounding).toBe('luar-korpus');
    expect(oodEn.jawaban).toContain('outside our verified');
  });
});
