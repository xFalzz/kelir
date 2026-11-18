# Audit Teknis & Strategis Lintas Disiplin Platform KELIR

**Tanggal Audit:** 18 November 2026  
**Ruang Lingkup:** Seluruh basis kode `kelir/` (`api/`, `src/server/`, `src/lib/`, `src/scenes/`, `src/ui/`, `public/`, `tests/`, `vercel.json`, `vite.config.ts`, `index.html`, `package.json`).  
**Peran Peninjau:** Senior Software Engineer, Senior AI Trainer/Engineer, Senior UI/UX Designer, Senior Cybersecurity Engineer, Senior Project Manager, dan Senior QA Lead.

---

## Ringkasan Eksekutif

KELIR memiliki fondasi produk edukasi budaya yang kuat secara konsep dan fitur: arsitektur 5 ruang kurasi spasial 3D WebGL, deteksi tangan MediaPipe 21 titik secara lokal, sintesis WebAudio karawitan, 86 katalog Aksara Jawa Unicode `U+A980-U+A9DF`, serta mekanisme *dual-layer fallback* BM25 lokal agar aplikasi tetap berjalan saat luring. Tidak ditemukan penggunaan sink XSS berbahaya seperti `{@html}`, `innerHTML`, atau `eval(` di kode sumber aplikasi.

Namun dari tinjauan mendalam lintas 6 disiplin, ditemukan **celah kritis pada kesiapan produksi, keamanan endpoint AI, stabilitas latensi serverless, tata letak & aksesibilitas WCAG, kebocoran/pembengkakan aset WebGL/WASM, konflik domain SEO, dan celah kualitas QA**.

| Disiplin | Status Kematangan | Jumlah Temuan Kunci | Prioritas Tertinggi |
| :--- | :--- | :---: | :--- |
| **Cybersecurity** | Perlu Perbaikan Segera | 7 | Bypass batas body 16KB di Vercel, absennya CSP & Origin check, bypass guardrail via `konteksUnsur` |
| **AI Engineering** | Perlu Arsitektur Ulang Ringan | 6 | Pemanggilan WebSocket `v1alpha` `gemini-3.8-live` untuk request teks REST sinkron, celah homoglyph/regex stateful, nol eval pipeline |
| **UI/UX & A11y** | Baik secara Visual, Kurang di A11y | 7 | Tanpa *focus trap* modal & skip-link, shortcut 1-huruf melanggar WCAG 2.1.4, tidak ada fallback UI saat WebGL gagal/hilang & indikator luring |
| **Software & Perf** | Perlu Optimasi Aset & GPU | 6 | ~37 MB aset WASM + ~1.47 MB HDR yatim piatu (`studio_small_08_1k.hdr`), 2 konteks WebGL serentak saat SulukModal terbuka, kebocoran `envRT` |
| **Project Manager** | Konflik Rilis & Fitur Kurang | 6 | Bentrok domain kanonik `xfalzz.github.io/kelir` vs root `/` Vercel, ketiadaan CI/CD & linter, kurang fitur wajib (export kartu, tur perdana, kontrol keyboard pakeliran) |
| **Quality Assurance** | Cakupan Fungsional Bagus, Celah Teknis | 6 | E2E menonaktifkan AI (`KELIR_DISABLE_LIVE_GEMINI=1`), durasi ~10 menit sekuensial, nol tes HTTP API/413/429, nol audit `axe-core` & offline/WebGL lost test |

---

## 1. Temuan Senior Cybersecurity Engineer

