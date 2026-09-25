/**
 * DEPO TAKİP - REST API Client
 * Mock/Gerçek API arasında geçiş yapılabilir
 */

import AppConfig from './config.js';
import store from './store.js';
import { mockApiHandler } from '../api/mockApi.js';
import { setNetState, isOffline } from './net.js';

class ApiClient {
  constructor() {
    this.baseUrl = this._getBaseUrl();
    this.timeout = AppConfig.apiTimeout;
  }

  _getBaseUrl() {
    const saved = localStorage.getItem(AppConfig.storageKeys.apiUrl);
    // Kullanıcının kaydettiği adres, şirketin varsayılan adresinden önceliklidir
    return saved || AppConfig.erpApiUrl || '';
  }

  resetBaseUrl() {
    localStorage.removeItem(AppConfig.storageKeys.apiUrl);
    this.baseUrl = AppConfig.erpApiUrl || '';
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    localStorage.setItem(AppConfig.storageKeys.apiUrl, url);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  _getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    // Yönetim paneli önizlemesi: panel vekili isteği ilgili şirketin backend'ine yönlendirsin (Referer gönderilmediği için)
    if (document.documentElement.classList.contains('in-preview')) headers['X-Preview-Tenant'] = AppConfig.slug;
    // Bağımsız uygulamalar (ör. finance.html) firma kimliğini gönderir; backend TENANT_ID ile karşılaştırır
    if (this.tenantId) headers['X-Tenant-Id'] = this.tenantId;
    const token = localStorage.getItem(AppConfig.storageKeys.token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Ana request metodu
   */
  async request(method, endpoint, data = null, attempt = 0) {
    // Mock API kullanılıyorsa ve ERP linki tanımlanmamışsa mock kullan
    if (AppConfig.useMockApi && !AppConfig.erpApiUrl) {
      return mockApiHandler(method, endpoint, data);
    }

    // Cihaz çevrimdışıyken veri yazmayı denemek yerine hemen anlaşılır hata ver
    if (isOffline() && method !== 'GET') {
      throw new Error('Çevrimdışısınız. Bağlantı gelince tekrar deneyin.');
    }

    // Gerçek API çağrısı
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this._getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (response.status === 401 && endpoint !== '/auth/login') {
        // Jeton süresi dolmuş veya hesap kapatılmış: oturumu temizleyip giriş ekranına dön
        store.update({ user: null, isAuthenticated: false });
        localStorage.removeItem(AppConfig.storageKeys.token);
        localStorage.removeItem(AppConfig.storageKeys.user);
        window.location.hash = '#/login';
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status >= 500) setNetState('server', `sunucu hatası (${response.status})`);
        // Yeni uçlar eski bir backend'de yoktur: 403 ("yetkiniz yok") veya 404 döner. Gerçek nedeni söyle.
        const newEp = /^\/(stock-adjust|activity|notifications|finance)/.test(endpoint) || (method === 'DELETE' && /^\/products\//.test(endpoint));
        if (newEp && (response.status === 404 || (response.status === 403 && (!errorData.message || errorData.message === 'Bu işlem için yetkiniz yok.')))) {
          throw new Error('Sunucudaki backend dosyaları eski görünüyor (yeni özellik bulunamadı). Backend zip’inin TÜM dosyalarını (server.js, jobTracking.js, activity.js, copilot.js …) uygulama klasörüne yükleyip Node uygulamasını Yeniden Başlatın.');
        }
        throw new Error(errorData.message || (response.status === 403
          ? 'Bu işlem için yetkiniz yok.'
          : response.status === 404 ? 'İstenen kayıt bulunamadı.' : `Sunucu hatası (${response.status})`));
      }

      if (response.status !== 204) setNetState('online');
      return await response.json();
    } catch (error) {
      const timedOut = error.name === 'AbortError';
      // fetch'in kendisi patladıysa (ağ yok, sunucu kapalı, sertifika) TypeError gelir
      const networkDown = timedOut || error instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(error.message || '');

      // Okuma isteklerinde tek seferlik sessiz yeniden deneme: dalgalı bağlantıda sayfa boş kalmasın
      if (networkDown && method === 'GET' && attempt === 0 && !isOffline()) {
        await new Promise((r) => setTimeout(r, 900));
        return this.request(method, endpoint, data, 1);
      }

      if (networkDown) {
        if (isOffline()) { setNetState('offline'); throw new Error('Çevrimdışısınız. Bağlantınızı kontrol edin.'); }
        setNetState('server', timedOut ? 'yanıt gecikti' : '');
        throw new Error(timedOut
          ? 'Sunucu yanıt vermedi (zaman aşımı). Bağlantıyı kontrol edip tekrar deneyin.'
          : 'Sunucuya ulaşılamıyor. Adresi ve bağlantınızı kontrol edin.');
      }
      throw error;
    }
  }

  // Kısayol metodları
  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }

  // --- Üretim Modülü Metodları ---
  async getRawMaterials() {
    if (AppConfig.useMockApi && !AppConfig.erpApiUrl) {
      const { mockApi } = await import('../api/mockApi.js');
      return mockApi.getRawMaterials();
    }
    return this.get('/raw-materials');
  }

  async getRecipes() {
    if (AppConfig.useMockApi && !AppConfig.erpApiUrl) {
      const { mockApi } = await import('../api/mockApi.js');
      return mockApi.getRecipes();
    }
    return this.get('/recipes');
  }

  async produceItem(productId, quantity) {
    if (AppConfig.useMockApi && !AppConfig.erpApiUrl) {
      const { mockApi } = await import('../api/mockApi.js');
      return mockApi.produceItem(productId, quantity);
    }
    return this.post('/production', { productId, quantity });
  }

  async getBranches() {
    return this.get('/branches');
  }

  async getWarehouses() {
    return this.get('/warehouses');
  }

  async getCustomers() {
    return this.get('/customers');
  }

  async makeSale(customerId, warehouseId, productId, quantity, type, orderId, lineId, note) {
    // orderId/lineId (isteğe bağlı): İş Takip siparişine bağlı sevkiyat -> siparişin "giden miktarı"
    return this.post('/sales', { customerId, warehouseId, productId, quantity, type, ...(orderId ? { orderId, lineId } : {}), ...(note ? { note } : {}) });
  }

  async getProducts() {
    return this.get('/products');
  }

  async addPurchase(barcode, name, quantity, warehouseId) {
    return this.post('/purchase', { barcode, name, quantity, warehouseId });
  }

  // --- Mevcut metodları proxy'le ---
  async login(username, password) {
    if (AppConfig.useMockApi && !AppConfig.erpApiUrl) {
      const { mockApi } = await import('../api/mockApi.js');
      return mockApi.login(username, password);
    }
    return this.post('/auth/login', { username, password });
  }
}

// Singleton instance
const api = new ApiClient();
export default api;
