import type { SpesimenBedahId } from '../content/pusaka.ts';

export type HalamanValidId = 'beranda' | 'twin' | 'koleksi' | 'pakeliran' | 'kawruh';

export const HALAMAN_VALID: readonly HalamanValidId[] = [
  'beranda',
  'twin',
  'koleksi',
  'pakeliran',
  'kawruh',
] as const;

export type AlasanNotFound = 'path' | 'hal' | 'benda' | 'babak';

export interface SaranRuteKelir {
  halaman: HalamanValidId;
  bendaId?: SpesimenBedahId;
  labelKey: string;
}

export interface HasilEvaluasiRute {
  valid: boolean;
  halaman: HalamanValidId;
  alasan?: AlasanNotFound;
  urlDiminta: string;
  saran?: SaranRuteKelir;
}

const POLA_SARAN_RUTE: Array<{ pola: RegExp; saran: SaranRuteKelir }> = [
  { pola: /\b(keris|tosan|empu|besalen)\b/i, saran: { halaman: 'twin', bendaId: 'keris', labelKey: 'notFound.suggestKeris' } },
  { pola: /\b(saron|gamelan|slendro|karawitan|gending|wilah)\b/i, saran: { halaman: 'twin', bendaId: 'saron', labelKey: 'notFound.suggestSaron' } },
  { pola: /\b(batik|kawung|wastra|canting)\b/i, saran: { halaman: 'twin', bendaId: 'batik', labelKey: 'notFound.suggestBatik' } },
  { pola: /\b(joglo|pendopo|pendhapa|sakaguru|umpak|arsitektur)\b/i, saran: { halaman: 'twin', bendaId: 'joglo', labelKey: 'notFound.suggestJoglo' } },
  { pola: /\b(kidang|kencana)\b/i, saran: { halaman: 'twin', bendaId: 'kidang', labelKey: 'notFound.suggestKidang' } },
  { pola: /\b(koleksi|coverflow|galeri|gallery|suluk)\b/i, saran: { halaman: 'koleksi', labelKey: 'pages.koleksi.label' } },
  { pola: /\b(pakeliran|wayang|rama|dalang|blencong|lakon)\b/i, saran: { halaman: 'pakeliran', labelKey: 'pages.pakeliran.label' } },
  { pola: /\b(kawruh|aksara|hanacaraka|carakan|pamomong|tanya|ai|pustaka|cari|search)\b/i, saran: { halaman: 'kawruh', labelKey: 'pages.kawruh.label' } },
  { pola: /\b(beranda|home|utama|index)\b/i, saran: { halaman: 'beranda', labelKey: 'pages.beranda.label' } },
  { pola: /\b(twin|bedah|cad|studio|anatomi|3d)\b/i, saran: { halaman: 'twin', labelKey: 'pages.twin.label' } },
];

export function sanitasiTampilUrl(raw: string): string {
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim() || '/';
  return cleaned.length > 76 ? `${cleaned.slice(0, 73)}...` : cleaned;
}

export function cariSaranRute(rawUrl: string): SaranRuteKelir | undefined {
  const tokenText = rawUrl.replace(/[/?&=_\-+.]+/g, ' ');
  for (const item of POLA_SARAN_RUTE) {
    if (item.pola.test(tokenText)) {
      return item.saran;
    }
  }
  return undefined;
}

/**
 * Memvalidasi pathname serta parameter query URL aplikasi Kelir dan memberi saran rute terdekat bila tidak valid.
 */
export function evaluasiRuteUrl(
  pathname: string,
  search: string,
  daftarBendaIds: readonly string[],
  jumlahBabak: number,
): HasilEvaluasiRute {
  const rawPath = (pathname || '/').trim() || '/';
  const normPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const searchStr = search && !search.startsWith('?') ? `?${search}` : search || '';
  const urlDiminta = sanitasiTampilUrl(`${normPath}${searchStr}`);

  if (normPath !== '/' && normPath !== '/index.html') {
    return {
      valid: false,
      halaman: 'beranda',
      alasan: 'path',
      urlDiminta,
      saran: cariSaranRute(urlDiminta),
    };
  }

  const params = new URLSearchParams(searchStr);
  let halaman: HalamanValidId = 'beranda';

  if (params.has('hal')) {
    const halParam = params.get('hal') ?? '';
    if (!HALAMAN_VALID.includes(halParam as HalamanValidId)) {
      return {
        valid: false,
        halaman: 'beranda',
        alasan: 'hal',
        urlDiminta,
        saran: cariSaranRute(urlDiminta),
      };
    }
    halaman = halParam as HalamanValidId;
  }

  if (params.has('benda')) {
    const bendaParam = params.get('benda') ?? '';
    if (!daftarBendaIds.includes(bendaParam)) {
      return {
        valid: false,
        halaman,
        alasan: 'benda',
        urlDiminta,
        saran: cariSaranRute(urlDiminta) ?? { halaman: 'twin', labelKey: 'pages.twin.label' },
      };
    }
  }

  if (params.has('babak')) {
    const rawBabak = params.get('babak') ?? '';
    const parsedBabak = Number(rawBabak);
    if (
      rawBabak.trim() === '' ||
      !Number.isInteger(parsedBabak) ||
      parsedBabak < 0 ||
      parsedBabak >= jumlahBabak
    ) {
      return {
        valid: false,
        halaman,
        alasan: 'babak',
        urlDiminta,
        saran: { halaman: 'pakeliran', labelKey: 'pages.pakeliran.label' },
      };
    }
  }

  return {
    valid: true,
    halaman,
    urlDiminta,
  };
}
