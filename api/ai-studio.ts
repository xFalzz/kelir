import {
  DAFTAR_BEDAH_TWIN,
  type BahasaAktif,
  type SpesimenBedahId,
} from '../src/content/pusaka.ts';
import {
  hasilkanKomparasiGemini,
  hasilkanPujanggaGemini,
  hasilkanSuaraDalangBabak,
} from '../src/server/aiStudioGemini.ts';
import { bacaKonfigurasiGemini } from '../src/server/geminiLiveBridge.ts';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (payload: unknown) => void;
}

const BAHASA_VALID = new Set<BahasaAktif>(['id', 'en', 'jw', 'aks']);

function validasiIdSpesimen(raw: unknown, fallback: SpesimenBedahId): SpesimenBedahId {
  if (typeof raw === 'string' && DAFTAR_BEDAH_TWIN.some((b) => b.id === raw)) {
    return raw as SpesimenBedahId;
  }
  return fallback;
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Gunakan metode POST.' });
    return;
  }

  let body: {
    tugas?: 'banding' | 'pujangga' | 'dalang-suara';
    idA?: unknown;
    idB?: unknown;
    tema?: unknown;
    babakIdx?: unknown;
    bahasa?: BahasaAktif;
  };

  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as typeof body;
  } catch {
    res.status(400).json({ error: 'Format JSON tubuh permintaan tidak valid.' });
    return;
  }

  const bahasa: BahasaAktif = body.bahasa && BAHASA_VALID.has(body.bahasa) ? body.bahasa : 'id';
  const { apiKey } = bacaKonfigurasiGemini();

  if (body.tugas === 'pujangga') {
    const hasil = await hasilkanPujanggaGemini({
      tema: typeof body.tema === 'string' ? body.tema : '',
      bahasa,
      apiKey,
    });
    res.status(200).json(hasil);
    return;
  }

  if (body.tugas === 'dalang-suara') {
    const babakIdx = typeof body.babakIdx === 'number' && Number.isFinite(body.babakIdx)
      ? Math.max(0, Math.floor(body.babakIdx))
      : 0;
    const hasil = await hasilkanSuaraDalangBabak({
      babakIdx,
      bahasa,
      apiKey,
    });
    res.status(200).json(hasil);
    return;
  }

  const hasil = await hasilkanKomparasiGemini({
    idA: validasiIdSpesimen(body.idA, 'keris'),
    idB: validasiIdSpesimen(body.idB, 'joglo'),
    bahasa,
    apiKey,
  });
  res.status(200).json(hasil);
}
