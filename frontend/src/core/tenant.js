/**
 * DEPO TAKİP - Şirket (tenant) yükleyici
 *
 * Uygulama açılırken ./tenant.json dosyasını okur, AppConfig'i günceller,
 * renkleri / başlığı / favicon'u uygular. Yönetim Paneli önizlemesinde
 * (iframe) panelden gelen canlı ayarları da dinler.
 */

import AppConfig, { setTenantConfig } from './config.js';

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setFavicon(href) {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

function luminance(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
  if (!m) return null;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readableOn(hex) {
  const lum = luminance(hex);
  if (lum == null) return '#fff';
  return lum > 0.5 ? '#1A1D26' : '#fff';
}

/** Açık zeminde görünen ikinci vurgu rengi: ikincil renk çok açıksa (beyaz gibi) ana renge döner */
function secondaryAccent(t) {
  const lum = luminance(t.secondary);
  if (lum != null && lum < 0.55) return t.secondaryDark || t.secondary;
  return t.primaryLight || t.primary;
}

export function applyBranding() {
  const t = AppConfig.theme;
  const root = document.documentElement.style;
  const vars = {
    '--primary': t.primary,
    '--primary-light': t.primaryLight,
    '--primary-dark': t.primaryDark,
    '--secondary': t.secondary,
    '--secondary-light': t.secondaryLight,
    '--secondary-dark': t.secondaryDark,
    '--accent': t.secondary,
    '--accent-light': t.secondaryLight,
    '--surface-dark': t.surface,
  };
  Object.entries(vars).forEach(([k, v]) => v && root.setProperty(k, v));
  // Ana renk üzerinde okunaklı yazı rengi (açık renklerde koyu yazı)
  root.setProperty('--on-primary', readableOn(t.primary));
  root.setProperty('--accent-2', secondaryAccent(t));
  // Şirket renkleriyle vurgu (tenant.json › theme.brandAccents): modül renkleri ana rengin tonlarından türetilir
  const mods = ['transfer', 'vehicle', 'sales', 'purchase', 'stock', 'reports', 'help', 'copilot'];
  if (t.brandAccents) {
    const tones = [t.primary, t.primaryDark || t.primary, t.primaryLight || t.primary];
    mods.forEach((m, i) => {
      const c = tones[i % tones.length];
      root.setProperty(`--color-${m}`, c);
      root.setProperty(`--color-${m}-light`, `color-mix(in srgb, ${c} 10%, #fff)`);
    });
    root.setProperty('--color-settings', '#5B6474');
    root.setProperty('--color-stock-detail-header', t.primary);
    root.setProperty('--color-serial-header', t.primaryDark || t.primary);
    document.body.classList.add('brand-accents');
  } else {
    mods.concat(['settings', 'stock-detail-header', 'serial-header']).forEach((m) => { root.removeProperty(`--color-${m}`); root.removeProperty(`--color-${m}-light`); });
    document.body.classList.remove('brand-accents');
  }
  root.setProperty('--logo-zoom', String(AppConfig.logoZoom / 100));
  root.setProperty('--logo-x', `${AppConfig.logoOffsetX}%`);
  root.setProperty('--logo-y', `${AppConfig.logoOffsetY}%`);

  document.title = AppConfig.appName;
  setMeta('theme-color', t.surface || t.primary);
  setMeta('description', AppConfig.appDescription);
  setMeta('apple-mobile-web-app-title', AppConfig.shortName);
  setFavicon(AppConfig.logoUrl);
}

export async function loadTenant() {
  let tenant = {};
  try {
    const res = await fetch('./tenant.json', { cache: 'no-store' });
    if (res.ok) tenant = await res.json();
    else console.warn('tenant.json bulunamadı, varsayılan ayarlar kullanılıyor.');
  } catch (e) {
    console.warn('tenant.json okunamadı, varsayılan ayarlar kullanılıyor.', e);
  }
  setTenantConfig(tenant);
  applyBranding();
  return AppConfig;
}

/**
 * Panel önizlemesi: sadece aynı origin'deki üst pencereden gelen mesajları kabul eder.
 * onUpdate: ayarlar değişince sayfayı yeniden çizmek için çağrılır.
 */
export function listenForPreview({ onUpdate, onNavigate }) {
  if (window.parent === window) return;
  document.documentElement.classList.add('in-preview'); // panel önizlemesi: ağır efektler kapalı
  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin || !e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'tenant-preview') {
      setTenantConfig(e.data.tenant || {});
      applyBranding();
      onUpdate?.();
    } else if (e.data.type === 'preview-navigate') {
      onNavigate?.(e.data.route);
    }
  });
  window.parent.postMessage({ type: 'preview-ready' }, window.location.origin);
}
