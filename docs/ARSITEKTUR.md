# Arsitektur Teknis Terbaru Kelir (`ꦏꦼꦭꦶꦂ`) — Edisi Multi-Halaman 3D

## 1. Arsitektur 5 Halaman Terpadu & Manajemen Konteks WebGL

Untuk menjaga keselarasan navigasi, fokus kuratorial, dan anggaran GPU 60fps pada geometri 3D berdetail tinggi, Kelir dirancang dalam **5 halaman tematik terpisah** yang disinkronkan dengan History API (`?hal=beranda|twin|koleksi|pakeliran|kawruh`). Hanya panggung WebGL milik halaman yang sedang aktif yang dimount ke DOM melalui *Svelte Action Lifecycle*:

| Halaman | ID (`?hal=`) | Kelas Panggung WebGL | Tanggung Jawab Render & Geometri Detail |
| :--- | :--- | :--- | :--- |
| **01 · Beranda & Diorama** | `beranda` | `LivingPendopoStage` | Pulau suaka budaya 3 lapis geologi, Pendopo Joglo beratap trapesium Brunjung-Penanggap & 16 tiang, Besalen Empu dengan pompa Ububan kembar & Keris melayang, Bale Karawitan (Gayor Gong, Saron, Kendang), Gazebo Wastra 2 gawangan berkibar, Panggung Kelir mini, Candi Bentar, jembatan kanal air, pohon beringin multi-kanopi, serta Dinding Ruang 3D & Etalase Horizontal |
| **02 · Digital Twin 3D** | `twin` | `DigitalTwinStage` | Studio CAD & PBR untuk 5 pusaka dengan 6–12 sub-komponen per artefak yang dapat dipisahkan via *Ledak Anatomi* (`0–100%`), mode `PBR Nyata`, `Hibrida`, dan `Kawat X-Ray CAD` (`THREE.EdgesGeometry`), dilengkapi 4 baris Keunggulan Sistem di atas grid Swiss minimalis & 3 Pilar Nilai |
| **03 · Coverflow & Suluk** | `koleksi` | CSS 3D Perspective + Modal | Korsel Coverflow melengkung 3D (`01 / 05`), Modal Suluk & Kawruh sinkron layar penuh dengan pemutar crimson, serta Indeks Tracklist bergaya album `KELIR VOL. I` |
| **04 · Panggung Wayang** | `pakeliran` | `WayangStage` | Panggung Pakeliran 3D lengkap dengan layar kain blacu berplisir merah-emas, gawangan jati berukir, gedebog pisang bertingkat dua, lampu minyak Blencong berkerucut volumetrik, barisan wayang *Simpingan* kanan-kiri, Gunungan Kayon krawangan, Sri Rama (Gelung Supit Urang, bokongan dodot polikrom, cempurit tanduk, lengan bersendi ganda, busur Gendewa), dan Kidang Kencana berkaki artikulasi ganda |
| **05 · Aksara & AI Orb** | `kawruh` | `PamomongOrbStage` | Bola metalik reflektif 3D (*Chrome-Obsidian*) dengan visor kaca gelap, sepasang ear-node bercincin `#ff5a1f`, dan cincin gyroskopik, berdampingan dengan mesin retrieval BM25 `/api/tanya` (`S1–S7`), konverter Aksara Jawa *Hanacaraka*, dan 20 kartu *Carakan* |

## 2. Alur Tanya-Jawab Terikat Sumber (`S1–S7`)

1. Klien mengirimkan `{ bendaId, pertanyaan }` ke `tanyakanKeAsisten()` di `src/lib/tanya.ts`.
2. Fungsi memanggil `POST /api/tanya` (ditangani oleh middleware Vite saat dev/preview atau `api/tanya.ts` di produksi).
3. Apabila panggilan jaringan tidak tersedia/luring, fungsi secara otomatis kembali ke `jawabDariKurasiLokal()` sehingga aplikasi selalu responsif dengan kutipan sumber `S1–S7`.

## 3. Mesin Audio Prosedural (`src/lib/audioBudaya.ts`)

Seluruh suara instrumen disintesis di browser via Web Audio API tanpa ketergantungan berkas MP3 eksternal:
- **Saron Slendro:** Harmonik logam perunggu murni pada tangga nada laras Slendro (`1, 2, 3, 5, 6, i`).
- **Gong Ageng & Suasana Pendopo:** Resonansi sub-harmonik berpeluruhan lambat + motif ketukan kendang/kenong ambien lembut.
- **Efek Benda Pusaka:** *Hunus Keris* (sapuan filter logam tajam), *Cempala Keprak* (ketukan kayu keprak dalang), *Canting Batik* (tetes malam cair), *Ketuk Kayu Jati Joglo*, dan *Lesatan Panah Rama*.
