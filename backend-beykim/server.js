// Bu sunucu yalnızca Beykim Denizcilik'e hizmet verir: jetonlar ve X-Tenant-Id bu kimlikle denetlenir
process.env.TENANT_ID = process.env.TENANT_ID || 'beykim';
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { seedBeykim } = require('./beykimSeed');
const mountJobTracking = require('./jobTracking');

const sec = require('./security');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Passenger / ters vekil arkasında gerçek istemci adresi
// Alt yol desteği: uygulama codendtec.com/wms-api gibi bir yola bağlanırsa öneki kaldırır (BASE_PATH ile değiştirilebilir)
const BASE_PATH = (process.env.BASE_PATH || '/beykim/servis').replace(/\/+$/, '');
app.use((req, _res, next) => {
  if (BASE_PATH && (req.url === BASE_PATH || req.url.startsWith(BASE_PATH + '/'))) req.url = req.url.slice(BASE_PATH.length) || '/';
  next();
});
app.use(sec.securityHeaders);
app.use(cors(sec.corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(sec.sanitizeBody);
app.use(sec.hideServerErrors);
app.use('/api', sec.apiRateLimit);
// Giriş dışındaki tüm /api uçları geçerli oturum jetonu ister
app.use('/api', sec.requireAuth(['/auth/login', '/auth/logout']));
const activity = require('./activity')({ dbAll, dbGet, dbRun });
app.use('/api', activity.middleware);
const jtApi = mountJobTracking({ app, dbAll, dbGet, dbRun, sec, hashPassword: sec.hashPassword });
activity.mountRoutes(app);
const barcodesApi = require('./barcodes')({ app, dbAll, dbGet, dbRun });
const financeApi = require('./finance')({ app, dbAll, dbGet, dbRun, notify: activity.notify });
// Sürüm bilgisi: yüklenen dosyaların uyumlu olup olmadığını gösterir (eksik/eski dosya teşhisi)
app.get('/api/version', (req, res) => res.json({ success: true, data: { server: '2026.09.22-1', jobTracking: jtApi.version || 'eski', activity: true, copilot: true, finance: true, financeHub: true, tenant: sec.TENANT_ID || null } }));

const dbPath = path.join(__dirname, 'beykim.db');
let db;
let dbInstance;

function saveDatabase() {
  if (dbInstance) {
    const data = dbInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

// sql.js undefined parametreyi kabul etmez (hata mesajsız fırlatır) -> null yap
const clean = (p) => (Array.isArray(p) ? p.map((v) => (v === undefined ? null : v)) : p);

// sql.js export() açık bir transaction'ı sonlandırır; bu yüzden transaction sürerken diske yazmayı erteleriz.
let inTransaction = false;
const isTxStart = (sql) => /^\s*BEGIN/i.test(sql);
const isTxEnd = (sql) => /^\s*(COMMIT|ROLLBACK|END)/i.test(sql);

function wrapSqlJsDb(instance) {
  return {
    run: function(sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      try {
        instance.run(sql, clean(params));
        if (isTxStart(sql)) inTransaction = true;
        const changes = instance.getRowsModified();
        if (isTxEnd(sql)) inTransaction = false;
        if (!inTransaction) saveDatabase();
        if (callback) callback.call({ changes }, null);
      } catch (e) {
        if (callback) callback(e);
      }
    },
    get: function(sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      try {
        const stmt = instance.prepare(sql);
        stmt.bind(clean(params));
        let row = undefined;
        if (stmt.step()) row = stmt.getAsObject();
        stmt.free();
        if (callback) callback(null, row);
      } catch (e) {
        if (callback) callback(e);
      }
    },
    all: function(sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      try {
        const stmt = instance.prepare(sql);
        stmt.bind(clean(params));
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        if (callback) callback(null, rows);
      } catch (e) {
        if (callback) callback(e);
      }
    },
    serialize: function(callback) {
      if (callback) callback();
    },
    prepare: function(sql) {
      const stmt = instance.prepare(sql);
      return {
        run: function(params, cb) {
          try {
            stmt.run(clean(params));
            if (!inTransaction) saveDatabase();
            if (cb) cb(null);
          } catch(e) { if(cb) cb(e); }
        },
        finalize: function(cb) {
          stmt.free();
          if (cb) cb(null);
        }
      };
    }
  };
}

initSqlJs().then(SQL => {
  if (fs.existsSync(dbPath)) {
    dbInstance = new SQL.Database(fs.readFileSync(dbPath));
    console.log('📦 SQL.js: Mevcut beykim.db yüklendi.');
  } else {
    dbInstance = new SQL.Database();
    console.log('📦 SQL.js: Yeni beykim.db oluşturuldu.');
  }
  db = wrapSqlJsDb(dbInstance);
  console.log('📦 Veritabanına bağlanıldı.');
  initDb();
}).catch(err => console.error('SQL.js başlatılamadı:', err));

// Helper: promisified db methods (kept for backward compatibility)
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}
let txQueue = Promise.resolve();
let txRelease = null;
async function dbRun(sql, params = []) {
  const starts = isTxStart(sql);
  if (starts) {
    const prev = txQueue;
    let release;
    txQueue = new Promise((r) => { release = r; });
    await prev;
    txRelease = release;
  }
  try {
    return await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  } catch (e) {
    if (starts && txRelease) { txRelease(); txRelease = null; }
    throw e;
  } finally {
    if (isTxEnd(sql) && txRelease) { txRelease(); txRelease = null; }
  }
}

// ---- Depo bazlı stok (warehouse_stock) yardımcıları ----
async function wsAdjust(productId, warehouseId, delta) {
  if (!productId || !warehouseId || !delta) return;
  await dbRun(`INSERT INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)
    ON CONFLICT(productId, warehouseId) DO UPDATE SET qty = MAX(0, qty + ?)`, [productId, warehouseId, Math.max(0, delta), delta]);
}
async function wsQty(productId, warehouseId) {
  const r = await dbGet(`SELECT qty FROM warehouse_stock WHERE productId = ? AND warehouseId = ?`, [productId, warehouseId]);
  return r ? r.qty : 0;
}

// ============ VERITABANI KURULUMU ============
function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, role TEXT DEFAULT 'viewer',
      title TEXT, department TEXT, phone TEXT, email TEXT, active INTEGER DEFAULT 1, mustChange INTEGER DEFAULT 0, createdAt TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, code TEXT, barcode TEXT UNIQUE, name TEXT, unit TEXT, stock INTEGER DEFAULT 0, price REAL DEFAULT 0, category TEXT DEFAULT 'Genel'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS raw_materials (
      id TEXT PRIMARY KEY, code TEXT, name TEXT, unit TEXT, stock REAL, minStock REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, productId TEXT, name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS recipe_items (
      recipeId INTEGER, rawMaterialId TEXT, quantity REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY, code TEXT, name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY, code TEXT, name TEXT, branchId TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY, name TEXT, balance REAL, currency TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY, customerId TEXT, warehouseId TEXT, productId TEXT, quantity INTEGER, type TEXT, date TEXT,
      orderId TEXT, lineId TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY, sourceWarehouse TEXT, targetWarehouse TEXT, targetBranch TEXT, barcode TEXT, date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS stock_counts (
      id TEXT PRIMARY KEY, warehouseId TEXT, barcode TEXT, countedQty INTEGER, systemQty INTEGER, date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS vehicle_unloads (
      id TEXT PRIMARY KEY, warehouseId TEXT, vehicleInfo TEXT, barcode TEXT, date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY, code TEXT, name TEXT, contactPerson TEXT, phone TEXT, email TEXT, address TEXT, 
      taxNo TEXT, currency TEXT, paymentTerm INTEGER, category TEXT, status TEXT, 
      totalOrders INTEGER DEFAULT 0, totalAmount REAL DEFAULT 0, createdAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, supplierId TEXT, supplierName TEXT, orderDate TEXT, expectedDate TEXT, 
      status TEXT, currency TEXT, exchangeRate REAL, warehouseId TEXT, warehouseName TEXT, 
      invoiceNo TEXT, notes TEXT, createdBy TEXT, approvedBy TEXT, approvedAt TEXT, 
      cancelReason TEXT, receiptDate TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS purchase_order_lines (
      id TEXT PRIMARY KEY, orderId TEXT, productCode TEXT, productName TEXT, unit TEXT, 
      qty REAL, receivedQty REAL, unitPrice REAL, taxRate REAL, discount REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS raw_material_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, rawMaterialId TEXT, type TEXT, qty REAL, date TEXT, note TEXT
    )`);
  });

  // İş takip tabloları (roller, süreçler, projeler, siparişler, işler ...)
  mountJobTracking.initSchema((sql, params) => dbInstance.run(sql, params));

  // Depo bazlı stok tablosu: ürün stokları depolara dağıtılır (ilk kurulumda bir kez)
  dbInstance.run(`CREATE TABLE IF NOT EXISTS warehouse_stock (
    productId TEXT, warehouseId TEXT, qty INTEGER DEFAULT 0, PRIMARY KEY (productId, warehouseId)
  )`);
  activity.initSchema((sql, params) => dbInstance.run(sql, params));
  require('./barcodes').initSchema((sql, params) => dbInstance.run(sql, params));
  financeApi.initSchema((sql, params) => dbInstance.run(sql, params));
  dbInstance.run(`CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, productId TEXT, warehouseId TEXT, before INTEGER, after INTEGER, reason TEXT, byUser TEXT, date TEXT
  )`);
  { // satış notu (irsaliye no, vade, iade nedeni ...) için sütun
    const st = dbInstance.prepare('PRAGMA table_info(sales)');
    let has = false;
    while (st.step()) if (st.getAsObject().name === 'note') has = true;
    st.free();
    if (!has) dbInstance.run('ALTER TABLE sales ADD COLUMN note TEXT');
  }
  for (const [table, column, def] of [['sales', 'amount', 'REAL'], ['customers', 'paymentTerm', 'INTEGER'],
    // Beykim denizcilik satın alma: talep eden gemi, gemi talep no, teslim limanı, aciliyet
    ['purchase_orders', 'vesselId', 'TEXT'], ['purchase_orders', 'vesselName', 'TEXT'], ['purchase_orders', 'requisitionNo', 'TEXT'], ['purchase_orders', 'port', 'TEXT'], ['purchase_orders', 'urgency', 'TEXT']]) { // finans ve satın alma sütunları
    const st = dbInstance.prepare(`PRAGMA table_info(${table})`);
    let has = false;
    while (st.step()) if (st.getAsObject().name === column) has = true;
    st.free();
    if (!has) dbInstance.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  }
  dbInstance.run(`CREATE TABLE IF NOT EXISTS packing_lists (
    id TEXT PRIMARY KEY, shipmentKey TEXT, customerId TEXT, customerName TEXT, date TEXT, items TEXT, createdBy TEXT
  )`);
  backfillWarehouseStock();

  // Beykim ilk kurulum verisi (kullanıcılar, roller, ERP ve finans örnek verisi): yalnızca veritabanı boşsa, bir kez yüklenir.
  // DEMO_SEED=0 ise örnek ERP/finans verisi yüklenmez; yalnızca roller ve kullanıcılar oluşur.
  {
    const q = (sql, params = []) => {
      const stmt = dbInstance.prepare(sql);
      stmt.bind(clean(params));
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    };
    const loaded = seedBeykim({
      run: (sql, params = []) => dbInstance.run(sql, clean(params)),
      all: q,
      one: (sql, params) => q(sql, params)[0],
      save: saveDatabase,
      hashPassword: sec.hashPassword,
    });
    if (loaded) console.log('🌱 Beykim verisi yüklendi (gemiler, ambarlar, malzemeler, sevkiyatlar ve finans).');
  }
  migratePasswords();
}

// Düz metin şifreleri scrypt özetine çevirir; ADMIN_PASSWORD verilmişse admin şifresini ayarlar
function migratePasswords() {
  const stmt = dbInstance.prepare(`SELECT id, username, password FROM users`);
  const users = []; while (stmt.step()) users.push(stmt.getAsObject()); stmt.free();
  let changed = false;
  users.forEach((u) => {
    if (!sec.isHashed(u.password)) {
      dbInstance.run(`UPDATE users SET password = ? WHERE id = ?`, [sec.hashPassword(u.password || ''), u.id]);
      changed = true;
    }
  });
  if (process.env.ADMIN_PASSWORD) {
    dbInstance.run(`UPDATE users SET password = ? WHERE username = 'admin'`, [sec.hashPassword(process.env.ADMIN_PASSWORD)]);
    changed = true;
  }
  if (changed) saveDatabase();
}

function backfillWarehouseStock() {
  const q = (sql, params = []) => {
    const stmt = dbInstance.prepare(sql); stmt.bind(params);
    const rows = []; while (stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); return rows;
  };
  const whs = q(`SELECT id FROM warehouses`).map((w) => w.id);
  if (!whs.length) return;
  const main = whs.includes('1012') ? '1012' : whs[0];
  const split = [[main, 0.55], ['1021', 0.25], ['1031', 0.2]].filter(([id]) => whs.includes(id));
  const products = q(`SELECT id, stock FROM products WHERE id NOT IN (SELECT DISTINCT productId FROM warehouse_stock)`);
  if (!products.length) return;
  products.forEach((p) => {
    let left = Math.max(0, p.stock || 0);
    split.forEach(([id, share], i) => {
      const part = i === split.length - 1 ? left : Math.min(left, Math.floor((p.stock || 0) * share));
      left -= part;
      dbInstance.run(`INSERT OR REPLACE INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)`, [p.id, id, part]);
    });
  });
  saveDatabase();
}

// ============ API ENDPOINTS ============

// --- AUTH ---
const DEFAULT_ADMIN_PASSWORD = '1234';
app.post('/api/auth/login', (req, res) => {
  const username = String((req.body && req.body.username) || '').trim().slice(0, 100);
  const password = String((req.body && req.body.password) || '');
  const userKey = `${req.ip}|${username.toLowerCase()}`;
  if (sec.loginLimiter.blocked(userKey) || sec.loginIpLimiter.blocked(req.ip)) {
    res.setHeader('Retry-After', String(sec.loginLimiter.retryAfter(userKey)));
    return res.status(429).json({ success: false, message: 'Çok fazla hatalı deneme. Lütfen birkaç dakika sonra tekrar deneyin.' });
  }
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    // Kullanıcı yoksa da aynı işlem süresi harcanır (kullanıcı adı doğrulaması sızdırılmasın)
    const ok = sec.verifyPassword(password, row ? row.password : sec.DUMMY_HASH) && !!row && row.active !== 0;
    if (!ok) {
      sec.loginLimiter.hit(userKey); sec.loginIpLimiter.hit(req.ip);
      return res.status(401).json({ success: false, message: 'Hatalı kullanıcı adı veya şifre' });
    }
    sec.loginLimiter.clear(userKey);
    db.get(`SELECT name FROM branches ORDER BY code LIMIT 1`, [], async (e2, br) => {
      const token = sec.signToken({ uid: row.id, username: row.username, role: row.role, name: row.name });
      const permissions = await jtApi.rolePerms(row.role);
      res.json({ success: true, data: { token, user: {
        id: row.id, name: row.name, role: row.role, username: row.username, title: row.title || '', department: row.department || '',
        branchName: br ? br.name : '', permissions,
        mustChangePassword: password === DEFAULT_ADMIN_PASSWORD || row.mustChange === 1,
      } } });
    });
  });
});

app.post('/api/auth/logout', (_req, res) => res.json({ success: true }));

app.post('/api/auth/change-password', (req, res) => {
  if (!req.user || !req.user.uid) return res.status(403).json({ success: false, message: 'Bu işlem için kullanıcı girişi gerekir.' });
  const { currentPassword, newPassword } = req.body || {};
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 100) {
    return res.status(400).json({ success: false, message: 'Yeni şifre en az 8 karakter olmalı.' });
  }
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Yeni şifre en az bir harf ve bir rakam içermeli.' });
  }
  if (newPassword === DEFAULT_ADMIN_PASSWORD) return res.status(400).json({ success: false, message: 'Bu şifre çok kolay tahmin edilir.' });
  const key = `${req.ip}|pw|${req.user.uid}`;
  if (sec.loginLimiter.blocked(key)) return res.status(429).json({ success: false, message: 'Çok fazla deneme. Biraz bekleyin.' });
  db.get(`SELECT password FROM users WHERE id = ?`, [req.user.uid], (err, row) => {
    if (!row || !sec.verifyPassword(String(currentPassword || ''), row.password)) {
      sec.loginLimiter.hit(key);
      return res.status(400).json({ success: false, message: 'Mevcut şifre hatalı.' });
    }
    db.run(`UPDATE users SET password = ?, mustChange = 0 WHERE id = ?`, [sec.hashPassword(newPassword), req.user.uid], (e) => {
      if (e) return res.status(500).json({ success: false });
      res.json({ success: true, message: 'Şifre değiştirildi.' });
    });
  });
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get(`SELECT * FROM products WHERE id = ? OR barcode = ?`, [req.params.id, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    if (!row) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    res.json({ success: true, data: row });
  });
});

// --- STOK YÖNETİMİ: depo bazlı artırma / azaltma / sayıma göre ayarlama ---
app.post('/api/stock-adjust', async (req, res) => {
  const { productId, warehouseId, delta, setTo, reason } = req.body || {};
  if (!productId || !warehouseId) return res.status(400).json({ success: false, message: 'Ürün ve depo seçin.' });
  const hasSet = setTo !== undefined && setTo !== null && setTo !== '';
  const d = Number(delta);
  const target = Number(setTo);
  if (hasSet ? !(Number.isInteger(target) && target >= 0 && target <= 10000000) : !(Number.isInteger(d) && d !== 0 && Math.abs(d) <= 10000000)) {
    return res.status(400).json({ success: false, message: 'Geçerli bir miktar girin.' });
  }
  try {
    const product = await dbGet(`SELECT id, name, stock FROM products WHERE id = ?`, [productId]);
    const wh = await dbGet(`SELECT id, name FROM warehouses WHERE id = ?`, [warehouseId]);
    if (!product || !wh) return res.status(404).json({ success: false, message: 'Ürün veya depo bulunamadı.' });
    const before = await wsQty(productId, warehouseId);
    const after = hasSet ? target : before + d;
    if (after < 0) return res.status(400).json({ success: false, message: `Stok eksiye düşemez. Depodaki miktar: ${before}` });
    const diff = after - before;
    if (diff === 0) return res.json({ success: true, message: 'Miktar zaten aynı.', data: { before, after } });

    await dbRun('BEGIN TRANSACTION');
    await dbRun(`INSERT INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)
      ON CONFLICT(productId, warehouseId) DO UPDATE SET qty = ?`, [productId, warehouseId, after, after]);
    await dbRun(`UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?`, [diff, productId]);
    await dbRun(`INSERT INTO stock_adjustments (productId, warehouseId, before, after, reason, byUser, date) VALUES (?,?,?,?,?,?,?)`,
      [productId, warehouseId, before, after, String(reason || '').slice(0, 200), (req.me && req.me.name) || '', new Date().toISOString()]);
    await dbRun('COMMIT');
    res.json({ success: true, message: `"${product.name}" · ${wh.name}: ${before} → ${after}`, data: { before, after } });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch (_) {}
    res.status(500).json({ success: false, message: 'Stok güncellenemedi.' });
  }
});

// --- ÜRÜN SİL: geçmiş kaydı olan ürünler korunur ---
app.delete('/api/products/:id', async (req, res) => {
  if (!req.me || !['admin', 'manager'].includes(req.me.role)) return res.status(403).json({ success: false, message: 'Ürün silme yetkisi yalnızca yönetici ve proje yöneticisindedir.' });
  try {
    const product = await dbGet(`SELECT id, code, name, stock FROM products WHERE id = ?`, [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
    const refs = [
      ['sales', 'productId', 'satış kaydı'],
      ['jt_order_lines', 'productId', 'iş takip siparişi'],
      ['jt_jobs', 'productId', 'iş takip işi'],
      ['recipes', 'productId', 'reçete'],
      ['purchase_order_lines', 'productCode', 'satın alma satırı'],
    ];
    const used = [];
    for (const [table, col, label] of refs) {
      try {
        const r = await dbGet(`SELECT COUNT(*) AS n FROM ${table} WHERE ${col} = ?`, [col === 'productCode' ? (product.code || '\u0000none') : product.id]);
        if (r && r.n > 0) used.push(`${r.n} ${label}`);
      } catch (_) { /* tablo bu kurulumda yok */ }
    }
    if (used.length) {
      return res.status(409).json({ success: false, message: `"${product.name}" silinemez: ${used.join(', ')} ona bağlı. Geçmiş kayıtlar korunur; stoğunu 0'a çekerek kullanım dışı bırakabilirsiniz.` });
    }
    if (product.stock > 0 && req.query.force !== '1') {
      return res.status(409).json({ success: false, needsForce: true, message: `"${product.name}" ürününde ${product.stock} adet stok var. Silinirse stok kaydı da silinir.` });
    }
    await dbRun('BEGIN TRANSACTION');
    await dbRun(`DELETE FROM warehouse_stock WHERE productId = ?`, [product.id]);
    await dbRun(`DELETE FROM stock_adjustments WHERE productId = ?`, [product.id]);
    await dbRun(`DELETE FROM barcode_labels WHERE productId = ?`, [product.id]);
    await dbRun(`DELETE FROM products WHERE id = ?`, [product.id]);
    await dbRun('COMMIT');
    res.json({ success: true, message: `"${product.name}" silindi.` });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch (_) {}
    res.status(500).json({ success: false, message: 'Ürün silinemedi.' });
  }
});

