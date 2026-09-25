const fs = require('fs');
const BASE = (process.env.BASE || 'http://localhost:4003') + '/api';
let ok = 0, bad = 0;
const t = (n, c, x = '') => { if (c) ok++; else { bad++; console.log('  ✗', n, x); } };
const pw = {};
fs.readFileSync('./ilk-sifreler.txt', 'utf8').split('\n').forEach((l) => { const m = l.match(/^(\S+)\s+(\S+)\s+/); if (m) pw[m[1]] = m[2]; });
const call = async (m, p, b, tk) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(tk ? { Authorization: 'Bearer ' + tk } : {}) }, body: b ? JSON.stringify(b) : undefined }); let j = {}; try { j = await r.json(); } catch (_e) { /* */ } return { s: r.status, j }; };
(async () => {
  t('inceleme şifresi rastgele (1234/inceleme123 değil)', pw.inceleme && !['1234', 'inceleme123'].includes(pw.inceleme) && pw.inceleme.length >= 12, pw.inceleme);
  const tk = (await call('POST', '/auth/login', { username: 'inceleme', password: pw.inceleme })).j.data.token;
  const A = (await call('POST', '/auth/login', { username: 'admin', password: '1234' })).j.data.token;
  for (const p of ['/products', '/customers', '/jt/dashboard', '/jt/jobs', '/activity?limit=5', '/finance/summary', '/finance/accounts', '/finance/loans', '/purchase-orders', '/warehouse-balances']) t('okuma serbest ' + p, (await call('GET', p, null, tk)).s === 200);
  const prods = (await call('GET', '/products', null, A)).j.data;
  const custs = (await call('GET', '/customers', null, A)).j.data;
  const wh = (await call('GET', '/warehouses', null, A)).j.data[0];
  const blocked = [
    ['satış', 'POST', '/sales', { customerId: custs[0].id, warehouseId: wh.id, productId: prods[0].id, quantity: 1, type: 'toptan' }],
    ['stok düzeltme', 'POST', '/stock-adjust', { productId: prods[0].id, warehouseId: wh.id, quantity: 5, reason: 'x' }],
    ['ürün silme', 'DELETE', '/products/' + prods[0].id + '?force=1'],
    ['tedarikçi kaydı', 'POST', '/suppliers', { name: 'x' }],
    ['finans gelir', 'POST', '/finance/transactions', { type: 'in', accountId: 'x', amount: 1 }],
    ['finans tahsilat', 'POST', '/finance/customers/' + custs[0].id + '/payment', { amount: 1, accountId: 'x' }],
    ['kredi silme', 'DELETE', '/finance/loans/LN-hz1'],
    ['iş oluşturma', 'POST', '/jt/jobs', { title: 'x' }],
    ['kullanıcı listesi', 'GET', '/jt/users'],
    ['kullanıcı ekleme', 'POST', '/jt/users', { username: 'x', name: 'x', role: 'admin', password: 'Abcdef123456' }],
    ['rol değiştirme', 'PUT', '/jt/roles/viewer', { permissions: ['erp.write'] }],
    ['barkod oluşturma', 'POST', '/barcodes', { name: 'x' }],
  ];
  for (const [n, m, p, b] of blocked) { const r = await call(m, p, b, tk); t('yazma/yönetim engelli: ' + n, r.s === 403, r.s + ' ' + JSON.stringify(r.j).slice(0, 80)); }
  const before = (await call('GET', '/products', null, A)).j.data.length;
  t('ürün sayısı değişmedi', before === prods.length);
  console.log(`\nİnceleme hesabı: ${ok} başarılı, ${bad} hatalı`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
