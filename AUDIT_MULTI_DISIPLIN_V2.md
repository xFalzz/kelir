# Re-Audit Teknis, Desain, Keamanan & QA Lintas 6 Disiplin Platform KELIR (V2 - Pasca Commit `20be6e7`)

**Tanggal Re-Audit:** 18 November 2026  
**Basis Kode yang Diperiksa:** Commit `20be6e7` di `d:\Kompetisi-UBSI\kelir` (pasca penyelesaian V1).  
**Peran Peninjau:** Senior Software Engineer, Senior AI Trainer/Engineer, Senior UI/UX Designer, Senior Cybersecurity Engineer, Senior Project Manager, dan Senior QA Lead.  
**Metode Verifikasi:** Pemeriksaan kode sumber per berkas (`api/`, `src/`, `public/`, `tests/`, `vercel.json`, `vite.config.ts`, `index.html`, `package.json`), analisis ukuran aset & build (`dist/`), `npm audit`, serta inspeksi visual screenshot Playwright aktual ([mp-01](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-01-beranda-diorama.png), [mp-03](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-03-twin-keris-hibrida.png), [mp-08](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-08-pakeliran-wayang-detail.png), [mp-09](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-09-kawruh-pamomong-orb.png), [mp-14](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-14-mobile-modal-suluk.png), [mp-15](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-15-search-modal.png), [mp-20](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-20-mobile-footer-pwa.png), [mp-23](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-23-mobile-pwa-popup.png)).

---

## Ringkasan Eksekutif Re-Audit V2

Fondasi keamanan HTTP, guardrail AI, aksesibilitas dasar WCAG 2.1, dan aset kanonik SEO telah menguat signifikan pada commit `20be6e7` (terverifikasi 0 error `svelte-check`, 80/80 unit test lulus, 6/6 suite Playwright lulus, serta 0 vulnerability produksi pada `npm audit --omit=dev`).

Namun pemeriksaan ulang mendalam berhasil menemukan **temuan bug regresi fungsional baru, tabrakan tata letak nyata pada screenshot desktop & mobile, risiko timeout serverless AI berantai, celah kontrak privasi/Origin, pembengkakan bundel `.woff` + arsitektur monolitik, serta kekurangan fitur wajib & test coverage** berikut:

| Disiplin | Status Kini | Temuan Kunci Baru / Sisa V2 | Risiko Tertinggi |
| :--- | :--- | :---: | :--- |
| **Software & WebGL** | Ada Bug Kontrak Event & Memori GPU | 5 | `threeHelpers.ts` vs `WebGLStatusBanner.svelte` putus sinyal (`!gl` return dini, tanpa `bubbles: true`, mismatch `detail.reason` vs `detail.state`); `CanvasTexture` tak di-dispose; +418 KB font `.woff` duplikat |
| **Cybersecurity** | Baik di Guardrail, Ada Celah Sisi-Server | 5 | `api/ai-studio.ts` tanpa `try/catch`; `cekOriginPermintaanApi` meloloskan `Origin: localhost` di produksi; `kelir_ai_feedback_v1` belum tertulis di Kebijakan Privasi & `bacaJejakKurasi()` tanpa validasi skema isi array |
| **AI Engineering** | Guardrail Kuat, Latensi Serverless Rawan | 4 | Pujangga & Krama membuka **2 WebSocket Live berurutan** (`26s + 14s`) rentan melampaui limit Vercel; belum ada multi-turn session memory; cache `aiStudioGemini.ts` belum berversi `v2:` |
| **UI/UX & Visual** | Terjadi Tumpang-Tindih Nyata di Screenshot | 6 | `KarawitanBar` menutupi slider `Elevasi Solah Y` (`mp-08`) & badge sumber AI (`mp-09`); kartu panduan PWA terpotong `mobile-bottom-dock` (`mp-20`, `mp-23`); pin `GAZEBO WASTRA` menyentuh huruf hero (`mp-01`); `aks` merusak akronim teknis |
| **Project Manager** | Siap Rilis Awal, Fitur Wajib Masih Kurang | 5 | JSON-LD `index.html:90` mengandung `&amp;` mentah; `/og-kelir.svg` yatim di precache; ketiadaan tour onboarding 1x, salin deep-link kurasi, `<svelte:boundary>`, & HTTP status 404 edge |
| **Quality Assurance** | 80 Unit Test Baik, Celah Modul Inti | 5 | 8 modul inti (`handTracker`, `piagamKurator`, `audioBudaya`, `pencarianArsip`, `dalangVoice`, `focusTrap`, `aiStudioGemini`, `threeHelpers`) ber-coverage 0%; 58 `waitForTimeout` E2E; tanpa `@axe-core/playwright` & tes `webglcontextlost` |

---

## 1. Temuan Senior Software Engineer & WebGL/Performance Architect

