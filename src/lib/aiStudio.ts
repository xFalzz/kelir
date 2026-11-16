import {
  DAFTAR_BEDAH_TWIN,
  LAKON_KIJANG_KENCANA,
  ambilTeks,
  type BahasaAktif,
  type KodeSumber,
  type MultiTeks,
  type SpesimenBedahId,
  type SpesimenBedahTwin,
} from '../content/pusaka.ts';
import { latinKeAksaraJawa } from './aksara.ts';
import { tentukanBahasaSuara } from './sulukNarasi.ts';

export const MODEL_AI_STUDIO = 'gemini-3.8-live' as const;

export interface KomparasiResult {
  idA: SpesimenBedahId;
  idB: SpesimenBedahId;
  bahasa: BahasaAktif;
  judulA: string;
  judulB: string;
  persamaan: string;
  perbedaanMaterial: string;
  titikTemuFilosofi: string;
  sumber: KodeSumber[];
  modelNama: typeof MODEL_AI_STUDIO;
  mode: 'gemini-3.8-live' | 'kurasi-lokal';
  latensiMs: number;
}

export interface PujanggaResult {
  tema: string;
  bahasa: BahasaAktif;
  guritJawa: string;
  terjemahan: string;
  aksaraJawa: string;
  catatanMakna: string;
  naskahSuara: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  audioBase64: string | null;
  mimeType: string | null;
  modePenyedia: 'gemini-3.8-live-audio' | 'web-speech-fallback';
  sumber: KodeSumber[];
  modelNama: typeof MODEL_AI_STUDIO;
  latensiMs: number;
}

export interface DalangSuaraResult {
  babakIdx: number;
  bahasa: BahasaAktif;
  naskah: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  audioBase64: string | null;
  mimeType: string | null;
  modePenyedia: 'gemini-3.8-live-audio' | 'web-speech-fallback';
  modelNama: typeof MODEL_AI_STUDIO;
  sumber: KodeSumber[];
}

export interface SoalKuisKurasi {
  id: string;
  bendaId: SpesimenBedahId;
  pertanyaan: MultiTeks;
  pilihan: [MultiTeks, MultiTeks, MultiTeks];
  indeksBenar: number;
  penjelasan: MultiTeks;
  sumber: KodeSumber[];
}

