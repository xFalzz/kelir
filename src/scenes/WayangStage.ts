// Adegan 3D Panggung Kelir untuk memainkan Lakon Kijang Kencana.
// Menampilkan dua wayang bayangan (Sri Rama di kanan & Kidang Kencana di kiri) di depan layar kelir.

import * as THREE from 'three';
import { lerp } from '../lib/handTracker';

export class WayangStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private ramaGroup: THREE.Group;
  private kidangGroup: THREE.Group;
  private blencongLight: THREE.SpotLight;
  private rafId: number | null = null;
  private reducedMotion = false;

  private targetRamaX = 0.45;
  private targetRamaY = 0;
  private targetKidangX = -0.45;
  private targetKidangY = 0;

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#18130F');

    const w = Math.max(280, container.clientWidth || 720);
    const h = Math.max(220, container.clientHeight || 400);
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 30);
    this.camera.position.set(0, 0.05, 3.35);

    // Kain kelir utama
    const kelirMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 3.1),
      new THREE.MeshStandardMaterial({ color: '#F3EBDC', roughness: 0.9, metalness: 0.02 }),
    );
    kelirMesh.position.set(0, 0.05, -0.35);
    kelirMesh.receiveShadow = true;
    this.scene.add(kelirMesh);

    // Plangkan kayu & gedebog (batang pisang tempat menancapkan wayang)
    const kayuMat = new THREE.MeshStandardMaterial({ color: '#2B1F16', roughness: 0.8 });
    const gedebogMat = new THREE.MeshStandardMaterial({ color: '#3E2F1D', roughness: 0.85 });

    const bingkaiAtas = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 0.16), kayuMat);
    bingkaiAtas.position.set(0, 1.56, -0.3);
    this.scene.add(bingkaiAtas);

    const gedebog = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 5.8, 16), gedebogMat);
    gedebog.rotation.z = Math.PI / 2;
    gedebog.position.set(0, -1.38, -0.18);
    this.scene.add(gedebog);

    const ambient = new THREE.AmbientLight('#F3EBDC', 0.52);
    this.scene.add(ambient);

    this.blencongLight = new THREE.SpotLight('#FFD494', 8.5, 14, Math.PI / 2.6, 0.5, 1.2);
    this.blencongLight.position.set(0, 0.65, 2.8);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.scene.add(this.blencongLight);

    this.ramaGroup = this.bangunFigurRama();
    this.kidangGroup = this.bangunFigurKidang();
    this.scene.add(this.ramaGroup);
    this.scene.add(this.kidangGroup);

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);
      this.webglTersedia = true;
    } catch {
      this.renderer = null;
      this.webglTersedia = false;
    }

    this.mulaiLoop();
  }

  private bangunFigurRama(): THREE.Group {
    const g = new THREE.Group();
    const siluetMat = new THREE.MeshStandardMaterial({
      color: '#2A1E17',
      roughness: 0.6,
      metalness: 0.25,
    });
    const emasMat = new THREE.MeshStandardMaterial({
      color: '#C79A45',
      roughness: 0.4,
      metalness: 0.55,
    });

    const badan = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.68, 0.025), siluetMat);
    badan.position.set(0, 0.05, 0);
    badan.castShadow = true;
    g.add(badan);

    const mahkota = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 12), emasMat);
    mahkota.position.set(0.02, 0.56, 0);
    mahkota.rotation.z = -0.18;
    mahkota.castShadow = true;
    g.add(mahkota);

    // Busur panah Sri Rama
    const busur = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.018, 8, 24, Math.PI * 1.15),
      emasMat,
    );
    busur.rotation.z = Math.PI / 2;
    busur.position.set(-0.22, 0.16, 0.02);
    busur.castShadow = true;
    g.add(busur);

    const cempurit = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 1.5, 8), siluetMat);
    cempurit.position.set(0, -0.25, 0);
    cempurit.castShadow = true;
    g.add(cempurit);

    g.position.set(0.65, -0.1, 0.05);
    return g;
  }

  private bangunFigurKidang(): THREE.Group {
    const g = new THREE.Group();
    const emasKijangMat = new THREE.MeshStandardMaterial({
      color: '#D4A23E',
      roughness: 0.35,
      metalness: 0.62,
    });
    const tandukMat = new THREE.MeshStandardMaterial({
      color: '#9E2E17',
      roughness: 0.5,
      metalness: 0.2,
    });

    const badanKijang = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.025), emasKijangMat);
    badanKijang.position.set(0, 0, 0);
    badanKijang.castShadow = true;
    g.add(badanKijang);

    const leher = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.025), emasKijangMat);
    leher.position.set(0.2, 0.22, 0);
    leher.rotation.z = -0.28;
    leher.castShadow = true;
    g.add(leher);

    const kepala = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.025), emasKijangMat);
    kepala.position.set(0.3, 0.36, 0);
    kepala.castShadow = true;
    g.add(kepala);

    const tanduk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.24, 8), tandukMat);
    tanduk.position.set(0.26, 0.52, 0);
    tanduk.rotation.z = 0.25;
    tanduk.castShadow = true;
    g.add(tanduk);

    const cempurit = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 1.35, 8), tandukMat);
    cempurit.position.set(0, -0.32, 0);
    cempurit.castShadow = true;
    g.add(cempurit);

    g.position.set(-0.65, -0.1, 0.08);
    return g;
  }

  aturPosisiTokoh(ramaX: number, kidangX: number, ramaY = 0, kidangY = 0): void {
    this.targetRamaX = Math.max(-1.1, Math.min(1.3, ramaX));
    this.targetKidangX = Math.max(-1.3, Math.min(1.1, kidangX));
    this.targetRamaY = Math.max(-0.35, Math.min(0.45, ramaY));
    this.targetKidangY = Math.max(-0.35, Math.min(0.45, kidangY));
  }

  ubahUkuran(width: number, height: number): void {
    if (!this.renderer) return;
    const w = Math.max(260, width);
    const h = Math.max(200, height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private mulaiLoop = (): void => {
    const step = (time: number): void => {
      this.ramaGroup.position.x = lerp(this.ramaGroup.position.x, this.targetRamaX * 1.45, 0.14);
      this.ramaGroup.position.y = lerp(this.ramaGroup.position.y, -0.08 + this.targetRamaY * 0.4, 0.14);
      this.ramaGroup.rotation.z = (this.targetRamaX * 1.45 - this.ramaGroup.position.x) * -0.35;

      this.kidangGroup.position.x = lerp(
        this.kidangGroup.position.x,
        this.targetKidangX * 1.45,
        0.14,
      );
      this.kidangGroup.position.y = lerp(
        this.kidangGroup.position.y,
        -0.08 + this.targetKidangY * 0.4,
        0.14,
      );
      this.kidangGroup.rotation.z =
        (this.targetKidangX * 1.45 - this.kidangGroup.position.x) * -0.45;

      if (!this.reducedMotion) {
        this.blencongLight.intensity = 8.2 + Math.sin(time * 0.004) * 0.4;
      }

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  };

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