### 1.1 [P0 · Tinggi] Bypass Pembatasan Ukuran Payload `BATAS_BODY_BYTES` 16 KB di Vercel
- **Lokasi:** `api/tanya.ts:53-56`, `api/suluk-suara.ts:49-52`, `api/ai-studio.ts:44-47`.
- **Bukti Kode:** Seluruh handler memeriksa `if (typeof req.body === 'string' && req.body.length > BATAS_BODY_BYTES)`.
- **Celah:** Pada runtime Vercel Serverless, permintaan dengan header `Content-Type: application/json` otomatis di-parse menjadi JavaScript `object` oleh platform sebelum masuk ke `handler`, sehingga `typeof req.body === 'string'` bernilai `false`. Penyerang dapat mengirim JSON sangat besar atau bersarang dalam (*deeply nested*) hingga batas platform 4.5 MB dan melewati pagar `16_384` byte. Pada `vite.config.ts:84`, pengecekan juga memakai `rawBody.length` (panjang karakter UTF-16, bukan `Buffer.byteLength`) setelah `TextDecoder.decode()`.
- **Solusi:** Cek header `Content-Length` lebih awal, akumulasikan ukuran `byteLength` aktual pada stream/object terukur, dan batasi kedalaman/ukuran properti JSON.

### 1.2 [P0 · Tinggi] Injeksi Prompt Melalui Parameter `konteksUnsur` Tanpa Penyaringan Keamanan
- **Lokasi:** `api/tanya.ts:87-100`, `src/server/pamomongGemini.ts:127-134`, `vite.config.ts:155-165`.
- **Celah:** Input `pertanyaan` diperiksa oleh `deteksiSeranganAtauLuarTopik()`, tetapi objek `konteksUnsur` (`judulUnsur`, `material`, `fungsiTeknis`, `ringkasan`) dari body HTTP klien langsung dimasukkan ke blok `<unsur_anatomi_3d>` hanya melalui `bersihkanInputPengguna()`. Penyerang yang mengirim payload HTTP langsung bisa menyisipkan instruksi pengambilalihan peran (*prompt injection*) di field `material` atau `ringkasan`. Selain itu di `api/tanya.ts:84`, variabel `pertanyaanBersih` dihitung lalu tidak dipakai.
- **Solusi:** Wajib lookup `konteksUnsur` murni di sisi server berdasarkan `(bendaId, titikId)` dari `DAFTAR_BEDAH_TWIN` sehingga klien tidak bisa menyuntikkan teks bebas ke dalam konteks anatomi. Hapus dead variable `pertanyaanBersih`.

### 1.3 [P1 · Tinggi] Rate Limiting Tidak Efektif (In-Memory & `X-Forwarded-For` Spoofable) + Tanpa Validasi Origin
- **Lokasi:** `api/tanya.ts:39-51`, `api/suluk-suara.ts:35-47`, `api/ai-studio.ts:30-42`, `src/lib/aiGuardrail.ts:464-487`.
- **Celah:**
  1. `riwayatLaju` adalah `Map` lokal di memori proses. Pada arsitektur serverless (banyak instans paralel & *cold start*), pembatasan `60-120 req/menit` mudah ditembus untuk menguras kuota `GEMINI_API_KEY`.
  2. Membaca IP dari elemen pertama `x-forwarded-for.split(',')[0]` tanpa memvalidasi rantai proxy rentan dipalsukan klien (`X-Forwarded-For: 1.2.3.4`), sementara Vercel menyediakan `x-vercel-forwarded-for` atau `x-real-ip` dari edge tepercaya.
  3. Ketiga endpoint `/api/*` belum memeriksa header `Origin` / `Sec-Fetch-Site` untuk mencegah penyalahgunaan API oleh situs pihak ketiga (cross-origin resource consumption).
- **Solusi:** Gunakan `x-vercel-forwarded-for` / `x-real-ip` tepercaya, terapkan penyimpanan rate limit terdistribusi (Upstash Redis / Vercel KV / WAF Edge), dan terapkan pengecekan `Origin`/`Host` allowlist + CORS ketat.

### 1.4 [P1 · Sedang] Header Keamanan HTTP Belum Lengkap di Konfigurasi Deployment
- **Lokasi:** `vercel.json:8-42`.
- **Celah:** Saat ini hanya terpasang `X-Content-Type-Options: nosniff` secara global. Belum ada `Content-Security-Policy` (khususnya pengaturan `wasm-unsafe-eval` untuk MediaPipe), `X-Frame-Options: DENY` / `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy: camera=(self), microphone=(), geolocation=()`, maupun `Strict-Transport-Security`.
- **Solusi:** Tambahkan header keamanan standar industri pada blok `headers` di `vercel.json`.

