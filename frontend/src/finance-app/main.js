/**
 * BAĞIMSIZ FİNANS UYGULAMASI — giriş noktası (finance.html)
 *
 * WMS uygulamasından ayrı derlenir (APP=finance npm run build → dist-finance/index.html): pakette yalnızca giriş,
 * finans ekranları, takvim ve nakit akışı bulunur; depo/satış/üretim kodları derlemeye hiç girmez.
 * Ortak çekirdek (api, auth, router, dialog, dışa aktarma, finans sayfası) WMS ile paylaşılır.
 *
 * Rotalar: login · dashboard (pano) · cashflow · calendar · finance?tab=… (derin bağlantılar: bkz. pages/finance.js)
 */
import router from '../core/router.js';
import Auth from '../core/auth.js';
import AppConfig from '../core/config.js';
import api from '../core/api.js';
import { loadTenant } from '../core/tenant.js';
import { initNetworkWatch, onReconnect } from '../core/net.js';
import { moduleAllowed } from '../core/perms.js';
import { showToast } from '../components/toast.js';
import { esc } from '../core/html.js';
import LoginPage from '../pages/login.js';
import FinancePage from '../pages/finance.js';
import { FinShell } from './shell.js';
import { CalendarPage, AgendaWidget } from './calendar.js';
import { CashflowPage } from './cashflow.js';

function DashboardPage() {
  const el = document.createElement('div');
  el.className = 'fa-page fa-dash';
  const u = Auth.getUser?.() || {};
  const h = new Date().getHours();
  const hello = h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  el.insertAdjacentHTML('beforeend', `<div class="fa-hello"><div><h2>${hello}, ${esc((u.name || '').split(' ')[0] || '')}</h2><p>${esc(today)} · ${esc(AppConfig.companyName || '')} finans durumu</p></div>
    <div class="fa-hello-acts"><a class="btn btn-secondary btn-sm" href="#/cashflow"><i class="ph ph-chart-bar"></i> Nakit akışı</a><a class="btn btn-primary btn-sm" href="#/calendar"><i class="ph ph-calendar-dots"></i> Finans takvimi</a></div></div>`);
  el.appendChild(AgendaWidget());
  el.appendChild(FinancePage({ embedded: true })); // ?tab yok → Özet sekmesi (KPI, nakit, hatırlatmalar)
  return el;
}
function NoAccessPage() {
  return `<div class="card fin-err fa-noaccess"><i class="ph ph-lock-key"></i><div><b>Finans modülü için yetkiniz yok.</b><p>Yöneticinizden “Finans Sorumlusu” veya “İnceleme” rolü isteyin.</p>
    <button class="btn btn-secondary btn-sm" data-action="logout">Çıkış yap</button></div></div>`;
}

router.register('login', LoginPage, { requiresAuth: false, title: 'Giriş' });
router.register('dashboard', DashboardPage, { requiresAuth: true, title: 'Pano' });
router.register('cashflow', CashflowPage, { requiresAuth: true, title: 'Nakit Akışı' });
router.register('calendar', CalendarPage, { requiresAuth: true, title: 'Finans Takvimi' });
router.register('finance', () => FinancePage({ embedded: true }), { requiresAuth: true, title: 'Finans' });
router.register('no-access', NoAccessPage, { requiresAuth: true, title: 'Yetki yok' });
router.setLayout((content, path, route) => (route.requiresAuth ? FinShell(content, path) : content));

router.addGuard(async (path, route) => {
  if (route.requiresAuth && !Auth.isLoggedIn()) { router.navigate('login'); return false; }
  if (path === 'login' && Auth.isLoggedIn()) { router.navigate('dashboard'); return false; }
  if (route.requiresAuth && path !== 'no-access' && !moduleAllowed('finance')) { router.navigate('no-access'); return false; }
  return true;
});
router.onRouteChange = (_p, route) => {
  document.title = `${route.title} · ${AppConfig.companyName || AppConfig.appName} Finans`;
  // sayfa değişince önceki sayfanın açık pencereleri (diyaloglar) kapanır
  document.querySelectorAll('.app-dialog-wrap').forEach((el) => el.remove());
  document.body.classList.remove('jt-lock');
};

window.addEventListener('unhandledrejection', (e) => { const m = e.reason?.message; if (m) { e.preventDefault(); showToast(m, 'error'); } });

async function init() {
  await loadTenant();
  api.baseUrl = api._getBaseUrl();
  api.timeout = AppConfig.apiTimeout;
  // bu uygulama yalnız finanstır: tenant.json'da WMS adı/açıklaması kalmışsa finans adıyla gösterilir
  if (/wms|depo/i.test(AppConfig.appName || '')) AppConfig.appName = `${AppConfig.companyName} Finans Merkezi`;
  if (/depo|wms/i.test(AppConfig.appDescription || '')) AppConfig.appDescription = 'Kurumsal Finans ve Nakit Yönetimi Platformu';
  AppConfig.passwordHint = 'Sağ üstte adınıza tıklayıp "Şifre değiştir" ile';
  document.body.classList.add('fa-app');
  api.tenantId = AppConfig.slug; // backend TENANT_ID ile eşleşmezse istekler 403 ile reddedilir
  try { if (localStorage.getItem(AppConfig.storageKeys.theme) === 'dark') document.body.classList.add('dark-theme'); } catch (_e) { /* */ }
  Auth.checkSession();
  initNetworkWatch();
  onReconnect(() => router._handleRoute());
  router.init();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
