// Pembangun geometri 3D tatah-sungging Wayang Kulit Purwa dan Gunungan (Kayon).
// Menggabungkan ekstrusi 3D berlapis pada sumbu Z, lubang pahatan krawangan (tatah),
// tekstur PBR sunggingan prada emas, bayangan kelir dinamis, dan sendi artikulasi penuh.

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

  // Tekstur sungging prada emas dan pahatan tatah kerawangan
  const cEmas = buatKanvas(512, 512);
  const ctxEmas = cEmas.getContext('2d');
  const cBump = buatKanvas(512, 512);
  const ctxBump = cBump.getContext('2d');

  if (ctxEmas && ctxBump) {
    const grad = ctxEmas.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#ECC056');
    grad.addColorStop(0.5, '#C58824');
    grad.addColorStop(1, '#F5CE6E');
    ctxEmas.fillStyle = grad;
    ctxEmas.fillRect(0, 0, 512, 512);

    ctxBump.fillStyle = '#808080';
    ctxBump.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 20) {
      for (let x = 0; x < 512; x += 20) {
        ctxEmas.strokeStyle = 'rgba(58, 24, 8, 0.48)';
        ctxEmas.lineWidth = 1.4;
        ctxEmas.beginPath();
        ctxEmas.moveTo(x + 10, y + 2);
        ctxEmas.lineTo(x + 18, y + 10);
        ctxEmas.lineTo(x + 10, y + 18);
        ctxEmas.lineTo(x + 2, y + 10);
        ctxEmas.closePath();
        ctxEmas.stroke();

        ctxEmas.fillStyle =
          (x + y) % 40 === 0 ? 'rgba(164, 34, 20, 0.42)' : 'rgba(20, 96, 78, 0.36)';
        ctxEmas.beginPath();
        ctxEmas.arc(x + 10, y + 10, 2.8, 0, Math.PI * 2);
        ctxEmas.fill();

        ctxBump.strokeStyle = '#E6E6E6';
        ctxBump.lineWidth = 2;
        ctxBump.strokeRect(x + 3, y + 3, 14, 14);
        ctxBump.fillStyle = '#202020';
        ctxBump.beginPath();
        ctxBump.arc(x + 10, y + 10, 3.2, 0, Math.PI * 2);
        ctxBump.fill();
      }
    }
  }

  // Tekstur kain kampuh Parang Barong dan cinde merah-emas
  const cKampuh = buatKanvas(512, 512);
  const ctxKampuh = cKampuh.getContext('2d');
  if (ctxKampuh) {
    ctxKampuh.fillStyle = '#781910';
    ctxKampuh.fillRect(0, 0, 512, 512);

    for (let i = -512; i < 1024; i += 32) {
      ctxKampuh.strokeStyle = '#E6B64E';
      ctxKampuh.lineWidth = 5;
      ctxKampuh.beginPath();
      ctxKampuh.moveTo(i, 0);
      ctxKampuh.lineTo(i + 512, 512);
      ctxKampuh.stroke();

      ctxKampuh.strokeStyle = '#1C120C';
      ctxKampuh.lineWidth = 2.5;
      ctxKampuh.beginPath();
      ctxKampuh.moveTo(i + 11, 0);
      ctxKampuh.lineTo(i + 523, 512);
      ctxKampuh.stroke();

      for (let t = 0; t < 512; t += 24) {
        const px = i + t + 16;
        const py = t;
        ctxKampuh.fillStyle = '#F7D37A';
        ctxKampuh.beginPath();
        ctxKampuh.arc(px, py, 3.2, 0, Math.PI * 2);
        ctxKampuh.fill();
      }
    }
  }

  // Tekstur sungging Gunungan Kayon (hijau rimba, merah api, dan emas prada)
  const cKayon = buatKanvas(512, 512);
  const ctxKayon = cKayon.getContext('2d');
  const cKayonBump = buatKanvas(512, 512);
  const ctxKayonBump = cKayonBump.getContext('2d');
  if (ctxKayon && ctxKayonBump) {
    const gKayon = ctxKayon.createRadialGradient(256, 280, 24, 256, 260, 280);
    gKayon.addColorStop(0, '#9E2416');
    gKayon.addColorStop(0.45, '#194B36');
    gKayon.addColorStop(0.82, '#B68226');
    gKayon.addColorStop(1, '#E5B84B');
    ctxKayon.fillStyle = gKayon;
    ctxKayon.fillRect(0, 0, 512, 512);

    ctxKayonBump.fillStyle = '#787878';
    ctxKayonBump.fillRect(0, 0, 512, 512);

    for (let r = 20; r < 260; r += 20) {
      ctxKayon.strokeStyle = 'rgba(244, 206, 112, 0.58)';
      ctxKayon.lineWidth = 2;
      ctxKayon.beginPath();
      ctxKayon.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayon.stroke();

      ctxKayonBump.strokeStyle = '#E2E2E2';
      ctxKayonBump.lineWidth = 2.5;
      ctxKayonBump.beginPath();
      ctxKayonBump.arc(256, 280, r, 0, Math.PI * 2);
      ctxKayonBump.stroke();
    }
  }

  // Tekstur kain kelir dengan pendaran bundar lampu minyak Blencong di tengah panggung
  const cKelir = buatKanvas(1024, 512);
  const ctxKelir = cKelir.getContext('2d');
  if (ctxKelir) {
    const gradKelir = ctxKelir.createRadialGradient(512, 235, 35, 512, 256, 560);
    gradKelir.addColorStop(0, '#FFF6DF');
    gradKelir.addColorStop(0.35, '#F3E3C2');
    gradKelir.addColorStop(0.72, '#D7BF96');
    gradKelir.addColorStop(1, '#9E825C');
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
    sunggingEmasDiff: bungkus(cEmas, true, 2.2),
    sunggingEmasBump: bungkus(cBump, false, 2.2),
    batikKampuhDiff: bungkus(cKampuh, true, 2.0),
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

// Tokoh 1: Sri Rama (Satria Pemanah 3D tatah-sungging berartikulasi penuh)
export function bangunSriRamaRealistis3D(teksturs: KoleksiTeksturPBR): RigSriRama3D {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const kulitPradaMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.015,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.28,
    metalness: 0.76,
    clearcoat: 0.42,
  });

  const emasMurniMat = new THREE.MeshPhysicalMaterial({
    color: '#F5C85C',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.01,
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 0.5,
  });

  const kampuhParangMat = new THREE.MeshPhysicalMaterial({
    map: sungging.batikKampuhDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.012,
    roughness: 0.38,
    metalness: 0.32,
    clearcoat: 0.3,
  });

  const hijauSunggingMat = new THREE.MeshPhysicalMaterial({
    color: '#17634E',
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.009,
    roughness: 0.32,
    metalness: 0.38,
  });

  const merahMirahMat = new THREE.MeshPhysicalMaterial({
    color: '#C21F15',
    roughness: 0.18,
    metalness: 0.48,
    clearcoat: 0.75,
  });

  const hitamWajahMat = new THREE.MeshPhysicalMaterial({
    color: '#18120E',
    roughness: 0.28,
    metalness: 0.18,
    clearcoat: 0.6,
  });

  const tandukKerbauMat = new THREE.MeshPhysicalMaterial({
    color: '#EFE2CA',
    roughness: 0.26,
    clearcoat: 0.68,
  });

  // Torso berlubang tatahan krawangan dengan bevel 3D tebal
  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(-0.078, -0.14);
  torsoShape.bezierCurveTo(-0.095, -0.04, -0.135, 0.08, -0.145, 0.2);
  torsoShape.lineTo(0.155, 0.2);
  torsoShape.bezierCurveTo(0.145, 0.08, 0.105, -0.04, 0.082, -0.14);
  torsoShape.closePath();

  torsoShape.holes.push(buatLubangBundar(-0.045, 0.11, 0.013));
  torsoShape.holes.push(buatLubangBundar(0.0, 0.125, 0.014));
  torsoShape.holes.push(buatLubangBundar(0.045, 0.11, 0.013));
  torsoShape.holes.push(buatLubangBundar(-0.025, 0.02, 0.011));
  torsoShape.holes.push(buatLubangBundar(0.025, 0.02, 0.011));

  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.009,
    bevelSize: 0.007,
    bevelSegments: 4,
  });
  torsoGeo.center();
  const torsoMesh = new THREE.Mesh(torsoGeo, kulitPradaMat);
  torsoMesh.position.set(0, 0.12, 0);
  group.add(torsoMesh);

  // Kalung Ulur dan Badhong dada 3 lapis relief
  for (let lapis = 0; lapis < 3; lapis++) {
    const kalung = new THREE.Mesh(
      new THREE.TorusGeometry(0.056 + lapis * 0.019, 0.0075, 12, 26, Math.PI),
      lapis % 2 === 0 ? emasMurniMat : hijauSunggingMat,
    );
    kalung.rotation.z = Math.PI;
    kalung.position.set(-0.01, 0.25 - lapis * 0.012, 0.024);
    group.add(kalung);
  }

  // Selempang dada miring berpermata mirah
  const selempangCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.1, 0.28, 0.025),
    new THREE.Vector3(0.0, 0.12, 0.028),
    new THREE.Vector3(0.075, -0.01, 0.025),
  ]);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(selempangCurve, 18, 0.009, 10, false), merahMirahMat),
  );

  // Praba (sayap ornamen kerajaan di punggung kanan Sri Rama)
  const prabaShape = new THREE.Shape();
  prabaShape.moveTo(0.05, -0.04);
  prabaShape.bezierCurveTo(0.24, 0.04, 0.3, 0.25, 0.19, 0.44);
  prabaShape.bezierCurveTo(0.14, 0.5, 0.08, 0.43, 0.07, 0.32);
  prabaShape.bezierCurveTo(0.14, 0.22, 0.12, 0.08, 0.05, 0.0);
  prabaShape.closePath();
  prabaShape.holes.push(buatLubangBundar(0.17, 0.18, 0.016));
  prabaShape.holes.push(buatLubangBundar(0.18, 0.27, 0.015));
  prabaShape.holes.push(buatLubangBundar(0.15, 0.35, 0.013));

  const prabaGeo = new THREE.ExtrudeGeometry(prabaShape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  const prabaMesh = new THREE.Mesh(prabaGeo, emasMurniMat);
  prabaMesh.position.set(0.02, 0.05, -0.016);
  group.add(prabaMesh);

  // Kepala profil satria luruh, mahkota Gelung Supit Urang, dan Garuda Mungkur
  const kepalaGroup = new THREE.Group();
  kepalaGroup.position.set(-0.02, 0.34, 0.006);
  kepalaGroup.rotation.z = 0.12;

  const wajahShape = new THREE.Shape();
  wajahShape.moveTo(0.052, -0.062);
  wajahShape.lineTo(-0.042, -0.062);
  wajahShape.lineTo(-0.068, -0.03);
  wajahShape.lineTo(-0.056, -0.01);
  wajahShape.lineTo(-0.152, 0.016);
  wajahShape.lineTo(-0.066, 0.048);
  wajahShape.lineTo(0.058, 0.068);
  wajahShape.closePath();

  const wajahGeo = new THREE.ExtrudeGeometry(wajahShape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  wajahGeo.center();
  kepalaGroup.add(new THREE.Mesh(wajahGeo, hitamWajahMat));

  // Relief pipi dan garis emas wajah satria
  const mataMesh = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.038, 10), emasMurniMat);
  mataMesh.rotation.z = Math.PI / 2 + 0.15;
  mataMesh.position.set(-0.036, 0.016, 0.019);
  kepalaGroup.add(mataMesh);

  // Jamang tiga susun (mahkota dahi emas berpermata)
  for (let j = 0; j < 3; j++) {
    const jamang = new THREE.Mesh(
      new THREE.BoxGeometry(0.125 - j * 0.016, 0.018, 0.038),
      j === 1 ? merahMirahMat : emasMurniMat,
    );
    jamang.position.set(-0.005, 0.054 + j * 0.019, 0);
    jamang.rotation.z = -0.12;
    kepalaGroup.add(jamang);
  }

  // Sumping Sekar Kluwih (hiasan telinga melengkung ke atas)
  const sumpingCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, -0.01, 0.022),
    new THREE.Vector3(0.052, 0.032, 0.026),
    new THREE.Vector3(0.085, 0.095, 0.024),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(sumpingCurve, 16, 0.01, 10, false), emasMurniMat),
  );

  // Garuda Mungkur di belakang kepala dan Gelung Supit Urang tinggi
  const garudaMungkur = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 14),
    hijauSunggingMat,
  );
  garudaMungkur.scale.set(1.15, 0.92, 0.78);
  garudaMungkur.position.set(0.06, 0.042, 0);
  kepalaGroup.add(garudaMungkur);

  const paruhGaruda = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.038, 8), emasMurniMat);
  paruhGaruda.rotation.z = -Math.PI / 2;
  paruhGaruda.position.set(0.098, 0.042, 0);
  kepalaGroup.add(paruhGaruda);

  const gelungLuarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.03, 0.07, 0),
    new THREE.Vector3(0.125, 0.145, 0),
    new THREE.Vector3(0.14, 0.255, 0),
    new THREE.Vector3(0.062, 0.33, 0),
    new THREE.Vector3(-0.012, 0.285, 0),
  ]);
  kepalaGroup.add(
    new THREE.Mesh(new THREE.TubeGeometry(gelungLuarCurve, 30, 0.024, 12, false), hitamWajahMat),
  );

  const bingkaiGelungEmas = new THREE.Mesh(
    new THREE.TubeGeometry(gelungLuarCurve, 30, 0.011, 10, false),
    emasMurniMat,
  );
  bingkaiGelungEmas.position.z = 0.016;
  kepalaGroup.add(bingkaiGelungEmas);

  const permataMahkota = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 12),
    merahMirahMat,
  );
  permataMahkota.position.set(-0.012, 0.285, 0.014);
  kepalaGroup.add(permataMahkota);

  group.add(kepalaGroup);

  // Kain Dodot / Kampuh Parang, Pending emas, dan Uncal Kencana berayun
  const pendingSabuk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.098, 0.098, 0.048, 22),
    emasMurniMat,
  );
  pendingSabuk.scale.set(1.0, 1.0, 0.44);
  pendingSabuk.position.set(0, -0.02, 0);
  group.add(pendingSabuk);

  const permataSabuk = new THREE.Mesh(new THREE.OctahedronGeometry(0.024, 1), merahMirahMat);
  permataSabuk.position.set(-0.02, -0.02, 0.028);
  group.add(permataSabuk);

  const dodotShape = new THREE.Shape();
  dodotShape.moveTo(-0.145, -0.36);
  dodotShape.bezierCurveTo(-0.04, -0.385, 0.125, -0.35, 0.23, -0.315);
  dodotShape.bezierCurveTo(0.25, -0.18, 0.165, -0.05, 0.095, 0.0);
  dodotShape.lineTo(-0.095, 0.0);
  dodotShape.bezierCurveTo(-0.145, -0.12, -0.165, -0.24, -0.145, -0.36);
  dodotShape.closePath();

  dodotShape.holes.push(buatLubangBundar(0.085, -0.22, 0.015));
  dodotShape.holes.push(buatLubangBundar(0.135, -0.25, 0.015));

  const dodotGeo = new THREE.ExtrudeGeometry(dodotShape, {
    depth: 0.038,
    bevelEnabled: true,
    bevelThickness: 0.009,
    bevelSize: 0.006,
    bevelSegments: 4,
  });
  dodotGeo.center();
  const dodotMesh = new THREE.Mesh(dodotGeo, kampuhParangMat);
  dodotMesh.position.set(0.03, -0.19, 0);
  group.add(dodotMesh);

  // Lipatan wiru sembuliyan emas di tepi depan kain dodot
  const sembuliyanCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06, -0.04, 0.025),
    new THREE.Vector3(-0.09, -0.18, 0.028),
    new THREE.Vector3(-0.11, -0.34, 0.025),
  ]);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(sembuliyanCurve, 18, 0.011, 10, false), emasMurniMat),
  );

  const buatUncal = (xPos: number, zPos: number, mat: THREE.Material) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(xPos, -0.04, zPos);
    const kurva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.02, -0.14, 0.012),
      new THREE.Vector3(-0.05, -0.28, 0.018),
      new THREE.Vector3(-0.02, -0.38, 0.012),
    ]);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(kurva, 20, 0.013, 8, false), mat);
    uGroup.add(mesh);
    const ujungUncal = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.058, 8), emasMurniMat);
    ujungUncal.position.set(-0.02, -0.39, 0.012);
    uGroup.add(ujungUncal);
    return uGroup;
  };

  const uncalDepan = buatUncal(-0.04, 0.028, emasMurniMat);
  const uncalBelakang = buatUncal(0.03, 0.026, hijauSunggingMat);
  group.add(uncalDepan);
  group.add(uncalBelakang);

  // Sepasang kaki satria dengan gelang kroncong naga emas
  for (const [xKaki, rotKaki, zKaki] of [
    [-0.085, 0.14, 0.01],
    [0.075, -0.12, -0.01],
  ] as [number, number, number][]) {
    const kakiGroup = new THREE.Group();
    kakiGroup.position.set(xKaki, -0.36, zKaki);
    kakiGroup.rotation.z = rotKaki;

    const betis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.021, 0.014, 0.24, 14),
      kulitPradaMat,
    );
    betis.position.y = -0.1;
    kakiGroup.add(betis);

    const kroncong = new THREE.Mesh(
      new THREE.TorusGeometry(0.02, 0.0055, 10, 18),
      emasMurniMat,
    );
    kroncong.rotation.x = Math.PI / 2;
    kroncong.position.y = -0.2;
    kakiGroup.add(kroncong);

    const telapak = new THREE.Mesh(
      new THREE.BoxGeometry(0.078, 0.02, 0.026),
      kulitPradaMat,
    );
    telapak.position.set(-0.024, -0.22, 0);
    kakiGroup.add(telapak);

    group.add(kakiGroup);
  }

  // Lengan depan (memegang busur Gendewa) dan lengan belakang (menarik tali)
  const bahuDepan = new THREE.Group();
  bahuDepan.position.set(-0.11, 0.25, 0.03);
  bahuDepan.rotation.z = -0.58;

  const sendiBahuDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.019, 0.018, 12),
    emasMurniMat,
  );
  sendiBahuDepan.rotation.x = Math.PI / 2;
  bahuDepan.add(sendiBahuDepan);

  const lenganAtasDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.014, 0.22, 12),
    kulitPradaMat,
  );
  lenganAtasDepan.position.set(0, -0.11, 0);
  bahuDepan.add(lenganAtasDepan);

  const kelatBahu = new THREE.Mesh(
    new THREE.TorusGeometry(0.02, 0.0055, 8, 16),
    hijauSunggingMat,
  );
  kelatBahu.rotation.x = Math.PI / 2;
  kelatBahu.position.set(0, -0.09, 0);
  bahuDepan.add(kelatBahu);

  const sikuDepan = new THREE.Group();
  sikuDepan.position.set(0, -0.22, 0);
  sikuDepan.rotation.z = -0.92;

  const gegelSiku = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.018, 12),
    emasMurniMat,
  );
  gegelSiku.rotation.x = Math.PI / 2;
  sikuDepan.add(gegelSiku);

  const lenganBawahDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.012, 0.22, 12),
    kulitPradaMat,
  );
  lenganBawahDepan.position.set(0, -0.11, 0);
  sikuDepan.add(lenganBawahDepan);

  for (const yOff of [-0.17, -0.195]) {
    const gelang = new THREE.Mesh(
      new THREE.TorusGeometry(0.016, 0.0045, 8, 16),
      emasMurniMat,
    );
    gelang.rotation.x = Math.PI / 2;
    gelang.position.set(0, yOff, 0);
    sikuDepan.add(gelang);
  }

  const busurCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, -0.44, 0.012),
    new THREE.Vector3(-0.08, -0.34, 0.012),
    new THREE.Vector3(-0.145, -0.22, 0.012),
    new THREE.Vector3(-0.08, -0.1, 0.012),
    new THREE.Vector3(0.12, 0.0, 0.012),
  ]);
  const busurMesh = new THREE.Mesh(
    new THREE.TubeGeometry(busurCurve, 32, 0.013, 12, false),
    emasMurniMat,
  );
  sikuDepan.add(busurMesh);

  for (const yUjung of [0.0, -0.44]) {
    const makaraUjung = new THREE.Mesh(
      new THREE.SphereGeometry(0.019, 12, 12),
      merahMirahMat,
    );
    makaraUjung.position.set(0.12, yUjung, 0.012);
    sikuDepan.add(makaraUjung);
  }

  const taliPoints = [
    new THREE.Vector3(0.12, 0.0, 0.012),
    new THREE.Vector3(0.19, -0.22, 0.012),
    new THREE.Vector3(0.12, -0.44, 0.012),
  ];
  const taliBusurLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(taliPoints),
    new THREE.LineBasicMaterial({ color: '#FFF0B8' }),
  );
  sikuDepan.add(taliBusurLine);

  const anakPanahSiaga = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 0.39, 8),
    emasMurniMat,
  );
  anakPanahSiaga.rotation.z = Math.PI / 2;
  anakPanahSiaga.position.set(0.0, -0.22, 0.016);
  sikuDepan.add(anakPanahSiaga);

  const tudingDepan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.006, 0.58, 8),
    tandukKerbauMat,
  );
  tudingDepan.position.set(0.08, -0.44, 0.01);
  tudingDepan.rotation.z = 0.62;
  sikuDepan.add(tudingDepan);

  bahuDepan.add(sikuDepan);
  group.add(bahuDepan);

  const bahuBelakang = new THREE.Group();
  bahuBelakang.position.set(0.11, 0.24, -0.024);
  bahuBelakang.rotation.z = 0.25;

  const lenganAtasBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.013, 0.21, 10),
    kulitPradaMat,
  );
  lenganAtasBelakang.position.set(0, -0.1, 0);
  bahuBelakang.add(lenganAtasBelakang);

  const sikuBelakang = new THREE.Group();
  sikuBelakang.position.set(0, -0.2, 0);
  sikuBelakang.rotation.z = -1.25;

  const lenganBawahBelakang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.011, 0.2, 10),
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

  // Gapit / cempurit utama tanduk kerbau bule
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

