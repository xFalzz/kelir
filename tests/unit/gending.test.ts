import { describe, expect, it } from 'vitest';
import { DAFTAR_SUMBER, type KodeSumber } from '../../src/content/pusaka.ts';
import { audioBudaya } from '../../src/lib/audioBudaya.ts';
import {
  PELOG_FREKUENSI,
  REPERTOAR_GENDING_JAWA,
  SLENDRO_FREKUENSI,
  ambilDeskripsiFilosofiGending,
  ambilFrekuensiNada,
  cariGendingById,
} from '../../src/lib/gendingJawa.ts';

describe('Musik Latar Karawitan Klasik Jawa & Makna Filosofis', () => {
  it('menyediakan 4 repertoar klasik Jawa autentik dengan silsilah pencipta, notasi kepatihan & filosofi S4-S5', () => {
    expect(REPERTOAR_GENDING_JAWA.length).toBe(4);
    const ids = REPERTOAR_GENDING_JAWA.map((g) => g.id);
    expect(ids).toEqual(['puspawarna', 'wilujeng', 'lirilira', 'kebogiro']);

    const validSources = new Set(Object.keys(DAFTAR_SUMBER) as KodeSumber[]);
    for (const g of REPERTOAR_GENDING_JAWA) {
      expect(g.balungan.length).toBeGreaterThanOrEqual(16);
      expect(g.balungan.some((k) => k.gong)).toBe(true);
      expect(g.balungan.some((k) => k.kenong)).toBe(true);
      expect(g.filosofiMakna.id.length).toBeGreaterThan(40);
      expect(g.filosofiMakna.en.length).toBeGreaterThan(40);
      expect(g.filosofiMakna.jw.length).toBeGreaterThan(30);
      expect(g.sumber.every((s) => validSources.has(s))).toBe(true);
    }

    const puspawarna = cariGendingById('puspawarna');
    expect(puspawarna.pencipta.id).toContain('Mangkunegara IV');

    const descAks = ambilDeskripsiFilosofiGending(puspawarna, 'aks');
    expect(descAks.filosofiMakna).toMatch(/[\uA980-\uA9DF]/);
  });

  it('menggunakan tangga nada Slendro dan Pelog Jawa asli (bukan sekadar nada acak Barat)', () => {
    expect(SLENDRO_FREKUENSI['1']).toBeCloseTo(261.63, 1);
    expect(SLENDRO_FREKUENSI['2']).toBeCloseTo(299.1, 1);
    expect(PELOG_FREKUENSI['7']).toBeCloseTo(493.5, 1);

    expect(ambilFrekuensiNada('slendro', '.')).toBeNull();
    expect(ambilFrekuensiNada('slendro', '6,')).toBeCloseTo(227.4, 1);
    expect(ambilFrekuensiNada('pelog', '3')).toBeCloseTo(314.8, 1);
  });

  it('memperbarui status real-time audioBudaya saat berpindah gending dan ducking narasi', () => {
    audioBudaya.aturAktif(true);
    audioBudaya.pilihGending('lirilira', false);
    const st1 = audioBudaya.ambilStatusRealtime();
    expect(st1.gendingId).toBe('lirilira');

    audioBudaya.aturVolumeLatar(true);
    expect(audioBudaya.ambilStatusRealtime().redupNarasi).toBe(true);

    audioBudaya.aturVolumeLatar(false);
    expect(audioBudaya.ambilStatusRealtime().redupNarasi).toBe(false);
    audioBudaya.aturAktif(false);
  });
});
