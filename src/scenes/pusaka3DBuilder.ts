import * as THREE from 'three';
import type { BendaPusaka } from '../content/pusaka.ts';
import { loadBudayaTextures, tandaiTeksturCacheBersama } from './threeHelpers.ts';
import {
  buildKidangKencana3D,
  buildSriRamaWayang3D,
  normalisasiUvExtrude,
} from './wayang3DBuilder.ts';

export type CoverflowArtefakId = BendaPusaka['id'] | 'kidang' | 'hanacaraka';

export interface PaketModel3D {
  group: THREE.Group;
  blencongFlame?: THREE.Mesh | null;
  blencongLight?: THREE.PointLight | null;
  orbitAccent?: THREE.Object3D | null;
  saronWilahs?: THREE.Group[];
  saronGandhen?: THREE.Group | null;
  pinAnchors?: Record<string, THREE.Object3D>;
}

function tanamPinAnchor(
  parent: THREE.Object3D,
  id: string,
  x: number,
  y: number,
  z: number,
  anchors: Record<string, THREE.Object3D>,
): void {
  const anchor = new THREE.Object3D();
  anchor.name = `pin-anchor-${id}`;
  anchor.position.set(x, y, z);
  anchor.userData.skipCad = true;
  parent.add(anchor);
  anchors[id] = anchor;
}

interface PasanganTekstur {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
}

let cachePamorKeris: PasanganTekstur | null = null;
let cachePerungguGangsa: PasanganTekstur | null = null;
let cacheBatikKawung: PasanganTekstur | null = null;
let cacheUkiranRancakan: PasanganTekstur | null = null;
let cacheGentengAtap: PasanganTekstur | null = null;
let cachePrasastiHanacaraka: PasanganTekstur | null = null;
const cachePusakaExtrude = new Map<string, THREE.BufferGeometry>();

function ambilAtauBuatPusakaExtrude(
  kunci: string,
  buat: () => THREE.BufferGeometry,
): THREE.BufferGeometry {
  let geo = cachePusakaExtrude.get(kunci);
  if (!geo) {
    geo = buat();
    cachePusakaExtrude.set(kunci, geo);
  }
  return geo.clone();
}