// --- BRANCHES & WAREHOUSES & CUSTOMERS ---
app.get('/api/branches', (req, res) => {
  db.all(`SELECT * FROM branches ORDER BY name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

app.get('/api/warehouses', (req, res) => {
  db.all(`SELECT * FROM warehouses ORDER BY name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

app.get('/api/customers', (req, res) => {
  db.all(`SELECT * FROM customers ORDER BY name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

// --- RAW MATERIALS ---
app.get('/api/raw-materials', (req, res) => {
  db.all(`SELECT * FROM raw_materials`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

// --- RAW MATERIAL ADJUST ---
app.post('/api/raw-materials/adjust', async (req, res) => {
  const { rawMaterialId, type, quantity, note } = req.body;
  const qty = sec.posNum(quantity);
  if (!rawMaterialId || !qty || !['IN', 'OUT'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Hatalı parametreler. (type: IN/OUT, qty>0)' });
  }

  try {
    const rm = await dbGet(`SELECT * FROM raw_materials WHERE id = ?`, [rawMaterialId]);
    if (!rm) return res.status(404).json({ success: false, message: 'Hammadde bulunamadı.' });

    const newStock = type === 'IN' ? rm.stock + qty : rm.stock - qty;
    if (newStock < 0) return res.status(400).json({ success: false, message: 'Stok yetersiz.' });

    await dbRun(`UPDATE raw_materials SET stock = ? WHERE id = ?`, [newStock, rawMaterialId]);
    await dbRun(`INSERT INTO raw_material_logs (rawMaterialId, type, qty, date, note) VALUES (?,?,?,?,?)`, [
      rawMaterialId, type, qty, new Date().toISOString(), note || ''
    ]);

    res.json({ success: true, message: 'Stok güncellendi.', data: { id: rawMaterialId, newStock } });
  } catch (err) {
    res.status(500).json({ success: false, error: (err && err.message) || String(err) });
  }
});

// --- RECIPES ---
app.get('/api/recipes', (req, res) => {
  db.all(`SELECT r.id, r.productId, r.name, ri.rawMaterialId, ri.quantity 
          FROM recipes r JOIN recipe_items ri ON r.id = ri.recipeId`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    const recipesMap = {};
    rows.forEach(row => {
      if (!recipesMap[row.id]) {
        recipesMap[row.id] = { productId: row.productId, name: row.name, materials: [] };
      }
      recipesMap[row.id].materials.push({ rawMaterialId: row.rawMaterialId, quantity: row.quantity });
    });
    res.json({ success: true, data: Object.values(recipesMap) });
  });
});

// --- PRODUCTION ---
app.post('/api/production', async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = sec.posInt(quantity);
  if (!productId || !qty) return res.status(400).json({ message: 'Geçersiz ürün veya miktar.' });

  try {
    const materials = await dbAll(
      `SELECT ri.rawMaterialId, ri.quantity AS neededPerUnit, rm.name, rm.stock 
       FROM recipes r JOIN recipe_items ri ON r.id = ri.recipeId
       JOIN raw_materials rm ON rm.id = ri.rawMaterialId
       WHERE r.productId = ?`, [productId]);

    if (materials.length === 0) return res.status(400).json({ message: 'Reçete bulunamadı.' });

    const missing = materials.filter(m => m.stock < m.neededPerUnit * qty)
      .map(m => `${m.name} (Gereken: ${m.neededPerUnit * qty}, Mevcut: ${m.stock})`);
    if (missing.length > 0) return res.status(400).json({ message: 'Yetersiz hammadde: ' + missing.join(', ') });

    await dbRun('BEGIN TRANSACTION');
    for (const mat of materials) {
      await dbRun(`UPDATE raw_materials SET stock = stock - ? WHERE id = ?`, [mat.neededPerUnit * qty, mat.rawMaterialId]);
    }
    await dbRun(`UPDATE products SET stock = stock + ? WHERE id = ?`, [qty, productId]);
    await wsAdjust(productId, '1012', qty);
    await dbRun('COMMIT');

    res.json({ success: true, message: `Üretim başarılı! ${qty} adet üretildi. Hammaddeler düşüldü, stok güncellendi.` });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch(_) {}
    res.status(500).json({ message: 'Üretim sırasında hata: ' + e.message });
  }
});

// --- BRANCHES ---
app.get('/api/branches', (req, res) => {
  db.all(`SELECT * FROM branches`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

// --- WAREHOUSES ---
app.get('/api/warehouses', (req, res) => {
  db.all(`SELECT * FROM warehouses`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

// --- CUSTOMERS ---
app.get('/api/customers', (req, res) => {
  db.all(`SELECT * FROM customers`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: (err && err.message) || String(err) });
    res.json({ success: true, data: rows });
  });
});

// --- PURCHASE (Mal Kabul) ---
app.post('/api/purchase', (req, res) => {
  const { barcode, name, quantity, warehouseId, category, unit } = req.body;
  const qty = sec.posInt(quantity);
  if (!barcode || !qty) return res.status(400).json({ message: 'Eksik veya geçersiz veri.' });

  db.get(`SELECT id, stock, name FROM products WHERE barcode = ?`, [barcode], (err, product) => {
    if (err) return res.status(500).json({ message: 'Veritabanı hatası.' });

    if (product) {
      db.run(`UPDATE products SET stock = stock + ? WHERE id = ?`, [qty, product.id], function(e) {
        if (e) return res.status(500).json({ message: 'Stok güncellenemedi.' });
        wsAdjust(product.id, warehouseId || '1012', qty).catch(() => {});
        res.json({ success: true, message: `"${product.name}" stoğuna ${qty} adet eklendi. Yeni stok: ${product.stock + qty}`, isExisting: true });
      });
    } else {
      const newId = 'ITM' + Date.now();
      const code = 'PRD-' + Date.now().toString().slice(-6);
      db.run(`INSERT INTO products (id, code, barcode, name, unit, stock, price, category) VALUES (?,?,?,?,?,?,?,?)`,
        [newId, code, barcode, name || 'İsimsiz Ürün', unit || 'Adet', qty, 0, category || 'Genel'], function(e) {
        if (e) return res.status(500).json({ message: 'Yeni ürün oluşturulamadı: ' + e.message });
        wsAdjust(newId, warehouseId || '1012', qty).catch(() => {});
        res.json({ success: true, message: `Yeni ürün "${name || 'İsimsiz'}" sisteme eklendi! (${qty} adet)`, isExisting: false });
      });
    }
  });
});

// --- SALES ---
app.post('/api/sales', async (req, res) => {
  const { customerId, warehouseId, productId, quantity, type, orderId, lineId } = req.body;
  const note = typeof req.body.note === 'string' ? req.body.note.slice(0, 300) : null;
  const qty = sec.posInt(quantity);
  if (!customerId || !productId || !qty) return res.status(400).json({ message: 'Eksik veya geçersiz veri.' });

  try {
    const product = await dbGet(`SELECT stock, price, name FROM products WHERE id = ?`, [productId]);
    if (!product) return res.status(400).json({ message: 'Ürün bulunamadı.' });
    // İş takip bağlantısı: sevk edilen adet siparişin "giden miktarı" olur
    if (orderId || lineId) {
      const ok = await dbGet(`SELECT id FROM jt_order_lines WHERE id = ? AND orderId = ? AND productId = ?`, [lineId, orderId, productId]);
      if (!ok) return res.status(400).json({ message: 'Sipariş kalemi bulunamadı veya ürünle eşleşmiyor.' });
    }
    const isReturn = type === 'iade';
    if (!isReturn && product.stock < qty) return res.status(400).json({ message: `Yetersiz stok. Mevcut: ${product.stock}` });
    if (!isReturn && warehouseId) {
      const inWh = await wsQty(productId, warehouseId);
      if (inWh < qty) return res.status(400).json({ message: `Seçilen depoda yetersiz stok. Depodaki miktar: ${inWh}` });
    }

    // Beykim: gemiye (GM…) yapılan sevkiyat şirket içi ikmaldir; cari bakiye ve satış tutarı oluşturmaz.
    // Maliyet (stok değeri) not alanında tutulmaz; stok hareketi ve Son İşlemler kaydı yeterlidir.
    const vessel = /^GM/.test(String(customerId));
    const cust = await dbGet(`SELECT name FROM customers WHERE id = ?`, [customerId]);
    if (!cust) return res.status(400).json({ message: 'Sevk noktası (gemi / müşteri) bulunamadı.' });
    const totalAmount = vessel ? 0 : product.price * qty;
    const saleId = 'SL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // İade: ürün depoya geri girer, müşteri bakiyesi düşer
    await dbRun('BEGIN TRANSACTION');
    await dbRun(`UPDATE products SET stock = stock ${isReturn ? '+' : '-'} ? WHERE id = ?`, [qty, productId]);
    await wsAdjust(productId, warehouseId || '1012', isReturn ? qty : -qty);
    if (!vessel) await dbRun(`UPDATE customers SET balance = balance ${isReturn ? '-' : '+'} ? WHERE id = ?`, [totalAmount, customerId]);
    await dbRun(`INSERT INTO sales (id, customerId, warehouseId, productId, quantity, type, date, orderId, lineId, note, amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [saleId, customerId, warehouseId, productId, qty, type, new Date().toISOString(), orderId || null, lineId || null, note || null, totalAmount]);
    await dbRun('COMMIT');

    if (vessel) return res.json({ success: true, message: isReturn
      ? `Gemiden iade alındı: "${product.name}" x${qty} ambara geri girdi (${cust.name}).`
      : `Sevkiyat kaydedildi: "${product.name}" x${qty} → ${cust.name}` });
    res.json({ success: true, message: isReturn
      ? `İade alındı. "${product.name}" x${qty} stoğa geri eklendi (${totalAmount.toLocaleString('tr-TR')} ₺ bakiyeden düşüldü).`
      : `Satış başarılı! "${product.name}" x${qty} = ${totalAmount.toLocaleString('tr-TR')} ₺` });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch(_) {}
    res.status(500).json({ message: 'Satış sırasında hata: ' + e.message });
  }
});

// --- TRANSFERS ---
app.post('/api/transfers', async (req, res) => {
  const { targetBranch, targetWarehouse, sourceWarehouse, barcodes } = req.body;
  if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0 || barcodes.length > 2000 || barcodes.some((b) => typeof b !== 'string' || !b || b.length > 64)) {
    return res.status(400).json({ message: 'Barkod listesi boş veya geçersiz.' });
  }

  try {
    await dbRun('BEGIN TRANSACTION');
    let newCount = 0;
    for (const barcode of barcodes) {
      // Ürün yoksa otomatik kaydet
      const existing = await dbGet(`SELECT id FROM products WHERE barcode = ?`, [barcode]);
      if (!existing) {
        const newId = 'ITM' + Date.now() + Math.floor(Math.random() * 1000);
        await dbRun(`INSERT INTO products (id, code, barcode, name, unit, stock, price, category) VALUES (?,?,?,?,?,?,?,?)`,
          [newId, 'PRD-' + Date.now().toString().slice(-6), barcode, 'Yeni Ürün (Transfer)', 'Adet', 1, 0, 'Genel']);
        await wsAdjust(newId, targetWarehouse || sourceWarehouse || '1012', 1);
        newCount++;
      } else {
        const inSource = sourceWarehouse ? await wsQty(existing.id, sourceWarehouse) : 0;
        if (sourceWarehouse && inSource > 0) await wsAdjust(existing.id, sourceWarehouse, -1);
        else await dbRun(`UPDATE products SET stock = stock + 1 WHERE id = ?`, [existing.id]); // kaynak depoda kayıtsız fazla ürün: sayım farkı olarak eklenir
        await wsAdjust(existing.id, targetWarehouse || sourceWarehouse || '1012', 1);
      }
      // Transfer kaydı
      const trfId = 'TRF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      await dbRun(`INSERT INTO transfers (id, sourceWarehouse, targetWarehouse, targetBranch, barcode, date) VALUES (?,?,?,?,?,?)`,
        [trfId, sourceWarehouse || '', targetWarehouse || '', targetBranch || '', barcode, new Date().toISOString()]);
    }
    await dbRun('COMMIT');
    const msg = newCount > 0 
      ? `${barcodes.length} ürün transfer edildi. ${newCount} yeni ürün otomatik kaydedildi.`
      : `${barcodes.length} ürün başarıyla transfer edildi.`;
    res.json({ success: true, message: msg });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch(_) {}
    res.status(500).json({ message: 'Transfer hatası: ' + e.message });
  }
});

// --- VEHICLE UNLOAD ---
app.post('/api/vehicle-unload', async (req, res) => {
  const { warehouseId, vehicleInfo, barcodes } = req.body;
  if (!Array.isArray(barcodes) || barcodes.length === 0 || barcodes.length > 2000 || barcodes.some((b) => typeof b !== 'string' || !b || b.length > 64)) return res.status(400).json({ message: 'Barkod listesi boş veya geçersiz.' });

  try {
    await dbRun('BEGIN TRANSACTION');
    let newCount = 0;
    for (const barcode of barcodes) {
      const existing = await dbGet(`SELECT id FROM products WHERE barcode = ?`, [barcode]);
      if (!existing) {
        const newId = 'ITM' + Date.now() + Math.floor(Math.random() * 1000);
        await dbRun(`INSERT INTO products (id, code, barcode, name, unit, stock, price, category) VALUES (?,?,?,?,?,?,?,?)`,
          [newId, 'PRD-' + Date.now().toString().slice(-6), barcode, 'Yeni Ürün (Araç Boşaltma)', 'Adet', 1, 0, 'Genel']);
        await wsAdjust(newId, warehouseId || '1012', 1);
        newCount++;
      } else {
        await dbRun(`UPDATE products SET stock = stock + 1 WHERE barcode = ?`, [barcode]);
        await wsAdjust(existing.id, warehouseId || '1012', 1);
      }
      const vuId = 'VU-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      await dbRun(`INSERT INTO vehicle_unloads (id, warehouseId, vehicleInfo, barcode, date) VALUES (?,?,?,?,?)`,
        [vuId, warehouseId || '', vehicleInfo || '', barcode, new Date().toISOString()]);
    }
    await dbRun('COMMIT');
    res.json({ success: true, message: `${barcodes.length} ürün depoya kaydedildi.${newCount > 0 ? ` ${newCount} yeni ürün oluşturuldu.` : ''}` });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch(_) {}
    res.status(500).json({ message: 'Boşaltma hatası: ' + e.message });
  }
});

