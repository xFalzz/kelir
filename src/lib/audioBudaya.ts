// Mesin sintesis suara budaya Nusantara berbasis pemodelan fisik (Web Audio API murni).
// Menghasilkan suara realistis khas Jawa tanpa ketergantungan berkas audio eksternal:
// 1. Gong Ageng Keraton (dengan akustik ombak/beating perunggu asli)
// 2. Cempala Kayu & Keprak Logam Pedalangan
// 3. Gesekan Warangka Kayu & Denting Pamor Wesi Aji (Keris)
// 4. Desis Malam Panas & Letupan Bara Anglo (Batik Tulis)
// 5. Ketukan Balok Kayu Jati Saka Guru & Pasak Purus (Arsitektur Joglo)
// 6. Rentangan Busur Gendewa & Lesatan Panah Guwawijaya (Wayang)
// 7. Suasana Gending Halus Pendopo Laras Slendro (Ambience Opsional)

const NADA_SLENDRO_HZ = [246.94, 282.0, 324.0, 372.0, 428.0, 493.88, 564.0];

class PengelolaAudioBudaya {
  private ctx: AudioContext | null = null;
  private aktif = true;
  private pendopoAktif = false;
  private timerPendopo: ReturnType<typeof setInterval> | null = null;
  private langkahPendopo = 0;

