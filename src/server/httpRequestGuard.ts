import { Buffer } from 'node:buffer';
import type { BahasaAktif } from '../content/pusaka.ts';

export const BATAS_BODY_BYTES = 16_384;
export const BATAS_KEDALAMAN_JSON = 6;
export const BAHASA_API_VALID = new Set<BahasaAktif>(['id', 'en', 'jw', 'aks']);

export type HeaderLookup = Record<string, string | string[] | undefined> | undefined;

export function pasangHeaderKeamananApi(
  setHeader?: (name: string, value: string) => void,
): void {
  if (!setHeader) return;
  setHeader('X-Content-Type-Options', 'nosniff');
  setHeader('Cache-Control', 'no-store');
  setHeader('X-Frame-Options', 'DENY');
  setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

function ambilHeaderSingle(headers: HeaderLookup, name: string): string {
  if (!headers) return '';
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (typeof direct === 'string') return direct.trim();
  if (Array.isArray(direct) && typeof direct[0] === 'string') return direct[0].trim();
  return '';
}

/**
 * Mengambil IP klien terpercaya dengan memprioritaskan header platform Vercel & socket langsung
 * ketimbang elemen pertama x-forwarded-for yang dapat dipalsukan klien.
 */
export function ekstrakIpKlienTerpercaya(
  headers: HeaderLookup,
  socketIp?: string,
  fallback = 'vercel',
): string {
  const vercelIp = ambilHeaderSingle(headers, 'x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp.split(',')[0].trim() || fallback;
  }
  const realIp = ambilHeaderSingle(headers, 'x-real-ip');
  if (realIp) return realIp;

  const cleanSocket = socketIp?.trim();
  if (cleanSocket) return cleanSocket;

  const fwd = ambilHeaderSingle(headers, 'x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return fallback;
}

/**
 * Memastikan permintaan POST lintas-origin dari situs pihak ketiga ditolak (CSRF / API quota abuse protection).
 */
export function cekOriginPermintaanApi(headers: HeaderLookup): {
  diizinkan: boolean;
  alasan?: string;
} {
  const secFetchSite = ambilHeaderSingle(headers, 'sec-fetch-site').toLowerCase();
  if (secFetchSite === 'cross-site') {
    return { diizinkan: false, alasan: 'Permintaan cross-site tidak diizinkan.' };
  }

  const origin = ambilHeaderSingle(headers, 'origin');
  if (!origin) {
    return { diizinkan: true };
  }

  let originHost = '';
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return { diizinkan: false, alasan: 'Header Origin tidak valid.' };
  }

  const reqHost = (
    ambilHeaderSingle(headers, 'x-forwarded-host') ||
    ambilHeaderSingle(headers, 'host')
  ).toLowerCase();

  if (reqHost && originHost === reqHost) {
    return { diizinkan: true };
  }

  const hostOnly = originHost.split(':')[0];
  if (hostOnly === 'localhost' || hostOnly === '127.0.0.1' || hostOnly === '[::1]') {
    return { diizinkan: true };
  }

  return { diizinkan: false, alasan: 'Origin eksternal tidak diizinkan mengakses endpoint ini.' };
}

function ukurKedalamanJson(val: unknown, depth = 0, batas = BATAS_KEDALAMAN_JSON): boolean {
  if (depth > batas) return false;
  if (val === null || typeof val !== 'object') return true;
  if (Array.isArray(val)) {
    if (val.length > 64) return false;
    for (const item of val) {
      if (!ukurKedalamanJson(item, depth + 1, batas)) return false;
    }
    return true;
  }
  const entries = Object.entries(val as Record<string, unknown>);
  if (entries.length > 32) return false;
  for (const [, v] of entries) {
    if (!ukurKedalamanJson(v, depth + 1, batas)) return false;
  }
  return true;
}

/**
 * Memvalidasi baik ukuran byte aktual (termasuk pre-parsed req.body di Vercel) maupun struktur JSON.
 */
export function validasiDanParseBodyJson(
  rawOrParsed: unknown,
  contentLengthHeader?: string,
  maxBytes = BATAS_BODY_BYTES,
):
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; status: 400 | 413; error: string } {
  if (contentLengthHeader) {
    const cl = Number(contentLengthHeader);
    if (Number.isFinite(cl) && cl > maxBytes) {
      return { ok: false, status: 413, error: 'Ukuran payload melebihi batas aman 16 KB.' };
    }
  }

  let parsed: unknown;
  if (typeof rawOrParsed === 'string') {
    if (Buffer.byteLength(rawOrParsed, 'utf8') > maxBytes) {
      return { ok: false, status: 413, error: 'Ukuran payload melebihi batas aman 16 KB.' };
    }
    try {
      parsed = JSON.parse(rawOrParsed || '{}') as unknown;
    } catch {
      return { ok: false, status: 400, error: 'Format JSON tubuh permintaan tidak valid.' };
    }
  } else if (Buffer.isBuffer(rawOrParsed)) {
    if (rawOrParsed.byteLength > maxBytes) {
      return { ok: false, status: 413, error: 'Ukuran payload melebihi batas aman 16 KB.' };
    }
    try {
      parsed = JSON.parse(rawOrParsed.toString('utf8') || '{}') as unknown;
    } catch {
      return { ok: false, status: 400, error: 'Format JSON tubuh permintaan tidak valid.' };
    }
  } else {
    parsed = rawOrParsed ?? {};
    try {
      const serialized = JSON.stringify(parsed);
      if (serialized && Buffer.byteLength(serialized, 'utf8') > maxBytes) {
        return { ok: false, status: 413, error: 'Ukuran payload melebihi batas aman 16 KB.' };
      }
    } catch {
      return { ok: false, status: 400, error: 'Struktur tubuh permintaan tidak valid.' };
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      status: 400,
      error: 'Format tubuh permintaan harus berupa objek JSON.',
    };
  }

  if (!ukurKedalamanJson(parsed, 0, BATAS_KEDALAMAN_JSON)) {
    return {
      ok: false,
      status: 400,
      error: 'Struktur JSON terlalu kompleks atau bersarang dalam.',
    };
  }

  return { ok: true, body: parsed as Record<string, unknown> };
}
