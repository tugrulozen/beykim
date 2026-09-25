/**
 * Nakit akışı tablosu: gerçekleşen hareketler + vade tahmini, yürüyen bakiye, dönem özeti.
 * Kaynak: GET /api/finance/cashflow/table · Planlı kalem: GET/POST/PUT /api/finance/planned
 * Filtreler adres çubuğunda tutulur (#/cashflow?from=..&to=..&groupBy=week) → paylaşılabilir / geri tuşu çalışır.
 */
import api from '../core/api.js';
import router from '../core/router.js';
import { esc } from '../core/html.js';
import { showToast } from '../components/toast.js';
import { formDialog, choiceDialog } from '../components/dialog.js';
import { exportTable, exportButton } from '../core/exportTable.js';
import { money, ymd, addDays, fdate, openTarget } from './links.js';

const DEFAULTS = () => { const t = ymd(new Date()); return { from: addDays(t, -30), to: addDays(t, 60), groupBy: 'week', currency: 'TRY', direction: '', kind: '', category: '', q: '' }; };
const GROUP = [['day', 'Gün'], ['week', 'Hafta'], ['month', 'Ay']];

export function CashflowPage() {
  const el = document.createElement('div');
  el.className = 'fa-page fa-cashflow';
  const qp = router.getQueryParams();
  const f = { ...DEFAULTS(), ...Object.fromEntries(Object.entries(qp).filter(([k]) => k in DEFAULTS())) };
  let data = null, meta = null;

  const syncUrl = () => {
    const q = Object.entries(f).filter(([k, v]) => v && v !== DEFAULTS()[k]).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    history.replaceState(null, '', `#/cashflow${q ? `?${q}` : ''}`); // hashchange tetiklemeden adresi güncelle
  };

  async function load() {
    const body = el.querySelector('.fa-cf-body');
    body.innerHTML = '<div class="loading-spinner"></div>';
    syncUrl();
    try {
      const q = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      [data, meta] = await Promise.all([api.get(`/finance/cashflow/table?${q}`).then((r) => r.data), meta ? meta : api.get('/finance/meta').then((r) => r.data)]);
      render();
    } catch (e) { body.innerHTML = `<div class="card fin-err">${esc(e.message)}</div>`; }
  }

  function render() {
    const c = data.currency;
    const cat = el.querySelector('[name="category"]');
    cat.innerHTML = `<option value="">Tüm kategoriler</option>${data.categories.map((x) => `<option ${x === f.category ? 'selected' : ''}>${esc(x)}</option>`).join('')}`;
    el.querySelector('[data-act="plan"]').hidden = !meta.canManage;
    const low = data.lowPoint;
    el.querySelector('.fa-cf-kpis').innerHTML = `
      <div class="fa-kpi"><small>Açılış (${fdate(data.from)})</small><b>${money(data.opening, c)}</b></div>
      <div class="fa-kpi ev-recv"><small>Toplam giriş</small><b>+${money(data.totals.in, c)}</b></div>
      <div class="fa-kpi ev-late"><small>Toplam çıkış</small><b>−${money(data.totals.out, c)}</b></div>
      <div class="fa-kpi"><small>Kapanış (${fdate(data.to)})</small><b>${money(data.closing, c)}</b></div>
      <div class="fa-kpi ${low && low.balance < 0 ? 'ev-late' : ''}"><small>En düşük bakiye</small><b>${low ? `${money(low.balance, c)}` : '—'}</b>${low ? `<small>${fdate(low.date)}</small>` : ''}</div>`;

    const max = Math.max(1, ...data.periods.map((p) => Math.max(p.in, p.out)));
    const pLabel = (k) => (data.groupBy === 'month' ? new Date(`${k}-01T00:00:00`).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }) : data.groupBy === 'week' ? `${fdate(k).slice(0, 6)} hf.` : fdate(k).slice(0, 6));
    const bars = data.periods.map((p) => `<div class="fa-bar" title="${esc(`${pLabel(p.key)} · giriş ${money(p.in, c)} · çıkış ${money(p.out, c)} · bakiye ${money(p.closing, c)}`)}">
      <div class="fa-bar-cols"><i class="in ${p.forecastIn >= p.in && p.in ? 'fc' : ''}" style="height:${(p.in / max) * 100}%"></i><i class="out ${p.forecastOut >= p.out && p.out ? 'fc' : ''}" style="height:${(p.out / max) * 100}%"></i></div>
      <small>${pLabel(p.key)}</small><em class="${p.closing < 0 ? 'neg' : ''}">${money(p.closing, c).replace(/,\d+/, '')}</em></div>`).join('');

    const rows = data.rows.map((r) => `<tr class="${r.kind === 'forecast' ? 'fc' : ''} ${r.target ? 'link' : ''}" data-id="${esc(r.id)}">
      <td class="c-date">${fdate(r.date)}${r.overdue ? `<br><span class="fin-chip late">vade ${fdate(r.dueDate)}</span>` : ''}</td>
      <td class="c-kind">${r.kind === 'forecast' ? '<span class="fin-chip soon">Tahmin</span>' : '<span class="fin-chip ok">Gerçekleşen</span>'}</td>
      <td class="c-desc"><b>${esc(r.description || r.category)}</b><br><small>${esc(r.category)}${r.account ? ` · ${esc(r.account)}` : ''}</small></td>
      <td class="c-party">${esc(r.party.name || '')}</td>
      <td class="c-doc"><code>${esc(r.erpRef.docType)} ${esc(r.erpRef.docNo)}</code></td>
      <td class="num in c-amt">${r.direction === 'in' ? money(r.amount, c) : ''}</td>
      <td class="num out c-amt">${r.direction === 'out' ? money(r.amount, c) : ''}</td>
      <td class="num c-bal ${r.balance < 0 ? 'neg' : ''}"><b>${money(r.balance, c)}</b></td></tr>`).join('');

    el.querySelector('.fa-cf-body').innerHTML = `
      <div class="card fa-cf-chart"><div class="fin-card-head"><h3>Dönem özeti</h3><small><i class="dot in"></i> giriş <i class="dot out"></i> çıkış · soluk = tahmin · alt satır: dönem sonu bakiye</small></div><div class="fa-bars">${bars || '<p class="hint">Kayıt yok</p>'}</div></div>
      <div class="card fa-cf-table"><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>Tarih</th><th>Tür</th><th>Açıklama</th><th>Cari</th><th>ERP belge</th><th class="num">Giriş</th><th class="num">Çıkış</th><th class="num">Bakiye</th></tr></thead>
      <tbody><tr class="dim c-open"><td>${fdate(data.from)}</td><td colspan="6">Devreden bakiye</td><td class="num"><b>${money(data.opening, c)}</b></td></tr>${rows || `<tr><td colspan="8" class="hint">Filtreye uyan kayıt yok.</td></tr>`}</tbody></table></div></div>`;
  }

  // ---- planlı kalem (POST / PUT) ----
  async function plannedDialog(p) {
    const v = await formDialog({
      title: p ? 'Planlı kalem' : 'Planlı kalem ekle', icon: 'ph-calendar-plus', wide: true,
      message: p && p.status === 'realized' ? 'Bu kalem gerçekleşmiş; değiştirmek için Hareketler\'den ilgili kaydı iptal edin.' : 'Kira, maaş, vergi gibi henüz gerçekleşmemiş kalemler nakit akışı tahminine ve takvime girer.',
      confirmLabel: p ? 'Kaydet' : 'Ekle',
      fields: [
        { name: 'direction', label: 'Yön', type: 'select', options: [['out', 'Çıkış (gider)'], ['in', 'Giriş (gelir)']], value: p ? p.direction : 'out', half: true },
        { name: 'date', label: 'Tarih', type: 'date', value: p ? p.date : ymd(new Date()), half: true, required: true },
        { name: 'amount', label: 'Tutar', type: 'number', value: p ? p.amount : '', half: true, required: true },
        { name: 'currency', label: 'Para birimi', type: 'select', options: (meta.currencies || ['TRY']).map((x) => [x, x]), value: p ? p.currency : f.currency, half: true },
        { name: 'category', label: 'Kategori', type: 'select', options: [...new Set([...(meta.outCategories || []), ...(meta.inCategories || [])])].map((x) => [x, x]), value: p ? p.category : 'Diğer gider' },
        { name: 'description', label: 'Açıklama', value: p ? p.description : '', required: true },
        { name: 'erpDocType', label: 'ERP belge türü', type: 'select', options: [['', '—'], ['SF', 'SF · Satış faturası'], ['AF', 'AF · Alış faturası'], ['SIP', 'SIP · Sipariş'], ['PLN', 'PLN · Planlı']], value: p ? p.erpDocType || '' : '', half: true },
        { name: 'erpDocNo', label: 'ERP belge no', value: p ? p.erpDocNo || '' : '', half: true },
      ],
    });
    if (!v) return;
    try {
      const r = p ? await api.put(`/finance/planned/${encodeURIComponent(p.id)}`, v) : await api.post('/finance/planned', v);
      showToast(r.message, 'success'); load();
    } catch (e) { showToast(e.message, 'error'); }
  }
  async function openPlanned(id) {
    try {
      const p = (await api.get('/finance/planned')).data.find((x) => x.id === id);
      if (!p) return showToast('Planlı kalem bulunamadı.', 'error');
      if (!meta.canManage || p.status !== 'planned') return plannedDialog(p);
      const pick = await choiceDialog({ title: p.description || 'Planlı kalem', message: `${fdate(p.date)} · ${money(p.amount, p.currency)}`, icon: 'ph-calendar-check',
        options: [{ value: 'edit', label: 'Düzenle', icon: 'ph-pencil-simple' }, { value: 'realize', label: 'Gerçekleşti (hesaba işle)', icon: 'ph-check-circle' }, { value: 'cancel', label: 'İptal et', icon: 'ph-x-circle' }] });
      if (pick === 'edit') return plannedDialog(p);
      if (pick === 'cancel') { showToast((await api.put(`/finance/planned/${encodeURIComponent(id)}`, { status: 'cancelled' })).message, 'success'); return load(); }
      if (pick === 'realize') {
        const acc = (meta.accounts || []).filter((a) => a.active && a.currency === p.currency).map((a) => [a.id, `${a.name} · ${money(a.balance, a.currency)}`]);
        const v = await formDialog({ title: 'Hesaba işle', icon: 'ph-check-circle', confirmLabel: 'İşle', fields: [{ name: 'accountId', label: 'Hesap', type: 'select', options: acc, required: true }, { name: 'date', label: 'Tarih', type: 'date', value: ymd(new Date()), required: true }] });
        if (!v) return;
        showToast((await api.put(`/finance/planned/${encodeURIComponent(id)}`, { status: 'realized', ...v })).message, 'success'); load();
      }
    } catch (e) { showToast(e.message, 'error'); }
  }

  el.innerHTML = `
    <form class="card fa-filters" autocomplete="off">
      <label>Başlangıç<input type="date" name="from" value="${esc(f.from)}"></label>
      <label>Bitiş<input type="date" name="to" value="${esc(f.to)}"></label>
      <label>Grupla<select name="groupBy">${GROUP.map(([v, l]) => `<option value="${v}" ${f.groupBy === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>Para birimi<select name="currency">${['TRY', 'USD', 'EUR', 'GBP'].map((x) => `<option ${f.currency === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label>Yön<select name="direction"><option value="">Giriş + çıkış</option><option value="in" ${f.direction === 'in' ? 'selected' : ''}>Yalnız giriş</option><option value="out" ${f.direction === 'out' ? 'selected' : ''}>Yalnız çıkış</option></select></label>
      <label>Kayıt<select name="kind"><option value="">Gerçekleşen + tahmin</option><option value="actual" ${f.kind === 'actual' ? 'selected' : ''}>Gerçekleşen</option><option value="forecast" ${f.kind === 'forecast' ? 'selected' : ''}>Tahmin</option></select></label>
      <label>Kategori<select name="category"></select></label>
      <label class="grow">Ara<input type="search" name="q" value="${esc(f.q)}" placeholder="Cari, açıklama, belge no"></label>
      <div class="fa-filter-acts"><button type="button" class="btn btn-secondary btn-sm fa-more-filters" data-act="morefilters"><i class="ph ph-sliders-horizontal"></i> Filtreler</button><button type="button" class="btn btn-secondary btn-sm" data-act="reset" title="Filtreleri sıfırla"><i class="ph ph-arrow-counter-clockwise"></i><span> Sıfırla</span></button><button type="button" class="btn btn-primary btn-sm" data-act="plan" hidden><i class="ph ph-plus"></i><span> Planlı kalem</span></button>${exportButton('fa-cf-export')}</div>
    </form>
    <div class="fa-cf-kpis fa-kpis"></div>
    <div class="fa-cf-body"></div>`;

  let tq;
  el.querySelector('.fa-filters').addEventListener('input', (e) => {
    const n = e.target.name; if (!n) return;
    f[n] = e.target.value;
    clearTimeout(tq); tq = setTimeout(load, n === 'q' ? 350 : 0);
  });
  el.querySelector('.fa-filters').addEventListener('submit', (e) => e.preventDefault());
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (a?.dataset.act === 'reset') { Object.assign(f, DEFAULTS()); el.querySelectorAll('.fa-filters [name]').forEach((i) => { i.value = f[i.name] ?? ''; }); return load(); }
    if (a?.dataset.act === 'plan') return plannedDialog(null);
    if (a?.dataset.act === 'morefilters') { el.querySelector('.fa-filters').classList.toggle('open'); return; }
    if (e.target.closest('#fa-cf-export') && data) {
      return exportTable(`Nakit akışı ${data.from} - ${data.to}`, [['Tarih', 'date'], ['Tür', (r) => (r.kind === 'forecast' ? 'Tahmin' : 'Gerçekleşen')], ['Açıklama', 'description'], ['Kategori', 'category'], ['Cari', (r) => r.party.name], ['Cari kodu', (r) => r.party.id || ''],
        ['ERP belge', (r) => `${r.erpRef.docType} ${r.erpRef.docNo}`], ['Giriş', (r) => (r.direction === 'in' ? r.amount : '')], ['Çıkış', (r) => (r.direction === 'out' ? r.amount : '')], ['Bakiye', 'balance']], data.rows);
    }
    const tr = e.target.closest('tr[data-id]');
    if (tr && data) {
      const r = data.rows.find((x) => x.id === tr.dataset.id);
      if (r?.target?.route === 'cashflow') return openPlanned(r.target.params.planned);
      if (r?.target) openTarget(r.target);
    }
  });

  load().then(() => { if (qp.planned && meta) openPlanned(qp.planned); });
  return el;
}
