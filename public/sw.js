const CACHE_VERSION = 'kelir-pwa-v2';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon-180.png',
  '/og-kelir.png',
];

function buatOfflineResponse(status = 504, pesan = 'Offline') {
  return new Response(pesan, {
    status,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_VERSION);
  const unik = Array.from(new Set(APP_SHELL_URLS));
  const batchSize = 6;

  for (let i = 0; i < unik.length; i += batchSize) {
    const slice = unik.slice(i, i + batchSize);
    await Promise.allSettled(
      slice.map(async (url) => {
        const isImmutable = url.startsWith('/assets/');
        const req = new Request(url, { cache: isImmutable ? 'default' : 'reload' });
        const res = await fetch(req);
        if (res && res.ok && res.type === 'basic') {
          await cache.put(new Request(url), res);
        }
      }),
    );
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('kelir-pwa-') && key !== CACHE_VERSION)
            .map((oldKey) => caches.delete(oldKey)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function tanganiNavigasi(req, url) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic' && !res.redirected) {
      await cache.put(req, res.clone());
      if (url.pathname === '/' || url.pathname === '/index.html') {
        await cache.put(new Request('/'), res.clone());
      }
    }
    return res;
  } catch {
    return (
      (await cache.match(req)) ||
      (await cache.match('/')) ||
      (await cache.match('/index.html')) ||
      (await cache.match(req, { ignoreSearch: true })) ||
      buatOfflineResponse(503, 'Aplikasi KELIR sedang luring dan halaman belum tersimpan di cache.')
    );
  }
}

async function cacheFirstAsset(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') {
      await cache.put(req, res.clone());
    }
    return res;
  } catch {
    return buatOfflineResponse(504, 'Aset luring belum tersedia.');
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);

  const networkPromise = fetch(req)
    .then(async (res) => {
      if (res && res.ok && res.type === 'basic') {
        await cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    void networkPromise;
    return cached;
  }

  const netRes = await networkPromise;
  return netRes || buatOfflineResponse(504, 'Sumber daya luring belum tersedia.');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(tanganiNavigasi(req, url));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstAsset(req));
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/textures/') ||
    url.pathname.startsWith('/mediapipe/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/og-kelir.png' ||
    url.pathname === '/og-kelir.svg' ||
    url.pathname === '/llms.txt' ||
    url.pathname === '/robots.txt';

  if (!isStaticAsset) return;

  event.respondWith(staleWhileRevalidate(req));
});
