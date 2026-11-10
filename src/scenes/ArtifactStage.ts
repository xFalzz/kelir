// Adegan 3D Ruang Pegang menggunakan Three.js dengan tekstur PBR nyata (Poly Haven CC0 1K),
// citra wayang museum (Tropenmuseum CC BY-SA 3.0) berbayangan tatahan asli,
// geometri pahatan berdetail tinggi, serta sintesis suara Saron Laras Slendro (Web Audio API).

import * as THREE from 'three';
import type { BendaPusaka } from '../content/pusaka';
import { lerp } from '../lib/handTracker';
import {
  ambilKoleksiTeksturPBR,
  pasangLingkunganPBR,
  type KoleksiTeksturPBR,
} from './pbrMaterials';

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

export class ArtifactStage {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private rootGroup: THREE.Group;
  private markerGroup: THREE.Group;
  private markerRing: THREE.Mesh;
  private blencongLight: THREE.SpotLight;
  private teksturs: KoleksiTeksturPBR;
  private rafId: number | null = null;
  private reducedMotion = false;

  private targetRotY = 0.26;
  private targetRotX = 0.08;
  private targetZoom = 2.65;
  private targetFocus = new THREE.Vector3(0, 0, 0);
  private currentFocus = new THREE.Vector3(0, 0, 0);

  private isDragging = false;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private lastX = 0;
  private lastY = 0;

  private wilahMeshes: THREE.Mesh[] = [];
  private tabuhGroup: THREE.Group | null = null;
  private animasiTabuhWaktu = 0;
  private animasiTabuhTargetX = 0.35;
  private audioCtx: AudioContext | null = null;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();

  readonly webglTersedia: boolean;

  constructor(container: HTMLElement, bendaAwal: BendaPusaka) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#140F0B');

