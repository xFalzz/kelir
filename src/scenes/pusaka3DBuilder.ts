import * as THREE from 'three';
import type { BendaPusaka } from '../content/pusaka.ts';
import { loadBudayaTextures } from './threeHelpers.ts';
import { buildKidangKencana3D, buildSriRamaWayang3D } from './wayang3DBuilder.ts';

export type CoverflowArtefakId = BendaPusaka['id'] | 'kidang' | 'hanacaraka';

export interface PaketModel3D {
  group: THREE.Group;
  blencongFlame?: THREE.Mesh | null;
  blencongLight?: THREE.PointLight | null;
  orbitAccent?: THREE.Object3D | null;
}

export function buatTeksturPamorKeris(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 1024;
  const bctx = bumpCanvas.getContext('2d');
  if (!ctx || !bctx) return { diffuse: null, bump: null };

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

  return { diffuse, bump };
}

function buatTeksturPerungguGangsa(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const size = 512;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = size;
  diffCanvas.height = size;
  const dCtx = diffCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

  const grad = dCtx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#f3c15c');
  grad.addColorStop(0.5, '#d9962b');
  grad.addColorStop(1, '#b87419');
  dCtx.fillStyle = grad;
  dCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#7c7c7c';
  bCtx.fillRect(0, 0, size, size);

  // Jejak palu tempa pengrajin gangsa 78/22 & guratan laras nada
  for (let i = 0; i < 360; i++) {
    const x = ((i * 97) % size);
    const y = ((i * 53) % size);
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

  for (let y = 0; y < size; y += 6) {
    dCtx.strokeStyle = 'rgba(255, 250, 230, 0.05)';
    dCtx.beginPath();
    dCtx.moveTo(0, y);
    dCtx.lineTo(size, y);
    dCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(diffCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  return { diffuse, bump };
}

export function buatTeksturBatikKawung(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bctx = bumpCanvas.getContext('2d');
  if (!ctx || !bctx) return { diffuse: null, bump: null };

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
  for (let g = 0; g < 1024; g += 8) {
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

  return { diffuse, bump };
}

function buatTeksturUkiranRancakan(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const w = 1024;
  const h = 256;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = w;
  dCanvas.height = h;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

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
  return { diffuse, bump };
}

function buatTeksturGentengAtap(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const size = 512;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

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

  return { diffuse, bump };
}

function buatTeksturPrasastiHanacaraka(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const w = 768;
  const h = 1024;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = w;
  dCanvas.height = h;
  const dCtx = dCanvas.getContext('2d');

  const bCanvas = document.createElement('canvas');
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext('2d');
  if (!dCtx || !bCtx) return { diffuse: null, bump: null };

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
  dCtx.fillText('UNICODE U+A980 — U+A9DF · S7', w / 2, 108);

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
  return { diffuse, bump };
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

/** Membuat instrumen 3D Pelita Minyak Blencong Kuningan bersayap Garuda dengan nyala api aktif. */
export function buildBlencongWayang3D(): {
  group: THREE.Group;
  flame: THREE.Mesh;
  light: THREE.PointLight;
} {
  const kuninganMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6b655,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.4,
    clearcoatRoughness: 0.16,
  });
  const perungguGelapMat = new THREE.MeshStandardMaterial({
    color: 0x4b3822,
    metalness: 0.76,
    roughness: 0.34,
  });
  const minyakMat = new THREE.MeshPhysicalMaterial({
    color: 0xb45309,
    metalness: 0.08,
    roughness: 0.1,
    clearcoat: 0.9,
  });
  const apiMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xff7b24,
    emissiveIntensity: 2.2,
    roughness: 0.18,
  });

  const blencong = new THREE.Group();

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
  blencong.add(mangkuk);

  const minyak = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 24), minyakMat);
  minyak.position.y = 0.045;
  blencong.add(minyak);

  const corong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.19, 14), kuninganMat);
  corong.rotation.z = -Math.PI * 0.46;
  corong.position.set(0.22, 0.065, 0);
  blencong.add(corong);

  const sumbu = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.08, 10), perungguGelapMat);
  sumbu.rotation.z = -0.35;
  sumbu.position.set(0.3, 0.09, 0);
  blencong.add(sumbu);

  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 12), apiMat);
  flame.scale.set(0.72, 1.55, 0.72);
  flame.position.set(0.32, 0.16, 0);
  blencong.add(flame);

  const light = new THREE.PointLight(0xff9c3b, 2.2, 5.2);
  light.position.set(0.34, 0.18, 0.04);
  blencong.add(light);

  const sayapShape = new THREE.Shape();
  sayapShape.moveTo(0, -0.02);
  sayapShape.quadraticCurveTo(0.14, 0.04, 0.34, 0.18);
  sayapShape.quadraticCurveTo(0.24, 0.34, 0.08, 0.38);
  sayapShape.lineTo(0, 0.24);
  sayapShape.lineTo(-0.08, 0.38);
  sayapShape.quadraticCurveTo(-0.24, 0.34, -0.34, 0.18);
  sayapShape.quadraticCurveTo(-0.14, 0.04, 0, -0.02);

  const sayap = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sayapShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
    }),
    kuninganMat,
  );
  sayap.rotation.y = Math.PI / 2;
  sayap.position.set(-0.2, 0.08, 0);
  blencong.add(sayap);

  const batangGantung = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 0.62, 10),
    perungguGelapMat,
  );
  batangGantung.position.set(0, 0.42, 0);
  const kait = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 10, 22), kuninganMat);
  kait.position.set(0, 0.74, 0);
  blencong.add(batangGantung, kait);

  return { group: blencong, flame, light };
}

