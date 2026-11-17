import type { MultiTeks } from './pusaka.ts';

export interface EntriBudayaNusantara {
  id: string;
  wilayah: MultiTeks;
  judul: MultiTeks;
  kataKunci: string[];
  intiSejarah: MultiTeks;
  unsurTeknis: MultiTeks;
  maknaFilosofis: MultiTeks;
}

export const ENSIKLOPEDIA_NUSANTARA: EntriBudayaNusantara[] = [
  {
    id: 'idn-saman',
    wilayah: {
      id: 'Gayo, Aceh',
      en: 'Gayo Highlands, Aceh',
      jw: 'Gayo, Aceh',
    },
    judul: {
      id: 'Tari Saman Gayo & Etika Kekompakan Aceh',
      en: 'Acehnese Saman Dance & Synchronized Ethos',
      jw: 'Beksan Saman Gayo lan Etika Guyub Aceh',
    },
    kataKunci: ['saman', 'aceh', 'gayo', 'syekh', 'syech', 'tepuk', 'seudati', 'rencong', 'peusijuek'],
    intiSejarah: {
      id: 'Tari Saman berkembang di dataran tinggi Gayo, Aceh (berakar dari kesenian Pok Ane yang dikembangkan ulama Syekh Saman sebagai media dakwah dan silaturahmi). Warisan seni pertunjukan ini telah diakui UNESCO dalam Daftar Pelestarian Mendesak Warisan Budaya Takbenda pada 2011.',
      en: 'Tari Saman originated in the Gayo highlands of Aceh, evolved from traditional Pok Ane by Syekh Saman as a medium of spiritual instruction and communal fellowship. UNESCO inscribed Saman on the Intangible Cultural Heritage Urgent Safeguarding List in 2011.',
      jw: 'Beksan Saman ngrembaka ing tlatah Gayo, Aceh minangka media piwulang luhur saha paseduluran dening Syekh Saman, lan kaparingan pangakuan UNESCO ing taun 2011.',
    },
    unsurTeknis: {
      id: 'Pertunjukan dimainkan secara duduk berbanjar rapat dalam jumlah penari ganjil (dipimpin seorang Syech atau pengangkat syair) tanpa iringan alat musik. Dinamika ritme lahir sepenuhnya dari vokal syair berbahasa Gayo-Arab serta tepukan tangan, dada, dan paha yang bertempo konstan hingga klimaks cepat.',
      en: 'Performed kneeling in a tight odd-numbered row led by a central vocalist-conductor (Syech) without instrumental accompaniment. Complex polyrhythms arise strictly from synchronized hand claps, chest slaps, thigh strikes, and Gayo vocal poetry accelerating seamlessly to a brisk climax.',
      jw: 'Kagunan punika katindakake kanthi lenggah jejer cacah ganjil tanpa piranti musik, dipunpimpin dening Syech mawi wirama tepuk asta, dhadha, saha tembang Gayo ingkang kompak.',
    },
    maknaFilosofis: {
      id: 'Gerakan berhimpitan tanpa menabrak satu sama lain melambangkan ketelitian, persaudaraan (ukhuwah), kedisiplinan kolektif, sopan santun, serta kearifan menjaga keselarasan alam Gayo.',
      en: 'Interlocking shoulder-to-shoulder choreography symbolizes mutual trust, collective discipline, spiritual devotion, and harmonious coexistence within Gayo society.',
      jw: 'Solah raga jejer ingkang presisi tanpa tubrukan nglambangaken paseduluran, disiplin bebrayan, unggah-ungguh, saha kaselarasan manungsa kalih Gusti lan alam.',
    },
  },
  {
    idn: 'minang',
    id: 'idn-rumah-gadang',
    wilayah: {
      id: 'Minangkabau, Sumatera Barat',
      en: 'Minangkabau, West Sumatra',
      jw: 'Minangkabau, Sumatera Kilèn',
    },
    judul: {
      id: 'Rumah Gadang, Atap Gonjong & Falsafah Minangkabau',
      en: 'Rumah Gadang Architecture & Minangkabau Philosophy',
      jw: 'Griya Gadang, Payon Gonjong lan Falsafah Minangkabau',
    },
    kataKunci: ['gadang', 'gonjong', 'minang', 'minangkabau', 'padang', 'randai', 'piring', 'rangkiang', 'matrilineal', 'tabuik', 'rendang', 'saluang', 'talempong'],
    intiSejarah: {
      id: 'Rumah Gadang adalah rumah adat kaum matrilineal Minangkabau di Sumatera Barat yang berperan sebagai kediaman keluarga besar sekaligus pusat musyawarah adat. Di halaman depannya lazim berdiri Rangkiang (lumbung penyimpan padi komunal) beserta sistem penataan ruang berbasis adat basandi syarak.',
      en: 'Rumah Gadang serves as the ancestral communal home and council hall for matrilineal Minangkabau clans in West Sumatra, traditionally paired in the courtyard with carved Rangkiang rice granaries.',
      jw: 'Griya Gadang minangka papan panggenan kulawarga ageng matrilineal Minangkabau saha pusat musyawarah adat ingkang dipun-lengkapi lumbung pantun Rangkiang.',
    },
    unsurTeknis: {
      id: 'Ciri utamanya ialah atap lengkung runcing menjulang (gonjong) serta badan bangunan meruncing menyerupai perahu. Secara rekayasa struktural tahan gempa (di sepanjang patahan Sumatra), tiang utamanya tidak ditanam ke tanah melainkan ditumpangkan di atas batu sandi pipih agar bangunan dapat bergeser lentur tanpa patah, dirakit menggunakan pasak kayu tanpa paku besi dan dihiasi ukiran papan seperti aka cino serta itiak pulang patang.',
      en: 'Distinguished by sweeping horned roofs (gonjong) and a boat-like hull profile, its timber posts rest freely atop flat river stones (batu sandi) rather than rigid soil footings, allowing controlled seismic slip without snapping wooden peg-and-mortise joints.',
      jw: 'Payonipun mlengkung lancip (gonjong) kanthi saka kayu ingkang boten dipuntandur ing siti, nanging dipunsangga sela pipih (batu sandi) supados lentur nahan getaran lindhu tanpa paku wesi.',
    },
    maknaFilosofis: {
      id: 'Falsafah Alam Takambang Jadi Guru mengajarkan masyarakat belajar dari keseimbangan alam, sementara pembagian bilik-bilik mencerminkan ketertiban hidup bersama, penghormatan pada Bundo Kanduang, dan kesiapan menghadapi bencana dengan kearifan ruang.',
      en: 'Guided by the maxim Alam Takambang Jadi Guru (Nature Unfolded as Teacher), its layout honors maternal lineage custodianship (Bundo Kanduang), communal deliberation, and resilience harmonized with topography.',
      jw: 'Sesanti Alam Takambang Jadi Guru paring piwulang supados manungsa sinau saking alam, ngurmati Bundo Kanduang, lan ngutamakaken musyawarah bebrayan.',
    },
  } as EntriBudayaNusantara & { idn?: string },
  {
    id: 'idn-batak-nias',
    wilayah: {
      id: 'Batak & Kepulauan Nias, Sumatera Utara',
      en: 'Batak Highlands & Nias Island, North Sumatra',
      jw: 'Tlatah Batak lan Pulo Nias, Sumatera Lor',
    },
    judul: {
      id: 'Ulos, Dalihan Na Tolu, Omo Sebua & Lompat Batu Fahombo',
      en: 'Batak Ulos, Dalihan Na Tolu, Nias Omo Sebua & Fahombo',
      jw: 'Ulos Batak, Dalihan Na Tolu, Omo Sebua lan Fahombo Nias',
    },
    kataKunci: ['batak', 'ulos', 'dalihan', 'toba', 'karo', 'gondang', 'tortor', 'tor-tor', 'bolon', 'nias', 'fahombo', 'hombo', 'omo', 'lompat batu'],
    intiSejarah: {
      id: 'Di dataran tinggi Danau Toba, masyarakat Batak menjaga tata sosial berbasis kekerabatan tiga tungku (Dalihan Na Tolu), kain sakral Ulos, dan tari Tortor beriringan Gondang Sabangunan. Sementara di Kepulauan Nias bagian selatan, tradisi megalitik masih hidup melalui rumah adat Omo Sebua serta ritus Lompat Batu (Fahombo).',
      en: 'Around Lake Toba, Batak society centers on the three-pillared Dalihan Na Tolu kinship system, sacred handwoven Ulos textiles, and Tortor dances with Gondang music. On Nias Island, monumental megalithic culture endures in Bawömataluo through Omo Sebua timber engineering and the Fahombo stone-leaping rite.',
      jw: 'Ing tlatah Batak ngrembaka tata sosial Dalihan Na Tolu, wastra suci Ulos, lan beksan Tortor; dene ing Pulo Nias wonten griya kayu Omo Sebua tahan lindhu saha tradisi megalitik Fahombo.',
    },
    unsurTeknis: {
      id: 'Ulos ditenun dengan alat gedogan berpola rumit (seperti Ulos Ragidup dan Sibolang) dari benang kapas pewarna alami. Di Nias, Omo Sebua menggunakan balok-balok kayu besi berposisi silang V (ehomo dan diwa) saling kunci tanpa paku untuk meredam guncangan tektonik, sedangkan monumen batu Hombo setinggi sekitar 2 meter dilompati pemuda tanpa menyentuh batu.',
      en: 'Ulos cloths such as Ragidup are loom-woven with intricate symbolic motifs, while Nias Omo Sebua houses rely on crisscrossed diagonal timber bracing (ehomo and diwa) mounted on stone plinths for extraordinary seismic stability alongside the ~2-meter stone Fahombo plinth.',
      jw: 'Ulos katenun kanthi motif suci ing gedogan; dene Omo Sebua Nias migunakaken balok kayu silang diagonal tanpa paku kangge nahan lindhu sarta watu Hombo sainggil ~2 meter.',
    },
    maknaFilosofis: {
      id: 'Dalihan Na Tolu menegaskan etika somba marhula-hula (hormat pada pemberi istri), elek marboru, dan manat mardongan tubu; upacara mangulosi melambangkan selimut restu kasih sayang, sedangkan Fahombo menandai kedewasaan, keberanian, serta kesiapan menjaga kampung.',
      en: 'Dalihan Na Tolu encodes balanced kinship ethics, mangulosi bestows spiritual warmth and blessing, and Fahombo marks civic maturity, courage, and communal solidarity.',
      jw: 'Dalihan Na Tolu mulangake unggah-ungguh kekerabatan, mangulosi paring berkah katresnan, lan Fahombo nedahaken kedewasaan sarta kekendelan pemuda.',
    },
  },
  {
    id: 'idn-palembang-lampung',
    wilayah: {
      id: 'Sumatera Selatan, Lampung, Jambi & Melayu',
      en: 'South Sumatra, Lampung, Jambi & Malay Coast',
      jw: 'Sumatera Kidul, Lampung, Jambi lan Melayu',
    },
    judul: {
      id: 'Songket, Tapis Lampung, Sriwijaya & Muaro Jambi',
      en: 'Palembang Songket, Lampung Tapis, Srivijaya & Muaro Jambi',
      jw: 'Songket Palembang, Tapis Lampung, Sriwijaya lan Muaro Jambi',
    },
    kataKunci: ['songket', 'palembang', 'limas', 'tapis', 'lampung', 'melayu', 'riau', 'zapin', 'pantun', 'gurindam', 'jambi', 'muaro jambi', 'sriwijaya', 'pacu jalur', 'pempek'],
    intiSejarah: {
      id: 'Pesisir timur Sumatra mewarisi kejayaan kemaritiman dan pusat pembelajaran Buddha Sriwijaya (berjejak kuat di kompleks Candi Muaro Jambi) serta tradisi sastra Melayu seperti Pantun (UNESCO ICH 2020) dan Gurindam Dua Belas karya Raja Ali Haji.',
      en: 'Eastern Sumatra preserves the maritime legacy of Srivijaya, the vast brick temple sanctuary of Muaro Jambi, and Malay literary heritage including Pantun (UNESCO ICH 2020) alongside Songket and Tapis textile arts.',
      jw: 'Pesisir wetan Sumatera njagi warisan maritim Sriwijaya, kompleks Candi Muaro Jambi, tradisi sastra Pantun Melayu, saha kriya wastra Songket lan Tapis.',
    },
    unsurTeknis: {
      id: 'Songket dihasilkan lewat teknik pakan tambahan benang emas atau perak yang disungkit (diangkat) satu per satu pada kain tenun sutra/katun, menghasilkan motif seperti Lepus dan Bungo Pacik. Kain Tapis Lampung memadukan tenun ikat kapas bergaris dengan sulaman benang emas teknik cucuk.',
      en: 'Songket weaving lifts warp threads using a bamboo rod to inlay supplementary gold or silver metallic wefts into silk, while Lampung Tapis combines striped handwoven cotton with intricate gold-thread couching.',
      jw: 'Songket katenun mawi teknik nyungkit benang emas ing kain sutra; dene Tapis Lampung nyawijekake tenun kapas kalih sulaman benang emas.',
    },
    maknaFilosofis: {
      id: 'Ketinggian martabat dan kesantunan tercermin dalam etos Piil Pesenggiri masyarakat Lampung (mulai dari keterbukaan menerima tamu nemui nyimah hingga keadilan bermasyarakat), serta kebijaksanaan bertutur halus lewat rima sampiran dan isi dalam Pantun Melayu.',
      en: 'Cultural dignity thrives through Lampung’s Piil Pesenggiri ethos of hospitality and honor, and Malay Pantun’s art of indirect, graceful moral counsel.',
      jw: 'Nilai luhur Piil Pesenggiri ing Lampung mulangake tepa salira lan tata krama tumrap tamu, saha Pantun Melayu dados sarana pitutur alus.',
    },
  },
  {
    id: 'idn-sunda-baduy-betawi',
    wilayah: {
      id: 'Jawa Barat, Banten & Jakarta (Sunda, Cirebon, Baduy, Betawi)',
      en: 'West Java, Banten & Jakarta (Sundanese, Cirebon, Baduy, Betawi)',
      jw: 'Jawa Kilèn, Banten lan Jakarta (Sunda, Cirebon, Baduy, Betawi)',
    },
    judul: {
      id: 'Angklung, Kujang, Kearifan Baduy & Akulturasi Betawi',
      en: 'Sundanese Angklung, Kujang, Baduy Ecology & Betawi Heritage',
      jw: 'Angklung, Kujang, Kearifan Baduy lan Budaya Betawi',
    },
    kataKunci: ['sunda', 'angklung', 'kujang', 'kecapi', 'suling', 'jaipong', 'degung', 'calung', 'seren taun', 'baduy', 'banten', 'debus', 'betawi', 'ondel', 'cirebon', 'mega mendung', 'wayang golek'],
    intiSejarah: {
      id: 'Budaya Sunda dan pesisir utara barat Jawa membentang dari instrumen bambu Angklung (diakui UNESCO 2010, dikembangkan modernitas tangga nada diatonisnya oleh Daeng Soetigna), Wayang Golek, motif batik Mega Mendung Cirebon berpengaruh pesisir, hingga tradisi ekologis Masyarakat Adat Baduy di Lebak, Banten serta budaya Betawi di pesisir Jakarta.',
      en: 'West Java and Banten nurture Sundanese Angklung bamboo music (UNESCO ICH 2010), Wayang Golek wooden rod puppetry, coastal Cirebon Mega Mendung batik, Baduy ecological stewardship, and multicultural Betawi heritage such as Ondel-ondel and Gambang Kromong.',
      jw: 'Tlatah Jawa Kilèn lan Banten nyimpen kesenian Angklung (UNESCO 2010), Wayang Golek, batik Mega Mendung Cirebon, tata adat ekologis Baduy, saha akulturasi Betawi.',
    },
    unsurTeknis: {
      id: 'Angklung terbuat dari dua hingga empat tabung bambu hitam (awi wulung) berdiameter bertingkat dalam bingkai bambu yang berbunyi hanya jika digoyangkan bersama-sama oleh kelompok pemain; setiap instrumen menghasilkan satu nada spesifik sehingga menuntut harmoni kolektif.',
      en: 'Each Angklung mounts hand-carved black bamboo tubes pitched to a single tone within a sliding frame, making communal coordination essential because one player holds only part of a chord or scale.',
      jw: 'Angklung kadamel saking tabung pring wulung ingkang namung ngasilaken satunggal laras nada saben alat, saengga kudu dipun-goyang sesarengan kanthi kompak.',
    },
    maknaFilosofis: {
      id: 'Masyarakat Sunda dan Baduy memelihara prinsip Silih Asah, Silih Asih, Silih Asuh serta larangan adat merusak kontur gunung maupun sumber air, sementara kesenian Betawi mengekspresikan keterbukaan akulturasi Nusantara–Melayu–Tionghoa–Arab dalam semangat gotong royong.',
      en: 'Guided by Silih Asah, Silih Asih, Silih Asuh (mutual learning, care, and guidance) and Baduy stewardship preserving untouched forests, these traditions turn ecology and diversity into everyday ethics.',
      jw: 'Piwulang Silih Asah, Silih Asih, Silih Asuh lan pitutur karuhun Baduy njagi kalestarian wana lan toya, dene Betawi nuduhake paseduluran lintas etnis.',
    },
  },
  {
    id: 'idn-bali-subak',
    wilayah: {
      id: 'Bali',
      en: 'Bali',
      jw: 'Pulo Bali',
    },
    judul: {
      id: 'Subak, Tri Hita Karana, Tari Kecak & Nyepi–Ogoh-ogoh',
      en: 'Balinese Subak Irrigation, Kecak Dance & Nyepi–Ogoh-ogoh',
      jw: 'Sistem Subak, Tri Hita Karana, Beksan Kecak lan Nyepi Bali',
    },
    kataKunci: ['bali', 'subak', 'kecak', 'pendet', 'barong', 'legong', 'nyepi', 'ogoh', 'ogoh-ogoh', 'ngaben', 'galungan', 'kuningan', 'tri hita', 'gringsing', 'endek', 'gamelan bali', 'trunyan'],
    intiSejarah: {
      id: 'Sejak abad ke-9, petani Bali mengelola irigasi sawah terasering melalui kelembagaan adat Subak dan Pura Air (diakui sebagai Warisan Dunia UNESCO pada 2012). Di ranah seni pertunjukan, Tari Kecak dan beragam tari sakral-bebali berkembang dari ritual Sanghyang berpadu dramatari Ramayana.',
      en: 'Dating back to the 9th century, Bali’s Subak cooperative water-temple irrigation networks (UNESCO World Heritage 2012) sustain terraced agriculture alongside classical arts such as Kecak, Pendet, Barong, and double-ikat Geringsing weaving in Tenganan.',
      jw: 'Wiwit abad kaping-9, warga Bali ngelola toya sabin kanthi sistem Subak (Warisan Dunia UNESCO 2012), kagunan beksan Kecak–Barong, tenun Gringsing, lan upacara Nyepi.',
    },
    unsurTeknis: {
      id: 'Subak membagi debit air sungai lewat bendungan tradisional, terowongan irigasi, dan kalender tanam terkoordinasi hulu-hilir untuk menekan hama secara alami. Dalam ritual Tawur Kesanga menjelang Nyepi, arak-arakan patung bambu-kertas Ogoh-ogoh (perwujudan Bhuta Kala) digelar pada petang hari sebelum esoknya seluruh pulau menjalani keheningan total Catur Brata Penyepian.',
      en: 'Subak coordinates synchronized watershed sharing through water-temple calendars to curb pests naturally. On the eve of Saka New Year (Nyepi), crafted bamboo-and-paper Ogoh-ogoh effigies representing chaotic forces (Bhuta Kala) are paraded at dusk before twenty-four hours of island-wide stillness.',
      jw: 'Subak ngatur pembagian toya saking hulu dumugi hilir kanthi teratur; dene sadurungipun Nyepi (Catur Brata Penyepian), warga ngarak Ogoh-ogoh minangka pralambang ngresiki sifat ala.',
    },
    maknaFilosofis: {
      id: 'Seluruh tata kehidupan Bali berporos pada Tri Hita Karana: keselarasan hubungan manusia dengan Tuhan (Parahyangan), sesama manusia (Pawongan), serta lingkungan alam (Palemahan), menjadikan air dan kesenian sebagai persembahan suci kolektif.',
      en: 'Every institution manifests Tri Hita Karana: harmony among the divine (Parahyangan), human society (Pawongan), and the natural ecology (Palemahan).',
      jw: 'Sedaya tatanan Bali ngugemi Tri Hita Karana: kaselarasan sesambungan kalih Gusti (Parahyangan), sesami manungsa (Pawongan), lan alam lingkungan (Palemahan).',
    },
  },
  {
    id: 'idn-ntb-ntt',
    wilayah: {
      id: 'Nusa Tenggara Barat & Nusa Tenggara Timur (Sasak, Sumba, Flores, Rote)',
      en: 'West & East Nusa Tenggara (Lombok, Sumba, Flores, Rote)',
      jw: 'Nusa Tenggara Kilèn lan Wétan (Sasak, Sumba, Flores, Rote)',
    },
    judul: {
      id: 'Sasando Rote, Tenun Ikat, Mbaru Niang Wae Rebo & Bau Nyale',
      en: 'Rote Sasando, Sumba-Flores Ikat Weaving & Wae Rebo Architecture',
      jw: 'Sasando Rote, Tenun Ikat NTT lan Griya Mbaru Niang Wae Rebo',
    },
    kataKunci: ['sasando', 'rote', 'ntt', 'ntb', 'lombok', 'sasak', 'sumba', 'flores', 'manggarai', 'wae rebo', 'tenun', 'ikat', 'bau nyale', 'sumbawa', 'bima', 'timor', 'peresean'],
    intiSejarah: {
      id: 'Kepulauan Nusa Tenggara kaya akan tradisi tenun ikat bermotif maritim-megalitik dari Sumba dan Flores, tradisi Bau Nyale masyarakat Sasak di Lombok, serta arsitektur vernakular rumah kerucut bertingkat Wae Rebo di pegunungan Manggarai yang mendapat penghargaan pelestarian UNESCO Asia-Pacific.',
      en: 'Across Lombok, Sumbawa, Sumba, Flores, and Rote, heritage shines through Sasando harp-making, natural-dyed ikat textiles, Lombok’s Bau Nyale sea tradition, and the towering conical Mbaru Niang dwellings of Wae Rebo village.',
      jw: 'Kapuloan Nusa Tenggara sugih warisan tenun ikat Sumba-Flores, tradhisi Bau Nyale Sasak ing Lombok, instrumen Sasando saking Pulo Rote, lan griya kerucut Wae Rebo.',
    },
    unsurTeknis: {
      id: 'Sasando (dari kata sandu yang berarti bergetar/berbunyi dalam bahasa Rote) memakai tabung bambu berpenyangga senar kawat yang dibingkai setengah cawan anyaman daun lontar/siwalan sebagai resonator akustik alami. Sementara Tenun Ikat Sumba melalui proses pengikatan benang berbulan-bulan lalu pencelupan warna akar mengkudu (merah kecokelatan) dan daun nila.',
      en: 'The Sasando strings metal wires around a bamboo cylinder cradled inside a folded palmyra-leaf (lontar) fan acting as a natural acoustic resonator, while Sumba ikat dyeing binds yarns before long baths in morinda-root red and indigo.',
      jw: 'Sasando migunakaken tabung pring lan anyaman godhong lontar minangka resonator alami; dene tenun ikat kagarap mawi pewarna oyod mengkudu lan nila.',
    },
    maknaFilosofis: {
      id: 'Lima tingkat atap Mbaru Niang di Wae Rebo memuliakan keseimbangan antara ruang tinggal komunal delapan keluarga, penyimpanan benih pangan, hingga ruang penghormatan leluhur, sedangkan motif tenun ikat menjadi penanda martabat, doa keselamatan, serta sejarah marga.',
      en: 'The five stacked levels of Wae Rebo’s Mbaru Niang unify communal family life, seed preservation, and ancestral reverence, while ikat motifs chronicle clan lineage and blessings.',
      jw: 'Undhakan gangsal ing Mbaru Niang Wae Rebo nyawijekake papan bebrayan, lumbung pangan, lan pakurmatan leluhur; dene motif tenun mujudaken donga kawilujengan.',
    },
  },
  {
    id: 'idn-kalimantan',
    wilayah: {
      id: 'Kalimantan (Dayak, Banjar, Kutai)',
      en: 'Kalimantan / Borneo (Dayak, Banjar, Kutai)',
      jw: 'Kalimantan (Dayak, Banjar, Kutai)',
    },
    judul: {
      id: 'Rumah Betang/Lamin, Mandau, Sasirangan & Filosofi Huma Betang',
      en: 'Betang/Lamin Longhouses, Mandau, Sasirangan & Communal Peace',
      jw: 'Griya Betang/Lamin, Mandau, Sasirangan lan Falsafah Huma Betang',
    },
    kataKunci: ['kalimantan', 'dayak', 'betang', 'lamin', 'mandau', 'sasirangan', 'banjar', 'kutai', 'tiwah', 'sampek', 'sape', 'borneo', 'hudoq', 'enggang'],
    intiSejarah: {
      id: 'Sepanjang aliran sungai besar Kalimantan hidup tradisi Dayak dengan Rumah Panjang (Betang di Kalimantan Tengah/Barat dan Lamin di Kalimantan Timur), musik petik Sampek/Sape’, tari topeng panen Hudoq, kerajaan tertua beraksara Pallawa di Kutai Martadipura, serta wastra celup-jahit Sasirangan dari Kesultanan Banjar.',
      en: 'Along Borneo’s great rivers, Dayak communities built expansive timber longhouses (Betang and Lamin), Sape’ lute music, and Hudoq harvest rituals alongside early Pallawa-inscribed Kutai heritage and Banjar Sasirangan resist textiles.',
      jw: 'Ing pinggiring kali Kalimantan ngrembaka Griya Betang/Lamin suku Dayak, musik Sampek, beksan Hudoq, warisan prasasti Kutai, saha kain Sasirangan Banjar.',
    },
    unsurTeknis: {
      id: 'Rumah Betang berdiri tinggi di atas tiang kayu ulin (kayu besi anti-lapuk) sepanjang puluhan hingga lebih dari seratus meter menghadap sungai utama. Kain Sasirangan Banjar dibuat melalui teknik jelujur jahit rapat lalu dicelup pewarna tradisional kunyit, ulin, dan gambir, sementara Mandau ditempa dengan ukiran pola sulur tembaga/perak.',
      en: 'Elevated on rot-resistant ironwood (ulin) pilings facing river corridors, Betang houses shelter dozens of families under one roof, while Banjar Sasirangan fabrics achieve intricate patterns by hand-stitching resist seams prior to natural dye immersion.',
      jw: 'Griya Betang ngadeg inggil ing sanginggiling cagak kayu ulin tahan toya; dene kain Sasirangan kagarap kanthi teknik jahit jelujur lajeng dipuncelup pewarna alami.',
    },
    maknaFilosofis: {
      id: 'Falsafah Huma Betang menjunjung empat pilar kerukunan: kejujuran (belom bahadat), kesetaraan tanpa memandang perbedaan agama dan suku, kebersamaan dalam satu atap, serta tanggung jawab menjaga kelestarian hutan Kalimantan.',
      en: 'The Huma Betang ethos champions four civic pillars: moral honesty (belom bahadat), equality across faiths and origins, shared stewardship under one roof, and reverence for the rainforest.',
      jw: 'Falsafah Huma Betang nyengkuyung kejujuran (belom bahadat), kesetaraan tanpa mbeda-mbedakake, guyub rukun ing satunggal griya, lan njagi alas Kalimantan.',
    },
  },
  {
    id: 'idn-sulawesi-toraja-pinisi',
    wilayah: {
      id: 'Sulawesi (Toraja, Bugis–Makassar, Minahasa, Gorontalo)',
      en: 'Sulawesi (Toraja, Bugis–Makassar, Minahasa, Gorontalo)',
      jw: 'Sulawesi (Toraja, Bugis–Makassar, Minahasa, Gorontalo)',
    },
    judul: {
      id: 'Tongkonan Toraja, Perahu Pinisi, Lontara & Kolintang Minahasa',
      en: 'Toraja Tongkonan, Bugis Pinisi Shipcraft, Lontara Script & Kolintang',
      jw: 'Tongkonan Toraja, Perahu Pinisi, Aksara Lontara lan Kolintang',
    },
    kataKunci: ['toraja', 'tongkonan', 'rambu solo', 'bugis', 'makassar', 'pinisi', 'phinsi', 'lontara', 'galigo', 'siri', 'pacce', 'badik', 'baju bodo', 'kolintang', 'minahasa', 'mapalus', 'gorontalo', 'sulawesi', 'mandar'],
    intiSejarah: {
      id: 'Sulawesi menyimpan dua warisan kemanusiaan mendunia sekaligus: seni rancang-bangun Perahu Layar Pinisi masyarakat Bugis-Makassar (Bulukumba, UNESCO ICH 2017) serta tradisi kayu musikal Kolintang di Minahasa, bersanding dengan kekayaan tradisi adat Toraja (Tongkonan & Rambu Solo’) dan naskah aksara Lontara’.',
      en: 'Sulawesi contributes iconic maritime and highland traditions: Bugis–Makassar Pinisi wooden shipbuilding (UNESCO ICH 2017), Lontara script preserving the vast I La Galigo epic, Toraja Tongkonan clan houses, and Minahasa’s resonant wooden Kolintang orchestra.',
      jw: 'Sulawesi gadhah warisan kapal layar Pinisi (UNESCO 2017), aksara Lontara lan epos I La Galigo, griya adat Tongkonan Toraja, saha instrumen kayu Kolintang Minahasa.',
    },
    unsurTeknis: {
      id: 'Pembuatan kapal Pinisi dilakukan secara turun-temurun tanpa cetak biru tertulis melainkan hitungan lisan, menyusun papan kayu jati/bitti sebelum pemasangan gading penguat. Di pegunungan Toraja, atap bambu Tongkonan melengkung menjulang menghadap utara disertai ukiran Pa’ssura empat warna alam (hitam jelaga, putih kapur, merah tanah, kuning kunyit). Sementara Kolintang Minahasa tersusun dari bilah kayu telur/cempaka lokal dengan rentang oktaf melodi hingga bass.',
      en: 'Master Panrita Lopi shipwrights craft Pinisi hulls shell-first by memory without blueprints; Toraja Tongkonan roofs curve skyward facing north adorned with four-pigment Pa’ssura carvings; and Kolintang pairs carved local hardwood bars across full harmonic registers.',
      jw: 'Perahu Pinisi kagawé tanpa gambar cetak biru mawi pangétungan lisan para empu; Tongkonan Toraja ngadhep ngalor mawi ukiran sekawan warna alam; dene Kolintang ngangge bilah kayu cempaka.',
    },
    maknaFilosofis: {
      id: 'Pelaut Bugis-Makassar hidup di bawah etos Siri’ na Pacce (harga diri bermartabat berpadu rasa solidaritas mendalam sesama), masyarakat Minahasa menjiwai semangat gotong royong Mapalus, dan warga Toraja memuliakan ikatan keluarga lintas generasi.',
      en: 'Ethos of Siri’ na Pacce (dignity tempered by deep empathy), Minahasa’s Mapalus reciprocal cooperation, and Toraja’s intergenerational kinship embody maritime courage and communal solidarity.',
      jw: 'Bebrayan Bugis-Makassar ngugemi Siri’ na Pacce (martabat saha welas asih), warga Minahasa nglampahi gotong royong Mapalus, lan Toraja ngurmati talining kulawarga.',
    },
  },
  {
    id: 'idn-maluku-papua',
    wilayah: {
      id: 'Maluku & Tanah Papua (Asmat, Dani, Sentani, Biak, Ambon–Ternate)',
      en: 'Maluku Archipelago & Land of Papua',
      jw: 'Kapuloan Maluku lan Tanah Papua',
    },
    judul: {
      id: 'Sasi Maluku, Pela Gandong, Noken Papua, Honai & Ukiran Asmat',
      en: 'Maluku Sasi & Pela Gandong, Papua Noken, Honai & Asmat Woodcarving',
      jw: 'Sasi Maluku, Pela Gandong, Noken Papua, Honai lan Ukiran Asmat',
    },
    kataKunci: ['papua', 'asmat', 'dani', 'baliem', 'honai', 'noken', 'bakar batu', 'barapen', 'yospan', 'sentani', 'papeda', 'maluku', 'ambon', 'baileo', 'cakalele', 'tifa', 'sasi', 'pela', 'gandong', 'ternate', 'tidore', 'halmahera'],
    intiSejarah: {
      id: 'Di kepulauan rempah Maluku dan Tanah Papua tumbuh peradaban maritim serta pegunungan yang lestari: rumah adat bersama Baileo berpadu sistem konservasi Sasi dan perjanjian Pela Gandong di Maluku, sementara Papua memiliki tas anyaman tradisional Noken (UNESCO ICH 2012), seni ukir kayu Asmat, ritual Bakar Batu (Barapen), serta musik Tifa.',
      en: 'Across the spice islands of Maluku and the highlands and coasts of Papua thrive Baileo assembly halls, Sasi ecological conservation rules, Pela Gandong inter-village brotherhoods, UNESCO-listed Noken woven bags (2012), Honai highland dwellings, and Asmat spiritual woodcarving.',
      jw: 'Ing Maluku lan Papua ngrembaka griya adat Baileo, aturan konservasi Sasi, paseduluran Pela Gandong, tas anyaman Noken (UNESCO 2012), griya Honai, lan ukiran Asmat.',
    },
    unsurTeknis: {
      id: 'Tas Noken dirajut dari serat kulit kayu pohon melinjo/genemo atau anggrek hutan lalu dikenakan menggantung di dahi/kepala untuk mengangkut hasil kebun maupun menggendong anak. Rumah bundar Honai Suku Dani dibuat berkerangka kayu rapat beratap ilalang tanpa jendela guna memerangkap kehangatan perapian di udara dingin Lembah Baliem, sedangkan instrumen perkusi Tifa dibuat dari kayu berongga bermembran kulit biawak atau rusa.',
      en: 'Noken bags are hand-knotted from twisted tree bark or forest orchid fibers and carried suspended from the forehead. Dani Honai huts employ tight timber walls and thick thatched domes without windows to retain hearth warmth at high altitude, alongside carved hourglass Tifa drums.',
      jw: 'Tas Noken kaanyam saking serat kulit wit lan dipungantung ing bathuk; griya Honai kadamel bunder tanpa jendela kangge njagi anget ing pegunungan; lan Tifa kadamel saking kayu bolong.',
    },
    maknaFilosofis: {
      id: 'Sasi di Maluku–Papua membuktikan kepemimpinan adat yang menjaga regenerasi ikan teripang/lola dan hasil kebun secara berkelanjutan; Pela Gandong menyatukan masyarakat beda negeri atau keyakinan dalam ikatan saudara kandung; sementara tradisi Bakar Batu (Barapen) melambangkan pengampunan, syukur panen, dan perdamaian sosial.',
      en: 'Sasi enforces seasonal harvesting bans so marine and forest ecosystems regenerate; Pela Gandong binds villages across faith lines as siblings; and Bakar Batu communal feasts consecrate peace, forgiveness, and shared abundance.',
      jw: 'Sasi njagi kalestarian segara lan alas supados boten rusak, Pela Gandong nyawijekake seduluran beda iman, lan Bakar Batu dados lambang syukur saha bedhamen.',
    },
  },
  {
    id: 'idn-candi-sejarah-bhinneka',
    wilayah: {
      id: 'Warisan Sejarah Klasik Nusantara (Jawa, Sumatra, Kalimantan)',
      en: 'Classical Archipelagic Kingdoms & Monumental Heritage',
      jw: 'Warisan Sejarah Karajan Klasik Nuswantara',
    },
    judul: {
      id: 'Candi Borobudur, Prambanan, Majapahit & Semboyan Bhinneka Tunggal Ika',
      en: 'Borobudur, Prambanan, Majapahit & Bhinneka Tunggal Ika',
      jw: 'Candi Borobudur, Prambanan, Majapahit lan Bhinneka Tunggal Ika',
    },
    kataKunci: ['borobudur', 'prambanan', 'candi', 'majapahit', 'trowulan', 'bhinneka', 'sutasoma', 'tantular', 'nagarakretagama', 'gajah mada', 'palapa', 'singasari', 'kutai', 'tarumanagara', 'mataram kuno', 'gotong royong', 'jamu', 'tumpeng'],
    intiSejarah: {
      id: 'Pencapaian arsitektur monumental Nusantara tercermin pada Candi Borobudur (dibangun wangsa Syailendra abad ke-8–9, Situs Warisan Dunia UNESCO 1991) dan Candi Prambanan (abad ke-9). Pada puncak kejayaan Majapahit abad ke-14, pujangga Mpu Tantular menuliskan semboyan Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa dalam Kakawin Sutasoma, melengkapi catatan kenegaraan Nagarakretagama.',
      en: 'Classical Southeast Asian stone engineering peaked in the 8th–9th centuries at Sailendra Borobudur and Hindu Prambanan (UNESCO World Heritage 1991). In 14th-century Majapahit, poet Mpu Tantular coined Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa in the Kakawin Sutasoma.',
      jw: 'Kejayaan arsitektur sela klasik ketingal ing Candi Borobudur lan Prambanan (abad 8–9). Ing zaman Majapahit, Mpu Tantular nyerat sesanti Bhinneka Tunggal Ika wonten ing Kakawin Sutasoma.',
    },
    unsurTeknis: {
      id: 'Balok-balok batu vulkanik andesit Borobudur berjumlah jutaan potong disusun dengan sistem sambungan lidah-dan-alur (interlocking) tanpa adukan semen dengan saluran drainase air hujan tersembunyi di setiap undak. Susunan ruangnya bertingkat tiga secara kosmologis: Kamadhatu, Rupadhatu (berpanel 1.460 relief kisah), dan Arupadhatu berupa stupa-stupa terawangan di pelataran puncak.',
      en: 'Borobudur stacks millions of volcanic andesite blocks via dry-stone interlocking joints without mortar, equipped with concealed rainwater spouts across three cosmological realms: Kamadhatu, gallery-lined Rupadhatu reliefs, and circular Arupadhatu stupa terraces.',
      jw: 'Batu andesit Borobudur dipunsusun mawi sambungan ngunci tanpa semen lan saluran toya jawah, kaperang dados tigang tataran kosmos: Kamadhatu, Rupadhatu, lan Arupadhatu.',
    },
    maknaFilosofis: {
      id: 'Ungkapan Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa bermakna "berbeda-beda namun tetap satu jua, tiada kebenaran yang mendua", mengajarkan toleransi lintas keyakinan, tradisi gotong royong sebagai etos komunal desa Nusantara, serta kesadaran menjaga warisan sejarah bangsa.',
      en: 'Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa affirms unity in diversity and interfaith tolerance alongside Indonesia’s enduring communal ethic of Gotong Royong.',
      jw: 'Sesanti Bhinneka Tunggal Ika mulangake bilih sanajan maneka warna nanging tetep manunggal, sesarengan kalih semangat gotong royong.',
    },
  },
  {
    id: 'idn-tamansari-jogja',
    wilayah: {
      id: 'Patehan, Kecamatan Kraton, Kota Yogyakarta (Daerah Istimewa Yogyakarta)',
      en: 'Patehan, Kraton District, Yogyakarta City (Special Region of Yogyakarta)',
      jw: 'Patehan, Kemantren Kraton, Kutha Ngayogyakarta (DIY)',
    },
    judul: {
      id: 'Taman Sari, Keraton Yogyakarta, Kotagede & Sumbu Filosofis Yogyakarta',
      en: 'Taman Sari Water Castle, Yogyakarta Palace & Cosmological Axis',
      jw: 'Taman Sari, Kraton Ngayogyakarta, Kotagede lan Sumbu Filosofis',
    },
    kataKunci: [
      'tamansari',
      'taman sari',
      'water castle',
      'sumur gumuling',
      'pulo kenongo',
      'gedong kenongo',
      'umbul binangun',
      'pasiraman',
      'gapura panggung',
      'gapura agung',
      'urung',
      'patehan',
      'keraton yogyakarta',
      'kraton yogyakarta',
      'kraton jogja',
      'keraton jogja',
      'sumbu filosofis',
      'panggung krapyak',
      'tugu yogyakarta',
      'tugu jogja',
      'kotagede',
      'kota gede',
      'imogiri',
      'malioboro',
      'vredeburg',
      'vredenbrug',
      'hamengkubuwono',
      'yogyakarta',
      'jogja',
    ],
    intiSejarah: {
      id: 'Taman Sari Yogyakarta terletak di Kampung Taman, Kelurahan Patehan, Kecamatan Kraton, Kota Yogyakarta, sekitar 500 meter di sebelah barat daya Kompleks Keraton Ngayogyakarta Hadiningrat. Bekas taman kerajaan dan benteng air Kesultanan Mataram ini dibangun pada masa Sri Sultan Hamengkubuwono I sekitar 1758 hingga 1765 dengan arsitek Jawa bernama Demang Tegis, sebagai bagian utuh dari kawasan Sumbu Filosofis Yogyakarta (Tugu Pal Putih, Keraton, hingga Panggung Krapyak) yang diakui sebagai Warisan Dunia UNESCO pada 2023 bersama kawasan cagar budaya Kotagede, Makam Raja-Raja Imogiri, dan Benteng Vredeburg.',
      en: 'Taman Sari (the Royal Water Castle) is located in Kampung Taman, Patehan, Kraton District, Yogyakarta City, roughly 500 meters southwest of the Keraton Ngayogyakarta Hadiningrat palace complex. Commissioned by Sri Sultan Hamengkubuwono I between roughly 1758 and 1765 and designed with Javanese master builder Demang Tegis, it served as a royal pleasure garden, meditation sanctuary, and fortified aquatic retreat integrated within Yogyakarta’s UNESCO World Heritage Cosmological Axis (2023).',
      jw: 'Taman Sari dumunung ing Kampung Taman, Kelurahan Patehan, Kemantren Kraton, Kutha Ngayogyakarta, kirang langkung 500 meter sakidul-kulonipun Kraton Ngayogyakarta Hadiningrat. Pesanggrahan lan bètèng toya punika kabangun ing jaman Sri Sultan Hamengkubuwono I (1758–1765) kanthi arsitek Demang Tegis ing sajroning Sumbu Filosofis Ngayogyakarta.',
    },
    unsurTeknis: {
      id: 'Di dalam kompleks Taman Sari terdapat empat kawasan utama: Kompleks Pemandian Umbul Binangun (Pasiraman) dengan tiga kolam bertembok bata tebal berukir air mancur; Gerbang ikonik Gapura Agung dan Gapura Panggung berrelief naga serta motif burung akulturasi Jawa, Tiongkok, dan Eropa-Portugis; Pulau buatan Pulo Kenongo dan Gedong Kenongo di bekas danau Segaran; serta Masjid Bawah Tanah Sumur Gumuling bertingkat dua berbentuk cincin melingkar dengan lima tangga yang bertemu di tengah membentuk ruang akustik alami tanpa pengeras suara, dilengkapi lorong bawah tanah (Urung-Urung) yang dahulu menghubungkan danau dan kawasan keraton.',
      en: 'Inside Taman Sari stand four interlocking zones: the walled Umbul Binangun (Pasiraman) bathing courtyards fed by stone spouts; the sculpted Gapura Agung and Gapura Panggung gateways combining Javanese dragon reliefs with European masonry arches; Pulo Kenongo raised above the former Segaran artificial lake; and Sumur Gumuling, a circular two-story subterranean mosque featuring five converging staircases meeting at a resonant acoustic pulpit, linked via underground corridors (Urung-Urung).',
      jw: 'Wonten ing sajroning Taman Sari pinanggih patang perangan utama: Kolam Pasiraman Umbul Binangun kanthi pancuran sela, Gapura Agung lan Gapura Panggung mawi ukiran naga, Pulo Kenongo ing tengahing tilas tlaga Segaran, saha Masjid Sumur Gumuling tingkat kalih kanthi gangsal andha ingkang nyawiji ing tengah minangka ruang akustik alami, kagandheng lorong ngisor lemah Urung-Urung.',
    },
    maknaFilosofis: {
      id: 'Selain memvisualisasikan kosmologi air, kesucian batin, dan strategi pertahanan Mataram Islam, kawasan Keraton Yogyakarta, Taman Sari, serta permukiman adat di sekitarnya seperti Kampung Wisata Taman dan Kotagede memelihara tradisi batik tulis, seni ukir perak, dan tata ruang sakral Sangkan Paraning Dumadi hingga kini.',
      en: 'Embodying Mataram water cosmology, contemplative purification, and architectural syncretism, Taman Sari and nearby Kotagede remain living centers of Yogyakarta royal heritage, handmade batik, and silversmithing.',
      jw: 'Kejawi dados pralambang kasucen batin lan strategi pertahanan Mataram, kawasan Taman Sari lan Kotagede ngantos samangke lestari dados pusat kriya batik tulis, perak, saha tata ruang Sangkan Paraning Dumadi.',
    },
  },
  {
    id: 'idn-candi-jawa-situs',
    wilayah: {
      id: 'Jawa Tengah, DI Yogyakarta, Jawa Timur & Jawa Barat (Prambanan, Dieng, Trowulan, Cianjur)',
      en: 'Central, East & West Java & Yogyakarta (Prambanan, Dieng, Trowulan, Cianjur)',
      jw: 'Jawa Tengah, DIY, Jawa Wétan lan Jawa Kilèn',
    },
    judul: {
      id: 'Prambanan, Ratu Boko, Candi Dieng, Gedong Songo, Sukuh & Situs Trowulan–Gunung Padang',
      en: 'Prambanan, Ratu Boko, Dieng, Gedong Songo, Majapahit Trowulan & Gunung Padang',
      jw: 'Candi Prambanan, Ratu Boko, Dieng, Gedong Songo, Trowulan lan Gunung Padang',
    },
    kataKunci: [
      'prambanan',
      'ratu boko',
      'sewu',
      'plaosan',
      'mendut',
      'pawon',
      'kalasan',
      'sambisari',
      'ijo',
      'dieng',
      'gedong songo',
      'sukuh',
      'cetho',
      'penataran',
      'singasari',
      'brahu',
      'tikus',
      'bajang ratu',
      'trowulan',
      'gunung padang',
      'sangiran',
      'klaten',
      'magelang',
      'wonosobo',
      'mojokerto',
      'cianjur',
      'karanganyar',
      'semarang',
    ],
    intiSejarah: {
      id: 'Sebaran candi dan situs arkeologi utama di Pulau Jawa meliputi Kompleks Candi Prambanan dan Keraton Ratu Boko di perbatasan Sleman (DIY) dan Klaten (Jawa Tengah) peninggalan Mataram Kuno abad ke-8 hingga ke-9; gugus candi pegunungan Dieng di Wonosobo–Banjarnegara serta Candi Gedong Songo di Bandungan, Kabupaten Semarang; Candi Sukuh dan Cetho di lereng Gunung Lawu, Karanganyar; ibu kota Majapahit abad ke-14 di Trowulan, Kabupaten Mojokerto, Jawa Timur; hingga situs punden berundak megalitik Gunung Padang di Cianjur, Jawa Barat dan situs manusia purba Sangiran di Sragen.',
      en: 'Java’s monumental archaeological corridor spans 9th-century Hindu Prambanan and the hilltop Ratu Boko palace complex straddling Sleman (Yogyakarta) and Klaten (Central Java); highland temples at Dieng (Wonosobo) and Gedong Songo (Semarang); terraced mountain sanctuaries of Sukuh and Cetho on Mount Lawu; the 14th-century brick capital of Majapahit at Trowulan (Mojokerto, East Java); and the megalithic terraced sanctuary of Gunung Padang in Cianjur plus Sangiran paleoanthropological reserve.',
      jw: 'Sebaran candi ing Pulo Jawa dumunung wiwit Prambanan lan Ratu Boko ing perbatasan Sleman–Klaten, candi pegunungan Dieng (Wonosobo) lan Gedong Songo (Semarang), Sukuh–Cetho ing Karanganyar, pusat Majapahit ing Trowulan (Mojokerto), dumugi situs megalitik Gunung Padang ing Cianjur.',
    },
    unsurTeknis: {
      id: 'Kompleks Prambanan berdiri dengan tiga candi utama Trimurti (Siwa setinggi 47 meter, Brahma, dan Wisnu) yang dikelilingi ratusan candi perwara batu andesit berhiaskan panel relief kisah Ramayana. Sementara Trowulan memperlihatkan keunggulan teknik bata merah terakota tanpa spesi semen berlandaskan sistem kanal kota kuno pada Candi Brahu, Gapura Bajang Ratu, Gapura Wringin Lawang, dan petirtaan Candi Tikus.',
      en: 'Prambanan centers on three soaring Trimurti spires (culminating in the 47-meter Shiva temple) lined with carved Ramayana reliefs, whereas Trowulan showcases dry-laid Majapahit terracotta brick masonry engineered around ancient urban canals at Candi Brahu, Bajang Ratu, and the sunken Candi Tikus bathing sanctuary.',
      jw: 'Kompleks Prambanan gadhah tiga candi utama Trimurti kanthi panel relief Ramayana sela andesit; dene Trowulan nuduhake teknik bata abang Majapahit ing Candi Brahu, Bajang Ratu, lan Candi Tikus.',
    },
    maknaFilosofis: {
      id: 'Ragam tata letak candi ini membuktikan penguasaan rekayasa topografi vulkanik, manajemen tata air, serta dialog harmonis tradisi lokal megalitik Nusantara dengan filsafat Hindu-Buddha klasik.',
      en: 'Together these monuments illustrate indigenous mastery of volcanic stone engineering, water stewardship, and lasting cultural synthesis between Austronesian megalithic cosmology and classical Hindu-Buddhist thought.',
      jw: 'Tata letak candi punika dados bukti kepinteran arsitektur sela, tata banyu, lan dialog harmonis kearifan lokal Nuswantara kalih filsafat Hindu-Buddha.',
    },
  },
  {
    id: 'idn-surakarta-cirebon-adat',
    wilayah: {
      id: 'Surakarta, Cirebon & Priangan Jawa Barat (Solo, Cirebon, Tasikmalaya, Sukabumi)',
      en: 'Surakarta (Solo), Cirebon & West Java Traditional Villages',
      jw: 'Surakarta, Cirebon lan Desa Adat Jawa Kilèn',
    },
    judul: {
      id: 'Keraton Surakarta, Mangkunegaran, Keraton Kasepuhan Cirebon & Kampung Naga',
      en: 'Surakarta & Mangkunegaran Courts, Cirebon Palaces & Kampung Naga',
      jw: 'Kraton Surakarta, Mangkunegaran, Kasepuhan Cirebon lan Kampung Naga',
    },
    kataKunci: [
      'surakarta',
      'solo',
      'kasunanan',
      'mangkunegaran',
      'pakubuwono',
      'cirebon',
      'kasepuhan',
      'kanoman',
      'kacirebonan',
      'kampung naga',
      'tasikmalaya',
      'ciptagelar',
      'cireundeu',
      'garut',
      'laweyan',
      'radya pustaka',
    ],
    intiSejarah: {
      id: 'Selain Yogyakarta, pusat kebudayaan istana dan adat di Pulau Jawa bertumpu pada Keraton Kasunanan Surakarta Hadiningrat serta Pura Mangkunegaran di Kota Surakarta (Solo), Jawa Tengah; tiga keraton historis di Kota Cirebon, Jawa Barat (Kasepuhan, Kanoman, dan Kacirebonan sebagai poros pesisir barat Nusantara sejak abad ke-15); serta permukiman adat Sunda yang lestari seperti Kampung Naga di Kabupaten Tasikmalaya dan Kasepuhan Ciptagelar di pegunungan Sukabumi.',
      en: 'Alongside Yogyakarta, Java’s major living court and indigenous hubs encompass the Kasunanan Palace and Mangkunegaran Principality in Surakarta (Solo, Central Java); the Sultanate palaces of Kasepuhan, Kanoman, and Kacirebonan in coastal Cirebon (West Java); and intact Sundanese adat hamlets such as Kampung Naga in Tasikmalaya and Kasepuhan Ciptagelar in Sukabumi.',
      jw: 'Kejawi Ngayogyakarta, pusat kabudayan Jawi lan Sunda wonten ing Kraton Kasunanan Surakarta saha Pura Mangkunegaran ing Solo, Kraton Kasepuhan–Kanoman ing Cirebon, sarta desa adat Kampung Naga (Tasikmalaya) lan Ciptagelar (Sukabumi).',
    },
    unsurTeknis: {
      id: 'Pura Mangkunegaran terkenal dengan Pendopo Ageng berbentang luas tanpa tiang penghalang pandangan di tengah dengan tata akustik gamelan dan koleksi topeng-wayang tua; Keraton Kasepuhan Cirebon menampilkan Bangsal Siti Inggil berbata merah dengan pengaruh Ukiran Pesisir, Tiongkok, dan Kereta Singa Barong; sementara Kampung Naga membangun seratusan rumah panggung seragam berbahan bilik bambu, kayu, dan atap ijuk menghadap satu arah sebagai disiplin komunal.',
      en: 'Pura Mangkunegaran features a vast pillar-free ceremonial Pendopo renowned for gamelan acoustics; Kasepuhan Palace in Cirebon pairs brick Siti Inggil pavilions with coastal Chinese ceramics and the royal Singa Barong carriage; while Kampung Naga preserves uniform bamboo-walled, palm-fiber thatched stilt houses oriented strictly along sacred valley contours.',
      jw: 'Pura Mangkunegaran gadhah Pendopo Ageng jembar kanthi akustik gangsa alus; Kasepuhan Cirebon nggabungake bata abang lan kereta Singa Barong; dene Kampung Naga njagi griya panggung pring atap ijuk ingkang seragam.',
    },
    maknaFilosofis: {
      id: 'Setiap kompleks ini menjaga etika kepemimpinan Jawa-Sunda, kesinambungan seni tari klasik Bedhaya–Serimpi, batik saudagar Laweyan dan Trusmi, serta pelestarian hutan larangan (leuweung larangan) di Tatar Sunda.',
      en: 'Each site safeguards classical court dances such as Bedhaya and Serimpi, merchant batik guilds of Laweyan and Trusmi, and indigenous forest conservation laws (leuweung larangan).',
      jw: 'Saben papan punika ngreksa tatanan kabudayan Jawi–Sunda, beksan Bedhaya–Serimpi, sentra batik Laweyan–Trusmi, saha alas larangan ing Tatar Sunda.',
    },
  },
  {
    id: 'idn-kota-bersejarah-pesisir',
    wilayah: {
      id: 'Pesisir Utara Jawa & Ibu Kota Historis (Semarang, Kudus, Demak, Jakarta, Bandung)',
      en: 'Java’s Historic Northern Cities & Highlands (Semarang, Kudus, Demak, Jakarta, Bandung)',
      jw: 'Pesisir Lor Jawa lan Kutha Sejarah (Semarang, Kudus, Demak, Jakarta, Bandung)',
    },
    judul: {
      id: 'Lawang Sewu, Kota Lama Semarang, Menara Kudus, Masjid Demak, Kota Tua & Gedung Sate',
      en: 'Lawang Sewu, Semarang Old Town, Menara Kudus, Demak Mosque, Kota Tua & Gedung Sate',
      jw: 'Lawang Sewu, Kutha Lawas Semarang, Menara Kudus, Masjid Demak lan Kutha Tuwa',
    },
    kataKunci: [
      'lawang sewu',
      'kota lama',
      'sam poo kong',
      'semarang',
      'menara kudus',
      'kudus',
      'masjid demak',
      'demak',
      'wali songo',
      'walisongo',
      'kota tua',
      'monas',
      'jakarta',
      'batavia',
      'gedung sate',
      'bandung',
      'museum nasional',
      'trusmi',
      'pekalongan',
      'lasem',
    ],
    intiSejarah: {
      id: 'Jejak sejarah pesisir Jawa dan kota-kota besar Indonesia terbentang dari Masjid Agung Demak (abad ke-15) dan Masjid Menara Kudus (didirikan Sunan Kudus 1549) sebagai tonggak awal Islam Nusantara; kawasan Kota Lama dan Lawang Sewu (bekas kantor perusahaan kereta api Hindia Belanda 1904) serta Kelenteng Sam Poo Kong di Kota Semarang; Kota Tua Jakarta dan Monumen Nasional (Monas) di DKI Jakarta; hingga Gedung Sate bercorak Indo-Eropa di Kota Bandung, Jawa Barat.',
      en: 'Indonesia’s urban architectural timeline connects the 15th-century Great Mosque of Demak and the 1549 Menara Kudus Mosque in Central Java; Lawang Sewu, Semarang Old Town (Kota Lama), and Sam Poo Kong in Semarang; Kota Tua heritage square and the National Monument (Monas) in Jakarta; and Bandung’s iconic 1920s Indo-European Gedung Sate.',
      jw: 'Situs sejarah pesisir lan kutha ageng ngemot Masjid Agung Demak lan Menara Kudus (1549), Lawang Sewu, Kutha Lawas, saha Sam Poo Kong ing Semarang, Kutha Tuwa lan Monas ing Jakarta, dumugi Gedung Sate ing Bandung.',
    },
    unsurTeknis: {
      id: 'Masjid Menara Kudus memadukan menara batu bata merah tanpa adukan semen menyerupai bentuk kulkul/candi Hindu-Majapahit dengan masjid beratap tajug bertingkat; Lawang Sewu merancang jaringan seribu lubang pintu-jendela tinggi serta sistem pendinginan saluran air bawah tanah khas iklim tropis; sedangkan Gedung Sate menggabungkan atap bertumpuk gaya Meru Nusantara, ukiran candi, serta teknik konstruksi beton bertulang awal abad ke-20.',
      en: 'Menara Kudus famously integrates a mortarless Majapahit-style red brick tower with a tiered Javanese tajug mosque roof; Lawang Sewu achieves natural tropical cross-ventilation through rhythmic arcaded doorways and sub-floor cooling channels; and Gedung Sate crowns neoclassical stone arches with a tiered Nusantara Meru spire.',
      jw: 'Menara Kudus nyawijekake menara bata abang gaya Majapahit kalih payon tajug Jawi; Lawang Sewu ngatur sirkulasi angin tropis lumantar sewu kori; dene Gedung Sate nggabungake konstruksi modern kalih payon tumpang Meru.',
    },
    maknaFilosofis: {
      id: 'Monumen-monumen lintas zaman ini menunjukkan keterbukaan budaya Indonesia dalam menyerap akulturasi Jawa, Islam Wali Songo, Tionghoa pesisir (termasuk batik Lasem dan Pekalongan), dan rekayasa tropis ke dalam identitas kebangsaan modern.',
      en: 'Across eras, these landmarks demonstrate how Javanese, Islamic Wali Songo, coastal Chinese-Indonesian, and tropical engineering traditions coalesced into Indonesia’s shared civic heritage.',
      jw: 'Monumen sejarah punika nuduhake keterbukaan akulturasi budaya Jawi, Islam Wali Songo, pesisir Tionghoa, saha arsitektur tropis dhateng jati diri bangsa.',
    },
  },
  {
    id: 'idn-destinasi-sumatera',
    wilayah: {
      id: 'Sumatera (Aceh, Sumatera Utara, Sumatera Barat, Riau)',
      en: 'Sumatra (Aceh, North Sumatra, West Sumatra, Riau)',
      jw: 'Sumatera (Aceh, Sumatera Lor, Sumatera Kilèn, Riau)',
    },
    judul: {
      id: 'Baiturrahman Aceh, Pulau Samosir Toba, Istana Maimun, Pagaruyung, Jam Gadang & Muara Takus',
      en: 'Baiturrahman Mosque, Samosir Toba, Maimun Palace, Pagaruyung, Jam Gadang & Muara Takus',
      jw: 'Baiturrahman Aceh, Samosir Toba, Istana Maimun, Pagaruyung, Jam Gadang lan Muara Takus',
    },
    kataKunci: [
      'baiturrahman',
      'samosir',
      'danau toba',
      'huta siallagan',
      'tomok',
      'maimun',
      'medan',
      'deli',
      'pagaruyung',
      'batusangkar',
      'tanah datar',
      'jam gadang',
      'bukittinggi',
      'siak',
      'muara takus',
      'bahal',
      'sumatera',
      'sumatra',
    ],
    intiSejarah: {
      id: 'Kawasan bersejarah utama di Pulau Sumatera meliputi Masjid Raya Baiturrahman di pusat Kota Banda Aceh; Pulau Samosir di tengah Danau Toba, Sumatera Utara (tempat Kampung Adat Huta Siallagan dan situs batu persidangan Siallagan serta makam Raja Sidabutar di Tomok); Istana Maimun peninggalan Kesultanan Deli tahun 1888 di Kota Medan; Istano Basa Pagaruyung di Kabupaten Tanah Datar dan menara ikonik Jam Gadang di Bukittinggi, Sumatera Barat; serta Istana Asserayah Al Hasyimiah di Siak dan kompleks percandian bata Buddha Candi Muara Takus di Kampar, Riau.',
      en: 'Sumatra’s major historic destinations include Banda Aceh’s Baiturrahman Grand Mosque; Samosir Island inside Lake Toba, North Sumatra (home to Huta Siallagan fortified stone court village and Tomok royal megaliths); the 1888 Sultanate of Deli Maimun Palace in Medan; Istano Basa Pagaruyung in Tanah Datar and the 1926 Jam Gadang clocktower in Bukittinggi, West Sumatra; plus the royal palace of Siak and brick Buddhist stupa complex Muara Takus in Riau.',
      jw: 'Papan sejarah ageng ing Sumatera nyakup Masjid Raya Baiturrahman ing Banda Aceh, Pulo Samosir lan Huta Siallagan ing Tlaga Toba, Istana Maimun ing Medan, Istano Basa Pagaruyung lan Jam Gadang ing Sumatera Kilèn, saha Istana Siak lan Candi Muara Takus ing Riau.',
    },
    unsurTeknis: {
      id: 'Di Huta Siallagan, permukiman Batak Toba dikelilingi tembok batu berlumut dan jajaran Rumah Bolon menghadap lapangan Batu Parsidangan yang dipahat alami untuk rapat tetua kampung. Sementara Istano Basa Pagaruyung memadukan puluhan ukiran papan Minangkabau bermotif flora-filosofis dengan menara atap gonjong bertingkat tiga serta ruang koleksi pusaka Bundo Kanduang, dan menara Jam Gadang dibangun tanpa besi beton melainkan adonan kapur, putih telur, dan pasir putih bermahkota atap gonjong.',
      en: 'Huta Siallagan surrounds traditional Ruma Bolon clan houses with mossy stone ramparts centered on megalithic stone council seats; Pagaruyung showcases multi-tiered carved hardwood gonjong halls; and Bukittinggi’s Jam Gadang stands via traditional lime-egg-white-sand masonry topped with a Minangkabau roof finial.',
      jw: 'Ing Huta Siallagan, griya Bolon dipun-kubengi beteng sela lan Batu Parsidangan tetua adat; Istano Pagaruyung gadhah payon gonjong telung undhak kebak ukiran; dene Jam Gadang kabangun tanpa rangka wesi mawi kapur, putih endhog, lan pasir.',
    },
    maknaFilosofis: {
      id: 'Keseluruhan situs bersejarah Sumatera mencerminkan jalur peradaban maritim Selat Malaka, musyawarah hukum adat Batak dan Minangkabau, serta ketangguhan masyarakat pesisir maupun pegunungan Bukit Barisan menjaga warisannya.',
      en: 'Across Sumatra, these sites commemorate Malacca Strait maritime diplomacy, deliberative Batak and Minangkabau customary law, and resilient highland and coastal stewardship.',
      jw: 'Situs-situs ing Sumatera punika nyatet sejarah maritim Selat Malaka, musyawarah adat Batak–Minang, lan ketangguhan warga njagi warisan leluhur.',
    },
  },
  {
    id: 'idn-pura-desa-bali',
    wilayah: {
      id: 'Pulau Bali (Karangasem, Bangli, Tabanan, Badung, Gianyar)',
      en: 'Island of Bali (Karangasem, Bangli, Tabanan, Badung, Gianyar)',
      jw: 'Pulo Bali (Karangasem, Bangli, Tabanan, Badung, Gianyar)',
    },
    judul: {
      id: 'Pura Besakih, Tanah Lot, Uluwatu, Ulun Danu, Tirta Empul & Desa Adat Penglipuran',
      en: 'Besakih, Tanah Lot, Uluwatu, Ulun Danu, Tirta Empul & Penglipuran Village',
      jw: 'Pura Besakih, Tanah Lot, Uluwatu, Ulun Danu, Tirta Empul lan Desa Penglipuran',
    },
    kataKunci: [
      'besakih',
      'tanah lot',
      'uluwatu',
      'ulun danu',
      'bratan',
      'tirta empul',
      'tampaksiring',
      'penglipuran',
      'tenganan',
      'goa gajah',
      'ubud',
      'bangli',
      'karangasem',
      'tabanan',
      'badung',
      'gianyar',
      'pura',
    ],
    intiSejarah: {
      id: 'Situs spiritual dan permukiman adat terpenting di Bali mencakup Kompleks Pura Agung Besakih di lereng Gunung Agung, Kabupaten Karangasem (pura induk terbesar Bali); Pura Luhur Tanah Lot di tepi laut Tabanan dan Pura Luhur Uluwatu di puncak tebing kapur Badung; Pura Ulun Danu Beratan di danau dataran tinggi Bedugul; Pura Tirta Empul di Tampaksiring, Gianyar berhulu mata air suci abad ke-10; hingga Desa Adat Penglipuran di Bangli serta Desa Bali Aga Tenganan Pegringsingan.',
      en: 'Bali’s sacred topography links the sprawling Pura Agung Besakih complex on Mount Agung’s slopes (Karangasem); coastal cliff temples Tanah Lot (Tabanan) and Uluwatu (Badung); lakeside Pura Ulun Danu Beratan; the 10th-century holy springs of Tirta Empul in Tampaksiring; plus the bamboo-lined Penglipuran adat village in Bangli and ancient Bali Aga settlement of Tenganan.',
      jw: 'Papan suci lan desa adat ing Bali nyakup Pura Agung Besakih ing Karangasem, Tanah Lot (Tabanan), Uluwatu (Badung), Ulun Danu Beratan, mata air suci Tirta Empul ing Tampaksiring, saha Desa Adat Penglipuran ing Bangli lan Desa Bali Aga Tenganan.',
    },
    unsurTeknis: {
      id: 'Arsitektur pura dan desa Bali menata ruang berdasarkan tata nilai Tri Mandala (Nista, Madya, dan Utama Mandala) serta orientasi Kaja–Kelod (arah gunung suci ke laut). Desa Adat Penglipuran menyusun deretan gerbang rumah angkul-angkul yang seragam sepanjang poros tengah bebas kendaraan bermotor menuju Pura Penataran di ujung utara serta menjaga hutan bambu adat seluas puluhan hektare.',
      en: 'Balinese sanctuaries follow the tripartite Tri Mandala courtyard progression (outer, middle, inner sanctum) aligned from mountain toward sea (Kaja–Kelod). Penglipuran arranges uniform brick-and-earth angkul-angkul family compound gates along a vehicle-free spine ascending northward to the village temple and protected bamboo forest.',
      jw: 'Tata ruang pura lan desa adat Bali migunakaken paugeran Tri Mandala saha arah Kaja–Kelod. Desa Penglipuran nata gerbang griya angkul-angkul kanthi rapi lan njagi alas pring adat tanpa kendharaan.',
    },
    maknaFilosofis: {
      id: 'Penataan tempat suci dan desa adat di Bali mempraktikkan Tri Hita Karana secara nyata, yakni menyeimbangkan bakti spiritual, kerukunan banjar, serta perlindungan sumber mata air dan hutan bambu sebagai penyangga kehidupan pulau.',
      en: 'Through living ritual and architecture, Bali’s sanctuaries enact Tri Hita Karana by uniting temple devotion, cooperative banjar governance, and watershed preservation.',
      jw: 'Papan-papan suci ing Bali nglampahi Tri Hita Karana kanthi nyata lumantar bakti spiritual, kerukunan warga banjar, saha njagi sumber toya lan alas.',
    },
  },
  {
    id: 'idn-destinasi-timur-toraja-maluku',
    wilayah: {
      id: 'Sulawesi, Maluku & Nusa Tenggara (Makassar, Toraja, Baubau, Banda Neira, Ternate)',
      en: 'Eastern Indonesia Landmarks (Makassar, Toraja, Buton, Banda Neira, Ternate)',
      jw: 'Indonesia Wétan (Makassar, Toraja, Buton, Banda Neira, Ternate)',
    },
    judul: {
      id: 'Fort Rotterdam, Ke’te Kesu Toraja, Benteng Buton, Banda Neira & Kesultanan Ternate',
      en: 'Fort Rotterdam, Ke’te Kesu Toraja, Buton Citadel, Banda Neira & Ternate',
      jw: 'Fort Rotterdam, Ke’te Kesu Toraja, Benteng Buton, Banda Neira lan Ternate',
    },
    kataKunci: [
      'rotterdam',
      'fort rotterdam',
      'balla lompoa',
      'kete kesu',
      'ke\'te kesu',
      'londa',
      'lemo',
      'wolio',
      'benteng keraton buton',
      'baubau',
      'banda neira',
      'belgica',
      'nassau',
      'duurstede',
      'oranje',
      'marlborough',
      'bengkulu',
      'kesultanan ternate',
      'kedaton ternate',
      'benteng',
    ],
    intiSejarah: {
      id: 'Peninggalan kota maritim dan benteng penting di wilayah tengah hingga timur Indonesia meliputi Benteng Ujung Pandang / Fort Rotterdam di tepi pantai Kota Makassar, Sulawesi Selatan (asal abad ke-16 Kerajaan Gowa-Tallo); desa adat tertua Ke’te Kesu beserta situs pemakaman tebing Londa dan Lemo di Toraja Utara–Tana Toraja; Benteng Keraton Buton (Wolio) di Baubau, Sulawesi Tenggara sebagai benteng batu terluas; Kepulauan Banda Neira dan Benteng Belgica serta Fort Nassau di Maluku Tengah sebagai poros sejarah rempah pala dunia; serta Kedaton Kesultanan Ternate dan Benteng Oranje di Maluku Utara (bersanding dengan Benteng Marlborough peninggalan sejarah di Kota Bengkulu).',
      en: 'Central and Eastern Indonesia preserve extraordinary fortresses and ancestral settlements: Makassar’s 16th-century coastal Fort Rotterdam (originally Gowa-Tallo’s Jumpandang Citadel); the Tongkonan heritage complex of Ke’te Kesu and cliff burial galleries Londa and Lemo in Toraja; the expansive stone Wolio citadel in Buton (Baubau); Banda Neira’s Fort Belgica perched above the Nutmeg spice archipelago of Maluku; and the Kedaton palace of Ternate alongside Bengkulu’s Fort Marlborough on Sumatra’s west coast.',
      jw: 'Warisan benteng lan desa adat ing Indonesia tengah lan wetan nyakup Benteng Fort Rotterdam ing Makassar, Ke’te Kesu saha tebing Londa ing Toraja, Benteng Keraton Buton ing Baubau, Benteng Belgica ing Banda Neira Maluku, saha Kedaton Kesultanan Ternate.',
    },
    unsurTeknis: {
      id: 'Benteng Keraton Buton disusun sepanjang kurang lebih 2,7 kilometer dari bongkahan batu kapur gunung yang direkatkan dengan bahan kapur-pasir tanpa besi modern dan dilindungi dua belas pintu lawa; di Toraja, pemakaman tebing Londa dan Lemo memahat ruang batu karst tinggi dengan patung kayu Tau-Tau penjaga silsilah; sementara Benteng Belgica di Banda Neira berdenah segi lima bintang berlapis dengan sudut tembak 360 derajat menghadap Selat Banda dan Gunung Api Banda.',
      en: 'Buton’s Wolio fortress stretches ~2.7 kilometers using coral-limestone blocks with twelve defensive gateways; Toraja’s Londa and Lemo carve cliff-face limestone vaults guarded by sculpted wooden Tau-Tau effigies; and Banda Neira’s star-shaped pentagonal Fort Belgica commands unobstructed views of Banda Volcano and historic spice anchorages.',
      jw: 'Benteng Buton kabangun dawa ~2,7 km saking watu kapur mawi kalih welas lawang; ing Toraja tebing batu Londa lan Lemo dipun-pahat dados pasarean mawi patung Tau-Tau; dene Benteng Belgica gadhah denah segilima ngadhep Gunung Api Banda.',
    },
    maknaFilosofis: {
      id: 'Jaringan benteng, istana sultan, dan desa leluhur ini menjadi saksi sejarah perdagangan rempah global Nusantara, kedaulatan maritim Gowa–Ternate–Buton, serta penghormatan lintas generasi terhadap alam kepulauan dan leluhur.',
      en: 'Together these citadels, sultanates, and cliff sanctuaries bear witness to Nusantara’s decisive role in the global spice trade, maritime statecraft, and unbroken ancestral memory.',
      jw: 'Jaringan benteng lan kesultanan punika dados saksi sejarah perdagangan rempah Nusantara, kedaulatan maritim, saha pakurmatan dhateng leluhur.',
    },
  },
  {
    id: 'idn-kuliner-wastra-nusantara',
    wilayah: {
      id: 'Seluruh Indonesia (Minangkabau, Jawa, Palembang, Sulawesi, Maluku, Papua)',
      en: 'Pan-Indonesian Culinary & Textile Heritage Regions',
      jw: 'Saindhenging Indonesia (Minang, Jawa, Palembang, Sulawesi, Maluku, Papua)',
    },
    judul: {
      id: 'Gastronomi Tradisional (Rendang, Gudeg, Pempek, Papeda, Tumpeng, Jamu) & Ragam Batik Nusantara',
      en: 'Indonesian Culinary Heritage (Rendang, Gudeg, Pempek, Papeda, Jamu) & Regional Batik',
      jw: 'Kuliner Warisan (Rendang, Gudeg, Pempek, Papeda, Jamu) lan Batik Nusantara',
    },
    kataKunci: [
      'rendang',
      'gudeg',
      'pempek',
      'rawon',
      'soto',
      'papeda',
      'bika ambon',
      'tumpeng',
      'jamu',
      'kopi',
      'batik pesisir',
      'mega mendung',
      'sekar jagad',
      'parang',
      'truntum',
      'sidomukti',
      'kuliner tradisional',
      'gastronomi',
    ],
    intiSejarah: {
      id: 'Warisan kuliner dan wastra Indonesia lahir dari kekayaan rempah kepulauan serta pertukaran budaya antardaerah: Rendang dari ranah Minangkabau sebagai hidangan upacara adat; Gudeg nangka muda dari Yogyakarta dan Rawon kluwek dari Jawa Timur; Pempek ikan sungai Musi dari Palembang; Papeda sagu khas Maluku dan Papua; Jamu racikan herbal turun-temurun yang diakui UNESCO ICH 2023; hingga ragam motif batik berkarakter filosofis seperti Parang, Truntum, Sidomukti di Jawa Tengah–Yogyakarta serta Mega Mendung dari Cirebon dan batik warna cerah pesisir Pekalongan–Lasem.',
      en: 'Indonesia’s culinary and textile richness reflects centuries of spice biodiversity and regional exchange: slow-caramelized Minangkabau Rendang, Yogyakarta’s sweet jackfruit Gudeg, East Javanese black-keluak Rawon, Palembang’s Musi-river Pempek, sago-based Papeda in Maluku and Papua, UNESCO-listed Jamu herbal wellness (2023), and distinct regional batik aesthetics spanning court motifs (Parang, Truntum) and vibrant coastal Cirebon Mega Mendung and Lasem cloths.',
      jw: 'Warisan kuliner lan wastra Nuswantara ngemot Rendang Minangkabau, Gudeg Ngayogyakarta, Rawon Jawa Wétan, Pempek Palembang, Papeda Maluku–Papua, Jamu herbal (UNESCO 2023), saha motif batik Parang, Truntum, Sidomukti, lan Mega Mendung Cirebon.',
    },
    unsurTeknis: {
      id: 'Rendang sejati dimasak perlahan berjam-jam dengan santan kelapa dan lengkuas-serai-kunyit hingga menjadi karamel kering tahan simpan alami untuk perbekalan merantau; Pempek mengolah tepung sagu berpadu ikan gabus/tenggiri dan kuah cuka gula aren-asam jawa; sedangkan Papeda mengaduk pati sagu murni bersama air mendidih hingga bertekstur bening kenyal untuk disantap dengan kuah ikan bumbu kunyit.',
      en: 'Traditional Rendang undergoes hours of gentle reduction in coconut milk and bruised aromatics until naturally preserved by caramelized spice oils; Pempek binds river fish paste with sago starch and dark palm-sugar vinegar broth; and Papeda transforms pure Metroxylon sago starch with boiling water into a glossy staple paired with turmeric fish broth.',
      jw: 'Rendang sejati dipun-masak alon-alon ngangge santen lan rempah ngantos asat awet; Pempek nyawijekake daging iwak kali lan glepung sagu; dene Papeda ngolah sari pati sagu kalih toya umob lan duduh iwak kunir.',
    },
    maknaFilosofis: {
      id: 'Dalam tradisi Rendang, empat bahan utamanya (daging, santan, cabai, dan pemasak bumbu) melambangkan keutuhan empat unsur adat Minangkabau; sajian kerucut Tumpeng memuliakan syukur antara bumi, manusia, dan Sang Pencipta; sementara Jamu dan motif batik Truntum–Sidomukti memancarkan doa kesehatan, kesabaran, dan kesejahteraan bersama.',
      en: 'Minangkabau elders read Rendang’s four core ingredients as pillars of communal balance, conical Tumpeng rice symbolizes gratitude uniting earth and heaven, and Jamu alongside Truntum batik express holistic care, patience, and mutual prosperity.',
      jw: 'Ing Minangkabau, sekawan bahan Rendang dados pralambang tatanan adat; Tumpeng dados wujud syukur dhateng Gusti; lan Jamu saha batik Truntum–Sidomukti nyimpen donga kasarasan lan karaharjan.',
    },
  },
];

