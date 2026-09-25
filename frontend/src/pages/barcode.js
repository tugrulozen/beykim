/**
 * DEPO TAKİP - Barkod Oluştur
 * Ürün + barkod birlikte açılır (ürün endekslenir), farklı boyut/türde etiket üretilir ve yazıcıya gönderilir.
 * Sekmeler: Oluştur · Kayıtlar (barkod dizini, tekrar yazdır) · Yazıcı (bağlantı ve komut dili)
 */
import AppConfig from '../core/config.js';
import api from '../core/api.js';
import router from '../core/router.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { promptDialog } from '../components/dialog.js';
import { esc } from '../components/shell.js';
import { exportTable, exportButton } from '../core/exportTable.js';
import { FORMATS, validate } from '../core/barcode/encoders.js';
import { SIZES, sizeById, layoutLabel, toSvg } from '../core/barcode/label.js';
import { loadPrinterSettings, savePrinterSettings, printLabels, serialSupported, serialForget, agentHealth, agentPrinters, downloadRaw } from '../core/barcode/printers.js';

const CATEGORIES = ['Genel', 'Pastacılık Katkı', 'Şurup', 'Aroma', 'Ezme', 'Jöle & Jel', 'Çikolata', 'Ambalaj'];
const UNITS = ['Adet', 'Kutu', 'Koli', 'Paket', 'Kg', 'Litre', 'Metre', 'Çift'];
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };

