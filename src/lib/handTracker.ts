// Pelacakan tangan 21 titik lokal di browser memakai @mediapipe/tasks-vision (WASM & model lokal).
// Mendeteksi 6 variasi gestur budaya & pedalangan:
// - 'telapak-putar': Telapak terbuka (mengorbit objek & menggerakkan sorot lampu blencong)
// - 'cubit-zoom': Cubit jempol-telunjuk (memperbesar detail tekstur pamor/batik/ukir)
// - 'kepal-aksi': Kepalan tangan / Genggam (memicu aksi mekanis 3D: cabut keris / bedah joglo / tarik busur)
// - 'tunjuk-ketuk': Satu jari telunjuk (menabuh bilah saron / menuntun canting batik / memilih anatomi)
// - 'dua-jari-sabetan': Dua jari terentang (memicu efek khusus: uji gempa Joglo / pijar pamor / lesatan panah)
// - 'dua-tangan-dalang': Dua tangan aktif bersamaan (menggerakkan Sri Rama & Kidang Kencana sekaligus)

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

export interface FrameTangan {
  terdeteksi: boolean;
  jumlahTangan: number;
  kananX: number;
  kananY: number;
  kiriX: number;
  kiriY: number;
  jarakCubit: number;
  kemiringanPergelangan: number;
  kecepatanGerak: number;
  jumlahJariTerbuka: number;
  gesturAktif: JenisGesturTangan;
}

export const DESKRIPSI_GESTUR: Record<JenisGesturTangan, string> = {
  diam: 'Menunggu gerakan tangan',
  'telapak-putar': 'Telapak Terbuka · Putar 3D & Arahkan Blencong',
  'cubit-zoom': 'Cubit Jari · Perbesar Detail Permukaan',
  'kepal-aksi': 'Kepal Tangan · Picu Mekanisme Utama 3D',
  'tunjuk-ketuk': 'Telunjuk · Tabuh Saron / Tuntun Canting',
  'dua-jari-sabetan': 'Dua Jari · Picu Efek Fisik & Simulasi 3D',
  'dua-tangan-dalang': 'Dua Tangan Dalang · Kemudi Ganda Pakeliran',
};

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
    kemiringanPergelangan: 0,
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
    this.onStatus('meminta-izin', 'Meminta izin akses webcam dan memuat model 21 titik tangan lokal...');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.onStatus(
        'ditolak',
        'Perangkat atau browser ini tidak menyediakan webcam. Mode kendali manual & tombol simulasi gestur diaktifkan otomatis.',
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
        'Izin kamera ditolak atau webcam tidak ditemukan. Anda tetap dapat menggunakan seluruh fitur dengan mouse, layar sentuh, atau tombol aksi di layar.',
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

      this.onStatus('aktif', 'Pelacakan 6 gestur tangan aktif secara lokal (video tidak pernah diunggah).');
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
          kecepatanGerak: 0,
          jumlahJariTerbuka: 0,
          gesturAktif: 'diam',
        };
      } else {
        const t1 = landmarks[0];
        const pergelangan = t1[0];
        const jempolUjung = t1[4];
        const telunjukPangkal = t1[5];
        const telunjukPip = t1[6];
        const telunjukUjung = t1[8];
        const tengahPip = t1[10];
        const tengahUjung = t1[12];
        const manisPip = t1[14];
        const manisUjung = t1[16];
        const kelingkingPangkal = t1[17];
        const kelingkingPip = t1[18];
        const kelingkingUjung = t1[20];

        const targetKananX = (0.5 - telunjukUjung.x) * 2;
        const targetKananY = (0.5 - telunjukUjung.y) * 2;

        const dxCubit = jempolUjung.x - telunjukUjung.x;
        const dyCubit = jempolUjung.y - telunjukUjung.y;
        const jarakCubitRaw = Math.hypot(dxCubit, dyCubit);

        // Hitung jari yang terbuka (ujung jari lebih jauh dari pergelangan dibanding sendi PIP)
        const jarak = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
          Math.hypot(a.x - b.x, a.y - b.y);

        const telunjukBuka = jarak(telunjukUjung, pergelangan) > jarak(telunjukPip, pergelangan) * 1.12;
        const tengahBuka = jarak(tengahUjung, pergelangan) > jarak(tengahPip, pergelangan) * 1.12;
        const manisBuka = jarak(manisUjung, pergelangan) > jarak(manisPip, pergelangan) * 1.1;
        const kelingkingBuka =
          jarak(kelingkingUjung, pergelangan) > jarak(kelingkingPip, pergelangan) * 1.1;

        const jumlahJari =
          (telunjukBuka ? 1 : 0) +
          (tengahBuka ? 1 : 0) +
          (manisBuka ? 1 : 0) +
          (kelingkingBuka ? 1 : 0);

        // Kemiringan pergelangan tangan (roll) untuk memiringkan bilah keris / canting / wayang
        const sudutRoll = Math.atan2(
          kelingkingPangkal.y - telunjukPangkal.y,
          kelingkingPangkal.x - telunjukPangkal.x,
        );

        let targetKiriX = this.stateHalus.kiriX;
        let targetKiriY = this.stateHalus.kiriY;
        if (landmarks.length > 1) {
          const telunjuk2 = landmarks[1][8];
          targetKiriX = (0.5 - telunjuk2.x) * 2;
          targetKiriY = (0.5 - telunjuk2.y) * 2;
        }

        const kecX = Math.abs(targetKananX - this.stateHalus.kananX);
        const kecY = Math.abs(targetKananY - this.stateHalus.kananY);
        const kecepatan = Math.min(1, Math.hypot(kecX, kecY) * 3.5);

        let gestur: JenisGesturTangan = 'telapak-putar';
        if (landmarks.length >= 2) {
          gestur = 'dua-tangan-dalang';
        } else if (jarakCubitRaw < 0.052) {
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
          jumlahTangan: landmarks.length,
          kananX: lerp(this.stateHalus.kananX, targetKananX, 0.26),
          kananY: lerp(this.stateHalus.kananY, targetKananY, 0.26),
          kiriX: lerp(this.stateHalus.kiriX, targetKiriX, 0.26),
          kiriY: lerp(this.stateHalus.kiriY, targetKiriY, 0.26),
          jarakCubit: lerp(
            this.stateHalus.jarakCubit,
            Math.min(1.6, Math.max(0.65, jarakCubitRaw * 4.2)),
            0.22,
          ),
          kemiringanPergelangan: lerp(this.stateHalus.kemiringanPergelangan, sudutRoll * 0.45, 0.2),
          kecepatanGerak: lerp(this.stateHalus.kecepatanGerak, kecepatan, 0.3),
          jumlahJariTerbuka: jumlahJari,
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
