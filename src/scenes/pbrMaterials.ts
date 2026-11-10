// Generator dan pemuat tekstur PBR (Physically Based Rendering) untuk Kelir.
// Menggabungkan peta tekstur foto CC0 1K (Poly Haven: kayu jati, kulit, HDRI studio)
// dengan peta PBR untuk Pamor Keris, Perunggu Gamelan, Batik Tulis (Kawung & Parang),
// Genteng Terakota Joglo, Batu Andesit Umpak, Tenun Mori Kelir, dan Serat Gedebog.

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface KoleksiTeksturPBR {
  kayuGelapDiff: THREE.Texture;
  kayuGelapNor: THREE.Texture;
  kayuGelapRough: THREE.Texture;
  kulitNor: THREE.Texture;
  kulitRough: THREE.Texture;
  pamorDiff: THREE.CanvasTexture;
  pamorBump: THREE.CanvasTexture;
  pamorRough: THREE.CanvasTexture;
  perungguBump: THREE.CanvasTexture;
  perungguRough: THREE.CanvasTexture;
  ukirRancakanBump: THREE.CanvasTexture;
  batikDiff: THREE.CanvasTexture;
  batikBump: THREE.CanvasTexture;
  terakotaDiff: THREE.CanvasTexture;
  terakotaBump: THREE.CanvasTexture;
  batuAndesitDiff: THREE.CanvasTexture;
  batuAndesitBump: THREE.CanvasTexture;
  tenunKelirDiff: THREE.CanvasTexture;
  tenunKelirBump: THREE.CanvasTexture;
  gedebogDiff: THREE.CanvasTexture;
  gedebogBump: THREE.CanvasTexture;
}

let cacheTekstur: KoleksiTeksturPBR | null = null;
let cacheEnvMap: THREE.Texture | null = null;

function buatKanvas(w: number, h: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
} {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    ctx = null;
  }
  return { canvas, ctx };
}

function hashNoise(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hashNoise(ix, iy);
  const b = hashNoise(ix + 1, iy);
  const c = hashNoise(ix, iy + 1);
  const d = hashNoise(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, octaves = 3): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return val;
}

// 1. Peta Pamor Wos Wutah (Beras Tumpah) & Lapisan Besi-Nikel Tempa Lipat
function buatPetaPamor(): {
  diff: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const w = 256;
  const h = 512;
  const { canvas: cDiff, ctx: xDiff } = buatKanvas(w, h);
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);
  const { canvas: cRough, ctx: xRough } = buatKanvas(w, h);

  if (xDiff && xBump && xRough) {
    const imgDiff = xDiff.createImageData(w, h);
    const imgBump = xBump.createImageData(w, h);
    const imgRough = xRough.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      const ny = y / h;
      for (let x = 0; x < w; x++) {
        const nx = (x / w) * 2 - 1;
        const jarakTengah = Math.abs(nx);
        const n1 = fbm(nx * 6.5, ny * 18.0, 3);
        const n2 = fbm(nx * 14.0 + n1 * 2.2, ny * 34.0, 2);

        const pita = Math.sin((jarakTengah * 14 + n1 * 5.2 + n2 * 2.1) * Math.PI);
        const nikel = Math.pow(Math.max(0, pita), 2.2) * (1 - Math.pow(jarakTengah, 1.8) * 0.6);

        const r = Math.round(32 + nikel * 194 + n2 * 14);
        const g = Math.round(29 + nikel * 188 + n2 * 12);
        const b = Math.round(27 + nikel * 175 + n2 * 10);

        const idx = (y * w + x) * 4;
        imgDiff.data[idx] = Math.min(255, r);
        imgDiff.data[idx + 1] = Math.min(255, g);
        imgDiff.data[idx + 2] = Math.min(255, b);
        imgDiff.data[idx + 3] = 255;

        const tinggi = Math.round(85 + nikel * 150 + n1 * 20);
        imgBump.data[idx] = tinggi;
        imgBump.data[idx + 1] = tinggi;
        imgBump.data[idx + 2] = tinggi;
        imgBump.data[idx + 3] = 255;

        const kasar = Math.round(145 - nikel * 90 + n2 * 20);
        imgRough.data[idx] = kasar;
        imgRough.data[idx + 1] = kasar;
        imgRough.data[idx + 2] = kasar;
        imgRough.data[idx + 3] = 255;
      }
    }
    xDiff.putImageData(imgDiff, 0, 0);
    xBump.putImageData(imgBump, 0, 0);
    xRough.putImageData(imgRough, 0, 0);
  }

  const diff = new THREE.CanvasTexture(cDiff);
  diff.colorSpace = THREE.SRGBColorSpace;
  diff.wrapS = THREE.RepeatWrapping;
  diff.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  const rough = new THREE.CanvasTexture(cRough);
  rough.wrapS = THREE.RepeatWrapping;
  rough.wrapT = THREE.RepeatWrapping;

  return { diff, bump, rough };
}

