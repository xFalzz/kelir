import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  applyStudioHDR,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  pasangObservasiPanggung,
} from './threeHelpers.ts';

function buatTeksturKulitAstrolabe(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} | null {
  if (typeof document === 'undefined') return null;

  const w = 1024;
  const h = 1024;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = w;
  diffCanvas.height = h;
  const dCtx = diffCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');
  if (!dCtx || !bCtx) return null;

  // Anodized dark obsidian-graphite brushed titanium base
  const baseGrad = dCtx.createLinearGradient(0, 0, 0, h);
  baseGrad.addColorStop(0, '#2a2e38');
  baseGrad.addColorStop(0.24, '#1b1e25');
  baseGrad.addColorStop(0.5, '#13151a');
  baseGrad.addColorStop(0.76, '#1c1f27');
  baseGrad.addColorStop(1, '#2a2e38');
  dCtx.fillStyle = baseGrad;
  dCtx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  // Alur bubut presisi horizontal (lathe toolmarks)
  for (let y = 0; y < h; y += 3) {
    const shade = (Math.sin(y * 0.45) + 1) * 0.5;
    dCtx.fillStyle = shade > 0.5 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.035)';
    dCtx.fillRect(0, y, w, 1);

    bCtx.fillStyle = shade > 0.5 ? '#8a8a8a' : '#767676';
    bCtx.fillRect(0, y, w, 1);
  }

  // Sambungan panel meridian halus (8 sektor presisi)
  for (let i = 0; i < 8; i++) {
    const x = Math.round((i * w) / 8);
    dCtx.fillStyle = 'rgba(8, 9, 12, 0.72)';
    dCtx.fillRect(x - 1, 90, 2, h - 180);
    dCtx.fillStyle = 'rgba(218, 178, 96, 0.28)';
    dCtx.fillRect(x + 2, 160, 1, h - 320);

    bCtx.fillStyle = '#383838';
    bCtx.fillRect(x - 2, 90, 4, h - 180);
  }

  // Sabuk kalibrasi vernier ekuator (derajat & indeks S1-S7)
  const eqY = 512;
  dCtx.fillStyle = 'rgba(12, 13, 17, 0.86)';
  dCtx.fillRect(0, eqY - 34, w, 68);
  bCtx.fillStyle = '#484848';
  bCtx.fillRect(0, eqY - 34, w, 68);

  // Garis tepi perunggu ganda
  dCtx.fillStyle = '#d4a148';
  dCtx.fillRect(0, eqY - 34, w, 2);
  dCtx.fillRect(0, eqY + 32, w, 2);

  for (let deg = 0; deg < 120; deg++) {
    const x = (deg * w) / 120;
    const isMajor = deg % 10 === 0;
    const isMid = deg % 5 === 0;
    const tickH = isMajor ? 24 : isMid ? 16 : 9;
    dCtx.fillStyle = isMajor ? '#f0713c' : isMid ? '#e5bc68' : 'rgba(235, 226, 210, 0.45)';
    dCtx.fillRect(x, eqY - tickH / 2, isMajor ? 3 : 1.5, tickH);

    bCtx.fillStyle = isMajor ? '#d8d8d8' : '#a6a6a6';
    bCtx.fillRect(x, eqY - tickH / 2, 2, tickH);
  }

  const map = new THREE.CanvasTexture(diffCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;

  return { map, bumpMap };
}

