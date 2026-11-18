import * as THREE from 'three';
import { KRONIK_SEJARAH_BUDAYA, type BendaPusaka } from '../content/pusaka.ts';
import {
  applyStudioHDR,
  attachCadWireframeLayer,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  isMobileGpuProfile,
  jalankanLoopSetelahSiap,
  pasangObservasiPanggung,
  pinProyeksiBerubah,
  scheduleIdleWork,
  tandaiTeksturCacheBersama,
} from './threeHelpers.ts';

export type IdArtefak = BendaPusaka['id'];

export interface ProyeksiPinDiorama {
  bendaId: IdArtefak;
  x: number;
  y: number;
  terlihat: boolean;
}

interface DataBangunanDiorama {
  id: IdArtefak;
  grup: THREE.Group;
  titikPinWorld: THREE.Vector3;
  emissiveMeshes: THREE.MeshStandardMaterial[];
  auraRing: THREE.Mesh;
}

let cacheGentengTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cacheKayuJatiTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cacheLantaiTerasTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cacheRumputTamanTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cacheBataMerahTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
let cacheDaunBeringinTex: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null = null;
const cacheBatikTex = new Map<string, THREE.CanvasTexture>();

function buatTeksturGentengTerakota(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheGentengTex) return cacheGentengTex;

  const size = 256;
  const cMap = document.createElement('canvas');
  cMap.width = size;
  cMap.height = size;
  const ctx = cMap.getContext('2d');

  const cBump = document.createElement('canvas');
  cBump.width = size;
  cBump.height = size;
  const bCtx = cBump.getContext('2d');
  if (!ctx || !bCtx) return null;

  ctx.fillStyle = '#7e2f19';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#787878';
  bCtx.fillRect(0, 0, size, size);

  const rows = 12;
  const cols = 10;
  const rowH = size / rows;
  const colW = size / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = (r % 2) * (colW * 0.5);

    const rowGrad = ctx.createLinearGradient(0, y, 0, y + rowH);
    rowGrad.addColorStop(0, '#a34427');
    rowGrad.addColorStop(0.6, '#8c351c');
    rowGrad.addColorStop(1, '#4a170a');
    ctx.fillStyle = rowGrad;
    ctx.fillRect(0, y, size, rowH);

    const bGrad = bCtx.createLinearGradient(0, y, 0, y + rowH);
    bGrad.addColorStop(0, '#dcdcdc');
    bGrad.addColorStop(0.75, '#848484');
    bGrad.addColorStop(1, '#242424');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, y, size, rowH);

    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      ctx.fillStyle = 'rgba(35, 10, 4, 0.4)';
      ctx.fillRect(x, y, 2, rowH);
      bCtx.fillStyle = '#2a2a2a';
      bCtx.fillRect(x, y, 2, rowH);
    }
  }

  const map = new THREE.CanvasTexture(cMap);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 3);

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);

  cacheGentengTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheGentengTex;
}

function buatTeksturKayuJati(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheKayuJatiTex) return cacheKayuJatiTex;

  const size = 128;
  const cMap = document.createElement('canvas');
  cMap.width = size;
  cMap.height = size;
  const ctx = cMap.getContext('2d');

  const cBump = document.createElement('canvas');
  cBump.width = size;
  cBump.height = size;
  const bCtx = cBump.getContext('2d');
  if (!ctx || !bCtx) return null;

  ctx.fillStyle = '#5c361e';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * size;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(36, 18, 8, 0.3)' : 'rgba(138, 88, 48, 0.22)';
    ctx.fillRect(0, y, size, 2);
    bCtx.fillStyle = i % 2 === 0 ? '#686868' : '#969696';
    bCtx.fillRect(0, y, size, 2);
  }

  const map = new THREE.CanvasTexture(cMap);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  cacheKayuJatiTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheKayuJatiTex;
}

function buatTeksturLantaiTeras(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheLantaiTerasTex) return cacheLantaiTerasTex;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return null;

  ctx.fillStyle = '#524c46';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, size, size);

  const grid = 8;
  const step = size / grid;
  for (let gx = 0; gx < grid; gx++) {
    for (let gy = 0; gy < grid; gy++) {
      const x = gx * step;
      const y = gy * step;
      ctx.fillStyle = (gx + gy) % 2 === 0 ? '#5c554e' : '#4c4640';
      ctx.fillRect(x + 2, y + 2, step - 4, step - 4);

      ctx.strokeStyle = 'rgba(24, 20, 16, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, step - 2, step - 2);

      bCtx.strokeStyle = '#383838';
      bCtx.lineWidth = 2;
      bCtx.strokeRect(x + 1, y + 1, step - 2, step - 2);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 3);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);

  cacheLantaiTerasTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheLantaiTerasTex;
}

function buatTeksturRumputTaman(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheRumputTamanTex) return cacheRumputTamanTex;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return null;

  const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 20, size * 0.5, size * 0.5, size * 0.7);
  grad.addColorStop(0, '#2b4f2d');
  grad.addColorStop(0.65, '#224024');
  grad.addColorStop(1, '#18301a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#787878';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 320; i++) {
    const px = (i * 43) % size;
    const py = (i * 29 + Math.floor(i / 8) * 11) % size;
    const terang = i % 3 === 0;
    ctx.fillStyle = terang ? 'rgba(92, 148, 76, 0.24)' : 'rgba(16, 34, 17, 0.28)';
    ctx.fillRect(px, py, 3, 4);
    bCtx.fillStyle = terang ? '#9e9e9e' : '#585858';
    bCtx.fillRect(px, py, 3, 4);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 4);

  cacheRumputTamanTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheRumputTamanTex;
}

function buatTeksturBataMajapahit(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheBataMerahTex) return cacheBataMerahTex;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return null;

  ctx.fillStyle = '#8f3922';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#969696';
  bCtx.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 4;
  const rh = size / rows;
  const cw = size / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rh;
    const off = (r % 2) * (cw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + off;
      ctx.fillStyle = (r + c) % 2 === 0 ? '#9c4028' : '#82311b';
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 2);
      bCtx.strokeStyle = '#282828';
      bCtx.lineWidth = 2;
      bCtx.strokeRect(x + 1, y + 1, cw - 2, rh - 2);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);

  cacheBataMerahTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheBataMerahTex;
}

function buatTeksturDaunBeringin(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } | null {
  if (typeof document === 'undefined') return null;
  if (cacheDaunBeringinTex) return cacheDaunBeringinTex;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (!ctx || !bCtx) return null;

  ctx.fillStyle = '#244d29';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#707070';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 120; i++) {
    const lx = (i * 37) % size;
    const ly = (i * 23 + Math.floor(i / 6) * 11) % size;
    const r = 5 + (i % 4) * 2;
    ctx.fillStyle = i % 3 === 0 ? '#3b733f' : i % 2 === 0 ? '#2c5c31' : '#1b3d20';
    ctx.beginPath();
    ctx.arc(lx, ly, r, 0, Math.PI * 2);
    ctx.fill();

    bCtx.fillStyle = i % 2 === 0 ? '#bcbcbc' : '#4e4e4e';
    bCtx.beginPath();
    ctx.arc(lx, ly, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);

  cacheDaunBeringinTex = {
    map: tandaiTeksturCacheBersama(map),
    bump: tandaiTeksturCacheBersama(bump),
  };
  return cacheDaunBeringinTex;
}

