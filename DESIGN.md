# DESIGN.md: Kelir

Status: **DISETUJUI PEMILIK (2026-11-10).** Pemilik menyertakan dua video referensi dan menyetujui draf arah desain serta menyerahkan keputusan palet hex, pasangan huruf, mode terang/gelap, dan logo kepada agen.

## Design Read

Reading this as: aplikasi web interaktif edukasi budaya untuk pelajar dan mahasiswa, dengan bahasa visual pertunjukan wayang malam (cahaya lampu blencong, kelir, siluet), dial **ENERGY 3 / RHYTHM 3 / MOTION 3**.

Alasan dial: target karya adalah kualitas ala Awwwards dan kesan di live demo. Gerak adalah inti produk (tangan menggerakkan bayangan dan benda pusaka), jadi MOTION 3 punya tujuan nyata. RHYTHM 3 karena layar-layarnya berbeda fungsi (pintu masuk, rak siluet, ruang pegang 3D, panggung kelir cerita, dan buku sumber), bukan seksi seragam.

## Referensi dan batasnya

Referensi yang diberikan pemilik: demo wayang kulit dua boneka yang digerakkan satu per tangan, dengan kelir krem, jumbai, dan pita ornamen.

- Dipakai sebagai inspirasi: kehangatan cahaya, bayangan jatuh di kain, rasa pertunjukan malam.
- **Tidak disalin:** komposisi layarnya, gambar wayang, kode, ornamen sudut, dan tata letak kontrolnya. Kelir terbaca sebagai karya berbeda: ada benda 3D, cerita bersumber, dan Aksara Jawa.

## Identitas

- **Nama:** Kelir (`ꦏꦼꦭꦶꦂ`). Kata Jawa untuk layar kain tempat bayangan wayang jatuh. Alasan: satu kata, bermakna, langsung menunjuk ke konsep produk.
- **Motif identitas (satu, diulang):** *bayangan yang jatuh di atas kain kelir.* Setiap benda punya siluet tajam yang jatuh di kelir; saat pengguna menyentuh atau menggerakkan benda, bayangannya ikut bergerak mengikuti arah lampu blencong. Motif ini muncul pada mark logo, kartu siluet rak pusaka, adegan 3D ruang pegang, dan panggung cerita.
- **Fokus per layar:** satu elemen saja yang paling terang, yaitu panggung kelir atau benda pusaka. Semua elemen lain mengalah.
- **Aksen tunggal:** merah bata (`#9E2E17` / `#C84B31`), dipakai hanya pada tombol aksi utama dan penanda titik atau langkah yang sedang aktif.

## Palet (R-29: maksimal 2 sampai 3 warna inti + 1 aksen)

Seluruh pasangan warna telah diuji dengan rumus kontras WCAG 2.x (R-25):

| Peran | Hex | Pasangan & Rasio Kontras | Alasan |
|---|---|---|---|
| Kain kelir (terang) | `#F3EBDC` | Teks di atas Gelap `#18130F`: **15.57:1** (AA/AAA) | Warna layar kain blacu tempat bayangan jatuh. Menjadi permukaan terang utama dan warna teks di ruang gelap. |
| Gelap ruang (inti) | `#18130F` | Teks di atas Kain kelir `#F3EBDC`: **15.57:1** (AA/AAA) | Ruang pertunjukan malam di luar kelir. Memberi kontras agar cahaya terasa hidup. |
| Permukaan kayu (inti) | `#231C16` | Teks Kain kelir `#F3EBDC` di atasnya: **14.19:1** (AA) | Warna kotak wayang dan bilah kontrol di sekitar panggung. |
| Teks redup (di gelap) | `#CFC3AE` | Di atas `#18130F`: **10.60:1**; di atas `#231C16`: **9.66:1** (AA) | Teks sekunder dan keterangan sumber pada mode gelap. |
| Teks redup (di terang) | `#4B3D32` | Di atas `#F3EBDC`: **8.81:1** (AA) | Teks sekunder dan keterangan sumber pada mode terang. |
| Garis batas (di gelap) | `#82705E` | Di atas `#18130F`: **3.89:1**; di atas `#231C16`: **3.55:1** (>= 3:1 non-teks) | Garis tepi kontrol, kartu, dan pemisah sesuai WCAG 1.4.11. |
| Garis batas (di terang) | `#6A5949` | Di atas `#F3EBDC`: **5.65:1** (>= 3:1 non-teks) | Garis tepi kontrol dan tabel pada mode terang. |
| Aksen merah bata | `#9E2E17` (isian) / `#C84B31` (garis fokus) | `#F3EBDC` di atas `#9E2E17`: **6.21:1** (AA teks normal); `#C84B31` di atas `#18130F`: **3.96:1** (>= 3:1 indikator fokus) | Satu titik fokus hangat seperti bara blencong; dipakai hemat. |

**Tema (R-21, R-34):** mendukung dua mode yang keduanya berfungsi penuh dan terverifikasi kontrasnya: **Malam (gelap, bawaan)** untuk suasana panggung blencong dan **Siang (terang, kain kelir)** untuk membaca teks panjang dan tabel sumber di ruang terang. Tombol ganti tema selalu dapat diakses di bilah atas.

## Tipografi (R-06, R-31)

Semua huruf di-host sendiri (`woff2` via `@fontsource`) agar tidak bergantung CDN luar saat demo:

