import * as THREE from 'three';
import {
  createSafeWebGLRenderer,
  disposeSceneObject,
  hitungFovResponsif,
  loadBudayaTextures,
} from './threeHelpers.ts';
import {
  buildGunungan3D,
  buildKidangKencana3D,
  buildSimpinganWayang3D,
  buildSriRamaWayang3D,
  type WayangKidangRig,
  type WayangSriRamaRig,
} from './wayang3DBuilder.ts';

function buatTeksturLayarBlacu(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Pendaran hangat lampu blencong di pusat layar blacu
  const grad = ctx.createRadialGradient(512, 230, 30, 512, 256, 560);
  grad.addColorStop(0, '#fff7df');
  grad.addColorStop(0.38, '#f5e4b8');
  grad.addColorStop(0.75, '#d6b679');
  grad.addColorStop(1, '#7c582b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Serat tenun kain blacu halus
  ctx.strokeStyle = 'rgba(92, 58, 20, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  for (let x = 0; x < 1024; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Plisir tepi kain merah-emas (sligi kelir tradisional)
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(0, 0, 1024, 24);
  ctx.fillRect(0, 488, 1024, 24);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, 24, 1024, 5);
  ctx.fillRect(0, 483, 1024, 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buatTeksturGedebogPisang(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4d5e28');
  grad.addColorStop(0.35, '#657332');
  grad.addColorStop(0.75, '#464d20');
  grad.addColorStop(1, '#2b2d12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Serat memanjang pelepah batang pisang
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(30, 35, 10, 0.35)' : 'rgba(168, 185, 92, 0.2)';
    ctx.lineWidth = 1 + (i % 3);
    const y = (i * 3) % 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + Math.sin(i) * 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type MoodPanggungWayang = 'blencong' | 'kelir' | 'sorot';

export class WayangStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 45);
  private container: HTMLElement;
  private sriRama!: WayangSriRamaRig;
  private kidang!: WayangKidangRig;
  private gunungan!: THREE.Group;
  private ambientLight!: THREE.AmbientLight;
  private lampuBlencong!: THREE.SpotLight;
  private nyalaApi!: THREE.PointLight;
  private blencongGrup!: THREE.Group;
  private panahTerbang!: THREE.Group;
  private moodCahaya: MoodPanggungWayang = 'blencong';
  private baseApiIntensity = 2.8;

  private targetRamaX = 1.35;
  private targetKidangX = -1.45;
  private targetSabetan = 0;
  private panahAktif = false;
  private progresPanah = 0;
  private rafId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: false, antialias: true, shadows: true });
    if (!this.renderer) return;

    this.scene.background = new THREE.Color(0x090706);
    this.scene.fog = new THREE.FogExp2(0x090706, 0.022);
    this.camera.position.set(0, 0.35, 7.65);
    this.camera.lookAt(0, 0.28, 0);

    this.bangunPanggungKelir();
    this.ubahUkuran();
    this.loop();
  }

  private bangunPanggungKelir(): void {
    const tex = loadBudayaTextures();
    const blacuTex = buatTeksturLayarBlacu();
    const gedebogTex = buatTeksturGedebogPisang();

    const jatiUkirMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0x451e0b,
      roughness: 0.55,
    });

    const emasUkirMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.22,
    });

    // 1. Layar Kain Blacu Putih Gading Berplisir Merah-Emas
    const layarKelir = new THREE.Mesh(
      new THREE.PlaneGeometry(11.4, 5.1),
      new THREE.MeshStandardMaterial({
        map: blacuTex,
        color: 0xf7ecd0,
        roughness: 0.88,
        emissive: 0x4a3112,
        emissiveIntensity: 0.48,
      }),
    );
    layarKelir.position.set(0, 0.38, -0.78);
    layarKelir.receiveShadow = true;
    this.scene.add(layarKelir);

    // 2. Bingkai Gawangan Kelir Berukir Jati & Emas
    const tiangKiri = new THREE.Mesh(new THREE.BoxGeometry(0.38, 5.5, 0.38), jatiUkirMat);
    tiangKiri.position.set(-5.55, 0.35, -0.62);
    const tiangKanan = tiangKiri.clone();
    tiangKanan.position.x = 5.55;

    const palangAtas = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.36, 0.42), jatiUkirMat);
    palangAtas.position.set(0, 2.95, -0.58);
    const lisEmasAtas = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.08, 0.46), emasUkirMat);
    lisEmasAtas.position.set(0, 2.82, -0.56);
    this.scene.add(tiangKiri, tiangKanan, palangAtas, lisEmasAtas);

    // 3. Dua Batang Gedebog Pisang Bertingkat (Gedebog Besar & Gedebog Tanggung)
    const gedebogMat = new THREE.MeshStandardMaterial({
      map: gedebogTex,
      color: 0x6b7838,
      roughness: 0.84,
    });
    const gedebogUtama = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.27, 11.2, 20),
      gedebogMat,
    );
    gedebogUtama.rotation.z = Math.PI / 2;
    gedebogUtama.position.set(0, -1.32, 0.12);
    gedebogUtama.receiveShadow = true;

    const gedebogBelakang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.22, 11.0, 18),
      gedebogMat,
    );
    gedebogBelakang.rotation.z = Math.PI / 2;
    gedebogBelakang.position.set(0, -1.06, -0.22);
    gedebogBelakang.receiveShadow = true;
    this.scene.add(gedebogUtama, gedebogBelakang);

    // Kothak Wayang & Keprak Kuningan di Sisi Kiri Dalang
    const kothak = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.85), jatiUkirMat);
    kothak.position.set(-4.1, -1.55, 1.1);
    const keprak = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.28), emasUkirMat);
    keprak.position.set(-3.38, -1.38, 1.15);
    this.scene.add(kothak, keprak);

    // 4. Lampu Minyak Blencong Kuningan Menggantung + Kerucut Volumetrik
    this.blencongGrup = new THREE.Group();
    const rantaiBlencong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.1, 8),
      emasUkirMat,
    );
    rantaiBlencong.position.y = 0.65;
    const mangkukBlencong = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 18, 14),
      emasUkirMat,
    );
    mangkukBlencong.scale.set(1.2, 0.65, 1);
    const sayapBlencong = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.03, 10, 24),
      emasUkirMat,
    );

    const haloVolumetrik = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 3.8, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffb347,
        transparent: true,
        opacity: 0.055,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    haloVolumetrik.position.set(0, -1.2, -1.1);
    haloVolumetrik.rotation.x = -0.45;
    this.blencongGrup.add(rantaiBlencong, mangkukBlencong, sayapBlencong, haloVolumetrik);
    this.blencongGrup.position.set(0, 2.25, 2.15);
    this.scene.add(this.blencongGrup);

    // 5. Pencahayaan Dramatis Pakeliran (Bayangan Tajam ke Layar Blacu)
    this.ambientLight = new THREE.AmbientLight(0xffe8c2, 0.68);
    this.scene.add(this.ambientLight);

    this.lampuBlencong = new THREE.SpotLight(0xffb84d, 8.5, 25, Math.PI * 0.42, 0.52, 1.1);
    this.lampuBlencong.position.set(0, 1.85, 4.1);
    this.lampuBlencong.castShadow = true;
    this.lampuBlencong.shadow.mapSize.width = 1024;
    this.lampuBlencong.shadow.mapSize.height = 1024;
    this.lampuBlencong.shadow.bias = -0.0005;
    this.scene.add(this.lampuBlencong);

    this.nyalaApi = new THREE.PointLight(0xff7b29, 3.2, 14);
    this.nyalaApi.position.set(0, 1.9, 2.8);
    this.scene.add(this.nyalaApi);

    // 6. Jajaran Wayang Simpingan Kanan & Kiri (Sesuai Foto Referensi 3)
    const posisiSimpinganKiri = [-4.6, -4.15, -3.7, -3.28];
    posisiSimpinganKiri.forEach((sx, idx) => {
      const fig = buildSimpinganWayang3D(0.92 + idx * 0.06, true);
      fig.position.set(sx, -0.05 + idx * 0.04, -0.22 - (idx % 2) * 0.06);
      fig.rotation.z = -0.08;
      this.scene.add(fig);
    });

    const posisiSimpinganKanan = [3.35, 3.78, 4.22, 4.68];
    posisiSimpinganKanan.forEach((sx, idx) => {
      const fig = buildSimpinganWayang3D(0.94 + idx * 0.06, false);
      fig.position.set(sx, -0.05 + idx * 0.04, -0.22 - (idx % 2) * 0.06);
      fig.rotation.z = 0.08;
      this.scene.add(fig);
    });

    // 7. Gunungan Kayon di Tengah-Kanan & Dua Tokoh Utama (Sri Rama & Kidang Kencana)
    this.gunungan = buildGunungan3D();
    this.gunungan.scale.setScalar(1.08);
    this.gunungan.position.set(2.55, -0.02, -0.28);
    this.gunungan.rotation.y = -0.12;
    this.scene.add(this.gunungan);

    this.sriRama = buildSriRamaWayang3D();
    this.sriRama.root.scale.setScalar(1.08);
    this.sriRama.root.position.set(this.targetRamaX, 0.08, 0.12);
    this.scene.add(this.sriRama.root);

    this.kidang = buildKidangKencana3D();
    this.kidang.root.scale.setScalar(1.22);
    this.kidang.root.position.set(this.targetKidangX, 0.02, 0.08);
    this.scene.add(this.kidang.root);

    // 8. Anak Panah Guwawijaya Bercahaya
    this.panahTerbang = new THREE.Group();
    const batangPanah = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.05, 8),
      emasUkirMat,
    );
    batangPanah.rotation.z = Math.PI / 2;
    const ujungPanah = new THREE.Mesh(
      new THREE.ConeGeometry(0.048, 0.18, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a }),
    );
    ujungPanah.rotation.z = Math.PI / 2;
    ujungPanah.position.x = -0.54;
    this.panahTerbang.add(batangPanah, ujungPanah);
    this.panahTerbang.visible = false;
    this.scene.add(this.panahTerbang);
  }

  public aturPosisiTokoh(ramaNorm: number, kidangNorm: number): void {
    this.targetRamaX = THREE.MathUtils.clamp(ramaNorm, -0.85, 0.85) * 2.85;
    this.targetKidangX = THREE.MathUtils.clamp(kidangNorm, -0.85, 0.85) * 2.85;
  }

  public terapkanGesturPanggung(opts: { kemiringan?: number; intensitasSabetan?: number }): void {
    if (typeof opts.kemiringan === 'number') {
      this.sriRama.lenganKanan.rotation.z = THREE.MathUtils.clamp(-0.32 + opts.kemiringan * 0.55, -1.25, 0.65);
      this.sriRama.sikuKanan.rotation.z = THREE.MathUtils.clamp(0.58 - opts.kemiringan * 0.35, 0.1, 1.2);
    }
    if (typeof opts.intensitasSabetan === 'number' && opts.intensitasSabetan > 0.5) {
      this.picuSabetanWayang();
    }
  }

  public picuSabetanWayang(): void {
    this.targetSabetan = 1;
  }

  public picuPanahRama(): void {
    this.panahAktif = true;
    this.progresPanah = 0;
    this.panahTerbang.visible = true;
  }

  public aturMoodCahaya(mood: MoodPanggungWayang): void {
    this.moodCahaya = mood;
    if (!this.lampuBlencong || !this.ambientLight || !this.nyalaApi) return;

    if (mood === 'kelir') {
      this.ambientLight.intensity = 0.24;
      this.lampuBlencong.color.setHex(0xff9b35);
      this.lampuBlencong.intensity = 11.2;
      this.baseApiIntensity = 3.8;
    } else if (mood === 'sorot') {
      this.ambientLight.intensity = 1.38;
      this.lampuBlencong.color.setHex(0xfff4de);
      this.lampuBlencong.intensity = 7.4;
      this.baseApiIntensity = 2.0;
    } else {
      this.ambientLight.intensity = 0.68;
      this.lampuBlencong.color.setHex(0xffb84d);
      this.lampuBlencong.intensity = 8.5;
      this.baseApiIntensity = 2.8;
    }
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 640, 1);
    const h = Math.max(this.container.clientHeight || 360, 1);
    this.camera.aspect = w / h;
    this.camera.fov = hitungFovResponsif(40, this.camera.aspect, 1.45, 56);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private loop = (): void => {
    this.rafId = window.requestAnimationFrame(this.loop);
    if (!this.renderer) return;

    const t = performance.now() * 0.001;

    // Kedip api minyak kelapa Blencong & goyangan lembut lampu gantung
    const faktorKedip = this.moodCahaya === 'sorot' ? 0.35 : 1;
    this.nyalaApi.intensity =
      this.baseApiIntensity + (Math.sin(t * 7.4) * 0.42 + Math.cos(t * 12.1) * 0.22) * faktorKedip;
    this.blencongGrup.rotation.z = Math.sin(t * 1.4) * 0.025;

    // Gerak Dalang mengayunkan Sri Rama (badan, bahu, siku, tuding)
    const dxRama = this.targetRamaX - this.sriRama.root.position.x;
    this.sriRama.root.position.x += dxRama * 0.1;
    this.sriRama.root.position.y = 0.08 + Math.sin(t * 2.2) * 0.025;
    this.sriRama.root.rotation.y = THREE.MathUtils.clamp(-dxRama * 0.24, -0.32, 0.32) - 0.06;
    this.sriRama.root.rotation.z = Math.sin(t * 1.9) * 0.025 + Math.sin(this.targetSabetan * Math.PI * 2) * 0.22;

    this.sriRama.lenganKanan.rotation.z = -0.34 + Math.sin(t * 2.6) * 0.08 - this.targetSabetan * 0.48;
    this.sriRama.sikuKanan.rotation.z = 0.56 + Math.cos(t * 2.6) * 0.06 + this.targetSabetan * 0.32;
    this.sriRama.lenganKiri.rotation.z = 0.4 + Math.cos(t * 2.1) * 0.07 + this.targetSabetan * 0.35;

    // Gerak Kidang Kencana melompat anggun dengan sendi kaki berartikulasi
    const dxKidang = this.targetKidangX - this.kidang.root.position.x;
    this.kidang.root.position.x += dxKidang * 0.1;
    const lompat = Math.abs(Math.sin(t * 3.2));
    this.kidang.root.position.y = 0.02 + lompat * 0.16;
    this.kidang.root.rotation.y = dxKidang > 0.05 ? 0.08 : 0.04;
    this.kidang.leherKepala.rotation.z = Math.sin(t * 3.4) * 0.09;
    this.kidang.kakiDepan.rotation.z = Math.sin(t * 3.2) * 0.34;
    this.kidang.kakiBelakang.rotation.z = -Math.sin(t * 3.2) * 0.34;

    // Gunungan Kayon berayun khidmat
    this.gunungan.rotation.z = Math.sin(t * 1.1) * 0.02;

    this.targetSabetan *= 0.91;

    // Lesatan Panah Guwawijaya
    if (this.panahAktif) {
      this.progresPanah += 0.042;
      const dariX = this.sriRama.root.position.x - 0.52;
      const keX = this.kidang.root.position.x + 0.15;
      this.panahTerbang.position.set(
        THREE.MathUtils.lerp(dariX, keX, this.progresPanah),
        0.38 + Math.sin(this.progresPanah * Math.PI) * 0.36,
        0.22,
      );
      this.panahTerbang.rotation.z = (0.5 - this.progresPanah) * 0.32;
      if (this.progresPanah >= 1) {
        this.panahAktif = false;
        this.panahTerbang.visible = false;
        this.kidang.root.rotation.z = -0.38;
      }
    } else {
      this.kidang.root.rotation.z *= 0.9;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
