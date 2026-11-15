import * as THREE from 'three';
import { KRONIK_SEJARAH_BUDAYA, type BendaPusaka } from '../content/pusaka.ts';
import {
  applyStudioHDR,
  attachCadWireframeLayer,
  createSafeWebGLRenderer,
  disposeSceneObject,
  loadBudayaTextures,
} from './threeHelpers.ts';

export interface ProyeksiPinDiorama {
  bendaId: BendaPusaka['id'];
  x: number;
  y: number;
  terlihat: boolean;
}

interface DataBangunan {
  bendaId: BendaPusaka['id'];
  grup: THREE.Group;
  titikPinWorld: THREE.Vector3;
  emissiveMeshes: THREE.MeshStandardMaterial[];
}

function buatTeksturGentengTerakota(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bctx = bumpCanvas.getContext('2d');
  if (!ctx || !bctx) return { diffuse: null, bump: null };

  ctx.fillStyle = '#7c2d12';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);

  // Baris susunan genteng kodok tanah liat tradisional Jawa
  const rowH = 32;
  const colW = 32;
  for (let y = 0; y < 512; y += rowH) {
    const grad = ctx.createLinearGradient(0, y, 0, y + rowH);
    grad.addColorStop(0, '#a64322');
    grad.addColorStop(0.7, '#7e2f16');
    grad.addColorStop(1, '#3f1508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 512, rowH);

    for (let x = 0; x < 512; x += colW) {
      const offset = (y / rowH) % 2 === 0 ? 0 : colW / 2;
      ctx.strokeStyle = 'rgba(35, 10, 4, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + offset, y + rowH - 4, colW * 0.48, Math.PI, 0, false);
      ctx.stroke();

      bctx.fillStyle = '#dcdcdc';
      bctx.fillRect(x + offset, y + 4, colW - 4, rowH - 8);
      bctx.fillStyle = '#262626';
      bctx.fillRect(x + offset, y + rowH - 4, colW, 4);
    }
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(3, 3);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);

  return { diffuse, bump };
}

