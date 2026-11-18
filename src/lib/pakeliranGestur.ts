import type { FrameTangan, JenisGestur, TanganTerdeteksi } from './handTracker.ts';

export type AksiGesturPakeliran =
  | 'sabetan'
  | 'bidik'
  | 'panah'
  | 'kayon'
  | 'kiprah'
  | 'solah'
  | null;

export interface KinetikPakeliranGestur {
  aktif: boolean;
  jumlahTangan: number;
  modeKontrol: 'nonaktif' | 'satu-tangan' | 'dua-tangan';
  poseRama: JenisGestur | null;
  poseKidang: JenisGestur | null;
  aksiLabel: AksiGesturPakeliran;
  ramaPosNorm: number;
  kidangPosNorm: number;
  ramaLiftY: number;
  kidangLiftY: number;
  ramaZ: number;
  kidangZ: number;
  ramaYawY: number;
  kidangYawY: number;
  ramaTiltZ: number;
  ramaHeadTilt: number;
  kidangTiltZ: number;
  kidangNeckZ: number;
  kidangEarPerk: number;
  kidangTailWag: number;
  ramaLenganKananZ: number;
  ramaSikuKananZ: number;
  ramaLenganKiriZ: number;
  ramaSikuKiriZ: number;
  tarikBusur: number;
  gununganSwayZ: number;
  gununganLiftY: number;
  blencongBoost: number;
  sabetanIntensitas: number;
  picuSabetan: boolean;
  picuPanah: boolean;
}

const BATAS_X_MIN = 0.14;
const BATAS_X_MAX = 0.86;
const BATAS_Y_MIN = 0.16;
const BATAS_Y_MAX = 0.82;
const COOLDOWN_PANAH_MS = 460;
const COOLDOWN_SABETAN_MS = 420;
const KECEPATAN_WHIP_SABETAN = 2.4;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function normToStage(rawX: number): number {
  const u = clamp((rawX - BATAS_X_MIN) / (BATAS_X_MAX - BATAS_X_MIN), 0, 1);
  return clamp((u - 0.5) * 1.7, -0.85, 0.85);
}

function verticalLift(rawY: number, scaleUp: number, scaleDown: number): number {
  // Atas webcam (rawY kecil) = angkat wayang tinggi; bawah webcam = tancep ke gedebog
  const uUp = 1 - clamp((rawY - BATAS_Y_MIN) / (BATAS_Y_MAX - BATAS_Y_MIN), 0, 1);
  return clamp((uUp - 0.35) * scaleUp, -scaleDown, scaleUp * 0.65);
}

function handDepthZ(tangan: TanganTerdeteksi): number {
  const reach = Math.hypot(tangan.telunjukX - tangan.pusatX, tangan.telunjukY - tangan.pusatY);
  const spreadFactor = clamp((reach - 0.08) / 0.17, 0, 1);
  const openRatio = clamp(tangan.jumlahJariTerangkat / 5, 0, 1);
  const combined = spreadFactor * 0.72 + openRatio * 0.28;
  // Dekat Blencong (+0.34, bayangan membesar hangat) vs menempel kelir (-0.08, siluet tajam)
  return clamp(-0.08 + combined * 0.42, -0.08, 0.34);
}

function relativeWristTilt(kemiringan: number): number {
  // Neutral tegak pada MediaPipe bernilai -Math.PI / 2
  const diff = kemiringan + Math.PI / 2;
  const wrapped = Math.atan2(Math.sin(diff), Math.cos(diff));
  return clamp(wrapped, -0.95, 0.95);
}

/**
 * Mengubah gerak 1 atau 2 tangan 21-titik MediaPipe menjadi koreografi dalang multi-sumbu:
 * sapuan X & walikan yaw, angkatan Y solah, kedalaman Z ke Blencong/Kelir,
 * artikulasi ganda tuding Sri Rama, tarikan tali busur Guwawijaya, gerak leher-tanduk Kidang,
 * serta hantaman Cempala-Kepyak.
 */
export class EvaluatorGesturPakeliran {
  private smoothRamaX = 0.46;
  private smoothRamaY = 0;
  private smoothRamaZ = 0.12;
  private smoothKidangX = -0.58;
  private smoothKidangY = 0;
  private smoothKidangZ = 0.1;

