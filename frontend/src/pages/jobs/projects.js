/** Projeler: sorumlu, ilerleme, sipariş / giden miktar, geciken iş, ekip */
import { api, esc, fmt, fmtDate, fmtDateFull, state, can, bar, dualBar, dueLabel, person, pill, statusBadge, empty, errorBox, loading, sheet, guard, field, options, showToast, today, addDays,
  PROJECT_STATUS, PRIORITY } from './common.js';

const filters = [['active', 'Aktif'], ['all', 'Tümü'], ['completed', 'Tamamlanan']];
let filter = 'active';

export async function render(root, ctx) {
  root.innerHTML = loading();
  let list;
  try { list = (await api.get('/jt/projects')).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  const shown = list.filter((p) => filter === 'all' || (filter === 'active' ? ['active', 'planned', 'on_hold'].includes(p.status) : p.status === 'completed'));

  root.innerHTML = `
    <div class="jt-toolbar">
      <div class="jt-chips">${filters.map(([id, l]) => `<button class="${filter === id ? 'active' : ''}" data-filter="${id}">${l}</button>`).join('')}</div>
      ${can('jt.projects.manage') ? '<button class="btn btn-primary jt-add" id="jt-new-project"><i class="ph ph-plus"></i> Yeni proje</button>' : ''}
    </div>
    <div class="jt-grid">
      ${shown.length ? shown.map((p) => `
        <article class="jt-project" data-project="${esc(p.id)}" tabindex="0">
          <header>
            <span class="code">${esc(p.code)}</span>
            ${p.overdue ? '<span class="jt-badge late"><i class="ph ph-warning"></i> Terminde değil</span>' : pill(PROJECT_STATUS[p.status] || p.status, p.status === 'completed' ? 'done' : p.status === 'on_hold' ? 'blocked' : 'progress')}
          </header>
          <h4>${esc(p.name)}</h4>
          <p class="cust">${esc(p.customerName || '—')}</p>
          <div class="jt-mgr">${person(p.managerName, p.managerTitle || 'Proje sorumlusu')}</div>
          <div class="jt-prog"><span><small>İlerleme</small><b>%${p.progress}</b></span>${bar(p.progress, p.lateJobs ? 'warn' : '')}</div>
          ${dualBar(p.orderedQty, p.shippedQty)}
          <footer>
            <span>${dueLabel(p.dueDate, p.status === 'completed')}</span>
            <span class="stats">
              <em title="Geciken iş" class="${p.lateJobs ? 'bad' : ''}"><i class="ph ph-warning"></i> ${p.lateJobs}</em>
              <em title="Zamanında tamamlama"><i class="ph ph-target"></i> ${p.onTimePct == null ? '—' : '%' + p.onTimePct}</em>
              <em title="İş sayısı"><i class="ph ph-list-checks"></i> ${p.jobsDone}/${p.jobCount}</em>
            </span>
          </footer>
        </article>`).join('') : empty('ph-folders', 'Bu filtrede proje yok.')}
    </div>`;

  root.onclick = (e) => {
    const f = e.target.closest('[data-filter]'); if (f) { filter = f.dataset.filter; return render(root, ctx); }
    if (e.target.closest('#jt-new-project')) return projectForm(ctx, null, () => render(root, ctx));
    const p = e.target.closest('[data-project]'); if (p) openProject(p.dataset.project, ctx, () => render(root, ctx));
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const p = e.target.closest('[data-project]'); if (p) openProject(p.dataset.project, ctx, () => render(root, ctx)); } };
}

