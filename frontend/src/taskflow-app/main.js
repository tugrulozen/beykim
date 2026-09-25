/**
 * BAĞIMSIZ İŞ AKIŞI UYGULAMASI — giriş noktası (taskflow.html)
 * WMS'ten ayrı derlenir (npm run build:app -- taskflow hobiex → dist-taskflow/): pakette yalnız iş akışı ekranları bulunur.
 * Rotalar: login · my · board · reviews · team · boss · units   (her sayfada ?job=<id> görev panelini açar)
 *         finans (fin.view): fin-home · cashflow · calendar · finance?tab=…  (Horizon Finans Merkezi ekranları, aynı API)
 */
import router from '../core/router.js';
import Auth from '../core/auth.js';
import AppConfig from '../core/config.js';
import api from '../core/api.js';
import { loadTenant } from '../core/tenant.js';
import { initNetworkWatch, onReconnect } from '../core/net.js';
import { showToast } from '../components/toast.js';
import LoginPage from '../pages/login.js';
import { TfShell, session, loadSession, navFor } from './shell.js';
import { BoardPage, MyPage, ReviewsPage } from './board.js';
import { TeamPage, BossPage, UnitsPage } from './insights.js';
import { connect } from './live.js';
import FinancePage from '../pages/finance.js';
import { CalendarPage, AgendaWidget } from '../finance-app/calendar.js';
import { CashflowPage } from '../finance-app/cashflow.js';
import { closeDrawer } from './drawer.js';

const home = () => (session.me && session.me.role === 'finance' ? 'fin-home' : session.me && session.me.boss ? 'boss' : session.me && (session.me.canAssign || (session.me.managerOf || []).length) ? 'board' : 'my');

/** Finans özeti: yaklaşan/geciken vadeler + kasa, alacak, borç, kredi özeti ve hatırlatmalar */
function FinHomePage() {
  const el = document.createElement('div');
  el.className = 'fa-page fa-dash';
  el.appendChild(AgendaWidget());
  el.appendChild(FinancePage({ embedded: true }));
  return el;
}

router.register('login', LoginPage, { requiresAuth: false, title: 'Giriş' });
router.register('dashboard', () => '', { requiresAuth: true, title: '' }); // giriş sayfası buraya yönlendirir → role göre ana sayfa
router.register('my', MyPage, { requiresAuth: true, title: 'Görevlerim' });
router.register('board', BoardPage, { requiresAuth: true, title: 'Pano' });
router.register('reviews', ReviewsPage, { requiresAuth: true, title: 'Onaylarım' });
router.register('team', TeamPage, { requiresAuth: true, title: 'Ekip & Performans' });
router.register('boss', BossPage, { requiresAuth: true, title: 'Yönetici Paneli' });
router.register('units', UnitsPage, { requiresAuth: true, title: 'Birimler' });
router.register('fin-home', FinHomePage, { requiresAuth: true, title: 'Finans Özeti' });
router.register('cashflow', CashflowPage, { requiresAuth: true, title: 'Nakit Akışı' });
router.register('calendar', CalendarPage, { requiresAuth: true, title: 'Finans Takvimi' });
router.register('finance', () => FinancePage({ embedded: true }), { requiresAuth: true, title: 'Finans' });
router.setLayout((content, path, route) => (route.requiresAuth ? TfShell(content, path) : content));

router.addGuard(async (path, route) => {
  if (path === 'login') session.me = null; // çıkış / kullanıcı değişimi
  if (route.requiresAuth && !Auth.isLoggedIn()) { router.navigate('login'); return false; }
  if (path === 'login' && Auth.isLoggedIn()) { router.navigate('dashboard'); return false; }
  if (!route.requiresAuth) return true;
  if (!session.me) {
    try { await loadSession(); connect(); }
    catch (e) { showToast(e.message || 'Oturum yüklenemedi', 'error'); if (/oturum|401|devre/i.test(e.message || '')) Auth.logout(); return false; }
  }
  const allowed = navFor(session.me).map((n) => n[0].split('?')[0]);
  if (path === 'dashboard' || !allowed.includes(path)) { router.navigate(home()); return false; }
  return true;
});
router.onRouteChange = (_p, route) => {
  document.title = `${route.title || 'İş Akışı'} · ${AppConfig.companyName || ''}`;
  document.querySelectorAll('.app-dialog-wrap').forEach((el) => el.remove());
  document.body.classList.remove('jt-lock');
  if (!/[?&]job=/.test(location.hash)) closeDrawer();
};
window.addEventListener('unhandledrejection', (e) => { const m = e.reason?.message; if (m) { e.preventDefault(); showToast(m, 'error'); } });

async function init() {
  await loadTenant();
  api.baseUrl = api._getBaseUrl();
  api.timeout = AppConfig.apiTimeout;
  AppConfig.appName = AppConfig.taskflowName || `${AppConfig.companyName} İş Akışı ve Finans`;
  AppConfig.appDescription = 'Görev, Onay, Ekip Performansı ve Finans Yönetimi';
  AppConfig.passwordHint = 'Sağ üstte adınıza tıklayıp "Şifre değiştir" ile';
  document.body.classList.add('fa-app', 'tf-app');
  try { if (localStorage.getItem(AppConfig.storageKeys.theme) === 'dark') document.body.classList.add('dark-theme'); } catch (_e) { /* */ }
  Auth.checkSession();
  initNetworkWatch();
  onReconnect(() => router._handleRoute());
  router.init();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
