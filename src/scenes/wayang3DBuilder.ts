// Pembangun Geometri 3D Tatah-Sungging Wayang Kulit Purwa & Gunungan (Kayon)
// Menggabungkan ekstrusi 3D berlapis (relief volumetrik), lubang pahatan krawangan (tatah),
// tekstur PBR sunggingan prada emas beresolusi tinggi, serta sendi artikulasi penuh.

import * as THREE from 'three';
import type { KoleksiTeksturPBR } from './pbrMaterials';

export interface RigSriRama3D {
  group: THREE.Group;
  kepalaGroup: THREE.Group;
  bahuDepan: THREE.Group;
  sikuDepan: THREE.Group;
  bahuBelakang: THREE.Group;
  sikuBelakang: THREE.Group;
  taliBusurLine: THREE.Line;
  uncalDepan: THREE.Group;
  uncalBelakang: THREE.Group;
}

export interface RigKidangKencana3D {
  group: THREE.Group;
  leherKepalaGroup: THREE.Group;
  kakiDepanKiri: THREE.Group;
  kakiDepanKanan: THREE.Group;
  kakiBelakangKiri: THREE.Group;
  kakiBelakangKanan: THREE.Group;
  ekorGroup: THREE.Group;
}

let cacheTeksturSungging: {
  sunggingEmasDiff: THREE.CanvasTexture;
  sunggingEmasBump: THREE.CanvasTexture;
  batikKampuhDiff: THREE.CanvasTexture;
  kayonSunggingDiff: THREE.CanvasTexture;
  kayonSunggingBump: THREE.CanvasTexture;
} | null = null;

function buatTeksturSunggingWayang() {
  if (cacheTeksturSungging) return cacheTeksturSungging;

  const buatKanvas = (w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  // 1. Tekstur Sungging Prada Emas & Tatahan Kerawangan (512x512)
  const cEmas = buatKanvas(512, 512);
  const ctxEmas = cEmas.getContext('2d');
  const cBump = buatKanvas(512, 512);
  const ctxBump = cBump.getContext('2d');

  if (ctxEmas && ctxBump) {
    const grad = ctxEmas.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#E8B94F');
    grad.addColorStop(0.5, '#C88D28');
    grad.addColorStop(1, '#F2CA68');
    ctxEmas.fillStyle = grad;
    ctxEmas.fillRect(0, 0, 512, 512);

    ctxBump.fillStyle = '#808080';
    ctxBump.fillRect(0, 0, 512, 512);

    // Pola tatahan intan, mas-masan, dan sembuliyan khas sunggingan Yogyakarta/Surakarta
    for (let y = 0; y < 512; y += 24) {
      for (let x = 0; x < 512; x += 24) {
        ctxEmas.strokeStyle = 'rgba(72, 32, 10, 0.42)';
        ctxEmas.lineWidth = 1.5;
        ctxEmas.beginPath();
        ctxEmas.moveTo(x + 12, y + 2);
        ctxEmas.lineTo(x + 22, y + 12);
        ctxEmas.lineTo(x + 12, y + 22);
        ctxEmas.lineTo(x + 2, y + 12);
        ctxEmas.closePath();
        ctxEmas.stroke();

        ctxEmas.fillStyle = (x + y) % 48 === 0 ? 'rgba(158, 36, 22, 0.38)' : 'rgba(24, 92, 78, 0.32)';
        ctxEmas.beginPath();
        ctxEmas.arc(x + 12, y + 12, 3.2, 0, Math.PI * 2);
        ctxEmas.fill();

        // Relief bump untuk pahatan tatah
        ctxBump.strokeStyle = '#E0E0E0';
        ctxBump.lineWidth = 2;
        ctxBump.strokeRect(x + 4, y + 4, 16, 16);
        ctxBump.fillStyle = '#252525';
        ctxBump.beginPath();
        ctxBump.arc(x + 12, y + 12, 3.5, 0, Math.PI * 2);
        ctxBump.fill();
      }
    }
  }

  // 2. Tekstur Kain Kampuh / Dodot Parang Barong & Cinde Merah-Emas
  const cKampuh = buatKanvas(512, 512);
  const ctxKampuh = cKampuh.getContext('2d');
  if (ctxKampuh) {
    ctxKampuh.fillStyle = '#7A1B12';
    ctxKampuh.fillRect(0, 0, 512, 512);

    for (let i = -512; i < 1024; i += 36) {
      ctxKampuh.strokeStyle = '#E2B14C';
      ctxKampuh.lineWidth = 5;
      ctxKampuh.beginPath();
      ctxKampuh.moveTo(i, 0);
      ctxKampuh.lineTo(i + 512, 512);
      ctxKampuh.stroke();

      ctxKampuh.strokeStyle = '#1E140E';
      ctxKampuh.lineWidth = 2.5;
      ctxKampuh.beginPath();
      ctxKampuh.moveTo(i + 12, 0);
      ctxKampuh.lineTo(i + 524, 512);
      ctxKampuh.stroke();

      // Mlinjon emas sepanjang jalur parang
      for (let t = 0; t < 512; t += 28) {
        const px = i + t + 18;
        const py = t;
        ctxKampuh.fillStyle = '#F5CF76';
        ctxKampuh.beginPath();
        ctxKampuh.arc(px, py, 3.5, 0, Math.PI * 2);
        ctxKampuh.fill();
      }
    }
  }

  // 3. Tekstur Sungging Gunungan Kayon (Hijau Rimba, Merah Api, & Emas Prada)
  const cKayon = buatKanvas(512, 512);
  const ctxKayon = cKayon.getContext('2d');
  const cKayonBump = buatKanvas(512, 512);
  const ctxKayonBump = cKayonBump.getContext('2d');
  if (ctxKayon && ctxKayonBump) {
    const gKayon = ctxKayon.createRadialGradient(256, 280, 30, 256, 260, 280);
    gKayon.addColorStop(0, '#9E2416');
    gKayon.addColorStop(0.45, '#1D4D38');
    gKayon.addColorStop(0.82, '#B68226');
    gKayon.addColorStop(1, '#E5B84B');
    ctxKayon.fillStyle = gKayon;
    ctxKayon.fillRect(0, 0, 512, 512);

    ctxKayonBump.fillStyle = '#787878';
    ctxKayonBump.fillRect(0, 0, 512, 512);

    // Ulir daun pohon Kalpataru & tatahan krawangan
    for (let r = 24; r < 260; r += 22) {
      ctxKayon.strokeStyle = 'rgba(244, 206, 112, 0.55)';
      ctxKayon.lineWidth = 2;
      ctxKayon.beginPath();
      ctxKayon.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayon.stroke();

      ctxKayonBump.strokeStyle = '#DFDFDF';
      ctxKayonBump.lineWidth = 2.5;
      ctxKayonBump.beginPath();
      ctxKayonBump.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayonBump.stroke();
    }
  }

  const bungkus = (c: HTMLCanvasElement, srgb = true) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.2, 2.2);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  cacheTeksturSungging = {
    sunggingEmasDiff: bungkus(cEmas, true),
    sunggingEmasBump: bungkus(cBump, false),
    batikKampuhDiff: bungkus(cKampuh, true),
    kayonSunggingDiff: bungkus(cKayon, true),
    kayonSunggingBump: bungkus(cKayonBump, false),
  };
  return cacheTeksturSungging;
}

