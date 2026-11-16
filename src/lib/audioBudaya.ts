import {
  REPERTOAR_GENDING_JAWA,
  ambilFrekuensiNada,
  cariGendingById,
  type GendingBudaya,
  type GendingId,
  type KetukanBalungan,
} from './gendingJawa.ts';

export interface NadaSlendro {
  angka: string;
  namaJawa: string;
  frekuensiHz: number;
}

export const NADA_SARON_SLENDRO: NadaSlendro[] = [
  { angka: '1', namaJawa: 'Ji (Barang / Panunggul)', frekuensiHz: 261.63 },
  { angka: '2', namaJawa: 'Ro (Gulu)', frekuensiHz: 299.1 },
  { angka: '3', namaJawa: 'Lu (Dhadha)', frekuensiHz: 344.2 },
  { angka: '5', namaJawa: 'Ma (Lima)', frekuensiHz: 398.5 },
  { angka: '6', namaJawa: 'Nem (Nem)', frekuensiHz: 454.8 },
  { angka: 'i', namaJawa: 'Ji Alit (Barang Luhur)', frekuensiHz: 523.25 },
];

export interface StatusGendingRealtime {
  aktif: boolean;
  suasanaAktif: boolean;
  gendingId: GendingId;
  stepIdx: number;
  totalSteps: number;
  isGong: boolean;
  isKenong: boolean;
  nadanya: string;
  redupNarasi: boolean;
}

class MesinAudioBudaya {
  private ctx: AudioContext | null = null;
  private busUtama: GainNode | null = null;
  private busLatar: GainNode | null = null;
  private busReverb: GainNode | null = null;
  private aktif = false;
  private suaraAmbientAktif = false;
  private redupNarasi = false;
  private timerAmbient: number | null = null;
  private gendingAktifId: GendingId = 'puspawarna';
  private stepSaatIni = 0;
  private statusListeners = new Set<(st: StatusGendingRealtime) => void>();

  public statusAktif(): boolean {
    return this.aktif;
  }

  public statusSuasana(): boolean {
    return this.suaraAmbientAktif;
  }

  public ambilGendingAktif(): GendingId {
    return this.gendingAktifId;
  }

  public ambilDaftarRepertoar(): GendingBudaya[] {
    return REPERTOAR_GENDING_JAWA;
  }

  public ambilStatusRealtime(): StatusGendingRealtime {
    const g = cariGendingById(this.gendingAktifId);
    const total = Math.max(1, g.balungan.length);
    const idx = ((this.stepSaatIni % total) + total) % total;
    const ketuk = g.balungan[idx];
    return {
      aktif: this.aktif,
      suasanaAktif: this.suaraAmbientAktif,
      gendingId: this.gendingAktifId,
      stepIdx: idx,
      totalSteps: total,
      isGong: Boolean(ketuk?.gong),
      isKenong: Boolean(ketuk?.kenong),
      nadanya: ketuk?.nada ?? '.',
      redupNarasi: this.redupNarasi,
    };
  }

  public berlanggananStatus(cb: (st: StatusGendingRealtime) => void): () => void {
    this.statusListeners.add(cb);
    cb(this.ambilStatusRealtime());
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  private kabariListeners(ketukAktif?: KetukanBalungan): void {
    const base = this.ambilStatusRealtime();
    const payload: StatusGendingRealtime = ketukAktif
      ? {
          ...base,
          isGong: Boolean(ketukAktif.gong),
          isKenong: Boolean(ketukAktif.kenong),
          nadanya: ketukAktif.nada,
        }
      : base;
    for (const cb of this.statusListeners) {
      cb(payload);
    }
  }

  private bangunBusPendopo(ctx: AudioContext): void {
    if (this.busUtama && this.busLatar) return;

    const utama = ctx.createGain();
    utama.gain.setValueAtTime(0.95, ctx.currentTime);

    const latar = ctx.createGain();
    latar.gain.setValueAtTime(this.redupNarasi ? 0.34 : 0.92, ctx.currentTime);

    try {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-20, ctx.currentTime);
      comp.knee.setValueAtTime(14, ctx.currentTime);
      comp.ratio.setValueAtTime(3.0, ctx.currentTime);
      comp.attack.setValueAtTime(0.008, ctx.currentTime);
      comp.release.setValueAtTime(0.24, ctx.currentTime);

      const reverbSend = ctx.createGain();
      reverbSend.gain.setValueAtTime(0.32, ctx.currentTime);

      // Ruang akustik kayu Pendopo prosedural (1.9 detik ekor gema hangat)
      const convolver = ctx.createConvolver();
      const rate = ctx.sampleRate || 44100;
      const len = Math.floor(rate * 1.85);
      const impulse = ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
          const decay = Math.pow(1 - i / len, 2.75);
          const rawNoise = (Math.random() * 2 - 1) * decay;
          lp = lp * 0.72 + rawNoise * 0.28;
          data[i] = lp * 0.55;
        }
      }
      convolver.buffer = impulse;

