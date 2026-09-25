/**
 * DEPO TAKİP - Ana Giriş Noktası
 * Router, auth guard, ve sayfa kayıtları
 */

import router from './core/router.js';
import Auth from './core/auth.js';
import AppConfig from './core/config.js';
import store from './core/store.js';
import api from './core/api.js';
import { loadTenant, listenForPreview } from './core/tenant.js';
import { initNetworkWatch, onReconnect } from './core/net.js';
import { initPwa } from './core/pwa.js';

// Sayfa modülleri
import LoginPage from './pages/login.js';
import DashboardPage from './pages/dashboard.js';
import TransferPage from './pages/transfer.js';
import VehicleUnloadPage from './pages/vehicleUnload.js';
import SalesPage from './pages/sales.js';
import PurchasePage from './pages/purchase.js';
import PurchaseModulePage from './pages/purchaseModule.js';
import JobTrackingPage from './pages/jobTracking.js';
import StockDetailPage from './pages/stockDetail.js';
import SerialDetailPage from './pages/serialDetail.js';
import StockCountPage from './pages/stockCount.js';
import ReportsPage from './pages/reports.js';
import CopilotPage from './pages/copilot.js';
import SettingsPage from './pages/settings.js';
import RawMaterialsPage from './pages/rawMaterials.js';
import RecipesPage from './pages/recipes.js';
import ProductionPage from './pages/production.js';
import CustomerBalancePage from './pages/customerBalance.js';
import HelpPage from './pages/help.js';
import PackingListPage from './pages/packingList.js';
import SerialWarehouseBalancePage from './pages/serialWarehouseBalance.js';
import OperationsPage from './pages/operations.js';
import ActivityPage from './pages/activity.js';
import BarcodePage from './pages/barcode.js';
import FinancePage from './pages/finance.js';
import SuppliersPage from './pages/suppliers.js';
import { CalendarPage } from './finance-app/calendar.js';
import { CashflowPage } from './finance-app/cashflow.js';
import { createHeader } from './components/header.js';
import { moduleAllowed } from './core/perms.js';
import { Shell } from './components/shell.js';
import { showToast } from './components/toast.js';

// ---- Route Tanımları ----
router.register('login', LoginPage, { requiresAuth: false, title: 'Giriş' });
router.register('dashboard', DashboardPage, { requiresAuth: true, title: 'Ana Sayfa' });
router.register('operations', OperationsPage, { requiresAuth: true, title: 'İşlemler' });
router.register('transfer', TransferPage, { requiresAuth: true, title: 'Depolar Arası Transfer' });
router.register('vehicle-unload', VehicleUnloadPage, { requiresAuth: true, title: "Araba'dan Boşaltma" });
router.register('sales', SalesPage, { requiresAuth: true, title: 'Satış İşlemleri' });
router.register('purchase', PurchasePage, { requiresAuth: true, title: 'Alış İşlemleri' });
router.register('purchase-module', PurchaseModulePage, { requiresAuth: true, title: 'Satın Alma' });
router.register('stock-detail', StockDetailPage, { requiresAuth: true, title: 'Stok Detay' });
router.register('serial-detail', SerialDetailPage, { requiresAuth: true, title: 'Seri Detay' });
router.register('stock-count', StockCountPage, { requiresAuth: true, title: 'Stok Sayım' });
router.register('reports', ReportsPage, { requiresAuth: true, title: 'Raporlar' });
router.register('customer-balance', CustomerBalancePage, { requiresAuth: true, title: 'Müşteri Bakiyeleri' });
router.register('copilot', CopilotPage, { requiresAuth: true, title: 'AI CoPilot' });
router.register('settings', SettingsPage, { requiresAuth: true, title: 'Ayarlar' });
// Üretim Modülleri
router.register('raw-materials', RawMaterialsPage, { requiresAuth: true, title: 'Hammadde Takibi' });
router.register('recipes', RecipesPage, { requiresAuth: true, title: 'Ürün Reçeteleri' });
router.register('production', ProductionPage, { requiresAuth: true, title: 'Üretim Girişi' });
router.register('jobs', JobTrackingPage, { requiresAuth: true, title: 'İş & Durum Takip' });
// Help
router.register('help', HelpPage, { requiresAuth: true, title: 'Yardım' });
router.register('packing-list', PackingListPage, { requiresAuth: true, title: 'Çeki Listesi' });
router.register('barcode', BarcodePage, { requiresAuth: true, title: 'Barkod Oluştur' });
router.register('finance', FinancePage, { requiresAuth: true, title: 'Finans' });
router.register('suppliers', SuppliersPage, { requiresAuth: true, title: 'Tedarikçiler' });
// Finans Merkezi ekranları (takvim, nakit akışı) WMS içinde: başlık + geri tuşuyla Finans sayfasına döner
const finScreen = (Page, title) => () => {
  const wrap = document.createElement('div');
  wrap.className = 'page-finance page-container fin-wms-screen';
  wrap.appendChild(createHeader({ title, gradientClass: 'gradient-reports' }));
  const body = document.createElement('div');
  body.className = 'page-content';
  body.appendChild(Page());
  wrap.appendChild(body);
  return wrap;
};
router.register('calendar', finScreen(CalendarPage, 'Finans Takvimi'), { requiresAuth: true, title: 'Finans Takvimi' });
router.register('cashflow', finScreen(CashflowPage, 'Nakit Akışı'), { requiresAuth: true, title: 'Nakit Akışı' });
router.register('activity', ActivityPage, { requiresAuth: true, title: 'Son İşlemler' });
router.register('serial-warehouse-balance', SerialWarehouseBalancePage, { requiresAuth: true, title: 'Seri Ambar Bakiye' });
// ---- Ortak yerleşim: giriş gerektiren tüm sayfalar kabuk içinde ----
router.setLayout((content, path, route) => (route.requiresAuth ? Shell(content, path) : content));

