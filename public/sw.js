/* Sonnseite – Service Worker: macht die App offline nutzbar. Speichert nur App-Dateien, keine Nutzerdaten. */
const CACHE = 'sonnseite-v1.1.0';
const FILES = ['./', 'index.html', 'css/style.css', 'js/i18n.js', 'js/content/de.js', 'js/content/en.js', 'js/content/cs.js', 'js/audio.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Netzwerk zuerst (damit Updates sofort ankommen), bei fehlender Verbindung aus dem Cache. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match('index.html'))));
});
