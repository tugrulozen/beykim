// Bağımsız finans arayüzü uçları: takvim, nakit akışı tablosu, planlı kalemler, tenant ayrımı
const BASE = (process.env.BASE || 'http://localhost:4003') + '/api';
const TENANT = process.env.TENANT_ID || 'beykim';
let ok = 0, bad = 0;
const t = (n, c, x = '') => { if (c) ok++; else { bad++; console.log('  ✗', n, x); } };
const call = async (m, p, b, tk, hdr = {}) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': TENANT, ...(tk ? { Authorization: 'Bearer ' + tk } : {}), ...hdr }, body: b ? JSON.stringify(b) : undefined });
  let j = {}; try { j = await r.json(); } catch (_e) { /* */ } return { s: r.status, j };
};
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
(async () => {
  const login = await call('POST', '/auth/login', { username: 'admin', password: process.env.ADMIN_PW || '1234' });
  const A = login.j.data.token;
  const tid = JSON.parse(Buffer.from(A.split('.')[1], 'base64url').toString()).tid;
  if (tid) { // TENANT_ID tanımlı sunucu (Horizon); ortak sunucuda tenant denetimi kapalıdır
  t('jeton tenant kimliği taşır', tid === TENANT);
  t('yanlış X-Tenant-Id reddedilir', (await call('GET', '/finance/calendar', null, A, { 'X-Tenant-Id': 'baska-firma' })).s === 403);
  t('yanlış tenant ile giriş de reddedilir', (await call('POST', '/auth/login', { username: 'admin', password: '1234' }, null, { 'X-Tenant-Id': 'baska-firma' })).s === 403);
  } else console.log('  (tenant denetimi kapalı: TENANT_ID tanımsız)');

  const cal = await call('GET', `/finance/calendar?from=${day(-20)}&to=${day(40)}`, null, A);
  t('takvim 200', cal.s === 200, JSON.stringify(cal.j).slice(0, 120));
  const ev = cal.j.data.events;
  t('takvimde kredi taksiti var', ev.some((e) => e.type === 'loan'));
  t('takvimde müşteri alacağı var', ev.some((e) => e.type === 'receivable') || !(await call('GET', '/finance/receivables', null, A)).j.data.some((r) => r.dueDate <= day(40)));
  t('gecikmiş kredi/alacak ayrışır', ev.some((e) => e.status === 'overdue'));
  t('her olayda ERP referansı ve hedef var', ev.every((e) => e.erpRef && e.erpRef.docType && e.erpRef.docNo && e.target && e.target.route && e.party));
  t('alacak fatura referansı SF', ev.filter((e) => e.type === 'receivable' && e.erpRef.docType !== 'DEVIR').every((e) => e.erpRef.docType === 'SF'));
  t('tür filtresi', (await call('GET', `/finance/calendar?from=${day(-20)}&to=${day(40)}&types=loan`, null, A)).j.data.events.every((e) => e.type === 'loan'));
  t('ters tarih aralığı 400', (await call('GET', `/finance/calendar?from=${day(5)}&to=${day(1)}`, null, A)).s === 400);

  const cf = await call('GET', `/finance/cashflow/table?from=${day(-30)}&to=${day(45)}`, null, A);
  t('nakit akışı 200', cf.s === 200, JSON.stringify(cf.j).slice(0, 120));
  const d = cf.j.data;
  t('gerçekleşen + tahmin satırları', d.rows.some((r) => r.kind === 'actual') && d.rows.some((r) => r.kind === 'forecast'));
  const last = d.rows[d.rows.length - 1];
  t('yürüyen bakiye = açılış + giriş - çıkış', Math.abs(d.opening + d.totals.in - d.totals.out - last.balance) < 0.05);
  t('haftalık gruplama', (await call('GET', `/finance/cashflow/table?from=${day(-30)}&to=${day(45)}&groupBy=week`, null, A)).j.data.periods.every((p) => new Date(p.key + 'T00:00:00Z').getUTCDay() === 1));
  t('yön filtresi', (await call('GET', `/finance/cashflow/table?direction=in`, null, A)).j.data.rows.every((r) => r.direction === 'in'));
  t('yalnız gerçekleşen', (await call('GET', `/finance/cashflow/table?kind=actual`, null, A)).j.data.rows.every((r) => r.kind === 'actual'));

  const cust = (await call('GET', '/customers', null, A)).j.data[0];
  const pl = await call('POST', '/finance/planned', { date: day(10), direction: 'in', amount: 12500, currency: 'TRY', category: 'Diğer gelir', description: 'Test planlı', partyType: 'customer', partyId: cust.id, erpDocType: 'SF', erpDocNo: 'SF-TEST-1' }, A);
  t('planlı kalem eklendi (201)', pl.s === 201, JSON.stringify(pl.j));
  const id = pl.j.data.id;
  t('bilinmeyen cari reddedilir', (await call('POST', '/finance/planned', { amount: 5, partyType: 'customer', partyId: 'yok-boyle-biri' }, A)).s === 404);
  t('planlı kalem takvimde', (await call('GET', `/finance/calendar?from=${day(0)}&to=${day(20)}&types=planned`, null, A)).j.data.events.some((e) => e.id === 'PL:' + id && e.target.route === 'cashflow'));
  t('planlı kalem güncellenir', (await call('PUT', '/finance/planned/' + id, { amount: 13000 }, A)).s === 200);
  const acc = (await call('GET', '/finance/accounts', null, A)).j.data.find((a) => a.currency === 'TRY' && a.active);
  const before = acc.balance;
  const rz = await call('PUT', '/finance/planned/' + id, { status: 'realized', accountId: acc.id }, A);
  t('gerçekleştir → hareket yazıldı', rz.s === 200 && rz.j.data.transactionId, JSON.stringify(rz.j));
  const after = (await call('GET', '/finance/accounts', null, A)).j.data.find((a) => a.id === acc.id).balance;
  t('hesap bakiyesi arttı', Math.abs(after - before - 13000) < 0.01, `${before} → ${after}`);
  t('gerçekleşen kalem değiştirilemez', (await call('PUT', '/finance/planned/' + id, { amount: 1 }, A)).s === 400);
  await call('POST', `/finance/transactions/${rz.j.data.transactionId}/void`, {}, A);
  t('hareket iptalinde kalem yeniden planlı', (await call('GET', '/finance/planned', null, A)).j.data.find((p) => p.id === id).status === 'planned');

  const rv = (await call('GET', '/finance/receivables', null, A)).j.data;
  t('açık alacaklar listesi', Array.isArray(rv) && rv.length > 0 && rv.every((r) => r.customerId && r.erpRef));

  const pw = {}; try { require('fs').readFileSync('./ilk-sifreler.txt', 'utf8').split('\n').forEach((l) => { const m = l.match(/^(\S+)\s+(\S+)\s+/); if (m) pw[m[1]] = m[2]; }); } catch (_e) { /* */ }
  if (pw.inceleme) {
    const R = (await call('POST', '/auth/login', { username: 'inceleme', password: pw.inceleme })).j.data.token;
    t('inceleme hesabı takvimi görür', (await call('GET', '/finance/calendar', null, R)).s === 200);
    t('inceleme hesabı planlı kalem ekleyemez', (await call('POST', '/finance/planned', { amount: 5 }, R)).s === 403);
  }
  console.log(`\nFinans merkezi: ${ok} başarılı, ${bad} hatalı`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
