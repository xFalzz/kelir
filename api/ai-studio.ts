import { type BahasaAktif } from '../src/content/pusaka.ts';
import { periksaBatasLajuAI } from '../src/lib/aiGuardrail.ts';
import { eksekusiPermintaanAiStudio } from '../src/server/aiStudioGemini.ts';
import { bacaKonfigurasiGemini } from '../src/server/geminiLiveBridge.ts';
import {
  BAHASA_API_VALID,
  cekOriginPermintaanApi,
  ekstrakIpKlienTerpercaya,
  pasangHeaderKeamananApi,
  validasiDanParseBodyJson,
} from '../src/server/httpRequestGuard.ts';

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

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  pasangHeaderKeamananApi(res.setHeader);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan metode POST.' });
    return;
  }

  const cekOrigin = cekOriginPermintaanApi(req.headers);
  if (!cekOrigin.diizinkan) {
    res.status(403).json({ error: cekOrigin.alasan ?? 'Origin tidak diizinkan.' });
    return;
  }

  const clientIp = ekstrakIpKlienTerpercaya(req.headers);
  const limit = periksaBatasLajuAI(`studio:${clientIp}`, 60);
  if (!limit.diizinkan) {
    res.setHeader?.('Retry-After', '60');
    res.status(429).json({ error: 'Terlalu banyak permintaan. Coba kembali sesaat lagi.' });
    return;
  }

  const contentLength =
    typeof req.headers?.['content-length'] === 'string' ? req.headers['content-length'] : undefined;
  const parsed = validasiDanParseBodyJson(req.body, contentLength);
  if (!parsed.ok) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const body = parsed.body;
  const rawLang = body.bahasa as BahasaAktif | undefined;
  const bahasa: BahasaAktif = rawLang && BAHASA_API_VALID.has(rawLang) ? rawLang : 'id';
  const { apiKey } = bacaKonfigurasiGemini();

  try {
    const hasil = await eksekusiPermintaanAiStudio({
      body,
      bahasa,
      apiKey,
    });
    res.status(200).json(hasil);
  } catch {
    res.status(500).json({ error: 'Terjadi gangguan sementara pada layanan Studio AI.' });
  }
}
