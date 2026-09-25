/**
 * DEPO TAKİP - Stok Detay Sayfası
 */

import { reportTitle, pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import api from '../core/api.js';
import { esc } from '../components/shell.js';
import { mountStockManager } from './stockManage.js';
import router from '../core/router.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';

const CATEGORIES = ['Pastacılık Katkı', 'Şurup', 'Aroma', 'Ezme', 'Jöle & Jel', 'Çikolata', 'Ambalaj', 'Genel'];
const UNITS = ['Adet', 'Kova', 'Kutu', 'Şişe', 'Bidon', 'Paket', 'Kg', 'Litre'];

export default function StockDetailPage() {
  const container = document.createElement('div');
  container.className = 'page-stock-detail page-container';

  const header = createHeader({ title: pageTitle('stockDetail', reportTitle('stokDetay', 'Stok Detay')), gradientClass: 'gradient-stock' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <div class="seg-tabs" role="tablist">
      <button type="button" class="seg-tab active" data-view="query" role="tab"><i class="ph ph-magnifying-glass"></i> Sorgula</button>
      <button type="button" class="seg-tab" data-view="manage" role="tab"><i class="ph ph-sliders-horizontal"></i> Stok Yönetimi</button>
    </div>
    <div id="view-manage" hidden></div>
    <div id="view-query">
    <!-- Search & Scanner -->
    <div class="stock-search-section animate-fade-in-up">
      <div class="stock-search-label"><i class="ph ph-warehouse"></i> Depo Stokları & Barkod</div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-buildings"></i></span>
          <select id="warehouse-select" class="input-element">
            <option value="">Depo Seçiliyor...</option>
          </select>
        </div>
      </div>

      <div class="search-input-row" style="margin-bottom: 10px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="stock-search-input" placeholder="Barkod veya Stok Kodu..." />
        </div>
        <button class="search-btn gradient-stock" id="stock-search-btn"><i class="ph ph-magnifying-glass"></i></button>
      </div>

      <button class="btn btn-primary btn-block" id="btn-scan-barcode" style="background: var(--color-stock);">
        <i class="ph ph-camera"></i> Kamera ile Barkod Okut
      </button>
    </div>

    <!-- Result -->
    <div id="stock-result-area"></div>
    </div>
  `;

  container.appendChild(content);

  setTimeout(async () => {
    const searchInput = container.querySelector('#stock-search-input');
    const searchBtn = container.querySelector('#stock-search-btn');
    const scanBtn = container.querySelector('#btn-scan-barcode');
    const whSelect = container.querySelector('#warehouse-select');
    const resultArea = container.querySelector('#stock-result-area');

    let allProducts = [];
    let warehouses = [];
    let balances = []; // depo bazlı stok

    try {
      const [whRes, prdRes, balRes] = await Promise.all([
        api.getWarehouses(),
        api.get('/products'),
        api.get('/warehouse-balances')
      ]);
      if (whRes.success) warehouses = whRes.data;
      if (prdRes.success) allProducts = prdRes.data;
      if (balRes.success) balances = balRes.data;

      whSelect.innerHTML = '<option value="">Tüm Depolar</option>' + 
        warehouses.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('');
    } catch(e) {
      console.error('Veri yükleme hatası:', e);
    }

    async function refreshProducts() {
      try {
        const [prdRes, balRes] = await Promise.all([api.get('/products'), api.get('/warehouse-balances')]);
        if (prdRes.success) allProducts = prdRes.data;
        if (balRes.success) balances = balRes.data;
      } catch(_) {}
    }

    function doSearch(queryText) {
      const query = queryText || searchInput?.value?.trim();
      const whId = whSelect.value;
      
      resultArea.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';

      setTimeout(() => {
        let filtered = allProducts;
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(p => 
            (p.code && p.code.toLowerCase().includes(q)) || 
            (p.barcode && p.barcode === query) || 
            (p.name && p.name.toLowerCase().includes(q))
          );
        }
        
        if (filtered.length > 0) {
          renderStockList(filtered, resultArea, whId);
        } else {
          renderNewProductForm(query, resultArea, whId);
        }
      }, 200);
    }

    function renderNewProductForm(barcodeVal, area, whId) {
      area.innerHTML = `
        <div class="card animate-fade-in-up" style="margin-top:15px; padding:20px;">
          <div style="text-align:center; margin-bottom:18px;">
            <div style="font-size:40px; margin-bottom:8px; color:var(--text-tertiary);"><i class="ph ph-package"></i></div>
            <div style="font-weight:700; font-size:17px; color:var(--text-primary);">Ürün Bulunamadı</div>
            <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">Bu barkod sistemde kayıtlı değil. Yeni ürün olarak kaydedebilirsiniz.</div>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Barkod</label>
            <input type="text" class="input-element" value="${barcodeVal || ''}" id="new-prod-barcode" style="background:#f5f5f5;" readonly />
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Ürün Adı *</label>
            <input type="text" class="input-element" placeholder="Örn: Çikolata Sosu 5kg" id="new-prod-name" />
          </div>
          <div style="display:flex; gap:10px; margin-bottom:12px;">
            <div class="form-group" style="flex:1;">
              <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Kategori</label>
              <select class="input-element" id="new-prod-category">
                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Birim</label>
              <select class="input-element" id="new-prod-unit">
                ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Başlangıç Miktarı</label>
            <input type="number" class="input-element" value="1" min="1" id="new-prod-qty" />
          </div>
          <button class="btn btn-primary btn-block" id="btn-save-new-prod" style="padding:14px; font-size:15px;">
            <i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet
          </button>
        </div>
      `;

      const saveBtn = container.querySelector('#btn-save-new-prod');
      saveBtn?.addEventListener('click', async () => {
        const bcode = container.querySelector('#new-prod-barcode').value;
        const pname = container.querySelector('#new-prod-name').value.trim();
        const pcategory = container.querySelector('#new-prod-category').value;
        const punit = container.querySelector('#new-prod-unit').value;
        const pqty = container.querySelector('#new-prod-qty').value;
        
        if (!pname) return showToast('Lütfen ürün adı girin', 'warning');
        if (!pqty || pqty <= 0) return showToast('Geçerli miktar girin', 'warning');
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';
        
        try {
          const res = await api.post('/purchase', { barcode: bcode, name: pname, quantity: pqty, warehouseId: whId, category: pcategory, unit: punit });
          if (res.success) {
            showToast(res.message, 'success');
            await refreshProducts();
            doSearch(bcode);
          } else {
            showToast(res.message || 'Hata oluştu', 'error');
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet';
          }
        } catch(e) {
          showToast('Kayıt hatası: ' + e.message, 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet';
        }
      });
    }

    function renderStockList(products, area, whId) {
      const whName = warehouses.find(w => w.id === whId)?.name;
      const qtyIn = (pid, wid) => balances.find(b => b.productId === pid && b.warehouseId === wid)?.qty || 0;
      area.innerHTML = products.map((stock, i) => `
        <div class="stock-result-card animate-fade-in-up stagger-${(i%5)+1}" style="margin-top: 16px;">
          <div class="stock-result-header">
            <div class="stock-icon"><i class="ph ph-package"></i></div>
            <div>
              <div class="stock-name">${esc(stock.name)}</div>
              <div class="stock-code">${esc(stock.code)}</div>
            </div>
          </div>

          <div class="stock-chips">
            <span class="stock-chip varyant"><i class="ph ph-barcode"></i> ${stock.barcode || 'Barkod Yok'}</span>
            <span class="stock-chip zemin"><i class="ph ph-tag"></i> ${stock.category || 'Belirtilmedi'}</span>
            <span class="stock-chip net" style="background: var(--color-stock); color:white;">
              <i class="ph ph-archive"></i> ${whId ? 'Toplam Stok' : 'Stok'}: ${stock.stock} ${esc(stock.unit)}
            </span>
            ${whId ? `<span class="stock-chip" style="background: var(--success); color:white;"><i class="ph ph-warehouse"></i> ${whName}: ${qtyIn(stock.id, whId)} ${esc(stock.unit)}</span>` : ''}
          </div>
          ${!whId ? `<div style="margin-top:8px; font-size:12px; color:var(--text-secondary);"><i class="ph ph-warehouse"></i> ${
            balances.filter(b => b.productId === stock.id).map(b => `${esc(b.warehouseName)}: <b>${b.qty}</b>`).join(' &nbsp;•&nbsp; ') || 'Depo kaydı yok'
          }</div>` : ''}
          ${stock.price ? `<div style="margin-top:8px; font-size:13px; color:var(--text-secondary);"><i class="ph ph-currency-circle-dollar"></i> Birim Fiyat: ${stock.price.toLocaleString('tr-TR')} ₺</div>` : ''}
          
          <div style="margin-top:15px; border-top: 1px solid var(--border-color); padding-top:15px;">
            <div class="sd-add-title"><i class="ph ph-package"></i> Mal Kabul / Stok Ekle</div>
            <div class="sd-add-row">
              <input type="number" id="add-qty-${stock.id}" class="sd-qty" value="1" min="1" inputmode="numeric" aria-label="Eklenecek miktar" />
              <button class="btn btn-primary" id="btn-add-${stock.id}">
                <i class="ph ph-plus-circle"></i> Ekle
              </button>
            </div>
          </div>
        </div>
      `).join('');

      products.forEach(stock => {
        const btn = area.querySelector(`#btn-add-${stock.id}`);
        btn?.addEventListener('click', async () => {
          const qty = area.querySelector(`#add-qty-${stock.id}`).value;
          if (!qty || qty <= 0) return showToast('Geçerli miktar girin', 'warning');

          btn.disabled = true;
          btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';

          try {
            const res = await api.post('/purchase', { barcode: stock.barcode, name: stock.name, quantity: qty, warehouseId: whId });
            if (res.success) {
              showToast(res.message, 'success');
              await refreshProducts();
              doSearch(searchInput?.value?.trim() || '');
            } else {
              showToast(res.message || 'Hata', 'error');
              btn.disabled = false;
              btn.innerHTML = '<i class="ph ph-plus-circle"></i> Ekle';
            }
          } catch(e) {
            showToast('Hata: ' + e.message, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-plus-circle"></i> Ekle';
          }
        });
      });
    }

    searchBtn?.addEventListener('click', () => doSearch());
    wireBarcodeInput(searchInput, (code) => { searchInput.value = code; doSearch(code); });

    // Sekmeler: Sorgula / Stok Yönetimi
    const viewQuery = container.querySelector('#view-query');
    const viewManage = container.querySelector('#view-manage');
    let managerLoaded = false;
    container.querySelectorAll('.seg-tab').forEach((tab) => tab.addEventListener('click', () => {
      container.querySelectorAll('.seg-tab').forEach((x) => x.classList.toggle('active', x === tab));
      const manage = tab.dataset.view === 'manage';
      viewQuery.hidden = manage;
      viewManage.hidden = !manage;
      if (manage) { mountStockManager(viewManage); managerLoaded = true; }
      else if (managerLoaded) { refreshProducts().then(() => doSearch()); }
    }));
    whSelect?.addEventListener('change', () => doSearch());

    scanBtn?.addEventListener('click', () => {
      openBarcodeScanner((barcode) => {
        showToast('Barkod Okundu: ' + barcode, 'success');
        searchInput.value = barcode;
        doSearch(barcode);
      });
    });

    // İlk yükleme - tüm ürünleri göster (arama sonucu ?tab=manage ile geldiyse yönetim sekmesi)
    doSearch();
    if (router.getQueryParams().tab === 'manage') container.querySelector('.seg-tab[data-view="manage"]')?.click();
  }, 0);

  return container;
}
