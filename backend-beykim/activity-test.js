/**
 * Son işlemler + bildirim uçlarının uçtan uca testi (kopya veritabanında çalıştırın; kayıt ve bildirim bırakır).
 *   BASE=http://localhost:4900 CREDS=./ilk-sifreler.txt ADMIN_PASSWORD=1234 node activity-test.js
 * Kullanıcıları /jt/users'tan keşfeder; şifreleri CREDS dosyasından okur.
 */
const fs = require('fs');
const BASE = (process.env.BASE || 'http://localhost:4000').replace(/\/$/, '') + '/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
const CREDS = process.env.CREDS || './ilk-sifreler.txt';

let pass = 0; let fail = 0;
const ok = (name, cond, extra = '') => { if (cond) pass++; else { fail++; console.log('  ✗', name, extra); } };
async function call(method, path, body, token) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch (_e) { /* boş */ }
  return { status: r.status, body: j };
}
const login = async (u, p) => (await call('POST', '/auth/login', { username: u, password: p })).body;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const adm = await login('admin', ADMIN_PASSWORD);
  if (!adm.success) { console.log('admin girişi başarısız'); process.exit(2); }
  const A = adm.data.token;

  // çalışan (operatör) kullanıcı bul
  const pw = {};
  fs.readFileSync(CREDS, 'utf8').split('\n').forEach((l) => { const m = l.match(/^(\S+)\s+(\S+)\s+/); if (m) pw[m[1]] = m[2]; });
  const users = (await call('GET', '/jt/users', null, A)).body.data;
  const worker = users.find((u) => u.role === 'operator' && pw[u.username]);
  ok('operatör kullanıcı bulundu', !!worker);
  const W = (await login(worker.username, pw[worker.username])).data.token;

  // ---- işlem kaydı: satış + stok düzeltme ----
  const whs = (await call('GET', '/warehouses', null, A)).body.data;
  const bal = (await call('GET', '/warehouse-balances', null, A)).body.data.find((b) => b.qty >= 5);
  const cust = (await call('GET', '/customers', null, A)).body.data[0];
  const sale = await call('POST', '/sales', { customerId: cust.id, warehouseId: bal.warehouseId, productId: bal.productId, quantity: 1, type: 'perakende', note: 'Ödeme yöntemi: Nakit' }, A);
  ok('satış yapılır', sale.body.success, JSON.stringify(sale.body));
  await call('POST', '/stock-adjust', { productId: bal.productId, warehouseId: bal.warehouseId, delta: 1 }, A);
  await wait(400);

  let act = (await call('GET', '/activity?limit=50', null, A)).body;
  ok('activity ucu çalışır', act.success && Array.isArray(act.data.items));
  const items = act.data.items;
  const s = items.find((i) => i.type === 'sale');
  ok('satış kaydı: kim + ne zaman + açıklama', s && s.userName && s.ts && /Müşteri:/.test(s.text) && /Nakit/.test(s.text), JSON.stringify(s));
  ok('stok düzeltme kaydı', items.some((i) => i.type === 'adjust'));
  ok('kategori alanı dolu', s && s.category === 'Sevkiyat'); // Beykim: satış kayıtları Sevkiyat kategorisindedir

  // ---- filtreler ----
  const byUser = (await call('GET', `/activity?userId=${adm.data.user.id}`, null, A)).body.data.items;
  ok('çalışana göre filtre', byUser.length > 0 && byUser.every((i) => i.userId === adm.data.user.id));
  const byCat = (await call('GET', '/activity?category=' + encodeURIComponent('Depo'), null, A)).body.data.items;
  ok('kategoriye göre filtre', byCat.length > 0 && byCat.every((i) => i.category === 'Depo'));
  const today = new Date().toISOString().slice(0, 10);
  const todayItems = (await call('GET', `/activity?from=${today}&to=${today}`, null, A)).body.data.items;
  ok('bugün filtresi kayıt döndürür', todayItems.length >= 2);
  const old = (await call('GET', '/activity?from=2000-01-01&to=2000-01-02', null, A)).body.data.items;
  ok('eski dönem boş döner', old.length === 0);
  const qhit = (await call('GET', '/activity?q=' + encodeURIComponent('Nakit'), null, A)).body.data.items;
  ok('metin araması', qhit.length > 0 && qhit.every((i) => /nakit/i.test(i.text + i.refLabel + i.userName)));
  ok('SQL enjeksiyonu etkisiz', (await call('GET', '/activity?q=' + encodeURIComponent("' OR 1=1 --"), null, A)).status === 200);
  ok('kullanıcı listesi döner', act.data.users.some((u) => u.id === adm.data.user.id));
  ok('yetkisiz istek reddedilir', (await call('GET', '/activity')).status === 401);

  // ---- iş atama → bildirim ----
  const before = (await call('GET', '/notifications', null, W)).body.data;
  const jobs = (await call('GET', '/jt/jobs?status=planned', null, A)).body.data || [];
  const job = jobs.find((j) => j.assigneeId !== worker.id && j.status !== 'done') || (await call('GET', '/jt/jobs', null, A)).body.data.find((j) => j.assigneeId !== worker.id && !['done', 'cancelled'].includes(j.status));
  // Beykim'de İş Takip modülü kapalıdır (iş kaydı yok): iş atama / bildirim bölümü yalnız iş varsa denenir
  if (!job) console.log('  - İş takip kaydı yok (modül bu kurulumda kapalı): iş atama bildirimi testleri atlandı');
  if (job) {
  const asg = await call('POST', `/jt/jobs/${job.id}/assign`, { userId: worker.id }, A);
  ok('iş atanır', asg.body.success, JSON.stringify(asg.body));
  await wait(400);
  const after = (await call('GET', '/notifications', null, W)).body.data;
  ok('atanan kişiye bildirim düşer', after.unread === before.unread + 1, `${before.unread} -> ${after.unread}`);
  const n = after.items[0];
  ok('bildirim içeriği', n && /atandı|Yeni iş/.test(n.title) && n.title.includes(job.jobNo) && n.link.startsWith('jobs'), JSON.stringify(n));
  const adminSees = (await call('GET', '/notifications', null, A)).body.data;
  ok('başkası bu bildirimi görmez', !adminSees.items.some((i) => i.id === n.id));
  const act2 = (await call('GET', '/activity?category=' + encodeURIComponent('İş Takip'), null, A)).body.data.items;
  ok('iş atama işlem kaydı', act2.some((i) => i.type === 'jobAssign' && i.refLabel === job.jobNo && /atandı/.test(i.text)));

  // okundu işaretleme: başkası okuyamaz, sahibi okur
  const other = await call('POST', '/notifications/read', { id: n.id }, A);
  const stillUnread = (await call('GET', '/notifications', null, W)).body.data.unread;
  ok('başkası bildirimi okundu yapamaz', other.body.success && stillUnread === after.unread);
  await call('POST', '/notifications/read', { id: n.id }, W);
  ok('sahibi okundu yapar', (await call('GET', '/notifications', null, W)).body.data.unread === after.unread - 1);
  await call('POST', '/notifications/read', {}, W);
  ok('tümünü okundu yap', (await call('GET', '/notifications', null, W)).body.data.unread === 0);

  // aynı kişiye tekrar atama: kendine atayan bildirim almaz
  const self = await call('POST', `/jt/jobs/${job.id}/assign`, { userId: adm.data.user.id }, A);
  await wait(300);
  const adminN = (await call('GET', '/notifications', null, A)).body.data.unread;
  ok('kendine atama bildirim üretmez', self.body.success && adminN === adminSees.unread, `${adminSees.unread} -> ${adminN}`);
  }

  // başarısız istek kayıt üretmez
  const cnt = (await call('GET', '/activity?limit=5000', null, A)).body.data.items.length;
  await call('POST', '/stock-adjust', { productId: bal.productId, warehouseId: bal.warehouseId, delta: -999999 }, A);
  await wait(300);
  ok('reddedilen istek kaydedilmez', (await call('GET', '/activity?limit=5000', null, A)).body.data.items.length === cnt);

  console.log(`\nSonuç: ${pass} başarılı, ${fail} başarısız.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
