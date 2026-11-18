import { describe, expect, it } from 'vitest';
import type { FrameTangan, JenisGestur, TanganTerdeteksi } from '../../src/lib/handTracker.ts';
import { EvaluatorGesturSaron, SARON_WILAH_X } from '../../src/lib/saronGestur.ts';

function buatTangan(overrides: Partial<TanganTerdeteksi> = {}): TanganTerdeteksi {
  const x = overrides.telunjukX ?? overrides.pusatX ?? 0.5;
  const y = overrides.telunjukY ?? overrides.pusatY ?? 0.35;
  return {
    pusatX: x,
    pusatY: y,
    telunjukX: x,
    telunjukY: y,
    jarakCubit: 0.14,
    kemiringan: -Math.PI / 2,
    gestur: 'terbuka',
    jumlahJariTerangkat: 4,
    ...overrides,
  };
}

function buatFrame(
  tanganUtama: TanganTerdeteksi | null,
  waktuMs: number,
  tanganKiri: TanganTerdeteksi | null = null,
): FrameTangan {
  const jumlahTangan = (tanganUtama ? 1 : 0) + (tanganKiri ? 1 : 0);
  return {
    jumlahTangan,
    tanganKanan: tanganUtama,
    tanganKiri,
    tanganUtama,
    waktuMs,
  };
}

