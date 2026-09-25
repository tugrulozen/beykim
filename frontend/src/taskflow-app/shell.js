/**
 * İş Akışı uygulamasının kabuğu. Menü role göre değişir:
 *   Çalışan : Görevlerim · Pano · Performansım
 *   Sorumlu : + Onaylarım (sayaçlı) · Ekip
 *   Genel Müdür : Yönetici Paneli · Pano · Onaylar · Ekip · Birimler · Finans (Görevlerim yok)
 *   Finans yetkisi (fin.view): + Finans bölümü (özet, nakit akışı, takvim, cari, krediler, çek/senet, kasa & banka, hareketler)
 * Masaüstünde sol menü, mobilde alt çubuk. Sağ üstte canlı bağlantı göstergesi, çevrimiçi kişi sayısı, bildirimler.
 */
import AppConfig from '../core/config.js';
import Auth from '../core/auth.js';
import router from '../core/router.js';
import api from '../core/api.js';
import { esc } from '../core/html.js';
import { formDialog } from '../components/dialog.js';
import { showToast } from '../components/toast.js';
import { startNotifications, toggleNotifications, resetNotifications } from '../components/notifications.js';
import { status, on, disconnect } from './live.js';
import { closeDrawer } from './drawer.js';

export const session = { me: null };
export async function loadSession() { session.me = (await api.get('/jt/flow/me')).data; return session.me; }

export const canFinance = (me) => !!(me && (me.boss || (me.perms || []).includes('fin.view')));
/** Finans bölümü (Horizon Finans Merkezi ekranlarıyla aynı) — [hash, ikon, etiket, mobil alt çubukta mı, bölüm] */
const FIN_NAV = [
  ['fin-home', 'ph-currency-circle-dollar', 'Finans Özeti', false, 'fin'],
  ['cashflow', 'ph-chart-bar', 'Nakit Akışı', false, 'fin'],
  ['calendar', 'ph-calendar-dots', 'Finans Takvimi', false, 'fin'],
  ['finance?tab=parties', 'ph-users-three', 'Cari Hesaplar', false, 'fin'],
  ['finance?tab=loans', 'ph-bank', 'Krediler', false, 'fin'],
  ['finance?tab=cheques', 'ph-note', 'Çek / Senet', false, 'fin'],
  ['finance?tab=accounts', 'ph-vault', 'Kasa & Banka', false, 'fin'],
  ['finance?tab=ledger', 'ph-list-checks', 'Hareketler', false, 'fin'],
];
// mobil alt çubukta sığması için kısa etiketler
const SHORT = { 'Yönetici Paneli': 'Panel', 'Ekip & Performans': 'Ekip', 'Performansım': 'Performans', 'Finans Özeti': 'Özet', 'Finans Takvimi': 'Takvim', 'Cari Hesaplar': 'Cari' };
const financeOnly = (me) => me && me.role === 'finance';

export function navFor(me) {
  const lead = me && (me.boss || me.canAssign || (me.managerOf || []).length);
  if (financeOnly(me)) return FIN_NAV.map((n, i) => (i < 4 ? [n[0], n[1], n[2], true, 'fin'] : n)); // finans sorumlusu: yalnız finans
  const fin = canFinance(me) ? FIN_NAV : [];
  return [
    me && me.boss ? ['boss', 'ph-chart-pie-slice', 'Yönetici Paneli', true] : null,
    me && me.boss ? null : ['my', 'ph-user-focus', 'Görevlerim', true],
    ['board', 'ph-kanban', 'Pano', true],
    lead || (me && me.reviewCount) ? ['reviews', 'ph-seal-check', 'Onaylarım', true] : null,
    ['team', 'ph-users-three', lead ? 'Ekip & Performans' : 'Performansım', true],
    me && me.boss ? ['units', 'ph-tree-structure', 'Birimler', false] : null,
    ...fin,
  ].filter(Boolean);
}

