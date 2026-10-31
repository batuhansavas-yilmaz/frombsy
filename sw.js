const CACHE_NAME = 'frombsy-v16';
const FONT_CACHE = 'frombsy-fonts-v1';
const APP_SHELL = [
  './',
  './index.html',
  './shared.css',
  './assets/fonts/fonts.css',
  './assets/fonts/font-01-LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko70yyygA.woff2',
  './assets/fonts/font-02-LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko50yyygA.woff2',
  './assets/fonts/font-03-LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko40yyygA.woff2',
  './assets/fonts/font-04-LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
  './assets/fonts/font-05-e3t4euO8T-267oIAQAu6jDQyK3nYivN04w.woff2',
  './assets/fonts/font-06-e3t4euO8T-267oIAQAu6jDQyK3nRivN04w.woff2',
  './assets/fonts/font-07-e3t4euO8T-267oIAQAu6jDQyK3nWivN04w.woff2',
  './assets/fonts/font-08-e3t4euO8T-267oIAQAu6jDQyK3nbivN04w.woff2',
  './assets/fonts/font-09-e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2',
  './assets/fonts/font-10-m8JXjfVPf62XiF7kO-i9YL1la1OD.woff2',
  './assets/fonts/font-11-m8JXjfVPf62XiF7kO-i9YLNlaw.woff2',
  './assets/fonts/font-12-m8JUjfVPf62XiF7kO-i9aAhAfmKi2Oud.woff2',
  './assets/fonts/font-13-m8JUjfVPf62XiF7kO-i9aAhAfmyi2A.woff2',
  './manifest.webmanifest',
  './assets/apple-touch-icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo.png',
  './assets/hesapmatik.png',
  './assets/oyunmasasi.png',
  './assets/qrgen.svg',
  './assets/kilit.png',
  './assets/synpu.png',
  './assets/textrec.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
      .map((key) => caches.delete(key)));
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map((url) =>
      cache.match(url).then((hit) => hit || cache.add(url).catch(() => {}))
    ));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(FONT_CACHE).then((cache) =>
          cache.match(request).then((cached) => {
            const network = fetch(request).then((response) => {
              if (response.ok || response.type === 'opaque') {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => cached);
            return cached || network;
          })
        )
      );
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match('./index.html');
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html', response.clone());
        }
        return response;
      } catch (e) {
        return (await caches.match('./')) || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

