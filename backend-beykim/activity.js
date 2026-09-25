/**
 * Son işlemler (denetim kaydı) + bildirimler
 *
 * - Başarılı her yazma isteği (satış, mal kabul, transfer, sayım, stok düzeltme, üretim, iş atama ...)
 *   kim tarafından, ne zaman yapıldığıyla `activity_log` tablosuna yazılır. Kayıt cevabı geciktirmez ve
 *   hata verirse asıl işlemi etkilemez.
 * - Bir iş kişiye atandığında `notifications` tablosuna o kişi için bildirim düşer.
 */

const CATEGORIES = {
  sale: 'Sevkiyat', return: 'Sevkiyat', // Beykim: satış yerine gemi sevkiyatı
  purchase: 'Alış', purchaseOrder: 'Alış', supplier: 'Alış',
  barcode: 'Depo', barcodePrint: 'Depo',
  finance: 'Finans',
  transfer: 'Depo', unload: 'Depo', count: 'Depo', adjust: 'Depo', productDelete: 'Depo', packing: 'Depo',
  production: 'Üretim', rawMaterial: 'Üretim',
  job: 'İş Takip', jobAssign: 'İş Takip', jobProgress: 'İş Takip', jobStatus: 'İş Takip', jobComment: 'İş Takip', order: 'İş Takip', project: 'İş Takip',
  user: 'Kullanıcı',
};
const TYPE_LABEL = {
  sale: 'Sevkiyat', return: 'Gemiden iade', purchase: 'Mal kabul', purchaseOrder: 'Satın alma siparişi', supplier: 'Tedarikçi',
  barcode: 'Barkod oluşturma', barcodePrint: 'Barkod yazdırma',
  finance: 'Finans işlemi',
  transfer: 'Depo transferi', unload: 'Araç boşaltma', count: 'Stok sayımı', adjust: 'Stok düzeltme', productDelete: 'Ürün silme', packing: 'Çeki listesi',
  production: 'Üretim girişi', rawMaterial: 'Hammadde',
  job: 'İş oluşturma', jobAssign: 'İş atama', jobProgress: 'İş ilerlemesi', jobStatus: 'İş durumu', jobComment: 'İş notu', order: 'Sipariş', project: 'Proje',
  user: 'Kullanıcı',
};
const JOB_ST = { planned: 'Planlandı', in_progress: 'Devam ediyor', blocked: 'Engelli', done: 'Tamamlandı', cancelled: 'İptal' };

