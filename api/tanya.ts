import type { BendaPusaka } from '../src/content/pusaka.ts';
import { DAFTAR_BENDA } from '../src/content/pusaka.ts';
import { jawabDariKurasiLokal } from '../src/lib/tanya.ts';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (payload: unknown) => void;
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan metode POST.' });
    return;
  }

  let body: { bendaId?: BendaPusaka['id']; pertanyaan?: string };
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as {
      bendaId?: BendaPusaka['id'];
      pertanyaan?: string;
    };
  } catch {
    res.status(400).json({ error: 'Format JSON tubuh permintaan tidak valid.' });
    return;
  }

  const idValid = DAFTAR_BENDA.some((b) => b.id === body.bendaId);
  const bendaId: BendaPusaka['id'] = idValid && body.bendaId ? body.bendaId : 'keris';
  const pertanyaan = typeof body.pertanyaan === 'string' ? body.pertanyaan : '';

  const hasil = jawabDariKurasiLokal(bendaId, pertanyaan);

  res.status(200).json({
    ...hasil,
    mode: 'bm25-api-terverifikasi',
  });
}
