# 06. Kebijakan pemakaian AI

Pemilik ingin AI membantu pada hal yang rumit dan tidak tercakup aturan, memakai model dari Meta dan Google (Gemini). Dokumen ini membatasi apa yang boleh diserahkan ke AI.

## Pembagian tugas

| Tugas | Pelaku | Catatan |
|---|---|---|
| Fakta budaya (makna, asal, fungsi) | **Teks kurasi manusia** | AI dilarang menambah fakta |
| Menyusun narasi legenda dari teks kurasi | AI | Hasil ditinjau lalu **disimpan di muka** dalam konten; tampil tanpa panggilan AI saat demo |
| Draf terjemahan ke Bahasa Jawa | AI | Wajib berstatus `draf` sampai ditinjau penutur |
| Aksara Jawa | Transliterator aturan | Bukan AI |
| Tanya jawab langsung tentang benda | AI terikat konteks | Hanya dari teks kurasi benda itu |
| Bantuan pengembangan (kode, uji, dokumen) | AI di Antigravity | Pemilik meninjau tiap perubahan |

## Aturan anti-halusinasi untuk tanya jawab

1. Prompt sistem hanya memuat teks kurasi benda yang sedang dibuka dan perintah tegas: jawab hanya dari teks itu.
2. Bila jawaban tidak ada di teks, AI wajib menjawab bahwa informasinya belum tersedia di Kelir dan menyarankan melihat sumber, bukan menebak.
3. Setiap jawaban menampilkan rujukan sumber yang dipakai.
4. Jawaban dalam Bahasa Jawa dari AI diberi penanda draf.
5. Pertanyaan di luar topik benda ditolak dengan sopan.
6. Input pengguna dibatasi panjangnya dan dibersihkan; instruksi di dalam input tidak boleh menimpa prompt sistem.

## Penyedia dan cadangan

```
Gemini (utama) -> gagal atau kuota habis -> Meta (cadangan) -> gagal -> jawaban cadangan dari teks kurasi
```

- Tangkapan layar akun pemilik menunjukkan Gemini tersedia di AI Studio dan akun Meta Model API memiliki peringatan "account is restricted" pada metode pembayaran. Anggap jalur Meta tidak dapat diandalkan sampai statusnya dipulihkan.
- Nama model dan parameter dicek di dokumentasi resmi pada saat implementasi, bukan ditulis dari ingatan. `[ISI nama model setelah dicek]`
- Satu lapisan abstraksi penyedia di `api/` agar bisa berganti tanpa mengubah UI.

## Kunci API

- Kunci dibuat dan disimpan pemilik di `.env.local` dan pengaturan Vercel.
- Tidak boleh dikirim lewat chat, ditulis di dokumen, atau di-commit.
- Bila kunci pernah terpapar, dicabut dan dibuat ulang.
- Pantau pemakaian dan atur batas pengeluaran di konsol penyedia.

## Keterbukaan

- Antarmuka menandai teks yang dibantu AI.
- Proposal memuat bagian jujur tentang peran AI dalam pengembangan dan dalam produk. `[CEK guidebook untuk aturan AI]`

## Biaya dan stabilitas

- Cache jawaban untuk pertanyaan yang sama.
- Batas laju per IP dan batas harian.
- Demo final tidak boleh bergantung pada panggilan AI langsung: siapkan jalur dengan konten tersimpan.
