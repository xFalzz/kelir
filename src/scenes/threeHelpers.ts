import * as THREE from 'three';

export interface PaketTeksturBudaya {
  kayuDiffuse: THREE.Texture | null;
  kayuNormal: THREE.Texture | null;
  kayuRough: THREE.Texture | null;
  kulitNormal: THREE.Texture | null;
  kulitRough: THREE.Texture | null;
}

let cacheTekstur: PaketTeksturBudaya | null = null;
let cacheStudioBoxScene: THREE.Scene | null = null;

export function isMobileGpuProfile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth <= 768 ||
    Boolean(window.matchMedia?.('(pointer: coarse)').matches)
  );
}

export function tandaiTeksturCacheBersama<T extends THREE.Texture | null | undefined>(
  tex: T,
): T {
  if (tex) {
    tex.userData = { ...(tex.userData ?? {}), sharedCache: true };
  }
  return tex;
}

export function kirimStatusWebGL(
  container: HTMLElement,
  state: 'ready' | 'lost' | 'unavailable',
): void {
  container.dataset.webglState = state;
  const reason = state === 'ready' ? 'restored' : state;
  container.dispatchEvent(
    new CustomEvent('kelirwebglstatus', {
      bubbles: true,
      detail: { state, ok: state === 'ready', reason },
    }),
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
    if (!gl) {
      kirimStatusWebGL(container, 'unavailable');
      return null;
    }

    const width = Math.max(container.clientWidth || 320, 1);
    const height = Math.max(container.clientHeight || 240, 1);
    const mobile = isMobileGpuProfile();
    const dpr = window.devicePixelRatio || 1;
    // Pada layar HiDPI seluler (>=2x), nonaktifkan MSAA berat agar fillrate tetap ringan & tajam
    const useAntialias = mobile && dpr >= 2 ? false : (opts.antialias ?? true);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: useAntialias,
      alpha: opts.alpha ?? true,
      stencil: false,
      powerPreference: 'high-performance',
    });

    const maxDpr = mobile ? 1.2 : 1.5;
    renderer.setPixelRatio(Math.min(dpr, maxDpr));
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
    canvas.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      kirimStatusWebGL(container, 'lost');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      kirimStatusWebGL(container, 'ready');
    });
    container.querySelectorAll('canvas').forEach((el) => el.remove());
    container.prepend(canvas);
    kirimStatusWebGL(container, 'ready');
    return renderer;
  } catch {
    kirimStatusWebGL(container, 'unavailable');
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
      return tandaiTeksturCacheBersama(tex);
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

export function scheduleIdleWork(fn: () => void, minDelayMs = 110): () => void {
  if (typeof window === 'undefined') {
    fn();
    return () => undefined;
  }
  let cancelled = false;
  let idleHandle: number | null = null;
  const winIdle = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  const run = (): void => {
    if (cancelled) return;
    if (winIdle.requestIdleCallback) {
      idleHandle = winIdle.requestIdleCallback(
        () => {
          idleHandle = null;
          if (!cancelled) fn();
        },
        { timeout: 450 },
      );
    } else {
      fn();
    }
  };

  const timerId = window.setTimeout(run, Math.max(0, minDelayMs));
  return () => {
    cancelled = true;
    window.clearTimeout(timerId);
    if (idleHandle !== null && winIdle.cancelIdleCallback) {
      winIdle.cancelIdleCallback(idleHandle);
    }
  };
}

/**
 * Menunggu 1 frame paint UI lalu melakukan kompilasi shader paralel asinkron (`compileAsync`)
 * sebelum memulai loop render agar transisi antar-halaman tidak membeku.
 */
export function jalankanLoopSetelahSiap(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  shouldContinue: () => boolean,
  startLoop: () => void,
  maxCompileWaitMs = 180,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  let cancelled = false;
  let started = false;
  let rafId: number | null = null;
  let timerId: number | null = null;

  const selesai = (): void => {
    if (cancelled || started) return;
    started = true;
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    if (shouldContinue()) {
      startLoop();
    }
  };

  rafId = window.requestAnimationFrame(() => {
    rafId = null;
    if (cancelled || !shouldContinue()) return;
    try {
      const gl = renderer.getContext();
      if (!gl || gl.isContextLost()) {
        selesai();
        return;
      }
      timerId = window.setTimeout(selesai, maxCompileWaitMs);
      const maybeAsync = (
        renderer as unknown as {
          compileAsync?: (s: THREE.Scene, c: THREE.Camera) => Promise<unknown>;
        }
      ).compileAsync?.(scene, camera);

      if (maybeAsync && typeof maybeAsync.then === 'function') {
        void maybeAsync.then(selesai, selesai);
      } else {
        selesai();
      }
    } catch {
      selesai();
    }
  });

  return () => {
    cancelled = true;
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    if (timerId !== null) window.clearTimeout(timerId);
  };
}

function ambilSceneStudioRingan(): THREE.Scene {
  if (cacheStudioBoxScene) return cacheStudioBoxScene;
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x28231d);

  const panels: Array<{
    pos: [number, number, number];
    rot: [number, number, number];
    scale: [number, number, number];
    color: number;
  }> = [
    // Softbox hangat utama dari atas
    { pos: [0, 8, 0], rot: [Math.PI / 2, 0, 0], scale: [14, 14, 1], color: 0xfff3de },
    // Key light kanan hangat
    { pos: [8, 3, 4], rot: [0, -Math.PI / 2, 0], scale: [10, 8, 1], color: 0xffe4be },
    // Fill light kiri sejuk
    { pos: [-8, 2, 3], rot: [0, Math.PI / 2, 0], scale: [10, 8, 1], color: 0xcbe0fa },
    // Rim accent bara hangat belakang
    { pos: [0, 3, -8], rot: [0, 0, 0], scale: [10, 6, 1], color: 0xffa66b },
    // Lantai pantul kayu hangat
    { pos: [0, -6, 0], rot: [-Math.PI / 2, 0, 0], scale: [14, 14, 1], color: 0x3b2f24 },
  ];

  const planeGeo = new THREE.PlaneGeometry(1, 1);
  for (const p of panels) {
    const m = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: p.color }));
    m.position.set(p.pos[0], p.pos[1], p.pos[2]);
    m.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
    m.scale.set(p.scale[0], p.scale[1], p.scale[2]);
    s.add(m);
  }
  cacheStudioBoxScene = s;
  return s;
}

