import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  attachCadWireframeLayer,
  createSafeWebGLRenderer,
  disposeSceneObject,
  kirimStatusWebGL,
  tandaiTeksturCacheBersama,
} from '../../src/scenes/threeHelpers.ts';

function buatMockContainer(): {
  container: HTMLElement;
  events: Array<CustomEvent<{ state: string; ok: boolean; reason: string }>>;
} {
  const events: Array<CustomEvent<{ state: string; ok: boolean; reason: string }>> = [];
  const dataset: Record<string, string> = {};
  const container = {
    clientWidth: 640,
    clientHeight: 480,
    dataset,
    dispatchEvent: (ev: Event) => {
      events.push(ev as CustomEvent<{ state: string; ok: boolean; reason: string }>);
      return true;
    },
  } as unknown as HTMLElement;
  return { container, events };
}

describe('Three.js Helpers WebGL Safety & GPU Resource Disposal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('memancarkan CustomEvent kelirwebglstatus dengan bubbles:true dan dataset state', () => {
    class MockCustomEvent<T = unknown> {
      type: string;
      bubbles: boolean;
      detail: T;
      constructor(type: string, init?: CustomEventInit<T>) {
        this.type = type;
        this.bubbles = Boolean(init?.bubbles);
        this.detail = init?.detail as T;
      }
    }
    vi.stubGlobal('CustomEvent', MockCustomEvent);

    const { container, events } = buatMockContainer();
    kirimStatusWebGL(container, 'unavailable');
    kirimStatusWebGL(container, 'lost');
    kirimStatusWebGL(container, 'ready');

    expect(container.dataset.webglState).toBe('ready');
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('kelirwebglstatus');
    expect(events[0].bubbles).toBe(true);
    expect(events[0].detail).toEqual({ state: 'unavailable', ok: false, reason: 'unavailable' });
    expect(events[1].detail).toEqual({ state: 'lost', ok: false, reason: 'lost' });
    expect(events[2].detail).toEqual({ state: 'ready', ok: true, reason: 'restored' });
  });

  it('createSafeWebGLRenderer mengembalikan null & mengirim status unavailable saat konteks WebGL null atau error', () => {
    class MockCustomEvent<T = unknown> {
      type: string;
      bubbles: boolean;
      detail: T;
      constructor(type: string, init?: CustomEventInit<T>) {
        this.type = type;
        this.bubbles = Boolean(init?.bubbles);
        this.detail = init?.detail as T;
      }
    }
    vi.stubGlobal('CustomEvent', MockCustomEvent);
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => null,
      }),
    });

    const { container, events } = buatMockContainer();
    const renderer = createSafeWebGLRenderer(container);
    expect(renderer).toBeNull();
    expect(container.dataset.webglState).toBe('unavailable');
    expect(events).toHaveLength(1);
    expect(events[0].detail.state).toBe('unavailable');

    vi.stubGlobal('document', {
      createElement: () => {
        throw new Error('DOM canvas disabled');
      },
    });
    const { container: errContainer, events: errEvents } = buatMockContainer();
    const errRenderer = createSafeWebGLRenderer(errContainer);
    expect(errRenderer).toBeNull();
    expect(errContainer.dataset.webglState).toBe('unavailable');
    expect(errEvents[0].detail.state).toBe('unavailable');
  });

  it('disposeSceneObject membuang tekstur milik sendiri tetapi melindungi sharedCache texture & membersihkan environment scene', () => {
    const ownedTex = new THREE.Texture();
    const ownedDisposeSpy = vi.spyOn(ownedTex, 'dispose');

    const sharedTex = tandaiTeksturCacheBersama(new THREE.Texture());
    const sharedDisposeSpy = vi.spyOn(sharedTex, 'dispose');

    expect(sharedTex.userData.sharedCache).toBe(true);
    expect(tandaiTeksturCacheBersama(null)).toBeNull();

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const geoDisposeSpy = vi.spyOn(geo, 'dispose');

    const mat = new THREE.MeshStandardMaterial({
      map: ownedTex,
      roughnessMap: sharedTex,
    });
    const matDisposeSpy = vi.spyOn(mat, 'dispose');

    const mesh = new THREE.Mesh(geo, mat);
    const scene = new THREE.Scene();
    const envTex = new THREE.Texture();
    const envDisposeSpy = vi.spyOn(envTex, 'dispose');
    const rtDisposeSpy = vi.fn();
    scene.environment = envTex;
    scene.userData.__envRT = { dispose: rtDisposeSpy };
    scene.add(mesh);

    disposeSceneObject(scene);

    expect(geoDisposeSpy).toHaveBeenCalledTimes(1);
    expect(matDisposeSpy).toHaveBeenCalledTimes(1);
    expect(ownedDisposeSpy).toHaveBeenCalledTimes(1);
    expect(sharedDisposeSpy).not.toHaveBeenCalled();
    expect(envDisposeSpy).toHaveBeenCalledTimes(1);
    expect(rtDisposeSpy).toHaveBeenCalledTimes(1);
    expect(scene.environment).toBeNull();
    expect(scene.userData.__envRT).toBeUndefined();
  });

  it('attachCadWireframeLayer menjaga LineSegments.visible=true saat initialOpacity=0 agar lineMat.visible dapat menyalakan wireframe', () => {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial(),
    );
    const skipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial(),
    );
    skipMesh.userData.skipCad = true;
    group.add(mesh, skipMesh);

    const lineMat = attachCadWireframeLayer(group, 0xff5a1f, 0);
    expect(lineMat.visible).toBe(false);

    const overlays: THREE.LineSegments[] = [];
    group.traverse((n) => {
      if (n instanceof THREE.LineSegments && n.userData.isCadOverlay) overlays.push(n);
    });
    expect(overlays).toHaveLength(1);
    expect(overlays[0].visible).toBe(true);

    lineMat.opacity = 0.96;
    lineMat.visible = true;
    expect(lineMat.visible).toBe(true);
    expect(overlays[0].visible).toBe(true);
    disposeSceneObject(group);
  });
});
