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
      en: 'Every institution manifests Tri Hita Karana—harmony among the divine (Parahyangan), human society (Pawongan), and the natural ecology (Palemahan).',
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
      id: 'Ungkapan Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa bermakna "berbeda-beda namun tetap satu jua, tiada kebenaran yang mendua"—mengajarkan toleransi lintas keyakinan, tradisi gotong royong sebagai etos komunal desa Nusantara, serta kesadaran menjaga warisan sejarah bangsa.',
      en: 'Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa affirms unity in diversity and interfaith tolerance alongside Indonesia’s enduring communal ethic of Gotong Royong.',
      jw: 'Sesanti Bhinneka Tunggal Ika mulangake bilih sanajan maneka warna nanging tetep manunggal, sesarengan kalih semangat gotong royong.',
    },
  },
];

/**
 * Mencari entri ensiklopedia budaya Nusantara yang paling relevan dengan pertanyaan pengguna
 * untuk memperkaya akurasi agen AI sekaligus menyediakan jawaban kuratorial mendalam saat luring.
 */
export function cariKonteksNusantara(pertanyaan: string, maxHasil = 2): EntriBudayaNusantara[] {
  const norm = pertanyaan
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9\s'-]/g, ' ');
  const tokens = new Set(norm.split(/\s+/).filter((t) => t.length > 2));

  const terperingkat: Array<{ entri: EntriBudayaNusantara; skor: number }> = [];
  for (const entri of ENSIKLOPEDIA_NUSANTARA) {
    let skor = 0;
    for (const kw of entri.kataKunci) {
      if (kw.includes(' ')) {
        if (norm.includes(kw)) skor += 3.5;
      } else if (tokens.has(kw)) {
        skor += 2.2;
      } else if (norm.includes(kw)) {
        skor += 1.2;
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