export async function openProject(id, ctx, onChange) {
  const s = sheet({ title: 'Proje', body: loading(), wide: true });
  let p;
  try { p = (await api.get(`/jt/projects/${encodeURIComponent(id)}`)).data; } catch (e) { s.body.innerHTML = errorBox(e); return; }
  s.setTitle(p.name);
  const late = p.jobs.filter((j) => j.overdue).sort((a, b) => b.overdueDays - a.overdueDays);
  const rest = p.jobs.filter((j) => !j.overdue && j.status !== 'done').slice(0, 12);
  const jobRow = (j) => `<button class="jt-row" data-job="${esc(j.id)}"><span class="jt-row-main"><b>${esc(j.jobNo)} · ${esc(j.title)}</b><small>${esc(j.assigneeName || 'Atanmamış')} · bitiş ${fmtDate(j.plannedEnd)}</small></span><span class="jt-row-side">${statusBadge(j)}</span></button>`;
  s.body.innerHTML = `
    <div class="jt-detail-head">
      <div>${pill(PROJECT_STATUS[p.status] || p.status, p.status === 'completed' ? 'done' : 'progress')} ${pill(PRIORITY[p.priority] || p.priority)} <span class="code">${esc(p.code)}</span></div>
      <p>${esc(p.description || '')}</p>
    </div>
    <div class="jt-mgr-card">
      ${person(p.managerName, p.managerTitle || 'Proje sorumlusu')}
      <span class="contact">${p.managerPhone ? `<a href="tel:${esc(String(p.managerPhone).replace(/\s/g, ''))}"><i class="ph ph-phone"></i> ${esc(p.managerPhone)}</a>` : ''}${p.managerEmail ? `<a href="mailto:${esc(p.managerEmail)}"><i class="ph ph-envelope-simple"></i> ${esc(p.managerEmail)}</a>` : ''}</span>
      <span class="dates"><small>Müşteri</small><b>${esc(p.customerName || '—')}</b><small>${fmtDateFull(p.startDate)} → ${fmtDateFull(p.dueDate)}</small></span>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş</small><b>${fmt(p.orderedQty)}</b></div>
      <div><small>Giden</small><b>${fmt(p.shippedQty)}</b></div>
      <div><small>Geciken iş</small><b class="${late.length ? 'bad' : ''}">${late.length}</b></div>
      <div><small>Bitiş</small><b>${dueLabel(p.dueDate, p.status === 'completed')}</b></div>
    </div>
    <h4 class="jt-h">Süreç bazında ilerleme</h4>
    <div class="jt-proc-bars">${p.byProcess.map((x) => `<div><span>${esc(x.name)}</span>${bar(x.progress, x.late ? 'warn' : '')}<small>${x.done}/${x.total}${x.late ? ` · <em class="bad">${x.late} geç</em>` : ''}</small></div>`).join('')}</div>
    <h4 class="jt-h">Siparişler</h4>
    ${p.orders.length ? p.orders.map((o) => `<button class="jt-row col" data-order="${esc(o.id)}"><span class="jt-row-line"><b>${esc(o.orderNo)}</b><small>termin ${fmtDate(o.dueDate)}${o.overdueDays ? ` · <em class="bad">${o.overdueDays} gün gecikti</em>` : ''}</small></span>${dualBar(o.orderedQty, o.shippedQty)}</button>`).join('') : empty('ph-package', 'Bu projede sipariş yok.')}
    <h4 class="jt-h">Ekip</h4>
    <div class="jt-team">${p.team.length ? p.team.map((m) => `<span class="jt-team-m">${person(m.name)}<small>${m.done}/${m.jobs} iş${m.late ? ` · <em class="bad">${m.late} geç</em>` : ''}</small></span>`).join('') : '<small>Atanmış kişi yok.</small>'}</div>
    <h4 class="jt-h">Geciken ve devam eden işler</h4>
    ${[...late, ...rest].length ? [...late, ...rest].slice(0, 20).map(jobRow).join('') : empty('ph-check-circle', 'Açık iş yok.')}
    ${can('jt.projects.manage') ? '<div class="jt-actions"><button class="btn btn-secondary" id="jt-edit-project"><i class="ph ph-pencil-simple"></i> Projeyi düzenle</button></div>' : ''}`;
  s.body.onclick = (e) => {
    const j = e.target.closest('[data-job]'); if (j) return ctx.openJob(j.dataset.job);
    const o = e.target.closest('[data-order]'); if (o) return ctx.openOrder(o.dataset.order);
    if (e.target.closest('#jt-edit-project')) { s.close(); projectForm(ctx, p, onChange); }
  };
}

export async function projectForm(ctx, p, onDone) {
  const users = state.meta.users.filter((u) => ['manager', 'admin', 'planner', 'supervisor'].includes(u.role));
  const edit = !!p;
  const s = sheet({ title: edit ? 'Projeyi düzenle' : 'Yeni proje', body: `
    <form class="jt-form" id="pf">
      ${field('Proje adı', `<input name="name" required maxlength="120" value="${esc(p?.name || '')}" />`)}
      <div class="jt-2">
        ${field('Müşteri', edit ? `<input value="${esc(p.customerName || '')}" disabled />` : `<select name="customerId">${options(state.meta.customers.map((c) => [c.id, c.name]), '', 'Seçin')}</select>`)}
        ${field('Proje sorumlusu', `<select name="managerId">${options(users.map((u) => [u.id, `${u.name} — ${u.roleLabel || u.role}`]), p?.managerId, 'Seçin')}</select>`)}
      </div>
      <div class="jt-2">
        ${edit ? '' : field('Başlangıç', `<input type="date" name="startDate" required value="${today()}" />`)}
        ${field('Bitiş (termin)', `<input type="date" name="dueDate" required value="${esc(p?.dueDate || addDays(today(), 60))}" />`)}
      </div>
      <div class="jt-2">
        ${field('Öncelik', `<select name="priority">${options(Object.entries(PRIORITY), p?.priority || 'medium')}</select>`)}
        ${edit ? field('Durum', `<select name="status">${options(Object.entries(PROJECT_STATUS), p.status)}</select>`) : '<span></span>'}
      </div>
      ${field('Açıklama', `<textarea name="description" rows="3" maxlength="500">${esc(p?.description || '')}</textarea>`)}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button></div>
    </form>` });
  s.body.querySelector('[data-close]').onclick = s.close;
  s.body.querySelector('#pf').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    guard(e.submitter, async () => {
      const r = edit ? await api.put(`/jt/projects/${encodeURIComponent(p.id)}`, f) : await api.post('/jt/projects', f);
      showToast(r.message || 'Kaydedildi', 'success'); s.close(); onDone?.();
    });
  };
}
