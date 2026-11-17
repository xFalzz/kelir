import { describe, expect, it } from 'vitest';
import {
  DAFTAR_CARAKAN,
  KATALOG_AKSARA_LENGKAP,
  KATEGORI_AKSARA_LIST,
  ambilAksaraPerKategori,
  latinKeAksaraJawa,
} from '../../src/lib/aksara.ts';

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

  it('menyediakan 6 kategori lengkap: Nglegena, Sandhangan, Pasangan, Swara/Rekaan, Murda, Angka/Pada', () => {
    expect(KATEGORI_AKSARA_LIST.map((k) => k.id)).toEqual([
      'nglegena',
      'sandhangan',
      'pasangan',
      'swara-rekaan',
      'murda',
      'angka-pada',
    ]);
    expect(ambilAksaraPerKategori('nglegena')).toHaveLength(20);
    expect(ambilAksaraPerKategori('sandhangan')).toHaveLength(14);
    expect(ambilAksaraPerKategori('pasangan')).toHaveLength(20);
    expect(ambilAksaraPerKategori('swara-rekaan')).toHaveLength(10);
    expect(ambilAksaraPerKategori('murda')).toHaveLength(8);
    expect(ambilAksaraPerKategori('angka-pada')).toHaveLength(14);
    expect(KATALOG_AKSARA_LENGKAP).toHaveLength(86);
  });

  it('mendukung pakem lengkap Murda, Aksara Swara, Rekaan, Pa Cerek, dan Pada Adeg-Adeg', () => {
    const kraton = latinKeAksaraJawa('Kraton Surakarta.', { pakem: 'lengkap-murda' });
    expect(kraton.startsWith('\uA9CB')).toBe(true); // Pada Adeg-Adeg
    expect(kraton).toContain('\uA991\uA9BF'); // Ka Murda + Cakra
    expect(kraton).toContain('\uA9AF'); // Sa Murda
    expect(kraton.endsWith('\uA9C9')).toBe(true); // Pada Lungsi

    const serapan = latinKeAksaraJawa('Falsafah zaman', { pakem: 'lengkap-murda' });
    expect(serapan).toContain('\uA9A5\uA9B3'); // Fa (Pa + cecak telu)
    expect(serapan).toContain('\uA997\uA9B3'); // Za (Ja + cecak telu)

    const swara = latinKeAksaraJawa('Indonesia', { pakem: 'lengkap-murda' });
    expect(swara).toContain('\uA986'); // Swara I
  });

  it('mengembalikan string kosong untuk masukan kosong/spasi saja', () => {
    expect(latinKeAksaraJawa('   ')).toBe('');
  });
});
