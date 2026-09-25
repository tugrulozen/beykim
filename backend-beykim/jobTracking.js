/**
 * BEYKİM DENİZCİLİK - kullanıcı, rol ve yetki altyapısı (+ menüde kapalı İş Takip modülü)
 *
 * Beykim'de İş Takip menüsü kapalıdır; bu dosya kullanıcı / rol / yetki yönetimini (Finans › Yetkiler) ve
 * oturumdaki izin listesini sağlar. İş takip uçları yerinde durur (modül açılırsa hazır), ancak yalnız iş takibine
 * ait yetkiler Yetkiler ekranında gösterilmez (JT_ONLY).
 *
 * Yetkilendirme: kullanıcının rolü (jt_roles) izin listesi taşır; her uç ilgili izni ister.
 */

const PERMISSIONS = [
  ['jt.view', 'Uygulamaya giriş: ana sayfa, bildirimler, kendi profili'],
  ['jt.projects.manage', 'İş takip: proje oluştur / düzenle'],
  ['jt.orders.manage', 'İş takip: sipariş oluştur / düzenle'],
  ['jt.jobs.create', 'İş takip: iş oluştur'],
  ['jt.jobs.assign', 'İş takip: iş ata'],
  ['jt.jobs.update.any', 'İş takip: tüm işleri güncelle'],
  ['jt.jobs.update.own', 'İş takip: kendi işlerini güncelle'],
  ['jt.performance.all', 'İş takip: ekip performansı'],
  ['jt.performance.own', 'İş takip: kendi performansı'],
  ['jt.alerts.all', 'İş takip: tüm uyarılar'],
  ['jt.alerts.ack', 'İş takip: uyarı kapatma'],
  ['jt.users.manage', 'Kullanıcı, rol ve yetki yönetimi'],
  ['erp.read', 'Depo ve ERP verilerini görüntüle (stok, ambar, sevkiyat, satın alma, raporlar)'],
  ['erp.write', 'Gemiye sevkiyat, satın alma siparişi ve tedarikçi kaydı'],
  ['erp.stock', 'Ambar işlemleri: mal kabul, ambarlar arası transfer, sayım, stok düzeltme, barkod'],
  ['fin.view', 'Finans: navlun alacakları, krediler, çek/senet, takvim ve nakit akışını görüntüle'],
  ['fin.manage', 'Finans: tahsilat, ödeme, kredi taksiti ve çek/senet kaydı'],
];
/** Yalnız iş takip modülüne ait yetkiler: Beykim'de modül kapalı olduğundan Yetkiler ekranında gösterilmez */
const JT_ONLY = new Set(['jt.projects.manage', 'jt.orders.manage', 'jt.jobs.create', 'jt.jobs.assign', 'jt.jobs.update.any', 'jt.jobs.update.own',
  'jt.performance.all', 'jt.performance.own', 'jt.alerts.all', 'jt.alerts.ack']);

const VERSION = '2026.09.25-beykim';

// [id, ad, açıklama, yetkiler] — denizcilik depo / gemi ikmal operasyonuna göre
const ROLES = [
  ['admin', 'Yönetici', 'Tüm yetkiler', PERMISSIONS.map((p) => p[0])],
  ['manager', 'Teknik / Operasyon Müdürü', 'Filo teknik yönetimi; satın alma onayı, sevkiyat ve ambar işlemleri', ['jt.view', 'jt.alerts.all', 'jt.alerts.ack', 'jt.performance.all', 'erp.read', 'erp.write', 'erp.stock']],
  ['planner', 'Satın Alma & Planlama', 'Gemi taleplerinden satın alma siparişi hazırlar, tedarikçileri yönetir', ['jt.view', 'erp.read', 'erp.write']],
  ['supervisor', 'Depo Şefi', 'Ambar operasyonu: mal kabul, transfer, sayım denetimi ve sevkiyat', ['jt.view', 'erp.read', 'erp.write', 'erp.stock']],
  ['operator', 'Ambar Memuru', 'Mal kabul, ambarlar arası transfer, sayım ve barkod', ['jt.view', 'erp.read', 'erp.stock']],
  ['quality', 'HSEQ / Kalite', 'Tehlikeli madde (IMDG) ve emniyet malzemesi kontrolü; salt okuma', ['jt.view', 'erp.read']],
  ['logistics', 'Gemi İkmal & Sevkiyat', 'Gemilere sevkiyat, barkod / etiket, çeki listesi ve teslim limanı koordinasyonu', ['jt.view', 'erp.read', 'erp.write', 'erp.stock']],
  ['finance', 'Finans Sorumlusu', 'Navlun alacakları, kasa/banka, gemi finansmanı kredileri, çek/senet ve vade takibi', ['jt.view', 'erp.read', 'fin.view', 'fin.manage']],
  ['reviewer', 'İnceleme (salt okunur)', 'Sunum/inceleme hesabı: her ekranı görür, hiçbir kayıt ekleyemez, değiştiremez veya silemez', ['jt.view', 'jt.performance.all', 'jt.alerts.all', 'erp.read', 'fin.view']],
  ['viewer', 'Görüntüleyici', 'Salt okunur (ör. gemi süperintendenti)', ['jt.view', 'erp.read']],
];

// Operasyon süreçleri (İş Takip açılırsa kullanılır): [id, sıra, kod, ad, bölüm, standart gün, renk, ikon]
const PROCESSES = [
  ['PR1', 1, 'TALEP', 'Gemi Talebi & Onay', 'Teknik', 1, '#64748B', 'ph-clipboard-text'],
  ['PR2', 2, 'SATIN', 'Satın Alma & Tedarik', 'Satın Alma', 5, '#0EA5E9', 'ph-anchor'],
  ['PR3', 3, 'KABUL', 'Mal Kabul & Kontrol', 'Depo', 1, '#8B5CF6', 'ph-package'],
  ['PR4', 4, 'HAZIR', 'Ambar Hazırlık & Paketleme', 'Depo', 1, '#F97316', 'ph-stack'],
  ['PR5', 5, 'SEVK', 'Gemiye Sevkiyat', 'Sevkiyat', 1, '#2563EB', 'ph-boat'],
];

const JOB_STATUS = { planned: 'Planlandı', in_progress: 'Devam ediyor', blocked: 'Engelli', done: 'Tamamlandı', cancelled: 'İptal' };

function initSchema(run) {
  run(`CREATE TABLE IF NOT EXISTS jt_roles (id TEXT PRIMARY KEY, label TEXT, description TEXT, permissions TEXT)`);
  // Roller boş kaldıysa (ör. tohumlama atlandıysa) kimse yetkisiz kalmasın: eksik roller eklenir, var olanlara dokunulmaz
  ROLES.forEach(([id, label, desc, perms]) => run(`INSERT OR IGNORE INTO jt_roles (id, label, description, permissions) VALUES (?,?,?,?)`, [id, label, desc, JSON.stringify(perms)]));
  run(`CREATE TABLE IF NOT EXISTS jt_processes (id TEXT PRIMARY KEY, seq INTEGER, code TEXT, name TEXT, dept TEXT, stdDays REAL, color TEXT, icon TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS jt_projects (id TEXT PRIMARY KEY, code TEXT, name TEXT, customerId TEXT, customerName TEXT, managerId INTEGER,
    status TEXT, priority TEXT, startDate TEXT, dueDate TEXT, description TEXT, createdAt TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS jt_orders (id TEXT PRIMARY KEY, orderNo TEXT, projectId TEXT, customerId TEXT, customerName TEXT, orderDate TEXT, dueDate TEXT,
    status TEXT, priority TEXT, notes TEXT, createdBy INTEGER, createdAt TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS jt_order_lines (id TEXT PRIMARY KEY, orderId TEXT, productId TEXT, productName TEXT, qty REAL, unitPrice REAL)`);
  run(`CREATE TABLE IF NOT EXISTS jt_jobs (id TEXT PRIMARY KEY, jobNo TEXT, projectId TEXT, orderId TEXT, lineId TEXT, productId TEXT, productName TEXT,
    processId TEXT, title TEXT, assigneeId INTEGER, plannedQty REAL, doneQty REAL DEFAULT 0, scrapQty REAL DEFAULT 0,
    plannedStart TEXT, plannedEnd TEXT, actualStart TEXT, actualEnd TEXT, status TEXT, priority TEXT, blockedReason TEXT, notes TEXT,
    createdBy INTEGER, createdAt TEXT, updatedAt TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS jt_job_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, jobId TEXT, userId INTEGER, type TEXT, qty REAL, scrap REAL, note TEXT, createdAt TEXT)`);
  run(`CREATE TABLE IF NOT EXISTS jt_alert_acks (key TEXT PRIMARY KEY, userId INTEGER, at TEXT)`);
  run(`CREATE INDEX IF NOT EXISTS ix_jt_jobs_order ON jt_jobs(orderId)`);
  run(`CREATE INDEX IF NOT EXISTS ix_jt_jobs_assignee ON jt_jobs(assigneeId)`);
  run(`CREATE INDEX IF NOT EXISTS ix_jt_logs_job ON jt_job_logs(jobId)`);
}

