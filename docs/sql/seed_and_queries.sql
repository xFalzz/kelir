-- Skema DML (Data Manipulation Language): Seed Data & Query Operasional Kelir

INSERT INTO sumber_rujukan (kode, judul, lembaga, tahun, url, ringkasan) VALUES
('S1', 'Indonesian Kris (Berkas 00112)', 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity', '2005 / 2008', 'https://ich.unesco.org/en/RL/indonesian-kris-00112', 'Keris Indonesia diproklamasikan UNESCO pada 2005 dan masuk Daftar Representatif pada 2008 sebagai belati asimetris berpamor yang ditempa oleh empu.'),
('S2', 'Gamelan (Berkas 01760)', 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity', '2021', 'https://ich.unesco.org/en/RL/gamelan-01760', 'Ansambel perkusi tradisional Indonesia yang ditetapkan UNESCO pada Desember 2021.'),
('S3', 'Wayang puppet theatre (Berkas 00063)', 'UNESCO Representative List of the Intangible Cultural Heritage of Humanity', '2003 / 2008', 'https://ich.unesco.org/en/RL/wayang-puppet-theatre-00063', 'Teater boneka bayangan Jawa yang dimainkan dalang di depan layar bercahaya blencong dengan iringan gamelan.'),
('S4', 'Koleksi Etnografi & Historika Museum Negeri Sonobudoyo', 'Dinas Kebudayaan (Kundha Kabudayan) DIY', '1935 / 2026', 'https://sonobudoyo.jogjaprov.go.id', 'Museum sejarah dan kebudayaan Jawa di Jl. Pangurakan No. 6 Yogyakarta yang mendokumentasikan keris, gamelan, dan wayang kulit purwa.'),
('S5', 'Ramayana (Aranya Kanda: Maricha and the Golden Deer)', 'Encyclopaedia Britannica', '2024', 'https://www.britannica.com/topic/Ramayana-Indian-epic', 'Dokumentasi episode raksasa Marica menjelma menjadi kijang emas untuk memancing Rama menjauh dari pertapaan.'),
('S6', 'The Unicode Standard: Javanese Block (U+A980-U+A9DF)', 'The Unicode Consortium', '2023', 'https://www.unicode.org/charts/PDF/UA980.pdf', 'Spesifikasi karakter Aksara Jawa (nglegena, sandhangan, pangkon).');

INSERT INTO lisensi_aset (id, nama, dipakai_di, pembuat, sumber_url, lisensi) VALUES
('G1', 'Geometri 3D Prosedural Keris Jawa', 'Ruang Pegang 3D', 'Tim Pengembang Kelir', 'src/scenes/ArtifactStage.ts', 'MIT License'),
('G2', 'Geometri 3D Prosedural Saron Gamelan', 'Ruang Pegang 3D', 'Tim Pengembang Kelir', 'src/scenes/ArtifactStage.ts', 'MIT License'),
('G3', 'Geometri 3D Prosedural Wayang Kulit & Panggung Kelir', 'Ruang Pegang 3D & Panggung Kelir', 'Tim Pengembang Kelir', 'src/scenes/WayangStage.ts', 'MIT License'),
('F1', 'Font Noto Sans Javanese', 'Render Aksara Jawa', 'Google & Monotype', 'https://fontsource.org/fonts/noto-sans-javanese', 'SIL OFL 1.1'),
('F2', 'Font Fraunces Variable & Atkinson Hyperlegible', 'Tipografi Antarmuka', 'Undercase Type & Braille Institute', 'https://fontsource.org', 'SIL OFL 1.1'),
('M1', 'MediaPipe Tasks Vision + Hand Landmarker', 'Pelacakan Tangan Lokal', 'Google', 'https://www.npmjs.com/package/@mediapipe/tasks-vision', 'Apache License 2.0');

INSERT INTO benda_pusaka (
    id, nama_id, nama_jv, ejaan_aksara_nama, status_tinjauan_jv,
    subjudul_id, subjudul_jv, kategori, tahun_unesco, berkas_unesco,
    ringkasan_id, ringkasan_jv, peran_panggung, lisensi_ref
) VALUES
('keris', 'Keris Jawa', 'Dhuwung Jawi (Keris)', 'dhuwung jawi', 'draf',
 'Belati asimetris berpamor dan bersarung kayu', 'Pusaka wilah asimetris mawi pamor lan warangka kajeng',
 'Tosan Aji / Senjata Pusaka', '2005 / 2008', '00112',
 'Keris adalah belati asimetris khas Nusantara yang tercatat di UNESCO sejak 2005/2008, terdiri atas wilah bersama ganja, hulu/deder, dan warangka kayu.',
 'Dhuwung utawi keris punika pusaka khas Nusantara ingkang kaserat dening UNESCO wiwit warsa 2005 lan 2008.',
 'Kelengkapan busana adat Jawa dan pusaka tokoh satria di dalam pertunjukan wayang.', 'G1'),
('saron', 'Saron Gamelan', 'Saron Gamelan Jawi', 'saron gamelan jawi', 'draf',
 'Instrumen bilah perunggu pembawa kerangka melodi (balungan)', 'Ricikan wilah gangsa pamomot lagu balungan gendhing',
 'Karawitan / Ansambel Gamelan', '2021', '01760',
 'Gamelan ditetapkan UNESCO pada Desember 2021. Saron termasuk kelompok ricikan bilah logam yang memainkan kerangka lagu (balungan).',
 'Gamelan katetepaken dening UNESCO ing wulan Desember 2021. Saron kalebet ricikan wilah gangsa ingkang nabuh balungan gendhing.',
 'Penjaga kerangka melodi gendhing yang mengatur suasana pertunjukan wayang.', 'G2'),
('wayang', 'Wayang Kulit Purwa', 'Ringgit Purwa (Wayang Kulit)', 'ringgit purwa wayang kulit', 'draf',
 'Boneka kulit berukir (tatahan) yang memproyeksikan bayangan di kelir', 'Ringgit cucal mawi tatahan ingkang ngasilaken ayang-ayang ing kelir',
 'Seni Pertunjukan / Teater Bayangan', '2003 / 2008', '00063',
 'Wayang kulit diproklamasikan UNESCO pada 2003 dan masuk Daftar Representatif pada 2008, digerakkan dalang memakai cempurit dan tuding di depan kelir.',
 'Ringgit kulit katetepaken dening UNESCO wiwit warsa 2003 lan 2008, dipunobahaken dening dhalang mawi cempurit lan tuding.',
 'Pemeran utama di layar kelir yang menghidupkan lakon Ramayana dan Mahabharata.', 'G3');

INSERT INTO benda_sumber (benda_id, sumber_kode) VALUES
('keris', 'S1'), ('keris', 'S4'),
('saron', 'S2'), ('saron', 'S4'),
('wayang', 'S3'), ('wayang', 'S4');

INSERT INTO titik_info_benda (
    id, benda_id, urutan, label_id, label_jv, ejaan_aksara_label,
    pos_x, pos_y, pos_z, cam_x, cam_y, cam_z,
    uraian_id, uraian_jv, ejaan_aksara_uraian, status_tinjauan_jv
) VALUES
('wilah', 'keris', 1, 'Wilah (Bilah Utama)', 'Wilah (Awak Dhuwung)', 'wilah dhuwung',
 0.0, 0.55, 0.04, 0.0, 0.5, 0.0,
 'Wilah adalah badan utama keris yang ditempa dari campuran besi, baja, dan bahan pamor.',
 'Wilah punika perangan utama dhuwung ingkang katempa saking campuran wesi, waja, lan pamor.',
 'wilah punika perangan utama dhuwung saking wesi lan pamor.', 'draf'),
('ganja', 'keris', 2, 'Ganja (Pangkal Melintang)', 'Ganja (Dasar Wilah)', 'ganja wilah',
 0.18, -0.22, 0.05, 0.0, -0.2, 0.0,
 'Ganja terletak melintang di pangkal bawah bilah sehingga membuat pangkal keris tampak melebar dan asimetris.',
 'Ganja mapan malang wonten ing sangandhapipun wilah.',
 'ganja mapan malang ing ngisor wilah.', 'draf'),
('pamor', 'keris', 3, 'Pamor (Alur Logam Tempa)', 'Pamor (Corak Logam)', 'pamor logam',
 -0.04, 0.18, 0.05, 0.0, 0.18, 0.0,
 'Pamor adalah guratan keperakan pada permukaan bilah yang muncul dari teknik tempa lipat logam berbeda jenis oleh empu.',
 'Pamor inggih punika serat pethak ing lumahing wilah saking tempa lipat logam dening empu.',
 'pamor medal saking tempa lipat logam dening empu.', 'draf'),
('warangka', 'keris', 4, 'Hulu & Warangka (Gagang dan Sarung)', 'Deder lan Warangka', 'deder lan warangka',
 -0.32, -0.58, 0.06, -0.15, -0.55, 0.0,
 'Hulu (deder) adalah pegangan berukir kayu, sedangkan warangka adalah sarung pelindung bilah.',
 'Deder punika cepengan dhuwung ingkang kaukir, dene warangka punika wadah kajeng kangge nyimpen wilah.',
 'deder lan warangka kajeng kangge nyimpen wilah.', 'draf'),
('wilah-saron', 'saron', 1, 'Wilah Gangsa (Bilah Perunggu)', 'Wilah Gangsa', 'wilah gangsa',
 0.0, 0.22, 0.05, 0.0, 0.15, 0.0,
 'Deretan tujuh bilah logam tempa yang ditala menurut laras slendro atau pelog.',
 'Jajaran pitung wilah logam tempa ingkang dipunlaras miturut laras slendro utawi pelog.',
 'pitung wilah gangsa laras slendro utawi pelog.', 'draf'),
('rancakan', 'saron', 2, 'Rancakan (Kotak Resonator Kayu)', 'Rancakan Kajeng', 'rancakan kajeng',
 0.0, -0.18, 0.22, 0.0, -0.15, 0.0,
 'Wadah kayu berongga di bawah bilah yang berfungsi sebagai ruang gema suara.',
 'Wadah kajeng ing sangandhapipun wilah ingkang dados papan kumandhanging swanten.',
 'wadhah kajeng papan kumandhanging swanten.', 'draf'),
('tabuh', 'saron', 3, 'Tabuh (Pemukul Kayu)', 'Tabuh Saron', 'tabuh saron',
 0.55, 0.42, 0.25, 0.4, 0.35, 0.15,
 'Pemukul kayu miring yang dipegang tangan kanan sementara tangan kiri melakukan pathetan.',
 'Piranti panabuh saking kajeng ingkang kacepeng asta tengen.',
 'tabuh kajeng kacepeng asta tengen.', 'draf'),
('pencon-paku', 'saron', 4, 'Paku & Bantalan Penyangga', 'Paku lan Bantalan', 'paku lan bantalan',
 -0.48, 0.24, 0.12, -0.4, 0.2, 0.0,
 'Pasak logam kecil dan bantalan lunak di tepi rancakan yang menahan posisi tiap bilah.',
 'Pasak alit lan bantalan ing pinggir rancakan kangge njagi posisi wilah.',
 'pasak alit njagi posisi wilah.', 'draf'),
('awak-tatahan', 'wayang', 1, 'Awak Wayang (Tatahan & Sunggingan)', 'Awak Ringgit (Tatahan)', 'awak ringgit tatahan',
 0.0, 0.35, 0.03, 0.0, 0.35, 0.0,
 'Lembaran kulit yang dipahat berlubang halus (tatahan) dan diwarnai (sunggingan).',
 'Lembaran cucal ingkang dipuntatah alus lan dipunsungging.',
 'lembaran cucal dipuntatah alus lan dipunsungging.', 'draf'),
('cempurit', 'wayang', 2, 'Cempurit / Gapit (Tangkai Utama)', 'Cempurit utawi Gapit', 'cempurit utawi gapit',
 0.0, -0.45, 0.04, 0.0, -0.4, 0.0,
 'Tangkai penyangga tegak dari tanduk atau kayu yang menjepit badan wayang.',
 'Cepengan utama ingkang njepit awak ringgit saking nginggil dumugi ngandhap.',
 'cepengan utama ingkang njepit awak ringgit.', 'draf'),
('tuding', 'wayang', 3, 'Tuding (Tangkai Penggerak Tangan)', 'Tuding Asta Ringgit', 'tuding asta ringgit',
 0.38, -0.1, 0.05, 0.3, 0.0, 0.0,
 'Dua bilah tangkai ramping yang terhubung dengan sendi bahu dan siku wayang.',
 'Tangkai alit ingkang nggayutaken sendi asta ringgit.',
 'tangkai alit kangge ngobahaken asta ringgit.', 'draf'),
('kelir-blencong', 'wayang', 4, 'Kelir & Sorot Blencong', 'Kelir lan Sorot Blencong', 'kelir lan sorot blencong',
 -0.35, 0.25, -0.18, 0.0, 0.2, -0.15,
 'Kelir adalah bentangan kain putih tempat bayangan jatuh, sedangkan blencong adalah lampu penyinar.',
 'Kelir punika kain pethak papan tibaning ayang-ayang, dene blencong punika lampu panyorot.',
 'kelir punika kain papan tibaning ayang.', 'draf');

INSERT INTO titik_sumber (titik_id, sumber_kode) VALUES
('wilah', 'S1'), ('wilah', 'S4'),
('ganja', 'S1'), ('ganja', 'S4'),
('pamor', 'S1'),
('warangka', 'S1'), ('warangka', 'S4'),
('wilah-saron', 'S2'), ('wilah-saron', 'S4'),
('rancakan', 'S2'), ('rancakan', 'S4'),
('tabuh', 'S2'),
('pencon-paku', 'S2'), ('pencon-paku', 'S4'),
('awak-tatahan', 'S3'), ('awak-tatahan', 'S4'),
('cempurit', 'S3'),
('tuding', 'S3'),
('kelir-blencong', 'S3'), ('kelir-blencong', 'S4');

INSERT INTO lakon_wayang (
    id, judul_id, judul_jv, ejaan_aksara_judul, subjudul_id, epos_asal, tokoh_kanan, tokoh_kiri
) VALUES (
    'kijang-kencana', 'Lakon Kijang Kencana', 'Lampahan Kidang Kencana', 'lampahan kidang kencana',
    'Episode Ramayana (Aranya Kanda): Tipu daya Marica di Hutan Dandaka',
    'Ramayana (Valmiki / Repertoar Wayang Kulit Purwa Jawa)',
    'Sri Rama (Satria Panah)', 'Kidang Kencana (Penjelmaan Marica)'
);

INSERT INTO babak_lakon (
    lakon_id, nomor, judul_id, judul_jv, ejaan_aksara_judul,
    narasi_id, narasi_jv, ejaan_aksara_narasi, petunjuk_dalang,
    posisi_awal_rama, posisi_awal_kidang
) VALUES
('kijang-kencana', 1, 'Babak 1: Pengasingan di Hutan Dandaka', 'Babak 1: Mesanggrah ing Wana Dandaka', 'babak siji wana dandaka',
 'Rama, Dewi Sinta, dan Laksmana hidup di pertapaan hutan Dandaka sementara Rahwana menyusun siasat bersama Marica.',
 'Sri Rama, Dewi Sinta, lan Laksmana mesanggrah wonten ing Wana Dandaka.',
 'sri rama lan dewi sinta ing wana dandaka.',
 'Gerakkan tangan kanan atau slider kanan untuk menegakkan figur Sri Rama.', 0.48, -0.62),
('kijang-kencana', 2, 'Babak 2: Kemilau Kijang Emas', 'Babak 2: Gebyaring Kidang Kencana', 'babak loro kidang kencana',
 'Marica menjelma menjadi kijang emas berbintik perak di dekat pertapaan hingga memikat hati Sinta.',
 'Marica malih rupa dados kidang kencana ingkang mlumpat ing sakiwa tengenipun pertapan.',
 'marica malih rupa dados kidang kencana.',
 'Gerakkan tangan kiri atau slider kiri untuk membawa Kidang Kencana mendekat.', 0.35, -0.18),
('kijang-kencana', 3, 'Babak 3: Pengejaran dan Suara Palsu', 'Babak 3: Pambujengan lan Swanten Palsu', 'babak telu swanten palsu',
 'Rama mengejar kijang emas ke dalam hutan; saat terpanah, Marica berteriak menirukan suara Rama.',
 'Rama mbujeng kidang mlebet wana lan Marica mbengok nirokaken swantenipun Rama.',
 'rama mbujeng kidang lan nglepas jemparing.',
 'Pertemukan gerak tangan kanan dan kiri di tengah kelir.', 0.12, -0.12),
('kijang-kencana', 4, 'Babak 4: Pesan tentang Kewaspadaan', 'Babak 4: Piwulang babagan Kawaspadan', 'babak papat piwulang kawaspadan',
 'Teriakan palsu membuat Sinta mendesak Laksmana menyusul Rama; lakon ini mengajarkan kewaspadaan.',
 'Lampahan punika paring piwulang supados manungsa tansah waspada.',
 'lampahan punika paring piwulang supados tansah waspada.',
 'Jauhkan kedua wayang ke tepi kelir untuk menutup adegan.', 0.55, -0.55);

INSERT INTO babak_sumber (lakon_id, nomor_babak, sumber_kode) VALUES
('kijang-kencana', 1, 'S5'),
('kijang-kencana', 2, 'S5'),
('kijang-kencana', 3, 'S5'),
('kijang-kencana', 4, 'S3'),
('kijang-kencana', 4, 'S5');
