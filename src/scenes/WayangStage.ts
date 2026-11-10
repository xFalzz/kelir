// Adegan 3D Panggung Kelir untuk memainkan Lakon Kijang Kencana.
// Menampilkan model 3D volumetrik Tatah-Sungging berartikulasi penuh sesuai pakem Wayang Kulit Purwa:
// - Sri Rama dengan Gelung Supit Urang berkrawangan, Garuda Mungkur polikrom, Dodot Bokongan Sembuliyan,
//   Cempurit tanduk melengkung S, serta 2 lengan pahat pipih dengan tangkai Tuding vertikal yang hidup.
// - Kidang Kencana dengan 4 kaki berartikulasi, kepala menoleh, ekor hidup, & Ranggah Kencana bercabang.
// - Gunungan (Kayon) 3D berpahat krawangan (Gapura Bersayap, Banaspati, Pohon Kalpataru) & Simpingan Wayang di tepi panggung.
// - Kemudi Olah Sabet Dalang: mendukung gestur 21 titik tangan (Cempurit + 2 Tuding + Kedalaman Kelir)
//   serta seret langsung (direct drag) pada Tuding, Cempurit, dan tokoh di kanvas 3D.

import * as THREE from 'three';
import { audioBudaya } from '../lib/audioBudaya';
import { lerp, type FrameTangan } from '../lib/handTracker';
import {
  ambilKoleksiTeksturPBR,
  pasangLingkunganPBR,
  type KoleksiTeksturPBR,
} from './pbrMaterials';
import {
  ambilTeksturSunggingWayang,
  bangunGununganKayonRealistis3D,
  bangunKidangKencanaRealistis3D,
  bangunSimpinganWayang3D,
  bangunSriRamaRealistis3D,
  type RigKidangKencana3D,
  type RigSriRama3D,
} from './wayang3DBuilder';

export type PoseSabetDalang =
  | 'sembah'
  | 'menthang-gendewa'
  | 'tuding-menunjuk'
  | 'kiprah-sabetan';

type ModeSeretKanvas =
  | 'none'
  | 'kamera'
  | 'cempurit-rama'
  | 'tuding-depan-rama'
  | 'tuding-belakang-rama'
  | 'cempurit-kidang';