/** 1. Keris Luk 5 Pandhawa Lare: Bilah ada-ada, pejetan, greneng, ganja sebit rontal, pesi, mendak selut mirah, hulu nunggak semi, warangka & pendok bunton. */
export function buildKerisPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const tex = loadBudayaTextures();
  const pamor = buatTeksturPamorKeris();

  const bilahMat = new THREE.MeshPhysicalMaterial({
    map: pamor.diffuse,
    bumpMap: pamor.bump,
    bumpScale: 0.042,
    color: 0xe5e7eb,
    metalness: 0.94,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.16,
  });
  const emasMat = new THREE.MeshPhysicalMaterial({
    color: 0xf6c344,
    metalness: 0.94,
    roughness: 0.15,
    clearcoat: 0.58,
    clearcoatRoughness: 0.12,
  });
  const mirahMat = new THREE.MeshPhysicalMaterial({
    color: 0xe11d48,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.48,
    roughness: 0.08,
    clearcoat: 1,
  });
  const kayuKemuningMat = new THREE.MeshPhysicalMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x743c19,
    roughness: 0.32,
    metalness: 0.06,
    clearcoat: 0.42,
    clearcoatRoughness: 0.24,
  });

  // A. Wilah Luk 5 + Ada-Ada Tengah + Kembang Kacang + Pejetan + Greneng
  const wilahGrup = new THREE.Group();
  wilahGrup.userData.explodeVec = new THREE.Vector3(0, 0.72, 0.12);

  const wilahPoints: THREE.Vector3[] = [];
  const steps = 76;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const y = -0.3 + u * 2.18;
    const wave = Math.sin(u * Math.PI * 5) * 0.095 * (1 - u * 0.44);
    wilahPoints.push(new THREE.Vector3(wave, y, 0));
  }
  const curve = new THREE.CatmullRomCurve3(wilahPoints);
  const wilahGeo = new THREE.TubeGeometry(curve, 96, 0.122, 6, false);
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

  // Sekar Kacang + Jalen + Lambe Gajah di pangkal gandik
  const kembangKacang = new THREE.Mesh(
    new THREE.TorusGeometry(0.058, 0.017, 12, 24, Math.PI * 1.54),
    bilahMat,
  );
  kembangKacang.position.set(-0.145, -0.21, 0);
  kembangKacang.rotation.z = 0.45;
  const jalen = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.056, 6), bilahMat);
  jalen.rotation.z = Math.PI * 0.68;
  jalen.position.set(-0.175, -0.29, 0);
  wilahGrup.add(kembangKacang, jalen);

  // Alur Sogokan Kembar & Tikel Alis bertatah emas tipis
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
    wilahGrup.add(sogokan, tikelAlis);
  }

  // Detail bergigi 7 Greneng & Ri Pandan di pangkal belakang sorsoran
  for (let g = 0; g < 7; g++) {
    const duri = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.038, 5), bilahMat);
    duri.rotation.z = -Math.PI / 2;
    duri.position.set(0.16 - g * 0.013, -0.295 + g * 0.032, 0);
    wilahGrup.add(duri);
  }

  // B. Ganja Sebit Rontal / Kelap Lintah (Sirah Cecak -> Buntut Urang)
  const ganjaShape = new THREE.Shape();
  ganjaShape.moveTo(-0.27, -0.038);
  ganjaShape.quadraticCurveTo(-0.16, 0.048, -0.04, 0.035);
  ganjaShape.quadraticCurveTo(0.08, 0.048, 0.2, 0.018);
  ganjaShape.lineTo(0.35, -0.012);
  ganjaShape.quadraticCurveTo(0.14, -0.062, -0.25, -0.064);
  ganjaShape.closePath();
  const ganja = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ganjaShape, {
      depth: 0.094,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.011,
    }),
    bilahMat,
  );
  ganja.position.set(0, -0.35, -0.047);
  ganja.castShadow = true;
  ganja.userData.explodeVec = new THREE.Vector3(-0.24, 0.18, 0.44);

  // C. Pesi Baja Tempa Penusuk Hulu
  const pesi = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.015, 0.56, 12), bilahMat);
  pesi.position.set(0, -0.63, 0);
  pesi.userData.explodeVec = new THREE.Vector3(0, 0.02, -0.34);

  // D. Mendak Ring Bertingkat & Selut 16 Permata Mirah Delima
  const mendakGrup = new THREE.Group();
  mendakGrup.position.set(0, -0.46, 0);
  mendakGrup.userData.explodeVec = new THREE.Vector3(0, -0.18, 0.36);

  const cincinAtas = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.018, 14, 30), emasMat);
  cincinAtas.rotation.x = Math.PI / 2;
  cincinAtas.position.y = 0.024;
  const cincinUtama = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.024, 16, 32), emasMat);
  cincinUtama.rotation.x = Math.PI / 2;
  const selutBawah = new THREE.Mesh(new THREE.SphereGeometry(0.094, 24, 18), emasMat);
  selutBawah.scale.y = 0.62;
  selutBawah.position.y = -0.052;
  mendakGrup.add(cincinAtas, cincinUtama, selutBawah);

  for (let p = 0; p < 16; p++) {
    const ang = (p / 16) * Math.PI * 2;
    const permata = new THREE.Mesh(new THREE.OctahedronGeometry(0.014, 0), mirahMat);
    permata.position.set(Math.cos(ang) * 0.092, -0.012, Math.sin(ang) * 0.092);
    mendakGrup.add(permata);
  }

  // E. Hulu Surakarta (Ukiran Nunggak Semi + Sabuk Patra Emas)
  const huluGrup = new THREE.Group();
  huluGrup.userData.explodeVec = new THREE.Vector3(-0.1, -0.68, 0);
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
  const bungkulAtas = new THREE.Mesh(new THREE.SphereGeometry(0.096, 18, 16), kayuKemuningMat);
  bungkulAtas.scale.set(0.95, 1.15, 0.85);
  bungkulAtas.position.set(-0.19, -1.22, 0);
  const sabukHulu = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.01, 10, 24), emasMat);
  sabukHulu.rotation.x = Math.PI / 2;
  sabukHulu.rotation.y = 0.25;
  sabukHulu.position.set(-0.08, -0.94, 0);
  huluGrup.add(huluTube, bungkulAtas, sabukHulu);

  // F. Warangka Gayaman Kayu Timoho + Gandar + Selongsong Pendok Bunton Emas
  const warangka = new THREE.Group();
  warangka.position.set(0.38, 0.18, -0.26);
  warangka.userData.explodeVec = new THREE.Vector3(0.55, 0.08, -0.42);

  const gayamanShape = new THREE.Shape();
  gayamanShape.moveTo(-0.49, 0.06);
  gayamanShape.quadraticCurveTo(-0.58, 0.25, -0.18, 0.28);
  gayamanShape.quadraticCurveTo(0.29, 0.29, 0.56, 0.15);
  gayamanShape.quadraticCurveTo(0.44, -0.08, 0.16, -0.12);
  gayamanShape.lineTo(-0.22, -0.12);
  gayamanShape.quadraticCurveTo(-0.45, -0.08, -0.49, 0.06);

  const gayamanAtas = new THREE.Mesh(
    new THREE.ExtrudeGeometry(gayamanShape, {
      depth: 0.135,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.02,
    }),
    kayuKemuningMat,
  );
  gayamanAtas.position.set(0, 0.18, -0.32);

  const gandarKayu = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.068, 1.62, 20),
    kayuKemuningMat,
  );
  gandarKayu.scale.z = 0.48;
  gandarKayu.position.set(0, -0.68, -0.25);

  const pendokGrup = new THREE.Group();
  pendokGrup.position.set(0, -0.72, -0.25);
  pendokGrup.userData.explodeVec = new THREE.Vector3(0.38, -0.14, 0.24);
  const pendokEmas = new THREE.Mesh(
    new THREE.CylinderGeometry(0.118, 0.072, 1.54, 20),
    emasMat,
  );
  pendokEmas.scale.z = 0.52;
  const buntutPendok = new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 12), emasMat);
  buntutPendok.scale.set(1, 1.35, 0.55);
  buntutPendok.position.set(0, -0.78, 0);
  pendokGrup.add(pendokEmas, buntutPendok);

  warangka.add(gayamanAtas, gandarKayu, pendokGrup);
  group.add(wilahGrup, ganja, pesi, mendakGrup, huluGrup, warangka);

  return { group };
}

