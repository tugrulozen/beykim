/**
 * SATIN ALMA MODÜLÜ
 * Sekmeler: Siparişler · (Tedarikçiler — ayrı Tedarikçiler menüsü açık değilse) · Özet
 *
 * Denizcilik düzeni (tenant.json › purchaseConfig.maritime = true):
 *  - Sipariş ambar stoğu için ya da bir geminin talebi için açılır (talep kaynağı); talep no, teslim yeri ve aciliyet taşır
 *  - Liste gemi / liman / aciliyet ile filtrelenir; özet gemi bazlı harcamayı gösterir
 * Sayfa içi adımlar (sekme, sipariş detayı, yeni sipariş) router.step ile geçmişe yazılır: geri tuşu bir önceki adıma döner.
 */

import AppConfig, { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import api from '../core/api.js';
import router from '../core/router.js';
import Auth from '../core/auth.js';
import { esc } from '../components/shell.js';
import { confirmDialog } from '../components/dialog.js';

export const STATUS = {
  draft:     { label: 'Taslak',           color: '#9E9E9E', bg: '#9E9E9E18', icon: 'ph-pencil-simple' },
  pending:   { label: 'Onay Bekliyor',    color: '#FF9800', bg: '#FF980018', icon: 'ph-clock' },
  approved:  { label: 'Onaylandı',        color: '#2196F3', bg: '#2196F318', icon: 'ph-check-circle' },
  ordered:   { label: 'Sipariş Verildi',  color: '#9C27B0', bg: '#9C27B018', icon: 'ph-package' },
  partial:   { label: 'Kısmi Teslim',     color: '#FF5722', bg: '#FF572218', icon: 'ph-arrows-split' },
  received:  { label: 'Teslim Alındı',    color: '#4CAF50', bg: '#4CAF5018', icon: 'ph-check-fat' },
  cancelled: { label: 'İptal',            color: '#F44336', bg: '#F4433618', icon: 'ph-x-circle' },
};
const URGENCY = {
  routine:  { label: 'Rutin',                  color: '#64748B', icon: 'ph-calendar-blank' },
  priority: { label: 'Öncelikli',              color: '#E08A00', icon: 'ph-lightning' },
  urgent:   { label: 'Acil — gemi bekliyor',   color: '#D93A3A', icon: 'ph-warning-octagon' },
};
const PORTS = ['Tuzla', 'Aliağa', 'Dilovası', 'Yarımca', 'Ambarlı', 'Mersin', 'İskenderun', 'Yurt dışı liman (acente)'];
const MARITIME_SUPPLIER_CATS = ['Makine Yedek Parça', 'Pompa & Valf', 'Filtre', 'Madeni Yağ', 'Boya & Kaplama', 'Tank Temizlik Kimyasalı',
  'Emniyet & Yangın', 'Güverte & Halat', 'Kumanya & Kamara', 'Elektrik & Seyir', 'Liman & Acente', 'Hizmet', 'Diğer'];
const DEFAULT_SUPPLIER_CATS = ['Tekstil', 'Hammadde', 'Ambalaj', 'Makine & Ekipman', 'Hizmet', 'Diğer'];

const maritime = () => !!AppConfig.purchaseConfig?.maritime;
const supplierCats = () => AppConfig.purchaseConfig?.supplierCategories || (maritime() ? MARITIME_SUPPLIER_CATS : DEFAULT_SUPPLIER_CATS);
const todayStr = () => new Date().toISOString().slice(0, 10);
const isOpen = (o) => !['received', 'cancelled'].includes(o.status);
const isLate = (o) => isOpen(o) && ['approved', 'ordered', 'partial'].includes(o.status) && o.expectedDate && o.expectedDate < todayStr();
/** TL karşılığı (özet grafikleri tek para biriminde toplanır; siparişin kayıtlı kuru kullanılır) */
const inTry = (o) => (o.totalGross || 0) * (o.currency === 'TRY' ? 1 : Number(o.exchangeRate) || 1);

export function fmt(n, currency = 'TRY') {
  if (n == null) return '-';
  try { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n); } catch (_e) { return `${Math.round(n)} ${currency}`; }
}
function fmtDate(d) {
  if (!d) return '-';
  const [y, m, day] = String(d).slice(0, 10).split('-');
  return `${day}.${m}.${y}`;
}
const dayDiff = (d) => Math.round((new Date(`${String(d).slice(0, 10)}T00:00:00`) - new Date(`${todayStr()}T00:00:00`)) / 86400000);
const spinner = () => '<div class="loading-spinner" style="margin-top:32px;"></div>';
const btnSpin = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>';

export default function PurchaseModulePage() {
  const container = document.createElement('div');
  container.className = 'page-purchase-module page-container';
  container.appendChild(createHeader({ title: pageTitle('purchase', 'Satın Alma'), gradientClass: 'gradient-purchase' }));
  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = spinner();
  container.appendChild(content);
  setTimeout(() => init(content), 0);
  return container;
}

function init(content) {
  const separateSuppliers = !!AppConfig.modules.suppliers?.enabled;
  const tabs = [['orders', 'ph-list-numbers', 'Siparişler'], ...(separateSuppliers ? [] : [['suppliers', 'ph-buildings', 'Tedarikçiler']]), ['summary', 'ph-chart-bar', 'Özet']];
  const q = router.getQueryParams();
  const tab = tabs.some((t) => t[0] === q.tab) ? q.tab : 'orders';
  content.innerHTML = `
    <div class="pm-tabs">${tabs.map(([id, ic, l]) => `<button class="pm-tab ${id === tab ? 'active' : ''}" data-tab="${id}"><i class="ph ${ic}"></i> ${l}</button>`).join('')}
      ${separateSuppliers ? `<a class="pm-tab pm-tab-link" href="#/suppliers"><i class="ph ph-buildings"></i> ${esc(AppConfig.modules.suppliers.label || 'Tedarikçiler')} <i class="ph ph-arrow-up-right"></i></a>` : ''}</div>
    <div id="pm-panel"></div>`;
  const panel = content.querySelector('#pm-panel');
  content.querySelectorAll('.pm-tab[data-tab]').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) return;
    router.step({ tab: btn.dataset.tab }); // geri tuşu önceki sekmeye döner
    content.querySelectorAll('.pm-tab').forEach((b) => b.classList.toggle('active', b === btn));
    show(btn.dataset.tab, {});
  }));
  const show = (t, params) => {
    if (t === 'suppliers') return renderSuppliers(panel);
    if (t === 'summary') return renderSummary(panel);
    if (params.po) return openOrderDetail(panel, params.po);
    if (params.new) return openNewOrderForm(panel);
    return renderOrders(panel, params);
  };
  show(tab, q);
}

