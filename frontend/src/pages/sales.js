/**
 * DEPO TAKİP - Satış İşlemleri
 * Her satış türünün kendi akışı, alanları ve görünümü vardır:
 *  toptan → çok kalemli, vadeli · perakende → barkod okutmalı hızlı satış + ödeme yöntemi
 *  ihracat → hedef ülke / teslim şekli / konteyner · b2b → karşı işletme, sipariş no, teslim tarihi
 *  iade → iade nedeni ve ürün durumu, depoya geri giriş
 */

import AppConfig from '../core/config.js';
import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { openBarcodeScanner } from '../components/barcodeScanner.js';
import { wireBarcodeInput } from '../components/barcodeInput.js';
import { esc } from '../components/shell.js';
import router from '../core/router.js';

const money = (n) => Number(n || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' ₺';

/** Tür bazlı akış tanımları. Tanımsız (özel) türler GENERIC'i kullanır. */
const PROFILES = {
  toptan: {
    intro: 'Büyük hacimli, vadeli satışlar. Birden fazla ürünü tek seferde ekleyin.',
    customerLabel: 'Alıcı firma', warehouseLabel: 'Çıkış deposu', submit: 'Toptan satışı tamamla', submitIcon: 'ph-truck',
    scan: false, link: true, qtyHint: 'Koli / palet adedi',
    fields: [
      { id: 'docNo', label: 'İrsaliye / Fatura no', icon: 'ph-file-text', placeholder: 'Örn: IRS-2026-0142' },
      { id: 'terms', label: 'Vade', type: 'select', icon: 'ph-calendar-check', options: ['Peşin', '15 gün', '30 gün', '45 gün', '60 gün', '90 gün'], value: '30 gün' },
    ],
  },
  perakende: {
    intro: 'Hızlı satış: barkodu okutun, ürün sepete girsin. Aynı barkod tekrar okutulunca adet artar.',
    customerLabel: 'Müşteri', warehouseLabel: 'Satış deposu', submit: 'Satışı tamamla', submitIcon: 'ph-shopping-bag',
    scan: true, scanFirst: true, link: false, qtyHint: 'Adet',
    fields: [
      { id: 'payment', label: 'Ödeme yöntemi', type: 'chips', options: ['Nakit', 'Kredi kartı', 'Havale / EFT'], value: 'Nakit', required: true },
    ],
  },
  ihracat: {
    intro: 'Yurt dışı sevkiyatı: hedef ülke, teslim şekli ve konteyner bilgisini girin.',
    customerLabel: 'Yurt dışı alıcı', warehouseLabel: 'Çıkış deposu', submit: 'İhracat satışını tamamla', submitIcon: 'ph-airplane-tilt',
    scan: false, link: true, qtyHint: 'Adet',
    fields: [
      { id: 'country', label: 'Hedef ülke', icon: 'ph-globe-hemisphere-west', placeholder: 'Örn: Almanya', required: true },
      { id: 'incoterm', label: 'Teslim şekli (Incoterm)', type: 'select', icon: 'ph-handshake', options: ['EXW', 'FCA', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP'], value: 'FOB' },
      { id: 'container', label: 'Konteyner / Plaka no', icon: 'ph-truck-trailer', placeholder: 'İsteğe bağlı' },
    ],
  },
  b2b: {
    intro: 'İşletmeler arası satış: karşı işletme, sipariş numarası ve teslim tarihi ile kayıt.',
    customerLabel: 'Karşı işletme', warehouseLabel: 'Çıkış deposu', submit: 'B2B satışını tamamla', submitIcon: 'ph-briefcase',
    scan: false, link: true, qtyHint: 'Adet',
    fields: [
      { id: 'po', label: 'Sipariş (PO) no', icon: 'ph-hash', placeholder: 'Karşı tarafın sipariş numarası' },
      { id: 'due', label: 'Teslim tarihi', type: 'date', icon: 'ph-calendar-blank' },
    ],
  },
  iade: {
    intro: 'Müşteriden dönen ürünü stoğa geri alın. Tutar müşterinin bakiyesinden düşülür.',
    customerLabel: 'İade eden müşteri', warehouseLabel: 'İade giriş deposu', submit: 'İadeyi kabul et', submitIcon: 'ph-arrow-u-down-left',
    scan: true, link: false, isReturn: true, qtyHint: 'İade adedi',
    fields: [
      { id: 'reason', label: 'İade nedeni', type: 'select', icon: 'ph-chat-teardrop-text', options: ['Hasarlı ürün', 'Yanlış ürün gönderildi', 'Son kullanma tarihi', 'Fazla / mükerrer sipariş', 'Kalite şikayeti', 'Diğer'], required: true },
      { id: 'condition', label: 'Ürün durumu', type: 'chips', options: ['Sağlam', 'Hasarlı'], value: 'Sağlam' },
      { id: 'docNo', label: 'İade irsaliye no', icon: 'ph-file-text', placeholder: 'İsteğe bağlı' },
    ],
  },
  // Gemi ikmali (denizcilik): sevk noktası filo gemileridir (müşteri kodu GM…); iç ikmal olduğu için tutar gösterilmez
  sevkiyat: {
    intro: 'Gemi talebine göre ambardan malzeme çıkışı. Barkod okutabilir veya listeden ekleyebilirsiniz.',
    customerLabel: 'Sevk edilen gemi', warehouseLabel: 'Çıkış ambarı', submit: 'Sevkiyatı tamamla', submitIcon: 'ph-boat',
    scan: true, link: false, noPrice: true, customerFilter: (c) => /^GM/.test(String(c.id)), qtyHint: 'Miktar', doneText: 'Sevkiyat tamamlandı',
    fields: [
      { id: 'req', label: 'Gemi talep no', icon: 'ph-clipboard-text', placeholder: 'Örn: RQ-FRC-2026-041' },
      { id: 'port', label: 'Teslim limanı', type: 'select', icon: 'ph-anchor', options: ['Tuzla', 'Aliağa', 'Dilovası', 'Yarımca', 'Ambarlı', 'Mersin', 'Yurt dışı liman (acente)'], value: 'Tuzla', required: true },
      { id: 'delivery', label: 'Teslim şekli', type: 'chips', options: ['Rıhtımda teslim', 'Lançla teslim', 'Acente üzerinden'], value: 'Rıhtımda teslim' },
    ],
  },
};
const GENERIC = { intro: 'Satış bilgilerini girin.', customerLabel: 'Müşteri', warehouseLabel: 'Çıkış deposu', submit: 'Satışı tamamla', submitIcon: 'ph-check-circle', scan: true, link: true, qtyHint: 'Adet', fields: [] };

const shade = (hex, pct) => `color-mix(in srgb, ${hex}, ${pct < 0 ? '#000' : '#fff'} ${Math.abs(pct)}%)`;

export default function SalesPage() {
  const container = document.createElement('div');
  container.className = 'page-sales page-container';

  const pageTitle = AppConfig.modules.sales?.label || 'Satış İşlemleri';
  const header = createHeader({ title: pageTitle, gradientClass: 'gradient-sales' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  container.appendChild(content);

  const types = AppConfig.salesTypes;

  function resetHeader() {
    header.style.background = '';
    header.querySelector('.app-header-title, h1, .header-title')?.replaceChildren(pageTitle);
  }

  // ---------- 1) Tür seçimi ----------
  const renderTypes = () => {
    resetHeader();
    content.innerHTML = `
      <div class="section-title animate-fade-in-up"><h2>Satış türü seçin</h2></div>
      <div class="sales-type-list">
        ${types.map((t, i) => {
          const p = PROFILES[t.id] || GENERIC;
          return `
          <div class="menu-card sx-type animate-fade-in-up stagger-${Math.min(i + 1, 5)}" data-type="${esc(t.id)}" style="--sx:${esc(t.color)}" tabindex="0" role="button">
            <div class="menu-icon" style="background:${esc(t.color)}1a;color:${esc(t.color)};">${t.icon}</div>
            <div class="menu-content">
              <div class="menu-title">${esc(t.label)} <span class="badge" style="background:${esc(t.color)}1f;color:${esc(t.color)};font-size:10px;">${esc(t.badge)}</span></div>
              <div class="menu-desc">${esc(p.intro)}</div>
            </div>
            <div class="menu-arrow" style="background:${esc(t.color)}12;color:${esc(t.color)};"><i class="ph ph-caret-right"></i></div>
          </div>`;
        }).join('')}
      </div>`;
    content.querySelectorAll('.sx-type').forEach((card) => {
      const open = () => renderForm(types.find((t) => t.id === card.dataset.type));
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  };

  // ---------- 2) Tür formu ----------
  const renderForm = async (type) => {
    const P = PROFILES[type.id] || GENERIC;
    const color = type.color || 'var(--primary)';
    if (types.length > 1) {
      header.style.background = `linear-gradient(135deg, ${color}, ${shade(color, -28)})`;
      header.querySelector('.app-header-title, h1, .header-title')?.replaceChildren(type.label);
    }
    content.innerHTML = '<div style="display:flex;justify-content:center;padding:48px;"><div class="loading-spinner"></div></div>';

    let customers = [], warehouses = [], products = [], balances = [], orderLines = [];
    try {
      const [cusRes, whRes, prdRes] = await Promise.all([api.getCustomers(), api.getWarehouses(), api.getProducts()]);
      customers = cusRes.success ? cusRes.data : [];
      if (P.customerFilter) customers = customers.filter(P.customerFilter);
      warehouses = whRes.success ? whRes.data : [];
      products = prdRes.success ? prdRes.data : [];
      try { const b = await api.get('/warehouse-balances'); balances = b.success ? b.data : []; } catch (_e) { /* depo bazlı stok yoksa toplam stok kullanılır */ }
      if (P.link && AppConfig.modules.jobTracking?.enabled) {
        try {
          const ord = await api.get('/jt/orders');
          orderLines = (ord.data || []).filter((o) => !['shipped', 'cancelled'].includes(o.state))
            .flatMap((o) => o.lines.filter((l) => l.remaining > 0).map((l) => ({ orderId: o.id, lineId: l.id, productId: l.productId, customerId: o.customerId, label: `${o.orderNo} · ${l.productName} (kalan ${l.remaining})`, remaining: l.remaining })));
        } catch (_e) { /* backend iş takip desteklemiyor */ }
      }
    } catch (e) {
      content.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${esc(e.message || 'Veri yüklenemedi. Sunucu bağlantısını kontrol edin.')}</div></div>`;
      return;
    }

    /** sepet satırları */
    let lines = [];
    const fieldVals = {};
    (P.fields || []).forEach((f) => { fieldVals[f.id] = f.value || ''; });

    const byId = (id) => products.find((p) => p.id === id);
    const whId = () => content.querySelector('#sx-wh').value;
    /** Seçili depoda satılabilir miktar (iade için sınır yok) */
    const available = (pid) => {
      const w = whId();
      if (w && balances.length) return balances.find((b) => b.productId === pid && b.warehouseId === w)?.qty || 0;
      return byId(pid)?.stock || 0;
    };
    const inCart = (pid) => lines.filter((l) => l.productId === pid).reduce((a, l) => a + l.qty, 0);
    const pickable = () => (P.isReturn ? products : products.filter((p) => available(p.id) - inCart(p.id) > 0));

    const fieldHtml = (f) => {
      const req = f.required ? '<span class="sx-req">*</span>' : '';
      if (f.type === 'chips') {
        return `<div class="sx-field"><label>${esc(f.label)} ${req}</label>
          <div class="sx-chips" data-f="${f.id}">${f.options.map((o) => `<button type="button" class="sx-chip ${o === f.value ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
      }
      const input = f.type === 'select'
        ? `<select class="input-element" data-f="${f.id}">${f.required ? '<option value="">Seçiniz...</option>' : ''}${f.options.map((o) => `<option ${o === f.value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`
        : `<input class="input-element" data-f="${f.id}" type="${f.type === 'date' ? 'date' : 'text'}" placeholder="${esc(f.placeholder || '')}" maxlength="80" />`;
      return `<div class="sx-field"><label>${esc(f.label)} ${req}</label><div class="input-field"><span class="input-icon"><i class="ph ${f.icon || 'ph-note'}"></i></span>${input}</div></div>`;
    };

    content.innerHTML = `
      ${types.length > 1 ? `
      <div class="sx-banner animate-fade-in-down" style="--sx:${esc(color)}">
        <button type="button" class="sx-back" id="sx-back" aria-label="Geri"><i class="ph ph-arrow-left"></i></button>
        <div class="sx-banner-icon">${type.icon}</div>
        <div class="sx-banner-text"><b>${esc(type.label)}</b><span>${esc(P.intro)}</span></div>
      </div>` : /* tek tür (ör. yalnız gemi sevkiyatı): başlık ve geri tuşu üst çubukta; burada yalnız kısa açıklama */ `
      <div class="sx-intro animate-fade-in-down"><i class="ph ph-info"></i> ${esc(P.intro)}</div>`}

      <div class="card sx-card animate-fade-in-up" style="--sx:${esc(color)}">
        <div class="sx-step"><i class="ph ph-users"></i> ${esc(P.customerLabel)} ve depo</div>
        <div class="sx-grid">
          <div class="sx-field"><label>${esc(P.customerLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-users"></i></span>
              <select id="sx-customer" class="input-element"><option value="">Seçiniz...</option>${customers.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></div></div>
          <div class="sx-field"><label>${esc(P.warehouseLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="sx-wh" class="input-element"><option value="">Seçiniz...</option>${warehouses.map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}</select></div></div>
        </div>
        ${(P.fields || []).length ? `<div class="sx-grid">${P.fields.map(fieldHtml).join('')}</div>` : ''}
      </div>

      <div class="card sx-card animate-fade-in-up stagger-1" style="--sx:${esc(color)}">
        <div class="sx-step"><i class="ph ph-package"></i> ${P.scanFirst ? 'Ürünleri okutun' : 'Ürün ekle'}</div>
        ${P.scan ? `
        <div class="barcode-input-row">
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span>
            <input type="text" id="sx-scan" placeholder="Barkod veya ürün kodu" /></div>
          <button type="button" class="camera-btn" id="sx-camera" aria-label="Kamera ile okut"><i class="ph ph-camera"></i></button>
        </div>` : ''}
        ${P.scanFirst ? '' : `
        ${orderLines.length ? `<div class="sx-field"><label>Sipariş kalemi <span class="sx-opt">(isteğe bağlı — giden miktara işlenir)</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-kanban"></i></span><select id="sx-order" class="input-element"><option value="">Siparişe bağlama</option></select></div></div>` : ''}
        <div class="sx-add">
          <div class="input-field sx-add-prod"><span class="input-icon"><i class="ph ph-package"></i></span>
            <select id="sx-product" class="input-element"></select></div>
          <div class="input-field sx-add-qty"><span class="input-icon"><i class="ph ph-hash"></i></span>
            <input type="number" id="sx-qty" min="1" step="1" inputmode="numeric" placeholder="${esc(P.qtyHint)}" /></div>
          <button type="button" class="btn sx-add-btn" id="sx-add"><i class="ph ph-plus"></i> Ekle</button>
        </div>`}
        <div class="sx-hint" id="sx-hint"></div>
        <div id="sx-lines"></div>
      </div>

      <div class="sx-total animate-fade-in-up stagger-2" id="sx-total" style="--sx:${esc(color)}"></div>
      <button type="button" id="sx-submit" class="btn btn-block btn-lg sx-submit" style="--sx:${esc(color)}">
        <i class="ph ${P.submitIcon}"></i> ${esc(P.submit)}
      </button>`;

    const $ = (s) => content.querySelector(s);

    // --- ürün listesi (seçili depoya göre süzülür) ---
    function fillProducts() {
      const sel = $('#sx-product');
      if (!sel) return;
      const prev = sel.value;
      const list = pickable();
      sel.innerHTML = `<option value="">${list.length ? (P.noPrice ? 'Malzeme seçin...' : 'Ürün seçin...') : (P.isReturn ? 'Ürün yok' : `Bu ${P.noPrice ? 'ambarda sevk edilebilir malzeme' : 'depoda satılabilir ürün'} yok`)}</option>` +
        list.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}${P.isReturn ? '' : ` — ${available(p.id) - inCart(p.id)} ${esc(p.unit || '')}`}</option>`).join('');
      if (list.some((p) => p.id === prev)) sel.value = prev;
      const hint = $('#sx-hint');
      if (!P.isReturn && whId() && !list.length && !lines.length) {
        hint.innerHTML = '<i class="ph ph-info"></i> Seçili depoda stok yok. Başka bir depo seçin veya Stok Detay › Stok Yönetimi’nden stok ekleyin.';
        hint.classList.add('show');
      } else if (!P.isReturn && !whId()) {
        hint.innerHTML = '<i class="ph ph-info"></i> Önce depoyu seçin; yalnızca o depoda stoku olan ürünler listelenir.';
        hint.classList.add('show');
      } else { hint.classList.remove('show'); hint.textContent = ''; }
    }

    function fillOrders() {
      const os = $('#sx-order');
      if (!os) return;
      const pid = $('#sx-product')?.value;
      const matches = orderLines.filter((l) => !pid || l.productId === pid);
      os.innerHTML = '<option value="">Siparişe bağlama</option>' + matches.map((l) => `<option value="${esc(l.orderId)}|${esc(l.lineId)}">${esc(l.label)}</option>`).join('');
    }

    // --- sepet ---
    function renderLines() {
      const box = $('#sx-lines');
      box.innerHTML = lines.length ? lines.map((l, i) => {
        const p = byId(l.productId);
        const max = P.isReturn ? Infinity : available(l.productId);
        return `
        <div class="sx-line" data-i="${i}">
          <div class="sx-line-info">
            <div class="sx-line-name">${esc(p?.name || l.productId)}</div>
            <div class="sx-line-sub">${P.noPrice ? `${esc(p?.code || '')} · ${l.qty} ${esc(p?.unit || '')}` : `${money(p?.price)} × ${l.qty}`}${l.orderId ? ' · <i class="ph ph-kanban"></i> siparişe bağlı' : ''}</div>
          </div>
          <div class="sx-stepper">
            <button type="button" data-act="dec" aria-label="Azalt"><i class="ph ph-minus"></i></button>
            <input type="number" min="1" value="${l.qty}" data-role="qty" inputmode="numeric" aria-label="Adet" />
            <button type="button" data-act="inc" aria-label="Artır" ${l.qty >= max ? 'disabled' : ''}><i class="ph ph-plus"></i></button>
          </div>
          ${P.noPrice ? '' : `<div class="sx-line-amt">${money((p?.price || 0) * l.qty)}</div>`}
          <button type="button" class="sx-rm" data-act="rm" aria-label="Kaldır"><i class="ph ph-x"></i></button>
        </div>`;
      }).join('') : `<div class="sx-empty"><i class="ph ph-shopping-cart-simple"></i> ${P.isReturn ? 'İade edilecek ürün eklenmedi' : P.noPrice ? 'Sevk listesi boş' : 'Sepet boş'}</div>`;

      const qty = lines.reduce((a, l) => a + l.qty, 0);
      const amt = lines.reduce((a, l) => a + (byId(l.productId)?.price || 0) * l.qty, 0);
      $('#sx-total').innerHTML = `
        <div><span>Kalem</span><b>${lines.length}</b></div>
        <div><span>Toplam adet</span><b>${qty}</b></div>
        ${P.noPrice ? '' : `<div class="sx-total-amt"><span>${P.isReturn ? 'Bakiyeden düşülecek' : 'Genel toplam'}</span><b>${money(amt)}</b></div>`}`;
      fillProducts();
    }

    function addLine(productId, qty, link) {
      const p = byId(productId);
      if (!p) return showToast('Ürün bulunamadı', 'error');
      qty = Math.floor(Number(qty));
      if (!(qty > 0)) return showToast('Geçerli bir adet girin', 'warning');
      if (!P.isReturn) {
        if (!whId()) return showToast('Önce depoyu seçin', 'warning');
        const left = available(productId) - inCart(productId);
        if (qty > left) return showToast(`"${p.name}" için bu depoda en fazla ${Math.max(0, left)} adet eklenebilir`, 'warning');
      }
      const key = link ? `${productId}|${link.lineId}` : productId;
      const ex = lines.find((l) => (l.key || l.productId) === key);
      if (ex) ex.qty += qty; else lines.push({ key, productId, qty, ...(link || {}) });
      renderLines();
    }

    // --- olaylar ---
    $('#sx-back')?.addEventListener('click', renderTypes);
    $('#sx-wh').addEventListener('change', () => {
      // depo değişince sepetteki adetler yeni depoya göre kırpılır
      if (!P.isReturn) lines = lines.filter((l) => available(l.productId) > 0).map((l) => ({ ...l, qty: Math.min(l.qty, available(l.productId)) }));
      renderLines();
    });

    content.querySelectorAll('.sx-chips').forEach((box) => box.addEventListener('click', (e) => {
      const b = e.target.closest('.sx-chip'); if (!b) return;
      box.querySelectorAll('.sx-chip').forEach((x) => x.classList.toggle('on', x === b));
      fieldVals[box.dataset.f] = b.dataset.v;
    }));
    content.querySelectorAll('select[data-f], input[data-f]').forEach((el) => el.addEventListener('input', () => { fieldVals[el.dataset.f] = el.value; }));

    const addBtn = $('#sx-add');
    addBtn?.addEventListener('click', () => {
      const pid = $('#sx-product').value;
      if (!pid) return showToast('Ürün seçin', 'warning');
      const [o, l] = ($('#sx-order')?.value || '').split('|');
      addLine(pid, $('#sx-qty').value || 1, o ? { orderId: o, lineId: l } : null);
      $('#sx-qty').value = '';
      $('#sx-product').value = '';
      fillOrders();
    });
    $('#sx-qty')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
    $('#sx-product')?.addEventListener('change', fillOrders);
    $('#sx-order')?.addEventListener('change', () => {
      const l = orderLines.find((x) => `${x.orderId}|${x.lineId}` === $('#sx-order').value);
      if (!l) return;
      if (pickable().some((p) => p.id === l.productId)) $('#sx-product').value = l.productId;
      $('#sx-customer').value = l.customerId || $('#sx-customer').value;
      if (!$('#sx-qty').value) $('#sx-qty').value = l.remaining;
    });

    if (P.scan) {
      const findProduct = (code) => products.find((p) => p.barcode === code || String(p.code || '').toLowerCase() === code.toLowerCase());
      const onCode = (code) => {
        const p = findProduct(code);
        if (!p) return showToast(`"${code}" kodlu ürün bulunamadı`, 'error');
        addLine(p.id, 1);
      };
      wireBarcodeInput($('#sx-scan'), onCode);
      $('#sx-camera')?.addEventListener('click', () => openBarcodeScanner(onCode));
    }

    $('#sx-lines').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]'); if (!btn) return;
      const i = Number(btn.closest('.sx-line').dataset.i);
      const l = lines[i]; if (!l) return;
      if (btn.dataset.act === 'rm') lines.splice(i, 1);
      else if (btn.dataset.act === 'inc') { if (P.isReturn || l.qty < available(l.productId)) l.qty++; }
      else if (btn.dataset.act === 'dec') { l.qty--; if (l.qty < 1) lines.splice(i, 1); }
      renderLines();
    });
    $('#sx-lines').addEventListener('change', (e) => {
      const inp = e.target.closest('[data-role="qty"]'); if (!inp) return;
      const l = lines[Number(inp.closest('.sx-line').dataset.i)];
      let v = Math.floor(Number(inp.value));
      if (!(v > 0)) v = 1;
      if (!P.isReturn) {
        const max = available(l.productId);
        if (v > max) { showToast(`Bu depoda en fazla ${max} adet var`, 'warning'); v = max; }
      }
      l.qty = v;
      renderLines();
    });

    // --- gönder ---
    $('#sx-submit').addEventListener('click', async () => {
      const btn = $('#sx-submit');
      const cId = $('#sx-customer').value;
      const wId = whId();
      if (!cId) return showToast(`${P.customerLabel} seçin`, 'warning');
      if (!wId) return showToast(`${P.warehouseLabel} seçin`, 'warning');
      if (!lines.length) return showToast('En az bir ürün ekleyin', 'warning');
      const missing = (P.fields || []).find((f) => f.required && !String(fieldVals[f.id] || '').trim());
      if (missing) return showToast(`${missing.label} zorunludur`, 'warning');

      const note = (P.fields || []).filter((f) => String(fieldVals[f.id] || '').trim())
        .map((f) => `${f.label}: ${String(fieldVals[f.id]).trim()}`).join(' · ');

      const label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';
      const failed = [];
      let done = 0;
      try {
        for (const l of [...lines]) {
          try {
            const res = await api.makeSale(cId, wId, l.productId, l.qty, type.id, l.orderId, l.lineId, note);
            if (!res.success) throw new Error(res.message || 'Hata oluştu');
            lines = lines.filter((x) => x !== l);
            done++;
          } catch (err) {
            failed.push(`${byId(l.productId)?.name || l.productId}: ${err.message}`);
          }
        }
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }

      if (!failed.length) {
        showToast(P.isReturn ? `İade kabul edildi (${done} kalem). Stok geri eklendi.` : `${P.doneText || 'Satış tamamlandı'} (${done} kalem).`, 'success');
        renderForm(type); // taze stokla yeni form
      } else {
        showToast(failed[0], 'error');
        // başarılı kalemler zaten işlendi: stokları tazele, başarısız olanlar sepette kalsın
        try {
          const [prd, bal] = await Promise.all([api.getProducts(), api.get('/warehouse-balances')]);
          if (prd.success) products = prd.data;
          if (bal.success) balances = bal.data;
        } catch (_e) { /* eski değerlerle devam */ }
        renderLines();
        if (done) showToast(`${done} kalem kaydedildi, ${failed.length} kalem kaydedilemedi.`, 'warning');
      }
    });

    renderLines();
    fillOrders();
  };

  const wanted = types.find((t) => t.id === router.getQueryParams().type);
  // tek tür tanımlıysa (ör. yalnız gemi sevkiyatı) seçim ekranı atlanır
  if (wanted) renderForm(wanted); else if (types.length === 1) renderForm(types[0]); else renderTypes();
  return container;
}
