/** Siparişler: sipariş edilen / giden (ERP satış) miktar, üretim ilerlemesi, malzeme yeterliliği, süreç zinciri */
import { api, esc, fmt, fmtDate, fmtDateFull, fmtDateTime, state, can, bar, dualBar, dueLabel, statusBadge, pill, empty, errorBox, loading, sheet, guard, field, options, showToast, today, addDays,
  ORDER_STATE, PRIORITY, STATUS, exportTable, exportButton } from './common.js';
import { confirmDialog } from '../../components/dialog.js';

const FILTERS = [['open', 'Açık'], ['late', 'Geciken'], ['shipped', 'Sevk edildi'], ['all', 'Tümü']];
let filter = 'open';

export async function render(root, ctx) {
  root.innerHTML = loading();
  let list;
  try { list = (await api.get('/jt/orders')).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  const pass = { open: (o) => !['shipped', 'cancelled'].includes(o.state), late: (o) => o.overdue || o.lateJobs > 0, shipped: (o) => o.state === 'shipped', all: () => true }[filter];
  const shown = list.filter(pass);
  const total = shown.reduce((t, o) => ({ ordered: t.ordered + o.orderedQty, shipped: t.shipped + o.shippedQty }), { ordered: 0, shipped: 0 });

  root.innerHTML = `
    <div class="jt-toolbar">
      <div class="jt-chips">${FILTERS.map(([id, l]) => `<button class="${filter === id ? 'active' : ''}" data-filter="${id}">${l}</button>`).join('')}</div>
      <span class="jt-sum"><b>${fmt(total.ordered)}</b> sipariş · <b>${fmt(total.shipped)}</b> giden</span>
      ${exportButton('jt-export-orders')}
      ${can('jt.orders.manage') ? '<button class="btn btn-primary jt-add" id="jt-new-order"><i class="ph ph-plus"></i> Yeni sipariş</button>' : ''}
    </div>
    <div class="jt-table-wrap">
      <table class="jt-table">
        <thead><tr><th>Sipariş</th><th>Müşteri / proje</th><th>Termin</th><th>Sipariş → giden</th><th>Üretim</th><th>Durum</th></tr></thead>
        <tbody>
          ${shown.map((o) => `
            <tr data-order="${esc(o.id)}" tabindex="0" class="${o.overdue ? 'late' : ''}">
              <td data-label="Sipariş"><b>${esc(o.orderNo)}</b><small>${o.lines.length} kalem</small></td>
              <td data-label="Müşteri"><b>${esc(o.customerName)}</b><small>${esc(o.projectCode || '')} ${esc(o.projectName || '')}</small></td>
              <td data-label="Termin">${dueLabel(o.dueDate, o.state === 'shipped')}</td>
              <td data-label="Giden">${dualBar(o.orderedQty, o.shippedQty)}</td>
              <td data-label="Üretim"><div class="jt-mini">${bar(o.progress, o.lateJobs ? 'warn' : '')}<small>%${o.progress}${o.lateJobs ? ` · <em class="bad">${o.lateJobs} geç iş</em>` : ''}</small></div></td>
              <td data-label="Durum">${pill(ORDER_STATE[o.state] || o.state, o.state === 'shipped' ? 'done' : o.overdue ? 'late' : o.state === 'in_production' ? 'progress' : 'planned')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${shown.length ? '' : empty('ph-package', 'Bu filtrede sipariş yok.')}
    </div>`;

  root.onclick = (e) => {
    const f = e.target.closest('[data-filter]'); if (f) { filter = f.dataset.filter; return render(root, ctx); }
    if (e.target.closest('#jt-export-orders')) return exportTable('Siparisler', [
      ['Sipariş no', 'orderNo'], ['Müşteri', 'customerName'], ['Proje', 'projectCode'], ['Sipariş tarihi', 'orderDate'],
      ['Termin', 'dueDate'], ['Durum', (o) => ORDER_STATE[o.state] || o.state], ['Sipariş miktarı', (o) => o.orderedQty],
      ['Giden miktar', (o) => o.shippedQty], ['Sevk %', (o) => o.shippedPct], ['Üretim %', (o) => o.progress],
      ['Geciken iş', (o) => o.lateJobs], ['Gecikme (gün)', (o) => o.overdueDays || 0], ['Tutar', (o) => Math.round(o.totalValue || 0)],
    ], shown);
    if (e.target.closest('#jt-new-order')) return orderForm(ctx, () => render(root, ctx));
    const o = e.target.closest('[data-order]'); if (o) openOrder(o.dataset.order, ctx, () => render(root, ctx));
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const o = e.target.closest('[data-order]'); if (o) openOrder(o.dataset.order, ctx, () => render(root, ctx)); } };
}

export async function openOrder(id, ctx, onChange) {
  const s = sheet({ title: 'Sipariş', body: loading(), wide: true });
  let o;
  try { o = (await api.get(`/jt/orders/${encodeURIComponent(id)}`)).data; } catch (e) { s.body.innerHTML = errorBox(e); return; }
  s.setTitle(`${o.orderNo} · ${o.customerName}`);
  const remaining = Math.max(0, o.orderedQty - o.shippedQty);
  s.body.innerHTML = `
    <div class="jt-detail-head">
      <div>${pill(ORDER_STATE[o.state] || o.state, o.state === 'shipped' ? 'done' : o.overdue ? 'late' : 'progress')} ${pill(PRIORITY[o.priority] || o.priority)} ${o.projectName ? `<span class="code">${esc(o.projectCode)} · ${esc(o.projectName)}</span>` : ''}</div>
      <p>Sipariş ${fmtDateFull(o.orderDate)} · Termin ${dueLabel(o.dueDate, o.state === 'shipped')}</p>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş edilen</small><b>${fmt(o.orderedQty)}</b></div>
      <div><small>Giden (ERP)</small><b>${fmt(o.shippedQty)}</b></div>
      <div><small>Kalan</small><b class="${remaining && o.overdue ? 'bad' : ''}">${fmt(remaining)}</b></div>
      <div><small>Üretim ilerlemesi</small><b>%${o.progress}</b></div>
    </div>
    ${o.lines.map((l) => {
      const jobs = o.jobs.filter((j) => j.lineId === l.id);
      return `<section class="jt-line">
        <header>
          <div><b>${esc(l.productName)}</b><small>${esc(l.productCode || '')} · ERP stoğu: ${fmt(l.stock)} ${esc(l.unit || '')}</small></div>
          <div class="jt-line-q"><span><small>Sipariş</small><b>${fmt(l.qty)}</b></span><span><small>Giden</small><b>${fmt(l.shippedQty)}</b></span><span><small>Kalan</small><b>${fmt(l.remaining)}</b></span></div>
        </header>
        ${dualBar(l.qty, l.shippedQty)}
        ${l.materialShort ? `<div class="jt-warnbox"><i class="ph ph-warning"></i> Hammadde yetersiz olabilir: ${l.materials.filter((m) => m.short).map((m) => `${esc(m.name)} (gereken ${fmt(m.required)}, stok ${fmt(m.stock)} ${esc(m.unit)})`).join('; ')}</div>` : ''}
        <div class="jt-chain">${jobs.length ? jobs.map((j) => `
          <button class="jt-step ${j.overdue ? 'late' : STATUS[j.status]?.cls || ''}" data-job="${esc(j.id)}" title="${esc(j.title)}">
            <i class="ph ${esc(j.processIcon || 'ph-gear')}"></i><b>${esc(j.processName.split(' ')[0])}</b><small>${j.status === 'done' ? '✓' : `%${j.progress}`}</small><em>${esc((j.assigneeName || 'Atanmamış').split(' ')[0])}</em>
          </button>`).join('') : '<small>Bu kalem için iş planlanmamış.</small>'}
        </div>
        ${can('jt.jobs.create') && o.state !== 'cancelled' ? `<button class="jt-link" data-newjob="${esc(l.id)}"><i class="ph ph-plus"></i> Bu kaleme iş ekle</button>` : ''}
      </section>`;
    }).join('')}
    <h4 class="jt-h">Sevkiyatlar (ERP satış kayıtları)</h4>
    ${o.shipments.length ? `<table class="jt-table compact"><thead><tr><th>Tarih</th><th>Ürün</th><th class="r">Adet</th></tr></thead><tbody>${o.shipments.map((x) => `<tr><td>${fmtDateTime(x.date)}</td><td>${esc(x.productName)}</td><td class="r">${fmt(x.quantity)}</td></tr>`).join('')}</tbody></table>` : '<small class="muted">Henüz sevkiyat yok. ERP’de Satış ekranından bu siparişe bağlı çıkış yapıldığında burada görünür.</small>'}
    ${o.notes ? `<h4 class="jt-h">Not</h4><p>${esc(o.notes)}</p>` : ''}
    ${can('jt.orders.manage') && o.state !== 'cancelled' && o.state !== 'shipped' ? '<div class="jt-actions"><button class="btn btn-secondary danger" id="jt-cancel-order"><i class="ph ph-prohibit"></i> Siparişi iptal et</button></div>' : ''}`;

  s.body.onclick = (e) => {
    const j = e.target.closest('[data-job]'); if (j) return ctx.openJob(j.dataset.job);
    const nj = e.target.closest('[data-newjob]'); if (nj) { s.close(); return ctx.newJob({ orderId: o.id, lineId: nj.dataset.newjob }, onChange); }
    const c = e.target.closest('#jt-cancel-order');
    if (c) guard(c, async () => {
      const yes = await confirmDialog({ title: `${o.orderNo} iptal edilsin mi?`, message: 'Siparişin tamamlanmamış işleri de iptal olur. Bu işlem geri alınamaz.', confirmLabel: 'Siparişi iptal et', danger: true });
      if (!yes) return;
      await api.post(`/jt/orders/${encodeURIComponent(o.id)}/cancel`, {});
      showToast('Sipariş iptal edildi', 'success'); s.close(); onChange?.();
    });
  };
}

export async function orderForm(ctx, onDone) {
  let projects = [];
  try { projects = (await api.get('/jt/projects')).data.filter((p) => ['active', 'planned'].includes(p.status)); } catch (_e) { /* proje seçimi isteğe bağlı */ }
  const prods = state.meta.products;
  const lineHtml = () => `<div class="jt-line-edit"><select name="pid">${options(prods.map((p) => [p.id, `${p.code} — ${p.name}`]), '', 'Ürün seçin')}</select><input type="number" name="qty" min="1" step="1" placeholder="Adet" /><button type="button" class="jt-x" data-rm aria-label="Kalemi sil"><i class="ph ph-trash"></i></button></div>`;
  const s = sheet({ title: 'Yeni sipariş', body: `
    <form class="jt-form" id="of">
      <div class="jt-2">
        ${field('Müşteri', `<select name="customerId" required>${options(state.meta.customers.map((c) => [c.id, c.name]), '', 'Seçin')}</select>`)}
        ${field('Proje', `<select name="projectId">${options(projects.map((p) => [p.id, `${p.code} — ${p.name}`]), '', 'Projesiz')}</select>`)}
      </div>
      <div class="jt-2">
        ${field('Sipariş tarihi', `<input type="date" name="orderDate" required value="${today()}" />`)}
        ${field('Termin', `<input type="date" name="dueDate" required value="${addDays(today(), 30)}" />`)}
      </div>
      ${field('Öncelik', `<select name="priority">${options(Object.entries(PRIORITY), 'medium')}</select>`)}
      <div class="jt-lines"><span class="jt-lbl">Kalemler</span><div id="of-lines">${lineHtml()}</div><button type="button" class="jt-link" id="of-add"><i class="ph ph-plus"></i> Kalem ekle</button></div>
      ${field('Not', '<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Siparişi oluştur</button></div>
    </form>` });
  const linesBox = s.body.querySelector('#of-lines');
  s.body.querySelector('[data-close]').onclick = s.close;
  s.body.querySelector('#of-add').onclick = () => linesBox.insertAdjacentHTML('beforeend', lineHtml());
  linesBox.onclick = (e) => { const r = e.target.closest('[data-rm]'); if (r && linesBox.children.length > 1) r.parentElement.remove(); };
  s.body.querySelector('#of').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const lines = [...linesBox.children].map((row) => ({ productId: row.querySelector('[name=pid]').value, qty: Number(row.querySelector('[name=qty]').value) })).filter((l) => l.productId && l.qty > 0);
    if (!lines.length) return showToast('En az bir ürün ve adet girin', 'warning');
    guard(e.submitter, async () => {
      const r = await api.post('/jt/orders', { ...f, lines });
      showToast(`${r.data.orderNo} oluşturuldu`, 'success'); s.close(); onDone?.();
    });
  };
}
