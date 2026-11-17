import {
  KOLEKSI_COVERFLOW,
  type BahasaAktif,
  type SpesimenBedahId,
} from '../content/pusaka.ts';
import {
  MODEL_TTS_SULUK,
  susunNaskahNarasiSuluk,
  type HasilSuaraSuluk,
} from '../lib/sulukNarasi.ts';
import {
  bacaKonfigurasiGemini,
  panggilGemini38Live,
  type LiveClientLike,
} from './geminiLiveBridge.ts';

export type { LiveClientLike };

export interface OpsiSuaraSulukGemini {
  artefakId: SpesimenBedahId;
  bahasa?: BahasaAktif;
  apiKey?: string;
  timeoutMs?: number;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
  bypassCache?: boolean;
}

const MAX_SERVER_AUDIO_CACHE = 24;
const serverAudioCache = new Map<string, { audioBase64: string; mimeType: string }>();

function pilihProfilSuaraLive(bahasaSuara: 'id' | 'en' | 'jw'): {
  voice: string;
  systemInstruction: string;
} {
  if (bahasaSuara === 'en') {
    return {
      voice: 'Kore',
      systemInstruction:
        'You are a KELIR museum narrator. Read back the exact sentences given calmly and warmly without adding commentary or extra words.',
    };
  }
  if (bahasaSuara === 'jw') {
    return {
      voice: 'Charon',
      systemInstruction:
        'Panjenengan punika narator musiyum Jawa. Waosen kanthi alus lan cetha saben ukara Basa Jawi Krama ingkang kaparingaken tanpa nambah ukara sanes.',
    };
  }
  return {
    voice: 'Charon',
    systemInstruction:
      'Anda adalah narator kuratorial museum KELIR. Bacakan persis kalimat yang diberikan dengan suara tenang, hangat, dan jelas dalam Bahasa Indonesia tanpa menambah kata lain.',
  };
}

function simpanKeCacheAudio(key: string, audioBase64: string, mimeType: string): void {
  if (serverAudioCache.has(key)) {
    serverAudioCache.delete(key);
  }
  serverAudioCache.set(key, { audioBase64, mimeType });
  if (serverAudioCache.size > MAX_SERVER_AUDIO_CACHE) {
    const firstKey = serverAudioCache.keys().next().value;
    if (firstKey) serverAudioCache.delete(firstKey);
  }
}

export function bersihkanCacheSuaraSuluk(): void {
  serverAudioCache.clear();
}

/**
 * Menghasilkan audio narasi penjelasan objek Suluk berbahasa ID / EN / JW (dan AKS dalam Jawi)
 * memakai model Unlimited `gemini-3.8-live` via WebSocket (PCM 24kHz -> audio/wav) dengan cache server.
 */
export async function hasilkanSuaraSulukGemini(
  opts: OpsiSuaraSulukGemini,
): Promise<HasilSuaraSuluk> {
  const item =
    KOLEKSI_COVERFLOW.find((c) => c.artefakId === opts.artefakId) ?? KOLEKSI_COVERFLOW[0];
  const bahasa: BahasaAktif = opts.bahasa ?? 'id';
  const { bahasaSuara, kodeBcp47, naskah, tampilNaskah } = susunNaskahNarasiSuluk(item, bahasa);
  const cacheKey = `${item.artefakId}:${bahasaSuara}`;

  if (!opts.bypassCache) {
    const hit = serverAudioCache.get(cacheKey);
    if (hit) {
      return {
        artefakId: item.artefakId,
        bahasa,
        bahasaSuara,
        kodeBcp47,
        naskah,
        tampilNaskah,
        audioBase64: hit.audioBase64,
        mimeType: hit.mimeType,
        modelNama: MODEL_TTS_SULUK,
        modePenyedia: 'pamomong-live',
      };
    }
  }

  const konf =
    opts.apiKey !== undefined
      ? { apiKey: opts.apiKey.trim(), liveDisabled: false }
      : bacaKonfigurasiGemini();

  if (!konf.apiKey || konf.liveDisabled) {
    return {
      artefakId: item.artefakId,
      bahasa,
      bahasaSuara,
      kodeBcp47,
      naskah,
      tampilNaskah,
      audioBase64: null,
      mimeType: null,
      modelNama: MODEL_TTS_SULUK,
      modePenyedia: 'web-speech-fallback',
    };
  }

  const profil = pilihProfilSuaraLive(bahasaSuara);
  try {
    const res = await panggilGemini38Live({
      apiKey: konf.apiKey,
      systemInstruction: profil.systemInstruction,
      userPrompt: naskah,
      voiceName: profil.voice,
      timeoutMs: Math.max(3000, opts.timeoutMs ?? 28000),
      includeWavAudio: true,
      liveClientFactory: opts.liveClientFactory,
    });

    if (!res.wavBase64) {
      return {
        artefakId: item.artefakId,
        bahasa,
        bahasaSuara,
        kodeBcp47,
        naskah,
        tampilNaskah,
        audioBase64: null,
        mimeType: null,
        modelNama: MODEL_TTS_SULUK,
        modePenyedia: 'web-speech-fallback',
      };
    }

    const mimeType = res.mimeType || 'audio/wav';
    if (!opts.bypassCache) {
      simpanKeCacheAudio(cacheKey, res.wavBase64, mimeType);
    }

    return {
      artefakId: item.artefakId,
      bahasa,
      bahasaSuara,
      kodeBcp47,
      naskah,
      tampilNaskah,
      audioBase64: res.wavBase64,
      mimeType,
      modelNama: MODEL_TTS_SULUK,
      modePenyedia: 'pamomong-live',
    };
  } catch {
    return {
      artefakId: item.artefakId,
      bahasa,
      bahasaSuara,
      kodeBcp47,
      naskah,
      tampilNaskah,
      audioBase64: null,
      mimeType: null,
      modelNama: MODEL_TTS_SULUK,
      modePenyedia: 'web-speech-fallback',
    };
  }
}
