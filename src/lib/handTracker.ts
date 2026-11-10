// Pelacakan tangan 21 titik lokal di browser memakai @mediapipe/tasks-vision (WASM & model lokal).
// Dilengkapi kinematika Olah Sabet Dalang (Cempurit, Tuding Depan, Tuding Belakang, & Kedalaman Kelir):
// - Pangkal pergelangan & kemiringan tangan (roll) -> mengemudikan tangkai utama Cempurit (condhong/temungkul/ndhangak)
// - Jari telunjuk & jempol -> menggerakkan tangkai Tuding Depan (bahu & siku lengan depan wayang secara kontinu)
// - Jari tengah & manis -> menggerakkan tangkai Tuding Belakang (bahu & siku lengan belakang / tarikan busur)
// - Skala telapak terhadap kamera -> mengatur jarak wayang ke kain Kelir (fokus bayangan lampu Blencong)
// - Dua tangan aktif bersamaan -> Tangan Kanan mengemudikan Sri Rama & Tangan Kiri mengemudikan Kidang Kencana

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export type StatusKamera = 'nonaktif' | 'meminta-izin' | 'aktif' | 'ditolak' | 'galat';

export type JenisGesturTangan =
  | 'diam'
  | 'telapak-putar'
  | 'cubit-zoom'
  | 'kepal-aksi'
  | 'tunjuk-ketuk'
  | 'dua-jari-sabetan'
  | 'dua-tangan-dalang';

export interface TitikLandmark2D {
  x: number;
  y: number;
}

export interface FrameTangan {
  terdeteksi: boolean;
  jumlahTangan: number;
  kananX: number;
  kananY: number;
  kiriX: number;
  kiriY: number;
  jarakCubit: number;
  kemiringanPergelangan: number;
  kemiringanPergelanganKiri: number;
  angkatTudingDepan: number;
  tekukSikuDepan: number;
  angkatTudingBelakang: number;
  tekukSikuBelakang: number;
  kedalamanKelir: number;
  kecepatanGerak: number;
  jumlahJariTerbuka: number;
  gesturAktif: JenisGesturTangan;
  landmarksKanan?: TitikLandmark2D[];
  landmarksKiri?: TitikLandmark2D[];
}

export const DESKRIPSI_GESTUR: Record<JenisGesturTangan, string> = {
  diam: 'Menunggu gerakan tangan Dalang',
  'telapak-putar': 'Telapak Terbuka · Kemudi Cempurit & Sorot Blencong',
  'cubit-zoom': 'Cubit Tuding · Tarik Busur & Fokus Detail Permukaan',
  'kepal-aksi': 'Genggam Cempurit · Picu Aksi Mekanis & Lesatan Panah',
  'tunjuk-ketuk': 'Ayun Tuding Telunjuk · Gerakkan Lengan Depan / Tabuh Saron',
  'dua-jari-sabetan': 'Sabetan Dua Tuding · Artikulasi Lengan Ganda & Kayon',
  'dua-tangan-dalang': 'Kemudi Dua Tangan Dalang · Sri Rama (Kanan) & Kidang (Kiri)',
};

export function lerp(sekarang: number, target: number, faktor: number): number {
  return sekarang + (target - sekarang) * Math.max(0, Math.min(1, faktor));
}

function clamp(nilai: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, nilai));
}

export class PengelolaTangan {
  private landmarker: HandLandmarker | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private onUpdate: (frame: FrameTangan) => void;
  private onStatus: (status: StatusKamera, pesan: string | null) => void;

  private stateHalus: FrameTangan = {
    terdeteksi: false,
    jumlahTangan: 0,
    kananX: 0.35,
    kananY: 0,
    kiriX: -0.35,
    kiriY: 0,
    jarakCubit: 1,
    kemiringanPergelangan: 0,
    kemiringanPergelanganKiri: 0,
    angkatTudingDepan: 0.15,
    tekukSikuDepan: 0.2,
    angkatTudingBelakang: -0.1,
    tekukSikuBelakang: 0.25,
    kedalamanKelir: 0,
    kecepatanGerak: 0,
    jumlahJariTerbuka: 0,
    gesturAktif: 'diam',
  };

  constructor(
    onUpdate: (frame: FrameTangan) => void,
    onStatus: (status: StatusKamera, pesan: string | null) => void,
  ) {
    this.onUpdate = onUpdate;
    this.onStatus = onStatus;
  }

  async mulai(videoElement: HTMLVideoElement): Promise<boolean> {
    this.videoEl = videoElement;
    this.onStatus(
      'meminta-izin',
      'Meminta izin akses webcam dan memuat model 21 titik tangan Dalang lokal...',
    );

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.onStatus(
        'ditolak',
        'Perangkat atau browser ini tidak menyediakan webcam. Mode kemudi Tuding & Cempurit langsung di layar diaktifkan.',
      );
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
    } catch {
      this.onStatus(
        'ditolak',
        'Izin kamera ditolak atau webcam tidak ditemukan. Anda tetap dapat menggerakkan Cempurit & Tuding langsung dengan mouse/sentuhan.',
      );
      return false;
    }

