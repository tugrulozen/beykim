/**
 * CoPilot + stok yönetimi + satış notu uçlarının uçtan uca testi.
 * Kullanım: node copilot-test.js http://localhost:4000/api admin <şifre>
 * DİKKAT: test ürünü + satış kaydı bırakır; canlı veritabanında değil, KOPYASINDA çalıştırın.
 */
const BASE = process.argv[2] || 'http://localhost:4000/api';
const USER = process.argv[3] || 'admin';
const PASS = process.argv[4] || '1234';

let pass = 0; let fail = 0; let token = '';
const ok = (name, cond, extra = '') => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, extra); } };
async function call(method, path, body, tok = token) {
  const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch (_e) { /* boş */ }
  return { status: r.status, body: j };
}
const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const chat = async (m, context) => (await call('POST', '/copilot/chat', { message: m, company: 'Test', context })).body.data || {};

(async () => {
  const login = await call('POST', '/auth/login', { username: USER, password: PASS }, '');
  if (!login.body.success) { console.log('Giriş başarısız — şifre parametresini kontrol edin:', login.body.message); process.exit(2); }
  token = login.body.data.token;

  // ---- stok yönetimi ----
  const whs = (await call('GET', '/warehouses')).body.data;
  const W1 = whs[0].id; const W2 = (whs[1] || whs[0]).id;
  const tag = 'ZZTEST' + Date.now().toString().slice(-6);
  const add = await call('POST', '/purchase', { barcode: '99' + Date.now().toString().slice(-10), name: tag + ' Deneme Ürün', quantity: 10, warehouseId: W1, category: 'Genel', unit: 'Adet' });
  ok('test ürünü eklenir', add.body.success, JSON.stringify(add.body));
  const prod = (await call('GET', '/products')).body.data.find((p) => p.name.startsWith(tag));
  ok('test ürünü listede', !!prod);
  if (!prod) process.exit(1);

  let r = await call('POST', '/stock-adjust', { productId: prod.id, warehouseId: W1, delta: 5 });
  ok('stok artır', r.body.success && r.body.data.after === 15, JSON.stringify(r.body));
  r = await call('POST', '/stock-adjust', { productId: prod.id, warehouseId: W1, delta: -3 });
  ok('stok azalt', r.body.success && r.body.data.after === 12, JSON.stringify(r.body));
  r = await call('POST', '/stock-adjust', { productId: prod.id, warehouseId: W1, delta: -100 });
  ok('eksiye düşürme reddedilir', r.status === 400, r.status);
  r = await call('POST', '/stock-adjust', { productId: prod.id, warehouseId: W2, setTo: 7 });
  ok('sayıma göre ayarla (yeni depo)', r.body.success && r.body.data.after === 7, JSON.stringify(r.body));
  r = await call('POST', '/stock-adjust', { productId: prod.id, warehouseId: W1, delta: 1.5 });
  ok('ondalık miktar reddedilir', r.status === 400);
  r = await call('POST', '/stock-adjust', { productId: 'yok', warehouseId: W1, delta: 1 });
  ok('olmayan ürün 404', r.status === 404);
  const after = (await call('GET', '/products')).body.data.find((p) => p.id === prod.id);
  ok('toplam stok depolarla tutarlı (19)', after.stock === 19, after.stock);

  // ---- satış notu + depoda ürün yokken hata ----
  const cust = (await call('GET', '/customers')).body.data[0];
  let s = await call('POST', '/sales', { customerId: cust.id, warehouseId: W1, productId: prod.id, quantity: 2, type: 'toptan', note: 'Vade: 30 gün · İrsaliye: T-1' });
  ok('notlu satış başarılı', s.body.success, JSON.stringify(s.body));
  s = await call('POST', '/sales', { customerId: cust.id, warehouseId: W1, productId: prod.id, quantity: 999, type: 'toptan' });
  ok('yetersiz stok 400 + mesaj', s.status === 400 && /stok/i.test(s.body.message || ''), JSON.stringify(s.body));
  s = await call('POST', '/sales', { customerId: cust.id, warehouseId: W1, productId: prod.id, quantity: 1, type: 'iade', note: 'İade nedeni: Hasarlı ürün' });
  ok('iade başarılı', s.body.success, JSON.stringify(s.body));

  // ---- CoPilot ----
  const soru = async (q, re, name, ctx) => { const a = await chat(q, ctx); const t = strip(a.message); ok(`${name}: "${q}"`, re.test(t), t.slice(0, 160)); return a; };
  await soru('merhaba', /Merhaba|hoş geldiniz|burada/i, 'selam');
  await soru('Neler sorabilirim?', /Şunları sorabilirsiniz/, 'yardım');
  const pa = await soru(`${tag} stoğu kaç`, /Toplam stok\s*:?\s*18/, 'ürün stoğu');
  ok('ürün bağlamı döner', !!(pa.context && pa.context.productId));
  await soru('peki ambarlara göre dağılımı?', /Ambarlara göre/, 'bağlamlı devam', pa.context);
  await soru('azalan ürünler', /Düşük|eşik/i, 'düşük stok');
  await soru('stok durumu', /çeşit malzeme/i, 'stok özeti');
  await soru('stok değeri ne kadar', /Stok değeri/i, 'stok değeri');
  await soru('bu ay sevkiyatlar', /Gemi sevkiyatları|sevkiyat kaydı yok/i, 'sevkiyat özeti');
  await soru('en çok sevk edilen malzemeler', /En çok sevk edilen|sevkiyat yok/i, 'çok sevk edilen');
  await soru('navlun alacakları', /Navlun alacakları/i, 'navlun alacakları');
  await soru(`${cust.name} bakiyesi`, new RegExp(cust.name.split(' ')[0], 'i'), 'müşteri kartı');
  await soru('kritik hammaddeler', /Hammadde|Düşük \/ biten stoklar/i, 'hammadde (Beykim: hammadde yok, düşük stok listesi döner)');
  await soru('kaç adet üretebiliriz', /üretim, reçete ve hammadde/i, 'üretim yok açıklaması');
  await soru('ambarlar', /Ambarlar/i, 'ambar listesi');
  await soru('satın alma siparişleri', /Satın alma özeti/i, 'satın alma');
  await soru('tedarikçiler', /Tedarikçiler/i, 'tedarikçiler');
  await soru('son transferler', /Ambar hareketleri/i, 'hareketler');
  await soru('geciken işler', /Uyarılar ve gecikenler/i, 'gecikenler');
  await soru('süreçlere göre işler', /İş & Durum Takip/i, 'iş takip kapalı açıklaması');
  await soru('kişi performansları', /performans/i, 'performans (kapalı modül açıklaması)');
  await soru('acil gemi talepleri', /acil gemi talebi/i, 'acil talepler');
  await soru('uyarılar', /Uyarılar/i, 'uyarılar');
  await soru('filomuz', /Filo/i, 'filo');
  await soru('M/T KARLICA özellikleri', /12\.000/, 'gemi özellikleri');
  await soru('PO-2026-010', /PO-2026-010/, 'sipariş numarası');
  await soru('bu ay bunker gideri', /Bunker|gider kaydı yok/i, 'gider kalemi');
  await soru('sevkiyat nasıl yapılır', /Gemiye sevkiyat nasıl yapılır/i, 'rehber: sevkiyat');
  await soru('satış nasıl yapılır', /Gemiye sevkiyat/i, 'rehber: satış → sevkiyat');
  await soru('iade nasıl alınır', /Gemiden iade/i, 'rehber: iade');
  await soru('stok nasıl düzeltilir', /Stok düzeltme/i, 'rehber: stok düzeltme');
  await soru('ürünü nasıl silerim', /nasıl silinir/i, 'rehber: silme');
  await soru('şifremi nasıl değiştiririm', /Şifre değiştirme/i, 'rehber: şifre');
  await soru('excele nasıl aktarırım', /Excel/i, 'rehber: excel');
  await soru('bugün hangi gün', /Bugün/i, 'tarih');
  const fb = await chat('asdkjh qwe zxc');
  ok('anlaşılmayan soruda öneri döner', Array.isArray(fb.suggestions) && fb.suggestions.length > 0);
  const xss = await chat('<img src=x onerror=alert(1)> stok');
  ok('kullanıcı metni HTML olarak yansımaz', !/<img/i.test(xss.message || ''));

  // ---- yetki: izleyici silme yapamaz (rol yoksa atla) ----
  // ---- ürün silme ----
  const del1 = await call('DELETE', `/products/${prod.id}`);
  ok('stoklu ürün onaysız silinmez (409)', del1.status === 409, JSON.stringify(del1.body));
  const del2 = await call('DELETE', `/products/${prod.id}`).then(async (x) => x); // satış kaydı olduğu için de reddedilmeli
  ok('satış kaydı olan ürün silinemez', del2.status === 409 && /satış/.test(del2.body.message || ''), JSON.stringify(del2.body));
  const del3 = await call('DELETE', '/products/yok-boyle-urun');
  ok('olmayan ürün silme 404', del3.status === 404);

  // temizlik için satış kaydı olmayan ikinci ürünle başarılı silme
  const b2 = '98' + Date.now().toString().slice(-10);
  await call('POST', '/purchase', { barcode: b2, name: tag + ' Silinecek', quantity: 3, warehouseId: W1, category: 'Genel', unit: 'Adet' });
  const p2 = (await call('GET', '/products')).body.data.find((p) => p.barcode === b2);
  const d4 = await call('DELETE', `/products/${p2.id}?force=1`);
  ok('satış kaydı olmayan ürün silinir', d4.body.success, JSON.stringify(d4.body));
  ok('silinen ürün listeden düşer', !(await call('GET', '/products')).body.data.some((p) => p.id === p2.id));

  console.log(`\nSonuç: ${pass} geçti, ${fail} kaldı.`);
  console.log(`Not: "${tag} Deneme Ürün" satış kaydı taşıdığı için silinemez; Stok Yönetimi'nden stoğu 0'a çekilebilir.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
