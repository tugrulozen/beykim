/**
 * DEPO TAKİP - Uygulama içi arama dizini
 * Modüller, alt menüler (satış türleri, raporlar, iş takip sekmeleri, stok yönetimi ...) ve
 * sık aranan kelimeler tek listede toplanır. Yalnızca şirkete açık olanlar görünür.
 */
import AppConfig from './config.js';
import { moduleAllowed } from './perms.js';

const tr = (s) => String(s || '').toLocaleLowerCase('tr').replace(/İ/g, 'i');
const fold = (s) => tr(s).replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

const JOB_TABS = [
  ['overview', 'Genel Bakış', 'ph-squares-four', 'özet durum panel'],
  ['projects', 'Projeler', 'ph-folders', 'proje sorumlu'],
  ['orders', 'Siparişler', 'ph-clipboard-text', 'sipariş miktar giden sevk'],
  ['jobs', 'İşler', 'ph-list-checks', 'iş emri süreç aşama durum'],
  ['performance', 'Performans', 'ph-chart-line-up', 'kişi performans zamanında tamamlama'],
  ['alerts', 'Uyarılar', 'ph-bell-ringing', 'gecikme uyarı'],
  ['team', 'Ekip & Yetki', 'ph-users-three', 'kullanıcı rol yetki personel'],
];

