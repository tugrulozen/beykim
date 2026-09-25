/** Kişi performansı: zamanında tamamlama, gecikme, fire, iş yükü ve skor */
import { api, esc, fmt, fmtDate, state, can, bar, ring, person, statusBadge, empty, errorBox, loading, sheet, exportTable, exportButton } from './common.js';

let days = 90;
let sortKey = 'score';
const SORTS = { score: 'Skor', onTimePct: 'Zamanında %', completed: 'Tamamlanan', overdueJobs: 'Geciken', openJobs: 'Açık iş' };

const tone = (v, good = 80, mid = 60) => (v == null ? '' : v >= good ? 'good' : v >= mid ? 'warn' : 'bad');

export async function render(root, ctx) {
  root.innerHTML = loading();
  let d;
  try { d = (await api.get(`/jt/performance?days=${days}`)).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  const all = can('jt.performance.all');
  const rows = [...d.rows].sort((a, b) => (sortKey === 'overdueJobs' || sortKey === 'openJobs' ? b[sortKey] - a[sortKey] : (b[sortKey] ?? -1) - (a[sortKey] ?? -1)));

  root.innerHTML = `
    <div class="jt-toolbar">
      <div class="jt-chips">${[30, 90, 180].map((n) => `<button class="${days === n ? 'active' : ''}" data-days="${n}">Son ${n} gün</button>`).join('')}</div>
      ${all ? `<select id="jt-sort" aria-label="Sırala">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}" ${k === sortKey ? 'selected' : ''}>Sırala: ${l}</option>`).join('')}</select>` : ''}
      ${exportButton('jt-export-perf')}
    </div>
    <div class="jt-mini-kpis wide">
      <div><small>Kişi</small><b>${d.summary.people}</b></div>
      <div><small>Tamamlanan iş</small><b>${fmt(d.summary.completed)}</b></div>
      <div><small>Zamanında tamamlama</small><b class="${tone(d.summary.onTimePct)}">${d.summary.onTimePct == null ? '—' : '%' + d.summary.onTimePct}</b></div>
      <div><small>Skor nasıl hesaplanır?</small><b class="tiny">%60 zamanında · %20 düşük fire · %20 gecikmiş açık iş yükü</b></div>
    </div>
    ${rows.length ? `
    <div class="jt-table-wrap"><table class="jt-table perf">
      <thead><tr><th>Kişi</th><th class="c">Skor</th><th>Zamanında</th><th class="r">Biten</th><th class="r">Geç</th><th class="r">Ort. gecikme</th><th class="r">Açık / geciken</th><th class="r">Fire</th><th class="r">Üretilen</th></tr></thead>
      <tbody>${rows.map((r) => `<tr data-user="${r.id}" tabindex="0">
        <td data-label="Kişi">${person(r.name, r.title || r.roleLabel)}</td>
        <td data-label="Skor" class="c">${ring(r.score, 46)}</td>
        <td data-label="Zamanında"><div class="jt-mini">${bar(r.onTimePct, tone(r.onTimePct))}<small>${r.onTimePct == null ? '—' : '%' + r.onTimePct}</small></div></td>
        <td data-label="Biten" class="r">${r.completed}</td>
        <td data-label="Geç" class="r ${r.late ? 'bad' : ''}">${r.late}</td>
        <td data-label="Ort. gecikme" class="r">${r.avgDelayDays ? r.avgDelayDays + ' gün' : '—'}</td>
        <td data-label="Açık / geciken" class="r">${r.openJobs} / <b class="${r.overdueJobs ? 'bad' : ''}">${r.overdueJobs}</b></td>
        <td data-label="Fire" class="r">${r.scrapPct ? '%' + r.scrapPct : '—'}</td>
        <td data-label="Üretilen" class="r">${fmt(r.producedQty)}</td>
      </tr>`).join('')}</tbody></table></div>` : empty('ph-gauge', 'Bu dönemde performans verisi yok.')}`;

  root.onclick = (e) => {
    const b = e.target.closest('[data-days]'); if (b) { days = Number(b.dataset.days); return render(root, ctx); }
    if (e.target.closest('#jt-export-perf')) return exportTable(`Performans son ${days} gun`, [
      ['Kişi', 'name'], ['Unvan', 'title'], ['Bölüm', 'department'], ['Rol', 'roleLabel'], ['Skor', (r) => r.score],
      ['Zamanında %', (r) => r.onTimePct], ['Tamamlanan', (r) => r.completed], ['Geç biten', (r) => r.late],
      ['Ort. gecikme (gün)', (r) => r.avgDelayDays], ['Açık iş', (r) => r.openJobs], ['Geciken açık iş', (r) => r.overdueJobs],
      ['Fire %', (r) => r.scrapPct], ['Üretilen', (r) => r.producedQty],
    ], rows);
    const u = e.target.closest('[data-user]'); if (u) openUser(u.dataset.user, ctx);
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const u = e.target.closest('[data-user]'); if (u) openUser(u.dataset.user, ctx); } };
  const sel = root.querySelector('#jt-sort'); if (sel) sel.onchange = () => { sortKey = sel.value; render(root, ctx); };
}

function trend(monthly) {
  const W = 360, H = 120, max = Math.max(3, ...monthly.map((m) => m.done));
  const bw = W / monthly.length;
  return `<svg viewBox="0 0 ${W} ${H + 18}" class="jt-chart small">${monthly.map((m, i) => {
    const x = i * bw + bw * 0.2, w = bw * 0.6, hAll = (m.done / max) * H, hOn = (m.onTime / max) * H;
    return `<rect x="${x}" y="${H - hAll}" width="${w}" height="${hAll}" rx="3" class="late"><title>${m.month}: ${m.done} iş</title></rect><rect x="${x}" y="${H - hOn}" width="${w}" height="${hOn}" rx="3" class="on"><title>${m.onTime} zamanında</title></rect><text x="${x + w / 2}" y="${H + 14}" text-anchor="middle" class="axis">${m.month.slice(5)}</text>`;
  }).join('')}</svg>`;
}

export async function openUser(id, ctx) {
  const s = sheet({ title: 'Kişi performansı', body: loading(), wide: true });
  let r;
  try { r = (await api.get(`/jt/performance/${encodeURIComponent(id)}?days=${days}`)).data; } catch (e) { s.body.innerHTML = errorBox(e); return; }
  s.setTitle(r.name);
  s.body.innerHTML = `
    <div class="jt-perf-head">${ring(r.score, 76)}<div>${person(r.name, `${r.title || ''} · ${r.department || ''}`)}<small class="muted">Son ${days} gün · ${esc(r.roleLabel || '')}</small></div></div>
    <div class="jt-mini-kpis wide">
      <div><small>Zamanında</small><b class="${tone(r.onTimePct)}">${r.onTimePct == null ? '—' : '%' + r.onTimePct}</b></div>
      <div><small>Tamamlanan</small><b>${r.completed}</b></div>
      <div><small>Geç biten</small><b class="${r.late ? 'bad' : ''}">${r.late}</b></div>
      <div><small>Ort. gecikme</small><b>${r.avgDelayDays ? r.avgDelayDays + ' gün' : '—'}</b></div>
      <div><small>Açık iş</small><b>${r.openJobs}</b></div>
      <div><small>Geciken açık iş</small><b class="${r.overdueJobs ? 'bad' : ''}">${r.overdueJobs}</b></div>
      <div><small>Fire oranı</small><b>${r.scrapPct ? '%' + r.scrapPct : '—'}</b></div>
      <div><small>Üretilen adet</small><b>${fmt(r.producedQty)}</b></div>
    </div>
    <div class="jt-cols tight">
      <section class="jt-card flat"><div class="jt-card-h"><h3>Aylık tamamlanan iş</h3><span class="jt-legend"><i class="on"></i>zamanında <i class="late"></i>toplam</span></div>${trend(r.monthly)}</section>
      <section class="jt-card flat"><div class="jt-card-h"><h3>Süreç bazında</h3></div>
        ${r.byProcess.length ? r.byProcess.map((p) => `<div class="jt-proc-bars single"><span>${esc(p.name)}</span>${bar(p.done ? (p.onTime / p.done) * 100 : 0, tone(p.done ? (p.onTime / p.done) * 100 : null))}<small>${p.onTime}/${p.done} zamanında</small></div>`).join('') : '<small class="muted">Tamamlanmış iş yok.</small>'}
      </section>
    </div>
    <h4 class="jt-h">Son işler</h4>
    ${r.jobs.map((j) => `<button class="jt-row" data-job="${esc(j.id)}"><span class="jt-row-main"><b>${esc(j.jobNo)} · ${esc(j.title)}</b><small>${esc(j.projectCode || '')} · bitiş ${fmtDate(j.plannedEnd)}</small></span><span class="jt-row-side">${statusBadge(j)}</span></button>`).join('') || empty('ph-list-checks', 'İş yok.')}`;
  s.body.onclick = (e) => { const j = e.target.closest('[data-job]'); if (j) ctx.openJob(j.dataset.job); };
}
