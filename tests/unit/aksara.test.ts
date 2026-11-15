import { describe, expect, it } from 'vitest';
import { DAFTAR_CARAKAN, latinKeAksaraJawa } from '../../src/lib/aksara.ts';

describe('Mesin Transliterasi Aksara Jawa (Hanacaraka)', () => {
  it('menyediakan 20 aksara nglegena lengkap dari Ha sampai Nga', () => {
    expect(DAFTAR_CARAKAN).toHaveLength(20);
    expect(DAFTAR_CARAKAN[0].latin).toBe('Ha');
    expect(DAFTAR_CARAKAN[0].aksara).toBe('\uA9B2');
    expect(DAFTAR_CARAKAN[19].latin).toBe('Nga');
    expect(DAFTAR_CARAKAN[19].aksara).toBe('\uA994');
  });

  it('mengonversi kata kunci kelir, rama, saron, dan wayang dengan akurat', () => {
    expect(latinKeAksaraJawa('kelir')).toBe('ꦏꦼꦭꦶꦂ');
    expect(latinKeAksaraJawa('rama')).toBe('ꦫꦩ');
    expect(latinKeAksaraJawa('wayang')).toBe('ꦮꦪꦁ');
  });

  it('mengembalikan string kosong untuk masukan kosong/spasi saja', () => {
    expect(latinKeAksaraJawa('   ')).toBe('');
  });
});
