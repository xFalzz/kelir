import {
  LAKON_KIJANG_KENCANA,
  ambilTeks,
  type BahasaAktif,
  type KodeSumber,
} from '../content/pusaka.ts';
import { tentukanBahasaSuara } from './sulukNarasi.ts';

export const MODEL_AI_STUDIO = 'gemini-3.8-live' as const;

export interface DalangSuaraResult {
  babakIdx: number;
  bahasa: BahasaAktif;
  naskah: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  audioBase64: string | null;
  mimeType: string | null;
  modePenyedia: 'gemini-3.8-live-audio' | 'web-speech-fallback';
  modelNama: typeof MODEL_AI_STUDIO;
  sumber: KodeSumber[];
}

export async function panggilEndpointStudio<T>(
  payload: Record<string, unknown>,
  timeoutMs = 26000,
): Promise<T | null> {
  if (typeof fetch === 'undefined') return null;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/ai-studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

/** Naskah narasi Dalang berbahasa sesuai UI aktif untuk Babak Pakeliran 3D (Halaman 04). */
export function susunNaskahDalangBabak(babakIdx: number, bahasa: BahasaAktif): {
  naskah: string;
  kodeBcp47: 'id-ID' | 'en-US' | 'jv-ID';
  bahasaSuara: 'id' | 'en' | 'jw';
  sumber: KodeSumber[];
} {
  const daftar = LAKON_KIJANG_KENCANA.daftarBabak;
  const bab = daftar[Math.max(0, Math.min(daftar.length - 1, babakIdx))] ?? daftar[0];
  const { bahasaSuara, kodeBcp47 } = tentukanBahasaSuara(bahasa);
  const loc = ambilTeks(bab.lokasi, bahasaSuara);
  const title = ambilTeks(bab.judul, bahasaSuara);
  const nar = ambilTeks(bab.narasiDalang, bahasaSuara);
  const suluk = ambilTeks(bab.suluk, bahasaSuara);

  const naskah =
    bahasaSuara === 'en'
      ? `Act ${bab.nomor}, ${title}, at ${loc}. ${nar} ${suluk}`
      : bahasaSuara === 'jw'
        ? `Babak ${bab.nomor}, ${title}, wonten ing ${loc}. ${nar} ${suluk}`
        : `Babak ${bab.nomor}, ${title}, di ${loc}. ${nar} ${suluk}`;

  return {
    naskah,
    kodeBcp47,
    bahasaSuara,
    sumber: bab.sumber,
  };
}

/** Meminta audio suara Dalang WAV gemini-3.8-live untuk babak Pakeliran aktif dengan fallback Web Speech. */
export async function mintaSuaraDalangBabak(
  babakIdx: number,
  bahasa: BahasaAktif,
): Promise<DalangSuaraResult> {
  const data = await panggilEndpointStudio<DalangSuaraResult>(
    {
      tugas: 'dalang-suara',
      babakIdx,
      bahasa,
    },
    28000,
  );
  if (data && data.naskah) {
    return data;
  }
  const fallback = susunNaskahDalangBabak(babakIdx, bahasa);
  return {
    babakIdx,
    bahasa,
    naskah: fallback.naskah,
    kodeBcp47: fallback.kodeBcp47,
    audioBase64: null,
    mimeType: null,
    modePenyedia: 'web-speech-fallback',
    modelNama: MODEL_AI_STUDIO,
    sumber: fallback.sumber,
  };
}
