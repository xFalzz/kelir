import {
  DAFTAR_BEDAH_TWIN,
  ambilTeks,
  type BahasaAktif,
  type KodeSumber,
  type MultiTeks,
  type SpesimenBedahId,
  type SpesimenBedahTwin,
} from '../content/pusaka.ts';
import { latinKeAksaraJawa } from './aksara.ts';
import {
  auditDanBersihkanOutputAI,
  bersihkanInputPengguna,
  memilikiJangkarBudaya,
  validasiCatatanTur,
  validasiInputKrama,
  validasiTemaPujangga,
  BATAS_KARAKTER_TUR,
} from './aiGuardrail.ts';
import {
  MODEL_AI_STUDIO,
  mintaSuaraDalangBabak,
  panggilEndpointStudio,
  susunNaskahDalangBabak,
  type DalangSuaraResult,
} from './dalangVoice.ts';
import { tentukanBahasaSuara } from './sulukNarasi.ts';

export { MODEL_AI_STUDIO, mintaSuaraDalangBabak, susunNaskahDalangBabak, type DalangSuaraResult };

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
  mode: 'pamomong-live' | 'kurasi-lokal';
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
  modePenyedia: 'pamomong-live-audio' | 'web-speech-fallback';
  sumber: KodeSumber[];
  modelNama: typeof MODEL_AI_STUDIO;
  latensiMs: number;
  statusAman?: boolean;
  pesanKeamanan?: string;
}

export interface KramaAksaraResult {
  kalimatAsal: string;
  bahasa: BahasaAktif;
  ngoko: string;
  kramaInggil: string;
  aksaraJawa: string;
  catatanEtika: string;
  naskahSuara: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  audioBase64: string | null;
  mimeType: string | null;
  modePenyedia: 'pamomong-live-audio' | 'web-speech-fallback';
  sumber: KodeSumber[];
  modelNama: typeof MODEL_AI_STUDIO;
  latensiMs: number;
  statusAman?: boolean;
  pesanKeamanan?: string;
}

export type MinatTurId = 'semua' | 'tosan' | 'arsitektur' | 'karawitan' | 'pakeliran';
export type DurasiTurId = 'kilat' | 'mendalam';

export interface LangkahRuteTur {
  judul: string;
  ruang: 'twin' | 'koleksi' | 'pakeliran' | 'kawruh';
  bendaId?: SpesimenBedahId;
  titikId?: string;
  trackIdx?: number;
  babakIdx?: number;
  alasan: string;
  sumber: KodeSumber[];
}

export interface RuteTurResult {
  minat: MinatTurId;
  durasi: DurasiTurId;
  catatan: string;
  bahasa: BahasaAktif;
  ringkasanRute: string;
  estimasiMenit: number;
  langkah: LangkahRuteTur[];
  sumber: KodeSumber[];
  modelNama: typeof MODEL_AI_STUDIO;
  mode: 'pamomong-live' | 'kurasi-lokal';
  latensiMs: number;
  statusAman?: boolean;
  pesanKeamanan?: string;
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
  const tekA = a.titikInfo[0]?.fungsiTeknis ? ambilTeks(a.titikInfo[0].fungsiTeknis, bahasa) : '';
  const tekB = b.titikInfo[0]?.fungsiTeknis ? ambilTeks(b.titikInfo[0].fungsiTeknis, bahasa) : '';
  const cadA = (a.parameterCad ?? [])
    .slice(0, 2)
    .map((p) => `${ambilTeks(p.label, bahasa)}: ${ambilTeks(p.nilai, bahasa)}`)
    .join('; ');
  const cadB = (b.parameterCad ?? [])
    .slice(0, 2)
    .map((p) => `${ambilTeks(p.label, bahasa)}: ${ambilTeks(p.nilai, bahasa)}`)
    .join('; ');

  if (bahasa === 'en') {
    return {
      idA: a.id,
      idB: b.id,
      bahasa,
      judulA,
      judulB,
      persamaan:
        a.id === b.id
          ? `${judulA} embodies a unified ${katA} discipline documented across ${sumber.join(', ')}, uniting rigorous physical tolerances (${cadA || asalA}) with ceremonial symbolism and community transmission.`
          : `Both ${judulA} (${katA}) and ${judulB} (${katB}) exemplify patient multi-stage Nusantara craftsmanship grounded in ${sumber.join(', ')}. Each integrates material proportioning and ergonomic balance with enduring social-ethical instruction.`,
      perbedaanMaterial: `${judulA} centers on ${matA} (${cadA || asalA})${tekA ? ` engineered to ${tekA.toLowerCase()}` : ''}; by contrast, ${judulB} is formed from ${matB} (${cadB || asalB})${tekB ? ` designed for ${tekB.toLowerCase()}` : ''}. Conservation therefore differs markedly between their surfaces.`,
      titikTemuFilosofi: `${judulA}: ${ambilTeks(a.filosofi, 'en')} In dialogue with ${judulB}: ${ambilTeks(b.filosofi, 'en')}`,
      sumber,
      modelNama: MODEL_AI_STUDIO,
      mode: 'kurasi-lokal',
      latensiMs: 8,
    };
  }