function buatTeksturLantaiAndesit(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#333742';
  ctx.fillRect(0, 0, 512, 512);

  const tile = 64;
  for (let y = 0; y < 512; y += tile) {
    for (let x = 0; x < 512; x += tile) {
      const shade = 48 + ((x * 7 + y * 13) % 18);
      ctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 10})`;
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Membangun geometri atap trapesium (limasan/joglo brunjung & penanggap)
 * dengan molo memanjang autentik Jawa (bukan kerucut piramida biasa).
 */
function buatGeometriAtapTrapesium(
  wBawah: number,
  dBawah: number,
  wAtas: number,
  dAtas: number,
  tinggi: number,
): THREE.BufferGeometry {
  const hw0 = wBawah / 2;
  const hd0 = dBawah / 2;
  const hw1 = wAtas / 2;
  const hd1 = dAtas / 2;
  const hy = tinggi / 2;

  // 8 titik sudut frustum trapesium
  const p = [
    [-hw0, -hy, hd0],  // 0: depan-kiri-bawah
    [hw0, -hy, hd0],   // 1: depan-kanan-bawah
    [hw0, -hy, -hd0],  // 2: belakang-kanan-bawah
    [-hw0, -hy, -hd0], // 3: belakang-kiri-bawah
    [-hw1, hy, hd1],   // 4: depan-kiri-atas
    [hw1, hy, hd1],    // 5: depan-kanan-atas
    [hw1, hy, -hd1],   // 6: belakang-kanan-atas
    [-hw1, hy, -hd1],  // 7: belakang-kiri-atas
  ];

  const quads = [
    [0, 1, 5, 4], // lereng depan
    [1, 2, 6, 5], // lereng kanan (kejen)
    [2, 3, 7, 6], // lereng belakang
    [3, 0, 4, 7], // lereng kiri (kejen)
    [4, 5, 6, 7], // tutup bubungan atas
    [3, 2, 1, 0], // tutup plafon bawah
  ];

  const positions: number[] = [];
  const uvs: number[] = [];

  for (const [a, b, c, d] of quads) {
    positions.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

export class LivingPendopoStage {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 85);
  private container: HTMLElement;
  private islandRoot = new THREE.Group();
  private cadLineMat: THREE.LineBasicMaterial | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private sunLight: THREE.DirectionalLight | null = null;

  private bangunanMap = new Map<BendaPusaka['id'], DataBangunan>();
  private hoveredId: BendaPusaka['id'] | null = null;
  private selectedId: BendaPusaka['id'] | null = null;

  // Objek animasi hidup di kompleks suaka budaya
  private kerisHoloMesh: THREE.Group | null = null;
  private ububanKiri: THREE.Mesh | null = null;
  private ububanKanan: THREE.Mesh | null = null;
  private gongAgengMesh: THREE.Group | null = null;
  private batikClothMeshes: Array<{ mesh: THREE.Mesh; basePos: Float32Array; phase: number }> = [];
  private lampApiKelir: THREE.PointLight | null = null;
  private lampPrapen: THREE.PointLight | null = null;
  private waterMesh: THREE.Mesh | null = null;
  private particlePoints: THREE.Points | null = null;

  private curCamPos = new THREE.Vector3(9.2, 6.85, 12.65);
  private targetCamPos = new THREE.Vector3(9.2, 6.85, 12.65);
  private curLookAt = new THREE.Vector3(-2.35, 0.72, 0.35);
  private targetLookAt = new THREE.Vector3(-2.35, 0.72, 0.35);

  private pointerNormX = 0;
  private pointerNormY = 0;
  private targetWireframe = 0.08;
  private currentWireframe = 0.08;
  private onPinCb: ((pins: ProyeksiPinDiorama[]) => void) | null = null;
  private rafId: number | null = null;

  private heroCamPos = new THREE.Vector3(9.2, 6.85, 12.65);
  private heroLookAt = new THREE.Vector3(-2.35, 0.72, 0.35);

  constructor(container: HTMLElement, initialTheme: 'malam' | 'terang' = 'malam') {
    this.container = container;
    this.renderer = createSafeWebGLRenderer(container, { alpha: true, antialias: true, shadows: true });
    if (!this.renderer) return;

    void applyStudioHDR(this.renderer, this.scene);

    this.setupLighting();
    this.bangunPulauDiorama();
    this.cadLineMat = attachCadWireframeLayer(this.islandRoot, 0xe85d2a, this.currentWireframe);
    this.setTheme(initialTheme);

    this.camera.position.copy(this.curCamPos);
    this.camera.lookAt(this.curLookAt);
    this.ubahUkuran();
    this.loop();
  }

  public setTheme(tema: 'malam' | 'terang'): void {
    if (tema === 'terang') {
      this.scene.fog = new THREE.FogExp2(0xf6f4ef, 0.0085);
      if (this.hemiLight) this.hemiLight.intensity = 1.28;
      if (this.sunLight) this.sunLight.intensity = 2.75;
    } else {
      this.scene.fog = new THREE.FogExp2(0x0a0b0e, 0.017);
      if (this.hemiLight) this.hemiLight.intensity = 0.92;
      if (this.sunLight) this.sunLight.intensity = 2.45;
    }
  }

  private setupLighting(): void {
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x2b1d12, 0.92);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffe9c7, 2.45);
    this.sunLight.position.set(11, 15, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 38;
    this.sunLight.shadow.camera.left = -9;
    this.sunLight.shadow.camera.right = 9;
    this.sunLight.shadow.camera.top = 9;
    this.sunLight.shadow.camera.bottom = -9;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    const rimEmber = new THREE.PointLight(0xff5a1f, 3.6, 16);
    rimEmber.position.set(-5.8, 4.4, -4.6);
    this.scene.add(rimEmber);

    const lampJoglo = new THREE.PointLight(0xffbf5e, 3.8, 10);
    lampJoglo.position.set(0, 2.15, 0);
    this.islandRoot.add(lampJoglo);

    this.lampPrapen = new THREE.PointLight(0xff4d14, 3.4, 7.5);
    this.lampPrapen.position.set(-2.5, 0.95, -1.7);
    this.islandRoot.add(this.lampPrapen);

    this.lampApiKelir = new THREE.PointLight(0xffa742, 3.2, 8.5);
    this.lampApiKelir.position.set(2.4, 1.45, 2.3);
    this.islandRoot.add(this.lampApiKelir);
  }

  private bangunPulauDiorama(): void {
    const tex = loadBudayaTextures();
    const gentengTex = buatTeksturGentengTerakota();
    const andesitTex = buatTeksturLantaiAndesit();

    const kayuMat = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      roughnessMap: tex.kayuRough,
      color: 0x6f4020,
      roughness: 0.64,
    });

    const atapTerakotaMat = new THREE.MeshStandardMaterial({
      map: gentengTex.diffuse,
      bumpMap: gentengTex.bump,
      bumpScale: 0.03,
      color: 0x9c3d20,
      roughness: 0.58,
      metalness: 0.08,
    });

    const batuAndesitMat = new THREE.MeshStandardMaterial({
      map: andesitTex,
      color: 0x454954,
      roughness: 0.78,
    });

    const bataMajapahitMat = new THREE.MeshStandardMaterial({
      color: 0x8c341d,
      roughness: 0.72,
    });

    const emasOrnamenMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.2,
    });

    // =========================================================================
    // 0. LAPISAN GEOLOGI PULAU POTONGAN MELINTANG & TALUD BATU CANDI
    // =========================================================================
    const lapisBasalt = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 0.56, 10.0),
      new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.9 }),
    );
    lapisBasalt.position.y = -0.82;
    this.islandRoot.add(lapisBasalt);

    const lapisSubsoil = new THREE.Mesh(
      new THREE.BoxGeometry(10.1, 0.46, 10.1),
      new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.9 }),
    );
    lapisSubsoil.position.y = -0.35;
    this.islandRoot.add(lapisSubsoil);

    const rumputTaman = new THREE.Mesh(
      new THREE.BoxGeometry(10.3, 0.24, 10.3),
      new THREE.MeshStandardMaterial({ color: 0x244226, roughness: 0.86 }),
    );
    rumputTaman.position.y = 0;
    rumputTaman.receiveShadow = true;
    this.islandRoot.add(rumputTaman);

    // Bingkai Talud Batu & Pilar Sudut Pulau + Pelipit Tepi Maket
    for (const sx of [-5.08, 5.08]) {
      for (const sz of [-5.08, 5.08]) {
        const pilarSudut = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.28, 0.36), batuAndesitMat);
        pilarSudut.position.set(sx, -0.38, sz);
        this.islandRoot.add(pilarSudut);
      }
    }
    const tepiUtara = new THREE.Mesh(new THREE.BoxGeometry(10.35, 0.14, 0.16), batuAndesitMat);
    tepiUtara.position.set(0, 0.15, -5.08);
    const tepiSelatan = tepiUtara.clone();
    tepiSelatan.position.z = 5.08;
    const tepiBarat = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 10.35), batuAndesitMat);
    tepiBarat.position.set(-5.08, 0.15, 0);
    const tepiTimur = tepiBarat.clone();
    tepiTimur.position.x = 5.08;
    this.islandRoot.add(tepiUtara, tepiSelatan, tepiBarat, tepiTimur);

    // Pelataran Batu Andesit Tengah + Jalan Setapak Salib Kosmologi
    const pelataranTengah = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 3.8), batuAndesitMat);
    pelataranTengah.position.set(0, 0.14, 0);
    pelataranTengah.receiveShadow = true;
    this.islandRoot.add(pelataranTengah);

    const jalanBaratTimur = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.08, 0.86), batuAndesitMat);
    jalanBaratTimur.position.set(0, 0.12, 0.2);
    jalanBaratTimur.receiveShadow = true;
    const jalanUtaraSelatan = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 9.2), batuAndesitMat);
    jalanUtaraSelatan.position.set(0, 0.12, 0);
    jalanUtaraSelatan.receiveShadow = true;
    this.islandRoot.add(jalanBaratTimur, jalanUtaraSelatan);

    // Gapura Candi Bentar Majapahit di Pintu Masuk Selatan & Utara
    const buatCandiBentar = (zPos: number): THREE.Group => {
      const gapura = new THREE.Group();
      for (const side of [-1, 1]) {
        const x = side * 0.68;
        for (let step = 0; step < 5; step++) {
          const w = 0.34 - step * 0.04;
          const d = 0.38 - step * 0.04;
          const blok = new THREE.Mesh(new THREE.BoxGeometry(w, 0.24, d), bataMajapahitMat);
          blok.position.set(x + side * step * 0.015, 0.24 + step * 0.22, 0);
          blok.castShadow = true;
          gapura.add(blok);
        }
      }
      gapura.position.set(0, 0.08, zPos);
      return gapura;
    };
    this.islandRoot.add(buatCandiBentar(4.45), buatCandiBentar(-4.45));

    // Lentera Batu Taman Keraton di sepanjang jalan setapak
    const posisiLentera: Array<[number, number]> = [
      [-1.7, 0.72],
      [1.7, 0.72],
      [-0.65, 2.2],
      [0.65, 2.2],
    ];
    for (const [lx, lz] of posisiLentera) {
      const lentera = new THREE.Group();
      const kaki = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.36, 8), batuAndesitMat);
      kaki.position.y = 0.18;
      const lampu = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.12, 0.11),
        new THREE.MeshBasicMaterial({ color: 0xffcf70 }),
      );
      lampu.position.y = 0.4;
      const topi = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.12, 4), batuAndesitMat);
      topi.rotation.y = Math.PI / 4;
      topi.position.y = 0.52;
      lentera.add(kaki, lampu, topi);
      lentera.position.set(lx, 0.12, lz);
      this.islandRoot.add(lentera);
    }

    // Kanal Air Segaran + Jembatan Kayu Lengkung + Daun Teratai
    this.waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 0.22, 3.9),
      new THREE.MeshPhysicalMaterial({
        color: 0x155e75,
        roughness: 0.1,
        metalness: 0.2,
        clearcoat: 1,
        transparent: true,
        opacity: 0.88,
      }),
    );
    this.waterMesh.position.set(3.25, 0.06, -2.85);
    this.islandRoot.add(this.waterMesh);

    const jembatan = new THREE.Group();
    const papanJembatan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.62, 16, 1, false, -0.65, 1.3),
      kayuMat,
    );
    papanJembatan.rotation.z = Math.PI / 2;
    papanJembatan.rotation.y = Math.PI / 2;
    papanJembatan.position.set(2.1, -0.45, -2.85);
    jembatan.add(papanJembatan);

    // Teratai mekar di atas permukaan kolam segaran
    const lotusPadMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3c, roughness: 0.72 });
    const lotusFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf4a29e, roughness: 0.5 });
    for (const [tx, tz] of [
      [3.55, -2.2],
      [2.85, -3.55],
      [3.95, -3.8],
    ]) {
      const daun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 12), lotusPadMat);
      daun.position.set(tx, 0.19, tz);
      const kuntum = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lotusFlowerMat);
      kuntum.position.set(tx + 0.02, 0.22, tz);
      jembatan.add(daun, kuntum);
    }
    this.islandRoot.add(jembatan);

    // Pohon Beringin Agung (Ringin Kurung) & Ketapang Multi-Kanopi
    const posisiPohon: Array<[number, number, number, number]> = [
      [-4.15, 0.12, -3.95, 1.25],
      [-3.95, 0.12, 0.35, 0.95],
      [-4.1, 0.12, 3.95, 1.18],
      [4.15, 0.12, 3.85, 1.08],
      [1.15, 0.12, -4.05, 0.95],
      [4.3, 0.12, 0.35, 0.9],
    ];
    posisiPohon.forEach(([x, y, z, sk], i) => {
      const pohon = new THREE.Group();
      const batang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08 * sk, 0.16 * sk, 1.08 * sk, 10),
        kayuMat,
      );
      batang.position.y = 0.54 * sk;
      batang.castShadow = true;
      pohon.add(batang);

      // Pagar batu andesit Ringin Kurung untuk dua beringin utama
      if (i === 0 || i === 3) {
        const ringinKurung = new THREE.Mesh(
          new THREE.BoxGeometry(0.95 * sk, 0.16, 0.95 * sk),
          batuAndesitMat,
        );
        ringinKurung.position.y = 0.08;
        ringinKurung.receiveShadow = true;
        pohon.add(ringinKurung);
      }

      // Sulur akar gantung & dahan cabang pohon beringin
      for (const dAngle of [0, 2.1, 4.2]) {
        const dahan = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028 * sk, 0.048 * sk, 0.58 * sk, 8),
          kayuMat,
        );
        dahan.position.set(Math.cos(dAngle) * 0.18 * sk, 0.84 * sk, Math.sin(dAngle) * 0.18 * sk);
        dahan.rotation.z = Math.cos(dAngle) * 0.52;
        dahan.rotation.x = Math.sin(dAngle) * 0.52;
        pohon.add(dahan);

        const sulur = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012 * sk, 0.01 * sk, 0.62 * sk, 6),
          kayuMat,
        );
        sulur.position.set(Math.cos(dAngle) * 0.32 * sk, 0.52 * sk, Math.sin(dAngle) * 0.32 * sk);
        pohon.add(sulur);
      }

      const warnaUtama = i % 2 === 0 ? 0x254d2b : 0x2f5a34;
      const warnaMuda = i % 2 === 0 ? 0x3b6e3f : 0x487846;
      const matUtama = new THREE.MeshStandardMaterial({ color: warnaUtama, roughness: 0.84 });
      const matMuda = new THREE.MeshStandardMaterial({ color: warnaMuda, roughness: 0.82 });

      const gugusKanopi: Array<[number, number, number, number, THREE.Material]> = [
        [0, 1.16 * sk, 0, 0.44 * sk, matUtama],
        [-0.31 * sk, 1.02 * sk, 0.19 * sk, 0.34 * sk, matMuda],
        [0.3 * sk, 1.04 * sk, -0.17 * sk, 0.35 * sk, matMuda],
        [-0.14 * sk, 1.06 * sk, -0.28 * sk, 0.32 * sk, matUtama],
        [0.2 * sk, 1.0 * sk, 0.25 * sk, 0.31 * sk, matMuda],
        [0.06 * sk, 1.38 * sk, 0.06 * sk, 0.31 * sk, matMuda],
      ];
      for (const [cx, cy, cz, cr, cmat] of gugusKanopi) {
        const tajuk = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), cmat);
        tajuk.scale.set(1.18, 0.72, 1.18);
        tajuk.rotation.y = cx * 1.4 + cz;
        tajuk.position.set(cx, cy, cz);
        tajuk.castShadow = true;
        pohon.add(tajuk);
      }

      pohon.position.set(x, y, z);
      this.islandRoot.add(pohon);
    });

    // =========================================================================
    // 1. PENDOPO JOGLO AGUNG (Pusat Kosmologi — Atap Brunjung & Penanggap Asli)
    // =========================================================================
    const grupJoglo = new THREE.Group();
    const glowJoglo = new THREE.MeshStandardMaterial({
      map: tex.kayuDiffuse,
      normalMap: tex.kayuNormal,
      color: 0xa15826,
      emissive: 0x000000,
      roughness: 0.5,
      metalness: 0.22,
    });

    // Bebatur Lantai Berundak 2 Tingkat
    const bebaturBawah = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.18, 2.95), batuAndesitMat);
    bebaturBawah.position.y = 0.16;
    bebaturBawah.receiveShadow = true;
    const bebaturAtas = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 2.6), batuAndesitMat);
    bebaturAtas.position.y = 0.32;
    bebaturAtas.castShadow = true;
    bebaturAtas.receiveShadow = true;
    grupJoglo.add(bebaturBawah, bebaturAtas);

    // 4 Saka Guru Utama di Tengah (dengan Umpak Batu Berukir & Sabuk Emas)
    for (const px of [-0.62, 0.62]) {
      for (const pz of [-0.54, 0.54]) {
        const umpak = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.16, 0.18, 8),
          batuAndesitMat,
        );
        umpak.position.set(px, 0.48, pz);
        const tiang = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.48, 0.14), glowJoglo);
        tiang.position.set(px, 1.28, pz);
        tiang.castShadow = true;
        const cincinEmas = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), emasOrnamenMat);
        cincinEmas.position.set(px, 0.68, pz);
        grupJoglo.add(umpak, tiang, cincinEmas);
      }
    }

    // 12 Saka Pengarak di Keliling Luar Pendopo
    const koordinatPengarak: Array<[number, number]> = [
      [-1.22, -1.08],
      [-0.62, -1.08],
      [0.62, -1.08],
      [1.22, -1.08],
      [-1.22, 1.08],
      [-0.62, 1.08],
      [0.62, 1.08],
      [1.22, 1.08],
      [-1.22, -0.45],
      [-1.22, 0.45],
      [1.22, -0.45],
      [1.22, 0.45],
    ];
    for (const [ox, oz] of koordinatPengarak) {
      const umpakLuar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), batuAndesitMat);
      umpakLuar.position.set(ox, 0.45, oz);
      const tiangLuar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.08, 0.09), glowJoglo);
      tiangLuar.position.set(ox, 1.02, oz);
      tiangLuar.castShadow = true;
      grupJoglo.add(umpakLuar, tiangLuar);
    }

    // Tumpang Sari Bertingkat 4 & Lampu Robyong Gantung di Plafon
    for (let t = 0; t < 4; t++) {
      const wSpan = 1.38 - t * 0.22;
      const dSpan = 1.22 - t * 0.18;
      const balok = new THREE.Mesh(new THREE.BoxGeometry(wSpan, 0.08, dSpan), glowJoglo);
      balok.position.y = 1.98 + t * 0.09;
      grupJoglo.add(balok);
    }
    const lampuRobyong = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), emasOrnamenMat);
    lampuRobyong.position.set(0, 1.82, 0);
    grupJoglo.add(lampuRobyong);

    // Atap Bawah Penanggap (Trapesium Lebar Landai)
    const atapPenanggap = new THREE.Mesh(
      buatGeometriAtapTrapesium(3.25, 2.95, 1.65, 1.38, 0.56),
      atapTerakotaMat,
    );
    atapPenanggap.position.y = 1.82;
    atapPenanggap.castShadow = true;
    atapPenanggap.receiveShadow = true;

    // Atap Atas Brunjung (Trapesium Curam Khas Joglo dengan Molo Memanjang)
    const atapBrunjung = new THREE.Mesh(
      buatGeometriAtapTrapesium(1.72, 1.44, 0.72, 0.18, 1.05),
      atapTerakotaMat,
    );
    atapBrunjung.position.y = 2.58;
    atapBrunjung.castShadow = true;
    atapBrunjung.receiveShadow = true;

    // Balok Wuwungan Puncak & Mahkota Kemuncak Emas Kiri-Kanan
    const wuwungan = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.1, 0.14), emasOrnamenMat);
    wuwungan.position.y = 3.14;
    const makuthaKiri = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 8), emasOrnamenMat);
    makuthaKiri.position.set(-0.42, 3.28, 0);
    const makuthaKanan = makuthaKiri.clone();
    makuthaKanan.position.x = 0.42;
    const makuthaTengah = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 8), emasOrnamenMat);
    makuthaTengah.position.set(0, 3.31, 0);

    grupJoglo.add(atapPenanggap, atapBrunjung, wuwungan, makuthaKiri, makuthaKanan, makuthaTengah);
    grupJoglo.position.set(0, 0.08, 0);
    this.islandRoot.add(grupJoglo);
    this.bangunanMap.set('joglo', {
      bendaId: 'joglo',
      grup: grupJoglo,
      titikPinWorld: new THREE.Vector3(0.05, 3.85, 0),
      emissiveMeshes: [glowJoglo, atapTerakotaMat],
    });

    // =========================================================================
    // 2. BESALEN EMPU KERIS (Barat Laut — Prapen, Ububan Kembar, Paron & Keris)
    // =========================================================================
    const grupKeris = new THREE.Group();
    const glowKeris = new THREE.MeshStandardMaterial({
      color: 0xff5a1f,
      emissive: 0xd93800,
      emissiveIntensity: 0.78,
      roughness: 0.32,
    });
    const besiTempaMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.92,
      roughness: 0.18,
    });

    const lantaiBesalen = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 2.05), batuAndesitMat);
    lantaiBesalen.position.y = 0.18;
    lantaiBesalen.castShadow = true;
    lantaiBesalen.receiveShadow = true;
    grupKeris.add(lantaiBesalen);

    // 4 Tiang Bale Besalen + Atap Limasan Terbuka Kecil
    for (const bx of [-0.96, 0.96]) {
      for (const bz of [-0.82, 0.82]) {
        const tiangB = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.35, 8), kayuMat);
        tiangB.position.set(bx, 0.86, bz);
        grupKeris.add(tiangB);
      }
    }
    const atapBesalen = new THREE.Mesh(
      buatGeometriAtapTrapesium(2.35, 2.05, 0.8, 0.25, 0.52),
      atapTerakotaMat,
    );
    atapBesalen.position.y = 1.72;
    atapBesalen.castShadow = true;
    grupKeris.add(atapBesalen);

    // Tungku Prapen Bata Merah + Bara Api Menyala
    const prapen = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.48, 0.74), bataMajapahitMat);
    prapen.position.set(-0.22, 0.52, -0.12);
    const kawahBara = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.14, 14), glowKeris);
    kawahBara.position.set(-0.22, 0.78, -0.12);
    grupKeris.add(prapen, kawahBara);

    // Sepasang Tabung Pompa Angin Bambu (Ububan Kembar)
    const bambuUbubanMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.55 });
    const tabungKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.88, 14), bambuUbubanMat);
    tabungKiri.position.set(-0.74, 0.72, -0.45);
    const tabungKanan = tabungKiri.clone();
    tabungKanan.position.x = -0.36;

    this.ububanKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), kayuMat);
    this.ububanKiri.position.set(-0.74, 1.25, -0.45);
    this.ububanKanan = this.ububanKiri.clone();
    this.ububanKanan.position.x = -0.36;
    grupKeris.add(tabungKiri, tabungKanan, this.ububanKiri, this.ububanKanan);

    // Landasan Tempa Besi (Paron) & Palungan Air Pendingin
    const paron = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.38, 12), besiTempaMat);
    paron.position.set(0.45, 0.46, 0.18);
    const palunganAir = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.24, 0.32), kayuMat);
    palunganAir.position.set(0.45, 0.38, -0.42);
    grupKeris.add(paron, palunganAir);

    // Keris Luk 5 Melayang Berpendar di Atas Paron
    this.kerisHoloMesh = new THREE.Group();
    const lukPoints = [
      new THREE.Vector3(0, -0.32, 0),
      new THREE.Vector3(0.05, -0.1, 0),
      new THREE.Vector3(-0.05, 0.12, 0),
      new THREE.Vector3(0.05, 0.34, 0),
      new THREE.Vector3(-0.04, 0.56, 0),
      new THREE.Vector3(0, 0.82, 0),
    ];
    const bilahLuk = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lukPoints), 36, 0.045, 8, false),
      besiTempaMat,
    );
    bilahLuk.scale.z = 0.28;
    const ganjaMini = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.09), glowKeris);
    ganjaMini.position.y = -0.34;
    const huluMini = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 10), emasOrnamenMat);
    huluMini.position.y = -0.5;
    this.kerisHoloMesh.add(bilahLuk, ganjaMini, huluMini);
    this.kerisHoloMesh.position.set(0.45, 1.28, 0.18);
    grupKeris.add(this.kerisHoloMesh);

    grupKeris.position.set(-2.55, 0.1, -1.75);
    this.islandRoot.add(grupKeris);
    this.bangunanMap.set('keris', {
      bendaId: 'keris',
      grup: grupKeris,
      titikPinWorld: new THREE.Vector3(-3.3, 2.28, -1.45),
      emissiveMeshes: [glowKeris],
    });

    // =========================================================================
    // 3. BALE KARAWITAN GAMELAN (Timur Laut — Gayor Gong, Saron, Bonang, Kendang)
    // =========================================================================
    const grupSaron = new THREE.Group();
    const glowSaron = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0x713f12,
      emissiveIntensity: 0.34,
      metalness: 0.88,
      roughness: 0.2,
    });
    const merahGayorMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.45,
      metalness: 0.25,
    });

    const panggungSaron = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.24, 1.95), kayuMat);
    panggungSaron.position.y = 0.22;
    panggungSaron.castShadow = true;
    panggungSaron.receiveShadow = true;
    grupSaron.add(panggungSaron);

    // Rancakan Saron Barung & Saron Penerus (7 Bilah Gangsa Berkilau)
    for (const zSaron of [0.28, -0.18]) {
      const rancakan = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.28, 0.38), merahGayorMat);
      rancakan.position.set(-0.2, 0.48, zSaron);
      grupSaron.add(rancakan);
      for (let i = 0; i < 7; i++) {
        const bilah = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.045, 0.34 - i * 0.015),
          glowSaron,
        );
        bilah.position.set(-0.74 + i * 0.18, 0.65, zSaron);
        bilah.castShadow = true;
        grupSaron.add(bilah);
      }
    }

    // Gayor Berukir Naga & Gong Ageng + Kempul Menggantung
    const gayorTiangKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.48, 10), merahGayorMat);
    gayorTiangKiri.position.set(-0.62, 1.05, -0.68);
    const gayorTiangKanan = gayorTiangKiri.clone();
    gayorTiangKanan.position.x = 0.62;
    const gayorPalang = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.16), emasOrnamenMat);
    gayorPalang.position.set(0, 1.76, -0.68);
    grupSaron.add(gayorTiangKiri, gayorTiangKanan, gayorPalang);

    this.gongAgengMesh = new THREE.Group();
    const piringanGong = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.11, 28), glowSaron);
    piringanGong.rotation.x = Math.PI / 2;
    const pencuGong = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glowSaron);
    pencuGong.position.z = 0.06;
    this.gongAgengMesh.add(piringanGong, pencuGong);
    this.gongAgengMesh.position.set(-0.18, 1.18, -0.68);

    const kempul = this.gongAgengMesh.clone();
    kempul.scale.setScalar(0.68);
    kempul.position.set(0.36, 1.24, -0.68);
    grupSaron.add(this.gongAgengMesh, kempul);

    // Kendang Ageng di Sisi Kanan
    const kendang = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.64, 16), merahGayorMat);
    kendang.rotation.z = Math.PI / 2.1;
    kendang.position.set(0.75, 0.56, 0.25);
    grupSaron.add(kendang);

    grupSaron.position.set(2.38, 0.1, -1.35);
    this.islandRoot.add(grupSaron);
    this.bangunanMap.set('saron', {
      bendaId: 'saron',
      grup: grupSaron,
      titikPinWorld: new THREE.Vector3(2.38, 2.12, -1.35),
      emissiveMeshes: [glowSaron],
    });

    // =========================================================================
    // 4. GAZEBO WASTRA BATIK KAWUNG (Barat Daya — 3 Gawangan Kain + Anglo Malam)
    // =========================================================================
    const grupBatik = new THREE.Group();
    const panggungBatik = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 2.2), batuAndesitMat);
    panggungBatik.position.y = 0.2;
    panggungBatik.receiveShadow = true;
    grupBatik.add(panggungBatik);

    // Tekstur batik Kawung prosedural untuk layar kain gazebo
    const batikCanvas = document.createElement('canvas');
    batikCanvas.width = 256;
    batikCanvas.height = 256;
    const bctx = batikCanvas.getContext('2d');
    if (bctx) {
      bctx.fillStyle = '#efe3cc';
      bctx.fillRect(0, 0, 256, 256);
      bctx.strokeStyle = '#6f3a18';
      bctx.fillStyle = '#a45724';
      bctx.lineWidth = 2.5;
      for (let gx = 32; gx < 256; gx += 64) {
        for (let gy = 32; gy < 256; gy += 64) {
          for (const ang of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
            bctx.save();
            bctx.translate(gx + Math.cos(ang) * 14, gy + Math.sin(ang) * 14);
            bctx.rotate(ang);
            bctx.beginPath();
            bctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
            bctx.fill();
            bctx.stroke();
            bctx.restore();
          }
          bctx.fillStyle = '#3b2416';
          bctx.beginPath();
          bctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
          bctx.fill();
          bctx.fillStyle = '#a45724';
        }
      }
      bctx.fillStyle = '#5c2810';
      bctx.fillRect(0, 0, 256, 12);
      bctx.fillRect(0, 244, 256, 12);
    }
    const texBatikKawung = new THREE.CanvasTexture(batikCanvas);
    texBatikKawung.colorSpace = THREE.SRGBColorSpace;

    const glowBatik = new THREE.MeshStandardMaterial({
      map: texBatikKawung,
      side: THREE.DoubleSide,
      roughness: 0.76,
    });
    const batikParangMat = new THREE.MeshStandardMaterial({
      map: texBatikKawung,
      color: 0xe6c79c,
      side: THREE.DoubleSide,
      roughness: 0.78,
    });

    this.batikClothMeshes = [];
    const posisiGawangan = [
      { z: 0.35, w: 1.45, h: 1.15, mat: glowBatik, phase: 0 },
      { z: -0.25, w: 1.32, h: 1.05, mat: batikParangMat, phase: 1.6 },
    ];

    for (const g of posisiGawangan) {
      const tiangKiri = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.56, 8), kayuMat);
      tiangKiri.position.set(-0.82, 0.96, g.z);
      const tiangKanan = tiangKiri.clone();
      tiangKanan.position.x = 0.82;
      const palang = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.88, 8), kayuMat);
      palang.rotation.z = Math.PI / 2;
      palang.position.set(0, 1.66, g.z);

      const clothGeo = new THREE.PlaneGeometry(g.w, g.h, 14, 12);
      const clothMesh = new THREE.Mesh(clothGeo, g.mat);
      clothMesh.position.set(0, 1.08, g.z + 0.04);
      clothMesh.castShadow = true;
      this.batikClothMeshes.push({
        mesh: clothMesh,
        basePos: new Float32Array(clothGeo.attributes.position.array),
        phase: g.phase,
      });

      grupBatik.add(tiangKiri, tiangKanan, palang, clothMesh);
    }

    // Tungku Anglo & Wajan Malam Cair di Sudut Depan
    const anglo = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.26, 12), bataMajapahitMat);
    anglo.position.set(0.76, 0.42, 0.72);
    const wajan = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), emasOrnamenMat);
    wajan.position.set(0.76, 0.62, 0.72);
    grupBatik.add(anglo, wajan);

    grupBatik.position.set(-2.38, 0.1, 2.38);
    this.islandRoot.add(grupBatik);
    this.bangunanMap.set('batik', {
      bendaId: 'batik',
      grup: grupBatik,
      titikPinWorld: new THREE.Vector3(-2.15, 2.22, 2.55),
      emissiveMeshes: [glowBatik],
    });

    // =========================================================================
    // 5. PANGGUNG KELIR WAYANG (Tenggara — Layar Blacu, Simpingan & Gunungan)
    // =========================================================================
    const grupWayang = new THREE.Group();
    const dekWayang = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.24, 1.85), kayuMat);
    dekWayang.position.y = 0.22;
    dekWayang.receiveShadow = true;

    const glowKelir = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.62,
      roughness: 0.55,
    });
    const layarMini = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.24, 0.06), glowKelir);
    layarMini.position.set(0, 0.98, 0);

    const bingkaiKelirAtas = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.1, 0.12), emasOrnamenMat);
    bingkaiKelirAtas.position.set(0, 1.62, 0);
    const gedebogMini = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.98, 12),
      new THREE.MeshStandardMaterial({ color: 0x4d5e28, roughness: 0.8 }),
    );
    gedebogMini.rotation.z = Math.PI / 2;
    gedebogMini.position.set(0, 0.38, 0.08);

    // Siluet Gunungan & Wayang di Depan Layar Mini
    const gununganMini = new THREE.Mesh(
      new THREE.ConeGeometry(0.26, 0.78, 6),
      emasOrnamenMat,
    );
    gununganMini.scale.z = 0.2;
    gununganMini.position.set(0, 0.82, 0.1);

    const wayangKiriMini = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.58, 5),
      new THREE.MeshStandardMaterial({ color: 0x18181b }),
    );
    wayangKiriMini.scale.z = 0.2;
    wayangKiriMini.position.set(-0.48, 0.72, 0.1);
    const wayangKananMini = wayangKiriMini.clone();
    wayangKananMini.position.x = 0.48;

    grupWayang.add(
      dekWayang,
      layarMini,
      bingkaiKelirAtas,
      gedebogMini,
      gununganMini,
      wayangKiriMini,
      wayangKananMini,
    );
    grupWayang.position.set(2.42, 0.1, 2.32);
    this.islandRoot.add(grupWayang);
    this.bangunanMap.set('wayang', {
      bendaId: 'wayang',
      grup: grupWayang,
      titikPinWorld: new THREE.Vector3(2.42, 2.08, 2.32),
      emissiveMeshes: [glowKelir],
    });

    // Partikel Kunang-Kunang & Bara Emas Suaka
    const jumlahPartikel = 110;
    const pos = new Float32Array(jumlahPartikel * 3);
    for (let i = 0; i < jumlahPartikel; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10.4;
      pos[i * 3 + 1] = 0.45 + Math.random() * 4.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10.4;
    }
    const geoPartikel = new THREE.BufferGeometry();
    geoPartikel.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particlePoints = new THREE.Points(
      geoPartikel,
      new THREE.PointsMaterial({ color: 0xffb347, size: 0.075, transparent: true, opacity: 0.72 }),
    );
    this.islandRoot.add(this.particlePoints);

    this.scene.add(this.islandRoot);
  }

  public onProyeksiPin(cb: (pins: ProyeksiPinDiorama[]) => void): void {
    this.onPinCb = cb;
  }

  public sorotBangunan(id: BendaPusaka['id'] | null): void {
    this.hoveredId = id;
  }

  public fokusKeBangunan(id: BendaPusaka['id'] | null): void {
    this.selectedId = id;
    if (!id) {
      this.targetCamPos.copy(this.heroCamPos);
      this.targetLookAt.copy(this.heroLookAt);
      return;
    }
    const kronik = KRONIK_SEJARAH_BUDAYA.find((k) => k.bendaId === id);
    if (kronik) {
      this.targetCamPos.set(...kronik.pose3D.kameraPosisi);
      this.targetLookAt.set(...kronik.pose3D.kameraTarget);
    }
  }

  public aturProgresGulir(chapterIndeks: number): void {
    if (chapterIndeks < 0) {
      this.fokusKeBangunan(null);
      return;
    }
    const kronik = KRONIK_SEJARAH_BUDAYA[Math.min(chapterIndeks, KRONIK_SEJARAH_BUDAYA.length - 1)];
    if (kronik) {
      this.selectedId = kronik.bendaId;
      this.targetCamPos.set(...kronik.pose3D.kameraPosisi);
      this.targetLookAt.set(...kronik.pose3D.kameraTarget);
    }
  }

  public aturWireframeMode(ratio: number): void {
    this.targetWireframe = THREE.MathUtils.clamp(ratio, 0, 1);
  }

  public aturParalaks(normX: number, normY: number): void {
    this.pointerNormX = THREE.MathUtils.clamp(normX, -1, 1);
    this.pointerNormY = THREE.MathUtils.clamp(normY, -1, 1);
  }

  public ubahUkuran(): void {
    if (!this.renderer) return;
    const w = Math.max(this.container.clientWidth || 800, 320);
    const h = Math.max(this.container.clientHeight || 600, 320);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);

    const isDesktop = w >= 960;
    this.heroLookAt.set(isDesktop ? -2.35 : 0, 0.72, isDesktop ? 0.35 : 0);
    this.heroCamPos.set(isDesktop ? 9.2 : 7.6, isDesktop ? 6.85 : 6.9, isDesktop ? 12.65 : 12.8);
    if (!this.selectedId) {
      this.targetCamPos.copy(this.heroCamPos);
      this.targetLookAt.copy(this.heroLookAt);
    }
  }

  private proyeksikanSemuaPin(): void {
    if (!this.onPinCb || !this.renderer) return;
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;
    const v = new THREE.Vector3();
    const hasil: ProyeksiPinDiorama[] = [];

    for (const [bendaId, data] of this.bangunanMap.entries()) {
      v.copy(data.titikPinWorld);
      v.project(this.camera);
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const terlihat = v.z > -1 && v.z < 1 && x >= 16 && x <= w - 16 && y >= 16 && y <= h - 16;
      hasil.push({ bendaId, x, y, terlihat });
    }
    this.onPinCb(hasil);
  }

  private loop = (): void => {
    this.rafId = window.requestAnimationFrame(this.loop);
    if (!this.renderer) return;

    const t = performance.now() * 0.001;

    const goalPos = this.targetCamPos.clone();
    goalPos.x += this.pointerNormX * 0.65;
    goalPos.y += this.pointerNormY * 0.35;

    this.curCamPos.lerp(goalPos, 0.06);
    this.curLookAt.lerp(this.targetLookAt, 0.06);
    this.camera.position.copy(this.curCamPos);
    this.camera.lookAt(this.curLookAt);

    this.currentWireframe += (this.targetWireframe - this.currentWireframe) * 0.1;
    if (this.cadLineMat) {
      this.cadLineMat.opacity = this.currentWireframe;
      this.cadLineMat.visible = this.currentWireframe > 0.015;
    }

    // Animasi mikro Besalen (Keris berputar & pompa Ububan naik-turun bergantian)
    if (this.kerisHoloMesh) {
      this.kerisHoloMesh.rotation.y += 0.018;
      this.kerisHoloMesh.position.y = 1.28 + Math.sin(t * 2.2) * 0.08;
    }
    if (this.ububanKiri && this.ububanKanan) {
      this.ububanKiri.position.y = 1.22 + Math.sin(t * 3.8) * 0.12;
      this.ububanKanan.position.y = 1.22 - Math.sin(t * 3.8) * 0.12;
    }
    if (this.gongAgengMesh) {
      this.gongAgengMesh.rotation.y = Math.sin(t * 1.5) * 0.05;
    }

    // Animasi kain batik melambai tertiup angin
    for (const item of this.batikClothMeshes) {
      const attr = item.mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < attr.count; i++) {
        const bx = item.basePos[i * 3];
        const by = item.basePos[i * 3 + 1];
        const wave = Math.sin(t * 2.4 + bx * 2.6 + by * 1.5 + item.phase) * (by < 0.35 ? 0.085 : 0.015);
        attr.setZ(i, wave);
      }
      attr.needsUpdate = true;
    }

    if (this.lampApiKelir) {
      this.lampApiKelir.intensity = 2.9 + Math.sin(t * 6.8) * 0.45;
    }
    if (this.lampPrapen) {
      this.lampPrapen.intensity = 3.2 + Math.cos(t * 8.2) * 0.55;
    }
    if (this.waterMesh) {
      this.waterMesh.position.y = 0.055 + Math.sin(t * 1.6) * 0.016;
    }
    if (this.particlePoints) {
      this.particlePoints.rotation.y = t * 0.038;
    }

    for (const [id, b] of this.bangunanMap.entries()) {
      const aktif = id === this.hoveredId || id === this.selectedId;
      for (const m of b.emissiveMeshes) {
        const targetInt = aktif ? 1.18 : id === 'keris' ? 0.75 : id === 'wayang' ? 0.58 : 0.18;
        m.emissiveIntensity += (targetInt - m.emissiveIntensity) * 0.12;
        if (aktif && m.emissive.getHex() === 0) {
          m.emissive.setHex(0xff5a1f);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.proyeksikanSemuaPin();
  };

  public destroy(): void {
    if (this.rafId !== null) window.cancelAnimationFrame(this.rafId);
    disposeSceneObject(this.scene);
    this.renderer?.dispose();
    this.renderer = null;
  }
}
