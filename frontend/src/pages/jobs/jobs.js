/** İşler: süreçlere göre iş listesi, ilerleme girişi, durum değişikliği, atama ve zaman çizelgesi */
import { api, esc, fmt, fmtDate, fmtDateFull, fmtDateTime, state, can, bar, statusBadge, person, pill, empty, errorBox, loading, sheet, guard, field, options, showToast, today, addDays,
  STATUS, PRIORITY, exportTable, exportButton } from './common.js';
import { confirmDialog, promptDialog } from '../../components/dialog.js';

const filt = { status: 'open', processId: '', projectId: '', mine: false, late: false, q: '' };
export const setFilter = (o) => Object.assign(filt, { status: 'open', processId: '', projectId: '', mine: false, late: false, q: '' }, o);

export async function render(root, ctx) {
  root.innerHTML = loading();
  const qs = new URLSearchParams();
  if (filt.status === 'open') qs.set('open', '1'); else if (filt.status !== 'all') qs.set('status', filt.status);
  if (filt.processId) qs.set('processId', filt.processId);
  if (filt.projectId) qs.set('projectId', filt.projectId);
  if (filt.mine) qs.set('assigneeId', 'me');
  if (filt.late) qs.set('late', '1');
  let jobs;
  try { jobs = (await api.get(`/jt/jobs?${qs}`)).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  const q = filt.q.trim().toLocaleLowerCase('tr');
  if (q) jobs = jobs.filter((j) => `${j.jobNo} ${j.title} ${j.assigneeName || ''} ${j.orderNo || ''} ${j.productName || ''}`.toLocaleLowerCase('tr').includes(q));
  const projects = [...new Map(jobs.map((j) => [j.projectId, j.projectCode])).entries()].filter(([id]) => id);
  const procs = state.meta.processes;

  root.innerHTML = `
    <div class="jt-toolbar wrap">
      <div class="jt-chips">${[['open', 'Açık'], ['in_progress', 'Devam eden'], ['blocked', 'Engelli'], ['done', 'Biten'], ['all', 'Tümü']].map(([id, l]) => `<button class="${filt.status === id ? 'active' : ''}" data-status="${id}">${l}</button>`).join('')}</div>
      <label class="jt-toggle"><input type="checkbox" id="f-late" ${filt.late ? 'checked' : ''}/> Gecikenler</label>
      <label class="jt-toggle"><input type="checkbox" id="f-mine" ${filt.mine ? 'checked' : ''}/> Bana atananlar</label>
      <select id="f-proc" aria-label="Süreç">${options(procs.map((p) => [p.id, p.name]), filt.processId, 'Tüm süreçler')}</select>
      <input type="search" id="f-q" placeholder="İş, kişi, sipariş ara…" value="${esc(filt.q)}" />
      ${exportButton('jt-export')}
      ${can('jt.jobs.create') ? '<button class="btn btn-primary jt-add" id="jt-new-job"><i class="ph ph-plus"></i> Yeni iş</button>' : ''}
    </div>
    <div class="jt-count">${jobs.length} iş</div>
    <div class="jt-grid jobs">
      ${jobs.length ? jobs.slice(0, 200).map((j) => `
        <article class="jt-job ${j.overdue ? 'late' : ''}" data-job="${esc(j.id)}" tabindex="0" style="--pc:${esc(j.processColor || '#64748B')}">
          <header><span class="proc"><i class="ph ${esc(j.processIcon || 'ph-gear')}"></i>${esc(j.processName)}</span>${statusBadge(j)}</header>
          <h4>${esc(j.title)}</h4>
          <p class="sub">${esc(j.jobNo)} ${j.orderNo ? '· ' + esc(j.orderNo) : ''} ${j.priority === 'urgent' || j.priority === 'high' ? `· <em class="bad">${PRIORITY[j.priority]}</em>` : ''}</p>
          <div class="jt-prog"><span><small>${fmt(j.doneQty)} / ${fmt(j.plannedQty)}</small><b>%${j.progress}</b></span>${bar(j.progress, j.overdue ? 'bad' : j.status === 'done' ? 'good' : '')}</div>
          <footer>${person(j.assigneeName, j.projectCode || '')}<span class="date"><small>Bitiş</small><b>${fmtDate(j.plannedEnd)}</b></span></footer>
        </article>`).join('') : empty('ph-list-checks', 'Bu filtrede iş yok.')}
    </div>`;

  const rerender = () => render(root, ctx);
  root.onclick = (e) => {
    const s = e.target.closest('[data-status]'); if (s) { filt.status = s.dataset.status; return rerender(); }
    if (e.target.closest('#jt-export')) return exportTable('Is listesi', [
      ['İş no', 'jobNo'], ['Başlık', 'title'], ['Süreç', 'processName'], ['Proje', 'projectCode'], ['Sipariş', 'orderNo'],
      ['Ürün', 'productName'], ['Sorumlu', 'assigneeName'], ['Durum', (j) => STATUS[j.status]?.label || j.status],
      ['Planlanan', (j) => j.plannedQty], ['Yapılan', (j) => j.doneQty], ['Fire', (j) => j.scrapQty], ['İlerleme %', (j) => j.progress],
      ['Başlangıç', 'plannedStart'], ['Bitiş', 'plannedEnd'], ['Gecikme (gün)', (j) => j.overdueDays || 0],
    ], jobs);
    if (e.target.closest('#jt-new-job')) return jobForm(ctx, {}, rerender);
    const j = e.target.closest('[data-job]'); if (j) openJob(j.dataset.job, ctx, rerender);
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const j = e.target.closest('[data-job]'); if (j) openJob(j.dataset.job, ctx, rerender); } };
  root.querySelector('#f-late').onchange = (e) => { filt.late = e.target.checked; rerender(); };
  root.querySelector('#f-mine').onchange = (e) => { filt.mine = e.target.checked; rerender(); };
  root.querySelector('#f-proc').onchange = (e) => { filt.processId = e.target.value; rerender(); };
  let t; root.querySelector('#f-q').oninput = (e) => { filt.q = e.target.value; clearTimeout(t); t = setTimeout(() => { rerender().then(() => { const i = root.querySelector('#f-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 250); };
}

export async function openJob(id, ctx, onChange) {
  const s = sheet({ title: 'İş', body: loading(), wide: true });
  let j;
  try { j = (await api.get(`/jt/jobs/${encodeURIComponent(id)}`)).data; } catch (e) { s.body.innerHTML = errorBox(e); return; }
  s.setTitle(`${j.jobNo} · ${j.title}`);
  const mine = state.me && j.assigneeId === state.me.id;
  const canEdit = can('jt.jobs.update.any') || (can('jt.jobs.update.own') && mine);
  const open = j.status !== 'done' && j.status !== 'cancelled';
  const users = state.meta.users.filter((u) => ['operator', 'quality', 'logistics', 'supervisor'].includes(u.role));
  const logIcon = { progress: 'ph-plus-circle', status: 'ph-flag', assign: 'ph-user-switch', comment: 'ph-chat-text' };

  s.body.innerHTML = `
    <div class="jt-detail-head">
      <div>${statusBadge(j)} ${pill(PRIORITY[j.priority] || j.priority)} <span class="code" style="color:${esc(j.processColor)}"><i class="ph ${esc(j.processIcon || 'ph-gear')}"></i> ${esc(j.processName)}</span></div>
      ${j.blockedReason && j.status === 'blocked' ? `<div class="jt-warnbox"><i class="ph ph-hand-palm"></i> Engel: ${esc(j.blockedReason)}</div>` : ''}
    </div>
    <div class="jt-info">
      <div><small>Sorumlu</small>${person(j.assigneeName)}</div>
      <div><small>Proje</small><b>${esc(j.projectCode || '—')}</b><small>${esc(j.projectName || '')}</small></div>
      <div><small>Sipariş</small>${j.orderId ? `<button class="jt-link" data-order="${esc(j.orderId)}">${esc(j.orderNo)}</button>` : '<b>—</b>'}<small>${esc(j.productName || '')}</small></div>
      <div><small>Planlanan</small><b>${fmtDate(j.plannedStart)} → ${fmtDate(j.plannedEnd)}</b><small>${j.actualStart ? 'Başladı: ' + fmtDateTime(j.actualStart) : 'Henüz başlamadı'}</small></div>
      <div><small>Gerçekleşen bitiş</small><b>${j.actualEnd ? fmtDateTime(j.actualEnd) : '—'}</b>${j.onTime === false ? `<small class="bad">${j.delayDays} gün geç</small>` : j.onTime ? '<small class="ok">Zamanında</small>' : ''}</div>
      ${j.product ? `<div><small>ERP stoğu</small><b>${fmt(j.product.stock)} ${esc(j.product.unit || '')}</b><small>${esc(j.product.code)}</small></div>` : ''}
    </div>
    <div class="jt-progress-box">
      <div class="jt-prog big"><span><small>Yapılan / planlanan</small><b>${fmt(j.doneQty)} / ${fmt(j.plannedQty)} <em>%${j.progress}</em></b></span>${bar(j.progress, j.overdue ? 'bad' : j.status === 'done' ? 'good' : '')}</div>
      <small class="muted">Fire: ${fmt(j.scrapQty)} adet</small>
    </div>
    ${canEdit && open ? `
    <form class="jt-form inline" id="jt-progress">
      <h4 class="jt-h">İlerleme gir</h4>
      <div class="jt-3">
        ${field('Yapılan adet', '<input type="number" name="qty" min="1" step="1" required placeholder="Örn. 50" />')}
        ${field('Fire', '<input type="number" name="scrap" min="0" step="1" value="0" />')}
        ${field('Not', '<input type="text" name="note" maxlength="200" placeholder="isteğe bağlı" />')}
      </div>
      <div class="jt-actions left">
        <button class="btn btn-primary" type="submit"><i class="ph ph-floppy-disk"></i> Kaydet</button>
        ${j.status === 'planned' || j.status === 'blocked' ? '<button type="button" class="btn btn-secondary" data-st="in_progress"><i class="ph ph-play"></i> Başlat</button>' : ''}
        ${j.status !== 'blocked' ? '<button type="button" class="btn btn-secondary" data-st="blocked"><i class="ph ph-hand-palm"></i> Engel bildir</button>' : ''}
        <button type="button" class="btn btn-secondary" data-st="done"><i class="ph ph-check"></i> Tamamla</button>
        ${can('jt.jobs.update.any') ? '<button type="button" class="btn btn-secondary danger" data-st="cancelled"><i class="ph ph-prohibit"></i> İptal</button>' : ''}
      </div>
    </form>` : ''}
    ${can('jt.jobs.assign') && open ? `
    <div class="jt-assign"><h4 class="jt-h">Sorumlu ata</h4>
      <div class="jt-inline"><select id="jt-assignee">${options(users.map((u) => [u.id, `${u.name} — ${u.title || u.roleLabel}`]), j.assigneeId, 'Kişi seçin')}</select><button class="btn btn-secondary" id="jt-assign-btn">Ata</button></div>
    </div>` : ''}
    <h4 class="jt-h">Hareketler</h4>
    <ol class="jt-timeline">${j.logs.map((l) => `<li><i class="ph ${logIcon[l.type] || 'ph-dot'}"></i><div><b>${esc(l.userName || 'Sistem')}</b> ${l.type === 'progress' ? `+${fmt(l.qty)} adet${l.scrap ? ` (fire ${fmt(l.scrap)})` : ''}` : ''} ${l.note ? `<span>${esc(l.note)}</span>` : ''}<small>${fmtDateTime(l.createdAt)}</small></div></li>`).join('') || '<li><div><small>Kayıt yok</small></div></li>'}</ol>
    <form class="jt-inline comment" id="jt-comment"><input name="note" maxlength="300" placeholder="Not ekle…" required /><button class="btn btn-secondary" type="submit">Gönder</button></form>`;

  const reload = () => { s.close(); onChange?.(); setTimeout(() => openJob(id, ctx, onChange), 250); };
  s.body.onclick = (e) => {
    const o = e.target.closest('[data-order]'); if (o) { s.close(); return ctx.openOrder(o.dataset.order); }
    const st = e.target.closest('[data-st]');
    if (st) guard(st, async () => {
      let note = '';
      if (st.dataset.st === 'blocked') {
        note = await promptDialog({ title: 'Engel bildir', message: 'İş neden ilerleyemiyor? Bu not sorumluya ve uyarılara yansır.', label: 'Engelin nedeni', placeholder: 'Örn. Kaynak teli bekleniyor', required: true, multiline: true, confirmLabel: 'Engeli kaydet' });
        if (!note) return;
      }
      if (st.dataset.st === 'cancelled' && !(await confirmDialog({ title: 'İş iptal edilsin mi?', message: 'İptal edilen iş listelerden kalkar ve uyarı üretmez.', confirmLabel: 'İşi iptal et', danger: true }))) return;
      await api.post(`/jt/jobs/${encodeURIComponent(id)}/status`, { status: st.dataset.st, note });
      showToast('Durum güncellendi', 'success'); reload();
    });
    const a = e.target.closest('#jt-assign-btn');
    if (a) guard(a, async () => { const uid = s.body.querySelector('#jt-assignee').value; if (!uid) return showToast('Kişi seçin', 'warning'); await api.post(`/jt/jobs/${encodeURIComponent(id)}/assign`, { userId: Number(uid) }); showToast('Atandı', 'success'); reload(); });
  };
  const pf = s.body.querySelector('#jt-progress');
  if (pf) pf.onsubmit = (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(pf)); guard(e.submitter, async () => { const r = await api.post(`/jt/jobs/${encodeURIComponent(id)}/progress`, { qty: Number(f.qty), scrap: Number(f.scrap || 0), note: f.note }); showToast(r.message, 'success'); reload(); }); };
  s.body.querySelector('#jt-comment').onsubmit = (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); guard(e.submitter, async () => { await api.post(`/jt/jobs/${encodeURIComponent(id)}/comment`, f); reload(); }); };
}

export async function jobForm(ctx, preset = {}, onDone) {
  let orders = [];
  try { orders = (await api.get('/jt/orders')).data.filter((o) => !['shipped', 'cancelled'].includes(o.state)); } catch (_e) { /* siparişsiz iş de açılabilir */ }
  const users = state.meta.users.filter((u) => ['operator', 'quality', 'logistics', 'supervisor'].includes(u.role));
  const s = sheet({ title: 'Yeni iş', body: `
    <form class="jt-form" id="jf">
      ${field('Sipariş', `<select name="orderId" id="jf-order">${options(orders.map((o) => [o.id, `${o.orderNo} — ${o.customerName}`]), preset.orderId, 'Siparişsiz iş')}</select>`)}
      ${field('Sipariş kalemi', `<select name="lineId" id="jf-line"><option value="">—</option></select>`)}
      ${field('Süreç', `<select name="processId" required>${options(state.meta.processes.map((p) => [p.id, p.name]), '', 'Seçin')}</select>`)}
      ${field('Başlık', '<input name="title" maxlength="160" placeholder="boş bırakılırsa süreç + ürün adı kullanılır" />')}
      <div class="jt-2">
        ${field('Planlanan adet', '<input type="number" name="plannedQty" min="1" step="1" required />')}
        ${field('Öncelik', `<select name="priority">${options(Object.entries(PRIORITY), 'medium')}</select>`)}
      </div>
      <div class="jt-2">
        ${field('Başlangıç', `<input type="date" name="plannedStart" required value="${today()}" />`)}
        ${field('Bitiş', `<input type="date" name="plannedEnd" required value="${addDays(today(), 3)}" />`)}
      </div>
      ${can('jt.jobs.assign') ? field('Sorumlu', `<select name="assigneeId">${options(users.map((u) => [u.id, `${u.name} — ${u.title || u.roleLabel}`]), '', 'Sonra ata')}</select>`) : ''}
      ${field('Not', '<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">İşi oluştur</button></div>
    </form>` });
  const orderSel = s.body.querySelector('#jf-order'), lineSel = s.body.querySelector('#jf-line');
  const fillLines = async () => {
    lineSel.innerHTML = '<option value="">—</option>';
    if (!orderSel.value) return;
    const o = (await api.get(`/jt/orders/${encodeURIComponent(orderSel.value)}`)).data;
    lineSel.innerHTML = options(o.lines.map((l) => [l.id, `${l.productName} (${fmt(l.qty)})`]), preset.lineId, 'Kalem seçin');
    if (!s.body.querySelector('[name=plannedQty]').value && preset.lineId) { const l = o.lines.find((x) => x.id === preset.lineId); if (l) s.body.querySelector('[name=plannedQty]').value = l.qty; }
  };
  orderSel.onchange = () => { preset.lineId = ''; fillLines(); };
  lineSel.onchange = () => { const opt = lineSel.selectedOptions[0]?.textContent.match(/\(([\d.]+)\)$/); if (opt) s.body.querySelector('[name=plannedQty]').value = opt[1].replace(/\./g, ''); };
  if (preset.orderId) fillLines();
  s.body.querySelector('[data-close]').onclick = s.close;
  s.body.querySelector('#jf').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    f.plannedQty = Number(f.plannedQty); if (f.assigneeId) f.assigneeId = Number(f.assigneeId); else delete f.assigneeId;
    guard(e.submitter, async () => { const r = await api.post('/jt/jobs', f); showToast(`${r.data.jobNo} oluşturuldu`, 'success'); s.close(); onDone?.(); });
  };
}
