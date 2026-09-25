/**
 * AI CoPilot bilgi motoru
 *
 * Dış servis kullanmaz: sorular Türkçe olarak çözümlenir (aksan/ek toleranslı), varlıklar (ürün, müşteri,
 * depo, tedarikçi, hammadde, kişi, sipariş/proje/iş no) veritabanından tanınır ve canlı veriyle cevaplanır.
 * Ayrıca uygulamanın nasıl kullanılacağını anlatan bir bilgi tabanı içerir.
 *
 * Kullanım: const ask = require('./copilot')({ dbAll, dbGet, sec, jt });
 *           const { message, suggestions, context } = await ask(req, text, company, context);
 * Yalnızca okur; hiçbir şeyi değiştirmez. Çıktıdaki tüm veri sec.escapeHtml ile kaçışlanır.
 */

const DAY = 86400000;

// ---------- Türkçe metin yardımcıları ----------
const fold = (s) => String(s == null ? '' : s)
  .replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr')
  .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/[^a-z0-9\s./-]/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => fold(s).split(/[\s./-]+/).filter(Boolean);
const STOP = new Set(['ve', 'ile', 'bir', 'bu', 'su', 'o', 'mi', 'mu', 'ne', 'nedir', 'kac', 'kadar', 'var', 'yok', 'icin', 'olan', 'de', 'da', 'ki', 'en', 'cok', 'az', 'bana', 'goster', 'soyle', 'listele', 'ver', 'lutfen', 'peki', 'hangi', 'nasil', 'ne', 'kg', 'lt', 'adet', 'l', 'ml', 'gr', 'durum', 'durumu', 'bilgi', 'bilgisi', 'detay', 'detayi', 'stok', 'stogu', 'stoku', 'miktar', 'miktari', 'musteri', 'musteriler', 'firma', 'firmalar', 'sirket', 'urun', 'urunler', 'satis', 'satislar', 'siparis', 'siparisler', 'tedarikci', 'tedarikciler', 'hammadde', 'hammaddeler', 'depo', 'depolar', 'borclu', 'bakiye', 'bakiyeler', 'bakiyesi', 'satin', 'alma', 'uretim', 'recete', 'receteler', 'bu', 'ay', 'hafta', 'gun', 'son', 'islem', 'islemler']);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmt = (n, d = 0) => num(n).toLocaleString('tr-TR', { maximumFractionDigits: d });
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Bir metindeki anlamlı kelimelerin (ek toleranslı, en az 3 harf) hedef kelimelerle eşleşme sayısı */
function matchCount(qTokens, targetTokens) {
  let n = 0;
  for (const t of targetTokens) {
    if (t.length < 3 || STOP.has(t)) continue;
    if (qTokens.some((q) => q.length >= 3 && !STOP.has(q) && (q === t || (q.length >= 4 && t.startsWith(q.slice(0, Math.max(4, q.length - 2)))) || (t.length >= 4 && q.startsWith(t.slice(0, Math.max(4, t.length - 2))))))) n++;
  }
  return n;
}

/** Ad listesinden, soruda geçenleri bulur: tüm anlamlı kelimeleri eşleşenler (en çok eşleşen gruplar) döner */
function findByName(list, nameOf, qTokens, { max = 6 } = {}) {
  const scored = list.map((it) => {
    const tt = tokens(nameOf(it)).filter((t) => t.length >= 3 && !STOP.has(t));
    if (!tt.length) return null;
    const m = matchCount(qTokens, tt);
    return m ? { it, m, cover: m / tt.length } : null;
  }).filter((x) => x && (x.m >= 2 || x.cover >= 0.5));
  if (!scored.length) return [];
  const best = Math.max(...scored.map((s) => s.m));
  return scored.filter((s) => s.m === best).sort((a, b) => b.cover - a.cover).slice(0, max).map((s) => s.it);
}

// ---------- Dönem çözümleme ----------
function parsePeriod(q) {
  const now = new Date();
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const today = startOfDay(now);
  const m = q.match(/son (\d{1,3}) gun/);
  if (m) return { from: new Date(today - (Number(m[1]) - 1) * DAY), to: new Date(), label: `son ${m[1]} gün` };
  if (/\bdun\b/.test(q)) return { from: new Date(today - DAY), to: today, label: 'dün' };
  if (/bugun|bu gun/.test(q)) return { from: today, to: new Date(), label: 'bugün' };
  if (/gecen hafta/.test(q)) { const d = (today.getDay() + 6) % 7; const s = new Date(today - (d + 7) * DAY); return { from: s, to: new Date(+s + 7 * DAY), label: 'geçen hafta' }; }
  if (/bu hafta|haftalik|hafta/.test(q)) { const d = (today.getDay() + 6) % 7; return { from: new Date(today - d * DAY), to: new Date(), label: 'bu hafta' }; }
  if (/gecen ay/.test(q)) return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1), label: 'geçen ay' };
  if (/bu yil|yillik|bu sene/.test(q)) return { from: new Date(now.getFullYear(), 0, 1), to: new Date(), label: 'bu yıl' };
  if (/bu ay|aylik|\bay\b/.test(q)) return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(), label: 'bu ay' };
  return null;
}