/** 2. Saron Laras Slendro: Rancakan berrelief lung-lungan prada, pluntur & 12 tawonan, 6 bilah gangsa 78/22, gandhen bubut. */
export function buildSaronPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const tex = loadBudayaTextures();
  const gangsa = buatTeksturPerungguGangsa();
  const ukiran = buatTeksturUkiranRancakan();

  const jatiMerahMat = new THREE.MeshPhysicalMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x6b2414,
    roughness: 0.4,
    clearcoat: 0.34,
    clearcoatRoughness: 0.24,
  });
  const tebengReliefMat = new THREE.MeshPhysicalMaterial({
    map: ukiran.diffuse,
    bumpMap: ukiran.bump,
    bumpScale: 0.025,
    color: 0xd9a84e,
    roughness: 0.38,
    metalness: 0.42,
    clearcoat: 0.3,
  });
  const emasUkirMat = new THREE.MeshPhysicalMaterial({
    color: 0xf6c344,
    metalness: 0.92,
    roughness: 0.17,
    clearcoat: 0.45,
  });
  const gangsaTempaMat = new THREE.MeshPhysicalMaterial({
    map: gangsa.diffuse,
    bumpMap: gangsa.bump,
    bumpScale: 0.018,
    color: 0xf5a623,
    emissive: 0x3b1502,
    emissiveIntensity: 0.14,
    metalness: 0.92,
    roughness: 0.19,
    clearcoat: 0.38,
  });
  const plisirMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.85,
  });

  // Palungan & Plinth Bawah Rancakan Grobogan
  const palungan = new THREE.Group();
  palungan.position.set(0, -0.24, 0);
  palungan.userData.explodeVec = new THREE.Vector3(0, -0.58, 0);

  const badanKotak = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.44, 0.72), jatiMerahMat);
  badanKotak.castShadow = true;
  const plinthBawah = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.1, 0.84), jatiMerahMat);
  plinthBawah.position.y = -0.25;
  plinthBawah.receiveShadow = true;

  for (const kx of [-1.12, 1.12]) {
    for (const kz of [-0.32, 0.32]) {
      const kakiBubut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.1, 14), emasUkirMat);
      kakiBubut.position.set(kx, -0.34, kz);
      palungan.add(kakiBubut);
    }
  }
  palungan.add(badanKotak, plinthBawah);
  group.add(palungan);

  // Sepasang Panel Tebeng Relief Ukiran Lung-Lungan Depan & Belakang
  for (const zWall of [-0.372, 0.372]) {
    const relief = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.32, 0.032), tebengReliefMat);
    relief.position.set(0, -0.24, zWall);
    relief.userData.explodeVec = new THREE.Vector3(0, -0.4, zWall * 1.45);
    group.add(relief);
  }

  // Bantalan Tali Pluntur & 12 Paku Penyangga Kuningan Tawonan
  const plunturGrup = new THREE.Group();
  plunturGrup.userData.explodeVec = new THREE.Vector3(0, 0.2, 0);
  for (const zPlisir of [-0.26, 0.26]) {
    const bantalan = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.28, 12), plisirMat);
    bantalan.rotation.z = Math.PI / 2;
    bantalan.position.set(0, 0.02, zPlisir);
    plunturGrup.add(bantalan);
  }
  for (let i = 0; i < 6; i++) {
    const xPos = -0.875 + i * 0.35;
    const zSpan = (0.76 - i * 0.042) * 0.36;
    for (const zPin of [-zSpan, zSpan]) {
      const paku = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.18, 8), emasUkirMat);
      paku.position.set(xPos, 0.09, zPin);
      const topiPaku = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), emasUkirMat);
      topiPaku.position.set(xPos, 0.185, zPin);
      plunturGrup.add(paku, topiPaku);
    }
  }
  group.add(plunturGrup);

  const buatSayapRancakan = (arah: number): THREE.Group => {
    const sayap = new THREE.Group();
    const blokSayap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.74, 6), jatiMerahMat);
    blokSayap.rotation.z = -arah * 0.38;
    const mahkotaNaga = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.042, 12, 24, Math.PI * 1.3),
      emasUkirMat,
    );
    mahkotaNaga.position.set(arah * 0.12, 0.22, 0);
    const bolaPuncak = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), emasUkirMat);
    bolaPuncak.position.set(arah * 0.26, 0.36, 0);
    sayap.add(blokSayap, mahkotaNaga, bolaPuncak);
    sayap.position.set(arah * 1.38, 0.04, 0);
    sayap.userData.explodeVec = new THREE.Vector3(arah * 0.72, -0.16, 0);
    return sayap;
  };
  group.add(buatSayapRancakan(-1), buatSayapRancakan(1));

  // 6 Bilah Slendro (1-2-3-5-6-i) Tempa Gangsa Cembung Bergradasi
  for (let i = 0; i < 6; i++) {
    const wilahGrup = new THREE.Group();
    const lebar = 0.285 - i * 0.01;
    const panjang = 0.78 - i * 0.045;
    const tebal = 0.054 + i * 0.004;
    const xPos = -0.875 + i * 0.35;

    const bilah = new THREE.Mesh(new THREE.BoxGeometry(lebar, tebal, panjang), gangsaTempaMat);
    bilah.castShadow = true;
    const punggung = new THREE.Mesh(
      new THREE.CylinderGeometry(lebar * 0.34, lebar * 0.4, panjang * 0.94, 14),
      gangsaTempaMat,
    );
    punggung.rotation.x = Math.PI / 2;
    punggung.scale.y = 0.38;
    punggung.position.y = tebal * 0.5;

    wilahGrup.add(bilah, punggung);
    wilahGrup.position.set(xPos, 0.15, 0);
    wilahGrup.userData.explodeVec = new THREE.Vector3(0, 0.52 + i * 0.08, 0);
    group.add(wilahGrup);
  }

  // Tabuh Gandhen Kayu Sawo Bubut Presisi + Ring Tembaga
  const ganden = new THREE.Group();
  const kepalaProfil = [
    new THREE.Vector2(0.001, -0.2),
    new THREE.Vector2(0.095, -0.18),
    new THREE.Vector2(0.115, 0),
    new THREE.Vector2(0.1, 0.18),
    new THREE.Vector2(0.001, 0.2),
  ];
  const kepalaPalu = new THREE.Mesh(new THREE.LatheGeometry(kepalaProfil, 24), jatiMerahMat);
  kepalaPalu.rotation.z = Math.PI / 2;
  const cincinPalu = new THREE.Mesh(new THREE.TorusGeometry(0.106, 0.014, 12, 24), emasUkirMat);
  cincinPalu.rotation.y = Math.PI / 2;
  const gagangProfil = [
    new THREE.Vector2(0.026, -0.36),
    new THREE.Vector2(0.036, -0.15),
    new THREE.Vector2(0.024, 0.15),
    new THREE.Vector2(0.032, 0.36),
  ];
  const gagang = new THREE.Mesh(new THREE.LatheGeometry(gagangProfil, 16), jatiMerahMat);
  gagang.position.set(0.06, -0.35, 0);
  gagang.rotation.z = 0.2;
  ganden.add(kepalaPalu, cincinPalu, gagang);
  ganden.position.set(1.18, 0.72, 0.48);
  ganden.rotation.z = 0.38;
  ganden.userData.explodeVec = new THREE.Vector3(0.64, 0.48, 0.52);
  group.add(ganden);

  return { group };
}

