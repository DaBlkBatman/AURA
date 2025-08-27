const CACHE_NAME = 'aura-cache-v1';
const ASSETS = [
  '/', '/index.html', '/style.css',
  '/script.js', '/app.js', '/manifest.json',
  '/moon-garden.mp4', '/lofi-jazz.mp3',
  // include model files if you want offline face-api.js
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
