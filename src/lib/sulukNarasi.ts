import {
  ambilTeks,
  type BahasaAktif,
  type ItemCoverflow,
  type SpesimenBedahId,
} from '../content/pusaka.ts';
import { konversiTeksKeAksaraAman } from './aksara.ts';

export const MODEL_TTS_SULUK = 'Pamomong Nusantara' as const;

export type ModeSuaraSuluk = 'pamomong-live' | 'web-speech-fallback';

export interface HasilSuaraSuluk {
  artefakId: SpesimenBedahId;
  bahasa: BahasaAktif;
  bahasaSuara: 'id' | 'en' | 'jw';
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  naskah: string;
  tampilNaskah: string;
  audioBase64: string | null;
  mimeType: string | null;
  modelNama: typeof MODEL_TTS_SULUK;
  modePenyedia: ModeSuaraSuluk;
}

type CachedSuaraEntry = Omit<HasilSuaraSuluk, 'bahasa' | 'tampilNaskah'>;

const cacheClientSuara = new Map<string, CachedSuaraEntry>();
const SESSION_CACHE_PREFIX = 'kelir_suluk_wav_v1:';

function bacaCacheSession(cacheKey: string): CachedSuaraEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage?.getItem(`${SESSION_CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedSuaraEntry>;
    if (parsed && typeof parsed.audioBase64 === 'string' && parsed.audioBase64.length > 0) {
      return parsed as CachedSuaraEntry;
    }
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
  return null;
}

function simpanCacheSession(cacheKey: string, entry: CachedSuaraEntry): void {
  if (typeof window === 'undefined' || !entry.audioBase64) return;
  try {
    window.sessionStorage?.setItem(`${SESSION_CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));
  } catch {
    // Bersihkan cache lama bila kuota penyimpanan peramban penuh
    try {
      const keysToClear: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k?.startsWith(SESSION_CACHE_PREFIX)) keysToClear.push(k);
      }
      if (keysToClear.length > 0) {
        window.sessionStorage.removeItem(keysToClear[0]);
        window.sessionStorage.setItem(`${SESSION_CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));
      }
    } catch {
      // Abaikan bila peramban menolak storage
    }
  }
}

export function tentukanBahasaSuara(bahasa: BahasaAktif): {
  bahasaSuara: 'id' | 'en' | 'jw';
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
} {
  if (bahasa === 'en') {
    return { bahasaSuara: 'en', kodeBcp47: 'en-US' };
  }
  if (bahasa === 'jw' || bahasa === 'aks') {
    return { bahasaSuara: 'jw', kodeBcp47: 'jv-ID' };
  }
  return { bahasaSuara: 'id', kodeBcp47: 'id-ID' };
}

function kalimatPertama(teks: string, maxChars = 155): string {
  const bersih = teks.replace(/\s+/g, ' ').replace(/\u2014/g, ', ').trim();
  const akhir = bersih.search(/[.!?](\s|$)/);
  if (akhir > 0 && akhir < maxChars) {
    return bersih.slice(0, akhir + 1);
  }
  return bersih.length <= maxChars
    ? `${bersih.replace(/[.,;:]$/, '')}.`
    : `${bersih.slice(0, maxChars - 3).trim()}...`;
}

/**
 * Menyusun naskah penjelasan lisan kuratorial objek panggung Suluk sesuai bahasa tema aktif (2-3 kalimat padat).
 */
export function susunNaskahNarasiSuluk(
  item: ItemCoverflow,
  bahasa: BahasaAktif,
): {
  bahasaSuara: 'id' | 'en' | 'jw';
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  naskah: string;
  tampilNaskah: string;
} {
  const { bahasaSuara, kodeBcp47 } = tentukanBahasaSuara(bahasa);
  const nama = ambilTeks(item.nama, bahasaSuara);
  const asal = ambilTeks(item.asal, bahasaSuara);
  const ringkasSejarah = kalimatPertama(ambilTeks(item.penjelasanLengkap, bahasaSuara), 140);
  const ringkasFilosofi = kalimatPertama(ambilTeks(item.filosofi, bahasaSuara), 130);

  const naskah =
    bahasaSuara === 'en'
      ? `${nama}, originating from ${asal}. ${ringkasSejarah} ${ringkasFilosofi}`
      : bahasaSuara === 'jw'
        ? `${nama}, saking ${asal}. ${ringkasSejarah} ${ringkasFilosofi}`
        : `${nama}, berasal dari ${asal}. ${ringkasSejarah} ${ringkasFilosofi}`;

  const naskahBersih = naskah.replace(/\s+/g, ' ').replace(/\u2014/g, ', ').trim();
  const tampilNaskah =
    bahasa === 'aks' ? konversiTeksKeAksaraAman(naskahBersih) : naskahBersih;

  return {
    bahasaSuara,
    kodeBcp47,
    naskah: naskahBersih,
    tampilNaskah,
  };
}

/**
 * Mengambil suara narasi objek Suluk dari server Unlimited Gemini 3.8 Live dengan cache klien + sessionStorage.
 */
export async function ambilSuaraSuluk(
  item: ItemCoverflow,
  bahasa: BahasaAktif,
  signal?: AbortSignal,
): Promise<HasilSuaraSuluk> {
  const { bahasaSuara, kodeBcp47, naskah, tampilNaskah } = susunNaskahNarasiSuluk(item, bahasa);
  const cacheKey = `${item.artefakId}:${bahasaSuara}`;

  const cached = cacheClientSuara.get(cacheKey) ?? bacaCacheSession(cacheKey);
  if (cached?.audioBase64) {
    cacheClientSuara.set(cacheKey, cached);
    return {
      ...cached,
      bahasa,
      tampilNaskah,
    };
  }

  try {
    const resp = await fetch('/api/suluk-suara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artefakId: item.artefakId, bahasa }),
      signal,
    });
    if (resp.ok) {
      const data = (await resp.json()) as Partial<HasilSuaraSuluk>;
      if (data && typeof data.naskah === 'string') {
        const hasil: HasilSuaraSuluk = {
          artefakId: item.artefakId,
          bahasa,
          bahasaSuara,
          kodeBcp47,
          naskah: data.naskah,
          tampilNaskah: bahasa === 'aks' ? konversiTeksKeAksaraAman(data.naskah) : data.naskah,
          audioBase64: data.audioBase64 ?? null,
          mimeType: data.mimeType ?? null,
          modelNama: MODEL_TTS_SULUK,
          modePenyedia:
            data.audioBase64 && data.modePenyedia === 'pamomong-live'
              ? 'pamomong-live'
              : 'web-speech-fallback',
        };
        if (hasil.audioBase64) {
          const entry: CachedSuaraEntry = {
            artefakId: hasil.artefakId,
            bahasaSuara: hasil.bahasaSuara,
            kodeBcp47: hasil.kodeBcp47,
            naskah: hasil.naskah,
            audioBase64: hasil.audioBase64,
            mimeType: hasil.mimeType,
            modelNama: MODEL_TTS_SULUK,
            modePenyedia: hasil.modePenyedia,
          };
          cacheClientSuara.set(cacheKey, entry);
          simpanCacheSession(cacheKey, entry);
        }
        return hasil;
      }
    }
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') {
      throw err;
    }
  }

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

export function base64AudioKeBlobUrl(audioBase64: string, mimeType = 'audio/wav'): string {
  const cleanB64 = audioBase64.replace(/\s+/g, '');
  const binStr = atob(cleanB64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
  return URL.createObjectURL(blob);
}

export function hentikanWebSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Abaikan jika browser memblokir speechSynthesis
  }
}

export function putarkanWebSpeech(
  naskah: string,
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID',
  onStart?: () => void,
  onEnd?: () => void,
): boolean {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utt = new SpeechSynthesisUtterance(naskah);
    utt.lang = kodeBcp47;
    utt.rate = kodeBcp47 === 'en-US' ? 0.96 : 0.94;
    utt.pitch = 1.0;

    const voices = synth.getVoices?.() ?? [];
    if (voices.length > 0) {
      const langPrefix = kodeBcp47.split('-')[0].toLowerCase();
      const chosen =
        voices.find((v) => v.lang.toLowerCase() === kodeBcp47.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
        (kodeBcp47 === 'jv-ID'
          ? voices.find((v) => v.lang.toLowerCase().startsWith('id'))
          : undefined);
      if (chosen) {
        utt.voice = chosen;
        utt.lang = chosen.lang;
      } else if (kodeBcp47 === 'jv-ID') {
        utt.lang = 'id-ID';
      }
    }

    utt.onstart = () => onStart?.();
    utt.onend = () => onEnd?.();
    utt.onerror = () => onEnd?.();
    synth.speak(utt);
    return true;
  } catch {
    return false;
  }
}