  private prevRamaX = 0.46;
  private prevKidangX = -0.58;
  private prevWaktuMs = 0;
  private memilikiRama = false;
  private memilikiKidang = false;

  private prevPinchAktif = false;
  private lastPanahMs = -COOLDOWN_PANAH_MS;
  private prevKepalAktif = false;
  private lastSabetanMs = -COOLDOWN_SABETAN_MS;

  private facingRamaFlip = false;
  private facingKidangFlip = false;

  public reset(): void {
    this.smoothRamaX = 0.46;
    this.smoothRamaY = 0;
    this.smoothRamaZ = 0.12;
    this.smoothKidangX = -0.58;
    this.smoothKidangY = 0;
    this.smoothKidangZ = 0.1;
    this.prevRamaX = 0.46;
    this.prevKidangX = -0.58;
    this.prevWaktuMs = 0;
    this.memilikiRama = false;
    this.memilikiKidang = false;
    this.prevPinchAktif = false;
    this.lastPanahMs = -COOLDOWN_PANAH_MS;
    this.prevKepalAktif = false;
    this.lastSabetanMs = -COOLDOWN_SABETAN_MS;
    this.facingRamaFlip = false;
    this.facingKidangFlip = false;
  }

  public sinkronkanPosisiAwal(ramaPosNorm: number, kidangPosNorm: number): void {
    const r = clamp(ramaPosNorm, -0.85, 0.85);
    const k = clamp(kidangPosNorm, -0.85, 0.85);
    this.smoothRamaX = r;
    this.prevRamaX = r;
    this.smoothKidangX = k;
    this.prevKidangX = k;
  }

