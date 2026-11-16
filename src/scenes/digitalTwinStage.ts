import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  BendaPusaka,
  SpesimenBedahId,
  SpesimenBedahTwin,
  TitikInfoPusaka,
} from '../content/pusaka.ts';
import {
  applyStudioHDR,
  attachCadWireframeLayer,
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  pasangObservasiPanggung,
  pinProyeksiBerubah,
} from './threeHelpers.ts';
import {
  buildBatikPusaka3D,
  buildJogloPusaka3D,
  buildKerisPusaka3D,
  buildKidangDanBlencong3D,
  buildPrasastiHanacaraka3D,
  buildSaronPusaka3D,
  buildWayangSriRamaDanBlencong3D,
} from './pusaka3DBuilder.ts';

export type ModeVisualTwin = 'pbr' | 'hibrida' | 'kawat';

const PRESET_KAMERA_PUSAKA: Record<
  SpesimenBedahId,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  keris: { pos: [0.45, 0.28, 7.6], target: [0.06, 0.16, 0] },
  saron: { pos: [0.78, 1.48, 5.95], target: [0.04, 0.1, 0] },
  batik: { pos: [0.34, 0.88, 5.8], target: [0.06, 0.08, 0] },
  joglo: { pos: [4.25, 2.62, 6.05], target: [0, 0.44, 0] },
  wayang: { pos: [0.2, 0.65, 7.45], target: [-0.18, 0.22, 0] },
  kidang: { pos: [0.22, 0.72, 7.35], target: [-0.08, 0.16, 0] },
  hanacaraka: { pos: [0.22, 0.58, 7.15], target: [0, 0.18, 0] },
};

export interface ProyeksiPinTwin {
  id: string;
  x: number;
  y: number;
  terlihat: boolean;
}

