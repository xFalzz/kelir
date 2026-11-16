import {
  DAFTAR_BEDAH_TWIN,
  ambilTeks,
  type BahasaAktif,
  type SpesimenBedahId,
} from '../content/pusaka.ts';
import { latinKeAksaraJawa } from '../lib/aksara.ts';
import {
  MODEL_AI_STUDIO,
  bandingkanPusakaLokal,
  susunNaskahDalangBabak,
  susunPujanggaLokal,
  type DalangSuaraResult,
  type KomparasiResult,
  type PujanggaResult,
} from '../lib/aiStudio.ts';
import {
  bacaKonfigurasiGemini,
  panggilGemini38Live,
  type LiveClientLike,
} from './geminiLiveBridge.ts';

export type { LiveClientLike };

const MAX_STUDIO_CACHE = 40;
const komparasiCache = new Map<string, KomparasiResult>();
const pujanggaCache = new Map<string, PujanggaResult>();
const dalangAudioCache = new Map<string, { audioBase64: string; mimeType: string }>();

function setCacheBounded<T>(cache: Map<string, T>, key: string, val: T): void {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, val);
  if (cache.size > MAX_STUDIO_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

export function bersihkanCacheAiStudio(): void {
  komparasiCache.clear();
  pujanggaCache.clear();
  dalangAudioCache.clear();
}

function ekstrakJsonBlok(teks: string): Record<string, unknown> | null {
  const trimmed = teks.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function hasilkanKomparasiGemini(opts: {
  idA: SpesimenBedahId;
  idB: SpesimenBedahId;
  bahasa?: BahasaAktif;
  apiKey?: string;
  timeoutMs?: number;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
}): Promise<KomparasiResult> {
  const start = Date.now();
  const bahasa = opts.bahasa ?? 'id';
  const dasar = bandingkanPusakaLokal(opts.idA, opts.idB, bahasa);
  const cacheKey = `${dasar.idA}|${dasar.idB}|${bahasa}`;
  const cached = komparasiCache.get(cacheKey);
  if (cached) {
    return { ...cached, latensiMs: Math.max(2, Date.now() - start) };
  }

  const conf = bacaKonfigurasiGemini();
  const resolvedKey = (opts.apiKey ?? (conf.liveDisabled ? '' : conf.apiKey)).trim();
  if (!resolvedKey) {
    return { ...dasar, latensiMs: Math.max(2, Date.now() - start) };
  }

  const spA = DAFTAR_BEDAH_TWIN.find((b) => b.id === dasar.idA) ?? DAFTAR_BEDAH_TWIN[0];
  const spB = DAFTAR_BEDAH_TWIN.find((b) => b.id === dasar.idB) ?? DAFTAR_BEDAH_TWIN[1];
  const bahasaInstruksi =
    bahasa === 'en'
      ? 'English'
      : bahasa === 'jw' || bahasa === 'aks'
        ? 'Basa Jawi Krama (Latin alphabet)'
        : 'Bahasa Indonesia';

  const systemInstruction =
    `Anda adalah kurator perbandingan budaya Museum KELIR berbasis sumber primer ${dasar.sumber.join(', ')}. ` +
    `Jawab HANYA dengan JSON valid tanpa markdown dengan key tepat: "persamaan", "perbedaanMaterial", "titikTemuFilosofi". ` +
    `Setiap nilai maksimal 2 kalimat ringkas faktual menggunakan ${bahasaInstruksi}. Dilarang mengarang fakta di luar konteks spesimen.`;

  const userPrompt =
    `Bandingkan dua spesimen kurasi berikut:\n` +
    `SPESIMEN A: ${ambilTeks(spA.nama, bahasa)} | Kategori: ${ambilTeks(spA.kategori, bahasa)} | Asal: ${ambilTeks(spA.asal, bahasa)} | Ringkas: ${ambilTeks(spA.sejarahSingkat, bahasa)} | Filosofi: ${ambilTeks(spA.filosofi, bahasa)} | Sumber: ${spA.sumber.join(', ')}\n` +
    `SPESIMEN B: ${ambilTeks(spB.nama, bahasa)} | Kategori: ${ambilTeks(spB.kategori, bahasa)} | Asal: ${ambilTeks(spB.asal, bahasa)} | Ringkas: ${ambilTeks(spB.sejarahSingkat, bahasa)} | Filosofi: ${ambilTeks(spB.filosofi, bahasa)} | Sumber: ${spB.sumber.join(', ')}\n` +
    `Keluarkan JSON valid: {"persamaan":"...","perbedaanMaterial":"...","titikTemuFilosofi":"..."}`;

  try {
    const res = await panggilGemini38Live({
      apiKey: resolvedKey,
      systemInstruction,
      userPrompt,
      timeoutMs: opts.timeoutMs ?? 24000,
      includeWavAudio: false,
      liveClientFactory: opts.liveClientFactory,
    });
    const parsed = ekstrakJsonBlok(res.transcript);
    if (
      parsed &&
      typeof parsed.persamaan === 'string' &&
      parsed.persamaan.trim().length > 10 &&
      typeof parsed.perbedaanMaterial === 'string' &&
      parsed.perbedaanMaterial.trim().length > 10
    ) {
      const result: KomparasiResult = {
        ...dasar,
        persamaan: parsed.persamaan.trim(),
        perbedaanMaterial: parsed.perbedaanMaterial.trim(),
        titikTemuFilosofi:
          typeof parsed.titikTemuFilosofi === 'string' && parsed.titikTemuFilosofi.trim().length > 8
            ? parsed.titikTemuFilosofi.trim()
            : dasar.titikTemuFilosofi,
        modelNama: MODEL_AI_STUDIO,
        mode: 'gemini-3.8-live',
        latensiMs: Math.max(15, Date.now() - start),
      };
      setCacheBounded(komparasiCache, cacheKey, result);
      return result;
    }
  } catch {
    // Fallback deterministik S1-S7 bila jaringan atau parsing gagal
  }

  return { ...dasar, latensiMs: Math.max(4, Date.now() - start) };
}

export async function hasilkanPujanggaGemini(opts: {
  tema: string;
  bahasa?: BahasaAktif;
  apiKey?: string;
  timeoutMs?: number;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
}): Promise<PujanggaResult> {
  const start = Date.now();
  const bahasa = opts.bahasa ?? 'id';
  const dasar = susunPujanggaLokal(opts.tema, bahasa);
  const cacheKey = `${dasar.tema.toLowerCase()}|${bahasa}`;
  const cached = pujanggaCache.get(cacheKey);
  if (cached) {
    return { ...cached, latensiMs: Math.max(2, Date.now() - start) };
  }

  const conf = bacaKonfigurasiGemini();
  const resolvedKey = (opts.apiKey ?? (conf.liveDisabled ? '' : conf.apiKey)).trim();
  if (!resolvedKey) {
    return { ...dasar, latensiMs: Math.max(2, Date.now() - start) };
  }

  const artiLang = bahasa === 'en' ? 'English' : 'Bahasa Indonesia';
  const systemInstruction =
    'Panjenengan punika pujangga karaton Musiyum KELIR. ' +
    'Gawea rong larik pitutur luhur Basa Jawi alus selaras tema budaya Jawa S1-S7. ' +
    'Wangsulana kanthi JSON valid murni: {"guritJawa":"baris 1\\nbaris 2","terjemahan":"arti dalam ' +
    artiLang +
    '","catatanMakna":"1 kalimat sumber filosofi"}. Aja nambah teks liya.';

  const userPrompt = `Gawea bait pitutur Jawi ringkas bertema: "${dasar.tema}" berteraskan pustaka ${dasar.sumber.join(', ')}.`;

  try {
    const res = await panggilGemini38Live({
      apiKey: resolvedKey,
      systemInstruction,
      userPrompt,
      voiceName: 'Charon',
      timeoutMs: opts.timeoutMs ?? 26000,
      includeWavAudio: true,
      liveClientFactory: opts.liveClientFactory,
    });

    const parsed = ekstrakJsonBlok(res.transcript);
    const gurit =
      parsed && typeof parsed.guritJawa === 'string' && parsed.guritJawa.trim().length > 8
        ? parsed.guritJawa.trim()
        : dasar.guritJawa;
    const terj =
      parsed && typeof parsed.terjemahan === 'string' && parsed.terjemahan.trim().length > 8
        ? parsed.terjemahan.trim()
        : dasar.terjemahan;
    const catatan =
      parsed && typeof parsed.catatanMakna === 'string' && parsed.catatanMakna.trim().length > 8
        ? parsed.catatanMakna.trim()
        : dasar.catatanMakna;

    const result: PujanggaResult = {
      ...dasar,
      guritJawa: gurit,
      terjemahan: terj,
      aksaraJawa: latinKeAksaraJawa(gurit),
      catatanMakna: catatan,
      naskahSuara: `${gurit.replace('\n', ' ')}. ${terj.replace('\n', ' ')}`,
      audioBase64: res.wavBase64 ?? null,
      mimeType: res.mimeType ?? null,
      modePenyedia: res.wavBase64 ? 'gemini-3.8-live-audio' : 'web-speech-fallback',
      modelNama: MODEL_AI_STUDIO,
      latensiMs: Math.max(15, Date.now() - start),
    };
    setCacheBounded(pujanggaCache, cacheKey, result);
    return result;
  } catch {
    return { ...dasar, latensiMs: Math.max(4, Date.now() - start) };
  }
}

export async function hasilkanSuaraDalangBabak(opts: {
  babakIdx: number;
  bahasa?: BahasaAktif;
  apiKey?: string;
  timeoutMs?: number;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
}): Promise<DalangSuaraResult> {
  const bahasa = opts.bahasa ?? 'id';
  const draft = susunNaskahDalangBabak(opts.babakIdx, bahasa);
  const cacheKey = `${opts.babakIdx}|${draft.bahasaSuara}`;

  const conf = bacaKonfigurasiGemini();
  const resolvedKey = (opts.apiKey ?? (conf.liveDisabled ? '' : conf.apiKey)).trim();

  if (!resolvedKey) {
    return {
      babakIdx: opts.babakIdx,
      bahasa,
      naskah: draft.naskah,
      kodeBcp47: draft.kodeBcp47,
      audioBase64: null,
      mimeType: null,
      modePenyedia: 'web-speech-fallback',
      modelNama: MODEL_AI_STUDIO,
      sumber: draft.sumber,
    };
  }

  const cached = dalangAudioCache.get(cacheKey);
  if (cached) {
    return {
      babakIdx: opts.babakIdx,
      bahasa,
      naskah: draft.naskah,
      kodeBcp47: draft.kodeBcp47,
      audioBase64: cached.audioBase64,
      mimeType: cached.mimeType,
      modePenyedia: 'gemini-3.8-live-audio',
      modelNama: MODEL_AI_STUDIO,
      sumber: draft.sumber,
    };
  }

  const sysInstr =
    draft.bahasaSuara === 'en'
      ? 'You are a KELIR Ramayana shadow-theatre narrator. Read the exact narration given calmly and dramatically without adding commentary.'
      : draft.bahasaSuara === 'jw'
        ? 'Panjenengan punika dhalang wayang purwa KELIR. Waosen persis naskah pakeliran punika kanthi swara berwibawa lan cetha.'
        : 'Anda adalah narator dalang pertunjukan KELIR. Bacakan persis naskah babak wayang ini dengan intonasi tenang, jelas, dan berwibawa tanpa tambahan kata.';

  try {
    const res = await panggilGemini38Live({
      apiKey: resolvedKey,
      systemInstruction: sysInstr,
      userPrompt: draft.naskah,
      voiceName: draft.bahasaSuara === 'en' ? 'Kore' : 'Charon',
      timeoutMs: opts.timeoutMs ?? 26000,
      includeWavAudio: true,
      liveClientFactory: opts.liveClientFactory,
    });
    if (res.wavBase64 && res.mimeType) {
      setCacheBounded(dalangAudioCache, cacheKey, {
        audioBase64: res.wavBase64,
        mimeType: res.mimeType,
      });
      return {
        babakIdx: opts.babakIdx,
        bahasa,
        naskah: draft.naskah,
        kodeBcp47: draft.kodeBcp47,
        audioBase64: res.wavBase64,
        mimeType: res.mimeType,
        modePenyedia: 'gemini-3.8-live-audio',
        modelNama: MODEL_AI_STUDIO,
        sumber: draft.sumber,
      };
    }
  } catch {
    // Fallback ke Web Speech API bila Live API tidak tersedia
  }

  return {
    babakIdx: opts.babakIdx,
    bahasa,
    naskah: draft.naskah,
    kodeBcp47: draft.kodeBcp47,
    audioBase64: null,
    mimeType: null,
    modePenyedia: 'web-speech-fallback',
    modelNama: MODEL_AI_STUDIO,
    sumber: draft.sumber,
  };
}