// 2. Peta Perunggu Tempa (Gangsa) untuk Wilah Saron Gamelan
function buatPetaPerungguTempa(): {
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const w = 256;
  const h = 256;
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);
  const { canvas: cRough, ctx: xRough } = buatKanvas(w, h);

  if (xBump && xRough) {
    const imgBump = xBump.createImageData(w, h);
    const imgRough = xRough.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        const lesungPalu = fbm(nx * 20, ny * 20, 3);
        const goresHalus = fbm(nx * 4, ny * 80, 2);
        const hVal = Math.round(110 + lesungPalu * 95 + goresHalus * 35);
        const rVal = Math.round(55 + (1 - lesungPalu) * 70 + goresHalus * 28);

        const idx = (y * w + x) * 4;
        imgBump.data[idx] = hVal;
        imgBump.data[idx + 1] = hVal;
        imgBump.data[idx + 2] = hVal;
        imgBump.data[idx + 3] = 255;

        imgRough.data[idx] = rVal;
        imgRough.data[idx + 1] = rVal;
        imgRough.data[idx + 2] = rVal;
        imgRough.data[idx + 3] = 255;
      }
    }
    xBump.putImageData(imgBump, 0, 0);
    xRough.putImageData(imgRough, 0, 0);
  }

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  const rough = new THREE.CanvasTexture(cRough);
  rough.wrapS = THREE.RepeatWrapping;
  rough.wrapT = THREE.RepeatWrapping;

  return { bump, rough };
}

// 3. Peta Ukiran Lung-lungan & Tumpal Jawa
function buatPetaUkiranRancakan(): THREE.CanvasTexture {
  const w = 512;
  const h = 128;
  const { canvas, ctx } = buatKanvas(w, h);
  if (ctx) {
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#EFEFEF';
    ctx.fillStyle = '#D8D8D8';
    ctx.lineWidth = 4;

    ctx.fillRect(0, 6, w, 8);
    ctx.fillRect(0, h - 14, w, 8);

    for (let i = 0; i < 8; i++) {
      const cx = (i + 0.5) * (w / 8);
      const cy = h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 1.65);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 6, cy - 2, 12, Math.PI * 0.2, Math.PI * 1.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// 4. Peta Batik Tulis Sogan Yogyakarta (Motif Kawung & Parang Rusak dengan Garis Lilin Malam Timbul)
function buatPetaBatikTulis(): { diff: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 512;
  const h = 512;
  const { canvas: cDiff, ctx: xDiff } = buatKanvas(w, h);
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);

  if (xDiff && xBump) {
    // Latar kain sogan cokelat gelap & nila
    xDiff.fillStyle = '#2B1810';
    xDiff.fillRect(0, 0, w, h);

    xBump.fillStyle = '#404040';
    xBump.fillRect(0, 0, w, h);

    // Gambar ceplok Kawung berulang dengan isen-isen cecek (titik malam)
    const grid = 64;
    for (let gy = 0; gy < h; gy += grid) {
      for (let gx = 0; gx < w; gx += grid) {
        const cx = gx + grid / 2;
        const cy = gy + grid / 2;

        // Pengisi sogan hangat pada kelopak kawung
        xDiff.fillStyle = '#6E3A1E';
        xDiff.strokeStyle = '#EBD59D';
        xDiff.lineWidth = 2.6;

        xBump.fillStyle = '#858585';
        xBump.strokeStyle = '#F5F5F5';
        xBump.lineWidth = 3.0;

        const kelopak: [number, number][] = [
          [-14, -14],
          [14, -14],
          [-14, 14],
          [14, 14],
        ];
        for (const [ox, oy] of kelopak) {
          xDiff.beginPath();
          xDiff.ellipse(
            cx + ox,
            cy + oy,
            16,
            9,
            ox * oy > 0 ? Math.PI / 4 : -Math.PI / 4,
            0,
            Math.PI * 2,
          );
          xDiff.fill();
          xDiff.stroke();

          xBump.beginPath();
          xBump.ellipse(
            cx + ox,
            cy + oy,
            16,
            9,
            ox * oy > 0 ? Math.PI / 4 : -Math.PI / 4,
            0,
            Math.PI * 2,
          );
          xBump.fill();
          xBump.stroke();

          // Titik cecek (isen-isen malam) di tengah tiap kelopak
          xDiff.fillStyle = '#F6E7BE';
          xDiff.beginPath();
          xDiff.arc(cx + ox, cy + oy, 2.5, 0, Math.PI * 2);
          xDiff.fill();
          xDiff.fillStyle = '#6E3A1E';

          xBump.fillStyle = '#FFFFFF';
          xBump.beginPath();
          xBump.arc(cx + ox, cy + oy, 2.8, 0, Math.PI * 2);
          xBump.fill();
          xBump.fillStyle = '#858585';
        }

        // Mlinjon tengah
        xDiff.fillStyle = '#D99B3C';
        xDiff.beginPath();
        xDiff.arc(cx, cy, 4.2, 0, Math.PI * 2);
        xDiff.fill();
      }
    }

    // Sabuk diagonal Parang Rusak di bagian tengah kain
    xDiff.strokeStyle = '#F2DC9C';
    xDiff.lineWidth = 4;
    xBump.strokeStyle = '#FFFFFF';
    xBump.lineWidth = 4.5;
    for (let d = -w; d < w * 2; d += 48) {
      xDiff.beginPath();
      xDiff.moveTo(d, 0);
      xDiff.lineTo(d + 96, h);
      xDiff.stroke();

      xBump.beginPath();
      xBump.moveTo(d, 0);
      xBump.lineTo(d + 96, h);
      xBump.stroke();
    }
  }

  const diff = new THREE.CanvasTexture(cDiff);
  diff.colorSpace = THREE.SRGBColorSpace;
  diff.wrapS = THREE.RepeatWrapping;
  diff.wrapT = THREE.RepeatWrapping;
  diff.repeat.set(2, 2);

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);

  return { diff, bump };
}

