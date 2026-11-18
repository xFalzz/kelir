import type { BahasaAktif, BendaPusaka } from '../src/content/pusaka.ts';
import { DAFTAR_BENDA } from '../src/content/pusaka.ts';
import {
  BATAS_KARAKTER_TANYA,
  bersihkanInputPengguna,
  periksaBatasLajuAI,
  sanitasiKonteksUnsurAman,
} from '../src/lib/aiGuardrail.ts';
import { jawabDariKurasiLokal } from '../src/lib/tanya.ts';
import {
  BAHASA_API_VALID,
  cekOriginPermintaanApi,
  ekstrakIpKlienTerpercaya,
  pasangHeaderKeamananApi,
  validasiDanParseBodyJson,
} from '../src/server/httpRequestGuard.ts';
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
  const limit = periksaBatasLajuAI(`tanya:${clientIp}`, 90);
  if (!limit.diizinkan) {
    res.setHeader?.('Retry-After', '60');
    res.status(429).json({ error: 'Terlalu banyak permintaan tanya jawab. Coba sesaat lagi.' });
    return;
  }

  const contentLength =
    typeof req.headers?.['content-length'] === 'string' ? req.headers['content-length'] : undefined;
  const parsed = validasiDanParseBodyJson(req.body, contentLength);
  if (!parsed.ok) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const body = parsed.body as {
    bendaId?: BendaPusaka['id'];
    pertanyaan?: string;
    bahasa?: BahasaAktif;
    konteksUnsur?: unknown;
    riwayatSingkat?: unknown;
  };

  const idValid = DAFTAR_BENDA.some((b) => b.id === body.bendaId);
  const bendaId: BendaPusaka['id'] = idValid && body.bendaId ? body.bendaId : 'keris';
  const pertanyaanRaw = typeof body.pertanyaan === 'string' ? body.pertanyaan : '';
  const pertanyaanBersih = bersihkanInputPengguna(pertanyaanRaw, BATAS_KARAKTER_TANYA);
  const bahasa: BahasaAktif =
    body.bahasa && BAHASA_API_VALID.has(body.bahasa) ? body.bahasa : 'id';
  const konteksUnsur = sanitasiKonteksUnsurAman(body.konteksUnsur);

  const { apiKey } = bacaKonfigurasiGemini();

  try {
    const hasil = await jawabDenganGemini38Flash({
      bendaId,
      pertanyaan: pertanyaanRaw.slice(0, 640),
      bahasa,
      konteksUnsur,
      riwayatSingkat: body.riwayatSingkat,
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
