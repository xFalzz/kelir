import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KOLEKSI_COVERFLOW } from '../../src/content/pusaka.ts';
import {
  MODEL_TTS_SULUK,
  susunNaskahNarasiSuluk,
  tentukanBahasaSuara,
} from '../../src/lib/sulukNarasi.ts';
import { pcm24kMonoKeWavBase64 } from '../../src/server/geminiLiveBridge.ts';
import {
  bersihkanCacheSuaraSuluk,
  hasilkanSuaraSulukGemini,
  type LiveClientLike,
} from '../../src/server/sulukVoiceGemini.ts';

describe('Narasi Suara Layar Penuh Suluk (Gemini 3.8 Live Unlimited Multibahasa)', () => {
  beforeEach(() => {
    bersihkanCacheSuaraSuluk();
  });

  it('menghasilkan naskah penjelasan objek yang akurat sesuai 4 mode bahasa ID, EN, JW, dan AKS', () => {
    const keris = KOLEKSI_COVERFLOW[0];
    const idDraft = susunNaskahNarasiSuluk(keris, 'id');
    const enDraft = susunNaskahNarasiSuluk(keris, 'en');
    const jwDraft = susunNaskahNarasiSuluk(keris, 'jw');
    const aksDraft = susunNaskahNarasiSuluk(keris, 'aks');

    expect(idDraft.kodeBcp47).toBe('id-ID');
    expect(idDraft.naskah).toContain('berasal dari');
    expect(idDraft.naskah).toContain('Keris Luk 5');

    expect(enDraft.kodeBcp47).toBe('en-US');
    expect(enDraft.naskah).toContain('originating from');
    expect(enDraft.naskah).toContain('Manunggaling');

    expect(jwDraft.kodeBcp47).toBe('jv-ID');
    expect(jwDraft.naskah).toContain('saking');
    expect(jwDraft.naskah).toContain('Dhuwung');

    expect(aksDraft.bahasaSuara).toBe('jw');
    expect(aksDraft.naskah).toBe(jwDraft.naskah);
    expect(aksDraft.tampilNaskah).toMatch(/[\uA980-\uA9DF]/);
    expect(tentukanBahasaSuara('aks').kodeBcp47).toBe('jv-ID');
  });

  it('membungkus PCM 24kHz mono ke header RIFF WAV valid untuk diputar langsung browser', () => {
    const samplePcm = Buffer.alloc(16, 0x2a);
    const wavB64 = pcm24kMonoKeWavBase64([samplePcm]);
    expect(wavB64).toBeTruthy();

    const buf = Buffer.from(wavB64 as string, 'base64');
    expect(buf.toString('ascii', 0, 4)).toBe('RIFF');
    expect(buf.toString('ascii', 8, 12)).toBe('WAVE');
    expect(buf.readUInt32LE(24)).toBe(24000);
    expect(buf.readUInt32LE(40)).toBe(16);
    expect(buf.length).toBe(44 + 16);
  });

  it('memanggil model gemini-3.8-live via Live API sesuai bahasa pilihan user dan menyimpannya ke cache', async () => {
    const sendSpy = vi.fn();
    let capturedModel = '';
    let capturedVoice = '';
    const sampleChunkB64 = Buffer.from([1, 2, 3, 4]).toString('base64');

    const liveFake: LiveClientLike = {
      live: {
        connect: vi.fn(async (params) => {
          capturedModel = String(params.model);
          capturedVoice = String(params.config?.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName);
          return {
            sendRealtimeInput: (...args: unknown[]) => {
              sendSpy(...args);
              queueMicrotask(() => {
                params.callbacks.onmessage?.({
                  serverContent: {
                    modelTurn: {
                      parts: [{ inlineData: { data: sampleChunkB64, mimeType: 'audio/pcm;rate=24000' } }],
                    },
                    turnComplete: true,
                  },
                } as never);
              });
            },
            close: vi.fn(),
          };
        }),
      },
    };

    const resEn = await hasilkanSuaraSulukGemini({
      artefakId: 'saron',
      bahasa: 'en',
      apiKey: 'dummy-gemini-key',
      liveClientFactory: () => liveFake,
    });

    expect(MODEL_TTS_SULUK).toBe('gemini-3.8-live');
    expect(capturedModel).toBe('gemini-3.8-live');
    expect(capturedVoice).toBe('Kore');
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(resEn.modePenyedia).toBe('gemini-3.8-live');
    expect(resEn.mimeType).toBe('audio/wav');
    expect(resEn.audioBase64).toBeTruthy();

    // Panggilan ulang artefak & bahasa yang sama terlayani cepat dari cache server
    const resEnCached = await hasilkanSuaraSulukGemini({
      artefakId: 'saron',
      bahasa: 'en',
      apiKey: 'dummy-gemini-key',
      liveClientFactory: () => liveFake,
    });
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(resEnCached.audioBase64).toBe(resEn.audioBase64);
  });

  it('memberikan fallback naskah & suara piranti saat offline atau tanpa API key', async () => {
    const resNoKey = await hasilkanSuaraSulukGemini({
      artefakId: 'joglo',
      bahasa: 'jw',
      apiKey: '',
    });

    expect(resNoKey.modePenyedia).toBe('web-speech-fallback');
    expect(resNoKey.audioBase64).toBeNull();
    expect(resNoKey.bahasaSuara).toBe('jw');
    expect(resNoKey.kodeBcp47).toBe('jv-ID');
    expect(resNoKey.naskah).toContain('Pendhapa');
  });
});