// 5. Peta Genteng Terakota Atap Joglo & Batu Andesit Umpak
function buatPetaTerakotaDanBatu(): {
  terakotaDiff: THREE.CanvasTexture;
  terakotaBump: THREE.CanvasTexture;
  batuDiff: THREE.CanvasTexture;
  batuBump: THREE.CanvasTexture;
} {
  const w = 256;
  const h = 256;
  const { canvas: cTDiff, ctx: xTDiff } = buatKanvas(w, h);
  const { canvas: cTBump, ctx: xTBump } = buatKanvas(w, h);
  const { canvas: cBDiff, ctx: xBDiff } = buatKanvas(w, h);
  const { canvas: cBBump, ctx: xBBump } = buatKanvas(w, h);

  if (xTDiff && xTBump && xBDiff && xBBump) {
    const imgTD = xTDiff.createImageData(w, h);
    const imgTB = xTBump.createImageData(w, h);
    const imgBD = xBDiff.createImageData(w, h);
    const imgBB = xBBump.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Gelombang genteng tanah liat (klenteng/vlaam)
        const gelX = Math.sin((x / w) * Math.PI * 16) * 0.5 + 0.5;
        const barisY = (y % 32) / 32;
        const n = fbm(x / 32, y / 32, 2);

        const tr = Math.round(138 + gelX * 36 - barisY * 18 + n * 14);
        const tg = Math.round(62 + gelX * 18 - barisY * 10 + n * 10);
        const tb = Math.round(36 + gelX * 10 - barisY * 6 + n * 8);

        const idx = (y * w + x) * 4;
        imgTD.data[idx] = tr;
        imgTD.data[idx + 1] = tg;
        imgTD.data[idx + 2] = tb;
        imgTD.data[idx + 3] = 255;

        const tbVal = Math.round(80 + gelX * 130 + (1 - barisY) * 35);
        imgTB.data[idx] = tbVal;
        imgTB.data[idx + 1] = tbVal;
        imgTB.data[idx + 2] = tbVal;
        imgTB.data[idx + 3] = 255;

        // Pori-pori batu andesit vulkanik Gunung Merapi untuk Umpak Joglo
        const bn = fbm(x / 12, y / 12, 3);
        const bVal = Math.round(58 + bn * 46);
        imgBD.data[idx] = bVal;
        imgBD.data[idx + 1] = bVal - 2;
        imgBD.data[idx + 2] = bVal - 4;
        imgBD.data[idx + 3] = 255;

        const bbVal = Math.round(70 + bn * 155);
        imgBB.data[idx] = bbVal;
        imgBB.data[idx + 1] = bbVal;
        imgBB.data[idx + 2] = bbVal;
        imgBB.data[idx + 3] = 255;
      }
    }
    xTDiff.putImageData(imgTD, 0, 0);
    xTBump.putImageData(imgTB, 0, 0);
    xBDiff.putImageData(imgBD, 0, 0);
    xBBump.putImageData(imgBB, 0, 0);
  }

  const terakotaDiff = new THREE.CanvasTexture(cTDiff);
  terakotaDiff.colorSpace = THREE.SRGBColorSpace;
  terakotaDiff.wrapS = THREE.RepeatWrapping;
  terakotaDiff.wrapT = THREE.RepeatWrapping;
  terakotaDiff.repeat.set(3, 3);

  const terakotaBump = new THREE.CanvasTexture(cTBump);
  terakotaBump.wrapS = THREE.RepeatWrapping;
  terakotaBump.wrapT = THREE.RepeatWrapping;
  terakotaBump.repeat.set(3, 3);

  const batuDiff = new THREE.CanvasTexture(cBDiff);
  batuDiff.colorSpace = THREE.SRGBColorSpace;
  batuDiff.wrapS = THREE.RepeatWrapping;
  batuDiff.wrapT = THREE.RepeatWrapping;

  const batuBump = new THREE.CanvasTexture(cBBump);
  batuBump.wrapS = THREE.RepeatWrapping;
  batuBump.wrapT = THREE.RepeatWrapping;

  return { terakotaDiff, terakotaBump, batuDiff, batuBump };
}

