const CACHE_NAME = 'frombsy-v3';
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
  './assets/synpu.png',
  './assets/textrec.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
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
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
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
