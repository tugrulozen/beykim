/**
 * Finans takvimi: ay görünümü + gün ajandası.
 * Kaynak: GET /api/finance/calendar?from&to → events[{ id, type, status, date, amount, currency, title, party, erpRef, target }]
 * Tıklama: olay → openTarget(event.target) (ilgili kredi/cari/çek sayfası ve penceresi açılır)
 */
import api from '../core/api.js';
import router from '../core/router.js';
import { esc } from '../core/html.js';
import { money, ymd, addDays, fdate, EVENT_KIND, kindOf, openTarget } from './links.js';

// hücre içi kısa tutar: ₺149,1 B · ₺2,2 Mn (tam tutar ipucunda ve ajandada)
const short = (n, cur = 'TRY') => { try { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cur, notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0); } catch (_e) { return money(n, cur); } };
const WEEKDAYS =['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
// oturum boyunca kalan görünüm durumu (sayfalar arası gidip gelince ay ve filtre korunur)
const state = { month: null, hidden: new Set(['loan_paid']), selected: null };

export function CalendarPage() {
  const el = document.createElement('div');
  el.className = 'fa-page fa-calendar';
  const q = router.getQueryParams();
  if (/^\d{4}-\d{2}$/.test(q.month || '')) state.month = q.month;
  if (!state.month) state.month = ymd(new Date()).slice(0, 7);
  let data = null;

  const range = () => {
    const [y, m] = state.month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const start = addDays(ymd(first), -((first.getDay() + 6) % 7)); // pazartesiden başla
    return { start, end: addDays(start, 41) }; // 6 hafta
  };

  async function load() {
    const { start, end } = range();
    el.querySelector('.fa-cal-body').innerHTML = '<div class="loading-spinner"></div>';
    try {
      data = (await api.get(`/finance/calendar?from=${start}&to=${end}`)).data;
      render();
    } catch (e) { el.querySelector('.fa-cal-body').innerHTML = `<div class="card fin-err">${esc(e.message)}</div>`; }
  }

  const visible = () => data.events.filter((e) => !state.hidden.has(kindOf(e)));
  // takvimden önce vadesi geçmiş kalemler ilk güne değil "bugün"e toplanır; asıl vade etikette yazar
  const dayOf = (e) => (e.status === 'overdue' && e.date < range().start ? data.today : e.date);
  const chip = (e) => { const k = EVENT_KIND[kindOf(e)]; return `<button type="button" class="fa-ev ${k.cls}" data-ev="${esc(e.id)}" title="${esc(`${k.label} · ${e.title} · ${money(e.amount, e.currency)} · vade ${fdate(e.date)}`)}"><i class="ph ${k.icon}"></i><span>${esc(e.party.name || e.title)}</span><b>${short(e.amount, e.currency)}</b></button>`; };

  function render() {
    const { start } = range();
    const evs = visible();
    const byDay = evs.reduce((m, e) => { (m[dayOf(e)] = m[dayOf(e)] || []).push(e); return m; }, {});
    const t = data.totals;
    const sumTxt = (o) => Object.entries(o || {}).map(([c, v]) => money(v, c)).join(' + ') || money(0);
    el.querySelector('.fa-cal-sum').innerHTML = `
      <div class="fa-kpi ev-late"><small>Vadesi geçmiş kredi</small><b>${sumTxt(t.overdueLoans)}</b></div>
      <div class="fa-kpi ev-loan"><small>Yaklaşan kredi ödemesi</small><b>${sumTxt(t.upcomingLoans)}</b></div>
      <div class="fa-kpi ev-recv"><small>Tahsil edilecek</small><b>${sumTxt(t.receivables)}</b></div>`;
    const month = state.month;
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i);
      const list = (byDay[d] || []).sort((a, b) => (a.status === 'overdue' ? -1 : 0) - (b.status === 'overdue' ? -1 : 0));
      cells += `<div class="fa-day ${d.slice(0, 7) !== month ? 'out' : ''} ${d === data.today ? 'today' : ''} ${d === state.selected ? 'sel' : ''}" data-day="${d}">
        <span class="fa-dnum">${Number(d.slice(8))}</span>${list.slice(0, 3).map(chip).join('')}${list.length > 3 ? `<span class="fa-more">+${list.length - 3} daha</span>` : ''}</div>`;
    }
    el.querySelector('.fa-cal-body').innerHTML = `<div class="fa-grid">${WEEKDAYS.map((w) => `<div class="fa-wd">${w}</div>`).join('')}${cells}</div>`;
    el.querySelector('.fa-cal-title').textContent = new Date(`${month}-01T00:00:00`).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    renderAgenda(byDay);
  }

  function renderAgenda(byDay) {
    const box = el.querySelector('.fa-agenda');
    const day = state.selected;
    const list = day ? byDay[day] || [] : visible().filter((e) => e.status !== 'paid' && e.date <= addDays(data.today, 14)).sort((a, b) => a.date.localeCompare(b.date));
    box.innerHTML = `<h3>${day ? fdate(day) : 'Önümüzdeki 14 gün ve gecikenler'}</h3>${list.length ? list.map((e) => {
      const k = EVENT_KIND[kindOf(e)];
      return `<button type="button" class="fa-ag-row ${k.cls}" data-ev="${esc(e.id)}"><i class="ph ${k.icon}"></i><span class="fa-ag-main"><b>${esc(e.title)}</b><small>${esc(k.label)} · ${esc(e.erpRef.docType)} ${esc(e.erpRef.docNo)} · vade ${fdate(e.date)}</small></span><span class="fa-ag-amt ${e.direction}">${e.direction === 'in' ? '+' : '−'}${money(e.amount, e.currency)}</span><i class="ph ph-caret-right"></i></button>`;
    }).join('') : '<p class="hint">Bu gün için kayıt yok.</p>'}`;
  }

  el.innerHTML = `
    <div class="fa-toolbar">
      <div class="fa-cal-nav"><button class="icon-btn" data-nav="-1" aria-label="Önceki ay"><i class="ph ph-caret-left"></i></button><h2 class="fa-cal-title"></h2><button class="icon-btn" data-nav="1" aria-label="Sonraki ay"><i class="ph ph-caret-right"></i></button><button class="btn btn-secondary btn-sm" data-nav="0">Bugün</button></div>
      <div class="fa-legend">${Object.entries(EVENT_KIND).map(([k, v]) => `<label class="fa-leg ${v.cls}"><input type="checkbox" data-kind="${k}" ${state.hidden.has(k) ? '' : 'checked'}><i></i>${v.label}</label>`).join('')}</div>
    </div>
    <div class="fa-cal-sum fa-kpis"></div>
    <div class="fa-cal-wrap"><div class="card fa-cal-body"></div><aside class="card fa-agenda"></aside></div>`;

  el.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      const n = Number(nav.dataset.nav);
      const [y, m] = state.month.split('-').map(Number);
      state.month = n === 0 ? ymd(new Date()).slice(0, 7) : ymd(new Date(y, m - 1 + n, 1)).slice(0, 7);
      state.selected = null;
      return load();
    }
    const ev = e.target.closest('[data-ev]');
    // mobilde gün hücresindeki işaretler küçük: dokunuş günü seçer, ayrıntı ajandadan açılır
    const mobileCell = ev && ev.closest('.fa-day') && matchMedia('(max-width: 900px)').matches;
    if (ev && !mobileCell) { const x = data.events.find((i) => i.id === ev.dataset.ev); if (x) openTarget(x.target); return; }
    const day = e.target.closest('[data-day]');
    if (day && data) {
      state.selected = state.selected === day.dataset.day ? null : day.dataset.day;
      render();
      if (state.selected && matchMedia('(max-width: 900px)').matches) el.querySelector('.fa-agenda').scrollIntoView({ behavior: 'smooth', block: 'start' }); // mobilde ajanda takvimin altında
    }
  });
  el.addEventListener('change', (e) => {
    const k = e.target.dataset.kind; if (!k) return;
    if (e.target.checked) state.hidden.delete(k); else state.hidden.add(k);
    if (data) render();
  });
  load();
  return el;
}