  if (bahasa === 'jw' || bahasa === 'aks') {
    return {
      idA: a.id,
      idB: b.id,
      bahasa,
      judulA,
      judulB,
      persamaan:
        a.id === b.id
          ? `${judulA} kagungan disiplin kriya ${katA} ingkang utuh miturut arsip ${sumber.join(', ')} kanthi presisi ukuran (${cadA || asalA}) saha piwulang luhur.`
          : `Kalih-kalihipun — ${judulA} (${katA}) lan ${judulB} (${katB}) — sami-sami ngutamakaken kasabaran garap empu, presisi konstruksi, saha selaras kalih alam miturut pustaka ${sumber.join(', ')}.`,
      perbedaanMaterial: `${judulA} ngandelake ${matA} (${cadA || asalA}), dene ${judulB} kagawe saking ${matB} (${cadB || asalB}) ingkang mbutuhake tata pangreksan beda.`,
      titikTemuFilosofi: `${judulA}: ${ambilTeks(a.filosofi, 'jw')} Jumbuh kalih ${judulB}: ${ambilTeks(b.filosofi, 'jw')}`,
      sumber,
      modelNama: MODEL_AI_STUDIO,
      mode: 'kurasi-lokal',
      latensiMs: 8,
    };
  }

  return {
    idA: a.id,
    idB: b.id,
    bahasa,
    judulA,
    judulB,
    persamaan:
      a.id === b.id
        ? `${judulA} merupakan satu kesatuan utuh disiplin ${katA} dalam arsip ${sumber.join(', ')} yang memadukan presisi rekayasa fisik (${cadA || asalA}) dengan kesadaran budaya turun-temurun.`
        : `Keduanya — ${judulA} (${katA}) dan ${judulB} (${katB}) — sama-sama menuntut penguasaan teknik bertahap lintas generasi, ketelitian proporsi material, serta fungsi edukasi nilai budaya menurut pustaka ${sumber.join(', ')}.`,
    perbedaanMaterial: `${judulA} bertumpu pada ${matA} (${cadA || asalA})${tekA ? ` dengan fungsi teknis ${tekA.toLowerCase()}` : ''}, sedangkan ${judulB} dibangun menggunakan ${matB} (${cadB || asalB})${tekB ? ` yang menonjolkan ${tekB.toLowerCase()}` : ''}. Konservasi material keduanya menuntut perlakuan pelestarian yang khas.`,
    titikTemuFilosofi: `${judulA}: ${ambilTeks(a.filosofi, 'id')} Bersanding erat dengan ${judulB}: ${ambilTeks(b.filosofi, 'id')}`,
    sumber,
    modelNama: MODEL_AI_STUDIO,
    mode: 'kurasi-lokal',
    latensiMs: 8,
  };
}