describe('EvaluatorGesturSaron (Gestur 3D Saron Slendro)', () => {
  it('menyediakan 6 koordinat wilah Slendro simetris dan pose istirahat saat tanpa tangan', () => {
    expect(SARON_WILAH_X).toEqual([-0.875, -0.525, -0.175, 0.175, 0.525, 0.875]);
    const evalSaron = new EvaluatorGesturSaron();
    const hasil = evalSaron.prosesFrame({
      jumlahTangan: 0,
      tanganKanan: null,
      tanganKiri: null,
      tanganUtama: null,
      waktuMs: 100,
    });
    expect(hasil.aktif).toBe(false);
    expect(hasil.hoverWilahIdx).toBeNull();
    expect(hasil.pukulWilahIdx).toBeNull();
    expect(hasil.malletPos).toEqual([0.76, 0.305, 0.02]);
    expect(hasil.saronYawY).toBe(0);
    expect(hasil.saronPitchX).toBe(0);
  });

  it('memetakan posisi tangan kiri-kanan dan tinggi Y ke wilah 0..5 dan koordinat Tabuh Gandhen 1:1', () => {
    const posisiWilah = [0.14, 0.28, 0.43, 0.57, 0.72, 0.86];
    const evalSaron = new EvaluatorGesturSaron();
    let t = 1000;

    posisiWilah.forEach((normX, expectedIdx) => {
      evalSaron.reset();
      const hasil = evalSaron.prosesFrame(
        buatFrame(buatTangan({ telunjukX: normX, pusatX: normX, telunjukY: 0.3, pusatY: 0.3 }), t),
      );
      t += 20;
      expect(hasil.aktif).toBe(true);
      expect(hasil.hoverWilahIdx).toBe(expectedIdx);
    });

    evalSaron.reset();
    const kiriAtas = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.14, pusatX: 0.14, telunjukY: 0.18, pusatY: 0.18, kemiringan: -1.1 }), 1200),
    );
    expect(kiriAtas.malletPos[0]).toBeCloseTo(-0.875, 3);
    expect(kiriAtas.malletPos[1]).toBeCloseTo(0.82, 3);

    evalSaron.reset();
    const kananTengahRendah = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.86, pusatX: 0.86, telunjukY: 0.56, pusatY: 0.56, kemiringan: -2.0 }), 1260),
    );
    expect(kananTengahRendah.pukulWilahIdx).toBeNull();
    expect(kananTengahRendah.malletPos[0]).toBeCloseTo(0.875, 3);
    expect(kananTengahRendah.malletPos[1]).toBeCloseTo(0.82 - ((0.56 - 0.18) / (0.76 - 0.18)) * 0.49, 3);
    expect(kananTengahRendah.malletTiltZ).toBeLessThan(kiriAtas.malletTiltZ);

    const kananPukulBawah = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.86, pusatX: 0.86, telunjukY: 0.76, pusatY: 0.76 }), 1320),
    );
    expect(kananPukulBawah.pukulWilahIdx).toBe(5);
    expect(kananPukulBawah.malletPos[1]).toBeCloseTo(0.305, 3);
  });

  it('menghasilkan pukulWilahIdx dan amplitudo lebih kuat saat ayunan turun cepat', () => {
    const evalSaron = new EvaluatorGesturSaron();
    evalSaron.prosesFrame(buatFrame(buatTangan({ telunjukX: 0.57, pusatX: 0.57, telunjukY: 0.24, pusatY: 0.24 }), 1000));
    const ayunCepat = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.57, pusatX: 0.57, telunjukY: 0.62, pusatY: 0.62 }), 1040),
    );

    expect(ayunCepat.pukulWilahIdx).toBe(3);
    expect(ayunCepat.amplitudoPukul).toBeGreaterThan(0.32);
    expect(ayunCepat.malletPos[0]).toBeCloseTo(SARON_WILAH_X[3], 4);
    expect(ayunCepat.malletTiltX).toBeCloseTo(0.34, 4);
  });

  it('memicu pukulan sekali saat transisi gestur cubit atau kepal tanpa mengulang terus saat ditahan', () => {
    const evalSaron = new EvaluatorGesturSaron();
    evalSaron.prosesFrame(buatFrame(buatTangan({ telunjukX: 0.43, pusatX: 0.43, telunjukY: 0.34, pusatY: 0.34, gestur: 'terbuka' }), 1000));

    const cubit = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.43, pusatX: 0.43, telunjukY: 0.34, pusatY: 0.34, gestur: 'cubit' }), 1160),
    );
    expect(cubit.pukulWilahIdx).toBe(2);

    const tahanCubit = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.43, pusatX: 0.43, telunjukY: 0.34, pusatY: 0.34, gestur: 'cubit' }), 1340),
    );
    expect(tahanCubit.pukulWilahIdx).toBeNull();

    const kepal = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.72, pusatX: 0.72, telunjukY: 0.34, pusatY: 0.34, gestur: 'kepal' as JenisGestur }), 1520),
    );
    expect(kepal.pukulWilahIdx).not.toBeNull();
  });

  it('mendukung pukulan bidang bawah, glissando horizontal, cooldown anti-chatter, dan orientasi dua tangan', () => {
    const evalSaron = new EvaluatorGesturSaron();
    evalSaron.prosesFrame(buatFrame(buatTangan({ telunjukX: 0.28, pusatX: 0.28, telunjukY: 0.42, pusatY: 0.42 }), 1000));

    const masukBawah = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.28, pusatX: 0.28, telunjukY: 0.72, pusatY: 0.72 }), 1180),
    );
    expect(masukBawah.pukulWilahIdx).toBe(1);

    const terlaluCepat = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.43, pusatX: 0.43, telunjukY: 0.72, pusatY: 0.72 }), 1220),
    );
    expect(terlaluCepat.pukulWilahIdx).toBeNull();

    const sapuanWilah2 = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.58, pusatX: 0.58, telunjukY: 0.72, pusatY: 0.72 }), 1340),
    );
    expect(sapuanWilah2.pukulWilahIdx).toBe(2);

    let sapuanWilah3 = sapuanWilah2;
    for (let step = 1; step <= 4; step++) {
      sapuanWilah3 = evalSaron.prosesFrame(
        buatFrame(buatTangan({ telunjukX: 0.62, pusatX: 0.62, telunjukY: 0.72, pusatY: 0.72 }), 1340 + step * 150),
      );
      if (sapuanWilah3.pukulWilahIdx !== null) break;
    }
    expect(sapuanWilah3.pukulWilahIdx).toBe(3);

    const kiri = buatTangan({ pusatX: 0.22, telunjukX: 0.22, pusatY: 0.38, telunjukY: 0.38 });
    const kanan = buatTangan({ pusatX: 0.65, telunjukX: 0.65, pusatY: 0.35, telunjukY: 0.35 });
    const duaTangan = evalSaron.prosesFrame(buatFrame(kanan, 2100, kiri));
    expect(duaTangan.saronYawY).toBeCloseTo((0.22 - 0.32) * 0.72, 4);
    expect(duaTangan.saronPitchX).toBeCloseTo((0.38 - 0.5) * 0.42, 4);

    evalSaron.reset();
    const pascaReset = evalSaron.prosesFrame(
      buatFrame(buatTangan({ telunjukX: 0.86, pusatX: 0.86, telunjukY: 0.3, pusatY: 0.3, gestur: 'terbuka' }), 1600),
    );
    expect(pascaReset.hoverWilahIdx).toBe(5);
    expect(pascaReset.pukulWilahIdx).toBeNull();
  });
});
