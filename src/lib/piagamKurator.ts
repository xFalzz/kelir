import { ambilTeks, type BahasaAktif } from '../content/pusaka.ts';
import { bersihkanInputPengguna } from './aiGuardrail.ts';
import type { JejakKurasi } from './pencarianArsip.ts';

export interface HasilPiagamKurator {
  filename: string;
  dataUrl: string;
}

/**
 * Menghasilkan sertifikat/piagam kurasi KELIR beresolusi 1400x920 PNG secara 100% lokal via Canvas 2D.
 */
export function buatDataUrlPiagamKurator(opts: {
  namaPengunjung: string;
  bahasa: BahasaAktif;
  tema: 'terang' | 'malam';
  jejak: JejakKurasi;
  totalKuis: number;
}): HasilPiagamKurator | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isDark = opts.tema === 'malam';
  const bgMain = isDark ? '#14110e' : '#f7f4ec';
  const bgInner = isDark ? '#1c1813' : '#fffdf8';
  const borderAccent = isDark ? '#d9a452' : '#b85324';
  const borderSoft = isDark ? 'rgba(243,236,224,0.18)' : 'rgba(20,21,24,0.16)';
  const fgPrimary = isDark ? '#f4efe6' : '#141518';
  const fgSecondary = isDark ? '#c6bdb0' : '#434852';

  ctx.fillStyle = bgMain;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bingkai ganda kuratorial
  ctx.strokeStyle = borderAccent;
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 44, 1312, 832);

  ctx.fillStyle = bgInner;
  ctx.fillRect(62, 62, 1276, 796);
  ctx.strokeStyle = borderSoft;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(62, 62, 1276, 796);

  // Header & emblem Hanacaraka
  ctx.textAlign = 'center';
  ctx.fillStyle = borderAccent;
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillText('KELIR  ·  ARSIP SPASIAL WARISAN NUSANTARA  ·  KLR-01 - KLR-12', 700, 136);

  ctx.fillStyle = fgPrimary;
  ctx.font = '700 44px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText(
    ambilTeks(
      {
        id: 'PIAGAM APRESIASI KURATOR',
        en: 'CURATORIAL APPRECIATION CERTIFICATE',
        jw: 'PIAGAM PENGHARGAAN KURATOR',
      },
      opts.bahasa,
    ),
    700,
    224,
  );

  ctx.fillStyle = borderAccent;
  ctx.font = '500 34px "Noto Sans Javanese", serif';
  ctx.fillText('ꦏꦼꦭꦶꦂ  ·  ꦩꦼꦩꦪꦸ ꦲꦪꦸꦤꦶꦁ ꦧꦮꦤ', 700, 282);

  ctx.fillStyle = fgSecondary;
  ctx.font = '400 21px "Inter", sans-serif';
  ctx.fillText(
    ambilTeks(
      {
        id: 'Diberikan secara resmi atas dedikasi penjelajahan warisan budaya Jawa kepada:',
        en: 'Awarded in recognition of spatial heritage exploration and study to:',
        jw: 'Kaparingaken minangka tanda pakurmatan anggenipun nyinau kabudayan Jawi dhumateng:',
      },
      opts.bahasa,
    ),
    700,
    356,
  );

  // Nama pengunjung tersanitasi (Canvas fillText anti-XSS)
  const defaultNama = ambilTeks(
    {
      id: 'Sahabat Budaya KELIR',
      en: 'KELIR Heritage Patron',
      jw: 'Mitra Kabudayan KELIR',
    },
    opts.bahasa,
  );
  const namaBersih = bersihkanInputPengguna(opts.namaPengunjung, 42) || defaultNama;

  ctx.fillStyle = fgPrimary;
  ctx.font = '700 54px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText(namaBersih, 700, 444);

  // Garis pemisah elegan di bawah nama
  ctx.strokeStyle = borderAccent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 472);
  ctx.lineTo(1060, 472);
  ctx.stroke();

  // Empat metrik jejak kurasi
  const cards = [
    {
      label: ambilTeks({ id: 'BEDAH 3D', en: '3D TWIN', jw: 'BEDHAH 3D' }, opts.bahasa),
      val: `${opts.jejak.spesimenDiteliti.length} / 7`,
    },
    {
      label: ambilTeks({ id: 'SULUK', en: 'SULUK', jw: 'SULUK' }, opts.bahasa),
      val: `${opts.jejak.sulukDidengar.length} / 7`,
    },
    {
      label: ambilTeks({ id: 'FAVORIT', en: 'BOOKMARKS', jw: 'FAVORIT' }, opts.bahasa),
      val: `${(opts.jejak.favoritIds ?? []).length} / 7`,
    },
    {
      label: ambilTeks({ id: 'KUIS S1–S7', en: 'QUIZ S1–S7', jw: 'KUIS S1–S7' }, opts.bahasa),
      val: `${opts.jejak.skorKuisTertinggi} / ${opts.totalKuis}`,
    },
  ];

  const startX = 205;
  const cardW = 225;
  const gap = 30;
  for (let i = 0; i < cards.length; i++) {
    const x = startX + i * (cardW + gap);
    const y = 528;
    ctx.fillStyle = isDark ? 'rgba(243,236,224,0.045)' : 'rgba(20,21,24,0.035)';
    ctx.fillRect(x, y, cardW, 134);
    ctx.strokeStyle = borderSoft;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y, cardW, 134);

    ctx.fillStyle = borderAccent;
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(cards[i].label, x + cardW / 2, y + 46);

    ctx.fillStyle = fgPrimary;
    ctx.font = '700 32px "Space Grotesk", "Inter", sans-serif';
    ctx.fillText(cards[i].val, x + cardW / 2, y + 98);
  }

  // Footer catatan arsip S1-S7 & tanggal
  const tanggal = new Date().toLocaleDateString(
    opts.bahasa === 'en' ? 'en-US' : 'id-ID',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  ctx.fillStyle = fgSecondary;
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText(
    `SUMBER PRIMER S1–S7 · UNESCO ICH · MUSEUM SONOBUDOYO · KEMDIKBUD RI · PERPUSNAS RI`,
    700,
    746,
  );
  ctx.fillText(`${tanggal} · DITERBITKAN SECARA LOKAL OLEH RUANG KURASI KELIR`, 700, 784);

  return {
    filename: `piagam-kurator-kelir.png`,
    dataUrl: canvas.toDataURL('image/png'),
  };
}
