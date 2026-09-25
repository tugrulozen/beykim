/**
 * DEPO TAKİP - Servis çalışanı (uygulama kabuğu önbelleği)
 *
 * Amaç: depo içinde sinyal zayıfken uygulamanın açılması ve her açılışın hızlı olması.
 *
 * Kurallar:
 *   - /api ve tenant.json   → asla önbelleğe alınmaz (veri her zaman sunucudan gelir)
 *   - assets/ (içerik özetli dosya adları) → önbellekten, yoksa ağdan
 *   - index.html            → önce ağ, ulaşılamazsa önbellek (güncellemeler hemen görünür)
 *
 * Kapatmak için: tarayıcı konsolunda  localStorage.setItem('sw_off','1')  + sayfayı yenileyin.
 */
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['./', './index.html']).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'clear-cache') caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_e) { return; }
  if (url.origin !== self.location.origin) return;

  // Veri istekleri hiçbir zaman önbelleğe alınmaz
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/tenant.json') || url.pathname.includes('/panel-api/')) return;

  // İçerik özetli varlıklar: önbellekten ver, yoksa indir ve sakla
  if (url.pathname.includes('/assets/') || /\.(?:woff2|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
    return;
  }

  // Sayfa isteği: önce ağ (güncel sürüm), bağlantı yoksa önbellekteki kabuk
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(SHELL).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./'))),
    );
  }
});
