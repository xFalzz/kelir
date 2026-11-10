# 11. Presentasi, demo, dan tanya jawab (babak final)

Bobot final: Presentasi 20%, Inovasi dan Dampak 20%, Fungsionalitas 30%, Live Demo 20%, Tanya Jawab 10%. Durasi dan format `[ISI dari guidebook]`.

## Kerangka slide

| No | Isi | Tujuan |
|---|---|---|
| 1 | Masalah: benda budaya sulit dijangkau pelajar | Urgensi, dengan satu sumber nyata `[REAL DATA]` |
| 2 | Siapa yang terdampak | Pelajar, mahasiswa, guru |
| 3 | Kelir dalam satu kalimat dan satu gambar | Fokus |
| 4 | Demo langsung (lompat ke aplikasi) | Fungsionalitas dan live demo |
| 5 | Pembeda dari demo wayang tangan yang sudah ada | Orisinalitas, disampaikan jujur |
| 6 | Cara konten dijaga akurat: sumber, tinjauan, status draf | Kepercayaan |
| 7 | Cara kerja teknis singkat dan alasan memilih tiap bagian | Tanya jawab teknologi |
| 8 | Hasil pengukuran nyata dari uji kecil, termasuk yang kurang | Dampak |
| 9 | Batas yang diakui dan rencana lanjut | Kejujuran |
| 10 | Penutup dan tautan | |

Aturan slide: tidak ada angka tanpa sumber, tidak ada testimoni, tidak ada klaim kinerja yang tidak diukur, tidak ada em dash.

## Naskah demo (target tiga menit)

1. **Pintu.** Pilih tanpa kamera atau dengan kamera. Perlihatkan bahwa kedua jalur sampai ke tujuan yang sama.
2. **Rak pusaka.** Pilih satu benda.
3. **Ruang pegang.** Putar, perbesar, tunjuk satu bagian; bacakan konteks dan tunjukkan sumbernya.
4. **Ganti bahasa.** Indonesia, Jawa, Aksara; tunjukkan penanda status.
5. **Panggung kelir.** Mainkan legenda dengan tangan.
6. **Tanya jawab.** Ajukan satu pertanyaan yang ada di konten, lalu satu yang tidak ada, agar juri melihat AI menolak menebak.
7. **Sumber.** Tampilkan halaman sumber dan lisensi.

### Rencana cadangan demo

| Masalah | Tindakan |
|---|---|
| Kamera tidak berfungsi atau ditolak | Lanjutkan dengan mouse; sampaikan bahwa ini memang jalur setara |
| Internet buruk | Buka versi lokal yang sudah dimuat; konten tetap tampil |
| AI gagal | Tunjukkan jawaban cadangan; jelaskan desainnya |
| WebGL gagal | Pindah ke tampilan gambar dan teks; putar video demo |
| Semua gagal | Putar video demo penuh yang sudah disiapkan |

Latihan: jalankan seluruh naskah paling sedikit tiga kali, termasuk satu kali dengan sengaja mematikan kamera, jaringan, dan AI.

## Bahan tanya jawab

Jawaban di bawah adalah kerangka. Isi dengan fakta nyata proyek setelah dibangun. Jangan menjawab dengan hal yang tidak benar.

| Pertanyaan | Kerangka jawaban |
|---|---|
| Apa bedanya dengan wayang tangan yang viral? | Mengakui keberadaannya. Pembeda: tujuan edukasi, benda 3D dengan titik info bersumber, tiga bahasa termasuk Aksara, status tinjauan konten, mode tanpa kamera. Tidak ada aset dan kode yang disalin. |
| Dari mana datanya? | Sumber tercatat di halaman Sumber; tiap teks punya rujukan dan status. |
| Apakah AI bisa salah soal budaya? | Ya. Karena itu AI tidak menambah fakta; ia hanya menjawab dari teks kurasi dan menolak jika tidak ada. Teks Jawa dari AI berstatus draf sampai ditinjau. |
| Siapa yang meninjau teks Jawa? | `[ISI nama nyata, atau jujur: belum ada, dan itu dicatat sebagai keterbatasan]` |
| Bagaimana Aksara Jawa dihasilkan? | Transliterator berbasis aturan yang diuji; bukan AI. Batas cakupannya dinyatakan. |
| Bagaimana jika tidak ada kamera? | Semua fungsi tersedia lewat mouse, sentuh, dan keyboard. |
| Privasi kamera? | Video diproses di perangkat, tidak diunggah atau disimpan. |
| Kenapa tidak memakai framework X? | Kebutuhan ada di sisi klien; Vite dan Svelte ringan, dan Three.js memberi kontrol 3D langsung. |
| Bagaimana mengukur dampak? | Tes pemahaman sebelum dan sesudah pada kelompok kecil; hasil dilaporkan apa adanya `[ISI hasil nyata]`. |
| Apa batasan terbesar? | Jumlah benda dan legenda masih sedikit, peninjauan budaya terbatas, dan pelacakan bergantung cahaya dan kamera. |
| Bagaimana kelanjutannya? | Menambah benda bersama sanggar atau museum, paket guru, dan tampilan mobile penuh. |
| Apakah aset 3D milik Anda? | Daftar lisensi lengkap ada di register; sebutkan satu per satu. |

## Etika presentasi

- Akui peran AI dalam pengembangan bila ditanya.
- Jangan menyebut mitra, narasumber, atau pengguna yang tidak nyata.
- Jika tidak tahu jawabannya, katakan tidak tahu dan jelaskan cara mencarinya.