/* ═══════════════ 1. SİPARİŞLER ═══════════════ */
async function renderOrders(panel, params = {}) {
  panel.innerHTML = spinner();
  try {
    const res = await api.get('/purchase-orders');
    const orders = res.success ? res.data : [];
    const st = { status: params.status || '', vessel: params.vessel || '', q: '' };
    const vessels = [...new Map(orders.filter((o) => o.vesselId).map((o) => [o.vesselId, o.vesselName])).entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'tr'));

    const open = orders.filter(isOpen);
    const kpis = [
      ['ph-folder-open', '#2196F3', open.length, 'Açık sipariş', 'Teslim alınmamış, iptal edilmemiş'],
      ['ph-clock', '#FF9800', orders.filter((o) => ['draft', 'pending'].includes(o.status)).length, 'Onay bekleyen', 'Taslak ve onaydaki siparişler'],
      ['ph-warning', '#D93A3A', orders.filter(isLate).length, 'Geciken teslimat', 'Beklenen teslim tarihi geçti'],
      maritime()
        ? ['ph-lightning', '#8B5CF6', open.filter((o) => o.urgency === 'urgent').length, 'Acil talep', 'Gemi veya ambar acil bekliyor']
        : ['ph-calendar-check', '#4CAF50', orders.filter((o) => String(o.orderDate).slice(0, 7) === todayStr().slice(0, 7)).length, 'Bu ay açılan', 'Bu ay oluşturulan siparişler'],
    ];

    const matches = (o) => (!st.status || o.status === st.status || (st.status === 'late' && isLate(o)))
      && (!st.vessel || (st.vessel === '__stock' ? !o.vesselId : o.vesselId === st.vessel))
      && (!st.q || [o.id, o.supplierName, o.vesselName, o.requisitionNo, o.port, o.invoiceNo].some((v) => String(v || '').toLocaleLowerCase('tr').includes(st.q)));

    function card(o, i) {
      const s = STATUS[o.status] || STATUS.draft;
      const u = URGENCY[o.urgency] || null;
      const progress = calcProgress(o);
      const late = isLate(o);
      const dLeft = o.expectedDate ? dayDiff(o.expectedDate) : null;
      return `
      <div class="pm-order-card pm2-card animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${late ? 'is-late' : ''}" data-id="${esc(o.id)}" tabindex="0" role="button">
        <div class="pm2-card-top">
          <div class="pm2-id"><i class="ph ph-file-text"></i> ${esc(o.id)}${maritime() && u && o.urgency !== 'routine' ? `<span class="pm2-urg" style="--u:${u.color}"><i class="ph ${u.icon}"></i> ${u.label}</span>` : ''}</div>
          <span class="pm-status-badge" style="background:${s.bg}; color:${s.color};"><i class="ph ${s.icon}"></i> ${s.label}</span>
        </div>
        <div class="pm2-supplier">${esc(o.supplierName)}</div>
        ${maritime() ? `
        <div class="pm2-chips">
          ${o.vesselName ? `<span class="pm2-chip pm2-vessel"><i class="ph ph-boat"></i> ${esc(o.vesselName)}</span>` : `<span class="pm2-chip"><i class="ph ph-warehouse"></i> Ambar stoğu</span>`}
          ${o.requisitionNo ? `<span class="pm2-chip"><i class="ph ph-clipboard-text"></i> ${esc(o.requisitionNo)}</span>` : ''}
          ${o.port ? `<span class="pm2-chip"><i class="ph ph-anchor"></i> ${esc(o.port)}</span>` : ''}
        </div>` : ''}
        <div class="pm2-meta">
          <span title="Sipariş tarihi"><i class="ph ph-calendar"></i> ${fmtDate(o.orderDate)}</span>
          <span title="Beklenen teslim" class="${late ? 'pm2-late' : ''}"><i class="ph ph-truck"></i> ${fmtDate(o.expectedDate)}${isOpen(o) && dLeft != null ? ` · ${late ? `${-dLeft} gün gecikti` : dLeft === 0 ? 'bugün' : `${dLeft} gün`}` : ''}</span>
          <span><i class="ph ph-package"></i> ${o.lines?.length || 0} kalem</span>
          <b class="pm2-total">${fmt(o.totalGross || 0, o.currency)}</b>
        </div>
        ${progress > 0 && progress < 100 ? `<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:${progress}%; background:${s.color};"></div></div><div class="pm2-progress-txt">Teslim alınan: %${progress}</div>` : ''}
      </div>`;
    }

    function render() {
      const list = orders.filter(matches);
      panel.innerHTML = `
        <div class="pm2-kpis">${kpis.map(([ic, c, v, l, d]) => `<div class="pm2-kpi" style="--k:${c}" title="${esc(d)}"><span class="pm2-kpi-ic"><i class="ph ${ic}"></i></span><div><b>${v}</b><small>${esc(l)}</small></div></div>`).join('')}</div>
        <div class="pm2-toolbar">
          <div class="input-field pm2-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
            <input type="search" class="input-element" id="pm-q" placeholder="${maritime() ? 'Sipariş no, tedarikçi, gemi, talep no veya liman ara…' : 'Sipariş no, tedarikçi veya fatura no ara…'}" value="${esc(st.q)}" /></div>
          ${maritime() && vessels.length ? `<div class="input-field pm2-vessel-filter"><span class="input-icon"><i class="ph ph-boat"></i></span>
            <select class="input-element" id="pm-vessel"><option value="">Tüm talepler</option><option value="__stock" ${st.vessel === '__stock' ? 'selected' : ''}>Ambar stoğu</option>${vessels.map(([id, n]) => `<option value="${esc(id)}" ${st.vessel === id ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>` : ''}
          <button class="btn btn-primary btn-sm" id="pm-new-order"><i class="ph ph-plus"></i> Yeni satın alma</button>
        </div>
        <div class="pm-filter-bar">
          ${['', 'late', 'draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'].map((s) => {
            const info = s === 'late' ? { label: 'Geciken', icon: 'ph-warning', color: '#D93A3A' } : s ? STATUS[s] : null;
            const count = s === 'late' ? orders.filter(isLate).length : s ? orders.filter((o) => o.status === s).length : orders.length;
            if (s && !count && st.status !== s) return '';
            return `<button class="pm-filter-btn ${st.status === s ? 'active' : ''}" data-status="${s}">${info ? `<i class="ph ${info.icon}" style="color:${info.color};"></i> ` : '<i class="ph ph-funnel"></i> '}<span>${info ? info.label : 'Tümü'}</span><span class="pm-filter-count">${count}</span></button>`;
          }).join('')}
        </div>
        <div class="pm2-list">${list.length ? list.map(card).join('') : `<div class="pm-empty"><i class="ph ph-package" style="font-size:48px; color:var(--text-secondary); opacity:.4;"></i><p style="color:var(--text-secondary); margin-top:12px;">Bu filtreye uyan sipariş yok</p></div>`}</div>`;

      const q = panel.querySelector('#pm-q');
      q.addEventListener('input', () => { st.q = q.value.trim().toLocaleLowerCase('tr'); const pos = q.selectionStart; render(); const n = panel.querySelector('#pm-q'); n.focus(); n.setSelectionRange(pos, pos); });
      panel.querySelector('#pm-vessel')?.addEventListener('change', (e) => { st.vessel = e.target.value; render(); });
      panel.querySelectorAll('.pm-filter-btn').forEach((b) => b.addEventListener('click', () => { st.status = b.dataset.status; render(); }));
      panel.querySelectorAll('.pm2-card').forEach((c) => {
        const open = () => { router.step({ tab: 'orders', po: c.dataset.id }); openOrderDetail(panel, c.dataset.id); };
        c.addEventListener('click', open);
        c.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      });
      panel.querySelector('#pm-new-order').addEventListener('click', () => { router.step({ tab: 'orders', new: 1 }); openNewOrderForm(panel, { fromList: true }); });
    }
    render();
  } catch (err) {
    panel.innerHTML = `<div style="color:var(--error); padding:20px;">Hata: ${esc(err.message)}</div>`;
  }
}

function calcProgress(order) {
  if (!order.lines || order.lines.length === 0) return 0;
  const total = order.lines.reduce((s, l) => s + (l.qty || 0), 0);
  const received = order.lines.reduce((s, l) => s + (l.receivedQty || 0), 0);
  return total > 0 ? Math.round((received / total) * 100) : 0;
}
function calcLineNet(line) {
  const gross = (line.qty || 0) * (line.unitPrice || 0);
  return gross - gross * ((line.discount || 0) / 100);
}

/* ═══════════════ 2. SİPARİŞ DETAYI ═══════════════ */
async function openOrderDetail(panel, orderId) {
  panel.innerHTML = spinner();
  const back = () => router.back();
  try {
    const res = await api.get(`/purchase-orders/${encodeURIComponent(orderId)}`);
    if (!res.success) throw new Error(res.message);
    const order = res.data;
    const st = STATUS[order.status] || STATUS.draft;
    const u = URGENCY[order.urgency] || URGENCY.routine;
    const canApprove = ['draft', 'pending'].includes(order.status);
    const canReceive = ['approved', 'ordered', 'partial'].includes(order.status)
      || (AppConfig.purchaseConfig?.requireApproval === false && ['draft', 'pending'].includes(order.status));
    const canCancel = !['received', 'cancelled'].includes(order.status);
    const progress = calcProgress(order);
    const late = isLate(order);
    // süreç adımları: talep → onay → sipariş → teslim
    const flow = [['draft', 'Talep / Taslak', 'ph-clipboard-text'], ['approved', 'Onay', 'ph-check-circle'], ['ordered', 'Sipariş', 'ph-paper-plane-tilt'], ['received', 'Mal Kabul', 'ph-package']];
    const rank = { draft: 0, pending: 0, approved: 1, ordered: 2, partial: 2.5, received: 3, cancelled: -1 }[order.status] ?? 0;
    const meta = [
      ...(maritime() ? [
        [order.vesselName ? 'ph-boat' : 'ph-warehouse', 'Talep kaynağı', order.vesselName ? `${order.vesselName} (gemi talebi)` : 'Ambar stoğu'],
        ['ph-clipboard-text', 'Talep no', order.requisitionNo || '-'],
        ['ph-anchor', 'Teslim yeri', order.port || '-'],
        [u.icon, 'Aciliyet', u.label],
      ] : []),
      ['ph-calendar', 'Sipariş tarihi', fmtDate(order.orderDate)],
      ['ph-truck', 'Beklenen teslim', `${fmtDate(order.expectedDate)}${late ? ` · ${-dayDiff(order.expectedDate)} gün gecikti` : ''}`],
      ['ph-warehouse', 'Teslim ambarı', order.warehouseName || '-'],
      ['ph-currency-circle-dollar', 'Para birimi', `${order.currency}${order.currency !== 'TRY' && order.exchangeRate ? ` · kur ${order.exchangeRate}` : ''}`],
      ...(order.invoiceNo ? [['ph-file-text', 'Fatura / irsaliye', order.invoiceNo]] : []),
      ...(order.receiptDate ? [['ph-calendar-check', 'Mal kabul tarihi', fmtDate(order.receiptDate)]] : []),
      ...(order.createdBy ? [['ph-user', 'Talebi açan', order.createdBy]] : []),
      ...(order.approvedBy ? [['ph-user-check', 'Onaylayan', `${order.approvedBy} · ${fmtDate(order.approvedAt)}`]] : []),
    ];

    panel.innerHTML = `
      <button class="btn btn-outline btn-sm" id="pm-back" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Geri</button>
      <div class="card pm2-detail-head ${late ? 'is-late' : ''}">
        <div>
          <div class="pm2-id" style="font-size:18px;"><i class="ph ph-file-text"></i> ${esc(order.id)}
            ${maritime() && order.urgency && order.urgency !== 'routine' ? `<span class="pm2-urg" style="--u:${u.color}"><i class="ph ${u.icon}"></i> ${u.label}</span>` : ''}</div>
          <div class="pm2-supplier" style="font-size:14px;">${esc(order.supplierName)}</div>
        </div>
        <div class="pm2-detail-total"><span class="pm-status-badge" style="background:${st.bg}; color:${st.color}; font-size:13px; padding:6px 14px;"><i class="ph ${st.icon}"></i> ${st.label}</span>
          <b>${fmt(order.totalGross, order.currency)}</b></div>
      </div>
      ${order.status === 'cancelled' ? `<div class="card fin-err" style="margin:12px 0;"><i class="ph ph-x-circle"></i> Bu sipariş iptal edildi${order.cancelReason ? `: ${esc(order.cancelReason)}` : '.'}</div>` : `
      <div class="pm2-flow">${flow.map(([k, l, ic], i) => `<div class="pm2-step ${rank >= i ? 'done' : ''} ${Math.ceil(rank) === i && rank % 1 ? 'half' : ''}"><span><i class="ph ${ic}"></i></span><small>${l}</small></div>`).join('<i class="pm2-flow-line"></i>')}</div>`}
      <div class="pm2-meta-grid">${meta.map(([ic, l, v]) => `<div class="pm2-meta-item"><i class="ph ${ic}"></i><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}
        ${order.notes ? `<div class="pm2-meta-item" style="grid-column:1/-1;"><i class="ph ph-note"></i><span>Not</span><b>${esc(order.notes)}</b></div>` : ''}</div>
      ${progress > 0 ? `<div style="margin:4px 0 16px;"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;"><span>Teslim alınan</span><b>%${progress}</b></div>
        <div class="pm-progress-bar pm-progress-bar-lg"><div class="pm-progress-fill" style="width:${progress}%; background:${st.color};"></div></div></div>` : ''}
      <div class="card" style="margin-bottom:16px; overflow:hidden;">
        <div class="pm2-card-title"><i class="ph ph-list-bullets"></i> Sipariş kalemleri <small>${order.lines.length} kalem</small></div>
        <div style="overflow-x:auto;">
          <table class="pm-table">
            <thead><tr><th>Malzeme</th><th class="right">Miktar</th><th class="right">Teslim</th><th class="right">B. Fiyat</th><th class="right">İsk.</th><th class="right">KDV</th><th class="right">Toplam</th></tr></thead>
            <tbody>${order.lines.map((l) => {
              const net = calcLineNet(l); const tax = net * ((l.taxRate || 0) / 100); const done = l.receivedQty >= l.qty;
              return `<tr><td><div style="font-weight:600; font-size:13px;">${esc(l.productName)}</div><div style="font-size:11px; color:var(--text-secondary);">${esc(l.productCode)}</div></td>
                <td class="right">${l.qty} ${esc(l.unit)}</td><td class="right"><span style="color:${done ? '#4CAF50' : '#FF9800'}; font-weight:600;">${l.receivedQty || 0} ${esc(l.unit)}</span></td>
                <td class="right">${fmt(l.unitPrice, order.currency)}</td><td class="right">%${l.discount || 0}</td><td class="right">%${l.taxRate || 0}</td>
                <td class="right" style="font-weight:700;">${fmt(net + tax, order.currency)}</td></tr>`;
            }).join('')}</tbody>
            <tfoot>
              <tr><td colspan="6" style="text-align:right; padding:10px 16px; font-weight:600;">Ara toplam</td><td class="right" style="font-weight:600;">${fmt(order.totalNet, order.currency)}</td></tr>
              <tr><td colspan="6" style="text-align:right; padding:6px 16px; color:var(--text-secondary);">KDV</td><td class="right" style="color:var(--text-secondary);">${fmt(order.totalTax, order.currency)}</td></tr>
              <tr style="background:var(--bg-elevated, #f8f9fa);"><td colspan="6" style="text-align:right; padding:12px 16px; font-weight:700; font-size:16px;">Genel toplam</td><td class="right" style="font-weight:700; font-size:16px; color:var(--primary);">${fmt(order.totalGross, order.currency)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="pm-action-row">
        ${canApprove ? '<button class="btn btn-primary" id="pm-approve-order"><i class="ph ph-check"></i> Onayla</button>' : ''}
        ${canReceive ? '<button class="btn btn-success" id="pm-receive-order"><i class="ph ph-package"></i> Mal kabul</button>' : ''}
        ${canCancel ? '<button class="btn btn-danger" id="pm-cancel-order"><i class="ph ph-x"></i> İptal et</button>' : ''}
      </div>
      <div id="pm-receive-form" style="display:none; margin-top:16px;"></div>`;

    panel.querySelector('#pm-back').addEventListener('click', back);
    const reload = () => openOrderDetail(panel, orderId);
    panel.querySelector('#pm-approve-order')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = btnSpin;
      const r = await api.post(`/purchase-orders/${encodeURIComponent(orderId)}/approve`, { approvedBy: Auth.getUser()?.name || 'Kullanıcı' }).catch((err) => ({ success: false, message: err.message }));
      showToast(r.message || (r.success ? 'Onaylandı' : 'Hata'), r.success ? 'success' : 'error');
      if (r.success) reload(); else { btn.disabled = false; btn.innerHTML = '<i class="ph ph-check"></i> Onayla'; }
    });
    panel.querySelector('#pm-cancel-order')?.addEventListener('click', async () => {
      if (!(await confirmDialog({ title: 'Sipariş iptal edilsin mi?', message: 'İptal edilen sipariş için mal kabul yapılamaz.', confirmLabel: 'Siparişi iptal et', danger: true }))) return;
      const r = await api.post(`/purchase-orders/${encodeURIComponent(orderId)}/cancel`, { reason: 'Kullanıcı tarafından iptal edildi' }).catch((err) => ({ success: false, message: err.message }));
      showToast(r.message || 'Hata', r.success ? 'success' : 'error');
      if (r.success) reload();
    });
    panel.querySelector('#pm-receive-order')?.addEventListener('click', () => {
      const f = panel.querySelector('#pm-receive-form');
      f.style.display = 'block';
      renderReceiveForm(f, order, reload);
      f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } catch (err) {
    panel.innerHTML = `<button class="btn btn-outline btn-sm" id="pm-back-err" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Siparişlere dön</button><div style="color:var(--error); padding:20px;">Hata: ${esc(err.message)}</div>`;
    panel.querySelector('#pm-back-err').addEventListener('click', back);
  }
}

/* ═══════════════ 3. MAL KABUL ═══════════════ */
function renderReceiveForm(container, order, onDone) {
  const cfg = AppConfig.purchaseConfig || {};
  const invoiceRequired = cfg.requireInvoiceForReceive !== false;
  const partialAllowed = cfg.allowPartialReceive !== false;
  container.innerHTML = `
    <div class="card" style="border-left:4px solid #4CAF50; padding:16px;">
      <div style="font-weight:700; font-size:15px; margin-bottom:14px; color:#4CAF50;"><i class="ph ph-package"></i> Mal kabul — ${esc(order.warehouseName || 'ambar')}</div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:13px; font-weight:600;">İrsaliye / fatura no${invoiceRequired ? ' *' : ''}</label>
        <input type="text" class="input-element" id="receive-invoice" placeholder="Örn: FTR-2026-0142" value="${esc(order.invoiceNo || '')}" />
      </div>
      <div style="font-weight:600; font-size:13px; margin-bottom:10px;">Teslim alınan miktarlar</div>
      ${partialAllowed ? '' : '<div style="font-size:12px; color:var(--warning); margin-bottom:10px;"><i class="ph ph-info"></i> Kısmi mal kabul kapalı: kalan miktarın tamamı teslim alınır.</div>'}
      ${order.lines.map((l) => {
        const remaining = (l.qty || 0) - (l.receivedQty || 0);
        return `<div class="pm-receive-line"><div class="pm-receive-line-info"><div style="font-weight:600; font-size:13px;">${esc(l.productName)}</div>
            <div style="font-size:11px; color:var(--text-secondary);">Sipariş: ${l.qty} ${esc(l.unit)} · Önceki teslim: ${l.receivedQty || 0} · Kalan: ${remaining}</div></div>
          <input type="number" class="input-element receive-qty-input" data-line-id="${esc(l.id)}" min="0" max="${remaining}" value="${remaining}" style="width:90px; text-align:center;" ${remaining <= 0 || !partialAllowed ? 'disabled' : ''} />
          <span style="font-size:12px; color:var(--text-secondary); min-width:40px;">${esc(l.unit)}</span></div>`;
      }).join('')}
      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="receive-cancel-btn"><i class="ph ph-x"></i> Vazgeç</button>
        <button class="btn btn-success" id="receive-submit-btn"><i class="ph ph-check"></i> Mal kabulü kaydet</button>
      </div>
    </div>`;
  container.querySelector('#receive-cancel-btn').addEventListener('click', () => { container.style.display = 'none'; });
  container.querySelector('#receive-submit-btn').addEventListener('click', async () => {
    const invoiceNo = container.querySelector('#receive-invoice').value.trim();
    if (invoiceRequired && !invoiceNo) return showToast('İrsaliye / fatura numarası zorunludur', 'warning');
    const receivedLines = [];
    container.querySelectorAll('.receive-qty-input').forEach((inp) => {
      const qty = partialAllowed ? (parseFloat(inp.value) || 0) : parseFloat(inp.max) || 0;
      if (qty > 0) receivedLines.push({ lineId: inp.dataset.lineId, qty });
    });
    if (!receivedLines.length) return showToast('En az bir kalem için miktar girin', 'warning');
    const btn = container.querySelector('#receive-submit-btn');
    btn.disabled = true; btn.innerHTML = `${btnSpin} Kaydediliyor...`;
    const r = await api.post(`/purchase-orders/${encodeURIComponent(order.id)}/receive`, { invoiceNo, receivedLines, allowUnapproved: cfg.requireApproval === false }).catch((err) => ({ success: false, message: err.message }));
    if (r.success) { showToast(r.message, 'success'); onDone(); } else {
      showToast(r.message || 'Hata oluştu', 'error');
      btn.disabled = false; btn.innerHTML = '<i class="ph ph-check"></i> Mal kabulü kaydet';
    }
  });
}

/* ═══════════════ 4. YENİ SİPARİŞ (GEMİ TALEBİ) ═══════════════ */
async function openNewOrderForm(panel, { fromList = false } = {}) {
  // listeden açıldıysa geri = listeye dön; doğrudan (arama / bağlantı) açıldıysa kayıttan sonra listeye geçilir
  const toList = () => (fromList ? router.back() : router.navigate('purchase-module?tab=orders'));
  panel.innerHTML = spinner();
  try {
    const [supRes, whRes, prdRes, rawRes, cusRes] = await Promise.all([
      api.get('/suppliers'), api.get('/warehouses'),
      api.get('/products').catch(() => ({})), api.get('/raw-materials').catch(() => ({})),
      maritime() ? api.get('/customers').catch(() => ({})) : Promise.resolve({}),
    ]);
    const suppliers = supRes.success ? supRes.data.filter((s) => s.status === 'active') : [];
    const warehouses = whRes.success ? whRes.data : [];
    const vessels = cusRes.success ? cusRes.data.filter((c) => /^GM/.test(String(c.id))) : [];
    // katalog: kod veya ad girilince birim ve fiyat dolar; mal kabulde stoğa işlenir
    const catalog = [
      ...(prdRes.success ? prdRes.data.map((p) => ({ code: p.code, name: p.name, unit: p.unit, price: p.price || 0, cat: p.category })) : []),
      ...(rawRes.success ? rawRes.data.map((r) => ({ code: r.code, name: r.name, unit: r.unit, price: 0 })) : []),
    ];
    const newLine = () => ({ id: 'l' + Date.now() + Math.floor(Math.random() * 99), productCode: '', productName: '', unit: 'Adet', qty: 1, unitPrice: 0, taxRate: 20, discount: 0 });
    let lines = [newLine()];
    let urgency = 'routine';

    panel.innerHTML = `
      <button class="btn btn-outline btn-sm" id="pm-back-new" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Siparişlere dön</button>
      ${maritime() ? `
      <div class="card pm2-form-card">
        <div class="pm2-card-title"><i class="ph ph-clipboard-text"></i> Talep bilgisi</div>
        <div class="pm-form-grid">
          <div class="form-group"><label>Talep kaynağı</label><select class="input-element" id="po-vessel"><option value="">Ambar stoğu (depoya alım)</option><optgroup label="Gemi talebi">${vessels.map((v) => `<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('')}</optgroup></select>
            <small class="pm2-hint">Mal teslim ambarına girer; gemi seçilirse sipariş o geminin talebi olarak izlenir.</small></div>
          <div class="form-group"><label>Talep no</label><input type="text" class="input-element" id="po-req" maxlength="40" placeholder="Örn: RQ-FRC-2026-041 / AMB-2026-012" /></div>
          <div class="form-group"><label>Teslim yeri</label><select class="input-element" id="po-port"><option value="">Teslim ambarı</option>${PORTS.map((p) => `<option>${esc(p)}</option>`).join('')}</select></div>
        </div>
        <label class="pm2-label">Aciliyet</label>
        <div class="sx-chips pm2-urgency">${Object.entries(URGENCY).map(([k, u]) => `<button type="button" class="sx-chip ${k === urgency ? 'on' : ''}" data-u="${k}" style="--u:${u.color}"><i class="ph ${u.icon}"></i> ${u.label}</button>`).join('')}</div>
      </div>` : ''}
      <div class="card pm2-form-card">
        <div class="pm2-card-title"><i class="ph ph-buildings"></i> Tedarikçi ve teslimat</div>
        <div class="pm-form-grid">
          <div class="form-group"><label>Tedarikçi *</label><select class="input-element" id="po-supplier"><option value="">Seçiniz...</option>
            ${suppliers.map((s) => `<option value="${esc(s.id)}" data-currency="${esc(s.currency)}" data-term="${esc(s.paymentTerm)}">${esc(s.name)}${s.category ? ` — ${esc(s.category)}` : ''}</option>`).join('')}</select>
            <small class="pm2-hint" id="po-sup-hint"></small></div>
          <div class="form-group"><label>Beklenen teslim *</label><input type="date" class="input-element" id="po-expected-date" value="${new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)}" /></div>
          <div class="form-group"><label>Teslim ambarı *</label><select class="input-element" id="po-warehouse"><option value="">Seçiniz...</option>${warehouses.map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}</select></div>
          <div class="form-group"><label>Para birimi</label><select class="input-element" id="po-currency"><option value="TRY">₺ TRY</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option></select></div>
        </div>
        <div class="form-group"><label>Not</label><input type="text" class="input-element" id="po-notes" maxlength="300" placeholder="${maritime() ? 'Örn: Gemi Aliağa demirinde, acente üzerinden lançla teslim' : 'İsteğe bağlı not'}" /></div>
      </div>
      <div class="card" style="margin-bottom:16px; overflow:hidden;">
        <div class="pm2-card-title" style="justify-content:space-between;"><span><i class="ph ph-list-bullets"></i> Sipariş kalemleri</span><button class="btn btn-outline btn-sm" id="add-po-line"><i class="ph ph-plus"></i> Kalem ekle</button></div>
        <datalist id="po-catalog-codes">${catalog.map((c) => `<option value="${esc(c.code)}">${esc(c.name)}</option>`).join('')}</datalist>
        <datalist id="po-catalog-names">${catalog.map((c) => `<option value="${esc(c.name)}">${esc(c.code)}${c.cat ? ` · ${esc(c.cat)}` : ''}</option>`).join('')}</datalist>
        <div class="pm2-line-head"><span>Kod</span><span>Malzeme</span><span>Birim</span><span>Miktar</span><span>B. fiyat</span><span>KDV %</span><span>İsk. %</span><span></span></div>
        <div id="po-lines-container" style="padding:4px 16px 12px;"></div>
        <div style="padding:12px 16px; border-top:1px solid var(--border); text-align:right;"><div id="po-totals"></div></div>
      </div>
      <div class="pm-action-row">
        <button class="btn btn-outline" id="po-save-draft"><i class="ph ph-floppy-disk"></i> Taslak kaydet</button>
        <button class="btn btn-primary" id="po-save-submit"><i class="ph ph-paper-plane-tilt"></i> Onaya gönder</button>
      </div>`;

    const $ = (s) => panel.querySelector(s);
    const linesBox = $('#po-lines-container');
    const renderLines = () => {
      linesBox.innerHTML = lines.map((l) => `
        <div class="pm-line-row" data-line-id="${l.id}">
          <div class="pm-line-fields">
            <input type="text" class="input-element" placeholder="Kod" value="${esc(l.productCode)}" data-field="productCode" list="po-catalog-codes" autocomplete="off" aria-label="Malzeme kodu" />
            <input type="text" class="input-element" placeholder="Malzeme adı *" value="${esc(l.productName)}" data-field="productName" list="po-catalog-names" autocomplete="off" style="flex:2;" aria-label="Malzeme adı" />
            <input type="text" class="input-element" placeholder="Birim" value="${esc(l.unit)}" data-field="unit" style="width:70px;" aria-label="Birim" />
            <input type="number" class="input-element" placeholder="Miktar" value="${l.qty}" min="0.01" step="0.01" data-field="qty" style="width:90px;" aria-label="Miktar" />
            <input type="number" class="input-element" placeholder="B.Fiyat" value="${l.unitPrice}" min="0" step="0.01" data-field="unitPrice" style="width:100px;" aria-label="Birim fiyat" />
            <input type="number" class="input-element" placeholder="KDV%" value="${l.taxRate}" min="0" max="100" data-field="taxRate" style="width:70px;" aria-label="KDV oranı" />
            <input type="number" class="input-element" placeholder="İsk.%" value="${l.discount}" min="0" max="100" data-field="discount" style="width:70px;" aria-label="İskonto" />
          </div>
          ${lines.length > 1 ? `<button class="pm-remove-line-btn" data-line-id="${l.id}" title="Kalemi sil"><i class="ph ph-x-circle"></i></button>` : ''}
        </div>`).join('');
      updateTotals();
    };
    const updateTotals = () => {
      let net = 0, tax = 0;
      lines.forEach((l) => { const n = calcLineNet(l); net += n; tax += n * ((l.taxRate || 0) / 100); });
      const c = $('#po-currency').value || 'TRY';
      $('#po-totals').innerHTML = `<div style="font-size:13px; color:var(--text-secondary);">Ara toplam: ${fmt(net, c)} · KDV: ${fmt(tax, c)}</div>
        <div style="font-size:16px; font-weight:700; color:var(--primary); margin-top:4px;">Genel toplam: ${fmt(net + tax, c)}</div>`;
    };
    linesBox.addEventListener('input', (e) => {
      const inp = e.target.closest('input[data-field]'); if (!inp) return;
      const row = inp.closest('.pm-line-row');
      const line = lines.find((l) => l.id === row.dataset.lineId); if (!line) return;
      const f = inp.dataset.field;
      line[f] = ['qty', 'unitPrice', 'taxRate', 'discount'].includes(f) ? parseFloat(inp.value) || 0 : inp.value;
      if (f === 'productCode' || f === 'productName') {
        const hit = catalog.find((c) => (f === 'productCode' ? c.code : c.name) === inp.value);
        if (hit) {
          Object.assign(line, { productCode: hit.code, productName: hit.name, unit: hit.unit });
          if (!line.unitPrice && hit.price) line.unitPrice = hit.price;
          row.querySelectorAll('input[data-field]').forEach((i2) => { if (i2 !== inp && line[i2.dataset.field] !== undefined) i2.value = line[i2.dataset.field]; });
        }
      }
      updateTotals();
    });
    linesBox.addEventListener('click', (e) => {
      const b = e.target.closest('.pm-remove-line-btn'); if (!b) return;
      lines = lines.filter((l) => l.id !== b.dataset.lineId); renderLines();
    });
    $('#add-po-line').addEventListener('click', () => { lines.push(newLine()); renderLines(); });
    $('#po-currency').addEventListener('change', updateTotals);
    $('#po-supplier').addEventListener('change', (e) => {
      const o = e.target.selectedOptions[0];
      if (o && o.dataset.currency) $('#po-currency').value = o.dataset.currency === 'TL' ? 'TRY' : o.dataset.currency;
      $('#po-sup-hint').textContent = o && o.value ? `${o.dataset.currency || 'TRY'} · ${Number(o.dataset.term) ? `${o.dataset.term} gün vade` : 'peşin'}` : '';
      updateTotals();
    });
    panel.querySelectorAll('.pm2-urgency .sx-chip').forEach((b) => b.addEventListener('click', () => {
      urgency = b.dataset.u;
      panel.querySelectorAll('.pm2-urgency .sx-chip').forEach((x) => x.classList.toggle('on', x === b));
      if (urgency === 'urgent') { const d = $('#po-expected-date'); if (d.value > new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10)) d.value = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10); }
    }));
    $('#pm-back-new').addEventListener('click', toList);

    async function saveOrder(status) {
      const supEl = $('#po-supplier'), whEl = $('#po-warehouse');
      const vesselId = $('#po-vessel')?.value || '';
      if (!supEl.value) return showToast('Tedarikçi seçin', 'warning');
      if (!whEl.value) return showToast('Teslim ambarını seçin', 'warning');
      const expectedDate = $('#po-expected-date').value;
      if (!expectedDate) return showToast('Beklenen teslim tarihini girin', 'warning');
      const valid = lines.filter((l) => l.productName && l.qty > 0);
      if (!valid.length) return showToast('En az bir malzeme kalemi ekleyin', 'warning');
      const btn = $(status === 'draft' ? '#po-save-draft' : '#po-save-submit');
      const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = btnSpin;
      const user = Auth.getUser();
      const r = await api.post('/purchase-orders', {
        supplierId: supEl.value, supplierName: suppliers.find((s) => s.id === supEl.value)?.name || '',
        orderDate: todayStr(), expectedDate, warehouseId: whEl.value, warehouseName: whEl.selectedOptions[0]?.text || '',
        currency: $('#po-currency').value || 'TRY', notes: $('#po-notes').value || '', status,
        vesselId, requisitionNo: $('#po-req')?.value || '', port: $('#po-port')?.value || '', urgency,
        lines: valid.map((l, i) => ({ ...l, id: 'L' + (i + 1), receivedQty: 0 })),
        createdBy: user?.name || 'Kullanıcı',
      }).catch((err) => ({ success: false, message: err.message }));
      if (r.success) { showToast(r.message, 'success'); toList(); } else {
        showToast(r.message || 'Hata oluştu', 'error'); btn.disabled = false; btn.innerHTML = label;
      }
    }
    $('#po-save-draft').addEventListener('click', () => saveOrder('draft'));
    $('#po-save-submit').addEventListener('click', () => saveOrder('pending'));
    renderLines();
  } catch (err) {
    panel.innerHTML = `<div style="color:var(--error); padding:20px;">Hata: ${esc(err.message)}</div>`;
  }
}