// Fungsi bantu membuat lubang tatahan bundar pada THREE.Shape
function buatLubangBundar(cx: number, cy: number, radius: number, segmen = 10): THREE.Path {
  const p = new THREE.Path();
  p.absarc(cx, cy, radius, 0, Math.PI * 2, false);
  return p;
}

// ============================================================================
// 1. SRI RAMA (SATRIA PEMANAH 3D TATAH-SUNGGING BERARTIKULASI PENUH)
// ============================================================================
export function bangunSriRamaRealistis3D(teksturs: KoleksiTeksturPBR): RigSriRama3D {
  const group = new THREE.Group();
  const sungging = buatTeksturSunggingWayang();

  const kulitPradaMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.012,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.3,
    metalness: 0.72,
    clearcoat: 0.38,
  });

  const emasMurniMat = new THREE.MeshPhysicalMaterial({
    color: '#F2C45A',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.008,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.45,
  });

  const kampuhParangMat = new THREE.MeshPhysicalMaterial({
    map: sungging.batikKampuhDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.01,
    roughness: 0.42,
    metalness: 0.28,
    clearcoat: 0.25,
  });

  const hijauSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#195E4B',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.008,
    roughness: 0.36,
    metalness: 0.35,
  });

  const merahMirahMat = new THREE.MeshPhysicalMaterial({
    color: '#B81D13',
    roughness: 0.2,
    metalness: 0.45,
    clearcoat: 0.7,
  });

  const hitamWajahMat = new THREE.MeshPhysicalMaterial({
    color: '#17120E',
    roughness: 0.3,
    metalness: 0.15,
    clearcoat: 0.55,
  });

  const tandukKerbauMat = new THREE.MeshPhysicalMaterial({
    color: '#EDE0C8',
    roughness: 0.28,
    clearcoat: 0.65,
  });

  // --------------------------------------------------------------------------
  // A. TORSO & PRABA PUNGGUNG (Berlubang Tatahan Krawangan)
  // --------------------------------------------------------------------------
  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(-0.075, -0.14);
  torsoShape.bezierCurveTo(-0.09, -0.04, -0.13, 0.08, -0.14, 0.2);
  torsoShape.lineTo(0.15, 0.2);
  torsoShape.bezierCurveTo(0.14, 0.08, 0.1, -0.04, 0.08, -0.14);
  torsoShape.closePath();

  // Lubang tatahan krawangan pada dada & perut wayang
  torsoShape.holes.push(buatLubangBundar(-0.04, 0.11, 0.012));
  torsoShape.holes.push(buatLubangBundar(0.0, 0.12, 0.012));
  torsoShape.holes.push(buatLubangBundar(0.04, 0.11, 0.012));
  torsoShape.holes.push(buatLubangBundar(-0.02, 0.02, 0.01));
  torsoShape.holes.push(buatLubangBundar(0.02, 0.02, 0.01));

  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  torsoGeo.center();
  const torsoMesh = new THREE.Mesh(torsoGeo, kulitPradaMat);
  torsoMesh.position.set(0, 0.12, 0);
  group.add(torsoMesh);

  // Kalung Ulur & Badhong Dada (3 Lapis Relief 3D + Permata Mirah)
  for (let lapis = 0; lapis < 3; lapis++) {
    const kalung = new THREE.Mesh(
      new THREE.TorusGeometry(0.055 + lapis * 0.018, 0.006, 10, 24, Math.PI),
      lapis % 2 === 0 ? emasMurniMat : hijauSunggingMat,
    );
    kalung.rotation.z = Math.PI;
    kalung.position.set(-0.01, 0.25 - lapis * 0.012, 0.018);
    group.add(kalung);
  }

  // Praba (Sayap Ornamen Kerajaan di Punggung Kanan Sri Rama)
  const prabaShape = new THREE.Shape();
  prabaShape.moveTo(0.06, -0.04);
  prabaShape.bezierCurveTo(0.22, 0.04, 0.28, 0.24, 0.18, 0.42);
  prabaShape.bezierCurveTo(0.14, 0.48, 0.08, 0.42, 0.07, 0.32);
  prabaShape.bezierCurveTo(0.14, 0.22, 0.12, 0.08, 0.05, 0.0);
  prabaShape.closePath();
  prabaShape.holes.push(buatLubangBundar(0.16, 0.18, 0.015));
  prabaShape.holes.push(buatLubangBundar(0.17, 0.26, 0.014));
  prabaShape.holes.push(buatLubangBundar(0.15, 0.34, 0.012));

  const prabaGeo = new THREE.ExtrudeGeometry(prabaShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  const prabaMesh = new THREE.Mesh(prabaGeo, emasMurniMat);
  prabaMesh.position.set(0.02, 0.05, -0.012);
  group.add(prabaMesh);

  // --------------------------------------------------------------------------
  // B. KEPALA PROFIL SATRIA LURUH, MAHKOTA GELUNG SUPIT URANG, & GARUDA MUNGKUR
  // --------------------------------------------------------------------------
  const kepalaGroup = new THREE.Group();
  kepalaGroup.position.set(-0.02, 0.34, 0.004);
  kepalaGroup.rotation.z = 0.12;

  // Siluet Wajah Luruh (Menunduk Halus Khas Satria Utama) menghadap ke kiri
  const wajahShape = new THREE.Shape();
  wajahShape.moveTo(0.05, -0.06);
  wajahShape.lineTo(-0.04, -0.06); // Dagu & rahang halus
  wajahShape.lineTo(-0.065, -0.03); // Bibir
  wajahShape.lineTo(-0.055, -0.01);
  wajahShape.lineTo(-0.145, 0.015); // Ujung hidung runcing khas wayang (irung wali miring)
  wajahShape.lineTo(-0.065, 0.045); // Dahi
  wajahShape.lineTo(0.055, 0.065);
  wajahShape.closePath();

  const wajahGeo = new THREE.ExtrudeGeometry(wajahShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  wajahGeo.center();
  const wajahMesh = new THREE.Mesh(wajahGeo, hitamWajahMat);
  kepalaGroup.add(wajahMesh);

  // Mata Gabahan (Sipit Tajam Emas-Putih)
  const mataMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.01, 0.036, 8),
    emasMurniMat,
  );
  mataMesh.rotation.z = Math.PI / 2 + 0.15;
  mataMesh.position.set(-0.035, 0.015, 0.016);
  kepalaGroup.add(mataMesh);

  // Jamang Tiga Susun (Mahkota Dahi Emas Berpermata)
  for (let j = 0; j < 3; j++) {
    const jamang = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 - j * 0.015, 0.016, 0.034),
      j === 1 ? merahMirahMat : emasMurniMat,
    );
    jamang.position.set(-0.005, 0.052 + j * 0.018, 0);
    jamang.rotation.z = -0.12;
    kepalaGroup.add(jamang);
  }

  // Sumping Sekar Kluwih (Hiasan Telinga Melengkung ke Atas)
  const sumpingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, -0.01, 0.018),
    new THREE.Vector3(0.05, 0.03, 0.022),
    new THREE.Vector3(0.08, 0.09, 0.02),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(sumpingCurve, 14, 0.009, 8, false), emasMurniMat),
  );

  // Garuda Mungkur di Belakang Kepala & Gelung Supit Urang Tinggi
  const garudaMungkur = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 14, 12),
    hijauSunggingMat,
  );
  garudaMungkur.scale.set(1.1, 0.9, 0.7);
  garudaMungkur.position.set(0.058, 0.04, 0);
  kepalaGroup.add(garudaMungkur);

  const paruhGaruda = new THREE.Mesh(
    new THREE.ConeGeometry(0.014, 0.035, 8),
    emasMurniMat,
  );
  paruhGaruda.rotation.z = -Math.PI / 2;
  paruhGaruda.position.set(0.095, 0.04, 0);
  kepalaGroup.add(paruhGaruda);

  // Gelung Supit Urang (Lengkungan Mahkota Capit Udang Berlapis)
  const gelungLuarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.03, 0.07, 0),
    new THREE.Vector3(0.12, 0.14, 0),
    new THREE.Vector3(0.135, 0.25, 0),
    new THREE.Vector3(0.06, 0.32, 0),
    new THREE.Vector3(-0.01, 0.28, 0),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(gelungLuarCurve, 28, 0.022, 12, false), hitamWajahMat),
  );

  const bingkaiGelungEmas = new THREE.Mesh(
    new THREE.TubeGeometry(gelungLuarCurve, 28, 0.01, 10, false),
    emasMurniMat,
  );
  bingkaiGelungEmas.position.z = 0.014;
  kepalaGroup.add(bingkaiGelungEmas);

  // Kancing Permata Merah di Puncak Mahkota
  const permataMahkota = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 12, 12),
    merahMirahMat,
  );
  permataMahkota.position.set(-0.01, 0.28, 0.012);
  kepalaGroup.add(permataMahkota);

  group.add(kepalaGroup);

  // --------------------------------------------------------------------------
  // C. KAIN DODOT / KAMPUH PARANG, PENDING EMAS, & UNCAL KENCANA BERAYUN
  // --------------------------------------------------------------------------
  const pendingSabuk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.045, 20),
    emasMurniMat,
  );
  pendingSabuk.scale.set(1.0, 1.0, 0.38);
  pendingSabuk.position.set(0, -0.02, 0);
  group.add(pendingSabuk);

  const permataSabuk = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.022, 1),
    merahMirahMat,
  );
  permataSabuk.position.set(-0.02, -0.02, 0.025);
  group.add(permataSabuk);

  // Kain Kampuh Bawah dengan Lipatan Wiru & Sembuliyan
  const dodotShape = new THREE.Shape();
  dodotShape.moveTo(-0.14, -0.36);
  dodotShape.bezierCurveTo(-0.04, -0.38, 0.12, -0.35, 0.22, -0.32); // Ekor kain melengkung anggun ke belakang
  dodotShape.bezierCurveTo(0.24, -0.18, 0.16, -0.05, 0.09, 0.0);
  dodotShape.lineTo(-0.09, 0.0);
  dodotShape.bezierCurveTo(-0.14, -0.12, -0.16, -0.24, -0.14, -0.36);
  dodotShape.closePath();

  dodotShape.holes.push(buatLubangBundar(0.08, -0.22, 0.014));
  dodotShape.holes.push(buatLubangBundar(0.13, -0.25, 0.014));

  const dodotGeo = new THREE.ExtrudeGeometry(dodotShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  dodotGeo.center();
  const dodotMesh = new THREE.Mesh(dodotGeo, kampuhParangMat);
  dodotMesh.position.set(0.03, -0.19, 0);
  group.add(dodotMesh);

  // Pita Uncal Kencana & Uncal Wastra (Mengayun Hidup Saat Wayang Bergerak)
  const buatUncal = (xPos: number, zPos: number, mat: THREE.Material) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(xPos, -0.04, zPos);
    const kurva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.02, -0.14, 0.01),
      new THREE.Vector3(-0.05, -0.28, 0.015),
      new THREE.Vector3(-0.02, -0.38, 0.01),
    ]);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(kurva, 20, 0.012, 8, false),
      mat,
    );
    uGroup.add(mesh);
    const ujungUncal = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.055, 8),
      emasMurniMat,
    );
    ujungUncal.position.set(-0.02, -0.39, 0.01);
    uGroup.add(ujungUncal);
    return uGroup;
  };

  const uncalDepan = buatUncal(-0.04, 0.024, emasMurniMat);
  const uncalBelakang = buatUncal(0.03, 0.022, hijauSunggingMat);
  group.add(uncalDepan);
  group.add(uncalBelakang);

  // --------------------------------------------------------------------------
  // D. SEPASANG KAKI SATRIA DENGAN GELANG KRONCONG NAGA EMAS
  // --------------------------------------------------------------------------
  for (const [xKaki, rotKaki, zKaki] of [
    [-0.085, 0.14, 0.008],
    [0.075, -0.12, -0.008],
  ] as [number, number, number][]) {
    const kakiGroup = new THREE.Group();
    kakiGroup.position.set(xKaki, -0.36, zKaki);
    kakiGroup.rotation.z = rotKaki;

    const betis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.013, 0.24, 12),
      kulitPradaMat,
    );
    betis.position.y = -0.1;
    kakiGroup.add(betis);

    // Gelang Kaki Kroncong
    const kroncong = new THREE.Mesh(
      new THREE.TorusGeometry(0.019, 0.005, 8, 16),
      emasMurniMat,
    );
    kroncong.rotation.x = Math.PI / 2;
    kroncong.position.y = -0.2;
    kakiGroup.add(kroncong);

    // Telapak Kaki Wayang Menghadap Kiri
    const telapak = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 0.018, 0.022),
      kulitPradaMat,
    );
    telapak.position.set(-0.024, -0.22, 0);
    kakiGroup.add(telapak);

    group.add(kakiGroup);
  }

  // --------------------------------------------------------------------------
  // E. LENGAN DEPAN (MEMEGANG BUSUR GENDEWA) & LENGAN BELAKANG (MENARIK TALI)
  // --------------------------------------------------------------------------
  // 1. Lengan Depan (Bahu -> Kelat Bahu -> Siku -> Gelang Kana -> Busur Gendewa -> Tuding)
  const bahuDepan = new THREE.Group();
  bahuDepan.position.set(-0.11, 0.25, 0.026);
  bahuDepan.rotation.z = -0.58;

  const sendiBahuDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.015, 12),
    emasMurniMat,
  );
  sendiBahuDepan.rotation.x = Math.PI / 2;
  bahuDepan.add(sendiBahuDepan);

  const lenganAtasDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.013, 0.22, 12),
    kulitPradaMat,
  );
  lenganAtasDepan.position.set(0, -0.11, 0);
  bahuDepan.add(lenganAtasDepan);

  // Kelat Bahu Naga Emas
  const kelatBahu = new THREE.Mesh(
    new THREE.TorusGeometry(0.019, 0.005, 8, 16),
    hijauSunggingMat,
  );
  kelatBahu.rotation.x = Math.PI / 2;
  kelatBahu.position.set(0, -0.09, 0);
  bahuDepan.add(kelatBahu);

  const sikuDepan = new THREE.Group();
  sikuDepan.position.set(0, -0.22, 0);
  sikuDepan.rotation.z = -0.92;

  const gegelSiku = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.016, 12),
    emasMurniMat,
  );
  gegelSiku.rotation.x = Math.PI / 2;
  sikuDepan.add(gegelSiku);

  const lenganBawahDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.011, 0.22, 12),
    kulitPradaMat,
  );
  lenganBawahDepan.position.set(0, -0.11, 0);
  sikuDepan.add(lenganBawahDepan);

  // Gelang Kana Rangkap
  for (const yOff of [-0.17, -0.195]) {
    const gelang = new THREE.Mesh(
      new THREE.TorusGeometry(0.015, 0.004, 8, 16),
      emasMurniMat,
    );
    gelang.rotation.x = Math.PI / 2;
    gelang.position.set(0, yOff, 0);
    sikuDepan.add(gelang);
  }

  // Busur Gendewa Sakti Berukir Makara + Anak Panah Siap Lepas
  const busurCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, -0.44, 0.01),
    new THREE.Vector3(-0.08, -0.34, 0.01),
    new THREE.Vector3(-0.14, -0.22, 0.01),
    new THREE.Vector3(-0.08, -0.1, 0.01),
    new THREE.Vector3(0.12, 0.0, 0.01),
  ]);
  const busurMesh = new THREE.Mesh(
    new THREE.TubeGeometry(busurCurve, 32, 0.012, 10, false),
    emasMurniMat,
  );
  sikuDepan.add(busurMesh);

  // Hiasan Ujung Busur Merah-Hijau
  for (const yUjung of [0.0, -0.44]) {
    const makaraUjung = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 10),
      merahMirahMat,
    );
    makaraUjung.position.set(0.12, yUjung, 0.01);
    sikuDepan.add(makaraUjung);
  }

  // Tali Busur Gendewa & Anak Panah di Tangan
  const taliPoints = [
    new THREE.Vector3(0.12, 0.0, 0.01),
    new THREE.Vector3(0.19, -0.22, 0.01),
    new THREE.Vector3(0.12, -0.44, 0.01),
  ];
  const taliBusurLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(taliPoints),
    new THREE.LineBasicMaterial({ color: '#FFF0B8' }),
  );
  sikuDepan.add(taliBusurLine);

  const anakPanahSiaga = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.38, 8),
    emasMurniMat,
  );
  anakPanahSiaga.rotation.z = Math.PI / 2;
  anakPanahSiaga.position.set(0.0, -0.22, 0.014);
  sikuDepan.add(anakPanahSiaga);

  // Tuding Tanduk Depan
  const tudingDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.006, 0.58, 8),
    tandukKerbauMat,
  );
  tudingDepan.position.set(0.08, -0.44, 0.01);
  tudingDepan.rotation.z = 0.62;
  sikuDepan.add(tudingDepan);

  bahuDepan.add(sikuDepan);
  group.add(bahuDepan);

  // 2. Lengan Belakang (Menarik Tali Busur di Depan Dada)
  const bahuBelakang = new THREE.Group();
  bahuBelakang.position.set(0.11, 0.24, -0.022);
  bahuBelakang.rotation.z = 0.25;

  const lenganAtasBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.012, 0.21, 10),
    kulitPradaMat,
  );
  lenganAtasBelakang.position.set(0, -0.1, 0);
  bahuBelakang.add(lenganAtasBelakang);

  const sikuBelakang = new THREE.Group();
  sikuBelakang.position.set(0, -0.2, 0);
  sikuBelakang.rotation.z = -1.25;

  const lenganBawahBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.01, 0.2, 10),
    kulitPradaMat,
  );
  lenganBawahBelakang.position.set(0, -0.1, 0);
  sikuBelakang.add(lenganBawahBelakang);

  const tudingBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.0055, 0.52, 8),
    tandukKerbauMat,
  );
  tudingBelakang.position.set(0.06, -0.38, 0);
  tudingBelakang.rotation.z = 0.45;
  sikuBelakang.add(tudingBelakang);

  bahuBelakang.add(sikuBelakang);
  group.add(bahuBelakang);

  // --------------------------------------------------------------------------
  // F. GAPIT / CEMPURIT UTAMA TANDUK KERBAU BULE
  // --------------------------------------------------------------------------
  const cempuritUtama = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.015, 1.48, 12),
    tandukKerbauMat,
  );
  cempuritUtama.position.set(0, -0.18, 0);
  group.add(cempuritUtama);

  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return {
    group,
    kepalaGroup,
    bahuDepan,
    sikuDepan,
    bahuBelakang,
    sikuBelakang,
    taliBusurLine,
    uncalDepan,
    uncalBelakang,
  };
}

