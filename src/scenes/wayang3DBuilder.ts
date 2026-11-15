import * as THREE from 'three';
import { loadBudayaTextures } from './threeHelpers.ts';

export interface WayangSriRamaRig {
  root: THREE.Group;
  badan: THREE.Group;
  lenganKanan: THREE.Group;
  sikuKanan: THREE.Group;
  lenganKiri: THREE.Group;
  sikuKiri?: THREE.Group;
  busur: THREE.Group;
  anakPanah: THREE.Mesh;
}

export interface WayangKidangRig {
  root: THREE.Group;
  leherKepala: THREE.Group;
  kakiDepan: THREE.Group;
  lututDepan?: THREE.Group;
  kakiBelakang: THREE.Group;
  lututBelakang?: THREE.Group;
}

let cacheSriRamaDiffuse: THREE.CanvasTexture | null = null;
let cacheSriRamaBump: THREE.CanvasTexture | null = null;
let cacheDodotDiffuse: THREE.CanvasTexture | null = null;
let cacheGununganDiffuse: THREE.CanvasTexture | null = null;
let cacheKidangDiffuse: THREE.CanvasTexture | null = null;

/**
 * Membuat tekstur kulitan tatahan kerbau berlapis prada emas 1024x1024
 * dengan motif seritan, sembuliyan, dan lubang pahatan kerawang (tatahan).
 */
function getTeksturPradaTatahan(): {
  diffuse: THREE.CanvasTexture | null;
  bump: THREE.CanvasTexture | null;
} {
  if (typeof document === 'undefined') return { diffuse: null, bump: null };
  if (cacheSriRamaDiffuse && cacheSriRamaBump) {
    return { diffuse: cacheSriRamaDiffuse, bump: cacheSriRamaBump };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bctx = bumpCanvas.getContext('2d');

  if (!ctx || !bctx) return { diffuse: null, bump: null };

  // Latar perkamen kulit kerbau berlapis prada emas murni (sesuai foto referensi)
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#f7d983');
  grad.addColorStop(0.35, '#e2b659');
  grad.addColorStop(0.7, '#c69235');
  grad.addColorStop(1, '#8c5818');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  bctx.fillStyle = '#909090';
  bctx.fillRect(0, 0, 1024, 1024);

  // Serat mikro perkamen & seritan tatah
  for (let y = 16; y < 1008; y += 24) {
    for (let x = 16; x < 1008; x += 24) {
      const offset = (y / 24) % 2 === 0 ? 0 : 12;
      const cx = x + offset;

      // Lubang tatahan inti gelap (efek krawangan tembus blencong)
      ctx.fillStyle = '#1e1005';
      ctx.beginPath();
      ctx.arc(cx, y, 3.6, 0, Math.PI * 2);
      ctx.fill();

      // Ring prada emas timbul mengelilingi lubang tatah
      ctx.strokeStyle = '#fff3be';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, y, 6.2, 0, Math.PI * 2);
      ctx.stroke();

      // Pahatan koma (inten-intenan & sembuliyan)
      ctx.fillStyle = '#381d07';
      ctx.beginPath();
      ctx.ellipse(cx + 8, y, 4.2, 1.8, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Bump map pahatan timbul-tenggelam
      bctx.fillStyle = '#181818';
      bctx.beginPath();
      bctx.arc(cx, y, 4, 0, Math.PI * 2);
      bctx.fill();

      bctx.strokeStyle = '#ffffff';
      bctx.lineWidth = 2.2;
      bctx.beginPath();
      bctx.arc(cx, y, 7, 0, Math.PI * 2);
      bctx.stroke();
    }
  }

  // Ornamen sunggingan merah-biru-putih-emas khas wayang keraton
  const pitaY = [140, 320, 520, 740];
  for (const py of pitaY) {
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, py, 1024, 22);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, py + 22, 1024, 12);
    ctx.fillStyle = '#fef3c7';
    for (let x = 12; x < 1024; x += 28) {
      ctx.beginPath();
      ctx.arc(x, py + 11, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  cacheSriRamaDiffuse = new THREE.CanvasTexture(canvas);
  cacheSriRamaDiffuse.colorSpace = THREE.SRGBColorSpace;
  cacheSriRamaBump = new THREE.CanvasTexture(bumpCanvas);

  return { diffuse: cacheSriRamaDiffuse, bump: cacheSriRamaBump };
}

/**
 * Membuat tekstur kain dodot / bokongan wayang polikrom (merah gincu, biru nila, putih, prada emas)
 * sesuai foto referensi ke-2 (detail bokongan & kain kampuh).
 */
function getTeksturKainDodot(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheDodotDiffuse) return cacheDodotDiffuse;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Dasar putih gading & prada
  ctx.fillStyle = '#f8f1df';
  ctx.fillRect(0, 0, 1024, 1024);

  // Lengkung sisik sembuliyan polikrom merah-emas-biru-hijau
  const step = 96;
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      const cx = col * step + (row % 2 === 0 ? 0 : step / 2);
      const cy = row * step;

      // Kelopak luar merah vermilion
      ctx.fillStyle = '#c81e1e';
      ctx.beginPath();
      ctx.arc(cx, cy, 44, Math.PI, 0, false);
      ctx.fill();

      // Kelopak tengah emas prada
      ctx.fillStyle = '#d99b26';
      ctx.beginPath();
      ctx.arc(cx, cy, 34, Math.PI, 0, false);
      ctx.fill();

      // Kelopak dalam biru tua & putih
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, Math.PI, 0, false);
      ctx.fill();

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
      ctx.fill();

      // Titik cecek putih & tatahan hitam di tepi kelopak
      ctx.fillStyle = '#1b1107';
      for (let a = Math.PI + 0.25; a < Math.PI * 2 - 0.2; a += 0.35) {
        const tx = cx + Math.cos(a) * 38;
        const ty = cy + Math.sin(a) * 38;
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Sabuk diagonal parang barong emas-merah
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 10;
  for (let i = -512; i < 1024; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 1024);
    ctx.stroke();
  }

  cacheDodotDiffuse = new THREE.CanvasTexture(canvas);
  cacheDodotDiffuse.colorSpace = THREE.SRGBColorSpace;
  return cacheDodotDiffuse;
}

