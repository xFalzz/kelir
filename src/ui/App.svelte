<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import gsap from 'gsap';
  import {
    DAFTAR_BENDA,
    DAFTAR_LISENSI,
    DAFTAR_SUMBER,
    LAKON_KIJANG_KENCANA,
    ambilTeks,
    type BahasaMode,
    type BendaPusaka,
  } from '../content/pusaka';
  import { CONTOH_TERUJI, latinToAksara } from '../lib/aksara';
  import { PengelolaTangan, type FrameTangan, type StatusKamera } from '../lib/handTracker';
  import {
    CONTOH_PERTANYAAN,
    tanyakanKeAsisten,
    type JawabanTanya,
  } from '../lib/tanya';
  import { ArtifactStage, NADA_SARON_SLENDRO } from '../scenes/ArtifactStage';
  import { WayangStage } from '../scenes/WayangStage';

  type LayarId = 'pintu' | 'rak' | 'pegang' | 'panggung' | 'sumber';
  type TemaMode = 'malam' | 'siang';

  let layarAktif = $state<LayarId>('pintu');
  let bahasaAktif = $state<BahasaMode>('id');
  let temaAktif = $state<TemaMode>('malam');

  let bendaIdAktif = $state<BendaPusaka['id']>('keris');
  let bendaHeroId = $state<BendaPusaka['id']>('keris');
  let indeksTitikAktif = $state<number>(0);
  let indeksBabakAktif = $state<number>(0);
  let waktuWib = $state<string>('YOGYAKARTA · WIB');

  let statusKamera = $state<StatusKamera>('nonaktif');
  let pesanKamera = $state<string | null>(null);
  let infoTangan = $state<FrameTangan>({
    terdeteksi: false,
    jumlahTangan: 0,
    kananX: 0.35,
    kananY: 0,
    kiriX: -0.35,
    kiriY: 0,
    jarakCubit: 1,
    gesturAktif: 'diam',
  });

  let sliderRamaX = $state<number>(LAKON_KIJANG_KENCANA.babak[0].posisiAwalRama);
  let sliderKidangX = $state<number>(LAKON_KIJANG_KENCANA.babak[0].posisiAwalKidang);

  let inputPertanyaan = $state<string>('');
  let statusTanya = $state<'kosong' | 'memuat' | 'selesai' | 'galat'>('kosong');
  let hasilTanya = $state<JawabanTanya | null>(null);
  let galatTanya = $state<string | null>(null);

  let inputUjiAksara = $state<string>('kelir pusaka jawi');
  let webglPintuTersedia = $state<boolean>(true);
  let webglPegangTersedia = $state<boolean>(true);
  let webglPanggungTersedia = $state<boolean>(true);

  let wadahLayarEl: HTMLElement | undefined = $state();
  let videoEl: HTMLVideoElement | undefined = $state();
  let kanvasPintuEl: HTMLElement | undefined = $state();
  let kanvasPegangEl: HTMLElement | undefined = $state();
  let kanvasPanggungEl: HTMLElement | undefined = $state();

  let pengelolaTangan: PengelolaTangan | null = null;
  let stagePintu: ArtifactStage | null = null;
  let stagePegang: ArtifactStage | null = null;
  let stagePanggung: WayangStage | null = null;
  let timerJam: ReturnType<typeof setInterval> | null = null;

  const bendaAktif = $derived(
    DAFTAR_BENDA.find((b) => b.id === bendaIdAktif) ?? DAFTAR_BENDA[0],
  );
  const bendaHeroAktif = $derived(
    DAFTAR_BENDA.find((b) => b.id === bendaHeroId) ?? DAFTAR_BENDA[0],
  );
  const titikAktif = $derived(
    bendaAktif.titikInfo[indeksTitikAktif] ?? bendaAktif.titikInfo[0],
  );
  const babakAktif = $derived(
    LAKON_KIJANG_KENCANA.babak[indeksBabakAktif] ?? LAKON_KIJANG_KENCANA.babak[0],
  );
  const hasilUjiAksara = $derived(latinToAksara(inputUjiAksara));

  const SPEC_MATERIAL_PBR: Record<BendaPusaka['id'], string> = {
    keris: 'Pamor Wos Wutah 1K + Kayu Jati Gelap (Poly Haven CC0) + HDRI Studio',
    saron: 'Gangsa Perunggu Tempa + Ukiran Prada Emas + Sintesis Nada Slendro',
    wayang: 'Kulit Kerbau Tropenmuseum (TMnr 3582-30) + Bayangan Alpha Tatahan',
  };

  function perbaruiJamWib(): void {
    try {
      const fmt = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      waktuWib = `${fmt.format(new Date())} WIB`;
    } catch {
      waktuWib = 'YOGYAKARTA · WIB';
    }
  }

  function terapkanTema(mode: TemaMode): void {
    temaAktif = mode;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  function terapkanBahasa(mode: BahasaMode): void {
    bahasaAktif = mode;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', mode === 'id' ? 'id' : 'jv');
    }
  }

  async function pindahLayar(target: LayarId): Promise<void> {
    if (layarAktif === target) return;
    layarAktif = target;
    await tick();

    if (
      wadahLayarEl &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      gsap.fromTo(
        wadahLayarEl,
        { opacity: 0.25, y: 12 },
        { opacity: 1, y: 0, duration: 0.34, ease: 'power3.out' },
      );
      const kartuList = wadahLayarEl.querySelectorAll('.anim-masuk');
      if (kartuList.length > 0) {
        gsap.fromTo(
          kartuList,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.36, stagger: 0.055, ease: 'power2.out' },
        );
      }
    }

    await inisialisasiKanvasLayar();
  }

  async function inisialisasiKanvasLayar(): Promise<void> {
    await tick();

    if (layarAktif === 'pintu' && kanvasPintuEl) {
      stagePegang?.destroy();
      stagePegang = null;
      stagePanggung?.destroy();
      stagePanggung = null;
      if (!stagePintu) {
        stagePintu = new ArtifactStage(kanvasPintuEl, bendaHeroAktif);
        webglPintuTersedia = stagePintu.webglTersedia;
      } else {
        stagePintu.muatBenda(bendaHeroAktif);
      }
    } else if (layarAktif === 'pegang' && kanvasPegangEl) {
      stagePintu?.destroy();
      stagePintu = null;
      stagePanggung?.destroy();
      stagePanggung = null;
      if (!stagePegang) {
        stagePegang = new ArtifactStage(kanvasPegangEl, bendaAktif);
        webglPegangTersedia = stagePegang.webglTersedia;
      } else {
        stagePegang.muatBenda(bendaAktif);
      }
      if (titikAktif) {
        stagePegang.fokusKeTitik(titikAktif.posisi3D, titikAktif.kameraTarget);
      }
    } else if (layarAktif === 'panggung' && kanvasPanggungEl) {
      stagePintu?.destroy();
      stagePintu = null;
      stagePegang?.destroy();
      stagePegang = null;
      if (!stagePanggung) {
        stagePanggung = new WayangStage(kanvasPanggungEl);
        webglPanggungTersedia = stagePanggung.webglTersedia;
      }
      stagePanggung.aturPosisiTokoh(sliderRamaX, sliderKidangX);
    } else {
      stagePintu?.destroy();
      stagePintu = null;
      stagePegang?.destroy();
      stagePegang = null;
      stagePanggung?.destroy();
      stagePanggung = null;
    }
  }

  function gantiBendaHero(id: BendaPusaka['id']): void {
    bendaHeroId = id;
    const b = DAFTAR_BENDA.find((x) => x.id === id) ?? DAFTAR_BENDA[0];
    stagePintu?.muatBenda(b);
  }

  async function pilihBenda(
    id: BendaPusaka['id'],
    langsungBuka = true,
    indeksTitik = 0,
  ): Promise<void> {
    bendaIdAktif = id;
    indeksTitikAktif = indeksTitik;
    statusTanya = 'kosong';
    hasilTanya = null;
    galatTanya = null;
    if (langsungBuka) {
      await pindahLayar('pegang');
    } else if (stagePegang) {
      const b = DAFTAR_BENDA.find((x) => x.id === id) ?? DAFTAR_BENDA[0];
      stagePegang.muatBenda(b);
      const t = b.titikInfo[indeksTitik] ?? b.titikInfo[0];
      if (t) {
        stagePegang.fokusKeTitik(t.posisi3D, t.kameraTarget);
      }
    }
  }

  function pilihTitikInfo(idx: number): void {
    indeksTitikAktif = idx;
    const t = bendaAktif.titikInfo[idx];
    if (t && stagePegang) {
      stagePegang.fokusKeTitik(t.posisi3D, t.kameraTarget);
    }
  }

  function pilihBabak(idx: number): void {
    indeksBabakAktif = idx;
    const b = LAKON_KIJANG_KENCANA.babak[idx];
    if (b) {
      sliderRamaX = b.posisiAwalRama;
      sliderKidangX = b.posisiAwalKidang;
      stagePanggung?.aturPosisiTokoh(sliderRamaX, sliderKidangX);
    }
  }

  function ubahPosisiWayangManual(rama: number, kidang: number): void {
    sliderRamaX = rama;
    sliderKidangX = kidang;
    stagePanggung?.aturPosisiTokoh(sliderRamaX, sliderKidangX);
  }

  async function aktifkanKamera(): Promise<void> {
    if (!videoEl) return;
    if (!pengelolaTangan) {
      pengelolaTangan = new PengelolaTangan(
        (frame) => {
          infoTangan = frame;
          if (!frame.terdeteksi) return;
          if (layarAktif === 'pintu' && stagePintu) {
            stagePintu.terapkanInputTangan(frame.kananX, frame.kananY, frame.jarakCubit);
          } else if (layarAktif === 'pegang' && stagePegang) {
            stagePegang.terapkanInputTangan(frame.kananX, frame.kananY, frame.jarakCubit);
          } else if (layarAktif === 'panggung' && stagePanggung) {
            sliderRamaX = Number(frame.kananX.toFixed(2));
            sliderKidangX = Number(frame.kiriX.toFixed(2));
            stagePanggung.aturPosisiTokoh(
              frame.kananX,
              frame.kiriX,
              frame.kananY * 0.4,
              frame.kiriY * 0.4,
            );
          }
        },
        (st, psn) => {
          statusKamera = st;
          pesanKamera = psn;
        },
      );
    }
    await pengelolaTangan.mulai(videoEl);
  }

  function matikanKamera(): void {
    pengelolaTangan?.matikan();
  }

  async function masukDenganKamera(): Promise<void> {
    await aktifkanKamera();
    await pindahLayar('rak');
  }

  async function masukTanpaKamera(): Promise<void> {
    matikanKamera();
    pesanKamera =
      'Mode tanpa kamera aktif. Gunakan mouse, layar sentuh, atau tombol keyboard untuk seluruh interaksi.';
    await pindahLayar('rak');
  }

  async function kirimPertanyaan(teksOpsional?: string): Promise<void> {
    const q = (teksOpsional ?? inputPertanyaan).trim();
    if (!q) {
      statusTanya = 'galat';
      galatTanya = 'Tuliskan pertanyaan atau pilih salah satu pertanyaan contoh terlebih dahulu.';
      return;
    }
    inputPertanyaan = q;
    statusTanya = 'memuat';
    galatTanya = null;

    try {
      hasilTanya = await tanyakanKeAsisten(bendaAktif.id, q);
      statusTanya = 'selesai';
    } catch (err) {
      statusTanya = 'galat';
      galatTanya =
        err instanceof Error
          ? err.message
          : 'Gagal memproses pertanyaan. Silakan coba lagi.';
    }
  }

  function tanganiResize(): void {
    if (layarAktif === 'pintu' && stagePintu && kanvasPintuEl) {
      stagePintu.ubahUkuran(kanvasPintuEl.clientWidth, kanvasPintuEl.clientHeight);
    }
    if (layarAktif === 'pegang' && stagePegang && kanvasPegangEl) {
      stagePegang.ubahUkuran(kanvasPegangEl.clientWidth, kanvasPegangEl.clientHeight);
    }
    if (layarAktif === 'panggung' && stagePanggung && kanvasPanggungEl) {
      stagePanggung.ubahUkuran(kanvasPanggungEl.clientWidth, kanvasPanggungEl.clientHeight);
    }
  }

  onMount(() => {
    perbaruiJamWib();
    timerJam = setInterval(perbaruiJamWib, 1000);
    window.addEventListener('resize', tanganiResize);
    void inisialisasiKanvasLayar();
  });

  onDestroy(() => {
    if (timerJam) {
      clearInterval(timerJam);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', tanganiResize);
    }
    pengelolaTangan?.matikan();
    stagePintu?.destroy();
    stagePegang?.destroy();
    stagePanggung?.destroy();
  });