export async function applyStudioHDR(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  opts?: { signal?: AbortSignal; delayMs?: number },
): Promise<void> {
  if (opts?.signal?.aborted) return;

  await new Promise<void>((resolve) => {
    const delayMs = opts?.delayMs ?? 90;
    const cancelIdle = scheduleIdleWork(() => {
      resolve();
    }, delayMs);
    if (opts?.signal) {
      opts.signal.addEventListener(
        'abort',
        () => {
          cancelIdle();
          resolve();
        },
        { once: true },
      );
    }
  });

  if (opts?.signal?.aborted) return;
  try {
    const gl = renderer.getContext();
    if (!gl || gl.isContextLost()) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(ambilSceneStudioRingan(), 0.04);
    scene.userData.__envRT = envRT;
    scene.environment = envRT.texture;
    pmrem.dispose();
  } catch {
    // Abaikan aman jika panggung telah dibuang sebelum PMREM selesai dibuat
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

  const cacheEdges = new Map<THREE.BufferGeometry, THREE.EdgesGeometry>();
  for (const mesh of meshes) {
    let edges = cacheEdges.get(mesh.geometry);
    if (!edges) {
      edges = new THREE.EdgesGeometry(mesh.geometry, 22);
      cacheEdges.set(mesh.geometry, edges);
    }
    const segments = new THREE.LineSegments(edges.clone(), lineMat);
    segments.userData.isCadOverlay = true;
    segments.renderOrder = 4;
    segments.visible = initialOpacity > 0.01;
    mesh.add(segments);
  }

  for (const edgeGeo of cacheEdges.values()) {
    edgeGeo.dispose();
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

const SLOT_TEKSTUR_MATERIAL = [
  'map',
  'normalMap',
  'roughnessMap',
  'bumpMap',
  'emissiveMap',
  'aoMap',
  'alphaMap',
  'metalnessMap',
  'envMap',
] as const;

function disposeMaterialDenganTekstur(mat: THREE.Material): void {
  const matRecord = mat as unknown as Record<string, unknown>;
  for (const key of SLOT_TEKSTUR_MATERIAL) {
    const tex = matRecord[key];
    if (tex instanceof THREE.Texture && !tex.userData?.sharedCache) {
      tex.dispose();
    }
  }
  mat.dispose();
}

export function disposeSceneObject(obj: THREE.Object3D): void {
  if (obj instanceof THREE.Scene) {
    const envRT = obj.userData.__envRT as THREE.WebGLRenderTarget | undefined;
    if (envRT) {
      envRT.dispose();
      delete obj.userData.__envRT;
    }
    if (obj.environment) {
      obj.environment.dispose();
      obj.environment = null;
    }
  }
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => disposeMaterialDenganTekstur(m));
    } else if (mat) {
      disposeMaterialDenganTekstur(mat);
    }
  });
}
