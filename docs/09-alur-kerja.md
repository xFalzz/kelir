# 09. Alur kerja

Disusun dari kumpulan prompt kerja yang diberikan pemilik (sumber: unggahan @haloziq), disesuaikan untuk proyek solo ini. Setiap kali kata "approve" muncul, yang menyetujui adalah pemilik proyek.

## 1. Commit yang rapi

- Format: Conventional Commits, `type(scope): ringkasan imperatif di bawah 60 karakter`.
- Tipe: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `style`, `build`, `ci`.
- Baris kosong lalu isi (body) yang menjelaskan **kenapa** perubahan perlu dan pertimbangannya. Tandai perubahan yang memutus dengan `BREAKING CHANGE:`.
- Satu perubahan logis per commit. Perbaikan dan refactor dipisah.
- Urutan commit membuat repo tetap bisa di-build dan lulus uji di setiap langkah.
- Dilarang pesan samar: "update", "fix stuff", "changes", "wip".
- Sebelum commit: ringkas apa yang berubah dan kenapa, kelompokkan menurut maksud, lalu keluarkan perintah git yang persis, berurutan, dan file mana masuk commit mana.

## 2. Debug dengan cepat

Saat ada bug, **jangan menulis perbaikan dulu.**

Masukan yang dibutuhkan: error atau perilaku yang tidak diharapkan, perilaku yang diharapkan, yang sebenarnya terjadi, kode relevan, dan yang sudah dicoba.

1. Nyatakan ulang masalah dengan kata sendiri agar pemahaman sama.
2. Daftar 3 sampai 5 kemungkinan akar masalah, urut menurut kemungkinan, masing-masing dengan alasan.
3. Untuk tiap penyebab, satu cara tercepat untuk mengonfirmasi atau menyingkirkan: satu baris log, satu pemeriksaan, atau satu uji singkat.
4. **Berhenti dan tunggu hasil dari pemilik.**
5. Setelah penyebab terkonfirmasi, baru tulis perbaikan paling minimal, jelaskan kenapa berhasil, dan beri tahu apa yang harus diuji.

Larangan: mengubah banyak hal sekaligus, merombak kode yang tidak terkait, memperbaiki hal yang tidak diminta.

## 3. Membersihkan kode mati (dua fase)

**Fase 1, audit (tidak mengubah apa pun).** Temukan dan daftarkan dengan bukti:
- file, komponen, util yang tidak terpakai;
- impor, variabel, fungsi, ekspor yang tidak terpakai;
- dependensi di `package.json` yang tidak terpakai;
- variabel lingkungan, rute, endpoint API yang tidak terpakai;
- blok kode yang dikomentari;
- logika terduplikasi di dua tempat atau lebih;
- file yang sudah terlalu besar dan sebaiknya dipecah.

Sajikan sebagai tabel dengan tingkat risiko per item. Item dengan keyakinan di bawah 90% **tidak dihapus**. Berhenti dan tunggu persetujuan.

**Fase 2, eksekusi (setelah disetujui).** Hapus yang disetujui, ekstrak logika duplikat ke utilitas bersama, pecah file besar menurut tanggung jawab.

Aturan: perilaku tetap identik, tanpa dependensi baru, tanpa mengganti nama API publik, dan ringkasan tiap perubahan agar diff bisa ditinjau.

## 4. Uji E2E (Playwright)

1. Pasang dan konfigurasi Playwright untuk stack ini: konfigurasi lokal dan CI, dengan retry, trace saat gagal, dan tangkapan layar.
2. Identifikasi **alur pengguna kritis** dari kode dan daftarkan untuk disetujui pemilik **sebelum menulis uji**.
3. Untuk tiap alur yang disetujui, tulis uji untuk jalur normal dan keadaan gagal yang realistis.
4. Selektor tahan perubahan: utamakan role atau `data-testid`; tambahkan `data-testid` yang hilang.
5. Skrip npm: `test:e2e`, `test:e2e:ui`, `test:e2e:ci`.
6. Alur kerja CI yang menjalankan suite pada tiap perubahan.
7. Jelaskan cara menjalankan, dan tandai alur yang tidak bisa diuji andal beserta alasannya.

Alur kritis awal (usulan, menunggu persetujuan):
- Pintu tanpa kamera menuju Rak, Ruang pegang, Panggung, Sumber.
- Kamera ditolak lalu aplikasi menawarkan mode manual.
- AI gagal lalu jawaban cadangan muncul.
- Konten gagal dimuat lalu pesan galat dan tombol coba lagi.
- Ganti bahasa Indonesia, Jawa, Aksara.
- Keyboard saja: seluruh alur dapat dilalui dan Escape menutup dialog.

Catatan: kamera sungguhan tidak dapat diuji andal di CI; gunakan video kamera palsu bawaan Chromium untuk uji pelacakan dan tandai sisanya sebagai uji manual.

## 5. Mengubah tugas menjadi skill

Setelah menyelesaikan tugas yang berulang, jadikan skill dengan: nama singkat berorientasi aksi; deskripsi pemicu yang presisi; instruksi bernomor untuk model tanpa konteks; aturan dan batasan; format keluaran lengkap dengan templat; satu contoh penuh; tiga sampai lima cara gagal beserta pencegahannya. Tulis agar berdiri sendiri.

Kandidat skill proyek ini: `tambah-benda-baru` (konten, sumber, lisensi, titik info), `tinjau-teks-jawa`, `periksa-pengumpulan`.

## 6. Delivery Gate antislop

Sebelum pekerjaan UI dinyatakan selesai, jalankan Delivery Gate (empat blok) dan laporkan PASS atau FAIL per butir dengan bukti. Satu FAIL berarti tidak dikirim. Laporan klik-uji dicatat per elemen, dan mencakup tema, mobile, serta keyboard.
