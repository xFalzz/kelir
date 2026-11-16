import { expect, test } from '@playwright/test';

const ARTIFACT_DIR =
  (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.KELIR_ARTIFACT_DIR ?? 'test-results/screenshots';

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

    // Verifikasi Tema Gelap di Matriks & Etalase Beranda lalu kembali Terang
    await page.getByTestId('toggle-tema').click();
    await page.waitForTimeout(200);
    await page.locator('#dinding-ruang').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-02b-matriks-malam.png` });
    await page.locator('#etalase').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-02c-etalase-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');
    await page.getByTestId('filter-pakeliran').click();
    await expect(page.locator('.etalase-card')).toHaveCount(2);
    await page.getByTestId('etalase-et-wayang-kidang').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'pakeliran');
    await page.getByTestId('page-tab-beranda').click();
    await page.locator('#etalase').scrollIntoViewIfNeeded();
    await page.getByTestId('filter-semua').click();

    // Verifikasi rute Indeks 12 Unsur: Hanacaraka -> Aksara (kawruh) & Blencong -> Bedah 3D Wayang pin blencong
    await page.locator('#dinding-ruang').scrollIntoViewIfNeeded();
    await page.getByTestId('matrix-m12').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'kawruh');
    await expect(page.locator('#aksara')).toBeVisible();

    await page.getByTestId('page-tab-beranda').click();
    await page.locator('#dinding-ruang').scrollIntoViewIfNeeded();
    await page.getByTestId('matrix-m10').click();
    await expect(page.locator('main')).toHaveAttribute('data-active-page', 'twin');
    await expect(page.getByTestId('tab-wayang')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.titik-btn.is-active')).toContainText('Pelita Minyak Blencong');
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-03c-twin-wayang-blencong.png` });

    // Kembali ke Keris pada Halaman 02: Digital Twin 3D (?hal=twin)
    await page.getByTestId('tab-keris').click();
    await expect(page.locator('#digital-twin')).toBeVisible();
    await expect(page.locator('#pendopo')).toHaveCount(0);
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-03-twin-keris-hibrida.png` });

    // Verifikasi Tema Gelap Studio Digital Twin lalu kembali Terang
    await page.getByTestId('toggle-tema').click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-03b-twin-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');

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

    // Verifikasi Tema Gelap Coverflow 3D lalu kembali Terang
    await page.getByTestId('toggle-tema').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-07b-coverflow-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');

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

    // Verifikasi Tema Gelap Panggung Pakeliran lalu kembali Terang
    await page.getByTestId('toggle-tema').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-08b-pakeliran-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');

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

    // Verifikasi Tema Gelap Pamomong Orb & Halaman 05 lalu kembali Terang
    await page.getByTestId('toggle-tema').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-09b-kawruh-malam.png` });
    await page.getByTestId('toggle-tema').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terang');

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

  test('memverifikasi tata letak responsif 5 halaman di ponsel sempit (320px), ponsel (390px), dan tablet (768px & 1024px) tanpa error/overflow', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const viewports = [
      { name: 'xs-320', width: 320, height: 568 },
      { name: 'mob-390', width: 390, height: 844 },
      { name: 'tab-768', width: 768, height: 1024 },
      { name: 'tab-1024', width: 1024, height: 768 },
      { name: 'lap-1200', width: 1200, height: 800 },
    ];
    const pages = ['beranda', 'twin', 'koleksi', 'pakeliran', 'kawruh'] as const;

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const hal of pages) {
        await page.goto(`/?hal=${hal}`);
        await expect(page.locator('.preloader-curtain')).toHaveAttribute(
          'data-preloader-done',
          'true',
          { timeout: 10000 },
        );
        await page.waitForTimeout(220);

        const audit = await page.evaluate(() => {
          const vw = window.innerWidth;
          const docOverflow = document.documentElement.scrollWidth > vw + 1;
          const nav = document.querySelector('.top-nav');
          const navOverflow = nav ? nav.scrollWidth > nav.clientWidth + 2 : false;

          const dockClips: string[] = [];
          const dock = document.querySelector('.mobile-page-dock');
          if (dock && getComputedStyle(dock).display !== 'none') {
            for (const btn of dock.querySelectorAll('button')) {
              if (btn.scrollWidth > btn.clientWidth + 2) {
                dockClips.push(btn.textContent?.trim() ?? '');
              }
            }
          }

          const clippedElements: string[] = [];
          for (const el of document.querySelectorAll(
            'section, header, footer, button, input, .mode-switch-group, .crimson-player-bar, .subpage-breadcrumb, .hero-spec-strip',
          )) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (el.closest('.etalase-ribbon') || el.closest('.coverflow-viewport')) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > vw + 2 || r.left < -2) {
              clippedElements.push(`${el.tagName}.${el.className}(${Math.round(r.left)}..${Math.round(r.right)})`);
            }
          }
          return { docOverflow, navOverflow, dockClips, clippedElements };
        });

        expect(audit.docOverflow, `${vp.name} / ${hal} docOverflow`).toBe(false);
        expect(audit.navOverflow, `${vp.name} / ${hal} navOverflow`).toBe(false);
        expect(audit.dockClips, `${vp.name} / ${hal} dockClips`).toEqual([]);
        expect(audit.clippedElements, `${vp.name} / ${hal} clipped`).toEqual([]);
      }
    }

    // Verifikasi Modal Suluk terbuka di ponsel sempit 320x568 bebas overflow
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/?hal=koleksi');
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    await page.getByTestId('buka-modal-suluk').click();
    await expect(page.getByTestId('modal-suluk')).toBeVisible();
    const modalClip = await page.evaluate(() => {
      const vw = window.innerWidth;
      const bar = document.querySelector('.crimson-player-bar');
      const r = bar?.getBoundingClientRect();
      return {
        docOverflow: document.documentElement.scrollWidth > vw + 1,
        barRight: r ? Math.round(r.right) : 0,
        vw,
      };
    });
    expect(modalClip.docOverflow).toBe(false);
    expect(modalClip.barRight).toBeLessThanOrEqual(modalClip.vw + 2);
    await page.getByTestId('close-modal-suluk').click();

    // Tangkapan layar visual responsif Ponsel & Tablet
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?hal=beranda');
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-10-mobile-beranda.png` });

    await page.goto('/?hal=kawruh');
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-11-mobile-kawruh.png` });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/?hal=twin');
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mp-12-tablet-twin.png` });

    // Verifikasi smooth scroll wheel di semua halaman & isolasi zoom 3D Digital Twin
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const hal of ['beranda', 'koleksi', 'pakeliran', 'kawruh'] as const) {
      await page.goto(`/?hal=${hal}`);
      await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
        timeout: 10000,
      });
      await page.mouse.move(120, 420);
      await page.mouse.wheel(0, 420);
      await page.waitForTimeout(450);
      const y = await page.evaluate(() => window.scrollY);
      expect(y, `Smooth scroll aktif pada halaman ${hal}`).toBeGreaterThan(220);
    }

    await page.goto('/?hal=twin');
    await expect(page.locator('.preloader-curtain')).toHaveAttribute('data-preloader-done', 'true', {
      timeout: 10000,
    });
    const twinCanvas = page.locator('.twin-canvas-host canvas');
    await twinCanvas.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(150);
    const twinBox = await twinCanvas.boundingBox();
    if (twinBox) {
      await page.mouse.move(twinBox.x + 80, twinBox.y + 140);
      await page.mouse.wheel(0, 240);
      await page.waitForTimeout(250);
      const scrollAfterCanvasWheel = await page.evaluate(() => window.scrollY);
      expect(scrollAfterCanvasWheel).toBeLessThan(10);
    }
    await page.mouse.move(40, 260);
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(450);
    const twinPageScroll = await page.evaluate(() => window.scrollY);
    expect(twinPageScroll).toBeGreaterThan(220);

    expect(errors).toEqual([]);
  });
});
