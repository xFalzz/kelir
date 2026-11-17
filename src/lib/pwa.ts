export interface PwaInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface StatusPwaGlobal {
  deferredPrompt: PwaInstallPromptEvent | null;
  terpasang: boolean;
  offline: boolean;
}

const INTERVAL_CEK_UPDATE_SW_MS = 30 * 60 * 1000;

let pendengarTerpasang = false;
let deferredPromptGlobal: PwaInstallPromptEvent | null = null;
let terpasangGlobal = false;
let offlineGlobal = false;
const pelangganPwa = new Set<(status: StatusPwaGlobal) => void>();

function ambilSnapshotInternal(): StatusPwaGlobal {
  return {
    deferredPrompt: deferredPromptGlobal,
    terpasang: terpasangGlobal,
    offline: offlineGlobal,
  };
}

function kabariPelangganPwa(): void {
  const snapshot = ambilSnapshotInternal();
  for (const cb of pelangganPwa) {
    cb(snapshot);
  }
}

/** Memeriksa apakah aplikasi sedang berjalan dalam mode aplikasi terpasang (standalone PWA). */
export function cekModeStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = Boolean((window.navigator as { standalone?: boolean }).standalone);
  return mediaStandalone || iosStandalone;
}

/** Mendeteksi Safari pada iOS/iPadOS untuk menampilkan panduan Tambah ke Layar Utama yang sesuai. */
export function cekIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && isWebKit && !isOtherBrowser;
}

/**
 * Memasang pendengar event PWA (beforeinstallprompt, appinstalled, display-mode, online/offline)
 * sedini mungkin sebelum komponen UI ter-mount agar event instalasi tidak pernah terlewat.
 */
export function inisialisasiPendengarPwa(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  terpasangGlobal = cekModeStandalone();
  offlineGlobal = typeof navigator !== 'undefined' && navigator.onLine === false;

  if (pendengarTerpasang) return () => undefined;
  pendengarTerpasang = true;

  const onBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPromptGlobal = e as PwaInstallPromptEvent;
    kabariPelangganPwa();
  };

  const onAppInstalled = () => {
    terpasangGlobal = true;
    deferredPromptGlobal = null;
    kabariPelangganPwa();
  };

  const onOnline = () => {
    offlineGlobal = false;
    kabariPelangganPwa();
  };

  const onOffline = () => {
    offlineGlobal = true;
    kabariPelangganPwa();
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.addEventListener('appinstalled', onAppInstalled);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  const mq =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null;
  const onDisplayChange = (ev: MediaQueryListEvent) => {
    if (ev.matches || cekModeStandalone()) {
      terpasangGlobal = true;
      deferredPromptGlobal = null;
      kabariPelangganPwa();
    }
  };
  mq?.addEventListener?.('change', onDisplayChange);

  return () => {
    pendengarTerpasang = false;
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.removeEventListener('appinstalled', onAppInstalled);
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    mq?.removeEventListener?.('change', onDisplayChange);
  };
}

export function ambilStatusPwa(): StatusPwaGlobal {
  if (typeof window !== 'undefined') {
    if (cekModeStandalone()) terpasangGlobal = true;
    if (typeof navigator !== 'undefined') offlineGlobal = navigator.onLine === false;
  }
  return ambilSnapshotInternal();
}

export function berlanggananPwa(cb: (status: StatusPwaGlobal) => void): () => void {
  pelangganPwa.add(cb);
  cb(ambilStatusPwa());
  return () => {
    pelangganPwa.delete(cb);
  };
}

export function bersihkanDeferredPrompt(): void {
  if (!deferredPromptGlobal) return;
  deferredPromptGlobal = null;
  kabariPelangganPwa();
}

/** Mendaftarkan Service Worker KELIR pada build produksi (sw.js) untuk dukungan luring & pembaruan PWA. */
export async function daftarkanServiceWorker(
  swUrl = '/sw.js',
  isProd: boolean = Boolean(import.meta.env?.PROD),
): Promise<boolean> {
  if (typeof window === 'undefined' || !isProd) return false;
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
      updateViaCache: 'none',
    });

    let lastChecked = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastChecked < INTERVAL_CEK_UPDATE_SW_MS) return;
      lastChecked = now;
      void reg.update().catch(() => undefined);
    });

    return true;
  } catch {
    return false;
  }
}

/** Menjalankan dialog instalasi PWA native bila event beforeinstallprompt telah tersedia. */
export async function picuInstalasiPwa(
  deferredPrompt: PwaInstallPromptEvent | null,
): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  try {
    await deferredPrompt.prompt();
    const res = await deferredPrompt.userChoice;
    return res.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch {
    return 'unavailable';
  }
}
