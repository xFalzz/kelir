import * as THREE from 'three';
import { tandaiTeksturCacheBersama } from './threeHelpers.ts';

export interface WayangSriRamaRig {
  root: THREE.Group;
  badan: THREE.Group;
  lenganKanan: THREE.Group;
  sikuKanan: THREE.Group;
  lenganKiri: THREE.Group;
  sikuKiri: THREE.Group;
  busur: THREE.Group;
}

export interface KidangKencanaRig {
  root: THREE.Group;
  badan: THREE.Group;
  leherKepala: THREE.Group;
  kakiDepan: THREE.Group;
  kakiBelakang: THREE.Group;
}

export type WayangKidangRig = KidangKencanaRig;

let cacheSriRamaDiffuse: THREE.CanvasTexture | null = null;
let cacheSriRamaBump: THREE.CanvasTexture | null = null;
let cacheDodotDiffuse: THREE.CanvasTexture | null = null;
let cacheDodotBump: THREE.CanvasTexture | null = null;
let cacheGununganDiffuse: THREE.CanvasTexture | null = null;
let cacheGununganBump: THREE.CanvasTexture | null = null;
let cacheKidangDiffuse: THREE.CanvasTexture | null = null;
let cacheKidangBump: THREE.CanvasTexture | null = null;

// Cache geometri hasil ekstrusi di level modul agar pemuatan halaman instan tanpa hitung ulang triangulasi
const cacheExtrudeGeo = new Map<string, THREE.BufferGeometry>();

/**
 * Menormalkan koordinat UV pada ExtrudeGeometry ke rentang [0..1]
 * berdasarkan bounding box (X, Y) agar tekstur tidak mengalami clamping di koordinat negatif.
 */
export function normalisasiUvExtrude(geo: THREE.BufferGeometry, pad = 0.02): void {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const pos = geo.attributes.position as THREE.BufferAttribute | undefined;
  const uv = geo.attributes.uv as THREE.BufferAttribute | undefined;
  if (!bb || !pos || !uv) return;

  const spanX = Math.max(bb.max.x - bb.min.x, 1e-4);
  const spanY = Math.max(bb.max.y - bb.min.y, 1e-4);
  const scale = 1 - pad * 2;

  for (let i = 0; i < pos.count; i++) {
    const u = pad + ((pos.getX(i) - bb.min.x) / spanX) * scale;
    const v = pad + ((pos.getY(i) - bb.min.y) / spanY) * scale;
    uv.setXY(i, THREE.MathUtils.clamp(u, 0.005, 0.995), THREE.MathUtils.clamp(v, 0.005, 0.995));
  }
  uv.needsUpdate = true;
}

function ambilAtauBuatExtrudeGeo(
  kunci: string,
  buat: () => THREE.BufferGeometry,
): THREE.BufferGeometry {
  let geo = cacheExtrudeGeo.get(kunci);
  if (!geo) {
    geo = buat();
    cacheExtrudeGeo.set(kunci, geo);
  }
  // Kembalikan clone ringan yang berbagi atribut BufferAttribute agar aman saat disposeSceneObject dipanggil
  return geo.clone();
}

