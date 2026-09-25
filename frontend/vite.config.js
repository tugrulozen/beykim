import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Geliştirme sırasında hangi şirketin ayarları kullanılsın?
//   TENANT=katsan npm run dev   (varsayılan: katsan)
const TENANT = process.env.TENANT || 'katsan';
const tenantDir = path.resolve(__dirname, 'tenants', TENANT);

/** Dev sunucusunda /tenant.json ve /tenant/* isteklerini tenants/<TENANT>/ klasöründen verir */
function tenantDevPlugin() {
  return {
    name: 'tenant-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url || '').split('?')[0]);
        let file = null;
        if (url === '/tenant.json') file = path.join(tenantDir, 'tenant.json');
        else if (url.startsWith('/tenant/')) file = path.join(tenantDir, path.basename(url));
        if (!file || !file.startsWith(tenantDir) || !fs.existsSync(file)) return next();
        res.setHeader('Cache-Control', 'no-store');
        if (url === '/tenant.json') {
          // Geliştirmede yayın adresine gitmesin: /api, vite proxy'si (BACKEND_URL) üzerinden yerel backend'e gider
          const t = JSON.parse(fs.readFileSync(file, 'utf8'));
          t.api = { ...(t.api || {}), erpApiUrl: '/api' };
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify(t));
        }
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

/** Yayın derlemesine İçerik Güvenliği Politikası (CSP) ekler: yalnızca kendi betikleri çalışır, harici betik/yazı tipi yüklenmez */
function cspPlugin() {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self' https: http://localhost:* http://127.0.0.1:*",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }],
  };
}

// Hangi uygulama derlensin?  APP=finance | APP=taskflow → bağımsız uygulama (<app>.html → dist-<app>/index.html); varsayılan: WMS
const APP = ['finance', 'taskflow'].includes(process.env.APP) ? process.env.APP : 'wms';
const STANDALONE = APP !== 'wms';

/** Bağımsız uygulama derlemesinde çıktı sayfası index.html olarak yazılır (sunucuda doğrudan açılsın) */
function financeIndexPlugin() {
  return {
    name: 'finance-index',
    apply: 'build',
    writeBundle(o) {
      const from = path.join(o.dir, `${APP}.html`);
      if (fs.existsSync(from)) fs.renameSync(from, path.join(o.dir, 'index.html'));
    },
  };
}

export default defineConfig({
  root: '.',
  // Göreli yol: aynı derleme her alt dizinde (/katsan/, /firma2/ ...) çalışır
  base: './',
  plugins: [tenantDevPlugin(), cspPlugin(), ...(STANDALONE ? [financeIndexPlugin()] : [])],
  // finans derlemesi: WMS örnek verisi (mockApi/mockData) yerine boş taslak → pakette depo/satış verisi ve kodu olmaz
  resolve: STANDALONE ? { alias: [{ find: /^\.\.\/api\/mockApi\.js$/, replacement: path.resolve(__dirname, 'src/finance-app/mock-stub.js') }] } : {},
  server: {
    port: 3000,
    open: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: STANDALONE ? `dist-${APP}` : 'dist',
    assetsDir: 'assets',
    sourcemap: false, // kaynak haritası üretilmez: yayındaki dosyadan özgün kod geri okunamaz
    rollupOptions: {
      input: path.resolve(__dirname, STANDALONE ? `${APP}.html` : 'index.html'),
      output: {
        banner: '/*! (c) Codendtec. Tüm hakları saklıdır. Bu yazılım ticari sırdır; izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz veya tersine mühendislikle çözülemez. All rights reserved. */',
      },
    },
  }
});