</script>

<a class="tautan-lompat" href="#konten-utama">Lompat ke konten utama</a>

<video
  bind:this={videoEl}
  class="video-tersembunyi"
  playsinline
  muted
  aria-hidden="true"
></video>

<!-- Strip Telemetri Atas bergaya Nawfal & Verdara -->
<div class="strip-telemetri" role="region" aria-label="Informasi wilayah dan status sistem">
  <div class="strip-telemetri-dalam">
    <div class="item-telemetri">
      <span class="titik-hidup" aria-hidden="true"></span>
      <span>{waktuWib}</span>
      <span>·</span>
      <span>YOGYAKARTA &amp; JAWA TENGAH</span>
    </div>
    <div class="item-telemetri">
      <span>UNESCO ICH: 00063 · 00112 · 01760</span>
      <span>·</span>
      <span>THREE.JS PBR 1K + MEDIAPIPE LOKAL</span>
    </div>
  </div>
</div>

<header class="bilah-atas">
  <div class="bilah-atas-dalam">
    <button
      type="button"
      class="identitas-merek"
      data-testid="logo-kelir"
      onclick={() => pindahLayar('pintu')}
      aria-label="Kelir, kembali ke layar Pintu"
    >
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="12" fill="#F3EBDC" stroke="#82705E" stroke-width="4" />
        <path d="M32 12 L46 34 L39 52 L25 52 L18 34 Z" fill="#18130F" />
        <circle cx="32" cy="28" r="5" fill="#9E2E17" />
      </svg>
      <span class="merek-latin">Kelir</span>
      <span class="merek-aksara" lang="jv">ꦏꦼꦭꦶꦂ</span>
    </button>

    <nav class="nav-utama" aria-label="Navigasi layar utama">
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-pintu"
        aria-current={layarAktif === 'pintu' ? 'page' : undefined}
        onclick={() => pindahLayar('pintu')}
      >
        <span class="nomor-tab">01</span> Pintu
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-rak"
        aria-current={layarAktif === 'rak' ? 'page' : undefined}
        onclick={() => pindahLayar('rak')}
      >
        <span class="nomor-tab">02</span> Rak Pusaka
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-pegang"
        aria-current={layarAktif === 'pegang' ? 'page' : undefined}
        onclick={() => pindahLayar('pegang')}
      >
        <span class="nomor-tab">03</span> Ruang Pegang 3D
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-panggung"
        aria-current={layarAktif === 'panggung' ? 'page' : undefined}
        onclick={() => pindahLayar('panggung')}
      >
        <span class="nomor-tab">04</span> Panggung Kelir
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-sumber"
        aria-current={layarAktif === 'sumber' ? 'page' : undefined}
        onclick={() => pindahLayar('sumber')}
      >
        <span class="nomor-tab">05</span> Sumber &amp; Aksara
      </button>
    </nav>

    <div class="kontrol-kanan" role="group" aria-label="Bahasa dan tampilan">
      <button
        type="button"
        class="tombol-bahasa"
        data-testid="lang-id"
        aria-pressed={bahasaAktif === 'id'}
        onclick={() => terapkanBahasa('id')}
      >
        ID
      </button>
      <button
        type="button"
        class="tombol-bahasa"
        data-testid="lang-jv"
        aria-pressed={bahasaAktif === 'jv'}
        onclick={() => terapkanBahasa('jv')}
      >
        Jawa
      </button>
      <button
        type="button"
        class="tombol-bahasa"
        data-testid="lang-aksara"
        aria-pressed={bahasaAktif === 'aksara'}
        onclick={() => terapkanBahasa('aksara')}
      >
        <span lang="jv">ꦲꦤꦕꦫꦏ</span>
      </button>
      <button
        type="button"
        class="tombol"
        data-testid="toggle-tema"
        onclick={() => terapkanTema(temaAktif === 'malam' ? 'siang' : 'malam')}
      >
        Tema: {temaAktif === 'malam' ? 'Malam (Blencong)' : 'Siang (Kain Kelir)'}
      </button>
    </div>
  </div>