/** 3. Batik Tulis Kawung: Kain Primissima, Gawangan Bubut, Canting Tulis Nyamplung, Wajan Terangkat & Tungku Anglo Bara. */
export function buildBatikPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const tex = loadBudayaTextures();
  const kawung = buatTeksturBatikKawung();

  const kainMat = new THREE.MeshPhysicalMaterial({
    map: kawung.diffuse,
    bumpMap: kawung.bump,
    bumpScale: 0.032,
    side: THREE.DoubleSide,
    roughness: 0.74,
    sheen: 0.62,
    sheenColor: new THREE.Color(0xfde68a),
  });
  const tembagaMat = new THREE.MeshPhysicalMaterial({
    color: 0xe08215,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.45,
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

  const kainGeo = new THREE.PlaneGeometry(2.15, 1.65, 44, 34);
  const pos = kainGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const zWave = Math.sin(y * 2.4) * 0.16 + Math.cos(x * 3.1) * 0.045;
    pos.setZ(i, zWave);
  }
  kainGeo.computeVertexNormals();
  const kain = new THREE.Mesh(kainGeo, kainMat);
  kain.rotation.x = -0.22;
  kain.castShadow = true;
  kain.userData.explodeVec = new THREE.Vector3(0, 0.1, -0.48);
  group.add(kain);

  const gawanganGrup = new THREE.Group();
  const palangAtas = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 2.54, 16), jatiMat);
  palangAtas.rotation.z = Math.PI / 2;
  palangAtas.position.set(0, 0.84, 0.12);
  const tiangKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.056, 1.85, 14), jatiMat);
  tiangKiri.position.set(-1.12, -0.05, 0.12);
  const tiangKanan = tiangKiri.clone();
  tiangKanan.position.x = 1.12;
  for (const fx of [-1.28, 1.28]) {
    const mahkotaPalang = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), tembagaMat);
    mahkotaPalang.position.set(fx, 0.84, 0.12);
    gawanganGrup.add(mahkotaPalang);
  }
  for (const bx of [-1.12, 1.12]) {
    const kakiT = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.72), jatiMat);
    kakiT.position.set(bx, -0.94, 0.12);
    gawanganGrup.add(kakiT);
  }
  gawanganGrup.add(palangAtas, tiangKiri, tiangKanan);
  gawanganGrup.userData.explodeVec = new THREE.Vector3(0, 0.54, 0);
  group.add(gawanganGrup);

  // Canting Klowong (Lathe Reservoir Nyamplung + Cincin Cangklong + Cucuk Presisi)
  const canting = new THREE.Group();
  const nyamplungProfil = [
    new THREE.Vector2(0.001, -0.09),
    new THREE.Vector2(0.075, -0.07),
    new THREE.Vector2(0.115, 0.01),
    new THREE.Vector2(0.095, 0.09),
    new THREE.Vector2(0.075, 0.09),
  ];
  const nyamplung = new THREE.Mesh(new THREE.LatheGeometry(nyamplungProfil, 24), tembagaMat);
  const isiMalamCanting = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.02, 16), malamCairMat);
  isiMalamCanting.position.y = 0.05;
  const cucuk = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.25, 14), tembagaMat);
  cucuk.rotation.z = Math.PI / 2.15;
  cucuk.position.set(-0.155, -0.02, 0);
  const tetesMalam = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), malamCairMat);
  tetesMalam.position.set(-0.275, -0.05, 0);
  const cangklong = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.012, 10, 18), tembagaMat);
  cangklong.rotation.y = Math.PI / 2;
  cangklong.position.set(0.09, 0.02, 0);
  const gagangBambu = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.68, 12), jatiMat);
  gagangBambu.rotation.z = -Math.PI / 2.35;
  gagangBambu.position.set(0.35, 0.09, 0);
  canting.add(nyamplung, isiMalamCanting, cucuk, tetesMalam, cangklong, gagangBambu);
  canting.position.set(0.68, 0.28, 0.68);
  canting.userData.explodeVec = new THREE.Vector3(0.52, 0.38, 0.68);
  group.add(canting);

  // Tungku Anglo Terakota Berlubang + Bara + Wajan Malam Terpisah
  const komporGrup = new THREE.Group();
  komporGrup.position.set(0.75, -0.82, 0.55);
  komporGrup.userData.explodeVec = new THREE.Vector3(0.6, -0.42, 0.58);

  const anglo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.29, 0.36, 20),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.78 }),
  );
  const baraArang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xea580c, emissiveIntensity: 1.4 }),
  );
  baraArang.position.y = 0.11;
  komporGrup.add(anglo, baraArang);

  const wajanGrup = new THREE.Group();
  wajanGrup.userData.explodeVec = new THREE.Vector3(0, 0.34, 0);
  const wajan = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.16, 0.16, 24), tembagaMat);
  wajan.position.y = 0.24;
  for (const dir of [-1, 1]) {
    const kupingan = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 10, 18, Math.PI), tembagaMat);
    kupingan.position.set(dir * 0.33, 0.31, 0);
    wajanGrup.add(kupingan);
  }
  const kolamMalam = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 22), malamCairMat);
  kolamMalam.position.y = 0.3;
  wajanGrup.add(wajan, kolamMalam);

  komporGrup.add(wajanGrup);
  group.add(komporGrup);

  return { group };
}

