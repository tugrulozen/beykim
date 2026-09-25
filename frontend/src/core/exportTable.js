/**
 * DEPO TAKİP - Listeleri Excel'e aktarma (.xlsx)
 *
 * CSV yerine gerçek Excel dosyası üretilir. Nedeni: CSV'de Excel dosyanın kodlamasını
 * ve sütun ayracını sistem diline göre tahmin ediyor; Türkçe Windows'ta bu sık sık
 * bozuk karakterlere ("Ã¼rÃ¼n") ve tek sütuna sıkışmış tabloya yol açıyor.
 * .xlsx içinde metin her zaman UTF-8 XML olarak durduğu için Türkçe karakterler
 * her bilgisayarda doğru açılır, sayılar da gerçek sayı olarak gelir.
 *
 * Dış kütüphane yok: dosya, sıkıştırmasız (stored) bir ZIP olarak elle oluşturulur.
 */
import { showToast } from '../components/toast.js';
import { choiceDialog } from '../components/dialog.js';

// ---------- ZIP (stored) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/** files: [{ name, data: Uint8Array }] -> Blob (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet) */
function zip(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  const u16 = (n) => [n & 0xFF, (n >>> 8) & 0xFF];
  const u32 = (n) => [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF];

  // Sabit tarih (1980-01-01): dosya her seferinde aynı üretilsin
  const time = 0, date = 33;

  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;

    const local = [
      ...u32(0x04034B50), ...u16(20), ...u16(0), ...u16(0),
      ...u16(time), ...u16(date), ...u32(crc), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), ...u16(0),
    ];
    chunks.push(new Uint8Array(local), nameBytes, f.data);

    central.push([
      ...u32(0x02014B50), ...u16(20), ...u16(20), ...u16(0), ...u16(0),
      ...u16(time), ...u16(date), ...u32(crc), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0),
      ...u32(offset),
    ]);
    central.push(nameBytes);
    offset += local.length + nameBytes.length + size;
  }

  const cdParts = [];
  let cdSize = 0;
  for (const part of central) {
    const arr = part instanceof Uint8Array ? part : new Uint8Array(part);
    cdParts.push(arr);
    cdSize += arr.length;
  }
  const end = new Uint8Array([
    ...u32(0x06054B50), ...u16(0), ...u16(0),
    ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0),
  ]);

  return new Blob([...chunks, ...cdParts, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ---------- XLSX ----------
/** XML'de yasak olan denetim karakterlerini atar (sekme/satır sonu kalır) */
function stripControl(s) {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 32 || c === 9 || c === 10 || c === 13) out += ch;
  }
  return out;
}

const xmlEsc = (v) => stripControl(String(v ?? ''))
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 0 -> A, 25 -> Z, 26 -> AA */
function colName(i) {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function sheetXml(columns, rows) {
  const widths = columns.map(([label], i) => {
    let max = String(label).length;
    for (const r of rows) {
      const v = typeof columns[i][1] === 'function' ? columns[i][1](r) : r[columns[i][1]];
      const len = v == null ? 0 : String(v).length;
      if (len > max) max = len;
    }
    return Math.min(52, Math.max(9, max + 2));
  });

  const cell = (ci, ri, value, header) => {
    const ref = `${colName(ci)}${ri}`;
    if (header) return `<c r="${ref}" s="1" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(value)}</t></is></c>`;
    if (value == null || value === '') return `<c r="${ref}"/>`;
    if (isNum(value)) return `<c r="${ref}"><v>${value}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(value)}</t></is></c>`;
  };

  const head = `<row r="1">${columns.map(([label], i) => cell(i, 1, label, true)).join('')}</row>`;
  const body = rows.map((r, ri) => `<row r="${ri + 2}">${columns.map(([, get], ci) => {
    const v = typeof get === 'function' ? get(r) : r[get];
    return cell(ci, ri + 2, v);
  }).join('')}</row>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0" rightToLeft="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${head}${body}</sheetData>
<autoFilter ref="A1:${colName(columns.length - 1)}${rows.length + 1}"/>
</worksheet>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3A5F"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

export function buildXlsx(sheetName, columns, rows) {
  const enc = new TextEncoder();
  const safeSheet = xmlEsc(String(sheetName).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)) || 'Liste';
  const files = [
    { name: '[Content_Types].xml', data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`) },
    { name: '_rels/.rels', data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`) },
    { name: 'xl/workbook.xml', data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${safeSheet}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`) },
    { name: 'xl/styles.xml', data: enc.encode(STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheetXml(columns, rows)) },
  ];
  return zip(files);
}

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

const slug = (s) => String(s || 'liste').toLocaleLowerCase('tr')
  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/**
 * Listeyi Excel dosyası olarak indirir.
 * @param {string} name  dosya ve sayfa adı ("Stok listesi")
 * @param {Array<[string, Function|string]>} columns  [başlık, satırdan değeri alan işlev veya alan adı]
 * @param {Array<Object>} rows
 */
const download = (blob, file) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
};

/**
 * Listeyi Excel veya PDF olarak indirir; biçimi kullanıcı seçer.
 * format ('xlsx' | 'pdf') verilirse soru sorulmaz.
 */
export async function exportTable(name, columns, rows, format) {
  if (!rows || !rows.length) return showToast('Aktarılacak kayıt yok', 'warning');
  const fmt = format || await choiceDialog({
    title: 'Dışa aktar', message: `${rows.length} kayıt hangi biçimde indirilsin?`,
    options: [{ label: 'Excel', value: 'xlsx', icon: 'ph-file-xls' }, { label: 'PDF', value: 'pdf', icon: 'ph-file-pdf' }],
  });
  if (!fmt) return;
  try {
    if (fmt === 'pdf') {
      showToast('PDF hazırlanıyor…', 'info');
      const { buildPdf } = await import('./pdf.js');
      download(await buildPdf(name, columns, rows), `${slug(name)}_${stamp()}.pdf`);
      showToast(`${rows.length} satır PDF olarak indirildi`, 'success');
    } else {
      download(buildXlsx(name, columns, rows), `${slug(name)}_${stamp()}.xlsx`);
      showToast(`${rows.length} satır Excel'e aktarıldı`, 'success');
    }
  } catch (e) {
    showToast('Dosya oluşturulamadı: ' + (e.message || ''), 'error');
  }
}

/** Sayfa başlıklarına konulan standart "Dışa aktar" (Excel / PDF) düğmesi */
export const exportButton = (id = 'export-xlsx', label = 'Dışa aktar') =>
  `<button class="btn btn-secondary btn-export" id="${id}" title="Excel veya PDF olarak indir"><i class="ph ph-download-simple"></i> <span>${label}</span></button>`;
