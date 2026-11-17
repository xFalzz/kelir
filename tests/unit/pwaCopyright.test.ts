import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { BahasaAktif } from '../../src/content/pusaka.ts';
import { tI18n } from '../../src/lib/i18n.ts';
import {
  daftarkanServiceWorker,
  picuInstalasiPwa,
  type PwaInstallPromptEvent,
} from '../../src/lib/pwa.ts';
import { ambilTahunHakCipta } from '../../src/lib/seoGeo.ts';

const ROOT_DIR = path.resolve(import.meta.dirname, '../..');

describe('PWA Installability & Footer Hak Cipta Tahun Otomatis', () => {
  it('memperbarui tahun hak cipta otomatis saat kalender berganti tahun', () => {
    expect(ambilTahunHakCipta(new Date('2026-11-17T00:00:00Z'))).toBe(2026);
    expect(ambilTahunHakCipta(new Date('2027-01-01T00:00:00Z'))).toBe(2027);
    expect(ambilTahunHakCipta(new Date('2032-06-15T12:00:00Z'))).toBe(2032);
    expect(ambilTahunHakCipta()).toBeGreaterThanOrEqual(2026);
  });

  it('menyediakan string hak cipta dan tombol pasang PWA lengkap 4 bahasa', () => {
    const langs: BahasaAktif[] = ['id', 'en', 'jw', 'aks'];
    for (const lang of langs) {
      const cp = tI18n(lang, 'footer.copyright', { year: 2027 });
      expect(cp).toContain('©');
      expect(cp).toContain('2027');
      expect(cp).toContain('KELIR');
      expect(tI18n(lang, 'footer.installApp').length).toBeGreaterThan(5);
      expect(tI18n(lang, 'footer.installGuideChrome').length).toBeGreaterThan(10);
    }
  });

  it('menyertakan manifest.webmanifest valid beserta ikon PNG 192/512/maskable dan Service Worker aman', () => {
    const manifestPath = path.join(ROOT_DIR, 'public/manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      name: string;
      short_name: string;
      start_url: string;
      display: string;
      icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
      shortcuts?: Array<{ url: string }>;
    };

    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/?hal=beranda');
    expect(manifest.icons.some((i) => i.sizes === '192x192' && i.type === 'image/png')).toBe(true);
    expect(
      manifest.icons.some(
        (i) => i.sizes === '512x512' && i.type === 'image/png' && i.purpose === 'maskable',
      ),
    ).toBe(true);

    for (const ic of manifest.icons) {
      const assetPath = path.join(ROOT_DIR, 'public', ic.src.replace(/^\//, ''));
      expect(fs.existsSync(assetPath)).toBe(true);
    }

    const swPath = path.join(ROOT_DIR, 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);
    const swSrc = fs.readFileSync(swPath, 'utf8');
    expect(swSrc).toContain("url.pathname.startsWith('/api/')");
    expect(swSrc).toContain('/icons/icon-192.png');
  });

  it('menangani registrasi Service Worker dan pemanggilan prompt PWA dengan aman', async () => {
    expect(await daftarkanServiceWorker('/sw.js', false)).toBe(false);
    expect(await picuInstalasiPwa(null)).toBe('unavailable');

    const promptMock = vi.fn(async () => undefined);
    const fakeEvent = {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
    } as unknown as PwaInstallPromptEvent;

    expect(await picuInstalasiPwa(fakeEvent)).toBe('accepted');
    expect(promptMock).toHaveBeenCalledTimes(1);
  });
});
