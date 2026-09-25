/**
 * FİNANS MERKEZİ — bağımsız finans arayüzünün (finance.html) ek uçları
 *
 *  GET  /api/finance/calendar          takvim olayları (kredi taksiti, müşteri alacağı, çek/senet, tedarikçi, planlı kalem)
 *  GET  /api/finance/cashflow/table    tarih bazlı nakit akışı: gerçekleşen hareketler + (isteğe bağlı) vade tahmini, yürüyen bakiye
 *  GET  /api/finance/receivables       açık müşteri alacakları, fatura (ERP belge) referansıyla
 *  GET  /api/finance/planned           planlı gelir/gider kalemleri
 *  POST /api/finance/planned           planlı kalem ekle
 *  PUT  /api/finance/planned/:id       planlı kalemi güncelle / gerçekleştir (hesaba hareket yazar) / iptal et
 *
 * ERP uyumu: her olay ve satır { party: { type, id, name }, erpRef: { docType, docNo } } taşır.
 *  docType: SF (satış faturası) · AF (alış faturası) · KRD (kredi taksiti) · CEK · PLN (planlı) · FH (finans hareketi)
 * Tenant: her kayıt/yanıt TENANT_ID ile damgalanır; kimlik jetonu ve X-Tenant-Id başlığı security.js'de denetlenir.
 */

