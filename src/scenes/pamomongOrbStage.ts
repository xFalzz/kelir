import * as THREE from 'three';
import { applyStudioHDR, createSafeWebGLRenderer, disposeSceneObject } from './threeHelpers.ts';

function buatTeksturOrbMetalik(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  baseGrad.addColorStop(0, '#32394c');
  baseGrad.addColorStop(0.5, '#131620');
  baseGrad.addColorStop(1, '#293040');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Alur panel mekanis ekuator
  ctx.strokeStyle = 'rgba(255, 90, 31, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 445);
  ctx.lineTo(1024, 445);
  ctx.stroke();

  // Sabuk garis metalik vertikal berkilau mengitari belahan tengah-bawah bola ala ZEGG-BOT
  for (let rep = 0; rep < 4; rep++) {
    const base = rep * 256;
    const stripes = [
      [base + 34, 44, '#f1f5f9'],
      [base + 98, 36, '#94a3b8'],
      [base + 154, 48, '#ffffff'],
    ] as const;
    for (const [x, w, col] of stripes) {
      const grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#181c26');
      grad.addColorStop(0.5, col);
      grad.addColorStop(1, '#181c26');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 456, w, 568);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class PamomongOrbStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  private container: HTMLElement;
  private orbGroup = new THREE.Group();
  private mataKiri!: THREE.Mesh;
  private mataKanan!: THREE.Mesh;
  private cincinLuar!: THREE.Mesh;
  private cincinDalam!: THREE.Mesh;
  private rafId: number | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private energyPulse = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: false });
    if (!this.renderer) return;

    this.camera.position.set(0, 0, 4.35);
    void applyStudioHDR(this.renderer, this.scene);

    this.scene.add(new THREE.HemisphereLight(0xf8fafc, 0x18181b, 1.45));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(3.8, 5.2, 6.2);
    this.scene.add(keyLight);

    const sideSoftbox = new THREE.DirectionalLight(0xe2e8f0, 2.4);
    sideSoftbox.position.set(-5.2, 2.2, 4.2);
    this.scene.add(sideSoftbox);

    const rimEmber = new THREE.PointLight(0xff5a1f, 4.6, 14);
    rimEmber.position.set(-2.8, 2.4, -1.8);
    this.scene.add(rimEmber);

    const fillCool = new THREE.PointLight(0x93c5fd, 2.6, 12);
    fillCool.position.set(3.2, -3.0, 3.2);
    this.scene.add(fillCool);

    this.bangunOrb();
    this.ubahUkuran();
    this.loop();
  }

  private bangunOrb(): void {
    const mapTex = buatTeksturOrbMetalik();

    // 1. Badan Bola Utama Chrome-Obsidian
    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: mapTex,
      color: 0xe2e8f0,
      metalness: 0.72,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.18, 64, 64), bodyMat);
    this.orbGroup.add(sphere);

    // Sabuk Cincin Mekanis di Belahan Tengah
    const seamBelt = new THREE.Mesh(
      new THREE.TorusGeometry(1.185, 0.014, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0x090a0d, metalness: 0.9, roughness: 0.2 }),
    );
    seamBelt.rotation.x = Math.PI / 2;
    seamBelt.position.y = -0.05;
    this.orbGroup.add(seamBelt);

    // 2. Bingkai & Visor Kaca Gelap di Depan
    const visorBezel = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.39, 0.66, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e2330, metalness: 0.88, roughness: 0.22 }),
    );
    visorBezel.rotation.z = Math.PI / 2;
    visorBezel.position.set(0, 0.22, 0.86);
    visorBezel.scale.set(0.96, 1.06, 0.44);
    this.orbGroup.add(visorBezel);

    const visor = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.36, 0.62, 16, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0x040507,
        metalness: 0.28,
        roughness: 0.04,
        clearcoat: 1,
      }),
    );
    visor.rotation.z = Math.PI / 2;
    visor.position.set(0, 0.22, 0.91);
    visor.scale.set(0.95, 1.05, 0.45);
    this.orbGroup.add(visor);

    // 3. Sepasang Mata LED Bercahaya + Cincin Iris
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mataKiri = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.14, 10, 18), eyeMat);
    this.mataKiri.position.set(-0.24, 0.24, 1.16);
    this.mataKiri.scale.z = 0.25;

    this.mataKanan = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.14, 10, 18), eyeMat);
    this.mataKanan.position.set(0.24, 0.24, 1.16);
    this.mataKanan.scale.z = 0.25;
    this.orbGroup.add(this.mataKiri, this.mataKanan);

    // 4. Sepasang Ear-Node Akustik Kanan & Kiri + Cincin Jingga Pamomong (#FF5A1F)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      emissive: 0xff4500,
      emissiveIntensity: 1.5,
      roughness: 0.18,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x1e2028,
      metalness: 0.88,
      roughness: 0.18,
    });

    for (const side of [-1, 1]) {
      const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.03, 14, 36), ringMat);
      earRing.rotation.y = Math.PI / 2;
      earRing.position.set(side * 1.16, 0.08, 0);

      const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 28), capMat);
      earCap.rotation.z = Math.PI / 2;
      earCap.position.set(side * 1.2, 0.08, 0);
      this.orbGroup.add(earRing, earCap);
    }

    // 5. Dua Cincin Gyroskopik Orbital Luar
    this.cincinLuar = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.015, 12, 72),
      new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.52 }),
    );
    this.cincinLuar.rotation.x = Math.PI * 0.42;

    this.cincinDalam = new THREE.Mesh(
      new THREE.TorusGeometry(1.36, 0.01, 10, 64),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.32 }),
    );
    this.cincinDalam.rotation.y = Math.PI * 0.35;

    this.orbGroup.add(this.cincinLuar, this.cincinDalam);
    this.scene.add(this.orbGroup);
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
    const w = Math.max(this.container.clientWidth || 300, 180);
    const h = Math.max(this.container.clientHeight || 300, 180);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private loop = (): void => {
    this.rafId = window.requestAnimationFrame(this.loop);
    if (!this.renderer) return;

    const t = performance.now() * 0.001;
    this.orbGroup.position.y = Math.sin(t * 1.8) * 0.09;

    const targetRotY = this.pointerX * 0.42;
    const targetRotX = -this.pointerY * 0.26;
    this.orbGroup.rotation.y += (targetRotY - this.orbGroup.rotation.y) * 0.08;
    this.orbGroup.rotation.x += (targetRotX - this.orbGroup.rotation.x) * 0.08;

    this.cincinLuar.rotation.z += 0.009 + this.energyPulse * 0.06;
    this.cincinDalam.rotation.x -= 0.007 + this.energyPulse * 0.04;

    const eyeScaleY = 1 + this.energyPulse * 0.35 + (Math.sin(t * 0.8) > 0.96 ? -0.68 : 0);
    this.mataKiri.scale.y = Math.max(0.2, eyeScaleY);
    this.mataKanan.scale.y = Math.max(0.2, eyeScaleY);
    this.energyPulse *= 0.93;

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
