/**
 * DEPO TAKİP - Authentication Module
 * Login/Logout ve session yönetimi
 */

import AppConfig from './config.js';
import store from './store.js';
import api from './api.js';
import router from './router.js';

const Auth = {
  /**
   * Kullanıcı girişi
   */
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.success) {
        const { token, user } = response.data;

        // Token kaydet
        localStorage.setItem(AppConfig.storageKeys.token, token);
        localStorage.setItem(AppConfig.storageKeys.user, JSON.stringify(user));

        // Store güncelle
        store.update({
          user,
          isAuthenticated: true,
        });

        return { success: true, user };
      }

      return { success: false, message: response.message || 'Giriş başarısız' };
    } catch (error) {
      return { success: false, message: error.message || 'Bağlantı hatası' };
    }
  },

  /**
   * Kullanıcı çıkışı
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (_e) {
      // Logout API hatası önemli değil
    }

    localStorage.removeItem(AppConfig.storageKeys.token);
    localStorage.removeItem(AppConfig.storageKeys.user);
    store.reset();
    router.navigate('login');
  },

  /**
   * Oturum kontrolü (sayfa yüklendiğinde)
   */
  checkSession() {
    const token = localStorage.getItem(AppConfig.storageKeys.token);
    const userStr = localStorage.getItem(AppConfig.storageKeys.user);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        store.update({
          user,
          isAuthenticated: true,
        });
        return true;
      } catch (_e) {
        this.logout();
        return false;
      }
    }
    return false;
  },

  /**
   * Kullanıcı bilgisini al
   */
  getUser() {
    return store.get('user');
  },

  /**
   * Kullanıcı giriş yapmış mı?
   */
  isLoggedIn() {
    return store.get('isAuthenticated');
  },

  /**
   * Kullanıcı adının baş harfini al (avatar için)
   */
  getUserInitial() {
    const user = store.get('user');
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'K';
  }
};

export default Auth;
