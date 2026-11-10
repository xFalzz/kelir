# 07. Bahasa dan Aksara Jawa

## Istilah

- **Carakan** sama dengan **Hanacaraka**, yaitu Aksara Jawa itu sendiri.
- **Dentawyanjana**, sepengetahuan saya, adalah istilah tata bahasa Jawa untuk konsonan dental, bukan nama aksara. `[KONFIRMASI ke guru atau penutur Jawa sebelum dikutip di proposal]`

Jadi bahasa yang disediakan: **Indonesia**, **Jawa (Latin)**, dan **Aksara Jawa**.

## Prinsip

1. Aksara Jawa dihasilkan **aturan pasti**, bukan AI.
2. Teks Jawa dari AI selalu `draf` sampai ditinjau penutur.
3. Aksara hanya sebagai tampilan dan fitur belajar kecil, bukan kursus lengkap.
4. Teks Latin selalu tersedia sebagai pembanding agar pengguna bisa memeriksa.

## Font dan render

- Unicode blok Javanese: U+A980 sampai U+A9DF.
- Font: Noto Sans Javanese (SIL OFL 1.1), self-host `woff2`.
- Aksara Jawa butuh pengaturan huruf kompleks (pasangan dan sandhangan); browser modern menangani lewat mesin teks bawaan.
- Atribut `lang="jv"` untuk teks Jawa.
- Uji render di Chrome, Firefox, Safari, dan Android Chrome; sediakan fallback bila font gagal dimuat.

## Transliterator berbasis aturan

Lokasi: `src/lib/aksara/`. Masukan: teks Jawa Latin. Keluaran: string Unicode Aksara Jawa.

### Cakupan versi lomba

| Fitur | Dicakup |
|---|---|
| Aksara dasar (20 nglegena) | Ya |
| Sandhangan swara (wulu, pepet, suku, taling, taling-tarung) | Ya |
| Sandhangan panyigeg wanda (layar, cecak, wignyan) | Ya |
| Pangkon dan pasangan | Ya |
| Aksara murda, rekan, swara | Sebagian; sisanya ditandai belum didukung |
| Angka dan tanda baca | Sebagian |

### Cara kerja

1. Normalisasi ejaan Latin Jawa (misalnya pembedaan e pepet dan e taling perlu penanda masukan karena ejaan Latin biasa ambigu).
2. Pisahkan suku kata.
3. Petakan konsonan dan vokal ke aksara dan sandhangan.
4. Gabungkan gugus konsonan dengan pangkon.
5. Keluarkan teks Unicode.

Catatan jujur: ejaan Latin tidak selalu membedakan *e* pepet dan *e* taling, atau *a* dan *o* pada ejaan tertentu. Untuk konten lomba, setiap teks Jawa menyimpan **ejaan bertanda** yang sudah ditinjau penutur agar keluaran Aksara tidak menebak.

### Pengujian

- Contoh yang sudah diketahui benar: `hanacaraka` menjadi `ꦲꦤꦕꦫꦏ`.
- Kasus lain diisi bersama penutur dan buku rujukan `[ISI: sumber kaidah]`, lalu masuk ke uji unit sebagai kasus tetap.
- Setiap kasus uji punya rujukan.

## Tingkat tutur

Ngoko, krama, dan campurannya mudah salah. Pilihan awal: gunakan **satu tingkat** untuk seluruh konten, ditentukan penutur `[PILIH oleh penutur]`.

## Alur kerja teks Jawa

Lihat bagian "Alur peninjauan teks Jawa" di `04-konten-dan-sumber.md`.
