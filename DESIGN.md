# KELIR · Arsitektur Desain Spasial 3D & Panduan Sistem Multi-Halaman

> Dokumen panduan terbaru hasil perombakan total **Kelir (`ꦏꦼꦭꦶꦂ`)** — memadukan estetika minimalisme modern bertema terang utama (*Warm Museum Alabaster `#F6F4EF`*) yang dapat dialihkan ke mode malam (*Obsidian `#0A0B0E`*), dengan pelestarian warisan budaya Jawa berbasis sumber terverifikasi (`S1–S7`) dalam arsitektur **5 Halaman Terpadu**.

---

## 1. Filosofi Visual, Arah Seni & Struktur 5 Halaman

Kelir dirancang sebagai aplikasi web multi-halaman yang selaras agar pengguna tidak terjebak dalam satu guliran vertikal tanpa akhir. Setiap halaman memiliki fokus kuratorial, tata letak spesifik, dan panggung WebGL 3D tersendiri yang di-mount secara dinamis:

1. **Halaman 01 — `Beranda & Diorama` (`?hal=beranda`, Referensi: `townhouse.dev` + Video 1 & 2)**
   - Kanvas dasar utama batu candi / *Warm Museum Alabaster* (`#f6f4ef`, dengan pilihan mode malam `#0a0b0e`) beserta diorama tiga dimensi penuh layar (*full-bleed interactive WebGL*) yang menampilkan kompleks suaka budaya Jawa: **Pendopo Joglo Agung** beratap trapesium Brunjung-Penanggap dengan 16 tiang & lampu robyong, **Besalen Empu Keris** dengan tungku prapen & pompa ububan kembar, **Bale Karawitan Gamelan**, **Gazebo Wastra Batik**, **Panggung Kelir Wayang**, gapura **Candi Bentar**, jembatan kanal air berteratai, dan pohon beringin multi-kanopi.
   - Dilengkapi *scrollytelling* 5 bab sejarah pusaka dengan angka **piksel-matriks SVG (`01`–`05`)**, kartu HUD kaca buram, **Matriks 12 Anatomi Pusaka** perspektif 3D berpenataan minimalis tanpa tumpang-tindih, **Etalase Pita Horizontal (`PUSAKA JAWA`)**, serta **Direktori 5 Halaman**.
2. **Halaman 02 — `Digital Twin 3D` (`?hal=twin`, Referensi: `zeggo.com.sg`)**
   - Studio inspeksi CAD & PBR untuk ke-5 pusaka (*Keris Luk 5*, *Saron Slendro*, *Batik Kawung*, *Pendopo Joglo*, *Wayang Kulit*) dengan 6–12 sub-komponen anatomis yang dapat diurai melalui penggeser **Ledak Anatomi (`0%–100%`)**.
   - Menyediakan sakelar 3 mode render (`PBR Nyata`, `Hibrida`, dan `Kawat X-Ray CAD`), papan bilah Saron interaktif, 4 baris keunggulan rekayasa di atas grid Swiss minimalis, serta 3 kolom manifesto arsitektural sejajar.
3. **Halaman 03 — `Coverflow & Suluk` (`?hal=koleksi`, Referensi: `lolawilde.com`)**
   - Galeri **Coverflow 3D perspektif melengkung** dengan kartu vertikal bersudut membulat, paginasi `< 01 / 05 >`, tombol **`▶ Putar Suluk & Bedah`** yang membuka **Modal Layar Penuh Terpisah** (karaoke larik suluk sinkron + pemutar gending merah soga), serta indeks daftar pusaka bergaya album (`KELIR VOL. I`).
4. **Halaman 04 — `Panggung Wayang` (`?hal=pakeliran`, Referensi: Pakeliran Keraton)**
   - Teater bayangan **Lakon Kijang Kencana 3D** dengan layar kain blacu berplisir merah-emas, gawangan berukir, dua batang gedebog pisang, jajaran wayang *Simpingan* di kanan-kiri, lampu minyak *Blencong* berkerucut volumetrik, Gunungan Kayon krawangan, Sri Rama (wajah hitam alusan, Gelung Supit Urang, kain dodot polikrom ber-bokongan, cempurit tanduk kerbau, lengan berartikulasi ganda, busur Gendewa), serta Kidang Kencana berkaki sendi ganda.
5. **Halaman 05 — `Aksara & AI Orb` (`?hal=kawruh`, Referensi: `zeggo.com.sg` Bot & Hanacaraka)**
   - Menampilkan **Pamomong AI Orb** (bola metalik 3D Chrome-Obsidian dengan visor kaca gelap, sepasang ear-node bercincin `#ff5a1f`, dan cincin gyroskopik) yang ditenagai mesin temu-balik **BM25 (`k1=1.4, b=0.65`)** + ekspansi sinonim Jawa, panel transparansi bukti kutipan, serta mekanisme penolakan tegas di luar korpus `S1–S7`, berdampingan dengan laboratorium transliterasi Aksara Jawa *Hanacaraka* (`U+A980–U+A9DF`), 20 kartu *Carakan*, serta tabel ledger pustaka primer `S1–S7`.

---

## 2. Sistem Tipografi & Token Warna

### Rumpun Fon Lokal (Luring/Offline Ready)
- **Display & Judul Utama:** `'Space Grotesk Variable'`, `'Archivo Black'`, sans-serif — huruf rapat bertenaga (`letter-spacing: -0.04em`).
- **Teks Tubuh:** `'Inter'`, sans-serif — keterbacaan tinggi pada latar gelap maupun terang.
- **Data, Eyebrow & Telemetri:** `'JetBrains Mono'`, monospace.
- **Aksara Daerah:** `'Noto Sans Javanese'` untuk aksara Jawa (*Hanacaraka*).
- **Angka Bab Piksel:** Vektor SVG piksel 5×7 khusus (`01`–`05`) agar tajam di semua kerapatan layar.

### Palet Warna Utama
| Token | Mode Terang Utama (Batu Alabaster) | Mode Malam (Obsidian Museum) | Peran |
| :--- | :--- | :--- | :--- |
| `--bg-void` | `#f6f4ef` | `#0a0b0e` | Kanvas utama ruang diorama |
| `--bg-black` | `#eeebe2` | `#0e1015` | Kanvas etalase & matriks 3D |
| `--bg-card` | `rgba(255, 255, 255, 0.90)` | `rgba(19, 21, 28, 0.84)` | Panel HUD, bilah nav, modal |
| `--text-primary` | `#141518` | `#f4f4f1` | Tajuk utama dan teks primer |
| `--text-secondary` | `#434852` | `#a0a4ae` | Deskripsi dan metadata |
| `--accent-crimson` | `#b33025` | `#c83e31` | Identitas archive, pemutar suluk |
| `--accent-ember` | `#d1491b` | `#e85d2a` | Kawat CAD, sorotan sistem & telemetri |
| `--accent-gold` | `#9a6c1d` | `#d4a148` | Prada wayang, bilah saron, ornamen brass |

---

## 3. Panduan Aksesibilitas & Performa
- **Isolasi Konteks WebGL Per Halaman**: Hanya 1 panggung WebGL aktif yang dirender pada satu halaman sehingga GPU dapat merender geometri wayang krawangan, pamor keris, dan atap joglo berdetail tinggi dengan mulus.
- **`prefers-reduced-motion: reduce`**: Secara otomatis menonaktifkan penyapuan preloader lambat dan meredam transisi cepat.
- **Pelacakan Tangan Lokal 100%**: Menggunakan MediaPipe Hand Landmarker dari `/public/mediapipe/` tanpa mengirim bingkai kamera ke server eksternal.
