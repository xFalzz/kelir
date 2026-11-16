import type { BahasaAktif, BendaPusaka } from '../src/content/pusaka.ts';
import { DAFTAR_BENDA } from '../src/content/pusaka.ts';
import { jawabDariKurasiLokal } from '../src/lib/tanya.ts';
import {
  MODEL_GEMINI_TETAP,
  bacaKonfigurasiGemini,
  jawabDenganGemini38Flash,
} from '../src/server/pamomongGemini.ts';

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

  let body: { bendaId?: BendaPusaka['id']; pertanyaan?: string; bahasa?: BahasaAktif };
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as {
      bendaId?: BendaPusaka['id'];
      pertanyaan?: string;
      bahasa?: BahasaAktif;
    };
  } catch {
    res.status(400).json({ error: 'Format JSON tubuh permintaan tidak valid.' });
    return;
  }

  const idValid = DAFTAR_BENDA.some((b) => b.id === body.bendaId);
  const bendaId: BendaPusaka['id'] = idValid && body.bendaId ? body.bendaId : 'keris';
  const pertanyaan = typeof body.pertanyaan === 'string' ? body.pertanyaan : '';
  const bahasa: BahasaAktif =
    body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';

  const { apiKey } = bacaKonfigurasiGemini();

  try {
    const hasil = await jawabDenganGemini38Flash({
      bendaId,
      pertanyaan,
      bahasa,
      apiKey,
    });
    res.status(200).json({
      ...hasil,
      modelNama: MODEL_GEMINI_TETAP,
    });
  } catch {
    const lokal = jawabDariKurasiLokal(bendaId, pertanyaan, bahasa);
    res.status(200).json({
      ...lokal,
      modelNama: MODEL_GEMINI_TETAP,
    });
  }
}
