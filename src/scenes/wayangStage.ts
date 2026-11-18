import * as THREE from 'three';
import {
  applyStudioHDR,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  jalankanLoopSetelahSiap,
  pasangObservasiPanggung,
} from './threeHelpers.ts';
import {
  buildBlencongWayang3D,
  buildGunungan3D,
  buildKidangKencana3D,
  buildSimpinganWayang3D,
  buildSriRamaWayang3D,
  type KidangKencanaRig,
  type WayangSriRamaRig,
} from './wayang3DBuilder.ts';

export type MoodPanggungWayang = 'blencong' | 'kelir' | 'sorot';

let cacheLayarBlacuTex: THREE.CanvasTexture | null = null;
let cacheGedebogTex: THREE.CanvasTexture | null = null;
let cacheJatiUkirTex: THREE.CanvasTexture | null = null;

function buatTeksturLayarBlacu(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheLayarBlacuTex) return cacheLayarBlacuTex;

  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Gradasi pendar hangat lampu minyak kelapa Blencong di tengah layar kain blacu
  const rad = ctx.createRadialGradient(w * 0.5, h * 0.36, 16, w * 0.5, h * 0.48, w * 0.62);
  rad.addColorStop(0, '#fff7de');
  rad.addColorStop(0.32, '#f9e3ad');
  rad.addColorStop(0.68, '#dec082');
  rad.addColorStop(1, '#9c7844');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);

  // Serat tenun halus kain mori/blacu organik
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? 'rgba(110, 74, 28, 0.035)' : 'rgba(255, 250, 232, 0.03)';
    ctx.fillRect(0, y, w, 1);
  }

  // Plisir kain merah soga & sulam benang emas prada di tepi atas dan bawah kelir
  ctx.fillStyle = '#5e160e';
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 14, w, 14);

  ctx.fillStyle = '#e5b554';
  ctx.fillRect(0, 13, w, 2);
  ctx.fillRect(0, h - 15, w, 2);

  // Ornamen pucuk rebung (tumpal) emas sepanjang plisir kelir
  ctx.fillStyle = '#eab956';
  for (let tx = 12; tx < w - 12; tx += 24) {
    ctx.beginPath();
    ctx.moveTo(tx, 12);
    ctx.lineTo(tx + 6, 4);
    ctx.lineTo(tx + 12, 12);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(tx, h - 12);
    ctx.lineTo(tx + 6, h - 4);
    ctx.lineTo(tx + 12, h - 12);
    ctx.closePath();
    ctx.fill();
  }

  cacheLayarBlacuTex = new THREE.CanvasTexture(canvas);
  cacheLayarBlacuTex.colorSpace = THREE.SRGBColorSpace;
  cacheLayarBlacuTex.anisotropy = 4;
  return cacheLayarBlacuTex;
}

function buatTeksturGedebogPisang(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheGedebogTex) return cacheGedebogTex;

  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#3e5226');
  grad.addColorStop(0.35, '#597034');
  grad.addColorStop(0.7, '#465929');
  grad.addColorStop(1, '#263315');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Serat memanjang pelepah batang pisang
  for (let y = 0; y < h; y += 4) {
    ctx.strokeStyle = y % 8 === 0 ? 'rgba(210, 225, 160, 0.14)' : 'rgba(20, 30, 10, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + (y % 3) - 1);
    ctx.stroke();
  }

  cacheGedebogTex = new THREE.CanvasTexture(canvas);
  cacheGedebogTex.colorSpace = THREE.SRGBColorSpace;
  cacheGedebogTex.wrapS = THREE.RepeatWrapping;
  cacheGedebogTex.wrapT = THREE.RepeatWrapping;
  return cacheGedebogTex;
}

