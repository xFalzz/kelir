import type { BahasaAktif, BendaPusaka } from '../src/content/pusaka.ts';
import { DAFTAR_BENDA } from '../src/content/pusaka.ts';
import {
  BATAS_KARAKTER_TANYA,
  bersihkanInputPengguna,
  periksaBatasLajuAI,
} from '../src/lib/aiGuardrail.ts';
import { jawabDariKurasiLokal } from '../src/lib/tanya.ts';
import {
  MODEL_GEMINI_TETAP,
  bacaKonfigurasiGemini,
  jawabDenganGemini38Flash,
} from '../src/server/pamomongGemini.ts';

interface VercelReq {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelRes {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => VercelRes;
  json: (payload: unknown) => void;
}

const BAHASA_VALID = new Set<BahasaAktif>(['id', 'en', 'jw', 'aks']);
const BATAS_BODY_BYTES = 16_384;

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  res.setHeader?.('X-Content-Type-Options', 'nosniff');
  res.setHeader?.('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan metode POST.' });
    return;
  }

  const forwarded = req.headers?.['x-forwarded-for'];
  const clientIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : Array.isArray(forwarded)
        ? forwarded[0] ?? 'vercel'
        : 'vercel';
  const limit = periksaBatasLajuAI(`tanya:${clientIp}`, 90);
  if (!limit.diizinkan) {
    res.setHeader?.('Retry-After', '60');
    res.status(429).json({ error: 'Terlalu banyak permintaan tanya jawab. Coba sesaat lagi.' });
    return;
  }

  if (typeof req.body === 'string' && req.body.length > BATAS_BODY_BYTES) {
    res.status(413).json({ error: 'Ukuran payload melebihi batas aman 16 KB.' });
    return;
  }

  let body: { bendaId?: BendaPusaka['id']; pertanyaan?: string; bahasa?: BahasaAktif };
  try {
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      res.status(400).json({ error: 'Format tubuh permintaan harus berupa objek JSON.' });
      return;
    }
    body = parsed as {
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
  const pertanyaanRaw = typeof body.pertanyaan === 'string' ? body.pertanyaan : '';
  const pertanyaanBersih = bersihkanInputPengguna(pertanyaanRaw, BATAS_KARAKTER_TANYA);
  const bahasa: BahasaAktif =
    body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';

  const { apiKey } = bacaKonfigurasiGemini();

  try {
    // Kirimkan pertanyaanRaw (dipotong aman 640 char) ke pemeriksa agar tag injeksi tertangkap sebelum dihapus
    const hasil = await jawabDenganGemini38Flash({
      bendaId,
      pertanyaan: pertanyaanRaw.slice(0, 640),
      bahasa,
      apiKey,
    });
    res.status(200).json({
      ...hasil,
      modelNama: MODEL_GEMINI_TETAP,
    });
  } catch {
    const lokal = jawabDariKurasiLokal(bendaId, pertanyaanBersih, bahasa);
    res.status(200).json({
      ...lokal,
      modelNama: MODEL_GEMINI_TETAP,
    });
  }
}
