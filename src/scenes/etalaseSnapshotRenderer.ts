import * as THREE from 'three';
import {
  buildBatikPusaka3D,
  buildJogloPusaka3D,
  buildKerisPusaka3D,
  buildKidangDanBlencong3D,
  buildSaronPusaka3D,
  buildWayangSriRamaDanBlencong3D,
  type PaketModel3D,
} from './pusaka3DBuilder.ts';
import { disposeSceneObject, loadBudayaTextures } from './threeHelpers.ts';

interface PresetKameraEtalase {
  build: () => PaketModel3D;
  camPos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  modelRot: [number, number, number];
  explodeAmount: number;
  showPlinth: boolean;
}

const PRESET_ETALASE: Record<string, PresetKameraEtalase> = {
  'et-keris-pamor': {
    build: buildKerisPusaka3D,
    camPos: [0.68, 0.54, 2.75],
    lookAt: [0.06, 0.08, 0],
    fov: 34,
    modelRot: [0.06, 0.28, -0.2],
    explodeAmount: 0,
    showPlinth: false,
  },
  'et-saron-slendro': {
    build: buildSaronPusaka3D,
    camPos: [0.92, 1.15, 2.48],
    lookAt: [0, 0.08, 0],
    fov: 34,
    modelRot: [0.05, -0.32, 0],
    explodeAmount: 0,
    showPlinth: true,
  },
  'et-batik-kawung': {
    build: buildBatikPusaka3D,
    camPos: [0.82, 0.5, 2.65],
    lookAt: [0.08, 0.16, 0.08],
    fov: 33,
    modelRot: [0, -0.24, 0],
    explodeAmount: 0,
    showPlinth: true,
  },
  'et-joglo-tumpangsari': {
    build: buildJogloPusaka3D,
    camPos: [1.68, 0.58, 3.18],
    lookAt: [0, 0.14, 0],
    fov: 36,
    modelRot: [0, 0.58, 0],
    explodeAmount: 0.22,
    showPlinth: true,
  },
  'et-wayang-rama': {
    build: buildWayangSriRamaDanBlencong3D,
    camPos: [0.62, 0.2, 3.68],
    lookAt: [-0.02, 0.14, 0],
    fov: 36,
    modelRot: [0, -0.18, 0],
    explodeAmount: 0,
    showPlinth: true,
  },
  'et-wayang-kidang': {
    build: buildKidangDanBlencong3D,
    camPos: [0.7, 0.24, 3.22],
    lookAt: [0, 0.14, 0],
    fov: 35,
    modelRot: [0, 0.28, 0],
    explodeAmount: 0,
    showPlinth: true,
  },
  'et-keris-warangka': {
    build: buildKerisPusaka3D,
    camPos: [1.02, 0.16, 2.46],
    lookAt: [0.24, -0.22, -0.16],
    fov: 34,
    modelRot: [0.04, -0.5, 0.06],
    explodeAmount: 0.22,
    showPlinth: false,
  },
  'et-joglo-umpak': {
    build: buildJogloPusaka3D,
    camPos: [1.38, -0.48, 1.62],
    lookAt: [0.26, -0.78, 0.22],
    fov: 33,
    modelRot: [0, 0.62, 0],
    explodeAmount: 0,
    showPlinth: false,
  },
};

const snapshotCache = new Map<string, Record<string, string>>();
const pendingRenders = new Map<string, Promise<Record<string, string>>>();

