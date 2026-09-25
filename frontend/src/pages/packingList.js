/**
 * DEPO TAKİP - Çeki Listesi
 * Son 30 gündeki satışlardan oluşan sevkiyatları paketleme takibiyle tamamlar.
 * Tamamlanan çeki listesi kaydedilir ve sevkiyat listeden düşer.
 */

import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import api from '../core/api.js';
import AppConfig, { reportTitle } from '../core/config.js';
import Auth from '../core/auth.js';

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (d) => (d ? d.split('-').reverse().join('.') : '-');

export default function PackingListPage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: reportTitle('cekiListesi', 'Çeki Listesi'),
    showBack: true,
    gradientClass: 'gradient-stock'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';

  content.innerHTML = `
    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 15px; padding: 15px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--text-primary);">
        <i class="ph ph-info"></i> Sevkiyat Seçimi
      </div>
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-truck"></i></span>
        <select id="pl-shipment" class="input-element"><option value="">Yükleniyor...</option></select>
      </div>
      <div id="pl-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-top: 12px;"></div>
    </div>

    <div class="search-bar" style="margin-bottom: 12px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="pl-search" placeholder="Ürün adı, kod veya barkod ara..." />
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-weight: 600; font-size: 14px; margin-bottom: 10px; color: var(--text-primary);">
      <span>Paketlenecek Ürünler</span>
      <span id="pl-progress" style="font-size:12px; color: var(--text-secondary); font-weight:500;"></span>
    </div>

    <div id="pl-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>

    <div style="margin-top: 20px;">
      <button class="btn btn-primary btn-block" id="btn-complete-packing" style="background: var(--color-stock);">
        <i class="ph ph-check-circle"></i> Çeki Listesini Tamamla
      </button>
    </div>
  `;
  container.appendChild(content);

  const listContainer = content.querySelector('#pl-list');
  const searchInput = content.querySelector('#pl-search');
  const completeBtn = content.querySelector('#btn-complete-packing');
  const shipmentSelect = content.querySelector('#pl-shipment');
  const metaEl = content.querySelector('#pl-meta');
  const progressEl = content.querySelector('#pl-progress');

  let shipments = [];
  let current = null;
  let packingItems = [];

  const selectShipment = (key) => {
    current = shipments.find((s) => s.key === key) || null;
    packingItems = current
      ? current.items.map((it) => ({ ...it, id: it.productId, targetQuantity: it.quantity, packedQuantity: 0, packed: false }))
      : [];
    metaEl.innerHTML = current ? `
      <div><div style="color: var(--text-secondary);">${esc(AppConfig.terms.customer)}</div><div style="font-weight: 500;">${esc(current.customerName)}</div></div>
      <div><div style="color: var(--text-secondary);">Sevkiyat Tarihi</div><div style="font-weight: 500;">${fmtDate(current.date)}</div></div>` : '';
    searchInput.value = '';
    renderList();
  };

  const loadData = async () => {
    try {
      const res = await api.get('/shipments');
      shipments = res.success ? res.data : [];
      if (shipments.length === 0) {
        shipmentSelect.innerHTML = '<option value="">Bekleyen sevkiyat yok</option>';
        listContainer.innerHTML = `<div class="empty-state">Paketlenecek sevkiyat bulunamadı. Satış yapıldığında burada görünür.</div>`;
        completeBtn.disabled = true;
        return;
      }
      completeBtn.disabled = false;
      shipmentSelect.innerHTML = shipments.map((s) =>
        `<option value="${esc(s.key)}">${esc(s.customerName)} — ${fmtDate(s.date)} (${s.items.length} kalem)</option>`).join('');
      selectShipment(shipments[0].key);
    } catch (e) {
      listContainer.innerHTML = `<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>`;
    }
  };

  const updateProgress = () => {
    const done = packingItems.filter((i) => i.packed).length;
    progressEl.textContent = packingItems.length ? `${done} / ${packingItems.length} kalem tamam` : '';
  };

  const renderList = () => {
    updateProgress();
    const term = searchInput.value.trim().toLowerCase();
    const data = packingItems.filter((r) => !term ||
      [r.name, r.code, r.barcode].some((v) => String(v || '').toLowerCase().includes(term)));

    if (data.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Ürün bulunamadı.</div>`;
      return;
    }

    listContainer.innerHTML = data.map((item, i) => `
      <div class="list-item animate-fade-in-up stagger-${(i % 5) + 1}" style="opacity: ${item.packed ? '0.65' : '1'}; transition: all 0.3s;">
        <div class="list-icon" style="background: ${item.packed ? 'var(--success)' : 'rgba(255, 152, 0, 0.1)'}; color: ${item.packed ? '#fff' : '#FF9800'};">
          <i class="ph ${item.packed ? 'ph-check' : 'ph-package'}"></i>
        </div>
        <div class="list-content" style="flex: 1;">
          <div class="list-title" style="text-decoration: ${item.packed ? 'line-through' : 'none'};">${esc(item.name)}</div>
          <div class="list-subtitle">${esc(item.code)} | Hedef: ${item.targetQuantity} ${esc(item.unit)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn-decrement" data-id="${esc(item.id)}" aria-label="Azalt" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-minus"></i></button>
          <span style="font-weight: 600; min-width: 28px; text-align: center;">${item.packedQuantity}</span>
          <button class="btn-increment" data-id="${esc(item.id)}" aria-label="Arttır" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-plus"></i></button>
          <button class="btn-fill" data-id="${esc(item.id)}" title="Tamamını paketle" aria-label="Tamamını paketle" style="width: 30px; height: 30px; border-radius: 6px; border: none; background: var(--primary); color: #fff; cursor: pointer;"><i class="ph ph-checks"></i></button>
        </div>
      </div>
    `).join('');
  };

  listContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const item = packingItems.find((p) => p.id === btn.dataset.id);
    if (!item) return;
    if (btn.classList.contains('btn-increment') && item.packedQuantity < item.targetQuantity) item.packedQuantity++;
    else if (btn.classList.contains('btn-decrement') && item.packedQuantity > 0) item.packedQuantity--;
    else if (btn.classList.contains('btn-fill')) item.packedQuantity = item.targetQuantity;
    else return;
    item.packed = item.packedQuantity >= item.targetQuantity;
    renderList();
  });

  shipmentSelect.addEventListener('change', () => selectShipment(shipmentSelect.value));
  searchInput.addEventListener('input', renderList);

  completeBtn.addEventListener('click', async () => {
    if (!current) return;
    if (!packingItems.every((i) => i.packed)) {
      showToast('Eksik paketlenen ürünler var!', 'warning');
      return;
    }
    completeBtn.disabled = true;
    try {
      const res = await api.post('/packing-lists', {
        shipmentKey: current.key,
        customerId: current.customerId,
        customerName: current.customerName,
        createdBy: Auth.getUser()?.name || '',
        items: packingItems.map((i) => ({ productId: i.productId, code: i.code, name: i.name, quantity: i.packedQuantity, unit: i.unit })),
      });
      if (res.success) {
        showToast('Çeki listesi başarıyla tamamlandı!', 'success');
        await loadData();
      } else {
        showToast(res.message || 'Kaydedilemedi', 'error');
        completeBtn.disabled = false;
      }
    } catch (e) {
      showToast('Hata: ' + e.message, 'error');
      completeBtn.disabled = false;
    }
  });

  setTimeout(loadData, 0);

  return container;
}
