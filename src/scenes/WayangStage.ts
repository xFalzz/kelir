// Adegan 3D Panggung Kelir untuk memainkan Lakon Kijang Kencana.
// Menampilkan dua wayang kulit museum asli (Sri Rama TMnr 3582-30 di kanan & Kidang Kencana TMnr 809-167o di kiri)
// dengan tekstur PBR kulit kerbau, cempurit tanduk, gedebog batang pisang, dan bayangan tatahan nyata di kain kelir.

import * as THREE from 'three';
import { lerp } from '../lib/handTracker';
import {
  ambilKoleksiTeksturPBR,
  pasangLingkunganPBR,
  type KoleksiTeksturPBR,
} from './pbrMaterials';

export class WayangStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private ramaGroup: THREE.Group;
  private kidangGroup: THREE.Group;
  private blencongLight: THREE.SpotLight;
  private teksturs: KoleksiTeksturPBR;
  private rafId: number | null = null;
  private reducedMotion = false;

  private targetRamaX = 0.45;
  private targetRamaY = 0;
  private targetKidangX = -0.45;
  private targetKidangY = 0;

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#120D09');

    const w = Math.max(280, container.clientWidth || 720);
    const h = Math.max(220, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 30);
    this.camera.position.set(0, 0.06, 3.25);

    this.teksturs = ambilKoleksiTeksturPBR();

    // Kain kelir utama bertenun mori
    const kelirMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 3.15),
      new THREE.MeshStandardMaterial({
        map: this.teksturs.tenunKelirDiff,
        bumpMap: this.teksturs.tenunKelirBump,
        bumpScale: 0.008,
        roughness: 0.88,
        metalness: 0.02,
      }),
    );
    kelirMesh.position.set(0, 0.08, -0.32);
    kelirMesh.receiveShadow = true;
    this.scene.add(kelirMesh);

    // Pita plipit merah-emas di tepi atas dan bawah kelir
    const plipitMat = new THREE.MeshStandardMaterial({
      color: '#6E1D11',
      bumpMap: this.teksturs.tenunKelirBump,
      bumpScale: 0.005,
      roughness: 0.72,
    });
    const plipitAtas = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.11, 0.02), plipitMat);
    plipitAtas.position.set(0, 1.44, -0.3);
    plipitAtas.receiveShadow = true;
    this.scene.add(plipitAtas);

    const plipitBawah = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.02), plipitMat);
    plipitBawah.position.set(0, -1.16, -0.3);
    plipitBawah.receiveShadow = true;
    this.scene.add(plipitBawah);

    // Plangkan kayu jati PBR & gedebog (batang pisang tempat menancapkan wayang)
    const kayuMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      roughness: 0.58,
      clearcoat: 0.3,
    });

    const bingkaiAtas = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.18, 0.18), kayuMat);
    bingkaiAtas.position.set(0, 1.56, -0.26);
    this.scene.add(bingkaiAtas);

    const tiangKiri = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), kayuMat);
    tiangKiri.position.set(-2.96, 0.05, -0.26);
    this.scene.add(tiangKiri);

    const tiangKanan = tiangKiri.clone();
    tiangKanan.position.set(2.96, 0.05, -0.26);
    this.scene.add(tiangKanan);

    const gedebogMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.gedebogDiff,
      bumpMap: this.teksturs.gedebogBump,
      bumpScale: 0.02,
      roughness: 0.78,
    });
    const gedebogUtama = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 5.9, 28),
      gedebogMat,
    );
    gedebogUtama.rotation.z = Math.PI / 2;
    gedebogUtama.position.set(0, -1.32, -0.14);
    gedebogUtama.receiveShadow = true;
    this.scene.add(gedebogUtama);

    // Gedebog kedua (pendamping bawah) khas panggung pedalangan Yogyakarta
    const gedebogDepan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 5.6, 24),
      gedebogMat,
    );
    gedebogDepan.rotation.z = Math.PI / 2;
    gedebogDepan.position.set(0, -1.42, 0.04);
    gedebogDepan.receiveShadow = true;
    this.scene.add(gedebogDepan);

    const hemi = new THREE.HemisphereLight('#FFF0D4', '#24170E', 0.78);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD08E', 13.5, 16, Math.PI / 2.4, 0.45, 1.2);
    this.blencongLight.position.set(0, 0.62, 2.75);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 2048;
    this.blencongLight.shadow.mapSize.height = 2048;
    this.blencongLight.shadow.bias = -0.00035;
    this.scene.add(this.blencongLight);

    const fillDepan = new THREE.DirectionalLight('#FFE2B5', 1.1);
    fillDepan.position.set(0, 0.5, 3.2);
    this.scene.add(fillDepan);

    this.ramaGroup = this.bangunWayangTokoh(this.teksturs.wayangRamaMap, 1.12, 1.1, false);
    this.ramaGroup.position.set(0.65, -0.04, 0.04);

    // Kidang Kencana menghadap ke kanan (ke arah Sri Rama)
    this.kidangGroup = this.bangunWayangTokoh(this.teksturs.wayangKidangMap, 0.96, 0.8, false);
    this.kidangGroup.position.set(-0.65, -0.08, 0.08);

    this.scene.add(this.ramaGroup);
    this.scene.add(this.kidangGroup);

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      pasangLingkunganPBR(this.renderer, this.scene);
      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);
      this.webglTersedia = true;
    } catch {
      this.renderer = null;
      this.webglTersedia = false;
    }

    this.mulaiLoop();
  }

  private bangunWayangTokoh(
    petaTekstur: THREE.Texture,
    lebar: number,
    tinggi: number,
    balikHorizontal: boolean,
  ): THREE.Group {
    const g = new THREE.Group();

    const kulitMat = new THREE.MeshPhysicalMaterial({
      map: petaTekstur,
      normalMap: this.teksturs.kulitNor,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughnessMap: this.teksturs.kulitRough,
      roughness: 0.46,
      metalness: 0.2,
      clearcoat: 0.2,
      alphaTest: 0.32,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const depthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: petaTekstur,
      alphaTest: 0.35,
    });

    const distMat = new THREE.MeshDistanceMaterial({
      map: petaTekstur,
      alphaTest: 0.35,
    });

    // Dua lapis tipis agar wayang memiliki ketebalan pahatan kulit asli
    for (const zOffset of [-0.003, 0.003]) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(lebar, tinggi), kulitMat);
      mesh.position.set(0, 0.14, zOffset);
      if (balikHorizontal) {
        mesh.scale.x = -1;
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.customDepthMaterial = depthMat;
      mesh.customDistanceMaterial = distMat;
      g.add(mesh);
    }

    // Gapit / Cempurit tanduk kerbau yang menancap ke gedebog
    const tandukMat = new THREE.MeshPhysicalMaterial({
      color: '#DFD2B8',
      roughness: 0.34,
      metalness: 0.08,
      clearcoat: 0.6,
    });
    const cempurit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.015, 1.42, 14),
      tandukMat,
    );
    cempurit.position.set(0, -0.24, 0.012);
    cempurit.castShadow = true;
    g.add(cempurit);

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
      this.ramaGroup.position.y = lerp(
        this.ramaGroup.position.y,
        -0.04 + this.targetRamaY * 0.4,
        0.14,
      );
      this.ramaGroup.rotation.z = (this.targetRamaX * 1.45 - this.ramaGroup.position.x) * -0.32;

      // Jarak wayang ke kelir sedikit berubah saat bergerak untuk efek bayangan blencong autentik
      this.ramaGroup.position.z =
        0.04 + Math.min(0.14, Math.abs(this.targetRamaX - this.ramaGroup.position.x / 1.45) * 0.25);

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
        (this.targetKidangX * 1.45 - this.kidangGroup.position.x) * -0.42;

      if (!this.reducedMotion) {
        this.blencongLight.intensity = 13.2 + Math.sin(time * 0.0042) * 0.55;
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
