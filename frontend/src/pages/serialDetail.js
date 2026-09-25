/**
 * DEPO TAKİP - Seri Detay Sayfası
 */

import { reportTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import api from '../core/api.js';
import { esc } from '../components/shell.js';

export default function SerialDetailPage() {
  const container = document.createElement('div');
  container.className = 'page-serial-detail page-container';

  const header = createHeader({ title: reportTitle('seriDetay', 'Seri Detay'), gradientClass: 'gradient-serial' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <!-- Search -->
    <div class="animate-fade-in-up" style="margin-bottom: 20px;">
      <div class="stock-search-label"><i class="ph ph-magnifying-glass"></i> Seri Numarası Sorgula</div>
      <div class="search-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-device-mobile"></i></span>
          <input type="text" id="serial-search-input" placeholder="Seri numarası yazın..." />
        </div>
        <button class="search-btn gradient-serial" id="serial-search-btn"><i class="ph ph-magnifying-glass"></i></button>
      </div>
    </div>

    <div id="serial-result-area"></div>
  `;

  container.appendChild(content);

  setTimeout(() => {
    const searchInput = container.querySelector('#serial-search-input');
    const searchBtn = container.querySelector('#serial-search-btn');

    async function doSearch() {
      const query = searchInput?.value?.trim();
      if (!query) {
        showToast('Lütfen seri numarası girin', 'warning');
        return;
      }

      const resultArea = container.querySelector('#serial-result-area');
      resultArea.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';

      try {
        const res = await api.get(`/serials/${encodeURIComponent(query)}`);
        if (res.success && res.data) {
          await renderSerialResult(res.data, resultArea);
        } else {
          resultArea.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon"><i class="ph ph-magnifying-glass"></i></div>
              <div class="empty-text">${esc(res.message || 'Seri bulunamadı')}</div>
            </div>
          `;
        }
      } catch (err) {
        resultArea.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${esc(err.message)}</div></div>`;
      }
    }

    searchBtn?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }, 0);

  async function renderSerialResult(serial, area) {
    let activeTab = 'MT';

    // Diğer serileri yükle
    let othersData = { items: [], totalCount: 0, totalQuantity: 0 };
    try {
      const othersRes = await api.get(`/serials/${encodeURIComponent(serial.serialNo)}/others`);
      if (othersRes.success) {
        othersData = othersRes.data;
      }
    } catch (_e) { /* silent */ }

    function render() {
      const prices = serial.prices?.[activeTab];

      area.innerHTML = `
        <!-- Seri Bilgi Kartı -->
        <div class="serial-info-card gradient-serial animate-fade-in-up">
          <div class="serial-info-inner">
            <div class="serial-no-row">
              <div class="serial-no-icon"><i class="ph ph-device-mobile"></i></div>
              <div>
                <div class="serial-no-label">Seri No</div>
                <div class="serial-no-value">${esc(serial.serialNo)}</div>
              </div>
            </div>
            <div class="serial-details-grid">
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-package"></i></span>
                <span class="detail-label">Miktar:</span>
                <span class="detail-value">${serial.quantity}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-map-pin"></i></span>
                <span class="detail-label">Hücre:</span>
                <span class="detail-value">${esc(serial.cell)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-factory"></i></span>
                <span class="detail-label">Depo:</span>
                <span class="detail-value">${esc(serial.warehouseId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-office-chair"></i></span>
                <span class="detail-label">Şube:</span>
                <span class="detail-value">${esc(serial.branchId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-folder-open"></i></span>
                <span class="detail-label">Koleksiyon:</span>
                <span class="detail-value">${esc(serial.collection)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-palette"></i></span>
                <span class="detail-label">Eski Desen:</span>
                <span class="detail-value">${esc(serial.oldDesen)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fiyat Bilgileri -->
        <div class="animate-fade-in-up stagger-1" style="margin-top: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span><i class="ph ph-coins"></i></span>
            <h3 style="font-size: 16px; font-weight: 700;">Fiyat Bilgileri</h3>
          </div>

          <div class="card" style="padding: 16px;">
            <div class="tab-bar" style="margin-bottom: 16px;">
              ${Object.keys(serial.prices || {}).map(pt => `
                <div class="tab-item ${activeTab === pt ? 'active' : ''}" data-tab="${pt}" style="${activeTab === pt ? 'background: var(--secondary);' : ''}">${pt}</div>
              `).join('')}
            </div>

            ${prices ? `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                <span><i class="ph ph-currency-circle-dollar"></i></span>
                <span style="font-weight: 600;">Fiyat Tipi: ${activeTab}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Kar Oranı</span>
                  <span style="font-weight: 800; color: var(--text-primary);">%${prices.profitRate.toFixed(1)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Dolar</span>
                  <span style="font-weight: 800; color: var(--color-usd);">$${prices.usd}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(230,126,34,0.06); border-radius: 10px; border: 1px solid rgba(230,126,34,0.15);">
                  <span style="font-weight: 600; color: var(--color-eur);">Euro</span>
                  <span style="font-weight: 800; color: var(--color-eur);">€${prices.eur}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(231,76,60,0.06); border-radius: 10px; border: 1px solid rgba(231,76,60,0.15);">
                  <span style="font-weight: 600; color: var(--color-try);">TL</span>
                  <span style="font-weight: 800; color: var(--color-try);">${prices.try} ₺</span>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Depodaki Diğer Seriler -->
        ${othersData.totalCount > 0 ? `
        <div class="other-series-section animate-fade-in-up stagger-2">
          <div class="other-series-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span><i class="ph ph-map-pin"></i></span>
              <span class="series-count">Depodaki Diğer Seriler (${othersData.totalCount})</span>
            </div>
          </div>

          <div class="series-summary">
            <span class="summary-label"><i class="ph ph-package"></i> Toplam ${othersData.totalCount} Seri</span>
            <span class="summary-badge">Miktar: ${othersData.totalQuantity.toFixed(2)}</span>
          </div>

          <div class="series-list">
            ${othersData.items.map((s, i) => `
              <div class="list-item" style="animation: fadeInUp 200ms ease ${i * 60}ms forwards; opacity: 0;">
                <div class="list-icon" style="background: rgba(108,99,255,0.08); color: var(--primary);"><i class="ph ph-device-mobile"></i></div>
                <div class="list-content">
                  <div class="list-title">${esc(s.serialNo)}</div>
                  <div class="list-subtitle">Miktar: ${s.quantity}</div>
                </div>
                <div class="list-action">▾</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      `;

      // Tab events
      area.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
          activeTab = tab.dataset.tab;
          render();
        });
      });
    }

    render();
  }

  return container;
}