async function changePassword() {
  const v = await formDialog({ title: 'Şifre değiştir', icon: 'ph-key', confirmLabel: 'Değiştir',
    fields: [{ name: 'currentPassword', label: 'Mevcut şifre', type: 'password', required: true }, { name: 'newPassword', label: 'Yeni şifre (en az 8 karakter)', type: 'password', required: true }, { name: 'again', label: 'Yeni şifre (tekrar)', type: 'password', required: true }],
    validate: (x) => (x.newPassword !== x.again ? 'Yeni şifreler aynı değil.' : x.newPassword.length < 8 ? 'En az 8 karakter.' : null) });
  if (!v) return;
  try { showToast((await api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword })).message || 'Şifre değiştirildi', 'success'); } catch (e) { showToast(e.message, 'error'); }
}

export function TfShell(content, path) {
  const me = session.me || {};
  const user = Auth.getUser() || {};
  const nav = navFor(me);
  const tab = router.getQueryParams().tab;
  const cur = path === 'finance' ? `finance?tab=${tab && tab !== 'overview' ? tab : 'parties'}` : path;
  const title = (nav.find((n) => n[0] === cur) || [0, 0, path === 'finance' ? 'Finans' : 'İş Akışı'])[2];
  const link = ([h, ic, l]) => `<a href="#/${h}" class="fa-nav-item ${cur === h ? 'active' : ''}"><i class="ph ${cur === h ? 'ph-fill' : ''} ${ic}"></i><span>${l}</span>${h === 'reviews' && me.reviewCount ? `<b class="tf-navbadge">${me.reviewCount}</b>` : ''}</a>`;
  // masaüstü menü: iş akışı + (varsa) "Finans" başlıklı bölüm
  const sideNav = () => { const work = nav.filter((n) => n[4] !== 'fin'), fin = nav.filter((n) => n[4] === 'fin'); return work.map(link).join('') + (fin.length ? `${work.length ? '<div class="tf-navsec">Finans</div>' : ''}${fin.map(link).join('')}` : ''); };
  const mobile = nav.filter((n) => n[3]).slice(0, 4);
  const extra = nav.filter((n) => !mobile.includes(n));
  const shell = document.createElement('div');
  shell.className = 'fa-shell tf-shell';
  shell.innerHTML = `
    <aside class="fa-side">
      <div class="fa-brand">${AppConfig.logoUrl ? `<img src="${esc(AppConfig.logoUrl)}" alt="">` : '<i class="ph ph-kanban"></i>'}<div><b>${esc(AppConfig.companyName || '')}</b><small>İş Akışı ve Finans</small></div></div>
      <nav>${sideNav()}</nav>
      <div class="fa-side-foot"><button type="button" class="fa-nav-item" data-action="logout"><i class="ph ph-sign-out"></i><span>Çıkış yap</span></button></div>
    </aside>
    <div class="fa-main">
      <header class="fa-top">
        ${AppConfig.logoUrl ? `<img class="fa-mlogo" src="${esc(AppConfig.logoUrl)}" alt="">` : ''}
        <div class="fa-title"><small>${esc(AppConfig.companyName || '')} · ${nav.find((n) => n[0] === cur && n[4] === 'fin') || path === 'finance' ? 'Finans' : 'İş Akışı'}</small><h1>${esc(title)}</h1></div>
        <div class="fa-top-acts">
          <span class="tf-livebadge ${status.live ? 'on' : ''}" title="Gerçek zamanlı bağlantı"><i></i><span>${status.online.size || 1} çevrimiçi</span></span>
          <button class="fa-ibtn notif-btn" data-action="notif" title="Bildirimler" aria-label="Bildirimler"><i class="ph ph-bell"></i><b class="notif-badge" data-notif-badge hidden>0</b></button>
          <button class="fa-ibtn" data-action="theme" title="Açık / koyu tema" aria-label="Tema"><i class="ph ${document.body.classList.contains('dark-theme') ? 'ph-sun' : 'ph-moon'}"></i></button>
          <button type="button" class="fa-userchip" data-action="usermenu" title="Hesabım"><b>${esc((user.name || '?').charAt(0).toLocaleUpperCase('tr'))}</b><span><strong>${esc(user.name || '')}</strong><small>${esc(me.title || '')}</small></span><i class="ph ph-caret-down"></i></button>
          <button class="fa-ibtn fa-only-mobile" data-action="usermenu" aria-label="Hesabım"><i class="ph ph-user-circle"></i></button>
          <div class="fa-menu" role="menu" hidden><div class="fa-menu-head"><b>${esc(user.name || '')}</b><small>${esc((me.units || []).map((u) => u.name).join(', ') || me.title || '')}</small></div>
            <button type="button" data-action="password"><i class="ph ph-key"></i> Şifre değiştir</button><button type="button" data-action="logout"><i class="ph ph-sign-out"></i> Çıkış yap</button></div>
        </div>
      </header>
      <main class="fa-content"></main>
    </div>
    <nav class="fa-bottom">${mobile.map(([h, ic, l, m, sec]) => link([h, ic, SHORT[l] || l, m, sec])).join('')}${extra.length ? `<button type="button" class="fa-nav-item ${extra.some((n) => n[0] === cur) ? 'active' : ''}" data-action="more"><i class="ph ph-dots-three-outline"></i><span>Daha</span></button>` : ''}</nav>
    <div class="fa-drawer" hidden><div class="fa-drawer-box">${extra.filter((n) => n[4] !== 'fin').map(link).join('')}${extra.some((n) => n[4] === 'fin') && extra.some((n) => n[4] !== 'fin') ? '<div class="tf-navsec">Finans</div>' : ''}${extra.filter((n) => n[4] === 'fin').map(link).join('')}<button type="button" class="fa-nav-item" data-action="logout"><i class="ph ph-sign-out"></i><span>Çıkış</span></button></div></div>`;
  const main = shell.querySelector('.fa-content');
  if (typeof content === 'string') main.innerHTML = content; else if (content) main.appendChild(content);

  shell.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const drawer = shell.querySelector('.fa-drawer');
    const menu = shell.querySelector('.fa-menu');
    if (e.target === drawer || e.target.closest('.fa-drawer a')) drawer.hidden = true;
    if (action === 'more') drawer.hidden = !drawer.hidden;
    if (action === 'usermenu') menu.hidden = !menu.hidden; else if (!e.target.closest('.fa-menu')) menu.hidden = true;
    if (action === 'password') { menu.hidden = true; changePassword(); }
    if (action === 'logout') { closeDrawer(); disconnect(); resetNotifications(); Auth.logout(); }
    if (action === 'notif') toggleNotifications();
    if (action === 'theme') {
      const dark = document.body.classList.toggle('dark-theme');
      try { localStorage.setItem(AppConfig.storageKeys.theme, dark ? 'dark' : 'light'); } catch (_e) { /* */ }
      e.target.closest('button').innerHTML = `<i class="ph ${dark ? 'ph-sun' : 'ph-moon'}"></i>`;
    }
  });
  const upd = () => { const b = shell.querySelector('.tf-livebadge'); if (b) { b.classList.toggle('on', status.live); b.querySelector('span').textContent = status.live ? `${Math.max(1, status.online.size)} çevrimiçi` : 'bağlanıyor…'; } };
  const offs = [on('status', upd), on('presence', upd), on('job', async (d) => { // onay sayacını güncel tut
    if (!['complete', 'approve', 'reject', 'sync'].includes(d.action)) return;
    try { const m = await loadSession(); const b = shell.querySelector('a[href="#/reviews"] .tf-navbadge'); if (b) b.textContent = m.reviewCount; else if (m.reviewCount) shell.querySelectorAll('a[href="#/reviews"]').forEach((a) => a.insertAdjacentHTML('beforeend', `<b class="tf-navbadge">${m.reviewCount}</b>`)); } catch (_e) { /* */ }
  })];
  const mo = new MutationObserver(() => { if (!shell.isConnected) { offs.forEach((f) => f()); mo.disconnect(); } });
  setTimeout(() => mo.observe(document.getElementById('app'), { childList: true }), 0);
  startNotifications();
  return shell;
}

export { router };
