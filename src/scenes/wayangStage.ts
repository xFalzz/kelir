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
  private targetRamaX = 0.72;
  private targetKidangX = -1.12;
  private targetSabetan = 0;
  private panahAktif = false;
  private progresPanah = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0805);
    this.scene.fog = new THREE.FogExp2(0x0c0805, 0.048);

    this.camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 50);
    this.camera.position.set(0, 0.34, 5.95);
    this.camera.lookAt(0, 0.24, 0);

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

    // 3. Dua Batang Gedebog Pisang Bertingkat (Gedebog Atas & Bawah) dengan Pluntur Bambu
    const gedebogMat = new THREE.MeshStandardMaterial({
      color: 0x566e34,
      map: gedebogTex,
      roughness: 0.74,
      metalness: 0.05,
    });

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

    // 4. Kothak Wayang Kayu Jati Ukir + Kepyak Kuningan & Cempala Dalang di Sisi Kiri
    const kothakGrup = new THREE.Group();
    kothakGrup.position.set(-2.55, -1.36, 0.68);
    kothakGrup.rotation.y = 0.22;

    const kothakBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.64, 0.68),
      kayuJatiUkirMat,
    );
    kothakBody.castShadow = true;
    kothakGrup.add(kothakBody);

    const kothakRim = new THREE.Mesh(
      new THREE.BoxGeometry(1.46, 0.06, 0.72),
      lisPradaMat,
    );
    kothakRim.position.y = 0.31;
    kothakGrup.add(kothakRim);

    // 4 Keping Kepyak / Keprak Kuningan tergantung di sisi kanan Kothak Wayang
    for (let k = 0; k < 4; k++) {
      const keping = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.22, 0.16),
        lisPradaMat,
      );
      keping.position.set(0.72 + k * 0.018, 0.04 - k * 0.015, 0.06);
      keping.rotation.z = 0.08 + k * 0.03;
      kothakGrup.add(keping);
    }

    // Cempala (Pemukul Kayu Jati Dalang) di atas Kothak
    const cempala = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.042, 0.18, 8, 14),
      kayuJatiUkirMat,
    );
    cempala.rotation.z = Math.PI * 0.42;
    cempala.position.set(0.32, 0.38, 0.12);
    kothakGrup.add(cempala);

    this.panggungGrup.add(kothakGrup);

    // 5. Lampu Minyak Kelapa Kyai Blencong Bersayap Garuda di Atas Tengah Kelir
    const blencongData = buildBlencongWayang3D();
    this.blencongGrup = blencongData.grup;
    this.nyalaIntiMesh = blencongData.nyalaInti;
    this.haloApiMesh = blencongData.haloApi;
    this.blencongGrup.scale.setScalar(0.68);
    this.blencongGrup.position.set(0, 1.38, 0.85);
    this.blencongGrup.rotation.y = Math.PI;
    this.panggungGrup.add(this.blencongGrup);

    // Kerucut berkas cahaya hangat Blencong (Volumetric Light Cone)
    const coneGeo = new THREE.ConeGeometry(2.6, 3.2, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffb84a,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(0, 0.12, 0.32);
    lightCone.rotation.x = -0.22;
    this.panggungGrup.add(lightCone);

    // 6. Simpingan Wayang Kiri & Kanan (Jajaran Tokoh Berukir Tertancap Rapi di Gedebog Atas)
    const warnaSimpingan = [0x9e2a1c, 0xc87d28, 0x7a1f16, 0xb55d19];
    for (let i = 0; i < 4; i++) {
      const wKiri = buildSimpinganWayang3D(warnaSimpingan[i], 0.68 + i * 0.045);
      wKiri.position.set(-3.16 + i * 0.31, -0.06 + i * 0.04, 0.04 + i * 0.01);
      wKiri.rotation.y = 0.08;
      wKiri.rotation.z = -0.05 + i * 0.015;
      this.panggungGrup.add(wKiri);

      const wKanan = buildSimpinganWayang3D(warnaSimpingan[(i + 1) % 4], 0.68 + i * 0.045);
      wKanan.scale.x *= -1;
      wKanan.position.set(3.16 - i * 0.31, -0.06 + i * 0.04, 0.04 + i * 0.01);
      wKanan.rotation.y = -0.08;
      wKanan.rotation.z = 0.05 - i * 0.015;
      this.panggungGrup.add(wKanan);
    }

    // 7. Gunungan (Kayon Surakarta) di Sisi Kanan Tengah
    this.gunungan = buildGunungan3D();
    this.gunungan.scale.setScalar(0.84);
    this.gunungan.position.set(1.58, -0.1, -0.08);
    this.gunungan.rotation.y = -0.08;
    this.panggungGrup.add(this.gunungan);

    // 8. Wayang Kulit Sri Rama (Tokoh Utama Ksatria Pemanah)
    this.sriRama = buildSriRamaWayang3D();
    this.sriRama.root.scale.setScalar(0.88);
    this.sriRama.root.position.set(0.72, 0.08, 0.14);
    this.panggungGrup.add(this.sriRama.root);

    // 9. Wayang Kulit Kijang Kencana (Penyamaran Marica)
    this.kidang = buildKidangKencana3D();
    this.kidang.root.scale.setScalar(0.9);
    this.kidang.root.position.set(-1.12, 0.02, 0.12);
    this.panggungGrup.add(this.kidang.root);

    // 10. Anak Panah Pusaka Guwawijaya (Melesat Saat Tombol Panah Ditekan)
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
  }

  public aturPosisiTokoh(ramaNorm: number, kidangNorm: number): void {
    this.targetRamaX = THREE.MathUtils.clamp(ramaNorm, -0.85, 0.85) * 2.65;
    this.targetKidangX = THREE.MathUtils.clamp(kidangNorm, -0.85, 0.85) * 2.65;
  }

  public terapkanGesturPanggung(opts: { kemiringan?: number; intensitasSabetan?: number }): void {
    if (typeof opts.kemiringan === 'number' && this.sriRama) {
      this.sriRama.lenganKanan.rotation.z = THREE.MathUtils.clamp(
        -0.34 + opts.kemiringan * 0.55,
        -1.25,
        0.65,
      );
      this.sriRama.sikuKanan.rotation.z = THREE.MathUtils.clamp(
        0.56 - opts.kemiringan * 0.35,
        0.1,
        1.2,
      );
    }
    if (typeof opts.intensitasSabetan === 'number' && opts.intensitasSabetan > 0.5) {
      this.picuSabetanWayang();
    }
  }

  public aturBabak(indeksBabak: number): void {
    const posRama = [0.72, 0.85, 0.55, 0.35][indeksBabak] ?? 0.72;
    const posKidang = [-1.12, -0.78, -1.35, -0.95][indeksBabak] ?? -1.12;
    this.targetRamaX = posRama;
    this.targetKidangX = posKidang;
    this.picuSabetanWayang();
  }

  public aturPosisiWayang(normX: number): void {
    const clamped = Math.max(-1, Math.min(1, normX));
    this.targetRamaX = 0.35 + clamped * 0.95;
    this.targetKidangX = -1.05 + clamped * 0.55;
  }

  public picuSabetanWayang(): void {
    this.targetSabetan = 1;
  }

  public picuPanahRama(): void {
    this.panahAktif = true;
    this.progresPanah = 0;
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

  private loop = (): void => {
    if (!this.renderer || !this.loopAktif) {
      this.rafId = null;
      return;
    }
    this.rafId = window.requestAnimationFrame(this.loop);

    const t = performance.now() * 0.001;

    // Kedip api minyak kelapa Blencong & goyangan lembut lampu gantung
    const faktorKedip = this.moodCahaya === 'sorot' ? 0.35 : 1;
    const flicker = (Math.sin(t * 7.4) * 0.42 + Math.cos(t * 12.1) * 0.22) * faktorKedip;
    this.nyalaApi.intensity = this.baseApiIntensity + flicker;
    this.blencongGrup.rotation.z = Math.sin(t * 1.4) * 0.025;
    if (this.nyalaIntiMesh) {
      this.nyalaIntiMesh.scale.y = 1 + flicker * 0.18;
    }
    if (this.haloApiMesh) {
      const s = 1 + flicker * 0.1;
      this.haloApiMesh.scale.setScalar(s);
    }

    // Gerak Dalang mengayunkan Sri Rama (badan, bahu, siku, tuding)
    const dxRama = this.targetRamaX - this.sriRama.root.position.x;
    this.sriRama.root.position.x += dxRama * 0.1;
    this.sriRama.root.position.y = 0.08 + Math.sin(t * 2.2) * 0.025;
    this.sriRama.root.rotation.y = THREE.MathUtils.clamp(-dxRama * 0.24, -0.32, 0.32) - 0.06;
    this.sriRama.root.rotation.z = Math.sin(t * 1.9) * 0.025 + Math.sin(this.targetSabetan * Math.PI * 2) * 0.22;

    this.sriRama.lenganKanan.rotation.z = -0.34 + Math.sin(t * 2.6) * 0.08 - this.targetSabetan * 0.48;
    this.sriRama.sikuKanan.rotation.z = 0.56 + Math.cos(t * 2.6) * 0.06 + this.targetSabetan * 0.32;
    this.sriRama.lenganKiri.rotation.z = 0.4 + Math.cos(t * 2.1) * 0.07 + this.targetSabetan * 0.35;

    // Gerak Kidang Kencana melompat anggun dengan sendi kaki berartikulasi
    const dxKidang = this.targetKidangX - this.kidang.root.position.x;
    this.kidang.root.position.x += dxKidang * 0.1;
    const lompat = Math.abs(Math.sin(t * 3.2));
    this.kidang.root.position.y = 0.02 + lompat * 0.16;
    this.kidang.root.rotation.y = dxKidang > 0.05 ? 0.08 : 0.04;
    this.kidang.leherKepala.rotation.z = Math.sin(t * 3.4) * 0.09;
    this.kidang.kakiDepan.rotation.z = Math.sin(t * 3.2) * 0.34;
    this.kidang.kakiBelakang.rotation.z = -Math.sin(t * 3.2) * 0.34;

    // Gunungan Kayon berayun khidmat
    this.gunungan.rotation.z = Math.sin(t * 1.1) * 0.02;

    this.targetSabetan *= 0.91;

    // Lesatan Panah Guwawijaya
    if (this.panahAktif) {
      this.progresPanah += 0.042;
      const dariX = this.sriRama.root.position.x - 0.52;
      const keX = this.kidang.root.position.x + 0.15;
      this.panahTerbang.position.set(
        THREE.MathUtils.lerp(dariX, keX, this.progresPanah),
        0.38 + Math.sin(this.progresPanah * Math.PI) * 0.36,
        0.22,
      );
      this.panahTerbang.rotation.z = (0.5 - this.progresPanah) * 0.32;
      if (this.progresPanah >= 1) {
        this.panahAktif = false;
        this.panahTerbang.visible = false;
        this.kidang.root.rotation.z = -0.38;
      }
    } else {
      this.kidang.root.rotation.z *= 0.9;
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
