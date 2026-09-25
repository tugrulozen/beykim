/**
 * DEPO TAKİP - Ayarlar Sayfası
 */

import AppConfig from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import api from '../core/api.js';
import Auth from '../core/auth.js';
import { esc } from '../components/shell.js';
import { canInstall, promptInstall } from '../core/pwa.js';
import { confirmDialog } from '../components/dialog.js';

export default function SettingsPage() {
  const container = document.createElement('div');
  container.className = 'page-settings page-container';

  const header = createHeader({ title: 'Ayarlar', gradientClass: 'gradient-primary' });
  container.appendChild(header);

  const user = Auth.getUser();
  const currentApiUrl = api.getBaseUrl();

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <!-- Kullanıcı Bilgileri -->
    <div class="settings-group animate-fade-in-up">
      <div class="settings-group-title">Kullanıcı Bilgileri</div>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(108,99,255,0.1); color: var(--primary);"><i class="ph ph-user"></i></div>
          <span class="settings-label">Kullanıcı</span>
          <span class="settings-value">${esc(user?.name || '-')}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(76,175,80,0.1); color: var(--color-sales);"><i class="ph ph-office-chair"></i></div>
          <span class="settings-label">Şube</span>
          <span class="settings-value">${esc(user?.branchName || '-')}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(255,152,0,0.1); color: var(--color-purchase);"><i class="ph ph-key"></i></div>
          <span class="settings-label">Rol</span>
          <span class="settings-value">${esc(user?.role || '-')}</span>
        </div>
      </div>
    </div>

    <!-- Sunucu Ayarları -->
    <div class="settings-group animate-fade-in-up stagger-1">
      <div class="settings-group-title">Sunucu Ayarları</div>
      <div class="settings-list" style="padding: 16px;">
        <div class="input-group">
          <label>API URL</label>
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-link"></i></span>
            <input type="url" id="settings-api-url" value="${esc(currentApiUrl)}" placeholder="http://sunucu:port" />
          </div>
        </div>
        <button class="btn btn-primary btn-block" id="save-settings-url" style="margin-top: 12px;">
          <i class="ph ph-floppy-disk"></i> Kaydet
        </button>
      </div>
    </div>

    <!-- Uygulama -->
    <div class="settings-group animate-fade-in-up stagger-2">
      <div class="settings-group-title">Uygulama</div>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(156,39,176,0.1); color: var(--color-stock);"><i class="ph ph-device-mobile"></i></div>
          <span class="settings-label">Versiyon</span>
          <span class="settings-value">${AppConfig.version}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(0,188,212,0.1); color: var(--color-help);"><i class="ph ph-globe"></i></div>
          <span class="settings-label">Dil</span>
          <span class="settings-value">Türkçe</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(96,125,139,0.1); color: var(--color-settings);"><i class="ph ph-bell"></i></div>
          <span class="settings-label">Bildirimler</span>
          <label class="settings-toggle-switch" style="margin-left:auto;">
            <input type="checkbox" id="notify-checkbox" />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Uygulama kurulumu -->
    <div class="settings-group animate-fade-in-up stagger-2" id="install-group" hidden>
      <div class="settings-group-title">Telefona Kur</div>
      <div class="settings-list">
        <div class="settings-item" id="install-app" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--primary-soft); color: var(--primary);"><i class="ph ph-device-mobile-speaker"></i></div>
          <span class="settings-label">Ana ekrana ekle</span>
          <span class="settings-value">tarayıcı çubuğu olmadan açılır</span>
          <span class="settings-arrow"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <!-- Görünüm -->
    <div class="settings-group animate-fade-in-up stagger-3">
      <div class="settings-group-title">Görünüm</div>
      <div class="settings-list">
        <div class="settings-item" id="settings-theme-toggle" style="cursor: pointer;">
          <div class="settings-icon" style="background: rgba(30,30,30,0.08); color: #222;" id="theme-icon-wrap">
            <i class="ph ph-moon" id="theme-icon"></i>
          </div>
          <span class="settings-label" id="theme-label">Karanlık Tema</span>
          <label class="settings-toggle-switch" style="margin-left:auto;">
            <input type="checkbox" id="theme-checkbox" />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Şifre -->
    <div class="settings-group animate-fade-in-up stagger-3" id="password-group">
      <div class="settings-group-title">Şifre Değiştir</div>
      <div class="settings-list" style="padding: 16px;">
        <div class="input-group">
          <label>Mevcut şifre</label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="pw-current" autocomplete="current-password" /></div>
        </div>
        <div class="input-group" style="margin-top: 12px;">
          <label>Yeni şifre <span style="font-weight:400;color:var(--text-tertiary)">(en az 8 karakter, harf ve rakam)</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="pw-new" autocomplete="new-password" /></div>
        </div>
        <button class="btn btn-primary btn-block" id="pw-save" style="margin-top: 12px;">
          <i class="ph ph-shield-check"></i> Şifreyi Güncelle
        </button>
      </div>
    </div>

    <!-- Hesap -->
    <div class="settings-group animate-fade-in-up stagger-4">
      <div class="settings-group-title">Hesap</div>
      <div class="settings-list">
        <div class="settings-item" id="settings-logout" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--error-light); color: var(--error);"><i class="ph ph-sign-out"></i></div>
          <span class="settings-label" style="color: var(--error); font-weight: 600;">Çıkış Yap</span>
          <span class="settings-arrow" style="color: var(--error);"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <!-- Sorun giderme -->
    <div class="settings-group animate-fade-in-up stagger-4">
      <div class="settings-group-title">Sorun Giderme</div>
      <div class="settings-list">
        <div class="settings-item" id="clear-cache" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--bg-elevated); color: var(--text-secondary);"><i class="ph ph-arrow-clockwise"></i></div>
          <span class="settings-label">Önbelleği temizle ve yenile</span>
          <span class="settings-value">eski sürüm görünüyorsa</span>
          <span class="settings-arrow"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 12px;">
      ${AppConfig.appName} v${AppConfig.version}<br>
      © 2026 Tüm Hakları Saklıdır
    </div>
  `;

  container.appendChild(content);

  setTimeout(() => {
    // Telefona kurma seçeneği yalnızca tarayıcı destekliyorsa görünür
    const installGroup = container.querySelector('#install-group');
    const syncInstall = () => { installGroup.hidden = !canInstall(); };
    syncInstall();
    window.addEventListener('pwa-install-state', syncInstall);
    container.querySelector('#install-app')?.addEventListener('click', async () => {
      const added = await promptInstall();
      if (added) showToast('Uygulama ana ekrana eklendi', 'success');
      syncInstall();
    });

    container.querySelector('#clear-cache')?.addEventListener('click', async () => {
      const yes = await confirmDialog({ title: 'Önbellek temizlensin mi?', message: 'Uygulama dosyaları yeniden indirilir ve sayfa yenilenir. Kayıtlı verileriniz ve oturumunuz etkilenmez.', confirmLabel: 'Temizle ve yenile' });
      if (!yes) return;
      try {
        const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
        regs.forEach((r) => r.active?.postMessage('clear-cache'));
        if (window.caches) (await caches.keys()).forEach((k) => caches.delete(k));
      } catch (_e) { /* önbellek yoksa sorun değil */ }
      location.reload();
    });

    container.querySelector('#pw-save')?.addEventListener('click', async () => {
      const cur = container.querySelector('#pw-current');
      const neu = container.querySelector('#pw-new');
      if (!cur.value || !neu.value) return showToast('Mevcut ve yeni şifreyi girin', 'warning');
      try {
        const r = await api.post('/auth/change-password', { currentPassword: cur.value, newPassword: neu.value });
        showToast(r.message || 'Şifre değiştirildi', 'success');
        cur.value = ''; neu.value = '';
      } catch (err) {
        showToast(err.message || 'Şifre değiştirilemedi', 'error');
      }
    });
    container.querySelector('#save-settings-url')?.addEventListener('click', () => {
      const urlInput = container.querySelector('#settings-api-url');
      const value = urlInput?.value?.trim();
      if (value) {
        api.setBaseUrl(value);
        showToast('API URL kaydedildi', 'success');
      } else {
        api.resetBaseUrl();
        urlInput.value = api.getBaseUrl();
        showToast('Varsayılan sunucu adresine dönüldü', 'success');
      }
    });

    // Bildirimler (ana sayfadaki kritik stok zili)
    const notifyCheckbox = container.querySelector('#notify-checkbox');
    if (notifyCheckbox) {
      const key = AppConfig.storageKeys.notify;
      notifyCheckbox.checked = localStorage.getItem(key) !== 'off';
      notifyCheckbox.addEventListener('change', () => {
        localStorage.setItem(key, notifyCheckbox.checked ? 'on' : 'off');
        showToast(notifyCheckbox.checked ? 'Bildirimler açıldı' : 'Bildirimler kapatıldı', 'success');
      });
    }

    container.querySelector('#settings-logout')?.addEventListener('click', () => {
      Auth.logout();
    });

    // Tema toggle
    const themeCheckbox = container.querySelector('#theme-checkbox');
    const themeIcon = container.querySelector('#theme-icon');
    const themeLabel = container.querySelector('#theme-label');
    const isDark = document.body.classList.contains('dark-theme');
    if (themeCheckbox) themeCheckbox.checked = isDark;
    if (themeIcon) themeIcon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
    if (themeLabel) themeLabel.textContent = isDark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç';

    themeCheckbox?.addEventListener('change', () => {
      const dark = themeCheckbox.checked;
      document.body.classList.toggle('dark-theme', dark);
      localStorage.setItem(AppConfig.storageKeys.theme, dark ? 'dark' : 'light');
      if (themeIcon) themeIcon.className = dark ? 'ph ph-sun' : 'ph ph-moon';
      if (themeLabel) themeLabel.textContent = dark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç';
      showToast(dark ? 'Karanlık tema açıldı' : 'Aydınlık tema açıldı', 'success');
    });
  }, 0);

  return container;
}
