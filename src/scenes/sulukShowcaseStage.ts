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

const PRESET_SKALA_SULUK: Record<
  CoverflowArtefakId,
  { scale: number; yOffset: number; rotYBase: number }
> = {
  keris: { scale: 0.72, yOffset: 0.16, rotYBase: 0.28 },
  saron: { scale: 0.66, yOffset: -0.06, rotYBase: 0.34 },
  batik: { scale: 0.72, yOffset: 0.12, rotYBase: 0.22 },
  joglo: { scale: 0.66, yOffset: 0.08, rotYBase: 0.56 },
  wayang: { scale: 0.68, yOffset: 0.12, rotYBase: 0.18 },
  kidang: { scale: 0.72, yOffset: 0.14, rotYBase: 0.26 },
  hanacaraka: { scale: 0.74, yOffset: 0.18, rotYBase: 0.22 },
};

function buatPaketSuluk(id: CoverflowArtefakId): PaketModel3D {
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

export class SulukShowcaseStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 0.75, 0.1, 40);
  private container: HTMLElement;

  private pedestalGroup = new THREE.Group();
  private plinthMat: THREE.MeshStandardMaterial | null = null;
  private velvetMat: THREE.MeshPhysicalMaterial | null = null;
  private modelPivot = new THREE.Group();
  private activePaket: PaketModel3D | null = null;
  private activeId: CoverflowArtefakId = 'keris';

  private ambientLight: THREE.AmbientLight | null = null;
  private keySpot: THREE.SpotLight | null = null;
  private warmRim: THREE.PointLight | null = null;
  private coolFill: THREE.DirectionalLight | null = null;
  private dustPoints: THREE.Points | null = null;

  private pointerX = 0;
  private pointerY = 0;
  private stanzaStep = 0;
  private pulseIntensity = 0;
  private isPlaying = false;
  private rafId: number | null = null;
  private loopAktif = true;
  private loopSiapMulai = false;
  private stopObservasi: (() => void) | null = null;
  private abortCtrl = new AbortController();
  private cancelMulaiLoop: (() => void) | null = null;

  constructor(
    container: HTMLElement,
    tema: 'malam' | 'terang' = 'terang',
    initialArtefakId: CoverflowArtefakId = 'keris',
  ) {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: true });
    if (!this.renderer) return;

    this.camera.position.set(0, 1.05, 6.2);
    this.camera.lookAt(0, 0.02, 0);
    void applyStudioHDR(this.renderer, this.scene, {
      signal: this.abortCtrl.signal,
      delayMs: 140,
    });

    this.setupLightingAndPedestal(tema);
    this.scene.add(this.pedestalGroup, this.modelPivot);
    this.muatArtefak(initialArtefakId);
    this.setTheme(tema);
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
        if (this.loopAktif && this.rafId === null) {
          this.loop();
        }
      },
    );
  }

  private setupLightingAndPedestal(tema: 'malam' | 'terang'): void {
    const isDark = tema === 'malam';

    this.ambientLight = new THREE.AmbientLight(0xfff4e2, isDark ? 0.92 : 1.02);
    this.scene.add(this.ambientLight);

    this.keySpot = new THREE.SpotLight(0xfff1d6, 44, 24, Math.PI * 0.28, 0.52, 1.35);
    this.keySpot.position.set(2.2, 5.2, 4.6);
    this.keySpot.castShadow = true;
    const shadowSize = isMobileGpuProfile() ? 512 : 1024;
    this.keySpot.shadow.mapSize.set(shadowSize, shadowSize);
    this.scene.add(this.keySpot);

    this.coolFill = new THREE.DirectionalLight(0xcbd5e1, 1.18);
    this.coolFill.position.set(-4.2, 2.2, 3.2);
    this.scene.add(this.coolFill);

    this.warmRim = new THREE.PointLight(0xe65324, 5.2, 12);
    this.warmRim.position.set(0, 1.8, -2.4);
    this.scene.add(this.warmRim);

    // Pedestal Altar Pendopo 2-Tingkat + Beludru + Lis Kuningan
    this.plinthMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x26201a : 0x3b342d,
      roughness: 0.56,
      metalness: 0.14,
    });
    this.velvetMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x3d1412 : 0x5c1914,
      roughness: 0.9,
      sheen: 0.85,
      sheenColor: new THREE.Color(0xd1491b),
    });
    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6b655,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.45,
    });

    const velvetTop = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.08, 0.04, 36), this.velvetMat);
    velvetTop.position.y = -1.04;
    velvetTop.receiveShadow = true;

    const rimTop = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.026, 14, 48), brassMat);
    rimTop.rotation.x = Math.PI / 2;
    rimTop.position.y = -1.06;

    const plinthUpper = new THREE.Mesh(new THREE.CylinderGeometry(1.14, 1.24, 0.16, 36), this.plinthMat);
    plinthUpper.position.y = -1.14;
    plinthUpper.receiveShadow = true;

    const plinthLower = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.1, 0.24, 24), this.plinthMat);
    plinthLower.position.y = -1.34;
    plinthLower.receiveShadow = true;

    const rimBottom = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.02, 12, 40), brassMat);
    rimBottom.rotation.x = Math.PI / 2;
    rimBottom.position.y = -1.44;

    this.pedestalGroup.add(velvetTop, rimTop, plinthUpper, plinthLower, rimBottom);

    // Partikel Bara Halus Pelita Blencong
    const count = 34;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 4.4;
      posArr[i * 3 + 1] = -1.0 + Math.random() * 3.4;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    this.dustPoints = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xf4c468, size: 0.032, transparent: true, opacity: 0.48 }),
    );
    this.scene.add(this.dustPoints);
  }

  public muatArtefak(id: CoverflowArtefakId): void {
    if (this.activePaket && this.activeId === id) return;
    this.activeId = id;
    if (!this.renderer) return;

    if (this.activePaket) {
      this.modelPivot.remove(this.activePaket.group);
      disposeSceneObject(this.activePaket.group);
      this.activePaket = null;
    }

    const paket = buatPaketSuluk(id);
    const preset = PRESET_SKALA_SULUK[id] ?? PRESET_SKALA_SULUK.keris;

    paket.group.position.set(0, 0, 0);
    paket.group.scale.setScalar(1);
    paket.group.updateMatrixWorld(true);
    const rawBox = new THREE.Box3().setFromObject(paket.group);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    const fitW = 1.92 / Math.max(rawSize.x, 0.35);
    const fitH = 2.05 / Math.max(rawSize.y, 0.35);
    const scaleNorm = Math.min(preset.scale, fitW, fitH);
    paket.group.scale.setScalar(scaleNorm);
    paket.group.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(paket.group);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    // Top permukaan beludru pedestal berada pada y = -1.02
    const targetGroundY = -1.01;
    paket.group.position.set(-center.x, targetGroundY - scaledBox.min.y, -center.z);

    this.modelPivot.add(paket.group);
    this.modelPivot.rotation.y = preset.rotYBase;
    this.activePaket = paket;
    this.pulseIntensity = 1;
    this.container.setAttribute('data-stage-artefak', id);
    this.renderer.render(this.scene, this.camera);
  }

  public aturLarikAktif(idx: number, playing = this.isPlaying): void {
    this.stanzaStep = idx;
    this.isPlaying = playing;
    this.pulseIntensity = 1;
  }

  public aturParalaks(normX: number, normY: number): void {
    this.pointerX = THREE.MathUtils.clamp(normX, -1, 1);
    this.pointerY = THREE.MathUtils.clamp(normY, -1, 1);
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    const isDark = tema === 'malam';
    if (this.ambientLight) {
      this.ambientLight.color.setHex(isDark ? 0xeadfce : 0xfff7ec);
      this.ambientLight.intensity = isDark ? 0.96 : 1.05;
    }
    if (this.warmRim) {
      this.warmRim.color.setHex(isDark ? 0xf26f3e : 0xd1491b);
      this.warmRim.intensity = isDark ? 6.4 : 4.6;
    }
    if (this.plinthMat) {
      this.plinthMat.color.setHex(isDark ? 0x241f1a : 0x3b342d);
    }
    if (this.velvetMat) {
      this.velvetMat.color.setHex(isDark ? 0x3a1412 : 0x5c1914);
    }
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 380, 1);
    const h = Math.max(this.container.clientHeight || 480, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(38, this.camera.aspect, 0.95, 58);
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
    const preset = PRESET_SKALA_SULUK[this.activeId] ?? PRESET_SKALA_SULUK.keris;

    const targetYaw =
      preset.rotYBase +
      this.stanzaStep * 0.24 +
      t * (this.isPlaying ? 0.42 : 0.26) +
      this.pointerX * 0.35;
    this.modelPivot.rotation.y += (targetYaw - this.modelPivot.rotation.y) * 0.08;
    this.modelPivot.position.y = Math.sin(t * (this.isPlaying ? 2.1 : 1.5)) * 0.04;

    if (this.warmRim) {
      this.warmRim.intensity = (5.2 + this.pulseIntensity * 3.4) + Math.sin(t * 4.2) * 0.35;
    }
    this.pulseIntensity *= 0.94;

    if (this.activePaket?.blencongFlame) {
      const flicker = 1 + Math.sin(t * 9.5) * 0.1;
      this.activePaket.blencongFlame.scale.set(0.72 * flicker, 1.55 * flicker, 0.72 * flicker);
      if (this.activePaket.blencongLight) {
        this.activePaket.blencongLight.intensity = 2.3 + flicker * 0.55;
      }
    }
    if (this.activePaket?.orbitAccent) {
      this.activePaket.orbitAccent.rotation.y = t * 1.05;
    }

    const goalCamY = 1.06 - this.pointerY * 0.22;
    const goalCamX = this.pointerX * 0.28;
    this.camera.position.x += (goalCamX - this.camera.position.x) * 0.07;
    this.camera.position.y += (goalCamY - this.camera.position.y) * 0.07;
    this.camera.lookAt(0, -0.02, 0);

    if (this.dustPoints) {
      this.dustPoints.rotation.y = t * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
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
