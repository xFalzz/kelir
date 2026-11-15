import { expect, test } from '@playwright/test';

const ARTIFACT_DIR =
  'C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf';

test.describe('Kelir Multi-Page Spasial 3D — Verifikasi 5 Halaman & Realisme 3D', () => {
  test('menguji navigasi 5 halaman terpisah, diorama hero, digital twin CAD, coverflow modal, pakeliran wayang 3D, aksara & pamomong orb', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // 1. Preloader selesai otomatis
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    await page.waitForTimeout(450);

    // Pastikan Halaman 01 (beranda) aktif dan halaman lain TIDAK ditumpuk di bawahnya
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'beranda');
    await expect(page.locator('#pendopo')).toBeVisible();
    await expect(page.locator('#digital-twin')).toHaveCount(0);
    await expect(page.locator('#pakeliran')).toHaveCount(0);

    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-01-beranda-diorama.png` });

    // Verifikasi tidak ada horizontal overflow pada desktop
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(desktopOverflow).toBe(false);

    // 2. Tema terang default & pengalihan ke malam lalu kembali ke terang
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'malam');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-01b-beranda-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');

    // 3. Pengalihan bahasa ID -> JW -> AKS -> ID
    await page.getByTestId('lang-jw').click();
    await expect(page.locator('h1')).toContainText('Nlusuri');
    await page.getByTestId('lang-aks').click();
    await expect(page.locator('h1')).toContainText('ꦤ');
    await page.getByTestId('lang-id').click();
    await expect(page.locator('h1')).toContainText('Menembus');

    // Scrollytelling chapter, Matriks 12 Unsur, & Etalase pada Beranda
    await page.locator('#kronik-01').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-02-beranda-scrolly.png` });

    await page.locator('#dinding-ruang').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-02b-beranda-matriks.png` });

    await page.locator('#etalase').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-02c-beranda-etalase.png` });
    await page.getByTestId('filter-pakeliran').click();
    await expect(page.locator('.etalase-card')).toHaveCount(2);
    await page.getByTestId('filter-semua').click();

    // 4. Navigasi ke Halaman 02: Digital Twin 3D (?hal=twin)
    await page.getByTestId('page-tab-twin').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'twin');
    await expect(page.locator('#digital-twin')).toBeVisible();
    await expect(page.locator('#pendopo')).toHaveCount(0);
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-03-twin-keris-hibrida.png` });

    // Uji Ledak Anatomi & Mode Kawat X-Ray CAD pada Keris dan Saron
    const slider = page.getByTestId('slider-ledak');
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '0.78';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-04-twin-keris-exploded.png` });

    await page.getByTestId('tab-saron').click();
    await expect(page.locator('.saron-keys-bar')).toBeVisible();
    await page.getByTestId('toggle-xray').click({ force: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-05-twin-saron-xray.png` });

    await page.getByTestId('tab-joglo').click();
    await page.locator('.mode-btn').first().click({ force: true }); // PBR Nyata
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-06-twin-joglo-exploded.png` });

    await page.locator('.editorial-pillars-grid').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-06b-twin-pillars.png` });

    // 5. Navigasi ke Halaman 03: Coverflow & Suluk (?hal=koleksi)
    await page.getByTestId('page-tab-koleksi').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'koleksi');
    await expect(page.locator('#coverflow')).toBeVisible();
    await expect(page.locator('#digital-twin')).toHaveCount(0);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-07-koleksi-coverflow.png` });

    await page.getByTestId('coverflow-next').click();
    await expect(page.locator('.coverflow-nav-bar')).toContainText('02 / 05');

    await page.getByTestId('buka-modal-suluk').click();
    await expect(page.getByTestId('modal-suluk')).toBeVisible();
    await page.getByTestId('close-modal-suluk').click();
    await expect(page.getByTestId('modal-suluk')).toBeHidden();

    // 6. Navigasi ke Halaman 04: Panggung Pakeliran Wayang 3D (?hal=pakeliran)
    await page.getByTestId('page-tab-pakeliran').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'pakeliran');
    await expect(page.locator('#pakeliran')).toBeVisible();
    await expect(page.locator('#coverflow')).toHaveCount(0);
    await page.getByTestId('babak-2').click();
    await page.getByTestId('btn-panah-rama').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-08-pakeliran-wayang-detail.png` });

    // 7. Navigasi ke Halaman 05: Lab Aksara & Pamomong AI Orb (?hal=kawruh)
    await page.getByTestId('page-tab-kawruh').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'kawruh');
    await expect(page.locator('#pamomong')).toBeVisible();
    await expect(page.locator('#aksara')).toBeVisible();
    await expect(page.locator('#pakeliran')).toHaveCount(0);

    const formTanya = page.getByTestId('form-tanya');
    await formTanya.locator('input').fill('Bagaimana sistem pasak kayu joglo bekerja?');
    await formTanya.locator('button[type="submit"]').click();
    await expect(page.getByTestId('jawaban-pamomong')).toContainText('S');
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-09-kawruh-pamomong-orb.png` });

    const inputAksara = page.getByTestId('input-aksara');
    await inputAksara.fill('kelir');
    await expect(page.getByTestId('output-aksara')).toContainText('ꦏꦼꦭꦶꦂ');

    // 8. Cek viewport Ponsel 390x844 tanpa overflow horizontal
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(mobileOverflow).toBe(false);

    expect(errors).toEqual([]);
  });
});
