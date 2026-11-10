// Pembangun geometri 3D tatah-sungging Wayang Kulit Purwa dan Gunungan (Kayon).
// Dirancang sesuai pakem anatomi Wayang Kulit Purwa (koleksi Museum Sonobudoyo Yogyakarta):
// - Profil wajah Satria Luruh (wanda ireng) dengan garis sunggingan emas-merah & mata liyep
// - Mahkota Gelung Supit Urang berlubang krawangan, Jamang 3 susun, Garuda Mungkur polikrom, Sumping, & rambut Ngore
// - Torso berlapis prada emas dengan Kalung Ulur bertingkat, sendi Gegel kuningan/tulang, Kelat Bahu, & Gelang Kana
// - Lengan 2 ruas pahatan pipih berartikulasi dengan tangan Nyempurit dan tangkai Tuding vertikal yang hidup
// - Kain Dodot Bokongan Sembuliyan polikrom (merah-putih-biru-hijau-emas), Manggaran, Uncal Kencana, Kroncong, & Lemahan merah
// - Gapit / Cempurit tanduk kerbau bule melengkung S (S-curve) dengan hulu ukir bubutan

import * as THREE from 'three';
import type { KoleksiTeksturPBR } from './pbrMaterials';

export interface RigSriRama3D {
  group: THREE.Group;
  kepalaGroup: THREE.Group;
  bahuDepan: THREE.Group;
  sikuDepan: THREE.Group;
  tudingDepanGroup?: THREE.Group;
  bahuBelakang: THREE.Group;
  sikuBelakang: THREE.Group;
  tudingBelakangGroup?: THREE.Group;
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
  garudaPolikromDiff: THREE.CanvasTexture;
  kayonSunggingDiff: THREE.CanvasTexture;
  kayonSunggingBump: THREE.CanvasTexture;
  kelirBlencongDiff: THREE.CanvasTexture;
} | null = null;

export function ambilTeksturSunggingWayang() {
  if (cacheTeksturSungging) return cacheTeksturSungging;

  const buatKanvas = (w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  // 1. Tekstur sungging prada emas murni dengan garis cawen halus & titik tatah intan
  const cEmas = buatKanvas(512, 512);
  const ctxEmas = cEmas.getContext('2d');
  const cBump = buatKanvas(512, 512);
  const ctxBump = cBump.getContext('2d');

  if (ctxEmas && ctxBump) {
    const grad = ctxEmas.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#E9C46A');
    grad.addColorStop(0.35, '#D4A442');
    grad.addColorStop(0.7, '#F2D27E');
    grad.addColorStop(1, '#C7922E');
    ctxEmas.fillStyle = grad;
    ctxEmas.fillRect(0, 0, 512, 512);

    ctxBump.fillStyle = '#808080';
    ctxBump.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 16) {
      for (let x = 0; x < 512; x += 16) {
        ctxEmas.strokeStyle = 'rgba(46, 22, 8, 0.42)';
        ctxEmas.lineWidth = 1.1;
        ctxEmas.beginPath();
        ctxEmas.moveTo(x + 8, y + 1);
        ctxEmas.lineTo(x + 15, y + 8);
        ctxEmas.lineTo(x + 8, y + 15);
        ctxEmas.lineTo(x + 1, y + 8);
        ctxEmas.closePath();
        ctxEmas.stroke();

        ctxEmas.fillStyle =
          (x + y) % 32 === 0 ? 'rgba(182, 34, 22, 0.38)' : 'rgba(24, 102, 78, 0.32)';
        ctxEmas.beginPath();
        ctxEmas.arc(x + 8, y + 8, 2.1, 0, Math.PI * 2);
        ctxEmas.fill();

        ctxBump.strokeStyle = '#ECECEC';
        ctxBump.lineWidth = 1.6;
        ctxBump.strokeRect(x + 2, y + 2, 12, 12);
        ctxBump.fillStyle = '#181818';
        ctxBump.beginPath();
        ctxBump.arc(x + 8, y + 8, 2.6, 0, Math.PI * 2);
        ctxBump.fill();
      }
    }
  }

  // 2. Tekstur Dodot Bokongan Sembuliyan Polikrom (putih gading, merah mirah, biru nila, hijau jamrud, & sisik mata merak emas)
  const cKampuh = buatKanvas(512, 512);
  const ctxKampuh = cKampuh.getContext('2d');
  if (ctxKampuh) {
    ctxKampuh.fillStyle = '#F7EFE0';
    ctxKampuh.fillRect(0, 0, 512, 512);

    // Pita tepi merah sembuliyan & tlacapan
    for (let y = 0; y < 512; y += 64) {
      ctxKampuh.fillStyle = '#D4281E';
      ctxKampuh.fillRect(0, y, 512, 14);
      ctxKampuh.fillStyle = '#1A569E';
      ctxKampuh.fillRect(0, y + 14, 512, 8);
      ctxKampuh.fillStyle = '#E8B646';
      ctxKampuh.fillRect(0, y + 22, 512, 6);

      for (let x = 0; x < 512; x += 32) {
        // Sisik mata merak polikrom khas dodot wayang kulit
        ctxKampuh.fillStyle = '#C8962E';
        ctxKampuh.beginPath();
        ctxKampuh.arc(x + 16, y + 44, 13, Math.PI, 0, false);
        ctxKampuh.fill();

        ctxKampuh.strokeStyle = '#1E120B';
        ctxKampuh.lineWidth = 1.6;
        ctxKampuh.beginPath();
        ctxKampuh.arc(x + 16, y + 44, 13, Math.PI, 0, false);
        ctxKampuh.stroke();

        ctxKampuh.fillStyle = (x / 32) % 2 === 0 ? '#187450' : '#D4281E';
        ctxKampuh.beginPath();
        ctxKampuh.arc(x + 16, y + 41, 5.5, 0, Math.PI * 2);
        ctxKampuh.fill();

        ctxKampuh.fillStyle = '#FFF7E4';
        ctxKampuh.beginPath();
        ctxKampuh.arc(x + 16, y + 41, 2.2, 0, Math.PI * 2);
        ctxKampuh.fill();
      }
    }
  }

  // 3. Tekstur Garuda Mungkur & Jamang Polikrom (garis tlacapan merah-putih-hijau-emas)
  const cGaruda = buatKanvas(256, 256);
  const ctxGaruda = cGaruda.getContext('2d');
  if (ctxGaruda) {
    const warnaPita = ['#D92B20', '#FAF2E4', '#1A7A54', '#EAB844', '#1F5BA8', '#FAF2E4'];
    for (let i = 0; i < 32; i++) {
      ctxGaruda.fillStyle = warnaPita[i % warnaPita.length];
      ctxGaruda.fillRect(0, i * 8, 256, 8);
      ctxGaruda.strokeStyle = 'rgba(24, 14, 8, 0.55)';
      ctxGaruda.lineWidth = 1;
      ctxGaruda.beginPath();
      ctxGaruda.moveTo(0, i * 8);
      ctxGaruda.lineTo(256, i * 8);
      ctxGaruda.stroke();
    }
  }

  // 4. Tekstur sungging Gunungan Kayon (kuning gading, merah api, hijau rimba, & sulur pohon Kalpataru)
  const cKayon = buatKanvas(512, 512);
  const ctxKayon = cKayon.getContext('2d');
  const cKayonBump = buatKanvas(512, 512);
  const ctxKayonBump = cKayonBump.getContext('2d');
  if (ctxKayon && ctxKayonBump) {
    const gKayon = ctxKayon.createRadialGradient(256, 280, 20, 256, 260, 280);
    gKayon.addColorStop(0, '#C82A1C');
    gKayon.addColorStop(0.38, '#DFB44E');
    gKayon.addColorStop(0.7, '#1D5E43');
    gKayon.addColorStop(1, '#E8BE54');
    ctxKayon.fillStyle = gKayon;
    ctxKayon.fillRect(0, 0, 512, 512);

    ctxKayonBump.fillStyle = '#787878';
    ctxKayonBump.fillRect(0, 0, 512, 512);

    for (let r = 18; r < 260; r += 16) {
      ctxKayon.strokeStyle = r % 32 === 0 ? 'rgba(188, 34, 22, 0.65)' : 'rgba(32, 18, 10, 0.58)';
      ctxKayon.lineWidth = 2;
      ctxKayon.beginPath();
      ctxKayon.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayon.stroke();

      ctxKayonBump.strokeStyle = '#E6E6E6';
      ctxKayonBump.lineWidth = 2.4;
      ctxKayonBump.beginPath();
      ctxKayonBump.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayonBump.stroke();
    }
  }

  // 5. Tekstur kain kelir dengan pendaran bundar lampu minyak Blencong di tengah panggung
  const cKelir = buatKanvas(1024, 512);
  const ctxKelir = cKelir.getContext('2d');
  if (ctxKelir) {
    const gradKelir = ctxKelir.createRadialGradient(512, 230, 30, 512, 256, 560);
    gradKelir.addColorStop(0, '#FFF5DC');
    gradKelir.addColorStop(0.38, '#EFE0BD');
    gradKelir.addColorStop(0.74, '#D2B88C');
    gradKelir.addColorStop(1, '#947850');
    ctxKelir.fillStyle = gradKelir;
    ctxKelir.fillRect(0, 0, 1024, 512);

    ctxKelir.strokeStyle = 'rgba(92, 68, 42, 0.06)';
    ctxKelir.lineWidth = 1;
    for (let y = 0; y < 512; y += 6) {
      ctxKelir.beginPath();
      ctxKelir.moveTo(0, y);
      ctxKelir.lineTo(1024, y);
      ctxKelir.stroke();
    }
    for (let x = 0; x < 1024; x += 6) {
      ctxKelir.beginPath();
      ctxKelir.moveTo(x, 0);
      ctxKelir.lineTo(x, 512);
      ctxKelir.stroke();
    }
  }

  const bungkus = (c: HTMLCanvasElement, srgb = true, repeat = 2.2) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  cacheTeksturSungging = {
    sunggingEmasDiff: bungkus(cEmas, true, 2.4),
    sunggingEmasBump: bungkus(cBump, false, 2.4),
    batikKampuhDiff: bungkus(cKampuh, true, 2.2),
    garudaPolikromDiff: bungkus(cGaruda, true, 1.8),
    kayonSunggingDiff: bungkus(cKayon, true, 1.4),
    kayonSunggingBump: bungkus(cKayonBump, false, 1.4),
    kelirBlencongDiff: bungkus(cKelir, true, 1.0),
  };
  return cacheTeksturSungging;
}

