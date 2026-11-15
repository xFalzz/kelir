export interface NadaSlendro {
  angka: string;
  namaJawa: string;
  frekuensiHz: number;
}

export const NADA_SARON_SLENDRO: NadaSlendro[] = [
  { angka: '1', namaJawa: 'Ji (Barang Alit / Nem)', frekuensiHz: 261.63 },
  { angka: '2', namaJawa: 'Ro (Gulu)', frekuensiHz: 299.1 },
  { angka: '3', namaJawa: 'Lu (Dhadha)', frekuensiHz: 344.2 },
  { angka: '5', namaJawa: 'Ma (Lima)', frekuensiHz: 398.5 },
  { angka: '6', namaJawa: 'Nem (Nem)', frekuensiHz: 454.8 },
  { angka: 'i', namaJawa: 'Ji Alit (Barang Luhur)', frekuensiHz: 523.25 },
];

class MesinAudioBudaya {
  private ctx: AudioContext | null = null;
  private aktif = false;
  private suaraAmbientAktif = false;
  private timerAmbient: number | null = null;

  public statusAktif(): boolean {
    return this.aktif;
  }

  public statusSuasana(): boolean {
    return this.suaraAmbientAktif;
  }

  private pastikanKonteks(): AudioContext | null {
    if (!this.aktif || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  public aturAktif(nyala: boolean): void {
    this.aktif = nyala;
    if (!nyala) {
      this.hentikanSuasanaPendopo();
    }
  }

  public bunyikanWilahSaron(indeksNada: number, amplitudo = 0.24): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;

    const nada = NADA_SARON_SLENDRO[Math.abs(indeksNada) % NADA_SARON_SLENDRO.length];
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, t);
    master.gain.exponentialRampToValueAtTime(amplitudo, t + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0008, t + 1.45);
    master.connect(ctx.destination);

    // Harmonik logam perunggu gangsa (rasio mendekati 1, 2.756, 5.4)
    const osilators: Array<{ mul: number; amp: number; dur: number }> = [
      { mul: 1, amp: 0.72, dur: 1.45 },
      { mul: 2.01, amp: 0.28, dur: 0.85 },
      { mul: 2.76, amp: 0.14, dur: 0.45 },
    ];

    for (const harm of osilators) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(nada.frekuensiHz * harm.mul, t);
      g.gain.setValueAtTime(harm.amp, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + harm.dur);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + harm.dur + 0.05);
    }
  }

  public bunyikanGongAgeng(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, t);
    master.gain.exponentialRampToValueAtTime(0.32, t + 0.08);
    master.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
    master.connect(ctx.destination);

    const carrier = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(68, t);
    carrier.frequency.exponentialRampToValueAtTime(64, t + 2.8);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(3.2, t);
    lfoGain.gain.setValueAtTime(4.5, t);
    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    carrier.connect(master);
    carrier.start(t);
    lfo.start(t);
    carrier.stop(t + 3.3);
    lfo.stop(t + 3.3);
  }

  public bunyikanCempalaKeprak(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const ketukan = [0, 0.095];
    for (const offset of ketukan) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, t + offset);
      osc.frequency.exponentialRampToValueAtTime(210, t + offset + 0.06);

      gain.gain.setValueAtTime(0.24, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.09);
    }
  }

  public bunyikanHunusKeris(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(1480, t + 0.28);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(980, t);
    filter.Q.setValueAtTime(6.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.58);
  }

  public bunyikanCantingMalam(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(760, t);
    osc.frequency.exponentialRampToValueAtTime(1180, t + 0.09);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  public bunyikanKetukKayuJoglo(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185, t);
    osc.frequency.exponentialRampToValueAtTime(92, t + 0.14);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public bunyikanLesatanPanah(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.28);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public toggleSuasanaPendopo(): boolean {
    if (this.suaraAmbientAktif) {
      this.hentikanSuasanaPendopo();
      return false;
    }

    if (!this.aktif) {
      this.aturAktif(true);
    }

    const pola = [0, 2, 4, 3, 2, 5, 4, 1];
    let step = 0;
    this.suaraAmbientAktif = true;

    const mainStep = () => {
      if (!this.suaraAmbientAktif || !this.aktif) return;
      const nadaIdx = pola[step % pola.length];
      this.bunyikanWilahSaron(nadaIdx, 0.12);
      if (step % 8 === 0) {
        this.bunyikanGongAgeng();
      }
      step++;
    };

    mainStep();
    if (typeof window !== 'undefined') {
      this.timerAmbient = window.setInterval(mainStep, 920);
    }
    return true;
  }

  public hentikanSuasanaPendopo(): void {
    this.suaraAmbientAktif = false;
    if (this.timerAmbient !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerAmbient);
      this.timerAmbient = null;
    }
  }
}

export const audioBudaya = new MesinAudioBudaya();
