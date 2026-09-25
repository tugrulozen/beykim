/**
 * DEPO TAKİP - Stok Sayım Sayfası
 * Okutulan her barkod bir adet sayılır; aynı barkod tekrar okutulursa miktar artar.
 * Kaydedilince seçili depodaki sistem stoğuyla karşılaştırılır ve farklar listelenir.
 */

import { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import api from '../core/api.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function StockCountPage() {
  const container = document.createElement('div');
  container.className = 'page-stock-count page-container';

  const header = createHeader({ title: pageTitle('stockCount', 'Stok Sayım'), gradientClass: 'gradient-primary' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = `
    <!-- Summary Card -->
    <div class="count-summary-card animate-fade-in-up">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px;"><i class="ph ph-chart-pie-slice" style="margin-right:5px; color:var(--primary);"></i>Sayım Özeti</div>
      <div class="count-stats">
        <div class="count-stat">
          <div class="count-value" id="sc-total">0</div>
          <div class="count-label">Toplam</div>
        </div>
        <div class="count-stat">
          <div class="count-value" id="sc-ok" style="color: var(--success);">0</div>
          <div class="count-label">Doğru</div>
        </div>
        <div class="count-stat">
          <div class="count-value" id="sc-diff" style="color: var(--error);">0</div>
          <div class="count-label">Farklı</div>
        </div>
      </div>
    </div>

    <!-- Depo Seçimi -->
    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 16px;">
      <div class="input-group">
        <label>Sayım Yapılacak Depo</label>
        <div class="select-field">
          <span class="select-icon"><i class="ph ph-factory"></i></span>
          <select id="sc-warehouse">
            <option value="">Depo Seçin</option>
          </select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>
    </div>

    <!-- Barcode -->
    <div class="barcode-section animate-fade-in-up stagger-2">
      <h3 class="barcode-title">Ürün Barkod / Seri No</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="sc-barcode-input" placeholder="Barkod veya seri no..." />
        </div>
        <button class="camera-btn" id="sc-camera-btn" aria-label="Kamera ile okut"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <!-- Scanned items -->
    <div id="sc-items-list" style="margin-top: 16px;"></div>

    <!-- Result -->
    <div id="sc-result" style="margin-top: 16px;"></div>

    <!-- Actions -->
    <div style="display: flex; gap: 10px; margin-top: 20px;" class="animate-fade-in-up stagger-3">
      <button class="btn btn-block btn-lg" id="sc-clear" style="flex: 0 0 auto; background: var(--bg-input); color: var(--text-primary);" title="Listeyi temizle">
        <i class="ph ph-trash"></i>
      </button>
      <button class="btn btn-primary btn-block btn-lg" id="sc-submit" style="flex: 1;">
        <i class="ph ph-cloud-arrow-up" style="margin-right:5px;"></i>Sayımı Kaydet
      </button>
    </div>
  `;

  container.appendChild(content);

  const counts = new Map(); // barkod -> okutulan adet

  setTimeout(async () => {
    const whSelect = container.querySelector('#sc-warehouse');
    try {
      const whRes = await api.get('/warehouses');
      if (whRes.success) {
        whSelect.innerHTML = '<option value="">Depo Seçin</option>' +
          whRes.data.map((w) => `<option value="${esc(w.id)}">${esc(w.code)} - ${esc(w.name)}</option>`).join('');
      }
    } catch (_e) { /* sessiz */ }

    const addScan = (code) => {
      counts.set(code, (counts.get(code) || 0) + 1);
      showToast(`Okunan: ${code}`, 'success');
      container.querySelector('#sc-result').innerHTML = '';
      updateUI();
    };

    const barcodeInput = container.querySelector('#sc-barcode-input');
    const barcodeWire = wireBarcodeInput(barcodeInput, addScan);

    container.querySelector('#sc-camera-btn')?.addEventListener('click', () => openBarcodeScanner(addScan));

    container.querySelector('#sc-clear')?.addEventListener('click', () => {
      counts.clear();
      container.querySelector('#sc-result').innerHTML = '';
      container.querySelector('#sc-diff').textContent = 0;
      updateUI();
    });

    // Satırdaki + / - / sil
    container.querySelector('#sc-items-list').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-code]');
      if (!btn) return;
      const code = btn.dataset.code;
      if (btn.dataset.act === 'inc') counts.set(code, (counts.get(code) || 0) + 1);
      else if (btn.dataset.act === 'dec') { const n = (counts.get(code) || 0) - 1; n > 0 ? counts.set(code, n) : counts.delete(code); }
      else counts.delete(code);
      updateUI();
    });

    container.querySelector('#sc-submit')?.addEventListener('click', async () => {
      const warehouseId = whSelect.value;
      if (!warehouseId) {
        showToast('Lütfen sayım yapılacak depoyu seçin', 'warning');
        return;
      }
      barcodeWire.flush(); // alanda yazılı kalan barkod da sayılsın
      if (counts.size === 0) {
        showToast('Lütfen en az bir ürün okutun', 'warning');
        return;
      }
      const btn = container.querySelector('#sc-submit');
      btn.disabled = true;
      btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      try {
        const res = await api.post('/stock-count', {
          warehouseId,
          items: [...counts].map(([code, counted]) => ({ code, counted }))
        });
        if (res.success) {
          showToast(res.message, 'success');
          renderResult(res.data);
          counts.clear();
          updateUI();
          container.querySelector('#sc-total').textContent = res.data.total || 0;
          container.querySelector('#sc-ok').textContent = res.data.matched || 0;
          container.querySelector('#sc-diff').textContent = res.data.diff || 0;
        } else {
          showToast(res.message || 'Hata oluştu', 'error');
        }
      } catch (err) {
        showToast('Kayıt hatası: ' + err.message, 'error');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-cloud-arrow-up" style="margin-right:5px;"></i>Sayımı Kaydet';
    });

    function renderResult(data) {
      const rows = data?.details || [];
      if (!rows.length) return;
      container.querySelector('#sc-result').innerHTML = `
        <div class="card animate-fade-in-up" style="padding: 14px;">
          <div style="font-weight: 700; margin-bottom: 8px;"><i class="ph ph-list-checks"></i> Sayım Sonucu</div>
          ${rows.map((r) => `
            <div style="display:flex; justify-content:space-between; gap:10px; padding:8px 0; border-top:1px solid var(--divider); font-size:13px;">
              <div style="min-width:0;">
                <div style="font-weight:600;">${esc(r.name || r.code)}</div>
                <div style="color:var(--text-secondary);">${esc(r.code)}${r.known ? '' : ' · sistemde kayıtlı değil'}</div>
              </div>
              <div style="text-align:right; white-space:nowrap;">
                <div>Sayılan: <b>${r.counted}</b> / Sistem: <b>${r.system}</b></div>
                <div style="font-weight:700; color:${r.diff === 0 ? 'var(--success)' : 'var(--error)'};">${r.diff === 0 ? 'Eşleşti' : (r.diff > 0 ? '+' : '') + r.diff + ' fark'}</div>
              </div>
            </div>`).join('')}
        </div>`;
    }

    function updateUI() {
      const total = [...counts.values()].reduce((a, b) => a + b, 0);
      container.querySelector('#sc-total').textContent = total;
      container.querySelector('#sc-ok').textContent = counts.size;

      const list = container.querySelector('#sc-items-list');
      list.innerHTML = [...counts].map(([code, n], i) => `
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${i * 40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: var(--color-stock-light); color: var(--color-stock);"><i class="ph ph-clipboard-text"></i></div>
          <div class="list-content">
            <div class="list-title">${esc(code)}</div>
            <div class="list-subtitle">Sayılan adet: ${n}</div>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button data-act="dec" data-code="${esc(code)}" aria-label="Azalt" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-minus"></i></button>
            <button data-act="inc" data-code="${esc(code)}" aria-label="Arttır" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-plus"></i></button>
            <button data-act="del" data-code="${esc(code)}" aria-label="Sil" style="width:28px;height:28px;border-radius:6px;background:var(--error-light);color:var(--error);cursor:pointer;"><i class="ph ph-x"></i></button>
          </div>
        </div>
      `).join('');
    }
  }, 0);

  return container;
}
