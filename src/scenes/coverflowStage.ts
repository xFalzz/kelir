import * as THREE from 'three';
import {
  applyStudioHDR,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  isMobileGpuProfile,
  jalankanLoopSetelahSiap,
  pasangObservasiPanggung,
} from './threeHelpers.ts';
import {
  buildBatikPusaka3D,
  buildJogloPusaka3D,
  buildKerisPusaka3D,
  buildKidangDanBlencong3D,
  buildPrasastiHanacaraka3D,
  buildSaronPusaka3D,
  buildWayangSriRamaDanBlencong3D,
  type CoverflowArtefakId,
  type PaketModel3D,
} from './pusaka3DBuilder.ts';

interface SlotCoverflow3D {
  indeks: number;
  artefakId: CoverflowArtefakId;
  root: THREE.Group;
  artefakPivot: THREE.Group;
  rimMat: THREE.MeshStandardMaterial;
  basePlinthMat: THREE.MeshStandardMaterial;
  velvetMat: THREE.MeshStandardMaterial;
  paket: PaketModel3D;
  targetX: number;
  targetY: number;
  targetZ: number;
  targetRotY: number;
  targetScale: number;
}

const PAD_TOP_Y = -0.725;
const MAX_BOUND_W = 2.24;
const MAX_BOUND_H = 2.28;
const ORBIT_CENTER_Z = -2.5;
const ORBIT_RADIUS = 4.65;
const ORBIT_FLOOR_Y = -1.055;

const URUTAN_MODEL: Array<{ id: CoverflowArtefakId }> = [
  { id: 'keris' },
  { id: 'saron' },
  { id: 'batik' },
  { id: 'joglo' },
  { id: 'wayang' },
  { id: 'kidang' },
  { id: 'hanacaraka' },
];

function buatPaketOlehId(id: CoverflowArtefakId): PaketModel3D {
  switch (id) {
    case 'keris':
      return buildKerisPusaka3D();
    case 'saron':
      return buildSaronPusaka3D();
    case 'batik':
      return buildBatikPusaka3D();
    case 'joglo':
      return buildJogloPusaka3D();
    case 'wayang':
      return buildWayangSriRamaDanBlencong3D();
    case 'kidang':
      return buildKidangDanBlencong3D();
    case 'hanacaraka':
      return buildPrasastiHanacaraka3D();
  }
}

