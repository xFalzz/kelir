import {
  KOLEKSI_COVERFLOW,
  type BahasaAktif,
  type SpesimenBedahId,
} from '../src/content/pusaka.ts';
import { MODEL_TTS_SULUK, susunNaskahNarasiSuluk } from '../src/lib/sulukNarasi.ts';
import { bacaKonfigurasiGemini } from '../src/server/pamomongGemini.ts';
import { hasilkanSuaraSulukGemini } from '../src/server/sulukVoiceGemini.ts';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (payload: unknown) => void;
}

const BAHASA_VALID = new Set<BahasaAktif>(['id', 'en', 'jw', 'aks']);

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan metode POST.' });
    return;
  }

  let body: { artefakId?: SpesimenBedahId; bahasa?: BahasaAktif };
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as {
      artefakId?: SpesimenBedahId;
      bahasa?: BahasaAktif;
    };
  } catch {
    res.status(400).json({ error: 'Format JSON tubuh permintaan tidak valid.' });
    return;
  }

  const item =
    KOLEKSI_COVERFLOW.find((c) => c.artefakId === body.artefakId) ?? KOLEKSI_COVERFLOW[0];
  const bahasa: BahasaAktif =
    body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';

  const { apiKey } = bacaKonfigurasiGemini();

  try {
    const hasil = await hasilkanSuaraSulukGemini({
      artefakId: item.artefakId,
      bahasa,
      apiKey,
    });
    res.status(200).json(hasil);
  } catch {
    const draft = susunNaskahNarasiSuluk(item, bahasa);
    res.status(200).json({
      artefakId: item.artefakId,
      bahasa,
      bahasaSuara: draft.bahasaSuara,
      kodeBcp47: draft.kodeBcp47,
      naskah: draft.naskah,
      tampilNaskah: draft.tampilNaskah,
      audioBase64: null,
      mimeType: null,
      modelNama: MODEL_TTS_SULUK,
      modePenyedia: 'web-speech-fallback',
    });
  }
}
