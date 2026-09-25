/**
 * DEPO TAKİP - Finans
 * ERP'ye bağlı: müşteri bakiyeleri (satışlar) ve tedarikçi borçları (mal kabul) burada tahsil / ödenir.
 * Sekmeler: Özet · Hesaplar · Cari · Krediler · Çek/Senet · Hareketler · Yetkiler (yalnızca kullanıcı yönetimi yetkisi olanlara)
 * Yetki backend'de denetlenir (fin.view / fin.manage); arayüz yalnızca izinli düğmeleri gösterir.
 */
import AppConfig from '../core/config.js';
import api from '../core/api.js';
import router from '../core/router.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { confirmDialog, formDialog, htmlDialog } from '../components/dialog.js';
import { esc } from '../core/html.js';
import { exportTable, exportButton } from '../core/exportTable.js';
import { ensureContext, can as jtCan } from './jobs/common.js';
import * as team from './jobs/team.js';

// ---------- biçimlendirme ----------
const money = (n, cur = 'TRY') => { try { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(Number(n) || 0); } catch (_e) { return `${Number(n) || 0} ${cur}`; } };
const parseD = (s) => (s ? new Date(String(s).length <= 10 ? `${s}T00:00:00` : s) : null);
const fdate = (s) => { const d = parseD(s); return d && !isNaN(d) ? d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; };
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymd(new Date());
const monthLabel = (m) => { const [y, mo] = m.split('-'); return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('tr-TR', { month: 'short' }); };
const CUR_SYM = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
const KIND = {
  installment: { icon: 'ph-bank', label: 'Kredi taksiti' },
  cheque_out: { icon: 'ph-note-pencil', label: 'Ödenecek çek/senet' },
  cheque_in: { icon: 'ph-note', label: 'Tahsil edilecek çek/senet' },
  supplier: { icon: 'ph-truck', label: 'Tedarikçi ödemesi' },
};
const CHEQUE_STATUS = { pending: 'Bekliyor', collected: 'Tahsil edildi', paid: 'Ödendi', bounced: 'Karşılıksız / iade', cancelled: 'İptal' };
const LOAN_TYPE = [['annuity', 'Eşit taksit'], ['equal_principal', 'Eşit anapara'], ['bullet', 'Sonda anapara (aylık faiz)']];

function dueChip(daysLeft) {
  if (daysLeft == null) return '';
  if (daysLeft < 0) return `<span class="fin-chip late"><i class="ph ph-warning"></i> ${-daysLeft} gün gecikti</span>`;
  if (daysLeft === 0) return '<span class="fin-chip soon"><i class="ph ph-clock-countdown"></i> Bugün</span>';
  return `<span class="fin-chip ${daysLeft <= 7 ? 'soon' : ''}">${daysLeft} gün kaldı</span>`;
}
const empty = (text, icon = 'ph-tray') => `<div class="empty-state fin-empty"><i class="ph ${icon}"></i><p>${esc(text)}</p></div>`;
const loading = () => '<div class="loading-spinner"></div>';
const errBox = (msg) => `<div class="card fin-err"><i class="ph ph-warning-circle"></i> ${esc(msg)}</div>`;

/**
 * @param {{ embedded?: boolean }} opts embedded: bağımsız finans uygulamasında (finance.html) başlık ve sekme çubuğu
 *   gizlenir; gezinme uygulamanın kendi menüsündedir. Derin bağlantılar her iki modda da çalışır:
 *   ?tab=loans&loan=ID[&inst=ID] · ?tab=parties&sub=customers&customer=ID · ?tab=parties&sub=suppliers&supplier=ID
 *   ?tab=cheques&cheque=ID · ?tab=ledger&tx=ID
 */