export function buatTeksturPamorKeris(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cachePamorKeris) return cachePamorKeris;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 512;
  const bctx = bumpCanvas.getContext('2d');
  if (!ctx || !bctx) return { diffuse: null, bump: null };

  ctx.scale(0.5, 0.5);
  bctx.scale(0.5, 0.5);

  // Baja inti tempa hitam warangan arsenik
  ctx.fillStyle = '#14171c';
  ctx.fillRect(0, 0, 512, 1024);
  bctx.fillStyle = '#262626';
  bctx.fillRect(0, 0, 512, 1024);

  // Lipatan berlapis pamor nikel meteorit (Beras Wutah / Wos Wutah & Ngulit Semangka)
  for (let i = 0; i < 128; i++) {
    const lw = (i % 3) + 1.05;
    const alpha = 0.24 + (i % 5) * 0.14;
    ctx.strokeStyle = `rgba(236, 241, 248, ${alpha})`;
    ctx.lineWidth = lw;

    bctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.15)})`;
    bctx.lineWidth = lw + 0.8;

    const baseY = i * 8.05;
    ctx.beginPath();
    bctx.beginPath();
    ctx.moveTo(0, baseY);
    bctx.moveTo(0, baseY);

    for (let x = 0; x <= 512; x += 14) {
      const yOff =
        Math.sin(x * 0.048 + i * 0.68) * 10 +
        Math.cos(x * 0.125 - i * 0.42) * 4.2;
      ctx.lineTo(x, baseY + yOff);
      bctx.lineTo(x, baseY + yOff);
    }
    ctx.stroke();
    bctx.stroke();
  }

  // Taburan kristal butir meteorit di sepanjang punggung ada-ada
  for (let y = 32; y < 992; y += 38) {
    const cx = 256 + Math.sin(y * 0.17) * 24;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.62)';
    ctx.beginPath();
    ctx.ellipse(cx, y, 14, 6, 0.35, 0, Math.PI * 2);
    ctx.fill();

    bctx.fillStyle = '#ffffff';
    bctx.beginPath();
    bctx.ellipse(cx, y, 14, 6, 0.35, 0, Math.PI * 2);
    bctx.fill();
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  cachePamorKeris = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cachePamorKeris;
}

function buatTeksturPerungguGangsa(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cachePerungguGangsa) return cachePerungguGangsa;

  const size = 256;
  const logical = 512;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = size;
  diffCanvas.height = size;
  const dCtx = diffCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

  dCtx.scale(0.5, 0.5);
  bCtx.scale(0.5, 0.5);

  const grad = dCtx.createLinearGradient(0, 0, logical, logical);
  grad.addColorStop(0, '#f3c15c');
  grad.addColorStop(0.5, '#d9962b');
  grad.addColorStop(1, '#b87419');
  dCtx.fillStyle = grad;
  dCtx.fillRect(0, 0, logical, logical);

  bCtx.fillStyle = '#7c7c7c';
  bCtx.fillRect(0, 0, logical, logical);

  // Jejak palu tempa pengrajin gangsa 78/22 & guratan laras nada
  for (let i = 0; i < 240; i++) {
    const x = ((i * 97) % logical);
    const y = ((i * 53) % logical);
    const r = 6 + (i % 10);
    dCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 240, 195, 0.08)' : 'rgba(90, 52, 8, 0.09)';
    dCtx.beginPath();
    dCtx.ellipse(x, y, r, r * 0.72, (i * 0.4) % Math.PI, 0, Math.PI * 2);
    dCtx.fill();

    bCtx.fillStyle = i % 2 === 0 ? 'rgba(210, 210, 210, 0.28)' : 'rgba(55, 55, 55, 0.28)';
    bCtx.beginPath();
    bCtx.ellipse(x, y, r, r * 0.72, (i * 0.4) % Math.PI, 0, Math.PI * 2);
    bCtx.fill();
  }

  for (let y = 0; y < logical; y += 8) {
    dCtx.strokeStyle = 'rgba(255, 250, 230, 0.05)';
    dCtx.beginPath();
    dCtx.moveTo(0, y);
    dCtx.lineTo(logical, y);
    dCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(diffCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  cachePerungguGangsa = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cachePerungguGangsa;
}

export function buatTeksturBatikKawung(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheBatikKawung) return cacheBatikKawung;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bctx = bumpCanvas.getContext('2d');
  if (!ctx || !bctx) return { diffuse: null, bump: null };

  ctx.scale(0.5, 0.5);
  bctx.scale(0.5, 0.5);

  // Latar biru nila tarum & soga keraton gelap
  ctx.fillStyle = '#18120e';
  ctx.fillRect(0, 0, 1024, 1024);
  bctx.fillStyle = '#383838';
  bctx.fillRect(0, 0, 1024, 1024);

  // Serat tenun mikro mori primissima (lusi & pakan)
  ctx.strokeStyle = 'rgba(255, 240, 220, 0.035)';
  bctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  bctx.lineWidth = 1;
  for (let g = 0; g < 1024; g += 16) {
    ctx.beginPath();
    ctx.moveTo(g, 0);
    ctx.lineTo(g, 1024);
    ctx.moveTo(0, g);
    ctx.lineTo(1024, g);
    ctx.stroke();

    bctx.beginPath();
    bctx.moveTo(g, 0);
    bctx.lineTo(g, 1024);
    bctx.moveTo(0, g);
    bctx.lineTo(1024, g);
    bctx.stroke();
  }

  const step = 128;
  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      const cx = col * step;
      const cy = row * step;

      // 4 kelopak buah aren (Kawung Picis) mengelilingi pancer
      const arah = [
        [-32, -32, Math.PI * 0.25],
        [32, -32, Math.PI * 0.75],
        [32, 32, Math.PI * 1.25],
        [-32, 32, Math.PI * 1.75],
      ];
      for (const [ox, oy, rot] of arah) {
        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(rot);

        ctx.fillStyle = '#c27832';
        ctx.beginPath();
        ctx.ellipse(0, 0, 39, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f6deb3';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Isen-isen sawut garis halus & cecek pitu di dalam kelopak aren
        ctx.strokeStyle = 'rgba(255, 248, 225, 0.45)';
        ctx.lineWidth = 1.4;
        for (const aLine of [-14, -7, 0, 7, 14]) {
          ctx.beginPath();
          ctx.moveTo(aLine, -10);
          ctx.lineTo(aLine, 10);
          ctx.stroke();
        }

        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(-11, 0, 3.2, 0, Math.PI * 2);
        ctx.arc(11, 0, 3.2, 0, Math.PI * 2);
        ctx.arc(0, -6, 1.8, 0, Math.PI * 2);
        ctx.arc(0, 6, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        bctx.save();
        bctx.translate(cx + ox, cy + oy);
        bctx.rotate(rot);
        bctx.strokeStyle = '#ffffff';
        bctx.lineWidth = 5;
        bctx.beginPath();
        bctx.ellipse(0, 0, 39, 20, 0, 0, Math.PI * 2);
        bctx.stroke();
        bctx.restore();
      }

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cx + step / 2 - 8, cy + step / 2 - 8, 16, 16);
    }
  }

  // Pinggiran Tumpal Kemada segitiga serit
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(0, 0, 1024, 54);
  ctx.fillRect(0, 970, 1024, 54);
  ctx.fillStyle = '#f5d08a';
  for (let tx = 0; tx < 1024; tx += 32) {
    ctx.beginPath();
    ctx.moveTo(tx, 54);
    ctx.lineTo(tx + 16, 26);
    ctx.lineTo(tx + 32, 54);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(tx, 970);
    ctx.lineTo(tx + 16, 998);
    ctx.lineTo(tx + 32, 970);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 1008, 1008);

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bumpCanvas);

  cacheBatikKawung = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheBatikKawung;
}

function buatTeksturUkiranRancakan(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheUkiranRancakan) return cacheUkiranRancakan;

  const w = 1024;
  const h = 256;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 512;
  dCanvas.height = 128;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 512;
  bCanvas.height = 128;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

  dCtx.scale(0.5, 0.5);
  bCtx.scale(0.5, 0.5);

  dCtx.fillStyle = '#4c180c';
  dCtx.fillRect(0, 0, w, h);
  bCtx.fillStyle = '#323232';
  bCtx.fillRect(0, 0, w, h);

  // Bingkai ukiran lung-lungan emas prada pada tebeng rancakan
  for (const ctx of [dCtx, bCtx]) {
    ctx.strokeStyle = ctx === dCtx ? '#e6b655' : '#e8e8e8';
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.lineWidth = 2.5;
    ctx.strokeRect(30, 30, w - 60, h - 60);
  }

  for (let i = 0; i < 8; i++) {
    const cx = 92 + i * 120;
    const cy = h / 2;
    for (const ctx of [dCtx, bCtx]) {
      ctx.strokeStyle = ctx === dCtx ? '#f3ca6b' : '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 1.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 26, cy, 20, Math.PI * 0.4, Math.PI * 1.9);
      ctx.stroke();

      ctx.fillStyle = ctx === dCtx ? '#b91c1c' : '#a8a8a8';
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bCanvas);
  cacheUkiranRancakan = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheUkiranRancakan;
}

function buatTeksturGentengAtap(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheGentengAtap) return cacheGentengAtap;

  const size = 512;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 256;
  dCanvas.height = 256;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 256;
  bCanvas.height = 256;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

  dCtx.scale(0.5, 0.5);
  bCtx.scale(0.5, 0.5);

  dCtx.fillStyle = '#8b3116';
  dCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#404040';
  bCtx.fillRect(0, 0, size, size);

  const rows = 12;
  const cols = 12;
  const rw = size / cols;
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shade = 128 + ((r * 7 + c * 13) % 34) - 17;
      dCtx.fillStyle = `rgb(${shade}, ${Math.round(shade * 0.36)}, ${Math.round(shade * 0.19)})`;
      dCtx.fillRect(c * rw + 1, r * rh + 1, rw - 2, rh - 2);
      dCtx.strokeStyle = 'rgba(28, 12, 6, 0.42)';
      dCtx.strokeRect(c * rw, r * rh, rw, rh);

      const g = dCtx.createLinearGradient(c * rw, r * rh, c * rw, (r + 1) * rh);
      g.addColorStop(0, '#505050');
      g.addColorStop(0.7, '#d8d8d8');
      g.addColorStop(1, '#262626');
      bCtx.fillStyle = g;
      bCtx.fillRect(c * rw + 1, r * rh + 1, rw - 2, rh - 2);
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(2.5, 2.5);

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2.5, 2.5);

  cacheGentengAtap = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheGentengAtap;
}

function buatTeksturPrasastiHanacaraka(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cachePrasastiHanacaraka) return cachePrasastiHanacaraka;

  const w = 768;
  const h = 1024;
  const outW = 512;
  const outH = 682;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = outW;
  dCanvas.height = outH;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = outW;
  bCanvas.height = outH;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

  dCtx.scale(outW / w, outH / h);
  bCtx.scale(outW / w, outH / h);

  // Lempeng perunggu tua berpatina gelap
  const bg = dCtx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#26201a');
  bg.addColorStop(0.5, '#191511');
  bg.addColorStop(1, '#2a221b');
  dCtx.fillStyle = bg;
  dCtx.fillRect(0, 0, w, h);
  bCtx.fillStyle = '#363636';
  bCtx.fillRect(0, 0, w, h);

  // Bingkai garis ukir ganda kuningan
  for (const ctx of [dCtx, bCtx]) {
    ctx.strokeStyle = ctx === dCtx ? '#e0b35a' : '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, w - 104, h - 104);
  }

  // Kisi ukir 20 Carakan Nglegena (4 baris x 5 aksara)
  const barisCarakan = [
    'ꦲ ꦤ ꦕ ꦫ ꦏ',
    'ꦢ ꦠ ꦱ ꦮ ꦭ',
    'ꦥ ꦝ ꦗ ꦪ ꦚ',
    'ꦩ ꦒ ꦧ ꦛ ꦔ',
  ];

  dCtx.textAlign = 'center';
  bCtx.textAlign = 'center';

  dCtx.fillStyle = '#d1491b';
  dCtx.font = '700 22px monospace';
  dCtx.fillText('UNICODE U+A980 - U+A9DF · S7', w / 2, 108);

  dCtx.fillStyle = '#f2d388';
  dCtx.font = '700 84px "Noto Sans Javanese", serif';
  bCtx.fillStyle = '#f8f8f8';
  bCtx.font = '700 84px "Noto Sans Javanese", serif';
  dCtx.fillText('ꦏꦼꦭꦶꦂ', w / 2, 224);
  bCtx.fillText('ꦏꦼꦭꦶꦂ', w / 2, 224);

  dCtx.strokeStyle = 'rgba(224, 179, 90, 0.45)';
  dCtx.lineWidth = 2;
  dCtx.beginPath();
  dCtx.moveTo(96, 272);
  dCtx.lineTo(w - 96, 272);
  dCtx.stroke();

  dCtx.font = '600 58px "Noto Sans Javanese", serif';
  bCtx.font = '600 58px "Noto Sans Javanese", serif';
  barisCarakan.forEach((baris, idx) => {
    const y = 390 + idx * 124;
    dCtx.fillStyle = idx % 2 === 0 ? '#f4e6c2' : '#e0b35a';
    dCtx.fillText(baris, w / 2, y);
    bCtx.fillStyle = '#ffffff';
    bCtx.fillText(baris, w / 2, y);
  });

  dCtx.fillStyle = 'rgba(244, 239, 230, 0.68)';
  dCtx.font = '600 20px monospace';
  dCtx.fillText('NGLEGENA · PASANGAN · SANDHANGAN SWARA', w / 2, h - 86);

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bCanvas);
  cachePrasastiHanacaraka = {
    diffuse: tandaiTeksturCacheBersama(diffuse),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cachePrasastiHanacaraka;
}

function buatGeometriAtapTrapesiumTwin(
  wBawah: number,
  dBawah: number,
  wAtas: number,
  dAtas: number,
  tinggi: number,
): THREE.BufferGeometry {
  const hw0 = wBawah / 2;
  const hd0 = dBawah / 2;
  const hw1 = wAtas / 2;
  const hd1 = dAtas / 2;
  const hy = tinggi / 2;

  const p = [
    [-hw0, -hy, hd0],
    [hw0, -hy, hd0],
    [hw0, -hy, -hd0],
    [-hw0, -hy, -hd0],
    [-hw1, hy, hd1],
    [hw1, hy, hd1],
    [hw1, hy, -hd1],
    [-hw1, hy, -hd1],
  ];

  const quads: Array<[number, number, number, number]> = [
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [4, 5, 6, 7],
    [3, 2, 1, 0],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];
  for (const [a, b, c, d] of quads) {
    positions.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/** Membuat instrumen 3D Pelita Minyak Blencong Kuningan bersayap Garuda dengan 5 sub-rakitan anatomi bedah. */
export function buildBlencongWayang3D(): {
  group: THREE.Group;
  flame: THREE.Mesh;
  light: THREE.PointLight;
} {
  const kuninganMat = new THREE.MeshStandardMaterial({
    color: 0xe6b655,
    metalness: 0.9,
    roughness: 0.2,
  });
  const perungguGelapMat = new THREE.MeshStandardMaterial({
    color: 0x4b3822,
    metalness: 0.76,
    roughness: 0.34,
  });
  const minyakMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.15,
    roughness: 0.12,
  });
  const apiMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xff7b24,
    emissiveIntensity: 2.2,
    roughness: 0.18,
  });

  const blencong = new THREE.Group();

  // 1. Cawan Kuningan Cor Berukir Sabuk & Kaki Pendulum
  const cawanGrup = new THREE.Group();
  cawanGrup.userData.explodeVec = new THREE.Vector3(0, -0.18, 0);
  const profil = [
    new THREE.Vector2(0.001, -0.22),
    new THREE.Vector2(0.055, -0.18),
    new THREE.Vector2(0.032, -0.12),
    new THREE.Vector2(0.18, -0.06),
    new THREE.Vector2(0.24, 0.04),
    new THREE.Vector2(0.21, 0.09),
    new THREE.Vector2(0.17, 0.05),
    new THREE.Vector2(0.001, 0.03),
  ];
  const mangkuk = new THREE.Mesh(new THREE.LatheGeometry(profil, 32), kuninganMat);
  mangkuk.castShadow = true;
  const sabukCawan = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.013, 10, 28), perungguGelapMat);
  sabukCawan.rotation.x = Math.PI / 2;
  sabukCawan.position.y = 0.02;
  cawanGrup.add(mangkuk, sabukCawan);

  // 2. Wadah Genangan Minyak Kelapa Klentik & Cincin Pelampung
  const minyakGrup = new THREE.Group();
  minyakGrup.userData.explodeVec = new THREE.Vector3(0, 0.18, 0.04);
  const minyak = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 24), minyakMat);
  minyak.position.y = 0.045;
  const cincinMinyak = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.008, 8, 22), kuninganMat);
  cincinMinyak.rotation.x = Math.PI / 2;
  cincinMinyak.position.y = 0.058;
  minyakGrup.add(minyak, cincinMinyak);

  // 3. Corong Sumbu Kapas & Nyala Api Blencong
  const corongGrup = new THREE.Group();
  corongGrup.userData.explodeVec = new THREE.Vector3(0.32, 0.08, 0.04);
  const corong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.19, 14), kuninganMat);
  corong.rotation.z = -Math.PI * 0.46;
  corong.position.set(0.22, 0.065, 0);
  const sumbu = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.08, 10), perungguGelapMat);
  sumbu.rotation.z = -0.35;
  sumbu.position.set(0.3, 0.09, 0);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 12), apiMat);
  flame.scale.set(0.72, 1.55, 0.72);
  flame.position.set(0.32, 0.16, 0);
  const light = new THREE.PointLight(0xff9c3b, 2.2, 5.2);
  light.position.set(0.34, 0.18, 0.04);
  corongGrup.add(corong, sumbu, flame, light);

  // 4. Sayap Ukiran Garuda Penyeimbang Belakang
  const sayapGrup = new THREE.Group();
  sayapGrup.userData.explodeVec = new THREE.Vector3(-0.28, 0.12, -0.04);
  const sayapGeo = ambilAtauBuatPusakaExtrude('blencong-sayap', () => {
    const sayapShape = new THREE.Shape();
    sayapShape.moveTo(0, -0.02);
    sayapShape.quadraticCurveTo(0.14, 0.04, 0.34, 0.18);
    sayapShape.quadraticCurveTo(0.24, 0.34, 0.08, 0.38);
    sayapShape.lineTo(0, 0.24);
    sayapShape.lineTo(-0.08, 0.38);
    sayapShape.quadraticCurveTo(-0.24, 0.34, -0.34, 0.18);
    sayapShape.quadraticCurveTo(-0.14, 0.04, 0, -0.02);

    const g = new THREE.ExtrudeGeometry(sayapShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const sayap = new THREE.Mesh(sayapGeo, kuninganMat);
  sayap.rotation.y = Math.PI / 2;
  sayap.position.set(-0.2, 0.08, 0);
  const engselSayap = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.08, 10), perungguGelapMat);
  engselSayap.rotation.z = Math.PI / 2;
  engselSayap.position.set(-0.18, 0.06, 0);
  sayapGrup.add(sayap, engselSayap);

  // 5. Batang Rantai & Kait Penggantung Plafon Dalang
  const gantunganGrup = new THREE.Group();
  gantunganGrup.userData.explodeVec = new THREE.Vector3(0, 0.38, 0);
  const batangGantung = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 0.62, 10),
    perungguGelapMat,
  );
  batangGantung.position.set(0, 0.42, 0);
  const kerahGantung = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.01, 8, 18), kuninganMat);
  kerahGantung.rotation.x = Math.PI / 2;
  kerahGantung.position.set(0, 0.13, 0);
  const kait = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 10, 22), kuninganMat);
  kait.position.set(0, 0.74, 0);
  gantunganGrup.add(batangGantung, kerahGantung, kait);

  blencong.add(cawanGrup, minyakGrup, corongGrup, sayapGrup, gantunganGrup);

  return { group: blencong, flame, light };
}

/** 1. Keris Luk 5 Pandhawa Lare: Bilah pamor, inti baja sliron, ricikan, kinatah, ganja, pesi, mendak, selut mirah, hulu nunggak semi, warangka 3-lapis. */
export function buildKerisPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const tex = loadBudayaTextures();
  const pamor = buatTeksturPamorKeris();

  const bilahMat = new THREE.MeshStandardMaterial({
    map: pamor.diffuse,
    bumpMap: pamor.bump,
    bumpScale: 0.042,
    color: 0xe5e7eb,
    metalness: 0.92,
    roughness: 0.22,
  });
  const bajaIntiMat = new THREE.MeshStandardMaterial({
    color: 0x2a323d,
    metalness: 0.95,
    roughness: 0.28,
  });
  const emasMat = new THREE.MeshStandardMaterial({
    color: 0xf6c344,
    metalness: 0.92,
    roughness: 0.18,
  });
  const mirahMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.48,
    roughness: 0.12,
    metalness: 0.35,
  });
  const kayuKemuningMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x743c19,
    roughness: 0.36,
    metalness: 0.08,
  });
  const lubangDalamMat = new THREE.MeshStandardMaterial({
    color: 0x1a110b,
    roughness: 0.92,
    metalness: 0.05,
  });

  // A. Wilah Luk 5 + Tulang Punggung Ada-Ada (Lapisan Lipatan Pamor)
  const wilahGrup = new THREE.Group();
  wilahGrup.userData.explodeVec = new THREE.Vector3(0, 0.44, 0.16);

  const wilahPoints: THREE.Vector3[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const y = -0.3 + u * 2.18;
    const wave = Math.sin(u * Math.PI * 5) * 0.095 * (1 - u * 0.44);
    wilahPoints.push(new THREE.Vector3(wave, y, 0));
  }
  const curve = new THREE.CatmullRomCurve3(wilahPoints);
  const wilahGeo = new THREE.TubeGeometry(curve, 52, 0.122, 6, false);
  const pos = wilahGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = THREE.MathUtils.clamp((y + 0.3) / 2.18, 0, 1);
    const flare = t < 0.15 ? 1.56 - t * 2.7 : 1 - t * 0.76;
    pos.setX(i, pos.getX(i) * flare);
    pos.setZ(i, pos.getZ(i) * (0.26 * (1 - t * 0.62)));
  }
  wilahGeo.computeVertexNormals();
  const wilahMesh = new THREE.Mesh(wilahGeo, bilahMat);
  wilahMesh.castShadow = true;
  wilahGrup.add(wilahMesh);

  // Tulang tengah Ada-Ada sepanjang bilah luk 5
  const adaAdaGeo = new THREE.TubeGeometry(curve, 76, 0.015, 6, false);
  const adaPos = adaAdaGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < adaPos.count; i++) {
    const t = THREE.MathUtils.clamp((adaPos.getY(i) + 0.3) / 2.18, 0, 1);
    adaPos.setX(i, adaPos.getX(i) * (1 - t * 0.4));
    adaPos.setZ(i, adaPos.getZ(i) * (1.35 - t * 0.6));
  }
  adaAdaGeo.computeVertexNormals();
  wilahGrup.add(new THREE.Mesh(adaAdaGeo, bilahMat));
  tanamPinAnchor(wilahGrup, 'keris-wilah', 0, 1.32, 0.08, pinAnchors);

  // A2. Sliron / Baja Inti Karbon (Tersingkap keluar di belakang kulit pamor saat diledakkan)
  const slironGrup = new THREE.Group();
  slironGrup.userData.explodeVec = new THREE.Vector3(-0.08, 0.44, -0.34);
  const slironGeo = new THREE.TubeGeometry(curve, 44, 0.068, 6, false);
  const slironPos = slironGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < slironPos.count; i++) {
    const t = THREE.MathUtils.clamp((slironPos.getY(i) + 0.3) / 2.18, 0, 1);
    slironPos.setX(i, slironPos.getX(i) * (0.82 - t * 0.54));
    slironPos.setZ(i, slironPos.getZ(i) * (0.14 * (1 - t * 0.5)));
  }
  slironGeo.computeVertexNormals();
  slironGrup.add(new THREE.Mesh(slironGeo, bajaIntiMat));

  // A3. Ricikan Gandik Depan (Sekar Kacang, Jalen & Lambe Gajah)
  const ricikanGrup = new THREE.Group();
  ricikanGrup.userData.explodeVec = new THREE.Vector3(-0.42, 0.34, 0.24);
  const kembangKacang = new THREE.Mesh(
    new THREE.TorusGeometry(0.058, 0.017, 12, 24, Math.PI * 1.54),
    bilahMat,
  );
  kembangKacang.position.set(-0.145, -0.21, 0);
  kembangKacang.rotation.z = 0.45;
  const jalen = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.056, 6), bilahMat);
  jalen.rotation.z = Math.PI * 0.68;
  jalen.position.set(-0.175, -0.29, 0);
  const lambeGajah = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.044, 6), bilahMat);
  lambeGajah.rotation.z = Math.PI * 0.58;
  lambeGajah.position.set(-0.195, -0.23, 0);
  ricikanGrup.add(kembangKacang, jalen, lambeGajah);

  // A4. Kinatah Emas Sogokan Kembar, Tikel Alis & 7 Gerigi Greneng Sorsoran
  const kinatahGrup = new THREE.Group();
  kinatahGrup.userData.explodeVec = new THREE.Vector3(0.32, 0.28, 0.34);
  for (const zSide of [-0.025, 0.025]) {
    const sogokan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.015, 0.42, 8),
      emasMat,
    );
    sogokan.position.set(-0.02, -0.07, zSide);
    const tikelAlis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.009, 0.22, 8),
      emasMat,
    );
    tikelAlis.position.set(0.036, -0.14, zSide);
    kinatahGrup.add(sogokan, tikelAlis);
  }
  for (let g = 0; g < 7; g++) {
    const duri = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.038, 5), bilahMat);
    duri.rotation.z = -Math.PI / 2;
    duri.position.set(0.16 - g * 0.013, -0.295 + g * 0.032, 0);
    kinatahGrup.add(duri);
  }
  tanamPinAnchor(kinatahGrup, 'keris-pamor', 0.08, -0.08, 0.07, pinAnchors);

  // B. Ganja Sebit Rontal / Kelap Lintah + Lubang Pengunci Pesi
  const ganjaGrup = new THREE.Group();
  ganjaGrup.position.set(0, -0.35, 0);
  ganjaGrup.userData.explodeVec = new THREE.Vector3(-0.34, 0.14, 0.42);
  const ganjaGeo = ambilAtauBuatPusakaExtrude('keris-ganja', () => {
    const ganjaShape = new THREE.Shape();
    ganjaShape.moveTo(-0.27, -0.038);
    ganjaShape.quadraticCurveTo(-0.16, 0.048, -0.04, 0.035);
    ganjaShape.quadraticCurveTo(0.08, 0.048, 0.2, 0.018);
    ganjaShape.lineTo(0.35, -0.012);
    ganjaShape.quadraticCurveTo(0.14, -0.062, -0.25, -0.064);
    ganjaShape.closePath();
    const g = new THREE.ExtrudeGeometry(ganjaShape, {
      depth: 0.094,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.011,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const ganjaMesh = new THREE.Mesh(ganjaGeo, bilahMat);
  ganjaMesh.position.set(0, 0, -0.047);
  ganjaMesh.castShadow = true;
  const lubangGanja = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.098, 12), lubangDalamMat);
  lubangGanja.position.set(0, -0.01, 0);
  ganjaGrup.add(ganjaMesh, lubangGanja);
  tanamPinAnchor(ganjaGrup, 'keris-ganja', -0.04, 0.01, 0.08, pinAnchors);

  // C. Pesi Baja Tempa Penusuk Hulu + Bahu Methuk
  const pesiGrup = new THREE.Group();
  pesiGrup.position.set(0, -0.63, 0);
  pesiGrup.userData.explodeVec = new THREE.Vector3(0, -0.08, -0.34);
  const pesiBatang = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.014, 0.58, 12), bajaIntiMat);
  const methukRing = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.036, 0.045, 14), emasMat);
  methukRing.position.y = 0.27;
  pesiGrup.add(pesiBatang, methukRing);

  // D1. Mendak Ring Kuningan Bertingkat (Terpisah dari Selut saat diledakkan)
  const mendakRingGrup = new THREE.Group();
  mendakRingGrup.position.set(0, -0.44, 0);
  mendakRingGrup.userData.explodeVec = new THREE.Vector3(0, -0.18, 0.38);
  const cincinAtas = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.018, 14, 30), emasMat);
  cincinAtas.rotation.x = Math.PI / 2;
  cincinAtas.position.y = 0.02;
  const cincinUtama = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.022, 16, 32), emasMat);
  cincinUtama.rotation.x = Math.PI / 2;
  cincinUtama.position.y = -0.008;
  mendakRingGrup.add(cincinAtas, cincinUtama);

  // D2. Selut Mahkota Bertatah 16 Permata Mirah Delima
  const selutGrup = new THREE.Group();
  selutGrup.position.set(0, -0.51, 0);
  selutGrup.userData.explodeVec = new THREE.Vector3(0, -0.42, 0.32);
  const selutBawah = new THREE.Mesh(new THREE.SphereGeometry(0.094, 24, 18), emasMat);
  selutBawah.scale.y = 0.62;
  const bibirSelut = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.012, 10, 24), emasMat);
  bibirSelut.rotation.x = Math.PI / 2;
  bibirSelut.position.y = -0.045;
  selutGrup.add(selutBawah, bibirSelut);
  for (let p = 0; p < 16; p++) {
    const ang = (p / 16) * Math.PI * 2;
    const permata = new THREE.Mesh(new THREE.OctahedronGeometry(0.014, 0), mirahMat);
    permata.position.set(Math.cos(ang) * 0.092, 0.01, Math.sin(ang) * 0.092);
    selutGrup.add(permata);
  }
  tanamPinAnchor(selutGrup, 'keris-pesi', 0, 0.03, 0.12, pinAnchors);

  // E. Hulu Surakarta (Ukiran Nunggak Semi + Rongga Pesi + Sabuk Patra Terpisah)
  const huluGrup = new THREE.Group();
  huluGrup.userData.explodeVec = new THREE.Vector3(-0.14, -0.58, 0);
  const huluPoints = [
    new THREE.Vector3(0, -0.49, 0),
    new THREE.Vector3(0.025, -0.68, 0),
    new THREE.Vector3(-0.04, -0.88, 0),
    new THREE.Vector3(-0.14, -1.08, 0),
    new THREE.Vector3(-0.19, -1.2, 0),
  ];
  const huluTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(huluPoints), 44, 0.088, 12, false),
    kayuKemuningMat,
  );
  huluTube.castShadow = true;
  const ronggaHulu = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 14), lubangDalamMat);
  ronggaHulu.position.set(0, -0.485, 0);
  const bungkulAtas = new THREE.Mesh(new THREE.SphereGeometry(0.096, 18, 16), kayuKemuningMat);
  bungkulAtas.scale.set(0.95, 1.15, 0.85);
  bungkulAtas.position.set(-0.19, -1.22, 0);

  const sabukHuluGrup = new THREE.Group();
  sabukHuluGrup.position.set(-0.08, -0.94, 0);
  sabukHuluGrup.userData.explodeVec = new THREE.Vector3(-0.24, -0.08, 0.22);
  const sabukHulu = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.011, 10, 24), emasMat);
  sabukHulu.rotation.x = Math.PI / 2;
  sabukHulu.rotation.y = 0.25;
  sabukHuluGrup.add(sabukHulu);

  huluGrup.add(huluTube, ronggaHulu, bungkulAtas, sabukHuluGrup);
  tanamPinAnchor(huluGrup, 'keris-hulu', -0.09, -0.98, 0.11, pinAnchors);

  // F. Warangka 3-Bagian Terpisah: Gayaman Kayu Timoho + Gandar + Selongsong Pendok Bunton Emas
  const warangka = new THREE.Group();
  warangka.position.set(0.38, 0.18, -0.26);
  warangka.userData.explodeVec = new THREE.Vector3(0.56, 0.08, -0.22);

  const gayamanGrup = new THREE.Group();
  gayamanGrup.position.set(0, 0.18, -0.25);
  gayamanGrup.userData.explodeVec = new THREE.Vector3(0, 0.44, 0.08);
  const gayamanGeo = ambilAtauBuatPusakaExtrude('keris-gayaman', () => {
    const gayamanShape = new THREE.Shape();
    gayamanShape.moveTo(-0.49, 0.06);
    gayamanShape.quadraticCurveTo(-0.58, 0.25, -0.18, 0.28);
    gayamanShape.quadraticCurveTo(0.29, 0.29, 0.56, 0.15);
    gayamanShape.quadraticCurveTo(0.44, -0.08, 0.16, -0.12);
    gayamanShape.lineTo(-0.22, -0.12);
    gayamanShape.quadraticCurveTo(-0.45, -0.08, -0.49, 0.06);

    const g = new THREE.ExtrudeGeometry(gayamanShape, {
      depth: 0.135,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.02,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const gayamanAtas = new THREE.Mesh(gayamanGeo, kayuKemuningMat);
  gayamanAtas.position.set(0, 0, -0.07);
  const lubangGayaman = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.032, 0.055), lubangDalamMat);
  lubangGayaman.position.set(0.02, 0.24, 0);
  gayamanGrup.add(gayamanAtas, lubangGayaman);
  tanamPinAnchor(gayamanGrup, 'keris-warangka', 0.06, 0.06, 0.11, pinAnchors);

  const gandarGrup = new THREE.Group();
  gandarGrup.position.set(0, -0.68, -0.25);
  gandarGrup.userData.explodeVec = new THREE.Vector3(0, -0.06, -0.14);
  const gandarKayu = new THREE.Mesh(
    new THREE.CylinderGeometry(0.106, 0.064, 1.62, 20),
    kayuKemuningMat,
  );
  gandarKayu.scale.z = 0.46;
  const pasakGandar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.05), kayuKemuningMat);
  pasakGandar.position.y = 0.84;
  gandarGrup.add(gandarKayu, pasakGandar);

  const pendokGrup = new THREE.Group();
  pendokGrup.position.set(0, -0.72, -0.25);
  pendokGrup.userData.explodeVec = new THREE.Vector3(0.36, -0.34, 0.28);
  const pendokEmas = new THREE.Mesh(
    new THREE.CylinderGeometry(0.118, 0.072, 1.54, 20),
    emasMat,
  );
  pendokEmas.scale.z = 0.52;
  const buntutPendok = new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 12), emasMat);
  buntutPendok.scale.set(1, 1.35, 0.55);
  buntutPendok.position.set(0, -0.78, 0);
  for (const py of [0.56, 0.0, -0.52]) {
    const sabukPendok = new THREE.Mesh(new THREE.TorusGeometry(0.1 - (0.56 - py) * 0.025, 0.009, 8, 22), emasMat);
    sabukPendok.rotation.x = Math.PI / 2;
    sabukPendok.scale.y = 0.54;
    sabukPendok.position.y = py;
    pendokGrup.add(sabukPendok);
  }
  pendokGrup.add(pendokEmas, buntutPendok);

  warangka.add(gayamanGrup, gandarGrup, pendokGrup);
  group.add(
    wilahGrup,
    slironGrup,
    ricikanGrup,
    kinatahGrup,
    ganjaGrup,
    pesiGrup,
    mendakRingGrup,
    selutGrup,
    huluGrup,
    warangka,
  );

  return { group, pinAnchors };
}

/** 2. Saron Laras Slendro: Rancakan berongga akustik asli, plinth terpisah, tebeng ukir, sayap praba, pluntur & 12 tawonan terpisah, 6 bilah gangsa 78/22, gandhen bubut. */
export function buildSaronPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const tex = loadBudayaTextures();
  const gangsa = buatTeksturPerungguGangsa();
  const ukiran = buatTeksturUkiranRancakan();

  const jatiMerahMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x6b2414,
    roughness: 0.44,
    metalness: 0.1,
  });
  const ronggaDalamMat = new THREE.MeshStandardMaterial({
    color: 0x261009,
    roughness: 0.88,
    metalness: 0.04,
  });
  const tebengReliefMat = new THREE.MeshStandardMaterial({
    map: ukiran.diffuse,
    bumpMap: ukiran.bump,
    bumpScale: 0.025,
    color: 0xd9a84e,
    roughness: 0.4,
    metalness: 0.42,
  });
  const emasUkirMat = new THREE.MeshStandardMaterial({
    color: 0xf6c344,
    metalness: 0.9,
    roughness: 0.19,
  });
  const gangsaTempaMat = new THREE.MeshStandardMaterial({
    map: gangsa.diffuse,
    bumpMap: gangsa.bump,
    bumpScale: 0.018,
    color: 0xf5a623,
    emissive: 0x3b1502,
    emissiveIntensity: 0.14,
    metalness: 0.9,
    roughness: 0.22,
  });
  const plisirMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.85,
  });

  // 1. Palungan Resonator Berongga Asli (4 Dinding Kayu Jati + Dasar + 2 Sekat Akustik Internal)
  const palungan = new THREE.Group();
  palungan.position.set(0, -0.24, 0);
  palungan.userData.explodeVec = new THREE.Vector3(0, -0.28, 0);

  const dindingDepan = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.44, 0.09), jatiMerahMat);
  dindingDepan.position.set(0, 0, 0.315);
  dindingDepan.castShadow = true;
  const dindingBelakang = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.44, 0.09), jatiMerahMat);
  dindingBelakang.position.set(0, 0, -0.315);
  dindingBelakang.castShadow = true;
  const dindingKiri = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.54), jatiMerahMat);
  dindingKiri.position.set(-1.22, 0, 0);
  const dindingKanan = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.54), jatiMerahMat);
  dindingKanan.position.set(1.22, 0, 0);
  const dasarRongga = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.08, 0.58), ronggaDalamMat);
  dasarRongga.position.set(0, -0.18, 0);
  const ronggaInterior = new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.03, 0.5), ronggaDalamMat);
  ronggaInterior.position.set(0, -0.135, 0);
  palungan.add(
    dindingDepan,
    dindingBelakang,
    dindingKiri,
    dindingKanan,
    dasarRongga,
    ronggaInterior,
  );
  // Sekat resonansi akustik di dalam palungan (terlihat jelas saat bilah & pluntur terangkat)
  for (const sx of [-0.42, 0.42]) {
    const sekatAkustik = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.28, 0.52), jatiMerahMat);
    sekatAkustik.position.set(sx, -0.04, 0);
    palungan.add(sekatAkustik);
  }
  tanamPinAnchor(palungan, 'saron-rancakan', -0.55, 0.02, 0.37, pinAnchors);
  group.add(palungan);

  // 2. Plinth Alas Bawah & 4 Kaki Bubut Kuningan (Terpisah ke bawah dari Palungan)
  const plinthGrup = new THREE.Group();
  plinthGrup.position.set(0, -0.49, 0);
  plinthGrup.userData.explodeVec = new THREE.Vector3(0, -0.78, 0);
  const plinthBawah = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.1, 0.84), jatiMerahMat);
  plinthBawah.receiveShadow = true;
  const lisPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.03, 0.78), emasUkirMat);
  lisPlinth.position.y = 0.055;
  plinthGrup.add(plinthBawah, lisPlinth);
  for (const kx of [-1.12, 1.12]) {
    for (const kz of [-0.32, 0.32]) {
      const kakiBubut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.11, 14), emasUkirMat);
      kakiBubut.position.set(kx, -0.095, kz);
      plinthGrup.add(kakiBubut);
    }
  }
  group.add(plinthGrup);

  // 3. Sepasang Panel Tebeng Relief Ukiran Lung-Lungan Depan & Belakang
  for (const zWall of [-0.372, 0.372]) {
    const relief = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.32, 0.032), tebengReliefMat);
    relief.position.set(0, -0.24, zWall);
    relief.userData.explodeVec = new THREE.Vector3(0, -0.28, zWall * 1.75);
    group.add(relief);
  }

  // 4. Rel Bantalan Tali Pluntur Peredam Kayu-Logam (Terpisah dari Paku Tawonan)
  const plunturTaliGrup = new THREE.Group();
  plunturTaliGrup.userData.explodeVec = new THREE.Vector3(0, 0.18, 0);
  for (const zPlisir of [-0.26, 0.26]) {
    const bantalan = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.28, 12), plisirMat);
    bantalan.rotation.z = Math.PI / 2;
    bantalan.position.set(0, 0.02, zPlisir);
    plunturTaliGrup.add(bantalan);
    for (const px of [-1.14, 1.14]) {
      const pasakTali = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.06, 8), emasUkirMat);
      pasakTali.position.set(px, 0.01, zPlisir);
      plunturTaliGrup.add(pasakTali);
    }
  }
  group.add(plunturTaliGrup);

  // 5. 12 Paku Penyangga Kuningan Tawonan & Cincin Titik Simpul (Terpisah di atas Pluntur)
  const pakuTawonanGrup = new THREE.Group();
  pakuTawonanGrup.userData.explodeVec = new THREE.Vector3(0, 0.42, 0);
  for (let i = 0; i < 6; i++) {
    const xPos = -0.875 + i * 0.35;
    const zSpan = (0.76 - i * 0.042) * 0.36;
    for (const zPin of [-zSpan, zSpan]) {
      const paku = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.18, 8), emasUkirMat);
      paku.position.set(xPos, 0.09, zPin);
      const cincinSimpul = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 14), plisirMat);
      cincinSimpul.rotation.x = Math.PI / 2;
      cincinSimpul.position.set(xPos, 0.035, zPin);
      const topiPaku = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), emasUkirMat);
      topiPaku.position.set(xPos, 0.185, zPin);
      pakuTawonanGrup.add(paku, cincinSimpul, topiPaku);
    }
  }
  tanamPinAnchor(pakuTawonanGrup, 'saron-pluntur', -0.35, 0.15, 0.28, pinAnchors);
  group.add(pakuTawonanGrup);

  // 6. Sayap Haluan & Buritan Praba Emas dengan Pasak Sambung Kayu
  const buatSayapRancakan = (arah: number): THREE.Group => {
    const sayap = new THREE.Group();
    const blokSayap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.74, 6), jatiMerahMat);
    blokSayap.rotation.z = -arah * 0.38;
    const pasakSambung = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.24), jatiMerahMat);
    pasakSambung.position.set(-arah * 0.18, -0.18, 0);
    const mahkotaNaga = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.042, 12, 24, Math.PI * 1.3),
      emasUkirMat,
    );
    mahkotaNaga.position.set(arah * 0.12, 0.22, 0);
    const bolaPuncak = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), emasUkirMat);
    bolaPuncak.position.set(arah * 0.26, 0.36, 0);
    sayap.add(blokSayap, pasakSambung, mahkotaNaga, bolaPuncak);
    sayap.position.set(arah * 1.38, 0.04, 0);
    sayap.userData.explodeVec = new THREE.Vector3(arah * 0.74, -0.12, 0);
    return sayap;
  };
  const sayapKiri = buatSayapRancakan(-1);
  const sayapKanan = buatSayapRancakan(1);
  tanamPinAnchor(sayapKanan, 'saron-sayap', 0.06, 0.12, 0.08, pinAnchors);
  group.add(sayapKiri, sayapKanan);

  // 7. 6 Bilah Slendro (1-2-3-5-6-i) Tempa Gangsa Cembung + Lubang Simpul Paku (Mekar Kipas)
  const saronWilahs: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const wilahGrup = new THREE.Group();
    const lebar = 0.285 - i * 0.01;
    const panjang = 0.78 - i * 0.045;
    const tebal = 0.054 + i * 0.004;
    const xPos = -0.875 + i * 0.35;
    const zSpan = (0.76 - i * 0.042) * 0.36;

    const wilahMat = gangsaTempaMat.clone();
    const bilah = new THREE.Mesh(new THREE.BoxGeometry(lebar, tebal, panjang), wilahMat);
    bilah.castShadow = true;
    const punggung = new THREE.Mesh(
      new THREE.CylinderGeometry(lebar * 0.34, lebar * 0.4, panjang * 0.94, 14),
      wilahMat,
    );
    punggung.rotation.x = Math.PI / 2;
    punggung.scale.y = 0.38;
    punggung.position.y = tebal * 0.5;
    wilahGrup.add(bilah, punggung);

    // Lubang titik simpul nodal di tiap bilah
    for (const zHole of [-zSpan, zSpan]) {
      const lubang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.017, tebal + 0.016, 10),
        ronggaDalamMat,
      );
      lubang.position.set(0, 0.005, zHole);
      wilahGrup.add(lubang);
    }

    wilahGrup.position.set(xPos, 0.15, 0);
    wilahGrup.userData.explodeVec = new THREE.Vector3((i - 2.5) * 0.14, 0.68 + i * 0.075, 0);
    wilahGrup.userData.baseX = xPos;
    wilahGrup.userData.baseY = 0.15;
    wilahGrup.userData.wilahMat = wilahMat;
    saronWilahs.push(wilahGrup);
    group.add(wilahGrup);
  }
  tanamPinAnchor(saronWilahs[2], 'saron-wilah', 0, 0.08, 0.22, pinAnchors);

  // 8. Tabuh Gandhen Kayu Sawo Bubut Presisi + Ring Tembaga (gagang tertanam utuh di kepala palu)
  const ganden = new THREE.Group();
  const kepalaProfil = [
    new THREE.Vector2(0.001, -0.18),
    new THREE.Vector2(0.072, -0.165),
    new THREE.Vector2(0.092, 0),
    new THREE.Vector2(0.074, 0.165),
    new THREE.Vector2(0.001, 0.18),
  ];
  const kepalaPalu = new THREE.Mesh(new THREE.LatheGeometry(kepalaProfil, 24), jatiMerahMat);
  kepalaPalu.rotation.z = Math.PI / 2;
  kepalaPalu.castShadow = true;

  for (const xRing of [-0.075, 0.075]) {
    const cincinBarrel = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.011, 10, 24), emasUkirMat);
    cincinBarrel.rotation.y = Math.PI / 2;
    cincinBarrel.position.x = xRing;
    ganden.add(cincinBarrel);
  }

  const gagangUnit = new THREE.Group();
  gagangUnit.rotation.x = 1.62;

  const leherTembaga = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.044, 0.055, 16),
    emasUkirMat,
  );
  leherTembaga.position.y = 0.09;

  const gagangProfil = [
    new THREE.Vector2(0.034, 0),
    new THREE.Vector2(0.03, 0.09),
    new THREE.Vector2(0.023, 0.24),
    new THREE.Vector2(0.024, 0.42),
    new THREE.Vector2(0.032, 0.51),
    new THREE.Vector2(0.02, 0.56),
    new THREE.Vector2(0.001, 0.575),
  ];
  const gagang = new THREE.Mesh(new THREE.LatheGeometry(gagangProfil, 18), jatiMerahMat);
  gagang.castShadow = true;

  gagangUnit.add(leherTembaga, gagang);
  ganden.add(kepalaPalu, gagangUnit);

  ganden.position.set(0.76, 0.305, 0.02);
  ganden.rotation.set(0.04, -0.22, 0.08);
  ganden.userData.explodeVec = new THREE.Vector3(0.46, 0.62, 0.42);
  tanamPinAnchor(ganden, 'saron-ganden', 0, 0.11, 0.06, pinAnchors);
  group.add(ganden);

  return { group, saronWilahs, saronGandhen: ganden, pinAnchors };
}

/** 3. Batik Tulis Kawung: Kain Primissima, Relief Lapisan Malam 3D, Gawangan 4-Komponen, Canting 4-Bagian & Tungku Anglo-Wajan 4-Lapis. */
export function buildBatikPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const tex = loadBudayaTextures();
  const kawung = buatTeksturBatikKawung();

  const kainMat = new THREE.MeshStandardMaterial({
    map: kawung.diffuse,
    bumpMap: kawung.bump,
    bumpScale: 0.032,
    side: THREE.DoubleSide,
    roughness: 0.72,
    metalness: 0.06,
  });
  const tembagaMat = new THREE.MeshStandardMaterial({
    color: 0xe08215,
    metalness: 0.9,
    roughness: 0.2,
  });
  const jatiMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x5c3418,
    roughness: 0.52,
  });
  const malamCairMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0x92400e,
    emissiveIntensity: 0.52,
    roughness: 0.14,
  });
  const malamBekuMat = new THREE.MeshStandardMaterial({
    color: 0xf6cf71,
    emissive: 0x78350f,
    emissiveIntensity: 0.22,
    roughness: 0.32,
    metalness: 0.18,
  });
  const ronggaAngloMat = new THREE.MeshStandardMaterial({
    color: 0x1e130c,
    roughness: 0.92,
  });

  // 1. Helai Kain Katun Mori Primissima Berpewarna Soga & Tarum
  const kainGrup = new THREE.Group();
  kainGrup.rotation.x = -0.22;
  kainGrup.userData.explodeVec = new THREE.Vector3(0, 0.04, -0.52);

  const kainGeo = new THREE.PlaneGeometry(2.15, 1.65, 22, 16);
  const pos = kainGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const zWave = Math.sin(y * 2.4) * 0.16 + Math.cos(x * 3.1) * 0.045;
    pos.setZ(i, zWave);
  }
  kainGeo.computeVertexNormals();
  const kain = new THREE.Mesh(kainGeo, kainMat);
  kain.castShadow = true;
  kainGrup.add(kain);
  tanamPinAnchor(kainGrup, 'batik-soga', -0.72, -0.35, 0.18, pinAnchors);
  group.add(kainGrup);

  // 2. Lapisan Relief Rintang Malam Kawung 3D (Terkelupas ke depan kain saat diledakkan untuk memperlihatkan proses rintang lilin)
  const lapisanMalamGrup = new THREE.Group();
  lapisanMalamGrup.rotation.x = -0.22;
  lapisanMalamGrup.userData.explodeVec = new THREE.Vector3(0, 0.1, 0.28);
  const kelopakGeo = new THREE.TorusGeometry(0.088, 0.011, 8, 18);
  const pancerGeo = new THREE.SphereGeometry(0.024, 10, 8);
  for (const cx of [-0.54, 0, 0.54]) {
    for (const cy of [-0.38, 0.14]) {
      const zSurf = Math.sin(cy * 2.4) * 0.16 + Math.cos(cx * 3.1) * 0.045 + 0.016;
      const pancer = new THREE.Mesh(pancerGeo, malamBekuMat);
      pancer.scale.z = 0.45;
      pancer.position.set(cx, cy, zSurf);
      lapisanMalamGrup.add(pancer);

      for (const [ox, oy, rot] of [
        [-0.08, -0.08, Math.PI * 0.25],
        [0.08, -0.08, Math.PI * 0.75],
        [0.08, 0.08, Math.PI * 1.25],
        [-0.08, 0.08, Math.PI * 1.75],
      ]) {
        const px = cx + ox;
        const py = cy + oy;
        const pz = Math.sin(py * 2.4) * 0.16 + Math.cos(px * 3.1) * 0.045 + 0.014;
        const kelopak = new THREE.Mesh(kelopakGeo, malamBekuMat);
        kelopak.scale.set(1.12, 0.58, 0.42);
        kelopak.rotation.z = rot;
        kelopak.position.set(px, py, pz);
        lapisanMalamGrup.add(kelopak);
      }
    }
  }
  tanamPinAnchor(lapisanMalamGrup, 'batik-pusat', 0, 0.14, 0.22, pinAnchors);
  group.add(lapisanMalamGrup);

  // 3. Rangka Gawangan Jati 4-Bagian Terpisah (Palang Atas, Tiang Kiri, Tiang Kanan, Kaki & Pengikat Bawah)
  const palangAtasGrup = new THREE.Group();
  palangAtasGrup.userData.explodeVec = new THREE.Vector3(0, 0.68, 0);
  const palangAtas = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 2.54, 16), jatiMat);
  palangAtas.rotation.z = Math.PI / 2;
  palangAtas.position.set(0, 0.84, 0.12);
  palangAtasGrup.add(palangAtas);
  for (const fx of [-1.28, 1.28]) {
    const mahkotaPalang = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), tembagaMat);
    mahkotaPalang.position.set(fx, 0.84, 0.12);
    palangAtasGrup.add(mahkotaPalang);
  }
  for (const tx of [-1.12, 1.12]) {
    const pasakPalang = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.12, 10), tembagaMat);
    pasakPalang.position.set(tx, 0.76, 0.12);
    palangAtasGrup.add(pasakPalang);
  }
  tanamPinAnchor(palangAtasGrup, 'batik-gawangan', -0.95, 0.86, 0.16, pinAnchors);

  const buatTiangGawangan = (xPos: number): THREE.Group => {
    const tiangGrup = new THREE.Group();
    tiangGrup.userData.explodeVec = new THREE.Vector3(Math.sign(xPos) * 0.56, 0.08, 0);
    const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.056, 1.76, 14), jatiMat);
    tiang.position.set(xPos, -0.05, 0.12);
    const kerahAtas = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 18), tembagaMat);
    kerahAtas.rotation.x = Math.PI / 2;
    kerahAtas.position.set(xPos, 0.78, 0.12);
    const purusBawah = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.11, 0.052), jatiMat);
    purusBawah.position.set(xPos, -0.92, 0.12);
    tiangGrup.add(tiang, kerahAtas, purusBawah);
    return tiangGrup;
  };
  const tiangKiriGrup = buatTiangGawangan(-1.12);
  const tiangKananGrup = buatTiangGawangan(1.12);

  const kakiGawanganGrup = new THREE.Group();
  kakiGawanganGrup.userData.explodeVec = new THREE.Vector3(0, -0.54, 0);
  for (const bx of [-1.12, 1.12]) {
    const kakiT = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.72), jatiMat);
    kakiT.position.set(bx, -0.94, 0.12);
    kakiGawanganGrup.add(kakiT);
  }
  const palangBawah = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.24, 12), jatiMat);
  palangBawah.rotation.z = Math.PI / 2;
  palangBawah.position.set(0, -0.84, 0.12);
  kakiGawanganGrup.add(palangBawah);
  group.add(palangAtasGrup, tiangKiriGrup, tiangKananGrup, kakiGawanganGrup);

  // 4. Canting Klowong 4-Bagian Terpisah (Nyamplung, Malam Cair, Cucuk Kapiler, Cangklong + Gagang Bambu)
  const canting = new THREE.Group();
  canting.position.set(0.68, 0.28, 0.68);
  canting.userData.explodeVec = new THREE.Vector3(0.36, 0.32, 0.44);

  const nyamplungProfil = [
    new THREE.Vector2(0.001, -0.09),
    new THREE.Vector2(0.075, -0.07),
    new THREE.Vector2(0.115, 0.01),
    new THREE.Vector2(0.095, 0.09),
    new THREE.Vector2(0.075, 0.09),
  ];
  const nyamplung = new THREE.Mesh(new THREE.LatheGeometry(nyamplungProfil, 24), tembagaMat);

  const isiMalamCantingGrup = new THREE.Group();
  isiMalamCantingGrup.userData.explodeVec = new THREE.Vector3(0, 0.26, 0);
  const isiMalamCanting = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.022, 16), malamCairMat);
  isiMalamCanting.position.y = 0.05;
  isiMalamCantingGrup.add(isiMalamCanting);

  const cucukGrup = new THREE.Group();
  cucukGrup.userData.explodeVec = new THREE.Vector3(-0.32, -0.05, 0.06);
  const cucuk = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.25, 14), tembagaMat);
  cucuk.rotation.z = Math.PI / 2.15;
  cucuk.position.set(-0.155, -0.02, 0);
  const tetesMalam = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), malamCairMat);
  tetesMalam.position.set(-0.275, -0.05, 0);
  cucukGrup.add(cucuk, tetesMalam);

  const gagangCantingGrup = new THREE.Group();
  gagangCantingGrup.userData.explodeVec = new THREE.Vector3(0.34, 0.1, 0);
  const cangklong = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.012, 10, 18), tembagaMat);
  cangklong.rotation.y = Math.PI / 2;
  cangklong.position.set(0.09, 0.02, 0);
  const gagangBambu = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.68, 12), jatiMat);
  gagangBambu.rotation.z = -Math.PI / 2.35;
  gagangBambu.position.set(0.35, 0.09, 0);
  gagangCantingGrup.add(cangklong, gagangBambu);

  canting.add(nyamplung, isiMalamCantingGrup, cucukGrup, gagangCantingGrup);
  tanamPinAnchor(canting, 'batik-canting', 0, 0.09, 0.12, pinAnchors);
  group.add(canting);

  // 5. Tungku Anglo Terakota, Bara Arang, Wajan Tembaga & Kolam Malam (4 Lapisan Vertikal Terpisah)
  const komporGrup = new THREE.Group();
  komporGrup.position.set(0.75, -0.82, 0.55);
  komporGrup.userData.explodeVec = new THREE.Vector3(0.42, -0.26, 0.44);

  const angloGrup = new THREE.Group();
  angloGrup.userData.explodeVec = new THREE.Vector3(0, -0.26, 0);
  const angloMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.78 });
  const anglo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.36, 20), angloMat);
  const bibirAnglo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 10, 22), angloMat);
  bibirAnglo.rotation.x = Math.PI / 2;
  bibirAnglo.position.y = 0.175;
  const pintuAngin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.08), ronggaAngloMat);
  pintuAngin.position.set(0, -0.08, 0.25);
  angloGrup.add(anglo, bibirAnglo, pintuAngin);

  const baraGrup = new THREE.Group();
  baraGrup.userData.explodeVec = new THREE.Vector3(0, 0.08, 0);
  const baraMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xea580c,
    emissiveIntensity: 1.45,
  });
  const baraArang = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 16), baraMat);
  baraArang.position.y = 0.12;
  baraGrup.add(baraArang);
  for (const [ex, ez] of [
    [-0.07, 0.05],
    [0.06, 0.06],
    [0, -0.07],
    [0.08, -0.02],
  ]) {
    const arang = new THREE.Mesh(new THREE.DodecahedronGeometry(0.036, 0), baraMat);
    arang.position.set(ex, 0.155, ez);
    baraGrup.add(arang);
  }

  const wajanGrup = new THREE.Group();
  wajanGrup.userData.explodeVec = new THREE.Vector3(0, 0.4, 0);
  const wajan = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.16, 0.16, 24), tembagaMat);
  wajan.position.y = 0.24;
  for (const dir of [-1, 1]) {
    const kupingan = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 10, 18, Math.PI), tembagaMat);
    kupingan.position.set(dir * 0.33, 0.31, 0);
    wajanGrup.add(kupingan);
  }
  wajanGrup.add(wajan);
  tanamPinAnchor(wajanGrup, 'batik-anglo', 0, 0.28, 0.32, pinAnchors);

  const kolamMalamGrup = new THREE.Group();
  kolamMalamGrup.userData.explodeVec = new THREE.Vector3(0, 0.72, 0);
  const kolamMalam = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.04, 22), malamCairMat);
  kolamMalam.position.y = 0.3;
  kolamMalamGrup.add(kolamMalam);

  komporGrup.add(angloGrup, baraGrup, wajanGrup, kolamMalamGrup);
  group.add(komporGrup);

  return { group, pinAnchors };
}

/** 4. Pendopo Joglo Agung: Bebatur 2 undakan terpisah, Umpak, 4 Saka Guru berpurus, Sunduk-Kili, 12 Tiang & Blandar Luar, 6 Tumpang Sari Berongga, Lampu Robyong 4-Lengan, Atap Terakota. */
export function buildJogloPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const tex = loadBudayaTextures();
  const genteng = buatTeksturGentengAtap();

  const jatiMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x78421c,
    roughness: 0.5,
  });
  const pasakKayuMat = new THREE.MeshStandardMaterial({
    color: 0x9a5c2c,
    roughness: 0.44,
    metalness: 0.06,
  });
  const batuMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const batuGelapMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.86 });
  const gentengMat = new THREE.MeshStandardMaterial({
    map: genteng.diffuse,
    bumpMap: genteng.bump,
    bumpScale: 0.032,
    color: 0xb9471f,
    roughness: 0.56,
  });
  const emasMat = new THREE.MeshStandardMaterial({
    color: 0xf6c344,
    metalness: 0.9,
    roughness: 0.2,
  });
  const lampuRobyongMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  // 1. Bebatur Andesit 2 Tingkat Terpisah + Undakan Tangga Depan
  const pondasiBawahGrup = new THREE.Group();
  pondasiBawahGrup.position.y = -1.2;
  pondasiBawahGrup.userData.explodeVec = new THREE.Vector3(0, -0.72, 0);
  const pondasiBawah = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.14, 2.56), batuGelapMat);
  const undakBawah = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.24), batuGelapMat);
  undakBawah.position.set(0, -0.01, 1.38);
  pondasiBawahGrup.add(pondasiBawah, undakBawah);

  const pondasiAtasGrup = new THREE.Group();
  pondasiAtasGrup.position.y = -1.1;
  pondasiAtasGrup.userData.explodeVec = new THREE.Vector3(0, -0.44, 0);
  const pondasiAtas = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.09, 2.28), batuMat);
  const undakAtas = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.18), batuMat);
  undakAtas.position.set(0, -0.01, 1.22);
  pondasiAtasGrup.add(pondasiAtas, undakAtas);
  tanamPinAnchor(pondasiAtasGrup, 'joglo-bebatur', 0, 0.06, 1.15, pinAnchors);
  group.add(pondasiBawahGrup, pondasiAtasGrup);

  // 2. 4 Saka Guru Berpurus Kayu + 4 Umpak Andesit Berundak + Sabuk Kuningan
  let sakaRef: THREE.Group | null = null;
  for (const sx of [-0.62, 0.62]) {
    for (const sz of [-0.54, 0.54]) {
      const umpakGrup = new THREE.Group();
      umpakGrup.position.set(sx, -0.96, sz);
      umpakGrup.userData.explodeVec = new THREE.Vector3(sx * 0.44, -0.44, sz * 0.44);
      const umpakBadan = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.18, 0.21, 8), batuMat);
      const bantalanUmpak = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), batuGelapMat);
      bantalanUmpak.position.y = 0.11;
      umpakGrup.add(umpakBadan, bantalanUmpak);

      const sakaGrup = new THREE.Group();
      sakaGrup.position.set(sx, -0.18, sz);
      sakaGrup.userData.explodeVec = new THREE.Vector3(sx * 0.56, -0.06, sz * 0.56);
      const sakaBatang = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.38, 0.14), jatiMat);
      const sabukBawah = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.055, 0.165), emasMat);
      sabukBawah.position.y = -0.62;
      const purusAtas = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.14, 0.068), pasakKayuMat);
      purusAtas.position.y = 0.74;
      sakaGrup.add(sakaBatang, sabukBawah, purusAtas);

      if (sx < 0 && sz > 0) sakaRef = sakaGrup;
      group.add(umpakGrup, sakaGrup);
    }
  }
  if (sakaRef) {
    tanamPinAnchor(sakaRef, 'joglo-sakaguru', 0, -0.1, 0.12, pinAnchors);
  }

  // 3. Kerangka Sunduk, Pangeret & Pasak Pengunci Kili (Sambungan Seismik Tanpa Paku)
  const sundukGrup = new THREE.Group();
  sundukGrup.userData.explodeVec = new THREE.Vector3(0, 0.2, 0);
  for (const sz of [-0.54, 0.54]) {
    const sundukX = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.088, 0.11), jatiMat);
    sundukX.position.set(0, 0.42, sz);
    sundukGrup.add(sundukX);
    for (const kx of [-0.76, 0.76]) {
      const pasakKili = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.05), pasakKayuMat);
      pasakKili.position.set(kx, 0.42, sz);
      sundukGrup.add(pasakKili);
    }
  }
  for (const sx of [-0.62, 0.62]) {
    const pangeretZ = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.088, 1.32), jatiMat);
    pangeretZ.position.set(sx, 0.42, 0);
    sundukGrup.add(pangeretZ);
    for (const kz of [-0.68, 0.68]) {
      const pasakKiliZ = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.045), pasakKayuMat);
      pasakKiliZ.position.set(sx, 0.42, kz);
      sundukGrup.add(pasakKiliZ);
    }
  }
  group.add(sundukGrup);

  // 4. 12 Tiang Keliling Penanggap (dengan Umpak Kecil & Purus) + Balok Blandar Keliling
  const koordinatTiangLuar: Array<[number, number]> = [
    [-1.15, -0.95],
    [-1.15, -0.32],
    [-1.15, 0.32],
    [-1.15, 0.95],
    [1.15, -0.95],
    [1.15, -0.32],
    [1.15, 0.32],
    [1.15, 0.95],
    [-0.38, -0.95],
    [0.38, -0.95],
    [-0.38, 0.95],
    [0.38, 0.95],
  ];
  let tiangLuarRef: THREE.Group | null = null;
  for (const [sx, sz] of koordinatTiangLuar) {
    const tiangGrup = new THREE.Group();
    tiangGrup.position.set(sx, -0.44, sz);
    tiangGrup.userData.explodeVec = new THREE.Vector3(sx * 0.64, -0.18, sz * 0.64);
    const batang = new THREE.Mesh(new THREE.BoxGeometry(0.088, 1.0, 0.088), jatiMat);
    const umpakKecil = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.092, 0.12, 8), batuMat);
    umpakKecil.position.y = -0.54;
    const purusLuar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.045), pasakKayuMat);
    purusLuar.position.y = 0.54;
    tiangGrup.add(batang, umpakKecil, purusLuar);
    if (sx > 1 && Math.abs(sz - 0.32) < 0.05) tiangLuarRef = tiangGrup;
    group.add(tiangGrup);
  }
  if (tiangLuarRef) {
    tanamPinAnchor(tiangLuarRef, 'joglo-penanggap', 0.07, 0.04, 0.08, pinAnchors);
  }

  const blandarLuarGrup = new THREE.Group();
  blandarLuarGrup.position.y = 0.11;
  blandarLuarGrup.userData.explodeVec = new THREE.Vector3(0, 0.44, 0);
  for (const bz of [-0.95, 0.95]) {
    const balok = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.072, 0.085), jatiMat);
    balok.position.z = bz;
    blandarLuarGrup.add(balok);
  }
  for (const bx of [-1.15, 1.15]) {
    const balok = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.072, 2.02), jatiMat);
    balok.position.x = bx;
    blandarLuarGrup.add(balok);
  }
  group.add(blandarLuarGrup);

  // 5. 6 Undakan Balok Tumpang Sari Berongga Asli (4 Batang Bingkai Terbuka per Tingkat)
  let tumpangRef: THREE.Group | null = null;
  for (let tier = 0; tier < 6; tier++) {
    const wSpan = 1.48 - tier * 0.17;
    const dSpan = 1.32 - tier * 0.15;
    const thick = 0.075;
    const tierGrup = new THREE.Group();
    tierGrup.position.y = 0.52 + tier * 0.09;
    tierGrup.userData.explodeVec = new THREE.Vector3(0, 0.18 + tier * 0.095, 0);

    for (const zSide of [-dSpan / 2, dSpan / 2]) {
      const balokX = new THREE.Mesh(new THREE.BoxGeometry(wSpan + thick, thick, thick), jatiMat);
      balokX.position.z = zSide;
      tierGrup.add(balokX);
    }
    for (const xSide of [-wSpan / 2, wSpan / 2]) {
      const balokZ = new THREE.Mesh(new THREE.BoxGeometry(thick, thick, dSpan), jatiMat);
      balokZ.position.x = xSide;
      tierGrup.add(balokZ);
    }
    if (tier === 2) tumpangRef = tierGrup;
    group.add(tierGrup);
  }
  if (tumpangRef) {
    tanamPinAnchor(tumpangRef, 'joglo-tumpangsari', 0, 0.04, 0.54, pinAnchors);
  }

  // 6. Lampu Robyong Kuningan 4-Lengan Menggantung di Ruang Uleng
  const robyong = new THREE.Group();
  robyong.position.set(0, 0.3, 0);
  robyong.userData.explodeVec = new THREE.Vector3(0, 0.14, 0.52);
  const kapLampu = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), emasMat);
  const rantai = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.48, 8), emasMat);
  rantai.position.y = 0.28;
  robyong.add(kapLampu, rantai);
  for (let arm = 0; arm < 4; arm++) {
    const ang = (arm * Math.PI) / 2 + Math.PI / 4;
    const lengan = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.22, 6), emasMat);
    lengan.rotation.z = Math.PI / 2;
    lengan.rotation.y = ang;
    lengan.position.set(Math.cos(ang) * 0.13, -0.02, Math.sin(ang) * 0.13);
    const bohlam = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), lampuRobyongMat);
    bohlam.position.set(Math.cos(ang) * 0.23, 0.01, Math.sin(ang) * 0.23);
    robyong.add(lengan, bohlam);
  }
  group.add(robyong);

  // 7. Atap Penanggap Keliling, Brunjung Puncak Curam & Wuwungan Makuta
  const penanggapGrup = new THREE.Group();
  penanggapGrup.position.y = 0.62;
  penanggapGrup.userData.explodeVec = new THREE.Vector3(0, 1.28, 0);
  const penanggap = new THREE.Mesh(
    buatGeometriAtapTrapesiumTwin(2.75, 2.48, 1.52, 1.32, 0.46),
    gentengMat,
  );
  penanggap.castShadow = true;
  penanggapGrup.add(penanggap);
  for (const [sx, sz] of [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const juraiPenanggap = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.LineCurve3(
          new THREE.Vector3(sx * 1.375, -0.23, sz * 1.24),
          new THREE.Vector3(sx * 0.76, 0.23, sz * 0.66),
        ),
        4,
        0.028,
        8,
        false,
      ),
      emasMat,
    );
    penanggapGrup.add(juraiPenanggap);
  }

  const brunjungGrup = new THREE.Group();
  brunjungGrup.position.y = 1.32;
  brunjungGrup.userData.explodeVec = new THREE.Vector3(0, 1.5, 0);
  const brunjung = new THREE.Mesh(
    buatGeometriAtapTrapesiumTwin(1.58, 1.36, 0.64, 0.16, 0.96),
    gentengMat,
  );
  brunjung.castShadow = true;
  brunjungGrup.add(brunjung);
  for (const [sx, sz] of [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const juraiBrunjung = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.LineCurve3(
          new THREE.Vector3(sx * 0.79, -0.48, sz * 0.68),
          new THREE.Vector3(sx * 0.32, 0.48, sz * 0.08),
        ),
        4,
        0.026,
        8,
        false,
      ),
      emasMat,
    );
    brunjungGrup.add(juraiBrunjung);
  }
  tanamPinAnchor(brunjungGrup, 'joglo-brunjung', 0, 0.14, 0.42, pinAnchors);

  const wuwunganGrup = new THREE.Group();
  wuwunganGrup.position.y = 1.84;
  wuwunganGrup.userData.explodeVec = new THREE.Vector3(0, 1.72, 0);
  const bubungan = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.095, 0.14), emasMat);
  wuwunganGrup.add(bubungan);
  for (const wx of [-0.32, 0, 0.32]) {
    const makuta = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 8), emasMat);
    makuta.position.set(wx, 0.11, 0);
    wuwunganGrup.add(makuta);
  }

  group.add(penanggapGrup, brunjungGrup, wuwunganGrup);
  return { group, pinAnchors };
}

/** 5. Wayang Kulit Sri Rama (10 sub-anatomi terpisah), Stand Gedebog Pisang & Pelita Minyak Blencong 5-bagian. */
export function buildWayangSriRamaDanBlencong3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const rama = buildSriRamaWayang3D();
  rama.root.scale.setScalar(1.2);
  rama.root.position.set(0, 0.12, 0);

  // Sematkan vektor ledak anatomi penuh di seluruh bagian Sri Rama agar tiap unsur wayang terpisah nyata
  rama.kepalaMahkota.userData.explodeVec = new THREE.Vector3(0, 0.4, 0.14);
  rama.torsoPrada.userData.explodeVec = new THREE.Vector3(0, 0.06, 0.22);
  rama.prabaPunggung.userData.explodeVec = new THREE.Vector3(0.38, 0.22, -0.34);
  rama.dodotKaki.userData.explodeVec = new THREE.Vector3(0, -0.34, 0.12);
  rama.lenganKanan.userData.explodeVec = new THREE.Vector3(-0.46, 0.1, 0.24);
  rama.busur.userData.explodeVec = new THREE.Vector3(-0.34, 0.04, 0.16);
  rama.tudingKanan.userData.explodeVec = new THREE.Vector3(-0.12, -0.3, 0.08);
  rama.lenganKiri.userData.explodeVec = new THREE.Vector3(0.48, 0.08, 0.16);
  rama.tudingKiri.userData.explodeVec = new THREE.Vector3(0.14, -0.3, 0.08);
  rama.gapitCempurit.userData.explodeVec = new THREE.Vector3(0, -0.24, -0.38);

  tanamPinAnchor(rama.torsoPrada, 'wayang-sungging', 0, 0.36, 0.06, pinAnchors);
  tanamPinAnchor(rama.kepalaMahkota, 'wayang-mahkota', 0.04, 1.12, 0.06, pinAnchors);
  tanamPinAnchor(rama.lenganKiri, 'wayang-tuding', 0.16, -0.42, 0.08, pinAnchors);
  tanamPinAnchor(rama.gapitCempurit, 'wayang-cempurit', 0, -1.24, 0.08, pinAnchors);

  // Dudukan Batang Gedebog Pisang, Ring Kuningan & Lubang Tancap Cempurit
  const gedebogGrup = new THREE.Group();
  gedebogGrup.position.set(0, -1.62, 0);
  gedebogGrup.userData.explodeVec = new THREE.Vector3(0, -0.42, 0);
  const batangGedebog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.24, 24),
    new THREE.MeshStandardMaterial({ color: 0x5d6e3a, roughness: 0.78 }),
  );
  const ringGedebog = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.022, 8, 22),
    new THREE.MeshStandardMaterial({ color: 0xd9a84e, metalness: 0.85, roughness: 0.24 }),
  );
  ringGedebog.rotation.x = Math.PI / 2;
  ringGedebog.position.y = 0.08;
  const lubangTancap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 0.04, 12),
    new THREE.MeshStandardMaterial({ color: 0x1d2612, roughness: 0.94 }),
  );
  lubangTancap.position.y = 0.115;
  gedebogGrup.add(batangGedebog, ringGedebog, lubangTancap);

  const blencongData = buildBlencongWayang3D();
  blencongData.group.position.set(-1.18, 0.86, 0.28);
  blencongData.group.rotation.y = 0.42;
  blencongData.group.userData.explodeVec = new THREE.Vector3(-0.48, 0.18, 0.22);
  tanamPinAnchor(blencongData.group, 'wayang-blencong', 0.04, 0.08, 0.18, pinAnchors);

  group.add(rama.root, gedebogGrup, blencongData.group);
  return {
    group,
    blencongFlame: blencongData.flame,
    blencongLight: blencongData.light,
    pinAnchors,
  };
}

/** 6. Kidang Kencana (9 sub-anatomi terpisah) & Pelita Blencong 5-bagian (Bedah 3D & Coverflow). */
export function buildKidangDanBlencong3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const kidang = buildKidangKencana3D();
  kidang.root.scale.setScalar(1.36);
  kidang.root.position.set(0.18, -0.26, 0);

  // Sematkan vector ledak anatomi lengkap di setiap sub-rakitan Kidang Kencana
  kidang.badanUtama.userData.explodeVec = new THREE.Vector3(0.08, 0.02, 0);
  kidang.ceplokPelana.userData.explodeVec = new THREE.Vector3(0.08, 0.44, 0.28);
  kidang.ekorGrup.userData.explodeVec = new THREE.Vector3(0.4, 0.22, 0.08);
  kidang.leherKepala.userData.explodeVec = new THREE.Vector3(-0.24, 0.3, 0.14);
  kidang.tandukMahkota.userData.explodeVec = new THREE.Vector3(-0.04, 0.28, 0.1);
  kidang.kalungGentaGrup.userData.explodeVec = new THREE.Vector3(-0.18, -0.14, 0.22);
  kidang.kakiDepan.userData.explodeVec = new THREE.Vector3(-0.24, -0.32, 0.22);
  kidang.kakiBelakang.userData.explodeVec = new THREE.Vector3(0.36, -0.32, -0.18);
  kidang.gapitUtama.userData.explodeVec = new THREE.Vector3(0.06, -0.3, -0.34);

  tanamPinAnchor(kidang.tandukMahkota, 'kidang-tanduk', 0.02, 0.72, 0.06, pinAnchors);
  tanamPinAnchor(kidang.ceplokPelana, 'kidang-badan', 0.02, 0.22, 0.08, pinAnchors);
  tanamPinAnchor(kidang.kakiDepan, 'kidang-kaki', -0.04, -0.26, 0.08, pinAnchors);

  const gedebogGrup = new THREE.Group();
  gedebogGrup.position.set(0.18, -1.68, 0);
  gedebogGrup.userData.explodeVec = new THREE.Vector3(0, -0.38, 0);
  const batangGedebog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.22, 24),
    new THREE.MeshStandardMaterial({ color: 0x5d6e3a, roughness: 0.78 }),
  );
  const ringGedebog = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.02, 8, 22),
    new THREE.MeshStandardMaterial({ color: 0xd9a84e, metalness: 0.85, roughness: 0.24 }),
  );
  ringGedebog.rotation.x = Math.PI / 2;
  ringGedebog.position.y = 0.07;
  const lubangGedebog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.04, 12),
    new THREE.MeshStandardMaterial({ color: 0x1d2612, roughness: 0.94 }),
  );
  lubangGedebog.position.y = 0.105;
  gedebogGrup.add(batangGedebog, ringGedebog, lubangGedebog);

  const blencongData = buildBlencongWayang3D();
  blencongData.group.position.set(-1.12, 0.86, 0.24);
  blencongData.group.rotation.y = 0.35;
  blencongData.group.userData.explodeVec = new THREE.Vector3(-0.56, 0.14, 0.18);
  tanamPinAnchor(blencongData.group, 'kidang-blencong', 0.04, 0.08, 0.18, pinAnchors);

  group.add(kidang.root, gedebogGrup, blencongData.group);
  return {
    group,
    blencongFlame: blencongData.flame,
    blencongLight: blencongData.light,
    pinAnchors,
  };
}

/** 7. Prasasti Tembaga & Astrolabe Hanacaraka Unicode U+A980-U+A9DF (14 komponen bedah CAD terpisah). */
export function buildPrasastiHanacaraka3D(): PaketModel3D {
  const group = new THREE.Group();
  const pinAnchors: Record<string, THREE.Object3D> = {};
  const prasasti = buatTeksturPrasastiHanacaraka();
  const tex = loadBudayaTextures();

  const perungguMat = new THREE.MeshStandardMaterial({
    map: prasasti.diffuse,
    bumpMap: prasasti.bump,
    bumpScale: 0.036,
    metalness: 0.74,
    roughness: 0.3,
  });
  const tembagaIntiMat = new THREE.MeshStandardMaterial({
    color: 0xa45724,
    metalness: 0.86,
    roughness: 0.28,
  });
  const bingkaiJatiMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x5c3018,
    roughness: 0.44,
    metalness: 0.1,
  });
  const kuninganMat = new THREE.MeshStandardMaterial({
    color: 0xe6b655,
    metalness: 0.9,
    roughness: 0.2,
  });
  const batuMat = new THREE.MeshStandardMaterial({ color: 0x3b3834, roughness: 0.78 });
  const celahMat = new THREE.MeshStandardMaterial({ color: 0x161412, roughness: 0.92 });

  // 1. Lempeng Depan Perunggu Bertatah 20 Aksara Nglegena (Meluncur maju ke depan)
  const lempengDepan = new THREE.Mesh(new THREE.BoxGeometry(1.52, 2.04, 0.075), perungguMat);
  lempengDepan.position.set(0, 0, 0.044);
  lempengDepan.castShadow = true;
  lempengDepan.userData.explodeVec = new THREE.Vector3(0, 0.08, 0.64);
  tanamPinAnchor(lempengDepan, 'hanacaraka-lempeng', 0, 0.04, 0.08, pinAnchors);
  group.add(lempengDepan);

  // 2. Pelat Inti Struktural Tembaga & Rusuk Penopang Internal (Tersingkap di tengah saat diledakkan)
  const intiTembagaGrup = new THREE.Group();
  intiTembagaGrup.position.set(0, 0, -0.025);
  intiTembagaGrup.userData.explodeVec = new THREE.Vector3(0, 0.04, 0.04);
  const pelatInti = new THREE.Mesh(new THREE.BoxGeometry(1.48, 2.0, 0.055), tembagaIntiMat);
  intiTembagaGrup.add(pelatInti);
  for (const ry of [-0.62, 0, 0.62]) {
    const rusuk = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.036, 0.072), kuninganMat);
    rusuk.position.y = ry;
    intiTembagaGrup.add(rusuk);
  }
  group.add(intiTembagaGrup);

  // 3. Empat Bilah Bingkai Kayu Jati Terpisah (Atas, Bawah, Kiri, Kanan)
  const relAtas = new THREE.Group();
  relAtas.position.set(0, 1.08, -0.01);
  relAtas.userData.explodeVec = new THREE.Vector3(0, 0.48, -0.34);
  const balokAtas = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.14, 0.15), bingkaiJatiMat);
  const lisAtas = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.028, 0.165), kuninganMat);
  lisAtas.position.y = -0.065;
  relAtas.add(balokAtas, lisAtas);

  const relBawah = new THREE.Group();
  relBawah.position.set(0, -1.08, -0.01);
  relBawah.userData.explodeVec = new THREE.Vector3(0, -0.36, -0.34);
  const balokBawah = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.14, 0.15), bingkaiJatiMat);
  const lidahBawah = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.08, 0.08), bingkaiJatiMat);
  lidahBawah.position.y = -0.1;
  relBawah.add(balokBawah, lidahBawah);

  const relKiri = new THREE.Group();
  relKiri.position.set(-0.82, 0, -0.01);
  relKiri.userData.explodeVec = new THREE.Vector3(-0.48, 0.04, -0.34);
  const balokKiri = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.02, 0.15), bingkaiJatiMat);
  const lisKiri = new THREE.Mesh(new THREE.BoxGeometry(0.026, 2.0, 0.165), kuninganMat);
  lisKiri.position.x = 0.065;
  relKiri.add(balokKiri, lisKiri);
  tanamPinAnchor(relKiri, 'hanacaraka-bingkai', -0.02, 0.64, 0.11, pinAnchors);

  const relKanan = new THREE.Group();
  relKanan.position.set(0.82, 0, -0.01);
  relKanan.userData.explodeVec = new THREE.Vector3(0.48, 0.04, -0.34);
  const balokKanan = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.02, 0.15), bingkaiJatiMat);
  const lisKanan = new THREE.Mesh(new THREE.BoxGeometry(0.026, 2.0, 0.165), kuninganMat);
  lisKanan.position.x = -0.065;
  relKanan.add(balokKanan, lisKanan);

  group.add(relAtas, relBawah, relKiri, relKanan);

  // 4. Empat Paku Pengunci Sudut Oktahedron Kuningan (Mekar diagonal keluar saat diledakkan)
  for (const [bx, by] of [
    [-0.78, 1.04],
    [0.78, 1.04],
    [-0.78, -1.04],
    [0.78, -1.04],
  ]) {
    const pakuGrup = new THREE.Group();
    pakuGrup.position.set(bx, by, 0.075);
    pakuGrup.userData.explodeVec = new THREE.Vector3(Math.sign(bx) * 0.44, Math.sign(by) * 0.34, 0.32);
    const kepalaPaku = new THREE.Mesh(new THREE.OctahedronGeometry(0.044, 0), kuninganMat);
    const pasakPaku = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), kuninganMat);
    pasakPaku.rotation.x = Math.PI / 2;
    pasakPaku.position.z = -0.06;
    pakuGrup.add(kepalaPaku, pasakPaku);
    group.add(pakuGrup);
  }

  // 5. Pondasi Andesit 2 Tingkat Terpisah + Takik Alur Pemasangan Prasasti
  const kakiAtasGrup = new THREE.Group();
  kakiAtasGrup.position.set(0, -1.16, 0);
  kakiAtasGrup.userData.explodeVec = new THREE.Vector3(0, -0.5, 0);
  const kakiAtas = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 0.54), batuMat);
  const celahPrasasti = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.04, 0.12), celahMat);
  celahPrasasti.position.y = 0.05;
  kakiAtasGrup.add(kakiAtas, celahPrasasti);
  tanamPinAnchor(kakiAtasGrup, 'hanacaraka-alas', 0, 0.04, 0.28, pinAnchors);

  const kakiBawahGrup = new THREE.Group();
  kakiBawahGrup.position.set(0, -1.29, 0);
  kakiBawahGrup.userData.explodeVec = new THREE.Vector3(0, -0.84, 0);
  const kakiBawah = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.14, 0.74), batuMat);
  kakiBawahGrup.add(kakiBawah);
  group.add(kakiAtasGrup, kakiBawahGrup);

  // 6. Mahkota Astrolabe Dual-Gimbal 3-Bagian Terpisah di puncak prasasti
  const mahkotaOrb = new THREE.Group();
  mahkotaOrb.position.set(0, 1.42, 0);
  mahkotaOrb.userData.explodeVec = new THREE.Vector3(0, 0.46, 0);

  const tangkaiMahkota = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.18, 10), kuninganMat);
  tangkaiMahkota.position.y = -0.26;
  const ringLuar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.022, 12, 36), kuninganMat);
  ringLuar.userData.explodeVec = new THREE.Vector3(0, 0, -0.16);
  const ringDalam = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 12, 30), kuninganMat);
  ringDalam.rotation.x = Math.PI / 3;
  ringDalam.userData.explodeVec = new THREE.Vector3(0, 0.12, 0.14);
  const intiPermata = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.09, 0),
    new THREE.MeshStandardMaterial({
      color: 0xf06d3c,
      emissive: 0xd1491b,
      emissiveIntensity: 0.6,
      metalness: 0.45,
      roughness: 0.15,
    }),
  );
  intiPermata.userData.explodeVec = new THREE.Vector3(0, 0.22, 0.26);
  mahkotaOrb.add(tangkaiMahkota, ringLuar, ringDalam, intiPermata);
  tanamPinAnchor(mahkotaOrb, 'hanacaraka-mahkota', 0, 0.14, 0.14, pinAnchors);
  group.add(mahkotaOrb);

  return { group, orbitAccent: mahkotaOrb, pinAnchors };
}
