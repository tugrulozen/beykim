/**
 * DEPO TAKİP - Merkezi State Yönetimi
 * Basit reactive store pattern
 */

class Store {
  constructor() {
    this._state = {
      user: null,
      isAuthenticated: false,
      currentPage: 'login',
      apiUrl: '',
      notifications: [],
      loading: false,
      branches: [],
      warehouses: [],
      selectedBranch: null,
      selectedWarehouse: null,
    };
    this._listeners = {};
  }

  /**
   * State'i oku
   */
  get(key) {
    return this._state[key];
  }

  /**
   * State'i güncelle
   */
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;
    this._notify(key, value, oldValue);
  }

  /**
   * Birden fazla state'i aynı anda güncelle
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * State değişikliğini dinle
   */
  subscribe(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);

    // Unsubscribe fonksiyonu döndür
    return () => {
      this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
    };
  }

  /**
   * @private Dinleyicileri bilgilendir
   */
  _notify(key, newValue, oldValue) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(newValue, oldValue));
    }
  }

  /**
   * Tüm state'i sıfırla (logout vb.)
   */
  reset() {
    this._state = {
      user: null,
      isAuthenticated: false,
      currentPage: 'login',
      apiUrl: this._state.apiUrl,
      notifications: [],
      loading: false,
      branches: [],
      warehouses: [],
      selectedBranch: null,
      selectedWarehouse: null,
    };
  }
}

// Singleton instance
const store = new Store();
export default store;