function buatLubangBundar(cx: number, cy: number, radius: number, segmen = 10): THREE.Path {
  const p = new THREE.Path();
  p.absarc(cx, cy, radius, 0, Math.PI * 2, false);
  return p;
}

// Membuat peniti sendi wayang (Gegel) dari tulang/kuningan seperti pada foto referensi
function buatSendiGegelWayang(
  emasMat: THREE.Material,
  putihTulangMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group();
  const cincinLuar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.017, 0.022, 16),
    putihTulangMat,
  );
  cincinLuar.rotation.x = Math.PI / 2;
  g.add(cincinLuar);

  const porosTengah = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.026, 12),
    emasMat,
  );
  porosTengah.rotation.x = Math.PI / 2;
  g.add(porosTengah);
  return g;
}

// Tokoh 1: Sri Rama / Satria Alus 3D (sesuai foto referensi Satria Gelung Supit Urang & Bokongan Sembuliyan)
export function bangunSriRamaRealistis3D(teksturs: KoleksiTeksturPBR): RigSriRama3D {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const kulitPradaMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.016,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.26,
    metalness: 0.78,
    clearcoat: 0.45,
  });

  const emasMurniMat = new THREE.MeshPhysicalMaterial({
    color: '#F5C95E',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.01,
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 0.52,
  });

  const kampuhBokonganMat = new THREE.MeshPhysicalMaterial({
    map: sungging.batikKampuhDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.014,
    roughness: 0.34,
    metalness: 0.28,
    clearcoat: 0.35,
  });

  const garudaPolikromMat = new THREE.MeshPhysicalMaterial({
    map: sungging.garudaPolikromDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.01,
    roughness: 0.3,
    metalness: 0.25,
    clearcoat: 0.4,
  });

  const hijauSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#17684F',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.009,
    roughness: 0.32,
    metalness: 0.38,
  });

  const merahMirahMat = new THREE.MeshPhysicalMaterial({
    color: '#CC2418',
    roughness: 0.2,
    metalness: 0.35,
    clearcoat: 0.72,
  });

  const hitamWajahMat = new THREE.MeshPhysicalMaterial({
    color: '#14100D',
    roughness: 0.24,
    metalness: 0.16,
    clearcoat: 0.65,
  });

  const putihSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#F8EFE0',
    roughness: 0.28,
    clearcoat: 0.5,
  });

  // Warna tanduk kerbau bule kuning-amber transparan seperti pada foto referensi 2
  const tandukCempuritMat = new THREE.MeshPhysicalMaterial({
    color: '#DDA03A',
    roughness: 0.22,
    metalness: 0.08,
    transmission: 0.18,
    thickness: 0.04,
    clearcoat: 0.78,
  });

  // 1. TORSO SATRIA (Bahu lebar bersudut tegas, pinggang ramping bangkekan, tatahan krawangan)
  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(-0.042, -0.14);
  torsoShape.bezierCurveTo(-0.052, -0.02, -0.085, 0.09, -0.115, 0.19);
  torsoShape.lineTo(-0.148, 0.215);
  torsoShape.lineTo(-0.035, 0.228);
  torsoShape.lineTo(0.035, 0.215);
  torsoShape.lineTo(0.185, 0.185);
  torsoShape.lineTo(0.165, 0.155);
  torsoShape.bezierCurveTo(0.095, 0.115, 0.048, 0.01, 0.038, -0.14);
  torsoShape.closePath();

  for (const [hx, hy, hr] of [
    [-0.035, 0.14, 0.011],
    [0.0, 0.15, 0.012],
    [0.042, 0.14, 0.011],
    [-0.022, 0.06, 0.01],
    [0.018, 0.06, 0.01],
    [-0.012, -0.02, 0.009],
    [0.012, -0.02, 0.009],
  ] as [number, number, number][]) {
    torsoShape.holes.push(buatLubangBundar(hx, hy, hr));
  }

  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.005,
    bevelSegments: 4,
  });
  const torsoMesh = new THREE.Mesh(torsoGeo, kulitPradaMat);
  torsoMesh.position.set(0, 0.11, -0.015);
  group.add(torsoMesh);

  // Detail pentil dada khas satria wayang kulit pada foto referensi 2
  const pentilDada = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 10, 10),
    hitamWajahMat,
  );
  pentilDada.position.set(-0.082, 0.225, 0.012);
  group.add(pentilDada);

  // Kalung Ulur / Penanggalan 3 susun berukir krawangan di dada (sesuai gambar referensi 1)
  for (let lapis = 0; lapis < 3; lapis++) {
    const kalung = new THREE.Mesh(
      new THREE.TorusGeometry(0.046 + lapis * 0.017, 0.0065, 10, 24, Math.PI * 1.05),
      lapis === 1 ? merahMirahMat : emasMurniMat,
    );
    kalung.rotation.z = Math.PI * 0.96;
    kalung.position.set(-0.015, 0.295 - lapis * 0.014, 0.02);
    group.add(kalung);
  }

  // Liontin meruncing Kalung Ulur di tengah dada
  const liontinKalung = new THREE.Mesh(
    new THREE.ConeGeometry(0.018, 0.065, 8),
    emasMurniMat,
  );
  liontinKalung.rotation.z = Math.PI;
  liontinKalung.position.set(-0.018, 0.19, 0.022);
  group.add(liontinKalung);

  // 2. KEPALA SATRIA LURUH, GELUNG SUPIT URANG BERKRAWANGAN, GARUDA MUNGKUR POLIKROM, & RAMBUT NGORE
  const kepalaGroup = new THREE.Group();
  kepalaGroup.position.set(-0.015, 0.34, 0.004);
  kepalaGroup.rotation.z = 0.08;

  // Siluet profil wajah Satria Luruh: hidung mancung meruncing (irung wali miring), bibir halus, dagu tegas
  const wajahShape = new THREE.Shape();
  wajahShape.moveTo(0.042, -0.055);
  wajahShape.lineTo(-0.032, -0.055);
  wajahShape.lineTo(-0.064, -0.032);
  wajahShape.lineTo(-0.054, -0.018);
  wajahShape.lineTo(-0.072, -0.008);
  wajahShape.lineTo(-0.06, 0.004);
  wajahShape.lineTo(-0.158, 0.002); // Ujung hidung mancung khas wayang satria
  wajahShape.lineTo(-0.068, 0.052);
  wajahShape.lineTo(0.048, 0.068);
  wajahShape.closePath();

  const wajahGeo = new THREE.ExtrudeGeometry(wajahShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 3,
  });
  const wajahMesh = new THREE.Mesh(wajahGeo, hitamWajahMat);
  wajahMesh.position.set(0, 0, -0.013);
  kepalaGroup.add(wajahMesh);

  // Garis sunggingan emas & merah pada wajah hitam (mata liyep, alis, & pilis pipi sesuai foto 2)
  const mataLiyep = new THREE.Mesh(
    new THREE.ConeGeometry(0.009, 0.042, 10),
    emasMurniMat,
  );
  mataLiyep.rotation.z = Math.PI / 2 + 0.18;
  mataLiyep.position.set(-0.058, 0.022, 0.016);
  kepalaGroup.add(mataLiyep);

  const alisCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 0.032, 0.016),
    new THREE.Vector3(-0.052, 0.042, 0.017),
    new THREE.Vector3(-0.018, 0.034, 0.016),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(alisCurve, 14, 0.0035, 8, false), emasMurniMat),
  );

  const ukirPipiCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.062, -0.022, 0.016),
    new THREE.Vector3(-0.028, -0.012, 0.017),
    new THREE.Vector3(-0.012, 0.01, 0.017),
    new THREE.Vector3(-0.026, 0.025, 0.016),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(ukirPipiCurve, 16, 0.0038, 8, false), emasMurniMat),
  );

  const bibirMerah = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.006, 0.03),
    merahMirahMat,
  );
  bibirMerah.position.set(-0.06, -0.014, 0);
  kepalaGroup.add(bibirMerah);

  // Jamang 3 susun & Sumping Sekar Kluwih polikrom (merah-putih-hijau-emas sesuai foto 2)
  const sumpingShape = new THREE.Shape();
  sumpingShape.moveTo(-0.015, -0.015);
  sumpingShape.bezierCurveTo(0.025, 0.01, 0.068, 0.065, 0.052, 0.125);
  sumpingShape.bezierCurveTo(0.032, 0.145, -0.01, 0.11, -0.035, 0.062);
  sumpingShape.closePath();
  const sumpingGeo = new THREE.ExtrudeGeometry(sumpingShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  const sumpingMesh = new THREE.Mesh(sumpingGeo, garudaPolikromMat);
  sumpingMesh.position.set(0, 0, -0.016);
  kepalaGroup.add(sumpingMesh);

  // Pita melengkung Garuda Mungkur polikrom mengelilingi pangkal sanggul (sesuai foto 2)
  const pitaGarudaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, -0.025, 0),
    new THREE.Vector3(0.095, 0.015, 0),
    new THREE.Vector3(0.115, 0.095, 0),
    new THREE.Vector3(0.065, 0.155, 0),
    new THREE.Vector3(0.005, 0.145, 0),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(pitaGarudaCurve, 24, 0.018, 12, false), garudaPolikromMat),
  );

  // Gelung Supit Urang (capit udang melengkung tinggi dengan lubang-lubang krawangan sesuai gambar 1 & 2)
  const gelungShape = new THREE.Shape();
  gelungShape.moveTo(0.01, 0.055);
  gelungShape.bezierCurveTo(0.12, 0.06, 0.195, 0.15, 0.175, 0.255);
  gelungShape.bezierCurveTo(0.155, 0.34, 0.065, 0.375, -0.005, 0.335);
  gelungShape.bezierCurveTo(-0.045, 0.305, -0.038, 0.25, 0.0, 0.255);
  gelungShape.bezierCurveTo(0.028, 0.26, 0.035, 0.295, 0.065, 0.295);
  gelungShape.bezierCurveTo(0.105, 0.295, 0.115, 0.225, 0.085, 0.175);
  gelungShape.bezierCurveTo(0.06, 0.135, 0.02, 0.115, -0.01, 0.095);
  gelungShape.closePath();

  for (const [gx, gy, gr] of [
    [0.095, 0.125, 0.009],
    [0.128, 0.165, 0.01],
    [0.142, 0.215, 0.01],
    [0.132, 0.265, 0.009],
    [0.102, 0.305, 0.009],
    [0.058, 0.325, 0.008],
    [0.018, 0.315, 0.007],
  ] as [number, number, number][]) {
    gelungShape.holes.push(buatLubangBundar(gx, gy, gr, 10));
  }

  const gelungGeo = new THREE.ExtrudeGeometry(gelungShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  const gelungMesh = new THREE.Mesh(gelungGeo, hitamWajahMat);
  gelungMesh.position.set(0, 0, -0.012);
  kepalaGroup.add(gelungMesh);

  // Untaian rambut ikal (Kandha / Ngore) menjuntai di tengkuk sampai punggung bahu (sesuai gambar 1)
  const rambutNgoreCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.038, -0.035, 0),
    new THREE.Vector3(0.082, -0.068, 0),
    new THREE.Vector3(0.132, -0.092, 0),
    new THREE.Vector3(0.175, -0.105, 0),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(rambutNgoreCurve, 18, 0.014, 10, false), hitamWajahMat),
  );

  group.add(kepalaGroup);

  // 3. KAIN DODOT BOKONGAN SEMBULIYAN, MANGGARAN, PENDING EMAS, & UNCAL KENCANA BERKRAWANGAN
  // Pending (gesper sabuk emas berukir di pinggang)
  const pendingSabuk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.042, 20),
    emasMurniMat,
  );
  pendingSabuk.scale.set(1.0, 1.0, 0.52);
  pendingSabuk.position.set(-0.005, -0.02, 0.004);
  group.add(pendingSabuk);

  // Manggaran / Kunca (sirip kain berlekuk yang mencuat ke atas di belakang pinggang, sesuai gambar 1 & 2)
  const manggaranShape = new THREE.Shape();
  manggaranShape.moveTo(0.02, -0.04);
  manggaranShape.bezierCurveTo(0.08, 0.02, 0.145, 0.075, 0.175, 0.115);
  manggaranShape.bezierCurveTo(0.185, 0.065, 0.155, 0.015, 0.165, -0.01);
  manggaranShape.bezierCurveTo(0.14, -0.045, 0.095, -0.075, 0.035, -0.09);
  manggaranShape.closePath();
  manggaranShape.holes.push(buatLubangBundar(0.115, 0.03, 0.01));
  manggaranShape.holes.push(buatLubangBundar(0.142, 0.065, 0.009));

  const manggaranGeo = new THREE.ExtrudeGeometry(manggaranShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  const manggaranMesh = new THREE.Mesh(manggaranGeo, garudaPolikromMat);
  manggaranMesh.position.set(0, 0, -0.013);
  group.add(manggaranMesh);

  // Dodot Bokongan Sembuliyan (lengkungan besar membulat di belakang & lipatan wiru berlapis di depan sesuai foto 1 & 2)
  const dodotShape = new THREE.Shape();
  dodotShape.moveTo(-0.115, -0.25);
  dodotShape.bezierCurveTo(-0.105, -0.14, -0.075, -0.05, -0.055, -0.01);
  dodotShape.lineTo(0.055, -0.01);
  // Lengkungan besar Bokongan di sisi kanan/belakang
  dodotShape.bezierCurveTo(0.165, -0.05, 0.255, -0.14, 0.245, -0.255);
  dodotShape.bezierCurveTo(0.235, -0.345, 0.145, -0.38, 0.045, -0.355);
  dodotShape.bezierCurveTo(0.005, -0.34, -0.025, -0.24, -0.055, -0.24);
  dodotShape.bezierCurveTo(-0.075, -0.24, -0.095, -0.275, -0.115, -0.25);
  dodotShape.closePath();

  for (const [dx, dy, dr] of [
    [0.095, -0.15, 0.013],
    [0.155, -0.18, 0.014],
    [0.185, -0.24, 0.014],
    [0.145, -0.29, 0.013],
    [0.085, -0.28, 0.012],
    [-0.045, -0.14, 0.011],
  ] as [number, number, number][]) {
    dodotShape.holes.push(buatLubangBundar(dx, dy, dr, 10));
  }

  const dodotGeo = new THREE.ExtrudeGeometry(dodotShape, {
    depth: 0.034,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 4,
  });
  const dodotMesh = new THREE.Mesh(dodotGeo, kampuhBokonganMat);
  dodotMesh.position.set(0, 0, -0.017);
  group.add(dodotMesh);

  // Uncal Kencana & Sampur berlekuk-lekuk krawangan di antara kedua kaki (sesuai gambar 1)
  const buatUncalBerlekuk = (xPos: number, zPos: number, mat: THREE.Material) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(xPos, -0.12, zPos);

    const uShape = new THREE.Shape();
    uShape.moveTo(-0.022, 0);
    uShape.bezierCurveTo(-0.048, -0.08, -0.015, -0.16, -0.052, -0.24);
    uShape.bezierCurveTo(-0.025, -0.32, 0.015, -0.39, 0.042, -0.42);
    uShape.bezierCurveTo(0.058, -0.35, 0.025, -0.26, 0.048, -0.18);
    uShape.bezierCurveTo(0.022, -0.1, 0.038, -0.04, 0.018, 0);
    uShape.closePath();
    uShape.holes.push(buatLubangBundar(-0.005, -0.14, 0.009));
    uShape.holes.push(buatLubangBundar(0.008, -0.26, 0.009));

    const uGeo = new THREE.ExtrudeGeometry(uShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    const uMesh = new THREE.Mesh(uGeo, mat);
    uMesh.position.z = -0.009;
    uGroup.add(uMesh);
    return uGroup;
  };

  const uncalDepan = buatUncalBerlekuk(-0.018, 0.018, kulitPradaMat);
  const uncalBelakang = buatUncalBerlekuk(0.115, -0.012, kulitPradaMat);
  group.add(uncalDepan);
  group.add(uncalBelakang);

  // 4. SEPASANG KAKI PAHAT PIPIH, GELANG KRONCONG, JARI KAKI, & LEMAHAN MERAH (sesuai gambar 1 & 2)
  for (const [xKaki, rotKaki, zKaki] of [
    [-0.082, 0.05, 0.008],
    [0.068, 0.12, -0.008],
  ] as [number, number, number][]) {
    const kakiGroup = new THREE.Group();
    kakiGroup.position.set(xKaki, -0.24, zKaki);
    kakiGroup.rotation.z = rotKaki;

    const kakiShape = new THREE.Shape();
    kakiShape.moveTo(-0.018, 0);
    kakiShape.lineTo(0.02, 0);
    kakiShape.lineTo(0.014, -0.29);
    kakiShape.lineTo(0.032, -0.335);
    kakiShape.lineTo(-0.068, -0.335);
    kakiShape.lineTo(-0.068, -0.305);
    kakiShape.lineTo(-0.014, -0.285);
    kakiShape.closePath();

    const kakiGeo = new THREE.ExtrudeGeometry(kakiShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    });
    const kakiMesh = new THREE.Mesh(kakiGeo, kulitPradaMat);
    kakiMesh.position.z = -0.011;
    kakiGroup.add(kakiMesh);

    // Gelang kaki Kroncong naga bersusun di pergelangan kaki
    for (const yKroncong of [-0.245, -0.27]) {
      const kroncong = new THREE.Mesh(
        new THREE.TorusGeometry(0.022, 0.0055, 8, 16),
        emasMurniMat,
      );
      kroncong.rotation.x = Math.PI / 2;
      kroncong.position.set(0, yKroncong, 0);
      kakiGroup.add(kroncong);
    }

    // Garis jari-jari kaki hitam-putih seperti pada foto referensi 2
    for (let j = 0; j < 4; j++) {
      const garisJari = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.0035, 0.028),
        j % 2 === 0 ? hitamWajahMat : putihSunggingMat,
      );
      garisJari.position.set(-0.056, -0.312 - j * 0.0055, 0);
      kakiGroup.add(garisJari);
    }

    group.add(kakiGroup);
  }

  // Lemahan merah (pijakan penghubung telapak kaki depan dan belakang khas wayang kulit sesuai foto 2)
  const lemahanMerah = new THREE.Mesh(
    new THREE.BoxGeometry(0.145, 0.024, 0.02),
    merahMirahMat,
  );
  lemahanMerah.position.set(-0.01, -0.562, 0);
  group.add(lemahanMerah);

  // 5. LENGAN 2 RUAS PAHAT PIPIH, GEGEL SENDI, KELAT BAHU, GELANG KANA, TANGAN NYEMPURIT, & TUDING
  const buatLenganAtasPipih = () => {
    const s = new THREE.Shape();
    s.moveTo(-0.015, 0.012);
    s.lineTo(0.015, 0.012);
    s.lineTo(0.012, -0.23);
    s.lineTo(-0.012, -0.23);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    const m = new THREE.Mesh(g, kulitPradaMat);
    m.position.z = -0.008;
    return m;
  };

  const buatLenganBawahDanTangan = () => {
    const s = new THREE.Shape();
    s.moveTo(-0.013, 0.01);
    s.lineTo(0.013, 0.01);
    s.lineTo(0.01, -0.21);
    // Jari tangan melengkung lentik (Nyempurit / Ngithing) sesuai gambar 1
    s.lineTo(-0.032, -0.235);
    s.lineTo(-0.068, -0.215);
    s.lineTo(-0.062, -0.202);
    s.lineTo(-0.025, -0.212);
    s.lineTo(-0.048, -0.192);
    s.lineTo(-0.011, -0.195);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    const m = new THREE.Mesh(g, kulitPradaMat);
    m.position.z = -0.0075;
    return m;
  };

  // Lengan Depan (Bahu Kiri di layar)
  const bahuDepan = new THREE.Group();
  bahuDepan.position.set(-0.125, 0.305, 0.022);
  bahuDepan.rotation.z = -0.22;

  bahuDepan.add(buatSendiGegelWayang(emasMurniMat, putihSunggingMat));
  bahuDepan.add(buatLenganAtasPipih());

  // Kelat Bahu berukir naga di lengan atas (sesuai gambar 1)
  for (const yKb of [-0.075, -0.095]) {
    const kelatBahu = new THREE.Mesh(
      new THREE.TorusGeometry(0.02, 0.0055, 8, 16),
      emasMurniMat,
    );
    kelatBahu.rotation.x = Math.PI / 2;
    kelatBahu.position.set(0, yKb, 0);
    bahuDepan.add(kelatBahu);
  }

  const sikuDepan = new THREE.Group();
  sikuDepan.position.set(0, -0.22, 0.004);
  sikuDepan.rotation.z = -0.78;

  sikuDepan.add(buatSendiGegelWayang(emasMurniMat, putihSunggingMat));
  sikuDepan.add(buatLenganBawahDanTangan());

  // Gelang Kana ganda di pergelangan tangan (sesuai gambar 1)
  for (const yGelang of [-0.165, -0.185]) {
    const gelang = new THREE.Mesh(
      new THREE.TorusGeometry(0.017, 0.005, 8, 16),
      emasMurniMat,
    );
    gelang.rotation.x = Math.PI / 2;
    gelang.position.set(0, yGelang, 0);
    sikuDepan.add(gelang);
  }

  // Busur Gendewa & Tali Busur pada tangan depan
  const busurCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, -0.42, 0.012),
    new THREE.Vector3(-0.09, -0.32, 0.012),
    new THREE.Vector3(-0.15, -0.21, 0.012),
    new THREE.Vector3(-0.09, -0.1, 0.012),
    new THREE.Vector3(0.08, 0.0, 0.012),
  ]);
  const busurMesh = new THREE.Mesh(
    new THREE.TubeGeometry(busurCurve, 32, 0.011, 10, false),
    emasMurniMat,
  );
  sikuDepan.add(busurMesh);

  const taliPoints = [
    new THREE.Vector3(0.08, 0.0, 0.012),
    new THREE.Vector3(0.16, -0.21, 0.012),
    new THREE.Vector3(0.08, -0.42, 0.012),
  ];
  const taliBusurLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(taliPoints),
    new THREE.LineBasicMaterial({ color: '#FFF0B8' }),
  );
  sikuDepan.add(taliBusurLine);

  // Tangkai Tuding Depan yang menggantung vertikal dari ujung jari tangan (sesuai gambar 1 & 2)
  const tudingDepanGroup = new THREE.Group();
  tudingDepanGroup.position.set(-0.045, -0.215, 0.006);
  tudingDepanGroup.rotation.z = 1.0; // Menjaga tuding mengarah ke bawah menuju tangan Dalang
  const batangTudingDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0065, 0.68, 10),
    tandukCempuritMat,
  );
  batangTudingDepan.position.set(0, -0.34, 0);
  tudingDepanGroup.add(batangTudingDepan);
  sikuDepan.add(tudingDepanGroup);

  bahuDepan.add(sikuDepan);
  group.add(bahuDepan);

  // Lengan Belakang (Bahu Kanan di layar, berartikulasi penuh seperti gambar 1 & 2)
  const bahuBelakang = new THREE.Group();
  bahuBelakang.position.set(0.16, 0.285, 0.018);
  bahuBelakang.rotation.z = 0.42;

  bahuBelakang.add(buatSendiGegelWayang(emasMurniMat, putihSunggingMat));
  bahuBelakang.add(buatLenganAtasPipih());

  for (const yKb of [-0.075, -0.095]) {
    const kelatBahuB = new THREE.Mesh(
      new THREE.TorusGeometry(0.02, 0.0055, 8, 16),
      emasMurniMat,
    );
    kelatBahuB.rotation.x = Math.PI / 2;
    kelatBahuB.position.set(0, yKb, 0);
    bahuBelakang.add(kelatBahuB);
  }

  const sikuBelakang = new THREE.Group();
  sikuBelakang.position.set(0, -0.22, 0.004);
  sikuBelakang.rotation.z = -1.18;

  sikuBelakang.add(buatSendiGegelWayang(emasMurniMat, putihSunggingMat));
  sikuBelakang.add(buatLenganBawahDanTangan());

  for (const yGelang of [-0.165, -0.185]) {
    const gelangB = new THREE.Mesh(
      new THREE.TorusGeometry(0.017, 0.005, 8, 16),
      emasMurniMat,
    );
    gelangB.rotation.x = Math.PI / 2;
    gelangB.position.set(0, yGelang, 0);
    sikuBelakang.add(gelangB);
  }

  const tudingBelakangGroup = new THREE.Group();
  tudingBelakangGroup.position.set(-0.045, -0.215, 0.006);
  tudingBelakangGroup.rotation.z = 0.76;
  const batangTudingBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0065, 0.64, 10),
    tandukCempuritMat,
  );
  batangTudingBelakang.position.set(0, -0.32, 0);
  tudingBelakangGroup.add(batangTudingBelakang);
  sikuBelakang.add(tudingBelakangGroup);

  bahuBelakang.add(sikuBelakang);
  group.add(bahuBelakang);

  // 6. CEMPURIT / GAPIT TANDUK KERBAU MELENGKUNG S (S-CURVE) & HULU BUBUTAN (sesuai foto referensi 2)
  const kurvaCempuritS = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.045, 0.42, 0.022),
    new THREE.Vector3(0.015, 0.34, 0.024),
    new THREE.Vector3(0.012, 0.16, 0.024),
    new THREE.Vector3(-0.008, -0.02, 0.024),
    new THREE.Vector3(0.022, -0.24, 0.024),
    new THREE.Vector3(0.015, -0.56, 0.022),
    new THREE.Vector3(0.015, -0.88, 0.018),
  ]);
  const cempuritMesh = new THREE.Mesh(
    new THREE.TubeGeometry(kurvaCempuritS, 40, 0.011, 12, false),
    tandukCempuritMat,
  );
  group.add(cempuritMesh);

  // Hulu pegangan Cempurit berbubut cincin (seperti bagian bawah foto referensi 2)
  const huluCempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.013, 0.24, 14),
    tandukCempuritMat,
  );
  huluCempurit.position.set(0.015, -0.74, 0.02);
  group.add(huluCempurit);

  for (const yRing of [-0.63, -0.66, -0.82]) {
    const cincinBubut = new THREE.Mesh(
      new THREE.TorusGeometry(0.017, 0.004, 8, 16),
      tandukCempuritMat,
    );
    cincinBubut.rotation.x = Math.PI / 2;
    cincinBubut.position.set(0.015, yRing, 0.02);
    group.add(cincinBubut);
  }

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
    tudingDepanGroup,
    bahuBelakang,
    sikuBelakang,
    tudingBelakangGroup,
    taliBusurLine,
    uncalDepan,
    uncalBelakang,
  };
}

