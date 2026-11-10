# 01. Proposal proyek: Kelir

Karya untuk Innovation Competition 2026, kategori Software Development.
Tema: From Ideas to Innovation.
Peserta: Perorangan (Solo) `[ISI nama lengkap & NIM pada sampul PDF sebelum diunggah]`, Universitas Bina Sarana Informatika (UBSI).

## 1. Ringkasan Eksekutif

**Kelir** (`ꦏꦼꦭꦶꦂ`) adalah aplikasi web interaktif untuk mempelajari benda pusaka budaya Jawa (Yogyakarta dan Jawa Tengah) melalui penggabungan eksplorasi 3D, pelacakan tangan di browser (*MediaPipe Hand Landmarker*), panggung wayang bayangan (*lakon Ramayana: Kijang Kencana*), dan alihaksara **Aksara Jawa** berbasis aturan. Tanpa perangkat tambahan selain browser dan webcam opsional, pelajar dan mahasiswa dapat memutar benda pusaka, menunjuk bagian-bagian anatomisnya (seperti *wilah*, *ganja*, *pamor*, dan *warangka* pada keris), memainkan lakon wayang kulit di atas layar kain blacu (*kelir*), serta membaca penjelasannya dalam tiga bahasa: Bahasa Indonesia, Bahasa Jawa (ragam Krama dengan penanda status tinjauan), dan Aksara Jawa (`ꦲꦤꦕꦫꦏ`). Seluruh fakta budaya terikat pada sumber terverifikasi dari UNESCO, *Encyclopaedia Britannica*, dan Museum Negeri Sonobudoyo Yogyakarta.

## 2. Latar Belakang dan Urgensi Masalah

1. **Warisan budaya Jawa telah diakui dunia tetapi detail teknisnya jarang dipahami generasi muda.** UNESCO menetapkan *Wayang puppet theatre* (diproklamasikan 2003, terdaftar 2008, berkas 00063), *Indonesian Kris* (diproklamasikan 2005, terdaftar 2008, berkas 00112), dan *Gamelan* (terdaftar Desember 2021, berkas 01760) ke dalam *Representative List of the Intangible Cultural Heritage of Humanity*. Namun dalam pembelajaran di kelas, pelajar umumnya hanya melihat foto datar tanpa mengenal struktur bagian benda dan keterkaitannya dengan pertunjukan wayang.
2. **Hambatan fisik terhadap koleksi museum.** Koleksi rujukan seperti di Museum Negeri Sonobudoyo Yogyakarta (diresmikan 6 November 1935, Jl. Pangurakan No. 6 Yogyakarta) tersimpan di balik kaca pelindung demi konservasi, sehingga pengunjung tidak dapat memegang, membalik, atau mengamati cara kerja tangkai *cempurit* dan pantulan cahaya *blencong* secara langsung.
3. **Kerentanan alihaksara dan informasi budaya pada era AI generatif.** Model bahasa besar sering mengalami halusinasi saat menjelaskan istilah anatomi pusaka atau salah menyusun *pasangan* dan *sandhangan* Aksara Jawa (blok Unicode `U+A980–U+A9DF`). Dibutuhkan perangkat lunak yang memisahkan secara tegas antara **teks kurasi bersumber**, **mesin alihaksara deterministik berbasis aturan**, dan **asisten tanya jawab yang terkunci pada teks sumber**.

## 3. Rumusan Masalah

1. Bagaimana menghadirkan pengalaman mengamati struktur tiga dimensi benda pusaka Jawa dan panggung bayangan wayang kulit langsung di browser web tanpa mewajibkan perangkat khusus?
2. Bagaimana menjaga keakuratan informasi budaya serta penulisan Aksara Jawa agar bebas dari karangan bebas (*halusinasi*) AI?
3. Bagaimana memastikan aplikasi tetap inklusif dan dapat digunakan penuh oleh pelajar maupun dewan juri yang tidak memiliki webcam atau hanya menggunakan keyboard dan layar sentuh?

## 4. Tujuan Inovasi

1. Membangun ruang pegang 3D dan panggung wayang bayangan berbasis WebGL (Three.js) dan pelacakan tangan lokal (*MediaPipe Tasks Vision*) yang berjalan langsung di perangkat pengguna.
2. Menyajikan 3 benda pusaka utama (**Keris Jawa**, **Saron Gamelan**, dan **Wayang Kulit Purwa**) beserta 12 titik informasi anatomis dan 1 lakon wayang 4 babak (*Kijang Kencana*) yang seluruhnya merujuk pada sumber resmi.
3. Mengimplementasikan pustaka alihaksara Latin ke Aksara Jawa berbasis aturan (*rule-based transliterator*) yang diuji secara otomatis dengan unit test.

## 5. Solusi dan Pembeda Orisinalitas

Di media sosial pernah beredar eksperimen visual wayang kulit yang digerakkan tangan lewat webcam sebagai hiburan. **Kelir** tidak menyalin kode, gambar, maupun tata letak dari eksperimen tersebut, melainkan membangun platform edukasi utuh dengan perbedaan mendasar berikut:

