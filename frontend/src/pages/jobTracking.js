/**
 * İŞ & DURUM TAKİP MODÜLÜ
 * ERP (sipariş, satış/sevk, stok, reçete) + iş takip verisini tek ekranda toplar:
 *   Özet · Projeler · Siparişler · İşler · Performans · Uyarılar · Ekip & Yetki
 * Yönetim Paneli'nden şirket bazında açılıp kapatılır (Modüller > İş & Durum Takip).
 * Şirketin backend'i /jt uçlarını sunmalıdır (backend-hobiex).
 */
import router from '../core/router.js';
import AppConfig from '../core/config.js';
import { createHeader } from '../components/header.js';
import { api, can, ensureContext, state, esc, showToast, errorBox, loading } from './jobs/common.js';
import * as overview from './jobs/overview.js';
import * as projects from './jobs/projects.js';
import * as orders from './jobs/orders.js';
import * as jobs from './jobs/jobs.js';
import * as performance from './jobs/performance.js';
import * as alerts from './jobs/alerts.js';
import * as team from './jobs/team.js';

const TABS = [
  ['overview', 'Özet', 'ph-squares-four', () => true],
  ['projects', 'Projeler', 'ph-folders', () => true],
  ['orders', 'Siparişler', 'ph-package', () => true],
  ['jobs', 'İşler', 'ph-list-checks', () => true],
  ['performance', 'Performans', 'ph-gauge', () => can('jt.performance.all') || can('jt.performance.own')],
  ['alerts', 'Uyarılar', 'ph-bell-ringing', () => true],
  ['team', 'Ekip & Yetki', 'ph-lock-key', () => can('jt.users.manage')],
];
const VIEWS = { overview, projects, orders, jobs, performance, alerts, team };

export default function JobTrackingPage() {
  const container = document.createElement('div');
  container.className = 'page-container page-jobs';
  container.appendChild(createHeader({ title: AppConfig.modules.jobTracking?.label || 'İş & Durum Takip', showBack: true, gradientClass: 'gradient-stock' }));

  const content = document.createElement('div');
  content.className = 'content-area';
  content.innerHTML = loading();
  container.appendChild(content);

  const qTab = router.getQueryParams().tab;
  let tab = qTab || sessionStorage.getItem('jt_tab') || 'overview';
  let timer = null;

  const ctx = {
    go(next, params = {}) { if (next === 'jobs') jobs.setFilter(params); show(next); },
    openJob: (id, onChange) => jobs.openJob(id, ctx, onChange || refresh),
    openOrder: (id, onChange) => orders.openOrder(id, ctx, onChange || refresh),
    openProject: (id, onChange) => projects.openProject(id, ctx, onChange || refresh),
    openUser: (id) => performance.openUser(id, ctx),
    newJob: (preset, onDone) => jobs.jobForm(ctx, preset, onDone || refresh),
    openLink(link) {
      const [type, id] = String(link).split(':');
      if (!id) return;
      if (type === 'job') ctx.openJob(id); else if (type === 'order') ctx.openOrder(id); else if (type === 'project') ctx.openProject(id); else if (type === 'user') ctx.openUser(id);
    },
    setAlertCounts(c) {
      state.alertCounts = c;
      const n = (c.critical || 0) + (c.warning || 0);
      const badge = container.querySelector('[data-tab="alerts"] .jt-badge-n');
      if (badge) { badge.textContent = n; badge.hidden = !n; badge.classList.toggle('crit', !!c.critical); }
    },
  };

  function drawTabs() {
    const visible = TABS.filter((t) => t[3]());
    if (!visible.some((t) => t[0] === tab)) tab = 'overview';
    content.innerHTML = `
      <div class="jt-user"><span><i class="ph ph-user-circle"></i> ${esc(state.me.name)} <em>${esc(state.me.roleLabel || state.me.role)}</em></span></div>
      <nav class="jt-tabs" role="tablist">${visible.map(([id, label, icon]) => `<button role="tab" class="${id === tab ? 'active' : ''}" data-tab="${id}"><i class="ph ${icon}"></i><span>${label}</span>${id === 'alerts' ? '<b class="jt-badge-n" hidden></b>' : ''}</button>`).join('')}</nav>
      <div id="jt-view" class="jt-view"></div>`;
    ctx.setAlertCounts(state.alertCounts);
    content.querySelector('.jt-tabs').onclick = (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); };
  }

  function show(next) {
    tab = next;
    sessionStorage.setItem('jt_tab', tab);
    content.querySelectorAll('.jt-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    const view = content.querySelector('#jt-view');
    if (view) { view.onclick = null; VIEWS[tab].render(view, ctx); }
  }
  const refresh = () => show(tab);

  // Uyarı sayacı ve yeni kritik uyarı bildirimi (60 sn'de bir)
  async function pollAlerts() {
    if (!container.isConnected) { clearInterval(timer); return; }
    try {
      const d = (await api.get('/jt/alerts')).data;
      ctx.setAlertCounts(d.counts);
      const seen = new Set(JSON.parse(sessionStorage.getItem('jt_seen') || '[]'));
      const fresh = d.alerts.filter((a) => a.severity === 'critical' && !seen.has(a.key));
      if (fresh.length && seen.size) showToast(`${fresh.length} yeni kritik uyarı: ${fresh[0].title}`, 'warning', 6000);
      d.alerts.forEach((a) => seen.add(a.key));
      sessionStorage.setItem('jt_seen', JSON.stringify([...seen].slice(-300)));
    } catch (_e) { /* bir sonraki turda tekrar denenir */ }
  }

  (async () => {
    try {
      await ensureContext(true);
      if (!can('jt.view')) { content.innerHTML = errorBox({ message: 'İş takip modülünü görme yetkiniz yok.' }); return; }
      drawTabs();
      show(tab);
      pollAlerts();
      timer = setInterval(pollAlerts, 60000);
    } catch (e) {
      const unsupported = /404|Bulunamad/i.test(e.message || '');
      content.innerHTML = errorBox({ message: unsupported ? 'Bu şirketin backend’i İş Takip modülünü desteklemiyor. Yönetim Paneli > Bağlantı bölümünden doğru API adresini seçin veya modülü kapatın.' : e.message });
    }
  })();

  return container;
}