export const BANK_KUIS_S1_S7: SoalKuisKurasi[] = [
  {
    id: 'kuis-keris',
    bendaId: 'keris',
    pertanyaan: {
      id: 'Mengapa bilah Keris Mataram ditempa dengan teknik lipatan besi berlapis dan nikel pamor (S1)?',
      en: 'Why are Mataram keris blades forge-welded with alternate steel laminations and meteoric nickel pamor (S1)?',
      jw: 'Kenging menapa wilah Dhuwung Mataram katempa mawi lipatan wesi lan pamor nikel meteorit (S1)?',
    },
    pilihan: [
      {
        id: 'Menguatkan struktur ulet sekaligus memunculkan motif pamor setelah pelarutan warangan',
        en: 'Combines tough laminated strength with contrasting pamor patterns after arsenic-lime etching',
        jw: 'Nggabungake kekuatan lipatan wesi lan motif pamor sawise diwarangi',
      },
      {
        id: 'Agar bilah keris mudah dilipat menjadi dua saat disimpan di kotak',
        en: 'To fold the metal blade in half inside wooden travel boxes',
        jw: 'Supados wilah dhuwung saged kalempit dados kalih',
      },
      {
        id: 'Menjadikan bilah lebih ringan daripada bilah bambu kering',
        en: 'To make the forged steel lighter than hollowed bamboo reed',
        jw: 'Ndadosake bobot wesi langkung entheng tinimbang pring garing',
      },
    ],
    indeksBenar: 0,
    penjelasan: {
      id: 'Lipatan berulang menyatukan besi berkarbon dan pamor kaya nikel agar tahan lentur, lalu etsa warangan menampakkan pola Beras Wutah (S1).',
      en: 'Repeated forge folding fuses mild iron and nickel alloys before warangan etching reveals crystalline Beras Wutah ripples (S1).',
      jw: 'Lipatan wesi lan pamor nikel ndadosake wilah kuwat, lajeng ka-warangi supados medal motif Beras Wutah (S1).',
    },
    sumber: ['S1'],
  },
  {
    id: 'kuis-saron',
    bendaId: 'saron',
    pertanyaan: {
      id: 'Bagaimana rasio paduan perunggu gangsa terbaik dan teknik meredam nada pada Saron Slendro (S4)?',
      en: 'What alloy ratio forms resonant gangsa bronze keys and how does a player damp Saron notes (S4)?',
      jw: 'Kados pundi paduan gangsa Saron Slendro lan teknik pijetan kangge nyirep suwara (S4)?',
    },
    pilihan: [
      {
        id: 'Kuningan murni 100% yang dipukul bersamaan oleh dua pemain',
        en: 'Pure 100% rolled brass struck simultaneously with two mallets',
        jw: 'Kuningan murni tanpa timah ingkang kadhuthuk kalih tabuh',
      },
      {
        id: 'Paduan tembaga & timah (~78/22) serta teknik pijetan dengan jempol dan telunjuk kiri',
        en: 'Copper-tin (~78/22) bell bronze with left-hand thumb-index pinching (pijetan) on the previous key',
        jw: 'Paduan tembaga lan timah (~78/22) saha pijetan jempol lan panuduh kiwa',
      },
      {
        id: 'Besi tuang dingin dengan peredam kain sutra di atas tiap bilah',
        en: 'Cold cast iron muffled permanently under silk ribbons',
        jw: 'Wesi cor adhem ngangge tutup sutra wonten nginggil wilah',
      },
    ],
    indeksBenar: 1,
    penjelasan: {
      id: 'Gangsa bermutu (~78% tembaga, 22% timah) menghasilkan dengung Slendro jernih, sementara tangan kiri memijit bilah lama tepat saat tabuh kanan memukul bilah baru (S4).',
      en: 'High-tin gangsa (~78/22) sustains pentatonic bronze partials while left-hand pijetan damps the prior pitch cleanly on beat (S4).',
      jw: 'Gangsa (~78/22) ngasilake laras Slendro bening, dene asta kiwa mijet wilah sadurunge pas tabuh tengen muni (S4).',
    },
    sumber: ['S4'],
  },
  {
    id: 'kuis-batik',
    bendaId: 'batik',
    pertanyaan: {
      id: 'Konsep tata ruang Jawa apa yang digambarkan oleh empat bulatan aren mengitari satu titik pada Batik Kawung (S2)?',
      en: 'Which Javanese cosmological principle is encoded by four symmetrical palm fruits orbiting one center in Batik Kawung (S2)?',
      jw: 'Konsep kosmologi Jawi menapa ingkang kagambar ing sekawan bunderan Kawung ngubengi satunggal titik (S2)?',
    },
    pilihan: [
      {
        id: 'Kiblat Papat Lima Pancer — keseimbangan empat penjuru pada satu kesadaran pusat',
        en: 'Kiblat Papat Lima Pancer — four cardinal forces centered in one disciplined self',
        jw: 'Kiblat Papat Lima Pancer — sekawan keblat wonten ing satunggal punjer kesadaran',
      },
      {
        id: 'Sistem kalender Masehi dua belas bulan penuh',
        en: 'The twelve-month Gregorian solar administrative calendar',
        jw: 'Sistem tanggalan Masehi kalih welas wulan',
      },
      {
        id: 'Denah pelabuhan dagang pesisir abad kesembilan belas',
        en: 'Nineteenth-century colonial maritime harbor blueprint grid',
        jw: 'Denah plabuhan dagang pesisir abad kaping sangalas',
      },
    ],
    indeksBenar: 0,
    penjelasan: {
      id: 'Geometri empat elips melingkari pusat menjadi lambang penguasaan nafsu dari empat penjuru (Kiblat Papat Lima Pancer) serta kesabaran torehan canting malam & celup soga (S2).',
      en: 'Four symmetric elliptical lobes orbiting a core represent Kiblat Papat Lima Pancer self-mastery across all four directions (S2).',
      jw: 'Sekawan elips ngubengi punjer nyimbolake Kiblat Papat Lima Pancer minangka pangendhali diri ing sekawan keblat (S2).',
    },
    sumber: ['S2'],
  },
  {
    id: 'kuis-joglo',
    bendaId: 'joglo',
    pertanyaan: {
      id: 'Mengapa konstruksi kayu jati Pendopo Joglo dengan 4 Saka Guru dan pasak-purus tahan terhadap guncangan gempa bumi (S6)?',
      en: 'Why does the nail-free Pendopo Joglo frame of four Saka Guru columns and mortise-tenon joints resist seismic shocks (S6)?',
      jw: 'Kenging menapa struktur kayu jati Joglo mawi 4 Saka Guru lan pasak purus tahan goncangan lindhu (S6)?',
    },
    pilihan: [
      {
        id: 'Karena tiap tiang dicor menyatu dengan fondasi beton baja sepanjang 12 meter',
        en: 'Because every column is welded deep into reinforced steel-concrete caissons',
        jw: 'Amargi saben cagak dipun cor wesi beton kalih welas meter',
      },
      {
        id: 'Sambungan pasak-purus bebas paku memungkinkan pergeseran lentur yang meredam energi gempa tanpa patah',
        en: 'Dry mortise-and-tenon (purus-pasak) joints allow controlled ductile sway that dissipates lateral energy without snapping',
        jw: 'Sambungan purus-pasak tanpa paku saged nglentur nyerep energi lindhu supados boten tugel',
      },
      {
        id: 'Atap tajug dibangun dari lembaran timah tipis yang mengambang di atas air',
        en: 'Roof rafters are floated atop shallow water reservoirs inside Tumpang Sari beams',
        jw: 'Payon kadamel saking lembaran timah ingkang ngambang ing toya',
      },
    ],
    indeksBenar: 1,
    penjelasan: {
      id: 'Sistem rangka kayu kering berumpak batu serta pengunci Tumpang Sari membagi gaya tekan dan lentur secara fleksibel saat gempa terjadi (S6).',
      en: 'Friction-fit timber tenons resting on stone umpak bases flex and damp seismic shear instead of fracturing stiff welds (S6).',
      jw: 'Rangka kayu jati mawa umpak watu lan tumpang sari meredam getaran lindhu lumantar sambungan pasak fleksibel (S6).',
    },
    sumber: ['S6'],
  },
  {
    id: 'kuis-wayang',
    bendaId: 'wayang',
    pertanyaan: {
      id: 'Apa fungsi lampu minyak kelapa bersayap Garuda (Blencong) dan tangkai tanduk kerbau (Cempurit) pada pertunjukan Kelir (S3, S5)?',
      en: 'What roles do the Garuda-winged Blencong coconut-oil lamp and horn Cempurit rods perform in Wayang Kulit (S3, S5)?',
      jw: 'Menapa kagunanipun pelita Blencong lan gagang sungu kebo Cempurit ing pagelaran Kelir (S3, S5)?',
    },
    pilihan: [
      {
        id: 'Blencong memproyeksikan bayangan bergradasi lewat tatahan kulit kerbau yang digerakkan oleh cempurit dan tuding',
        en: 'The flickering Blencong casts live shadows through chiseled leather filigree animated via Cempurit & Tuding rods',
        jw: 'Blencong nyipta wewayangan urip saking tatahan wacucal kebo ingkang kaobahake cempurit lan tuding',
      },
      {
        id: 'Cempurit bertugas menyetel frekuensi suara gong agar tidak terdengar',
        en: 'Cempurit rods mute all gamelan bronze keys silently behind the curtain',
        jw: 'Cempurit kangge nutup swara gamelan supados sepi',
      },
      {
        id: 'Blencong berfungsi mendinginkan layar blacu menjadi warna biru gelap',
        en: 'The oil flame dyes the white blacu cotton screen permanent indigo blue',
        jw: 'Lenga klentik kangge nyecel kain kelir dados biru tuwa',
      },
    ],
    indeksBenar: 0,
    penjelasan: {
      id: 'Tatahan krawangan wacucal kebo dan prada emas membiaskan nyala api Blencong ke kain blacu Kelir sembari diartikulasi dalang lewat gapit Cempurit & Tuding (S3, S5).',
      en: 'Light passes through perforated buffalo hide while golden prada reflects highlights across the cotton Kelir screen (S3, S5).',
      jw: 'Sorot Blencong nembus tatahan wacucal kebo dhumateng layar blacu nalika dhalang ngobahake cempurit lan tuding (S3, S5).',
    },
    sumber: ['S3', 'S5'],
  },
  {
    id: 'kuis-hanacaraka',
    bendaId: 'hanacaraka',
    pertanyaan: {
      id: 'Berapa jumlah aksara dasar Nglegena pada Hanacaraka standar Unicode U+A980–U+A9DF (S7)?',
      en: 'How many fundamental Nglegena consonant syllables form the standard Hanacaraka script encoded in Unicode U+A980–U+A9DF (S7)?',
      jw: 'Pinten cacahipun aksara dhasar Nglegena ing Hanacaraka standar Unicode U+A980–U+A9DF (S7)?',
    },
    pilihan: [
      { id: '12 aksara', en: '12 glyphs', jw: '12 aksara' },
      { id: '20 aksara (Ha–Na–Ca–Ra–Ka hingga Ma–Ga–Ba–Tha–Nga)', en: '20 consonant syllables (Ha–Na–Ca–Ra–Ka through Ma–Ga–Ba–Tha–Nga)', jw: '20 aksara (Ha–Na–Ca–Ra–Ka dumugi Ma–Ga–Ba–Tha–Nga)' },
      { id: '26 huruf Latin tanpa pasangan', en: '26 Latin letters without conjuncts', jw: '26 aksara Latin tanpa pasangan' },
    ],
    indeksBenar: 1,
    penjelasan: {
      id: 'Dua puluh aksara abugida Jawa memiliki vokal inheren /a/ serta dilengkapi Pasangan dan Sandhangan di blok resmi Unicode U+A980–U+A9DF (S7).',
      en: 'All 20 Javanese abugida syllables carry an inherent /a/ vowel modified by Pasangan conjuncts and Sandhangan diacritics inside Unicode U+A980–U+A9DF (S7).',
      jw: 'Kalih dasa aksara Nglegena gadhah swara dhasar /a/, kapepakan Pasangan lan Sandhangan ing Unicode U+A980–U+A9DF (S7).',
    },
    sumber: ['S7'],
  },
];

