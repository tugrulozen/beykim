/** Özet: ERP + iş takip verisinden sipariş / giden miktar, süreç akışı, zamanında tamamlama, uyarılar */
import { api, esc, fmt, fmtDate, bar, dualBar, empty, errorBox, loading } from './common.js';

const SEV = { critical: ['ph-warning-octagon', 'Kritik'], warning: ['ph-warning', 'Uyarı'], info: ['ph-info', 'Bilgi'] };

function weeklyChart(weeks) {
  const W = 520, H = 190, pad = { l: 28, b: 24, t: 10 };
  const max = Math.max(4, ...weeks.map((w) => w.onTime + w.late));
  const bw = (W - pad.l) / weeks.length;
  const y = (v) => H - pad.b - (v / max) * (H - pad.b - pad.t);
  const grid = [0, 0.5, 1].map((f) => `<line x1="${pad.l}" x2="${W}" y1="${y(max * f)}" y2="${y(max * f)}" class="grid"/><text x="${pad.l - 6}" y="${y(max * f) + 4}" text-anchor="end" class="axis">${Math.round(max * f)}</text>`).join('');
  const bars = weeks.map((w, i) => {
    const x = pad.l + i * bw + bw * 0.22, wd = bw * 0.56;
    const hOn = H - pad.b - y(w.onTime), hLate = H - pad.b - y(w.late);
    return `<rect x="${x}" y="${y(w.onTime)}" width="${wd}" height="${Math.max(hOn, 0)}" rx="3" class="on"><title>${w.label}: ${w.onTime} zamanında</title></rect>
      <rect x="${x}" y="${y(w.onTime) - hLate}" width="${wd}" height="${Math.max(hLate, 0)}" rx="3" class="late"><title>${w.label}: ${w.late} geç</title></rect>
      <text x="${x + wd / 2}" y="${H - 7}" text-anchor="middle" class="axis">${esc(w.label)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="jt-chart" role="img" aria-label="Haftalık tamamlanan işler">${grid}${bars}</svg>`;
}

export async function render(root, ctx) {
  root.innerHTML = loading();
  let d;
  try { d = (await api.get('/jt/dashboard')).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  ctx.setAlertCounts(d.alertCounts);
  const k = d.kpi;
  const shipPct = k.orderedQty ? Math.round((k.shippedQty / k.orderedQty) * 100) : 0;
  const tile = (icon, label, value, sub, tone = '', go = '') => `
    <div class="jt-kpi ${tone} ${go ? 'link' : ''}" ${go ? `data-go="${go}"` : ''}>
      <span class="ico"><i class="ph ${icon}"></i></span>
      <div><small>${label}</small><b>${value}</b><em>${sub}</em></div>
    </div>`;

  root.innerHTML = `
    <div class="jt-kpis">
      ${tile('ph-package', 'Açık sipariş', fmt(k.openOrders), `${fmt(k.orderedQty)} adet sipariş`, '', 'orders')}
      ${tile('ph-truck', 'Giden miktar', fmt(k.shippedQty), `%${shipPct} sevk edildi`, shipPct >= 60 ? 'good' : '', 'orders')}
      ${tile('ph-gear-six', 'Devam eden iş', fmt(k.activeJobs), `${fmt(k.plannedJobs)} planlı iş`, '', 'jobs')}
      ${tile('ph-warning', 'Geciken iş', fmt(k.overdueJobs), `${fmt(k.blockedJobs)} engelli`, k.overdueJobs ? 'bad' : 'good', 'late')}
      ${tile('ph-target', 'Zamanında tamamlama', k.onTimePct == null ? '—' : `%${k.onTimePct}`, 'son 90 gün', k.onTimePct == null ? '' : k.onTimePct >= 80 ? 'good' : k.onTimePct >= 60 ? 'warn' : 'bad', 'performance')}
      ${tile('ph-calendar-x', 'Geciken sipariş', fmt(k.overdueOrders), 'termini geçmiş', k.overdueOrders ? 'bad' : 'good', 'orders')}
      ${tile('ph-folders', 'Aktif proje', fmt(k.activeProjects), 'devam eden', '', 'projects')}
      ${tile('ph-check-circle', 'Tamamlanan iş', fmt(k.completedJobs), 'toplam', '', 'jobs')}
    </div>

    <section class="jt-card">
      <div class="jt-card-h"><h3>Süreç akışı</h3><small>Hangi süreçte kaç iş var</small></div>
      <div class="jt-flow">
        ${d.byProcess.map((p) => {
          const total = p.planned + p.inProgress + p.blocked + p.done || 1;
          const seg = (n, cls) => (n ? `<i class="${cls}" style="width:${(n / total) * 100}%"></i>` : '');
          return `<button class="jt-stage" data-process="${esc(p.id)}" style="--c:${esc(p.color)}">
            <span class="ico"><i class="ph ${esc(p.icon)}"></i></span>
            <b>${esc(p.name)}</b>
            <span class="num">${p.inProgress + p.blocked}<small>aktif</small></span>
            <span class="jt-stack">${seg(p.done, 'done')}${seg(p.inProgress, 'progress')}${seg(p.blocked, 'blocked')}${seg(p.planned, 'planned')}</span>
            <span class="meta"><span>${p.done} biten</span><span>${p.planned} bekleyen</span></span>
            ${p.overdue ? `<span class="jt-chip late"><i class="ph ph-warning"></i> ${p.overdue} geciken</span>` : `<span class="jt-chip ok">Gecikme yok</span>`}
            <em>${fmt(p.openQty)} adet kaldı</em>
          </button>`;
        }).join('')}
      </div>
    </section>

    <div class="jt-cols">
      <section class="jt-card">
        <div class="jt-card-h"><h3>Sipariş &amp; giden miktar</h3><small>Termini yaklaşan açık siparişler</small></div>
        <div id="jt-ov-orders"></div>
      </section>
      <section class="jt-card">
        <div class="jt-card-h"><h3>Haftalık tamamlanan işler</h3><span class="jt-legend"><i class="on"></i>zamanında <i class="late"></i>geç</span></div>
        ${weeklyChart(d.weeks)}
      </section>
    </div>

    <div class="jt-cols">
      <section class="jt-card">
        <div class="jt-card-h"><h3>Dikkat gerektiren siparişler</h3></div>
        ${d.attention.length ? d.attention.map((o) => `
          <button class="jt-row" data-order="${esc(o.id)}">
            <span class="jt-row-main"><b>${esc(o.orderNo)}</b><small>${esc(o.customerName)}</small></span>
            <span class="jt-row-side">
              ${o.overdueDays ? `<span class="jt-badge late">${o.overdueDays} gün gecikti</span>` : ''}
              ${o.lateJobs ? `<span class="jt-badge blocked">${o.lateJobs} geciken iş</span>` : ''}
              <small>Üretim %${o.progress} · Sevk %${o.shippedPct}</small>
            </span>
          </button>`).join('') : empty('ph-seal-check', 'Geciken sipariş veya iş yok.')}
      </section>
      <section class="jt-card">
        <div class="jt-card-h"><h3>Son uyarılar</h3><button class="jt-link" data-go="alerts">Tümü</button></div>
        ${d.alerts.length ? d.alerts.map((a) => `
          <button class="jt-alert ${a.severity}" data-link="${esc(a.link?.type || '')}:${esc(a.link?.id || '')}">
            <i class="ph ${SEV[a.severity][0]}"></i><span><b>${esc(a.title)}</b><small>${esc(a.message)}</small></span>
          </button>`).join('') : empty('ph-bell-slash', 'Açık uyarı yok.')}
      </section>
    </div>`;

  // Açık siparişler: sipariş ve giden miktar çubukları
  api.get('/jt/orders').then((r) => {
    const open = r.data.filter((o) => o.state !== 'shipped' && o.state !== 'cancelled').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
    const box = root.querySelector('#jt-ov-orders');
    if (!box) return;
    box.innerHTML = open.length ? open.map((o) => `
      <button class="jt-row col" data-order="${esc(o.id)}">
        <span class="jt-row-line"><b>${esc(o.orderNo)}</b><small>${esc(o.customerName)} · termin ${fmtDate(o.dueDate)}</small></span>
        <span class="jt-mini"><small>Üretim %${o.progress}</small>${bar(o.progress)}</span>
        ${dualBar(o.orderedQty, o.shippedQty)}
      </button>`).join('') : empty('ph-package', 'Açık sipariş yok.');
  }).catch(() => {});

  root.onclick = (e) => {
    const t = e.target.closest('[data-go],[data-process],[data-order],[data-link]');
    if (!t) return;
    if (t.dataset.go) return ctx.go(t.dataset.go === 'late' ? 'jobs' : t.dataset.go, t.dataset.go === 'late' ? { late: true } : {});
    if (t.dataset.process) return ctx.go('jobs', { processId: t.dataset.process });
    if (t.dataset.order) return ctx.openOrder(t.dataset.order);
    if (t.dataset.link) ctx.openLink(t.dataset.link);
  };
}
