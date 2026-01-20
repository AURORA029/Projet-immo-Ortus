const CACHE_NAME = 'ortus-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './biens.html',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/home.js',
  // On ne met PAS les données Google Sheets ici pour qu'elles soient toujours à jour !
];

// 1. Installation du Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Récupération des fichiers (Stratégie : Cache ou Réseau)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
