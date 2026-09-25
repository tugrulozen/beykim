/**
 * Bağımsız finans uygulamasının kabuğu: yalnızca finans menüsü (WMS menüsü, arama ve modülleri yok).
 * Masaüstünde sol menü, mobilde alt çubuk + "Daha fazla" çekmecesi.
 */
import AppConfig from '../core/config.js';
import Auth from '../core/auth.js';
import router from '../core/router.js';
import { esc } from '../core/html.js';
import { startNotifications, toggleNotifications, resetNotifications } from '../components/notifications.js';
import api from '../core/api.js';
import { formDialog } from '../components/dialog.js';
import { showToast } from '../components/toast.js';

// [hash, ikon, etiket, mobil alt çubukta mı]
export const NAV = [
  ['dashboard', 'ph-squares-four', 'Pano', true],
  ['cashflow', 'ph-chart-bar', 'Nakit Akışı', true],
  ['calendar', 'ph-calendar-dots', 'Takvim', true],
  ['finance?tab=parties', 'ph-users-three', 'Cari', true],
  ['finance?tab=loans', 'ph-bank', 'Krediler', false],
  ['finance?tab=cheques', 'ph-note', 'Çek / Senet', false],
  ['finance?tab=accounts', 'ph-vault', 'Kasa & Banka', false],
  ['finance?tab=ledger', 'ph-list-checks', 'Hareketler', false],
];

const ROLE = { admin: 'Yönetici', finance: 'Finans Sorumlusu', reviewer: 'İnceleme (salt okunur)', manager: 'Yönetici', viewer: 'İzleyici' };

const activeKey = (path) => {
  const tab = router.getQueryParams().tab;
  if (path !== 'finance') return path;
  return `finance?tab=${tab && tab !== 'overview' ? tab : 'parties'}`;
};

async function changePassword() {
  const v = await formDialog({
    title: 'Şifre değiştir', icon: 'ph-key', confirmLabel: 'Değiştir',
    fields: [
      { name: 'currentPassword', label: 'Mevcut şifre', type: 'password', required: true },
      { name: 'newPassword', label: 'Yeni şifre (en az 8 karakter)', type: 'password', required: true },
      { name: 'again', label: 'Yeni şifre (tekrar)', type: 'password', required: true },
    ],
    validate: (x) => (x.newPassword !== x.again ? 'Yeni şifreler aynı değil.' : x.newPassword.length < 8 ? 'Yeni şifre en az 8 karakter olmalı.' : null),
  });
  if (!v) return;
  try { showToast((await api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword })).message || 'Şifre değiştirildi', 'success'); }
  catch (e) { showToast(e.message || 'Şifre değiştirilemedi', 'error'); }
}

export function FinShell(content, path) {
  const cur = activeKey(path);
  const user = Auth.getUser?.() || {};
  const initial = (user.name || user.username || '?').trim().charAt(0).toLocaleUpperCase('tr');
  const roleLabel = ROLE[user.role] === user.name ? '' : ROLE[user.role] || user.role || '';
  const link = ([h, ic, l]) => `<a href="#/${h}" class="fa-nav-item ${cur === h ? 'active' : ''}"><i class="ph ${cur === h ? 'ph-fill' : ''} ${ic}"></i><span>${l}</span></a>`;
  const shell = document.createElement('div');
  shell.className = 'fa-shell';
  shell.innerHTML = `
    <aside class="fa-side">
      <div class="fa-brand">${AppConfig.logoUrl ? `<img src="${esc(AppConfig.logoUrl)}" alt="">` : '<i class="ph ph-currency-circle-dollar"></i>'}<div><b>${esc(AppConfig.companyName || AppConfig.appName)}</b><small>Finans Merkezi</small></div></div>
      <nav>${NAV.map(link).join('')}</nav>
      <div class="fa-side-foot"><button type="button" class="fa-nav-item" data-action="logout"><i class="ph ph-sign-out"></i><span>Çıkış yap</span></button></div>
    </aside>
    <div class="fa-main">
      <header class="fa-top">
        ${AppConfig.logoUrl ? `<img class="fa-mlogo" src="${esc(AppConfig.logoUrl)}" alt="">` : ''}
        <div class="fa-title"><small>${esc(AppConfig.companyName || '')} · Finans Merkezi</small><h1>${esc((NAV.find((n) => n[0] === cur) || [0, 0, 'Finans'])[2])}</h1></div>
        <div class="fa-top-acts">
          <button class="fa-ibtn notif-btn" data-action="notif" title="Bildirimler" aria-label="Bildirimler"><i class="ph ph-bell"></i><b class="notif-badge" data-notif-badge hidden>0</b></button>
          <button class="fa-ibtn" data-action="theme" title="Açık / koyu tema" aria-label="Tema"><i class="ph ${document.body.classList.contains('dark-theme') ? 'ph-sun' : 'ph-moon'}"></i></button>
          <button type="button" class="fa-userchip" data-action="usermenu" aria-haspopup="menu" title="Hesabım"><b>${esc(initial)}</b><span><strong>${esc(user.name || user.username || '')}</strong><small>${esc(roleLabel)}</small></span><i class="ph ph-caret-down"></i></button>
          <button class="fa-ibtn fa-only-mobile" data-action="usermenu" title="Hesabım" aria-label="Hesabım"><i class="ph ph-user-circle"></i></button>
          <div class="fa-menu" role="menu" hidden>
            <div class="fa-menu-head"><b>${esc(user.name || user.username || '')}</b><small>${esc(roleLabel)}</small></div>
            <button type="button" data-action="password"><i class="ph ph-key"></i> Şifre değiştir</button>
            <button type="button" data-action="logout"><i class="ph ph-sign-out"></i> Çıkış yap</button>
          </div>
        </div>
      </header>
      <main class="fa-content"></main>
    </div>
    <nav class="fa-bottom">${NAV.filter((n) => n[3]).map(link).join('')}<button type="button" class="fa-nav-item ${NAV.some((n) => !n[3] && n[0] === cur) ? 'active' : ''}" data-action="more"><i class="ph ph-dots-three-outline"></i><span>Daha</span></button></nav>
    <div class="fa-drawer" hidden><div class="fa-drawer-box">${NAV.filter((n) => !n[3]).map(link).join('')}</div></div>`;
  const main = shell.querySelector('.fa-content');
  if (typeof content === 'string') main.innerHTML = content; else if (content) main.appendChild(content);

  shell.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const drawer = shell.querySelector('.fa-drawer');
    if (e.target === drawer || e.target.closest('.fa-drawer a')) drawer.hidden = true;
    if (action === 'more') drawer.hidden = !drawer.hidden;
    const menu = shell.querySelector('.fa-menu');
    if (action === 'usermenu') menu.hidden = !menu.hidden;
    else if (!e.target.closest('.fa-menu')) menu.hidden = true;
    if (action === 'password') { menu.hidden = true; changePassword(); }
    if (action === 'logout') { resetNotifications(); Auth.logout(); }
    if (action === 'notif') toggleNotifications();
    if (action === 'theme') {
      const dark = document.body.classList.toggle('dark-theme');
      try { localStorage.setItem(AppConfig.storageKeys.theme, dark ? 'dark' : 'light'); } catch (_e) { /* */ }
      e.target.closest('button').innerHTML = `<i class="ph ${dark ? 'ph-sun' : 'ph-moon'}"></i>`;
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0B1220' : '#0F2240');
    }
  });
  startNotifications();
  return shell;
}
