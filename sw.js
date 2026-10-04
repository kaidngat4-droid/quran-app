const CACHE_NAME = 'quran-app-v38';
const IMG_CACHE = 'quran-img-v1';
const IMG_LIMIT = 700;

const CORE = [
  './', './index.html', './manifest.json', './style.css',
  './quran.json', './pages.json', './page-flip.browser.js',
  './app.js', './offline-audio.js', './mushaf.js', './flipbook.js', './mushaf-zoom.js', './zoom.js',
  './position.js', './settings.js', './prayer.js', './adhkar.js', './extras.js',
  './parts.js', './juz-complete.js', './adhan-auto.js', './adhan-native.js',
  './images/mosque.jpg', './images/icon-192.png', './images/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) =>
    Promise.allSettled(CORE.map((u) => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(
    ks.filter((k) => k !== CACHE_NAME && k !== IMG_CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

async function trim(cache, max) {
  const ks = await cache.keys();
  if (ks.length > max) await Promise.all(ks.slice(0, ks.length - max).map((k) => cache.delete(k)));
}
async function cacheFirst(req, name, limit) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const c = await caches.open(name);
      c.put(req, res.clone());
      if (limit) trim(c, limit);
    }
    return res;
  } catch (_) { return Response.error(); }
}
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch (_) { return (await caches.match(req)) || Response.error(); }
}
async function swr(event) {
  const req = event.request;
  const c = await caches.open(CACHE_NAME);
  const hit = await c.match(req);
  const net = fetch(req, { cache: 'no-cache' })
    .then((res) => { if (res.ok) c.put(req, res.clone()); return res; })
    .catch(() => null);
  event.waitUntil(net);
  if (hit) return hit;
  return (await net) || (await caches.match('./index.html')) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (/\.(mp3|m4a)$/i.test(url.pathname) ||
      url.hostname.includes('cdn.islamic.network') ||
      url.hostname.includes('fonts.googleapis')) return;

  if (url.hostname === 'api.alquran.cloud') return e.respondWith(networkFirst(req));
  if (req.destination === 'image') return e.respondWith(cacheFirst(req, IMG_CACHE, IMG_LIMIT));
  if (url.origin === location.origin) {
    if (/\.json$/.test(url.pathname)) return e.respondWith(cacheFirst(req, CACHE_NAME));
    return e.respondWith(swr(e));
  }
});