  public prosesFrame(frame: FrameTangan): KinetikPakeliranGestur {
    const utama = frame.tanganUtama ?? frame.tanganKanan ?? frame.tanganKiri ?? null;
    if (!utama) {
      this.memilikiRama = false;
      this.memilikiKidang = false;
      this.prevPinchAktif = false;
      this.prevKepalAktif = false;
      return {
        aktif: false,
        jumlahTangan: 0,
        modeKontrol: 'nonaktif',
        poseRama: null,
        poseKidang: null,
        aksiLabel: null,
        ramaPosNorm: this.smoothRamaX,
        kidangPosNorm: this.smoothKidangX,
        ramaLiftY: 0,
        kidangLiftY: 0,
        ramaZ: 0.12,
        kidangZ: 0.1,
        ramaYawY: -0.05,
        kidangYawY: 0.04,
        ramaTiltZ: 0,
        ramaHeadTilt: 0,
        kidangTiltZ: 0,
        kidangNeckZ: 0,
        kidangEarPerk: 0,
        kidangTailWag: 0,
        ramaLenganKananZ: -0.34,
        ramaSikuKananZ: 0.56,
        ramaLenganKiriZ: 0.4,
        ramaSikuKiriZ: -0.88,
        tarikBusur: 0,
        gununganSwayZ: 0,
        gununganLiftY: 0,
        blencongBoost: 0,
        sabetanIntensitas: 0,
        picuSabetan: false,
        picuPanah: false,
      };
    }

    const duaTangan = Boolean(frame.tanganKanan && frame.tanganKiri);
    const tanganRama = frame.tanganKanan ?? utama;
    const tanganKidang = duaTangan ? frame.tanganKiri : null;

    const dtSec =
      (this.memilikiRama || this.memilikiKidang) && frame.waktuMs > this.prevWaktuMs
        ? clamp((frame.waktuMs - this.prevWaktuMs) / 1000, 0.008, 0.12)
        : 1 / 60;
    this.prevWaktuMs = frame.waktuMs;

    // 1. Evaluasi Sri Rama
    const targetRX = normToStage(tanganRama.pusatX * 0.72 + tanganRama.telunjukX * 0.28);
    const targetRY = verticalLift(tanganRama.pusatY * 0.7 + tanganRama.telunjukY * 0.3, 0.44, 0.06);
    const targetRZ = handDepthZ(tanganRama);

    if (!this.memilikiRama) {
      this.smoothRamaX = targetRX;
      this.smoothRamaY = targetRY;
      this.smoothRamaZ = targetRZ;
      this.prevRamaX = targetRX;
      this.memilikiRama = true;
    } else {
      const alphaFast = 1 - Math.exp(-16 * dtSec);
      this.smoothRamaX += (targetRX - this.smoothRamaX) * alphaFast;
      this.smoothRamaY += (targetRY - this.smoothRamaY) * alphaFast;
      this.smoothRamaZ += (targetRZ - this.smoothRamaZ) * (1 - Math.exp(-11 * dtSec));
    }

    const vxRama = (this.smoothRamaX - this.prevRamaX) / dtSec;
    this.prevRamaX = this.smoothRamaX;

    // 2. Evaluasi Kidang Kencana (2 tangan bebas vs 1 tangan koreografi reaktif)
    let vxKidang = 0;
    if (tanganKidang) {
      const targetKX = normToStage(tanganKidang.pusatX * 0.74 + tanganKidang.telunjukX * 0.26);
      const targetKY = verticalLift(tanganKidang.pusatY * 0.7 + tanganKidang.telunjukY * 0.3, 0.54, 0.04);
      const targetKZ = handDepthZ(tanganKidang);

      if (!this.memilikiKidang) {
        this.smoothKidangX = targetKX;
        this.smoothKidangY = targetKY;
        this.smoothKidangZ = targetKZ;
        this.prevKidangX = targetKX;
        this.memilikiKidang = true;
      } else {
        const alphaFast = 1 - Math.exp(-16 * dtSec);
        this.smoothKidangX += (targetKX - this.smoothKidangX) * alphaFast;
        this.smoothKidangY += (targetKY - this.smoothKidangY) * alphaFast;
        this.smoothKidangZ += (targetKZ - this.smoothKidangZ) * (1 - Math.exp(-11 * dtSec));
      }
      vxKidang = (this.smoothKidangX - this.prevKidangX) / dtSec;
      this.prevKidangX = this.smoothKidangX;
    } else {
      this.memilikiKidang = false;
      // Mode 1 tangan: Kidang menanggapi tinggi & jarak Rama agar panggung tetap hidup
      const jarakRK = Math.abs(this.smoothRamaX - this.smoothKidangX);
      const reactiveLift = clamp((1.1 - jarakRK) * 0.16, 0, 0.2) + Math.max(0, this.smoothRamaY) * 0.28;
      this.smoothKidangY += (reactiveLift - this.smoothKidangY) * (1 - Math.exp(-6 * dtSec));
      this.smoothKidangZ += (0.12 - this.smoothKidangZ) * (1 - Math.exp(-5 * dtSec));
    }

    // 3. Walikan (Pembalikan Arah Wayang Otomatis dengan Histeresis)
    if (!this.facingRamaFlip && this.smoothRamaX < this.smoothKidangX - 0.16) {
      this.facingRamaFlip = true;
    } else if (this.facingRamaFlip && this.smoothRamaX > this.smoothKidangX + 0.16) {
      this.facingRamaFlip = false;
    }
    const tiltRama = relativeWristTilt(tanganRama.kemiringan);
    const tiltKidang = tanganKidang ? relativeWristTilt(tanganKidang.kemiringan) : -tiltRama * 0.4;

    const baseYawRama = this.facingRamaFlip ? Math.PI : 0;
    const ramaYawY =
      baseYawRama + clamp(tiltRama * 0.42 - vxRama * 0.12, -0.45, 0.45);

    if (tanganKidang) {
      if (!this.facingKidangFlip && vxKidang > 0.65) {
        this.facingKidangFlip = true;
      } else if (this.facingKidangFlip && vxKidang < -0.65) {
        this.facingKidangFlip = false;
      }
    } else {
      this.facingKidangFlip = this.smoothKidangX < this.smoothRamaX - 0.35 ? false : this.smoothKidangX > this.smoothRamaX + 0.35;
    }
    const baseYawKidang = this.facingKidangFlip ? Math.PI : 0;
    const kidangYawY =
      baseYawKidang + clamp(tiltKidang * 0.46 + vxKidang * 0.12, -0.48, 0.48);

    // 4. Tarik Busur Guwawijaya & Picu Anak Panah
    const gripRatio = clamp((0.125 - tanganRama.jarakCubit) / 0.085, 0, 1);
    const pinchAktif = tanganRama.gestur === 'cubit' || tanganRama.jarakCubit <= 0.044;
    const tarikBusur =
      tanganRama.gestur === 'cubit'
        ? Math.max(0.76, gripRatio)
        : tanganRama.gestur === 'tunjuk'
          ? Math.max(0.45, gripRatio * 0.7)
          : gripRatio * 0.65;

    let picuPanah = false;
    if (pinchAktif && !this.prevPinchAktif && frame.waktuMs - this.lastPanahMs >= COOLDOWN_PANAH_MS) {
      picuPanah = true;
      this.lastPanahMs = frame.waktuMs;
    }
    this.prevPinchAktif = pinchAktif;

    // 5. Sabetan Dalang & Pukulan Cempala-Kepyak
    const kepalAktif = tanganRama.gestur === 'kepal' || tanganKidang?.gestur === 'kepal';
    const whipCepat =
      Math.abs(vxRama) >= KECEPATAN_WHIP_SABETAN || Math.abs(vxKidang) >= KECEPATAN_WHIP_SABETAN;
    let picuSabetan = false;
    if (
      (kepalAktif && !this.prevKepalAktif) ||
      (whipCepat && frame.waktuMs - this.lastSabetanMs >= COOLDOWN_SABETAN_MS)
    ) {
      if (frame.waktuMs - this.lastSabetanMs >= COOLDOWN_SABETAN_MS) {
        picuSabetan = true;
        this.lastSabetanMs = frame.waktuMs;
      }
    }
    this.prevKepalAktif = Boolean(kepalAktif);

    // 6. Artikulasi Dual-Arm Tuding, Kepala, Badan & Gunungan berdasarkan Pose Jari
    const phaseTime = frame.waktuMs * 0.005;
    let ramaLenganKananZ = -0.34 + tiltRama * 0.48 - this.smoothRamaY * 0.45;
    let ramaSikuKananZ = 0.56 - tiltRama * 0.25 + this.smoothRamaY * 0.25;
    let ramaLenganKiriZ = 0.4 - tiltRama * 0.35 + Math.sin(phaseTime) * 0.14;
    let ramaSikuKiriZ = -0.88 + this.smoothRamaY * 0.38;
    let gununganSwayZ = tiltRama * 0.06;
    let gununganLiftY = 0;
    let blencongBoost = clamp(this.smoothRamaZ * 1.4, 0, 0.5);
    let aksiLabel: AksiGesturPakeliran = Math.abs(vxRama) > 0.45 || Math.abs(vxKidang) > 0.45 ? 'solah' : null;

    if (tanganRama.gestur === 'cubit') {
      // Bidik dan tarik tali busur penuh
      ramaLenganKananZ = -0.86 - tiltRama * 0.22;
      ramaSikuKananZ = 0.88;
      ramaLenganKiriZ = 0.72;
      ramaSikuKiriZ = -1.28;
      blencongBoost = Math.max(blencongBoost, 0.68);
      aksiLabel = picuPanah ? 'panah' : 'bidik';
    } else if (tanganRama.gestur === 'tunjuk') {
      // Kuda-kuda membidik arah vertikal tangan
      ramaLenganKananZ = clamp(-0.92 + (0.5 - tanganRama.telunjukY) * 0.85, -1.32, -0.25);
      ramaSikuKananZ = 0.94;
      ramaLenganKiriZ = 0.58;
      ramaSikuKiriZ = -1.06;
      aksiLabel = 'bidik';
    } else if (tanganRama.gestur === 'dua-jari') {
      // Solah Ulap-ulap + menggerakkan Gunungan Kayon
      ramaLenganKananZ = -0.26 + Math.sin(phaseTime * 1.1) * 0.18;
      ramaSikuKananZ = 0.68;
      ramaLenganKiriZ = 1.02 + Math.cos(phaseTime * 1.2) * 0.22;
      ramaSikuKiriZ = -0.52 + Math.sin(phaseTime) * 0.18;
      gununganSwayZ = clamp(tiltRama * 0.28 + Math.sin(phaseTime * 0.9) * 0.14, -0.32, 0.32);
      gununganLiftY = clamp(this.smoothRamaY * 0.45, -0.04, 0.18);
      aksiLabel = 'kayon';
    } else if (tanganRama.gestur === 'tiga-jari') {
      // Pose Sembah / Kiprah Keraton yang simetris megah
      ramaLenganKananZ = -0.78 + Math.sin(phaseTime) * 0.12;
      ramaSikuKananZ = 1.12;
      ramaLenganKiriZ = 0.88 - Math.sin(phaseTime) * 0.12;
      ramaSikuKiriZ = -1.16;
      blencongBoost = Math.max(blencongBoost, 0.48);
      aksiLabel = 'kiprah';
    } else if (kepalAktif) {
      ramaLenganKananZ = -1.14;
      ramaSikuKananZ = 1.12;
      ramaLenganKiriZ = 0.96;
      ramaSikuKiriZ = -0.52;
      blencongBoost = 0.95;
      aksiLabel = 'sabetan';
    } else if (picuSabetan) {
      aksiLabel = 'sabetan';
    }

    const sabetanIntensitas = clamp(
      (kepalAktif ? 0.9 : 0) + clamp(Math.max(Math.abs(vxRama), Math.abs(vxKidang)) / 2.6, 0, 0.75),
      0,
      1,
    );

    // 7. Kidang Kencana leher, badan, telinga & ekor
    const kidangTiltZ = clamp(tiltKidang * 0.42 + vxKidang * 0.08, -0.4, 0.4);
    const kidangNeckZ = clamp(
      -tiltKidang * 0.48 + (tanganKidang ? (0.45 - tanganKidang.telunjukY) * 0.55 : Math.sin(phaseTime * 1.4) * 0.14),
      -0.46,
      0.52,
    );
    const kidangEarPerk = clamp(
      tanganKidang ? (tanganKidang.gestur === 'tunjuk' || tanganKidang.gestur === 'tiga-jari' ? 0.42 : 0.12) : 0.18,
      -0.25,
      0.48,
    );
    const kidangTailWag = clamp(
      Math.sin(phaseTime * 1.8) * 0.24 + (tanganKidang?.gestur === 'terbuka' ? 0.18 : 0),
      -0.45,
      0.45,
    );

    return {
      aktif: true,
      jumlahTangan: frame.jumlahTangan,
      modeKontrol: duaTangan ? 'dua-tangan' : 'satu-tangan',
      poseRama: tanganRama.gestur,
      poseKidang: tanganKidang?.gestur ?? null,
      aksiLabel: aksiLabel ?? 'solah',
      ramaPosNorm: Number(this.smoothRamaX.toFixed(4)),
      kidangPosNorm: Number(this.smoothKidangX.toFixed(4)),
      ramaLiftY: this.smoothRamaY,
      kidangLiftY: this.smoothKidangY,
      ramaZ: this.smoothRamaZ,
      kidangZ: this.smoothKidangZ,
      ramaYawY,
      kidangYawY,
      ramaTiltZ: clamp(tiltRama * 0.34 - vxRama * 0.07, -0.36, 0.36),
      ramaHeadTilt: clamp(-tiltRama * 0.24 + (0.42 - tanganRama.pusatY) * 0.18, -0.26, 0.26),
      kidangTiltZ,
      kidangNeckZ,
      kidangEarPerk,
      kidangTailWag,
      ramaLenganKananZ: clamp(ramaLenganKananZ, -1.35, 0.45),
      ramaSikuKananZ: clamp(ramaSikuKananZ, 0.15, 1.32),
      ramaLenganKiriZ: clamp(ramaLenganKiriZ, -0.35, 1.25),
      ramaSikuKiriZ: clamp(ramaSikuKiriZ, -1.35, 0.2),
      tarikBusur: clamp(tarikBusur, 0, 1),
      gununganSwayZ,
      gununganLiftY,
      blencongBoost,
      sabetanIntensitas,
      picuSabetan,
      picuPanah,
    };
  }
}