### 1.1 [P0 - Bug Fungsional] Kontrak Event & Sinyal WebGL Fallback Putus antara `threeHelpers.ts` dan `WebGLStatusBanner.svelte`
- **Lokasi:** [threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts#L30-L96) dan [WebGLStatusBanner.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/WebGLStatusBanner.svelte#L38-L67).
- **Bukti Kode:**
  1. Pada `threeHelpers.ts:35`, ketika `getContext('webgl2' | 'webgl')` mengembalikan `null` secara normal tanpa exception (kasus paling umum ketika GPU/driver diblokir), fungsi langsung melakukan `return null;` sehingga **`container.dataset.webglState = 'unavailable'` dan event `'kelirwebglstatus'` pada baris 91-94 tidak pernah dijalankan**.
  2. Saat event dipancarkan di baris `78`, `84`, dan `93`, opsi `{ bubbles: true }` tidak dipasang. Pada `#beranda`, `#koleksi`, `#pakeliran`, `#kawruh`, dan `SulukModal`, node host WebGL (mis. `.diorama-webgl-host`, `.pakeliran-canvas-host`) adalah **sibling** dari `<WebGLStatusBanner>`, sedangkan banner mendengar di `rootEl.parentElement` (`.diorama-canvas-wrap`, `.pakeliran-theatre-box`), sehingga event non-bubbling tidak pernah sampai.
  3. `threeHelpers.ts` mengirimkan `{ detail: { ok, reason: 'lost' | 'restored' | 'unavailable' } }`, sedangkan `WebGLStatusBanner.svelte:41` membaca `detail?.state === 'ready' | 'unavailable' | 'lost'`.
  4. Pada `WebGLStatusBanner.svelte:55-64`, bila prop `onRetry` kosong (seluruh 5 integrasi saat ini tidak menyuplai `onRetry`), klik tombol memuat ulang halaman secara paksa (`window.location.reload()`), membuang seluruh state halaman aktif alih-alih me-remount stage (`{#key}`).
- **Rekomendasi:** Seragamkan payload event `{ detail: { state: 'ready' | 'lost' | 'unavailable' }, bubbles: true }`, set `container.dataset.webglState = 'unavailable'` dan pancarkan event pada cabang `if (!gl)` sebelum `return null`, serta teruskan handler `onRetry` berbasis counter `{#key}`.

### 1.2 [P1 - Kebocoran Memori GPU] `disposeSceneObject()` Belum Mendisposisi Peta Tekstur Non-Cache pada Material
- **Lokasi:** [threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts#L414-L438), [pusaka3DBuilder.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/pusaka3DBuilder.ts#L114-L562), [wayangStage.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/wayangStage.ts#L630), [pamomongOrbStage.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/pamomongOrbStage.ts#L102-L180).
- **Celah:** `disposeSceneObject()` membebaskan `geometry`, `material`, dan `__envRT`, namun belum menyapu slot tekstur (`map`, `bumpMap`, `normalMap`, `roughnessMap`, `emissiveMap`, `aoMap`, `alphaMap`) milik material tersebut. Setiap kali pengguna mengganti spesimen pada Digital Twin Studio atau menutup-membuka `SulukModal`, `CanvasTexture` baru yang dibuat di `pusaka3DBuilder.ts` tetap tertinggal di memori WebGL.
- **Rekomendasi:** Tandai tekstur cache modul bersama dengan `tex.userData.sharedCache = true` (pada `loadBudayaTextures()`, `wayang3DBuilder.ts`, dan `livingPendopoStage.ts`), lalu disposisi semua tekstur `material` yang tidak memiliki penanda `sharedCache` di dalam `disposeSceneObject()`.

### 1.3 [P1 - Bundel Aset Duplikat] 14 File Font `.woff` Lawas (+418 KB) & Duplikasi Biner MediaPipe (~36.8 MB)
- **Bukti Observasi (`dist/assets` & `public/mediapipe/`):**
  - `@fontsource` default stylesheet menarik baik `.woff2` (17 file = `379.5 KB`) maupun `.woff` lawas (14 file = `418.0 KB`). Seluruh peramban yang sanggup menjalankan WebGL2 & Three.js ES2022 sudah mendukung `.woff2`, terlebih lagi `vite.config.ts:241` memang tidak menyertakan `.woff` dalam precache Service Worker. Mengimpor CSS khusus WOFF2 atau menyesuaikan build Fontsource langsung memangkas ~418 KB aset.
  - `public/mediapipe/` berukuran total ~36.8 MB (`vision_wasm_internal.wasm` 14.26 MB, `vision_wasm_module_internal.wasm` 14.26 MB, `hand_landmarker.task` 7.64 MB). Bila dipertahankan 100% lokal untuk mode tanpa internet, perlu audit apakah build WASM non-SIMD `vision_wasm_module_internal.*` memang dipanggil atau cukup diisolasi ke sub-aset terpisah / on-demand CDN fallback terverifikasi SRI.

### 1.4 [P2 - Pemeliharaan Kode & Ketidakadaan Linter/Formatter]
- Tiga berkas utama sudah terlalu gemuk: [src/app.css](file:///d:/Kompetisi-UBSI/kelir/src/app.css) (**8.726 baris**), [src/ui/App.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/App.svelte) (**2.706 baris**), dan [src/content/pusaka.ts](file:///d:/Kompetisi-UBSI/kelir/src/content/pusaka.ts) (**2.787 baris**). Pemecahan bagian `#beranda`, `#pakeliran`, serta token & komponen CSS menjadi beberapa modul terpisah akan menurunkan kompleksitas perubahan.
- Belum ada konfigurasi ESLint (`eslint.config.mjs`) maupun Prettier di repositori serta skrip `lint`/`format` di [package.json](file:///d:/Kompetisi-UBSI/kelir/package.json).

---

## 2. Temuan Senior Cybersecurity Engineer

### 2.1 [P0 - Stabilitas Error Handling API] `api/ai-studio.ts` Tanpa Blok `try/catch`
- **Lokasi:** [api/ai-studio.ts](file:///d:/Kompetisi-UBSI/kelir/api/ai-studio.ts#L60-L65).
- **Celah:** Berbeda dari `api/tanya.ts:82-95` dan `api/suluk-suara.ts:68-76` yang menangkap pengecualian dan merespons fallback aman, `api/ai-studio.ts` memanggil `await eksekusiPermintaanAiStudio(...)` tanpa `try/catch`. Error runtime tak terduga (mis. kegagalan serialisasi atau module runtime) berpotensi mengekspos respons error server 500 mentah dari Vercel.
- **Solusi:** Bungkus `eksekusiPermintaanAiStudio()` dalam `try/catch` yang mengembalikan respons JSON aman berkode 200 fallback lokal atau 500 generik tanpa stack trace.

### 2.2 [P1 - Kelonggaran Validasi Origin & Spoofing Rate-Limit Serverless]
- **Lokasi:** [httpRequestGuard.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/httpRequestGuard.ts#L68-L91) dan [aiGuardrail.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/aiGuardrail.ts#L517).
- **Celah:**
  1. Pada `httpRequestGuard.ts:88-91`, request dengan header `Origin: http://localhost:3000` tetap diizinkan meskipun `reqHost` adalah domain produksi (`kelir.vercel.app`). Situs jahat atau skrip lokal yang berjalan pada perangkat klien masih bisa memicu kuota API produksi. Izinkan origin `localhost`/`127.0.0.1` hanya jika `host` request memang berasal dari `localhost`/`127.0.0.1` atau saat `process.env.NODE_ENV !== 'production'`.
  2. Permintaan POST tanpa header `Origin` (`!origin`, baris `68-70`) diloloskan begitu saja tanpa pengecekan `Referer` atau token ringan, sehingga skrip otomatis (`curl`) bebas memanggil `/api/*`.
  3. `riwayatLaju` di `aiGuardrail.ts:517` masih memakai `Map` in-memory lokal per isolat Vercel; batas laju `60-90 req/menit` tetap dapat terpecah pada skalasi multi-isolat sebelum ditangani store terdistribusi (Vercel WAF / Upstash Redis).

### 2.3 [P1 - Privasi Data Lokal Tidak Konsisten & Kurangnya Validasi Isi `localStorage`]
- **Lokasi:** [legalInfo.ts](file:///d:/Kompetisi-UBSI/kelir/src/content/legalInfo.ts#L222-L224), [KawruhOrbSection.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KawruhOrbSection.svelte#L252-L280), dan [pencarianArsip.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/pencarianArsip.ts#L62-L79).
- **Celah:**
  1. Kebijakan Privasi (`PRIVASI 01` di `legalInfo.ts`) hanya mendeklarasikan `kelir_jejak_v1`, tema, dan bahasa, belum mencantumkan penyimpanan lokal `kelir_ai_feedback_v1` milik tombol umpan balik AI. Selain itu belum tersedia tombol aksi nyata *"Hapus Semua Data Lokal"* di `LegalInfoModal`.
  2. `bacaJejakKurasi()` pada `pencarianArsip.ts` hanya mengecek `Array.isArray(...)` dan `typeof parsed.skorKuisTertinggi === 'number'`, tanpa memvalidasi keanggotaan ID spesimen maupun rentang numerik `0..6`. Penyisipan data cacat atau `NaN`/`Infinity` ke `localStorage` dapat merusak tampilan metrik paspor & sertifikat PNG.

### 2.4 [P2 - Rantai Pasok Dev & CSP]
- `npm audit` lengkap melaporkan **7 kerentanan high severity** (`picomatch` ReDoS pada rantai dev `vite`/`vitest`/`svelte-check`), sedangkan `npm audit --omit=dev` bernilai 0 vulnerabilities.
- `vercel.json:46` mengizinkan `'unsafe-inline'` pada `style-src` untuk kebutuhan binding inline Svelte; audit berkala diperlukan bila ada penambahan script/endpoint pihak ketiga pada `connect-src`.

---

## 3. Temuan Senior AI Trainer / AI Engineer

### 3.1 [P0 - Latensi & Risiko Timeout Serverless akibat Live WebSocket Ganda Berantai]
- **Lokasi:** [aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts#L251-L315), [aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts#L488-L541), [geminiLiveBridge.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/geminiLiveBridge.ts#L165-L210).
- **Masalah:**
  1. Tugas teks terstruktur murni (`hasilkanKomparasiGemini`, `hasilkanRuteTurGemini`) serta fase teks `hasilkanPujanggaGemini` dan `hasilkanKramaGemini` tetap memakai WebSocket Live API (`Modality.AUDIO`, `includeWavAudio: false`) ketimbang `models.generateContent` REST dengan `responseMimeType: 'application/json'`.
  2. Lebih berisiko lagi pada panggilan langsung `hasilkanPujanggaGemini()` dan `hasilkanKramaGemini()`, server menjalankan **dua panggilan `panggilGemini38Live()` secara sekuensial** (WebSocket 1 untuk menyusun JSON teks hingga `26s`, lalu WebSocket 2 untuk menyintesis audio WAV hingga `14s`, total batas `40s`). Di lingkungan Vercel Hobby/Serverless default (`10s` max duration), panggilan kedua hampir pasti memicu timeout fungsi sebelum respons terkirim.

### 3.2 [P1 - Keterbatasan Memori Konteks Multi-Turn & Konsistensi Cache AI Studio]
- **Stateless Q&A:** [tanya.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/tanya.ts) dan [pamomongGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/pamomongGemini.ts) hanya memproses 1 pertanyaan terisolasi tanpa menyertakan 2-3 giliran riwayat percakapan terakhir yang telah disanitasi, sehingga pertanyaan lanjutan (*"Bagaimana cara pemeliharaannya?"*) kehilangan rujukan pusaka.
- **Versi Cache AI Studio:** `pamomongGemini.ts` telah memakai kunci berprefix `v2:`, namun `komparasiCache`, `pujanggaCache`, `kramaCache`, dan `turCache` di `aiStudioGemini.ts:46-50` belum memiliki prefix versi prompt (`v2:`) apabila format instruksi sistem diperbarui.
- **Pencocokan Morfologi BM25:** Tokenisasi di `tanya.ts` menggunakan ekspansi sinonim kamus manual + stopwords, belum menerapkan stemming sederhana prefiks/sufiks Bahasa Indonesia (`me-`, `ber-`, `pe-`, `-an`, `-nya`) sehingga varian imbuhan kata yang tidak tertulis di `SINONIM_BUDAYA` tidak saling cocok.

### 3.3 [P2 - Siklus Evaluasi & Telemetry Umpan Balik AI]
- Tombol *Terbantu / Koreksi Kurasi* (`kelir_ai_feedback_v1`) di [KawruhOrbSection.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KawruhOrbSection.svelte#L584-L606) saat ini baru tersimpan lokal tanpa mekanisme ekspor JSONL teranotasi untuk kurasi fine-tuning maupun input alasan singkat mengapa jawaban dirasa keliru.

---

## 4. Temuan Senior UI/UX Designer & Accessibility (WCAG)

### 4.1 [P0 - Tumpang-Tindih Tata Letak Nyata pada Hasil Render Playwright]
1. **Bilah `KarawitanBar` Menutupi Kontrol Aktif pada `#pakeliran` ([mp-08](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-08-pakeliran-wayang-detail.png)) & `#kawruh` ([mp-09](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-09-kawruh-pamomong-orb.png)):**
   - Pada viewport desktop `1440x900` di `#pakeliran`, posisi tetap `.karawitan-floating-wrap` di kiri bawah menutupi slider `ELEVASI SOLAH Y (0.00)`.
   - Di `#kawruh`, bilah yang sama menutupi chip rujukan sumber (`S4 · UNESCO ICH`, `#pasak`, `#paku`, `#sambungan`) ketika kartu jawaban AI berada di bagian bawah layar.
   - *Rekomendasi:* Gunakan bar karawitan ringkas/bisa diciutkan ke kapsul kecil di tepi, atau sisakan ruang margin bawah aman pada `.page-stage-shell.has-karawitan` dan posisikan konsol kontrol Pakeliran/footer kartu sedikit lebih rapat serta seimbang kanan-kiri.
2. **Panduan Pasang PWA Terpotong oleh `.mobile-bottom-dock` di Ponsel ([mp-20](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-20-mobile-footer-pwa.png) & [mp-23](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-23-mobile-pwa-popup.png)):**
   - Pada resolusi ponsel (`320px`/`390px`), teks kartu `Panduan Pasang KELIR 3D` di bagian terbawah `.site-footer` tetap tertelan di balik `.mobile-bottom-dock` (~64-72 px), dan pada [mp-23](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-23-mobile-pwa-popup.png) bingkai merah tombol/kartu terlihat bertumpuk di belakang `.pwa-install-toast`.
   - *Rekomendasi:* Naikkan `padding-bottom` `.site-footer` pada `@media (max-width: 1080px)` (bukan hanya `768px`, karena `.mobile-bottom-dock` aktif di bawah breakpoint tablet/mobile) menjadi `calc(104px + env(safe-area-inset-bottom, 0px))` dan atur `bottom` pop-up PWA agar jelas berada di atas dock.
3. **Pin Diorama `GAZEBO WASTRA` Menyinggung Teks Headline Hero ([mp-01](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-01-beranda-diorama.png)):**
   - Pin 3D `GAZEBO WASTRA` menumpuk tepat di atas huruf `"wa"` pada baris kedua headline `Menembus ke dalam jiwa pusaka.`.
   - *Rekomendasi:* Beri mask/pudaran atau geser posisi horizontal penanda bangunan sebelah kiri di viewport `1200-1440px` agar seluruh chip pin diorama tetap berada di zona kanan scrim bersih.

### 4.2 [P1 - Kesalahan Transliterasi UI Mode `'aks'`, Ellipsis Mobile, & Tabrakan Toast]
- **Transliterasi Otomatis Label Teknis di Mode `'aks'` ([i18n.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/i18n.ts#L1425-L1437)):** `tI18n('aks', key)` menerjemahkan seluruh teks kamus `'jw'` ke Aksara Jawa tanpa daftar pengecualian token teknis/pintasan seperti `WebGL`, `Offline`, `Auto-Demo`, `Ctrl+K`, `Alt+T`, `Alt+M`, `3D`, atau `PNG`. Akibatnya label seperti tombol fallback WebGL atau hint shortcut dapat berubah menjadi bentuk Carakan yang sulit dibaca pengguna.
- **Pemotongan Informasi Kartu Metrik `SulukModal` di Ponsel ([mp-14](file:///C:/Users/HP/.gemini/antigravity/brain/535b9631-dfe5-49e4-b539-e2fb657eddcf/mp-14-mobile-modal-suluk.png)):** Kartu grid 2 kolom di lebar `390px` memangkas nama instrumen dan jenis suluk (`Pathetan Nem Wantah ...`, `Rebab, Gender Barung...`). Ubah `.suluk-karawitan-strip` ke 1 kolom pada `< 440px` atau izinkan multi-baris (`white-space: normal`).
- **Tumbukan Posisi `.kelir-toast` dan `.pwa-install-toast`:** Keduanya menempel di sudut kanan-bawah pada z-index berdekatan (`App.svelte:2534` vs banner PWA) tanpa koordinasi offset vertikal saat tampil bersamaan.
- **Slider Pakeliran & Digital Twin Tanpa `aria-valuetext`:** Pengguna screen reader hanya mendengar angka desimal mentah (`0.14`, `0.00`) tanpa keterangan posisi panggung (mis. *"Panggung Kiri"* atau *"Sedang berhadapan dengan Kelir"*).

---

## 5. Temuan Senior Project Manager & Product Architect

### 5.1 [P0-P1 - Ketidaksejajaran Teknis SEO/PWA & Rute 404 Edge]
1. **Entitas HTML `&amp;` Mentah di dalam JSON-LD ([index.html](file:///d:/Kompetisi-UBSI/kelir/index.html#L90)):** Pada `<script id="kelir-jsonld" type="application/ld+json">`, nama `"Wayang Kulit Purwa Sri Rama &amp; Blencong"` memakai `&amp;`. Dalam standar HTML5, konten di dalam `<script>` tidak di-decode entitasnya, sehingga parser JSON-LD Google/AI membaca string harfiah `&amp;` alih-alih `&`.
2. **Sisa Referensi `/og-kelir.svg` & Kekosongan URL Absolut `llms-full.txt`:** [vite.config.ts](file:///d:/Kompetisi-UBSI/kelir/vite.config.ts#L236) dan [public/sw.js](file:///d:/Kompetisi-UBSI/kelir/public/sw.js#L12) masih melakukan precache terhadap `/og-kelir.svg` sementara tag Open Graph resmi telah beralih ke PNG [og-kelir.png](file:///d:/Kompetisi-UBSI/kelir/public/og-kelir.png); dan [public/llms-full.txt](file:///d:/Kompetisi-UBSI/kelir/public/llms-full.txt) belum memuat URL absolut produksi `https://kelir.vercel.app`.
3. **Status HTTP `200 OK` pada URL 404 di Vercel ([vercel.json](file:///d:/Kompetisi-UBSI/kelir/vercel.json#L2-L7)):** Rewrite `/* -> /index.html` menghasilkan HTTP 200 di jaringan untuk path salah seperti `/nyasar`, meski DOM menampakkan `NotFoundPage` dan `noindex`. Untuk kepatuhan SEO murni (*Soft 404 mitigation*), perlu dipertimbangkan mekanisme respons status HTTP 404 sebenarnya bagi path selain `/`.

### 5.2 [P1-P2 - Fitur Wajib Platform Edukasi Kuratorial & Kompetisi yang Belum Ada]
1. **Tur Onboarding Interaktif 1-Kali (First-Visit Guide):** Belum ada panduan singkat 3 langkah bagi pengunjung pertama untuk mengenali klik Pin Diorama 3D, Slider Bedah Anatomi CAD, dan Gestur Tangan Pakeliran.
2. **Tombol Salin Deep-Link Spesimen/Babak & Bagikan Kartu Ringkas:** Pengguna sudah memiliki deep-link URL (`?hal=twin&benda=saron&titik=...`), namun belum tersedia tombol UI **"Salin Tautan Spesimen"** atau **"Salin Tautan Adegan"** dengan feedback toast `.kelir-toast`.
3. **Svelte 5 Error Boundary (`<svelte:boundary>`):** Pemanggilan dinamis modul WebGL 3D belum dibungkus `<svelte:boundary>` agar error lokal tidak merobohkan seluruh shell aplikasi.
4. **Riwayat Tanya-Jawab Sesi & Ekspor Catatan Belajar (`.md` / `.txt`) di `#kawruh`:** Pengguna belum bisa meninjau pertanyaan sebelumnya dalam satu sesi kunjungan maupun mengekspor rangkuman studi S1-S7.
5. **Sinkronisasi Narasi Teks + Opsi Suara Dalang di `Auto-Demo Lakon` Pakeliran:** Saat mode Auto-Demo berjalan, belum tersedia opsi otomatis membunyikan suluk/narasi dalang sinkron antar adegan 1-4 dan status progres adegan langsung.

---

## 6. Temuan Senior Quality Assurance (QA) Lead

### 6.1 [P1 - Modul Inti Tanpa Cakupan Unit Test (8 Modul = 0% Unit Test)]
Dari inventaris `src/` dan `tests/unit/`, masih terdapat 8 modul fungsional penting tanpa unit test terdedikasi:
1. [src/lib/pencarianArsip.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/pencarianArsip.ts) (integritas indeks, pencarian lintas 4 bahasa, ketahanan `bacaJejakKurasi`).
2. [src/lib/piagamKurator.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/piagamKurator.ts) (sanitasi nama anti-injeksi & format nama file Piagam PNG).
3. [src/lib/dalangVoice.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/dalangVoice.ts) (konsistensi naskah 4 babak & kode bahasa BCP-47).
4. [src/lib/audioBudaya.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/audioBudaya.ts) (siklus status real-time gending, ducking volume narasi, state aman tanpa `AudioContext`).
5. [src/lib/handTracker.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/handTracker.ts) (klasifikasi geometri 21 landmark tangan ke 6 gestur: `cubit`, `kepal`, `tunjuk`, `dua-jari`, `tiga-jari`, `terbuka`).
6. [src/lib/focusTrap.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/focusTrap.ts) (siklus fokus melingkar `Tab`/`Shift+Tab` dan restorasi fokus saat tutup modal).
7. [src/server/aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts) & [src/server/sulukVoiceGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/sulukVoiceGemini.ts) (kontrak audio dalang, audio suluk fallback, dan validasi schema JSON).
8. [src/scenes/threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts) (tidak adanya test kontrak DOM untuk event `kelirwebglstatus` menjadi penyebab langsung lolosnya bug **1.1**!).

### 6.2 [P1-P2 - Celah Pengujian End-to-End Playwright (`tests/e2e/kelir.spec.ts`)]
- **Absennya Audit Aksesibilitas Otomatis (`@axe-core/playwright`):** Suite 6 memverifikasi shortcut & focus trap SearchModal, tetapi belum menyapu seluruh DOM 5 halaman + 3 modal terhadap pelanggaran WCAG A/AA (`color-contrast`, `aria-required-children`, `button-name`).
- **Belum Ada E2E Mock untuk Jalur `pamomong-live` & Simulasi `WEBGL_lose_context`:** Seluruh E2E memaksa mode lokal (`KELIR_DISABLE_LIVE_GEMINI=1`) dan belum pernah memaksa `WEBGL_lose_context` via `page.evaluate()` untuk menguji kemunculan nyata `<WebGLStatusBanner>`.
- **Tingginya Ketergantungan `waitForTimeout` & Durasi Lambat:** Ditemukan **58 panggilan `waitForTimeout`** tetap pada `tests/e2e/kelir.spec.ts` serta eksekusi single-worker sepanjang **7.5 menit** yang memperlambat umpan balik CI PR/Push.
- **Skenario Terlewat pada E2E:** Belum ada verifikasi Playwright khusus untuk mode Bahasa Aksara Jawa (`aks`), *focus trap* pada `LegalInfoModal` & `SulukModal`, serta kontrol Pakeliran baru (`Solah Y`, `Depth Z`, `Walikan`) pada viewport mobile `320px`/`390px`.

---

## 7. Peta Jalan Eksekusi V2 Terprioritas (Backlog Siap Kerjakan)

| Prioritas | Kode | Pekerjaan | Dampak Utama | Berkas Sasaran |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | BUG-01 | Perbaiki kontrak event `kelirwebglstatus` (`bubbles: true`, `{ state }`), pancarkan di cabang `if (!gl)`, & tambahkan `{#key}` stage remount | WebGL fallback banner benar-benar muncul & memulihkan state tanpa reload penuh | [threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts), [WebGLStatusBanner.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/WebGLStatusBanner.svelte), [App.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/App.svelte) |
| **P0** | UX-03 | Atasi tumpang-tindih `KarawitanBar` di `#pakeliran`/`#kawruh`, naikkan footer bottom clearance mobile `<=1080px` agar kartu PWA bebas dock, & geser pin `GAZEBO WASTRA` | Zero visual overlap terkonfirmasi di desktop `1440px` & ponsel `320/390px` | [app.css](file:///d:/Kompetisi-UBSI/kelir/src/app.css), [KarawitanBar.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KarawitanBar.svelte), [livingPendopoStage.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/livingPendopoStage.ts) |
| **P0** | SEC-04 | Tambah `try/catch` pada `api/ai-studio.ts`, perketat izin Origin `localhost` khusus environment dev/non-prod, & perketat validasi skema `bacaJejakKurasi()` | Hilangkan potensi crash HTTP 500 & tutup celah Origin localhost di produksi | [api/ai-studio.ts](file:///d:/Kompetisi-UBSI/kelir/api/ai-studio.ts), [httpRequestGuard.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/httpRequestGuard.ts), [pencarianArsip.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/pencarianArsip.ts) |
| **P0** | AI-03 | Pangkas risiko timeout 2-WebSocket sekuensial pada Pujangga/Krama (kembalikan teks dulu / audio opsional paralel) & perbaiki `&amp;` mentah di JSON-LD [index.html](file:///d:/Kompetisi-UBSI/kelir/index.html#L90) | Hindari timeout 10s Vercel & perbaiki validitas Schema.org JSON-LD | [aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts), [index.html](file:///d:/Kompetisi-UBSI/kelir/index.html) |
| **P1** | ENG-02 | Disposisi material texture non-`sharedCache` di `disposeSceneObject()`, hapus impor `.woff` duplikat (-418 KB), & hapus precache `/og-kelir.svg` | Hemat memori GPU WebGL & pangkas ~418 KB beban distribusi font | [threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts), [main.ts](file:///d:/Kompetisi-UBSI/kelir/src/main.ts), [vite.config.ts](file:///d:/Kompetisi-UBSI/kelir/vite.config.ts), [sw.js](file:///d:/Kompetisi-UBSI/kelir/public/sw.js) |
| **P1** | UX-04 | Pengecualian token teknis (`WebGL`, `Ctrl+K`, `Alt+T`, `3D`) di mode `aks`, stack 1-kolom metrik `SulukModal` `<440px`, offset toast vs banner PWA, & update [legalInfo.ts](file:///d:/Kompetisi-UBSI/kelir/src/content/legalInfo.ts) untuk `kelir_ai_feedback_v1` + tombol Reset Data | Konsistensi baca Aksara Jawa, modal ponsel bebas ellipsis, & kepatuhan privasi penuh | [i18n.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/i18n.ts), [app.css](file:///d:/Kompetisi-UBSI/kelir/src/app.css), [legalInfo.ts](file:///d:/Kompetisi-UBSI/kelir/src/content/legalInfo.ts), [LegalInfoModal.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/LegalInfoModal.svelte) |
| **P1** | AI-04 | Tambah multi-turn context ter-sanitasi (maks. 2 giliran) pada Pamomong, prefix cache `v2:` di `aiStudioGemini.ts`, stemming ringan Bahasa Indonesia BM25, & tombol ekspor dataset JSONL umpan balik | Relevansi percakapan lanjutan & loop perbaikan model AI yang bisa ditindaklanjuti | [tanya.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/tanya.ts), [aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts), [KawruhOrbSection.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KawruhOrbSection.svelte) |
| **P1** | QA-02 | Tambah unit test untuk `threeHelpers`, `focusTrap`, `handTracker`, `piagamKurator`, `pencarianArsip`, `dalangVoice`, `audioBudaya`, serta E2E `@axe-core/playwright` + simulasi `WEBGL_lose_context` + mock API live | Tangkap regresi DOM/WebGL lebih awal & perkaya jaminan WCAG otomatis | [tests/unit/](file:///d:/Kompetisi-UBSI/kelir/tests/unit), [tests/e2e/kelir.spec.ts](file:///d:/Kompetisi-UBSI/kelir/tests/e2e/kelir.spec.ts), [package.json](file:///d:/Kompetisi-UBSI/kelir/package.json) |
| **P2** | PM-03 | Tambah `<svelte:boundary>`, tur onboarding 1x, tombol salin tautan deep-link kurasi + riwayat sesi AI & ekspor catatan `.md`, plus ESLint & pemecahan CSS/App.svelte bertahap | Ketahanan UI produksi, kemudahan kolaborasi tim, dan fitur kompetisi menyeluruh | [App.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/App.svelte), [DigitalTwinStudio.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/DigitalTwinStudio.svelte), [KawruhOrbSection.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KawruhOrbSection.svelte) |

---

## 8. Status Eksekusi & Verifikasi Remediasi V2

Seluruh backlog prioritas **P0, P1, dan P2** di atas telah dieksekusi dan lolos verifikasi otomatis lintas 6 peran senior, **kecuali satu fitur yang dikecualikan secara eksplisit oleh permintaan pengguna**:
- **Dikecualikan (Tidak Dibangun):** *Riwayat Tanya-Jawab Sesi & Ekspor Catatan Belajar (`.md` / `.txt`) yang terlihat pengguna di `#kawruh`*. (Konteks follow-up internal maks. 2 giliran `riwayatTanyaInternal` -> `riwayatSingkat` tetap aktif diam-diam hanya sebagai konteks prompt ter-sanitasi tanpa antarmuka riwayat maupun unduhan catatan).

| Kode | Status | Ringkasan Implementasi & Bukti Verifikasi |
| :--- | :--- | :--- |
| **BUG-01** | **SELESAI & TERUJI** | Event `kelirwebglstatus` (`bubbles: true`, `{ state, ok, reason }`) + cabang `if (!gl)` di [threeHelpers.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/threeHelpers.ts), sinkronisasi [WebGLStatusBanner.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/WebGLStatusBanner.svelte), dan `{#key *RetrySeq}` di `App.svelte` / komponen 3D. Teruji di unit test [threeHelpersWebgl.test.ts](file:///d:/Kompetisi-UBSI/kelir/tests/unit/threeHelpersWebgl.test.ts) dan simulasi E2E `kelirwebglstatus` + Retry (`Suite 7`). |
| **UX-03** | **SELESAI & TERUJI** | Tambah tombol ciutkan/bentangkan di [KarawitanBar.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KarawitanBar.svelte), penyesuaian tinggi kanvas `#pakeliran`, clearance bawah halaman saat karawitan aktif & `.site-footer` mobile (`142px`), posisi atas `.kelir-toast`, serta kalibrasi `GAZEBO WASTRA` di [livingPendopoStage.ts](file:///d:/Kompetisi-UBSI/kelir/src/scenes/livingPendopoStage.ts). Terverifikasi lewat tangkapan layar `mp-01`, `mp-08`, `mp-09`, `mp-20`, `mp-23`. |
| **SEC-04** | **SELESAI & TERUJI** | Guard `try/catch` 500 aman di [api/ai-studio.ts](file:///d:/Kompetisi-UBSI/kelir/api/ai-studio.ts), pembatasan Origin `localhost` khusus dev/lokal + validasi `Referer` di [httpRequestGuard.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/httpRequestGuard.ts), serta validasi ketat array & rentang skor `0..6` pada `bacaJejakKurasi()` di [pencarianArsip.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/pencarianArsip.ts). |
| **AI-03** | **SELESAI & TERUJI** | Budget waktu sisa serverless (`remainingBudgetMs`) di [aiStudioGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/aiStudioGemini.ts) sebelum WebSocket audio kedua Pujangga/Krama, perbaikan `&amp;` -> `&` JSON-LD di [index.html](file:///d:/Kompetisi-UBSI/kelir/index.html), serta pelestarian `<krn>`/`U+A980` di [seoGeo.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/seoGeo.ts). |
| **ENG-02** | **SELESAI & TERUJI** | Tandai tekstur cache bersama via `tandaiTeksturCacheBersama` dan bebaskan tekstur non-`sharedCache` di `disposeSceneObject()`, hapus `.woff` duplikat via [vite.config.ts](file:///d:/Kompetisi-UBSI/kelir/vite.config.ts) (`woffCount=0` di `dist/assets/`), serta bersihkan `/og-kelir.svg` dari precache [sw.js](file:///d:/Kompetisi-UBSI/kelir/public/sw.js). |
| **UX-04** | **SELESAI & TERUJI** | Pengecualian token teknis (`Ctrl+K`, `Alt+T`, `Offline`, `Auto-Demo`, `GPU`, `PNG`, `JSONL`) di [aksara.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/aksara.ts), 1-kolom `SulukModal` `<440px`, pembaruan `PRIVASI 01` ([legalInfo.ts](file:///d:/Kompetisi-UBSI/kelir/src/content/legalInfo.ts)) + tombol hapus data lokal (`btn-reset-local-data` di [LegalInfoModal.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/LegalInfoModal.svelte)), dan penguatan kontras WCAG 2.1 AA (`--accent-ember: #b03812`, `--text-muted: #474c57`, `.etalase-tabs role="group"`, `aria-label` tombol navigasi/pin). |
| **AI-04** | **SELESAI & TERUJI** | Konteks internal 2 giliran ter-sanitasi (`sanitasiRiwayatSingkatAman` di [pamomongGemini.ts](file:///d:/Kompetisi-UBSI/kelir/src/server/pamomongGemini.ts)), stemming afiks Bahasa Indonesia (`stemTokenIndonesia` di [tanya.ts](file:///d:/Kompetisi-UBSI/kelir/src/lib/tanya.ts)), cache prefix `v2:` di `aiStudioGemini.ts`, serta tombol ekspor JSONL umpan balik di [KawruhOrbSection.svelte](file:///d:/Kompetisi-UBSI/kelir/src/ui/components/KawruhOrbSection.svelte). |
| **QA-02** | **SELESAI & TERUJI** | Penambahan 3 suite unit test baru ([threeHelpersWebgl.test.ts](file:///d:/Kompetisi-UBSI/kelir/tests/unit/threeHelpersWebgl.test.ts), [uiAndUtils.test.ts](file:///d:/Kompetisi-UBSI/kelir/tests/unit/uiAndUtils.test.ts), [aiServerStudio.test.ts](file:///d:/Kompetisi-UBSI/kelir/tests/unit/aiServerStudio.test.ts)) menjadi 20 file / 94 unit test lulus, serta Suite 7 E2E (`@axe-core/playwright` WCAG 2.1 AA 0 pelanggaran, `kelirwebglstatus` recover, mocked `/api/tanya`, onboarding, reset privasi, dan mobile Pakeliran). |
| **PM-03** | **SELESAI & TERUJI** | Pembungkus `<svelte:boundary>`, bilah onboarding kunjungan perdana, salin tautan adegan Pakeliran (`salinTautanPakeliran`), sinkronisasi narasi demo Pakeliran, generator `dist/404.html` + penyesuaian `vercel.json`, [eslint.config.mjs](file:///d:/Kompetisi-UBSI/kelir/eslint.config.mjs) + integrasi CI `npm run lint` (`0` error & `0` warning). |

### Gerbang Kualitas Akhir
- `npm run lint`: **0 errors, 0 warnings**
- `npm run check`: **0 errors, 0 warnings**
- `npm run test:unit`: **20 test files passed, 94/94 tests passed**
- `npm run build`: **sukses (`dist/404.html` ada, `0` berkas `.woff` di `dist/assets/`)**
- `npm audit --omit=dev`: **0 vulnerabilities**
- `npm run test:e2e:ci`: **7 passed (`Suite 1..Suite 7`), 0 failed**