function cariTwin(id: SpesimenBedahId): SpesimenBedahTwin {
  return DAFTAR_BEDAH_TWIN.find((b) => b.id === id) ?? DAFTAR_BEDAH_TWIN[0];
}

function gabungSumberUnik(a: KodeSumber[], b: KodeSumber[]): KodeSumber[] {
  return [...new Set([...a, ...b])];
}

/** Perbandingan kuratorial dua pusaka berbasis metadata & S1-S7 tanpa AI eksternal. */
export function bandingkanPusakaLokal(
  idA: SpesimenBedahId,
  idB: SpesimenBedahId,
  bahasa: BahasaAktif,
): KomparasiResult {
  const a = cariTwin(idA);
  const b = cariTwin(idB);
  const judulA = ambilTeks(a.nama, bahasa);
  const judulB = ambilTeks(b.nama, bahasa);
  const katA = ambilTeks(a.kategori, bahasa);
  const katB = ambilTeks(b.kategori, bahasa);
  const asalA = ambilTeks(a.asal, bahasa);
  const asalB = ambilTeks(b.asal, bahasa);
  const sumber = gabungSumberUnik(a.sumber, b.sumber);

  const matA = a.titikInfo[0]?.material ? ambilTeks(a.titikInfo[0].material, bahasa) : katA;
  const matB = b.titikInfo[0]?.material ? ambilTeks(b.titikInfo[0].material, bahasa) : katB;
  const cadA = a.parameterCad?.[0] ? `${ambilTeks(a.parameterCad[0].label, bahasa)}: ${ambilTeks(a.parameterCad[0].nilai, bahasa)}` : '';
  const cadB = b.parameterCad?.[0] ? `${ambilTeks(b.parameterCad[0].label, bahasa)}: ${ambilTeks(b.parameterCad[0].nilai, bahasa)}` : '';

  if (bahasa === 'en') {
    return {
      idA: a.id,
      idB: b.id,
      bahasa,
      judulA,
      judulB,
      persamaan:
        a.id === b.id
          ? `${judulA} shares its own unified ${katA} engineering discipline documented across ${sumber.join(', ')}, linking precision handcraft with living community ritual.`
          : `Both ${judulA} (${katA}) and ${judulB} (${katB}) preserve disciplined multi-stage Javanese craftsmanship curated across ${sumber.join(', ')}. Each specimen pairs structural tolerances (${cadA || asalA}; ${cadB || asalB}) with ethical contemplation.`,
      perbedaanMaterial: `${judulA} primarily centers on ${matA} sourced around ${asalA}, whereas ${judulB} relies on ${matB} centered around ${asalB}.`,
      titikTemuFilosofi: `${judulA}: "${ambilTeks(a.filosofi, 'en')}" — mirrored by ${judulB}: "${ambilTeks(b.filosofi, 'en')}"`,
      sumber,
      modelNama: MODEL_AI_STUDIO,
      mode: 'kurasi-lokal',
      latensiMs: 8,
    };
  }

  if (bahasa === 'jw' || bahasa === 'aks') {
    const hasilJw: KomparasiResult = {
      idA: a.id,
      idB: b.id,
      bahasa,
      judulA,
      judulB,
      persamaan:
        a.id === b.id
          ? `${judulA} kagungan disiplin kriya ${katA} ingkang utuh miturut arsip ${sumber.join(', ')}.`
          : `Kalih-kalihipun — ${judulA} (${katA}) saha ${judulB} (${katB}) — sami-sami nyawijekake rekayasa presisi lan piwulang luhur miturut pustaka ${sumber.join(', ')}.`,
      perbedaanMaterial: `${judulA} ngandelake ${matA} (${asalA}), dene ${judulB} kagawe saking ${matB} (${asalB}).`,
      titikTemuFilosofi: `${judulA}: "${ambilTeks(a.filosofi, 'jw')}" — jumbuh kalih ${judulB}: "${ambilTeks(b.filosofi, 'jw')}"`,
      sumber,
      modelNama: MODEL_AI_STUDIO,
      mode: 'kurasi-lokal',
      latensiMs: 8,
    };
    return hasilJw;
  }

  return {
    idA: a.id,
    idB: b.id,
    bahasa,
    judulA,
    judulB,
    persamaan:
      a.id === b.id
        ? `${judulA} merepresentasikan satu kesatuan utuh disiplin ${katA} dalam arsip ${sumber.join(', ')}, menggabungkan presisi teknis (${cadA || asalA}) dan laku filosofis.`
        : `Keduanya — ${judulA} (${katA}) dan ${judulB} (${katB}) — bertumpu pada kesabaran proses bertahap serta keselarasan manusia dengan alam menurut catatan ${sumber.join(', ')}.`,
    perbedaanMaterial: `${judulA} bertumpu pada material ${matA} (${cadA || asalA}), sedangkan ${judulB} dibangun dengan ${matB} (${cadB || asalB}).`,
    titikTemuFilosofi: `${judulA}: "${ambilTeks(a.filosofi, 'id')}" Bersanding dengan ${judulB}: "${ambilTeks(b.filosofi, 'id')}"`,
    sumber,
    modelNama: MODEL_AI_STUDIO,
    mode: 'kurasi-lokal',
    latensiMs: 8,
  };
}

