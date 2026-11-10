// Adegan 3D Panggung Kelir untuk memainkan Lakon Kijang Kencana.
// Menampilkan model 3D volumetrik Tatah-Sungging berartikulasi penuh (tanpa gambar datar 2D):
// Sri Rama dengan mahkota Gelung Supit Urang, Praba, Dodot Parang, Uncal Kencana berayun, & 2 lengan berartikulasi,
// Kidang Kencana dengan 4 kaki berartikulasi, kepala menoleh, ekor hidup, & Ranggah Kencana bercabang,
// Gunungan (Kayon) 3D berpahat krawangan (Gapura, Banaspati, Pohon Kalpataru) di tepi panggung,
// lampu minyak Blencong perunggu di atas dengan partikel pijar cahaya, serta gedebog batang pisang.

import * as THREE from 'three';
import { audioBudaya } from '../lib/audioBudaya';
import { lerp, type FrameTangan } from '../lib/handTracker';
import {
  ambilKoleksiTeksturPBR,
  pasangLingkunganPBR,
  type KoleksiTeksturPBR,
} from './pbrMaterials';
import {
  bangunGununganKayonRealistis3D,
  bangunKidangKencanaRealistis3D,
  bangunSriRamaRealistis3D,
  type RigKidangKencana3D,
  type RigSriRama3D,
} from './wayang3DBuilder';

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

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#120D09');

    const w = Math.max(280, container.clientWidth || 720);
    const h = Math.max(220, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 30);
    this.camera.position.set(0, 0.06, 3.25);

    this.teksturs = ambilKoleksiTeksturPBR();

    // Kain kelir utama bertenun mori tempat bayangan krawangan 3D jatuh secara nyata
    const kelirMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 3.15),
      new THREE.MeshStandardMaterial({
        map: this.teksturs.tenunKelirDiff,
        bumpMap: this.teksturs.tenunKelirBump,
        bumpScale: 0.009,
        roughness: 0.86,
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

    // Plangkan kayu jati PBR & gedebog (batang pisang tempat menancapkan cempurit wayang)
    const kayuMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      roughness: 0.56,
      clearcoat: 0.32,
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
      bumpScale: 0.022,
      roughness: 0.76,
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

    // Lampu Blencong Perunggu Bersayap Garuda menggantung di atas tengah panggung
    const perungguBlencongMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A444',
      roughness: 0.26,
      metalness: 0.88,
      clearcoat: 0.35,
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

    // Partikel pijar debu hangat di bawah sorot lampu Blencong
    const jumlahPartikel = 42;
    const posisiPartikel = new Float32Array(jumlahPartikel * 3);
    for (let i = 0; i < jumlahPartikel; i++) {
      posisiPartikel[i * 3] = (Math.random() - 0.5) * 3.6;
      posisiPartikel[i * 3 + 1] = -0.8 + Math.random() * 1.9;
      posisiPartikel[i * 3 + 2] = -0.15 + Math.random() * 0.45;
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

    const hemi = new THREE.HemisphereLight('#FFF0D4', '#24170E', 0.85);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD08E', 14.2, 16, Math.PI / 2.3, 0.42, 1.2);
    this.blencongLight.position.set(0, 0.65, 2.75);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.blencongLight.shadow.bias = -0.00035;
    this.scene.add(this.blencongLight);

    const fillDepan = new THREE.DirectionalLight('#FFE4B8', 1.22);
    fillDepan.position.set(0.4, 0.6, 3.2);
    this.scene.add(fillDepan);

    // Bangun tokoh 3D Tatah-Sungging Sri Rama, Kidang Kencana, dan Simpingan Gunungan Kiri-Kanan
    this.rigRama = bangunSriRamaRealistis3D(this.teksturs);
    this.rigRama.group.position.set(0.65, -0.04, 0.06);

    this.rigKidang = bangunKidangKencanaRealistis3D(this.teksturs);
    this.rigKidang.group.position.set(-0.65, -0.08, 0.08);

    this.gununganKananGroup = bangunGununganKayonRealistis3D(this.teksturs, 0.96);
    this.gununganKananGroup.position.set(1.94, -0.04, -0.03);
    this.gununganKananGroup.rotation.z = -0.07;

    this.gununganKiriGroup = bangunGununganKayonRealistis3D(this.teksturs, 0.88);
    this.gununganKiriGroup.position.set(-2.05, -0.08, -0.06);
    this.gununganKiriGroup.rotation.z = 0.08;

    this.scene.add(this.rigRama.group);
    this.scene.add(this.rigKidang.group);
    this.scene.add(this.gununganKananGroup);
    this.scene.add(this.gununganKiriGroup);

    // Anak Panah 3D Guwawijaya Berbulu Bedher Emas milik Sri Rama
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

    panahGroup.position.set(0.35, 0.08, 0.09);
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
      this.renderer.toneMappingExposure = 1.14;
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

  aturPosisiTokoh(ramaX: number, kidangX: number, ramaY = 0, kidangY = 0): void {
    this.targetRamaX = Math.max(-1.1, Math.min(1.3, ramaX));
    this.targetKidangX = Math.max(-1.3, Math.min(1.1, kidangX));
    this.targetRamaY = Math.max(-0.35, Math.min(0.45, ramaY));
    this.targetKidangY = Math.max(-0.35, Math.min(0.45, kidangY));
  }

  // Aksi khusus panggung 1: Sri Rama melesatkan Anak Panah 3D Guwawijaya ke arah Kidang Kencana
  lepaskanPanahRama(): void {
    this.panahMeluncur = true;
    this.progresPanah = 0;
    if (this.anakPanahGroup) {
      this.anakPanahGroup.visible = true;
      this.anakPanahGroup.position.set(
        this.rigRama.group.position.x - 0.18,
        this.rigRama.group.position.y + 0.08,
        0.1,
      );
    }
    audioBudaya.bunyikanPanahWayang();
  }

  // Aksi khusus panggung 2: Sabetan Gunungan (Kayon) 3D melintasi kelir diiringi keprak & gong
  sabetanKayon(): void {
    this.sabetanKayonAktif = true;
    this.progresKayon = 0;
    audioBudaya.bunyikanCempalaKeprak('keprak');
    audioBudaya.bunyikanGongAgeng(0.18);
  }

  terapkanGesturPanggung(frame: FrameTangan): void {
    this.aturPosisiTokoh(
      frame.kananX,
      frame.kiriX,
      frame.kananY * 0.4,
      frame.kiriY * 0.4,
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
        -0.04 + this.targetRamaY * 0.4 + Math.sin(t * 2.2) * 0.016,
        0.14,
      );
      const ayunRama = (this.targetRamaX * 1.45 - ramaGroup.position.x) * -0.32;
      ramaGroup.rotation.z = ayunRama;
      ramaGroup.rotation.y = Math.sin(t * 1.5) * 0.08 + ayunRama * 0.35;

      ramaGroup.position.z =
        0.06 + Math.min(0.14, Math.abs(this.targetRamaX - ramaGroup.position.x / 1.45) * 0.25);

      kidangGroup.position.x = lerp(kidangGroup.position.x, this.targetKidangX * 1.45, 0.14);
      const lompatKejut =
        this.panahMeluncur && this.progresPanah > 0.45
          ? Math.sin((this.progresPanah - 0.45) * Math.PI * 1.8) * 0.28
          : 0;
      kidangGroup.position.y = lerp(
        kidangGroup.position.y,
        -0.08 + this.targetKidangY * 0.4 + Math.abs(Math.sin(t * 3.8)) * 0.038 + Math.max(0, lompatKejut),
        0.14,
      );
      const ayunKidang = (this.targetKidangX * 1.45 - kidangGroup.position.x) * -0.42;
      kidangGroup.rotation.z = ayunKidang;
      kidangGroup.rotation.y = Math.cos(t * 1.9) * 0.1 - ayunKidang * 0.3;

      // Animasi Anak Panah 3D Guwawijaya melesat dari busur Sri Rama menuju Kidang Kencana
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

      // Animasi Sabetan Kayon (Gunungan 3D) berayun melintasi panggung
      if (this.sabetanKayonAktif) {
        this.progresKayon = Math.min(1, this.progresKayon + 0.025);
        const fase = Math.sin(this.progresKayon * Math.PI);
        this.gununganKananGroup.position.x = 1.94 - fase * 1.85;
        this.gununganKananGroup.position.z = -0.03 + fase * 0.26;
        this.gununganKananGroup.rotation.y = fase * Math.PI;
        this.gununganKananGroup.rotation.z =
          -0.07 + Math.sin(this.progresKayon * Math.PI * 2) * 0.24;
        if (this.progresKayon >= 1) {
          this.sabetanKayonAktif = false;
          this.gununganKananGroup.position.set(1.94, -0.04, -0.03);
          this.gununganKananGroup.rotation.set(0, 0, -0.07);
        }
      }

      // Artikulasi hidup seluruh sendi Sri Rama, 4 kaki Kidang Kencana, & partikel lampu Blencong
      if (!this.reducedMotion) {
        const kecRama = (ramaGroup.position.x - prevRamaX) * 14;
        const tarikPanah = this.panahMeluncur ? -0.34 : Math.sin(t * 2.4) * 0.14;

        // Sendi 2 lengan Sri Rama, anggukan kepala, dan ayunan pita Uncal Kencana
        this.rigRama.bahuDepan.rotation.z = -0.58 + tarikPanah * 0.85;
        this.rigRama.sikuDepan.rotation.z = -0.92 + Math.cos(t * 2.4) * 0.14;
        this.rigRama.bahuBelakang.rotation.z = 0.25 - tarikPanah * 1.1;
        this.rigRama.sikuBelakang.rotation.z = -1.25 + Math.sin(t * 2.8) * 0.2;
        this.rigRama.kepalaGroup.rotation.z = 0.12 + Math.sin(t * 1.8) * 0.04;
        this.rigRama.uncalDepan.rotation.z = -kecRama * 0.45 + Math.sin(t * 3.1) * 0.12;
        this.rigRama.uncalBelakang.rotation.z = -kecRama * 0.38 + Math.cos(t * 2.9) * 0.1;

        // Rentangan tali busur Gendewa yang ikut memegas
        const posTali = this.rigRama.taliBusurLine.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute;
        if (posTali) {
          const tarikanTengah = 0.18 + Math.max(0, Math.sin(t * 2.4)) * 0.06;
          posTali.setX(1, tarikanTengah);
          posTali.needsUpdate = true;
        }

        // Sendi 4 kaki Kidang Kencana melompat bergantian, kepala menoleh, dan ekor mengibas
        const kecKidang = Math.min(2.4, Math.abs(kidangGroup.position.x - prevKidangX) * 18 + 1);
        this.rigKidang.kakiDepanKiri.rotation.z = Math.sin(t * 4.8) * 0.32 * kecKidang;
        this.rigKidang.kakiDepanKanan.rotation.z = -Math.sin(t * 4.8) * 0.28 * kecKidang;
        this.rigKidang.kakiBelakangKiri.rotation.z = -Math.sin(t * 4.8) * 0.32 * kecKidang;
        this.rigKidang.kakiBelakangKanan.rotation.z = Math.sin(t * 4.8) * 0.28 * kecKidang;
        this.rigKidang.leherKepalaGroup.rotation.z = Math.sin(t * 2.7) * 0.09;
        this.rigKidang.ekorGroup.rotation.z = Math.sin(t * 6.2) * 0.22;

        if (!this.sabetanKayonAktif) {
          this.gununganKananGroup.rotation.z = -0.07 + Math.sin(t * 1.4) * 0.025;
        }
        this.gununganKiriGroup.rotation.z = 0.08 + Math.cos(t * 1.3) * 0.02;

        if (this.lidahApiMesh) {
          this.lidahApiMesh.scale.y = 1 + Math.sin(t * 14) * 0.16;
          this.lidahApiMesh.rotation.z = Math.sin(t * 9) * 0.1;
        }
        if (this.partikelBlencongPoints) {
          this.partikelBlencongPoints.rotation.y = Math.sin(t * 0.3) * 0.08;
          this.partikelBlencongPoints.position.y = Math.sin(t * 0.9) * 0.05;
        }
        this.blencongLight.intensity = 13.8 + Math.sin(time * 0.0045) * 0.65;
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
