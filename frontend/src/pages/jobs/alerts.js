/** Uyarılar: geciken iş / sipariş, riskli teslimat, engelli ve atanmamış işler, düşük performans */
import { api, esc, can, fmtDate, empty, errorBox, loading, guard, showToast } from './common.js';

const SEV = { critical: ['ph-warning-octagon', 'Kritik'], warning: ['ph-warning', 'Uyarı'], info: ['ph-info', 'Bilgi'] };
let sev = 'all';
let showAcked = false;

export async function render(root, ctx) {
  root.innerHTML = loading();
  let d;
  try { d = (await api.get(`/jt/alerts${showAcked ? '?all=1' : ''}`)).data; } catch (e) { root.innerHTML = errorBox(e); return; }
  ctx.setAlertCounts(d.counts);
  const list = d.alerts.filter((a) => sev === 'all' || a.severity === sev);
  const c = d.counts;

  root.innerHTML = `
    <div class="jt-toolbar">
      <div class="jt-chips">
        <button class="${sev === 'all' ? 'active' : ''}" data-sev="all">Tümü <em>${c.critical + c.warning + c.info}</em></button>
        <button class="${sev === 'critical' ? 'active' : ''}" data-sev="critical">Kritik <em class="bad">${c.critical}</em></button>
        <button class="${sev === 'warning' ? 'active' : ''}" data-sev="warning">Uyarı <em>${c.warning}</em></button>
        <button class="${sev === 'info' ? 'active' : ''}" data-sev="info">Bilgi <em>${c.info}</em></button>
      </div>
      <label class="jt-toggle"><input type="checkbox" id="f-acked" ${showAcked ? 'checked' : ''}/> Kapatılanları göster</label>
    </div>
    <div class="jt-alerts">
      ${list.length ? list.map((a) => `
        <article class="jt-alert-card ${a.severity} ${a.acked ? 'acked' : ''}">
          <i class="ph ${SEV[a.severity][0]}"></i>
          <div class="body" data-link="${esc(a.link?.type || '')}:${esc(a.link?.id || '')}">
            <b>${esc(a.title)}</b>
            <p>${esc(a.message)}</p>
            <small>${a.assigneeName ? 'Sorumlu: ' + esc(a.assigneeName) + ' · ' : ''}${a.dueDate ? 'Tarih: ' + fmtDate(a.dueDate) : ''}${a.acked ? ' · kapatıldı' : ''}</small>
          </div>
          ${can('jt.alerts.ack') && !a.acked ? `<button class="btn btn-secondary jt-ack" data-ack="${esc(a.key)}" title="Uyarıyı kapat"><i class="ph ph-check"></i> Kapat</button>` : ''}
        </article>`).join('') : empty('ph-bell-slash', 'Açık uyarı yok. Her şey planlandığı gibi.')}
    </div>`;

  root.onclick = (e) => {
    const s = e.target.closest('[data-sev]'); if (s) { sev = s.dataset.sev; return render(root, ctx); }
    const ack = e.target.closest('[data-ack]');
    if (ack) return guard(ack, async () => { await api.post('/jt/alerts/ack', { key: ack.dataset.ack }); showToast('Uyarı kapatıldı', 'success'); render(root, ctx); });
    const l = e.target.closest('[data-link]'); if (l) ctx.openLink(l.dataset.link);
  };
  root.querySelector('#f-acked').onchange = (e) => { showAcked = e.target.checked; render(root, ctx); };
}