/** Pembuat bait puitik Jawa, konversi aksara U+A980, dan naskah suara deterministik S1-S7. */
export function susunPujanggaLokal(temaInput: string, bahasa: BahasaAktif): PujanggaResult {
  const temaBersih = temaInput.trim() || 'Harmoni Pendopo & Pusaka';
  const low = temaBersih.toLowerCase();

  let guritJawa =
    'Sangkan paraning dumadi, eling lan waspada,\nMemayu hayuning bawana, ngreksa budaya nuswantara.';
  let artiId =
    'Menyadari asal dan tujuan hidup dengan sikap eling serta waspada;\nMemperindah harmoni dunia, menjaga warisan budaya nusantara.';
  let artiEn =
    'Remember origin and destination with mindful vigilance;\nSteward the beauty and balance of our living heritage.';
  let maknaId =
    'Terinspirasi konsep Sangkan Paraning Dumadi (S1, S3) & Memayu Hayuning Bawana (S2, S4, S6).';
  let maknaEn =
    'Inspired by Sangkan Paraning Dumadi (S1, S3) and Memayu Hayuning Bawana (S2, S4, S6).';
  let maknaJw =
    'Kapetik saking piwulang Sangkan Paraning Dumadi (S1, S3) lan Memayu Hayuning Bawana (S2, S4, S6).';
  let sumber: KodeSumber[] = ['S1', 'S2', 'S6'];

  if (low.includes('keris') || low.includes('pamor') || low.includes('besi') || low.includes('blade')) {
    guritJawa =
      'Wesi lan pamor manunggal ing latu sabar,\nLuk lima nyimbolake watak satriya kang jembar.';
    artiId =
      'Besi dan pamor menyatu di perapian kesabaran;\nLengkung lima melambangkan kelapangan budi seorang kesatria.';
    artiEn =
      'Steel and meteoric nickel unite inside the forge of patience;\nFive curved waves embody a knight’s broad temperance.';
    maknaId = 'Selaras dengan disiplin tempa Tosan Aji Mataram dan luk Pandawa Lima (S1).';
    maknaEn = 'Grounded in Mataram laminated keris metallurgy and Luk Lima philosophy (S1).';
    maknaJw = 'Selaras kalih teknik tempa Tosan Aji Mataram lan filsafat Luk Gangsal (S1).';
    sumber = ['S1'];
  } else if (low.includes('batik') || low.includes('kawung') || low.includes('soga') || low.includes('kain')) {
    guritJawa =
      'Titik pancer ing tengahing kiblat papat,\nCanting malam ngukir rasa kanthi taliti lan tepat.';
    artiId =
      'Satu titik pusat di antara empat penjuru angin;\nCanting malam mengukir ketulusan batin dengan ketelitian tinggi.';
    artiEn =
      'One centered awareness holding the four compass points;\nCopper canting wax inscribes patient beauty onto cotton cloth.';
    maknaId = 'Berakar pada motif Batik Kawung & pewarnaan soga alam (S2).';
    maknaEn = 'Rooted in Batik Kawung Kiblat Papat geometry and natural soga dyes (S2).';
    maknaJw = 'Kados piwulang Batik Tulis Kawung lan celup soga alam (S2).';
    sumber = ['S2'];
  } else if (low.includes('gamelan') || low.includes('saron') || low.includes('slendro') || low.includes('musik')) {
    guritJawa =
      'Nem wilah gangsa muni selaras ing laras slendro,\nPijetan kiwa njaga tentrem tanpa ngalahake swara liya.';
    artiId =
      'Enam bilah perunggu bernada sejajar dalam laras Slendro;\nPijetan tangan kiri merawat harmoni tanpa meniadakan suara sesama.';
    artiEn =
      'Six bronze bars sing in mutual Slendro alignment;\nLeft-hand damping guards harmony without drowning neighbor tones.';
    maknaId = 'Mengacu pada etika musikal Saron Barung & pengendalian gema (S4).';
    maknaEn = 'Reflects Saron Barung Slendro acoustic discipline and mutual listening (S4).';
    maknaJw = 'Miturut tatanan karawitan Saron Slendro lan teknik pijetan (S4).';
    sumber = ['S4'];
  } else if (low.includes('wayang') || low.includes('kelir') || low.includes('dalang') || low.includes('rama')) {
    guritJawa =
      'Sorot blencong madhangi layar blacu putih,\nSabetan dhalang nuntun manungsa marang budi kang resik.';
    artiId =
      'Cahaya pelita blencong menerangi layar blacu putih;\nGerak wayang menuntun jiwa manusia menuju kejernihan budi.';
    artiEn =
      'Warm Blencong flame animates shadows on the pure white screen;\nThe puppeteer’s grace guides human spirit toward clarity.';
    maknaId = 'Berpijak pada simfoni bayangan Blencong & epos Pakeliran (S3, S5).';
    maknaEn = 'Grounded in Pakeliran shadow philosophy and Ramayana ethics (S3, S5).';
    maknaJw = 'Adhedhasar falsafah Blencong saha pagelaran Ringgit Wacucal (S3, S5).';
    sumber = ['S3', 'S5'];
  }

  const { kodeBcp47 } = tentukanBahasaSuara(bahasa);
  const terjemahan = bahasa === 'en' ? artiEn : artiId;
  const catatanMakna = bahasa === 'en' ? maknaEn : bahasa === 'jw' || bahasa === 'aks' ? maknaJw : maknaId;
  const naskahSuara =
    bahasa === 'en'
      ? `${guritJawa.replace('\n', ' ')}. ${artiEn.replace('\n', ' ')}`
      : `${guritJawa.replace('\n', ' ')}. ${bahasa === 'id' ? artiId.replace('\n', ' ') : maknaJw}`;

  return {
    tema: temaBersih,
    bahasa,
    guritJawa,
    terjemahan,
    aksaraJawa: latinKeAksaraJawa(guritJawa),
    catatanMakna,
    naskahSuara,
    kodeBcp47,
    audioBase64: null,
    mimeType: null,
    modePenyedia: 'web-speech-fallback',
    sumber,
    modelNama: MODEL_AI_STUDIO,
    latensiMs: 12,
  };
}

