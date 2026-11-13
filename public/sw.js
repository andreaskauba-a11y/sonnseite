/* Sonnseite – Service Worker: macht die App offline nutzbar. Speichert nur App-Dateien, keine Nutzerdaten. */
const CACHE = 'sonnseite-v1.3.1';
/* Sprachaufnahmen in einem eigenen Speicher: Ihr Name ändert sich nicht mit jeder Version, damit Handys sie nicht neu laden müssen.
   Eine Aufnahme ändert sich nie (der Dateiname ist eine Prüfsumme des Textes). */
const AUDIO_CACHE = 'sonnseite-audio-v1';
const FILES = ['./', 'index.html', 'css/style.css', 'audio/voices.js', 'audio/stille.mp3', 'js/i18n.js', 'js/content/de.js', 'js/content/en.js', 'js/content/cs.js', 'js/audio.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== AUDIO_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Netzwerk zuerst (damit Updates sofort ankommen), bei fehlender Verbindung aus dem Cache. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  /* Aufnahmen: zuerst aus dem Speicher, sonst laden und (nur bei Erfolg) merken */
  if (/\/audio\/[a-z]+\/[a-z]{2}\/[0-9a-f]{8}\.mp3$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(caches.open(AUDIO_CACHE).then((c) => c.match(e.request).then((m) => m || fetch(e.request).then((r) => { if (r.ok && r.status === 200) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((m) => m || caches.match('index.html'))));
});
