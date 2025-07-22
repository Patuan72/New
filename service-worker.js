self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('pwa-cache').then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './script.js',
        './manifest.json',
        './service-worker.js',
        'https://cdn.jsdelivr.net/npm/meyda/dist/web/meyda.min.js',
        './unit1.json',
        './unit2.json',
        './unit3.json',
        './unit4.json',
        './unit5.json',
        './unit6.json',
        './unit7.json',
        './unit8.json',
        './unit9.json',
        './unit10.json',
        './unit11.json',
        './unit12.json',
        './unit13.json',
        './unit14.json',
        './unit15.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