### 1.5 [P2 · Sedang] Kerentanan Rantai Dependensi Dev (`npm audit`: 7 High Severity)
- **Bukti Observasi:** `npm audit` melaporkan **7 kerentanan high severity** terkait ReDoS pada `picomatch` (`GHSA-fc5q-39xc-vjpf`) yang memengaruhi rantai paket `fdir`, `tinyglobby`, `vite`, `vitest`, `svelte-check`, dan `@sveltejs/vite-plugin-svelte`. Paket runtime produksi aman dari temuan kritis.

---

## 2. Temuan Senior AI Trainer / AI Engineer

### 2.1 [P0 · Arsitektural] Penggunaan WebSocket Stateful `v1alpha` (`gemini-3.8-live`) untuk Semua Tugas REST Sinkron
- **Lokasi:** `src/server/geminiLiveBridge.ts:5-237`, `src/server/pamomongGemini.ts:261-275`, `src/server/aiStudioGemini.ts:136-143`.
- **Masalah:** Seluruh panggilan teks murni (Tanya Pamomong, Komparator JSON, Pujangga JSON, Krama JSON, Rute Tur JSON) membuka **koneksi WebSocket Live API (`Modality.AUDIO`, `apiVersion: 'v1alpha'`)** yang mengalirkan audio PCM 24kHz lalu **membuang audionya** (`includeWavAudio: false`) hanya untuk mengambil `outputAudioTranscription`.
- **Dampak:** Latensi jauh lebih lambat daripada REST, rawan melebihi timeout Vercel Serverless 10 detik, ekstraksi JSON dari transkrip ucapan tidak deterministik, serta pada `geminiLiveBridge.ts:164` timeout dengan partial audio/text bisa langsung me-resolve jawaban terpotong.
- **Solusi:** Gunakan `models.generateContent` REST (`responseMimeType: 'application/json'` + schema) untuk seluruh output teks & JSON terstruktur; khususkan Live/Audio API hanya untuk sintesis suara (`suluk-suara`, `dalang-suara`).

### 2.2 [P1 · Keamanan Model] Celah Bypass Pagar Guardrail & Stateful Global RegExp
- **Lokasi:** `src/lib/aiGuardrail.ts:42-218`.
- **Celah:**
  1. **Homoglyph & Double Encoding:** `buatVarianDeobfuskasi()` hanya melakukan `decodeURIComponent()` satu kali dan tidak menormalkan homoglyph aksara (mis. huruf Sirilik yang identik visual).
  2. **Global Regex `.test()` (`DELIMITER_BERBAHAYA_RE`):** Regex ber-flag `/gi` pada baris 43 rentan *stateful `lastIndex`* saat dipakai dengan `.test()`.
  3. **Cache In-Memory Lokal & Filter Output Statis:** Cache server terpisah antar instans Vercel tanpa tag versi prompt/korpus, sedangkan `JANGKAR_BUDAYA_OUTPUT_RE` berbasis keyword tetap rawan false-positive menolak topik budaya langka Nusantara.

### 2.3 [P2 · Kualitas Training & Evaluasi] Belum Ada Golden Evaluation Set & Telemetry Kualitas Jawaban
- Belum ada *eval harness* otomatis untuk mengukur Groundedness Score, Hallucination Rate, dan akurasi penolakan vs penerimaan topik Nusantara lintas 4 bahasa (`id`, `en`, `jw`, `aks`).
- Belum ada kontrol *feedback* pengguna (*Bermanfaat / Laporkan Kekeliruan Budaya*) untuk iterasi kurasi berkelanjutan.

---

## 3. Temuan Senior UI/UX Designer & Accessibility (WCAG)