/** 4. Pendopo Joglo Agung: Bebatur 2 undakan, Umpak, 4 Saka Guru, Sunduk-Kili, Rangka Tumpang Sari Berongga, Lampu Robyong, Atap Terakota. */
export function buildJogloPusaka3D(): PaketModel3D {
  const group = new THREE.Group();
  const tex = loadBudayaTextures();
  const genteng = buatTeksturGentengAtap();

  const jatiMat = new THREE.MeshStandardMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x78421c,
    roughness: 0.5,
  });
  const batuMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const gentengMat = new THREE.MeshStandardMaterial({
    map: genteng.diffuse,
    bumpMap: genteng.bump,
    bumpScale: 0.032,
    color: 0xb9471f,
    roughness: 0.56,
  });
  const emasMat = new THREE.MeshPhysicalMaterial({
    color: 0xf6c344,
    metalness: 0.9,
    roughness: 0.18,
    clearcoat: 0.45,
  });

  // Bebatur Andesit 2 Tingkat + Undakan Depan
  const bebaturGrup = new THREE.Group();
  bebaturGrup.userData.explodeVec = new THREE.Vector3(0, -0.74, 0);
  const pondasiBawah = new THREE.Mesh(new THREE.BoxGeometry(2.76, 0.14, 2.54), batuMat);
  pondasiBawah.position.y = -1.2;
  const pondasiAtas = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 2.28), batuMat);
  pondasiAtas.position.y = -1.1;
  bebaturGrup.add(pondasiBawah, pondasiAtas);
  group.add(bebaturGrup);

  // 4 Saka Guru + Umpak Andesit Berundak + Sabuk Kuningan
  for (const sx of [-0.62, 0.62]) {
    for (const sz of [-0.54, 0.54]) {
      const umpak = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.22, 8), batuMat);
      umpak.position.set(sx, -0.96, sz);
      umpak.userData.explodeVec = new THREE.Vector3(sx * 0.4, -0.5, sz * 0.4);

      const saka = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.38, 0.14), jatiMat);
      saka.position.set(sx, -0.18, sz);
      saka.userData.explodeVec = new THREE.Vector3(sx * 0.5, -0.06, sz * 0.5);
      group.add(umpak, saka);
    }
  }

  // Kerangka Sunduk & Pangeret (Balok Pengikat Seismik Tanpa Paku)
  const sundukGrup = new THREE.Group();
  sundukGrup.userData.explodeVec = new THREE.Vector3(0, 0.16, 0);
  for (const sz of [-0.54, 0.54]) {
    const sundukX = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.085, 0.11), jatiMat);
    sundukX.position.set(0, 0.42, sz);
    sundukGrup.add(sundukX);
  }
  for (const sx of [-0.62, 0.62]) {
    const pangeretZ = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 1.24), jatiMat);
    pangeretZ.position.set(sx, 0.42, 0);
    sundukGrup.add(pangeretZ);
  }
  group.add(sundukGrup);

  // 12 Tiang Keliling Penanggap + Konsol Bahu Danyang
  for (const sx of [-1.15, 1.15]) {
    for (const sz of [-0.95, -0.32, 0.32, 0.95]) {
      const tiangLuar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.02, 0.09), jatiMat);
      tiangLuar.position.set(sx, -0.44, sz);
      tiangLuar.userData.explodeVec = new THREE.Vector3(sx * 0.65, -0.18, sz * 0.65);
      group.add(tiangLuar);
    }
  }

  // 6 Undakan Balok Tumpang Sari Berongga Asli (4 Batang Bingkai Terbuka per Tingkat)
  for (let tier = 0; tier < 6; tier++) {
    const wSpan = 1.48 - tier * 0.17;
    const dSpan = 1.32 - tier * 0.15;
    const thick = 0.075;
    const tierGrup = new THREE.Group();
    tierGrup.position.y = 0.52 + tier * 0.09;
    tierGrup.userData.explodeVec = new THREE.Vector3(0, 0.28 + tier * 0.19, 0);

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
    group.add(tierGrup);
  }

  // Lampu Robyong Kuningan Keraton Menggantung di Ruang Uleng
  const robyong = new THREE.Group();
  robyong.position.set(0, 0.34, 0);
  robyong.userData.explodeVec = new THREE.Vector3(0, 0.18, 0.44);
  const kapLampu = new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 14), emasMat);
  const rantai = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), emasMat);
  rantai.position.y = 0.28;
  robyong.add(kapLampu, rantai);
  group.add(robyong);

  const penanggap = new THREE.Mesh(
    buatGeometriAtapTrapesiumTwin(2.75, 2.48, 1.52, 1.32, 0.46),
    gentengMat,
  );
  penanggap.position.y = 0.62;
  penanggap.userData.explodeVec = new THREE.Vector3(0, 0.88, 0);

  const brunjung = new THREE.Mesh(
    buatGeometriAtapTrapesiumTwin(1.58, 1.36, 0.64, 0.16, 0.96),
    gentengMat,
  );
  brunjung.position.y = 1.32;
  brunjung.userData.explodeVec = new THREE.Vector3(0, 1.12, 0);

  const wuwunganGrup = new THREE.Group();
  wuwunganGrup.position.y = 1.84;
  wuwunganGrup.userData.explodeVec = new THREE.Vector3(0, 1.36, 0);
  const bubungan = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.095, 0.14), emasMat);
  wuwunganGrup.add(bubungan);
  for (const wx of [-0.32, 0.32]) {
    const makuta = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 6), emasMat);
    makuta.position.set(wx, 0.1, 0);
    wuwunganGrup.add(makuta);
  }

  group.add(penanggap, brunjung, wuwunganGrup);
  return { group };
}

