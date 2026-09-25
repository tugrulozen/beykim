/**
 * FİNANS modülü (ERP'ye bağlı)
 *
 * ERP ile bağlantı noktaları:
 *  - Müşteri bakiyesi (`customers.balance`): satış bakiyeyi artırır (mevcut ERP davranışı), buradaki TAHSİLAT azaltır.
 *    Bakiye yaşlandırması (vade) satışların tarihlerinden ve müşteri vadesinden (`customers.paymentTerm`) hesaplanır.
 *  - Tedarikçi borcu: satın alma siparişlerinde teslim alınan tutar (mal kabul) borç doğurur; buradaki ÖDEME düşer.
 *    Vade = mal kabul tarihi + tedarikçinin ödeme vadesi (`suppliers.paymentTerm`).
 *  - Kasa / banka hesapları, gelir-gider hareketleri, krediler (taksit planı), çek/senet.
 *  - Vadesi yaklaşan taksit, çek ve tedarikçi ödemeleri için bildirim (notifications) üretir.
 *
 * Kur çevrimi yoktur: her hesap, müşteri, tedarikçi ve kredi kendi para biriminde tutulur; toplamlar para birimine göre ayrılır.
 * Yetki: `fin.view` (okuma), `fin.manage` (kayıt / ödeme / tahsilat). Yönetici (admin) ikisine de sahiptir.
 */

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];
const IN_CATEGORIES = ['Satış geliri', 'Müşteri tahsilatı', 'Kredi kullanımı', 'Faiz geliri', 'Sermaye / ortak', 'Diğer gelir'];
const OUT_CATEGORIES = ['Tedarikçi ödemesi', 'Kredi taksiti', 'Maaş / SGK', 'Kira', 'Vergi', 'Enerji / fatura', 'Nakliye', 'Bakım / onarım', 'Ofis / genel', 'Banka masrafı', 'Diğer gider'];
const DEFAULT_REMIND = '7,3,1,0';
/** ERP'de para birimi 'TL' gibi yazılmış olabilir; finansta ISO koduna çevrilir */
const cur = (v) => { const c = String(v || '').trim().toUpperCase(); if (!c || c === 'TL' || c === '₺' || c === 'TRL') return 'TRY'; if (c === '$') return 'USD'; if (c === '€') return 'EUR'; return CURRENCIES.includes(c) ? c : 'TRY'; };

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !isNaN(new Date(`${s}T00:00:00`));
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const clip = (s, n) => String(s == null ? '' : s).replace(/[<>]/g, '').trim().slice(0, n);
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
const dayDiff = (dateStr) => Math.round((new Date(`${dateStr}T00:00:00`) - new Date(`${todayStr()}T00:00:00`)) / 86400000);

function addMonths(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(y, m - 1 + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(d, last));
  return ymd(t);
}
function addDaysStr(dateStr, n) { const d = new Date(`${dateStr}T00:00:00`); d.setDate(d.getDate() + n); return ymd(d); }

/**
 * Kredi taksit planı.
 * type: 'annuity' (eşit taksit) | 'equal_principal' (eşit anapara) | 'bullet' (dönem sonu anapara, aylık faiz)
 * taxRate: faiz üzerinden alınan vergi (BSMV + KKDF) yüzdesi
 * Dönüş: [{ no, dueDate, principal, interest, tax, amount }]
 */
function buildSchedule({ principal, rate = 0, termMonths, firstDueDate, type = 'annuity', taxRate = 0 }) {
  const P = Number(principal), n = Math.round(Number(termMonths)), r = Number(rate) / 1200, tx = Number(taxRate) / 100;
  if (!(P > 0) || !(n >= 1) || n > 480 || !isDate(firstDueDate)) throw new Error('Kredi bilgileri geçersiz.');
  const out = [];
  let bal = P;
  const pmt = r > 0 ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
  for (let i = 1; i <= n; i++) {
    const interest = r2(bal * r);
    let prin;
    if (type === 'equal_principal') prin = r2(P / n);
    else if (type === 'bullet') prin = i === n ? r2(bal) : 0;
    else prin = r2(pmt - interest);
    if (i === n) prin = r2(bal); // son taksit anaparayı tam kapatır
    if (prin > bal) prin = r2(bal);
    const tax = r2(interest * tx);
    out.push({ no: i, dueDate: addMonths(firstDueDate, i - 1), principal: prin, interest, tax, amount: r2(prin + interest + tax) });
    bal = r2(bal - prin);
  }
  return out;
}

