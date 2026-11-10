// Adegan 3D Studio Anatomi Budaya menggunakan Three.js dengan geometri 3D volumetrik penuh,
// tekstur PBR nyata (Poly Haven CC0 1K + prosedural kriya Nusantara),
// dua mode simulasi/efek fisik 3D per pusaka, respons 6 variasi gestur tangan,
// serta integrasi mesin suara budaya Nusantara (Web Audio API physical modeling).

import * as THREE from 'three';
import type { BendaPusaka, IdPusaka } from '../content/pusaka';
import { audioBudaya } from '../lib/audioBudaya';
import { lerp, type FrameTangan } from '../lib/handTracker';
import {
  ambilKoleksiTeksturPBR,
  pasangLingkunganPBR,
  type KoleksiTeksturPBR,
} from './pbrMaterials';
import {
  bangunGununganKayonRealistis3D,
  bangunSriRamaRealistis3D,
} from './wayang3DBuilder';

export interface InfoNadaSaron {
  nomor: number;
  notasi: string;
  nama: string;
  frekuensi: number;
}

export const NADA_SARON_SLENDRO: InfoNadaSaron[] = [
  { nomor: 1, notasi: '6̣', nama: 'Nem Ageng', frekuensi: 246.94 },
  { nomor: 2, notasi: '1', nama: 'Ji (Barang)', frekuensi: 282.0 },
  { nomor: 3, notasi: '2', nama: 'Ro (Gulu)', frekuensi: 324.0 },
  { nomor: 4, notasi: '3', nama: 'Lu (Dhadha)', frekuensi: 372.0 },
  { nomor: 5, notasi: '5', nama: 'Ma (Lima)', frekuensi: 428.0 },
  { nomor: 6, notasi: '6', nama: 'Nem', frekuensi: 493.88 },
  { nomor: 7, notasi: '1̇', nama: 'Ji Alit', frekuensi: 564.0 },
];

export const LABEL_EFEK_KHUSUS_3D: Record<IdPusaka, string> = {
  keris: 'Pijar Pamor & Tayuh Wesi Aji',
  saron: 'Sapuan Glissando & Gelombang Suara 3D',
  batik: 'Celup Malam Wajan & Lukis Jejak Emas',
  joglo: 'Simulasi Uji Guncangan Gempa 3D',
  wayang: 'Lesatkan Panah Guwawijaya 3D',
};

const POLA_GENDING_LANCARAN = [2, 3, 2, 1, 2, 3, 4, 3, 4, 5, 4, 3, 2, 1, 2, 0];