### 3.1 [P0 · Aksesibilitas] Modal Dialog Tanpa *Focus Trap*, Tanpa Pemulihan Fokus & Ketiadaan *Skip Link*
- **Lokasi:** `src/ui/App.svelte:1509`, `SearchModal.svelte:120-135`, `LegalInfoModal.svelte:79-95`, `SulukModal.svelte`, `src/app.css:6697`.
- **Temuan:** Ketiga modal tidak mengunci `Tab`/`Shift+Tab` di dalam dialog (*focus trap*) dan tidak mengembalikan fokus ke tombol pemicu saat ditutup; belum ada link *Skip to main content* `#main-content`; `.search-modal-input` menghapus `outline: none` tanpa gaya fokus terlihat pengganti pada kontainer input.

### 3.2 [P1 · Aksesibilitas] Pintasan Papan Ketik 1-Huruf Tanpa Modifier (`t`, `m`, `?`)
- **Lokasi:** `src/ui/App.svelte:1454-1462`.
- **Temuan:** Shortcut 1-karakter tanpa tombol modifier melanggar **WCAG 2.1.4 Character Key Shortcuts** bagi pengguna dikte suara atau alat bantu navigasi. Gunakan kombinasi modifier (`Alt+T`, `Alt+M`) atau opsi menonaktifkan pintasan.

### 3.3 [P1 · UI/UX Ketahanan] Tidak Ada Tampilan Fallback Saat WebGL Gagal / Hilang & Status Luring Tersembunyi
- **Lokasi:** `src/scenes/threeHelpers.ts:35-78`, `src/lib/pwa.ts:80-89`, `src/ui/App.svelte:1331-1341`, `DigitalTwinStudio.svelte:351`.
- **Temuan:**
  1. Saat WebGL tidak tersedia (`null`) atau mengalami `webglcontextlost`, panggung 3D tampil sebagai area kosong gelap tanpa pesan informatif maupun ilustrasi cadangan.
  2. State `offline` di `pwa.ts` tidak pernah dirender pada `App.svelte` sebagai indikator UI luring.
  3. Perpindahan halaman belum mengumumkan judul baru melalui `aria-live="polite"`.

### 3.4 [P2 · Tata Letak & Ergonomi Interaksi] Overlap Mini Player & Keterbatasan Kontrol Non-Kamera Pakeliran
- `KarawitanBar` kiri-bawah sempat menumpang di atas pojok kartu konten saat halaman digulir pada layar desktop/mobile.
- Pakeliran belum menyediakan kontrol slider/tombol manual untuk elevasi Y (*solah*), jarak Blencong (`Z`), atau membalik arah (*walikan*) tanpa webcam, maupun *toast feedback* konfirmasi salin URL/piagam.

---

## 4. Temuan Senior Software Engineer & WebGL/Performance Architect

### 4.1 [P0 · Performa & Beban Aset] Pembengkakan Aset Statis ~40 MB & File Yatim Piatu
- `public/textures/studio_small_08_1k.hdr` (**1,473.5 KB / ~1.47 MB**) tidak pernah dipakai di mana pun di `src/`, `index.html`, maupun `public/sw.js` (sudah diganti scene prosedural `ambilSceneStudioRingan()`).
- `@fontsource-variable/fraunces` dan `@fontsource/atkinson-hyperlegible` tercantum di `package.json` dependencies tanpa diimpor di kode aplikasi.
- `public/mediapipe/` menyimpan total **~36.8 MB** biner (`vision_wasm_internal.wasm` 14.26 MB + `vision_wasm_module_internal.wasm` 14.26 MB + `hand_landmarker.task` 7.64 MB + JS ~670 KB), ditambah ~3.1 MB tekstur JPG 1K.

### 4.2 [P1 · Manajemen WebGL] Potensi Dua Konteks WebGL Aktif & Kebocoran `WebGLRenderTarget`
- Membuka `SulukModal` saat berada di `03 · Coverflow` membuat `CoverflowStage` (latar belakang) dan `SulukShowcaseStage` (di dalam modal) sama-sama memegang konteks WebGL aktif secara bersamaan (bertentangan dengan prinsip `DESIGN.md` baris 26).
- `applyStudioHDR()` di `src/scenes/threeHelpers.ts:274-276` tidak mendispose object `WebGLRenderTarget` (`envRT.dispose()`) setelah memindahkan `.texture` ke `scene.environment`.
- Belum ada handler `webglcontextlost` / `webglcontextrestored` maupun `<svelte:boundary>`.

