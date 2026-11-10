// Generator dan pemuat tekstur PBR (Physically Based Rendering) untuk Kelir.
// Menggabungkan peta tekstur foto CC0 1K (Poly Haven), citra kurasi wayang museum (Tropenmuseum CC BY-SA 3.0),
// serta peta normal/roughness/metalness resolusi tinggi untuk pamor keris, perunggu tempa gamelan, dan tenun kelir.

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
  tenunKelirDiff: THREE.CanvasTexture;
  tenunKelirBump: THREE.CanvasTexture;
  gedebogDiff: THREE.CanvasTexture;
  gedebogBump: THREE.CanvasTexture;
  wayangRamaMap: THREE.Texture;
  wayangKidangMap: THREE.Texture;
}

let cacheTekstur: KoleksiTeksturPBR | null = null;

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

// Fungsi derau deterministik untuk menghasilkan serat tempa lipat pamor dan tempaan perunggu
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

function fbm(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq);
    freq *= 2.04;
    amp *= 0.5;
  }
  return val;
}

// Peta Pamor Wos Wutah (Beras Tumpah) & Lapisan Besi-Nikel Tempa Lipat
function buatPetaPamor(): {
  diff: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 1024;
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
        const n1 = fbm(nx * 6.5, ny * 18.0, 5);
        const n2 = fbm(nx * 14.0 + n1 * 2.2, ny * 34.0, 4);

        // Gelombang lipatan tempa empu (pamor wos wutah & ngulit semangka)
        const pita = Math.sin((jarakTengah * 14 + n1 * 5.2 + n2 * 2.1) * Math.PI);
        const nikel = Math.pow(Math.max(0, pita), 2.4) * (1 - Math.pow(jarakTengah, 1.8) * 0.65);

        // Warangan (arsenik/jeruk nipis) menghitamkan besi (wesi) dan memutihkan nikel (pamor)
        const r = Math.round(34 + nikel * 188 + n2 * 14);
        const g = Math.round(31 + nikel * 182 + n2 * 12);
        const b = Math.round(29 + nikel * 170 + n2 * 10);

        const idx = (y * w + x) * 4;
        imgDiff.data[idx] = Math.min(255, r);
        imgDiff.data[idx + 1] = Math.min(255, g);
        imgDiff.data[idx + 2] = Math.min(255, b);
        imgDiff.data[idx + 3] = 255;

        const tinggi = Math.round(90 + nikel * 145 + n1 * 20);
        imgBump.data[idx] = tinggi;
        imgBump.data[idx + 1] = tinggi;
        imgBump.data[idx + 2] = tinggi;
        imgBump.data[idx + 3] = 255;

        // Lapisan nikel lebih mengilap (roughness rendah) dibanding besi warangan
        const kasar = Math.round(145 - nikel * 85 + n2 * 20);
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

// Peta Perunggu Tempa (Gangsa) untuk Wilah Saron Gamelan
function buatPetaPerungguTempa(): {
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
} {
  const w = 512;
  const h = 512;
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);
  const { canvas: cRough, ctx: xRough } = buatKanvas(w, h);

  if (xBump && xRough) {
    const imgBump = xBump.createImageData(w, h);
    const imgRough = xRough.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        // Jejak pukulan palu pandai gamelan (tempa gangsa) + serbuk gosok memanjang
        const lesungPalu = fbm(nx * 22, ny * 22, 4);
        const goresHalus = fbm(nx * 4, ny * 95, 3);
        const hVal = Math.round(110 + lesungPalu * 95 + goresHalus * 35);
        const rVal = Math.round(58 + (1 - lesungPalu) * 70 + goresHalus * 28);

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

// Peta Ukiran Lung-lungan & Tumpal Jawa untuk Rancakan Gamelan
function buatPetaUkiranRancakan(): THREE.CanvasTexture {
  const w = 1024;
  const h = 256;
  const { canvas, ctx } = buatKanvas(w, h);
  if (ctx) {
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#E8E8E8';
    ctx.fillStyle = '#CFCFCF';
    ctx.lineWidth = 6;

    // Bingkai atas & bawah berprofil
    ctx.fillRect(0, 12, w, 14);
    ctx.fillRect(0, h - 26, w, 14);

    // Deretan sulur lung-lungan khas Yogyakarta/Surakarta
    for (let i = 0; i < 8; i++) {
      const cx = (i + 0.5) * (w / 8);
      const cy = h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 1.65);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 12, cy - 4, 24, Math.PI * 0.2, Math.PI * 1.85);
      ctx.stroke();

      // Kuncup bunga tengah
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Peta Tenun Kain Mori Putih (Layar Kelir) & Pita Pinggiran Merah-Hitam (Plipit)
function buatPetaTenunKelir(): { diff: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 512;
  const h = 512;
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
        const serat = fbm(x / 64, y / 64, 3);

        // Sedikit hangat di bagian tengah akibat patina asap lampu minyak blencong
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

// Peta Serat Batang Pisang (Gedebog) tempat menancapkan cempurit wayang
function buatPetaGedebog(): { diff: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const w = 512;
  const h = 256;
  const { canvas: cDiff, ctx: xDiff } = buatKanvas(w, h);
  const { canvas: cBump, ctx: xBump } = buatKanvas(w, h);

  if (xDiff && xBump) {
    const imgDiff = xDiff.createImageData(w, h);
    const imgBump = xBump.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        const seratMemanjang = fbm(nx * 36, ny * 6, 4);
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

  const wayangRamaMap = loader.load('/wayang/rama.png');
  wayangRamaMap.colorSpace = THREE.SRGBColorSpace;
  wayangRamaMap.anisotropy = 4;

  const wayangKidangMap = loader.load('/wayang/kidang.png');
  wayangKidangMap.colorSpace = THREE.SRGBColorSpace;
  wayangKidangMap.anisotropy = 4;

  const pamor = buatPetaPamor();
  const perunggu = buatPetaPerungguTempa();
  const ukirRancakanBump = buatPetaUkiranRancakan();
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
    tenunKelirDiff: kelir.diff,
    tenunKelirBump: kelir.bump,
    gedebogDiff: gedebog.diff,
    gedebogBump: gedebog.bump,
    wayangRamaMap,
    wayangKidangMap,
  };

  return cacheTekstur;
}

// Pasang pencahayaan IBL (Image-Based Lighting) ke scene:
// Instan memakai RoomEnvironment terlebih dahulu, lalu meningkatkan kualitas pantulan logam
// ketika HDRI studio_small_08_1k.hdr selesai dimuat.
export function pasangLingkunganPBR(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const envAwal = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envAwal;

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      '/textures/studio_small_08_1k.hdr',
      (hdrTex) => {
        try {
          hdrTex.mapping = THREE.EquirectangularReflectionMapping;
          const envHdr = pmrem.fromEquirectangular(hdrTex).texture;
          scene.environment = envHdr;
          hdrTex.dispose();
        } catch {
          // Pertahankan RoomEnvironment bila konversi gagal
        }
      },
      undefined,
      () => {
        // Pertahankan RoomEnvironment bila berkas HDR tidak terjangkau
      },
    );
  } catch {
    // Abaikan pada perangkat tanpa dukungan PMREM
  }
}