/**
 * Tekstur Gunungan (Kayon) resolusi tinggi dengan Pohon Kalpataru, Gapura Candi,
 * Banaspati (Kala), sayap Makara, dan kemamang api.
 */
function getTeksturGununganDetail(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheGununganDiffuse) return cacheGununganDiffuse;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Gradasi kulit kerbau prada emas & bingkai merah api
  const grad = ctx.createRadialGradient(512, 820, 60, 512, 760, 820);
  grad.addColorStop(0, '#fae08c');
  grad.addColorStop(0.45, '#d49832');
  grad.addColorStop(0.82, '#8b3a14');
  grad.addColorStop(1, '#2b1105');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1536);

  // Bingkai lidah api (kemamang) merah-emas di sekeliling tepi
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(90, 1440);
  ctx.quadraticCurveTo(40, 720, 512, 70);
  ctx.quadraticCurveTo(984, 720, 934, 1440);
  ctx.closePath();
  ctx.stroke();

  // Lubang tatahan krawangan di seluruh latar Gunungan
  ctx.fillStyle = '#1f0e04';
  for (let y = 120; y < 1420; y += 28) {
    for (let x = 110; x < 914; x += 28) {
      if ((x + y) % 56 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Gapura Candi Berundak di bagian bawah (Blumbangan & Atap Joglo)
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(312, 1140, 400, 290);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 6;
  ctx.strokeRect(312, 1140, 400, 290);

  // Atap Gapura bertingkat 3
  const atapGapura = [
    [260, 1140, 504, 48],
    [300, 1085, 424, 48],
    [350, 1035, 324, 44],
  ];
  for (const [gx, gy, gw, gh] of atapGapura) {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#fef08a';
    ctx.strokeRect(gx, gy, gw, gh);
  }

  // Pintu Gapura & Sepasang Gupala (Cingkarabala-Balaupata)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(442, 1210, 140, 220);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(442, 1210, 140, 220);

  // Batang Utama Pohon Kalpataru
  ctx.strokeStyle = '#291304';
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(512, 1035);
  ctx.lineTo(512, 160);
  ctx.stroke();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(512, 1035);
  ctx.lineTo(512, 160);
  ctx.stroke();

  // Wajah Banaspati / Kala di jantung pohon Kalpataru
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(512, 680, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Mata Banaspati melotot
  for (const mx of [472, 552]) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mx, 665, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090a0d';
    ctx.beginPath();
    ctx.arc(mx, 665, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sulur Cabang Kalpataru Simetris & Bunga Padma
  const cabang = [
    [512, 880, 230, 760],
    [512, 880, 794, 760],
    [512, 720, 190, 560],
    [512, 720, 834, 560],
    [512, 520, 240, 380],
    [512, 520, 784, 380],
    [512, 350, 330, 230],
    [512, 350, 694, 230],
  ];
  for (const [x1, y1, x2, y2] of cabang) {
    ctx.strokeStyle = '#291304';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo((x1 + x2) / 2, y1 - 80, x2, y1 - 20, x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Mekar bunga & daun krawangan
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x2, y2, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x2, y2, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  cacheGununganDiffuse = new THREE.CanvasTexture(canvas);
  cacheGununganDiffuse.colorSpace = THREE.SRGBColorSpace;
  return cacheGununganDiffuse;
}

function getTeksturKidangKencana(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cacheKidangDiffuse) return cacheKidangDiffuse;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(0.5, '#f59e0b');
  grad.addColorStop(1, '#92400e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Totol-totol emas permata & pahatan tatahan bulu kijang kencana
  for (let y = 28; y < 484; y += 36) {
    for (let x = 28; x < 484; x += 36) {
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 4.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#271203';
      ctx.beginPath();
      ctx.arc(x + 14, y + 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  cacheKidangDiffuse = new THREE.CanvasTexture(canvas);
  cacheKidangDiffuse.colorSpace = THREE.SRGBColorSpace;
  return cacheKidangDiffuse;
}

/**
 * Membangun Wayang Kulit Sri Rama (Gaya Alusan Surakarta/Yogyakarta)
 * dengan detail anatomi sesuai 3 foto referensi pengguna:
 * - Wajah hitam alusan, hidung mbangir lancip, mata gabahan emas-putih, jamang & sumping
 * - Gelung Supit Urang melengkung tinggi dengan lubang tatahan krawangan & garuda mungkur
 * - Badan ramping prada emas dengan kalung ulur-ulur & lubang tatahan tembus cahaya
 * - Kain Kampuh / Dodot polikrom dengan bokongan melengkung di belakang, uncal & konca
 * - Sepasang kaki berukir dengan binggel gelang kaki & lemahan merah di dasar telapak
 * - Cempurit tanduk kerbau melengkung organik mengikuti tulang punggung hingga mahkota
 * - Dua lengan berartikulasi ganda (bahu & siku) + kelat bahu + gelang + tuding tanduk
 * - Busur Gendewa berukir & Anak Panah Guwawijaya
 */
export function buildSriRamaWayang3D(): WayangSriRamaRig {
  const tex = loadBudayaTextures();
  const prada = getTeksturPradaTatahan();
  const dodotTex = getTeksturKainDodot();

  const kulitPradaMat = new THREE.MeshStandardMaterial({
    map: prada.diffuse,
    bumpMap: prada.bump,
    bumpScale: 0.025,
    normalMap: tex.kulitNormal,
    roughnessMap: tex.kulitRough,
    color: 0xf7d57c,
    metalness: 0.52,
    roughness: 0.36,
  });

  const wajahHitamMat = new THREE.MeshStandardMaterial({
    bumpMap: prada.bump,
    bumpScale: 0.012,
    normalMap: tex.kulitNormal,
    color: 0x121110,
    metalness: 0.22,
    roughness: 0.38,
  });

  const dodotPolikromMat = new THREE.MeshStandardMaterial({
    map: dodotTex,
    bumpMap: prada.bump,
    bumpScale: 0.02,
    normalMap: tex.kulitNormal,
    color: 0xffffff,
    metalness: 0.28,
    roughness: 0.44,
  });

  const merahSunggingMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    metalness: 0.3,
    roughness: 0.42,
  });

  const emasMurniMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0x78350f,
    emissiveIntensity: 0.22,
    metalness: 0.86,
    roughness: 0.2,
  });

  const tandukGapitMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6b45a,
    roughness: 0.2,
    metalness: 0.06,
    transmission: 0.28,
    thickness: 0.2,
    clearcoat: 0.85,
  });

  const root = new THREE.Group();
  root.userData.explodeVec = new THREE.Vector3(0, 0, 0);

  const badan = new THREE.Group();
  root.add(badan);

  // =========================================================================
  // 1. TORSO RAMPING ALUSAN + LUBANG TATAHAN KRAWANGAN (Badan & Bahu)
  // =========================================================================
  const bentukTorso = new THREE.Shape();
  bentukTorso.moveTo(-0.42, 0.56); // Bahu depan (kiri)
  bentukTorso.quadraticCurveTo(-0.1, 0.62, 0.44, 0.53); // Bahu belakang (kanan)
  bentukTorso.quadraticCurveTo(0.24, 0.28, 0.14, -0.06); // Pinggang belakang ramping
  bentukTorso.lineTo(-0.13, -0.06); // Pinggang depan
  bentukTorso.quadraticCurveTo(-0.22, 0.24, -0.42, 0.56);

  // Lubang krawangan dada (tatahan tembus cahaya)
  const lubangDada1 = new THREE.Path();
  lubangDada1.absarc(-0.08, 0.36, 0.032, 0, Math.PI * 2, false);
  const lubangDada2 = new THREE.Path();
  lubangDada2.absarc(0.08, 0.36, 0.032, 0, Math.PI * 2, false);
  const lubangDada3 = new THREE.Path();
  lubangDada3.absarc(0, 0.2, 0.028, 0, Math.PI * 2, false);
  bentukTorso.holes.push(lubangDada1, lubangDada2, lubangDada3);

  const torsoMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bentukTorso, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.009,
      bevelSize: 0.008,
      bevelSegments: 2,
    }),
    kulitPradaMat,
  );
  torsoMesh.position.z = -0.018;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoMesh.userData.explodeVec = new THREE.Vector3(0, 0.2, 0.38);
  badan.add(torsoMesh);

  // Kalung Ulur-Ulur & Sembuliyan Dada Timbul
  const kalungPoints = [
    new THREE.Vector3(-0.11, 0.58, 0.025),
    new THREE.Vector3(-0.14, 0.32, 0.03),
    new THREE.Vector3(-0.02, 0.04, 0.032),
    new THREE.Vector3(0.11, 0.34, 0.028),
    new THREE.Vector3(0.09, 0.56, 0.025),
  ];
  const kalungGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(kalungPoints), 28, 0.018, 8, false);
  const kalungMesh = new THREE.Mesh(kalungGeo, emasMurniMat);
  kalungMesh.userData.explodeVec = new THREE.Vector3(0, 0.25, 0.62);
  badan.add(kalungMesh);

  // =========================================================================
  // 2. KEPALA ALUSAN HITAM + MATA GABAHAN + GELUNG SUPIT URANG (Foto 1 & 2)
  // =========================================================================
  const kepalaGrup = new THREE.Group();
  kepalaGrup.userData.explodeVec = new THREE.Vector3(-0.15, 0.68, 0.45);

  // Leher condong anggun ke depan (kiri)
  const bentukLeherWajah = new THREE.Shape();
  bentukLeherWajah.moveTo(-0.11, 0.54);
  bentukLeherWajah.lineTo(-0.18, 0.64);
  bentukLeherWajah.lineTo(-0.22, 0.64); // Dagu
  bentukLeherWajah.lineTo(-0.27, 0.69); // Bibir
  bentukLeherWajah.lineTo(-0.37, 0.72); // Ujung hidung mbangir lancip
  bentukLeherWajah.quadraticCurveTo(-0.27, 0.82, -0.21, 0.89); // Dahi
  bentukLeherWajah.quadraticCurveTo(-0.06, 0.98, 0.14, 0.92); // Batok kepala
  bentukLeherWajah.lineTo(0.12, 0.64);
  bentukLeherWajah.lineTo(0.06, 0.54);
  bentukLeherWajah.closePath();

  const wajahMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bentukLeherWajah, {
      depth: 0.038,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.007,
    }),
    wajahHitamMat,
  );
  wajahMesh.position.z = -0.019;
  wajahMesh.castShadow = true;
  kepalaGrup.add(wajahMesh);

  // Detail Mata Gabahan & Alis Emas di kedua sisi wajah
  const mataShape = new THREE.Shape();
  mataShape.moveTo(-0.28, 0.76);
  mataShape.quadraticCurveTo(-0.22, 0.79, -0.16, 0.77);
  mataShape.quadraticCurveTo(-0.22, 0.74, -0.28, 0.76);
  const mataMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(mataShape, { depth: 0.046, bevelEnabled: false }),
    emasMurniMat,
  );
  mataMesh.position.z = -0.023;
  kepalaGrup.add(mataMesh);

  // Gelung Supit Urang (Mahkota Capit Udang Melengkung Tinggi dengan Lubang Tatahan)
  const bentukGelung = new THREE.Shape();
  bentukGelung.moveTo(-0.18, 0.86);
  bentukGelung.quadraticCurveTo(-0.08, 1.04, 0.12, 1.02);
  bentukGelung.quadraticCurveTo(0.28, 1.24, 0.08, 1.38);
  bentukGelung.quadraticCurveTo(-0.08, 1.42, -0.06, 1.26); // Ujung capit melengkung ke dalam
  bentukGelung.quadraticCurveTo(0.02, 1.24, 0.05, 1.3);
  bentukGelung.quadraticCurveTo(0.14, 1.22, 0.04, 1.08);
  bentukGelung.quadraticCurveTo(0.38, 1.12, 0.42, 0.88); // Bokong gelung bulat hitam-emas
  bentukGelung.quadraticCurveTo(0.4, 0.66, 0.14, 0.66);
  bentukGelung.closePath();

  // Lubang krawangan pada Gelung Supit Urang
  for (const [hx, hy, hr] of [
    [0.02, 0.96, 0.022],
    [0.14, 1.12, 0.024],
    [0.26, 0.88, 0.035],
    [0.24, 0.76, 0.028],
  ]) {
    const h = new THREE.Path();
    h.absarc(hx, hy, hr, 0, Math.PI * 2, false);
    bentukGelung.holes.push(h);
  }

  const gelungMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bentukGelung, {
      depth: 0.042,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
    }),
    kulitPradaMat,
  );
  gelungMesh.position.z = -0.021;
  gelungMesh.castShadow = true;
  kepalaGrup.add(gelungMesh);

  // Sumping Telinga & Garuda Mungkur Emas-Merah
  const sumpingShape = new THREE.Shape();
  sumpingShape.moveTo(-0.08, 0.72);
  sumpingShape.quadraticCurveTo(0.06, 0.88, 0.14, 1.05);
  sumpingShape.quadraticCurveTo(0.02, 0.98, -0.12, 0.78);
  sumpingShape.closePath();
  const sumpingMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sumpingShape, { depth: 0.048, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005 }),
    emasMurniMat,
  );
  sumpingMesh.position.z = -0.024;
  kepalaGrup.add(sumpingMesh);

  // Untaian Rambut Panjang Ngore di Punggung Atas (sesuai Foto 1)
  const rambutShape = new THREE.Shape();
  rambutShape.moveTo(0.08, 0.68);
  rambutShape.quadraticCurveTo(0.24, 0.62, 0.42, 0.56);
  rambutShape.lineTo(0.28, 0.52);
  rambutShape.quadraticCurveTo(0.14, 0.58, 0.05, 0.64);
  rambutShape.closePath();
  const rambutMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rambutShape, { depth: 0.04, bevelEnabled: false }),
    wajahHitamMat,
  );
  rambutMesh.position.z = -0.02;
  kepalaGrup.add(rambutMesh);

  badan.add(kepalaGrup);

  // =========================================================================
  // 3. KAIN KAMPUH / DODOT, BOKONGAN MELENGKUNG, KAKI & LEMAHAN (Foto 1 & 2)
  // =========================================================================
  const kainGrup = new THREE.Group();
  kainGrup.userData.explodeVec = new THREE.Vector3(0, -0.38, 0.35);

  // Siluet Kain Dodot + Bokongan Kerajaan Melengkung Besar di Belakang (Kanan)
  const bentukDodot = new THREE.Shape();
  bentukDodot.moveTo(-0.16, -0.04); // Pinggang depan
  bentukDodot.lineTo(0.16, -0.04); // Pinggang belakang
  // Jambul manggaran / panjen di belakang pinggang
  bentukDodot.lineTo(0.36, 0.14);
  bentukDodot.quadraticCurveTo(0.32, 0.02, 0.24, -0.08);
  // Bokongan bulat melengkung anggun (khas foto 2)
  bentukDodot.bezierCurveTo(0.56, -0.18, 0.58, -0.58, 0.26, -0.66);
  // Ekor kain konca menjuntai di belakang kaki
  bentukDodot.lineTo(0.42, -0.82);
  bentukDodot.quadraticCurveTo(0.24, -0.84, 0.16, -0.68);
  // Sela lipatan uncal tengah di antara kedua kaki
  bentukDodot.lineTo(0.04, -0.84);
  bentukDodot.lineTo(-0.08, -0.78);
  bentukDodot.lineTo(-0.08, -0.52);
  // Paha depan (kiri)
  bentukDodot.quadraticCurveTo(-0.34, -0.54, -0.32, -0.32);
  bentukDodot.quadraticCurveTo(-0.28, -0.14, -0.16, -0.04);
  bentukDodot.closePath();

  // Lubang krawangan pada kain dodot
  for (const [hx, hy, hr] of [
    [0.26, -0.38, 0.036],
    [0.12, -0.28, 0.03],
    [-0.12, -0.32, 0.028],
    [0.02, -0.56, 0.025],
  ]) {
    const h = new THREE.Path();
    h.absarc(hx, hy, hr, 0, Math.PI * 2, false);
    bentukDodot.holes.push(h);
  }

  const dodotMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bentukDodot, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
    }),
    dodotPolikromMat,
  );
  dodotMesh.position.z = -0.02;
  dodotMesh.castShadow = true;
  dodotMesh.receiveShadow = true;
  kainGrup.add(dodotMesh);

  // Sabuk Pending Emas di Pinggang
  const pendingMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.12, 16),
    emasMurniMat,
  );
  pendingMesh.scale.set(1, 1, 0.32);
  pendingMesh.position.set(0, -0.05, 0);
  kainGrup.add(pendingMesh);

  // Kaki Depan (Kiri) & Kaki Belakang (Kanan) + Jari Telapak + Gelang Kaki Binggel
  const buatKakiWayang = (xPos: number): THREE.Group => {
    const kg = new THREE.Group();
    const betisShape = new THREE.Shape();
    betisShape.moveTo(xPos - 0.05, -0.45);
    betisShape.lineTo(xPos + 0.05, -0.45);
    betisShape.lineTo(xPos + 0.035, -0.94);
    betisShape.lineTo(xPos + 0.08, -1.02); // Tumit
    betisShape.lineTo(xPos - 0.16, -1.02); // Ujung jari kaki menghadap kiri
    betisShape.lineTo(xPos - 0.14, -0.96);
    betisShape.lineTo(xPos - 0.04, -0.93);
    betisShape.closePath();

    const betisMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(betisShape, {
        depth: 0.034,
        bevelEnabled: true,
        bevelThickness: 0.007,
        bevelSize: 0.006,
      }),
      kulitPradaMat,
    );
    betisMesh.position.z = -0.017;
    betisMesh.castShadow = true;
    kg.add(betisMesh);

    // Gelang Kaki (Binggel / Kroncong) Emas
    const binggel = new THREE.Mesh(
      new THREE.TorusGeometry(0.058, 0.016, 10, 20),
      emasMurniMat,
    );
    binggel.rotation.x = Math.PI / 2;
    binggel.scale.z = 0.55;
    binggel.position.set(xPos, -0.91, 0);
    kg.add(binggel);

    return kg;
  };

  kainGrup.add(buatKakiWayang(-0.2), buatKakiWayang(0.16));

  // Pita Lemahan Merah penghubung kedua telapak kaki (khas foto 2)
  const lemahan = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.045, 0.032),
    merahSunggingMat,
  );
  lemahan.position.set(-0.02, -1.01, 0);
  kainGrup.add(lemahan);

  badan.add(kainGrup);

  // =========================================================================
  // 4. CEMPURIT / GAPIT TANDUK KERBAU MELENGKUNG ORGANIK (Foto 2)
  // =========================================================================
  const kurvaCempurit = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, -1.85, 0.025), // Gagang pegangan dalang di gedebog
    new THREE.Vector3(0.04, -1.02, 0.025), // Antara kedua kaki
    new THREE.Vector3(0.02, -0.45, 0.028), // Menyusuri kain dodot
    new THREE.Vector3(-0.03, 0.05, 0.03),  // Pinggang
    new THREE.Vector3(0.02, 0.48, 0.03),   // Dada atas
    new THREE.Vector3(-0.14, 0.78, 0.03),  // Melengkung ke pipi/telinga
    new THREE.Vector3(0.06, 1.06, 0.028),  // Mengikat mahkota gelung
  ]);
  const cempuritGeo = new THREE.TubeGeometry(kurvaCempurit, 48, 0.022, 10, false);
  const cempuritMesh = new THREE.Mesh(cempuritGeo, tandukGapitMat);
  cempuritMesh.castShadow = true;
  cempuritMesh.userData.explodeVec = new THREE.Vector3(0, -0.15, -0.68);

  // Hulu gagang cempurit berukir cincin (tempat genggaman tangan Dalang)
  const huluCempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.026, 0.55, 14),
    tandukGapitMat,
  );
  huluCempurit.position.set(0.05, -1.55, 0.025);
  huluCempurit.userData.explodeVec = new THREE.Vector3(0, -0.35, -0.68);
  badan.add(cempuritMesh, huluCempurit);

  // =========================================================================
  // 5. LENGAN KANAN (DEPAN) BERARTIKULASI 2 SENDI + BUSUR GENDEWA + TUDING
  // =========================================================================
  const lenganKanan = new THREE.Group();
  lenganKanan.position.set(-0.39, 0.52, 0.028);
  lenganKanan.userData.explodeVec = new THREE.Vector3(-0.68, 0.15, 0.35);

  // Sendi Bahu Emas (Gegel)
  const gegelBahuKanan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.06, 12),
    emasMurniMat,
  );
  gegelBahuKanan.rotation.x = Math.PI / 2;
  lenganKanan.add(gegelBahuKanan);

  // Lengan Atas + Kelat Bahu Naga Berukir
  const atasKananShape = new THREE.Shape();
  atasKananShape.moveTo(-0.038, 0);
  atasKananShape.lineTo(0.038, 0);
  atasKananShape.lineTo(0.032, -0.46);
  atasKananShape.lineTo(-0.032, -0.46);
  atasKananShape.closePath();
  const atasKanan = new THREE.Mesh(
    new THREE.ExtrudeGeometry(atasKananShape, { depth: 0.024, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004 }),
    kulitPradaMat,
  );
  atasKanan.position.z = -0.012;
  atasKanan.castShadow = true;
  lenganKanan.add(atasKanan);

  const kelatBahuKanan = new THREE.Mesh(
    new THREE.TorusGeometry(0.048, 0.014, 8, 16),
    emasMurniMat,
  );
  kelatBahuKanan.position.set(0, -0.18, 0);
  lenganKanan.add(kelatBahuKanan);

  // Sendi Siku Kanan + Lengan Bawah + Jari Nyempurit
  const sikuKanan = new THREE.Group();
  sikuKanan.position.set(0, -0.45, 0.008);

  const gegelSikuKanan = gegelBahuKanan.clone();
  sikuKanan.add(gegelSikuKanan);

  const bawahKananShape = new THREE.Shape();
  bawahKananShape.moveTo(-0.032, 0);
  bawahKananShape.lineTo(0.032, 0);
  bawahKananShape.lineTo(0.026, -0.42);
  // Telapak tangan & jari lentik nyempurit
  bawahKananShape.lineTo(0.06, -0.48);
  bawahKananShape.lineTo(-0.09, -0.52);
  bawahKananShape.lineTo(-0.04, -0.42);
  bawahKananShape.closePath();

  const bawahKanan = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bawahKananShape, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004 }),
    kulitPradaMat,
  );
  bawahKanan.position.z = -0.011;
  bawahKanan.castShadow = true;
  sikuKanan.add(bawahKanan);

  // Gelang Kana Pergelangan Tangan
  const gelangKanan = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.012, 8, 16), emasMurniMat);
  gelangKanan.rotation.x = Math.PI / 2;
  gelangKanan.position.set(0, -0.38, 0);
  sikuKanan.add(gelangKanan);

  // Tuding Kanan (Tangkai Penggerak Tangan Depan)
  const tudingKanan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.014, 1.42, 10),
    tandukGapitMat,
  );
  tudingKanan.position.set(-0.03, -1.16, 0.01);
  tudingKanan.rotation.z = 0.06;
  sikuKanan.add(tudingKanan);

  // Busur Gendewa Berukir Emas + Tali Busur + Anak Panah Guwawijaya
  const busur = new THREE.Group();
  busur.position.set(-0.08, -0.44, 0.03);
  busur.userData.explodeVec = new THREE.Vector3(-0.55, 0.25, 0.55);

  const kurvaBusur = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.52, 0),
    new THREE.Vector3(-0.18, 0.34, 0),
    new THREE.Vector3(-0.28, 0, 0),
    new THREE.Vector3(-0.18, -0.34, 0),
    new THREE.Vector3(0.08, -0.52, 0),
  ]);
  const lengkungBusur = new THREE.Mesh(
    new THREE.TubeGeometry(kurvaBusur, 32, 0.022, 10, false),
    emasMurniMat,
  );
  lengkungBusur.castShadow = true;
  busur.add(lengkungBusur);

  const taliBusur = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 1.02, 6),
    tandukGapitMat,
  );
  taliBusur.position.set(0.06, 0, 0);
  busur.add(taliBusur);

  const anakPanah = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.96, 8),
    emasMurniMat,
  );
  anakPanah.rotation.z = Math.PI / 2;
  anakPanah.position.set(-0.16, 0, 0);
  const mataPanah = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.14, 6), emasMurniMat);
  mataPanah.rotation.z = Math.PI / 2;
  mataPanah.position.set(-0.48, 0, 0);
  anakPanah.add(mataPanah);
  busur.add(anakPanah);

  sikuKanan.add(busur);
  lenganKanan.add(sikuKanan);
  lenganKanan.rotation.z = -0.32;
  sikuKanan.rotation.z = 0.58;
  badan.add(lenganKanan);

  // =========================================================================
  // 6. LENGAN KIRI (BELAKANG) BERARTIKULASI 2 SENDI + TUDING KIRI
  // =========================================================================
  const lenganKiri = new THREE.Group();
  lenganKiri.position.set(0.41, 0.5, -0.024);
  lenganKiri.userData.explodeVec = new THREE.Vector3(0.68, 0.15, -0.35);

  const gegelBahuKiri = gegelBahuKanan.clone();
  lenganKiri.add(gegelBahuKiri);

  const atasKiri = atasKanan.clone();
  lenganKiri.add(atasKiri);

  const kelatBahuKiri = kelatBahuKanan.clone();
  lenganKiri.add(kelatBahuKiri);

  const sikuKiri = new THREE.Group();
  sikuKiri.position.set(0, -0.45, -0.008);
  const bawahKiri = bawahKanan.clone();
  sikuKiri.add(bawahKiri, gelangKanan.clone());

  const tudingKiri = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.014, 1.38, 10),
    tandukGapitMat,
  );
  tudingKiri.position.set(-0.04, -1.12, -0.01);
  tudingKiri.rotation.z = -0.18;
  sikuKiri.add(tudingKiri);

  sikuKiri.rotation.z = -0.78;
  lenganKiri.add(sikuKiri);
  lenganKiri.rotation.z = 0.42;
  badan.add(lenganKiri);

  return {
    root,
    badan,
    lenganKanan,
    sikuKanan,
    lenganKiri,
    sikuKiri,
    busur,
    anakPanah,
  };
}

