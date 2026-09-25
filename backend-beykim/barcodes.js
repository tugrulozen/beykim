/**
 * Barkod oluşturma + ürün endeksleme
 *
 * Bir barkod oluşturulurken ürün kartı da (ad, kategori, birim, fiyat, ilk stok) açılır; böylece o barkodu
 * okutan her ekran (stok sorgu, sayım, transfer, satış ...) ürünü hemen bulur. Üretilen her barkod ayrıca
 * `barcode_labels` tablosunda (barkod dizini) kim, ne zaman, hangi ölçüde oluşturdu ve kaç kez yazdırıldı
 * bilgisiyle tutulur.
 */

const FORMATS = ['ean13', 'ean8', 'code128', 'code39', 'qr'];
const FORMAT_LABEL = { ean13: 'EAN-13', ean8: 'EAN-8', code128: 'Code 128', code39: 'Code 39', qr: 'QR Kod' };
const C39_CHARS = /^[A-Z0-9\-. $/+%]+$/;

function eanCheck(d) {
  let s = 0;
  for (let i = 0; i < d.length; i++) s += Number(d[d.length - 1 - i]) * (i % 2 === 0 ? 3 : 1);
  return String((10 - (s % 10)) % 10);
}

/** Kodlayıcıyla (src/core/barcode/encoders.js) aynı kurallar. Dönüş: { ok, value, error } */
function validate(format, raw) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v) return { ok: false, error: 'Barkod değeri boş.' };
  if (format === 'ean13' || format === 'ean8') {
    const n = format === 'ean13' ? 12 : 7;
    if (!new RegExp(`^\\d{${n},${n + 1}}$`).test(v)) return { ok: false, error: `${FORMAT_LABEL[format]} için ${n} veya ${n + 1} rakam girin.` };
    const base = v.slice(0, n); const cd = eanCheck(base);
    if (v.length === n + 1 && v[n] !== cd) return { ok: false, error: `Kontrol hanesi hatalı (doğrusu ${cd}).` };
    return { ok: true, value: base + cd };
  }
  if (format === 'code128') {
    if (v.length > 48) return { ok: false, error: 'Code 128 için en fazla 48 karakter.' };
    if ([...v].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)) return { ok: false, error: 'Code 128 Türkçe/özel karakter içeremez. QR Kod kullanın.' };
    return { ok: true, value: v };
  }
  if (format === 'code39') {
    const up = v.toUpperCase();
    if (up.length > 30 || !C39_CHARS.test(up)) return { ok: false, error: 'Code 39 yalnızca A-Z, 0-9 ve - . $ / + % boşluk destekler (en fazla 30).' };
    return { ok: true, value: up };
  }
  if (format === 'qr') {
    if (v.length > 300) return { ok: false, error: 'QR için en fazla 300 karakter.' };
    return { ok: true, value: v };
  }
  return { ok: false, error: 'Bilinmeyen barkod türü.' };
}

/** Otomatik değer: önek + sıra no (istemci ile aynı kural) */
function buildAuto(format, prefix, seq) {
  const pre = String(prefix || '').replace(/\D/g, '').slice(0, 4) || '2';
  if (format === 'ean13') { const body = (pre + String(seq).padStart(12 - pre.length, '0')).slice(0, 12); return body + eanCheck(body); }
  if (format === 'ean8') { const body = (pre.slice(0, 1) + String(seq).padStart(6, '0')).slice(0, 7); return body + eanCheck(body); }
  return `P${String(seq).padStart(8, '0')}`;
}

