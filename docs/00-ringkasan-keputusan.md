# 00. Ringkasan keputusan

Terakhir diperbarui: 2026-11-10.

## Konteks lomba (dari guidebook)

- Lomba: Innovation Competition 2026, kategori Software Development.
- Tema karya: "From Ideas to Innovation".
- Bentuk karya: aplikasi Website atau Mobile. Karya ini Website.
- Tim maksimal 3 orang; proyek ini dikerjakan **solo**.
- Pendaftaran dan pengumpulan sampai **28 November 2026**.
- Karya harus orisinal, bukan plagiarisme, dan belum pernah juara di lomba sejenis.
- Konten tidak boleh mengandung pornografi, kekerasan, perjudian, atau pelanggaran SARA.
- Bahasa pemrograman, framework, dan library bebas.
- Penyisihan: Orisinalitas dan Urgensi 20%, Inovasi dan Dampak 20%, Kelengkapan Proposal 15%, UI/UX 20%, Fungsionalitas dan Implementasi 25%.
- Final: Presentasi 20%, Inovasi dan Dampak 20%, Fungsionalitas 30%, Live Demo 20%, Tanya Jawab 10%.

Bagian guidebook yang belum terlihat (halaman 1 sampai 5, 7, 9 sampai 11, 14 dan seterusnya) wajib diperiksa pemilik: jadwal, format proposal, durasi presentasi, aturan penggunaan AI. `[ISI dari guidebook]`

## Keputusan yang sudah diambil

| Keputusan | Pilihan | Dasar |
|---|---|---|
| Konsep | Gabungan Wayang Tangan dan Warisan 3D | Pilihan pemilik |
| Nama | **Kelir** | Pilihan pemilik |
| Budaya | Yogyakarta dan Jawa Tengah | Pilihan pemilik |
| Sasaran | Pelajar dan mahasiswa | Pilihan pemilik |
| Bahasa | Indonesia utama; Jawa (Latin) dan Aksara Jawa | Pilihan pemilik |
| Mode antislop | DURING | Pilihan pemilik |
| Logo | Wordmark dengan padanan Aksara dan motif tangan-bayangan; final menunggu `DESIGN.md` | Diserahkan pemilik ke agen |
| Pengerjaan | Solo, 18 hari | Fakta |
| Stack | Vite, TypeScript, Svelte 5, Three.js, MediaPipe, GSAP; satu fungsi serverless untuk AI | Usulan agen, tanpa Next.js sesuai permintaan pemilik |

## Keputusan yang masih terbuka

1. Persetujuan `DESIGN.md` (palet, huruf, logo, ornamen).
2. Persetujuan final stack.
3. Penutur bahasa Jawa dan narasumber budaya: **belum ada**.
4. Benda mana yang dipakai (3 sampai 4) dan legenda mana yang diperankan.
5. Nama tim, nama institusi, dan nama folder pengumpulan.
6. Kunci API Gemini dan Meta, diisi pemilik di `.env.local`.
7. Isi guidebook bagian lain.

## Risiko utama dan mitigasinya

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konsep wayang tangan sudah ada dan viral | Orisinalitas 20% | Pembeda tegas: benda 3D, cerita bersumber, Aksara Jawa, tujuan edukasi; tidak menyalin apa pun dari proyek itu |
| Aset 3D dan wayang bukan milik sendiri | Diskualifikasi karena plagiarisme | Semua aset dicatat di register lisensi; cadangan: bentuk buatan sendiri |
| Teks Jawa salah | Kredibilitas budaya | Status draf sampai ditinjau penutur; Aksara lewat transliterator aturan |
| Kamera tidak tersedia saat dinilai | Fungsionalitas 25 sampai 30% | Mode tanpa kamera penuh; video demo di folder pengumpulan |
| Kuota AI habis atau akun Meta restricted | Fitur AI mati saat demo | Narasi disimpan di muka; Gemini utama, Meta cadangan; jawaban cadangan |
| Performa 3D di laptop juri | UI/UX dan demo | Model ringan terkompresi, bayangan adaptif, uji di perangkat lemah |
| Waktu 18 hari solo | Tidak selesai | Cakupan MVP sempit dan garis potong di `08-jadwal-18-hari.md` |
