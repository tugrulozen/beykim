/**
 * DEPO TAKİP - Ana ekrana eklenebilir uygulama (PWA)
 *
 * Her şirketin kendi adı, rengi ve logosuyla telefona kurulabilmesi için
 * manifest dosyası çalışma anında tenant.json'dan üretilir (sabit dosya yok).
 * Ayrıca uygulama kabuğu önbelleğe alınır: depo içinde sinyal zayıfken
 * uygulama yine de açılır (veri için bağlantı gerekir).
 *
 * Servis çalışanını kapatmak için: localStorage.setItem('sw_off', '1') + sayfayı yenileyin.
 */
import AppConfig from './config.js';

/** Logoyu kare bir PNG'ye çizer (manifest ikonu). Logo yüklenemezse baş harf kullanılır. */
function makeIcon(size, { maskable = false } = {}) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const bg = AppConfig.theme?.surface || AppConfig.theme?.primary || '#0F2240';
    ctx.fillStyle = bg;
    if (maskable) ctx.fillRect(0, 0, size, size);
    else {
      const r = size * 0.22;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, size, size, r) : ctx.rect(0, 0, size, size);
      ctx.fill();
    }
    const done = () => resolve(canvas.toDataURL('image/png'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // maskable ikonlarda kenarlarda güvenli boşluk bırakılır
      const pad = maskable ? size * 0.22 : size * 0.16;
      const box = size - pad * 2;
      const scale = Math.min(box / img.width, box / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      done();
    };
    img.onerror = () => {
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${size * 0.45}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((AppConfig.companyName || '?').trim().charAt(0).toLocaleUpperCase('tr'), size / 2, size / 2 + size * 0.02);
      done();
    };
    img.src = AppConfig.logoUrl;
  });
}

async function buildManifest() {
  const [i192, i512, maskable] = await Promise.all([makeIcon(192), makeIcon(512), makeIcon(512, { maskable: true })]);
  const manifest = {
    name: AppConfig.appName,
    short_name: AppConfig.shortName || AppConfig.appName,
    description: AppConfig.appDescription,
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: AppConfig.theme?.surface || '#0F2240',
    theme_color: AppConfig.theme?.surface || AppConfig.theme?.primary || '#0F2240',
    lang: 'tr',
    icons: [
      { src: i192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: i512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
  let link = document.querySelector('link[rel="manifest"]');
  if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
  link.href = url;

  // iOS: ana ekran ikonu manifest'i okumaz, ayrı etiket ister
  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) { apple = document.createElement('link'); apple.rel = 'apple-touch-icon'; document.head.appendChild(apple); }
  apple.href = i192;
}

/** "Ana ekrana ekle" düğmesi: tarayıcı hazır olduğunu bildirince Ayarlar sayfasında görünür */
let deferredPrompt = null;
export const canInstall = () => !!deferredPrompt;
export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-install-state'));
  return outcome === 'accepted';
}

export function initPwa() {
  buildManifest().catch(() => { /* ikon üretilemezse uygulama normal çalışır */ });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-state'));
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-install-state'));
  });

  // Uygulama kabuğu önbelleği (yalnızca https veya localhost'ta çalışır).
  // Yönetim paneli önizlemesinde (iframe) kapalıdır: panel her zaman en son derlemeyi göstermelidir.
  const inPreview = window.parent !== window;
  if ('serviceWorker' in navigator && !inPreview && localStorage.getItem('sw_off') !== '1') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { /* alt dizinde kapalıysa sorun değil */ });
    });
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  }
}
