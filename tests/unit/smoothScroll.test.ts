import { describe, expect, it } from 'vitest';
import { langkahLerpEksponensial, normalisasiDeltaWheel } from '../../src/lib/smoothScroll.ts';

describe('Utilitas Smooth Scroll KELIR', () => {
  it('menormalisasi deltaMode pixel, line, dan page secara konsisten serta membatasi lonjakan ekstrem', () => {
    expect(normalisasiDeltaWheel(120, 0, 900)).toBe(120);
    expect(normalisasiDeltaWheel(3, 1, 900)).toBe(108);
    expect(normalisasiDeltaWheel(1, 2, 1000)).toBe(360);
    expect(normalisasiDeltaWheel(-900, 0, 900)).toBe(-360);
  });

  it('menghitung interpolasi eksponensial yang konvergen mulus menuju target', () => {
    let pos = 0;
    const target = 600;
    for (let i = 0; i < 35; i++) {
      pos = langkahLerpEksponensial(pos, target, 10.5, 1 / 60);
    }
    expect(pos).toBeGreaterThan(595);
    expect(pos).toBeLessThanOrEqual(600);
  });
});