/** 5. Wayang Kulit Sri Rama, Stand Gedebog Pisang & Pelita Minyak Blencong gantung. */
export function buildWayangSriRamaDanBlencong3D(): PaketModel3D {
  const group = new THREE.Group();
  const rama = buildSriRamaWayang3D();
  rama.root.scale.setScalar(1.2);
  rama.root.position.set(0, 0.12, 0);

  // Dudukan Batang Gedebog Pisang & Ring Kuningan Stand Panggung
  const gedebogGrup = new THREE.Group();
  gedebogGrup.position.set(0, -1.62, 0);
  gedebogGrup.userData.explodeVec = new THREE.Vector3(0, -0.68, 0);
  const batangGedebog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.24, 24),
    new THREE.MeshStandardMaterial({ color: 0x5d6e3a, roughness: 0.78 }),
  );
  const ringGedebog = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.022, 10, 28),
    new THREE.MeshPhysicalMaterial({ color: 0xd9a84e, metalness: 0.85, roughness: 0.24 }),
  );
  ringGedebog.rotation.x = Math.PI / 2;
  ringGedebog.position.y = 0.08;
  gedebogGrup.add(batangGedebog, ringGedebog);

  const blencongData = buildBlencongWayang3D();
  blencongData.group.position.set(-1.18, 0.94, 0.28);
  blencongData.group.rotation.y = 0.42;
  blencongData.group.userData.explodeVec = new THREE.Vector3(-0.72, 0.52, 0.35);

  group.add(rama.root, gedebogGrup, blencongData.group);
  return {
    group,
    blencongFlame: blencongData.flame,
    blencongLight: blencongData.light,
  };
}