// Tokoh 2: Kidang Kencana (Kijang Emas Marica 3D berpahat krawangan dan 4 kaki berartikulasi)
export function bangunKidangKencanaRealistis3D(
  teksturs: KoleksiTeksturPBR,
): RigKidangKencana3D {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const emasKidangMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.015,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.48, 0.48),
    roughness: 0.2,
    metalness: 0.88,
    clearcoat: 0.48,
  });

  const pelanaPolikromMat = new THREE.MeshPhysicalMaterial({
    map: sungging.batikKampuhDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.012,
    roughness: 0.3,
    metalness: 0.35,
  });

  const permataMirahMat = new THREE.MeshPhysicalMaterial({
    color: '#C61F15',
    roughness: 0.16,
    metalness: 0.48,
    clearcoat: 0.78,
  });

  const permataZamrudMat = new THREE.MeshPhysicalMaterial({
    color: '#167058',
    roughness: 0.2,
    metalness: 0.42,
    clearcoat: 0.68,
  });

  const tandukCempuritMat = new THREE.MeshPhysicalMaterial({
    color: '#DDA03A',
    roughness: 0.24,
    clearcoat: 0.72,
  });

  const badanShape = new THREE.Shape();
  badanShape.moveTo(-0.24, -0.02);
  badanShape.bezierCurveTo(-0.14, -0.095, 0.08, -0.085, 0.22, -0.03);
  badanShape.bezierCurveTo(0.285, 0.04, 0.265, 0.145, 0.16, 0.165);
  badanShape.bezierCurveTo(0.02, 0.12, -0.12, 0.145, -0.23, 0.115);
  badanShape.bezierCurveTo(-0.285, 0.07, -0.285, 0.01, -0.24, -0.02);
  badanShape.closePath();

  for (const [hx, hy, hr] of [
    [-0.16, 0.04, 0.015],
    [-0.09, 0.06, 0.016],
    [-0.02, 0.04, 0.017],
    [0.05, 0.06, 0.016],
    [0.12, 0.04, 0.015],
    [-0.05, 0.0, 0.012],
    [0.04, 0.0, 0.012],
  ] as [number, number, number][]) {
    badanShape.holes.push(buatLubangBundar(hx, hy, hr));
  }

  const badanGeo = new THREE.ExtrudeGeometry(badanShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.007,
    bevelSegments: 4,
  });
  badanGeo.center();
  const badanMesh = new THREE.Mesh(badanGeo, emasKidangMat);
  badanMesh.position.set(0, 0.08, 0);
  group.add(badanMesh);

  // Pelana sungging polikrom di punggung Kidang Kencana
  const pelanaMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.046, 18, 1, false, 0, Math.PI),
    pelanaPolikromMat,
  );
  pelanaMesh.rotation.x = Math.PI / 2;
  pelanaMesh.position.set(-0.01, 0.095, 0);
  group.add(pelanaMesh);

  for (const [idx, [px, py]] of [
    [-0.14, 0.11],
    [-0.05, 0.125],
    [0.05, 0.115],
    [0.14, 0.12],
  ].entries()) {
    const permata = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.017, 1),
      idx % 2 === 0 ? permataMirahMat : permataZamrudMat,
    );
    permata.position.set(px, py, 0.025);
    group.add(permata);
  }

  const leherKepalaGroup = new THREE.Group();
  leherKepalaGroup.position.set(0.18, 0.14, 0);

  const leherCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.062, 0.105, 0),
    new THREE.Vector3(0.082, 0.215, 0),
  ]);
  const leherMesh = new THREE.Mesh(
    new THREE.TubeGeometry(leherCurve, 20, 0.036, 14, false),
    emasKidangMat,
  );
  leherKepalaGroup.add(leherMesh);

  const kalungKijang = new THREE.Mesh(
    new THREE.TorusGeometry(0.044, 0.009, 10, 22),
    permataMirahMat,
  );
  kalungKijang.rotation.x = Math.PI / 2 - 0.35;
  kalungKijang.position.set(0.045, 0.08, 0);
  leherKepalaGroup.add(kalungKijang);

  const gentaEmas = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 12, 12),
    emasKidangMat,
  );
  gentaEmas.position.set(0.092, 0.06, 0);
  leherKepalaGroup.add(gentaEmas);

  const kepalaShape = new THREE.Shape();
  kepalaShape.moveTo(0.03, 0.18);
  kepalaShape.lineTo(0.21, 0.188);
  kepalaShape.lineTo(0.188, 0.232);
  kepalaShape.lineTo(0.09, 0.268);
  kepalaShape.lineTo(0.02, 0.242);
  kepalaShape.closePath();

  const kepalaGeo = new THREE.ExtrudeGeometry(kepalaShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  const kepalaMesh = new THREE.Mesh(kepalaGeo, emasKidangMat);
  kepalaMesh.position.set(0, 0, -0.014);
  leherKepalaGroup.add(kepalaMesh);

  const mataKijang = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    permataMirahMat,
  );
  mataKijang.position.set(0.09, 0.226, 0.019);
  leherKepalaGroup.add(mataKijang);

  for (const [zTel, rotTel] of [
    [0.016, 0.45],
    [-0.016, 0.65],
  ] as [number, number][]) {
    const telinga = new THREE.Mesh(
      new THREE.ConeGeometry(0.015, 0.078, 10),
      emasKidangMat,
    );
    telinga.position.set(0.03, 0.272, zTel);
    telinga.rotation.z = rotTel;
    leherKepalaGroup.add(telinga);
  }

  // Ranggah Kencana (tanduk emas bercabang 3 tingkat dengan kuncup permata mirah)
  const batangTandukUtama = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.06, 0.25, 0),
    new THREE.Vector3(0.0, 0.36, 0.012),
    new THREE.Vector3(-0.085, 0.455, 0),
    new THREE.Vector3(-0.02, 0.55, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(batangTandukUtama, 26, 0.011, 10, false), emasKidangMat),
  );

  const cabangTanduk1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, 0.34, 0),
    new THREE.Vector3(0.072, 0.415, 0.012),
    new THREE.Vector3(0.095, 0.465, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(cabangTanduk1, 16, 0.008, 8, false), emasKidangMat),
  );

  const cabangTanduk2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0.42, 0),
    new THREE.Vector3(0.022, 0.485, -0.012),
    new THREE.Vector3(0.042, 0.535, 0),
  ]);
  leherKepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(cabangTanduk2, 16, 0.0075, 8, false), emasKidangMat),
  );

  for (const [tx, ty] of [
    [-0.02, 0.55],
    [0.095, 0.465],
    [0.042, 0.535],
  ] as [number, number][]) {
    const kuncup = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 10, 10),
      permataMirahMat,
    );
    kuncup.position.set(tx, ty, 0);
    leherKepalaGroup.add(kuncup);
  }

  group.add(leherKepalaGroup);

  const ekorGroup = new THREE.Group();
  ekorGroup.position.set(-0.24, 0.14, 0);
  const ekorMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.024, 0.11, 10),
    emasKidangMat,
  );
  ekorMesh.rotation.z = 0.75;
  ekorMesh.position.set(-0.03, 0.03, 0);
  ekorGroup.add(ekorMesh);
  group.add(ekorGroup);

  const buatKakiKijang = (xPos: number, zPos: number, kemiringanAwal: number) => {
    const kGroup = new THREE.Group();
    kGroup.position.set(xPos, 0.03, zPos);

    const paha = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.014, 0.165, 12),
      emasKidangMat,
    );
    paha.position.set(0, -0.07, 0);
    paha.rotation.z = kemiringanAwal;
    kGroup.add(paha);

    const lutut = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 10, 10),
      permataZamrudMat,
    );
    lutut.position.set(kemiringanAwal * 0.08, -0.15, 0);
    kGroup.add(lutut);

    const betis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.009, 0.185, 12),
      emasKidangMat,
    );
    betis.position.set(kemiringanAwal * 0.04, -0.23, 0);
    betis.rotation.z = -kemiringanAwal * 0.6;
    kGroup.add(betis);

    const teracak = new THREE.Mesh(
      new THREE.ConeGeometry(0.015, 0.03, 8),
      permataMirahMat,
    );
    teracak.position.set(0.01, -0.32, 0);
    kGroup.add(teracak);

    return kGroup;
  };

  const kakiDepanKiri = buatKakiKijang(0.16, 0.02, 0.24);
  const kakiDepanKanan = buatKakiKijang(0.14, -0.02, -0.18);
  const kakiBelakangKiri = buatKakiKijang(-0.16, 0.02, -0.24);
  const kakiBelakangKanan = buatKakiKijang(-0.18, -0.02, 0.18);

  group.add(kakiDepanKiri);
  group.add(kakiDepanKanan);
  group.add(kakiBelakangKiri);
  group.add(kakiBelakangKanan);

  // Cempurit tanduk kerbau kuning-amber
  const cempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.014, 1.34, 12),
    tandukCempuritMat,
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

