/**
 * DEPO TAKİP - Son İşlemler (Raporlar)
 * Kim, ne zaman, ne yaptı: satış, mal kabul, transfer, sayım, stok düzeltme, üretim, iş atama ...
 * Dönem, çalışan, işlem türü ve metin filtresi; Excel'e aktarma.
 */
import { reportTitle } from '../core/config.js';
import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { exportTable, exportButton } from '../core/exportTable.js';
import { esc } from '../components/shell.js';
import { showToast } from '../components/toast.js';

const CAT_ICON = { 'Satış': 'ph-storefront', 'Alış': 'ph-shopping-cart', 'Depo': 'ph-warehouse', 'Üretim': 'ph-factory', 'İş Takip': 'ph-kanban', 'Kullanıcı': 'ph-user-gear' };
const CAT_COLOR = { 'Satış': '#22A06B', 'Alış': '#F0A93B', 'Depo': '#0EA5E9', 'Üretim': '#A855F7', 'İş Takip': '#E5484D', 'Kullanıcı': '#64748B' };
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTs = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dayLabel = (iso) => {
  const d = new Date(iso); const t = new Date(); const y = new Date(Date.now() - 864e5);
  if (ymd(d) === ymd(t)) return 'Bugün';
  if (ymd(d) === ymd(y)) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
};
const PERIODS = [
  ['today', 'Bugün'], ['yesterday', 'Dün'], ['7', 'Son 7 gün'], ['30', 'Son 30 gün'], ['month', 'Bu ay'], ['lastmonth', 'Geçen ay'], ['all', 'Tümü'], ['custom', 'Özel aralık'],
];
/** 'YYYY-MM-DD' yerel gün başı → ISO anı (sunucu UTC çalışsa da gün sınırı kullanıcının saatine göre olur) */
const startOf = (ds) => { const [y, m, d] = ds.split('-').map(Number); return new Date(y, m - 1, d, 0, 0, 0, 0); };
const endOf = (ds) => { const x = startOf(ds); x.setDate(x.getDate() + 1); return x; };
function periodRange(p, custom) {
  const now = new Date(); const today = ymd(now);
  const back = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
  switch (p) {
    case 'today': return { from: today, to: today };
    case 'yesterday': return { from: back(1), to: back(1) };
    case '7': return { from: back(6), to: today };
    case '30': return { from: back(29), to: today };
    case 'month': return { from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, to: today };
    case 'lastmonth': { const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); return { from: ymd(s), to: ymd(e) }; }
    case 'custom': return custom;
    default: return {};
  }
}