/** 6. Kidang Kencana & Pelita Blencong (Lengkap dengan explodeVec CAD untuk Bedah 3D & Coverflow). */
export function buildKidangDanBlencong3D(): PaketModel3D {
  const group = new THREE.Group();
  const kidang = buildKidangKencana3D();
  kidang.root.scale.setScalar(1.36);
  kidang.root.position.set(0.18, -0.26, 0);

  // Sematkan vector ledak anatomi di tiap bagian sendi Kidang Kencana agar Bedah 3D memisahkan bagian secara nyata
  kidang.leherKepala.userData.explodeVec = new THREE.Vector3(0.28, 0.48, 0.22);
  kidang.kakiDepan.userData.explodeVec = new THREE.Vector3(0.26, -0.32, 0.24);
  kidang.kakiBelakang.userData.explodeVec = new THREE.Vector3(-0.28, -0.32, -0.18);

  const gedebogGrup = new THREE.Group();
  gedebogGrup.position.set(0.18, -1.68, 0);
  gedebogGrup.userData.explodeVec = new THREE.Vector3(0, -0.68, 0);
  const batangGedebog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.22, 24),
    new THREE.MeshStandardMaterial({ color: 0x5d6e3a, roughness: 0.78 }),
  );
  gedebogGrup.add(batangGedebog);

  const blencongData = buildBlencongWayang3D();
  blencongData.group.position.set(-0.92, 0.96, 0.24);
  blencongData.group.rotation.y = 0.35;
  blencongData.group.userData.explodeVec = new THREE.Vector3(-0.56, 0.24, 0.28);

  group.add(kidang.root, gedebogGrup, blencongData.group);
  return {
    group,
    blencongFlame: blencongData.flame,
    blencongLight: blencongData.light,
  };
}

