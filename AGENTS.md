# Panduan Agen Pengembang (`AGENTS.md`)

Dokumen ini merupakan aturan kerja terkini bagi pengembang dan agen AI pada basis kode **Kelir (`ꦏꦼꦭꦶꦂ`)** pasca-perombakan total arsitektur spasial 3D.

## Aturan Baku Proyek

1. **Kesetiaan Sistem Desain Spasial 3D**
   - Antarmuka menggunakan sistem gelap studio kontemporer (`#090a0d` & `#000000`) sebagai default (`data-theme="malam"`), namun wajib mendukung mode terang kontras tinggi (`data-theme="terang"`).
   - Jangan mengubah gaya visual kembali ke panel tabel kaku; pertahankan elemen khas panggung seperti *preloader `00–100`*, *floating HUD callouts*, Coverflow 3D perspektif, Modal Suluk layar penuh, Etalase Pita horizontal, Dinding Ruang 3D, serta mode *X-Ray Wireframe `#ff5a1f`* + *Exploded CAD*.
2. **Keamanan & Ketahanan WebGL + MediaPipe**
   - Setiap konstruktor kelas panggung Three.js (`LivingPendopoStage`, `DigitalTwinStage`, `PamomongOrbStage`, `WayangStage`) **harus aman** bila WebGL gagal dibuat (tanpa melempar pengecualian tak tertangani) dan harus membebaskan GPU memory melalui `.destroy()`.
   - Aset MediaPipe dan tekstur PBR (`public/mediapipe/`, `public/textures/`) **hanya** dimuat secara lokal dari `/mediapipe/` dan `/textures/` demi privasi nol-unggahan kamera dan keandalan luring.
3. **Keterikatan Sumber Pengetahuan (`S1–S7`)**
   - Semua fakta budaya, bagian anatomi pusaka, metrik sejarah, dan jawaban `Pamomong AI` berasal dari kurasi `src/content/pusaka.ts` dan menyertakan kode rujukan eksplisit (`S1`–`S7`).
4. **Penulisan Bahasa**
   - Mendukung penuh pengalihan langsung antara Bahasa Indonesia (`id`), Basa Jawa (`jw`), dan Aksara Jawa (`aks`) melalui `ambilTeks()` & `latinKeAksaraJawa()`.
5. **Pengujian Wajib Sebelum Selesai**
   - Jalankan `npm run check`, `npm run test:unit`, `npm run build`, dan `npm run test:e2e:ci` tanpa galat.