// ============================================================================
// 2. KIDANG KENCANA (KIJANG EMAS MARICA 3D BERPAHAT KRAWANGAN & 4 KAKI HIDUP)
// ============================================================================
export function bangunKidangKencanaRealistis3D(
  teksturs: KoleksiTeksturPBR,
): RigKidangKencana3D {
  const group = new THREE.Group();
  const sungging = buatTeksturSunggingWayang();

  const emasKidangMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.012,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.22,
    metalness: 0.85,
    clearcoat: 0.45,
  });

  const permataMirahMat = new THREE.MeshPhysicalMaterial({
    color: '#C21E14',
    roughness: 0.18,
    metalness: 0.45,
    clearcoat: 0.75,
  });

  const permataZamrudMat = new THREE.MeshPhysicalMaterial({
    color: '#176E56',
    roughness: 0.22,
    metalness: 0.4,
    clearcoat: 0.65,
  });

  const tandukMat = new THREE.MeshPhysicalMaterial({
    color: '#EDE0C8',
    roughness: 0.3,
    clearcoat: 0.6,
  });

  // --------------------------------------------------------------------------
  // A. BADAN KIJANG EMAS (Siluet Anatomis Luwes + Lubang Tatahan Krawangan)
  // --------------------------------------------------------------------------
  const badanShape = new THREE.Shape();
  badanShape.moveTo(-0.24, -0.02); // Pinggul belakang
  badanShape.bezierCurveTo(-0.14, -0.09, 0.08, -0.08, 0.22, -0.03); // Perut melengkung ramping
  badanShape.bezierCurveTo(0.28, 0.04, 0.26, 0.14, 0.16, 0.16); // Dada bidang
  badanShape.bezierCurveTo(0.02, 0.12, -0.12, 0.14, -0.23, 0.11); // Punggung
  badanShape.bezierCurveTo(-0.28, 0.07, -0.28, 0.01, -0.24, -0.02);
  badanShape.closePath();

  // Lubang krawangan (tatahan) di sepanjang badan kijang agar cahaya blencong menembus indah
  badanShape.holes.push(buatLubangBundar(-0.14, 0.04, 0.016));
  badanShape.holes.push(buatLubangBundar(-0.05, 0.05, 0.018));
  badanShape.holes.push(buatLubangBundar(0.05, 0.04, 0.018));
  badanShape.holes.push(buatLubangBundar(0.14, 0.05, 0.015));

  const badanGeo = new THREE.ExtrudeGeometry(badanShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.009,
    bevelSize: 0.007,
    bevelSegments: 3,
  });
  badanGeo.center();
  const badanMesh = new THREE.Mesh(badanGeo, emasKidangMat);
  badanMesh.position.set(0, 0.08, 0);
  group.add(badanMesh);

  // Pelana /Sabuk Hias & Permata Timbul di Punggung Kijang Kencana
  for (const [idx, [px, py]] of [
    [-0.14, 0.11],
    [-0.05, 0.12],
    [0.05, 0.11],
    [0.14, 0.12],
  ].entries()) {
    const permata = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.016, 1),
      idx % 2 === 0 ? permataMirahMat : permataZamrudMat,
    );
    permata.position.set(px, py, 0.022);
    group.add(permata);
  }

  // --------------------------------------------------------------------------
  // B. LEHER, KEPALA ANGGUN, TELINGA, KALUNG GENTA, & RANGGAH KENCANA BERCABANG
  // --------------------------------------------------------------------------
  const leherKepalaGroup = new THREE.Group();
  leherKepalaGroup.position.set(0.18, 0.14, 0);

  const leherCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.06, 0.1, 0),
    new THREE.Vector3(0.08, 0.21, 0),
  ]);
  const leherMesh = new THREE.Mesh(
    new THREE.TubeGeometry(leherCurve, 18, 0.036, 12, false),
    emasKidangMat,
  );
  leherKepalaGroup.add(leherMesh);

  // Kalung Genta Merah-Emas di Leher Kijang
  const kalungKijang = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, 0.008, 10, 20),
    permataMirahMat,
  );
  kalungKijang.rotation.x = Math.PI / 2 - 0.35;
  kalungKijang.position.set(0.045, 0.08, 0);
  leherKepalaGroup.add(kalungKijang);

  const gentaEmas = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 10, 10),
    emasKidangMat,
  );
  gentaEmas.position.set(0.09, 0.06, 0);
  leherKepalaGroup.add(gentaEmas);

  // Kepala & Moncong Kijang 3D
  const kepalaShape = new THREE.Shape();
  kepalaShape.moveTo(0.03, 0.18);
  kepalaShape.lineTo(0.2, 0.19); // Moncong runcing
  kepalaShape.lineTo(0.18, 0.23);
  kepalaShape.lineTo(0.09, 0.26); // Dahi
  kepalaShape.lineTo(0.02, 0.24);
  kepalaShape.closePath();

  const kepalaGeo = new THREE.ExtrudeGeometry(kepalaShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  const kepalaMesh = new THREE.Mesh(kepalaGeo, emasKidangMat);
  kepalaMesh.position.set(0, 0, -0.013);
  leherKepalaGroup.add(kepalaMesh);

  // Mata Permata Mirah Kijang Kencana
  const mataKijang = new THREE.Mesh(
    new THREE.SphereGeometry(0.011, 10, 10),
    permataMirahMat,
  );
  mataKijang.position.set(0.09, 0.225, 0.018);
  leherKepalaGroup.add(mataKijang);

  // Sepasang Telinga Lancip
  for (const [zTel, rotTel] of [
    [0.015, 0.45],
    [-0.015, 0.65],
  ] as [number, number][]) {
    const telinga = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.075, 8),
      emasKidangMat,
    );
    telinga.position.set(0.03, 0.27, zTel);
    telinga.rotation.z = rotTel;
    leherKepalaGroup.add(telinga);
  }

  // Ranggah Kencana (Tanduk Emas Bercabang 3 Tingkat dengan Kuncup Permata)
  const batangTandukUtama = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.06, 0.25, 0),
    new THREE.Vector3(0.0, 0.36, 0.01),
    new THREE.Vector3(-0.08, 0.45, 0),
    new THREE.Vector3(-0.02, 0.54, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(batangTandukUtama, 24, 0.01, 10, false), emasKidangMat),
  );

  const cabangTanduk1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, 0.34, 0),
    new THREE.Vector3(0.07, 0.41, 0.01),
    new THREE.Vector3(0.09, 0.46, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(cabangTanduk1, 14, 0.0075, 8, false), emasKidangMat),
  );

  const cabangTanduk2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0.42, 0),
    new THREE.Vector3(0.02, 0.48, -0.01),
    new THREE.Vector3(0.04, 0.53, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(cabangTanduk2, 14, 0.007, 8, false), emasKidangMat),
  );

  // Kuncup Permata di Ujung-Ujung Ranggah Kencana
  for (const [tx, ty] of [
    [-0.02, 0.54],
    [0.09, 0.46],
    [0.04, 0.53],
  ] as [number, number][]) {
    const kuncup = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 10),
      permataMirahMat,
    );
    kuncup.position.set(tx, ty, 0);
    leherKepalaGroup.add(kuncup);
  }

  group.add(leherKepalaGroup);

  // --------------------------------------------------------------------------
  // C. EKOR HIDUP & 4 KAKI BERARTIKULASI (PAHA, BETIS, & TERACAK EMAS)
  // --------------------------------------------------------------------------
  const ekorGroup = new THREE.Group();
  ekorGroup.position.set(-0.24, 0.14, 0);
  const ekorMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.095, 10),
    emasKidangMat,
  );
  ekorMesh.rotation.z = 0.75;
  ekorMesh.position.set(-0.03, 0.03, 0);
  ekorGroup.add(ekorMesh);
  group.add(ekorGroup);

  const buatKakiKijang = (xPos: number, zPos: number, kemiringanAwal: number) => {
    const kGroup = new THREE.Group();
    kGroup.position.set(xPos, 0.03, zPos);

    // Paha Atas
    const paha = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.014, 0.16, 10),
      emasKidangMat,
    );
    paha.position.set(0, -0.07, 0);
    paha.rotation.z = kemiringanAwal;
    kGroup.add(paha);

    // Sendi Lutut Emas
    const lutut = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 10, 10),
      permataZamrudMat,
    );
    lutut.position.set(kemiringanAwal * 0.08, -0.15, 0);
    kGroup.add(lutut);

    // Betis Bawah Ramping
    const betis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.009, 0.18, 10),
      emasKidangMat,
    );
    betis.position.set(kemiringanAwal * 0.04, -0.23, 0);
    betis.rotation.z = -kemiringanAwal * 0.6;
    kGroup.add(betis);

    // Teracak Kaki Emas
    const teracak = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.028, 8),
      permataMirahMat,
    );
    teracak.position.set(0.01, -0.32, 0);
    kGroup.add(teracak);

    return kGroup;
  };

  const kakiDepanKiri = buatKakiKijang(0.16, 0.018, 0.24);
  const kakiDepanKanan = buatKakiKijang(0.14, -0.018, -0.18);
  const kakiBelakangKiri = buatKakiKijang(-0.16, 0.018, -0.24);
  const kakiBelakangKanan = buatKakiKijang(-0.18, -0.018, 0.18);

  group.add(kakiDepanKiri);
  group.add(kakiDepanKanan);
  group.add(kakiBelakangKiri);
  group.add(kakiBelakangKanan);

  // Gapit / Cempurit Utama Kijang
  const cempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.013, 1.32, 12),
    tandukMat,
  );
  cempurit.position.set(0, -0.22, 0);
  group.add(cempurit);

  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return {
    group,
    leherKepalaGroup,
    kakiDepanKiri,
    kakiDepanKanan,
    kakiBelakangKiri,
    kakiBelakangKanan,
    ekorGroup,
  };
}