// --- STOCK COUNT ---
app.post('/api/stock-count', async (req, res) => {
  const { warehouseId, items } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 2000 || items.some((i) => !i || typeof i.code !== 'string' || !i.code || i.code.length > 64)) return res.status(400).json({ message: 'Sayım listesi boş veya geçersiz.' });

  try {
    await dbRun('BEGIN TRANSACTION');
    let matched = 0, diff = 0;
    const details = [];
    for (const item of items) {
      const product = await dbGet(`SELECT id, name, stock FROM products WHERE barcode = ? OR code = ?`, [item.code, item.code]);
      // Depo seçiliyse o depodaki, değilse toplam sistem stoğu ile karşılaştırılır
      const systemQty = product ? (warehouseId ? await wsQty(product.id, warehouseId) : product.stock) : 0;
      const counted = sec.posInt(item.counted, 1000000) || 1;
      const scId = 'SC-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      await dbRun(`INSERT INTO stock_counts (id, warehouseId, barcode, countedQty, systemQty, date) VALUES (?,?,?,?,?,?)`,
        [scId, warehouseId || '', item.code, counted, systemQty, new Date().toISOString()]);
      if (systemQty === counted) matched++; else diff++;
      details.push({ code: item.code, name: product ? product.name : null, known: !!product, counted, system: systemQty, diff: counted - systemQty });
    }
    await dbRun('COMMIT');
    res.json({ success: true, message: `${items.length} ürün sayıldı. ${matched} eşleşti, ${diff} farklı.`, data: { total: items.length, matched, diff, details } });
  } catch (e) {
    try { await dbRun('ROLLBACK'); } catch(_) {}
    res.status(500).json({ message: 'Sayım hatası: ' + e.message });
  }
});

