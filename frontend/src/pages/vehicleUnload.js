/**
 * DEPO TAKİP - Araba'dan Boşaltma Sayfası
 */

import { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import api from '../core/api.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';
import { esc } from '../components/shell.js';

export default function VehicleUnloadPage() {
  const container = document.createElement('div');
  container.className = 'page-vehicle-unload page-container';

  const header = createHeader({ title: pageTitle('vehicleUnload', "Araba'dan Boşaltma"), gradientClass: 'gradient-serial' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <div class="scan-summary animate-fade-in-up">
      <div class="scan-count">
        <span class="n" id="vu-barcode-count">0</span>
        <span class="l">okutulan barkod</span>
      </div>
      <div class="scan-last">
        <small>Araç / irsaliye</small>
        <b id="vu-vehicle-label">—</b>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 16px;">
      <div class="transfer-section-title"><i class="ph ph-truck"></i> Boşaltma Bilgileri</div>

      <div class="input-group" style="margin-top: 12px;">
        <label>Hangi depoya boşaltılıyor</label>
        <div class="select-field">
          <span class="select-icon"><i class="ph ph-warehouse"></i></span>
          <select id="vu-warehouse"><option value="">Depo Seçin</option></select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 12px;">
        <label>Araç plakası / irsaliye no</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-identification-card"></i></span>
          <input type="text" id="vu-vehicle-info" placeholder="Örn. 16 ABC 123 veya İRS-2026-0042" autocomplete="off" />
        </div>
      </div>
    </div>

    <div class="barcode-section animate-fade-in-up stagger-2">
      <h3 class="barcode-title"><i class="ph ph-barcode"></i> Barkod Okutma</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="vu-barcode-input" placeholder="Barkodu okutun veya yazıp Enter'a basın" autocomplete="off" />
        </div>
        <button class="camera-btn" id="vu-camera-btn" title="Kamera ile oku"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <div id="vu-scanned-list" class="scan-list animate-fade-in-up stagger-3"></div>

    <button class="btn btn-primary btn-block btn-lg animate-fade-in-up stagger-4" id="vu-submit" style="margin-top: 20px;">
      <i class="ph ph-cloud-arrow-up"></i> Depoya Kaydet
    </button>
  `;

  container.appendChild(content);

  let barcodes = [];

  setTimeout(async () => {
    const vehicleInput = container.querySelector('#vu-vehicle-info');
    const vehicleLabel = container.querySelector('#vu-vehicle-label');
    vehicleInput.addEventListener('input', () => { vehicleLabel.textContent = vehicleInput.value.trim() || '—'; });
    try {
      const whRes = await api.get('/warehouses');
      if (whRes.success) {
        const whSelect = container.querySelector('#vu-warehouse');
        whRes.data.forEach(w => {
          const opt = document.createElement('option');
          opt.value = w.id;
          opt.textContent = `${w.code} - ${w.name}`;
          whSelect.appendChild(opt);
        });
      }
    } catch (_e) { /* silent */ }

    const barcodeInput = container.querySelector('#vu-barcode-input');
    wireBarcodeInput(barcodeInput, (code) => {
      barcodes.push(code);
      showToast(`Barkod eklendi: ${code}`, 'success');
      updateUI();
    });

    container.querySelector('#vu-camera-btn')?.addEventListener('click', () => {
      openBarcodeScanner((code) => {
        barcodes.push(code);
        showToast(`Barkod eklendi: ${code}`, 'success');
        updateUI();
      });
    });

    container.querySelector('#vu-submit')?.addEventListener('click', async () => {
      if (barcodes.length === 0) {
        showToast('Lütfen en az bir barkod okutun', 'warning');
        return;
      }
      if (!container.querySelector('#vu-warehouse')?.value) {
        showToast('Lütfen depoyu seçin', 'warning');
        return;
      }
      const btn = container.querySelector('#vu-submit');
      btn.disabled = true;
      btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';
      
      try {
        const res = await api.post('/vehicle-unload', {
          warehouseId: container.querySelector('#vu-warehouse')?.value,
          vehicleInfo: container.querySelector('#vu-vehicle-info')?.value,
          barcodes
        });
        if (res.success) {
          showToast(res.message, 'success');
          barcodes = [];
          updateUI();
        } else {
          showToast(res.message || 'Hata oluştu', 'error');
        }
      } catch (err) {
        showToast('Gönderim hatası: ' + err.message, 'error');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-cloud-arrow-up"></i> Depoya Kaydet';
    });

    container.querySelector('#vu-scanned-list').addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-code]');
      if (rm) { barcodes = barcodes.filter((b) => b !== rm.dataset.code); updateUI(); return; }
      if (e.target.closest('#vu-clear-scans')) {
        const { confirmDialog } = await import('../components/dialog.js');
        if (!(await confirmDialog({ title: 'Liste temizlensin mi?', message: `${barcodes.length} okutulmuş barkod silinecek.`, confirmLabel: 'Temizle', danger: true }))) return;
        barcodes = [];
        updateUI();
      }
    });
    updateUI();

    function updateUI() {
      container.querySelector('#vu-barcode-count').textContent = barcodes.length;
      const list = container.querySelector('#vu-scanned-list');
      list.innerHTML = barcodes.length
        ? `<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="vu-clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>` +
          barcodes.map((b, i) => `
            <div class="scan-item">
              <span class="scan-no">${i + 1}</span>
              <span class="scan-code">${esc(b)}</span>
              <button type="button" class="scan-rm" data-code="${esc(b)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join('')
        : '<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>';
    }
  }, 0);

  return container;
}
