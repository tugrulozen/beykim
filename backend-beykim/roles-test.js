/**
 * BEYKİM — rol ve yetki testi (Finans › Yetkiler ekranı ve uç yetkileri)
 * İş Takip modülü Beykim'de kapalıdır; bu test jobtracking-test.js yerine Beykim rollerini doğrular.
 * Kullanım (veritabanının KOPYASI üzerinde çalıştırın; test kullanıcı ve kayıt oluşturur):
 *   BASE=http://localhost:4103 TENANT_ID=beykim CREDS=./ilk-sifreler.txt ADMIN_PASSWORD=1234 node roles-test.js
 */
const fs = require('fs');
const BASE = (process.env.BASE || 'http://localhost:4003').replace(/\/$/, '') + '/api';
const TENANT = process.env.TENANT_ID || 'beykim';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const creds = Object.fromEntries(fs.readFileSync(process.env.CREDS || './ilk-sifreler.txt', 'utf8').split(/\r?\n/)
  .map((l) => l.trim().split(/\s+/)).filter((p) => p.length >= 2 && /^[a-z0-9._]+$/.test(p[0])).map((p) => [p[0], p[1]]));
let pass = 0, fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log('  ✔', n); } else { fail++; console.log('  ✘', n, x); } };
const call = async (m, p, tok, b) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': TENANT, ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: b ? JSON.stringify(b) : undefined });
  let j = {}; try { j = await r.json(); } catch (_e) { /* */ } return { s: r.status, d: j.data, j };
};
const login = async (u, p) => (await call('POST', '/auth/login', null, { username: u, password: p })).d?.token;

