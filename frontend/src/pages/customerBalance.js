/**
 * DEPO TAKİP - Müşteri Bakiyeleri Sayfası
 */

import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { esc } from '../components/shell.js';
import { exportTable, exportButton } from '../core/exportTable.js';

export default function CustomerBalancePage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: 'Müşteri Bakiyeleri',
    showBack: true,
    gradientClass: 'gradient-reports'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  
  content.innerHTML = `
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="cb-search" placeholder="Müşteri ara..." />
      </div>
    </div>
    <div class="list-toolbar"><span></span>${exportButton('cb-export')}</div>
    <div id="cb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `;
  container.appendChild(content);

  const listContainer = content.querySelector('#cb-list');
  content.querySelector('#cb-export').addEventListener('click', () => {
    const term = (searchInput.value || '').toLowerCase();
    const data = customers.filter((c) => !term || String(c.name || '').toLowerCase().includes(term));
    exportTable('Musteri bakiyeleri', [['Müşteri', 'name'], ['Bakiye', (c) => c.balance], ['Para birimi', 'currency']], data);
  });
  const searchInput = content.querySelector('#cb-search');
  let customers = [];

  const loadData = async () => {
    try {
      const res = await api.getCustomers();
      if (res.success) {
        customers = res.data;
        renderList(customers);
      } else {
        listContainer.innerHTML = `<div class="empty-state">Veri yüklenemedi.</div>`;
      }
    } catch (e) {
      listContainer.innerHTML = `<div class="empty-state">Sunucu bağlantısı hatası.</div>`;
    }
  };

  const renderList = (data) => {
    if (data.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Müşteri bulunamadı.</div>`;
      return;
    }

    listContainer.innerHTML = data.map((c, i) => {
      const isNegative = c.balance < 0;
      const isZero = c.balance === 0;
      const balanceColor = isNegative ? 'var(--error)' : (isZero ? 'var(--text-secondary)' : 'var(--success)');
      
      return `
        <div class="list-item animate-fade-in-up stagger-${(i % 5) + 1}">
          <div class="list-icon" style="background: rgba(103, 58, 183, 0.1); color: #673ab7;">
            <i class="ph ph-user-circle"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${esc(c.name)}</div>
            <div class="list-subtitle">Müşteri ID: ${c.id}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Bakiye</span>
                <span style="color:${balanceColor}; font-weight:700; font-size: 16px;">
                  ${c.balance.toLocaleString('tr-TR')} ${esc(c.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = customers.filter(c => c.name.toLowerCase().includes(term));
    renderList(filtered);
  });

  // Init
  setTimeout(loadData, 0);

  return container;
}