// ---------- tarih yardımcıları ----------
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
/** 'YYYY-MM-DD' -> gün sonu (23:59:59) zaman damgası */
const endOfDay = (s) => new Date(`${s}T23:59:59`).getTime();
const DAY = 86400000;
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round1 = (n) => Math.round(n * 10) / 10;

module.exports = function mountJobTracking({ app, dbAll, dbGet, dbRun, sec, hashPassword }) {
  // ---------- yetki ----------
  const roleCache = { at: 0, map: new Map() };
  async function rolePerms(roleId) {
    if (Date.now() - roleCache.at > 15000) {
      const rows = await dbAll(`SELECT id, permissions FROM jt_roles`);
      roleCache.map = new Map(rows.map((r) => [r.id, JSON.parse(r.permissions || '[]')]));
      roleCache.at = Date.now();
    }
    if (roleId === 'admin') return PERMISSIONS.map((p) => p[0]); // yönetici: veritabanındaki satır eski/eksik olsa da tüm yetkiler
    return roleCache.map.get(roleId) || [];
  }
  const invalidateRoles = () => { roleCache.at = 0; };

  /** Her istekte kullanıcıyı ve izinlerini yükler (hesap kapatıldıysa jeton geçersiz sayılır) */
  async function loadUser(req, res, next) {
    try {
      if (req.path === '/auth/login' || req.path === '/auth/logout') return next();
      if (req.user && req.user.role === 'preview') { // panel önizlemesi: yalnızca okuma
        req.perms = ['jt.view', 'jt.performance.all', 'jt.alerts.all', 'erp.read'];
        req.me = { id: 0, name: 'Önizleme', role: 'viewer' };
        return next();
      }
      const u = req.user && req.user.uid ? await dbGet(`SELECT id, username, name, role, title, department, active FROM users WHERE id = ?`, [req.user.uid]) : null;
      if (!u || u.active === 0) return res.status(401).json({ success: false, message: 'Hesap devre dışı veya bulunamadı.' });
      req.me = u;
      req.perms = await rolePerms(u.role);
      next();
    } catch (e) { next(e); }
  }
  const can = (req, perm) => Array.isArray(req.perms) && req.perms.includes(perm);
  const need = (...perms) => (req, res, next) => (perms.some((p) => can(req, p)) ? next() : res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' }));

  // ERP uçları için izin kapısı: /api/jt dışındaki yollar
  const ERP_WRITE = /^\/(products|sales|purchase|purchase-orders|suppliers|packing-lists)/;
  const ERP_STOCK = /^\/(barcodes|stock-adjust|transfers|stock-count|production|vehicle-unload|raw-materials)/;
  async function erpGate(req, res, next) {
    if (req.path.startsWith('/auth/') || req.path.startsWith('/jt/') || req.path.startsWith('/notifications') || req.path.startsWith('/finance')) return next(); // /finance: yetkiyi finance.js kendisi denetler
    if (req.me && req.me.role === 'admin') return next();
    if (req.method === 'GET' || req.method === 'HEAD') return can(req, 'erp.read') ? next() : res.status(403).json({ success: false, message: 'Bu veriyi görme yetkiniz yok.' });
    if (req.path.startsWith('/copilot')) return can(req, 'erp.read') ? next() : res.status(403).json({ success: false, message: 'Yetkiniz yok.' });
    if (ERP_WRITE.test(req.path)) return can(req, 'erp.write') ? next() : res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    // Beykim: ambar işlemleri (mal kabul, transfer, sayım, stok düzeltme, barkod) yalnız ambar yetkisiyle yapılır
    if (ERP_STOCK.test(req.path)) return can(req, 'erp.stock') ? next() : res.status(403).json({ success: false, message: 'Bu işlem için ambar işlemleri yetkiniz yok.' });
    return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
  }
  app.use('/api', loadUser, erpGate);

  const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(`[jt ${req.method} ${req.path}]`, e.message); res.status(500).json({ success: false, message: 'Sunucu hatası.' }); });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  async function nextSeq(table, col, prefix) {
    const r = await dbGet(`SELECT COUNT(*) AS c FROM ${table}`);
    return `${prefix}${String((r.c || 0) + 1).padStart(4, '0')}`;
  }

  // ---------- ortak sorgular ----------
  /** İşe ait geciktirme bilgisi ekler */
  function decorateJob(j, now = Date.now()) {
    const end = endOfDay(j.plannedEnd);
    const open = j.status !== 'done' && j.status !== 'cancelled';
    j.progress = j.plannedQty > 0 ? Math.min(100, Math.round((j.doneQty / j.plannedQty) * 100)) : 0;
    j.overdue = open && now > end;
    j.overdueDays = j.overdue ? Math.max(1, Math.ceil((now - end) / DAY)) : 0;
    if (j.status === 'done' && j.actualEnd) {
      const late = new Date(j.actualEnd).getTime() - end;
      j.onTime = late <= 0;
      j.delayDays = late > 0 ? Math.ceil(late / DAY) : 0;
    }
    j.dueSoon = open && !j.overdue && end - now <= 2 * DAY;
    return j;
  }
  const JOB_SELECT = `SELECT j.*, p.name AS processName, p.seq AS processSeq, p.color AS processColor, p.icon AS processIcon,
      u.name AS assigneeName, pr.name AS projectName, pr.code AS projectCode, o.orderNo AS orderNo
    FROM jt_jobs j LEFT JOIN jt_processes p ON p.id = j.processId LEFT JOIN users u ON u.id = j.assigneeId
    LEFT JOIN jt_projects pr ON pr.id = j.projectId LEFT JOIN jt_orders o ON o.id = j.orderId`;

  /** Yalnızca kendi işlerini görebilen roller için filtre */
  function jobScope(req) {
    return can(req, 'jt.jobs.update.any') || can(req, 'jt.performance.all') || can(req, 'jt.jobs.assign') || req.me.role === 'viewer' || req.me.role === 'preview' ? '' : ` AND j.assigneeId = ${Number(req.me.id) || 0}`;
  }

  /** Siparişlere ERP'den gelen giden (sevk) miktarı, ürün stoğu ve üretim ilerlemesi eklenir */
  async function enrichOrders(orders) {
    if (!orders.length) return orders;
    const ids = orders.map((o) => o.id);
    const ph = ids.map(() => '?').join(',');
    const lines = await dbAll(`SELECT l.*, p.stock AS stock, p.unit AS unit, p.code AS productCode FROM jt_order_lines l LEFT JOIN products p ON p.id = l.productId WHERE l.orderId IN (${ph})`, ids);
    const shipped = await dbAll(`SELECT orderId, lineId, SUM(quantity) AS q, MAX(date) AS last FROM sales WHERE orderId IN (${ph}) AND type != 'iade' GROUP BY orderId, lineId`, ids);
    const jobs = await dbAll(`SELECT orderId, lineId, processId, status, plannedQty, doneQty, plannedEnd, actualEnd FROM jt_jobs WHERE orderId IN (${ph}) AND status != 'cancelled'`, ids);
    const now = Date.now();
    orders.forEach((o) => {
      o.lines = lines.filter((l) => l.orderId === o.id).map((l) => {
        const s = shipped.find((x) => x.orderId === o.id && x.lineId === l.id);
        l.shippedQty = s ? s.q : 0;
        l.lastShipment = s ? s.last : null;
        l.remaining = Math.max(0, l.qty - l.shippedQty);
        const lj = jobs.filter((j) => j.lineId === l.id);
        const done = lj.filter((j) => j.status === 'done').length;
        l.jobCount = lj.length; l.jobsDone = done;
        l.progress = lj.length ? Math.round(lj.reduce((s2, j) => s2 + (j.plannedQty ? Math.min(1, j.doneQty / j.plannedQty) : 0), 0) / lj.length * 100) : 0;
        return l;
      });
      o.orderedQty = o.lines.reduce((s, l) => s + l.qty, 0);
      o.shippedQty = o.lines.reduce((s, l) => s + Math.min(l.qty, l.shippedQty), 0);
      o.shippedPct = o.orderedQty ? Math.round((o.shippedQty / o.orderedQty) * 100) : 0;
      const oj = jobs.filter((j) => j.orderId === o.id);
      o.jobCount = oj.length;
      o.jobsDone = oj.filter((j) => j.status === 'done').length;
      o.progress = oj.length ? Math.round(oj.reduce((s, j) => s + (j.plannedQty ? Math.min(1, j.doneQty / j.plannedQty) : 0), 0) / oj.length * 100) : 0;
      o.lateJobs = oj.filter((j) => j.status !== 'done' && now > endOfDay(j.plannedEnd)).length;
      o.totalValue = o.lines.reduce((s, l) => s + l.qty * (l.unitPrice || 0), 0);
      const dueLate = o.status !== 'cancelled' && o.shippedPct < 100 && now > endOfDay(o.dueDate);
      o.overdue = dueLate;
      o.overdueDays = dueLate ? Math.ceil((now - endOfDay(o.dueDate)) / DAY) : 0;
      o.state = o.status === 'cancelled' ? 'cancelled' : o.shippedPct >= 100 ? 'shipped' : o.shippedQty > 0 ? 'partially_shipped' : oj.some((j) => j.doneQty > 0) ? 'in_production' : 'open';
    });
    return orders;
  }
  const ORDER_SELECT = `SELECT o.*, pr.name AS projectName, pr.code AS projectCode FROM jt_orders o LEFT JOIN jt_projects pr ON pr.id = o.projectId`;

  // ---------- /jt/me , /jt/meta ----------
  app.get('/api/jt/me', need('jt.view'), wrap(async (req, res) => {
    const role = await dbGet(`SELECT id, label FROM jt_roles WHERE id = ?`, [req.me.role]);
    res.json({ success: true, data: { user: { ...req.me, roleLabel: role ? role.label : req.me.role }, permissions: req.perms } });
  }));

  app.get('/api/jt/meta', need('jt.view'), wrap(async (req, res) => {
    const processes = await dbAll(`SELECT * FROM jt_processes ORDER BY seq`);
    const users = await dbAll(`SELECT u.id, u.name, u.role, u.title, u.department, u.active, r.label AS roleLabel FROM users u LEFT JOIN jt_roles r ON r.id = u.role WHERE u.active != 0 ORDER BY u.name`);
    const customers = await dbAll(`SELECT id, name FROM customers ORDER BY name`);
    const products = await dbAll(`SELECT id, code, name, unit, stock, price, category FROM products ORDER BY name`);
    res.json({ success: true, data: { processes, users, customers, products, jobStatus: JOB_STATUS } });
  }));

  // ---------- Panel özeti ----------
  app.get('/api/jt/dashboard', need('jt.view'), wrap(async (req, res) => {
    const now = Date.now();
    const scope = jobScope(req);
    const jobs = (await dbAll(`${JOB_SELECT} WHERE j.status != 'cancelled' ${scope}`)).map((j) => decorateJob(j, now));
    const orders = await enrichOrders(await dbAll(`${ORDER_SELECT} WHERE o.status != 'cancelled'`));
    const openOrders = orders.filter((o) => o.state !== 'shipped');
    const done = jobs.filter((j) => j.status === 'done');
    const since = now - 90 * DAY;
    const recentDone = done.filter((j) => j.actualEnd && new Date(j.actualEnd).getTime() >= since);
    const onTimePct = recentDone.length ? Math.round((recentDone.filter((j) => j.onTime).length / recentDone.length) * 100) : null;
    const processes = await dbAll(`SELECT * FROM jt_processes ORDER BY seq`);
    const byProcess = processes.map((p) => {
      const pj = jobs.filter((j) => j.processId === p.id);
      const open = pj.filter((j) => j.status !== 'done');
      return {
        id: p.id, name: p.name, color: p.color, icon: p.icon, seq: p.seq,
        planned: pj.filter((j) => j.status === 'planned').length,
        inProgress: pj.filter((j) => j.status === 'in_progress').length,
        blocked: pj.filter((j) => j.status === 'blocked').length,
        done: pj.filter((j) => j.status === 'done').length,
        overdue: open.filter((j) => j.overdue).length,
        openQty: Math.round(open.reduce((s, j) => s + Math.max(0, j.plannedQty - j.doneQty), 0)),
      };
    });
    // Son 8 hafta: zamanında / geç tamamlanan iş sayısı
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const to = now - i * 7 * DAY, from = to - 7 * DAY;
      const wj = done.filter((j) => j.actualEnd && new Date(j.actualEnd).getTime() > from && new Date(j.actualEnd).getTime() <= to);
      weeks.push({ label: ymd(new Date(to)).slice(5), onTime: wj.filter((j) => j.onTime).length, late: wj.filter((j) => !j.onTime).length });
    }
    const alerts = await computeAlerts(req);
    res.json({ success: true, data: {
      kpi: {
        openOrders: openOrders.length,
        orderedQty: Math.round(openOrders.reduce((s, o) => s + o.orderedQty, 0)),
        shippedQty: Math.round(openOrders.reduce((s, o) => s + o.shippedQty, 0)),
        activeJobs: jobs.filter((j) => j.status === 'in_progress' || j.status === 'blocked').length,
        plannedJobs: jobs.filter((j) => j.status === 'planned').length,
        overdueJobs: jobs.filter((j) => j.overdue).length,
        blockedJobs: jobs.filter((j) => j.status === 'blocked').length,
        completedJobs: done.length,
        onTimePct,
        overdueOrders: orders.filter((o) => o.overdue).length,
        activeProjects: (await dbGet(`SELECT COUNT(*) AS c FROM jt_projects WHERE status = 'active'`)).c,
      },
      byProcess, weeks,
      alertCounts: { critical: alerts.filter((a) => a.severity === 'critical').length, warning: alerts.filter((a) => a.severity === 'warning').length, info: alerts.filter((a) => a.severity === 'info').length },
      alerts: alerts.slice(0, 6),
      attention: openOrders.filter((o) => o.overdue || o.lateJobs > 0).sort((a, b) => b.overdueDays - a.overdueDays || b.lateJobs - a.lateJobs).slice(0, 5).map((o) => ({ id: o.id, orderNo: o.orderNo, customerName: o.customerName, dueDate: o.dueDate, overdueDays: o.overdueDays, lateJobs: o.lateJobs, shippedPct: o.shippedPct, progress: o.progress })),
    } });
  }));

  // ---------- Projeler ----------
  app.get('/api/jt/projects', need('jt.view'), wrap(async (_req, res) => {
    const projects = await dbAll(`SELECT pr.*, u.name AS managerName, u.title AS managerTitle FROM jt_projects pr LEFT JOIN users u ON u.id = pr.managerId ORDER BY CASE pr.status WHEN 'active' THEN 0 WHEN 'planned' THEN 1 WHEN 'on_hold' THEN 2 ELSE 3 END, pr.dueDate`);
    const orders = await enrichOrders(await dbAll(`${ORDER_SELECT} WHERE o.status != 'cancelled'`));
    const jobs = (await dbAll(`SELECT projectId, status, plannedEnd, actualEnd, plannedQty, doneQty FROM jt_jobs WHERE status != 'cancelled'`));
    const now = Date.now();
    projects.forEach((p) => {
      const po = orders.filter((o) => o.projectId === p.id);
      const pj = jobs.filter((j) => j.projectId === p.id);
      p.orderCount = po.length;
      p.orderedQty = po.reduce((s, o) => s + o.orderedQty, 0);
      p.shippedQty = po.reduce((s, o) => s + o.shippedQty, 0);
      p.jobCount = pj.length;
      p.jobsDone = pj.filter((j) => j.status === 'done').length;
      p.lateJobs = pj.filter((j) => j.status !== 'done' && now > endOfDay(j.plannedEnd)).length;
      p.progress = pj.length ? Math.round(pj.reduce((s, j) => s + (j.plannedQty ? Math.min(1, j.doneQty / j.plannedQty) : 0), 0) / pj.length * 100) : 0;
      p.overdue = p.status === 'active' && now > endOfDay(p.dueDate) && p.progress < 100;
      const dn = pj.filter((j) => j.status === 'done');
      p.onTimePct = dn.length ? Math.round((dn.filter((j) => j.actualEnd && new Date(j.actualEnd).getTime() <= endOfDay(j.plannedEnd)).length / dn.length) * 100) : null;
    });
    res.json({ success: true, data: projects });
  }));

  app.get('/api/jt/projects/:id', need('jt.view'), wrap(async (req, res) => {
    const p = await dbGet(`SELECT pr.*, u.name AS managerName, u.title AS managerTitle, u.phone AS managerPhone, u.email AS managerEmail FROM jt_projects pr LEFT JOIN users u ON u.id = pr.managerId WHERE pr.id = ?`, [req.params.id]);
    if (!p) return res.status(404).json({ success: false, message: 'Proje bulunamadı' });
    const now = Date.now();
    p.orders = await enrichOrders(await dbAll(`${ORDER_SELECT} WHERE o.projectId = ? ORDER BY o.dueDate`, [p.id]));
    p.jobs = (await dbAll(`${JOB_SELECT} WHERE j.projectId = ? AND j.status != 'cancelled' ${jobScope(req)} ORDER BY p.seq, j.plannedEnd`, [p.id])).map((j) => decorateJob(j, now));
    const processes = await dbAll(`SELECT * FROM jt_processes ORDER BY seq`);
    p.byProcess = processes.map((pr) => {
      const pj = p.jobs.filter((j) => j.processId === pr.id);
      return { id: pr.id, name: pr.name, color: pr.color, total: pj.length, done: pj.filter((j) => j.status === 'done').length, late: pj.filter((j) => j.overdue).length,
        progress: pj.length ? Math.round(pj.reduce((s, j) => s + Math.min(1, j.plannedQty ? j.doneQty / j.plannedQty : 0), 0) / pj.length * 100) : 0 };
    }).filter((x) => x.total > 0);
    const team = {};
    p.jobs.forEach((j) => {
      if (!j.assigneeId) return;
      const m = (team[j.assigneeId] ||= { id: j.assigneeId, name: j.assigneeName, jobs: 0, done: 0, late: 0 });
      m.jobs++;
      if (j.status === 'done') m.done++;
      if (j.overdue) m.late++;
    });
    p.team = Object.values(team);
    p.orderedQty = p.orders.reduce((s, o) => s + o.orderedQty, 0);
    p.shippedQty = p.orders.reduce((s, o) => s + o.shippedQty, 0);
    res.json({ success: true, data: p });
  }));

  const validDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
  const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

  app.post('/api/jt/projects', need('jt.projects.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    if (!b.name || !validDate(b.startDate) || !validDate(b.dueDate) || b.dueDate < b.startDate) return res.status(400).json({ success: false, message: 'Proje adı ve geçerli başlangıç/bitiş tarihi gerekli.' });
    const mgr = b.managerId ? await dbGet(`SELECT id FROM users WHERE id = ? AND active != 0`, [Number(b.managerId)]) : null;
    if (b.managerId && !mgr) return res.status(400).json({ success: false, message: 'Proje sorumlusu bulunamadı.' });
    const cust = b.customerId ? await dbGet(`SELECT id, name FROM customers WHERE id = ?`, [b.customerId]) : null;
    const id = 'PRJ-' + uid();
    const code = await nextSeq('jt_projects', 'code', 'PRJ-');
    await dbRun(`INSERT INTO jt_projects (id, code, name, customerId, customerName, managerId, status, priority, startDate, dueDate, description, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, code, b.name, cust ? cust.id : null, cust ? cust.name : b.customerName || '', mgr ? mgr.id : null, 'active', PRIORITIES.includes(b.priority) ? b.priority : 'medium', b.startDate, b.dueDate, b.description || '', new Date().toISOString()]);
    res.json({ success: true, message: 'Proje oluşturuldu.', data: { id } });
  }));

  app.put('/api/jt/projects/:id', need('jt.projects.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    const p = await dbGet(`SELECT * FROM jt_projects WHERE id = ?`, [req.params.id]);
    if (!p) return res.status(404).json({ success: false, message: 'Proje bulunamadı' });
    const managerId = b.managerId === undefined ? p.managerId : Number(b.managerId) || null;
    if (managerId && !(await dbGet(`SELECT id FROM users WHERE id = ? AND active != 0`, [managerId]))) return res.status(400).json({ success: false, message: 'Proje sorumlusu bulunamadı.' });
    const status = ['active', 'planned', 'on_hold', 'completed', 'cancelled'].includes(b.status) ? b.status : p.status;
    const dueDate = validDate(b.dueDate) ? b.dueDate : p.dueDate;
    await dbRun(`UPDATE jt_projects SET name = ?, managerId = ?, status = ?, priority = ?, dueDate = ?, description = ? WHERE id = ?`,
      [b.name || p.name, managerId, status, PRIORITIES.includes(b.priority) ? b.priority : p.priority, dueDate, b.description ?? p.description, p.id]);
    res.json({ success: true, message: 'Proje güncellendi.' });
  }));

  // ---------- Siparişler ----------
  app.get('/api/jt/orders', need('jt.view'), wrap(async (req, res) => {
    const where = req.query.projectId ? ` WHERE o.projectId = ?` : '';
    const orders = await enrichOrders(await dbAll(`${ORDER_SELECT}${where} ORDER BY o.dueDate DESC`, req.query.projectId ? [String(req.query.projectId)] : []));
    res.json({ success: true, data: orders });
  }));

  app.get('/api/jt/orders/:id', need('jt.view'), wrap(async (req, res) => {
    const [o] = await enrichOrders(await dbAll(`${ORDER_SELECT} WHERE o.id = ?`, [req.params.id]));
    if (!o) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    const now = Date.now();
    o.jobs = (await dbAll(`${JOB_SELECT} WHERE j.orderId = ? AND j.status != 'cancelled' ${jobScope(req)} ORDER BY j.lineId, p.seq`, [o.id])).map((j) => decorateJob(j, now));
    o.shipments = await dbAll(`SELECT s.id, s.date, s.quantity, s.lineId, p.name AS productName FROM sales s LEFT JOIN products p ON p.id = s.productId WHERE s.orderId = ? ORDER BY s.date DESC LIMIT 50`, [o.id]);
    // ERP bağlantısı: hammadde yeterliliği (reçete x kalan miktar)
    for (const l of o.lines) {
      const mats = await dbAll(`SELECT rm.id, rm.name, rm.unit, rm.stock, ri.quantity AS perUnit FROM recipes r JOIN recipe_items ri ON ri.recipeId = r.id JOIN raw_materials rm ON rm.id = ri.rawMaterialId WHERE r.productId = ?`, [l.productId]);
      const need = l.jobCount && l.progress < 100 ? Math.max(0, l.qty - l.shippedQty) : 0;
      l.materials = mats.map((m) => ({ name: m.name, unit: m.unit, stock: m.stock, required: round1(m.perUnit * need), short: m.stock < m.perUnit * need }));
      l.materialShort = l.materials.some((m) => m.short);
    }
    res.json({ success: true, data: o });
  }));

  app.post('/api/jt/orders', need('jt.orders.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    const lines = Array.isArray(b.lines) ? b.lines : [];
    if (!validDate(b.orderDate) || !validDate(b.dueDate) || b.dueDate < b.orderDate || !b.customerId || !lines.length || lines.length > 100
      || lines.some((l) => !l.productId || !(Number(l.qty) > 0) || Number(l.qty) > 1e7)) {
      return res.status(400).json({ success: false, message: 'Müşteri, tarihler ve en az bir geçerli kalem gerekli.' });
    }
    const cust = await dbGet(`SELECT id, name FROM customers WHERE id = ?`, [b.customerId]);
    if (!cust) return res.status(400).json({ success: false, message: 'Müşteri bulunamadı.' });
    if (b.projectId && !(await dbGet(`SELECT id FROM jt_projects WHERE id = ?`, [b.projectId]))) return res.status(400).json({ success: false, message: 'Proje bulunamadı.' });
    const id = 'ORD-' + uid();
    const orderNo = `SIP-${new Date().getFullYear()}-${String(((await dbGet(`SELECT COUNT(*) AS c FROM jt_orders`)).c || 0) + 1).padStart(3, '0')}`;
    await dbRun('BEGIN TRANSACTION');
    try {
      await dbRun(`INSERT INTO jt_orders (id, orderNo, projectId, customerId, customerName, orderDate, dueDate, status, priority, notes, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, orderNo, b.projectId || null, cust.id, cust.name, b.orderDate, b.dueDate, 'active', PRIORITIES.includes(b.priority) ? b.priority : 'medium', b.notes || '', req.me.id, new Date().toISOString()]);
      let i = 0;
      for (const l of lines) {
        const prod = await dbGet(`SELECT id, name, price FROM products WHERE id = ?`, [l.productId]);
        if (!prod) throw new Error('Ürün bulunamadı: ' + l.productId);
        await dbRun(`INSERT INTO jt_order_lines (id, orderId, productId, productName, qty, unitPrice) VALUES (?,?,?,?,?,?)`, [`${id}-L${++i}`, id, prod.id, prod.name, Number(l.qty), Number(l.unitPrice) >= 0 ? Number(l.unitPrice) : prod.price]);
      }
      await dbRun('COMMIT');
    } catch (e) { try { await dbRun('ROLLBACK'); } catch (_) { /* */ } return res.status(400).json({ success: false, message: 'Sipariş kaydedilemedi: ' + String(e.message).slice(0, 80) }); }
    res.json({ success: true, message: 'Sipariş oluşturuldu.', data: { id, orderNo } });
  }));

  app.post('/api/jt/orders/:id/cancel', need('jt.orders.manage'), wrap(async (req, res) => {
    const r = await dbRun(`UPDATE jt_orders SET status = 'cancelled' WHERE id = ? AND status != 'cancelled'`, [req.params.id]);
    if (!r.changes) return res.status(400).json({ success: false, message: 'Sipariş iptal edilemedi.' });
    await dbRun(`UPDATE jt_jobs SET status = 'cancelled', updatedAt = ? WHERE orderId = ? AND status != 'done'`, [new Date().toISOString(), req.params.id]);
    res.json({ success: true, message: 'Sipariş iptal edildi.' });
  }));

  // ---------- İşler ----------
  app.get('/api/jt/jobs', need('jt.view'), wrap(async (req, res) => {
    const q = req.query; const where = [`j.status != 'cancelled'`]; const params = [];
    if (q.status && JOB_STATUS[q.status]) { where.push('j.status = ?'); params.push(q.status); }
    if (q.processId) { where.push('j.processId = ?'); params.push(String(q.processId)); }
    if (q.projectId) { where.push('j.projectId = ?'); params.push(String(q.projectId)); }
    if (q.orderId) { where.push('j.orderId = ?'); params.push(String(q.orderId)); }
    if (q.assigneeId === 'me') { where.push('j.assigneeId = ?'); params.push(Number(req.me.id) || 0); } else if (q.assigneeId) { where.push('j.assigneeId = ?'); params.push(Number(q.assigneeId) || 0); }
    if (q.open === '1') where.push(`j.status IN ('planned','in_progress','blocked')`);
    const now = Date.now();
    let jobs = (await dbAll(`${JOB_SELECT} WHERE ${where.join(' AND ')} ${jobScope(req)} ORDER BY j.plannedEnd LIMIT 800`, params)).map((j) => decorateJob(j, now));
    if (q.late === '1') jobs = jobs.filter((j) => j.overdue);
    res.json({ success: true, data: jobs });
  }));

  app.get('/api/jt/jobs/:id', need('jt.view'), wrap(async (req, res) => {
    const j = await dbGet(`${JOB_SELECT} WHERE j.id = ?`, [req.params.id]);
    if (!j) return res.status(404).json({ success: false, message: 'İş bulunamadı' });
    if (jobScope(req) && j.assigneeId !== req.me.id) return res.status(403).json({ success: false, message: 'Bu işi görme yetkiniz yok.' });
    decorateJob(j);
    j.logs = await dbAll(`SELECT l.*, u.name AS userName FROM jt_job_logs l LEFT JOIN users u ON u.id = l.userId WHERE l.jobId = ? ORDER BY l.createdAt DESC, l.id DESC LIMIT 100`, [j.id]);
    j.product = j.productId ? await dbGet(`SELECT id, code, name, stock, unit FROM products WHERE id = ?`, [j.productId]) : null;
    res.json({ success: true, data: j });
  }));

  const canEditJob = (req, j) => can(req, 'jt.jobs.update.any') || (can(req, 'jt.jobs.update.own') && j.assigneeId === req.me.id);
  const addLog = (jobId, userId, type, qty, scrap, note) => dbRun(`INSERT INTO jt_job_logs (jobId, userId, type, qty, scrap, note, createdAt) VALUES (?,?,?,?,?,?,?)`, [jobId, userId, type, qty || 0, scrap || 0, String(note || '').slice(0, 500), new Date().toISOString()]);

  app.post('/api/jt/jobs', need('jt.jobs.create'), wrap(async (req, res) => {
    const b = req.body || {};
    const proc = await dbGet(`SELECT * FROM jt_processes WHERE id = ?`, [b.processId]);
    const qty = Number(b.plannedQty);
    if (!proc || !(qty > 0) || qty > 1e7 || !validDate(b.plannedStart) || !validDate(b.plannedEnd) || b.plannedEnd < b.plannedStart) return res.status(400).json({ success: false, message: 'Süreç, miktar ve geçerli tarih aralığı gerekli.' });
    const order = b.orderId ? await dbGet(`SELECT * FROM jt_orders WHERE id = ?`, [b.orderId]) : null;
    if (b.orderId && !order) return res.status(400).json({ success: false, message: 'Sipariş bulunamadı.' });
    const line = order && b.lineId ? await dbGet(`SELECT * FROM jt_order_lines WHERE id = ? AND orderId = ?`, [b.lineId, order.id]) : null;
    const assignee = b.assigneeId ? await dbGet(`SELECT id FROM users WHERE id = ? AND active != 0`, [Number(b.assigneeId)]) : null;
    if (b.assigneeId && !assignee) return res.status(400).json({ success: false, message: 'Atanacak kullanıcı bulunamadı.' });
    if (assignee && !can(req, 'jt.jobs.assign')) return res.status(403).json({ success: false, message: 'İş atama yetkiniz yok.' });
    const id = 'JOB-' + uid();
    const jobNo = await nextSeq('jt_jobs', 'jobNo', 'IS-');
    const title = String(b.title || `${proc.name}${line ? ' — ' + line.productName : ''}`).slice(0, 160);
    await dbRun(`INSERT INTO jt_jobs (id, jobNo, projectId, orderId, lineId, productId, productName, processId, title, assigneeId, plannedQty, doneQty, scrapQty, plannedStart, plannedEnd, status, priority, notes, createdBy, createdAt, updatedAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,?,?,?,?,?,?,?,?)`,
      [id, jobNo, order ? order.projectId : b.projectId || null, order ? order.id : null, line ? line.id : null, line ? line.productId : null, line ? line.productName : '', proc.id, title,
        assignee ? assignee.id : null, qty, b.plannedStart, b.plannedEnd, 'planned', PRIORITIES.includes(b.priority) ? b.priority : 'medium', b.notes || '', req.me.id, new Date().toISOString(), new Date().toISOString()]);
    await addLog(id, req.me.id, 'status', 0, 0, 'İş oluşturuldu');
    res.json({ success: true, message: 'İş oluşturuldu.', data: { id, jobNo } });
  }));

  app.post('/api/jt/jobs/:id/assign', need('jt.jobs.assign'), wrap(async (req, res) => {
    const j = await dbGet(`SELECT * FROM jt_jobs WHERE id = ?`, [req.params.id]);
    const a = await dbGet(`SELECT id, name FROM users WHERE id = ? AND active != 0`, [Number((req.body || {}).userId)]);
    if (!j || !a) return res.status(400).json({ success: false, message: 'İş veya kullanıcı bulunamadı.' });
    await dbRun(`UPDATE jt_jobs SET assigneeId = ?, updatedAt = ? WHERE id = ?`, [a.id, new Date().toISOString(), j.id]);
    await addLog(j.id, req.me.id, 'assign', 0, 0, `${a.name} kişisine atandı`);
    res.json({ success: true, message: 'İş atandı.' });
  }));

  /** İlerleme girişi: yapılan adet (+ fire). Tamamlanınca otomatik kapanır, sipariş son süreçteyse sevk için ERP'ye aktarılabilir. */
  app.post('/api/jt/jobs/:id/progress', need('jt.jobs.update.own', 'jt.jobs.update.any'), wrap(async (req, res) => {
    const j = await dbGet(`SELECT * FROM jt_jobs WHERE id = ?`, [req.params.id]);
    if (!j) return res.status(404).json({ success: false, message: 'İş bulunamadı' });
    if (!canEditJob(req, j)) return res.status(403).json({ success: false, message: 'Bu işi güncelleme yetkiniz yok.' });
    if (j.status === 'done' || j.status === 'cancelled') return res.status(400).json({ success: false, message: 'Tamamlanmış veya iptal edilmiş iş güncellenemez.' });
    const qty = Number((req.body || {}).qty), scrap = Number((req.body || {}).scrap || 0);
    if (!(qty > 0) || qty > 1e7 || !(scrap >= 0) || scrap > qty) return res.status(400).json({ success: false, message: 'Geçerli bir adet girin (fire adetten büyük olamaz).' });
    const nowIso = new Date().toISOString();
    const done = Math.min(j.plannedQty, (j.doneQty || 0) + qty);
    const finished = done >= j.plannedQty;
    await dbRun(`UPDATE jt_jobs SET doneQty = ?, scrapQty = scrapQty + ?, status = ?, actualStart = COALESCE(actualStart, ?), actualEnd = ?, blockedReason = NULL, updatedAt = ? WHERE id = ?`,
      [done, scrap, finished ? 'done' : 'in_progress', nowIso, finished ? nowIso : null, nowIso, j.id]);
    await addLog(j.id, req.me.id, 'progress', qty, scrap, (req.body || {}).note);
    res.json({ success: true, message: finished ? 'İş tamamlandı.' : 'İlerleme kaydedildi.', data: { doneQty: done, status: finished ? 'done' : 'in_progress' } });
  }));

  app.post('/api/jt/jobs/:id/status', need('jt.jobs.update.own', 'jt.jobs.update.any'), wrap(async (req, res) => {
    const j = await dbGet(`SELECT * FROM jt_jobs WHERE id = ?`, [req.params.id]);
    const { status, note } = req.body || {};
    if (!j) return res.status(404).json({ success: false, message: 'İş bulunamadı' });
    if (!canEditJob(req, j)) return res.status(403).json({ success: false, message: 'Bu işi güncelleme yetkiniz yok.' });
    if (!['planned', 'in_progress', 'blocked', 'done', 'cancelled'].includes(status)) return res.status(400).json({ success: false, message: 'Geçersiz durum.' });
    if ((status === 'cancelled' || status === 'planned') && !can(req, 'jt.jobs.update.any')) return res.status(403).json({ success: false, message: 'Bu durumu ayarlama yetkiniz yok.' });
    if (status === 'blocked' && !String(note || '').trim()) return res.status(400).json({ success: false, message: 'Engel nedenini yazın.' });
    const nowIso = new Date().toISOString();
    await dbRun(`UPDATE jt_jobs SET status = ?, actualStart = CASE WHEN ? IN ('in_progress','done') THEN COALESCE(actualStart, ?) ELSE actualStart END,
      actualEnd = CASE WHEN ? = 'done' THEN ? ELSE NULL END, doneQty = CASE WHEN ? = 'done' THEN plannedQty ELSE doneQty END,
      blockedReason = CASE WHEN ? = 'blocked' THEN ? ELSE NULL END, updatedAt = ? WHERE id = ?`,
      [status, status, nowIso, status, nowIso, status, status, String(note || '').slice(0, 300), nowIso, j.id]);
    await addLog(j.id, req.me.id, 'status', 0, 0, `${JOB_STATUS[status]}${note ? ': ' + note : ''}`);
    res.json({ success: true, message: 'Durum güncellendi.' });
  }));

  app.post('/api/jt/jobs/:id/comment', need('jt.view'), wrap(async (req, res) => {
    const j = await dbGet(`SELECT id, assigneeId FROM jt_jobs WHERE id = ?`, [req.params.id]);
    const note = String((req.body || {}).note || '').trim();
    if (!j || !note) return res.status(400).json({ success: false, message: 'Not boş olamaz.' });
    if (jobScope(req) && j.assigneeId !== req.me.id) return res.status(403).json({ success: false, message: 'Yetkiniz yok.' });
    await addLog(j.id, req.me.id, 'comment', 0, 0, note);
    res.json({ success: true });
  }));

  // ---------- Performans ----------
  /** Kişi bazlı performans: süre içinde tamamlanan işler üzerinden */
  async function performanceRows(fromMs, toMs, onlyUserId) {
    const users = await dbAll(`SELECT u.id, u.name, u.title, u.department, u.role, r.label AS roleLabel FROM users u LEFT JOIN jt_roles r ON r.id = u.role WHERE u.active != 0 ${onlyUserId ? 'AND u.id = ' + Number(onlyUserId) : ''}`);
    const jobs = await dbAll(`SELECT id, assigneeId, processId, status, plannedQty, doneQty, scrapQty, plannedStart, plannedEnd, actualStart, actualEnd FROM jt_jobs WHERE assigneeId IS NOT NULL AND status != 'cancelled'`);
    const now = Date.now();
    const rows = users.map((u) => {
      const mine = jobs.filter((j) => j.assigneeId === u.id);
      const doneIn = mine.filter((j) => j.status === 'done' && j.actualEnd && new Date(j.actualEnd).getTime() >= fromMs && new Date(j.actualEnd).getTime() <= toMs);
      const onTime = doneIn.filter((j) => new Date(j.actualEnd).getTime() <= endOfDay(j.plannedEnd));
      const late = doneIn.length - onTime.length;
      const delayDays = doneIn.filter((j) => new Date(j.actualEnd).getTime() > endOfDay(j.plannedEnd)).map((j) => (new Date(j.actualEnd).getTime() - endOfDay(j.plannedEnd)) / DAY);
      const open = mine.filter((j) => j.status !== 'done');
      const overdue = open.filter((j) => now > endOfDay(j.plannedEnd));
      const produced = doneIn.reduce((s, j) => s + j.doneQty, 0);
      const scrap = doneIn.reduce((s, j) => s + (j.scrapQty || 0), 0);
      const durations = doneIn.filter((j) => j.actualStart).map((j) => (new Date(j.actualEnd) - new Date(j.actualStart)) / DAY);
      const onTimePct = doneIn.length ? Math.round((onTime.length / doneIn.length) * 100) : null;
      const scrapPct = produced + scrap > 0 ? round1((scrap / (produced + scrap)) * 100) : 0;
      // Skor: zamanında tamamlama %60, düşük fire %20, gecikmiş açık iş yükü %20
      const score = doneIn.length || open.length ? Math.max(0, Math.min(100, Math.round(
        (onTimePct == null ? 70 : onTimePct) * 0.6 + Math.max(0, 100 - scrapPct * 20) * 0.2 + Math.max(0, 100 - overdue.length * 25) * 0.2))) : null;
      return {
        id: u.id, name: u.name, title: u.title, department: u.department, role: u.role, roleLabel: u.roleLabel,
        assigned: mine.length, completed: doneIn.length, onTime: onTime.length, late, onTimePct,
        avgDelayDays: delayDays.length ? round1(delayDays.reduce((a, b) => a + b, 0) / delayDays.length) : 0,
        openJobs: open.length, overdueJobs: overdue.length, producedQty: Math.round(produced), scrapQty: Math.round(scrap), scrapPct,
        avgJobDays: durations.length ? round1(durations.reduce((a, b) => a + b, 0) / durations.length) : null, score,
      };
    });
    return rows;
  }
  const rangeOf = (q) => {
    const days = Math.min(365, Math.max(7, Number(q.days) || 90));
    return { fromMs: Date.now() - days * DAY, toMs: Date.now(), days };
  };

  app.get('/api/jt/performance', need('jt.performance.all', 'jt.performance.own'), wrap(async (req, res) => {
    const { fromMs, toMs, days } = rangeOf(req.query);
    const all = can(req, 'jt.performance.all');
    const rows = (await performanceRows(fromMs, toMs, all ? null : req.me.id)).filter((r) => r.assigned > 0 || r.completed > 0);
    rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    const total = rows.reduce((t, r) => ({ completed: t.completed + r.completed, onTime: t.onTime + r.onTime }), { completed: 0, onTime: 0 });
    res.json({ success: true, data: { days, rows, summary: { completed: total.completed, onTimePct: total.completed ? Math.round((total.onTime / total.completed) * 100) : null, people: rows.length } } });
  }));

  app.get('/api/jt/performance/:userId', need('jt.performance.all', 'jt.performance.own'), wrap(async (req, res) => {
    const userId = Number(req.params.userId);
    if (!can(req, 'jt.performance.all') && userId !== req.me.id) return res.status(403).json({ success: false, message: 'Yalnızca kendi performansınızı görebilirsiniz.' });
    const { fromMs, toMs, days } = rangeOf(req.query);
    const [row] = await performanceRows(fromMs, toMs, userId);
    if (!row) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    const jobs = await dbAll(`${JOB_SELECT} WHERE j.assigneeId = ? AND j.status != 'cancelled' ORDER BY j.plannedEnd DESC LIMIT 60`, [userId]);
    const now = Date.now();
    jobs.forEach((j) => decorateJob(j, now));
    // Aylık trend (son 6 ay)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const mj = jobs.filter((j) => j.status === 'done' && j.actualEnd && j.actualEnd.slice(0, 7) === key);
      monthly.push({ month: key, done: mj.length, onTime: mj.filter((j) => j.onTime).length });
    }
    const byProcess = Object.values(jobs.filter((j) => j.status === 'done').reduce((m, j) => { const k = j.processName; (m[k] ||= { name: k, done: 0, onTime: 0 }); m[k].done++; if (j.onTime) m[k].onTime++; return m; }, {}));
    res.json({ success: true, data: { ...row, days, monthly, byProcess, jobs: jobs.slice(0, 25) } });
  }));

  // ---------- Uyarılar (gecikme vb.) ----------
  async function computeAlerts(req) {
    const now = Date.now();
    const all = can(req, 'jt.alerts.all');
    const mine = Number(req.me.id) || 0;
    let jobs = (await dbAll(`${JOB_SELECT} WHERE j.status IN ('planned','in_progress','blocked') AND COALESCE(pr.status, 'active') IN ('active','planned')`)).map((j) => decorateJob(j, now));
    // Aynı sipariş kaleminde art arda geciken süreçlerde yalnızca ilki (kök neden) uyarı üretir; diğerleri onun sayısına eklenir
    const rootOverdue = new Map();
    jobs.filter((j) => j.overdue).sort((a, b) => a.processSeq - b.processSeq).forEach((j) => {
      const k = j.lineId || j.id;
      if (!rootOverdue.has(k)) rootOverdue.set(k, { root: j, downstream: 0 }); else rootOverdue.get(k).downstream++;
    });
    jobs = jobs.filter((j) => !j.overdue || (rootOverdue.get(j.lineId || j.id) || {}).root === j);
    const orders = await enrichOrders(await dbAll(`${ORDER_SELECT} WHERE o.status != 'cancelled'`));
    const projectsMine = all ? null : new Set((await dbAll(`SELECT id FROM jt_projects WHERE managerId = ?`, [mine])).map((p) => p.id));
    const acks = new Map((await dbAll(`SELECT key, userId, at FROM jt_alert_acks`)).map((a) => [a.key, a]));
    const out = [];
    const push = (a) => { const ack = acks.get(a.key); out.push({ ...a, acked: !!ack, ackedAt: ack ? ack.at : null }); };

    jobs.forEach((j) => {
      const base = { refType: 'job', refId: j.id, projectId: j.projectId, assigneeId: j.assigneeId, assigneeName: j.assigneeName, link: { type: 'job', id: j.id } };
      if (j.overdue) push({ ...base, key: `job_overdue:${j.id}`, type: 'job_overdue', severity: j.overdueDays > 3 || j.priority === 'urgent' ? 'critical' : 'warning',
        title: `${j.jobNo} gecikti (${j.overdueDays} gün)`, message: `${j.title}${j.orderNo ? ' · ' + j.orderNo : ''} — planlanan bitiş ${j.plannedEnd}, %${j.progress} tamamlandı.${(rootOverdue.get(j.lineId || j.id) || {}).downstream ? ` Sonraki ${(rootOverdue.get(j.lineId || j.id)).downstream} süreç bu yüzden etkileniyor.` : ''}`, dueDate: j.plannedEnd });
      else if (j.dueSoon && j.progress < 60) push({ ...base, key: `job_due_soon:${j.id}`, type: 'job_due_soon', severity: 'info',
        title: `${j.jobNo} yakında bitmeli`, message: `${j.title} — bitiş ${j.plannedEnd}, yalnızca %${j.progress} tamamlandı.`, dueDate: j.plannedEnd });
      if (j.status === 'blocked') push({ ...base, key: `job_blocked:${j.id}`, type: 'job_blocked', severity: 'warning', title: `${j.jobNo} engelli`, message: `${j.title} — ${j.blockedReason || 'neden belirtilmemiş'}.` });
      if (!j.assigneeId && endOfDay(j.plannedStart) - now <= 2 * DAY) push({ ...base, key: `job_unassigned:${j.id}`, type: 'job_unassigned', severity: 'warning', title: `${j.jobNo} atanmamış`, message: `${j.title} — başlangıç ${j.plannedStart}, sorumlu atanmamış.` });
    });
    orders.forEach((o) => {
      if (o.state === 'shipped') return;
      const base = { refType: 'order', refId: o.id, projectId: o.projectId, link: { type: 'order', id: o.id } };
      const left = endOfDay(o.dueDate) - now;
      if (o.overdue) push({ ...base, key: `order_overdue:${o.id}`, type: 'order_overdue', severity: 'critical', title: `${o.orderNo} teslim tarihi geçti (${o.overdueDays} gün)`, message: `${o.customerName} — sevk %${o.shippedPct}, üretim %${o.progress}.`, dueDate: o.dueDate });
      else if (left <= 7 * DAY && o.progress < 70) push({ ...base, key: `order_risk:${o.id}`, type: 'order_risk', severity: left <= 3 * DAY ? 'critical' : 'warning', title: `${o.orderNo} teslimatı risk altında`, message: `${o.customerName} — teslim ${o.dueDate}, üretim yalnızca %${o.progress}.`, dueDate: o.dueDate });
    });
    // Kişi performans uyarısı (yönetim için)
    if (all) {
      const rows = await performanceRows(now - 30 * DAY, now);
      rows.filter((r) => r.completed >= 4 && r.onTimePct != null && r.onTimePct < 60).forEach((r) => push({ refType: 'user', refId: String(r.id), key: `perf_low:${r.id}`, type: 'perf_low', severity: 'info',
        title: `${r.name} performansı düşük`, message: `Son 30 günde zamanında tamamlama %${r.onTimePct} (${r.late} geç iş).`, link: { type: 'user', id: r.id } }));
    }
    const rank = { critical: 0, warning: 1, info: 2 };
    return out
      .filter((a) => all || a.assigneeId === mine || (projectsMine && a.projectId && projectsMine.has(a.projectId)))
      .sort((a, b) => Number(a.acked) - Number(b.acked) || rank[a.severity] - rank[b.severity] || String(a.dueDate || '').localeCompare(String(b.dueDate || '')));
  }

  app.get('/api/jt/alerts', need('jt.view'), wrap(async (req, res) => {
    const list = await computeAlerts(req);
    const show = req.query.all === '1' ? list : list.filter((a) => !a.acked);
    res.json({ success: true, data: { alerts: show, counts: { critical: list.filter((a) => !a.acked && a.severity === 'critical').length, warning: list.filter((a) => !a.acked && a.severity === 'warning').length, info: list.filter((a) => !a.acked && a.severity === 'info').length } } });
  }));

  app.post('/api/jt/alerts/ack', need('jt.alerts.ack'), wrap(async (req, res) => {
    const key = String((req.body || {}).key || '');
    if (!/^[a-z_]+:[\w-]+$/.test(key)) return res.status(400).json({ success: false, message: 'Geçersiz uyarı.' });
    await dbRun(`INSERT OR REPLACE INTO jt_alert_acks (key, userId, at) VALUES (?,?,?)`, [key, req.me.id, new Date().toISOString()]);
    res.json({ success: true });
  }));

  // ---------- Kullanıcı & yetki yönetimi ----------
  app.get('/api/jt/roles', need('jt.view'), wrap(async (_req, res) => {
    const roles = (await dbAll(`SELECT * FROM jt_roles`)).map((r) => ({ ...r, permissions: JSON.parse(r.permissions || '[]') }));
    const counts = await dbAll(`SELECT role, COUNT(*) AS n FROM users GROUP BY role`);
    const builtin = new Set(ROLES.map((x) => x[0]));
    res.json({ success: true, data: {
      roles: roles.map((x) => ({ ...x, builtin: builtin.has(x.id), userCount: (counts.find((c) => c.role === x.id) || {}).n || 0 })),
      permissions: PERMISSIONS.filter(([id]) => !JT_ONLY.has(id)).map(([id, label]) => ({ id, label })),
      customRoles: true, // Beykim: şirket kendi rollerini tanımlayabilir
    } });
  }));

  app.get('/api/jt/users', need('jt.users.manage'), wrap(async (_req, res) => {
    const users = await dbAll(`SELECT u.id, u.username, u.name, u.role, u.title, u.department, u.phone, u.email, u.active, r.label AS roleLabel FROM users u LEFT JOIN jt_roles r ON r.id = u.role ORDER BY u.active DESC, u.name`);
    res.json({ success: true, data: users });
  }));

  const genPassword = () => require('crypto').randomBytes(9).toString('base64').replace(/[+/=]/g, 'x').slice(0, 12) + '7a';
  const cleanUsername = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);

  app.post('/api/jt/users', need('jt.users.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    const username = cleanUsername(b.username);
    if (username.length < 3 || !String(b.name || '').trim()) return res.status(400).json({ success: false, message: 'Kullanıcı adı (en az 3 karakter) ve ad soyad gerekli.' });
    if (!(await dbGet(`SELECT id FROM jt_roles WHERE id = ?`, [b.role]))) return res.status(400).json({ success: false, message: 'Geçersiz rol.' });
    if (await dbGet(`SELECT id FROM users WHERE username = ?`, [username])) return res.status(409).json({ success: false, message: 'Bu kullanıcı adı zaten var.' });
    const password = genPassword();
    await dbRun(`INSERT INTO users (username, password, name, role, title, department, phone, email, active, mustChange, createdAt) VALUES (?,?,?,?,?,?,?,?,1,1,?)`,
      [username, hashPassword(password), b.name, b.role, b.title || '', b.department || '', b.phone || '', b.email || '', new Date().toISOString()]);
    res.json({ success: true, message: 'Kullanıcı oluşturuldu.', data: { username, temporaryPassword: password } });
  }));

  app.put('/api/jt/users/:id', need('jt.users.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    const u = await dbGet(`SELECT * FROM users WHERE id = ?`, [Number(req.params.id)]);
    if (!u) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    const role = b.role || u.role;
    if (!(await dbGet(`SELECT id FROM jt_roles WHERE id = ?`, [role]))) return res.status(400).json({ success: false, message: 'Geçersiz rol.' });
    const active = b.active === undefined ? u.active : b.active ? 1 : 0;
    // Son yöneticinin rolü / hesabı kaldırılamaz
    if (u.role === 'admin' && (role !== 'admin' || !active)) {
      const admins = await dbGet(`SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND active != 0 AND id != ?`, [u.id]);
      if (!admins.c) return res.status(400).json({ success: false, message: 'Sistemde en az bir aktif yönetici kalmalı.' });
    }
    await dbRun(`UPDATE users SET name = ?, role = ?, title = ?, department = ?, phone = ?, email = ?, active = ? WHERE id = ?`,
      [b.name || u.name, role, b.title ?? u.title, b.department ?? u.department, b.phone ?? u.phone, b.email ?? u.email, active, u.id]);
    res.json({ success: true, message: 'Kullanıcı güncellendi.' });
  }));

  app.post('/api/jt/users/:id/reset-password', need('jt.users.manage'), wrap(async (req, res) => {
    const u = await dbGet(`SELECT id, username FROM users WHERE id = ?`, [Number(req.params.id)]);
    if (!u) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    const password = genPassword();
    await dbRun(`UPDATE users SET password = ?, mustChange = 1 WHERE id = ?`, [hashPassword(password), u.id]);
    res.json({ success: true, message: 'Geçici şifre oluşturuldu.', data: { username: u.username, temporaryPassword: password } });
  }));

  // ---- rol tanımları: şirket kendi rollerini ekleyebilir, ad / açıklama / yetkileri değiştirebilir ----
  const roleText = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);
  const cleanPerms = (list) => {
    const valid = new Set(PERMISSIONS.map((p) => p[0]));
    const perms = (Array.isArray(list) ? list : []).filter((p) => valid.has(p));
    if (!perms.includes('jt.view')) perms.push('jt.view');
    return [...new Set(perms)];
  };
  app.post('/api/jt/roles', need('jt.users.manage'), wrap(async (req, res) => {
    const b = req.body || {};
    const label = roleText(b.label, 60);
    if (label.length < 2) return res.status(400).json({ success: false, message: 'Rol adı en az 2 karakter olmalı.' });
    if (await dbGet(`SELECT id FROM jt_roles WHERE LOWER(label) = LOWER(?)`, [label])) return res.status(409).json({ success: false, message: 'Bu adla bir rol zaten var.' });
    const id = 'r-' + Date.now().toString(36);
    await dbRun(`INSERT INTO jt_roles (id, label, description, permissions) VALUES (?,?,?,?)`, [id, label, roleText(b.description, 200), JSON.stringify(cleanPerms(b.permissions))]);
    invalidateRoles();
    res.json({ success: true, message: `Rol oluşturuldu: ${label}`, data: { id } });
  }));
  app.put('/api/jt/roles/:id', need('jt.users.manage'), wrap(async (req, res) => {
    const r = await dbGet(`SELECT * FROM jt_roles WHERE id = ?`, [req.params.id]);
    if (!r) return res.status(404).json({ success: false, message: 'Rol bulunamadı' });
    if (r.id === 'admin') return res.status(400).json({ success: false, message: 'Yönetici rolü değiştirilemez.' });
    const b = req.body || {};
    const label = b.label != null ? roleText(b.label, 60) : r.label;
    if (label.length < 2) return res.status(400).json({ success: false, message: 'Rol adı en az 2 karakter olmalı.' });
    if (label !== r.label && await dbGet(`SELECT id FROM jt_roles WHERE LOWER(label) = LOWER(?) AND id != ?`, [label, r.id])) return res.status(409).json({ success: false, message: 'Bu adla bir rol zaten var.' });
    const description = b.description != null ? roleText(b.description, 200) : r.description;
    const perms = Array.isArray(b.permissions) ? cleanPerms(b.permissions) : JSON.parse(r.permissions || '[]');
    await dbRun(`UPDATE jt_roles SET label = ?, description = ?, permissions = ? WHERE id = ?`, [label, description, JSON.stringify(perms), r.id]);
    invalidateRoles();
    res.json({ success: true, message: 'Rol güncellendi.' });
  }));
  app.delete('/api/jt/roles/:id', need('jt.users.manage'), wrap(async (req, res) => {
    const r = await dbGet(`SELECT * FROM jt_roles WHERE id = ?`, [req.params.id]);
    if (!r) return res.status(404).json({ success: false, message: 'Rol bulunamadı' });
    if (r.id === 'admin') return res.status(400).json({ success: false, message: 'Yönetici rolü silinemez.' });
    const n = (await dbGet(`SELECT COUNT(*) AS n FROM users WHERE role = ?`, [r.id])).n;
    if (n > 0) return res.status(400).json({ success: false, message: `Bu rolde ${n} kullanıcı var; önce kullanıcıları başka bir role taşıyın.` });
    await dbRun(`DELETE FROM jt_roles WHERE id = ?`, [r.id]);
    invalidateRoles();
    res.json({ success: true, message: `Rol silindi: ${r.label}` });
  }));

  /** ERP satış kaydı sonrası: sipariş bağlantısını doğrula (server.js /api/sales tarafından çağrılır) */
  return { invalidateRoles, rolePerms, enrichOrders, performanceRows, computeAlerts, version: VERSION };
};

module.exports.initSchema = initSchema;
module.exports.ROLES = ROLES;
module.exports.PROCESSES = PROCESSES;
module.exports.PERMISSIONS = PERMISSIONS;
