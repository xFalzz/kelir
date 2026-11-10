// Pelacakan tangan lokal di browser memakai @mediapipe/tasks-vision dengan berkas WASM & model lokal.
// Video webcam diproses di memori perangkat dan tidak pernah dikirim ke server.

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export type StatusKamera = 'nonaktif' | 'meminta-izin' | 'aktif' | 'ditolak' | 'galat';

export interface FrameTangan {
  terdeteksi: boolean;
  jumlahTangan: number;
  // Koordinat terhalus dalam rentang [-1, 1] untuk menggerakkan objek/wayang
  kananX: number;
  kananY: number;
  kiriX: number;
  kiriY: number;
  jarakCubit: number;
  gesturAktif: 'diam' | 'putar' | 'zoom' | 'tunjuk' | 'buka-kelir';
}

export function lerp(sekarang: number, target: number, faktor: number): number {
  return sekarang + (target - sekarang) * Math.max(0, Math.min(1, faktor));
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
    this.onStatus('meminta-izin', 'Meminta izin akses webcam dan memuat model tangan lokal...');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.onStatus(
        'ditolak',
        'Perangkat atau browser ini tidak menyediakan webcam. Mode kendali manual (mouse, sentuh, keyboard) diaktifkan otomatis.',
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
        'Izin kamera ditolak atau webcam tidak ditemukan. Anda tetap dapat menggunakan seluruh fitur dengan mouse, layar sentuh, atau tombol keyboard.',
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
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
      }

      this.onStatus('aktif', 'Pelacakan tangan aktif di perangkat Anda (video tidak diunggah).');
      this.loopDeteksi();
      return true;
    } catch {
      this.matikan();
      this.onStatus(
        'galat',
        'Model pelacakan tangan gagal dimuat pada perangkat ini. Kendali manual tetap siap digunakan.',
      );
      return false;
    }
  }

  private loopDeteksi = (): void => {
    if (!this.videoEl || !this.landmarker) return;

    if (this.videoEl.readyState >= 2) {
      const hasil = this.landmarker.detectForVideo(this.videoEl, performance.now());
      const landmarks = hasil.landmarks ?? [];

      if (landmarks.length === 0) {
        this.stateHalus = {
          ...this.stateHalus,
          terdeteksi: false,
          jumlahTangan: 0,
          gesturAktif: 'diam',
        };
      } else {
        const tanganPertama = landmarks[0];
        const pergelangan = tanganPertama[0];
        const jempol = tanganPertama[4];
        const telunjuk = tanganPertama[8];
        const tengah = tanganPertama[12];
        const kelingking = tanganPertama[20];

        // Cerminkan sumbu X agar gerakan tangan terasa alami seperti becermin di depan kelir
        const targetKananX = (0.5 - telunjuk.x) * 2;
        const targetKananY = (0.5 - telunjuk.y) * 2;

        const dxCubit = jempol.x - telunjuk.x;
        const dyCubit = jempol.y - telunjuk.y;
        const jarakCubitRaw = Math.hypot(dxCubit, dyCubit);

        let targetKiriX = this.stateHalus.kiriX;
        let targetKiriY = this.stateHalus.kiriY;
        if (landmarks.length > 1) {
          const telunjuk2 = landmarks[1][8];
          targetKiriX = (0.5 - telunjuk2.x) * 2;
          targetKiriY = (0.5 - telunjuk2.y) * 2;
        }

        // Tentukan gestur dari konfigurasi jari
        const bentangTelapak = Math.hypot(jempol.x - kelingking.x, jempol.y - kelingking.y);
        const tinggiTengah = Math.hypot(tengah.x - pergelangan.x, tengah.y - pergelangan.y);
        let gestur: FrameTangan['gesturAktif'] = 'putar';
        if (jarakCubitRaw < 0.055) {
          gestur = 'tunjuk';
        } else if (bentangTelapak > 0.28 && tinggiTengah > 0.32) {
          gestur = 'buka-kelir';
        } else if (landmarks.length === 2) {
          gestur = 'zoom';
        }

        this.stateHalus = {
          terdeteksi: true,
          jumlahTangan: landmarks.length,
          kananX: lerp(this.stateHalus.kananX, targetKananX, 0.25),
          kananY: lerp(this.stateHalus.kananY, targetKananY, 0.25),
          kiriX: lerp(this.stateHalus.kiriX, targetKiriX, 0.25),
          kiriY: lerp(this.stateHalus.kiriY, targetKiriY, 0.25),
          jarakCubit: lerp(this.stateHalus.jarakCubit, Math.min(1.6, Math.max(0.65, jarakCubitRaw * 4.2)), 0.2),
          gesturAktif: gestur,
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