    try {
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();

      if (!this.landmarker) {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/mediapipe/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.52,
          minHandPresenceConfidence: 0.52,
          minTrackingConfidence: 0.52,
        });
      }

      this.onStatus(
        'aktif',
        'Kemudi 21 titik tangan Dalang aktif secara lokal (Cempurit + 2 Tuding lengan wayang).',
      );
      this.loopDeteksi();
      return true;
    } catch {
      this.matikan();
      this.onStatus(
        'galat',
        'Model pelacakan tangan gagal dimuat pada perangkat ini. Kemudi Tuding & Cempurit manual tetap siap digunakan.',
      );
      return false;
    }
  }

  private loopDeteksi = (): void => {
    if (!this.videoEl || !this.landmarker) return;

    if (this.videoEl.readyState >= 2) {
      const hasil = this.landmarker.detectForVideo(this.videoEl, performance.now());
      const semuaTangan = hasil.landmarks ?? [];

      if (semuaTangan.length === 0) {
        this.stateHalus = {
          ...this.stateHalus,
          terdeteksi: false,
          jumlahTangan: 0,
          kecepatanGerak: 0,
          jumlahJariTerbuka: 0,
          gesturAktif: 'diam',
          landmarksKanan: undefined,
          landmarksKiri: undefined,
        };
      } else {
        // Urutkan tangan berdasarkan posisi X di layar cermin agar tangan kanan & kiri konsisten
        const terurut = [...semuaTangan].sort((a, b) => a[0].x - b[0].x);
        const tUtama = terurut[0];
        const pergelangan = tUtama[0];
        const jempolUjung = tUtama[4];
        const telunjukPangkal = tUtama[5];
        const telunjukPip = tUtama[6];
        const telunjukUjung = tUtama[8];
        const tengahPangkal = tUtama[9];
        const tengahPip = tUtama[10];
        const tengahUjung = tUtama[12];
        const manisPip = tUtama[14];
        const manisUjung = tUtama[16];
        const kelingkingPangkal = tUtama[17];
        const kelingkingPip = tUtama[18];
        const kelingkingUjung = tUtama[20];

        // Posisi Cempurit mengikuti titik tengah telapak (antara pergelangan & pangkal jari tengah)
        const pusatTanganX = pergelangan.x * 0.45 + tengahPangkal.x * 0.55;
        const pusatTanganY = pergelangan.y * 0.45 + tengahPangkal.y * 0.55;
        const targetKananX = clamp((0.5 - pusatTanganX) * 2.35, -1.25, 1.25);
        const targetKananY = clamp((0.5 - pusatTanganY) * 2.15, -1.0, 1.0);

        const jarak = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
          Math.hypot(a.x - b.x, a.y - b.y);

        const ukuranTelapak = Math.max(0.06, jarak(pergelangan, tengahPangkal));
        const jarakCubitRaw = jarak(jempolUjung, telunjukUjung);
        const rasioCubit = jarakCubitRaw / ukuranTelapak;

        const telunjukBuka =
          jarak(telunjukUjung, pergelangan) > jarak(telunjukPip, pergelangan) * 1.11;
        const tengahBuka =
          jarak(tengahUjung, pergelangan) > jarak(tengahPip, pergelangan) * 1.11;
        const manisBuka = jarak(manisUjung, pergelangan) > jarak(manisPip, pergelangan) * 1.09;
        const kelingkingBuka =
          jarak(kelingkingUjung, pergelangan) > jarak(kelingkingPip, pergelangan) * 1.09;

        const jumlahJari =
          (telunjukBuka ? 1 : 0) +
          (tengahBuka ? 1 : 0) +
          (manisBuka ? 1 : 0) +
          (kelingkingBuka ? 1 : 0);

        // Kemiringan Cempurit (wrist roll) seperti Dalang memiringkan wayang (condhong / mayuk)
        const sudutRoll = Math.atan2(
          kelingkingPangkal.y - telunjukPangkal.y,
          kelingkingPangkal.x - telunjukPangkal.x,
        );

        // Kinematika Tuding Depan: dihitung dari ketinggian & sudut jari telunjuk + jempol
        const vektorTelunjukY = (telunjukPangkal.y - telunjukUjung.y) / ukuranTelapak;
        const vektorTelunjukX = (telunjukPangkal.x - telunjukUjung.x) / ukuranTelapak;
        const targetAngkatDepan = clamp(vektorTelunjukY * 0.95 - 0.25, -1.1, 1.25);
        const targetTekukDepan = clamp(
          (1.2 - rasioCubit * 0.85) + vektorTelunjukX * 0.45,
          -0.6,
          1.45,
        );

        // Kinematika Tuding Belakang: dihitung dari jari tengah & jari manis (menarik tali busur / tangan belakang)
        const vektorTengahY = (tengahPangkal.y - tengahUjung.y) / ukuranTelapak;
        const ekstensiManis = jarak(manisUjung, pergelangan) / ukuranTelapak;
        const targetAngkatBelakang = clamp(vektorTengahY * 0.85 - 0.3, -1.0, 1.15);
        const targetTekukBelakang = clamp((1.65 - ekstensiManis) * 0.9, -0.5, 1.45);

        // Kedalaman wayang terhadap layar Kelir (semakin dekat tangan ke kamera, semakin dekat ke lampu Blencong)
        const targetKedalaman = clamp((ukuranTelapak - 0.16) * 3.2, -0.45, 0.55);

        let targetKiriX = this.stateHalus.kiriX;
        let targetKiriY = this.stateHalus.kiriY;
        let targetRollKiri = this.stateHalus.kemiringanPergelanganKiri;
        let lmKiri: TitikLandmark2D[] | undefined = undefined;

        if (terurut.length > 1) {
          const tKedua = terurut[1];
          const pusatKiriX = tKedua[0].x * 0.45 + tKedua[9].x * 0.55;
          const pusatKiriY = tKedua[0].y * 0.45 + tKedua[9].y * 0.55;
          targetKiriX = clamp((0.5 - pusatKiriX) * 2.35, -1.25, 1.25);
          targetKiriY = clamp((0.5 - pusatKiriY) * 2.15, -1.0, 1.0);
          targetRollKiri = Math.atan2(
            tKedua[17].y - tKedua[5].y,
            tKedua[17].x - tKedua[5].x,
          );
          lmKiri = tKedua.map((p) => ({ x: 1 - p.x, y: p.y }));
        }

        const kecX = Math.abs(targetKananX - this.stateHalus.kananX);
        const kecY = Math.abs(targetKananY - this.stateHalus.kananY);
        const kecepatan = Math.min(1, Math.hypot(kecX, kecY) * 3.8);

        let gestur: JenisGesturTangan = 'telapak-putar';
        if (terurut.length >= 2) {
          gestur = 'dua-tangan-dalang';
        } else if (rasioCubit < 0.34) {
          gestur = 'cubit-zoom';
        } else if (jumlahJari === 0) {
          gestur = 'kepal-aksi';
        } else if (jumlahJari === 1 && telunjukBuka) {
          gestur = 'tunjuk-ketuk';
        } else if (jumlahJari === 2 && telunjukBuka && tengahBuka) {
          gestur = 'dua-jari-sabetan';
        } else {
          gestur = 'telapak-putar';
        }

        this.stateHalus = {
          terdeteksi: true,
          jumlahTangan: terurut.length,
          kananX: lerp(this.stateHalus.kananX, targetKananX, 0.3),
          kananY: lerp(this.stateHalus.kananY, targetKananY, 0.3),
          kiriX: lerp(this.stateHalus.kiriX, targetKiriX, 0.3),
          kiriY: lerp(this.stateHalus.kiriY, targetKiriY, 0.3),
          jarakCubit: lerp(
            this.stateHalus.jarakCubit,
            clamp(rasioCubit * 1.15, 0.55, 1.65),
            0.25,
          ),
          kemiringanPergelangan: lerp(
            this.stateHalus.kemiringanPergelangan,
            clamp(sudutRoll * 0.52, -0.75, 0.75),
            0.24,
          ),
          kemiringanPergelanganKiri: lerp(
            this.stateHalus.kemiringanPergelanganKiri,
            clamp(targetRollKiri * 0.52, -0.75, 0.75),
            0.24,
          ),
          angkatTudingDepan: lerp(this.stateHalus.angkatTudingDepan, targetAngkatDepan, 0.28),
          tekukSikuDepan: lerp(this.stateHalus.tekukSikuDepan, targetTekukDepan, 0.28),
          angkatTudingBelakang: lerp(
            this.stateHalus.angkatTudingBelakang,
            targetAngkatBelakang,
            0.28,
          ),
          tekukSikuBelakang: lerp(this.stateHalus.tekukSikuBelakang, targetTekukBelakang, 0.28),
          kedalamanKelir: lerp(this.stateHalus.kedalamanKelir, targetKedalaman, 0.22),
          kecepatanGerak: lerp(this.stateHalus.kecepatanGerak, kecepatan, 0.32),
          jumlahJariTerbuka: jumlahJari,
          gesturAktif: gestur,
          landmarksKanan: tUtama.map((p) => ({ x: 1 - p.x, y: p.y })),
          landmarksKiri: lmKiri,
        };
      }

      this.onUpdate(this.stateHalus);
    }

    this.rafId = requestAnimationFrame(this.loopDeteksi);
  };

  matikan(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    this.onStatus('nonaktif', null);
  }
}