// ---------- Uygulama kullanım bilgi tabanı ----------
const KB = [
  { id: 'kb-ship', kw: ['sevkiyat nasil', 'gemiye sevk', 'sevk nasil', 'ikmal nasil', 'gemiye malzeme', 'sevkiyat yap', 'malzeme gonder', 'satis nasil', 'satis yap', 'cikis nasil'], title: 'Gemiye sevkiyat nasıl yapılır?', steps: ['<b>Gemiye Sevkiyat</b> menüsünü açın (Gemi İkmal & Sevkiyat bölümü).', '<b>Sevk edilen gemiyi</b> ve <b>çıkış ambarını</b> seçin; yalnız o ambarda stoku olan malzemeler listelenir.', 'Barkodu okutun ya da yazıp <b>Enter</b> / <b>+</b> ile ekleyin; listeden malzeme seçip miktar da girebilirsiniz.', '<b>Gemi talep no</b>, <b>teslim limanı</b> ve <b>teslim şeklini</b> (rıhtım, lanç, acente) girip <b>Sevkiyatı tamamla</b> deyin.', 'Sevkiyat şirket içi ikmaldir: stok ambardan düşer, tutar ve cari bakiye oluşmaz; kayıt <b>Raporlar › Operasyon Hareketleri</b> ve <b>Sevkiyat Çeki Listesi</b>ne düşer.'], suggestions: ['Bu ay sevkiyatlar', 'M/T FERİCEK sevkiyatları'] },
  { id: 'kb-return', kw: ['iade', 'gemiden iade', 'geri al', 'iade nasil', 'kullanilmayan malzeme'], title: 'Gemiden iade', steps: ['Gemide kullanılmayan malzeme ambara geri alınabilir; iade kaydı yöneticinin tanımladığı iade akışıyla yapılır ve stok ilgili ambara geri girer.', 'Geçmiş iadeler <b>Raporlar › Operasyon Hareketleri</b> ekranında “Gemiden iade” olarak görünür.'], suggestions: ['Son hareketler'] },
  { id: 'kb-transfer', kw: ['transfer nasil', 'ambarlar arasi', 'depolar arasi', 'ambar transfer', 'aliaga ya gonder', 'stok tasi'], title: 'Ambarlar arası transfer', steps: ['<b>Ambarlar Arası Transfer</b> menüsünde kaynak ve hedef ambarı seçin (ör. Tuzla Yedek Parça → Aliağa Sahil Deposu).', 'Barkodları okutun veya yazıp <b>Enter</b> / <b>+</b> ile ekleyin. Başka yere tıklamak barkodu kaydetmez; yarım yazılan kod alanda kalır.', '<b>Transferi Gönder</b> deyin; stok ambarlar arasında taşınır.'], suggestions: ['Son hareketler', 'Ambarlar'] },
  { id: 'kb-unload', kw: ['mal kabul nasil', 'aractan mal kabul', 'arac bosalt', 'tedarikci araci', 'gelen malzeme'], title: 'Araçtan mal kabul', steps: ['<b>Araçtan Mal Kabul</b> menüsünde teslim alan ambarı ve araç plakasını girin.', 'Gelen malzemelerin barkodlarını okutun; malzeme ambara girer.', 'Satın alma siparişine bağlı teslimatlarda <b>Satın Alma › sipariş › Mal kabul</b> kullanılır; irsaliye/fatura no zorunludur, kısmi teslim desteklenir.'], suggestions: ['Bekleyen satın alma siparişleri'] },
  { id: 'kb-count', kw: ['sayim', 'ambar sayimi', 'sayim nasil', 'stok sayim'], title: 'Ambar sayımı', steps: ['<b>Ambar Sayımı</b> menüsünde sayılacak ambarı seçin.', 'Malzeme barkodlarını okutun; her okuma bir adet sayılır, aynı barkod tekrar okununca artar.', '<b>Sayımı Kaydet</b> deyin — sistem stoğuyla fark listelenir. IMDG (boya & kimyasal) ambarında etiket kontrolü HSEQ ile birlikte yapılır.'], suggestions: ['Stok düzeltme nasıl yapılır?'] },
  { id: 'kb-adjust', kw: ['stok duzelt', 'stok artir', 'stok azalt', 'stok ekle', 'miktar duzelt', 'stok guncelle', 'stok yonetimi'], title: 'Stok düzeltme', steps: ['<b>Raporlar › Malzeme Stok Detayı › Stok Yönetimi</b> sekmesini açın.', 'Malzemeyi bulun; ambar satırındaki <b>+ / −</b> ile ya da yeni miktarı yazıp Enter ile ayarlayın.', 'Her değişiklik kim, ne zaman bilgisiyle kayda geçer; stok eksiye düşürülemez.'], suggestions: ['Düşük stoklu malzemeler'] },
  { id: 'kb-delete', kw: ['urun sil', 'urunu sil', 'malzeme sil', 'silme', 'urun kaldir', 'silerim'], title: 'Ürün (malzeme kartı) nasıl silinir?', steps: ['<b>Raporlar › Malzeme Stok Detayı › Stok Yönetimi</b> sekmesinde malzeme kartındaki çöp kutusu düğmesine basın.', 'Malzeme sevkiyat, satın alma veya sayım kaydına bağlıysa <b>silinemez</b> (geçmiş bozulmasın diye); stoğunu 0’a çekerek kullanım dışı bırakabilirsiniz.', 'Silme yalnızca yönetici ve depo yönetimi yetkisi olan rollere açıktır.'], suggestions: ['Stok düzeltme nasıl yapılır?'] },
  { id: 'kb-barcode', kw: ['barkod', 'barkod okut', 'kamera', 'okuyucu', 'el terminali'], title: 'Barkod okutma', steps: ['Kamera düğmesiyle, el okuyucusuyla ya da barkodu yazıp <b>Enter</b>’a veya yanındaki <b>+</b> düğmesine basarak ekleyebilirsiniz; telefonda klavyedeki “Git/Bitti” tuşu da ekler.', 'Barkod yalnızca bu onaylarla kaydedilir: alandan çıkmak veya ekranın başka yerine tıklamak kaydetmez, yarım kod alanda kalır.', 'Barkod okunmazsa malzeme koduyla (ör. BYK-FLT-SEP) da arayabilirsiniz.'], suggestions: ['Barkod nasıl oluşturulur?'] },
  { id: 'kb-barcodegen', kw: ['barkod olustur', 'barkod uret', 'etiket yazdir', 'etiket bas', 'barkod yazdir', 'yazici', 'etiket'], title: 'Barkod oluşturma ve etiket', steps: ['<b>Barkod Oluştur</b> menüsü Gemi İkmal & Sevkiyat bölümündedir.', 'Yeni malzeme için ad, kategori, birim, maliyet ve isterseniz ilk stoğu girin; barkod türünü (EAN-13, Code 128, QR …) ve etiket ölçüsünü seçin.', '<b>Kaydet ve yazdır</b> ile etiket basılır; aynı barkod sevkiyat, transfer ve sayımda okutulunca malzeme bulunur.', 'Yazıcı ayarı <b>Yazıcı</b> sekmesindedir (tarayıcı, Zebra ZPL, TSC TSPL veya yazdırma ajanı).'], suggestions: ['Barkod okutma'] },
  { id: 'kb-purchase', kw: ['satin alma nasil', 'po olustur', 'siparis nasil', 'gemi talebi', 'talep nasil', 'satin alma siparisi olustur', 'yeni siparis'], title: 'Satın alma siparişi nasıl açılır?', steps: ['<b>Satın Alma › Siparişler › Yeni Satın Alma</b> düğmesine basın.', '<b>Talep kaynağını</b> (Ambar stoğu ya da talep eden gemi), <b>gemi talep no</b>yu, <b>teslim limanını</b> ve <b>aciliyeti</b> (Rutin / Öncelikli / Acil — gemi bekliyor) seçin. Acil talepte teslim tarihi en geç 2 gün sonrasına çekilir.', 'Tedarikçiyi seçin (para birimi ve vade otomatik gelir), teslim ambarını ve beklenen teslim tarihini girin.', 'Malzeme kodunu veya adını yazın; katalogdan birim ve maliyet dolar. <b>Taslak kaydet</b> ya da <b>Onaya gönder</b>.', 'Onaydan sonra mal geldiğinde siparişi açıp <b>Mal kabul</b> yapın; stok ambara girer, tedarikçi borcu Finans’a yansır.'], suggestions: ['Acil gemi talepleri', 'Geciken teslimatlar'] },
  { id: 'kb-suppliers', kw: ['tedarikci ekle', 'tedarikci nasil', 'tedarikci duzenle', 'tedarikci pasif', 'tedarikciler menusu'], title: 'Tedarikçiler', steps: ['<b>Tedarikçiler</b> ayrı menüdedir (Tedarik bölümü).', '<b>Yeni tedarikçi</b> ile firma, yetkili, kategori (yedek parça, madeni yağ, boya, emniyet …), para birimi ve vadeyi girin.', 'Kategori ve durum (aktif/pasif) filtreleriyle arayın; kartta açık sipariş sayısı görünür. <b>Pasife al</b> geçmiş siparişleri etkilemez.'], suggestions: ['Tedarikçiler', 'Satın alma özeti'] },
  { id: 'kb-finance', kw: ['finans', 'kredi', 'taksit', 'tahsilat', 'kasa', 'banka hesabi', 'cek senet', 'vade hatirlatma', 'cari ekstre', 'odeme yap', 'navlun', 'takvim', 'nakit akisi'], title: 'Finans modülü', steps: ['<b>Finans</b> menüsü <i>Finans</i> yetkisi olan kullanıcılara açıktır.', 'Sekmeler: <b>Özet · Takvim · Nakit Akışı · Hesaplar · Cari · Krediler · Çek/Senet · Hareketler</b> (yöneticide ayrıca <b>Yetkiler</b>).', '<b>Cari › Müşteriler</b>: kiracıların <b>navlun alacakları</b> (fatura no, gemi, rota); <b>Tahsilat</b> ile kapanır. <b>Tedarikçiler</b>: mal kabulden doğan borç, <b>Öde</b> ile kapanır.', '<b>Krediler</b>: gemi finansmanı ve işletme kredileri taksit planıyla; <b>Takvim</b> vadeleri renkli gösterir, <b>Nakit Akışı</b> gerçekleşen ve planlı kalemleri (havuzlama, P&I, bunker) birlikte listeler.', 'Vadesi yaklaşan taksit, çek ve tedarikçi ödemeleri için bildirim gelir.'], suggestions: ['Navlun alacakları', 'Vadesi yaklaşan ödemeler'] },
  { id: 'kb-back', kw: ['geri tusu', 'geri don', 'onceki sekme', 'geri butonu'], title: 'Geri tuşu', steps: ['Sol üstteki geri tuşu bir önceki adıma döner: sekmeler arasında gezdiyseniz (ör. Hesaplar → Krediler → Hareketler) her basışta bir önceki sekmeye, en sonda da önceki menüye gider.', 'Satın almada sipariş detayı veya yeni sipariş formundan geri tuşu sipariş listesine döner.', 'Uygulama doğrudan bir sayfada açıldıysa geri tuşu ana sayfaya götürür.'], suggestions: [] },
  { id: 'kb-excel', kw: ['excel', 'pdf', 'disa aktar', 'indir', 'xlsx', 'rapor al'], title: 'Excel / PDF’e aktarma', steps: ['Rapor ve liste ekranlarındaki <b>Dışa aktar</b> düğmesine basıp Excel veya PDF seçin.', 'Excel dosyası gerçek .xlsx olarak iner; Türkçe karakterler korunur.'], suggestions: ['Raporlar neler?'] },
  { id: 'kb-reports', kw: ['raporlar', 'rapor neler', 'hareket raporu', 'ambar bakiye', 'operasyon hareketleri'], title: 'Raporlar & Hareketler', steps: ['<b>Ambar Bakiye</b>: ambar bazlı malzeme bakiyeleri.', '<b>Malzeme Stok Detayı</b>: malzeme kartı, ambar dağılımı ve stok yönetimi.', '<b>Operasyon Hareketleri</b>: kim, ne zaman, hangi sevkiyat / transfer / mal kabul / sayım / finans işlemini yaptı; tarih, kişi ve türe göre süzülür.', '<b>Sevkiyat Çeki Listesi</b>: son 30 günün gemi sevkiyatları; <b>Seri / Barkod Detay</b>: barkod sorgusu.'], suggestions: ['Son hareketler'] },
  { id: 'kb-password', kw: ['sifre', 'parola', 'sifremi', 'giris yapamiyorum', 'sifre degistir'], title: 'Şifre değiştirme', steps: ['<b>Ayarlar › Şifre Değiştir</b> bölümünü açın; mevcut ve yeni şifrenizi girin.', 'Şifrenizi unuttuysanız yönetici <b>Finans › Yetkiler</b> ekranından sıfırlayabilir.'], suggestions: [] },
  { id: 'kb-roles', kw: ['yetki', 'rol', 'kullanici ekle', 'kullanici olustur', 'erisim', 'roller'], title: 'Roller ve yetkiler', steps: ['Kullanıcı ve rol yönetimi <b>Finans › Yetkiler</b> sekmesindedir (yalnız yönetici).', 'Roller: <b>Yönetici</b>, <b>Teknik / Operasyon Müdürü</b>, <b>Satın Alma & Planlama</b>, <b>Depo Şefi</b>, <b>Ambar Memuru</b>, <b>Gemi İkmal & Sevkiyat</b>, <b>HSEQ / Kalite</b>, <b>Finans Sorumlusu</b>, <b>Görüntüleyici</b> ve sunum için <b>İnceleme</b> (salt okunur).', 'Yetkiler: depo verisini görüntüleme, sevkiyat / satın alma / tedarikçi kaydı, ambar işlemleri (mal kabul, transfer, sayım, barkod), finans görüntüleme ve finans kaydı, kullanıcı yönetimi. Bir rolün yetkisini değiştirmek o roldeki herkesi etkiler.'], suggestions: [] },
  { id: 'kb-install', kw: ['telefona yukle', 'ana ekran', 'uygulama yukle', 'pwa', 'tablet'], title: 'Uygulamayı telefona / tablete yükleme', steps: ['<b>Ayarlar › Uygulamayı yükle</b> düğmesine basın.', 'iPhone / iPad’de Safari’de <b>Paylaş › Ana Ekrana Ekle</b>.', 'Uygulama telefon, tablet ve bilgisayarda aynı menülerle çalışır.'], suggestions: [] },
  { id: 'kb-cache', kw: ['eski surum', 'guncel degil', 'onbellek', 'cache', 'yenilenmiyor', 'degisiklik gorunmuyor'], title: 'Eski sürüm görünüyorsa', steps: ['<b>Ayarlar › Sorun Giderme › Önbelleği temizle ve yenile</b> düğmesine basın.', 'Bilgisayarda Ctrl+F5 ile de yenileyebilirsiniz.'], suggestions: [] },
  { id: 'kb-offline', kw: ['internet', 'cevrimdisi', 'offline', 'baglanti', 'sunucuya ulasilamiyor', 'baglanamiyor'], title: 'Bağlantı sorunları', steps: ['Üstteki şerit bağlantı durumunu gösterir: <b>çevrimdışı</b> veya <b>sunucuya ulaşılamıyor</b>.', 'Çevrimdışıyken kayıt yapılmaz; bağlantı gelince uygulama kendini yeniler.'], suggestions: [] },
  { id: 'kb-shipping', kw: ['ceki listesi', 'irsaliye', 'ceki'], title: 'Sevkiyat çeki listesi', steps: ['<b>Raporlar › Sevkiyat Çeki Listesi</b> son 30 günün sevkiyatlarını gemi ve gün bazında gruplar.', 'Sevkiyatı açıp kalem ve koli bilgisini girerek çeki listesini oluşturun; tamamlananlar listeden düşer.'], suggestions: [] },
  { id: 'kb-search', kw: ['arama', 'nasil ararim', 'menu bul', 'nerede'], title: 'Menüde arama', steps: ['Üstteki <b>arama kutusuna</b> menü adını yazın (ör. “sevkiyat”, “tedarikçi”, “navlun”, “takvim”).', 'Ok tuşlarıyla gezip <b>Enter</b> ile açın; telefonda <b>İşlemler</b> sayfasında da arama vardır.'], suggestions: [] },
  { id: 'kb-activity', kw: ['son islem', 'islem gecmisi', 'kim yapti', 'kim ne zaman', 'islem kaydi', 'log', 'denetim'], title: 'Operasyon hareketleri (kim, ne zaman, ne yaptı)', steps: ['<b>Raporlar › Operasyon Hareketleri</b> ekranını açın.', 'Dönemi, çalışanı ve işlem türünü (Sevkiyat, Alış, Depo, Finans) seçin; malzeme, gemi veya sipariş no ile arayın.', '<b>Dışa aktar</b> ile Excel / PDF alın.'], suggestions: ['Son hareketler'] },
  { id: 'kb-notify', kw: ['bildirim', 'haber ver', 'bana bildir'], title: 'Bildirimler', steps: ['Çan simgesinde vadesi yaklaşan finans kalemleri, kritik stok ve size yönelik bildirimler görünür.', 'Bildirime dokununca ilgili ekran açılır; <b>Tümünü okundu yap</b> ile temizlenir.'], suggestions: [] },
  { id: 'kb-theme', kw: ['koyu tema', 'karanlik', 'tema'], title: 'Tema', steps: ['Sağ üstteki ay/güneş simgesi koyu ve açık tema arasında geçiş yapar.'], suggestions: [] },
];

// Filo (beykim.com.tr/filomuz): [ad, tip, LOA m, LBP m, derinlik m, draft m, DWT t, GT, NT]
const FLEET = [
  ['M/T ALATEPE', 'Double Hull IMO II-III Oil/Chemical Tanker', 115.5, 104.3, 7.98, 6.32, 6239, 3693, 4500],
  ['M/T DARMİK', 'Double Hull IMO II-III Oil/Chemical Tanker', 120.77, 110.9, 8.4, 6.7, 7071, 5006, 2100],
  ['M/T FERİCEK', 'Double Hull IMO II-III Oil/Chemical Tanker', 126.72, 116.49, 9.9, 7.8, 10116, 6737, 3242],
  ['M/T KARLICA', 'Double Hull IMO II-III Oil/Chemical Tanker', 136.07, 126.0, 10.3, 8.03, 12000, 8426, 3934],
  ['M/T KARRUCA', 'Double Hull IMO II-III Oil/Chemical Tanker', 112.0, 105.9, 9.15, 7.36, 7721, 5214, 2043],
];
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F000}-\u{1F2FF}]\u{FE0F}?/gu;