/**
 * Membangun Wayang Kidang Kencana (Kijang Emas Dandaka) dengan pahatan tatahan kerawang,
 * mahkota tanduk bercabang 5, serta 4 kaki berartikulasi ganda yang melompat lincah.
 */
export function buildKidangKencana3D(): WayangKidangRig {
  const tex = loadBudayaTextures();
  const kidangTex = getTeksturKidangKencana();
  const prada = getTeksturPradaTatahan();

  const emasKidangMat = new THREE.MeshStandardMaterial({
    map: kidangTex,
    bumpMap: prada.bump,
    bumpScale: 0.022,
    normalMap: tex.kulitNormal,
    roughnessMap: tex.kulitRough,
    color: 0xfbbf24,
    emissive: 0x78350f,
    emissiveIntensity: 0.25,
    metalness: 0.72,
    roughness: 0.28,
  });

  const merahPermataMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.45,
    roughness: 0.3,
  });

  const tandukGapitMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6b45a,
    roughness: 0.22,
    transmission: 0.22,
  });

  const root = new THREE.Group();

  // Siluet Tubuh Kijang Melengkung Anggun + Lubang Krawangan
  const bentukBadan = new THREE.Shape();
  bentukBadan.moveTo(-0.42, 0.08); // Pinggul belakang
  bentukBadan.quadraticCurveTo(-0.1, 0.26, 0.36, 0.22); // Punggung
  bentukBadan.quadraticCurveTo(0.48, 0.05, 0.32, -0.14); // Dada depan
  bentukBadan.quadraticCurveTo(0, -0.08, -0.34, -0.14); // Perut ramping
  bentukBadan.quadraticCurveTo(-0.48, -0.04, -0.42, 0.08);

  for (const [hx, hy, hr] of [
    [-0.18, 0.06, 0.032],
    [0.04, 0.08, 0.036],
    [0.22, 0.04, 0.028],
  ]) {
    const h = new THREE.Path();
    h.absarc(hx, hy, hr, 0, Math.PI * 2, false);
    bentukBadan.holes.push(h);
  }

  const badanMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bentukBadan, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
    }),
    emasKidangMat,
  );
  badanMesh.position.z = -0.018;
  badanMesh.castShadow = true;
  root.add(badanMesh);

  // Pelana / Kalung Dada Merah-Emas Kijang Kencana
  const kalungDada = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.022, 10, 20, Math.PI),
    merahPermataMat,
  );
  kalungDada.position.set(0.28, 0.08, 0);
  kalungDada.rotation.z = -Math.PI / 3;
  kalungDada.scale.z = 0.5;
  root.add(kalungDada);

  // Ekor Kijang Melengkung
  const ekorShape = new THREE.Shape();
  ekorShape.moveTo(-0.4, 0.08);
  ekorShape.quadraticCurveTo(-0.58, 0.26, -0.52, 0.34);
  ekorShape.quadraticCurveTo(-0.42, 0.22, -0.36, 0.1);
  ekorShape.closePath();
  const ekorMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(ekorShape, { depth: 0.024, bevelEnabled: false }),
    emasKidangMat,
  );
  ekorMesh.position.z = -0.012;
  root.add(ekorMesh);

  // Leher, Kepala, Telinga & Mahkota Tanduk Bercabang 5
  const leherKepala = new THREE.Group();
  leherKepala.position.set(0.32, 0.14, 0);

  const kepalaShape = new THREE.Shape();
  kepalaShape.moveTo(-0.06, -0.06);
  kepalaShape.quadraticCurveTo(0.02, 0.22, 0.08, 0.38); // Leher depan
  kepalaShape.lineTo(-0.08, 0.44); // Telinga panjang
  kepalaShape.lineTo(0.06, 0.48);
  kepalaShape.lineTo(0.22, 0.46); // Dahi
  kepalaShape.lineTo(0.42, 0.36); // Moncong kijang lancip
  kepalaShape.lineTo(0.38, 0.3);
  kepalaShape.lineTo(0.18, 0.28); // Rahang bawah
  kepalaShape.quadraticCurveTo(0.12, 0.08, 0.06, -0.1);
  kepalaShape.closePath();

  const lubangMata = new THREE.Path();
  lubangMata.absarc(0.2, 0.39, 0.022, 0, Math.PI * 2, false);
  kepalaShape.holes.push(lubangMata);

  const kepalaMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(kepalaShape, {
      depth: 0.034,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
    }),
    emasKidangMat,
  );
  kepalaMesh.position.z = -0.017;
  kepalaMesh.castShadow = true;
  leherKepala.add(kepalaMesh);

  // Tanduk Emas Bercabang (Crown Antlers)
  const kurvaTandukUtama = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0.46, 0),
    new THREE.Vector3(0.02, 0.64, 0),
    new THREE.Vector3(-0.14, 0.78, 0),
    new THREE.Vector3(-0.04, 0.92, 0),
  ]);
  const tandukUtama = new THREE.Mesh(
    new THREE.TubeGeometry(kurvaTandukUtama, 24, 0.016, 8, false),
    emasKidangMat,
  );
  const cabangTanduk1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.016, 0.18, 8),
    emasKidangMat,
  );
  cabangTanduk1.position.set(0.05, 0.68, 0);
  cabangTanduk1.rotation.z = -0.55;
  const cabangTanduk2 = cabangTanduk1.clone();
  cabangTanduk2.position.set(-0.06, 0.82, 0);
  cabangTanduk2.rotation.z = -0.4;
  leherKepala.add(tandukUtama, cabangTanduk1, cabangTanduk2);

  root.add(leherKepala);

  // Kaki Depan & Belakang Berartikulasi Ganda (Paha + Betis + Kuku Terbelah)
  const buatSepasangKaki = (xOffset: number, isDepan: boolean): THREE.Group => {
    const grupKaki = new THREE.Group();
    grupKaki.position.set(xOffset, -0.08, 0);

    for (const zLayer of [-0.022, 0.022]) {
      const paha = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.022, 0.32, 10),
        emasKidangMat,
      );
      paha.position.set(zLayer * 1.5, -0.14, zLayer);
      paha.rotation.z = isDepan ? 0.22 : -0.25;
      paha.castShadow = true;

      const betis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.014, 0.34, 10),
        emasKidangMat,
      );
      betis.position.set(isDepan ? 0.08 : -0.08, -0.26, 0);
      betis.rotation.z = isDepan ? -0.42 : 0.45;
      paha.add(betis);

      grupKaki.add(paha);
    }
    return grupKaki;
  };

  const kakiDepan = buatSepasangKaki(0.28, true);
  const kakiBelakang = buatSepasangKaki(-0.32, false);
  root.add(kakiDepan, kakiBelakang);

  // Cempurit Tanduk Kerbau Kidang Kencana
  const cempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.022, 1.92, 10),
    tandukGapitMat,
  );
  cempurit.position.set(0, -0.62, -0.02);
  root.add(cempurit);

  return { root, leherKepala, kakiDepan, kakiBelakang };
}

