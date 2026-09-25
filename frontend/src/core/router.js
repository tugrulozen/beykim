/**
 * DEPO TAKİP - Hash-based SPA Router
 * Auth guard ile sayfa yönlendirme
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.guards = [];
    this.onRouteChange = null;
    this._lastHref = null;
    // Hem hashchange hem popstate dinlenir: sayfa içi adımlar (sekme vb.) pushState ile yazılır, geri gelince yeniden çizilir
    const onNav = () => { if (location.href !== this._lastHref) this._handleRoute(); };
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }

  /**
   * Yeni route tanımla
   * @param {string} path - Route yolu (örn: 'dashboard', 'stock-detail')
   * @param {Function} handler - Sayfa render fonksiyonu
   * @param {Object} options - { requiresAuth, title }
   */
  register(path, handler, options = {}) {
    this.routes[path] = { handler, ...options };
    return this;
  }

  /**
   * Guard ekle (örn: auth kontrolü)
   */
  /**
   * Sayfaları saran yerleşim fonksiyonu: (content, path, route) => content
   */
  setLayout(fn) {
    this.layout = fn;
    return this;
  }

  addGuard(guardFn) {
    this.guards.push(guardFn);
    return this;
  }

  /**
   * Belirli bir route'a git
   */
  navigate(path) {
    window.location.hash = `#/${path}`;
  }

  /**
   * Sayfa içi adım (sekme, alt sekme, filtre görünümü) — sayfayı yeniden çizmeden geçmişe yazılır.
   * Geri tuşu önce bu adımlara döner; dönüldüğünde sayfa adresteki parametrelerle yeniden çizilir.
   * @param {Object} params - adres parametreleri (boş değerler yazılmaz)
   */
  step(params = {}) {
    const q = Object.entries(params).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const href = `#/${this.getCurrentPath()}${q ? `?${q}` : ''}`;
    if (window.location.hash === href) return;
    const idx = this._nextIdx();
    history.pushState({ idx }, '', href);
    this._lastHref = location.href;
    this._idx = idx;
  }

  /** Oturum boyunca artan geçmiş sıra numarası: geri tuşunun uygulama içinde kalıp kalmayacağını belirler */
  _nextIdx() {
    let n = 0;
    try { n = Number(sessionStorage.getItem('nav_seq')) || 0; sessionStorage.setItem('nav_seq', String(n + 1)); } catch (_e) { n = Date.now(); }
    return n + 1;
  }
  _markEntry() {
    if (!history.state || history.state.idx == null) history.replaceState({ ...(history.state || {}), idx: this._nextIdx() }, '');
    this._idx = history.state.idx;
    try {
      const first = Number(sessionStorage.getItem('nav_first'));
      if (!first || this._idx < first) sessionStorage.setItem('nav_first', String(this._idx));
    } catch (_e) { /* */ }
  }

  /**
   * Geri git
   */
  back() {
    // Uygulama içinde önceki adım varsa ona döner; doğrudan açılmış sayfada ana sayfaya gider (uygulamadan çıkmaz)
    let first = 0;
    try { first = Number(sessionStorage.getItem('nav_first')) || 0; } catch (_e) { /* */ }
    if (this._idx && first && this._idx > first) window.history.back(); else this.navigate('dashboard');
  }

  /**
   * Mevcut route'u al
   */
  getCurrentPath() {
    const hash = window.location.hash.slice(2) || 'login';
    return hash.split('?')[0];
  }

  /**
   * Query parametrelerini al
   */
  getQueryParams() {
    const hash = window.location.hash.slice(2) || '';
    const queryString = hash.split('?')[1] || '';
    const params = {};
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    return params;
  }

  /**
   * Router'ı başlat
   */
  init() {
    this._handleRoute();
  }

  /**
   * @private Route değişikliklerini yakala
   */
  async _handleRoute() {
    this._lastHref = location.href;
    this._markEntry();
    const path = this.getCurrentPath();
    const route = this.routes[path];

    if (!route) {
      this.navigate('login');
      return;
    }

    // Guard kontrolleri
    for (const guard of this.guards) {
      const allowed = await guard(path, route);
      if (!allowed) return;
    }

    this.currentRoute = path;

    if (this.onRouteChange) {
      this.onRouteChange(path, route);
    }

    const handler = typeof route === 'function' ? route : route.handler;
    const afterRender = typeof route === 'object' ? route.afterRender : route?.afterRender;

    if (handler) {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = '';
        let content = await handler();
        // Ortak yerleşim (masaüstü kenar menü / mobil alt menü)
        if (this.layout) content = this.layout(content, path, route);
        if (typeof content === 'string') {
          app.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          app.appendChild(content);
        }
        // Sayfa render sonrası init fonksiyonu varsa çalıştır
        if (route.afterRender) {
          route.afterRender();
        }
        // Yeni sayfa her zaman en üstten açılsın (mobilde önceki kaydırma taşınmasın)
        this._scrollTop();
      }
    }
  }

  _scrollTop() {
    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelectorAll('.shell-content, #app').forEach((el) => { el.scrollTop = 0; });
    };
    reset();
    requestAnimationFrame(reset);
  }
}

// Singleton instance
const router = new Router();
export default router;
