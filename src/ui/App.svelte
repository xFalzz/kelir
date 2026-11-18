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
  import type { TabLegalModal } from '../content/legalInfo.ts';
  import type { LangkahRuteTur } from '../lib/aiStudio.ts';
  import { audioBudaya, NADA_SARON_SLENDRO } from '../lib/audioBudaya.ts';
  import { mintaSuaraDalangBabak } from '../lib/dalangVoice.ts';
  import { type GendingId } from '../lib/gendingJawa.ts';
  import type { FrameTangan, PengelolaTangan, StatusKamera } from '../lib/handTracker.ts';
  import type { KinetikSaronGestur } from '../lib/saronGestur.ts';
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
  import {
    ambilStatusPwa,
    berlanggananPwa,
    bersihkanDeferredPrompt,
    cekIosSafari,
    cekModeStandalone,
    inisialisasiPendengarPwa,
    picuInstalasiPwa,
    type PwaInstallPromptEvent,
  } from '../lib/pwa.ts';
  import { sinkronkanSeo404, sinkronkanSeoHalaman, sinkronkanTemaBrowser } from '../lib/seoGeo.ts';
  import {
    evaluasiRuteUrl,
    type HasilEvaluasiRute,
  } from '../lib/routeGuard.ts';
  import {
    apakahTargetGulirInternal,
    pasangSmoothScroll,
    type SmoothScrollController,
  } from '../lib/smoothScroll.ts';
  import {
    base64AudioKeBlobUrl,
    hentikanWebSpeech,
    putarkanWebSpeech,
  } from '../lib/sulukNarasi.ts';
  import type { HasilTanya } from '../lib/tanya.ts';
  import type { CoverflowStage } from '../scenes/coverflowStage.ts';
  import type { DigitalTwinStage, ModeVisualTwin, ProyeksiPinTwin } from '../scenes/digitalTwinStage.ts';
  import { LivingPendopoStage, type ProyeksiPinDiorama } from '../scenes/livingPendopoStage.ts';
  import type { PamomongOrbStage } from '../scenes/pamomongOrbStage.ts';
  import type { MoodPanggungWayang, WayangStage } from '../scenes/wayangStage.ts';
  import BerandaWallEtalase, { type FilterEtalase } from './components/BerandaWallEtalase.svelte';
  import FooterSection from './components/FooterSection.svelte';
  import KarawitanBar from './components/KarawitanBar.svelte';
  import KelirCursor from './components/KelirCursor.svelte';
  import NotFoundPage from './components/NotFoundPage.svelte';
  import PixelNumber from './PixelNumber.svelte';

  // Arsitektur 5 halaman terpadu
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

  const BENDA_VALID_IDS = DAFTAR_BEDAH_TWIN.map((b) => b.id);
  const ruteAwal: HasilEvaluasiRute =
    typeof window !== 'undefined'
      ? evaluasiRuteUrl(
          window.location.pathname,
          window.location.search,
          BENDA_VALID_IDS,
          LAKON_KIJANG_KENCANA.daftarBabak.length,
        )
      : { valid: true, halaman: 'beranda', urlDiminta: '/' };

  let halamanAktif: HalamanId = $state(ruteAwal.halaman);
  let ruteTidakDitemukan = $state(!ruteAwal.valid);
  let infoRute404: HasilEvaluasiRute | null = $state(ruteAwal.valid ? null : ruteAwal);
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

  // Coverflow 3D & Modal Suluk state
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

  // Pencarian Global, Paspor Jejak Kurasi & Skala Keterbacaan
  let searchModalBuka = $state(false);
  let legalModalBuka = $state(false);
  let legalModalTab: TabLegalModal = $state('syarat');
  let jejakKurasi: JejakKurasi = $state(jejakKurasiKosong());
  let skalaTeks: 'normal' | 'besar' = $state('normal');

  // Progressive Web App (PWA) Install State
  let deferredInstallPrompt: PwaInstallPromptEvent | null = $state(null);
  let pwaTerpasang = $state(false);
  let pwaIosSafari = $state(false);
  let pwaPanduanTerbuka = $state(false);
  let pwaBannerDismissed = $state(false);

  async function pasangAplikasiPwa(): Promise<void> {
    if (pwaTerpasang) return;
    if (deferredInstallPrompt) {
      const outcome = await picuInstalasiPwa(deferredInstallPrompt);
      deferredInstallPrompt = null;
      bersihkanDeferredPrompt();
      if (outcome === 'accepted') {
        pwaTerpasang = true;
        pwaPanduanTerbuka = false;
      }
      return;
    }
    pwaPanduanTerbuka = !pwaPanduanTerbuka;
  }

  function aturSkalaTeks(skala: 'normal' | 'besar'): void {
    skalaTeks = skala;
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = skala === 'besar' ? '112.5%' : '';
    }
  }

  // Lab Aksara Jawa & Pamomong AI State (Halaman 05)
  let inputAksaraLatin = $state('Kelir warisan budaya Jawa nusantara.');
  let kartuCarakanTerpilih: KartuCarakan = $state(DAFTAR_CARAKAN[4]);
  type DigitalTwinStudioType = typeof import('./components/DigitalTwinStudio.svelte').default;
  type CoverflowShowcaseType = typeof import('./components/CoverflowShowcase.svelte').default;
  type KawruhOrbSectionType = typeof import('./components/KawruhOrbSection.svelte').default;
  type SulukModalType = typeof import('./components/SulukModal.svelte').default;
  type SearchModalType = typeof import('./components/SearchModal.svelte').default;
  type LegalModalType = typeof import('./components/LegalInfoModal.svelte').default;
  type TanyaModuleType = typeof import('../lib/tanya.ts');

  let DigitalTwinStudioComp: DigitalTwinStudioType | null = $state(null);
  let CoverflowShowcaseComp: CoverflowShowcaseType | null = $state(null);
  let KawruhOrbSectionComp: KawruhOrbSectionType | null = $state(null);
  let SulukModalComp: SulukModalType | null = $state(null);
  let SearchModalComp: SearchModalType | null = $state(null);
  let LegalModalComp: LegalModalType | null = $state(null);
  let tanyaModulCache: TanyaModuleType | null = null;
  let tanyaModulPromise: Promise<TanyaModuleType> | null = null;
  let sudahTanyaPamomongManual = false;

  function muatTanyaModul(): Promise<TanyaModuleType> {
    if (tanyaModulCache) return Promise.resolve(tanyaModulCache);
    if (!tanyaModulPromise) {
      tanyaModulPromise = import('../lib/tanya.ts').then((mod) => {
        tanyaModulCache = mod;
        return mod;
      });
    }
    return tanyaModulPromise;
  }

  function pastikanKomponenHalaman(hal: HalamanId): void {
    if (hal === 'twin' && !DigitalTwinStudioComp) {
      void import('./components/DigitalTwinStudio.svelte').then((m) => (DigitalTwinStudioComp = m.default));
    } else if (hal === 'koleksi' && !CoverflowShowcaseComp) {
      void import('./components/CoverflowShowcase.svelte').then((m) => (CoverflowShowcaseComp = m.default));
    } else if (hal === 'kawruh') {
      if (!KawruhOrbSectionComp) {
        void import('./components/KawruhOrbSection.svelte').then((m) => (KawruhOrbSectionComp = m.default));
      }
      void muatTanyaModul().then(({ jawabDariKurasiLokal }) => {
        if (!sudahTanyaPamomongManual) {
          const queryToUse =
            pertanyaanInput.trim() || ambilTeks(bendaPamomongAktif.pertanyaanContoh[0], bahasa);
          jawabanPamomong = jawabDariKurasiLokal(bendaPamomongAktif.id, queryToUse, bahasa);
        }
      });
    }
  }

  function pastikanModalSuluk(): void {
    if (!SulukModalComp) {
      void import('./components/SulukModal.svelte').then((m) => (SulukModalComp = m.default));
    }
  }

  function pastikanSearchModal(): void {
    if (!SearchModalComp) {
      void import('./components/SearchModal.svelte').then((m) => (SearchModalComp = m.default));
    }
  }

  function pastikanLegalModal(): void {
    if (!LegalModalComp) {
      void import('./components/LegalInfoModal.svelte').then((m) => (LegalModalComp = m.default));
    }
  }

  function bukaSearchModal(): void {
    searchModalBuka = true;
    pastikanSearchModal();
  }

  function bukaLegalModal(tab: TabLegalModal = 'syarat'): void {
    legalModalTab = tab;
    legalModalBuka = true;
    pastikanLegalModal();
  }

  function buatJawabanPamomongAwal(benda: BendaPusaka, nextLang: BahasaAktif): HasilTanya {
    return {
      jawaban: `${ambilTeks(benda.nama, nextLang)}: ${ambilTeks(benda.filosofi, nextLang)}`,
      sumber: benda.sumber,
      mode: 'bm25-kurasi-lokal',
      modelNama: 'Pamomong Nusantara',
      statusGrounding: 'terbukti',
      skorKeyakinan: 98,
      kataKunciCocok: [benda.id],
      latensiMs: 0.4,
      butirBukti: [
        {
          id: `ringkas-${benda.id}`,
          judul: ambilTeks(benda.nama, nextLang),
          kategori: ambilTeks(benda.kategori, nextLang),
          kutipan: ambilTeks(benda.sejarahSingkat, nextLang),
          sumber: benda.sumber,
          skorRelatif: 100,
        },
      ],
      rujukan: benda.sumber.map((kode) => ({
        kode,
        judul: DAFTAR_SUMBER[kode].judul,
        lembaga: DAFTAR_SUMBER[kode].lembaga,
      })),
    };
  }

  let pertanyaanInput = $state('');
  let sediaTanya = $state(false);
  let jawabanPamomong: HasilTanya = $state(buatJawabanPamomongAwal(DAFTAR_BENDA[0], 'id'));

  $effect(() => {
    if (halamanAktif === 'twin' || halamanAktif === 'koleksi' || halamanAktif === 'kawruh') {
      pastikanKomponenHalaman(halamanAktif);
    }
  });

  $effect(() => {
    if (modalSulukBuka) {
      pastikanModalSuluk();
    }
  });

  $effect(() => {
    if (searchModalBuka) {
      pastikanSearchModal();
    }
  });

  const popupModalAktif = $derived(modalSulukBuka || searchModalBuka || legalModalBuka);

  $effect(() => {
    if (typeof document === 'undefined') return;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    htmlEl.classList.toggle('has-modal-open', popupModalAktif);
    bodyEl.classList.toggle('has-modal-open', popupModalAktif);

    if (!popupModalAktif) {
      void tick().then(() => smoothScrollCtrl?.sync());
      return;
    }

    const blokirTouchLatar = (e: TouchEvent): void => {
      if (e.touches.length > 1) return;
      if (!apakahTargetGulirInternal(e.target, 0) && e.cancelable) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', blokirTouchLatar, { passive: false });
    return () => {
      window.removeEventListener('touchmove', blokirTouchLatar);
      htmlEl.classList.remove('has-modal-open');
      bodyEl.classList.remove('has-modal-open');
    };
  });

  // Hand Tracker Webcam State (Global Utility)
  let statusKamera: StatusKamera = $state('nonaktif');
  let gesturTerkini = $state('-');
  let jumlahTanganTerdeteksi = $state(0);
  let videoKameraEl: HTMLVideoElement | undefined = $state();
  let saronHoverWilahIdx: number | null = $state(null);
  let saronStruckWilahIdx: number | null = $state(null);
  let saronStruckTimer: number | null = null;
  let lastTwinKepal = false;
  let saronGesturEval: {
    prosesFrame: (frame: FrameTangan) => KinetikSaronGestur;
    reset: () => void;
  } | null = null;

  // Instance Panggung WebGL Aktif (dimuat malas sesuai halaman aktif)
  let dioramaStage: LivingPendopoStage | null = null;
  let twinStage: DigitalTwinStage | null = null;
  let coverflowStage: CoverflowStage | null = null;
  let wayangStage: WayangStage | null = null;
  let orbStage: PamomongOrbStage | null = null;
  let pengelolaTangan: PengelolaTangan | null = null;
  let smoothScrollCtrl: SmoothScrollController | null = null;
  let pendingTwinTitikId: string | null = null;

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

  // Svelte actions untuk siklus hidup WebGL 3D per halaman
  function mountDioramaStage(node: HTMLDivElement) {
    dioramaStage = new LivingPendopoStage(node, tema);
    dioramaStage.onProyeksiPin((pins) => {
      dioramaPins = pins;
    });

    const ro = new ResizeObserver(() => dioramaStage?.ubahUkuran());
    ro.observe(node);

    let io: IntersectionObserver | null = null;
    let scrollyRaf: number | null = null;
    let langkahNodes: HTMLElement[] = [];

    const sinkronkanBabAktifDariViewport = (): void => {
      if (langkahNodes.length === 0) return;
      const pusatY = window.innerHeight * 0.48;
      let terbaikIdx = -1;
      let jarakMin = Infinity;

      for (const el of langkahNodes) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const val = Number(el.getAttribute('data-scrolly-idx'));
        if (Number.isNaN(val)) continue;
        const tengahEl = (rect.top + rect.bottom) * 0.5;
        const jarak = Math.abs(tengahEl - pusatY);
        if (jarak < jarakMin) {
          jarakMin = jarak;
          terbaikIdx = val;
        }
      }

      if (terbaikIdx !== scrollyIndeksAktif) {
        scrollyIndeksAktif = terbaikIdx;
        dioramaStage?.aturProgresGulir(terbaikIdx);
      }
    };

    const jadwalkanCekScroll = (): void => {
      if (scrollyRaf !== null) return;
      scrollyRaf = window.requestAnimationFrame(() => {
        scrollyRaf = null;
        sinkronkanBabAktifDariViewport();
      });
    };

    window.addEventListener('scroll', jadwalkanCekScroll, { passive: true });
    void tick().then(() => {
      langkahNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-scrolly-idx]'));
      io = new IntersectionObserver(jadwalkanCekScroll, {
        threshold: [0.15, 0.45, 0.75],
      });
      langkahNodes.forEach((n) => io?.observe(n));
      sinkronkanBabAktifDariViewport();
    });

    return {
      destroy() {
        window.removeEventListener('scroll', jadwalkanCekScroll);
        if (scrollyRaf !== null) window.cancelAnimationFrame(scrollyRaf);
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
    let rafId: number | null = null;

    void import('../scenes/digitalTwinStage.ts').then(({ DigitalTwinStage }) => {
      if (destroyed) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
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
    });

    return {
      destroy() {
        destroyed = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        ro?.disconnect();
        twinStage?.destroy();
        twinStage = null;
      },
    };
  }

  function mountCoverflowStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;
    let rafId: number | null = null;

    void import('../scenes/coverflowStage.ts').then(({ CoverflowStage }) => {
      if (destroyed) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
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
    });

    return {
      destroy() {
        destroyed = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        ro?.disconnect();
        coverflowStage?.destroy();
        coverflowStage = null;
      },
    };
  }

  function mountWayangStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;
    let rafId: number | null = null;

    void import('../scenes/wayangStage.ts').then(({ WayangStage }) => {
      if (destroyed) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (destroyed) return;
        wayangStage = new WayangStage(node);
        wayangStage.aturPosisiTokoh(posRama, posKidang);
        wayangStage.aturMoodCahaya(moodPanggungWayang);

        ro = new ResizeObserver(() => wayangStage?.ubahUkuran());
        ro.observe(node);
      });
    });

    return {
      destroy() {
        destroyed = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        ro?.disconnect();
        wayangStage?.destroy();
        wayangStage = null;
      },
    };
  }

  function mountOrbStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;
    let rafId: number | null = null;

    void import('../scenes/pamomongOrbStage.ts').then(({ PamomongOrbStage }) => {
      if (destroyed) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (destroyed) return;
        orbStage = new PamomongOrbStage(node, tema);

        ro = new ResizeObserver(() => orbStage?.ubahUkuran());
        ro.observe(node);
      });
    });

    return {
      destroy() {
        destroyed = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        ro?.disconnect();
        orbStage?.destroy();
        orbStage = null;
      },
    };
  }

  // Navigasi antar-halaman & sinkronisasi URL
  function sinkronkanUrlDeepLink(): void {
    if (typeof window === 'undefined') return;
    ruteTidakDitemukan = false;
    infoRute404 = null;
    const url = new URL(window.location.href);
    url.pathname = '/';
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

  function toggleFavoritSpesimen(id: SpesimenBedahId): void {
    const daftar = jejakKurasi.favoritIds ?? [];
    const ada = daftar.includes(id);
    jejakKurasi = {
      ...jejakKurasi,
      favoritIds: ada ? daftar.filter((item) => item !== id) : [...daftar, id],
    };
    simpanJejakKurasi(jejakKurasi);
  }

  function bukaLangkahTur(step: LangkahRuteTur): void {
    if (step.ruang === 'twin') {
      pilihPusaka(step.bendaId ?? 'keris', true, step.titikId);
      return;
    }
    if (step.ruang === 'koleksi') {
      const idx = KOLEKSI_COVERFLOW.findIndex((c) => c.artefakId === step.bendaId);
      bukaModalSuluk(step.trackIdx ?? (idx >= 0 ? idx : 0));
      return;
    }
    if (step.ruang === 'pakeliran') {
      pilihBabak(step.babakIdx ?? 0);
      pindahHalaman('pakeliran');
      return;
    }
    pindahHalaman('kawruh', 'aksara');
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
    if (id !== 'twin') {
      saronGesturEval?.reset();
      saronHoverWilahIdx = null;
      saronStruckWilahIdx = null;
      lastTwinKepal = false;
      twinStage?.matikanGesturTangan();
    }
    halamanAktif = id;
    ruteTidakDitemukan = false;
    infoRute404 = null;
    wallTiltX = 0;
    wallTiltY = 0;
    if (id === 'twin') catatSpesimen(bendaAktifId);
    if (id === 'pakeliran') catatBabak(babakIdx);
    sinkronkanSeoHalaman(id, bahasa);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/';
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
    if (ruteTidakDitemukan && infoRute404) {
      sinkronkanSeo404(nextLang, infoRute404.urlDiminta);
    } else {
      sinkronkanSeoHalaman(halamanAktif, nextLang);
    }

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
    if (halamanAktif === 'kawruh' || tanyaModulCache) {
      void muatTanyaModul().then(({ jawabDariKurasiLokal }) => {
        if (bahasa === nextLang) {
          jawabanPamomong = jawabDariKurasiLokal(bendaPamomongAktif.id, queryToUse, nextLang);
        }
      });
    } else {
      jawabanPamomong = buatJawabanPamomongAwal(bendaPamomongAktif, nextLang);
    }
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
    saronGesturEval?.reset();
    saronHoverWilahIdx = null;
    saronStruckWilahIdx = null;
    twinStage?.matikanGesturTangan();

    if (bukaHalamanTwin) {
      pindahHalaman('twin');
    } else if (halamanAktif === 'twin') {
      sinkronkanUrlDeepLink();
    }
  }

  function sorotWilahDipukul(idx: number): void {
    saronStruckWilahIdx = idx;
    if (saronStruckTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(saronStruckTimer);
    }
    if (typeof window !== 'undefined') {
      saronStruckTimer = window.setTimeout(() => {
        saronStruckWilahIdx = null;
        saronStruckTimer = null;
      }, 340);
    }
  }

  function picuSuaraBenda(id: SpesimenBedahId, paksa = false): void {
    if (!audioAktif && !paksa) return;
    if (paksa) audioBudaya.izinkanEfekSuara();
    if (id === 'keris' || id === 'hanacaraka') audioBudaya.bunyikanHunusKeris();
    else if (id === 'saron') audioBudaya.bunyikanWilahSaron(3);
    else if (id === 'batik') audioBudaya.bunyikanCantingMalam();
    else if (id === 'joglo') audioBudaya.bunyikanKetukKayuJoglo();
    else audioBudaya.bunyikanCempalaKeprak();
  }

  function bunyikanWilahTwin(idx: number): void {
    audioBudaya.izinkanEfekSuara();
    if (!audioAktif) {
      audioAktif = true;
    }
    audioBudaya.bunyikanWilahSaron(idx);
    twinStage?.pukulWilahSaron(idx, 1);
    sorotWilahDipukul(idx);
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
    sudahTanyaPamomongManual = true;
    sediaTanya = true;
    orbStage?.picuDenyutBerpikir();
    const { tanyakanKeAsisten } = await muatTanyaModul();
    jawabanPamomong = await tanyakanKeAsisten(bendaPamomongAktif.id, q, bahasa);
    sediaTanya = false;
  }

  async function toggleKameraTangan(): Promise<void> {
    if (statusKamera === 'aktif' || statusKamera === 'memuat') {
      pengelolaTangan?.matikan();
      saronGesturEval?.reset();
      saronHoverWilahIdx = null;
      saronStruckWilahIdx = null;
      lastTwinKepal = false;
      twinStage?.matikanGesturTangan();
      return;
    }
    if (!videoKameraEl) return;
    // Buka AudioContext pada interaksi klik agar Saron & efek 3D langsung bersuara saat digerakkan
    audioBudaya.izinkanEfekSuara();

    if (!pengelolaTangan || !saronGesturEval) {
      statusKamera = 'memuat';
      const [{ PengelolaTangan }, { EvaluatorGesturSaron }] = await Promise.all([
        import('../lib/handTracker.ts'),
        import('../lib/saronGestur.ts'),
      ]);
      if (!pengelolaTangan) pengelolaTangan = new PengelolaTangan();
      if (!saronGesturEval) saronGesturEval = new EvaluatorGesturSaron();
    }
    await pengelolaTangan.mulai(
      videoKameraEl,
      (frame: FrameTangan) => {
        jumlahTanganTerdeteksi = frame.jumlahTangan;
        const kanan = frame.tanganKanan;
        const kiri = frame.tanganKiri;
        const utama = frame.tanganUtama ?? kanan ?? kiri;
        gesturTerkini = utama?.gestur ?? '-';

        if (halamanAktif === 'twin' && twinStage) {
          if (bendaAktifId === 'saron' && saronGesturEval) {
            const kinetik = saronGesturEval.prosesFrame(frame);
            saronHoverWilahIdx = kinetik.hoverWilahIdx;
            twinStage.terapkanGesturSaron(kinetik);
            if (kinetik.pukulWilahIdx !== null) {
              audioBudaya.izinkanEfekSuara();
              audioBudaya.bunyikanWilahSaron(kinetik.pukulWilahIdx, kinetik.amplitudoPukul);
              sorotWilahDipukul(kinetik.pukulWilahIdx);
            }
          } else {
            saronHoverWilahIdx = null;
            if (utama) {
              const zoom = utama.gestur === 'cubit' ? 1.38 : 1.0;
              twinStage.terapkanGesturTanganUmum(utama.pusatX, utama.pusatY, utama.kemiringan, zoom);
              if (utama.gestur === 'kepal' && !lastTwinKepal) {
                twinStage.picuEfekKhusus3D();
                picuSuaraBenda(bendaAktifId, true);
              }
              lastTwinKepal = utama.gestur === 'kepal';
            } else {
              lastTwinKepal = false;
              twinStage.matikanGesturTangan();
            }
          }
        }

        if (kiri) {
          posKidang = Math.max(-0.85, Math.min(0.85, (kiri.pusatX - 0.5) * 1.8));
        }
        if (kanan) {
          posRama = Math.max(-0.85, Math.min(0.85, (kanan.pusatX - 0.5) * 1.8));
          wayangStage?.terapkanGesturPanggung({
            kemiringan: kanan.kemiringan,
            intensitasSabetan: kanan.gestur === 'kepal' ? 1 : 0,
          });
        }
        wayangStage?.aturPosisiTokoh(posRama, posKidang);
      },
      (st) => {
        statusKamera = st;
        if (st !== 'aktif' && st !== 'memuat') {
          saronGesturEval?.reset();
          saronHoverWilahIdx = null;
          saronStruckWilahIdx = null;
          lastTwinKepal = false;
          twinStage?.matikanGesturTangan();
        }
      },
    );
  }

  let mouseMoveRaf: number | null = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function handleMouseMoveGlobal(e: MouseEvent): void {
    if (!canUseHoverPointer()) return;
    if (halamanAktif !== 'beranda' && halamanAktif !== 'kawruh') return;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (mouseMoveRaf !== null) return;
    mouseMoveRaf = window.requestAnimationFrame(() => {
      mouseMoveRaf = null;
      const nx = (lastMouseX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (lastMouseY / Math.max(window.innerHeight, 1)) * 2 - 1;
      if (halamanAktif === 'beranda') dioramaStage?.aturParalaks(nx, ny);
      if (halamanAktif === 'kawruh') orbStage?.aturArahKursor(nx, ny);
    });
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

  onMount(() => {
    document.documentElement.setAttribute('data-theme', tema);
    document.documentElement.setAttribute('data-lang', bahasa);
    setI18nLanguage(bahasa);
    sinkronkanTemaBrowser(tema);
    smoothScrollCtrl = pasangSmoothScroll();

    jejakKurasi = bacaJejakKurasi();

    const terapkanUrlParams = (pathname: string, urlParams: URLSearchParams) => {
      const evalHasil = evaluasiRuteUrl(
        pathname,
        urlParams.toString() ? `?${urlParams.toString()}` : '',
        BENDA_VALID_IDS,
        LAKON_KIJANG_KENCANA.daftarBabak.length,
      );
      ruteTidakDitemukan = !evalHasil.valid;
      infoRute404 = evalHasil.valid ? null : evalHasil;
      halamanAktif = evalHasil.halaman;
      if (!evalHasil.valid) return;

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

    const sinkronkanSeoDariRute = () => {
      if (ruteTidakDitemukan && infoRute404) {
        sinkronkanSeo404(bahasa, infoRute404.urlDiminta);
      } else {
        sinkronkanSeoHalaman(halamanAktif, bahasa);
      }
    };

    terapkanUrlParams(window.location.pathname, new URLSearchParams(window.location.search));
    sinkronkanSeoDariRute();

    const onPopState = () => {
      hentikanSuaraDalang();
      terapkanUrlParams(window.location.pathname, new URLSearchParams(window.location.search));
      sinkronkanSeoDariRute();
      void tick().then(() => smoothScrollCtrl?.sync());
    };
    window.addEventListener('popstate', onPopState);

    inisialisasiPendengarPwa();
    const awalPwa = ambilStatusPwa();
    deferredInstallPrompt = awalPwa.deferredPrompt;
    pwaTerpasang = awalPwa.terpasang || cekModeStandalone();
    pwaIosSafari = cekIosSafari();
    const unsubPwa = berlanggananPwa((st) => {
      pwaTerpasang = st.terpasang;
      if (st.deferredPrompt) {
        deferredInstallPrompt = st.deferredPrompt;
        pwaPanduanTerbuka = false;
        pwaBannerDismissed = false;
      } else if (st.terpasang) {
        deferredInstallPrompt = null;
        pwaPanduanTerbuka = false;
      }
    });

    // Preload malas berjeda satu per satu saat idle agar scroll Beranda tetap mulus tanpa lonjakan parse
    let prefetchDibatalkan = false;
    let stepPrefetchTimer: number | null = null;
    const antreanPrefetch: Array<() => void> = [
      () => pastikanKomponenHalaman('twin'),
      () => void import('../scenes/digitalTwinStage.ts'),
      () => pastikanKomponenHalaman('koleksi'),
      () => void import('../scenes/coverflowStage.ts'),
      () => pastikanModalSuluk(),
      () => void import('../scenes/sulukShowcaseStage.ts'),
      () => void import('../scenes/wayangStage.ts'),
      () => void import('../scenes/pamomongOrbStage.ts'),
      () => pastikanSearchModal(),
    ];
    let idxPrefetch = 0;

    const jadwalkanLangkahPrefetch = () => {
      if (prefetchDibatalkan || idxPrefetch >= antreanPrefetch.length) return;
      const idleCb = (
        window as unknown as {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
        }
      ).requestIdleCallback;
      const jalankanSatu = () => {
        if (prefetchDibatalkan || idxPrefetch >= antreanPrefetch.length) return;
        antreanPrefetch[idxPrefetch++]();
        if (idxPrefetch < antreanPrefetch.length) {
          stepPrefetchTimer = window.setTimeout(jadwalkanLangkahPrefetch, 360);
        }
      };
      if (idleCb) idleCb(jalankanSatu, { timeout: 1800 });
      else jalankanSatu();
    };

    const prefetchTimer = window.setTimeout(jadwalkanLangkahPrefetch, 3200);

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
      prefetchDibatalkan = true;
      window.clearTimeout(prefetchTimer);
      if (stepPrefetchTimer !== null) window.clearTimeout(stepPrefetchTimer);
      window.removeEventListener('popstate', onPopState);
      unsubPwa();
      smoothScrollCtrl?.destroy();
      smoothScrollCtrl = null;
    };
  });

  onDestroy(() => {
    if (mouseMoveRaf !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(mouseMoveRaf);
      mouseMoveRaf = null;
    }
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
      if (legalModalBuka) legalModalBuka = false;
      if (searchModalBuka) searchModalBuka = false;
      if (modalSulukBuka) modalSulukBuka = false;
      if (langMenuBuka) langMenuBuka = false;
      return;
    }
    const tgt = e.target as HTMLElement | null;
    const isInput =
      tgt &&
      (tgt.tagName === 'INPUT' ||
        tgt.tagName === 'TEXTAREA' ||
        tgt.tagName === 'SELECT' ||
        tgt.isContentEditable);
    if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;
    const lowKey = e.key.toLowerCase();
    if (e.key === '?') {
      e.preventDefault();
      searchModalBuka = true;
    } else if (lowKey === 't') {
      toggleTema();
    } else if (lowKey === 'm') {
      toggleAudio();
    }
  }}
/>

<!-- Preloader numerik arsip -->
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

<!-- Bilah navigasi atas -->
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
        class:is-active={!ruteTidakDitemukan && halamanAktif === hal.id}
        aria-current={!ruteTidakDitemukan && halamanAktif === hal.id ? 'page' : undefined}
        onpointerenter={() => pastikanKomponenHalaman(hal.id)}
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
      onpointerenter={pastikanSearchModal}
      onclick={bukaSearchModal}
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
      class="util-pill nav-icon-pill"
      class:is-active={audioAktif}
      onclick={toggleAudio}
      data-testid="toggle-audio"
      aria-pressed={audioAktif}
      aria-label={audioAktif ? tI18n(bahasa, 'nav.suaraOn') : tI18n(bahasa, 'nav.suaraOff')}
    >
      <svg class="nav-ctrl-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M2.8 6.4v3.2h2.6l3.4 2.7V3.7L5.4 6.4H2.8z"
          stroke="currentColor"
          stroke-width="1.35"
          stroke-linejoin="round"
        />
        {#if audioAktif}
          <path
            d="M11.1 5.6a3.5 3.5 0 0 1 0 4.8M12.9 3.9a5.8 5.8 0 0 1 0 8.2"
            stroke="currentColor"
            stroke-width="1.35"
            stroke-linecap="round"
          />
        {:else}
          <path
            d="M11 6l3 4m0-4l-3 4"
            stroke="currentColor"
            stroke-width="1.35"
            stroke-linecap="round"
          />
        {/if}
      </svg>
      <span class="nav-ctrl-label">
        {audioAktif ? tI18n(bahasa, 'nav.suaraOn') : tI18n(bahasa, 'nav.suaraOff')}
      </span>
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
      class="util-pill nav-icon-pill"
      onclick={toggleTema}
      data-testid="toggle-tema"
      aria-label={tI18n(bahasa, 'nav.temaAria')}
    >
      {#if tema === 'malam'}
        <svg class="nav-ctrl-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M12.6 9.8A5.1 5.1 0 0 1 6.2 3.4a5.3 5.3 0 1 0 6.4 6.4z"
            stroke="currentColor"
            stroke-width="1.35"
            stroke-linejoin="round"
          />
        </svg>
      {:else}
        <svg class="nav-ctrl-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.35" />
          <path
            d="M8 1.8v1.4M8 12.8v1.4M1.8 8h1.4M12.8 8h1.4M3.6 3.6l1 1M11.4 11.4l1 1M12.4 3.6l-1 1M4.6 11.4l-1 1"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
      {/if}
      <span class="nav-ctrl-label">
        {tema === 'malam' ? tI18n(bahasa, 'nav.temaMalam') : tI18n(bahasa, 'nav.temaTerang')}
      </span>
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

<!-- Bar Navigasi Halaman Kompak Ikonik untuk Layar Mobile/Tablet -->
<nav class="mobile-page-dock" aria-label={tI18n(bahasa, 'nav.quickNavAria')}>
  {#each daftarHalaman as hal}
    <button
      type="button"
      class="mobile-page-btn"
      class:is-active={!ruteTidakDitemukan && halamanAktif === hal.id}
      aria-current={!ruteTidakDitemukan && halamanAktif === hal.id ? 'page' : undefined}
      onclick={() => pindahHalaman(hal.id)}
      data-testid="mobile-dock-{hal.id}"
    >
      <svg class="mobile-dock-ico" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {#if hal.id === 'beranda'}
          <path
            d="M3 9.2 10 3.5l7 5.7v6.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.2z"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linejoin="round"
          />
          <path d="M8 16.8v-4.6h4v4.6" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" />
        {:else if hal.id === 'twin'}
          <path
            d="M10 2.6 16.4 6.2v7.6L10 17.4l-6.4-3.6V6.2L10 2.6z"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linejoin="round"
          />
          <path
            d="M3.6 6.2 10 9.8l6.4-3.6M10 9.8v7.6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        {:else if hal.id === 'koleksi'}
          <rect
            x="5.2"
            y="4"
            width="9.6"
            height="12"
            rx="1.8"
            stroke="currentColor"
            stroke-width="1.65"
          />
          <path
            d="M2.6 6.2v7.6M17.4 6.2v7.6"
            stroke="currentColor"
            stroke-width="1.55"
            stroke-linecap="round"
          />
        {:else if hal.id === 'pakeliran'}
          <path
            d="M10 2.7 15.8 11.4 13.3 17H6.7L4.2 11.4 10 2.7z"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linejoin="round"
          />
          <circle cx="10" cy="10.2" r="1.7" fill="currentColor" />
        {:else}
          <circle cx="10" cy="10" r="6.6" stroke="currentColor" stroke-width="1.6" />
          <ellipse cx="10" cy="10" rx="6.6" ry="2.7" transform="rotate(-24 10 10)" stroke="currentColor" stroke-width="1.35" />
          <circle cx="10" cy="10" r="1.4" fill="currentColor" />
        {/if}
      </svg>
      <span class="mobile-dock-label">{hal.label}</span>
    </button>
  {/each}
</nav>

<main class="page-stage-shell" data-active-page={ruteTidakDitemukan ? 'notfound' : halamanAktif}>
  {#if ruteTidakDitemukan && infoRute404}
    <NotFoundPage
      {bahasa}
      infoRute={infoRute404}
      {daftarHalaman}
      onKembaliBeranda={() => pindahHalaman('beranda')}
      onPindahHalaman={(id) => pindahHalaman(id)}
      onPilihPusaka={(id, bukaTwin) => pilihPusaka(id, bukaTwin)}
      onBukaSearch={bukaSearchModal}
    />
  {:else}
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

  <!-- Halaman 01: Beranda & Diorama Pendopo 3D -->
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

  <!-- Halaman 02: Studio Digital Twin 3D -->
  {#if halamanAktif === 'twin'}
    {#if DigitalTwinStudioComp}
      <DigitalTwinStudioComp
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
        isFavorit={(jejakKurasi.favoritIds ?? []).includes(bendaAktif.id)}
        onToggleFavorit={() => toggleFavoritSpesimen(bendaAktif.id)}
        onTangkapPotret={() => twinStage?.tangkapPotretPng() ?? null}
        onPindahHalaman={(hal, anchor) => pindahHalaman(hal, anchor)}
        onScrollProgres={(p) => twinStage?.aturProgresGulir(p)}
        {statusKamera}
        saronHoverIdx={saronHoverWilahIdx}
        saronStruckIdx={saronStruckWilahIdx}
        onToggleKamera={toggleKameraTangan}
      />
    {:else}
      <section class="band-section" style="min-height: 68vh;" aria-busy="true"></section>
    {/if}
  {/if}

  <!-- Halaman 03: Galeri Coverflow 3D -->
  {#if halamanAktif === 'koleksi'}
    {#if CoverflowShowcaseComp}
      <CoverflowShowcaseComp
        items={KOLEKSI_COVERFLOW}
        {coverflowIdx}
        {tema}
        {bahasa}
        {suasanaPendopoAktif}
        favoritIds={jejakKurasi.favoritIds ?? []}
        mountStage={mountCoverflowStage}
        onSelectIndex={pilihIndeksCoverflow}
        onGeser={geserCoverflow}
        onBukaModalSuluk={bukaModalSuluk}
        onToggleSuasanaGending={toggleSuasanaGending}
        onToggleFavorit={toggleFavoritSpesimen}
        onBukaItem={bukaItemCoverflow}
        onFokusAnatomi={(item, titikId) => pilihPusaka(item.artefakId, true, titikId ?? item.titikId)}
        onParalaks={(nx, ny) => coverflowStage?.aturParalaks(nx, ny)}
        onScrollProgres={(p) => coverflowStage?.aturProgresGulir(p)}
      />
    {:else}
      <section class="band-section" style="min-height: 68vh;" aria-busy="true"></section>
    {/if}
  {/if}

  <!-- Halaman 04: Panggung Pakeliran Wayang Kulit 3D -->
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

  <!-- Halaman 05: Lab Aksara Jawa & AI Studio Pamomong Nusantara -->
  {#if halamanAktif === 'kawruh'}
    {#if KawruhOrbSectionComp}
      <KawruhOrbSectionComp
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
        onMasukLangkahTur={bukaLangkahTur}
      />
    {:else}
      <section class="band-section" style="min-height: 68vh;" aria-busy="true"></section>
    {/if}
  {/if}

  <!-- Navigasi jembatan antar-halaman -->
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
  {/if}
</main>

<FooterSection
  {bahasa}
  {daftarHalaman}
  onPindahHalaman={(id) => pindahHalaman(id as HalamanId)}
  onPilihPusaka={pilihPusaka}
  onBukaLegal={bukaLegalModal}
  onPreloadLegal={pastikanLegalModal}
  {pwaTerpasang}
  pwaPromptTersedia={Boolean(deferredInstallPrompt)}
  {pwaIosSafari}
  {pwaPanduanTerbuka}
  onPasangPwa={pasangAplikasiPwa}
  onTutupPanduan={() => (pwaPanduanTerbuka = false)}
/>

{#if deferredInstallPrompt && !pwaTerpasang && !pwaBannerDismissed && !modalSulukBuka && !searchModalBuka && !legalModalBuka}
  <aside
    class="pwa-install-toast"
    class:has-audio-bar={audioAktif}
    aria-label={tI18n(bahasa, 'footer.installBannerAria')}
    data-testid="pwa-install-toast"
  >
    <div class="pwa-toast-accent-rail" aria-hidden="true"></div>
    <div class="pwa-toast-top">
      <div class="pwa-toast-emblem" aria-hidden="true">
        <img src="/icons/icon-192.png" alt="" width="44" height="44" decoding="async" />
      </div>
      <div class="pwa-toast-copy">
        <div class="pwa-toast-eyebrow">
          <span class="live-dot" aria-hidden="true"></span>
          <span>{tI18n(bahasa, 'footer.installEyebrow')}</span>
        </div>
        <strong>{tI18n(bahasa, 'footer.installPromptTitle')}</strong>
        <p>{tI18n(bahasa, 'footer.installPromptDesc')}</p>
      </div>
      <button
        type="button"
        class="pwa-toast-close"
        onclick={() => (pwaBannerDismissed = true)}
        aria-label={tI18n(bahasa, 'footer.installDismissAria')}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4.2 4.2L11.8 11.8M11.8 4.2L4.2 11.8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div class="pwa-toast-foot">
      <div class="pwa-toast-perks" aria-hidden="true">
        <span>{tI18n(bahasa, 'footer.installPerk1')}</span>
        <span>{tI18n(bahasa, 'footer.installPerk2')}</span>
      </div>
      <div class="pwa-toast-actions">
        <button type="button" class="pwa-toast-btn-secondary" onclick={() => (pwaBannerDismissed = true)}>
          {tI18n(bahasa, 'footer.installCloseBtn')}
        </button>
        <button type="button" class="pwa-toast-btn-primary" onclick={() => void pasangAplikasiPwa()}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 2.4v7m0 0L5.4 6.8M8 9.4l2.6-2.6M3.2 11.8v.8a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1v-.8"
              stroke="currentColor"
              stroke-width="1.55"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{tI18n(bahasa, 'footer.installPromptBtn')}</span>
        </button>
      </div>
    </div>
  </aside>
{/if}

<!-- Modal Suluk 3D & pemutar karawitan -->
{#if modalSulukBuka && SulukModalComp}
  <SulukModalComp
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
<div
  class="webcam-pip"
  class:has-audio-bar={audioAktif || suasanaPendopoAktif}
  style:display={statusKamera === 'aktif' || statusKamera === 'memuat' ? 'block' : 'none'}
>
  <video bind:this={videoKameraEl} autoplay muted playsinline></video>
  {#if halamanAktif === 'twin' && bendaAktifId === 'saron' && statusKamera === 'aktif'}
    <div class="webcam-saron-strip" aria-hidden="true">
      {#each NADA_SARON_SLENDRO as nada, nIdx}
        <span
          class:is-hovered={saronHoverWilahIdx === nIdx}
          class:is-struck={saronStruckWilahIdx === nIdx}
        >
          {nada.angka}
        </span>
      {/each}
    </div>
  {/if}
  <div style="padding: 8px 10px; display: flex; justify-content: space-between; gap: 6px;">
    <span>{tI18n(bahasa, 'webcam.hands', { count: jumlahTanganTerdeteksi })}</span>
    <span>
      {halamanAktif === 'twin' && bendaAktifId === 'saron' && saronHoverWilahIdx !== null
        ? `${NADA_SARON_SLENDRO[saronHoverWilahIdx].angka} · ${gesturTerkini}`
        : gesturTerkini}
    </span>
  </div>
</div>

<KarawitanBar
  {bahasa}
  {audioAktif}
  suasanaAktif={suasanaPendopoAktif}
  onToggleSuasana={toggleSuasanaGending}
  onPilihGending={pilihGendingLatar}
/>

{#if searchModalBuka && SearchModalComp}
  <SearchModalComp
    {bahasa}
    {tema}
    terbuka={searchModalBuka}
    jejak={jejakKurasi}
    {skalaTeks}
    onUbahSkalaTeks={aturSkalaTeks}
    onClose={() => (searchModalBuka = false)}
    onEksekusiAksi={eksekusiAksiPencarian}
    onBukaLegal={bukaLegalModal}
  />
{/if}

{#if legalModalBuka && LegalModalComp}
  <LegalModalComp
    {bahasa}
    {tema}
    terbuka={legalModalBuka}
    tabAktif={legalModalTab}
    onPilihTab={(tab) => (legalModalTab = tab)}
    onClose={() => (legalModalBuka = false)}
  />
{/if}

<KelirCursor {tema} />
