const CACHE_NAME = 'ortus-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './accueil.html',
  './biens.html',
  './prestige.html',
  './services.html',
  './vendre.html',
  './apropos.html',
  './recrutement.html',
  './detail.html',
  './merci.html',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/home.js',
  './assets/js/listing.js',
  './assets/js/prestige.js',
  './assets/js/detail.js',
  './manifest.json',
  './assets/img/icon.png'
  // NOTE: Ne jamais cacher le CSV Google Sheets ici pour garantir les mises à jour en direct.
];

// Installation
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Récupération (Cache First, Network Fallback)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
