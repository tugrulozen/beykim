/**
 * BEYKİM DENİZCİLİK — başlangıç verisi (kimyasal / petrol tanker işletmeciliği)
 * Kaynak: beykim.com.tr — filo (M/T ALATEPE, DARMİK, FERİCEK, KARLICA, KARRUCA; çift cidarlı IMO II-III
 * kimyasal/petrol tankerleri), merkez Maslak / İstanbul, ISO 9001 & 14001.
 * Kiracı, tedarikçi ve kişi adları örnektir (gerçek değildir).
 *
 * Model: Beykim bir armatördür; depo modülü gemilere giden yedek parça, madeni yağ, boya, tank temizlik kimyasalı,
 * emniyet malzemesi ve kumanyanın ambar takibidir.
 *  - Sevk noktaları (customers, id GM..) = gemiler. Gemiye sevkiyat iç ikmaldir: tutar 0, cari bakiye oluşmaz.
 *  - Kiracılar (customers, id C..) = navlun müşterileri. Navlun faturaları sales tablosunda type='navlun',
 *    ürünsüz kayıttır (yalnız finans / cari ekstre için; depo ekranlarında görünmez).
 *  - Tedarikçi borcu = teslim alınan satın alma siparişleri − ödemeler (finans modülü ile tutarlı).
 * İlk açılışta (kullanıcı tablosu boşsa) bir kez yüklenir. DEMO_SEED=0 → yalnız roller, admin, şube ve ambarlar.
 * Varsayılan şifreler: admin 1234, diğerleri ad+123 (STRONG_PASSWORDS=1 ile rastgele). Liste: ilk-sifreler.txt
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jt = require('./jobTracking');
const { buildSchedule } = require('./finance');

function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayOffset = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const dayStr = (n) => ymd(dayOffset(n));
const iso = (d) => d.toISOString();
const r2 = (n) => Math.round(n * 100) / 100;
const addMonths = (s, n) => { const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1 + n, 1); t.setDate(Math.min(d, new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate())); return ymd(t); };
const EUR_RATE = 48, USD_RATE = 41;

const BRANCHES = [
  ['101', '101', 'TUZLA LOJİSTİK VE GEMİ İKMAL MERKEZİ'],
  ['102', '102', 'ALİAĞA LİMAN DEPOSU'],
];
const WAREHOUSES = [
  ['1011', '1011', 'Tuzla Yedek Parça Ambarı', '101'],
  ['1012', '1012', 'Tuzla Genel İkmal Ambarı (Kumanya & Sarf)', '101'],
  ['1013', '1013', 'Boya & Kimyasal Ambarı (IMDG)', '101'],
  ['1014', '1014', 'Madeni Yağ Ambarı', '101'],
  ['1021', '1021', 'Aliağa Sahil Deposu', '102'],
];
// kategori → ana ambar
const CAT_WH = {
  'Makine Yedek Parça': '1011', 'Pompa & Valf': '1011', 'Filtre': '1011', 'Elektrik & Seyir': '1011',
  'Madeni Yağ': '1014', 'Boya & Kaplama': '1013', 'Tank Temizlik Kimyasalı': '1013',
  'Emniyet & Yangın': '1012', 'Güverte & Halat': '1012', 'Kumanya & Kamara': '1012',
};

// [id, kod, barkod, ad, birim, stok, birim maliyet (TL), kategori]
const PRODUCTS = [
  ['P001', 'BYK-ME-INJ', '8691852100017', 'Ana Makine Yakıt Enjektörü (MAN B&W)', 'Adet', 18, 48500, 'Makine Yedek Parça'],
  ['P002', 'BYK-ME-RNG', '8691852100024', 'Piston Segman Takımı — Ana Makine', 'Takım', 12, 62000, 'Makine Yedek Parça'],
  ['P003', 'BYK-ME-GSK', '8691852100031', 'Silindir Gömleği Conta Seti', 'Set', 30, 7800, 'Makine Yedek Parça'],
  ['P004', 'BYK-AE-TRB', '8691852100048', 'Jeneratör Turboşarj Tamir Kiti', 'Kit', 6, 91000, 'Makine Yedek Parça'],
  ['P005', 'BYK-CP-SEAL', '8691852100055', 'Kargo Pompası Mekanik Salmastra (Deepwell)', 'Adet', 14, 38500, 'Pompa & Valf'],
  ['P006', 'BYK-VLV-150', '8691852100062', 'Paslanmaz Kelebek Vana DN150', 'Adet', 22, 16400, 'Pompa & Valf'],
  ['P007', 'BYK-PV-VLV', '8691852100079', 'Kargo Tankı P/V Emniyet Valfi', 'Adet', 9, 27800, 'Pompa & Valf'],
  ['P008', 'BYK-FLT-SEP', '8691852100086', 'Yakıt Separatörü Filtre Elemanı', 'Adet', 120, 2150, 'Filtre'],
  ['P009', 'BYK-FLT-LO', '8691852100093', 'Ana Makine Yağlama Yağı Filtresi', 'Adet', 96, 1850, 'Filtre'],
  ['P010', 'BYK-FLT-AIR', '8691852100109', 'Jeneratör Hava Filtresi', 'Adet', 64, 1250, 'Filtre'],
  ['P011', 'BYK-LUB-CYL', '8691852100116', 'Silindir Yağı BN70 (208 L varil)', 'Varil', 42, 21400, 'Madeni Yağ'],
  ['P012', 'BYK-LUB-SYS', '8691852100123', 'Sistem Yağı SAE 30 (208 L varil)', 'Varil', 38, 17900, 'Madeni Yağ'],
  ['P013', 'BYK-LUB-HYD', '8691852100130', 'Hidrolik Yağ ISO VG 68 (20 L)', 'Bidon', 85, 2950, 'Madeni Yağ'],
  ['P014', 'BYK-PNT-TNK', '8691852100147', 'Kargo Tankı Epoksi Kaplama (20 L)', 'Teneke', 60, 14800, 'Boya & Kaplama'],
  ['P015', 'BYK-PNT-AF', '8691852100154', 'Antifouling Karina Boyası (20 L)', 'Teneke', 48, 11200, 'Boya & Kaplama'],
  ['P016', 'BYK-PNT-DCK', '8691852100161', 'Güverte Boyası Poliüretan Gri (20 L)', 'Teneke', 55, 7400, 'Boya & Kaplama'],
  ['P017', 'BYK-TC-ALK', '8691852100178', 'Tank Temizlik Deterjanı Alkali (25 L)', 'Bidon', 140, 1650, 'Tank Temizlik Kimyasalı'],
  ['P018', 'BYK-TC-NTR', '8691852100185', 'Tank Yıkama Nötralizörü (25 L)', 'Bidon', 90, 1900, 'Tank Temizlik Kimyasalı'],
  ['P019', 'BYK-SAF-GAS', '8691852100192', 'Gaz Dedektörü Kalibrasyon Gazı', 'Tüp', 16, 4200, 'Emniyet & Yangın'],
  ['P020', 'BYK-SAF-SUIT', '8691852100208', 'Kimyasal Koruyucu Tulum (Tip 3)', 'Adet', 150, 1350, 'Emniyet & Yangın'],
  ['P021', 'BYK-SAF-SCBA', '8691852100215', 'Solunum Cihazı (SCBA) Yedek Tüpü', 'Tüp', 20, 9800, 'Emniyet & Yangın'],
  ['P022', 'BYK-SAF-EXT', '8691852100222', 'KKT Yangın Söndürücü 12 kg', 'Adet', 44, 2100, 'Emniyet & Yangın'],
  ['P023', 'BYK-DCK-ROPE', '8691852100239', 'Palamar Halatı PP 64 mm (220 m)', 'Kangal', 10, 48000, 'Güverte & Halat'],
  ['P024', 'BYK-DCK-HOSE', '8691852100246', 'Kimyasal Kargo Hortumu 6" (Paslanmaz Flanşlı)', 'Adet', 12, 36500, 'Güverte & Halat'],
  ['P025', 'BYK-PRV-DRY', '8691852100253', 'Kuru Kumanya Paketi (18 kişi / hafta)', 'Paket', 26, 18500, 'Kumanya & Kamara'],
  ['P026', 'BYK-PRV-BED', '8691852100260', 'Kamara Nevresim & Havlu Seti', 'Set', 80, 1450, 'Kumanya & Kamara'],
  ['P027', 'BYK-NAV-VHF', '8691852100277', 'GMDSS El Tipi VHF Telsiz', 'Adet', 14, 9600, 'Elektrik & Seyir'],
  ['P028', 'BYK-NAV-LED', '8691852100284', 'Seyir Feneri LED (Pruva / Pupa)', 'Adet', 18, 5200, 'Elektrik & Seyir'],
];

// Sevk noktaları: filo (beykim.com.tr/filomuz)
const VESSELS = [
  ['GM01', 'M/T ALATEPE', 'ALT'], ['GM02', 'M/T DARMİK', 'DRM'], ['GM03', 'M/T FERİCEK', 'FRC'],
  ['GM04', 'M/T KARLICA', 'KRL'], ['GM05', 'M/T KARRUCA', 'KRR'],
];
// Kiracılar (navlun müşterileri): [id, ad, para birimi, vade (gün), tahsilat gecikmesi (gün)]
const CHARTERERS = [
  ['C001', 'Akdeniz Kimya Dış Ticaret A.Ş.', 'USD', 30, 6],
  ['C002', 'Marmara Petrokimya Pazarlama A.Ş.', 'TL', 30, 22],
  ['C003', 'Levant Chemicals Trading Ltd.', 'USD', 45, 30],
  ['C004', 'Nordic Tank Chartering AS', 'USD', 30, 4],
  ['C005', 'Ege Bitkisel Yağlar San. A.Ş.', 'TL', 45, 10],
];
const ROUTES = [
  ['Aliağa', 'Köstence', 'stiren monomer'], ['Dilovası', 'Pire', 'metanol'], ['Aliağa', 'Tarragona', 'ksilen'],
  ['Mersin', 'İskenderiye', 'ayçiçek yağı'], ['Tuzla', 'Novorossiysk', 'kostik soda'], ['Aliağa', 'Rotterdam', 'MEG'],
  ['Yarımca', 'Batum', 'dizel (CPP)'], ['Aliağa', 'Cenova', 'palm yağı'], ['Ambarlı', 'Burgaz', 'etanol'],
];

const SUPPLIERS = [
  ['SUP001', 'TED-001', 'Marmara Gemi Yedek Parça Ltd. Şti.', 'Kemal Aras', '+90 216 555 0101', 'kemal@marmarayedek.example', 'Tuzla, İstanbul', '1112223334', 'TRY', 30, 'Makine Yedek Parça', 'active', '2025-01-10'],
  ['SUP002', 'TED-002', 'Hamburg Marine Spares GmbH', 'Jonas Weber', '+49 40 555 0202', 'jonas@hh-marinespares.example', 'Hamburg, Almanya', 'DE123456789', 'EUR', 45, 'Makine Yedek Parça', 'active', '2025-02-15'],
  ['SUP003', 'TED-003', 'Tuzla Marine Coatings A.Ş.', 'Aylin Çelik', '+90 216 555 0303', 'aylin@tuzlacoatings.example', 'Tuzla, İstanbul', '4445556667', 'TRY', 45, 'Boya & Kaplama', 'active', '2025-03-20'],
  ['SUP004', 'TED-004', 'Deniz Madeni Yağ Dağıtım A.Ş.', 'Erdem Yavuz', '+90 232 555 0404', 'erdem@denizmadeniyag.example', 'Aliağa, İzmir', '5566778899', 'TRY', 30, 'Madeni Yağ', 'active', '2025-04-05'],
  ['SUP005', 'TED-005', 'Egeli Gemi Kumanya (Ship Chandler)', 'Pınar Aydın', '+90 232 555 0505', 'pinar@egelichandler.example', 'Aliağa, İzmir', '6677889900', 'TRY', 15, 'Kumanya & Kamara', 'active', '2025-05-12'],
  ['SUP006', 'TED-006', 'Poseidon Safety Equipment Ltd.', 'Nikos Pappas', '+30 210 555 0606', 'nikos@poseidonsafety.example', 'Pire, Yunanistan', 'EL998877665', 'USD', 30, 'Emniyet & Yangın', 'active', '2025-06-25'],
  ['SUP007', 'TED-007', 'Anadolu Tank Kimyasalları San.', 'Cem Aksoy', '+90 262 555 0707', 'cem@anadolutank.example', 'Dilovası, Kocaeli', '4455667788', 'TRY', 30, 'Tank Temizlik Kimyasalı', 'active', '2025-07-02'],
  ['SUP008', 'TED-008', 'Karadeniz Halat ve Güverte Ekipmanları', 'Serdar Koç', '+90 216 555 0808', 'serdar@karadenizhalat.example', 'Tuzla, İstanbul', '3344556677', 'TRY', 30, 'Güverte & Halat', 'active', '2025-07-20'],
];
// [id, tedarikçi, sipariş -gün, teslim ±gün, durum, ambar, [[ürün, adet, birim fiyat (sipariş para biriminde), kdv, teslim alınan]]]
const POS = [
  ['PO-2026-001', 'SUP001', -168, -158, 'received', '1011', [['P003', 20, 7400, 20, 20], ['P008', 80, 2050, 20, 80]]],
  ['PO-2026-002', 'SUP004', -150, -144, 'received', '1014', [['P011', 30, 20600, 20, 30], ['P012', 24, 17200, 20, 24]]],
  ['PO-2026-003', 'SUP002', -140, -118, 'received', '1011', [['P001', 10, 980, 0, 10], ['P004', 4, 1850, 0, 4]]],
  ['PO-2026-004', 'SUP003', -122, -112, 'received', '1013', [['P014', 40, 14100, 20, 40], ['P016', 36, 7050, 20, 36]]],
  ['PO-2026-005', 'SUP005', -95, -92, 'received', '1012', [['P025', 30, 17800, 10, 30], ['P026', 60, 1390, 20, 60]]],
  ['PO-2026-006', 'SUP006', -88, -74, 'received', '1012', [['P021', 16, 235, 0, 16], ['P020', 120, 32, 0, 120]]],
  ['PO-2026-007', 'SUP007', -70, -64, 'received', '1013', [['P017', 120, 1590, 20, 120], ['P018', 80, 1820, 20, 80]]],
  ['PO-2026-008', 'SUP001', -58, -50, 'received', '1011', [['P005', 10, 37000, 20, 10], ['P006', 16, 15800, 20, 16]]],
  ['PO-2026-009', 'SUP004', -44, -40, 'received', '1014', [['P011', 24, 21000, 20, 24], ['P013', 60, 2850, 20, 60]]],
  ['PO-2026-010', 'SUP002', -36, -12, 'partial', '1011', [['P002', 8, 1290, 0, 5], ['P007', 6, 590, 0, 6]]],
  ['PO-2026-011', 'SUP008', -26, -21, 'received', '1012', [['P023', 6, 46500, 20, 6], ['P024', 8, 35200, 20, 8]]],
  ['PO-2026-012', 'SUP003', -18, -9, 'received', '1013', [['P015', 40, 10900, 20, 40]]],
  ['PO-2026-013', 'SUP005', -9, -6, 'received', '1012', [['P025', 20, 18200, 10, 20]]],
  ['PO-2026-014', 'SUP006', -12, 2, 'ordered', '1012', [['P019', 12, 98, 0, 0], ['P022', 30, 48, 0, 0]]],
  ['PO-2026-015', 'SUP001', -5, 12, 'approved', '1011', [['P009', 80, 1790, 20, 0], ['P010', 50, 1210, 20, 0]]],
  ['PO-2026-016', 'SUP007', -2, 14, 'pending', '1013', [['P017', 100, 1620, 20, 0]]],
  ['PO-2026-017', 'SUP002', -1, 3, 'draft', '1011', [['P001', 6, 1010, 0, 0]]],
  ['PO-2026-018', 'SUP008', -48, -40, 'cancelled', '1012', [['P023', 4, 47000, 20, 0]]],
];

// Kullanıcılar: [kullanıcı adı, ad, rol, unvan, bölüm]
const USERS = [
  ['admin', 'Yönetici', 'admin', 'Genel Müdür', 'Yönetim'],
  ['deniz.aydin', 'Deniz Aydın', 'finance', 'Finans Müdürü', 'Finans'],
  ['murat.ozkan', 'Murat Özkan', 'manager', 'Teknik Müdür (Filo)', 'Teknik'],
  ['selin.kurt', 'Selin Kurt', 'planner', 'Satın Alma Sorumlusu', 'Satın Alma'],
  ['hakan.yildiz', 'Hakan Yıldız', 'supervisor', 'Depo Şefi (Tuzla)', 'Depo'],
  ['ali.demir', 'Ali Demir', 'operator', 'Ambar Memuru', 'Depo'],
  ['emre.sahin', 'Emre Şahin', 'operator', 'Ambar Memuru (Aliağa)', 'Depo'],
  ['serkan.bulut', 'Serkan Bulut', 'logistics', 'Gemi İkmal ve Sevkiyat Sorumlusu', 'Sevkiyat'],
  ['canan.ergin', 'Canan Ergin', 'quality', 'HSEQ Uzmanı (ISO 9001 / 14001)', 'Kalite & Emniyet'],
  ['inceleme', 'İnceleme Hesabı', 'reviewer', 'Sunum incelemesi (salt okunur)', 'Dış'],
  ['orhan.tekin', 'Orhan Tekin', 'viewer', 'Gemi Süperintendenti', 'Teknik'],
];

// Operasyon süreçleri (İş Takip modülü bu kurulumda menüde kapalıdır; açılırsa hazır olsun): [id, sıra, kod, ad, bölüm, gün, renk, ikon]
const PROCESSES = [
  ['PR1', 1, 'TALEP', 'Gemi Talebi & Onay', 'Teknik', 1, '#64748B', 'ph-clipboard-text'],
  ['PR2', 2, 'SATIN', 'Satın Alma', 'Satın Alma', 5, '#0EA5E9', 'ph-anchor'],
  ['PR3', 3, 'KABUL', 'Mal Kabul & Kontrol', 'Depo', 1, '#8B5CF6', 'ph-package'],
  ['PR4', 4, 'HAZIR', 'Ambar Hazırlık & Paketleme', 'Depo', 1, '#F97316', 'ph-stack'],
  ['PR5', 5, 'SEVK', 'Gemiye Sevkiyat', 'Sevkiyat', 1, '#2563EB', 'ph-boat'],
];

function seedBase({ run }) {
  PROCESSES.forEach((p) => run(`INSERT OR IGNORE INTO jt_processes (id, seq, code, name, dept, stdDays, color, icon) VALUES (?,?,?,?,?,?,?,?)`, p));
  // roller (ad / açıklama / yetkiler denizcilik operasyonuna göre: bkz. jobTracking.js ROLES)
  jt.ROLES.forEach(([id, label, desc, perms]) => run(`INSERT OR REPLACE INTO jt_roles (id, label, description, permissions) VALUES (?,?,?,?)`, [id, label, desc, JSON.stringify(perms)]));
  BRANCHES.forEach((b) => run(`INSERT INTO branches (id, code, name) VALUES (?,?,?)`, b));
  WAREHOUSES.forEach((w) => run(`INSERT INTO warehouses (id, code, name, branchId) VALUES (?,?,?,?)`, w));
}
function writeCreds(creds) {
  try {
    const lines = ['BEYKİM DENİZCİLİK — ilk kullanıcı şifreleri (giriş sonrası her kullanıcı kendi şifresini değiştirmelidir).',
      'Bu dosyayı paylaşmayın; dağıtımdan sonra silin.', '', ...creds.map((c) => `${c.username.padEnd(18)} ${c.password}   ${c.name} (${c.role})`), ''];
    fs.writeFileSync(path.join(__dirname, 'ilk-sifreler.txt'), lines.join('\n'), { mode: 0o600 });
    console.log('İlk kullanıcı şifreleri: backend-beykim/ilk-sifreler.txt');
  } catch (e) { console.warn('ilk-sifreler.txt yazılamadı:', e.message); }
}
const strongPw = () => crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, 'x').slice(0, 12) + '7a';

module.exports.seedBeykim = function seedBeykim({ run, all, one, save, hashPassword }) {
  if ((one(`SELECT COUNT(*) AS c FROM users`) || {}).c > 0) return false;
  const nowIso = iso(new Date());
  seedBase({ run });
  if (process.env.DEMO_SEED === '0') {
    const password = process.env.STRONG_PASSWORDS === '1' ? strongPw() : '1234';
    run(`INSERT INTO users (id, username, password, name, role, title, department, phone, email, active, mustChange, createdAt) VALUES (1,'admin',?,'Yönetici','admin','Genel Müdür','Yönetim','','',1,1,?)`, [hashPassword(password), nowIso]);
    writeCreds([{ username: 'admin', name: 'Yönetici', role: 'admin', password }]);
    save();
    return true;
  }
  const rnd = rng(20260925);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  // ---------- kullanıcılar ----------
  const creds = [], uid = {};
  USERS.forEach(([username, name, role, title, dept], i) => {
    const password = (process.env.STRONG_PASSWORDS === '1' || role === 'reviewer') ? strongPw() : username === 'admin' ? '1234' : `${username.split('.')[0]}123`;
    run(`INSERT INTO users (id, username, password, name, role, title, department, phone, email, active, mustChange, createdAt) VALUES (?,?,?,?,?,?,?,?,?,1,1,?)`,
      [i + 1, username, hashPassword(password), name, role, title, dept, `+90 212 274 ${String(2900 + i * 7)}`, `${username}@beykim.example`, nowIso]);
    uid[username] = i + 1;
    creds.push({ username, name, role, password });
  });
  // birim yöneticileri
  [['U1', 'admin'], ['U2', 'murat.ozkan'], ['U3', 'selin.kurt'], ['U4', 'deniz.aydin'], ['U5', 'hakan.yildiz'], ['U6', 'serkan.bulut'], ['U7', 'canan.ergin']]
    .forEach(([id, u]) => uid[u] && run(`UPDATE jt_units SET managerId = ? WHERE id = ?`, [uid[u], id]));

  // ---------- ürünler ve ambar stokları ----------
  PRODUCTS.forEach((p) => run(`INSERT INTO products (id, code, barcode, name, unit, stock, price, category) VALUES (?,?,?,?,?,?,?,?)`, p));
  PRODUCTS.forEach((p) => {
    const main = CAT_WH[p[7]], ali = Math.floor(p[5] * 0.2);
    run(`INSERT INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)`, [p[0], main, p[5] - ali]);
    if (ali > 0) run(`INSERT INTO warehouse_stock (productId, warehouseId, qty) VALUES (?,?,?)`, [p[0], '1021', ali]);
  });

  // ---------- sevk noktaları (gemiler) ve kiracılar ----------
  VESSELS.forEach(([id, name]) => run(`INSERT INTO customers (id, name, balance, currency, paymentTerm) VALUES (?,?,0,'TL',NULL)`, [id, name]));
  CHARTERERS.forEach(([id, name, cur, term]) => run(`INSERT INTO customers (id, name, balance, currency, paymentTerm) VALUES (?,?,0,?,?)`, [id, name, cur, term]));

  // ---------- tedarikçiler ve satın alma ----------
  const prod = Object.fromEntries(PRODUCTS.map((p) => [p[0], p]));
  const whName = Object.fromEntries(WAREHOUSES.map((w) => [w[0], w[2]]));
  SUPPLIERS.forEach((s) => run(`INSERT INTO suppliers (id, code, name, contactPerson, phone, email, address, taxNo, currency, paymentTerm, category, status, totalOrders, totalAmount, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,0,?)`, s));
  POS.forEach(([id, supId, od, ed, status, wh, lines]) => {
    const sup = SUPPLIERS.find((s) => s[0] === supId);
    const rate = sup[8] === 'EUR' ? EUR_RATE : sup[8] === 'USD' ? USD_RATE : 1;
    const got = ['received', 'partial'].includes(status);
    run(`INSERT INTO purchase_orders (id, supplierId, supplierName, orderDate, expectedDate, status, currency, exchangeRate, warehouseId, warehouseName, invoiceNo, notes, createdBy, approvedBy, approvedAt, receiptDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, supId, sup[2], dayStr(od), dayStr(ed), status, sup[8], rate, wh, whName[wh], got ? `FTR-${id.slice(-3)}` : '', 'Gemi talebi doğrultusunda sipariş', 'Selin Kurt',
        ['draft', 'pending'].includes(status) ? null : 'Murat Özkan', ['draft', 'pending'].includes(status) ? null : dayStr(od + 1), got ? dayStr(ed) : null]);
    // talep eden gemi, gemi talep no, teslim limanı, aciliyet (denizcilik satın alma alanları)
    const [gid, gname, gshort] = VESSELS[POS.findIndex((x) => x[0] === id) % VESSELS.length];
    const forStock = ['PO-2026-001', 'PO-2026-002', 'PO-2026-005', 'PO-2026-009', 'PO-2026-012', 'PO-2026-016'].includes(id); // ambar stoğu yenileme
    const urgency = ['PO-2026-010', 'PO-2026-014', 'PO-2026-017'].includes(id) ? 'urgent' : ['PO-2026-003', 'PO-2026-008', 'PO-2026-015'].includes(id) ? 'priority' : 'routine';
    run(`UPDATE purchase_orders SET vesselId = ?, vesselName = ?, requisitionNo = ?, port = ?, urgency = ? WHERE id = ?`,
      forStock ? [null, null, `AMB-2026-${pad(Number(id.slice(-3)))}`, null, urgency, id]
        : [gid, gname, `RQ-${gshort}-2026-${pad(10 + Number(id.slice(-3)))}`, wh === '1021' ? 'Aliağa' : ['Tuzla', 'Tuzla', 'Aliağa', 'Dilovası'][Number(id.slice(-1)) % 4], urgency, id]);
    lines.forEach(([pid, qty, price, tax, rcv], i) => run(`INSERT INTO purchase_order_lines (id, orderId, productCode, productName, unit, qty, receivedQty, unitPrice, taxRate, discount) VALUES (?,?,?,?,?,?,?,?,?,0)`,
      [`${id}-L${i + 1}`, id, prod[pid][1], prod[pid][3], prod[pid][4], qty, rcv, price, tax]));
    run(`UPDATE suppliers SET totalOrders = totalOrders + 1, totalAmount = totalAmount + ? WHERE id = ?`, [r2(lines.reduce((s, l) => s + l[4] * l[2] * (1 + l[3] / 100), 0)), supId]);
    if (got) run(`INSERT INTO vehicle_unloads (id, warehouseId, vehicleInfo, barcode, date) VALUES (?,?,?,?,?)`,
      [`VU-${id}`, wh, `${pick(['34', '35', '41'])} ${pick(['BYK', 'TZL', 'ALG'])} ${100 + Math.floor(rnd() * 800)} · ${sup[2]}`, prod[lines[0][0]][2], iso(dayOffset(ed))]);
  });

  // ---------- sevkiyat geçmişi (gemilere ikmal) ----------
  let slN = 0;
  const reqNo = {};
  for (let i = 0; i < 240; i++) {
    const [gid, gname, short] = pick(VESSELS);
    const p = pick(PRODUCTS);
    const port = pick(['Tuzla', 'Tuzla', 'Aliağa', 'Dilovası', 'Mersin']);
    const wh = port === 'Aliağa' && rnd() < 0.7 ? '1021' : CAT_WH[p[7]];
    const max = Math.max(1, Math.round(p[5] / 8));
    const qty = 1 + Math.floor(rnd() * max);
    const off = -(1 + Math.floor(rnd() * 355));
    reqNo[short] = (reqNo[short] || 30) + 1;
    const d = dayOffset(off); d.setHours(8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60));
    run(`INSERT INTO sales (id, customerId, warehouseId, productId, quantity, type, date, note, amount) VALUES (?,?,?,?,?,?,?,?,0)`,
      [`SL-s${++slN}`, gid, wh, p[0], qty, 'sevkiyat', iso(d), `Gemi talep no: RQ-${short}-2026-${pad(reqNo[short])} · Teslim limanı: ${port}`]);
  }
  // gemiden iade (kullanılmayan / fazla malzeme)
  [['GM03', 'P020', 12, -40], ['GM01', 'P013', 6, -22], ['GM04', 'P017', 10, -9]].forEach(([gid, pid, qty, off], i) => run(
    `INSERT INTO sales (id, customerId, warehouseId, productId, quantity, type, date, note, amount) VALUES (?,?,?,?,?,?,?,?,0)`,
    [`SL-r${i + 1}`, gid, CAT_WH[prod[pid][7]], pid, qty, 'iade', iso(dayOffset(off)), 'İade nedeni: Fazla / kullanılmayan malzeme · Ürün durumu: Sağlam']));

  // ambarlar arası transferler ve sayımlar
  for (let i = 0; i < 80; i++) {
    const p = pick(PRODUCTS);
    const src = CAT_WH[p[7]];
    run(`INSERT INTO transfers (id, sourceWarehouse, targetWarehouse, targetBranch, barcode, date) VALUES (?,?,?,?,?,?)`,
      [`TRF-b${i}`, src, rnd() < 0.7 ? '1021' : pick(['1011', '1012', '1013', '1014'].filter((w) => w !== src)), '102', p[2], iso(dayOffset(-Math.floor(rnd() * 355)))]);
  }
  for (let i = 0; i < 18; i++) {
    const p = pick(PRODUCTS);
    const sys = Math.round(p[5] * 0.8);
    run(`INSERT INTO stock_counts (id, warehouseId, barcode, countedQty, systemQty, date) VALUES (?,?,?,?,?,?)`,
      [`SC-b${i}`, CAT_WH[p[7]], p[2], sys - (rnd() < 0.25 ? 1 : 0), sys, iso(dayOffset(-Math.floor(rnd() * 120)))]);
  }

  // ================= FİNANS =================
  const by = 'Deniz Aydın';
  const acc = { tl: 'FA-byk-tl', usd: 'FA-byk-usd', eur: 'FA-byk-eur', cash: 'FA-byk-kasa' };
  const curOf = { [acc.tl]: 'TRY', [acc.usd]: 'USD', [acc.eur]: 'EUR', [acc.cash]: 'TRY' };
  const net = { [acc.tl]: 0, [acc.usd]: 0, [acc.eur]: 0, [acc.cash]: 0 };
  let txN = 0;
  const tx = (date, account, dir, amount, category, description, party = {}, refType = 'manual', refId = null) => {
    run(`INSERT INTO fin_transactions (id, date, accountId, direction, amount, category, description, partyType, partyId, partyName, refType, refId, createdBy, createdAt, voided) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
      [`FT-byk${++txN}`, date, account, dir, r2(amount), category, description, party.type || null, party.id || null, party.name || null, refType, refId, by, nowIso]);
    net[account] += dir === 'in' ? r2(amount) : -r2(amount);
  };
  const dayOff = (d) => Math.round((new Date(`${String(d).slice(0, 10)}T00:00:00`) - dayOffset(0)) / 86400000);

  // navlun faturaları (kiracılar) ve tahsilatlar
  let nf = 0;
  CHARTERERS.forEach(([cid, cname, cur, term, grace]) => {
    const usd = cur === 'USD';
    let open = 0;
    const n = 5 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const off = -(4 + Math.floor(((n - 1 - i) * 170) / n) + Math.floor(rnd() * 12)); // i = 0 en eski fatura
      const [from, to, cargo] = pick(ROUTES);
      const [, vname] = pick(VESSELS);
      const tons = 4500 + Math.round(rnd() * 5000);
      const amount = usd ? r2(tons * (38 + rnd() * 18)) : r2(tons * (1500 + rnd() * 700));
      const d = dayOffset(off); d.setHours(11, 0);
      run(`INSERT INTO sales (id, customerId, warehouseId, productId, quantity, type, date, note, amount) VALUES (?,?,NULL,NULL,1,'navlun',?,?,?)`,
        [`NF-${++nf}`, cid, iso(d), `Navlun faturası NF-2026-${pad(100 + nf)} · ${vname} · ${from} → ${to} · ${tons.toLocaleString('tr-TR')} mt ${cargo}`, amount]);
      if (-off > term + grace) tx(dayStr(Math.min(-1, off + term + Math.floor(rnd() * 8) - 2)), usd ? acc.usd : acc.tl, 'in', amount, 'Müşteri tahsilatı', usd ? 'Navlun tahsilatı (SWIFT)' : 'Navlun tahsilatı (EFT)', { type: 'customer', id: cid, name: cname }, 'customer_payment');
      else open += amount;
    }
    run(`UPDATE customers SET balance = ? WHERE id = ?`, [r2(open), cid]);
  });

  // tedarikçi ödemeleri: vadesi dolan faturalar kapalı, son faturalar kısmi / açık
  const supRaw = {}, supPaid = {};
  all(`SELECT o.id, o.supplierId, o.invoiceNo, o.receiptDate, o.currency, s.name AS supName, s.paymentTerm AS term,
      (SELECT COALESCE(SUM(l.receivedQty * l.unitPrice * (1 - COALESCE(l.discount,0)/100) * (1 + COALESCE(l.taxRate,0)/100)),0) FROM purchase_order_lines l WHERE l.orderId = o.id) AS value
    FROM purchase_orders o LEFT JOIN suppliers s ON s.id = o.supplierId WHERE o.status IN ('received','partial') ORDER BY o.receiptDate`).forEach((p) => {
    if (!(p.value > 0)) return;
    supRaw[p.supplierId] = (supRaw[p.supplierId] || 0) + p.value;
    const account = p.currency === 'EUR' ? acc.eur : p.currency === 'USD' ? acc.usd : acc.tl;
    const due = dayOff(p.receiptDate) + Number(p.term || 30);
    let share;
    if (due < -20) share = 1; else if (due < 0) share = 0.5; else if (due < 15) share = 0.3; else return;
    const amt = share === 1 ? r2(r2(supRaw[p.supplierId]) - (supPaid[p.supplierId] || 0)) : r2(p.value * share);
    supPaid[p.supplierId] = r2((supPaid[p.supplierId] || 0) + amt);
    tx(dayStr(Math.min(-2, due)), account, 'out', amt, 'Tedarikçi ödemesi', `${p.invoiceNo} ${share < 1 ? 'kısmi ödeme' : 'ödemesi'}`, { type: 'supplier', id: p.supplierId, name: p.supName }, 'supplier_payment');
  });

  // aylık işletme giderleri (son 6 ay)
  for (let m = 0; m < 6; m++) {
    const b = -(5 + m * 30);
    tx(dayStr(b), acc.tl, 'out', 8650000 + Math.round(rnd() * 400000), 'Maaş / SGK', 'Gemi adamı ve ofis personeli maaşları, SGK');
    tx(dayStr(b - 2), acc.usd, 'out', 142000 + Math.round(rnd() * 38000), 'Yakıt (Bunker)', `Bunker ikmali (VLSFO / MGO) — ${pick(VESSELS)[1]}`);
    tx(dayStr(b + 3), acc.usd, 'out', 61000 + Math.round(rnd() * 22000), 'Yakıt (Bunker)', `Bunker ikmali (MGO) — ${pick(VESSELS)[1]}`);
    tx(dayStr(b + 1), acc.usd, 'out', 18500 + Math.round(rnd() * 9000), 'Liman & Acente', `Liman, kılavuzluk, römorkör ve acente masrafları — ${pick(ROUTES)[1]}`);
    tx(dayStr(b + 6), acc.tl, 'out', 420000 + Math.round(rnd() * 90000), 'Liman & Acente', 'Yurt içi liman hizmetleri (Aliağa / Tuzla / Dilovası)');
    tx(dayStr(b - 4), acc.tl, 'out', 1350000 + Math.round(rnd() * 250000), 'Vergi', 'KDV, muhtasar ve damga vergisi');
    tx(dayStr(b + 2), acc.tl, 'out', 185000, 'Kira', 'Maslak merkez ofis kirası');
    tx(dayStr(b + 4), acc.tl, 'out', 92000 + Math.round(rnd() * 20000), 'Enerji / fatura', 'Ofis ve Tuzla depo elektrik, su, iletişim (VSAT dahil)');
    tx(dayStr(b + 7), acc.cash, 'out', 38000 + Math.round(rnd() * 12000), 'Ofis / genel', 'Gemi kasası avansı ve ofis giderleri');
    tx(dayStr(b + 8), acc.tl, 'out', 4200 + Math.round(rnd() * 1800), 'Banka masrafı', 'SWIFT, EFT ve teminat mektubu komisyonları');
  }
  tx(dayStr(-64), acc.usd, 'out', 96000, 'Sigorta (P&I / H&M)', 'P&I kulübü ikinci taksit prim ödemesi (filo)');
  tx(dayStr(-33), acc.usd, 'out', 58500, 'Sigorta (P&I / H&M)', 'Tekne ve makine (H&M) sigortası taksiti');
  tx(dayStr(-47), acc.usd, 'out', 42000, 'Klas & Sörvey', 'M/T DARMİK ara sörvey (intermediate survey) ve klas ücretleri');
  tx(dayStr(-15), acc.tl, 'out', 640000, 'Bakım / onarım', 'M/T KARLICA kargo pompası revizyonu (Tuzla tersane)');
  tx(dayStr(-12), acc.tl, 'out', 250000, 'Virman', 'Bankadan kasaya aktarım', {}, 'transfer', 'VR-byk1');
  tx(dayStr(-12), acc.cash, 'in', 250000, 'Virman', 'Bankadan kasaya aktarım', {}, 'transfer', 'VR-byk1');
  tx(dayStr(-20), acc.usd, 'in', 7600, 'Faiz geliri', 'USD vadeli mevduat getirisi');

  // krediler: [id, ad, kurum, para birimi, anapara, yıllık faiz, vergi %, vade (ay), sonraki taksit (gün), ödenen taksit]
  [
    ['LN-byk1', 'M/T FERİCEK Gemi Alım Kredisi', 'Örnek Kalkınma Bankası', 'USD', 6500000, 8.5, 0, 96, 12, 76],
    ['LN-byk2', 'M/T KARLICA Gemi Finansmanı', 'Örnek Bankası (Denizcilik Birimi)', 'USD', 9000000, 8.9, 0, 120, 21, 30],
    ['LN-byk3', 'Havuzlama & Klas Yenileme Kredisi', 'Örnek Katılım Bankası', 'TRY', 18000000, 42, 15, 24, 6, 8],
    ['LN-byk4', 'İşletme Sermayesi (Rotatif)', 'Örnek Bankası', 'TRY', 10000000, 45, 15, 12, -2, 5],
  ].forEach(([id, name, lender, currency, principal, rate, taxRate, term, nextOff, paidCount]) => {
    const firstDue = addMonths(dayStr(nextOff), -paidCount);
    run(`INSERT INTO fin_loans (id, name, lender, currency, principal, rate, taxRate, termMonths, type, startDate, firstDueDate, status, note, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,'active','',?,?)`,
      [id, name, lender, currency, principal, rate, taxRate, term, 'annuity', addMonths(firstDue, -1), firstDue, by, nowIso]);
    buildSchedule({ principal, rate, taxRate, termMonths: term, firstDueDate: firstDue, type: 'annuity' }).forEach((s) => {
      const paid = s.no <= paidCount;
      const iid = `${id}-${s.no}`;
      run(`INSERT INTO fin_installments (id, loanId, no, dueDate, principal, interest, tax, amount, paidAmount, paidDate, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [iid, id, s.no, s.dueDate, s.principal, s.interest, s.tax, s.amount, paid ? s.amount : 0, paid ? s.dueDate : null, paid ? 'paid' : 'pending']);
      if (paid && dayOff(s.dueDate) >= -180) tx(s.dueDate, currency === 'USD' ? acc.usd : acc.tl, 'out', s.amount, 'Kredi taksiti', `${name} · ${s.no}. taksit`, { type: 'loan', id, name }, 'installment', iid);
    });
  });

  // çek / senet (TL)
  const cn = Object.fromEntries(CHARTERERS.map((c) => [c[0], c[1]]));
  const sn = Object.fromEntries(SUPPLIERS.map((s) => [s[0], s[2]]));
  [
    ['CK-byk1', 'receivable', 'ÇK-552310', 'customer', 'C002', cn.C002, 'Örnek Bankası', 1850000, 11],
    ['CK-byk2', 'receivable', 'ÇK-552977', 'customer', 'C005', cn.C005, 'Örnek Katılım', 1240000, 26],
    ['CK-byk3', 'receivable', 'ÇK-550184', 'customer', 'C002', cn.C002, 'Örnek Bankası', 960000, -3],
    ['CK-byk4', 'payable', 'SN-2026-31', 'supplier', 'SUP003', sn.SUP003, 'Örnek Bankası', 420000, 7],
    ['CK-byk5', 'payable', 'SN-2026-32', 'supplier', 'SUP004', sn.SUP004, 'Örnek Bankası', 380000, 17],
    ['CK-byk6', 'payable', 'SN-2026-33', null, null, 'Maslak ofis kirası (mülk sahibi)', 'Örnek Bankası', 185000, 8],
  ].forEach(([id, kind, no, pt, pid, pname, bank, amount, off]) => run(
    `INSERT INTO fin_cheques (id, kind, number, partyType, partyId, partyName, bank, currency, amount, dueDate, status, note, createdBy, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,'pending','',?,?)`,
    [id, kind, no, pt, pid, pname, bank, 'TRY', amount, dayStr(off), by, nowIso]));

  // planlı kalemler (nakit akışı tahmini + takvim)
  const tenant = process.env.TENANT_ID || 'beykim';
  [
    [36, 'out', 850000, 'USD', 'Bakım / onarım', 'M/T KARRUCA havuzlama (5 yıllık özel sörvey) — Tuzla tersane', null, null, null, 'PLN', 'HVZ-KRR-2026'],
    [19, 'out', 112000, 'USD', 'Sigorta (P&I / H&M)', 'P&I kulübü üçüncü taksit prim ödemesi', null, null, null, 'PLN', 'PI-2026-3'],
    [25, 'out', 8900000, 'TRY', 'Maaş / SGK', 'Ekim gemi adamı ve ofis maaşları', null, null, null, 'PLN', 'MAAS-2026-10'],
    [22, 'out', 1480000, 'TRY', 'Vergi', 'KDV beyannamesi (Eylül dönemi)', null, null, null, 'PLN', 'KDV-2026-09'],
    [9, 'out', 165000, 'USD', 'Yakıt (Bunker)', 'M/T FERİCEK bunker ikmali — Aliağa', null, null, null, 'PLN', 'BNK-FRC-10'],
    [12, 'in', 286000, 'USD', 'Müşteri tahsilatı', 'Nordic Tank — M/T DARMİK Aliağa → Rotterdam navlunu', 'customer', 'C004', 'Nordic Tank Chartering AS', 'NF', 'NF-2026-PL1'],
    [28, 'in', 7400000, 'TRY', 'Müşteri tahsilatı', 'Marmara Petrokimya — kontrat (COA) navlun ön ödemesi', 'customer', 'C002', 'Marmara Petrokimya Pazarlama A.Ş.', 'SOZ', 'COA-2026-04'],
    [15, 'out', 26000, 'EUR', 'Tedarikçi ödemesi', 'Hamburg Marine Spares — ana makine yedek parça avansı', 'supplier', 'SUP002', sn.SUP002, 'PO', 'PO-2026-017'],
  ].forEach(([off, dir, amount, cur, cat, desc, pt, pid, pname, dt, dn], i) => run(
    `INSERT INTO fin_planned (id, tenantId, date, direction, amount, currency, category, description, partyType, partyId, partyName, erpDocType, erpDocNo, status, createdBy, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'planned',?,?,?)`,
    [`PL-byk${i + 1}`, tenant, dayStr(off), dir, amount, cur, cat, desc, pt, pid, pname, dt, dn, by, nowIso, nowIso]));

  // hesaplar: dönem sonu bakiyesi hedefe yakın; açılış = hedef − hareket toplamı (en az taban)
  const target = { [acc.tl]: 36500000, [acc.usd]: 4150000, [acc.eur]: 184000, [acc.cash]: 420000 };
  const floor = { [acc.tl]: 2000000, [acc.usd]: 250000, [acc.eur]: 20000, [acc.cash]: 50000 };
  [[acc.tl, 'Ana Banka Hesabı (TL)', 'bank', 'TR00 0000 0000 0000 0000 1001 01'], [acc.usd, 'USD Navlun Hesabı', 'bank', 'TR00 0000 0000 0000 0000 1002 01'],
    [acc.eur, 'EUR Döviz Hesabı', 'bank', 'TR00 0000 0000 0000 0000 1003 01'], [acc.cash, 'Merkez Kasa (TL)', 'cash', '']]
    .forEach(([id, name, type, iban]) => run(`INSERT INTO fin_accounts (id, name, type, currency, iban, openingBalance, active, createdAt) VALUES (?,?,?,?,?,?,1,?)`,
      [id, name, type, curOf[id], iban, r2(Math.max(floor[id], target[id] - net[id])), nowIso]));

  // ================= SON İŞLEMLER + BİLDİRİMLER =================
  const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
  const act = (ts, userName, type, category, text, refLabel = '', refId = '') => run(
    `INSERT INTO activity_log (ts, userId, userName, type, category, text, refLabel, refId) VALUES (?,?,?,?,?,?,?,?)`,
    [ts, uid[(USERS.find((u) => u[1] === userName) || [])[0]] || 0, userName, type, category, text, refLabel, refId]);
  const since = iso(dayOffset(-10));
  all(`SELECT s.quantity, s.type, s.date, s.note, s.warehouseId, p.name AS pn, p.unit, c.name AS cn FROM sales s JOIN products p ON p.id = s.productId LEFT JOIN customers c ON c.id = s.customerId WHERE s.date >= ?`, [since])
    .forEach((s) => act(s.date, 'Serkan Bulut', s.type === 'iade' ? 'return' : 'sale', 'Sevkiyat',
      s.type === 'iade' ? `Gemiden iade alındı: "${s.pn}" x${s.quantity} ambara geri girdi (${s.cn}).` : `Sevkiyat kaydedildi: "${s.pn}" x${s.quantity} → ${s.cn} — Depo: ${whName[s.warehouseId] || ''} · ${s.note}`));
  const sym = { TRY: '₺', USD: '$', EUR: '€' };
  all(`SELECT date, direction, amount, category, description, accountId FROM fin_transactions WHERE date >= ? AND refType != 'installment' ORDER BY date`, [dayStr(-7)])
    .forEach((t, i) => act(new Date(`${t.date}T${pad(9 + (i % 8))}:${pad((i * 17) % 60)}:00`).toISOString(), by, 'finance', 'Finans',
      `${t.direction === 'in' ? 'Giriş' : 'Çıkış'} kaydedildi: ${Number(t.amount).toLocaleString('tr-TR')} ${sym[curOf[t.accountId]]} — ${t.category}${t.description ? ' · ' + t.description : ''}`));
  [
    [0.5, 'Ali Demir', 'purchase', 'Alış', 'PO-2026-013 mal kabul: Kuru Kumanya Paketi 20 paket teslim alındı', 'Tuzla Genel İkmal Ambarı (Kumanya & Sarf)'],
    [1.4, 'Hakan Yıldız', 'transfer', 'Depo', 'Transfer yapıldı — Boya & Kimyasal Ambarı (IMDG) → Aliağa Sahil Deposu (Tank temizlik deterjanı, 24 bidon)'],
    [2.6, 'Emre Şahin', 'unload', 'Depo', 'Araç boşaltıldı — 35 ALG 418 · Deniz Madeni Yağ Dağıtım A.Ş. (Silindir yağı 12 varil) — Depo: Aliağa Sahil Deposu'],
    [4.1, 'Canan Ergin', 'count', 'Depo', 'Stok sayımı kaydedildi — Depo: Boya & Kimyasal Ambarı (IMDG) (9 kalem, IMDG etiket kontrolü)'],
    [6.3, 'Selin Kurt', 'purchaseOrder', 'Alış', 'Satın alma siparişi onaylandı (PO-2026-015): filtre elemanları — M/T ALATEPE ve M/T KARRUCA talepleri', '', 'PO-2026-015'],
    [9.5, 'Hakan Yıldız', 'barcode', 'Depo', 'Barkod oluşturuldu: Kimyasal Kargo Hortumu 6" (Paslanmaz Flanşlı)', '8691852100246'],
    [21, 'Ali Demir', 'adjust', 'Depo', 'Stok düzeltildi: Kimyasal Koruyucu Tulum (Tip 3), 151 → 150 adet (sayım farkı)', 'Tuzla Genel İkmal Ambarı (Kumanya & Sarf)'],
    [27, 'Murat Özkan', 'purchaseOrder', 'Alış', 'Satın alma siparişi oluşturuldu (PO-2026-016): tank temizlik deterjanı — M/T KARLICA tank yıkama programı', '', 'PO-2026-016'],
  ].forEach(([h, u, type, cat, text, refLabel, refId]) => act(hoursAgo(h), u, type, cat, text, refLabel || '', refId || ''));
  // bildirimler: finans ve depo sorumlularına
  [
    [uid['deniz.aydin'], 'finance', 'Vadesi geçen kredi taksiti', 'İşletme Sermayesi (Rotatif) · 6. taksit 2 gün gecikti', 'finance?tab=loans', 3],
    [uid['deniz.aydin'], 'finance', 'Tahsil edilecek çek', 'ÇK-552310 · Marmara Petrokimya · 11 gün kaldı', 'finance?tab=cheques', 20],
    [uid['hakan.yildiz'], 'stock', 'Kritik stok', 'Jeneratör Turboşarj Tamir Kiti — 6 kit kaldı', 'stock-detail', 5],
    [uid['serkan.bulut'], 'sale', 'Yeni gemi talebi', 'RQ-FRC-2026 · M/T FERİCEK Aliağa ikmal listesi hazır', 'sales', 1],
  ].forEach(([u, type, title, body, link, h]) => run(`INSERT INTO notifications (userId, type, title, body, link, createdAt, readAt) VALUES (?,?,?,?,?,?,NULL)`, [u, type, title, body, link, hoursAgo(h)]));
  run(`INSERT INTO fin_settings (key, value) VALUES ('seeded', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [nowIso]);

  writeCreds(creds);
  save();
  return true;
};
