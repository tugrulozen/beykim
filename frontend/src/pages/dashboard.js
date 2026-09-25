/**
 * DEPO TAKİP - Ana Sayfa
 * Masaüstü: Genel bakış (özet kartlar, stok hareketleri, depo dağılımı) + hızlı işlemler
 * Mobil: marka başlığı, modül kutuları, CoPilot kartı
 */

import AppConfig from '../core/config.js';
import Auth from '../core/auth.js';
import api from '../core/api.js';
import router from '../core/router.js';
import { esc, navModules } from '../components/shell.js';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DONUT_COLORS = ['var(--primary)', '#F0A93B', '#22A06B', '#0EA5E9', '#64748B', '#A855F7'];
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('tr-TR'));

function barChart(monthly) {
  if (!monthly?.length || monthly.every((m) => !m.value)) return '<div class="chart-empty">Henüz hareket kaydı yok</div>';
  const W = 560, H = 220, pad = { l: 36, b: 24, t: 8 };
  const max = Math.max(...monthly.map((m) => m.value));
  const step = Math.pow(10, Math.floor(Math.log10(max || 1)));
  const top = Math.max(Math.ceil(max / step) * step, 4);
  const bw = (W - pad.l) / monthly.length;
  const y = (v) => H - pad.b - (v / top) * (H - pad.b - pad.t);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => `
    <line x1="${pad.l}" x2="${W}" y1="${y(top * f)}" y2="${y(top * f)}" class="grid" />
    <text x="${pad.l - 6}" y="${y(top * f) + 4}" text-anchor="end" class="axis">${fmt(Math.round(top * f))}</text>`).join('');
  const bars = monthly.map((m, i) => {
    const x = pad.l + i * bw + bw * 0.2;
    const h = H - pad.b - y(m.value);
    const label = MONTHS[Number(m.month.slice(5, 7)) - 1];
    return `<rect x="${x}" y="${y(m.value)}" width="${bw * 0.6}" height="${Math.max(h, 0)}" rx="3" class="bar"><title>${label}: ${fmt(m.value)}</title></rect>
      <text x="${x + bw * 0.3}" y="${H - 6}" text-anchor="middle" class="axis">${label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Aylık stok hareketleri">${grid}${bars}</svg>`;
}

function donutChart(items) {
  const total = (items || []).reduce((s, i) => s + i.value, 0);
  if (!total) return '<div class="chart-empty">Henüz depo hareketi yok</div>';
  const r = 60, c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = items.map((it, i) => {
    const len = (it.value / total) * c;
    const arc = `<circle r="${r}" cx="80" cy="80" fill="none" stroke="${DONUT_COLORS[i % DONUT_COLORS.length]}" stroke-width="26"
      stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"><title>${esc(it.name)}: ${fmt(it.value)}</title></circle>`;
    offset += len;
    return arc;
  }).join('');
  const legend = items.map((it, i) => `
    <li><span class="dot" style="background:${DONUT_COLORS[i % DONUT_COLORS.length]}"></span>${esc(it.name)}<b>%${Math.round((it.value / total) * 100)}</b></li>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 160 160" class="donut">${arcs}</svg><ul class="legend">${legend}</ul></div>`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
}

export default function DashboardPage() {
  const container = document.createElement('div');
  container.className = 'page-dashboard dash';

  // Kutularda Ayarlar/Yardım/CoPilot yok (alt menüde ve kartta ayrıca var)
  const tiles = navModules().filter(([k]) => !['settings', 'help', 'copilot'].includes(k));
  const copilot = AppConfig.modules.copilot;
  const [firstWord, ...rest] = AppConfig.appName.split(' ');

  container.innerHTML = `
    <div class="dash-mhead">
      <div class="brand">
        <div class="brand-logo"><img src="${AppConfig.logoUrl}" alt="${esc(AppConfig.companyName)}" /></div>
        <div class="brand-name">${esc(firstWord)}${rest.length ? `<br>${esc(rest.join(' '))}` : ''}</div>
      </div>
      <button class="bell" id="bell-btn" title="Kritik stoklar"><i class="ph ph-bell"></i><span class="bell-badge" hidden></span></button>
    </div>
    <div class="bell-pop" id="bell-pop" hidden></div>

    <section class="dash-overview">
      <h2 class="dash-h">Genel Bakış</h2>
      <div class="dash-hero">
        <div><h2>${greeting()}, ${esc((Auth.getUser()?.name || 'Kullanıcı').split(' ')[0])}</h2><p>${esc(AppConfig.companyName)} ${esc(AppConfig.terms.depotOf)} bugünkü durumu</p></div>
        <span class="dash-hero-chip"><i class="ph ph-calendar-blank"></i>${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Toplam Stok</div><span class="kpi-ico"><i class="ph ph-package"></i></span></div><div class="kpi-value" data-kpi="totalStock">—</div><div class="kpi-sub" data-kpi-sub="productCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü ${esc(AppConfig.terms.sale)}</div><span class="kpi-ico"><i class="ph ${esc(AppConfig.terms.saleIcon)}"></i></span></div><div class="kpi-value" data-kpi="todaySales">—</div><div class="kpi-sub" data-kpi-sub="salesCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü Transfer</div><span class="kpi-ico"><i class="ph ph-arrows-left-right"></i></span></div><div class="kpi-value" data-kpi="todayTransfers">—</div><div class="kpi-sub">${esc(AppConfig.terms.warehouses)}</div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Kritik Stok</div><span class="kpi-ico"><i class="ph ph-warning"></i></span></div><div class="kpi-value" data-kpi="lowStockCount">—</div><div class="kpi-sub warn">10 adet ve altı</div></div>
      </div>
      <div class="charts">
        <div class="panel"><h3>Stok Hareketleri</h3><div id="bar-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
        <div class="panel"><h3>Depo Dağılımı</h3><div id="donut-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
      </div>
      <h2 class="dash-h">Hızlı İşlemler</h2>
    </section>

    <div class="tiles">
      ${tiles.map(([k, m]) => `
        <a class="tile" data-route="${m.route}" id="mod-${k}">
          <span class="tile-icon">${m.icon}</span>
          <span class="tile-label">${esc(m.label)}</span>
        </a>`).join('')}
    </div>

    ${copilot?.enabled ? `
    <a class="copilot-banner" data-route="${copilot.route}">
      <span class="cb-icon">${copilot.icon}</span>
      <span class="cb-text"><b>${esc(copilot.label)}</b><small>Depo verilerinizle konuşun</small></span>
      <i class="ph ph-caret-right"></i>
    </a>` : ''}
  `;

  container.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) return router.navigate(link.dataset.route);
    if (e.target.closest('#bell-btn')) {
      const pop = container.querySelector('#bell-pop');
      pop.hidden = !pop.hidden;
    }
  });

  loadStats(container);
  return container;
}