</header>

<main id="konten-utama" class="wadah-utama" bind:this={wadahLayarEl}>
  <section class="pita-status" aria-label="Status kendali dan bahasa">
    <div class="label-status" data-testid="status-kendali">
      {#if statusKamera === 'aktif'}
        <span class="penanda-status">KAMERA AKTIF</span>
        <span>
          Tangan terdeteksi: {infoTangan.jumlahTangan} · Aksi: {infoTangan.gesturAktif}
        </span>
      {:else if statusKamera === 'meminta-izin'}
        <span class="penanda-draf">MEMUAT KAMERA</span>
        <span>{pesanKamera}</span>
      {:else if statusKamera === 'ditolak' || statusKamera === 'galat'}
        <span class="penanda-draf" data-testid="badge-fallback-kamera">MODE MANUAL AKTIF</span>
        <span>{pesanKamera}</span>
      {:else}
        <span class="penanda-status">KENDALI MANUAL SIAP</span>
        <span>
          {pesanKamera ??
            'Seluruh fitur berjalan dengan mouse, sentuh, dan keyboard; kamera opsional.'}
        </span>
      {/if}
    </div>

    <div class="panel-kamera-kecil">
      {#if bahasaAktif !== 'id'}
        <span class="penanda-draf" data-testid="status-tinjauan-jawa">
          Teks Jawa: Draf (Aksara dihitung berbasis aturan)
        </span>
      {:else}
        <span class="penanda-status">SUMBER TERKURASI S1..S6</span>
      {/if}

      {#if statusKamera === 'aktif'}
        <button
          type="button"
          class="tombol"
          data-testid="tombol-matikan-kamera"
          onclick={matikanKamera}
        >
          Matikan Kamera
        </button>
      {:else}
        <button
          type="button"
          class="tombol"
          data-testid="tombol-aktifkan-kamera"
          onclick={aktifkanKamera}
        >
          Aktifkan Kamera Tangan
        </button>
      {/if}
    </div>
  </section>

  {#if layarAktif === 'pintu'}
    <section class="panggung-pintu" aria-labelledby="judul-pintu" data-testid="layar-pintu">
      <div class="grid-pintu">
        <div class="anim-masuk">
          <div class="lencana-hero-baris">
            <span class="lencana-kapsul">● WARISAN 3D PBR + WAYANG TANGAN</span>
            <span class="lencana-kapsul">YOGYAKARTA &amp; JAWA TENGAH</span>
            <span class="lencana-kapsul">UNICODE U+A980..U+A9DF</span>
          </div>

          <h1 id="judul-pintu">
            {#if bahasaAktif === 'aksara'}
              <span class="teks-aksara" lang="jv">
                {latinToAksara('kelir pusaka lan wayang jawi')}
              </span>
            {:else if bahasaAktif === 'jv'}
              Kelir: Nyinau <span class="sorot-garis-bawah">Pusaka 3D</span> lan Lampahan Ringgit Purwa
            {:else}
              Pegang <span class="sorot-garis-bawah">Pusaka Jawa 3D</span> dan Mainkan Bayangannya di Atas Kelir
            {/if}
          </h1>

          <p>
            Di museum fisik, keris berpamor, saron gamelan perunggu, dan wayang kulit tersimpan di
            balik kaca. Di <strong>Kelir</strong>, Anda memutar model tiga dimensi bertekstur nyata
            (pamor tempa lipat, kayu jati ukir 1K, dan kulit kerbau koleksi museum), mengetuk bilah
            nada <em>slendro</em>, lalu memainkan lakon Ramayana <em>Kijang Kencana</em> dalam
            Bahasa Indonesia, Bahasa Jawa, dan Aksara Jawa.
          </p>

          <p class="teks-redup-kelir">
            <strong>Privasi &amp; aksesibilitas:</strong> Pelacakan 21 titik tangan memakai
            <em>MediaPipe Hand Landmarker</em> yang berjalan 100% lokal di memori browser Anda tanpa
            mengunggah video ke server. Tidak memakai webcam? Masuk lewat jalur tanpa kamera untuk
            memakai mouse, sentuh, atau keyboard penuh.
          </p>

          <div class="baris-aksi-pintu">
            <button
              type="button"
              class="tombol tombol-utama"
              data-testid="cta-masuk-manual"
              onclick={masukTanpaKamera}
            >
              Masuk Tanpa Kamera (Mouse / Keyboard) →
            </button>
            <button
              type="button"
              class="tombol"
              data-testid="cta-masuk-kamera"
              onclick={masukDenganKamera}
            >
              Masuk dengan Kamera Tangan
            </button>
            <button
              type="button"
              class="tombol"
              data-testid="cta-lihat-sumber-pintu"
              onclick={() => pindahLayar('sumber')}
            >
              Periksa Sumber UNESCO &amp; Britannica
            </button>
          </div>
        </div>

        <!-- Panggung Pratinjau 3D Interaktif Langsung di Hero Pintu -->
        <div
          class="kotak-siluet-pintu anim-masuk"
          aria-label="Pratinjau 3D interaktif benda pusaka dan bayangan kelir"
        >
          <div class="hud-atas-3d">
            <span>PRATINJAU 3D PBR LANGSUNG · SERET UNTUK MEMUTAR</span>
            <span>{bendaHeroAktif.nama.id.toUpperCase()}</span>
          </div>

          <div
            class="kanvas-hero-pintu"
            bind:this={kanvasPintuEl}
            role="region"
            aria-label={`Pratinjau 3D ${bendaHeroAktif.nama.id} di atas layar kelir`}
          ></div>

          {#if !webglPintuTersedia}
            <div style="padding: 1rem;">
              <p style="margin: 0; font-size: 0.88rem;">
                Pratinjau 3D siap dijalankan. Klik salah satu pusaka di bawah untuk membuka detail
                anatomi dan sumbernya.
              </p>
            </div>
          {/if}

          <div class="hud-bawah-3d" role="group" aria-label="Pilih objek 3D pada pratinjau Pintu">
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'keris'}
                onclick={() => gantiBendaHero('keris')}
              >
                01 Keris Luk 5
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'saron'}
                onclick={() => gantiBendaHero('saron')}
              >
                02 Saron Slendro
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'wayang'}
                onclick={() => gantiBendaHero('wayang')}
              >
                03 Wayang Kulit
              </button>
            </div>

            <button
              type="button"
              class="tombol-hud"
              onclick={() => pilihBenda(bendaHeroId, true)}
            >
              Buka Ruang 3D →
            </button>
          </div>
        </div>
      </div>

      <!-- Bento 4 Pilar Keunggulan Teknis & Budaya -->
      <div class="bento-pintu-grid">
        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">01 · MATERIAL &amp; TEKSTUR NYATA</span>
          <div class="angka-bento">3 Pusaka PBR</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Pamor tempa lipat <em>Wos Wutah</em>, kayu jati 1K CC0, perunggu <em>gangsa</em>
            bersuara <em>slendro</em>, dan kulit kerbau koleksi museum berbayangan tatahan asli.
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">02 · ANATOMI TERKURASI</span>
          <div class="angka-bento">12 Titik Uji</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Setiap bagian (<em>wilah</em>, <em>ganja</em>, <em>pamor</em>, <em>rancakan</em>,
            <em>cempurit</em>, <em>tuding</em>) terhubung ke sorotan kamera 3D dan kode sumber S1..S6.
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">03 · AKSARA JAWA DETERMINISTIK</span>
          <div class="angka-bento">U+A980..A9DF</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Mesin transliterasi Latin ke Aksara Jawa berbasis aturan murni tanpa halusinasi AI,
            lengkap dengan Bahasa Indonesia dan Krama (berlabel draf jujur).
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">04 · KENDALI INKLUSIF</span>
          <div class="angka-bento">100% Lokal</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Kemudi gestur tangan 21 titik via <em>MediaPipe WASM</em> di memori perangkat atau
            kendali penuh via mouse, layar sentuh, dan keyboard.
          </p>
        </div>
      </div>
    </section>
  {:else if layarAktif === 'rak'}
    <section aria-labelledby="judul-rak" data-testid="layar-rak">
      <div style="margin-bottom: 1.25rem;" class="anim-masuk">
        <p class="mono-kecil teks-redup" style="margin-bottom: 0.3rem;">
          02 / KOLEKSI PUSAKA YOGYAKARTA &amp; JAWA TENGAH
        </p>
        <h1 id="judul-rak">Rak Pusaka Jawa</h1>
        <p class="teks-redup">
          Tiga pusaka yang saling terhubung di dalam satu pertunjukan wayang: <strong>Keris</strong>
          sebagai kelengkapan satria, <strong>Saron Gamelan</strong> sebagai penjaga melodi
          <em>balungan</em>, dan <strong>Wayang Kulit Purwa</strong> sebagai pemeran di layar kelir.
          Pilih satu benda untuk memegang model 3D bertekstur nyata.
        </p>
      </div>

      <div class="tata-rak">
        {#each DAFTAR_BENDA as benda, i (benda.id)}
          {@const namaTerjemah = ambilTeks(benda.nama, bahasaAktif)}
          {@const subTerjemah = ambilTeks(benda.subjudul, bahasaAktif)}
          {@const ringkasTerjemah = ambilTeks(benda.ringkasan, bahasaAktif)}
          <article
            class={i === 0
              ? 'panel-pusaka panel-pusaka-utama item-rak-utama anim-masuk'
              : 'panel-pusaka anim-masuk'}
            data-testid={`kartu-pusaka-${benda.id}`}
          >
            <div>
              <div class="meta-unesco">
                <span>0{i + 1} · {benda.kategori}</span>
                <span>UNESCO {benda.tahunUnesco} (BERKAS {benda.berkasUnesco})</span>
              </div>

              <h2
                class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}
                style="margin-top: 0.7rem;"
              >
                {namaTerjemah.utama}
              </h2>
              {#if namaTerjemah.pendampingLatin}
                <p class="teks-redup" style="margin-bottom: 0.35rem; font-size: 0.9rem;">
                  {namaTerjemah.pendampingLatin}
                </p>
              {/if}

              <p><strong>{subTerjemah.utama}</strong></p>
              <p>{ringkasTerjemah.utama}</p>

              <p class="mono-kecil" style="margin-bottom: 0.35rem;">
                TEKSTUR 3D: {SPEC_MATERIAL_PBR[benda.id]}
              </p>

              <div class="daftar-chip-anatomi" aria-label="Titik anatomi benda">
                {#each benda.titikInfo as t, tIdx (t.id)}
                  <span class="chip-anatomi">
                    {tIdx + 1}. {t.label.id}
                  </span>
                {/each}
              </div>

              <p class="teks-redup" style="font-size: 0.88rem; margin-bottom: 0;">
                <strong>Peran di pertunjukan:</strong> {benda.peranPanggung} · Sumber:
                <strong>{benda.sumber.join(', ')}</strong>
              </p>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <button
                type="button"
                class="tombol tombol-utama"
                data-testid={`buka-pegang-${benda.id}`}
                onclick={() => pilihBenda(benda.id, true)}
              >
                Pegang {benda.nama.id} di Ruang 3D →
              </button>
              <button
                type="button"
                class="tombol"
                onclick={() => pindahLayar('panggung')}
              >
                Mainkan di Panggung Kelir
              </button>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {:else if layarAktif === 'pegang'}
    {@const namaBenda = ambilTeks(bendaAktif.nama, bahasaAktif)}
    {@const ringkasBenda = ambilTeks(bendaAktif.ringkasan, bahasaAktif)}
    {@const labelTitik = ambilTeks(titikAktif.label, bahasaAktif)}
    {@const uraianTitik = ambilTeks(titikAktif.uraian, bahasaAktif)}
    <section aria-labelledby="judul-pegang" data-testid="layar-pegang">
      <div
        style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem;"
        class="anim-masuk"
      >
        <div>
          <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
            03 / INSPEKSI ANATOMI 3D PBR &amp; BAYANGAN BLENCONG
          </p>
          <h1 id="judul-pegang" class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
            {namaBenda.utama}
          </h1>
          {#if namaBenda.pendampingLatin}
            <p class="teks-redup" style="margin-bottom: 0.25rem;">
              {namaBenda.pendampingLatin}
            </p>
          {/if}
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;" role="group" aria-label="Pilih benda pusaka">
          {#each DAFTAR_BENDA as b (b.id)}
            <button
              type="button"
              class="tombol"
              data-testid={`tab-benda-${b.id}`}
              aria-pressed={bendaIdAktif === b.id}
              onclick={() => pilihBenda(b.id, false)}
            >
              {b.nama.id}
            </button>
          {/each}
        </div>
      </div>

      <div class="tata-pegang">
        <div class="bingkai-kanvas-3d anim-masuk">
          <div class="hud-atas-3d">
            <span>MATERIAL: {SPEC_MATERIAL_PBR[bendaAktif.id]}</span>
            <span>UNESCO {bendaAktif.berkasUnesco}</span>
          </div>

          <div
            class="kanvas-viewport"
            bind:this={kanvasPegangEl}
            data-testid="kanvas-3d-pegang"
            role="region"
            aria-label={`Kanvas 3D ${bendaAktif.nama.id}. Seret untuk memutar atau gunakan tombol kendali di bawah.`}
          ></div>

          {#if !webglPegangTersedia}
            <div style="padding: 1rem; background: var(--bg-permukaan);">
              <p>
                Perangkat ini tidak mengaktifkan WebGL. Seluruh titik anatomis dan penjelasan
                {bendaAktif.nama.id} tetap dapat dibaca melalui tombol bagian di samping.
              </p>
            </div>
          {/if}

          {#if bendaAktif.id === 'saron'}
            <div class="panel-nada-saron" role="group" aria-label="Tabuh 7 bilah saron laras slendro">
              <span class="mono-kecil">
                TABUH 7 WILAH LARAS SLENDRO (KLIK TOMBOL ATAU KETUK BILAH 3D):
              </span>
              <div class="baris-tombol-wilah">
                {#each NADA_SARON_SLENDRO as infoNada, idxNada (infoNada.nomor)}
                  <button
                    type="button"
                    class="tombol"
                    data-testid={`tabuh-wilah-${infoNada.nomor}`}
                    onclick={() => stagePegang?.tabuhWilahSaron(idxNada)}
                  >
                    Wilah {infoNada.nomor} ({infoNada.notasi})
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="bilah-kendali-3d" role="group" aria-label="Kendali putar dan perbesar model 3D">
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <button
                type="button"
                class="tombol"
                data-testid="putar-kiri"
                onclick={() => stagePegang?.putarManual(-0.35, 0)}
              >
                Putar Kiri
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="putar-kanan"
                onclick={() => stagePegang?.putarManual(0.35, 0)}
              >
                Putar Kanan
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="zoom-dekat"
                onclick={() => stagePegang?.ubahZoom(-0.35)}
              >
                Perbesar
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="zoom-jauh"
                onclick={() => stagePegang?.ubahZoom(0.35)}
              >
                Perkecil
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="reset-pandangan"
                onclick={() => stagePegang?.resetPandangan()}
              >
                Tengah Semula
              </button>
            </div>

            <button
              type="button"
              class="tombol tombol-utama"
              data-testid="ke-panggung-dari-pegang"
              onclick={() => pindahLayar('panggung')}
            >
              Mainkan Lakon Wayang →
            </button>
          </div>
        </div>

        <div class="panel-detail anim-masuk">
          <p>{ringkasBenda.utama}</p>
          {#if ringkasBenda.catatanStatus}
            <p class="penanda-draf" style="display: inline-block;">
              {ringkasBenda.catatanStatus}
            </p>
          {/if}

          <h2 style="font-size: 1.2rem; margin-top: 0.75rem;">
            Pilih Bagian Benda ({bendaAktif.titikInfo.length} Titik Anatomis)
          </h2>

          <div class="daftar-titik-info" role="group" aria-label="Titik anatomis benda">
            {#each bendaAktif.titikInfo as titik, idx (titik.id)}
              <button
                type="button"
                class={indeksTitikAktif === idx ? 'tombol tombol-utama' : 'tombol'}
                data-testid={`titik-info-${titik.id}`}
                aria-pressed={indeksTitikAktif === idx}
                onclick={() => pilihTitikInfo(idx)}
              >
                {idx + 1}. {titik.label.id}
              </button>
            {/each}
          </div>

          <article
            style="border: 1px solid var(--garis-batas); padding: 0.95rem; border-radius: var(--radius-kotak); background: var(--bg-utama);"
            data-testid="detail-titik-aktif"
          >
            <h3 class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
              {labelTitik.utama}
            </h3>
            {#if labelTitik.pendampingLatin}
              <p class="teks-redup" style="font-size: 0.88rem; margin-bottom: 0.35rem;">
                {labelTitik.pendampingLatin}
              </p>
            {/if}
            <p style="margin-bottom: 0.45rem;" class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
              {uraianTitik.utama}
            </p>
            {#if uraianTitik.pendampingLatin && bahasaAktif === 'aksara'}
              <p class="teks-redup" style="font-size: 0.88rem;">
                Latin: {uraianTitik.pendampingLatin}
              </p>
            {/if}
            <p class="teks-redup" style="font-size: 0.84rem; margin: 0;">
              Kode sumber: <strong>{titikAktif.sumber.join(', ')}</strong> · Lisensi geometri:
              <strong>{bendaAktif.lisensiRef}, P1, W1</strong>
            </p>
          </article>

          <div class="kotak-tanya">
            <h3 style="font-size: 1.1rem;">
              Tanya Jawab Terikat Sumber ({bendaAktif.nama.id})
            </h3>
            <p class="teks-redup" style="font-size: 0.88rem; margin-bottom: 0.5rem;">
              Dijawab dari teks kurasi bersumber (Gemini API / Meta Llama API / Pencocokan Lokal).
              Pertanyaan di luar konteks pusaka akan ditolak secara jujur.
            </p>

            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem;">
              {#each CONTOH_PERTANYAAN[bendaAktif.id] as contoh, cIdx (contoh)}
                <button
                  type="button"
                  class="tombol"
                  style="font-size: 0.82rem; padding: 0.38rem 0.72rem;"
                  data-testid={`contoh-tanya-${cIdx}`}
                  onclick={() => kirimPertanyaan(contoh)}
                >
                  {contoh}
                </button>
              {/each}
            </div>

            <form
              class="baris-input-tanya"
              onsubmit={(e) => {
                e.preventDefault();
                kirimPertanyaan();
              }}
            >
              <label for="input-tanya-pusaka" class="label-sr-only">
                Pertanyaan tentang {bendaAktif.nama.id}
              </label>
              <input
                id="input-tanya-pusaka"
                class="input-teks"
                type="text"
                data-testid="input-tanya"
                placeholder={`Tanyakan bagian atau sejarah ${bendaAktif.nama.id}...`}
                bind:value={inputPertanyaan}
              />
              <button type="submit" class="tombol tombol-utama" data-testid="kirim-tanya">
                Tanyakan
              </button>
            </form>

            <div style="margin-top: 0.75rem;" aria-live="polite" data-testid="kotak-jawaban-tanya">
              {#if statusTanya === 'kosong'}
                <p class="teks-redup" style="font-size: 0.88rem; margin: 0;">
                  Belum ada pertanyaan yang dikirim. Pilih salah satu tombol pertanyaan di atas atau
                  ketik pertanyaan Anda.
                </p>
              {:else if statusTanya === 'memuat'}
                <p style="margin: 0;">Memeriksa rujukan kurasi untuk menjawab pertanyaan Anda...</p>
              {:else if statusTanya === 'galat'}
                <p class="penanda-draf" style="margin: 0;" data-testid="pesan-galat-tanya">
                  {galatTanya}
                </p>
              {:else if hasilTanya}
                <div
                  style="border: 1px solid var(--garis-batas); padding: 0.85rem; border-radius: var(--radius-kotak); background: var(--bg-utama);"
                >
                  <p style="margin-bottom: 0.4rem;">{hasilTanya.jawaban}</p>
                  <p class="teks-redup" style="font-size: 0.82rem; margin: 0;">
                    Sumber rujukan: <strong>{hasilTanya.sumberKode.join(', ')}</strong> · Jalur
                    penyedia: <strong>{hasilTanya.modePenyedia}</strong>
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </section>
  {:else if layarAktif === 'panggung'}
    {@const judulLakon = ambilTeks(LAKON_KIJANG_KENCANA.judul, bahasaAktif)}
    {@const judulBabak = ambilTeks(babakAktif.judul, bahasaAktif)}
    {@const narasiBabak = ambilTeks(babakAktif.narasi, bahasaAktif)}
    <section aria-labelledby="judul-panggung" data-testid="layar-panggung">
      <div style="margin-bottom: 1rem;" class="anim-masuk">
        <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
          04 / TEATER BAYANGAN WAYANG KULIT MUSEUM &amp; SOROT BLENCONG
        </p>
        <h1 id="judul-panggung" class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
          {judulLakon.utama}
        </h1>
        <p class="teks-redup" style="margin-bottom: 0.5rem;">
          {LAKON_KIJANG_KENCANA.eposAsal} · Sumber: {LAKON_KIJANG_KENCANA.sumber.join(', ')}
        </p>
      </div>

      <div class="navigasi-babak anim-masuk" role="group" aria-label="Pilih babak lakon Kijang Kencana">
        {#each LAKON_KIJANG_KENCANA.babak as b, idx (b.nomor)}
          <button
            type="button"
            class={indeksBabakAktif === idx ? 'tombol tombol-utama' : 'tombol'}
            data-testid={`tombol-babak-${b.nomor}`}
            aria-pressed={indeksBabakAktif === idx}
            onclick={() => pilihBabak(idx)}
          >
            Babak {b.nomor}
          </button>
        {/each}
      </div>

      <div class="tata-panggung">
        <div class="bingkai-kanvas-3d anim-masuk">
          <div class="hud-atas-3d">
            <span>KIRI: KIDANG KENCANA (TMnr 809-167o)</span>
            <span>TENGAH: KAIN KELIR &amp; GEDEBOG</span>
            <span>KANAN: SRI RAMA (TMnr 3582-30)</span>
          </div>
          <div
            class="kanvas-viewport"
            bind:this={kanvasPanggungEl}
            data-testid="kanvas-3d-panggung"
            role="region"
            aria-label="Panggung layar kelir menampilkan bayangan Sri Rama di kanan dan Kidang Kencana di kiri"
          ></div>
          {#if !webglPanggungTersedia}
            <div style="padding: 1rem; background: var(--bg-permukaan);">
              <p>
                Tampilan WebGL tidak aktif pada perangkat ini. Anda tetap dapat membaca seluruh
                empat babak lakon <em>Kijang Kencana</em> di bawah ini.
              </p>
            </div>
          {/if}
        </div>

        <div class="kontrol-slider-wayang anim-masuk">
          <div>
            <label for="slider-kidang">
              <strong>Tangan Kiri · {LAKON_KIJANG_KENCANA.tokohKiri}:</strong>
              posisi {sliderKidangX.toFixed(2)}
            </label>
            <input
              id="slider-kidang"
              class="slider-input"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              data-testid="slider-kidang"
              value={sliderKidangX}
              oninput={(e) =>
                ubahPosisiWayangManual(
                  sliderRamaX,
                  parseFloat((e.currentTarget as HTMLInputElement).value),
                )}
            />
          </div>

          <div>
            <label for="slider-rama">
              <strong>Tangan Kanan · {LAKON_KIJANG_KENCANA.tokohKanan}:</strong>
              posisi {sliderRamaX.toFixed(2)}
            </label>
            <input
              id="slider-rama"
              class="slider-input"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              data-testid="slider-rama"
              value={sliderRamaX}
              oninput={(e) =>
                ubahPosisiWayangManual(
                  parseFloat((e.currentTarget as HTMLInputElement).value),
                  sliderKidangX,
                )}
            />
          </div>
        </div>

        <article class="panel-detail anim-masuk" data-testid="narasi-babak-aktif">
          <h2 class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
            {judulBabak.utama}
          </h2>
          {#if judulBabak.pendampingLatin}
            <p class="teks-redup" style="font-size: 0.9rem;">
              {judulBabak.pendampingLatin}
            </p>
          {/if}

          <p class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
            {narasiBabak.utama}
          </p>
          {#if narasiBabak.pendampingLatin && bahasaAktif === 'aksara'}
            <p class="teks-redup" style="font-size: 0.9rem;">
              Latin: {narasiBabak.pendampingLatin}
            </p>
          {/if}

          <p class="teks-redup" style="margin-bottom: 0.75rem;">
            <strong>Petunjuk olah wayang:</strong> {babakAktif.petunjukDalang}
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <button
              type="button"
              class="tombol"
              disabled={indeksBabakAktif === 0}
              onclick={() => pilihBabak(Math.max(0, indeksBabakAktif - 1))}
            >
              Babak Sebelumnya
            </button>
            <button
              type="button"
              class="tombol tombol-utama"
              data-testid="babak-berikutnya"
              onclick={() =>
                indeksBabakAktif < LAKON_KIJANG_KENCANA.babak.length - 1
                  ? pilihBabak(indeksBabakAktif + 1)
                  : pindahLayar('sumber')}
            >
              {indeksBabakAktif < LAKON_KIJANG_KENCANA.babak.length - 1
                ? 'Babak Berikutnya →'
                : 'Buka Daftar Sumber & Aksara →'}
            </button>
          </div>
        </article>
      </div>
    </section>
  {:else if layarAktif === 'sumber'}
    <section aria-labelledby="judul-sumber" data-testid="layar-sumber">
      <div class="tata-sumber">
        <div class="anim-masuk">
          <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
            05 / AUDIT RUJUKAN ILMIAH, LISENSI PBR, &amp; ALIHAKSARA JAWA
          </p>
          <h1 id="judul-sumber">Sumber Pustaka, Lisensi Aset, &amp; Alihaksara Jawa</h1>
          <p class="teks-redup">
            Sesuai prinsip bukti di atas klaim, seluruh uraian budaya dan aset tekstur pada aplikasi
            ini merujuk pada dokumen resmi di bawah ini. Tidak ada fakta budaya yang diserahkan pada
            karangan bebas AI.
          </p>
        </div>

        <!-- Alat Uji Transliterator Aksara Jawa Berbasis Aturan -->
        <div class="panel-detail anim-masuk">
          <h2>Uji Alihaksara Latin ke Aksara Jawa (Berbasis Aturan)</h2>
          <p class="teks-redup">
            Mesin alihaksara kami ditulis dalam TypeScript murni (<code>src/lib/aksara.ts</code>)
            mengikuti blok Unicode <code>U+A980..U+A9DF</code> tanpa memakai model AI agar hasilnya
            konsisten dan dapat diuji. Gunakan <code>e</code> untuk pepet (<code>ꦼ</code>) dan
            <code>é</code> untuk taling (<code>ꦺ</code>).
          </p>

          <div class="baris-input-tanya">
            <label for="input-uji-aksara" class="label-sr-only">
              Ketik kata Jawa dalam huruf Latin
            </label>
            <input
              id="input-uji-aksara"
              class="input-teks"
              type="text"
              data-testid="input-uji-aksara"
              bind:value={inputUjiAksara}
            />
          </div>

          <div
            style="margin-top: 0.75rem; padding: 0.95rem; border: 1px solid var(--garis-batas); background: var(--bg-utama); border-radius: var(--radius-kotak);"
          >
            <p class="teks-redup" style="font-size: 0.85rem; margin-bottom: 0.25rem;">
              Keluaran Aksara Jawa (Noto Sans Javanese):
            </p>
            <p
              class="teks-aksara"
              lang="jv"
              style="font-size: 1.65rem; margin: 0;"
              data-testid="keluaran-uji-aksara"
            >
              {hasilUjiAksara || '(kosong)'}
            </p>
          </div>

          <div style="margin-top: 0.85rem; display: flex; flex-wrap: wrap; gap: 0.45rem;">
            {#each CONTOH_TERUJI as item (item.latin)}
              <button
                type="button"
                class="tombol"
                onclick={() => {
                  inputUjiAksara = item.latin;
                }}
              >
                {item.latin} (<span lang="jv" class="teks-aksara">{item.aksara}</span>)
              </button>
            {/each}
          </div>
        </div>

        <!-- Tabel Sumber Rujukan -->
        <div class="anim-masuk">
          <h2>Daftar Sumber Rujukan Terverifikasi (S1..S6)</h2>
          <div class="bungkus-tabel">
            <table class="tabel-data" data-testid="tabel-sumber">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Judul &amp; Lembaga</th>
                  <th>Tahun</th>
                  <th>Ringkasan Fakta yang Dipakai</th>
                  <th>Tautan Resmi</th>
                </tr>
              </thead>
              <tbody>
                {#each DAFTAR_SUMBER as s (s.kode)}
                  <tr>
                    <td><strong>{s.kode}</strong></td>
                    <td>
                      <strong>{s.judul}</strong><br />
                      <span class="teks-redup">{s.lembaga}</span>
                    </td>
                    <td>{s.tahun}</td>
                    <td>{s.ringkasan}</td>
                    <td>
                      <a
                        class="tautan-sumber"
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buka Sumber {s.kode}
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabel Register Lisensi Aset -->
        <div class="anim-masuk">
          <h2>Register Lisensi Aset 3D, Tekstur PBR, &amp; Perangkat Lunak</h2>
          <div class="bungkus-tabel">
            <table class="tabel-data" data-testid="tabel-lisensi">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Aset / Komponen</th>
                  <th>Dipakai di</th>
                  <th>Pembuat</th>
                  <th>Lisensi</th>
                </tr>
              </thead>
              <tbody>
                {#each DAFTAR_LISENSI as lis (lis.id)}
                  <tr>
                    <td><strong>{lis.id}</strong></td>
                    <td>{lis.nama}</td>
                    <td>{lis.dipakaiDi}</td>
                    <td>{lis.pembuat}</td>
                    <td>{lis.lisensi}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>

<footer class="kaki-halaman">
  <div class="kaki-dalam">
    <div>
      <strong>Kelir</strong> (<span lang="jv" class="teks-aksara">ꦏꦼꦭꦶꦂ</span>) · Karya Inovasi
      Kategori Software Development · Tema: <em>From Ideas to Innovation</em>.
    </div>
    <div>
      Seluruh pemrosesan kamera berjalan lokal di perangkat · Sumber: UNESCO (00063, 00112, 01760),
      Museum Sonobudoyo, Tropenmuseum, Poly Haven CC0, Britannica.
    </div>
  </div>
</footer>