/** Naskah narasi Dalang berbahasa sesuai UI aktif untuk Babak Pakeliran 3D (Halaman 04). */
export function susunNaskahDalangBabak(babakIdx: number, bahasa: BahasaAktif): {
  naskah: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  bahasaSuara: 'id' | 'en' | 'jw';
  sumber: KodeSumber[];
} {
  const daftar = LAKON_KIJANG_KENCANA.daftarBabak;
  const bab = daftar[Math.max(0, Math.min(daftar.length - 1, babakIdx))] ?? daftar[0];
  const { bahasaSuara, kodeBcp47 } = tentukanBahasaSuara(bahasa);
  const loc = ambilTeks(bab.lokasi, bahasaSuara);
  const title = ambilTeks(bab.judul, bahasaSuara);
  const nar = ambilTeks(bab.narasiDalang, bahasaSuara);
  const suluk = ambilTeks(bab.suluk, bahasaSuara);

  const naskah =
    bahasaSuara === 'en'
      ? `Act ${bab.nomor}, ${title}, at ${loc}. ${nar} ${suluk}`
      : bahasaSuara === 'jw'
        ? `Babak ${bab.nomor}, ${title}, wonten ing ${loc}. ${nar} ${suluk}`
        : `Babak ${bab.nomor}, ${title}, di ${loc}. ${nar} ${suluk}`;

  return {
    naskah,
    kodeBcp47,
    bahasaSuara,
    sumber: bab.sumber,
  };
}