/** 7. Prasasti Tembaga & Astrolabe Hanacaraka Unicode U+A980–U+A9DF (Lengkap dengan explodeVec CAD). */
export function buildPrasastiHanacaraka3D(): PaketModel3D {
  const group = new THREE.Group();
  const prasasti = buatTeksturPrasastiHanacaraka();
  const tex = loadBudayaTextures();

  const perungguMat = new THREE.MeshPhysicalMaterial({
    map: prasasti.diffuse,
    bumpMap: prasasti.bump,
    bumpScale: 0.036,
    metalness: 0.74,
    roughness: 0.32,
    clearcoat: 0.42,
  });
  const bingkaiJatiMat = new THREE.MeshPhysicalMaterial({
    map: tex.kayuDiffuse,
    normalMap: tex.kayuNormal,
    color: 0x5c3018,
    roughness: 0.42,
    clearcoat: 0.28,
  });
  const kuninganMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6b655,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.48,
  });

  // Bingkai Kayu Jati Ukir + 4 Ornamen Paku Sudut Kuningan
  const bingkaiGrup = new THREE.Group();
  bingkaiGrup.userData.explodeVec = new THREE.Vector3(0, 0.04, -0.48);
  const bingkaiKayu = new THREE.Mesh(new THREE.BoxGeometry(1.76, 2.3, 0.14), bingkaiJatiMat);
  bingkaiKayu.castShadow = true;
  bingkaiGrup.add(bingkaiKayu);
  for (const [bx, by] of [
    [-0.78, 1.04],
    [0.78, 1.04],
    [-0.78, -1.04],
    [0.78, -1.04],
  ]) {
    const pakuSudut = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), kuninganMat);
    pakuSudut.position.set(bx, by, 0.08);
    bingkaiGrup.add(pakuSudut);
  }
  group.add(bingkaiGrup);

  // Lempeng depan & belakang prasasti bertatah 20 aksara Jawa Nglegena
  const lempeng = new THREE.Mesh(new THREE.BoxGeometry(1.52, 2.04, 0.16), perungguMat);
  lempeng.userData.explodeVec = new THREE.Vector3(0, 0.12, 0.46);
  group.add(lempeng);

  // Pondasi andesit berundak penopang prasasti
  const kakiGrup = new THREE.Group();
  kakiGrup.position.set(0, -1.24, 0);
  kakiGrup.userData.explodeVec = new THREE.Vector3(0, -0.62, 0);
  const batuMat = new THREE.MeshStandardMaterial({ color: 0x3b3834, roughness: 0.78 });
  const kakiBawah = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.14, 0.72), batuMat);
  kakiBawah.position.y = -0.05;
  const kakiAtas = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 0.54), batuMat);
  kakiAtas.position.y = 0.08;
  kakiGrup.add(kakiBawah, kakiAtas);
  group.add(kakiGrup);

  // Mahkota Cincin Astrolabe Kuningan di puncak prasasti
  const mahkotaOrb = new THREE.Group();
  mahkotaOrb.position.set(0, 1.38, 0);
  mahkotaOrb.userData.explodeVec = new THREE.Vector3(0, 0.72, 0);
  const ringLuar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.022, 12, 36), kuninganMat);
  const ringDalam = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.016, 12, 30), kuninganMat);
  ringDalam.rotation.x = Math.PI / 3;
  const intiPermata = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.09, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xf06d3c,
      emissive: 0xd1491b,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.15,
      clearcoat: 1,
    }),
  );
  mahkotaOrb.add(ringLuar, ringDalam, intiPermata);
  group.add(mahkotaOrb);

  return { group, orbitAccent: mahkotaOrb };
}