module.exports = function createBarcodes({ app, dbAll, dbGet, dbRun }) {
  const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

  async function barcodeTaken(barcode) {
    return dbGet(`SELECT id, name FROM products WHERE barcode = ?`, [barcode]);
  }

  /** Sıradaki boş otomatik barkod (sayaç yalnızca ilerler; kullanılmış olanlar atlanır) */
  async function nextAuto(format, prefix) {
    const key = `${format}:${String(prefix || '').replace(/\D/g, '').slice(0, 4) || '2'}`;
    const row = await dbGet(`SELECT val FROM barcode_counters WHERE k = ?`, [key]);
    let seq = (row ? row.val : 0) + 1;
    for (let guard = 0; guard < 5000; guard++, seq++) {
      const candidate = buildAuto(format, prefix, seq);
      if (!(await barcodeTaken(candidate))) return { key, seq, barcode: candidate };
    }
    throw new Error('Boş barkod bulunamadı.');
  }

  app.get('/api/barcodes/next', async (req, res) => {
    try {
      const format = FORMATS.includes(req.query.format) ? req.query.format : 'ean13';
      const n = await nextAuto(format, req.query.prefix);
      res.json({ success: true, data: { barcode: n.barcode, format } });
    } catch (e) { res.status(500).json({ success: false, message: 'Barkod üretilemedi.' }); }
  });

  app.get('/api/barcodes', async (req, res) => {
    try {
      const q = clip(req.query.q, 60).replace(/[%_]/g, '');
      const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 300));
      const where = q ? 'WHERE l.barcode LIKE ? OR p.name LIKE ? OR p.code LIKE ?' : '';
      const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];
      const rows = await dbAll(`SELECT l.id, l.barcode, l.format, l.sizeId, l.widthMm, l.heightMm, l.createdBy, l.createdAt, l.printCount, l.lastPrintedAt,
          p.id AS productId, p.name, p.code, p.category, p.unit, p.price, p.stock
        FROM barcode_labels l LEFT JOIN products p ON p.id = l.productId ${where} ORDER BY l.id DESC LIMIT ${limit}`, params);
      res.json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, message: 'Barkod kayıtları okunamadı.' }); }
  });

  app.post('/api/barcodes', async (req, res) => {
    const b = req.body || {};
    const format = b.format;
    if (!FORMATS.includes(format)) return res.status(400).json({ success: false, message: 'Barkod türü geçersiz.' });
    const wMm = Number(b.widthMm); const hMm = Number(b.heightMm);
    if (!(wMm >= 10 && wMm <= 300 && hMm >= 8 && hMm <= 300)) return res.status(400).json({ success: false, message: 'Etiket ölçüsü geçersiz.' });
    const sizeId = clip(b.sizeId, 20);
    const who = (req.me && req.me.name) || '';

    try {
      let product = null;
      let barcode = '';
      let counterHit = null;

      if (b.mode === 'existing') {
        product = await dbGet(`SELECT id, code, barcode, name, unit, price, category, stock FROM products WHERE id = ?`, [clip(b.productId, 64)]);
        if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
        barcode = product.barcode;
        if (!barcode) {
          if (b.barcode) {
            const v = validate(format, b.barcode);
            if (!v.ok) return res.status(400).json({ success: false, message: v.error });
            const taken = await barcodeTaken(v.value);
            if (taken) return res.status(409).json({ success: false, message: `Bu barkod zaten "${taken.name}" ürününde kayıtlı.` });
            barcode = v.value;
          } else { counterHit = await nextAuto(format, b.autoPrefix); barcode = counterHit.barcode; }
        } else {
          const v = validate(format, barcode);
          // ürünün mevcut barkodu seçilen türe uymuyorsa yazdırılamaz: kullanıcıya bildir
          if (!v.ok) return res.status(400).json({ success: false, message: `Ürünün mevcut barkodu (${barcode}) ${FORMAT_LABEL[format]} türüne uymuyor: ${v.error} Başka bir tür seçin (ör. Code 128 veya QR).` });
          barcode = v.value;
        }
      } else {
        const name = clip(b.name, 120);
        if (!name) return res.status(400).json({ success: false, message: 'Ürün adı gerekli.' });
        const price = b.price === '' || b.price == null ? 0 : Number(b.price);
        if (!(price >= 0 && price <= 1e9)) return res.status(400).json({ success: false, message: 'Fiyat geçersiz.' });
        const qty = b.quantity === '' || b.quantity == null ? 0 : Number(b.quantity);
        if (!(Number.isInteger(qty) && qty >= 0 && qty <= 1e7)) return res.status(400).json({ success: false, message: 'Başlangıç miktarı geçersiz.' });
        let warehouseId = null;
        if (qty > 0) {
          warehouseId = clip(b.warehouseId, 64);
          if (!warehouseId || !(await dbGet(`SELECT id FROM warehouses WHERE id = ?`, [warehouseId]))) return res.status(400).json({ success: false, message: 'Başlangıç stoğu için depo seçin.' });
        }
        if (b.barcode) {
          const v = validate(format, b.barcode);
          if (!v.ok) return res.status(400).json({ success: false, message: v.error });
          barcode = v.value;
          const taken = await barcodeTaken(barcode);
          if (taken) return res.status(409).json({ success: false, message: `Bu barkod zaten "${taken.name}" ürününde kayıtlı.` });
        } else { counterHit = await nextAuto(format, b.autoPrefix); barcode = counterHit.barcode; }

        const id = 'ITM' + Date.now() + Math.floor(Math.random() * 1000);
        const code = 'PRD-' + Date.now().toString().slice(-6);
        await dbRun('BEGIN TRANSACTION');
        try {
          await dbRun(`INSERT INTO products (id, code, barcode, name, unit, stock, price, category) VALUES (?,?,?,?,?,?,?,?)`,
            [id, code, barcode, name, clip(b.unit, 20) || 'Adet', qty, price, clip(b.category, 60) || 'Genel']);
          if (qty > 0) {
            await dbRun(`INSERT INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)
              ON CONFLICT(productId, warehouseId) DO UPDATE SET qty = qty + ?`, [id, warehouseId, qty, qty]);
          }
          await dbRun('COMMIT');
        } catch (e) { try { await dbRun('ROLLBACK'); } catch (_) { /* yok */ } throw e; }
        product = { id, code, barcode, name, unit: clip(b.unit, 20) || 'Adet', price, category: clip(b.category, 60) || 'Genel', stock: qty };
      }

      // mevcut ürüne yeni barkod atanıyorsa ürün kartına yaz
      if (b.mode === 'existing' && !product.barcode) await dbRun(`UPDATE products SET barcode = ? WHERE id = ?`, [barcode, product.id]);
      if (counterHit) {
        await dbRun(`INSERT INTO barcode_counters (k, val) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET val = ?`, [counterHit.key, counterHit.seq, counterHit.seq]);
      }
      const ins = await dbRun(`INSERT INTO barcode_labels (barcode, format, productId, sizeId, widthMm, heightMm, createdBy, createdAt, printCount) VALUES (?,?,?,?,?,?,?,?,0)`,
        [barcode, format, product.id, sizeId, wMm, hMm, who, new Date().toISOString()]);
      const label = await dbGet(`SELECT id FROM barcode_labels WHERE barcode = ? ORDER BY id DESC LIMIT 1`, [barcode]);
      res.json({
        success: true,
        message: `Barkod oluşturuldu: "${product.name}" · ${FORMAT_LABEL[format]} ${barcode} · ${wMm}×${hMm} mm`,
        data: { labelId: label && label.id, barcode, product: { ...product, barcode } },
      });
    } catch (e) {
      console.error('[barcodes]', e.message);
      res.status(500).json({ success: false, message: 'Barkod oluşturulamadı.' });
    }
  });

  /** Yazdırma kaydı (adet sayacı + son yazdırma) */
  app.post('/api/barcodes/:id/print', async (req, res) => {
    try {
      const copies = Math.min(10000, Math.max(1, Math.floor(Number((req.body || {}).copies) || 1)));
      const row = await dbGet(`SELECT l.id, l.barcode, l.format, p.name FROM barcode_labels l LEFT JOIN products p ON p.id = l.productId WHERE l.id = ?`, [Number(req.params.id)]);
      if (!row) return res.status(404).json({ success: false, message: 'Barkod kaydı bulunamadı.' });
      await dbRun(`UPDATE barcode_labels SET printCount = printCount + ?, lastPrintedAt = ? WHERE id = ?`, [copies, new Date().toISOString(), row.id]);
      res.json({ success: true, message: `${copies} adet etiket yazdırıldı: "${row.name || row.barcode}" · ${FORMAT_LABEL[row.format] || row.format}` });
    } catch (e) { res.status(500).json({ success: false, message: 'Yazdırma kaydı tutulamadı.' }); }
  });

  return { validate, buildAuto };
};

module.exports.initSchema = function initSchema(run) {
  run(`CREATE TABLE IF NOT EXISTS barcode_labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT, format TEXT, productId TEXT, sizeId TEXT, widthMm REAL, heightMm REAL,
    createdBy TEXT, createdAt TEXT, printCount INTEGER DEFAULT 0, lastPrintedAt TEXT)`);
  run(`CREATE INDEX IF NOT EXISTS ix_barcode_labels_barcode ON barcode_labels(barcode)`);
  run(`CREATE INDEX IF NOT EXISTS ix_barcode_labels_product ON barcode_labels(productId)`);
  run(`CREATE TABLE IF NOT EXISTS barcode_counters (k TEXT PRIMARY KEY, val INTEGER)`);
};
module.exports.validate = validate;
module.exports.buildAuto = buildAuto;
