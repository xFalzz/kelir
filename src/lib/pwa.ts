export interface PwaInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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

/** Mendaftarkan Service Worker KELIR pada build produksi (sw.js) untuk dukungan luring & instalasi PWA. */
export async function daftarkanServiceWorker(
  swUrl = '/sw.js',
  isProd: boolean = Boolean(import.meta.env?.PROD),
): Promise<boolean> {
  if (typeof window === 'undefined' || !isProd) return false;
  if (!('serviceWorker' in navigator)) return false;
  try {
    await navigator.serviceWorker.register(swUrl, { scope: '/' });
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