// 6. Peta Tenun Kain Mori Putih (Layar Kelir)
function buatPetaTenunKelir(): { diff: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 256;
  const h = 256;
  const { canvas: cDiff, ctx: xDiff } = buatKanvas(w, h);
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);

  if (xDiff && xBump) {
    const imgDiff = xDiff.createImageData(w, h);
    const imgBump = xBump.createImageData(w, h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const benangX = Math.sin(x * 1.45) * 0.5 + 0.5;
        const benangY = Math.sin(y * 1.45) * 0.5 + 0.5;
        const anyam = (benangX + benangY) * 0.5;
        const serat = fbm(x / 32, y / 32, 2);

        const dx = x / w - 0.5;
        const dy = y / h - 0.5;
        const jarak = Math.sqrt(dx * dx + dy * dy);
        const hangatTengah = Math.max(0, 1 - jarak * 1.45);

        const r = Math.round(234 + hangatTengah * 14 + anyam * 5 - serat * 8);
        const g = Math.round(223 + hangatTengah * 8 + anyam * 5 - serat * 10);
        const b = Math.round(205 + anyam * 4 - serat * 12);

        const idx = (y * w + x) * 4;
        imgDiff.data[idx] = Math.min(255, r);
        imgDiff.data[idx + 1] = Math.min(255, g);
        imgDiff.data[idx + 2] = Math.min(255, b);
        imgDiff.data[idx + 3] = 255;

        const bVal = Math.round(105 + anyam * 90 + serat * 30);
        imgBump.data[idx] = bVal;
        imgBump.data[idx + 1] = bVal;
        imgBump.data[idx + 2] = bVal;
        imgBump.data[idx + 3] = 255;
      }
    }
    xDiff.putImageData(imgDiff, 0, 0);
    xBump.putImageData(imgBump, 0, 0);
  }

  const diff = new THREE.CanvasTexture(cDiff);
  diff.colorSpace = THREE.SRGBColorSpace;
  diff.wrapS = THREE.RepeatWrapping;
  diff.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(6, 4);

  return { diff, bump };
}

