import {
  KOLEKSI_COVERFLOW,
  type BahasaAktif,
  type SpesimenBedahId,
} from '../src/content/pusaka.ts';
import { periksaBatasLajuAI } from '../src/lib/aiGuardrail.ts';
import { MODEL_TTS_SULUK, susunNaskahNarasiSuluk } from '../src/lib/sulukNarasi.ts';
import {
  BAHASA_API_VALID,
  cekOriginPermintaanApi,
  ekstrakIpKlienTerpercaya,
  pasangHeaderKeamananApi,
  validasiDanParseBodyJson,
} from '../src/server/httpRequestGuard.ts';
import { bacaKonfigurasiGemini } from '../src/server/pamomongGemini.ts';
import { hasilkanSuaraSulukGemini } from '../src/server/sulukVoiceGemini.ts';

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
  const limit = periksaBatasLajuAI(`suluk:${clientIp}`, 60);
  if (!limit.diizinkan) {
    res.setHeader?.('Retry-After', '60');
    res.status(429).json({ error: 'Terlalu banyak permintaan audio suluk.' });
    return;
  }

  const contentLength =
    typeof req.headers?.['content-length'] === 'string' ? req.headers['content-length'] : undefined;
  const parsed = validasiDanParseBodyJson(req.body, contentLength);
  if (!parsed.ok) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const body = parsed.body as { artefakId?: SpesimenBedahId; bahasa?: BahasaAktif };
  const item =
    KOLEKSI_COVERFLOW.find((c) => c.artefakId === body.artefakId) ?? KOLEKSI_COVERFLOW[0];
  const bahasa: BahasaAktif =
    body.bahasa && BAHASA_API_VALID.has(body.bahasa) ? body.bahasa : 'id';

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
