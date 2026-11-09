// wersja 202611091302: działa bez internetu, a nową wersję pobiera w tle
const CACHE = 'forma-demo-202611091302';
const SHELL = ["./","index.html","app.js","styles.css","charts.js","data.js","methods.js","anatomy.js","vendor/motion.js","fonts/fonts.css","manifest.webmanifest","icons/icon-180.png","apple-touch-icon.png","fonts/barlow-condensed-500-latin-ext.woff2","fonts/barlow-condensed-500-latin.woff2","fonts/barlow-condensed-600-latin-ext.woff2","fonts/barlow-condensed-600-latin.woff2","fonts/barlow-condensed-700-latin-ext.woff2","fonts/barlow-condensed-700-latin.woff2","fonts/clash-display-400.woff2","fonts/clash-display-500.woff2","fonts/clash-display-600.woff2","fonts/clash-display-700.woff2","fonts/geist-latin-ext.woff2","fonts/geist-latin.woff2","fonts/inter-latin-ext.woff2","fonts/inter-latin.woff2"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('forma-demo-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
