/**
 * DEPO TAKİP - İşlemler (mobil alt menü): tüm açık modüller bölümlere göre
 */

import AppConfig from '../core/config.js';
import router from '../core/router.js';
import { esc } from '../components/shell.js';
import { mountSearch } from '../components/searchBox.js';
import { moduleAllowed } from '../core/perms.js';

export default function OperationsPage() {
  const container = document.createElement('div');
  container.className = 'page-operations dash';

  // Bölümler, içindeki ilk açık modülün sırasına göre dizilir (modül sırası değişince bölüm de öne gelir)
  const mods = Object.values(AppConfig.modules);
  const rank = (sec) => { const i = mods.findIndex((m) => m.section === sec.id && m.enabled); return i === -1 ? 999 : i; };
  container.innerHTML = `<label class="op-search"><i class="ph ph-magnifying-glass"></i><input type="search" placeholder="Modül veya menü ara…" autocomplete="off" /></label>` + [...AppConfig.sections].sort((a, b) => rank(a) - rank(b)).map((sec) => {
    const items = Object.entries(AppConfig.modules).filter(([k, m]) => m.section === sec.id && m.enabled && moduleAllowed(k)).map(([, m]) => m);
    if (!items.length) return '';
    return `
      <h2 class="dash-h">${esc(sec.title)}</h2>
      <div class="op-list">
        ${items.map((m) => `
          <a class="op-item" data-route="${m.route}">
            <span class="tile-icon">${m.icon}</span>
            <span class="op-text"><b>${esc(m.label)}</b><small>${esc(m.description || '')}</small></span>
            <i class="ph ph-caret-right"></i>
          </a>`).join('')}
      </div>`;
  }).join('');

  mountSearch(container.querySelector('.op-search input'), { host: container.querySelector('.op-search') });

  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) router.navigate(link.dataset.route);
  });
  return container;
}
