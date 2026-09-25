/**
 * Backend güvenlik testi
 *
 *   node security-test.js                    (varsayılan: http://localhost:4001)
 *   BASE=http://localhost:4100 node security-test.js
 *   ADMIN_PASSWORD=... node security-test.js   (admin şifresi varsayılan değilse)
 *
 * Testler veriyi değiştirmez (yalnızca reddedilmesi gereken istekler ve geçici bir tedarikçi kaydı yapılır).
 * Not: kaba kuvvet testi bu makinenin IP'sini kısa süre kilitler ("lockout-test" kullanıcısıyla, admin etkilenmez).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = (process.env.BASE || 'http://localhost:4001').replace(/\/$/, '');
const API = BASE + '/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';
let pass = 0, fail = 0;
const failures = [];

function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  ✔ ${name}`); }
  else { fail++; failures.push(name); console.log(`  ✘ ${name}${detail ? '  → ' + detail : ''}`); }
}
async function call(method, url, { token, body, headers = {}, raw } = {}) {
  const h = { ...headers };
  if (body !== undefined && !raw) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  const res = await fetch(url.startsWith('http') ? url : API + url, { method, headers: h, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch (_e) { /* json değil */ }
  return { status: res.status, headers: res.headers, text, json };
}
const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

(async () => {
  console.log(`\nHedef: ${BASE}\n`);

  // ---------- 1. Kimlik doğrulama zorunluluğu ----------
  console.log('1) Kimlik doğrulama');
  const endpoints = ['/products', '/customers', '/warehouses', '/branches', '/raw-materials', '/recipes', '/suppliers', '/purchase-orders',
    '/dashboard/stats', '/warehouse-balances', '/shipments', '/serials/8691234560012', '/purchase-reports/summary'];
  for (const e of endpoints) {
    const r = await call('GET', e);
    check(`GET ${e} jetonsuz reddedilir (401)`, r.status === 401, `durum ${r.status}`);
  }
  for (const [m, e, b] of [['POST', '/sales', { customerId: 'C001', productId: 'ITM001', quantity: 1 }], ['POST', '/production', { productId: 'ITM001', quantity: 1 }],
    ['POST', '/transfers', { barcodes: ['1'] }], ['POST', '/copilot/chat', { message: 'stok' }], ['POST', '/suppliers', { name: 'x' }], ['PUT', '/suppliers/SUP001', { name: 'x' }]]) {
    const r = await call(m, e, { body: b });
    check(`${m} ${e} jetonsuz reddedilir (401)`, r.status === 401, `durum ${r.status}`);
  }
  check('Eski sabit jeton ("mock-token-xyz") geçmez', (await call('GET', '/products', { token: 'mock-token-xyz' })).status === 401);
  check('Sahte imzalı jeton geçmez', (await call('GET', '/products', { token: `v1.${b64u({ uid: 1, exp: Date.now() + 1e9 })}.${crypto.randomBytes(32).toString('base64url')}` })).status === 401);
  check('"alg:none" tarzı jeton geçmez', (await call('GET', '/products', { token: `${b64u({ alg: 'none' })}.${b64u({ uid: 1, role: 'admin' })}.` })).status === 401);

  // ---------- 2. Giriş ----------
  console.log('\n2) Giriş güvenliği');
  const bad = await call('POST', '/auth/login', { body: { username: 'admin', password: 'yanlis-sifre' } });
  check('Yanlış şifre 401 döner', bad.status === 401);
  const sqli = await call('POST', '/auth/login', { body: { username: "admin' OR '1'='1", password: "' OR '1'='1" } });
  check('SQL enjeksiyonlu giriş reddedilir', sqli.status === 401 && !(sqli.json && sqli.json.data));
  const nojson = await call('POST', '/auth/login', { body: { username: { $ne: null }, password: { $ne: null } } });
  check('Nesne biçiminde (NoSQL tarzı) kimlik bilgisi reddedilir', nojson.status === 401);
  const login = await call('POST', '/auth/login', { body: { username: 'admin', password: ADMIN_PASSWORD } });
  const token = login.json && login.json.data && login.json.data.token;
  check('Doğru bilgilerle giriş yapılır', !!token, `durum ${login.status} (ADMIN_PASSWORD doğru mu?)`);
  check('Jeton sabit değil, imzalı biçimde', !!token && token !== 'mock-token-xyz' && token.startsWith('v1.') && token.split('.').length === 3);
  check('Yanıtta şifre / özeti bulunmaz', login.text && !/"password"|scrypt/i.test(login.text));
  if (!token) { console.log('\nGiriş yapılamadığı için kalan testler atlandı.'); return finish(); }

  const ok = await call('GET', '/products', { token });
  check('Geçerli jetonla veri okunur', ok.status === 200 && ok.json && ok.json.success);
  const tampered = token.slice(0, -3) + (token.endsWith('AAA') ? 'BBB' : 'AAA');
  check('İmzası değiştirilmiş jeton reddedilir', (await call('GET', '/products', { token: tampered })).status === 401);
  const [v, body] = token.split('.');
  const forgedBody = b64u({ ...JSON.parse(Buffer.from(body, 'base64url').toString()), role: 'root', exp: Date.now() + 1e10 });
  check('İçeriği değiştirilmiş jeton reddedilir', (await call('GET', '/products', { token: `${v}.${forgedBody}.${token.split('.')[2]}` })).status === 401);

  // ---------- 3. Girdi doğrulama ----------
  console.log('\n3) Girdi doğrulama');
  const prods = (await call('GET', '/products', { token })).json.data;
  const p0 = prods[0];
  const badQty = [-5, 0, 'abc', null, 1.5, 1e12, '1; DROP TABLE products'];
  for (const q of badQty) {
    const r = await call('POST', '/sales', { token, body: { customerId: 'C001', warehouseId: '1012', productId: p0.id, quantity: q, type: 'toptan' } });
    check(`Satış miktarı ${JSON.stringify(q)} reddedilir`, r.status === 400, `durum ${r.status}`);
  }
  check('Negatif üretim miktarı reddedilir', (await call('POST', '/production', { token, body: { productId: 'ITM001', quantity: -3 } })).status === 400);
  check('Boş / dev barkod listesi reddedilir', (await call('POST', '/transfers', { token, body: { barcodes: Array(3000).fill('1') } })).status === 400);
  check('Barkod dizisi yerine nesne reddedilir', (await call('POST', '/vehicle-unload', { token, body: { barcodes: { length: 1 } } })).status === 400);
  check('Negatif mal kabul miktarı stok düşürmez', await (async () => {
    const before = (await call('GET', '/raw-materials', { token })).json.data.map((x) => x.stock).join();
    await call('POST', '/purchase-orders/PO-0000-000/receive', { token, body: { receivedLines: [{ lineId: 'x', qty: -1000 }] } });
    return before === (await call('GET', '/raw-materials', { token })).json.data.map((x) => x.stock).join();
  })());
  const stockAfter = (await call('GET', '/products', { token })).json.data.find((x) => x.id === p0.id).stock;
  check('Reddedilen satışlar stoğu değiştirmedi', stockAfter === p0.stock, `${p0.stock} → ${stockAfter}`);

  // ---------- 4. XSS ----------
  console.log('\n4) Enjeksiyon / XSS');
  const payload = '<img src=x onerror=alert(1)>Test';
  const sup = await call('POST', '/suppliers', { token, body: { name: payload, category: '<script>alert(1)</script>' } });
  check('HTML içeren tedarikçi kaydı işlenir ama işaretler temizlenir', sup.status === 200);
  const list = (await call('GET', '/suppliers', { token })).text;
  check('Kayıtlı veride "<" / ">" karakteri kalmaz', !/<img|<script/i.test(list));
  const chat = await call('POST', '/copilot/chat', { token, body: { message: 'satın alma tedarikçi', company: '<b onmouseover=1>X</b>' } });
  check('CoPilot yanıtında etkin HTML/betik yok', chat.status === 200 && !/<img|<script|<[^>]*on\w+\s*=/i.test(chat.text));
  const hello = await call('POST', '/copilot/chat', { token, body: { message: 'merhaba', company: '"><script>alert(1)</script>' } });
  check('Şirket adı alanından betik enjekte edilemez', !/<script/i.test(hello.text));
  // Temizlik: test tedarikçisini pasife al
  const all = (await call('GET', '/suppliers', { token })).json.data || [];
  const mine = all.filter((s) => /Test$/.test(s.name || ''));
  for (const s of mine) await call('PUT', `/suppliers/${s.id}`, { token, body: { ...s, status: 'passive' } });

  // ---------- 5. Hata ve başlıklar ----------
  console.log('\n5) Başlıklar, hatalar, sınırlar');
  const malformed = await call('POST', '/auth/login', { raw: '{"username": ', headers: { 'Content-Type': 'application/json' } });
  check('Bozuk JSON 400 döner, yığın izi sızmaz', malformed.status === 400 && !/at |node_modules|Error:/.test(malformed.text), malformed.text.slice(0, 80));
  const big = await call('POST', '/sales', { token, raw: JSON.stringify({ x: 'a'.repeat(2 * 1024 * 1024) }), headers: { 'Content-Type': 'application/json' } });
  check('2 MB gövde reddedilir (413/400)', big.status === 413 || big.status === 400, `durum ${big.status}`);
  const nf = await call('GET', '/olmayan-uc', { token });
  check('Bilinmeyen uç 404 (ayrıntı yok)', nf.status === 404 && !/Cannot GET|<pre>/.test(nf.text));
  const hd = ok.headers;
  check('X-Powered-By yok', !hd.get('x-powered-by'));
  check('X-Content-Type-Options: nosniff', hd.get('x-content-type-options') === 'nosniff');
  check('Referrer-Policy: no-referrer', hd.get('referrer-policy') === 'no-referrer');
  check('Cache-Control: no-store', /no-store/.test(hd.get('cache-control') || ''));
  check('X-Frame-Options: DENY', hd.get('x-frame-options') === 'DENY');
  const evil = await call('GET', '/products', { token, headers: { Origin: 'https://evil.example.com' } });
  check('Yabancı kaynak (evil.example.com) CORS izni almaz', !evil.headers.get('access-control-allow-origin'));
  const good = await call('GET', '/products', { token, headers: { Origin: 'https://codendtec.com' } });
  check('Kendi alan adı (codendtec.com) CORS izni alır', good.headers.get('access-control-allow-origin') === 'https://codendtec.com');
  const pre = await call('OPTIONS', '/products', { headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'GET' } });
  check('Yabancı kaynağa preflight izni verilmez', !pre.headers.get('access-control-allow-origin'));

  // ---------- 6. Önizleme anahtarı (yönetim paneli) ----------
  console.log('\n6) Yönetim paneli önizleme anahtarı');
  const secretFile = process.env.SECRET_FILE || path.join(__dirname, '.auth-secret');
  if (fs.existsSync(secretFile)) {
    const key = crypto.createHmac('sha256', fs.readFileSync(secretFile, 'utf8').trim()).update('panel-preview').digest('base64url');
    check('Önizleme anahtarıyla GET okunabilir', (await call('GET', '/dashboard/stats', { headers: { 'x-preview-key': key } })).status === 200);
    check('Önizleme anahtarıyla POST YAPILAMAZ', (await call('POST', '/production', { headers: { 'x-preview-key': key }, body: { productId: 'ITM001', quantity: 1 } })).status === 401);
    check('Yanlış önizleme anahtarı reddedilir', (await call('GET', '/dashboard/stats', { headers: { 'x-preview-key': 'x'.repeat(43) } })).status === 401);
  } else console.log('  (gizli anahtar dosyası bulunamadı, atlandı)');

  // ---------- 7. Şifre değiştirme ----------
  console.log('\n7) Şifre politikası');
  const w1 = await call('POST', '/auth/change-password', { token, body: { currentPassword: ADMIN_PASSWORD, newPassword: '1234' } });
  check('Zayıf şifre (1234) reddedilir', w1.status === 400);
  const w2 = await call('POST', '/auth/change-password', { token, body: { currentPassword: ADMIN_PASSWORD, newPassword: 'sadeceharfler' } });
  check('Rakamsız şifre reddedilir', w2.status === 400);
  const w3 = await call('POST', '/auth/change-password', { token, body: { currentPassword: 'yanlis', newPassword: 'GucluSifre2026x' } });
  check('Mevcut şifre yanlışsa değişmez', w3.status === 400);

  // ---------- 8. Kaba kuvvet (en sonda) ----------
  console.log('\n8) Kaba kuvvet koruması');
  let blocked = false;
  for (let i = 0; i < 12; i++) {
    const r = await call('POST', '/auth/login', { body: { username: 'lockout-test', password: 'deneme' + i } });
    if (r.status === 429) { blocked = true; break; }
  }
  check('Ardışık hatalı girişte kilitlenir (429)', blocked);

  finish();
})().catch((e) => { console.error('Test çalıştırılamadı:', e.message); process.exit(2); });

function finish() {
  console.log(`\nSonuç: ${pass} başarılı, ${fail} başarısız`);
  if (fail) { console.log('Başarısız: \n - ' + failures.join('\n - ')); process.exit(1); }
  console.log('Tüm güvenlik kontrolleri geçti ✔');
}
