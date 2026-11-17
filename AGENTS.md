# Panduan Pengembang KELIR (`AGENTS.md`)

Aturan teknis inti bagi pengembang pada repositori **KELIR (`ꦏꦼꦭꦶꦂ`)**:

1. **Sistem Desain Spasial 5 Halaman**: Pertahankan dukungan penuh tema terang *Washi Alabaster* (`#f6f4ef`, default) dan tema gelap *Smoked Obsidian* (`#12100e`) di ke-5 halaman (`beranda`, `twin`, `koleksi`, `pakeliran`, `kawruh`) serta responsivitas `320px-1440px+`.
2. **Keamanan Lifecycle WebGL & MediaPipe**: Setiap panggung Three.js wajib membebaskan sumber daya GPU via `.destroy()`, tidak melempar pengecualian fatal bila WebGL gagal, dan memuat aset `MediaPipe` serta tekstur hanya secara lokal dari `/mediapipe/` dan `/textures/`.
3. **Keterikatan Pustaka (`S1-S7`) & Keamanan AI**: Penjelasan spesimen utama wajib menyertakan sitasi `S1-S7` sesuai `src/content/pusaka.ts`, respons AI disanitasi lewat `src/lib/aiGuardrail.ts` (tanpa bocor merek eksternal maupun tanda *em-dash* `\u2014`), dan eksplorasi budaya Nusantara memanfaatkan `src/content/nusantaraKB.ts`.
4. **Lokalisasi 4 Bahasa**: Seluruh teks antarmuka wajib mendukung `id`, `en`, `jw`, dan `aks` via `tI18n()`, `ambilTeks()`, serta `latinKeAksaraJawa()`.
5. **Kode Bersih**: Hindari komentar dekoratif/trivial dan jangan sertakan karakter *em-dash* (`\u2014`) di UI maupun dokumentasi. Selalu verifikasi dengan `npm run check`, `npm run test:unit`, `npm run build`, dan `npm run test:e2e:ci`.