function getTeksturPradaTatahan(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheSriRamaDiffuse && cacheSriRamaBump) {
    return { diffuse: cacheSriRamaDiffuse, bump: cacheSriRamaBump };
  }

  const size = 256;
  const cDiff = document.createElement('canvas');
  cDiff.width = size;
  cDiff.height = size;
  const ctx = cDiff.getContext('2d');

  const cBump = document.createElement('canvas');
  cBump.width = size;
  cBump.height = size;
  const bCtx = cBump.getContext('2d');

  if (!ctx || !bCtx) return { diffuse: null, bump: null };

  const grad = ctx.createRadialGradient(size * 0.5, size * 0.45, 12, size * 0.5, size * 0.5, size * 0.65);
  grad.addColorStop(0, '#f3c65f');
  grad.addColorStop(0.45, '#d59834');
  grad.addColorStop(0.82, '#9e6218');
  grad.addColorStop(1, '#5e340b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#848484';
  bCtx.fillRect(0, 0, size, size);

  // Sabuk sunggingan merah gendul, biru nila, dan hijau jamrud khas tatahan Surakarta
  const drawSunggingBand = (yCenter: number, bandH: number, colorA: string, colorB: string) => {
    const sg = ctx.createLinearGradient(0, yCenter - bandH / 2, 0, yCenter + bandH / 2);
    sg.addColorStop(0, colorA);
    sg.addColorStop(0.5, colorB);
    sg.addColorStop(1, colorA);
    ctx.fillStyle = sg;
    ctx.fillRect(12, yCenter - bandH / 2, size - 24, bandH);

    ctx.strokeStyle = '#f8d87c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, yCenter - bandH / 2, size - 24, bandH);

    bCtx.strokeStyle = '#dcdcdc';
    bCtx.lineWidth = 2;
    bCtx.strokeRect(12, yCenter - bandH / 2, size - 24, bandH);
  };

  drawSunggingBand(48, 18, 'rgba(138, 24, 18, 0.65)', 'rgba(218, 56, 32, 0.72)');
  drawSunggingBand(128, 20, 'rgba(22, 62, 84, 0.55)', 'rgba(42, 112, 138, 0.62)');
  drawSunggingBand(204, 18, 'rgba(138, 24, 18, 0.65)', 'rgba(218, 56, 32, 0.72)');

  // Grid tatahan mas-masan, sembuliyan, dan cecekan krawangan
  const cell = 32;
  for (let gx = cell; gx < size; gx += cell) {
    for (let gy = cell; gy < size; gy += cell) {
      ctx.strokeStyle = 'rgba(52, 22, 5, 0.58)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(gx, gy, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 232, 152, 0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx, gy, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#240f04';
      ctx.beginPath();
      ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
      ctx.fill();

      bCtx.strokeStyle = '#e5e5e5';
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(gx, gy, 8, 0, Math.PI * 2);
      bCtx.stroke();

      bCtx.fillStyle = '#141414';
      bCtx.beginPath();
      bCtx.arc(gx, gy, 3, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  cacheSriRamaDiffuse = tandaiTeksturCacheBersama(new THREE.CanvasTexture(cDiff));
  cacheSriRamaDiffuse.colorSpace = THREE.SRGBColorSpace;
  cacheSriRamaDiffuse.wrapS = THREE.RepeatWrapping;
  cacheSriRamaDiffuse.wrapT = THREE.RepeatWrapping;

  cacheSriRamaBump = tandaiTeksturCacheBersama(new THREE.CanvasTexture(cBump));
  cacheSriRamaBump.wrapS = THREE.RepeatWrapping;
  cacheSriRamaBump.wrapT = THREE.RepeatWrapping;

  return { diffuse: cacheSriRamaDiffuse, bump: cacheSriRamaBump };
}

function getTeksturKainDodot(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheDodotDiffuse && cacheDodotBump) {
    return { diffuse: cacheDodotDiffuse, bump: cacheDodotBump };
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return { diffuse: null, bump: null };

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#6e1912');
  bg.addColorStop(0.5, '#8c2318');
  bg.addColorStop(1, '#4c110c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#787878';
  bCtx.fillRect(0, 0, size, size);

  for (let diag = -size; diag < size * 2; diag += 32) {
    ctx.fillStyle = 'rgba(28, 14, 9, 0.72)';
    ctx.beginPath();
    ctx.moveTo(diag, 0);
    ctx.lineTo(diag + 16, 0);
    ctx.lineTo(diag - size + 16, size);
    ctx.lineTo(diag - size, size);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f2c968';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(diag, 0);
    ctx.lineTo(diag - size, size);
    ctx.stroke();

    bCtx.strokeStyle = '#dedede';
    bCtx.lineWidth = 2;
    ctx.beginPath();
    bCtx.moveTo(diag, 0);
    bCtx.lineTo(diag - size, size);
    bCtx.stroke();
  }

  ctx.fillStyle = 'rgba(242, 198, 94, 0.25)';
  ctx.fillRect(0, 0, size, 24);
  ctx.strokeStyle = '#f8d878';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  cacheDodotDiffuse = tandaiTeksturCacheBersama(new THREE.CanvasTexture(canvas));
  cacheDodotDiffuse.colorSpace = THREE.SRGBColorSpace;
  cacheDodotDiffuse.wrapS = THREE.RepeatWrapping;
  cacheDodotDiffuse.wrapT = THREE.RepeatWrapping;

  cacheDodotBump = tandaiTeksturCacheBersama(new THREE.CanvasTexture(bumpCanvas));
  cacheDodotBump.wrapS = THREE.RepeatWrapping;
  cacheDodotBump.wrapT = THREE.RepeatWrapping;

  return { diffuse: cacheDodotDiffuse, bump: cacheDodotBump };
}

function getTeksturGununganDetail(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheGununganDiffuse && cacheGununganBump) {
    return { diffuse: cacheGununganDiffuse, bump: cacheGununganBump };
  }

  const w = 256;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return { diffuse: null, bump: null };

  const bg = ctx.createLinearGradient(0, h, 0, 0);
  bg.addColorStop(0, '#2e1109');
  bg.addColorStop(0.28, '#5e1a0e');
  bg.addColorStop(0.62, '#3a1a0c');
  bg.addColorStop(0.88, '#6e3814');
  bg.addColorStop(1, '#d69e3a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#707070';
  bCtx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#f5cb64';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(w / 2, 12);
  ctx.bezierCurveTo(w * 0.92, h * 0.34, w * 0.96, h * 0.68, w * 0.82, h - 10);
  ctx.lineTo(w * 0.18, h - 10);
  ctx.bezierCurveTo(w * 0.04, h * 0.68, w * 0.08, h * 0.34, w / 2, 12);
  ctx.closePath();
  ctx.stroke();

  bCtx.strokeStyle = '#ececec';
  bCtx.lineWidth = 6;
  bCtx.stroke();

  // Gapura Candi di kaki Kayon
  ctx.fillStyle = '#99321b';
  ctx.strokeStyle = '#f5cb64';
  ctx.lineWidth = 2;
  ctx.fillRect(w * 0.28, 380, w * 0.44, 105);
  ctx.strokeRect(w * 0.28, 380, w * 0.44, 105);

  // Wajah Banaspati di tengah
  ctx.fillStyle = '#b82816';
  ctx.beginPath();
  ctx.arc(w / 2, 298, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f8d46e';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Batang & Cabang Pohon Hayat Kalpataru
  ctx.strokeStyle = '#f5c95c';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w / 2, 268);
  ctx.lineTo(w / 2, 48);
  ctx.stroke();

  for (let level = 0; level < 5; level++) {
    const by = 240 - level * 36;
    const reach = 82 - level * 10;
    for (const dir of [-1, 1]) {
      ctx.strokeStyle = '#f5c95c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2, by);
      ctx.quadraticCurveTo(w / 2 + dir * reach * 0.5, by - 18, w / 2 + dir * reach, by - 10);
      ctx.stroke();

      ctx.fillStyle = level % 2 === 0 ? '#e3532a' : '#43946c';
      ctx.beginPath();
      ctx.arc(w / 2 + dir * reach * 0.78, by - 9, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  cacheGununganDiffuse = tandaiTeksturCacheBersama(new THREE.CanvasTexture(canvas));
  cacheGununganDiffuse.colorSpace = THREE.SRGBColorSpace;
  cacheGununganBump = tandaiTeksturCacheBersama(new THREE.CanvasTexture(bumpCanvas));

  return { diffuse: cacheGununganDiffuse, bump: cacheGununganBump };
}

function getTeksturKidangKencana(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheKidangDiffuse && cacheKidangBump) {
    return { diffuse: cacheKidangDiffuse, bump: cacheKidangBump };
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return { diffuse: null, bump: null };

  const grad = ctx.createLinearGradient(0, size, 0, 0);
  grad.addColorStop(0, '#8a3412');
  grad.addColorStop(0.32, '#c86a1e');
  grad.addColorStop(0.68, '#eab33e');
  grad.addColorStop(1, '#8c2814');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let gx = 24; gx < size - 16; gx += 32) {
    for (let gy = 24; gy < size - 16; gy += 32) {
      const ox = gx + ((gy / 32) % 2) * 14;
      ctx.fillStyle = '#fff1b5';
      ctx.beginPath();
      ctx.arc(ox, gy, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#73200c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, gy, 6.5, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.fillStyle = '#ececec';
      bCtx.beginPath();
      ctx.arc(ox, gy, 5, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  cacheKidangDiffuse = tandaiTeksturCacheBersama(new THREE.CanvasTexture(canvas));
  cacheKidangDiffuse.colorSpace = THREE.SRGBColorSpace;
  cacheKidangBump = tandaiTeksturCacheBersama(new THREE.CanvasTexture(bumpCanvas));

  return { diffuse: cacheKidangDiffuse, bump: cacheKidangBump };
}

/**
 * Membangun Lampu Minyak Kelapa Blencong Kencana Gantung (Garuda Kyai Blencong).
 */
export function buildBlencongWayang3D(): {
  grup: THREE.Group;
  nyalaInti: THREE.Mesh;
  haloApi: THREE.Mesh;
} {
  const grup = new THREE.Group();
  const tatahan = getTeksturPradaTatahan();

  const kuninganTuaMat = new THREE.MeshStandardMaterial({
    color: 0xd8a23c,
    roughness: 0.24,
    metalness: 0.88,
    bumpMap: tatahan.bump,
    bumpScale: 0.008,
  });

  const perungguGelapMat = new THREE.MeshStandardMaterial({
    color: 0x4b3316,
    roughness: 0.36,
    metalness: 0.82,
  });

  const ptsTangki = [
    new THREE.Vector2(0.0, -0.22),
    new THREE.Vector2(0.09, -0.2),
    new THREE.Vector2(0.06, -0.15),
    new THREE.Vector2(0.24, -0.1),
    new THREE.Vector2(0.34, -0.01),
    new THREE.Vector2(0.31, 0.08),
    new THREE.Vector2(0.18, 0.13),
    new THREE.Vector2(0.12, 0.2),
    new THREE.Vector2(0.0, 0.22),
  ];
  const tangkiMesh = new THREE.Mesh(new THREE.LatheGeometry(ptsTangki, 20), kuninganTuaMat);
  grup.add(tangkiMesh);

  const garudaHead = new THREE.Group();
  garudaHead.position.set(0, 0.06, -0.32);
  const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), kuninganTuaMat);
  kepala.scale.set(0.9, 1.1, 1.25);
  const paruh = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.12, 8), perungguGelapMat);
  paruh.rotation.x = -Math.PI * 0.62;
  paruh.position.set(0, -0.02, -0.09);
  garudaHead.add(kepala, paruh);
  grup.add(garudaHead);

  const sayapGeo = ambilAtauBuatExtrudeGeo('blencong-sayap', () => {
    const sayapShape = new THREE.Shape();
    sayapShape.moveTo(0, -0.06);
    sayapShape.bezierCurveTo(0.22, 0.24, 0.56, 0.34, 0.66, 0.12);
    sayapShape.bezierCurveTo(0.62, -0.04, 0.52, -0.14, 0.42, -0.2);
    sayapShape.bezierCurveTo(0.28, -0.24, 0.12, -0.16, 0, -0.06);

    for (const [hx, hy, hr] of [
      [0.24, 0.08, 0.028],
      [0.38, 0.1, 0.03],
      [0.34, -0.04, 0.025],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      sayapShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(sayapShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });

  const sayapKanan = new THREE.Mesh(sayapGeo, kuninganTuaMat);
  sayapKanan.position.set(0.22, 0.02, -0.06);
  sayapKanan.rotation.y = -0.28;

  const sayapKiri = new THREE.Mesh(sayapGeo.clone(), kuninganTuaMat);
  sayapKiri.scale.x = -1;
  sayapKiri.position.set(-0.22, 0.02, -0.06);
  sayapKiri.rotation.y = 0.28;
  grup.add(sayapKanan, sayapKiri);

  const ceratCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.03, 0.25),
    new THREE.Vector3(0, -0.05, 0.42),
    new THREE.Vector3(0, 0.04, 0.54),
    new THREE.Vector3(0, 0.12, 0.58),
  ]);
  const ceratMesh = new THREE.Mesh(
    new THREE.TubeGeometry(ceratCurve, 12, 0.034, 8, false),
    perungguGelapMat,
  );
  grup.add(ceratMesh);

  const nyalaMat = new THREE.MeshStandardMaterial({
    color: 0xfff6cf,
    emissive: 0xff9b26,
    emissiveIntensity: 3.4,
    roughness: 0.1,
  });
  const nyalaInti = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.22, 10), nyalaMat);
  nyalaInti.position.set(0, 0.25, 0.58);
  grup.add(nyalaInti);

  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xffae38,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const haloApi = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), haloMat);
  haloApi.position.set(0, 0.25, 0.58);
  grup.add(haloApi);

  for (const [rx, rz] of [
    [-0.18, -0.06],
    [0.18, -0.06],
    [0, 0.18],
  ]) {
    const rantaiCurve = new THREE.LineCurve3(
      new THREE.Vector3(rx, 0.12, rz),
      new THREE.Vector3(0, 0.62, 0),
    );
    const rantai = new THREE.Mesh(
      new THREE.TubeGeometry(rantaiCurve, 4, 0.011, 6, false),
      perungguGelapMat,
    );
    grup.add(rantai);
  }

  return { grup, nyalaInti, haloApi };
}

/**
 * Membangun Wayang Kulit Purwa Sri Rama (Kria Tatahan Kulit Kerbau & Sunggingan Prada)
 */
export function buildSriRamaWayang3D(): WayangSriRamaRig {
  const root = new THREE.Group();
  const badan = new THREE.Group();
  root.add(badan);

  const tex = getTeksturPradaTatahan();
  const dodotTex = getTeksturKainDodot();

  const kulitPradaMat = new THREE.MeshStandardMaterial({
    color: 0xe8b54c,
    map: tex.diffuse,
    bumpMap: tex.bump,
    bumpScale: 0.022,
    roughness: 0.36,
    metalness: 0.58,
  });

  const pradaMurniMat = new THREE.MeshStandardMaterial({
    color: 0xf4c960,
    bumpMap: tex.bump,
    bumpScale: 0.015,
    roughness: 0.26,
    metalness: 0.78,
  });

  const wajahHitamLuruhMat = new THREE.MeshStandardMaterial({
    color: 0x17120e,
    roughness: 0.38,
    metalness: 0.25,
  });

  const mahkotaSogaMat = new THREE.MeshStandardMaterial({
    color: 0x26150b,
    bumpMap: tex.bump,
    bumpScale: 0.016,
    roughness: 0.35,
    metalness: 0.42,
  });

  const kainDodotMat = new THREE.MeshStandardMaterial({
    color: 0xd96838,
    map: dodotTex.diffuse,
    bumpMap: dodotTex.bump,
    bumpScale: 0.02,
    roughness: 0.44,
    metalness: 0.3,
  });

  const tandukGapitMat = new THREE.MeshStandardMaterial({
    color: 0x2a1d13,
    roughness: 0.28,
    metalness: 0.15,
  });

  const gegelKuninganMat = new THREE.MeshStandardMaterial({
    color: 0xfbe088,
    roughness: 0.2,
    metalness: 0.9,
  });

  // 1. Torso Ksatria Berpinggang Ramping
  const torsoGeo = ambilAtauBuatExtrudeGeo('rama-torso', () => {
    const torsoShape = new THREE.Shape();
    torsoShape.moveTo(-0.15, -0.05);
    torsoShape.bezierCurveTo(-0.18, 0.14, -0.32, 0.36, -0.35, 0.56);
    torsoShape.bezierCurveTo(-0.34, 0.65, -0.18, 0.68, -0.06, 0.71);
    torsoShape.lineTo(0.06, 0.71);
    torsoShape.bezierCurveTo(0.18, 0.68, 0.34, 0.65, 0.35, 0.56);
    torsoShape.bezierCurveTo(0.32, 0.36, 0.18, 0.14, 0.15, -0.05);
    torsoShape.closePath();

    for (const [hx, hy, hr] of [
      [0, 0.46, 0.032],
      [-0.12, 0.48, 0.024],
      [0.12, 0.48, 0.024],
      [-0.07, 0.33, 0.022],
      [0.07, 0.33, 0.022],
      [0, 0.2, 0.025],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      torsoShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(torsoShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
      curveSegments: 12,
    });
    g.center();
    normalisasiUvExtrude(g);
    return g;
  });
  const torsoMesh = new THREE.Mesh(torsoGeo, kulitPradaMat);
  torsoMesh.position.set(0, 0.34, 0);
  torsoMesh.castShadow = true;
  badan.add(torsoMesh);

  // 2. Praba Agung (Sayap Punggung Kerajaan Ksatria)
  const prabaGeo = ambilAtauBuatExtrudeGeo('rama-praba', () => {
    const prabaShape = new THREE.Shape();
    prabaShape.moveTo(0.05, 0.35);
    prabaShape.bezierCurveTo(0.28, 0.42, 0.42, 0.68, 0.34, 0.98);
    prabaShape.bezierCurveTo(0.28, 1.12, 0.16, 1.02, 0.12, 0.85);
    prabaShape.bezierCurveTo(0.14, 0.68, 0.12, 0.5, 0.05, 0.35);
    for (const [hx, hy, hr] of [
      [0.24, 0.68, 0.028],
      [0.27, 0.82, 0.025],
    ]) {
      const h = new THREE.Path();
      h.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      prabaShape.holes.push(h);
    }
    const g = new THREE.ExtrudeGeometry(prabaShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelSize: 0.005,
      bevelThickness: 0.005,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const prabaMesh = new THREE.Mesh(prabaGeo, pradaMurniMat);
  prabaMesh.position.set(0, 0, -0.018);
  badan.add(prabaMesh);

  // 3. Kalung Ulur-Ulur & Sabuk Pending Kencana
  const kalungCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0.62, 0.022),
    new THREE.Vector3(-0.11, 0.36, 0.025),
    new THREE.Vector3(0, 0.22, 0.028),
    new THREE.Vector3(0.11, 0.36, 0.025),
    new THREE.Vector3(0.14, 0.62, 0.022),
  ]);
  const kalungMesh = new THREE.Mesh(
    new THREE.TubeGeometry(kalungCurve, 14, 0.014, 6, false),
    gegelKuninganMat,
  );
  badan.add(kalungMesh);

  const pendingMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.17, 0.09, 14),
    pradaMurniMat,
  );
  pendingMesh.scale.set(1, 1, 0.28);
  pendingMesh.position.set(0, 0.01, 0);
  badan.add(pendingMesh);

  // 4. Profil Wajah Luruh Bangsawan
  const kepalaGeo = ambilAtauBuatExtrudeGeo('rama-kepala', () => {
    const kepalaShape = new THREE.Shape();
    kepalaShape.moveTo(-0.07, 0.68);
    kepalaShape.lineTo(-0.13, 0.72);
    kepalaShape.lineTo(-0.17, 0.75);
    kepalaShape.lineTo(-0.27, 0.8);
    kepalaShape.lineTo(-0.17, 0.83);
    kepalaShape.bezierCurveTo(-0.14, 0.91, -0.04, 0.96, 0.08, 0.93);
    kepalaShape.bezierCurveTo(0.14, 0.86, 0.13, 0.74, 0.05, 0.68);
    kepalaShape.closePath();

    const g = new THREE.ExtrudeGeometry(kepalaShape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const kepalaMesh = new THREE.Mesh(kepalaGeo, wajahHitamLuruhMat);
  kepalaMesh.position.z = -0.012;
  badan.add(kepalaMesh);

  const mataMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.009, 0.028, 4, 6),
    gegelKuninganMat,
  );
  mataMesh.rotation.z = Math.PI * 0.42;
  mataMesh.position.set(-0.12, 0.81, 0.016);
  badan.add(mataMesh);

  // 5. Mahkota Gelung Supit Urang & Jamang Emas
  const gelungGeo = ambilAtauBuatExtrudeGeo('rama-gelung', () => {
    const gelungShape = new THREE.Shape();
    gelungShape.moveTo(-0.13, 0.85);
    gelungShape.bezierCurveTo(-0.1, 0.99, 0.04, 1.08, 0.18, 1.05);
    gelungShape.bezierCurveTo(0.28, 1.18, 0.22, 1.44, 0.02, 1.54);
    gelungShape.bezierCurveTo(-0.09, 1.56, -0.11, 1.44, -0.02, 1.38);
    gelungShape.bezierCurveTo(0.11, 1.34, 0.14, 1.16, 0.02, 1.08);
    gelungShape.bezierCurveTo(0.12, 1.0, 0.16, 0.84, 0.06, 0.74);
    gelungShape.closePath();

    for (const [hx, hy, hr] of [
      [0.04, 0.95, 0.024],
      [0.14, 1.16, 0.024],
      [0.12, 1.32, 0.022],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      gelungShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(gelungShape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
      curveSegments: 12,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const gelungMesh = new THREE.Mesh(gelungGeo, mahkotaSogaMat);
  gelungMesh.position.z = -0.012;
  badan.add(gelungMesh);

  const jamangCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0.85, 0.018),
    new THREE.Vector3(-0.04, 0.94, 0.022),
    new THREE.Vector3(0.1, 0.98, 0.02),
    new THREE.Vector3(0.18, 1.18, 0.018),
    new THREE.Vector3(0.04, 1.48, 0.018),
  ]);
  const jamangMesh = new THREE.Mesh(
    new THREE.TubeGeometry(jamangCurve, 16, 0.016, 6, false),
    pradaMurniMat,
  );
  badan.add(jamangMesh);

  // 6. Kain Kampuh / Dodot Sembuliyan Kerajaan + Uncal Kencana
  const dodotGeo = ambilAtauBuatExtrudeGeo('rama-dodot', () => {
    const dodotShape = new THREE.Shape();
    dodotShape.moveTo(-0.17, 0.02);
    dodotShape.bezierCurveTo(-0.27, -0.14, -0.34, -0.44, -0.26, -0.68);
    dodotShape.lineTo(-0.08, -0.66);
    dodotShape.bezierCurveTo(-0.02, -0.78, 0.08, -0.82, 0.16, -0.74);
    dodotShape.bezierCurveTo(0.34, -0.58, 0.4, -0.24, 0.24, 0.02);
    dodotShape.closePath();

    for (const [hx, hy, hr] of [
      [-0.14, -0.32, 0.024],
      [0.04, -0.46, 0.026],
      [0.18, -0.3, 0.025],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      dodotShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(dodotShape, {
      depth: 0.032,
      bevelEnabled: true,
      bevelSize: 0.007,
      bevelThickness: 0.007,
      bevelSegments: 1,
      curveSegments: 12,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const dodotMesh = new THREE.Mesh(dodotGeo, kainDodotMat);
  dodotMesh.position.z = -0.016;
  dodotMesh.castShadow = true;
  badan.add(dodotMesh);

  for (const xOff of [-0.08, 0.05]) {
    const uncalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xOff, -0.02, 0.024),
      new THREE.Vector3(xOff - 0.03, -0.32, 0.028),
      new THREE.Vector3(xOff - 0.01, -0.62, 0.025),
    ]);
    const uncalMesh = new THREE.Mesh(
      new THREE.TubeGeometry(uncalCurve, 8, 0.014, 6, false),
      pradaMurniMat,
    );
    badan.add(uncalMesh);
  }

  // 7. Sepasang Kaki Ksatria Berlangkah Jangkah
  const buatKakiKsatria = (kunci: string, xPos: number, zPos: number): THREE.Group => {
    const grupKaki = new THREE.Group();
    const kakiGeo = ambilAtauBuatExtrudeGeo(kunci, () => {
      const kakiShape = new THREE.Shape();
      kakiShape.moveTo(xPos - 0.045, -0.56);
      kakiShape.lineTo(xPos - 0.055, -0.96);
      kakiShape.lineTo(xPos - 0.16, -0.99);
      kakiShape.bezierCurveTo(xPos - 0.18, -1.03, xPos - 0.08, -1.04, xPos + 0.05, -1.03);
      kakiShape.lineTo(xPos + 0.045, -0.56);
      kakiShape.closePath();

      const g = new THREE.ExtrudeGeometry(kakiShape, {
        depth: 0.022,
        bevelEnabled: false,
        curveSegments: 8,
      });
      normalisasiUvExtrude(g);
      return g;
    });
    const mesh = new THREE.Mesh(kakiGeo, kulitPradaMat);
    mesh.position.z = zPos;
    grupKaki.add(mesh);

    const binggel = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.009, 6, 12),
      gegelKuninganMat,
    );
    binggel.rotation.x = Math.PI / 2;
    binggel.position.set(xPos - 0.01, -0.9, zPos + 0.011);
    grupKaki.add(binggel);
    return grupKaki;
  };
  badan.add(
    buatKakiKsatria('rama-kaki-kiri', -0.15, -0.011),
    buatKakiKsatria('rama-kaki-kanan', 0.14, -0.014),
  );

  // 8. Lengan Kanan Berartikulasi (Memegang Busur Gandewa & Tali Nock Hidup)
  const lenganKanan = new THREE.Group();
  lenganKanan.position.set(-0.27, 0.56, 0.024);
  lenganKanan.rotation.z = -0.34;
  badan.add(lenganKanan);

  const bahuPinKanan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.06, 10),
    gegelKuninganMat,
  );
  bahuPinKanan.rotation.x = Math.PI / 2;
  lenganKanan.add(bahuPinKanan);

  const kelatBahuKanan = new THREE.Mesh(
    new THREE.TorusGeometry(0.036, 0.011, 6, 14),
    pradaMurniMat,
  );
  kelatBahuKanan.rotation.x = Math.PI / 2;
  kelatBahuKanan.position.set(0, -0.09, 0);
  lenganKanan.add(kelatBahuKanan);

  const lenganAtasGeo = new THREE.CapsuleGeometry(0.032, 0.34, 6, 10);
  lenganAtasGeo.scale(1, 1, 0.42);
  const lenganAtasKanan = new THREE.Mesh(lenganAtasGeo, kulitPradaMat);
  lenganAtasKanan.position.set(0, -0.18, 0);
  lenganKanan.add(lenganAtasKanan);

  const sikuKanan = new THREE.Group();
  sikuKanan.position.set(0, -0.36, 0);
  sikuKanan.rotation.z = 0.56;
  lenganKanan.add(sikuKanan);

  sikuKanan.add(bahuPinKanan.clone());

  const lenganBawahGeo = new THREE.CapsuleGeometry(0.026, 0.34, 6, 10);
  lenganBawahGeo.scale(1, 1, 0.42);
  const lenganBawahKanan = new THREE.Mesh(lenganBawahGeo, kulitPradaMat);
  lenganBawahKanan.position.set(0, -0.18, 0);
  sikuKanan.add(lenganBawahKanan);

  const gelangKanan = new THREE.Mesh(
    new THREE.TorusGeometry(0.028, 0.009, 6, 12),
    pradaMurniMat,
  );
  gelangKanan.rotation.x = Math.PI / 2;
  gelangKanan.position.set(0, -0.31, 0);
  sikuKanan.add(gelangKanan);

  // Busur Pusaka Gandewa Berukir + Tali Tarik & Panah Guwawijaya Siap Bidik
  const busur = new THREE.Group();
  busur.position.set(-0.04, -0.36, 0.01);
  sikuKanan.add(busur);

  const gandewaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0.58, 0),
    new THREE.Vector3(-0.06, 0.42, 0),
    new THREE.Vector3(-0.24, 0.16, 0),
    new THREE.Vector3(-0.28, 0, 0),
    new THREE.Vector3(-0.24, -0.16, 0),
    new THREE.Vector3(-0.06, -0.42, 0),
    new THREE.Vector3(0.12, -0.58, 0),
  ]);
  const busurArc = new THREE.Mesh(
    new THREE.TubeGeometry(gandewaCurve, 22, 0.021, 8, false),
    pradaMurniMat,
  );
  busur.add(busurArc);

  for (const ujungY of [0.58, -0.58]) {
    const pucuk = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.075, 6),
      gegelKuninganMat,
    );
    pucuk.position.set(0.12, ujungY, 0);
    pucuk.rotation.z = ujungY > 0 ? -0.45 : Math.PI + 0.45;
    busur.add(pucuk);
  }

  const taliSegGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 1, 6);
  const taliAtas = new THREE.Mesh(taliSegGeo, gegelKuninganMat);
  taliAtas.name = 'busur-tali-atas';
  taliAtas.position.set(0.12, 0.29, 0);
  taliAtas.scale.set(1, 0.58, 1);
  busur.add(taliAtas);

  const taliBawah = new THREE.Mesh(taliSegGeo, gegelKuninganMat);
  taliBawah.name = 'busur-tali-bawah';
  taliBawah.position.set(0.12, -0.29, 0);
  taliBawah.scale.set(1, 0.58, 1);
  busur.add(taliBawah);

  const panahNockGroup = new THREE.Group();
  panahNockGroup.name = 'busur-panah';
  panahNockGroup.position.set(0, 0, 0);
  busur.add(panahNockGroup);

  const batangPanah = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.72, 8),
    pradaMurniMat,
  );
  batangPanah.rotation.z = Math.PI / 2;
  batangPanah.position.set(-0.15, 0, 0);
  panahNockGroup.add(batangPanah);

  const mataPanahMat = new THREE.MeshStandardMaterial({
    color: 0xffe488,
    emissive: 0xff7b1c,
    emissiveIntensity: 0.45,
    metalness: 0.88,
    roughness: 0.22,
  });
  const mataPanah = new THREE.Mesh(
    new THREE.ConeGeometry(0.036, 0.13, 8),
    mataPanahMat,
  );
  mataPanah.name = 'busur-mata-panah';
  mataPanah.rotation.z = Math.PI / 2;
  mataPanah.position.set(-0.52, 0, 0);
  panahNockGroup.add(mataPanah);

  const buluPanahBusur = new THREE.Mesh(
    new THREE.ConeGeometry(0.024, 0.09, 6),
    new THREE.MeshStandardMaterial({ color: 0xc9351e, roughness: 0.45 }),
  );
  buluPanahBusur.rotation.z = -Math.PI / 2;
  buluPanahBusur.position.set(0.18, 0, 0);
  panahNockGroup.add(buluPanahBusur);

  const penjepitTudingKanan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.04, 8),
    gegelKuninganMat,
  );
  penjepitTudingKanan.position.set(-0.01, -0.35, -0.01);
  sikuKanan.add(penjepitTudingKanan);

  const tudingKanan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.013, 1.08, 6),
    tandukGapitMat,
  );
  tudingKanan.position.set(-0.04, -0.88, -0.01);
  tudingKanan.rotation.z = 0.08;
  sikuKanan.add(tudingKanan);

  // 9. Lengan Kiri Berartikulasi (Tangan Belakang / Solah Sembah)
  const lenganKiri = new THREE.Group();
  lenganKiri.position.set(0.27, 0.56, -0.024);
  lenganKiri.rotation.z = 0.4;
  badan.add(lenganKiri);
  lenganKiri.add(bahuPinKanan.clone());
  lenganKiri.add(kelatBahuKanan.clone());

  const lenganAtasKiri = new THREE.Mesh(lenganAtasGeo.clone(), kulitPradaMat);
  lenganAtasKiri.position.set(0, -0.18, 0);
  lenganKiri.add(lenganAtasKiri);

  const sikuKiri = new THREE.Group();
  sikuKiri.position.set(0, -0.36, 0);
  sikuKiri.rotation.z = -0.88;
  lenganKiri.add(sikuKiri);
  sikuKiri.add(bahuPinKanan.clone());

  const lenganBawahKiri = new THREE.Mesh(lenganBawahGeo.clone(), kulitPradaMat);
  lenganBawahKiri.position.set(0, -0.18, 0);
  sikuKiri.add(lenganBawahKiri);
  sikuKiri.add(gelangKanan.clone());

  const jemariKiri = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.11, 6),
    kulitPradaMat,
  );
  jemariKiri.scale.z = 0.4;
  jemariKiri.position.set(0.01, -0.38, 0);
  jemariKiri.rotation.z = Math.PI + 0.25;
  sikuKiri.add(jemariKiri);

  const penjepitTudingKiri = penjepitTudingKanan.clone();
  penjepitTudingKiri.position.set(0, -0.35, -0.01);
  sikuKiri.add(penjepitTudingKiri);

  const tudingKiri = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.013, 1.04, 6),
    tandukGapitMat,
  );
  tudingKiri.position.set(0, -0.84, -0.01);
  tudingKiri.rotation.z = -0.22;
  sikuKiri.add(tudingKiri);

  // 10. Cempurit / Gapit Utama Tanduk Kerbau Bule
  const gapitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.62, 0.028),
    new THREE.Vector3(0, -0.88, 0.028),
    new THREE.Vector3(0.02, 0.0, 0.028),
    new THREE.Vector3(-0.02, 0.68, 0.028),
    new THREE.Vector3(0.06, 1.38, 0.028),
  ]);
  const gapitUtama = new THREE.Mesh(
    new THREE.TubeGeometry(gapitCurve, 18, 0.018, 6, false),
    tandukGapitMat,
  );
  badan.add(gapitUtama);

  return {
    root,
    badan,
    lenganKanan,
    sikuKanan,
    lenganKiri,
    sikuKiri,
    busur,
  };
}

