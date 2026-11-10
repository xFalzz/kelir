// Adegan 3D Panggung Kelir untuk memainkan Lakon Kijang Kencana.
// Menampilkan model 3D volumetrik berartikulasi penuh (tanpa gambar datar 2D):
// Sri Rama dengan sendi lengan & busur Gendewa 3D di kanan, Kidang Kencana dengan kaki berartikulasi & tanduk emas 3D di kiri,
// Gunungan (Kayon) 3D di tepi panggung, lampu minyak Blencong perunggu di atas, serta gedebog batang pisang.

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
  private ramaBahuDepan: THREE.Group | null = null;
  private ramaSikuDepan: THREE.Group | null = null;
  private kidangGroup: THREE.Group;
  private kidangKakiDepan: THREE.Group | null = null;
  private kidangKakiBelakang: THREE.Group | null = null;
  private gununganTepiGroup: THREE.Group;
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

    // Kain kelir utama bertenun mori tempat bayangan 3D jatuh secara nyata
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
    kelirMesh.position.set(0, 0.08, -0.34);
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
    plipitAtas.position.set(0, 1.44, -0.32);
    plipitAtas.receiveShadow = true;
    this.scene.add(plipitAtas);

    const plipitBawah = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.02), plipitMat);
    plipitBawah.position.set(0, -1.16, -0.32);
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

    const gedebogDepan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 5.6, 24),
      gedebogMat,
    );
    gedebogDepan.rotation.z = Math.PI / 2;
    gedebogDepan.position.set(0, -1.42, 0.04);
    gedebogDepan.receiveShadow = true;
    this.scene.add(gedebogDepan);

    // Lampu Blencong Perunggu 3D menggantung di bagian atas tengah panggung
    const perungguBlencongMat = new THREE.MeshPhysicalMaterial({
      color: '#D4A042',
      roughness: 0.28,
      metalness: 0.88,
    });
    const blencongGroup = new THREE.Group();
    blencongGroup.position.set(0, 1.18, 0.65);
    const badanBlencong = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 12),
      perungguBlencongMat,
    );
    badanBlencong.scale.set(1.2, 0.65, 1.4);
    blencongGroup.add(badanBlencong);

    const rantaiBlencong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8),
      perungguBlencongMat,
    );
    rantaiBlencong.position.y = 0.24;
    blencongGroup.add(rantaiBlencong);

    const lidahApiBlencong = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.075, 10),
      new THREE.MeshBasicMaterial({ color: '#FFE082' }),
    );
    lidahApiBlencong.position.set(0, 0.02, -0.11);
    blencongGroup.add(lidahApiBlencong);
    this.scene.add(blencongGroup);

    const hemi = new THREE.HemisphereLight('#FFF0D4', '#24170E', 0.82);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD08E', 13.5, 16, Math.PI / 2.4, 0.45, 1.2);
    this.blencongLight.position.set(0, 0.62, 2.75);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.blencongLight.shadow.bias = -0.00035;
    this.scene.add(this.blencongLight);

    const fillDepan = new THREE.DirectionalLight('#FFE2B5', 1.15);
    fillDepan.position.set(0, 0.5, 3.2);
    this.scene.add(fillDepan);

    // Bangun tokoh 3D volumetrik Sri Rama, Kidang Kencana, dan Gunungan Tepi (Simpingan)
    this.ramaGroup = this.bangunSriRama3D();
    this.ramaGroup.position.set(0.65, -0.04, 0.05);

    this.kidangGroup = this.bangunKidangKencana3D();
    this.kidangGroup.position.set(-0.65, -0.1, 0.08);

    this.gununganTepiGroup = this.bangunGununganSimpingan3D();
    this.gununganTepiGroup.position.set(1.92, -0.05, -0.04);
    this.gununganTepiGroup.rotation.z = -0.08;

    this.scene.add(this.ramaGroup);
    this.scene.add(this.kidangGroup);
    this.scene.add(this.gununganTepiGroup);

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
      this.renderer.toneMappingExposure = 1.12;
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

  private bangunSriRama3D(): THREE.Group {
    const g = new THREE.Group();

    const emasPradaMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A23E',
      normalMap: this.teksturs.kulitNor,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughnessMap: this.teksturs.kulitRough,
      roughness: 0.32,
      metalness: 0.72,
      clearcoat: 0.3,
    });

    const merahSunggingMat = new THREE.MeshPhysicalMaterial({
      color: '#8E2316',
      normalMap: this.teksturs.kulitNor,
      roughness: 0.45,
      metalness: 0.16,
    });

    const hitamWajahMat = new THREE.MeshPhysicalMaterial({
      color: '#1C1612',
      roughness: 0.36,
      clearcoat: 0.4,
    });

    const tandukMat = new THREE.MeshPhysicalMaterial({
      color: '#E5D8BF',
      roughness: 0.34,
      clearcoat: 0.6,
    });

    // Torso 3D Sri Rama
    const torsoShape = new THREE.Shape();
    torsoShape.moveTo(-0.085, -0.14);
    torsoShape.lineTo(0.085, -0.14);
    torsoShape.lineTo(0.135, 0.18);
    torsoShape.lineTo(-0.115, 0.18);
    torsoShape.closePath();

    const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, {
      depth: 0.032,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 3,
    });
    torsoGeo.center();
    const torso = new THREE.Mesh(torsoGeo, emasPradaMat);
    torso.position.set(0, 0.12, 0);
    g.add(torso);

    // Kepala & Mahkota Gelung Supit Urang 3D menghadap ke kiri (ke arah Kidang Kencana)
    const kepala = new THREE.Group();
    kepala.position.set(-0.02, 0.35, 0);
    kepala.rotation.z = 0.16;

    const wajahShape = new THREE.Shape();
    wajahShape.moveTo(-0.075, -0.06);
    wajahShape.lineTo(0.055, -0.06);
    wajahShape.lineTo(0.065, 0.06);
    wajahShape.lineTo(-0.125, 0.03);
    wajahShape.closePath();

    const wajahGeo = new THREE.ExtrudeGeometry(wajahShape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
    wajahGeo.center();
    kepala.add(new THREE.Mesh(wajahGeo, hitamWajahMat));

    const gelungCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.04, 0),
      new THREE.Vector3(0.11, 0.12, 0),
      new THREE.Vector3(0.12, 0.24, 0),
      new THREE.Vector3(0.03, 0.28, 0),
    ]);
    kepala.add(
      new THREE.Mesh(new THREE.TubeGeometry(gelungCurve, 20, 0.024, 10, false), emasPradaMat),
    );
    g.add(kepala);

    // Kain Dodot 3D
    const dodotShape = new THREE.Shape();
    dodotShape.moveTo(-0.14, -0.36);
    dodotShape.lineTo(0.16, -0.36);
    dodotShape.quadraticCurveTo(0.22, -0.16, 0.1, 0.0);
    dodotShape.lineTo(-0.1, 0.0);
    dodotShape.closePath();

    const dodotGeo = new THREE.ExtrudeGeometry(dodotShape, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
    dodotGeo.center();
    const dodot = new THREE.Mesh(dodotGeo, merahSunggingMat);
    dodot.position.set(0.02, -0.18, 0);
    g.add(dodot);

    // Kaki 3D
    for (const [xKaki, rot] of [
      [-0.08, 0.16],
      [0.08, -0.14],
    ] as [number, number][]) {
      const kaki = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.015, 0.34, 10),
        emasPradaMat,
      );
      kaki.position.set(xKaki, -0.44, 0);
      kaki.rotation.z = rot;
      g.add(kaki);
    }

    // Lengan Depan Berartikulasi + Busur Gendewa & Anak Panah
    const bahuDepan = new THREE.Group();
    bahuDepan.position.set(-0.1, 0.24, 0.024);
    bahuDepan.rotation.z = -0.62;
    this.ramaBahuDepan = bahuDepan;

    const lenganAtas = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.014, 0.22, 10),
      emasPradaMat,
    );
    lenganAtas.position.set(0, -0.11, 0);
    bahuDepan.add(lenganAtas);

    const sikuDepan = new THREE.Group();
    sikuDepan.position.set(0, -0.22, 0);
    sikuDepan.rotation.z = -0.9;
    this.ramaSikuDepan = sikuDepan;

    const lenganBawah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 0.22, 10),
      emasPradaMat,
    );
    lenganBawah.position.set(0, -0.11, 0);
    sikuDepan.add(lenganBawah);

    const busur = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.011, 10, 24, Math.PI * 0.85),
      emasPradaMat,
    );
    busur.position.set(-0.02, -0.22, 0.01);
    busur.rotation.z = Math.PI * 0.58;
    sikuDepan.add(busur);

    const tuding = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.006, 0.6, 8),
      tandukMat,
    );
    tuding.position.set(0.08, -0.42, 0.01);
    tuding.rotation.z = 0.65;
    sikuDepan.add(tuding);

    bahuDepan.add(sikuDepan);
    g.add(bahuDepan);

    // Cempurit utama
    const cempurit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.015, 1.42, 12),
      tandukMat,
    );
    cempurit.position.set(0, -0.18, 0);
    g.add(cempurit);

    g.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return g;
  }

  private bangunKidangKencana3D(): THREE.Group {
    const g = new THREE.Group();

    const emasKidangMat = new THREE.MeshPhysicalMaterial({
      color: '#E5AC3F',
      normalMap: this.teksturs.kulitNor,
      normalScale: new THREE.Vector2(0.38, 0.38),
      roughnessMap: this.teksturs.kulitRough,
      roughness: 0.26,
      metalness: 0.82,
      clearcoat: 0.35,
    });

    const merahPermataMat = new THREE.MeshPhysicalMaterial({
      color: '#A52417',
      roughness: 0.3,
      metalness: 0.35,
    });

    const tandukMat = new THREE.MeshPhysicalMaterial({
      color: '#E5D8BF',
      roughness: 0.34,
      clearcoat: 0.6,
    });

    // Badan 3D Kidang Kencana menghadap ke kanan (ke arah Sri Rama)
    const badanShape = new THREE.Shape();
    badanShape.moveTo(-0.22, -0.06);
    badanShape.quadraticCurveTo(0, -0.1, 0.22, -0.04);
    badanShape.quadraticCurveTo(0.28, 0.08, 0.16, 0.14);
    badanShape.quadraticCurveTo(-0.04, 0.12, -0.22, 0.1);
    badanShape.quadraticCurveTo(-0.28, 0.02, -0.22, -0.06);

    const badanGeo = new THREE.ExtrudeGeometry(badanShape, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 3,
    });
    badanGeo.center();
    const badanMesh = new THREE.Mesh(badanGeo, emasKidangMat);
    badanMesh.position.set(0, 0.08, 0);
    g.add(badanMesh);

    // Ornamen tutul permata timbul di punggung Kidang Kencana
    for (const [xTutul, yTutul] of [
      [-0.12, 0.1],
      [-0.02, 0.12],
      [0.08, 0.1],
    ] as [number, number][]) {
      const tutul = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 12),
        merahPermataMat,
      );
      tutul.scale.set(1.2, 0.8, 1.4);
      tutul.position.set(xTutul, yTutul, 0);
      g.add(tutul);
    }

    // Leher & Kepala Kijang 3D menoleh anggun
    const leherCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.12, 0),
      new THREE.Vector3(0.24, 0.24, 0),
      new THREE.Vector3(0.26, 0.34, 0),
    ]);
    const leherMesh = new THREE.Mesh(
      new THREE.TubeGeometry(leherCurve, 16, 0.038, 12, false),
      emasKidangMat,
    );
    g.add(leherMesh);

    const kepalaMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.048, 0.16, 12),
      emasKidangMat,
    );
    kepalaMesh.rotation.z = -Math.PI / 2 + 0.18;
    kepalaMesh.position.set(0.32, 0.36, 0);
    g.add(kepalaMesh);

    // Tanduk bercabang emas (Ranggah Kencana)
    const ranggahCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.26, 0.38, 0),
      new THREE.Vector3(0.18, 0.5, 0.01),
      new THREE.Vector3(0.08, 0.58, 0),
      new THREE.Vector3(0.14, 0.64, 0),
    ]);
    const ranggahMesh = new THREE.Mesh(
      new THREE.TubeGeometry(ranggahCurve, 18, 0.012, 10, false),
      emasKidangMat,
    );
    g.add(ranggahMesh);

    // Kaki Depan & Kaki Belakang Berartikulasi 3D (melompat saat digerakkan)
    const kakiDepanGroup = new THREE.Group();
    kakiDepanGroup.position.set(0.16, 0.02, 0);
    this.kidangKakiDepan = kakiDepanGroup;
    for (const zOff of [-0.016, 0.016]) {
      const kaki = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.01, 0.32, 10),
        emasKidangMat,
      );
      kaki.position.set(0.04, -0.14, zOff);
      kaki.rotation.z = 0.28;
      kakiDepanGroup.add(kaki);
    }
    g.add(kakiDepanGroup);

    const kakiBelakangGroup = new THREE.Group();
    kakiBelakangGroup.position.set(-0.16, 0.02, 0);
    this.kidangKakiBelakang = kakiBelakangGroup;
    for (const zOff of [-0.016, 0.016]) {
      const kaki = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.01, 0.32, 10),
        emasKidangMat,
      );
      kaki.position.set(-0.04, -0.14, zOff);
      kaki.rotation.z = -0.28;
      kakiBelakangGroup.add(kaki);
    }
    g.add(kakiBelakangGroup);

    // Cempurit tanduk
    const cempurit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.014, 1.28, 12),
      tandukMat,
    );
    cempurit.position.set(0, -0.22, 0);
    g.add(cempurit);

    g.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return g;
  }

  private bangunGununganSimpingan3D(): THREE.Group {
    const g = new THREE.Group();

    const kayonMat = new THREE.MeshPhysicalMaterial({
      color: '#C89232',
      normalMap: this.teksturs.kulitNor,
      roughness: 0.38,
      metalness: 0.65,
    });

    const kayonShape = new THREE.Shape();
    kayonShape.moveTo(0, -0.48);
    kayonShape.lineTo(0.22, -0.44);
    kayonShape.bezierCurveTo(0.34, -0.18, 0.32, 0.16, 0.16, 0.42);
    kayonShape.lineTo(0, 0.66);
    kayonShape.lineTo(-0.16, 0.42);
    kayonShape.bezierCurveTo(-0.32, 0.16, -0.34, -0.18, -0.22, -0.44);
    kayonShape.closePath();

    const kayonGeo = new THREE.ExtrudeGeometry(kayonShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
    kayonGeo.center();
    const kayonMesh = new THREE.Mesh(kayonGeo, kayonMat);
    kayonMesh.castShadow = true;
    kayonMesh.receiveShadow = true;
    g.add(kayonMesh);

    const cempurit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.014, 1.38, 10),
      new THREE.MeshStandardMaterial({ color: '#DFD2B8', roughness: 0.4 }),
    );
    cempurit.position.set(0, -0.18, 0);
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
      const t = time * 0.001;
      const prevKidangX = this.kidangGroup.position.x;

      this.ramaGroup.position.x = lerp(this.ramaGroup.position.x, this.targetRamaX * 1.45, 0.14);
      this.ramaGroup.position.y = lerp(
        this.ramaGroup.position.y,
        -0.04 + this.targetRamaY * 0.4 + Math.sin(t * 2.2) * 0.015,
        0.14,
      );
      this.ramaGroup.rotation.z = (this.targetRamaX * 1.45 - this.ramaGroup.position.x) * -0.32;

      this.ramaGroup.position.z =
        0.05 + Math.min(0.14, Math.abs(this.targetRamaX - this.ramaGroup.position.x / 1.45) * 0.25);

      this.kidangGroup.position.x = lerp(
        this.kidangGroup.position.x,
        this.targetKidangX * 1.45,
        0.14,
      );
      this.kidangGroup.position.y = lerp(
        this.kidangGroup.position.y,
        -0.1 + this.targetKidangY * 0.4 + Math.abs(Math.sin(t * 3.8)) * 0.035,
        0.14,
      );
      this.kidangGroup.rotation.z =
        (this.targetKidangX * 1.45 - this.kidangGroup.position.x) * -0.42;

      // Artikulasi hidup lengan Sri Rama dan lompatan kaki Kidang Kencana
      if (!this.reducedMotion) {
        if (this.ramaBahuDepan && this.ramaSikuDepan) {
          this.ramaBahuDepan.rotation.z = -0.62 + Math.sin(t * 2.6) * 0.18;
          this.ramaSikuDepan.rotation.z = -0.9 + Math.cos(t * 2.6) * 0.15;
        }
        const kecepatanKidang = Math.abs(this.kidangGroup.position.x - prevKidangX) * 18 + 1;
        if (this.kidangKakiDepan && this.kidangKakiBelakang) {
          this.kidangKakiDepan.rotation.z = Math.sin(t * 4.5) * 0.28 * Math.min(2.2, kecepatanKidang);
          this.kidangKakiBelakang.rotation.z =
            -Math.sin(t * 4.5) * 0.28 * Math.min(2.2, kecepatanKidang);
        }
        this.gununganTepiGroup.rotation.z = -0.08 + Math.sin(t * 1.4) * 0.025;
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