function buatTeksturSkalaCincin(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const w = 1024;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#443d35');
  grad.addColorStop(0.5, '#25211c');
  grad.addColorStop(1, '#3b352d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Lis perunggu atas & bawah
  ctx.fillStyle = '#dfb15b';
  ctx.fillRect(0, 4, w, 5);
  ctx.fillRect(0, h - 9, w, 5);

  // Skala presisi 180 takik kompas astrolabe
  for (let i = 0; i < 180; i++) {
    const x = (i * w) / 180;
    const major = i % 15 === 0;
    const mid = i % 5 === 0;
    const tickLen = major ? 42 : mid ? 26 : 14;
    ctx.fillStyle = major ? '#f06d3c' : mid ? '#e7c272' : 'rgba(244, 238, 226, 0.48)';
    ctx.fillRect(x, (h - tickLen) / 2, major ? 3 : 1.5, tickLen);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function buatTeksturBayanganLantai(isDark: boolean): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 10, r, r, r);
  if (isDark) {
    grad.addColorStop(0, 'rgba(240, 109, 60, 0.24)');
    grad.addColorStop(0.42, 'rgba(0, 0, 0, 0.56)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    grad.addColorStop(0, 'rgba(20, 21, 24, 0.24)');
    grad.addColorStop(0.45, 'rgba(20, 21, 24, 0.08)');
    grad.addColorStop(1, 'rgba(20, 21, 24, 0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class PamomongOrbStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  private controls: OrbitControls | null = null;
  private container: HTMLElement;

  private astrolabeRoot = new THREE.Group();
  private chassisGroup = new THREE.Group();
  private turbinInti!: THREE.Group;
  private mataKiri!: THREE.Mesh;
  private mataKanan!: THREE.Mesh;
  private irisEmissiveMats: THREE.MeshStandardMaterial[] = [];
  private cincinDalam!: THREE.Group;
  private cincinTengah!: THREE.Group;
  private cincinLuar!: THREE.Group;
  private shadowDisc: THREE.Mesh | null = null;

  private hemiLight: THREE.HemisphereLight | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private rimEmber: THREE.PointLight | null = null;

  private rafId: number | null = null;
  private loopAktif = true;
  private stopObservasi: (() => void) | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private energyPulse = 0;

  constructor(container: HTMLElement, tema: 'malam' | 'terang' = 'terang') {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, {
      alpha: true,
      antialias: true,
      shadows: false,
    });
    if (!this.renderer) return;

    this.camera.position.set(0.24, 0.28, 6.25);
    void applyStudioHDR(this.renderer, this.scene);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minPolarAngle = Math.PI * 0.28;
    this.controls.maxPolarAngle = Math.PI * 0.72;

    this.hemiLight = new THREE.HemisphereLight(0xfaf6ee, 0x2a231c, 1.35);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff7ea, 3.4);
    this.keyLight.position.set(4.2, 5.8, 6.4);
    this.scene.add(this.keyLight);

    const fillCool = new THREE.DirectionalLight(0xcbd8eb, 2.15);
    fillCool.position.set(-5.2, 2.2, 4.4);
    this.scene.add(fillCool);

    this.rimEmber = new THREE.PointLight(0xf06d3c, 5.2, 16);
    this.rimEmber.position.set(-2.9, 2.5, -2.0);
    this.scene.add(this.rimEmber);

    const topAccent = new THREE.PointLight(0xe5bc68, 2.4, 12);
    topAccent.position.set(2.8, 3.4, 2.4);
    this.scene.add(topAccent);

    this.bangunAstrolabe();
    this.setTheme(tema);
    this.ubahUkuran();
    this.stopObservasi = pasangObservasiPanggung(container, (aktif) => {
      this.loopAktif = aktif;
      if (aktif && this.rafId === null) {
        this.loop();
      } else if (!aktif && this.rafId !== null) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
    this.loop();
  }

  private bangunAstrolabe(): void {
    const tex = buatTeksturKulitAstrolabe();
    const ringScaleTex = buatTeksturSkalaCincin();

    const brushedTitaniumMat = new THREE.MeshPhysicalMaterial({
      map: tex?.map ?? null,
      bumpMap: tex?.bumpMap ?? null,
      bumpScale: 0.012,
      color: 0xd6dbe4,
      metalness: 0.8,
      roughness: 0.24,
      clearcoat: 0.75,
      clearcoatRoughness: 0.1,
    });

    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x20232b,
      metalness: 0.88,
      roughness: 0.24,
    });

    const brushedBrassMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.92,
      roughness: 0.22,
    });

    const copperEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xf06d3c,
      emissive: 0xd94816,
      emissiveIntensity: 1.45,
      roughness: 0.22,
      metalness: 0.4,
    });
    this.irisEmissiveMats.push(copperEmissiveMat);

    // =========================================================================
    // 1. Cangkang Bola Terbelah + Turbin Inti BM25 di Sabuk Ekuator
    // =========================================================================
    const topCapShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 56, 36, 0, Math.PI * 2, 0.18, Math.PI * 0.43),
      brushedTitaniumMat,
    );
    const botCapShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 56, 36, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.43),
      brushedTitaniumMat,
    );
    this.chassisGroup.add(topCapShell, botCapShell);

    // Inti Leher Ekuator Terbuka & Kisi Energi
    const innerCoreNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.92, 0.26, 48),
      gunmetalMat,
    );
    this.chassisGroup.add(innerCoreNeck);

    this.turbinInti = new THREE.Group();
    const coreGlowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.94, 0.016, 12, 64),
      copperEmissiveMat,
    );
    coreGlowRing.rotation.x = Math.PI / 2;
    this.turbinInti.add(coreGlowRing);

    // 16 Sirip Radiator Mikro di Sabuk Tengah
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.14, 0.05), brushedBrassMat);
      fin.position.set(Math.cos(ang) * 0.94, 0, Math.sin(ang) * 0.94);
      fin.rotation.y = -ang;
      this.turbinInti.add(fin);
    }
    this.chassisGroup.add(this.turbinInti);

    // Sabuk Cincin Chamfer Pengunci Belahan Atas & Bawah
    for (const yOff of [-0.11, 0.11]) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.995, 0.022, 12, 64), brushedBrassMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = yOff;
      this.chassisGroup.add(collar);
    }

    // Mahkota Polar Atas & Penyeimbang Bawah (Lathe Horologi)
    const finialPts = [
      new THREE.Vector2(0.28, 0),
      new THREE.Vector2(0.28, 0.035),
      new THREE.Vector2(0.21, 0.05),
      new THREE.Vector2(0.21, 0.09),
      new THREE.Vector2(0.11, 0.12),
      new THREE.Vector2(0.04, 0.19),
      new THREE.Vector2(0, 0.22),
    ];
    const topFinial = new THREE.Mesh(new THREE.LatheGeometry(finialPts, 32), brushedBrassMat);
    topFinial.position.y = 0.96;
    const botFinial = topFinial.clone();
    botFinial.rotation.x = Math.PI;
    botFinial.position.y = -0.96;
    const topJewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), copperEmissiveMat);
    topJewel.position.y = 1.21;
    this.chassisGroup.add(topFinial, botFinial, topJewel);

    // =========================================================================
    // 2. Ruang Optik Safir & Dual Diafragma Lensa Presisi (Depan)
    // =========================================================================
    const opticBay = new THREE.Group();
    opticBay.position.set(0, 0.19, 0.85);
    opticBay.rotation.x = -0.14;

    // Dudukan Bezel Titanium Oval-Horisontal + 8 Baut Hex
    const housingRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.052, 16, 48),
      gunmetalMat,
    );
    housingRing.scale.set(1.26, 0.82, 0.72);
    opticBay.add(housingRing);

    const brassTrimRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.39, 0.016, 12, 48),
      brushedBrassMat,
    );
    brassTrimRing.scale.set(1.26, 0.82, 0.8);
    brassTrimRing.position.z = 0.038;
    opticBay.add(brassTrimRing);

    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.032, 6),
        brushedBrassMat,
      );
      screw.rotation.x = Math.PI / 2;
      screw.position.set(Math.cos(a) * 0.42 * 1.26, Math.sin(a) * 0.42 * 0.82, 0.044);
      opticBay.add(screw);
    }

    // Backing gelap dalam rongga lensa
    const cavityBack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41, 0.37, 0.12, 36),
      new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: 0.4, metalness: 0.5 }),
    );
    cavityBack.rotation.x = Math.PI / 2;
    cavityBack.scale.set(1.22, 1, 0.78);
    cavityBack.position.z = -0.04;
    opticBay.add(cavityBack);

    // Sepasang Apertur Lensa Optik Stereoskopis
    const eyeCoreMat = new THREE.MeshStandardMaterial({
      color: 0xfff8eb,
      emissive: 0xffe4b8,
      emissiveIntensity: 1.55,
      roughness: 0.15,
    });
    this.irisEmissiveMats.push(eyeCoreMat);

    const buildAperture = (xOffset: number): THREE.Mesh => {
      const barrel = new THREE.Group();
      barrel.position.set(xOffset, 0, 0.025);

      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.128, 0.06, 24),
        gunmetalMat,
      );
      sleeve.rotation.x = Math.PI / 2;

      const diaphragmRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.098, 0.012, 10, 28),
        brushedBrassMat,
      );
      diaphragmRing.position.z = 0.032;

      const corePrism = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.046, 0.055, 8, 16),
        eyeCoreMat,
      );
      corePrism.position.z = 0.035;
      corePrism.scale.z = 0.35;

      const outerHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.068, 0.008, 8, 24),
        copperEmissiveMat,
      );
      outerHalo.position.z = 0.036;

      barrel.add(sleeve, diaphragmRing, outerHalo, corePrism);
      opticBay.add(barrel);
      return corePrism;
    };

    this.mataKiri = buildAperture(-0.185);
    this.mataKanan = buildAperture(0.185);

    // Kubah Kaca Safir Depan (Specularity & Refraksi Halus)
    const sapphireDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.41, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.42),
      new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        transparent: true,
        opacity: 0.18,
        roughness: 0.03,
        metalness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        depthWrite: false,
      }),
    );
    sapphireDome.rotation.x = Math.PI / 2;
    sapphireDome.scale.set(1.22, 0.52, 0.78);
    sapphireDome.position.z = -0.02;
    opticBay.add(sapphireDome);

    this.chassisGroup.add(opticBay);

    // =========================================================================
    // 3. Bantalan Poros Samping Kiri & Kanan (Trunnion Bearings)
    // =========================================================================
    for (const side of [-1, 1]) {
      const trunnion = new THREE.Group();
      trunnion.position.set(side * 1.03, 0, 0);

      const baseFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.27, 0.1, 28),
        gunmetalMat,
      );
      baseFlange.rotation.z = Math.PI / 2;

      const copperSlip = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.02, 12, 32),
        copperEmissiveMat,
      );
      copperSlip.rotation.y = Math.PI / 2;
      copperSlip.position.x = side * 0.04;

      const axlePin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.26, 20),
        brushedBrassMat,
      );
      axlePin.rotation.z = Math.PI / 2;
      axlePin.position.x = side * 0.11;

      const endCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 0.06, 6),
        gunmetalMat,
      );
      endCap.rotation.z = Math.PI / 2;
      endCap.position.x = side * 0.23;

      trunnion.add(baseFlange, copperSlip, axlePin, endCap);
      this.chassisGroup.add(trunnion);
    }

    this.astrolabeRoot.add(this.chassisGroup);

    // =========================================================================
    // 4. Tiga Cincin Giroskop Astrolabe Presisi (Dalam, Tengah, Luar)
    // =========================================================================
    // Cincin 1: Kuningan Sikat dengan 12 Pin Kalibrasi
    this.cincinDalam = new THREE.Group();
    const innerHoopPts = [
      new THREE.Vector2(1.22, -0.025),
      new THREE.Vector2(1.27, -0.018),
      new THREE.Vector2(1.27, 0.018),
      new THREE.Vector2(1.22, 0.025),
      new THREE.Vector2(1.22, -0.025),
    ];
    const innerHoop = new THREE.Mesh(new THREE.LatheGeometry(innerHoopPts, 72), brushedBrassMat);
    innerHoop.rotation.x = Math.PI * 0.44;
    this.cincinDalam.add(innerHoop);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), gunmetalMat);
      pin.position.set(Math.cos(a) * 1.245, 0, Math.sin(a) * 1.245);
      innerHoop.add(pin);
    }

    // Cincin 2: Pita Skala Derajat Horologis + 4 Penjepit Vernier
    this.cincinTengah = new THREE.Group();
    const middleBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.44, 1.44, 0.11, 80, 1, true),
      new THREE.MeshStandardMaterial({
        map: ringScaleTex,
        metalness: 0.72,
        roughness: 0.28,
        side: THREE.DoubleSide,
      }),
    );
    for (const yOff of [-0.055, 0.055]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.44, 0.014, 10, 80), brushedBrassMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = yOff;
      middleBand.add(rim);
    }
    for (let q = 0; q < 4; q++) {
      const a = (q / 4) * Math.PI * 2;
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.07), gunmetalMat);
      clamp.position.set(Math.cos(a) * 1.44, 0, Math.sin(a) * 1.44);
      clamp.rotation.y = -a;
      middleBand.add(clamp);
    }
    this.cincinTengah.rotation.set(0.32, 0.42, 0.28);
    this.cincinTengah.add(middleBand);

    // Cincin 3: Rel Ganda Orbital Luar + 3 Satelit Node Kurasi
    this.cincinLuar = new THREE.Group();
    for (const rOff of [1.62, 1.69]) {
      const rail = new THREE.Mesh(
        new THREE.TorusGeometry(rOff, 0.013, 12, 88),
        rOff > 1.65 ? gunmetalMat : copperEmissiveMat,
      );
      this.cincinLuar.add(rail);
    }
    for (let s = 0; s < 3; s++) {
      const a = (s / 3) * Math.PI * 2;
      const relay = new THREE.Mesh(new THREE.OctahedronGeometry(0.058, 0), brushedBrassMat);
      relay.position.set(Math.cos(a) * 1.655, Math.sin(a) * 1.655, 0);
      this.cincinLuar.add(relay);
    }
    this.cincinLuar.rotation.set(Math.PI * 0.42, -0.22, 0);

    this.astrolabeRoot.add(this.cincinDalam, this.cincinTengah, this.cincinLuar);
    this.scene.add(this.astrolabeRoot);

    // =========================================================================
    // 5. Bayangan Kontak Melayang (Menjangkar Objek 3D Tanpa Kotak Pembatas)
    // =========================================================================
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: buatTeksturBayanganLantai(false),
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = -1.78;
    this.scene.add(this.shadowDisc);
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    if (!this.renderer) return;
    const isDark = tema === 'malam';

    if (this.hemiLight) {
      this.hemiLight.intensity = isDark ? 1.55 : 1.35;
    }
    if (this.keyLight) {
      this.keyLight.intensity = isDark ? 3.8 : 3.35;
    }
    if (this.rimEmber) {
      this.rimEmber.intensity = isDark ? 6.2 : 4.8;
    }

    if (this.shadowDisc) {
      const mat = this.shadowDisc.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = buatTeksturBayanganLantai(isDark);
      mat.needsUpdate = true;
    }
  }

  public aturArahKursor(normX: number, normY: number): void {
    this.pointerX = Math.max(-1, Math.min(1, normX));
    this.pointerY = Math.max(-1, Math.min(1, normY));
  }

  public picuDenyutBerpikir(): void {
    this.energyPulse = 1;
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 320, 1);
    const h = Math.max(this.container.clientHeight || 320, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(35, this.camera.aspect, 1.05, 48);
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
    const levitation = Math.sin(t * 1.65) * 0.075;
    this.astrolabeRoot.position.y = levitation;

    if (this.shadowDisc) {
      const s = 1 - levitation * 0.55;
      this.shadowDisc.scale.set(s, s, 1);
      (this.shadowDisc.material as THREE.MeshBasicMaterial).opacity = 0.86 - levitation * 0.9;
    }

    // Ikuti kursor pada chassis internal, sementara OrbitControls bebas memutar sudut kamera
    const targetRotY = this.pointerX * 0.42;
    const targetRotX = -this.pointerY * 0.24;
    this.chassisGroup.rotation.y += (targetRotY - this.chassisGroup.rotation.y) * 0.08;
    this.chassisGroup.rotation.x += (targetRotX - this.chassisGroup.rotation.x) * 0.08;

    this.turbinInti.rotation.y += 0.015 + this.energyPulse * 0.09;
    this.cincinDalam.rotation.y += 0.006 + this.energyPulse * 0.03;
    this.cincinDalam.rotation.z += 0.004;
    this.cincinTengah.rotation.y -= 0.008 + this.energyPulse * 0.04;
    this.cincinTengah.rotation.x += 0.003;
    this.cincinLuar.rotation.z += 0.01 + this.energyPulse * 0.055;

    for (const mat of this.irisEmissiveMats) {
      mat.emissiveIntensity = 1.45 + this.energyPulse * 1.35 + Math.sin(t * 2.4) * 0.14;
    }

    const blink = Math.sin(t * 0.72) > 0.965 ? -0.68 : 0;
    const eyeScaleY = Math.max(0.24, 1 + this.energyPulse * 0.28 + blink);
    this.mataKiri.scale.y = eyeScaleY;
    this.mataKanan.scale.y = eyeScaleY;
    this.energyPulse *= 0.93;

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.loopAktif = false;
    this.stopObservasi?.();
    this.stopObservasi = null;
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    this.controls?.dispose();
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