/**
 * Membangun Wayang Gunungan (Kayon) Keraton dengan relief Gapura, Banaspati,
 * Kalpataru, lubang krawangan tatahan, dan tangkai cempurit tanduk.
 */
export function buildGunungan3D(): THREE.Group {
  const tex = loadBudayaTextures();
  const map = getTeksturGununganDetail();
  const prada = getTeksturPradaTatahan();

  const mat = new THREE.MeshStandardMaterial({
    map,
    bumpMap: prada.bump,
    bumpScale: 0.024,
    normalMap: tex.kulitNormal,
    color: 0xf7d882,
    metalness: 0.42,
    roughness: 0.38,
  });

  const emasMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.22,
  });

  // Siluet Gunungan berlekuk bahu Makara & puncak meruncing
  const shape = new THREE.Shape();
  shape.moveTo(-0.46, -0.82); // Dasar gapura kiri
  shape.lineTo(-0.58, -0.35); // Bahu makara kiri
  shape.bezierCurveTo(-0.68, 0.15, -0.32, 0.68, 0, 1.15); // Puncak Mahameru
  shape.bezierCurveTo(0.32, 0.68, 0.68, 0.15, 0.58, -0.35); // Bahu makara kanan
  shape.lineTo(0.46, -0.82); // Dasar gapura kanan
  shape.closePath();

  // Lubang krawangan simetris pada dahan Kalpataru Gunungan
  for (const [hx, hy, hr] of [
    [-0.24, -0.15, 0.038],
    [0.24, -0.15, 0.038],
    [-0.28, 0.18, 0.035],
    [0.28, 0.18, 0.035],
    [-0.18, 0.48, 0.03],
    [0.18, 0.48, 0.03],
    [0, 0.72, 0.028],
  ]) {
    const hole = new THREE.Path();
    hole.absarc(hx, hy, hr, 0, Math.PI * 2, false);
    shape.holes.push(hole);
  }

  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.038,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
    }),
    mat,
  );
  mesh.position.z = -0.019;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Medali Relief Banaspati & Batang Pohon Timbul di Tengah
  const batangPohon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, 1.75, 10),
    emasMat,
  );
  batangPohon.position.set(0, 0.12, 0.022);

  const banaspatiRelief = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.022, 10, 24),
    emasMat,
  );
  banaspatiRelief.position.set(0, 0.14, 0.024);

  const tangkai = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.028, 2.45, 12),
    new THREE.MeshPhysicalMaterial({ color: 0xe6b45a, roughness: 0.25, transmission: 0.2 }),
  );
  tangkai.position.set(0, -0.68, -0.01);

  const grup = new THREE.Group();
  grup.add(mesh, batangPohon, banaspatiRelief, tangkai);
  return grup;
}