// --- SERIALS ---
app.get('/api/serials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await dbGet(`SELECT * FROM products WHERE barcode = ? OR code = ? OR id = ?`, [id, id, id]);
    if (!product) return res.json({ success: false, message: 'Seri bulunamadı. Lütfen geçerli bir barkod veya kod girin.' });
    // Ürünün en çok bulunduğu depo
    const loc = await dbGet(`SELECT ws.warehouseId, ws.qty, w.name AS whName, w.branchId, b.name AS branchName
      FROM warehouse_stock ws LEFT JOIN warehouses w ON w.id = ws.warehouseId LEFT JOIN branches b ON b.id = w.branchId
      WHERE ws.productId = ? ORDER BY ws.qty DESC LIMIT 1`, [product.id]);
    // Hücre kodu: ürün koduna bağlı, sabit (raf düzeni)
    const h = String(product.code || product.id).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);
    const cell = String.fromCharCode(65 + (h % 4)) + '-' + (1 + (h % 6)) + '-' + (1 + ((h >> 3) % 5));
    const p = product.price || 0;
    const usd = Math.round(p * 0.028 * 100) / 100, eur = Math.round(p * 0.026 * 100) / 100;
    const round = (n) => Math.round(n * 100) / 100;
    res.json({
      success: true,
      data: {
        serialNo: product.barcode || id,
        quantity: product.stock || 0,
        cell,
        warehouseId: loc ? `${loc.warehouseId} (${loc.whName})` : '-',
        branchId: loc ? `${loc.branchId} (${loc.branchName})` : '-',
        collection: product.category || 'Genel',
        oldDesen: product.name,
        prices: {
          MT: { profitRate: 15.5, usd, eur, try: p },
          MP: { profitRate: 22, usd: round(usd * 1.08), eur: round(eur * 1.08), try: round(p * 1.08) },
          IT: { profitRate: 12, usd: round(usd * 0.94), eur: round(eur * 0.94), try: round(p * 0.94) },
          CT: { profitRate: 18, usd: round(usd * 1.15), eur: round(eur * 1.15), try: round(p * 1.15) },
        },
      },
    });
  } catch (e) { res.status(500).json({ success: false, message: 'Veritabanı hatası' }); }
});