function buatTeksturJatiUkir(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheJatiUkirTex) return cacheJatiUkirTex;

  const w = 512;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#2a160c');
  grad.addColorStop(0.5, '#422313');
  grad.addColorStop(1, '#221108');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Ukiran sulur lung-lungan prada emas sepanjang balok gawangan
  ctx.strokeStyle = 'rgba(232, 184, 82, 0.52)';
  ctx.lineWidth = 2.4;
  for (let x = 16; x < w - 16; x += 48) {
    ctx.beginPath();
    ctx.arc(x + 24, h / 2, 16, 0, Math.PI * 1.45);
    ctx.stroke();

    ctx.fillStyle = 'rgba(218, 86, 42, 0.45)';
    ctx.beginPath();
    ctx.arc(x + 24, h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  cacheJatiUkirTex = new THREE.CanvasTexture(canvas);
  cacheJatiUkirTex.colorSpace = THREE.SRGBColorSpace;
  cacheJatiUkirTex.wrapS = THREE.RepeatWrapping;
  cacheJatiUkirTex.wrapT = THREE.RepeatWrapping;
  return cacheJatiUkirTex;
}

export class WayangStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;

  private panggungGrup = new THREE.Group();
  private sriRama!: WayangSriRamaRig;
  private kidang!: KidangKencanaRig;
  private gunungan!: THREE.Group;
  private panahTerbang!: THREE.Group;
  private blencongGrup!: THREE.Group;
  private nyalaIntiMesh: THREE.Mesh | null = null;
  private haloApiMesh: THREE.Mesh | null = null;
  private simpinganList: THREE.Group[] = [];
  private cempalaPivot: THREE.Group | null = null;
  private kepyakPlates: THREE.Mesh[] = [];
  private taliAtasMesh: THREE.Mesh | null = null;
  private taliBawahMesh: THREE.Mesh | null = null;
  private panahBusurGrup: THREE.Object3D | null = null;
  private mataPanahBusurMat: THREE.MeshStandardMaterial | null = null;
  private kidangEkorGrup: THREE.Object3D | null = null;
  private kidangTelingaGrup: THREE.Object3D | null = null;
  private bayanganRama: THREE.Mesh | null = null;
  private bayanganKidang: THREE.Mesh | null = null;
  private bayanganGunungan: THREE.Mesh | null = null;
  private impakCincin: THREE.Mesh | null = null;

  private lampuBlencong!: THREE.SpotLight;
  private nyalaApi!: THREE.PointLight;
  private ambientLight!: THREE.HemisphereLight;
  private moodCahaya: MoodPanggungWayang = 'blencong';
  private baseApiIntensity = 2.8;

  private rafId: number | null = null;
  private loopAktif = true;
  private loopSiapMulai = false;
  private destroyed = false;
  private abortCtrl = new AbortController();
  private stopObservasi: (() => void) | null = null;
  private cancelMulaiLoop: (() => void) | null = null;
  private lastLoopMs = 0;

  private targetRamaX = 0.92;
  private targetKidangX = -1.16;
  private baseGununganX = 2.04;
  private targetSabetan = 0;
  private cempalaStrikeImpulse = 0;
  private impakPulse = 0;
  private panahAktif = false;
  private progresPanah = 0;
  private panahDari: [number, number, number] = [0.4, 0.36, 0.22];
  private panahKe: [number, number, number] = [-1.0, -0.25, 0.16];

  private gesturAktif = false;
  private targetRamaLiftY = 0;
  private targetRamaZ = 0.14;
  private targetRamaYawY = -0.05;
  private targetRamaTiltZ = 0;
  private targetLenganKananZ = -0.34;
  private targetSikuKananZ = 0.56;
  private targetLenganKiriZ = 0.4;
  private targetSikuKiriZ = -0.88;
  private targetTarikBusur = 0;
  private currentTarikBusur = 0;
  private targetKidangLiftY = 0;
  private targetKidangZ = 0.12;
  private targetKidangYawY = Math.PI - 0.04;
  private targetKidangTiltZ = 0;
  private targetKidangNeckZ = 0;
  private targetKidangEarPerk = 0;
  private targetKidangTailWag = 0;
  private targetGununganSwayZ = 0;
  private targetGununganLiftY = 0;
  private targetBlencongBoost = 0;
  private manualSolahY = 0;
  private manualDepthZ = 0.14;
  private manualWalikan = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0805);
    this.scene.fog = new THREE.FogExp2(0x0c0805, 0.048);

    this.camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 50);
    this.camera.position.set(0, 0.36, 6.24);
    this.camera.lookAt(0, 0.28, 0);

    this.renderer = createSafeWebGLRenderer(container, {
      alpha: false,
      antialias: true,
      shadows: false,
    });
    if (!this.renderer) return;

    void applyStudioHDR(this.renderer, this.scene, {
      delayMs: 120,
      signal: this.abortCtrl.signal,
    });

    this.bangunPencahayaan();
    this.bangunPanggungKelir();
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
      () => !this.destroyed && Boolean(this.renderer),
      () => {
        this.loopSiapMulai = true;
        if (this.loopAktif && this.rafId === null) {
          this.loop();
        }
      },
    );
  }

  private bangunPencahayaan(): void {
    this.ambientLight = new THREE.HemisphereLight(0xffdfb0, 0x1a1008, 0.74);
    this.scene.add(this.ambientLight);

    // Sorot utama lampu minyak kelapa Blencong (tanpa shadow map dinamis berat agar 60fps mulus)
    this.lampuBlencong = new THREE.SpotLight(0xffb84d, 9.2, 18, Math.PI * 0.44, 0.58, 1.2);
    this.lampuBlencong.position.set(0, 1.75, 2.55);
    this.lampuBlencong.target.position.set(0, 0.18, -0.3);
    this.scene.add(this.lampuBlencong);
    this.scene.add(this.lampuBlencong.target);

    // PointLight api Blencong yang berkedip halus
    this.nyalaApi = new THREE.PointLight(0xff9429, 3.0, 9.5);
    this.nyalaApi.position.set(0, 1.56, 1.38);
    this.scene.add(this.nyalaApi);

    // Rim light hangat dari sisi belakang kelir agar siluet krawangan wayang bersinar
    const backRim = new THREE.DirectionalLight(0xffae42, 1.55);
    backRim.position.set(0, 0.9, -2.5);
    this.scene.add(backRim);

    // Fill light lembut dari depan agar pahatan prada emas tetap tajam
    const frontFill = new THREE.DirectionalLight(0xffe9c4, 0.95);
    frontFill.position.set(1.8, 1.2, 4.2);
    this.scene.add(frontFill);
  }

  private bangunPanggungKelir(): void {
    this.scene.add(this.panggungGrup);

    const jatiTex = buatTeksturJatiUkir();
    const gedebogTex = buatTeksturGedebogPisang();

    const kayuJatiUkirMat = new THREE.MeshStandardMaterial({
      color: 0x3b2011,
      map: jatiTex,
      roughness: 0.42,
      metalness: 0.2,
    });

    const lisPradaMat = new THREE.MeshStandardMaterial({
      color: 0xe5b54e,
      roughness: 0.25,
      metalness: 0.84,
    });

    // 1. Layar Kain Blacu (Kelir Utama) dengan Plisir Soga & Tumpal Emas
    const layarGeo = new THREE.PlaneGeometry(6.8, 3.25);
    const layarMat = new THREE.MeshStandardMaterial({
      color: 0xfff5de,
      map: buatTeksturLayarBlacu(),
      roughness: 0.82,
      metalness: 0.04,
    });
    const layarKelir = new THREE.Mesh(layarGeo, layarMat);
    layarKelir.position.set(0, 0.45, -0.25);
    layarKelir.receiveShadow = true;
    this.panggungGrup.add(layarKelir);

    // 2. Bingkai Gawangan Jati Ukir Keraton (Balok Atas, Tiang Samping Berprofil, Umpak & Lis Prada)
    const palangAtas = new THREE.Mesh(new THREE.BoxGeometry(7.45, 0.24, 0.3), kayuJatiUkirMat);
    palangAtas.position.set(0, 2.15, -0.22);
    this.panggungGrup.add(palangAtas);

    const lisAtas = new THREE.Mesh(new THREE.BoxGeometry(7.35, 0.038, 0.32), lisPradaMat);
    lisAtas.position.set(0, 2.02, -0.22);
    this.panggungGrup.add(lisAtas);

    // Mahkota Lung-Lungan di Puncak Tengah Gawangan
    const mahkotaGawangan = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.032, 10, 28, Math.PI),
      lisPradaMat,
    );
    mahkotaGawangan.position.set(0, 2.26, -0.18);
    this.panggungGrup.add(mahkotaGawangan);

    for (const side of [-1, 1]) {
      const tiangGrup = new THREE.Group();
      tiangGrup.position.set(side * 3.52, 0.35, -0.22);

      const tiangUtama = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.15, 3.65, 20),
        kayuJatiUkirMat,
      );
      tiangGrup.add(tiangUtama);

      // Gelang-gelang ukir kuningan pada tiang gawangan
      for (const yRing of [-1.2, 0, 1.2, 1.68]) {
        const gelangTiang = new THREE.Mesh(
          new THREE.TorusGeometry(0.148, 0.02, 10, 24),
          lisPradaMat,
        );
        gelangTiang.rotation.x = Math.PI / 2;
        gelangTiang.position.y = yRing;
        tiangGrup.add(gelangTiang);
      }

      // Umpak batu andesit di kaki tiang gawangan
      const umpak = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.24, 0.32, 8),
        new THREE.MeshStandardMaterial({ color: 0x242220, roughness: 0.78 }),
      );
      umpak.position.y = -1.78;
      tiangGrup.add(umpak);

      this.panggungGrup.add(tiangGrup);
    }

    // Tali Pluntur Pengikat Layar Kelir ke Bingkai Gawangan
    for (let px = -3.1; px <= 3.1; px += 0.62) {
      const plunturAtas = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6),
        lisPradaMat,
      );
      plunturAtas.position.set(px, 1.98, -0.22);
      this.panggungGrup.add(plunturAtas);
    }

    // 3. Dua Batang Gedebog Pisang Bertingkat, Umpak Tiang & Plangkan Penyangga di Panggung Pendopo
    const gedebogMat = new THREE.MeshStandardMaterial({
      color: 0x566e34,
      map: gedebogTex,
      roughness: 0.74,
      metalness: 0.05,
    });

    // Alas panggung kayu jati gelap agar Kothak, Plangkan & Umpak bertumpu mantap tanpa mengambang
    const lantaiPanggung = new THREE.Mesh(
      new THREE.BoxGeometry(7.95, 0.24, 1.56),
      kayuJatiUkirMat,
    );
    lantaiPanggung.position.set(0, -1.53, 0.24);
    lantaiPanggung.receiveShadow = true;
    this.panggungGrup.add(lantaiPanggung);

    const lisPanggung = new THREE.Mesh(
      new THREE.BoxGeometry(7.98, 0.04, 0.06),
      lisPradaMat,
    );
    lisPanggung.position.set(0, -1.425, 1.0);
    this.panggungGrup.add(lisPanggung);

    // Umpak landasan tiang Kelir kiri-kanan
    for (const ux of [-3.52, 3.52]) {
      const umpak = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.16, 0.32),
        kayuJatiUkirMat,
      );
      umpak.position.set(ux, -1.33, -0.22);
      const sabukUmpak = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.03, 0.34),
        lisPradaMat,
      );
      sabukUmpak.position.set(ux, -1.26, -0.22);
      this.panggungGrup.add(umpak, sabukUmpak);
    }

    // Tiga penyangga plangkan/jagrag tersembunyi rapi tepat di bawah gedebog hingga lantai panggung
    for (const px of [-2.35, 0, 2.35]) {
      const plangkan = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.22, 0.38),
        kayuJatiUkirMat,
      );
      plangkan.position.set(px, -1.32, 0.12);
      this.panggungGrup.add(plangkan);
    }

    const gedebogAtas = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.19, 7.1, 24),
      gedebogMat,
    );
    gedebogAtas.rotation.z = Math.PI / 2;
    gedebogAtas.position.set(0, -1.04, 0.08);
    gedebogAtas.receiveShadow = true;
    this.panggungGrup.add(gedebogAtas);

    const gedebogBawah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.17, 7.25, 24),
      gedebogMat,
    );
    gedebogBawah.rotation.z = Math.PI / 2;
    gedebogBawah.position.set(0, -1.24, 0.24);
    gedebogBawah.receiveShadow = true;
    this.panggungGrup.add(gedebogBawah);

    // Sabuk pengikat bambu pada batang gedebog
    for (const gx of [-2.8, -1.4, 0, 1.4, 2.8]) {
      const ikat = new THREE.Mesh(
        new THREE.TorusGeometry(0.186, 0.015, 8, 24),
        lisPradaMat,
      );
      ikat.rotation.y = Math.PI / 2;
      ikat.position.set(gx, -1.04, 0.08);
      this.panggungGrup.add(ikat);
    }

    // 4. Kothak Wayang Kayu Jati Ukir + Kepyak Kuningan Ayun & Cempala Dalang Berengsel
    const kothakGrup = new THREE.Group();
    kothakGrup.position.set(-2.68, -1.09, 0.54);
    kothakGrup.rotation.y = -0.26;

    const kothakBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.26, 0.62, 0.62),
      kayuJatiUkirMat,
    );
    kothakBody.castShadow = true;
    kothakGrup.add(kothakBody);

    const kothakRim = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.06, 0.66),
      lisPradaMat,
    );
    kothakRim.position.y = 0.3;
    kothakGrup.add(kothakRim);

    // Panel ukiran kuningan di sisi depan Kothak Wayang agar berdimensi saat disorot Blencong
    const panelDepan = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.34, 0.02),
      lisPradaMat,
    );
    panelDepan.position.set(0, -0.02, 0.315);
    const panelDalam = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.24, 0.028),
      new THREE.MeshStandardMaterial({ color: 0x5c361d, roughness: 0.45, metalness: 0.14 }),
    );
    panelDalam.position.set(0, -0.02, 0.32);
    kothakGrup.add(panelDepan, panelDalam);

    // Kaki sudut Kothak agar dudukan ke panggung terlihat presisi
    for (const [fx, fz] of [
      [-0.54, -0.22],
      [0.54, -0.22],
      [-0.54, 0.22],
      [0.54, 0.22],
    ]) {
      const kaki = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.04, 0.1),
        lisPradaMat,
      );
      kaki.position.set(fx, -0.31, fz);
      kothakGrup.add(kaki);
    }

    // Batang gantungan + 4 Keping Kepyak / Keprak Kuningan yang bergetar saat Sabetan
    const kepyakBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.04, 0.26),
      lisPradaMat,
    );
    kepyakBar.position.set(0.66, 0.19, 0.08);
    kothakGrup.add(kepyakBar);

    this.kepyakPlates = [];
    for (let k = 0; k < 4; k++) {
      const keping = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.23, 0.17),
        lisPradaMat,
      );
      keping.position.set(0.665 + k * 0.016, 0.05 - k * 0.008, 0.08);
      keping.rotation.z = 0.04 + k * 0.02;
      this.kepyakPlates.push(keping);
      kothakGrup.add(keping);
    }

    // Cempala (Pemukul Kayu Jati Dalang) berengsel di bibir Kothak untuk memukul Kepyak
    this.cempalaPivot = new THREE.Group();
    this.cempalaPivot.position.set(0.52, 0.33, 0.14);
    const tangkaiCempala = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.02, 0.22, 10),
      kayuJatiUkirMat,
    );
    tangkaiCempala.rotation.z = Math.PI * 0.38;
    tangkaiCempala.position.set(-0.08, 0.06, 0);
    const kepalaCempala = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.036, 0.1, 8, 12),
      kayuJatiUkirMat,
    );
    kepalaCempala.rotation.z = Math.PI * 0.42;
    kepalaCempala.position.set(0.03, 0.02, 0);
    const ringCempala = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.008, 6, 12),
      lisPradaMat,
    );
    ringCempala.rotation.y = Math.PI / 2;
    ringCempala.position.set(0.03, 0.02, 0);
    this.cempalaPivot.add(tangkaiCempala, kepalaCempala, ringCempala);
    kothakGrup.add(this.cempalaPivot);

    this.panggungGrup.add(kothakGrup);

    // 5. Lampu Minyak Kelapa Kyai Blencong Bersayap Garuda + Rantai Gantung dari Palang Atas
    const konsolGantung = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.07, 1.0),
      kayuJatiUkirMat,
    );
    konsolGantung.position.set(0, 2.13, 0.24);
    const rantaiBlencong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.56, 8),
      lisPradaMat,
    );
    rantaiBlencong.position.set(0, 1.84, 0.72);
    this.panggungGrup.add(konsolGantung, rantaiBlencong);

    const blencongData = buildBlencongWayang3D();
    this.blencongGrup = blencongData.grup;
    this.nyalaIntiMesh = blencongData.nyalaInti;
    this.haloApiMesh = blencongData.haloApi;
    this.blencongGrup.scale.setScalar(0.62);
    this.blencongGrup.position.set(0, 1.38, 0.72);
    this.blencongGrup.rotation.y = Math.PI;
    this.panggungGrup.add(this.blencongGrup);

    // Kerucut berkas cahaya hangat Blencong (Volumetric Light Cone)
    const coneGeo = new THREE.ConeGeometry(2.65, 3.25, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffb84a,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(0, 0.14, 0.24);
    lightCone.rotation.x = -0.22;
    this.panggungGrup.add(lightCone);

    // Bayangan Proyeksi Dinamis Wayang di Layar Kelir (Gradien Radial Halus Tanpa Tepi Kotak)
    const buatBayanganMat = (op: number) => {
      const cv = document.createElement('canvas');
      cv.width = 128;
      cv.height = 128;
      const g2d = cv.getContext('2d');
      if (g2d) {
        const grad = g2d.createRadialGradient(64, 64, 8, 64, 64, 62);
        grad.addColorStop(0, 'rgba(20, 12, 6, 0.92)');
        grad.addColorStop(0.45, 'rgba(20, 12, 6, 0.56)');
        grad.addColorStop(0.78, 'rgba(20, 12, 6, 0.18)');
        grad.addColorStop(1, 'rgba(20, 12, 6, 0)');
        g2d.fillStyle = grad;
        g2d.fillRect(0, 0, 128, 128);
      }
      const tex = new THREE.CanvasTexture(cv);
      return new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: op,
        depthWrite: false,
      });
    };
    this.bayanganRama = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.85), buatBayanganMat(0.32));
    this.bayanganRama.position.set(0.92, 0.04, -0.236);
    this.bayanganKidang = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.02), buatBayanganMat(0.3));
    this.bayanganKidang.position.set(-1.16, -0.34, -0.236);
    this.bayanganGunungan = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.88), buatBayanganMat(0.24));
    this.bayanganGunungan.position.set(2.04, 0.02, -0.238);
    this.panggungGrup.add(this.bayanganGunungan, this.bayanganRama, this.bayanganKidang);

    // 6. Simpingan Wayang Kiri & Kanan (Tersusun Melengkung Rapi di Gedebog Sisi Luar)
    const warnaSimpingan = [0x9e2a1c, 0xc87d28, 0x7a1f16, 0xb55d19];
    this.simpinganList = [];
    for (let i = 0; i < 4; i++) {
      const skala = 0.66 + i * 0.045;
      const ySimpingan = -0.18 + i * 0.045;
      const wKiri = buildSimpinganWayang3D(warnaSimpingan[i], skala);
      wKiri.position.set(-3.24 + i * 0.25, ySimpingan, 0.04 + i * 0.012);
      wKiri.rotation.y = 0.08;
      wKiri.rotation.z = -0.05 + i * 0.014;
      this.simpinganList.push(wKiri);
      this.panggungGrup.add(wKiri);

      const wKanan = buildSimpinganWayang3D(warnaSimpingan[(i + 1) % 4], skala);
      wKanan.scale.x *= -1;
      wKanan.position.set(3.24 - i * 0.25, ySimpingan, 0.04 + i * 0.012);
      wKanan.rotation.y = -0.08;
      wKanan.rotation.z = 0.05 - i * 0.014;
      this.simpinganList.push(wKanan);
      this.panggungGrup.add(wKanan);
    }

    // 7. Gunungan (Kayon Surakarta) Tertancap di Gedebog Atas Tanpa Bertabrakan dengan Tokoh
    this.gunungan = buildGunungan3D();
    this.gunungan.scale.setScalar(0.82);
    this.gunungan.position.set(2.04, -0.13, -0.03);
    this.gunungan.rotation.y = -0.08;
    this.panggungGrup.add(this.gunungan);

    // 8. Wayang Kulit Sri Rama (Tokoh Utama Ksatria Pemanah Berdiri Tegas di Gedebog Atas)
    this.sriRama = buildSriRamaWayang3D();
    this.sriRama.root.scale.setScalar(0.86);
    this.sriRama.root.position.set(0.92, 0.04, 0.14);
    this.taliAtasMesh = (this.sriRama.busur.getObjectByName('busur-tali-atas') as THREE.Mesh) ?? null;
    this.taliBawahMesh = (this.sriRama.busur.getObjectByName('busur-tali-bawah') as THREE.Mesh) ?? null;
    this.panahBusurGrup = this.sriRama.busur.getObjectByName('busur-panah') ?? null;
    const mataPanahObj = this.sriRama.busur.getObjectByName('busur-mata-panah') as THREE.Mesh | undefined;
    this.mataPanahBusurMat = (mataPanahObj?.material as THREE.MeshStandardMaterial) ?? null;
    this.panggungGrup.add(this.sriRama.root);

    // 9. Wayang Kulit Kijang Kencana (Berdiri Menapak Rapi di Gedebog Atas & Menghadap Sri Rama)
    this.kidang = buildKidangKencana3D();
    this.kidang.root.scale.setScalar(0.8);
    this.kidang.root.position.set(-1.16, -0.57, 0.12);
    this.kidang.root.rotation.y = Math.PI - 0.04;
    // Pangkas panjang gapit khusus panggung agar ujungnya tertancap tepat di batang gedebog tanpa menembus lantai
    const gapitKidang = this.kidang.badan.children.find(
      (c): c is THREE.Mesh =>
        c instanceof THREE.Mesh && c.geometry instanceof THREE.CylinderGeometry && Math.abs(c.position.y + 0.35) < 0.02,
    );
    if (gapitKidang) {
      gapitKidang.scale.y = 0.62;
      gapitKidang.position.y = -0.18;
    }
    this.kidangEkorGrup = this.kidang.badan.getObjectByName('kidang-ekor') ?? null;
    this.kidangTelingaGrup = this.kidang.leherKepala.getObjectByName('kidang-telinga') ?? null;
    this.panggungGrup.add(this.kidang.root);

    // 10. Anak Panah Pusaka Guwawijaya & Cincin Kilau Benturan Sihir Marica
    this.panahTerbang = new THREE.Group();
    const batang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.78, 10),
      lisPradaMat,
    );
    batang.rotation.z = Math.PI / 2;
    const mataPanah = new THREE.Mesh(
      new THREE.ConeGeometry(0.042, 0.14, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffe484,
        emissive: 0xff6f1f,
        emissiveIntensity: 1.2,
        metalness: 0.9,
        roughness: 0.18,
      }),
    );
    mataPanah.rotation.z = Math.PI / 2;
    mataPanah.position.x = -0.44;

    const buluPanah = new THREE.Mesh(
      new THREE.ConeGeometry(0.036, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: 0xd9381e, roughness: 0.4 }),
    );
    buluPanah.rotation.z = -Math.PI / 2;
    buluPanah.position.x = 0.36;

    this.panahTerbang.add(batang, mataPanah, buluPanah);
    this.panahTerbang.visible = false;
    this.panggungGrup.add(this.panahTerbang);

    this.impakCincin = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.022, 8, 28),
      new THREE.MeshBasicMaterial({
        color: 0xffd36b,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.impakCincin.visible = false;
    this.panggungGrup.add(this.impakCincin);
  }

  public aturPosisiTokoh(ramaNorm: number, kidangNorm: number): void {
    this.targetRamaX = THREE.MathUtils.clamp(ramaNorm, -0.85, 0.85) * 2.18;
    this.targetKidangX = THREE.MathUtils.clamp(kidangNorm, -0.85, 0.85) * 2.18;
  }

  public terapkanGesturPanggung(opts: { kemiringan?: number; intensitasSabetan?: number }): void {
    if (typeof opts.kemiringan === 'number') {
      const rel = Math.atan2(
        Math.sin(opts.kemiringan + Math.PI / 2),
        Math.cos(opts.kemiringan + Math.PI / 2),
      );
      this.gesturAktif = true;
      this.targetLenganKananZ = THREE.MathUtils.clamp(-0.34 + rel * 0.55, -1.25, 0.55);
      this.targetSikuKananZ = THREE.MathUtils.clamp(0.56 - rel * 0.35, 0.12, 1.25);
    }
    if (typeof opts.intensitasSabetan === 'number' && opts.intensitasSabetan > 0.5) {
      this.picuSabetanWayang();
    }
  }

  public terapkanGesturPakeliran(k: {
    aktif: boolean;
    ramaPosNorm: number;
    kidangPosNorm: number;
    ramaLiftY: number;
    kidangLiftY: number;
    ramaZ: number;
    kidangZ: number;
    ramaYawY: number;
    kidangYawY: number;
    ramaTiltZ: number;
    kidangTiltZ: number;
    kidangNeckZ: number;
    kidangEarPerk: number;
    kidangTailWag: number;
    ramaLenganKananZ: number;
    ramaSikuKananZ: number;
    ramaLenganKiriZ: number;
    ramaSikuKiriZ: number;
    tarikBusur: number;
    gununganSwayZ: number;
    gununganLiftY: number;
    blencongBoost: number;
    sabetanIntensitas: number;
    picuSabetan: boolean;
    picuPanah: boolean;
  }): void {
    if (!k.aktif) {
      this.matikanGesturPakeliran();
      return;
    }
    this.gesturAktif = true;
    this.aturPosisiTokoh(k.ramaPosNorm, k.kidangPosNorm);
    this.targetRamaLiftY = THREE.MathUtils.clamp(k.ramaLiftY, -0.08, 0.34);
    this.targetKidangLiftY = THREE.MathUtils.clamp(k.kidangLiftY, -0.06, 0.4);
    this.targetRamaZ = THREE.MathUtils.clamp(k.ramaZ, -0.08, 0.34);
    this.targetKidangZ = THREE.MathUtils.clamp(k.kidangZ, -0.08, 0.34);
    this.targetRamaYawY = k.ramaYawY;
    this.targetKidangYawY = k.kidangYawY;
    this.targetRamaTiltZ = THREE.MathUtils.clamp(k.ramaTiltZ, -0.38, 0.38);
    this.targetKidangTiltZ = THREE.MathUtils.clamp(k.kidangTiltZ, -0.42, 0.42);
    this.targetKidangNeckZ = THREE.MathUtils.clamp(k.kidangNeckZ, -0.48, 0.54);
    this.targetKidangEarPerk = THREE.MathUtils.clamp(k.kidangEarPerk, -0.25, 0.5);
    this.targetKidangTailWag = THREE.MathUtils.clamp(k.kidangTailWag, -0.48, 0.48);
    this.targetLenganKananZ = THREE.MathUtils.clamp(k.ramaLenganKananZ, -1.35, 0.55);
    this.targetSikuKananZ = THREE.MathUtils.clamp(k.ramaSikuKananZ, 0.12, 1.35);
    this.targetLenganKiriZ = THREE.MathUtils.clamp(k.ramaLenganKiriZ, -0.35, 1.25);
    this.targetSikuKiriZ = THREE.MathUtils.clamp(k.ramaSikuKiriZ, -1.35, 0.25);
    this.targetTarikBusur = THREE.MathUtils.clamp(k.tarikBusur, 0, 1);
    this.targetGununganSwayZ = THREE.MathUtils.clamp(k.gununganSwayZ, -0.32, 0.32);
    this.targetGununganLiftY = THREE.MathUtils.clamp(k.gununganLiftY, -0.05, 0.2);
    this.targetBlencongBoost = THREE.MathUtils.clamp(k.blencongBoost, 0, 1);

    if (k.picuSabetan) {
      this.picuSabetanWayang();
    } else if (k.sabetanIntensitas > 0.35) {
      this.targetSabetan = Math.max(this.targetSabetan, k.sabetanIntensitas * 0.55);
    }

    if (k.picuPanah) {
      this.picuPanahRama();
    }
  }

  public matikanGesturPakeliran(): void {
    this.gesturAktif = false;
    this.targetRamaLiftY = 0;
    this.targetKidangLiftY = 0;
    this.targetRamaZ = 0.14;
    this.targetKidangZ = 0.12;
    this.targetRamaYawY = -0.05;
    this.targetKidangYawY = Math.PI - 0.04;
    this.targetRamaTiltZ = 0;
    this.targetKidangTiltZ = 0;
    this.targetKidangNeckZ = 0;
    this.targetKidangEarPerk = 0;
    this.targetKidangTailWag = 0;
    this.targetLenganKananZ = -0.34;
    this.targetSikuKananZ = 0.56;
    this.targetLenganKiriZ = 0.4;
    this.targetSikuKiriZ = -0.88;
    this.targetTarikBusur = 0;
    this.targetGununganSwayZ = 0;
    this.targetGununganLiftY = 0;
    this.targetBlencongBoost = 0;
  }

  public aturPoseManual(opts: {
    solahY?: number;
    depthZ?: number;
    walikan?: boolean;
  }): void {
    if (typeof opts.solahY === 'number') {
      this.manualSolahY = THREE.MathUtils.clamp(opts.solahY, -0.05, 0.34);
    }
    if (typeof opts.depthZ === 'number') {
      this.manualDepthZ = THREE.MathUtils.clamp(opts.depthZ, -0.08, 0.34);
    }
    if (typeof opts.walikan === 'boolean') {
      this.manualWalikan = opts.walikan;
    }
  }

  public aturGununganBabak(indeksBabak: number): void {
    this.baseGununganX = [2.04, 0.02, 2.04, -2.04][indeksBabak] ?? 2.04;
  }

  public aturBabak(indeksBabak: number): void {
    const posRama = [0.92, 0.72, 1.05, 0.64][indeksBabak] ?? 0.92;
    const posKidang = [-1.16, -0.78, -1.24, -0.92][indeksBabak] ?? -1.16;
    this.targetRamaX = posRama;
    this.targetKidangX = posKidang;
    this.aturGununganBabak(indeksBabak);
    this.picuSabetanWayang();
  }

  public aturPosisiWayang(normX: number): void {
    const clamped = Math.max(-1, Math.min(1, normX));
    this.targetRamaX = 0.35 + clamped * 0.95;
    this.targetKidangX = -1.05 + clamped * 0.55;
  }

  public picuSabetanWayang(): void {
    this.targetSabetan = 1;
    this.cempalaStrikeImpulse = 1;
  }

  public picuPanahRama(): void {
    this.panahAktif = true;
    this.progresPanah = 0;
    this.targetTarikBusur = Math.max(this.targetTarikBusur, 0.95);
    const yaw = this.sriRama ? this.sriRama.root.rotation.y : 0;
    const arahX = Math.cos(yaw) >= 0 ? -1 : 1;
    const ramaX = this.sriRama ? this.sriRama.root.position.x : this.targetRamaX;
    const ramaY = this.sriRama ? this.sriRama.root.position.y : 0.04;
    const kidangX = this.kidang ? this.kidang.root.position.x : this.targetKidangX;
    const kidangY = this.kidang ? this.kidang.root.position.y : -0.57;

    this.panahDari = [ramaX + arahX * 0.46, ramaY + 0.34, this.sriRama?.root.position.z ?? 0.18];
    this.panahKe = [kidangX - arahX * 0.12, kidangY + 0.18, this.kidang?.root.position.z ?? 0.14];
    this.panahTerbang.visible = true;
  }

  public aturMoodCahaya(mood: MoodPanggungWayang): void {
    this.moodCahaya = mood;
    if (!this.lampuBlencong || !this.ambientLight || !this.nyalaApi) return;

    if (mood === 'kelir') {
      this.ambientLight.intensity = 0.28;
      this.lampuBlencong.color.setHex(0xff9b35);
      this.lampuBlencong.intensity = 11.6;
      this.baseApiIntensity = 3.8;
    } else if (mood === 'sorot') {
      this.ambientLight.intensity = 1.42;
      this.lampuBlencong.color.setHex(0xfff4de);
      this.lampuBlencong.intensity = 7.8;
      this.baseApiIntensity = 2.0;
    } else {
      this.ambientLight.intensity = 0.74;
      this.lampuBlencong.color.setHex(0xffb84d);
      this.lampuBlencong.intensity = 9.2;
      this.baseApiIntensity = 2.8;
    }
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 640, 1);
    const h = Math.max(this.container.clientHeight || 360, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(40, this.camera.aspect, 1.45, 56);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private perbaruiTarikanBusur(draw: number): void {
    const pull = THREE.MathUtils.clamp(draw, 0, 1) * 0.22;
    const nockX = 0.12 + pull;
    if (this.taliAtasMesh) {
      const len = Math.hypot(pull, 0.58);
      this.taliAtasMesh.position.set(0.12 + pull * 0.5, 0.29, 0);
      this.taliAtasMesh.scale.set(1, len, 1);
      this.taliAtasMesh.rotation.z = Math.atan2(pull, 0.58);
    }
    if (this.taliBawahMesh) {
      const len = Math.hypot(pull, 0.58);
      this.taliBawahMesh.position.set(0.12 + pull * 0.5, -0.29, 0);
      this.taliBawahMesh.scale.set(1, len, 1);
      this.taliBawahMesh.rotation.z = -Math.atan2(pull, 0.58);
    }
    if (this.panahBusurGrup) {
      this.panahBusurGrup.position.x = nockX - 0.12;
      this.panahBusurGrup.visible = !this.panahAktif || this.progresPanah > 0.3;
    }
    if (this.mataPanahBusurMat) {
      this.mataPanahBusurMat.emissiveIntensity = 0.45 + draw * 1.45;
    }
  }

  private perbaruiBayanganKelir(
    bayangan: THREE.Mesh | null,
    objX: number,
    objY: number,
    objZ: number,
    yawY: number,
    tiltZ: number,
    baseScaleX: number,
    baseScaleY: number,
  ): void {
    if (!bayangan) return;
    const pembesaranZ = 1 + (objZ - 0.1) * 0.72;
    const projX = THREE.MathUtils.clamp(objX * (0.98 + (objZ - 0.1) * 0.35), -2.75, 2.75);
    const projY = THREE.MathUtils.clamp(objY * 0.96 - (1.38 - objY) * (objZ * 0.14), -0.95, 1.35);
    const pipihYaw = 0.36 + 0.64 * Math.abs(Math.cos(yawY));
    bayangan.position.set(projX, projY, -0.236);
    bayangan.rotation.z = tiltZ;
    bayangan.scale.set(
      baseScaleX * pipihYaw * pembesaranZ,
      baseScaleY * pembesaranZ,
      1,
    );
    const mat = bayangan.material as THREE.MeshBasicMaterial;
    const kelirFactor = this.moodCahaya === 'kelir' ? 1.45 : this.moodCahaya === 'sorot' ? 0.55 : 1;
    mat.opacity = THREE.MathUtils.clamp((0.36 - (objZ - 0.08) * 0.25) * kelirFactor, 0.12, 0.62);
  }

  private loop = (): void => {
    if (!this.renderer || !this.loopAktif) {
      this.rafId = null;
      return;
    }
    this.rafId = window.requestAnimationFrame(this.loop);

    const nowMs = performance.now();
    const dt =
      this.lastLoopMs > 0
        ? Math.min(Math.max((nowMs - this.lastLoopMs) / 1000, 0.008), 0.05)
        : 1 / 60;
    this.lastLoopMs = nowMs;
    const t = nowMs * 0.001;
    const dampFast = 1 - Math.exp(-11 * dt);
    const dampSmooth = 1 - Math.exp(-7 * dt);

    // Kedip api minyak kelapa Blencong & respon energi gestur / sabetan
    const faktorKedip = this.moodCahaya === 'sorot' ? 0.35 : 1;
    const flicker =
      (Math.sin(t * 7.4) * 0.42 + Math.cos(t * 12.1) * 0.22 + this.targetBlencongBoost * 1.15) *
      faktorKedip;
    this.nyalaApi.intensity = this.baseApiIntensity + flicker + this.targetSabetan * 1.1;
    this.blencongGrup.rotation.z = Math.sin(t * 1.4) * 0.025 + this.targetSabetan * 0.06;
    if (this.nyalaIntiMesh) {
      this.nyalaIntiMesh.scale.y = 1 + flicker * 0.18;
    }
    if (this.haloApiMesh) {
      const s = 1 + flicker * 0.1;
      this.haloApiMesh.scale.setScalar(s);
    }

    // 1. Gerak Dalang Mengayunkan Sri Rama (X, Y Solah, Z Kedalaman Kelir, Yaw Walikan & Dual Tuding)
    const dxRama = this.targetRamaX - this.sriRama.root.position.x;
    this.sriRama.root.position.x += dxRama * dampFast;
    const desiredRamaY = this.gesturAktif
      ? 0.04 + this.targetRamaLiftY + Math.sin(t * 2.4) * 0.015
      : 0.04 + this.manualSolahY + Math.sin(t * 2.2) * 0.022;
    this.sriRama.root.position.y += (desiredRamaY - this.sriRama.root.position.y) * dampFast;

    const desiredRamaZ = this.gesturAktif ? this.targetRamaZ : this.manualDepthZ;
    this.sriRama.root.position.z += (desiredRamaZ - this.sriRama.root.position.z) * dampSmooth;

    const idleRamaFacingRight = this.targetRamaX < this.targetKidangX - 0.14;
    const idleRamaBaseYaw = (this.manualWalikan ? !idleRamaFacingRight : idleRamaFacingRight)
      ? Math.PI - 0.05
      : -0.05;
    const desiredRamaYaw = this.gesturAktif
      ? this.targetRamaYawY
      : idleRamaBaseYaw + THREE.MathUtils.clamp(-dxRama * 0.26, -0.34, 0.34);
    this.sriRama.root.rotation.y += (desiredRamaYaw - this.sriRama.root.rotation.y) * dampFast;

    const sabetanWave = Math.sin(this.targetSabetan * Math.PI * 2) * 0.22;
    const desiredRamaTilt = (this.gesturAktif ? this.targetRamaTiltZ : Math.sin(t * 1.9) * 0.025) + sabetanWave;
    this.sriRama.root.rotation.z += (desiredRamaTilt - this.sriRama.root.rotation.z) * dampFast;

    const idleLenganKanan = -0.34 + Math.sin(t * 2.6) * 0.08 - this.targetSabetan * 0.48;
    const idleSikuKanan = 0.56 + Math.cos(t * 2.6) * 0.06 + this.targetSabetan * 0.32;
    const idleLenganKiri = 0.4 + Math.cos(t * 2.1) * 0.07 + this.targetSabetan * 0.35;
    const idleSikuKiri = -0.88 + Math.sin(t * 2.1) * 0.06 - this.targetSabetan * 0.24;

    const tLenganKanan = this.gesturAktif
      ? this.targetLenganKananZ - this.targetSabetan * 0.36
      : idleLenganKanan;
    const tSikuKanan = this.gesturAktif
      ? this.targetSikuKananZ + this.targetSabetan * 0.24
      : idleSikuKanan;
    const tLenganKiri = this.gesturAktif
      ? this.targetLenganKiriZ + this.targetSabetan * 0.28
      : idleLenganKiri;
    const tSikuKiri = this.gesturAktif ? this.targetSikuKiriZ : idleSikuKiri;

    this.sriRama.lenganKanan.rotation.z += (tLenganKanan - this.sriRama.lenganKanan.rotation.z) * dampFast;
    this.sriRama.sikuKanan.rotation.z += (tSikuKanan - this.sriRama.sikuKanan.rotation.z) * dampFast;
    this.sriRama.lenganKiri.rotation.z += (tLenganKiri - this.sriRama.lenganKiri.rotation.z) * dampFast;
    this.sriRama.sikuKiri.rotation.z += (tSikuKiri - this.sriRama.sikuKiri.rotation.z) * dampFast;

    // Tarikan tali busur & kilau anak panah siaga
    const goalBowDraw = this.panahAktif && this.progresPanah < 0.25 ? 0.92 : this.targetTarikBusur;
    this.currentTarikBusur += (goalBowDraw - this.currentTarikBusur) * dampFast;
    this.perbaruiTarikanBusur(this.currentTarikBusur);
    if (!this.gesturAktif && !this.panahAktif) {
      this.targetTarikBusur *= Math.pow(0.86, dt * 60);
    }

    // 2. Gerak Kidang Kencana (Tumpuan Sempurna di Gedebog, Melompat Solah, Kepala-Telinga-Ekor Berartikulasi)
    const dxKidang = this.targetKidangX - this.kidang.root.position.x;
    this.kidang.root.position.x += dxKidang * dampFast;
    const lompatIdle = Math.abs(Math.sin(t * 3.1)) * 0.065;
    const desiredKidangY = this.gesturAktif
      ? -0.57 + this.targetKidangLiftY + lompatIdle * 0.4
      : -0.57 + this.manualSolahY * 0.85 + lompatIdle;
    this.kidang.root.position.y += (desiredKidangY - this.kidang.root.position.y) * dampFast;

    const desiredKidangZ = this.gesturAktif
      ? this.targetKidangZ
      : THREE.MathUtils.clamp(this.manualDepthZ - 0.02, -0.1, 0.34);
    this.kidang.root.position.z += (desiredKidangZ - this.kidang.root.position.z) * dampSmooth;

    const idleKidangFacingLeft = this.targetKidangX <= this.targetRamaX + 0.14;
    const idleKidangBaseYaw = (this.manualWalikan ? !idleKidangFacingLeft : idleKidangFacingLeft)
      ? Math.PI - 0.04
      : 0.04;
    const desiredKidangYaw = this.gesturAktif
      ? this.targetKidangYawY
      : idleKidangBaseYaw + THREE.MathUtils.clamp(-dxKidang * 0.22, -0.28, 0.28);
    this.kidang.root.rotation.y += (desiredKidangYaw - this.kidang.root.rotation.y) * dampFast;

    const desiredNeckZ = this.gesturAktif ? this.targetKidangNeckZ : Math.sin(t * 3.4) * 0.09;
    this.kidang.leherKepala.rotation.z += (desiredNeckZ - this.kidang.leherKepala.rotation.z) * dampFast;

    if (this.kidangTelingaGrup) {
      const earTarget = this.gesturAktif ? this.targetKidangEarPerk : Math.sin(t * 5.2) * 0.12;
      this.kidangTelingaGrup.rotation.z += (earTarget - this.kidangTelingaGrup.rotation.z) * dampFast;
    }
    if (this.kidangEkorGrup) {
      const tailTarget = this.gesturAktif ? this.targetKidangTailWag : Math.sin(t * 4.4) * 0.2;
      this.kidangEkorGrup.rotation.z += (tailTarget - this.kidangEkorGrup.rotation.z) * dampFast;
    }

    const strideFactor = Math.max(0.24, Math.min(0.65, 0.34 + Math.abs(dxKidang) * 0.35 + (this.gesturAktif ? Math.max(0, this.targetKidangLiftY) : 0)));
    this.kidang.kakiDepan.rotation.z = Math.sin(t * 3.4) * strideFactor;
    this.kidang.kakiBelakang.rotation.z = -Math.sin(t * 3.4) * strideFactor;

    // 3. Gunungan Kayon menghindar otomatis agar tidak bertabrakan dengan Rama/Kidang + respons gestur
    let targetGununganX = this.baseGununganX;
    let targetGununganZ = -0.03;
    const minDist = Math.min(
      Math.abs(targetGununganX - this.sriRama.root.position.x),
      Math.abs(targetGununganX - this.kidang.root.position.x),
    );
    if (minDist < 0.72) {
      targetGununganZ = -0.095;
      const dorong = this.baseGununganX >= 0 ? 0.24 : -0.24;
      targetGununganX = THREE.MathUtils.clamp(this.baseGununganX + dorong, -2.18, 2.18);
    }
    this.gunungan.position.x += (targetGununganX - this.gunungan.position.x) * dampSmooth;
    this.gunungan.position.z += (targetGununganZ - this.gunungan.position.z) * dampSmooth;
    const gununganY = -0.13 + (this.gesturAktif ? this.targetGununganLiftY : 0);
    this.gunungan.position.y += (gununganY - this.gunungan.position.y) * dampSmooth;
    const gununganRot = Math.sin(t * 1.1) * 0.02 + (this.gesturAktif ? this.targetGununganSwayZ : 0);
    this.gunungan.rotation.z += (gununganRot - this.gunungan.rotation.z) * dampFast;

    // Simpingan samping bergetar lembut saat sabetan angin panggung
    for (let i = 0; i < this.simpinganList.length; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const sway = Math.sin(t * 2.2 + i) * 0.008 * this.targetSabetan;
      const baseTilt = side * (0.05 - Math.floor(i / 2) * 0.014);
      this.simpinganList[i].rotation.z = baseTilt + sway;
    }

    // 4. Animasi Pukulan Ganda Cempala & Getaran Kepyak Kuningan pada Sabetan
    if (this.cempalaPivot) {
      const doubleStrike =
        this.cempalaStrikeImpulse > 0.02
          ? Math.abs(Math.sin((1 - this.cempalaStrikeImpulse) * Math.PI * 2)) *
            this.cempalaStrikeImpulse *
            -0.56
          : 0;
      this.cempalaPivot.rotation.z = doubleStrike;
    }
    for (let k = 0; k < this.kepyakPlates.length; k++) {
      const kepyakRattle = Math.sin(t * 42 + k * 0.9) * this.cempalaStrikeImpulse * (0.14 - k * 0.018);
      this.kepyakPlates[k].rotation.z = 0.04 + k * 0.02 + kepyakRattle;
    }

    // 5. Proyeksi Bayangan Kulit Wayang di Kelir Secara Real-Time
    this.perbaruiBayanganKelir(
      this.bayanganRama,
      this.sriRama.root.position.x,
      this.sriRama.root.position.y + 0.08,
      this.sriRama.root.position.z,
      this.sriRama.root.rotation.y,
      this.sriRama.root.rotation.z,
      0.86,
      0.92,
    );
    this.perbaruiBayanganKelir(
      this.bayanganKidang,
      this.kidang.root.position.x,
      this.kidang.root.position.y + 0.2,
      this.kidang.root.position.z,
      this.kidang.root.rotation.y,
      this.kidang.root.rotation.z,
      0.84,
      0.86,
    );
    this.perbaruiBayanganKelir(
      this.bayanganGunungan,
      this.gunungan.position.x,
      this.gunungan.position.y + 0.14,
      this.gunungan.position.z,
      this.gunungan.rotation.y,
      this.gunungan.rotation.z,
      0.9,
      0.96,
    );

    const decayFast = Math.pow(0.9, dt * 60);
    this.targetSabetan *= decayFast;
    this.cempalaStrikeImpulse *= Math.pow(0.92, dt * 60);
    this.targetBlencongBoost *= Math.pow(0.92, dt * 60);

    // 6. Lesatan Panah Guwawijaya ke Tubuh Kijang Kencana & Cincin Kilau Benturan
    if (this.panahAktif) {
      this.progresPanah = Math.min(1, this.progresPanah + dt * 1.9);
      const x = THREE.MathUtils.lerp(this.panahDari[0], this.panahKe[0], this.progresPanah);
      const baseY = THREE.MathUtils.lerp(this.panahDari[1], this.panahKe[1], this.progresPanah);
      const y = baseY + Math.sin(this.progresPanah * Math.PI) * 0.28;
      const z = THREE.MathUtils.lerp(this.panahDari[2], this.panahKe[2], this.progresPanah);
      this.panahTerbang.position.set(x, y, z);

      const flyLeft = this.panahKe[0] <= this.panahDari[0];
      const slopeY = Math.cos(this.progresPanah * Math.PI) * 0.28 * Math.PI;
      const dxFlight = this.panahKe[0] - this.panahDari[0];
      this.panahTerbang.rotation.y = flyLeft ? 0 : Math.PI;
      this.panahTerbang.rotation.z =
        -Math.atan2(slopeY, Math.max(0.4, Math.abs(dxFlight))) * 0.65;

      if (this.progresPanah >= 1) {
        this.panahAktif = false;
        this.panahTerbang.visible = false;
        this.kidang.root.rotation.z = -0.34;
        this.impakPulse = 1;
        if (this.impakCincin) {
          this.impakCincin.position.set(
            this.kidang.root.position.x,
            this.kidang.root.position.y + 0.18,
            this.kidang.root.position.z + 0.08,
          );
          this.impakCincin.visible = true;
        }
      }
    } else {
      const goalKidangTilt = this.gesturAktif ? this.targetKidangTiltZ : 0;
      this.kidang.root.rotation.z +=
        (goalKidangTilt - this.kidang.root.rotation.z) * (this.gesturAktif ? dampFast : 1 - decayFast);
    }

    if (this.impakCincin) {
      if (this.impakPulse > 0.02) {
        this.impakPulse *= Math.pow(0.88, dt * 60);
        const expand = 1 + (1 - this.impakPulse) * 1.45;
        this.impakCincin.scale.setScalar(expand);
        (this.impakCincin.material as THREE.MeshBasicMaterial).opacity = this.impakPulse * 0.78;
      } else {
        this.impakCincin.visible = false;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.destroyed = true;
    this.loopAktif = false;
    this.abortCtrl.abort();
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