// ============================================================================
// 3. GUNUNGAN / KAYON 3D (POHON KALPATARU, GAPURA, BANASPATI, & NAGA KEMBAR)
// ============================================================================
export function bangunGununganKayonRealistis3D(
  teksturs: KoleksiTeksturPBR,
  skala = 1.0,
): THREE.Group {
  const group = new THREE.Group();
  const sungging = buatTeksturSunggingWayang();

  const kayonDasarMat = new THREE.MeshPhysicalMaterial({
    map: sungging.kayonSunggingDiff,
    bumpMap: sungging.kayonSunggingBump,
    bumpScale: 0.018,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 0.34,
    metalness: 0.58,
    clearcoat: 0.35,
  });

  const emasPradaMat = new THREE.MeshPhysicalMaterial({
    color: '#F0C254',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.01,
    roughness: 0.24,
    metalness: 0.86,
    clearcoat: 0.45,
  });

  const merahSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#9E2316',
    roughness: 0.35,
    metalness: 0.32,
  });

  const hijauRimbaMat = new THREE.MeshPhysicalMaterial({
    color: '#19543E',
    roughness: 0.38,
    metalness: 0.28,
  });

  const tandukMat = new THREE.MeshPhysicalMaterial({
    color: '#EDE0C8',
    roughness: 0.32,
    clearcoat: 0.6,
  });

  // 1. Badan Utama Gunungan (Siluet Meruncing Pohon Hayat + Lubang Krawangan Tatahan)
  const kayonShape = new THREE.Shape();
  kayonShape.moveTo(0, -0.54);
  kayonShape.lineTo(0.24, -0.5);
  kayonShape.bezierCurveTo(0.38, -0.22, 0.38, 0.16, 0.2, 0.44);
  kayonShape.bezierCurveTo(0.11, 0.58, 0.04, 0.66, 0, 0.74);
  kayonShape.bezierCurveTo(-0.04, 0.66, -0.11, 0.58, -0.2, 0.44);
  kayonShape.bezierCurveTo(-0.38, 0.16, -0.38, -0.22, -0.24, -0.5);
  kayonShape.closePath();

  // Lubang-lubang tatahan krawangan simetris agar cahaya Blencong menembus layar Kelir
  for (const [hx, hy, hr] of [
    [-0.14, 0.08, 0.022],
    [0.14, 0.08, 0.022],
    [-0.18, -0.06, 0.02],
    [0.18, -0.06, 0.02],
    [-0.12, 0.24, 0.02],
    [0.12, 0.24, 0.02],
    [-0.07, 0.4, 0.018],
    [0.07, 0.4, 0.018],
    [0.0, 0.52, 0.018],
  ] as [number, number, number][]) {
    kayonShape.holes.push(buatLubangBundar(hx, hy, hr, 12));
  }

  const kayonGeo = new THREE.ExtrudeGeometry(kayonShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 3,
  });
  kayonGeo.center();
  const kayonMesh = new THREE.Mesh(kayonGeo, kayonDasarMat);
  group.add(kayonMesh);

  // 2. Bingkai Lidah Api Emas (Geni Murub) di Sekeliling Tepi Gunungan
  const apiKelilingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.23, -0.46, 0.016),
    new THREE.Vector3(-0.33, -0.12, 0.016),
    new THREE.Vector3(-0.28, 0.22, 0.016),
    new THREE.Vector3(-0.14, 0.48, 0.016),
    new THREE.Vector3(0, 0.7, 0.016),
    new THREE.Vector3(0.14, 0.48, 0.016),
    new THREE.Vector3(0.28, 0.22, 0.016),
    new THREE.Vector3(0.33, -0.12, 0.016),
    new THREE.Vector3(0.23, -0.46, 0.016),
  ]);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(apiKelilingCurve, 48, 0.011, 10, false), emasPradaMat),
  );

  // 3. Relief Gapura Candi Bentar & Tangga Bertingkat di Dasar Gunungan
  for (let t = 0; t < 3; t++) {
    const undakan = new THREE.Mesh(
      new THREE.BoxGeometry(0.34 - t * 0.05, 0.032, 0.045),
      emasPradaMat,
    );
    undakan.position.set(0, -0.46 + t * 0.034, 0.006);
    group.add(undakan);
  }

  const badanGapura = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.044),
    merahSunggingMat,
  );
  badanGapura.position.set(0, -0.28, 0.006);
  group.add(badanGapura);

  const pintuGapuraEmas = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.15, 0.05),
    emasPradaMat,
  );
  pintuGapuraEmas.position.set(0, -0.29, 0.008);
  group.add(pintuGapuraEmas);

  // Atap Tumpang Gapura 3 Tingkat
  for (let a = 0; a < 3; a++) {
    const atapGapura = new THREE.Mesh(
      new THREE.BoxGeometry(0.26 - a * 0.05, 0.025, 0.052),
      emasPradaMat,
    );
    atapGapura.position.set(0, -0.16 + a * 0.028, 0.008);
    group.add(atapGapura);
  }

  // Sepasang Penjaga Dwarapala (Cingkarabala & Balaupata) di Kiri-Kanan Gapura
  for (const sisi of [-1, 1]) {
    const dwarapala = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.14, 10),
      hijauRimbaMat,
    );
    dwarapala.position.set(sisi * 0.165, -0.3, 0.018);
    group.add(dwarapala);

    const gadaEmas = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.08, 8),
      emasPradaMat,
    );
    gadaEmas.position.set(sisi * 0.14, -0.25, 0.026);
    gadaEmas.rotation.z = -sisi * 0.35;
    group.add(gadaEmas);
  }

  // 4. Relief Wajah Kala Makara / Banaspati 3D di Tengah Pohon
  const kalaHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 16, 14),
    merahSunggingMat,
  );
  kalaHead.scale.set(1.25, 0.95, 0.55);
  kalaHead.position.set(0, 0.02, 0.018);
  group.add(kalaHead);

  for (const sisiMata of [-1, 1]) {
    const mataKala = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 12),
      emasPradaMat,
    );
    mataKala.position.set(sisiMata * 0.036, 0.035, 0.048);
    group.add(mataKala);
  }

  // 5. Batang & Cabang Pohon Kalpataru + Sepasang Naga Kembar Melilit
  const batangKalpataru = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.026, 0.52, 12),
    emasPradaMat,
  );
  batangKalpataru.position.set(0, 0.24, 0.018);
  group.add(batangKalpataru);

  for (const sisi of [-1, 1]) {
    const cabangCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06, 0.02),
      new THREE.Vector3(sisi * 0.1, 0.16, 0.022),
      new THREE.Vector3(sisi * 0.2, 0.14, 0.02),
      new THREE.Vector3(sisi * 0.14, 0.32, 0.022),
      new THREE.Vector3(sisi * 0.06, 0.46, 0.02),
    ]);
    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(cabangCurve, 28, 0.009, 8, false), emasPradaMat),
    );
  }

  // Mustaka Puncak Kayon
  const mustakaKayon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.032, 1),
    emasPradaMat,
  );
  mustakaKayon.position.set(0, 0.68, 0.016);
  group.add(mustakaKayon);

  // 6. Cempurit Tanduk Kerbau di Bawah Gunungan
  const cempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.016, 1.44, 12),
    tandukMat,
  );
  cempurit.position.set(0, -0.22, 0);
  group.add(cempurit);

  group.scale.setScalar(skala);
  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}
