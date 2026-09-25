/**
 * DEPO TAKİP - Raporlar Sayfası
 */

import AppConfig, { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import router from '../core/router.js';
import { esc } from '../components/shell.js';

export default function ReportsPage() {
  const container = document.createElement('div');
  container.className = 'page-reports page-container';

  const header = createHeader({ title: pageTitle('reports', 'Raporlar'), gradientClass: 'gradient-reports' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';

  const reports = AppConfig.reportTypes;

  content.innerHTML = `
    <div class="report-grid">
      ${reports.map((r, i) => `
        <div class="report-card animate-fade-in-up stagger-${i + 1}" data-color="${r.color}" data-route="${r.route}" id="report-${r.id}">
          <div class="report-icon">${r.icon}</div>
          <div class="report-name">${esc(r.label)}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.appendChild(content);

  setTimeout(() => {
    container.querySelectorAll('.report-card').forEach(card => {
      card.addEventListener('click', () => {
        const route = card.dataset.route;
        if (route) {
          router.navigate(route);
        }
      });
    });
  }, 0);

  return container;
}
