import { describe, expect, it } from 'vitest';
import {
  KONTAK_META_TEKS,
  KONTAK_PENGELOLA,
  METADATA_LEGAL,
  PASAL_KEBIJAKAN_PRIVASI,
  PASAL_SYARAT_KETENTUAN,
  RINGKASAN_TAB_LEGAL,
  TOPIK_KORESPONDENSI,
} from '../../src/content/legalInfo.ts';
import { ambilTeks, type BahasaAktif } from '../../src/content/pusaka.ts';
import { tI18n } from '../../src/lib/i18n.ts';

describe('Pop-up Syarat & Ketentuan, Kebijakan Privasi & Hubungi Kami KELIR', () => {
  it('menyediakan seluruh pasal Syarat & Ketentuan dan Kebijakan Privasi lengkap 4 bahasa', () => {
    expect(PASAL_SYARAT_KETENTUAN.length).toBeGreaterThanOrEqual(5);
    expect(PASAL_KEBIJAKAN_PRIVASI.length).toBeGreaterThanOrEqual(5);
    expect(TOPIK_KORESPONDENSI.length).toBe(3);

    const langs: BahasaAktif[] = ['id', 'en', 'jw', 'aks'];
    for (const lang of langs) {
      expect(tI18n(lang, 'footer.termsBtn').length).toBeGreaterThan(3);
      expect(tI18n(lang, 'footer.privacyBtn').length).toBeGreaterThan(3);
      expect(tI18n(lang, 'footer.contactBtn').length).toBeGreaterThan(3);
      expect(ambilTeks(METADATA_LEGAL.eyebrow, lang).length).toBeGreaterThan(10);
      expect(ambilTeks(KONTAK_META_TEKS.roleBadge, lang).length).toBeGreaterThan(10);
    }

    for (const tab of ['syarat', 'privasi', 'kontak'] as const) {
      expect(ambilTeks(RINGKASAN_TAB_LEGAL[tab].judul, 'id')).not.toBe(
        ambilTeks(RINGKASAN_TAB_LEGAL[tab].judul, 'en'),
      );
      expect(ambilTeks(RINGKASAN_TAB_LEGAL[tab].pengantar, 'en').length).toBeGreaterThan(25);
    }

    for (const pasal of [...PASAL_SYARAT_KETENTUAN, ...PASAL_KEBIJAKAN_PRIVASI]) {
      expect(pasal.judul.id.length).toBeGreaterThan(5);
      expect(pasal.judul.en.length).toBeGreaterThan(5);
      expect(pasal.judul.jw.length).toBeGreaterThan(5);
      expect(pasal.isi.en.length).toBeGreaterThan(25);
    }
  });

  it('menyertakan contact person resmi pengembang (Email, Website, Instagram) secara akurat', () => {
    const email = KONTAK_PENGELOLA.find((k) => k.id === 'email');
    const web = KONTAK_PENGELOLA.find((k) => k.id === 'website');
    const ig = KONTAK_PENGELOLA.find((k) => k.id === 'instagram');

    expect(email).toBeDefined();
    expect(email?.nilai).toBe('nawfalirfan005@gmail.com');
    expect(email?.tautan.startsWith('mailto:nawfalirfan005@gmail.com')).toBe(true);
    expect(email?.dapatDisalin).toBe(true);

    expect(web).toBeDefined();
    expect(web?.nilai).toBe('https://nawfal.vercel.app');
    expect(web?.tautan).toBe('https://nawfal.vercel.app');
    expect(web?.eksternal).toBe(true);

    expect(ig).toBeDefined();
    expect(ig?.nilai).toBe('@nawfaljr__');
    expect(ig?.tautan).toBe('https://www.instagram.com/nawfaljr__/');
    expect(ig?.eksternal).toBe(true);
  });
});
