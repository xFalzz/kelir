import {
  DAFTAR_BENDA,
  ambilTeks,
  type BahasaAktif,
  type BendaPusaka,
} from '../content/pusaka.ts';
import { konversiTeksKeAksaraAman } from '../lib/aksara.ts';
import {
  MODEL_AI_PAMOMONG,
  jawabDariKurasiLokal,
  type HasilTanya,
} from '../lib/tanya.ts';
import {
  MODEL_GEMINI_LIVE_UNLIMITED,
  bacaKonfigurasiGemini,
  panggilGemini38Live,
  type KonfigurasiGemini,
  type LiveClientLike,
} from './geminiLiveBridge.ts';

/**
 * Model AI resmi Pamomong beralih otomatis ke Gemini 3.8 Live (`gemini-3.8-live`)
 * yang memiliki kuota Unlimited RPM & Unlimited RPD pada Google AI Studio Free Tier.
 */
export const MODEL_GEMINI_TETAP = MODEL_AI_PAMOMONG;

export { bacaKonfigurasiGemini, type KonfigurasiGemini, type LiveClientLike };

export interface OpsiTanyaGemini {
  bendaId: BendaPusaka['id'];
  pertanyaan: string;
  bahasa?: BahasaAktif;
  apiKey?: string;
  timeoutMs?: number;
  liveClientFactory?: (apiKey: string) => LiveClientLike;
  bypassCache?: boolean;
}

const MAX_JAWABAN_CACHE = 48;
const cacheJawabanLive = new Map<string, string>();

function susunInstruksiSistem(bahasaTarget: 'id' | 'en' | 'jw'): string {
  if (bahasaTarget === 'en') {
    return [
      'You are Pamomong, curator guide of KELIR Museum.',
      'Answer crisply in 1 to 2 natural English sentences using ONLY verified facts from the ARCHIVAL EVIDENCE below.',
      'Cite matching source codes naturally (for example S1 or S6). Never invent details.',
    ].join(' ');
  }
  if (bahasaTarget === 'jw') {
    return [
      'Panjenengan punika Pamomong, kurator musiyum KELIR.',
      'Paringi wangsulan ing Basa Jawi Krama ingkang ringkes lan cetha (1 dumugi 2 ukara) NAMUNG saking BUKTI ARSIP S1-S7 punika.',
      'Sebutaken kode rujukanipun (upaminipun S1 utawi S6).',
    ].join(' ');
  }
  return [
    'Anda adalah Pamomong, kurator museum KELIR.',
    'Jawab ringkas dan jelas dalam 1 hingga 2 kalimat Bahasa Indonesia HANYA memakai fakta dari BUKTI ARSIP di bawah.',
    'Sebutkan kode sumbernya secara alami (misalnya S1 atau S6) dan jangan mengarang di luar bukti.',
  ].join(' ');
}

function susunInputKurasi(
  benda: BendaPusaka,
  hasilLokal: HasilTanya,
  bahasaTarget: 'id' | 'en' | 'jw',
  pertanyaan: string,
): string {
  const konteksBenda = `${ambilTeks(benda.nama, bahasaTarget)} (${ambilTeks(benda.subjudul, bahasaTarget)}): ${ambilTeks(benda.ringkas, bahasaTarget)}`;
  const daftarBukti =
    hasilLokal.butirBukti.length > 0
      ? hasilLokal.butirBukti
          .map((b, i) => `[${i + 1}] ${b.judul} (${b.sumber.join(', ')}): ${b.kutipan}`)
          .join('\n')
      : `- ${ambilTeks(benda.sejarahSingkat, bahasaTarget)} (${benda.sumber.join(', ')})`;

  return [
    `KONTEKS: ${konteksBenda}`,
    `BUKTI S1-S7:\n${daftarBukti}`,
    `PERTANYAAN: ${pertanyaan}`,
  ].join('\n\n');
}

export function bersihkanCachePamomongLive(): void {
  cacheJawabanLive.clear();
}

/**
 * Menjawab pertanyaan budaya dengan retrieval BM25 S1-S7 sebagai jangkar anti-halusinasi,
 * lalu merangkumnya otomatis memakai model Unlimited `gemini-3.8-live`.
 */
export async function jawabDenganGemini38Flash(
  opts: OpsiTanyaGemini,
): Promise<HasilTanya> {
  const mulai = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const bahasa: BahasaAktif = opts.bahasa ?? 'id';
  const pertanyaanBersih = opts.pertanyaan.trim().slice(0, 320);

  const hasilLokal = jawabDariKurasiLokal(opts.bendaId, pertanyaanBersih, bahasa);
  if (hasilLokal.statusGrounding === 'luar-korpus') {
    return {
      ...hasilLokal,
      modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
    };
  }

  const konf =
    opts.apiKey !== undefined
      ? {
          apiKey: opts.apiKey.trim(),
          model: MODEL_GEMINI_LIVE_UNLIMITED,
          liveDisabled: false,
        }
      : bacaKonfigurasiGemini();

  if (!konf.apiKey || konf.liveDisabled) {
    return {
      ...hasilLokal,
      modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
    };
  }

  const benda = DAFTAR_BENDA.find((b) => b.id === opts.bendaId) ?? DAFTAR_BENDA[0];
  const bahasaLlm: 'id' | 'en' | 'jw' = bahasa === 'aks' ? 'jw' : bahasa;
  const cacheKey = `${benda.id}:${bahasaLlm}:${pertanyaanBersih.toLowerCase()}`;

  if (!opts.bypassCache) {
    const cached = cacheJawabanLive.get(cacheKey);
    if (cached) {
      return {
        ...hasilLokal,
        jawaban: bahasa === 'aks' ? konversiTeksKeAksaraAman(cached) : cached,
        mode: 'gemini-3.8-live',
        modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
      };
    }
  }

  try {
    const res = await panggilGemini38Live({
      apiKey: konf.apiKey,
      systemInstruction: susunInstruksiSistem(bahasaLlm),
      userPrompt: susunInputKurasi(
        benda,
        hasilLokal,
        bahasaLlm,
        pertanyaanBersih || ambilTeks(benda.nama, bahasaLlm),
      ),
      voiceName: bahasaLlm === 'en' ? 'Kore' : 'Charon',
      timeoutMs: Math.max(2500, opts.timeoutMs ?? 28000),
      includeWavAudio: false,
      liveClientFactory: opts.liveClientFactory,
    });

    if (!res.transcript) {
      return {
        ...hasilLokal,
        modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
      };
    }

    if (!opts.bypassCache) {
      if (cacheJawabanLive.has(cacheKey)) cacheJawabanLive.delete(cacheKey);
      cacheJawabanLive.set(cacheKey, res.transcript);
      if (cacheJawabanLive.size > MAX_JAWABAN_CACHE) {
        const oldest = cacheJawabanLive.keys().next().value;
        if (oldest) cacheJawabanLive.delete(oldest);
      }
    }

    const selesaiMs = Math.max(
      0.2,
      Number(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - mulai).toFixed(2)),
    );

    return {
      ...hasilLokal,
      jawaban: bahasa === 'aks' ? konversiTeksKeAksaraAman(res.transcript) : res.transcript,
      mode: 'gemini-3.8-live',
      modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
      latensiMs: selesaiMs,
    };
  } catch {
    return {
      ...hasilLokal,
      modelNama: MODEL_GEMINI_LIVE_UNLIMITED,
    };
  }
}
