import { describe, expect, it } from 'vitest';
import type { FrameTangan, TanganTerdeteksi } from '../../src/lib/handTracker.ts';
import { EvaluatorGesturPakeliran } from '../../src/lib/pakeliranGestur.ts';

function buatTanganPakeliran(overrides: Partial<TanganTerdeteksi> = {}): TanganTerdeteksi {
  const pusatX = overrides.pusatX ?? 0.5;
  const pusatY = overrides.pusatY ?? 0.48;
  return {
    pusatX,
    pusatY,
    telunjukX: pusatX,
    telunjukY: pusatY - 0.14,
    jarakCubit: 0.12,
    kemiringan: -Math.PI / 2,
    gestur: 'terbuka',
    jumlahJariTerangkat: 4,
    ...overrides,
  };
}

function buatFramePakeliran(
  tanganKanan: TanganTerdeteksi | null,
  waktuMs: number,
  tanganKiri: TanganTerdeteksi | null = null,
): FrameTangan {
  const tanganUtama = tanganKanan ?? tanganKiri;
  const jumlahTangan = (tanganKanan ? 1 : 0) + (tanganKiri ? 1 : 0);
  return {
    jumlahTangan,
    tanganKanan,
    tanganKiri,
    tanganUtama,
    waktuMs,
  };
}

