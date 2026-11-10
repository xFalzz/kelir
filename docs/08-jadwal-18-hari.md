# 08. Jadwal 18 hari

Mulai 10 November 2026 (hari 1). Hari 18 jatuh pada 27 November. **28 November adalah batas akhir**, tetapi 28 November dipakai hanya sebagai cadangan; target kirim 27 November. Bagian guidebook tentang jadwal babak final dan technical meeting `[ISI tanggal dari guidebook]`.

## Rencana harian

| Hari | Tanggal | Fokus | Keluaran | Titik periksa |
|---|---|---|---|---|
| 1 | 10 Nov | Keputusan, `DESIGN.md`, stack, folder proyek | Dokumen disetujui; repo dibuat | Pemilik menyetujui desain dan stack |
| 2 | 11 Nov | Riset benda dan legenda; cari aset berlisensi; cari narasumber | Daftar benda dan sumber; register lisensi terisi sebagian | Minimal satu penutur dan satu narasumber dihubungi |
| 3 | 12 Nov | Spike: kamera, Hand Landmarker, adegan 3D, penghalus gerak | Demo teknis "draft without direction" | Kamera menggerakkan benda di laptop biasa |
| 4 | 13 Nov | Transliterator Aksara plus uji unit | Modul dan uji lulus | Contoh uji lulus |
| 5 | 14 Nov | Lapisan aksi (input ganda), mode tanpa kamera | Gestur dan manual setara | Semua aksi bisa tanpa kamera |
| 6 | 15 Nov | Pemuat konten, skema, validasi, i18n | Konten benda pertama tampil | Build gagal bila sumber kosong |
| 7 | 16 Nov | Ruang pegang: titik info | Satu benda penuh | Alur satu benda selesai |
| 8 | 17 Nov | Tiga benda lain atau penyederhanaan | 3 sampai 4 benda | Semua benda bersumber |
| 9 | 18 Nov | Fungsi AI: proksi, cadangan, batas laju | Tanya jawab berfungsi dengan cadangan | Uji matikan AI: cadangan muncul |
| 10 | 19 Nov | Panggung kelir: tokoh dan gerak | Boneka bayangan mengikuti tangan | Satu tokoh mulus |
| 11 | 20 Nov | Legenda: naskah, narasi, adegan | Satu legenda penuh | Berjalan dari awal sampai akhir |
| 12 | 21 Nov | Tiga bahasa dan Aksara di semua layar; penanda draf | Peralihan bahasa jalan | Tidak ada teks Jawa tanpa status |
| 13 | 22 Nov | Penerapan desain: palet, huruf, logo, transisi | UI mengikuti `DESIGN.md` | Disetujui pemilik |
| 14 | 23 Nov | Gerak dan polesan; keadaan kosong, memuat, galat | Semua keadaan ada | Tidak ada keadaan rusak |
| 15 | 24 Nov | Aksesibilitas, kontras, keyboard, mobile | Lolos daftar periksa | Tidak ada overflow di 360 px |
| 16 | 25 Nov | Uji E2E, performa di perangkat lemah, uji pengguna kecil | Laporan uji dan hasil tes pemahaman | Semua uji lulus |
| 17 | 26 Nov | Delivery Gate antislop, proposal final, slide, video demo | Dokumen final | Gate tanpa FAIL |
| 18 | 27 Nov | Deploy produksi, folder Drive, formulir | Pengumpulan | Tautan dibuka dari akun lain |
| Cadangan | 28 Nov | Hanya perbaikan darurat | | |

## Garis potong (jika tertinggal)

Urutan pemangkasan, dari yang paling dulu dibuang:
1. Benda ketiga dan keempat (tetap 2 benda matang).
2. Tanya jawab langsung (tetap pakai teks kurasi saja).
3. Tokoh ketiga di panggung.
4. Fitur belajar Aksara tambahan (tetap alihaksara satu arah).

**Tidak boleh dipangkas:** mode tanpa kamera, status tinjauan teks, register lisensi, halaman Sumber, uji klik, folder pengumpulan yang benar.

## Ritme kerja

- Setiap akhir hari: commit, build, jalankan uji, tulis catatan satu paragraf.
- Setiap dua hari: tampilkan ke satu orang asli dan catat reaksi.
- Setiap hari bergantung pada hari sebelumnya; bila satu hari gagal, jalankan garis potong, jangan menunda.
