# Kelir (`ꦏꦼꦭꦶꦂ`) — Eksibisi Spasial 3D Pusaka Jawa & Panggung Wayang Kulit (Edisi 5 Halaman)

[![Svelte 5](https://img.shields.io/badge/Svelte-5-ff3e00?style=flat-square)](#arsitektur-teknis)
[![Three.js](https://img.shields.io/badge/Three.js-0.187-000000?style=flat-square)](#arsitektur-3d)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-21_Titik_Lokal-0f9d58?style=flat-square)](#kontrol-gestur-tangan)

**Kelir** adalah platform eksplorasi warisan budaya Jawa interaktif berbasis WebGL/Three.js, Web Audio API prosedural, pelacakan tangan 21 titik MediaPipe secara lokal, transliterasi Aksara Jawa *Hanacaraka*, dan tanya-jawab terikat sumber akademis (`S1–S7`), yang diorganisasikan dalam **5 Halaman Tematik Selaras**.

---

## Arsitektur 5 Halaman Utama

1. **Halaman 01 — `Beranda & Diorama` (`?hal=beranda`)**
   - **Diorama Suaka Budaya Hidup (`LivingPendopoStage`)**: Kompleks tiga dimensi bertekstur kayu jati, genteng terakota, batu andesit, dan pencahayaan HDR studio (`studio_small_08_1k.hdr`) yang menampilkan **Pendopo Joglo Agung** (atap trapesium Brunjung-Penanggap, 16 tiang, tumpang sari, lampu robyong), **Besalen Empu Keris** (prapen bata, pompa ububan kembar, paron, keris melayang), **Bale Karawitan** (gayor gong ageng, saron, kendang), **Gazebo Wastra Batik** (2 gawangan berkibar & kompor anglo), **Panggung Kelir Wayang**, gapura **Candi Bentar**, jembatan kanal air, dan pohon beringin multi-kanopi.
   - **Scrollytelling 5 Bab (`01–05`)** dengan angka piksel SVG, kartu telemetri HUD kaca, **Matriks 12 Anatomi Pusaka** perspektif 3D beraksara Jawa, dan **Etalase Pita Horizontal (`PUSAKA JAWA`)**.
2. **Halaman 02 — `Digital Twin 3D` (`?hal=twin`)**
   - **Studio Kembaran Digital CAD & PBR (`DigitalTwinStage`)**: Inspeksi anatomi 5 pusaka (*Keris Luk 5*, *Saron Slendro*, *Batik Kawung*, *Pendopo Joglo*, *Wayang Kulit*) dengan 6–12 sub-komponen per artefak yang dapat diurai melalui penggeser **Ledak Anatomi (`0%–100%`)**, sakelar mode `PBR Nyata`, `Hibrida`, dan `Kawat X-Ray CAD`, papan bilah Saron interaktif, 4 baris keunggulan rekayasa di atas grid wireframe, dan 3 kolom manifesto arsitektural.
3. **Halaman 03 — `Coverflow & Suluk` (`?hal=koleksi`)**
   - Korsel kartu perspektif 3D melengkung (`< 01 / 05 >`), **Modal Layar Penuh Terpisah** dengan lirik suluk sinkron dan bilah pemutar gending merah crimson, serta indeks daftar pusaka bergaya album (`KELIR VOL. I`).
4. **Halaman 04 — `Panggung Wayang` (`?hal=pakeliran`)**
   - **Teater Bayangan Lakon Kijang Kencana 3D (`WayangStage`)**: Layar kain blacu berplisir merah-emas, gawangan jati berukir, dua batang gedebog pisang, jajaran wayang *Simpingan* kanan-kiri, lampu minyak *Blencong* berkerucut volumetrik, Gunungan Kayon krawangan, Sri Rama (wajah hitam alusan, Gelung Supit Urang, kain dodot polikrom ber-bokongan, cempurit tanduk kerbau, lengan berartikulasi ganda, busur Gendewa), dan Kidang Kencana berkaki sendi ganda.
5. **Halaman 05 — `Aksara & AI Orb` (`?hal=kawruh`)**
   - **Pamomong AI Orb (`PamomongOrbStage`)**: Bola metalik 3D reflektif (*Chrome-Obsidian*) dengan visor kaca gelap, sepasang ear-node bercincin `#ff5a1f`, dan cincin gyroskopik yang terhubung dengan mesin temu-balik **BM25 + sinonim budaya Jawa** serta penolakan luar-korpus terkalibrasi berbasis pustaka `S1–S7` via `/api/tanya`, dilengkapi konverter instan Latin ke Aksara Jawa (`Noto Sans Javanese`) dan 20 kartu *Carakan*.

---

## Struktur Proyek Terbaru

```text
kelir/
├── api/
│   └── tanya.ts                 # Endpoint serverless Vercel untuk kurasi tanya-jawab S1–S7
├── docs/
│   ├── ARSITEKTUR.md            # Dokumentasi arsitektur 5 halaman, stage 3D, dan alur data
│   └── PANDUAN-PENGEMBANGAN.md  # Panduan menjalankan, menguji, dan memperluas pusaka
├── public/
│   ├── mediapipe/               # Model hand_landmarker.task & biner WASM offline
│   ├── textures/                # Tekstur kayu, kulit, & HDR studio lighting (.hdr)
│   └── favicon.svg
├── src/
│   ├── content/pusaka.ts        # Basis data terkurasi 5 pusaka, kronik scroll, lakon, S1–S7
│   ├── lib/
│   │   ├── aksara.ts            # Mesin transliterasi Aksara Jawa & tabel carakan
│   │   ├── audioBudaya.ts       # Mesin sintesis suara gamelan & budaya via Web Audio API
│   │   ├── handTracker.ts       # Pengelola kamera & gestur 21 titik MediaPipe lokal
│   │   └── tanya.ts             # Mesin retrieval BM25 + ekspansi sinonim Jawa & sitasi S1–S7
│   ├── scenes/
│   │   ├── livingPendopoStage.ts # Diorama 3D suaka budaya, Batik Kawung kanvas, beringin & pin 3D
│   │   ├── digitalTwinStage.ts   # Inspeksi pusaka 3D PBR, X-Ray wireframe, & explode CAD
│   │   ├── pamomongOrbStage.ts   # Bola metalik 3D reflektif interaktif Pamomong AI
│   │   ├── wayang3DBuilder.ts    # Pembangun geometri 3D wayang kulit tatahan krawangan
│   │   └── wayangStage.ts        # Panggung Pakeliran Ramayana, simpingan & efek blencong
│   ├── ui/
│   │   ├── components/
│   │   │   ├── BerandaWallEtalase.svelte # Matriks 12 Anatomi Pusaka & Etalase Specimen
│   │   │   ├── KawruhOrbSection.svelte   # Pamomong AI Orb, panel bukti BM25 & kurasi S1–S7
│   │   │   └── FooterSection.svelte      # Kolofon navigasi multi-halaman & wordmark Kelir
│   │   ├── PusakaArtwork.svelte  # Ilustrasi ortografis SVG presisi (varian paper & dark)
│   │   └── App.svelte            # Router & komposisi 5 halaman + lazy import modul 3D/WASM
│   ├── app.css                   # Sistem desain, tata letak 3D CSS, tema terang & malam
│   └── main.ts                   # Titik masuk aplikasi & impor fon lokal
├── tests/
│   ├── unit/                     # Uji Vitest untuk Aksara, BM25 retrieval, & pustaka S1–S7
│   └── e2e/kelir.spec.ts         # Uji Playwright 5 halaman, modal, 3D, dan responsivitas
├── DESIGN.md                     # Panduan desain spasial & sistem visual
└── vite.config.ts                # Konfigurasi Vite + Rolldown codeSplitting + /api/tanya
```

---

## Menjalankan Proyek

```bash
# 1. Pasang ketergantungan (dependencies)
npm install

# 2. Jalankan server pengembangan di http://localhost:5173
npm run dev

# 3. Verifikasi tipe TypeScript & Svelte
npm run check

# 4. Jalankan uji unit (Vitest)
npm run test:unit

# 5. Bangun berkas produksi & jalankan uji E2E (Playwright)
npm run build
npm run test:e2e:ci
```