// 7. Peta Serat Batang Pisang (Gedebog)
function buatPetaGedebog(): { diff: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 256;
  const h = 128;
  const { canvas: cDiff, ctx: xDiff } = buatKanvas(w, h);
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);

  if (xDiff && xBump) {
    const imgDiff = xDiff.createImageData(w, h);
    const imgBump = xBump.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        const seratMemanjang = fbm(nx * 28, ny * 5, 3);
        const ruas = Math.sin(ny * Math.PI * 14 + seratMemanjang * 2) * 0.5 + 0.5;

        const r = Math.round(78 + seratMemanjang * 48 + ruas * 18);
        const g = Math.round(88 + seratMemanjang * 52 + ruas * 16);
        const b = Math.round(44 + seratMemanjang * 26 + ruas * 8);

        const idx = (y * w + x) * 4;
        imgDiff.data[idx] = r;
        imgDiff.data[idx + 1] = g;
        imgDiff.data[idx + 2] = b;
        imgDiff.data[idx + 3] = 255;

        const bVal = Math.round(90 + ruas * 110 + seratMemanjang * 45);
        imgBump.data[idx] = bVal;
        imgBump.data[idx + 1] = bVal;
        imgBump.data[idx + 2] = bVal;
        imgBump.data[idx + 3] = 255;
      }
    }
    xDiff.putImageData(imgDiff, 0, 0);
    xBump.putImageData(imgBump, 0, 0);
  }

  const diff = new THREE.CanvasTexture(cDiff);
  diff.colorSpace = THREE.SRGBColorSpace;
  diff.wrapS = THREE.RepeatWrapping;
  diff.wrapT = THREE.RepeatWrapping;

  const bump = new THREE.CanvasTexture(cBump);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;

  return { diff, bump };
}

export function ambilKoleksiTeksturPBR(): KoleksiTeksturPBR {
  if (cacheTekstur) return cacheTekstur;

  const loader = new THREE.TextureLoader();

  const muatTex = (url: string, isSRGB: boolean, repeatX = 2, repeatY = 2): THREE.Texture => {
    const tex = loader.load(url);
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = 4;
    return tex;
  };

  const kayuGelapDiff = muatTex('/textures/dark_wood_diff_1k.jpg', true, 2, 2);
  const kayuGelapNor = muatTex('/textures/dark_wood_nor_gl_1k.jpg', false, 2, 2);
  const kayuGelapRough = muatTex('/textures/dark_wood_rough_1k.jpg', false, 2, 2);

  const kulitNor = muatTex('/textures/brown_leather_nor_gl_1k.jpg', false, 3, 3);
  const kulitRough = muatTex('/textures/brown_leather_rough_1k.jpg', false, 3, 3);

  const pamor = buatPetaPamor();
  const perunggu = buatPetaPerungguTempa();
  const ukirRancakanBump = buatPetaUkiranRancakan();
  const batik = buatPetaBatikTulis();
  const arsitektur = buatPetaTerakotaDanBatu();
  const kelir = buatPetaTenunKelir();
  const gedebog = buatPetaGedebog();

  cacheTekstur = {
    kayuGelapDiff,
    kayuGelapNor,
    kayuGelapRough,
    kulitNor,
    kulitRough,
    pamorDiff: pamor.diff,
    pamorBump: pamor.bump,
    pamorRough: pamor.rough,
    perungguBump: perunggu.bump,
    perungguRough: perunggu.rough,
    ukirRancakanBump,
    batikDiff: batik.diff,
    batikBump: batik.bump,
    terakotaDiff: arsitektur.terakotaDiff,
    terakotaBump: arsitektur.terakotaBump,
    batuAndesitDiff: arsitektur.batuDiff,
    batuAndesitBump: arsitektur.batuBump,
    tenunKelirDiff: kelir.diff,
    tenunKelirBump: kelir.bump,
    gedebogDiff: gedebog.diff,
    gedebogBump: gedebog.bump,
  };

  return cacheTekstur;
}

export function pasangLingkunganPBR(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  try {
    if (cacheEnvMap) {
      scene.environment = cacheEnvMap;
      return;
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const envAwal = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    cacheEnvMap = envAwal;
    scene.environment = envAwal;

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      '/textures/studio_small_08_1k.hdr',
      (hdrTex) => {
        try {
          hdrTex.mapping = THREE.EquirectangularReflectionMapping;
          const envHdr = pmrem.fromEquirectangular(hdrTex).texture;
          cacheEnvMap = envHdr;
          scene.environment = envHdr;
          hdrTex.dispose();
        } catch {
          // Pertahankan RoomEnvironment
        }
      },
      undefined,
      () => {
        // Pertahankan RoomEnvironment
      },
    );
  } catch {
    // Abaikan bila perangkat tidak mendukung PMREM
  }
}