export default function BarcodePage() {
  const container = document.createElement('div');
  container.className = 'page-barcode page-container';
  container.appendChild(createHeader({ title: AppConfig.modules.barcode?.label || 'Barkod Oluştur', gradientClass: 'gradient-stock' }));
  const content = document.createElement('div');
  content.className = 'content-area';
  container.appendChild(content);

  const cfg = AppConfig.barcode || {};
  const uiKey = `${AppConfig.storageKeys.settings}_barcode_ui`;
  const printerKey = `${AppConfig.storageKeys.settings}_printer`;
  let ui = { format: cfg.defaultFormat || 'ean13', size: cfg.defaultSize || '50x30', cw: 50, ch: 30, show: { name: true, price: true, code: true, company: !!cfg.showCompany, text: true }, copies: 1 };
  try { ui = { ...ui, ...JSON.parse(localStorage.getItem(uiKey) || '{}') }; } catch (_e) { /* boş */ }
  const saveUi = () => { try { localStorage.setItem(uiKey, JSON.stringify(ui)); } catch (_e) { /* özel pencere */ } };
  let printer = loadPrinterSettings(printerKey, cfg.printer || {});

  let tab = router.getQueryParams().tab || 'create';
  let products = []; let warehouses = []; let records = [];

  content.innerHTML = `
    <div class="seg-tabs" role="tablist">
      <button type="button" class="seg-tab" data-tab="create"><i class="ph ph-barcode"></i> Oluştur</button>
      <button type="button" class="seg-tab" data-tab="records"><i class="ph ph-list-magnifying-glass"></i> Kayıtlar</button>
      <button type="button" class="seg-tab" data-tab="printer"><i class="ph ph-printer"></i> Yazıcı</button>
    </div>
    <div id="bc-view"></div>`;
  const view = content.querySelector('#bc-view');

  function showTab(next) {
    tab = next;
    view.onclick = null; view.onchange = null; // sekme değişince eski olay dinleyicileri kalmasın
    content.querySelectorAll('.seg-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'create') renderCreate(); else if (tab === 'records') renderRecords(); else renderPrinter();
  }
  content.querySelector('.seg-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });

  async function loadBase() {
    try {
      const [p, w] = await Promise.all([api.getProducts(), api.getWarehouses()]);
      products = p.success ? p.data : []; warehouses = w.success ? w.data : [];
    } catch (_e) { /* çevrimdışı: form yine de açılır */ }
  }

  // =====================================================================
  // OLUŞTUR
  // =====================================================================
  function renderCreate() {
    const cats = [...new Set([...CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])];
    const st = { mode: 'new', productId: '', auto: true, autoValue: '', manual: '', name: '', category: 'Genel', unit: 'Adet', price: '', qty: '', warehouseId: '', startCell: 0 };

    view.innerHTML = `
    <div class="bc-grid">
      <div class="bc-col">
        <div class="card bc-card bc-preview bc-sticky">
          <div class="sx-step"><i class="ph ph-eye"></i> Önizleme <span class="bc-dim" id="bc-dim"></span></div>
          <div class="bc-canvas" id="bc-canvas"></div>
          <div class="bc-warn" id="bc-warn" hidden></div>
        </div>
        <div class="card bc-card">
          <div class="bc-mode">
            <button type="button" class="sx-chip on" data-mode="new">Yeni ürün</button>
            <button type="button" class="sx-chip" data-mode="existing">Mevcut ürün için etiket</button>
          </div>

          <div id="bc-new">
            <div class="sx-field"><label>Ürün adı <span class="sx-req">*</span></label>
              <div class="input-field"><span class="input-icon"><i class="ph ph-package"></i></span><input id="bc-name" type="text" maxlength="120" placeholder="Örn: Çikolata Sosu 5kg" autocomplete="off" /></div></div>
            <div class="sx-grid">
              <div class="sx-field"><label>Kategori</label><div class="input-field"><span class="input-icon"><i class="ph ph-tag"></i></span>
                <select id="bc-cat" class="input-element">${cats.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div></div>
              <div class="sx-field"><label>Birim</label><div class="input-field"><span class="input-icon"><i class="ph ph-scales"></i></span>
                <select id="bc-unit" class="input-element">${UNITS.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div></div>
              <div class="sx-field"><label>Birim fiyat (₺)</label><div class="input-field"><span class="input-icon"><i class="ph ph-currency-circle-dollar"></i></span>
                <input id="bc-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00" /></div></div>
              <div class="sx-field"><label>Başlangıç stoğu <span class="sx-opt">(isteğe bağlı)</span></label><div class="input-field"><span class="input-icon"><i class="ph ph-hash"></i></span>
                <input id="bc-qty" type="number" min="0" step="1" inputmode="numeric" placeholder="0" /></div></div>
            </div>
            <div class="sx-field" id="bc-wh-wrap" hidden><label>Stoğun gireceği depo</label><div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="bc-wh" class="input-element"><option value="">Seçiniz...</option>${warehouses.map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}</select></div></div>
          </div>

          <div id="bc-existing" hidden>
            <div class="sx-field"><label>Ürün ara</label><div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
              <input id="bc-psearch" type="search" placeholder="Ad, kod veya barkod..." autocomplete="off" /></div></div>
            <div class="sx-field"><label>Ürün</label><div class="input-field"><span class="input-icon"><i class="ph ph-package"></i></span>
              <select id="bc-product" class="input-element"></select></div></div>
          </div>
        </div>

        <div class="card bc-card">
          <div class="sx-step"><i class="ph ph-barcode"></i> Barkod</div>
          <div class="sx-chips" id="bc-formats">${Object.entries(FORMATS).map(([k, f]) => `<button type="button" class="sx-chip ${k === ui.format ? 'on' : ''}" data-f="${k}">${f.label}</button>`).join('')}</div>
          <div class="bc-hint" id="bc-fhint"></div>
          <label class="bc-switch"><input type="checkbox" id="bc-auto" checked /> <span>Barkodu otomatik ver</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span><input id="bc-value" type="text" maxlength="300" autocomplete="off" /></div>
          <div class="bc-err" id="bc-verr" hidden></div>
        </div>

        <div class="card bc-card">
          <div class="sx-step"><i class="ph ph-ruler"></i> Etiket</div>
          <div class="sx-field"><label>Boyut</label><div class="input-field"><span class="input-icon"><i class="ph ph-frame-corners"></i></span>
            <select id="bc-size" class="input-element">
              <optgroup label="Rulo etiket (termal yazıcı)">${SIZES.filter((s) => s.kind === 'roll').map((s) => `<option value="${s.id}">${esc(s.label)} — ${esc(s.note)}</option>`).join('')}</optgroup>
              <optgroup label="A4 etiket yaprağı (lazer/inkjet)">${SIZES.filter((s) => s.kind === 'sheet').map((s) => `<option value="${s.id}">${esc(s.label)} — ${esc(s.note)}</option>`).join('')}</optgroup>
              <option value="custom">Özel ölçü…</option>
            </select></div></div>
          <div class="sx-grid" id="bc-custom" hidden>
            <div class="sx-field"><label>Genişlik (mm)</label><div class="input-field"><input id="bc-cw" type="number" min="10" max="200" step="0.5" /></div></div>
            <div class="sx-field"><label>Yükseklik (mm)</label><div class="input-field"><input id="bc-ch" type="number" min="8" max="300" step="0.5" /></div></div>
          </div>
          <div class="bc-toggles">
            ${[['name', 'Ürün adı'], ['price', 'Fiyat'], ['code', 'Ürün kodu'], ['company', 'Firma adı'], ['text', 'Barkod altı yazı']].map(([k, l]) => `<label class="bc-switch"><input type="checkbox" data-show="${k}" ${ui.show[k] ? 'checked' : ''} /> <span>${l}</span></label>`).join('')}
          </div>
          <div class="sx-grid">
            <div class="sx-field"><label>Etiket adedi</label><div class="input-field"><span class="input-icon"><i class="ph ph-copy"></i></span><input id="bc-copies" type="number" min="1" max="10000" step="1" inputmode="numeric" /></div></div>
            <div class="sx-field" id="bc-start-wrap" hidden><label>Yaprakta başlangıç hücresi</label><div class="input-field"><span class="input-icon"><i class="ph ph-grid-four"></i></span><input id="bc-start" type="number" min="1" step="1" value="1" /></div></div>
          </div>
        </div>
        <div class="bc-actions">
          <button type="button" class="btn btn-block btn-lg sx-submit" id="bc-save-print" style="--sx:var(--primary)"><i class="ph ph-printer"></i> Ürünü kaydet ve yazdır</button>
          <div class="bc-actions-row">
            <button type="button" class="btn btn-secondary" id="bc-save"><i class="ph ph-floppy-disk"></i> Yalnızca kaydet</button>
            <button type="button" class="btn btn-secondary" id="bc-svg"><i class="ph ph-download-simple"></i> SVG indir</button>
          </div>
          <div class="bc-hint" id="bc-printer-hint"></div>
        </div>
      </div>

    </div>`;

    const $ = (s) => view.querySelector(s);
    $('#bc-size').value = ui.size; $('#bc-cw').value = ui.cw; $('#bc-ch').value = ui.ch; $('#bc-copies').value = ui.copies;

    let lastLayout = null;

    const finalValue = () => {
      if (st.mode === 'existing') {
        const p = products.find((x) => x.id === st.productId);
        return p ? (p.barcode || (st.auto ? st.autoValue : st.manual)) : '';
      }
      return st.auto ? st.autoValue : st.manual;
    };

    async function refreshAuto() {
      if (!st.auto) return;
      try {
        const r = await api.get(`/barcodes/next?format=${ui.format}&prefix=${encodeURIComponent(cfg.prefix || '2')}`);
        if (r.success) { st.autoValue = r.data.barcode; }
      } catch (_e) { /* çevrimdışı: önizleme örnek değerle */ }
      syncValueInput(); draw();
    }

    function syncValueInput() {
      const inp = $('#bc-value');
      const p = st.mode === 'existing' ? products.find((x) => x.id === st.productId) : null;
      const locked = !!(p && p.barcode);
      $('#bc-auto').disabled = locked;
      $('.bc-switch:has(#bc-auto)').classList.toggle('dis', locked);
      inp.readOnly = locked || st.auto;
      inp.value = locked ? p.barcode : st.auto ? st.autoValue : st.manual;
      inp.placeholder = st.auto ? 'Otomatik' : (FORMATS[ui.format].hint);
      $('#bc-fhint').textContent = locked ? `Bu ürünün mevcut barkodu kullanılır (${p.barcode}).` : FORMATS[ui.format].hint;
    }

    function sample() {
      return { ean13: '2000000000015', ean8: '2000001', code128: 'P00000001', code39: 'P00000001', qr: 'P00000001' }[ui.format];
    }

    function currentSize() { return sizeById(ui.size, { w: ui.cw, h: ui.ch }); }

    function specFor(valueOverride) {
      const size = currentSize();
      const p = st.mode === 'existing' ? products.find((x) => x.id === st.productId) : null;
      const raw = valueOverride || finalValue() || sample();
      const v = validate(ui.format, raw);
      return {
        size, valid: v, spec: {
          wMm: size.w, hMm: size.h, format: ui.format, value: v.ok ? v.value : sample(),
          name: p ? p.name : (st.name || 'Ürün adı'), price: p ? p.price : (st.price === '' ? null : Number(st.price)), currency: '₺',
          code: p ? p.code : '', company: AppConfig.companyName, show: ui.show,
        },
      };
    }

    function draw() {
      const { size, valid, spec } = specFor();
      const err = $('#bc-verr');
      const hasVal = !!finalValue();
      err.hidden = !(hasVal && !valid.ok); err.textContent = valid.ok ? '' : valid.error;
      try {
        lastLayout = layoutLabel(spec);
        $('#bc-canvas').innerHTML = toSvg(lastLayout, { border: true });
        const svg = $('#bc-canvas svg');
        const maxW = Math.min(420, $('#bc-canvas').clientWidth || 380);
        const scale = Math.min(maxW / size.w, 170 / size.h);
        svg.style.width = `${size.w * scale}px`; svg.style.height = `${size.h * scale}px`;
        const warn = $('#bc-warn');
        warn.hidden = !lastLayout.warnings.length; warn.innerHTML = lastLayout.warnings.map((w) => `<i class="ph ph-warning"></i> ${esc(w)}`).join('<br>');
      } catch (e) {
        lastLayout = null; $('#bc-canvas').innerHTML = `<div class="bc-dim">${esc(e.message)}</div>`;
      }
      $('#bc-dim').textContent = size.kind === 'sheet' ? `${size.w} × ${size.h} mm (yaprakta ${size.cols * size.rows} etiket)` : `${size.w} × ${size.h} mm`;
      $('#bc-start-wrap').hidden = size.kind !== 'sheet';
      $('#bc-custom').hidden = ui.size !== 'custom';
      const raw = printer.mode !== 'browser' && size.kind === 'roll';
      $('#bc-printer-hint').innerHTML = `<i class="ph ph-printer"></i> ${raw ? `${printer.language.toUpperCase()} · ${printer.dpi} dpi · ${{ serial: 'Seri port', agent: 'Yerel ajan' }[printer.mode]}` : 'Tarayıcı / sürücü ile yazdırma'} <a href="#" data-goto="printer">değiştir</a>`;
    }

    function setMode(m) {
      st.mode = m;
      view.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
      $('#bc-new').hidden = m !== 'new'; $('#bc-existing').hidden = m !== 'existing';
      $('#bc-save-print').innerHTML = m === 'new' ? '<i class="ph ph-printer"></i> Ürünü kaydet ve yazdır' : '<i class="ph ph-printer"></i> Etiketi yazdır';
      if (m === 'existing') fillProducts();
      syncValueInput(); draw();
    }

    function fillProducts() {
      const q = ($('#bc-psearch').value || '').toLocaleLowerCase('tr').trim();
      const list = products.filter((p) => !q || [p.name, p.code, p.barcode].some((v) => String(v || '').toLocaleLowerCase('tr').includes(q))).slice(0, 200);
      const sel = $('#bc-product');
      sel.innerHTML = `<option value="">${list.length ? 'Ürün seçin...' : 'Ürün bulunamadı'}</option>` + list.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}${p.barcode ? ' — ' + esc(p.barcode) : ' — barkodsuz'}</option>`).join('');
      if (list.some((p) => p.id === st.productId)) sel.value = st.productId; else st.productId = '';
    }

    // ---- olaylar ----
    view.onclick = (e) => {
      const go = e.target.closest('[data-goto]'); if (go) { e.preventDefault(); return showTab(go.dataset.goto); }
      const m = e.target.closest('[data-mode]'); if (m) return setMode(m.dataset.mode);
      const f = e.target.closest('[data-f]');
      if (f) {
        ui.format = f.dataset.f; saveUi();
        view.querySelectorAll('[data-f]').forEach((b) => b.classList.toggle('on', b === f));
        st.autoValue = ''; syncValueInput(); draw(); refreshAuto();
      }
    };
    $('#bc-name').addEventListener('input', (e) => { st.name = e.target.value; draw(); });
    $('#bc-cat').addEventListener('change', (e) => { st.category = e.target.value; });
    $('#bc-unit').addEventListener('change', (e) => { st.unit = e.target.value; });
    $('#bc-price').addEventListener('input', (e) => { st.price = e.target.value; draw(); });
    $('#bc-qty').addEventListener('input', (e) => { st.qty = e.target.value; $('#bc-wh-wrap').hidden = !(Number(st.qty) > 0); });
    $('#bc-wh').addEventListener('change', (e) => { st.warehouseId = e.target.value; });
    $('#bc-psearch').addEventListener('input', fillProducts);
    $('#bc-product').addEventListener('change', (e) => { st.productId = e.target.value; syncValueInput(); draw(); });
    $('#bc-auto').addEventListener('change', (e) => { st.auto = e.target.checked; if (st.auto) refreshAuto(); syncValueInput(); draw(); });
    $('#bc-value').addEventListener('input', (e) => { if (!st.auto) { st.manual = e.target.value; draw(); } });
    $('#bc-size').addEventListener('change', (e) => { ui.size = e.target.value; saveUi(); draw(); });
    $('#bc-cw').addEventListener('input', (e) => { ui.cw = Number(e.target.value) || 50; saveUi(); draw(); });
    $('#bc-ch').addEventListener('input', (e) => { ui.ch = Number(e.target.value) || 30; saveUi(); draw(); });
    $('#bc-copies').addEventListener('input', (e) => { ui.copies = Math.max(1, Math.min(10000, Math.floor(Number(e.target.value) || 1))); saveUi(); });
    $('#bc-start').addEventListener('input', (e) => { st.startCell = Math.max(0, (Math.floor(Number(e.target.value)) || 1) - 1); });
    view.querySelectorAll('[data-show]').forEach((c) => c.addEventListener('change', () => { ui.show[c.dataset.show] = c.checked; saveUi(); draw(); }));

    $('#bc-svg').addEventListener('click', () => {
      if (!lastLayout) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([toSvg(lastLayout)], { type: 'image/svg+xml' }));
      a.download = `barkod_${finalValue() || sample()}.svg`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    });

    async function save(andPrint, btn) {
      const size = currentSize();
      const chk = specFor();
      if (st.mode === 'new' && !st.name.trim()) return showToast('Ürün adını girin', 'warning');
      if (st.mode === 'existing' && !st.productId) return showToast('Ürünü seçin', 'warning');
      const manualVal = !st.auto && st.mode === 'new' ? st.manual : (st.mode === 'existing' && !products.find((x) => x.id === st.productId)?.barcode && !st.auto ? st.manual : '');
      if (manualVal) { const v = validate(ui.format, manualVal); if (!v.ok) return showToast(v.error, 'warning'); }
      if (!st.auto && !manualVal && st.mode === 'new') return showToast('Barkod değerini girin ya da “otomatik” seçin', 'warning');
      if (st.mode === 'new' && Number(st.qty) > 0 && !st.warehouseId) return showToast('Başlangıç stoğu için depo seçin', 'warning');

      const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';
      try {
        const body = {
          mode: st.mode, productId: st.productId, name: st.name, category: st.category, unit: st.unit, price: st.price, quantity: st.qty, warehouseId: st.warehouseId,
          barcode: manualVal || undefined, autoPrefix: cfg.prefix || '2', format: ui.format, sizeId: size.id, widthMm: size.w, heightMm: size.h,
        };
        const res = await api.post('/barcodes', body);
        if (!res.success) throw new Error(res.message || 'Kaydedilemedi');
        const { barcode, product, labelId } = res.data;
        showToast(`Ürün endekslendi: ${product.name} · ${barcode}`, 'success');
        if (andPrint) {
          const layout = layoutLabel({ ...chk.spec, value: barcode, name: product.name, price: product.price, code: product.code }, printer.mode !== 'browser' && size.kind === 'roll' ? { dpi: printer.dpi } : {});
          try {
            await printLabels([{ layout, copies: ui.copies }], size, printer, { startCell: st.startCell });
            api.post(`/barcodes/${labelId}/print`, { copies: ui.copies }).catch(() => {});
            showToast(`${ui.copies} etiket yazıcıya gönderildi`, 'success');
          } catch (e) { showToast(`Ürün kaydedildi ama yazdırılamadı: ${e.message}`, 'error', 6000); }
        }
        await loadBase();
        renderCreate();
      } catch (e) { showToast(e.message, 'error'); btn.disabled = false; btn.innerHTML = label; }
    }
    $('#bc-save-print').addEventListener('click', (e) => save(true, e.currentTarget));
    $('#bc-save').addEventListener('click', (e) => save(false, e.currentTarget));

    setMode('new');
    syncValueInput(); draw(); refreshAuto();
  }

  // =====================================================================
  // KAYITLAR
  // =====================================================================
  async function renderRecords() {
    view.innerHTML = `
      <div class="card bc-card">
        <div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="bcr-q" type="search" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" /></div>
      </div>
      <div class="list-toolbar"><span id="bcr-count"></span>${exportButton('bcr-export')}</div>
      <div id="bcr-list"><div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div></div>`;
    const $ = (s) => view.querySelector(s);
    let q = '';
    async function load() {
      try {
        const res = await api.get('/barcodes' + (q ? `?q=${encodeURIComponent(q)}` : ''));
        if (!res.success) throw new Error(res.message);
        records = res.data;
      } catch (e) { $('#bcr-list').innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${esc(e.message)}</div></div>`; return; }
      $('#bcr-count').textContent = `${records.length} barkod`;
      $('#bcr-list').innerHTML = records.length ? records.map((r) => `
        <div class="bcr-item">
          <div class="bcr-main">
            <div class="bcr-name">${esc(r.name || '(silinmiş ürün)')}</div>
            <div class="bcr-code">${esc(r.barcode)}</div>
            <div class="bcr-meta"><span class="act-ref">${esc(FORMATS[r.format]?.label || r.format)}</span> <span class="act-ref">${esc(r.widthMm)}×${esc(r.heightMm)} mm</span>
              <span>${esc(r.createdBy || '')} · ${esc(fmtDate(r.createdAt))}</span></div>
            <div class="bcr-meta"><i class="ph ph-printer"></i> ${r.printCount ? `${r.printCount} etiket yazdırıldı${r.lastPrintedAt ? ' · son: ' + esc(fmtDate(r.lastPrintedAt)) : ''}` : 'Henüz yazdırılmadı'}</div>
          </div>
          <button type="button" class="btn btn-secondary" data-print="${r.id}"><i class="ph ph-printer"></i> Yazdır</button>
        </div>`).join('') : '<div class="empty-state"><div class="empty-icon"><i class="ph ph-barcode"></i></div><div class="empty-text">Henüz barkod oluşturulmadı</div></div>';
    }
    let t;
    $('#bcr-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim(); load(); }, 250); });
    $('#bcr-export').addEventListener('click', () => exportTable('Barkod kayitlari', [['Barkod', 'barcode'], ['Ürün', 'name'], ['Ürün kodu', 'code'], ['Tür', (r) => FORMATS[r.format]?.label || r.format], ['Ölçü (mm)', (r) => `${r.widthMm}×${r.heightMm}`], ['Oluşturan', 'createdBy'], ['Tarih', (r) => fmtDate(r.createdAt)], ['Yazdırılan adet', (r) => r.printCount || 0]], records));
    $('#bcr-list').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-print]'); if (!b) return;
      const r = records.find((x) => String(x.id) === b.dataset.print); if (!r) return;
      const ans = await promptDialog({ title: 'Kaç etiket yazdırılsın?', label: `${r.name || r.barcode} · ${r.widthMm}×${r.heightMm} mm`, value: '1', required: true, confirmLabel: 'Yazdır', maxlength: 5 });
      if (ans == null) return;
      const copies = Math.max(1, Math.min(10000, Math.floor(Number(ans)) || 1));
      const size = SIZES.find((s) => s.id === r.sizeId) || sizeById('custom', { w: r.widthMm, h: r.heightMm });
      try {
        const layout = layoutLabel({ wMm: size.w, hMm: size.h, format: r.format, value: r.barcode, name: r.name, price: r.price, currency: '₺', code: r.code, company: AppConfig.companyName, show: ui.show }, printer.mode !== 'browser' && size.kind === 'roll' ? { dpi: printer.dpi } : {});
        await printLabels([{ layout, copies }], size, printer);
        api.post(`/barcodes/${r.id}/print`, { copies }).catch(() => {});
        showToast(`${copies} etiket yazıcıya gönderildi`, 'success');
        load();
      } catch (err) { showToast(err.message, 'error', 6000); }
    });
    load();
  }

  // =====================================================================
  // YAZICI
  // =====================================================================
  function renderPrinter() {
    const s = printer;
    const raw = s.mode !== 'browser';
    view.innerHTML = `
    <div class="card bc-card">
      <div class="sx-step"><i class="ph ph-plugs-connected"></i> Yazıcı bağlantısı <span class="bc-dim">(bu cihaz için)</span></div>
      <div class="bc-modes">
        ${[['browser', 'ph-desktop', 'Tarayıcı / sürücü', 'Bilgisayara veya telefona tanıtılmış her yazıcı. Etiket ölçüsü tam olarak ayarlanır.'],
           ['serial', 'ph-usb', 'Seri port (USB/Bluetooth)', 'Zebra/TSC/Xprinter gibi yazıcılara doğrudan ham komut. Chrome/Edge gerekir.'],
           ['agent', 'ph-hard-drives', 'Yerel yazdırma ajanı', 'Ağ (IP) yazıcısı veya bilgisayara bağlı USB yazıcı. Ajan programı o bilgisayarda çalışır.']]
          .map(([k, ic, t, d]) => `<label class="bc-mode-card ${s.mode === k ? 'on' : ''}"><input type="radio" name="pm" value="${k}" ${s.mode === k ? 'checked' : ''} /><i class="ph ${ic}"></i><b>${t}</b><small>${d}</small></label>`).join('')}
      </div>
    </div>

    <div class="card bc-card" id="bcp-raw" ${raw ? '' : 'hidden'}>
      <div class="sx-step"><i class="ph ph-terminal-window"></i> Yazıcı dili ve ölçüler</div>
      <div class="sx-grid">
        <div class="sx-field"><label>Yazıcı dili</label><div class="input-field"><select id="bcp-lang" class="input-element"><option value="zpl">ZPL (Zebra ve uyumlular)</option><option value="tspl">TSPL (TSC, Xprinter, Gprinter...)</option></select></div></div>
        <div class="sx-field"><label>Çözünürlük</label><div class="input-field"><select id="bcp-dpi" class="input-element"><option value="203">203 dpi (8 nokta/mm)</option><option value="300">300 dpi (12 nokta/mm)</option><option value="600">600 dpi (24 nokta/mm)</option></select></div></div>
        <div class="sx-field"><label>Etiket türü</label><div class="input-field"><select id="bcp-media" class="input-element"><option value="gap">Aralıklı (boşluklu) etiket</option><option value="mark">Siyah işaretli</option><option value="continuous">Sürekli (rulo)</option></select></div></div>
        <div class="sx-field" id="bcp-gap-wrap"><label>Etiket arası boşluk (mm) <span class="sx-opt">TSPL</span></label><div class="input-field"><input id="bcp-gap" type="number" min="0" max="20" step="0.5" /></div></div>
        <div class="sx-field" id="bcp-dir-wrap"><label>Baskı yönü <span class="sx-opt">TSPL — ters çıkarsa değiştirin</span></label><div class="input-field"><select id="bcp-dir" class="input-element"><option value="1">Normal</option><option value="0">Ters (180°)</option></select></div></div>
      </div>
    </div>

    <div class="card bc-card" id="bcp-serial" ${s.mode === 'serial' ? '' : 'hidden'}>
      <div class="sx-step"><i class="ph ph-usb"></i> Seri port</div>
      <div class="bc-hint">${serialSupported() ? 'İlk yazdırmada tarayıcı port seçtirir; seçim hatırlanır. Bluetooth yazıcıyı önce cihaz eşleştirmesinden ekleyin (SPP/seri port).' : '<b>Bu tarayıcı Web Serial desteklemiyor.</b> Chrome veya Edge (masaüstü / Android) kullanın ya da “Tarayıcı / sürücü” seçin.'}</div>
      <div class="sx-field"><label>Baud hızı</label><div class="input-field"><select id="bcp-baud" class="input-element">${[9600, 19200, 38400, 57600, 115200, 230400].map((b) => `<option>${b}</option>`).join('')}</select></div></div>
      <button type="button" class="btn btn-secondary" id="bcp-forget"><i class="ph ph-x-circle"></i> Kayıtlı portu unut</button>
    </div>

    <div class="card bc-card" id="bcp-agent" ${s.mode === 'agent' ? '' : 'hidden'}>
      <div class="sx-step"><i class="ph ph-hard-drives"></i> Yerel yazdırma ajanı</div>
      <div class="bc-hint">Ajan (print-agent) yazıcının bağlı olduğu bilgisayarda çalışır: <code>node agent.js</code>. Ayrıntılar paketin içindeki README.md dosyasında.</div>
      <div class="sx-grid">
        <div class="sx-field"><label>Ajan adresi</label><div class="input-field"><input id="bcp-aurl" type="text" placeholder="http://127.0.0.1:9101" /></div></div>
        <div class="sx-field"><label>Yazıcıya bağlantı</label><div class="input-field"><select id="bcp-atype" class="input-element"><option value="tcp">Ağ yazıcısı (IP, port 9100)</option><option value="printer">Yüklü yazıcı adı (USB)</option></select></div></div>
        <div class="sx-field" data-a="tcp"><label>Yazıcı IP adresi</label><div class="input-field"><input id="bcp-ahost" type="text" placeholder="192.168.1.50" /></div></div>
        <div class="sx-field" data-a="tcp"><label>Port</label><div class="input-field"><input id="bcp-aport" type="number" min="1" max="65535" /></div></div>
        <div class="sx-field" data-a="printer"><label>Yazıcı adı</label><div class="input-field"><input id="bcp-aprn" list="bcp-prn-list" type="text" placeholder="Zebra ZD220" /><datalist id="bcp-prn-list"></datalist></div></div>
      </div>
      <div class="bc-actions-row">
        <button type="button" class="btn btn-secondary" id="bcp-ping"><i class="ph ph-plugs"></i> Ajanı dene</button>
        <button type="button" class="btn btn-secondary" id="bcp-list" data-a="printer"><i class="ph ph-list"></i> Yazıcıları listele</button>
      </div>
      <div class="bc-hint" id="bcp-astatus"></div>
    </div>

    <div class="card bc-card">
      <div class="sx-step"><i class="ph ph-test-tube"></i> Deneme</div>
      <div class="bc-actions-row">
        <button type="button" class="btn btn-primary" id="bcp-test"><i class="ph ph-printer"></i> Test etiketi yazdır</button>
        <button type="button" class="btn btn-secondary" id="bcp-dl" ${raw ? '' : 'hidden'}><i class="ph ph-file-arrow-down"></i> Komutu dosya olarak indir</button>
      </div>
      <div class="bc-hint">Test, seçili etiket boyutunda (${esc(sizeById(ui.size, { w: ui.cw, h: ui.ch }).label)}) örnek bir EAN-13 basar. Çıktı ters/kaymış ise ayarları buradan düzeltin.</div>
    </div>`;

    const $ = (x) => view.querySelector(x);
    const persist = () => { savePrinterSettings(printerKey, printer); };
    $('#bcp-lang').value = s.language; $('#bcp-dpi').value = String(s.dpi); $('#bcp-media').value = s.media; $('#bcp-gap').value = s.gap; $('#bcp-dir').value = String(s.direction);
    $('#bcp-baud').value = String(s.baud); $('#bcp-aurl').value = s.agentUrl; $('#bcp-atype').value = s.agentTarget; $('#bcp-ahost').value = s.agentHost; $('#bcp-aport').value = s.agentPort; $('#bcp-aprn').value = s.agentPrinter;
    const sync = () => {
      view.querySelectorAll('[data-a]').forEach((el) => { el.hidden = el.dataset.a !== printer.agentTarget; });
      $('#bcp-gap-wrap').hidden = $('#bcp-dir-wrap').hidden = printer.language !== 'tspl';
    };
    sync();

    view.onchange = (e) => {
      const t = e.target;
      if (t.name === 'pm') { printer.mode = t.value; persist(); return renderPrinter(); }
      const map = { 'bcp-lang': ['language', String], 'bcp-dpi': ['dpi', Number], 'bcp-media': ['media', String], 'bcp-gap': ['gap', Number], 'bcp-dir': ['direction', Number], 'bcp-baud': ['baud', Number],
        'bcp-aurl': ['agentUrl', (v) => String(v).trim().replace(/\/$/, '')], 'bcp-atype': ['agentTarget', String], 'bcp-ahost': ['agentHost', (v) => String(v).trim()], 'bcp-aport': ['agentPort', Number], 'bcp-aprn': ['agentPrinter', (v) => String(v).trim()] };
      const m = map[t.id]; if (!m) return;
      printer[m[0]] = m[1](t.value); persist(); sync();
    };
    $('#bcp-forget')?.addEventListener('click', async () => { await serialForget(); showToast('Kayıtlı port unutuldu', 'success'); });
    $('#bcp-ping')?.addEventListener('click', async () => {
      const st = $('#bcp-astatus'); st.textContent = 'Deneniyor...';
      try { const h = await agentHealth(printer); st.innerHTML = `<i class="ph ph-check-circle" style="color:var(--success)"></i> Ajan çalışıyor (sürüm ${esc(h.version)}, ${esc(h.platform)}).`; }
      catch (_e) { st.innerHTML = '<i class="ph ph-warning" style="color:var(--error)"></i> Ajana ulaşılamadı. Ajan çalışıyor mu? Adres doğru mu? Sitenizin adresi ajanın izinli listesinde mi?'; }
    });
    $('#bcp-list')?.addEventListener('click', async () => {
      const st = $('#bcp-astatus');
      try {
        const list = await agentPrinters(printer);
        $('#bcp-prn-list').innerHTML = list.map((n) => `<option value="${esc(n)}">`).join('');
        st.textContent = list.length ? `${list.length} yazıcı bulundu; kutuya tıklayıp seçin.` : 'Yüklü yazıcı bulunamadı.';
      } catch (e) { st.textContent = 'Ajana ulaşılamadı.'; }
    });

    function testLayout(dpi) {
      const size = sizeById(ui.size, { w: ui.cw, h: ui.ch });
      const layout = layoutLabel({ wMm: size.w, hMm: size.h, format: 'ean13', value: '200000000001', name: 'TEST ETİKETİ Çş Ğü İö', price: 12.5, currency: '₺', code: 'PRD-TEST', company: AppConfig.companyName, show: { name: true, price: true, code: true, company: true, text: true } }, dpi ? { dpi } : {});
      return { size, layout };
    }
    $('#bcp-test').addEventListener('click', async (e) => {
      const b = e.currentTarget; b.disabled = true;
      try {
        const { size, layout } = testLayout(printer.mode !== 'browser' ? printer.dpi : 0);
        await printLabels([{ layout, copies: 1 }], size, printer);
        showToast('Test etiketi gönderildi', 'success');
      } catch (err) { showToast(err.message, 'error', 6000); } finally { b.disabled = false; }
    });
    $('#bcp-dl')?.addEventListener('click', () => { const { layout } = testLayout(printer.dpi); downloadRaw(layout, printer, 1, 'test-etiketi'); });
  }

  // ---- başlat ----
  (async () => { await loadBase(); showTab(['create', 'records', 'printer'].includes(tab) ? tab : 'create'); })();
  return container;
}