/** Pembuat bait puitik Jawa, konversi aksara U+A980, dan naskah suara deterministik. */
export function susunPujanggaLokal(temaInput: string, bahasa: BahasaAktif): PujanggaResult {
  const validasi = validasiTemaPujangga(temaInput, bahasa);
  const temaBersih = validasi.temaBersih;
  const low = temaBersih.toLowerCase();

  let guritJawa =
    'Sangkan paraning dumadi, eling lan waspada,\nMemayu hayuning bawana, ngreksa budaya nuswantara.';
  let artiId =
    'Menyadari asal dan tujuan hidup dengan sikap eling serta waspada;\nMemperindah harmoni dunia, menjaga warisan budaya nusantara.';
  let artiEn =
    'Remember origin and destination with mindful vigilance;\nSteward the beauty and balance of our living archipelago heritage.';
  let maknaId =
    'Pitutur luhur ini memadukan kesadaran diri Sangkan Paraning Dumadi dan tanggung jawab ekologis-sosial Memayu Hayuning Bawana (S1, S2, S6).';
  let maknaEn =
    'Synthesizes self-awareness (Sangkan Paraning Dumadi) with stewardship toward earthly harmony (Memayu Hayuning Bawana) across S1, S2, and S6.';
  let maknaJw =
    'Nyawijekake piwulang Sangkan Paraning Dumadi lan kewajiban Memayu Hayuning Bawana kangge njagi kabudayan Jawi (S1, S2, S6).';
  let sumber: KodeSumber[] = ['S1', 'S2', 'S6'];

  if (low.includes('keris') || low.includes('pamor') || low.includes('besi') || low.includes('blade')) {
    guritJawa =
      'Wesi lan pamor manunggal ing latu sabar,\nLuk lima nyimbolake watak satriya kang jembar.';
    artiId =
      'Besi dan pamor menyatu di perapian kesabaran;\nLengkung lima melambangkan kelapangan budi seorang kesatria.';
    artiEn =
      'Steel and meteoric nickel unite inside the forge of patience;\nFive curved waves embody a knight’s broad temperance.';
    maknaId =
      'Pencampuran besi inti dan nikel meteorit lewat lipatan tempa berulang mencerminkan penyatuan keteguhan hati dan kerendahan budi dalam etika Tosan Aji (S1).';
    maknaEn =
      'Mirroring laminated steel and meteoric nickel forging, the verse equates metallurgical endurance with balanced leadership under Luk Lima ethics (S1).';
    maknaJw =
      'Penyatuan wesi lan pamor nikel ing pawon empu nglambangaken keteguhan manah lan budi pekerti luhur Tosan Aji (S1).';
    sumber = ['S1'];
  } else if (low.includes('batik') || low.includes('kawung') || low.includes('soga') || low.includes('kain') || low.includes('tenun')) {
    guritJawa =
      'Titik pancer ing tengahing kiblat papat,\nCanting malam ngukir rasa kanthi taliti lan tepat.';
    artiId =
      'Satu titik pusat di antara empat penjuru angin;\nCanting malam mengukir ketulusan batin dengan ketelitian tinggi.';
    artiEn =
      'One centered awareness holding the four compass points;\nWax and handwoven dye inscribe patient beauty onto cloth.';
    maknaId =
      'Geometri empat elips mengelilingi pusat melambangkan keseimbangan batin dari segala arah, ditempa ketelatenan torehan malam dan celupan pewarna alam (S2).';
    maknaEn =
      'Rooted in Kiblat Papat Lima Pancer symmetry and painstaking natural soga dyeing, reminding artisans that beauty arises from patience (S2).';
    maknaJw =
      'Pola Kiblat Papat Lima Pancer lan telatenipun mbatik malam saha soga alam mulangaken katentremaning jiwa (S2).';
    sumber = low.includes('tenun') ? [] : ['S2'];
  } else if (low.includes('gamelan') || low.includes('saron') || low.includes('slendro') || low.includes('musik') || low.includes('angklung') || low.includes('sasando')) {
    guritJawa =
      'Nem wilah gangsa muni selaras ing laras slendro,\nPijetan kiwa njaga tentrem tanpa ngalahake swara liya.';
    artiId =
      'Enam bilah perunggu bernada sejajar dalam laras Slendro;\nPijetan tangan kiri merawat harmoni tanpa meniadakan suara sesama.';
    artiEn =
      'Six bronze bars sing in mutual alignment;\nCareful damping guards shared harmony without drowning neighbor voices.';
    maknaId =
      'Dalam tradisi ansambel Nusantara, keindahan suara tidak lahir dari satu pemain paling keras, melainkan pengendalian gema (pijetan) demi ruang dialog bersama (S4).';
    maknaEn =
      'Across archipelago ensemble ethics, musical grace depends on mutual damping (pijetan) and listening so every voice shines harmoniously (S4).';
    maknaJw =
      'Ing jagad karawitan, kaendahan swara tuwuh saking pangendhalian gema supados saben instrumen saged muni kanthi selaras (S4).';
    sumber = ['S4'];
  } else if (low.includes('wayang') || low.includes('kelir') || low.includes('dalang') || low.includes('rama')) {
    guritJawa =
      'Sorot blencong madhangi layar blacu putih,\nSabetan dhalang nuntun manungsa marang budi kang resik.';
    artiId =
      'Cahaya pelita blencong menerangi layar blacu putih;\nGerak wayang menuntun jiwa manusia menuju kejernihan budi.';
    artiEn =
      'Warm Blencong flame animates shadows on the pure white screen;\nThe puppeteer’s grace guides human spirit toward clarity.';
    maknaId =
      'Layar kelir menjadi cermin kehidupan tempat bayangan baik-buruk bertemu cahaya pelita Blencong sebagai lambang kebijaksanaan ilahi (S3, S5).';
    maknaEn =
      'Grounded in Pakeliran shadow philosophy where the flickering oil lamp illuminates moral choices projected across the white cloth screen (S3, S5).';
    maknaJw =
      'Kelir dados pangilon gesang nalika sorot Blencong nuntun pambeda antarane watak luhur lan angkara ing lakon purwa (S3, S5).';
    sumber = ['S3', 'S5'];
  } else if (low.includes('joglo') || low.includes('pendopo') || low.includes('pendhapa') || low.includes('rumah') || low.includes('gadang') || low.includes('tongkonan')) {
    guritJawa =
      'Saka guru ngadeg jejeg tanpa paku wesi,\nTumpang sari ngayomi sesami ing bumi kang lestari.';
    artiId =
      'Tiang utama berdiri kokoh tanpa paku besi;\nSusunan atap bertumpuk menaungi sesama di bumi yang lestari.';
    artiEn =
      'Main pillars stand upright on stone footings without rigid iron;\nStepped timber rafters shelter community in harmony with the earth.';
    maknaId =
      'Arsitektur tradisional Nusantara memilih kelenturan sambungan kayu dan sendi batu agar menyelaraskan diri dengan dinamika bumi dan ruang musyawarah terbuka (S6).';
    maknaEn =
      'Traditional archipelago timber architecture embraces ductile joinery and open gathering spaces to live in resilience alongside seismic terrain (S6).';
    maknaJw =
      'Arsitektur Jawi lan Nuswantara ngutamakaken kelenturan sambungan kayu saha papan musyawarah terbuka tumrap bebrayan (S6).';
    sumber = low.includes('gadang') || low.includes('tongkonan') ? [] : ['S6'];
  } else if (low.includes('aksara') || low.includes('hanacaraka') || low.includes('lontara') || low.includes('sastra')) {
    guritJawa =
      'Aksara kalih dasa nyimpen piwulang rasa,\nNgrakit tembung luhur dadi pepadhang jaman langgeng ing mangsa.';
    artiId =
      'Dua puluh aksara menyimpan kearifan budi;\nMerangkai tutur luhur menjadi pelita pengetahuan melintasi zaman.';
    artiEn =
      'Twenty foundational glyphs preserve ancestral wisdom;\nWeaving noble words into timeless illumination across generations.';
    maknaId =
      'Tradisi tulis Hanacaraka hingga aksara Nusantara menjadi jembatan memori sejarah, etika sastra, dan identitas literasi peradaban (S7).';
    maknaEn =
      'Archipelagic writing systems bridge historical manuscripts, ethical literature, and enduring cultural literacy (S7).';
    maknaJw =
      'Aksara Hanacaraka lan aksara Nuswantara dados jembatan memori sejarah, kasusastran, saha jatidiri bangsa (S7).';
    sumber = low.includes('lontara') ? [] : ['S7'];
  } else if (low.includes('tari') || low.includes('saman') || low.includes('nusantara') || low.includes('laut') || low.includes('maritim') || low.includes('pinisi')) {
    guritJawa =
      'Saka Sabang nganti Merauke manunggal ing rasa,\nOmbak lan gending nyawiji njaga marwah bangsa.';
    artiId =
      'Dari Sabang hingga Merauke menyatu dalam keselarasan rasa;\nGelombang samudra dan irama seni bersatu menjaga martabat bangsa.';
    artiEn =
      'From Sabang to Merauke, diverse rhythms meet in shared grace;\nOcean waves and communal arts safeguard the dignity of our archipelago.';
    maknaId =
      'Menggemakan nilai persaudaraan Nusantara—dari kekompakan seni gerak kolektif hingga kearifan pelaut dan gotong royong penjaga warisan Indonesia.';
    maknaEn =
      'Celebrates Nusantara unity across diverse regional dances, seafaring crafts, and communal stewardship from Sumatra to Papua.';
    maknaJw =
      'Nglairaken semangat paseduluran Nuswantara saking Sabang dumugi Merauke ingkang njagi warisan seni lan samudra bangsa.';
    sumber = [];
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
    statusAman: validasi.aman,
    pesanKeamanan: validasi.pesanKeamanan,
  };
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
  const persClean = data
    ? auditDanBersihkanOutputAI(data.persamaan, { minKarakter: 12, wajibJangkarBudaya: false })
    : null;
  const diffClean = data
    ? auditDanBersihkanOutputAI(data.perbedaanMaterial, { minKarakter: 12, wajibJangkarBudaya: false })
    : null;
  if (
    data &&
    persClean &&
    diffClean &&
    memilikiJangkarBudaya(`${persClean} ${diffClean} ${data.titikTemuFilosofi ?? ''}`)
  ) {
    const philClean = auditDanBersihkanOutputAI(data.titikTemuFilosofi, {
      minKarakter: 10,
      maxKarakter: 1000,
      wajibJangkarBudaya: false,
    });
    return {
      ...data,
      persamaan: persClean,
      perbedaanMaterial: diffClean,
      titikTemuFilosofi: philClean ?? data.titikTemuFilosofi,
      modelNama: MODEL_AI_STUDIO,
      mode: data.mode === 'pamomong-live' ? 'pamomong-live' : 'kurasi-lokal',
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return bandingkanPusakaLokal(idA, idB, bahasa);
}

/** Meminta gubahan puitik Jawa, Hanacaraka, dan suara WAV via Agen Pamomong Nusantara dengan fallback lokal. */
export async function mintaPujanggaAI(
  tema: string,
  bahasa: BahasaAktif,
): Promise<PujanggaResult> {
  const validasi = validasiTemaPujangga(tema, bahasa);
  if (!validasi.aman) {
    return susunPujanggaLokal(tema, bahasa);
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await panggilEndpointStudio<PujanggaResult>(
    {
      tugas: 'pujangga',
      tema: validasi.temaBersih,
      bahasa,
    },
    28000,
  );
  if (
    data &&
    auditDanBersihkanOutputAI(data.guritJawa, { minKarakter: 8, wajibJangkarBudaya: false }) &&
    auditDanBersihkanOutputAI(data.catatanMakna, { minKarakter: 8, maxKarakter: 520, wajibJangkarBudaya: true }) &&
    data.aksaraJawa
  ) {
    return {
      ...data,
      modelNama: MODEL_AI_STUDIO,
      modePenyedia: data.audioBase64 ? 'pamomong-live-audio' : 'web-speech-fallback',
      statusAman: data.statusAman ?? true,
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return susunPujanggaLokal(tema, bahasa);
}

/** Panduan tata krama Ngoko ↔ Krama Inggil + Hanacaraka S5/S7 deterministik saat luring. */
export function susunKramaLokal(
  frasaInput: string,
  bahasa: BahasaAktif,
): KramaAksaraResult {
  const validasi = validasiInputKrama(frasaInput, bahasa);
  const kalimatAsal = validasi.temaBersih;
  const low = kalimatAsal.toLowerCase();

  let ngoko = 'Aku arep sinau tata krama lan gamelan pendhapa.';
  let kramaInggil = 'Kula badhe nyinau unggah-ungguh saha karawitan pendhapa.';
  let etikaId =
    'Unggah-ungguh Krama Inggil mengekspresikan hormat timbal-balik dan kerendahan hati ketika berguru di lingkungan Pendopo (S5, S7).';
  let etikaEn =
    'Polite Krama Inggil speech conveys mutual respect and humility when entering the Pendopo arts tradition (S5, S7).';
  let etikaJw =
    'Basa Krama Inggil nedahaken raos ajrih-asih lan tepa salira wonten ing pasinaon kabudayan karaton (S5, S7).';
  let sumber: KodeSumber[] = ['S5', 'S7'];

  if (low.includes('terima kasih') || low.includes('thank') || low.includes('matur')) {
    ngoko = 'Matur nuwun banget ya kanggo ilmune.';
    kramaInggil = 'Matur sembah nuwun sanget awit piwulang saha pitedahipun.';
    etikaId =
      'Ungkapan matur sembah nuwun memadukan kata halus (krama andhap) untuk merendahkan hati di hadapan sesepuh, guru, maupun empu pengrajin tradisi (S5, S7). Diucapkan dengan sikap tenang tanpa tergesa-gesa.';
    etikaEn =
      'Pairing matur sembah nuwun expresses humble reverence (krama andhap) toward elders, master artisans, and teachers (S5, S7), reserving refined krama nouns such as piwulang for their wisdom.';
    etikaJw =
      'Tembung matur sembah nuwun minangka wujuding andhap-asor dhumateng sesepuh lan para empu seni tradisi (S5, S7).';
  } else if (low.includes('maaf') || low.includes('sorry') || low.includes('permisi') || low.includes('nuwun sewu') || low.includes('pangapunten')) {
    ngoko = 'Sepurane ya yen aku ana luput utawa arep nyuwun pirsa.';
    kramaInggil = 'Nuwun sewu, kula nyuwun gunging pangapunten menawi wonten lepatipun.';
    etikaId =
      'Ungkapan Nuwun sewu dan nyuwun pangapunten mengawali sapaan dengan rasa tepa salira ketika memasuki ruang adat, pameran keraton, atau bertanya kepada sesepuh (S5, S7).';
    etikaEn =
      'Opening with Nuwun sewu (excuse me politely) and nyuwun gunging pangapunten honors spatial courtesy before addressing elders or entering cultural sanctuaries (S5, S7).';
    etikaJw =
      'Ukara nuwun sewu lan nyuwun pangapunten nedahaken tata krama alus nalika sowan utawa matur pitakenan (S5, S7).';
  } else if (low.includes('keris') || low.includes('batik') || low.includes('pusaka') || low.includes('gamelan')) {
    ngoko = 'Aku kepengin weruh filosofi keris, gamelan, lan batik kawung.';
    kramaInggil = 'Kula kepareng nyuwun pirsa falsafah dhuwung, gangsa, saha sinjang kawung.';
    etikaId =
      'Basa Krama mengganti kata benda sehari-hari dengan kosakata takzim: dhuwung (keris), gangsa (gamelan perunggu), dan sinjang (kain batik) sebagai hormat pada keluhuran kriya leluhur (S1, S2, S4, S7).';
    etikaEn =
      'Refined Krama Inggil elevates heirloom nouns — dhuwung (keris), gangsa (bronze gamelan), and sinjang (batik) — plus nyuwun pirsa rather than plain takon when inquiring respectfully (S1, S2, S4, S7).';
    etikaJw =
      'Tembung krama dhuwung, gangsa, lan sinjang nglairaken pakurmatan dhumateng karya empu, pengrawit, lan pambatik (S1, S2, S4, S7).';
    sumber = ['S1', 'S2', 'S4', 'S7'];
  } else if (low.includes('selamat') || low.includes('pagi') || low.includes('sore') || low.includes('greeting') || low.includes('sugeng')) {
    ngoko = 'Sugeng rawuh ing pendhapa, muga tansah rahayu.';
    kramaInggil = 'Sugeng rawuh wonten ing pendhapa, mugi tansah pinaringan karaharjan.';
    etikaId =
      'Sapaan pembuka Pendopo memakai kata kerja hormat rawuh bagi tamu sekaligus mendoakan keselamatan bersama (karaharjan) sebelum pergelaran atau musyawarah dimulai (S5, S6).';
    etikaEn =
      'A classic Pendopo greeting pairs honorific rawuh (arrival of an esteemed guest) with a shared blessing of karaharjan (peaceful well-being) before entering dialogue (S5, S6).';
    etikaJw =
      'Atur pambagyaharja ing pendhapa migunakaken tembung rawuh kangge tamu lan nyenyuwun karaharjan sadaya (S5, S6).';
    sumber = ['S5', 'S6'];
  }

  const catatanEtika =
    bahasa === 'en' ? etikaEn : bahasa === 'jw' || bahasa === 'aks' ? etikaJw : etikaId;

  return {
    kalimatAsal,
    bahasa,
    ngoko,
    kramaInggil,
    aksaraJawa: latinKeAksaraJawa(kramaInggil),
    catatanEtika,
    naskahSuara: kramaInggil,
    kodeBcp47: 'jv-ID',
    audioBase64: null,
    mimeType: null,
    modePenyedia: 'web-speech-fallback',
    sumber,
    modelNama: MODEL_AI_STUDIO,
    latensiMs: 9,
    statusAman: validasi.aman,
    pesanKeamanan: validasi.pesanKeamanan,
  };
}

/** Perencana rute kunjungan kuratorial 3-langkah antar-ruang KELIR S1-S7. */
export function susunRuteTurLokal(
  minat: MinatTurId,
  durasi: DurasiTurId,
  catatanRaw: string,
  bahasa: BahasaAktif,
): RuteTurResult {
  const validasi = validasiCatatanTur(catatanRaw, bahasa);
  const catatanBersih = bersihkanInputPengguna(validasi.temaBersih, BATAS_KARAKTER_TUR);
  const isMendalam = durasi === 'mendalam';
  const estimasiMenit = isMendalam ? 10 : 4;

  const langkahMap: Record<MinatTurId, LangkahRuteTur[]> = {
    tosan: [
      {
        judul: ambilTeks(
          { id: 'Bedah Metalurgi Bilah Pamor', en: 'Inspect Pamor Steel Forging', jw: 'Bedhah Wesi & Pamor' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'keris',
        titikId: 'keris-wilah',
        alasan: ambilTeks(
          {
            id: 'Pelajari lipatan besi meteorit pamor beras wutah serta luk lima Pandawa pada mode Ledak Anatomi (S1).',
            en: 'Examine meteoric nickel pamor laminations and five-curve Pandawa geometry in Exploded View (S1).',
            jw: 'Sinau lipatan wesi pamor lan luk gangsal ing mode Ledak Anatomi (S1).',
          },
          bahasa,
        ),
        sumber: ['S1'],
      },
      {
        judul: ambilTeks(
          { id: 'Dengarkan Suluk Panggung Keris', en: 'Listen to Keris Forge Suluk', jw: 'Midhanget Suluk Dhuwung' },
          bahasa,
        ),
        ruang: 'koleksi',
        bendaId: 'keris',
        trackIdx: 0,
        alasan: ambilTeks(
          {
            id: 'Nikmati pembacaan suluk puitis tempaan tosan aji lengkap dengan iringan narator multibahasa (S1, S5).',
            en: 'Experience the forge chant accompanied by multi-language AI narration (S1, S5).',
            jw: 'Midhangetake suluk tempa dhuwung sesarengan narasi basa Jawi/ID (S1, S5).',
          },
          bahasa,
        ),
        sumber: ['S1', 'S5'],
      },
      {
        judul: ambilTeks(
          { id: 'Uji Pemahaman di Lab Aksara & Kuis', en: 'Verify Script & Archive Quiz', jw: 'Uji Aksara & Kuis' },
          bahasa,
        ),
        ruang: 'kawruh',
        alasan: ambilTeks(
          {
            id: 'Transliterasikan istilah empu dan uji ketepatan rujukan S1 dalam Kuis Kurasi.',
            en: 'Transliterate tosan aji terminology into Hanacaraka Unicode and complete the S1 check.',
            jw: 'Nyerat tembung pusaka mawi aksara Hanacaraka lan nyoba Kuis S1.',
          },
          bahasa,
        ),
        sumber: ['S1', 'S7'],
      },
    ],
    arsitektur: [
      {
        judul: ambilTeks(
          { id: 'Inspeksi Saka Guru & Umpak Seismik', en: 'Inspect Seismic Saka Guru & Umpak', jw: 'Inspeksi Saka Guru & Umpak' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'joglo',
        titikId: 'joglo-sakaguru',
        alasan: ambilTeks(
          {
            id: 'Lihat sambungan pasak purus kayu jati tanpa paku dan sendi umpak andesit peredam gempa (S6).',
            en: 'Observe nail-free teakwood tenon joinery resting freely on seismic andesite umpak bases (S6).',
            jw: 'Pirsani sambungan purus kayu jati lan sendi umpak andesit anti-lindhu (S6).',
          },
          bahasa,
        ),
        sumber: ['S6'],
      },
      {
        judul: ambilTeks(
          { id: 'Tinjau Batik Kiblat Papat & Spasial', en: 'Compare Kiblat Papat Cosmology', jw: 'Pirsani Kosmologi Kiblat Papat' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'batik',
        titikId: 'batik-kiblat',
        alasan: ambilTeks(
          {
            id: 'Hubungkan tata ruang empat arah Pendopo Joglo dengan filosofi pancer motif Batik Kawung (S2, S6).',
            en: 'Connect Joglo cardinal column symmetry with Batik Kawung centered-origin geometry (S2, S6).',
            jw: 'Nyambungake tatanan kiblat papat Pendhapa kalih motif Kawung (S2, S6).',
          },
          bahasa,
        ),
        sumber: ['S2', 'S6'],
      },
      {
        judul: ambilTeks(
          { id: 'Layar Penuh Suluk Pendopo', en: 'Pendopo Suluk Showcase', jw: 'Suluk Pendhapa Ageng' },
          bahasa,
        ),
        ruang: 'koleksi',
        bendaId: 'joglo',
        trackIdx: 3,
        alasan: ambilTeks(
          {
            id: 'Tutup kunjungan dengan kontemplasi akustik kayu jati dan brunjung Joglo.',
            en: 'Conclude with wooden acoustic resonance notes for Pendopo architecture.',
            jw: 'Pungkasi kunjungan kanthi suluk Pendhapa Jawi (S6).',
          },
          bahasa,
        ),
        sumber: ['S6'],
      },
    ],
    karawitan: [
      {
        judul: ambilTeks(
          { id: 'Petik Bilah Perunggu Saron 3D', en: 'Play 3D Bronze Saron Keys', jw: 'Nabuh Wilah Saron 3D' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'saron',
        titikId: 'saron-wilah',
        alasan: ambilTeks(
          {
            id: 'Dengarkan perbedaan nada Slendro 1–2–3–5–6–1 langsung lewat bilah 3D dan teknik pijetan gema (S4).',
            en: 'Tap individual Slendro bronze bars directly in 3D and explore left-hand damping (S4).',
            jw: 'Cobi nabuh wilah 1-6 laras Slendro lan teknik pijetan (S4).',
          },
          bahasa,
        ),
        sumber: ['S4'],
      },
      {
        judul: ambilTeks(
          { id: 'Suluk Laras Slendro & Pelog', en: 'Explore Karawitan Repertoire', jw: 'Suluk & Repertoar Karawitan' },
          bahasa,
        ),
        ruang: 'koleksi',
        bendaId: 'saron',
        trackIdx: 1,
        alasan: ambilTeks(
          {
            id: 'Pelajari pembagian irama, fungsi gong ageng, dan filosofi Puspawarna (S4).',
            en: 'Study rhythmic cycles, colotomic gong markers, and Puspawarna philosophy (S4).',
            jw: 'Sinau pathet, kenong, gong ageng, lan tembang karawitan (S4).',
          },
          bahasa,
        ),
        sumber: ['S4'],
      },
      {
        judul: ambilTeks(
          { id: 'Panggung Wayang & Sabetan Keprak', en: 'Shadow Theatre Keprak Rhythm', jw: 'Pakeliran & Keprak Dalang' },
          bahasa,
        ),
        ruang: 'pakeliran',
        babakIdx: 0,
        alasan: ambilTeks(
          {
            id: 'Amati bagaimana keprak dalang memimpin tempo gamelan pengiring pakeliran (S3, S4).',
            en: 'Witness how the puppeteer’s keprak bronze plates cue the gamelan ensemble (S3, S4).',
            jw: 'Pirsani kepripun keprak dhalang nuntun irama gamelan (S3, S4).',
          },
          bahasa,
        ),
        sumber: ['S3', 'S4'],
      },
    ],
    pakeliran: [
      {
        judul: ambilTeks(
          { id: 'Panggung Bayangan Kijang Kencana', en: 'Kijang Kencana 3D Shadow Stage', jw: 'Panggung Pakeliran Kijang Kencana' },
          bahasa,
        ),
        ruang: 'pakeliran',
        babakIdx: 1,
        alasan: ambilTeks(
          {
            id: 'Ganti tata cahaya Blencong–Kelir–Sorot dan aktifkan narator suara dalang di adegan pengejaran (S3, S5).',
            en: 'Toggle Blencong flame lighting moods and trigger the dalang audio narrator (S3, S5).',
            jw: 'Ganti cahya Blencong-Kelir lan puter swara dhalang wonten ing adegan (S3, S5).',
          },
          bahasa,
        ),
        sumber: ['S3', 'S5'],
      },
      {
        judul: ambilTeks(
          { id: 'Bedah Tatahan Krawangan & Blencong', en: 'Inspect Tatahan & Blencong Lamp', jw: 'Bedhah Tatahan & Blencong' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'wayang',
        titikId: 'wayang-blencong',
        alasan: ambilTeks(
          {
            id: 'Periksa anatomi cempurit tanduk kerbau dan sumbu api minyak kelapa yang memproyeksi siluet (S3).',
            en: 'Examine buffalo horn cempurit rods and coconut-oil Blencong lamp optics (S3).',
            jw: 'Inspeksi cempurit sungu kebo lan lampu lenga Blencong (S3).',
          },
          bahasa,
        ),
        sumber: ['S3'],
      },
      {
        judul: ambilTeks(
          { id: 'Prasasti Hanacaraka U+A980', en: 'Hanacaraka Script Stele', jw: 'Prasasti Hanacaraka U+A980' },
          bahasa,
        ),
        ruang: 'kawruh',
        alasan: ambilTeks(
          {
            id: 'Pahami akar naskah klasik babad Ramayana & carakan 20 aksara Jawa (S5, S7).',
            en: 'Connect epic literary transmission to the 20 Javanese Nglegena syllables (S5, S7).',
            jw: 'Sinau sambunganipun epos Ramayana lan aksara Jawa 20 carakan (S5, S7).',
          },
          bahasa,
        ),
        sumber: ['S5', 'S7'],
      },
    ],
    semua: [
      {
        judul: ambilTeks(
          { id: 'Pembuka: Bedah 3D Keris Mataram', en: 'Stop 1: Keris 3D Anatomy', jw: 'Langkah 1: Bedhah 3D Dhuwung' },
          bahasa,
        ),
        ruang: 'twin',
        bendaId: 'keris',
        titikId: 'keris-wilah',
        alasan: ambilTeks(
          {
            id: 'Awali dari pusaka pengakuan UNESCO dengan mode X-Ray & PBR bilah pamor (S1).',
            en: 'Begin with UNESCO-recognized Tosan Aji metallurgy in PBR and X-Ray views (S1).',
            jw: 'Miwiti saking dhuwung pusaka UNESCO mawi mode PBR & X-Ray (S1).',
          },
          bahasa,
        ),
        sumber: ['S1'],
      },
      {
        judul: ambilTeks(
          { id: 'Tengah: Teater Bayangan & Suluk', en: 'Stop 2: Blencong Shadow Theatre', jw: 'Langkah 2: Pakeliran & Suluk' },
          bahasa,
        ),
        ruang: 'pakeliran',
        babakIdx: 0,
        alasan: ambilTeks(
          {
            id: 'Saksikan lakon Kijang Kencana lengkap dengan efek api blencong, sabetan, dan narasi dalang (S3, S5).',
            en: 'Watch Kijang Kencana unfolded under flickering Blencong flame light (S3, S5).',
            jw: 'Pirsani lakon Kijang Kencana kanthi sorot Blencong lan swara dhalang (S3, S5).',
          },
          bahasa,
        ),
        sumber: ['S3', 'S5'],
      },
      {
        judul: ambilTeks(
          { id: 'Penutup: Aksara Hanacaraka & Kuis', en: 'Stop 3: Hanacaraka & Archive Quiz', jw: 'Langkah 3: Lab Aksara & Kuis' },
          bahasa,
        ),
        ruang: 'kawruh',
        alasan: ambilTeks(
          {
            id: 'Coba konverter Unicode U+A980 dan kunci skor tertinggi untuk Piagam Kurator KELIR (S7).',
            en: 'Try live Unicode U+A980 transliteration and earn your KELIR Curator Certificate (S7).',
            jw: 'Cobi konverter Unicode U+A980 lan jangkepi Piagam Kurator (S7).',
          },
          bahasa,
        ),
        sumber: ['S7'],
      },
    ],
  };

  const catatanLow = catatanBersih.toLowerCase();
  let langkahDasar = langkahMap[minat] ?? langkahMap.semua;
  if (catatanLow.includes('umpak') || catatanLow.includes('gempa')) {
    langkahDasar = langkahMap.arsitektur;
  } else if (catatanLow.includes('blencong') || catatanLow.includes('kidang')) {
    langkahDasar = langkahMap.pakeliran;
  } else if (catatanLow.includes('slendro') || catatanLow.includes('gangsa')) {
    langkahDasar = langkahMap.karawitan;
  } else if (catatanLow.includes('pamor') || catatanLow.includes('warangka')) {
    langkahDasar = langkahMap.tosan;
  }
  const langkah = isMendalam ? langkahDasar : langkahDasar.slice(0, 2);
  const sumber = [...new Set(langkah.flatMap((l) => l.sumber))];
  const catatanLabel = catatanBersih
    ? ambilTeks(
        {
          id: ` Fokus khusus pada "${catatanBersih}".`,
          en: ` Tailored around "${catatanBersih}".`,
          jw: ` Dipuntujokaken dhateng "${catatanBersih}".`,
        },
        bahasa,
      )
    : '';

  return {
    minat,
    durasi,
    catatan: catatanBersih,
    bahasa,
    ringkasanRute: ambilTeks(
      {
        id: `Rute kurasi ${isMendalam ? 'mendalam' : 'kilat'} (±${estimasiMenit} menit) menyoroti ${langkah.length} titik warisan terverifikasi S1–S7.${catatanLabel}`,
        en: `Curated ${isMendalam ? 'deep' : 'express'} spatial itinerary (~${estimasiMenit} min) spanning ${langkah.length} verified S1–S7 rooms.${catatanLabel}`,
        jw: `Rute kurasi ${isMendalam ? 'jembar' : 'rikat'} (±${estimasiMenit} menit) ngliwati ${langkah.length} papan warisan S1–S7.${catatanLabel}`,
      },
      bahasa,
    ),
    estimasiMenit,
    langkah,
    sumber,
    modelNama: MODEL_AI_STUDIO,
    mode: 'kurasi-lokal',
    latensiMs: 8,
    statusAman: validasi.aman,
    pesanKeamanan: validasi.pesanKeamanan,
  };
}

/** Meminta panduan Krama Inggil + Hanacaraka + Audio WAV via Agen Pamomong Nusantara dengan fallback lokal. */
export async function mintaKramaAI(
  frasa: string,
  bahasa: BahasaAktif,
): Promise<KramaAksaraResult> {
  const validasi = validasiInputKrama(frasa, bahasa);
  if (!validasi.aman) {
    return susunKramaLokal(frasa, bahasa);
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await panggilEndpointStudio<KramaAksaraResult>(
    {
      tugas: 'krama',
      tema: validasi.temaBersih,
      bahasa,
    },
    28000,
  );
  if (
    data &&
    auditDanBersihkanOutputAI(data.kramaInggil, { minKarakter: 6, wajibJangkarBudaya: false }) &&
    auditDanBersihkanOutputAI(data.catatanEtika, { minKarakter: 8, maxKarakter: 520, wajibJangkarBudaya: true }) &&
    data.aksaraJawa
  ) {
    return {
      ...data,
      modelNama: MODEL_AI_STUDIO,
      modePenyedia: data.audioBase64 ? 'pamomong-live-audio' : 'web-speech-fallback',
      statusAman: data.statusAman ?? true,
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return susunKramaLokal(frasa, bahasa);
}

/** Meminta rekomendasi rute tur spasial terkurasi via Agen Pamomong Nusantara dengan fallback S1-S7. */
export async function mintaRuteTurAI(
  minat: MinatTurId,
  durasi: DurasiTurId,
  catatan: string,
  bahasa: BahasaAktif,
): Promise<RuteTurResult> {
  const validasi = validasiCatatanTur(catatan, bahasa);
  if (!validasi.aman) {
    return susunRuteTurLokal(minat, durasi, catatan, bahasa);
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const data = await panggilEndpointStudio<RuteTurResult>(
    {
      tugas: 'tur',
      minat,
      durasi,
      tema: validasi.temaBersih,
      bahasa,
    },
    26000,
  );
  if (
    data &&
    Array.isArray(data.langkah) &&
    data.langkah.length > 0 &&
    auditDanBersihkanOutputAI(data.ringkasanRute, { minKarakter: 12, maxKarakter: 520, wajibJangkarBudaya: true })
  ) {
    return {
      ...data,
      modelNama: MODEL_AI_STUDIO,
      mode: data.mode === 'pamomong-live' ? 'pamomong-live' : 'kurasi-lokal',
      statusAman: data.statusAman ?? true,
      latensiMs: Math.max(12, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start)),
    };
  }
  return susunRuteTurLokal(minat, durasi, catatan, bahasa);
}