function buatTeksturKainBatik(pola: 'kawung' | 'parang'): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const cached = cacheBatikTex.get(pola);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (pola === 'kawung') {
    ctx.fillStyle = '#f3e5cc';
    ctx.fillRect(0, 0, size, size);
    const step = 64;
    for (let x = 0; x < size; x += step) {
      for (let y = 0; y < size; y += step) {
        const cx = x + step / 2;
        const cy = y + step / 2;
        ctx.fillStyle = '#6b3b1e';
        ctx.strokeStyle = '#d49b38';
        ctx.lineWidth = 2;
        for (const [ox, oy, ang] of [
          [-12, -12, Math.PI / 4],
          [12, -12, -Math.PI / 4],
          [-12, 12, -Math.PI / 4],
          [12, 12, Math.PI / 4],
        ]) {
          ctx.beginPath();
          ctx.ellipse(cx + ox, cy + oy, 14, 7, ang, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = '#e09f3e';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = '#ebd7b5';
    ctx.fillRect(0, 0, size, size);
    for (let d = -size; d < size * 2; d += 38) {
      ctx.strokeStyle = '#592e15';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d - size, size);
      ctx.stroke();

      ctx.strokeStyle = '#c88a2e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(d + 10, 0);
      ctx.lineTo(d + 10 - size, size);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tandaiTeksturCacheBersama(tex);
  cacheBatikTex.set(pola, tex);
  return tex;
}

function buatGeometriAtapTrapesium(
  bw: number,
  bd: number,
  tw: number,
  td: number,
  h: number,
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const bx = bw / 2;
  const bz = bd / 2;
  const tx = tw / 2;
  const tz = td / 2;

  const p0 = [-bx, 0, bz];
  const p1 = [bx, 0, bz];
  const p2 = [bx, 0, -bz];
  const p3 = [-bx, 0, -bz];

  const t0 = [-tx, h, tz];
  const t1 = [tx, h, tz];
  const t2 = [tx, h, -tz];
  const t3 = [-tx, h, -tz];

  const pos: number[] = [];
  const uvs: number[] = [];

  const pushQuad = (a: number[], b: number[], c: number[], d: number[]) => {
    pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  };

  pushQuad(p0, p1, t1, t0);
  pushQuad(p1, p2, t2, t1);
  pushQuad(p2, p3, t3, t2);
  pushQuad(p3, p0, t0, t3);
  pushQuad(t0, t1, t2, t3);
  pushQuad(p3, p2, p1, p0);

  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function tambahBubunganDanJuraiAtap(
  parent: THREE.Group,
  bw: number,
  bd: number,
  tw: number,
  td: number,
  h: number,
  yBase: number,
  matBubungan: THREE.Material,
  matLisplang: THREE.Material,
): void {
  const bx = bw / 2;
  const bz = bd / 2;
  const tx = tw / 2;
  const tz = td / 2;

  for (const [pA, pB] of [
    [
      [-bx, yBase, bz],
      [-tx, yBase + h, tz],
    ],
    [
      [bx, yBase, bz],
      [tx, yBase + h, tz],
    ],
    [
      [bx, yBase, -bz],
      [tx, yBase + h, -tz],
    ],
    [
      [-bx, yBase, -bz],
      [-tx, yBase + h, -tz],
    ],
  ]) {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(pA[0], pA[1], pA[2]),
      new THREE.Vector3(pB[0], pB[1], pB[2]),
    );
    const jurai = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 2, 0.036, 6, false),
      matBubungan,
    );
    parent.add(jurai);
  }

  const lisDepan = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.04, 0.055, 0.04), matLisplang);
  lisDepan.position.set(0, yBase - 0.01, bz);
  const lisBelakang = lisDepan.clone();
  lisBelakang.position.z = -bz;

  const lisKanan = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.055, bd + 0.04), matLisplang);
  lisKanan.position.set(bx, yBase - 0.01, 0);
  const lisKiri = lisKanan.clone();
  lisKiri.position.x = -bx;

  parent.add(lisDepan, lisBelakang, lisKanan, lisKiri);
}