describe('EvaluatorGesturPakeliran (Koreografi Dalang 3D Multi-Sumbu)', () => {
  it('mengembalikan pose diam ketika kamera tidak mendeteksi tangan', () => {
    const ev = new EvaluatorGesturPakeliran();
    const hasil = ev.prosesFrame({
      jumlahTangan: 0,
      tanganKanan: null,
      tanganKiri: null,
      tanganUtama: null,
      waktuMs: 100,
    });

    expect(hasil.aktif).toBe(false);
    expect(hasil.jumlahTangan).toBe(0);
    expect(hasil.modeKontrol).toBe('nonaktif');
    expect(hasil.picuSabetan).toBe(false);
    expect(hasil.picuPanah).toBe(false);
    expect(hasil.tarikBusur).toBe(0);
  });

  it('memetakan 1 tangan ke gerak X, elevasi Y solah, kedalaman Z Blencong, dan kemiringan badan', () => {
    const ev = new EvaluatorGesturPakeliran();

    // Tangan kanan agak ke atas, tangan dekat kamera (telunjuk lebih jauh dari telapak), pergelangan miring
    const tinggiDekat = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({
          pusatX: 0.72,
          pusatY: 0.18,
          telunjukX: 0.72,
          telunjukY: 0.18 - 0.24,
          kemiringan: -Math.PI / 2 + 0.45,
          jumlahJariTerangkat: 5,
        }),
        1000,
      ),
    );

    ev.reset();
    // Tangan di kiri, posisi rendah (tancep gedebog), jauh dari Blencong (dekat kelir)
    const rendahJauh = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({
          pusatX: 0.24,
          pusatY: 0.78,
          telunjukX: 0.24,
          telunjukY: 0.78 - 0.08,
          kemiringan: -Math.PI / 2 - 0.45,
          jumlahJariTerangkat: 1,
          gestur: 'tunjuk',
        }),
        1200,
      ),
    );

    expect(tinggiDekat.aktif).toBe(true);
    expect(tinggiDekat.modeKontrol).toBe('satu-tangan');
    expect(tinggiDekat.ramaPosNorm).toBeGreaterThan(0.25);
    expect(rendahJauh.ramaPosNorm).toBeLessThan(-0.25);
    expect(tinggiDekat.ramaLiftY).toBeGreaterThan(rendahJauh.ramaLiftY);
    expect(tinggiDekat.ramaZ).toBeGreaterThan(rendahJauh.ramaZ);
    expect(tinggiDekat.ramaTiltZ).toBeGreaterThan(0.05);
    expect(rendahJauh.ramaTiltZ).toBeLessThan(-0.05);
  });

  it('mendukung kontrol independen 2 tangan untuk Sri Rama dan Kidang Kencana sekaligus walikan yaw', () => {
    const ev = new EvaluatorGesturPakeliran();
    const kanan = buatTanganPakeliran({
      pusatX: 0.22,
      pusatY: 0.25,
      telunjukX: 0.22,
      telunjukY: 0.25 - 0.18,
      gestur: 'terbuka',
    });
    const kiri = buatTanganPakeliran({
      pusatX: 0.76,
      pusatY: 0.2,
      telunjukX: 0.76,
      telunjukY: 0.2 - 0.22,
      kemiringan: -Math.PI / 2 - 0.35,
      gestur: 'tunjuk',
      jumlahJariTerangkat: 1,
    });

    const dual = ev.prosesFrame(buatFramePakeliran(kanan, 2000, kiri));
    expect(dual.modeKontrol).toBe('dua-tangan');
    expect(dual.jumlahTangan).toBe(2);
    // Sri Rama berada di kiri Kidang -> yaw melakukan walikan ~ Math.PI menghadap ke kanan
    expect(dual.ramaPosNorm).toBeLessThan(dual.kidangPosNorm);
    expect(Math.abs(dual.ramaYawY - Math.PI)).toBeLessThan(0.6);
    expect(dual.kidangLiftY).toBeGreaterThan(0.1);
    expect(dual.kidangEarPerk).toBeGreaterThan(0.3);
  });

  it('menarik tali busur pada gestur cubit dan memicu panah & sabetan dengan cooldown', () => {
    const ev = new EvaluatorGesturPakeliran();
    ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({ gestur: 'terbuka', jarakCubit: 0.11 }),
        1000,
      ),
    );

    const cubit1 = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({ gestur: 'cubit', jarakCubit: 0.032 }),
        1100,
      ),
    );
    expect(cubit1.picuPanah).toBe(true);
    expect(cubit1.tarikBusur).toBeGreaterThan(0.75);
    expect(cubit1.aksiLabel).toBe('panah');

    // Frame berurutan dengan cubit tetap ditahan tidak memicu panah berulang
    const cubitHold = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({ gestur: 'cubit', jarakCubit: 0.03 }),
        1180,
      ),
    );
    expect(cubitHold.picuPanah).toBe(false);
    expect(cubitHold.aksiLabel).toBe('bidik');

    // Gestur 2 jari menggerakkan Gunungan Kayon dan lengan tuding belakang
    const kayon = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({
          gestur: 'dua-jari',
          jumlahJariTerangkat: 2,
          kemiringan: -Math.PI / 2 + 0.5,
        }),
        1400,
      ),
    );
    expect(kayon.aksiLabel).toBe('kayon');
    expect(kayon.ramaLenganKiriZ).toBeGreaterThan(0.75);

    // Gestur mengepal memicu Sabetan Dalang + Cempala-Kepyak dengan cooldown
    const kepal = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({ gestur: 'kepal', jumlahJariTerangkat: 0 }),
        1600,
      ),
    );
    expect(kepal.picuSabetan).toBe(true);
    expect(kepal.aksiLabel).toBe('sabetan');

    const kepalHold = ev.prosesFrame(
      buatFramePakeliran(
        buatTanganPakeliran({ gestur: 'kepal', jumlahJariTerangkat: 0 }),
        1700,
      ),
    );
    expect(kepalHold.picuSabetan).toBe(false);
  });

  it('menyinkronkan posisi awal per babak dan mereset state dengan bersih', () => {
    const ev = new EvaluatorGesturPakeliran();
    ev.sinkronkanPosisiAwal(0.34, -0.34);
    const rest = ev.prosesFrame(buatFramePakeliran(null, 500));
    expect(rest.ramaPosNorm).toBeCloseTo(0.34, 3);
    expect(rest.kidangPosNorm).toBeCloseTo(-0.34, 3);

    ev.reset();
    const afterReset = ev.prosesFrame(buatFramePakeliran(null, 600));
    expect(afterReset.ramaPosNorm).toBeCloseTo(0.46, 3);
    expect(afterReset.kidangPosNorm).toBeCloseTo(-0.58, 3);
  });
});
