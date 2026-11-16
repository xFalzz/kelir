import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { BendaPusaka, TitikInfoPusaka } from '../content/pusaka.ts';
import {
  applyStudioHDR,
  attachCadWireframeLayer,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  loadBudayaTextures,
} from './threeHelpers.ts';
import { buildSriRamaWayang3D } from './wayang3DBuilder.ts';

export type ModeVisualTwin = 'pbr' | 'hibrida' | 'kawat';

const PRESET_KAMERA_PUSAKA: Record<
  BendaPusaka['id'],
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  keris: { pos: [0.45, 0.32, 8.45], target: [0, 0.18, 0] },
  saron: { pos: [0.75, 1.55, 6.1], target: [0, 0.02, 0] },
  batik: { pos: [0.3, 0.95, 5.9], target: [0, 0.12, 0] },
  joglo: { pos: [4.2, 2.55, 5.5], target: [0, 0.35, 0] },
  wayang: { pos: [0.18, 0.58, 7.15], target: [-0.24, 0.25, 0] },
};

export interface ProyeksiPinTwin {
  id: string;
  x: number;
  y: number;
  terlihat: boolean;
}

function buatTeksturPamorKeris(): {
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

  // Baja tempa hitam warangan arsenik (warangan keris)
  ctx.fillStyle = '#15171c';
  ctx.fillRect(0, 0, 512, 1024);
  bctx.fillStyle = '#303030';
  bctx.fillRect(0, 0, 512, 1024);

  // Lapisan lipatan nikel meteorit (Pamor Wos Wutah & Ngulit Semangka)
  for (let i = 0; i < 110; i++) {
    const lw = (i % 3) + 1.1;
    const alpha = 0.25 + (i % 5) * 0.14;
    ctx.strokeStyle = `rgba(238, 242, 248, ${alpha})`;
    ctx.lineWidth = lw;

    bctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    bctx.lineWidth = lw + 0.8;

    const baseY = i * 9.3;
    ctx.beginPath();
    bctx.beginPath();
    ctx.moveTo(0, baseY);
    bctx.moveTo(0, baseY);

    for (let x = 0; x <= 512; x += 16) {
      const yOff =
        Math.sin(x * 0.045 + i * 0.7) * 9 +
        Math.cos(x * 0.11 - i * 0.4) * 4;
      ctx.lineTo(x, baseY + yOff);
      bctx.lineTo(x, baseY + yOff);
    }
    ctx.stroke();
    bctx.stroke();
  }

  // Butiran beras wutah perak nikel di sepanjang punggung ada-ada
  for (let y = 40; y < 980; y += 48) {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
    ctx.beginPath();
    ctx.ellipse(256 + Math.sin(y) * 18, y, 16, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    bctx.fillStyle = '#ffffff';
    bctx.beginPath();
    bctx.ellipse(256 + Math.sin(y) * 18, y, 16, 7, 0.3, 0, Math.PI * 2);
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

function buatTeksturBatikKawung(): {
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
  bctx.fillStyle = '#404040';
  bctx.fillRect(0, 0, 1024, 1024);

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

        // Isi kelopak soga coklat keemasan
        ctx.fillStyle = '#c27832';
        ctx.beginPath();
        ctx.ellipse(0, 0, 39, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Garis malam klowong krem gading
        ctx.strokeStyle = '#f6deb3';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dua titik isen cecek di dalam tiap kelopak kawung
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(-11, 0, 3.2, 0, Math.PI * 2);
        ctx.arc(11, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bump map garis malam timbul
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

      // Titik Pancer Emas (Kiblat Papat Lima Pancer)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Isen mlinjon di persimpangan antar kawung
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(cx + step / 2 - 8, cy + step / 2 - 8, 16, 16);
    }
  }

  // Pinggiran Tumpal Kemada di tepi atas & bawah kain
  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(0, 0, 1024, 48);
  ctx.fillRect(0, 976, 1024, 48);
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 1008, 1008);

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bumpCanvas);

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

  const quads = [
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [4, 5, 6, 7],
    [3, 2, 1, 0],
  ];

  const positions: number[] = [];
  for (const [a, b, c, d] of quads) {
    positions.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

export class DigitalTwinStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(37, 1.33, 0.1, 50);
  private controls: OrbitControls | null = null;
  private container: HTMLElement;

  private artifactGroup: THREE.Group | null = null;
  private floorGrid: THREE.GridHelper | null = null;
  private cadLineMat: THREE.LineBasicMaterial | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private emberRim: THREE.PointLight | null = null;
  private blencongFlame: THREE.Mesh | null = null;
  private blencongLight: THREE.PointLight | null = null;
  private solidMaterials: THREE.Material[] = [];

  private targetExplode = 0;
  private curExplode = 0;
  private modeVisual: ModeVisualTwin = 'hibrida';
  private aksiHidup = true;
  private bendaIdAktif: BendaPusaka['id'] = 'keris';
  private titikAktif: TitikInfoPusaka[] = [];
  private targetCamFocus = new THREE.Vector3(0, 0.25, 0);
  private spesialPulse = 0;
  private zoomRatio = 1;
  private onPinCb: ((pins: ProyeksiPinTwin[]) => void) | null = null;
  private rafId: number | null = null;

  constructor(container: HTMLElement, tema: 'malam' | 'terang' = 'terang') {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: true });
    if (!this.renderer) return;

    this.camera.position.set(0.55, 1.22, 6.55);
    void applyStudioHDR(this.renderer, this.scene);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 9.5;

    this.ambientLight = new THREE.AmbientLight(0xdbe2ee, 0.85);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfff1dc, 2.65);
    this.keyLight.position.set(4.5, 6.5, 5.5);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x93c5fd, 1.25);
    this.fillLight.position.set(-4.5, 2.0, 3.5);
    this.scene.add(this.fillLight);

    this.emberRim = new THREE.PointLight(0xff5a1f, 3.6, 14);
    this.emberRim.position.set(-3.2, 1.8, -2.6);
    this.scene.add(this.emberRim);

    this.setTheme(tema);

    this.ubahUkuran();
    this.loop();
  }

  public muatBenda(benda: BendaPusaka): void {
    this.bendaIdAktif = benda.id;
    this.titikAktif = benda.titikInfo;
    if (!this.renderer) return;

    if (this.artifactGroup) {
      this.scene.remove(this.artifactGroup);
      disposeSceneObject(this.artifactGroup);
    }

    this.solidMaterials = [];
    this.blencongFlame = null;
    this.blencongLight = null;
    this.artifactGroup = new THREE.Group();

    const id = benda.id;
    if (id === 'keris') this.bangunKeris();
    else if (id === 'saron') this.bangunSaron();
    else if (id === 'batik') this.bangunBatik();
    else if (id === 'joglo') this.bangunJoglo();
    else this.bangunWayang();

    this.artifactGroup.traverse((child) => {
      if (child.userData.explodeVec && !child.userData.basePos) {
        child.userData.basePos = child.position.clone();
      }
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && !mesh.userData.isCadOverlay) {
        const mat = mesh.material;
        if (Array.isArray(mat)) this.solidMaterials.push(...mat);
        else if (mat) this.solidMaterials.push(mat);
      }
    });

    this.cadLineMat = attachCadWireframeLayer(this.artifactGroup, 0xff5a1f, 0.35);
    this.scene.add(this.artifactGroup);
    this.terapkanModeVisual(this.modeVisual);
    this.resetKamera(id);
  }

  public resetKamera(id: BendaPusaka['id'] = this.bendaIdAktif): void {
    const preset = PRESET_KAMERA_PUSAKA[id] ?? PRESET_KAMERA_PUSAKA.keris;
    this.zoomRatio = 1;
    this.camera.position.set(...preset.pos);
    this.camera.fov = hitungFovResponsif(37, this.camera.aspect, 1.22, 60);
    this.camera.updateProjectionMatrix();
    this.targetCamFocus.set(...preset.target);
    this.controls?.target.set(...preset.target);
    this.controls?.update();
  }

  /**
   * 1. KERIS LUK 5 PANDHAWA LARE:
   * - Bilah berlian ber-ada-ada tengah + 5 Luk + Kembang Kacang + Greneng + Sogokan
   * - Ganja Wilut berlekuk
   * - Pesi baja tempa di dalam hulu
   * - Mendak & Selut emas bertatah 12 permata mirah
   * - Ukiran / Deder kayu jati berbidang patra
   * - Warangka Gayaman + Gandar + Pendok Blewah Emas
   */
  private bangunKeris(): void {
    if (!this.artifactGroup) return;
    const tex = loadBudayaTextures();
    const pamor = buatTeksturPamorKeris();

    const bilahMat = new THREE.MeshStandardMaterial({
      map: pamor.diffuse,
      bumpMap: pamor.bump,
      bumpScale: 0.032,
      color: 0xdadce0,
      metalness: 0.92,
      roughness: 0.2,
    });
    const emasMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.18,
    });
    const mirahMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
      roughness: 0.15,
    });
    const kayuKemuningMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0x6b3818,
      roughness: 0.38,
      metalness: 0.08,
    });

    // A. Bilah Utama (Wilah Luk 5 berpenampang intan tajam + Kembang Kacang)
    const wilahGrup = new THREE.Group();
    wilahGrup.userData.explodeVec = new THREE.Vector3(0, 0.78, 0.12);

    const wilahPoints: THREE.Vector3[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const y = -0.3 + u * 2.18;
      const wave = Math.sin(u * Math.PI * 5) * 0.095 * (1 - u * 0.45);
      wilahPoints.push(new THREE.Vector3(wave, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(wilahPoints);
    // 4 radial segments = penampang intan (diamond cross-section dengan punggung ada-ada tajam!)
    const wilahGeo = new THREE.TubeGeometry(curve, 80, 0.115, 4, false);
    const pos = wilahGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = THREE.MathUtils.clamp((y + 0.3) / 2.18, 0, 1);
      // Lebar pangkal sorsoran mekar, meruncing ke pucuk panitis
      const flare = t < 0.14 ? 1.45 - t * 2.5 : 1 - t * 0.72;
      pos.setX(i, pos.getX(i) * flare);
      pos.setZ(i, pos.getZ(i) * (0.24 * (1 - t * 0.65)));
    }
    wilahGeo.computeVertexNormals();
    const wilahMesh = new THREE.Mesh(wilahGeo, bilahMat);
    wilahMesh.castShadow = true;
    wilahGrup.add(wilahMesh);

    // Kembang Kacang (Belalai Gajah Melingkar di Gandik Depan) & Lambe Gajah
    const kembangKacang = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.016, 10, 20, Math.PI * 1.45),
      bilahMat,
    );
    kembangKacang.position.set(-0.14, -0.22, 0);
    kembangKacang.rotation.z = 0.4;
    wilahGrup.add(kembangKacang);

    // Alur Sogokan Rangkap di Pangkal Sorsoran
    for (const zSide of [-0.024, 0.024]) {
      const sogokan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.014, 0.38, 8),
        emasMat,
      );
      sogokan.position.set(-0.02, -0.08, zSide);
      wilahGrup.add(sogokan);
    }

    // B. Ganja Wilut Melintang di Bawah Wilah
    const ganjaShape = new THREE.Shape();
    ganjaShape.moveTo(-0.26, -0.04); // Sirah cecak (depan)
    ganjaShape.quadraticCurveTo(-0.08, 0.05, 0.12, 0.03);
    ganjaShape.lineTo(0.32, -0.02); // Buntut urang (ekor greneng)
    ganjaShape.quadraticCurveTo(0.1, -0.06, -0.24, -0.06);
    ganjaShape.closePath();
    const ganja = new THREE.Mesh(
      new THREE.ExtrudeGeometry(ganjaShape, {
        depth: 0.09,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.01,
      }),
      bilahMat,
    );
    ganja.position.set(0, -0.35, -0.045);
    ganja.userData.explodeVec = new THREE.Vector3(-0.22, 0.2, 0.42);

    // C. Pesi (Paksi Baja Tangkai Dalam Hulu — Terlihat Jelas Saat Exploded!)
    const pesi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.016, 0.54, 12),
      bilahMat,
    );
    pesi.position.set(0, -0.62, 0);
    pesi.userData.explodeVec = new THREE.Vector3(0, 0.02, -0.35);

    // D. Mendak & Selut Cincin Emas Permata Mirah
    const mendakGrup = new THREE.Group();
    mendakGrup.position.set(0, -0.46, 0);
    mendakGrup.userData.explodeVec = new THREE.Vector3(0, -0.18, 0.38);

    const cincinUtama = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.024, 14, 28), emasMat);
    cincinUtama.rotation.x = Math.PI / 2;
    const selutBawah = new THREE.Mesh(new THREE.SphereGeometry(0.088, 18, 14), emasMat);
    selutBawah.scale.y = 0.65;
    selutBawah.position.y = -0.05;
    mendakGrup.add(cincinUtama, selutBawah);

    for (let p = 0; p < 10; p++) {
      const ang = (p / 10) * Math.PI * 2;
      const permata = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), mirahMat);
      permata.position.set(Math.cos(ang) * 0.086, 0, Math.sin(ang) * 0.086);
      mendakGrup.add(permata);
    }

    // E. Hulu / Ukiran Deder Surakarta Berlekuk Patra
    const huluPoints = [
      new THREE.Vector3(0, -0.48, 0),
      new THREE.Vector3(0.02, -0.72, 0),
      new THREE.Vector3(-0.06, -0.96, 0),
      new THREE.Vector3(-0.18, -1.16, 0),
    ];
    const huluGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(huluPoints), 36, 0.082, 8, false);
    const hulu = new THREE.Mesh(huluGeo, kayuKemuningMat);
    hulu.castShadow = true;
    hulu.userData.explodeVec = new THREE.Vector3(-0.12, -0.72, 0);

    // F. Warangka Gayaman + Gandar Kayu + Pendok Blewah Emas Berukir
    const warangka = new THREE.Group();
    warangka.position.set(0.38, 0.18, -0.26);
    warangka.userData.explodeVec = new THREE.Vector3(0.95, 0.08, -0.68);

    // Perahu Atasan Warangka Gayaman
    const gayamanShape = new THREE.Shape();
    gayamanShape.moveTo(-0.48, 0.06);
    gayamanShape.quadraticCurveTo(-0.56, 0.24, -0.18, 0.26);
    gayamanShape.quadraticCurveTo(0.28, 0.28, 0.54, 0.14);
    gayamanShape.quadraticCurveTo(0.42, -0.08, 0.16, -0.12);
    gayamanShape.lineTo(-0.22, -0.12);
    gayamanShape.quadraticCurveTo(-0.44, -0.08, -0.48, 0.06);

    const gayamanAtas = new THREE.Mesh(
      new THREE.ExtrudeGeometry(gayamanShape, {
        depth: 0.13,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.018,
      }),
      kayuKemuningMat,
    );
    gayamanAtas.position.set(0, 0.18, -0.32);

    const gandarKayu = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.068, 1.62, 16),
      kayuKemuningMat,
    );
    gandarKayu.scale.z = 0.48;
    gandarKayu.position.set(0, -0.68, -0.25);

    const pendokEmas = new THREE.Mesh(
      new THREE.CylinderGeometry(0.116, 0.072, 1.54, 16),
      emasMat,
    );
    pendokEmas.scale.z = 0.52;
    pendokEmas.position.set(0, -0.72, -0.25);

    warangka.add(gayamanAtas, gandarKayu, pendokEmas);

    this.artifactGroup.add(wilahGrup, ganja, pesi, mendakGrup, hulu, warangka);
  }

  /**
   * 2. SARON BARUNG LARAS SLENDRO:
   * - Rancakan Jati Berukir Naga & Lung-Lungan Emas + Rongga Akustik Palungan
   * - Sepasang Bantalan Kaso & Tali Pluntur
   * - 7 Bilah Wilah Perunggu Tempa (Gangsa) + Pencu Tala + 14 Paku Tawonan
   * - Tabuh Gandhen Kayu Sawo Berbentuk V
   */
  private bangunSaron(): void {
    if (!this.artifactGroup) return;
    const tex = loadBudayaTextures();

    const jatiMerahMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0x6b2414,
      roughness: 0.52,
    });
    const emasUkirMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.88,
      roughness: 0.2,
    });
    const gangsaTempaMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x451a03,
      emissiveIntensity: 0.18,
      metalness: 0.9,
      roughness: 0.18,
    });

    // A. Kotak Palungan Resonator Bawah
    const palungan = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.44, 0.72), jatiMerahMat);
    palungan.position.set(0, -0.24, 0);
    palungan.userData.explodeVec = new THREE.Vector3(0, -0.62, 0);
    this.artifactGroup.add(palungan);

    // Panel Relief Ukir Lung-Lungan Emas di Dinding Depan & Belakang Rancakan
    for (const zWall of [-0.37, 0.37]) {
      const relief = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.24, 0.03), emasUkirMat);
      relief.position.set(0, -0.22, zWall);
      relief.userData.explodeVec = new THREE.Vector3(0, -0.45, zWall * 1.4);
      this.artifactGroup.add(relief);
    }

    // B. Sayap Ukir Naga / Gelung di Ujung Kiri & Kanan Rancakan
    const buatSayapRancakan = (arah: number): THREE.Group => {
      const sayap = new THREE.Group();
      const blokSayap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.72, 6), jatiMerahMat);
      blokSayap.rotation.z = -arah * 0.38;
      const mahkotaNaga = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.04, 10, 20, Math.PI * 1.3),
        emasUkirMat,
      );
      mahkotaNaga.position.set(arah * 0.12, 0.22, 0);
      sayap.add(blokSayap, mahkotaNaga);
      sayap.position.set(arah * 1.38, 0.04, 0);
      sayap.userData.explodeVec = new THREE.Vector3(arah * 0.75, -0.18, 0);
      return sayap;
    };
    this.artifactGroup.add(buatSayapRancakan(-1), buatSayapRancakan(1));

    // C. 6 Bilah Wilah Perunggu Gangsa Slendro (1-2-3-5-6-i) + 12 Paku Tawonan
    for (let i = 0; i < 6; i++) {
      const wilahGrup = new THREE.Group();
      const lebar = 0.28 - i * 0.009;
      const panjang = 0.76 - i * 0.042;
      const xPos = -0.875 + i * 0.35;

      // Bilah trapesium ber-punggung cembung
      const bilah = new THREE.Mesh(new THREE.BoxGeometry(lebar, 0.055, panjang), gangsaTempaMat);
      bilah.castShadow = true;
      const punggung = new THREE.Mesh(
        new THREE.CylinderGeometry(lebar * 0.32, lebar * 0.38, panjang * 0.92, 12),
        gangsaTempaMat,
      );
      punggung.rotation.x = Math.PI / 2;
      punggung.scale.y = 0.35;
      punggung.position.y = 0.025;

      // 2 Paku Tawonan Pengunci Bilah
      const pakuDepan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8),
        emasUkirMat,
      );
      pakuDepan.position.set(0, 0.03, panjang * 0.36);
      const pakuBelakang = pakuDepan.clone();
      pakuBelakang.position.z = -panjang * 0.36;

      wilahGrup.add(bilah, punggung, pakuDepan, pakuBelakang);
      wilahGrup.position.set(xPos, 0.14, 0);
      wilahGrup.userData.explodeVec = new THREE.Vector3(0, 0.48 + i * 0.09, 0);
      this.artifactGroup.add(wilahGrup);
    }

    // D. Tabuh Gandhen Kayu Sawo
    const ganden = new THREE.Group();
    const kepalaPalu = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.095, 0.38, 18),
      jatiMerahMat,
    );
    kepalaPalu.rotation.z = Math.PI / 2;
    const cincinPalu = new THREE.Mesh(
      new THREE.TorusGeometry(0.105, 0.014, 10, 20),
      emasUkirMat,
    );
    cincinPalu.rotation.y = Math.PI / 2;
    const gagang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.036, 0.72, 12),
      jatiMerahMat,
    );
    gagang.position.set(0.08, -0.34, 0);
    gagang.rotation.z = 0.22;
    ganden.add(kepalaPalu, cincinPalu, gagang);
    ganden.position.set(1.18, 0.72, 0.48);
    ganden.rotation.z = 0.38;
    ganden.userData.explodeVec = new THREE.Vector3(0.68, 0.52, 0.58);
    this.artifactGroup.add(ganden);
  }

  /**
   * 3. BATIK TULIS KAWUNG:
   * - Kain Mori Primissima bergelombang S-curve dengan tekstur Kawung Picis + Cecek 1024px
   * - Rangka Gawangan Jati Berukir 3 Palang
   * - Canting Tulis Tembaga (Gagang Bambu, Nyamplung, Cucuk & Tetesan Malam Emas)
   * - Wajan Malam Cair & Tungku Anglo Terakota
   */
  private bangunBatik(): void {
    if (!this.artifactGroup) return;
    const tex = loadBudayaTextures();
    const kawung = buatTeksturBatikKawung();

    const kainMat = new THREE.MeshStandardMaterial({
      map: kawung.diffuse,
      bumpMap: kawung.bump,
      bumpScale: 0.024,
      side: THREE.DoubleSide,
      roughness: 0.72,
    });
    const tembagaMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.88,
      roughness: 0.22,
    });
    const jatiMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0x5c3418,
      roughness: 0.58,
    });
    const malamCairMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x92400e,
      emissiveIntensity: 0.45,
      roughness: 0.15,
    });

    // A. Kain Mori Batik Kawung Berlipat Anggun (S-Draped PlaneGeometry)
    const kainGeo = new THREE.PlaneGeometry(2.15, 1.65, 36, 28);
    const pos = kainGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const zWave = Math.sin(y * 2.4) * 0.16 + Math.cos(x * 3.1) * 0.04;
      pos.setZ(i, zWave);
    }
    kainGeo.computeVertexNormals();
    const kain = new THREE.Mesh(kainGeo, kainMat);
    kain.rotation.x = -0.22;
    kain.castShadow = true;
    kain.userData.explodeVec = new THREE.Vector3(0, 0.12, -0.52);
    this.artifactGroup.add(kain);

    // B. Rangka Gawangan Jati Berukir (Tiang Kiri, Kanan & Palang Atas)
    const gawanganGrup = new THREE.Group();
    const palangAtas = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 2.48, 14), jatiMat);
    palangAtas.rotation.z = Math.PI / 2;
    palangAtas.position.set(0, 0.84, 0.12);
    const tiangKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.85, 12), jatiMat);
    tiangKiri.position.set(-1.12, -0.05, 0.12);
    const tiangKanan = tiangKiri.clone();
    tiangKanan.position.x = 1.12;
    gawanganGrup.add(palangAtas, tiangKiri, tiangKanan);
    gawanganGrup.userData.explodeVec = new THREE.Vector3(0, 0.58, 0);
    this.artifactGroup.add(gawanganGrup);

    // C. Canting Tulis Tembaga + Tetesan Malam Emas
    const canting = new THREE.Group();
    const nyamplung = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.075, 0.18, 18), tembagaMat);
    const cucuk = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.24, 10), tembagaMat);
    cucuk.rotation.z = Math.PI / 2.15;
    cucuk.position.set(-0.15, -0.02, 0);
    const tetesMalam = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), malamCairMat);
    tetesMalam.position.set(-0.27, -0.05, 0);
    const gagangBambu = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.68, 10), jatiMat);
    gagangBambu.rotation.z = -Math.PI / 2.35;
    gagangBambu.position.set(0.34, 0.09, 0);
    canting.add(nyamplung, cucuk, tetesMalam, gagangBambu);
    canting.position.set(0.68, 0.28, 0.68);
    canting.userData.explodeVec = new THREE.Vector3(0.55, 0.38, 0.72);
    this.artifactGroup.add(canting);

    // D. Wajan Malam Cair & Tungku Anglo di Kanan Bawah
    const komporGrup = new THREE.Group();
    const anglo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.34, 16),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 }),
    );
    const wajan = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.16, 0.16, 20), tembagaMat);
    wajan.position.y = 0.22;
    const kolamMalam = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 18), malamCairMat);
    kolamMalam.position.y = 0.29;
    komporGrup.add(anglo, wajan, kolamMalam);
    komporGrup.position.set(0.75, -0.82, 0.55);
    komporGrup.userData.explodeVec = new THREE.Vector3(0.62, -0.52, 0.62);
    this.artifactGroup.add(komporGrup);
  }

  /**
   * 4. PENDOPO JOGLO AGUNG:
   * - Lantai Bebatur & 4 Umpak Batu Andesit
   * - 4 Tiang Saka Guru + 8 Tiang Saka Pengarak
   * - Balok Sunduk-Kili & Blandar-Pengeret
   * - 5 Undakan Tumpang Sari + Ander + Lampu Robyong
   * - Rangka Usuk & Atap Penanggap + Brunjung Trapesium + Wuwungan Mahkota
   */
  private bangunJoglo(): void {
    if (!this.artifactGroup) return;
    const tex = loadBudayaTextures();

    const jatiMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0x78421c,
      roughness: 0.58,
    });
    const batuMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.82 });
    const gentengMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.58 });
    const emasMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.88, roughness: 0.2 });

    // A. Bebatur Lantai Dasar
    const bebatur = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.16, 2.45), batuMat);
    bebatur.position.y = -1.16;
    bebatur.userData.explodeVec = new THREE.Vector3(0, -0.78, 0);
    this.artifactGroup.add(bebatur);

    // B. 4 Umpak Batu & 4 Saka Guru Utama
    for (const sx of [-0.62, 0.62]) {
      for (const sz of [-0.54, 0.54]) {
        const umpak = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.2, 8), batuMat);
        umpak.position.set(sx, -0.98, sz);
        umpak.userData.explodeVec = new THREE.Vector3(sx * 0.4, -0.52, sz * 0.4);

        const saka = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.38, 0.14), jatiMat);
        saka.position.set(sx, -0.2, sz);
        saka.userData.explodeVec = new THREE.Vector3(sx * 0.52, -0.08, sz * 0.52);
        this.artifactGroup.add(umpak, saka);
      }
    }

    // C. 8 Saka Pengarak Keliling Luar
    for (const sx of [-1.15, 1.15]) {
      for (const sz of [-0.95, -0.32, 0.32, 0.95]) {
        const tiangLuar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.02, 0.09), jatiMat);
        tiangLuar.position.set(sx, -0.38, sz);
        tiangLuar.userData.explodeVec = new THREE.Vector3(sx * 0.65, -0.18, sz * 0.65);
        this.artifactGroup.add(tiangLuar);
      }
    }

    // D. 5 Undakan Tumpang Sari + Dhadha Peksi + Lampu Robyong
    for (let tier = 0; tier < 5; tier++) {
      const wSpan = 1.52 - tier * 0.24;
      const dSpan = 1.36 - tier * 0.21;
      const ring = new THREE.Mesh(new THREE.BoxGeometry(wSpan, 0.09, dSpan), jatiMat);
      ring.position.y = 0.52 + tier * 0.11;
      ring.userData.explodeVec = new THREE.Vector3(0, 0.28 + tier * 0.24, 0);
      this.artifactGroup.add(ring);
    }

    const robyong = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), emasMat);
    robyong.position.set(0, 0.42, 0);
    robyong.userData.explodeVec = new THREE.Vector3(0, 0.2, 0.45);
    this.artifactGroup.add(robyong);

    // E. Atap Penanggap Bawah & Brunjung Trapesium Atas + Wuwungan
    const penanggap = new THREE.Mesh(
      buatGeometriAtapTrapesiumTwin(2.75, 2.48, 1.52, 1.32, 0.46),
      gentengMat,
    );
    penanggap.position.y = 0.62;
    penanggap.userData.explodeVec = new THREE.Vector3(0, 0.92, 0);

    const brunjung = new THREE.Mesh(
      buatGeometriAtapTrapesiumTwin(1.58, 1.36, 0.64, 0.16, 0.96),
      gentengMat,
    );
    brunjung.position.y = 1.32;
    brunjung.userData.explodeVec = new THREE.Vector3(0, 1.48, 0);

    const wuwungan = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.14), emasMat);
    wuwungan.position.y = 1.84;
    wuwungan.userData.explodeVec = new THREE.Vector3(0, 1.78, 0);

    this.artifactGroup.add(penanggap, brunjung, wuwungan);
  }

  /** Membuat instrumen 3D Pelita Minyak Blencong Kuningan bersayap garuda untuk bedah Wayang. */
  private buatBlencongWayang3D(): THREE.Group {
    const kuninganMat = new THREE.MeshStandardMaterial({
      color: 0xe6b655,
      metalness: 0.9,
      roughness: 0.2,
    });
    const perungguGelapMat = new THREE.MeshStandardMaterial({
      color: 0x4b3822,
      metalness: 0.72,
      roughness: 0.36,
    });
    const minyakMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.12,
      roughness: 0.14,
    });
    const apiMat = new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xff7b24,
      emissiveIntensity: 2.1,
      roughness: 0.2,
    });

    const blencong = new THREE.Group();
    blencong.position.set(-1.18, 0.92, 0.28);
    blencong.rotation.y = 0.42;
    blencong.userData.explodeVec = new THREE.Vector3(-0.75, 0.55, 0.35);

    // Mangkuk reservoir minyak kelapa (LatheGeometry berprofil tradisional)
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
    const mangkuk = new THREE.Mesh(new THREE.LatheGeometry(profil, 28), kuninganMat);
    mangkuk.castShadow = true;
    blencong.add(mangkuk);

    // Genangan minyak kelapa & cincin bibir pelita
    const minyak = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 22), minyakMat);
    minyak.position.y = 0.045;
    blencong.add(minyak);

    // Cucuk corong sumbu ke arah wayang (+X) + sumbu kapas + nyala api hangat
    const corong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.19, 12), kuninganMat);
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
    this.blencongFlame = flame;
    blencong.add(flame);

    const light = new THREE.PointLight(0xff9c3b, 2.1, 4.8);
    light.position.set(0.34, 0.18, 0.04);
    this.blencongLight = light;
    blencong.add(light);

    // Sayap burung garuda kuningan & mahkota belakang pelita
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

    // Batang gantung & kait cincin pelita atas
    const batangGantung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.018, 0.62, 10),
      perungguGelapMat,
    );
    batangGantung.position.set(0, 0.42, 0);
    const kait = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 10, 22), kuninganMat);
    kait.position.set(0, 0.74, 0);
    blencong.add(batangGantung, kait);

    return blencong;
  }

  private bangunWayang(): void {
    if (!this.artifactGroup) return;
    const rama = buildSriRamaWayang3D();
    rama.root.scale.setScalar(1.22);
    rama.root.position.set(0, 0.08, 0);
    const blencong = this.buatBlencongWayang3D();
    this.artifactGroup.add(rama.root, blencong);
  }

  public aturLedakAnatomi(nilai0ke1: number): void {
    this.targetExplode = THREE.MathUtils.clamp(nilai0ke1, 0, 1);
  }

  public terapkanModeVisual(mode: ModeVisualTwin): void {
    this.modeVisual = mode;
    const isWireOnly = mode === 'kawat';
    const wireOpacity = isWireOnly ? 0.96 : mode === 'hibrida' ? 0.38 : 0;

    for (const mat of this.solidMaterials) {
      const m = mat as THREE.MeshStandardMaterial;
      if (isWireOnly) {
        m.transparent = true;
        m.opacity = 0.04;
        m.colorWrite = false;
        m.depthWrite = false;
      } else if (mode === 'hibrida') {
        m.transparent = true;
        m.opacity = 0.9;
        m.colorWrite = true;
        m.depthWrite = true;
      } else {
        m.transparent = false;
        m.opacity = 1;
        m.colorWrite = true;
        m.depthWrite = true;
      }
      m.needsUpdate = true;
    }

    if (this.cadLineMat) {
      this.cadLineMat.opacity = wireOpacity;
      this.cadLineMat.visible = wireOpacity > 0.01;
      if (this.artifactGroup) {
        this.artifactGroup.traverse((obj) => {
          if (obj.userData.isCadOverlay) {
            obj.visible = wireOpacity > 0.01;
          }
        });
      }
    }
  }

  public toggleModeWireframe(): boolean {
    const next: ModeVisualTwin = this.modeVisual === 'kawat' ? 'hibrida' : 'kawat';
    this.terapkanModeVisual(next);
    return next === 'kawat';
  }

  public fokusKeTitik(titik: TitikInfoPusaka): void {
    this.targetCamFocus.set(...titik.posisi);
    this.spesialPulse = 1;
  }

  public picuEfekKhusus3D(): void {
    this.spesialPulse = 1;
    if (this.artifactGroup) {
      this.artifactGroup.rotation.y += 0.38;
    }
  }

  public toggleAksiHidup(): boolean {
    this.aksiHidup = !this.aksiHidup;
    return this.aksiHidup;
  }

  public aturPutaranTangan(dx: number, zoom: number): void {
    if (this.artifactGroup) {
      this.artifactGroup.rotation.y += dx * 0.08;
    }
    this.zoomRatio = zoom || 1;
    const baseFov = THREE.MathUtils.clamp(37 / this.zoomRatio, 22, 54);
    this.camera.fov = hitungFovResponsif(baseFov, this.camera.aspect, 1.22, 60);
    this.camera.updateProjectionMatrix();
  }

  public onProyeksiPin(cb: (pins: ProyeksiPinTwin[]) => void): void {
    this.onPinCb = cb;
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    if (!this.renderer) return;

    if (tema === 'malam') {
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xeae3d7);
        this.ambientLight.intensity = 1.08;
      }
      if (this.keyLight) this.keyLight.intensity = 2.95;
      if (this.fillLight) {
        this.fillLight.color.setHex(0xc8d8ee);
        this.fillLight.intensity = 1.48;
      }
      if (this.emberRim) this.emberRim.intensity = 4.25;
    } else {
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xdbe2ee);
        this.ambientLight.intensity = 0.85;
      }
      if (this.keyLight) this.keyLight.intensity = 2.65;
      if (this.fillLight) {
        this.fillLight.color.setHex(0x93c5fd);
        this.fillLight.intensity = 1.25;
      }
      if (this.emberRim) this.emberRim.intensity = 3.4;
    }

    if (this.floorGrid) {
      this.scene.remove(this.floorGrid);
      this.floorGrid.geometry.dispose();
      const mat = this.floorGrid.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
    const cMain = tema === 'terang' ? 0xb5ae9e : 0x665c4f;
    const cSub = tema === 'terang' ? 0xdbd5c8 : 0x28231d;
    this.floorGrid = new THREE.GridHelper(6.8, 18, cMain, cSub);
    this.floorGrid.position.y = -1.96;
    this.floorGrid.userData.skipCad = true;
    this.scene.add(this.floorGrid);
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 640, 1);
    const h = Math.max(this.container.clientHeight || 480, 1);
    this.camera.aspect = w / h;
    const baseFov = THREE.MathUtils.clamp(37 / this.zoomRatio, 22, 54);
    this.camera.fov = hitungFovResponsif(baseFov, this.camera.aspect, 1.22, 60);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private proyeksikanTitik(): void {
    if (!this.onPinCb || !this.artifactGroup || !this.renderer) return;
    const w = this.container.clientWidth || 640;
    const h = this.container.clientHeight || 480;
    const worldV = new THREE.Vector3();
    const list: ProyeksiPinTwin[] = [];

    for (const t of this.titikAktif) {
      worldV.set(t.posisi[0], t.posisi[1], t.posisi[2]);
      this.artifactGroup.localToWorld(worldV);
      worldV.project(this.camera);
      const x = (worldV.x * 0.5 + 0.5) * w;
      const y = (-worldV.y * 0.5 + 0.5) * h;
      const terlihat = worldV.z > -1 && worldV.z < 1 && x >= 18 && x <= w - 18 && y >= 18 && y <= h - 18;
      list.push({ id: t.id, x, y, terlihat });
    }
    this.onPinCb(list);
  }

  private loop = (): void => {
    this.rafId = window.requestAnimationFrame(this.loop);
    if (!this.renderer) return;

    this.curExplode += (this.targetExplode - this.curExplode) * 0.1;

    if (this.artifactGroup) {
      if (this.aksiHidup) {
        this.artifactGroup.rotation.y += 0.005 + this.spesialPulse * 0.028;
      }

      this.artifactGroup.traverse((child) => {
        const base = child.userData.basePos as THREE.Vector3 | undefined;
        const vec = child.userData.explodeVec as THREE.Vector3 | undefined;
        if (base && vec) {
          const skalaLedak = this.curExplode * 0.58;
          child.position.set(
            base.x + vec.x * skalaLedak,
            base.y + vec.y * skalaLedak,
            base.z + vec.z * skalaLedak,
          );
        }
      });
    }

    if (this.controls) {
      this.controls.target.lerp(this.targetCamFocus, 0.06);
      this.controls.update();
    }

    this.spesialPulse *= 0.92;
    if (this.blencongFlame) {
      const flicker = 1 + Math.sin(performance.now() * 0.009) * 0.08;
      this.blencongFlame.scale.set(0.72 * flicker, 1.55 * flicker, 0.72 * flicker);
      if (this.blencongLight) {
        this.blencongLight.intensity = 1.9 + flicker * 0.35;
      }
    }
    this.renderer.render(this.scene, this.camera);
    this.proyeksikanTitik();
  };

  public destroy(): void {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    this.controls?.dispose();
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
