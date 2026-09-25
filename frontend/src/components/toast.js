/**
 * DEPO TAKİP - Toast Notification
 */

let toastCounter = 0;

/**
 * Toast bildirim göster
 * @param {string} message - Mesaj
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - Süre (ms)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const id = `toast-${++toastCounter}`;
  const icons = {
    success: '<i class="ph-bold ph-check"></i>',
    error: '<i class="ph-bold ph-x"></i>',
    warning: '<i class="ph-bold ph-warning"></i>',
    info: '<i class="ph-bold ph-info"></i>',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = id;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message"></div>
  `;
  toast.querySelector('.toast-message').textContent = String(message ?? '');

  container.appendChild(toast);

  // Otomatik kaldır
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration);
}
