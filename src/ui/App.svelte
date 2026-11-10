<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import {
    DAFTAR_BENDA,
    DAFTAR_LISENSI,
    DAFTAR_SUMBER,
    LAKON_KIJANG_KENCANA,
    ambilTeks,
    type BahasaMode,
    type BendaPusaka,
  } from '../content/pusaka';
  import {
    CONTOH_TERUJI,
    DAFTAR_20_CARAKAN,
    FILOSOFI_BARIS_CARAKAN,
    latinToAksara,
    type KartuCarakan,
  } from '../lib/aksara';
  import { audioBudaya } from '../lib/audioBudaya';
  import {
    DESKRIPSI_GESTUR,
    PengelolaTangan,
    type FrameTangan,
    type JenisGesturTangan,
    type StatusKamera,
  } from '../lib/handTracker';
  import {
    CONTOH_PERTANYAAN,
    tanyakanKeAsisten,
    type JawabanTanya,
  } from '../lib/tanya';
  import {
    ArtifactStage,
    LABEL_EFEK_KHUSUS_3D,
    NADA_SARON_SLENDRO,
  } from '../scenes/ArtifactStage';
  import { WayangStage } from '../scenes/WayangStage';

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  type LayarId = 'pintu' | 'rak' | 'pegang' | 'panggung' | 'sumber';
  type TemaMode = 'malam' | 'siang';

  const URUTAN_LAYAR: LayarId[] = ['pintu', 'rak', 'pegang', 'panggung', 'sumber'];

  let layarAktif = $state<LayarId>('pintu');
  let bahasaAktif = $state<BahasaMode>('id');
  let temaAktif = $state<TemaMode>('malam');

  let bendaIdAktif = $state<BendaPusaka['id']>('keris');
  let bendaHeroId = $state<BendaPusaka['id']>('keris');
  let indeksTitikAktif = $state<number>(0);
  let indeksBabakAktif = $state<number>(0);
  let waktuWib = $state<string>('YOGYAKARTA · WIB');
  let labelBabTransisi = $state<string>('Bab I · Beranda Eksibisi');

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
    kemiringanPergelangan: 0,
    kecepatanGerak: 0,
    jumlahJariTerbuka: 0,
  });

  let suaraBudayaAktif = $state<boolean>(true);
  let gendingPendopoAktif = $state<boolean>(false);

  const DAFTAR_PANDUAN_GESTUR: {
    kode: JenisGesturTangan;
    simbol: string;
    judul: string;
    uraian: string;
  }[] = [
    {
      kode: 'telapak-putar',
      simbol: '✋',
      judul: 'Telapak Terbuka & Miring',
      uraian: 'Putar orbit 3D, miringkan pergelangan (roll), dan arahkan sorot lampu blencong.',
    },
    {
      kode: 'cubit-zoom',
      simbol: '🤏',
      judul: 'Cubit Ibu Jari & Telunjuk',
      uraian: 'Perbesar atau perkecil jarak kamera untuk mengamati detail tekstur pamor & serat.',
    },
    {
      kode: 'kepal-aksi',
      simbol: '✊',
      judul: 'Kepalan Tangan (Aksi Utama)',
      uraian: 'Cabut Keris, putar Gending Saron, jalankan Canting, atau bedah atap Joglo 3D.',
    },
    {
      kode: 'dua-jari-sabetan',
      simbol: '✌️',
      judul: 'Dua Jari (Simulasi Fisik 3D)',
      uraian: 'Pijar pamor Keris, glissando Saron, celup malam, uji gempa Joglo, atau panah 3D.',
    },
    {
      kode: 'tunjuk-ketuk',
      simbol: '☝️',
      judul: 'Telunjuk Tunggal (Tabuh Saron)',
      uraian: 'Arahkan telunjuk dari kiri ke kanan untuk menabuh 7 wilah Saron di udara.',
    },
    {
      kode: 'dua-tangan-dalang',
      simbol: '🙌',
      judul: 'Dua Tangan Dalang',
      uraian: 'Kemudikan Sri Rama (tangan kanan) dan Kidang Kencana (tangan kiri) bersamaan.',
    },
  ];

  let sliderRamaX = $state<number>(LAKON_KIJANG_KENCANA.babak[0].posisiAwalRama);
  let sliderKidangX = $state<number>(LAKON_KIJANG_KENCANA.babak[0].posisiAwalKidang);

  let inputPertanyaan = $state<string>('');
  let statusTanya = $state<'kosong' | 'memuat' | 'selesai' | 'galat'>('kosong');
  let hasilTanya = $state<JawabanTanya | null>(null);
  let galatTanya = $state<string | null>(null);

  let inputUjiAksara = $state<string>('kelir pusaka jawi');
  let carakanTerpilih = $state<KartuCarakan>(DAFTAR_20_CARAKAN[0]);
  let aksi3DPintuAktif = $state<boolean>(false);
  let aksi3DPegangAktif = $state<boolean>(false);
  let webglPintuTersedia = $state<boolean>(true);
  let webglPegangTersedia = $state<boolean>(true);
  let webglPanggungTersedia = $state<boolean>(true);

  let wadahLayarEl: HTMLElement | undefined = $state();
  let barProgresEl: HTMLElement | undefined = $state();
  let tiraiKiriEl: HTMLElement | undefined = $state();
  let tiraiKananEl: HTMLElement | undefined = $state();
  let tiraiIkonEl: HTMLElement | undefined = $state();
  let kartuTitikEl: HTMLElement | undefined = $state();
  let kartuBabakEl: HTMLElement | undefined = $state();
  let videoEl: HTMLVideoElement | undefined = $state();
  let kanvasPintuEl: HTMLElement | undefined = $state();
  let kanvasPegangEl: HTMLElement | undefined = $state();
  let kanvasPanggungEl: HTMLElement | undefined = $state();

  let pengelolaTangan: PengelolaTangan | null = null;
  let stagePintu: ArtifactStage | null = null;
  let stagePegang: ArtifactStage | null = null;
  let stagePanggung: WayangStage | null = null;
  let timerJam: ReturnType<typeof setInterval> | null = null;
  let tweenAksaraAir: gsap.core.Tween | null = null;

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
    keris: 'Bilah 3D 64 Irisan Berpamor + Kayu Jati 1K (Poly Haven CC0) + Animasi Sarungkan',
    saron: '7 Wilah Perunggu Cembung 3D + Rancakan Ukir Emas + Gending Slendro Otomatis',
    batik: 'Kain Mori 3D Bergelombang + Canting Tembaga Hidup + Anglo & Wajan Malam Panas',
    joglo: '4 Saka Guru + Konstruksi Tumpang Sari 3D + Atap Brunjung (Exploded View)',
    wayang: 'Gunungan Kayon 3D Berlapis + Wayang Satria Berartikulasi Sendi & Busur 3D',
  };

  // Ringkasan nilai filosofis pendidikan budaya (Kawruh Budaya) untuk tiap ranah warisan
  const KAWRUH_FILOSOFI: Record<
    BendaPusaka['id'],
    { istilahJawa: string; aksaraJawa: string; intiPendidikan: string }
  > = {
    keris: {
      istilahJawa: 'Curiga Manjing Warangka',
      aksaraJawa: latinToAksara('curiga manjing warangka'),
      intiPendidikan:
        'Pertemuan bilah logam (wilah) dan sarung kayu (warangka) melambangkan keselarasan antara ketajaman ilmu pengetahuan dan kebijaksanaan etika yang menyelimutinya.',
    },
    saron: {
      istilahJawa: 'Tabuhan Laras Slendro & Pithatan',
      aksaraJawa: latinToAksara('laras sléndro'),
      intiPendidikan:
        'Dalam karawitan gamelan, tangan kanan menabuh nada baru sementara tangan kiri memencet (pithat) bilah sebelumnya; mengajarkan disiplin kolaborasi dan kepekaan mendengar sesama.',
    },
    batik: {
      istilahJawa: 'Mbatik saking Manah (Ketekunan Tulis Malam)',
      aksaraJawa: latinToAksara('batik tulis'),
      intiPendidikan:
        'Goresan cairan malam panas dari cucuk canting menuntut kesabaran terukur: bagian yang ditutup malam justru terjaga kemurnian warnanya saat kain dicelup ke pewarna.',
    },
    joglo: {
      istilahJawa: 'Saka Guru & Tumpang Sari Tahan Gempa',
      aksaraJawa: latinToAksara('saka guru joglo'),
      intiPendidikan:
        'Kearifan rekayasa arsitektur Jawa menghubungkan balok kayu jati dengan sistem takik (cathokan) di atas batu sendi umpak, sehingga bangunan lentur menyerap guncangan gempa bumi.',
    },
    wayang: {
      istilahJawa: 'Kayon (Pohon Kehidupan Kalpataru)',
      aksaraJawa: latinToAksara('gunungan kayon'),
      intiPendidikan:
        'Gunungan (Kayon) dan bayangan wayang mengingatkan bahwa panggung kehidupan bergerak di antara terang lampu blencong dan layar kelir, menuntut manusia memahami perannya.',
    },
  };

  const NAMA_BAB: Record<LayarId, string> = {
    pintu: 'Bab I · Eksibisi & Pengantar Budaya',
    rak: 'Bab II · Ensiklopedia 5 Ranah Budaya',
    pegang: 'Bab III · Laboratorium Anatomi 3D',
    panggung: 'Bab IV · Panggung Pakeliran Ramayana',
    sumber: 'Bab V · Sanggar Aksara & Pustaka Ilmiah',
  };

  function bolehAnimasiGSAP(): boolean {
    return (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

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

  function jalankanKoreografiGSAP(): void {
    const idxBab = Math.max(0, URUTAN_LAYAR.indexOf(layarAktif));
    const rasioProgres = (idxBab + 1) / URUTAN_LAYAR.length;

    if (barProgresEl) {
      if (bolehAnimasiGSAP()) {
        gsap.to(barProgresEl, {
          scaleX: rasioProgres,
          duration: 0.55,
          ease: 'power3.out',
        });
      } else {
        barProgresEl.style.transform = `scaleX(${rasioProgres})`;
      }
    }

    if (!wadahLayarEl || !bolehAnimasiGSAP()) return;

    tweenAksaraAir?.kill();
    tweenAksaraAir = null;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      wadahLayarEl,
      { opacity: 0.2, y: 14 },
      { opacity: 1, y: 0, duration: 0.38 },
      0,
    );

    const jalurUkir = wadahLayarEl.querySelectorAll('.gsap-jalur-ukir');
    if (jalurUkir.length > 0) {
      tl.fromTo(
        jalurUkir,
        { strokeDasharray: 240, strokeDashoffset: 240 },
        { strokeDashoffset: 0, duration: 0.75, stagger: 0.08, ease: 'power2.out' },
        0.05,
      );
    }

    const kartuList = wadahLayarEl.querySelectorAll('.anim-masuk');
    if (kartuList.length > 0) {
      tl.fromTo(
        kartuList,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.42, stagger: 0.06 },
        0.06,
      );
    }

    const aksaraAir = wadahLayarEl.querySelector('.aksara-latar-air');
    if (aksaraAir) {
      tweenAksaraAir = gsap.to(aksaraAir, {
        y: -10,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }

  function animasiTiraiGunungan(judulBab: string): void {
    labelBabTransisi = judulBab;
    if (!bolehAnimasiGSAP() || !tiraiKiriEl || !tiraiKananEl || !tiraiIkonEl) return;

    gsap.killTweensOf([tiraiKiriEl, tiraiKananEl, tiraiIkonEl]);
    const tl = gsap.timeline();
    tl.fromTo(
      tiraiKiriEl,
      { xPercent: -102, opacity: 0.95 },
      { xPercent: -35, opacity: 0.95, duration: 0.16, ease: 'power2.out' },
      0,
    )
      .fromTo(
        tiraiKananEl,
        { xPercent: 102, opacity: 0.95 },
        { xPercent: 35, opacity: 0.95, duration: 0.16, ease: 'power2.out' },
        0,
      )
      .fromTo(
        tiraiIkonEl,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(1.6)' },
        0.02,
      )
      .to(
        [tiraiKiriEl, tiraiKananEl],
        {
          xPercent: (i) => (i === 0 ? -105 : 105),
          opacity: 0,
          duration: 0.28,
          ease: 'power3.inOut',
        },
        0.18,
      )
      .to(
        tiraiIkonEl,
        { opacity: 0, scale: 0.88, duration: 0.2, ease: 'power2.in' },
        0.18,
      );
  }

  function toggleSuaraBudaya(): void {
    suaraBudayaAktif = audioBudaya.aturAktif(!suaraBudayaAktif);
    if (!suaraBudayaAktif) {
      gendingPendopoAktif = false;
    }
  }

  function toggleGendingPendopo(): void {
    gendingPendopoAktif = audioBudaya.toggleSuasanaPendopo();
    if (gendingPendopoAktif) {
      suaraBudayaAktif = true;
    }
  }

  async function pindahLayar(target: LayarId): Promise<void> {
    if (layarAktif === target) return;
    audioBudaya.bunyikanGongAgeng(0.14);
    animasiTiraiGunungan(NAMA_BAB[target]);
    layarAktif = target;
    await tick();

    jalankanKoreografiGSAP();
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
    aksi3DPintuAktif = false;
    audioBudaya.bunyikanCempalaKeprak('cempala');
    const b = DAFTAR_BENDA.find((x) => x.id === id) ?? DAFTAR_BENDA[0];
    stagePintu?.muatBenda(b);
  }

  function toggleAksi3DPintu(): void {
    if (!stagePintu) return;
    aksi3DPintuAktif = stagePintu.toggleAksiHidup();
  }

  function picuEfek3DPintu(): void {
    stagePintu?.picuEfekKhusus3D();
  }

  function toggleAksi3DPegang(): void {
    if (!stagePegang) return;
    aksi3DPegangAktif = stagePegang.toggleAksiHidup();
  }

  function picuEfek3DPegang(): void {
    stagePegang?.picuEfekKhusus3D();
  }

  async function pilihBenda(
    id: BendaPusaka['id'],
    langsungBuka = true,
    indeksTitik = 0,
  ): Promise<void> {
    bendaIdAktif = id;
    indeksTitikAktif = indeksTitik;
    aksi3DPegangAktif = false;
    statusTanya = 'kosong';
    hasilTanya = null;
    galatTanya = null;
    if (langsungBuka) {
      await pindahLayar('pegang');
    } else if (stagePegang) {
      audioBudaya.bunyikanCempalaKeprak('cempala');
      const b = DAFTAR_BENDA.find((x) => x.id === id) ?? DAFTAR_BENDA[0];
      stagePegang.muatBenda(b);
      const t = b.titikInfo[indeksTitik] ?? b.titikInfo[0];
      if (t) {
        stagePegang.fokusKeTitik(t.posisi3D, t.kameraTarget);
      }
      if (kartuTitikEl && bolehAnimasiGSAP()) {
        gsap.fromTo(
          kartuTitikEl,
          { opacity: 0.35, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        );
      }
    }
  }

  function pilihTitikInfo(idx: number): void {
    indeksTitikAktif = idx;
    audioBudaya.bunyikanCempalaKeprak('cempala');
    const t = bendaAktif.titikInfo[idx];
    if (t && stagePegang) {
      stagePegang.fokusKeTitik(t.posisi3D, t.kameraTarget);
    }
    if (kartuTitikEl && bolehAnimasiGSAP()) {
      gsap.fromTo(
        kartuTitikEl,
        { opacity: 0.35, x: 10 },
        { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' },
      );
    }
  }

  function pilihBabak(idx: number): void {
    indeksBabakAktif = idx;
    audioBudaya.bunyikanCempalaKeprak('keprak');
    const b = LAKON_KIJANG_KENCANA.babak[idx];
    if (b) {
      sliderRamaX = b.posisiAwalRama;
      sliderKidangX = b.posisiAwalKidang;
      stagePanggung?.aturPosisiTokoh(sliderRamaX, sliderKidangX);
    }
    if (kartuBabakEl && bolehAnimasiGSAP()) {
      gsap.fromTo(
        kartuBabakEl,
        { opacity: 0.35, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      );
    }
  }

  function pilihKartuCarakan(item: KartuCarakan, tombolEl?: HTMLElement): void {
    carakanTerpilih = item;
    inputUjiAksara = item.contohKata;
    audioBudaya.bunyikanCempalaKeprak('cempala');
    if (tombolEl && bolehAnimasiGSAP()) {
      gsap.fromTo(
        tombolEl,
        { scale: 0.92 },
        { scale: 1, duration: 0.28, ease: 'back.out(2)' },
      );
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
            stagePintu.terapkanInputTangan(frame.kananX, frame.kananY, frame.jarakCubit, frame);
          } else if (layarAktif === 'pegang' && stagePegang) {
            stagePegang.terapkanInputTangan(frame.kananX, frame.kananY, frame.jarakCubit, frame);
          } else if (layarAktif === 'panggung' && stagePanggung) {
            sliderRamaX = Number(frame.kananX.toFixed(2));
            sliderKidangX = Number(frame.kiriX.toFixed(2));
            stagePanggung.terapkanGesturPanggung(frame);
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
    jalankanKoreografiGSAP();
    void inisialisasiKanvasLayar();
  });

  onDestroy(() => {
    if (timerJam) {
      clearInterval(timerJam);
    }
    tweenAksaraAir?.kill();
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

<!-- Tirai Transisi GSAP Gunungan / Kayon saat berpindah Bab Pembelajaran -->
<div class="tirai-gsap-wadah" aria-hidden="true">
  <div class="tirai-panel-kiri" bind:this={tiraiKiriEl}></div>
  <div class="tirai-panel-kanan" bind:this={tiraiKananEl}></div>
  <div class="tirai-gunungan-ikon" bind:this={tiraiIkonEl}>
    <div lang="jv" class="teks-aksara" style="color: #e2b153; font-size: 1.15rem;">ꦏꦼꦭꦶꦂ</div>
    <div style="font-family: var(--font-display); font-weight: 700; font-size: 0.95rem;">
      {labelBabTransisi}
    </div>
  </div>
</div>

<!-- Pita Atribusi Ensiklopedia Pendidikan Budaya -->
<div class="strip-telemetri" role="region" aria-label="Informasi ensiklopedia budaya dan wilayah">
  <div class="strip-telemetri-dalam">
    <div class="item-telemetri">
      <span class="titik-hidup" aria-hidden="true"></span>
      <span>ENSIKLOPEDIA PENDIDIKAN BUDAYA JAWA &amp; NUSANTARA</span>
      <span>·</span>
      <span>{waktuWib}</span>
    </div>
    <div class="item-telemetri">
      <span>RUJUKAN ILMIAH: UNESCO (00063 · 00112 · 00170 · 01760) &amp; MUSEUM SONOBUDOYO</span>
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
      aria-label="Kelir, kembali ke Bab I Beranda Eksibisi"
    >
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 6 C46 22 52 38 42 56 L22 56 C12 38 18 22 32 6 Z"
          fill="#9E2E17"
          stroke="#E2B153"
          stroke-width="3"
        />
        <path d="M32 14 L32 52 M24 38 L40 38 M26 28 L38 28" stroke="#F5EDE0" stroke-width="2.5" />
      </svg>
      <span class="merek-teks-grup">
        <span class="merek-latin">Kelir</span>
        <span class="merek-sub">Ensiklopedia Budaya 3D</span>
      </span>
      <span class="merek-aksara" lang="jv">ꦏꦼꦭꦶꦂ</span>
    </button>

    <nav class="nav-utama" aria-label="Navigasi bab pembelajaran budaya">
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-pintu"
        aria-current={layarAktif === 'pintu' ? 'page' : undefined}
        onclick={() => pindahLayar('pintu')}
      >
        <span class="nomor-tab">Bab I</span> Beranda
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-rak"
        aria-current={layarAktif === 'rak' ? 'page' : undefined}
        onclick={() => pindahLayar('rak')}
      >
        <span class="nomor-tab">Bab II</span> Ensiklopedia Budaya
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-pegang"
        aria-current={layarAktif === 'pegang' ? 'page' : undefined}
        onclick={() => pindahLayar('pegang')}
      >
        <span class="nomor-tab">Bab III</span> Studio Anatomi 3D
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-panggung"
        aria-current={layarAktif === 'panggung' ? 'page' : undefined}
        onclick={() => pindahLayar('panggung')}
      >
        <span class="nomor-tab">Bab IV</span> Kisah Pakeliran
      </button>
      <button
        type="button"
        class="tombol-nav"
        data-testid="nav-sumber"
        aria-current={layarAktif === 'sumber' ? 'page' : undefined}
        onclick={() => pindahLayar('sumber')}
      >
        <span class="nomor-tab">Bab V</span> Aksara &amp; Pustaka
      </button>
    </nav>

    <div class="kontrol-kanan" role="group" aria-label="Bahasa dan suasana ruang baca">
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
        Krama
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
        Suasana: {temaAktif === 'malam' ? 'Galeri Keraton' : 'Naskah Lontar'}
      </button>
    </div>
  </div>

  <!-- Bilah progres belajar antarbab yang dianimasikan dengan GSAP -->
  <div class="bar-progres-baca" aria-hidden="true">
    <div class="bar-progres-isi" bind:this={barProgresEl}></div>
  </div>
</header>

<main id="konten-utama" class="wadah-utama" bind:this={wadahLayarEl}>
  <section class="pita-status" aria-label="Status kendali belajar, efek suara budaya, dan rujukan">
    <div class="label-status" data-testid="status-kendali">
      {#if statusKamera === 'aktif'}
        <span class="penanda-status">KAMERA TANGAN AKTIF</span>
        <span>
          Tangan: {infoTangan.jumlahTangan} · Gestur: {infoTangan.gesturAktif} ({DESKRIPSI_GESTUR[
            infoTangan.gesturAktif
          ]})
        </span>
      {:else if statusKamera === 'meminta-izin'}
        <span class="penanda-draf">MEMUAT KAMERA</span>
        <span>{pesanKamera}</span>
      {:else if statusKamera === 'ditolak' || statusKamera === 'galat'}
        <span class="penanda-draf" data-testid="badge-fallback-kamera">MODE MANUAL AKTIF</span>
        <span>{pesanKamera}</span>
      {:else}
        <span class="penanda-status">PANDUAN BELAJAR &amp; AUDIO BUDAYA</span>
        <span>
          {pesanKamera ??
            'Putar objek 3D, jalankan simulasi fisik 3D, ketuk bilah gamelan, dan dengarkan akustik budaya Jawa.'}
        </span>
      {/if}
    </div>

    <div class="panel-kamera-kecil">
      {#if bahasaAktif !== 'id'}
        <span class="penanda-draf" data-testid="status-tinjauan-jawa">
          Teks Jawa: Draf (Aksara dihitung berbasis aturan)
        </span>
      {:else}
        <span class="penanda-status">TERVERIFIKASI S1..S7</span>
      {/if}

      <button
        type="button"
        class={suaraBudayaAktif ? 'tombol tombol-utama' : 'tombol'}
        data-testid="toggle-suara-budaya"
        aria-pressed={suaraBudayaAktif}
        onclick={toggleSuaraBudaya}
      >
        Suara Budaya: {suaraBudayaAktif ? 'Aktif' : 'Senyap'}
      </button>

      <button
        type="button"
        class={gendingPendopoAktif ? 'tombol tombol-utama' : 'tombol'}
        data-testid="toggle-gending-pendopo"
        aria-pressed={gendingPendopoAktif}
        onclick={toggleGendingPendopo}
      >
        Gending Pendopo: {gendingPendopoAktif ? 'Hidup' : 'Mati'}
      </button>

      <button
        type="button"
        class="tombol"
        data-testid="tombol-gong-ageng"
        onclick={() => audioBudaya.bunyikanGongAgeng(0.32)}
      >
        Bunyikan Gong Ageng
      </button>

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
          Kemudi Gestur Tangan (Opsional)
        </button>
      {/if}
    </div>
  </section>

  {#if layarAktif === 'pintu'}
    {@const kawruhHero = KAWRUH_FILOSOFI[bendaHeroAktif.id]}
    <section class="panggung-pintu" aria-labelledby="judul-pintu" data-testid="layar-pintu">
      <div class="aksara-latar-air" lang="jv" aria-hidden="true">
        ꦏꦮruhꦧꦸꦢꦪꦗꦮꦶ
      </div>

      <div class="grid-pintu">
        <div class="anim-masuk">
          <div class="lencana-hero-baris">
            <span class="lencana-kapsul">BAB I · RUANG BELAJAR BUDAYA NUSANTARA</span>
            <span class="lencana-kapsul">YOGYAKARTA &amp; JAWA TENGAH</span>
          </div>

          <h1 id="judul-pintu">
            {#if bahasaAktif === 'aksara'}
              <span class="teks-aksara" lang="jv">
                {latinToAksara('kelir kawruh warisan budaya jawi')}
              </span>
            {:else if bahasaAktif === 'jv'}
              Kelir: Ngudi Kawruh <span class="sorot-garis-bawah">Warisan Budaya Jawi</span> saking Tosan Aji, Gamelan, Batik, Joglo, dumugi Ringgit
            {:else}
              Pelajari Filosofi dan Anatomi <span class="sorot-garis-bawah">Warisan Budaya Jawa</span> lewat Eksibisi 3D Hidup
            {/if}
          </h1>

          <!-- Ornamen Pembatas Ukir Jawa yang digambar oleh GSAP -->
          <div class="pembatas-ornamen" aria-hidden="true">
            <svg width="160" height="22" viewBox="0 0 160 22" fill="none">
              <path
                class="gsap-jalur-ukir"
                d="M2 11 C28 2, 42 20, 68 11 C92 2, 112 20, 158 11"
                stroke="#9E2E17"
                stroke-width="2.2"
                stroke-linecap="round"
              />
              <circle cx="68" cy="11" r="3.5" fill="#CFA048" />
            </svg>
            <div class="garis-ornamen"></div>
          </div>

          <p>
            <strong>Kelir</strong> dirancang sebagai ruang belajar budaya interaktif bagi pelajar
            dan mahasiswa. Alih-alih hanya membaca teks buku atau melihat foto datar di balik kaca
            museum, Anda dapat mengamati dan menggerakkan mekanisme tiga dimensi dari lima mahakarya
            peradaban Jawa: <strong>Tosan Aji (Keris Luk 5)</strong>,
            <strong>Karawitan (Saron Gamelan)</strong>, <strong>Wastra (Batik Tulis &amp; Canting)</strong>,
            <strong>Arsitektur Tahan Gempa (Pendopo Joglo)</strong>, serta
            <strong>Pakeliran (Wayang &amp; Gunungan)</strong>.
          </p>

          <!-- Jendela Pengetahuan Filosofis (Kawruh Budaya) yang berubah mengikuti objek 3D yang dipilih -->
          <div class="kotak-kawruh-budaya">
            <div class="judul-kawruh">
              <span>Kawruh Budaya · { kawruhHero.istilahJawa }</span>
              <span lang="jv" class="teks-aksara" style="font-size: 0.95rem;">
                {kawruhHero.aksaraJawa}
              </span>
            </div>
            <p style="margin: 0; font-size: 0.92rem;">
              {kawruhHero.intiPendidikan}
            </p>
          </div>

          <div class="baris-aksi-pintu">
            <button
              type="button"
              class="tombol tombol-utama"
              data-testid="cta-masuk-manual"
              onclick={masukTanpaKamera}
            >
              Mulai Jelajahi Ensiklopedia Budaya →
            </button>
            <button
              type="button"
              class="tombol"
              data-testid="cta-masuk-kamera"
              onclick={masukDenganKamera}
            >
              Mulai dengan Gestur Tangan
            </button>
            <button
              type="button"
              class="tombol"
              data-testid="cta-lihat-sumber-pintu"
              onclick={() => pindahLayar('sumber')}
            >
              Belajar 20 Aksara Jawa &amp; Pustaka
            </button>
          </div>
        </div>

        <!-- Vitrin Museum 3D Interaktif Langsung di Beranda -->
        <div
          class="kotak-siluet-pintu anim-masuk"
          aria-label="Vitrin museum 3D interaktif warisan budaya Jawa"
        >
          <div class="hud-atas-3d">
            <span>VITRIN MUSEUM 3D · SERET UNTUK MEMUTAR</span>
            <span>{bendaHeroAktif.kategori.toUpperCase()}</span>
          </div>

          <div
            class="kanvas-hero-pintu"
            bind:this={kanvasPintuEl}
            role="region"
            aria-label={`Vitrin 3D ${bendaHeroAktif.nama.id}`}
          ></div>

          {#if !webglPintuTersedia}
            <div style="padding: 1rem;">
              <p style="margin: 0; font-size: 0.88rem;">
                Vitrin 3D siap dijalankan. Pilih salah satu warisan budaya di bawah untuk mempelajari
                anatomi dan filosofinya.
              </p>
            </div>
          {/if}

          <div class="hud-bawah-3d" role="group" aria-label="Pilih warisan budaya pada vitrin 3D">
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'keris'}
                onclick={() => gantiBendaHero('keris')}
              >
                I. Keris
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'saron'}
                onclick={() => gantiBendaHero('saron')}
              >
                II. Saron
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'batik'}
                onclick={() => gantiBendaHero('batik')}
              >
                III. Batik
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'joglo'}
                onclick={() => gantiBendaHero('joglo')}
              >
                IV. Joglo
              </button>
              <button
                type="button"
                class="tombol-hud"
                aria-pressed={bendaHeroId === 'wayang'}
                onclick={() => gantiBendaHero('wayang')}
              >
                V. Wayang
              </button>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
              <button
                type="button"
                class="tombol-hud"
                data-testid="hero-aksi-3d"
                aria-pressed={aksi3DPintuAktif}
                onclick={toggleAksi3DPintu}
              >
                ✦ {bendaHeroAktif.labelAksi3D}
              </button>
              <button
                type="button"
                class="tombol-hud"
                data-testid="hero-efek-3d"
                onclick={picuEfek3DPintu}
              >
                ⚡ {LABEL_EFEK_KHUSUS_3D[bendaHeroAktif.id]}
              </button>
              <button
                type="button"
                class="tombol-hud"
                onclick={() => pilihBenda(bendaHeroId, true)}
              >
                Pelajari Anatomi →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Tahap Kurikulum Pembelajaran Budaya -->
      <div class="bento-pintu-grid">
        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">TAHAP I · ENSIKLOPEDIA WARISAN</span>
          <div class="angka-bento">5 Ranah Budaya</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Mempelajari keterkaitan antara metalurgi <em>Tosan Aji</em>, akustik <em>Karawitan</em>,
            kimia rintang warna <em>Batik Tulis</em>, struktur <em>Joglo</em>, dan <em>Wayang</em>.
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">TAHAP II · BEDAH ANATOMI 3D</span>
          <div class="angka-bento">20 Bagian Benda</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Mengamati fungsi tiap bagian secara langsung: mencabut keris dari warangka, menggerakkan
            canting, hingga membedah konstruksi <em>Tumpang Sari</em> Joglo.
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">TAHAP III · SENI PERTUNJUKAN</span>
          <div class="angka-bento">4 Babak Epos</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Memahami struktur dramatik <em>Pakeliran</em> lewat episode Ramayana
            <em>Kijang Kencana</em> dengan gerak sendi Sri Rama dan Kidang Kencana 3D.
          </p>
        </div>

        <div class="kartu-bento-pintu anim-masuk">
          <span class="mono-kecil">TAHAP IV · LITERASI AKSARA JAWA</span>
          <div class="angka-bento">20 Carakan Dasar</div>
          <p style="margin: 0; font-size: 0.9rem;">
            Berlatih membaca dan mengalihaksarakan <em>Dentawyanjana (Ha-Na-Ca-Ra-Ka)</em> beserta
            filosofi hidup Jawa dan daftar pustaka UNESCO.
          </p>
        </div>
      </div>
    </section>
  {:else if layarAktif === 'rak'}
    <section aria-labelledby="judul-rak" data-testid="layar-rak">
      <div class="header-bab-editorial anim-masuk">
        <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
          BAB II · KATALOG ENSIKLOPEDIA PENDIDIKAN BUDAYA JAWA &amp; NUSANTARA
        </p>
        <h1 id="judul-rak">Lima Ranah Warisan Budaya Jawa</h1>
        <div class="pembatas-ornamen" aria-hidden="true">
          <svg width="140" height="18" viewBox="0 0 140 18" fill="none">
            <path
              class="gsap-jalur-ukir"
              d="M2 9 C30 1, 50 17, 78 9 C102 2, 118 16, 138 9"
              stroke="#CFA048"
              stroke-width="2"
            />
          </svg>
          <div class="garis-ornamen"></div>
        </div>
        <p class="teks-redup" style="margin-bottom: 0;">
          Kebudayaan Jawa merupakan satu kesatuan ilmu pengetahuan tradisional (*kawruh*):
          metalurgi tempa lipat pada <strong>Keris</strong>, fisika akustik perunggu pada
          <strong>Saron Gamelan</strong>, kriya tekstil malam pada <strong>Batik Tulis</strong>,
          rekayasa kayu tahan gempa pada <strong>Pendopo Joglo</strong>, dan seni bertutur pada
          <strong>Wayang &amp; Gunungan</strong>. Klik salah satu bagian anatomi atau tombol studio
          untuk membedah model 3D-nya.
        </p>
      </div>

      <div class="tata-rak">
        {#each DAFTAR_BENDA as benda, i (benda.id)}
          {@const namaTerjemah = ambilTeks(benda.nama, bahasaAktif)}
          {@const subTerjemah = ambilTeks(benda.subjudul, bahasaAktif)}
          {@const ringkasTerjemah = ambilTeks(benda.ringkasan, bahasaAktif)}
          {@const filosofi = KAWRUH_FILOSOFI[benda.id]}
          <article
            class={i === 0
              ? 'panel-pusaka panel-pusaka-utama item-rak-utama anim-masuk'
              : 'panel-pusaka anim-masuk'}
            data-testid={`kartu-pusaka-${benda.id}`}
          >
            <div>
              <div class="meta-unesco">
                <span>BAB II.{i + 1} · {benda.kategori}</span>
                <span>UNESCO {benda.tahunUnesco} ({benda.berkasUnesco})</span>
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

              <!-- Kotak Filosofi & Nilai Pendidikan Budaya -->
              <div class="kotak-filosofi-ensiklopedia">
                <strong>Filosofi Pendidikan ({filosofi.istilahJawa}):</strong>
                {filosofi.intiPendidikan}
              </div>

              <p class="mono-kecil" style="margin-bottom: 0.35rem;">
                SIMULASI 3D: {SPEC_MATERIAL_PBR[benda.id]}
              </p>

              <div class="daftar-chip-anatomi" aria-label="Daftar istilah anatomi budaya">
                {#each benda.titikInfo as t, tIdx (t.id)}
                  <span class="chip-anatomi">
                    {tIdx + 1}. {t.label.id}
                  </span>
                {/each}
              </div>

              <p class="teks-redup" style="font-size: 0.88rem; margin-bottom: 0;">
                <strong>Konteks budaya:</strong> {benda.peranPanggung} · Rujukan ilmiah:
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
                Pelajari {benda.nama.id} di Studio 3D →
              </button>
              <button
                type="button"
                class="tombol"
                onclick={() => pindahLayar('panggung')}
              >
                Buka Kisah Pakeliran
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
    {@const filosofiAktif = KAWRUH_FILOSOFI[bendaAktif.id]}
    <section aria-labelledby="judul-pegang" data-testid="layar-pegang">
      <div class="header-bab-editorial anim-masuk">
        <div
          style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.75rem;"
        >
          <div>
            <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
              BAB III · LABORATORIUM ANATOMI 3D &amp; MEKANISME KRIYA NUSANTARA
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

          <div
            style="display: flex; flex-wrap: wrap; gap: 0.45rem;"
            role="group"
            aria-label="Pilih warisan budaya di Studio 3D"
          >
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
      </div>

      <div class="tata-pegang">
        <div class="bingkai-kanvas-3d anim-masuk">
          <div class="hud-atas-3d">
            <span>STUDI 3D: {SPEC_MATERIAL_PBR[bendaAktif.id]}</span>
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
                {bendaAktif.nama.id} tetap dapat dipelajari melalui lembar kerja di samping.
              </p>
            </div>
          {/if}

          {#if bendaAktif.id === 'saron'}
            <div class="panel-nada-saron" role="group" aria-label="Tabuh 7 bilah saron laras slendro">
              <span class="mono-kecil">
                PRAKTIK KARAWITAN · KETUK 7 WILAH LARAS SLENDRO:
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

          <div class="bilah-kendali-3d" role="group" aria-label="Kendali putar, perbesar, dan aksi mekanis model 3D">
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <button
                type="button"
                class={aksi3DPegangAktif ? 'tombol tombol-utama' : 'tombol'}
                data-testid="tombol-aksi-3d"
                aria-pressed={aksi3DPegangAktif}
                onclick={toggleAksi3DPegang}
              >
                ✦ {bendaAktif.labelAksi3D}
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="tombol-efek-3d"
                onclick={picuEfek3DPegang}
              >
                ⚡ {LABEL_EFEK_KHUSUS_3D[bendaAktif.id]}
              </button>
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
              Lanjut ke Kisah Pakeliran →
            </button>
          </div>

          <!-- Panel 6 Variasi Gestur Tangan & Simulasi Fisik 3D -->
          <div
            style="padding: 0.85rem 1.05rem; border-top: 1px solid var(--garis-batas); background: var(--bg-kartu);"
            data-testid="panel-panduan-gestur"
          >
            <div class="mono-kecil teks-redup" style="margin-bottom: 0.45rem;">
              6 VARIASI GESTUR TANGAN &amp; EFEK AKUSTIK BUDAYA (DAPAT DIKLIK ATAU PAKAI KAMERA):
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.45rem;">
              {#each DAFTAR_PANDUAN_GESTUR as g (g.kode)}
                <div
                  style="padding: 0.5rem 0.65rem; border: 1px solid var(--garis-batas); border-radius: var(--radius-kotak); background: var(--bg-permukaan); font-size: 0.82rem;"
                >
                  <div style="font-weight: 700; color: var(--teks-utama);">
                    {g.simbol} {g.judul}
                  </div>
                  <div class="teks-redup" style="font-size: 0.78rem; margin-top: 0.15rem;">
                    {g.uraian}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="panel-detail anim-masuk">
          <p>{ringkasBenda.utama}</p>
          <div class="kotak-filosofi-ensiklopedia">
            <strong>Nilai Filosofis ({filosofiAktif.istilahJawa}):</strong>
            {filosofiAktif.intiPendidikan}
          </div>

          {#if ringkasBenda.catatanStatus}
            <p class="penanda-draf" style="display: inline-block;">
              {ringkasBenda.catatanStatus}
            </p>
          {/if}

          <h2 style="font-size: 1.18rem; margin-top: 0.75rem;">
            Peta Anatomi Benda (Bagian {indeksTitikAktif + 1} dari {bendaAktif.titikInfo.length})
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
            class="kartu-anatomi-fokus"
            bind:this={kartuTitikEl}
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
              <strong>{bendaAktif.lisensiRef}, P1</strong>
            </p>
          </article>

          <div class="kotak-tanya">
            <h3 style="font-size: 1.1rem;">
              Tanya Jawab Guru Budaya ({bendaAktif.nama.id})
            </h3>
            <p class="teks-redup" style="font-size: 0.88rem; margin-bottom: 0.5rem;">
              Dijawab dari naskah kurasi bersumber (Gemini API / Meta Llama API / Pencocokan Lokal).
              Pertanyaan di luar konteks budaya akan ditolak secara jujur.
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
                  Pilih salah satu contoh pertanyaan di atas atau ketik pertanyaan Anda untuk menguji
                  pemahaman tentang {bendaAktif.nama.id}.
                </p>
              {:else if statusTanya === 'memuat'}
                <p style="margin: 0;">Memeriksa rujukan kurasi untuk menjawab pertanyaan Anda...</p>
              {:else if statusTanya === 'galat'}
                <p class="penanda-draf" style="margin: 0;" data-testid="pesan-galat-tanya">
                  {galatTanya}
                </p>
              {:else if hasilTanya}
                <div class="kartu-anatomi-fokus">
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
      <div class="header-bab-editorial anim-masuk">
        <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
          BAB IV · SASTRA LISAN &amp; PAKELIRAN WAYANG 3D
        </p>
        <h1 id="judul-panggung" class={bahasaAktif === 'aksara' ? 'teks-aksara' : ''}>
          {judulLakon.utama}
        </h1>
        <p class="teks-redup" style="margin-bottom: 0;">
          {LAKON_KIJANG_KENCANA.eposAsal} · Sumber rujukan: {LAKON_KIJANG_KENCANA.sumber.join(', ')}
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
            <span>KIRI: KIDANG KENCANA 3D BERARTIKULASI</span>
            <span>TENGAH: LAMPU BLENCONG &amp; GUNUNGAN 3D</span>
            <span>KANAN: SRI RAMA &amp; BUSUR GENDEWA 3D</span>
          </div>
          <div
            class="kanvas-viewport"
            bind:this={kanvasPanggungEl}
            data-testid="kanvas-3d-panggung"
            role="region"
            aria-label="Panggung layar kelir menampilkan Sri Rama 3D di kanan dan Kidang Kencana 3D di kiri"
          ></div>
          {#if !webglPanggungTersedia}
            <div style="padding: 1rem; background: var(--bg-permukaan);">
              <p>
                Tampilan WebGL tidak aktif pada perangkat ini. Anda tetap dapat membaca seluruh
                empat babak lakon <em>Kijang Kencana</em> di bawah ini.
              </p>
            </div>
          {/if}

          <div
            class="bilah-kendali-3d"
            role="group"
            aria-label="Aksi sabetan dalang, panah Sri Rama, dan ketukan cempala keprak"
          >
            <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
              <button
                type="button"
                class="tombol tombol-utama"
                data-testid="panggung-panah-rama"
                onclick={() => stagePanggung?.lepaskanPanahRama()}
              >
                🏹 Lesatkan Panah Guwawijaya 3D
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="panggung-sabetan-kayon"
                onclick={() => stagePanggung?.sabetanKayon()}
              >
                ✦ Sabetan Kayon &amp; Keprak Dalang
              </button>
              <button
                type="button"
                class="tombol"
                data-testid="panggung-cempala-dalang"
                onclick={() => audioBudaya.bunyikanCempalaKeprak('cempala')}
              >
                🔔 Dhodhogan Cempala Kotak
              </button>
            </div>
          </div>
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

        <article
          class="panel-detail anim-masuk"
          bind:this={kartuBabakEl}
          data-testid="narasi-babak-aktif"
        >
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

          <div class="kotak-filosofi-ensiklopedia">
            <strong>Panduan Olah Sabet Dalang:</strong> {babakAktif.petunjukDalang}
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
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
                : 'Lanjut ke Sanggar Aksara & Pustaka →'}
            </button>
          </div>
        </article>
      </div>
    </section>
  {:else if layarAktif === 'sumber'}
    <section aria-labelledby="judul-sumber" data-testid="layar-sumber">
      <div class="tata-sumber">
        <div class="header-bab-editorial anim-masuk">
          <p class="mono-kecil teks-redup" style="margin-bottom: 0.25rem;">
            BAB V · SANGGAR LITERASI AKSARA JAWA (CARAKAN) &amp; PUSTAKA ILMIAH
          </p>
          <h1 id="judul-sumber">Belajar Aksara Jawa, Sumber Pustaka, &amp; Lisensi</h1>
          <p class="teks-redup" style="margin-bottom: 0;">
            Pelajari 20 aksara dasar <em>Dentawyanjana (Ha-Na-Ca-Ra-Ka)</em> beserta filosofi hidup
            Jawa, uji alihaksara secara langsung, dan periksa daftar rujukan ilmiah yang menjadi
            fondasi ensiklopedia ini.
          </p>
        </div>

        <!-- Papan Belajar Interaktif 20 Aksara Dasar (Dentawyanjana) & 4 Filosofi Baris Carakan -->
        <div class="panel-detail anim-masuk">
          <h2>Papan Belajar 20 Aksara Jawa Dasar (Dentawyanjana / Carakan)</h2>
          <p class="teks-redup">
            Klik salah satu kartu aksara di bawah ini untuk melihat contoh kosakata budaya Jawa dan
            mengujinya langsung di mesin alihaksara:
          </p>

          <div class="grid-filosofi-carakan" aria-label="Empat baris filosofi Ha-Na-Ca-Ra-Ka">
            {#each FILOSOFI_BARIS_CARAKAN as baris (baris.nomor)}
              <div class="kartu-filosofi-baris">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">
                  <strong>Baris {baris.nomor}: {baris.bunyi}</strong>
                  <span lang="jv" class="teks-aksara" style="color: var(--aksen-emas);">
                    {baris.aksara}
                  </span>
                </div>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.86rem;" class="teks-redup">
                  {baris.makna}
                </p>
              </div>
            {/each}
          </div>

          <div class="grid-carakan-20" role="group" aria-label="20 kartu belajar aksara Carakan">
            {#each DAFTAR_20_CARAKAN as item (item.latin)}
              <button
                type="button"
                class="tombol-kartu-carakan"
                onclick={(e) => pilihKartuCarakan(item, e.currentTarget as HTMLElement)}
              >
                <span lang="jv" class="aksara-besar-kartu">{item.aksara}</span>
                <span class="latin-kartu-carakan">{item.latin}</span>
                <span class="arti-kartu-carakan">{item.contohKata} ({item.artiContoh})</span>
              </button>
            {/each}
          </div>

          <div class="kotak-filosofi-ensiklopedia">
            <strong>Aksara Terpilih:</strong>
            <span lang="jv" class="teks-aksara">{carakanTerpilih.aksara}</span>
            (<strong>{carakanTerpilih.latin}</strong>) · Contoh kosakata budaya:
            <strong>{carakanTerpilih.contohKata}</strong>
            (<span lang="jv" class="teks-aksara">{latinToAksara(carakanTerpilih.contohKata)}</span>)
            yang berarti <em>{carakanTerpilih.artiContoh}</em>.
          </div>
        </div>

        <!-- Alat Uji Transliterator Aksara Jawa Berbasis Aturan -->
        <div class="panel-detail anim-masuk">
          <h2>Laboratorium Alihaksara Latin ke Aksara Jawa (Berbasis Aturan)</h2>
          <p class="teks-redup">
            Mesin alihaksara ditulis dalam TypeScript murni (<code>src/lib/aksara.ts</code>)
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
          <h2>Daftar Sumber Rujukan Ilmiah Terverifikasi (S1..S7)</h2>
          <div class="bungkus-tabel">
            <table class="tabel-data" data-testid="tabel-sumber">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Judul &amp; Lembaga</th>
                  <th>Tahun</th>
                  <th>Ringkasan Fakta Pendidikan yang Dipakai</th>
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
          <h2>Register Lisensi Geometri 3D, Tekstur PBR, &amp; Tipografi</h2>
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
      <strong>Kelir</strong> (<span lang="jv" class="teks-aksara">ꦏꦼꦭꦶꦂ</span>) · Ensiklopedia
      Pendidikan Budaya Jawa &amp; Nusantara 3D · Kategori Software Development · Tema:
      <em>From Ideas to Innovation</em>.
    </div>
    <div>
      Sumber Ilmiah: UNESCO (00063, 00112, 00170, 01760), Museum Negeri Sonobudoyo Yogyakarta,
      Poly Haven CC0, Encyclopaedia Britannica.
    </div>
  </div>
</footer>
