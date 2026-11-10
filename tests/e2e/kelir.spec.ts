import { test, expect } from '@playwright/test';

test.describe('Kelir E2E & Antislop R-35 Verification', () => {
  test('1. Alur lengkap 5 layar tanpa kamera, ganti bahasa, ganti tema, dan tanya jawab tanpa error console', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Kelir/);
    await expect(page.getByTestId('layar-pintu')).toBeVisible();

    // Klik masuk tanpa kamera -> menuju Rak Pusaka (5 ranah warisan budaya)
    await page.getByTestId('cta-masuk-manual').click();
    await expect(page.getByTestId('layar-rak')).toBeVisible();
    await expect(page.getByTestId('kartu-pusaka-keris')).toBeVisible();
    await expect(page.getByTestId('kartu-pusaka-saron')).toBeVisible();
    await expect(page.getByTestId('kartu-pusaka-batik')).toBeVisible();
    await expect(page.getByTestId('kartu-pusaka-joglo')).toBeVisible();
    await expect(page.getByTestId('kartu-pusaka-wayang')).toBeVisible();

    // Buka Ruang Pegang 3D Keris
    await page.getByTestId('buka-pegang-keris').click();
    await expect(page.getByTestId('layar-pegang')).toBeVisible();
    await expect(page.getByTestId('scene-rail')).toBeVisible();
    await expect(page.getByTestId('story')).toBeVisible();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Wilah');

    // Uji navigasi Rel Bab 3D (gaya Townhouse) & kartu cerita terpisah
    await page.getByTestId('langkah-rail-03').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Ganja');
    await page.getByTestId('scene-next').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Pamor');

    // Klik tiap titik anatomis & tombol kendali 3D + aksi hidup 3D + simulasi fisik khusus 3D
    await page.getByTestId('tombol-aksi-3d').click();
    await page.getByTestId('tombol-efek-3d').click();
    await page.getByTestId('titik-info-ganja').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Ganja');
    await page.getByTestId('titik-info-pamor').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Pamor');
    await page.getByTestId('putar-kiri').click();
    await page.getByTestId('putar-kanan').click();
    await page.getByTestId('zoom-dekat').click();
    await page.getByTestId('zoom-jauh').click();
    await page.getByTestId('reset-pandangan').click();

    // Pindah tab benda ke Saron, Batik, Joglo, & Wayang
    await page.getByTestId('tab-benda-saron').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Wilah Gangsa');
    await expect(page.getByTestId('tabuh-wilah-1')).toBeVisible();
    await page.getByTestId('tabuh-wilah-1').click();
    await page.getByTestId('tombol-efek-3d').click();

    await page.getByTestId('tab-benda-batik').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Canting Tulis');
    await page.getByTestId('tombol-aksi-3d').click();
    await page.getByTestId('tombol-efek-3d').click();

    await page.getByTestId('tab-benda-joglo').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Atap Brunjung');
    await page.getByTestId('tombol-aksi-3d').click();
    await page.getByTestId('tombol-efek-3d').click();

    await page.getByTestId('tab-benda-wayang').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Awak Wayang');
    await page.getByTestId('titik-info-kelir-blencong').click();
    await expect(page.getByTestId('detail-titik-aktif')).toContainText('Gunungan');
    await page.getByTestId('tombol-efek-3d').click();

    // Uji kontrol Suara Budaya & Gong Ageng
    await page.getByTestId('tombol-gong-ageng').click();
    await page.getByTestId('toggle-suara-budaya').click();
    await page.getByTestId('toggle-suara-budaya').click();

    // Uji validasi form tanya jawab kosong (failure state)
    await page.getByTestId('kirim-tanya').click();
    await expect(page.getByTestId('pesan-galat-tanya')).toBeVisible();

    // Uji contoh pertanyaan terikat sumber (happy path)
    await page.getByTestId('contoh-tanya-0').click();
    await expect(page.getByTestId('kotak-jawaban-tanya')).toContainText('Sumber rujukan');

    // Lanjut ke Panggung Kelir
    await page.getByTestId('ke-panggung-dari-pegang').click();
    await expect(page.getByTestId('layar-panggung')).toBeVisible();
    await expect(page.getByTestId('narasi-babak-aktif')).toContainText('Babak 1');
    await page.getByTestId('panggung-panah-rama').click();
    await page.getByTestId('panggung-sabetan-kayon').click();
    await page.getByTestId('panggung-cempala-dalang').click();

    // Navigasi 4 babak
    await page.getByTestId('tombol-babak-2').click();
    await expect(page.getByTestId('narasi-babak-aktif')).toContainText('Babak 2');
    await page.getByTestId('tombol-babak-3').click();
    await expect(page.getByTestId('narasi-babak-aktif')).toContainText('Babak 3');
    await page.getByTestId('tombol-babak-4').click();
    await expect(page.getByTestId('narasi-babak-aktif')).toContainText('Babak 4');

    // Lanjut ke layar Sumber & Aksara
    await page.getByTestId('babak-berikutnya').click();
    await expect(page.getByTestId('layar-sumber')).toBeVisible();
    await expect(page.getByTestId('tabel-sumber')).toContainText('UNESCO');
    await expect(page.getByTestId('tabel-lisensi')).toContainText('Noto Sans Javanese');

    // Uji transliterator Aksara Jawa langsung di UI
    await page.getByTestId('input-uji-aksara').fill('hanacaraka');
    await expect(page.getByTestId('keluaran-uji-aksara')).toHaveText('ꦲꦤꦕꦫꦏ');

    // Uji ganti bahasa (ID -> Jawa -> Aksara) dan status tinjauan draf
    await page.getByTestId('lang-jv').click();
    await expect(page.getByTestId('status-tinjauan-jawa')).toBeVisible();
    await page.getByTestId('lang-aksara').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'jv');
    await page.getByTestId('lang-id').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');

    // Uji ganti tema Malam <-> Siang (R-34)
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'siang');
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'malam');

    expect(consoleErrors).toEqual([]);
  });

  test('2. Responsif mobile 360px tanpa horizontal overflow dan target sentuh >= 44px (R-03)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');

    for (const navId of ['nav-pintu', 'nav-rak', 'nav-pegang', 'nav-panggung', 'nav-sumber']) {
      const btn = page.getByTestId(navId);
      await btn.click();
      const box = await btn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow).toBe(false);
    }
  });
});