app.get('/api/serials/:id/others', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT category FROM products WHERE barcode = ? OR code = ? OR id = ?`, [id, id, id], (err, product) => {
    if (err || !product) return res.json({ success: true, data: { items: [], totalCount: 0, totalQuantity: 0 } });
    db.all(`SELECT barcode, stock, name FROM products WHERE category = ? AND barcode != ? LIMIT 10`, [product.category, id], (err2, rows) => {
      if (err2) return res.json({ success: true, data: { items: [], totalCount: 0, totalQuantity: 0 } });
      const items = rows.map(r => ({ serialNo: r.barcode, quantity: r.stock, name: r.name }));
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
      res.json({ success: true, data: { items, totalCount: items.length, totalQuantity } });
    });
  });
});

// --- DASHBOARD STATS ---
// Beykim: navlun faturaları (type='navlun', ürünsüz) finans içindir; depo panosunda sevkiyat sayılmaz
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const productCount = await dbGet(`SELECT COUNT(*) as count FROM products`);
    const totalStock = await dbGet(`SELECT SUM(stock) as total FROM products`);
    const customerCount = await dbGet(`SELECT COUNT(*) as count FROM customers`);
    const salesCount = await dbGet(`SELECT COUNT(*) as count FROM sales WHERE COALESCE(type,'') != 'navlun'`);
    const lowStock = await dbAll(`SELECT name, stock, unit FROM products WHERE stock <= 10 ORDER BY stock ASC LIMIT 5`);
    const recentSales = await dbAll(`SELECT s.*, p.name as productName, c.name as customerName FROM sales s LEFT JOIN products p ON s.productId = p.id LEFT JOIN customers c ON s.customerId = c.id WHERE COALESCE(s.type,'') != 'navlun' ORDER BY s.date DESC LIMIT 5`);

    // Panel grafikleri: son 12 ay hareket, depo dağılımı, bugünkü işlemler
    const today = new Date().toISOString().slice(0, 10);
    const since = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).toISOString().slice(0, 7);
    const movementRows = await dbAll(`
      SELECT substr(date, 1, 7) AS month, SUM(n) AS value FROM (
        SELECT date, quantity AS n FROM sales WHERE COALESCE(type,'') != 'navlun'
        UNION ALL SELECT date, 1 AS n FROM transfers
        UNION ALL SELECT date, 1 AS n FROM vehicle_unloads
        UNION ALL SELECT COALESCE(o.receiptDate, o.orderDate) AS date, 1 AS n
          FROM purchase_order_lines l JOIN purchase_orders o ON o.id = l.orderId WHERE l.receivedQty > 0
      ) WHERE substr(date, 1, 7) >= ? GROUP BY month`, [since]);
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly.push({ month: key, value: movementRows.find((r) => r.month === key)?.value || 0 });
    }
    const warehouseDist = await dbAll(`
      SELECT COALESCE(w.name, x.wid) AS name, COUNT(*) AS value FROM (
        SELECT warehouseId AS wid FROM sales
        UNION ALL SELECT targetWarehouse AS wid FROM transfers
        UNION ALL SELECT warehouseId AS wid FROM vehicle_unloads
        UNION ALL SELECT warehouseId AS wid FROM purchase_orders WHERE status IN ('partial', 'received')
      ) x LEFT JOIN warehouses w ON w.id = x.wid
      WHERE x.wid IS NOT NULL AND x.wid != '' GROUP BY x.wid ORDER BY value DESC LIMIT 6`);
    const todaySales = await dbGet(`SELECT COUNT(*) AS c FROM sales WHERE COALESCE(type,'') != 'navlun' AND substr(date, 1, 10) = ?`, [today]);
    const todayTransfers = await dbGet(`SELECT COUNT(*) AS c FROM transfers WHERE substr(date, 1, 10) = ?`, [today]);
    const lowStockCount = await dbGet(`SELECT COUNT(*) AS c FROM products WHERE stock <= 10`);

    res.json({
      success: true,
      data: {
        productCount: productCount.count,
        totalStock: totalStock.total || 0,
        customerCount: customerCount.count,
        salesCount: salesCount.count,
        lowStock,
        lowStockCount: lowStockCount.c,
        todaySales: todaySales.c,
        todayTransfers: todayTransfers.c,
        monthly,
        warehouseDist,
        recentSales
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'İstatistik hatası: ' + e.message });
  }
});

// --- COPILOT (bilgi motoru: canlı veri + kullanım rehberi; backend/copilot.js) ---
const askCopilot = require('./copilot')({ dbAll, dbGet, sec, jt: jtApi });
app.post('/api/copilot/chat', async (req, res) => {
  const { message, company, context } = req.body || {};
  const ctx = context && typeof context === 'object' ? { productId: String(context.productId || '').slice(0, 64) || undefined, customerId: String(context.customerId || '').slice(0, 64) || undefined } : {};
  try {
    const out = await askCopilot(req, message, company, ctx);
    res.json({ success: true, data: { message: iconize(out.message), suggestions: out.suggestions, context: out.context } });
  } catch (e) {
    console.error('CoPilot hatası:', e.message);
    res.json({ success: true, data: { message: 'Bu soruyu yanıtlarken bir sorun oluştu. Lütfen başka şekilde sormayı deneyin.', suggestions: ['Neler sorabilirim?'] } });
  }
});

// Emojileri arayüzle uyumlu ikonlara çevirir
function iconize(html) {
  const map = [
    ['📦', 'ph-package'], ['⚠️', 'ph-warning'], ['🧪', 'ph-flask'], ['🔴', 'ph-circle" style="color:#EB5757'], ['🟡', 'ph-circle" style="color:#F2C94C'],
    ['🟢', 'ph-circle" style="color:#27AE60'], ['👥', 'ph-users'], ['📊', 'ph-chart-bar'], ['🏭', 'ph-factory'], ['🧾', 'ph-receipt'],
    ['↔️', 'ph-arrows-left-right'], ['🤖', 'ph-sparkle'], ['📥', 'ph-download-simple'],
    ['💰', 'ph-coins'], ['🐢', 'ph-hourglass'], ['🏆', 'ph-trophy'], ['🤝', 'ph-handshake'], ['⚙️', 'ph-gear'], ['🔧', 'ph-wrench'], ['📋', 'ph-clipboard-text'],
    ['📁', 'ph-folder'], ['📈', 'ph-chart-line-up'], ['🔔', 'ph-bell-ringing'], ['⏰', 'ph-alarm'], ['🧭', 'ph-compass'], ['🔵', 'ph-circle" style="color:#2F80ED'], ['✔', 'ph-check'], ['↩', 'ph-arrow-u-down-left'],
  ];
  let out = html;
  map.forEach(([e, c]) => { out = out.split(e).join(`<i class="ph ${c}"></i>`); });
  return out;
}

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await dbAll(`SELECT * FROM suppliers WHERE status != 'passive' OR status IS NULL`, []);
    res.json({ success: true, data: suppliers });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});
app.post('/api/suppliers', async (req, res) => {
  const s = req.body;
  if (!s || typeof s.name !== 'string' || !s.name.trim()) return res.status(400).json({ success: false, message: 'Tedarikçi adı gerekli.' });
  const seqRes = await dbGet(`SELECT COUNT(*) as c FROM suppliers`);
  const seq = String((seqRes?.c || 0) + 1).padStart(3, '0');
  const id = 'SUP' + seq;
  const code = 'TED-' + seq;
  try {
    await dbRun(`INSERT INTO suppliers (id, code, name, contactPerson, phone, email, address, taxNo, currency, paymentTerm, category, status, totalOrders, totalAmount, createdAt)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, code, s.name, s.contactPerson||'', s.phone||'', s.email||'', s.address||'', s.taxNo||'', s.currency||'TRY', s.paymentTerm||30, s.category||'Diğer', 'active', 0, 0, new Date().toISOString().slice(0, 10)]
    );
    res.json({ success: true, message: 'Tedarikçi eklendi.' });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});