/**
 * Mencari entri ensiklopedia budaya Nusantara yang paling relevan dengan pertanyaan pengguna
 * (mendukung kecocokan kata, frasa berspasi, maupun gabungan tanpa spasi seperti "tamansari" vs "taman sari").
 */
export function cariKonteksNusantara(pertanyaan: string, maxHasil = 2): EntriBudayaNusantara[] {
  const norm = pertanyaan
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9\s'-]/g, ' ');
  const normCompact = norm.replace(/[\s'-]+/g, '');
  const tokens = new Set(norm.split(/\s+/).filter((t) => t.length > 2));

  const terperingkat: Array<{ entri: EntriBudayaNusantara; skor: number }> = [];
  for (const entri of ENSIKLOPEDIA_NUSANTARA) {
    let skor = 0;
    for (const kw of entri.kataKunci) {
      const kwCompact = kw.replace(/[\s'-]+/g, '');
      if (kw.includes(' ')) {
        if (norm.includes(kw) || (kwCompact.length >= 5 && normCompact.includes(kwCompact))) {
          skor += 3.8;
        }
      } else if (tokens.has(kw)) {
        skor += 2.4;
      } else if (kw.length >= 4 && (norm.includes(kw) || normCompact.includes(kw))) {
        skor += 1.4;
      }
    }
    const teksWilayah = `${entri.wilayah.id} ${entri.wilayah.en} ${entri.judul.id} ${entri.judul.en}`.toLowerCase();
    for (const tok of tokens) {
      if (tok.length >= 4 && teksWilayah.includes(tok)) {
        skor += 0.85;
      }
    }
    if (skor >= 1.2) {
      terperingkat.push({ entri, skor });
    }
  }

  return terperingkat
    .sort((a, b) => b.skor - a.skor)
    .slice(0, maxHasil)
    .map((item) => item.entri);
}

/**
 * Cadangan pencarian tingkat wilayah provinsi/pulau jika kueri luring menyebut daerah di Indonesia
 * tetapi belum menyebut nama monumen/tradisi spesifik di entri utama.
 */
export function cariKonteksWilayahNusantara(
  pertanyaan: string,
  maxHasil = 2,
): EntriBudayaNusantara[] {
  const norm = pertanyaan
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = norm.split(/\s+/).filter((t) => t.length >= 4);
  if (tokens.length === 0) return [];

  const cocok: Array<{ entri: EntriBudayaNusantara; skor: number }> = [];
  for (const entri of ENSIKLOPEDIA_NUSANTARA) {
    const teksMeta = `${entri.wilayah.id} ${entri.wilayah.en} ${entri.judul.id}`.toLowerCase();
    let skor = 0;
    for (const t of tokens) {
      if (teksMeta.includes(t)) skor += 1.5;
    }
    if (skor > 0) {
      cocok.push({ entri, skor });
    }
  }
  return cocok
    .sort((a, b) => b.skor - a.skor)
    .slice(0, maxHasil)
    .map((item) => item.entri);
}