// ---------- Ana fabrika ----------
module.exports = function createCopilot({ dbAll, dbGet, sec, jt }) {
  const h = sec.escapeHtml;
  const tbl = (head, rows) => `<table><tr>${head.map((x) => `<th>${h(x)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const safe = async (fn, fallback) => { try { return await fn(); } catch (_e) { return fallback; } };

  async function ask(req, message, company, context = {}) {
    const raw = String(message || '').slice(0, 300).trim();
    const q = fold(raw);
    const qt = tokens(raw);
    const perms = Array.isArray(req.perms) ? req.perms : [];
    const canJobs = false; // Beykim: İş Takip modülü kapalı
    const companyName = h(String(company || '').slice(0, 60)) || 'Depo';
    const ctxOut = {};

    // Varlıklar: veritabanı kayıtları tembel yüklenir ve önbelleğe alınır
    const cache = {};
    const load = async (key, sql, params = []) => (cache[key] || (cache[key] = await safe(() => dbAll(sql, params), [])));
    const products = () => load('p', `SELECT id, code, barcode, name, unit, stock, price, category FROM products`);
    const customers = () => load('c', `SELECT id, name, balance, currency FROM customers`);
    const warehouses = () => load('w', `SELECT w.id, w.code, w.name, b.name AS branchName FROM warehouses w LEFT JOIN branches b ON b.id = w.branchId`);
    const rawMats = () => load('r', `SELECT id, code, name, unit, stock, minStock FROM raw_materials`);
    const suppliers = () => load('s', `SELECT id, name, category, phone, contactPerson, totalOrders, totalAmount, currency, paymentTerm FROM suppliers WHERE status != 'passive' OR status IS NULL`);
    const usersList = () => load('u', `SELECT id, name, title, department FROM users WHERE active != 0`);

    const ents = {};
    const codeHit = raw.match(/\b(\d{8,14})\b/);
    if (codeHit) ents.product = (await products()).filter((p) => p.barcode === codeHit[1]);
    if (!ents.product || !ents.product.length) {
      const codeTok = qt.find((t) => /^(itm|prd)/.test(t) && /\d/.test(t));
      if (codeTok) ents.product = (await products()).filter((p) => fold(p.id) === codeTok || fold(p.code) === codeTok);
    }
    if (!ents.product || !ents.product.length) ents.product = findByName(await products(), (p) => p.name, qt);
    ents.customer = findByName(await customers(), (c) => c.name, qt, { max: 3 });
    ents.warehouse = findByName(await warehouses(), (w) => `${w.name} ${w.branchName || ''}`.replace(/depo/gi, ''), qt.filter((t) => t !== 'depo' && t !== 'depoda' && t !== 'deposu'), { max: 3 });
    ents.raw = findByName(await rawMats(), (m) => m.name, qt, { max: 4 });
    ents.supplier = findByName(await suppliers(), (s) => s.name, qt, { max: 3 });
    // Ürün adı hammadde adıyla da eşleşiyorsa (ör. "fındık") bağlama göre seçilir; aşağıda kontrol edilir
    if (canJobs) ents.user = findByName(await usersList(), (u) => u.name, qt, { max: 3 });

    // Önceki cevabın bağlamı: "peki depolara göre?" gibi kısa devam soruları
    const noEnt = !(ents.product.length || ents.customer.length || ents.raw.length || ents.supplier.length || (ents.user && ents.user.length));
    if (noEnt && context && qt.length <= 6) {
      if (context.productId) ents.product = (await products()).filter((p) => p.id === context.productId);
      else if (context.customerId) ents.customer = (await customers()).filter((c) => c.id === context.customerId);
    }
    const one = (arr) => (arr && arr.length ? arr[0] : null);

    const has = (re) => re.test(q);
    const period = parsePeriod(q);
    const ctx = { q, qt, raw, req, perms, canJobs, ents, period, h, tbl, fmt, safe, products, customers, warehouses, rawMats, suppliers, usersList, one, has, ctxOut, dbAll, dbGet, jt, load, companyName };

    // ---------- niyet puanlama ----------
    const scored = INTENTS.map((it) => ({ it, s: it.score(ctx) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    let out = null;
    for (const { it } of scored) {
      out = await safe(() => it.run(ctx), null);
      if (out) break;
    }
    if (!out) out = await fallback(ctx, scored);

    if (!ctxOut.productId && ents.product.length === 1) ctxOut.productId = ents.product[0].id;
    if (!ctxOut.customerId && ents.customer.length === 1 && !ctxOut.productId) ctxOut.customerId = ents.customer[0].id;
    out.html = String(out.html).replace(EMOJI, '').replace(/<br>\s+/g, '<br>').replace(/^\s+/, '');
    return { message: out.html, suggestions: (out.suggestions || []).slice(0, 4), context: ctxOut };
  }

  // ---------- Niyetler ----------
  const INTENTS = [];
  const intent = (id, score, run) => INTENTS.push({ id, score, run });
  const wordHit = (qt, w) => qt.some((t) => t === w || (w.length >= 3 && t.startsWith(w) && t.length <= w.length + 6) || (w.length >= 5 && t.length >= 4 && w.startsWith(t.slice(0, Math.max(4, t.length - 3))) && t.slice(0, 4) === w.slice(0, 4)));
  const kbHit = (c) => {
    let best = null;
    KB.forEach((e) => {
      const hits = e.kw.filter((k) => k.split(' ').every((w) => wordHit(c.qt, w))).length;
      if (hits && (!best || hits > best.hits)) best = { e, hits };
    });
    return best;
  };

  intent('greet', (c) => (/^(merhaba|selam|selamlar|hey|gunaydin|iyi gunler|iyi aksamlar|slm|mrb)\b/.test(c.q) || /^(nasilsin|naber)/.test(c.q) ? 12 : 0), (c) => ({
    html: `Merhaba, <b>${c.companyName} AI CoPilot</b> burada. Ambar stokları, gemilere sevkiyat, satın alma ve tedarikçiler, filo, navlun alacakları, krediler ve nakit durumu hakkında sorabilirsiniz; uygulamanın nasıl kullanılacağını da adım adım anlatırım.`,
    suggestions: ['Stok durumu', 'Bu ay sevkiyatlar', 'Acil gemi talepleri', 'Neler sorabilirim?'],
  }));
  intent('thanks', (c) => (/(tesekkur|sagol|eyvallah|saol|harika|super|mukemmel)/.test(c.q) && c.qt.length <= 5 ? 12 : 0), () => ({
    html: 'Rica ederim! Başka bir konuda yardımcı olabilirsem yazmanız yeterli. 🙂'.replace('🙂', ''), suggestions: ['Neler sorabilirim?'],
  }));
  intent('clock', (c) => (/(bugun.*(tarih|gun)|tarih ne|saat kac|kacinci gun)/.test(c.q) ? 11 : 0), () => {
    const d = new Date();
    return { html: `Bugün <b>${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</b>, saat <b>${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</b>.`, suggestions: [] };
  });

  intent('help', (c) => (/(yardim|help|ne yapabilirsin|neler sorabilirim|ne sorabilirim|yeteneklerin|kimsin|nesin)/.test(c.q) ? 11 : 0), async () => ({
    html: '<b>Şunları sorabilirsiniz</b><br><br>' +
      '<b>Ambar ve stok:</b> “Yakıt separatörü filtresi stoğu”, “düşük stoklu malzemeler”, “Aliağa deposunda ne var?”, “stok değeri”<br>' +
      '<b>Sevkiyat:</b> “Bu ay sevkiyatlar”, “M/T FERİCEK’e ne gönderildi?”, “en çok sevk edilen malzemeler”<br>' +
      '<b>Satın alma:</b> “Acil gemi talepleri”, “geciken teslimatlar”, “PO-2026-010”, “boya tedarikçileri”<br>' +
      '<b>Filo:</b> “Filomuz”, “M/T KARLICA özellikleri”, “Beykim hakkında”<br>' +
      '<b>Finans:</b> “Navlun alacakları”, “kasada ne kadar var?”, “kredilerimiz”, “vadesi yaklaşan ödemeler”, “bu ay bunker gideri”, “planlı ödemeler / havuzlama”<br>' +
      '<b>Kullanım:</b> “Sevkiyat nasıl yapılır?”, “Gemi talebi nasıl açılır?”, “Barkod okutma”, “Roller ve yetkiler”, “Geri tuşu nasıl çalışır?”',
    suggestions: ['Stok durumu', 'Bu ay sevkiyatlar', 'Navlun alacakları', 'Sevkiyat nasıl yapılır?'],
  }));

  // Şirket ve filo
  intent('company', (c) => (/(beykim|sirket hakkinda|firma hakkinda|hakkimizda|kurulus|iso 9001|iso 14001|kalite politikasi)/.test(c.q) && !/(nasil|stok|sevk|kredi)/.test(c.q) ? 10 : 0), () => ({
    html: '<b>Beykim Denizcilik</b> 1985’te kurulmuş, kimyasal ve petrol tanker işletmeciliği yapan bir armatör şirketidir; merkezi Maslak / İstanbul’dadır. ' +
      'Filoda <b>5 adet çift cidarlı IMO II-III kimyasal / petrol tankeri</b> (Türk bayraklı) bulunur. ISO 9001:2015 ve ISO 14001:2015 belgelidir.<br><br>' +
      'Bu uygulamada: Tuzla ve Aliağa ambarlarının malzeme takibi, gemilere sevkiyat, satın alma ve tedarikçiler ile navlun alacakları, gemi finansmanı ve nakit takibi yapılır.',
    suggestions: ['Filomuz', 'Ambarlar', 'Navlun alacakları'],
  }));
  intent('fleet', (c) => (/\b(filo|filomuz|filoda|gemiler|gemilerimiz|tanker|tankerler|dwt|tonaj|gross|loa|draft|ozellik\w*|kapasite\w*)\b/.test(c.q) && !/(sevk|gonder|talep|siparis|tedarik|stok)/.test(c.q) ? 10 : 0), async (c) => {
    const one = FLEET.find(([n]) => c.qt.some((t) => t.length >= 4 && fold(n).includes(t)));
    if (one) {
      const [n, type, loa, lbp, dept, draft, dwt, gt, nt] = one;
      return { html: `<b>${h(n)}</b> — ${h(type)}<br><br>` + tbl(['Özellik', 'Değer'], [['LOA', `${fmt(loa, 2)} m`], ['LBP', `${fmt(lbp, 2)} m`], ['Derinlik', `${fmt(dept, 2)} m`], ['Draft', `${fmt(draft, 2)} m`], ['S.DWT', `<b>${fmt(dwt)} t</b>`], ['Gross', `${fmt(gt)} t`], ['Net', `${fmt(nt)} t`], ['Bayrak', 'Türk']]), suggestions: [`${n} sevkiyatları`, `${n} satın alma talepleri`, 'Filomuz'] };
    }
    return { html: '<b>Filo</b> — 5 çift cidarlı IMO II-III kimyasal / petrol tankeri, Türk bayraklı<br><br>' + tbl(['Gemi', 'LOA', 'Draft', 'DWT', 'Gross'], FLEET.map(([n, , loa, , , draft, dwt, gt]) => [`<b>${h(n)}</b>`, `${fmt(loa, 2)} m`, `${fmt(draft, 2)} m`, `${fmt(dwt)} t`, `${fmt(gt)} t`])) + `<br>Toplam taşıma kapasitesi: <b>${fmt(FLEET.reduce((a, f) => a + f[6], 0))} DWT</b>`, suggestions: ['M/T FERİCEK özellikleri', 'Bu ay sevkiyatlar'] };
  });

  // Kullanım rehberi (nasıl / nerede)
  intent('howto', (c) => {
    const k = kbHit(c);
    if (!k) return 0;
    const ask = /(nasil|nerede|nereden|ne yapmaliyim|adim|yapilir|yapabilirim|olur|rehber|anlat|kullan)/.test(c.q);
    return k.hits * 3 + (ask ? 6 : 0);
  }, (c) => {
    const { e } = kbHit(c);
    return { html: `🧭 <b>${h(e.title)}</b><br><br>${e.steps.map((s, i) => `${i + 1}. ${s}`).join('<br>')}`, suggestions: e.suggestions || [] };
  });

  // Ürün stoğu (belirli ürün)
  intent('product', (c) => (c.ents.product.length ? 7 + (/(stok|kac|var mi|kalan|mevcut|depo|fiyat|ne kadar)/.test(c.q) ? 3 : 0) : 0), async (c) => {
    const list = c.ents.product.slice(0, 6);
    const bal = await c.load('wb', `SELECT ws.productId, ws.warehouseId, ws.qty, w.name AS wname FROM warehouse_stock ws LEFT JOIN warehouses w ON w.id = ws.warehouseId WHERE ws.qty > 0`);
    const since = new Date(Date.now() - 30 * DAY).toISOString();
    if (list.length === 1) {
      const p = list[0];
      c.ctxOut.productId = p.id;
      const parts = bal.filter((b) => b.productId === p.id);
      const sold = await c.safe(() => c.dbGet(`SELECT COALESCE(SUM(CASE WHEN type='iade' THEN -quantity ELSE quantity END),0) AS q FROM sales WHERE productId = ? AND date >= ?`, [p.id, since]), { q: 0 });
      const openPo = await c.safe(() => c.dbAll(`SELECT o.id, o.expectedDate, l.qty - l.receivedQty AS rem FROM purchase_order_lines l JOIN purchase_orders o ON o.id = l.orderId WHERE l.productCode = ? AND o.status IN ('approved','ordered','partial','pending') AND l.qty > l.receivedQty`, [p.code]), []);
      const perDay = sold.q > 0 ? sold.q / 30 : 0;
      const daysLeft = perDay > 0 ? Math.floor(p.stock / perDay) : null;
      const recipe = await c.safe(() => c.dbGet(`SELECT id, name FROM recipes WHERE productId = ?`, [p.id]), null);
      const openOrders = c.canJobs ? await c.safe(() => c.dbAll(`SELECT o.orderNo, l.qty FROM jt_order_lines l JOIN jt_orders o ON o.id = l.orderId WHERE l.productId = ? AND o.status != 'cancelled'`, [p.id]), []) : [];
      let html = `📦 <b>${h(p.name)}</b><br>Kod: ${h(p.code || '-')} • Barkod: ${h(p.barcode || '-')} • Kategori: ${h(p.category || '-')}<br><br>` +
        `Toplam stok: <b>${fmt(p.stock)} ${h(p.unit || '')}</b>` + (p.price ? ` • Birim maliyet: <b>${fmt(p.price, 2)} ₺</b> • Stok değeri: <b>${fmt(p.stock * p.price)} ₺</b>` : '');
      if (p.stock <= 0) html += '<br>🔴 <b>Stokta yok.</b>';
      else if (p.stock <= 20) html += '<br>⚠️ <b>Düşük stok</b> seviyesinde.';
      html += `<br><br><b>Ambarlara göre</b><br>` + (parts.length ? tbl(['Ambar', 'Miktar'], parts.map((b) => [h(b.wname || b.warehouseId), `<b>${fmt(b.qty)}</b>`])) : 'Depo kaydı yok.');
      html += `<br>Son 30 günde gemilere net sevk: <b>${fmt(sold.q)}</b> ${h(p.unit || '')}` + (daysLeft != null ? ` → mevcut tüketimle yaklaşık <b>${daysLeft} gün</b> yeter.` : '.');
      if (openPo.length) html += `<br>Yoldaki satın alma: ${openPo.map((o) => `${h(o.id)} (${fmt(o.rem)} ${h(p.unit || '')}, beklenen ${h(o.expectedDate || '-')})`).join(', ')}`;
      if (openOrders.length) html += `<br>Açık iş takip siparişleri: ${openOrders.slice(0, 5).map((o) => `${h(o.orderNo)} (${fmt(o.qty)})`).join(', ')}`;
      return { html, suggestions: ['Düşük stoklu malzemeler', 'En çok sevk edilen malzemeler', 'Bekleyen siparişler'] };
    }
    return {
      html: `📦 <b>${list.length} ürün eşleşti</b><br><br>` + tbl(['Ürün', 'Kod', 'Stok', 'Fiyat'], list.map((p) => [h(p.name) + (p.stock <= 20 ? ' ⚠️' : ''), h(p.code || '-'), `<b>${fmt(p.stock)}</b> ${h(p.unit || '')}`, p.price ? `${fmt(p.price, 2)} ₺` : '-'])),
      suggestions: list.slice(0, 3).map((p) => `${p.name} stoğu`),
    };
  });

  intent('lowstock', (c) => (/(azalan|azaldi|biten|bitmek uzere|tukenen|tukendi|kritik|dusuk stok|stogu az|az kalan|yetersiz|minimum|sifir stok|stokta olmayan|siparis ver)/.test(c.q) && !/\b(is|isler|proje|projeler|uyari)\b/.test(c.q) ? 9 : 0), async (c) => {
    const lim = Number((c.q.match(/(\d+)\s*(?:adet)?\s*(?:altinda|alti|den az|dan az)/) || [])[1]) || 20;
    const prods = (await c.products()).filter((p) => p.stock <= lim).sort((a, b) => a.stock - b.stock);
    const raws = (await c.rawMats()).filter((m) => m.stock <= m.minStock).sort((a, b) => a.stock - b.stock);
    let html = `<b>Düşük / biten stoklar</b> (eşik: ${lim})<br><br>`;
    html += prods.length ? tbl(['Malzeme', 'Stok'], prods.slice(0, 15).map((p) => [h(p.name), p.stock <= 0 ? '<b>0</b> 🔴' : `<b>${fmt(p.stock)}</b> ${h(p.unit || '')}`])) : 'Eşiğin altında ürün yok. 🟢';
    if (raws.length) html += `<br><b>Kritik hammaddeler</b><br>` + tbl(['Hammadde', 'Stok', 'Min.'], raws.slice(0, 10).map((m) => [h(m.name), `<b>${fmt(m.stock, 1)}</b> ${h(m.unit)}`, fmt(m.minStock, 1)]));
    html = html.replace(/🟢/g, '');
    return { html, suggestions: ['Gemi talebi nasıl açılır?', 'Bekleyen siparişler', 'Stok durumu'] };
  });

  intent('stockValue', (c) => (/(stok degeri|envanter degeri|depodaki mal degeri|stok tutari|toplam deger)/.test(c.q) ? 10 : 0), async (c) => {
    const prods = await c.products();
    const total = prods.reduce((s, p) => s + p.stock * (p.price || 0), 0);
    const byCat = {};
    prods.forEach((p) => { const k = p.category || 'Genel'; byCat[k] = (byCat[k] || 0) + p.stock * (p.price || 0); });
    return { html: `<b>Stok değeri</b> (birim maliyet × stok)<br><br>Toplam: <b>${fmt(total)} ₺</b><br><br>` + tbl(['Kategori', 'Değer'], Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => [h(k), `${fmt(v)} ₺`])), suggestions: ['Stok durumu', 'Azalan ürünler'] };
  });

  intent('warehouseStock', (c) => (c.ents.warehouse.length && /(depo|stok|ne var|icinde|urun|bakiye)/.test(c.q) ? 8 : 0), async (c) => {
    const w = c.ents.warehouse[0];
    const rows = await c.dbAll(`SELECT p.name, p.unit, ws.qty FROM warehouse_stock ws JOIN products p ON p.id = ws.productId WHERE ws.warehouseId = ? AND ws.qty > 0 ORDER BY ws.qty DESC`, [w.id]);
    const total = rows.reduce((s, r) => s + r.qty, 0);
    return { html: `<b>${h(w.name)}</b>${w.branchName ? ' — ' + h(w.branchName) : ''}<br>${rows.length} çeşit malzeme, toplam <b>${fmt(total)}</b> birim.<br><br>` + (rows.length ? tbl(['Malzeme', 'Miktar'], rows.slice(0, 20).map((r) => [h(r.name), `<b>${fmt(r.qty)}</b> ${h(r.unit || '')}`])) + (rows.length > 20 ? `<br>… ve ${rows.length - 20} malzeme daha.` : '') : 'Bu ambarda stok yok.'), suggestions: ['Ambarlar', 'Stok durumu'] };
  });

  intent('stockOverview', (c) => (/(stok|envanter|urun(ler)?|depoda ne|ne var)/.test(c.q) ? 5 : 0), async (c) => {
    const prods = await c.products();
    const total = prods.reduce((s, p) => s + p.stock, 0);
    const low = prods.filter((p) => p.stock <= 20);
    const byCat = {};
    prods.forEach((p) => { const k = p.category || 'Genel'; (byCat[k] = byCat[k] || { n: 0, s: 0 }); byCat[k].n++; byCat[k].s += p.stock; });
    return {
      html: `<b>Ambar stok durumu</b><br><br>${prods.length} çeşit malzeme, toplam <b>${fmt(total)}</b> birim.` + (low.length ? `<br><b>${low.length}</b> malzemede düşük stok var.` : '') +
        `<br><br>` + tbl(['Kategori', 'Çeşit', 'Toplam'], Object.entries(byCat).sort((a, b) => b[1].s - a[1].s).map(([k, v]) => [h(k), v.n, `<b>${fmt(v.s)}</b>`])),
      suggestions: ['Düşük stoklu malzemeler', 'Stok değeri', 'Ambarlar'],
    };
  });

  intent('topStock', (c) => (/(en cok stok|en fazla stok|stogu en yuksek|en cok olan)/.test(c.q) ? 10 : 0), async (c) => {
    const top = (await c.products()).slice().sort((a, b) => b.stock - a.stock).slice(0, 10);
    return { html: `📦 <b>En çok stoğu olan ürünler</b><br><br>` + tbl(['Ürün', 'Stok'], top.map((p) => [h(p.name), `<b>${fmt(p.stock)}</b> ${h(p.unit || '')}`])), suggestions: ['Azalan ürünler'] };
  });

  intent('topSelling', (c) => (/(en cok sevk|en cok gonderilen|en cok kullanilan|en cok cikan|en cok sat|hic sevk edilmeyen|kullanilmayan|durgun)/.test(c.q) ? 11 : 0), async (c) => {
    const p = c.period || { from: new Date(Date.now() - 90 * DAY), to: new Date(), label: 'son 90 gün' };
    if (/(hic sevk|kullanilmayan|durgun)/.test(c.q)) {
      const rows = await c.dbAll(`SELECT p.name, p.stock, p.unit FROM products p WHERE p.stock > 0 AND p.id NOT IN (SELECT productId FROM sales WHERE date >= ? AND type != 'iade' AND productId IS NOT NULL) ORDER BY p.stock DESC`, [p.from.toISOString()]);
      return { html: `<b>${h(p.label)} içinde hiç sevk edilmeyen malzemeler</b><br><br>` + (rows.length ? tbl(['Malzeme', 'Stok'], rows.slice(0, 15).map((r) => [h(r.name), `${fmt(r.stock)} ${h(r.unit || '')}`])) : 'Tüm malzemeler en az bir kez sevk edilmiş.'), suggestions: ['Stok değeri'] };
    }
    const rows = await c.dbAll(`SELECT p.name, p.unit, SUM(s.quantity) AS q, COUNT(DISTINCT s.customerId) AS nv FROM sales s JOIN products p ON p.id = s.productId WHERE s.date >= ? AND s.date < ? AND s.type != 'iade' GROUP BY p.id ORDER BY q DESC LIMIT 10`, [p.from.toISOString(), p.to.toISOString()]);
    return { html: `<b>En çok sevk edilen malzemeler</b> (${h(p.label)})<br><br>` + (rows.length ? tbl(['Malzeme', 'Miktar', 'Gemi sayısı'], rows.map((r) => [h(r.name), `<b>${fmt(r.q)}</b> ${h(r.unit || '')}`, r.nv])) : 'Bu dönemde sevkiyat yok.'), suggestions: ['Bu ay sevkiyatlar', 'Hiç sevk edilmeyen malzemeler'] };
  });

  intent('sales', (c) => (/(sevk|sevkiyat|ikmal|gonderilen|gonderdik|gemiye giden|satis|cikis)/.test(c.q) && !/(nasil|yapilir|ceki)/.test(c.q) ? 8 : 0), async (c) => {
    const p = c.period || { from: new Date(Date.now() - 30 * DAY), to: new Date(Date.now() + DAY), label: 'son 30 gün' };
    const vessel = c.ents.customer.find((x) => /^GM/.test(x.id)) || null;
    const rows = await c.dbAll(`SELECT s.quantity, s.type, s.date, s.note, s.customerId, p.name AS pname, p.unit, p.category, cu.name AS cname, w.name AS wname FROM sales s JOIN products p ON p.id = s.productId LEFT JOIN customers cu ON cu.id = s.customerId LEFT JOIN warehouses w ON w.id = s.warehouseId
      WHERE s.date >= ? AND s.date < ? ${vessel ? 'AND s.customerId = ?' : ''} ORDER BY s.date DESC`, [p.from.toISOString(), p.to.toISOString(), ...(vessel ? [vessel.id] : [])]);
    if (!rows.length) return { html: `${vessel ? h(vessel.name) + ' için ' : ''}${h(p.label)} içinde sevkiyat kaydı yok.`, suggestions: ['Son 90 gün sevkiyatlar', 'En çok sevk edilen malzemeler'] };
    const out = rows.filter((r) => r.type !== 'iade'); const ret = rows.filter((r) => r.type === 'iade');
    const group = (arr, k) => Object.entries(arr.reduce((m, r) => { m[r[k] || '-'] = (m[r[k] || '-'] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
    let html = `<b>Gemi sevkiyatları</b> — ${vessel ? h(vessel.name) + ', ' : ''}${h(p.label)}<br><br>Sevkiyat kalemi: <b>${out.length}</b>` + (ret.length ? ` • Gemiden iade: <b>${ret.length}</b>` : '');
    if (!vessel) html += '<br><br><b>Gemilere göre</b><br>' + tbl(['Gemi', 'Kalem'], group(out, 'cname').map(([k, v]) => [h(k), `<b>${v}</b>`]));
    html += '<br><b>Malzeme kategorisine göre</b><br>' + tbl(['Kategori', 'Kalem'], group(out, 'category').slice(0, 6).map(([k, v]) => [h(k), v]));
    html += '<br><b>Son sevkiyatlar</b><br>' + tbl(['Tarih', 'Malzeme', 'Gemi', 'Miktar'], rows.slice(0, 8).map((r) => [h(String(r.date).slice(0, 10)), h(r.pname), h(r.cname || '-'), `${r.type === 'iade' ? 'İade ' : ''}<b>${fmt(r.quantity)}</b> ${h(r.unit || '')}`]));
    return { html, suggestions: vessel ? [`${vessel.name} özellikleri`, `${vessel.name} satın alma talepleri`] : ['En çok sevk edilen malzemeler', 'Filomuz'] };
  });

  intent('customer', (c) => (c.ents.customer.length && !c.ents.product.length ? 8 : c.ents.customer.length ? 4 : 0), async (c) => {
    const cu = c.ents.customer[0];
    c.ctxOut.customerId = cu.id;
    if (/^GM/.test(cu.id)) { // gemi kartı
      const spec = FLEET.find(([n]) => fold(n) === fold(cu.name));
      const last = await c.dbAll(`SELECT s.date, s.quantity, s.type, p.name AS pname, p.unit FROM sales s JOIN products p ON p.id = s.productId WHERE s.customerId = ? ORDER BY s.date DESC LIMIT 6`, [cu.id]);
      const cnt = await c.safe(() => c.dbGet(`SELECT COUNT(*) AS n FROM sales WHERE customerId = ? AND type != 'iade' AND date >= ?`, [cu.id, new Date(Date.now() - 90 * DAY).toISOString()]), { n: 0 });
      const pos = await c.safe(() => c.dbAll(`SELECT id, supplierName, status, urgency, expectedDate FROM purchase_orders WHERE vesselId = ? AND status NOT IN ('received','cancelled') ORDER BY expectedDate`, [cu.id]), []);
      let html = `<b>${h(cu.name)}</b>${spec ? ` — ${h(spec[1])} • ${fmt(spec[6])} DWT • LOA ${fmt(spec[2], 2)} m` : ''}<br>Son 90 günde sevkiyat kalemi: <b>${cnt.n}</b>`;
      if (last.length) html += '<br><br><b>Son sevkiyatlar</b><br>' + tbl(['Tarih', 'Malzeme', 'Miktar'], last.map((r) => [h(String(r.date).slice(0, 10)), h(r.pname), `${r.type === 'iade' ? 'İade ' : ''}${fmt(r.quantity)} ${h(r.unit || '')}`]));
      if (pos.length) html += '<br><b>Açık satın alma talepleri</b><br>' + tbl(['Sipariş', 'Tedarikçi', 'Durum', 'Beklenen'], pos.map((o) => [h(o.id) + (o.urgency === 'urgent' ? ' <b>(acil)</b>' : ''), h(o.supplierName), h(STATUS[o.status] || o.status), h(o.expectedDate || '-')]));
      return { html, suggestions: [`${cu.name} özellikleri`, 'Acil gemi talepleri'] };
    }
    const inv = await c.dbAll(`SELECT date, amount, note FROM sales WHERE customerId = ? AND type = 'navlun' ORDER BY date DESC LIMIT 6`, [cu.id]);
    const fin = c.perms.includes('fin.view') || (c.req.me && c.req.me.role === 'admin');
    let html = `<b>${h(cu.name)}</b> — kiracı (navlun müşterisi)` + (fin ? `<br>Açık navlun alacağı: <b>${fmt(cu.balance, 2)} ${h(cu.currency === 'TL' ? '₺' : cu.currency || '')}</b>` : '');
    if (fin && inv.length) html += '<br><br><b>Son navlun faturaları</b><br>' + tbl(['Tarih', 'Fatura', 'Tutar'], inv.map((r) => [h(String(r.date).slice(0, 10)), h(String(r.note || '').replace(/^Navlun faturası /, '')), `${fmt(r.amount, 2)} ${h(cu.currency === 'TL' ? '₺' : cu.currency || '')}`]));
    return { html, suggestions: ['Navlun alacakları', 'Vadesi yaklaşan ödemeler'] };
  });

  intent('balances', (c) => (/(bakiye|cari|alacak|tahsilat|en borclu|navlun|kiraci|charter)/.test(c.q) && !/(nasil|yapilir)/.test(c.q) ? 9 : 0), async (c) => {
    if (!(c.perms.includes('fin.view') || (c.req.me && c.req.me.role === 'admin'))) return NEED_FIN;
    const all = (await c.customers()).filter((x) => !/^GM/.test(x.id)).sort((a, b) => b.balance - a.balance);
    const tot = {}; all.forEach((x) => { const k = x.currency === 'TL' || !x.currency ? 'TRY' : x.currency; tot[k] = (tot[k] || 0) + x.balance; });
    const inv = await c.safe(() => c.dbAll(`SELECT s.customerId, MAX(s.date) AS last, COUNT(*) AS n FROM sales s WHERE s.type = 'navlun' GROUP BY s.customerId`), []);
    return { html: `<b>Navlun alacakları</b> (kiracılar)<br>${Object.entries(tot).map(([k, v]) => `Toplam ${k}: <b>${money(v, k)}</b>`).join(' • ')}<br><br>` + tbl(['Kiracı', 'Açık alacak', 'Son fatura'], all.map((x) => { const i2 = inv.find((y) => y.customerId === x.id); return [h(x.name), `<b>${money(x.balance, x.currency === 'TL' ? 'TRY' : x.currency)}</b>`, i2 ? h(String(i2.last).slice(0, 10)) : '-']; })) + '<br>Vade ve yaşlandırma ayrıntısı: <b>Finans › Cari › Müşteriler</b>.', suggestions: ['Vadesi yaklaşan ödemeler', 'Kasada ne kadar var?'] };
  });

  intent('alerts', (c) => (/(uyari|alarm|dikkat edilmesi|riskli|sorunlu|geciken|gecikme|gecikmis|bugun ne yapmali|ozet durum|genel durum)/.test(c.q) && !/(satin|tedarik|teslimat|kredi|taksit|cek|odeme|navlun)/.test(c.q) ? 10 : 0), async (c) => {
    const today = ymd(new Date());
    const low = (await c.products()).filter((p) => p.stock <= 10).sort((a, b) => a.stock - b.stock);
    const pos = await c.safe(() => c.dbAll(`SELECT id, supplierName, vesselName, expectedDate, urgency, status FROM purchase_orders WHERE status NOT IN ('received','cancelled')`), []);
    const late = pos.filter((o) => ['approved', 'ordered', 'partial'].includes(o.status) && o.expectedDate && o.expectedDate < today);
    const urgent = pos.filter((o) => o.urgency === 'urgent');
    const fin = c.perms.includes('fin.view') || (c.req.me && c.req.me.role === 'admin');
    const inst = fin ? await c.safe(() => c.dbAll(`SELECT l.name, l.currency, i.dueDate, i.amount - i.paidAmount AS amt FROM fin_installments i JOIN fin_loans l ON l.id = i.loanId WHERE i.status != 'paid' AND l.status = 'active' AND i.dueDate < ?`, [today]), []) : [];
    const chq = fin ? await c.safe(() => c.dbAll(`SELECT number, partyName, currency, amount, dueDate, kind FROM fin_cheques WHERE status = 'pending' AND dueDate < ?`, [today]), []) : [];
    const rows = [
      ...late.map((o) => ['Geciken teslimat', `${h(o.id)} · ${h(o.supplierName)}${o.vesselName ? ' · ' + h(o.vesselName) : ''}`, h(o.expectedDate)]),
      ...urgent.map((o) => ['Acil gemi talebi', `${h(o.id)} · ${h(o.vesselName || '-')}`, h(o.expectedDate || '-')]),
      ...inst.map((i) => ['Vadesi geçmiş taksit', `${h(i.name)} · ${money(i.amt, i.currency)}`, h(i.dueDate)]),
      ...chq.map((x) => [`Vadesi geçmiş çek/senet (${x.kind === 'payable' ? 'ödenecek' : 'tahsil edilecek'})`, `${h(x.number || '')} · ${h(x.partyName || '')} · ${money(x.amount, x.currency)}`, h(x.dueDate)]),
      ...low.slice(0, 6).map((p) => ['Kritik stok', `${h(p.name)} · ${fmt(p.stock)} ${h(p.unit || '')}`, '-']),
    ];
    return { html: `<b>Uyarılar ve gecikenler</b><br>Geciken teslimat: <b>${late.length}</b> • Acil gemi talebi: <b>${urgent.length}</b>` + (fin ? ` • Vadesi geçmiş taksit / çek: <b>${inst.length + chq.length}</b>` : '') + ` • Kritik stok (≤10): <b>${low.length}</b><br><br>` + (rows.length ? tbl(['Tür', 'Kalem', 'Tarih'], rows.slice(0, 16)) : 'Açık uyarı yok.'), suggestions: ['Acil gemi talepleri', 'Vadesi yaklaşan ödemeler', 'Düşük stoklu malzemeler'] };
  });

  intent('jobsOff', (c) => (/(proje|projeler|performans|surec|is takip|is emri|isler\b|kime atandi|atanan is)/.test(c.q) && !/(nasil|satin)/.test(c.q) ? 9 : 0), () => ({
    html: 'Bu kurulumda <b>İş & Durum Takip</b> modülü (proje, iş atama, süreç ve kişi performansı) kullanılmıyor. Operasyon takibi için <b>Raporlar › Operasyon Hareketleri</b> ekranını, geciken işler için “uyarılar” ya da “geciken teslimatlar” sorularını kullanabilirsiniz.',
    suggestions: ['Uyarılar', 'Geciken teslimatlar', 'Son hareketler'],
  }));

  // Beykim'de üretim / reçete / hammadde yoktur: bu sorular açıklamayla yanıtlanır
  intent('noProduction', (c) => (/(uretebil|uretim|recete|hammadde|ham madde|bom)/.test(c.q) ? 9 : 0), () => ({
    html: 'Bu kurulumda <b>üretim, reçete ve hammadde</b> modülleri kullanılmaz; Beykim’de ambar malzemeleri gemilere sevk edilir. Malzeme stoğu için malzeme adını yazabilir ya da “düşük stoklu malzemeler” diyebilirsiniz.',
    suggestions: ['Düşük stoklu malzemeler', 'Stok durumu'],
  }));

  intent('poEntity', (c) => (/\b(po-\d{4}-\d+|rq-[a-z]{3}-\d{4}-\d+)\b/i.test(c.raw) ? 13 : 0), async (c) => {
    const code = (c.raw.match(/\b(PO-\d{4}-\d+|RQ-[A-Za-z]{3}-\d{4}-\d+)\b/i) || [])[0].toUpperCase();
    const o = await c.dbGet(`SELECT * FROM purchase_orders WHERE UPPER(id) = ? OR UPPER(requisitionNo) = ?`, [code, code]);
    if (!o) return { html: `<b>${h(code)}</b> numaralı sipariş veya gemi talebi bulunamadı.`, suggestions: ['Satın alma özeti'] };
    const lines = await c.dbAll(`SELECT productName, unit, qty, receivedQty, unitPrice, taxRate, discount FROM purchase_order_lines WHERE orderId = ?`, [o.id]);
    const tot = lines.reduce((a, l) => { const n = l.qty * l.unitPrice * (1 - (l.discount || 0) / 100); return a + n * (1 + (l.taxRate || 0) / 100); }, 0);
    return { html: `<b>${h(o.id)}</b> — ${h(o.supplierName)}<br>Durum: <b>${h(STATUS[o.status] || o.status)}</b> • Aciliyet: <b>${h(URG[o.urgency] || 'Rutin')}</b><br>Gemi: <b>${h(o.vesselName || '-')}</b> • Talep no: ${h(o.requisitionNo || '-')} • Teslim limanı: ${h(o.port || '-')}<br>Sipariş: ${h(o.orderDate)} • Beklenen teslim: <b>${h(o.expectedDate || '-')}</b> • Ambar: ${h(o.warehouseName || '-')}<br>Toplam: <b>${fmt(tot, 2)} ${h(o.currency)}</b><br><br>` +
      tbl(['Malzeme', 'Sipariş', 'Teslim'], lines.map((l) => [h(l.productName), `${fmt(l.qty)} ${h(l.unit || '')}`, `${fmt(l.receivedQty)} ${h(l.unit || '')}`])), suggestions: ['Geciken teslimatlar', 'Acil gemi talepleri'] };
  });

  intent('purchase', (c) => (/(satin alma|tedarik|\bpo\b|mal kabul|teslimat|siparis(ler)?i?\b|talep|acil)/.test(c.q) && !/(nasil|yapilir|olustur)/.test(c.q) ? (c.ents.supplier.length ? 9 : 7.5) : 0), async (c) => {
    if (c.ents.supplier.length) {
      const s = c.ents.supplier[0];
      const ords = await c.dbAll(`SELECT id, orderDate, expectedDate, status, vesselName FROM purchase_orders WHERE supplierId = ? ORDER BY orderDate DESC LIMIT 6`, [s.id]);
      return { html: `<b>${h(s.name)}</b><br>Kategori: ${h(s.category || '-')} • Yetkili: ${h(s.contactPerson || '-')} • Tel: ${h(s.phone || '-')}<br>Para birimi: ${h(s.currency || 'TRY')} • Vade: ${fmt(s.paymentTerm)} gün • Toplam sipariş: <b>${fmt(s.totalOrders)}</b>` + (ords.length ? '<br><br>' + tbl(['Sipariş', 'Gemi', 'Beklenen', 'Durum'], ords.map((o) => [h(o.id), h(o.vesselName || '-'), h(o.expectedDate || '-'), h(STATUS[o.status] || o.status)])) : ''), suggestions: ['Tedarikçiler', 'Bekleyen siparişler'] };
    }
    const vessel = c.ents.customer.find((x) => /^GM/.test(x.id)) || null;
    const orders = await c.dbAll(`SELECT id, supplierName, orderDate, expectedDate, status, vesselName, vesselId, urgency, port FROM purchase_orders ${vessel ? 'WHERE vesselId = ?' : ''} ORDER BY orderDate DESC`, vessel ? [vessel.id] : []);
    const by = {}; orders.forEach((o) => { by[o.status] = (by[o.status] || 0) + 1; });
    const today = ymd(new Date());
    const open = orders.filter((o) => ['draft', 'pending', 'approved', 'ordered', 'partial'].includes(o.status));
    const late = open.filter((o) => ['approved', 'ordered', 'partial'].includes(o.status) && o.expectedDate && o.expectedDate < today);
    const urgent = open.filter((o) => o.urgency === 'urgent');
    let html = `<b>Satın alma özeti</b>${vessel ? ` — ${h(vessel.name)}` : ''}<br><br>Toplam <b>${orders.length}</b> sipariş: ` + Object.entries(by).map(([k, v]) => `${h(STATUS[k] || k)} <b>${v}</b>`).join(' • ');
    if (late.length) html += `<br><b>${late.length}</b> siparişin beklenen teslim tarihi geçti.`;
    if (urgent.length) html += `<br><b>${urgent.length}</b> acil gemi talebi açık.`;
    const show = /acil/.test(c.q) ? urgent : /gecik/.test(c.q) ? late : /(bekleyen|acik|teslim|talep)/.test(c.q) ? open : orders.slice(0, 8);
    html += '<br><br>' + (show.length ? tbl(['Sipariş', 'Gemi', 'Tedarikçi', 'Beklenen', 'Durum'], show.slice(0, 10).map((o) => [h(o.id) + (o.urgency === 'urgent' ? ' <b>(acil)</b>' : ''), h(o.vesselName || '-'), h(o.supplierName), h(o.expectedDate || '-') + (late.includes(o) ? ' <b>(gecikti)</b>' : ''), h(STATUS[o.status] || o.status)])) : 'Bu kritere uyan sipariş yok.');
    return { html, suggestions: ['Geciken teslimatlar', 'Acil gemi talepleri', 'Tedarikçiler'] };
  });
  const URG = { routine: 'Rutin', priority: 'Öncelikli', urgent: 'Acil — gemi bekliyor' };
  const STATUS = { draft: 'Taslak', pending: 'Onay bekliyor', approved: 'Onaylandı', ordered: 'Sipariş verildi', partial: 'Kısmi teslim', received: 'Teslim alındı', cancelled: 'İptal' };

  intent('suppliers', (c) => (/(tedarikci|tedarikciler|firmalar|ship chandler|chandler)/.test(c.q) && !c.ents.supplier.length ? 9 : 0), async (c) => {
    let s = (await c.suppliers()).slice().sort((a, b) => b.totalAmount - a.totalAmount);
    const cat = [...new Set(s.map((x) => x.category).filter(Boolean))].find((k) => fold(k).split(/[\s&]+/).some((w) => w.length >= 4 && c.qt.some((t) => t.startsWith(w.slice(0, 4)))));
    if (cat) s = s.filter((x) => x.category === cat);
    return { html: `<b>Tedarikçiler</b>${cat ? ` — ${h(cat)}` : ''}<br><br>` + (s.length ? tbl(['Tedarikçi', 'Kategori', 'Para birimi / vade', 'Sipariş'], s.slice(0, 12).map((x) => [h(x.name), h(x.category || '-'), `${h(x.currency || 'TRY')} · ${x.paymentTerm ? fmt(x.paymentTerm) + ' gün' : 'peşin'}`, fmt(x.totalOrders)])) : 'Kayıtlı tedarikçi yok.') + '<br>Ayrıntı: <b>Tedarikçiler</b> menüsü.', suggestions: ['Satın alma özeti', 'Boya tedarikçileri'] };
  });

  intent('activity', (c) => (/(transfer|sayim|bosaltma|arac|mal kabul|hareket|son islem|son yapilan)/.test(c.q) && !/(nasil|yapilir)/.test(c.q) ? 8 : 0), async (c) => {
    const tr = await c.dbAll(`SELECT t.date, t.barcode, sw.name AS src, tw.name AS dst FROM transfers t LEFT JOIN warehouses sw ON sw.id = t.sourceWarehouse LEFT JOIN warehouses tw ON tw.id = t.targetWarehouse ORDER BY t.date DESC LIMIT 200`);
    const counts = await c.safe(() => c.dbAll(`SELECT sc.date, w.name AS wname, sc.countedQty, sc.systemQty FROM stock_counts sc LEFT JOIN warehouses w ON w.id = sc.warehouseId ORDER BY sc.date DESC LIMIT 100`), []);
    const unl = await c.safe(() => c.dbAll(`SELECT v.date, v.vehicleInfo, w.name AS wname FROM vehicle_unloads v LEFT JOIN warehouses w ON w.id = v.warehouseId ORDER BY v.date DESC LIMIT 100`), []);
    const grp = {}; tr.forEach((t) => { const k = `${String(t.date).slice(0, 16)}|${t.src}|${t.dst}`; grp[k] = (grp[k] || 0) + 1; });
    const rows = Object.entries(grp).slice(0, 6).map(([k, n]) => { const [d, s, t] = k.split('|'); return [h(d.replace('T', ' ')), `${h(s)} → ${h(t)}`, n]; });
    const diffs = counts.filter((x) => x.countedQty !== x.systemQty).length;
    return { html: `<b>Ambar hareketleri</b><br><br>Ambarlar arası transfer: <b>${tr.length}</b> barkod • Sayım kaydı: <b>${counts.length}</b>${diffs ? ` (${diffs} farklı)` : ''} • Araçtan mal kabul: <b>${unl.length}</b><br><br>` + (rows.length ? tbl(['Zaman', 'Yön', 'Adet'], rows) : 'Henüz transfer yok.'), suggestions: ['Depolar', 'Stok durumu'] };
  });

  intent('warehouses', (c) => (/(depolar|ambarlar|subeler|lokasyon|hangi depo|hangi ambar)/.test(c.q) || (/depo/.test(c.q) && !c.ents.warehouse.length && !c.ents.product.length) ? 6 : 0), async (c) => {
    const w = await c.warehouses();
    const bal = await c.load('wbs', `SELECT warehouseId, SUM(qty) AS q, COUNT(*) AS n FROM warehouse_stock WHERE qty > 0 GROUP BY warehouseId`);
    return { html: `<b>Ambarlar</b> (${w.length})<br><br>` + tbl(['Kod', 'Ambar', 'Lokasyon', 'Toplam stok'], w.map((x) => { const b = bal.find((y) => y.warehouseId === x.id); return [h(x.code), h(x.name), h(x.branchName || '-'), b ? `<b>${fmt(b.q)}</b> (${b.n} çeşit)` : '0']; })), suggestions: w.slice(0, 2).map((x) => `${x.name} stoğu`) };
  });

  // ---------- İş & durum takip ----------
  const NEED_JT = 'Bu bilgi için <b>İş Takip</b> yetkiniz yok; yöneticinizden rolünüze “İş takibini görüntüle” izni vermesini isteyin.';
  // ---------- Finans (yalnızca fin.view yetkisi olanlar) ----------
  const NEED_FIN = { html: '🔒 Finans bilgilerini görmek için <b>Finans</b> yetkiniz olması gerekir. Yöneticinizden rolünüze finans yetkisi vermesini isteyin.', suggestions: [] };
  const finIntent = (id, score, run) => intent(id, (c) => { const s = score(c); return s ? s + 0.5 : 0; }, async (c) => (c.perms.includes('fin.view') || (c.req.me && c.req.me.role === 'admin') ? run(c) : NEED_FIN));
  const money = (n, cur) => `${fmt(n, 2)} ${cur === 'TRY' ? '₺' : h(cur || '')}`;
  const finDays = (d) => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((new Date(`${d}T00:00:00`) - t) / 86400000); };
  const finWhen = (n) => (n < 0 ? `<b style="color:#c62828">${-n} gün gecikti</b>` : n === 0 ? '<b>bugün</b>' : `${n} gün sonra`);

  finIntent('finCash', (c) => (/(kasa|banka|nakit|hesap bakiye|hesaplarimiz|paramiz|ne kadar param|likidite)/.test(c.q) && !/(kredi|taksit)/.test(c.q) ? 10.5 : 0), async (c) => {
    const rows = await c.safe(() => c.dbAll(`SELECT a.name, a.type, a.currency, COALESCE(a.openingBalance,0) + COALESCE((SELECT SUM(CASE WHEN t.direction='in' THEN t.amount ELSE -t.amount END) FROM fin_transactions t WHERE t.accountId = a.id AND t.voided = 0),0) AS balance FROM fin_accounts a WHERE a.active = 1 ORDER BY a.currency, a.name`), []);
    if (!rows.length) return { html: '🏦 Henüz kasa/banka hesabı tanımlı değil. <b>Finans › Hesaplar</b> bölümünden ekleyebilirsiniz.', suggestions: [] };
    const tot = {}; rows.forEach((r) => { tot[r.currency] = (tot[r.currency] || 0) + r.balance; });
    return { html: `🏦 <b>Nakit durumu</b><br>${Object.entries(tot).map(([cur, t]) => `Toplam ${cur}: <b>${money(t, cur)}</b>`).join(' • ')}<br><br>` + c.tbl(['Hesap', 'Tür', 'Bakiye'], rows.map((r) => [h(r.name), r.type === 'cash' ? 'Kasa' : 'Banka', `<b>${money(r.balance, r.currency)}</b>`])), suggestions: ['Vadesi yaklaşan ödemeler', 'Kredilerimiz'] };
  });

  finIntent('finLoans', (c) => (/(kredi|taksit|kredim|borclarimiz|geri odeme)/.test(c.q) && !/(nasil|yapilir|nedir)/.test(c.q) ? 11 : 0), async (c) => {
    const loans = await c.safe(() => c.dbAll(`SELECT l.id, l.name, l.lender, l.currency, l.principal, COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.principal ELSE 0 END),0) AS outstanding,
      COUNT(i.id) AS n, SUM(CASE WHEN i.status = 'paid' THEN 1 ELSE 0 END) AS paid,
      (SELECT i2.dueDate FROM fin_installments i2 WHERE i2.loanId = l.id AND i2.status != 'paid' ORDER BY i2.no LIMIT 1) AS nextDue,
      (SELECT i2.amount - i2.paidAmount FROM fin_installments i2 WHERE i2.loanId = l.id AND i2.status != 'paid' ORDER BY i2.no LIMIT 1) AS nextAmount
      FROM fin_loans l LEFT JOIN fin_installments i ON i.loanId = l.id WHERE l.status = 'active' GROUP BY l.id ORDER BY nextDue`), []);
    if (!loans.length) return { html: '🏛️ Kayıtlı aktif kredi yok. <b>Finans › Krediler</b> bölümünden taksit planıyla birlikte ekleyebilirsiniz.', suggestions: [] };
    const tot = {}; loans.forEach((l) => { tot[l.currency] = (tot[l.currency] || 0) + l.outstanding; });
    return { html: `🏛️ <b>Krediler</b> — kalan anapara: ${Object.entries(tot).map(([cur, t]) => `<b>${money(t, cur)}</b>`).join(' • ')}<br><br>` + c.tbl(['Kredi', 'Ödenen', 'Sıradaki taksit', 'Vade'], loans.map((l) => [`${h(l.name)}<br><small>${h(l.lender || '')}</small>`, `${l.paid}/${l.n}`, l.nextDue ? `<b>${money(l.nextAmount, l.currency)}</b>` : '—', l.nextDue ? `${h(l.nextDue)}<br>${finWhen(finDays(l.nextDue))}` : 'Tamamlandı'])), suggestions: ['Vadesi yaklaşan ödemeler', 'Kasada ne kadar var?'] };
  });

  finIntent('finDue', (c) => (/(vade|vadesi|yaklasan|geciken|gecikmis|odeme takvimi|ne zaman ode|hatirlat|odenecek|odemem gereken)/.test(c.q) && /(odeme|taksit|cek|senet|kredi|tahsilat|vade|yaklasan)/.test(c.q) && !/\b(is|isler|proje|projeler|siparis)\b/.test(c.q) ? 11.5 : 0), async (c) => {
    const inst = await c.safe(() => c.dbAll(`SELECT l.name AS title, l.currency, i.dueDate, i.amount - i.paidAmount AS amount, i.no FROM fin_installments i JOIN fin_loans l ON l.id = i.loanId WHERE i.status != 'paid' AND l.status = 'active' AND i.dueDate <= date('now','+30 day')`), []);
    const chq = await c.safe(() => c.dbAll(`SELECT kind, number, partyName, currency, amount, dueDate FROM fin_cheques WHERE status = 'pending' AND dueDate <= date('now','+30 day')`), []);
    const items = [
      ...inst.map((i) => ({ dir: 'out', text: `${h(i.title)} · ${i.no}. taksit`, cur: i.currency, amount: i.amount, due: i.dueDate })),
      ...chq.map((x) => ({ dir: x.kind === 'payable' ? 'out' : 'in', text: `${x.kind === 'payable' ? 'Ödenecek' : 'Tahsil edilecek'} çek/senet ${h(x.number || '')} — ${h(x.partyName || '')}`, cur: x.currency, amount: x.amount, due: x.dueDate })),
    ].sort((a, b) => a.due.localeCompare(b.due));
    if (!items.length) return { html: '✅ Önümüzdeki 30 gün içinde vadesi gelen taksit veya çek/senet yok. Tedarikçi vadeleri için <b>Finans › Cari › Tedarikçiler</b> bölümüne bakın.', suggestions: ['Kasada ne kadar var?'] };
    return { html: '⏰ <b>Vadesi yaklaşan / geciken (30 gün)</b><br><br>' + c.tbl(['Kalem', 'Vade', 'Tutar'], items.slice(0, 12).map((i) => [i.text, `${h(i.due)}<br>${finWhen(finDays(i.due))}`, `<b style="color:${i.dir === 'in' ? '#2e7d32' : '#c62828'}">${i.dir === 'in' ? '+' : '−'}${money(i.amount, i.cur)}</b>`])) + '<br>Tedarikçi ödeme vadeleri <b>Finans › Özet</b> ekranında listelenir.', suggestions: ['Kredilerimiz', 'Kasada ne kadar var?'] };
  });

  finIntent('finExpense', (c) => (/(gider|harcama|bunker|yakit|liman|acente|sigorta|p&i|p ve i|klas|sorvey|maas|masraf)/.test(c.q) && !/(nasil|tedarikci|stok|separator|filtre)/.test(c.q) && !c.ents.product.length ? 10.5 : 0), async (c) => {
    const p = c.period || { from: new Date(Date.now() - 90 * DAY), to: new Date(Date.now() + DAY), label: 'son 90 gün' };
    const rows = await c.safe(() => c.dbAll(`SELECT t.category, a.currency, SUM(t.amount) AS amt, COUNT(*) AS n FROM fin_transactions t JOIN fin_accounts a ON a.id = t.accountId WHERE t.voided = 0 AND t.direction = 'out' AND t.refType != 'transfer' AND t.date >= ? AND t.date < ? GROUP BY t.category, a.currency ORDER BY amt DESC`, [ymd(p.from), ymd(p.to)]), []);
    const want = [['bunker', 'Yakıt (Bunker)'], ['yakit', 'Yakıt (Bunker)'], ['liman', 'Liman & Acente'], ['acente', 'Liman & Acente'], ['sigorta', 'Sigorta (P&I / H&M)'], ['klas', 'Klas & Sörvey'], ['sorvey', 'Klas & Sörvey'], ['maas', 'Maaş / SGK']].find(([k]) => c.q.includes(k));
    const list = want ? rows.filter((r) => r.category === want[1]) : rows;
    if (!list.length) return { html: `${h(p.label)} içinde ${want ? h(want[1]) + ' ' : ''}gider kaydı yok.`, suggestions: ['Son 90 gün giderler'] };
    return { html: `<b>${want ? h(want[1]) : 'Giderler'}</b> — ${h(p.label)}<br><br>` + c.tbl(['Kalem', 'İşlem', 'Tutar'], list.slice(0, 14).map((r) => [h(r.category), r.n, `<b>${money(r.amt, r.currency)}</b>`])) + '<br>Ayrıntı: <b>Finans › Hareketler</b> ve <b>Nakit Akışı</b>.', suggestions: ['Planlı ödemeler', 'Kasada ne kadar var?'] };
  });

  finIntent('finPlanned', (c) => (/(planli|plan|havuz|havuzlama|dry dock|tahmin|beklenen odeme|beklenen tahsilat|nakit akisi)/.test(c.q) && !/(nasil)/.test(c.q) ? 10.5 : 0), async (c) => {
    const rows = await c.safe(() => c.dbAll(`SELECT date, direction, amount, currency, category, description FROM fin_planned WHERE status = 'planned' ORDER BY date LIMIT 20`), []);
    if (!rows.length) return { html: 'Kayıtlı planlı kalem yok. <b>Finans › Nakit Akışı › Planlı kalem</b> ile eklenebilir.', suggestions: [] };
    return { html: '<b>Planlı ödeme ve tahsilatlar</b><br><br>' + c.tbl(['Tarih', 'Kalem', 'Tutar'], rows.map((r) => [`${h(r.date)}<br>${finWhen(finDays(r.date))}`, `${h(r.description || r.category)}<br><small>${h(r.category)}</small>`, `<b style="color:${r.direction === 'in' ? '#2e7d32' : '#c62828'}">${r.direction === 'in' ? '+' : '−'}${money(r.amount, r.currency)}</b>`])) + '<br>Takvim görünümü: <b>Finans › Takvim</b>.', suggestions: ['Vadesi yaklaşan ödemeler', 'Kasada ne kadar var?'] };
  });

  const jtIntent = (id, score, run) => intent(id, (c) => (c.canJobs ? score(c) : 0), run); // Beykim: iş takip kapalı, bu niyetler devre dışı
  const JT_WORDS = /(is emri|isler|is takip|proje|siparis|sevk|surec|asama|gecik|performans|zamaninda|sorumlu|uyari|atanan|uretimde|iş)/;

  jtIntent('jobsLate', (c) => (/(gecik|geciken|gecikme|zamaninda bitmeyen|yetisme|yetismeyen|kritik is\b|\bacil\b)/.test(c.q) && !/(satin|tedarik|teslimat)/.test(c.q) ? 10 : 0), async (c) => {
    const rows = await c.dbAll(`SELECT j.jobNo, j.title, j.plannedEnd, j.doneQty, j.plannedQty, u.name AS who, p.name AS proc, o.orderNo FROM jt_jobs j LEFT JOIN users u ON u.id = j.assigneeId LEFT JOIN jt_processes p ON p.id = j.processId LEFT JOIN jt_orders o ON o.id = j.orderId WHERE j.status IN ('planned','in_progress','blocked') AND j.plannedEnd < ? ORDER BY j.plannedEnd LIMIT 15`, [ymd(new Date())]);
    const lateOrders = await c.jt.enrichOrders(await c.dbAll(`SELECT o.*, pr.name AS projectName FROM jt_orders o LEFT JOIN jt_projects pr ON pr.id = o.projectId WHERE o.status != 'cancelled'`));
    const lo = lateOrders.filter((o) => o.overdue);
    const days = (d) => Math.max(1, Math.ceil((Date.now() - new Date(`${d}T23:59:59`).getTime()) / DAY));
    let html = `⏰ <b>Geciken işler</b><br><br>` + (rows.length ? tbl(['İş', 'Süreç', 'Sorumlu', 'Gecikme', 'İlerleme'], rows.map((r) => [`${h(r.jobNo)}<br><small>${h(r.orderNo || r.title || '')}</small>`, h(r.proc || '-'), h(r.who || '<atanmamış>'), `<b>${days(r.plannedEnd)} gün</b>`, r.plannedQty ? `%${Math.round((r.doneQty / r.plannedQty) * 100)}` : '-'])) : 'Geciken iş yok. 🟢'.replace('🟢', ''));
    if (lo.length) html += `<br><br><b>Teslim tarihi geçen siparişler</b><br>` + tbl(['Sipariş', 'Müşteri', 'Gecikme', 'Sevk'], lo.slice(0, 8).map((o) => [h(o.orderNo), h(o.customerName), `<b>${o.overdueDays} gün</b>`, `%${o.shippedPct}`]));
    return { html, suggestions: ['Kişi performansları', 'Süreçlere göre işler', 'Uyarılar'] };
  });

  jtIntent('jobsByProcess', (c) => (/(surec|asama|hangi surecte|surece gore|surecler|iş dağılım|is dagilim)/.test(c.q) ? 10 : 0), async (c) => {
    const procs = await c.dbAll(`SELECT * FROM jt_processes ORDER BY seq`);
    const jobs = await c.dbAll(`SELECT processId, status, plannedEnd FROM jt_jobs WHERE status != 'cancelled'`);
    const today = ymd(new Date());
    return { html: `⚙️ <b>Süreçlere göre işler</b><br><br>` + tbl(['Süreç', 'Bekleyen', 'Devam', 'Tamam', 'Geciken'], procs.map((p) => {
      const js = jobs.filter((j) => j.processId === p.id);
      const late = js.filter((j) => j.status !== 'done' && j.plannedEnd < today).length;
      return [h(p.name), js.filter((j) => j.status === 'planned').length, js.filter((j) => j.status === 'in_progress').length, js.filter((j) => j.status === 'done').length, late ? `<b>${late}</b> ⚠️` : '0'];
    })), suggestions: ['Geciken işler', 'Kişi performansları'] };
  });

  jtIntent('performance', (c) => ((c.ents.user && c.ents.user.length && /(performans|basari|zamaninda|verim|is yuku|ne is|hangi is|isleri)/.test(c.q)) ? 11 : /(performans|zamaninda tamam|en basarili|verimli|kim ne is|is yuku|personel)/.test(c.q) ? 10 : 0), async (c) => {
    if (c.ents.user && c.ents.user.length && /(is yuku|ne is|hangi is|isleri|islerini|atanan|uzerinde)/.test(c.q) && !/(performans|basari|verim)/.test(c.q)) {
      const u = c.ents.user[0];
      const mine = await c.dbAll(`SELECT j.jobNo, j.title, j.status, j.plannedEnd, j.doneQty, j.plannedQty, p.name AS proc FROM jt_jobs j LEFT JOIN jt_processes p ON p.id = j.processId WHERE j.assigneeId = ? AND j.status IN ('planned','in_progress','blocked') ORDER BY j.plannedEnd LIMIT 15`, [u.id]);
      const today = ymd(new Date());
      return { html: `🔧 <b>${h(u.name)}</b>${u.title ? ' — ' + h(u.title) : ''}<br>Açık iş: <b>${mine.length}</b><br><br>` + (mine.length ? tbl(['İş', 'Süreç', 'Durum', 'Bitiş', 'İlerleme'], mine.map((r) => [h(r.jobNo), h(r.proc || '-'), h(JOB_ST[r.status] || r.status), h(r.plannedEnd) + (r.plannedEnd < today ? ' ⚠️' : ''), r.plannedQty ? `%${Math.round((r.doneQty / r.plannedQty) * 100)}` : '-'])) : 'Açık işi yok.'), suggestions: [`${u.name} performansı`, 'Geciken işler'] };
    }
    const rows = await c.jt.performanceRows(Date.now() - 90 * DAY, Date.now(), c.ents.user && c.ents.user.length && /(performans|basari|verim|zamaninda)/.test(c.q) ? c.ents.user[0].id : null);
    const list = rows.filter((r) => r.assigned).sort((a, b) => (b.score || 0) - (a.score || 0));
    if (!list.length) return { html: 'Performans hesaplanacak atanmış iş bulunamadı.', suggestions: [] };
    return { html: `📈 <b>Kişi performansı</b> (son 90 gün)<br><br>` + tbl(['Kişi', 'Tamamlanan', 'Zamanında', 'Geciken açık', 'Skor'], list.slice(0, 12).map((r) => [`${h(r.name)}<br><small>${h(r.title || r.roleLabel || '')}</small>`, r.completed, r.onTimePct == null ? '-' : `%${r.onTimePct}`, r.overdueJobs ? `<b>${r.overdueJobs}</b>` : '0', `<b>${r.score == null ? '-' : r.score}</b>`])) + '<br><small>Skor: zamanında tamamlama %60, düşük fire %20, gecikmiş iş yükü %20.</small>', suggestions: ['Geciken işler', 'Uyarılar'] };
  });

  jtIntent('jtEntity', (c) => (/\b[a-z]{1,5}-\d{2,}[a-z0-9-]*\b/i.test(c.raw) ? 12 : 0), async (c) => {
    const code = (c.raw.match(/\b[A-Za-z]{1,5}-\d{2,}[A-Za-z0-9-]*\b/) || [])[0];
    const up = code.toUpperCase();
    const ord = await c.dbGet(`SELECT o.*, pr.name AS projectName FROM jt_orders o LEFT JOIN jt_projects pr ON pr.id = o.projectId WHERE UPPER(o.orderNo) = ?`, [up]);
    if (ord) {
      const [e] = await c.jt.enrichOrders([ord]);
      const jobs = await c.dbAll(`SELECT j.jobNo, j.status, j.doneQty, j.plannedQty, j.plannedEnd, u.name AS who, p.name AS proc FROM jt_jobs j LEFT JOIN users u ON u.id = j.assigneeId LEFT JOIN jt_processes p ON p.id = j.processId WHERE j.orderId = ? AND j.status != 'cancelled' ORDER BY p.seq`, [e.id]);
      const ST = { open: 'Açık', in_production: 'Üretimde', partially_shipped: 'Kısmen sevk', shipped: 'Sevk edildi', cancelled: 'İptal' };
      return { html: `📋 <b>${h(e.orderNo)}</b> — ${h(e.customerName)}<br>Proje: ${h(e.projectName || '-')} • Teslim: <b>${h(e.dueDate)}</b> • Durum: <b>${h(ST[e.state] || e.state)}</b>${e.overdue ? ` ⚠️ <b>${e.overdueDays} gün gecikmiş</b>` : ''}<br>Sipariş: <b>${fmt(e.orderedQty)}</b> • Giden: <b>${fmt(e.shippedQty)}</b> (%${e.shippedPct}) • Üretim ilerlemesi: %${e.progress}<br><br>` +
        tbl(['Kalem', 'Sipariş', 'Giden', 'Kalan'], e.lines.map((l) => [h(l.productName), fmt(l.qty), fmt(l.shippedQty), `<b>${fmt(l.remaining)}</b>`])) +
        (jobs.length ? '<br>' + tbl(['İş', 'Süreç', 'Sorumlu', 'Durum', 'Bitiş'], jobs.map((j) => [h(j.jobNo), h(j.proc || '-'), h(j.who || '-'), j.status === 'done' ? '✔ Tamam' : h(JOB_ST[j.status] || j.status), h(j.plannedEnd)])) : ''), suggestions: ['Geciken işler', 'Bekleyen siparişler'] };
    }
    const pr = await c.dbGet(`SELECT p.*, u.name AS who FROM jt_projects p LEFT JOIN users u ON u.id = p.managerId WHERE UPPER(p.code) = ?`, [up]);
    if (pr) return projectCard(c, pr);
    const job = await c.dbGet(`SELECT j.*, u.name AS who, p.name AS proc, o.orderNo FROM jt_jobs j LEFT JOIN users u ON u.id = j.assigneeId LEFT JOIN jt_processes p ON p.id = j.processId LEFT JOIN jt_orders o ON o.id = j.orderId WHERE UPPER(j.jobNo) = ?`, [up]);
    if (job) return { html: `🔧 <b>${h(job.jobNo)}</b> — ${h(job.title)}<br>Süreç: ${h(job.proc || '-')} • Sipariş: ${h(job.orderNo || '-')} • Sorumlu: <b>${h(job.who || 'atanmamış')}</b><br>Durum: <b>${h(JOB_ST[job.status] || job.status)}</b> • İlerleme: ${fmt(job.doneQty)} / ${fmt(job.plannedQty)} • Planlanan bitiş: ${h(job.plannedEnd)}${job.blockedReason ? `<br>Engel: ${h(job.blockedReason)}` : ''}`, suggestions: ['Geciken işler'] };
    return null;
  });
  const JOB_ST = { planned: 'Planlandı', in_progress: 'Devam ediyor', blocked: 'Engelli', done: 'Tamamlandı', cancelled: 'İptal' };

  async function projectCard(c, pr) {
    const orders = await c.jt.enrichOrders(await c.dbAll(`SELECT o.*, pr.name AS projectName FROM jt_orders o LEFT JOIN jt_projects pr ON pr.id = o.projectId WHERE o.projectId = ? AND o.status != 'cancelled'`, [pr.id]));
    const ordered = orders.reduce((s, o) => s + o.orderedQty, 0); const shipped = orders.reduce((s, o) => s + o.shippedQty, 0);
    return { html: `📁 <b>${h(pr.name)}</b> (${h(pr.code)})<br>Sorumlu: <b>${h(pr.who || '-')}</b> • Müşteri: ${h(pr.customerName || '-')} • Bitiş: ${h(pr.dueDate || '-')}<br>${orders.length} sipariş • sipariş <b>${fmt(ordered)}</b> / giden <b>${fmt(shipped)}</b> (%${ordered ? Math.round((shipped / ordered) * 100) : 0})<br><br>` +
      (orders.length ? tbl(['Sipariş', 'Teslim', 'Sevk', 'Üretim'], orders.map((o) => [h(o.orderNo) + (o.overdue ? ' ⚠️' : ''), h(o.dueDate), `%${o.shippedPct}`, `%${o.progress}`])) : ''), suggestions: ['Geciken işler', 'Projeler'] };
  }

  jtIntent('projects', (c) => (/(proje|projeler|proje sorumlu|kimin projesi)/.test(c.q) ? 9 : 0), async (c) => {
    const ps = await c.dbAll(`SELECT p.*, u.name AS who FROM jt_projects p LEFT JOIN users u ON u.id = p.managerId ORDER BY p.dueDate`);
    const named = findByName(ps, (p) => p.name, c.qt, { max: 1 });
    if (named.length) return projectCard(c, named[0]);
    return { html: `📁 <b>Projeler</b><br><br>` + (ps.length ? tbl(['Proje', 'Sorumlu', 'Müşteri', 'Bitiş', 'Durum'], ps.map((p) => [h(p.name), h(p.who || '-'), h(p.customerName || '-'), h(p.dueDate || '-'), h(p.status)])) : 'Henüz proje yok.'), suggestions: ['Geciken işler', 'Bekleyen siparişler'] };
  });

  jtIntent('jtOrders', (c) => (/(musteri siparis|sevk edilmemis|sevk bekleyen|teslim tarihi yaklas|siparis takip|sevkiyat durumu|giden miktar|siparis durumu)/.test(c.q) ? 11 : 0), async (c) => {
    const orders = await c.jt.enrichOrders(await c.dbAll(`SELECT o.*, pr.name AS projectName FROM jt_orders o LEFT JOIN jt_projects pr ON pr.id = o.projectId WHERE o.status != 'cancelled'`));
    const open = orders.filter((o) => o.state !== 'shipped').sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    const ordered = orders.reduce((s, o) => s + o.orderedQty, 0); const shipped = orders.reduce((s, o) => s + o.shippedQty, 0);
    return { html: `📋 <b>Müşteri siparişleri</b><br><br>${orders.length} sipariş • toplam sipariş <b>${fmt(ordered)}</b> / giden <b>${fmt(shipped)}</b> (%${ordered ? Math.round((shipped / ordered) * 100) : 0}) • sevk bekleyen <b>${open.length}</b><br><br>` +
      tbl(['Sipariş', 'Müşteri', 'Teslim', 'Sevk', 'Üretim'], open.slice(0, 10).map((o) => [h(o.orderNo) + (o.overdue ? ' ⚠️' : ''), h(o.customerName), h(o.dueDate), `%${o.shippedPct}`, `%${o.progress}`])), suggestions: ['Geciken işler', 'Projeler'] };
  });

  jtIntent('jtAlerts', (c) => (/(uyari|alarm|dikkat edilmesi|riskli|sorunlu)/.test(c.q) ? 10 : 0), async (c) => {
    const a = (await c.jt.computeAlerts(c.req)).filter((x) => !x.acked);
    const crit = a.filter((x) => x.severity === 'critical').length;
    return { html: `🔔 <b>Uyarılar</b>: ${a.length} açık (${crit} kritik)<br><br>` + (a.length ? a.slice(0, 8).map((x) => `${x.severity === 'critical' ? '🔴' : x.severity === 'warning' ? '🟡' : '🔵'} <b>${h(x.title)}</b><br><small>${h(x.message)}</small>`).join('<br><br>') : 'Açık uyarı yok.'), suggestions: ['Geciken işler', 'Kişi performansları'] };
  });

  intent('myJobs', (c) => (c.canJobs && /(benim|bana atanan|islerim|yapacagim)/.test(c.q) && /(is|atanan)/.test(c.q) ? 12 : 0), async (c) => {
    if (!c.canJobs) return { html: NEED_JT, suggestions: [] };
    const rows = await c.dbAll(`SELECT j.jobNo, j.title, j.status, j.plannedEnd, j.doneQty, j.plannedQty FROM jt_jobs j WHERE j.assigneeId = ? AND j.status IN ('planned','in_progress','blocked') ORDER BY j.plannedEnd LIMIT 15`, [Number(c.req.me && c.req.me.id) || 0]);
    return { html: `🔧 <b>Bana atanan açık işler</b><br><br>` + (rows.length ? tbl(['İş', 'Durum', 'Bitiş', 'İlerleme'], rows.map((r) => [`${h(r.jobNo)}<br><small>${h(r.title)}</small>`, h(JOB_ST[r.status] || r.status), h(r.plannedEnd), r.plannedQty ? `%${Math.round((r.doneQty / r.plannedQty) * 100)}` : '-'])) : 'Size atanmış açık iş yok.'), suggestions: ['Geciken işler'] };
  });

  // ---------- Yedek cevap ----------
  async function fallback(c, scored) {
    const kb = kbHit(c);
    if (kb) return { html: `🧭 <b>${h(kb.e.title)}</b><br><br>${kb.e.steps.map((s, i) => `${i + 1}. ${s}`).join('<br>')}`, suggestions: kb.e.suggestions || [] };
    const pc = await c.safe(() => c.dbGet(`SELECT COUNT(*) AS c, COALESCE(SUM(stock),0) AS t FROM products`), { c: 0, t: 0 });
    const cc = await c.safe(() => c.dbGet(`SELECT COUNT(*) AS c FROM customers`), { c: 0 });
    return {
      html: `Bu soruyu tam anlayamadım, ama şunları yapabilirim:<br><br>` +
        `<b>${fmt(pc.c)}</b> çeşit malzeme, toplam <b>${fmt(pc.t)}</b> birim stok • <b>${FLEET.length}</b> gemi • <b>${fmt(cc.c - FLEET.length)}</b> kiracı<br><br>` +
        `Malzeme, gemi, ambar, tedarikçi, kiracı adını ya da PO / talep numarasını yazarak sorabilir; “nasıl yapılır” diyerek kullanım adımlarını isteyebilirsiniz.`,
      suggestions: ['Neler sorabilirim?', 'Stok durumu', 'Bu ay sevkiyatlar', 'Filomuz'],
    };
  }

  // Beykim: üretim / reçete / hammadde modülleri yok; bu niyetler çıkarılır (sorular 'noProduction' ile yanıtlanır)
  ['canProduce', 'recipe', 'raw'].forEach((id) => { const k = INTENTS.findIndex((x) => x.id === id); if (k >= 0) INTENTS.splice(k, 1); });

  return ask;
};
