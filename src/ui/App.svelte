<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import {
    DAFTAR_BEDAH_TWIN,
    DAFTAR_BENDA,
    DAFTAR_SUMBER,
    DINDING_MATRIX,
    KEUNGGULAN_SISTEM,
    KOLEKSI_COVERFLOW,
    KOLEKSI_ETALASE,
    KRONIK_SEJARAH_BUDAYA,
    LAKON_KIJANG_KENCANA,
    PILAR_NILAI,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type ItemCoverflow,
    type KodeSumber,
    type SpesimenBedahId,
    type TitikInfoPusaka,
  } from '../content/pusaka.ts';
  import { DAFTAR_CARAKAN, latinKeAksaraJawa, type KartuCarakan } from '../lib/aksara.ts';
  import { mintaSuaraDalangBabak } from '../lib/aiStudio.ts';
  import { audioBudaya } from '../lib/audioBudaya.ts';
  import { type GendingId } from '../lib/gendingJawa.ts';
  import type { FrameTangan, PengelolaTangan, StatusKamera } from '../lib/handTracker.ts';
  import { DAFTAR_BAHASA, setI18nLanguage, tI18n } from '../lib/i18n.ts';
  import {
    bacaJejakKurasi,
    jejakKurasiKosong,
    simpanJejakKurasi,
    temukanCarakanByLatin,
    type AksiNavigasiPencarian,
    type JejakKurasi,
  } from '../lib/pencarianArsip.ts';
  import { canUseHoverPointer, pasangReveal } from '../lib/revealAnim.ts';
  import { sinkronkanSeoHalaman, sinkronkanTemaBrowser } from '../lib/seoGeo.ts';
  import { pasangSmoothScroll, type SmoothScrollController } from '../lib/smoothScroll.ts';
  import {
    base64AudioKeBlobUrl,
    hentikanWebSpeech,
    putarkanWebSpeech,
  } from '../lib/sulukNarasi.ts';
  import { jawabDariKurasiLokal, tanyakanKeAsisten, type HasilTanya } from '../lib/tanya.ts';
  import type { CoverflowStage } from '../scenes/coverflowStage.ts';
  import type { DigitalTwinStage, ModeVisualTwin, ProyeksiPinTwin } from '../scenes/digitalTwinStage.ts';
  import { LivingPendopoStage, type ProyeksiPinDiorama } from '../scenes/livingPendopoStage.ts';
  import type { PamomongOrbStage } from '../scenes/pamomongOrbStage.ts';
  import type { MoodPanggungWayang, WayangStage } from '../scenes/wayangStage.ts';
  import BerandaWallEtalase, { type FilterEtalase } from './components/BerandaWallEtalase.svelte';
  import CoverflowShowcase from './components/CoverflowShowcase.svelte';
  import DigitalTwinStudio from './components/DigitalTwinStudio.svelte';
  import FooterSection from './components/FooterSection.svelte';
  import KarawitanBar from './components/KarawitanBar.svelte';
  import KawruhOrbSection from './components/KawruhOrbSection.svelte';
  import KelirCursor from './components/KelirCursor.svelte';
  import SearchModal from './components/SearchModal.svelte';
  import SulukModal from './components/SulukModal.svelte';
  import PixelNumber from './PixelNumber.svelte';

  // =========================================================================
  // 1. Arsitektur Multi-Halaman (5 Halaman Terpadu & Selaras)
  // =========================================================================
  type HalamanId = 'beranda' | 'twin' | 'koleksi' | 'pakeliran' | 'kawruh';

  interface DefinisiHalaman {
    id: HalamanId;
    nomor: string;
    label: string;
    aksara: string;
    subjudul: string;
    deskripsi: string;
  }

  const PAGE_META_STATIC: Array<{ id: HalamanId; nomor: string; aksara: string }> = [
    { id: 'beranda', nomor: '01', aksara: 'ꦥꦼꦤ꧀ꦝꦥ' },
    { id: 'twin', nomor: '02', aksara: 'ꦏꦼꦩ꧀ꦧꦂ' },
    { id: 'koleksi', nomor: '03', aksara: 'ꦱꦸꦭꦸꦏ꧀' },
    { id: 'pakeliran', nomor: '04', aksara: 'ꦥꦏꦼꦭꦶꦂ' },
    { id: 'kawruh', nomor: '05', aksara: 'ꦲꦤꦕꦫꦏ' },
  ];

  let halamanAktif: HalamanId = $state('beranda');
  let tema: 'malam' | 'terang' = $state('terang');
  let bahasa: BahasaAktif = $state('id');
  let langMenuBuka = $state(false);
  let langDropdownEl: HTMLDivElement | undefined = $state();
  let preloaderProgres = $state(0);
  let preloaderSelesai = $state(false);
  let audioAktif = $state(false);
  let suasanaPendopoAktif = $state(false);

  let daftarHalaman: DefinisiHalaman[] = $derived(
    PAGE_META_STATIC.map((p) => ({
      ...p,
      label: tI18n(bahasa, `pages.${p.id}.label`),
      subjudul: tI18n(bahasa, `pages.${p.id}.subjudul`),
      deskripsi: tI18n(bahasa, `pages.${p.id}.deskripsi`),
    })),
  );

  // Scrollytelling & Diorama Hero State (Halaman 01)
  let scrollyIndeksAktif = $state(-1);
  let wireframeDioramaAktif = $state(false);
  let dioramaPins: ProyeksiPinDiorama[] = $state([]);
  let bendaSorotDiorama: BendaPusaka['id'] | null = $state(null);

  // Digital Twin Studio State (Halaman 02)
  let bendaAktifId: SpesimenBedahId = $state('keris');
  let titikAktifId = $state('keris-wilah');
  let modeVisualTwin: ModeVisualTwin = $state('hibrida');
  let faktorLedak = $state(0.18);
  let aksiHidupTwin = $state(true);
  let twinPins: ProyeksiPinTwin[] = $state([]);

  // Lola Wilde 3D Coverflow & Modal Suluk State (Halaman 03 & Global Modal)
  let coverflowIdx = $state(0);
  let modalSulukBuka = $state(false);
  let modalSulukTrackIdx = $state(0);
  let sulukLarikAktif = $state(0);

  // Etalase Showcase Filter & 3D Spatial Wall State (Halaman 01)
  let filterEtalase: FilterEtalase = $state('semua');
  let wallTiltX = $state(0);
  let wallTiltY = $state(0);

  // Panggung Pakeliran Ramayana State (Halaman 04)
  let babakIdx = $state(0);
  let posRama = $state(0.46);
  let posKidang = $state(-0.58);
  let moodPanggungWayang: MoodPanggungWayang = $state('blencong');
  let dalangSuaraStatus: 'diam' | 'memuat' | 'gemini' | 'webspeech' = $state('diam');
  let dalangAudioEl: HTMLAudioElement | null = null;
  let dalangAudioUrl: string | null = null;

  // Pencarian Global & Paspor Jejak Kurasi
  let searchModalBuka = $state(false);
  let jejakKurasi: JejakKurasi = $state(jejakKurasiKosong());

  // Lab Aksara Jawa & Pamomong AI State (Halaman 05)
  let inputAksaraLatin = $state('Kelir warisan budaya Jawa nusantara.');
  let kartuCarakanTerpilih: KartuCarakan = $state(DAFTAR_CARAKAN[4]);
  let pertanyaanInput = $state('');
  let sediaTanya = $state(false);
  let jawabanPamomong: HasilTanya = $state(
    jawabDariKurasiLokal('keris', 'Mengapa Keris Luk 5 identik dengan filosofi Pandawa?', 'id'),
  );

  // Hand Tracker Webcam State (Global Utility)
  let statusKamera: StatusKamera = $state('nonaktif');
  let gesturTerkini = $state('-');
  let jumlahTanganTerdeteksi = $state(0);
  let videoKameraEl: HTMLVideoElement | undefined = $state();

  // Instance Panggung WebGL Aktif (dimuat malas sesuai halaman aktif)
  let dioramaStage: LivingPendopoStage | null = null;
  let twinStage: DigitalTwinStage | null = null;
  let coverflowStage: CoverflowStage | null = null;
  let wayangStage: WayangStage | null = null;
  let orbStage: PamomongOrbStage | null = null;
  let pengelolaTangan: PengelolaTangan | null = null;
  let smoothScrollCtrl: SmoothScrollController | null = null;
  let pendingTwinTitikId: string | null = null;

  // Derived Values
  let infoHalamanAktif = $derived(
    daftarHalaman.find((h) => h.id === halamanAktif) ?? daftarHalaman[0],
  );
  let indeksHalamanAktif = $derived(
    daftarHalaman.findIndex((h) => h.id === halamanAktif),
  );
  let halamanSebelumnya = $derived(
    daftarHalaman[(indeksHalamanAktif - 1 + daftarHalaman.length) % daftarHalaman.length],
  );
  let halamanBerikutnya = $derived(
    daftarHalaman[(indeksHalamanAktif + 1) % daftarHalaman.length],
  );

  let bendaAktif = $derived(
    DAFTAR_BEDAH_TWIN.find((b) => b.id === bendaAktifId) ?? DAFTAR_BEDAH_TWIN[0],
  );
  let bendaPamomongAktif: BendaPusaka = $derived(
    DAFTAR_BENDA.find(
      (b) =>
        b.id ===
        (bendaAktifId === 'kidang'
          ? 'wayang'
          : bendaAktifId === 'hanacaraka'
            ? 'keris'
            : bendaAktifId),
    ) ?? DAFTAR_BENDA[0],
  );
  let titikAktif: TitikInfoPusaka = $derived(
    bendaAktif.titikInfo.find((t) => t.id === titikAktifId) ?? bendaAktif.titikInfo[0],
  );
  let babakAktif = $derived(
    LAKON_KIJANG_KENCANA.daftarBabak[babakIdx] ?? LAKON_KIJANG_KENCANA.daftarBabak[0],
  );
  let aksaraTerkonversi = $derived(latinKeAksaraJawa(inputAksaraLatin));
  let itemEtalaseTersaring = $derived(
    filterEtalase === 'semua'
      ? KOLEKSI_ETALASE
      : KOLEKSI_ETALASE.filter((item) => item.kategoriKey === filterEtalase),
  );

  // =========================================================================
  // 2. Svelte Actions untuk Siklus Hidup 3D WebGL per Halaman
  // =========================================================================
  function mountDioramaStage(node: HTMLDivElement) {
    dioramaStage = new LivingPendopoStage(node, tema);
    dioramaStage.onProyeksiPin((pins) => {
      dioramaPins = pins;
    });

    const ro = new ResizeObserver(() => dioramaStage?.ubahUkuran());
    ro.observe(node);

    let io: IntersectionObserver | null = null;
    void tick().then(() => {
      const langkahNodes = document.querySelectorAll<HTMLElement>('[data-scrolly-idx]');
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const val = Number(entry.target.getAttribute('data-scrolly-idx'));
              if (!Number.isNaN(val)) {
                scrollyIndeksAktif = val;
                dioramaStage?.aturProgresGulir(val);
              }
            }
          }
        },
        { threshold: 0.45 },
      );
      langkahNodes.forEach((n) => io?.observe(n));
    });

    return {
      destroy() {
        io?.disconnect();
        ro.disconnect();
        dioramaStage?.destroy();
        dioramaStage = null;
      },
    };
  }

  function mountTwinStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    void import('../scenes/digitalTwinStage.ts').then(({ DigitalTwinStage }) => {
      if (destroyed) return;
      twinStage = new DigitalTwinStage(node, tema);
      twinStage.muatBenda(bendaAktif);
      twinStage.aturLedakAnatomi(faktorLedak);
      twinStage.terapkanModeVisual(modeVisualTwin);
      if (pendingTwinTitikId) {
        const target = bendaAktif.titikInfo.find((t) => t.id === pendingTwinTitikId);
        if (target) twinStage.fokusKeTitik(target);
        pendingTwinTitikId = null;
      }
      twinStage.onProyeksiPin((pins) => {
        twinPins = pins;
      });

      ro = new ResizeObserver(() => twinStage?.ubahUkuran());
      ro.observe(node);
    });

    return {
      destroy() {
        destroyed = true;
        ro?.disconnect();
        twinStage?.destroy();
        twinStage = null;
      },
    };
  }

  function mountCoverflowStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    void import('../scenes/coverflowStage.ts').then(({ CoverflowStage }) => {
      if (destroyed) return;
      coverflowStage = new CoverflowStage(node, tema, coverflowIdx);
      coverflowStage.onSelectIndex((idx) => {
        pilihIndeksCoverflow(idx);
      });
      coverflowStage.onSwipeStep((delta) => {
        geserCoverflow(delta);
      });

      ro = new ResizeObserver(() => coverflowStage?.ubahUkuran());
      ro.observe(node);
    });

    return {
      destroy() {
        destroyed = true;
        ro?.disconnect();
        coverflowStage?.destroy();
        coverflowStage = null;
      },
    };
  }

  function mountWayangStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    void import('../scenes/wayangStage.ts').then(({ WayangStage }) => {
      if (destroyed) return;
      wayangStage = new WayangStage(node);
      wayangStage.aturPosisiTokoh(posRama, posKidang);
      wayangStage.aturMoodCahaya(moodPanggungWayang);

      ro = new ResizeObserver(() => wayangStage?.ubahUkuran());
      ro.observe(node);
    });

    return {
      destroy() {
        destroyed = true;
        ro?.disconnect();
        wayangStage?.destroy();
        wayangStage = null;
      },
    };
  }

  function mountOrbStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    void import('../scenes/pamomongOrbStage.ts').then(({ PamomongOrbStage }) => {
      if (destroyed) return;
      orbStage = new PamomongOrbStage(node, tema);

      ro = new ResizeObserver(() => orbStage?.ubahUkuran());
      ro.observe(node);
    });

    return {
      destroy() {
        destroyed = true;
        ro?.disconnect();
        orbStage?.destroy();
        orbStage = null;
      },
    };
  }

  // =========================================================================
  // 3. Fungsi Navigasi Antar-Halaman & Interaksi
  // =========================================================================
  function sinkronkanUrlDeepLink(): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('hal', halamanAktif);
    if (halamanAktif === 'twin') {
      url.searchParams.set('benda', bendaAktifId);
      url.searchParams.set('titik', titikAktifId);
      url.searchParams.delete('babak');
    } else if (halamanAktif === 'pakeliran') {
      url.searchParams.set('babak', String(babakIdx));
      url.searchParams.delete('benda');
      url.searchParams.delete('titik');
    } else {
      url.searchParams.delete('benda');
      url.searchParams.delete('titik');
      url.searchParams.delete('babak');
    }
    window.history.replaceState({ halaman: halamanAktif }, '', url);
  }

  function catatSpesimen(id: SpesimenBedahId): void {
    if (jejakKurasi.spesimenDiteliti.includes(id)) return;
    jejakKurasi = {
      ...jejakKurasi,
      spesimenDiteliti: [...jejakKurasi.spesimenDiteliti, id],
    };
    simpanJejakKurasi(jejakKurasi);
  }

  function catatSuluk(id: SpesimenBedahId): void {
    if (jejakKurasi.sulukDidengar.includes(id)) return;
    jejakKurasi = {
      ...jejakKurasi,
      sulukDidengar: [...jejakKurasi.sulukDidengar, id],
    };
    simpanJejakKurasi(jejakKurasi);
  }

  function catatBabak(idx: number): void {
    if (jejakKurasi.babakPakeliran.includes(idx)) return;
    jejakKurasi = {
      ...jejakKurasi,
      babakPakeliran: [...jejakKurasi.babakPakeliran, idx],
    };
    simpanJejakKurasi(jejakKurasi);
  }

  function catatSkorKuis(skor: number): void {
    if (skor <= jejakKurasi.skorKuisTertinggi) return;
    jejakKurasi = {
      ...jejakKurasi,
      skorKuisTertinggi: skor,
    };
    simpanJejakKurasi(jejakKurasi);
  }

  function hentikanSuaraDalang(): void {
    hentikanWebSpeech();
    audioBudaya.aturVolumeLatar(false);
    if (dalangAudioEl) {
      dalangAudioEl.pause();
      dalangAudioEl.src = '';
      dalangAudioEl = null;
    }
    if (dalangAudioUrl) {
      URL.revokeObjectURL(dalangAudioUrl);
      dalangAudioUrl = null;
    }
    dalangSuaraStatus = 'diam';
  }

  async function toggleSuaraDalang(): Promise<void> {
    if (dalangSuaraStatus !== 'diam') {
      hentikanSuaraDalang();
      return;
    }
    const idxSaatIni = babakIdx;
    const bahasaSaatIni = bahasa;
    dalangSuaraStatus = 'memuat';
    const hasil = await mintaSuaraDalangBabak(idxSaatIni, bahasaSaatIni);
    if (halamanAktif !== 'pakeliran' || babakIdx !== idxSaatIni || bahasa !== bahasaSaatIni) {
      dalangSuaraStatus = 'diam';
      return;
    }
    if (hasil.audioBase64 && hasil.mimeType && typeof Audio !== 'undefined') {
      try {
        const blobUrl = base64AudioKeBlobUrl(hasil.audioBase64, hasil.mimeType);
        dalangAudioUrl = blobUrl;
        const audio = new Audio(blobUrl);
        dalangAudioEl = audio;
        dalangSuaraStatus = 'gemini';
        audioBudaya.aturVolumeLatar(true);
        audio.onended = () => hentikanSuaraDalang();
        audio.onerror = () => hentikanSuaraDalang();
        await audio.play();
        return;
      } catch {
        hentikanSuaraDalang();
      }
    }
    const ok = putarkanWebSpeech(
      hasil.naskah,
      hasil.kodeBcp47,
      () => {
        dalangSuaraStatus = 'webspeech';
        audioBudaya.aturVolumeLatar(true);
      },
      () => {
        dalangSuaraStatus = 'diam';
        audioBudaya.aturVolumeLatar(false);
      },
    );
    if (!ok) dalangSuaraStatus = 'diam';
  }

  function pindahHalaman(id: HalamanId, targetAnchorId?: string): void {
    if (id !== 'pakeliran') hentikanSuaraDalang();
    halamanAktif = id;
    wallTiltX = 0;
    wallTiltY = 0;
    if (id === 'twin') catatSpesimen(bendaAktifId);
    if (id === 'pakeliran') catatBabak(babakIdx);
    sinkronkanSeoHalaman(id, bahasa);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('hal', id);
      if (id === 'twin') {
        url.searchParams.set('benda', bendaAktifId);
        url.searchParams.set('titik', titikAktifId);
        url.searchParams.delete('babak');
      } else if (id === 'pakeliran') {
        url.searchParams.set('babak', String(babakIdx));
        url.searchParams.delete('benda');
        url.searchParams.delete('titik');
      } else {
        url.searchParams.delete('benda');
        url.searchParams.delete('titik');
        url.searchParams.delete('babak');
      }
      url.hash = targetAnchorId ? `#${targetAnchorId}` : '';
      window.history.pushState({ halaman: id }, '', url);

      void tick().then(() => {
        if (targetAnchorId) {
          const el = document.getElementById(targetAnchorId);
          if (el) {
            if (smoothScrollCtrl) {
              smoothScrollCtrl.scrollToElement(el, 88);
            } else {
              el.scrollIntoView({ behavior: 'smooth' });
            }
            return;
          }
        }
        if (smoothScrollCtrl) {
          smoothScrollCtrl.scrollTo(0, false);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      });
    }
  }

  function pilihBahasa(nextLang: BahasaAktif): void {
    hentikanSuaraDalang();
    bahasa = nextLang;
    langMenuBuka = false;
    setI18nLanguage(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-lang', nextLang);
    }
    sinkronkanSeoHalaman(halamanAktif, nextLang);

    const qTrim = pertanyaanInput.trim();
    const defaultIdx = bendaPamomongAktif.pertanyaanContoh.findIndex(
      (q) =>
        ambilTeks(q, 'id') === qTrim ||
        ambilTeks(q, 'en') === qTrim ||
        ambilTeks(q, 'jw') === qTrim ||
        ambilTeks(q, 'aks') === qTrim,
    );
    const queryToUse =
      defaultIdx >= 0
        ? ambilTeks(bendaPamomongAktif.pertanyaanContoh[defaultIdx], nextLang)
        : qTrim || ambilTeks(bendaPamomongAktif.pertanyaanContoh[0], nextLang);

    if (defaultIdx >= 0 && qTrim) {
      pertanyaanInput = queryToUse;
    }
    jawabanPamomong = jawabDariKurasiLokal(bendaPamomongAktif.id, queryToUse, nextLang);
  }

  function tutupPreloaderSeketika(): void {
    preloaderProgres = 100;
    preloaderSelesai = true;
  }

  function toggleTema(): void {
    tema = tema === 'malam' ? 'terang' : 'malam';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', tema);
      sinkronkanTemaBrowser(tema);
    }
    dioramaStage?.setTheme(tema);
    twinStage?.setTheme(tema);
    coverflowStage?.setTheme(tema);
    orbStage?.setTheme(tema);
  }

  function toggleAudio(): void {
    audioAktif = !audioAktif;
    audioBudaya.aturAktif(audioAktif);
    if (!audioAktif) {
      suasanaPendopoAktif = false;
    } else {
      suasanaPendopoAktif = audioBudaya.mulaiSuasanaPendopo();
    }
  }

  function toggleSuasanaGending(): void {
    if (!audioAktif) {
      audioAktif = true;
      audioBudaya.aturAktif(true);
    }
    suasanaPendopoAktif = audioBudaya.toggleSuasanaPendopo();
  }

  function pilihGendingLatar(id: GendingId): void {
    if (!audioAktif) {
      audioAktif = true;
      audioBudaya.aturAktif(true);
    }
    audioBudaya.pilihGending(id, true);
    suasanaPendopoAktif = true;
  }

  function pilihPusaka(
    id: SpesimenBedahId,
    bukaHalamanTwin = false,
    targetTitikId?: string,
  ): void {
    bendaAktifId = id;
    const bendaBaru = DAFTAR_BEDAH_TWIN.find((b) => b.id === id) ?? DAFTAR_BEDAH_TWIN[0];
    const targetTitik = targetTitikId
      ? bendaBaru.titikInfo.find((t) => t.id === targetTitikId)
      : undefined;
    titikAktifId = targetTitik?.id ?? bendaBaru.titikInfo[0].id;

    if (twinStage) {
      twinStage.muatBenda(bendaBaru);
      if (targetTitik) twinStage.fokusKeTitik(targetTitik);
      pendingTwinTitikId = null;
    } else if (bukaHalamanTwin) {
      pendingTwinTitikId = targetTitik?.id ?? null;
    }

    if (id === 'keris' || id === 'saron' || id === 'batik' || id === 'joglo' || id === 'wayang') {
      dioramaStage?.fokusKeBangunan(id);
    } else if (id === 'kidang') {
      dioramaStage?.fokusKeBangunan('wayang');
    }

    if (audioAktif) picuSuaraBenda(id);
    catatSpesimen(id);

    if (bukaHalamanTwin) {
      pindahHalaman('twin');
    } else if (halamanAktif === 'twin') {
      sinkronkanUrlDeepLink();
    }
  }

  function picuSuaraBenda(id: SpesimenBedahId): void {
    if (!audioAktif) return;
    if (id === 'keris' || id === 'hanacaraka') audioBudaya.bunyikanHunusKeris();
    else if (id === 'saron') audioBudaya.bunyikanWilahSaron(3);
    else if (id === 'batik') audioBudaya.bunyikanCantingMalam();
    else if (id === 'joglo') audioBudaya.bunyikanKetukKayuJoglo();
    else audioBudaya.bunyikanCempalaKeprak();
  }

  function bunyikanWilahTwin(idx: number): void {
    if (!audioAktif) {
      audioAktif = true;
      audioBudaya.aturAktif(true);
    }
    audioBudaya.bunyikanWilahSaron(idx);
    twinStage?.picuEfekKhusus3D();
  }

  function bukaSulukSpesimen(id: SpesimenBedahId): void {
    const idx = KOLEKSI_COVERFLOW.findIndex((c) => c.artefakId === id);
    bukaModalSuluk(idx >= 0 ? idx : 0);
  }

  function aturModeVisualTwin(mode: ModeVisualTwin): void {
    modeVisualTwin = mode;
    twinStage?.terapkanModeVisual(mode);
  }

  function pilihTitikInfo(t: TitikInfoPusaka): void {
    titikAktifId = t.id;
    twinStage?.fokusKeTitik(t);
    picuSuaraBenda(bendaAktif.id);
    if (halamanAktif === 'twin') sinkronkanUrlDeepLink();
  }

  function pilihIndeksCoverflow(idx: number): void {
    const len = KOLEKSI_COVERFLOW.length;
    coverflowIdx = ((idx % len) + len) % len;
    coverflowStage?.aturIndeksAktif(coverflowIdx);
    if (audioAktif) audioBudaya.bunyikanWilahSaron(coverflowIdx % 6, 0.14);
  }

  function bukaModalSuluk(idx: number): void {
    const len = KOLEKSI_COVERFLOW.length;
    modalSulukTrackIdx = ((idx % len) + len) % len;
    sulukLarikAktif = 0;
    modalSulukBuka = true;
    const item = KOLEKSI_COVERFLOW[modalSulukTrackIdx];
    if (item) catatSuluk(item.artefakId);
    if (audioAktif) audioBudaya.bunyikanWilahSaron(modalSulukTrackIdx % 6, 0.2);
  }

  function geserCoverflow(delta: number): void {
    pilihIndeksCoverflow(coverflowIdx + delta);
  }

  function bukaItemCoverflow(item: ItemCoverflow): void {
    if (item.halamanTarget === 'twin') {
      pilihPusaka(item.bendaId, true, item.titikId);
      return;
    }
    pindahHalaman(item.halamanTarget, item.anchorTarget);
  }

  function pilihBabak(i: number): void {
    hentikanSuaraDalang();
    babakIdx = i;
    catatBabak(i);
    const bab = LAKON_KIJANG_KENCANA.daftarBabak[i];
    if (bab) {
      posRama = bab.posisiAwalRama;
      posKidang = bab.posisiAwalKidang;
      wayangStage?.aturPosisiTokoh(posRama, posKidang);
      if (audioAktif) audioBudaya.bunyikanCempalaKeprak();
    }
    if (halamanAktif === 'pakeliran') sinkronkanUrlDeepLink();
  }

  function eksekusiAksiPencarian(aksi: AksiNavigasiPencarian): void {
    if (aksi.jenis === 'twin') {
      pilihPusaka(aksi.bendaId, true, aksi.titikId);
      return;
    }
    if (aksi.jenis === 'suluk') {
      bukaModalSuluk(aksi.trackIdx);
      return;
    }
    if (aksi.jenis === 'pakeliran') {
      pilihBabak(aksi.babakIdx);
      pindahHalaman('pakeliran');
      return;
    }
    if (aksi.jenis === 'kawruh-aksara') {
      const carakan = temukanCarakanByLatin(aksi.carakanLatin);
      if (carakan) {
        kartuCarakanTerpilih = carakan;
        inputAksaraLatin = carakan.contohKata;
      }
      pindahHalaman('kawruh', 'aksara');
      return;
    }
    pindahHalaman('kawruh', 'daftar-pustaka');
  }

  async function kirimTanyaPamomong(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    const fallbackQ = ambilTeks(bendaPamomongAktif.pertanyaanContoh[0], bahasa);
    const q = pertanyaanInput.trim() || fallbackQ;
    if (!pertanyaanInput.trim()) pertanyaanInput = q;
    sediaTanya = true;
    orbStage?.picuDenyutBerpikir();
    jawabanPamomong = await tanyakanKeAsisten(bendaPamomongAktif.id, q, bahasa);
    sediaTanya = false;
  }

  async function toggleKameraTangan(): Promise<void> {
    if (statusKamera === 'aktif' || statusKamera === 'memuat') {
      pengelolaTangan?.matikan();
      return;
    }
    if (!videoKameraEl) return;
    if (!pengelolaTangan) {
      statusKamera = 'memuat';
      const { PengelolaTangan } = await import('../lib/handTracker.ts');
      pengelolaTangan = new PengelolaTangan();
    }
    await pengelolaTangan.mulai(
      videoKameraEl,
      (frame: FrameTangan) => {
        jumlahTanganTerdeteksi = frame.jumlahTangan;
        const kanan = frame.tanganKanan;
        const kiri = frame.tanganKiri;
        gesturTerkini = kanan?.gestur ?? kiri?.gestur ?? '-';

        if (kiri) {
          posKidang = Math.max(-0.85, Math.min(0.85, (kiri.pusatX - 0.5) * 1.8));
        }
        if (kanan) {
          posRama = Math.max(-0.85, Math.min(0.85, (kanan.pusatX - 0.5) * 1.8));
          const zoom = kanan.gestur === 'cubit' ? 1.4 : 1.0;
          twinStage?.aturPutaranTangan((kanan.pusatX - 0.5) * 1.2, zoom);
          wayangStage?.terapkanGesturPanggung({
            kemiringan: kanan.kemiringan,
            intensitasSabetan: kanan.gestur === 'kepal' ? 1 : 0,
          });
        }
        wayangStage?.aturPosisiTokoh(posRama, posKidang);
      },
      (st) => {
        statusKamera = st;
      },
    );
  }

  function handleMouseMoveGlobal(e: MouseEvent): void {
    const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
    const ny = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
    dioramaStage?.aturParalaks(nx, ny);
    orbStage?.aturArahKursor(nx, ny);
  }

  function handleWallMouseMove(e: MouseEvent): void {
    if (!canUseHoverPointer()) {
      wallTiltX = 0;
      wallTiltY = 0;
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    wallTiltX = -ny * 3.5;
    wallTiltY = nx * 4.5;
  }

  function formatSumberLabel(s: KodeSumber): string {
    return `${s} · ${ambilTeks(DAFTAR_SUMBER[s].lembaga, bahasa)}`;
  }

  // =========================================================================
  // 4. Mount Global & Sinkronisasi URL History
  // =========================================================================
  onMount(() => {
    document.documentElement.setAttribute('data-theme', tema);
    document.documentElement.setAttribute('data-lang', bahasa);
    setI18nLanguage(bahasa);
    sinkronkanTemaBrowser(tema);
    smoothScrollCtrl = pasangSmoothScroll();

    jejakKurasi = bacaJejakKurasi();

    const terapkanUrlParams = (urlParams: URLSearchParams) => {
      const halParam = urlParams.get('hal') as HalamanId | null;
      halamanAktif =
        halParam && PAGE_META_STATIC.some((h) => h.id === halParam) ? halParam : 'beranda';

      const bendaParam = urlParams.get('benda') as SpesimenBedahId | null;
      const titikParam = urlParams.get('titik');
      if (bendaParam && DAFTAR_BEDAH_TWIN.some((b) => b.id === bendaParam)) {
        const bendaTarget = DAFTAR_BEDAH_TWIN.find((b) => b.id === bendaParam)!;
        bendaAktifId = bendaParam;
        const tMatch = titikParam ? bendaTarget.titikInfo.find((t) => t.id === titikParam) : undefined;
        titikAktifId = tMatch?.id ?? bendaTarget.titikInfo[0].id;
        pendingTwinTitikId = tMatch?.id ?? null;
        catatSpesimen(bendaParam);
      }

      const babakParam = urlParams.get('babak');
      if (babakParam !== null) {
        const parsedBabak = Number(babakParam);
        if (
          Number.isInteger(parsedBabak) &&
          parsedBabak >= 0 &&
          parsedBabak < LAKON_KIJANG_KENCANA.daftarBabak.length
        ) {
          babakIdx = parsedBabak;
          const bab = LAKON_KIJANG_KENCANA.daftarBabak[parsedBabak];
          if (bab) {
            posRama = bab.posisiAwalRama;
            posKidang = bab.posisiAwalKidang;
          }
          catatBabak(parsedBabak);
        }
      }
    };

    // Baca parameter halaman & spesimen deep-link dari URL (?hal=twin&benda=joglo&titik=...)
    terapkanUrlParams(new URLSearchParams(window.location.search));
    sinkronkanSeoHalaman(halamanAktif, bahasa);

    const onPopState = () => {
      hentikanSuaraDalang();
      terapkanUrlParams(new URLSearchParams(window.location.search));
      sinkronkanSeoHalaman(halamanAktif, bahasa);
      void tick().then(() => smoothScrollCtrl?.sync());
    };
    window.addEventListener('popstate', onPopState);

    // Preload malas modul 3D sub-halaman ketika idle agar perpindahan halaman bebas jeda
    const prefetchTimer = window.setTimeout(() => {
      void import('../scenes/digitalTwinStage.ts');
      void import('../scenes/coverflowStage.ts');
      void import('../scenes/sulukShowcaseStage.ts');
      void import('../scenes/wayangStage.ts');
      void import('../scenes/pamomongOrbStage.ts');
    }, 320);

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      tutupPreloaderSeketika();
    } else {
      const start = performance.now();
      const durasi = 140;
      const tickLoader = (now: number) => {
        const p = Math.min(1, (now - start) / durasi);
        preloaderProgres = Math.round(p * 100);
        if (p < 1 && !preloaderSelesai) {
          requestAnimationFrame(tickLoader);
        } else {
          preloaderSelesai = true;
        }
      };
      requestAnimationFrame(tickLoader);
    }

    return () => {
      window.clearTimeout(prefetchTimer);
      window.removeEventListener('popstate', onPopState);
      smoothScrollCtrl?.destroy();
      smoothScrollCtrl = null;
    };
  });

  onDestroy(() => {
    hentikanSuaraDalang();
    pengelolaTangan?.matikan();
    audioBudaya.hentikanSuasanaPendopo();
    dioramaStage?.destroy();
    twinStage?.destroy();
    coverflowStage?.destroy();
    wayangStage?.destroy();
    orbStage?.destroy();
  });
