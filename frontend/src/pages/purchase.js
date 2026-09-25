/**
 * DEPO TAKİP - Alış İşlemleri (Mal Kabul) Sayfası
 */

import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import api from '../core/api.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';
import { esc } from '../components/shell.js';

const CATEGORIES = ['Pastacılık Katkı', 'Şurup', 'Aroma', 'Ezme', 'Jöle & Jel', 'Çikolata', 'Ambalaj', 'Genel'];
const UNITS = ['Adet', 'Kova', 'Kutu', 'Şişe', 'Bidon', 'Paket', 'Kg', 'Litre'];

export default function PurchasePage() {
  const container = document.createElement('div');
  container.className = 'page-purchase page-container';

  const header = createHeader({ title: 'Alış İşlemleri', gradientClass: 'gradient-transfer' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <div class="transfer-info-card animate-fade-in-down" style="margin-bottom: 20px;">
      <div class="info-icon"><i class="ph ph-shopping-cart"></i></div>
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">Mal Kabul İşlemi</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Tedarikçiden gelen malları kayıt altına alın.</div>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1" style="margin-top: 16px;">
      <div class="transfer-section-title"><i class="ph ph-clipboard-text"></i> Alış Bilgileri</div>
      <div class="input-group" style="margin-top: 12px;">
        <label>İrsaliye No</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-file-text"></i></span>
          <input type="text" id="pu-invoice" placeholder="İrsaliye numarası (opsiyonel)" />
        </div>
      </div>
    </div>

    <div class="barcode-section animate-fade-in-up stagger-2" style="margin-top: 16px;">
      <h3 class="barcode-title">Ürün Barkod Okutma</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="pu-barcode-input" placeholder="Barkod giriniz..." />
        </div>
        <button class="camera-btn" id="pu-camera-btn"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <!-- Yeni ürün formu (gizli, gerektiğinde gösterilir) -->
    <div id="pu-new-product-form" style="display:none; margin-top:16px;"></div>

    <div id="pu-items-list" style="margin-top: 16px;"></div>

    <button class="btn btn-warning btn-block btn-lg animate-fade-in-up stagger-3" id="pu-submit" style="margin-top: 20px;">
      <i class="ph ph-floppy-disk"></i> Alış Kaydını Tamamla
    </button>
  `;

  container.appendChild(content);

  let items = [];

  setTimeout(async () => {
    const barcodeInput = container.querySelector('#pu-barcode-input');
    const newProductForm = container.querySelector('#pu-new-product-form');
    
    // Mevcut ürünleri yükle
    let allProducts = [];
    try {
      const res = await api.get('/products');
      if (res.success) allProducts = res.data;
    } catch(_) {}

    function handleBarcode(code) {
      // Ürün sistemde var mı kontrol et
      const existing = allProducts.find(p => p.barcode === code);
      if (existing) {
        // Ürün bulundu - miktar sor (inline)
        showQuantityInput(code, existing.name, existing);
      } else {
        // Yeni ürün - detay formu göster
        showNewProductForm(code);
      }
      barcodeInput.value = '';
    }

    function showQuantityInput(code, productName, product) {
      newProductForm.style.display = 'block';
      newProductForm.innerHTML = `
        <div class="card" style="padding:16px; border-left: 4px solid var(--success);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--success);">
            <i class="ph ph-check-circle"></i> Ürün Bulundu: ${productName}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Mevcut Stok: ${product.stock} ${esc(product.unit)} | Kategori: ${esc(product.category)}
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <input type="number" class="input-element" value="1" min="1" id="pu-qty-input" style="flex:1;" placeholder="Miktar" />
            <button class="btn btn-primary" id="pu-qty-add" style="flex:1;">
              <i class="ph ph-plus"></i> Listeye Ekle
            </button>
          </div>
        </div>
      `;

      container.querySelector('#pu-qty-add')?.addEventListener('click', () => {
        const qty = parseInt(container.querySelector('#pu-qty-input').value);
        if (!qty || qty <= 0) return showToast('Geçerli miktar girin', 'warning');
        items.push({ code, name: productName, qty, category: product.category, unit: product.unit, isNew: false });
        showToast(`${productName} x${qty} eklendi`, 'success');
        newProductForm.style.display = 'none';
        updateList();
      });

      container.querySelector('#pu-qty-input')?.focus();
    }

    function showNewProductForm(code) {
      newProductForm.style.display = 'block';
      newProductForm.innerHTML = `
        <div class="card" style="padding:16px; border-left: 4px solid var(--warning);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--warning);">
            <i class="ph ph-warning-circle"></i> Yeni Ürün: ${code}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Bu barkod sistemde kayıtlı değil. Ürün bilgilerini girin.
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label style="font-size:13px; font-weight:600;">Ürün Adı *</label>
            <input type="text" class="input-element" placeholder="Örn: Çikolata Sosu 5kg" id="pu-new-name" />
          </div>
          <div style="display:flex; gap:10px; margin-bottom:10px;">
            <div style="flex:1;">
              <label style="font-size:13px; font-weight:600;">Kategori</label>
              <select class="input-element" id="pu-new-category">
                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div style="flex:1;">
              <label style="font-size:13px; font-weight:600;">Birim</label>
              <select class="input-element" id="pu-new-unit">
                ${UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-size:13px; font-weight:600;">Miktar</label>
            <input type="number" class="input-element" value="1" min="1" id="pu-new-qty" />
          </div>
          <button class="btn btn-primary btn-block" id="pu-new-add">
            <i class="ph ph-plus-circle"></i> Listeye Ekle
          </button>
        </div>
      `;

      container.querySelector('#pu-new-add')?.addEventListener('click', () => {
        const name = container.querySelector('#pu-new-name').value.trim();
        const category = container.querySelector('#pu-new-category').value;
        const unit = container.querySelector('#pu-new-unit').value;
        const qty = parseInt(container.querySelector('#pu-new-qty').value);

        if (!name) return showToast('Ürün adı zorunludur', 'warning');
        if (!qty || qty <= 0) return showToast('Geçerli miktar girin', 'warning');

        items.push({ code, name, qty, category, unit, isNew: true });
        showToast(`${name} x${qty} eklendi (Yeni Ürün)`, 'success');
        newProductForm.style.display = 'none';
        updateList();
      });

      container.querySelector('#pu-new-name')?.focus();
    }

    wireBarcodeInput(barcodeInput, handleBarcode);

    container.querySelector('#pu-camera-btn')?.addEventListener('click', () => {
      openBarcodeScanner((code) => {
        handleBarcode(code);
      });
    });

    container.querySelector('#pu-submit')?.addEventListener('click', async () => {
      if (items.length === 0) {
        showToast('Lütfen en az bir ürün ekleyin', 'warning');
        return;
      }
      const submitBtn = container.querySelector('#pu-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';
      
      try {
        let successCount = 0;
        for (const item of items) {
          const res = await api.post('/purchase', {
            barcode: item.code,
            name: item.name,
            quantity: item.qty,
            category: item.category,
            unit: item.unit,
            warehouseId: null
          });
          if (res.success) successCount++;
        }
        
        showToast(`${successCount}/${items.length} ürün başarıyla stoğa eklendi!`, 'success');
        items = [];
        updateList();
        
        // Ürün listesini yenile
        const pRes = await api.get('/products');
        if (pRes.success) allProducts = pRes.data;
      } catch (err) {
        showToast('Kayıt sırasında hata: ' + err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Alış Kaydını Tamamla';
      }
    });

    function updateList() {
      const list = container.querySelector('#pu-items-list');
      if (items.length === 0) {
        list.innerHTML = '';
        return;
      }
      list.innerHTML = `
        <div style="font-weight:600; font-size:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span><i class="ph ph-list-bullets"></i> Eklenen Ürünler (${items.length})</span>
          <button id="pu-clear-all" style="font-size:12px; color:var(--error); background:none; border:none; cursor:pointer; font-weight:600;">Temizle</button>
        </div>
      ` + items.map((item, i) => `
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${i * 40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: ${item.isNew ? 'rgba(255,152,0,0.1)' : 'rgba(76,175,80,0.1)'}; color: ${item.isNew ? '#FF9800' : '#4CAF50'};">
            <i class="ph ph-${item.isNew ? 'plus-circle' : 'package'}"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${esc(item.name)}</div>
            <div class="list-subtitle">${esc(item.code)} · ${item.qty} ${esc(item.unit)} · ${esc(item.category)}</div>
          </div>
          <button class="remove-item-btn" data-idx="${i}" style="background:none; border:none; color:var(--error); cursor:pointer; font-size:18px; padding:4px;">
            <i class="ph ph-x-circle"></i>
          </button>
        </div>
      `).join('');

      // Remove individual items
      list.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          items.splice(idx, 1);
          updateList();
        });
      });

      // Clear all
      list.querySelector('#pu-clear-all')?.addEventListener('click', () => {
        items = [];
        updateList();
      });
    }
  }, 0);

  return container;
}