- **Judul (`--font-display`):** **Fraunces Variable** (SIL OFL). Alasan: serif ekspresif dengan kontras tebal-tipis yang terasa seperti pahatan kayu dan poster pertunjukan sastra, bukan antarmuka SaaS generik.
- **Isi (`--font-body`):** **Atkinson Hyperlegible** (SIL OFL). Alasan: dirancang khusus untuk keterbacaan tinggi bagi mata lelah dan pengguna low-vision pada teks edukasi serta label kontrol, sekaligus menghindari pilihan default AI (Inter, Geist, Space Grotesk).
- **Aksara Jawa (`--font-javanese`):** **Noto Sans Javanese** (SIL OFL), Unicode blok U+A980 sampai U+A9DF (`ꦲꦤꦕꦫꦏ`).
- Tidak ada huruf monospace besar untuk estetika terminal atau label huruf kapital berjarak ekstrem (R-06).

## Struktur layar (R-05: bukan landing page template)

Struktur mengikuti alur belajar pengguna dan bervariasi komposisinya (RHYTHM 3):

1. **Pintu (Layar 1, komposisi terpusat di depan bingkai kelir):** Pengantar singkat satu kalimat, peragaan langsung bayangan di kelir, dan dua tombol masuk yang setara: **Masuk dengan Kamera** atau **Masuk Tanpa Kamera (Mouse/Sentuh/Keyboard)**.
2. **Rak Pusaka (Layar 2, komposisi asimetris 3 benda):** Tiga benda pusaka Jawa (Keris, Saron Gamelan, Wayang Kulit Purwa) ditampilkan dengan proporsi dan tata letak berbeda sesuai ukuran serta perannya, bukan kartu fitur copy-paste.
3. **Ruang Pegang 3D (Layar 3, kanvas 3D + panel baca samping):** Model 3D prosedural benda di tengah kelir dengan bayangan nyata dari lampu blencong; pengguna memutar, memperbesar, dan memilih 4 titik info bagian benda disertai rujukan sumber dan tanya jawab terikat konteks.
4. **Panggung Kelir (Layar 4, panggung layar lebar + bilah lakon bawah):** Lakon Ramayana *Kijang Kencana* dalam 4 babak dengan dua boneka wayang (Rama di kanan, Kidang Kencana / Marica di kiri) yang digerakkan tangan atau slider/keyboard, lengkap dengan narasi tiga bahasa.
5. **Sumber & Metodologi (Layar 5, tata letak dokumen editorial dan tabel):** Daftar pustaka terverifikasi (UNESCO, Encyclopaedia Britannica, Museum Sonobudoyo), register lisensi aset, status tinjauan Bahasa Jawa, serta alat uji alihaksara Aksara Jawa berbasis aturan.

Tidak ada testimoni palsu, statistik karangan, bar logo klien, tabel harga, atau FAQ template.

## Gerak (MOTION 3, tiap gerak punya tujuan, R-19)

| Gerak | Tujuan |
|---|---|
| Bayangan dan benda 3D mengikuti tangan/pointer dengan peredaman (smoothing) | Memberi rasa dimainkan dalang dan meredam getaran pelacakan webcam |
| Cahaya blencong bergoyang lembut pada kanvas 3D | Menandai sumber cahaya lampu minyak yang hidup; berhenti otomatis saat `prefers-reduced-motion` aktif |
| Transisi antarlayar dengan tirai kelir GSAP | Menjaga kesinambungan ruang panggung tanpa kombinasi Fade Up + Bounce generik |
| Fokus kamera 3D bergerak halus ke titik info yang dipilih | Mengarahkan mata pengguna tepat ke bagian benda (wilah, ganja, pamor, warangka, dll.) yang sedang dibahas |

## Komponen, bentuk, dan ornamen

- Radius: `2px` untuk tombol dan input, `4px` untuk panel, `0px` untuk bingkai kelir. Tidak ada bentuk pil di seluruh halaman (R-11).
- Bayangan (shadow) CSS hanya pada panel dialog yang melayang di atas kanvas; bayangan utama adalah bayangan optik di dalam adegan 3D (R-12).
- Glow: hanya satu sumber cahaya blencong di kanvas kelir (R-13).
- Tanpa glassmorphism di seluruh antarmuka (R-10).
- Tanpa ikon dekoratif generik (R-04) dan tanpa panah di setiap tombol (R-08).
- Ornamen: hanya bingkai kayu plangkan dan garis panggung sederhana. Tidak memakai motif mega mendung (Cirebon) maupun motif larangan keraton yang belum dikonfirmasi narasumber.
- Logo: wordmark `Kelir` berdampingan dengan Aksara Jawa `ꦏꦼꦭꦶꦂ` (hasil transliterator aturan) dan mark SVG siluet bingkai kelir.

## Daftar alasan keputusan (R-31)

| Keputusan | Alasan satu baris |
|---|---|
| Palet `#F3EBDC`, `#18130F`, `#231C16`, aksen `#9E2E17` | Mewakili kain kelir blacu, ruang pertunjukan malam, kayu kotak wayang, dan bara lampu blencong |
| Dua mode (Malam & Siang) dengan toggle | Mode Malam menjaga suasana blencong saat eksplorasi 3D, sedangkan Mode Siang memudahkan bacaan panjang di kelas |
| Fraunces + Atkinson Hyperlegible + Noto Sans Javanese | Memberi karakter sastra/pertunjukan pada judul, keterbacaan tinggi pada isi, dan dukungan penuh Aksara Jawa |
| Struktur lima layar berbeda komposisi | Mengikuti tahapan belajar dari memilih mode input, memilih benda, mengamati bagian benda, memainkan lakon, hingga memeriksa sumber |
| Peredaman gerak (lerp) pada tangan dan kamera 3D | Meredam jitter webcam dan membuat bayangan terasa punya bobot fisik |
| Tanpa statistik, testimoni, dan FAQ | Produk belum memiliki data survei pengguna; menyajikan sumber pustaka jauh lebih jujur daripada angka rekaan |