/** Pano için kısa ajanda (önümüzdeki 14 gün + gecikenler) */
export function AgendaWidget() {
  const el = document.createElement('section');
  el.className = 'card fa-agenda fa-agenda-mini';
  el.innerHTML = '<div class="loading-spinner"></div>';
  const today = ymd(new Date());
  api.get(`/finance/calendar?from=${today}&to=${addDays(today, 14)}`).then((r) => {
    const all = r.data.events.filter((e) => e.status !== 'paid').sort((a, b) => a.date.localeCompare(b.date));
    const evs = all.slice(0, 6);
    el.innerHTML = `<div class="fin-card-head"><h3>Yaklaşan ve geciken vadeler</h3><a href="#/calendar">${all.length > evs.length ? `Tümü (${all.length}) · ` : ''}Takvimde gör <i class="ph ph-arrow-right"></i></a></div><div class="fa-ag-list">${evs.map((e) => {
      const k = EVENT_KIND[kindOf(e)];
      return `<button type="button" class="fa-ag-row ${k.cls}" data-ev="${esc(e.id)}"><i class="ph ${k.icon}"></i><span class="fa-ag-main"><b>${esc(e.title)}</b><small>${esc(k.label)} · ${fdate(e.date)}</small></span><span class="fa-ag-amt ${e.direction}">${e.direction === 'in' ? '+' : '−'}${money(e.amount, e.currency)}</span></button>`;
    }).join('') || '<p class="hint">Önümüzdeki 14 günde vade yok.</p>'}</div>`;
    el.onclick = (ev) => { const b = ev.target.closest('[data-ev]'); if (b) openTarget(r.data.events.find((x) => x.id === b.dataset.ev).target); };
  }).catch((e) => { el.innerHTML = `<p class="hint">${esc(e.message)}</p>`; });
  return el;
}