async function loadStats(container) {
  let s = null;
  try {
    const res = await api.get('/dashboard/stats');
    s = res?.data || null;
  } catch (e) {
    console.warn('Panel istatistikleri alınamadı:', e.message);
  }

  container.querySelectorAll('[data-kpi]').forEach((el) => { el.textContent = fmt(s?.[el.dataset.kpi]); });
  const sub = { productCount: (v) => `${fmt(v)} ürün çeşidi`, salesCount: (v) => `toplam ${fmt(v)} ${AppConfig.terms.sales}` };
  container.querySelectorAll('[data-kpi-sub]').forEach((el) => {
    const v = s?.[el.dataset.kpiSub];
    el.textContent = v == null ? '' : sub[el.dataset.kpiSub](v);
  });
  container.querySelector('#bar-chart').innerHTML = s ? barChart(s.monthly) : '<div class="chart-empty">Veri alınamadı</div>';
  container.querySelector('#donut-chart').innerHTML = s ? donutChart(s.warehouseDist) : '<div class="chart-empty">Veri alınamadı</div>';

  const low = s?.lowStock || [];
  // İş takip modülü açıksa geciken iş / sipariş uyarıları da zilde görünür
  let jobAlerts = [];
  if (AppConfig.modules.jobTracking?.enabled) {
    try {
      const a = (await api.get('/jt/alerts'))?.data;
      jobAlerts = (a?.alerts || []).filter((x) => x.severity !== 'info').slice(0, 5);
      jobAlerts.total = (a?.counts?.critical || 0) + (a?.counts?.warning || 0);
    } catch (_e) { /* yetki yok / backend desteklemiyor */ }
  }
  const badge = container.querySelector('.bell-badge');
  const notify = localStorage.getItem(AppConfig.storageKeys.notify) !== 'off';
  if (!notify) container.querySelector('#bell-btn').title = "Bildirimler kapalı (Ayarlar'dan açabilirsiniz)";
  const count = (s?.lowStockCount || 0) + (jobAlerts.total || 0);
  if (notify && count) { badge.hidden = false; badge.textContent = count > 9 ? '9+' : count; }
  const jobBlock = jobAlerts.length
    ? `<h4>İş takip uyarıları</h4><ul>${jobAlerts.map((a) => `<li><span>${esc(a.title)}</span></li>`).join('')}</ul><a class="bell-link" data-route="${AppConfig.modules.jobTracking.route}">Tümünü gör</a>`
    : '';
  container.querySelector('#bell-pop').innerHTML = !notify
    ? '<h4>Bildirimler kapalı</h4><p>Ayarlar sayfasından açabilirsiniz.</p>'
    : (jobBlock || low.length)
    ? `${jobBlock}${low.length ? `<h4>Kritik stoklar</h4><ul>${low.map((p) => `<li><span>${esc(p.name)}</span><b>${fmt(p.stock)} ${esc(p.unit || '')}</b></li>`).join('')}</ul>` : ''}`
    : '<h4>Bildirim yok</h4><p>Kritik seviyede ürün bulunmuyor.</p>';
}