export class CoverflowStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 2.2, 0.1, 60);
  private container: HTMLElement;

  private slots: SlotCoverflow3D[] = [];
  private activeIdx = 0;
  private continuousIdx = 0;
  private scrollProgress = 0;
  private pointerX = 0;
  private pointerY = 0;

  private ambientLight: THREE.AmbientLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private keySpot: THREE.SpotLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.PointLight | null = null;
  private shadowMat: THREE.ShadowMaterial | null = null;
  private arcTrackMat: THREE.MeshBasicMaterial | null = null;
  private focusHaloMesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null = null;
  private partikel: THREE.Points | null = null;

  private raycaster = new THREE.Raycaster();
  private readonly ptrScratch = new THREE.Vector2();
  private dragStartX: number | null = null;
  private didSwipe = false;

  private onSelectCb: ((idx: number) => void) | null = null;
  private onSwipeCb: ((delta: number) => void) | null = null;
  private rafId: number | null = null;
  private loopAktif = true;
  private loopSiapMulai = false;
  private temaAktif: 'malam' | 'terang' = 'terang';
  private pendingSlotIndices: number[] = [];
  private slotQueueRafId: number | null = null;
  private stopObservasi: (() => void) | null = null;
  private abortCtrl = new AbortController();
  private cancelMulaiLoop: (() => void) | null = null;

  constructor(container: HTMLElement, tema: 'malam' | 'terang' = 'terang', initialIdx = 0) {
    this.container = container;
    this.temaAktif = tema;
    this.activeIdx = initialIdx;
    this.continuousIdx = initialIdx;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: true });
    if (!this.renderer) return;

    this.camera.position.set(0, 2.18, 9.8);
    this.camera.lookAt(0, -0.08, -0.95);
    void applyStudioHDR(this.renderer, this.scene, {
      signal: this.abortCtrl.signal,
      delayMs: 140,
    });

    this.setupLightingAndStudio();
    this.bangunCarousel(tema);
    this.setTheme(tema);
    this.ubahUkuran();

    container.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
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
        if (this.loopAktif && this.rafId === null) {
          this.loop();
        }
        this.jadwalkanAntreanSlot();
      },
    );
  }

  private setupLightingAndStudio(): void {
    this.ambientLight = new THREE.AmbientLight(0xfff5e8, 0.38);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xb8ad9b, 0.62);
    this.scene.add(this.hemiLight);

    this.keySpot = new THREE.SpotLight(0xfff3de, 54, 28, Math.PI * 0.27, 0.64, 1.35);
    this.keySpot.position.set(1.9, 6.8, 6.2);
    this.keySpot.target.position.set(0, 0.1, 2.0);
    this.keySpot.castShadow = true;
    this.keySpot.shadow.mapSize.set(512, 512);
    this.keySpot.shadow.bias = -0.0005;
    this.scene.add(this.keySpot, this.keySpot.target);

    this.fillLight = new THREE.DirectionalLight(0xd9e4f2, 1.12);
    this.fillLight.position.set(-5.6, 2.8, 3.8);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.PointLight(0xd1491b, 6.4, 18);
    this.rimLight.position.set(0, 2.3, -1.8);
    this.scene.add(this.rimLight);

    // Lantai penangkap bayangan studio museum agar setiap pedestal menjejak nyata
    this.shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(38, 24), this.shadowMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.07;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Garis panduan lintasan lingkaran pameran sebidang tepat di bawah ketujuh pedestal
    this.arcTrackMat = new THREE.MeshBasicMaterial({
      color: 0x9a6c1d,
      transparent: true,
      opacity: 0.28,
    });
    const arcTrack = new THREE.Mesh(
      new THREE.TorusGeometry(ORBIT_RADIUS, 0.018, 10, 128),
      this.arcTrackMat,
    );
    arcTrack.rotation.x = Math.PI / 2;
    arcTrack.position.set(0, ORBIT_FLOOR_Y, ORBIT_CENTER_Z);
    this.scene.add(arcTrack);

    // Lingkar aura cahaya halus di sekitar pedestal tengah aktif
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd1491b,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    this.focusHaloMesh = new THREE.Mesh(new THREE.RingGeometry(1.18, 1.36, 48), haloMat);
    this.focusHaloMesh.rotation.x = -Math.PI / 2;
    this.focusHaloMesh.position.set(0, ORBIT_FLOOR_Y + 0.003, ORBIT_CENTER_Z + ORBIT_RADIUS);
    this.scene.add(this.focusHaloMesh);

    // Partikel debu museum tipis melayang
    const mobileGpu = isMobileGpuProfile();
    const count = mobileGpu ? 22 : 42;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 12;
      posArr[i * 3 + 1] = (Math.random() - 0.15) * 3.8;
      posArr[i * 3 + 2] = (Math.random() - 0.4) * 5.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.partikel = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xe0b35a, size: 0.032, transparent: true, opacity: 0.36 }),
    );
    this.scene.add(this.partikel);
  }

  private bangunSatuSlot(indeks: number): void {
    const cfg = URUTAN_MODEL[indeks];
    if (!cfg) return;
    const isDark = this.temaAktif === 'malam';
    const slotRoot = new THREE.Group();
    slotRoot.userData.coverflowIndex = indeks;

    // Pedestal pameran andesit pahat 2 tingkat, alas beludru burgundy, & ganda lis kuningan
    const basePlinthMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x25201b : 0x342d26,
      roughness: 0.52,
      metalness: 0.16,
    });
    const velvetMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x4b1512 : 0x5d1814,
      roughness: 0.86,
      metalness: 0.08,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe0b254,
      emissive: 0x5c3e10,
      emissiveIntensity: 0.06,
      metalness: 0.9,
      roughness: 0.2,
    });

    const velvetPad = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.94, 0.032, 28), velvetMat);
    velvetPad.position.y = -0.742;
    velvetPad.receiveShadow = true;
    velvetPad.userData.coverflowIndex = indeks;

    const alas = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.09, 0.125, 28), basePlinthMat);
    alas.position.y = -0.82;
    alas.castShadow = true;
    alas.receiveShadow = true;
    alas.userData.coverflowIndex = indeks;

    const tiangPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.97, 0.18, 22), basePlinthMat);
    tiangPlinth.position.y = -0.975;
    tiangPlinth.castShadow = true;
    tiangPlinth.receiveShadow = true;
    tiangPlinth.userData.coverflowIndex = indeks;

    const cincinLis = new THREE.Mesh(new THREE.TorusGeometry(1.01, 0.022, 10, 32), rimMat);
    cincinLis.rotation.x = Math.PI / 2;
    cincinLis.position.y = -0.758;

    const cincinBawah = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.017, 8, 28), rimMat);
    cincinBawah.rotation.x = Math.PI / 2;
    cincinBawah.position.y = -1.055;

    // Bangun & normalkan dimensi + dudukkan flush persis di atas bantalan beludru via Box3
    const paket = buatPaketOlehId(cfg.id);
    paket.group.traverse((child) => {
      child.userData.coverflowIndex = indeks;
    });
    const rawBox = new THREE.Box3().setFromObject(paket.group);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    const scaleNorm = Math.min(
      MAX_BOUND_W / Math.max(rawSize.x, 0.01),
      MAX_BOUND_H / Math.max(rawSize.y, 0.01),
      0.74,
    );
    paket.group.scale.setScalar(scaleNorm);
    paket.group.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(paket.group);
    const centerX = (scaledBox.min.x + scaledBox.max.x) * 0.5;
    const centerZ = (scaledBox.min.z + scaledBox.max.z) * 0.5;
    paket.group.position.x = -centerX;
    paket.group.position.z = -centerZ;
    paket.group.position.y = PAD_TOP_Y - scaledBox.min.y - 0.01;

    const artefakPivot = new THREE.Group();
    artefakPivot.add(paket.group);

    slotRoot.add(velvetPad, alas, tiangPlinth, cincinLis, cincinBawah, artefakPivot);
    this.scene.add(slotRoot);

    const slot: SlotCoverflow3D = {
      indeks,
      artefakId: cfg.id,
      root: slotRoot,
      artefakPivot,
      rimMat,
      basePlinthMat,
      velvetMat,
      paket,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      targetRotY: 0,
      targetScale: 1,
    };
    this.posisikanSlot(slot, true);
    this.slots.push(slot);
  }

  private jadwalkanAntreanSlot(): void {
    if (
      this.slotQueueRafId !== null ||
      this.pendingSlotIndices.length === 0 ||
      this.abortCtrl.signal.aborted ||
      !this.renderer
    ) {
      return;
    }
    this.slotQueueRafId = window.requestAnimationFrame(() => {
      this.slotQueueRafId = null;
      if (this.abortCtrl.signal.aborted || !this.renderer) return;
      const nextIdx = this.pendingSlotIndices.shift();
      if (nextIdx !== undefined) {
        this.bangunSatuSlot(nextIdx);
      }
      if (this.pendingSlotIndices.length > 0) {
        this.jadwalkanAntreanSlot();
      }
    });
  }

  private bangunCarousel(tema: 'malam' | 'terang'): void {
    this.temaAktif = tema;
    const len = URUTAN_MODEL.length;
    const prioritasUrut = URUTAN_MODEL.map((_, idx) => {
      let dist = Math.abs(idx - this.activeIdx);
      if (dist > len / 2) dist = len - dist;
      return { idx, dist };
    }).sort((a, b) => a.dist - b.dist);

    this.pendingSlotIndices = [];
    for (const item of prioritasUrut) {
      if (item.dist <= 1) {
        this.bangunSatuSlot(item.idx);
      } else {
        this.pendingSlotIndices.push(item.idx);
      }
    }
    this.sinkronkanTargetSlot(true);
  }

  private posisikanSlot(slot: SlotCoverflow3D, instan = false): void {
    const len = URUTAN_MODEL.length;
    const halfLen = len / 2;

    let delta = slot.indeks - this.continuousIdx;
    if (delta > halfLen) delta -= len;
    if (delta < -halfLen) delta += len;

    const abs = Math.abs(delta);
    const norm = Math.min(1, abs / halfLen);
    // Semua 7 objek selalu menempati keliling lingkaran ORBIT_RADIUS secara akurat
    const angle = Math.sign(delta) * Math.PI * Math.pow(norm, 1.24);

    slot.targetScale = Math.max(0.64, 1.08 - abs * 0.145);
    slot.targetX = Math.sin(angle) * ORBIT_RADIUS;
    slot.targetZ = ORBIT_CENTER_Z + Math.cos(angle) * ORBIT_RADIUS;
    slot.targetY = ORBIT_FLOOR_Y * (1 - slot.targetScale);
    slot.targetRotY = -angle * 0.32;

    if (instan) {
      slot.root.position.set(slot.targetX, slot.targetY, slot.targetZ);
      slot.root.rotation.y = slot.targetRotY;
      slot.root.scale.setScalar(slot.targetScale);
    }
  }

  private sinkronkanTargetSlot(instan = false): void {
    for (const slot of this.slots) {
      this.posisikanSlot(slot, instan);
    }
  }

  public aturIndeksAktif(idx: number): void {
    const len = URUTAN_MODEL.length;
    if (!len) return;
    this.activeIdx = ((idx % len) + len) % len;
    while (this.pendingSlotIndices.length > 0) {
      const nextIdx = this.pendingSlotIndices.shift();
      if (nextIdx !== undefined) this.bangunSatuSlot(nextIdx);
    }
  }

  public aturProgresGulir(norm0ke1: number): void {
    this.scrollProgress = THREE.MathUtils.clamp(norm0ke1, 0, 1);
  }

  public aturParalaks(normX: number, normY: number): void {
    this.pointerX = THREE.MathUtils.clamp(normX, -1, 1);
    this.pointerY = THREE.MathUtils.clamp(normY, -1, 1);
  }

  public onSelectIndex(cb: (idx: number) => void): void {
    this.onSelectCb = cb;
  }

  public onSwipeStep(cb: (delta: number) => void): void {
    this.onSwipeCb = cb;
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    this.temaAktif = tema;
    const isDark = tema === 'malam';
    if (this.ambientLight) {
      this.ambientLight.color.setHex(isDark ? 0xeae0d0 : 0xfff6ea);
      this.ambientLight.intensity = isDark ? 0.36 : 0.4;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(isDark ? 0xf2dfc2 : 0xfff9ee);
      this.hemiLight.groundColor.setHex(isDark ? 0x261f18 : 0xb8ad9b);
      this.hemiLight.intensity = isDark ? 0.56 : 0.68;
    }
    if (this.keySpot) {
      this.keySpot.intensity = isDark ? 64 : 52;
    }
    if (this.rimLight) {
      this.rimLight.color.setHex(isDark ? 0xf06d3c : 0xd1491b);
      this.rimLight.intensity = isDark ? 7.4 : 4.8;
    }
    if (this.fillLight) {
      this.fillLight.intensity = isDark ? 1.05 : 1.15;
    }
    if (this.shadowMat) {
      this.shadowMat.opacity = isDark ? 0.44 : 0.2;
    }
    if (this.arcTrackMat) {
      this.arcTrackMat.color.setHex(isDark ? 0xe0b35a : 0x9a6c1d);
      this.arcTrackMat.opacity = isDark ? 0.24 : 0.2;
    }
    for (const s of this.slots) {
      s.basePlinthMat.color.setHex(isDark ? 0x241f1a : 0x342d26);
      s.velvetMat.color.setHex(isDark ? 0x45120f : 0x5d1814);
    }
  }

  private handlePointerDown = (e: PointerEvent): void => {
    this.dragStartX = e.clientX;
    this.didSwipe = false;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.dragStartX === null) return;
    if (Math.abs(e.clientX - this.dragStartX) > 34) {
      this.didSwipe = true;
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (this.dragStartX !== null && this.didSwipe && this.onSwipeCb) {
      const dx = e.clientX - this.dragStartX;
      this.dragStartX = null;
      this.onSwipeCb(dx < 0 ? 1 : -1);
      return;
    }
    this.dragStartX = null;

    if (!this.renderer || !this.onSelectCb) return;
    const rect = this.container.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }
    this.ptrScratch.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    this.ptrScratch.y = -((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;

    this.raycaster.setFromCamera(this.ptrScratch, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    for (const h of hits) {
      const idx = h.object.userData.coverflowIndex;
      if (typeof idx === 'number') {
        this.onSelectCb(idx);
        return;
      }
    }
  };

  public aturJedaModal(jeda: boolean): void {
    this.loopAktif = !jeda;
    if (jeda) {
      if (this.rafId !== null) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else if (this.loopSiapMulai && this.rafId === null) {
      this.loop();
    }
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 960, 1);
    const h = Math.max(this.container.clientHeight || 440, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(36, this.camera.aspect, 1.55, 56);
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
    const len = URUTAN_MODEL.length;

    let shortestDelta = this.activeIdx - this.continuousIdx;
    if (shortestDelta > len / 2) shortestDelta -= len;
    if (shortestDelta < -len / 2) shortestDelta += len;
    const settlingCarousel = Math.abs(shortestDelta) > 0.0005;
    if (settlingCarousel) {
      this.continuousIdx = (this.continuousIdx + shortestDelta * 0.12 + len) % len;
      this.sinkronkanTargetSlot(false);
    }

    for (const slot of this.slots) {
      if (Math.abs(slot.targetX - slot.root.position.x) > 0.0005) {
        slot.root.position.x += (slot.targetX - slot.root.position.x) * 0.14;
      }
      if (Math.abs(slot.targetY - slot.root.position.y) > 0.0005) {
        slot.root.position.y += (slot.targetY - slot.root.position.y) * 0.14;
      }
      if (Math.abs(slot.targetZ - slot.root.position.z) > 0.0005) {
        slot.root.position.z += (slot.targetZ - slot.root.position.z) * 0.14;
      }
      if (Math.abs(slot.targetRotY - slot.root.rotation.y) > 0.0005) {
        slot.root.rotation.y += (slot.targetRotY - slot.root.rotation.y) * 0.14;
      }
      if (Math.abs(slot.targetScale - slot.root.scale.x) > 0.0005) {
        const curScale = slot.root.scale.x + (slot.targetScale - slot.root.scale.x) * 0.14;
        slot.root.scale.setScalar(curScale);
      }

      const isActive = slot.indeks === this.activeIdx;
      const targetRimIntensity = isActive ? 0.24 : 0.04;
      if (Math.abs(targetRimIntensity - slot.rimMat.emissiveIntensity) > 0.002) {
        slot.rimMat.emissiveIntensity += (targetRimIntensity - slot.rimMat.emissiveIntensity) * 0.1;
      }

      const targetPivotRot = isActive
        ? t * 0.32 + this.pointerX * 0.22
        : Math.sin(t * 0.42 + slot.indeks) * 0.12;
      if (isActive) {
        slot.artefakPivot.rotation.y = targetPivotRot;
      } else {
        slot.artefakPivot.rotation.y += (targetPivotRot - slot.artefakPivot.rotation.y) * 0.07;
      }

      if (slot.paket.blencongFlame) {
        const flicker = 1 + Math.sin(t * 9.2 + slot.indeks) * 0.09;
        slot.paket.blencongFlame.scale.set(0.72 * flicker, 1.55 * flicker, 0.72 * flicker);
        if (slot.paket.blencongLight) {
          slot.paket.blencongLight.intensity = isActive ? 2.6 + flicker * 0.45 : 1.05;
        }
      }
      if (slot.paket.orbitAccent) {
        slot.paket.orbitAccent.rotation.y = t * 0.85;
      }
    }

    if (this.focusHaloMesh) {
      this.focusHaloMesh.material.opacity = 0.16 + Math.sin(t * 2.2) * 0.05;
    }

    // Kamera pameran menjaga lintasan lingkaran 7 pedestal utuh & merespons gulir + paralaks halus
    const goalCamX = this.pointerX * 0.36;
    const goalCamY = 2.18 + this.scrollProgress * 0.44 - this.pointerY * 0.16;
    const goalCamZ = 9.8 - this.scrollProgress * 0.45;
    this.camera.position.x += (goalCamX - this.camera.position.x) * 0.08;
    this.camera.position.y += (goalCamY - this.camera.position.y) * 0.08;
    this.camera.position.z += (goalCamZ - this.camera.position.z) * 0.08;
    this.camera.lookAt(0, -0.08 - this.scrollProgress * 0.08, -0.95);

    if (this.partikel) {
      this.partikel.rotation.y = t * 0.025;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.loopAktif = false;
    this.abortCtrl.abort();
    this.cancelMulaiLoop?.();
    this.cancelMulaiLoop = null;
    if (this.slotQueueRafId !== null) window.cancelAnimationFrame(this.slotQueueRafId);
    this.stopObservasi?.();
    this.stopObservasi = null;
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
