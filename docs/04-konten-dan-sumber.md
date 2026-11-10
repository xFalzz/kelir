# 04. Konten dan sumber

Prinsip: setiap fakta budaya pada aplikasi mengutip sumber yang tercatat dan dapat diperiksa. Teks Bahasa Jawa berstatus `draf` dengan catatan jujur bahwa peninjauan penutur ahli masih dijadwalkan, sedangkan Aksara Jawa dihasilkan secara deterministik oleh transliterator berbasis aturan (`src/lib/aksara.ts`).

## Benda Pusaka Terpilih (3 Benda)

| ID | Nama Benda | Bagian (Titik Info) | Sumber Rujukan | Aset 3D |
|---|---|---|---|---|
| `keris` | Keris Jawa (*Wilah Lurus & Warangka Gayaman*) | 1. *Wilah* (Bilah)<br>2. *Ganja* (Gonjo)<br>3. *Pamor*<br>4. *Hulu* (Deder) & *Warangka* | S1 (UNESCO, 2008), S4 (Museum Sonobudoyo) | G1: Geometri prosedural Three.js buatan sendiri |
| `saron` | Saron Gamelan (*Ricikan Balungan*) | 1. *Wilah* Perunggu<br>2. *Rancakan* (Wadah Kayu)<br>3. *Tabuh* (Pemukul)<br>4. *Paku Pencon / Bantalan* | S2 (UNESCO, 2021), S4 (Museum Sonobudoyo) | G2: Geometri prosedural Three.js buatan sendiri |
| `wayang` | Wayang Kulit Purwa (*Cempurit & Tatahan*) | 1. *Awak Wayang* (Tatahan & Sunggingan)<br>2. *Gapit / Cempurit* (Tangkai Utama Tanduk)<br>3. *Tuding* (Tangkai Tangan)<br>4. *Kelir & Blencong* (Layar dan Cahaya) | S3 (UNESCO, 2008), S4 (Museum Sonobudoyo) | G3: Geometri prosedural Three.js buatan sendiri |

## Legenda Panggung Kelir (1 Lakon, 4 Babak)

**Lakon:** *Kijang Kencana* (Episode Ramayana: tipu daya Marica sebagai kijang emas di hutan Dandaka).
**Sumber:** S5 (*Encyclopaedia Britannica*, entri Ramayana oleh Devdutt Pattanaik / ringkasan epos Valmiki) dan S3 (UNESCO Wayang Puppet Theatre tentang repertoar Ramayana di Jawa).

| Babak | Judul | Ringkasan | Tokoh di Kelir |
|---|---|---|---|
| 1 | Hutan Dandaka | Rama, Sinta, dan Laksmana menjalani pengasingan di hutan Dandaka. Rahwana menyusun siasat bersama raksasa Marica untuk memisahkan Rama dari Sinta. | Rama (kanan), Kidang Kencana / Marica (kiri) |
| 2 | Kemilau Kijang Emas | Marica berubah wujud menjadi kijang emas (*Kijang Kencana*) berkilau perak dan berlari di dekat pertapaan hingga memikat hati Sinta. Laksmana mengingatkan bahwa wujud indah itu bisa jadi tipuan. | Rama (kanan), Kidang Kencana (kiri) |
| 3 | Pengejaran dan Suara Palsu | Rama mengejar kijang jauh ke dalam hutan. Saat terkena panah Rama, Marica kembali ke wujud aslinya dan berteriak menirukan suara Rama meminta tolong kepada Sinta dan Laksmana. | Rama (kanan), Kidang Kencana (kiri) |
| 4 | Pelajaran tentang Kewaspadaan | Teriakan palsu itu membuat Sinta cemas dan mendesak Laksmana menyusul Rama, sehingga Sinta tertinggal seorang diri. Dalam tradisi wayang Jawa, lakon ini mengajarkan kewaspadaan agar tidak mudah silau oleh tampilan luar. | Rama (kanan), Kidang Kencana (kiri) |

## Daftar Sumber Terverifikasi

| Kode | Judul & Lembaga | Tahun | Tautan Resmi |
|---|---|---|---|
| **S1** | *Indonesian Kris*, Representative List of the Intangible Cultural Heritage of Humanity, UNESCO (awalnya diproklamasikan 2005, terdaftar 2008, nomor berkas 00112). | 2008 | https://ich.unesco.org/en/RL/indonesian-kris-00112 |
| **S2** | *Gamelan*, Representative List of the Intangible Cultural Heritage of Humanity, UNESCO (terdaftar Desember 2021 pada sidang ke-16 Komite Antarpemerintah, nomor berkas 01760). | 2021 | https://ich.unesco.org/en/RL/gamelan-01760 |
| **S3** | *Wayang puppet theatre*, Representative List of the Intangible Cultural Heritage of Humanity, UNESCO (awalnya diproklamasikan 2003, terdaftar 2008, nomor berkas 00063). | 2008 | https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063 |
| **S4** | *Museum Negeri Sonobudoyo*, Dinas Kebudayaan (*Kundha Kabudayan*) Daerah Istimewa Yogyakarta, koleksi keris, wayang kulit purwa, dan perangkat gamelan Jawa (diresmikan 6 November 1935, Jl. Pangurakan No. 6 Yogyakarta). | 1935 / 2026 | https://sonobudoyo.jogjaprov.go.id |
| **S5** | *Ramayana* (khususnya episode *Aranya Kanda*: Maricha sebagai kijang emas di Panchavati/Dandaka, Rama, Sita, dan Lakshmana), *Encyclopaedia Britannica*. | 2024 | https://www.britannica.com/topic/Ramayana-Indian-epic |
| **S6** | *The Unicode Standard, Javanese Block (U+A980–U+A9DF)*, Unicode Consortium, sebagai rujukan pengodean karakter Aksara Jawa (nglegena, pasangan, sandhangan, pangkon). | 2023 | https://www.unicode.org/charts/PDF/UA980.pdf |
