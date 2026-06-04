// DaLentini — service worker (offline-first)
const CACHE = 'dalentini-v1';
const ASSETS = [
  './', './index.html', './Brand%20Guidelines.html', './Menu%20Generator.html',
  './menu-data.js', './menu-generator.css',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './manifest.webmanifest'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