    const w = Math.max(280, container.clientWidth || 640);
    const h = Math.max(240, container.clientHeight || 420);
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 40);
    this.camera.position.set(0, 0.12, this.targetZoom);

    this.teksturs = ambilKoleksiTeksturPBR();

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    this.bangunLatarKelirDanPlangkan();

    // Pencahayaan studio + lampu minyak blencong hangat
    const hemi = new THREE.HemisphereLight('#FFF3DC', '#261A12', 0.85);
    this.scene.add(hemi);

    this.blencongLight = new THREE.SpotLight('#FFD296', 11.5, 16, Math.PI / 2.9, 0.48, 1.25);
    this.blencongLight.position.set(0.32, 0.58, 3.05);
    this.blencongLight.castShadow = true;
    this.blencongLight.shadow.mapSize.width = 2048;
    this.blencongLight.shadow.mapSize.height = 2048;
    this.blencongLight.shadow.bias = -0.00035;
    this.blencongLight.shadow.normalBias = 0.015;
    this.scene.add(this.blencongLight);

    const rimWarm = new THREE.DirectionalLight('#E07A42', 1.65);
    rimWarm.position.set(-2.4, 1.5, 1.4);
    this.scene.add(rimWarm);

    const fillGold = new THREE.DirectionalLight('#FFE5B8', 0.95);
    fillGold.position.set(2.1, -0.9, 1.8);
    this.scene.add(fillGold);

    // Penanda titik anatomis 3D (bola inti + cincin emas berdenyut)
    this.markerGroup = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(0.036, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#D94E28',
      emissive: '#9E2E17',
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.markerGroup.add(coreMesh);

    const ringGeo = new THREE.RingGeometry(0.052, 0.072, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#F5D08A',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
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
      this.renderer.toneMappingExposure = 1.12;
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

  private bangunLatarKelirDanPlangkan(): void {
    // Kain mori kelir bertenun asli tempat bayangan jatuh
    const kelirGeo = new THREE.PlaneGeometry(7.8, 4.6);
    const kelirMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.tenunKelirDiff,
      bumpMap: this.teksturs.tenunKelirBump,
      bumpScale: 0.008,
      roughness: 0.88,
      metalness: 0.02,
    });
    const kelirPlane = new THREE.Mesh(kelirGeo, kelirMat);
    kelirPlane.position.set(0, 0.05, -0.82);
    kelirPlane.receiveShadow = true;
    this.scene.add(kelirPlane);

    // Pita plipit merah tua berlist emas di tepi atas dan bawah kelir
    const plipitMat = new THREE.MeshStandardMaterial({
      color: '#6E1D11',
      bumpMap: this.teksturs.tenunKelirBump,
      bumpScale: 0.005,
      roughness: 0.72,
    });
    const plipitAtas = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.14, 0.02), plipitMat);
    plipitAtas.position.set(0, 1.54, -0.8);
    plipitAtas.receiveShadow = true;
    this.scene.add(plipitAtas);

    const plipitBawah = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.14, 0.02), plipitMat);
    plipitBawah.position.set(0, -1.42, -0.8);
    plipitBawah.receiveShadow = true;
    this.scene.add(plipitBawah);

    // Bingkai kayu jati ukir (plangkan) dengan tekstur PBR kayu gelap
    const kayuPlangkanMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.kayuGelapDiff,
      normalMap: this.teksturs.kayuGelapNor,
      roughnessMap: this.teksturs.kayuGelapRough,
      roughness: 0.62,
      clearcoat: 0.25,
    });
    const palangAtas = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.18, 0.16), kayuPlangkanMat);
    palangAtas.position.set(0, 1.68, -0.76);
    this.scene.add(palangAtas);

    // Gedebog (batang pisang) di bagian bawah kelir
    const gedebogMat = new THREE.MeshStandardMaterial({
      map: this.teksturs.gedebogDiff,
      bumpMap: this.teksturs.gedebogBump,
      bumpScale: 0.018,
      roughness: 0.78,
    });
    const gedebog = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 7.8, 28),
      gedebogMat,
    );
    gedebog.rotation.z = Math.PI / 2;
    gedebog.position.set(0, -1.58, -0.68);
    gedebog.receiveShadow = true;
    this.scene.add(gedebog);
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

  // Membunyikan nada bilah saron menggunakan sintesis FM/harmonik inharmonik perunggu (Web Audio API)
  tabuhWilahSaron(indeksWilah: number): void {
    const info = NADA_SARON_SLENDRO[indeksWilah];
    if (!info) return;

    const mesh = this.wilahMeshes[indeksWilah];
    if (mesh) {
      mesh.position.y = 0.068;
      this.animasiTabuhTargetX = mesh.position.x;
      this.animasiTabuhWaktu = performance.now();
    }

    if (typeof window === 'undefined') return;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtor();
      }
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const f0 = info.frekuensi;

      // Karakter akustik bilah perunggu saron: fundamental + overtone logam (2.76x dan 5.4x)
      const parsial = [
        { rasio: 1.0, gain: 0.24, durasi: 1.45 },
        { rasio: 2.756, gain: 0.11, durasi: 0.55 },
        { rasio: 5.404, gain: 0.045, durasi: 0.22 },
      ];

      for (const p of parsial) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = p.rasio === 1.0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f0 * p.rasio, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(p.gain, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.durasi);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + p.durasi + 0.02);
      }
    } catch {
      // Abaikan bila kebijakan autoplay memblokir audio
    }
  }

  muatBenda(benda: BendaPusaka): void {
    this.wilahMeshes = [];
    this.tabuhGroup = null;

    for (let i = this.rootGroup.children.length - 1; i >= 0; i--) {
      const child = this.rootGroup.children[i];
      if (child !== this.markerGroup) {
        this.rootGroup.remove(child);
      }
    }

    let model: THREE.Group;
    if (benda.id === 'keris') {
      model = this.bangunKerisRealistis();
    } else if (benda.id === 'saron') {
      model = this.bangunSaronRealistis();
    } else {
      model = this.bangunWayangRealistis();
    }

    model.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    this.rootGroup.add(model);
    this.targetRotY = benda.id === 'wayang' ? 0.14 : 0.26;
    this.targetRotX = benda.id === 'saron' ? 0.22 : 0.08;
    this.targetZoom = 2.65;

    if (benda.titikInfo[0]) {
      this.fokusKeTitik(benda.titikInfo[0].posisi3D, benda.titikInfo[0].kameraTarget);
    }
  }

  fokusKeTitik(posisiMarker: [number, number, number], targetKamera: [number, number, number]): void {
    this.markerGroup.position.set(posisiMarker[0], posisiMarker[1], posisiMarker[2]);
    this.targetFocus.set(targetKamera[0], targetKamera[1], targetKamera[2]);
  }

  putarManual(deltaY: number, deltaX = 0): void {
    this.targetRotY += deltaY;
    this.targetRotX = Math.max(-0.85, Math.min(0.85, this.targetRotX + deltaX));
  }

  ubahZoom(delta: number): void {
    this.targetZoom = Math.max(1.55, Math.min(4.1, this.targetZoom + delta));
  }

  resetPandangan(): void {
    this.targetRotY = 0.24;
    this.targetRotX = 0.1;
    this.targetZoom = 2.65;
    this.targetFocus.set(0, 0, 0);
  }

  terapkanInputTangan(normX: number, normY: number, zoomSkala: number): void {
    this.targetRotY = normX * 1.35;
    this.targetRotX = Math.max(-0.7, Math.min(0.7, -normY * 0.65));
    this.targetZoom = Math.max(1.65, Math.min(3.8, 3.15 - zoomSkala * 0.65));
  }

  ubahUkuran(width: number, height: number): void {
    if (!this.renderer) return;
    const w = Math.max(260, width);
    const h = Math.max(220, height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // 1. KERIS JAWA LUK 5 BERPAMOR WOS WUTAH & WARANGKA GAYAMAN YOGYAKARTA
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

    // Geometri bilah (Wilah) kontinu 64 irisan dengan tulang tengah (ada-ada) dan 5 luk
    const slices = 64;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= slices; i++) {
      const t = i / slices;
      const y = -0.18 + t * 1.08;
      // Pangkal (sor-soran) melebar asimetris, meruncing ke pucuk (panitis)
      const pangkalLebar = t < 0.14 ? (1 - t / 0.14) * 0.055 : 0;
      const halfW = Math.max(0.004, (1 - Math.pow(t, 0.86)) * 0.095 + pangkalLebar);
      const tebalTengah = Math.max(0.003, (1 - t * 0.78) * 0.022);
      const tebalTepi = 0.0018;

      // Gelombang 5 luk (5 kelokan ganjil) yang mereda di pucuk
      const lukOffset = Math.sin(t * Math.PI * 5) * 0.042 * (1 - t * 0.32) * Math.min(1, t * 5.5);
      const asimKanan = t < 0.18 ? (1 - t / 0.18) * 0.038 : 0;

      // 6 titik keliling penampang belah ketupat (diamond cross-section) per irisan
      const pts: [number, number, number, number][] = [
        [lukOffset - halfW, y, 0, 0.0], // 0: tajam kiri
        [lukOffset, y, tebalTengah, 0.5], // 1: ada-ada depan
        [lukOffset + halfW + asimKanan, y, 0, 1.0], // 2: tajam kanan
        [lukOffset, y, -tebalTengah, 0.5], // 3: ada-ada belakang
        [lukOffset - halfW * 0.45, y, tebalTepi, 0.25], // 4: kruwingan kiri depan
        [lukOffset + (halfW + asimKanan) * 0.45, y, tebalTepi, 0.75], // 5: kruwingan kanan depan
      ];

      // Gunakan 4 titik utama penampang belah ketupat agar normal tegas di ada-ada
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
    g.add(wilahMesh);

    // Kembang Kacang (gelung belalai gajah di pangkal sorsoran kanan)
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
    g.add(kembangKacang);

    // Ganja melintang asimetris (sirah cecak di kiri, buntut urang meruncing di kanan)
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
    g.add(ganjaMesh);

    // Mendak & Selut berhias mata intan/yakut melingkar di antara ganja dan hulu
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
    g.add(mendakGroup);

    // Hulu / Deder gaya Nunggak Semi Yogyakarta (melengkung menunduk berukir patra)
    const huluCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.27, 0),
      new THREE.Vector3(-0.01, -0.38, 0.01),
      new THREE.Vector3(-0.045, -0.5, 0.025),
      new THREE.Vector3(-0.11, -0.59, 0.04),
      new THREE.Vector3(-0.15, -0.62, 0.02),
    ]);
    const huluGeo = new THREE.TubeGeometry(huluCurve, 36, 0.046, 20, false);
    const huluMesh = new THREE.Mesh(huluGeo, kayuUkirMat);
    g.add(huluMesh);

    const bonggolHulu = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 24), kayuUkirMat);
    bonggolHulu.scale.set(1.15, 0.9, 0.95);
    bonggolHulu.position.set(-0.135, -0.61, 0.028);
    g.add(bonggolHulu);

    // Warangka Gayaman Yogyakarta & Gandar berbalut Pendok Blewah Emas di sisi kiri
    const warangkaGroup = new THREE.Group();
    warangkaGroup.position.set(-0.44, -0.08, -0.04);
    warangkaGroup.rotation.z = 0.08;

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

    // Gandar kayu & selubung Pendok Blewah
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

    // Celah tengah pendok blewah (menampakkan kayu kemerahan di tengah)
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

  // 2. SARON BARUNG GAMELAN DENGAN 7 WILAH GANGSA TEMPA & RANCAKAN UKIR EMAS
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

    // Rancakan berbentuk perahu trapesium khas keraton dengan sayap melengkung
    const badanRancakan = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 0.3, 0.48),
      kayuJatiMat,
    );
    badanRancakan.position.set(0, -0.16, 0);
    g.add(badanRancakan);

    // Lubang resonator (rongga gema) di bagian atas rancakan
    const ronggaAtas = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.02, 0.34),
      ronggaGelapMat,
    );
    ronggaAtas.position.set(0, -0.005, 0);
    g.add(ronggaAtas);

    // Panel ukiran lung-lungan prada emas di sisi depan & belakang rancakan
    const panelUkirDepan = new THREE.Mesh(
      new THREE.BoxGeometry(1.44, 0.2, 0.025),
      ukirPradaEmasMat,
    );
    panelUkirDepan.position.set(0, -0.15, 0.245);
    g.add(panelUkirDepan);

    const panelUkirBelakang = panelUkirDepan.clone();
    panelUkirBelakang.position.set(0, -0.15, -0.245);
    g.add(panelUkirBelakang);

    // Kaki penyangga & sayap ukir miring di ujung kiri dan kanan rancakan
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

    // Bantalan tali kasuran merah tua di sepanjang tepi rancakan
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

    // 7 Wilah Gangsa (Perunggu Tempa) berprofil cembung (uger) dari nada rendah ke tinggi
    this.wilahMeshes = [];
    for (let i = 0; i < 7; i++) {
      const x = -0.57 + i * 0.19;
      const panjangWilah = 0.48 - i * 0.022;
      const lebarWilah = 0.148 - i * 0.004;

      // Penampang melintang wilah yang menggembung di tengah (cembung akustik)
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

      // Pasak logam (paku saron) di kedua ujung tiap wilah
      for (const arahZ of [-1, 1]) {
        const paku = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.012, 0.095, 14),
          ukirPradaEmasMat,
        );
        paku.position.set(x, 0.055, arahZ * (panjangWilah * 0.36));
        g.add(paku);
      }
    }

    // Tabuh Saron (pemukul kayu bubut berbentuk palu miring)
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

  // 3. WAYANG KULIT PURWA ASLI (KOLEKSI TROPENMUSEUM) DENGAN BAYANGAN TATAHAN & CEMPURIT TANDUK
  private bangunWayangRealistis(): THREE.Group {
    const g = new THREE.Group();

    // Material kulit kerbau berukir (tatahan) & sunggingan dengan alphaTest agar lubang pahatan
    // benar-benar menembuskan cahaya blencong dan membentuk bayangan renda di layar kelir.
    const kulitWayangMat = new THREE.MeshPhysicalMaterial({
      map: this.teksturs.wayangRamaMap,
      normalMap: this.teksturs.kulitNor,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughnessMap: this.teksturs.kulitRough,
      roughness: 0.48,
      metalness: 0.18,
      clearcoat: 0.22,
      alphaTest: 0.32,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const shadowDepthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: this.teksturs.wayangRamaMap,
      alphaTest: 0.35,
    });

    const shadowDistMat = new THREE.MeshDistanceMaterial({
      map: this.teksturs.wayangRamaMap,
      alphaTest: 0.35,
    });

    // Lapisan relief kulit (3 lapis tipis untuk memberi ketebalan fisik lembaran kulit kerbau)
    for (let l = -1; l <= 1; l++) {
      const lembar = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.16), kulitWayangMat);
      lembar.position.set(0.02, 0.16, l * 0.005);
      lembar.customDepthMaterial = shadowDepthMat;
      lembar.customDistanceMaterial = shadowDistMat;
      g.add(lembar);
    }

    // Gapit / Cempurit utama dari tanduk kerbau bule (melengkung mengikuti tulang wayang)
    const tandukKerbauMat = new THREE.MeshPhysicalMaterial({
      color: '#E8DEC8',
      roughnessMap: this.teksturs.kulitRough,
      roughness: 0.32,
      metalness: 0.06,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
    });

    const gapitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.62, 0.016),
      new THREE.Vector3(-0.01, 0.25, 0.018),
      new THREE.Vector3(-0.02, -0.15, 0.018),
      new THREE.Vector3(0.01, -0.52, 0.016),
      new THREE.Vector3(0.02, -0.78, 0.012),
    ]);
    const gapitDepan = new THREE.Mesh(
      new THREE.TubeGeometry(gapitCurve, 32, 0.013, 12, false),
      tandukKerbauMat,
    );
    g.add(gapitDepan);

    const gapitBelakang = gapitDepan.clone();
    gapitBelakang.position.z = -0.032;
    g.add(gapitBelakang);

    // Hulu pegangan dalang di bagian bawah cempurit
    const huluGapit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.009, 0.38, 16),
      tandukKerbauMat,
    );
    huluGapit.position.set(0.02, -0.66, 0);
    g.add(huluGapit);

    // Dua tangkai tuding penggerak tangan kiri & kanan
    const tudingKanan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.007, 0.68, 10),
      tandukKerbauMat,
    );
    tudingKanan.position.set(0.38, -0.22, 0.022);
    tudingKanan.rotation.z = -0.36;
    g.add(tudingKanan);

    const tudingKiri = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.007, 0.62, 10),
      tandukKerbauMat,
    );
    tudingKiri.position.set(-0.36, -0.25, 0.022);
    tudingKiri.rotation.z = 0.32;
    g.add(tudingKiri);

    return g;
  }

  private mulaiLoop = (): void => {
    const step = (time: number): void => {
      this.rootGroup.rotation.y = lerp(this.rootGroup.rotation.y, this.targetRotY, 0.12);
      this.rootGroup.rotation.x = lerp(this.rootGroup.rotation.x, this.targetRotX, 0.12);
      this.camera.position.z = lerp(this.camera.position.z, this.targetZoom, 0.12);
      this.currentFocus.lerp(this.targetFocus, 0.12);
      this.camera.lookAt(this.currentFocus);
      this.markerRing.lookAt(this.camera.position);

      // Kembalikan getaran wilah saron secara halus setelah ditabuh
      for (const w of this.wilahMeshes) {
        w.position.y = lerp(w.position.y, 0.042, 0.18);
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

      if (!this.reducedMotion) {
        this.blencongLight.intensity = 11.2 + Math.sin(time * 0.0038) * 0.45;
        const s = 1 + Math.sin(time * 0.005) * 0.14;
        this.markerRing.scale.set(s, s, 1);
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
    if (this.audioCtx) {
      void this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