/**
 * Membangun Wayang Kulit Kijang Kencana (Penyamaran Marica di Hutan Dandaka)
 */
export function buildKidangKencana3D(): KidangKencanaRig {
  const root = new THREE.Group();
  const badan = new THREE.Group();
  root.add(badan);

  const kidangTex = getTeksturKidangKencana();
  const tatahan = getTeksturPradaTatahan();

  const emasKidangMat = new THREE.MeshStandardMaterial({
    color: 0xf4bd46,
    map: kidangTex.diffuse,
    bumpMap: kidangTex.bump,
    bumpScale: 0.02,
    roughness: 0.3,
    metalness: 0.68,
  });

  const tandukEmasMat = new THREE.MeshStandardMaterial({
    color: 0xffdf78,
    bumpMap: tatahan.bump,
    bumpScale: 0.01,
    roughness: 0.2,
    metalness: 0.88,
  });

  const teracakGelapMat = new THREE.MeshStandardMaterial({
    color: 0x24150c,
    roughness: 0.35,
    metalness: 0.4,
  });

  const gapitMat = new THREE.MeshStandardMaterial({
    color: 0x2a1d13,
    roughness: 0.28,
    metalness: 0.14,
  });

  const bodyGeo = ambilAtauBuatExtrudeGeo('kidang-body', () => {
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.44, -0.02);
    bodyShape.bezierCurveTo(-0.42, 0.16, -0.18, 0.22, 0.08, 0.18);
    bodyShape.bezierCurveTo(0.24, 0.16, 0.38, 0.22, 0.46, 0.12);
    bodyShape.bezierCurveTo(0.56, 0.24, 0.58, 0.14, 0.48, 0.04);
    bodyShape.bezierCurveTo(0.44, -0.12, 0.24, -0.16, 0.05, -0.13);
    bodyShape.bezierCurveTo(-0.18, -0.1, -0.36, -0.14, -0.44, -0.02);

    for (const [hx, hy, hr] of [
      [-0.18, 0.03, 0.032],
      [0.02, 0.03, 0.038],
      [0.22, 0.03, 0.032],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      bodyShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
      curveSegments: 12,
    });
    g.center();
    normalisasiUvExtrude(g);
    return g;
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, emasKidangMat);
  bodyMesh.position.set(0, 0.2, 0);
  bodyMesh.castShadow = true;
  badan.add(bodyMesh);

  // Ragam hias ceplok prada emas di lambung & punggung Kidang Kencana
  for (const [sx, sy, sr] of [
    [-0.14, 0.27, 0.022],
    [0.02, 0.28, 0.026],
    [0.18, 0.26, 0.022],
    [0.08, 0.16, 0.018],
  ]) {
    const ceplok = new THREE.Mesh(
      new THREE.CylinderGeometry(sr, sr, 0.036, 8),
      tandukEmasMat,
    );
    ceplok.rotation.x = Math.PI / 2;
    ceplok.position.set(sx, sy, 0);
    badan.add(ceplok);
  }

  // Ekor Kidang Kencana berartikulasi yang melenggang saat melompat
  const ekorGrup = new THREE.Group();
  ekorGrup.name = 'kidang-ekor';
  ekorGrup.position.set(0.42, 0.28, 0);
  const ekorBatang = new THREE.Mesh(
    new THREE.ConeGeometry(0.038, 0.17, 6),
    emasKidangMat,
  );
  ekorBatang.scale.z = 0.36;
  ekorBatang.position.set(0.04, 0.07, 0);
  ekorBatang.rotation.z = -0.58;
  const ekorUjung = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 8, 6),
    tandukEmasMat,
  );
  ekorUjung.scale.set(1.2, 0.85, 0.45);
  ekorUjung.position.set(0.09, 0.13, 0);
  ekorGrup.add(ekorBatang, ekorUjung);
  badan.add(ekorGrup);

  const leherKepala = new THREE.Group();
  leherKepala.position.set(-0.34, 0.28, 0.006);
  badan.add(leherKepala);

  const headGeo = ambilAtauBuatExtrudeGeo('kidang-head', () => {
    const headShape = new THREE.Shape();
    headShape.moveTo(0.06, -0.08);
    headShape.bezierCurveTo(0.02, 0.12, -0.04, 0.3, -0.08, 0.44);
    headShape.lineTo(-0.32, 0.38);
    headShape.bezierCurveTo(-0.33, 0.32, -0.22, 0.28, -0.14, 0.28);
    headShape.bezierCurveTo(-0.16, 0.12, -0.1, -0.04, 0.06, -0.08);

    const leherHole = new THREE.Path();
    leherHole.absarc(-0.05, 0.14, 0.022, 0, Math.PI * 2, false);
    headShape.holes.push(leherHole);

    const g = new THREE.ExtrudeGeometry(headShape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSize: 0.005,
      bevelThickness: 0.005,
      bevelSegments: 1,
      curveSegments: 10,
    });
    normalisasiUvExtrude(g);
    return g;
  });
  const headMesh = new THREE.Mesh(headGeo, emasKidangMat);
  headMesh.position.z = -0.012;
  leherKepala.add(headMesh);

  const kalungGenta = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.014, 6, 12),
    tandukEmasMat,
  );
  kalungGenta.rotation.set(Math.PI * 0.4, 0.3, 0);
  kalungGenta.position.set(-0.04, 0.08, 0);
  leherKepala.add(kalungGenta);

  // Bandul genta kuningan di leher kijang (simetris dua sisi)
  const gentaBandul = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 8, 8),
    tandukEmasMat,
  );
  gentaBandul.position.set(-0.11, 0.03, 0);
  leherKepala.add(gentaBandul);

  const telingaGrup = new THREE.Group();
  telingaGrup.name = 'kidang-telinga';
  telingaGrup.position.set(0.01, 0.43, 0);
  const telingaMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.036, 0.17, 6),
    emasKidangMat,
  );
  telingaMesh.rotation.z = -0.82;
  telingaMesh.scale.z = 0.35;
  telingaMesh.position.set(0.04, 0.02, 0.01);
  const telingaBelakang = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.15, 6),
    tandukEmasMat,
  );
  telingaBelakang.rotation.z = -0.62;
  telingaBelakang.scale.z = 0.32;
  telingaBelakang.position.set(0.01, 0.04, -0.014);
  telingaGrup.add(telingaMesh, telingaBelakang);
  leherKepala.add(telingaGrup);

  const jamangDahi = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.024, 0),
    tandukEmasMat,
  );
  jamangDahi.scale.set(0.9, 1.3, 0.78);
  jamangDahi.position.set(-0.09, 0.43, 0);
  leherKepala.add(jamangDahi);

  const mataKidangDepan = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 8, 8),
    tandukEmasMat,
  );
  mataKidangDepan.position.set(-0.14, 0.36, 0.016);
  const mataKidangBelakang = mataKidangDepan.clone();
  mataKidangBelakang.position.z = -0.016;
  leherKepala.add(mataKidangDepan, mataKidangBelakang);

  const batangTandukCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06, 0.43, 0),
    new THREE.Vector3(-0.02, 0.62, 0),
    new THREE.Vector3(0.08, 0.8, 0),
    new THREE.Vector3(0.02, 0.94, 0),
  ]);
  const tandukUtama = new THREE.Mesh(
    new THREE.TubeGeometry(batangTandukCurve, 14, 0.014, 6, false),
    tandukEmasMat,
  );
  leherKepala.add(tandukUtama);

  for (const [cx, cy, rotZ, len] of [
    [-0.08, 0.6, 0.68, 0.16],
    [0.11, 0.68, -0.58, 0.17],
    [-0.04, 0.78, 0.52, 0.15],
  ]) {
    const cabang = new THREE.Mesh(
      new THREE.ConeGeometry(0.013, len, 6),
      tandukEmasMat,
    );
    cabang.position.set(cx, cy, 0);
    cabang.rotation.z = rotZ;
    leherKepala.add(cabang);
  }

  const buatPasangKakiKijang = (arahDepan: boolean): THREE.Group => {
    const grup = new THREE.Group();
    const engselPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.048, 8),
      tandukEmasMat,
    );
    engselPin.rotation.x = Math.PI / 2;
    grup.add(engselPin);

    for (const [zOff, rotOffset] of [
      [0.016, arahDepan ? -0.25 : 0.22],
      [-0.016, arahDepan ? 0.12 : -0.15],
    ]) {
      const tungkai = new THREE.Group();
      tungkai.rotation.z = rotOffset;

      const paha = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.026, 0.2, 4, 8),
        emasKidangMat,
      );
      paha.scale.z = 0.42;
      paha.position.set(0, -0.11, zOff);

      const betis = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.018, 0.22, 4, 8),
        emasKidangMat,
      );
      betis.scale.z = 0.42;
      betis.position.set(arahDepan ? -0.04 : 0.04, -0.29, zOff);
      betis.rotation.z = arahDepan ? -0.22 : 0.22;

      const binggelKijang = new THREE.Mesh(
        new THREE.TorusGeometry(0.021, 0.007, 6, 10),
        tandukEmasMat,
      );
      binggelKijang.rotation.x = Math.PI / 2;
      binggelKijang.position.set(arahDepan ? -0.065 : 0.025, -0.38, zOff);

      const teracak = new THREE.Mesh(
        new THREE.ConeGeometry(0.026, 0.065, 6),
        teracakGelapMat,
      );
      teracak.rotation.z = arahDepan ? Math.PI * 0.42 : Math.PI * 0.55;
      teracak.position.set(arahDepan ? -0.08 : 0.02, -0.41, zOff);

      tungkai.add(paha, betis, binggelKijang, teracak);
      grup.add(tungkai);
    }
    return grup;
  };

  const kakiDepan = buatPasangKakiKijang(true);
  kakiDepan.position.set(-0.3, 0.1, 0);
  badan.add(kakiDepan);

  const kakiBelakang = buatPasangKakiKijang(false);
  kakiBelakang.position.set(0.32, 0.1, 0);
  badan.add(kakiBelakang);

  const gapit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 1.55, 6),
    gapitMat,
  );
  gapit.position.set(-0.02, -0.35, 0);
  badan.add(gapit);

  return {
    root,
    badan,
    leherKepala,
    kakiDepan,
    kakiBelakang,
  };
}