(async () => {
  const A = await login('admin', ADMIN_PASSWORD);
  ok('yönetici girişi', !!A);
  const T = {};
  for (const u of ['deniz.aydin', 'murat.ozkan', 'selin.kurt', 'hakan.yildiz', 'ali.demir', 'serkan.bulut', 'canan.ergin', 'orhan.tekin']) T[u] = await login(u, creds[u]);
  ok('örnek kullanıcılar giriş yapar', Object.values(T).every(Boolean), JSON.stringify(Object.keys(T).filter((k) => !T[k])));

  console.log('\n1) Roller ve yetki listesi');
  const r = await call('GET', '/jt/roles', A);
  const roles = r.d?.roles || []; const perms = r.d?.permissions || [];
  const label = Object.fromEntries(roles.map((x) => [x.id, x.label]));
  ok('rol adları denizcilik operasyonuna göre', label.manager === 'Teknik / Operasyon Müdürü' && label.operator === 'Ambar Memuru' && label.logistics === 'Gemi İkmal & Sevkiyat' && label.supervisor === 'Depo Şefi', JSON.stringify(label));
  ok('eski üretim / proje rol adları kalmadı', !roles.some((x) => /Üretim|Proje Yöneticisi|Operatör$/.test(x.label)));
  ok('iş takip yetkileri ekranda gösterilmez', !perms.some((p) => /^jt\.(projects|orders|jobs|performance|alerts)/.test(p.id)), JSON.stringify(perms.map((p) => p.id)));
  ok('depo ve finans yetkileri açıklamalı', ['erp.read', 'erp.write', 'erp.stock', 'fin.view', 'fin.manage', 'jt.users.manage'].every((id) => perms.some((p) => p.id === id && p.label.length > 10)));
  ok('açıklamalarda üretim terimi yok', !perms.some((p) => /üretim/i.test(p.label)) && !roles.some((x) => /üretim/i.test(x.description || '')));

  console.log('\n2) Uç yetkileri');
  const vessel = 'GM01';
  const wb = (await call('GET', '/warehouse-balances', A)).d.find((b) => b.qty > 2);
  ok('görüntüleyici stok görür', (await call('GET', '/products', T['orhan.tekin'])).s === 200);
  ok('görüntüleyici sevkiyat yapamaz (403)', (await call('POST', '/sales', T['orhan.tekin'], { customerId: vessel, warehouseId: wb.warehouseId, productId: wb.productId, quantity: 1, type: 'sevkiyat' })).s === 403);
  ok('ambar memuru sevkiyat yapamaz (403)', (await call('POST', '/sales', T['ali.demir'], { customerId: vessel, warehouseId: wb.warehouseId, productId: wb.productId, quantity: 1, type: 'sevkiyat' })).s === 403);
  const ship = await call('POST', '/sales', T['serkan.bulut'], { customerId: vessel, warehouseId: wb.warehouseId, productId: wb.productId, quantity: 1, type: 'sevkiyat', note: 'Gemi talep no: TEST' });
  ok('sevkiyat sorumlusu gemiye sevkiyat yapar', ship.j.success && /Sevkiyat kaydedildi/.test(ship.j.message || ''), JSON.stringify(ship.j));
  ok('gemiye sevkiyat cari bakiye oluşturmaz', (await call('GET', '/customers', A)).d.find((c) => c.id === vessel).balance === 0);
  ok('ambar memuru stok düzeltir', (await call('POST', '/stock-adjust', T['ali.demir'], { productId: wb.productId, warehouseId: wb.warehouseId, delta: 1, reason: 'test' })).j.success === true);
  ok('satın alma sorumlusu stok düzeltemez (403)', (await call('POST', '/stock-adjust', T['selin.kurt'], { productId: wb.productId, warehouseId: wb.warehouseId, delta: 1 })).s === 403);
  const sup = (await call('GET', '/suppliers', A)).d[0];
  const po = await call('POST', '/purchase-orders', T['selin.kurt'], { supplierId: sup.id, supplierName: sup.name, orderDate: '2026-09-25', expectedDate: '2026-10-05', warehouseId: '1011', warehouseName: 'Tuzla Yedek Parça Ambarı', currency: sup.currency, status: 'draft', vesselId: vessel, requisitionNo: 'RQ-ALT-TEST-1', port: 'Tuzla', urgency: 'urgent', lines: [{ id: 'L1', productCode: 'BYK-FLT-SEP', productName: 'Yakıt Separatörü Filtre Elemanı', unit: 'Adet', qty: 4, unitPrice: 2000, taxRate: 20, discount: 0 }] });
  ok('satın alma sorumlusu gemi talepli sipariş açar', po.j.success && po.d?.id, JSON.stringify(po.j));
  const pod = (await call('GET', `/purchase-orders/${po.d.id}`, A)).d;
  ok('sipariş gemi, talep no, liman ve aciliyetle kaydedilir', pod.vesselName === 'M/T ALATEPE' && pod.requisitionNo === 'RQ-ALT-TEST-1' && pod.port === 'Tuzla' && pod.urgency === 'urgent', JSON.stringify(pod));
  ok('HSEQ satın alma siparişi açamaz (403)', (await call('POST', '/purchase-orders', T['canan.ergin'], { supplierId: sup.id, lines: [{ qty: 1, unitPrice: 1 }] })).s === 403);
  ok('finans sorumlusu finansı görür', (await call('GET', '/finance/summary', T['deniz.aydin'])).s === 200);
  ok('depo şefi finansı göremez (403)', (await call('GET', '/finance/summary', T['hakan.yildiz'])).s === 403);
  ok('teknik müdür kullanıcı yönetemez (403)', (await call('GET', '/jt/users', T['murat.ozkan'])).s === 403);

  console.log('\n3) Kullanıcı ve rol yönetimi');
  const nu = await call('POST', '/jt/users', A, { username: `test.ambar${Date.now() % 100000}`, name: 'Test Ambar', role: 'operator', title: 'Ambar Memuru' });
  ok('yönetici ambar memuru ekler', nu.j.success && !!nu.d?.temporaryPassword, JSON.stringify(nu.j));
  const tu = await login(nu.d.username, nu.d.temporaryPassword);
  ok('yeni kullanıcı geçici şifreyle girer', !!tu);
  ok('yeni ambar memuru finansı göremez (403)', (await call('GET', '/finance/summary', tu)).s === 403);
  const op = roles.find((x) => x.id === 'quality');
  const upd = await call('PUT', '/jt/roles/quality', A, { permissions: [...op.permissions, 'erp.stock'] });
  ok('rol yetkisi güncellenir (HSEQ → ambar işlemleri)', upd.j.success, JSON.stringify(upd.j));
  const T2 = await login('canan.ergin', creds['canan.ergin']);
  ok('güncel yetki yeni oturumda geçerli', (await call('POST', '/stock-adjust', T2, { productId: wb.productId, warehouseId: wb.warehouseId, delta: -1, reason: 'test' })).j.success === true);
  await call('PUT', '/jt/roles/quality', A, { permissions: op.permissions });
  ok('yönetici rolü değiştirilemez', (await call('PUT', '/jt/roles/admin', A, { permissions: ['jt.view'] })).s >= 400);

  console.log(`\nSonuç: ${pass} başarılı, ${fail} başarısız`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('Test hatası:', e); process.exit(2); });