module.exports = function createFinanceHub({ app, dbAll, dbGet, dbRun, view, manage, wrap, bad, who, h }) {
  const TENANT = process.env.TENANT_ID || 'default';
  const { r2, cur, isDate, todayStr, dayDiff, addDaysStr, clip, uid, CURRENCIES, customerSales, termOf, dueItems, addTx, needAccount, parseAmount, parseDate } = h;
  const ymd = (d) => d.toISOString().slice(0, 10);
  const status = (date, done) => (done ? 'paid' : dayDiff(date) < 0 ? 'overdue' : dayDiff(date) === 0 ? 'due_today' : 'upcoming');
  const salesRef = (s) => ({ docType: 'SF', docNo: s.invoiceNo || `SF-${s.id}` });

  function initSchema(run) {
    run(`CREATE TABLE IF NOT EXISTS fin_planned (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, date TEXT NOT NULL, direction TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL,
      category TEXT, description TEXT, partyType TEXT, partyId TEXT, partyName TEXT, erpDocType TEXT, erpDocNo TEXT,
      status TEXT DEFAULT 'planned', realizedTxId TEXT, createdBy TEXT, createdAt TEXT, updatedAt TEXT)`);
    run(`CREATE INDEX IF NOT EXISTS ix_fin_planned ON fin_planned(tenantId, date)`);
    // ERP belge referansları (varsa korunur)
    for (const sql of [`ALTER TABLE sales ADD COLUMN invoiceNo TEXT`, `ALTER TABLE fin_transactions ADD COLUMN erpDocType TEXT`, `ALTER TABLE fin_transactions ADD COLUMN erpDocNo TEXT`]) {
      try { run(sql); } catch (_e) { /* sütun zaten var */ }
    }
  }

  /** Müşteri başına açık bakiye, en yeni satışlardan geriye dağıtılır (yaşlandırma ile aynı FIFO kuralı) */
  async function openReceivables(customerId) {
    const customers = await dbAll(`SELECT * FROM customers ${customerId ? 'WHERE id = ?' : ''} ORDER BY name`, customerId ? [customerId] : []);
    const out = [];
    for (const c of customers) {
      let left = Math.max(0, Number(c.balance) || 0);
      if (left <= 0.004) continue;
      const term = termOf(c);
      const inv = new Map((await dbAll(`SELECT id, invoiceNo FROM sales WHERE customerId = ?`, [c.id])).map((s) => [s.id, s.invoiceNo]));
      const sales = (await customerSales(c.id)).filter((s) => s.type !== 'iade').sort((a, b) => String(b.date).localeCompare(String(a.date)));
      for (const s of sales) {
        if (left <= 0.004) break;
        const amount = r2(Math.min(left, s.amount)); left = r2(left - amount);
        const dueDate = addDaysStr(String(s.date).slice(0, 10), term);
        out.push({ id: `RCV-${s.id}`, saleId: s.id, customerId: c.id, customerName: c.name, currency: cur(c.currency), invoiceDate: String(s.date).slice(0, 10), dueDate, amount,
          daysLeft: dayDiff(dueDate), erpRef: salesRef({ id: s.id, invoiceNo: inv.get(s.id) }), product: s.productName || '' });
      }
      if (left > 0.004) out.push({ id: `RCV-${c.id}-devir`, saleId: null, customerId: c.id, customerName: c.name, currency: cur(c.currency), invoiceDate: null, dueDate: todayStr(), amount: left,
        daysLeft: 0, erpRef: { docType: 'DEVIR', docNo: `DEVIR-${c.id}` }, product: '' });
    }
    return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  async function plannedRows({ from, to } = {}) {
    const rows = await dbAll(`SELECT p.*, t.voided AS txVoided FROM fin_planned p LEFT JOIN fin_transactions t ON t.id = p.realizedTxId
      WHERE p.tenantId = ? ${from ? 'AND p.date >= ?' : ''} ${to ? 'AND p.date <= ?' : ''} ORDER BY p.date`, [TENANT, ...(from ? [from] : []), ...(to ? [to] : [])]);
    // gerçekleştirme hareketi iptal edildiyse kalem yeniden "planlı" sayılır
    return rows.map(({ txVoided, ...p }) => ({ ...p, status: p.status === 'realized' && txVoided ? 'planned' : p.status }));
  }

  const party = (type, id, name) => ({ type, id: id == null ? null : String(id), name: name || '' });

  /** Takvim + tahmin kaynağı: tüm vadeli kalemler tek biçimde */
  async function scheduleItems({ from, to, includePaid }) {
    const ev = [];
    const inst = await dbAll(`SELECT i.*, l.name AS loanName, l.lender, l.currency, l.status AS loanStatus FROM fin_installments i JOIN fin_loans l ON l.id = i.loanId
      WHERE l.status = 'active' ${includePaid ? '' : "AND i.status != 'paid'"} AND i.dueDate <= ? ${includePaid ? "AND (i.dueDate >= ? OR i.status != 'paid')" : ''} ORDER BY i.dueDate`, includePaid ? [to, from] : [to]);
    for (const i of inst) {
      const paid = i.status === 'paid';
      ev.push({ id: `LN:${i.id}`, type: 'loan', date: i.dueDate, status: status(i.dueDate, paid), direction: 'out', amount: r2(paid ? i.amount : i.amount - (i.paidAmount || 0)), currency: i.currency,
        title: `${i.loanName} · ${i.no}. taksit`, party: party('lender', null, i.lender), erpRef: { docType: 'KRD', docNo: `${i.loanId}/${i.no}` },
        target: { route: 'finance', params: { tab: 'loans', loan: i.loanId, inst: i.id } } });
    }
    for (const r of await openReceivables()) {
      if (r.dueDate > to) continue;
      ev.push({ id: r.id, type: 'receivable', date: r.dueDate, status: status(r.dueDate, false), direction: 'in', amount: r.amount, currency: r.currency,
        title: `Tahsilat · ${r.customerName}`, party: party('customer', r.customerId, r.customerName), erpRef: r.erpRef,
        target: { route: 'finance', params: { tab: 'parties', sub: 'customers', customer: r.customerId } } });
    }
    for (const d of await dueItems()) {
      if (d.dueDate > to || d.kind === 'installment') continue;
      const isCheque = d.kind !== 'supplier';
      ev.push({ id: `${isCheque ? 'CQ' : 'SP'}:${d.id}`, type: isCheque ? d.kind : 'supplier', date: d.dueDate, status: status(d.dueDate, false), direction: d.direction, amount: r2(d.amount), currency: cur(d.currency),
        title: d.title, party: party(isCheque ? 'party' : 'supplier', isCheque ? null : String(d.id).split(':')[0], d.party),
        erpRef: isCheque ? { docType: 'CEK', docNo: d.id } : { docType: 'AF', docNo: String(d.title).split(' · ')[1] || String(d.id).split(':')[1] },
        target: isCheque ? { route: 'finance', params: { tab: 'cheques', cheque: d.id } } : { route: 'finance', params: { tab: 'parties', sub: 'suppliers', supplier: String(d.id).split(':')[0] } } });
    }
    for (const p of await plannedRows({ to })) {
      if (p.status === 'cancelled' || (!includePaid && p.status === 'realized')) continue;
      ev.push({ id: `PL:${p.id}`, type: 'planned', date: p.date, status: status(p.date, p.status === 'realized'), direction: p.direction, amount: r2(p.amount), currency: p.currency,
        title: p.description || p.category || 'Planlı kalem', party: party(p.partyType, p.partyId, p.partyName), erpRef: { docType: p.erpDocType || 'PLN', docNo: p.erpDocNo || p.id },
        target: { route: 'cashflow', params: { planned: p.id } } });
    }
    return ev.filter((e) => e.amount > 0.004);
  }

  const rangeOf = (q, defDays) => {
    const from = isDate(q.from) ? q.from : todayStr();
    const to = isDate(q.to) ? q.to : addDaysStr(from, defDays);
    if (to < from) throw bad('Bitiş tarihi başlangıçtan önce olamaz.');
    if (dayDiff(to) - dayDiff(from) > 400) throw bad('En fazla 400 günlük aralık seçilebilir.');
    return { from, to };
  };

  // ---- takvim ----
  app.get('/api/finance/calendar', view, wrap(async (req, res) => {
    const { from, to } = rangeOf(req.query, 42);
    const types = String(req.query.types || '').split(',').filter(Boolean);
    const all = await scheduleItems({ from, to, includePaid: true });
    // aralıktan önce vadesi geçmiş ama ödenmemişler de gösterilir (takvimin ilk gününe "gecikmiş" olarak)
    const events = all.filter((e) => (e.date >= from || e.status === 'overdue') && (!types.length || types.includes(e.type)));
    const sum = (f) => events.filter(f).reduce((m, e) => ((m[e.currency] = r2((m[e.currency] || 0) + e.amount)), m), {});
    res.json({ success: true, data: { tenant: TENANT, from, to, today: todayStr(), events,
      totals: { overdueLoans: sum((e) => e.type === 'loan' && e.status === 'overdue'), upcomingLoans: sum((e) => e.type === 'loan' && ['upcoming', 'due_today'].includes(e.status)), receivables: sum((e) => e.type === 'receivable') } } });
  }));

  // ---- nakit akışı tablosu ----
  app.get('/api/finance/cashflow/table', view, wrap(async (req, res) => {
    const q = req.query || {};
    const { from, to } = rangeOf({ from: q.from || addDaysStr(todayStr(), -30), to: q.to || addDaysStr(todayStr(), 60) }, 90);
    const currency = CURRENCIES.includes(String(q.currency)) ? String(q.currency) : 'TRY';
    const groupBy = ['day', 'week', 'month'].includes(q.groupBy) ? q.groupBy : 'day';
    const withForecast = q.forecast !== '0';
    const accId = q.accountId ? String(q.accountId) : '';
    const text = String(q.q || '').toLocaleLowerCase('tr');

    const accP = [currency, ...(accId ? [accId] : [])];
    const accWhere = `a.currency = ? ${accId ? 'AND a.id = ?' : ''}`;
    const noTransfer = accId ? '' : "AND t.refType != 'transfer'"; // tek hesapta virman da gerçek giriş/çıkıştır
    const open0 = await dbGet(`SELECT COALESCE(SUM(a.openingBalance),0) AS v FROM fin_accounts a WHERE ${accWhere}`, accP);
    const before = await dbGet(`SELECT COALESCE(SUM(CASE WHEN t.direction='in' THEN t.amount ELSE -t.amount END),0) AS v FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId
      WHERE t.voided = 0 AND ${accWhere} AND t.date < ?`, [...accP, from]);
    const opening = r2(open0.v + before.v);

    const tx = await dbAll(`SELECT t.*, a.name AS accountName FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId
      WHERE t.voided = 0 AND ${accWhere} AND t.date >= ? AND t.date <= ? ${noTransfer} ORDER BY t.date, t.createdAt`, [...accP, from, to]);
    let rows = tx.map((t) => ({ id: t.id, kind: 'actual', date: t.date, direction: t.direction, amount: r2(t.amount), category: t.category || '', description: t.description || '',
      account: t.accountName, party: party(t.partyType, t.partyId, t.partyName),
      erpRef: { docType: t.erpDocType || (t.refType === 'installment' ? 'KRD' : 'FH'), docNo: t.erpDocNo || t.refId || t.id }, target: { route: 'finance', params: { tab: 'ledger', tx: t.id } } }));

    if (withForecast && !accId) {
      const today = todayStr();
      const items = (await scheduleItems({ from: today, to, includePaid: false })).filter((e) => e.currency === currency && e.status !== 'paid');
      rows = rows.concat(items.map((e) => ({ id: e.id, kind: 'forecast', date: e.date < today ? today : e.date, dueDate: e.date, overdue: e.status === 'overdue', direction: e.direction, amount: e.amount,
        category: { loan: 'Kredi taksiti', receivable: 'Müşteri tahsilatı', supplier: 'Tedarikçi ödemesi', cheque_in: 'Çek/senet tahsili', cheque_out: 'Çek/senet ödemesi', planned: 'Planlı' }[e.type] || e.type,
        description: e.title, account: '', party: e.party, erpRef: e.erpRef, target: e.target })).filter((r) => r.date >= from && r.date <= to));
    }
    if (q.direction === 'in' || q.direction === 'out') rows = rows.filter((r) => r.direction === q.direction);
    if (q.category) rows = rows.filter((r) => r.category === q.category);
    if (q.kind === 'actual' || q.kind === 'forecast') rows = rows.filter((r) => r.kind === q.kind);
    if (text) rows = rows.filter((r) => `${r.description} ${r.party.name} ${r.erpRef.docNo} ${r.category}`.toLocaleLowerCase('tr').includes(text));
    rows.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? 0 : a.kind === 'actual' ? -1 : 1));

    let bal = opening;
    const periods = new Map();
    const keyOf = (d) => {
      if (groupBy === 'month') return d.slice(0, 7);
      if (groupBy === 'day') return d;
      const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return ymd(x); // haftanın pazartesi günü
    };
    for (const r of rows) {
      bal = r2(bal + (r.direction === 'in' ? r.amount : -r.amount)); r.balance = bal;
      const k = keyOf(r.date);
      const p = periods.get(k) || { key: k, in: 0, out: 0, forecastIn: 0, forecastOut: 0, net: 0, closing: 0 };
      const f = r.kind === 'forecast';
      if (r.direction === 'in') { p.in = r2(p.in + r.amount); if (f) p.forecastIn = r2(p.forecastIn + r.amount); } else { p.out = r2(p.out + r.amount); if (f) p.forecastOut = r2(p.forecastOut + r.amount); }
      p.net = r2(p.in - p.out); p.closing = bal; periods.set(k, p);
    }
    const cats = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    res.json({ success: true, data: { tenant: TENANT, currency, from, to, groupBy, opening, closing: bal, categories: cats,
      totals: { in: r2(rows.filter((r) => r.direction === 'in').reduce((a, r) => a + r.amount, 0)), out: r2(rows.filter((r) => r.direction === 'out').reduce((a, r) => a + r.amount, 0)) },
      lowPoint: rows.reduce((m, r) => (m == null || r.balance < m.balance ? { date: r.date, balance: r.balance } : m), null),
      periods: [...periods.values()], rows } });
  }));

  // ---- açık alacaklar ----
  app.get('/api/finance/receivables', view, wrap(async (req, res) => {
    res.json({ success: true, data: await openReceivables(req.query.customerId ? String(req.query.customerId) : null) });
  }));

  // ---- planlı kalemler ----
  async function readPlannedBody(b, old = {}) {
    const direction = (b.direction || old.direction) === 'in' ? 'in' : 'out';
    const currency = cur(b.currency || old.currency);
    const out = {
      date: parseDate(b.date, old.date || todayStr()), direction, currency,
      amount: b.amount == null ? old.amount : parseAmount(b.amount),
      category: clip(b.category == null ? old.category : b.category, 60), description: clip(b.description == null ? old.description : b.description, 200),
      partyType: null, partyId: null, partyName: clip(b.partyName == null ? old.partyName : b.partyName, 120),
      erpDocType: clip(b.erpDocType == null ? old.erpDocType : b.erpDocType, 10).toUpperCase() || null, erpDocNo: clip(b.erpDocNo == null ? old.erpDocNo : b.erpDocNo, 40) || null,
    };
    // cari ERP'deki kayda bağlanır (müşteri/tedarikçi kimliği doğrulanır)
    const pType = b.partyType === undefined ? old.partyType : b.partyType;
    const pId = b.partyId === undefined ? old.partyId : b.partyId;
    if (pType && pId) {
      if (!['customer', 'supplier'].includes(pType)) throw bad('Cari türü customer veya supplier olmalı.');
      const p = await dbGet(`SELECT id, name FROM ${pType === 'customer' ? 'customers' : 'suppliers'} WHERE id = ?`, [String(pId)]);
      if (!p) throw bad('Cari ERP kayıtlarında bulunamadı.', 404);
      Object.assign(out, { partyType: pType, partyId: String(p.id), partyName: p.name });
    }
    if (!(out.amount > 0)) throw bad('Tutar gerekli.');
    return out;
  }

  app.get('/api/finance/planned', view, wrap(async (req, res) => {
    const q = req.query || {};
    res.json({ success: true, data: await plannedRows({ from: isDate(q.from) ? q.from : null, to: isDate(q.to) ? q.to : null }) });
  }));
  app.post('/api/finance/planned', manage, wrap(async (req, res) => {
    const p = await readPlannedBody(req.body || {});
    const id = uid('PL'); const now = new Date().toISOString();
    await dbRun(`INSERT INTO fin_planned (id, tenantId, date, direction, amount, currency, category, description, partyType, partyId, partyName, erpDocType, erpDocNo, status, createdBy, createdAt, updatedAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'planned',?,?,?)`, [id, TENANT, p.date, p.direction, p.amount, p.currency, p.category, p.description, p.partyType, p.partyId, p.partyName, p.erpDocType, p.erpDocNo, who(req), now, now]);
    res.status(201).json({ success: true, message: 'Planlı kalem eklendi.', data: { id } });
  }));
  app.put('/api/finance/planned/:id', manage, wrap(async (req, res) => {
    const old = (await plannedRows()).find((p) => p.id === req.params.id);
    if (!old) throw bad('Planlı kalem bulunamadı.', 404);
    const b = req.body || {};
    if (old.status === 'realized') throw bad('Gerçekleşmiş kalem değiştirilemez; önce ilgili hareketi iptal edin.');
    const now = new Date().toISOString();
    if (b.status === 'cancelled') {
      await dbRun(`UPDATE fin_planned SET status = 'cancelled', updatedAt = ? WHERE id = ? AND tenantId = ?`, [now, old.id, TENANT]);
      return res.json({ success: true, message: 'Planlı kalem iptal edildi.' });
    }
    if (b.status === 'realized') {
      const acc = await needAccount(String(b.accountId || ''), old.currency);
      const date = parseDate(b.date, todayStr());
      await dbRun('BEGIN');
      const txId = await addTx({ date, accountId: acc.id, direction: old.direction, amount: b.amount == null ? old.amount : parseAmount(b.amount), category: old.category || (old.direction === 'in' ? 'Diğer gelir' : 'Diğer gider'),
        description: old.description || 'Planlı kalem', partyType: old.partyType, partyId: old.partyId, partyName: old.partyName, refType: 'planned', refId: old.id, by: who(req) });
      await dbRun(`UPDATE fin_transactions SET erpDocType = ?, erpDocNo = ? WHERE id = ?`, [old.erpDocType || 'PLN', old.erpDocNo || old.id, txId]);
      await dbRun(`UPDATE fin_planned SET status = 'realized', realizedTxId = ?, updatedAt = ? WHERE id = ?`, [txId, now, old.id]);
      await dbRun('COMMIT');
      return res.json({ success: true, message: 'Kalem gerçekleşti; hesaba işlendi.', data: { transactionId: txId } });
    }
    const p = await readPlannedBody(b, old);
    await dbRun(`UPDATE fin_planned SET date=?, direction=?, amount=?, currency=?, category=?, description=?, partyType=?, partyId=?, partyName=?, erpDocType=?, erpDocNo=?, status='planned', realizedTxId=NULL, updatedAt=? WHERE id=? AND tenantId=?`,
      [p.date, p.direction, p.amount, p.currency, p.category, p.description, p.partyType, p.partyId, p.partyName, p.erpDocType, p.erpDocNo, now, old.id, TENANT]);
    res.json({ success: true, message: 'Planlı kalem güncellendi.' });
  }));

  return { initSchema };
};