</script>

<svelte:window
  onmousemove={handleMouseMoveGlobal}
  onclick={(e) => {
    if (langMenuBuka && langDropdownEl && !langDropdownEl.contains(e.target as Node)) {
      langMenuBuka = false;
    }
  }}
  onkeydown={(e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchModalBuka = !searchModalBuka;
      return;
    }
    if (e.key === 'Escape') {
      if (searchModalBuka) searchModalBuka = false;
      if (modalSulukBuka) modalSulukBuka = false;
      if (langMenuBuka) langMenuBuka = false;
    }
  }}
/>

<!-- =========================================================================
     PRELOADER NUMERIK ARSIP (00 -> 100)
     ========================================================================= -->
<div
  class="preloader-curtain"
  class:is-done={preloaderSelesai}
  aria-hidden={preloaderSelesai}
  data-preloader-done={String(preloaderSelesai)}
>
  <div class="preloader-top">
    <span>{tI18n(bahasa, 'preloader.top')}</span>
    <button
      type="button"
      class="preloader-skip"
      onclick={tutupPreloaderSeketika}
      data-testid="skip-preloader"
    >
      {tI18n(bahasa, 'preloader.skip')}
    </button>
  </div>

  <div class="preloader-center">
    <svg class="preloader-emblem" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" />
      <path d="M32 10 L46 38 L18 38 Z" stroke="currentColor" stroke-width="2" />
    </svg>
    <div>
      <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;">
        {tI18n(bahasa, 'preloader.title')}
      </div>
      <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">
        {tI18n(bahasa, 'preloader.sub')}
      </div>
    </div>
  </div>

  <div class="preloader-bottom">
    <div class="preloader-count">{String(preloaderProgres).padStart(2, '0')}</div>
    <div class="preloader-bar-wrap">
      <div class="preloader-bar-fill" style="width: {preloaderProgres}%"></div>
    </div>
  </div>