module.exports = function createFinance({ app, dbAll, dbGet, dbRun, notify }) {
  const can = (req, p) => Array.isArray(req.perms) && req.perms.includes(p);
  const need = (p) => (req, res, next) => (can(req, p) ? next() : res.status(403).json({ success: false, message: 'Finans modülü için yetkiniz yok.' }));
  const view = need('fin.view'), manage = need('fin.manage');
  const wrap = (fn) => (req, res) => fn(req, res).catch(async (e) => {
    try { await dbRun('ROLLBACK'); } catch (_) { /* işlem açık değil */ }
    if (e && e.status) return res.status(e.status).json({ success: false, message: e.message });
    console.error(`[finance ${req.method} ${req.path}]`, e && e.message);
    res.status(500).json({ success: false, message: 'Finans işlemi sırasında hata oluştu.' });
  });
  const bad = (message, status = 400) => Object.assign(new Error(message), { status });
  const who = (req) => (req.me && req.me.name) || '';

  // ---------- şema ----------
  function initSchema(run) {
    run(`CREATE TABLE IF NOT EXISTS fin_accounts (id TEXT PRIMARY KEY, name TEXT, type TEXT, currency TEXT, iban TEXT, openingBalance REAL DEFAULT 0, active INTEGER DEFAULT 1, createdAt TEXT)`);
    run(`CREATE TABLE IF NOT EXISTS fin_transactions (id TEXT PRIMARY KEY, date TEXT, accountId TEXT, direction TEXT, amount REAL, category TEXT, description TEXT,
      partyType TEXT, partyId TEXT, partyName TEXT, refType TEXT, refId TEXT, createdBy TEXT, createdAt TEXT, voided INTEGER DEFAULT 0)`);
    run(`CREATE INDEX IF NOT EXISTS ix_fin_tx_acc ON fin_transactions(accountId, date)`);
    run(`CREATE INDEX IF NOT EXISTS ix_fin_tx_party ON fin_transactions(partyType, partyId)`);
    run(`CREATE TABLE IF NOT EXISTS fin_loans (id TEXT PRIMARY KEY, name TEXT, lender TEXT, currency TEXT, principal REAL, rate REAL, taxRate REAL DEFAULT 0, termMonths INTEGER,
      type TEXT, startDate TEXT, firstDueDate TEXT, status TEXT DEFAULT 'active', note TEXT, createdBy TEXT, createdAt TEXT)`);
    run(`CREATE TABLE IF NOT EXISTS fin_installments (id TEXT PRIMARY KEY, loanId TEXT, no INTEGER, dueDate TEXT, principal REAL, interest REAL, tax REAL, amount REAL,
      paidAmount REAL DEFAULT 0, paidDate TEXT, status TEXT DEFAULT 'pending')`);
    run(`CREATE INDEX IF NOT EXISTS ix_fin_inst_loan ON fin_installments(loanId, no)`);
    run(`CREATE TABLE IF NOT EXISTS fin_cheques (id TEXT PRIMARY KEY, kind TEXT, number TEXT, partyType TEXT, partyId TEXT, partyName TEXT, bank TEXT, currency TEXT, amount REAL,
      dueDate TEXT, status TEXT DEFAULT 'pending', settledDate TEXT, note TEXT, createdBy TEXT, createdAt TEXT)`);
    run(`CREATE TABLE IF NOT EXISTS fin_settings (key TEXT PRIMARY KEY, value TEXT)`);
    run(`CREATE TABLE IF NOT EXISTS fin_reminder_log (key TEXT PRIMARY KEY, at TEXT)`);
  }

  // ---------- ortak sorgular ----------
  const getSetting = async (k, d) => { const r = await dbGet(`SELECT value FROM fin_settings WHERE key = ?`, [k]); return r ? r.value : d; };
  const setSetting = (k, v) => dbRun(`INSERT INTO fin_settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [k, String(v)]);
  const remindDays = async () => String(await getSetting('remindDays', DEFAULT_REMIND)).split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 90);

  async function accountsWithBalance(includeInactive) {
    const rows = await dbAll(`SELECT a.*, COALESCE(a.openingBalance,0) + COALESCE((SELECT SUM(CASE WHEN t.direction='in' THEN t.amount ELSE -t.amount END) FROM fin_transactions t WHERE t.accountId = a.id AND t.voided = 0),0) AS balance
      FROM fin_accounts a ${includeInactive ? '' : 'WHERE a.active = 1'} ORDER BY a.active DESC, a.type, a.name`);
    return rows.map((a) => ({ ...a, balance: r2(a.balance) }));
  }
  async function needAccount(id, currency) {
    const a = await dbGet(`SELECT * FROM fin_accounts WHERE id = ? AND active = 1`, [id]);
    if (!a) throw bad('Hesap bulunamadı veya kapalı.');
    if (currency && a.currency !== currency) throw bad(`Bu işlem ${currency} cinsindendir; seçilen hesap ${a.currency}. ${currency} hesabı seçin.`);
    return a;
  }
  function parseAmount(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || n > 1e12) throw bad('Tutar sıfırdan büyük geçerli bir sayı olmalı.');
    return r2(n);
  }
  const parseDate = (v, dflt) => { const s = v == null || v === '' ? dflt : String(v); if (!isDate(s)) throw bad('Tarih geçersiz (YYYY-AA-GG).'); return s; };

  async function addTx({ date, accountId, direction, amount, category, description, partyType = null, partyId = null, partyName = null, refType = 'manual', refId = null, by }) {
    const id = uid('FT');
    await dbRun(`INSERT INTO fin_transactions (id, date, accountId, direction, amount, category, description, partyType, partyId, partyName, refType, refId, createdBy, createdAt, voided) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
      [id, date, accountId, direction, amount, clip(category, 60), clip(description, 200), partyType, partyId, partyName, refType, refId, by || '', new Date().toISOString()]);
    return id;
  }

  // ---------- müşteri: ekstre ve yaşlandırma ----------
  async function customerSales(customerId) {
    const rows = await dbAll(`SELECT s.id, s.date, s.type, s.quantity, s.note, COALESCE(s.amount, s.quantity * COALESCE(p.price,0)) AS amount, p.name AS productName
      FROM sales s LEFT JOIN products p ON p.id = s.productId WHERE s.customerId = ? ORDER BY s.date ASC`, [customerId]);
    return rows.map((r) => ({ ...r, amount: r2(r.amount) }));
  }
  const termOf = (c) => (c.paymentTerm == null || c.paymentTerm === '' ? 30 : Number(c.paymentTerm));

  /** Açık bakiyeyi en yeni satışlardan geriye doğru dağıtır (FIFO): hangi satış ne kadar süredir açık? */
  function ageBalance(balance, sales, term) {
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, older: 0 };
    let overdue = 0, oldestDue = null;
    let left = Math.max(0, balance);
    const list = sales.filter((s) => s.type !== 'iade').sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const put = (amt, dateStr) => {
      const due = addDaysStr(String(dateStr).slice(0, 10), term);
      const late = -dayDiff(due);
      if (late > 0) overdue += amt;
      if (oldestDue === null || due < oldestDue) oldestDue = due;
      if (late <= 0) buckets.current += amt; else if (late <= 30) buckets.d30 += amt; else if (late <= 60) buckets.d60 += amt; else if (late <= 90) buckets.d90 += amt; else buckets.older += amt;
    };
    for (const s of list) {
      if (left <= 0.004) break;
      const part = Math.min(left, s.amount);
      put(part, s.date); left = r2(left - part);
    }
    if (left > 0.004) { buckets.older += left; overdue += left; } // satış kaydı bulunmayan devir bakiye
    for (const k of Object.keys(buckets)) buckets[k] = r2(buckets[k]);
    return { buckets, overdue: r2(overdue), oldestDue };
  }

  async function customerList() {
    const customers = await dbAll(`SELECT * FROM customers ORDER BY name`);
    const pays = await dbAll(`SELECT partyId, MAX(date) AS lastPayment, SUM(amount) AS paid FROM fin_transactions WHERE partyType='customer' AND direction='in' AND voided=0 GROUP BY partyId`);
    const payMap = new Map(pays.map((p) => [p.partyId, p]));
    const out = [];
    for (const c of customers) {
      const sales = await customerSales(c.id);
      const term = termOf(c);
      const aging = ageBalance(Number(c.balance) || 0, sales, term);
      const last = sales.length ? sales[sales.length - 1].date.slice(0, 10) : null;
      out.push({ id: c.id, name: c.name, balance: r2(c.balance || 0), currency: cur(c.currency), paymentTerm: term, lastSale: last,
        lastPayment: (payMap.get(c.id) || {}).lastPayment || null, totalPaid: r2((payMap.get(c.id) || {}).paid || 0), overdue: aging.overdue, aging: aging.buckets, nextDue: aging.oldestDue });
    }
    return out;
  }

  // ---------- tedarikçi: borç ve vade ----------
  async function supplierList() {
    const sups = await dbAll(`SELECT id, code, name, currency, paymentTerm, phone FROM suppliers ORDER BY name`);
    const orders = await dbAll(`SELECT o.id, o.supplierId, o.invoiceNo, o.receiptDate, o.orderDate, o.currency,
      (SELECT COALESCE(SUM(l.receivedQty * l.unitPrice * (1 - COALESCE(l.discount,0)/100) * (1 + COALESCE(l.taxRate,0)/100)),0) FROM purchase_order_lines l WHERE l.orderId = o.id) AS value
      FROM purchase_orders o WHERE o.status IN ('partial','received') ORDER BY COALESCE(o.receiptDate, o.orderDate) ASC`);
    const pays = await dbAll(`SELECT partyId, SUM(amount) AS paid, MAX(date) AS lastPayment FROM fin_transactions WHERE partyType='supplier' AND direction='out' AND voided=0 GROUP BY partyId`);
    const payMap = new Map(pays.map((p) => [p.partyId, p]));
    return sups.map((s) => {
      const mine = orders.filter((o) => o.supplierId === s.id && o.value > 0);
      const purchased = r2(mine.reduce((a, o) => a + o.value, 0));
      const paid = r2((payMap.get(s.id) || {}).paid || 0);
      let credit = paid; // ödemeler en eski borçtan düşer
      const open = [];
      for (const o of mine) {
        const v = r2(o.value); const used = Math.min(credit, v); credit = r2(credit - used);
        if (v - used > 0.015) { // satır yuvarlamasından kalan kuruş farkı açık borç sayılmaz
          const base = String(o.receiptDate || o.orderDate).slice(0, 10);
          open.push({ orderId: o.id, invoiceNo: o.invoiceNo || '', dueDate: addDaysStr(base, Number(s.paymentTerm) || 0), amount: r2(v - used) });
        }
      }
      const balance = r2(purchased - paid);
      return { id: s.id, code: s.code, name: s.name, currency: cur(s.currency), paymentTerm: Number(s.paymentTerm) || 0, purchased, paid, balance, lastPayment: (payMap.get(s.id) || {}).lastPayment || null,
        open, nextDue: open.length ? open[0].dueDate : null, overdue: r2(open.filter((x) => dayDiff(x.dueDate) < 0).reduce((a, x) => a + x.amount, 0)) };
    });
  }

  // ---------- vade / hatırlatma kalemleri ----------
  async function dueItems() {
    const items = [];
    const inst = await dbAll(`SELECT i.*, l.name AS loanName, l.lender, l.currency FROM fin_installments i JOIN fin_loans l ON l.id = i.loanId WHERE i.status != 'paid' AND l.status = 'active' ORDER BY i.dueDate`);
    for (const i of inst) {
      const rest = r2(i.amount - (i.paidAmount || 0));
      items.push({ kind: 'installment', id: i.id, direction: 'out', title: `${i.loanName} · ${i.no}. taksit`, party: i.lender || '', dueDate: i.dueDate, amount: rest, currency: i.currency, daysLeft: dayDiff(i.dueDate), link: 'finance?tab=loans' });
    }
    const chq = await dbAll(`SELECT * FROM fin_cheques WHERE status = 'pending' ORDER BY dueDate`);
    for (const c of chq) items.push({ kind: c.kind === 'payable' ? 'cheque_out' : 'cheque_in', id: c.id, direction: c.kind === 'payable' ? 'out' : 'in', title: `${c.kind === 'payable' ? 'Ödenecek' : 'Tahsil edilecek'} çek/senet${c.number ? ' · ' + c.number : ''}`, party: c.partyName || '', dueDate: c.dueDate, amount: c.amount, currency: c.currency, daysLeft: dayDiff(c.dueDate), link: 'finance?tab=cheques' });
    for (const s of await supplierList()) for (const o of s.open) items.push({ kind: 'supplier', id: `${s.id}:${o.orderId}`, direction: 'out', title: `Tedarikçi ödemesi${o.invoiceNo ? ' · ' + o.invoiceNo : ''}`, party: s.name, dueDate: o.dueDate, amount: o.amount, currency: s.currency, daysLeft: dayDiff(o.dueDate), link: 'finance?tab=parties&sub=suppliers' });
    return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  // ---------- hatırlatma bildirimleri ----------
  async function recipients() {
    const users = await dbAll(`SELECT id, role FROM users WHERE COALESCE(active,1) = 1`);
    const roles = await dbAll(`SELECT id, permissions FROM jt_roles`);
    const ok = new Set(roles.filter((r) => { try { return JSON.parse(r.permissions || '[]').includes('fin.view'); } catch (_) { return false; } }).map((r) => r.id));
    return users.filter((u) => u.role === 'admin' || ok.has(u.role)).map((u) => u.id);
  }
  const money = (n, cur) => `${Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur === 'TRY' ? '₺' : cur}`;

  async function runReminders() {
    if (!notify) return { sent: 0 };
    const days = await remindDays();
    const items = (await dueItems()).filter((i) => i.amount > 0.004);
    const to = await recipients();
    let sent = 0;
    for (const it of items) {
      let key = null;
      if (it.daysLeft < 0) key = `${it.kind}:${it.id}:late:${todayStr()}`;
      else if (days.includes(it.daysLeft)) key = `${it.kind}:${it.id}:d${it.daysLeft}:${it.dueDate}`;
      if (!key) continue;
      if (await dbGet(`SELECT key FROM fin_reminder_log WHERE key = ?`, [key])) continue;
      const when = it.daysLeft < 0 ? `${-it.daysLeft} gün GECİKTİ` : it.daysLeft === 0 ? 'bugün vadesi doluyor' : `${it.daysLeft} gün sonra vadesi doluyor`;
      const title = it.direction === 'in' ? `Tahsilat vadesi: ${when}` : `Ödeme vadesi: ${when}`;
      const body = `${it.title}${it.party ? ' — ' + it.party : ''} · ${money(it.amount, it.currency)} · ${it.dueDate}`;
      for (const u of to) { await notify(u, 'finance', title, body, it.link); sent++; }
      await dbRun(`INSERT OR IGNORE INTO fin_reminder_log (key, at) VALUES (?,?)`, [key, new Date().toISOString()]);
    }
    await dbRun(`DELETE FROM fin_reminder_log WHERE at < ?`, [new Date(Date.now() - 120 * 86400000).toISOString()]);
    return { sent };
  }
  function startReminders() {
    if (process.env.FIN_REMINDERS === '0') return;
    const tick = () => runReminders().catch((e) => console.error('[finance reminders]', e.message));
    setTimeout(tick, 20000).unref();
    setInterval(tick, 30 * 60 * 1000).unref();
  }

  // ================= ROTALAR =================
  app.get('/api/finance/meta', view, wrap(async (req, res) => {
    res.json({ success: true, data: { currencies: CURRENCIES, inCategories: IN_CATEGORIES, outCategories: OUT_CATEGORIES, accounts: await accountsWithBalance(true), remindDays: (await getSetting('remindDays', DEFAULT_REMIND)),
      canManage: can(req, 'fin.manage') } });
  }));

  // ---- özet ----
  app.get('/api/finance/summary', view, wrap(async (req, res) => {
    const accounts = await accountsWithBalance(false);
    const by = (m, cur, k, v) => { (m[cur] = m[cur] || { currency: cur, total: 0, overdue: 0 }); m[cur][k] += v; };
    const cash = {}, recv = {}, pay = {}, loan = {};
    accounts.forEach((a) => by(cash, a.currency, 'total', a.balance));
    const customers = await customerList();
    customers.forEach((c) => { if (c.balance > 0) { by(recv, c.currency, 'total', c.balance); by(recv, c.currency, 'overdue', c.overdue); } });
    const suppliers = await supplierList();
    suppliers.forEach((s) => { if (s.balance > 0) { by(pay, s.currency, 'total', s.balance); by(pay, s.currency, 'overdue', s.overdue); } });
    const loans = await dbAll(`SELECT l.id, l.currency, COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.principal ELSE 0 END),0) AS outstanding,
      COALESCE(SUM(CASE WHEN i.status != 'paid' AND i.dueDate < ? THEN i.amount - i.paidAmount ELSE 0 END),0) AS overdue FROM fin_loans l LEFT JOIN fin_installments i ON i.loanId = l.id WHERE l.status='active' GROUP BY l.id`, [todayStr()]);
    loans.forEach((l) => { by(loan, l.currency, 'total', l.outstanding); by(loan, l.currency, 'overdue', l.overdue); });
    const items = await dueItems();
    const horizon = items.filter((i) => i.daysLeft <= 30);
    const flow = {};
    horizon.forEach((i) => { flow[i.currency] = flow[i.currency] || { currency: i.currency, in: 0, out: 0 }; flow[i.currency][i.direction] += i.amount; });
    const round = (o) => Object.values(o).map((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, typeof v === 'number' ? r2(v) : v])));
    res.json({ success: true, data: {
      cash: round(cash), receivables: round(recv), payables: round(pay), loans: round(loan), flow30: round(flow),
      accounts, upcoming: horizon.slice(0, 60), overdueCount: items.filter((i) => i.daysLeft < 0).length,
      dueSoonCount: items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 7).length,
      topDebtors: customers.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5).map((c) => ({ id: c.id, name: c.name, balance: c.balance, currency: c.currency, overdue: c.overdue })),
    } });
  }));

  app.get('/api/finance/cashflow', view, wrap(async (req, res) => {
    const months = Math.min(24, Math.max(1, Number(req.query.months) || 6));
    const cur = CURRENCIES.includes(String(req.query.currency)) ? String(req.query.currency) : 'TRY';
    const from = ymd(new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1));
    const rows = await dbAll(`SELECT substr(t.date,1,7) AS month, t.direction, t.category, SUM(t.amount) AS total FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId
      WHERE t.voided = 0 AND a.currency = ? AND t.date >= ? AND t.refType != 'transfer' GROUP BY month, t.direction, t.category ORDER BY month`, [cur, from]);
    const map = {};
    for (let i = 0; i < months; i++) { const d = new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1) + i, 1); map[`${d.getFullYear()}-${pad(d.getMonth() + 1)}`] = { month: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, in: 0, out: 0 }; }
    rows.forEach((r) => { if (map[r.month]) map[r.month][r.direction] = r2(map[r.month][r.direction] + r.total); });
    const cats = {};
    rows.filter((r) => r.direction === 'out').forEach((r) => { cats[r.category || 'Diğer'] = r2((cats[r.category || 'Diğer'] || 0) + r.total); });
    res.json({ success: true, data: { currency: cur, months: Object.values(map), expenseByCategory: Object.entries(cats).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total) } });
  }));

  // ---- hesaplar ----
  app.get('/api/finance/accounts', view, wrap(async (req, res) => res.json({ success: true, data: await accountsWithBalance(true) })));
  app.post('/api/finance/accounts', manage, wrap(async (req, res) => {
    const b = req.body || {};
    const name = clip(b.name, 80); if (!name) throw bad('Hesap adı gerekli.');
    const type = b.type === 'cash' ? 'cash' : 'bank';
    const currency = CURRENCIES.includes(b.currency) ? b.currency : 'TRY';
    const opening = b.openingBalance === '' || b.openingBalance == null ? 0 : Number(b.openingBalance);
    if (!Number.isFinite(opening) || Math.abs(opening) > 1e12) throw bad('Açılış bakiyesi geçersiz.');
    const id = uid('FA');
    await dbRun(`INSERT INTO fin_accounts (id, name, type, currency, iban, openingBalance, active, createdAt) VALUES (?,?,?,?,?,?,1,?)`, [id, name, type, currency, clip(b.iban, 40), r2(opening), new Date().toISOString()]);
    res.json({ success: true, message: `"${name}" hesabı açıldı.`, data: { id } });
  }));
  app.put('/api/finance/accounts/:id', manage, wrap(async (req, res) => {
    const a = await dbGet(`SELECT * FROM fin_accounts WHERE id = ?`, [req.params.id]);
    if (!a) throw bad('Hesap bulunamadı.', 404);
    const b = req.body || {};
    await dbRun(`UPDATE fin_accounts SET name = ?, iban = ?, active = ? WHERE id = ?`, [clip(b.name, 80) || a.name, b.iban == null ? a.iban : clip(b.iban, 40), b.active === false || b.active === 0 ? 0 : 1, a.id]);
    res.json({ success: true, message: 'Hesap güncellendi.' });
  }));

  // ---- hareketler ----
  app.get('/api/finance/transactions', view, wrap(async (req, res) => {
    const q = req.query || {}; const where = ['1=1']; const p = [];
    if (q.accountId) { where.push('t.accountId = ?'); p.push(String(q.accountId)); }
    if (q.direction === 'in' || q.direction === 'out') { where.push('t.direction = ?'); p.push(q.direction); }
    if (q.partyType) { where.push('t.partyType = ?'); p.push(String(q.partyType)); }
    if (q.partyId) { where.push('t.partyId = ?'); p.push(String(q.partyId)); }
    if (q.from && isDate(q.from)) { where.push('t.date >= ?'); p.push(q.from); }
    if (q.to && isDate(q.to)) { where.push('t.date <= ?'); p.push(q.to); }
    if (q.q) { where.push('(t.description LIKE ? OR t.category LIKE ? OR t.partyName LIKE ?)'); const l = `%${String(q.q).slice(0, 60).replace(/[%_]/g, '')}%`; p.push(l, l, l); }
    if (q.voided !== '1') where.push('t.voided = 0');
    const limit = Math.min(2000, Math.max(1, Number(q.limit) || 300));
    const rows = await dbAll(`SELECT t.*, a.name AS accountName, a.currency FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId WHERE ${where.join(' AND ')} ORDER BY t.date DESC, t.createdAt DESC LIMIT ${limit}`, p);
    res.json({ success: true, data: rows });
  }));

  app.post('/api/finance/transactions', manage, wrap(async (req, res) => {
    const b = req.body || {};
    const amount = parseAmount(b.amount);
    const date = parseDate(b.date, todayStr());
    const acc = await needAccount(b.accountId);
    if (b.type === 'transfer') {
      const to = await needAccount(b.toAccountId);
      if (to.id === acc.id) throw bad('Kaynak ve hedef hesap aynı olamaz.');
      if (to.currency !== acc.currency) throw bad('Hesaplar arası virman aynı para biriminde olmalıdır.');
      const ref = uid('TR');
      await dbRun('BEGIN TRANSACTION');
      await addTx({ date, accountId: acc.id, direction: 'out', amount, category: 'Virman', description: clip(b.description, 200) || `${to.name} hesabına`, refType: 'transfer', refId: ref, by: who(req) });
      await addTx({ date, accountId: to.id, direction: 'in', amount, category: 'Virman', description: clip(b.description, 200) || `${acc.name} hesabından`, refType: 'transfer', refId: ref, by: who(req) });
      await dbRun('COMMIT');
      return res.json({ success: true, message: `${money(amount, acc.currency)} ${acc.name} → ${to.name} virman yapıldı.` });
    }
    const direction = b.type === 'in' ? 'in' : b.type === 'out' ? 'out' : null;
    if (!direction) throw bad('İşlem türü geçersiz.');
    const category = clip(b.category, 60) || (direction === 'in' ? 'Diğer gelir' : 'Diğer gider');
    await addTx({ date, accountId: acc.id, direction, amount, category, description: b.description, by: who(req) });
    res.json({ success: true, message: `${direction === 'in' ? 'Gelir' : 'Gider'} kaydedildi: ${money(amount, acc.currency)} (${acc.name}).` });
  }));

  /** Kaydı iptal eder; bağlı olduğu ERP/kredi/çek etkisini geri alır */
  app.post('/api/finance/transactions/:id/void', manage, wrap(async (req, res) => {
    const t = await dbGet(`SELECT t.*, a.currency FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId WHERE t.id = ?`, [req.params.id]);
    if (!t || t.voided) throw bad('Kayıt bulunamadı veya zaten iptal edilmiş.', 404);
    await dbRun('BEGIN TRANSACTION');
    const legs = t.refType === 'transfer' ? await dbAll(`SELECT * FROM fin_transactions WHERE refType='transfer' AND refId = ? AND voided = 0`, [t.refId]) : [t];
    for (const l of legs) await dbRun(`UPDATE fin_transactions SET voided = 1 WHERE id = ?`, [l.id]);
    if (t.refType === 'customer_payment' && t.partyId) await dbRun(`UPDATE customers SET balance = balance + ? WHERE id = ?`, [t.amount, t.partyId]);
    if (t.refType === 'cheque_customer' && t.partyId) await dbRun(`UPDATE customers SET balance = balance + ? WHERE id = ?`, [t.amount, t.partyId]);
    if (t.refType === 'installment' && t.refId) {
      const i = await dbGet(`SELECT * FROM fin_installments WHERE id = ?`, [t.refId]);
      if (i) { const paid = Math.max(0, r2(i.paidAmount - t.amount)); await dbRun(`UPDATE fin_installments SET paidAmount = ?, status = 'pending', paidDate = ? WHERE id = ?`, [paid, paid > 0 ? i.paidDate : null, i.id]); }
    }
    if ((t.refType === 'cheque_customer' || t.refType === 'cheque_supplier' || t.refType === 'cheque') && t.refId) await dbRun(`UPDATE fin_cheques SET status='pending', settledDate=NULL WHERE id = ?`, [t.refId]);
    await dbRun('COMMIT');
    res.json({ success: true, message: 'Kayıt iptal edildi, bağlı bakiyeler geri alındı.' });
  }));

  // ---- müşteriler ----
  app.get('/api/finance/customers', view, wrap(async (req, res) => res.json({ success: true, data: await customerList() })));

  app.get('/api/finance/customers/:id/statement', view, wrap(async (req, res) => {
    const c = await dbGet(`SELECT * FROM customers WHERE id = ?`, [req.params.id]);
    if (!c) throw bad('Müşteri bulunamadı.', 404);
    const sales = await customerSales(c.id);
    const pays = await dbAll(`SELECT t.id, t.date, t.amount, t.description, t.category, t.createdBy, a.name AS accountName FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId WHERE t.partyType='customer' AND t.partyId = ? AND t.direction='in' AND t.voided = 0`, [c.id]);
    const rows = [
      ...sales.map((s) => ({ date: s.date.slice(0, 10), ts: s.date, kind: s.type === 'iade' ? 'return' : 'sale', text: s.productName ? `${s.type === 'iade' ? 'İade' : 'Satış'} · ${s.productName} × ${s.quantity}${s.note ? ' · ' + s.note : ''}` : `${s.type === 'iade' ? 'İade' : 'Fatura'}${s.note ? ' · ' + s.note : ''}` /* ürünsüz kayıt: hizmet / navlun faturası */, debit: s.type === 'iade' ? 0 : s.amount, credit: s.type === 'iade' ? s.amount : 0 })),
      ...pays.map((p) => ({ date: p.date, ts: `${p.date}T12:00:00`, kind: 'payment', id: p.id, text: `Tahsilat · ${p.accountName}${p.description ? ' · ' + p.description : ''}`, debit: 0, credit: p.amount })),
    ].sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
    const net = r2(rows.reduce((a, r) => a + r.debit - r.credit, 0));
    const opening = r2((Number(c.balance) || 0) - net); // hareketi olmayan devir bakiye
    let run = opening;
    const lines = rows.map((r) => { run = r2(run + r.debit - r.credit); return { ...r, balance: run }; });
    res.json({ success: true, data: { customer: { id: c.id, name: c.name, currency: cur(c.currency), balance: r2(c.balance || 0), paymentTerm: termOf(c) }, opening, lines } });
  }));

  app.post('/api/finance/customers/:id/payment', manage, wrap(async (req, res) => {
    const c = await dbGet(`SELECT * FROM customers WHERE id = ?`, [req.params.id]);
    if (!c) throw bad('Müşteri bulunamadı.', 404);
    const b = req.body || {};
    const amount = parseAmount(b.amount);
    const date = parseDate(b.date, todayStr());
    const acc = await needAccount(b.accountId, cur(c.currency));
    await dbRun('BEGIN TRANSACTION');
    await addTx({ date, accountId: acc.id, direction: 'in', amount, category: 'Müşteri tahsilatı', description: clip(b.note, 200) || clip(b.method, 40), partyType: 'customer', partyId: c.id, partyName: c.name, refType: 'customer_payment', by: who(req) });
    await dbRun(`UPDATE customers SET balance = balance - ? WHERE id = ?`, [amount, c.id]);
    await dbRun('COMMIT');
    const now = await dbGet(`SELECT balance FROM customers WHERE id = ?`, [c.id]);
    res.json({ success: true, message: `${c.name}: ${money(amount, acc.currency)} tahsilat alındı. Kalan bakiye ${money(now.balance, acc.currency)}.` });
  }));

  app.put('/api/finance/customers/:id/terms', manage, wrap(async (req, res) => {
    const days = Math.round(Number((req.body || {}).paymentTerm));
    if (!Number.isInteger(days) || days < 0 || days > 365) throw bad('Vade 0-365 gün olmalı.');
    const r = await dbGet(`SELECT id FROM customers WHERE id = ?`, [req.params.id]);
    if (!r) throw bad('Müşteri bulunamadı.', 404);
    await dbRun(`UPDATE customers SET paymentTerm = ? WHERE id = ?`, [days, req.params.id]);
    res.json({ success: true, message: `Vade ${days} gün olarak kaydedildi.` });
  }));

  // ---- tedarikçiler ----
  app.get('/api/finance/suppliers', view, wrap(async (req, res) => res.json({ success: true, data: await supplierList() })));

  app.get('/api/finance/suppliers/:id/statement', view, wrap(async (req, res) => {
    const s = (await supplierList()).find((x) => x.id === req.params.id);
    if (!s) throw bad('Tedarikçi bulunamadı.', 404);
    const orders = await dbAll(`SELECT o.id, o.invoiceNo, COALESCE(o.receiptDate, o.orderDate) AS date,
      (SELECT COALESCE(SUM(l.receivedQty * l.unitPrice * (1 - COALESCE(l.discount,0)/100) * (1 + COALESCE(l.taxRate,0)/100)),0) FROM purchase_order_lines l WHERE l.orderId = o.id) AS value
      FROM purchase_orders o WHERE o.supplierId = ? AND o.status IN ('partial','received')`, [s.id]);
    const pays = await dbAll(`SELECT t.id, t.date, t.amount, t.description, a.name AS accountName FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId WHERE t.partyType='supplier' AND t.partyId = ? AND t.direction='out' AND t.voided = 0`, [s.id]);
    const rows = [
      ...orders.filter((o) => o.value > 0).map((o) => ({ date: String(o.date).slice(0, 10), kind: 'purchase', text: `Mal kabul · ${o.id}${o.invoiceNo ? ' · ' + o.invoiceNo : ''}`, debit: 0, credit: r2(o.value) })),
      ...pays.map((p) => ({ date: p.date, kind: 'payment', id: p.id, text: `Ödeme · ${p.accountName}${p.description ? ' · ' + p.description : ''}`, debit: r2(p.amount), credit: 0 })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    let run = 0;
    res.json({ success: true, data: { supplier: s, lines: rows.map((r) => { run = r2(run + r.credit - r.debit); return { ...r, balance: run }; }) } });
  }));

  app.post('/api/finance/suppliers/:id/payment', manage, wrap(async (req, res) => {
    const s = (await supplierList()).find((x) => x.id === req.params.id);
    if (!s) throw bad('Tedarikçi bulunamadı.', 404);
    const b = req.body || {};
    const amount = parseAmount(b.amount);
    const date = parseDate(b.date, todayStr());
    const acc = await needAccount(b.accountId, s.currency);
    if (amount > s.balance + 0.004) throw bad(`Ödeme tutarı borçtan (${money(s.balance, s.currency)}) fazla olamaz. Avans için "Gider" kaydı açın.`);
    await addTx({ date, accountId: acc.id, direction: 'out', amount, category: 'Tedarikçi ödemesi', description: clip(b.note, 200), partyType: 'supplier', partyId: s.id, partyName: s.name, refType: 'supplier_payment', by: who(req) });
    res.json({ success: true, message: `${s.name}: ${money(amount, acc.currency)} ödeme yapıldı. Kalan borç ${money(s.balance - amount, acc.currency)}.` });
  }));

  // ---- krediler ----
  function loanInput(b) {
    const name = clip(b.name, 80); if (!name) throw bad('Kredi adı gerekli.');
    const principal = parseAmount(b.principal);
    const rate = Number(b.rate == null || b.rate === '' ? 0 : b.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 500) throw bad('Faiz oranı (yıllık %) geçersiz.');
    const taxRate = Number(b.taxRate == null || b.taxRate === '' ? 0 : b.taxRate);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw bad('Vergi oranı geçersiz.');
    const termMonths = Math.round(Number(b.termMonths));
    if (!(termMonths >= 1 && termMonths <= 480)) throw bad('Vade (ay) 1-480 arasında olmalı.');
    const startDate = parseDate(b.startDate, todayStr());
    const firstDueDate = parseDate(b.firstDueDate, addMonths(startDate, 1));
    const type = ['annuity', 'equal_principal', 'bullet'].includes(b.type) ? b.type : 'annuity';
    const currency = CURRENCIES.includes(b.currency) ? b.currency : 'TRY';
    return { name, lender: clip(b.lender, 80), principal, rate, taxRate, termMonths, startDate, firstDueDate, type, currency, note: clip(b.note, 300) };
  }
  app.post('/api/finance/loans/preview', view, wrap(async (req, res) => {
    const l = loanInput(req.body || {});
    const schedule = buildSchedule(l);
    res.json({ success: true, data: { schedule, totalPayment: r2(schedule.reduce((a, s) => a + s.amount, 0)), totalInterest: r2(schedule.reduce((a, s) => a + s.interest + s.tax, 0)) } });
  }));

  async function loanRows() {
    const loans = await dbAll(`SELECT * FROM fin_loans ORDER BY status, createdAt DESC`);
    const inst = await dbAll(`SELECT * FROM fin_installments ORDER BY loanId, no`);
    return loans.map((l) => {
      const mine = inst.filter((i) => i.loanId === l.id);
      const open = mine.filter((i) => i.status !== 'paid');
      const next = open[0];
      return { ...l, installmentCount: mine.length, paidCount: mine.length - open.length, outstandingPrincipal: r2(open.reduce((a, i) => a + i.principal, 0)),
        remainingTotal: r2(open.reduce((a, i) => a + i.amount - i.paidAmount, 0)), totalPayment: r2(mine.reduce((a, i) => a + i.amount, 0)),
        nextDue: next ? next.dueDate : null, nextAmount: next ? r2(next.amount - next.paidAmount) : 0, overdueCount: open.filter((i) => dayDiff(i.dueDate) < 0).length };
    });
  }
  app.get('/api/finance/loans', view, wrap(async (req, res) => res.json({ success: true, data: await loanRows() })));
  app.get('/api/finance/loans/:id', view, wrap(async (req, res) => {
    const l = (await loanRows()).find((x) => x.id === req.params.id);
    if (!l) throw bad('Kredi bulunamadı.', 404);
    const installments = (await dbAll(`SELECT * FROM fin_installments WHERE loanId = ? ORDER BY no`, [l.id])).map((i) => ({ ...i, daysLeft: dayDiff(i.dueDate) }));
    res.json({ success: true, data: { ...l, installments } });
  }));
  app.post('/api/finance/loans', manage, wrap(async (req, res) => {
    const b = req.body || {};
    const l = loanInput(b);
    const schedule = buildSchedule(l);
    let acc = null;
    if (b.accountId) acc = await needAccount(b.accountId, l.currency);
    const id = uid('LN');
    await dbRun('BEGIN TRANSACTION');
    await dbRun(`INSERT INTO fin_loans (id, name, lender, currency, principal, rate, taxRate, termMonths, type, startDate, firstDueDate, status, note, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,'active',?,?,?)`,
      [id, l.name, l.lender, l.currency, l.principal, l.rate, l.taxRate, l.termMonths, l.type, l.startDate, l.firstDueDate, l.note, who(req), new Date().toISOString()]);
    for (const s of schedule) await dbRun(`INSERT INTO fin_installments (id, loanId, no, dueDate, principal, interest, tax, amount, paidAmount, status) VALUES (?,?,?,?,?,?,?,?,0,'pending')`, [`${id}-${s.no}`, id, s.no, s.dueDate, s.principal, s.interest, s.tax, s.amount]);
    if (acc && b.disburse !== false) await addTx({ date: l.startDate, accountId: acc.id, direction: 'in', amount: l.principal, category: 'Kredi kullanımı', description: `${l.name} kredi kullanımı`, partyType: 'loan', partyId: id, partyName: l.name, refType: 'loan_disburse', refId: id, by: who(req) });
    await dbRun('COMMIT');
    res.json({ success: true, message: `"${l.name}" kredisi ${schedule.length} taksitle kaydedildi${acc ? ' ve hesaba işlendi' : ''}.`, data: { id } });
  }));
  app.post('/api/finance/loans/:id/close', manage, wrap(async (req, res) => {
    const l = await dbGet(`SELECT id FROM fin_loans WHERE id = ?`, [req.params.id]);
    if (!l) throw bad('Kredi bulunamadı.', 404);
    await dbRun(`UPDATE fin_loans SET status = ? WHERE id = ?`, [(req.body || {}).reopen ? 'active' : 'closed', l.id]);
    res.json({ success: true, message: 'Kredi durumu güncellendi.' });
  }));
  app.delete('/api/finance/loans/:id', manage, wrap(async (req, res) => {
    const l = await dbGet(`SELECT * FROM fin_loans WHERE id = ?`, [req.params.id]);
    if (!l) throw bad('Kredi bulunamadı.', 404);
    const paid = await dbGet(`SELECT COUNT(*) AS n FROM fin_installments WHERE loanId = ? AND paidAmount > 0`, [l.id]);
    if (paid.n > 0) throw bad('Ödemesi yapılmış kredi silinemez; önce ödemeleri iptal edin veya krediyi kapatın.');
    await dbRun('BEGIN TRANSACTION');
    await dbRun(`UPDATE fin_transactions SET voided = 1 WHERE refType = 'loan_disburse' AND refId = ?`, [l.id]);
    await dbRun(`DELETE FROM fin_installments WHERE loanId = ?`, [l.id]);
    await dbRun(`DELETE FROM fin_loans WHERE id = ?`, [l.id]);
    await dbRun('COMMIT');
    res.json({ success: true, message: 'Kredi silindi.' });
  }));
  app.post('/api/finance/installments/:id/pay', manage, wrap(async (req, res) => {
    const i = await dbGet(`SELECT i.*, l.currency, l.name AS loanName, l.lender FROM fin_installments i JOIN fin_loans l ON l.id = i.loanId WHERE i.id = ?`, [req.params.id]);
    if (!i) throw bad('Taksit bulunamadı.', 404);
    if (i.status === 'paid') throw bad('Bu taksit zaten ödenmiş.');
    const b = req.body || {};
    const rest = r2(i.amount - i.paidAmount);
    const amount = b.amount == null || b.amount === '' ? rest : parseAmount(b.amount);
    if (amount > rest + 0.004) throw bad(`Ödeme kalan tutardan (${money(rest, i.currency)}) fazla olamaz.`);
    const date = parseDate(b.date, todayStr());
    const acc = await needAccount(b.accountId, i.currency);
    await dbRun('BEGIN TRANSACTION');
    await addTx({ date, accountId: acc.id, direction: 'out', amount, category: 'Kredi taksiti', description: `${i.loanName} · ${i.no}. taksit`, partyType: 'loan', partyId: i.loanId, partyName: i.loanName, refType: 'installment', refId: i.id, by: who(req) });
    const paid = r2(i.paidAmount + amount);
    await dbRun(`UPDATE fin_installments SET paidAmount = ?, paidDate = ?, status = ? WHERE id = ?`, [paid, date, paid >= i.amount - 0.004 ? 'paid' : 'pending', i.id]);
    await dbRun('COMMIT');
    res.json({ success: true, message: `${i.loanName} ${i.no}. taksit: ${money(amount, i.currency)} ödendi.` });
  }));

  // ---- çek / senet ----
  app.get('/api/finance/cheques', view, wrap(async (req, res) => {
    const rows = await dbAll(`SELECT * FROM fin_cheques ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, dueDate`);
    res.json({ success: true, data: rows.map((c) => ({ ...c, daysLeft: c.status === 'pending' ? dayDiff(c.dueDate) : null })) });
  }));
  app.post('/api/finance/cheques', manage, wrap(async (req, res) => {
    const b = req.body || {};
    const kind = b.kind === 'payable' ? 'payable' : 'receivable';
    const amount = parseAmount(b.amount);
    const dueDate = parseDate(b.dueDate);
    const currency = CURRENCIES.includes(b.currency) ? b.currency : 'TRY';
    let partyType = null, partyId = null, partyName = clip(b.partyName, 100);
    if (b.partyId && kind === 'receivable') {
      const c = await dbGet(`SELECT id, name, currency FROM customers WHERE id = ?`, [String(b.partyId)]);
      if (!c) throw bad('Müşteri bulunamadı.');
      if (cur(c.currency) !== currency) throw bad(`Bu müşteri ${cur(c.currency)} cinsinden; çek para birimi aynı olmalı.`);
      partyType = 'customer'; partyId = c.id; partyName = c.name;
    } else if (b.partyId && kind === 'payable') {
      const s = await dbGet(`SELECT id, name, currency FROM suppliers WHERE id = ?`, [String(b.partyId)]);
      if (!s) throw bad('Tedarikçi bulunamadı.');
      if (cur(s.currency) !== currency) throw bad(`Bu tedarikçi ${cur(s.currency)} cinsinden; çek para birimi aynı olmalı.`);
      partyType = 'supplier'; partyId = s.id; partyName = s.name;
    }
    if (!partyName) throw bad('Karşı taraf (müşteri / tedarikçi / keşideci) gerekli.');
    const id = uid('CK');
    await dbRun(`INSERT INTO fin_cheques (id, kind, number, partyType, partyId, partyName, bank, currency, amount, dueDate, status, note, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?,?)`,
      [id, kind, clip(b.number, 40), partyType, partyId, partyName, clip(b.bank, 60), currency, amount, dueDate, clip(b.note, 200), who(req), new Date().toISOString()]);
    res.json({ success: true, message: `${kind === 'payable' ? 'Ödenecek' : 'Alınan'} çek/senet kaydedildi (vade ${dueDate}).`, data: { id } });
  }));
  app.post('/api/finance/cheques/:id/settle', manage, wrap(async (req, res) => {
    const c = await dbGet(`SELECT * FROM fin_cheques WHERE id = ?`, [req.params.id]);
    if (!c) throw bad('Kayıt bulunamadı.', 404);
    if (c.status !== 'pending') throw bad('Bu çek/senet zaten sonuçlanmış.');
    const b = req.body || {};
    const date = parseDate(b.date, todayStr());
    const acc = await needAccount(b.accountId, c.currency);
    const dir = c.kind === 'payable' ? 'out' : 'in';
    if (c.kind === 'payable' && c.partyType === 'supplier') {
      const s = (await supplierList()).find((x) => x.id === c.partyId);
      if (s && c.amount > s.balance + 0.004) throw bad(`Çek tutarı tedarikçi borcundan (${money(s.balance, s.currency)}) fazla.`);
    }
    await dbRun('BEGIN TRANSACTION');
    const refType = c.partyType === 'customer' ? 'cheque_customer' : c.partyType === 'supplier' ? 'cheque_supplier' : 'cheque';
    await addTx({ date, accountId: acc.id, direction: dir, amount: c.amount, category: c.kind === 'payable' ? 'Tedarikçi ödemesi' : 'Müşteri tahsilatı', description: `Çek/senet${c.number ? ' ' + c.number : ''}`, partyType: c.partyType, partyId: c.partyId, partyName: c.partyName, refType, refId: c.id, by: who(req) });
    if (c.partyType === 'customer') await dbRun(`UPDATE customers SET balance = balance - ? WHERE id = ?`, [c.amount, c.partyId]);
    await dbRun(`UPDATE fin_cheques SET status = ?, settledDate = ? WHERE id = ?`, [c.kind === 'payable' ? 'paid' : 'collected', date, c.id]);
    await dbRun('COMMIT');
    res.json({ success: true, message: `Çek/senet ${c.kind === 'payable' ? 'ödendi' : 'tahsil edildi'}: ${money(c.amount, c.currency)}.` });
  }));
  app.post('/api/finance/cheques/:id/status', manage, wrap(async (req, res) => {
    const c = await dbGet(`SELECT * FROM fin_cheques WHERE id = ?`, [req.params.id]);
    if (!c) throw bad('Kayıt bulunamadı.', 404);
    if (c.status !== 'pending') throw bad('Yalnızca bekleyen kayıtlar için.');
    const st = (req.body || {}).status;
    if (!['bounced', 'cancelled'].includes(st)) throw bad('Durum geçersiz.');
    await dbRun(`UPDATE fin_cheques SET status = ? WHERE id = ?`, [st, c.id]);
    res.json({ success: true, message: st === 'bounced' ? 'Karşılıksız / iade olarak işaretlendi.' : 'Çek/senet iptal edildi.' });
  }));
  app.delete('/api/finance/cheques/:id', manage, wrap(async (req, res) => {
    const c = await dbGet(`SELECT status FROM fin_cheques WHERE id = ?`, [req.params.id]);
    if (!c) throw bad('Kayıt bulunamadı.', 404);
    if (c.status === 'collected' || c.status === 'paid') throw bad('Sonuçlanmış kayıt silinemez; ilgili hesap hareketini iptal edin.');
    await dbRun(`DELETE FROM fin_cheques WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Kayıt silindi.' });
  }));

  // ---- hatırlatma ----
  app.get('/api/finance/reminders', view, wrap(async (req, res) => {
    const days = await remindDays();
    const max = Math.max(0, ...days);
    const items = (await dueItems()).filter((i) => i.amount > 0.004 && i.daysLeft <= max);
    res.json({ success: true, data: { remindDays: days, items } });
  }));
  app.put('/api/finance/settings', manage, wrap(async (req, res) => {
    const list = String((req.body || {}).remindDays || '').split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 90);
    if (!list.length) throw bad('En az bir gün değeri girin (örn. 7,3,1,0).');
    await setSetting('remindDays', [...new Set(list)].sort((a, b) => b - a).join(','));
    res.json({ success: true, message: 'Hatırlatma günleri kaydedildi.' });
  }));
  app.post('/api/finance/reminders/run', manage, wrap(async (req, res) => {
    const r = await runReminders();
    res.json({ success: true, message: r.sent ? `${r.sent} bildirim gönderildi.` : 'Gönderilecek yeni hatırlatma yok.', data: r });
  }));

  // ---- bağımsız finans arayüzü uçları (takvim, nakit akışı tablosu, planlı kalemler) ----
  const hub = require('./financeHub')({ app, dbAll, dbGet, dbRun, view, manage, wrap, bad, who,
    h: { r2, cur, isDate, todayStr, dayDiff, addDaysStr, clip, uid, CURRENCIES, customerSales, termOf, dueItems, addTx, needAccount, parseAmount, parseDate } });

  return { initSchema: (run) => { initSchema(run); hub.initSchema(run); }, startReminders, runReminders };
};
module.exports.buildSchedule = buildSchedule;
module.exports.CURRENCIES = CURRENCIES;
