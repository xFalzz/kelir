import type { FrameTangan, JenisGestur, TanganTerdeteksi } from './handTracker.ts';

export const SARON_WILAH_X = [-0.875, -0.525, -0.175, 0.175, 0.525, 0.875] as const;

export interface KinetikSaronGestur {
  aktif: boolean;
  hoverWilahIdx: number | null;
  pukulWilahIdx: number | null;
  amplitudoPukul: number;
  malletPos: [number, number, number];
  malletTiltZ: number;
  malletTiltX: number;
  saronYawY: number;
  saronPitchX: number;
}

const BATAS_X_MIN = 0.14;
const BATAS_X_MAX = 0.86;
const BATAS_Y_MIN = 0.18;
const BATAS_Y_MAX = 0.76;
const AMBANG_BIDANG_PUKUL_Y = 0.68;
const KECEPATAN_PUKUL_TURUN = 0.66;
const COOLDOWN_PUKUL_MS = 135;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function kuantisasiWilah(uX: number, prevIdx: number | null): number {
  const posFloat = clamp(uX, 0, 0.9999) * SARON_WILAH_X.length;
  const raw = Math.min(SARON_WILAH_X.length - 1, Math.floor(posFloat));
  if (prevIdx !== null && prevIdx !== raw) {
    const batas = raw > prevIdx ? prevIdx + 1 : prevIdx;
    if (Math.abs(posFloat - batas) < 0.14) {
      return prevIdx;
    }
  }
  return raw;
}

/**
 * Mengubah posisi, kecepatan vertikal, dan pose tangan 21-titik MediaPipe
 * menjadi gerak 1:1 Tabuh Gandhen 3D dan pemicu nada 6 wilah Saron Slendro.
 */
export class EvaluatorGesturSaron {
  private smoothX = 0.5;
  private smoothY = 0.35;
  private prevUY = 0.25;
  private prevWaktuMs = 0;
  private prevGestur: JenisGestur | null = null;
  private hoverIdx: number | null = null;
  private lastStrikeIdx: number | null = null;
  private lastStrikeMs = -COOLDOWN_PUKUL_MS;
  private sedangDiBawah = false;
  private memilikiSampel = false;

  public reset(): void {
    this.smoothX = 0.5;
    this.smoothY = 0.35;
    this.prevUY = 0.25;
    this.prevWaktuMs = 0;
    this.prevGestur = null;
    this.hoverIdx = null;
    this.lastStrikeIdx = null;
    this.lastStrikeMs = -COOLDOWN_PUKUL_MS;
    this.sedangDiBawah = false;
    this.memilikiSampel = false;
  }

  public prosesFrame(frame: FrameTangan): KinetikSaronGestur {
    const mainHand: TanganTerdeteksi | null =
      frame.tanganUtama ?? frame.tanganKanan ?? frame.tanganKiri ?? null;

    if (!mainHand) {
      this.memilikiSampel = false;
      this.prevGestur = null;
      this.hoverIdx = null;
      this.sedangDiBawah = false;
      return {
        aktif: false,
        hoverWilahIdx: null,
        pukulWilahIdx: null,
        amplitudoPukul: 0.32,
        malletPos: [1.18, 0.72, 0.48],
        malletTiltZ: 0.36,
        malletTiltX: -0.22,
        saronYawY: 0,
        saronPitchX: 0,
      };
    }

    const rawX = mainHand.telunjukX * 0.7 + mainHand.pusatX * 0.3;
    const rawY = mainHand.telunjukY * 0.72 + mainHand.pusatY * 0.28;

    const dtSec =
      this.memilikiSampel && frame.waktuMs > this.prevWaktuMs
        ? Math.min(Math.max((frame.waktuMs - this.prevWaktuMs) / 1000, 0.008), 0.12)
        : 1 / 60;

    if (!this.memilikiSampel) {
      this.smoothX = rawX;
      this.smoothY = rawY;
    } else {
      this.smoothX += (rawX - this.smoothX) * 0.46;
      this.smoothY += (rawY - this.smoothY) * 0.46;
    }

    const uX = clamp((this.smoothX - BATAS_X_MIN) / (BATAS_X_MAX - BATAS_X_MIN), 0, 1);
    const uY = clamp((this.smoothY - BATAS_Y_MIN) / (BATAS_Y_MAX - BATAS_Y_MIN), 0, 1);
    const vy = this.memilikiSampel ? (uY - this.prevUY) / dtSec : 0;

    const idxKini = kuantisasiWilah(uX, this.hoverIdx);
    const nowMs = frame.waktuMs;
    const bolehPukulUlang = nowMs - this.lastStrikeMs >= COOLDOWN_PUKUL_MS;

    let pukulIdx: number | null = null;
    let amp = 0.32;

    if (bolehPukulUlang) {
      const cubitBaru =
        (mainHand.gestur === 'cubit' || mainHand.gestur === 'kepal') &&
        this.prevGestur !== mainHand.gestur;
      const ayunTurunCepat = vy >= KECEPATAN_PUKUL_TURUN && uY >= 0.24;
      const masukBidangPukul = uY >= AMBANG_BIDANG_PUKUL_Y && !this.sedangDiBawah;
      const sapuanNadaBaruDiBawah =
        uY >= AMBANG_BIDANG_PUKUL_Y &&
        this.lastStrikeIdx !== null &&
        idxKini !== this.lastStrikeIdx;

      if (cubitBaru || ayunTurunCepat || masukBidangPukul || sapuanNadaBaruDiBawah) {
        pukulIdx = idxKini;
        this.lastStrikeMs = nowMs;
        this.lastStrikeIdx = idxKini;
        const skalaKecepatan = clamp((vy - 0.5) * 0.12, 0, 0.14);
        amp = clamp(0.28 + skalaKecepatan, 0.24, 0.44);
      }
    }

    this.sedangDiBawah = uY >= AMBANG_BIDANG_PUKUL_Y;
    if (uY < AMBANG_BIDANG_PUKUL_Y - 0.1) {
      this.lastStrikeIdx = null;
    }

    this.hoverIdx = idxKini;
    this.prevUY = uY;
    this.prevWaktuMs = nowMs;
    this.prevGestur = mainHand.gestur;
    this.memilikiSampel = true;

    const targetX =
      pukulIdx !== null ? SARON_WILAH_X[pukulIdx] : -0.875 + uX * 1.75;
    const targetY = pukulIdx !== null ? 0.255 : 0.86 - uY * 0.57;
    const targetZ = 0.05 + (1 - uY) * 0.08;

    const wristOffset = clamp(mainHand.kemiringan + Math.PI / 2, -0.75, 0.75);
    const malletTiltZ = 0.22 + (uX - 0.5) * -0.45 + wristOffset * 0.35;
    const malletTiltX = pukulIdx !== null ? 0.34 : -0.26 + uY * 0.52;

    let saronYawY = (uX - 0.5) * 0.18;
    let saronPitchX = (uY - 0.5) * 0.1;
    if (frame.jumlahTangan >= 2 && frame.tanganKiri) {
      saronYawY = (frame.tanganKiri.pusatX - 0.32) * 0.72;
      saronPitchX = (frame.tanganKiri.pusatY - 0.5) * 0.42;
    }

    return {
      aktif: true,
      hoverWilahIdx: idxKini,
      pukulWilahIdx: pukulIdx,
      amplitudoPukul: amp,
      malletPos: [targetX, targetY, targetZ],
      malletTiltZ,
      malletTiltX,
      saronYawY,
      saronPitchX,
    };
  }
}