### 4.3 [P2 · Pemeliharaan Kode] Duplikasi Logika Middleware API
- Logika parsing JSON, rate limit, batas 16 KB, dan validasi `BAHASA_VALID` terduplikasi di 4 berkas (`vite.config.ts`, `api/tanya.ts`, `api/suluk-suara.ts`, `api/ai-studio.ts`). Sebaiknya disatukan dalam satu modul `src/server/httpHandler.ts`.

---

## 5. Temuan Senior Project Manager & Product Architect

### 5.1 [P0 · Rilis & SEO] Bentrok Domain Kanonik (`xfalzz.github.io/kelir` vs Root `/` Vercel) & Format `og:image`
- **Lokasi:** `index.html:25-54`, `src/lib/seoGeo.ts:19`, `public/robots.txt:19`, `public/sitemap.xml`, `public/llms.txt`, `public/manifest.webmanifest`.
- Canonical/sitemap/robots/llms mengarah ke subpath `https://xfalzz.github.io/kelir/...`, sementara `manifest.webmanifest`, `vercel.json`, dan seluruh asset path (`/assets/`, `/sw.js`, `/icons/`) berjalan pada root domain `/` Vercel. Selain itu `<meta property="og:image" content="/og-kelir.svg" />` memakai path relatif berformat `.svg` yang sering ditolak crawler media sosial (butuh `.png` `1200x630` absolut HTTPS).

### 5.2 [P1 · Tata Kelola Repo & Dokumentasi] Ketiadaan CI/CD, Linter & Sinkronisasi Dokumentasi
- Belum ada `.github/workflows/` CI/CD maupun skrip `lint`/`format` di `package.json`.
- `README.md:34` masih mendokumentasikan `studio_small_08_1k.hdr` yang faktanya sudah tidak dipanggil kode.

### 5.3 [P1-P2 · Fitur Wajib yang Belum Ada]
1. **PWA `screenshots` Richer Install UI** di `manifest.webmanifest` (minimal 1 *wide* dan 1 *narrow*).
2. **Banner / Indikator Mode Offline** nyata di antarmuka memanfaatkan `pwa.ts`.
3. **Kontrol Pakeliran Lengkap Non-Kamera & Auto-Demo Lakon** (sinkronisasi narasi, animasi tokoh, panah, dan gamelan otomatis).
4. **Onboarding Mini 1-Kali Pengunjung Pertama, Toast Konfirmasi Aksi, & Export/Share Kartu Kurasi**.

---

## 6. Temuan Senior Quality Assurance (QA) Lead

### 6.1 [P1 · Cakupan Uji Otomatis]
- Belum ada tes HTTP/integrasi endpoint `/api/tanya`, `/api/suluk-suara`, `/api/ai-studio` (`400`, `405`, `413`, `429`, dan validasi `konteksUnsur` / mock WebSocket Live).
- `playwright.config.ts:24` menonaktifkan AI server secara global (`KELIR_DISABLE_LIVE_GEMINI: '1'`) tanpa menguji skenario respons live (via mock/contract test).
- Modul `pencarianArsip.ts`, `dalangVoice.ts`, `piagamKurator.ts`, `audioBudaya.ts`, dan `handTracker.ts` belum memiliki unit test khusus.
- Belum ada uji otomatis untuk *offline Service Worker*, simulasi `webglcontextlost`, audit aksesibilitas `@axe-core/playwright`, serta paralelisasi worker E2E (saat ini berjalan ~9-11 menit dengan 1 worker).

---

## 7. Peta Jalan Eksekusi Terprioritas (Action Plan)

