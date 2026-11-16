import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MODEL_AI_PAMOMONG, jawabDariKurasiLokal } from '../../src/lib/tanya.ts';
import {
  bersihkanCachePamomongLive,
  MODEL_GEMINI_TETAP,
  bacaKonfigurasiGemini,
  jawabDenganGemini38Flash,
  type LiveClientLike,
} from '../../src/server/pamomongGemini.ts';

describe('Integrasi Otomatis Model Unlimited Gemini 3.8 Live (gemini-3.8-live)', () => {
  beforeEach(() => {
    bersihkanCachePamomongLive();
  });

  it('mengunci model AI secara otomatis dan eksklusif ke gemini-3.8-live (Unlimited RPM/RPD)', () => {
    expect(MODEL_AI_PAMOMONG).toBe('gemini-3.8-live');
    expect(MODEL_GEMINI_TETAP).toBe('gemini-3.8-live');

    const konfLegacy = bacaKonfigurasiGemini({
      GEMINI_API_KEY: 'dummy-key',
      GEMINI_MODEL: 'gemini-3.8-flash',
    });
    expect(konfLegacy.model).toBe('gemini-3.8-live');

    const konfOther = bacaKonfigurasiGemini({
      GEMINI_API_KEY: 'dummy-key',
      GEMINI_MODEL: 'gemini-2.5-flash',
    });
    expect(konfOther.model).toBe('gemini-3.8-live');
  });

  it('memanggil Live API WebSocket tepat dengan model gemini-3.8-live dan merangkum transkrip S1-S7', async () => {
    const closeSpy = vi.fn();
    const sendSpy = vi.fn();
    let capturedModel = '';

    const liveFake: LiveClientLike = {
      live: {
        connect: vi.fn(async (params) => {
          capturedModel = String(params.model);
          return {
            sendRealtimeInput: (...args: unknown[]) => {
              sendSpy(...args);
              queueMicrotask(() => {
                params.callbacks.onmessage?.({
                  serverContent: {
                    outputTranscription: {
                      text: 'Konstruksi Joglo mengandalkan sambungan pasak purus kayu jati dan umpak batu andesit agar lentur meredam gempa (S6).',
                    },
                    turnComplete: true,
                  },
                } as never);
              });
            },
            close: closeSpy,
          };
        }),
      },
    };

    const res = await jawabDenganGemini38Flash({
      bendaId: 'joglo',
      pertanyaan: 'Mengapa konstruksi Joglo tahan gempa?',
      bahasa: 'id',
      apiKey: 'test-key-local',
      liveClientFactory: () => liveFake,
    });

    expect(capturedModel).toBe('gemini-3.8-live');
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalled();
    expect(res.mode).toBe('gemini-3.8-live');
    expect(res.modelNama).toBe('gemini-3.8-live');
    expect(res.statusGrounding).toBe('terbukti');
    expect(res.sumber).toContain('S6');
    expect(res.jawaban).toContain('Joglo');

    // Pertanyaan yang sama dilayani seketika dari cache tanpa membuka WebSocket kedua
    const resCached = await jawabDenganGemini38Flash({
      bendaId: 'joglo',
      pertanyaan: 'Mengapa konstruksi Joglo tahan gempa?',
      bahasa: 'id',
      apiKey: 'test-key-local',
      liveClientFactory: () => liveFake,
    });
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(resCached.jawaban).toBe(res.jawaban);
  });

  it('menahan pertanyaan di luar korpus S1-S7 sebelum memanggil Gemini 3.8 Live', async () => {
    const connectSpy = vi.fn();
    const liveFake: LiveClientLike = {
      live: { connect: connectSpy as never },
    };

    const res = await jawabDenganGemini38Flash({
      bendaId: 'keris',
      pertanyaan: 'Siapa penemu mesin uap modern?',
      bahasa: 'id',
      apiKey: 'test-key-local',
      liveClientFactory: () => liveFake,
    });

    expect(connectSpy).not.toHaveBeenCalled();
    expect(res.statusGrounding).toBe('luar-korpus');
    expect(res.modelNama).toBe('gemini-3.8-live');
  });

  it('tetap menjaga label model gemini-3.8-live dan mengonversi output AKS ke Hanacaraka', async () => {
    const resLokal = jawabDariKurasiLokal('keris', 'Apa arti luk keris Pandawa?', 'id');
    expect(resLokal.modelNama).toBe('gemini-3.8-live');

    const liveFake: LiveClientLike = {
      live: {
        connect: vi.fn(async (params) => {
          queueMicrotask(() => {
            params.callbacks.onmessage?.({
              serverContent: {
                outputTranscription: {
                  text: 'Dhuwung luk gangsal nglambangaken kasetyan Pandhawa (S1).',
                },
                turnComplete: true,
              },
            } as never);
          });
          return {
            sendRealtimeInput: vi.fn(),
            close: vi.fn(),
          };
        }),
      },
    };

    const resAks = await jawabDenganGemini38Flash({
      bendaId: 'keris',
      pertanyaan: 'Apa tegese dhuwung luk lima?',
      bahasa: 'aks',
      apiKey: 'test-key-local',
      liveClientFactory: () => liveFake,
    });

    expect(resAks.mode).toBe('gemini-3.8-live');
    expect(resAks.modelNama).toBe('gemini-3.8-live');
    expect(resAks.jawaban).toMatch(/[\uA980-\uA9DF]/);
    expect(resAks.jawaban).toContain('S1');
  });
});
