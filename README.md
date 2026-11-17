# KELIR (`ꦏꦼꦭꦶꦂ`) - Eksibisi Spasial 3D Warisan Budaya Nusantara & Panggung Pakeliran

[![Svelte 5](https://img.shields.io/badge/Svelte-5.57-ff3e00?style=flat-square&logo=svelte&logoColor=white)](#tumpukan-teknologi)
[![Three.js](https://img.shields.io/badge/Three.js-0.187_WebGL-141518?style=flat-square&logo=threedotjs&logoColor=white)](#arsitektur-5-ruang-kurasi-spasial)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](#tumpukan-teknologi)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-21_Titik_Lokal-0f9d58?style=flat-square)](#fitur-sistem-lintas-ruang)
[![Hanacaraka](https://img.shields.io/badge/Aksara_Jawa-Unicode_U%2BA980-b33025?style=flat-square)](#05---lab-aksara-jawa-ua980--studio-ai-pamomong-nusantara-halkawruh)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-d1491b?style=flat-square)](#fitur-sistem-lintas-ruang)
[![License](https://img.shields.io/badge/License-KELIR_Personal_License-141518?style=flat-square)](./LICENSE)

**KELIR (`ꦏꦼꦭꦶꦂ`)** adalah platform eksibisi budaya spasial berbasis WebGL 3D interaktif yang memadukan arsitektur diorama Pendopo Jawa, bedah anatomi *Digital Twin CAD/PBR* berpresisi tinggi, panggung bayangan *Pakeliran* Wayang Kulit, laboratorium **86 ragam Aksara Jawa Hanacaraka (`U+A980-U+A9DF`)**, sintesis ansambel **Karawitan Klasik Jawa (`WebAudio`)**, pelacakan gestur tangan 21 titik secara lokal (`MediaPipe Hands`), serta agen kecerdasan budaya **Pamomong Nusantara** yang terjangkar pada arsip primer (`S1-S7`).

Dirancang dengan sistem visual museum kuratorial **Washi Alabaster** (Terang) dan **Smoked Obsidian & Kayu Jati** (Malam), KELIR berjalan responsif dari layar *desktop* hingga ponsel (`320px-1440px+`) dan siap dipasang sebagai aplikasi mandiri (**PWA**).

---

## Ringkasan Kapabilitas Utama

| Pilar Platform | Spesifikasi Terimplementasi |
| :--- | :--- |
| **Arsitektur Ruang Kurasi** | 5 halaman spasial terhubung URL query state (`?hal=beranda \| twin \| koleksi \| pakeliran \| kawruh`) + navigasi pintasan |
| **Katalog Objek & Anatomi 3D** | 7 spesimen PBR/CAD prosedural (*Keris Luk 5, Saron Slendro, Batik Tulis Kawung, Pendopo Joglo, Wayang Kulit Sri Rama, Kidang Kencana & Blencong, Prasasti Hanacaraka*) & 12 pelat anatomi berindeks `KLR-01` s.d. `KLR-12` |
| **Agen AI & Studi Budaya** | **Pamomong Nusantara** + 6 Mode **AI Studio** (`Tanya S1-S7`, `Komparator AI`, `Pujangga & Suara`, `Krama & Aksara AI`, `Rute Tur AI`, `Kuis Kurasi`) + ensiklopedia 19 gugus budaya Nusantara + pagar keamanan berlapis |
| **Laboratorium Aksara Jawa** | 86 entri aksara lintas 6 ragam (`Nglegena`, `Sandhangan`, `Pasangan`, `Swara & Rekaan`, `Aksara Murda`, `Angka & Pada`) beserta konverter dua pakem |
| **Musik & Akustik WebAudio** | 8 gending Karawitan klasik Jawa lintas 4 suasana berdasar notasi Kepatihan asli + simulasi bilah *Saron Slendro* 6 nada & ketukan *Keprak/Gong* |
| **Multibahasa & Aksesibilitas** | 4 bahasa lengkap (`ID`, `EN`, `JW`, `AKS`) berbasis `i18next`, skala keterbacaan teks `A / A+`, kursor adaptif, serta penguncian scroll latar modal |
| **Privasi & Ketahanan Luring** | Kamera gestur `MediaPipe` & render audio/sertifikat berjalan **100% lokal di perangkat** tanpa akun wajib + dukungan *Service Worker PWA* |

---

## Arsitektur 5 Ruang Kurasi Spasial

### 01 - Beranda & Diorama Hidup (`?hal=beranda`)
- **Diorama Suaka Budaya 3D (`LivingPendopoStage`)**: Kompleks spasial PBR dengan pencahayaan HDR studio (`studio_small_08_1k.hdr`) dan lapisan wireframe CAD pasif yang memuat **Pendopo Joglo Agung** (*tumpang sari*, 16 tiang kayu jati, lampu *robyong*), **Besalen Empu Keris** (*prapen*, *ububan* kembar, paron), **Bale Karawitan** (gayor gong ageng, saron, kendang), **Gazebo Wastra Batik** (kain kawung berkibar real-time ~30Hz), **Panggung Kelir Wayang**, gapura **Candi Bentar**, jembatan kanal air, dan pepohonan beringin.
- **Scrollytelling 5 Bab Historis**: Panduan naratif berangka piksel SVG beserta pin fokus 3D interaktif yang menggerakkan kamera diorama secara sinkron.
- **Indeks 12 Anatomi Pusaka (`KLR-01` s.d. `KLR-12`)**: Dinding pelat perspektif 3D yang menautkan setiap komponen ke titik bedah spesifik di Digital Twin atau langsung ke Lab Aksara.
- **Etalase Pita Horizontal**: 8 foto studio 3D PBR beresolusi terkalibrasi (`etalaseSnapshotRenderer.ts`, *offscreen lazy-cached*) bebas scrollbar horizontal dengan kendali seret mouse (*drag panning*) dan penerjemah roda gulir.

### 02 - Studio Digital Twin CAD 3D (`?hal=twin`)
- **7 Spesimen 3D Interaktif (`DigitalTwinStage`)**: Inspeksi anatomi terpadu untuk **Keris Luk 5 Pandhawa Lare** (6 titik pin), **Saron Laras Slendro** (5 titik pin + papan bilah berbunyi 6 nada `1 2 3 5 6 i`), **Batik Tulis Kawung** (5 titik pin), **Pendopo Joglo** (5 titik pin), **Wayang Kulit Purwa Sri Rama** (5 titik pin termasuk pelita minyak *Blencong*), **Kidang Kencana & Blencong** (4 titik pin), dan **Prasasti Hanacaraka `U+A980`** (4 titik pin).
- **Inspeksi Teknikal & Mode Visual**: Penggeser **Ledak Anatomi (`0%-100%`)** mengurai sub-rakitan berdasarkan vektor ledak masing-masing, dilengkapi pemilih tampilan `PBR Nyata`, `Hibrida`, dan `Kawat X-Ray CAD`, *Turntable Dial* kalibrasi derajat, tombol **Tur Anatomi Otomatis**, bookmark **Favorit**, serta **Kurator AI Unsur Inline**.
- **Ekspor Dokumentasi**: Unduh **Potret Studio 3D (`.png`)**, **Dossier Kurasi (`.json`)** lengkap dengan parameter metrologi CAD, serta salin *deep-link* URL tepat ke spesimen & titik anatomi aktif (`?hal=twin&benda=...&titik=...`).

### 03 - Galeri Coverflow 3D & Modal Suluk (`?hal=koleksi`)
- **Panggung Pedestal Melengkung (`CoverflowStage`)**: Tujuh artefak dinormalisasi dengan `THREE.Box3` tepat di atas pedestal batu andesit berbalut beludru merah tua dan lis kuningan beranimasi paralaks gulir.
- **Monograf Kuratorial 2 Kolom**: Informasi material, sejarah konstruksi, karakter Karawitan, dan anatomi kritis tertaut langsung ke pin Digital Twin.
- **Modal Layar Penuh Suluk (`SulukModal` & `SulukShowcaseStage`)**: Menampilkan panggung altar 3D berpelita Blencong, tabel metadata Karawitan `2x2`, 5 larik suluk sinkron tri-aksara (`Indonesia`, `Basa Jawi`, `Hanacaraka U+A980`), pemilih bahasa cepat di dalam modal, konsol lakuer **Auto-Suluk** beserta ketukan saron/keprak/gong, dan **Narator Suara AI** otomatis sesuai bahasa aktif.

### 04 - Panggung Pakeliran Wayang Kulit 3D (`?hal=pakeliran`)
- **Teater Bayangan Lakon *Aranya Kanda* (`WayangStage`)**: Pergelaran 4 babak pengejaran **Kijang Kencana** di atas *kelir* kain blacu, *gawangan* jati berukir, dua *gedebog* pisang, jajaran wayang *Simpingan*, *Gunungan Kayon* krawangan, **Sri Rama**, dan **Kidang Kencana** berartikulasi ganda.
- **Kendali Dalang Interaktif**: 3 pencahayaan dramatis (`Blencong`, `Siluet Kelir`, `Sorot Tatahan`), penggeser intensitas bara cahaya, simulasi **Sabetan & Keprak**, peluncuran **Panah Rama**, pemutar **Suara Dalang** per babak, dan kendali **Gestur Tangan 21-Titik Lokal (`MediaPipe`)**.

### 05 - Lab Aksara Jawa `U+A980` & Studio AI Pamomong Nusantara (`?hal=kawruh`)
- **Astrolabe 3D Horologis (`PamomongOrbStage`)**: Bola kuratorial berlapis tekstur alur bubut, lensa safir ganda, turbin ekuator 16-bilah, dan 3 cincin gimbal tanpa bingkai kotak di sisi antarmuka AI.
- **6 Mode AI Studio Terpadu**:
  1. **Tanya S1-S7 & Budaya Nusantara**: Penelusuran **BM25 + sinonim tri-bahasa** untuk 6 koleksi utama museum (`sumber: S1-S7`), ditambah eksplorasi kekayaan adat, situs cagar budaya (seperti Taman Sari Yogyakarta, Candi, Rumah Adat, Kuliner, Wastra), dan seni tradisional seluruh Indonesia berbasis ensiklopedia `nusantaraKB.ts`.
  2. **Komparator AI**: Analisis komparatif dua spesimen (persamaan prinsip kriya, kontras material/rekayasa, dan benang merah filosofis).
  3. **Pujangga & Suara**: Menggubah tema menjadi gurit Jawa halus, transliterasi Hanacaraka `U+A980`, terjemahan, sekaligus narasi audio `WAV`.
  4. **Krama & Aksara AI**: Alih bahasa ungkapan menuju **Basa Ngoko**, **Krama Inggil**, aksara **Hanacaraka `U+A980`**, catatan *unggah-ungguh*, dan pelafalan audio.
  5. **Rute Tur AI**: Menyusun rencana jelajah 2-3 langkah berdasarkan minat & durasi dengan tombol teleportasi 1-klik ke ruang 3D target.
  6. **Kuis Kurasi (`BANK_KUIS_S1_S7`)**: Uji pemahaman 6 soal arsip dengan umpan balik rujukan dan pencatatan skor tertinggi.
- **Laboratorium 86 Aksara Jawa (`aksara.ts`)**: Katalog lengkap `Nglegena` (20), `Sandhangan` (14), `Pasangan` (20), `Swara & Rekaan` (10), `Aksara Murda` (8), dan `Angka & Pada` (14), lengkap dengan **Inspektur Detail Unicode**, dua mode pakem transliterasi (`Carakan Standar` vs `Lengkap Murda, Swara & Rekaan`), dan contoh uji cepat.

---

## Fitur Sistem Lintas Ruang

- **Ekosistem 4 Bahasa Utuh (`i18n.ts`)**: Pengalih dropdown vertikal untuk **Bahasa Indonesia (`ID`)**, **English (`EN`)**, **Basa Jawi (`JW`)**, dan **Aksara Jawa Hanacaraka (`AKS`)** dengan mekanisme `konversiTeksKeAksaraAman()` yang menjaga keutuhan kode teknis (`S1-S7`, `3D`, `CAD`, `U+A980`).
- **Musik Latar 8 Gending Karawitan Klasik (`gendingJawa.ts`, `audioBudaya.ts`, `KarawitanBar.svelte`)**: Ensembel gamelan multi-instrumen (*Demung, Saron Barung pengumbang-pengisep ombak ±5.5 cents, Peking, Gender kempyung, Kethuk-Kenong-Kempul-Gong, Kendhang*) melewati `DynamicsCompressorNode` & konvolusi gema pendopo `1.85 detik`, menyusun 8 komposisi asli (*Ketawang Puspawarna, Ketawang Sinom Parijatha, Ladrang Wilujeng, Ladrang Asmarandana, Tembang Lir-Ilir, Ayak-Ayakan Manyura, Lancaran Kebo Giro, Lancaran Gugur Gunung*) dan otomatis meredup (*ducking*) ketika narator suara aktif.
- **Pencarian Global `Ctrl+K`, Paspor Kurasi & Piagam `.png` (`SearchModal.svelte`, `piagamKurator.ts`)**: Pencarian instan lintas artefak, titik anatomi, babak wayang, aksara, dan pustaka; pelacakan progres lokal (`localStorage: kelir_jejak_v1`); serta generator kanvas **Piagam Kurator (`piagam-kurator-kelir.png`, 1400×920)**.
- **Kursor Kaligrafi & Penguncian Scroll Modal (`KelirCursor.svelte`, `smoothScroll.ts`)**: Kursor pahat kaligrafi adaptif 5 mode (`default`, `interactive`, `drag`, `canvas`, `text`), rel gulir mengambang interaktif, inersia *smooth scroll* berbasis RAF, serta penguncian scroll latar (`has-modal-open`, wheel/touch guard) ketika pop-up terbuka.
- **Pertahanan AI & sanitasi Keluaran (`aiGuardrail.ts`)**: Proteksi bertingkat terhadap deobfuskasi injeksi *prompt*, ekstraksi rahasia lingkungan, kueri non-budaya keras, penghapusan *em-dash* (`hilangkanEmDashAI`), dan penjagaan identitas eksklusif **Pamomong Nusantara**.
- **Pop-up Informasi Resmi (`LegalInfoModal.svelte`, `legalInfo.ts`)**: Modal 3 tab terpadu (**Syarat & Ketentuan**, **Kebijakan Privasi**, dan **Hubungi Kami**) yang dapat diakses dari Footer maupun `SearchModal`.
- **PWA, SEO & GEO**: Dilengkapi `manifest.webmanifest`, 4 ikon resolusi penuh, Service Worker *offline-ready* (`sw.js`), tahun hak cipta otomatis (`ambilTahunHakCipta`), skema JSON-LD dinamis, serta `llms.txt` & `llms-full.txt`.

---

## Rujukan Pustaka Primer (`S1-S7`)

| Kode | Judul Rujukan Resmi | Lembaga / Sumber | Ruang Lingkup Kurasi |
| :---: | :--- | :--- | :--- |
| **`S1`** | *Indonesian Keris (Representative List 00112)* | UNESCO Intangible Cultural Heritage (2008) | Keris Luk 5, Pamor Beras Wutah, Besalen Empu |
| **`S2`** | *Indonesian Batik (Representative List 00170)* | UNESCO Intangible Cultural Heritage (2009) | Batik Tulis Kawung, canting, malam & geometri Papat Pancer |
| **`S3`** | *Wayang Puppet Theatre (Representative List 00063)* | UNESCO Intangible Cultural Heritage (2008) | Wayang Kulit Purwa, Pakeliran, Gunungan & Blencong |
| **`S4`** | *Gamelan (Representative List 01607)* | UNESCO Intangible Cultural Heritage (2021) | Saron Laras Slendro, instrumen gamelan & 8 Gending Karawitan |
| **`S5`** | *Kajian Lakon Ramayana & Tatahan Wayang* | Museum Sonobudoyo & ISI Surakarta (2019) | Lakon Aranya Kanda (Kijang Kencana), unggah-ungguh & tatahan |
| **`S6`** | *Arsitektur Vernakular Pendopo Joglo & Tumpang Sari* | Kemdikbudristek RI (2020) | Konstruksi Saka Guru, Umpak, Sunduk-Pangeret & pasak purus |
| **`S7`** | *Standar Aksara Jawa Blok Unicode U+A980-U+A9DF* | Kongres Bahasa Jawa, Perpusnas RI & Unicode (2021) | 86 ragam Carakan, Sandhangan, Pasangan, Murda & Swara |

---

## Tumpukan Teknologi

- **Antarmuka & Reaktivitas**: Svelte 5 (`$state`, `$derived`, `$effect`), Vite 8, TypeScript 5.8
- **Grafik 3D Spasial**: Three.js (`0.187`), `OrbitControls`, `HDRLoader` (kompilasi shader asinkron `compileAsync` + manajemen siklus hidup GPU)
- **Penglihatan Komputer Lokal**: `@mediapipe/tasks-vision` (bobot model & WASM lokal di `public/mediapipe/`)
- **Sintesis Audio**: Web Audio API native (`OscillatorNode`, `BiquadFilterNode`, `ConvolverNode`, `DynamicsCompressorNode`)
- **Internasionalisasi & Font Luring**: `i18next`, Fontsource (`Space Grotesk`, `Archivo Black`, `Inter`, `JetBrains Mono`, `Fraunces`, `Noto Sans Javanese`)
- **Lapisan Serverless & AI**: Endpoint Vercel serverless (`/api/tanya`, `/api/ai-studio`, `/api/suluk-suara`) berbasis `@google/genai`
- **Pengujian Otomatis**: `svelte-check`, `Vitest` (unit), dan `Playwright` (end-to-end visual, fungsional, responsivitas, dan scroll lock)

---

## Struktur Direktori Repositori

```text
kelir/
├── api/
│   ├── ai-studio.ts                    # Endpoint serverless 6 mode AI Studio & suara Dalang/Pujangga
│   ├── suluk-suara.ts                  # Endpoint sintesis audio narator Modal Suluk
│   └── tanya.ts                        # Endpoint Q&A agen Pamomong Nusantara
├── docs/
│   ├── ARSITEKTUR.md                   # Catatan arsitektur halaman, panggung WebGL & alur data
│   └── PANDUAN-PENGEMBANGAN.md         # Pedoman pengembangan & perluasan kurasi
├── public/
│   ├── icons/                          # Ikon aplikasi PWA (192, 512, maskable, Apple touch)
│   ├── mediapipe/                      # Model hand_landmarker.task & biner WASM offline
│   ├── textures/                       # HDR studio lighting & peta tekstur pendukung
│   ├── favicon.svg
│   ├── llms.txt & llms-full.txt        # Peta konten terstruktur ramah perayap AI / GEO
│   ├── manifest.webmanifest            # Manifes instalasi Progressive Web App
│   ├── og-kelir.svg                    # Kartu Open Graph metadata
│   ├── robots.txt & sitemap.xml        # Konfigurasi perayapan mesin pencari
│   └── sw.js                           # Service Worker cache luring KELIR
├── src/
│   ├── content/
│   │   ├── legalInfo.ts                # Data Syarat & Ketentuan, Privasi, & Kontak Resmi
│   │   ├── nusantaraKB.ts              # 19 gugus ensiklopedia budaya & cagar budaya Nusantara
│   │   └── pusaka.ts                   # Korpus terkurasi 7 spesimen, kronik, lakon, & S1-S7
│   ├── lib/
│   │   ├── aiGuardrail.ts              # Pertahanan anti-jailbreak, sanitasi em-dash & verifikasi topik
│   │   ├── aiStudio.ts                 # Layanan klien 6 mode AI Studio + fallback luring
│   │   ├── aksara.ts                   # Mesin konversi & katalog 86 Aksara Jawa (6 ragam)
│   │   ├── audioBudaya.ts              # Mesin WebAudio ensemble Karawitan, Saron & Keprak
│   │   ├── dalangVoice.ts              # Layanan audio narator Dalang Panggung Pakeliran
│   │   ├── gendingJawa.ts              # Repertoar 8 Gending Klasik Jawa & notasi Kepatihan
│   │   ├── handTracker.ts              # Orkestrator kamera MediaPipe 21-titik lokal
│   │   ├── i18n.ts                     # Kamus & helper i18next untuk ID, EN, JW, dan AKS
│   │   ├── pencarianArsip.ts           # Indeks pencarian global & manajemen Jejak Kurasi
│   │   ├── piagamKurator.ts            # Renderer kanvas PNG Piagam Kurator lokal
│   │   ├── pwa.ts                      # Manajemen beforeinstallprompt & deteksi PWA
│   │   ├── revealAnim.ts               # Utilitas IntersectionObserver & animasi kartu adaptif
│   │   ├── seoGeo.ts                   # Sinkronisasi meta, JSON-LD & tahun hak cipta otomatis
│   │   ├── smoothScroll.ts             # Inersia smooth scroll & kunci scroll latar modal
│   │   ├── sulukNarasi.ts              # Naskah & pemutar suara AI / Web Speech Modal Suluk
│   │   └── tanya.ts                    # Mesin temu-balik BM25 + orkestrasi kueri Pamomong
│   ├── scenes/
│   │   ├── coverflowStage.ts           # Panggung korsel 3D pedestal andesit-beludru
│   │   ├── digitalTwinStage.ts         # Studio Digital Twin CAD/PBR, pin & ledak anatomi
│   │   ├── etalaseSnapshotRenderer.ts  # Renderer foto studio PBR offscreen untuk Etalase
│   │   ├── livingPendopoStage.ts       # Diorama Pendopo Agung, Besalen & Panggung Kelir
│   │   ├── pamomongOrbStage.ts         # Astrolabe horologis 3D Pamomong
│   │   ├── pusaka3DBuilder.ts          # Pembangun geometri 3D PBR bersama antar-panggung
│   │   ├── sulukShowcaseStage.ts       # Panggung altar 3D Modal Suluk
│   │   ├── threeHelpers.ts             # Utilitas WebGL bersama, compileAsync & responsive FOV
│   │   ├── wayang3DBuilder.ts          # Konstruksi wayang kulit krawangan & Blencong
│   │   └── wayangStage.ts              # Panggung Pakeliran Aranya Kanda & cahaya Blencong
│   ├── server/
│   │   ├── aiStudioGemini.ts           # Logika pemrosesan server 6 mode AI Studio
│   │   ├── geminiLiveBridge.ts         # Jembatan koneksi aman API inferensi Live server
│   │   ├── pamomongGemini.ts           # Logika pemrosesan server Q&A Pamomong Nusantara
│   │   └── sulukVoiceGemini.ts         # Generator audio narasi suluk berbasis server
│   ├── ui/
│   │   ├── components/                 # Komponen modular 5 halaman, modal, kursor, footer & audio
│   │   ├── App.svelte                  # Root aplikasi, routing kueri & scroll lock modal
│   │   ├── PixelNumber.svelte          # Komponen tipografi piksel SVG bab scrollytelling
│   │   └── PusakaArtwork.svelte        # Ilustrasi ortografis SVG spesimen
│   ├── app.css                         # Token desain, gaya responsif, tema terang & malam
│   └── main.ts                         # Entry point aplikasi & pemuatan font lokal
└── tests/
    ├── unit/                           # 13 suite pengujian unit Vitest (58 kasus uji)
    └── e2e/kelir.spec.ts               # Pengujian E2E Playwright (desktop, tablet, mobile, PWA, modal)
```

---

## Memulai & Menjalankan Proyek

### 1. Prasyarat
- **Node.js** versi `20+` (disarankan LTS terbaru) dan **npm**.
- Kunci API layanan generatif (opsional untuk mode AI live; jika dikosongkan, aplikasi otomatis menggunakan mesin luring **BM25 + ensiklopedia Nusantara**).

### 2. Instalasi & Konfigurasi
```bash
# Masuk ke direktori proyek
cd kelir

# Pasang seluruh dependensi
npm install

# Salin templat variabel lingkungan (hanya diperlukan untuk fitur AI live server-side)
cp .env.example .env.local
```

Isi `.env.local` dengan kunci API Anda di variabel `GEMINI_API_KEY` apabila ingin mengaktifkan panggilan inferensi live melalui middleware/serverless (`vite.config.ts` & `api/*`). Jangan pernah mengunggah `.env.local` ke kontrol versi.

### 3. Skrip Pengembangan & Pengujian

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Vite di `http://localhost:5173` beserta middleware `/api/*` |
| `npm run check` | Memeriksa tipe TypeScript dan diagnostik komponen Svelte (`svelte-check`) |
| `npm run test:unit` | Menjalankan seluruh 13 file uji unit `Vitest` (Aksara, BM25, Guardrail, Nusantara, i18n, SmoothScroll, PWA, Legal, dll.) |
| `npm run build` | Mengompilasi bundel produksi yang terpecah (*code-split*) ke direktori `dist/` |
| `npm run preview` | Meninjau hasil build produksi pada `http://localhost:4173` |
| `npm run test:e2e:ci` | Menjalankan suite `Playwright` lengkap pada build/dev server (desktop, tablet, ponsel `320px`, SEO/GEO, modal, PWA, & audit responsif) |

---

## Lisensi Pribadi & Hak Cipta

Seluruh perangkat lunak, kode sumber, model geometri WebGL 3D prosedural, sistem desain visual, sintesis WebAudio, dan dokumentasi dalam repositori ini dilindungi oleh **Lisensi Pribadi & Ketentuan Hak Cipta KELIR** atas nama **Nawfal Irfan** (`Hak Cipta (c) 2026 Nawfal Irfan`).

- **Diizinkan**: Eksplorasi edukatif, pembelajaran budaya, penelitian akademik non-komersial, serta peninjauan teknis untuk keperluan penjurian/evaluasi kompetisi atau portofolio resmi dengan menjaga atribusi **KELIR · Nawfal Irfan**.
- **Dilarang**: Mengklaim ulang kode atau aset sebagai karya pihak lain, mendistribusikan ulang (*re-hosting/mirroring*), komersialisasi tanpa izin tertulis, menghapus atribusi hak cipta atau pustaka `S1-S7`, serta tindakan *scraping* maupun injeksi terhadap layanan AI.

Baca ketentuan lengkap pasal demi pasal di berkas **[LICENSE](./LICENSE)**.

---

## Kontak Pengelola & Pengembang

Untuk kerja sama riset, pameran museum, koreksi kuratorial, umpan balik aksesibilitas, maupun permohonan izin tertulis terkait lisensi:

- **Pengembang & Kurator Teknis**: Nawfal Irfan
- **Email Resmi**: [`nawfalirfan005@gmail.com`](mailto:nawfalirfan005@gmail.com)
- **Website & Portofolio**: [https://nawfal.vercel.app](https://nawfal.vercel.app)
- **Instagram**: [`@nawfaljr__`](https://www.instagram.com/nawfaljr__/)