function buatTeksturDialTurntable(isDark: boolean): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(cx, cy, 36, cx, cy, 240);
  grad.addColorStop(0, isDark ? 'rgba(224, 179, 90, 0.12)' : 'rgba(180, 140, 82, 0.1)');
  grad.addColorStop(0.75, isDark ? 'rgba(54, 44, 34, 0.22)' : 'rgba(160, 146, 126, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 242, 0, Math.PI * 2);
  ctx.fill();

  const strokePrimary = isDark ? 'rgba(224, 179, 90, 0.45)' : 'rgba(130, 96, 46, 0.42)';
  const strokeSoft = isDark ? 'rgba(243, 236, 224, 0.2)' : 'rgba(40, 36, 30, 0.18)';

  for (const r of [224, 180, 118]) {
    ctx.strokeStyle = r === 224 ? strokePrimary : strokeSoft;
    ctx.lineWidth = r === 224 ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const isMid = deg % 15 === 0;
    const rOuter = 222;
    const rInner = isMajor ? 204 : isMid ? 210 : 216;
    ctx.strokeStyle = isMajor ? strokePrimary : strokeSoft;
    ctx.lineWidth = isMajor ? 2.2 : 1.1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * rInner, cy + Math.sin(rad) * rInner);
    ctx.lineTo(cx + Math.cos(rad) * rOuter, cy + Math.sin(rad) * rOuter);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class DigitalTwinStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(37, 1.33, 0.1, 50);
  private controls: OrbitControls | null = null;
  private container: HTMLElement;

  private artifactGroup: THREE.Group | null = null;
  private floorGrid: THREE.GridHelper | null = null;
  private turntableMesh: THREE.Mesh | null = null;
  private turntableRing: THREE.Mesh | null = null;
  private turntableTex: THREE.CanvasTexture | null = null;
  private cadLineMat: THREE.LineBasicMaterial | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private emberRim: THREE.PointLight | null = null;
  private blencongFlame: THREE.Mesh | null = null;
  private blencongLight: THREE.PointLight | null = null;
  private orbitAccent: THREE.Object3D | null = null;
  private solidMaterials: THREE.Material[] = [];

  private targetExplode = 0;
  private curExplode = 0;
  private modeVisual: ModeVisualTwin = 'hibrida';
  private aksiHidup = true;
  private bendaIdAktif: SpesimenBedahId = 'keris';
  private titikAktif: TitikInfoPusaka[] = [];
  private targetCamFocus = new THREE.Vector3(0.06, 0.14, 0);
  private spesialPulse = 0;
  private scrollProgress = 0;
  private prevScrollProgress = 0;
  private zoomRatio = 1;
  private lastExplodeApplied = -1;
  private explodeTargets: Array<{ obj: THREE.Object3D; base: THREE.Vector3; vec: THREE.Vector3 }> = [];
  private prevPins: ProyeksiPinTwin[] = [];
  private readonly pinWorldScratch = new THREE.Vector3();
  private onPinCb: ((pins: ProyeksiPinTwin[]) => void) | null = null;
  private rafId: number | null = null;
  private loopAktif = true;
  private stopObservasi: (() => void) | null = null;

  constructor(container: HTMLElement, tema: 'malam' | 'terang' = 'terang') {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: true });
    if (!this.renderer) return;

    this.camera.position.set(...PRESET_KAMERA_PUSAKA.keris.pos);
    void applyStudioHDR(this.renderer, this.scene);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 9.5;

    this.ambientLight = new THREE.AmbientLight(0xdbe2ee, 0.88);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfff2df, 2.75);
    this.keyLight.position.set(4.5, 6.5, 5.5);
    this.keyLight.castShadow = true;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x9fc4f0, 1.32);
    this.fillLight.position.set(-4.5, 2.0, 3.5);
    this.scene.add(this.fillLight);

    this.emberRim = new THREE.PointLight(0xff5a1f, 3.8, 15);
    this.emberRim.position.set(-3.2, 1.8, -2.6);
    this.scene.add(this.emberRim);

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

  public muatBenda(benda: BendaPusaka | SpesimenBedahTwin): void {
    this.bendaIdAktif = benda.id;
    this.titikAktif = benda.titikInfo;
    if (!this.renderer) return;

    if (this.artifactGroup) {
      this.scene.remove(this.artifactGroup);
      disposeSceneObject(this.artifactGroup);
    }

    this.solidMaterials = [];
    this.explodeTargets = [];
    this.prevPins = [];
    this.lastExplodeApplied = -1;
    this.blencongFlame = null;
    this.blencongLight = null;
    this.orbitAccent = null;

    const id = benda.id;
    const paket =
      id === 'keris'
        ? buildKerisPusaka3D()
        : id === 'saron'
          ? buildSaronPusaka3D()
          : id === 'batik'
            ? buildBatikPusaka3D()
            : id === 'joglo'
              ? buildJogloPusaka3D()
              : id === 'wayang'
                ? buildWayangSriRamaDanBlencong3D()
                : id === 'kidang'
                  ? buildKidangDanBlencong3D()
                  : buildPrasastiHanacaraka3D();

    this.artifactGroup = paket.group;
    this.blencongFlame = paket.blencongFlame ?? null;
    this.blencongLight = paket.blencongLight ?? null;
    this.orbitAccent = paket.orbitAccent ?? null;

    this.artifactGroup.traverse((child) => {
      if (child.userData.explodeVec) {
        const base = (child.userData.basePos as THREE.Vector3 | undefined) ?? child.position.clone();
        child.userData.basePos = base;
        this.explodeTargets.push({
          obj: child,
          base,
          vec: child.userData.explodeVec as THREE.Vector3,
        });
      }
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && !mesh.userData.isCadOverlay) {
        const mat = mesh.material;
        if (Array.isArray(mat)) this.solidMaterials.push(...mat);
        else if (mat) this.solidMaterials.push(mat);
      }
    });

    this.cadLineMat = attachCadWireframeLayer(this.artifactGroup, 0xff5a1f, 0.34);
    this.scene.add(this.artifactGroup);
    this.terapkanModeVisual(this.modeVisual);
    this.resetKamera(id);
  }

  public resetKamera(id: SpesimenBedahId = this.bendaIdAktif): void {
    const preset = PRESET_KAMERA_PUSAKA[id] ?? PRESET_KAMERA_PUSAKA.keris;
    this.zoomRatio = 1;
    this.camera.position.set(...preset.pos);
    this.camera.fov = hitungFovResponsif(37, this.camera.aspect, 1.22, 60);
    this.camera.updateProjectionMatrix();
    this.targetCamFocus.set(...preset.target);
    this.controls?.target.set(...preset.target);
    this.controls?.update();
  }

  public aturLedakAnatomi(nilai0ke1: number): void {
    this.targetExplode = THREE.MathUtils.clamp(nilai0ke1, 0, 1);
  }

  public aturProgresGulir(norm0ke1: number): void {
    this.scrollProgress = THREE.MathUtils.clamp(norm0ke1, 0, 1);
  }

  public terapkanModeVisual(mode: ModeVisualTwin): void {
    this.modeVisual = mode;
    const isWireOnly = mode === 'kawat';
    const wireOpacity = isWireOnly ? 0.96 : mode === 'hibrida' ? 0.36 : 0;

    for (const mat of this.solidMaterials) {
      const m = mat as THREE.MeshStandardMaterial;
      if (isWireOnly) {
        m.transparent = true;
        m.opacity = 0.04;
        m.colorWrite = false;
        m.depthWrite = false;
      } else if (mode === 'hibrida') {
        m.transparent = true;
        m.opacity = 0.92;
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
    const exp = this.curExplode * 0.58;
    const ex = titik.explodeVec ? titik.explodeVec[0] * exp : 0;
    const ey = titik.explodeVec ? titik.explodeVec[1] * exp : 0;
    const ez = titik.explodeVec ? titik.explodeVec[2] * exp : 0;
    this.targetCamFocus.set(
      titik.posisi[0] + ex,
      titik.posisi[1] + ey,
      titik.posisi[2] + ez,
    );
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
    const isDark = tema === 'malam';

    if (isDark) {
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
        this.ambientLight.intensity = 0.88;
      }
      if (this.keyLight) this.keyLight.intensity = 2.75;
      if (this.fillLight) {
        this.fillLight.color.setHex(0x9fc4f0);
        this.fillLight.intensity = 1.32;
      }
      if (this.emberRim) this.emberRim.intensity = 3.5;
    }

    if (this.floorGrid) {
      this.scene.remove(this.floorGrid);
      this.floorGrid.geometry.dispose();
      const mat = this.floorGrid.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
    const cMain = isDark ? 0x665c4f : 0xb5ae9e;
    const cSub = isDark ? 0x28231d : 0xdbd5c8;
    this.floorGrid = new THREE.GridHelper(6.8, 18, cMain, cSub);
    this.floorGrid.position.y = -2.12;
    this.floorGrid.userData.skipCad = true;
    this.scene.add(this.floorGrid);

    if (this.turntableMesh) {
      this.scene.remove(this.turntableMesh);
      this.turntableMesh.geometry.dispose();
      (this.turntableMesh.material as THREE.Material).dispose();
      this.turntableMesh = null;
    }
    if (this.turntableRing) {
      this.scene.remove(this.turntableRing);
      this.turntableRing.geometry.dispose();
      (this.turntableRing.material as THREE.Material).dispose();
      this.turntableRing = null;
    }
    this.turntableTex?.dispose();
    this.turntableTex = buatTeksturDialTurntable(isDark);

    this.turntableMesh = new THREE.Mesh(
      new THREE.CircleGeometry(2.15, 48),
      new THREE.MeshBasicMaterial({
        map: this.turntableTex,
        transparent: true,
        opacity: isDark ? 0.92 : 0.86,
        depthWrite: false,
      }),
    );
    this.turntableMesh.rotation.x = -Math.PI / 2;
    this.turntableMesh.position.y = -2.105;
    this.turntableMesh.userData.skipCad = true;

    this.turntableRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.94, 0.015, 10, 64),
      new THREE.MeshStandardMaterial({
        color: isDark ? 0xd4a44a : 0x9c7632,
        metalness: 0.85,
        roughness: 0.28,
      }),
    );
    this.turntableRing.rotation.x = Math.PI / 2;
    this.turntableRing.position.y = -2.1;
    this.turntableRing.userData.skipCad = true;

    this.scene.add(this.turntableMesh, this.turntableRing);
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
    const worldV = this.pinWorldScratch;
    const list: ProyeksiPinTwin[] = [];
    const skalaLedak = this.curExplode * 0.58;

    for (const t of this.titikAktif) {
      const ex = t.explodeVec ? t.explodeVec[0] * skalaLedak : 0;
      const ey = t.explodeVec ? t.explodeVec[1] * skalaLedak : 0;
      const ez = t.explodeVec ? t.explodeVec[2] * skalaLedak : 0;
      worldV.set(t.posisi[0] + ex, t.posisi[1] + ey, t.posisi[2] + ez);
      this.artifactGroup.localToWorld(worldV);
      worldV.project(this.camera);
      const x = (worldV.x * 0.5 + 0.5) * w;
      const y = (-worldV.y * 0.5 + 0.5) * h;
      const terlihat = worldV.z > -1 && worldV.z < 1 && x >= 18 && x <= w - 18 && y >= 18 && y <= h - 18;
      list.push({ id: t.id, x, y, terlihat });
    }
    if (pinProyeksiBerubah(this.prevPins, list)) {
      this.prevPins = list;
      this.onPinCb(list);
    }
  }

  private loop = (): void => {
    if (!this.renderer || !this.loopAktif) {
      this.rafId = null;
      return;
    }
    this.rafId = window.requestAnimationFrame(this.loop);

    this.curExplode += (this.targetExplode - this.curExplode) * 0.1;

    const scrollDelta = this.scrollProgress - this.prevScrollProgress;
    this.prevScrollProgress += scrollDelta * 0.16;

    if (this.artifactGroup) {
      if (this.aksiHidup) {
        this.artifactGroup.rotation.y += 0.005 + this.spesialPulse * 0.028;
      }
      if (Math.abs(scrollDelta) > 0.0002) {
        this.artifactGroup.rotation.y += scrollDelta * 0.35;
      }

      if (Math.abs(this.curExplode - this.lastExplodeApplied) > 0.0004) {
        this.lastExplodeApplied = this.curExplode;
        const skalaLedak = this.curExplode * 0.58;
        for (const item of this.explodeTargets) {
          item.obj.position.set(
            item.base.x + item.vec.x * skalaLedak,
            item.base.y + item.vec.y * skalaLedak,
            item.base.z + item.vec.z * skalaLedak,
          );
        }
      }
    }

    if (this.turntableMesh) {
      this.turntableMesh.rotation.z = -(this.artifactGroup?.rotation.y ?? 0);
    }
    if (this.emberRim) {
      this.emberRim.position.y = 1.8 + this.scrollProgress * 1.4;
    }
    if (this.orbitAccent) {
      this.orbitAccent.rotation.y = performance.now() * 0.001 * 0.9;
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

  /** Mengambil potret PNG sesaat dari frame WebGL aktif tanpa mengaktifkan preserveDrawingBuffer permanen. */
  public tangkapPotretPng(): string | null {
    if (!this.renderer) return null;
    try {
      this.renderer.render(this.scene, this.camera);
      return this.renderer.domElement.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  public destroy(): void {
    this.loopAktif = false;
    this.stopObservasi?.();
    this.stopObservasi = null;
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    this.controls?.dispose();
    this.turntableTex?.dispose();
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