app.put('/api/suppliers/:id', async (req, res) => {
  const s = req.body;
  try {
    await dbRun(`UPDATE suppliers SET name=?, contactPerson=?, phone=?, email=?, taxNo=?, category=?, currency=?, paymentTerm=?, address=?, status=COALESCE(?, status) WHERE id=?`,
      [s.name, s.contactPerson, s.phone, s.email, s.taxNo, s.category, s.currency, s.paymentTerm, s.address, ['active', 'passive'].includes(s.status) ? s.status : null, req.params.id]
    );
    res.json({ success: true, message: 'Tedarikçi güncellendi.' });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

// --- PURCHASE ORDERS ---
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const orders = await dbAll(`SELECT * FROM purchase_orders ORDER BY orderDate DESC`);
    for (const o of orders) {
      o.lines = await dbAll(`SELECT * FROM purchase_order_lines WHERE orderId = ?`, [o.id]);
      let totalNet = 0, totalTax = 0;
      o.lines.forEach(l => {
        const net = (l.qty * l.unitPrice) * (1 - (l.discount||0)/100);
        totalNet += net; totalTax += net * (l.taxRate/100);
      });
      o.totalNet = totalNet; o.totalTax = totalTax; o.totalGross = totalNet + totalTax;
    }
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.get('/api/purchase-orders/:id', async (req, res) => {
  try {
    const o = await dbGet(`SELECT * FROM purchase_orders WHERE id = ?`, [req.params.id]);
    if (!o) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    o.lines = await dbAll(`SELECT * FROM purchase_order_lines WHERE orderId = ?`, [o.id]);
    let totalNet = 0, totalTax = 0;
    o.lines.forEach(l => {
      const net = (l.qty * l.unitPrice) * (1 - (l.discount||0)/100);
      totalNet += net; totalTax += net * (l.taxRate/100);
    });
    o.totalNet = totalNet; o.totalTax = totalTax; o.totalGross = totalNet + totalTax;
    res.json({ success: true, data: o });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.post('/api/purchase-orders', async (req, res) => {
  const o = req.body;
  if (!o || !o.supplierId || !Array.isArray(o.lines) || o.lines.length === 0 || o.lines.length > 500
    || o.lines.some((l) => !(Number(l.qty) > 0) || !(Number(l.unitPrice) >= 0) || !(Number(l.taxRate || 0) >= 0) || !(Number(l.discount || 0) >= 0 && Number(l.discount || 0) <= 100))) {
    return res.status(400).json({ success: false, message: 'Sipariş bilgileri eksik veya geçersiz.' });
  }
  const seqRes = await dbGet(`SELECT COUNT(*) as c FROM purchase_orders`);
  const seq = String((seqRes?.c || 0) + 1).padStart(3, '0');
  const id = "PO-" + new Date().getFullYear() + "-" + seq;
  try {
    const txt = (v, n) => (v == null ? null : String(v).replace(/[<>]/g, '').trim().slice(0, n) || null);
    const vessel = o.vesselId ? await dbGet(`SELECT id, name FROM customers WHERE id = ?`, [o.vesselId]) : null;
    const urgency = ['routine', 'priority', 'urgent'].includes(o.urgency) ? o.urgency : 'routine';
    await dbRun(`INSERT INTO purchase_orders (id, supplierId, supplierName, orderDate, expectedDate, status, currency, exchangeRate, warehouseId, warehouseName, notes, createdBy, approvedBy, approvedAt, vesselId, vesselName, requisitionNo, port, urgency)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, o.supplierId, o.supplierName, o.orderDate, o.expectedDate, o.status||'draft', o.currency, ({ TRY: 1, EUR: 48, USD: 41 })[o.currency] || o.exchangeRate || 1, o.warehouseId, o.warehouseName, txt(o.notes, 300), o.createdBy, o.approvedBy, o.approvedAt,
        vessel ? vessel.id : null, vessel ? vessel.name : null, txt(o.requisitionNo, 40), txt(o.port, 60), urgency]
    );
    for (const l of (o.lines || [])) {
      await dbRun(`INSERT INTO purchase_order_lines (id, orderId, productCode, productName, unit, qty, receivedQty, unitPrice, taxRate, discount) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id + "-" + l.id, id, l.productCode, l.productName, l.unit, l.qty, 0, l.unitPrice, l.taxRate, l.discount]
      );
    }
    await dbRun(`UPDATE suppliers SET totalOrders = totalOrders + 1 WHERE id = ?`, [o.supplierId]);
    res.json({ success: true, message: `Sipariş oluşturuldu: ${id}`, data: { id } });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.post('/api/purchase-orders/:id/approve', async (req, res) => {
  try {
    const o = await dbGet(`SELECT status FROM purchase_orders WHERE id = ?`, [req.params.id]);
    if (!o || !['draft', 'pending'].includes(o.status)) return res.status(400).json({ success: false, message: 'Bu sipariş onaylanamaz' });
    await dbRun(`UPDATE purchase_orders SET status = 'approved', approvedBy = ?, approvedAt = ? WHERE id = ?`, 
      [req.body.approvedBy, new Date().toISOString().slice(0, 10), req.params.id]);
    res.json({ success: true, message: 'Sipariş onaylandı' });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.post('/api/purchase-orders/:id/cancel', async (req, res) => {
  try {
    const o = await dbGet(`SELECT status FROM purchase_orders WHERE id = ?`, [req.params.id]);
    if (!o || ['received', 'cancelled'].includes(o.status)) return res.status(400).json({ success: false, message: 'Bu sipariş iptal edilemez' });
    await dbRun(`UPDATE purchase_orders SET status = 'cancelled', cancelReason = ? WHERE id = ?`, 
      [req.body.reason || 'Kullanıcı tarafından iptal', req.params.id]);
    res.json({ success: true, message: 'Sipariş iptal edildi' });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.post('/api/purchase-orders/:id/receive', async (req, res) => {
  const { invoiceNo, receivedLines } = req.body;
  try {
    const o = await dbGet(`SELECT * FROM purchase_orders WHERE id = ?`, [req.params.id]);
    const receivable = ['approved', 'ordered', 'partial', ...(req.body.allowUnapproved ? ['draft', 'pending'] : [])];
    if (!o || !receivable.includes(o.status)) return res.status(400).json({ success: false, message: 'Mal kabul yapılamaz' });
    
    let allReceived = true;
    let addedGross = 0;
    
    if (!Array.isArray(receivedLines) || receivedLines.length > 500) return res.status(400).json({ success: false, message: 'Geçersiz kalem listesi.' });
    for (const rl of receivedLines) {
      rl.qty = sec.posNum(rl && rl.qty) || 0; // negatif / sayı olmayan miktar kabul edilmez
      const line = rl.qty > 0 ? await dbGet(`SELECT * FROM purchase_order_lines WHERE id = ? AND orderId = ?`, [rl.lineId, o.id]) : null;
      if (line) {
        const newRcv = Math.min(line.receivedQty + rl.qty, line.qty);
        const delta = newRcv - line.receivedQty;
        await dbRun(`UPDATE purchase_order_lines SET receivedQty = ? WHERE id = ?`, [newRcv, line.id]);
        // Mal kabul stoğa yansır: hammadde kodu -> hammadde stoğu, ürün kodu -> ürün stoğu
        if (delta > 0) {
          const rm = await dbGet(`SELECT id FROM raw_materials WHERE code = ?`, [line.productCode]);
          if (rm) {
            await dbRun(`UPDATE raw_materials SET stock = stock + ? WHERE id = ?`, [delta, rm.id]);
            await dbRun(`INSERT INTO raw_material_logs (rawMaterialId, type, qty, date, note) VALUES (?,?,?,?,?)`,
              [rm.id, 'IN', delta, new Date().toISOString(), `Satın alma mal kabul (${o.id})`]);
          } else {
            await dbRun(`UPDATE products SET stock = stock + ? WHERE code = ?`, [Math.round(delta), line.productCode]);
            const prod = await dbGet(`SELECT id FROM products WHERE code = ?`, [line.productCode]);
            if (prod) await wsAdjust(prod.id, o.warehouseId || '1012', Math.round(delta));
          }
        }
        if (newRcv < line.qty) allReceived = false;
        
        const net = (rl.qty * line.unitPrice) * (1 - (line.discount||0)/100);
        addedGross += net + net * (line.taxRate/100);
      }
    }
    
    const currentLines = await dbAll(`SELECT qty, receivedQty FROM purchase_order_lines WHERE orderId = ?`, [o.id]);
    const fullyReceived = currentLines.every(l => l.receivedQty >= l.qty);
    
    const newStatus = fullyReceived ? 'received' : 'partial';
    await dbRun(`UPDATE purchase_orders SET status = ?, invoiceNo = ?, receiptDate = ? WHERE id = ?`, 
      [newStatus, invoiceNo || o.invoiceNo, new Date().toISOString().slice(0, 10), o.id]);
    
    await dbRun(`UPDATE suppliers SET totalAmount = totalAmount + ? WHERE id = ?`, [addedGross, o.supplierId]);
    res.json({ success: true, message: fullyReceived ? 'Tüm kalemler teslim alındı' : 'Kısmi teslim kaydedildi' });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

app.get('/api/purchase-reports/summary', async (req, res) => {
  try {
    const orders = await dbAll(`SELECT status, id FROM purchase_orders`);
    const byStatus = {};
    orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    res.json({ success: true, data: { total: orders.length, byStatus } });
  } catch (err) { res.status(500).json({ success: false, error: (err && err.message) || String(err) }); }
});

// --- DEPO BAZLI STOK BAKİYELERİ (Seri Ambar Bakiye) ---
app.get('/api/warehouse-balances', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT ws.productId, ws.warehouseId, ws.qty, p.code, p.barcode, p.name, p.unit, p.category,
        w.name AS warehouseName, w.branchId, b.name AS branchName
      FROM warehouse_stock ws
      JOIN products p ON p.id = ws.productId
      LEFT JOIN warehouses w ON w.id = ws.warehouseId
      LEFT JOIN branches b ON b.id = w.branchId
      WHERE ws.qty > 0 ORDER BY p.name, w.name`);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false }); }
});

// --- SEVKİYATLAR / ÇEKİ LİSTESİ ---
// Son 30 gündeki satışlar müşteri + gün bazında sevkiyat olarak gruplanır; çeki listesi tamamlananlar listeden düşer.
app.get('/api/shipments', async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const sales = await dbAll(`SELECT s.id, s.customerId, s.warehouseId, s.quantity, s.date, c.name AS customerName,
        p.id AS productId, p.code, p.barcode, p.name, p.unit
      FROM sales s JOIN products p ON p.id = s.productId LEFT JOIN customers c ON c.id = s.customerId
      WHERE s.type != 'iade' AND s.date >= ? ORDER BY s.date DESC`, [since]);
    const done = new Set((await dbAll(`SELECT shipmentKey FROM packing_lists`)).map((r) => r.shipmentKey));
    const map = new Map();
    sales.forEach((r) => {
      const key = r.customerId + '|' + r.date.slice(0, 10);
      if (done.has(key)) return;
      if (!map.has(key)) map.set(key, { key, customerId: r.customerId, customerName: r.customerName || r.customerId, date: r.date.slice(0, 10), items: [] });
      const g = map.get(key);
      const ex = g.items.find((i) => i.productId === r.productId);
      if (ex) ex.quantity += r.quantity;
      else g.items.push({ productId: r.productId, code: r.code, barcode: r.barcode, name: r.name, unit: r.unit, quantity: r.quantity });
    });
    res.json({ success: true, data: [...map.values()].slice(0, 30) });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/packing-lists', async (req, res) => {
  const { shipmentKey, customerId, customerName, items, createdBy } = req.body || {};
  if (!shipmentKey || !Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Eksik veri.' });
  try {
    const exists = await dbGet(`SELECT id FROM packing_lists WHERE shipmentKey = ?`, [shipmentKey]);
    if (exists) return res.status(400).json({ success: false, message: 'Bu sevkiyatın çeki listesi zaten tamamlanmış.' });
    const id = 'PL-' + Date.now();
    await dbRun(`INSERT INTO packing_lists (id, shipmentKey, customerId, customerName, date, items, createdBy) VALUES (?,?,?,?,?,?,?)`,
      [id, shipmentKey, customerId, customerName, new Date().toISOString(), JSON.stringify(items), createdBy || '']);
    res.json({ success: true, message: 'Çeki listesi kaydedildi.', data: { id } });
  } catch (e) { res.status(500).json({ success: false }); }
});

// ============ HATA İŞLEYİCİLERİ ============
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Bulunamadı' }));
app.use((err, req, res, _next) => {
  const bad = err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large' || err.status === 400 || err.status === 413);
  if (!bad) console.error('Beklenmeyen hata:', err && err.message);
  res.status(bad ? (err.status || 400) : 500).json({ success: false, message: bad ? 'Geçersiz istek.' : 'Sunucu hatası.' });
});

// ============ SERVER ============
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  financeApi.startReminders();
  console.log('Beykim Denizcilik Depo + Finans Backend çalışıyor: http://localhost:' + PORT);
});