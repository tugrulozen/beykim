/**
 * Güvenlik yardımcıları (harici bağımlılık yok, yalnızca Node "crypto")
 *
 *  - Şifreler scrypt ile özetlenir (düz metin saklanmaz)
 *  - Oturum jetonları HMAC-SHA256 ile imzalanır ve süresi dolar (sahte jeton üretilemez)
 *  - Giriş denemeleri sınırlanır (kaba kuvvet koruması)
 *  - CORS yalnızca izinli adreslere açılır
 *  - Gelen metinlerden HTML işaretleri temizlenir, hata ayrıntıları istemciye sızdırılmaz
 *
 * Ortam değişkenleri (hepsi isteğe bağlı):
 *   AUTH_SECRET       jeton imza anahtarı (yoksa backend/.auth-secret dosyası otomatik üretilir)
 *   TOKEN_TTL_HOURS   oturum süresi, saat (varsayılan 12)
 *   ADMIN_PASSWORD    admin şifresini bu değere ayarlar (her başlangıçta)
 *   CORS_ORIGINS      virgülle ayrılmış izinli adresler/alan adları ("*" = herkes)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ---------- gizli anahtar ----------
const SECRET_FILE = path.join(__dirname, '.auth-secret');
function loadSecret() {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) return process.env.AUTH_SECRET;
  try {
    const s = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    if (s.length >= 32) return s;
  } catch (_e) { /* yoksa üret */ }
  const s = crypto.randomBytes(48).toString('hex');
  try { fs.writeFileSync(SECRET_FILE, s + '\n', { mode: 0o600 }); } catch (e) { console.warn('⚠ .auth-secret yazılamadı; oturumlar yeniden başlatmada sıfırlanır:', e.message); }
  return s;
}
const SECRET = loadSecret();
const hmac = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ---------- şifre ----------
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const dk = crypto.scryptSync(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${salt.toString('base64url')}$${dk.toString('base64url')}`;
}
const isHashed = (v) => typeof v === 'string' && v.startsWith('scrypt$');
function verifyPassword(password, stored) {
  if (!isHashed(stored)) return false;
  const [, saltB64, hashB64] = stored.split('$');
  try {
    const expected = Buffer.from(hashB64, 'base64url');
    const dk = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64url'), expected.length, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
    return crypto.timingSafeEqual(dk, expected);
  } catch (_e) { return false; }
}
// Kullanıcı yokken de aynı süreyi harcamak için (kullanıcı adı sızdırılmasın)
const DUMMY_HASH = hashPassword(crypto.randomBytes(8).toString('hex'));

// ---------- jeton ----------
// Firma (tenant) kimliği: ayarlıysa her jetona yazılır; başka firmanın jetonu ve farklı X-Tenant-Id başlığı reddedilir
const TENANT_ID = String(process.env.TENANT_ID || '').trim();
const TTL_MS = Math.max(1, Number(process.env.TOKEN_TTL_HOURS) || 12) * 3600 * 1000;
function signToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, ...(TENANT_ID ? { tid: TENANT_ID } : {}), exp: Date.now() + TTL_MS })).toString('base64url');
  return `v1.${body}.${hmac('v1.' + body)}`;
}
function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  if (!safeEqual(hmac('v1.' + parts[1]), parts[2])) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return p && p.exp > Date.now() ? p : null;
  } catch (_e) { return null; }
}

// Yönetim paneli önizlemesi için yalnızca-okuma anahtarı (panel ve backend aynı makinede aynı dosyayı kullanır)
const PREVIEW_KEY = hmac('panel-preview');
const previewAllowed = (req) => (req.method === 'GET' || req.method === 'HEAD') && req.headers['x-preview-key'] && safeEqual(req.headers['x-preview-key'], PREVIEW_KEY);

/** Bearer jetonu zorunlu; yalnızca izin verilen yollar açık */
function requireAuth(openPaths) {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    const hdr = req.headers['x-tenant-id'];
    if (TENANT_ID && hdr && hdr !== TENANT_ID) return res.status(403).json({ success: false, message: 'Bu sunucu başka bir firmaya hizmet veriyor (tenant uyuşmuyor).' });
    if (openPaths.includes(req.path)) return next();
    if (previewAllowed(req)) { req.user = { name: 'Önizleme', role: 'preview' }; return next(); }
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
    const user = m && verifyToken(m[1]);
    if (!user) return res.status(401).json({ success: false, message: 'Oturum gerekli. Lütfen giriş yapın.' });
    if (TENANT_ID && user.tid !== TENANT_ID) return res.status(401).json({ success: false, message: 'Oturum bu firmaya ait değil. Lütfen yeniden giriş yapın.' });
    req.user = user;
    next();
  };
}

// ---------- hız sınırı ----------
function makeLimiter({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset <= now) hits.delete(k); }, windowMs).unref();
  return {
    hit(key) {
      const now = Date.now();
      let e = hits.get(key);
      if (!e || e.reset <= now) { e = { n: 0, reset: now + windowMs }; hits.set(key, e); }
      e.n += 1;
      return e.n;
    },
    blocked(key) { const e = hits.get(key); return !!e && e.reset > Date.now() && e.n >= max; },
    retryAfter(key) { const e = hits.get(key); return e ? Math.max(1, Math.ceil((e.reset - Date.now()) / 1000)) : 1; },
    clear(key) { hits.delete(key); },
  };
}
const loginLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 8 });
const loginIpLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 40 });
const apiLimiter = makeLimiter({ windowMs: 60 * 1000, max: 600 });
const apiRateLimit = (req, res, next) => {
  const key = req.ip || 'x';
  if (apiLimiter.hit(key) > 600) return res.status(429).json({ success: false, message: 'Çok fazla istek. Biraz bekleyin.' });
  next();
};

// ---------- CORS ----------
const extraOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const PRIVATE_HOST = /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;
function originAllowed(origin) {
  if (!origin) return true; // aynı-kaynak / sunucudan sunucuya
  if (extraOrigins.includes('*')) return true;
  let u; try { u = new URL(origin); } catch (_e) { return false; }
  const host = u.hostname.toLowerCase();
  if (PRIVATE_HOST.test(host) || host === 'codendtec.com' || host.endsWith('.codendtec.com')) return true;
  return extraOrigins.some((o) => o === origin.toLowerCase() || o === host || (o.startsWith('*.') && host.endsWith(o.slice(1))));
}
const corsOptions = {
  origin: (origin, cb) => cb(null, originAllowed(origin)),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  maxAge: 600,
};

// ---------- başlıklar ----------
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
}

// ---------- girdi temizleme ----------
/** Metin alanlarından HTML işaretlerini (< >) ve denetim karakterlerini temizler; şifre alanlarına dokunmaz */
function cleanValue(v, key, depth = 0) {
  if (depth > 8) return null;
  if (typeof v === 'string') {
    if (/pass/i.test(key || '')) return v.slice(0, 200);
    return v.replace(/[<>]/g, '').replace(/[ --]/g, '').slice(0, 2000);
  }
  if (Array.isArray(v)) return v.slice(0, 5000).map((x) => cleanValue(x, key, depth + 1));
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) { if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue; out[k] = cleanValue(v[k], k, depth + 1); }
    return out;
  }
  return v;
}
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') req.body = cleanValue(req.body, '');
  next();
}

const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 1..max arası tam sayı, değilse null */
function posInt(v, max = 1000000) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}
/** Sonlu, 0'dan büyük sayı, değilse null */
function posNum(v, max = 1e9) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
}

/** 5xx yanıtlarında iç hata ayrıntısı (SQL, dosya yolu) istemciye gitmesin; sunucu günlüğüne yazılır */
function hideServerErrors(req, res, next) {
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 500) {
      console.error(`[${req.method} ${req.path}] ${res.statusCode}:`, body && (body.error || body.message));
      body = { success: false, message: 'Sunucu hatası. Lütfen tekrar deneyin.' };
    }
    return json(body);
  };
  next();
}

module.exports = {
  hashPassword, verifyPassword, isHashed, DUMMY_HASH, TENANT_ID, signToken, verifyToken, requireAuth, PREVIEW_KEY,
  loginLimiter, loginIpLimiter, apiRateLimit, corsOptions, securityHeaders, sanitizeBody, escapeHtml, posInt, posNum, hideServerErrors,
};
