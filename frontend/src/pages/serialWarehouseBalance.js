/**
 * DEPO TAKİP - Seri Ambar Bakiye
 * Depo bazlı gerçek stok bakiyeleri (warehouse_stock). Şube sekmeleri veritabanındaki şubelerden oluşur.
 */

import { reportTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import api from '../core/api.js';
import { exportTable, exportButton } from '../core/exportTable.js';

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function SerialWarehouseBalancePage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: reportTitle('seriAmbar', 'Seri Ambar Bakiye'),
    showBack: true,
    gradientClass: 'gradient-transfer'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';

  content.innerHTML = `
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="swb-search" placeholder="Stok kodu, barkod veya ürün adı ara..." />
      </div>
    </div>

    <div id="swb-tabs" class="filter-tabs animate-fade-in-down stagger-1" style="display: flex; gap: 10px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 5px;"></div>

    <div class="list-toolbar">
      <div id="swb-summary" style="font-size: 13px; color: var(--text-secondary);"></div>
      ${exportButton('swb-export')}
    </div>

    <div id="swb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `;
  container.appendChild(content);

  const listContainer = content.querySelector('#swb-list');
  const searchInput = content.querySelector('#swb-search');
  const tabsEl = content.querySelector('#swb-tabs');
  const summaryEl = content.querySelector('#swb-summary');

  let rows = [];
  let branches = [];
  let branchFilter = 'all';

  const tabStyle = (active) =>
    `padding: 6px 14px; border-radius: 20px; border: none; white-space: nowrap; cursor: pointer; font-weight: 600; font-size: 13px; ` +
    (active ? 'background: var(--primary); color: #fff;' : 'background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow-sm);');

  const renderTabs = () => {
    tabsEl.innerHTML = [{ id: 'all', name: 'Tümü' }, ...branches.map((b) => ({ id: b.id, name: `Şube ${b.code || b.id}` }))]
      .map((t) => `<button class="filter-tab ${branchFilter === t.id ? 'active' : ''}" data-branch="${esc(t.id)}" style="${tabStyle(branchFilter === t.id)}">${esc(t.name)}</button>`)
      .join('');
  };

  let visible = [];
  const renderList = () => {
    const term = searchInput.value.trim().toLowerCase();
    const data = rows.filter((r) =>
      (branchFilter === 'all' || r.branchId === branchFilter) &&
      (!term || [r.code, r.barcode, r.name, r.warehouseName].some((v) => String(v || '').toLowerCase().includes(term)))
    );

    visible = data;
    const total = data.reduce((s, r) => s + r.qty, 0);
    summaryEl.innerHTML = data.length ? `<b>${data.length}</b> kayıt · toplam <b>${total.toLocaleString('tr-TR')}</b> adet` : '';

    if (data.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Bakiye bulunamadı.</div>`;
      return;
    }

    listContainer.innerHTML = data.map((item, i) => `
      <div class="list-item animate-fade-in-up stagger-${(i % 5) + 1}">
        <div class="list-icon" style="background: rgba(33, 150, 243, 0.1); color: #2196F3;">
          <i class="ph ph-barcode"></i>
        </div>
        <div class="list-content">
          <div class="list-title">${esc(item.barcode || item.code)}</div>
          <div class="list-subtitle">${esc(item.code)} - ${esc(item.name)}</div>
          <div style="display: flex; gap: 12px; margin-top: 5px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
            <span><i class="ph ph-warehouse"></i> ${esc(item.warehouseName || item.warehouseId)}</span>
            <span style="font-weight: 600; color: var(--text-primary);"><i class="ph ph-stack"></i> ${item.qty.toLocaleString('tr-TR')} ${esc(item.unit)}</span>
          </div>
        </div>
      </div>
    `).join('');
  };

  const loadData = async () => {
    try {
      const [balRes, brRes] = await Promise.all([api.get('/warehouse-balances'), api.get('/branches')]);
      rows = balRes.success ? balRes.data : [];
      branches = brRes.success ? brRes.data : [];
      renderTabs();
      if (rows.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Seri bakiye verisi bulunamadı.</div>`;
        return;
      }
      renderList();
    } catch (e) {
      listContainer.innerHTML = `<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>`;
    }
  };

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-branch]');
    if (!btn) return;
    branchFilter = btn.dataset.branch;
    renderTabs();
    renderList();
  });
  searchInput.addEventListener('input', renderList);

  content.querySelector('#swb-export').addEventListener('click', () => exportTable('Seri ambar bakiye', [
    ['Stok kodu', 'code'], ['Barkod', 'barcode'], ['Ürün', 'name'], ['Kategori', 'category'],
    ['Depo', 'warehouseName'], ['Şube', 'branchName'], ['Miktar', (r) => r.qty], ['Birim', 'unit'],
  ], visible));

  setTimeout(loadData, 0);

  return container;
}
