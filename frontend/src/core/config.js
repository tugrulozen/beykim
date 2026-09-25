/**
 * DEPO TAKİP - Uygulama Yapılandırması (White-label)
 *
 * Varsayılanlar: ./defaults.json
 * Şirkete özel ayarlar: çalışma anında ./tenant.json dosyasından yüklenir
 * (bkz. ./tenant.js). tenant.json ve logo Yönetim Paneli'nden düzenlenir,
 * bu dosyada şirkete özel bir şey olmamalı.
 */

import defaults from './defaults.json';

const clone = (v) => JSON.parse(JSON.stringify(v));
const iconHtml = (cls) => (cls && cls.trim().startsWith('<') ? cls : `<i class="ph ${cls || 'ph-square'}"></i>`);

/** Logo yüklenmemiş şirketler için baş harfli yer tutucu (başka şirketin logosu asla görünmesin) */
function initialLogo(name, color) {
  const letter = (name || '?').trim().charAt(0).toLocaleUpperCase('tr') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${color}"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="52" font-weight="700" fill="#fff">${letter.replace(/[<&>"]/g, '')}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** id alanına göre listeleri birleştir: varsayılan sırası korunur, şirkete özel yeni öğeler sona eklenir */
function mergeById(base = [], override) {
  if (!Array.isArray(override)) return clone(base);
  const byId = new Map(override.map((o) => [o.id, o]));
  const merged = base.map((b) => ({ ...b, ...(byId.get(b.id) || {}) }));
  override.forEach((o) => { if (!base.some((b) => b.id === o.id)) merged.push({ ...o }); });
  // Şirket kendi sıralamasını kaydettiyse onu uygula
  const order = override.map((o) => o.id);
  merged.sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  return merged;
}

/** defaults + tenant => uygulamanın kullandığı düz yapılandırma */
export function buildConfig(tenant = {}) {
  const d = clone(defaults);
  const t = tenant || {};

  // Modül sırası: şirketin panelde belirlediği sıra (moduleOrder) önce, kalanlar varsayılan sırayla
  const orderList = Array.isArray(t.moduleOrder) ? t.moduleOrder.filter((k) => d.modules[k]) : [];
  const orderedKeys = [...new Set([...orderList, ...Object.keys(d.modules)])];
  const modules = {};
  orderedKeys.forEach((key) => {
    const def = d.modules[key];
    const m = { ...def, ...((t.modules || {})[key] || {}) };
    m.labelOverridden = !!(t.modules && t.modules[key] && t.modules[key].label && t.modules[key].label !== def.label);
    m.iconClass = m.icon;
    m.icon = iconHtml(m.icon);
    modules[key] = m;
  });

  // CoPilot adı şirkete göre: "<Şirket> AI CoPilot" (panelde özel ad verilmediyse)
  const companyName = t.companyName || d.companyName;
  const cp = modules.copilot;
  if (cp) {
    cp.baseLabel = d.modules.copilot.label;
    if (!cp.label || cp.label === d.modules.copilot.label) cp.label = `${companyName} ${cp.baseLabel}`;
  }

  const sections = mergeById(d.sections, t.sections);
  const salesTypes = mergeById(d.salesTypes, t.salesTypes)
    .filter((s) => s.enabled !== false)
    .map((s) => ({ ...s, iconClass: s.icon, icon: iconHtml(s.icon) }));
  const reportTypes = mergeById(d.reportTypes, t.reportTypes)
    .filter((r) => r.enabled !== false)
    .map((r) => ({ ...r, iconClass: r.icon, icon: iconHtml(r.icon) }));

  const api = { ...d.api, ...(t.api || {}) };
  const slug = t.slug || 'default';
  const prefix = t.storagePrefix || d.storagePrefix || slug;

  return {
    slug,
    companyName,
    appName: t.appName || d.appName,
    shortName: t.shortName || t.appName || d.shortName,
    appDescription: t.appDescription ?? d.appDescription,
    version: d.version,
    logoUrl: t.logo ? (t.logo.startsWith('data:') ? t.logo : `./tenant/${t.logo}`) : initialLogo(t.companyName || d.companyName, { ...d.theme, ...(t.theme || {}) }.primary),

    logoZoom: Math.min(300, Math.max(40, Number(t.logoZoom) || 100)),
    logoOffsetX: Math.min(50, Math.max(-50, Number(t.logoOffsetX) || 0)),
    logoOffsetY: Math.min(50, Math.max(-50, Number(t.logoOffsetY) || 0)),

    erpApiUrl: api.erpApiUrl,
    apiTimeout: api.apiTimeout,
    useMockApi: api.useMockApi,

    theme: { ...d.theme, ...(t.theme || {}) },
    support: { ...d.support, ...(t.support || {}) },
    sections,
    modules,
    salesTypes,
    reportTypes,
    barcode: { ...d.barcode, ...(t.barcode || {}), printer: { ...(d.barcode || {}).printer, ...((t.barcode || {}).printer || {}) } },
    priceTypes: t.priceTypes || d.priceTypes,
    currencies: t.currencies || d.currencies,

    defaultBranch: t.defaultBranch ?? null,
    defaultWarehouse: t.defaultWarehouse ?? null,
    language: t.language || d.language,

    purchaseConfig: { ...d.purchaseConfig, ...(t.purchaseConfig || {}) },
    // Sektöre özel terimler (ör. denizcilik: satış → sevkiyat, depo → ambar). Tanımsızsa varsayılan terimler kullanılır.
    terms: { sale: 'Satış', sales: 'satış', saleIcon: 'ph-shopping-cart', warehouses: 'depolar arası', customer: 'Müşteri', depotOf: 'deposunun', ...(t.terms || {}) },

    storageKeys: {
      token: `${prefix}_token`,
      user: `${prefix}_user`,
      apiUrl: `${prefix}_api_url`,
      theme: `${prefix}_theme`,
      settings: `${prefix}_settings`,
      notify: `${prefix}_notify`,
    },
  };
}

// Singleton: sayfalar bu nesneyi import eder, tenant yüklenince yerinde güncellenir.
const AppConfig = buildConfig({});

export function setTenantConfig(tenant) {
  const next = buildConfig(tenant);
  Object.keys(AppConfig).forEach((k) => delete AppConfig[k]);
  Object.assign(AppConfig, next);
  return AppConfig;
}

export default AppConfig;

/** Sayfa başlığı: şirket modül adını değiştirdiyse o ad, değiştirmediyse sayfanın kendi başlığı */
export function pageTitle(key, fallback) {
  const m = AppConfig.modules?.[key];
  return m && m.labelOverridden ? m.label : fallback;
}
/** Rapor sayfası başlığı: şirketin rapor adı (reportTypes) varsa o, yoksa varsayılan */
export function reportTitle(id, fallback) {
  return (AppConfig.reportTypes || []).find((r) => r.id === id)?.label || fallback;
}