| Dimensi | Eksperimen Wayang Tangan Hiburan | Kelir (Inovasi yang Diajukan) |
|---|---|---|
| **Tujuan Utama** | Hiburan visual di kamera | Media belajar anatomi benda pusaka dan lakon wayang untuk pelajar & mahasiswa |
| **Objek 3D & Anatomi** | Tidak ada; hanya gambar datar 2D | 3 model 3D benda pusaka dengan 12 titik informasi anatomis yang dapat diinspeksi |
| **Kejujuran Sumber** | Tanpa penjelasan dan tanpa kutipan | Setiap benda, titik info, dan babak lakon mencantumkan kode rujukan (`S1`–`S6`) yang dapat dibuka |
| **Bahasa & Aksara** | Tanpa materi bahasa daerah | Tiga mode: Indonesia, Jawa Krama (dengan label jujur status tinjauan), dan Aksara Jawa berbasis aturan |
| **Tanya Jawab AI** | Tidak ada | Asisten AI terikat konteks kurasi (Gemini API / Meta Llama API) + pencocokan lokal deterministik yang menolak mengarang di luar sumber |
| **Aksesibilitas Tanpa Kamera** | Mati total bila kamera ditolak | Seluruh fitur 100% berjalan dengan mouse, layar sentuh, maupun navigasi keyboard penuh |

## 6. Metodologi Pengembangan

Pengembangan dilakukan dengan metode iteratif terukur dalam 6 tahapan:
1. **Studi Pustaka & Kurasi Sumber:** Mengumpulkan dokumentasi resmi UNESCO (`00063`, `00112`, `01760`), *Encyclopaedia Britannica* (lakon *Ramayana: Maricha / Golden Deer*), publikasi Museum Sonobudoyo, dan standar Unicode Aksara Jawa `U+A980–U+A9DF`.
2. **Perancangan Identitas Visual (`DESIGN.md`):** Menetapkan palet kontras tinggi teruji WCAG AA (`#F3EBDC` kain kelir di atas `#18130F` ruang malam = **15.57:1**), tipografi berlisensi terbuka (*Fraunces*, *Atkinson Hyperlegible*, *Noto Sans Javanese*), serta dua tema (*Malam* dan *Siang*).
3. **Rekayasa Geometri 3D & Bayangan:** Membangun geometri 3D prosedural Keris, Saron, dan Wayang beserta pencahayaan lampu *blencong* yang menjatuhkan bayangan nyata pada bidang *kelir*.
4. **Implementasi Transliterator & Konten:** Menulis algoritma suku kata Aksara Jawa dan mengujinya terhadap kata-kata kunci budaya (`ꦲꦤꦕꦫꦏ`, `ꦏꦼꦭꦶꦂ`, `ꦏꦼꦫꦶꦱ꧀`, `ꦒꦩꦼꦭꦤ꧀`, `ꦮꦪ`).
5. **Integrasi Input Ganda (Kamera & Manual):** Menghubungkan *MediaPipe Hand Landmarker* (WASM lokal) dengan peredam gerak (*linear interpolation*) serta kendali setara untuk mouse, sentuh, dan keyboard.
6. **Pengujian Otomatis (Vitest & Playwright):** Menguji seluruh fungsi unit dan alur pengguna dari layar Pintu hingga Sumber, termasuk simulasi penolakan kamera, kegagalan jaringan AI, dan tampilan mobile `360px`.

## 7. Arsitektur Teknis Singkat

- **Antarmuka & Build:** Vite + TypeScript + Svelte 5 + CSS kustom bervariabel (tanpa framework CSS template).
- **Grafika 3D & Gerak:** Three.js (WebGL dengan *shadow map* lampu blencong) + GSAP untuk transisi layar yang menghormati `prefers-reduced-motion`.
- **Visi Komputer Lokal:** `@mediapipe/tasks-vision` (*Hand Landmarker*) dengan berkas WASM dan model yang di-host langsung di dalam aplikasi; video webcam diproses di memori browser dan **tidak pernah dikirim ke server**.
- **Layanan Tanya Jawab:** Endpoint serverless (`/api/tanya`) yang mendukung Google Gemini API dan Meta Llama API dengan pembatasan konteks ketat pada JSON kurasi, dilengkapi mesin pencari fakta lokal sehingga fitur tanya jawab tetap berfungsi 100% meskipun tanpa kunci API atau saat luring.

## 8. Daftar Pustaka Resmi

1. **UNESCO Intangible Cultural Heritage.** (2008). *Indonesian Kris* (Inscribed in 2008 on the Representative List of the Intangible Cultural Heritage of Humanity, originally proclaimed in 2005, file 00112). https://ich.unesco.org/en/RL/indonesian-kris-00112
2. **UNESCO Intangible Cultural Heritage.** (2021). *Gamelan* (Inscribed in 2021 on the Representative List of the Intangible Cultural Heritage of Humanity, file 01760). https://ich.unesco.org/en/RL/gamelan-01760
3. **UNESCO Intangible Cultural Heritage.** (2008). *Wayang puppet theatre* (Inscribed in 2008 on the Representative List of the Intangible Cultural Heritage of Humanity, originally proclaimed in 2003, file 00063). https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063
4. **Dinas Kebudayaan (Kundha Kabudayan) Daerah Istimewa Yogyakarta.** *Museum Negeri Sonobudoyo Yogyakarta*. Jl. Pangurakan No. 6, Yogyakarta. https://sonobudoyo.jogjaprov.go.id
5. **Encyclopaedia Britannica.** (2024). *Ramayana: Indian epic* (Aranya Kanda, episode Maricha and the Golden Deer). https://www.britannica.com/topic/Ramayana-Indian-epic
6. **The Unicode Consortium.** (2023). *The Unicode Standard, Version 15.1: Javanese Range U+A980–U+A9DF*. https://www.unicode.org/charts/PDF/UA980.pdf