export class WayangStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rigRama: RigSriRama3D;
  private rigKidang: RigKidangKencana3D;
  private gununganKananGroup: THREE.Group;
  private gununganKiriGroup: THREE.Group;
  private anakPanahGroup: THREE.Group | null = null;
  private partikelBlencongPoints: THREE.Points | null = null;
  private lidahApiMesh: THREE.Mesh | null = null;
  private panahMeluncur = false;
  private progresPanah = 0;
  private sabetanKayonAktif = false;
  private progresKayon = 0;
  private blencongLight: THREE.SpotLight;
  private teksturs: KoleksiTeksturPBR;
  private rafId: number | null = null;
  private reducedMotion = false;
  private waktuGesturTerakhir = 0;

  private targetRamaX = 0.45;
  private targetRamaY = 0;
  private targetKidangX = -0.45;
  private targetKidangY = 0;

  // Parameter Olah Sabet Dalang (Cempurit, Kedalaman Kelir, & 2 Tuding Lengan)
  private targetCondhongRama = 0;
  private targetCondhongKidang = 0;
  private targetKedalamanRamaZ = 0.08;
  private targetBahuDepanZ = -0.38;
  private targetSikuDepanZ = -0.88;
  private targetBahuBelakangZ = 0.35;
  private targetSikuBelakangZ = -1.18;
  private modeKiprahAktif = false;

  private targetKameraX = 0.08;
  private targetKameraY = 0.06;
  private targetKameraZ = 3.12;
  private modeSeret: ModeSeretKanvas = 'none';
  private pointerTerakhirX = 0;
  private pointerTerakhirY = 0;

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#120D09');

    const w = Math.max(280, container.clientWidth || 720);
    const h = Math.max(220, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 30);
    this.camera.position.set(this.targetKameraX, this.targetKameraY, this.targetKameraZ);

    this.teksturs = ambilKoleksiTeksturPBR();
    const teksturSungging = ambilTeksturSunggingWayang();

    // Kain kelir utama bertenun mori dengan rona pijar lampu Blencong tempat bayangan krawangan 3D jatuh
    const kelirMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 3.15),
      new THREE.MeshStandardMaterial({
        map: teksturSungging.kelirBlencongDiff,
        bumpMap: this.teksturs.tenunKelirBump,
        bumpScale: 0.012,
        roughness: 0.84,
        metalness: 0.02,
      }),
    );
    kelirMesh.position.set(0, 0.08, -0.34);
    kelirMesh.receiveShadow = true;
    this.scene.add(kelirMesh);

    const plipitMat = new THREE.MeshStandardMaterial({
      color: '#6E1D11',
      bumpMap: this.teksturs.tenunKelirBump,
      bumpScale: 0.006,
      roughness: 0.68,
    });
    const plipitAtas = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.11, 0.024), plipitMat);
    plipitAtas.position.set(0, 1.44, -0.32);
    plipitAtas.receiveShadow = true;
    this.scene.add(plipitAtas);

    const plipitBawah = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.024), plipitMat);
    plipitBawah.position.set(0, -1.16, -0.32);
    plipitBawah.receiveShadow = true;
    this.scene.add(plipitBawah);

    const kayuMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      roughness: 0.52,
      clearcoat: 0.36,
    });

    const bingkaiAtas = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.18, 0.2), kayuMat);
    bingkaiAtas.position.set(0, 1.56, -0.25);
    this.scene.add(bingkaiAtas);

    const tiangKiri = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 0.2), kayuMat);
    tiangKiri.position.set(-2.96, 0.05, -0.25);
    this.scene.add(tiangKiri);

    const tiangKanan = tiangKiri.clone();
    tiangKanan.position.set(2.96, 0.05, -0.25);
    this.scene.add(tiangKanan);

    const gedebogMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.gedebogDiff,
      bumpMap: this.teksturs.gedebogBump,
      bumpScale: 0.024,
      roughness: 0.74,
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

    const perungguBlencongMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A444',
      roughness: 0.24,
      metalness: 0.9,
      clearcoat: 0.38,
    });
    const blencongGroup = new THREE.Group();
    blencongGroup.position.set(0, 1.18, 0.65);
    const badanBlencong = new THREE.Mesh(
      new THREE.SphereGeometry(0.088, 18, 14),
      perungguBlencongMat,
    );
    badanBlencong.scale.set(1.3, 0.65, 1.45);
    blencongGroup.add(badanBlencong);

    for (const sisiSayap of [-1, 1]) {
      const sayapBlencong = new THREE.Mesh(
        new THREE.ConeGeometry(0.045, 0.14, 8),
        perungguBlencongMat,
      );
      sayapBlencong.rotation.z = sisiSayap * (Math.PI / 2 - 0.3);
      sayapBlencong.position.set(sisiSayap * 0.12, 0.02, 0);
      blencongGroup.add(sayapBlencong);
    }

    const rantaiBlencong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8),
      perungguBlencongMat,
    );
    rantaiBlencong.position.y = 0.24;
    blencongGroup.add(rantaiBlencong);

    const lidahApiBlencong = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.085, 12),
      new THREE.MeshBasicMaterial({ color: '#FFE48F' }),
    );
    lidahApiBlencong.position.set(0, 0.025, -0.11);
    this.lidahApiMesh = lidahApiBlencong;
    blencongGroup.add(lidahApiBlencong);
    this.scene.add(blencongGroup);

    const jumlahPartikel = 42;
    const posisiPartikel = new Float32Array(jumlahPartikel * 3);
    for (let i = 0; i < jumlahPartikel; i++) {
      posisiPartikel[i * 3] = (Math.sin(i * 19.3) - 0.5) * 3.6;
      posisiPartikel[i * 3 + 1] = -0.8 + (((i * 7) % jumlahPartikel) / jumlahPartikel) * 1.9;
      posisiPartikel[i * 3 + 2] = -0.15 + Math.cos(i * 11.7) * 0.22;
    }
    const partikelGeo = new THREE.BufferGeometry();
    partikelGeo.setAttribute('position', new THREE.BufferAttribute(posisiPartikel, 3));
    const partikelMat = new THREE.PointsMaterial({
      color: '#FFD77A',
      size: 0.024,
      transparent: true,
      opacity: 0.52,
    });
    this.partikelBlencongPoints = new THREE.Points(partikelGeo, partikelMat);
    this.scene.add(this.partikelBlencongPoints);

    const hemi = new THREE.HemisphereLight('#FFF0D4', '#24170E', 0.92);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD08E', 15.2, 16, Math.PI / 2.2, 0.42, 1.15);
    this.blencongLight.position.set(0, 0.65, 2.75);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.blencongLight.shadow.bias = -0.00035;
    this.scene.add(this.blencongLight);

    const rimKanan = new THREE.DirectionalLight('#FFDF9E', 1.7);
    rimKanan.position.set(2.2, 0.85, 1.9);
    this.scene.add(rimKanan);

    const rimKiri = new THREE.DirectionalLight('#E88B48', 1.3);
    rimKiri.position.set(-2.2, 0.55, 1.6);
    this.scene.add(rimKiri);

    this.rigRama = bangunSriRamaRealistis3D(this.teksturs);
    this.rigRama.group.position.set(0.65, -0.04, 0.08);
    this.rigRama.group.rotation.y = -0.12;

    this.rigKidang = bangunKidangKencanaRealistis3D(this.teksturs);
    this.rigKidang.group.position.set(-0.65, -0.08, 0.1);
    this.rigKidang.group.rotation.y = 0.14;

    this.gununganKananGroup = bangunGununganKayonRealistis3D(this.teksturs, 0.98);
    this.gununganKananGroup.position.set(1.88, -0.04, -0.02);
    this.gununganKananGroup.rotation.z = -0.06;
    this.gununganKananGroup.rotation.y = -0.16;

    this.gununganKiriGroup = bangunGununganKayonRealistis3D(this.teksturs, 0.92);
    this.gununganKiriGroup.position.set(-1.92, -0.06, -0.04);
    this.gununganKiriGroup.rotation.z = 0.07;
    this.gununganKiriGroup.rotation.y = 0.16;

    // Simpingan Wayang di tepi kiri dan kanan gedebog (sesuai foto referensi 3)
    const simpinganKanan = bangunSimpinganWayang3D(this.teksturs, 1);
    simpinganKanan.position.set(2.38, -0.08, -0.08);
    const simpinganKiri = bangunSimpinganWayang3D(this.teksturs, -1);
    simpinganKiri.position.set(-2.38, -0.08, -0.08);

    this.scene.add(this.rigRama.group);
    this.scene.add(this.rigKidang.group);
    this.scene.add(this.gununganKananGroup);
    this.scene.add(this.gununganKiriGroup);
    this.scene.add(simpinganKanan);
    this.scene.add(simpinganKiri);

    const panahGroup = new THREE.Group();
    const batangPanah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.46, 8),
      new THREE.MeshPhysicalMaterial({
        color: '#F2C65A',
        metalness: 0.88,
        roughness: 0.2,
        emissive: new THREE.Color('#CFA048'),
        emissiveIntensity: 0.4,
      }),
    );
    batangPanah.rotation.z = Math.PI / 2;
    panahGroup.add(batangPanah);

    const mataPanahCakra = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.085, 8),
      new THREE.MeshPhysicalMaterial({
        color: '#FFF4C2',
        metalness: 0.94,
        roughness: 0.14,
      }),
    );
    mataPanahCakra.rotation.z = Math.PI / 2;
    mataPanahCakra.position.x = -0.25;
    panahGroup.add(mataPanahCakra);

    const buluPanah = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.032, 0.008),
      new THREE.MeshStandardMaterial({ color: '#B81D13', roughness: 0.35 }),
    );
    buluPanah.position.x = 0.19;
    panahGroup.add(buluPanah);

    panahGroup.position.set(0.35, 0.08, 0.11);
    panahGroup.visible = false;
    this.anakPanahGroup = panahGroup;
    this.scene.add(panahGroup);

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
      this.renderer.toneMappingExposure = 1.15;
      pasangLingkunganPBR(this.renderer, this.scene);
      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);
      this.webglTersedia = true;
    } catch {
      this.renderer = null;
      this.webglTersedia = false;
    }

    this.pasangInteraksiDalang3D(container);
    this.mulaiLoop();
  }

  // Interaksi langsung pada kanvas 3D: seret Tuding Depan, Tuding Belakang, Cempurit Sri Rama, Kidang, atau Kamera
  private pasangInteraksiDalang3D(el: HTMLElement): void {
    el.addEventListener('pointerdown', (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);

      const ramaScreenX = this.rigRama.group.position.x / 1.85;
      const kidangScreenX = this.rigKidang.group.position.x / 1.85;

      // Tentukan bagian mana yang sedang dipegang Dalang
      if (Math.abs(nx - (ramaScreenX - 0.14)) < 0.14 && ny < 0.25 && ny > -0.65) {
        this.modeSeret = 'tuding-depan-rama';
        audioBudaya.bunyikanCempalaKeprak('cempala');
      } else if (Math.abs(nx - (ramaScreenX + 0.14)) < 0.14 && ny < 0.25 && ny > -0.65) {
        this.modeSeret = 'tuding-belakang-rama';
        audioBudaya.bunyikanCempalaKeprak('cempala');
      } else if (Math.abs(nx - ramaScreenX) < 0.22 && ny > -0.75 && ny < 0.55) {
        this.modeSeret = 'cempurit-rama';
      } else if (Math.abs(nx - kidangScreenX) < 0.24 && ny > -0.75 && ny < 0.55) {
        this.modeSeret = 'cempurit-kidang';
      } else {
        this.modeSeret = 'kamera';
      }

      this.pointerTerakhirX = e.clientX;
      this.pointerTerakhirY = e.clientY;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.modeSeret === 'none') return;
      const dx = e.clientX - this.pointerTerakhirX;
      const dy = e.clientY - this.pointerTerakhirY;
      this.pointerTerakhirX = e.clientX;
      this.pointerTerakhirY = e.clientY;

      if (this.modeSeret === 'tuding-depan-rama') {
        this.modeKiprahAktif = false;
        this.targetBahuDepanZ = Math.max(
          -1.45,
          Math.min(0.45, this.targetBahuDepanZ - dy * 0.008 - dx * 0.005),
        );
        this.targetSikuDepanZ = Math.max(
          -1.65,
          Math.min(-0.1, this.targetSikuDepanZ - dy * 0.009 + dx * 0.006),
        );
      } else if (this.modeSeret === 'tuding-belakang-rama') {
        this.modeKiprahAktif = false;
        this.targetBahuBelakangZ = Math.max(
          -0.45,
          Math.min(1.25, this.targetBahuBelakangZ - dy * 0.008 + dx * 0.006),
        );
        this.targetSikuBelakangZ = Math.max(
          -1.75,
          Math.min(-0.15, this.targetSikuBelakangZ - dy * 0.009 - dx * 0.006),
        );
      } else if (this.modeSeret === 'cempurit-rama') {
        this.targetRamaX = Math.max(-1.1, Math.min(1.25, this.targetRamaX + dx * 0.0042));
        this.targetRamaY = Math.max(-0.35, Math.min(0.45, this.targetRamaY - dy * 0.0038));
        this.targetCondhongRama = Math.max(
          -0.42,
          Math.min(0.42, this.targetCondhongRama - dx * 0.0035),
        );
      } else if (this.modeSeret === 'cempurit-kidang') {
        this.targetKidangX = Math.max(-1.25, Math.min(1.1, this.targetKidangX + dx * 0.0042));
        this.targetKidangY = Math.max(-0.35, Math.min(0.45, this.targetKidangY - dy * 0.0038));
        this.targetCondhongKidang = Math.max(
          -0.42,
          Math.min(0.42, this.targetCondhongKidang - dx * 0.0035),
        );
      } else if (this.modeSeret === 'kamera') {
        this.targetKameraX = Math.max(-0.95, Math.min(0.95, this.targetKameraX - dx * 0.0045));
        this.targetKameraY = Math.max(-0.35, Math.min(0.55, this.targetKameraY + dy * 0.0035));
      }
    });

    window.addEventListener('pointerup', () => {
      this.modeSeret = 'none';
    });

    el.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        this.targetKameraZ = Math.max(2.3, Math.min(3.85, this.targetKameraZ + e.deltaY * 0.0014));
      },
      { passive: false },
    );
  }

  aturPosisiTokoh(ramaX: number, kidangX: number, ramaY = 0, kidangY = 0): void {
    this.targetRamaX = Math.max(-1.1, Math.min(1.3, ramaX));
    this.targetKidangX = Math.max(-1.3, Math.min(1.1, kidangX));
    this.targetRamaY = Math.max(-0.35, Math.min(0.45, ramaY));
    this.targetKidangY = Math.max(-0.35, Math.min(0.45, kidangY));
  }

  // Mengatur sudut Tuding lengan depan, Tuding lengan belakang, kemiringan Cempurit, dan jarak Kelir
  aturTudingDanCempuritRama(opsi: {
    bahuDepan?: number;
    sikuDepan?: number;
    bahuBelakang?: number;
    sikuBelakang?: number;
    condhongCempurit?: number;
    kedalamanKelir?: number;
  }): void {
    this.modeKiprahAktif = false;
    if (opsi.bahuDepan !== undefined) {
      this.targetBahuDepanZ = Math.max(-1.45, Math.min(0.45, opsi.bahuDepan));
    }
    if (opsi.sikuDepan !== undefined) {
      this.targetSikuDepanZ = Math.max(-1.65, Math.min(-0.1, opsi.sikuDepan));
    }
    if (opsi.bahuBelakang !== undefined) {
      this.targetBahuBelakangZ = Math.max(-0.45, Math.min(1.25, opsi.bahuBelakang));
    }
    if (opsi.sikuBelakang !== undefined) {
      this.targetSikuBelakangZ = Math.max(-1.75, Math.min(-0.15, opsi.sikuBelakang));
    }
    if (opsi.condhongCempurit !== undefined) {
      this.targetCondhongRama = Math.max(-0.45, Math.min(0.45, opsi.condhongCempurit));
    }
    if (opsi.kedalamanKelir !== undefined) {
      this.targetKedalamanRamaZ = Math.max(-0.12, Math.min(0.32, 0.08 + opsi.kedalamanKelir * 0.35));
    }
  }

  // 4 Pose Sabet Dalang autentik yang dapat dipicu dari tombol UI maupun gestur
  terapkanPoseSabetDalang(pose: PoseSabetDalang): void {
    audioBudaya.bunyikanCempalaKeprak('cempala');
    if (pose === 'sembah') {
      // Pose Sembah Silo / Menghormat: kedua lengan diangkat merapat di depan wajah, cempurit merunduk (mayuk)
      this.modeKiprahAktif = false;
      this.targetCondhongRama = 0.18;
      this.targetBahuDepanZ = -0.82;
      this.targetSikuDepanZ = -1.38;
      this.targetBahuBelakangZ = -0.25;
      this.targetSikuBelakangZ = -1.45;
    } else if (pose === 'menthang-gendewa') {
      // Pose Menthang Gendewa: tangan depan merentang lurus membidik busur, tangan belakang menarik tali penuh
      this.modeKiprahAktif = false;
      this.targetCondhongRama = 0.08;
      this.targetBahuDepanZ = -1.08;
      this.targetSikuDepanZ = -0.35;
      this.targetBahuBelakangZ = 0.78;
      this.targetSikuBelakangZ = -1.52;
    } else if (pose === 'tuding-menunjuk') {
      // Pose Tuding Menunjuk Sabda: lengan depan diayun tinggi menunjuk ke depan, tangan belakang di pinggang
      this.modeKiprahAktif = false;
      this.targetCondhongRama = -0.06;
      this.targetBahuDepanZ = -1.28;
      this.targetSikuDepanZ = -0.22;
      this.targetBahuBelakangZ = 0.48;
      this.targetSikuBelakangZ = -1.18;
    } else if (pose === 'kiprah-sabetan') {
      // Pose Kiprah Sabetan: getaran dinamis kedua tuding & keprak dalang
      this.modeKiprahAktif = true;
      this.targetCondhongRama = 0.12;
      audioBudaya.bunyikanCempalaKeprak('keprak');
    }
  }

  lepaskanPanahRama(): void {
    this.terapkanPoseSabetDalang('menthang-gendewa');
    this.panahMeluncur = true;
    this.progresPanah = 0;
    if (this.anakPanahGroup) {
      this.anakPanahGroup.visible = true;
      this.anakPanahGroup.position.set(
        this.rigRama.group.position.x - 0.18,
        this.rigRama.group.position.y + 0.08,
        0.12,
      );
    }
    audioBudaya.bunyikanPanahWayang();
  }

  sabetanKayon(): void {
    this.sabetanKayonAktif = true;
    this.progresKayon = 0;
    audioBudaya.bunyikanCempalaKeprak('keprak');
    audioBudaya.bunyikanGongAgeng(0.18);
  }

  // Menerapkan kinematika 21 titik tangan Dalang secara penuh ke Cempurit, Tuding Depan, Tuding Belakang, & Kelir
  terapkanGesturPanggung(frame: FrameTangan): void {
    this.aturPosisiTokoh(
      frame.kananX,
      frame.kiriX,
      frame.kananY * 0.45,
      frame.kiriY * 0.45,
    );

    // Kemiringan pergelangan tangan langsung memiringkan tangkai Cempurit wayang (condhong / mayuk)
    this.targetCondhongRama = Math.max(-0.45, Math.min(0.45, frame.kemiringanPergelangan * 0.85));
    this.targetCondhongKidang = Math.max(
      -0.45,
      Math.min(0.45, frame.kemiringanPergelanganKiri * 0.85),
    );

    // Jarak telapak ke kamera mengatur jarak wayang ke layar Kelir (ketajaman & ukuran bayangan Blencong)
    this.targetKedalamanRamaZ = Math.max(
      -0.12,
      Math.min(0.32, 0.08 + frame.kedalamanKelir * 0.35),
    );

    // Jari telunjuk & jempol mengemudikan Tuding Depan (bahuDepan & sikuDepan)
    this.targetBahuDepanZ = Math.max(
      -1.4,
      Math.min(0.35, -0.45 - frame.angkatTudingDepan * 0.72),
    );
    this.targetSikuDepanZ = Math.max(
      -1.6,
      Math.min(-0.15, -0.75 - frame.tekukSikuDepan * 0.55),
    );

    // Jari tengah & manis mengemudikan Tuding Belakang (bahuBelakang & sikuBelakang)
    this.targetBahuBelakangZ = Math.max(
      -0.35,
      Math.min(1.15, 0.32 + frame.angkatTudingBelakang * 0.65),
    );
    this.targetSikuBelakangZ = Math.max(
      -1.65,
      Math.min(-0.2, -1.05 - frame.tekukSikuBelakang * 0.48),
    );

    const kini = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (kini - this.waktuGesturTerakhir > 1300) {
      if (frame.gesturAktif === 'kepal-aksi') {
        this.waktuGesturTerakhir = kini;
        this.lepaskanPanahRama();
      } else if (frame.gesturAktif === 'dua-jari-sabetan') {
        this.waktuGesturTerakhir = kini;
        this.sabetanKayon();
      }
    }
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
      const ramaGroup = this.rigRama.group;
      const kidangGroup = this.rigKidang.group;
      const prevRamaX = ramaGroup.position.x;
      const prevKidangX = kidangGroup.position.x;

      ramaGroup.position.x = lerp(ramaGroup.position.x, this.targetRamaX * 1.45, 0.14);
      ramaGroup.position.y = lerp(
        ramaGroup.position.y,
        -0.04 + this.targetRamaY * 0.4 + Math.sin(t * 2.2) * 0.015,
        0.14,
      );
      const ayunGerakRama = (this.targetRamaX * 1.45 - ramaGroup.position.x) * -0.32;
      ramaGroup.rotation.z = lerp(
        ramaGroup.rotation.z,
        this.targetCondhongRama + ayunGerakRama,
        0.18,
      );
      ramaGroup.rotation.y =
        -0.12 + Math.sin(t * 1.5) * 0.07 + ayunGerakRama * 0.3 + this.targetCondhongRama * 0.25;

      ramaGroup.position.z = lerp(
        ramaGroup.position.z,
        this.targetKedalamanRamaZ +
          Math.min(0.16, Math.abs(this.targetRamaX - ramaGroup.position.x / 1.45) * 0.25),
        0.15,
      );

      kidangGroup.position.x = lerp(kidangGroup.position.x, this.targetKidangX * 1.45, 0.14);
      const lompatKejut =
        this.panahMeluncur && this.progresPanah > 0.45
          ? Math.sin((this.progresPanah - 0.45) * Math.PI * 1.8) * 0.28
          : 0;
      kidangGroup.position.y = lerp(
        kidangGroup.position.y,
        -0.08 +
          this.targetKidangY * 0.4 +
          Math.abs(Math.sin(t * 3.8)) * 0.038 +
          Math.max(0, lompatKejut),
        0.14,
      );
      const ayunKidang = (this.targetKidangX * 1.45 - kidangGroup.position.x) * -0.42;
      kidangGroup.rotation.z = lerp(
        kidangGroup.rotation.z,
        this.targetCondhongKidang + ayunKidang,
        0.18,
      );
      kidangGroup.rotation.y = 0.14 + Math.cos(t * 1.9) * 0.09 - ayunKidang * 0.3;

      // Paralaks kamera 3D halus mengikuti pergerakan tokoh dan geseran kanvas
      const fokusTengahX = (ramaGroup.position.x + kidangGroup.position.x) * 0.12;
      this.camera.position.x = lerp(
        this.camera.position.x,
        this.targetKameraX + fokusTengahX,
        0.09,
      );
      this.camera.position.y = lerp(this.camera.position.y, this.targetKameraY, 0.09);
      this.camera.position.z = lerp(this.camera.position.z, this.targetKameraZ, 0.09);
      this.camera.lookAt(fokusTengahX * 0.5, 0.02, -0.08);

      if (this.panahMeluncur && this.anakPanahGroup) {
        this.progresPanah = Math.min(1, this.progresPanah + 0.036);
        const startX = ramaGroup.position.x - 0.18;
        const endX = kidangGroup.position.x + 0.12;
        this.anakPanahGroup.position.x = lerp(startX, endX, this.progresPanah);
        this.anakPanahGroup.position.y = 0.08 + Math.sin(this.progresPanah * Math.PI) * 0.22;
        this.anakPanahGroup.rotation.z = -Math.cos(this.progresPanah * Math.PI) * 0.18;
        if (this.progresPanah >= 1) {
          this.panahMeluncur = false;
          this.anakPanahGroup.visible = false;
        }
      }

      if (this.sabetanKayonAktif) {
        this.progresKayon = Math.min(1, this.progresKayon + 0.025);
        const fase = Math.sin(this.progresKayon * Math.PI);
        this.gununganKananGroup.position.x = 1.88 - fase * 1.82;
        this.gununganKananGroup.position.z = -0.02 + fase * 0.26;
        this.gununganKananGroup.rotation.y = -0.16 + fase * Math.PI;
        this.gununganKananGroup.rotation.z =
          -0.06 + Math.sin(this.progresKayon * Math.PI * 2) * 0.24;
        if (this.progresKayon >= 1) {
          this.sabetanKayonAktif = false;
          this.gununganKananGroup.position.set(1.88, -0.04, -0.02);
          this.gununganKananGroup.rotation.set(0, -0.16, -0.06);
        }
      }

      if (!this.reducedMotion) {
        const kecRama = (ramaGroup.position.x - prevRamaX) * 14;
        const getarKiprah = this.modeKiprahAktif ? Math.sin(t * 14) * 0.28 : 0;
        const nafasHalus = Math.sin(t * 2.2) * 0.05;

        // Artikulasi 2 ruas lengan depan & belakang mengikuti Tuding Dalang
        this.rigRama.bahuDepan.rotation.z = lerp(
          this.rigRama.bahuDepan.rotation.z,
          this.targetBahuDepanZ + getarKiprah + nafasHalus,
          0.22,
        );
        this.rigRama.sikuDepan.rotation.z = lerp(
          this.rigRama.sikuDepan.rotation.z,
          this.targetSikuDepanZ - getarKiprah * 0.8 + Math.cos(t * 2.2) * 0.05,
          0.22,
        );
        this.rigRama.bahuBelakang.rotation.z = lerp(
          this.rigRama.bahuBelakang.rotation.z,
          this.targetBahuBelakangZ - getarKiprah * 0.7 - nafasHalus,
          0.22,
        );
        this.rigRama.sikuBelakang.rotation.z = lerp(
          this.rigRama.sikuBelakang.rotation.z,
          this.targetSikuBelakangZ + getarKiprah * 0.9 + Math.sin(t * 2.5) * 0.06,
          0.22,
        );

        // Jaga agar kedua tangkai Tuding selalu menggantung vertikal ke arah tangan Dalang (gravitasi tuding)
        if (this.rigRama.tudingDepanGroup) {
          this.rigRama.tudingDepanGroup.rotation.z =
            -(this.rigRama.bahuDepan.rotation.z + this.rigRama.sikuDepan.rotation.z) -
            ramaGroup.rotation.z * 0.6;
        }
        if (this.rigRama.tudingBelakangGroup) {
          this.rigRama.tudingBelakangGroup.rotation.z =
            -(this.rigRama.bahuBelakang.rotation.z + this.rigRama.sikuBelakang.rotation.z) -
            ramaGroup.rotation.z * 0.6;
        }

        this.rigRama.kepalaGroup.rotation.z =
          0.08 + this.targetCondhongRama * 0.25 + Math.sin(t * 1.8) * 0.03;
        this.rigRama.uncalDepan.rotation.z = -kecRama * 0.45 + Math.sin(t * 3.1) * 0.1;
        this.rigRama.uncalBelakang.rotation.z = -kecRama * 0.38 + Math.cos(t * 2.9) * 0.08;

        const posTali = this.rigRama.taliBusurLine.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute;
        if (posTali) {
          const tarikanTuding = Math.max(0, (this.rigRama.bahuBelakang.rotation.z - 0.15) * 0.12);
          const tarikanTengah = 0.14 + tarikanTuding + Math.max(0, Math.sin(t * 2.4)) * 0.04;
          posTali.setX(1, tarikanTengah);
          posTali.needsUpdate = true;
        }

        const kecKidang = Math.min(2.4, Math.abs(kidangGroup.position.x - prevKidangX) * 18 + 1);
        this.rigKidang.kakiDepanKiri.rotation.z = Math.sin(t * 4.8) * 0.32 * kecKidang;
        this.rigKidang.kakiDepanKanan.rotation.z = -Math.sin(t * 4.8) * 0.28 * kecKidang;
        this.rigKidang.kakiBelakangKiri.rotation.z = -Math.sin(t * 4.8) * 0.32 * kecKidang;
        this.rigKidang.kakiBelakangKanan.rotation.z = Math.sin(t * 4.8) * 0.28 * kecKidang;
        this.rigKidang.leherKepalaGroup.rotation.z =
          Math.sin(t * 2.7) * 0.09 - this.targetCondhongKidang * 0.35;
        this.rigKidang.ekorGroup.rotation.z = Math.sin(t * 6.2) * 0.22;

        if (!this.sabetanKayonAktif) {
          this.gununganKananGroup.rotation.z = -0.06 + Math.sin(t * 1.4) * 0.022;
        }
        this.gununganKiriGroup.rotation.z = 0.07 + Math.cos(t * 1.3) * 0.018;

        if (this.lidahApiMesh) {
          this.lidahApiMesh.scale.y = 1 + Math.sin(t * 14) * 0.16;
          this.lidahApiMesh.rotation.z = Math.sin(t * 9) * 0.1;
        }
        if (this.partikelBlencongPoints) {
          this.partikelBlencongPoints.rotation.y = Math.sin(t * 0.3) * 0.08;
          this.partikelBlencongPoints.position.y = Math.sin(t * 0.9) * 0.05;
        }
        this.blencongLight.intensity = 14.8 + Math.sin(time * 0.0045) * 0.65;
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
