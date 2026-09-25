/**
 * Finans modülü testi (KOPYA veritabanında çalıştırın; hesap, kredi, çek ve hareket bırakır).
 *   BASE=http://localhost:4900 CREDS=./ilk-sifreler.txt ADMIN_PASSWORD=1234 node finance-test.js
 */
const fs = require('fs');
const { buildSchedule } = require('./finance');
const BASE = (process.env.BASE || 'http://localhost:4000').replace(/\/$/, '') + '/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const CREDS = process.env.CREDS || './ilk-sifreler.txt';
let pass = 0; let fail = 0;
const ok = (n, c, x = '') => { if (c) pass++; else { fail++; console.log('  ✗', n, x); } };
async function call(method, path, body, token) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch (_e) { /* boş */ }
  return { status: r.status, body: j };
}
const login = async (u, p) => (await call('POST', '/auth/login', { username: u, password: p })).body;
const near = (a, b, e = 0.011) => Math.abs(a - b) <= e;
const tag = 'ZZF' + Date.now().toString().slice(-6);
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };

(async () => {
  // ---------- saf hesap: taksit planı ----------
  const ann = buildSchedule({ principal: 100000, rate: 36, termMonths: 12, firstDueDate: '2026-01-31', type: 'annuity' });
  ok('eşit taksit: 12 taksit, anapara toplamı = kredi', ann.length === 12 && near(ann.reduce((a, s) => a + s.principal, 0), 100000, 0.02));
  ok('eşit taksit: taksitler yaklaşık eşit (ilk 11)', ann.slice(0, 11).every((s) => near(s.amount, ann[0].amount, 0.05)), JSON.stringify(ann[0]));
  ok('eşit taksit: bilinen değer (100.000 ₺, %36, 12 ay ≈ 10.046,19)', near(ann[0].amount, 10046.19, 0.5), ann[0].amount);
  ok('vade günü ay sonuna oturur (31 Oca → 28 Şub)', ann[1].dueDate === '2026-02-28' && ann[2].dueDate === '2026-03-31', ann[1].dueDate + ' ' + ann[2].dueDate);
  const eq = buildSchedule({ principal: 12000, rate: 24, termMonths: 6, firstDueDate: '2026-03-10', type: 'equal_principal' });
  ok('eşit anapara: anapara 2000, faiz azalır', eq.every((s) => near(s.principal, 2000, 0.02)) && eq[0].interest > eq[5].interest);
  const zero = buildSchedule({ principal: 3000, rate: 0, termMonths: 3, firstDueDate: '2026-03-10' });
  ok('faizsiz kredi: 1000 × 3', zero.every((s) => near(s.amount, 1000, 0.02)));
  const withTax = buildSchedule({ principal: 10000, rate: 30, termMonths: 2, firstDueDate: '2026-03-10', taxRate: 15 });
  ok('faiz vergisi (BSMV+KKDF) taksite eklenir', near(withTax[0].tax, withTax[0].interest * 0.15, 0.02) && near(withTax[0].amount, withTax[0].principal + withTax[0].interest + withTax[0].tax, 0.02));
  let threw = false; try { buildSchedule({ principal: -1, termMonths: 3, firstDueDate: '2026-01-01' }); } catch (_e) { threw = true; }
  ok('geçersiz kredi bilgisi hata verir', threw);

  // ---------- oturumlar ve yetki ----------
  const A = (await login('admin', ADMIN_PASSWORD)).data.token;
  const pw = {};
  if (fs.existsSync(CREDS)) fs.readFileSync(CREDS, 'utf8').split('\n').forEach((l) => { const m = l.match(/^(\S+)\s+(\S+)\s+/); if (m) pw[m[1]] = m[2]; });
  const users = (await call('GET', '/jt/users', null, A)).body.data || [];
  const viewer = users.find((u) => u.role === 'viewer' && pw[u.username]);
  if (viewer) {
    const V = (await login(viewer.username, pw[viewer.username])).data.token;
    ok('görüntüleyici finansı okuyamaz (403)', (await call('GET', '/finance/summary', null, V)).status === 403);
    ok('görüntüleyici tahsilat yapamaz (403)', (await call('POST', '/finance/transactions', { type: 'in', accountId: 'x', amount: 1 }, V)).status === 403);
  } else console.log('  (görüntüleyici kullanıcı yok, yetki testi atlandı)');
  ok('oturumsuz istek reddedilir', (await call('GET', '/finance/summary')).status === 401);
  const roles = (await call('GET', '/jt/roles', null, A)).body.data;
  ok('finans rolü ve izinleri tanımlı', JSON.stringify(roles).includes('fin.manage') && JSON.stringify(roles).includes('Finans Sorumlusu'));

  // ---------- hesaplar ----------
  const bank = await call('POST', '/finance/accounts', { name: tag + ' Banka TL', type: 'bank', currency: 'TRY', openingBalance: 100000 }, A);
  const bank2 = await call('POST', '/finance/accounts', { name: tag + ' Kasa TL', type: 'cash', currency: 'TRY', openingBalance: 500 }, A);
  // demo verisinde zaten USD hesabı olabilir: özet karşılaştırması farka göre yapılır
  const usdBefore = (((await call('GET', '/finance/summary', null, A)).body.data || {}).cash || []).filter((c) => c.currency === 'USD').reduce((t, c) => t + c.total, 0);
  const usd = await call('POST', '/finance/accounts', { name: tag + ' Banka USD', type: 'bank', currency: 'USD', openingBalance: 1000 }, A);
  ok('hesaplar açıldı', bank.body.success && bank2.body.success && usd.body.success, JSON.stringify(bank.body));
  const B = bank.body.data.id, K = bank2.body.data.id, U = usd.body.data.id;
  ok('hatalı hesap adı reddedilir', (await call('POST', '/finance/accounts', { name: '  ' }, A)).status === 400);
  const balOf = async (id) => (await call('GET', '/finance/accounts', null, A)).body.data.find((a) => a.id === id).balance;
  ok('açılış bakiyesi', near(await balOf(B), 100000));

  // ---------- gelir / gider / virman / iptal ----------
  const inc = await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: 2500.5, category: 'Satış geliri', description: tag }, A);
  const exp = await call('POST', '/finance/transactions', { type: 'out', accountId: B, amount: 1000, category: 'Kira', description: tag }, A);
  ok('gelir + gider bakiyeyi günceller', inc.body.success && exp.body.success && near(await balOf(B), 101500.5));
  ok('sıfır / negatif / metin tutar reddedilir', (await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: 0 }, A)).status === 400
    && (await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: -5 }, A)).status === 400
    && (await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: 'abc' }, A)).status === 400);
  ok('geçersiz tarih reddedilir', (await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: 1, date: '2026-13-45' }, A)).status === 400);
  ok('farklı para birimine virman reddedilir', (await call('POST', '/finance/transactions', { type: 'transfer', accountId: B, toAccountId: U, amount: 10 }, A)).status === 400);
  const tr = await call('POST', '/finance/transactions', { type: 'transfer', accountId: B, toAccountId: K, amount: 1500.5 }, A);
  ok('virman iki hesabı da günceller, toplam değişmez', tr.body.success && near(await balOf(B), 100000) && near(await balOf(K), 2000.5));
  const list = (await call('GET', `/finance/transactions?accountId=${B}`, null, A)).body.data;
  const incTx = list.find((t) => t.amount === 2500.5);
  const voidR = await call('POST', `/finance/transactions/${incTx.id}/void`, {}, A);
  ok('hareket iptali bakiyeyi geri alır', voidR.body.success && near(await balOf(B), 97499.5));
  ok('iptal edilen tekrar iptal edilemez', (await call('POST', `/finance/transactions/${incTx.id}/void`, {}, A)).status === 404);
  const trTx = list.find((t) => t.refType === 'transfer');
  await call('POST', `/finance/transactions/${trTx.id}/void`, {}, A);
  ok('virman iptali her iki bacağı geri alır', near(await balOf(B), 99000) && near(await balOf(K), 500));

  // ---------- müşteri: ERP satışı → bakiye → tahsilat ----------
  const custs = (await call('GET', '/customers', null, A)).body.data;
  const prods = (await call('GET', '/products', null, A)).body.data;
  const whs = (await call('GET', '/warehouses', null, A)).body.data;
  const wbal = (await call('GET', '/warehouse-balances', null, A)).body.data;
  const stocked = wbal.find((b) => b.qty >= 5 && prods.some((p) => p.id === b.productId && p.price > 0));
  const wh = whs.find((w) => w.id === stocked.warehouseId) || whs[0];
  const cust = custs.find((c) => (c.currency || 'TL') === 'TL' || c.currency === 'TRY');
  const prod = prods.find((p) => p.id === stocked.productId);
  const c0 = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id);
  const sale = await call('POST', '/sales', { customerId: cust.id, warehouseId: wh.id, productId: prod.id, quantity: 2, type: 'toptan' }, A);
  const c1 = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id);
  ok('ERP satışı müşteri bakiyesini artırır ve finansta görünür', sale.body.success === true && near(c1.balance - c0.balance, prod.price * 2), `${c0.balance} → ${c1.balance}`);
  const st1 = (await call('GET', `/finance/customers/${cust.id}/statement`, null, A)).body.data;
  ok('ekstre: son satır bakiyesi müşteri bakiyesine eşit', near(st1.lines[st1.lines.length - 1].balance, c1.balance), `${st1.lines.length} satır`);
  ok('ekstre: bu satış görünür', st1.lines.some((l) => l.kind === 'sale' && near(l.debit, prod.price * 2)));
  const pay = await call('POST', `/finance/customers/${cust.id}/payment`, { amount: 1, accountId: B, note: tag }, A);
  const c2 = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id);
  ok('tahsilat bakiyeyi düşürür, hesabı artırır', pay.body.success && near(c1.balance - c2.balance, 1) && near(await balOf(B), 99001), JSON.stringify(pay.body));
  ok('tahsilat farklı para birimli hesaba reddedilir', (await call('POST', `/finance/customers/${cust.id}/payment`, { amount: 1, accountId: U }, A)).status === 400);
  ok('müşteri satış ekstresi tahsilatı gösterir', (await call('GET', `/finance/customers/${cust.id}/statement`, null, A)).body.data.lines.some((l) => l.kind === 'payment'));
  const payTx = (await call('GET', `/finance/transactions?partyType=customer&partyId=${cust.id}`, null, A)).body.data.find((t) => t.description === tag);
  await call('POST', `/finance/transactions/${payTx.id}/void`, {}, A);
  const c3 = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id);
  ok('tahsilat iptali müşteri bakiyesini geri yükler', near(c3.balance, c1.balance) && near(await balOf(B), 99000));
  ok('vade günü kaydedilir', (await call('PUT', `/finance/customers/${cust.id}/terms`, { paymentTerm: 45 }, A)).body.success
    && (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id).paymentTerm === 45);
  ok('geçersiz vade reddedilir', (await call('PUT', `/finance/customers/${cust.id}/terms`, { paymentTerm: -3 }, A)).status === 400);
  const aging = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id);
  ok('yaşlandırma kovaları bakiyeye eşit toplanır', near(Object.values(aging.aging).reduce((a, b) => a + b, 0), Math.max(0, aging.balance)), JSON.stringify(aging.aging));

  // ---------- tedarikçi: mal kabul → borç → ödeme ----------
  const sups = (await call('GET', '/suppliers', null, A)).body.data;
  const sup = sups.find((s) => (s.currency || 'TL') === 'TL' || s.currency === 'TRY') || sups[0];
  const supCur = (!sup.currency || sup.currency === 'TL') ? 'TRY' : sup.currency;
  const supAcc = supCur === 'TRY' ? B : null;
  if (sup && supAcc) {
    const before = (await call('GET', '/finance/suppliers', null, A)).body.data.find((s) => s.id === sup.id);
    const mk = await call('POST', '/purchase-orders', { supplierId: sup.id, supplierName: sup.name, orderDate: ymd(new Date()), expectedDate: ymd(new Date()), status: 'approved', currency: supCur, warehouseId: wh.id, warehouseName: wh.name, createdBy: 'test', notes: tag,
      lines: [{ id: 'L1', productCode: prod.code, productName: prod.name, unit: 'Adet', qty: 10, unitPrice: 100, taxRate: 20, discount: 0 }] }, A);
    const po = (await call('GET', '/purchase-orders', null, A)).body.data.find((o) => o.notes === tag);
    const rcv = await call('POST', `/purchase-orders/${po.id}/receive`, { invoiceNo: 'T-' + tag, receivedLines: [{ lineId: po.lines[0].id, qty: 10 }] }, A);
    const after = (await call('GET', '/finance/suppliers', null, A)).body.data.find((s) => s.id === sup.id);
    ok('mal kabul tedarikçi borcunu (KDV dahil) doğurur', mk.body.success && rcv.body.success !== false && near(after.balance - before.balance, 1200), `${before.balance} → ${after.balance}`);
    const item = after.open.find((o) => o.orderId === po.id);
    ok('açık kalem vadesi = kabul tarihi + ödeme vadesi', item && item.dueDate === inDays(after.paymentTerm) && near(item.amount, 1200), JSON.stringify(item));
    const overpay = await call('POST', `/finance/suppliers/${sup.id}/payment`, { amount: after.balance + 1000, accountId: supAcc }, A);
    ok('borçtan fazla ödeme reddedilir', overpay.status === 400, JSON.stringify(overpay.body));
    const sp = await call('POST', `/finance/suppliers/${sup.id}/payment`, { amount: 200, accountId: supAcc, note: tag }, A);
    const after2 = (await call('GET', '/finance/suppliers', null, A)).body.data.find((s) => s.id === sup.id);
    ok('tedarikçi ödemesi borcu düşürür, hesabı azaltır', sp.body.success && near(after.balance - after2.balance, 200) && near(await balOf(B), 98800));
    const sst = (await call('GET', `/finance/suppliers/${sup.id}/statement`, null, A)).body.data;
    ok('tedarikçi ekstresi son bakiyesi borca eşit', near(sst.lines[sst.lines.length - 1].balance, after2.balance));
  } else console.log('  (TRY tedarikçi yok, tedarikçi testi atlandı)');

  // ---------- krediler ----------
  const pre = await call('POST', '/finance/loans/preview', { name: 'x', principal: 60000, rate: 36, termMonths: 6, firstDueDate: inDays(5) }, A);
  ok('kredi önizleme: 6 taksit + toplam faiz', pre.body.success && pre.body.data.schedule.length === 6 && pre.body.data.totalInterest > 0);
  const ln = await call('POST', '/finance/loans', { name: tag + ' Taşıt Kredisi', lender: 'Test Bank', principal: 60000, rate: 36, taxRate: 0, termMonths: 6, startDate: ymd(new Date()), firstDueDate: inDays(3), accountId: B, currency: 'TRY' }, A);
  ok('kredi kaydedildi ve hesaba işlendi', ln.body.success && near(await balOf(B), 158800), JSON.stringify(ln.body));
  const lo = (await call('GET', `/finance/loans/${ln.body.data.id}`, null, A)).body.data;
  ok('6 taksit, ilk vade 3 gün sonra', lo.installments.length === 6 && lo.installments[0].daysLeft === 3);
  ok('kredi anapara toplamı = çekilen tutar', near(lo.installments.reduce((a, i) => a + i.principal, 0), 60000, 0.02));
  ok('geçersiz kredi (0 ay) reddedilir', (await call('POST', '/finance/loans', { name: 'k', principal: 100, termMonths: 0 }, A)).status === 400);
  const i1 = lo.installments[0];
  ok('taksit ödemesi para birimi uyuşmazlığında reddedilir', (await call('POST', `/finance/installments/${i1.id}/pay`, { accountId: U }, A)).status === 400);
  const part = await call('POST', `/finance/installments/${i1.id}/pay`, { accountId: B, amount: 1000 }, A);
  const lo2 = (await call('GET', `/finance/loans/${lo.id}`, null, A)).body.data;
  ok('kısmi taksit ödemesi: taksit bekler, kalan azalır', part.body.success && lo2.installments[0].status === 'pending' && near(lo2.installments[0].paidAmount, 1000));
  ok('kalandan fazla ödeme reddedilir', (await call('POST', `/finance/installments/${i1.id}/pay`, { accountId: B, amount: i1.amount }, A)).status === 400);
  const full = await call('POST', `/finance/installments/${i1.id}/pay`, { accountId: B, amount: +(i1.amount - 1000).toFixed(2) }, A);
  const lo3 = (await call('GET', `/finance/loans/${lo.id}`, null, A)).body.data;
  ok('kalan ödenince taksit kapanır', full.body.success && lo3.installments[0].status === 'paid' && lo3.paidCount === 1);
  ok('ödenen taksit tekrar ödenemez', (await call('POST', `/finance/installments/${i1.id}/pay`, { accountId: B }, A)).status === 400);
  ok('ödemesi olan kredi silinemez', (await call('DELETE', `/finance/loans/${lo.id}`, null, A)).status === 400);
  const instTx = (await call('GET', `/finance/transactions?partyType=loan&partyId=${lo.id}`, null, A)).body.data.filter((t) => t.refType === 'installment');
  for (const t of instTx) await call('POST', `/finance/transactions/${t.id}/void`, {}, A);
  const lo4 = (await call('GET', `/finance/loans/${lo.id}`, null, A)).body.data;
  ok('taksit ödemesi iptal edilince taksit yeniden açılır', lo4.installments[0].status === 'pending' && near(lo4.installments[0].paidAmount, 0) && lo4.paidCount === 0);
  const ln2 = await call('POST', '/finance/loans', { name: tag + ' Silinecek', principal: 5000, termMonths: 3, rate: 0, startDate: ymd(new Date()) }, A);
  ok('ödemesiz kredi silinebilir', (await call('DELETE', `/finance/loans/${ln2.body.data.id}`, null, A)).body.success);

  // ---------- çek / senet ----------
  const chIn = await call('POST', '/finance/cheques', { kind: 'receivable', number: tag + '-1', partyId: cust.id, amount: 5, dueDate: inDays(10), currency: 'TRY', bank: 'X Bank' }, A);
  const chOut = await call('POST', '/finance/cheques', { kind: 'payable', number: tag + '-2', partyName: 'Serbest Firma', amount: 700, dueDate: inDays(-2), currency: 'TRY' }, A);
  ok('çek/senet kaydedildi', chIn.body.success && chOut.body.success, JSON.stringify(chIn.body));
  ok('karşı tarafsız çek reddedilir', (await call('POST', '/finance/cheques', { kind: 'payable', amount: 1, dueDate: inDays(1) }, A)).status === 400);
  ok('müşteri para birimi uyuşmazlığı reddedilir', (await call('POST', '/finance/cheques', { kind: 'receivable', partyId: cust.id, amount: 1, dueDate: inDays(1), currency: 'USD' }, A)).status === 400);
  const cBefore = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id).balance;
  const setl = await call('POST', `/finance/cheques/${chIn.body.data.id}/settle`, { accountId: B }, A);
  const cAfter = (await call('GET', '/finance/customers', null, A)).body.data.find((c) => c.id === cust.id).balance;
  ok('müşteri çeki tahsil edilince bakiye düşer, hesap artar', setl.body.success && near(cBefore - cAfter, 5) && near(await balOf(B), 158805), JSON.stringify(setl.body));
  ok('sonuçlanan çek tekrar tahsil edilemez / silinemez', (await call('POST', `/finance/cheques/${chIn.body.data.id}/settle`, { accountId: B }, A)).status === 400 && (await call('DELETE', `/finance/cheques/${chIn.body.data.id}`, null, A)).status === 400);
  ok('çek durumu: karşılıksız işaretlenir', (await call('POST', `/finance/cheques/${chOut.body.data.id}/status`, { status: 'bounced' }, A)).body.success);
  const chOut2 = await call('POST', '/finance/cheques', { kind: 'payable', number: tag + '-3', partyName: 'Serbest Firma', amount: 300, dueDate: inDays(-1), currency: 'TRY' }, A);

  // ---------- özet, vade listesi, hatırlatma ----------
  const sum = (await call('GET', '/finance/summary', null, A)).body.data;
  ok('özet: para birimine göre nakit', sum.cash.some((c) => c.currency === 'TRY') && sum.cash.some((c) => c.currency === 'USD' && near(c.total - usdBefore, 1000)));
  ok('özet: yaklaşan taksit ve gecikmiş çek listede', sum.upcoming.some((u) => u.kind === 'installment' && u.title.includes(tag)) && sum.upcoming.some((u) => u.kind === 'cheque_out' && u.daysLeft < 0));
  ok('özet: gecikme sayacı', sum.overdueCount >= 1);
  ok('özet: alacak ve kredi bakiyesi', sum.receivables.length > 0 && sum.loans.some((l) => l.total >= 60000 - 0.5));
  const rem = (await call('GET', '/finance/reminders', null, A)).body.data;
  ok('hatırlatma: 3 gün kalan taksit ve gecikmiş çek', rem.items.some((i) => i.kind === 'installment' && i.daysLeft === 3) && rem.items.some((i) => i.kind === 'cheque_out' && i.daysLeft < 0));
  const run1 = await call('POST', '/finance/reminders/run', {}, A);
  const notes1 = (await call('GET', '/notifications', null, A)).body.data;
  ok('hatırlatma bildirimi yöneticiye düşer', run1.body.success && run1.body.data.sent > 0 && notes1.items.some((n) => n.type === 'finance' && /Ödeme vadesi/.test(n.title)), JSON.stringify(run1.body));
  const run2 = await call('POST', '/finance/reminders/run', {}, A);
  ok('aynı hatırlatma ikinci kez gönderilmez', run2.body.data.sent === 0, JSON.stringify(run2.body));
  ok('hatırlatma günleri kaydedilir', (await call('PUT', '/finance/settings', { remindDays: '14, 7,3,0' }, A)).body.success && (await call('GET', '/finance/meta', null, A)).body.data.remindDays === '14,7,3,0');
  ok('hatalı hatırlatma günü reddedilir', (await call('PUT', '/finance/settings', { remindDays: 'abc' }, A)).status === 400);
  const cf = (await call('GET', '/finance/cashflow?months=3', null, A)).body.data;
  ok('nakit akışı: 3 ay, gider kategorileri', cf.months.length === 3 && cf.months.some((m) => m.out > 0) && cf.expenseByCategory.length > 0);

  // ---------- işlem geçmişi + güvenlik ----------
  const act = (await call('GET', '/activity?limit=200', null, A)).body.data.items;
  ok('finans işlemleri Son İşlemler kaydına düşer', act.some((a) => a.type === 'finance'));
  const inj = await call('POST', '/finance/transactions', { type: 'in', accountId: B, amount: 1, description: `<img src=x onerror=alert(1)>'; DROP TABLE fin_accounts;--` }, A);
  ok('enjeksiyon dizgesi kaydedilir ama etkisizdir', inj.body.success && (await call('GET', '/finance/accounts', null, A)).body.data.length >= 3);
  const listAll = (await call('GET', `/finance/transactions?accountId=${B}&q=DROP`, null, A)).body.data;
  ok('kayıtta < > karakterleri temizlenir', listAll.length === 1 && !/[<>]/.test(listAll[0].description));
  await call('POST', `/finance/cheques/${chOut2.body.data.id}/status`, { status: 'cancelled' }, A);

  console.log(`\nFinans testi: ${pass} başarılı, ${fail} hatalı`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('TEST HATASI', e); process.exit(2); });