// ---- Auth Guard ----
router.addGuard(async (path, route) => {
  if (route.requiresAuth && !Auth.isLoggedIn()) {
    router.navigate('login');
    return false;
  }
  if (path === 'login' && Auth.isLoggedIn()) {
    router.navigate('dashboard');
    return false;
  }
  // Şirket için kapalı modüllere erişimi engelle
  if (!isRouteEnabled(path)) {
    router.navigate('dashboard');
    return false;
  }
  return true;
});

function isRouteEnabled(path) {
  if (path === 'calendar' || path === 'cashflow') return !!AppConfig.modules.finance?.enabled && moduleAllowed('finance');
  const owner = Object.values(AppConfig.modules).find((m) => m.route === path);
  if (owner && owner.enabled) return true;
  // modül kapalı olsa da rapor olarak açılabilen sayfalar (ör. Stok Detay) aşağıda denetlenir
  if (owner && !['stock-detail'].includes(path)) return false;
  const allReportRoutes = ['serial-warehouse-balance', 'serial-detail', 'packing-list', 'stock-detail', 'customer-balance', 'activity'];
  if (allReportRoutes.includes(path)) {
    return AppConfig.modules.reports?.enabled && AppConfig.reportTypes.some((r) => r.route === path);
  }
  return true;
}

// ---- Yakalanmayan API hataları kullanıcıya bildirilir ----
window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message;
  if (!msg) return;
  e.preventDefault();
  showToast(msg, 'error');
});

// ---- Uygulama Başlat ----
async function init() {
  // Şirket ayarlarını (tenant.json) yükle
  await loadTenant();
  api.baseUrl = api._getBaseUrl();
  api.timeout = AppConfig.apiTimeout;

  // Tema yükleme
  const savedTheme = localStorage.getItem(AppConfig.storageKeys.theme);
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Oturum kontrolü
  Auth.checkSession();

  // Yönetim Paneli önizlemesi (iframe içinde çalışıyorsa)
  listenForPreview({
    onUpdate: () => router._handleRoute(),
    onNavigate: (route) => {
      if (route !== 'login' && !Auth.isLoggedIn()) {
        store.update({ user: { name: 'Demo Kullanıcı' }, isAuthenticated: true });
      }
      if (route === 'login') store.update({ user: null, isAuthenticated: false });
      if (router.getCurrentPath() === route) router._handleRoute();
      else router.navigate(route);
    },
  });

  // Bağlantı izleme: çevrimdışı şeridi ve bağlantı gelince sayfayı tazeleme
  initNetworkWatch();
  onReconnect(() => router._handleRoute());

  // Ana ekrana eklenebilir uygulama (manifest + ikon)
  initPwa();

  // Router'ı başlat
  router.init();

  console.log(`${AppConfig.appName} başlatıldı (${AppConfig.slug})`);
}

// DOM hazır olunca başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
