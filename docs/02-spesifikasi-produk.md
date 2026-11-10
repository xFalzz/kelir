# 02. Spesifikasi produk

## Prinsip cakupan

Satu orang, 18 hari. Lebih baik 3 benda yang matang daripada 10 yang rapuh. Setiap fitur harus lulus dua pertanyaan: apakah itu menaikkan nilai di rubrik, dan apakah itu bisa didemokan tanpa gagal.

## Pengguna dan tugas utama

| Pengguna | Tugas | Ukuran berhasil |
|---|---|---|
| Pelajar atau mahasiswa | Memilih benda, memahami fungsi dan maknanya, mendengar legendanya | Dapat menjawab soal tentang benda setelah memakai |
| Guru | Memakai sebagai alat peraga di kelas | Bisa dijalankan dengan satu laptop dan proyektor, dengan atau tanpa kamera |
| Juri | Menilai fungsi dan desain | Semua fitur utama berjalan dari satu tautan, tanpa instalasi |

## Fitur wajib (MVP)

1. **Pintu masuk.** Pilih "dengan kamera" atau "tanpa kamera"; penjelasan izin kamera; pilihan bahasa.
2. **Rak pusaka.** 3 sampai 4 benda. `[ISI daftar final di 04-konten]`
3. **Ruang pegang.** Model 3D; gestur dan kontrol manual setara; titik info.
4. **Panggung kelir.** Satu legenda dengan 2 sampai 3 tokoh bayangan.
5. **Tiga bahasa.** Indonesia, Jawa Latin, Aksara Jawa; peralihan kapan saja.
6. **Tanya jawab.** Jawaban dari teks kurasi, dengan sumber ditampilkan dan jawaban cadangan.
7. **Halaman sumber.** Daftar sumber, lisensi aset, status tinjauan tiap teks.
8. **Mode tanpa kamera** untuk semua fitur di atas.

## Di luar cakupan (sengaja)

Akun pengguna, penyimpanan data pengguna, kolom komentar, papan skor, aplikasi mobile native, pembuatan 3D dari foto, pengenalan isyarat tangan yang kompleks, kursus Aksara Jawa lengkap.

## Gestur (maksimal empat)

| Gestur | Aksi | Padanan tanpa kamera |
|---|---|---|
| Cubit dan geser | Memutar benda | Seret dengan mouse atau sentuh |
| Dua tangan merenggang atau merapat | Memperbesar atau mengecilkan | Roda mouse atau cubit di layar sentuh |
| Telunjuk mengarah | Menunjuk titik info | Klik atau ketuk |
| Telapak terbuka tertahan sebentar | Menuju panggung kelir | Tombol "Mainkan cerita" |

Aturan: ada penghalusan gerak, ambang keyakinan, dan umpan balik visual jelas saat tangan terdeteksi atau hilang. Gestur tidak boleh memicu aksi tak sengaja: perlu tahan singkat untuk aksi yang mengubah layar.

## Keadaan layar (R-27)

| Layar | Kosong | Memuat | Galat |
|---|---|---|---|
| Pintu | Tidak ada benda tersedia: pesan jelas | Model dan WASM dimuat: progres nyata | Kamera ditolak atau tidak ada: otomatis tawarkan mode tanpa kamera |
| Rak pusaka | Konten gagal dimuat: pesan dan tombol coba lagi | Siluet penanda tempat | Model gagal: tampil gambar diam dan konteks teks |
| Ruang pegang | Benda tanpa titik info: tampil ringkasan | Model dimuat bertahap | WebGL tidak tersedia: tampilan gambar dan teks |
| Panggung kelir | Legenda belum tersedia: penanda jelas | Aset adegan dimuat | Gagal: putar versi teks bergambar |
| Tanya jawab | Belum ada pertanyaan: contoh pertanyaan nyata dari konten | Penanda sedang menjawab | AI gagal atau kuota habis: jawaban cadangan dari teks kurasi |

## Aksesibilitas

Operasi keyboard penuh, fokus terlihat, kontras AA, `prefers-reduced-motion`, teks alternatif untuk gambar, `lang` benar, target sentuh 44 px, tidak ada kilatan berbahaya.

## Kriteria penerimaan

1. Dari tautan produksi, seluruh alur dari Pintu sampai Sumber dapat diselesaikan **tanpa kamera** dalam kurang dari tiga menit.
2. Dengan kamera, empat gestur berfungsi di laptop biasa pada Chrome, `[ISI target kecepatan setelah diukur]`.
3. Tidak ada galat di console pada alur utama.
4. Tidak ada overflow horizontal di lebar 360 px.
5. Semua teks Jawa dan Aksara memiliki status yang tampil jelas.
6. Uji E2E alur utama lulus di lokal dan CI.
7. Delivery Gate antislop lulus dengan bukti.
