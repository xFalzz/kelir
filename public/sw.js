const CACHE_VERSION = 'kelir-pwa-v1';
const APP_SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/og-kelir.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        Promise.allSettled(
          APP_SHELL_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Endpoint AI & suara tetap jaringan langsung tanpa cache
  if (url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            void caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;
          const cachedRoot = await caches.match('/');
          return cachedRoot || Response.error();
        }),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/textures/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/og-kelir.svg';

  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            void cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
