import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

export type JenisGestur = 'terbuka' | 'cubit' | 'tunjuk' | 'kepal' | 'dua-jari' | 'tiga-jari';

export type StatusKamera = 'nonaktif' | 'memuat' | 'aktif' | 'ditolak' | 'tidak-didukung';

export interface TanganTerdeteksi {
  pusatX: number;
  pusatY: number;
  telunjukX: number;
  telunjukY: number;
  jarakCubit: number;
  kemiringan: number;
  gestur: JenisGestur;
  jumlahJariTerangkat: number;
}

export interface FrameTangan {
  jumlahTangan: number;
  tanganUtama: TanganTerdeteksi | null;
  tanganKiri: TanganTerdeteksi | null;
  tanganKanan: TanganTerdeteksi | null;
  waktuMs: number;
}

function jarak2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function klasifikasiTangan(lm: NormalizedLandmark[]): TanganTerdeteksi {
  const pergelangan = lm[0];
  const ujungJempol = lm[4];
  const ujungTelunjuk = lm[8];
  const sendiTelunjuk = lm[6];
  const ujungTengah = lm[12];
  const sendiTengah = lm[10];
  const ujungManis = lm[16];
  const sendiManis = lm[14];
  const ujungKelingking = lm[20];
  const sendiKelingking = lm[18];

  const telunjukTerangkat = ujungTelunjuk.y < sendiTelunjuk.y - 0.025;
  const tengahTerangkat = ujungTengah.y < sendiTengah.y - 0.025;
  const manisTerangkat = ujungManis.y < sendiManis.y - 0.025;
  const kelingkingTerangkat = ujungKelingking.y < sendiKelingking.y - 0.025;

  const jumlahJari =
    Number(telunjukTerangkat) +
    Number(tengahTerangkat) +
    Number(manisTerangkat) +
    Number(kelingkingTerangkat);

  const jarakCubit = jarak2D(ujungJempol, ujungTelunjuk);

  let gestur: JenisGestur = 'terbuka';
  if (jarakCubit < 0.048) {
    gestur = 'cubit';
  } else if (jumlahJari === 0) {
    gestur = 'kepal';
  } else if (telunjukTerangkat && !tengahTerangkat && !manisTerangkat) {
    gestur = 'tunjuk';
  } else if (telunjukTerangkat && tengahTerangkat && !manisTerangkat) {
    gestur = 'dua-jari';
  } else if (telunjukTerangkat && tengahTerangkat && manisTerangkat && !kelingkingTerangkat) {
    gestur = 'tiga-jari';
  }

  const pusatX = 1 - (pergelangan.x + lm[9].x) * 0.5;
  const pusatY = (pergelangan.y + lm[9].y) * 0.5;
  // Delta X dicerminkan agar sudut kemiringan 1:1 searah pratinjau cermin dan objek 3D
  const kemiringan = Math.atan2(lm[9].y - pergelangan.y, pergelangan.x - lm[9].x);

  return {
    pusatX,
    pusatY,
    telunjukX: 1 - ujungTelunjuk.x,
    telunjukY: ujungTelunjuk.y,
    jarakCubit,
    kemiringan,
    gestur,
    jumlahJariTerangkat: jumlahJari,
  };
}

export class PengelolaTangan {
  private handLandmarker: HandLandmarker | null = null;
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private rafId: number | null = null;
  private berjalan = false;
  private onFrameCb: ((frame: FrameTangan) => void) | null = null;
  private onStatusCb: ((status: StatusKamera) => void) | null = null;

  public async mulai(
    videoElement: HTMLVideoElement,
    onFrame: (frame: FrameTangan) => void,
    onStatus: (status: StatusKamera) => void,
  ): Promise<void> {
    this.videoEl = videoElement;
    this.onFrameCb = onFrame;
    this.onStatusCb = onStatus;

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      onStatus('tidak-didukung');
      return;
    }

    onStatus('memuat');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch {
      onStatus('ditolak');
      return;
    }

    videoElement.srcObject = this.stream;
    await videoElement.play().catch(() => undefined);

    try {
      if (!this.handLandmarker) {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/mediapipe/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.45,
          minHandPresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
      }
    } catch {
      this.matikan();
      onStatus('tidak-didukung');
      return;
    }

    this.berjalan = true;
    onStatus('aktif');
    this.loop();
  }

  private loop = (): void => {
    if (!this.berjalan || !this.videoEl || !this.handLandmarker) return;

    const waktu = performance.now();
    if (this.videoEl.readyState >= 2) {
      const hasil = this.handLandmarker.detectForVideo(this.videoEl, waktu);
      const daftar = hasil.landmarks ?? [];
      let tanganKiri: TanganTerdeteksi | null = null;
      let tanganKanan: TanganTerdeteksi | null = null;
      let tanganUtama: TanganTerdeteksi | null = null;

      if (daftar.length === 1) {
        const d = klasifikasiTangan(daftar[0]);
        tanganUtama = d;
        if (d.pusatX < 0.5) tanganKiri = d;
        else tanganKanan = d;
      } else if (daftar.length >= 2) {
        const t1 = klasifikasiTangan(daftar[0]);
        const t2 = klasifikasiTangan(daftar[1]);
        if (t1.pusatX <= t2.pusatX) {
          tanganKiri = t1;
          tanganKanan = t2;
        } else {
          tanganKiri = t2;
          tanganKanan = t1;
        }
        tanganUtama = tanganKanan;
      }

      this.onFrameCb?.({
        jumlahTangan: daftar.length,
        tanganUtama,
        tanganKiri,
        tanganKanan,
        waktuMs: waktu,
      });
    }

    this.rafId = window.requestAnimationFrame(this.loop);
  };

  public matikan(): void {
    this.berjalan = false;
    if (this.rafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.rafId);
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
      this.videoEl = null;
    }
    this.onStatusCb?.('nonaktif');
  }
}
