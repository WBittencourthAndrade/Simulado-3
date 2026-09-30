/* Service worker do Especialista FCC — cache do app shell para uso offline.
   Chamadas à API do Gemini e ao banco nunca são cacheadas. */
const CACHE = 'fcc-app-v2';
const SHELL = ['/especialista-fcc.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Nunca intercepta IA/API
  if (url.hostname.includes('googleapis.com') || url.pathname.startsWith('/api/')) return;

  // Páginas: rede primeiro, cache como reserva (sempre pega a versão mais nova quando online)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/especialista-fcc.html')))
    );
    return;
  }

  // Demais arquivos (ícones, pdf.js): cache primeiro
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit)
    )
  );
});