  private ambilKonteks(): AudioContext | null {
    if (!this.aktif || typeof window === 'undefined') return null;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;

    try {
      if (!this.ctx) {
        this.ctx = new AudioCtor();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  aturAktif(nilai: boolean): boolean {
    this.aktif = nilai;
    if (!nilai) {
      this.matikanSuasanaPendopo();
    }
    return this.aktif;
  }

  apakahAktif(): boolean {
    return this.aktif;
  }

  apakahPendopoAktif(): boolean {
    return this.pendopoAktif;
  }

  // 1. Suara Bilah Saron Barung / Peking Laras Slendro
  bunyikanWilahSaron(frekuensi: number, volume = 0.22): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Pukulan kayu tabuh pada perunggu (attack transient)
      const klikOsc = ctx.createOscillator();
      const klikGain = ctx.createGain();
      klikOsc.type = 'triangle';
      klikOsc.frequency.setValueAtTime(140, now);
      klikOsc.frequency.exponentialRampToValueAtTime(48, now + 0.028);
      klikGain.gain.setValueAtTime(volume * 0.45, now);
      klikGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
      klikOsc.connect(klikGain);
      klikGain.connect(ctx.destination);
      klikOsc.start(now);
      klikOsc.stop(now + 0.035);

      // Harmonik inharmonik bilah perunggu tempa (gangsa)
      const parsial = [
        { rasio: 1.0, gain: volume, durasi: 1.55, tipe: 'triangle' as OscillatorType },
        { rasio: 2.004, gain: volume * 0.28, durasi: 0.9, tipe: 'sine' as OscillatorType },
        { rasio: 2.758, gain: volume * 0.42, durasi: 0.62, tipe: 'sine' as OscillatorType },
        { rasio: 5.404, gain: volume * 0.16, durasi: 0.25, tipe: 'sine' as OscillatorType },
      ];

      for (const p of parsial) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = p.tipe;
        osc.frequency.setValueAtTime(frekuensi * p.rasio, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(p.gain, now + 0.007);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.durasi);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + p.durasi + 0.02);
      }
    } catch {
      // Abaikan bila autoplay diblokir browser
    }
  }

  // 2. Suara Gong Ageng Keraton dengan efek "Ombak" (detuning akustik ~1.7 Hz)
  bunyikanGongAgeng(intensitas = 0.24): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fDasar = 65.41; // Nada C2 rendah pencu gong

      // Dua osilator fundamental dengan selisih 1.7 Hz untuk menciptakan ayunan ombak gong Jawa
      const frekuensiGong = [fDasar, fDasar + 1.7, fDasar * 1.5, fDasar * 2.38];
      const bobotGain = [1.0, 0.85, 0.35, 0.14];
      const durasi = [3.1, 2.95, 1.8, 0.9];

      frekuensiGong.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx < 2 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f * 0.98, now);
        osc.frequency.exponentialRampToValueAtTime(f, now + 0.09);

        const gMax = intensitas * bobotGain[idx];
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(gMax, now + 0.065);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durasi[idx]);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durasi[idx] + 0.05);
      });
    } catch {
      // Abaikan bila gagal
    }
  }

  // 3. Suara Ketukan Cempala Kayu & Keprak Perunggu Dalang
  bunyikanCempalaKeprak(mode: 'cempala' | 'keprak' = 'cempala'): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (mode === 'cempala') {
        // Ketukan kayu jati cempala pada kotak wayang (dhodhogan)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(115, now + 0.055);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Hentakan lempeng perunggu keprak pedalangan (3 lempeng bertumpuk)
        for (const [idx, f] of [820, 1190, 1740].entries()) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const tMulai = now + idx * 0.012;
          osc.frequency.setValueAtTime(f, tMulai);
          osc.frequency.exponentialRampToValueAtTime(f * 0.82, tMulai + 0.09);

          gain.gain.setValueAtTime(0.0001, tMulai);
          gain.gain.linearRampToValueAtTime(0.065, tMulai + 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, tMulai + 0.11);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(tMulai);
          osc.stop(tMulai + 0.12);
        }
      }
    } catch {
      // Abaikan bila gagal
    }
  }

  // 4. Suara Mencabut / Menyarungkan Bilah Keris Berpamor dari Warangka Kayu
  bunyikanCabutKeris(disarungkan: boolean): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Gesekan bilah besi pamor dengan serat kayu warangka (filtered noise sweep)
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.5, now);
      if (disarungkan) {
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(420, now + 0.32);
      } else {
        filter.frequency.setValueAtTime(480, now);
        filter.frequency.exponentialRampToValueAtTime(1850, now + 0.32);
      }

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // Denting resonansi logam pamor (wesi aji)
      const nadaLogam = disarungkan ? [980, 1640] : [1320, 2480, 3720];
      nadaLogam.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + 0.06);

        gain.gain.setValueAtTime(0.0001, now + 0.06);
        gain.gain.linearRampToValueAtTime(0.075 / (idx + 1), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.06);
        osc.stop(now + 0.88);
      });
    } catch {
      // Abaikan bila gagal
    }
  }

  // 5. Suara Tiupan Cucuk Canting & Desis Malam Panas di Atas Kain Mori
  bunyikanCantingBatik(): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(920, now);
      filter.frequency.linearRampToValueAtTime(1280, now + 0.22);
      filter.frequency.linearRampToValueAtTime(760, now + 0.44);
      filter.Q.setValueAtTime(6.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Denting halus tembaga nyamplungan canting menyentuh bibir wajan
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1120, now);
      oscGain.gain.setValueAtTime(0.05, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Abaikan bila gagal
    }
  }

  // 6. Suara Sambungan Takik Kayu Jati (Purus & Cathokan) & Umpak Batu Joglo
  bunyikanStrukturJoglo(bedah: boolean): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const urutanNada = bedah ? [110, 142, 178, 220] : [220, 178, 142, 98];

      urutanNada.forEach((f, idx) => {
        const t0 = now + idx * 0.085;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t0);
        osc.frequency.exponentialRampToValueAtTime(f * 0.68, t0 + 0.12);

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.18, t0 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.15);
      });
    } catch {
      // Abaikan bila gagal
    }
  }

  // 7. Suara Rentangan Busur Gendewa & Lesatan Anak Panah Sri Rama
  bunyikanPanahWayang(): void {
    const ctx = this.ambilKonteks();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Desir angin anak panah melesat (filtered noise sweep)
      const bufferSize = Math.floor(ctx.sampleRate * 0.32);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.7);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(380, now + 0.3);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Getaran tali busur Gendewa
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(195, now);
      osc.frequency.exponentialRampToValueAtTime(92, now + 0.26);
      oscGain.gain.setValueAtTime(0.09, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);

      // Aksen keprak dalang mengiringi lesatan panah
      this.bunyikanCempalaKeprak('keprak');
    } catch {
      // Abaikan bila gagal
    }
  }

  // 8. Gending Halus Suasana Pendopo Keraton (Laras Slendro Lembut)
  toggleSuasanaPendopo(): boolean {
    if (this.pendopoAktif) {
      this.matikanSuasanaPendopo();
      return false;
    }
    this.aktif = true;
    this.pendopoAktif = true;
    this.langkahPendopo = 0;

    // Bunyikan Gong pembuka lembut lalu jalankan irama balungan lambat
    this.bunyikanGongAgeng(0.14);
    const polaHalus = [1, 2, 3, 5, 3, 2, 1, 0];

    this.timerPendopo = setInterval(() => {
      if (!this.pendopoAktif || !this.aktif) return;
      const idxNada = polaHalus[this.langkahPendopo % polaHalus.length];
      const f = NADA_SLENDRO_HZ[idxNada] ?? 282.0;
      this.bunyikanWilahSaron(f * 0.5, 0.065); // Oktaf lembut gender/slenthem
      if (this.langkahPendopo % 8 === 7) {
        this.bunyikanGongAgeng(0.11);
      }
      this.langkahPendopo++;
    }, 1150);

    return true;
  }

  matikanSuasanaPendopo(): void {
    this.pendopoAktif = false;
    if (this.timerPendopo) {
      clearInterval(this.timerPendopo);
      this.timerPendopo = null;
    }
  }
}

export const audioBudaya = new PengelolaAudioBudaya();