export class ArtifactStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rootGroup: THREE.Group;
  private markerGroup: THREE.Group;
  private markerRing: THREE.Mesh;
  private cincinPanggungMesh: THREE.Mesh | null = null;
  private partikelDebu: THREE.Points | null = null;
  private blencongLight: THREE.SpotLight;
  private teksturs: KoleksiTeksturPBR;
  private rafId: number | null = null;
  private reducedMotion = false;

  private bendaAktifId: IdPusaka = 'keris';
  private aksiHidupAktif = false;
  private efekKhususWaktu = 0;
  private simulasiGempaAktif = false;

  private targetRotY = 0.28;
  private targetRotX = 0.12;
  private targetRotZ = 0;
  private targetZoom = 2.65;
  private targetFocus = new THREE.Vector3(0, 0, 0);
  private currentFocus = new THREE.Vector3(0, 0, 0);

  private isDragging = false;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private lastX = 0;
  private lastY = 0;

  private waktuGesturAksiTerakhir = 0;
  private wilahTerakhirTunjuk = -1;

  // Referensi bagian model 3D untuk animasi & efek fisik
  private kerisBilahGroup: THREE.Group | null = null;
  private kerisWarangkaGroup: THREE.Group | null = null;
  private kerisCincinPijar: THREE.Mesh | null = null;

  private wilahMeshes: THREE.Mesh[] = [];
  private cincinAkustikMeshes: THREE.Mesh[] = [];
  private cincinAkustikSkala: number[] = [];
  private tabuhGroup: THREE.Group | null = null;
  private animasiTabuhWaktu = 0;
  private animasiTabuhTargetX = 0.35;
  private gendingLangkah = 0;
  private gendingWaktuTerakhir = 0;

  private cantingGroup: THREE.Group | null = null;
  private kainBatikGeo: THREE.BufferGeometry | null = null;
  private kainBatikPosAwal: Float32Array | null = null;
  private baraAngloMat: THREE.MeshStandardMaterial | null = null;
  private uapMalamPoints: THREE.Points | null = null;
  private jejakMalamMesh: THREE.Mesh | null = null;

  private jogloUmpakGroup: THREE.Group | null = null;
  private jogloSakaGroup: THREE.Group | null = null;
  private jogloTumpangGroup: THREE.Group | null = null;
  private jogloAtapGroup: THREE.Group | null = null;

  private wayangGununganGroup: THREE.Group | null = null;
  private wayangSatriaGroup: THREE.Group | null = null;
  private wayangBahuDepan: THREE.Group | null = null;
  private wayangSikuDepan: THREE.Group | null = null;
  private wayangBahuBelakang: THREE.Group | null = null;
  private wayangAnakPanahGroup: THREE.Group | null = null;

  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement, bendaAwal: BendaPusaka) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#130E0A');
    this.scene.fog = new THREE.FogExp2('#130E0A', 0.085);

    const w = Math.max(280, container.clientWidth || 640);
    const h = Math.max(240, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 40);
    this.camera.position.set(0, 0.16, this.targetZoom);

    this.teksturs = ambilKoleksiTeksturPBR();

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    this.bangunPanggungMuseum3D();

    const hemi = new THREE.HemisphereLight('#FFF3DC', '#261A12', 0.92);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD296', 12.5, 18, Math.PI / 2.6, 0.45, 1.2);
    this.blencongLight.position.set(0.55, 1.45, 3.15);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 1024;
    this.blencongLight.shadow.mapSize.height = 1024;
    this.blencongLight.shadow.bias = -0.0004;
    this.blencongLight.shadow.normalBias = 0.015;
    this.scene.add(this.blencongLight);

    const rimWarm = new THREE.DirectionalLight('#E07A42', 1.85);
    rimWarm.position.set(-2.6, 1.6, -1.4);
    this.scene.add(rimWarm);

    const fillGold = new THREE.DirectionalLight('#FFE5B8', 1.15);
    fillGold.position.set(2.3, -0.6, 2.0);
    this.scene.add(fillGold);

    // Penanda titik anatomis 3D (bola inti + cincin emas berdenyut)
    this.markerGroup = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(0.035, 20, 20);
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#D94E28',
      emissive: '#9E2E17',
      emissiveIntensity: 0.9,
      roughness: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.markerGroup.add(coreMesh);

    const ringGeo = new THREE.RingGeometry(0.052, 0.072, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#F5D08A',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    this.markerRing = new THREE.Mesh(ringGeo, ringMat);
    this.markerGroup.add(this.markerRing);
    this.rootGroup.add(this.markerGroup);

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

    this.pasangInteraksiPointer(container);
    this.muatBenda(bendaAwal);
    this.mulaiLoop();
  }

  private bangunPanggungMuseum3D(): void {
    const batuMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.batuAndesitDiff,
      bumpMap: this.teksturs.batuAndesitBump,
      bumpScale: 0.018,
      roughness: 0.84,
      metalness: 0.05,
    });

    const kayuJatiMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      color: '#5C321C',
      roughness: 0.48,
      clearcoat: 0.35,
    });

    const emasMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A648',
      bumpMap: this.teksturs.ukirRancakanBump,
      bumpScale: 0.014,
      roughness: 0.28,
      metalness: 0.88,
    });

    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -0.86, 0);

    const alasBatu = new THREE.Mesh(
      new THREE.CylinderGeometry(1.22, 1.38, 0.18, 8),
      batuMat,
    );
    alasBatu.position.y = -0.14;
    alasBatu.receiveShadow = true;
    pedestalGroup.add(alasBatu);

    const mejaKayu = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.14, 0.1, 8),
      kayuJatiMat,
    );
    mejaKayu.position.y = -0.01;
    mejaKayu.receiveShadow = true;
    pedestalGroup.add(mejaKayu);

    const cincinGeo = new THREE.RingGeometry(0.84, 0.92, 32);
    const cincinMesh = new THREE.Mesh(cincinGeo, emasMat);
    cincinMesh.rotation.x = -Math.PI / 2;
    cincinMesh.position.y = 0.043;
    cincinMesh.receiveShadow = true;
    this.cincinPanggungMesh = cincinMesh;
    pedestalGroup.add(cincinMesh);

    this.scene.add(pedestalGroup);

    const relungGeo = new THREE.CylinderGeometry(
      4.2,
      4.2,
      4.4,
      24,
      1,
      true,
      Math.PI * 0.65,
      Math.PI * 0.7,
    );
    const relungMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.tenunKelirDiff,
      bumpMap: this.teksturs.tenunKelirBump,
      bumpScale: 0.01,
      color: '#2B1F17',
      roughness: 0.9,
      side: THREE.BackSide,
    });
    const relungMesh = new THREE.Mesh(relungGeo, relungMat);
    relungMesh.position.set(0, 0.2, -0.6);
    relungMesh.receiveShadow = true;
    this.scene.add(relungMesh);

    for (const xPos of [-2.3, -1.15, 1.15, 2.3]) {
      const zPos = -2.35 + Math.abs(xPos) * 0.22;
      const tiang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.085, 3.6, 16),
        kayuJatiMat,
      );
      tiang.position.set(xPos, 0.2, zPos);
      this.scene.add(tiang);

      const umpakTiang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.14, 0.24, 8),
        batuMat,
      );
      umpakTiang.position.set(xPos, -1.45, zPos);
      this.scene.add(umpakTiang);
    }

    const jumlahPartikel = 72;
    const posPartikel = new Float32Array(jumlahPartikel * 3);
    for (let i = 0; i < jumlahPartikel; i++) {
      posPartikel[i * 3] = (Math.sin(i * 12.9898) - 0.5) * 3.4;
      posPartikel[i * 3 + 1] = (i / jumlahPartikel - 0.45) * 2.4;
      posPartikel[i * 3 + 2] = (Math.cos(i * 78.233) - 0.5) * 2.2;
    }
    const partikelGeo = new THREE.BufferGeometry();
    partikelGeo.setAttribute('position', new THREE.BufferAttribute(posPartikel, 3));
    const partikelMat = new THREE.PointsMaterial({
      color: '#F5D08A',
      size: 0.024,
      transparent: true,
      opacity: 0.55,
    });
    this.partikelDebu = new THREE.Points(partikelGeo, partikelMat);
    this.scene.add(this.partikelDebu);
  }

  private pasangInteraksiPointer(el: HTMLElement): void {
    el.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDragging = true;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetRotY += dx * 0.0095;
      this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX + dy * 0.0075));
    });

    window.addEventListener('pointerup', (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const gerak = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
      if (gerak < 6 && this.wilahMeshes.length > 0 && this.renderer) {
        this.cekKlikWilahSaron(e, el);
      }
    });

    // Klik ganda pada kanvas langsung memicu efek khusus 3D & suara budaya
    el.addEventListener('dblclick', () => {
      this.picuEfekKhusus3D();
    });

    el.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        this.ubahZoom(e.deltaY * 0.0016);
      },
      { passive: false },
    );
  }

  private cekKlikWilahSaron(e: PointerEvent, container: HTMLElement): void {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.wilahMeshes, false);
    if (hits.length > 0) {
      const idx = this.wilahMeshes.indexOf(hits[0].object as THREE.Mesh);
      if (idx >= 0) {
        this.tabuhWilahSaron(idx);
      }
    }
  }

  tabuhWilahSaron(indeksWilah: number): void {
    const info = NADA_SARON_SLENDRO[indeksWilah];
    if (!info) return;

    const mesh = this.wilahMeshes[indeksWilah];
    if (mesh) {
      mesh.position.y = 0.075;
      this.animasiTabuhTargetX = mesh.position.x;
      this.animasiTabuhWaktu = performance.now();
    }

    const cincin = this.cincinAkustikMeshes[indeksWilah];
    if (cincin) {
      this.cincinAkustikSkala[indeksWilah] = 0.25;
      cincin.visible = true;
    }

    audioBudaya.bunyikanWilahSaron(info.frekuensi, 0.22);
  }

  // Aksi Mekanis 1: Mengaktifkan / menonaktifkan mekanisme utama 3D disertai efek suara budaya
  toggleAksiHidup(paksaNilai?: boolean): boolean {
    this.aksiHidupAktif = typeof paksaNilai === 'boolean' ? paksaNilai : !this.aksiHidupAktif;

    if (this.bendaAktifId === 'keris') {
      audioBudaya.bunyikanCabutKeris(this.aksiHidupAktif);
    } else if (this.bendaAktifId === 'saron') {
      if (this.aksiHidupAktif) {
        this.gendingLangkah = 0;
        this.gendingWaktuTerakhir = 0;
        audioBudaya.bunyikanGongAgeng(0.16);
      }
    } else if (this.bendaAktifId === 'batik') {
      audioBudaya.bunyikanCantingBatik();
    } else if (this.bendaAktifId === 'joglo') {
      audioBudaya.bunyikanStrukturJoglo(this.aksiHidupAktif);
    } else if (this.bendaAktifId === 'wayang') {
      audioBudaya.bunyikanCempalaKeprak(this.aksiHidupAktif ? 'keprak' : 'cempala');
    }

    return this.aksiHidupAktif;
  }

  // Aksi Fisik & Efek Khusus 2: Memicu simulasi fisik kedua yang berbeda pada tiap pusaka 3D
  picuEfekKhusus3D(): void {
    this.efekKhususWaktu = performance.now();

    if (this.bendaAktifId === 'keris') {
      // Pijar Pamor Wos Wutah & Tayuh Pusaka
      audioBudaya.bunyikanCabutKeris(false);
      if (this.kerisCincinPijar) {
        this.kerisCincinPijar.visible = true;
        this.kerisCincinPijar.position.y = -0.22;
      }
    } else if (this.bendaAktifId === 'saron') {
      // Sapuan Glissando 7 Wilah Laras Slendro
      NADA_SARON_SLENDRO.forEach((_, idx) => {
        setTimeout(() => {
          this.tabuhWilahSaron(idx);
        }, idx * 75);
      });
    } else if (this.bendaAktifId === 'batik') {
      // Celup Canting ke Wajan Malam Panas & Tiupan Cucuk
      audioBudaya.bunyikanCantingBatik();
    } else if (this.bendaAktifId === 'joglo') {
      // Toggle Simulasi Uji Guncangan Gempa Bumi 3D pada Umpak & Saka Guru
      this.simulasiGempaAktif = !this.simulasiGempaAktif;
      audioBudaya.bunyikanStrukturJoglo(true);
    } else if (this.bendaAktifId === 'wayang') {
      // Lesatkan Anak Panah Guwawijaya 3D dari Busur Sri Rama
      audioBudaya.bunyikanPanahWayang();
      if (this.wayangAnakPanahGroup) {
        this.wayangAnakPanahGroup.visible = true;
        this.wayangAnakPanahGroup.position.set(0.05, 0.08, 0.04);
      }
    }
  }

  statusAksiHidup(): boolean {
    return this.aksiHidupAktif;
  }

  statusSimulasiGempa(): boolean {
    return this.simulasiGempaAktif;
  }

  private resetReferensiAnimasi(): void {
    this.kerisBilahGroup = null;
    this.kerisWarangkaGroup = null;
    this.kerisCincinPijar = null;
    this.wilahMeshes = [];
    this.cincinAkustikMeshes = [];
    this.cincinAkustikSkala = [];
    this.tabuhGroup = null;
    this.cantingGroup = null;
    this.kainBatikGeo = null;
    this.kainBatikPosAwal = null;
    this.baraAngloMat = null;
    this.uapMalamPoints = null;
    this.jejakMalamMesh = null;
    this.jogloUmpakGroup = null;
    this.jogloSakaGroup = null;
    this.jogloTumpangGroup = null;
    this.jogloAtapGroup = null;
    this.wayangGununganGroup = null;
    this.wayangSatriaGroup = null;
    this.wayangBahuDepan = null;
    this.wayangSikuDepan = null;
    this.wayangBahuBelakang = null;
    this.wayangAnakPanahGroup = null;
  }

  muatBenda(benda: BendaPusaka): void {
    this.bendaAktifId = benda.id;
    this.aksiHidupAktif = false;
    this.simulasiGempaAktif = false;
    this.efekKhususWaktu = 0;
    this.resetReferensiAnimasi();

    for (let i = this.rootGroup.children.length - 1; i >= 0; i--) {
      const child = this.rootGroup.children[i];
      if (child !== this.markerGroup) {
        this.rootGroup.remove(child);
      }
    }

    let model: THREE.Group;
    if (benda.id === 'keris') {
      model = this.bangunKerisRealistis();
      this.targetRotY = 0.28;
      this.targetRotX = 0.08;
    } else if (benda.id === 'saron') {
      model = this.bangunSaronRealistis();
      this.targetRotY = 0.22;
      this.targetRotX = 0.24;
    } else if (benda.id === 'batik') {
      model = this.bangunBatikRealistis();
      this.targetRotY = 0.32;
      this.targetRotX = 0.16;
    } else if (benda.id === 'joglo') {
      model = this.bangunJogloRealistis();
      this.targetRotY = 0.42;
      this.targetRotX = 0.18;
    } else {
      model = this.bangunWayangVolumetrikRealistis();
      this.targetRotY = 0.22;
      this.targetRotX = 0.08;
    }

    model.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    this.rootGroup.add(model);
    this.targetRotZ = 0;
    this.targetZoom = 2.65;

    if (benda.titikInfo[0]) {
      this.fokusKeTitik(benda.titikInfo[0].posisi3D, benda.titikInfo[0].kameraTarget);
    }
  }

  fokusKeTitik(posisiMarker: [number, number, number], targetKamera: [number, number, number]): void {
    this.markerGroup.position.set(posisiMarker[0], posisiMarker[1], posisiMarker[2]);
    this.targetFocus.set(targetKamera[0], targetKamera[1], targetKamera[2]);
  }

  aturPoseScrolly3D(rotY: number, rotX: number, zoom: number): void {
    this.targetRotY = rotY;
    this.targetRotX = Math.max(-0.85, Math.min(0.85, rotX));
    this.targetZoom = Math.max(1.55, Math.min(4.1, zoom));
  }

  putarManual(deltaY: number, deltaX = 0): void {
    this.targetRotY += deltaY;
    this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX + deltaX));
  }

  ubahZoom(delta: number): void {
    this.targetZoom = Math.max(1.55, Math.min(4.1, this.targetZoom + delta));
  }

  resetPandangan(): void {
    this.targetRotY = 0.28;
    this.targetRotX = 0.12;
    this.targetRotZ = 0;
    this.targetZoom = 2.65;
    this.targetFocus.set(0, 0, 0);
  }

  // Menerapkan 6 variasi gestur tangan (orbit, zoom cubit, miring pergelangan, kepal aksi, tunjuk tabuh, sabetan 2 jari)
  terapkanInputTangan(
    normX: number,
    normY: number,
    zoomSkala: number,
    frameLengkap?: FrameTangan,
  ): void {
    this.targetRotY = normX * 1.35;
    this.targetRotX = Math.max(-0.7, Math.min(0.7, -normY * 0.65));
    this.targetZoom = Math.max(1.65, Math.min(3.8, 3.15 - zoomSkala * 0.65));

    // Arahkan sorot lampu minyak blencong mengikuti posisi tangan
    this.blencongLight.position.x = lerp(this.blencongLight.position.x, normX * 1.6, 0.2);

    if (!frameLengkap) return;
    this.targetRotZ = Math.max(-0.38, Math.min(0.38, frameLengkap.kemiringanPergelangan));

    const sekarang = performance.now();

    // Gestur Kepalan Tangan -> memicu mekanisme utama 3D (dengan jeda 1.4 detik agar tidak berulang liar)
    if (
      frameLengkap.gesturAktif === 'kepal-aksi' &&
      sekarang - this.waktuGesturAksiTerakhir > 1400
    ) {
      this.waktuGesturAksiTerakhir = sekarang;
      this.toggleAksiHidup();
    }

    // Gestur Dua Jari Sabetan -> memicu efek fisik khusus kedua 3D
    if (
      frameLengkap.gesturAktif === 'dua-jari-sabetan' &&
      sekarang - this.waktuGesturAksiTerakhir > 1400
    ) {
      this.waktuGesturAksiTerakhir = sekarang;
      this.picuEfekKhusus3D();
    }

    // Gestur Satu Jari Telunjuk pada Saron -> menabuh bilah berdasarkan posisi X jari di udara
    if (frameLengkap.gesturAktif === 'tunjuk-ketuk' && this.bendaAktifId === 'saron') {
      const idxWilah = Math.max(
        0,
        Math.min(6, Math.floor(((normX + 0.75) / 1.5) * 7)),
      );
      if (idxWilah !== this.wilahTerakhirTunjuk && sekarang - this.animasiTabuhWaktu > 210) {
        this.wilahTerakhirTunjuk = idxWilah;
        this.tabuhWilahSaron(idxWilah);
      }
    }
  }

  ubahUkuran(width: number, height: number): void {
    if (!this.renderer) return;
    const w = Math.max(260, width);
    const h = Math.max(220, height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // 1. Keris Jawa Luk 5 berpamor Wos Wutah dan Warangka Gayaman Yogyakarta
  private bangunKerisRealistis(): THREE.Group {
    const g = new THREE.Group();

    const wilahPamorMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.pamorDiff,
      bumpMap: this.teksturs.pamorBump,
      bumpScale: 0.016,
      roughnessMap: this.teksturs.pamorRough,
      roughness: 0.34,
      metalness: 0.86,
      clearcoat: 0.2,
      clearcoatRoughness: 0.35,
    });

    const kayuUkirMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      color: '#6E3B20',
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.62,
      clearcoatRoughness: 0.22,
    });

    const emasPendokMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A94B',
      bumpMap: this.teksturs.ukirRancakanBump,
      bumpScale: 0.012,
      roughnessMap: this.teksturs.perungguRough,
      roughness: 0.24,
      metalness: 0.92,
      clearcoat: 0.3,
    });

    const bilahGroup = new THREE.Group();
    this.kerisBilahGroup = bilahGroup;

    const slices = 64;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= slices; i++) {
      const t = i / slices;
      const y = -0.18 + t * 1.08;
      const pangkalLebar = t < 0.14 ? (1 - t / 0.14) * 0.055 : 0;
      const halfW = Math.max(0.004, (1 - Math.pow(t, 0.86)) * 0.095 + pangkalLebar);
      const tebalTengah = Math.max(0.003, (1 - t * 0.78) * 0.022);

      const lukOffset = Math.sin(t * Math.PI * 5) * 0.042 * (1 - t * 0.32) * Math.min(1, t * 5.5);
      const asimKanan = t < 0.18 ? (1 - t / 0.18) * 0.038 : 0;

      const pts: [number, number, number, number][] = [
        [lukOffset - halfW, y, 0, 0.0],
        [lukOffset, y, tebalTengah, 0.5],
        [lukOffset + halfW + asimKanan, y, 0, 1.0],
        [lukOffset, y, -tebalTengah, 0.5],
      ];

      for (let k = 0; k < 4; k++) {
        positions.push(pts[k][0], pts[k][1], pts[k][2]);
        uvs.push(pts[k][3], t * 2.5);
      }

      if (i < slices) {
        const b = i * 4;
        const n = (i + 1) * 4;
        for (let k = 0; k < 4; k++) {
          const kNext = (k + 1) % 4;
          indices.push(b + k, n + k, n + kNext);
          indices.push(b + k, n + kNext, b + kNext);
        }
      }
    }

    const wilahGeo = new THREE.BufferGeometry();
    wilahGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    wilahGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    wilahGeo.setIndex(indices);
    wilahGeo.computeVertexNormals();

    const wilahMesh = new THREE.Mesh(wilahGeo, wilahPamorMat);
    bilahGroup.add(wilahMesh);

    // Cincin Pijar Pamor 3D untuk efek Tayuh Pusaka
    const cincinPijar = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.008, 12, 32),
      new THREE.MeshBasicMaterial({
        color: '#FFE082',
        transparent: true,
        opacity: 0.85,
      }),
    );
    cincinPijar.rotation.x = Math.PI / 2;
    cincinPijar.position.y = -0.2;
    cincinPijar.visible = false;
    this.kerisCincinPijar = cincinPijar;
    bilahGroup.add(cincinPijar);

    const kembangCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, -0.15, 0),
      new THREE.Vector3(0.135, -0.11, 0.005),
      new THREE.Vector3(0.145, -0.06, 0),
      new THREE.Vector3(0.105, -0.045, -0.004),
    ]);
    const kembangKacang = new THREE.Mesh(
      new THREE.TubeGeometry(kembangCurve, 20, 0.011, 10, false),
      wilahPamorMat,
    );
    bilahGroup.add(kembangKacang);

    const ganjaShape = new THREE.Shape();
    ganjaShape.moveTo(-0.14, -0.018);
    ganjaShape.quadraticCurveTo(-0.16, 0.015, -0.11, 0.024);
    ganjaShape.quadraticCurveTo(0.02, 0.03, 0.24, 0.006);
    ganjaShape.quadraticCurveTo(0.28, -0.012, 0.22, -0.026);
    ganjaShape.quadraticCurveTo(0.04, -0.032, -0.14, -0.018);

    const ganjaGeo = new THREE.ExtrudeGeometry(ganjaShape, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 4,
    });
    ganjaGeo.center();
    const ganjaMesh = new THREE.Mesh(ganjaGeo, wilahPamorMat);
    ganjaMesh.position.set(0.045, -0.21, 0);
    ganjaMesh.rotation.z = -0.05;
    bilahGroup.add(ganjaMesh);

    const mendakGroup = new THREE.Group();
    mendakGroup.position.set(0, -0.255, 0);
    const cincinMendak = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.054, 0.038, 28),
      emasPendokMat,
    );
    mendakGroup.add(cincinMendak);

    const permataMat = new THREE.MeshPhysicalMaterial({
      color: '#B81D13',
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5,
      clearcoat: 1,
    });
    for (let j = 0; j < 12; j++) {
      const s = (j / 12) * Math.PI * 2;
      const permata = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 10, 10), permataMat);
      permata.position.set(Math.cos(s) * 0.05, 0, Math.sin(s) * 0.05);
      mendakGroup.add(permata);
    }
    bilahGroup.add(mendakGroup);

    const huluCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.27, 0),
      new THREE.Vector3(-0.01, -0.38, 0.01),
      new THREE.Vector3(-0.045, -0.5, 0.025),
      new THREE.Vector3(-0.11, -0.59, 0.04),
      new THREE.Vector3(-0.15, -0.62, 0.02),
    ]);
    const huluGeo = new THREE.TubeGeometry(huluCurve, 36, 0.046, 20, false);
    const huluMesh = new THREE.Mesh(huluGeo, kayuUkirMat);
    bilahGroup.add(huluMesh);

    const bonggolHulu = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 24), kayuUkirMat);
    bonggolHulu.scale.set(1.15, 0.9, 0.95);
    bonggolHulu.position.set(-0.135, -0.61, 0.028);
    bilahGroup.add(bonggolHulu);

    g.add(bilahGroup);

    const warangkaGroup = new THREE.Group();
    warangkaGroup.position.set(-0.44, -0.08, -0.04);
    warangkaGroup.rotation.z = 0.08;
    this.kerisWarangkaGroup = warangkaGroup;

    const gayamanShape = new THREE.Shape();
    gayamanShape.moveTo(-0.26, 0.02);
    gayamanShape.bezierCurveTo(-0.28, 0.14, -0.08, 0.18, 0.12, 0.12);
    gayamanShape.bezierCurveTo(0.28, 0.07, 0.34, -0.02, 0.22, -0.09);
    gayamanShape.bezierCurveTo(0.1, -0.14, -0.18, -0.1, -0.26, 0.02);

    const gayamanGeo = new THREE.ExtrudeGeometry(gayamanShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.014,
      bevelSegments: 5,
    });
    gayamanGeo.center();
    const gayamanMesh = new THREE.Mesh(gayamanGeo, kayuUkirMat);
    gayamanMesh.position.set(0.02, -0.12, 0);
    gayamanMesh.rotation.z = 0.24;
    warangkaGroup.add(gayamanMesh);

    const gandarKayu = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.036, 0.78, 24),
      kayuUkirMat,
    );
    gandarKayu.scale.set(1.15, 1, 0.52);
    gandarKayu.position.set(0, -0.54, 0);
    warangkaGroup.add(gandarKayu);

    const pendokEmboss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.039, 0.74, 24),
      emasPendokMat,
    );
    pendokEmboss.scale.set(1.16, 1, 0.54);
    pendokEmboss.position.set(0, -0.55, 0);
    warangkaGroup.add(pendokEmboss);

    const blumbanganMat = new THREE.MeshPhysicalMaterial({
      color: '#7A1F14',
      roughness: 0.32,
      clearcoat: 0.7,
    });
    const blumbangan = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.62, 0.064),
      blumbanganMat,
    );
    blumbangan.position.set(0, -0.54, 0);
    warangkaGroup.add(blumbangan);

    g.add(warangkaGroup);
    return g;
  }

  // 2. Saron Barung Gamelan dengan 7 wilah gangsa tempa dan gelombang akustik 3D
  private bangunSaronRealistis(): THREE.Group {
    const g = new THREE.Group();

    const perungguGangsaMat = new THREE.MeshPhysicalMaterial({
      color: '#D8A648',
      bumpMap: this.teksturs.perungguBump,
      bumpScale: 0.014,
      roughnessMap: this.teksturs.perungguRough,
      roughness: 0.24,
      metalness: 0.91,
      clearcoat: 0.18,
      clearcoatRoughness: 0.28,
    });

    const kayuJatiMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      color: '#5C2214',
      roughness: 0.48,
      metalness: 0.05,
      clearcoat: 0.45,
    });

    const ukirPradaEmasMat = new THREE.MeshPhysicalMaterial({
      color: '#CFA03C',
      bumpMap: this.teksturs.ukirRancakanBump,
      bumpScale: 0.022,
      roughness: 0.3,
      metalness: 0.84,
      clearcoat: 0.25,
    });

    const ronggaGelapMat = new THREE.MeshBasicMaterial({ color: '#0E0906' });

    const badanRancakan = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 0.3, 0.48),
      kayuJatiMat,
    );
    badanRancakan.position.set(0, -0.16, 0);
    g.add(badanRancakan);

    const ronggaAtas = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.02, 0.34),
      ronggaGelapMat,
    );
    ronggaAtas.position.set(0, -0.005, 0);
    g.add(ronggaAtas);

    const panelUkirDepan = new THREE.Mesh(
      new THREE.BoxGeometry(1.44, 0.2, 0.025),
      ukirPradaEmasMat,
    );
    panelUkirDepan.position.set(0, -0.15, 0.245);
    g.add(panelUkirDepan);

    const panelUkirBelakang = panelUkirDepan.clone();
    panelUkirBelakang.position.set(0, -0.15, -0.245);
    g.add(panelUkirBelakang);

    for (const arah of [-1, 1]) {
      const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.54), kayuJatiMat);
      kaki.position.set(arah * 0.74, -0.2, 0);
      g.add(kaki);

      const mahkotaUjung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.09, 0.22, 16),
        ukirPradaEmasMat,
      );
      mahkotaUjung.position.set(arah * 0.84, -0.02, 0);
      mahkotaUjung.rotation.z = -arah * 0.42;
      g.add(mahkotaUjung);
    }

    const kasuranMat = new THREE.MeshStandardMaterial({ color: '#7A1C12', roughness: 0.85 });
    for (const zPos of [-0.17, 0.17]) {
      const kasuran = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 1.42, 14),
        kasuranMat,
      );
      kasuran.rotation.z = Math.PI / 2;
      kasuran.position.set(0, 0.012, zPos);
      g.add(kasuran);
    }

    const akustikRingGeo = new THREE.RingGeometry(0.04, 0.06, 24);
    const akustikRingMat = new THREE.MeshBasicMaterial({
      color: '#FFE082',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    this.wilahMeshes = [];
    this.cincinAkustikMeshes = [];
    this.cincinAkustikSkala = [];

    for (let i = 0; i < 7; i++) {
      const x = -0.57 + i * 0.19;
      const panjangWilah = 0.48 - i * 0.022;
      const lebarWilah = 0.148 - i * 0.004;

      const wilahShape = new THREE.Shape();
      wilahShape.moveTo(-lebarWilah / 2, 0);
      wilahShape.lineTo(lebarWilah / 2, 0);
      wilahShape.lineTo(lebarWilah * 0.42, 0.028);
      wilahShape.quadraticCurveTo(0, 0.048, -lebarWilah * 0.42, 0.028);
      wilahShape.closePath();

      const wilahGeo = new THREE.ExtrudeGeometry(wilahShape, {
        depth: panjangWilah,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.004,
        bevelSegments: 3,
      });
      wilahGeo.center();

      const wilahMesh = new THREE.Mesh(wilahGeo, perungguGangsaMat);
      wilahMesh.position.set(x, 0.042, 0);
      wilahMesh.userData = { indeksWilah: i, nada: NADA_SARON_SLENDRO[i] };
      this.wilahMeshes.push(wilahMesh);
      g.add(wilahMesh);

      // Cincin gelombang akustik 3D di atas tiap bilah
      const cincinAkustik = new THREE.Mesh(akustikRingGeo, akustikRingMat.clone());
      cincinAkustik.rotation.x = -Math.PI / 2;
      cincinAkustik.position.set(x, 0.09, 0);
      cincinAkustik.visible = false;
      this.cincinAkustikMeshes.push(cincinAkustik);
      this.cincinAkustikSkala.push(0);
      g.add(cincinAkustik);

      for (const arahZ of [-1, 1]) {
        const paku = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.012, 0.095, 14),
          ukirPradaEmasMat,
        );
        paku.position.set(x, 0.055, arahZ * (panjangWilah * 0.36));
        g.add(paku);
      }
    }

    const tabuhGroup = new THREE.Group();
    tabuhGroup.position.set(0.42, 0.34, 0.16);

    const gagangPoints = [
      new THREE.Vector2(0.018, 0),
      new THREE.Vector2(0.026, 0.04),
      new THREE.Vector2(0.019, 0.18),
      new THREE.Vector2(0.016, 0.36),
      new THREE.Vector2(0.022, 0.42),
    ];
    const gagangGeo = new THREE.LatheGeometry(gagangPoints, 20);
    const gagangMesh = new THREE.Mesh(gagangGeo, kayuJatiMat);
    gagangMesh.rotation.z = 1.05;
    gagangMesh.rotation.x = -0.28;
    tabuhGroup.add(gagangMesh);

    const kepalaTabuh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.046, 0.165, 24),
      kayuJatiMat,
    );
    kepalaTabuh.position.set(-0.32, 0.19, -0.09);
    kepalaTabuh.rotation.z = -0.52;
    tabuhGroup.add(kepalaTabuh);

    const cincinTabuh = new THREE.Mesh(
      new THREE.TorusGeometry(0.053, 0.007, 12, 24),
      ukirPradaEmasMat,
    );
    cincinTabuh.position.set(-0.32, 0.19, -0.09);
    cincinTabuh.rotation.y = Math.PI / 2;
    tabuhGroup.add(cincinTabuh);

    this.tabuhGroup = tabuhGroup;
    g.add(tabuhGroup);

    return g;
  }

  // 3. Batik Tulis dan Canting Tembaga dengan jejak malam emas 3D serta uap malam panas
  private bangunBatikRealistis(): THREE.Group {
    const g = new THREE.Group();

    const kayuGawanganMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      color: '#5E341E',
      roughness: 0.44,
      clearcoat: 0.5,
    });

    const tembagaMat = new THREE.MeshPhysicalMaterial({
      color: '#C87538',
      roughnessMap: this.teksturs.perungguRough,
      roughness: 0.22,
      metalness: 0.92,
      clearcoat: 0.35,
    });

    const bambuMat = new THREE.MeshPhysicalMaterial({
      color: '#C29B56',
      bumpMap: this.teksturs.gedebogBump,
      bumpScale: 0.012,
      roughness: 0.52,
      clearcoat: 0.3,
    });

    const terakotaMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.terakotaDiff,
      bumpMap: this.teksturs.terakotaBump,
      bumpScale: 0.016,
      roughness: 0.76,
    });

    const gawanganGroup = new THREE.Group();
    gawanganGroup.position.set(-0.1, 0, 0);

    for (const xTiang of [-0.54, 0.54]) {
      const tiang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.032, 1.05, 16),
        kayuGawanganMat,
      );
      tiang.position.set(xTiang, -0.02, 0);
      gawanganGroup.add(tiang);

      const kakiMelintang = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.045, 0.48),
        kayuGawanganMat,
      );
      kakiMelintang.position.set(xTiang, -0.53, 0);
      gawanganGroup.add(kakiMelintang);

      const mahkotaUkir = new THREE.Mesh(
        new THREE.SphereGeometry(0.046, 16, 16),
        kayuGawanganMat,
      );
      mahkotaUkir.position.set(xTiang, 0.52, 0);
      gawanganGroup.add(mahkotaUkir);
    }

    const palangAtas = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 1.24, 18),
      kayuGawanganMat,
    );
    palangAtas.rotation.z = Math.PI / 2;
    palangAtas.position.set(0, 0.44, 0);
    gawanganGroup.add(palangAtas);

    const palangBawah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.12, 16),
      kayuGawanganMat,
    );
    palangBawah.rotation.z = Math.PI / 2;
    palangBawah.position.set(0, -0.36, 0);
    gawanganGroup.add(palangBawah);

    const segX = 32;
    const segY = 28;
    const kainGeo = new THREE.PlaneGeometry(0.92, 0.88, segX, segY);
    const posAttr = kainGeo.attributes.position as THREE.BufferAttribute;
    const posAwal = new Float32Array(posAttr.array.length);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const normY = (y + 0.44) / 0.88;
      const yMelengkung = -0.32 + normY * 0.76;
      const zSampiran =
        Math.sin(normY * Math.PI) * 0.14 +
        Math.cos(x * 6.5) * 0.018 * (1 - normY * 0.5);

      posAttr.setXYZ(i, x, yMelengkung, zSampiran);
      posAwal[i * 3] = x;
      posAwal[i * 3 + 1] = yMelengkung;
      posAwal[i * 3 + 2] = zSampiran;
    }
    kainGeo.computeVertexNormals();
    this.kainBatikGeo = kainGeo;
    this.kainBatikPosAwal = posAwal;

    const kainBatikMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.batikDiff,
      bumpMap: this.teksturs.batikBump,
      bumpScale: 0.022,
      roughness: 0.65,
      metalness: 0.08,
      clearcoat: 0.18,
      side: THREE.DoubleSide,
    });
    const kainMesh = new THREE.Mesh(kainGeo, kainBatikMat);
    gawanganGroup.add(kainMesh);

    const malamCairMat = new THREE.MeshPhysicalMaterial({
      color: '#E5A93B',
      emissive: '#9E5B08',
      emissiveIntensity: 0.55,
      roughness: 0.18,
      transmission: 0.25,
    });

    // Pita Jejak Malam Emas 3D yang timbul di permukaan kain saat canting bergerak
    const jejakCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.02, 0.15),
      new THREE.Vector3(-0.08, 0.14, 0.155),
      new THREE.Vector3(0.06, 0.06, 0.155),
      new THREE.Vector3(0.2, 0.18, 0.15),
    ]);
    const jejakMalam = new THREE.Mesh(
      new THREE.TubeGeometry(jejakCurve, 28, 0.008, 8, false),
      malamCairMat,
    );
    this.jejakMalamMesh = jejakMalam;
    gawanganGroup.add(jejakMalam);

    g.add(gawanganGroup);

    const cantingGroup = new THREE.Group();
    cantingGroup.position.set(0.22, 0.18, 0.22);
    this.cantingGroup = cantingGroup;

    const nyamplungan = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 24, 18),
      tembagaMat,
    );
    nyamplungan.scale.set(1.25, 0.82, 0.88);
    cantingGroup.add(nyamplungan);

    const isiMalam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.038, 0.02, 18),
      malamCairMat,
    );
    isiMalam.position.set(0, 0.028, 0);
    cantingGroup.add(isiMalam);

    const cucukCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.058, 0.005, 0),
      new THREE.Vector3(-0.105, -0.008, -0.018),
      new THREE.Vector3(-0.135, -0.038, -0.042),
    ]);
    const cucukMesh = new THREE.Mesh(
      new THREE.TubeGeometry(cucukCurve, 18, 0.0085, 12, false),
      tembagaMat,
    );
    cantingGroup.add(cucukMesh);

    const tetesMalam = new THREE.Mesh(
      new THREE.SphereGeometry(0.011, 12, 12),
      malamCairMat,
    );
    tetesMalam.position.set(-0.138, -0.042, -0.045);
    cantingGroup.add(tetesMalam);

    const gagangCanting = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, 0.36, 14),
      bambuMat,
    );
    gagangCanting.rotation.z = Math.PI / 2 - 0.12;
    gagangCanting.position.set(0.22, 0.02, 0.02);
    cantingGroup.add(gagangCanting);

    cantingGroup.rotation.y = 0.28;
    cantingGroup.rotation.z = 0.15;
    g.add(cantingGroup);

    const angloGroup = new THREE.Group();
    angloGroup.position.set(0.46, -0.34, 0.22);

    const badanAnglo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.22, 20),
      terakotaMat,
    );
    badanAnglo.position.y = -0.08;
    angloGroup.add(badanAnglo);

    const baraMat = new THREE.MeshStandardMaterial({
      color: '#FF5722',
      emissive: '#FF3D00',
      emissiveIntensity: 1.4,
      roughness: 0.4,
    });
    this.baraAngloMat = baraMat;
    const baraMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 12),
      baraMat,
    );
    baraMesh.scale.set(1.2, 0.45, 1.2);
    baraMesh.position.set(0, -0.06, 0.06);
    angloGroup.add(baraMesh);

    const wajanMat = new THREE.MeshStandardMaterial({
      color: '#2A2623',
      roughness: 0.45,
      metalness: 0.78,
    });
    const wajanMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
      wajanMat,
    );
    wajanMesh.position.y = 0.14;
    angloGroup.add(wajanMesh);

    const kolamMalam = new THREE.Mesh(
      new THREE.CircleGeometry(0.145, 24),
      malamCairMat,
    );
    kolamMalam.rotation.x = -Math.PI / 2;
    kolamMalam.position.y = 0.045;
    angloGroup.add(kolamMalam);

    // Partikel uap malam hangat yang membubung dari wajan di atas anglo
    const jmlUap = 24;
    const posUap = new Float32Array(jmlUap * 3);
    for (let i = 0; i < jmlUap; i++) {
      posUap[i * 3] = Math.sin(i * 4.2) * 0.07;
      posUap[i * 3 + 1] = 0.06 + (i / jmlUap) * 0.34;
      posUap[i * 3 + 2] = Math.cos(i * 4.2) * 0.07;
    }
    const uapGeo = new THREE.BufferGeometry();
    uapGeo.setAttribute('position', new THREE.BufferAttribute(posUap, 3));
    const uapPoints = new THREE.Points(
      uapGeo,
      new THREE.PointsMaterial({
        color: '#FFE6B0',
        size: 0.022,
        transparent: true,
        opacity: 0.52,
      }),
    );
    this.uapMalamPoints = uapPoints;
    angloGroup.add(uapPoints);

    g.add(angloGroup);
    return g;
  }

  // 4. Pendopo Joglo Jawa dengan bedah struktur dan simulasi uji gempa 3D
  private bangunJogloRealistis(): THREE.Group {
    const g = new THREE.Group();

    const batuAndesitMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.batuAndesitDiff,
      bumpMap: this.teksturs.batuAndesitBump,
      bumpScale: 0.018,
      roughness: 0.82,
      metalness: 0.05,
    });

    const kayuJatiSakaMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      color: '#63371E',
      roughness: 0.44,
      clearcoat: 0.48,
    });

    const emasTumpangMat = new THREE.MeshPhysicalMaterial({
      color: '#D4A243',
      bumpMap: this.teksturs.ukirRancakanBump,
      bumpScale: 0.016,
      roughness: 0.3,
      metalness: 0.85,
    });

    const gentengTerakotaMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.terakotaDiff,
      bumpMap: this.teksturs.terakotaBump,
      bumpScale: 0.022,
      roughness: 0.62,
      clearcoat: 0.15,
    });

    const umpakGroup = new THREE.Group();
    this.jogloUmpakGroup = umpakGroup;

    const lantaiBawah = new THREE.Mesh(
      new THREE.BoxGeometry(1.68, 0.07, 1.38),
      batuAndesitMat,
    );
    lantaiBawah.position.set(0, -0.52, 0);
    umpakGroup.add(lantaiBawah);

    const lantaiAtas = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 0.06, 1.22),
      batuAndesitMat,
    );
    lantaiAtas.position.set(0, -0.46, 0);
    umpakGroup.add(lantaiAtas);

    const posSakaGuru: [number, number][] = [
      [-0.28, -0.22],
      [0.28, -0.22],
      [-0.28, 0.22],
      [0.28, 0.22],
    ];
    for (const [x, z] of posSakaGuru) {
      const umpak = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.068, 0.11, 4),
        batuAndesitMat,
      );
      umpak.rotation.y = Math.PI / 4;
      umpak.position.set(x, -0.38, z);
      umpakGroup.add(umpak);
    }

    const posSakaLuar: [number, number][] = [
      [-0.64, -0.48],
      [0, -0.48],
      [0.64, -0.48],
      [-0.64, 0],
      [0.64, 0],
      [-0.64, 0.48],
      [0, 0.48],
      [0.64, 0.48],
    ];
    for (const [x, z] of posSakaLuar) {
      const umpakKecil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.05, 0.08, 4),
        batuAndesitMat,
      );
      umpakKecil.rotation.y = Math.PI / 4;
      umpakKecil.position.set(x, -0.39, z);
      umpakGroup.add(umpakKecil);
    }
    g.add(umpakGroup);

    const sakaGroup = new THREE.Group();
    this.jogloSakaGroup = sakaGroup;

    for (const [x, z] of posSakaGuru) {
      const tiangGuru = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.042, 0.56, 16),
        kayuJatiSakaMat,
      );
      tiangGuru.position.set(x, -0.06, z);
      sakaGroup.add(tiangGuru);
    }

    for (const [x, z] of posSakaLuar) {
      const tiangLuar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.028, 0.42, 12),
        kayuJatiSakaMat,
      );
      tiangLuar.position.set(x, -0.14, z);
      sakaGroup.add(tiangLuar);
    }

    const blandarDepan = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.035, 0.035),
      kayuJatiSakaMat,
    );
    blandarDepan.position.set(0, 0.07, 0.48);
    sakaGroup.add(blandarDepan);

    const blandarBelakang = blandarDepan.clone();
    blandarBelakang.position.set(0, 0.07, -0.48);
    sakaGroup.add(blandarBelakang);

    const pengeretKiri = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.035, 1.0),
      kayuJatiSakaMat,
    );
    pengeretKiri.position.set(-0.64, 0.07, 0);
    sakaGroup.add(pengeretKiri);

    const pengeretKanan = pengeretKiri.clone();
    pengeretKanan.position.set(0.64, 0.07, 0);
    sakaGroup.add(pengeretKanan);

    g.add(sakaGroup);

    const tumpangGroup = new THREE.Group();
    this.jogloTumpangGroup = tumpangGroup;

    for (let tingkat = 0; tingkat < 5; tingkat++) {
      const yTingkat = 0.22 + tingkat * 0.034;
      const skalaDalam = 1 - tingkat * 0.12;
      const wBalok = 0.62 * skalaDalam;
      const dBalok = 0.48 * skalaDalam;
      const matBalok = tingkat % 2 === 1 ? emasTumpangMat : kayuJatiSakaMat;

      const balokUtara = new THREE.Mesh(new THREE.BoxGeometry(wBalok, 0.03, 0.034), matBalok);
      balokUtara.position.set(0, yTingkat, -dBalok / 2);
      tumpangGroup.add(balokUtara);

      const balokSelatan = balokUtara.clone();
      balokSelatan.position.set(0, yTingkat, dBalok / 2);
      tumpangGroup.add(balokSelatan);

      const balokBarat = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.03, dBalok), matBalok);
      balokBarat.position.set(-wBalok / 2, yTingkat, 0);
      tumpangGroup.add(balokBarat);

      const balokTimur = balokBarat.clone();
      balokTimur.position.set(wBalok / 2, yTingkat, 0);
      tumpangGroup.add(balokTimur);
    }

    const dadaPeksi = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.038, 0.048),
      emasTumpangMat,
    );
    dadaPeksi.position.set(0, 0.36, 0);
    tumpangGroup.add(dadaPeksi);

    g.add(tumpangGroup);

    const atapGroup = new THREE.Group();
    this.jogloAtapGroup = atapGroup;

    const penanggapGeo = new THREE.CylinderGeometry(0.56, 1.12, 0.22, 4, 1);
    const penanggapMesh = new THREE.Mesh(penanggapGeo, gentengTerakotaMat);
    penanggapMesh.rotation.y = Math.PI / 4;
    penanggapMesh.scale.set(1.24, 1, 0.98);
    penanggapMesh.position.set(0, 0.19, 0);
    atapGroup.add(penanggapMesh);

    const brunjungGeo = new THREE.CylinderGeometry(0.18, 0.58, 0.42, 4, 1);
    const brunjungMesh = new THREE.Mesh(brunjungGeo, gentengTerakotaMat);
    brunjungMesh.rotation.y = Math.PI / 4;
    brunjungMesh.scale.set(1.22, 1, 0.95);
    brunjungMesh.position.set(0, 0.49, 0);
    atapGroup.add(brunjungMesh);

    const bubunganPuncak = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.045, 0.045),
      emasTumpangMat,
    );
    bubunganPuncak.position.set(0, 0.71, 0);
    atapGroup.add(bubunganPuncak);

    for (const arahX of [-0.16, 0, 0.16]) {
      const mahkotaWuwung = new THREE.Mesh(
        new THREE.ConeGeometry(0.032, 0.095, 8),
        emasTumpangMat,
      );
      mahkotaWuwung.position.set(arahX, 0.76, 0);
      atapGroup.add(mahkotaWuwung);
    }

    g.add(atapGroup);
    return g;
  }

  // 5. Wayang dan Gunungan (Kayon) 3D volumetrik berartikulasi dengan lesatan panah Guwawijaya 3D
  private bangunWayangVolumetrikRealistis(): THREE.Group {
    const g = new THREE.Group();

    const gununganGroup = bangunGununganKayonRealistis3D(this.teksturs, 1.02);
    gununganGroup.position.set(-0.34, 0.04, -0.04);
    gununganGroup.rotation.y = 0.18;
    this.wayangGununganGroup = gununganGroup;
    g.add(gununganGroup);

    const rigSatria = bangunSriRamaRealistis3D(this.teksturs);
    rigSatria.group.position.set(0.24, 0.02, 0.04);
    this.wayangSatriaGroup = rigSatria.group;
    this.wayangBahuDepan = rigSatria.bahuDepan;
    this.wayangSikuDepan = rigSatria.sikuDepan;
    this.wayangBahuBelakang = rigSatria.bahuBelakang;
    g.add(rigSatria.group);

    // Anak Panah Guwawijaya 3D yang melesat saat picuEfekKhusus3D dipanggil
    const panahGroup = new THREE.Group();
    panahGroup.position.set(0.05, 0.08, 0.04);
    panahGroup.visible = false;
    this.wayangAnakPanahGroup = panahGroup;

    const batangPanah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.42, 8),
      new THREE.MeshPhysicalMaterial({
        color: '#F2C65A',
        metalness: 0.88,
        roughness: 0.2,
      }),
    );
    batangPanah.rotation.z = Math.PI / 2;
    panahGroup.add(batangPanah);

    const mataPanah = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.065, 8),
      new THREE.MeshBasicMaterial({ color: '#FFE082' }),
    );
    mataPanah.rotation.z = Math.PI / 2;
    mataPanah.position.x = -0.23;
    panahGroup.add(mataPanah);

    g.add(panahGroup);
    return g;
  }

  private perbaruiAnimasiHidup(time: number): void {
    const t = time * 0.001;
    const dtEfek = this.efekKhususWaktu > 0 ? (time - this.efekKhususWaktu) * 0.001 : 99;

    // 1. Keris: Cabut/Sarungkan + Pijar Pamor Wesi Aji
    if (this.kerisBilahGroup && this.kerisWarangkaGroup) {
      const sedangTayuh = dtEfek < 1.3;
      const targetX = this.aksiHidupAktif ? -0.44 : 0;
      const targetY = this.aksiHidupAktif
        ? -0.32
        : Math.sin(t * 2.1) * 0.025 + (sedangTayuh ? 0.08 : 0);
      const targetZ = this.aksiHidupAktif ? -0.035 : 0;
      const targetRotZ = this.aksiHidupAktif
        ? 0.08
        : sedangTayuh
          ? Math.sin(dtEfek * Math.PI * 2) * 0.16
          : 0;

      this.kerisBilahGroup.position.x = lerp(this.kerisBilahGroup.position.x, targetX, 0.08);
      this.kerisBilahGroup.position.y = lerp(this.kerisBilahGroup.position.y, targetY, 0.08);
      this.kerisBilahGroup.position.z = lerp(this.kerisBilahGroup.position.z, targetZ, 0.08);
      this.kerisBilahGroup.rotation.z = lerp(this.kerisBilahGroup.rotation.z, targetRotZ, 0.08);

      if (this.kerisCincinPijar) {
        if (sedangTayuh) {
          this.kerisCincinPijar.visible = true;
          this.kerisCincinPijar.position.y = -0.22 + (dtEfek / 1.3) * 1.12;
          const sc = 1.0 - (dtEfek / 1.3) * 0.65;
          this.kerisCincinPijar.scale.set(sc, sc, 1);
        } else {
          this.kerisCincinPijar.visible = false;
        }
      }
    }

    // 2. Saron: Getaran wilah, cincin gelombang akustik 3D, & Gending Lancaran otomatis
    for (let i = 0; i < this.wilahMeshes.length; i++) {
      const w = this.wilahMeshes[i];
      w.position.y = lerp(w.position.y, 0.042, 0.18);

      const cincin = this.cincinAkustikMeshes[i];
      if (cincin && cincin.visible) {
        this.cincinAkustikSkala[i] += 0.055;
        const s = this.cincinAkustikSkala[i];
        cincin.scale.set(s, s, 1);
        cincin.position.y = 0.08 + s * 0.04;
        const mat = cincin.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - s * 0.36);
        if (mat.opacity <= 0.02) {
          cincin.visible = false;
        }
      }
    }

    if (this.bendaAktifId === 'saron' && this.aksiHidupAktif && this.wilahMeshes.length === 7) {
      if (time - this.gendingWaktuTerakhir > 420) {
        this.gendingWaktuTerakhir = time;
        const idxNada = POLA_GENDING_LANCARAN[this.gendingLangkah % POLA_GENDING_LANCARAN.length];
        this.tabuhWilahSaron(idxNada);
        this.gendingLangkah++;
      }
    }

    if (this.tabuhGroup && this.animasiTabuhWaktu > 0) {
      const dt = (time - this.animasiTabuhWaktu) * 0.001;
      if (dt < 0.35) {
        const ayun = Math.sin((dt / 0.35) * Math.PI);
        this.tabuhGroup.position.x = lerp(
          this.tabuhGroup.position.x,
          this.animasiTabuhTargetX + 0.32,
          0.25,
        );
        this.tabuhGroup.position.y = 0.34 - ayun * 0.14;
        this.tabuhGroup.rotation.z = -ayun * 0.28;
      } else {
        this.tabuhGroup.position.y = lerp(this.tabuhGroup.position.y, 0.34, 0.15);
        this.tabuhGroup.rotation.z = lerp(this.tabuhGroup.rotation.z, 0, 0.15);
      }
    }

    // 3. Batik: Gelombang kain mori 3D, uap malam panas, & celupan canting ke wajan
    if (this.kainBatikGeo && this.kainBatikPosAwal && !this.reducedMotion) {
      const posAttr = this.kainBatikGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const x0 = this.kainBatikPosAwal[i * 3];
        const y0 = this.kainBatikPosAwal[i * 3 + 1];
        const z0 = this.kainBatikPosAwal[i * 3 + 2];
        const faktorBawah = Math.max(0, (0.42 - y0) * 0.85);
        const ombak = Math.sin(t * 2.2 + x0 * 5.0 + y0 * 3.0) * 0.014 * faktorBawah;
        posAttr.setZ(i, z0 + ombak);
      }
      posAttr.needsUpdate = true;
    }

    if (this.uapMalamPoints && !this.reducedMotion) {
      const uapAttr = this.uapMalamPoints.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < uapAttr.count; i++) {
        let yUap = uapAttr.getY(i) + 0.0032;
        if (yUap > 0.42) yUap = 0.06;
        uapAttr.setY(i, yUap);
      }
      uapAttr.needsUpdate = true;
    }

    if (this.cantingGroup) {
      // Bila efek khusus baru dipicu (< 1.1 detik), canting mencelup ke kolam malam di wajan kanan bawah
      if (dtEfek < 1.1) {
        this.cantingGroup.position.x = lerp(this.cantingGroup.position.x, 0.48, 0.15);
        this.cantingGroup.position.y = lerp(this.cantingGroup.position.y, -0.22, 0.15);
        this.cantingGroup.position.z = lerp(this.cantingGroup.position.z, 0.25, 0.15);
        this.cantingGroup.rotation.z = lerp(this.cantingGroup.rotation.z, -0.25, 0.15);
      } else {
        const kecepatan = this.aksiHidupAktif ? 2.6 : 0.9;
        const radiusX = this.aksiHidupAktif ? 0.22 : 0.08;
        const radiusY = this.aksiHidupAktif ? 0.16 : 0.05;
        const targetCantingX = 0.08 + Math.sin(t * kecepatan) * radiusX;
        const targetCantingY = 0.12 + Math.sin(t * kecepatan * 2) * radiusY;
        const targetCantingZ = 0.22 + Math.cos(t * kecepatan) * 0.03;

        this.cantingGroup.position.x = lerp(this.cantingGroup.position.x, targetCantingX, 0.12);
        this.cantingGroup.position.y = lerp(this.cantingGroup.position.y, targetCantingY, 0.12);
        this.cantingGroup.position.z = lerp(this.cantingGroup.position.z, targetCantingZ, 0.12);
        this.cantingGroup.rotation.z = 0.15 + Math.cos(t * kecepatan) * 0.12;
      }
    }

    if (this.baraAngloMat && !this.reducedMotion) {
      this.baraAngloMat.emissiveIntensity = 1.25 + Math.sin(t * 5.5) * 0.35;
    }

    // 4. Joglo: Bedah Struktur 3D (Exploded View) & Simulasi Uji Guncangan Gempa Bumi
    if (
      this.jogloUmpakGroup &&
      this.jogloSakaGroup &&
      this.jogloTumpangGroup &&
      this.jogloAtapGroup
    ) {
      const targetUmpakY = this.aksiHidupAktif ? -0.18 : 0;
      const targetSakaY = this.aksiHidupAktif ? -0.02 : 0;
      const targetTumpangY = this.aksiHidupAktif ? 0.22 : 0;
      const targetAtapY = this.aksiHidupAktif ? 0.52 : 0;

      this.jogloUmpakGroup.position.y = lerp(this.jogloUmpakGroup.position.y, targetUmpakY, 0.09);
      this.jogloSakaGroup.position.y = lerp(this.jogloSakaGroup.position.y, targetSakaY, 0.09);
      this.jogloTumpangGroup.position.y = lerp(
        this.jogloTumpangGroup.position.y,
        targetTumpangY,
        0.09,
      );
      this.jogloAtapGroup.position.y = lerp(this.jogloAtapGroup.position.y, targetAtapY, 0.09);

      // Bila simulasi gempa aktif, umpak batu berguncang horizontal sementara Saka Guru & Tumpang Sari meredam secara elastis
      if (this.simulasiGempaAktif && !this.reducedMotion) {
        const guncangTanah = Math.sin(t * 18.0) * 0.045;
        const redamSaka = Math.sin(t * 18.0 - 0.65) * 0.024;
        const redamAtap = Math.sin(t * 18.0 - 1.25) * 0.012;

        this.jogloUmpakGroup.position.x = guncangTanah;
        this.jogloSakaGroup.position.x = redamSaka;
        this.jogloSakaGroup.rotation.z = -redamSaka * 0.65;
        this.jogloTumpangGroup.position.x = redamAtap;
        this.jogloAtapGroup.position.x = redamAtap;
      } else {
        this.jogloUmpakGroup.position.x = lerp(this.jogloUmpakGroup.position.x, 0, 0.15);
        this.jogloSakaGroup.position.x = lerp(this.jogloSakaGroup.position.x, 0, 0.15);
        this.jogloSakaGroup.rotation.z = lerp(this.jogloSakaGroup.rotation.z, 0, 0.15);
        this.jogloTumpangGroup.position.x = lerp(this.jogloTumpangGroup.position.x, 0, 0.15);
        this.jogloAtapGroup.position.x = lerp(this.jogloAtapGroup.position.x, 0, 0.15);
      }
    }

    // 5. Wayang & Gunungan 3D: Artikulasi sendi tuding & Lesatan Panah Guwawijaya 3D
    if (
      this.wayangGununganGroup &&
      this.wayangSatriaGroup &&
      this.wayangBahuDepan &&
      this.wayangSikuDepan &&
      this.wayangBahuBelakang
    ) {
      const amp = this.aksiHidupAktif ? 1.0 : 0.28;
      this.wayangGununganGroup.rotation.z = Math.sin(t * 2.0) * 0.12 * amp;
      this.wayangGununganGroup.rotation.y = 0.18 + Math.cos(t * 1.6) * 0.18 * amp;

      this.wayangBahuDepan.rotation.z = -0.55 + Math.sin(t * 2.8) * 0.35 * amp;
      this.wayangSikuDepan.rotation.z = -0.95 + Math.cos(t * 2.8) * 0.28 * amp;
      this.wayangBahuBelakang.rotation.z = 0.42 - Math.sin(t * 2.8) * 0.25 * amp;
      this.wayangSatriaGroup.position.y = 0.02 + Math.sin(t * 2.2) * 0.02 * amp;

      if (this.wayangAnakPanahGroup) {
        if (dtEfek < 1.1) {
          this.wayangAnakPanahGroup.visible = true;
          this.wayangAnakPanahGroup.position.x = 0.05 - (dtEfek / 1.1) * 1.45;
          this.wayangAnakPanahGroup.position.y = 0.08 + Math.sin((dtEfek / 1.1) * Math.PI) * 0.12;
        } else {
          this.wayangAnakPanahGroup.visible = false;
        }
      }
    }
  }

  private mulaiLoop = (): void => {
    const step = (time: number): void => {
      this.rootGroup.rotation.y = lerp(this.rootGroup.rotation.y, this.targetRotY, 0.12);
      this.rootGroup.rotation.x = lerp(this.rootGroup.rotation.x, this.targetRotX, 0.12);
      this.rootGroup.rotation.z = lerp(this.rootGroup.rotation.z, this.targetRotZ, 0.12);
      this.camera.position.z = lerp(this.camera.position.z, this.targetZoom, 0.12);
      this.currentFocus.lerp(this.targetFocus, 0.12);
      this.camera.lookAt(this.currentFocus);
      this.markerRing.lookAt(this.camera.position);

      this.perbaruiAnimasiHidup(time);

      if (!this.reducedMotion) {
        this.blencongLight.intensity = 12.2 + Math.sin(time * 0.0038) * 0.45;
        const s = 1 + Math.sin(time * 0.005) * 0.14;
        this.markerRing.scale.set(s, s, 1);
        if (this.cincinPanggungMesh) {
          this.cincinPanggungMesh.rotation.z = time * 0.00025;
        }
        if (this.partikelDebu) {
          this.partikelDebu.rotation.y = time * 0.00015;
        }
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