/**
 * Membangun Gunungan (Kayon Blumbangan Surakarta) 3D Berlapis Relief
 */
export function buildGunungan3D(): THREE.Group {
  const grup = new THREE.Group();
  const gununganTex = getTeksturGununganDetail();
  const tatahan = getTeksturPradaTatahan();

  const kayonGeo = ambilAtauBuatExtrudeGeo('gunungan-kayon', () => {
    const kayonShape = new THREE.Shape();
    kayonShape.moveTo(-0.34, -0.86);
    kayonShape.bezierCurveTo(-0.62, -0.42, -0.66, 0.12, -0.42, 0.56);
    kayonShape.bezierCurveTo(-0.24, 0.88, -0.08, 1.12, 0, 1.32);
    kayonShape.bezierCurveTo(0.08, 1.12, 0.24, 0.88, 0.42, 0.56);
    kayonShape.bezierCurveTo(0.66, 0.12, 0.62, -0.42, 0.34, -0.86);
    kayonShape.closePath();

    for (const [hx, hy, hr] of [
      [0, 0.92, 0.042],
      [-0.14, 0.68, 0.048],
      [0.14, 0.68, 0.048],
      [-0.26, 0.42, 0.052],
      [0.26, 0.42, 0.052],
      [-0.34, 0.12, 0.055],
      [0.34, 0.12, 0.055],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      kayonShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(kayonShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSize: 0.007,
      bevelThickness: 0.007,
      bevelSegments: 1,
      curveSegments: 14,
    });
    normalisasiUvExtrude(g, 0.01);
    return g;
  });

  const kayonMat = new THREE.MeshStandardMaterial({
    color: 0xe6a845,
    map: gununganTex.diffuse,
    bumpMap: gununganTex.bump,
    bumpScale: 0.025,
    roughness: 0.38,
    metalness: 0.48,
  });

  const badanMesh = new THREE.Mesh(kayonGeo, kayonMat);
  badanMesh.position.z = -0.014;
  badanMesh.castShadow = true;
  grup.add(badanMesh);

  const emasReliefMat = new THREE.MeshStandardMaterial({
    color: 0xf5cb62,
    bumpMap: tatahan.bump,
    bumpScale: 0.014,
    roughness: 0.25,
    metalness: 0.82,
  });

  const banaspatiRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.022, 8, 18),
    emasReliefMat,
  );
  banaspatiRing.position.set(0, -0.05, 0);
  grup.add(banaspatiRing);

  // Sepasang mata Banaspati & Gapura Keraton bertingkat di pangkal Gunungan
  for (const gx of [-0.045, 0.045]) {
    const mataBanaspati = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      emasReliefMat,
    );
    mataBanaspati.position.set(gx, -0.02, 0.02);
    grup.add(mataBanaspati);
  }

  for (const [gw, gh, gy] of [
    [0.52, 0.09, -0.78],
    [0.4, 0.08, -0.68],
    [0.28, 0.14, -0.54],
  ]) {
    const undakGapura = new THREE.Mesh(
      new THREE.BoxGeometry(gw, gh, 0.042),
      emasReliefMat,
    );
    undakGapura.position.set(0, gy, 0.008);
    grup.add(undakGapura);
  }

  // Sepasang penjaga gerbang & dahan Pohon Hayat Kalpataru kiri-kanan
  for (const dir of [-1, 1]) {
    const candiPilar = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.28, 6),
      emasReliefMat,
    );
    candiPilar.scale.z = 0.45;
    candiPilar.position.set(dir * 0.26, -0.45, 0.014);
    candiPilar.rotation.z = dir * -0.08;
    grup.add(candiPilar);

    for (const [dy, dRot, dLen] of [
      [0.34, 0.72, 0.36],
      [0.62, 0.62, 0.28],
      [0.86, 0.48, 0.2],
    ]) {
      const dahan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.015, dLen, 6),
        emasReliefMat,
      );
      dahan.position.set(dir * (dLen * 0.38), dy, 0.016);
      dahan.rotation.z = dir * -dRot;
      grup.add(dahan);
    }
  }

  const batangPohon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.032, 1.18, 8),
    emasReliefMat,
  );
  batangPohon.position.set(0, 0.56, 0.016);
  grup.add(batangPohon);

  const kemuncakKayon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.042, 0),
    emasReliefMat,
  );
  kemuncakKayon.scale.set(0.75, 1.45, 0.45);
  kemuncakKayon.position.set(0, 1.33, 0);
  grup.add(kemuncakKayon);

  const gapit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.024, 2.75, 8),
    new THREE.MeshStandardMaterial({ color: 0x261910, roughness: 0.28 }),
  );
  gapit.position.set(0, -0.1, 0);
  grup.add(gapit);

  return grup;
}