/**
 * Membangun jajaran Wayang Simpingan (tokoh kesatria/raja/raksasa yang ditancapkan
 * berjajar di kanan-kiri gedebog kelir sesuai foto referensi ke-3).
 */
export function buildSimpinganWayang3D(tinggiSkala = 1, menghadapKanan = false): THREE.Group {
  const prada = getTeksturPradaTatahan();
  const dodotTex = getTeksturKainDodot();

  const matBadan = new THREE.MeshStandardMaterial({
    map: prada.diffuse,
    bumpMap: prada.bump,
    bumpScale: 0.018,
    color: 0xeab308,
    metalness: 0.45,
    roughness: 0.42,
  });

  const matDodot = new THREE.MeshStandardMaterial({
    map: dodotTex,
    color: 0xdc2626,
    roughness: 0.5,
  });

  const grup = new THREE.Group();

  const siluet = new THREE.Shape();
  siluet.moveTo(-0.22, -0.75);
  siluet.lineTo(0.26, -0.75);
  siluet.quadraticCurveTo(0.38, -0.35, 0.18, 0.05);
  siluet.lineTo(0.32, 0.48);
  siluet.quadraticCurveTo(0.18, 0.92, -0.05, 0.98);
  siluet.lineTo(-0.28, 0.68);
  siluet.lineTo(-0.34, 0.45);
  siluet.quadraticCurveTo(-0.16, 0.05, -0.22, -0.75);
  siluet.closePath();

  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(siluet, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005 }),
    matBadan,
  );
  mesh.castShadow = true;

  const dodot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.032), matDodot);
  dodot.position.set(0.02, -0.42, 0.012);

  const gapit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, 2.1, 8),
    new THREE.MeshStandardMaterial({ color: 0xd69e46, roughness: 0.3 }),
  );
  gapit.position.set(0, -0.45, 0);

  grup.add(mesh, dodot, gapit);
  grup.scale.set(menghadapKanan ? -tinggiSkala : tinggiSkala, tinggiSkala, tinggiSkala);
  return grup;
}