// Tokoh 2: Kidang Kencana (Kijang Emas Marica 3D berpahat krawangan dan 4 kaki hidup)
export function bangunKidangKencanaRealistis3D(
  teksturs: KoleksiTeksturPBR,
): RigKidangKencana3D {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const emasKidangMat = new THREE.MeshPhysicalMaterial({
    map: sungging.sunggingEmasDiff,
    bumpMap: sungging.sunggingEmasBump,
    bumpScale: 0.014,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.48, 0.48),
    roughness: 0.2,
    metalness: 0.88,
    clearcoat: 0.48,
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

  const tandukMat = new THREE.MeshPhysicalMaterial({
    color: '#EFE2CA',
    roughness: 0.28,
    clearcoat: 0.62,
  });

  const badanShape = new THREE.Shape();
  badanShape.moveTo(-0.24, -0.02);
  badanShape.bezierCurveTo(-0.14, -0.095, 0.08, -0.085, 0.22, -0.03);
  badanShape.bezierCurveTo(0.285, 0.04, 0.265, 0.145, 0.16, 0.165);
  badanShape.bezierCurveTo(0.02, 0.12, -0.12, 0.145, -0.23, 0.115);
  badanShape.bezierCurveTo(-0.285, 0.07, -0.285, 0.01, -0.24, -0.02);
  badanShape.closePath();

  badanShape.holes.push(buatLubangBundar(-0.14, 0.04, 0.017));
  badanShape.holes.push(buatLubangBundar(-0.05, 0.05, 0.019));
  badanShape.holes.push(buatLubangBundar(0.05, 0.04, 0.019));
  badanShape.holes.push(buatLubangBundar(0.14, 0.05, 0.016));

  const badanGeo = new THREE.ExtrudeGeometry(badanShape, {
    depth: 0.038,
    bevelEnabled: true,
    bevelThickness: 0.011,
    bevelSize: 0.008,
    bevelSegments: 4,
  });
  badanGeo.center();
  const badanMesh = new THREE.Mesh(badanGeo, emasKidangMat);
  badanMesh.position.set(0, 0.08, 0);
  group.add(badanMesh);

  // Sabuk pelana kerajaan di punggung Kidang Kencana
  const pelanaMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.09, 0.048, 18, 1, false, 0, Math.PI),
    permataMirahMat,
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
      new THREE.OctahedronGeometry(0.018, 1),
      idx % 2 === 0 ? permataMirahMat : permataZamrudMat,
    );
    permata.position.set(px, py, 0.026);
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
    new THREE.TubeGeometry(leherCurve, 20, 0.038, 14, false),
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
  kepalaShape.lineTo(0.205, 0.19);
  kepalaShape.lineTo(0.185, 0.232);
  kepalaShape.lineTo(0.09, 0.265);
  kepalaShape.lineTo(0.02, 0.242);
  kepalaShape.closePath();

  const kepalaGeo = new THREE.ExtrudeGeometry(kepalaShape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  const kepalaMesh = new THREE.Mesh(kepalaGeo, emasKidangMat);
  kepalaMesh.position.set(0, 0, -0.015);
  leherKepalaGroup.add(kepalaMesh);

  const mataKijang = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    permataMirahMat,
  );
  mataKijang.position.set(0.09, 0.226, 0.02);
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

  // Ranggah Kencana (tanduk emas bercabang 3 tingkat dengan kuncup permata)
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
    new THREE.ConeGeometry(0.024, 0.1, 10),
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
      new THREE.CylinderGeometry(0.023, 0.015, 0.165, 12),
      emasKidangMat,
    );
    paha.position.set(0, -0.07, 0);
    paha.rotation.z = kemiringanAwal;
    kGroup.add(paha);

    const lutut = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 10, 10),
      permataZamrudMat,
    );
    lutut.position.set(kemiringanAwal * 0.08, -0.15, 0);
    kGroup.add(lutut);

    const betis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.0095, 0.185, 12),
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

