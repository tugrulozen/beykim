/**
 * DEPO TAKİP - Uygulama Kabuğu
 * Masaüstü: sol menü + üst çubuk (arama). Mobil: alt sekme çubuğu.
 * Menü öğeleri şirketin açık modüllerinden otomatik oluşur.
 */

import AppConfig from '../core/config.js';
import { esc } from '../core/html.js';
import Auth from '../core/auth.js';
import router from '../core/router.js';
import { mountSearch } from './searchBox.js';
import { moduleAllowed } from '../core/perms.js';
import { startNotifications, toggleNotifications, resetNotifications } from './notifications.js';

export { esc } from '../core/html.js';

/** Menüde gösterilecek modüller (Ayarlar/Yardım en alta) */
export function navModules() {
  const all = Object.entries(AppConfig.modules).filter(([k, m]) => m.enabled && moduleAllowed(k));
  const tail = ['settings', 'help'];
  return [
    ...all.filter(([k]) => !tail.includes(k)),
    ...all.filter(([k]) => tail.includes(k)),
  ];
}

/** Rapor alt sayfaları "Raporlar" menüsünü aktif göstersin */
function activeRoute(path) {
  if (AppConfig.reportTypes.some((r) => r.route === path)) return 'reports';
  return path;
}

/** Uygulama adı şirket adıyla başlıyorsa iki kademeli gösterilir: şirket adı (tek satır) + alt başlık; ad rastgele yerden bölünmez */
function brandText() {
  const app = AppConfig.appName || '', company = AppConfig.companyName || '';
  const rest = company && app.startsWith(company) ? app.slice(company.length).trim() : '';
  if (!rest) return `<div class="brand-name">${esc(app)}</div>`;
  return `<div class="brand-text"><div class="brand-name brand-name-1">${esc(company)}</div><div class="brand-sub">${esc(rest)}</div></div>`;
}

export function brandHtml({ compact = false } = {}) {
  return `
    <div class="brand ${compact ? 'brand-compact' : ''}">
      <div class="brand-logo"><img src="${AppConfig.logoUrl}" alt="${esc(AppConfig.companyName)}" /></div>
      ${brandText()}
    </div>`;
}

export function Shell(content, path) {
  const shell = document.createElement('div');
  shell.className = 'shell';
  const current = activeRoute(path);
  const user = Auth.getUser();
  const mods = navModules();
  const has = (key) => AppConfig.modules[key]?.enabled;

  const tabs = [
    { route: 'dashboard', icon: 'ph-house', label: 'Ana Sayfa' },
    { route: 'operations', icon: 'ph-squares-four', label: 'İşlemler' },
    has('copilot') && { route: 'copilot', icon: 'ph-sparkle', label: AppConfig.modules.copilot.baseLabel || 'AI CoPilot' },
    { action: 'notif', icon: 'ph-bell', label: 'Bildirim', badge: true },
    has('settings') && { route: 'settings', icon: 'ph-user', label: 'Profil' },
  ].filter(Boolean);

  shell.innerHTML = `
    <header class="shell-topbar">
      ${brandHtml()}
      <label class="topbar-search">
        <i class="ph ph-magnifying-glass"></i>
        <input type="search" placeholder="Modül veya menü ara…" data-action="search" />
      </label>
      <button class="icon-btn notif-btn" data-action="notif" title="Bildirimler" aria-label="Bildirimler"><i class="ph ph-bell"></i><b class="notif-badge" data-notif-badge hidden>0</b></button>
      <button class="icon-btn" data-action="theme" title="Tema"><i class="ph ${document.body.classList.contains('dark-theme') ? 'ph-sun' : 'ph-moon'}"></i></button>
    </header>

    <aside class="shell-sidebar">
      <nav class="side-nav">
        <a class="side-link ${current === 'dashboard' ? 'active' : ''}" data-route="dashboard"><i class="ph ph-house"></i><span>Ana Sayfa</span></a>
        ${mods.map(([, m]) => `
        <a class="side-link ${current === m.route ? 'active' : ''}" data-route="${m.route}" data-label="${esc(m.label.toLocaleLowerCase('tr'))}">
          ${m.icon}<span>${esc(m.label)}</span>
        </a>`).join('')}
      </nav>
      <div class="side-user">
        <div class="avatar">${esc(Auth.getUserInitial())}</div>
        <div class="side-user-name">${esc(user?.name || 'Kullanıcı')}</div>
        <button class="icon-btn" data-action="logout" title="Çıkış"><i class="ph ph-sign-out"></i></button>
      </div>
    </aside>

    <main class="shell-content"></main>

    <nav class="shell-tabbar">
      ${tabs.map((t) => `
      <a class="tab ${t.route && current === t.route ? 'active' : ''}" ${t.route ? `data-route="${t.route}"` : `data-action="${t.action}"`}>
        <i class="ph ${t.route && current === t.route ? 'ph-fill' : ''} ${t.icon}"></i>${t.badge ? '<b class="notif-badge" data-notif-badge hidden>0</b>' : ''}<span>${esc(t.label)}</span>
      </a>`).join('')}
    </nav>`;

  const slot = shell.querySelector('.shell-content');
  if (typeof content === 'string') slot.innerHTML = content;
  else if (content) slot.appendChild(content);

  shell.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link && !link.closest('.shell-content')) {
      e.preventDefault();
      router.navigate(link.dataset.route);
      return;
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'logout') { resetNotifications(); Auth.logout(); }
    if (action === 'notif') toggleNotifications();
    if (action === 'theme') {
      document.body.classList.toggle('dark-theme');
      const dark = document.body.classList.contains('dark-theme');
      localStorage.setItem(AppConfig.storageKeys.theme, dark ? 'dark' : 'light');
      e.target.closest('button').innerHTML = `<i class="ph ${dark ? 'ph-sun' : 'ph-moon'}"></i>`;
    }
  });

  // Modül arama: menüyü süzer, Enter ilk eşleşmeyi açar
  // Modül + alt menü araması (açılır sonuç listesi)
  mountSearch(shell.querySelector('[data-action="search"]'), { host: shell.querySelector('.topbar-search') });

  startNotifications();
  return shell;
}
