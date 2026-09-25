/**
 * DEPO TAKİP - Login Sayfası
 */

import AppConfig from '../core/config.js';
import Auth from '../core/auth.js';
import api from '../core/api.js';
import router from '../core/router.js';
import { showToast } from '../components/toast.js';
import { esc } from '../core/html.js';

export default function LoginPage() {
  const container = document.createElement('div');
  container.className = 'page-login page-container';

  const savedApiUrl = api.getBaseUrl();

  container.innerHTML = `
    <div class="login-logo-area">
      <div class="login-logo" style="background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; width: 110px; height: 110px; border-radius: 50%; padding: 15px;">
        <img src="${AppConfig.logoUrl}" alt="${AppConfig.companyName} Logo" style="width: 100%; height: 100%; object-fit: contain;" />
      </div>
      <h1 class="login-app-name">${AppConfig.appName}</h1>
      <p class="login-app-desc">${AppConfig.appDescription}</p>
    </div>

    <div class="login-form-card">
      <h2 class="login-form-title">Giriş Yap</h2>
      <p class="login-form-subtitle">Devam etmek için giriş yapın</p>

      <div class="input-group">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-user"></i></span>
          <input type="text" id="login-username" placeholder="Kullanıcı Adı" autocomplete="username" />
        </div>
      </div>

      <div class="input-group" style="margin-top: 12px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-lock-key"></i></span>
          <input type="password" id="login-password" placeholder="Şifre" autocomplete="current-password" />
          <button class="input-action" id="toggle-password" type="button"><i class="ph ph-eye"></i></button>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" id="login-btn">
        Giriş Yap
      </button>

      <div class="login-divider">Sunucu Ayarları</div>

      <button class="server-settings-toggle" id="server-toggle">
        <span><i class="ph ph-gear"></i></span> Sunucu Ayarları
        <span id="server-toggle-arrow"><i class="ph ph-caret-down"></i></span>
      </button>

      <div class="server-settings-panel" id="server-panel">
        <div class="input-group">
          <label>Servis API URL</label>
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-link"></i></span>
            <input type="url" id="api-url-input" placeholder="http://sunucu:port" value="${esc(savedApiUrl)}" />
          </div>
        </div>
        <button class="btn btn-outline btn-block" id="save-api-url" style="margin-top: 12px;">
          <i class="ph ph-floppy-disk"></i> Sunucu Adresini Kaydet
        </button>
      </div>
    </div>
  `;

  // Event listeners
  setTimeout(() => {
    // Toggle password visibility
    const toggleBtn = container.querySelector('#toggle-password');
    const pwInput = container.querySelector('#login-password');
    if (toggleBtn && pwInput) {
      toggleBtn.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
        toggleBtn.innerHTML = pwInput.type === 'password' ? '<i class="ph ph-eye"></i>' : '<i class="ph ph-eye-closed"></i>';
      });
    }

    // Server settings toggle
    const serverToggle = container.querySelector('#server-toggle');
    const serverPanel = container.querySelector('#server-panel');
    const serverArrow = container.querySelector('#server-toggle-arrow');
    if (serverToggle && serverPanel) {
      serverToggle.addEventListener('click', () => {
        serverPanel.classList.toggle('open');
        if (serverArrow) {
          serverArrow.innerHTML = serverPanel.classList.contains('open') ? '<i class="ph ph-caret-up"></i>' : '<i class="ph ph-caret-down"></i>';
        }
      });
    }

    // Save API URL
    const saveApiBtn = container.querySelector('#save-api-url');
    if (saveApiBtn) {
      saveApiBtn.addEventListener('click', () => {
        const urlInput = container.querySelector('#api-url-input');
        if (urlInput && urlInput.value.trim()) {
          api.setBaseUrl(urlInput.value.trim());
          showToast('Sunucu adresi kaydedildi', 'success');
        } else if (urlInput) {
          api.resetBaseUrl();
          urlInput.value = api.getBaseUrl();
          showToast('Varsayılan sunucu adresine dönüldü', 'success');
        }
      });
    }

    // Login
    const loginBtn = container.querySelector('#login-btn');
    const usernameInput = container.querySelector('#login-username');

    async function handleLogin() {
      const username = usernameInput?.value?.trim();
      const password = pwInput?.value?.trim();

      if (!username || !password) {
        showToast('Kullanıcı adı ve şifre gerekli', 'warning');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      const result = await Auth.login(username, password);

      if (result.success) {
        showToast(`Hoş geldiniz, ${result.user.name}!`, 'success');
        if (result.user.mustChangePassword) {
          setTimeout(() => showToast(`Varsayılan şifre kullanılıyor. ${AppConfig.passwordHint || 'Ayarlar > Şifre Değiştir bölümünden'} güncelleyin.`, 'warning', 8000), 600);
        }
        router.navigate('dashboard');
      } else {
        showToast(result.message, 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Giriş Yap';
      }
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', handleLogin);
    }

    // Enter tuşu ile giriş
    if (pwInput) {
      pwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }
    if (usernameInput) {
      usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') pwInput?.focus();
      });
    }
  }, 0);

  return container;
}