</div>

<!-- =========================================================================
     FLOATING GLASS PILL NAVBAR (5 HALAMAN SELARAS + KONTROL GLOBAL)
     ========================================================================= -->
<header class="top-nav">
  <button
    type="button"
    class="brand-mark"
    onclick={() => pindahHalaman('beranda')}
    data-testid="nav-brand-beranda"
  >
    <span class="brand-dot" aria-hidden="true"></span>
    <span>KELIR</span>
    <span class="brand-aksara" lang="jv">ꦏꦼꦭꦶꦂ</span>
  </button>

  <nav class="nav-links" aria-label={tI18n(bahasa, 'nav.labelMenu')}>
    {#each daftarHalaman as hal}
      <button
        type="button"
        class="nav-page-tab"
        class:is-active={halamanAktif === hal.id}
        aria-current={halamanAktif === hal.id ? 'page' : undefined}
        onclick={() => pindahHalaman(hal.id)}
        data-testid="page-tab-{hal.id}"
      >
        <span class="nav-page-num">{hal.nomor}</span>
        <span>{hal.label}</span>
      </button>
    {/each}
  </nav>

  <div class="nav-controls">
    <button
      type="button"
      class="util-pill nav-search-btn"
      onclick={() => (searchModalBuka = true)}
      aria-label={tI18n(bahasa, 'nav.searchAria')}
      title={tI18n(bahasa, 'nav.searchAria')}
      data-testid="btn-search-modal"
    >
      <svg class="nav-search-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.8" stroke="currentColor" stroke-width="1.4" />
        <path d="M10.6 10.6L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span class="nav-search-text">{tI18n(bahasa, 'nav.searchBtn')}</span>
    </button>

    <button
      type="button"
      class="util-pill"
      class:is-active={audioAktif}
      onclick={toggleAudio}
      data-testid="toggle-audio"
      aria-pressed={audioAktif}
    >
      {audioAktif ? tI18n(bahasa, 'nav.suaraOn') : tI18n(bahasa, 'nav.suaraOff')}
    </button>

    <button
      type="button"
      class="util-pill"
      class:is-active={statusKamera === 'aktif'}
      onclick={toggleKameraTangan}
      data-testid="toggle-kamera"
    >
      {statusKamera === 'aktif' ? tI18n(bahasa, 'nav.gesturOn') : tI18n(bahasa, 'nav.gesturOff')}
    </button>

    <div
      class="lang-dropdown-wrap"
      bind:this={langDropdownEl}
      aria-label={tI18n(bahasa, 'nav.langAria')}
    >
      <button
        type="button"
        class="util-pill lang-dropdown-trigger"
        class:is-open={langMenuBuka}
        onclick={() => (langMenuBuka = !langMenuBuka)}
        aria-haspopup="listbox"
        aria-expanded={langMenuBuka}
        aria-label={tI18n(bahasa, 'nav.langAria')}
        data-testid="lang-switcher-btn"
      >
        <svg class="lang-globe-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.3" />
          <ellipse cx="8" cy="8" rx="3.1" ry="6.2" stroke="currentColor" stroke-width="1.15" />
          <path d="M2.2 8H13.8M3.3 5H12.7M3.3 11H12.7" stroke="currentColor" stroke-width="1.05" />
        </svg>
        <span class="lang-active-code">{bahasa.toUpperCase()}</span>
        <span class="lang-dropdown-chev" aria-hidden="true">&#9662;</span>
      </button>

      {#if langMenuBuka}
        <div
          class="lang-dropdown-menu"
          role="listbox"
          aria-label={tI18n(bahasa, 'nav.langAria')}
          data-testid="lang-dropdown-menu"
        >
          {#each DAFTAR_BAHASA as opt}
            <button
              type="button"
              role="option"
              aria-selected={bahasa === opt.id}
              class="lang-dropdown-item"
              class:is-active={bahasa === opt.id}
              onclick={() => pilihBahasa(opt.id)}
              data-testid="lang-{opt.id}"
            >
              <span class="lang-item-code">{opt.kode}</span>
              <span class="lang-item-text">
                <strong>{opt.label}</strong>
                <small>{opt.sublabel}</small>
              </span>
              {#if bahasa === opt.id}
                <span class="lang-item-check" aria-hidden="true">&#10003;</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <button
      type="button"
      class="util-pill"
      onclick={toggleTema}
      data-testid="toggle-tema"
      aria-label={tI18n(bahasa, 'nav.temaAria')}
    >
      {tema === 'malam' ? tI18n(bahasa, 'nav.temaMalam') : tI18n(bahasa, 'nav.temaTerang')}
    </button>

    <button
      type="button"
      class="nav-cta-white"
      onclick={() => pindahHalaman('twin')}
      data-testid="cta-nav-twin"
    >
      {tI18n(bahasa, 'nav.ctaTwin')}
    </button>
  </div>
</header>

<!-- Bar Navigasi Halaman Kompak untuk Layar Mobile/Tablet -->
<nav class="mobile-page-dock" aria-label={tI18n(bahasa, 'nav.quickNavAria')}>
  {#each daftarHalaman as hal}
    <button
      type="button"
      class="mobile-page-btn"
      class:is-active={halamanAktif === hal.id}
      onclick={() => pindahHalaman(hal.id)}
    >
      <span>{hal.nomor}</span>
      <span>{hal.label}</span>
    </button>
  {/each}
</nav>

<main class="page-stage-shell" data-active-page={halamanAktif}>
  {#if halamanAktif !== 'beranda'}
    <!-- Header Status Halaman Selaras untuk Halaman 02..05 -->
    <div class="subpage-status-strip">
      <div class="subpage-status-inner">
        <div class="subpage-breadcrumb">
          <button type="button" class="breadcrumb-home" onclick={() => pindahHalaman('beranda')}>
            {tI18n(bahasa, 'nav.berandaHome')}
          </button>
          <span aria-hidden="true">/</span>
          <span class="breadcrumb-current">
            {tI18n(bahasa, 'nav.halamanDari', {
              nomor: infoHalamanAktif.nomor,
              label: infoHalamanAktif.label.toUpperCase(),
            })}
          </span>
          <span class="breadcrumb-aksara" lang="jv">{infoHalamanAktif.aksara}</span>
        </div>

        <div class="subpage-quick-switch">
          <button
            type="button"
            class="util-pill"
            onclick={() => pindahHalaman(halamanSebelumnya.id)}
          >
            &#8592; {halamanSebelumnya.nomor} {halamanSebelumnya.label}
          </button>
          <button
            type="button"
            class="util-pill"
            onclick={() => pindahHalaman(halamanBerikutnya.id)}
          >
            {halamanBerikutnya.nomor} {halamanBerikutnya.label} &#8594;
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- =======================================================================
       HALAMAN 01: BERANDA, DIORAMA PENDOPO 3D, KRONIK 01-05 & ETALASE SPASIAL
       ======================================================================= -->
  {#if halamanAktif === 'beranda'}
    <section id="pendopo" class="diorama-master-band" aria-label="Diorama Pendopo Budaya Jawa 3D">
      <div class="diorama-sticky-stage">
        <div class="diorama-webgl-host" use:mountDioramaStage aria-hidden="true"></div>
        <div class="diorama-scrim"></div>

        <!-- Pin Callout 3D Terproyeksi Langsung ke Bangunan Diorama -->
        <div class="diorama-pins-layer" class:is-scrolly-dimmed={scrollyIndeksAktif >= 0}>
          {#each dioramaPins as pin}
            {@const info = DAFTAR_BENDA.find((b) => b.id === pin.bendaId)}
            {#if info && pin.terlihat}
              <button
                type="button"
                class="diorama-pin"
                class:is-selected={bendaSorotDiorama === pin.bendaId}
                style="left: {pin.x}px; top: {pin.y}px;"
                onmouseenter={() => {
                  bendaSorotDiorama = pin.bendaId;
                  dioramaStage?.sorotBangunan(pin.bendaId);
                }}
                onmouseleave={() => {
                  bendaSorotDiorama = null;
                  dioramaStage?.sorotBangunan(null);
                }}
                onclick={() => pilihPusaka(pin.bendaId, true)}
              >
                <span class="pin-dot" aria-hidden="true"></span>
                <span>{ambilTeks(info.dioramaLabel, bahasa)}</span>
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Hero Headline & CTA -->
      <div class="hero-overlay-copy" data-scrolly-idx="-1">
        <div class="hero-text-col">
          <span class="eyebrow-mono">
            <span class="live-dot" aria-hidden="true"></span>
            {tI18n(bahasa, 'hero.eyebrow')}
          </span>

          <h1 class="hero-h1">
            {tI18n(bahasa, 'hero.h1')}
          </h1>

          <p class="hero-lead">
            {tI18n(bahasa, 'hero.lead')}
          </p>

          <div class="hero-actions">
            <button
              type="button"
              class="pill-cta-white"
              onclick={() => pindahHalaman('twin')}
            >
              {tI18n(bahasa, 'hero.ctaTwin')}
            </button>
            <button
              type="button"
              class="pill-cta-outline"
              onclick={() => bukaModalSuluk(0)}
            >
              {tI18n(bahasa, 'hero.ctaSuluk')}
            </button>
          </div>

          <div class="hero-spec-strip" aria-label={tI18n(bahasa, 'hero.eyebrow')}>
            <div>
              <strong>5</strong>
              <span>{tI18n(bahasa, 'hero.stat1')}</span>
            </div>
            <div>
              <strong>16</strong>
              <span>{tI18n(bahasa, 'hero.stat2')}</span>
            </div>
            <div>
              <strong>S1–S7</strong>
              <span>{tI18n(bahasa, 'hero.stat3')}</span>
            </div>
          </div>

          <div class="hero-micro-meta">
            UNESCO ICH · Museum Sonobudoyo · Kemdikbud RI · Perpusnas RI
          </div>
        </div>

        <div class="hero-live-pill">
          <span class="live-dot" aria-hidden="true"></span>
          <span>{tI18n(bahasa, 'hero.hint')}</span>
        </div>
      </div>

      <!-- Scrollytelling 5 Bab dengan Angka Piksel 01..05 & Kartu HUD Kaca -->
      <div id="scrolly" class="scrolly-chapters">
        {#each KRONIK_SEJARAH_BUDAYA as kronik, idx}
          <article
            id="kronik-{kronik.nomor}"
            class="scrolly-step"
            class:is-active={scrollyIndeksAktif === idx}
            data-scrolly-idx={idx}
          >
            <div class="scrolly-narrative">
              <PixelNumber value={kronik.nomor} />
              <h2 class="scrolly-step-title">
                {ambilTeks(kronik.judul, bahasa)}
              </h2>
              <p class="scrolly-step-body" style="font-weight: 500; color: var(--text-primary);">
                {ambilTeks(kronik.sorotan, bahasa)}
              </p>
              <p class="scrolly-step-body">
                {ambilTeks(kronik.narasiMendalam, bahasa)}
              </p>
              <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 14px;">
                {#each kronik.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
            </div>

            <div class="scrolly-hud-card" use:pasangReveal={idx}>
              <div class="hud-header">
                <span>{tI18n(bahasa, 'hero.telemetryTitle')}</span>
                <span>{kronik.kodeArsip}</span>
              </div>

              {#each kronik.metrik as m}
                <div class="hud-metric-row">
                  <div class="hud-metric-meta">
                    <span style="color: var(--text-secondary);">{ambilTeks(m.label, bahasa)}</span>
                    <strong style="font-family: var(--font-mono);">{ambilTeks(m.nilai, bahasa)}</strong>
                  </div>
                  <div class="hud-bar">
                    <div class="hud-bar-fill" style="width: {m.persen}%"></div>
                  </div>
                </div>
              {/each}

              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
                <button
                  type="button"
                  class="util-pill"
                  class:is-active={wireframeDioramaAktif}
                  onclick={() => {
                    wireframeDioramaAktif = !wireframeDioramaAktif;
                    dioramaStage?.aturWireframeMode(wireframeDioramaAktif ? 0.85 : 0.08);
                  }}
                >
                  {wireframeDioramaAktif ? tI18n(bahasa, 'hero.wireframeOn') : tI18n(bahasa, 'hero.wireframeOff')}
                </button>
                <button
                  type="button"
                  class="nav-cta-white"
                  onclick={() => pilihPusaka(kronik.bendaId, true)}
                >
                  {tI18n(bahasa, 'hero.ctaScrolly')}
                </button>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <BerandaWallEtalase
      {tema}
      {bahasa}
      {halamanAktif}
      matrixItems={DINDING_MATRIX}
      {wallTiltX}
      {wallTiltY}
      onWallMouseMove={handleWallMouseMove}
      onWallMouseLeave={() => {
        wallTiltX = 0;
        wallTiltY = 0;
      }}
      {filterEtalase}
      onFilterChange={(kunci) => (filterEtalase = kunci)}
      {itemEtalaseTersaring}
      {daftarHalaman}
      onPilihPusaka={pilihPusaka}
      onPindahHalaman={(id, anchorId) => pindahHalaman(id as HalamanId, anchorId)}
    />
  {/if}

  <!-- =======================================================================
       HALAMAN 02: STUDIO KEMBARAN DIGITAL 3D (CAD & PBR STUDIO · 7 KOLEKSI)
       ======================================================================= -->
  {#if halamanAktif === 'twin'}
    <DigitalTwinStudio
      specimens={DAFTAR_BEDAH_TWIN}
      {bendaAktifId}
      {bendaAktif}
      {titikAktifId}
      {titikAktif}
      {modeVisualTwin}
      {faktorLedak}
      {aksiHidupTwin}
      {twinPins}
      {tema}
      {bahasa}
      keunggulan={KEUNGGULAN_SISTEM}
      pilar={PILAR_NILAI}
      mountStage={mountTwinStage}
      onPilihPusaka={(id) => pilihPusaka(id)}
      onResetKamera={() => twinStage?.resetKamera()}
      onPilihTitik={pilihTitikInfo}
      onModeVisual={aturModeVisualTwin}
      onUbahLedak={(val) => {
        faktorLedak = val;
        twinStage?.aturLedakAnatomi(val);
      }}
      onPicuEfek={() => {
        twinStage?.picuEfekKhusus3D();
        if (!audioAktif) {
          audioAktif = true;
          audioBudaya.aturAktif(true);
        }
        picuSuaraBenda(bendaAktif.id);
      }}
      onToggleAksiHidup={() => {
        aksiHidupTwin = twinStage?.toggleAksiHidup() ?? !aksiHidupTwin;
      }}
      onBunyikanWilah={bunyikanWilahTwin}
      onBukaSulukSpesimen={bukaSulukSpesimen}
      onPindahHalaman={(hal, anchor) => pindahHalaman(hal, anchor)}
      onScrollProgres={(p) => twinStage?.aturProgresGulir(p)}
    />
  {/if}

  <!-- =======================================================================
       HALAMAN 03: GALERI COVERFLOW 3D REALISTIS & REPERTOAR SULUK (7 KOLEKSI)
       ======================================================================= -->
  {#if halamanAktif === 'koleksi'}
    <CoverflowShowcase
      items={KOLEKSI_COVERFLOW}
      {coverflowIdx}
      {tema}
      {bahasa}
      {suasanaPendopoAktif}
      mountStage={mountCoverflowStage}
      onSelectIndex={pilihIndeksCoverflow}
      onGeser={geserCoverflow}
      onBukaModalSuluk={bukaModalSuluk}
      onToggleSuasanaGending={toggleSuasanaGending}
      onBukaItem={bukaItemCoverflow}
      onFokusAnatomi={(item, titikId) => pilihPusaka(item.artefakId, true, titikId ?? item.titikId)}
      onParalaks={(nx, ny) => coverflowStage?.aturParalaks(nx, ny)}
      onScrollProgres={(p) => coverflowStage?.aturProgresGulir(p)}
    />
  {/if}

  <!-- =======================================================================
       HALAMAN 04: PANGGUNG PAKELIRAN WAYANG KULIT 3D (LAKON KIJANG KENCANA)
       ======================================================================= -->
  {#if halamanAktif === 'pakeliran'}
    <section id="pakeliran" class="band-section" aria-label={tI18n(bahasa, 'pakeliran.h1')}>
      <div class="band-header">
        <div>
          <span class="eyebrow-mono">{tI18n(bahasa, 'pakeliran.eyebrow')}</span>
          <h1 class="display-h2">
            {tI18n(bahasa, 'pakeliran.h1')}
          </h1>
        </div>

        <div class="artifact-tab-row">
          {#each LAKON_KIJANG_KENCANA.daftarBabak as bab, bI}
            <button
              type="button"
              class="tab-chip"
              class:is-active={babakIdx === bI}
              onclick={() => pilihBabak(bI)}
              data-testid="babak-{bI}"
            >
              {tI18n(bahasa, 'pakeliran.actChip', { nomor: bab.nomor })}
            </button>
          {/each}
        </div>
      </div>

      <div class="pakeliran-theatre-box">
        <div class="pakeliran-canvas-host" use:mountWayangStage></div>

        <div class="pakeliran-console">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
            <div>
              <div class="eyebrow-mono">
                {tI18n(bahasa, 'pakeliran.sceneMeta', {
                  nomor: babakAktif.nomor,
                  total: LAKON_KIJANG_KENCANA.daftarBabak.length,
                  lokasi: ambilTeks(babakAktif.lokasi, bahasa),
                  src: babakAktif.sumber.join(', '),
                })}
              </div>
              <h2 style="margin: 6px 0; font-family: var(--font-display); font-size: 1.45rem;">
                {ambilTeks(babakAktif.judul, bahasa)}
              </h2>
              <p style="margin: 0; color: var(--text-secondary); max-width: 720px; font-size: 0.94rem;">
                {ambilTeks(babakAktif.narasiDalang, bahasa)}
              </p>
              <p class="pakeliran-suluk-quote">
                {tI18n(bahasa, 'pakeliran.sulukPrefix')} "{ambilTeks(babakAktif.suluk, bahasa)}"
              </p>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
              <div class="mode-switch-group" role="group" aria-label={tI18n(bahasa, 'pakeliran.h1')}>
                {#each [
                  { id: 'blencong' as const, label: tI18n(bahasa, 'pakeliran.moodBlencong') },
                  { id: 'kelir' as const, label: tI18n(bahasa, 'pakeliran.moodKelir') },
                  { id: 'sorot' as const, label: tI18n(bahasa, 'pakeliran.moodSorot') },
                ] as mood}
                  <button
                    type="button"
                    class="mode-btn"
                    class:is-active={moodPanggungWayang === mood.id}
                    onclick={() => {
                      moodPanggungWayang = mood.id;
                      wayangStage?.aturMoodCahaya(moodPanggungWayang);
                    }}
                  >
                    {mood.label}
                  </button>
                {/each}
              </div>
              <button
                type="button"
                class="pill-cta-outline"
                onclick={() => {
                  wayangStage?.picuSabetanWayang();
                  if (audioAktif) audioBudaya.bunyikanCempalaKeprak();
                }}
              >
                {tI18n(bahasa, 'pakeliran.sabetanBtn')}
              </button>
              <button
                type="button"
                class="util-pill"
                class:is-active={dalangSuaraStatus !== 'diam'}
                onclick={() => void toggleSuaraDalang()}
                data-testid="btn-dalang-voice"
              >
                {dalangSuaraStatus === 'memuat'
                  ? tI18n(bahasa, 'pakeliran.dalangVoiceLoading')
                  : dalangSuaraStatus === 'diam'
                    ? tI18n(bahasa, 'pakeliran.dalangVoicePlay')
                    : tI18n(bahasa, 'pakeliran.dalangVoiceStop')}
              </button>
              {#if dalangSuaraStatus === 'gemini' || dalangSuaraStatus === 'webspeech'}
                <span class="dalang-voice-badge" data-testid="dalang-voice-badge">
                  {dalangSuaraStatus === 'gemini'
                    ? tI18n(bahasa, 'pakeliran.dalangVoiceGemini')
                    : tI18n(bahasa, 'pakeliran.dalangVoiceFallback')}
                </span>
              {/if}
              <button
                type="button"
                class="pill-cta-crimson"
                onclick={() => {
                  wayangStage?.picuPanahRama();
                  if (audioAktif) audioBudaya.bunyikanLesatanPanah();
                }}
                data-testid="btn-panah-rama"
              >
                {tI18n(bahasa, 'pakeliran.arrowBtn')}
              </button>
            </div>
          </div>

          <div class="two-col-editorial" style="margin-top: 4px;">
            <label class="pakeliran-slider-label">
              <span>{tI18n(bahasa, 'pakeliran.kidangPos', { pos: posKidang.toFixed(2) })}</span>
              <input
                type="range"
                min="-0.85"
                max="0.85"
                step="0.02"
                value={posKidang}
                oninput={(e) => {
                  posKidang = Number((e.currentTarget as HTMLInputElement).value);
                  wayangStage?.aturPosisiTokoh(posRama, posKidang);
                }}
              />
            </label>
            <label class="pakeliran-slider-label">
              <span>{tI18n(bahasa, 'pakeliran.ramaPos', { pos: posRama.toFixed(2) })}</span>
              <input
                type="range"
                min="-0.85"
                max="0.85"
                step="0.02"
                value={posRama}
                oninput={(e) => {
                  posRama = Number((e.currentTarget as HTMLInputElement).value);
                  wayangStage?.aturPosisiTokoh(posRama, posKidang);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Detail Anatomi Tatahan Wayang & Panduan Gestur Dalang -->
      <div class="two-col-editorial" style="margin-top: 28px;">
        <div class="editorial-pillar-card" use:pasangReveal>
          <span class="eyebrow-mono">{tI18n(bahasa, 'pakeliran.carvingEyebrow')}</span>
          <h3 style="margin: 8px 0; font-family: var(--font-display); font-size: 1.28rem;">
            {tI18n(bahasa, 'pakeliran.carvingTitle')}
          </h3>
          <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary);">
            {tI18n(bahasa, 'pakeliran.carvingDesc')}
          </p>
        </div>

        <div class="editorial-pillar-card" use:pasangReveal>
          <span class="eyebrow-mono">{tI18n(bahasa, 'pakeliran.gestureEyebrow')}</span>
          <h3 style="margin: 8px 0; font-family: var(--font-display); font-size: 1.28rem;">
            {tI18n(bahasa, 'pakeliran.gestureTitle')}
          </h3>
          <p style="margin: 0 0 14px; font-size: 0.88rem; color: var(--text-secondary);">
            {tI18n(bahasa, 'pakeliran.gestureDesc')}
          </p>
          <button
            type="button"
            class="util-pill"
            onclick={() => pilihPusaka('wayang', true)}
          >
            {tI18n(bahasa, 'pakeliran.gestureCta')}
          </button>
        </div>
      </div>
    </section>
  {/if}

  <!-- =======================================================================
       HALAMAN 05: LAB AKSARA HANACARAKA, PAMOMONG AI ORB & PUSTAKA S1-S7
       ======================================================================= -->
  {#if halamanAktif === 'kawruh'}
    <KawruhOrbSection
      {bahasa}
      bendaAktif={bendaPamomongAktif}
      bind:pertanyaanInput
      {sediaTanya}
      {jawabanPamomong}
      onKirimTanya={kirimTanyaPamomong}
      onPilihContohPertanyaan={(contohQ) => {
        pertanyaanInput = contohQ;
        void kirimTanyaPamomong();
      }}
      {mountOrbStage}
      bind:inputAksaraLatin
      {aksaraTerkonversi}
      {kartuCarakanTerpilih}
      onPilihCarakan={(c) => {
        kartuCarakanTerpilih = c;
        inputAksaraLatin = c.contohKata;
        if (audioAktif) audioBudaya.bunyikanWilahSaron(Math.floor(Math.random() * 6), 0.14);
      }}
      {formatSumberLabel}
      onSimpanSkorKuis={catatSkorKuis}
    />
  {/if}

  <!-- =======================================================================
       PORTAL TRANSISI ANTAR-HALAMAN MINIMALIS
       ======================================================================= -->
  <section class="next-page-bridge" aria-label={tI18n(bahasa, 'nav.quickNavAria')}>
    <div class="next-page-bridge-inner">
      <button
        type="button"
        class="bridge-card"
        onclick={() => pindahHalaman(halamanSebelumnya.id)}
      >
        <span class="eyebrow-mono">{tI18n(bahasa, 'bridge.prev', { nomor: halamanSebelumnya.nomor })}</span>
        <div class="bridge-card-title">{halamanSebelumnya.label}</div>
      </button>

      <div class="bridge-status-center">
        <span>{tI18n(bahasa, 'bridge.center', { nomor: infoHalamanAktif.nomor })}</span>
        <span lang="jv" style="font-family: var(--font-jawa); color: var(--accent-ember);">
          {infoHalamanAktif.aksara}
        </span>
      </div>

      <button
        type="button"
        class="bridge-card is-primary"
        onclick={() => pindahHalaman(halamanBerikutnya.id)}
        data-testid="next-page-btn"
      >
        <span class="eyebrow-mono">{tI18n(bahasa, 'bridge.next', { nomor: halamanBerikutnya.nomor })}</span>
        <div class="bridge-card-title">{halamanBerikutnya.label}</div>
      </button>
    </div>
  </section>
</main>

<FooterSection
  {bahasa}
  {daftarHalaman}
  onPindahHalaman={(id) => pindahHalaman(id as HalamanId)}
  onPilihPusaka={pilihPusaka}
/>

<!-- =========================================================================
     MODAL SULUK LAYAR PENUH 3D PBR & MUSIKOLOGIA KARAWITAN
     ========================================================================= -->
{#if modalSulukBuka}
  <SulukModal
    tracks={KOLEKSI_COVERFLOW}
    trackIdx={modalSulukTrackIdx}
    {sulukLarikAktif}
    {tema}
    {bahasa}
    {audioAktif}
    {suasanaPendopoAktif}
    onClose={() => (modalSulukBuka = false)}
    onSelectTrack={bukaModalSuluk}
    onSelectLarik={(lIdx) => (sulukLarikAktif = lIdx)}
    onEnsureAudio={() => {
      if (!audioAktif) {
        audioAktif = true;
        audioBudaya.aturAktif(true);
      }
    }}
    onToggleSuasanaGending={toggleSuasanaGending}
    onSelectBahasa={pilihBahasa}
    onBukaBedah3D={(id) => pilihPusaka(id, true)}
  />
{/if}

<!-- Umpan Kamera MediaPipe 21-Titik Lokal (Tersembunyi jika nonaktif) -->
<div class="webcam-pip" style:display={statusKamera === 'nonaktif' ? 'none' : 'block'}>
  <video bind:this={videoKameraEl} autoplay muted playsinline></video>
  <div style="padding: 8px 10px; display: flex; justify-content: space-between;">
    <span>{tI18n(bahasa, 'webcam.hands', { count: jumlahTanganTerdeteksi })}</span>
    <span>{gesturTerkini}</span>
  </div>
</div>

<KarawitanBar
  {bahasa}
  {audioAktif}
  suasanaAktif={suasanaPendopoAktif}
  onToggleSuasana={toggleSuasanaGending}
  onPilihGending={pilihGendingLatar}
/>

<SearchModal
  {bahasa}
  terbuka={searchModalBuka}
  jejak={jejakKurasi}
  onClose={() => (searchModalBuka = false)}
  onEksekusiAksi={eksekusiAksiPencarian}
/>

<KelirCursor {tema} />