export default function FinancePage({ embedded = false } = {}) {
  const container = document.createElement('div');
  container.className = `page-finance page-container${embedded ? ' fin-embedded' : ''}`;
  if (!embedded) container.appendChild(createHeader({ title: AppConfig.modules.finance?.label || 'Finans', gradientClass: 'gradient-reports' }));
  const content = document.createElement('div');
  content.className = 'content-area';
  container.appendChild(content);

  const TABS = [['overview', 'ph-chart-line-up', 'Özet'], ['accounts', 'ph-vault', 'Hesaplar'], ['parties', 'ph-users-three', 'Cari'], ['loans', 'ph-bank', 'Krediler'], ['cheques', 'ph-note', 'Çek/Senet'], ['ledger', 'ph-list-checks', 'Hareketler']];
  content.innerHTML = `
    <div class="seg-tabs fin-tabs" role="tablist">${TABS.map(([id, ic, l]) => `<button type="button" class="seg-tab" data-tab="${id}"><i class="ph ${ic}"></i> <span>${l}</span></button>${id === 'overview' && !embedded ? // WMS içinde Finans Merkezi ekranları Özet'ten hemen sonra (bağımsız uygulamada kendi menüsünde)
      '<a class="seg-tab fin-link" href="#/calendar"><i class="ph ph-calendar-dots"></i> <span>Takvim</span></a><a class="seg-tab fin-link" href="#/cashflow"><i class="ph ph-chart-bar"></i> <span>Nakit Akışı</span></a>' : ''}`).join('')}</div>
    <div id="fin-view"></div>`;
  const view = content.querySelector('#fin-view');

  let meta = null; // { accounts, currencies, inCategories, outCategories, remindDays, canManage }
  let tab = router.getQueryParams().tab || 'overview';
  let sub = router.getQueryParams().sub || 'customers';
  let ledgerFilter = { accountId: '', direction: '', q: '', from: '', to: '' };
  let renderToken = 0;
  const canManage = () => !!(meta && meta.canManage);

  async function loadMeta() {
    const r = await api.get('/finance/meta');
    meta = r.data;
    try { // kullanıcı/rol yönetimi (İş Takip modülü kapalı şirketlerde bu sekmeden yapılır)
      await ensureContext();
      if (jtCan('jt.users.manage') && !content.querySelector('[data-tab="team"]')) {
        content.querySelector('.fin-tabs').insertAdjacentHTML('beforeend', '<button type="button" class="seg-tab" data-tab="team"><i class="ph ph-lock-key"></i> <span>Yetkiler</span></button>');
        content.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
      }
    } catch (_e) { /* iş takip uçları yoksa sekme görünmez */ }
    return meta;
  }
  const accountOptions = (currency) => (meta.accounts || []).filter((a) => a.active && (!currency || a.currency === currency)).map((a) => [a.id, `${a.name} · ${money(a.balance, a.currency)}`]);

  function showTab(next) {
    tab = next;
    view.onclick = null; view.onchange = null; view.oninput = null; // sekme değişince eski dinleyiciler kalmasın
    content.querySelectorAll('.seg-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    const token = ++renderToken;
    view.innerHTML = loading();
    const run = { overview: renderOverview, accounts: renderAccounts, parties: renderParties, loans: renderLoans, cheques: renderCheques, ledger: renderLedger, team: renderTeam }[tab] || renderOverview;
    Promise.resolve().then(async () => { if (!meta) await loadMeta(); if (token === renderToken) await run(token); if (token === renderToken) applyDeepLink(); })
      .catch((e) => { if (token === renderToken) view.innerHTML = errBox(e.message || 'Finans verileri alınamadı.'); });
  }
  // sekme geçişi geçmişe yazılır: geri tuşu önceki sekmeye döner (bkz. router.step)
  const stepTo = (next, extra = {}) => { router.step({ tab: next, ...extra }); showTab(next); };
  content.querySelector('.seg-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b && b.dataset.tab !== tab) stepTo(b.dataset.tab); });
  const refresh = () => showTab(tab);
  const say = (r, fallback) => showToast((r && r.message) || fallback, 'success');
  async function act(fn) { try { const r = await fn(); if (r) { say(r); await loadMeta(); refresh(); } } catch (e) { showToast(e.message || 'İşlem yapılamadı', 'error'); } }
  const delegate = (handlers) => {
    view.onclick = (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || !handlers[b.dataset.act]) return;
      handlers[b.dataset.act](b.dataset, b);
    };
  };

  // =====================================================================
  // ORTAK İŞLEM PENCERELERİ
  // =====================================================================
  const payDialog = ({ title, message, currency, amount, dateLabel = 'Tarih', confirmLabel = 'Kaydet', extra = [] }) => formDialog({
    title, message, confirmLabel, icon: 'ph-hand-coins',
    fields: [
      { name: 'accountId', label: 'Hesap', type: 'select', options: accountOptions(currency), required: true },
      { name: 'amount', label: 'Tutar', type: 'number', value: amount != null ? amount : '', min: 0, half: true, required: true },
      { name: 'date', label: dateLabel, type: 'date', value: today(), half: true, required: true },
      ...extra,
    ],
    validate: (v) => (!v.accountId ? `${currency || ''} cinsinden bir hesap açmanız gerekir (Hesaplar sekmesi).` : !(v.amount > 0) ? 'Tutar sıfırdan büyük olmalı.' : ''),
  });

  const collect = (c) => act(async () => {
    const v = await payDialog({ title: `Tahsilat · ${c.name}`, message: `Mevcut bakiye: ${money(c.balance, c.currency)}`, currency: c.currency, amount: c.balance > 0 ? c.balance : '', confirmLabel: 'Tahsil et', extra: [{ name: 'note', label: 'Not / yöntem', placeholder: 'Havale, EFT, nakit …' }] });
    return v && api.post(`/finance/customers/${encodeURIComponent(c.id)}/payment`, { accountId: v.accountId, amount: v.amount, date: v.date, note: v.note });
  });
  const paySupplier = (s, amount) => act(async () => {
    const v = await payDialog({ title: `Ödeme · ${s.name}`, message: `Toplam borç: ${money(s.balance, s.currency)}`, currency: s.currency, amount: amount != null ? amount : s.balance > 0 ? s.balance : '', confirmLabel: 'Öde', extra: [{ name: 'note', label: 'Not', placeholder: 'Fatura no, havale …' }] });
    return v && api.post(`/finance/suppliers/${encodeURIComponent(s.id)}/payment`, { accountId: v.accountId, amount: v.amount, date: v.date, note: v.note });
  });
  const payInstallment = (id, title, currency, rest) => act(async () => {
    const v = await payDialog({ title: 'Taksit ödemesi', message: `${title} · kalan ${money(rest, currency)}`, currency, amount: rest, confirmLabel: 'Öde', dateLabel: 'Ödeme tarihi' });
    return v && api.post(`/finance/installments/${encodeURIComponent(id)}/pay`, { accountId: v.accountId, amount: v.amount, date: v.date });
  });
  const settleCheque = (c) => act(async () => {
    const out = c.kind === 'payable';
    const v = await payDialog({ title: out ? 'Çek/senet ödemesi' : 'Çek/senet tahsilatı', message: `${c.partyName || ''} · ${money(c.amount, c.currency)}`, currency: c.currency, amount: c.amount, confirmLabel: out ? 'Ödendi' : 'Tahsil edildi', dateLabel: 'İşlem tarihi' });
    return v && api.post(`/finance/cheques/${encodeURIComponent(c.id)}/settle`, { accountId: v.accountId, date: v.date });
  });

  function statementHtml(lines, opening, cur, partyKind) {
    const rows = lines.map((l) => `<tr><td>${fdate(l.date)}</td><td>${esc(l.text)}</td><td class="num">${l.debit ? money(l.debit, cur) : ''}</td><td class="num">${l.credit ? money(l.credit, cur) : ''}</td><td class="num"><b>${money(l.balance, cur)}</b></td></tr>`).join('');
    const openRow = opening ? `<tr class="dim"><td>—</td><td>Devir bakiye</td><td></td><td></td><td class="num">${money(opening, cur)}</td></tr>` : '';
    const heads = partyKind === 'supplier' ? ['Tarih', 'Açıklama', 'Ödeme', 'Mal kabul (borç)', 'Kalan borç'] : ['Tarih', 'Açıklama', 'Borç (satış)', 'Alacak (tahsilat/iade)', 'Bakiye'];
    return `<div class="fin-tablewrap"><table class="fin-table"><thead><tr>${heads.map((h, i) => `<th class="${i > 1 ? 'num' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${openRow}${rows || '<tr><td colspan="5">Hareket yok.</td></tr>'}</tbody></table></div>`;
  }
  async function showStatement(kind, id) {
    try {
      const r = await api.get(`/finance/${kind === 'supplier' ? 'suppliers' : 'customers'}/${encodeURIComponent(id)}/statement`);
      const p = kind === 'supplier' ? r.data.supplier : r.data.customer;
      const opening = kind === 'supplier' ? 0 : r.data.opening;
      const res = await htmlDialog({
        title: `${p.name} · Ekstre`, icon: 'ph-receipt',
        html: `<p>Güncel ${kind === 'supplier' ? 'borç' : 'bakiye'}: <b>${money(p.balance, p.currency)}</b>${kind === 'customer' ? ` · vade ${p.paymentTerm} gün` : ''}</p>${statementHtml(r.data.lines, opening, p.currency, kind)}`,
        extra: [{ label: 'Dışa aktar', cls: 'btn-secondary', icon: 'ph-download-simple', value: 'export' }],
      });
      if (res === 'export') exportTable(`${p.name} ekstre`, [['Tarih', (l) => l.date], ['Açıklama', 'text'], [kind === 'supplier' ? 'Ödeme' : 'Borç', 'debit'], [kind === 'supplier' ? 'Mal kabul' : 'Alacak', 'credit'], ['Bakiye', 'balance']], r.data.lines);
    } catch (e) { showToast(e.message, 'error'); }
  }

  // =====================================================================
  // ÖZET
  // =====================================================================
  async function renderOverview(token) {
    const [s, cf, rem] = await Promise.all([api.get('/finance/summary'), api.get('/finance/cashflow?months=6'), api.get('/finance/reminders')]);
    if (token !== renderToken) return;
    const d = s.data;
    const cur = [...new Set([...d.cash, ...d.receivables, ...d.payables, ...d.loans].map((x) => x.currency))];
    const get = (arr, c, k = 'total') => (arr.find((x) => x.currency === c) || {})[k] || 0;
    const lines = (arr, key = 'total') => (arr.length ? arr.map((x) => `<b>${money(x[key], x.currency)}</b>`).join('') : '<b>—</b>');
    const overdueLine = (arr) => arr.filter((x) => x.overdue > 0.004).map((x) => `<small class="bad">Vadesi geçmiş: ${money(x.overdue, x.currency)}</small>`).join('');
    const net = cur.map((c) => `<b>${money(get(d.cash, c) + get(d.receivables, c) - get(d.payables, c) - get(d.loans, c), c)}</b>`).join('');
    const upcoming = d.upcoming;
    const flowHtml = d.flow30.length ? d.flow30.map((f) => `<div class="fin-flow"><span class="in"><i class="ph ph-arrow-down-left"></i> ${money(f.in, f.currency)}</span><span class="out"><i class="ph ph-arrow-up-right"></i> ${money(f.out, f.currency)}</span><span class="net ${f.in - f.out < 0 ? 'bad' : 'good'}">Net ${money(f.in - f.out, f.currency)}</span></div>`).join('') : '<p class="hint">Önümüzdeki 30 günde vadesi gelen kalem yok.</p>';
    const maxBar = Math.max(1, ...cf.data.months.map((m) => Math.max(m.in, m.out)));
    const bars = cf.data.months.map((m) => `<div class="fin-bar"><div class="fin-bar-cols"><i class="in" style="height:${Math.round((m.in / maxBar) * 100)}%" title="Giriş ${money(m.in)}"></i><i class="out" style="height:${Math.round((m.out / maxBar) * 100)}%" title="Çıkış ${money(m.out)}"></i></div><span>${monthLabel(m.month)}</span></div>`).join('');
    const cats = cf.data.expenseByCategory.slice(0, 5);
    const catMax = Math.max(1, ...cats.map((c) => c.total));

    view.innerHTML = `
      ${d.overdueCount || d.dueSoonCount ? `<div class="fin-alert ${d.overdueCount ? 'late' : 'soon'}"><i class="ph ${d.overdueCount ? 'ph-warning' : 'ph-bell-ringing'}"></i><div>${d.overdueCount ? `<b>${d.overdueCount} kredi/çek/tedarikçi kaleminin vadesi geçti.</b> ` : ''}${d.dueSoonCount ? `${d.dueSoonCount} kalemin vadesi 7 gün içinde doluyor.` : ''}</div></div>` : ''}
      <div class="fin-kpis">
        <div class="fin-kpi"><i class="ph ph-vault"></i><span>Nakit (kasa + banka)</span>${lines(d.cash)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Müşteri alacakları</span>${lines(d.receivables)}${overdueLine(d.receivables)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Tedarikçi borçları</span>${lines(d.payables)}${overdueLine(d.payables)}</div>
        <div class="fin-kpi"><i class="ph ph-bank"></i><span>Kredi borcu (kalan anapara)</span>${lines(d.loans)}${overdueLine(d.loans)}</div>
        <div class="fin-kpi net"><i class="ph ph-scales"></i><span>Net durum <em>nakit + alacak − borç − kredi</em></span>${net || '<b>—</b>'}</div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vadesi yaklaşan ve geciken ödemeler</h3><span class="hint">30 gün</span></div>
        ${upcoming.length ? `<div class="fin-list">${upcoming.map((u) => `
          <div class="fin-row ${u.daysLeft < 0 ? 'late' : ''}">
            <span class="fin-ico ${u.direction}"><i class="ph ${KIND[u.kind].icon}"></i></span>
            <div class="fin-main"><div class="fin-title">${esc(u.title)}</div><div class="fin-sub">${esc(u.party || KIND[u.kind].label)} · ${fdate(u.dueDate)} ${dueChip(u.daysLeft)}</div></div>
            <div class="fin-amt ${u.direction}">${u.direction === 'in' ? '+' : '−'}${money(u.amount, u.currency)}</div>
            ${canManage() ? `<button class="btn btn-secondary btn-sm" data-act="quick" data-kind="${u.kind}" data-id="${esc(u.id)}" data-cur="${u.currency}" data-amt="${u.amount}" data-title="${esc(u.title)}">${u.direction === 'in' ? 'Tahsil et' : 'Öde'}</button>` : ''}
          </div>`).join('')}</div>` : empty('Yaklaşan ödeme yok. Harika!', 'ph-confetti')}
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>30 günlük nakit beklentisi</h3></div>${flowHtml}</div>
        <div class="card fin-card"><div class="fin-card-head"><h3>En yüksek alacaklar</h3></div>
          ${d.topDebtors.length ? d.topDebtors.map((c) => `<div class="fin-line"><span>${esc(c.name)}${c.overdue > 0 ? ' <span class="fin-chip late">vadesi geçmiş</span>' : ''}</span><b>${money(c.balance, c.currency)}</b></div>`).join('') : '<p class="hint">Açık müşteri bakiyesi yok.</p>'}
        </div>
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>Nakit akışı · son 6 ay</h3><span class="hint">${CUR_SYM[cf.data.currency] || cf.data.currency}</span></div>
          <div class="fin-bars">${bars}</div><div class="fin-legend"><span class="in">■ Giriş</span><span class="out">■ Çıkış</span></div></div>
        <div class="card fin-card"><div class="fin-card-head"><h3>Gider dağılımı</h3></div>
          ${cats.length ? cats.map((c) => `<div class="fin-catrow"><div><span>${esc(c.category)}</span><b>${money(c.total, cf.data.currency)}</b></div><i style="width:${Math.round((c.total / catMax) * 100)}%"></i></div>`).join('') : '<p class="hint">Bu dönemde gider kaydı yok.</p>'}
        </div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vade hatırlatmaları</h3></div>
        <p class="hint">Kredi taksiti, çek/senet ve tedarikçi ödemelerinin vadesi yaklaşınca finans yetkilerine <b>bildirim</b> düşer (zil simgesi). Vade geçince her gün tekrar hatırlatılır.</p>
        <div class="fin-remind"><label>Hatırlatma günleri <small>vadeden kaç gün önce (virgülle)</small><input id="fin-days" type="text" value="${esc(meta.remindDays)}" ${canManage() ? '' : 'disabled'} /></label>
          ${canManage() ? '<button class="btn btn-secondary" data-act="saveDays">Kaydet</button><button class="btn btn-secondary" data-act="runRemind"><i class="ph ph-bell-ringing"></i> Şimdi hatırlat</button>' : ''}</div>
        <p class="hint">Şu an hatırlatma kapsamındaki kalem: <b>${rem.data.items.length}</b></p>
      </div>`;

    delegate({
      quick: (ds) => {
        if (ds.kind === 'installment') return payInstallment(ds.id, ds.title, ds.cur, Number(ds.amt));
        if (ds.kind === 'supplier') { const sid = ds.id.split(':')[0]; return act(async () => { const r = await api.get('/finance/suppliers'); const sp = r.data.find((x) => x.id === sid); if (!sp) throw new Error('Tedarikçi bulunamadı.'); paySupplier(sp, Number(ds.amt)); return null; }); }
        return act(async () => { const r = await api.get('/finance/cheques'); const c = r.data.find((x) => x.id === ds.id); if (!c) throw new Error('Kayıt bulunamadı.'); settleCheque(c); return null; });
      },
      saveDays: () => act(() => api.put('/finance/settings', { remindDays: view.querySelector('#fin-days').value })),
      runRemind: () => act(() => api.post('/finance/reminders/run', {})),
    });
  }

  // =====================================================================
  // HESAPLAR
  // =====================================================================
  async function renderAccounts(token) {
    const r = await api.get('/finance/accounts');
    if (token !== renderToken) return;
    meta.accounts = r.data;
    const totals = {};
    r.data.filter((a) => a.active).forEach((a) => { totals[a.currency] = (totals[a.currency] || 0) + a.balance; });
    view.innerHTML = `
      <div class="fin-toolbar">
        ${canManage() ? `<button class="btn btn-primary" data-act="tx" data-type="in"><i class="ph ph-plus-circle"></i> Gelir</button>
        <button class="btn btn-primary" data-act="tx" data-type="out"><i class="ph ph-minus-circle"></i> Gider</button>
        <button class="btn btn-secondary" data-act="tx" data-type="transfer"><i class="ph ph-arrows-left-right"></i> Virman</button>
        <button class="btn btn-secondary" data-act="newAcc"><i class="ph ph-vault"></i> Hesap aç</button>` : ''}
        ${exportButton('fin-acc-export')}
      </div>
      <div class="fin-kpis">${Object.entries(totals).map(([c, t]) => `<div class="fin-kpi"><i class="ph ph-coins"></i><span>Toplam ${c}</span><b>${money(t, c)}</b></div>`).join('') || ''}</div>
      ${r.data.length ? `<div class="fin-list">${r.data.map((a) => `
        <div class="card fin-acc ${a.active ? '' : 'off'}">
          <span class="fin-ico"><i class="ph ${a.type === 'cash' ? 'ph-money' : 'ph-bank'}"></i></span>
          <div class="fin-main"><div class="fin-title">${esc(a.name)} ${a.active ? '' : '<span class="fin-chip">Kapalı</span>'}</div><div class="fin-sub">${a.type === 'cash' ? 'Kasa' : 'Banka'} · ${a.currency}${a.iban ? ' · ' + esc(a.iban) : ''}</div></div>
          <div class="fin-amt ${a.balance < 0 ? 'out' : ''}">${money(a.balance, a.currency)}</div>
          <div class="fin-acts"><button class="btn btn-secondary btn-sm" data-act="acc-ledger" data-id="${esc(a.id)}">Hareketler</button>
          ${canManage() ? `<button class="btn btn-secondary btn-sm" data-act="acc-toggle" data-id="${esc(a.id)}" data-on="${a.active ? 1 : 0}">${a.active ? 'Kapat' : 'Aç'}</button>` : ''}</div>
        </div>`).join('')}</div>` : empty('Henüz hesap yok. Önce bir kasa veya banka hesabı açın.', 'ph-vault')}`;

    view.querySelector('#fin-acc-export').onclick = () => exportTable('Finans hesaplari', [['Hesap', 'name'], ['Tür', (a) => (a.type === 'cash' ? 'Kasa' : 'Banka')], ['Para birimi', 'currency'], ['IBAN', 'iban'], ['Bakiye', 'balance']], r.data);
    delegate({
      newAcc: () => act(async () => {
        const v = await formDialog({ title: 'Hesap aç', icon: 'ph-vault', fields: [
          { name: 'name', label: 'Hesap adı', required: true, placeholder: 'Örn. Ana Banka Hesabı' },
          { name: 'type', label: 'Tür', type: 'select', options: [['bank', 'Banka'], ['cash', 'Kasa']], half: true },
          { name: 'currency', label: 'Para birimi', type: 'select', options: meta.currencies.map((c) => [c, c]), half: true },
          { name: 'openingBalance', label: 'Açılış bakiyesi', type: 'number', value: 0 },
          { name: 'iban', label: 'IBAN (isteğe bağlı)' }] });
        return v && api.post('/finance/accounts', v);
      }),
      'acc-toggle': (ds) => act(async () => {
        const a = meta.accounts.find((x) => x.id === ds.id);
        if (ds.on === '1' && !(await confirmDialog({ title: 'Hesabı kapat', message: 'Kapalı hesaba yeni işlem yapılamaz; geçmiş hareketler ve bakiye korunur.', confirmLabel: 'Kapat' }))) return null;
        return api.put(`/finance/accounts/${encodeURIComponent(ds.id)}`, { name: a.name, iban: a.iban, active: ds.on !== '1' });
      }),
      'acc-ledger': (ds) => { ledgerFilter = { accountId: ds.id, direction: '', q: '', from: '', to: '' }; showTab('ledger'); },
      tx: (ds) => manualTx(ds.type),
    });
  }

  function manualTx(type) {
    return act(async () => {
      const acc = accountOptions();
      if (!acc.length) throw new Error('Önce bir hesap açın.');
      const isT = type === 'transfer';
      const v = await formDialog({
        title: isT ? 'Hesaplar arası virman' : type === 'in' ? 'Gelir kaydı' : 'Gider kaydı', icon: isT ? 'ph-arrows-left-right' : 'ph-coins',
        fields: [
          { name: 'accountId', label: isT ? 'Kaynak hesap' : 'Hesap', type: 'select', options: acc, required: true },
          ...(isT ? [{ name: 'toAccountId', label: 'Hedef hesap', type: 'select', options: acc, value: acc[1] ? acc[1][0] : '', required: true }] : [{ name: 'category', label: 'Kategori', type: 'select', options: (type === 'in' ? meta.inCategories : meta.outCategories).map((c) => [c, c]) }]),
          { name: 'amount', label: 'Tutar', type: 'number', min: 0, half: true, required: true },
          { name: 'date', label: 'Tarih', type: 'date', value: today(), half: true, required: true },
          { name: 'description', label: 'Açıklama', placeholder: 'İsteğe bağlı' },
        ],
        validate: (x) => (!(x.amount > 0) ? 'Tutar sıfırdan büyük olmalı.' : isT && x.accountId === x.toAccountId ? 'Kaynak ve hedef hesap farklı olmalı.' : ''),
      });
      return v && api.post('/finance/transactions', { ...v, type });
    });
  }

  // =====================================================================
  // CARİ (müşteri + tedarikçi)
  // =====================================================================
  async function renderParties(token) {
    const isCust = sub === 'customers';
    const r = await api.get(`/finance/${isCust ? 'customers' : 'suppliers'}`);
    if (token !== renderToken) return;
    const list = r.data.slice().sort((a, b) => b.balance - a.balance);
    view.innerHTML = `
      <div class="seg-tabs fin-sub"><button class="seg-tab ${isCust ? 'active' : ''}" data-act="sub" data-sub="customers"><i class="ph ph-users"></i> Müşteriler (alacak)</button><button class="seg-tab ${isCust ? '' : 'active'}" data-act="sub" data-sub="suppliers"><i class="ph ph-truck"></i> Tedarikçiler (borç)</button></div>
      <div class="fin-toolbar"><div class="input-field fin-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="fin-q" type="text" placeholder="${isCust ? 'Müşteri' : 'Tedarikçi'} ara…" /></div><label class="fin-check"><input type="checkbox" id="fin-open" checked /> Yalnızca bakiyesi olanlar</label>${exportButton('fin-party-export')}</div>
      <p class="hint">${isCust ? 'Bakiye, ERP satışlarından gelir; tahsilat yaptıkça düşer. Vade, müşteriye tanımlı ödeme süresidir (varsayılan 30 gün).' : 'Borç, satın almada mal kabul edilen tutardır (KDV dahil); vade = mal kabul tarihi + tedarikçi ödeme süresi.'}</p>
      <div id="fin-plist" class="fin-list"></div>`;

    const listEl = view.querySelector('#fin-plist');
    const draw = () => {
      const q = view.querySelector('#fin-q').value.trim().toLocaleLowerCase('tr');
      const onlyOpen = view.querySelector('#fin-open').checked;
      const rows = list.filter((p) => (!q || p.name.toLocaleLowerCase('tr').includes(q)) && (!onlyOpen || Math.abs(p.balance) > 0.004));
      listEl.innerHTML = rows.length ? rows.map((p) => isCust ? custRow(p) : supRow(p)).join('') : empty('Kayıt bulunamadı.');
    };
    const custRow = (c) => {
      const a = c.aging; const tot = Math.max(1, a.current + a.d30 + a.d60 + a.d90 + a.older);
      const seg = (v, cls) => (v > 0 ? `<i class="${cls}" style="width:${(v / tot) * 100}%" title="${money(v, c.currency)}"></i>` : '');
      return `<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${esc(c.name)}</div>
          <div class="fin-sub">Vade ${c.paymentTerm} gün${c.lastPayment ? ' · son tahsilat ' + fdate(c.lastPayment) : ''}${c.lastSale ? ' · son satış ' + fdate(c.lastSale) : ''}</div>
          ${c.balance > 0 ? `<div class="fin-aging">${seg(a.current, 'ok')}${seg(a.d30, 'w1')}${seg(a.d60, 'w2')}${seg(a.d90, 'w3')}${seg(a.older, 'w4')}</div>` : ''}
          ${c.overdue > 0 ? `<div class="fin-sub bad">Vadesi geçmiş: ${money(c.overdue, c.currency)}</div>` : ''}</div>
        <div class="fin-amt ${c.balance > 0 ? 'in' : c.balance < 0 ? 'out' : ''}">${money(c.balance, c.currency)}<small>${c.balance < 0 ? 'avans/alacaklı' : 'alacak'}</small></div>
        <div class="fin-acts">${canManage() ? `<button class="btn btn-primary btn-sm" data-act="collect" data-id="${esc(c.id)}">Tahsilat</button>` : ''}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${esc(c.id)}">Ekstre</button>${canManage() ? `<button class="btn btn-secondary btn-sm" data-act="term" data-id="${esc(c.id)}">Vade</button>` : ''}</div></div>`;
    };
    const supRow = (s) => `<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${esc(s.name)}</div>
          <div class="fin-sub">Vade ${s.paymentTerm} gün · toplam alım ${money(s.purchased, s.currency)}${s.lastPayment ? ' · son ödeme ' + fdate(s.lastPayment) : ''}</div>
          ${s.nextDue && s.balance > 0 ? `<div class="fin-sub">Sıradaki vade: ${fdate(s.nextDue)} ${dueChip(Math.round((new Date(`${s.nextDue}T00:00:00`) - new Date(`${today()}T00:00:00`)) / 86400000))}</div>` : ''}
          ${s.overdue > 0 ? `<div class="fin-sub bad">Vadesi geçmiş: ${money(s.overdue, s.currency)}</div>` : ''}</div>
        <div class="fin-amt ${s.balance > 0 ? 'out' : ''}">${money(s.balance, s.currency)}<small>borç</small></div>
        <div class="fin-acts">${canManage() ? `<button class="btn btn-primary btn-sm" data-act="paysup" data-id="${esc(s.id)}" ${s.balance > 0 ? '' : 'disabled'}>Öde</button>` : ''}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${esc(s.id)}">Ekstre</button></div></div>`;
    draw();
    view.querySelector('#fin-q').oninput = draw;
    view.querySelector('#fin-open').onchange = draw;
    view.querySelector('#fin-party-export').onclick = () => (isCust
      ? exportTable('Musteri bakiyeleri', [['Müşteri', 'name'], ['Bakiye', 'balance'], ['Para birimi', 'currency'], ['Vade (gün)', 'paymentTerm'], ['Vadesi geçmiş', 'overdue'], ['Güncel', (c) => c.aging.current], ['1-30 gün', (c) => c.aging.d30], ['31-60 gün', (c) => c.aging.d60], ['61-90 gün', (c) => c.aging.d90], ['90+ gün', (c) => c.aging.older], ['Son tahsilat', 'lastPayment']], list)
      : exportTable('Tedarikci borclari', [['Tedarikçi', 'name'], ['Borç', 'balance'], ['Para birimi', 'currency'], ['Vade (gün)', 'paymentTerm'], ['Vadesi geçmiş', 'overdue'], ['Sıradaki vade', 'nextDue'], ['Toplam alım', 'purchased'], ['Ödenen', 'paid']], list));
    delegate({
      sub: (ds) => { if (sub === ds.sub) return; sub = ds.sub; stepTo('parties', { sub }); },
      collect: (ds) => collect(list.find((x) => x.id === ds.id)),
      paysup: (ds) => paySupplier(list.find((x) => x.id === ds.id)),
      stmt: (ds) => showStatement(isCust ? 'customer' : 'supplier', ds.id),
      term: (ds) => act(async () => {
        const c = list.find((x) => x.id === ds.id);
        const v = await formDialog({ title: `Ödeme vadesi · ${c.name}`, icon: 'ph-calendar-check', fields: [{ name: 'paymentTerm', label: 'Vade (gün)', type: 'number', value: c.paymentTerm, min: 0, required: true, hint: 'Satıştan kaç gün sonra tahsil edilmeli' }] });
        return v && api.put(`/finance/customers/${encodeURIComponent(c.id)}/terms`, { paymentTerm: v.paymentTerm });
      }),
    });
  }

  // =====================================================================
  // KREDİLER
  // =====================================================================
  async function renderLoans(token) {
    const r = await api.get('/finance/loans');
    if (token !== renderToken) return;
    const loans = r.data;
    view.innerHTML = `
      <div class="fin-toolbar">${canManage() ? '<button class="btn btn-primary" data-act="newLoan"><i class="ph ph-plus-circle"></i> Yeni kredi</button>' : ''}${exportButton('fin-loan-export')}</div>
      ${loans.length ? `<div class="fin-list">${loans.map((l) => {
        const pct = l.installmentCount ? Math.round((l.paidCount / l.installmentCount) * 100) : 0;
        const dl = l.nextDue ? Math.round((new Date(`${l.nextDue}T00:00:00`) - new Date(`${today()}T00:00:00`)) / 86400000) : null;
        return `<div class="card fin-loan ${l.status === 'closed' ? 'off' : ''}">
          <div class="fin-loan-head"><span class="fin-ico"><i class="ph ph-bank"></i></span><div class="fin-main"><div class="fin-title">${esc(l.name)} ${l.status === 'closed' ? '<span class="fin-chip">Kapalı</span>' : ''}</div><div class="fin-sub">${esc(l.lender || 'Kurum belirtilmemiş')} · yıllık %${l.rate} · ${l.termMonths} ay</div></div>
            <div class="fin-amt out">${money(l.outstandingPrincipal, l.currency)}<small>kalan anapara</small></div></div>
          <div class="fin-progress"><i style="width:${pct}%"></i></div>
          <div class="fin-sub">${l.paidCount}/${l.installmentCount} taksit ödendi · çekilen ${money(l.principal, l.currency)} · kalan toplam ödeme ${money(l.remainingTotal, l.currency)}</div>
          ${l.status === 'active' && l.nextDue ? `<div class="fin-next">Sıradaki taksit: <b>${money(l.nextAmount, l.currency)}</b> · ${fdate(l.nextDue)} ${dueChip(dl)}${l.overdueCount > 1 ? ` <span class="fin-chip late">${l.overdueCount} taksit gecikmiş</span>` : ''}</div>` : ''}
          <div class="fin-acts">
            ${canManage() && l.status === 'active' && l.nextDue ? `<button class="btn btn-primary btn-sm" data-act="payNext" data-id="${esc(l.id)}">Sıradaki taksidi öde</button>` : ''}
            <button class="btn btn-secondary btn-sm" data-act="plan" data-id="${esc(l.id)}">Taksit planı</button>
            ${canManage() ? `<button class="btn btn-secondary btn-sm" data-act="loanClose" data-id="${esc(l.id)}" data-open="${l.status === 'closed' ? 1 : 0}">${l.status === 'closed' ? 'Yeniden aç' : 'Kapat'}</button><button class="btn btn-secondary btn-sm" data-act="loanDel" data-id="${esc(l.id)}">Sil</button>` : ''}
          </div></div>`;
      }).join('')}</div>` : empty('Kayıtlı kredi yok. "Yeni kredi" ile taksit planı otomatik oluşturulur.', 'ph-bank')}`;

    view.querySelector('#fin-loan-export').onclick = () => exportTable('Krediler', [['Kredi', 'name'], ['Kurum', 'lender'], ['Para birimi', 'currency'], ['Çekilen', 'principal'], ['Faiz (yıllık %)', 'rate'], ['Vade (ay)', 'termMonths'], ['Ödenen taksit', 'paidCount'], ['Kalan anapara', 'outstandingPrincipal'], ['Kalan toplam ödeme', 'remainingTotal'], ['Sıradaki vade', 'nextDue'], ['Sıradaki tutar', 'nextAmount']], loans);
    delegate({
      newLoan: () => newLoan(),
      payNext: (ds) => act(async () => {
        const d = (await api.get(`/finance/loans/${encodeURIComponent(ds.id)}`)).data;
        const i = d.installments.find((x) => x.status !== 'paid');
        if (!i) throw new Error('Ödenecek taksit kalmadı.');
        payInstallment(i.id, `${d.name} · ${i.no}. taksit (${fdate(i.dueDate)})`, d.currency, Math.round((i.amount - i.paidAmount) * 100) / 100);
        return null;
      }),
      plan: async (ds) => {
        try {
          const d = (await api.get(`/finance/loans/${encodeURIComponent(ds.id)}`)).data;
          const rows = d.installments.map((i) => `<tr class="${i.status === 'paid' ? 'dim' : i.daysLeft < 0 ? 'late' : ''}${i.id === highlightInst ? ' fin-hl' : ''}"><td>${i.no}</td><td>${fdate(i.dueDate)}</td><td class="num">${money(i.principal, d.currency)}</td><td class="num">${money(i.interest + i.tax, d.currency)}</td><td class="num"><b>${money(i.amount, d.currency)}</b></td><td>${i.status === 'paid' ? `<span class="fin-chip ok">Ödendi ${fdate(i.paidDate)}</span>` : i.paidAmount > 0 ? `<span class="fin-chip soon">Kısmi ${money(i.paidAmount, d.currency)}</span>` : dueChip(i.daysLeft)}</td></tr>`).join('');
          const res = await htmlDialog({ title: `${d.name} · Taksit planı`, icon: 'ph-table',
            html: `<p>${d.installmentCount} taksit · toplam ödeme ${money(d.totalPayment, d.currency)}</p><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>#</th><th>Vade</th><th class="num">Anapara</th><th class="num">Faiz+vergi</th><th class="num">Taksit</th><th>Durum</th></tr></thead><tbody>${rows}</tbody></table></div>`,
            extra: [{ label: 'Dışa aktar', cls: 'btn-secondary', icon: 'ph-download-simple', value: 'export' }] });
          if (res === 'export') exportTable(`${d.name} taksit plani`, [['No', 'no'], ['Vade', 'dueDate'], ['Anapara', 'principal'], ['Faiz', 'interest'], ['Vergi', 'tax'], ['Taksit', 'amount'], ['Ödenen', 'paidAmount'], ['Durum', (i) => (i.status === 'paid' ? 'Ödendi' : 'Bekliyor')]], d.installments);
        } catch (e) { showToast(e.message, 'error'); }
      },
      loanClose: (ds) => act(() => api.post(`/finance/loans/${encodeURIComponent(ds.id)}/close`, { reopen: ds.open === '1' })),
      loanDel: (ds) => act(async () => (await confirmDialog({ title: 'Krediyi sil', message: 'Kredi ve taksit planı silinir (ödemesi yapılmamış olmalı). Bu işlem geri alınamaz.', confirmLabel: 'Sil', danger: true })) ? api.delete(`/finance/loans/${encodeURIComponent(ds.id)}`) : null),
    });
  }

  function newLoan() {
    return act(async () => {
      const first = new Date(); first.setMonth(first.getMonth() + 1);
      const v = await formDialog({
        title: 'Yeni kredi', icon: 'ph-bank', wide: true, confirmLabel: 'Krediyi kaydet',
        fields: [
          { name: 'name', label: 'Kredi adı', required: true, placeholder: 'Örn. CNC Tezgâh Yatırım Kredisi' },
          { name: 'lender', label: 'Banka / kurum', half: true },
          { name: 'currency', label: 'Para birimi', type: 'select', options: meta.currencies.map((c) => [c, c]), half: true },
          { name: 'principal', label: 'Kredi tutarı', type: 'number', min: 0, required: true, half: true },
          { name: 'termMonths', label: 'Vade (ay)', type: 'number', min: 1, value: 12, required: true, half: true },
          { name: 'rate', label: 'Yıllık faiz %', type: 'number', min: 0, value: 0, half: true },
          { name: 'taxRate', label: 'Faiz vergisi % (BSMV+KKDF)', type: 'number', min: 0, value: 0, half: true },
          { name: 'type', label: 'Ödeme planı', type: 'select', options: LOAN_TYPE, half: true },
          { name: 'startDate', label: 'Kullanım tarihi', type: 'date', value: today(), half: true },
          { name: 'firstDueDate', label: 'İlk taksit tarihi', type: 'date', value: ymd(first), half: true },
          { name: 'accountId', label: 'Kredinin yattığı hesap', type: 'select', options: [['', '— hesaba işleme —'], ...accountOptions()], half: true },
        ],
        footerHtml: '<div id="fin-loan-prev" class="fin-preview hint">Tutar ve vadeyi girince taksit özeti burada görünür.</div>',
        validate: (x) => (!(x.principal > 0) ? 'Kredi tutarı sıfırdan büyük olmalı.' : !(x.termMonths >= 1) ? 'Vade en az 1 ay olmalı.' : x.accountId && meta.accounts.find((a) => a.id === x.accountId)?.currency !== x.currency ? 'Seçilen hesap kredi para biriminden farklı.' : ''),
        onMount: (el) => {
          let timer;
          const val = (n) => el.querySelector(`#df-${n}`).value;
          const upd = () => {
            const body = { name: 'x', principal: val('principal'), rate: val('rate'), taxRate: val('taxRate'), termMonths: val('termMonths'), type: val('type'), startDate: val('startDate'), firstDueDate: val('firstDueDate'), currency: val('currency') };
            const box = el.querySelector('#fin-loan-prev');
            if (!(Number(body.principal) > 0) || !(Number(body.termMonths) >= 1)) { box.textContent = 'Tutar ve vadeyi girince taksit özeti burada görünür.'; return; }
            api.post('/finance/loans/preview', body).then((r) => {
              const s = r.data.schedule;
              box.innerHTML = `İlk taksit <b>${money(s[0].amount, body.currency)}</b>${s.length > 1 && Math.abs(s[s.length - 1].amount - s[0].amount) > 0.05 ? ` → son <b>${money(s[s.length - 1].amount, body.currency)}</b>` : ''} · ${s.length} taksit · toplam ödeme <b>${money(r.data.totalPayment, body.currency)}</b> · toplam faiz+vergi <b>${money(r.data.totalInterest, body.currency)}</b>`;
            }).catch((e) => { box.textContent = e.message; });
          };
          el.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(upd, 350); });
          el.addEventListener('change', () => { clearTimeout(timer); timer = setTimeout(upd, 100); });
        },
      });
      return v && api.post('/finance/loans', { ...v, accountId: v.accountId || undefined });
    });
  }

  // =====================================================================
  // ÇEK / SENET
  // =====================================================================
  let chequeFilter = 'pending';
  async function renderCheques(token) {
    const r = await api.get('/finance/cheques');
    if (token !== renderToken) return;
    const all = r.data;
    const list = chequeFilter === 'pending' ? all.filter((c) => c.status === 'pending') : all;
    const sum = (kind) => { const m = {}; all.filter((c) => c.status === 'pending' && c.kind === kind).forEach((c) => { m[c.currency] = (m[c.currency] || 0) + c.amount; }); return Object.entries(m).map(([c, t]) => `<b>${money(t, c)}</b>`).join('') || '<b>—</b>'; };
    view.innerHTML = `
      <div class="fin-toolbar">${canManage() ? '<button class="btn btn-primary" data-act="newChq"><i class="ph ph-plus-circle"></i> Çek / senet ekle</button>' : ''}
        <div class="seg-tabs fin-sub"><button class="seg-tab ${chequeFilter === 'pending' ? 'active' : ''}" data-act="filter" data-f="pending">Bekleyen</button><button class="seg-tab ${chequeFilter === 'all' ? 'active' : ''}" data-act="filter" data-f="all">Tümü</button></div>${exportButton('fin-chq-export')}</div>
      <div class="fin-kpis"><div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Tahsil edilecek (bekleyen)</span>${sum('receivable')}</div><div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Ödenecek (bekleyen)</span>${sum('payable')}</div></div>
      ${list.length ? `<div class="fin-list">${list.map((c) => `
        <div class="card fin-row ${c.daysLeft != null && c.daysLeft < 0 ? 'late' : ''}">
          <span class="fin-ico ${c.kind === 'payable' ? 'out' : 'in'}"><i class="ph ${c.kind === 'payable' ? 'ph-note-pencil' : 'ph-note'}"></i></span>
          <div class="fin-main"><div class="fin-title">${esc(c.partyName)} ${c.number ? `<small>· ${esc(c.number)}</small>` : ''}</div>
            <div class="fin-sub">${c.kind === 'payable' ? 'Ödenecek' : 'Alınan'} · ${c.bank ? esc(c.bank) + ' · ' : ''}vade ${fdate(c.dueDate)} ${c.status === 'pending' ? dueChip(c.daysLeft) : `<span class="fin-chip ${c.status === 'bounced' ? 'late' : 'ok'}">${CHEQUE_STATUS[c.status]}${c.settledDate ? ' ' + fdate(c.settledDate) : ''}</span>`}</div></div>
          <div class="fin-amt ${c.kind === 'payable' ? 'out' : 'in'}">${money(c.amount, c.currency)}</div>
          ${canManage() && c.status === 'pending' ? `<div class="fin-acts"><button class="btn btn-primary btn-sm" data-act="settle" data-id="${esc(c.id)}">${c.kind === 'payable' ? 'Ödendi' : 'Tahsil edildi'}</button><button class="btn btn-secondary btn-sm" data-act="bounce" data-id="${esc(c.id)}">Karşılıksız</button><button class="btn btn-secondary btn-sm" data-act="chqDel" data-id="${esc(c.id)}">Sil</button></div>` : ''}
        </div>`).join('')}</div>` : empty('Çek/senet kaydı yok.', 'ph-note')}`;
    view.querySelector('#fin-chq-export').onclick = () => exportTable('Cek ve senetler', [['Tür', (c) => (c.kind === 'payable' ? 'Ödenecek' : 'Alınan')], ['No', 'number'], ['Karşı taraf', 'partyName'], ['Banka', 'bank'], ['Tutar', 'amount'], ['Para birimi', 'currency'], ['Vade', 'dueDate'], ['Durum', (c) => CHEQUE_STATUS[c.status] || c.status]], all);
    delegate({
      filter: (ds) => { chequeFilter = ds.f; showTab('cheques'); },
      settle: (ds) => settleCheque(all.find((c) => c.id === ds.id)),
      bounce: (ds) => act(async () => (await confirmDialog({ title: 'Karşılıksız / iade', message: 'Bu çek/senet karşılıksız çıktı veya iade edildi olarak işaretlenecek (hesap hareketi oluşmaz).', confirmLabel: 'İşaretle', danger: true })) ? api.post(`/finance/cheques/${encodeURIComponent(ds.id)}/status`, { status: 'bounced' }) : null),
      chqDel: (ds) => act(async () => (await confirmDialog({ title: 'Kaydı sil', message: 'Bekleyen çek/senet kaydı silinecek.', confirmLabel: 'Sil', danger: true })) ? api.delete(`/finance/cheques/${encodeURIComponent(ds.id)}`) : null),
      newChq: () => act(async () => {
        const [cs, ss] = await Promise.all([api.get('/finance/customers'), api.get('/finance/suppliers')]);
        const parties = [['', '— serbest ad gir —'], ...cs.data.map((c) => [`c:${c.id}:${c.currency}`, `Müşteri · ${c.name}`]), ...ss.data.map((s) => [`s:${s.id}:${s.currency}`, `Tedarikçi · ${s.name}`])];
        const v = await formDialog({
          title: 'Çek / senet ekle', icon: 'ph-note',
          fields: [
            { name: 'kind', label: 'Tür', type: 'select', options: [['receivable', 'Alınan (tahsil edilecek)'], ['payable', 'Verilen (ödenecek)']], half: true },
            { name: 'number', label: 'Çek / senet no', half: true },
            { name: 'party', label: 'Müşteri / tedarikçi', type: 'select', options: parties },
            { name: 'partyName', label: 'Serbest ad (keşideci / lehtar)', hint: 'Yukarıdan seçmediyseniz' },
            { name: 'amount', label: 'Tutar', type: 'number', min: 0, required: true, half: true },
            { name: 'currency', label: 'Para birimi', type: 'select', options: meta.currencies.map((c) => [c, c]), half: true },
            { name: 'dueDate', label: 'Vade tarihi', type: 'date', value: today(), required: true, half: true },
            { name: 'bank', label: 'Banka', half: true },
          ],
          validate: (x) => (!(x.amount > 0) ? 'Tutar sıfırdan büyük olmalı.' : !x.party && !x.partyName ? 'Bir müşteri/tedarikçi seçin veya ad yazın.' : ''),
        });
        if (!v) return null;
        const [pt, pid, pcur] = (v.party || '').split(':');
        const body = { kind: v.kind, number: v.number, amount: v.amount, dueDate: v.dueDate, bank: v.bank, currency: pid ? pcur : v.currency, partyName: v.partyName };
        if (pid && ((pt === 'c' && v.kind === 'receivable') || (pt === 's' && v.kind === 'payable'))) body.partyId = pid;
        else if (pid) { const nm = parties.find((p) => p[0] === v.party)[1].replace(/^(Müşteri|Tedarikçi) · /, ''); body.partyName = nm; }
        return api.post('/finance/cheques', body);
      }),
    });
  }

  // =====================================================================
  // HAREKETLER
  // =====================================================================
  async function renderLedger(token) {
    const f = ledgerFilter;
    const qs = new URLSearchParams({ limit: '500' });
    Object.entries(f).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const r = await api.get(`/finance/transactions?${qs}`);
    if (token !== renderToken) return;
    const rows = r.data;
    const sum = {};
    rows.forEach((t) => { sum[t.currency] = sum[t.currency] || { in: 0, out: 0 }; sum[t.currency][t.direction] += t.amount; });
    view.innerHTML = `
      <div class="card fin-filters">
        <label>Hesap<select id="lf-acc"><option value="">Tümü</option>${meta.accounts.map((a) => `<option value="${esc(a.id)}" ${f.accountId === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
        <label>Yön<select id="lf-dir"><option value="">Hepsi</option><option value="in" ${f.direction === 'in' ? 'selected' : ''}>Giriş</option><option value="out" ${f.direction === 'out' ? 'selected' : ''}>Çıkış</option></select></label>
        <label>Başlangıç<input id="lf-from" type="date" value="${esc(f.from)}"></label>
        <label>Bitiş<input id="lf-to" type="date" value="${esc(f.to)}"></label>
        <label class="wide">Ara<input id="lf-q" type="text" placeholder="Açıklama, kategori, cari…" value="${esc(f.q)}"></label>
      </div>
      <div class="fin-toolbar"><span class="hint">${rows.length} hareket${Object.entries(sum).map(([c, s]) => ` · ${c}: <b class="good">+${money(s.in, c)}</b> <b class="bad">−${money(s.out, c)}</b>`).join('')}</span>${exportButton('fin-led-export')}</div>
      ${rows.length ? `<div class="fin-list">${rows.map((t) => `
        <div class="card fin-row">
          <span class="fin-ico ${t.direction}"><i class="ph ${t.direction === 'in' ? 'ph-arrow-down-left' : 'ph-arrow-up-right'}"></i></span>
          <div class="fin-main"><div class="fin-title">${esc(t.category || (t.direction === 'in' ? 'Giriş' : 'Çıkış'))}${t.partyName ? ` <small>· ${esc(t.partyName)}</small>` : ''}</div>
            <div class="fin-sub">${fdate(t.date)} · ${esc(t.accountName)}${t.description ? ' · ' + esc(t.description) : ''}${t.createdBy ? ' · ' + esc(t.createdBy) : ''}</div></div>
          <div class="fin-amt ${t.direction}">${t.direction === 'in' ? '+' : '−'}${money(t.amount, t.currency)}</div>
          ${canManage() ? `<button class="btn btn-secondary btn-sm" data-act="void" data-id="${esc(t.id)}" title="Hareketi iptal et; bağlı bakiye ve taksit geri alınır">İptal</button>` : ''}
        </div>`).join('')}</div>` : empty('Bu filtreye uyan hareket yok.', 'ph-list-checks')}`;

    const read = () => ({ accountId: view.querySelector('#lf-acc').value, direction: view.querySelector('#lf-dir').value, from: view.querySelector('#lf-from').value, to: view.querySelector('#lf-to').value, q: view.querySelector('#lf-q').value.trim() });
    let timer;
    view.onchange = () => { ledgerFilter = read(); showTab('ledger'); };
    view.oninput = (e) => { if (e.target.id !== 'lf-q') return; clearTimeout(timer); timer = setTimeout(() => { ledgerFilter = read(); showTab('ledger'); }, 500); };
    view.querySelector('#fin-led-export').onclick = () => exportTable('Finans hareketleri', [['Tarih', 'date'], ['Hesap', 'accountName'], ['Yön', (t) => (t.direction === 'in' ? 'Giriş' : 'Çıkış')], ['Tutar', 'amount'], ['Para birimi', 'currency'], ['Kategori', 'category'], ['Cari / taraf', 'partyName'], ['Açıklama', 'description'], ['Kaydeden', 'createdBy']], rows);
    delegate({
      void: (ds) => act(async () => (await confirmDialog({ title: 'Hareketi iptal et', message: 'Hesap bakiyesi düzeltilir; müşteri tahsilatı, taksit veya çek/senet ile bağlıysa onlar da eski haline döner.', confirmLabel: 'İptal et', danger: true })) ? api.post(`/finance/transactions/${encodeURIComponent(ds.id)}/void`, {}) : null),
    });
  }

  async function renderTeam(token) {
    await ensureContext();
    if (token !== renderToken) return;
    if (!jtCan('jt.users.manage')) { view.innerHTML = errBox('Kullanıcı ve yetki yönetimi için yetkiniz yok.'); return; }
    view.innerHTML = '<p class="hint" style="margin-bottom:10px">Kullanıcı ekleyin, rollerini seçin. <b>Finans Sorumlusu</b> rolü finans ekranlarını görür ve tahsilat/ödeme yapar; diğer roller Finans menüsünü görmez.</p><div class="page-jobs"><div id="jt-view" class="jt-view"></div></div>';
    await team.render(view.querySelector('#jt-view'), {});
  }

  // ---- derin bağlantı (takvim / nakit akışı tıklamaları): ilk çizimden sonra bir kez uygulanır ----
  let highlightInst = null;
  let deepLink = (() => { const q = router.getQueryParams(); return q.loan || q.customer || q.supplier || q.cheque || q.tx ? q : null; })();
  function focusCard(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('fin-focus');
    setTimeout(() => el.classList.remove('fin-focus'), 2600);
  }
  function applyDeepLink() {
    const q = deepLink; deepLink = null;
    if (!q) return;
    const byId = (act, id) => [...view.querySelectorAll(`[data-act="${act}"]`)].find((b) => b.dataset.id === id);
    if (tab === 'loans' && q.loan) {
      const btn = byId('plan', q.loan);
      if (!btn) { showToast('Kredi bulunamadı veya kapatılmış.', 'error'); return; }
      focusCard(btn.closest('.card'));
      highlightInst = q.inst || null;
      btn.click(); // taksit planı penceresi (ilgili taksit satırı durum rengiyle görünür)
    } else if (tab === 'parties' && (q.customer || q.supplier)) {
      showStatement(q.supplier ? 'supplier' : 'customer', q.supplier || q.customer);
      focusCard([...view.querySelectorAll('[data-id]')].find((b) => b.dataset.id === (q.supplier || q.customer))?.closest('.card, tr'));
    } else if (q.cheque || q.tx) {
      focusCard([...view.querySelectorAll('[data-id]')].find((b) => b.dataset.id === (q.cheque || q.tx))?.closest('.card, tr'));
    }
  }

  showTab(TABS.some((t) => t[0] === tab) || tab === 'team' ? tab : 'overview');
  return container;
}