export class LivingPendopoStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;

  private pulauRoot = new THREE.Group();
  private bangunanMap = new Map<IdArtefak, DataBangunanDiorama>();
  private pickableMeshes: THREE.Mesh[] = [];
  private cadLineMat: THREE.LineBasicMaterial | null = null;
  private cadWireframeTerpasang = false;
  private cancelIdleCad: (() => void) | null = null;

  private kerisHoloMesh: THREE.Group | null = null;
  private gongAgengMesh: THREE.Group | null = null;
  private saronBilahMeshes: THREE.Mesh[] = [];
  private jogloRoofExplodeGroup: THREE.Group | null = null;
  private wayangRamaMini: THREE.Mesh | null = null;
  private wayangKidangMini: THREE.Mesh | null = null;
  private wayangKayonMini: THREE.Mesh | null = null;
  private ububanKiri: THREE.Mesh | null = null;
  private ububanKanan: THREE.Mesh | null = null;
  private batikClothMeshes: { mesh: THREE.Mesh; basePos: Float32Array; phase: number }[] = [];
  private lampApiKelir: THREE.PointLight | null = null;
  private lampPrapen: THREE.PointLight | null = null;
  private particlePoints: THREE.Points | null = null;

  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private lampBoost = 1;

  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private pointerNormX = 0;
  private pointerNormY = 0;

  private heroCamPos = new THREE.Vector3(10.2, 7.6, 13.8);
  private heroLookAt = new THREE.Vector3(-2.95, 0.72, -0.05);
  private curCamPos = new THREE.Vector3(10.2, 7.6, 13.8);
  private curLookAt = new THREE.Vector3(-2.95, 0.72, -0.05);
  private targetCamPos = new THREE.Vector3(10.2, 7.6, 13.8);
  private targetLookAt = new THREE.Vector3(-2.95, 0.72, -0.05);
  private goalPosScratch = new THREE.Vector3();
  private pinProjScratch = new THREE.Vector3();
  private prevPins: ProyeksiPinDiorama[] = [];
  private lastBatikWaveMs = 0;
  private lastFrameMs = 0;

  private hoveredId: IdArtefak | null = null;
  private selectedId: IdArtefak | null = null;
  private currentWireframe = 0;
  private targetWireframe = 0;
  private rafId: number | null = null;
  private loopAktif = true;
  private loopSiapMulai = false;
  private stopObservasi: (() => void) | null = null;
  private abortCtrl = new AbortController();
  private cancelMulaiLoop: (() => void) | null = null;

  private onHoverCb?: (id: IdArtefak | null) => void;
  private onKlikCb?: (id: IdArtefak) => void;
  private onPinCb?: (pins: ProyeksiPinDiorama[]) => void;

  constructor(
    container: HTMLElement,
    initialThemeOrCallbacks?:
      | 'malam'
      | 'terang'
      | {
          onHover?: (id: IdArtefak | null) => void;
          onKlik?: (id: IdArtefak) => void;
          onPinUpdate?: (pins: ProyeksiPinDiorama[]) => void;
        },
  ) {
    this.container = container;
    const initialTheme =
      typeof initialThemeOrCallbacks === 'string' ? initialThemeOrCallbacks : 'terang';
    if (typeof initialThemeOrCallbacks === 'object' && initialThemeOrCallbacks !== null) {
      this.onHoverCb = initialThemeOrCallbacks.onHover;
      this.onKlikCb = initialThemeOrCallbacks.onKlik;
      this.onPinCb = initialThemeOrCallbacks.onPinUpdate;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100);
    this.camera.position.copy(this.curCamPos);

    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true });
    if (!this.renderer) return;

    // Shadow map di-render sekali untuk geometri pulau statis agar hemat GPU setiap frame
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;

    void applyStudioHDR(this.renderer, this.scene, {
      signal: this.abortCtrl.signal,
      delayMs: 140,
    });

    this.bangunPencahayaan();
    this.bangunPulauDiorama();
    this.setTheme(initialTheme);
    this.ubahUkuran();
    this.stopObservasi = pasangObservasiPanggung(container, (aktif) => {
      this.loopAktif = aktif;
      if (aktif && this.loopSiapMulai && this.rafId === null) {
        this.loop();
      } else if (!aktif && this.rafId !== null) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
    this.cancelMulaiLoop = jalankanLoopSetelahSiap(
      this.renderer,
      this.scene,
      this.camera,
      () => !this.abortCtrl.signal.aborted && Boolean(this.renderer),
      () => {
        this.loopSiapMulai = true;
        if (this.renderer) {
          this.renderer.shadowMap.needsUpdate = true;
        }
        if (this.loopAktif && this.rafId === null) {
          this.loop();
        }
        if (!isMobileGpuProfile()) {
          this.cancelIdleCad = scheduleIdleWork(() => {
            if (!this.abortCtrl.signal.aborted && this.renderer) {
              this.pastikanCadWireframeLayer();
            }
          }, 1800);
        }
      },
    );
  }

  private pastikanCadWireframeLayer(): void {
    if (this.cadWireframeTerpasang) return;
    this.cadWireframeTerpasang = true;
    this.cadLineMat = attachCadWireframeLayer(this.pulauRoot, 0xd95628, this.currentWireframe);
  }

  public onProyeksiPin(cb: (pins: ProyeksiPinDiorama[]) => void): void {
    this.onPinCb = cb;
  }

  public sorotBangunan(id: IdArtefak | null): void {
    this.hoveredId = id;
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    this.aturTema(tema);
  }

  private bangunPencahayaan(): void {
    this.hemiLight = new THREE.HemisphereLight(0xfff7ea, 0x3b2e22, 1.48);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff1d8, 2.95);
    this.sunLight.position.set(10.5, 15.0, 9.5);
    this.sunLight.castShadow = true;
    const shadowRes = isMobileGpuProfile() ? 512 : 768;
    this.sunLight.shadow.mapSize.set(shadowRes, shadowRes);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 36;
    const d = 7.8;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xdbe8f8, 1.08);
    this.fillLight.position.set(-9, 6.5, -7);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffb56b, 0.92);
    this.rimLight.position.set(-5, 4.5, 9);
    this.scene.add(this.rimLight);
  }

  public aturTema(tema: 'malam' | 'terang'): void {
    if (!this.hemiLight || !this.sunLight || !this.fillLight || !this.rimLight) return;

    if (tema === 'malam') {
      this.hemiLight.color.setHex(0x88a4d6);
      this.hemiLight.groundColor.setHex(0x1b1510);
      this.hemiLight.intensity = 0.88;
      this.sunLight.color.setHex(0xc8daf8);
      this.sunLight.intensity = 1.48;
      this.fillLight.intensity = 0.72;
      this.rimLight.intensity = 1.28;
      this.lampBoost = 1.65;
    } else {
      this.hemiLight.color.setHex(0xfff7ea);
      this.hemiLight.groundColor.setHex(0x4a3b2c);
      this.hemiLight.intensity = 1.52;
      this.sunLight.color.setHex(0xfff1d6);
      this.sunLight.intensity = 2.95;
      this.fillLight.intensity = 1.12;
      this.rimLight.intensity = 0.88;
      this.lampBoost = 1.0;
    }
  }

  private bangunPulauDiorama(): void {
    this.scene.add(this.pulauRoot);

    const gentengTex = buatTeksturGentengTerakota();
    const kayuTex = buatTeksturKayuJati();
    const lantaiTex = buatTeksturLantaiTeras();
    const rumputTex = buatTeksturRumputTaman();
    const bataTex = buatTeksturBataMajapahit();
    const daunTex = buatTeksturDaunBeringin();

    const batuBasaltMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c22,
      roughness: 0.88,
      metalness: 0.12,
    });
    const batuAndesitMat = new THREE.MeshStandardMaterial({
      color: 0x464a54,
      map: lantaiTex?.map ?? null,
      bumpMap: lantaiTex?.bump ?? null,
      bumpScale: 0.012,
      roughness: 0.76,
      metalness: 0.12,
    });
    const batuCandiMat = new THREE.MeshStandardMaterial({
      color: 0x383b42,
      roughness: 0.74,
      metalness: 0.14,
    });
    const bataMajapahitMat = new THREE.MeshStandardMaterial({
      color: 0xa64225,
      map: bataTex?.map ?? null,
      bumpMap: bataTex?.bump ?? null,
      bumpScale: 0.02,
      roughness: 0.66,
      metalness: 0.08,
    });
    const kayuJatiMat = new THREE.MeshStandardMaterial({
      color: 0x6e4326,
      map: kayuTex?.map ?? null,
      bumpMap: kayuTex?.bump ?? null,
      bumpScale: 0.012,
      roughness: 0.46,
      metalness: 0.14,
    });
    const atapTerakotaMat = new THREE.MeshStandardMaterial({
      color: 0xb54b2c,
      map: gentengTex?.map ?? null,
      bumpMap: gentengTex?.bump ?? null,
      bumpScale: 0.028,
      roughness: 0.52,
      metalness: 0.08,
    });
    const bubunganTerakotaMat = new THREE.MeshStandardMaterial({
      color: 0x6e2714,
      roughness: 0.48,
      metalness: 0.15,
    });
    const perungguEmasMat = new THREE.MeshStandardMaterial({
      color: 0xf4c44e,
      emissive: 0x6e320c,
      emissiveIntensity: 0.22,
      roughness: 0.22,
      metalness: 0.88,
    });
    const rumputMat = new THREE.MeshStandardMaterial({
      color: 0x2f5932,
      map: rumputTex?.map ?? null,
      bumpMap: rumputTex?.bump ?? null,
      bumpScale: 0.018,
      roughness: 0.86,
      metalness: 0.04,
    });

    // 1. Lapisan Geologi Pulau Maket Simetris Keblat Papat Lima Pancer (11.6 x 11.6)
    const lapisBasalt = new THREE.Mesh(new THREE.BoxGeometry(11.3, 0.56, 11.3), batuBasaltMat);
    lapisBasalt.position.y = -0.82;
    this.pulauRoot.add(lapisBasalt);

    const lapisSubsoil = new THREE.Mesh(
      new THREE.BoxGeometry(11.42, 0.46, 11.42),
      new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.86 }),
    );
    lapisSubsoil.position.y = -0.35;
    this.pulauRoot.add(lapisSubsoil);

    const sabukKuningan = new THREE.Mesh(
      new THREE.BoxGeometry(11.52, 0.06, 11.52),
      perungguEmasMat,
    );
    sabukKuningan.position.y = -0.14;
    this.pulauRoot.add(sabukKuningan);

    const rumputTaman = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.24, 11.6), rumputMat);
    rumputTaman.position.y = 0;
    rumputTaman.receiveShadow = true;
    this.pulauRoot.add(rumputTaman);

    // Pilar Sudut & Talud Tepi Maket Pulau (11.6 x 11.6 -> batas +-5.72)
    for (const sx of [-5.72, 5.72]) {
      for (const sz of [-5.72, 5.72]) {
        const pilarSudut = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.28, 0.38), batuCandiMat);
        pilarSudut.position.set(sx, -0.38, sz);
        this.pulauRoot.add(pilarSudut);
      }
    }
    const tepiUtara = new THREE.Mesh(new THREE.BoxGeometry(11.65, 0.14, 0.16), batuCandiMat);
    tepiUtara.position.set(0, 0.15, -5.72);
    const tepiSelatan = tepiUtara.clone();
    tepiSelatan.position.z = 5.72;
    const tepiBarat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 11.65), batuCandiMat);
    tepiBarat.position.set(-5.72, 0.15, 0);
    const tepiTimur = tepiBarat.clone();
    tepiTimur.position.x = 5.72;
    this.pulauRoot.add(tepiUtara, tepiSelatan, tepiBarat, tepiTimur);

    // 2. Pelataran Batu Andesit Tengah + Jalan Setapak Salib Kosmologi + Jalur Penghubung Paviliun
    const pelataranTengah = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 3.6), batuAndesitMat);
    pelataranTengah.position.set(0, 0.14, 0);
    pelataranTengah.receiveShadow = true;
    this.pulauRoot.add(pelataranTengah);

    const jalanUtaraSelatan = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 10.6), batuAndesitMat);
    jalanUtaraSelatan.position.set(0, 0.12, 0);
    jalanUtaraSelatan.receiveShadow = true;

    const jalanBarat = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.08, 0.84), batuAndesitMat);
    jalanBarat.position.set(-2.55, 0.12, 0);
    jalanBarat.receiveShadow = true;

    const jalanTimur = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.08, 0.84), batuAndesitMat);
    jalanTimur.position.set(2.55, 0.12, 0);
    jalanTimur.receiveShadow = true;
    this.pulauRoot.add(jalanUtaraSelatan, jalanBarat, jalanTimur);

    // Jalur batu setapak tegak lurus menuju keempat paviliun kuadran agar semua bangunan terhubung rapi
    for (const [cx, cz, w, d] of [
      [-3.35, -1.0, 0.56, 2.0],
      [-3.35, 1.0, 0.56, 2.0],
      [3.35, -1.0, 0.56, 1.8],
      [3.35, 1.0, 0.56, 1.8],
      [1.2, -2.85, 2.2, 0.56],
      [1.2, 2.85, 2.2, 0.56],
    ] as const) {
      const jalur = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), batuAndesitMat);
      jalur.position.set(cx, 0.12, cz);
      jalur.receiveShadow = true;
      this.pulauRoot.add(jalur);
    }

    // 3. Gapura Candi Bentar Majapahit di Pintu Masuk Selatan (z=5.15) & Utara (z=-5.15)
    const buatCandiBentar = (zPos: number): THREE.Group => {
      const gapura = new THREE.Group();
      for (const side of [-1, 1]) {
        const x = side * 0.72;
        const pondasiCandi = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.5), batuCandiMat);
        pondasiCandi.position.set(x, 0.07, 0);
        gapura.add(pondasiCandi);

        for (let step = 0; step < 6; step++) {
          const w = 0.38 - step * 0.042;
          const d = 0.42 - step * 0.042;
          const mat = step % 2 === 1 ? batuCandiMat : bataMajapahitMat;
          const blok = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), mat);
          blok.position.set(x + side * step * 0.016, 0.22 + step * 0.2, 0);
          blok.castShadow = true;
          gapura.add(blok);
        }
      }
      gapura.position.set(0, 0.08, zPos);
      return gapura;
    };
    this.pulauRoot.add(buatCandiBentar(5.15), buatCandiBentar(-5.15));

    // 4. Lentera Batu Taman Keraton di Simpang Jalan Setapak
    const lenteraGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffe4a0,
      emissive: 0xff9d2e,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    for (const [lx, lz] of [
      [-1.95, 0.55],
      [1.95, 0.55],
      [-0.58, 2.25],
      [0.58, 2.25],
      [-0.58, -2.25],
      [0.58, -2.25],
    ]) {
      const lentera = new THREE.Group();
      lentera.position.set(lx, 0.12, lz);
      const kaki = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.34, 8), batuCandiMat);
      kaki.position.y = 0.17;
      const lampu = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.11), lenteraGlowMat);
      lampu.position.y = 0.4;
      const topi = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.12, 4), batuCandiMat);
      topi.rotation.y = Math.PI / 4;
      topi.position.y = 0.52;
      lentera.add(kaki, lampu, topi);
      this.pulauRoot.add(lentera);
    }

    // 5. Enam Pohon Beringin Agung (Ringin Kurung) di Sudut & Sisi Luar Pulau (Bebas Benturan)
    const daunUtamaMat = new THREE.MeshStandardMaterial({
      color: 0x2b5c31,
      map: daunTex?.map ?? null,
      bumpMap: daunTex?.bump ?? null,
      bumpScale: 0.022,
      roughness: 0.76,
    });
    const daunMudaMat = new THREE.MeshStandardMaterial({
      color: 0x3f7543,
      map: daunTex?.map ?? null,
      bumpMap: daunTex?.bump ?? null,
      bumpScale: 0.02,
      roughness: 0.72,
    });

    const posisiPohon: Array<[number, number, number, number, boolean]> = [
      [-4.98, 0.12, -4.92, 1.12, true],
      [4.98, 0.12, -4.92, 1.08, false],
      [-4.98, 0.12, 4.92, 1.08, false],
      [4.98, 0.12, 4.92, 1.06, true],
      [-5.12, 0.12, -1.02, 0.88, false],
      [-5.12, 0.12, 1.02, 0.88, false],
    ];

    for (const [px, py, pz, sk, pakaiRinginKurung] of posisiPohon) {
      const pohon = new THREE.Group();
      pohon.position.set(px, py, pz);

      const batang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08 * sk, 0.16 * sk, 1.08 * sk, 8),
        kayuJatiMat,
      );
      batang.position.y = 0.54 * sk;
      batang.castShadow = true;
      pohon.add(batang);

      if (pakaiRinginKurung) {
        const ringinKurung = new THREE.Mesh(
          new THREE.BoxGeometry(0.88 * sk, 0.16, 0.88 * sk),
          batuCandiMat,
        );
        ringinKurung.position.y = 0.08;
        pohon.add(ringinKurung);
      }

      for (const dAngle of [0, 2.1, 4.2]) {
        const sulur = new THREE.Mesh(
          new THREE.CylinderGeometry(0.011 * sk, 0.009 * sk, 0.58 * sk, 5),
          kayuJatiMat,
        );
        sulur.position.set(
          Math.cos(dAngle) * 0.28 * sk,
          0.52 * sk,
          Math.sin(dAngle) * 0.28 * sk,
        );
        pohon.add(sulur);
      }

      const gugusKanopi: Array<[number, number, number, number, THREE.Material]> = [
        [0, 1.16 * sk, 0, 0.44 * sk, daunUtamaMat],
        [-0.28 * sk, 1.02 * sk, 0.18 * sk, 0.33 * sk, daunMudaMat],
        [0.28 * sk, 1.04 * sk, -0.16 * sk, 0.34 * sk, daunMudaMat],
        [-0.14 * sk, 1.05 * sk, -0.26 * sk, 0.31 * sk, daunUtamaMat],
        [0.18 * sk, 1.0 * sk, 0.24 * sk, 0.3 * sk, daunMudaMat],
        [0.05 * sk, 1.36 * sk, 0.05 * sk, 0.3 * sk, daunMudaMat],
      ];
      for (const [cx, cy, cz, cr, cmat] of gugusKanopi) {
        const tajuk = new THREE.Mesh(new THREE.IcosahedronGeometry(cr, 1), cmat);
        tajuk.scale.set(1.18, 0.74, 1.18);
        tajuk.position.set(cx, cy, cz);
        tajuk.castShadow = true;
        pohon.add(tajuk);
      }

      this.pulauRoot.add(pohon);
    }

    // ZONA 1 (PANCER TENGAH): PENDOPO JOGLO AGUNG di (0, 0.08, 0)
    // Sesuai KRONIK_SEJARAH_BUDAYA[3]: kameraTarget [0, 1.85, 0]
    const grupJoglo = new THREE.Group();
    grupJoglo.position.set(0, 0.08, 0);

    const glowJoglo = new THREE.MeshStandardMaterial({
      color: 0xa15826,
      map: kayuTex?.map ?? null,
      bumpMap: kayuTex?.bump ?? null,
      bumpScale: 0.012,
      emissive: 0x000000,
      roughness: 0.46,
      metalness: 0.2,
    });

    const bebaturBawah = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.18, 2.95), batuCandiMat);
    bebaturBawah.position.y = 0.16;
    bebaturBawah.receiveShadow = true;
    const bebaturAtas = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.18, 2.62), batuAndesitMat);
    bebaturAtas.position.y = 0.32;
    bebaturAtas.receiveShadow = true;
    grupJoglo.add(bebaturBawah, bebaturAtas);

    // Undakan Tangga Depan & Belakang Pendopo
    for (const zDir of [-1, 1]) {
      const tangga = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.28), batuCandiMat);
      tangga.position.set(0, 0.16, zDir * 1.56);
      grupJoglo.add(tangga);
    }

    // 4 Saka Guru Utama + Umpak Andesit + Cincin Kuningan
    for (const px of [-0.62, 0.62]) {
      for (const pz of [-0.54, 0.54]) {
        const umpak = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.16, 0.18, 8),
          batuCandiMat,
        );
        umpak.position.set(px, 0.48, pz);
        const tiang = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.48, 0.14), glowJoglo);
        tiang.position.set(px, 1.28, pz);
        tiang.castShadow = true;
        const cincinEmas = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.16), perungguEmasMat);
        cincinEmas.position.set(px, 0.68, pz);
        grupJoglo.add(umpak, tiang, cincinEmas);
      }
    }

    // Balok Blandar-Pengeret Horizontal Penghubung 4 Saka Guru (Terlihat Saat Atap Terangkat)
    for (const pz of [-0.54, 0.54]) {
      const blandar = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.09, 0.1), glowJoglo);
      blandar.position.set(0, 1.98, pz);
      grupJoglo.add(blandar);
    }
    for (const px of [-0.62, 0.62]) {
      const pengeret = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 1.22), glowJoglo);
      pengeret.position.set(px, 1.98, 0);
      grupJoglo.add(pengeret);
    }

    // 12 Saka Pengarak di Keliling Luar Pendopo
    for (const [ox, oz] of [
      [-1.22, -1.08],
      [-0.62, -1.08],
      [0.62, -1.08],
      [1.22, -1.08],
      [-1.22, 1.08],
      [-0.62, 1.08],
      [0.62, 1.08],
      [1.22, 1.08],
      [-1.22, -0.45],
      [-1.22, 0.45],
      [1.22, -0.45],
      [1.22, 0.45],
    ]) {
      const umpakLuar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), batuCandiMat);
      umpakLuar.position.set(ox, 0.45, oz);
      const tiangLuar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.08, 0.09), glowJoglo);
      tiangLuar.position.set(ox, 1.02, oz);
      tiangLuar.castShadow = true;
      grupJoglo.add(umpakLuar, tiangLuar);
    }

    // Grup Atap & Tumpang Sari Joglo (Terangkat halus saat Bab 04 Joglo aktif pada scroll!)
    this.jogloRoofExplodeGroup = new THREE.Group();
    for (let t = 0; t < 4; t++) {
      const wSpan = 1.38 - t * 0.22;
      const dSpan = 1.22 - t * 0.18;
      const balok = new THREE.Mesh(new THREE.BoxGeometry(wSpan, 0.08, dSpan), perungguEmasMat);
      balok.position.y = 1.98 + t * 0.09;
      this.jogloRoofExplodeGroup.add(balok);
    }
    const lampuRobyong = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lenteraGlowMat);
    lampuRobyong.position.set(0, 1.82, 0);
    this.jogloRoofExplodeGroup.add(lampuRobyong);

    const atapPenanggap = new THREE.Mesh(
      buatGeometriAtapTrapesium(3.25, 2.95, 1.65, 1.38, 0.56),
      atapTerakotaMat,
    );
    atapPenanggap.position.y = 1.54;
    atapPenanggap.castShadow = true;
    atapPenanggap.receiveShadow = true;
    this.jogloRoofExplodeGroup.add(atapPenanggap);
    tambahBubunganDanJuraiAtap(
      this.jogloRoofExplodeGroup,
      3.25,
      2.95,
      1.65,
      1.38,
      0.56,
      1.54,
      bubunganTerakotaMat,
      kayuJatiMat,
    );

    const atapBrunjung = new THREE.Mesh(
      buatGeometriAtapTrapesium(1.72, 1.44, 0.72, 0.18, 1.05),
      atapTerakotaMat,
    );
    atapBrunjung.position.y = 2.08;
    atapBrunjung.castShadow = true;
    atapBrunjung.receiveShadow = true;
    this.jogloRoofExplodeGroup.add(atapBrunjung);
    tambahBubunganDanJuraiAtap(
      this.jogloRoofExplodeGroup,
      1.72,
      1.44,
      0.72,
      0.18,
      1.05,
      2.08,
      bubunganTerakotaMat,
      kayuJatiMat,
    );

    const wuwungan = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.09, 0.14), perungguEmasMat);
    wuwungan.position.y = 3.14;
    this.jogloRoofExplodeGroup.add(wuwungan);
    for (const mx of [-0.38, 0, 0.38]) {
      const makutha = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 6), perungguEmasMat);
      makutha.position.set(mx, 3.28, 0);
      this.jogloRoofExplodeGroup.add(makutha);
    }

    grupJoglo.add(this.jogloRoofExplodeGroup);
    this.daftarkanBangunan(
      'joglo',
      grupJoglo,
      new THREE.Vector3(-0.08, 4.18, 0),
      [glowJoglo],
      2.18,
    );

    // ZONA 2 (BARAT-LAUT): BESALEN EMPU KERIS di (-3.35, 0.1, -2.85)
    // Sesuai KRONIK_SEJARAH_BUDAYA[0]: kameraTarget [-3.35, 1.05, -2.85]
    const grupKeris = new THREE.Group();
    grupKeris.position.set(-3.35, 0.1, -2.85);

    const glowKeris = new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      emissive: 0xd93800,
      emissiveIntensity: 0.78,
      roughness: 0.32,
    });
    const besiTempaMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.92,
      roughness: 0.18,
    });

    // Pondasi Batu Berundak Besalen (2.35 x 0.22 x 2.05)
    const pondasiBesalenBawah = new THREE.Mesh(
      new THREE.BoxGeometry(2.52, 0.12, 2.22),
      batuCandiMat,
    );
    pondasiBesalenBawah.position.y = 0.06;
    const lantaiBesalen = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.2, 2.05), batuAndesitMat);
    lantaiBesalen.position.y = 0.18;
    lantaiBesalen.receiveShadow = true;
    grupKeris.add(pondasiBesalenBawah, lantaiBesalen);

    for (const bx of [-0.96, 0.96]) {
      for (const bz of [-0.82, 0.82]) {
        const umpakB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), batuCandiMat);
        umpakB.position.set(bx, 0.32, bz);
        const tiangB = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.065, 1.32, 8),
          kayuJatiMat,
        );
        tiangB.position.set(bx, 0.96, bz);
        tiangB.castShadow = true;
        grupKeris.add(umpakB, tiangB);
      }
    }

    const atapBesalen = new THREE.Mesh(
      buatGeometriAtapTrapesium(2.45, 2.15, 0.82, 0.26, 0.56),
      atapTerakotaMat,
    );
    atapBesalen.position.y = 1.6;
    atapBesalen.castShadow = true;
    grupKeris.add(atapBesalen);
    tambahBubunganDanJuraiAtap(
      grupKeris,
      2.45,
      2.15,
      0.82,
      0.26,
      0.56,
      1.6,
      bubunganTerakotaMat,
      kayuJatiMat,
    );

    const prapen = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.46, 0.72), bataMajapahitMat);
    prapen.position.set(-0.22, 0.51, -0.12);
    const kawahBara = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.14, 12), glowKeris);
    kawahBara.position.set(-0.22, 0.76, -0.12);
    grupKeris.add(prapen, kawahBara);

    const bambuUbubanMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.55 });
    const tabungKiri = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.84, 12),
      bambuUbubanMat,
    );
    tabungKiri.position.set(-0.74, 0.7, -0.45);
    const tabungKanan = tabungKiri.clone();
    tabungKanan.position.x = -0.38;

    this.ububanKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.58, 8), kayuJatiMat);
    this.ububanKiri.position.set(-0.74, 1.2, -0.45);
    this.ububanKanan = this.ububanKiri.clone();
    this.ububanKanan.position.x = -0.38;
    grupKeris.add(tabungKiri, tabungKanan, this.ububanKiri, this.ububanKanan);

    const paron = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.36, 12), besiTempaMat);
    paron.position.set(0.45, 0.46, 0.18);
    const palunganAir = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 0.3), kayuJatiMat);
    palunganAir.position.set(0.45, 0.38, -0.42);
    grupKeris.add(paron, palunganAir);

    this.kerisHoloMesh = new THREE.Group();
    const lukPoints = [
      new THREE.Vector3(0, -0.32, 0),
      new THREE.Vector3(0.05, -0.1, 0),
      new THREE.Vector3(-0.05, 0.12, 0),
      new THREE.Vector3(0.05, 0.34, 0),
      new THREE.Vector3(-0.04, 0.56, 0),
      new THREE.Vector3(0, 0.82, 0),
    ];
    const bilahLuk = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lukPoints), 24, 0.042, 6, false),
      besiTempaMat,
    );
    bilahLuk.scale.z = 0.28;
    const ganjaMini = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.055, 0.08), glowKeris);
    ganjaMini.position.y = -0.34;
    const huluMini = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.048, 0.22, 8),
      perungguEmasMat,
    );
    huluMini.position.y = -0.5;
    this.kerisHoloMesh.add(bilahLuk, ganjaMini, huluMini);
    this.kerisHoloMesh.position.set(0.45, 1.24, 0.18);
    grupKeris.add(this.kerisHoloMesh);

    this.lampPrapen = new THREE.PointLight(0xff5e1a, 3.0, 4.5);
    this.lampPrapen.position.set(-3.55, 1.05, -2.95);
    this.pulauRoot.add(this.lampPrapen);

    this.daftarkanBangunan(
      'keris',
      grupKeris,
      new THREE.Vector3(-3.62, 2.52, -3.05),
      [glowKeris],
      1.74,
    );

    // ZONA 3 (TIMUR-LAUT): BALE KARAWITAN GAMELAN di (3.35, 0.1, -2.85)
    // Sesuai KRONIK_SEJARAH_BUDAYA[1]: kameraTarget [3.35, 1.0, -2.85]
    const grupSaron = new THREE.Group();
    grupSaron.position.set(3.35, 0.1, -2.85);

    const glowSaron = new THREE.MeshStandardMaterial({
      color: 0xf4c238,
      emissive: 0x713f12,
      emissiveIntensity: 0.34,
      metalness: 0.88,
      roughness: 0.2,
    });
    const merahGayorMat = new THREE.MeshStandardMaterial({
      color: 0x961d1d,
      roughness: 0.42,
      metalness: 0.22,
    });

    // Pondasi Batu & Panggung Kayu Bale Karawitan (2.35 x 0.24 x 1.95)
    const pondasiSaronBawah = new THREE.Mesh(
      new THREE.BoxGeometry(2.52, 0.12, 2.12),
      batuCandiMat,
    );
    pondasiSaronBawah.position.y = 0.06;
    const panggungSaron = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 1.95), kayuJatiMat);
    panggungSaron.position.y = 0.2;
    panggungSaron.receiveShadow = true;
    const karpetSaron = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.025, 1.75),
      new THREE.MeshStandardMaterial({ color: 0x6b1812, roughness: 0.85 }),
    );
    karpetSaron.position.y = 0.32;
    grupSaron.add(pondasiSaronBawah, panggungSaron, karpetSaron);

    // Dua Rancakan Saron Barung & Penerus (7 Bilah Gangsa Berkilau di Dalam Pondasi)
    this.saronBilahMeshes = [];
    for (const zSaron of [0.34, -0.14]) {
      const rancakan = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.26, 0.36), merahGayorMat);
      rancakan.position.set(-0.22, 0.46, zSaron);
      const lisRancak = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.4), perungguEmasMat);
      lisRancak.position.set(-0.22, 0.59, zSaron);
      grupSaron.add(rancakan, lisRancak);

      for (let i = 0; i < 7; i++) {
        const bilah = new THREE.Mesh(
          new THREE.BoxGeometry(0.145, 0.042, 0.33 - i * 0.014),
          glowSaron,
        );
        bilah.position.set(-0.76 + i * 0.18, 0.63, zSaron);
        grupSaron.add(bilah);
        this.saronBilahMeshes.push(bilah);
      }
    }

    // Gayor Berukir Naga & Gong Ageng + Kempul Menggantung
    const gayorTiangKiri = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 1.48, 10),
      merahGayorMat,
    );
    gayorTiangKiri.position.set(-0.62, 1.05, -0.68);
    const gayorTiangKanan = gayorTiangKiri.clone();
    gayorTiangKanan.position.x = 0.62;
    const gayorPalang = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.16), perungguEmasMat);
    gayorPalang.position.set(0, 1.76, -0.68);
    grupSaron.add(gayorTiangKiri, gayorTiangKanan, gayorPalang);

    this.gongAgengMesh = new THREE.Group();
    const piringanGong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.42, 0.1, 20),
      glowSaron,
    );
    piringanGong.rotation.x = Math.PI / 2;
    const pencuGong = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), perungguEmasMat);
    pencuGong.position.z = 0.055;
    this.gongAgengMesh.add(piringanGong, pencuGong);
    this.gongAgengMesh.position.set(-0.18, 1.18, -0.68);

    const kempul = this.gongAgengMesh.clone();
    kempul.scale.setScalar(0.68);
    kempul.position.set(0.36, 1.24, -0.68);
    grupSaron.add(this.gongAgengMesh, kempul);

    const kendang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.58, 12),
      merahGayorMat,
    );
    kendang.rotation.z = Math.PI / 2.1;
    kendang.position.set(0.72, 0.54, 0.26);
    grupSaron.add(kendang);

    this.daftarkanBangunan(
      'saron',
      grupSaron,
      new THREE.Vector3(3.35, 2.22, -2.85),
      [glowSaron],
      1.74,
    );

    // ZONA 4 (BARAT-DAYA): GAZEBO WASTRA BATIK KAWUNG di (-3.35, 0.1, 2.85)
    // Sesuai KRONIK_SEJARAH_BUDAYA[2]: kameraTarget [-3.35, 1.05, 2.85]
    const grupBatik = new THREE.Group();
    grupBatik.position.set(-3.35, 0.1, 2.85);

    const pondasiBatikBawah = new THREE.Mesh(
      new THREE.BoxGeometry(2.52, 0.12, 2.36),
      batuCandiMat,
    );
    pondasiBatikBawah.position.y = 0.06;
    const panggungBatik = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.2, 2.2), batuAndesitMat);
    panggungBatik.position.y = 0.18;
    panggungBatik.receiveShadow = true;
    grupBatik.add(pondasiBatikBawah, panggungBatik);

    // 4 Tiang & Atap Limasan Gazebo Wastra di Atas Pondasi Batik
    for (const [gx, gz] of [
      [-1.02, -0.92],
      [1.02, -0.92],
      [-1.02, 0.92],
      [1.02, 0.92],
    ]) {
      const umpakG = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), batuCandiMat);
      umpakG.position.set(gx, 0.32, gz);
      const tiangG = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.48, 8),
        kayuJatiMat,
      );
      tiangG.position.set(gx, 1.04, gz);
      tiangG.castShadow = true;
      grupBatik.add(umpakG, tiangG);
    }

    const atapGazeboBatik = new THREE.Mesh(
      buatGeometriAtapTrapesium(2.48, 2.32, 0.88, 0.34, 0.54),
      atapTerakotaMat,
    );
    atapGazeboBatik.position.y = 1.76;
    atapGazeboBatik.castShadow = true;
    grupBatik.add(atapGazeboBatik);
    tambahBubunganDanJuraiAtap(
      grupBatik,
      2.48,
      2.32,
      0.88,
      0.34,
      0.54,
      1.76,
      bubunganTerakotaMat,
      kayuJatiMat,
    );

    const glowBatik = new THREE.MeshStandardMaterial({
      map: buatTeksturKainBatik('kawung'),
      emissive: 0x3b2310,
      emissiveIntensity: 0.16,
      side: THREE.DoubleSide,
      roughness: 0.72,
    });
    const batikParangMat = new THREE.MeshStandardMaterial({
      map: buatTeksturKainBatik('parang'),
      emissive: 0x3b2310,
      emissiveIntensity: 0.14,
      side: THREE.DoubleSide,
      roughness: 0.74,
    });

    this.batikClothMeshes = [];
    for (const g of [
      { z: 0.28, w: 1.36, h: 1.05, mat: glowBatik, phase: 0 },
      { z: -0.28, w: 1.28, h: 0.98, mat: batikParangMat, phase: 1.6 },
    ]) {
      const tiangKiri = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.044, 1.38, 8),
        kayuJatiMat,
      );
      tiangKiri.position.set(-0.76, 0.94, g.z);
      const tiangKanan = tiangKiri.clone();
      tiangKanan.position.x = 0.76;
      const palang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 1.68, 8),
        kayuJatiMat,
      );
      palang.rotation.z = Math.PI / 2;
      palang.position.set(0, 1.58, g.z);

      const clothGeo = new THREE.PlaneGeometry(g.w, g.h, 12, 10);
      const clothMesh = new THREE.Mesh(clothGeo, g.mat);
      clothMesh.position.set(0, 1.02, g.z + 0.03);
      this.batikClothMeshes.push({
        mesh: clothMesh,
        basePos: new Float32Array(clothGeo.attributes.position.array),
        phase: g.phase,
      });

      grupBatik.add(tiangKiri, tiangKanan, palang, clothMesh);
    }

    const anglo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.2, 0.24, 12),
      bataMajapahitMat,
    );
    anglo.position.set(0.72, 0.4, 0.68);
    const wajan = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
      perungguEmasMat,
    );
    wajan.position.set(0.72, 0.58, 0.68);
    grupBatik.add(anglo, wajan);

    this.daftarkanBangunan(
      'batik',
      grupBatik,
      new THREE.Vector3(-2.65, 2.52, 2.65),
      [glowBatik, batikParangMat],
      1.74,
    );

    // ZONA 5 (TENGGARA): PANGGUNG KELIR WAYANG di (3.35, 0.1, 2.85) menghadap kamera Tenggara
    // Sesuai KRONIK_SEJARAH_BUDAYA[4]: kameraTarget [3.35, 1.02, 2.85]
    const grupWayang = new THREE.Group();
    grupWayang.position.set(3.35, 0.1, 2.85);
    grupWayang.rotation.y = 0.44;

    const pondasiWayangBawah = new THREE.Mesh(
      new THREE.BoxGeometry(2.52, 0.12, 2.02),
      batuCandiMat,
    );
    pondasiWayangBawah.position.y = 0.06;
    const dekWayang = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 1.85), kayuJatiMat);
    dekWayang.position.y = 0.2;
    dekWayang.receiveShadow = true;
    grupWayang.add(pondasiWayangBawah, dekWayang);

    const glowKelir = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.65,
      roughness: 0.52,
    });
    const layarMini = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.24, 0.05), glowKelir);
    layarMini.position.set(0, 0.98, 0);

    const tiangKelirKiri = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 1.48, 8),
      kayuJatiMat,
    );
    tiangKelirKiri.position.set(-0.98, 0.98, 0);
    const tiangKelirKanan = tiangKelirKiri.clone();
    tiangKelirKanan.position.x = 0.98;
    const bingkaiKelirAtas = new THREE.Mesh(
      new THREE.BoxGeometry(2.12, 0.1, 0.14),
      perungguEmasMat,
    );
    bingkaiKelirAtas.position.set(0, 1.64, 0);

    const gedebogMini = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.98, 10),
      new THREE.MeshStandardMaterial({ color: 0x4d5e28, roughness: 0.78 }),
    );
    gedebogMini.rotation.z = Math.PI / 2;
    gedebogMini.position.set(0, 0.38, 0.08);
    grupWayang.add(layarMini, tiangKelirKiri, tiangKelirKanan, bingkaiKelirAtas, gedebogMini);

    // Siluet Pahat 3D Gunungan Kayon, Sri Rama, dan Kijang Kencana di Atas Gedebog
    const siluetGelapMat = new THREE.MeshStandardMaterial({
      color: 0x24140a,
      roughness: 0.45,
      metalness: 0.35,
    });

    const kayonMiniShape = new THREE.Shape();
    kayonMiniShape.moveTo(-0.12, 0.06);
    kayonMiniShape.bezierCurveTo(-0.26, 0.24, -0.24, 0.56, 0, 0.88);
    kayonMiniShape.bezierCurveTo(0.24, 0.56, 0.26, 0.24, 0.12, 0.06);
    kayonMiniShape.lineTo(0.025, 0.06);
    kayonMiniShape.lineTo(0.025, -0.04);
    kayonMiniShape.lineTo(-0.025, -0.04);
    kayonMiniShape.lineTo(-0.025, 0.06);
    kayonMiniShape.closePath();
    this.wayangKayonMini = new THREE.Mesh(
      new THREE.ExtrudeGeometry(kayonMiniShape, { depth: 0.018, bevelEnabled: false, curveSegments: 10 }),
      perungguEmasMat,
    );
    this.wayangKayonMini.position.set(0, 0.42, 0.08);

    const ramaMiniShape = new THREE.Shape();
    ramaMiniShape.moveTo(-0.07, 0);
    ramaMiniShape.lineTo(-0.09, 0.34);
    ramaMiniShape.bezierCurveTo(-0.18, 0.42, -0.18, 0.54, -0.09, 0.58);
    ramaMiniShape.bezierCurveTo(-0.1, 0.68, 0.02, 0.8, 0.07, 0.86);
    ramaMiniShape.bezierCurveTo(0.11, 0.78, 0.07, 0.64, 0.14, 0.56);
    ramaMiniShape.bezierCurveTo(0.18, 0.44, 0.14, 0.34, 0.09, 0);
    ramaMiniShape.closePath();
    this.wayangRamaMini = new THREE.Mesh(
      new THREE.ExtrudeGeometry(ramaMiniShape, { depth: 0.018, bevelEnabled: false, curveSegments: 8 }),
      siluetGelapMat,
    );
    this.wayangRamaMini.position.set(0.48, 0.42, 0.09);

    const kidangMiniShape = new THREE.Shape();
    kidangMiniShape.moveTo(-0.2, 0.16);
    kidangMiniShape.lineTo(-0.14, 0.32);
    kidangMiniShape.lineTo(-0.22, 0.46);
    kidangMiniShape.lineTo(-0.16, 0.56);
    kidangMiniShape.lineTo(-0.1, 0.46);
    kidangMiniShape.bezierCurveTo(-0.02, 0.38, 0.12, 0.4, 0.2, 0.34);
    kidangMiniShape.lineTo(0.16, 0.16);
    kidangMiniShape.lineTo(0.1, 0.16);
    kidangMiniShape.lineTo(0.08, 0.26);
    kidangMiniShape.lineTo(-0.1, 0.26);
    kidangMiniShape.lineTo(-0.14, 0.16);
    kidangMiniShape.closePath();
    this.wayangKidangMini = new THREE.Mesh(
      new THREE.ExtrudeGeometry(kidangMiniShape, { depth: 0.018, bevelEnabled: false, curveSegments: 8 }),
      perungguEmasMat,
    );
    this.wayangKidangMini.position.set(-0.48, 0.42, 0.09);

    grupWayang.add(this.wayangKayonMini, this.wayangRamaMini, this.wayangKidangMini);

    this.lampApiKelir = new THREE.PointLight(0xffa838, 2.8, 4.8);
    this.lampApiKelir.position.set(3.45, 1.38, 3.15);
    this.pulauRoot.add(this.lampApiKelir);

    this.daftarkanBangunan(
      'wayang',
      grupWayang,
      new THREE.Vector3(3.35, 2.15, 2.85),
      [glowKelir],
      1.72,
    );

    // 7. Partikel Kunang-Kunang Emas Melayang
    const pCount = isMobileGpuProfile() ? 24 : 42;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 10.6;
      pPos[i * 3 + 1] = 0.45 + Math.random() * 3.6;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10.6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd275,
      size: 0.075,
      transparent: true,
      opacity: 0.72,
    });
    this.particlePoints = new THREE.Points(pGeo, pMat);
    this.pulauRoot.add(this.particlePoints);
  }

  private daftarkanBangunan(
    id: IdArtefak,
    grup: THREE.Group,
    titikPinWorld: THREE.Vector3,
    emissiveMeshes: THREE.MeshStandardMaterial[],
    auraRadius: number,
  ): void {
    // Cincin aura fokus di sekeliling pondasi bangunan yang menyala saat bab kronik terkait di-scroll
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff7a29,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(auraRadius * 0.9, auraRadius, 32),
      auraMat,
    );
    auraRing.rotation.x = -Math.PI / 2;
    auraRing.position.y = 0.035;
    auraRing.userData.skipCad = true;
    grup.add(auraRing);

    grup.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && mesh !== auraRing) {
        mesh.userData.bendaId = id;
        this.pickableMeshes.push(mesh);
      }
    });
    this.pulauRoot.add(grup);
    this.bangunanMap.set(id, { id, grup, titikPinWorld, emissiveMeshes, auraRing });
  }

  public tanganiHover(clientX: number, clientY: number): IdArtefak | null {
    if (!this.renderer) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickableMeshes, false);
    const hitId = (hits[0]?.object?.userData?.bendaId as IdArtefak | undefined) ?? null;

    if (hitId !== this.hoveredId) {
      this.hoveredId = hitId;
      this.onHoverCb?.(hitId);
    }
    return hitId;
  }

  public tanganiKlik(clientX: number, clientY: number): IdArtefak | null {
    const id = this.tanganiHover(clientX, clientY);
    if (id) {
      this.fokusKeBangunan(id);
      this.onKlikCb?.(id);
    }
    return id;
  }

  public fokusKeBangunan(id: IdArtefak | null): void {
    this.selectedId = id;
    if (!id) {
      this.targetCamPos.copy(this.heroCamPos);
      this.targetLookAt.copy(this.heroLookAt);
      return;
    }

    const kronik = KRONIK_SEJARAH_BUDAYA.find((k) => k.bendaId === id);
    if (kronik) {
      const [kx, ky, kz] = kronik.pose3D.kameraPosisi;
      const [tx, ty, tz] = kronik.pose3D.kameraTarget;
      this.targetCamPos.set(kx, ky, kz);
      this.targetLookAt.set(tx, ty, tz);
    }
  }

  public aturProgresGulir(chapterIndeks: number): void {
    if (chapterIndeks < 0) {
      this.fokusKeBangunan(null);
      return;
    }
    const kronik = KRONIK_SEJARAH_BUDAYA[Math.min(chapterIndeks, KRONIK_SEJARAH_BUDAYA.length - 1)];
    if (kronik) {
      this.selectedId = kronik.bendaId;
      const [kx, ky, kz] = kronik.pose3D.kameraPosisi;
      const [tx, ty, tz] = kronik.pose3D.kameraTarget;
      this.targetCamPos.set(kx, ky, kz);
      this.targetLookAt.set(tx, ty, tz);
    }
  }

  public aturWireframeMode(ratio: number): void {
    this.targetWireframe = THREE.MathUtils.clamp(ratio, 0, 1);
    if (this.targetWireframe > 0.015) {
      this.pastikanCadWireframeLayer();
    }
  }

  public aturParalaks(normX: number, normY: number): void {
    this.pointerNormX = THREE.MathUtils.clamp(normX, -1, 1);
    this.pointerNormY = THREE.MathUtils.clamp(normY, -1, 1);
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 800, 1);
    const h = Math.max(this.container.clientHeight || 600, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(35, this.camera.aspect, 1.15, 56);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);

    const isDesktop = w >= 960;
    this.heroLookAt.set(isDesktop ? -2.3 : 0, 0.72, isDesktop ? -0.05 : 0);
    this.heroCamPos.set(isDesktop ? 10.2 : 8.4, isDesktop ? 7.6 : 7.4, isDesktop ? 13.8 : 13.6);
    if (!this.selectedId) {
      this.targetCamPos.copy(this.heroCamPos);
      this.targetLookAt.copy(this.heroLookAt);
    }
  }

  private proyeksikanSemuaPin(): void {
    if (!this.onPinCb || !this.renderer) return;
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;
    const marginX = Math.min(72, w * 0.14);
    const v = this.pinProjScratch;
    const hasil: ProyeksiPinDiorama[] = [];

    for (const [bendaId, data] of this.bangunanMap.entries()) {
      v.copy(data.titikPinWorld);
      v.project(this.camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const terlihat = v.z > -1 && v.z < 1 && x >= marginX && x <= w - marginX && y >= 32 && y <= h - 16;
      hasil.push({ bendaId, x, y, terlihat });
    }
    if (pinProyeksiBerubah(this.prevPins, hasil)) {
      this.prevPins = hasil;
      this.onPinCb(hasil);
    }
  }

  private loop = (): void => {
    if (!this.renderer || !this.loopAktif) {
      this.rafId = null;
      return;
    }
    this.rafId = window.requestAnimationFrame(this.loop);

    const nowMs = performance.now();
    const t = nowMs * 0.001;
    const dt = this.lastFrameMs > 0 ? Math.min(Math.max((nowMs - this.lastFrameMs) * 0.001, 0.008), 0.12) : 1 / 60;
    this.lastFrameMs = nowMs;
    const camFactor = 1 - Math.exp(-8.5 * dt);

    this.goalPosScratch.copy(this.targetCamPos);
    this.goalPosScratch.x += this.pointerNormX * 0.55;
    this.goalPosScratch.y += this.pointerNormY * 0.28;

    this.curCamPos.lerp(this.goalPosScratch, camFactor);
    this.curLookAt.lerp(this.targetLookAt, camFactor);
    this.camera.position.copy(this.curCamPos);
    this.camera.lookAt(this.curLookAt);

    this.currentWireframe += (this.targetWireframe - this.currentWireframe) * 0.1;
    if (this.cadLineMat) {
      this.cadLineMat.opacity = this.currentWireframe;
      this.cadLineMat.visible = this.currentWireframe > 0.015;
    }

    const fokusKeris = this.selectedId === 'keris' || this.hoveredId === 'keris';
    const fokusSaron = this.selectedId === 'saron' || this.hoveredId === 'saron';
    const fokusBatik = this.selectedId === 'batik' || this.hoveredId === 'batik';
    const fokusJoglo = this.selectedId === 'joglo' || this.hoveredId === 'joglo';
    const fokusWayang = this.selectedId === 'wayang' || this.hoveredId === 'wayang';

    // 1. Efek Animasi Objek Keris (Besalen Empu) saat aktif di-scroll
    if (this.kerisHoloMesh) {
      this.kerisHoloMesh.rotation.y += fokusKeris ? 0.048 : 0.016;
      const targetKerisY = (fokusKeris ? 1.46 : 1.24) + Math.sin(t * (fokusKeris ? 4.2 : 2.2)) * 0.09;
      this.kerisHoloMesh.position.y += (targetKerisY - this.kerisHoloMesh.position.y) * 0.12;
    }
    if (this.ububanKiri && this.ububanKanan) {
      const freq = fokusKeris ? 6.8 : 3.4;
      const amp = fokusKeris ? 0.16 : 0.09;
      this.ububanKiri.position.y = 1.2 + Math.sin(t * freq) * amp;
      this.ububanKanan.position.y = 1.2 - Math.sin(t * freq) * amp;
    }

    // 2. Efek Animasi Objek Saron & Gong Ageng (Bale Karawitan) saat aktif di-scroll
    if (this.gongAgengMesh) {
      const gongAmp = fokusSaron ? 0.16 : 0.04;
      this.gongAgengMesh.rotation.y = Math.sin(t * (fokusSaron ? 3.6 : 1.5)) * gongAmp;
    }
    if (this.saronBilahMeshes.length > 0) {
      for (let i = 0; i < this.saronBilahMeshes.length; i++) {
        const bilah = this.saronBilahMeshes[i];
        const targetY = fokusSaron ? 0.63 + Math.max(0, Math.sin(t * 6.5 - i * 0.7)) * 0.045 : 0.63;
        bilah.position.y += (targetY - bilah.position.y) * 0.18;
      }
    }

    // 3. Efek Animasi Objek Pendopo Joglo (Bedah Atap Brunjung & Tumpang Sari) saat aktif di-scroll
    if (this.jogloRoofExplodeGroup) {
      const targetLift = fokusJoglo ? 0.36 + Math.sin(t * 2.2) * 0.05 : 0;
      this.jogloRoofExplodeGroup.position.y += (targetLift - this.jogloRoofExplodeGroup.position.y) * 0.09;
    }

    // 4. Efek Animasi Objek Panggung Kelir Wayang (Sabetan Sri Rama & Kijang Kencana) saat aktif di-scroll
    if (this.wayangRamaMini && this.wayangKidangMini && this.wayangKayonMini) {
      const sabetAmp = fokusWayang ? 1 : 0.2;
      this.wayangRamaMini.position.x = 0.48 + Math.sin(t * 2.8) * 0.14 * sabetAmp;
      this.wayangRamaMini.rotation.z = Math.sin(t * 3.4) * 0.12 * sabetAmp;
      this.wayangKidangMini.position.x = -0.48 + Math.cos(t * 3.2) * 0.14 * sabetAmp;
      this.wayangKidangMini.position.y = 0.44 + Math.abs(Math.sin(t * 4.2)) * 0.1 * sabetAmp;
      this.wayangKayonMini.rotation.z = Math.sin(t * 1.6) * 0.06 * sabetAmp;
    }

    // 5. Efek Animasi Objek Gazebo Wastra Batik
    const waveInterval = isMobileGpuProfile() ? 48 : 34;
    if (nowMs - this.lastBatikWaveMs >= waveInterval) {
      this.lastBatikWaveMs = nowMs;
      const waveAmp = fokusBatik ? 0.115 : 0.065;
      for (const item of this.batikClothMeshes) {
        const attr = item.mesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < attr.count; i++) {
          const bx = item.basePos[i * 3];
          const by = item.basePos[i * 3 + 1];
          const wave =
            Math.sin(t * (fokusBatik ? 3.8 : 2.2) + bx * 2.6 + by * 1.5 + item.phase) *
            (by < 0.3 ? waveAmp : 0.012);
          attr.setZ(i, wave);
        }
        attr.needsUpdate = true;
      }
    }

    if (this.lampApiKelir) {
      this.lampApiKelir.intensity =
        ((fokusWayang ? 4.2 : 2.8) + Math.sin(t * 6.8) * 0.45) * this.lampBoost;
    }
    if (this.lampPrapen) {
      this.lampPrapen.intensity =
        ((fokusKeris ? 4.5 : 3.0) + Math.cos(t * 8.2) * 0.55) * this.lampBoost;
    }
    if (this.particlePoints) {
      this.particlePoints.rotation.y = t * 0.032;
    }

    for (const [id, b] of this.bangunanMap.entries()) {
      const aktif = id === this.hoveredId || id === this.selectedId;
      const auraMat = b.auraRing.material as THREE.MeshBasicMaterial;
      const targetAura = aktif ? 0.65 + Math.sin(t * 4.5) * 0.2 : 0;
      auraMat.opacity += (targetAura - auraMat.opacity) * 0.14;
      const sAura = aktif ? 1 + Math.sin(t * 3.5) * 0.04 : 0.96;
      b.auraRing.scale.set(sAura, sAura, 1);

      for (const m of b.emissiveMeshes) {
        const targetInt = aktif ? 1.18 : id === 'keris' ? 0.75 : id === 'wayang' ? 0.58 : 0.18;
        if (Math.abs(targetInt - m.emissiveIntensity) > 0.004) {
          m.emissiveIntensity += (targetInt - m.emissiveIntensity) * 0.12;
        }
        if (aktif && m.emissive.getHex() === 0) {
          m.emissive.setHex(0xff5a1f);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.proyeksikanSemuaPin();
  };

  public destroy(): void {
    this.loopAktif = false;
    this.abortCtrl.abort();
    this.cancelIdleCad?.();
    this.cancelIdleCad = null;
    this.cancelMulaiLoop?.();
    this.cancelMulaiLoop = null;
    this.stopObservasi?.();
    this.stopObservasi = null;
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