/**
 * Membangun Wayang Simpingan Kanan-Kiri dengan geometri ter-cache di level modul.
 */
export function buildSimpinganWayang3D(warnaKain: number, tinggiSkala = 1): THREE.Group {
  const grup = new THREE.Group();
  const tex = getTeksturPradaTatahan();
  const dodotTex = getTeksturKainDodot();

  const kulitSimpinganMat = new THREE.MeshStandardMaterial({
    color: 0xdca43e,
    map: tex.diffuse,
    bumpMap: tex.bump,
    bumpScale: 0.018,
    roughness: 0.38,
    metalness: 0.52,
  });

  const dodotSimpinganMat = new THREE.MeshStandardMaterial({
    color: warnaKain,
    map: dodotTex.diffuse,
    bumpMap: dodotTex.bump,
    bumpScale: 0.016,
    roughness: 0.45,
    metalness: 0.28,
  });

  const figGeo = ambilAtauBuatExtrudeGeo('simpingan-fig', () => {
    const figShape = new THREE.Shape();
    figShape.moveTo(-0.14, -0.82);
    figShape.lineTo(-0.12, -0.1);
    figShape.bezierCurveTo(-0.24, 0.16, -0.32, 0.42, -0.28, 0.58);
    figShape.bezierCurveTo(-0.22, 0.64, -0.14, 0.68, -0.18, 0.78);
    figShape.bezierCurveTo(-0.14, 0.92, -0.02, 1.06, 0.06, 1.18);
    figShape.bezierCurveTo(0.16, 1.08, 0.2, 0.9, 0.12, 0.72);
    figShape.bezierCurveTo(0.24, 0.68, 0.3, 0.56, 0.26, 0.38);
    figShape.bezierCurveTo(0.22, 0.16, 0.16, -0.05, 0.14, -0.82);
    figShape.closePath();

    for (const [hx, hy, hr] of [
      [0, 0.42, 0.028],
      [0.04, 0.88, 0.025],
    ]) {
      const hole = new THREE.Path();
      hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
      figShape.holes.push(hole);
    }

    const g = new THREE.ExtrudeGeometry(figShape, {
      depth: 0.02,
      bevelEnabled: false,
      curveSegments: 8,
    });
    normalisasiUvExtrude(g);
    return g;
  });

  const figMesh = new THREE.Mesh(figGeo, kulitSimpinganMat);
  figMesh.position.z = -0.01;
  grup.add(figMesh);

  const kampuhGeo = ambilAtauBuatExtrudeGeo('simpingan-kampuh', () => {
    const kampuhShape = new THREE.Shape();
    kampuhShape.moveTo(-0.15, 0.02);
    kampuhShape.bezierCurveTo(-0.24, -0.18, -0.26, -0.44, -0.18, -0.64);
    kampuhShape.bezierCurveTo(-0.04, -0.7, 0.12, -0.72, 0.22, -0.58);
    kampuhShape.bezierCurveTo(0.3, -0.38, 0.26, -0.12, 0.16, 0.02);
    kampuhShape.closePath();

    const g = new THREE.ExtrudeGeometry(kampuhShape, {
      depth: 0.026,
      bevelEnabled: false,
      curveSegments: 8,
    });
    normalisasiUvExtrude(g);
    return g;
  });

  const kampuhMesh = new THREE.Mesh(kampuhGeo, dodotSimpinganMat);
  kampuhMesh.position.z = -0.013;
  grup.add(kampuhMesh);

  const kalungSimpingan = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.012, 6, 12),
    kulitSimpinganMat,
  );
  kalungSimpingan.rotation.set(Math.PI * 0.42, 0, 0);
  kalungSimpingan.position.set(0, 0.56, 0.012);
  grup.add(kalungSimpingan);

  const gapitMat = new THREE.MeshStandardMaterial({ color: 0x241810, roughness: 0.4 });
  const gapit = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.017, 2.2, 6), gapitMat);
  gapit.position.y = -0.05;
  grup.add(gapit);

  grup.scale.setScalar(tinggiSkala);
  return grup;
}