// Tokoh 3: Gunungan / Kayon 3D (Pohon Kalpataru, Gapura, Banaspati, dan Naga Kembar)
export function bangunGununganKayonRealistis3D(
  teksturs: KoleksiTeksturPBR,
  skala = 1.0,
): THREE.Group {
  const group = new THREE.Group();
  const sungging = ambilTeksturSunggingWayang();

  const kayonDasarMat = new THREE.MeshPhysicalMaterial({
    map: sungging.kayonSunggingDiff,
    bumpMap: sungging.kayonSunggingBump,
    bumpScale: 0.02,
    normalMap: teksturs.kulitNor,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughness: 0.3,
    metalness: 0.62,
    clearcoat: 0.38,
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
    color: '#A22215',
    roughness: 0.32,
    metalness: 0.35,
  });

  const hijauRimbaMat = new THREE.MeshPhysicalMaterial({
    color: '#185840',
    roughness: 0.34,
    metalness: 0.3,
  });

  const tandukMat = new THREE.MeshPhysicalMaterial({
    color: '#EFE2CA',
    roughness: 0.3,
    clearcoat: 0.62,
  });

  const kayonShape = new THREE.Shape();
  kayonShape.moveTo(0, -0.54);
  kayonShape.lineTo(0.24, -0.5);
  kayonShape.bezierCurveTo(0.38, -0.22, 0.38, 0.16, 0.2, 0.44);
  kayonShape.bezierCurveTo(0.11, 0.58, 0.04, 0.66, 0, 0.74);
  kayonShape.bezierCurveTo(-0.04, 0.66, -0.11, 0.58, -0.2, 0.44);
  kayonShape.bezierCurveTo(-0.38, 0.16, -0.38, -0.22, -0.24, -0.5);
  kayonShape.closePath();

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
    new THREE.Vector3(-0.23, -0.46, 0.02),
    new THREE.Vector3(-0.33, -0.12, 0.02),
    new THREE.Vector3(-0.28, 0.22, 0.02),
    new THREE.Vector3(-0.14, 0.48, 0.02),
    new THREE.Vector3(0, 0.7, 0.02),
    new THREE.Vector3(0.14, 0.48, 0.02),
    new THREE.Vector3(0.28, 0.22, 0.02),
    new THREE.Vector3(0.33, -0.12, 0.02),
    new THREE.Vector3(0.23, -0.46, 0.02),
  ]);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(apiKelilingCurve, 48, 0.012, 10, false), emasPradaMat),
  );

  // Relief Gapura Candi Bentar dan tangga bertingkat di dasar Gunungan
  for (let t = 0; t < 3; t++) {
    const undakan = new THREE.Mesh(
      new THREE.BoxGeometry(0.34 - t * 0.05, 0.032, 0.05),
      emasPradaMat,
    );
    undakan.position.set(0, -0.46 + t * 0.034, 0.008);
    group.add(undakan);
  }

  const badanGapura = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.048),
    merahSunggingMat,
  );
  badanGapura.position.set(0, -0.28, 0.008);
  group.add(badanGapura);

  const pintuGapuraEmas = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.15, 0.054),
    emasPradaMat,
  );
  pintuGapuraEmas.position.set(0, -0.29, 0.01);
  group.add(pintuGapuraEmas);

  for (let a = 0; a < 3; a++) {
    const atapGapura = new THREE.Mesh(
      new THREE.BoxGeometry(0.26 - a * 0.05, 0.026, 0.056),
      emasPradaMat,
    );
    atapGapura.position.set(0, -0.16 + a * 0.028, 0.01);
    group.add(atapGapura);
  }

  for (const sisi of [-1, 1]) {
    const dwarapala = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.028, 0.145, 12),
      hijauRimbaMat,
    );
    dwarapala.position.set(sisi * 0.165, -0.3, 0.02);
    group.add(dwarapala);

    const gadaEmas = new THREE.Mesh(
      new THREE.ConeGeometry(0.015, 0.085, 8),
      emasPradaMat,
    );
    gadaEmas.position.set(sisi * 0.14, -0.25, 0.028);
    gadaEmas.rotation.z = -sisi * 0.35;
    group.add(gadaEmas);
  }

  // Relief wajah Kala Makara / Banaspati 3D di tengah pohon
  const kalaHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 18, 16),
    merahSunggingMat,
  );
  kalaHead.scale.set(1.28, 0.96, 0.62);
  kalaHead.position.set(0, 0.02, 0.022);
  group.add(kalaHead);

  for (const sisiMata of [-1, 1]) {
    const mataKala = new THREE.Mesh(
      new THREE.SphereGeometry(0.019, 12, 12),
      emasPradaMat,
    );
    mataKala.position.set(sisiMata * 0.036, 0.035, 0.052);
    group.add(mataKala);
  }

  // Batang dan cabang pohon Kalpataru
  const batangKalpataru = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, 0.52, 12),
    emasPradaMat,
  );
  batangKalpataru.position.set(0, 0.24, 0.022);
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
      new THREE.Mesh(new THREE.TubeGeometry(cabangCurve, 28, 0.01, 8, false), emasPradaMat),
    );
  }

  const mustakaKayon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.034, 1),
    emasPradaMat,
  );
  mustakaKayon.position.set(0, 0.68, 0.02);
  group.add(mustakaKayon);

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