/* ═══════════════ 5. TEDARİKÇİLER (ayrı menüde de kullanılır) ═══════════════ */
export async function renderSuppliers(panel) {
  panel.innerHTML = spinner();
  try {
    const [res, ordRes] = await Promise.all([api.get('/suppliers'), api.get('/purchase-orders').catch(() => ({}))]);
    let suppliers = res.success ? res.data : [];
    const orders = ordRes.success ? ordRes.data : [];
    const st = { q: '', cat: '', status: 'active', showForm: false, editId: null };
    const openOf = (id) => orders.filter((o) => o.supplierId === id && isOpen(o));

    function render() {
      const cats = [...new Set(suppliers.map((s) => s.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
      const list = suppliers.filter((s) => (!st.status || s.status === st.status) && (!st.cat || s.category === st.cat)
        && (!st.q || [s.name, s.contactPerson, s.code, s.email, s.address].some((v) => String(v || '').toLocaleLowerCase('tr').includes(st.q))));
      const act = suppliers.filter((s) => s.status === 'active');
      panel.innerHTML = `
        <div class="pm2-kpis">
          <div class="pm2-kpi" style="--k:#2196F3"><span class="pm2-kpi-ic"><i class="ph ph-buildings"></i></span><div><b>${act.length}</b><small>Aktif tedarikçi</small></div></div>
          <div class="pm2-kpi" style="--k:#8B5CF6"><span class="pm2-kpi-ic"><i class="ph ph-tag"></i></span><div><b>${cats.length}</b><small>Kategori</small></div></div>
          <div class="pm2-kpi" style="--k:#E08A00"><span class="pm2-kpi-ic"><i class="ph ph-folder-open"></i></span><div><b>${orders.filter(isOpen).length}</b><small>Açık sipariş</small></div></div>
          <div class="pm2-kpi" style="--k:#0E7A74"><span class="pm2-kpi-ic"><i class="ph ph-globe-hemisphere-west"></i></span><div><b>${act.filter((s) => s.currency && !['TRY', 'TL'].includes(s.currency)).length}</b><small>Yurt dışı (döviz)</small></div></div>
        </div>
        <div class="pm2-toolbar">
          <div class="input-field pm2-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input type="search" class="input-element" id="sup-search" placeholder="Tedarikçi, yetkili, kod veya şehir ara…" value="${esc(st.q)}" /></div>
          <div class="input-field pm2-vessel-filter"><span class="input-icon"><i class="ph ph-funnel"></i></span><select class="input-element" id="sup-status">
            <option value="active" ${st.status === 'active' ? 'selected' : ''}>Aktif</option><option value="passive" ${st.status === 'passive' ? 'selected' : ''}>Pasif</option><option value="" ${!st.status ? 'selected' : ''}>Tümü</option></select></div>
          <button class="btn btn-primary btn-sm" id="sup-add-btn"><i class="ph ph-plus"></i> Yeni tedarikçi</button>
        </div>
        <div class="pm-filter-bar"><button class="pm-filter-btn ${!st.cat ? 'active' : ''}" data-cat=""><i class="ph ph-squares-four"></i> <span>Tüm kategoriler</span></button>
          ${cats.map((c) => `<button class="pm-filter-btn ${st.cat === c ? 'active' : ''}" data-cat="${esc(c)}"><span>${esc(c)}</span><span class="pm-filter-count">${suppliers.filter((s) => s.category === c && (!st.status || s.status === st.status)).length}</span></button>`).join('')}</div>
        ${st.showForm ? renderSupplierForm(st.editId, suppliers) : ''}
        ${list.length ? `<div class="pm2-sup-grid">${list.map((s, i) => {
          const op = openOf(s.id);
          return `<div class="pm-supplier-card pm2-sup animate-fade-in-up stagger-${Math.min(i + 1, 5)}" data-id="${esc(s.id)}">
            <div class="pm2-sup-head">
              <div class="pm-supplier-avatar" style="background:${s.status === 'active' ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : '#9E9E9E18'}; color:${s.status === 'active' ? 'var(--primary)' : '#9E9E9E'};">${esc(s.name.charAt(0).toLocaleUpperCase('tr'))}</div>
              <div style="min-width:0; flex:1;"><div class="pm-supplier-name">${esc(s.name)}</div><div class="pm2-sup-sub">${esc(s.code || '')}${s.category ? ` · ${esc(s.category)}` : ''}</div></div>
              <button class="icon-btn sup-edit-btn" data-id="${esc(s.id)}" title="Düzenle" aria-label="Düzenle"><i class="ph ph-pencil"></i></button>
            </div>
            <div class="pm2-sup-lines">
              ${s.contactPerson ? `<span><i class="ph ph-user"></i> ${esc(s.contactPerson)}</span>` : ''}
              ${s.phone ? `<span><i class="ph ph-phone"></i> ${esc(s.phone)}</span>` : ''}
              ${s.email ? `<span><i class="ph ph-envelope-simple"></i> ${esc(s.email)}</span>` : ''}
              ${s.address ? `<span><i class="ph ph-map-pin"></i> ${esc(s.address)}</span>` : ''}
            </div>
            <div class="pm2-sup-foot">
              <span class="pm2-chip"><i class="ph ph-currency-circle-dollar"></i> ${esc(s.currency || 'TRY')}</span>
              <span class="pm2-chip"><i class="ph ph-calendar-check"></i> ${Number(s.paymentTerm) ? `${s.paymentTerm} gün vade` : 'Peşin'}</span>
              <span class="pm2-chip"><i class="ph ph-list-numbers"></i> ${s.totalOrders || 0} sipariş</span>
              ${op.length ? `<span class="pm2-chip pm2-vessel"><i class="ph ph-folder-open"></i> ${op.length} açık</span>` : ''}
              ${s.status !== 'active' ? '<span class="pm2-chip" style="color:#9E9E9E;"><i class="ph ph-archive"></i> Pasif</span>' : ''}
            </div>
          </div>`;
        }).join('')}</div>` : `<div class="pm-empty"><i class="ph ph-buildings" style="font-size:48px; opacity:.3;"></i><p style="color:var(--text-secondary); margin-top:12px;">Tedarikçi bulunamadı</p></div>`}`;

      const q = panel.querySelector('#sup-search');
      q.addEventListener('input', () => { st.q = q.value.trim().toLocaleLowerCase('tr'); const p = q.selectionStart; render(); const n = panel.querySelector('#sup-search'); n.focus(); n.setSelectionRange(p, p); });
      panel.querySelector('#sup-status').addEventListener('change', (e) => { st.status = e.target.value; render(); });
      panel.querySelectorAll('.pm-filter-btn[data-cat]').forEach((b) => b.addEventListener('click', () => { st.cat = b.dataset.cat; render(); }));
      panel.querySelector('#sup-add-btn').addEventListener('click', () => { st.showForm = !st.showForm; st.editId = null; render(); if (st.showForm) panel.querySelector('#sup-form-card')?.scrollIntoView({ behavior: 'smooth' }); });
      panel.querySelectorAll('.sup-edit-btn').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); st.editId = b.dataset.id; st.showForm = true; render(); panel.querySelector('#sup-form-card')?.scrollIntoView({ behavior: 'smooth' }); }));
      if (st.showForm) attachSupplierFormEvents(panel, st.editId, suppliers, async (saved) => {
        if (saved) { const r = await api.get('/suppliers'); if (r.success) suppliers = r.data; }
        st.showForm = false; st.editId = null; render();
      });
    }
    render();
  } catch (err) {
    panel.innerHTML = `<div style="color:var(--error); padding:20px;">Hata: ${esc(err.message)}</div>`;
  }
}

