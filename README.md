# Kelir (`ꦏꦼꦭꦶꦂ`)

Aplikasi web interaktif untuk mempelajari struktur tiga dimensi volumetrik dari **5 ranah warisan budaya Jawa & Nusantara** (**Keris Jawa Luk 5**, **Saron Gamelan Slendro**, **Batik Tulis & Canting Tembaga**, **Arsitektur Pendopo Joglo**, serta **Wayang & Gunungan 3D Berartikulasi**) dan memainkan panggung wayang 3D (*Lakon Ramayana: Kijang Kencana*) menggunakan gestur tangan di browser (*MediaPipe Hand Landmarker*) atau kendali manual penuh (mouse, layar sentuh, dan keyboard).

Karya untuk **Innovation Competition 2026**, kategori **Software Development**, tema *"From Ideas to Innovation"*.

## Menjalankan Proyek Secara Lokal

```bash
cd d:\Kompetisi-UBSI\kelir
npm run dev          # Menjalankan server pengembangan di http://localhost:5173
npm run check        # Memeriksa tipe TypeScript & Svelte (svelte-check)
npm run test:unit    # Menjalankan 9 pengujian unit Vitest (Aksara Jawa & validasi sumber)
npm run build        # Membangun bundel produksi ke folder dist/
npm run test:e2e:ci  # Menjalankan pengujian end-to-end Playwright di Chrome
```

## Konfigurasi Kunci API AI (Opsional)

Secara bawaan, fitur Tanya Jawab Terikat Sumber sudah langsung berfungsi 100% memakai pencocokan kurasi lokal deterministik (`src/lib/tanya.ts`). Jika ingin mengaktifkan penyedia LLM eksternal di fungsi serverless `api/tanya.ts`, salin `.env.example` menjadi `.env.local` lalu isi sendiri:

```ini
GEMINI_API_KEY=isi_kunci_google_ai_studio_anda
GEMINI_MODEL=gemini-2.5-flash
META_API_KEY=isi_kunci_meta_llama_api_jika_aktif
```

## Peta Dokumen Kompetisi

| Berkas | Isi |
|---|---|
| `DESIGN.md` | Identitas visual, rasio kontras WCAG AA, tipografi OFL, dial `ENERGY 3 / RHYTHM 3 / MOTION 3` |
| `AGENTS.md` | Aturan kerja dan penjaga kualitas antislop (`during`) |
| `docs/00-ringkasan-keputusan.md` | Ringkasan ketentuan lomba dan mitigasi risiko |
| `docs/01-proposal-proyek.md` | Naskah proposal lengkap siap ekspor PDF (sumber UNESCO, Britannica, Sonobudoyo) |
| `docs/02-spesifikasi-produk.md` | Cakupan MVP, 4 gestur tangan, keadaan layar, dan kriteria penerimaan |
| `docs/03-arsitektur-teknis.md` | Arsitektur Vite + Svelte 5 + Three.js + MediaPipe + GSAP |
| `docs/04-konten-dan-sumber.md` | Inventaris 5 warisan budaya, 20 titik info anatomis, lakon 4 babak, dan 7 sumber resmi (`S1`..`S7`) |
| `docs/05-register-lisensi-aset.md` | Register lisensi geometri prosedural, font OFL, dan pustaka terbuka |
| `docs/06-kebijakan-ai.md` | Kebijakan anti-halusinasi AI (Gemini utama, Meta cadangan, Kurasi lokal) |
| `docs/07-bahasa-dan-aksara.md` | Dokumentasi transliterator Aksara Jawa berbasis aturan (`U+A980–U+A9DF`) |
| `docs/08-jadwal-18-hari.md` | Rencana kerja menuju batas akhir 28 November 2026 |
| `docs/09-alur-kerja.md` | Standar Conventional Commits, debugging, pembersihan kode, dan pengujian E2E |
| `docs/10-checklist-pengumpulan.md` | Daftar periksa berkas Google Drive `SD_NamaTim_NamaInstitusi` |
| `docs/11-presentasi-demo-qa.md` | Kerangka slide, naskah live demo 3 menit, dan bank jawaban tanya jawab juri |
| `docs/12-skema-erd-prd-uml-ddl-dml.md` | Skema alur lengkap PRD, ERD, UML/EML, DDL, dan DML |
| `docs/sql/schema.sql` | Berkas SQL DDL pembuatan tabel & constraint |
| `docs/sql/seed_and_queries.sql` | Berkas SQL DML pengisian data kurasi & query operasional |
