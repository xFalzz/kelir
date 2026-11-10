// Adegan 3D Ruang Pegang menggunakan Three.js.
// Membangun geometri prosedural Keris, Saron Gamelan, dan Wayang Kulit di depan layar kelir
// dengan lampu blencong yang menjatuhkan bayangan nyata.

import * as THREE from 'three';
import type { BendaPusaka } from '../content/pusaka';
import { lerp } from '../lib/handTracker';

export class ArtifactStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rootGroup: THREE.Group;
  private markerMesh: THREE.Mesh;
  private blencongLight: THREE.SpotLight;
  private rafId: number | null = null;
  private reducedMotion = false;

  private targetRotY = 0.35;
  private targetRotX = 0.12;
  private targetZoom = 2.75;
  private targetFocus = new THREE.Vector3(0, 0, 0);
  private currentFocus = new THREE.Vector3(0, 0, 0);

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement, bendaAwal: BendaPusaka) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#18130F');

    const w = Math.max(280, container.clientWidth || 640);
    const h = Math.max(240, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 40);
    this.camera.position.set(0, 0.15, this.targetZoom);

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Kain kelir di belakang objek tempat bayangan jatuh
    const kelirGeo = new THREE.PlaneGeometry(7.5, 4.8);
    const kelirMat = new THREE.MeshStandardMaterial({
      color: '#F3EBDC',
      roughness: 0.92,
      metalness: 0.02,
    });
    const kelirPlane = new THREE.Mesh(kelirGeo, kelirMat);
    kelirPlane.position.set(0, 0, -0.78);
    kelirPlane.receiveShadow = true;
    this.scene.add(kelirPlane);

    // Bingkai kayu atas & bawah kelir (plangkan)
    const kayuMat = new THREE.MeshStandardMaterial({ color: '#2B1F16', roughness: 0.78 });
    const palangAtas = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.16, 0.14), kayuMat);
    palangAtas.position.set(0, 1.62, -0.74);
    this.scene.add(palangAtas);

    const palangBawah = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.22, 0.18), kayuMat);
    palangBawah.position.set(0, -1.62, -0.74);
    this.scene.add(palangBawah);

    // Pencahayaan lampu blencong hangat
    const ambient = new THREE.AmbientLight('#F3EBDC', 0.58);
    this.scene.add(ambient);

    this.blencongLight = new THREE.SpotLight('#FFD7A3', 7.2, 14, Math.PI / 3.2, 0.55, 1.3);
    this.blencongLight.position.set(0.35, 0.55, 2.9);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.blencongLight.shadow.bias = -0.0005;
    this.scene.add(this.blencongLight);

    const rimLight = new THREE.DirectionalLight('#C84B31', 0.9);
    rimLight.position.set(-2.2, 1.4, 1.2);
    this.scene.add(rimLight);

    // Penanda titik info aktif
    const markerGeo = new THREE.SphereGeometry(0.055, 20, 20);
    const markerMat = new THREE.MeshBasicMaterial({ color: '#C84B31' });
    this.markerMesh = new THREE.Mesh(markerGeo, markerMat);
    this.rootGroup.add(this.markerMesh);

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
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

    this.pasangInteraksiPointer(container);
    this.muatBenda(bendaAwal);
    this.mulaiLoop();
  }

  private pasangInteraksiPointer(el: HTMLElement): void {
    el.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetRotY += dx * 0.01;
      this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX + dy * 0.008));
    });
    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
    el.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        this.ubahZoom(e.deltaY * 0.0018);
      },
      { passive: false },
    );
  }

  muatBenda(benda: BendaPusaka): void {
    // Hapus mesh benda lama kecuali markerMesh
    for (let i = this.rootGroup.children.length - 1; i >= 0; i--) {
      const child = this.rootGroup.children[i];
      if (child !== this.markerMesh) {
        this.rootGroup.remove(child);
      }
    }

    let model: THREE.Group;
    if (benda.id === 'keris') {
      model = this.bangunKeris();
    } else if (benda.id === 'saron') {
      model = this.bangunSaron();
    } else {
      model = this.bangunWayang();
    }

    model.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    this.rootGroup.add(model);
    this.targetRotY = 0.28;
    this.targetRotX = 0.1;
    this.targetZoom = 2.75;

    if (benda.titikInfo[0]) {
      this.fokusKeTitik(benda.titikInfo[0].posisi3D, benda.titikInfo[0].kameraTarget);
    }
  }

  fokusKeTitik(posisiMarker: [number, number, number], targetKamera: [number, number, number]): void {
    this.markerMesh.position.set(posisiMarker[0], posisiMarker[1], posisiMarker[2]);
    this.targetFocus.set(targetKamera[0], targetKamera[1], targetKamera[2]);
  }

  putarManual(deltaY: number, deltaX = 0): void {
    this.targetRotY += deltaY;
    this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX + deltaX));
  }

  ubahZoom(delta: number): void {
    this.targetZoom = Math.max(1.65, Math.min(4.1, this.targetZoom + delta));
  }

  resetPandangan(): void {
    this.targetRotY = 0.28;
    this.targetRotX = 0.1;
    this.targetZoom = 2.75;
    this.targetFocus.set(0, 0, 0);
  }

  terapkanInputTangan(normX: number, normY: number, zoomSkala: number): void {
    this.targetRotY = normX * 1.35;
    this.targetRotX = Math.max(-0.7, Math.min(0.7, -normY * 0.65));
    this.targetZoom = Math.max(1.75, Math.min(3.8, 3.2 - zoomSkala * 0.65));
  }

  ubahUkuran(width: number, height: number): void {
    if (!this.renderer) return;
    const w = Math.max(260, width);
    const h = Math.max(220, height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private bangunKeris(): THREE.Group {
    const g = new THREE.Group();

    const wesiMat = new THREE.MeshStandardMaterial({
      color: '#3A3632',
      metalness: 0.78,
      roughness: 0.32,
    });
    const pamorMat = new THREE.MeshStandardMaterial({
      color: '#D8CFC0',
      metalness: 0.62,
      roughness: 0.35,
    });
    const kayuMat = new THREE.MeshStandardMaterial({
      color: '#5C331C',
      roughness: 0.55,
      metalness: 0.08,
    });
    const pendokMat = new THREE.MeshStandardMaterial({
      color: '#C79A4B',
      metalness: 0.72,
      roughness: 0.28,
    });

    // Wilah berkelok (luk 5) menggunakan rangkaian segmen pipih
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const lebar = (1 - t * 0.82) * 0.16;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(lebar, 0.12, 0.022), wesiMat);
      const simpanganLuk = Math.sin(t * Math.PI * 3) * 0.045 * (1 - t * 0.4);
      seg.position.set(simpanganLuk, -0.15 + i * 0.095, 0);
      seg.rotation.z = Math.cos(t * Math.PI * 3) * 0.14;
      g.add(seg);

      if (i % 2 === 0 && i < 9) {
        const alurPamor = new THREE.Mesh(
          new THREE.BoxGeometry(lebar * 0.52, 0.08, 0.026),
          pamorMat,
        );
        alurPamor.position.copy(seg.position);
        alurPamor.rotation.copy(seg.rotation);
        g.add(alurPamor);
      }
    }

    // Ganja melintang asimetris di pangkal bilah
    const ganja = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.055, 0.04), wesiMat);
    ganja.position.set(0.06, -0.22, 0);
    ganja.rotation.z = -0.08;
    g.add(ganja);

    // Mendak (cincin penghubung)
    const mendak = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.04, 16), pendokMat);
    mendak.position.set(0, -0.27, 0);
    g.add(mendak);

    // Hulu / Deder (gagang ukir melengkung khas Jawa)
    const huluBatang = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.34, 16), kayuMat);
    huluBatang.position.set(-0.03, -0.44, 0);
    huluBatang.rotation.z = 0.22;
    g.add(huluBatang);

    const huluUjung = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), kayuMat);
    huluUjung.position.set(-0.08, -0.6, 0.02);
    g.add(huluUjung);

    // Warangka gayaman & pendok di sisi kiri sebagai pasangan tampilan
    const warangkaAtas = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.06), kayuMat);
    warangkaAtas.position.set(-0.42, -0.26, -0.04);
    warangkaAtas.rotation.z = 0.28;
    g.add(warangkaAtas);

    const gandar = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.72, 0.045), pendokMat);
    gandar.position.set(-0.42, -0.64, -0.04);
    g.add(gandar);

    return g;
  }

  private bangunSaron(): THREE.Group {
    const g = new THREE.Group();

    const perungguMat = new THREE.MeshStandardMaterial({
      color: '#C79A45',
      metalness: 0.78,
      roughness: 0.25,
    });
    const kayuRancakanMat = new THREE.MeshStandardMaterial({
      color: '#5B2314',
      roughness: 0.52,
      metalness: 0.06,
    });
    const emasUkirMat = new THREE.MeshStandardMaterial({
      color: '#B58938',
      metalness: 0.65,
      roughness: 0.35,
    });

    // Rancakan (kotak resonator kayu)
    const badan = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.32, 0.48), kayuRancakanMat);
    badan.position.set(0, -0.18, 0);
    g.add(badan);

    const lisDepan = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.06, 0.5), emasUkirMat);
    lisDepan.position.set(0, -0.02, 0);
    g.add(lisDepan);

    const kakiKiri = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.54), kayuRancakanMat);
    kakiKiri.position.set(-0.68, -0.22, 0);
    g.add(kakiKiri);

    const kakiKanan = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.54), kayuRancakanMat);
    kakiKanan.position.set(0.68, -0.22, 0);
    g.add(kakiKanan);

    // 7 Wilah perunggu dari besar (kiri) ke kecil (kanan)
    for (let i = 0; i < 7; i++) {
      const x = -0.54 + i * 0.18;
      const panjangWilah = 0.46 - i * 0.022;
      const wilah = new THREE.Mesh(
        new THREE.BoxGeometry(0.145, 0.045, panjangWilah),
        perungguMat,
      );
      wilah.position.set(x, 0.04, 0);
      g.add(wilah);

      // Paku penyangga di kedua ujung tiap wilah
      const pakuDepan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.08, 10),
        emasUkirMat,
      );
      pakuDepan.position.set(x, 0.06, panjangWilah * 0.36);
      g.add(pakuDepan);

      const pakuBelakang = pakuDepan.clone();
      pakuBelakang.position.set(x, 0.06, -panjangWilah * 0.36);
      g.add(pakuBelakang);
    }

    // Tabuh (pemukul kayu) di atas kanan
    const gagangTabuh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.42, 14),
      kayuRancakanMat,
    );
    gagangTabuh.position.set(0.45, 0.32, 0.18);
    gagangTabuh.rotation.z = 0.85;
    gagangTabuh.rotation.x = -0.35;
    g.add(gagangTabuh);

    const kepalaTabuh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.05, 0.16, 16),
      emasUkirMat,
    );
    kepalaTabuh.position.set(0.29, 0.44, 0.08);
    kepalaTabuh.rotation.z = -0.7;
    g.add(kepalaTabuh);

    return g;
  }

  private bangunWayang(): THREE.Group {
    const g = new THREE.Group();

    const kulitEmasMat = new THREE.MeshStandardMaterial({
      color: '#C9963E',
      roughness: 0.42,
      metalness: 0.48,
    });
    const aksenMerahMat = new THREE.MeshStandardMaterial({
      color: '#9E2E17',
      roughness: 0.5,
      metalness: 0.2,
    });
    const tandukMat = new THREE.MeshStandardMaterial({
      color: '#EDE3CE',
      roughness: 0.38,
      metalness: 0.1,
    });

    // Mahkota & gelung supit urang khas satria wayang kulit
    const kepala = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.025, 20), kulitEmasMat);
    kepala.rotation.x = Math.PI / 2;
    kepala.position.set(0, 0.48, 0);
    g.add(kepala);

    const hidungMancung = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 12), kulitEmasMat);
    hidungMancung.rotation.z = -Math.PI / 2.2;
    hidungMancung.position.set(0.18, 0.48, 0);
    g.add(hidungMancung);

    const gelung = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 10, 24, Math.PI * 1.35), kulitEmasMat);
    gelung.position.set(-0.08, 0.58, 0);
    g.add(gelung);

    // Badan berukir (tatahan) & dodot
    const dada = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.024), kulitEmasMat);
    dada.position.set(0, 0.18, 0);
    g.add(dada);

    const praba = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.02), aksenMerahMat);
    praba.position.set(-0.18, 0.24, -0.01);
    praba.rotation.z = 0.22;
    g.add(praba);

    const kainDodot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.024), aksenMerahMat);
    kainDodot.position.set(0.02, -0.18, 0);
    g.add(kainDodot);

    // Lengan bersendi & tuding
    const lenganDepan = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.022), kulitEmasMat);
    lenganDepan.position.set(0.28, 0.16, 0.02);
    lenganDepan.rotation.z = -0.35;
    g.add(lenganDepan);

    const tuding = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.68, 8), tandukMat);
    tuding.position.set(0.39, -0.18, 0.03);
    tuding.rotation.z = 0.08;
    g.add(tuding);

    // Cempurit / gapit utama dari atas sampai bawah
    const cempurit = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 1.48, 12), tandukMat);
    cempurit.position.set(-0.02, -0.06, 0.025);
    g.add(cempurit);

    return g;
  }

  private mulaiLoop = (): void => {
    const step = (time: number): void => {
      this.rootGroup.rotation.y = lerp(this.rootGroup.rotation.y, this.targetRotY, 0.12);
      this.rootGroup.rotation.x = lerp(this.rootGroup.rotation.x, this.targetRotX, 0.12);
      this.camera.position.z = lerp(this.camera.position.z, this.targetZoom, 0.12);
      this.currentFocus.lerp(this.targetFocus, 0.12);
      this.camera.lookAt(this.currentFocus);

      if (!this.reducedMotion) {
        // Goyangan lembut nyala lampu minyak blencong
        this.blencongLight.intensity = 7.0 + Math.sin(time * 0.0035) * 0.35;
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
