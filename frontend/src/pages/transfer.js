/**
 * DEPO TAKİP - Depolar Arası Transfer Sayfası
 */

import { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import api from '../core/api.js';
import Auth from '../core/auth.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';
import { esc } from '../components/shell.js';

export default function TransferPage() {
  const container = document.createElement('div');
  container.className = 'page-transfer page-container';
  const user = Auth.getUser();

  const header = createHeader({ title: pageTitle('transfer', 'Depolar Arası Transfer'), gradientClass: 'gradient-transfer' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <!-- Özet: okutulan barkod ve son okunan -->
    <div class="scan-summary animate-fade-in-up">
      <div class="scan-count">
        <span class="n" id="barcode-count">0</span>
        <span class="l">okutulan barkod</span>
      </div>
      <div class="scan-last">
        <small>Son okunan</small>
        <b id="last-barcode">—</b>
      </div>
    </div>

    <div class="transfer-form">
      <!-- Transfer yönü -->
      <div class="card animate-fade-in-up stagger-1">
        <div class="transfer-section-title"><i class="ph ph-arrows-left-right"></i> Transfer Yönü</div>

        <div class="route-row">
          <div class="input-group">
            <label>Nereden (kaynak depo)</label>
            <div class="select-field">
              <span class="select-icon"><i class="ph ph-warehouse"></i></span>
              <select id="source-warehouse"><option value="">Depo Seçin</option></select>
              <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
            </div>
          </div>

          <span class="route-arrow" aria-hidden="true"><i class="ph ph-arrow-right"></i></span>

          <div class="input-group">
            <label>Nereye (hedef şube)</label>
            <div class="select-field">
              <span class="select-icon"><i class="ph ph-buildings"></i></span>
              <select id="target-branch"><option value="">Şube Seçin</option></select>
              <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
            </div>
          </div>
        </div>

        <div class="input-group" style="margin-top: 12px;">
          <label>Hedef depo</label>
          <div class="select-field">
            <span class="select-icon"><i class="ph ph-warehouse"></i></span>
            <select id="target-warehouse"><option value="">Depo Seçin</option></select>
            <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
          </div>
        </div>
      </div>

      <!-- Barkod -->
      <div class="barcode-section animate-fade-in-up stagger-2">
        <h3 class="barcode-title"><i class="ph ph-barcode"></i> Barkod Okutma</h3>
        <div class="barcode-input-row">
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-barcode"></i></span>
            <input type="text" id="barcode-input" placeholder="Barkodu okutun veya yazıp Enter'a basın" autocomplete="off" />
          </div>
          <button class="camera-btn" id="camera-btn" title="Kamera ile oku"><i class="ph ph-camera"></i></button>
        </div>

        <label class="scan-toggle" for="cancel-barcode">
          <input type="checkbox" id="cancel-barcode" />
          <span><b>İptal modu</b><small>Okutulan barkod listeden çıkarılır</small></span>
        </label>
      </div>

      <!-- Okutulanlar -->
      <div id="scanned-list" class="scan-list animate-fade-in-up stagger-3"></div>

      <button class="btn btn-primary btn-block btn-lg animate-fade-in-up stagger-4" id="submit-transfer">
        <i class="ph ph-cloud-arrow-up"></i> Transferi Gönder
      </button>
    </div>
  `;

  container.appendChild(content);

  // State
  let barcodes = [];
  let barcodeCount = 0;

  // Event listeners
  setTimeout(async () => {
    // Şubeleri yükle
    try {
      const branchRes = await api.get('/branches');
      if (branchRes.success) {
        const branchSelect = container.querySelector('#target-branch');
        branchRes.data.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.textContent = `${b.code} - ${b.name}`;
          branchSelect.appendChild(opt);
        });
      }

      const whRes = await api.get('/warehouses');
      if (whRes.success) {
        const targetWh = container.querySelector('#target-warehouse');
        const sourceWh = container.querySelector('#source-warehouse');
        // Hedef depo seçilince şube otomatik gelir
        targetWh.addEventListener('change', () => {
          const wh = whRes.data.find(w => w.id === targetWh.value);
          const bs = container.querySelector('#target-branch');
          if (wh?.branchId && bs) bs.value = wh.branchId;
        });
        whRes.data.forEach(w => {
          const opt1 = document.createElement('option');
          opt1.value = w.id;
          opt1.textContent = `${w.code} - ${w.name}`;
          targetWh.appendChild(opt1);

          const opt2 = document.createElement('option');
          opt2.value = w.id;
          opt2.textContent = `${w.code} - ${w.name}`;
          sourceWh.appendChild(opt2);
        });
      }
    } catch (_e) { /* silent */ }

    // Barkod input
    const barcodeInput = container.querySelector('#barcode-input');
    if (barcodeInput) {
      wireBarcodeInput(barcodeInput, addBarcode);
    }

    // Kamera
    container.querySelector('#camera-btn')?.addEventListener('click', () => {
      openBarcodeScanner((code) => {
        addBarcode(code);
      });
    });

    // Gönder
    container.querySelector('#submit-transfer')?.addEventListener('click', async () => {
      if (barcodes.length === 0) {
        showToast('Lütfen en az bir barkod okutun', 'warning');
        return;
      }
      const srcWh = container.querySelector('#source-warehouse')?.value;
      const dstWh = container.querySelector('#target-warehouse')?.value;
      if (!srcWh || !dstWh) {
        showToast('Lütfen kaynak ve hedef depoyu seçin', 'warning');
        return;
      }
      if (srcWh === dstWh) {
        showToast('Kaynak ve hedef depo aynı olamaz', 'warning');
        return;
      }

      const btn = container.querySelector('#submit-transfer');
      btn.disabled = true;
      btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';

      try {
        const res = await api.post('/transfers', {
          targetBranch: container.querySelector('#target-branch')?.value,
          targetWarehouse: container.querySelector('#target-warehouse')?.value,
          sourceWarehouse: container.querySelector('#source-warehouse')?.value,
          barcodes,
        });

        if (res.success) {
          showToast(res.message || 'Transfer tamamlandı!', 'success');
          barcodes = [];
          barcodeCount = 0;
          updateStats();
        } else {
          showToast(res.message || 'Hata oluştu', 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }

      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-cloud-arrow-up"></i> Transferi Gönder';
    });

    function addBarcode(code) {
      const isCancel = container.querySelector('#cancel-barcode')?.checked;
      if (isCancel) {
        barcodes = barcodes.filter(b => b !== code);
        showToast(`Barkod iptal edildi: ${code}`, 'warning');
      } else {
        barcodes.push(code);
        showToast(`Barkod eklendi: ${code}`, 'success');
      }
      barcodeCount = barcodes.length;
      updateStats();
      container.querySelector('#last-barcode').textContent = code;
    }

    function updateStats() {
      container.querySelector('#barcode-count').textContent = barcodeCount;
      const list = container.querySelector('#scanned-list');
      list.innerHTML = barcodes.length
        ? `<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>` +
          barcodes.map((b, i) => `
            <div class="scan-item">
              <span class="scan-no">${i + 1}</span>
              <span class="scan-code">${esc(b)}</span>
              <button type="button" class="scan-rm" data-code="${esc(b)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join('')
        : '<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>';
    }

    // Listeden tek tek çıkarma / tümünü temizleme
    container.querySelector('#scanned-list').addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-code]');
      if (rm) {
        barcodes = barcodes.filter((b) => b !== rm.dataset.code);
        barcodeCount = barcodes.length;
        updateStats();
        return;
      }
      if (e.target.closest('#clear-scans')) {
        const { confirmDialog } = await import('../components/dialog.js');
        if (!(await confirmDialog({ title: 'Liste temizlensin mi?', message: `${barcodes.length} okutulmuş barkod silinecek.`, confirmLabel: 'Temizle', danger: true }))) return;
        barcodes = [];
        barcodeCount = 0;
        updateStats();
        container.querySelector('#last-barcode').textContent = '—';
      }
    });

    updateStats();
  }, 0);

  return container;
}
