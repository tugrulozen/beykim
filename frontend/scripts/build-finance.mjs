/**
 * Bağımsız uygulamayı (finans / iş akışı) bir şirket için derler ve paketler.
 *   node scripts/build-finance.mjs horizonindustry            → finans
 *   APP=taskflow node scripts/build-finance.mjs hobiex        → iş akışı   (npm run build:taskflow -- hobiex)
 * Çıktı: releases/<slug>-<ek>/ ve releases/<slug>-<ek>.zip
 * Paket: index.html + assets (yalnız o uygulamanın kodu) + tenant.json (iç notlar çıkarılır) + logo
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!/^[a-z0-9-]+$/.test(slug || '')) { console.error('Kullanım: node scripts/build-finance.mjs <firma-slug>'); process.exit(1); }
const tdir = path.join(ROOT, 'tenants', slug);
if (!fs.existsSync(path.join(tdir, 'tenant.json'))) { console.error(`tenants/${slug}/tenant.json yok`); process.exit(1); }

const APP = process.env.APP === 'taskflow' ? 'taskflow' : 'finance';
const SUFFIX = APP === 'taskflow' ? 'isakisi' : 'finans';
process.env.APP = APP;
process.env.TENANT = slug;
const { build } = await import('vite');
await build({ configFile: path.join(ROOT, 'vite.config.js'), logLevel: 'warn' });

const dist = path.join(ROOT, `dist-${APP}`);
const out = path.join(ROOT, 'releases', `${slug}-${SUFFIX}`);
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(dist, out, { recursive: true });
const { notes, ...pub } = JSON.parse(fs.readFileSync(path.join(tdir, 'tenant.json'), 'utf8')); // iç notlar müşteriye gitmez
void notes;
fs.writeFileSync(path.join(out, 'tenant.json'), JSON.stringify(pub, null, 2));
if (pub.logo && fs.existsSync(path.join(tdir, pub.logo))) {
  fs.mkdirSync(path.join(out, 'tenant'), { recursive: true });
  fs.copyFileSync(path.join(tdir, pub.logo), path.join(out, 'tenant', pub.logo));
}
const zip = `${out}.zip`;
fs.rmSync(zip, { force: true });
const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
const r = spawnSync(tar, ['-a', '-c', '-f', zip, '-C', out, '.']);
console.log(r.status === 0 ? `✔ ${path.relative(ROOT, zip)}` : `Klasör hazır (zip üretilemedi): ${path.relative(ROOT, out)}`);
