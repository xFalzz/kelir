<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import {
    DAFTAR_BENDA,
    DAFTAR_SUMBER,
    DINDING_MATRIX,
    KEUNGGULAN_SISTEM,
    KOLEKSI_ETALASE,
    KRONIK_SEJARAH_BUDAYA,
    LAKON_KIJANG_KENCANA,
    PILAR_NILAI,
    ambilTeks,
    type BahasaAktif,
    type BendaPusaka,
    type KodeSumber,
    type TitikInfoPusaka,
  } from '../content/pusaka.ts';
  import { DAFTAR_CARAKAN, latinKeAksaraJawa, type KartuCarakan } from '../lib/aksara.ts';
  import { audioBudaya, NADA_SARON_SLENDRO } from '../lib/audioBudaya.ts';
  import type { FrameTangan, PengelolaTangan, StatusKamera } from '../lib/handTracker.ts';
  import { jawabDariKurasiLokal, tanyakanKeAsisten, type HasilTanya } from '../lib/tanya.ts';
  import type { DigitalTwinStage, ModeVisualTwin, ProyeksiPinTwin } from '../scenes/digitalTwinStage.ts';
  import { LivingPendopoStage, type ProyeksiPinDiorama } from '../scenes/livingPendopoStage.ts';
  import type { PamomongOrbStage } from '../scenes/pamomongOrbStage.ts';
  import type { WayangStage } from '../scenes/wayangStage.ts';
  import BerandaWallEtalase, { type FilterEtalase } from './components/BerandaWallEtalase.svelte';
  import FooterSection from './components/FooterSection.svelte';
  import KawruhOrbSection from './components/KawruhOrbSection.svelte';
  import PixelNumber from './PixelNumber.svelte';
  import PusakaArtwork from './PusakaArtwork.svelte';

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

  const DAFTAR_HALAMAN: DefinisiHalaman[] = [
    {
      id: 'beranda',
      nomor: '01',
      label: 'Beranda',
      aksara: 'ꦥꦼꦤ꧀ꦝꦥ',
      subjudul: 'SUAKA SPASIAL 3D · KRONIK 01–05 · MATRIKS 12 UNSUR',
      deskripsi:
        'Diorama kompleks Pendopo Jawa interaktif, lima kronik sejarah pusaka, indeks dua belas anatomi, dan etalase kurasi.',
    },
    {
      id: 'twin',
      nomor: '02',
      label: 'Digital Twin',
      aksara: 'ꦏꦼꦩ꧀ꦧꦂ',
      subjudul: 'STUDIO INSPEKSI CAD & PBR · EXPLODED VIEW 0–100%',
      deskripsi:
        'Bedah struktur geometris lima artefak utama dengan mode material PBR nyata, hibrida, dan rangkai kawat X-Ray CAD.',
    },
    {
      id: 'koleksi',
      nomor: '03',
      label: 'Coverflow',
      aksara: 'ꦱꦸꦭꦸꦏ꧀',
      subjudul: 'GALERI PERSPEKTIF 3D · SULUK DALANG · INDEKS GENDING',
      deskripsi:
        'Galeri perspektif melengkung, pembacaan larik suluk sinkron layar penuh, serta pemutar suasana gending pendopo.',
    },
    {
      id: 'pakeliran',
      nomor: '04',
      label: 'Pakeliran',
      aksara: 'ꦥꦏꦼꦭꦶꦂ',
      subjudul: 'TEATER BAYANGAN BLENCONG 3D · LAKON KIJANG KENCANA',
      deskripsi:
        'Simulasi panggung wayang kulit purwa dengan sorot lampu blencong, sabetan dalang, dan kendali gestur tangan.',
    },
    {
      id: 'kawruh',
      nomor: '05',
      label: 'Aksara & AI',
      aksara: 'ꦲꦤꦕꦫꦏ',
      subjudul: 'TRANSLITERASI HANACARAKA · ASISTEN PAMOMONG · PUSTAKA S1–S7',
      deskripsi:
        'Konverter aksara Jawa Unicode, asisten tanya-jawab BM25 berbasis arsip resmi S1–S7, dan ledger rujukan.',
    },
  ];

  let halamanAktif: HalamanId = $state('beranda');
  let tema: 'malam' | 'terang' = $state('terang');
  let bahasa: BahasaAktif = $state('id');
  let preloaderProgres = $state(0);
  let preloaderSelesai = $state(false);
  let audioAktif = $state(false);
  let suasanaPendopoAktif = $state(false);

  // Scrollytelling & Diorama Hero State (Halaman 01)
  let scrollyIndeksAktif = $state(-1);
  let wireframeDioramaAktif = $state(false);
  let dioramaPins: ProyeksiPinDiorama[] = $state([]);
  let bendaSorotDiorama: BendaPusaka['id'] | null = $state(null);

  // Digital Twin Studio State (Halaman 02)
  let bendaAktifId: BendaPusaka['id'] = $state('keris');
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

  // Lab Aksara Jawa & Pamomong AI State (Halaman 05)
  let inputAksaraLatin = $state('Kelir warisan budaya Jawa nusantara.');
  let kartuCarakanTerpilih: KartuCarakan = $state(DAFTAR_CARAKAN[4]);
  let pertanyaanInput = $state('');
  let sediaTanya = $state(false);
  let jawabanPamomong: HasilTanya = $state(
    jawabDariKurasiLokal('keris', 'Mengapa Keris Luk 5 identik dengan filosofi Pandawa?'),
  );

  // Hand Tracker Webcam State (Global Utility)
  let statusKamera: StatusKamera = $state('nonaktif');
  let gesturTerkini = $state('-');
  let jumlahTanganTerdeteksi = $state(0);
  let videoKameraEl: HTMLVideoElement | undefined = $state();

  // Instance Panggung WebGL Aktif (dimuat malas sesuai halaman aktif)
  let dioramaStage: LivingPendopoStage | null = null;
  let twinStage: DigitalTwinStage | null = null;
  let wayangStage: WayangStage | null = null;
  let orbStage: PamomongOrbStage | null = null;
  let pengelolaTangan: PengelolaTangan | null = null;

  // Derived Values
  let infoHalamanAktif = $derived(
    DAFTAR_HALAMAN.find((h) => h.id === halamanAktif) ?? DAFTAR_HALAMAN[0],
  );
  let indeksHalamanAktif = $derived(
    DAFTAR_HALAMAN.findIndex((h) => h.id === halamanAktif),
  );
  let halamanSebelumnya = $derived(
    DAFTAR_HALAMAN[(indeksHalamanAktif - 1 + DAFTAR_HALAMAN.length) % DAFTAR_HALAMAN.length],
  );
  let halamanBerikutnya = $derived(
    DAFTAR_HALAMAN[(indeksHalamanAktif + 1) % DAFTAR_HALAMAN.length],
  );

  let bendaAktif = $derived(DAFTAR_BENDA.find((b) => b.id === bendaAktifId) ?? DAFTAR_BENDA[0]);
  let titikAktif: TitikInfoPusaka = $derived(
    bendaAktif.titikInfo.find((t) => t.id === titikAktifId) ?? bendaAktif.titikInfo[0],
  );
  let babakAktif = $derived(
    LAKON_KIJANG_KENCANA.daftarBabak[babakIdx] ?? LAKON_KIJANG_KENCANA.daftarBabak[0],
  );
  let modalTrackBenda = $derived(DAFTAR_BENDA[modalSulukTrackIdx] ?? DAFTAR_BENDA[0]);
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

  function mountWayangStage(node: HTMLDivElement) {
    let destroyed = false;
    let ro: ResizeObserver | null = null;

    void import('../scenes/wayangStage.ts').then(({ WayangStage }) => {
      if (destroyed) return;
      wayangStage = new WayangStage(node);
      wayangStage.aturPosisiTokoh(posRama, posKidang);

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
      orbStage = new PamomongOrbStage(node);

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
  function pindahHalaman(id: HalamanId, targetAnchorId?: string): void {
    halamanAktif = id;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('hal', id);
      url.hash = targetAnchorId ? `#${targetAnchorId}` : '';
      window.history.pushState({ halaman: id }, '', url);

      void tick().then(() => {
        if (targetAnchorId) {
          const el = document.getElementById(targetAnchorId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  }

  function teksSesuaiBahasa(teksId: string, teksJw?: string): string {
    if (bahasa === 'aks') return latinKeAksaraJawa(teksJw ?? teksId);
    if (bahasa === 'jw') return teksJw ?? teksId;
    return teksId;
  }

  function tutupPreloaderSeketika(): void {
    preloaderProgres = 100;
    preloaderSelesai = true;
  }

  function toggleTema(): void {
    tema = tema === 'malam' ? 'terang' : 'malam';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', tema);
    }
    dioramaStage?.setTheme(tema);
    twinStage?.setTheme(tema);
  }

  function toggleAudio(): void {
    audioAktif = !audioAktif;
    audioBudaya.aturAktif(audioAktif);
    if (!audioAktif) suasanaPendopoAktif = false;
    else audioBudaya.bunyikanWilahSaron(2, 0.18);
  }

  function toggleSuasanaGending(): void {
    if (!audioAktif) {
      audioAktif = true;
      audioBudaya.aturAktif(true);
    }
    suasanaPendopoAktif = audioBudaya.toggleSuasanaPendopo();
  }

  function pilihPusaka(id: BendaPusaka['id'], bukaHalamanTwin = false): void {
    bendaAktifId = id;
    const bendaBaru = DAFTAR_BENDA.find((b) => b.id === id) ?? DAFTAR_BENDA[0];
    titikAktifId = bendaBaru.titikInfo[0].id;
    twinStage?.muatBenda(bendaBaru);
    dioramaStage?.fokusKeBangunan(id);

    if (audioAktif) picuSuaraBenda(id);

    if (bukaHalamanTwin) {
      pindahHalaman('twin');
    }
  }

  function picuSuaraBenda(id: BendaPusaka['id']): void {
    if (!audioAktif) return;
    if (id === 'keris') audioBudaya.bunyikanHunusKeris();
    else if (id === 'saron') audioBudaya.bunyikanWilahSaron(3);
    else if (id === 'batik') audioBudaya.bunyikanCantingMalam();
    else if (id === 'joglo') audioBudaya.bunyikanKetukKayuJoglo();
    else audioBudaya.bunyikanCempalaKeprak();
  }

  function aturModeVisualTwin(mode: ModeVisualTwin): void {
    modeVisualTwin = mode;
    twinStage?.terapkanModeVisual(mode);
  }

  function pilihTitikInfo(t: TitikInfoPusaka): void {
    titikAktifId = t.id;
    twinStage?.fokusKeTitik(t);
    picuSuaraBenda(bendaAktif.id);
  }

  function bukaModalSuluk(idx: number): void {
    modalSulukTrackIdx = ((idx % DAFTAR_BENDA.length) + DAFTAR_BENDA.length) % DAFTAR_BENDA.length;
    sulukLarikAktif = 0;
    modalSulukBuka = true;
    if (audioAktif) audioBudaya.bunyikanWilahSaron(idx % 6, 0.2);
  }

  function geserCoverflow(delta: number): void {
    coverflowIdx =
      (((coverflowIdx + delta) % DAFTAR_BENDA.length) + DAFTAR_BENDA.length) % DAFTAR_BENDA.length;
    if (audioAktif) audioBudaya.bunyikanWilahSaron(coverflowIdx, 0.14);
  }

  function hitungGayaKartuCoverflow(indeks: number): string {
    const len = DAFTAR_BENDA.length;
    let delta = indeks - coverflowIdx;
    if (delta > Math.floor(len / 2)) delta -= len;
    if (delta < -Math.floor(len / 2)) delta += len;

    const abs = Math.abs(delta);
    const tx = delta * 245;
    const tz = -abs * 155;
    const ry = delta * -22;
    const skala = abs === 0 ? 1 : Math.max(0.72, 1 - abs * 0.14);
    const kabur = abs === 0 ? 0 : abs * 1.9;
    const opasitas = abs > 2 ? 0 : 1 - abs * 0.18;
    const zIndeks = 20 - abs * 4;

    return `transform: translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${skala}); filter: blur(${kabur}px); opacity: ${opasitas}; z-index: ${zIndeks};`;
  }

  function pilihBabak(i: number): void {
    babakIdx = i;
    const bab = LAKON_KIJANG_KENCANA.daftarBabak[i];
    if (bab) {
      posRama = bab.posisiAwalRama;
      posKidang = bab.posisiAwalKidang;
      wayangStage?.aturPosisiTokoh(posRama, posKidang);
      if (audioAktif) audioBudaya.bunyikanCempalaKeprak();
    }
  }

  async function kirimTanyaPamomong(e?: SubmitEvent): Promise<void> {
    if (e) e.preventDefault();
    const q = pertanyaanInput.trim() || bendaAktif.pertanyaanContoh[0];
    if (!pertanyaanInput.trim()) pertanyaanInput = q;
    sediaTanya = true;
    orbStage?.picuDenyutBerpikir();
    jawabanPamomong = await tanyakanKeAsisten(bendaAktif.id, q);
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
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    wallTiltX = -ny * 7.5;
    wallTiltY = nx * 9.5;
  }

  function formatSumberLabel(s: KodeSumber): string {
    return `${s} · ${DAFTAR_SUMBER[s].lembaga}`;
  }

  // =========================================================================
  // 4. Mount Global & Sinkronisasi URL History
  // =========================================================================
  onMount(() => {
    document.documentElement.setAttribute('data-theme', tema);

    // Baca parameter halaman dari URL jika ada (?hal=twin, dsb.)
    const params = new URLSearchParams(window.location.search);
    const halParam = params.get('hal') as HalamanId | null;
    if (halParam && DAFTAR_HALAMAN.some((h) => h.id === halParam)) {
      halamanAktif = halParam;
    }

    const onPopState = () => {
      const p = new URLSearchParams(window.location.search).get('hal') as HalamanId | null;
      if (p && DAFTAR_HALAMAN.some((h) => h.id === p)) {
        halamanAktif = p;
      } else {
        halamanAktif = 'beranda';
      }
    };
    window.addEventListener('popstate', onPopState);

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      tutupPreloaderSeketika();
    } else {
      const start = performance.now();
      const durasi = 560;
      const tickLoader = (now: number) => {
        const p = Math.min(1, (now - start) / durasi);
        preloaderProgres = Math.round(p * 100);
        if (p < 1 && !preloaderSelesai) {
          requestAnimationFrame(tickLoader);
        } else {
          setTimeout(() => {
            preloaderSelesai = true;
          }, 70);
        }
      };
      requestAnimationFrame(tickLoader);
    }

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  });

  onDestroy(() => {
    pengelolaTangan?.matikan();
    audioBudaya.hentikanSuasanaPendopo();
    dioramaStage?.destroy();
    twinStage?.destroy();
    wayangStage?.destroy();
    orbStage?.destroy();
  });
</script>

<svelte:window
  onmousemove={handleMouseMoveGlobal}
  onkeydown={(e) => {
    if (e.key === 'Escape' && modalSulukBuka) modalSulukBuka = false;
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
    <span>KELIR · ARSIP SPASIAL WARISAN NUSANTARA · S1–S7</span>
    <button
      type="button"
      class="preloader-skip"
      onclick={tutupPreloaderSeketika}
      data-testid="skip-preloader"
    >
      Lewati Intro &#8594;
    </button>
  </div>

  <div class="preloader-center">
    <svg class="preloader-emblem" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" />
      <path d="M32 10 L46 38 L18 38 Z" stroke="currentColor" stroke-width="2" />
    </svg>
    <div>
      <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 700;">
        Menyiapkan 5 Ruang Kurasi &amp; Studio Geometri 3D
      </div>
      <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-secondary);">
        Diorama Pendopo · Bedah Anatomi CAD · Panggung Pakeliran · Kendali Gestur Lokal
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

  <nav class="nav-links" aria-label="Navigasi Halaman Utama">
    {#each DAFTAR_HALAMAN as hal}
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
      class="util-pill"
      class:is-active={audioAktif}
      onclick={toggleAudio}
      data-testid="toggle-audio"
      aria-pressed={audioAktif}
    >
      {audioAktif ? 'Suara Aktif' : 'Suara'}
    </button>

    <button
      type="button"
      class="util-pill"
      class:is-active={statusKamera === 'aktif'}
      onclick={toggleKameraTangan}
      data-testid="toggle-kamera"
    >
      {statusKamera === 'aktif' ? 'Kamera Hidup' : 'Gestur 21-Titik'}
    </button>

    <div class="lang-group" role="group" aria-label="Pilih Bahasa Tampilan">
      <button
        type="button"
        class="lang-btn"
        class:is-active={bahasa === 'id'}
        onclick={() => (bahasa = 'id')}
        data-testid="lang-id"
      >
        ID
      </button>
      <button
        type="button"
        class="lang-btn"
        class:is-active={bahasa === 'jw'}
        onclick={() => (bahasa = 'jw')}
        data-testid="lang-jw"
      >
        JW
      </button>
      <button
        type="button"
        class="lang-btn"
        class:is-active={bahasa === 'aks'}
        onclick={() => (bahasa = 'aks')}
        data-testid="lang-aks"
        title="Mode Aksara Jawa"
      >
        AKS
      </button>
    </div>

    <button
      type="button"
      class="util-pill"
      onclick={toggleTema}
      data-testid="toggle-tema"
      aria-label="Ganti Tema Malam atau Terang"
    >
      {tema === 'malam' ? 'Malam' : 'Terang'}
    </button>

    <button
      type="button"
      class="nav-cta-white"
      onclick={() => pindahHalaman('twin')}
      data-testid="cta-nav-twin"
    >
      Bedah 3D
    </button>
  </div>
</header>

<!-- Bar Navigasi Halaman Kompak untuk Layar Mobile/Tablet -->
<nav class="mobile-page-dock" aria-label="Pindah Halaman Cepat">
  {#each DAFTAR_HALAMAN as hal}
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
            01 BERANDA
          </button>
          <span aria-hidden="true">/</span>
          <span class="breadcrumb-current">
            HALAMAN {infoHalamanAktif.nomor} DARI 05 · {infoHalamanAktif.label.toUpperCase()}
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
        <div class="diorama-pins-layer">
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
                <span>{info.dioramaLabel}</span>
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
            ARSIP SPASIAL WARISAN NUSANTARA · 5 HALAMAN · S1–S7
          </span>

          <h1 class="hero-h1">
            {teksSesuaiBahasa(
              'Menembus ke dalam jiwa pusaka.',
              'Nlusuri jeroaning pusaka agung.',
            )}
          </h1>

          <p class="hero-lead">
            {teksSesuaiBahasa(
              'Kelir memetakan keris, gamelan saron, wastra batik, arsitektur joglo, dan panggung wayang kulit ke dalam 5 ruang halaman tematik WebGL dengan bedah anatomi CAD dan gestur tangan lokal.',
              'Kelir nggambarake dhuwung, saron, sinjang batik, pendhapa joglo, saha pakeliran wayang ing wujud diorama WebGL interaktif.',
            )}
          </p>

          <div class="hero-actions">
            <button
              type="button"
              class="pill-cta-white"
              onclick={() => pindahHalaman('twin')}
            >
              {teksSesuaiBahasa('Buka Studio Digital Twin 3D →', 'Bukak Studio Digital Twin 3D →')}
            </button>
            <button
              type="button"
              class="pill-cta-outline"
              onclick={() => bukaModalSuluk(0)}
            >
              {teksSesuaiBahasa('Putar Suluk ▶', 'Puter Suluk ▶')}
            </button>
          </div>

          <div class="hero-spec-strip" aria-label="Ringkasan Koleksi Kelir">
            <div>
              <strong>5</strong>
              <span>Pusaka Utama</span>
            </div>
            <div>
              <strong>16</strong>
              <span>Titik Anatomi 3D</span>
            </div>
            <div>
              <strong>S1–S7</strong>
              <span>Pustaka Terkurasi</span>
            </div>
          </div>

          <div class="hero-micro-meta">
            UNESCO ICH · Museum Sonobudoyo · Kemdikbud RI · Perpusnas RI
          </div>
        </div>

        <div class="hero-live-pill">
          <span class="live-dot" aria-hidden="true"></span>
          <span>Klik penanda diorama untuk Bedah 3D, atau gulir untuk menelusuri 5 kronik</span>
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
                {teksSesuaiBahasa(kronik.judul.id, kronik.judul.jw)}
              </h2>
              <p class="scrolly-step-body" style="font-weight: 500; color: var(--text-primary);">
                {teksSesuaiBahasa(kronik.sorotan.id, kronik.sorotan.jw)}
              </p>
              <p class="scrolly-step-body">
                {teksSesuaiBahasa(kronik.narasiMendalam.id, kronik.narasiMendalam.jw)}
              </p>
              <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 14px;">
                {#each kronik.sumber as ks}
                  <span class="source-badge">{ks}</span>
                {/each}
              </div>
            </div>

            <div class="scrolly-hud-card">
              <div class="hud-header">
                <span>TELEMETRI ANATOMI 3D</span>
                <span>{kronik.kodeArsip}</span>
              </div>

              {#each kronik.metrik as m}
                <div class="hud-metric-row">
                  <div class="hud-metric-meta">
                    <span style="color: var(--text-secondary);">{m.label}</span>
                    <strong style="font-family: var(--font-mono);">{m.nilai}</strong>
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
                  {wireframeDioramaAktif ? 'Rangka Kawat: Aktif' : 'Rangka Kawat X-Ray'}
                </button>
                <button
                  type="button"
                  class="nav-cta-white"
                  onclick={() => pilihPusaka(kronik.bendaId, true)}
                >
                  Bedah di Digital Twin &#8594;
                </button>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <BerandaWallEtalase
      {tema}
      {halamanAktif}
      {teksSesuaiBahasa}
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
      daftarHalaman={DAFTAR_HALAMAN}
      onPilihPusaka={pilihPusaka}
      onPindahHalaman={(id) => pindahHalaman(id as HalamanId)}
    />
  {/if}

  <!-- =======================================================================
       HALAMAN 02: STUDIO KEMBARAN DIGITAL 3D (CAD & PBR STUDIO)
       ======================================================================= -->
  {#if halamanAktif === 'twin'}
    <section id="digital-twin" class="band-section" aria-label="Studio Kembaran Digital 3D">
      <div class="band-header">
        <div>
          <span class="eyebrow-mono">HALAMAN 02 · DIGITAL TWIN CAD STUDIO · EXPLODED VIEW</span>
          <h1 class="display-h2">
            {teksSesuaiBahasa(
              'Bedah Lapisan Geometris Pusaka',
              'Nliti Lapisan Geometri Pusaka',
            )}
          </h1>
        </div>

        <div class="artifact-tab-row" role="tablist" aria-label="Pilih Benda Pusaka">
          {#each DAFTAR_BENDA as b}
            <button
              type="button"
              role="tab"
              aria-selected={bendaAktifId === b.id}
              class="tab-chip"
              class:is-active={bendaAktifId === b.id}
              onclick={() => pilihPusaka(b.id)}
              data-testid="tab-{b.id}"
            >
              {b.nomorUrut} · {ambilTeks(b.nama, bahasa)}
            </button>
          {/each}
        </div>
      </div>

      <div class="twin-workspace">
        <div class="twin-viewport-card">
          <div class="twin-canvas-host" use:mountTwinStage>
            <div class="twin-pins-overlay">
              {#each twinPins as pin, pIdx}
                {@const t = bendaAktif.titikInfo.find((item) => item.id === pin.id)}
                {#if t && pin.terlihat}
                  <button
                    type="button"
                    class="twin-pin"
                    class:is-active={titikAktifId === t.id}
                    style="left: {pin.x}px; top: {pin.y}px;"
                    onclick={() => pilihTitikInfo(t)}
                    aria-label="Anatomi {ambilTeks(t.judul, bahasa)}"
                  >
                    {pIdx + 1}
                  </button>
                {/if}
              {/each}
            </div>
          </div>

          <div class="twin-controls-bar">
            <div class="mode-switch-group" role="group" aria-label="Mode Render 3D">
              <button
                type="button"
                class="mode-btn"
                class:is-active={modeVisualTwin === 'pbr'}
                onclick={() => aturModeVisualTwin('pbr')}
              >
                PBR Nyata
              </button>
              <button
                type="button"
                class="mode-btn"
                class:is-active={modeVisualTwin === 'hibrida'}
                onclick={() => aturModeVisualTwin('hibrida')}
              >
                Hibrida
              </button>
              <button
                type="button"
                class="mode-btn"
                class:is-active={modeVisualTwin === 'kawat'}
                onclick={() => aturModeVisualTwin('kawat')}
                data-testid="toggle-xray"
              >
                Kawat X-Ray CAD
              </button>
            </div>

            <label class="explode-slider-wrap">
              <span>LEDAK ANATOMI {Math.round(faktorLedak * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={faktorLedak}
                oninput={(e) => {
                  faktorLedak = Number((e.currentTarget as HTMLInputElement).value);
                  twinStage?.aturLedakAnatomi(faktorLedak);
                }}
                data-testid="slider-ledak"
              />
            </label>

            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="util-pill"
                onclick={() => {
                  twinStage?.picuEfekKhusus3D();
                  if (!audioAktif) {
                    audioAktif = true;
                    audioBudaya.aturAktif(true);
                  }
                  picuSuaraBenda(bendaAktif.id);
                }}
              >
                Bunyikan Efek
              </button>
              <button
                type="button"
                class="util-pill"
                class:is-active={aksiHidupTwin}
                onclick={() => {
                  aksiHidupTwin = twinStage?.toggleAksiHidup() ?? !aksiHidupTwin;
                }}
              >
                {aksiHidupTwin ? 'Putar Otomatis' : 'Jeda Putar'}
              </button>
            </div>
          </div>
        </div>

        <aside class="twin-inspector-panel">
          <div>
            <div class="eyebrow-mono">{bendaAktif.zonaKode} · {ambilTeks(bendaAktif.asal, bahasa)}</div>
            <h2 style="margin: 8px 0 4px; font-family: var(--font-display); font-size: 1.75rem;">
              {teksSesuaiBahasa(bendaAktif.nama.id, bendaAktif.nama.jw)}
            </h2>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.54;">
              {teksSesuaiBahasa(bendaAktif.sejarahSingkat.id, bendaAktif.sejarahSingkat.jw)}
            </p>
          </div>

          <div class="twin-meta-strip" aria-label="Spesifikasi Kuratorial Pusaka">
            {#each bendaAktif.spesifikasiKurasi as spek}
              <div class="twin-meta-cell">
                <span>{spek.label}</span>
                <strong>{spek.nilai}</strong>
              </div>
            {/each}
          </div>

          <div class="titik-list">
            {#each bendaAktif.titikInfo as t, idx}
              <button
                type="button"
                class="titik-btn"
                class:is-active={titikAktifId === t.id}
                onclick={() => pilihTitikInfo(t)}
              >
                <div class="titik-btn-head">
                  <span>0{idx + 1} · {teksSesuaiBahasa(t.judul.id, t.judul.jw)}</span>
                  <span class="source-badge">{t.sumber.join(', ')}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary);">
                  {teksSesuaiBahasa(t.ringkasan.id, t.ringkasan.jw)}
                </div>
              </button>
            {/each}
          </div>

          {#if bendaAktif.id === 'saron'}
            <div>
              <div class="eyebrow-mono" style="margin-bottom: 8px;">KLIK WILAH SARON SLENDRO</div>
              <div class="saron-keys-bar">
                {#each NADA_SARON_SLENDRO as nada, nIdx}
                  <button
                    type="button"
                    class="wilah-key"
                    onclick={() => {
                      if (!audioAktif) {
                        audioAktif = true;
                        audioBudaya.aturAktif(true);
                      }
                      audioBudaya.bunyikanWilahSaron(nIdx);
                      twinStage?.picuEfekKhusus3D();
                    }}
                  >
                    {nada.angka}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div style="padding-top: 10px; border-top: 1px solid var(--border-hairline); font-size: 0.84rem; color: var(--text-secondary);">
            <strong style="color: var(--text-primary);">Filosofi Inti:</strong>
            {teksSesuaiBahasa(bendaAktif.filosofi.id, bendaAktif.filosofi.jw)}
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              class="util-pill"
              onclick={() => bukaModalSuluk(DAFTAR_BENDA.findIndex((x) => x.id === bendaAktif.id))}
            >
              Dengarkan Suluk {ambilTeks(bendaAktif.nama, 'id')} ▶
            </button>
            {#if bendaAktif.id === 'wayang'}
              <button
                type="button"
                class="nav-cta-white"
                onclick={() => pindahHalaman('pakeliran')}
              >
                Mainkan di Panggung Kelir &#8594;
              </button>
            {/if}
          </div>
        </aside>
      </div>

      <!-- Arsitektur Rekayasa 4-Baris di atas Grid Swiss -->
      <div class="engineering-grid-panel">
        <div class="engineering-sticky-col">
          <span class="eyebrow-mono">ARSITEKTUR REKAYASA BUDAYA</span>
          <h3 class="display-h2" style="font-size: clamp(1.75rem, 3vw, 2.5rem);">
            {teksSesuaiBahasa(
              'Mengintegrasikan Warisan Tradisi dengan Presisi 3D',
              'Nyawijekake Warisan Tradhisi lan Presisi 3D',
            )}
          </h3>
          <p style="color: var(--text-secondary); margin-top: 14px; line-height: 1.58;">
            {teksSesuaiBahasa(
              'Setiap aspek geometris, bunyi gamelan, dan kendali gestur tangan berjalan langsung di peramban demi performa tinggi dan perlindungan privasi pengguna.',
              'Saben aspek geometri, swara gamelan, lan kendhali gestur asta lumaku langsung ing peramban kanggo njaga privasi saha kacepetan.',
            )}
          </p>
        </div>

        <div class="engineering-list">
          {#each KEUNGGULAN_SISTEM as item}
            <div class="engineering-row">
              <div class="engineering-num">{item.nomor}</div>
              <div>
                <h4 style="margin: 0 0 6px; font-family: var(--font-display); font-size: 1.2rem;">
                  {teksSesuaiBahasa(item.judul.id, item.judul.jw)}
                </h4>
                <p style="margin: 0; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.56;">
                  {teksSesuaiBahasa(item.teks.id, item.teks.jw)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 3 Kolom Manifesto Arsitektural Sejajar (Modern Minimalism) -->
      <div class="editorial-pillars-grid">
        {#each PILAR_NILAI as p}
          <div class="editorial-pillar-card">
            <div style="margin-bottom: 10px;">
              <span class="eyebrow-mono">{p.nomor} · {teksSesuaiBahasa(p.sorot.id, p.sorot.jw)}</span>
            </div>
            <h4 style="margin: 0 0 8px; font-family: var(--font-display); font-size: 1.28rem;">
              {teksSesuaiBahasa(p.judul.id, p.judul.jw)}
            </h4>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.55;">
              {teksSesuaiBahasa(p.teks.id, p.teks.jw)}
            </p>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- =======================================================================
       HALAMAN 03: GALERI COVERFLOW 3D & REPERTOAR SULUK
       ======================================================================= -->
  {#if halamanAktif === 'koleksi'}
    <section id="coverflow" class="archive-showcase-section" aria-label="Coverflow Koleksi Pusaka & Suluk">
      <div class="archive-hero-head">
        <h1 class="archive-wordmark">KELIR ARCHIVE</h1>
        <div class="archive-subtitle">KAWRUH &amp; SULUK PAKELIRAN NUSANTARA</div>
        <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
          <span class="live-dot is-crimson" aria-hidden="true"></span>
          <span>Halaman 03 · 5 Pelat Pusaka Kurasi S1–S7</span>
        </div>
      </div>

      <!-- 3D Curved Perspective Coverflow -->
      <div class="coverflow-viewport" role="region" aria-label="Galeri Coverflow 3D Pusaka">
        {#each DAFTAR_BENDA as benda, i}
          <div
            class="coverflow-card"
            style={hitungGayaKartuCoverflow(i)}
            onclick={() => (i === coverflowIdx ? bukaModalSuluk(i) : (coverflowIdx = i))}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                i === coverflowIdx ? bukaModalSuluk(i) : (coverflowIdx = i);
              }
            }}
            role="button"
            tabindex="0"
            aria-label="Pusaka {ambilTeks(benda.nama, bahasa)}"
          >
            <div class="coverflow-card-inner">
              <PusakaArtwork bendaId={benda.id} accent={benda.warnaAksen} />
              <div class="coverflow-card-overlay">
                <div class="coverflow-num">
                  {benda.nomorUrut} · {benda.badgeStatus ?? 'KURASI'}
                </div>
                <div>
                  <h2 class="coverflow-card-title">{ambilTeks(benda.nama, bahasa)}</h2>
                  {#if i === coverflowIdx}
                    <button
                      type="button"
                      class="pill-cta-white"
                      style="padding: 9px 16px; font-size: 0.82rem;"
                      onclick={(e) => {
                        e.stopPropagation();
                        bukaModalSuluk(i);
                      }}
                      data-testid="buka-modal-suluk"
                    >
                      ▶ Putar Suluk &amp; Bedah
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="coverflow-nav-bar">
        <button
          type="button"
          class="circle-nav-btn"
          onclick={() => geserCoverflow(-1)}
          aria-label="Kartu Sebelumnya"
          data-testid="coverflow-prev"
        >
          &lt;
        </button>
        <span>0{coverflowIdx + 1} / 0{DAFTAR_BENDA.length}</span>
        <button
          type="button"
          class="circle-nav-btn"
          onclick={() => geserCoverflow(1)}
          aria-label="Kartu Berikutnya"
          data-testid="coverflow-next"
        >
          &gt;
        </button>
      </div>

      <!-- Split Album-Style Index Showcase -->
      <div class="archive-split-index">
        <div class="archive-plate-frame">
          <PusakaArtwork bendaId={DAFTAR_BENDA[coverflowIdx].id} accent="#b33025" />
          <div class="archive-plate-caption">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.14em; color: #f5b4a8; margin-bottom: 4px;">
              KELIR ARCHIVE · VOL. I
            </div>
            <div style="font-family: var(--font-display); font-size: 1.18rem; font-weight: 700;">
              {ambilTeks(DAFTAR_BENDA[coverflowIdx].subjudul, bahasa)}
            </div>
          </div>
        </div>

        <div>
          <div class="eyebrow-mono">INDEKS KURASI PUSAKA TERVERIFIKASI</div>
          <h3 class="display-h2" style="font-size: clamp(2rem, 3.6vw, 3rem); margin-top: 8px;">
            {teksSesuaiBahasa('Khazanah Budaya Jawa', 'Khazanah Budaya Jawi')}
          </h3>
          <div style="margin: 10px 0 22px; font-size: 0.88rem; color: var(--text-secondary);">
            Kurasi Kelir · Arsip S1–S7 · 5 Artefak Utama
          </div>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button type="button" class="pill-cta-crimson" onclick={toggleSuasanaGending}>
              {suasanaPendopoAktif ? 'Jeda Gending Pendopo' : 'Putar Suasana Gending ▶'}
            </button>
            <button
              type="button"
              class="pill-cta-outline"
              onclick={() => pilihPusaka(DAFTAR_BENDA[coverflowIdx].id, true)}
            >
              Bedah 3D {ambilTeks(DAFTAR_BENDA[coverflowIdx].nama, 'id')} &#8594;
            </button>
          </div>

          <div class="archive-repertoire-list">
            {#each DAFTAR_BENDA as b, bIdx}
              <button type="button" class="track-row" onclick={() => bukaModalSuluk(bIdx)}>
                <span class="track-num">{b.nomorUrut}</span>
                <span class="track-title-wrap">
                  <span>{ambilTeks(b.nama, bahasa)}</span>
                  {#if bIdx === 0 || bIdx === 4}
                    <span class="single-badge">KURATOR</span>
                  {/if}
                </span>
                <span class="track-action">Suluk ▶</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- =======================================================================
       HALAMAN 04: PANGGUNG PAKELIRAN WAYANG KULIT 3D (LAKON KIJANG KENCANA)
       ======================================================================= -->
  {#if halamanAktif === 'pakeliran'}
    <section id="pakeliran" class="band-section" aria-label="Panggung Pakeliran Ramayana 3D">
      <div class="band-header">
        <div>
          <span class="eyebrow-mono">HALAMAN 04 · PANGGUNG WAYANG KULIT · LAKON ARANYA KANDA</span>
          <h1 class="display-h2">
            {teksSesuaiBahasa('Lakon Kijang Kencana 3D', 'Lakon Kidang Kencana 3D')}
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
              Babak {bab.nomor}
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
                ADEGAN {babakAktif.nomor} / {LAKON_KIJANG_KENCANA.daftarBabak.length} · {ambilTeks(babakAktif.lokasi, bahasa)} · SUMBER {babakAktif.sumber.join(', ')}
              </div>
              <h2 style="margin: 6px 0; font-family: var(--font-display); font-size: 1.45rem;">
                {ambilTeks(babakAktif.judul, bahasa)}
              </h2>
              <p style="margin: 0; color: var(--text-secondary); max-width: 720px; font-size: 0.94rem;">
                {ambilTeks(babakAktif.narasiDalang, bahasa)}
              </p>
              <p class="pakeliran-suluk-quote">
                Suluk Dalang: "{babakAktif.suluk}"
              </p>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button
                type="button"
                class="pill-cta-outline"
                onclick={() => {
                  wayangStage?.picuSabetanWayang();
                  if (audioAktif) audioBudaya.bunyikanCempalaKeprak();
                }}
              >
                Sabetan &amp; Keprak
              </button>
              <button
                type="button"
                class="pill-cta-crimson"
                onclick={() => {
                  wayangStage?.picuPanahRama();
                  if (audioAktif) audioBudaya.bunyikanLesatanPanah();
                }}
                data-testid="btn-panah-rama"
              >
                Lepaskan Panah Rama &#8594;
              </button>
            </div>
          </div>

          <div class="two-col-editorial" style="margin-top: 4px;">
            <label class="pakeliran-slider-label">
              <span>KIDANG KENCANA (POSISI {posKidang.toFixed(2)})</span>
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
              <span>SRI RAMA (POSISI {posRama.toFixed(2)})</span>
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
        <div class="editorial-pillar-card">
          <span class="eyebrow-mono">ANATOMI TATAHAN &amp; SUNGGINGAN</span>
          <h3 style="margin: 8px 0; font-family: var(--font-display); font-size: 1.28rem;">
            Gelung Supit Urang, Bokongan &amp; Cempurit Tanduk
          </h3>
          <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary);">
            Figur 3D Sri Rama dibangun mengikuti pakem wayang kulit alusan Keraton: wajah hitam tenang, mahkota Gelung Supit Urang berlubang krawangan, kain kampuh polikrom dengan bokongan melengkung, serta tangkai cempurit tanduk kerbau dan tuding ganda.
          </p>
        </div>

        <div class="editorial-pillar-card">
          <span class="eyebrow-mono">KENDALI GESTUR TANGAN 21-TITIK</span>
          <h3 style="margin: 8px 0; font-family: var(--font-display); font-size: 1.28rem;">
            Simulasi Sabetan Dalang via Kamera Lokal
          </h3>
          <p style="margin: 0 0 14px; font-size: 0.88rem; color: var(--text-secondary);">
            Aktifkan tombol <strong>Gestur 21-Titik</strong> di bilah atas: tangan kanan menggerakkan Sri Rama &amp; kemiringan busur, tangan kiri menggerakkan Kidang Kencana, dan gestur mengepal memicu sabetan keprak.
          </p>
          <button
            type="button"
            class="util-pill"
            onclick={() => pilihPusaka('wayang', true)}
          >
            Bedah Anatomi Wayang di Digital Twin &#8594;
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
      {teksSesuaiBahasa}
      {bendaAktif}
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
    />
  {/if}

  <!-- =======================================================================
       PORTAL TRANSISI ANTAR-HALAMAN MINIMALIS
       ======================================================================= -->
  <section class="next-page-bridge" aria-label="Navigasi Halaman Berikutnya">
    <div class="next-page-bridge-inner">
      <button
        type="button"
        class="bridge-card"
        onclick={() => pindahHalaman(halamanSebelumnya.id)}
      >
        <span class="eyebrow-mono">&#8592; SEBELUMNYA ({halamanSebelumnya.nomor}/05)</span>
        <div class="bridge-card-title">{halamanSebelumnya.label}</div>
      </button>

      <div class="bridge-status-center">
        <span>HALAMAN {infoHalamanAktif.nomor} / 05</span>
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
        <span class="eyebrow-mono">SELANJUTNYA ({halamanBerikutnya.nomor}/05) &#8594;</span>
        <div class="bridge-card-title">{halamanBerikutnya.label}</div>
      </button>
    </div>
  </section>
</main>

<FooterSection
  daftarHalaman={DAFTAR_HALAMAN}
  onPindahHalaman={(id) => pindahHalaman(id as HalamanId)}
  onPilihPusaka={pilihPusaka}
/>

<!-- =========================================================================
     MODAL SULUK LAYAR PENUH TERPISAH
     ========================================================================= -->
{#if modalSulukBuka}
  <div
    class="modal-suluk-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Modal Suluk & Bedah {ambilTeks(modalTrackBenda.nama, bahasa)}"
    data-testid="modal-suluk"
  >
    <button
      type="button"
      class="modal-close-btn"
      onclick={() => (modalSulukBuka = false)}
      data-testid="close-modal-suluk"
    >
      Tutup ✕
    </button>

    <div class="modal-art-panel">
      <PusakaArtwork bendaId={modalTrackBenda.id} accent={modalTrackBenda.warnaAksen} />
    </div>

    <div class="modal-lyrics-col">
      <div>
        <div class="eyebrow-mono">
          PUSAKA {modalTrackBenda.nomorUrut} DARI 05 · LARIK 0{sulukLarikAktif + 1}/0{modalTrackBenda.sulukLarik.length} · SUMBER {modalTrackBenda.sumber.join(', ')}
        </div>
        <h2 style="margin: 8px 0 0; font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.02;">
          {ambilTeks(modalTrackBenda.nama, bahasa)}
        </h2>
      </div>

      <div class="suluk-lines" aria-label="Larik Suluk & Kawruh Sinkron">
        {#each modalTrackBenda.sulukLarik as larik, lIdx}
          <button
            type="button"
            class="suluk-line-btn"
            class:is-active={sulukLarikAktif === lIdx}
            onclick={() => {
              sulukLarikAktif = lIdx;
              if (audioAktif) audioBudaya.bunyikanWilahSaron(lIdx % 6, 0.18);
            }}
          >
            {ambilTeks(larik, bahasa)}
          </button>
        {/each}
      </div>

      <div class="crimson-player-bar">
        <div>
          <div style="font-weight: 700; font-size: 1rem;">{ambilTeks(modalTrackBenda.nama, bahasa)}</div>
          <div style="font-size: 0.78rem; opacity: 0.9;">
            {ambilTeks(modalTrackBenda.subjudul, bahasa)}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button
            type="button"
            class="pill-cta-white"
            style="padding: 8px 14px; font-size: 0.8rem;"
            onclick={toggleSuasanaGending}
          >
            {suasanaPendopoAktif ? 'Jeda Gending' : 'Putar Gending ▶'}
          </button>
          <button
            type="button"
            class="circle-nav-btn"
            style="width: 38px; height: 38px; border-color: rgba(255,255,255,0.4); color: #ffffff;"
            onclick={() => bukaModalSuluk(modalSulukTrackIdx - 1)}
            aria-label="Pusaka Sebelumnya"
          >
            &lt;
          </button>
          <button
            type="button"
            class="circle-nav-btn"
            style="width: 38px; height: 38px; border-color: rgba(255,255,255,0.4); color: #ffffff;"
            onclick={() => bukaModalSuluk(modalSulukTrackIdx + 1)}
            aria-label="Pusaka Berikutnya"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Umpan Kamera MediaPipe 21-Titik Lokal (Tersembunyi jika nonaktif) -->
<div class="webcam-pip" style:display={statusKamera === 'nonaktif' ? 'none' : 'block'}>
  <video bind:this={videoKameraEl} autoplay muted playsinline></video>
  <div style="padding: 8px 10px; display: flex; justify-content: space-between;">
    <span>Tangan: {jumlahTanganTerdeteksi}</span>
    <span>Gestur: {gesturTerkini}</span>
  </div>
</div>