function renderSupplierForm(editId, suppliers) {
  const s = editId ? suppliers.find((x) => x.id === editId) : null;
  const cats = supplierCats();
  const cur = s?.category && !cats.includes(s.category) ? [s.category, ...cats] : cats;
  return `
    <div class="card pm-form-card" id="sup-form-card" style="margin-bottom:16px; padding:20px; border-left:4px solid var(--primary);">
      <h3 style="margin:0 0 16px; font-size:15px; color:var(--primary);"><i class="ph ph-${editId ? 'pencil' : 'plus-circle'}"></i> ${editId ? 'Tedarikçiyi düzenle' : 'Yeni tedarikçi'}</h3>
      <div class="pm-form-grid">
        <div class="form-group"><label>Firma adı *</label><input type="text" class="input-element" id="sup-name" value="${esc(s?.name || '')}" placeholder="Firma ünvanı" /></div>
        <div class="form-group"><label>Yetkili kişi</label><input type="text" class="input-element" id="sup-contact" value="${esc(s?.contactPerson || '')}" placeholder="Ad Soyad" /></div>
        <div class="form-group"><label>Telefon</label><input type="text" class="input-element" id="sup-phone" value="${esc(s?.phone || '')}" placeholder="+90 5XX XXX XX XX" /></div>
        <div class="form-group"><label>E-posta</label><input type="email" class="input-element" id="sup-email" value="${esc(s?.email || '')}" placeholder="ornek@firma.com" /></div>
        <div class="form-group"><label>Vergi no</label><input type="text" class="input-element" id="sup-taxno" value="${esc(s?.taxNo || '')}" /></div>
        <div class="form-group"><label>Kategori</label><select class="input-element" id="sup-category">${cur.map((c) => `<option ${(s?.category || 'Diğer') === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="form-group"><label>Para birimi</label><select class="input-element" id="sup-currency">${['TRY', 'USD', 'EUR'].map((c) => `<option ${(s?.currency || 'TRY') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label>Ödeme vadesi</label><select class="input-element" id="sup-term">${[0, 7, 15, 30, 45, 60, 90].map((d) => `<option value="${d}" ${Number(s?.paymentTerm ?? 30) === d ? 'selected' : ''}>${d === 0 ? 'Peşin' : d + ' gün'}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label>Adres</label><input type="text" class="input-element" id="sup-address" value="${esc(s?.address || '')}" placeholder="İlçe, şehir / ülke" /></div>
      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="sup-form-cancel"><i class="ph ph-x"></i> Vazgeç</button>
        ${editId ? `<button class="btn btn-outline" id="sup-form-passive" style="margin-right:auto; color:var(--error); border-color:var(--error);"><i class="ph ph-archive"></i> ${s?.status === 'passive' ? 'Aktife al' : 'Pasife al'}</button>` : ''}
        <button class="btn btn-primary" id="sup-form-save"><i class="ph ph-floppy-disk"></i> Kaydet</button>
      </div>
    </div>`;
}

function attachSupplierFormEvents(panel, editId, suppliers, onDone) {
  const current = suppliers.find((s) => s.id === editId) || {};
  panel.querySelector('#sup-form-cancel').addEventListener('click', () => onDone(false));
  panel.querySelector('#sup-form-passive')?.addEventListener('click', async () => {
    const toPassive = current.status !== 'passive';
    if (toPassive && !(await confirmDialog({ title: 'Tedarikçi pasife alınsın mı?', message: 'Pasif tedarikçi yeni siparişlerde görünmez; geçmiş siparişleri etkilenmez.', confirmLabel: 'Pasife al', danger: true }))) return;
    try {
      const r = await api.put(`/suppliers/${encodeURIComponent(editId)}`, { ...current, status: toPassive ? 'passive' : 'active' });
      if (r.success) { showToast(toPassive ? 'Tedarikçi pasife alındı' : 'Tedarikçi aktife alındı', 'success'); onDone(true); } else showToast(r.message || 'Hata', 'error');
    } catch (err) { showToast(err.message, 'error'); }
  });
  panel.querySelector('#sup-form-save').addEventListener('click', async () => {
    const v = (id) => panel.querySelector(id)?.value.trim();
    const name = v('#sup-name');
    if (!name) return showToast('Firma adı zorunludur', 'warning');
    const payload = { name, contactPerson: v('#sup-contact'), phone: v('#sup-phone'), email: v('#sup-email'), taxNo: v('#sup-taxno'), category: v('#sup-category'),
      currency: v('#sup-currency'), paymentTerm: parseInt(v('#sup-term'), 10) || 0, address: v('#sup-address'), status: current.status || 'active' };
    const btn = panel.querySelector('#sup-form-save');
    btn.disabled = true; btn.innerHTML = btnSpin;
    let r;
    try { r = editId ? await api.put(`/suppliers/${encodeURIComponent(editId)}`, payload) : await api.post('/suppliers', payload); } catch (err) { r = { success: false, message: err.message }; }
    if (r.success) { showToast(r.message || 'Kaydedildi', 'success'); onDone(true); } else {
      showToast(r.message || 'Hata', 'error'); btn.disabled = false; btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Kaydet';
    }
  });
}

/* ═══════════════ 6. ÖZET ═══════════════ */
async function renderSummary(panel) {
  panel.innerHTML = spinner();
  try {
    const [ordRes, supRes] = await Promise.all([api.get('/purchase-orders'), api.get('/suppliers')]);
    const orders = ordRes.success ? ordRes.data : [];
    const suppliers = supRes.success ? supRes.data : [];
    const live = orders.filter((o) => o.status !== 'cancelled');
    const total = live.reduce((s, o) => s + inTry(o), 0);
    const ytd = live.filter((o) => String(o.orderDate).slice(0, 4) === todayStr().slice(0, 4)).reduce((s, o) => s + inTry(o), 0);
    const group = (keyFn) => Object.entries(live.reduce((m, o) => { const k = keyFn(o); if (k) m[k] = (m[k] || 0) + inTry(o); return m; }, {})).sort((a, b) => b[1] - a[1]);
    const catOf = Object.fromEntries(suppliers.map((s) => [s.id, s.category]));
    const bars = (rows, color) => {
      const max = rows[0]?.[1] || 1;
      return rows.length ? rows.slice(0, 6).map(([n, a]) => `<div class="pm2-bar"><div class="pm2-bar-top"><span>${esc(n)}</span><b>${fmt(a)}</b></div>
        <div class="pm-progress-bar"><div class="pm-progress-fill" style="width:${Math.max(3, Math.round((a / max) * 100))}%; background:${color};"></div></div></div>`).join('') : '<div style="color:var(--text-secondary); text-align:center; padding:20px;">Veri yok</div>';
    };
    // aylık alım (son 6 ay, TL karşılığı)
    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push(d.toISOString().slice(0, 7)); }
    const perMonth = months.map((m) => live.filter((o) => String(o.orderDate).slice(0, 7) === m).reduce((s, o) => s + inTry(o), 0));
    const maxM = Math.max(1, ...perMonth);
    const late = orders.filter(isLate);

    panel.innerHTML = `
      <div class="pm2-kpis">
        <div class="pm2-kpi" style="--k:var(--primary)"><span class="pm2-kpi-ic"><i class="ph ph-coins"></i></span><div><b>${fmt(ytd)}</b><small>Bu yıl alım (TL karşılığı)</small></div></div>
        <div class="pm2-kpi" style="--k:#2196F3"><span class="pm2-kpi-ic"><i class="ph ph-list-numbers"></i></span><div><b>${live.length}</b><small>Sipariş (iptal hariç)</small></div></div>
        <div class="pm2-kpi" style="--k:#4CAF50"><span class="pm2-kpi-ic"><i class="ph ph-check-fat"></i></span><div><b>${orders.filter((o) => o.status === 'received').length}</b><small>Teslim alındı</small></div></div>
        <div class="pm2-kpi" style="--k:#D93A3A"><span class="pm2-kpi-ic"><i class="ph ph-warning"></i></span><div><b>${late.length}</b><small>Geciken teslimat</small></div></div>
      </div>
      <div class="pm2-sum-grid">
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-chart-bar"></i> Aylık alım <small>TL karşılığı, son 6 ay</small></div>
          <div class="pm2-cols">${months.map((m, i) => `<div class="pm2-col" title="${fmt(perMonth[i])}"><div class="pm2-col-bar" style="height:${Math.max(2, Math.round((perMonth[i] / maxM) * 100))}%"></div><small>${new Date(`${m}-01T00:00:00`).toLocaleDateString('tr-TR', { month: 'short' })}</small></div>`).join('')}</div></div>
        ${maritime() ? `<div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-boat"></i> Gemi bazlı alım</div>${bars(group((o) => o.vesselName), 'var(--primary)')}</div>` : ''}
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-tag"></i> Malzeme kategorisi</div>${bars(group((o) => catOf[o.supplierId]), '#0E7A74')}</div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-buildings"></i> Tedarikçi bazlı alım</div>${bars(group((o) => o.supplierName), '#8B5CF6')}</div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-chart-pie"></i> Sipariş durumu</div>
          <div class="pm-status-grid">${Object.entries(STATUS).map(([k, s]) => `<div class="pm-status-item"><span class="pm-status-dot" style="background:${s.color};"></span><span style="flex:1; font-size:13px;">${s.label}</span><b>${orders.filter((o) => o.status === k).length}</b></div>`).join('')}</div></div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-warning"></i> Geciken teslimatlar</div>
          ${late.length ? late.map((o) => `<a class="pm2-late-row" href="#/purchase-module?tab=orders&po=${encodeURIComponent(o.id)}"><b>${esc(o.id)}</b><span>${esc(o.supplierName)}${o.vesselName ? ` · ${esc(o.vesselName)}` : ''}</span><em>${-dayDiff(o.expectedDate)} gün</em></a>`).join('') : '<div style="color:var(--text-secondary); padding:12px 0;"><i class="ph ph-check-circle" style="color:#4CAF50;"></i> Geciken teslimat yok</div>'}</div>
      </div>
      <div class="pm2-note"><i class="ph ph-info"></i> Döviz siparişleri sipariş kuruyla TL karşılığına çevrilerek toplanır. Toplam (iptal hariç): <b>${fmt(total)}</b></div>`;
  } catch (err) {
    panel.innerHTML = `<div style="color:var(--error); padding:20px;">Hata: ${esc(err.message)}</div>`;
  }
}