async function panggilEndpointStudio<T>(payload: Record<string, unknown>, timeoutMs = 26000): Promise<T | null> {
  if (typeof fetch === 'undefined') return null;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/ai-studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

/** Meminta komparasi dua pusaka dari gemini-3.8-live dengan fallback S1-S7 instan. */
export async function mintaKomparasiAI(
  idA: SpesimenBedahId,
  idB: SpesimenBedahId,
  bahasa: BahasaAktif,
): Promise<KomparasiResult> {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await panggilEndpointStudio<KomparasiResult>({
    tugas: 'banding',
    idA,
    idB,
    bahasa,
  });
  if (data && data.persamaan && data.perbedaanMaterial) {
    return {
      ...data,
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return bandingkanPusakaLokal(idA, idB, bahasa);
}

/** Meminta gubahan puitik Jawa, Hanacaraka, dan suara WAV dari gemini-3.8-live dengan fallback lokal. */
export async function mintaPujanggaAI(
  tema: string,
  bahasa: BahasaAktif,
): Promise<PujanggaResult> {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await panggilEndpointStudio<PujanggaResult>(
    {
      tugas: 'pujangga',
      tema,
      bahasa,
    },
    28000,
  );
  if (data && data.guritJawa && data.aksaraJawa) {
    return {
      ...data,
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return susunPujanggaLokal(tema, bahasa);
}

/** Meminta audio suara Dalang WAV gemini-3.8-live untuk babak Pakeliran aktif dengan fallback Web Speech. */
export async function mintaSuaraDalangBabak(
  babakIdx: number,
  bahasa: BahasaAktif,
): Promise<DalangSuaraResult> {
  const data = await panggilEndpointStudio<DalangSuaraResult>(
    {
      tugas: 'dalang-suara',
      babakIdx,
      bahasa,
    },
    28000,
  );
  if (data && data.naskah) {
    return data;
  }
  const fallback = susunNaskahDalangBabak(babakIdx, bahasa);
  return {
    babakIdx,
    bahasa,
    naskah: fallback.naskah,
    kodeBcp47: fallback.kodeBcp47,
    audioBase64: null,
    mimeType: null,
    modePenyedia: 'web-speech-fallback',
    modelNama: MODEL_AI_STUDIO,
    sumber: fallback.sumber,
  };
}
