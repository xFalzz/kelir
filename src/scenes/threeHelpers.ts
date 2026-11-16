import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export interface PaketTeksturBudaya {
  kayuDiffuse: THREE.Texture | null;
  kayuNormal: THREE.Texture | null;
  kayuRough: THREE.Texture | null;
  kulitNormal: THREE.Texture | null;
  kulitRough: THREE.Texture | null;
}

let cacheTekstur: PaketTeksturBudaya | null = null;
let janjiHdrRaw: Promise<THREE.DataTexture | null> | null = null;

export function isMobileGpuProfile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    Boolean(window.matchMedia?.('(pointer: coarse)').matches)
  );
}

/**
 * Menginisialisasi WebGLRenderer secara aman; mengembalikan null jika konteks WebGL tidak tersedia.
 */
export function createSafeWebGLRenderer(
  container: HTMLElement,
  opts: { alpha?: boolean; antialias?: boolean; shadows?: boolean } = {},
): THREE.WebGLRenderer | null {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { powerPreference: 'high-performance' }) ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const width = Math.max(container.clientWidth || 320, 1);
    const height = Math.max(container.clientHeight || 240, 1);
    const mobile = isMobileGpuProfile();

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: opts.antialias ?? true,
      alpha: opts.alpha ?? true,
      powerPreference: 'high-performance',
    });

    const maxDpr = mobile ? 1.2 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (opts.shadows ?? true) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.querySelectorAll('canvas').forEach((el) => el.remove());
    container.prepend(canvas);
    return renderer;
  } catch {
    return null;
  }
}

export function loadBudayaTextures(): PaketTeksturBudaya {
  if (cacheTekstur) return cacheTekstur;
  if (typeof window === 'undefined') {
    return { kayuDiffuse: null, kayuNormal: null, kayuRough: null, kulitNormal: null, kulitRough: null };
  }

  const loader = new THREE.TextureLoader();
  const safeLoad = (url: string, srgb = false): THREE.Texture | null => {
    try {
      const tex = loader.load(url, undefined, undefined, () => undefined);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    } catch {
      return null;
    }
  };

  cacheTekstur = {
    kayuDiffuse: safeLoad('/textures/dark_wood_diff_1k.jpg', true),
    kayuNormal: safeLoad('/textures/dark_wood_nor_gl_1k.jpg'),
    kayuRough: safeLoad('/textures/dark_wood_rough_1k.jpg'),
    kulitNormal: safeLoad('/textures/brown_leather_nor_gl_1k.jpg'),
    kulitRough: safeLoad('/textures/brown_leather_rough_1k.jpg'),
  };
  return cacheTekstur;
}

export async function applyStudioHDR(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
): Promise<void> {
  if (!janjiHdrRaw) {
    janjiHdrRaw = new Promise((resolve) => {
      try {
        const loader = new HDRLoader();
        loader.load(
          '/textures/studio_small_08_1k.hdr',
          (hdrTexture) => resolve(hdrTexture),
          undefined,
          () => resolve(null),
        );
      } catch {
        resolve(null);
      }
    });
  }

  const hdrTexture = await janjiHdrRaw;
  if (!hdrTexture) return;
  try {
    const gl = renderer.getContext();
    if (!gl || gl.isContextLost()) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(hdrTexture);
    scene.environment = envRT.texture;
    pmrem.dispose();
  } catch {
    // Abaikan aman jika panggung telah dibuang sebelum HDR selesai dimuat
  }
}

/**
 * Menambahkan garis tepi CAD bercahaya (#ff5a1f atau kustom) pada seluruh mesh di dalam grup.
 */
export function attachCadWireframeLayer(
  root: THREE.Object3D,
  colorHex = 0xff5a1f,
  initialOpacity = 0,
): THREE.LineBasicMaterial {
  const lineMat = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: initialOpacity,
    depthWrite: false,
  });

  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && !obj.userData.skipCad) {
      meshes.push(obj as THREE.Mesh);
    }
  });

  for (const mesh of meshes) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 12);
    const segments = new THREE.LineSegments(edges, lineMat);
    segments.userData.isCadOverlay = true;
    segments.renderOrder = 4;
    segments.visible = initialOpacity > 0.01;
    mesh.add(segments);
  }

  return lineMat;
}

/**
 * Mempertahankan bidang pandang horizontal agar objek 3D tidak terpotong di layar sempit/potret.
 */
export function hitungFovResponsif(
  baseFovDeg: number,
  aspect: number,
  refAspect = 1.25,
  maxFovDeg = 58,
): number {
  if (!Number.isFinite(aspect) || aspect <= 0 || aspect >= refAspect) {
    return baseFovDeg;
  }
  const baseRad = THREE.MathUtils.degToRad(baseFovDeg);
  const adaptedRad = 2 * Math.atan(Math.tan(baseRad / 2) * (refAspect / Math.max(aspect, 0.45)));
  return Math.min(maxFovDeg, THREE.MathUtils.radToDeg(adaptedRad));
}

/**
 * Menjeda loop WebGL otomatis ketika kanvas berada di luar viewport atau tab tidak aktif.
 */
export function pasangObservasiPanggung(
  container: HTMLElement,
  onAktifUbah: (aktif: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let dalamViewport = true;
  let io: IntersectionObserver | null = null;

  const laporStatus = (): void => {
    onAktifUbah(dalamViewport && !document.hidden);
  };

  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          dalamViewport = entry.isIntersecting;
          laporStatus();
        }
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(container);
  }

  document.addEventListener('visibilitychange', laporStatus);
  return () => {
    io?.disconnect();
    document.removeEventListener('visibilitychange', laporStatus);
  };
}

/**
 * Mengembalikan true hanya bila koordinat atau keterlihatan pin proyeksi berubah bermakna (>= 0.5px).
 */
export function pinProyeksiBerubah<T extends { x: number; y: number; terlihat: boolean }>(
  sebelum: T[],
  sesudah: T[],
): boolean {
  if (sebelum.length !== sesudah.length) return true;
  for (let i = 0; i < sesudah.length; i++) {
    const a = sebelum[i];
    const b = sesudah[i];
    if (a.terlihat !== b.terlihat) return true;
    if (Math.abs(a.x - b.x) >= 0.5 || Math.abs(a.y - b.y) >= 0.5) return true;
  }
  return false;
}

export function disposeSceneObject(obj: THREE.Object3D): void {
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else if (mat) {
      mat.dispose();
    }
  });
}
