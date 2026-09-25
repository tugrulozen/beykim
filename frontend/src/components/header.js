/**
 * DEPO TAKİP - Header Component
 */

import router from '../core/router.js';

/**
 * Sayfa header'ı oluştur
 * @param {Object} options - { title, gradientClass, showBack, actions: [{icon, onClick}] }
 */
export function createHeader({ title, gradientClass = 'gradient-primary', showBack = true, actions = [] }) {
  const header = document.createElement('header');
  header.className = `app-header ${gradientClass}`;

  let actionsHtml = '';
  if (actions.length > 0) {
    actionsHtml = `<div class="header-actions">
      ${actions.map((a, i) => `<button class="header-action-btn" id="header-action-${i}" title="${a.title || ''}">${a.icon}</button>`).join('')}
    </div>`;
  }

  header.innerHTML = `
    <div class="app-header-inner">
      ${showBack ? '<button class="header-back" id="header-back-btn"><i class="ph ph-arrow-left"></i></button>' : '<div></div>'}
      <h1 class="header-title">${title}</h1>
      ${actionsHtml || '<div></div>'}
    </div>
  `;

  // Geri butonu
  setTimeout(() => {
    const backBtn = header.querySelector('#header-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => router.back());
    }

    // Aksiyon butonları
    actions.forEach((action, i) => {
      const btn = header.querySelector(`#header-action-${i}`);
      if (btn && action.onClick) {
        btn.addEventListener('click', action.onClick);
      }
    });
  }, 0);

  return header;
}
