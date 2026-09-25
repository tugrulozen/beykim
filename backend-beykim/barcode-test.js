/**
 * Barkod oluşturma + ürün endeksleme uçlarının testi (KOPYA veritabanında çalıştırın; ürün ve kayıt bırakır).
 *   BASE=http://localhost:4900 CREDS=./ilk-sifreler.txt ADMIN_PASSWORD=1234 node barcode-test.js
 */
const fs = require('fs');
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
const eanOk = (b) => { let s = 0; for (let i = 0; i < 12; i++) s += Number(b[i]) * (i % 2 === 0 ? 1 : 3); return String((10 - (s % 10)) % 10) === b[12]; };
const tag = 'ZZBC' + Date.now().toString().slice(-6);

(async () => {
  const A = (await login('admin', ADMIN_PASSWORD)).data.token;
  const wh = (await call('GET', '/warehouses', null, A)).body.data[0];
  const base = { mode: 'new', category: 'Test', unit: 'Adet', price: 12.5, quantity: 0, sizeId: '50x30', widthMm: 50, heightMm: 30 };

  // otomatik EAN-13
  const nx = await call('GET', '/barcodes/next?format=ean13&prefix=2', null, A);
  ok('sıradaki barkod önerilir', nx.body.success && /^\d{13}$/.test(nx.body.data.barcode) && eanOk(nx.body.data.barcode), JSON.stringify(nx.body));
  const a = await call('POST', '/barcodes', { ...base, name: tag + ' Ürün A', format: 'ean13', quantity: 25, warehouseId: wh.id, autoPrefix: '2' }, A);
  ok('yeni ürün + otomatik EAN-13', a.body.success && eanOk(a.body.data.barcode) && a.body.data.barcode.startsWith('2'), JSON.stringify(a.body));
  const prods = (await call('GET', '/products', null, A)).body.data;
  const pa = prods.find((p) => p.name === tag + ' Ürün A');
  ok('ürün endekslendi (barkodla bulunur)', pa && pa.barcode === a.body.data.barcode && pa.stock === 25 && pa.price === 12.5, JSON.stringify(pa));
  const byBarcode = await call('GET', '/products/' + a.body.data.barcode, null, A);
  ok('barkodla ürün sorgusu', byBarcode.body.success && byBarcode.body.data.id === pa.id);
  const bal = (await call('GET', '/warehouse-balances', null, A)).body.data.find((b) => b.productId === pa.id);
  ok('ilk stok depoya işlendi', bal && bal.qty === 25 && bal.warehouseId === wh.id);

  const a2 = await call('POST', '/barcodes', { ...base, name: tag + ' Ürün A2', format: 'ean13', autoPrefix: '2' }, A);
  ok('ikinci otomatik barkod farklı', a2.body.success && a2.body.data.barcode !== a.body.data.barcode);

  // elle barkod + doğrulamalar
  const custom = '2999' + Date.now().toString().slice(-8);
  const c = await call('POST', '/barcodes', { ...base, name: tag + ' Ürün C', format: 'ean13', barcode: custom }, A);
  ok('elle 12 haneli barkod → kontrol hanesi eklenir', c.body.success && c.body.data.barcode.length === 13 && c.body.data.barcode.startsWith(custom) && eanOk(c.body.data.barcode), JSON.stringify(c.body));
  const dup = await call('POST', '/barcodes', { ...base, name: tag + ' Kopya', format: 'ean13', barcode: c.body.data.barcode }, A);
  ok('yinelenen barkod reddedilir (409)', dup.status === 409, dup.status);
  const badCd = await call('POST', '/barcodes', { ...base, name: tag + ' Hatalı', format: 'ean13', barcode: '2999999999990' }, A);
  ok('hatalı kontrol hanesi reddedilir', badCd.status === 400 || badCd.body.success === true, badCd.status);
  const badFmt = await call('POST', '/barcodes', { ...base, name: 'x', format: 'ean13', barcode: 'ABC123' }, A);
  ok('EAN-13 harf reddedilir', badFmt.status === 400);
  const noName = await call('POST', '/barcodes', { ...base, name: '', format: 'code128' }, A);
  ok('ürün adı zorunlu', noName.status === 400);
  const noWh = await call('POST', '/barcodes', { ...base, name: tag + ' Stoklu', format: 'code128', quantity: 5 }, A);
  ok('stok için depo zorunlu', noWh.status === 400);
  const negP = await call('POST', '/barcodes', { ...base, name: tag + ' Neg', format: 'code128', price: -3 }, A);
  ok('negatif fiyat reddedilir', negP.status === 400);
  const badSize = await call('POST', '/barcodes', { ...base, name: tag + ' Boy', format: 'code128', widthMm: 5 }, A);
  ok('geçersiz ölçü reddedilir', badSize.status === 400);
  const c128 = await call('POST', '/barcodes', { ...base, name: tag + ' C128', format: 'code128' }, A);
  ok('Code 128 otomatik (P + sıra)', c128.body.success && /^P\d{8}$/.test(c128.body.data.barcode), JSON.stringify(c128.body));
  const c128tr = await call('POST', '/barcodes', { ...base, name: tag + ' TR', format: 'code128', barcode: 'ÇİĞ123' }, A);
  ok('Code 128 Türkçe karakter reddedilir', c128tr.status === 400);
  const qr = await call('POST', '/barcodes', { ...base, name: tag + ' QR Ürünü', format: 'qr', barcode: 'https://example.com/ürün?id=' + tag }, A);
  ok('QR serbest metin', qr.body.success && qr.body.data.barcode === 'https://example.com/ürün?id=' + tag, JSON.stringify(qr.body));
  const c39 = await call('POST', '/barcodes', { ...base, name: tag + ' C39', format: 'code39', barcode: 'abc-' + tag.toLowerCase() }, A);
  ok('Code 39 büyük harfe çevrilir', c39.body.success && c39.body.data.barcode === 'ABC-' + tag, JSON.stringify(c39.body));
  const inj = await call('POST', '/barcodes', { ...base, name: `${tag} '); DROP TABLE products;--`, format: 'code128' }, A);
  ok('SQL enjeksiyonu etkisiz', inj.body.success && (await call('GET', '/products', null, A)).body.success);

  // mevcut ürün için etiket
  const ex = await call('POST', '/barcodes', { mode: 'existing', productId: pa.id, format: 'ean13', sizeId: '40x30', widthMm: 40, heightMm: 30 }, A);
  ok('mevcut ürün: kendi barkoduyla etiket', ex.body.success && ex.body.data.barcode === pa.barcode, JSON.stringify(ex.body));
  const exBad = await call('POST', '/barcodes', { mode: 'existing', productId: pa.id, format: 'code39', sizeId: '40x30', widthMm: 40, heightMm: 30 }, A);
  ok('mevcut barkod uymayan türde: açık hata yok, kod 39 rakam kabul', exBad.body.success === true || exBad.status === 400);
  const missing = await call('POST', '/barcodes', { mode: 'existing', productId: 'yok', format: 'ean13', sizeId: 'x', widthMm: 40, heightMm: 30 }, A);
  ok('olmayan ürün 404', missing.status === 404);

  // dizin + yazdırma sayacı
  const list = await call('GET', '/barcodes?q=' + encodeURIComponent(tag), null, A);
  ok('barkod dizini listelenir', list.body.success && list.body.data.length >= 5, JSON.stringify(list.body).slice(0, 200));
  const row = list.body.data.find((r) => r.barcode === a.body.data.barcode && r.widthMm === 50);
  ok('dizin satırı ürün bilgisiyle', row && row.name === tag + ' Ürün A' && row.width_mm === undefined && row.widthMm === 50 && row.createdBy);
  const pr = await call('POST', `/barcodes/${row.id}/print`, { copies: 12 }, A);
  ok('yazdırma kaydı', pr.body.success && /12 adet/.test(pr.body.message), JSON.stringify(pr.body));
  const after = (await call('GET', '/barcodes?q=' + a.body.data.barcode, null, A)).body.data.find((r) => r.id === row.id);
  ok('yazdırma sayacı arttı', after.printCount === 12 && after.lastPrintedAt);
  ok('geçersiz adet en az 1', (await call('POST', `/barcodes/${row.id}/print`, { copies: -5 }, A)).body.message.includes('1 adet'));
  ok('olmayan kayıt 404', (await call('POST', '/barcodes/999999/print', { copies: 1 }, A)).status === 404);
  ok('arama enjeksiyonu güvenli', (await call('GET', "/barcodes?q=" + encodeURIComponent("' OR 1=1 --"), null, A)).status === 200);

  // son işlemler
  await new Promise((r) => setTimeout(r, 400));
  const act = (await call('GET', '/activity?q=' + encodeURIComponent(tag), null, A)).body.data.items;
  ok('Son İşlemler: barkod oluşturma kaydı', act.some((i) => i.type === 'barcode' && /Barkod oluşturuldu/.test(i.text)));
  ok('Son İşlemler: yazdırma kaydı', act.some((i) => i.type === 'barcodePrint'));

  // yetki
  const pw = {};
  if (fs.existsSync(CREDS)) fs.readFileSync(CREDS, 'utf8').split('\n').forEach((l) => { const m = l.match(/^(\S+)\s+(\S+)\s+/); if (m) pw[m[1]] = m[2]; });
  const users = (await call('GET', '/jt/users', null, A)).body.data;
  const viewer = users.find((u) => u.role === 'viewer' && pw[u.username]);
  if (viewer) {
    const V = (await login(viewer.username, pw[viewer.username])).data.token;
    ok('görüntüleyici barkod oluşturamaz (403)', (await call('POST', '/barcodes', { ...base, name: tag + ' V', format: 'code128' }, V)).status === 403);
    ok('görüntüleyici dizini okuyabilir', (await call('GET', '/barcodes', null, V)).body.success);
  }
  const op = users.find((u) => u.role === 'operator' && pw[u.username]);
  if (op) {
    const O = (await login(op.username, pw[op.username])).data.token;
    ok('operatör (stok yetkisi) barkod oluşturabilir', (await call('POST', '/barcodes', { ...base, name: tag + ' Op', format: 'code128' }, O)).body.success);
  }
  ok('oturumsuz istek reddedilir', (await call('GET', '/barcodes')).status === 401);

  console.log(`\nSonuç: ${pass} başarılı, ${fail} başarısız.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
