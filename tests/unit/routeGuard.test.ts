import { describe, expect, it } from 'vitest';
import { DAFTAR_BEDAH_TWIN, LAKON_KIJANG_KENCANA } from '../../src/content/pusaka.ts';
import { cariSaranRute, evaluasiRuteUrl, sanitasiTampilUrl } from '../../src/lib/routeGuard.ts';

const BENDA_IDS = DAFTAR_BEDAH_TWIN.map((b) => b.id);
const JUMLAH_BABAK = LAKON_KIJANG_KENCANA.daftarBabak.length;

describe('Validasi Rute URL & Halaman 404 (routeGuard)', () => {
  it('menerima root path dan seluruh parameter halaman serta deep-link valid', () => {
    expect(evaluasiRuteUrl('/', '', BENDA_IDS, JUMLAH_BABAK)).toMatchObject({
      valid: true,
      halaman: 'beranda',
    });
    expect(evaluasiRuteUrl('/index.html', '?hal=koleksi', BENDA_IDS, JUMLAH_BABAK)).toMatchObject({
      valid: true,
      halaman: 'koleksi',
    });
    expect(
      evaluasiRuteUrl('/', '?hal=twin&benda=saron&titik=saron-wilah', BENDA_IDS, JUMLAH_BABAK),
    ).toMatchObject({
      valid: true,
      halaman: 'twin',
    });
    expect(evaluasiRuteUrl('/', '?hal=pakeliran&babak=2', BENDA_IDS, JUMLAH_BABAK)).toMatchObject({
      valid: true,
      halaman: 'pakeliran',
    });
  });

  it('menandai pathname atau parameter query yang salah sebagai 404 dengan alasan tepat', () => {
    const salahPath = evaluasiRuteUrl('/halaman-palsu', '', BENDA_IDS, JUMLAH_BABAK);
    expect(salahPath.valid).toBe(false);
    expect(salahPath.alasan).toBe('path');
    expect(salahPath.urlDiminta).toBe('/halaman-palsu');

    const salahHal = evaluasiRuteUrl('/', '?hal=nyasar', BENDA_IDS, JUMLAH_BABAK);
    expect(salahHal.valid).toBe(false);
    expect(salahHal.alasan).toBe('hal');

    const salahBenda = evaluasiRuteUrl('/', '?hal=twin&benda=tidak-ada', BENDA_IDS, JUMLAH_BABAK);
    expect(salahBenda.valid).toBe(false);
    expect(salahBenda.alasan).toBe('benda');

    const salahBabak = evaluasiRuteUrl('/', '?hal=pakeliran&babak=99', BENDA_IDS, JUMLAH_BABAK);
    expect(salahBabak.valid).toBe(false);
    expect(salahBabak.alasan).toBe('babak');
  });

  it('menghasilkan saran rute cerdas untuk URL salah ketik yang mendekati topik arsip', () => {
    expect(cariSaranRute('/tidak-ditemukan/keris-palsu')).toEqual({
      halaman: 'twin',
      bendaId: 'keris',
      labelKey: 'notFound.suggestKeris',
    });
    expect(cariSaranRute('/saron-3d')).toEqual({
      halaman: 'twin',
      bendaId: 'saron',
      labelKey: 'notFound.suggestSaron',
    });
    expect(cariSaranRute('/wayang-ramayana')).toEqual({
      halaman: 'pakeliran',
      labelKey: 'pages.pakeliran.label',
    });
    expect(cariSaranRute('/aksara-jawa-3d')).toEqual({
      halaman: 'kawruh',
      labelKey: 'pages.kawruh.label',
    });
    expect(cariSaranRute('/galeri-pusaka')).toEqual({
      halaman: 'koleksi',
      labelKey: 'pages.koleksi.label',
    });
    expect(cariSaranRute('/zzzz-tanpa-makna-123')).toBeUndefined();
  });

  it('membersihkan karakter kontrol dan membatasi panjang tampilan URL salah agar aman di layar sempit', () => {
    const panjang = '/' + 'x'.repeat(120);
    const hasil = sanitasiTampilUrl(`${panjang}\n\r`);
    expect(hasil.length).toBeLessThanOrEqual(76);
    expect(hasil.endsWith('...')).toBe(true);
  });
});
