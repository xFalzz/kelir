import { type BahasaAktif } from '../src/content/pusaka.ts';
import { periksaBatasLajuAI } from '../src/lib/aiGuardrail.ts';
import { eksekusiPermintaanAiStudio } from '../src/server/aiStudioGemini.ts';
import { bacaKonfigurasiGemini } from '../src/server/geminiLiveBridge.ts';

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
  const limit = periksaBatasLajuAI(`studio:${clientIp}`, 60);
  if (!limit.diizinkan) {
    res.setHeader?.('Retry-After', '60');
    res.status(429).json({ error: 'Terlalu banyak permintaan. Coba kembali sesaat lagi.' });
    return;
  }

  if (typeof req.body === 'string' && req.body.length > BATAS_BODY_BYTES) {
    res.status(413).json({ error: 'Ukuran payload melebihi batas aman 16 KB.' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      res.status(400).json({ error: 'Format tubuh permintaan harus berupa objek JSON.' });
      return;
    }
    body = parsed as Record<string, unknown>;
  } catch {
    res.status(400).json({ error: 'Format JSON tubuh permintaan tidak valid.' });
    return;
  }

  const rawLang = body.bahasa as BahasaAktif | undefined;
  const bahasa: BahasaAktif = rawLang && BAHASA_VALID.has(rawLang) ? rawLang : 'id';
  const { apiKey } = bacaKonfigurasiGemini();

  const hasil = await eksekusiPermintaanAiStudio({
    body,
    bahasa,
    apiKey,
  });
  res.status(200).json(hasil);
}