// Tokoh 3: Gunungan / Kayon 3D (sesuai foto referensi 3: Pohon Kalpataru, Banaspati bermata bundar, Gapura Bersayap)
export function bangunGununganKayonRealistis3D(
  teksturs: KoleksiTeksturPBR,
  skala = 1.0,
): THREE.Group {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const kayonDasarMat = new THREE.MeshPhysicalMaterial({
    map: sungging.kayonSunggingDiff,
    bumpMap: sungging.kayonSunggingBump,
    bumpScale: 0.022,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.28,
    metalness: 0.6,
    clearcoat: 0.42,
  });

  const emasPradaMat = new THREE.MeshPhysicalMaterial({
    color: '#F2C556',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.012,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.48,
  });

  const merahSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#B82418',
    roughness: 0.3,
    metalness: 0.32,
  });

  const hijauRimbaMat = new THREE.MeshPhysicalMaterial({
    color: '#185A42',
    roughness: 0.32,
    metalness: 0.3,
  });

  const hitamGarisMat = new THREE.MeshPhysicalMaterial({
    color: '#16110D',
    roughness: 0.28,
  });

  const putihMataMat = new THREE.MeshPhysicalMaterial({
    color: '#FAF0DD',
    roughness: 0.24,
  });

  const tandukMat = new THREE.MeshPhysicalMaterial({
    color: '#DDA03A',
    roughness: 0.25,
    clearcoat: 0.68,
  });

  // Bentuk meruncing segitiga lengkung Gunungan Blumbangan seperti pada foto referensi 3
  const kayonShape = new THREE.Shape();
  kayonShape.moveTo(0, -0.54);
  kayonShape.lineTo(0.25, -0.5);
  kayonShape.bezierCurveTo(0.39, -0.22, 0.36, 0.14, 0.19, 0.44);
  kayonShape.bezierCurveTo(0.1, 0.59, 0.04, 0.68, 0, 0.76);
  kayonShape.bezierCurveTo(-0.04, 0.68, -0.1, 0.59, -0.19, 0.44);
  kayonShape.bezierCurveTo(-0.36, 0.14, -0.39, -0.22, -0.25, -0.5);
  kayonShape.closePath();

  for (const [hx, hy, hr] of [
    [-0.14, 0.08, 0.021],
    [0.14, 0.08, 0.021],
    [-0.19, -0.06, 0.02],
    [0.19, -0.06, 0.02],
    [-0.13, 0.24, 0.02],
    [0.13, 0.24, 0.02],
    [-0.08, 0.4, 0.018],
    [0.08, 0.4, 0.018],
    [0.0, 0.54, 0.017],
    [-0.22, -0.22, 0.018],
    [0.22, -0.22, 0.018],
  ] as [number, number, number][]) {
    kayonShape.holes.push(buatLubangBundar(hx, hy, hr, 12));
  }

  const kayonGeo = new THREE.ExtrudeGeometry(kayonShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.009,
    bevelSize: 0.007,
    bevelSegments: 4,
  });
  kayonGeo.center();
  const kayonMesh = new THREE.Mesh(kayonGeo, kayonDasarMat);
  group.add(kayonMesh);

  // Bingkai lidah api emas (Geni Murub) di sekeliling tepi Gunungan
  const apiKelilingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, -0.46, 0.02),
    new THREE.Vector3(-0.34, -0.12, 0.02),
    new THREE.Vector3(-0.27, 0.22, 0.02),
    new THREE.Vector3(-0.13, 0.48, 0.02),
    new THREE.Vector3(0, 0.72, 0.02),
    new THREE.Vector3(0.13, 0.48, 0.02),
    new THREE.Vector3(0.27, 0.22, 0.02),
    new THREE.Vector3(0.34, -0.12, 0.02),
    new THREE.Vector3(0.24, -0.46, 0.02),
  ]);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(apiKelilingCurve, 48, 0.012, 10, false), emasPradaMat),
  );

  // Relief Gapura Bersayap (Lar-laran) & tangga bertingkat di dasar Gunungan (sesuai foto referensi 3)
  for (let t = 0; t < 3; t++) {
    const undakan = new THREE.Mesh(
      new THREE.BoxGeometry(0.34 - t * 0.05, 0.03, 0.05),
      emasPradaMat,
    );
    undakan.position.set(0, -0.46 + t * 0.032, 0.008);
    group.add(undakan);
  }

  const badanGapura = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.19, 0.048),
    merahSunggingMat,
  );
  badanGapura.position.set(0, -0.28, 0.008);
  group.add(badanGapura);

  const pintuGapuraEmas = new THREE.Mesh(
    new THREE.BoxGeometry(0.088, 0.145, 0.054),
    emasPradaMat,
  );
  pintuGapuraEmas.position.set(0, -0.29, 0.01);
  group.add(pintuGapuraEmas);

  for (let a = 0; a < 3; a++) {
    const atapGapura = new THREE.Mesh(
      new THREE.BoxGeometry(0.26 - a * 0.05, 0.024, 0.056),
      emasPradaMat,
    );
    atapGapura.position.set(0, -0.16 + a * 0.026, 0.01);
    group.add(atapGapura);
  }

  // Sayap Lar-laran di kiri-kanan Gapura
  for (const sisi of [-1, 1]) {
    const sayapGapura = new THREE.Mesh(
      new THREE.ConeGeometry(0.048, 0.16, 8),
      emasPradaMat,
    );
    sayapGapura.rotation.z = -sisi * 0.72;
    sayapGapura.position.set(sisi * 0.16, -0.24, 0.022);
    group.add(sayapGapura);
  }

  // Relief Wajah Banaspati / Kala Makara bermata bundar besar di tengah pohon (sesuai foto referensi 3)
  const kalaHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.078, 18, 16),
    merahSunggingMat,
  );
  kalaHead.scale.set(1.32, 0.96, 0.62);
  kalaHead.position.set(0, -0.01, 0.022);
  group.add(kalaHead);

  for (const sisiMata of [-1, 1]) {
    const lingkarMata = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16),
      emasPradaMat,
    );
    lingkarMata.rotation.x = Math.PI / 2;
    lingkarMata.position.set(sisiMata * 0.038, -0.02, 0.054);
    group.add(lingkarMata);

    const bolaMataPutih = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.024, 14),
      putihMataMat,
    );
    bolaMataPutih.rotation.x = Math.PI / 2;
    bolaMataPutih.position.set(sisiMata * 0.038, -0.02, 0.055);
    group.add(bolaMataPutih);

    const manikHitam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.028, 12),
      hitamGarisMat,
    );
    manikHitam.rotation.x = Math.PI / 2;
    manikHitam.position.set(sisiMata * 0.038, -0.02, 0.056);
    group.add(manikHitam);
  }

  // Batang dan sulur cabang pohon Kalpataru
  const batangKalpataru = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.028, 0.56, 12),
    emasPradaMat,
  );
  batangKalpataru.position.set(0, 0.25, 0.022);
  group.add(batangKalpataru);

  for (const sisi of [-1, 1]) {
    const cabangCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.06, 0.024),
      new THREE.Vector3(sisi * 0.1, 0.16, 0.026),
      new THREE.Vector3(sisi * 0.2, 0.14, 0.024),
      new THREE.Vector3(sisi * 0.14, 0.32, 0.026),
      new THREE.Vector3(sisi * 0.06, 0.46, 0.024),
    ]);
    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(cabangCurve, 28, 0.01, 8, false), hijauRimbaMat),
    );
  }

  const mustakaKayon = new THREE.Mesh(
    new THREE.ConeGeometry(0.036, 0.11, 10),
    merahSunggingMat,
  );
  mustakaKayon.position.set(0, 0.65, 0.024);
  group.add(mustakaKayon);

  const cempurit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.016, 1.46, 12),
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

let cachePrototipeSimpingan: THREE.Group | null = null;

// Tokoh Pendamping Simpingan Wayang di tepi kiri & kanan Kelir (sesuai foto referensi 3)
export function bangunSimpinganWayang3D(
  teksturs: KoleksiTeksturPBR,
  arahHadap: 1 | -1,
): THREE.Group {
  if (!cachePrototipeSimpingan) {
    cachePrototipeSimpingan = bangunSriRamaRealistis3D(teksturs).group;
    cachePrototipeSimpingan.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });
  }
  const group = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const wayangSimping = cachePrototipeSimpingan.clone();
    const skala = 0.76 - i * 0.08;
    wayangSimping.scale.set(arahHadap * skala, skala, skala);
    wayangSimping.position.set(i * arahHadap * -0.24, -0.06 - i * 0.04, -0.08 - i * 0.04);
    wayangSimping.rotation.z = arahHadap * (-0.06 - i * 0.03);
    group.add(wayangSimping);
  }
  return group;
}