export default function ActivityPage() {
  const container = document.createElement('div');
  container.className = 'page-activity page-container';
  container.appendChild(createHeader({ title: reportTitle('sonIslemler', 'Son İşlemler'), gradientClass: 'gradient-reports' }));

  const content = document.createElement('div');
  content.className = 'content-area';
  container.appendChild(content);

  const st = { period: 'today', from: '', to: '', userId: '', category: '', q: '' };
  let rows = []; let users = []; let cats = [];

  content.innerHTML = `
    <div class="act-filters card">
      <div class="act-chips" id="act-period">${PERIODS.map(([k, l]) => `<button type="button" class="sx-chip ${k === st.period ? 'on' : ''}" data-p="${k}">${l}</button>`).join('')}</div>
      <div class="act-custom" id="act-custom" hidden>
        <div class="input-field"><span class="input-icon"><i class="ph ph-calendar-blank"></i></span><input type="date" id="act-from" /></div>
        <div class="input-field"><span class="input-icon"><i class="ph ph-calendar-blank"></i></span><input type="date" id="act-to" /></div>
      </div>
      <div class="act-row">
        <div class="input-field"><span class="input-icon"><i class="ph ph-user"></i></span>
          <select id="act-user" class="input-element"><option value="">Tüm çalışanlar</option></select></div>
        <div class="input-field"><span class="input-icon"><i class="ph ph-funnel"></i></span>
          <select id="act-cat" class="input-element"><option value="">Tüm işlemler</option></select></div>
      </div>
      <div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="search" id="act-q" placeholder="Ara: ürün, müşteri, iş no (IS-0050), açıklama..." autocomplete="off" /></div>
    </div>
    <div class="list-toolbar"><span id="act-count"></span>${exportButton('act-export')}</div>
    <div id="act-list"></div>`;

  const $ = (s) => content.querySelector(s);
  const list = $('#act-list');

  async function load() {
    list.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';
    const r = periodRange(st.period, { from: st.from, to: st.to });
    const qs = new URLSearchParams();
    if (r.from) qs.set('from', startOf(r.from).toISOString());
    if (r.to) qs.set('to', endOf(r.to).toISOString()); // bitiş gününün sonu (hariç)
    if (st.userId) qs.set('userId', st.userId);
    if (st.category) qs.set('category', st.category);
    if (st.q) qs.set('q', st.q);
    qs.set('limit', '2000');
    try {
      const res = await api.get('/activity?' + qs.toString());
      if (!res.success) throw new Error(res.message || 'Kayıtlar okunamadı');
      rows = res.data.items;
      if (!users.length) users = res.data.users;
      if (!cats.length) cats = res.data.categories;
      fillSelects();
      render();
    } catch (e) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${esc(e.message)}</div></div>`;
    }
  }

  function fillSelects() {
    const u = $('#act-user'); const c = $('#act-cat');
    if (u.options.length <= 1) users.forEach((x) => u.add(new Option(x.name, x.id)));
    if (c.options.length <= 1) cats.forEach((x) => c.add(new Option(x, x)));
  }

  function render() {
    $('#act-count').textContent = `${rows.length.toLocaleString('tr-TR')} işlem`;
    if (!rows.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="ph ph-clock-counter-clockwise"></i></div><div class="empty-text">Bu filtrelerde işlem kaydı yok</div></div>';
      return;
    }
    let last = '';
    list.innerHTML = rows.map((r) => {
      const day = dayLabel(r.ts);
      const head = day !== last ? `<div class="act-day">${esc(day)}</div>` : '';
      last = day;
      const color = CAT_COLOR[r.category] || '#64748B';
      const time = new Date(r.ts);
      return `${head}
      <div class="act-item">
        <span class="act-ico" style="--c:${color}"><i class="ph ${CAT_ICON[r.category] || 'ph-circle'}"></i></span>
        <div class="act-body">
          <div class="act-title"><b>${esc(r.typeLabel)}</b>${r.refLabel ? `<span class="act-ref">${esc(r.refLabel)}</span>` : ''}</div>
          <div class="act-text">${esc(r.text)}</div>
          <div class="act-meta"><i class="ph ph-user"></i> ${esc(r.userName || '—')} <span>·</span> <i class="ph ph-clock"></i> ${pad(time.getHours())}:${pad(time.getMinutes())}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ---- olaylar ----
  $('#act-period').addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return;
    st.period = b.dataset.p;
    $('#act-period').querySelectorAll('.sx-chip').forEach((x) => x.classList.toggle('on', x === b));
    $('#act-custom').hidden = st.period !== 'custom';
    if (st.period === 'custom' && !(st.from && st.to)) return; // tarihler seçilince yüklenir
    load();
  });
  const onDate = () => {
    st.from = $('#act-from').value; st.to = $('#act-to').value;
    if (st.from && st.to) { if (st.to < st.from) return showToast('Bitiş tarihi başlangıçtan önce olamaz', 'warning'); load(); }
  };
  $('#act-from').addEventListener('change', onDate);
  $('#act-to').addEventListener('change', onDate);
  $('#act-user').addEventListener('change', (e) => { st.userId = e.target.value; load(); });
  $('#act-cat').addEventListener('change', (e) => { st.category = e.target.value; load(); });
  let t;
  $('#act-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value.trim(); load(); }, 300); });

  $('#act-export').addEventListener('click', () => {
    const label = PERIODS.find(([k]) => k === st.period)?.[1] || '';
    exportTable(`Son islemler ${label}`, [
      ['Tarih', (r) => fmtTs(r.ts)], ['Çalışan', 'userName'], ['Kategori', 'category'], ['İşlem', 'typeLabel'], ['Açıklama', 'text'], ['Referans', 'refLabel'],
    ], rows);
  });

  load();
  return container;
}
