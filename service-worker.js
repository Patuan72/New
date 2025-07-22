self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('pwa-cache').then(function(cache) {
      return cache.addAll([
    './service-worker.js',
    'https://cdn.jsdelivr.net/npm/meyda/dist/web/meyda.min.js',
        './index.html',
        './style.css',
        './script.js',
        './unit1.json',
        './unit2.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