module.exports = function createActivity({ dbAll, dbGet, dbRun }) {
  function initSchema(run) {
    run(`CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, userId INTEGER, userName TEXT, type TEXT, category TEXT, text TEXT, refLabel TEXT, refId TEXT)`);
    run(`CREATE INDEX IF NOT EXISTS ix_activity_ts ON activity_log(ts)`);
    run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, type TEXT, title TEXT, body TEXT, link TEXT, createdAt TEXT, readAt TEXT)`);
    run(`CREATE INDEX IF NOT EXISTS ix_notif_user ON notifications(userId, readAt)`);
  }

  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

  async function notify(userId, type, title, body, link) {
    if (!userId) return;
    await dbRun(`INSERT INTO notifications (userId, type, title, body, link, createdAt) VALUES (?,?,?,?,?,?)`,
      [Number(userId), type, clip(title, 120), clip(body, 300), clip(link, 120), new Date().toISOString()]);
  }

  /** İstek + cevaptan işlem kaydı üretir; null dönerse kaydedilmez */
  async function describe(req, body, path) {
    const p = path.replace(/\/+$/, '');
    const m = req.method;
    const msg = clip(body && body.message, 300);
    const b = req.body || {};
    const cust = async (id) => (id ? ((await dbGet(`SELECT name FROM customers WHERE id = ?`, [id])) || {}).name : '');
    const wh = async (id) => (id ? ((await dbGet(`SELECT name FROM warehouses WHERE id = ?`, [id])) || {}).name : '');
    const usr = async (id) => (id ? ((await dbGet(`SELECT name FROM users WHERE id = ?`, [Number(id)])) || {}).name : '');

    if (m === 'POST' && p === '/sales') {
      const isRet = b.type === 'iade';
      // gemi (GM..) adı sevkiyat mesajında zaten yazar; yalnız müşteri için eklenir
      const extra = [!/^GM/.test(String(b.customerId)) && await cust(b.customerId) && `Müşteri: ${await cust(b.customerId)}`, await wh(b.warehouseId) && `Depo: ${await wh(b.warehouseId)}`, b.note].filter(Boolean).join(' · ');
      return { type: isRet ? 'return' : 'sale', text: `${msg}${extra ? ' — ' + extra : ''}`, refLabel: b.orderId ? 'Siparişe bağlı' : '' };
    }
    if (m === 'POST' && p === '/purchase') return { type: 'purchase', text: msg || 'Mal kabul yapıldı', refLabel: await wh(b.warehouseId) };
    if (p.startsWith('/purchase-orders')) return { type: 'purchaseOrder', text: msg || `Satın alma siparişi ${m === 'POST' ? 'işlendi' : 'güncellendi'} (${p.split('/').slice(2).join('/') || 'yeni'})`, refId: p.split('/')[2] || '' };
    if (p.startsWith('/suppliers')) return { type: 'supplier', text: msg || 'Tedarikçi kaydı değişti', refId: p.split('/')[2] || '' };
    if (p.startsWith('/finance/') && (m === 'POST' || m === 'PUT' || m === 'DELETE') && !/\/(preview|reminders\/run)$/.test(p)) return { type: 'finance', text: msg || 'Finans kaydı değişti', refId: p.split('/')[3] || '' };
    if (m === 'POST' && p === '/barcodes') return { type: 'barcode', text: msg || 'Barkod oluşturuldu', refLabel: (body.data && body.data.barcode) || '', refId: (body.data && body.data.product && body.data.product.id) || '' };
    if (m === 'POST' && /^\/barcodes\/\d+\/print$/.test(p)) return { type: 'barcodePrint', text: msg || 'Barkod yazdırıldı', refId: p.split('/')[2] };
    if (m === 'POST' && p === '/transfers') return { type: 'transfer', text: `${msg || 'Transfer yapıldı'}${b.sourceWarehouse ? ` — ${await wh(b.sourceWarehouse)} → ${await wh(b.targetWarehouse)}` : ''}` };
    if (m === 'POST' && p === '/stock-count') return { type: 'count', text: `${msg || 'Stok sayımı kaydedildi'}${b.warehouseId ? ' — Depo: ' + (await wh(b.warehouseId)) : ''}` };
    if (m === 'POST' && p.startsWith('/vehicle-unload')) return { type: 'unload', text: `${msg || 'Araç boşaltıldı'}${b.warehouseId ? ' — Depo: ' + (await wh(b.warehouseId)) : ''}` };
    if (m === 'POST' && p === '/stock-adjust') return { type: 'adjust', text: msg || 'Stok düzeltildi', refLabel: await wh(b.warehouseId) };
    if (m === 'DELETE' && p.startsWith('/products/')) return { type: 'productDelete', text: msg || 'Ürün silindi', refId: p.split('/')[2] };
    if (p.startsWith('/packing-lists')) return { type: 'packing', text: msg || 'Çeki listesi kaydedildi' };
    if (m === 'POST' && p === '/production') return { type: 'production', text: msg || 'Üretim girişi yapıldı' };
    if (p.startsWith('/raw-materials')) return { type: 'rawMaterial', text: msg || 'Hammadde kaydı değişti' };

    // ---- iş & durum takip ----
    const seg = p.split('/'); // ['', 'jt', 'jobs', id, action]
    if (seg[1] === 'jt' && m === 'POST') {
      if (seg[2] === 'jobs' && !seg[3]) {
        const d = body.data || {};
        const who = b.assigneeId ? await usr(b.assigneeId) : '';
        if (b.assigneeId && d.jobNo && Number(b.assigneeId) !== Number(req.me && req.me.id)) await notify(b.assigneeId, 'job_assigned', `Yeni iş: ${d.jobNo}`, `${clip(b.title, 120) || 'Size yeni bir iş atandı.'} (planlanan bitiş ${b.plannedEnd || '-'})`, `jobs?tab=jobs&job=${d.jobNo}`);
        return { type: 'job', text: `İş oluşturuldu${d.jobNo ? ': ' + d.jobNo : ''}${who ? ' — atanan: ' + who : ''}`, refLabel: d.jobNo || '', refId: d.id || '' };
      }
      if (seg[2] === 'jobs' && seg[3]) {
        const job = await dbGet(`SELECT id, jobNo, title, assigneeId, createdBy, plannedEnd FROM jt_jobs WHERE id = ?`, [seg[3]]);
        if (!job) return null;
        if (seg[4] === 'assign') {
          const who = await usr(b.userId);
          if (Number(b.userId) && Number(b.userId) !== Number(req.me && req.me.id)) {
            await notify(b.userId, 'job_assigned', `Size iş atandı: ${job.jobNo}`, `${clip(job.title, 120)} — planlanan bitiş ${job.plannedEnd || '-'}. Atayan: ${(req.me && req.me.name) || ''}`, `jobs?tab=jobs&job=${job.jobNo}`);
          }
          return { type: 'jobAssign', text: `${job.jobNo} işi ${who || 'bir kişiye'} atandı`, refLabel: job.jobNo, refId: job.id };
        }
        if (seg[4] === 'progress') {
          const after = await dbGet(`SELECT status, doneQty, plannedQty FROM jt_jobs WHERE id = ?`, [job.id]);
          if (after && after.status === 'done' && job.createdBy && Number(job.createdBy) !== Number(req.me && req.me.id)) {
            await notify(job.createdBy, 'job_done', `${job.jobNo} tamamlandı`, `${clip(job.title, 120)} — ${(req.me && req.me.name) || ''} tarafından tamamlandı.`, `jobs?tab=jobs&job=${job.jobNo}`);
          }
          return { type: 'jobProgress', text: `${job.jobNo} ilerleme: +${Number(b.qty) || 0}${Number(b.scrap) ? ` (fire ${Number(b.scrap)})` : ''}${after ? ` → ${after.doneQty}/${after.plannedQty}` : ''}${after && after.status === 'done' ? ' · tamamlandı' : ''}`, refLabel: job.jobNo, refId: job.id };
        }
        if (seg[4] === 'status') return { type: 'jobStatus', text: `${job.jobNo} durumu: ${JOB_ST[b.status] || b.status}${b.note ? ' — ' + clip(b.note, 120) : ''}`, refLabel: job.jobNo, refId: job.id };
        if (seg[4] === 'comment') return { type: 'jobComment', text: `${job.jobNo} işine not eklendi`, refLabel: job.jobNo, refId: job.id };
      }
      if (seg[2] === 'orders') return { type: 'order', text: msg || (seg[4] === 'cancel' ? 'Sipariş iptal edildi' : 'Sipariş oluşturuldu'), refLabel: seg[3] || '', refId: seg[3] || '' };
      if (seg[2] === 'projects') return { type: 'project', text: msg || 'Proje kaydedildi' };
      if (seg[2] === 'users') return { type: 'user', text: msg || 'Kullanıcı kaydı değişti' };
    }
    return null;
  }

  /** Kimlik doğrulamadan sonra, iş takip yönlendiricilerinden ÖNCE bağlanmalı (cevabı sarar) */
  function middleware(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const path = req.path; // yönlendirici içinde req.path değişir; mount yolu burada sabitlenir
    const orig = res.json.bind(res);
    res.json = (body) => {
      const out = orig(body);
      if (res.statusCode < 400 && body && body.success !== false && req.me && req.me.id) {
        describe(req, body, path).then(async (d) => {
          if (!d) return;
          await dbRun(`INSERT INTO activity_log (ts, userId, userName, type, category, text, refLabel, refId) VALUES (?,?,?,?,?,?,?,?)`,
            [new Date().toISOString(), req.me.id, clip(req.me.name, 80), d.type, CATEGORIES[d.type] || 'Diğer', clip(d.text, 400), clip(d.refLabel, 60), clip(d.refId, 60)]);
        }).catch((e) => console.error('[activity]', e.message));
      }
      return out;
    };
    next();
  }

  /** Okuma uçları: kimlik ve izinler yüklendikten sonra bağlanır */
  function mountRoutes(app) {
    app.get('/api/activity', async (req, res) => {
      try {
        const q = req.query || {};
        const where = []; const params = [];
        const iso = (s, end) => { const d = new Date(String(s)); if (isNaN(d)) return null; if (end && /^\d{4}-\d{2}-\d{2}$/.test(String(s))) d.setDate(d.getDate() + 1); return d.toISOString(); };
        const from = q.from && iso(q.from); const to = q.to && iso(q.to, true);
        if (from) { where.push('ts >= ?'); params.push(from); }
        if (to) { where.push('ts < ?'); params.push(to); }
        if (q.userId && Number(q.userId)) { where.push('userId = ?'); params.push(Number(q.userId)); }
        if (q.category) { where.push('category = ?'); params.push(String(q.category).slice(0, 30)); }
        if (q.type) { where.push('type = ?'); params.push(String(q.type).slice(0, 30)); }
        if (q.q) { where.push('(text LIKE ? OR refLabel LIKE ? OR userName LIKE ?)'); const like = `%${String(q.q).slice(0, 60).replace(/[%_]/g, '')}%`; params.push(like, like, like); }
        const limit = Math.min(5000, Math.max(1, Number(q.limit) || 500));
        const rows = await dbAll(`SELECT id, ts, userId, userName, type, category, text, refLabel, refId FROM activity_log ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ts DESC, id DESC LIMIT ${limit}`, params);
        const users = await dbAll(`SELECT DISTINCT userId AS id, userName AS name FROM activity_log WHERE userName != '' ORDER BY userName`);
        res.json({ success: true, data: { items: rows.map((r) => ({ ...r, typeLabel: TYPE_LABEL[r.type] || r.type })), users, categories: [...new Set(Object.values(CATEGORIES))] } });
      } catch (e) { res.status(500).json({ success: false, message: 'İşlem kayıtları okunamadı.' }); }
    });

    // Bildirimler yalnızca sahibine görünür
    app.get('/api/notifications', async (req, res) => {
      try {
        const uid = Number(req.me && req.me.id) || 0;
        const items = await dbAll(`SELECT id, type, title, body, link, createdAt, readAt FROM notifications WHERE userId = ? ORDER BY id DESC LIMIT 40`, [uid]);
        const unread = (await dbGet(`SELECT COUNT(*) AS n FROM notifications WHERE userId = ? AND readAt IS NULL`, [uid])) || { n: 0 };
        res.json({ success: true, data: { items, unread: unread.n } });
      } catch (e) { res.status(500).json({ success: false }); }
    });
    app.post('/api/notifications/read', async (req, res) => {
      try {
        const uid = Number(req.me && req.me.id) || 0;
        const id = Number((req.body || {}).id);
        if (id) await dbRun(`UPDATE notifications SET readAt = ? WHERE id = ? AND userId = ? AND readAt IS NULL`, [new Date().toISOString(), id, uid]);
        else await dbRun(`UPDATE notifications SET readAt = ? WHERE userId = ? AND readAt IS NULL`, [new Date().toISOString(), uid]);
        res.json({ success: true });
      } catch (e) { res.status(500).json({ success: false }); }
    });
  }

  return { initSchema, middleware, mountRoutes, notify };
};