      latar.connect(utama);
      latar.connect(reverbSend);
      reverbSend.connect(convolver);
      convolver.connect(comp);
      utama.connect(comp);
      comp.connect(ctx.destination);
      this.busReverb = reverbSend;
    } catch {
      latar.connect(utama);
      utama.connect(ctx.destination);
    }

    this.busUtama = utama;
    this.busLatar = latar;
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
    this.bangunBusPendopo(this.ctx);
    return this.ctx;
  }

  private tujuanUtama(ctx: AudioContext): AudioNode {
    return this.busUtama ?? ctx.destination;
  }

  private tujuanLatar(ctx: AudioContext): AudioNode {
    return this.busLatar ?? this.tujuanUtama(ctx);
  }

  public aturAktif(nyala: boolean): void {
    this.aktif = nyala;
    if (!nyala) {
      this.hentikanSuasanaPendopo();
    } else {
      this.kabariListeners();
    }
  }

  /**
   * Meredupkan volume Gending latar secara halus saat narator AI berbicara, lalu memulihkannya.
   */
  public aturVolumeLatar(redupUntukNarasi: boolean): void {
    this.redupNarasi = redupUntukNarasi;
    if (this.ctx && this.busLatar) {
      const target = redupUntukNarasi ? 0.34 : 0.92;
      const t = this.ctx.currentTime;
      this.busLatar.gain.cancelScheduledValues(t);
      this.busLatar.gain.setTargetAtTime(target, t, 0.16);
    }
    this.kabariListeners();
  }

  /**
   * Memainkan wilah Saron Barung berpasangan (pengumbang + pengisep ombak ±5.5 cents).
   */
  public bunyikanWilahSaron(
    indeksNadaOrFreq: number,
    amplitudo = 0.28,
    langsungKeLatar = false,
  ): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;

    const freq =
      indeksNadaOrFreq >= 80
        ? indeksNadaOrFreq
        : NADA_SARON_SLENDRO[Math.abs(indeksNadaOrFreq) % NADA_SARON_SLENDRO.length].frekuensiHz;

    this.sintesisWilahGangsa(ctx, freq, amplitudo, 1.55, langsungKeLatar ? 'latar' : 'utama', true);
  }

  private sintesisWilahGangsa(
    ctx: AudioContext,
    freq: number,
    amplitudo: number,
    durasiDetik: number,
    jalur: 'utama' | 'latar',
    ombakPasangan = true,
  ): void {
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0008, t);
    master.gain.exponentialRampToValueAtTime(amplitudo, t + 0.009);
    master.gain.exponentialRampToValueAtTime(0.0008, t + durasiDetik);
    master.connect(jalur === 'latar' ? this.tujuanLatar(ctx) : this.tujuanUtama(ctx));

    // Harmonik bilah perunggu gangsa Saron/Demung/Peking
    const partials: Array<{ mul: number; amp: number; dur: number; detune?: number }> = [
      { mul: 1, amp: 0.78, dur: durasiDetik, detune: ombakPasangan ? 5.5 : 0 },
      ...(ombakPasangan ? [{ mul: 1, amp: 0.42, dur: durasiDetik * 0.96, detune: -5.5 }] : []),
      { mul: 2.008, amp: 0.3, dur: durasiDetik * 0.56 },
      { mul: 2.756, amp: 0.14, dur: durasiDetik * 0.28 },
    ];

    for (const h of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.mul, t);
      if (h.detune) osc.detune.setValueAtTime(h.detune, t);
      g.gain.setValueAtTime(h.amp, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + h.dur);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + h.dur + 0.04);
    }
  }

  private bunyikanDemung(freq: number, amplitudo = 0.28): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    this.sintesisWilahGangsa(ctx, freq * 0.5, amplitudo, 1.9, 'latar', false);
  }

  private bunyikanPeking(freq: number, offsetDetik: number, amplitudo = 0.13): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime + offsetDetik;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0008, t);
    master.gain.exponentialRampToValueAtTime(amplitudo, t + 0.006);
    master.gain.exponentialRampToValueAtTime(0.0008, t + 0.7);
    master.connect(this.tujuanLatar(ctx));

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc.type = 'sine';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2, t);
    osc2.frequency.setValueAtTime(freq * 4.02, t);

    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.24, t);
    g2.gain.exponentialRampToValueAtTime(0.0008, t + 0.35);

    osc.connect(master);
    osc2.connect(g2);
    g2.connect(master);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.74);
    osc2.stop(t + 0.38);
  }

  private bunyikanGender(freq: number, amplitudo = 0.15): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0008, t);
    master.gain.exponentialRampToValueAtTime(amplitudo, t + 0.045);
    master.gain.exponentialRampToValueAtTime(0.0008, t + 2.35);
    master.connect(filter);
    filter.connect(this.tujuanLatar(ctx));

    // Dua bilah Gender lembut bersautan interval kempyung
    for (const rasio of [1, 1.498]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * rasio, t);
      osc.connect(master);
      osc.start(t);
      osc.stop(t + 2.4);
    }
  }

  private bunyikanKenongAtauKempul(jenis: 'kenong' | 'kempul', freq: number): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;
    const isKenong = jenis === 'kenong';
    const targetFreq = isKenong ? freq * 1.498 : freq * 0.5;
    const dur = isKenong ? 2.1 : 2.55;
    const amp = isKenong ? 0.25 : 0.29;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0008, t);
    master.gain.exponentialRampToValueAtTime(amp, t + (isKenong ? 0.015 : 0.04));
    master.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    master.connect(this.tujuanLatar(ctx));

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(isKenong ? targetFreq : targetFreq * 0.96, t);
    if (!isKenong) {
      o1.frequency.exponentialRampToValueAtTime(targetFreq, t + 0.14);
    }
    o2.frequency.setValueAtTime(targetFreq * 2.005, t);

    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.28, t);
    g2.gain.exponentialRampToValueAtTime(0.0008, t + dur * 0.45);

    o1.connect(master);
    o2.connect(g2);
    g2.connect(master);
    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur * 0.5);
  }

  private bunyikanKethuk(): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.11, t);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.18);
    gain.connect(this.tujuanLatar(ctx));

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(412, t);
    osc.frequency.exponentialRampToValueAtTime(362, t + 0.12);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private bunyikanKendhang(pukulan: 'dhung' | 'tak'): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const gain = ctx.createGain();
    const osc = ctx.createOscillator();

    if (pukulan === 'dhung') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(126, t);
      osc.frequency.exponentialRampToValueAtTime(72, t + 0.14);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(240, t + 0.05);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
    }

    osc.connect(gain);
    gain.connect(this.tujuanLatar(ctx));
    osc.start(t);
    osc.stop(t + 0.22);
  }

  public bunyikanGongAgeng(keLatar = false): void {
    const ctx = this.pastikanKonteks();
    if (!ctx) return;
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, t);
    master.gain.exponentialRampToValueAtTime(0.42, t + 0.09);
    master.gain.exponentialRampToValueAtTime(0.0008, t + 4.3);
    master.connect(keLatar ? this.tujuanLatar(ctx) : this.tujuanUtama(ctx));

    // Dua osilator Gong Agung untuk menghasilkan efek ombak alami gamelan Jawa (~2.2 Hz)
    const gongA = ctx.createOscillator();
    const gongB = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();

    gongA.type = 'sine';
    gongB.type = 'sine';
    harm.type = 'sine';

    gongA.frequency.setValueAtTime(58.0, t);
    gongA.frequency.exponentialRampToValueAtTime(54.8, t + 3.6);
    gongB.frequency.setValueAtTime(60.2, t);
    gongB.frequency.exponentialRampToValueAtTime(57.0, t + 3.6);
    harm.frequency.setValueAtTime(114.0, t);

    harmGain.gain.setValueAtTime(0.26, t);
    harmGain.gain.exponentialRampToValueAtTime(0.0008, t + 1.8);

    gongA.connect(master);
    gongB.connect(master);
    harm.connect(harmGain);
    harmGain.connect(master);

    gongA.start(t);
    gongB.start(t);
    harm.start(t);
    gongA.stop(t + 4.4);
    gongB.stop(t + 4.4);
    harm.stop(t + 1.9);
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
      gain.connect(this.tujuanUtama(ctx));
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
    gain.connect(this.tujuanUtama(ctx));
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
    gain.connect(this.tujuanUtama(ctx));
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
    gain.connect(this.tujuanUtama(ctx));
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
    gain.connect(this.tujuanUtama(ctx));
    osc.start(t);
    osc.stop(t + 0.36);
  }

  /** Mengganti repertoar Gending Jawa klasik dan langsung memainkannya jika suasana aktif. */
  public pilihGending(id: GendingId, putarOtomatis = true): GendingBudaya {
    const gending = cariGendingById(id);
    this.gendingAktifId = gending.id;
    this.stepSaatIni = 0;

    if (this.suaraAmbientAktif || putarOtomatis) {
      this.mulaiSuasanaPendopo(gending.id);
    } else {
      this.kabariListeners();
    }
    return gending;
  }

  /** Memulai pemutaran ensembel Gamelan Jawa terstruktur berbasis notasi Kepatihan. */
  public mulaiSuasanaPendopo(idPilihan?: GendingId): boolean {
    if (idPilihan) {
      this.gendingAktifId = cariGendingById(idPilihan).id;
    }
    if (!this.aktif) {
      this.aktif = true;
    }
    if (this.timerAmbient !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerAmbient);
      this.timerAmbient = null;
    }

    const gending = cariGendingById(this.gendingAktifId);
    this.stepSaatIni = 0;
    this.suaraAmbientAktif = true;
    let nadaTerakhirHz = ambilFrekuensiNada(gending.laras, '6,') ?? 227.4;

    const mainStep = () => {
      if (!this.suaraAmbientAktif || !this.aktif) return;
      const gAktif = cariGendingById(this.gendingAktifId);
      const total = gAktif.balungan.length;
      const idx = this.stepSaatIni % total;
      const ketuk = gAktif.balungan[idx];
      const freq = ambilFrekuensiNada(gAktif.laras, ketuk.nada);

      // Profil dinamika instrumen menyesuaikan suasana gending
      const mood = gAktif.suasana;
      const ampDemung = mood === 'hening' ? 0.19 : mood === 'semarak' ? 0.27 : 0.24;
      const ampSaron = mood === 'hening' ? 0.21 : mood === 'semarak' ? 0.31 : 0.27;
      const ampGender = mood === 'hening' ? 0.17 : mood === 'hangat' ? 0.16 : 0.13;
      const ampPeking = mood === 'hening' ? 0.08 : mood === 'semarak' ? 0.13 : 0.11;

      if (freq !== null) {
        nadaTerakhirHz = freq;
        // Demung + Saron Barung membawakan balungan sejati
        this.bunyikanDemung(freq, ampDemung);
        this.bunyikanWilahSaron(freq, ampSaron, true);

        // Gender mengalunkan nada kempyung di ketukan aksen gatra
        if (idx % 2 === 1 || mood === 'hening') {
          this.bunyikanGender(freq, ampGender);
        }

        // Peking menyahut setengah keteg berikutnya untuk ornamen cacah halus
        this.bunyikanPeking(freq, (gAktif.tempoMs / 1000) * 0.5, ampPeking);
      } else if (idx % 4 === 0) {
        // Pada jeda pin (.), Gender lembut mengisi ruang hening secara musikal
        this.bunyikanGender(nadaTerakhirHz, ampGender * 0.9);
      }

      // Struktur Kolotomi Karawitan Baku
      if (ketuk.kethuk) this.bunyikanKethuk();
      if (mood === 'hening') {
        if (idx % 8 === 0) this.bunyikanKendhang('dhung');
      } else if (mood === 'semarak') {
        if (idx % 2 === 0) this.bunyikanKendhang(idx % 4 === 0 ? 'dhung' : 'tak');
      } else {
        if (idx % 4 === 0) this.bunyikanKendhang('dhung');
        else if (idx % 4 === 2) this.bunyikanKendhang('tak');
      }
      if (ketuk.kempul) this.bunyikanKenongAtauKempul('kempul', nadaTerakhirHz);
      if (ketuk.kenong) this.bunyikanKenongAtauKempul('kenong', nadaTerakhirHz);
      if (ketuk.gong) this.bunyikanGongAgeng(true);

      this.kabariListeners(ketuk);
      this.stepSaatIni = (idx + 1) % total;
    };

    mainStep();
    if (typeof window !== 'undefined') {
      this.timerAmbient = window.setInterval(mainStep, gending.tempoMs);
    }
    return true;
  }

  public toggleSuasanaPendopo(): boolean {
    if (this.suaraAmbientAktif) {
      this.hentikanSuasanaPendopo();
      return false;
    }
    return this.mulaiSuasanaPendopo();
  }

  public hentikanSuasanaPendopo(): void {
    this.suaraAmbientAktif = false;
    if (this.timerAmbient !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerAmbient);
      this.timerAmbient = null;
    }
    this.kabariListeners();
  }
}

export const audioBudaya = new MesinAudioBudaya();