| Prioritas | Kode | Pekerjaan | Dampak Utama | Berkas Sasaran | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | SEC-01 | Perbaiki validasi byte payload `>16 KB` untuk objek JSON Vercel & `Buffer.byteLength` di Vite | Tutup celah DoS memori/kuota | `api/*.ts`, `vite.config.ts`, `src/server/httpRequestGuard.ts` | **Selesai** |
| **P0** | SEC-02 | Sanitasi ketat `konteksUnsur` via guardrail (`sanitasiKonteksUnsurAman`) + hapus dead variable | Tutup celah *prompt injection* | `src/lib/aiGuardrail.ts`, `src/server/pamomongGemini.ts`, `api/tanya.ts` | **Selesai** |
| **P0** | AI-01 | Pertahankan kontrak wajib `gemini-3.8-live` (`geminiModel.test.ts`), perketat timeout partial (`>=45` char & `>=4` chunk) & kunci cache `v2:` | Stabilkan fallback & hindari cache poison | `src/server/geminiLiveBridge.ts`, `src/server/pamomongGemini.ts` | **Selesai (Mitigasi)** |
| **P0** | PM-01 | Selaraskan domain produksi Vercel (`https://kelir.vercel.app`) di SEO/sitemap/robots/llms + buat `og-kelir.png` `1200x630` | Hilangkan konflik domain SEO & rusaknya *share card* | `index.html`, `seoGeo.ts`, `public/*` | **Selesai** |
| **P1** | SEC-03 | Tambahkan CSP (`wasm-unsafe-eval`), `Permissions-Policy`, `Referrer-Policy`, `X-Frame-Options` + Origin check & rate limit IP tepercaya | Standar keamanan produksi web | `vercel.json`, `src/server/httpRequestGuard.ts`, `api/*.ts` | **Selesai** |
| **P1** | UX-01 | Tambah *Skip Link*, *Focus Trap* & restorasi fokus modal, modifier shortcut `Alt+T/M` (WCAG 2.1.4), indikator Offline & WebGL fallback | Patuh WCAG 2.1 AA | `App.svelte`, `*Modal.svelte`, `focusTrap.ts`, `WebGLStatusBanner.svelte` | **Selesai** |
| **P1** | ENG-01 | Hapus `studio_small_08_1k.hdr` (1.47 MB) & 2 font yatim, jeda Coverflow 3D saat SulukModal aktif, dispose `envRT`, hapus duplikasi middleware | Hemat ~1.47 MB aset & cegah kebocoran GPU | `package.json`, `public/`, `threeHelpers.ts`, `coverflowStage.ts`, `httpRequestGuard.ts` | **Selesai** (WASM MediaPipe lokal dipertahankan untuk mode edge luring) |
| **P2** | AI-02 | Normalisasi homoglyph Sirilik/Yunani + decode URL multi-pass (3x) + regex stateless `DELIMITER_BERBAHAYA_TEST_RE` + Golden Eval Set & feedback UI | Keandalan guardrail AI terukur | `aiGuardrail.ts`, `KawruhOrbSection.svelte`, `tests/unit/` | **Selesai** |
| **P2** | UX-02 | Kontrol Solah Y, Jarak Blencong Z, *Walikan* non-kamera & Auto-Demo Lakon Pakeliran + Toast konfirmasi + penyesuaian `KarawitanBar` mobile | Pengalaman lengkap tanpa webcam | `App.svelte`, `wayangStage.ts`, `app.css`, `i18n.ts` | **Selesai** |
| **P2** | QA-01 | Tambah CI GitHub Actions (`.github/workflows/ci.yml`), script `typecheck`/`audit:ci`, unit test HTTP `400/403/405/413/429`, & Suite 6 E2E | Kualitas rilis terjaga otomatis | `.github/workflows/ci.yml`, `package.json`, `tests/unit/apiHandlers.test.ts`, `tests/e2e/kelir.spec.ts` | **Selesai** |
| **P3** | PM-02 | Tambah `screenshots` PWA di `manifest.webmanifest` (`1280x720` wide & `540x960` mobile) & sinkronkan `README.md` | Kesiapan kompetisi & dokumentasi akurat | `manifest.webmanifest`, `public/icons/*`, `README.md` | **Selesai** |
