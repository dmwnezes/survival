// Tudo vem da rede quando há internet (página e scripts juntos, nunca versões misturadas);
// o cache só serve para jogar offline.
const CACHE = 'visagem-v3';
const JS = ['base', 'dados', 'extra', 'mundo', 'armas', 'jogo', 'desenho', 'telas'].map(n => './js/' + n + '.js');
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', ...JS];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { if (r.ok) { const c2 = r.clone(); caches.open(CACHE).then(c => c.put(req, c2)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