export function buildIndex() {
  const mods = AppConfig.modules;
  const on = (k) => mods[k]?.enabled && moduleAllowed(k);
  const items = [];
  const add = (label, hint, icon, route, kw = '', group = 'Modüller') => items.push({ label, hint, icon, route, group, hay: fold(`${label} ${hint} ${kw}`) });

  Object.entries(mods).filter(([k, m]) => m.enabled && moduleAllowed(k)).map(([, m]) => m).forEach((m) => add(m.label, m.description || '', m.icon, m.route, '', 'Modüller'));

  if (on('sales')) {
    AppConfig.salesTypes.forEach((t) => add(t.label, 'Satış türü', t.icon, `sales?type=${encodeURIComponent(t.id)}`, `satis ${t.badge || ''}`, 'Satış'));
  }
  if (on('reports')) {
    AppConfig.reportTypes.forEach((r) => add(r.label, 'Rapor', r.icon, r.route, 'rapor', 'Raporlar'));
  }
  // Stok Detay her zaman raporlar altında; stok yönetimi onun sekmesi
  if (AppConfig.reportTypes.some((r) => r.route === 'stock-detail')) {
    add('Stok Yönetimi', 'Tüm stoğu görüntüle, artır / azalt, ürün sil', 'ph-sliders-horizontal', 'stock-detail?tab=manage', 'stok artir azalt duzelt ekle ürün sil silme depo miktar sayim düzeltme', 'Stok');
    add('Barkod / Stok sorgula', 'Ürün, barkod veya depo stoğu ara', 'ph-barcode', 'stock-detail', 'barkod urun kod sorgu ara', 'Stok');
  }
  if (on('reports') && AppConfig.reportTypes.some((r) => r.route === 'activity')) {
    add('Son İşlemler', 'Kim, ne zaman, ne yaptı — Excel veya PDF olarak indirilebilir', 'ph-clock-counter-clockwise', 'activity', 'pdf excel islem kayit log hareket gecmis kim ne zaman denetim', 'Raporlar');
  }
  if (on('barcode')) {
    add('Barkod › Kayıtlar', 'Oluşturulan barkodlar, tekrar yazdır', 'ph-list-magnifying-glass', 'barcode?tab=records', 'barkod dizin gecmis etiket tekrar yazdir', 'Barkod');
    add('Barkod › Yazıcı ayarı', 'Zebra, TSC, ağ veya USB yazıcı bağlantısı', 'ph-printer', 'barcode?tab=printer', 'yazici etiket zpl tspl ajan bluetooth usb', 'Barkod');
  }
  if (on('finance')) {
    [['Finans › Özet', 'Nakit, alacak, borç, kredi ve vadesi yaklaşanlar', 'ph-chart-line-up', 'finance', 'finans nakit bakiye alacak borc kredi vade ozet'],
      ['Finans › Hesaplar', 'Kasa ve banka hesapları, gelir / gider / virman', 'ph-vault', 'finance?tab=accounts', 'kasa banka hesap gelir gider virman'],
      ['Finans › Müşteri bakiyeleri ve tahsilat', 'Cari bakiye, vade yaşlandırma, tahsilat, ekstre', 'ph-users-three', 'finance?tab=parties', 'musteri cari bakiye tahsilat ekstre alacak vade'],
      ['Finans › Tedarikçi borçları ve ödeme', 'Mal kabulden doğan borçlar ve ödemeler', 'ph-truck', 'finance?tab=parties&sub=suppliers', 'tedarikci borc odeme ekstre cari'],
      ['Finans › Krediler', 'Kredi taksit planı ve ödemeleri, vade hatırlatma', 'ph-bank', 'finance?tab=loans', 'kredi taksit faiz banka vade hatirlatma'],
      ['Finans › Çek / Senet', 'Alınan ve verilen çek/senet takibi', 'ph-note', 'finance?tab=cheques', 'cek senet vade tahsil'],
      ['Finans › Hareketler', 'Tüm finans hareketleri, Excel / PDF', 'ph-list-checks', 'finance?tab=ledger', 'hareket ekstre excel pdf']]
      .forEach(([l, d, i, r, k]) => add(l, d, i, r, k, 'Finans'));
  }
  if (on('jobTracking')) {
    JOB_TABS.forEach(([id, label, icon, kw]) => add(`İş Takip › ${label}`, 'İş & Durum Takip', icon, `jobs?tab=${id}`, kw, 'İş Takip'));
  }
  if (on('purchase')) {
    if (!on('suppliers')) add('Satın Alma › Tedarikçiler', 'Tedarikçi kartları', 'ph-handshake', 'purchase-module?tab=suppliers', 'tedarikci firma', 'Satın Alma');
    add('Satın Alma › Siparişler (PO)', 'Satın alma siparişleri', 'ph-receipt', 'purchase-module?tab=orders', 'po siparis mal kabul talep gemi', 'Satın Alma');
    add('Satın Alma › Yeni sipariş', 'Yeni satın alma siparişi / gemi talebi', 'ph-plus-circle', 'purchase-module?tab=orders&new=1', 'yeni siparis talep', 'Satın Alma');
    add('Satın Alma › Özet', 'Aylık alım, gemi / kategori / tedarikçi bazlı harcama, gecikenler', 'ph-chart-bar', 'purchase-module?tab=summary', 'ozet harcama rapor geciken', 'Satın Alma');
  }
  if (on('suppliers')) {
    add('Tedarikçiler', 'Tedarikçi kartları, kategori, vade, açık siparişler', 'ph-buildings', 'suppliers', 'tedarikci firma vade kategori', 'Tedarikçiler');
  }
  if (on('settings')) {
    add('Şifre değiştir', 'Ayarlar', 'ph-key', 'settings', 'sifre parola guvenlik hesap', 'Ayarlar');
    add('Önbelleği temizle', 'Ayarlar › Sorun Giderme', 'ph-broom', 'settings', 'cache onbellek yenile guncelle', 'Ayarlar');
    add('Uygulamayı yükle', 'Ayarlar › Ana ekrana ekle', 'ph-download-simple', 'settings', 'pwa kur telefon ana ekran', 'Ayarlar');
    add('Koyu tema', 'Görünüm', 'ph-moon', 'settings', 'tema karanlik gece', 'Ayarlar');
  }
  return items;
}

export function search(q, limit = 8) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return buildIndex()
    .map((it) => {
      if (!words.every((w) => it.hay.includes(w))) return null;
      const label = fold(it.label);
      const score = (label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2) + (it.group === 'Modüller' ? 0 : 0.5);
      return { it, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.it);
}