async function tungguTeksturBudaya(maxWaitMs = 70): Promise<void> {
  const tex = loadBudayaTextures();
  const candidates = [tex.kayuDiffuse, tex.kayuNormal, tex.kulitNormal].filter(
    (t): t is THREE.Texture => Boolean(t),
  );
  const mulai = performance.now();

  while (performance.now() - mulai < maxWaitMs) {
    const semuaSiap = candidates.every((t) => {
      const img = t.image as HTMLImageElement | undefined;
      return !img || img.complete;
    });
    if (semuaSiap) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

function terapkanExplodeLapisan(root: THREE.Object3D, faktor: number): void {
  if (faktor <= 0.001) return;
  root.traverse((obj) => {
    const vec = obj.userData.explodeVec as THREE.Vector3 | undefined;
    if (!vec) return;
    obj.position.addScaledVector(vec, faktor);
  });
}

export async function renderEtalaseSnapshots(
  tema: 'malam' | 'terang',
): Promise<Record<string, string>> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {};
  }

  const cached = snapshotCache.get(tema);
  if (cached) return cached;

  const ongoing = pendingRenders.get(tema);
  if (ongoing) return ongoing;

  const job = (async (): Promise<Record<string, string>> => {
    await tungguTeksturBudaya();

    const width = 480;
    const height = 312;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const gl =
      canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: true }) ||
      canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: true });
    if (!gl) return {};

    let renderer: THREE.WebGLRenderer | null = null;
    const hasil: Record<string, string> = {};

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = tema === 'terang' ? 1.24 : 1.32;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const scene = new THREE.Scene();
      const isTerang = tema === 'terang';
      const bgHex = isTerang ? 0xf2ece1 : 0x161310;
      scene.background = new THREE.Color(bgHex);
      scene.fog = new THREE.FogExp2(bgHex, 0.06);

      // Pencahayaan studio multi-titik kaya pantulan tanpa biaya PMREM cubemap
      const ambient = new THREE.AmbientLight(
        isTerang ? 0xfff8ef : 0xffe6cc,
        isTerang ? 1.28 : 0.92,
      );
      const hemi = new THREE.HemisphereLight(
        isTerang ? 0xfffdf8 : 0xffe8cb,
        isTerang ? 0xc2b39d : 0x2a1f16,
        isTerang ? 1.35 : 0.98,
      );
      const keyLight = new THREE.DirectionalLight(
        isTerang ? 0xfff7ea : 0xffecd6,
        isTerang ? 2.65 : 3.05,
      );
      keyLight.position.set(3.4, 5.2, 4.1);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(512, 512);
      keyLight.shadow.bias = -0.0006;

      const rimLight = new THREE.DirectionalLight(
        isTerang ? 0xf59e0b : 0xf27c4e,
        isTerang ? 1.25 : 1.75,
      );
      rimLight.position.set(-3.2, 2.2, -3.0);

      const specularKicker = new THREE.DirectionalLight(0xffffff, isTerang ? 1.15 : 0.95);
      specularKicker.position.set(2.2, -0.6, 3.6);

      const fillLight = new THREE.PointLight(
        isTerang ? 0xfef3c7 : 0xd97706,
        isTerang ? 0.85 : 1.55,
        14,
      );
      fillLight.position.set(-2.2, 0.6, 2.6);

      scene.add(ambient, hemi, keyLight, rimLight, specularKicker, fillLight);

      const studioFloor = new THREE.Mesh(
        new THREE.CircleGeometry(6.5, 40),
        new THREE.MeshStandardMaterial({
          color: isTerang ? 0xe8e0d2 : 0x1b1713,
          roughness: 0.88,
          metalness: 0.06,
        }),
      );
      studioFloor.rotation.x = -Math.PI / 2;
      studioFloor.position.y = -1.65;
      studioFloor.receiveShadow = true;
      scene.add(studioFloor);

      const plinthGroup = new THREE.Group();
      const plinthDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.18, 1.24, 0.14, 40),
        new THREE.MeshStandardMaterial({
          color: isTerang ? 0xdfd5c5 : 0x241f19,
          roughness: 0.65,
          metalness: 0.18,
        }),
      );
      plinthDisc.receiveShadow = true;
      const plinthBrassRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.19, 0.016, 10, 40),
        new THREE.MeshStandardMaterial({
          color: 0xd6ad5e,
          metalness: 0.88,
          roughness: 0.24,
        }),
      );
      plinthBrassRing.rotation.x = Math.PI / 2;
      plinthBrassRing.position.y = 0.068;
      plinthGroup.add(plinthDisc, plinthBrassRing);
      scene.add(plinthGroup);

      const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);

      for (const [id, preset] of Object.entries(PRESET_ETALASE)) {
        const paket = preset.build();
        const root = paket.group;
        root.rotation.set(...preset.modelRot);
        terapkanExplodeLapisan(root, preset.explodeAmount);

        root.traverse((obj) => {
          const m = obj as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });

        root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const radiusNeed = Math.max(size.x, size.z) * 0.58;
        const plinthScale = Math.max(1.0, Math.min(1.65, radiusNeed / 1.18));

        plinthGroup.visible = preset.showPlinth;
        plinthGroup.scale.set(plinthScale, 1, plinthScale);
        plinthGroup.position.y = box.min.y - 0.072;
        studioFloor.position.y = plinthGroup.position.y - 0.075;

        scene.add(root);
        camera.fov = preset.fov;
        camera.updateProjectionMatrix();
        camera.position.set(...preset.camPos);
        camera.lookAt(...preset.lookAt);

        renderer.render(scene, camera);
        const webp = canvas.toDataURL('image/webp', 0.9);
        hasil[id] = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');

        scene.remove(root);
        disposeSceneObject(root);

        // Serahkan giliran frame sejenak agar scroll utama bebas patah-patah
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }

      disposeSceneObject(studioFloor);
      disposeSceneObject(plinthGroup);
      snapshotCache.set(tema, hasil);
      return hasil;
    } catch {
      return {};
    } finally {
      renderer?.dispose();
      pendingRenders.delete(tema);
    }
  })();

  pendingRenders.set(tema, job);
  return job;
}
