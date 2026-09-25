/*! (c) Codendtec. Tüm hakları saklıdır. Bu yazılım ticari sırdır; izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz veya tersine mühendislikle çözülemez. All rights reserved. */(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();class qi{constructor(){this.routes={},this.currentRoute=null,this.guards=[],this.onRouteChange=null,window.addEventListener("hashchange",()=>this._handleRoute()),"scrollRestoration"in history&&(history.scrollRestoration="manual")}register(a,t,s={}){return this.routes[a]={handler:t,...s},this}setLayout(a){return this.layout=a,this}addGuard(a){return this.guards.push(a),this}navigate(a){window.location.hash=`#/${a}`}back(){window.history.back()}getCurrentPath(){return(window.location.hash.slice(2)||"login").split("?")[0]}getQueryParams(){const t=(window.location.hash.slice(2)||"").split("?")[1]||"",s={};return t&&t.split("&").forEach(i=>{const[r,n]=i.split("=");s[decodeURIComponent(r)]=decodeURIComponent(n||"")}),s}init(){this._handleRoute()}async _handleRoute(){const a=this.getCurrentPath(),t=this.routes[a];if(!t){this.navigate("login");return}for(const i of this.guards)if(!await i(a,t))return;this.currentRoute=a,this.onRouteChange&&this.onRouteChange(a,t);const s=typeof t=="function"?t:t.handler;if(typeof t=="object"?t.afterRender:t==null||t.afterRender,s){const i=document.getElementById("app");if(i){i.innerHTML="";let r=await s();this.layout&&(r=this.layout(r,a,t)),typeof r=="string"?i.innerHTML=r:r instanceof HTMLElement&&i.appendChild(r),t.afterRender&&t.afterRender(),this._scrollTop()}}}_scrollTop(){const a=()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0,document.body.scrollTop=0,document.querySelectorAll(".shell-content, #app").forEach(t=>{t.scrollTop=0})};a(),requestAnimationFrame(a)}}const Z=new qi,Ni="Şirket",Ci="Mobil WMS",Di="Mobil WMS",Ii="AI Destekli Mobil Depo ve Operasyon Yönetim Sistemi",Pi="1.0.0",Ri="",Bi="",Hi={erpApiUrl:"/api",apiTimeout:1e4,useMockApi:!0},zi={primary:"#2F5BEA",primaryLight:"#4C74F0",primaryDark:"#1D3FB0",secondary:"#F2A516",secondaryLight:"#F7C04F",secondaryDark:"#C4830A",surface:"#0F2240"},Ki={title:"Destek",text:"Depo takip sistemi kullanımıyla ilgili yardıma mı ihtiyacınız var?",phone:"",email:"",website:""},Oi=[{id:"warehouse",title:"Depo İşlemleri"},{id:"trade",title:"Satış & Alış İşlemleri"},{id:"production",title:"Üretim İşlemleri"},{id:"ai",title:"Yapay Zeka Asistan"},{id:"other",title:"Diğer İşlemler"}],Fi={transfer:{enabled:!0,label:"Depolar Arası",icon:"ph-arrows-left-right",route:"transfer",color:"transfer",section:"warehouse",description:"Depolar arası stok transferi"},vehicleUnload:{enabled:!1,label:"Araba'dan",icon:"ph-truck",route:"vehicle-unload",color:"vehicle",section:"warehouse",description:"Araçtan depoya mal boşaltma (Pasif)"},sales:{enabled:!0,label:"Satış",icon:"ph-storefront",route:"sales",color:"sales",section:"trade",description:"Satış işlemleri"},purchase:{enabled:!0,label:"Satın Alma",icon:"ph-shopping-cart",route:"purchase-module",color:"purchase",section:"trade",description:"Tedarikçi ve sipariş (PO) yönetimi"},"purchase-old":{enabled:!1,label:"Hızlı Alış",icon:"ph-download-simple",route:"purchase",color:"purchase",section:"trade",description:"Hızlı mal kabul işlemleri (Pasif)"},rawMaterials:{enabled:!0,label:"Hammadde Takibi",icon:"ph-flask",route:"raw-materials",color:"raw-materials",section:"production",description:"Hammadde stok takibi"},recipes:{enabled:!0,label:"Ürün Reçeteleri",icon:"ph-book-open",route:"recipes",color:"recipes",section:"production",description:"Ürün reçeteleri (BOM)"},production:{enabled:!0,label:"Üretim Girişi",icon:"ph-factory",route:"production",color:"production",section:"production",description:"Reçeteye göre üretim girişi"},jobTracking:{enabled:!1,label:"İş & Durum Takip",icon:"ph-kanban",route:"jobs",color:"jobs",section:"production",description:"Proje, sipariş ve iş takibi; süreç durumu, kişi performansı, yetkilendirme ve gecikme uyarıları (İş Takip destekli ayrı backend gerekir)"},copilot:{enabled:!0,label:"AI CoPilot",icon:"ph-sparkle",route:"copilot",color:"copilot",section:"ai",description:"Yapay zeka asistanı",display:"banner"},barcode:{enabled:!1,label:"Barkod Oluştur",icon:"ph-barcode",route:"barcode",color:"stock-count",section:"warehouse",description:"Ürün + barkod oluştur, etiket boyutu seç, yazıcıdan yazdır"},finance:{enabled:!1,label:"Finans",icon:"ph-bank",route:"finance",color:"purchase",section:"trade",description:"Kasa/banka, kredi, müşteri ve tedarikçi bakiyeleri, çek/senet ve vade hatırlatmaları (ERP'ye bağlı; finans destekli backend gerekir)"},stockCount:{enabled:!0,label:"Stok Sayım",icon:"ph-clipboard-text",route:"stock-count",color:"stock-count",section:"other",description:"Barkodlu stok sayımı"},reports:{enabled:!0,label:"Raporlar",icon:"ph-chart-bar",route:"reports",color:"reports",section:"other",description:"Rapor ekranları"},settings:{enabled:!0,label:"Ayarlar",icon:"ph-gear",route:"settings",color:"settings",section:"other",description:"Uygulama ayarları"},help:{enabled:!0,label:"Yardım",icon:"ph-question",route:"help",color:"help",section:"other",description:"Yardım ve destek ekranı"}},_i={prefix:"2",defaultFormat:"ean13",defaultSize:"50x30",showCompany:!1,printer:{mode:"browser",language:"zpl",dpi:203}},Ui=[{id:"toptan",enabled:!0,label:"Toptan Satış",desc:"Büyük miktarlı satış işlemleri",icon:"ph-factory",color:"#4CAF50",badge:"TOPTAN"},{id:"perakende",enabled:!0,label:"Perakende Satış",desc:"Bireysel müşteri satış işlemleri",icon:"ph-buildings",color:"#5C6BC0",badge:"PERAKENDE"},{id:"ihracat",enabled:!0,label:"İhracat Satış",desc:"Uluslararası satış işlemleri",icon:"ph-globe-hemisphere-west",color:"#0097A7",badge:"İHRACAT"},{id:"b2b",enabled:!0,label:"İşletmeler Arası Satış",desc:"B2B satış ve transfer işlemleri",icon:"ph-briefcase",color:"#FFA726",badge:"B2B"},{id:"iade",enabled:!0,label:"Satış İade",desc:"Satış iade işlemleri",icon:"ph-arrow-u-down-left",color:"#EF5350",badge:"İADE"}],Gi=[{id:"seriAmbar",enabled:!0,label:"Seri Ambar Bakiye",icon:"ph-clipboard-text",color:"blue",route:"serial-warehouse-balance"},{id:"seriDetay",enabled:!0,label:"Seri Detay",icon:"ph-magnifying-glass",color:"green",route:"serial-detail"},{id:"cekiListesi",enabled:!0,label:"Çeki Listesi",icon:"ph-note",color:"orange",route:"packing-list"},{id:"stokDetay",enabled:!0,label:"Stok Detay",icon:"ph-tag",color:"orange",route:"stock-detail"},{id:"musteriBakiye",enabled:!0,label:"Müşteri Bakiye",icon:"ph-credit-card",color:"purple",route:"customer-balance"},{id:"sonIslemler",enabled:!0,label:"Son İşlemler",icon:"ph-clock-counter-clockwise",color:"blue",route:"activity"}],Yi=["MT","MP","IT","CT"],Vi=[{code:"USD",symbol:"$",label:"Dolar"},{code:"EUR",symbol:"€",label:"Euro"},{code:"TRY",symbol:"₺",label:"TL"}],Qi="tr",Ji={requireApproval:!0,requireInvoiceForReceive:!0,allowPartialReceive:!0},Wi={companyName:Ni,appName:Ci,shortName:Di,appDescription:Ii,version:Pi,logo:Ri,storagePrefix:Bi,api:Hi,theme:zi,support:Ki,sections:Oi,modules:Fi,barcode:_i,salesTypes:Ui,reportTypes:Gi,priceTypes:Yi,currencies:Vi,language:Qi,purchaseConfig:Ji},ni=e=>JSON.parse(JSON.stringify(e)),ea=e=>e&&e.trim().startsWith("<")?e:`<i class="ph ${e||"ph-square"}"></i>`;function Xi(e,a){const t=(e||"?").trim().charAt(0).toLocaleUpperCase("tr")||"?",s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${a}"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="52" font-weight="700" fill="#fff">${t.replace(/[<&>"]/g,"")}</text></svg>`;return`data:image/svg+xml,${encodeURIComponent(s)}`}function ta(e=[],a){if(!Array.isArray(a))return ni(e);const t=new Map(a.map(r=>[r.id,r])),s=e.map(r=>({...r,...t.get(r.id)||{}}));a.forEach(r=>{e.some(n=>n.id===r.id)||s.push({...r})});const i=a.map(r=>r.id);return s.sort((r,n)=>{const o=i.indexOf(r.id),c=i.indexOf(n.id);return(o===-1?999:o)-(c===-1?999:c)}),s}function ri(e={}){const a=ni(Wi),t=e||{},s=Array.isArray(t.moduleOrder)?t.moduleOrder.filter(v=>a.modules[v]):[],i=[...new Set([...s,...Object.keys(a.modules)])],r={};i.forEach(v=>{const k=a.modules[v],w={...k,...(t.modules||{})[v]||{}};w.labelOverridden=!!(t.modules&&t.modules[v]&&t.modules[v].label&&t.modules[v].label!==k.label),w.iconClass=w.icon,w.icon=ea(w.icon),r[v]=w});const n=t.companyName||a.companyName,o=r.copilot;o&&(o.baseLabel=a.modules.copilot.label,(!o.label||o.label===a.modules.copilot.label)&&(o.label=`${n} ${o.baseLabel}`));const c=ta(a.sections,t.sections),u=ta(a.salesTypes,t.salesTypes).filter(v=>v.enabled!==!1).map(v=>({...v,iconClass:v.icon,icon:ea(v.icon)})),l=ta(a.reportTypes,t.reportTypes).filter(v=>v.enabled!==!1).map(v=>({...v,iconClass:v.icon,icon:ea(v.icon)})),d={...a.api,...t.api||{}},m=t.slug||"default",p=t.storagePrefix||a.storagePrefix||m;return{slug:m,companyName:n,appName:t.appName||a.appName,shortName:t.shortName||t.appName||a.shortName,appDescription:t.appDescription??a.appDescription,version:a.version,logoUrl:t.logo?t.logo.startsWith("data:")?t.logo:`./tenant/${t.logo}`:Xi(t.companyName||a.companyName,{...a.theme,...t.theme||{}}.primary),logoZoom:Math.min(300,Math.max(40,Number(t.logoZoom)||100)),logoOffsetX:Math.min(50,Math.max(-50,Number(t.logoOffsetX)||0)),logoOffsetY:Math.min(50,Math.max(-50,Number(t.logoOffsetY)||0)),erpApiUrl:d.erpApiUrl,apiTimeout:d.apiTimeout,useMockApi:d.useMockApi,theme:{...a.theme,...t.theme||{}},support:{...a.support,...t.support||{}},sections:c,modules:r,salesTypes:u,reportTypes:l,barcode:{...a.barcode,...t.barcode||{},printer:{...(a.barcode||{}).printer,...(t.barcode||{}).printer||{}}},priceTypes:t.priceTypes||a.priceTypes,currencies:t.currencies||a.currencies,defaultBranch:t.defaultBranch??null,defaultWarehouse:t.defaultWarehouse??null,language:t.language||a.language,purchaseConfig:{...a.purchaseConfig,...t.purchaseConfig||{}},terms:{sale:"Satış",sales:"satış",saleIcon:"ph-shopping-cart",warehouses:"depolar arası",customer:"Müşteri",depotOf:"deposunun",...t.terms||{}},storageKeys:{token:`${p}_token`,user:`${p}_user`,apiUrl:`${p}_api_url`,theme:`${p}_theme`,settings:`${p}_settings`,notify:`${p}_notify`}}}const F=ri({});function li(e){const a=ri(e);return Object.keys(F).forEach(t=>delete F[t]),Object.assign(F,a),F}function Lt(e,a){var s;const t=(s=F.modules)==null?void 0:s[e];return t&&t.labelOverridden?t.label:a}function Et(e,a){var t;return((t=(F.reportTypes||[]).find(s=>s.id===e))==null?void 0:t.label)||a}class Zi{constructor(){this._state={user:null,isAuthenticated:!1,currentPage:"login",apiUrl:"",notifications:[],loading:!1,branches:[],warehouses:[],selectedBranch:null,selectedWarehouse:null},this._listeners={}}get(a){return this._state[a]}set(a,t){const s=this._state[a];this._state[a]=t,this._notify(a,t,s)}update(a){Object.entries(a).forEach(([t,s])=>{this.set(t,s)})}subscribe(a,t){return this._listeners[a]||(this._listeners[a]=[]),this._listeners[a].push(t),()=>{this._listeners[a]=this._listeners[a].filter(s=>s!==t)}}_notify(a,t,s){this._listeners[a]&&this._listeners[a].forEach(i=>i(t,s))}reset(){this._state={user:null,isAuthenticated:!1,currentPage:"login",apiUrl:this._state.apiUrl,notifications:[],loading:!1,branches:[],warehouses:[],selectedBranch:null,selectedWarehouse:null}}}const Be=new Zi,es="modulepreload",ts=function(e,a){return new URL(e,a).href},Ba={},Ge=function(a,t,s){let i=Promise.resolve();if(t&&t.length>0){const n=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));i=Promise.allSettled(t.map(u=>{if(u=ts(u,s),u in Ba)return;Ba[u]=!0;const l=u.endsWith(".css"),d=l?'[rel="stylesheet"]':"";if(!!s)for(let v=n.length-1;v>=0;v--){const k=n[v];if(k.href===u&&(!l||k.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${d}`))return;const p=document.createElement("link");if(p.rel=l?"stylesheet":es,l||(p.as="script"),p.crossOrigin="",p.href=u,c&&p.setAttribute("nonce",c),document.head.appendChild(p),l)return new Promise((v,k)=>{p.addEventListener("load",v),p.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${u}`)))})}))}function r(n){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=n,window.dispatchEvent(o),!o.defaultPrevented)throw n}return i.then(n=>{for(const o of n||[])o.status==="rejected"&&r(o.reason);return a().catch(r)})},as=[{id:1,username:"admin",password:"1234",name:"Buhara Karataştan",role:"admin",branch:"101",branchName:"(MESIHPASA)NURVAR"},{id:2,username:"depocu",password:"1234",name:"Mehmet Kaya",role:"warehouse",branch:"102",branchName:"(AGAYOKUSU)NURVAR"},{id:3,username:"satici",password:"1234",name:"Fatma Demir",role:"sales",branch:"101",branchName:"(MESIHPASA)NURVAR"}],is=[{id:"101",name:"(MESIHPASA)NURVAR",code:"101"},{id:"102",name:"(AGAYOKUSU)NURVAR",code:"102"},{id:"103",name:"KESTEL ŞUBE",code:"103"}],aa=[{id:"1014",name:"Ana Depo",code:"1014",branchId:"101"},{id:"1017",name:"TAŞÇI HAKAN DEPO",code:"1017",branchId:"101"},{id:"1020",name:"Ana Depo",code:"1020",branchId:"102"},{id:"1021",name:"Yedek Depo",code:"1021",branchId:"102"},{id:"1030",name:"Kestel Depo",code:"1030",branchId:"103"}],ss=[{id:"jn1016",code:"JN1016/01/012/D/295F102/AK",name:"PERDELİK TÜL KUMAŞ",desen:"JN1016",zemin:"01",varyant:"012",en:295,enUnit:"cm",netWeight:222.7,brutWeight:522.7,unit:"METER",collection:"PLAIN KOLEKSİYON",prices:{MT:{usd:7.2,eur:6.2,try:325,profitRate:30},MP:{usd:8.5,eur:7.3,try:385,profitRate:35},IT:{usd:6,eur:5.1,try:270,profitRate:25},CT:{usd:9,eur:7.8,try:410,profitRate:40}},hasSerial:!0},{id:"fa1827",code:"FA1827/33/017/D/280F80/BJ",name:"DÖŞEMELIK KUMAŞ",desen:"FA1827",zemin:"33",varyant:"017",en:280,enUnit:"cm",netWeight:180.5,brutWeight:410,unit:"METER",collection:"PREMIUM KOLEKSİYON",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22},CT:{usd:15.5,eur:13.4,try:700,profitRate:38}},hasSerial:!0},{id:"mb2045",code:"MB2045/05/003/D/310F120/WH",name:"FONFON PERDE",desen:"MB2045",zemin:"05",varyant:"003",en:310,enUnit:"cm",netWeight:150.2,brutWeight:340,unit:"METER",collection:"BASIC KOLEKSİYON",prices:{MT:{usd:5.8,eur:5,try:262,profitRate:25},MP:{usd:6.9,eur:5.95,try:312,profitRate:30},IT:{usd:4.8,eur:4.15,try:218,profitRate:20},CT:{usd:7.5,eur:6.45,try:340,profitRate:35}},hasSerial:!0}],ht=[{serialNo:"N19000041841",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:16.5,cell:"1014M3/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"JN1047/017/017 BEYAZ",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000041842",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:10.7,cell:"1014M3/01/03",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"JN1047/017/017 BEYAZ",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044948",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:24,cell:"1014M3/02/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044952",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:10.3,cell:"1014M3/02/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044953",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:17.5,cell:"1014M4/01/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044954",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:11.2,cell:"1014M4/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044955",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:17.5,cell:"1014M4/01/03",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"H022400004087",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:19.5,cell:"1014M5/01/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0525031616",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:14,cell:"1014M5/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0826032796",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:35,cell:"1014M5/02/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0826032690",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:35,cell:"1014M5/02/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0924022375",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:32,cell:"1014M5/03/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}}],ns=[{id:1,name:"ABC Tekstil Ltd.",code:"C001",balance:{usd:15240.5,eur:12800,try:685e3}},{id:2,name:"XYZ Mobilya A.Ş.",code:"C002",balance:{usd:8750,eur:7200,try:395e3}},{id:3,name:"Güneş Perde San.",code:"C003",balance:{usd:22100,eur:18500,try:998e3}},{id:4,name:"Yıldız Home Tekstil",code:"C004",balance:{usd:3400,eur:2900,try:153e3}}],Ha=[{name:"Mesihpaşa Usd Kasa",balance:142210.99,currency:"USD"},{name:"MESİHPAŞA KİRA GETİRİSİ",balance:104256,currency:"USD"},{name:"Kestel USD Kasa",balance:0,currency:"USD"},{name:"Mesihpaşa Euro Kasa",balance:85430.5,currency:"EUR"},{name:"Mesihpaşa TL Kasa",balance:215e4,currency:"TRY"}],Se=[{id:"SUP001",code:"TED-001",name:"Güven Tekstil A.Ş.",contactPerson:"Ahmet Yılmaz",phone:"+90 212 555 0101",email:"ahmet@guvtekstil.com",address:"İkitelli OSB, İstanbul",taxNo:"1234567890",currency:"TRY",paymentTerm:30,category:"Tekstil",status:"active",totalOrders:12,totalAmount:485e3,createdAt:"2025-01-15"},{id:"SUP002",code:"TED-002",name:"Euro Fabric GmbH",contactPerson:"Klaus Müller",phone:"+49 30 555 0202",email:"k.muller@eurofabric.de",address:"Berlin, Germany",taxNo:"DE123456789",currency:"EUR",paymentTerm:45,category:"Tekstil",status:"active",totalOrders:8,totalAmount:92e3,createdAt:"2025-03-10"},{id:"SUP003",code:"TED-003",name:"Anadolu Hammadde Ltd.",contactPerson:"Fatma Arslan",phone:"+90 332 555 0303",email:"fatma@anadoluhmm.com",address:"Organize Sanayi, Konya",taxNo:"9876543210",currency:"TRY",paymentTerm:15,category:"Hammadde",status:"active",totalOrders:24,totalAmount:124e4,createdAt:"2024-11-05"},{id:"SUP004",code:"TED-004",name:"Global Ambalaj San.",contactPerson:"Mehmet Çetin",phone:"+90 262 555 0404",email:"mcetin@globalambalaj.com",address:"Gebze Sanayi, Kocaeli",taxNo:"1122334455",currency:"TRY",paymentTerm:30,category:"Ambalaj",status:"passive",totalOrders:5,totalAmount:87e3,createdAt:"2025-06-20"}],oe=[{id:"PO-2026-001",supplierId:"SUP001",supplierName:"Güven Tekstil A.Ş.",orderDate:"2026-09-01",expectedDate:"2026-09-15",status:"received",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"INV-2026-0412",notes:"Acil ihtiyaç",lines:[{id:"L1",productCode:"JN1016/01/012",productName:"PERDELİK TÜL KUMAŞ",unit:"METER",qty:500,receivedQty:500,unitPrice:325,taxRate:20,discount:5},{id:"L2",productCode:"FA1827/33/017",productName:"DÖŞEMELIK KUMAŞ",unit:"METER",qty:200,receivedQty:200,unitPrice:565,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:"Buhara Karataştan",approvedAt:"2026-09-02"},{id:"PO-2026-002",supplierId:"SUP003",supplierName:"Anadolu Hammadde Ltd.",orderDate:"2026-09-10",expectedDate:"2026-09-20",status:"approved",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"",notes:"",lines:[{id:"L1",productCode:"RAW-KAKAO",productName:"Toz Kakao",unit:"Kg",qty:1e3,receivedQty:0,unitPrice:145,taxRate:8,discount:0},{id:"L2",productCode:"RAW-SEKER",productName:"Toz Şeker",unit:"Kg",qty:2e3,receivedQty:0,unitPrice:48,taxRate:8,discount:2},{id:"L3",productCode:"RAW-SUT",productName:"Süt Tozu",unit:"Kg",qty:500,receivedQty:0,unitPrice:220,taxRate:8,discount:0}],createdBy:"Buhara Karataştan",approvedBy:"Buhara Karataştan",approvedAt:"2026-09-11"},{id:"PO-2026-003",supplierId:"SUP002",supplierName:"Euro Fabric GmbH",orderDate:"2026-09-12",expectedDate:"2026-09-30",status:"partial",currency:"EUR",exchangeRate:37.5,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"EF-INV-4521",notes:"İkinci parti Ekim'de gelecek",lines:[{id:"L1",productCode:"MB2045/05/003",productName:"FONFON PERDE",unit:"METER",qty:300,receivedQty:150,unitPrice:5,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:null,approvedAt:null},{id:"PO-2026-004",supplierId:"SUP004",supplierName:"Global Ambalaj San.",orderDate:"2026-09-15",expectedDate:"2026-09-22",status:"draft",currency:"TRY",exchangeRate:1,warehouseId:"1020",warehouseName:"Ana Depo",invoiceNo:"",notes:"Fiyat teklifi bekleniyor",lines:[{id:"L1",productCode:"RAW-AMBALAJ",productName:"5kg Kova Ambalaj",unit:"Adet",qty:500,receivedQty:0,unitPrice:85,taxRate:20,discount:10}],createdBy:"Mehmet Kaya",approvedBy:null,approvedAt:null},{id:"PO-2026-005",supplierId:"SUP001",supplierName:"Güven Tekstil A.Ş.",orderDate:"2026-08-20",expectedDate:"2026-09-05",status:"cancelled",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"",notes:"Tedarikçi iptal etti",lines:[{id:"L1",productCode:"JN1016/01/012",productName:"PERDELİK TÜL KUMAŞ",unit:"METER",qty:100,receivedQty:0,unitPrice:325,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:null,approvedAt:null}],rs={draft:{label:"Taslak",color:"#9E9E9E",icon:"ph-pencil-simple"},pending:{label:"Onay Bekliyor",color:"#FF9800",icon:"ph-clock"},approved:{label:"Onaylandı",color:"#2196F3",icon:"ph-check-circle"},ordered:{label:"Sipariş Verildi",color:"#9C27B0",icon:"ph-package"},partial:{label:"Kısmi Teslim",color:"#FF5722",icon:"ph-arrows-split"},received:{label:"Teslim Alındı",color:"#4CAF50",icon:"ph-check-fat"},cancelled:{label:"İptal",color:"#F44336",icon:"ph-x-circle"}};function oi(e){const a=(e.qty||0)*(e.unitPrice||0),t=a*((e.discount||0)/100);return a-t}function Ht(e){return(e.lines||[]).reduce((a,t)=>a+oi(t),0)}function ba(e){return(e.lines||[]).reduce((a,t)=>{const s=oi(t);return a+s*((t.taxRate||0)/100)},0)}function qt(e){return Ht(e)+ba(e)}function ls(e=400){return new Promise(a=>setTimeout(a,e+Math.random()*300))}async function ci(e,a,t){var s;if(await ls(),a==="/auth/login"&&e==="POST"){const i=as.find(r=>r.username===t.username&&r.password===t.password);if(i){const{password:r,...n}=i;return{success:!0,data:{token:"mock-token-"+Date.now(),user:n}}}return{success:!1,message:"Kullanıcı adı veya şifre hatalı"}}if(a==="/auth/logout")return{success:!0};if(a==="/branches"&&e==="GET")return{success:!0,data:is};if(a.startsWith("/warehouses")&&e==="GET"){const i=a.split("/");if(i.length>2){const r=a.split("branchId=")[1];return r?{success:!0,data:aa.filter(n=>n.branchId===r)}:{success:!0,data:aa.filter(n=>n.id===i[2])}}return{success:!0,data:aa}}if(a.startsWith("/stocks/")&&e==="GET"){const i=decodeURIComponent(a.split("/stocks/")[1]).toLowerCase(),r=ss.filter(n=>n.id.toLowerCase().includes(i)||n.code.toLowerCase().includes(i)||n.name.toLowerCase().includes(i)||n.desen.toLowerCase().includes(i));return r.length>0?{success:!0,data:r[0],results:r}:{success:!1,message:"Stok bulunamadı"}}if(a.startsWith("/serials/")&&e==="GET"){const i=a.split("/"),r=i[2];if(i[3]==="others"){const c=ht.find(u=>u.serialNo===r);if(c){const u=ht.filter(d=>d.stockId===c.stockId&&d.serialNo!==r),l=u.reduce((d,m)=>d+m.quantity,0);return{success:!0,data:{items:u,totalCount:u.length,totalQuantity:Math.round(l*100)/100}}}return{success:!0,data:{items:[],totalCount:0,totalQuantity:0}}}const n=ht.find(c=>c.serialNo===r);if(n)return{success:!0,data:n};const o=ht.filter(c=>c.serialNo.includes(r));return o.length>0?{success:!0,data:o[0],results:o}:{success:!1,message:"Seri numarası bulunamadı"}}if(a==="/transfers"&&e==="POST")return{success:!0,data:{transferId:"TRF-"+Date.now(),processId:3,status:"completed",barcodeCount:((s=t.barcodes)==null?void 0:s.length)||0},message:"Transfer işlemi başarıyla tamamlandı"};if(a==="/sales"&&e==="POST")return{success:!0,data:{saleId:"SL-"+Date.now(),status:"completed"},message:"Satış işlemi başarıyla kaydedildi"};if(a==="/sales/types"&&e==="GET")return{success:!0,data:["toptan","perakende","ihracat","b2b","iade"]};if(a==="/purchases"&&e==="POST")return{success:!0,data:{purchaseId:"PR-"+Date.now(),status:"completed"},message:"Alış işlemi başarıyla kaydedildi"};if(a==="/stock-count"&&e==="POST")return{success:!0,data:{countId:"SC-"+Date.now(),status:"completed"},message:"Sayım verisi başarıyla kaydedildi"};if(a==="/reports/customer-balance"&&e==="GET")return{success:!0,data:ns};if(a==="/reports/cash-balance"&&e==="GET")return{success:!0,data:Ha};if(a==="/copilot/chat"&&e==="POST"){const i=(t.message||"").toLowerCase().trim();let r="";if(i.includes("merhaba")||i.includes("selam"))r="Merhaba! Size nasıl yardımcı olabilirim?";else if(i.includes("kasa")&&i.includes("dolar")){const n=Ha.filter(c=>c.currency==="USD");let o="<table><tr><th>Kasa Adı</th><th>Bakiye (USD)</th></tr>";n.forEach(c=>{o+=`<tr><td>${c.name}</td><td>$${c.balance.toLocaleString("tr-TR")}</td></tr>`}),o+="</table>",r=`Kasa dolar bakiyeniz aşağıdaki gibidir:
${o}
Başka bir konuda yardımcı olabilir miyim?`}else if(i.includes("fa1827")||i.includes("fa 1827")){const n=ht.filter(l=>l.stockId==="fa1827"),o=n.reduce((l,d)=>l+d.quantity,0),c=Math.max(...n.map(l=>l.quantity));let u="<table><tr><th>Seri No</th><th>Depo Kod</th><th>Bakiye (metre)</th></tr>";n.forEach(l=>{u+=`<tr><td>${l.serialNo}</td><td>${l.warehouseId}</td><td>${l.quantity}</td></tr>`}),u+="</table>",r=`Fa1827/33 deseni için depo bilgileri aşağıdaki gibidir:

- <b>Toplam Miktar:</b> ${o} metre
- <b>En Büyük Seri Miktarı:</b> ${c} metre

Her bir seri için ayrıntılar:
${u}
Başka bir konuda yardımcı olabilir miyim?`}else i.includes("stok")||i.includes("ürün")?r='Hangi stok kodu veya desen hakkında bilgi almak istersiniz? Örneğin: "JN1016 stok bilgisi" veya "FA1827/33 deseni hangi depoda?"':i.includes("satış")||i.includes("satılan")?r="Bugün satılan mallarla ilgili bilgi almak için sistemdeki satış raporlarına bakmam gerekiyor. Ancak şu anda bu bilgiye doğrudan erişimim yok. Lütfen satış raporlarınızı kontrol edin veya sistem yöneticinizle iletişime geçin. Başka bir konuda yardımcı olabilir miyim?":r=`Bu konuda size yardımcı olmak isterdim. Şu konularda sorularınızı yanıtlayabilirim:

• Stok ve seri sorgulama
• Kasa bakiye bilgileri
• Desen bazlı depo bilgileri

Nasıl yardımcı olabilirim?`;return{success:!0,data:{message:r,timestamp:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}}}if(a==="/suppliers"&&e==="GET")return{success:!0,data:Se};if(a.startsWith("/suppliers/")&&e==="GET"){const i=a.split("/suppliers/")[1],r=Se.find(n=>n.id===i);return r?{success:!0,data:r}:{success:!1,message:"Tedarikçi bulunamadı"}}if(a==="/suppliers"&&e==="POST"){const i={...t,id:"SUP"+String(Se.length+1).padStart(3,"0"),code:"TED-"+String(Se.length+1).padStart(3,"0"),totalOrders:0,totalAmount:0,createdAt:new Date().toISOString().slice(0,10)};return Se.push(i),{success:!0,data:i,message:"Tedarikçi eklendi"}}if(a.startsWith("/suppliers/")&&e==="PUT"){const i=a.split("/suppliers/")[1],r=Se.findIndex(n=>n.id===i);return r===-1?{success:!1,message:"Tedarikçi bulunamadı"}:(Se[r]={...Se[r],...t},{success:!0,data:Se[r],message:"Tedarikçi güncellendi"})}if(a.startsWith("/suppliers/")&&e==="DELETE"){const i=a.split("/suppliers/")[1],r=Se.findIndex(n=>n.id===i);return r===-1?{success:!1,message:"Tedarikçi bulunamadı"}:(Se[r].status="passive",{success:!0,message:"Tedarikçi pasife alındı"})}if(a==="/purchase-orders"&&e==="GET"){let i=[...oe];return t&&t.status&&(i=i.filter(n=>n.status===t.status)),t&&t.supplierId&&(i=i.filter(n=>n.supplierId===t.supplierId)),{success:!0,data:i.map(n=>({...n,totalNet:Ht(n),totalTax:ba(n),totalGross:qt(n)}))}}if(a.startsWith("/purchase-orders/")&&!a.includes("/receive")&&e==="GET"){const i=a.split("/purchase-orders/")[1],r=oe.find(n=>n.id===i);return r?{success:!0,data:{...r,totalNet:Ht(r),totalTax:ba(r),totalGross:qt(r)}}:{success:!1,message:"Sipariş bulunamadı"}}if(a==="/purchase-orders"&&e==="POST"){const i=new Date().getFullYear(),r=String(oe.length+1).padStart(3,"0"),n={...t,id:`PO-${i}-${r}`,status:t.status||"draft",createdAt:new Date().toISOString().slice(0,10)};oe.push(n);const o=Se.find(c=>c.id===n.supplierId);return o&&o.totalOrders++,{success:!0,data:n,message:"Satın alma siparişi oluşturuldu"}}if(a.startsWith("/purchase-orders/")&&e==="PUT"){const i=a.split("/purchase-orders/")[1].split("/")[0],r=oe.findIndex(n=>n.id===i);return r===-1?{success:!1,message:"Sipariş bulunamadı"}:(oe[r]={...oe[r],...t},{success:!0,data:oe[r],message:"Sipariş güncellendi"})}if(a.startsWith("/purchase-orders/")&&a.endsWith("/approve")&&e==="POST"){const i=a.split("/purchase-orders/")[1].replace("/approve",""),r=oe.findIndex(n=>n.id===i);return r===-1?{success:!1,message:"Sipariş bulunamadı"}:["draft","pending"].includes(oe[r].status)?(oe[r].status="approved",oe[r].approvedBy=t.approvedBy||"Kullanıcı",oe[r].approvedAt=new Date().toISOString().slice(0,10),{success:!0,data:oe[r],message:"Sipariş onaylandı"}):{success:!1,message:"Bu sipariş onaylanamaz"}}if(a.startsWith("/purchase-orders/")&&a.endsWith("/cancel")&&e==="POST"){const i=a.split("/purchase-orders/")[1].replace("/cancel",""),r=oe.findIndex(n=>n.id===i);return r===-1?{success:!1,message:"Sipariş bulunamadı"}:["received","cancelled"].includes(oe[r].status)?{success:!1,message:"Bu sipariş iptal edilemez"}:(oe[r].status="cancelled",oe[r].cancelReason=t.reason||"",{success:!0,data:oe[r],message:"Sipariş iptal edildi"})}if(a.startsWith("/purchase-orders/")&&a.endsWith("/receive")&&e==="POST"){const i=a.split("/purchase-orders/")[1].replace("/receive",""),r=oe.findIndex(l=>l.id===i);if(r===-1)return{success:!1,message:"Sipariş bulunamadı"};const n=oe[r];if(!["approved","ordered","partial"].includes(n.status))return{success:!1,message:"Bu sipariş için mal kabul yapılamaz"};(t.receivedLines||[]).forEach(l=>{const d=n.lines.find(m=>m.id===l.lineId);d&&(d.receivedQty=Math.min((d.receivedQty||0)+l.qty,d.qty))}),n.invoiceNo=t.invoiceNo||n.invoiceNo,n.receiptDate=new Date().toISOString().slice(0,10);const c=n.lines.every(l=>l.receivedQty>=l.qty);n.status=c?"received":"partial";const u=Se.find(l=>l.id===n.supplierId);return u&&(u.totalAmount+=Ht(n)),{success:!0,data:n,message:c?"Tüm kalemler teslim alındı":"Kısmi teslim kaydedildi"}}if(a==="/purchase-reports/summary"&&e==="GET"){const i=oe.length,r={};Object.keys(rs).forEach(c=>{r[c]=0}),oe.forEach(c=>{r[c.status]=(r[c.status]||0)+1});const n=oe.filter(c=>c.status!=="cancelled").reduce((c,u)=>c+qt(u),0),o=oe.filter(c=>c.status==="received").reduce((c,u)=>c+qt(u),0);return{success:!0,data:{total:i,byStatus:r,totalAmount:n,receivedAmount:o}}}return{success:!1,message:"Endpoint bulunamadı: "+a}}const Nt=Object.freeze(Object.defineProperty({__proto__:null,mockApiHandler:ci},Symbol.toStringTag,{value:"Module"})),fa=new Set;let We=null,vt="online";const zt=()=>navigator.onLine===!1;function di(e){return fa.add(e),()=>fa.delete(e)}function os(){return We||(We=document.createElement("div"),We.className="net-bar",We.setAttribute("role","status"),document.body.appendChild(We),We)}function ze(e,a=""){if(e===vt&&e!=="server")return;const t=os();e==="online"?vt!=="online"&&(t.className="net-bar show ok",t.innerHTML='<i class="ph ph-wifi-high"></i> Bağlantı geri geldi',setTimeout(()=>{t.className="net-bar"},2500),fa.forEach(s=>{try{s()}catch{}})):e==="offline"?(t.className="net-bar show",t.innerHTML='<i class="ph ph-wifi-slash"></i> Çevrimdışısınız — kayıtlar gönderilemez'):e==="server"&&(t.className="net-bar show warn",t.innerHTML=`<i class="ph ph-plugs"></i> Sunucuya ulaşılamıyor${a?` — ${a}`:""}`,clearTimeout(ze._t),ze._t=setTimeout(()=>{vt==="server"&&(t.className="net-bar",vt="online")},6e3)),vt=e}function cs(){window.addEventListener("offline",()=>ze("offline")),window.addEventListener("online",()=>ze("online")),zt()&&ze("offline")}class ds{constructor(){this.baseUrl=this._getBaseUrl(),this.timeout=F.apiTimeout}_getBaseUrl(){return localStorage.getItem(F.storageKeys.apiUrl)||F.erpApiUrl||""}resetBaseUrl(){localStorage.removeItem(F.storageKeys.apiUrl),this.baseUrl=F.erpApiUrl||""}setBaseUrl(a){this.baseUrl=a,localStorage.setItem(F.storageKeys.apiUrl,a)}getBaseUrl(){return this.baseUrl}_getHeaders(){const a={"Content-Type":"application/json"};document.documentElement.classList.contains("in-preview")&&(a["X-Preview-Tenant"]=F.slug),this.tenantId&&(a["X-Tenant-Id"]=this.tenantId);const t=localStorage.getItem(F.storageKeys.token);return t&&(a.Authorization=`Bearer ${t}`),a}async request(a,t,s=null,i=0){if(F.useMockApi&&!F.erpApiUrl)return ci(a,t,s);if(zt()&&a!=="GET")throw new Error("Çevrimdışısınız. Bağlantı gelince tekrar deneyin.");const r=`${this.baseUrl}${t}`,n={method:a,headers:this._getHeaders()};s&&(a==="POST"||a==="PUT"||a==="PATCH")&&(n.body=JSON.stringify(s));try{const o=new AbortController,c=setTimeout(()=>o.abort(),this.timeout);n.signal=o.signal;const u=await fetch(r,n);if(clearTimeout(c),u.status===401&&t!=="/auth/login")throw Be.update({user:null,isAuthenticated:!1}),localStorage.removeItem(F.storageKeys.token),localStorage.removeItem(F.storageKeys.user),window.location.hash="#/login",new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");if(!u.ok){const l=await u.json().catch(()=>({}));throw u.status>=500&&ze("server",`sunucu hatası (${u.status})`),(/^\/(stock-adjust|activity|notifications|finance)/.test(t)||a==="DELETE"&&/^\/products\//.test(t))&&(u.status===404||u.status===403&&(!l.message||l.message==="Bu işlem için yetkiniz yok."))?new Error("Sunucudaki backend dosyaları eski görünüyor (yeni özellik bulunamadı). Backend zip’inin TÜM dosyalarını (server.js, jobTracking.js, activity.js, copilot.js …) uygulama klasörüne yükleyip Node uygulamasını Yeniden Başlatın."):new Error(l.message||(u.status===403?"Bu işlem için yetkiniz yok.":u.status===404?"İstenen kayıt bulunamadı.":`Sunucu hatası (${u.status})`))}return u.status!==204&&ze("online"),await u.json()}catch(o){const c=o.name==="AbortError",u=c||o instanceof TypeError||/Failed to fetch|NetworkError|Load failed/i.test(o.message||"");if(u&&a==="GET"&&i===0&&!zt())return await new Promise(l=>setTimeout(l,900)),this.request(a,t,s,1);throw u?zt()?(ze("offline"),new Error("Çevrimdışısınız. Bağlantınızı kontrol edin.")):(ze("server",c?"yanıt gecikti":""),new Error(c?"Sunucu yanıt vermedi (zaman aşımı). Bağlantıyı kontrol edip tekrar deneyin.":"Sunucuya ulaşılamıyor. Adresi ve bağlantınızı kontrol edin.")):o}}get(a){return this.request("GET",a)}post(a,t){return this.request("POST",a,t)}put(a,t){return this.request("PUT",a,t)}delete(a){return this.request("DELETE",a)}async getRawMaterials(){if(F.useMockApi&&!F.erpApiUrl){const{mockApi:a}=await Ge(async()=>{const{mockApi:t}=await Promise.resolve().then(()=>Nt);return{mockApi:t}},void 0,import.meta.url);return a.getRawMaterials()}return this.get("/raw-materials")}async getRecipes(){if(F.useMockApi&&!F.erpApiUrl){const{mockApi:a}=await Ge(async()=>{const{mockApi:t}=await Promise.resolve().then(()=>Nt);return{mockApi:t}},void 0,import.meta.url);return a.getRecipes()}return this.get("/recipes")}async produceItem(a,t){if(F.useMockApi&&!F.erpApiUrl){const{mockApi:s}=await Ge(async()=>{const{mockApi:i}=await Promise.resolve().then(()=>Nt);return{mockApi:i}},void 0,import.meta.url);return s.produceItem(a,t)}return this.post("/production",{productId:a,quantity:t})}async getBranches(){return this.get("/branches")}async getWarehouses(){return this.get("/warehouses")}async getCustomers(){return this.get("/customers")}async makeSale(a,t,s,i,r,n,o,c){return this.post("/sales",{customerId:a,warehouseId:t,productId:s,quantity:i,type:r,...n?{orderId:n,lineId:o}:{},...c?{note:c}:{}})}async getProducts(){return this.get("/products")}async addPurchase(a,t,s,i){return this.post("/purchase",{barcode:a,name:t,quantity:s,warehouseId:i})}async login(a,t){if(F.useMockApi&&!F.erpApiUrl){const{mockApi:s}=await Ge(async()=>{const{mockApi:i}=await Promise.resolve().then(()=>Nt);return{mockApi:i}},void 0,import.meta.url);return s.login(a,t)}return this.post("/auth/login",{username:a,password:t})}}const I=new ds,ge={async login(e,a){try{const t=await I.post("/auth/login",{username:e,password:a});if(t.success){const{token:s,user:i}=t.data;return localStorage.setItem(F.storageKeys.token,s),localStorage.setItem(F.storageKeys.user,JSON.stringify(i)),Be.update({user:i,isAuthenticated:!0}),{success:!0,user:i}}return{success:!1,message:t.message||"Giriş başarısız"}}catch(t){return{success:!1,message:t.message||"Bağlantı hatası"}}},async logout(){try{await I.post("/auth/logout")}catch{}localStorage.removeItem(F.storageKeys.token),localStorage.removeItem(F.storageKeys.user),Be.reset(),Z.navigate("login")},checkSession(){const e=localStorage.getItem(F.storageKeys.token),a=localStorage.getItem(F.storageKeys.user);if(e&&a)try{const t=JSON.parse(a);return Be.update({user:t,isAuthenticated:!0}),!0}catch{return this.logout(),!1}return!1},getUser(){return Be.get("user")},isLoggedIn(){return Be.get("isAuthenticated")},getUserInitial(){const e=Be.get("user");return e&&e.name?e.name.charAt(0).toUpperCase():"K"}};function ia(e,a){let t=document.querySelector(`meta[name="${e}"]`);t||(t=document.createElement("meta"),t.name=e,document.head.appendChild(t)),t.content=a}function us(e){let a=document.querySelector('link[rel="icon"]');a||(a=document.createElement("link"),a.rel="icon",document.head.appendChild(a)),a.href=e}function ui(e){const a=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(e||"");if(!a)return null;const[t,s,i]=a.slice(1).map(r=>parseInt(r,16)/255).map(r=>r<=.03928?r/12.92:Math.pow((r+.055)/1.055,2.4));return .2126*t+.7152*s+.0722*i}function ps(e){const a=ui(e);return a==null?"#fff":a>.5?"#1A1D26":"#fff"}function ms(e){const a=ui(e.secondary);return a!=null&&a<.55?e.secondaryDark||e.secondary:e.primaryLight||e.primary}function pi(){const e=F.theme,a=document.documentElement.style,t={"--primary":e.primary,"--primary-light":e.primaryLight,"--primary-dark":e.primaryDark,"--secondary":e.secondary,"--secondary-light":e.secondaryLight,"--secondary-dark":e.secondaryDark,"--accent":e.secondary,"--accent-light":e.secondaryLight,"--surface-dark":e.surface};Object.entries(t).forEach(([s,i])=>i&&a.setProperty(s,i)),a.setProperty("--on-primary",ps(e.primary)),a.setProperty("--accent-2",ms(e)),a.setProperty("--logo-zoom",String(F.logoZoom/100)),a.setProperty("--logo-x",`${F.logoOffsetX}%`),a.setProperty("--logo-y",`${F.logoOffsetY}%`),document.title=F.appName,ia("theme-color",e.surface||e.primary),ia("description",F.appDescription),ia("apple-mobile-web-app-title",F.shortName),us(F.logoUrl)}async function hs(){let e={};try{const a=await fetch("./tenant.json",{cache:"no-store"});a.ok?e=await a.json():console.warn("tenant.json bulunamadı, varsayılan ayarlar kullanılıyor.")}catch(a){console.warn("tenant.json okunamadı, varsayılan ayarlar kullanılıyor.",a)}return li(e),pi(),F}function vs({onUpdate:e,onNavigate:a}){window.parent!==window&&(document.documentElement.classList.add("in-preview"),window.addEventListener("message",t=>{t.origin!==window.location.origin||!t.data||typeof t.data!="object"||(t.data.type==="tenant-preview"?(li(t.data.tenant||{}),pi(),e==null||e()):t.data.type==="preview-navigate"&&(a==null||a(t.data.route)))}),window.parent.postMessage({type:"preview-ready"},window.location.origin))}function sa(e,{maskable:a=!1}={}){return new Promise(t=>{var c,u;const s=document.createElement("canvas");s.width=s.height=e;const i=s.getContext("2d"),r=((c=F.theme)==null?void 0:c.surface)||((u=F.theme)==null?void 0:u.primary)||"#0F2240";if(i.fillStyle=r,a)i.fillRect(0,0,e,e);else{const l=e*.22;i.beginPath(),i.roundRect?i.roundRect(0,0,e,e,l):i.rect(0,0,e,e),i.fill()}const n=()=>t(s.toDataURL("image/png")),o=new Image;o.crossOrigin="anonymous",o.onload=()=>{const l=a?e*.22:e*.16,d=e-l*2,m=Math.min(d/o.width,d/o.height),p=o.width*m,v=o.height*m;i.drawImage(o,(e-p)/2,(e-v)/2,p,v),n()},o.onerror=()=>{i.fillStyle="#fff",i.font=`700 ${e*.45}px Inter, system-ui, sans-serif`,i.textAlign="center",i.textBaseline="middle",i.fillText((F.companyName||"?").trim().charAt(0).toLocaleUpperCase("tr"),e/2,e/2+e*.02),n()},o.src=F.logoUrl})}async function bs(){var o,c,u;const[e,a,t]=await Promise.all([sa(192),sa(512),sa(512,{maskable:!0})]),s={name:F.appName,short_name:F.shortName||F.appName,description:F.appDescription,start_url:"./",scope:"./",display:"standalone",orientation:"portrait",background_color:((o=F.theme)==null?void 0:o.surface)||"#0F2240",theme_color:((c=F.theme)==null?void 0:c.surface)||((u=F.theme)==null?void 0:u.primary)||"#0F2240",lang:"tr",icons:[{src:e,sizes:"192x192",type:"image/png",purpose:"any"},{src:a,sizes:"512x512",type:"image/png",purpose:"any"},{src:t,sizes:"512x512",type:"image/png",purpose:"maskable"}]},i=URL.createObjectURL(new Blob([JSON.stringify(s)],{type:"application/manifest+json"}));let r=document.querySelector('link[rel="manifest"]');r||(r=document.createElement("link"),r.rel="manifest",document.head.appendChild(r)),r.href=i;let n=document.querySelector('link[rel="apple-touch-icon"]');n||(n=document.createElement("link"),n.rel="apple-touch-icon",document.head.appendChild(n)),n.href=e}let tt=null;const fs=()=>!!tt;async function gs(){if(!tt)return!1;tt.prompt();const{outcome:e}=await tt.userChoice;return tt=null,window.dispatchEvent(new CustomEvent("pwa-install-state")),e==="accepted"}function ys(){bs().catch(()=>{}),window.addEventListener("beforeinstallprompt",a=>{a.preventDefault(),tt=a,window.dispatchEvent(new CustomEvent("pwa-install-state"))}),window.addEventListener("appinstalled",()=>{tt=null,window.dispatchEvent(new CustomEvent("pwa-install-state"))});const e=window.parent!==window;"serviceWorker"in navigator&&!e&&localStorage.getItem("sw_off")!=="1"?window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})}):"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(a=>a.forEach(t=>t.unregister()))}let ks=0;function P(e,a="info",t=3e3){const s=document.getElementById("toast-container");if(!s)return;const i=`toast-${++ks}`,r={success:'<i class="ph-bold ph-check"></i>',error:'<i class="ph-bold ph-x"></i>',warning:'<i class="ph-bold ph-warning"></i>',info:'<i class="ph-bold ph-info"></i>'},n=document.createElement("div");n.className=`toast ${a}`,n.id=i,n.innerHTML=`
    <div class="toast-icon">${r[a]||r.info}</div>
    <div class="toast-message"></div>
  `,n.querySelector(".toast-message").textContent=String(e??""),s.appendChild(n),setTimeout(()=>{n.classList.add("toast-exit"),setTimeout(()=>{n.remove()},250)},t)}const h=e=>String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]);function $s(){const e=document.createElement("div");e.className="page-login page-container";const a=I.getBaseUrl();return e.innerHTML=`
    <div class="login-logo-area">
      <div class="login-logo" style="background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; width: 110px; height: 110px; border-radius: 50%; padding: 15px;">
        <img src="${F.logoUrl}" alt="${F.companyName} Logo" style="width: 100%; height: 100%; object-fit: contain;" />
      </div>
      <h1 class="login-app-name">${F.appName}</h1>
      <p class="login-app-desc">${F.appDescription}</p>
    </div>

    <div class="login-form-card">
      <h2 class="login-form-title">Giriş Yap</h2>
      <p class="login-form-subtitle">Devam etmek için giriş yapın</p>

      <div class="input-group">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-user"></i></span>
          <input type="text" id="login-username" placeholder="Kullanıcı Adı" autocomplete="username" />
        </div>
      </div>

      <div class="input-group" style="margin-top: 12px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-lock-key"></i></span>
          <input type="password" id="login-password" placeholder="Şifre" autocomplete="current-password" />
          <button class="input-action" id="toggle-password" type="button"><i class="ph ph-eye"></i></button>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" id="login-btn">
        Giriş Yap
      </button>

      <div class="login-divider">Sunucu Ayarları</div>

      <button class="server-settings-toggle" id="server-toggle">
        <span><i class="ph ph-gear"></i></span> Sunucu Ayarları
        <span id="server-toggle-arrow"><i class="ph ph-caret-down"></i></span>
      </button>

      <div class="server-settings-panel" id="server-panel">
        <div class="input-group">
          <label>Servis API URL</label>
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-link"></i></span>
            <input type="url" id="api-url-input" placeholder="http://sunucu:port" value="${h(a)}" />
          </div>
        </div>
        <button class="btn btn-outline btn-block" id="save-api-url" style="margin-top: 12px;">
          <i class="ph ph-floppy-disk"></i> Sunucu Adresini Kaydet
        </button>
      </div>
    </div>
  `,setTimeout(()=>{const t=e.querySelector("#toggle-password"),s=e.querySelector("#login-password");t&&s&&t.addEventListener("click",()=>{s.type=s.type==="password"?"text":"password",t.innerHTML=s.type==="password"?'<i class="ph ph-eye"></i>':'<i class="ph ph-eye-closed"></i>'});const i=e.querySelector("#server-toggle"),r=e.querySelector("#server-panel"),n=e.querySelector("#server-toggle-arrow");i&&r&&i.addEventListener("click",()=>{r.classList.toggle("open"),n&&(n.innerHTML=r.classList.contains("open")?'<i class="ph ph-caret-up"></i>':'<i class="ph ph-caret-down"></i>')});const o=e.querySelector("#save-api-url");o&&o.addEventListener("click",()=>{const d=e.querySelector("#api-url-input");d&&d.value.trim()?(I.setBaseUrl(d.value.trim()),P("Sunucu adresi kaydedildi","success")):d&&(I.resetBaseUrl(),d.value=I.getBaseUrl(),P("Varsayılan sunucu adresine dönüldü","success"))});const c=e.querySelector("#login-btn"),u=e.querySelector("#login-username");async function l(){var v,k;const d=(v=u==null?void 0:u.value)==null?void 0:v.trim(),m=(k=s==null?void 0:s.value)==null?void 0:k.trim();if(!d||!m){P("Kullanıcı adı ve şifre gerekli","warning");return}c.disabled=!0,c.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';const p=await ge.login(d,m);p.success?(P(`Hoş geldiniz, ${p.user.name}!`,"success"),p.user.mustChangePassword&&setTimeout(()=>P(`Varsayılan şifre kullanılıyor. ${F.passwordHint||"Ayarlar > Şifre Değiştir bölümünden"} güncelleyin.`,"warning",8e3),600),Z.navigate("dashboard")):(P(p.message,"error"),c.disabled=!1,c.textContent="Giriş Yap")}c&&c.addEventListener("click",l),s&&s.addEventListener("keydown",d=>{d.key==="Enter"&&l()}),u&&u.addEventListener("keydown",d=>{d.key==="Enter"&&(s==null||s.focus())})},0),e}const ws={finance:"fin.view"};function St(e){const a=ws[e];if(!a)return!0;try{const t=JSON.parse(localStorage.getItem(F.storageKeys.user)||"null");return!t||!Array.isArray(t.permissions)?!0:t.role==="admin"||t.permissions.includes(a)}catch{return!0}}const xs=e=>String(e||"").toLocaleLowerCase("tr").replace(/İ/g,"i"),ga=e=>xs(e).replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c"),Ss=[["overview","Genel Bakış","ph-squares-four","özet durum panel"],["projects","Projeler","ph-folders","proje sorumlu"],["orders","Siparişler","ph-clipboard-text","sipariş miktar giden sevk"],["jobs","İşler","ph-list-checks","iş emri süreç aşama durum"],["performance","Performans","ph-chart-line-up","kişi performans zamanında tamamlama"],["alerts","Uyarılar","ph-bell-ringing","gecikme uyarı"],["team","Ekip & Yetki","ph-users-three","kullanıcı rol yetki personel"]];function Ts(){const e=F.modules,a=i=>{var r;return((r=e[i])==null?void 0:r.enabled)&&St(i)},t=[],s=(i,r,n,o,c="",u="Modüller")=>t.push({label:i,hint:r,icon:n,route:o,group:u,hay:ga(`${i} ${r} ${c}`)});return Object.entries(e).filter(([i,r])=>r.enabled&&St(i)).map(([,i])=>i).forEach(i=>s(i.label,i.description||"",i.icon,i.route,"","Modüller")),a("sales")&&F.salesTypes.forEach(i=>s(i.label,"Satış türü",i.icon,`sales?type=${encodeURIComponent(i.id)}`,`satis ${i.badge||""}`,"Satış")),a("reports")&&F.reportTypes.forEach(i=>s(i.label,"Rapor",i.icon,i.route,"rapor","Raporlar")),F.reportTypes.some(i=>i.route==="stock-detail")&&(s("Stok Yönetimi","Tüm stoğu görüntüle, artır / azalt, ürün sil","ph-sliders-horizontal","stock-detail?tab=manage","stok artir azalt duzelt ekle ürün sil silme depo miktar sayim düzeltme","Stok"),s("Barkod / Stok sorgula","Ürün, barkod veya depo stoğu ara","ph-barcode","stock-detail","barkod urun kod sorgu ara","Stok")),a("reports")&&F.reportTypes.some(i=>i.route==="activity")&&s("Son İşlemler","Kim, ne zaman, ne yaptı — Excel veya PDF olarak indirilebilir","ph-clock-counter-clockwise","activity","pdf excel islem kayit log hareket gecmis kim ne zaman denetim","Raporlar"),a("barcode")&&(s("Barkod › Kayıtlar","Oluşturulan barkodlar, tekrar yazdır","ph-list-magnifying-glass","barcode?tab=records","barkod dizin gecmis etiket tekrar yazdir","Barkod"),s("Barkod › Yazıcı ayarı","Zebra, TSC, ağ veya USB yazıcı bağlantısı","ph-printer","barcode?tab=printer","yazici etiket zpl tspl ajan bluetooth usb","Barkod")),a("finance")&&[["Finans › Özet","Nakit, alacak, borç, kredi ve vadesi yaklaşanlar","ph-chart-line-up","finance","finans nakit bakiye alacak borc kredi vade ozet"],["Finans › Hesaplar","Kasa ve banka hesapları, gelir / gider / virman","ph-vault","finance?tab=accounts","kasa banka hesap gelir gider virman"],["Finans › Müşteri bakiyeleri ve tahsilat","Cari bakiye, vade yaşlandırma, tahsilat, ekstre","ph-users-three","finance?tab=parties","musteri cari bakiye tahsilat ekstre alacak vade"],["Finans › Tedarikçi borçları ve ödeme","Mal kabulden doğan borçlar ve ödemeler","ph-truck","finance?tab=parties&sub=suppliers","tedarikci borc odeme ekstre cari"],["Finans › Krediler","Kredi taksit planı ve ödemeleri, vade hatırlatma","ph-bank","finance?tab=loans","kredi taksit faiz banka vade hatirlatma"],["Finans › Çek / Senet","Alınan ve verilen çek/senet takibi","ph-note","finance?tab=cheques","cek senet vade tahsil"],["Finans › Hareketler","Tüm finans hareketleri, Excel / PDF","ph-list-checks","finance?tab=ledger","hareket ekstre excel pdf"]].forEach(([i,r,n,o,c])=>s(i,r,n,o,c,"Finans")),a("jobTracking")&&Ss.forEach(([i,r,n,o])=>s(`İş Takip › ${r}`,"İş & Durum Takip",n,`jobs?tab=${i}`,o,"İş Takip")),a("purchase")&&(s("Satın Alma › Tedarikçiler","Tedarikçi kartları","ph-handshake","purchase-module?tab=suppliers","tedarikci firma","Satın Alma"),s("Satın Alma › Siparişler (PO)","Satın alma siparişleri","ph-receipt","purchase-module?tab=orders","po siparis mal kabul","Satın Alma")),a("settings")&&(s("Şifre değiştir","Ayarlar","ph-key","settings","sifre parola guvenlik hesap","Ayarlar"),s("Önbelleği temizle","Ayarlar › Sorun Giderme","ph-broom","settings","cache onbellek yenile guncelle","Ayarlar"),s("Uygulamayı yükle","Ayarlar › Ana ekrana ekle","ph-download-simple","settings","pwa kur telefon ana ekran","Ayarlar"),s("Koyu tema","Görünüm","ph-moon","settings","tema karanlik gece","Ayarlar")),t}function Ls(e,a=8){const t=ga(e).split(/\s+/).filter(Boolean);return t.length?Ts().map(s=>{if(!t.every(n=>s.hay.includes(n)))return null;const i=ga(s.label),r=(i.startsWith(t[0])?0:i.includes(t[0])?1:2)+(s.group==="Modüller"?0:.5);return{it:s,score:r}}).filter(Boolean).sort((s,i)=>s.score-i.score).slice(0,a).map(s=>s.it):[]}const Es=e=>String(e).trim().startsWith("<")?e:`<i class="ph ${h(e)}"></i>`;function mi(e,{host:a=e.parentElement,onPick:t}={}){a.classList.add("has-search-results");const s=document.createElement("div");s.className="search-results",s.hidden=!0,s.setAttribute("role","listbox"),a.appendChild(s);let i=[],r=0;const n=()=>{s.hidden=!0},o=()=>{var l;s.querySelectorAll(".sr-item").forEach((d,m)=>d.classList.toggle("on",m===r)),(l=s.querySelector(".sr-item.on"))==null||l.scrollIntoView({block:"nearest"})},c=l=>{const d=i[l];d&&(n(),e.value="",e.blur(),t==null||t(d),Z.navigate(d.route))},u=()=>{const l=e.value.trim();if(!l)return n();if(i=Ls(l,9),r=0,!i.length){s.innerHTML='<div class="sr-empty"><i class="ph ph-magnifying-glass"></i> Sonuç bulunamadı</div>',s.hidden=!1;return}let d="";s.innerHTML=i.map((m,p)=>{const v=m.group!==d?`<div class="sr-group">${h(m.group)}</div>`:"";return d=m.group,`${v}<button type="button" class="sr-item" role="option" data-i="${p}">
        <span class="sr-ico">${Es(m.icon)}</span>
        <span class="sr-text"><b>${h(m.label)}</b><small>${h(m.hint)}</small></span>
        <i class="ph ph-arrow-elbow-down-left sr-go"></i>
      </button>`}).join(""),s.hidden=!1,o()};e.addEventListener("input",u),e.addEventListener("focus",u),e.addEventListener("keydown",l=>{if(l.key==="Escape"){n(),e.blur();return}s.hidden||!i.length||(l.key==="ArrowDown"?(l.preventDefault(),r=(r+1)%i.length,o()):l.key==="ArrowUp"?(l.preventDefault(),r=(r-1+i.length)%i.length,o()):l.key==="Enter"&&(l.preventDefault(),c(r)))}),s.addEventListener("mousedown",l=>{const d=l.target.closest(".sr-item");d&&(l.preventDefault(),c(Number(d.dataset.i)))}),s.addEventListener("click",l=>{const d=l.target.closest(".sr-item");d&&c(Number(d.dataset.i))}),document.addEventListener("click",l=>{a.contains(l.target)||n()})}const he={items:[],unread:0,seen:null,timer:null,started:!1},As=e=>{const a=Math.max(0,(Date.now()-new Date(e).getTime())/1e3);return a<60?"şimdi":a<3600?`${Math.floor(a/60)} dk önce`:a<86400?`${Math.floor(a/3600)} sa önce`:new Date(e).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})},Ms={job_assigned:"ph-user-plus",job_done:"ph-check-circle"};function hi(){document.querySelectorAll("[data-notif-badge]").forEach(e=>{e.textContent=he.unread>99?"99+":String(he.unread),e.hidden=he.unread===0})}async function et(){if(!(!ge.isLoggedIn()||document.hidden))try{const e=await I.get("/notifications");if(!e.success)return;const a=e.data.items||[],t=a.reduce((i,r)=>Math.max(i,r.id),0);he.seen===null&&(he.seen=t);const s=a.filter(i=>i.id>he.seen&&!i.readAt);he.seen=Math.max(he.seen,t),he.items=a,he.unread=e.data.unread||0,hi(),we&&ya(),s.slice(0,3).forEach(i=>{if(P(`${i.title}`,"info"),"Notification"in window&&Notification.permission==="granted")try{new Notification(i.title,{body:i.body,icon:void 0,tag:"wms-"+i.id})}catch{}})}catch{}}function js(){he.started||(he.started=!0,et(),he.timer=setInterval(et,3e4),document.addEventListener("visibilitychange",()=>{document.hidden||et()}),di(et),window.addEventListener("storage",()=>et()))}function qs(){he.items=[],he.unread=0,he.seen=null,hi()}let we=null;async function za(e){try{await I.post("/notifications/read",e?{id:e}:{})}catch{}await et()}function ya(){if(!we)return;const e="Notification"in window&&Notification.permission==="default";we.querySelector(".np-body").innerHTML=`
    ${e?'<button type="button" class="np-ask" data-act="ask"><i class="ph ph-bell-ringing"></i> Bildirimleri bu cihazda aç</button>':""}
    ${he.items.length?he.items.map(a=>`
      <button type="button" class="np-item ${a.readAt?"":"unread"}" data-id="${a.id}" data-link="${h(a.link||"")}">
        <span class="np-ico"><i class="ph ${Ms[a.type]||"ph-bell"}"></i></span>
        <span class="np-text"><b>${h(a.title)}</b><small>${h(a.body)}</small><em>${h(As(a.createdAt))}</em></span>
      </button>`).join(""):'<div class="np-empty"><i class="ph ph-bell-slash"></i>Henüz bildirim yok</div>'}`,we.querySelector('[data-act="all"]').hidden=he.unread===0}function Ns(){if(we)return yt();we=document.createElement("div"),we.className="np-wrap",we.innerHTML=`
    <div class="np-bg"></div>
    <div class="np-panel" role="dialog" aria-label="Bildirimler">
      <div class="np-head"><b>Bildirimler</b>
        <button type="button" class="np-link" data-act="all">Tümünü okundu yap</button>
        <button type="button" class="np-x" data-act="close" aria-label="Kapat"><i class="ph ph-x"></i></button></div>
      <div class="np-body"></div>
    </div>`,document.body.appendChild(we),ya(),et(),we.addEventListener("click",async e=>{var s;if(e.target.classList.contains("np-bg"))return yt();const a=(s=e.target.closest("[data-act]"))==null?void 0:s.dataset.act;if(a==="close")return yt();if(a==="all")return za();if(a==="ask")return await Notification.requestPermission(),ya();const t=e.target.closest(".np-item");if(t){const i=t.dataset.link;await za(Number(t.dataset.id)),yt(),i&&Z.navigate(i.split("&job=")[0])}}),document.addEventListener("keydown",vi)}const vi=e=>{e.key==="Escape"&&yt()};function yt(){document.removeEventListener("keydown",vi),we==null||we.remove(),we=null}function bi(){const e=Object.entries(F.modules).filter(([t,s])=>s.enabled&&St(t)),a=["settings","help"];return[...e.filter(([t])=>!a.includes(t)),...e.filter(([t])=>a.includes(t))]}function Cs(e){return F.reportTypes.some(a=>a.route===e)?"reports":e}function Ds({compact:e=!1}={}){return`
    <div class="brand ${e?"brand-compact":""}">
      <div class="brand-logo"><img src="${F.logoUrl}" alt="${h(F.companyName)}" /></div>
      <div class="brand-name">${h(F.appName)}</div>
    </div>`}function Is(e,a){const t=document.createElement("div");t.className="shell";const s=Cs(a),i=ge.getUser(),r=bi(),n=u=>{var l;return(l=F.modules[u])==null?void 0:l.enabled},o=[{route:"dashboard",icon:"ph-house",label:"Ana Sayfa"},{route:"operations",icon:"ph-squares-four",label:"İşlemler"},n("copilot")&&{route:"copilot",icon:"ph-sparkle",label:F.modules.copilot.baseLabel||"AI CoPilot"},{action:"notif",icon:"ph-bell",label:"Bildirim",badge:!0},n("settings")&&{route:"settings",icon:"ph-user",label:"Profil"}].filter(Boolean);t.innerHTML=`
    <header class="shell-topbar">
      ${Ds()}
      <label class="topbar-search">
        <i class="ph ph-magnifying-glass"></i>
        <input type="search" placeholder="Modül veya menü ara…" data-action="search" />
      </label>
      <button class="icon-btn notif-btn" data-action="notif" title="Bildirimler" aria-label="Bildirimler"><i class="ph ph-bell"></i><b class="notif-badge" data-notif-badge hidden>0</b></button>
      <button class="icon-btn" data-action="theme" title="Tema"><i class="ph ${document.body.classList.contains("dark-theme")?"ph-sun":"ph-moon"}"></i></button>
    </header>

    <aside class="shell-sidebar">
      <nav class="side-nav">
        <a class="side-link ${s==="dashboard"?"active":""}" data-route="dashboard"><i class="ph ph-house"></i><span>Ana Sayfa</span></a>
        ${r.map(([,u])=>`
        <a class="side-link ${s===u.route?"active":""}" data-route="${u.route}" data-label="${h(u.label.toLocaleLowerCase("tr"))}">
          ${u.icon}<span>${h(u.label)}</span>
        </a>`).join("")}
      </nav>
      <div class="side-user">
        <div class="avatar">${h(ge.getUserInitial())}</div>
        <div class="side-user-name">${h((i==null?void 0:i.name)||"Kullanıcı")}</div>
        <button class="icon-btn" data-action="logout" title="Çıkış"><i class="ph ph-sign-out"></i></button>
      </div>
    </aside>

    <main class="shell-content"></main>

    <nav class="shell-tabbar">
      ${o.map(u=>`
      <a class="tab ${u.route&&s===u.route?"active":""}" ${u.route?`data-route="${u.route}"`:`data-action="${u.action}"`}>
        <i class="ph ${u.route&&s===u.route?"ph-fill":""} ${u.icon}"></i>${u.badge?'<b class="notif-badge" data-notif-badge hidden>0</b>':""}<span>${h(u.label)}</span>
      </a>`).join("")}
    </nav>`;const c=t.querySelector(".shell-content");return typeof e=="string"?c.innerHTML=e:e&&c.appendChild(e),t.addEventListener("click",u=>{var m;const l=u.target.closest("[data-route]");if(l&&!l.closest(".shell-content")){u.preventDefault(),Z.navigate(l.dataset.route);return}const d=(m=u.target.closest("[data-action]"))==null?void 0:m.dataset.action;if(d==="logout"&&(qs(),ge.logout()),d==="notif"&&Ns(),d==="theme"){document.body.classList.toggle("dark-theme");const p=document.body.classList.contains("dark-theme");localStorage.setItem(F.storageKeys.theme,p?"dark":"light"),u.target.closest("button").innerHTML=`<i class="ph ${p?"ph-sun":"ph-moon"}"></i>`}}),mi(t.querySelector('[data-action="search"]'),{host:t.querySelector(".topbar-search")}),js(),t}const Ps=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],Ct=["var(--primary)","#F0A93B","#22A06B","#0EA5E9","#64748B","#A855F7"],at=e=>e==null?"—":Number(e).toLocaleString("tr-TR");function Rs(e){if(!(e!=null&&e.length)||e.every(d=>!d.value))return'<div class="chart-empty">Henüz hareket kaydı yok</div>';const a=560,t=220,s={l:36,b:24,t:8},i=Math.max(...e.map(d=>d.value)),r=Math.pow(10,Math.floor(Math.log10(i||1))),n=Math.max(Math.ceil(i/r)*r,4),o=(a-s.l)/e.length,c=d=>t-s.b-d/n*(t-s.b-s.t),u=[0,.25,.5,.75,1].map(d=>`
    <line x1="${s.l}" x2="${a}" y1="${c(n*d)}" y2="${c(n*d)}" class="grid" />
    <text x="${s.l-6}" y="${c(n*d)+4}" text-anchor="end" class="axis">${at(Math.round(n*d))}</text>`).join(""),l=e.map((d,m)=>{const p=s.l+m*o+o*.2,v=t-s.b-c(d.value),k=Ps[Number(d.month.slice(5,7))-1];return`<rect x="${p}" y="${c(d.value)}" width="${o*.6}" height="${Math.max(v,0)}" rx="3" class="bar"><title>${k}: ${at(d.value)}</title></rect>
      <text x="${p+o*.3}" y="${t-6}" text-anchor="middle" class="axis">${k}</text>`}).join("");return`<svg viewBox="0 0 ${a} ${t}" class="chart-svg" role="img" aria-label="Aylık stok hareketleri">${u}${l}</svg>`}function Bs(e){const a=(e||[]).reduce((o,c)=>o+c.value,0);if(!a)return'<div class="chart-empty">Henüz depo hareketi yok</div>';const t=60,s=2*Math.PI*t;let i=0;const r=e.map((o,c)=>{const u=o.value/a*s,l=`<circle r="${t}" cx="80" cy="80" fill="none" stroke="${Ct[c%Ct.length]}" stroke-width="26"
      stroke-dasharray="${u} ${s-u}" stroke-dashoffset="${-i}" transform="rotate(-90 80 80)"><title>${h(o.name)}: ${at(o.value)}</title></circle>`;return i+=u,l}).join(""),n=e.map((o,c)=>`
    <li><span class="dot" style="background:${Ct[c%Ct.length]}"></span>${h(o.name)}<b>%${Math.round(o.value/a*100)}</b></li>`).join("");return`<div class="donut-wrap"><svg viewBox="0 0 160 160" class="donut">${r}</svg><ul class="legend">${n}</ul></div>`}function Hs(){const e=new Date().getHours();return e<6?"İyi geceler":e<12?"Günaydın":e<18?"İyi günler":"İyi akşamlar"}function zs(){var r;const e=document.createElement("div");e.className="page-dashboard dash";const a=bi().filter(([n])=>!["settings","help","copilot"].includes(n)),t=F.modules.copilot,[s,...i]=F.appName.split(" ");return e.innerHTML=`
    <div class="dash-mhead">
      <div class="brand">
        <div class="brand-logo"><img src="${F.logoUrl}" alt="${h(F.companyName)}" /></div>
        <div class="brand-name">${h(s)}${i.length?`<br>${h(i.join(" "))}`:""}</div>
      </div>
      <button class="bell" id="bell-btn" title="Kritik stoklar"><i class="ph ph-bell"></i><span class="bell-badge" hidden></span></button>
    </div>
    <div class="bell-pop" id="bell-pop" hidden></div>

    <section class="dash-overview">
      <h2 class="dash-h">Genel Bakış</h2>
      <div class="dash-hero">
        <div><h2>${Hs()}, ${h((((r=ge.getUser())==null?void 0:r.name)||"Kullanıcı").split(" ")[0])}</h2><p>${h(F.companyName)} ${h(F.terms.depotOf)} bugünkü durumu</p></div>
        <span class="dash-hero-chip"><i class="ph ph-calendar-blank"></i>${new Date().toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})}</span>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Toplam Stok</div><span class="kpi-ico"><i class="ph ph-package"></i></span></div><div class="kpi-value" data-kpi="totalStock">—</div><div class="kpi-sub" data-kpi-sub="productCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü ${h(F.terms.sale)}</div><span class="kpi-ico"><i class="ph ${h(F.terms.saleIcon)}"></i></span></div><div class="kpi-value" data-kpi="todaySales">—</div><div class="kpi-sub" data-kpi-sub="salesCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü Transfer</div><span class="kpi-ico"><i class="ph ph-arrows-left-right"></i></span></div><div class="kpi-value" data-kpi="todayTransfers">—</div><div class="kpi-sub">${h(F.terms.warehouses)}</div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Kritik Stok</div><span class="kpi-ico"><i class="ph ph-warning"></i></span></div><div class="kpi-value" data-kpi="lowStockCount">—</div><div class="kpi-sub warn">10 adet ve altı</div></div>
      </div>
      <div class="charts">
        <div class="panel"><h3>Stok Hareketleri</h3><div id="bar-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
        <div class="panel"><h3>Depo Dağılımı</h3><div id="donut-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
      </div>
      <h2 class="dash-h">Hızlı İşlemler</h2>
    </section>

    <div class="tiles">
      ${a.map(([n,o])=>`
        <a class="tile" data-route="${o.route}" id="mod-${n}">
          <span class="tile-icon">${o.icon}</span>
          <span class="tile-label">${h(o.label)}</span>
        </a>`).join("")}
    </div>

    ${t!=null&&t.enabled?`
    <a class="copilot-banner" data-route="${t.route}">
      <span class="cb-icon">${t.icon}</span>
      <span class="cb-text"><b>${h(t.label)}</b><small>Depo verilerinizle konuşun</small></span>
      <i class="ph ph-caret-right"></i>
    </a>`:""}
  `,e.addEventListener("click",n=>{const o=n.target.closest("[data-route]");if(o)return Z.navigate(o.dataset.route);if(n.target.closest("#bell-btn")){const c=e.querySelector("#bell-pop");c.hidden=!c.hidden}}),Ks(e),e}async function Ks(e){var u,l,d,m;let a=null;try{const p=await I.get("/dashboard/stats");a=(p==null?void 0:p.data)||null}catch(p){console.warn("Panel istatistikleri alınamadı:",p.message)}e.querySelectorAll("[data-kpi]").forEach(p=>{p.textContent=at(a==null?void 0:a[p.dataset.kpi])});const t={productCount:p=>`${at(p)} ürün çeşidi`,salesCount:p=>`toplam ${at(p)} ${F.terms.sales}`};e.querySelectorAll("[data-kpi-sub]").forEach(p=>{const v=a==null?void 0:a[p.dataset.kpiSub];p.textContent=v==null?"":t[p.dataset.kpiSub](v)}),e.querySelector("#bar-chart").innerHTML=a?Rs(a.monthly):'<div class="chart-empty">Veri alınamadı</div>',e.querySelector("#donut-chart").innerHTML=a?Bs(a.warehouseDist):'<div class="chart-empty">Veri alınamadı</div>';const s=(a==null?void 0:a.lowStock)||[];let i=[];if((u=F.modules.jobTracking)!=null&&u.enabled)try{const p=(l=await I.get("/jt/alerts"))==null?void 0:l.data;i=((p==null?void 0:p.alerts)||[]).filter(v=>v.severity!=="info").slice(0,5),i.total=(((d=p==null?void 0:p.counts)==null?void 0:d.critical)||0)+(((m=p==null?void 0:p.counts)==null?void 0:m.warning)||0)}catch{}const r=e.querySelector(".bell-badge"),n=localStorage.getItem(F.storageKeys.notify)!=="off";n||(e.querySelector("#bell-btn").title="Bildirimler kapalı (Ayarlar'dan açabilirsiniz)");const o=((a==null?void 0:a.lowStockCount)||0)+(i.total||0);n&&o&&(r.hidden=!1,r.textContent=o>9?"9+":o);const c=i.length?`<h4>İş takip uyarıları</h4><ul>${i.map(p=>`<li><span>${h(p.title)}</span></li>`).join("")}</ul><a class="bell-link" data-route="${F.modules.jobTracking.route}">Tümünü gör</a>`:"";e.querySelector("#bell-pop").innerHTML=n?c||s.length?`${c}${s.length?`<h4>Kritik stoklar</h4><ul>${s.map(p=>`<li><span>${h(p.name)}</span><b>${at(p.stock)} ${h(p.unit||"")}</b></li>`).join("")}</ul>`:""}`:"<h4>Bildirim yok</h4><p>Kritik seviyede ürün bulunmuyor.</p>":"<h4>Bildirimler kapalı</h4><p>Ayarlar sayfasından açabilirsiniz.</p>"}function ue({title:e,gradientClass:a="gradient-primary",showBack:t=!0,actions:s=[]}){const i=document.createElement("header");i.className=`app-header ${a}`;let r="";return s.length>0&&(r=`<div class="header-actions">
      ${s.map((n,o)=>`<button class="header-action-btn" id="header-action-${o}" title="${n.title||""}">${n.icon}</button>`).join("")}
    </div>`),i.innerHTML=`
    <div class="app-header-inner">
      ${t?'<button class="header-back" id="header-back-btn"><i class="ph ph-arrow-left"></i></button>':"<div></div>"}
      <h1 class="header-title">${e}</h1>
      ${r||"<div></div>"}
    </div>
  `,setTimeout(()=>{const n=i.querySelector("#header-back-btn");n&&n.addEventListener("click",()=>Z.back()),s.forEach((o,c)=>{const u=i.querySelector(`#header-action-${c}`);u&&o.onClick&&u.addEventListener("click",o.onClick)})},0),i}let bt=null;function pt(e,a){if(bt){try{bt()}catch{}bt=null}const t=document.getElementById("modal-container");if(!t)return console.error("modal-container bulunamadı"),()=>{};t.classList.add("active"),t.innerHTML=`
    <div class="scanner-backdrop" id="scanner-backdrop" style="
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.85); z-index:9998;
    "></div>
    <div class="scanner-modal" style="
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      width:92%; max-width:420px; z-index:9999;
      border-radius:16px; overflow:hidden; background:#000;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    ">
      <div class="scanner-header" style="
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 16px; background:linear-gradient(135deg,#4ECDC4,#2196F3);
        color:white;
      ">
        <span style="font-weight:700; font-size:15px;"><i class="ph ph-camera" style="vertical-align:-2px; margin-right:6px;"></i>Barkod Tarayıcı</span>
        <button id="scanner-close-btn" style="
          background:rgba(255,255,255,0.2); border:none; color:white;
          width:32px; height:32px; border-radius:50%; cursor:pointer;
          font-size:18px; display:flex; align-items:center; justify-content:center;
        "><i class="ph ph-x"></i></button>
      </div>

      <div class="scanner-video-container" style="
        position:relative; width:100%; aspect-ratio:4/3; background:#111;
        display:flex; align-items:center; justify-content:center;
      ">
        <video id="scanner-video" autoplay playsinline muted style="
          width:100%; height:100%; object-fit:cover;
        "></video>
        
        <!-- Scan overlay -->
        <div style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:260px; height:140px;
          border:3px solid rgba(78,205,196,0.9);
          border-radius:12px;
          box-shadow: 0 0 0 3000px rgba(0,0,0,0.45);
          z-index:2;
        "></div>
        
        <!-- Scan line animation -->
        <div id="scanner-line" style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:240px; height:2px;
          background:linear-gradient(90deg, transparent, #ff4444, #ff4444, transparent);
          box-shadow: 0 0 8px rgba(255,68,68,0.6);
          z-index:3;
          animation: scanLine 2s ease-in-out infinite;
        "></div>
        
        <!-- Loading indicator -->
        <div id="scanner-loading" style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          color:white; font-size:14px; text-align:center; z-index:4;
        ">
          <div style="width:30px;height:30px;border:3px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 8px;"></div>
          Kamera açılıyor...
        </div>
      </div>

      <div style="padding:14px 16px; background:#fff;">
        <div style="text-align:center; margin-bottom:12px;">
          <span style="font-size:13px; color:#666; font-weight:500;">Barkodu çerçeveye hizalayın veya manuel girin</span>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="scanner-manual-input" placeholder="Barkod numarası..." style="
            flex:1; padding:11px 14px; border:1.5px solid #E5E7EB;
            border-radius:10px; font-size:15px; font-family:inherit;
            outline:none; transition: border-color 0.2s;
          " />
          <button id="scanner-manual-btn" style="
            padding:11px 18px; background:linear-gradient(135deg,#4ECDC4,#2196F3);
            color:#fff; border:none; border-radius:10px; font-weight:700;
            font-size:14px; cursor:pointer; white-space:nowrap;
          ">Ekle</button>
        </div>
      </div>
    </div>

    <style>
      @keyframes scanLine {
        0%, 100% { transform: translate(-50%, calc(-50% - 40px)); }
        50% { transform: translate(-50%, calc(-50% + 40px)); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;let s=null,i=null,r=!1;function n(){if(r)return;if(r=!0,bt=null,i){try{i.stop()}catch{}i=null}const c=document.getElementById("scanner-video");c&&c.srcObject&&(c.srcObject.getTracks().forEach(u=>u.stop()),c.srcObject=null),t.classList.remove("active"),t.innerHTML=""}bt=n,setTimeout(()=>{var d,m;(d=document.getElementById("scanner-close-btn"))==null||d.addEventListener("click",n),(m=document.getElementById("scanner-backdrop"))==null||m.addEventListener("click",n);const c=document.getElementById("scanner-manual-input"),u=document.getElementById("scanner-manual-btn");function l(){var v;const p=(v=c==null?void 0:c.value)==null?void 0:v.trim();p&&(n(),e(p))}u==null||u.addEventListener("click",l),c==null||c.addEventListener("keydown",p=>{p.key==="Enter"&&l()}),c==null||c.addEventListener("focus",()=>{c.style.borderColor="#4ECDC4"}),c==null||c.addEventListener("blur",()=>{c.style.borderColor="#E5E7EB"}),o()},50);async function o(){const c=document.getElementById("scanner-video"),u=document.getElementById("scanner-loading");if(!c)return;let l;try{l=await Ge(()=>import("./index-qJOHp8th.js"),[],import.meta.url)}catch{u&&(u.innerHTML='<i class="ph ph-warning"></i> Barkod okuyucu yüklenemedi.<br>Manuel barkod girişi kullanın.');return}try{s=new l.BrowserMultiFormatReader;const d=(m,p)=>{if(!r&&m){const v=m.getText();v&&v.length>0&&(navigator.vibrate&&navigator.vibrate(100),n(),e(v))}};try{i=await s.decodeFromConstraints({audio:!1,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}},c,d)}catch(m){console.warn("Rear camera failed, trying any camera:",m.message);try{i=await s.decodeFromConstraints({audio:!1,video:!0},c,d)}catch(p){console.error("All cameras failed:",p.message),u&&(u.innerHTML='<i class="ph ph-warning"></i> Kamera açılamadı.<br>Manuel barkod girişi kullanın.');return}}u&&(u.style.display="none")}catch(d){console.error("ZXing init error:",d),u&&(u.innerHTML='<i class="ph ph-warning"></i> Tarayıcı başlatılamadı.<br>Manuel giriş kullanın.')}}return n}function mt(e,a){if(!e)return{flush:()=>!1};e.setAttribute("enterkeyhint","done"),e.setAttribute("autocomplete","off"),e.setAttribute("autocapitalize","off"),e.setAttribute("spellcheck","false");const t=()=>{const i=e.value.trim();return i?(e.value="",a(i),!0):!1};e.addEventListener("keydown",i=>{(i.key==="Enter"||i.keyCode===13)&&(i.preventDefault(),t())}),e.addEventListener("change",t);const s=e.closest(".barcode-input-row, .search-input-row");if(s&&!s.querySelector(".barcode-add-btn")){const i=document.createElement("button");i.type="button",i.className="barcode-add-btn",i.setAttribute("aria-label","Barkodu ekle"),i.innerHTML='<i class="ph ph-plus"></i>',i.addEventListener("mousedown",r=>r.preventDefault()),i.addEventListener("click",()=>{t()||e.focus()}),s.insertBefore(i,s.querySelector(".camera-btn")||null)}return{flush:t}}function Os(){const e=document.createElement("div");e.className="page-transfer page-container",ge.getUser();const a=ue({title:Lt("transfer","Depolar Arası Transfer"),gradientClass:"gradient-transfer"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <!-- Özet: okutulan barkod ve son okunan -->
    <div class="scan-summary animate-fade-in-up">
      <div class="scan-count">
        <span class="n" id="barcode-count">0</span>
        <span class="l">okutulan barkod</span>
      </div>
      <div class="scan-last">
        <small>Son okunan</small>
        <b id="last-barcode">—</b>
      </div>
    </div>

    <div class="transfer-form">
      <!-- Transfer yönü -->
      <div class="card animate-fade-in-up stagger-1">
        <div class="transfer-section-title"><i class="ph ph-arrows-left-right"></i> Transfer Yönü</div>

        <div class="route-row">
          <div class="input-group">
            <label>Nereden (kaynak depo)</label>
            <div class="select-field">
              <span class="select-icon"><i class="ph ph-warehouse"></i></span>
              <select id="source-warehouse"><option value="">Depo Seçin</option></select>
              <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
            </div>
          </div>

          <span class="route-arrow" aria-hidden="true"><i class="ph ph-arrow-right"></i></span>

          <div class="input-group">
            <label>Nereye (hedef şube)</label>
            <div class="select-field">
              <span class="select-icon"><i class="ph ph-buildings"></i></span>
              <select id="target-branch"><option value="">Şube Seçin</option></select>
              <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
            </div>
          </div>
        </div>

        <div class="input-group" style="margin-top: 12px;">
          <label>Hedef depo</label>
          <div class="select-field">
            <span class="select-icon"><i class="ph ph-warehouse"></i></span>
            <select id="target-warehouse"><option value="">Depo Seçin</option></select>
            <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
          </div>
        </div>
      </div>

      <!-- Barkod -->
      <div class="barcode-section animate-fade-in-up stagger-2">
        <h3 class="barcode-title"><i class="ph ph-barcode"></i> Barkod Okutma</h3>
        <div class="barcode-input-row">
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-barcode"></i></span>
            <input type="text" id="barcode-input" placeholder="Barkodu okutun veya yazıp Enter'a basın" autocomplete="off" />
          </div>
          <button class="camera-btn" id="camera-btn" title="Kamera ile oku"><i class="ph ph-camera"></i></button>
        </div>

        <label class="scan-toggle" for="cancel-barcode">
          <input type="checkbox" id="cancel-barcode" />
          <span><b>İptal modu</b><small>Okutulan barkod listeden çıkarılır</small></span>
        </label>
      </div>

      <!-- Okutulanlar -->
      <div id="scanned-list" class="scan-list animate-fade-in-up stagger-3"></div>

      <button class="btn btn-primary btn-block btn-lg animate-fade-in-up stagger-4" id="submit-transfer">
        <i class="ph ph-cloud-arrow-up"></i> Transferi Gönder
      </button>
    </div>
  `,e.appendChild(t);let s=[],i=0;return setTimeout(async()=>{var c,u;try{const l=await I.get("/branches");if(l.success){const m=e.querySelector("#target-branch");l.data.forEach(p=>{const v=document.createElement("option");v.value=p.id,v.textContent=`${p.code} - ${p.name}`,m.appendChild(v)})}const d=await I.get("/warehouses");if(d.success){const m=e.querySelector("#target-warehouse"),p=e.querySelector("#source-warehouse");m.addEventListener("change",()=>{const v=d.data.find(w=>w.id===m.value),k=e.querySelector("#target-branch");v!=null&&v.branchId&&k&&(k.value=v.branchId)}),d.data.forEach(v=>{const k=document.createElement("option");k.value=v.id,k.textContent=`${v.code} - ${v.name}`,m.appendChild(k);const w=document.createElement("option");w.value=v.id,w.textContent=`${v.code} - ${v.name}`,p.appendChild(w)})}}catch{}const r=e.querySelector("#barcode-input");r&&mt(r,n),(c=e.querySelector("#camera-btn"))==null||c.addEventListener("click",()=>{pt(l=>{n(l)})}),(u=e.querySelector("#submit-transfer"))==null||u.addEventListener("click",async()=>{var p,v,k,w,L;if(s.length===0){P("Lütfen en az bir barkod okutun","warning");return}const l=(p=e.querySelector("#source-warehouse"))==null?void 0:p.value,d=(v=e.querySelector("#target-warehouse"))==null?void 0:v.value;if(!l||!d){P("Lütfen kaynak ve hedef depoyu seçin","warning");return}if(l===d){P("Kaynak ve hedef depo aynı olamaz","warning");return}const m=e.querySelector("#submit-transfer");m.disabled=!0,m.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';try{const b=await I.post("/transfers",{targetBranch:(k=e.querySelector("#target-branch"))==null?void 0:k.value,targetWarehouse:(w=e.querySelector("#target-warehouse"))==null?void 0:w.value,sourceWarehouse:(L=e.querySelector("#source-warehouse"))==null?void 0:L.value,barcodes:s});b.success?(P(b.message||"Transfer tamamlandı!","success"),s=[],i=0,o()):P(b.message||"Hata oluştu","error")}catch(b){P(b.message,"error")}m.disabled=!1,m.innerHTML='<i class="ph ph-cloud-arrow-up"></i> Transferi Gönder'});function n(l){var m;((m=e.querySelector("#cancel-barcode"))==null?void 0:m.checked)?(s=s.filter(p=>p!==l),P(`Barkod iptal edildi: ${l}`,"warning")):(s.push(l),P(`Barkod eklendi: ${l}`,"success")),i=s.length,o(),e.querySelector("#last-barcode").textContent=l}function o(){e.querySelector("#barcode-count").textContent=i;const l=e.querySelector("#scanned-list");l.innerHTML=s.length?'<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>'+s.map((d,m)=>`
            <div class="scan-item">
              <span class="scan-no">${m+1}</span>
              <span class="scan-code">${h(d)}</span>
              <button type="button" class="scan-rm" data-code="${h(d)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join(""):'<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>'}e.querySelector("#scanned-list").addEventListener("click",async l=>{const d=l.target.closest("[data-code]");if(d){s=s.filter(m=>m!==d.dataset.code),i=s.length,o();return}if(l.target.closest("#clear-scans")){const{confirmDialog:m}=await Ge(async()=>{const{confirmDialog:p}=await Promise.resolve().then(()=>fi);return{confirmDialog:p}},void 0,import.meta.url);if(!await m({title:"Liste temizlensin mi?",message:`${s.length} okutulmuş barkod silinecek.`,confirmLabel:"Temizle",danger:!0}))return;s=[],i=0,o(),e.querySelector("#last-barcode").textContent="—"}}),o()},0),e}function Fs(){const e=document.createElement("div");e.className="page-vehicle-unload page-container";const a=ue({title:Lt("vehicleUnload","Araba'dan Boşaltma"),gradientClass:"gradient-serial"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="scan-summary animate-fade-in-up">
      <div class="scan-count">
        <span class="n" id="vu-barcode-count">0</span>
        <span class="l">okutulan barkod</span>
      </div>
      <div class="scan-last">
        <small>Araç / irsaliye</small>
        <b id="vu-vehicle-label">—</b>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 16px;">
      <div class="transfer-section-title"><i class="ph ph-truck"></i> Boşaltma Bilgileri</div>

      <div class="input-group" style="margin-top: 12px;">
        <label>Hangi depoya boşaltılıyor</label>
        <div class="select-field">
          <span class="select-icon"><i class="ph ph-warehouse"></i></span>
          <select id="vu-warehouse"><option value="">Depo Seçin</option></select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 12px;">
        <label>Araç plakası / irsaliye no</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-identification-card"></i></span>
          <input type="text" id="vu-vehicle-info" placeholder="Örn. 16 ABC 123 veya İRS-2026-0042" autocomplete="off" />
        </div>
      </div>
    </div>

    <div class="barcode-section animate-fade-in-up stagger-2">
      <h3 class="barcode-title"><i class="ph ph-barcode"></i> Barkod Okutma</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="vu-barcode-input" placeholder="Barkodu okutun veya yazıp Enter'a basın" autocomplete="off" />
        </div>
        <button class="camera-btn" id="vu-camera-btn" title="Kamera ile oku"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <div id="vu-scanned-list" class="scan-list animate-fade-in-up stagger-3"></div>

    <button class="btn btn-primary btn-block btn-lg animate-fade-in-up stagger-4" id="vu-submit" style="margin-top: 20px;">
      <i class="ph ph-cloud-arrow-up"></i> Depoya Kaydet
    </button>
  `,e.appendChild(t);let s=[];return setTimeout(async()=>{var c,u;const i=e.querySelector("#vu-vehicle-info"),r=e.querySelector("#vu-vehicle-label");i.addEventListener("input",()=>{r.textContent=i.value.trim()||"—"});try{const l=await I.get("/warehouses");if(l.success){const d=e.querySelector("#vu-warehouse");l.data.forEach(m=>{const p=document.createElement("option");p.value=m.id,p.textContent=`${m.code} - ${m.name}`,d.appendChild(p)})}}catch{}const n=e.querySelector("#vu-barcode-input");mt(n,l=>{s.push(l),P(`Barkod eklendi: ${l}`,"success"),o()}),(c=e.querySelector("#vu-camera-btn"))==null||c.addEventListener("click",()=>{pt(l=>{s.push(l),P(`Barkod eklendi: ${l}`,"success"),o()})}),(u=e.querySelector("#vu-submit"))==null||u.addEventListener("click",async()=>{var d,m,p;if(s.length===0){P("Lütfen en az bir barkod okutun","warning");return}if(!((d=e.querySelector("#vu-warehouse"))!=null&&d.value)){P("Lütfen depoyu seçin","warning");return}const l=e.querySelector("#vu-submit");l.disabled=!0,l.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';try{const v=await I.post("/vehicle-unload",{warehouseId:(m=e.querySelector("#vu-warehouse"))==null?void 0:m.value,vehicleInfo:(p=e.querySelector("#vu-vehicle-info"))==null?void 0:p.value,barcodes:s});v.success?(P(v.message,"success"),s=[],o()):P(v.message||"Hata oluştu","error")}catch(v){P("Gönderim hatası: "+v.message,"error")}l.disabled=!1,l.innerHTML='<i class="ph ph-cloud-arrow-up"></i> Depoya Kaydet'}),e.querySelector("#vu-scanned-list").addEventListener("click",async l=>{const d=l.target.closest("[data-code]");if(d){s=s.filter(m=>m!==d.dataset.code),o();return}if(l.target.closest("#vu-clear-scans")){const{confirmDialog:m}=await Ge(async()=>{const{confirmDialog:p}=await Promise.resolve().then(()=>fi);return{confirmDialog:p}},void 0,import.meta.url);if(!await m({title:"Liste temizlensin mi?",message:`${s.length} okutulmuş barkod silinecek.`,confirmLabel:"Temizle",danger:!0}))return;s=[],o()}}),o();function o(){e.querySelector("#vu-barcode-count").textContent=s.length;const l=e.querySelector("#vu-scanned-list");l.innerHTML=s.length?'<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="vu-clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>'+s.map((d,m)=>`
            <div class="scan-item">
              <span class="scan-no">${m+1}</span>
              <span class="scan-code">${h(d)}</span>
              <button type="button" class="scan-rm" data-code="${h(d)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join(""):'<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>'}},0),e}const na=e=>Number(e||0).toLocaleString("tr-TR",{maximumFractionDigits:2})+" ₺",Ka={toptan:{intro:"Büyük hacimli, vadeli satışlar. Birden fazla ürünü tek seferde ekleyin.",customerLabel:"Alıcı firma",warehouseLabel:"Çıkış deposu",submit:"Toptan satışı tamamla",submitIcon:"ph-truck",scan:!1,link:!0,qtyHint:"Koli / palet adedi",fields:[{id:"docNo",label:"İrsaliye / Fatura no",icon:"ph-file-text",placeholder:"Örn: IRS-2026-0142"},{id:"terms",label:"Vade",type:"select",icon:"ph-calendar-check",options:["Peşin","15 gün","30 gün","45 gün","60 gün","90 gün"],value:"30 gün"}]},perakende:{intro:"Hızlı satış: barkodu okutun, ürün sepete girsin. Aynı barkod tekrar okutulunca adet artar.",customerLabel:"Müşteri",warehouseLabel:"Satış deposu",submit:"Satışı tamamla",submitIcon:"ph-shopping-bag",scan:!0,scanFirst:!0,link:!1,qtyHint:"Adet",fields:[{id:"payment",label:"Ödeme yöntemi",type:"chips",options:["Nakit","Kredi kartı","Havale / EFT"],value:"Nakit",required:!0}]},ihracat:{intro:"Yurt dışı sevkiyatı: hedef ülke, teslim şekli ve konteyner bilgisini girin.",customerLabel:"Yurt dışı alıcı",warehouseLabel:"Çıkış deposu",submit:"İhracat satışını tamamla",submitIcon:"ph-airplane-tilt",scan:!1,link:!0,qtyHint:"Adet",fields:[{id:"country",label:"Hedef ülke",icon:"ph-globe-hemisphere-west",placeholder:"Örn: Almanya",required:!0},{id:"incoterm",label:"Teslim şekli (Incoterm)",type:"select",icon:"ph-handshake",options:["EXW","FCA","FOB","CIF","CFR","DAP","DDP"],value:"FOB"},{id:"container",label:"Konteyner / Plaka no",icon:"ph-truck-trailer",placeholder:"İsteğe bağlı"}]},b2b:{intro:"İşletmeler arası satış: karşı işletme, sipariş numarası ve teslim tarihi ile kayıt.",customerLabel:"Karşı işletme",warehouseLabel:"Çıkış deposu",submit:"B2B satışını tamamla",submitIcon:"ph-briefcase",scan:!1,link:!0,qtyHint:"Adet",fields:[{id:"po",label:"Sipariş (PO) no",icon:"ph-hash",placeholder:"Karşı tarafın sipariş numarası"},{id:"due",label:"Teslim tarihi",type:"date",icon:"ph-calendar-blank"}]},iade:{intro:"Müşteriden dönen ürünü stoğa geri alın. Tutar müşterinin bakiyesinden düşülür.",customerLabel:"İade eden müşteri",warehouseLabel:"İade giriş deposu",submit:"İadeyi kabul et",submitIcon:"ph-arrow-u-down-left",scan:!0,link:!1,isReturn:!0,qtyHint:"İade adedi",fields:[{id:"reason",label:"İade nedeni",type:"select",icon:"ph-chat-teardrop-text",options:["Hasarlı ürün","Yanlış ürün gönderildi","Son kullanma tarihi","Fazla / mükerrer sipariş","Kalite şikayeti","Diğer"],required:!0},{id:"condition",label:"Ürün durumu",type:"chips",options:["Sağlam","Hasarlı"],value:"Sağlam"},{id:"docNo",label:"İade irsaliye no",icon:"ph-file-text",placeholder:"İsteğe bağlı"}]},sevkiyat:{intro:"Gemi talebine göre ambardan malzeme çıkışı. Barkod okutabilir veya listeden ekleyebilirsiniz.",customerLabel:"Sevk edilen gemi",warehouseLabel:"Çıkış ambarı",submit:"Sevkiyatı tamamla",submitIcon:"ph-boat",scan:!0,link:!1,noPrice:!0,customerFilter:e=>/^GM/.test(String(e.id)),qtyHint:"Miktar",doneText:"Sevkiyat tamamlandı",fields:[{id:"req",label:"Gemi talep no",icon:"ph-clipboard-text",placeholder:"Örn: RQ-FRC-2026-041"},{id:"port",label:"Teslim limanı",type:"select",icon:"ph-anchor",options:["Tuzla","Aliağa","Dilovası","Yarımca","Ambarlı","Mersin","Yurt dışı liman (acente)"],value:"Tuzla",required:!0},{id:"delivery",label:"Teslim şekli",type:"chips",options:["Rıhtımda teslim","Lançla teslim","Acente üzerinden"],value:"Rıhtımda teslim"}]}},Oa={intro:"Satış bilgilerini girin.",customerLabel:"Müşteri",warehouseLabel:"Çıkış deposu",submit:"Satışı tamamla",submitIcon:"ph-check-circle",scan:!0,link:!0,qtyHint:"Adet",fields:[]},_s=(e,a)=>`color-mix(in srgb, ${e}, #000 ${Math.abs(a)}%)`;function Us(){var u;const e=document.createElement("div");e.className="page-sales page-container";const a=((u=F.modules.sales)==null?void 0:u.label)||"Satış İşlemleri",t=ue({title:a,gradientClass:"gradient-sales"});e.appendChild(t);const s=document.createElement("div");s.className="content-area",e.appendChild(s);const i=F.salesTypes;function r(){var l;t.style.background="",(l=t.querySelector(".app-header-title, h1, .header-title"))==null||l.replaceChildren(a)}const n=()=>{r(),s.innerHTML=`
      <div class="section-title animate-fade-in-up"><h2>Satış türü seçin</h2></div>
      <div class="sales-type-list">
        ${i.map((l,d)=>{const m=Ka[l.id]||Oa;return`
          <div class="menu-card sx-type animate-fade-in-up stagger-${Math.min(d+1,5)}" data-type="${h(l.id)}" style="--sx:${h(l.color)}" tabindex="0" role="button">
            <div class="menu-icon" style="background:${h(l.color)}1a;color:${h(l.color)};">${l.icon}</div>
            <div class="menu-content">
              <div class="menu-title">${h(l.label)} <span class="badge" style="background:${h(l.color)}1f;color:${h(l.color)};font-size:10px;">${h(l.badge)}</span></div>
              <div class="menu-desc">${h(m.intro)}</div>
            </div>
            <div class="menu-arrow" style="background:${h(l.color)}12;color:${h(l.color)};"><i class="ph ph-caret-right"></i></div>
          </div>`}).join("")}
      </div>`,s.querySelectorAll(".sx-type").forEach(l=>{const d=()=>o(i.find(m=>m.id===l.dataset.type));l.addEventListener("click",d),l.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),d())})})},o=async l=>{var ie,R,U,W,ee,te;const d=Ka[l.id]||Oa,m=l.color||"var(--primary)";t.style.background=`linear-gradient(135deg, ${m}, ${_s(m,-28)})`,(ie=t.querySelector(".app-header-title, h1, .header-title"))==null||ie.replaceChildren(l.label),s.innerHTML='<div style="display:flex;justify-content:center;padding:48px;"><div class="loading-spinner"></div></div>';let p=[],v=[],k=[],w=[],L=[];try{const[K,G,C]=await Promise.all([I.getCustomers(),I.getWarehouses(),I.getProducts()]);p=K.success?K.data:[],d.customerFilter&&(p=p.filter(d.customerFilter)),v=G.success?G.data:[],k=C.success?C.data:[];try{const g=await I.get("/warehouse-balances");w=g.success?g.data:[]}catch{}if(d.link&&((R=F.modules.jobTracking)!=null&&R.enabled))try{L=((await I.get("/jt/orders")).data||[]).filter($=>!["shipped","cancelled"].includes($.state)).flatMap($=>$.lines.filter(f=>f.remaining>0).map(f=>({orderId:$.id,lineId:f.id,productId:f.productId,customerId:$.customerId,label:`${$.orderNo} · ${f.productName} (kalan ${f.remaining})`,remaining:f.remaining})))}catch{}}catch(K){s.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${h(K.message||"Veri yüklenemedi. Sunucu bağlantısını kontrol edin.")}</div></div>`;return}let b=[];const E={};(d.fields||[]).forEach(K=>{E[K.id]=K.value||""});const y=K=>k.find(G=>G.id===K),T=()=>s.querySelector("#sx-wh").value,M=K=>{var C,g;const G=T();return G&&w.length?((C=w.find($=>$.productId===K&&$.warehouseId===G))==null?void 0:C.qty)||0:((g=y(K))==null?void 0:g.stock)||0},N=K=>b.filter(G=>G.productId===K).reduce((G,C)=>G+C.qty,0),q=()=>d.isReturn?k:k.filter(K=>M(K.id)-N(K.id)>0),S=K=>{const G=K.required?'<span class="sx-req">*</span>':"";if(K.type==="chips")return`<div class="sx-field"><label>${h(K.label)} ${G}</label>
          <div class="sx-chips" data-f="${K.id}">${K.options.map(g=>`<button type="button" class="sx-chip ${g===K.value?"on":""}" data-v="${h(g)}">${h(g)}</button>`).join("")}</div></div>`;const C=K.type==="select"?`<select class="input-element" data-f="${K.id}">${K.required?'<option value="">Seçiniz...</option>':""}${K.options.map(g=>`<option ${g===K.value?"selected":""}>${h(g)}</option>`).join("")}</select>`:`<input class="input-element" data-f="${K.id}" type="${K.type==="date"?"date":"text"}" placeholder="${h(K.placeholder||"")}" maxlength="80" />`;return`<div class="sx-field"><label>${h(K.label)} ${G}</label><div class="input-field"><span class="input-icon"><i class="ph ${K.icon||"ph-note"}"></i></span>${C}</div></div>`};s.innerHTML=`
      <div class="sx-banner animate-fade-in-down" style="--sx:${h(m)}">
        <button type="button" class="sx-back" id="sx-back" aria-label="Geri"><i class="ph ph-arrow-left"></i></button>
        <div class="sx-banner-icon">${l.icon}</div>
        <div class="sx-banner-text"><b>${h(l.label)}</b><span>${h(d.intro)}</span></div>
      </div>

      <div class="card sx-card animate-fade-in-up" style="--sx:${h(m)}">
        <div class="sx-step"><i class="ph ph-users"></i> ${h(d.customerLabel)} ve depo</div>
        <div class="sx-grid">
          <div class="sx-field"><label>${h(d.customerLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-users"></i></span>
              <select id="sx-customer" class="input-element"><option value="">Seçiniz...</option>${p.map(K=>`<option value="${h(K.id)}">${h(K.name)}</option>`).join("")}</select></div></div>
          <div class="sx-field"><label>${h(d.warehouseLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="sx-wh" class="input-element"><option value="">Seçiniz...</option>${v.map(K=>`<option value="${h(K.id)}">${h(K.name)}</option>`).join("")}</select></div></div>
        </div>
        ${(d.fields||[]).length?`<div class="sx-grid">${d.fields.map(S).join("")}</div>`:""}
      </div>

      <div class="card sx-card animate-fade-in-up stagger-1" style="--sx:${h(m)}">
        <div class="sx-step"><i class="ph ph-package"></i> ${d.scanFirst?"Ürünleri okutun":"Ürün ekle"}</div>
        ${d.scan?`
        <div class="barcode-input-row">
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span>
            <input type="text" id="sx-scan" placeholder="Barkod veya ürün kodu" /></div>
          <button type="button" class="camera-btn" id="sx-camera" aria-label="Kamera ile okut"><i class="ph ph-camera"></i></button>
        </div>`:""}
        ${d.scanFirst?"":`
        ${L.length?`<div class="sx-field"><label>Sipariş kalemi <span class="sx-opt">(isteğe bağlı — giden miktara işlenir)</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-kanban"></i></span><select id="sx-order" class="input-element"><option value="">Siparişe bağlama</option></select></div></div>`:""}
        <div class="sx-add">
          <div class="input-field sx-add-prod"><span class="input-icon"><i class="ph ph-package"></i></span>
            <select id="sx-product" class="input-element"></select></div>
          <div class="input-field sx-add-qty"><span class="input-icon"><i class="ph ph-hash"></i></span>
            <input type="number" id="sx-qty" min="1" step="1" inputmode="numeric" placeholder="${h(d.qtyHint)}" /></div>
          <button type="button" class="btn sx-add-btn" id="sx-add"><i class="ph ph-plus"></i> Ekle</button>
        </div>`}
        <div class="sx-hint" id="sx-hint"></div>
        <div id="sx-lines"></div>
      </div>

      <div class="sx-total animate-fade-in-up stagger-2" id="sx-total" style="--sx:${h(m)}"></div>
      <button type="button" id="sx-submit" class="btn btn-block btn-lg sx-submit" style="--sx:${h(m)}">
        <i class="ph ${d.submitIcon}"></i> ${h(d.submit)}
      </button>`;const D=K=>s.querySelector(K);function B(){const K=D("#sx-product");if(!K)return;const G=K.value,C=q();K.innerHTML=`<option value="">${C.length?d.noPrice?"Malzeme seçin...":"Ürün seçin...":d.isReturn?"Ürün yok":`Bu ${d.noPrice?"ambarda sevk edilebilir malzeme":"depoda satılabilir ürün"} yok`}</option>`+C.map($=>`<option value="${h($.id)}">${h($.name)}${d.isReturn?"":` — ${M($.id)-N($.id)} ${h($.unit||"")}`}</option>`).join(""),C.some($=>$.id===G)&&(K.value=G);const g=D("#sx-hint");!d.isReturn&&T()&&!C.length&&!b.length?(g.innerHTML='<i class="ph ph-info"></i> Seçili depoda stok yok. Başka bir depo seçin veya Stok Detay › Stok Yönetimi’nden stok ekleyin.',g.classList.add("show")):!d.isReturn&&!T()?(g.innerHTML='<i class="ph ph-info"></i> Önce depoyu seçin; yalnızca o depoda stoku olan ürünler listelenir.',g.classList.add("show")):(g.classList.remove("show"),g.textContent="")}function z(){var g;const K=D("#sx-order");if(!K)return;const G=(g=D("#sx-product"))==null?void 0:g.value,C=L.filter($=>!G||$.productId===G);K.innerHTML='<option value="">Siparişe bağlama</option>'+C.map($=>`<option value="${h($.orderId)}|${h($.lineId)}">${h($.label)}</option>`).join("")}function _(){const K=D("#sx-lines");K.innerHTML=b.length?b.map((g,$)=>{const f=y(g.productId),x=d.isReturn?1/0:M(g.productId);return`
        <div class="sx-line" data-i="${$}">
          <div class="sx-line-info">
            <div class="sx-line-name">${h((f==null?void 0:f.name)||g.productId)}</div>
            <div class="sx-line-sub">${d.noPrice?`${h((f==null?void 0:f.code)||"")} · ${g.qty} ${h((f==null?void 0:f.unit)||"")}`:`${na(f==null?void 0:f.price)} × ${g.qty}`}${g.orderId?' · <i class="ph ph-kanban"></i> siparişe bağlı':""}</div>
          </div>
          <div class="sx-stepper">
            <button type="button" data-act="dec" aria-label="Azalt"><i class="ph ph-minus"></i></button>
            <input type="number" min="1" value="${g.qty}" data-role="qty" inputmode="numeric" aria-label="Adet" />
            <button type="button" data-act="inc" aria-label="Artır" ${g.qty>=x?"disabled":""}><i class="ph ph-plus"></i></button>
          </div>
          ${d.noPrice?"":`<div class="sx-line-amt">${na(((f==null?void 0:f.price)||0)*g.qty)}</div>`}
          <button type="button" class="sx-rm" data-act="rm" aria-label="Kaldır"><i class="ph ph-x"></i></button>
        </div>`}).join(""):`<div class="sx-empty"><i class="ph ph-shopping-cart-simple"></i> ${d.isReturn?"İade edilecek ürün eklenmedi":d.noPrice?"Sevk listesi boş":"Sepet boş"}</div>`;const G=b.reduce((g,$)=>g+$.qty,0),C=b.reduce((g,$)=>{var f;return g+(((f=y($.productId))==null?void 0:f.price)||0)*$.qty},0);D("#sx-total").innerHTML=`
        <div><span>Kalem</span><b>${b.length}</b></div>
        <div><span>Toplam adet</span><b>${G}</b></div>
        ${d.noPrice?"":`<div class="sx-total-amt"><span>${d.isReturn?"Bakiyeden düşülecek":"Genel toplam"}</span><b>${na(C)}</b></div>`}`,B()}function V(K,G,C){const g=y(K);if(!g)return P("Ürün bulunamadı","error");if(G=Math.floor(Number(G)),!(G>0))return P("Geçerli bir adet girin","warning");if(!d.isReturn){if(!T())return P("Önce depoyu seçin","warning");const x=M(K)-N(K);if(G>x)return P(`"${g.name}" için bu depoda en fazla ${Math.max(0,x)} adet eklenebilir`,"warning")}const $=C?`${K}|${C.lineId}`:K,f=b.find(x=>(x.key||x.productId)===$);f?f.qty+=G:b.push({key:$,productId:K,qty:G,...C||{}}),_()}D("#sx-back").addEventListener("click",()=>i.length>1?n():Z.back()),D("#sx-wh").addEventListener("change",()=>{d.isReturn||(b=b.filter(K=>M(K.productId)>0).map(K=>({...K,qty:Math.min(K.qty,M(K.productId))}))),_()}),s.querySelectorAll(".sx-chips").forEach(K=>K.addEventListener("click",G=>{const C=G.target.closest(".sx-chip");C&&(K.querySelectorAll(".sx-chip").forEach(g=>g.classList.toggle("on",g===C)),E[K.dataset.f]=C.dataset.v)})),s.querySelectorAll("select[data-f], input[data-f]").forEach(K=>K.addEventListener("input",()=>{E[K.dataset.f]=K.value}));const Q=D("#sx-add");if(Q==null||Q.addEventListener("click",()=>{var g;const K=D("#sx-product").value;if(!K)return P("Ürün seçin","warning");const[G,C]=(((g=D("#sx-order"))==null?void 0:g.value)||"").split("|");V(K,D("#sx-qty").value||1,G?{orderId:G,lineId:C}:null),D("#sx-qty").value="",D("#sx-product").value="",z()}),(U=D("#sx-qty"))==null||U.addEventListener("keydown",K=>{K.key==="Enter"&&(K.preventDefault(),Q.click())}),(W=D("#sx-product"))==null||W.addEventListener("change",z),(ee=D("#sx-order"))==null||ee.addEventListener("change",()=>{const K=L.find(G=>`${G.orderId}|${G.lineId}`===D("#sx-order").value);K&&(q().some(G=>G.id===K.productId)&&(D("#sx-product").value=K.productId),D("#sx-customer").value=K.customerId||D("#sx-customer").value,D("#sx-qty").value||(D("#sx-qty").value=K.remaining))}),d.scan){const K=C=>k.find(g=>g.barcode===C||String(g.code||"").toLowerCase()===C.toLowerCase()),G=C=>{const g=K(C);if(!g)return P(`"${C}" kodlu ürün bulunamadı`,"error");V(g.id,1)};mt(D("#sx-scan"),G),(te=D("#sx-camera"))==null||te.addEventListener("click",()=>pt(G))}D("#sx-lines").addEventListener("click",K=>{const G=K.target.closest("[data-act]");if(!G)return;const C=Number(G.closest(".sx-line").dataset.i),g=b[C];g&&(G.dataset.act==="rm"?b.splice(C,1):G.dataset.act==="inc"?(d.isReturn||g.qty<M(g.productId))&&g.qty++:G.dataset.act==="dec"&&(g.qty--,g.qty<1&&b.splice(C,1)),_())}),D("#sx-lines").addEventListener("change",K=>{const G=K.target.closest('[data-role="qty"]');if(!G)return;const C=b[Number(G.closest(".sx-line").dataset.i)];let g=Math.floor(Number(G.value));if(g>0||(g=1),!d.isReturn){const $=M(C.productId);g>$&&(P(`Bu depoda en fazla ${$} adet var`,"warning"),g=$)}C.qty=g,_()}),D("#sx-submit").addEventListener("click",async()=>{var O;const K=D("#sx-submit"),G=D("#sx-customer").value,C=T();if(!G)return P(`${d.customerLabel} seçin`,"warning");if(!C)return P(`${d.warehouseLabel} seçin`,"warning");if(!b.length)return P("En az bir ürün ekleyin","warning");const g=(d.fields||[]).find(H=>H.required&&!String(E[H.id]||"").trim());if(g)return P(`${g.label} zorunludur`,"warning");const $=(d.fields||[]).filter(H=>String(E[H.id]||"").trim()).map(H=>`${H.label}: ${String(E[H.id]).trim()}`).join(" · "),f=K.innerHTML;K.disabled=!0,K.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';const x=[];let A=0;try{for(const H of[...b])try{const j=await I.makeSale(G,C,H.productId,H.qty,l.id,H.orderId,H.lineId,$);if(!j.success)throw new Error(j.message||"Hata oluştu");b=b.filter(J=>J!==H),A++}catch(j){x.push(`${((O=y(H.productId))==null?void 0:O.name)||H.productId}: ${j.message}`)}}finally{K.disabled=!1,K.innerHTML=f}if(!x.length)P(d.isReturn?`İade kabul edildi (${A} kalem). Stok geri eklendi.`:`${d.doneText||"Satış tamamlandı"} (${A} kalem).`,"success"),o(l);else{P(x[0],"error");try{const[H,j]=await Promise.all([I.getProducts(),I.get("/warehouse-balances")]);H.success&&(k=H.data),j.success&&(w=j.data)}catch{}_(),A&&P(`${A} kalem kaydedildi, ${x.length} kalem kaydedilemedi.`,"warning")}}),_(),z()},c=i.find(l=>l.id===Z.getQueryParams().type);return c?o(c):i.length===1?o(i[0]):n(),e}const Gs=["Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj","Genel"],Ys=["Adet","Kova","Kutu","Şişe","Bidon","Paket","Kg","Litre"];function Vs(){const e=document.createElement("div");e.className="page-purchase page-container";const a=ue({title:"Alış İşlemleri",gradientClass:"gradient-transfer"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="transfer-info-card animate-fade-in-down" style="margin-bottom: 20px;">
      <div class="info-icon"><i class="ph ph-shopping-cart"></i></div>
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">Mal Kabul İşlemi</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Tedarikçiden gelen malları kayıt altına alın.</div>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1" style="margin-top: 16px;">
      <div class="transfer-section-title"><i class="ph ph-clipboard-text"></i> Alış Bilgileri</div>
      <div class="input-group" style="margin-top: 12px;">
        <label>İrsaliye No</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-file-text"></i></span>
          <input type="text" id="pu-invoice" placeholder="İrsaliye numarası (opsiyonel)" />
        </div>
      </div>
    </div>

    <div class="barcode-section animate-fade-in-up stagger-2" style="margin-top: 16px;">
      <h3 class="barcode-title">Ürün Barkod Okutma</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="pu-barcode-input" placeholder="Barkod giriniz..." />
        </div>
        <button class="camera-btn" id="pu-camera-btn"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <!-- Yeni ürün formu (gizli, gerektiğinde gösterilir) -->
    <div id="pu-new-product-form" style="display:none; margin-top:16px;"></div>

    <div id="pu-items-list" style="margin-top: 16px;"></div>

    <button class="btn btn-warning btn-block btn-lg animate-fade-in-up stagger-3" id="pu-submit" style="margin-top: 20px;">
      <i class="ph ph-floppy-disk"></i> Alış Kaydını Tamamla
    </button>
  `,e.appendChild(t);let s=[];return setTimeout(async()=>{var d,m;const i=e.querySelector("#pu-barcode-input"),r=e.querySelector("#pu-new-product-form");let n=[];try{const p=await I.get("/products");p.success&&(n=p.data)}catch{}function o(p){const v=n.find(k=>k.barcode===p);v?c(p,v.name,v):u(p),i.value=""}function c(p,v,k){var w,L;r.style.display="block",r.innerHTML=`
        <div class="card" style="padding:16px; border-left: 4px solid var(--success);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--success);">
            <i class="ph ph-check-circle"></i> Ürün Bulundu: ${v}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Mevcut Stok: ${k.stock} ${h(k.unit)} | Kategori: ${h(k.category)}
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <input type="number" class="input-element" value="1" min="1" id="pu-qty-input" style="flex:1;" placeholder="Miktar" />
            <button class="btn btn-primary" id="pu-qty-add" style="flex:1;">
              <i class="ph ph-plus"></i> Listeye Ekle
            </button>
          </div>
        </div>
      `,(w=e.querySelector("#pu-qty-add"))==null||w.addEventListener("click",()=>{const b=parseInt(e.querySelector("#pu-qty-input").value);if(!b||b<=0)return P("Geçerli miktar girin","warning");s.push({code:p,name:v,qty:b,category:k.category,unit:k.unit,isNew:!1}),P(`${v} x${b} eklendi`,"success"),r.style.display="none",l()}),(L=e.querySelector("#pu-qty-input"))==null||L.focus()}function u(p){var v,k;r.style.display="block",r.innerHTML=`
        <div class="card" style="padding:16px; border-left: 4px solid var(--warning);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--warning);">
            <i class="ph ph-warning-circle"></i> Yeni Ürün: ${p}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Bu barkod sistemde kayıtlı değil. Ürün bilgilerini girin.
          </div>
          <div class="form-group" style="margin-bottom:10px;">
            <label style="font-size:13px; font-weight:600;">Ürün Adı *</label>
            <input type="text" class="input-element" placeholder="Örn: Çikolata Sosu 5kg" id="pu-new-name" />
          </div>
          <div style="display:flex; gap:10px; margin-bottom:10px;">
            <div style="flex:1;">
              <label style="font-size:13px; font-weight:600;">Kategori</label>
              <select class="input-element" id="pu-new-category">
                ${Gs.map(w=>`<option value="${w}">${w}</option>`).join("")}
              </select>
            </div>
            <div style="flex:1;">
              <label style="font-size:13px; font-weight:600;">Birim</label>
              <select class="input-element" id="pu-new-unit">
                ${Ys.map(w=>`<option value="${w}">${w}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-size:13px; font-weight:600;">Miktar</label>
            <input type="number" class="input-element" value="1" min="1" id="pu-new-qty" />
          </div>
          <button class="btn btn-primary btn-block" id="pu-new-add">
            <i class="ph ph-plus-circle"></i> Listeye Ekle
          </button>
        </div>
      `,(v=e.querySelector("#pu-new-add"))==null||v.addEventListener("click",()=>{const w=e.querySelector("#pu-new-name").value.trim(),L=e.querySelector("#pu-new-category").value,b=e.querySelector("#pu-new-unit").value,E=parseInt(e.querySelector("#pu-new-qty").value);if(!w)return P("Ürün adı zorunludur","warning");if(!E||E<=0)return P("Geçerli miktar girin","warning");s.push({code:p,name:w,qty:E,category:L,unit:b,isNew:!0}),P(`${w} x${E} eklendi (Yeni Ürün)`,"success"),r.style.display="none",l()}),(k=e.querySelector("#pu-new-name"))==null||k.focus()}mt(i,o),(d=e.querySelector("#pu-camera-btn"))==null||d.addEventListener("click",()=>{pt(p=>{o(p)})}),(m=e.querySelector("#pu-submit"))==null||m.addEventListener("click",async()=>{if(s.length===0){P("Lütfen en az bir ürün ekleyin","warning");return}const p=e.querySelector("#pu-submit");p.disabled=!0,p.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';try{let v=0;for(const w of s)(await I.post("/purchase",{barcode:w.code,name:w.name,quantity:w.qty,category:w.category,unit:w.unit,warehouseId:null})).success&&v++;P(`${v}/${s.length} ürün başarıyla stoğa eklendi!`,"success"),s=[],l();const k=await I.get("/products");k.success&&(n=k.data)}catch(v){P("Kayıt sırasında hata: "+v.message,"error")}finally{p.disabled=!1,p.innerHTML='<i class="ph ph-floppy-disk"></i> Alış Kaydını Tamamla'}});function l(){var v;const p=e.querySelector("#pu-items-list");if(s.length===0){p.innerHTML="";return}p.innerHTML=`
        <div style="font-weight:600; font-size:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span><i class="ph ph-list-bullets"></i> Eklenen Ürünler (${s.length})</span>
          <button id="pu-clear-all" style="font-size:12px; color:var(--error); background:none; border:none; cursor:pointer; font-weight:600;">Temizle</button>
        </div>
      `+s.map((k,w)=>`
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${w*40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: ${k.isNew?"rgba(255,152,0,0.1)":"rgba(76,175,80,0.1)"}; color: ${k.isNew?"#FF9800":"#4CAF50"};">
            <i class="ph ph-${k.isNew?"plus-circle":"package"}"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${h(k.name)}</div>
            <div class="list-subtitle">${h(k.code)} · ${k.qty} ${h(k.unit)} · ${h(k.category)}</div>
          </div>
          <button class="remove-item-btn" data-idx="${w}" style="background:none; border:none; color:var(--error); cursor:pointer; font-size:18px; padding:4px;">
            <i class="ph ph-x-circle"></i>
          </button>
        </div>
      `).join(""),p.querySelectorAll(".remove-item-btn").forEach(k=>{k.addEventListener("click",()=>{const w=parseInt(k.dataset.idx);s.splice(w,1),l()})}),(v=p.querySelector("#pu-clear-all"))==null||v.addEventListener("click",()=>{s=[],l()})}},0),e}const be=e=>String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]);let ra=0;function At({title:e,message:a="",body:t="",icon:s="",tone:i="",actions:r,wide:n=!1,onMount:o=null}){return new Promise(c=>{const u=document.activeElement,l=document.createElement("div");l.className="app-dialog-wrap",l.innerHTML=`
      <div class="app-dialog-bg"></div>
      <div class="app-dialog ${i}${n?" wide":""}" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        ${s?`<span class="app-dialog-icon"><i class="ph ${be(s)}"></i></span>`:""}
        <h3 id="dlg-title">${be(e)}</h3>
        ${a?`<p>${be(a)}</p>`:""}
        ${t}
        <div class="app-dialog-actions">
          ${r.map((p,v)=>`<button type="button" class="btn ${p.cls||"btn-secondary"}" data-i="${v}">${p.icon?`<i class="ph ${be(p.icon)}"></i> `:""}${be(p.label)}</button>`).join("")}
        </div>
      </div>`,document.body.appendChild(l),document.body.classList.add("jt-lock"),ra++;const d=p=>{l.isConnected&&(l.classList.add("closing"),setTimeout(()=>{l.remove(),--ra<=0&&(ra=0,document.body.classList.remove("jt-lock")),u&&u.focus&&u.focus()},180),document.removeEventListener("keydown",m,!0),c(p))};function m(p){var v;if(l.isConnected&&(p.key==="Escape"&&(p.preventDefault(),d(((v=r.find(k=>k.cancel))==null?void 0:v.value)??null)),p.key==="Tab")){const k=[...l.querySelectorAll("button, input, select, textarea")].filter(b=>!b.disabled);if(!k.length)return;const w=k[0],L=k[k.length-1];p.shiftKey&&document.activeElement===w?(p.preventDefault(),L.focus()):!p.shiftKey&&document.activeElement===L&&(p.preventDefault(),w.focus())}}document.addEventListener("keydown",m,!0),l.querySelector(".app-dialog-bg").addEventListener("click",()=>{var p;return d(((p=r.find(v=>v.cancel))==null?void 0:p.value)??null)}),l.querySelectorAll("[data-i]").forEach(p=>p.addEventListener("click",()=>{const v=r[Number(p.dataset.i)];if(v.onBefore){const k=v.onBefore(l);if(k===!1)return;d(k===void 0?v.value:k);return}d(v.value)})),o&&o(l),setTimeout(()=>{var p;return(p=l.querySelector("input, textarea, select")||l.querySelector(".btn-primary, .btn-danger")||l.querySelector("button"))==null?void 0:p.focus()},60)})}function qa({title:e,message:a="",options:t,icon:s="ph-download-simple",cancelLabel:i="Vazgeç"}){return At({title:e,message:a,icon:s,actions:[{label:i,cls:"btn-secondary",value:null,cancel:!0},...t.map((r,n)=>({label:r.label,icon:r.icon,cls:n===0?"btn-primary":"btn-secondary",value:r.value}))]})}function Le({title:e,message:a="",confirmLabel:t="Evet",cancelLabel:s="Vazgeç",danger:i=!1,icon:r}){return At({title:e,message:a,icon:r||(i?"ph-warning":"ph-question"),tone:i?"danger":"",actions:[{label:s,cls:"btn-secondary",value:!1,cancel:!0},{label:t,cls:i?"btn-danger":"btn-primary",value:!0}]})}function Na({title:e,message:a="",label:t="",value:s="",placeholder:i="",multiline:r=!1,required:n=!1,confirmLabel:o="Kaydet",maxlength:c=300}){const u=r?`<textarea id="dlg-input" rows="3" maxlength="${c}" placeholder="${be(i)}">${be(s)}</textarea>`:`<input id="dlg-input" type="text" maxlength="${c}" value="${be(s)}" placeholder="${be(i)}" />`;return At({title:e,message:a,icon:"ph-pencil-simple",body:`<label class="app-dialog-field">${t?`<span>${be(t)}</span>`:""}${u}<em class="app-dialog-err" hidden>Bu alan boş bırakılamaz.</em></label>`,actions:[{label:"Vazgeç",cls:"btn-secondary",value:null,cancel:!0},{label:o,cls:"btn-primary",onBefore:l=>{const d=l.querySelector("#dlg-input").value.trim();return n&&!d?(l.querySelector(".app-dialog-err").hidden=!1,l.querySelector("#dlg-input").focus(),!1):d}}]})}function He({title:e,message:a="",fields:t,confirmLabel:s="Kaydet",icon:i="ph-pencil-simple",validate:r,onMount:n,wide:o=!1,footerHtml:c=""}){const u=d=>{const m=`df-${d.name}`;if(d.type==="select")return`<select id="${m}">${(d.options||[]).map(([v,k])=>`<option value="${be(v)}" ${String(d.value??"")===String(v)?"selected":""}>${be(k)}</option>`).join("")}</select>`;if(d.type==="textarea")return`<textarea id="${m}" rows="2" maxlength="${d.maxlength||300}" placeholder="${be(d.placeholder||"")}">${be(d.value??"")}</textarea>`;const p=d.type==="number"?"number":d.type==="date"?"date":d.type==="password"?"password":"text";return`<input id="${m}" type="${p}" ${p==="number"?`inputmode="decimal" step="${d.step||"any"}" min="${d.min??""}"`:""} maxlength="${d.maxlength||120}" value="${be(d.value??"")}" placeholder="${be(d.placeholder||"")}" autocomplete="off" />`},l=`<div class="app-form">${t.map(d=>`<label class="app-dialog-field ${d.half?"half":""}"><span>${be(d.label)}${d.required?" *":""}${d.hint?` <small>${be(d.hint)}</small>`:""}</span>${u(d)}</label>`).join("")}</div>${c}<em class="app-dialog-err" id="df-err" hidden></em>`;return At({title:e,message:a,icon:i,wide:o,onMount:n,body:l,actions:[{label:"Vazgeç",cls:"btn-secondary",value:null,cancel:!0},{label:s,cls:"btn-primary",onBefore:d=>{const m={},p=d.querySelector("#df-err");for(const k of t){const w=d.querySelector(`#df-${k.name}`).value.trim();if(k.required&&!w)return p.textContent=`${k.label} boş bırakılamaz.`,p.hidden=!1,d.querySelector(`#df-${k.name}`).focus(),!1;m[k.name]=k.type==="number"&&w!==""?Number(String(w).replace(",",".")):w}const v=r&&r(m);return v?(p.textContent=v,p.hidden=!1,!1):m}}]})}function ka({title:e,html:a,okLabel:t="Kapat",icon:s="ph-list-bullets",extra:i=[]}){return At({title:e,icon:s,wide:!0,body:a,actions:[...i,{label:t,cls:"btn-primary",value:!0,cancel:!0}]})}const fi=Object.freeze(Object.defineProperty({__proto__:null,choiceDialog:qa,confirmDialog:Le,formDialog:He,htmlDialog:ka,promptDialog:Na},Symbol.toStringTag,{value:"Module"})),Qe={draft:{label:"Taslak",color:"#9E9E9E",bg:"#9E9E9E18",icon:"ph-pencil-simple"},pending:{label:"Onay Bekliyor",color:"#FF9800",bg:"#FF980018",icon:"ph-clock"},approved:{label:"Onaylandı",color:"#2196F3",bg:"#2196F318",icon:"ph-check-circle"},ordered:{label:"Sipariş Verildi",color:"#9C27B0",bg:"#9C27B018",icon:"ph-package"},partial:{label:"Kısmi Teslim",color:"#FF5722",bg:"#FF572218",icon:"ph-arrows-split"},received:{label:"Teslim Alındı",color:"#4CAF50",bg:"#4CAF5018",icon:"ph-check-fat"},cancelled:{label:"İptal",color:"#F44336",bg:"#F4433618",icon:"ph-x-circle"}};function je(e,a="TRY"){return e==null?"-":new Intl.NumberFormat("tr-TR",{style:"currency",currency:a,maximumFractionDigits:0}).format(e)}function dt(e){if(!e)return"-";const[a,t,s]=e.split("-");return`${s}.${t}.${a}`}function Qs(){const e=document.createElement("div");e.className="page-purchase-module page-container";const a=ue({title:Lt("purchase","Satın Alma"),gradientClass:"gradient-purchase"});e.appendChild(a);const t=document.createElement("div");return t.className="content-area",t.innerHTML='<div class="loading-spinner" style="margin-top:40px;"></div>',e.appendChild(t),setTimeout(()=>Js(e,t),0),e}async function Js(e,a){a.innerHTML=`
    <div class="pm-tabs">
      <button class="pm-tab active" data-tab="orders"><i class="ph ph-list-numbers"></i> Siparişler</button>
      <button class="pm-tab" data-tab="suppliers"><i class="ph ph-buildings"></i> Tedarikçiler</button>
      <button class="pm-tab" data-tab="summary"><i class="ph ph-chart-bar"></i> Özet</button>
    </div>
    <div id="pm-panel"></div>
  `;const t=a.querySelector("#pm-panel");a.querySelectorAll(".pm-tab").forEach(r=>{r.addEventListener("click",()=>{a.querySelectorAll(".pm-tab").forEach(o=>o.classList.remove("active")),r.classList.add("active");const n=r.dataset.tab;n==="orders"?Fa(t):n==="suppliers"?en(t):n==="summary"&&sn(t)})});const s=Z.getQueryParams().tab,i=s&&a.querySelector(`.pm-tab[data-tab="${s}"]`);i?i.click():Fa(t)}async function Fa(e){e.innerHTML='<div class="loading-spinner" style="margin-top:32px;"></div>';try{let i=function(){var n;const r=s?t.filter(o=>o.status===s):t;e.innerHTML=`
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:14px; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" id="pm-new-order" style="margin-left:auto;">
            <i class="ph ph-plus"></i> Yeni Sipariş
          </button>
        </div>

        <!-- Filtre bar -->
        <div class="pm-filter-bar">
          ${["","draft","pending","approved","ordered","partial","received","cancelled"].map(o=>{const c=o?Qe[o]:null,u=o?t.filter(l=>l.status===o).length:t.length;return`<button class="pm-filter-btn ${s===o?"active":""}" data-status="${o}">
              ${c?`<i class="ph ${c.icon}" style="color:${c.color};"></i> `:'<i class="ph ph-funnel"></i> '}
              <span>${c?c.label:"Tümü"}</span>
              <span class="pm-filter-count">${u}</span>
            </button>`}).join("")}
        </div>

        <!-- Liste -->
        ${r.length===0?`
          <div class="pm-empty">
            <i class="ph ph-package" style="font-size:48px; color:var(--text-secondary); opacity:.4;"></i>
            <p style="color:var(--text-secondary); margin-top:12px;">Sipariş bulunamadı</p>
          </div>
        `:r.map((o,c)=>{var m;const u=Qe[o.status]||Qe.draft,l=o.totalGross||0,d=gi(o);return`
          <div class="pm-order-card animate-fade-in-up stagger-${Math.min(c+1,5)}" data-id="${o.id}">
            <div class="pm-order-header">
              <div>
                <div class="pm-order-id">${o.id}</div>
                <div class="pm-order-supplier">${h(o.supplierName)}</div>
              </div>
              <span class="pm-status-badge" style="background:${u.bg}; color:${u.color};">
                <i class="ph ${u.icon}"></i> ${u.label}
              </span>
            </div>
            <div class="pm-order-meta">
              <span><i class="ph ph-calendar"></i> ${dt(o.orderDate)}</span>
              <span><i class="ph ph-truck"></i> ${dt(o.expectedDate)}</span>
              <span><i class="ph ph-package"></i> ${((m=o.lines)==null?void 0:m.length)||0} kalem</span>
              <span style="font-weight:700; color:var(--text-primary);">${je(l,o.currency)}</span>
            </div>
            ${d<100&&d>0?`
            <div class="pm-progress-bar">
              <div class="pm-progress-fill" style="width:${d}%; background:${u.color};"></div>
            </div>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">Teslim: %${d}</div>
            `:""}
          </div>`}).join("")}
      `,e.querySelectorAll(".pm-filter-btn").forEach(o=>{o.addEventListener("click",()=>{s=o.dataset.status,i()})}),e.querySelectorAll(".pm-order-card").forEach(o=>{o.addEventListener("click",()=>{Kt(e,o.dataset.id,()=>i())})}),(n=e.querySelector("#pm-new-order"))==null||n.addEventListener("click",()=>{Zs(e,()=>{I.get("/purchase-orders").then(o=>{o.success&&(t.length=0,o.data.forEach(c=>t.push(c)),i())})})})};const a=await I.get("/purchase-orders"),t=a.success?a.data:[];let s="";i()}catch(a){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${a.message}</div>`}}function gi(e){if(!e.lines||e.lines.length===0)return 0;const a=e.lines.reduce((s,i)=>s+(i.qty||0),0),t=e.lines.reduce((s,i)=>s+(i.receivedQty||0),0);return a>0?Math.round(t/a*100):0}async function Kt(e,a,t){var s,i,r,n,o,c;e.innerHTML='<div class="loading-spinner" style="margin-top:32px;"></div>';try{const u=await I.get(`/purchase-orders/${a}`);if(!u.success)throw new Error(u.message);const l=u.data,d=Qe[l.status]||Qe.draft,m=["draft","pending"].includes(l.status),p=["approved","ordered","partial"].includes(l.status)||((s=F.purchaseConfig)==null?void 0:s.requireApproval)===!1&&["draft","pending"].includes(l.status),v=!["received","cancelled"].includes(l.status),k=l.status==="draft",w=gi(l);e.innerHTML=`
      <button class="btn btn-outline btn-sm" id="pm-back" style="margin-bottom:14px;">
        <i class="ph ph-arrow-left"></i> Geri
      </button>

      <!-- Başlık -->
      <div class="pm-detail-header">
        <div>
          <h2 style="margin:0; font-size:18px;">${l.id}</h2>
          <div style="color:var(--text-secondary); font-size:13px; margin-top:2px;">${h(l.supplierName)}</div>
        </div>
        <span class="pm-status-badge" style="background:${d.bg}; color:${d.color}; font-size:13px; padding:6px 14px;">
          <i class="ph ${d.icon}"></i> ${d.label}
        </span>
      </div>

      <!-- Meta bilgiler -->
      <div class="pm-detail-meta">
        <div class="pm-meta-item"><i class="ph ph-calendar"></i><span>Sipariş Tarihi</span><b>${dt(l.orderDate)}</b></div>
        <div class="pm-meta-item"><i class="ph ph-truck"></i><span>Beklenen Teslim</span><b>${dt(l.expectedDate)}</b></div>
        <div class="pm-meta-item"><i class="ph ph-warehouse"></i><span>Depo</span><b>${l.warehouseName||"-"}</b></div>
        <div class="pm-meta-item"><i class="ph ph-currency-circle-dollar"></i><span>Para Birimi</span><b>${h(l.currency)}</b></div>
        ${l.invoiceNo?`<div class="pm-meta-item"><i class="ph ph-file-text"></i><span>Fatura/İrsaliye</span><b>${h(l.invoiceNo)}</b></div>`:""}
        ${l.approvedBy?`<div class="pm-meta-item"><i class="ph ph-user-check"></i><span>Onaylayan</span><b>${l.approvedBy} • ${dt(l.approvedAt)}</b></div>`:""}
        ${l.notes?`<div class="pm-meta-item" style="grid-column:1/-1;"><i class="ph ph-note"></i><span>Not</span><b>${h(l.notes)}</b></div>`:""}
      </div>

      <!-- İlerleme -->
      ${w>0?`
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
          <span>Teslim İlerlemesi</span>
          <b>%${w}</b>
        </div>
        <div class="pm-progress-bar pm-progress-bar-lg">
          <div class="pm-progress-fill" style="width:${w}%; background:${d.color};"></div>
        </div>
      </div>
      `:""}

      <!-- Kalem Listesi -->
      <div class="card" style="margin-bottom:16px; overflow:hidden;">
        <div style="padding:14px 16px; border-bottom:1px solid var(--border); font-weight:600; font-size:14px;">
          <i class="ph ph-list-bullets"></i> Sipariş Kalemleri
        </div>
        <div style="overflow-x:auto;">
          <table class="pm-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th class="right">Miktar</th>
                <th class="right">Teslim</th>
                <th class="right">B. Fiyat</th>
                <th class="right">İsk.</th>
                <th class="right">KDV</th>
                <th class="right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${l.lines.map(L=>{const b=Ws(L),E=b*((L.taxRate||0)/100),y=L.receivedQty>=L.qty;return`
                <tr>
                  <td>
                    <div style="font-weight:600; font-size:13px;">${h(L.productName)}</div>
                    <div style="font-size:11px; color:var(--text-secondary);">${h(L.productCode)}</div>
                  </td>
                  <td class="right">${L.qty} ${h(L.unit)}</td>
                  <td class="right">
                    <span style="color:${y?"#4CAF50":"#FF9800"}; font-weight:600;">
                      ${L.receivedQty||0} ${h(L.unit)}
                    </span>
                  </td>
                  <td class="right">${je(L.unitPrice,l.currency)}</td>
                  <td class="right">%${L.discount||0}</td>
                  <td class="right">%${L.taxRate||0}</td>
                  <td class="right" style="font-weight:700;">${je(b+E,l.currency)}</td>
                </tr>`}).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align:right; padding:10px 16px; font-weight:600;">Ara Toplam</td>
                <td class="right" style="font-weight:600;">${je(l.totalNet,l.currency)}</td>
              </tr>
              <tr>
                <td colspan="6" style="text-align:right; padding:6px 16px; color:var(--text-secondary);">KDV</td>
                <td class="right" style="color:var(--text-secondary);">${je(l.totalTax,l.currency)}</td>
              </tr>
              <tr style="background:var(--bg-elevated, #f8f9fa);">
                <td colspan="6" style="text-align:right; padding:12px 16px; font-weight:700; font-size:16px;">Genel Toplam</td>
                <td class="right" style="font-weight:700; font-size:16px; color:var(--primary);">${je(l.totalGross,l.currency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Aksiyon Butonları -->
      <div class="pm-action-row">
        ${k?'<button class="btn btn-outline" id="pm-edit-order"><i class="ph ph-pencil"></i> Düzenle</button>':""}
        ${m?'<button class="btn btn-primary" id="pm-approve-order"><i class="ph ph-check"></i> Onayla</button>':""}
        ${p?'<button class="btn btn-success" id="pm-receive-order"><i class="ph ph-package"></i> Mal Kabul</button>':""}
        ${v?'<button class="btn btn-danger" id="pm-cancel-order"><i class="ph ph-x"></i> İptal Et</button>':""}
      </div>

      <!-- Mal Kabul Formu (gizli) -->
      <div id="pm-receive-form" style="display:none; margin-top:16px;"></div>
    `,(i=e.querySelector("#pm-back"))==null||i.addEventListener("click",t),(r=e.querySelector("#pm-approve-order"))==null||r.addEventListener("click",async()=>{const L=e.querySelector("#pm-approve-order");L.disabled=!0,L.innerHTML='<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>';const b=ge.getUser(),E=await I.post(`/purchase-orders/${a}/approve`,{approvedBy:(b==null?void 0:b.name)||"Kullanıcı"}).catch(y=>({success:!1,message:y.message}));E.success?(P(E.message,"success"),Kt(e,a,t)):(P(E.message,"error"),L.disabled=!1,L.innerHTML='<i class="ph ph-check"></i> Onayla')}),(n=e.querySelector("#pm-cancel-order"))==null||n.addEventListener("click",async()=>{if(!await Le({title:"Sipariş iptal edilsin mi?",message:"İptal edilen sipariş için mal kabul yapılamaz.",confirmLabel:"Siparişi iptal et",danger:!0}))return;const L=await I.post(`/purchase-orders/${a}/cancel`,{reason:"Kullanıcı tarafından iptal edildi"}).catch(b=>({success:!1,message:b.message}));L.success?(P(L.message,"success"),Kt(e,a,t)):P(L.message,"error")}),(o=e.querySelector("#pm-receive-order"))==null||o.addEventListener("click",()=>{const L=e.querySelector("#pm-receive-form");L.style.display="block",Xs(L,l,()=>Kt(e,a,t)),L.scrollIntoView({behavior:"smooth",block:"start"})})}catch(u){e.innerHTML=`
      <button class="btn btn-outline btn-sm" id="pm-back-err" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Geri</button>
      <div style="color:var(--error); padding:20px;">Hata: ${u.message}</div>
    `,(c=e.querySelector("#pm-back-err"))==null||c.addEventListener("click",t)}}function Ws(e){const a=(e.qty||0)*(e.unitPrice||0);return a-a*((e.discount||0)/100)}function Xs(e,a,t){var n,o;const s=F.purchaseConfig||{},i=s.requireInvoiceForReceive!==!1,r=s.allowPartialReceive!==!1;e.innerHTML=`
    <div class="card" style="border-left:4px solid #4CAF50; padding:16px;">
      <div style="font-weight:700; font-size:15px; margin-bottom:14px; color:#4CAF50;">
        <i class="ph ph-package"></i> Mal Kabul Girişi
      </div>

      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:13px; font-weight:600;">İrsaliye / Fatura No${i?" *":""}</label>
        <input type="text" class="input-element" id="receive-invoice" placeholder="Örn: INV-2026-001" value="${a.invoiceNo||""}" />
      </div>

      <div style="font-weight:600; font-size:13px; margin-bottom:10px;">Teslim Alınan Miktarlar</div>
      ${r?"":'<div style="font-size:12px; color:var(--warning); margin-bottom:10px;"><i class="ph ph-info"></i> Bu firmada kısmi mal kabul kapalı: kalan miktarın tamamı teslim alınır.</div>'}
      ${a.lines.map(c=>{const u=(c.qty||0)-(c.receivedQty||0);return`
        <div class="pm-receive-line">
          <div class="pm-receive-line-info">
            <div style="font-weight:600; font-size:13px;">${h(c.productName)}</div>
            <div style="font-size:11px; color:var(--text-secondary);">
              Sipariş: ${c.qty} ${h(c.unit)} | Önceki Teslim: ${c.receivedQty||0} | Kalan: ${u}
            </div>
          </div>
          <input type="number" class="input-element receive-qty-input"
            data-line-id="${c.id}"
            min="0" max="${u}"
            value="${u}"
            style="width:90px; text-align:center;"
            ${u<=0||!r?"disabled":""}
          />
          <span style="font-size:12px; color:var(--text-secondary); min-width:40px;">${h(c.unit)}</span>
        </div>`}).join("")}

      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="receive-cancel-btn"><i class="ph ph-x"></i> Vazgeç</button>
        <button class="btn btn-success" id="receive-submit-btn"><i class="ph ph-check"></i> Mal Kabul Kaydet</button>
      </div>
    </div>
  `,(n=e.querySelector("#receive-cancel-btn"))==null||n.addEventListener("click",()=>{e.style.display="none"}),(o=e.querySelector("#receive-submit-btn"))==null||o.addEventListener("click",async()=>{const c=e.querySelector("#receive-invoice").value.trim();if(i&&!c){P("İrsaliye / fatura numarası zorunludur","warning");return}const u=[];if(e.querySelectorAll(".receive-qty-input").forEach(m=>{const p=r?parseFloat(m.value)||0:parseFloat(m.max)||0;p>0&&u.push({lineId:m.dataset.lineId,qty:p})}),u.length===0){P("En az bir kalem için miktar girin","warning");return}const l=e.querySelector("#receive-submit-btn");l.disabled=!0,l.innerHTML='<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Kaydediliyor...';const d=await I.post(`/purchase-orders/${a.id}/receive`,{invoiceNo:c,receivedLines:u,allowUnapproved:s.requireApproval===!1}).catch(m=>({success:!1,message:m.message}));d.success?(P(d.message,"success"),t()):(P(d.message||"Hata oluştu","error"),l.disabled=!1,l.innerHTML='<i class="ph ph-check"></i> Mal Kabul Kaydet')})}async function Zs(e,a){e.innerHTML='<div class="loading-spinner" style="margin-top:32px;"></div>';try{let d=function(){var w,L,b,E;e.innerHTML=`
        <button class="btn btn-outline btn-sm" id="pm-back-new" style="margin-bottom:14px;">
          <i class="ph ph-arrow-left"></i> Geri
        </button>

        <div class="card" style="margin-bottom:16px; padding:20px;">
          <h3 style="margin:0 0 18px; font-size:16px;"><i class="ph ph-plus-circle"></i> Yeni Satın Alma Siparişi</h3>

          <div class="pm-form-grid">
            <div class="form-group">
              <label>Tedarikçi *</label>
              <select class="input-element" id="po-supplier">
                <option value="">Seçiniz...</option>
                ${n.map(y=>`<option value="${y.id}" data-currency="${u(y.currency)}">${u(y.name)}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Beklenen Teslim *</label>
              <input type="date" class="input-element" id="po-expected-date"
                value="${new Date(Date.now()+7*864e5).toISOString().slice(0,10)}" />
            </div>
            <div class="form-group">
              <label>Hedef Depo</label>
              <select class="input-element" id="po-warehouse">
                <option value="">Seçiniz...</option>
                ${o.map(y=>`<option value="${y.id}">${u(y.name)} (${u(y.code)})</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>Para Birimi</label>
              <select class="input-element" id="po-currency">
                <option value="TRY">₺ TRY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select class="input-element" id="po-status">
                <option value="draft">Taslak</option>
                <option value="pending">Onay Bekliyor</option>
                <option value="approved">Onaylandı</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Notlar</label>
            <input type="text" class="input-element" id="po-notes" placeholder="Opsiyonel not..." />
          </div>
        </div>

        <!-- Kalemler -->
        <div class="card" style="margin-bottom:16px; overflow:hidden;">
          <div style="padding:14px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
            <span style="font-weight:600; font-size:14px;"><i class="ph ph-list-bullets"></i> Sipariş Kalemleri</span>
            <button class="btn btn-outline btn-sm" id="add-po-line"><i class="ph ph-plus"></i> Kalem Ekle</button>
          </div>
          <datalist id="po-catalog-codes">${c.map(y=>`<option value="${u(y.code)}">${u(y.name)}</option>`).join("")}</datalist>
          <datalist id="po-catalog-names">${c.map(y=>`<option value="${u(y.name)}">${u(y.code)}</option>`).join("")}</datalist>
          <div id="po-lines-container" style="padding:12px 16px;">
            ${m()}
          </div>
          <div style="padding:12px 16px; border-top:1px solid var(--border); text-align:right;">
            <div id="po-totals"></div>
          </div>
        </div>

        <div class="pm-action-row">
          <button class="btn btn-outline" id="po-save-draft"><i class="ph ph-floppy-disk"></i> Taslak Kaydet</button>
          <button class="btn btn-primary" id="po-save-submit"><i class="ph ph-paper-plane-tilt"></i> Onaya Gönder</button>
        </div>
      `,v(),p(),(w=e.querySelector("#pm-back-new"))==null||w.addEventListener("click",a),(L=e.querySelector("#add-po-line"))==null||L.addEventListener("click",()=>{l.push({id:"l"+Date.now(),productCode:"",productName:"",unit:"Adet",qty:1,unitPrice:0,taxRate:20,discount:0}),e.querySelector("#po-lines-container").innerHTML=m(),v(),p()}),(b=e.querySelector("#po-save-draft"))==null||b.addEventListener("click",()=>k("draft")),(E=e.querySelector("#po-save-submit"))==null||E.addEventListener("click",()=>k("pending"))},m=function(){return l.map((w,L)=>`
        <div class="pm-line-row" data-line-id="${w.id}">
          <div class="pm-line-fields">
            <input type="text" class="input-element line-product-code" placeholder="Ürün Kodu" value="${u(w.productCode)}" data-field="productCode" list="po-catalog-codes" autocomplete="off" />
            <input type="text" class="input-element line-product-name" placeholder="Ürün Adı *" value="${u(w.productName)}" data-field="productName" list="po-catalog-names" autocomplete="off" style="flex:2;" />
            <input type="text" class="input-element" placeholder="Birim" value="${u(w.unit)}" data-field="unit" style="width:70px;" />
            <input type="number" class="input-element" placeholder="Miktar" value="${w.qty}" min="0.01" step="0.01" data-field="qty" style="width:90px;" />
            <input type="number" class="input-element" placeholder="B.Fiyat" value="${w.unitPrice}" min="0" step="0.01" data-field="unitPrice" style="width:100px;" />
            <input type="number" class="input-element" placeholder="KDV%" value="${w.taxRate}" min="0" max="100" data-field="taxRate" style="width:70px;" />
            <input type="number" class="input-element" placeholder="İsk.%" value="${w.discount}" min="0" max="100" data-field="discount" style="width:70px;" />
          </div>
          ${l.length>1?`
          <button class="pm-remove-line-btn" data-line-id="${w.id}" title="Kalemi Sil">
            <i class="ph ph-x-circle"></i>
          </button>`:""}
        </div>
      `).join("")},p=function(){const w=e.querySelector("#po-lines-container");w==null||w.querySelectorAll("input[data-field]").forEach(L=>{L.addEventListener("input",()=>{const b=L.closest(".pm-line-row"),E=b.dataset.lineId,y=l.find(T=>T.id===E);if(y){const T=L.dataset.field;if(y[T]=["qty","unitPrice","taxRate","discount"].includes(T)?parseFloat(L.value)||0:L.value,T==="productCode"||T==="productName"){const M=c.find(N=>(T==="productCode"?N.code:N.name)===L.value);M&&(Object.assign(y,{productCode:M.code,productName:M.name,unit:M.unit}),!y.unitPrice&&M.price&&(y.unitPrice=M.price),b.querySelectorAll("input[data-field]").forEach(N=>{y[N.dataset.field]!==void 0&&(N.value=y[N.dataset.field])}))}v()}})}),w==null||w.querySelectorAll(".pm-remove-line-btn").forEach(L=>{L.addEventListener("click",()=>{l=l.filter(b=>b.id!==L.dataset.lineId),w.innerHTML=m(),v(),p()})})},v=function(){var y;let w=0,L=0;l.forEach(T=>{const M=(T.qty||0)*(T.unitPrice||0),N=M-M*((T.discount||0)/100),q=N*((T.taxRate||0)/100);w+=N,L+=q});const b=((y=e.querySelector("#po-currency"))==null?void 0:y.value)||"TRY",E=e.querySelector("#po-totals");E&&(E.innerHTML=`
          <div style="font-size:13px; color:var(--text-secondary);">Ara Toplam: ${je(w,b)}</div>
          <div style="font-size:13px; color:var(--text-secondary);">KDV: ${je(L,b)}</div>
          <div style="font-size:16px; font-weight:700; color:var(--primary); margin-top:4px;">
            Genel Toplam: ${je(w+L,b)}
          </div>
        `)};const[t,s,i,r]=await Promise.all([I.get("/suppliers"),I.get("/warehouses"),I.get("/products").catch(()=>({})),I.get("/raw-materials").catch(()=>({}))]),n=t.success?t.data.filter(w=>w.status==="active"):[],o=s.success?s.data:[],c=[...i.success?i.data.map(w=>({code:w.code,name:w.name,unit:w.unit,price:w.price||0})):[],...r.success?r.data.map(w=>({code:w.code,name:w.name,unit:w.unit,price:0})):[]],u=w=>String(w??"").replace(/[&<>"]/g,L=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[L]);let l=[{id:"l1",productCode:"",productName:"",unit:"Adet",qty:1,unitPrice:0,taxRate:20,discount:0}];async function k(w){var V,Q,ie,R,U,W,ee;const L=(V=e.querySelector("#po-supplier"))==null?void 0:V.value,b=(Q=e.querySelector("#po-expected-date"))==null?void 0:Q.value,E=(ie=e.querySelector("#po-warehouse"))==null?void 0:ie.value,y=((R=e.querySelector("#po-currency"))==null?void 0:R.value)||"TRY",T=((U=e.querySelector("#po-notes"))==null?void 0:U.value)||"",M=e.querySelector("#po-supplier"),N=((W=M==null?void 0:M.options[M.selectedIndex])==null?void 0:W.text)||"",q=e.querySelector("#po-warehouse"),S=((ee=q==null?void 0:q.options[q.selectedIndex])==null?void 0:ee.text)||"";if(!L)return P("Tedarikçi seçiniz","warning");if(!E)return P("Teslim deposunu seçiniz","warning");if(!b)return P("Teslim tarihi giriniz","warning");const D=l.filter(te=>te.productName&&te.qty>0);if(D.length===0)return P("En az bir ürün kalemi ekleyin","warning");const B=ge.getUser(),z=e.querySelector(w==="draft"?"#po-save-draft":"#po-save-submit");z&&(z.disabled=!0,z.innerHTML='<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>');const _=await I.post("/purchase-orders",{supplierId:L,supplierName:N,orderDate:new Date().toISOString().slice(0,10),expectedDate:b,warehouseId:E,warehouseName:S,currency:y,notes:T,status:w,lines:D.map((te,K)=>({...te,id:"L"+(K+1),receivedQty:0})),createdBy:(B==null?void 0:B.name)||"Kullanıcı",approvedBy:w==="approved"?(B==null?void 0:B.name)||"Kullanıcı":null,approvedAt:w==="approved"?new Date().toISOString().slice(0,10):null}).catch(te=>({success:!1,message:te.message}));_.success?(P(_.message,"success"),a()):(P(_.message||"Hata oluştu","error"),z&&(z.disabled=!1,z.innerHTML=w==="draft"?'<i class="ph ph-floppy-disk"></i> Taslak Kaydet':'<i class="ph ph-paper-plane-tilt"></i> Onaya Gönder'))}d()}catch(t){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${t.message}</div>`}}async function en(e){e.innerHTML='<div class="loading-spinner" style="margin-top:32px;"></div>';try{let n=function(){var c,u;const o=t.filter(l=>!s||l.name.toLowerCase().includes(s)||(l.contactPerson||"").toLowerCase().includes(s));e.innerHTML=`
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:14px; flex-wrap:wrap;">
          <div class="input-field" style="flex:1; min-width:180px;">
            <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
            <input type="search" class="input-element" id="sup-search" placeholder="Tedarikçi ara..." value="${s}" />
          </div>
          <button class="btn btn-primary btn-sm" id="sup-add-btn">
            <i class="ph ph-plus"></i> Yeni Tedarikçi
          </button>
        </div>

        ${i?tn(r,t):""}

        ${o.length===0?`
          <div class="pm-empty">
            <i class="ph ph-buildings" style="font-size:48px; opacity:.3;"></i>
            <p style="color:var(--text-secondary); margin-top:12px;">Tedarikçi bulunamadı</p>
          </div>
        `:o.map((l,d)=>`
          <div class="pm-supplier-card animate-fade-in-up stagger-${Math.min(d+1,5)}" data-id="${l.id}">
            <div class="pm-supplier-avatar" style="background:${l.status==="active"?"#2196F318":"#9E9E9E18"}; color:${l.status==="active"?"#2196F3":"#9E9E9E"};">
              ${l.name.charAt(0).toUpperCase()}
            </div>
            <div class="pm-supplier-info">
              <div class="pm-supplier-name">
                ${h(l.name)}
                <span style="font-size:11px; background:${l.status==="active"?"#4CAF5018":"#9E9E9E18"}; color:${l.status==="active"?"#4CAF50":"#9E9E9E"}; padding:2px 8px; border-radius:20px; font-weight:600; margin-left:6px;">
                  ${l.status==="active"?"Aktif":"Pasif"}
                </span>
              </div>
              <div style="font-size:12px; color:var(--text-secondary);">
                ${l.contactPerson?`<i class="ph ph-user"></i> ${h(l.contactPerson)}`:""}
                ${l.phone?` · <i class="ph ph-phone"></i> ${h(l.phone)}`:""}
              </div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
                <i class="ph ph-tag"></i> ${l.category||"-"}
                · <i class="ph ph-currency-circle-dollar"></i> ${h(l.currency)}
                · <i class="ph ph-calendar-check"></i> ${l.paymentTerm} gün vade
              </div>
            </div>
            <div class="pm-supplier-stats">
              <div style="font-size:11px; color:var(--text-secondary);">Toplam Sipariş</div>
              <div style="font-weight:700; font-size:15px;">${l.totalOrders}</div>
              <div style="font-size:11px; margin-top:4px; font-weight:600; color:var(--primary);">${je(l.totalAmount,l.currency)}</div>
            </div>
            <div class="pm-supplier-actions">
              <button class="icon-btn sup-edit-btn" data-id="${l.id}" title="Düzenle"><i class="ph ph-pencil"></i></button>
            </div>
          </div>
        `).join("")}
      `,(c=e.querySelector("#sup-search"))==null||c.addEventListener("input",l=>{s=l.target.value.toLowerCase(),n()}),(u=e.querySelector("#sup-add-btn"))==null||u.addEventListener("click",()=>{var l;i=!i,r=null,n(),i&&((l=e.querySelector("#sup-form-card"))==null||l.scrollIntoView({behavior:"smooth"}))}),e.querySelectorAll(".sup-edit-btn").forEach(l=>{l.addEventListener("click",d=>{var m;d.stopPropagation(),r=l.dataset.id,i=!0,n(),(m=e.querySelector("#sup-form-card"))==null||m.scrollIntoView({behavior:"smooth"})})}),i&&an(e,r,t,l=>{l?I.get("/suppliers").then(d=>{d.success&&(t=d.data),i=!1,r=null,n()}):(i=!1,r=null,n())})};const a=await I.get("/suppliers");let t=a.success?a.data:[],s="",i=!1,r=null;n()}catch(a){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${a.message}</div>`}}function tn(e,a){const t=e?a.find(s=>s.id===e):null;return`
    <div class="card pm-form-card" id="sup-form-card" style="margin-bottom:16px; padding:20px; border-left:4px solid var(--primary);">
      <h3 style="margin:0 0 16px; font-size:15px; color:var(--primary);">
        <i class="ph ph-${e?"pencil":"plus-circle"}"></i>
        ${e?"Tedarikçi Düzenle":"Yeni Tedarikçi"}
      </h3>
      <div class="pm-form-grid">
        <div class="form-group">
          <label>Firma Adı *</label>
          <input type="text" class="input-element" id="sup-name" value="${(t==null?void 0:t.name)||""}" placeholder="Firma ünvanı" />
        </div>
        <div class="form-group">
          <label>Yetkili Kişi</label>
          <input type="text" class="input-element" id="sup-contact" value="${(t==null?void 0:t.contactPerson)||""}" placeholder="Ad Soyad" />
        </div>
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" class="input-element" id="sup-phone" value="${(t==null?void 0:t.phone)||""}" placeholder="+90 5XX XXX XX XX" />
        </div>
        <div class="form-group">
          <label>E-posta</label>
          <input type="email" class="input-element" id="sup-email" value="${(t==null?void 0:t.email)||""}" placeholder="ornek@firma.com" />
        </div>
        <div class="form-group">
          <label>Vergi No</label>
          <input type="text" class="input-element" id="sup-taxno" value="${(t==null?void 0:t.taxNo)||""}" placeholder="XXXXXXXXXX" />
        </div>
        <div class="form-group">
          <label>Kategori</label>
          <select class="input-element" id="sup-category">
            ${["Tekstil","Hammadde","Ambalaj","Makine & Ekipman","Hizmet","Diğer"].map(s=>`<option ${((t==null?void 0:t.category)||"Diğer")===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Para Birimi</label>
          <select class="input-element" id="sup-currency">
            ${["TRY","USD","EUR"].map(s=>`<option ${((t==null?void 0:t.currency)||"TRY")===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Ödeme Vadesi (Gün)</label>
          <select class="input-element" id="sup-term">
            ${[0,7,15,30,45,60,90].map(s=>`<option value="${s}" ${((t==null?void 0:t.paymentTerm)||30)===s?"selected":""}>${s===0?"Peşin":s+" Gün"}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Adres</label>
        <input type="text" class="input-element" id="sup-address" value="${(t==null?void 0:t.address)||""}" placeholder="Adres" />
      </div>
      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="sup-form-cancel"><i class="ph ph-x"></i> İptal</button>
        ${e?'<button class="btn btn-outline" id="sup-form-passive" style="margin-right:auto; color:var(--error); border-color:var(--error);"><i class="ph ph-archive"></i> Pasife Al</button>':""}
        <button class="btn btn-primary" id="sup-form-save"><i class="ph ph-floppy-disk"></i> Kaydet</button>
      </div>
    </div>
  `}function an(e,a,t,s){var i,r,n;(i=e.querySelector("#sup-form-cancel"))==null||i.addEventListener("click",()=>s(!1)),(r=e.querySelector("#sup-form-passive"))==null||r.addEventListener("click",async()=>{if(await Le({title:"Tedarikçi pasife alınsın mı?",message:"Pasif tedarikçi listelerde görünmez; geçmiş siparişleri etkilenmez.",confirmLabel:"Pasife al",danger:!0}))try{const o=t.find(u=>u.id===a)||{},c=await I.put(`/suppliers/${a}`,{...o,status:"passive"});c.success?(P("Tedarikçi pasife alındı","success"),s(!0)):P(c.message||"Hata","error")}catch(o){P(o.message,"error")}}),(n=e.querySelector("#sup-form-save"))==null||n.addEventListener("click",async()=>{var d,m,p,v,k,w,L,b,E;const o=(d=e.querySelector("#sup-name"))==null?void 0:d.value.trim();if(!o)return P("Firma adı zorunludur","warning");const c={name:o,contactPerson:(m=e.querySelector("#sup-contact"))==null?void 0:m.value.trim(),phone:(p=e.querySelector("#sup-phone"))==null?void 0:p.value.trim(),email:(v=e.querySelector("#sup-email"))==null?void 0:v.value.trim(),taxNo:(k=e.querySelector("#sup-taxno"))==null?void 0:k.value.trim(),category:(w=e.querySelector("#sup-category"))==null?void 0:w.value,currency:(L=e.querySelector("#sup-currency"))==null?void 0:L.value,paymentTerm:parseInt((b=e.querySelector("#sup-term"))==null?void 0:b.value)||30,address:(E=e.querySelector("#sup-address"))==null?void 0:E.value.trim(),status:"active"},u=e.querySelector("#sup-form-save");u.disabled=!0,u.innerHTML='<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>';let l;try{l=a?await I.put(`/suppliers/${a}`,c):await I.post("/suppliers",c)}catch(y){l={success:!1,message:y.message}}l.success?(P(l.message,"success"),s(!0)):(P(l.message||"Hata","error"),u.disabled=!1,u.innerHTML='<i class="ph ph-floppy-disk"></i> Kaydet')})}async function sn(e){var a,t,s,i,r;e.innerHTML='<div class="loading-spinner" style="margin-top:32px;"></div>';try{const[n,o,c]=await Promise.all([I.get("/purchase-reports/summary"),I.get("/purchase-orders"),I.get("/suppliers")]),u=n.success?n.data:{},l=o.success?o.data:[],d=c.success?c.data:[],m=[...l].sort((w,L)=>{var b;return((b=L.orderDate)==null?void 0:b.localeCompare(w.orderDate||""))||0}).slice(0,5),p={};l.filter(w=>w.status!=="cancelled").forEach(w=>{p[w.supplierName]||(p[w.supplierName]=0),p[w.supplierName]+=w.totalGross||0});const v=Object.entries(p).sort((w,L)=>L[1]-w[1]).slice(0,5),k=((a=v[0])==null?void 0:a[1])||1;e.innerHTML=`
      <!-- KPI kartları -->
      <div class="pm-kpi-grid">
        <div class="pm-kpi-card">
          <div class="pm-kpi-icon" style="background:#2196F318; color:#2196F3;"><i class="ph ph-list-numbers"></i></div>
          <div>
            <div class="pm-kpi-value">${u.total||0}</div>
            <div class="pm-kpi-label">Toplam Sipariş</div>
          </div>
        </div>
        <div class="pm-kpi-card">
          <div class="pm-kpi-icon" style="background:#4CAF5018; color:#4CAF50;"><i class="ph ph-check-fat"></i></div>
          <div>
            <div class="pm-kpi-value">${((t=u.byStatus)==null?void 0:t.received)||0}</div>
            <div class="pm-kpi-label">Teslim Alındı</div>
          </div>
        </div>
        <div class="pm-kpi-card">
          <div class="pm-kpi-icon" style="background:#FF980018; color:#FF9800;"><i class="ph ph-clock"></i></div>
          <div>
            <div class="pm-kpi-value">${(((s=u.byStatus)==null?void 0:s.approved)||0)+(((i=u.byStatus)==null?void 0:i.ordered)||0)+(((r=u.byStatus)==null?void 0:r.partial)||0)}</div>
            <div class="pm-kpi-label">Bekleyen Teslimat</div>
          </div>
        </div>
        <div class="pm-kpi-card">
          <div class="pm-kpi-icon" style="background:#9C27B018; color:#9C27B0;"><i class="ph ph-buildings"></i></div>
          <div>
            <div class="pm-kpi-value">${d.filter(w=>w.status==="active").length}</div>
            <div class="pm-kpi-label">Aktif Tedarikçi</div>
          </div>
        </div>
      </div>

      <!-- Durum dağılımı -->
      <div class="card" style="margin-bottom:16px; padding:16px;">
        <div style="font-weight:600; font-size:14px; margin-bottom:14px;"><i class="ph ph-chart-pie"></i> Sipariş Durumu Dağılımı</div>
        <div class="pm-status-grid">
          ${Object.entries(Qe).map(([w,L])=>{var E;const b=((E=u.byStatus)==null?void 0:E[w])||0;return`
              <div class="pm-status-item">
                <span class="pm-status-dot" style="background:${L.color};"></span>
                <span style="flex:1; font-size:13px;">${L.label}</span>
                <span style="font-weight:700; font-size:14px;">${b}</span>
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Tedarikçi bazlı harcama -->
      <div class="card" style="margin-bottom:16px; padding:16px;">
        <div style="font-weight:600; font-size:14px; margin-bottom:14px;"><i class="ph ph-chart-bar"></i> Tedarikçi Bazlı Alım</div>
        ${v.length===0?'<div style="color:var(--text-secondary); text-align:center; padding:20px;">Veri yok</div>':v.map(([w,L])=>`
            <div style="margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span style="font-weight:500;">${w}</span>
                <span style="font-weight:700; color:var(--primary);">${je(L,"TRY")}</span>
              </div>
              <div class="pm-progress-bar">
                <div class="pm-progress-fill" style="width:${Math.round(L/k*100)}%; background:var(--primary);"></div>
              </div>
            </div>
          `).join("")}
      </div>

      <!-- Son Siparişler -->
      <div class="card" style="padding:16px;">
        <div style="font-weight:600; font-size:14px; margin-bottom:12px;"><i class="ph ph-clock-clockwise"></i> Son Siparişler</div>
        ${m.map(w=>{const L=Qe[w.status]||Qe.draft;return`
            <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border);">
              <i class="ph ${L.icon}" style="color:${L.color}; font-size:20px;"></i>
              <div style="flex:1;">
                <div style="font-weight:600; font-size:13px;">${w.id}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${h(w.supplierName)} · ${dt(w.orderDate)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; font-size:13px;">${je(w.totalGross,w.currency)}</div>
                <span style="font-size:11px; background:${L.bg}; color:${L.color}; padding:2px 8px; border-radius:20px;">${L.label}</span>
              </div>
            </div>
          `}).join("")}
      </div>
    `}catch(n){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${n.message}</div>`}}const nn=(()=>{const e=new Uint32Array(256);for(let a=0;a<256;a++){let t=a;for(let s=0;s<8;s++)t=t&1?3988292384^t>>>1:t>>>1;e[a]=t>>>0}return e})();function rn(e){let a=4294967295;for(let t=0;t<e.length;t++)a=nn[(a^e[t])&255]^a>>>8;return(a^4294967295)>>>0}function ln(e){const a=new TextEncoder,t=[],s=[];let i=0;const r=m=>[m&255,m>>>8&255],n=m=>[m&255,m>>>8&255,m>>>16&255,m>>>24&255],o=0,c=33;for(const m of e){const p=a.encode(m.name),v=rn(m.data),k=m.data.length,w=[...n(67324752),...r(20),...r(0),...r(0),...r(o),...r(c),...n(v),...n(k),...n(k),...r(p.length),...r(0)];t.push(new Uint8Array(w),p,m.data),s.push([...n(33639248),...r(20),...r(20),...r(0),...r(0),...r(o),...r(c),...n(v),...n(k),...n(k),...r(p.length),...r(0),...r(0),...r(0),...r(0),...n(0),...n(i)]),s.push(p),i+=w.length+p.length+k}const u=[];let l=0;for(const m of s){const p=m instanceof Uint8Array?m:new Uint8Array(m);u.push(p),l+=p.length}const d=new Uint8Array([...n(101010256),...r(0),...r(0),...r(e.length),...r(e.length),...n(l),...n(i),...r(0)]);return new Blob([...t,...u,d],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}function on(e){let a="";for(const t of e){const s=t.codePointAt(0);(s>=32||s===9||s===10||s===13)&&(a+=t)}return a}const $a=e=>on(String(e??"")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function _a(e){let a="";for(let t=e+1;t>0;t=Math.floor((t-1)/26))a=String.fromCharCode(65+(t-1)%26)+a;return a}const cn=e=>typeof e=="number"&&Number.isFinite(e);function dn(e,a){const t=e.map(([n],o)=>{let c=String(n).length;for(const u of a){const l=typeof e[o][1]=="function"?e[o][1](u):u[e[o][1]],d=l==null?0:String(l).length;d>c&&(c=d)}return Math.min(52,Math.max(9,c+2))}),s=(n,o,c,u)=>{const l=`${_a(n)}${o}`;return u?`<c r="${l}" s="1" t="inlineStr"><is><t xml:space="preserve">${$a(c)}</t></is></c>`:c==null||c===""?`<c r="${l}"/>`:cn(c)?`<c r="${l}"><v>${c}</v></c>`:`<c r="${l}" t="inlineStr"><is><t xml:space="preserve">${$a(c)}</t></is></c>`},i=`<row r="1">${e.map(([n],o)=>s(o,1,n,!0)).join("")}</row>`,r=a.map((n,o)=>`<row r="${o+2}">${e.map(([,c],u)=>{const l=typeof c=="function"?c(n):n[c];return s(u,o+2,l)}).join("")}</row>`).join("");return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0" rightToLeft="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${t.map((n,o)=>`<col min="${o+1}" max="${o+1}" width="${n}" customWidth="1"/>`).join("")}</cols>
<sheetData>${i}${r}</sheetData>
<autoFilter ref="A1:${_a(e.length-1)}${a.length+1}"/>
</worksheet>`}const un=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3A5F"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;function pn(e,a,t){const s=new TextEncoder,i=$a(String(e).replace(/[\\/?*[\]:]/g," ").slice(0,31))||"Liste",r=[{name:"[Content_Types].xml",data:s.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`)},{name:"_rels/.rels",data:s.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`)},{name:"xl/workbook.xml",data:s.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${i}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`)},{name:"xl/_rels/workbook.xml.rels",data:s.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`)},{name:"xl/styles.xml",data:s.encode(un)},{name:"xl/worksheets/sheet1.xml",data:s.encode(dn(a,t))}];return ln(r)}const Ua=()=>{const e=new Date,a=t=>String(t).padStart(2,"0");return`${e.getFullYear()}-${a(e.getMonth()+1)}-${a(e.getDate())}_${a(e.getHours())}${a(e.getMinutes())}`},Ga=e=>String(e||"liste").toLocaleLowerCase("tr").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60),Ya=(e,a)=>{const t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=a,document.body.appendChild(t),t.click(),setTimeout(()=>{URL.revokeObjectURL(t.href),t.remove()},1e3)};async function ye(e,a,t,s){if(!t||!t.length)return P("Aktarılacak kayıt yok","warning");const i=await qa({title:"Dışa aktar",message:`${t.length} kayıt hangi biçimde indirilsin?`,options:[{label:"Excel",value:"xlsx",icon:"ph-file-xls"},{label:"PDF",value:"pdf",icon:"ph-file-pdf"}]});if(i)try{if(i==="pdf"){P("PDF hazırlanıyor…","info");const{buildPdf:r}=await Ge(async()=>{const{buildPdf:n}=await import("./pdf-B5CLklZO.js");return{buildPdf:n}},[],import.meta.url);Ya(await r(e,a,t),`${Ga(e)}_${Ua()}.pdf`),P(`${t.length} satır PDF olarak indirildi`,"success")}else Ya(pn(e,a,t),`${Ga(e)}_${Ua()}.xlsx`),P(`${t.length} satır Excel'e aktarıldı`,"success")}catch(r){P("Dosya oluşturulamadı: "+(r.message||""),"error")}}const Ee=(e="export-xlsx",a="Dışa aktar")=>`<button class="btn btn-secondary btn-export" id="${e}" title="Excel veya PDF olarak indir"><i class="ph ph-download-simple"></i> <span>${a}</span></button>`,de={me:null,perms:[],meta:null,alertCounts:{critical:0,warning:0,info:0}},ve=e=>de.perms.includes(e);async function wa(e=!1){if(de.me&&de.meta&&!e)return de;const a=await I.get("/jt/me");de.me=a.data.user,de.perms=a.data.permissions||[];const t=await I.get("/jt/meta");return de.meta=t.data,de}const se=e=>e==null||Number.isNaN(Number(e))?"—":Number(e).toLocaleString("tr-TR"),Wt=e=>e?new Date(String(e).length<=10?`${e}T00:00:00`:e):null,qe=e=>{const a=Wt(e);return a?a.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"}):"—"},xa=e=>{const a=Wt(e);return a?a.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—"},Ot=e=>{const a=Wt(e);return a?a.toLocaleString("tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—"},ut=()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`},Ca=(e,a)=>{const t=Wt(e);return t.setDate(t.getDate()+a),`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`};function mn(e){const a=new Date(`${e}T23:59:59`).getTime();return Math.ceil((a-Date.now())/864e5)}function Xt(e,a=!1){if(a)return`<span class="jt-due">${qe(e)}</span>`;const t=mn(e);return t<0?`<span class="jt-due late"><i class="ph ph-warning"></i> ${qe(e)} · ${-t} gün gecikti</span>`:t===0?`<span class="jt-due soon"><i class="ph ph-clock-countdown"></i> ${qe(e)} · bugün</span>`:`<span class="jt-due ${t<=3?"soon":""}">${qe(e)} · ${t} gün kaldı</span>`}const _t={planned:{label:"Planlandı",cls:"planned",icon:"ph-clock"},in_progress:{label:"Devam ediyor",cls:"progress",icon:"ph-play-circle"},blocked:{label:"Engelli",cls:"blocked",icon:"ph-hand-palm"},done:{label:"Tamamlandı",cls:"done",icon:"ph-check-circle"},cancelled:{label:"İptal",cls:"cancelled",icon:"ph-prohibit"}},st={low:"Düşük",medium:"Normal",high:"Yüksek",urgent:"Acil"},Da={active:"Aktif",planned:"Planlanıyor",on_hold:"Beklemede",completed:"Tamamlandı",cancelled:"İptal"},Sa={open:"Bekliyor",in_production:"Üretimde",partially_shipped:"Kısmen sevk",shipped:"Sevk edildi",cancelled:"İptal"},Va={admin:"ph-shield-star",manager:"ph-briefcase",planner:"ph-calendar-check",supervisor:"ph-hard-hat",operator:"ph-wrench",quality:"ph-seal-check",logistics:"ph-truck",viewer:"ph-eye"};function Zt(e){if(e.overdue)return`<span class="jt-badge late"><i class="ph ph-warning"></i> ${e.overdueDays} gün gecikti</span>`;const a=_t[e.status]||_t.planned,t=e.status==="done"&&e.onTime===!1?` · ${e.delayDays} gün geç`:"";return`<span class="jt-badge ${a.cls}"><i class="ph ${a.icon}"></i> ${a.label}${t}</span>`}const Oe=(e,a="")=>`<span class="jt-badge ${a}">${h(e)}</span>`;function Je(e,a=""){const t=Math.max(0,Math.min(100,Math.round(e||0)));return`<div class="jt-bar ${a}"><i style="width:${t}%"></i></div>`}function Mt(e,a){const t=e?Math.min(100,Math.round(a/e*100)):0;return`<div class="jt-dual"><div class="jt-bar ship"><i style="width:${t}%"></i></div><small>${se(a)} / ${se(e)} <b>%${t}</b></small></div>`}function yi(e,a=32){const t=String(e||"?").split(/\s+/).map(i=>i[0]).slice(0,2).join("").toLocaleUpperCase("tr");let s=0;for(const i of String(e||""))s=(s*31+i.charCodeAt(0))%360;return`<span class="jt-avatar" style="width:${a}px;height:${a}px;font-size:${Math.round(a*.38)}px;background:hsl(${s} 45% 42%)">${h(t)}</span>`}const it=(e,a="")=>`<span class="jt-person">${yi(e,30)}<span><b>${h(e||"Atanmamış")}</b>${a?`<small>${h(a)}</small>`:""}</span></span>`;function ki(e,a=54){if(e==null)return`<span class="jt-ring empty" style="width:${a}px;height:${a}px">—</span>`;const t=20,s=2*Math.PI*t,i=e>=80?"var(--success)":e>=60?"var(--warning)":"var(--error)";return`<span class="jt-ring" style="width:${a}px;height:${a}px"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${t}" class="bg"/><circle cx="24" cy="24" r="${t}" stroke="${i}" stroke-dasharray="${e/100*s} ${s}" transform="rotate(-90 24 24)"/></svg><b>${e}</b></span>`}const De=(e,a)=>`<div class="jt-empty"><i class="ph ${e}"></i><p>${h(a)}</p></div>`,Ae=e=>`<div class="jt-empty error"><i class="ph ph-plugs"></i><p>${h((e==null?void 0:e.message)||"Veri alınamadı")}</p></div>`,Ce=()=>'<div class="jt-loading"><div class="loading-spinner"></div></div>';let la=0;function Fe({title:e,subtitle:a="",body:t="",wide:s=!1,onClose:i}){const r=document.createElement("div");r.className="jt-sheet-wrap",r.innerHTML=`
    <div class="jt-sheet-bg"></div>
    <section class="jt-sheet ${s?"wide":""}" role="dialog" aria-modal="true" aria-label="${h(e)}">
      <header><div><h3>${h(e)}</h3>${a?`<p>${a}</p>`:""}</div><button class="jt-x" aria-label="Kapat"><i class="ph ph-x"></i></button></header>
      <div class="jt-sheet-body">${t}</div>
    </section>`,document.body.appendChild(r),document.body.classList.add("jt-lock"),la++;const n=()=>{r.isConnected&&(r.classList.add("closing"),setTimeout(()=>{r.remove(),--la<=0&&(la=0,document.body.classList.remove("jt-lock"))},200),i==null||i())};return r.querySelector(".jt-sheet-bg").addEventListener("click",n),r.querySelector(".jt-x").addEventListener("click",n),r.addEventListener("keydown",o=>{o.key==="Escape"&&n()}),{el:r,body:r.querySelector(".jt-sheet-body"),close:n,setTitle:o=>{r.querySelector("h3").textContent=o}}}async function Ne(e,a){e&&(e.disabled=!0);try{return await a()}catch(t){P(t.message||"İşlem başarısız","error")}finally{e&&(e.disabled=!1)}}const ke=(e,a,t)=>`${t?`<option value="">${h(t)}</option>`:""}${e.map(([s,i])=>`<option value="${h(s)}" ${String(s)===String(a)?"selected":""}>${h(i)}</option>`).join("")}`,re=(e,a,t="")=>`<label class="jt-field"><span>${h(e)}${t?` <small>${h(t)}</small>`:""}</span>${a}</label>`,hn={critical:["ph-warning-octagon","Kritik"],warning:["ph-warning","Uyarı"],info:["ph-info","Bilgi"]};function vn(e){const s={l:28,b:24,t:10},i=Math.max(4,...e.map(u=>u.onTime+u.late)),r=(520-s.l)/e.length,n=u=>190-s.b-u/i*(190-s.b-s.t),o=[0,.5,1].map(u=>`<line x1="${s.l}" x2="520" y1="${n(i*u)}" y2="${n(i*u)}" class="grid"/><text x="${s.l-6}" y="${n(i*u)+4}" text-anchor="end" class="axis">${Math.round(i*u)}</text>`).join(""),c=e.map((u,l)=>{const d=s.l+l*r+r*.22,m=r*.56,p=190-s.b-n(u.onTime),v=190-s.b-n(u.late);return`<rect x="${d}" y="${n(u.onTime)}" width="${m}" height="${Math.max(p,0)}" rx="3" class="on"><title>${u.label}: ${u.onTime} zamanında</title></rect>
      <rect x="${d}" y="${n(u.onTime)-v}" width="${m}" height="${Math.max(v,0)}" rx="3" class="late"><title>${u.label}: ${u.late} geç</title></rect>
      <text x="${d+m/2}" y="183" text-anchor="middle" class="axis">${h(u.label)}</text>`}).join("");return`<svg viewBox="0 0 520 190" class="jt-chart" role="img" aria-label="Haftalık tamamlanan işler">${o}${c}</svg>`}async function bn(e,a){e.innerHTML=Ce();let t;try{t=(await I.get("/jt/dashboard")).data}catch(n){e.innerHTML=Ae(n);return}a.setAlertCounts(t.alertCounts);const s=t.kpi,i=s.orderedQty?Math.round(s.shippedQty/s.orderedQty*100):0,r=(n,o,c,u,l="",d="")=>`
    <div class="jt-kpi ${l} ${d?"link":""}" ${d?`data-go="${d}"`:""}>
      <span class="ico"><i class="ph ${n}"></i></span>
      <div><small>${o}</small><b>${c}</b><em>${u}</em></div>
    </div>`;e.innerHTML=`
    <div class="jt-kpis">
      ${r("ph-package","Açık sipariş",se(s.openOrders),`${se(s.orderedQty)} adet sipariş`,"","orders")}
      ${r("ph-truck","Giden miktar",se(s.shippedQty),`%${i} sevk edildi`,i>=60?"good":"","orders")}
      ${r("ph-gear-six","Devam eden iş",se(s.activeJobs),`${se(s.plannedJobs)} planlı iş`,"","jobs")}
      ${r("ph-warning","Geciken iş",se(s.overdueJobs),`${se(s.blockedJobs)} engelli`,s.overdueJobs?"bad":"good","late")}
      ${r("ph-target","Zamanında tamamlama",s.onTimePct==null?"—":`%${s.onTimePct}`,"son 90 gün",s.onTimePct==null?"":s.onTimePct>=80?"good":s.onTimePct>=60?"warn":"bad","performance")}
      ${r("ph-calendar-x","Geciken sipariş",se(s.overdueOrders),"termini geçmiş",s.overdueOrders?"bad":"good","orders")}
      ${r("ph-folders","Aktif proje",se(s.activeProjects),"devam eden","","projects")}
      ${r("ph-check-circle","Tamamlanan iş",se(s.completedJobs),"toplam","","jobs")}
    </div>

    <section class="jt-card">
      <div class="jt-card-h"><h3>Süreç akışı</h3><small>Hangi süreçte kaç iş var</small></div>
      <div class="jt-flow">
        ${t.byProcess.map(n=>{const o=n.planned+n.inProgress+n.blocked+n.done||1,c=(u,l)=>u?`<i class="${l}" style="width:${u/o*100}%"></i>`:"";return`<button class="jt-stage" data-process="${h(n.id)}" style="--c:${h(n.color)}">
            <span class="ico"><i class="ph ${h(n.icon)}"></i></span>
            <b>${h(n.name)}</b>
            <span class="num">${n.inProgress+n.blocked}<small>aktif</small></span>
            <span class="jt-stack">${c(n.done,"done")}${c(n.inProgress,"progress")}${c(n.blocked,"blocked")}${c(n.planned,"planned")}</span>
            <span class="meta"><span>${n.done} biten</span><span>${n.planned} bekleyen</span></span>
            ${n.overdue?`<span class="jt-chip late"><i class="ph ph-warning"></i> ${n.overdue} geciken</span>`:'<span class="jt-chip ok">Gecikme yok</span>'}
            <em>${se(n.openQty)} adet kaldı</em>
          </button>`}).join("")}
      </div>
    </section>

    <div class="jt-cols">
      <section class="jt-card">
        <div class="jt-card-h"><h3>Sipariş &amp; giden miktar</h3><small>Termini yaklaşan açık siparişler</small></div>
        <div id="jt-ov-orders"></div>
      </section>
      <section class="jt-card">
        <div class="jt-card-h"><h3>Haftalık tamamlanan işler</h3><span class="jt-legend"><i class="on"></i>zamanında <i class="late"></i>geç</span></div>
        ${vn(t.weeks)}
      </section>
    </div>

    <div class="jt-cols">
      <section class="jt-card">
        <div class="jt-card-h"><h3>Dikkat gerektiren siparişler</h3></div>
        ${t.attention.length?t.attention.map(n=>`
          <button class="jt-row" data-order="${h(n.id)}">
            <span class="jt-row-main"><b>${h(n.orderNo)}</b><small>${h(n.customerName)}</small></span>
            <span class="jt-row-side">
              ${n.overdueDays?`<span class="jt-badge late">${n.overdueDays} gün gecikti</span>`:""}
              ${n.lateJobs?`<span class="jt-badge blocked">${n.lateJobs} geciken iş</span>`:""}
              <small>Üretim %${n.progress} · Sevk %${n.shippedPct}</small>
            </span>
          </button>`).join(""):De("ph-seal-check","Geciken sipariş veya iş yok.")}
      </section>
      <section class="jt-card">
        <div class="jt-card-h"><h3>Son uyarılar</h3><button class="jt-link" data-go="alerts">Tümü</button></div>
        ${t.alerts.length?t.alerts.map(n=>{var o,c;return`
          <button class="jt-alert ${n.severity}" data-link="${h(((o=n.link)==null?void 0:o.type)||"")}:${h(((c=n.link)==null?void 0:c.id)||"")}">
            <i class="ph ${hn[n.severity][0]}"></i><span><b>${h(n.title)}</b><small>${h(n.message)}</small></span>
          </button>`}).join(""):De("ph-bell-slash","Açık uyarı yok.")}
      </section>
    </div>`,I.get("/jt/orders").then(n=>{const o=n.data.filter(u=>u.state!=="shipped"&&u.state!=="cancelled").sort((u,l)=>u.dueDate.localeCompare(l.dueDate)).slice(0,6),c=e.querySelector("#jt-ov-orders");c&&(c.innerHTML=o.length?o.map(u=>`
      <button class="jt-row col" data-order="${h(u.id)}">
        <span class="jt-row-line"><b>${h(u.orderNo)}</b><small>${h(u.customerName)} · termin ${qe(u.dueDate)}</small></span>
        <span class="jt-mini"><small>Üretim %${u.progress}</small>${Je(u.progress)}</span>
        ${Mt(u.orderedQty,u.shippedQty)}
      </button>`).join(""):De("ph-package","Açık sipariş yok."))}).catch(()=>{}),e.onclick=n=>{const o=n.target.closest("[data-go],[data-process],[data-order],[data-link]");if(o){if(o.dataset.go)return a.go(o.dataset.go==="late"?"jobs":o.dataset.go,o.dataset.go==="late"?{late:!0}:{});if(o.dataset.process)return a.go("jobs",{processId:o.dataset.process});if(o.dataset.order)return a.openOrder(o.dataset.order);o.dataset.link&&a.openLink(o.dataset.link)}}}const fn=Object.freeze(Object.defineProperty({__proto__:null,render:bn},Symbol.toStringTag,{value:"Module"})),gn=[["active","Aktif"],["all","Tümü"],["completed","Tamamlanan"]];let Dt="active";async function kt(e,a){e.innerHTML=Ce();let t;try{t=(await I.get("/jt/projects")).data}catch(i){e.innerHTML=Ae(i);return}const s=t.filter(i=>Dt==="all"||(Dt==="active"?["active","planned","on_hold"].includes(i.status):i.status==="completed"));e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${gn.map(([i,r])=>`<button class="${Dt===i?"active":""}" data-filter="${i}">${r}</button>`).join("")}</div>
      ${ve("jt.projects.manage")?'<button class="btn btn-primary jt-add" id="jt-new-project"><i class="ph ph-plus"></i> Yeni proje</button>':""}
    </div>
    <div class="jt-grid">
      ${s.length?s.map(i=>`
        <article class="jt-project" data-project="${h(i.id)}" tabindex="0">
          <header>
            <span class="code">${h(i.code)}</span>
            ${i.overdue?'<span class="jt-badge late"><i class="ph ph-warning"></i> Terminde değil</span>':Oe(Da[i.status]||i.status,i.status==="completed"?"done":i.status==="on_hold"?"blocked":"progress")}
          </header>
          <h4>${h(i.name)}</h4>
          <p class="cust">${h(i.customerName||"—")}</p>
          <div class="jt-mgr">${it(i.managerName,i.managerTitle||"Proje sorumlusu")}</div>
          <div class="jt-prog"><span><small>İlerleme</small><b>%${i.progress}</b></span>${Je(i.progress,i.lateJobs?"warn":"")}</div>
          ${Mt(i.orderedQty,i.shippedQty)}
          <footer>
            <span>${Xt(i.dueDate,i.status==="completed")}</span>
            <span class="stats">
              <em title="Geciken iş" class="${i.lateJobs?"bad":""}"><i class="ph ph-warning"></i> ${i.lateJobs}</em>
              <em title="Zamanında tamamlama"><i class="ph ph-target"></i> ${i.onTimePct==null?"—":"%"+i.onTimePct}</em>
              <em title="İş sayısı"><i class="ph ph-list-checks"></i> ${i.jobsDone}/${i.jobCount}</em>
            </span>
          </footer>
        </article>`).join(""):De("ph-folders","Bu filtrede proje yok.")}
    </div>`,e.onclick=i=>{const r=i.target.closest("[data-filter]");if(r)return Dt=r.dataset.filter,kt(e,a);if(i.target.closest("#jt-new-project"))return Ia(a,null,()=>kt(e,a));const n=i.target.closest("[data-project]");n&&Ut(n.dataset.project,a,()=>kt(e,a))},e.onkeydown=i=>{if(i.key==="Enter"){const r=i.target.closest("[data-project]");r&&Ut(r.dataset.project,a,()=>kt(e,a))}}}async function Ut(e,a,t){const s=Fe({title:"Proje",body:Ce(),wide:!0});let i;try{i=(await I.get(`/jt/projects/${encodeURIComponent(e)}`)).data}catch(c){s.body.innerHTML=Ae(c);return}s.setTitle(i.name);const r=i.jobs.filter(c=>c.overdue).sort((c,u)=>u.overdueDays-c.overdueDays),n=i.jobs.filter(c=>!c.overdue&&c.status!=="done").slice(0,12),o=c=>`<button class="jt-row" data-job="${h(c.id)}"><span class="jt-row-main"><b>${h(c.jobNo)} · ${h(c.title)}</b><small>${h(c.assigneeName||"Atanmamış")} · bitiş ${qe(c.plannedEnd)}</small></span><span class="jt-row-side">${Zt(c)}</span></button>`;s.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${Oe(Da[i.status]||i.status,i.status==="completed"?"done":"progress")} ${Oe(st[i.priority]||i.priority)} <span class="code">${h(i.code)}</span></div>
      <p>${h(i.description||"")}</p>
    </div>
    <div class="jt-mgr-card">
      ${it(i.managerName,i.managerTitle||"Proje sorumlusu")}
      <span class="contact">${i.managerPhone?`<a href="tel:${h(String(i.managerPhone).replace(/\s/g,""))}"><i class="ph ph-phone"></i> ${h(i.managerPhone)}</a>`:""}${i.managerEmail?`<a href="mailto:${h(i.managerEmail)}"><i class="ph ph-envelope-simple"></i> ${h(i.managerEmail)}</a>`:""}</span>
      <span class="dates"><small>Müşteri</small><b>${h(i.customerName||"—")}</b><small>${xa(i.startDate)} → ${xa(i.dueDate)}</small></span>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş</small><b>${se(i.orderedQty)}</b></div>
      <div><small>Giden</small><b>${se(i.shippedQty)}</b></div>
      <div><small>Geciken iş</small><b class="${r.length?"bad":""}">${r.length}</b></div>
      <div><small>Bitiş</small><b>${Xt(i.dueDate,i.status==="completed")}</b></div>
    </div>
    <h4 class="jt-h">Süreç bazında ilerleme</h4>
    <div class="jt-proc-bars">${i.byProcess.map(c=>`<div><span>${h(c.name)}</span>${Je(c.progress,c.late?"warn":"")}<small>${c.done}/${c.total}${c.late?` · <em class="bad">${c.late} geç</em>`:""}</small></div>`).join("")}</div>
    <h4 class="jt-h">Siparişler</h4>
    ${i.orders.length?i.orders.map(c=>`<button class="jt-row col" data-order="${h(c.id)}"><span class="jt-row-line"><b>${h(c.orderNo)}</b><small>termin ${qe(c.dueDate)}${c.overdueDays?` · <em class="bad">${c.overdueDays} gün gecikti</em>`:""}</small></span>${Mt(c.orderedQty,c.shippedQty)}</button>`).join(""):De("ph-package","Bu projede sipariş yok.")}
    <h4 class="jt-h">Ekip</h4>
    <div class="jt-team">${i.team.length?i.team.map(c=>`<span class="jt-team-m">${it(c.name)}<small>${c.done}/${c.jobs} iş${c.late?` · <em class="bad">${c.late} geç</em>`:""}</small></span>`).join(""):"<small>Atanmış kişi yok.</small>"}</div>
    <h4 class="jt-h">Geciken ve devam eden işler</h4>
    ${[...r,...n].length?[...r,...n].slice(0,20).map(o).join(""):De("ph-check-circle","Açık iş yok.")}
    ${ve("jt.projects.manage")?'<div class="jt-actions"><button class="btn btn-secondary" id="jt-edit-project"><i class="ph ph-pencil-simple"></i> Projeyi düzenle</button></div>':""}`,s.body.onclick=c=>{const u=c.target.closest("[data-job]");if(u)return a.openJob(u.dataset.job);const l=c.target.closest("[data-order]");if(l)return a.openOrder(l.dataset.order);c.target.closest("#jt-edit-project")&&(s.close(),Ia(a,i,t))}}async function Ia(e,a,t){const s=de.meta.users.filter(n=>["manager","admin","planner","supervisor"].includes(n.role)),i=!!a,r=Fe({title:i?"Projeyi düzenle":"Yeni proje",body:`
    <form class="jt-form" id="pf">
      ${re("Proje adı",`<input name="name" required maxlength="120" value="${h((a==null?void 0:a.name)||"")}" />`)}
      <div class="jt-2">
        ${re("Müşteri",i?`<input value="${h(a.customerName||"")}" disabled />`:`<select name="customerId">${ke(de.meta.customers.map(n=>[n.id,n.name]),"","Seçin")}</select>`)}
        ${re("Proje sorumlusu",`<select name="managerId">${ke(s.map(n=>[n.id,`${n.name} — ${n.roleLabel||n.role}`]),a==null?void 0:a.managerId,"Seçin")}</select>`)}
      </div>
      <div class="jt-2">
        ${i?"":re("Başlangıç",`<input type="date" name="startDate" required value="${ut()}" />`)}
        ${re("Bitiş (termin)",`<input type="date" name="dueDate" required value="${h((a==null?void 0:a.dueDate)||Ca(ut(),60))}" />`)}
      </div>
      <div class="jt-2">
        ${re("Öncelik",`<select name="priority">${ke(Object.entries(st),(a==null?void 0:a.priority)||"medium")}</select>`)}
        ${i?re("Durum",`<select name="status">${ke(Object.entries(Da),a.status)}</select>`):"<span></span>"}
      </div>
      ${re("Açıklama",`<textarea name="description" rows="3" maxlength="500">${h((a==null?void 0:a.description)||"")}</textarea>`)}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button></div>
    </form>`});r.body.querySelector("[data-close]").onclick=r.close,r.body.querySelector("#pf").onsubmit=n=>{n.preventDefault();const o=Object.fromEntries(new FormData(n.target));Ne(n.submitter,async()=>{const c=i?await I.put(`/jt/projects/${encodeURIComponent(a.id)}`,o):await I.post("/jt/projects",o);P(c.message||"Kaydedildi","success"),r.close(),t==null||t()})}}const yn=Object.freeze(Object.defineProperty({__proto__:null,openProject:Ut,projectForm:Ia,render:kt},Symbol.toStringTag,{value:"Module"})),kn=[["open","Açık"],["late","Geciken"],["shipped","Sevk edildi"],["all","Tümü"]];let oa="open";async function $t(e,a){e.innerHTML=Ce();let t;try{t=(await I.get("/jt/orders")).data}catch(n){e.innerHTML=Ae(n);return}const s={open:n=>!["shipped","cancelled"].includes(n.state),late:n=>n.overdue||n.lateJobs>0,shipped:n=>n.state==="shipped",all:()=>!0}[oa],i=t.filter(s),r=i.reduce((n,o)=>({ordered:n.ordered+o.orderedQty,shipped:n.shipped+o.shippedQty}),{ordered:0,shipped:0});e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${kn.map(([n,o])=>`<button class="${oa===n?"active":""}" data-filter="${n}">${o}</button>`).join("")}</div>
      <span class="jt-sum"><b>${se(r.ordered)}</b> sipariş · <b>${se(r.shipped)}</b> giden</span>
      ${Ee("jt-export-orders")}
      ${ve("jt.orders.manage")?'<button class="btn btn-primary jt-add" id="jt-new-order"><i class="ph ph-plus"></i> Yeni sipariş</button>':""}
    </div>
    <div class="jt-table-wrap">
      <table class="jt-table">
        <thead><tr><th>Sipariş</th><th>Müşteri / proje</th><th>Termin</th><th>Sipariş → giden</th><th>Üretim</th><th>Durum</th></tr></thead>
        <tbody>
          ${i.map(n=>`
            <tr data-order="${h(n.id)}" tabindex="0" class="${n.overdue?"late":""}">
              <td data-label="Sipariş"><b>${h(n.orderNo)}</b><small>${n.lines.length} kalem</small></td>
              <td data-label="Müşteri"><b>${h(n.customerName)}</b><small>${h(n.projectCode||"")} ${h(n.projectName||"")}</small></td>
              <td data-label="Termin">${Xt(n.dueDate,n.state==="shipped")}</td>
              <td data-label="Giden">${Mt(n.orderedQty,n.shippedQty)}</td>
              <td data-label="Üretim"><div class="jt-mini">${Je(n.progress,n.lateJobs?"warn":"")}<small>%${n.progress}${n.lateJobs?` · <em class="bad">${n.lateJobs} geç iş</em>`:""}</small></div></td>
              <td data-label="Durum">${Oe(Sa[n.state]||n.state,n.state==="shipped"?"done":n.overdue?"late":n.state==="in_production"?"progress":"planned")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      ${i.length?"":De("ph-package","Bu filtrede sipariş yok.")}
    </div>`,e.onclick=n=>{const o=n.target.closest("[data-filter]");if(o)return oa=o.dataset.filter,$t(e,a);if(n.target.closest("#jt-export-orders"))return ye("Siparisler",[["Sipariş no","orderNo"],["Müşteri","customerName"],["Proje","projectCode"],["Sipariş tarihi","orderDate"],["Termin","dueDate"],["Durum",u=>Sa[u.state]||u.state],["Sipariş miktarı",u=>u.orderedQty],["Giden miktar",u=>u.shippedQty],["Sevk %",u=>u.shippedPct],["Üretim %",u=>u.progress],["Geciken iş",u=>u.lateJobs],["Gecikme (gün)",u=>u.overdueDays||0],["Tutar",u=>Math.round(u.totalValue||0)]],i);if(n.target.closest("#jt-new-order"))return $i(a,()=>$t(e,a));const c=n.target.closest("[data-order]");c&&Gt(c.dataset.order,a,()=>$t(e,a))},e.onkeydown=n=>{if(n.key==="Enter"){const o=n.target.closest("[data-order]");o&&Gt(o.dataset.order,a,()=>$t(e,a))}}}async function Gt(e,a,t){const s=Fe({title:"Sipariş",body:Ce(),wide:!0});let i;try{i=(await I.get(`/jt/orders/${encodeURIComponent(e)}`)).data}catch(n){s.body.innerHTML=Ae(n);return}s.setTitle(`${i.orderNo} · ${i.customerName}`);const r=Math.max(0,i.orderedQty-i.shippedQty);s.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${Oe(Sa[i.state]||i.state,i.state==="shipped"?"done":i.overdue?"late":"progress")} ${Oe(st[i.priority]||i.priority)} ${i.projectName?`<span class="code">${h(i.projectCode)} · ${h(i.projectName)}</span>`:""}</div>
      <p>Sipariş ${xa(i.orderDate)} · Termin ${Xt(i.dueDate,i.state==="shipped")}</p>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş edilen</small><b>${se(i.orderedQty)}</b></div>
      <div><small>Giden (ERP)</small><b>${se(i.shippedQty)}</b></div>
      <div><small>Kalan</small><b class="${r&&i.overdue?"bad":""}">${se(r)}</b></div>
      <div><small>Üretim ilerlemesi</small><b>%${i.progress}</b></div>
    </div>
    ${i.lines.map(n=>{const o=i.jobs.filter(c=>c.lineId===n.id);return`<section class="jt-line">
        <header>
          <div><b>${h(n.productName)}</b><small>${h(n.productCode||"")} · ERP stoğu: ${se(n.stock)} ${h(n.unit||"")}</small></div>
          <div class="jt-line-q"><span><small>Sipariş</small><b>${se(n.qty)}</b></span><span><small>Giden</small><b>${se(n.shippedQty)}</b></span><span><small>Kalan</small><b>${se(n.remaining)}</b></span></div>
        </header>
        ${Mt(n.qty,n.shippedQty)}
        ${n.materialShort?`<div class="jt-warnbox"><i class="ph ph-warning"></i> Hammadde yetersiz olabilir: ${n.materials.filter(c=>c.short).map(c=>`${h(c.name)} (gereken ${se(c.required)}, stok ${se(c.stock)} ${h(c.unit)})`).join("; ")}</div>`:""}
        <div class="jt-chain">${o.length?o.map(c=>{var u;return`
          <button class="jt-step ${c.overdue?"late":((u=_t[c.status])==null?void 0:u.cls)||""}" data-job="${h(c.id)}" title="${h(c.title)}">
            <i class="ph ${h(c.processIcon||"ph-gear")}"></i><b>${h(c.processName.split(" ")[0])}</b><small>${c.status==="done"?"✓":`%${c.progress}`}</small><em>${h((c.assigneeName||"Atanmamış").split(" ")[0])}</em>
          </button>`}).join(""):"<small>Bu kalem için iş planlanmamış.</small>"}
        </div>
        ${ve("jt.jobs.create")&&i.state!=="cancelled"?`<button class="jt-link" data-newjob="${h(n.id)}"><i class="ph ph-plus"></i> Bu kaleme iş ekle</button>`:""}
      </section>`}).join("")}
    <h4 class="jt-h">Sevkiyatlar (ERP satış kayıtları)</h4>
    ${i.shipments.length?`<table class="jt-table compact"><thead><tr><th>Tarih</th><th>Ürün</th><th class="r">Adet</th></tr></thead><tbody>${i.shipments.map(n=>`<tr><td>${Ot(n.date)}</td><td>${h(n.productName)}</td><td class="r">${se(n.quantity)}</td></tr>`).join("")}</tbody></table>`:'<small class="muted">Henüz sevkiyat yok. ERP’de Satış ekranından bu siparişe bağlı çıkış yapıldığında burada görünür.</small>'}
    ${i.notes?`<h4 class="jt-h">Not</h4><p>${h(i.notes)}</p>`:""}
    ${ve("jt.orders.manage")&&i.state!=="cancelled"&&i.state!=="shipped"?'<div class="jt-actions"><button class="btn btn-secondary danger" id="jt-cancel-order"><i class="ph ph-prohibit"></i> Siparişi iptal et</button></div>':""}`,s.body.onclick=n=>{const o=n.target.closest("[data-job]");if(o)return a.openJob(o.dataset.job);const c=n.target.closest("[data-newjob]");if(c)return s.close(),a.newJob({orderId:i.id,lineId:c.dataset.newjob},t);const u=n.target.closest("#jt-cancel-order");u&&Ne(u,async()=>{await Le({title:`${i.orderNo} iptal edilsin mi?`,message:"Siparişin tamamlanmamış işleri de iptal olur. Bu işlem geri alınamaz.",confirmLabel:"Siparişi iptal et",danger:!0})&&(await I.post(`/jt/orders/${encodeURIComponent(i.id)}/cancel`,{}),P("Sipariş iptal edildi","success"),s.close(),t==null||t())})}}async function $i(e,a){let t=[];try{t=(await I.get("/jt/projects")).data.filter(o=>["active","planned"].includes(o.status))}catch{}const s=de.meta.products,i=()=>`<div class="jt-line-edit"><select name="pid">${ke(s.map(o=>[o.id,`${o.code} — ${o.name}`]),"","Ürün seçin")}</select><input type="number" name="qty" min="1" step="1" placeholder="Adet" /><button type="button" class="jt-x" data-rm aria-label="Kalemi sil"><i class="ph ph-trash"></i></button></div>`,r=Fe({title:"Yeni sipariş",body:`
    <form class="jt-form" id="of">
      <div class="jt-2">
        ${re("Müşteri",`<select name="customerId" required>${ke(de.meta.customers.map(o=>[o.id,o.name]),"","Seçin")}</select>`)}
        ${re("Proje",`<select name="projectId">${ke(t.map(o=>[o.id,`${o.code} — ${o.name}`]),"","Projesiz")}</select>`)}
      </div>
      <div class="jt-2">
        ${re("Sipariş tarihi",`<input type="date" name="orderDate" required value="${ut()}" />`)}
        ${re("Termin",`<input type="date" name="dueDate" required value="${Ca(ut(),30)}" />`)}
      </div>
      ${re("Öncelik",`<select name="priority">${ke(Object.entries(st),"medium")}</select>`)}
      <div class="jt-lines"><span class="jt-lbl">Kalemler</span><div id="of-lines">${i()}</div><button type="button" class="jt-link" id="of-add"><i class="ph ph-plus"></i> Kalem ekle</button></div>
      ${re("Not",'<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Siparişi oluştur</button></div>
    </form>`}),n=r.body.querySelector("#of-lines");r.body.querySelector("[data-close]").onclick=r.close,r.body.querySelector("#of-add").onclick=()=>n.insertAdjacentHTML("beforeend",i()),n.onclick=o=>{const c=o.target.closest("[data-rm]");c&&n.children.length>1&&c.parentElement.remove()},r.body.querySelector("#of").onsubmit=o=>{o.preventDefault();const c=Object.fromEntries(new FormData(o.target)),u=[...n.children].map(l=>({productId:l.querySelector("[name=pid]").value,qty:Number(l.querySelector("[name=qty]").value)})).filter(l=>l.productId&&l.qty>0);if(!u.length)return P("En az bir ürün ve adet girin","warning");Ne(o.submitter,async()=>{const l=await I.post("/jt/orders",{...c,lines:u});P(`${l.data.orderNo} oluşturuldu`,"success"),r.close(),a==null||a()})}}const $n=Object.freeze(Object.defineProperty({__proto__:null,openOrder:Gt,orderForm:$i,render:$t},Symbol.toStringTag,{value:"Module"})),pe={status:"open",processId:"",projectId:"",mine:!1,late:!1,q:""},wi=e=>Object.assign(pe,{status:"open",processId:"",projectId:"",mine:!1,late:!1,q:""},e);async function xi(e,a){e.innerHTML=Ce();const t=new URLSearchParams;pe.status==="open"?t.set("open","1"):pe.status!=="all"&&t.set("status",pe.status),pe.processId&&t.set("processId",pe.processId),pe.projectId&&t.set("projectId",pe.projectId),pe.mine&&t.set("assigneeId","me"),pe.late&&t.set("late","1");let s;try{s=(await I.get(`/jt/jobs?${t}`)).data}catch(c){e.innerHTML=Ae(c);return}const i=pe.q.trim().toLocaleLowerCase("tr");i&&(s=s.filter(c=>`${c.jobNo} ${c.title} ${c.assigneeName||""} ${c.orderNo||""} ${c.productName||""}`.toLocaleLowerCase("tr").includes(i))),[...new Map(s.map(c=>[c.projectId,c.projectCode])).entries()].filter(([c])=>c);const r=de.meta.processes;e.innerHTML=`
    <div class="jt-toolbar wrap">
      <div class="jt-chips">${[["open","Açık"],["in_progress","Devam eden"],["blocked","Engelli"],["done","Biten"],["all","Tümü"]].map(([c,u])=>`<button class="${pe.status===c?"active":""}" data-status="${c}">${u}</button>`).join("")}</div>
      <label class="jt-toggle"><input type="checkbox" id="f-late" ${pe.late?"checked":""}/> Gecikenler</label>
      <label class="jt-toggle"><input type="checkbox" id="f-mine" ${pe.mine?"checked":""}/> Bana atananlar</label>
      <select id="f-proc" aria-label="Süreç">${ke(r.map(c=>[c.id,c.name]),pe.processId,"Tüm süreçler")}</select>
      <input type="search" id="f-q" placeholder="İş, kişi, sipariş ara…" value="${h(pe.q)}" />
      ${Ee("jt-export")}
      ${ve("jt.jobs.create")?'<button class="btn btn-primary jt-add" id="jt-new-job"><i class="ph ph-plus"></i> Yeni iş</button>':""}
    </div>
    <div class="jt-count">${s.length} iş</div>
    <div class="jt-grid jobs">
      ${s.length?s.slice(0,200).map(c=>`
        <article class="jt-job ${c.overdue?"late":""}" data-job="${h(c.id)}" tabindex="0" style="--pc:${h(c.processColor||"#64748B")}">
          <header><span class="proc"><i class="ph ${h(c.processIcon||"ph-gear")}"></i>${h(c.processName)}</span>${Zt(c)}</header>
          <h4>${h(c.title)}</h4>
          <p class="sub">${h(c.jobNo)} ${c.orderNo?"· "+h(c.orderNo):""} ${c.priority==="urgent"||c.priority==="high"?`· <em class="bad">${st[c.priority]}</em>`:""}</p>
          <div class="jt-prog"><span><small>${se(c.doneQty)} / ${se(c.plannedQty)}</small><b>%${c.progress}</b></span>${Je(c.progress,c.overdue?"bad":c.status==="done"?"good":"")}</div>
          <footer>${it(c.assigneeName,c.projectCode||"")}<span class="date"><small>Bitiş</small><b>${qe(c.plannedEnd)}</b></span></footer>
        </article>`).join(""):De("ph-list-checks","Bu filtrede iş yok.")}
    </div>`;const n=()=>xi(e,a);e.onclick=c=>{const u=c.target.closest("[data-status]");if(u)return pe.status=u.dataset.status,n();if(c.target.closest("#jt-export"))return ye("Is listesi",[["İş no","jobNo"],["Başlık","title"],["Süreç","processName"],["Proje","projectCode"],["Sipariş","orderNo"],["Ürün","productName"],["Sorumlu","assigneeName"],["Durum",d=>{var m;return((m=_t[d.status])==null?void 0:m.label)||d.status}],["Planlanan",d=>d.plannedQty],["Yapılan",d=>d.doneQty],["Fire",d=>d.scrapQty],["İlerleme %",d=>d.progress],["Başlangıç","plannedStart"],["Bitiş","plannedEnd"],["Gecikme (gün)",d=>d.overdueDays||0]],s);if(c.target.closest("#jt-new-job"))return Pa(a,{},n);const l=c.target.closest("[data-job]");l&&Tt(l.dataset.job,a,n)},e.onkeydown=c=>{if(c.key==="Enter"){const u=c.target.closest("[data-job]");u&&Tt(u.dataset.job,a,n)}},e.querySelector("#f-late").onchange=c=>{pe.late=c.target.checked,n()},e.querySelector("#f-mine").onchange=c=>{pe.mine=c.target.checked,n()},e.querySelector("#f-proc").onchange=c=>{pe.processId=c.target.value,n()};let o;e.querySelector("#f-q").oninput=c=>{pe.q=c.target.value,clearTimeout(o),o=setTimeout(()=>{n().then(()=>{const u=e.querySelector("#f-q");u.focus(),u.setSelectionRange(u.value.length,u.value.length)})},250)}}async function Tt(e,a,t){const s=Fe({title:"İş",body:Ce(),wide:!0});let i;try{i=(await I.get(`/jt/jobs/${encodeURIComponent(e)}`)).data}catch(m){s.body.innerHTML=Ae(m);return}s.setTitle(`${i.jobNo} · ${i.title}`);const r=de.me&&i.assigneeId===de.me.id,n=ve("jt.jobs.update.any")||ve("jt.jobs.update.own")&&r,o=i.status!=="done"&&i.status!=="cancelled",c=de.meta.users.filter(m=>["operator","quality","logistics","supervisor"].includes(m.role)),u={progress:"ph-plus-circle",status:"ph-flag",assign:"ph-user-switch",comment:"ph-chat-text"};s.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${Zt(i)} ${Oe(st[i.priority]||i.priority)} <span class="code" style="color:${h(i.processColor)}"><i class="ph ${h(i.processIcon||"ph-gear")}"></i> ${h(i.processName)}</span></div>
      ${i.blockedReason&&i.status==="blocked"?`<div class="jt-warnbox"><i class="ph ph-hand-palm"></i> Engel: ${h(i.blockedReason)}</div>`:""}
    </div>
    <div class="jt-info">
      <div><small>Sorumlu</small>${it(i.assigneeName)}</div>
      <div><small>Proje</small><b>${h(i.projectCode||"—")}</b><small>${h(i.projectName||"")}</small></div>
      <div><small>Sipariş</small>${i.orderId?`<button class="jt-link" data-order="${h(i.orderId)}">${h(i.orderNo)}</button>`:"<b>—</b>"}<small>${h(i.productName||"")}</small></div>
      <div><small>Planlanan</small><b>${qe(i.plannedStart)} → ${qe(i.plannedEnd)}</b><small>${i.actualStart?"Başladı: "+Ot(i.actualStart):"Henüz başlamadı"}</small></div>
      <div><small>Gerçekleşen bitiş</small><b>${i.actualEnd?Ot(i.actualEnd):"—"}</b>${i.onTime===!1?`<small class="bad">${i.delayDays} gün geç</small>`:i.onTime?'<small class="ok">Zamanında</small>':""}</div>
      ${i.product?`<div><small>ERP stoğu</small><b>${se(i.product.stock)} ${h(i.product.unit||"")}</b><small>${h(i.product.code)}</small></div>`:""}
    </div>
    <div class="jt-progress-box">
      <div class="jt-prog big"><span><small>Yapılan / planlanan</small><b>${se(i.doneQty)} / ${se(i.plannedQty)} <em>%${i.progress}</em></b></span>${Je(i.progress,i.overdue?"bad":i.status==="done"?"good":"")}</div>
      <small class="muted">Fire: ${se(i.scrapQty)} adet</small>
    </div>
    ${n&&o?`
    <form class="jt-form inline" id="jt-progress">
      <h4 class="jt-h">İlerleme gir</h4>
      <div class="jt-3">
        ${re("Yapılan adet",'<input type="number" name="qty" min="1" step="1" required placeholder="Örn. 50" />')}
        ${re("Fire",'<input type="number" name="scrap" min="0" step="1" value="0" />')}
        ${re("Not",'<input type="text" name="note" maxlength="200" placeholder="isteğe bağlı" />')}
      </div>
      <div class="jt-actions left">
        <button class="btn btn-primary" type="submit"><i class="ph ph-floppy-disk"></i> Kaydet</button>
        ${i.status==="planned"||i.status==="blocked"?'<button type="button" class="btn btn-secondary" data-st="in_progress"><i class="ph ph-play"></i> Başlat</button>':""}
        ${i.status!=="blocked"?'<button type="button" class="btn btn-secondary" data-st="blocked"><i class="ph ph-hand-palm"></i> Engel bildir</button>':""}
        <button type="button" class="btn btn-secondary" data-st="done"><i class="ph ph-check"></i> Tamamla</button>
        ${ve("jt.jobs.update.any")?'<button type="button" class="btn btn-secondary danger" data-st="cancelled"><i class="ph ph-prohibit"></i> İptal</button>':""}
      </div>
    </form>`:""}
    ${ve("jt.jobs.assign")&&o?`
    <div class="jt-assign"><h4 class="jt-h">Sorumlu ata</h4>
      <div class="jt-inline"><select id="jt-assignee">${ke(c.map(m=>[m.id,`${m.name} — ${m.title||m.roleLabel}`]),i.assigneeId,"Kişi seçin")}</select><button class="btn btn-secondary" id="jt-assign-btn">Ata</button></div>
    </div>`:""}
    <h4 class="jt-h">Hareketler</h4>
    <ol class="jt-timeline">${i.logs.map(m=>`<li><i class="ph ${u[m.type]||"ph-dot"}"></i><div><b>${h(m.userName||"Sistem")}</b> ${m.type==="progress"?`+${se(m.qty)} adet${m.scrap?` (fire ${se(m.scrap)})`:""}`:""} ${m.note?`<span>${h(m.note)}</span>`:""}<small>${Ot(m.createdAt)}</small></div></li>`).join("")||"<li><div><small>Kayıt yok</small></div></li>"}</ol>
    <form class="jt-inline comment" id="jt-comment"><input name="note" maxlength="300" placeholder="Not ekle…" required /><button class="btn btn-secondary" type="submit">Gönder</button></form>`;const l=()=>{s.close(),t==null||t(),setTimeout(()=>Tt(e,a,t),250)};s.body.onclick=m=>{const p=m.target.closest("[data-order]");if(p)return s.close(),a.openOrder(p.dataset.order);const v=m.target.closest("[data-st]");v&&Ne(v,async()=>{let w="";v.dataset.st==="blocked"&&(w=await Na({title:"Engel bildir",message:"İş neden ilerleyemiyor? Bu not sorumluya ve uyarılara yansır.",label:"Engelin nedeni",placeholder:"Örn. Kaynak teli bekleniyor",required:!0,multiline:!0,confirmLabel:"Engeli kaydet"}),!w)||v.dataset.st==="cancelled"&&!await Le({title:"İş iptal edilsin mi?",message:"İptal edilen iş listelerden kalkar ve uyarı üretmez.",confirmLabel:"İşi iptal et",danger:!0})||(await I.post(`/jt/jobs/${encodeURIComponent(e)}/status`,{status:v.dataset.st,note:w}),P("Durum güncellendi","success"),l())});const k=m.target.closest("#jt-assign-btn");k&&Ne(k,async()=>{const w=s.body.querySelector("#jt-assignee").value;if(!w)return P("Kişi seçin","warning");await I.post(`/jt/jobs/${encodeURIComponent(e)}/assign`,{userId:Number(w)}),P("Atandı","success"),l()})};const d=s.body.querySelector("#jt-progress");d&&(d.onsubmit=m=>{m.preventDefault();const p=Object.fromEntries(new FormData(d));Ne(m.submitter,async()=>{const v=await I.post(`/jt/jobs/${encodeURIComponent(e)}/progress`,{qty:Number(p.qty),scrap:Number(p.scrap||0),note:p.note});P(v.message,"success"),l()})}),s.body.querySelector("#jt-comment").onsubmit=m=>{m.preventDefault();const p=Object.fromEntries(new FormData(m.target));Ne(m.submitter,async()=>{await I.post(`/jt/jobs/${encodeURIComponent(e)}/comment`,p),l()})}}async function Pa(e,a={},t){let s=[];try{s=(await I.get("/jt/orders")).data.filter(u=>!["shipped","cancelled"].includes(u.state))}catch{}const i=de.meta.users.filter(u=>["operator","quality","logistics","supervisor"].includes(u.role)),r=Fe({title:"Yeni iş",body:`
    <form class="jt-form" id="jf">
      ${re("Sipariş",`<select name="orderId" id="jf-order">${ke(s.map(u=>[u.id,`${u.orderNo} — ${u.customerName}`]),a.orderId,"Siparişsiz iş")}</select>`)}
      ${re("Sipariş kalemi",'<select name="lineId" id="jf-line"><option value="">—</option></select>')}
      ${re("Süreç",`<select name="processId" required>${ke(de.meta.processes.map(u=>[u.id,u.name]),"","Seçin")}</select>`)}
      ${re("Başlık",'<input name="title" maxlength="160" placeholder="boş bırakılırsa süreç + ürün adı kullanılır" />')}
      <div class="jt-2">
        ${re("Planlanan adet",'<input type="number" name="plannedQty" min="1" step="1" required />')}
        ${re("Öncelik",`<select name="priority">${ke(Object.entries(st),"medium")}</select>`)}
      </div>
      <div class="jt-2">
        ${re("Başlangıç",`<input type="date" name="plannedStart" required value="${ut()}" />`)}
        ${re("Bitiş",`<input type="date" name="plannedEnd" required value="${Ca(ut(),3)}" />`)}
      </div>
      ${ve("jt.jobs.assign")?re("Sorumlu",`<select name="assigneeId">${ke(i.map(u=>[u.id,`${u.name} — ${u.title||u.roleLabel}`]),"","Sonra ata")}</select>`):""}
      ${re("Not",'<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">İşi oluştur</button></div>
    </form>`}),n=r.body.querySelector("#jf-order"),o=r.body.querySelector("#jf-line"),c=async()=>{if(o.innerHTML='<option value="">—</option>',!n.value)return;const u=(await I.get(`/jt/orders/${encodeURIComponent(n.value)}`)).data;if(o.innerHTML=ke(u.lines.map(l=>[l.id,`${l.productName} (${se(l.qty)})`]),a.lineId,"Kalem seçin"),!r.body.querySelector("[name=plannedQty]").value&&a.lineId){const l=u.lines.find(d=>d.id===a.lineId);l&&(r.body.querySelector("[name=plannedQty]").value=l.qty)}};n.onchange=()=>{a.lineId="",c()},o.onchange=()=>{var l;const u=(l=o.selectedOptions[0])==null?void 0:l.textContent.match(/\(([\d.]+)\)$/);u&&(r.body.querySelector("[name=plannedQty]").value=u[1].replace(/\./g,""))},a.orderId&&c(),r.body.querySelector("[data-close]").onclick=r.close,r.body.querySelector("#jf").onsubmit=u=>{u.preventDefault();const l=Object.fromEntries(new FormData(u.target));l.plannedQty=Number(l.plannedQty),l.assigneeId?l.assigneeId=Number(l.assigneeId):delete l.assigneeId,Ne(u.submitter,async()=>{const d=await I.post("/jt/jobs",l);P(`${d.data.jobNo} oluşturuldu`,"success"),r.close(),t==null||t()})}}const wn=Object.freeze(Object.defineProperty({__proto__:null,jobForm:Pa,openJob:Tt,render:xi,setFilter:wi},Symbol.toStringTag,{value:"Module"}));let ot=90,Ue="score";const xn={score:"Skor",onTimePct:"Zamanında %",completed:"Tamamlanan",overdueJobs:"Geciken",openJobs:"Açık iş"},Yt=(e,a=80,t=60)=>e==null?"":e>=a?"good":e>=t?"warn":"bad";async function Ta(e,a){e.innerHTML=Ce();let t;try{t=(await I.get(`/jt/performance?days=${ot}`)).data}catch(n){e.innerHTML=Ae(n);return}const s=ve("jt.performance.all"),i=[...t.rows].sort((n,o)=>Ue==="overdueJobs"||Ue==="openJobs"?o[Ue]-n[Ue]:(o[Ue]??-1)-(n[Ue]??-1));e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${[30,90,180].map(n=>`<button class="${ot===n?"active":""}" data-days="${n}">Son ${n} gün</button>`).join("")}</div>
      ${s?`<select id="jt-sort" aria-label="Sırala">${Object.entries(xn).map(([n,o])=>`<option value="${n}" ${n===Ue?"selected":""}>Sırala: ${o}</option>`).join("")}</select>`:""}
      ${Ee("jt-export-perf")}
    </div>
    <div class="jt-mini-kpis wide">
      <div><small>Kişi</small><b>${t.summary.people}</b></div>
      <div><small>Tamamlanan iş</small><b>${se(t.summary.completed)}</b></div>
      <div><small>Zamanında tamamlama</small><b class="${Yt(t.summary.onTimePct)}">${t.summary.onTimePct==null?"—":"%"+t.summary.onTimePct}</b></div>
      <div><small>Skor nasıl hesaplanır?</small><b class="tiny">%60 zamanında · %20 düşük fire · %20 gecikmiş açık iş yükü</b></div>
    </div>
    ${i.length?`
    <div class="jt-table-wrap"><table class="jt-table perf">
      <thead><tr><th>Kişi</th><th class="c">Skor</th><th>Zamanında</th><th class="r">Biten</th><th class="r">Geç</th><th class="r">Ort. gecikme</th><th class="r">Açık / geciken</th><th class="r">Fire</th><th class="r">Üretilen</th></tr></thead>
      <tbody>${i.map(n=>`<tr data-user="${n.id}" tabindex="0">
        <td data-label="Kişi">${it(n.name,n.title||n.roleLabel)}</td>
        <td data-label="Skor" class="c">${ki(n.score,46)}</td>
        <td data-label="Zamanında"><div class="jt-mini">${Je(n.onTimePct,Yt(n.onTimePct))}<small>${n.onTimePct==null?"—":"%"+n.onTimePct}</small></div></td>
        <td data-label="Biten" class="r">${n.completed}</td>
        <td data-label="Geç" class="r ${n.late?"bad":""}">${n.late}</td>
        <td data-label="Ort. gecikme" class="r">${n.avgDelayDays?n.avgDelayDays+" gün":"—"}</td>
        <td data-label="Açık / geciken" class="r">${n.openJobs} / <b class="${n.overdueJobs?"bad":""}">${n.overdueJobs}</b></td>
        <td data-label="Fire" class="r">${n.scrapPct?"%"+n.scrapPct:"—"}</td>
        <td data-label="Üretilen" class="r">${se(n.producedQty)}</td>
      </tr>`).join("")}</tbody></table></div>`:De("ph-gauge","Bu dönemde performans verisi yok.")}`,e.onclick=n=>{const o=n.target.closest("[data-days]");if(o)return ot=Number(o.dataset.days),Ta(e,a);if(n.target.closest("#jt-export-perf"))return ye(`Performans son ${ot} gun`,[["Kişi","name"],["Unvan","title"],["Bölüm","department"],["Rol","roleLabel"],["Skor",u=>u.score],["Zamanında %",u=>u.onTimePct],["Tamamlanan",u=>u.completed],["Geç biten",u=>u.late],["Ort. gecikme (gün)",u=>u.avgDelayDays],["Açık iş",u=>u.openJobs],["Geciken açık iş",u=>u.overdueJobs],["Fire %",u=>u.scrapPct],["Üretilen",u=>u.producedQty]],i);const c=n.target.closest("[data-user]");c&&Vt(c.dataset.user,a)},e.onkeydown=n=>{if(n.key==="Enter"){const o=n.target.closest("[data-user]");o&&Vt(o.dataset.user,a)}};const r=e.querySelector("#jt-sort");r&&(r.onchange=()=>{Ue=r.value,Ta(e,a)})}function Sn(e){const s=Math.max(3,...e.map(r=>r.done)),i=360/e.length;return`<svg viewBox="0 0 360 138" class="jt-chart small">${e.map((r,n)=>{const o=n*i+i*.2,c=i*.6,u=r.done/s*120,l=r.onTime/s*120;return`<rect x="${o}" y="${120-u}" width="${c}" height="${u}" rx="3" class="late"><title>${r.month}: ${r.done} iş</title></rect><rect x="${o}" y="${120-l}" width="${c}" height="${l}" rx="3" class="on"><title>${r.onTime} zamanında</title></rect><text x="${o+c/2}" y="134" text-anchor="middle" class="axis">${r.month.slice(5)}</text>`}).join("")}</svg>`}async function Vt(e,a){const t=Fe({title:"Kişi performansı",body:Ce(),wide:!0});let s;try{s=(await I.get(`/jt/performance/${encodeURIComponent(e)}?days=${ot}`)).data}catch(i){t.body.innerHTML=Ae(i);return}t.setTitle(s.name),t.body.innerHTML=`
    <div class="jt-perf-head">${ki(s.score,76)}<div>${it(s.name,`${s.title||""} · ${s.department||""}`)}<small class="muted">Son ${ot} gün · ${h(s.roleLabel||"")}</small></div></div>
    <div class="jt-mini-kpis wide">
      <div><small>Zamanında</small><b class="${Yt(s.onTimePct)}">${s.onTimePct==null?"—":"%"+s.onTimePct}</b></div>
      <div><small>Tamamlanan</small><b>${s.completed}</b></div>
      <div><small>Geç biten</small><b class="${s.late?"bad":""}">${s.late}</b></div>
      <div><small>Ort. gecikme</small><b>${s.avgDelayDays?s.avgDelayDays+" gün":"—"}</b></div>
      <div><small>Açık iş</small><b>${s.openJobs}</b></div>
      <div><small>Geciken açık iş</small><b class="${s.overdueJobs?"bad":""}">${s.overdueJobs}</b></div>
      <div><small>Fire oranı</small><b>${s.scrapPct?"%"+s.scrapPct:"—"}</b></div>
      <div><small>Üretilen adet</small><b>${se(s.producedQty)}</b></div>
    </div>
    <div class="jt-cols tight">
      <section class="jt-card flat"><div class="jt-card-h"><h3>Aylık tamamlanan iş</h3><span class="jt-legend"><i class="on"></i>zamanında <i class="late"></i>toplam</span></div>${Sn(s.monthly)}</section>
      <section class="jt-card flat"><div class="jt-card-h"><h3>Süreç bazında</h3></div>
        ${s.byProcess.length?s.byProcess.map(i=>`<div class="jt-proc-bars single"><span>${h(i.name)}</span>${Je(i.done?i.onTime/i.done*100:0,Yt(i.done?i.onTime/i.done*100:null))}<small>${i.onTime}/${i.done} zamanında</small></div>`).join(""):'<small class="muted">Tamamlanmış iş yok.</small>'}
      </section>
    </div>
    <h4 class="jt-h">Son işler</h4>
    ${s.jobs.map(i=>`<button class="jt-row" data-job="${h(i.id)}"><span class="jt-row-main"><b>${h(i.jobNo)} · ${h(i.title)}</b><small>${h(i.projectCode||"")} · bitiş ${qe(i.plannedEnd)}</small></span><span class="jt-row-side">${Zt(i)}</span></button>`).join("")||De("ph-list-checks","İş yok.")}`,t.body.onclick=i=>{const r=i.target.closest("[data-job]");r&&a.openJob(r.dataset.job)}}const Tn=Object.freeze(Object.defineProperty({__proto__:null,openUser:Vt,render:Ta},Symbol.toStringTag,{value:"Module"})),Ln={critical:["ph-warning-octagon","Kritik"],warning:["ph-warning","Uyarı"],info:["ph-info","Bilgi"]};let Xe="all",ca=!1;async function Ft(e,a){e.innerHTML=Ce();let t;try{t=(await I.get(`/jt/alerts${ca?"?all=1":""}`)).data}catch(r){e.innerHTML=Ae(r);return}a.setAlertCounts(t.counts);const s=t.alerts.filter(r=>Xe==="all"||r.severity===Xe),i=t.counts;e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">
        <button class="${Xe==="all"?"active":""}" data-sev="all">Tümü <em>${i.critical+i.warning+i.info}</em></button>
        <button class="${Xe==="critical"?"active":""}" data-sev="critical">Kritik <em class="bad">${i.critical}</em></button>
        <button class="${Xe==="warning"?"active":""}" data-sev="warning">Uyarı <em>${i.warning}</em></button>
        <button class="${Xe==="info"?"active":""}" data-sev="info">Bilgi <em>${i.info}</em></button>
      </div>
      <label class="jt-toggle"><input type="checkbox" id="f-acked" ${ca?"checked":""}/> Kapatılanları göster</label>
    </div>
    <div class="jt-alerts">
      ${s.length?s.map(r=>{var n,o;return`
        <article class="jt-alert-card ${r.severity} ${r.acked?"acked":""}">
          <i class="ph ${Ln[r.severity][0]}"></i>
          <div class="body" data-link="${h(((n=r.link)==null?void 0:n.type)||"")}:${h(((o=r.link)==null?void 0:o.id)||"")}">
            <b>${h(r.title)}</b>
            <p>${h(r.message)}</p>
            <small>${r.assigneeName?"Sorumlu: "+h(r.assigneeName)+" · ":""}${r.dueDate?"Tarih: "+qe(r.dueDate):""}${r.acked?" · kapatıldı":""}</small>
          </div>
          ${ve("jt.alerts.ack")&&!r.acked?`<button class="btn btn-secondary jt-ack" data-ack="${h(r.key)}" title="Uyarıyı kapat"><i class="ph ph-check"></i> Kapat</button>`:""}
        </article>`}).join(""):De("ph-bell-slash","Açık uyarı yok. Her şey planlandığı gibi.")}
    </div>`,e.onclick=r=>{const n=r.target.closest("[data-sev]");if(n)return Xe=n.dataset.sev,Ft(e,a);const o=r.target.closest("[data-ack]");if(o)return Ne(o,async()=>{await I.post("/jt/alerts/ack",{key:o.dataset.ack}),P("Uyarı kapatıldı","success"),Ft(e,a)});const c=r.target.closest("[data-link]");c&&a.openLink(c.dataset.link)},e.querySelector("#f-acked").onchange=r=>{ca=r.target.checked,Ft(e,a)}}const En=Object.freeze(Object.defineProperty({__proto__:null,render:Ft},Symbol.toStringTag,{value:"Module"}));async function wt(e,a){e.innerHTML=Ce();let t,s;try{[t,s]=(await Promise.all([I.get("/jt/users"),I.get("/jt/roles")])).map(n=>n.data)}catch(n){e.innerHTML=Ae(n);return}const{roles:i,permissions:r}=s;e.innerHTML=`
    <div class="jt-toolbar"><h3 class="jt-title">Kullanıcılar</h3><button class="btn btn-primary jt-add" id="jt-new-user"><i class="ph ph-user-plus"></i> Yeni kullanıcı</button></div>
    <div class="jt-table-wrap"><table class="jt-table">
      <thead><tr><th>Kişi</th><th>Kullanıcı adı</th><th>Rol</th><th>Bölüm</th><th>Durum</th></tr></thead>
      <tbody>${t.map(n=>`<tr data-user="${n.id}" tabindex="0" class="${n.active?"":"off"}">
        <td data-label="Kişi"><span class="jt-person">${yi(n.name,30)}<span><b>${h(n.name)}</b><small>${h(n.title||"")}</small></span></span></td>
        <td data-label="Kullanıcı adı"><code>${h(n.username)}</code></td>
        <td data-label="Rol"><span class="jt-role"><i class="ph ${Va[n.role]||"ph-user"}"></i> ${h(n.roleLabel||n.role)}</span></td>
        <td data-label="Bölüm">${h(n.department||"—")}</td>
        <td data-label="Durum">${n.active?Oe("Aktif","done"):Oe("Pasif","cancelled")}</td></tr>`).join("")}</tbody></table></div>

    <div class="jt-toolbar"><h3 class="jt-title">Roller ve yetkiler</h3><small class="muted">Bir rolün yetkilerini değiştirince o roldeki herkes için geçerli olur. Yönetici rolü sabittir.</small></div>
    <div class="jt-table-wrap"><table class="jt-table matrix">
      <thead><tr><th>Yetki</th>${i.map(n=>`<th class="c"><i class="ph ${Va[n.id]||"ph-user"}"></i><small>${h(n.label)}</small></th>`).join("")}</tr></thead>
      <tbody>${r.map(n=>`<tr><td>${h(n.label)}<small><code>${h(n.id)}</code></small></td>${i.map(o=>`<td class="c"><input type="checkbox" data-role="${h(o.id)}" data-perm="${h(n.id)}" ${o.permissions.includes(n.id)?"checked":""} ${o.id==="admin"||n.id==="jt.view"?"disabled":""} aria-label="${h(o.label)}: ${h(n.label)}" /></td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`,e.onclick=n=>{if(n.target.closest("#jt-new-user"))return da(null,i,()=>wt(e));const o=n.target.closest("[data-user]");o&&da(t.find(c=>String(c.id)===o.dataset.user),i,()=>wt(e))},e.onkeydown=n=>{if(n.key==="Enter"){const o=n.target.closest("[data-user]");o&&da(t.find(c=>String(c.id)===o.dataset.user),i,()=>wt(e))}},e.onchange=n=>{const o=n.target.closest("[data-perm]");if(!o)return;const c=i.find(l=>l.id===o.dataset.role),u=new Set(c.permissions);o.checked?u.add(o.dataset.perm):u.delete(o.dataset.perm),Ne(o,async()=>{try{await I.put(`/jt/roles/${encodeURIComponent(c.id)}`,{permissions:[...u]}),c.permissions=[...u],P("Yetki güncellendi","success")}catch(l){throw o.checked=!o.checked,l}})}}function da(e,a,t){const s=!!e,i=Fe({title:s?e.name:"Yeni kullanıcı",body:`
    <form class="jt-form" id="uf">
      <div class="jt-2">
        ${re("Ad soyad",`<input name="name" required maxlength="80" value="${h((e==null?void 0:e.name)||"")}" />`)}
        ${re("Kullanıcı adı",`<input name="username" required minlength="3" maxlength="40" pattern="[a-z0-9._-]+" value="${h((e==null?void 0:e.username)||"")}" ${s?"disabled":""} placeholder="ad.soyad" />`)}
      </div>
      <div class="jt-2">
        ${re("Rol",`<select name="role">${ke(a.map(o=>[o.id,o.label]),(e==null?void 0:e.role)||"operator")}</select>`)}
        ${re("Bölüm",`<input name="department" maxlength="60" value="${h((e==null?void 0:e.department)||"")}" />`)}
      </div>
      <div class="jt-2">
        ${re("Unvan",`<input name="title" maxlength="80" value="${h((e==null?void 0:e.title)||"")}" />`)}
        ${re("Telefon",`<input name="phone" maxlength="30" value="${h((e==null?void 0:e.phone)||"")}" />`)}
      </div>
      ${re("E-posta",`<input type="email" name="email" maxlength="80" value="${h((e==null?void 0:e.email)||"")}" />`)}
      ${s?`<label class="jt-toggle"><input type="checkbox" name="active" ${e.active?"checked":""}/> Hesap aktif</label>`:'<p class="muted small">Kayıttan sonra tek seferlik geçici şifre gösterilir; kullanıcı ilk girişte şifresini değiştirmelidir.</p>'}
      <div class="jt-actions">
        ${s?'<button type="button" class="btn btn-secondary" id="uf-reset"><i class="ph ph-key"></i> Şifreyi sıfırla</button>':""}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>`});i.body.querySelector("[data-close]").onclick=i.close;const r=(o,c)=>{const u=Fe({title:c,body:`<div class="jt-secret"><p><b>${h(o.data.username)}</b> için geçici şifre:</p><code>${h(o.data.temporaryPassword)}</code><p class="muted small">Bu şifre yalnızca şimdi gösterilir. Kullanıcıya güvenli bir yolla iletin; ilk girişte değiştirmesi istenecek.</p><div class="jt-actions"><button class="btn btn-primary" data-close>Tamam</button></div></div>`});u.body.querySelector("[data-close]").onclick=u.close};i.body.querySelector("#uf").onsubmit=o=>{o.preventDefault();const c=Object.fromEntries(new FormData(o.target));s&&(c.active=o.target.active.checked),Ne(o.submitter,async()=>{const u=s?await I.put(`/jt/users/${e.id}`,c):await I.post("/jt/users",c);i.close(),t==null||t(),s?P("Kullanıcı güncellendi","success"):r(u,"Kullanıcı oluşturuldu")})};const n=i.body.querySelector("#uf-reset");n&&(n.onclick=()=>Ne(n,async()=>{if(!await Le({title:"Şifre sıfırlansın mı?",message:`${e.name} için yeni bir geçici şifre oluşturulacak. Eski şifresi çalışmaz.`,confirmLabel:"Şifreyi sıfırla",danger:!0}))return;const c=await I.post(`/jt/users/${e.id}/reset-password`,{});i.close(),r(c,"Şifre sıfırlandı")}))}const An=Object.freeze(Object.defineProperty({__proto__:null,render:wt},Symbol.toStringTag,{value:"Module"})),Mn=[["overview","Özet","ph-squares-four",()=>!0],["projects","Projeler","ph-folders",()=>!0],["orders","Siparişler","ph-package",()=>!0],["jobs","İşler","ph-list-checks",()=>!0],["performance","Performans","ph-gauge",()=>ve("jt.performance.all")||ve("jt.performance.own")],["alerts","Uyarılar","ph-bell-ringing",()=>!0],["team","Ekip & Yetki","ph-lock-key",()=>ve("jt.users.manage")]],jn={overview:fn,projects:yn,orders:$n,jobs:wn,performance:Tn,alerts:En,team:An};function qn(){var l;const e=document.createElement("div");e.className="page-container page-jobs",e.appendChild(ue({title:((l=F.modules.jobTracking)==null?void 0:l.label)||"İş & Durum Takip",showBack:!0,gradientClass:"gradient-stock"}));const a=document.createElement("div");a.className="content-area",a.innerHTML=Ce(),e.appendChild(a);let s=Z.getQueryParams().tab||sessionStorage.getItem("jt_tab")||"overview",i=null;const r={go(d,m={}){d==="jobs"&&wi(m),o(d)},openJob:(d,m)=>Tt(d,r,m||c),openOrder:(d,m)=>Gt(d,r,m||c),openProject:(d,m)=>Ut(d,r,m||c),openUser:d=>Vt(d,r),newJob:(d,m)=>Pa(r,d,m||c),openLink(d){const[m,p]=String(d).split(":");p&&(m==="job"?r.openJob(p):m==="order"?r.openOrder(p):m==="project"?r.openProject(p):m==="user"&&r.openUser(p))},setAlertCounts(d){de.alertCounts=d;const m=(d.critical||0)+(d.warning||0),p=e.querySelector('[data-tab="alerts"] .jt-badge-n');p&&(p.textContent=m,p.hidden=!m,p.classList.toggle("crit",!!d.critical))}};function n(){const d=Mn.filter(m=>m[3]());d.some(m=>m[0]===s)||(s="overview"),a.innerHTML=`
      <div class="jt-user"><span><i class="ph ph-user-circle"></i> ${h(de.me.name)} <em>${h(de.me.roleLabel||de.me.role)}</em></span></div>
      <nav class="jt-tabs" role="tablist">${d.map(([m,p,v])=>`<button role="tab" class="${m===s?"active":""}" data-tab="${m}"><i class="ph ${v}"></i><span>${p}</span>${m==="alerts"?'<b class="jt-badge-n" hidden></b>':""}</button>`).join("")}</nav>
      <div id="jt-view" class="jt-view"></div>`,r.setAlertCounts(de.alertCounts),a.querySelector(".jt-tabs").onclick=m=>{const p=m.target.closest("[data-tab]");p&&o(p.dataset.tab)}}function o(d){s=d,sessionStorage.setItem("jt_tab",s),a.querySelectorAll(".jt-tabs button").forEach(p=>p.classList.toggle("active",p.dataset.tab===s));const m=a.querySelector("#jt-view");m&&(m.onclick=null,jn[s].render(m,r))}const c=()=>o(s);async function u(){if(!e.isConnected){clearInterval(i);return}try{const d=(await I.get("/jt/alerts")).data;r.setAlertCounts(d.counts);const m=new Set(JSON.parse(sessionStorage.getItem("jt_seen")||"[]")),p=d.alerts.filter(v=>v.severity==="critical"&&!m.has(v.key));p.length&&m.size&&P(`${p.length} yeni kritik uyarı: ${p[0].title}`,"warning",6e3),d.alerts.forEach(v=>m.add(v.key)),sessionStorage.setItem("jt_seen",JSON.stringify([...m].slice(-300)))}catch{}}return(async()=>{try{if(await wa(!0),!ve("jt.view")){a.innerHTML=Ae({message:"İş takip modülünü görme yetkiniz yok."});return}n(),o(s),u(),i=setInterval(u,6e4)}catch(d){const m=/404|Bulunamad/i.test(d.message||"");a.innerHTML=Ae({message:m?"Bu şirketin backend’i İş Takip modülünü desteklemiyor. Yönetim Paneli > Bağlantı bölümünden doğru API adresini seçin veya modülü kapatın.":d.message})}})(),e}const It=e=>Number(e||0).toLocaleString("tr-TR");async function Nn(e){e.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';let a=[],t=[],s=[],i="",r="",n=!1;const o=new Set;async function c(){const[L,b,E]=await Promise.all([I.get("/products"),I.get("/warehouses"),I.get("/warehouse-balances")]);a=L.success?L.data:[],t=b.success?b.data:[],s=E.success?E.data:[]}try{await c()}catch(L){e.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${h(L.message)}</div></div>`;return}e.innerHTML=`
    <div class="sm-toolbar">
      <div class="input-field sm-search">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="search" id="sm-q" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" />
      </div>
      <div class="input-field sm-wh">
        <span class="input-icon"><i class="ph ph-warehouse"></i></span>
        <select id="sm-wh" class="input-element">
          <option value="">Tüm depolar</option>
          ${t.map(L=>`<option value="${h(L.id)}">${h(L.name)}</option>`).join("")}
        </select>
      </div>
      <label class="sm-check"><input type="checkbox" id="sm-stocked" /> Yalnızca stoklu ürünler</label>
    </div>
    <div class="sm-summary" id="sm-summary"></div>
    <div id="sm-list"></div>`;const u=e.querySelector("#sm-list"),l=e.querySelector("#sm-summary"),d=(L,b)=>{var E;return((E=s.find(y=>y.productId===L&&y.warehouseId===b))==null?void 0:E.qty)||0},m=L=>r?[t.find(b=>b.id===r)].filter(Boolean):t.filter(b=>d(L.id,b.id)>0);function p(L,b){const E=d(L.id,b.id);return`
      <div class="sm-row" data-wid="${h(b.id)}">
        <span class="sm-wh-name"><i class="ph ph-warehouse"></i> ${h(b.name)}</span>
        <div class="sm-stepper">
          <button type="button" data-act="dec" aria-label="Azalt" ${E<=0?"disabled":""}><i class="ph ph-minus"></i></button>
          <input type="number" min="0" step="1" value="${E}" data-role="qty" inputmode="numeric" aria-label="Depodaki miktar" />
          <button type="button" data-act="inc" aria-label="Artır"><i class="ph ph-plus"></i></button>
        </div>
      </div>`}function v(){const L=i.toLocaleLowerCase("tr");let b=a.filter(y=>!L||[y.name,y.code,y.barcode].some(T=>String(T||"").toLocaleLowerCase("tr").includes(L)));n&&(b=b.filter(y=>y.stock>0));const E=b.reduce((y,T)=>y+(T.stock||0),0);if(l.innerHTML=`<b>${It(b.length)}</b> ürün · toplam <b>${It(E)}</b> adet stok`,!b.length){u.innerHTML='<div class="empty-state"><div class="empty-icon"><i class="ph ph-package"></i></div><div class="empty-text">Ürün bulunamadı</div></div>';return}u.innerHTML=b.map(y=>{const T=m(y),M=t.filter(N=>!T.some(q=>q.id===N.id));return`
      <div class="sm-card" data-pid="${h(y.id)}">
        <div class="sm-head">
          <div class="sm-title">
            <div class="sm-name">${h(y.name)}</div>
            <div class="sm-meta">${h(y.code||"")}${y.barcode?" · "+h(y.barcode):""}${y.category?" · "+h(y.category):""}</div>
          </div>
          <div class="sm-total ${y.stock<=0?"zero":""}"><b>${It(y.stock)}</b><span>${h(y.unit||"Adet")}</span></div>
          <button type="button" class="sm-del" data-act="delete" title="Ürünü sil" aria-label="Ürünü sil"><i class="ph ph-trash"></i></button>
        </div>
        ${T.length?T.map(N=>p(y,N)).join(""):'<div class="sm-empty">Hiçbir depoda stok yok.</div>'}
        ${M.length?`
        <div class="sm-add">
          <select data-role="add-wh" aria-label="Depo seç">
            <option value="">Başka depoya stok ekle…</option>
            ${M.map(N=>`<option value="${h(N.id)}">${h(N.name)}</option>`).join("")}
          </select>
          <input type="number" data-role="add-qty" min="1" step="1" placeholder="Adet" inputmode="numeric" />
          <button type="button" class="btn btn-secondary" data-act="add"><i class="ph ph-plus"></i> Ekle</button>
        </div>`:""}
      </div>`}).join("")}async function k(L,b,E){const y=L+"|"+b;if(!o.has(y)){o.add(y);try{const T=await I.post("/stock-adjust",{productId:L,warehouseId:b,...E});if(!T.success)throw new Error(T.message||"Güncellenemedi");const{before:M,after:N}=T.data,q=a.find(D=>D.id===L);q&&(q.stock=Math.max(0,(q.stock||0)+(N-M)));const S=s.find(D=>D.productId===L&&D.warehouseId===b);S?S.qty=N:s.push({productId:L,warehouseId:b,qty:N}),P(T.message,"success")}catch(T){P(T.message,"error")}finally{o.delete(y),v()}}}u.addEventListener("click",async L=>{const b=L.target.closest("[data-act]");if(!b)return;const E=b.closest(".sm-card"),y=E.dataset.pid,T=a.find(N=>N.id===y),M=b.dataset.act;if(M==="inc"||M==="dec")k(y,b.closest(".sm-row").dataset.wid,{delta:M==="inc"?1:-1});else if(M==="add"){const N=E.querySelector('[data-role="add-wh"]').value,q=parseInt(E.querySelector('[data-role="add-qty"]').value,10);if(!N)return P("Depo seçin","warning");if(!(q>0))return P("Geçerli bir adet girin","warning");k(y,N,{delta:q})}else if(M==="delete"){const N=(T.stock||0)>0;if(!await Le({title:"Ürün silinsin mi?",message:N?`"${T.name}" ürününde ${It(T.stock)} adet stok var. Silerseniz stok kaydı da silinir. Bu işlem geri alınamaz.`:`"${T.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,confirmLabel:"Sil",danger:!0}))return;try{const S=await I.delete(`/products/${encodeURIComponent(y)}${N?"?force=1":""}`);if(!S.success)throw new Error(S.message);a=a.filter(D=>D.id!==y),s=s.filter(D=>D.productId!==y),P(S.message,"success"),v()}catch(S){P(S.message,"error")}}}),u.addEventListener("change",L=>{const b=L.target.closest('[data-role="qty"]');if(!b)return;const E=b.closest(".sm-card").dataset.pid,y=b.closest(".sm-row").dataset.wid,T=parseInt(b.value,10);if(!(T>=0))return P("Geçerli bir miktar girin","warning"),v();T!==d(E,y)&&k(E,y,{setTo:T,reason:"Elle düzeltme"})}),u.addEventListener("keydown",L=>{L.key==="Enter"&&L.target.matches("input")&&(L.preventDefault(),L.target.blur())});let w;e.querySelector("#sm-q").addEventListener("input",L=>{clearTimeout(w),w=setTimeout(()=>{i=L.target.value.trim(),v()},150)}),e.querySelector("#sm-wh").addEventListener("change",L=>{r=L.target.value,v()}),e.querySelector("#sm-stocked").addEventListener("change",L=>{n=L.target.checked,v()}),v()}const Cn=["Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj","Genel"],Dn=["Adet","Kova","Kutu","Şişe","Bidon","Paket","Kg","Litre"];function In(){const e=document.createElement("div");e.className="page-stock-detail page-container";const a=ue({title:Et("stokDetay","Stok Detay"),gradientClass:"gradient-stock"});e.appendChild(a);const t=document.createElement("div");return t.className="content-area",t.innerHTML=`
    <div class="seg-tabs" role="tablist">
      <button type="button" class="seg-tab active" data-view="query" role="tab"><i class="ph ph-magnifying-glass"></i> Sorgula</button>
      <button type="button" class="seg-tab" data-view="manage" role="tab"><i class="ph ph-sliders-horizontal"></i> Stok Yönetimi</button>
    </div>
    <div id="view-manage" hidden></div>
    <div id="view-query">
    <!-- Search & Scanner -->
    <div class="stock-search-section animate-fade-in-up">
      <div class="stock-search-label"><i class="ph ph-warehouse"></i> Depo Stokları & Barkod</div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-buildings"></i></span>
          <select id="warehouse-select" class="input-element">
            <option value="">Depo Seçiliyor...</option>
          </select>
        </div>
      </div>

      <div class="search-input-row" style="margin-bottom: 10px;">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="stock-search-input" placeholder="Barkod veya Stok Kodu..." />
        </div>
        <button class="search-btn gradient-stock" id="stock-search-btn"><i class="ph ph-magnifying-glass"></i></button>
      </div>

      <button class="btn btn-primary btn-block" id="btn-scan-barcode" style="background: var(--color-stock);">
        <i class="ph ph-camera"></i> Kamera ile Barkod Okut
      </button>
    </div>

    <!-- Result -->
    <div id="stock-result-area"></div>
    </div>
  `,e.appendChild(t),setTimeout(async()=>{var b;const s=e.querySelector("#stock-search-input"),i=e.querySelector("#stock-search-btn"),r=e.querySelector("#btn-scan-barcode"),n=e.querySelector("#warehouse-select"),o=e.querySelector("#stock-result-area");let c=[],u=[],l=[];try{const[E,y,T]=await Promise.all([I.getWarehouses(),I.get("/products"),I.get("/warehouse-balances")]);E.success&&(u=E.data),y.success&&(c=y.data),T.success&&(l=T.data),n.innerHTML='<option value="">Tüm Depolar</option>'+u.map(M=>`<option value="${M.id}">${h(M.name)}</option>`).join("")}catch(E){console.error("Veri yükleme hatası:",E)}async function d(){try{const[E,y]=await Promise.all([I.get("/products"),I.get("/warehouse-balances")]);E.success&&(c=E.data),y.success&&(l=y.data)}catch{}}function m(E){var M;const y=E||((M=s==null?void 0:s.value)==null?void 0:M.trim()),T=n.value;o.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>',setTimeout(()=>{let N=c;if(y){const q=y.toLowerCase();N=N.filter(S=>S.code&&S.code.toLowerCase().includes(q)||S.barcode&&S.barcode===y||S.name&&S.name.toLowerCase().includes(q))}N.length>0?v(N,o,T):p(y,o,T)},200)}function p(E,y,T){y.innerHTML=`
        <div class="card animate-fade-in-up" style="margin-top:15px; padding:20px;">
          <div style="text-align:center; margin-bottom:18px;">
            <div style="font-size:40px; margin-bottom:8px; color:var(--text-tertiary);"><i class="ph ph-package"></i></div>
            <div style="font-weight:700; font-size:17px; color:var(--text-primary);">Ürün Bulunamadı</div>
            <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">Bu barkod sistemde kayıtlı değil. Yeni ürün olarak kaydedebilirsiniz.</div>
          </div>
          
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Barkod</label>
            <input type="text" class="input-element" value="${E||""}" id="new-prod-barcode" style="background:#f5f5f5;" readonly />
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Ürün Adı *</label>
            <input type="text" class="input-element" placeholder="Örn: Çikolata Sosu 5kg" id="new-prod-name" />
          </div>
          <div style="display:flex; gap:10px; margin-bottom:12px;">
            <div class="form-group" style="flex:1;">
              <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Kategori</label>
              <select class="input-element" id="new-prod-category">
                ${Cn.map(N=>`<option value="${N}">${N}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Birim</label>
              <select class="input-element" id="new-prod-unit">
                ${Dn.map(N=>`<option value="${N}">${N}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Başlangıç Miktarı</label>
            <input type="number" class="input-element" value="1" min="1" id="new-prod-qty" />
          </div>
          <button class="btn btn-primary btn-block" id="btn-save-new-prod" style="padding:14px; font-size:15px;">
            <i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet
          </button>
        </div>
      `;const M=e.querySelector("#btn-save-new-prod");M==null||M.addEventListener("click",async()=>{const N=e.querySelector("#new-prod-barcode").value,q=e.querySelector("#new-prod-name").value.trim(),S=e.querySelector("#new-prod-category").value,D=e.querySelector("#new-prod-unit").value,B=e.querySelector("#new-prod-qty").value;if(!q)return P("Lütfen ürün adı girin","warning");if(!B||B<=0)return P("Geçerli miktar girin","warning");M.disabled=!0,M.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const z=await I.post("/purchase",{barcode:N,name:q,quantity:B,warehouseId:T,category:S,unit:D});z.success?(P(z.message,"success"),await d(),m(N)):(P(z.message||"Hata oluştu","error"),M.disabled=!1,M.innerHTML='<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet')}catch(z){P("Kayıt hatası: "+z.message,"error"),M.disabled=!1,M.innerHTML='<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet'}})}function v(E,y,T){var q;const M=(q=u.find(S=>S.id===T))==null?void 0:q.name,N=(S,D)=>{var B;return((B=l.find(z=>z.productId===S&&z.warehouseId===D))==null?void 0:B.qty)||0};y.innerHTML=E.map((S,D)=>`
        <div class="stock-result-card animate-fade-in-up stagger-${D%5+1}" style="margin-top: 16px;">
          <div class="stock-result-header">
            <div class="stock-icon"><i class="ph ph-package"></i></div>
            <div>
              <div class="stock-name">${h(S.name)}</div>
              <div class="stock-code">${h(S.code)}</div>
            </div>
          </div>

          <div class="stock-chips">
            <span class="stock-chip varyant"><i class="ph ph-barcode"></i> ${S.barcode||"Barkod Yok"}</span>
            <span class="stock-chip zemin"><i class="ph ph-tag"></i> ${S.category||"Belirtilmedi"}</span>
            <span class="stock-chip net" style="background: var(--color-stock); color:white;">
              <i class="ph ph-archive"></i> ${T?"Toplam Stok":"Stok"}: ${S.stock} ${h(S.unit)}
            </span>
            ${T?`<span class="stock-chip" style="background: var(--success); color:white;"><i class="ph ph-warehouse"></i> ${M}: ${N(S.id,T)} ${h(S.unit)}</span>`:""}
          </div>
          ${T?"":`<div style="margin-top:8px; font-size:12px; color:var(--text-secondary);"><i class="ph ph-warehouse"></i> ${l.filter(B=>B.productId===S.id).map(B=>`${h(B.warehouseName)}: <b>${B.qty}</b>`).join(" &nbsp;•&nbsp; ")||"Depo kaydı yok"}</div>`}
          ${S.price?`<div style="margin-top:8px; font-size:13px; color:var(--text-secondary);"><i class="ph ph-currency-circle-dollar"></i> Birim Fiyat: ${S.price.toLocaleString("tr-TR")} ₺</div>`:""}
          
          <div style="margin-top:15px; border-top: 1px solid var(--border-color); padding-top:15px;">
            <div style="font-size:13px; font-weight:600; margin-bottom:10px;">Mal Kabul / Stok Ekle</div>
            <div style="display:flex; gap:10px;">
              <input type="number" id="add-qty-${S.id}" class="input-element" value="1" min="1" style="flex:1;" />
              <button class="btn btn-primary" id="btn-add-${S.id}" style="background: var(--success); flex:2;">
                <i class="ph ph-plus-circle"></i> Ekle
              </button>
            </div>
          </div>
        </div>
      `).join(""),E.forEach(S=>{const D=y.querySelector(`#btn-add-${S.id}`);D==null||D.addEventListener("click",async()=>{var z;const B=y.querySelector(`#add-qty-${S.id}`).value;if(!B||B<=0)return P("Geçerli miktar girin","warning");D.disabled=!0,D.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const _=await I.post("/purchase",{barcode:S.barcode,name:S.name,quantity:B,warehouseId:T});_.success?(P(_.message,"success"),await d(),m(((z=s==null?void 0:s.value)==null?void 0:z.trim())||"")):(P(_.message||"Hata","error"),D.disabled=!1,D.innerHTML='<i class="ph ph-plus-circle"></i> Ekle')}catch(_){P("Hata: "+_.message,"error"),D.disabled=!1,D.innerHTML='<i class="ph ph-plus-circle"></i> Ekle'}})})}i==null||i.addEventListener("click",()=>m()),mt(s,E=>{s.value=E,m(E)});const k=e.querySelector("#view-query"),w=e.querySelector("#view-manage");let L=!1;e.querySelectorAll(".seg-tab").forEach(E=>E.addEventListener("click",()=>{e.querySelectorAll(".seg-tab").forEach(T=>T.classList.toggle("active",T===E));const y=E.dataset.view==="manage";k.hidden=y,w.hidden=!y,y?(Nn(w),L=!0):L&&d().then(()=>m())})),n==null||n.addEventListener("change",()=>m()),r==null||r.addEventListener("click",()=>{pt(E=>{P("Barkod Okundu: "+E,"success"),s.value=E,m(E)})}),m(),Z.getQueryParams().tab==="manage"&&((b=e.querySelector('.seg-tab[data-view="manage"]'))==null||b.click())},0),e}function Pn(){const e=document.createElement("div");e.className="page-serial-detail page-container";const a=ue({title:Et("seriDetay","Seri Detay"),gradientClass:"gradient-serial"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <!-- Search -->
    <div class="animate-fade-in-up" style="margin-bottom: 20px;">
      <div class="stock-search-label"><i class="ph ph-magnifying-glass"></i> Seri Numarası Sorgula</div>
      <div class="search-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-device-mobile"></i></span>
          <input type="text" id="serial-search-input" placeholder="Seri numarası yazın..." />
        </div>
        <button class="search-btn gradient-serial" id="serial-search-btn"><i class="ph ph-magnifying-glass"></i></button>
      </div>
    </div>

    <div id="serial-result-area"></div>
  `,e.appendChild(t),setTimeout(()=>{const i=e.querySelector("#serial-search-input"),r=e.querySelector("#serial-search-btn");async function n(){var u;const o=(u=i==null?void 0:i.value)==null?void 0:u.trim();if(!o){P("Lütfen seri numarası girin","warning");return}const c=e.querySelector("#serial-result-area");c.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';try{const l=await I.get(`/serials/${encodeURIComponent(o)}`);l.success&&l.data?await s(l.data,c):c.innerHTML=`
            <div class="empty-state">
              <div class="empty-icon"><i class="ph ph-magnifying-glass"></i></div>
              <div class="empty-text">${h(l.message||"Seri bulunamadı")}</div>
            </div>
          `}catch(l){c.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${h(l.message)}</div></div>`}}r==null||r.addEventListener("click",n),i==null||i.addEventListener("keydown",o=>{o.key==="Enter"&&n()})},0);async function s(i,r){let n="MT",o={items:[],totalCount:0,totalQuantity:0};try{const u=await I.get(`/serials/${encodeURIComponent(i.serialNo)}/others`);u.success&&(o=u.data)}catch{}function c(){var l;const u=(l=i.prices)==null?void 0:l[n];r.innerHTML=`
        <!-- Seri Bilgi Kartı -->
        <div class="serial-info-card gradient-serial animate-fade-in-up">
          <div class="serial-info-inner">
            <div class="serial-no-row">
              <div class="serial-no-icon"><i class="ph ph-device-mobile"></i></div>
              <div>
                <div class="serial-no-label">Seri No</div>
                <div class="serial-no-value">${h(i.serialNo)}</div>
              </div>
            </div>
            <div class="serial-details-grid">
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-package"></i></span>
                <span class="detail-label">Miktar:</span>
                <span class="detail-value">${i.quantity}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-map-pin"></i></span>
                <span class="detail-label">Hücre:</span>
                <span class="detail-value">${h(i.cell)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-factory"></i></span>
                <span class="detail-label">Depo:</span>
                <span class="detail-value">${h(i.warehouseId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-office-chair"></i></span>
                <span class="detail-label">Şube:</span>
                <span class="detail-value">${h(i.branchId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-folder-open"></i></span>
                <span class="detail-label">Koleksiyon:</span>
                <span class="detail-value">${h(i.collection)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-palette"></i></span>
                <span class="detail-label">Eski Desen:</span>
                <span class="detail-value">${h(i.oldDesen)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fiyat Bilgileri -->
        <div class="animate-fade-in-up stagger-1" style="margin-top: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span><i class="ph ph-coins"></i></span>
            <h3 style="font-size: 16px; font-weight: 700;">Fiyat Bilgileri</h3>
          </div>

          <div class="card" style="padding: 16px;">
            <div class="tab-bar" style="margin-bottom: 16px;">
              ${Object.keys(i.prices||{}).map(d=>`
                <div class="tab-item ${n===d?"active":""}" data-tab="${d}" style="${n===d?"background: var(--secondary);":""}">${d}</div>
              `).join("")}
            </div>

            ${u?`
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                <span><i class="ph ph-currency-circle-dollar"></i></span>
                <span style="font-weight: 600;">Fiyat Tipi: ${n}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Kar Oranı</span>
                  <span style="font-weight: 800; color: var(--text-primary);">%${u.profitRate.toFixed(1)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Dolar</span>
                  <span style="font-weight: 800; color: var(--color-usd);">$${u.usd}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(230,126,34,0.06); border-radius: 10px; border: 1px solid rgba(230,126,34,0.15);">
                  <span style="font-weight: 600; color: var(--color-eur);">Euro</span>
                  <span style="font-weight: 800; color: var(--color-eur);">€${u.eur}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(231,76,60,0.06); border-radius: 10px; border: 1px solid rgba(231,76,60,0.15);">
                  <span style="font-weight: 600; color: var(--color-try);">TL</span>
                  <span style="font-weight: 800; color: var(--color-try);">${u.try} ₺</span>
                </div>
              </div>
            </div>
            `:""}
          </div>
        </div>

        <!-- Depodaki Diğer Seriler -->
        ${o.totalCount>0?`
        <div class="other-series-section animate-fade-in-up stagger-2">
          <div class="other-series-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span><i class="ph ph-map-pin"></i></span>
              <span class="series-count">Depodaki Diğer Seriler (${o.totalCount})</span>
            </div>
          </div>

          <div class="series-summary">
            <span class="summary-label"><i class="ph ph-package"></i> Toplam ${o.totalCount} Seri</span>
            <span class="summary-badge">Miktar: ${o.totalQuantity.toFixed(2)}</span>
          </div>

          <div class="series-list">
            ${o.items.map((d,m)=>`
              <div class="list-item" style="animation: fadeInUp 200ms ease ${m*60}ms forwards; opacity: 0;">
                <div class="list-icon" style="background: rgba(108,99,255,0.08); color: var(--primary);"><i class="ph ph-device-mobile"></i></div>
                <div class="list-content">
                  <div class="list-title">${h(d.serialNo)}</div>
                  <div class="list-subtitle">Miktar: ${d.quantity}</div>
                </div>
                <div class="list-action">▾</div>
              </div>
            `).join("")}
          </div>
        </div>
        `:""}
      `,r.querySelectorAll(".tab-item").forEach(d=>{d.addEventListener("click",()=>{n=d.dataset.tab,c()})})}c()}return e}const Pe=e=>String(e??"").replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]);function Rn(){const e=document.createElement("div");e.className="page-stock-count page-container";const a=ue({title:Lt("stockCount","Stok Sayım"),gradientClass:"gradient-primary"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <!-- Summary Card -->
    <div class="count-summary-card animate-fade-in-up">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px;"><i class="ph ph-chart-pie-slice" style="margin-right:5px; color:var(--primary);"></i>Sayım Özeti</div>
      <div class="count-stats">
        <div class="count-stat">
          <div class="count-value" id="sc-total">0</div>
          <div class="count-label">Toplam</div>
        </div>
        <div class="count-stat">
          <div class="count-value" id="sc-ok" style="color: var(--success);">0</div>
          <div class="count-label">Doğru</div>
        </div>
        <div class="count-stat">
          <div class="count-value" id="sc-diff" style="color: var(--error);">0</div>
          <div class="count-label">Farklı</div>
        </div>
      </div>
    </div>

    <!-- Depo Seçimi -->
    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 16px;">
      <div class="input-group">
        <label>Sayım Yapılacak Depo</label>
        <div class="select-field">
          <span class="select-icon"><i class="ph ph-factory"></i></span>
          <select id="sc-warehouse">
            <option value="">Depo Seçin</option>
          </select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>
    </div>

    <!-- Barcode -->
    <div class="barcode-section animate-fade-in-up stagger-2">
      <h3 class="barcode-title">Ürün Barkod / Seri No</h3>
      <div class="barcode-input-row">
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-barcode"></i></span>
          <input type="text" id="sc-barcode-input" placeholder="Barkod veya seri no..." />
        </div>
        <button class="camera-btn" id="sc-camera-btn" aria-label="Kamera ile okut"><i class="ph ph-camera"></i></button>
      </div>
    </div>

    <!-- Scanned items -->
    <div id="sc-items-list" style="margin-top: 16px;"></div>

    <!-- Result -->
    <div id="sc-result" style="margin-top: 16px;"></div>

    <!-- Actions -->
    <div style="display: flex; gap: 10px; margin-top: 20px;" class="animate-fade-in-up stagger-3">
      <button class="btn btn-block btn-lg" id="sc-clear" style="flex: 0 0 auto; background: var(--bg-input); color: var(--text-primary);" title="Listeyi temizle">
        <i class="ph ph-trash"></i>
      </button>
      <button class="btn btn-primary btn-block btn-lg" id="sc-submit" style="flex: 1;">
        <i class="ph ph-cloud-arrow-up" style="margin-right:5px;"></i>Sayımı Kaydet
      </button>
    </div>
  `,e.appendChild(t);const s=new Map;return setTimeout(async()=>{var l,d,m;const i=e.querySelector("#sc-warehouse");try{const p=await I.get("/warehouses");p.success&&(i.innerHTML='<option value="">Depo Seçin</option>'+p.data.map(v=>`<option value="${Pe(v.id)}">${Pe(v.code)} - ${Pe(v.name)}</option>`).join(""))}catch{}const r=p=>{s.set(p,(s.get(p)||0)+1),P(`Okunan: ${p}`,"success"),e.querySelector("#sc-result").innerHTML="",u()},n=e.querySelector("#sc-barcode-input"),o=mt(n,r);(l=e.querySelector("#sc-camera-btn"))==null||l.addEventListener("click",()=>pt(r)),(d=e.querySelector("#sc-clear"))==null||d.addEventListener("click",()=>{s.clear(),e.querySelector("#sc-result").innerHTML="",e.querySelector("#sc-diff").textContent=0,u()}),e.querySelector("#sc-items-list").addEventListener("click",p=>{const v=p.target.closest("button[data-code]");if(!v)return;const k=v.dataset.code;if(v.dataset.act==="inc")s.set(k,(s.get(k)||0)+1);else if(v.dataset.act==="dec"){const w=(s.get(k)||0)-1;w>0?s.set(k,w):s.delete(k)}else s.delete(k);u()}),(m=e.querySelector("#sc-submit"))==null||m.addEventListener("click",async()=>{const p=i.value;if(!p){P("Lütfen sayım yapılacak depoyu seçin","warning");return}if(o.flush(),s.size===0){P("Lütfen en az bir ürün okutun","warning");return}const v=e.querySelector("#sc-submit");v.disabled=!0,v.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const k=await I.post("/stock-count",{warehouseId:p,items:[...s].map(([w,L])=>({code:w,counted:L}))});k.success?(P(k.message,"success"),c(k.data),s.clear(),u(),e.querySelector("#sc-total").textContent=k.data.total||0,e.querySelector("#sc-ok").textContent=k.data.matched||0,e.querySelector("#sc-diff").textContent=k.data.diff||0):P(k.message||"Hata oluştu","error")}catch(k){P("Kayıt hatası: "+k.message,"error")}v.disabled=!1,v.innerHTML='<i class="ph ph-cloud-arrow-up" style="margin-right:5px;"></i>Sayımı Kaydet'});function c(p){const v=(p==null?void 0:p.details)||[];v.length&&(e.querySelector("#sc-result").innerHTML=`
        <div class="card animate-fade-in-up" style="padding: 14px;">
          <div style="font-weight: 700; margin-bottom: 8px;"><i class="ph ph-list-checks"></i> Sayım Sonucu</div>
          ${v.map(k=>`
            <div style="display:flex; justify-content:space-between; gap:10px; padding:8px 0; border-top:1px solid var(--divider); font-size:13px;">
              <div style="min-width:0;">
                <div style="font-weight:600;">${Pe(k.name||k.code)}</div>
                <div style="color:var(--text-secondary);">${Pe(k.code)}${k.known?"":" · sistemde kayıtlı değil"}</div>
              </div>
              <div style="text-align:right; white-space:nowrap;">
                <div>Sayılan: <b>${k.counted}</b> / Sistem: <b>${k.system}</b></div>
                <div style="font-weight:700; color:${k.diff===0?"var(--success)":"var(--error)"};">${k.diff===0?"Eşleşti":(k.diff>0?"+":"")+k.diff+" fark"}</div>
              </div>
            </div>`).join("")}
        </div>`)}function u(){const p=[...s.values()].reduce((k,w)=>k+w,0);e.querySelector("#sc-total").textContent=p,e.querySelector("#sc-ok").textContent=s.size;const v=e.querySelector("#sc-items-list");v.innerHTML=[...s].map(([k,w],L)=>`
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${L*40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: var(--color-stock-light); color: var(--color-stock);"><i class="ph ph-clipboard-text"></i></div>
          <div class="list-content">
            <div class="list-title">${Pe(k)}</div>
            <div class="list-subtitle">Sayılan adet: ${w}</div>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button data-act="dec" data-code="${Pe(k)}" aria-label="Azalt" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-minus"></i></button>
            <button data-act="inc" data-code="${Pe(k)}" aria-label="Arttır" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-plus"></i></button>
            <button data-act="del" data-code="${Pe(k)}" aria-label="Sil" style="width:28px;height:28px;border-radius:6px;background:var(--error-light);color:var(--error);cursor:pointer;"><i class="ph ph-x"></i></button>
          </div>
        </div>
      `).join("")}},0),e}function Bn(){const e=document.createElement("div");e.className="page-reports page-container";const a=ue({title:Lt("reports","Raporlar"),gradientClass:"gradient-reports"});e.appendChild(a);const t=document.createElement("div");t.className="content-area";const s=F.reportTypes;return t.innerHTML=`
    <div class="report-grid">
      ${s.map((i,r)=>`
        <div class="report-card animate-fade-in-up stagger-${r+1}" data-color="${i.color}" data-route="${i.route}" id="report-${i.id}">
          <div class="report-icon">${i.icon}</div>
          <div class="report-name">${h(i.label)}</div>
        </div>
      `).join("")}
    </div>
  `,e.appendChild(t),setTimeout(()=>{e.querySelectorAll(".report-card").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.route;r&&Z.navigate(r)})})},0),e}const Hn=new Set(["B","STRONG","I","EM","BR","P","SPAN","UL","LI","TABLE","THEAD","TBODY","TR","TH","TD","SMALL"]);function zn(e){const a=new DOMParser().parseFromString(`<body>${String(e??"")}</body>`,"text/html"),t=s=>{[...s.children].forEach(i=>{if(!Hn.has(i.tagName)&&i.tagName!=="I"){i.replaceWith(document.createTextNode(i.textContent));return}[...i.attributes].forEach(r=>{r.name==="class"&&/^[\w\s-]*$/.test(r.value)||r.name==="style"&&/^color:\s*#[0-9a-f]{3,8};?$/i.test(r.value)||i.removeAttribute(r.name)}),t(i)})};return t(a.body),a.body.innerHTML}function Kn(){var u;const e=document.createElement("div");e.className="page-copilot page-container",ge.getUser();const a=ue({title:((u=F.modules.copilot)==null?void 0:u.label)||"AI CoPilot",gradientClass:"gradient-copilot",actions:[{icon:'<i class="ph ph-arrows-clockwise"></i>',title:"Yenile",onClick:()=>location.reload()}]});e.appendChild(a);const t=document.createElement("div");t.className="chat-container",t.id="chat-container",e.appendChild(t);const s=document.createElement("div");s.className="chat-input-area",s.innerHTML=`
    <div class="input-field" style="flex: 1;">
      <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." />
    </div>
    <button class="chat-send-btn" id="chat-send-btn"><i class="ph-fill ph-paper-plane-tilt"></i></button>
  `,e.appendChild(s);const i=[];let r={},n=!1;function o(l,d="bot",m=!1,p=[]){const v=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});i.forEach(k=>{k.suggestions=[]}),i.push({text:l,type:d,time:v,html:m,suggestions:p}),c()}function c(){const l=e.querySelector("#chat-container");l.innerHTML=i.map(d=>`
      <div class="chat-message ${d.type}">
        <div class="chat-avatar">
          ${d.type==="user"?'<i class="ph ph-user"></i>':'<i class="ph ph-sparkle"></i>'}
        </div>
        <div class="chat-bubble">
          ${d.typing?'<div class="typing"><i></i><i></i><i></i></div>':d.html?zn(d.text):`<p>${h(d.text)}</p>`}
          ${d.suggestions&&d.suggestions.length?`<div class="chat-chips">${d.suggestions.map(m=>`<button type="button" class="chat-chip" data-q="${h(m)}">${h(m)}</button>`).join("")}</div>`:""}
          ${d.typing?"":`<div class="chat-time">${d.time}</div>`}
        </div>
      </div>
    `).join(""),l.scrollTop=l.scrollHeight}return setTimeout(()=>{o(`Merhaba! Ben ${F.companyName} AI CoPilot. Stok, satış, müşteri, hammadde, satın alma, üretim ve iş takibi hakkında soru sorabilirsiniz; uygulamanın nasıl kullanılacağını da anlatırım.`,"bot",!1,["Stok durumu","Bu ay satışlar","Azalan ürünler","Neler sorabilirim?"]);const l=e.querySelector("#chat-input"),d=e.querySelector("#chat-send-btn");async function m(p){var k;const v=(k=typeof p=="string"?p:l==null?void 0:l.value)==null?void 0:k.trim();if(!(!v||n)){n=!0,d==null||d.setAttribute("disabled",""),o(v,"user"),typeof p!="string"&&(l.value=""),i.push({typing:!0,type:"bot",html:!1,text:"",suggestions:[]}),c();try{const w=await I.post("/copilot/chat",{message:v,company:F.companyName,context:r});i.pop(),w.success?(r=w.data.context||{},o(w.data.message,"bot",!0,w.data.suggestions||[])):o("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.")}catch(w){i.pop(),o(w.message||"Bağlantı hatası oluştu. Lütfen tekrar deneyin.")}finally{n=!1,d==null||d.removeAttribute("disabled"),l==null||l.focus({preventScroll:!0})}}}d==null||d.addEventListener("click",()=>m()),l==null||l.addEventListener("keydown",p=>{p.key==="Enter"&&!p.isComposing&&(p.preventDefault(),m())}),e.querySelector("#chat-container").addEventListener("click",p=>{const v=p.target.closest(".chat-chip");v&&m(v.dataset.q)})},300),e}function On(){const e=document.createElement("div");e.className="page-settings page-container";const a=ue({title:"Ayarlar",gradientClass:"gradient-primary"});e.appendChild(a);const t=ge.getUser(),s=I.getBaseUrl(),i=document.createElement("div");return i.className="content-area",i.innerHTML=`
    <!-- Kullanıcı Bilgileri -->
    <div class="settings-group animate-fade-in-up">
      <div class="settings-group-title">Kullanıcı Bilgileri</div>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(108,99,255,0.1); color: var(--primary);"><i class="ph ph-user"></i></div>
          <span class="settings-label">Kullanıcı</span>
          <span class="settings-value">${h((t==null?void 0:t.name)||"-")}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(76,175,80,0.1); color: var(--color-sales);"><i class="ph ph-office-chair"></i></div>
          <span class="settings-label">Şube</span>
          <span class="settings-value">${h((t==null?void 0:t.branchName)||"-")}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(255,152,0,0.1); color: var(--color-purchase);"><i class="ph ph-key"></i></div>
          <span class="settings-label">Rol</span>
          <span class="settings-value">${h((t==null?void 0:t.role)||"-")}</span>
        </div>
      </div>
    </div>

    <!-- Sunucu Ayarları -->
    <div class="settings-group animate-fade-in-up stagger-1">
      <div class="settings-group-title">Sunucu Ayarları</div>
      <div class="settings-list" style="padding: 16px;">
        <div class="input-group">
          <label>API URL</label>
          <div class="input-field">
            <span class="input-icon"><i class="ph ph-link"></i></span>
            <input type="url" id="settings-api-url" value="${h(s)}" placeholder="http://sunucu:port" />
          </div>
        </div>
        <button class="btn btn-primary btn-block" id="save-settings-url" style="margin-top: 12px;">
          <i class="ph ph-floppy-disk"></i> Kaydet
        </button>
      </div>
    </div>

    <!-- Uygulama -->
    <div class="settings-group animate-fade-in-up stagger-2">
      <div class="settings-group-title">Uygulama</div>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(156,39,176,0.1); color: var(--color-stock);"><i class="ph ph-device-mobile"></i></div>
          <span class="settings-label">Versiyon</span>
          <span class="settings-value">${F.version}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(0,188,212,0.1); color: var(--color-help);"><i class="ph ph-globe"></i></div>
          <span class="settings-label">Dil</span>
          <span class="settings-value">Türkçe</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(96,125,139,0.1); color: var(--color-settings);"><i class="ph ph-bell"></i></div>
          <span class="settings-label">Bildirimler</span>
          <label class="settings-toggle-switch" style="margin-left:auto;">
            <input type="checkbox" id="notify-checkbox" />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Uygulama kurulumu -->
    <div class="settings-group animate-fade-in-up stagger-2" id="install-group" hidden>
      <div class="settings-group-title">Telefona Kur</div>
      <div class="settings-list">
        <div class="settings-item" id="install-app" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--primary-soft); color: var(--primary);"><i class="ph ph-device-mobile-speaker"></i></div>
          <span class="settings-label">Ana ekrana ekle</span>
          <span class="settings-value">tarayıcı çubuğu olmadan açılır</span>
          <span class="settings-arrow"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <!-- Görünüm -->
    <div class="settings-group animate-fade-in-up stagger-3">
      <div class="settings-group-title">Görünüm</div>
      <div class="settings-list">
        <div class="settings-item" id="settings-theme-toggle" style="cursor: pointer;">
          <div class="settings-icon" style="background: rgba(30,30,30,0.08); color: #222;" id="theme-icon-wrap">
            <i class="ph ph-moon" id="theme-icon"></i>
          </div>
          <span class="settings-label" id="theme-label">Karanlık Tema</span>
          <label class="settings-toggle-switch" style="margin-left:auto;">
            <input type="checkbox" id="theme-checkbox" />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Şifre -->
    <div class="settings-group animate-fade-in-up stagger-3" id="password-group">
      <div class="settings-group-title">Şifre Değiştir</div>
      <div class="settings-list" style="padding: 16px;">
        <div class="input-group">
          <label>Mevcut şifre</label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="pw-current" autocomplete="current-password" /></div>
        </div>
        <div class="input-group" style="margin-top: 12px;">
          <label>Yeni şifre <span style="font-weight:400;color:var(--text-tertiary)">(en az 8 karakter, harf ve rakam)</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="pw-new" autocomplete="new-password" /></div>
        </div>
        <button class="btn btn-primary btn-block" id="pw-save" style="margin-top: 12px;">
          <i class="ph ph-shield-check"></i> Şifreyi Güncelle
        </button>
      </div>
    </div>

    <!-- Hesap -->
    <div class="settings-group animate-fade-in-up stagger-4">
      <div class="settings-group-title">Hesap</div>
      <div class="settings-list">
        <div class="settings-item" id="settings-logout" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--error-light); color: var(--error);"><i class="ph ph-sign-out"></i></div>
          <span class="settings-label" style="color: var(--error); font-weight: 600;">Çıkış Yap</span>
          <span class="settings-arrow" style="color: var(--error);"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <!-- Sorun giderme -->
    <div class="settings-group animate-fade-in-up stagger-4">
      <div class="settings-group-title">Sorun Giderme</div>
      <div class="settings-list">
        <div class="settings-item" id="clear-cache" style="cursor: pointer;">
          <div class="settings-icon" style="background: var(--bg-elevated); color: var(--text-secondary);"><i class="ph ph-arrow-clockwise"></i></div>
          <span class="settings-label">Önbelleği temizle ve yenile</span>
          <span class="settings-value">eski sürüm görünüyorsa</span>
          <span class="settings-arrow"><i class="ph ph-caret-right"></i></span>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 20px; color: var(--text-tertiary); font-size: 12px;">
      ${F.appName} v${F.version}<br>
      © 2026 Tüm Hakları Saklıdır
    </div>
  `,e.appendChild(i),setTimeout(()=>{var m,p,v,k,w;const r=e.querySelector("#install-group"),n=()=>{r.hidden=!fs()};n(),window.addEventListener("pwa-install-state",n),(m=e.querySelector("#install-app"))==null||m.addEventListener("click",async()=>{await gs()&&P("Uygulama ana ekrana eklendi","success"),n()}),(p=e.querySelector("#clear-cache"))==null||p.addEventListener("click",async()=>{var b,E;if(await Le({title:"Önbellek temizlensin mi?",message:"Uygulama dosyaları yeniden indirilir ve sayfa yenilenir. Kayıtlı verileriniz ve oturumunuz etkilenmez.",confirmLabel:"Temizle ve yenile"})){try{(await((E=(b=navigator.serviceWorker)==null?void 0:b.getRegistrations)==null?void 0:E.call(b))||[]).forEach(T=>{var M;return(M=T.active)==null?void 0:M.postMessage("clear-cache")}),window.caches&&(await caches.keys()).forEach(T=>caches.delete(T))}catch{}location.reload()}}),(v=e.querySelector("#pw-save"))==null||v.addEventListener("click",async()=>{const L=e.querySelector("#pw-current"),b=e.querySelector("#pw-new");if(!L.value||!b.value)return P("Mevcut ve yeni şifreyi girin","warning");try{const E=await I.post("/auth/change-password",{currentPassword:L.value,newPassword:b.value});P(E.message||"Şifre değiştirildi","success"),L.value="",b.value=""}catch(E){P(E.message||"Şifre değiştirilemedi","error")}}),(k=e.querySelector("#save-settings-url"))==null||k.addEventListener("click",()=>{var E;const L=e.querySelector("#settings-api-url"),b=(E=L==null?void 0:L.value)==null?void 0:E.trim();b?(I.setBaseUrl(b),P("API URL kaydedildi","success")):(I.resetBaseUrl(),L.value=I.getBaseUrl(),P("Varsayılan sunucu adresine dönüldü","success"))});const o=e.querySelector("#notify-checkbox");if(o){const L=F.storageKeys.notify;o.checked=localStorage.getItem(L)!=="off",o.addEventListener("change",()=>{localStorage.setItem(L,o.checked?"on":"off"),P(o.checked?"Bildirimler açıldı":"Bildirimler kapatıldı","success")})}(w=e.querySelector("#settings-logout"))==null||w.addEventListener("click",()=>{ge.logout()});const c=e.querySelector("#theme-checkbox"),u=e.querySelector("#theme-icon"),l=e.querySelector("#theme-label"),d=document.body.classList.contains("dark-theme");c&&(c.checked=d),u&&(u.className=d?"ph ph-sun":"ph ph-moon"),l&&(l.textContent=d?"Aydınlık Temaya Geç":"Karanlık Temaya Geç"),c==null||c.addEventListener("change",()=>{const L=c.checked;document.body.classList.toggle("dark-theme",L),localStorage.setItem(F.storageKeys.theme,L?"dark":"light"),u&&(u.className=L?"ph ph-sun":"ph ph-moon"),l&&(l.textContent=L?"Aydınlık Temaya Geç":"Karanlık Temaya Geç"),P(L?"Karanlık tema açıldı":"Aydınlık tema açıldı","success")})},0),e}function Fn(){const e=document.createElement("div");e.className="page-container";const a=ue({title:"Hammadde Takibi",showBack:!0,gradientClass:"gradient-stock"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="rm-search" placeholder="Hammadde ara..." />
      </div>
    </div>
    <div id="rm-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#rm-list"),i=t.querySelector("#rm-search");let r=[];const n=async()=>{const u=await I.getRawMaterials();u.success?(r=u.data,o(r)):s.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'},o=u=>{if(u.length===0){s.innerHTML='<div class="empty-state">Hammadde bulunamadı.</div>';return}s.innerHTML=u.map((l,d)=>{const m=Math.min(100,Math.round(l.stock/l.minStock*100)),v=l.stock<=l.minStock?"var(--error)":"var(--success)";return`
        <div class="list-item animate-fade-in-up stagger-${d%5+1}">
          <div class="list-icon" style="background: rgba(139, 195, 74, 0.1); color: #8bc34a;">
            <i class="ph ph-flask"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${h(l.name)}</div>
            <div class="list-subtitle">${h(l.code)}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Stok Durumu</span>
                <span style="color:${v}; font-weight:600;">${l.stock} ${h(l.unit)}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${m>100?100:m}%; background: ${v};"></div>
              </div>
            </div>
          </div>
          <button class="icon-btn rm-adjust-btn" data-id="${l.id}" data-name="${h(l.name)}" title="Stok Düzenle" style="background:#f4f5f7; border-radius:6px; padding:8px;">
            <i class="ph ph-plus-minus" style="font-size:18px; color:var(--primary);"></i>
          </button>
        </div>
      `}).join(""),s.querySelectorAll(".rm-adjust-btn").forEach(l=>{l.addEventListener("click",()=>{c(l.dataset.id,l.dataset.name)})})},c=(u,l)=>{const d=document.createElement("div");d.className="modal-overlay",d.style.cssText="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center;",d.innerHTML=`
      <div class="card animate-fade-in-up" style="width:90%; max-width:400px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        <h3 style="margin:0 0 16px; font-size:16px;">Hammadde Stok Hareketi</h3>
        <div style="font-weight:600; color:var(--primary); margin-bottom:12px;">${l}</div>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label>İşlem Türü</label>
          <select id="adj-type" class="input-element">
            <option value="IN">Stok Girişi (Artır)</option>
            <option value="OUT">Stok Çıkışı (Azalt / Fire)</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label>Miktar</label>
          <input type="number" id="adj-qty" class="input-element" min="0.01" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label>Not / Açıklama</label>
          <input type="text" id="adj-note" class="input-element" placeholder="Sebebi belirtin..." />
        </div>
        
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn btn-outline" id="adj-cancel">İptal</button>
          <button class="btn btn-primary" id="adj-save">Kaydet</button>
        </div>
      </div>
    `,document.body.appendChild(d),d.querySelector("#adj-cancel").addEventListener("click",()=>d.remove()),d.querySelector("#adj-save").addEventListener("click",async()=>{const m=d.querySelector("#adj-type").value,p=parseFloat(d.querySelector("#adj-qty").value),v=d.querySelector("#adj-note").value.trim();if(!p||p<=0)return P("Lütfen geçerli bir miktar girin.","warning");const k=d.querySelector("#adj-save");k.disabled=!0,k.innerHTML="Kaydediliyor...";try{const w=await I.post("/raw-materials/adjust",{rawMaterialId:u,type:m,quantity:p,note:v});w.success?(d.remove(),n()):(P(w.message||"Kayıt yapılamadı","error"),k.disabled=!1,k.innerHTML="Kaydet")}catch(w){P(w.message||"Sunucu hatası","error"),k.disabled=!1,k.innerHTML="Kaydet"}})};return i.addEventListener("input",u=>{const l=u.target.value.toLowerCase(),d=r.filter(m=>m.name.toLowerCase().includes(l)||m.code.toLowerCase().includes(l));o(d)}),setTimeout(n,0),e}function _n(){const e=document.createElement("div");e.className="page-container";const a=ue({title:"Ürün Reçeteleri",showBack:!0,gradientClass:"gradient-sales"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div id="recipes-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#recipes-list"),i=async()=>{const n=await I.getRecipes(),o=await I.getRawMaterials();n.success&&o.success?r(n.data,o.data):s.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'},r=(n,o)=>{if(n.length===0){s.innerHTML='<div class="empty-state">Reçete bulunamadı.</div>';return}s.innerHTML=n.map((c,u)=>{const l=c.materials.map(d=>{const m=o.find(p=>p.id===d.rawMaterialId);return`
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
            <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${h(m?m.name:"Bilinmeyen")}</span>
            <span style="font-weight:500;">${d.quantity} ${h(m?m.unit:"")}</span>
          </div>
        `}).join("");return`
        <div class="list-item animate-fade-in-up stagger-${u%5+1}" style="flex-direction:column; align-items:stretch;">
          <div style="display:flex; align-items:center; margin-bottom: 12px;">
            <div class="list-icon" style="background: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="ph ph-book-open"></i>
            </div>
            <div class="list-content" style="margin-left:12px;">
              <div class="list-title">${h(c.name)}</div>
              <div class="list-subtitle">Ürün ID: ${h(c.productId)}</div>
            </div>
          </div>
          <div style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
            <div style="font-size:11px; font-weight:600; color:var(--primary); margin-bottom:8px; text-transform:uppercase;">Reçete İçeriği (1 Birim İçin)</div>
            ${l}
          </div>
        </div>
      `}).join("")};return setTimeout(i,0),e}function Un(){const e=document.createElement("div");e.className="page-container";const a=ue({title:"Üretim İşlemi",showBack:!0,gradientClass:"gradient-transfer"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="transfer-info-card animate-fade-in-down" style="margin-bottom: 20px;">
      <div class="info-icon" style="background: rgba(233, 30, 99, 0.1); color: #e91e63;"><i class="ph ph-factory"></i></div>
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">Üretim Fişi</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Reçeteye bağlı üretim yapın. Hammaddeler düşülecek, ürün stoğa eklenecektir.</div>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1">
      <div class="input-group">
        <label>Üretilecek Ürün</label>
        <div class="input-field">
          <span class="select-icon"><i class="ph ph-package"></i></span>
          <select id="prod-product" class="select-input">
            <option value="">Yükleniyor...</option>
          </select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 15px;">
        <label>Miktar</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-hash"></i></span>
          <input type="number" id="prod-quantity" placeholder="Örn: 10" min="1" value="1" />
        </div>
      </div>

      <div id="recipe-preview" style="margin-top: 15px; display:none;">
        <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Harcayacağınız Hammaddeler (Tahmini)</div>
        <div id="recipe-preview-content" style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);"></div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" id="prod-btn" style="margin-top: 20px; background: #e91e63;">
        <i class="ph ph-play"></i> Üretimi Başlat
      </button>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#prod-product"),i=t.querySelector("#prod-quantity"),r=t.querySelector("#recipe-preview"),n=t.querySelector("#recipe-preview-content"),o=t.querySelector("#prod-btn");let c=[],u=[];const l=async()=>{const m=await I.getRecipes(),p=await I.getRawMaterials();m.success&&p.success?(c=m.data,u=p.data,s.innerHTML='<option value="">Ürün Seçiniz...</option>'+c.map(v=>`<option value="${h(v.productId)}">${h(v.name.replace(" Reçetesi",""))}</option>`).join("")):s.innerHTML='<option value="">Hata oluştu</option>'},d=()=>{const m=s.value,p=parseInt(i.value)||0;if(!m||p<=0){r.style.display="none";return}const v=c.find(k=>k.productId===m);if(!v){r.style.display="none";return}n.innerHTML=v.materials.map(k=>{const w=u.find(y=>y.id===k.rawMaterialId),L=k.quantity*p,E=w&&w.stock>=L?"var(--success)":"var(--error)";return`
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
          <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${h(w?w.name:"Bilinmeyen")}</span>
          <span style="font-weight:600; color:${E};">${L.toFixed(2)} ${h(w?w.unit:"")}</span>
        </div>
      `}).join(""),r.style.display="block"};return s.addEventListener("change",d),i.addEventListener("input",d),o.addEventListener("click",async()=>{const m=s.value,p=parseInt(i.value)||0;if(!m)return P("Ürün seçmediniz","warning");if(p<=0)return P("Geçerli bir miktar girin","warning");o.disabled=!0,o.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-color:#fff;border-top-color:transparent;"></div>';const v=await I.produceItem(m,p);o.disabled=!1,o.innerHTML='<i class="ph ph-play"></i> Üretimi Başlat',v.success?(P(v.message,"success"),i.value=1,s.value="",r.style.display="none",I.getRawMaterials().then(k=>{k.success&&(u=k.data)})):P(v.message,"error")}),setTimeout(l,0),e}function Gn(){const e=document.createElement("div");e.className="page-container";const a=ue({title:"Müşteri Bakiyeleri",showBack:!0,gradientClass:"gradient-reports"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="cb-search" placeholder="Müşteri ara..." />
      </div>
    </div>
    <div class="list-toolbar"><span></span>${Ee("cb-export")}</div>
    <div id="cb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#cb-list");t.querySelector("#cb-export").addEventListener("click",()=>{const c=(i.value||"").toLowerCase(),u=r.filter(l=>!c||String(l.name||"").toLowerCase().includes(c));ye("Musteri bakiyeleri",[["Müşteri","name"],["Bakiye",l=>l.balance],["Para birimi","currency"]],u)});const i=t.querySelector("#cb-search");let r=[];const n=async()=>{try{const c=await I.getCustomers();c.success?(r=c.data,o(r)):s.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'}catch{s.innerHTML='<div class="empty-state">Sunucu bağlantısı hatası.</div>'}},o=c=>{if(c.length===0){s.innerHTML='<div class="empty-state">Müşteri bulunamadı.</div>';return}s.innerHTML=c.map((u,l)=>{const d=u.balance<0,m=u.balance===0,p=d?"var(--error)":m?"var(--text-secondary)":"var(--success)";return`
        <div class="list-item animate-fade-in-up stagger-${l%5+1}">
          <div class="list-icon" style="background: rgba(103, 58, 183, 0.1); color: #673ab7;">
            <i class="ph ph-user-circle"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${h(u.name)}</div>
            <div class="list-subtitle">Müşteri ID: ${u.id}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Bakiye</span>
                <span style="color:${p}; font-weight:700; font-size: 16px;">
                  ${u.balance.toLocaleString("tr-TR")} ${h(u.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `}).join("")};return i.addEventListener("input",c=>{const u=c.target.value.toLowerCase(),l=r.filter(d=>d.name.toLowerCase().includes(u));o(l)}),setTimeout(n,0),e}function Yn(){var o;const e=document.createElement("div");e.className="page-container";const a=ue({title:"Yardım & Destek"});e.appendChild(a);const t=document.createElement("div");t.className="content-area";const s=c=>String(c??"").replace(/[&<>"]/g,u=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[u]),i=F.support,n=[i.phone&&{icon:"ph-phone",text:i.phone,href:`tel:${i.phone.replace(/\s/g,"")}`},i.email&&{icon:"ph-envelope-simple",text:i.email,href:`mailto:${i.email}`},i.website&&{icon:"ph-globe",text:i.website,href:/^https?:/.test(i.website)?i.website:`https://${i.website}`}].filter(Boolean).map(c=>`
      <a href="${s(c.href)}" target="_blank" rel="noopener noreferrer" class="card" style="display:flex; align-items:center; gap:10px; padding:12px 14px; color:var(--text-primary); text-decoration:none;">
        <i class="ph ${c.icon}" style="font-size:20px; color:var(--primary);"></i><span>${s(c.text)}</span>
      </a>`).join("");return t.innerHTML=`
    <div class="card animate-fade-in-up" style="padding: 24px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px; color: var(--primary);"><i class="ph ph-lifebuoy"></i></div>
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${s(i.title)}</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        ${s(i.text)}
      </p>
      ${n?`<div style="display:flex; flex-direction:column; gap:8px; max-width:300px; margin:0 auto 16px; text-align:left;">${n}</div>`:""}
      
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch; max-width: 300px; margin: 0 auto;">
        ${(o=F.modules.copilot)!=null&&o.enabled?`<button class="btn btn-primary" data-help="copilot" style="background: var(--primary);">
          <i class="ph ph-sparkle"></i> CoPilot'a Sor
        </button>`:""}
        <button class="btn btn-outline" data-help="back">
          Geri Dön
        </button>
      </div>
    </div>
  `,t.addEventListener("click",c=>{var l;const u=(l=c.target.closest("[data-help]"))==null?void 0:l.dataset.help;u==="copilot"&&(window.location.hash="#/copilot"),u==="back"&&window.history.back()}),e.appendChild(t),e}const Ie=e=>String(e??"").replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]),Qa=e=>e?e.split("-").reverse().join("."):"-";function Vn(){const e=document.createElement("div");e.className="page-container";const a=ue({title:Et("cekiListesi","Çeki Listesi"),showBack:!0,gradientClass:"gradient-stock"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="card animate-fade-in-up stagger-1" style="margin-bottom: 15px; padding: 15px;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--text-primary);">
        <i class="ph ph-info"></i> Sevkiyat Seçimi
      </div>
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-truck"></i></span>
        <select id="pl-shipment" class="input-element"><option value="">Yükleniyor...</option></select>
      </div>
      <div id="pl-meta" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-top: 12px;"></div>
    </div>

    <div class="search-bar" style="margin-bottom: 12px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="pl-search" placeholder="Ürün adı, kod veya barkod ara..." />
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; font-weight: 600; font-size: 14px; margin-bottom: 10px; color: var(--text-primary);">
      <span>Paketlenecek Ürünler</span>
      <span id="pl-progress" style="font-size:12px; color: var(--text-secondary); font-weight:500;"></span>
    </div>

    <div id="pl-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>

    <div style="margin-top: 20px;">
      <button class="btn btn-primary btn-block" id="btn-complete-packing" style="background: var(--color-stock);">
        <i class="ph ph-check-circle"></i> Çeki Listesini Tamamla
      </button>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#pl-list"),i=t.querySelector("#pl-search"),r=t.querySelector("#btn-complete-packing"),n=t.querySelector("#pl-shipment"),o=t.querySelector("#pl-meta"),c=t.querySelector("#pl-progress");let u=[],l=null,d=[];const m=w=>{l=u.find(L=>L.key===w)||null,d=l?l.items.map(L=>({...L,id:L.productId,targetQuantity:L.quantity,packedQuantity:0,packed:!1})):[],o.innerHTML=l?`
      <div><div style="color: var(--text-secondary);">${Ie(F.terms.customer)}</div><div style="font-weight: 500;">${Ie(l.customerName)}</div></div>
      <div><div style="color: var(--text-secondary);">Sevkiyat Tarihi</div><div style="font-weight: 500;">${Qa(l.date)}</div></div>`:"",i.value="",k()},p=async()=>{try{const w=await I.get("/shipments");if(u=w.success?w.data:[],u.length===0){n.innerHTML='<option value="">Bekleyen sevkiyat yok</option>',s.innerHTML='<div class="empty-state">Paketlenecek sevkiyat bulunamadı. Satış yapıldığında burada görünür.</div>',r.disabled=!0;return}r.disabled=!1,n.innerHTML=u.map(L=>`<option value="${Ie(L.key)}">${Ie(L.customerName)} — ${Qa(L.date)} (${L.items.length} kalem)</option>`).join(""),m(u[0].key)}catch{s.innerHTML='<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>'}},v=()=>{const w=d.filter(L=>L.packed).length;c.textContent=d.length?`${w} / ${d.length} kalem tamam`:""},k=()=>{v();const w=i.value.trim().toLowerCase(),L=d.filter(b=>!w||[b.name,b.code,b.barcode].some(E=>String(E||"").toLowerCase().includes(w)));if(L.length===0){s.innerHTML='<div class="empty-state">Ürün bulunamadı.</div>';return}s.innerHTML=L.map((b,E)=>`
      <div class="list-item animate-fade-in-up stagger-${E%5+1}" style="opacity: ${b.packed?"0.65":"1"}; transition: all 0.3s;">
        <div class="list-icon" style="background: ${b.packed?"var(--success)":"rgba(255, 152, 0, 0.1)"}; color: ${b.packed?"#fff":"#FF9800"};">
          <i class="ph ${b.packed?"ph-check":"ph-package"}"></i>
        </div>
        <div class="list-content" style="flex: 1;">
          <div class="list-title" style="text-decoration: ${b.packed?"line-through":"none"};">${Ie(b.name)}</div>
          <div class="list-subtitle">${Ie(b.code)} | Hedef: ${b.targetQuantity} ${Ie(b.unit)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn-decrement" data-id="${Ie(b.id)}" aria-label="Azalt" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-minus"></i></button>
          <span style="font-weight: 600; min-width: 28px; text-align: center;">${b.packedQuantity}</span>
          <button class="btn-increment" data-id="${Ie(b.id)}" aria-label="Arttır" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-plus"></i></button>
          <button class="btn-fill" data-id="${Ie(b.id)}" title="Tamamını paketle" aria-label="Tamamını paketle" style="width: 30px; height: 30px; border-radius: 6px; border: none; background: var(--primary); color: #fff; cursor: pointer;"><i class="ph ph-checks"></i></button>
        </div>
      </div>
    `).join("")};return s.addEventListener("click",w=>{const L=w.target.closest("button[data-id]");if(!L)return;const b=d.find(E=>E.id===L.dataset.id);if(b){if(L.classList.contains("btn-increment")&&b.packedQuantity<b.targetQuantity)b.packedQuantity++;else if(L.classList.contains("btn-decrement")&&b.packedQuantity>0)b.packedQuantity--;else if(L.classList.contains("btn-fill"))b.packedQuantity=b.targetQuantity;else return;b.packed=b.packedQuantity>=b.targetQuantity,k()}}),n.addEventListener("change",()=>m(n.value)),i.addEventListener("input",k),r.addEventListener("click",async()=>{var w;if(l){if(!d.every(L=>L.packed)){P("Eksik paketlenen ürünler var!","warning");return}r.disabled=!0;try{const L=await I.post("/packing-lists",{shipmentKey:l.key,customerId:l.customerId,customerName:l.customerName,createdBy:((w=ge.getUser())==null?void 0:w.name)||"",items:d.map(b=>({productId:b.productId,code:b.code,name:b.name,quantity:b.packedQuantity,unit:b.unit}))});L.success?(P("Çeki listesi başarıyla tamamlandı!","success"),await p()):(P(L.message||"Kaydedilemedi","error"),r.disabled=!1)}catch(L){P("Hata: "+L.message,"error"),r.disabled=!1}}}),setTimeout(p,0),e}const Ze=e=>String(e??"").replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]);function Qn(){const e=document.createElement("div");e.className="page-container";const a=ue({title:Et("seriAmbar","Seri Ambar Bakiye"),showBack:!0,gradientClass:"gradient-transfer"});e.appendChild(a);const t=document.createElement("div");t.className="content-area",t.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="swb-search" placeholder="Stok kodu, barkod veya ürün adı ara..." />
      </div>
    </div>

    <div id="swb-tabs" class="filter-tabs animate-fade-in-down stagger-1" style="display: flex; gap: 10px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 5px;"></div>

    <div class="list-toolbar">
      <div id="swb-summary" style="font-size: 13px; color: var(--text-secondary);"></div>
      ${Ee("swb-export")}
    </div>

    <div id="swb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(t);const s=t.querySelector("#swb-list"),i=t.querySelector("#swb-search"),r=t.querySelector("#swb-tabs"),n=t.querySelector("#swb-summary");let o=[],c=[],u="all";const l=k=>"padding: 6px 14px; border-radius: 20px; border: none; white-space: nowrap; cursor: pointer; font-weight: 600; font-size: 13px; "+(k?"background: var(--primary); color: #fff;":"background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow-sm);"),d=()=>{r.innerHTML=[{id:"all",name:"Tümü"},...c.map(k=>({id:k.id,name:`Şube ${k.code||k.id}`}))].map(k=>`<button class="filter-tab ${u===k.id?"active":""}" data-branch="${Ze(k.id)}" style="${l(u===k.id)}">${Ze(k.name)}</button>`).join("")};let m=[];const p=()=>{const k=i.value.trim().toLowerCase(),w=o.filter(b=>(u==="all"||b.branchId===u)&&(!k||[b.code,b.barcode,b.name,b.warehouseName].some(E=>String(E||"").toLowerCase().includes(k))));m=w;const L=w.reduce((b,E)=>b+E.qty,0);if(n.innerHTML=w.length?`<b>${w.length}</b> kayıt · toplam <b>${L.toLocaleString("tr-TR")}</b> adet`:"",w.length===0){s.innerHTML='<div class="empty-state">Bakiye bulunamadı.</div>';return}s.innerHTML=w.map((b,E)=>`
      <div class="list-item animate-fade-in-up stagger-${E%5+1}">
        <div class="list-icon" style="background: rgba(33, 150, 243, 0.1); color: #2196F3;">
          <i class="ph ph-barcode"></i>
        </div>
        <div class="list-content">
          <div class="list-title">${Ze(b.barcode||b.code)}</div>
          <div class="list-subtitle">${Ze(b.code)} - ${Ze(b.name)}</div>
          <div style="display: flex; gap: 12px; margin-top: 5px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
            <span><i class="ph ph-warehouse"></i> ${Ze(b.warehouseName||b.warehouseId)}</span>
            <span style="font-weight: 600; color: var(--text-primary);"><i class="ph ph-stack"></i> ${b.qty.toLocaleString("tr-TR")} ${Ze(b.unit)}</span>
          </div>
        </div>
      </div>
    `).join("")},v=async()=>{try{const[k,w]=await Promise.all([I.get("/warehouse-balances"),I.get("/branches")]);if(o=k.success?k.data:[],c=w.success?w.data:[],d(),o.length===0){s.innerHTML='<div class="empty-state">Seri bakiye verisi bulunamadı.</div>';return}p()}catch{s.innerHTML='<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>'}};return r.addEventListener("click",k=>{const w=k.target.closest("[data-branch]");w&&(u=w.dataset.branch,d(),p())}),i.addEventListener("input",p),t.querySelector("#swb-export").addEventListener("click",()=>ye("Seri ambar bakiye",[["Stok kodu","code"],["Barkod","barcode"],["Ürün","name"],["Kategori","category"],["Depo","warehouseName"],["Şube","branchName"],["Miktar",k=>k.qty],["Birim","unit"]],m)),setTimeout(v,0),e}function Jn(){const e=document.createElement("div");e.className="page-operations dash";const a=Object.values(F.modules),t=s=>{const i=a.findIndex(r=>r.section===s.id&&r.enabled);return i===-1?999:i};return e.innerHTML='<label class="op-search"><i class="ph ph-magnifying-glass"></i><input type="search" placeholder="Modül veya menü ara…" autocomplete="off" /></label>'+[...F.sections].sort((s,i)=>t(s)-t(i)).map(s=>{const i=Object.entries(F.modules).filter(([r,n])=>n.section===s.id&&n.enabled&&St(r)).map(([,r])=>r);return i.length?`
      <h2 class="dash-h">${h(s.title)}</h2>
      <div class="op-list">
        ${i.map(r=>`
          <a class="op-item" data-route="${r.route}">
            <span class="tile-icon">${r.icon}</span>
            <span class="op-text"><b>${h(r.label)}</b><small>${h(r.description||"")}</small></span>
            <i class="ph ph-caret-right"></i>
          </a>`).join("")}
      </div>`:""}).join(""),mi(e.querySelector(".op-search input"),{host:e.querySelector(".op-search")}),e.addEventListener("click",s=>{const i=s.target.closest("[data-route]");i&&Z.navigate(i.dataset.route)}),e}const Wn={Satış:"ph-storefront",Alış:"ph-shopping-cart",Depo:"ph-warehouse",Üretim:"ph-factory","İş Takip":"ph-kanban",Kullanıcı:"ph-user-gear"},Xn={Satış:"#22A06B",Alış:"#F0A93B",Depo:"#0EA5E9",Üretim:"#A855F7","İş Takip":"#E5484D",Kullanıcı:"#64748B"},Ke=e=>String(e).padStart(2,"0"),Ye=e=>`${e.getFullYear()}-${Ke(e.getMonth()+1)}-${Ke(e.getDate())}`,Zn=e=>{const a=new Date(e);return isNaN(a)?"":`${Ke(a.getDate())}.${Ke(a.getMonth()+1)}.${a.getFullYear()} ${Ke(a.getHours())}:${Ke(a.getMinutes())}`},er=e=>{const a=new Date(e),t=new Date,s=new Date(Date.now()-864e5);return Ye(a)===Ye(t)?"Bugün":Ye(a)===Ye(s)?"Dün":a.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric",weekday:"long"})},Ja=[["today","Bugün"],["yesterday","Dün"],["7","Son 7 gün"],["30","Son 30 gün"],["month","Bu ay"],["lastmonth","Geçen ay"],["all","Tümü"],["custom","Özel aralık"]],Si=e=>{const[a,t,s]=e.split("-").map(Number);return new Date(a,t-1,s,0,0,0,0)},tr=e=>{const a=Si(e);return a.setDate(a.getDate()+1),a};function ar(e,a){const t=new Date,s=Ye(t),i=r=>{const n=new Date;return n.setDate(n.getDate()-r),Ye(n)};switch(e){case"today":return{from:s,to:s};case"yesterday":return{from:i(1),to:i(1)};case"7":return{from:i(6),to:s};case"30":return{from:i(29),to:s};case"month":return{from:`${t.getFullYear()}-${Ke(t.getMonth()+1)}-01`,to:s};case"lastmonth":{const r=new Date(t.getFullYear(),t.getMonth()-1,1),n=new Date(t.getFullYear(),t.getMonth(),0);return{from:Ye(r),to:Ye(n)}}case"custom":return a;default:return{}}}function ir(){const e=document.createElement("div");e.className="page-activity page-container",e.appendChild(ue({title:Et("sonIslemler","Son İşlemler"),gradientClass:"gradient-reports"}));const a=document.createElement("div");a.className="content-area",e.appendChild(a);const t={period:"today",from:"",to:"",userId:"",category:"",q:""};let s=[],i=[],r=[];a.innerHTML=`
    <div class="act-filters card">
      <div class="act-chips" id="act-period">${Ja.map(([p,v])=>`<button type="button" class="sx-chip ${p===t.period?"on":""}" data-p="${p}">${v}</button>`).join("")}</div>
      <div class="act-custom" id="act-custom" hidden>
        <div class="input-field"><span class="input-icon"><i class="ph ph-calendar-blank"></i></span><input type="date" id="act-from" /></div>
        <div class="input-field"><span class="input-icon"><i class="ph ph-calendar-blank"></i></span><input type="date" id="act-to" /></div>
      </div>
      <div class="act-row">
        <div class="input-field"><span class="input-icon"><i class="ph ph-user"></i></span>
          <select id="act-user" class="input-element"><option value="">Tüm çalışanlar</option></select></div>
        <div class="input-field"><span class="input-icon"><i class="ph ph-funnel"></i></span>
          <select id="act-cat" class="input-element"><option value="">Tüm işlemler</option></select></div>
      </div>
      <div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="search" id="act-q" placeholder="Ara: ürün, müşteri, iş no (IS-0050), açıklama..." autocomplete="off" /></div>
    </div>
    <div class="list-toolbar"><span id="act-count"></span>${Ee("act-export")}</div>
    <div id="act-list"></div>`;const n=p=>a.querySelector(p),o=n("#act-list");async function c(){o.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';const p=ar(t.period,{from:t.from,to:t.to}),v=new URLSearchParams;p.from&&v.set("from",Si(p.from).toISOString()),p.to&&v.set("to",tr(p.to).toISOString()),t.userId&&v.set("userId",t.userId),t.category&&v.set("category",t.category),t.q&&v.set("q",t.q),v.set("limit","2000");try{const k=await I.get("/activity?"+v.toString());if(!k.success)throw new Error(k.message||"Kayıtlar okunamadı");s=k.data.items,i.length||(i=k.data.users),r.length||(r=k.data.categories),u(),l()}catch(k){o.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${h(k.message)}</div></div>`}}function u(){const p=n("#act-user"),v=n("#act-cat");p.options.length<=1&&i.forEach(k=>p.add(new Option(k.name,k.id))),v.options.length<=1&&r.forEach(k=>v.add(new Option(k,k)))}function l(){if(n("#act-count").textContent=`${s.length.toLocaleString("tr-TR")} işlem`,!s.length){o.innerHTML='<div class="empty-state"><div class="empty-icon"><i class="ph ph-clock-counter-clockwise"></i></div><div class="empty-text">Bu filtrelerde işlem kaydı yok</div></div>';return}let p="";o.innerHTML=s.map(v=>{const k=er(v.ts),w=k!==p?`<div class="act-day">${h(k)}</div>`:"";p=k;const L=Xn[v.category]||"#64748B",b=new Date(v.ts);return`${w}
      <div class="act-item">
        <span class="act-ico" style="--c:${L}"><i class="ph ${Wn[v.category]||"ph-circle"}"></i></span>
        <div class="act-body">
          <div class="act-title"><b>${h(v.typeLabel)}</b>${v.refLabel?`<span class="act-ref">${h(v.refLabel)}</span>`:""}</div>
          <div class="act-text">${h(v.text)}</div>
          <div class="act-meta"><i class="ph ph-user"></i> ${h(v.userName||"—")} <span>·</span> <i class="ph ph-clock"></i> ${Ke(b.getHours())}:${Ke(b.getMinutes())}</div>
        </div>
      </div>`}).join("")}n("#act-period").addEventListener("click",p=>{const v=p.target.closest("[data-p]");v&&(t.period=v.dataset.p,n("#act-period").querySelectorAll(".sx-chip").forEach(k=>k.classList.toggle("on",k===v)),n("#act-custom").hidden=t.period!=="custom",!(t.period==="custom"&&!(t.from&&t.to))&&c())});const d=()=>{if(t.from=n("#act-from").value,t.to=n("#act-to").value,t.from&&t.to){if(t.to<t.from)return P("Bitiş tarihi başlangıçtan önce olamaz","warning");c()}};n("#act-from").addEventListener("change",d),n("#act-to").addEventListener("change",d),n("#act-user").addEventListener("change",p=>{t.userId=p.target.value,c()}),n("#act-cat").addEventListener("change",p=>{t.category=p.target.value,c()});let m;return n("#act-q").addEventListener("input",p=>{clearTimeout(m),m=setTimeout(()=>{t.q=p.target.value.trim(),c()},300)}),n("#act-export").addEventListener("click",()=>{var v;const p=((v=Ja.find(([k])=>k===t.period))==null?void 0:v[1])||"";ye(`Son islemler ${p}`,[["Tarih",k=>Zn(k.ts)],["Çalışan","userName"],["Kategori","category"],["İşlem","typeLabel"],["Açıklama","text"],["Referans","refLabel"]],s)}),c(),e}var Qt=function(){var e=function(b,E){var y=236,T=17,M=b,N=t[E],q=null,S=0,D=null,B=[],z={},_=function(g,$){S=M*4+17,q=function(f){for(var x=new Array(f),A=0;A<f;A+=1){x[A]=new Array(f);for(var O=0;O<f;O+=1)x[A][O]=null}return x}(S),V(0,0),V(S-7,0),V(0,S-7),R(),ie(),W(g,$),M>=7&&U(g),D==null&&(D=K(M,N,B)),ee(D,$)},V=function(g,$){for(var f=-1;f<=7;f+=1)if(!(g+f<=-1||S<=g+f))for(var x=-1;x<=7;x+=1)$+x<=-1||S<=$+x||(0<=f&&f<=6&&(x==0||x==6)||0<=x&&x<=6&&(f==0||f==6)||2<=f&&f<=4&&2<=x&&x<=4?q[g+f][$+x]=!0:q[g+f][$+x]=!1)},Q=function(){for(var g=0,$=0,f=0;f<8;f+=1){_(!0,f);var x=i.getLostPoint(z);(f==0||g>x)&&(g=x,$=f)}return $},ie=function(){for(var g=8;g<S-8;g+=1)q[g][6]==null&&(q[g][6]=g%2==0);for(var $=8;$<S-8;$+=1)q[6][$]==null&&(q[6][$]=$%2==0)},R=function(){for(var g=i.getPatternPosition(M),$=0;$<g.length;$+=1)for(var f=0;f<g.length;f+=1){var x=g[$],A=g[f];if(q[x][A]==null)for(var O=-2;O<=2;O+=1)for(var H=-2;H<=2;H+=1)O==-2||O==2||H==-2||H==2||O==0&&H==0?q[x+O][A+H]=!0:q[x+O][A+H]=!1}},U=function(g){for(var $=i.getBCHTypeNumber(M),f=0;f<18;f+=1){var x=!g&&($>>f&1)==1;q[Math.floor(f/3)][f%3+S-8-3]=x}for(var f=0;f<18;f+=1){var x=!g&&($>>f&1)==1;q[f%3+S-8-3][Math.floor(f/3)]=x}},W=function(g,$){for(var f=N<<3|$,x=i.getBCHTypeInfo(f),A=0;A<15;A+=1){var O=!g&&(x>>A&1)==1;A<6?q[A][8]=O:A<8?q[A+1][8]=O:q[S-15+A][8]=O}for(var A=0;A<15;A+=1){var O=!g&&(x>>A&1)==1;A<8?q[8][S-A-1]=O:A<9?q[8][15-A-1+1]=O:q[8][15-A-1]=O}q[S-8][8]=!g},ee=function(g,$){for(var f=-1,x=S-1,A=7,O=0,H=i.getMaskFunction($),j=S-1;j>0;j-=2)for(j==6&&(j-=1);;){for(var J=0;J<2;J+=1)if(q[x][j-J]==null){var ne=!1;O<g.length&&(ne=(g[O]>>>A&1)==1);var X=H(x,j-J);X&&(ne=!ne),q[x][j-J]=ne,A-=1,A==-1&&(O+=1,A=7)}if(x+=f,x<0||S<=x){x-=f,f=-f;break}}},te=function(g,$){for(var f=0,x=0,A=0,O=new Array($.length),H=new Array($.length),j=0;j<$.length;j+=1){var J=$[j].dataCount,ne=$[j].totalCount-J;x=Math.max(x,J),A=Math.max(A,ne),O[j]=new Array(J);for(var X=0;X<O[j].length;X+=1)O[j][X]=255&g.getBuffer()[X+f];f+=J;var ce=i.getErrorCorrectPolynomial(ne),le=n(O[j],ce.getLength()-1),_e=le.mod(ce);H[j]=new Array(ce.getLength()-1);for(var X=0;X<H[j].length;X+=1){var jt=X+_e.getLength()-H[j].length;H[j][X]=jt>=0?_e.getAt(jt):0}}for(var Y=0,X=0;X<$.length;X+=1)Y+=$[X].totalCount;for(var $e=new Array(Y),xe=0,X=0;X<x;X+=1)for(var j=0;j<$.length;j+=1)X<O[j].length&&($e[xe]=O[j][X],xe+=1);for(var X=0;X<A;X+=1)for(var j=0;j<$.length;j+=1)X<H[j].length&&($e[xe]=H[j][X],xe+=1);return $e},K=function(g,$,f){for(var x=o.getRSBlocks(g,$),A=c(),O=0;O<f.length;O+=1){var H=f[O];A.put(H.getMode(),4),A.put(H.getLength(),i.getLengthInBits(H.getMode(),g)),H.write(A)}for(var j=0,O=0;O<x.length;O+=1)j+=x[O].dataCount;if(A.getLengthInBits()>j*8)throw"code length overflow. ("+A.getLengthInBits()+">"+j*8+")";for(A.getLengthInBits()+4<=j*8&&A.put(0,4);A.getLengthInBits()%8!=0;)A.putBit(!1);for(;!(A.getLengthInBits()>=j*8||(A.put(y,8),A.getLengthInBits()>=j*8));)A.put(T,8);return te(A,x)};z.addData=function(g,$){$=$||"Byte";var f=null;switch($){case"Numeric":f=u(g);break;case"Alphanumeric":f=l(g);break;case"Byte":f=d(g);break;case"Kanji":f=m(g);break;default:throw"mode:"+$}B.push(f),D=null},z.isDark=function(g,$){if(g<0||S<=g||$<0||S<=$)throw g+","+$;return q[g][$]},z.getModuleCount=function(){return S},z.make=function(){if(M<1){for(var g=1;g<40;g++){for(var $=o.getRSBlocks(g,N),f=c(),x=0;x<B.length;x++){var A=B[x];f.put(A.getMode(),4),f.put(A.getLength(),i.getLengthInBits(A.getMode(),g)),A.write(f)}for(var O=0,x=0;x<$.length;x++)O+=$[x].dataCount;if(f.getLengthInBits()<=O*8)break}M=g}_(!1,Q())},z.createTableTag=function(g,$){g=g||2,$=typeof $>"u"?g*4:$;var f="";f+='<table style="',f+=" border-width: 0px; border-style: none;",f+=" border-collapse: collapse;",f+=" padding: 0px; margin: "+$+"px;",f+='">',f+="<tbody>";for(var x=0;x<z.getModuleCount();x+=1){f+="<tr>";for(var A=0;A<z.getModuleCount();A+=1)f+='<td style="',f+=" border-width: 0px; border-style: none;",f+=" border-collapse: collapse;",f+=" padding: 0px; margin: 0px;",f+=" width: "+g+"px;",f+=" height: "+g+"px;",f+=" background-color: ",f+=z.isDark(x,A)?"#000000":"#ffffff",f+=";",f+='"/>';f+="</tr>"}return f+="</tbody>",f+="</table>",f},z.createSvgTag=function(g,$,f,x){var A={};typeof arguments[0]=="object"&&(A=arguments[0],g=A.cellSize,$=A.margin,f=A.alt,x=A.title),g=g||2,$=typeof $>"u"?g*4:$,f=typeof f=="string"?{text:f}:f||{},f.text=f.text||null,f.id=f.text?f.id||"qrcode-description":null,x=typeof x=="string"?{text:x}:x||{},x.text=x.text||null,x.id=x.text?x.id||"qrcode-title":null;var O=z.getModuleCount()*g+$*2,H,j,J,ne,X="",ce;for(ce="l"+g+",0 0,"+g+" -"+g+",0 0,-"+g+"z ",X+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',X+=A.scalable?"":' width="'+O+'px" height="'+O+'px"',X+=' viewBox="0 0 '+O+" "+O+'" ',X+=' preserveAspectRatio="xMinYMin meet"',X+=x.text||f.text?' role="img" aria-labelledby="'+G([x.id,f.id].join(" ").trim())+'"':"",X+=">",X+=x.text?'<title id="'+G(x.id)+'">'+G(x.text)+"</title>":"",X+=f.text?'<description id="'+G(f.id)+'">'+G(f.text)+"</description>":"",X+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',X+='<path d="',J=0;J<z.getModuleCount();J+=1)for(ne=J*g+$,H=0;H<z.getModuleCount();H+=1)z.isDark(J,H)&&(j=H*g+$,X+="M"+j+","+ne+ce);return X+='" stroke="transparent" fill="black"/>',X+="</svg>",X},z.createDataURL=function(g,$){g=g||2,$=typeof $>"u"?g*4:$;var f=z.getModuleCount()*g+$*2,x=$,A=f-$;return L(f,f,function(O,H){if(x<=O&&O<A&&x<=H&&H<A){var j=Math.floor((O-x)/g),J=Math.floor((H-x)/g);return z.isDark(J,j)?0:1}else return 1})},z.createImgTag=function(g,$,f){g=g||2,$=typeof $>"u"?g*4:$;var x=z.getModuleCount()*g+$*2,A="";return A+="<img",A+=' src="',A+=z.createDataURL(g,$),A+='"',A+=' width="',A+=x,A+='"',A+=' height="',A+=x,A+='"',f&&(A+=' alt="',A+=G(f),A+='"'),A+="/>",A};var G=function(g){for(var $="",f=0;f<g.length;f+=1){var x=g.charAt(f);switch(x){case"<":$+="&lt;";break;case">":$+="&gt;";break;case"&":$+="&amp;";break;case'"':$+="&quot;";break;default:$+=x;break}}return $},C=function(g){var $=1;g=typeof g>"u"?$*2:g;var f=z.getModuleCount()*$+g*2,x=g,A=f-g,O,H,j,J,ne,X={"██":"█","█ ":"▀"," █":"▄","  ":" "},ce={"██":"▀","█ ":"▀"," █":" ","  ":" "},le="";for(O=0;O<f;O+=2){for(j=Math.floor((O-x)/$),J=Math.floor((O+1-x)/$),H=0;H<f;H+=1)ne="█",x<=H&&H<A&&x<=O&&O<A&&z.isDark(j,Math.floor((H-x)/$))&&(ne=" "),x<=H&&H<A&&x<=O+1&&O+1<A&&z.isDark(J,Math.floor((H-x)/$))?ne+=" ":ne+="█",le+=g<1&&O+1>=A?ce[ne]:X[ne];le+=`
`}return f%2&&g>0?le.substring(0,le.length-f-1)+Array(f+1).join("▀"):le.substring(0,le.length-1)};return z.createASCII=function(g,$){if(g=g||1,g<2)return C($);g-=1,$=typeof $>"u"?g*2:$;var f=z.getModuleCount()*g+$*2,x=$,A=f-$,O,H,j,J,ne=Array(g+1).join("██"),X=Array(g+1).join("  "),ce="",le="";for(O=0;O<f;O+=1){for(j=Math.floor((O-x)/g),le="",H=0;H<f;H+=1)J=1,x<=H&&H<A&&x<=O&&O<A&&z.isDark(j,Math.floor((H-x)/g))&&(J=0),le+=J?ne:X;for(j=0;j<g;j+=1)ce+=le+`
`}return ce.substring(0,ce.length-1)},z.renderTo2dContext=function(g,$){$=$||2;for(var f=z.getModuleCount(),x=0;x<f;x++)for(var A=0;A<f;A++)g.fillStyle=z.isDark(x,A)?"black":"white",g.fillRect(x*$,A*$,$,$)},z};e.stringToBytesFuncs={default:function(b){for(var E=[],y=0;y<b.length;y+=1){var T=b.charCodeAt(y);E.push(T&255)}return E}},e.stringToBytes=e.stringToBytesFuncs.default,e.createStringToBytes=function(b,E){var y=function(){for(var M=k(b),N=function(){var ie=M.read();if(ie==-1)throw"eof";return ie},q=0,S={};;){var D=M.read();if(D==-1)break;var B=N(),z=N(),_=N(),V=String.fromCharCode(D<<8|B),Q=z<<8|_;S[V]=Q,q+=1}if(q!=E)throw q+" != "+E;return S}(),T=63;return function(M){for(var N=[],q=0;q<M.length;q+=1){var S=M.charCodeAt(q);if(S<128)N.push(S);else{var D=y[M.charAt(q)];typeof D=="number"?(D&255)==D?N.push(D):(N.push(D>>>8),N.push(D&255)):N.push(T)}}return N}};var a={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},t={L:1,M:0,Q:3,H:2},s={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},i=function(){var b=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],E=1335,y=7973,T=21522,M={},N=function(q){for(var S=0;q!=0;)S+=1,q>>>=1;return S};return M.getBCHTypeInfo=function(q){for(var S=q<<10;N(S)-N(E)>=0;)S^=E<<N(S)-N(E);return(q<<10|S)^T},M.getBCHTypeNumber=function(q){for(var S=q<<12;N(S)-N(y)>=0;)S^=y<<N(S)-N(y);return q<<12|S},M.getPatternPosition=function(q){return b[q-1]},M.getMaskFunction=function(q){switch(q){case s.PATTERN000:return function(S,D){return(S+D)%2==0};case s.PATTERN001:return function(S,D){return S%2==0};case s.PATTERN010:return function(S,D){return D%3==0};case s.PATTERN011:return function(S,D){return(S+D)%3==0};case s.PATTERN100:return function(S,D){return(Math.floor(S/2)+Math.floor(D/3))%2==0};case s.PATTERN101:return function(S,D){return S*D%2+S*D%3==0};case s.PATTERN110:return function(S,D){return(S*D%2+S*D%3)%2==0};case s.PATTERN111:return function(S,D){return(S*D%3+(S+D)%2)%2==0};default:throw"bad maskPattern:"+q}},M.getErrorCorrectPolynomial=function(q){for(var S=n([1],0),D=0;D<q;D+=1)S=S.multiply(n([1,r.gexp(D)],0));return S},M.getLengthInBits=function(q,S){if(1<=S&&S<10)switch(q){case a.MODE_NUMBER:return 10;case a.MODE_ALPHA_NUM:return 9;case a.MODE_8BIT_BYTE:return 8;case a.MODE_KANJI:return 8;default:throw"mode:"+q}else if(S<27)switch(q){case a.MODE_NUMBER:return 12;case a.MODE_ALPHA_NUM:return 11;case a.MODE_8BIT_BYTE:return 16;case a.MODE_KANJI:return 10;default:throw"mode:"+q}else if(S<41)switch(q){case a.MODE_NUMBER:return 14;case a.MODE_ALPHA_NUM:return 13;case a.MODE_8BIT_BYTE:return 16;case a.MODE_KANJI:return 12;default:throw"mode:"+q}else throw"type:"+S},M.getLostPoint=function(q){for(var S=q.getModuleCount(),D=0,B=0;B<S;B+=1)for(var z=0;z<S;z+=1){for(var _=0,V=q.isDark(B,z),Q=-1;Q<=1;Q+=1)if(!(B+Q<0||S<=B+Q))for(var ie=-1;ie<=1;ie+=1)z+ie<0||S<=z+ie||Q==0&&ie==0||V==q.isDark(B+Q,z+ie)&&(_+=1);_>5&&(D+=3+_-5)}for(var B=0;B<S-1;B+=1)for(var z=0;z<S-1;z+=1){var R=0;q.isDark(B,z)&&(R+=1),q.isDark(B+1,z)&&(R+=1),q.isDark(B,z+1)&&(R+=1),q.isDark(B+1,z+1)&&(R+=1),(R==0||R==4)&&(D+=3)}for(var B=0;B<S;B+=1)for(var z=0;z<S-6;z+=1)q.isDark(B,z)&&!q.isDark(B,z+1)&&q.isDark(B,z+2)&&q.isDark(B,z+3)&&q.isDark(B,z+4)&&!q.isDark(B,z+5)&&q.isDark(B,z+6)&&(D+=40);for(var z=0;z<S;z+=1)for(var B=0;B<S-6;B+=1)q.isDark(B,z)&&!q.isDark(B+1,z)&&q.isDark(B+2,z)&&q.isDark(B+3,z)&&q.isDark(B+4,z)&&!q.isDark(B+5,z)&&q.isDark(B+6,z)&&(D+=40);for(var U=0,z=0;z<S;z+=1)for(var B=0;B<S;B+=1)q.isDark(B,z)&&(U+=1);var W=Math.abs(100*U/S/S-50)/5;return D+=W*10,D},M}(),r=function(){for(var b=new Array(256),E=new Array(256),y=0;y<8;y+=1)b[y]=1<<y;for(var y=8;y<256;y+=1)b[y]=b[y-4]^b[y-5]^b[y-6]^b[y-8];for(var y=0;y<255;y+=1)E[b[y]]=y;var T={};return T.glog=function(M){if(M<1)throw"glog("+M+")";return E[M]},T.gexp=function(M){for(;M<0;)M+=255;for(;M>=256;)M-=255;return b[M]},T}();function n(b,E){if(typeof b.length>"u")throw b.length+"/"+E;var y=function(){for(var M=0;M<b.length&&b[M]==0;)M+=1;for(var N=new Array(b.length-M+E),q=0;q<b.length-M;q+=1)N[q]=b[q+M];return N}(),T={};return T.getAt=function(M){return y[M]},T.getLength=function(){return y.length},T.multiply=function(M){for(var N=new Array(T.getLength()+M.getLength()-1),q=0;q<T.getLength();q+=1)for(var S=0;S<M.getLength();S+=1)N[q+S]^=r.gexp(r.glog(T.getAt(q))+r.glog(M.getAt(S)));return n(N,0)},T.mod=function(M){if(T.getLength()-M.getLength()<0)return T;for(var N=r.glog(T.getAt(0))-r.glog(M.getAt(0)),q=new Array(T.getLength()),S=0;S<T.getLength();S+=1)q[S]=T.getAt(S);for(var S=0;S<M.getLength();S+=1)q[S]^=r.gexp(r.glog(M.getAt(S))+N);return n(q,0).mod(M)},T}var o=function(){var b=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],E=function(M,N){var q={};return q.totalCount=M,q.dataCount=N,q},y={},T=function(M,N){switch(N){case t.L:return b[(M-1)*4+0];case t.M:return b[(M-1)*4+1];case t.Q:return b[(M-1)*4+2];case t.H:return b[(M-1)*4+3];default:return}};return y.getRSBlocks=function(M,N){var q=T(M,N);if(typeof q>"u")throw"bad rs block @ typeNumber:"+M+"/errorCorrectionLevel:"+N;for(var S=q.length/3,D=[],B=0;B<S;B+=1)for(var z=q[B*3+0],_=q[B*3+1],V=q[B*3+2],Q=0;Q<z;Q+=1)D.push(E(_,V));return D},y}(),c=function(){var b=[],E=0,y={};return y.getBuffer=function(){return b},y.getAt=function(T){var M=Math.floor(T/8);return(b[M]>>>7-T%8&1)==1},y.put=function(T,M){for(var N=0;N<M;N+=1)y.putBit((T>>>M-N-1&1)==1)},y.getLengthInBits=function(){return E},y.putBit=function(T){var M=Math.floor(E/8);b.length<=M&&b.push(0),T&&(b[M]|=128>>>E%8),E+=1},y},u=function(b){var E=a.MODE_NUMBER,y=b,T={};T.getMode=function(){return E},T.getLength=function(q){return y.length},T.write=function(q){for(var S=y,D=0;D+2<S.length;)q.put(M(S.substring(D,D+3)),10),D+=3;D<S.length&&(S.length-D==1?q.put(M(S.substring(D,D+1)),4):S.length-D==2&&q.put(M(S.substring(D,D+2)),7))};var M=function(q){for(var S=0,D=0;D<q.length;D+=1)S=S*10+N(q.charAt(D));return S},N=function(q){if("0"<=q&&q<="9")return q.charCodeAt(0)-48;throw"illegal char :"+q};return T},l=function(b){var E=a.MODE_ALPHA_NUM,y=b,T={};T.getMode=function(){return E},T.getLength=function(N){return y.length},T.write=function(N){for(var q=y,S=0;S+1<q.length;)N.put(M(q.charAt(S))*45+M(q.charAt(S+1)),11),S+=2;S<q.length&&N.put(M(q.charAt(S)),6)};var M=function(N){if("0"<=N&&N<="9")return N.charCodeAt(0)-48;if("A"<=N&&N<="Z")return N.charCodeAt(0)-65+10;switch(N){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+N}};return T},d=function(b){var E=a.MODE_8BIT_BYTE,y=e.stringToBytes(b),T={};return T.getMode=function(){return E},T.getLength=function(M){return y.length},T.write=function(M){for(var N=0;N<y.length;N+=1)M.put(y[N],8)},T},m=function(b){var E=a.MODE_KANJI,y=e.stringToBytesFuncs.SJIS;if(!y)throw"sjis not supported.";(function(N,q){var S=y(N);if(S.length!=2||(S[0]<<8|S[1])!=q)throw"sjis not supported."})("友",38726);var T=y(b),M={};return M.getMode=function(){return E},M.getLength=function(N){return~~(T.length/2)},M.write=function(N){for(var q=T,S=0;S+1<q.length;){var D=(255&q[S])<<8|255&q[S+1];if(33088<=D&&D<=40956)D-=33088;else if(57408<=D&&D<=60351)D-=49472;else throw"illegal char at "+(S+1)+"/"+D;D=(D>>>8&255)*192+(D&255),N.put(D,13),S+=2}if(S<q.length)throw"illegal char at "+(S+1)},M},p=function(){var b=[],E={};return E.writeByte=function(y){b.push(y&255)},E.writeShort=function(y){E.writeByte(y),E.writeByte(y>>>8)},E.writeBytes=function(y,T,M){T=T||0,M=M||y.length;for(var N=0;N<M;N+=1)E.writeByte(y[N+T])},E.writeString=function(y){for(var T=0;T<y.length;T+=1)E.writeByte(y.charCodeAt(T))},E.toByteArray=function(){return b},E.toString=function(){var y="";y+="[";for(var T=0;T<b.length;T+=1)T>0&&(y+=","),y+=b[T];return y+="]",y},E},v=function(){var b=0,E=0,y=0,T="",M={},N=function(S){T+=String.fromCharCode(q(S&63))},q=function(S){if(!(S<0)){if(S<26)return 65+S;if(S<52)return 97+(S-26);if(S<62)return 48+(S-52);if(S==62)return 43;if(S==63)return 47}throw"n:"+S};return M.writeByte=function(S){for(b=b<<8|S&255,E+=8,y+=1;E>=6;)N(b>>>E-6),E-=6},M.flush=function(){if(E>0&&(N(b<<6-E),b=0,E=0),y%3!=0)for(var S=3-y%3,D=0;D<S;D+=1)T+="="},M.toString=function(){return T},M},k=function(b){var E=b,y=0,T=0,M=0,N={};N.read=function(){for(;M<8;){if(y>=E.length){if(M==0)return-1;throw"unexpected end of file./"+M}var S=E.charAt(y);if(y+=1,S=="=")return M=0,-1;if(S.match(/^\s$/))continue;T=T<<6|q(S.charCodeAt(0)),M+=6}var D=T>>>M-8&255;return M-=8,D};var q=function(S){if(65<=S&&S<=90)return S-65;if(97<=S&&S<=122)return S-97+26;if(48<=S&&S<=57)return S-48+52;if(S==43)return 62;if(S==47)return 63;throw"c:"+S};return N},w=function(b,E){var y=b,T=E,M=new Array(b*E),N={};N.setPixel=function(B,z,_){M[z*y+B]=_},N.write=function(B){B.writeString("GIF87a"),B.writeShort(y),B.writeShort(T),B.writeByte(128),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(255),B.writeByte(255),B.writeByte(255),B.writeString(","),B.writeShort(0),B.writeShort(0),B.writeShort(y),B.writeShort(T),B.writeByte(0);var z=2,_=S(z);B.writeByte(z);for(var V=0;_.length-V>255;)B.writeByte(255),B.writeBytes(_,V,255),V+=255;B.writeByte(_.length-V),B.writeBytes(_,V,_.length-V),B.writeByte(0),B.writeString(";")};var q=function(B){var z=B,_=0,V=0,Q={};return Q.write=function(ie,R){if(ie>>>R)throw"length over";for(;_+R>=8;)z.writeByte(255&(ie<<_|V)),R-=8-_,ie>>>=8-_,V=0,_=0;V=ie<<_|V,_=_+R},Q.flush=function(){_>0&&z.writeByte(V)},Q},S=function(B){for(var z=1<<B,_=(1<<B)+1,V=B+1,Q=D(),ie=0;ie<z;ie+=1)Q.add(String.fromCharCode(ie));Q.add(String.fromCharCode(z)),Q.add(String.fromCharCode(_));var R=p(),U=q(R);U.write(z,V);var W=0,ee=String.fromCharCode(M[W]);for(W+=1;W<M.length;){var te=String.fromCharCode(M[W]);W+=1,Q.contains(ee+te)?ee=ee+te:(U.write(Q.indexOf(ee),V),Q.size()<4095&&(Q.size()==1<<V&&(V+=1),Q.add(ee+te)),ee=te)}return U.write(Q.indexOf(ee),V),U.write(_,V),U.flush(),R.toByteArray()},D=function(){var B={},z=0,_={};return _.add=function(V){if(_.contains(V))throw"dup key:"+V;B[V]=z,z+=1},_.size=function(){return z},_.indexOf=function(V){return B[V]},_.contains=function(V){return typeof B[V]<"u"},_};return N},L=function(b,E,y){for(var T=w(b,E),M=0;M<E;M+=1)for(var N=0;N<b;N+=1)T.setPixel(N,M,y(N,M));var q=p();T.write(q);for(var S=v(),D=q.toByteArray(),B=0;B<D.length;B+=1)S.writeByte(D[B]);return S.flush(),"data:image/gif;base64,"+S};return e}();(function(){Qt.stringToBytesFuncs["UTF-8"]=function(e){function a(t){for(var s=[],i=0;i<t.length;i++){var r=t.charCodeAt(i);r<128?s.push(r):r<2048?s.push(192|r>>6,128|r&63):r<55296||r>=57344?s.push(224|r>>12,128|r>>6&63,128|r&63):(i++,r=65536+((r&1023)<<10|t.charCodeAt(i)&1023),s.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63))}return s}return a(e)}})();Qt.stringToBytes=Qt.stringToBytesFuncs["UTF-8"];const ft={ean13:{label:"EAN-13",hint:"12 rakam girin, 13. hane (kontrol) otomatik eklenir",linear:!0},ean8:{label:"EAN-8",hint:"7 rakam girin, 8. hane (kontrol) otomatik eklenir",linear:!0},code128:{label:"Code 128",hint:"Harf, rakam ve işaret (Türkçe karakter hariç)",linear:!0},code39:{label:"Code 39",hint:"Büyük harf, rakam ve - . $ / + % boşluk",linear:!0},qr:{label:"QR Kod",hint:"Her türlü metin; Türkçe karakter kullanılabilir",linear:!1}},La=["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"],Ea=La.map(e=>[...e].map(a=>a==="0"?"1":"0").join("")),sr=Ea.map(e=>[...e].reverse().join("")),nr=["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];function Wa(e){let a=0;for(let t=0;t<e.length;t++){const s=Number(e[e.length-1-t]);a+=s*(t%2===0?3:1)}return String((10-a%10)%10)}const rr=["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"],lr=104,Xa=105,or=100,cr=99,dr=106;function ur(e){const a=[];return[...e].forEach((t,s)=>{for(let i=0;i<Number(t);i++)a.push(s%2===0?1:0)}),a}function pr(e){const a=String(e),t=c=>a.charCodeAt(c)>=48&&a.charCodeAt(c)<=57,s=c=>{let u=0;for(;c+u<a.length&&t(c+u);)u++;return u},i=[];let r=null,n=0;for(;n<a.length;){const c=s(n);r===null?c===a.length&&c>=2||c>=4?(r="C",i.push(Xa)):(r="B",i.push(lr)):r==="B"&&(c>=6||c>=4&&n+c===a.length)?(r="C",i.push(cr)):r==="C"&&c<2&&(r="B",i.push(or)),r==="C"?(i.push(Number(a.slice(n,n+2))),n+=2):(i.push(a.charCodeAt(n)-32),n+=1)}let o=i[0];for(let c=1;c<i.length;c++)o+=i[c]*c;return i.push(o%103,dr),i}const Ti={0:"nnnwwnwnn",1:"wnnwnnnnw",2:"nnwwnnnnw",3:"wnwwnnnnn",4:"nnnwwnnnw",5:"wnnwwnnnn",6:"nnwwwnnnn",7:"nnnwnnwnw",8:"wnnwnnwnn",9:"nnwwnnwnn",A:"wnnnnwnnw",B:"nnwnnwnnw",C:"wnwnnwnnn",D:"nnnnwwnnw",E:"wnnnwwnnn",F:"nnwnwwnnn",G:"nnnnnwwnw",H:"wnnnnwwnn",I:"nnwnnwwnn",J:"nnnnwwwnn",K:"wnnnnnnww",L:"nnwnnnnww",M:"wnwnnnnwn",N:"nnnnwnnww",O:"wnnnwnnwn",P:"nnwnwnnwn",Q:"nnnnnnwww",R:"wnnnnnwwn",S:"nnwnnnwwn",T:"nnnnwnwwn",U:"wwnnnnnnw",V:"nwwnnnnnw",W:"wwwnnnnnn",X:"nwnnwnnnw",Y:"wwnnwnnnn",Z:"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn",$:"nwnwnwnnn","/":"nwnwnnnwn","+":"nwnnnwnwn","%":"nnnwnwnwn"};function Aa(e,a){const t=String(a??"").trim();if(!t)return{ok:!1,error:"Barkod değeri boş."};switch(e){case"ean13":{if(!/^\d{12,13}$/.test(t))return{ok:!1,error:"EAN-13 için 12 veya 13 rakam girin."};const s=t.slice(0,12),i=Wa(s);return t.length===13&&t[12]!==i?{ok:!1,error:`Kontrol hanesi hatalı (doğrusu ${i}). 12 rakam girerseniz otomatik eklenir.`}:{ok:!0,value:s+i}}case"ean8":{if(!/^\d{7,8}$/.test(t))return{ok:!1,error:"EAN-8 için 7 veya 8 rakam girin."};const s=t.slice(0,7),i=Wa(s);return t.length===8&&t[7]!==i?{ok:!1,error:`Kontrol hanesi hatalı (doğrusu ${i}). 7 rakam girerseniz otomatik eklenir.`}:{ok:!0,value:s+i}}case"code128":return t.length>48?{ok:!1,error:"Code 128 için en fazla 48 karakter."}:[...t].some(s=>s.charCodeAt(0)<32||s.charCodeAt(0)>126)?{ok:!1,error:"Code 128 Türkçe/özel karakter içeremez. QR Kod kullanın."}:{ok:!0,value:t};case"code39":{const s=t.toUpperCase();return s.length>30?{ok:!1,error:"Code 39 için en fazla 30 karakter."}:[...s].some(i=>i==="*"||!(i in Ti))?{ok:!1,error:"Code 39 yalnızca A-Z, 0-9 ve - . $ / + % boşluk destekler."}:{ok:!0,value:s}}case"qr":return t.length>300?{ok:!1,error:"QR için en fazla 300 karakter."}:{ok:!0,value:t};default:return{ok:!1,error:"Bilinmeyen barkod türü."}}}function mr(e,a){const t=Aa(e,a);if(!t.ok)throw new Error(t.error);const s=t.value;if(e==="ean13"){const n=nr[Number(s[0])];let o="101";for(let c=1;c<=6;c++)o+=(n[c-1]==="L"?La:sr)[Number(s[c])];o+="01010";for(let c=7;c<=12;c++)o+=Ea[Number(s[c])];return o+="101",{kind:"linear",bits:[...o].map(Number),text:s,ean:{lead:s[0],left:s.slice(1,7),right:s.slice(7)}}}if(e==="ean8"){let n="101";for(let o=0;o<4;o++)n+=La[Number(s[o])];n+="01010";for(let o=4;o<8;o++)n+=Ea[Number(s[o])];return n+="101",{kind:"linear",bits:[...n].map(Number),text:s,ean:{lead:"",left:s.slice(0,4),right:s.slice(4)}}}if(e==="code128"){const n=[];return pr(s).forEach(o=>n.push(...ur(rr[o]))),{kind:"linear",bits:n,text:s}}if(e==="code39"){const n=[],o=`*${s}*`;return[...o].forEach((c,u)=>{[...Ti[c]].forEach((l,d)=>{const m=l==="w"?3:1;for(let p=0;p<m;p++)n.push(d%2===0?1:0)}),u<o.length-1&&n.push(0)}),{kind:"linear",bits:n,text:s}}const i=Qt(0,s.length>120?"L":"M");return i.addData(s),i.make(),{kind:"matrix",size:i.getModuleCount(),cell:(n,o)=>i.isDark(o,n),text:s}}const xt=[{id:"25x15",label:"25 × 15 mm",w:25,h:15,kind:"roll",note:"Küçük ürün / takı"},{id:"30x20",label:"30 × 20 mm",w:30,h:20,kind:"roll",note:"Küçük ürün"},{id:"40x20",label:"40 × 20 mm",w:40,h:20,kind:"roll",note:"Standart raf / ürün"},{id:"40x30",label:"40 × 30 mm",w:40,h:30,kind:"roll",note:"Standart ürün"},{id:"50x25",label:"50 × 25 mm",w:50,h:25,kind:"roll",note:"Standart ürün"},{id:"50x30",label:"50 × 30 mm",w:50,h:30,kind:"roll",note:"En yaygın"},{id:"60x40",label:"60 × 40 mm",w:60,h:40,kind:"roll",note:"Koli / kutu"},{id:"80x50",label:"80 × 50 mm",w:80,h:50,kind:"roll",note:"Koli"},{id:"100x50",label:"100 × 50 mm",w:100,h:50,kind:"roll",note:"Büyük koli"},{id:"100x70",label:"100 × 70 mm",w:100,h:70,kind:"roll",note:"Palet / koli"},{id:"100x100",label:"100 × 100 mm",w:100,h:100,kind:"roll",note:"Palet"},{id:"100x150",label:"100 × 150 mm",w:100,h:150,kind:"roll",note:"Sevkiyat / palet"},{id:"A4-24",label:"A4 yaprak · 24’lü (3×8)",w:70,h:37,kind:"sheet",page:{w:210,h:297},cols:3,rows:8,ml:0,mt:0,gx:0,gy:0,note:"70 × 37 mm"},{id:"A4-65",label:"A4 yaprak · 65’li (5×13)",w:38,h:21.2,kind:"sheet",page:{w:210,h:297},cols:5,rows:13,ml:10,mt:10.7,gx:2.5,gy:0,note:"38 × 21,2 mm"},{id:"A4-12",label:"A4 yaprak · 12’li (2×6)",w:99,h:42,kind:"sheet",page:{w:210,h:297},cols:2,rows:6,ml:6,mt:21,gx:0,gy:0,note:"99 × 42 mm"}];function Pt(e,a){if(e==="custom"){const t=Math.min(200,Math.max(10,Number(a&&a.w)||50)),s=Math.min(300,Math.max(8,Number(a&&a.h)||30));return{id:"custom",label:`Özel ${t} × ${s} mm`,w:t,h:s,kind:"roll"}}return xt.find(t=>t.id===e)||xt.find(t=>t.id==="50x30")}const Za=(e,a,t)=>Math.min(t,Math.max(a,e)),hr=e=>String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]);function Jt(e,a,t){let s=0;for(const i of String(e))s+=/[A-ZÇĞİÖŞÜ0-9%@#&MW]/.test(i)?.64:/[il.,:;'|! ]/.test(i)?.27:/[mw]/.test(i)?.8:.52;return s*a*(t?1.06:1)}function Re(e,a,t,s){const i=String(e||"");if(Jt(i,a,s)<=t)return i;let r=i;for(;r.length>1&&Jt(r+"…",a,s)>t;)r=r.slice(0,-1);return r.trimEnd()+"…"}function ua(e,a,t,s,i){const r=String(e||"").split(/\s+/).filter(Boolean),n=[];let o="";for(const u of r){const l=o?`${o} ${u}`:u;if(Jt(l,a,i)<=t)o=l;else if(o&&n.push(o),o=u,n.length===s-1)break}return o&&n.length<s&&n.push(o),n.join(" ").length<r.join(" ").length&&n.length&&(n[n.length-1]=Re(n[n.length-1]+"…",a,t,i)),n.map(u=>Re(u,a,t,i))}const vr=(e,a)=>e==null||e===""||Number.isNaN(Number(e))?"":`${Number(e).toLocaleString("tr-TR",{minimumFractionDigits:Number(e)%1?2:0,maximumFractionDigits:2})} ${a||"₺"}`;function Rt(e,a={}){const t=Number(e.wMm),s=Number(e.hMm),i={name:!0,price:!0,code:!0,company:!1,text:!0,...e.show||{}},r=mr(e.format,e.value),n=[],o=[],c=a.dpi||0,u=c?25.4/c:0,l=U=>u?Math.round(U/u)*u:U,d=Za(Math.min(t,s)*.07,1,3),m=t-2*d,p=s-2*d,v=Za(s*.1,1.7,4.2),k=i.price?vr(e.price,e.currency):"",w=i.code&&e.code||"",L=(U,W,ee,te)=>n.push({t:"r",x:U,y:W,w:ee,h:te}),b=(U,W,ee,te,K="l",G=!1)=>n.push({t:"t",x:U,y:W,s:te,text:ee,a:K,b:G});if(r.kind==="matrix"){const W=r.size+6,ee=t>=1.45*s,te=(K,G,C)=>{let g=C/W;u&&(g=Math.max(1,Math.floor(g/u))*u);const $=g*W,f=l(K+(C-$)/2+3*g),x=l(G+(C-$)/2+3*g);g<.25&&!u&&o.push("QR kod bu boyutta çok küçük; okunmayabilir.");for(let A=0;A<r.size;A++){let O=0;for(;O<r.size;){if(!r.cell(O,A)){O++;continue}let H=1;for(;O+H<r.size&&r.cell(O+H,A);)H++;L(f+O*g,x+A*g,H*g,g),O+=H}}return g};if(ee){const K=p;te(d,d,K)<.25&&u&&o.push("QR kod bu çözünürlükte çok küçük; okunmayabilir.");const C=d+K+d,g=t-C-d,$=[];i.company&&e.company&&$.push({s:Re(e.company,v*.75,g),size:v*.75,b:!1}),i.name&&e.name&&ua(e.name,v,g,s>=30?3:2,!0).forEach(A=>$.push({s:A,size:v,b:!0})),k&&$.push({s:k,size:v*1.3,b:!0}),w&&$.push({s:Re(w,v*.8,g),size:v*.8,b:!1});const f=$.reduce((A,O)=>A+O.size*1.2,0);let x=d+(p-f)/2;$.forEach(A=>{x+=A.size*1.05,b(C,x,A.s,A.size,"l",A.b),x+=A.size*.15})}else{const K=[];i.company&&e.company&&s>=30&&K.push({s:Re(e.company,v*.75,m),size:v*.75,b:!1}),i.name&&e.name&&ua(e.name,v,m,s>=45?2:1,!0).forEach(x=>K.push({s:x,size:v,b:!0})),k&&K.push({s:k,size:v*1.25,b:!0});const G=w?[{s:Re(w,v*.8,m),size:v*.8}]:[],C=K.reduce((x,A)=>x+A.size*1.2,0),g=G.reduce((x,A)=>x+A.size*1.2,0),$=Math.min(m,p-C-g);let f=d;K.forEach(x=>{f+=x.size*1.05,b(t/2,f,x.s,x.size,"m",x.b),f+=x.size*.15}),$<8&&o.push("Etiket QR kod için fazla küçük."),te(d+(m-$)/2,f+.3,$),f+=$+.3,G.forEach(x=>{f+=x.size*1.05,b(t/2,f,x.s,x.size,"m")})}return{w:t,h:s,ops:n,warnings:o,enc:r}}const E=r.bits.length,y=10,T=.5,M=v*.9,N=Math.max(6,s*.26),q=U=>{const W=[];i.company&&e.company&&s>=25&&!U.company&&W.push({k:"company",h:v*.75*1.2});const ee=s>=42?2:1,te=k&&!U.price&&t>=35&&i.name&&e.name;i.name&&e.name&&!U.name&&W.push({k:"name",h:v*1.2*(U.oneLine?1:ee),lines:U.oneLine?1:ee,inline:te}),k&&!U.price&&!te&&W.push({k:"price",h:v*1.3*1.2});const K=i.text&&!U.human?M*1.25:0,G=w&&!U.code&&w!==r.text?v*.8*1.2:0,C=W.reduce((g,$)=>g+$.h+T,0)+K+G;return{rows:W,humanRow:K,codeRow:G,barH:p-C-T*0,priceInline:te}},S=[{},{company:!0},{company:!0,oneLine:!0},{company:!0,oneLine:!0,code:!0},{company:!0,oneLine:!0,code:!0,price:!0},{company:!0,name:!0,code:!0,price:!0},{company:!0,name:!0,code:!0,price:!0,human:!0}];let D=q(S[0]);for(const U of S)if(D=q(U),D.barH>=N)break;D.barH<4&&(D.barH=Math.max(3,D.barH),o.push("Etiket bu içerik için fazla küçük; barkod yüksekliği yetersiz."));let B=m/(E+2*y);if(B=Math.min(B,.7),u){const U=Math.floor(B/u);U<1?(o.push("Barkod bu genişlikte yazıcı çözünürlüğüne sığmıyor."),B=u):B=U*u}else B=Math.floor(B*100)/100;B<.19&&o.push(`Barkod çizgileri çok ince (${B.toFixed(2)} mm); okuyucu zorlanabilir. Daha büyük etiket veya daha kısa değer seçin.`);const z=E*B,_=Math.min(D.barH,Math.max(z*.6,N),40),V=D.rows.reduce((U,W)=>U+W.h+T,0)+_+T+D.humanRow+D.codeRow;let Q=d+Math.max(0,(p-V)/2);D.rows.forEach(U=>{if(U.k==="company"&&(Q+=v*.75*1.05,b(t/2,Q,Re(e.company,v*.75,m),v*.75,"m"),Q+=v*.75*.15+T),U.k==="name"){const W=U.inline?Jt(k,v*1.15,!0)+1:0;ua(e.name,v,m-W,U.lines,!0).forEach((te,K)=>{Q+=v*1.05,b(d,Q,te,v,"l",!0),U.inline&&K===0&&b(t-d,Q,k,v*1.15,"r",!0),Q+=v*.15}),Q+=T}U.k==="price"&&(Q+=v*1.3*1.05,b(t-d,Q,k,v*1.3,"r",!0),Q+=v*1.3*.15+T)});const ie=l(d+(m-z)/2),R=l(Q);for(let U=0;U<E;){if(!r.bits[U]){U++;continue}let W=1;for(;U+W<E&&r.bits[U+W];)W++;L(ie+U*B,R,W*B,l(_)),U+=W}if(Q=R+l(_)+T,D.humanRow){Q+=M*1;const U=r.ean?r.ean.lead?`${r.ean.lead}  ${r.ean.left}  ${r.ean.right}`:`${r.ean.left}  ${r.ean.right}`:r.text;b(t/2,Q,Re(U,M,m),M,"m"),Q+=M*.25}return D.codeRow&&(Q+=v*.8*1.05,b(t/2,Q,Re(w,v*.8,m),v*.8,"m")),{w:t,h:s,ops:n,warnings:o,enc:r,xdim:B}}function Ma(e,{border:a=!1}={}){const{w:t,h:s,ops:i}=e,r=o=>Math.round(o*1e3)/1e3;let n="";for(const o of i)o.t==="r"?n+=`<rect x="${r(o.x)}" y="${r(o.y)}" width="${r(o.w)}" height="${r(o.h)}"/>`:n+=`<text x="${r(o.x)}" y="${r(o.y)}" font-size="${r(o.s)}" text-anchor="${o.a==="m"?"middle":o.a==="r"?"end":"start"}"${o.b?' font-weight="700"':""}>${hr(o.text)}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" width="${t}mm" height="${s}mm" fill="#000" font-family="Arial, Helvetica, sans-serif" shape-rendering="crispEdges" text-rendering="geometricPrecision"><rect x="0" y="0" width="${t}" height="${s}" fill="#fff"${a?' stroke="#bbb" stroke-width="0.2"':""}/>${n}</svg>`}function br(e,a){const t=a/25.4,s=Math.round(e.w*t),i=Math.round(e.h*t),n=(typeof OffscreenCanvas<"u"?new OffscreenCanvas(s,i):Object.assign(document.createElement("canvas"),{width:s,height:i})).getContext("2d",{willReadFrequently:!0});n.fillStyle="#fff",n.fillRect(0,0,s,i),n.fillStyle="#000";for(const l of e.ops)if(l.t==="r"){const d=Math.round(l.x*t),m=Math.round((l.x+l.w)*t),p=Math.round(l.y*t),v=Math.round((l.y+l.h)*t);n.fillRect(d,p,Math.max(1,m-d),Math.max(1,v-p))}else n.font=`${l.b?"700 ":""}${Math.max(6,l.s*t)}px Arial, Helvetica, sans-serif`,n.textAlign=l.a==="m"?"center":l.a==="r"?"right":"left",n.textBaseline="alphabetic",n.fillText(l.text,l.x*t,l.y*t);const o=n.getImageData(0,0,s,i).data,c=Math.ceil(s/8),u=new Uint8Array(c*i);for(let l=0;l<i;l++)for(let d=0;d<s;d++){const m=(l*s+d)*4;.299*o[m]+.587*o[m+1]+.114*o[m+2]<150&&(u[l*c+(d>>3)]|=128>>(d&7))}return{wPx:s,hPx:i,rowBytes:c,data:u}}function fr(e,a,{startCell:t=0}={}){const s=[];e.forEach(r=>{for(let n=0;n<Math.max(1,r.copies|0);n++)s.push(Ma(r.layout))});const i="html,body{margin:0;padding:0;background:#fff}svg{display:block}";if(a.kind==="sheet"){const r=a.cols*a.rows,n=[],o=Array(t).fill("").concat(s);for(let u=0;u<o.length;u+=r)n.push(o.slice(u,u+r));const c=n.map(u=>`<div class="pg">${u.map((l,d)=>{if(!l)return"";const m=d%a.cols,p=Math.floor(d/a.cols),v=a.ml+m*(a.w+a.gx),k=a.mt+p*(a.h+a.gy);return`<div class="cell" style="left:${v}mm;top:${k}mm">${l}</div>`}).join("")}</div>`).join("");return`<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${a.page.w}mm ${a.page.h}mm;margin:0}${i}.pg{position:relative;width:${a.page.w}mm;height:${a.page.h}mm;page-break-after:always;overflow:hidden}.cell{position:absolute;width:${a.w}mm;height:${a.h}mm;overflow:hidden}</style>${c}`}return`<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${a.w}mm ${a.h}mm;margin:0}${i}.l{width:${a.w}mm;height:${a.h}mm;overflow:hidden;page-break-after:always;break-after:page}.l:last-child{page-break-after:auto;break-after:auto}</style>`+s.map(r=>`<div class="l">${r}</div>`).join("")}const ja=new TextEncoder,gr=(...e)=>{const a=new Uint8Array(e.reduce((s,i)=>s+i.length,0));let t=0;return e.forEach(s=>{a.set(s,t),t+=s.length}),a},ei="0123456789ABCDEF";function yr(e){let a="";for(let t=0;t<e.length;t++)a+=ei[e[t]>>4]+ei[e[t]&15];return a}function kr(e,{copies:a=1,media:t="gap",darkness:s=0}={}){const i=e.data.length,n=`^XA^CI28^MN${t==="continuous"?"N":t==="mark"?"M":"Y"}^PW${e.wPx}^LL${e.hPx}^LH0,0${s?`~SD${s}`:""}^FO0,0^GFA,${i},${i},${e.rowBytes},${yr(e.data)}^FS^PQ${Math.max(1,a|0)},0,1,N^XZ`;return ja.encode(n)}function $r(e,{copies:a=1,wMm:t,hMm:s,gapMm:i=3,direction:r=1,speed:n=4,density:o=8,media:c="gap"}={}){const u=new Uint8Array(e.data.length);for(let p=0;p<u.length;p++)u[p]=~e.data[p]&255;const l=c==="continuous"?"GAP 0 mm,0 mm":c==="mark"?`BLINE ${i} mm,0 mm`:`GAP ${i} mm,0 mm`,d=ja.encode(`SIZE ${t} mm,${s} mm\r
${l}\r
SPEED ${n}\r
DENSITY ${o}\r
DIRECTION ${r}\r
REFERENCE 0,0\r
CLS\r
BITMAP 0,0,${e.rowBytes},${e.hPx},0,`),m=ja.encode(`\r
PRINT ${Math.max(1,a|0)},1\r
`);return gr(d,u,m)}function Li(e,a,t){const s=br(e,a.dpi||203);return a.language==="tspl"?$r(s,{copies:t,wMm:e.w,hMm:e.h,gapMm:a.gap??3,direction:a.direction??1,media:a.media||"gap"}):kr(s,{copies:t,media:a.media||"gap"})}const wr={mode:"browser",language:"zpl",dpi:203,media:"gap",gap:3,direction:1,baud:115200,agentUrl:"http://127.0.0.1:9101",agentTarget:"tcp",agentHost:"",agentPort:9100,agentPrinter:""};function xr(e,a={}){let t={};try{t=JSON.parse(localStorage.getItem(e)||"{}")}catch{}return{...wr,...a,...t}}function Sr(e,a){try{localStorage.setItem(e,JSON.stringify(a))}catch{}}function Tr(e,a,t){return new Promise(s=>{const i=fr(e,a,t),r=document.createElement("iframe");r.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden",document.body.appendChild(r);const n=r.contentWindow.document;n.open(),n.write(i),n.close(),setTimeout(()=>{try{r.contentWindow.focus(),r.contentWindow.print()}finally{setTimeout(()=>{r.remove(),s()},1500)}},250)})}const Ra=()=>typeof navigator<"u"&&"serial"in navigator;async function Lr(e,{baud:a=115200}={}){if(!Ra())throw new Error("Bu tarayıcı Web Serial desteklemiyor (Chrome/Edge kullanın).");let t=(await navigator.serial.getPorts())[0];t||(t=await navigator.serial.requestPort()),await t.open({baudRate:a});try{const s=t.writable.getWriter();try{for(let i=0;i<e.length;i+=4096)await s.write(e.subarray(i,i+4096))}finally{s.releaseLock()}}finally{await t.close()}}async function Er(){if(Ra())for(const e of await navigator.serial.getPorts())try{await e.forget()}catch{}}const Ar=e=>{let a="";for(let t=0;t<e.length;t+=32768)a+=String.fromCharCode(...e.subarray(t,t+32768));return btoa(a)};function Mr(e){return e.agentTarget==="printer"?{type:"printer",name:e.agentPrinter}:{type:"tcp",host:e.agentHost,port:Number(e.agentPort)||9100}}async function jr(e){return(await fetch(`${e.agentUrl}/health`,{signal:AbortSignal.timeout(2500)})).json()}async function qr(e){return(await(await fetch(`${e.agentUrl}/printers`,{signal:AbortSignal.timeout(6e3)})).json()).printers||[]}async function Nr(e,a,t="Etiket"){let s;try{s=await fetch(`${a.agentUrl}/print`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target:Mr(a),data:Ar(e),jobName:t}),signal:AbortSignal.timeout(2e4)})}catch{throw new Error("Yazdırma ajanına ulaşılamadı. Ajanın bu bilgisayarda çalıştığından ve adresin doğru olduğundan emin olun.")}const i=await s.json().catch(()=>({}));if(!s.ok||i.success===!1)throw new Error(i.message||`Ajan hatası (${s.status})`)}async function pa(e,a,t,{startCell:s=0}={}){if(t.mode==="browser"||a.kind==="sheet"){if(t.mode!=="browser"&&a.kind==="sheet")throw new Error("A4 yaprak etiketler yalnızca “Tarayıcı / sürücü” ile yazdırılır.");return Tr(e,a,{startCell:s})}for(const i of e){const r=Li(i.layout,t,Math.max(1,i.copies|0));if(t.mode==="serial")await Lr(r,{baud:t.baud});else if(t.mode==="agent")await Nr(r,t,a.label);else throw new Error("Bilinmeyen yazıcı bağlantısı.")}}function Cr(e,a,t,s="etiket"){const i=Li(e,a,t),r=document.createElement("a");r.href=URL.createObjectURL(new Blob([i],{type:"application/octet-stream"})),r.download=`${s}.${a.language==="tspl"?"tspl":"zpl"}`,document.body.appendChild(r),r.click(),setTimeout(()=>{URL.revokeObjectURL(r.href),r.remove()},1e3)}const Dr=["Genel","Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj"],Ir=["Adet","Kutu","Koli","Paket","Kg","Litre","Metre","Çift"],ma=e=>{const a=new Date(e);return isNaN(a)?"":a.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})};function Pr(){var b;const e=document.createElement("div");e.className="page-barcode page-container",e.appendChild(ue({title:((b=F.modules.barcode)==null?void 0:b.label)||"Barkod Oluştur",gradientClass:"gradient-stock"}));const a=document.createElement("div");a.className="content-area",e.appendChild(a);const t=F.barcode||{},s=`${F.storageKeys.settings}_barcode_ui`,i=`${F.storageKeys.settings}_printer`;let r={format:t.defaultFormat||"ean13",size:t.defaultSize||"50x30",cw:50,ch:30,show:{name:!0,price:!0,code:!0,company:!!t.showCompany,text:!0},copies:1};try{r={...r,...JSON.parse(localStorage.getItem(s)||"{}")}}catch{}const n=()=>{try{localStorage.setItem(s,JSON.stringify(r))}catch{}};let o=xr(i,t.printer||{}),c=Z.getQueryParams().tab||"create",u=[],l=[],d=[];a.innerHTML=`
    <div class="seg-tabs" role="tablist">
      <button type="button" class="seg-tab" data-tab="create"><i class="ph ph-barcode"></i> Oluştur</button>
      <button type="button" class="seg-tab" data-tab="records"><i class="ph ph-list-magnifying-glass"></i> Kayıtlar</button>
      <button type="button" class="seg-tab" data-tab="printer"><i class="ph ph-printer"></i> Yazıcı</button>
    </div>
    <div id="bc-view"></div>`;const m=a.querySelector("#bc-view");function p(E){c=E,m.onclick=null,m.onchange=null,a.querySelectorAll(".seg-tab").forEach(y=>y.classList.toggle("active",y.dataset.tab===c)),c==="create"?k():c==="records"?w():L()}a.querySelector(".seg-tabs").addEventListener("click",E=>{const y=E.target.closest("[data-tab]");y&&p(y.dataset.tab)});async function v(){try{const[E,y]=await Promise.all([I.getProducts(),I.getWarehouses()]);u=E.success?E.data:[],l=y.success?y.data:[]}catch{}}function k(){const E=[...new Set([...Dr,...u.map(R=>R.category).filter(Boolean)])],y={mode:"new",productId:"",auto:!0,autoValue:"",manual:"",name:"",category:"Genel",unit:"Adet",price:"",qty:"",warehouseId:"",startCell:0};m.innerHTML=`
    <div class="bc-grid">
      <div class="bc-col">
        <div class="card bc-card bc-preview bc-sticky">
          <div class="sx-step"><i class="ph ph-eye"></i> Önizleme <span class="bc-dim" id="bc-dim"></span></div>
          <div class="bc-canvas" id="bc-canvas"></div>
          <div class="bc-warn" id="bc-warn" hidden></div>
        </div>
        <div class="card bc-card">
          <div class="bc-mode">
            <button type="button" class="sx-chip on" data-mode="new">Yeni ürün</button>
            <button type="button" class="sx-chip" data-mode="existing">Mevcut ürün için etiket</button>
          </div>

          <div id="bc-new">
            <div class="sx-field"><label>Ürün adı <span class="sx-req">*</span></label>
              <div class="input-field"><span class="input-icon"><i class="ph ph-package"></i></span><input id="bc-name" type="text" maxlength="120" placeholder="Örn: Çikolata Sosu 5kg" autocomplete="off" /></div></div>
            <div class="sx-grid">
              <div class="sx-field"><label>Kategori</label><div class="input-field"><span class="input-icon"><i class="ph ph-tag"></i></span>
                <select id="bc-cat" class="input-element">${E.map(R=>`<option>${h(R)}</option>`).join("")}</select></div></div>
              <div class="sx-field"><label>Birim</label><div class="input-field"><span class="input-icon"><i class="ph ph-scales"></i></span>
                <select id="bc-unit" class="input-element">${Ir.map(R=>`<option>${h(R)}</option>`).join("")}</select></div></div>
              <div class="sx-field"><label>Birim fiyat (₺)</label><div class="input-field"><span class="input-icon"><i class="ph ph-currency-circle-dollar"></i></span>
                <input id="bc-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00" /></div></div>
              <div class="sx-field"><label>Başlangıç stoğu <span class="sx-opt">(isteğe bağlı)</span></label><div class="input-field"><span class="input-icon"><i class="ph ph-hash"></i></span>
                <input id="bc-qty" type="number" min="0" step="1" inputmode="numeric" placeholder="0" /></div></div>
            </div>
            <div class="sx-field" id="bc-wh-wrap" hidden><label>Stoğun gireceği depo</label><div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="bc-wh" class="input-element"><option value="">Seçiniz...</option>${l.map(R=>`<option value="${h(R.id)}">${h(R.name)}</option>`).join("")}</select></div></div>
          </div>

          <div id="bc-existing" hidden>
            <div class="sx-field"><label>Ürün ara</label><div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
              <input id="bc-psearch" type="search" placeholder="Ad, kod veya barkod..." autocomplete="off" /></div></div>
            <div class="sx-field"><label>Ürün</label><div class="input-field"><span class="input-icon"><i class="ph ph-package"></i></span>
              <select id="bc-product" class="input-element"></select></div></div>
          </div>
        </div>

        <div class="card bc-card">
          <div class="sx-step"><i class="ph ph-barcode"></i> Barkod</div>
          <div class="sx-chips" id="bc-formats">${Object.entries(ft).map(([R,U])=>`<button type="button" class="sx-chip ${R===r.format?"on":""}" data-f="${R}">${U.label}</button>`).join("")}</div>
          <div class="bc-hint" id="bc-fhint"></div>
          <label class="bc-switch"><input type="checkbox" id="bc-auto" checked /> <span>Barkodu otomatik ver</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span><input id="bc-value" type="text" maxlength="300" autocomplete="off" /></div>
          <div class="bc-err" id="bc-verr" hidden></div>
        </div>

        <div class="card bc-card">
          <div class="sx-step"><i class="ph ph-ruler"></i> Etiket</div>
          <div class="sx-field"><label>Boyut</label><div class="input-field"><span class="input-icon"><i class="ph ph-frame-corners"></i></span>
            <select id="bc-size" class="input-element">
              <optgroup label="Rulo etiket (termal yazıcı)">${xt.filter(R=>R.kind==="roll").map(R=>`<option value="${R.id}">${h(R.label)} — ${h(R.note)}</option>`).join("")}</optgroup>
              <optgroup label="A4 etiket yaprağı (lazer/inkjet)">${xt.filter(R=>R.kind==="sheet").map(R=>`<option value="${R.id}">${h(R.label)} — ${h(R.note)}</option>`).join("")}</optgroup>
              <option value="custom">Özel ölçü…</option>
            </select></div></div>
          <div class="sx-grid" id="bc-custom" hidden>
            <div class="sx-field"><label>Genişlik (mm)</label><div class="input-field"><input id="bc-cw" type="number" min="10" max="200" step="0.5" /></div></div>
            <div class="sx-field"><label>Yükseklik (mm)</label><div class="input-field"><input id="bc-ch" type="number" min="8" max="300" step="0.5" /></div></div>
          </div>
          <div class="bc-toggles">
            ${[["name","Ürün adı"],["price","Fiyat"],["code","Ürün kodu"],["company","Firma adı"],["text","Barkod altı yazı"]].map(([R,U])=>`<label class="bc-switch"><input type="checkbox" data-show="${R}" ${r.show[R]?"checked":""} /> <span>${U}</span></label>`).join("")}
          </div>
          <div class="sx-grid">
            <div class="sx-field"><label>Etiket adedi</label><div class="input-field"><span class="input-icon"><i class="ph ph-copy"></i></span><input id="bc-copies" type="number" min="1" max="10000" step="1" inputmode="numeric" /></div></div>
            <div class="sx-field" id="bc-start-wrap" hidden><label>Yaprakta başlangıç hücresi</label><div class="input-field"><span class="input-icon"><i class="ph ph-grid-four"></i></span><input id="bc-start" type="number" min="1" step="1" value="1" /></div></div>
          </div>
        </div>
        <div class="bc-actions">
          <button type="button" class="btn btn-block btn-lg sx-submit" id="bc-save-print" style="--sx:var(--primary)"><i class="ph ph-printer"></i> Ürünü kaydet ve yazdır</button>
          <div class="bc-actions-row">
            <button type="button" class="btn btn-secondary" id="bc-save"><i class="ph ph-floppy-disk"></i> Yalnızca kaydet</button>
            <button type="button" class="btn btn-secondary" id="bc-svg"><i class="ph ph-download-simple"></i> SVG indir</button>
          </div>
          <div class="bc-hint" id="bc-printer-hint"></div>
        </div>
      </div>

    </div>`;const T=R=>m.querySelector(R);T("#bc-size").value=r.size,T("#bc-cw").value=r.cw,T("#bc-ch").value=r.ch,T("#bc-copies").value=r.copies;let M=null;const N=()=>{if(y.mode==="existing"){const R=u.find(U=>U.id===y.productId);return R?R.barcode||(y.auto?y.autoValue:y.manual):""}return y.auto?y.autoValue:y.manual};async function q(){if(y.auto){try{const R=await I.get(`/barcodes/next?format=${r.format}&prefix=${encodeURIComponent(t.prefix||"2")}`);R.success&&(y.autoValue=R.data.barcode)}catch{}S(),_()}}function S(){const R=T("#bc-value"),U=y.mode==="existing"?u.find(ee=>ee.id===y.productId):null,W=!!(U&&U.barcode);T("#bc-auto").disabled=W,T(".bc-switch:has(#bc-auto)").classList.toggle("dis",W),R.readOnly=W||y.auto,R.value=W?U.barcode:y.auto?y.autoValue:y.manual,R.placeholder=y.auto?"Otomatik":ft[r.format].hint,T("#bc-fhint").textContent=W?`Bu ürünün mevcut barkodu kullanılır (${U.barcode}).`:ft[r.format].hint}function D(){return{ean13:"2000000000015",ean8:"2000001",code128:"P00000001",code39:"P00000001",qr:"P00000001"}[r.format]}function B(){return Pt(r.size,{w:r.cw,h:r.ch})}function z(R){const U=B(),W=y.mode==="existing"?u.find(K=>K.id===y.productId):null,ee=N()||D(),te=Aa(r.format,ee);return{size:U,valid:te,spec:{wMm:U.w,hMm:U.h,format:r.format,value:te.ok?te.value:D(),name:W?W.name:y.name||"Ürün adı",price:W?W.price:y.price===""?null:Number(y.price),currency:"₺",code:W?W.code:"",company:F.companyName,show:r.show}}}function _(){const{size:R,valid:U,spec:W}=z(),ee=T("#bc-verr"),te=!!N();ee.hidden=!(te&&!U.ok),ee.textContent=U.ok?"":U.error;try{M=Rt(W),T("#bc-canvas").innerHTML=Ma(M,{border:!0});const G=T("#bc-canvas svg"),C=Math.min(420,T("#bc-canvas").clientWidth||380),g=Math.min(C/R.w,170/R.h);G.style.width=`${R.w*g}px`,G.style.height=`${R.h*g}px`;const $=T("#bc-warn");$.hidden=!M.warnings.length,$.innerHTML=M.warnings.map(f=>`<i class="ph ph-warning"></i> ${h(f)}`).join("<br>")}catch(G){M=null,T("#bc-canvas").innerHTML=`<div class="bc-dim">${h(G.message)}</div>`}T("#bc-dim").textContent=R.kind==="sheet"?`${R.w} × ${R.h} mm (yaprakta ${R.cols*R.rows} etiket)`:`${R.w} × ${R.h} mm`,T("#bc-start-wrap").hidden=R.kind!=="sheet",T("#bc-custom").hidden=r.size!=="custom";const K=o.mode!=="browser"&&R.kind==="roll";T("#bc-printer-hint").innerHTML=`<i class="ph ph-printer"></i> ${K?`${o.language.toUpperCase()} · ${o.dpi} dpi · ${{serial:"Seri port",agent:"Yerel ajan"}[o.mode]}`:"Tarayıcı / sürücü ile yazdırma"} <a href="#" data-goto="printer">değiştir</a>`}function V(R){y.mode=R,m.querySelectorAll("[data-mode]").forEach(U=>U.classList.toggle("on",U.dataset.mode===R)),T("#bc-new").hidden=R!=="new",T("#bc-existing").hidden=R!=="existing",T("#bc-save-print").innerHTML=R==="new"?'<i class="ph ph-printer"></i> Ürünü kaydet ve yazdır':'<i class="ph ph-printer"></i> Etiketi yazdır',R==="existing"&&Q(),S(),_()}function Q(){const R=(T("#bc-psearch").value||"").toLocaleLowerCase("tr").trim(),U=u.filter(ee=>!R||[ee.name,ee.code,ee.barcode].some(te=>String(te||"").toLocaleLowerCase("tr").includes(R))).slice(0,200),W=T("#bc-product");W.innerHTML=`<option value="">${U.length?"Ürün seçin...":"Ürün bulunamadı"}</option>`+U.map(ee=>`<option value="${h(ee.id)}">${h(ee.name)}${ee.barcode?" — "+h(ee.barcode):" — barkodsuz"}</option>`).join(""),U.some(ee=>ee.id===y.productId)?W.value=y.productId:y.productId=""}m.onclick=R=>{const U=R.target.closest("[data-goto]");if(U)return R.preventDefault(),p(U.dataset.goto);const W=R.target.closest("[data-mode]");if(W)return V(W.dataset.mode);const ee=R.target.closest("[data-f]");ee&&(r.format=ee.dataset.f,n(),m.querySelectorAll("[data-f]").forEach(te=>te.classList.toggle("on",te===ee)),y.autoValue="",S(),_(),q())},T("#bc-name").addEventListener("input",R=>{y.name=R.target.value,_()}),T("#bc-cat").addEventListener("change",R=>{y.category=R.target.value}),T("#bc-unit").addEventListener("change",R=>{y.unit=R.target.value}),T("#bc-price").addEventListener("input",R=>{y.price=R.target.value,_()}),T("#bc-qty").addEventListener("input",R=>{y.qty=R.target.value,T("#bc-wh-wrap").hidden=!(Number(y.qty)>0)}),T("#bc-wh").addEventListener("change",R=>{y.warehouseId=R.target.value}),T("#bc-psearch").addEventListener("input",Q),T("#bc-product").addEventListener("change",R=>{y.productId=R.target.value,S(),_()}),T("#bc-auto").addEventListener("change",R=>{y.auto=R.target.checked,y.auto&&q(),S(),_()}),T("#bc-value").addEventListener("input",R=>{y.auto||(y.manual=R.target.value,_())}),T("#bc-size").addEventListener("change",R=>{r.size=R.target.value,n(),_()}),T("#bc-cw").addEventListener("input",R=>{r.cw=Number(R.target.value)||50,n(),_()}),T("#bc-ch").addEventListener("input",R=>{r.ch=Number(R.target.value)||30,n(),_()}),T("#bc-copies").addEventListener("input",R=>{r.copies=Math.max(1,Math.min(1e4,Math.floor(Number(R.target.value)||1))),n()}),T("#bc-start").addEventListener("input",R=>{y.startCell=Math.max(0,(Math.floor(Number(R.target.value))||1)-1)}),m.querySelectorAll("[data-show]").forEach(R=>R.addEventListener("change",()=>{r.show[R.dataset.show]=R.checked,n(),_()})),T("#bc-svg").addEventListener("click",()=>{if(!M)return;const R=document.createElement("a");R.href=URL.createObjectURL(new Blob([Ma(M)],{type:"image/svg+xml"})),R.download=`barkod_${N()||D()}.svg`,document.body.appendChild(R),R.click(),setTimeout(()=>{URL.revokeObjectURL(R.href),R.remove()},800)});async function ie(R,U){var G;const W=B(),ee=z();if(y.mode==="new"&&!y.name.trim())return P("Ürün adını girin","warning");if(y.mode==="existing"&&!y.productId)return P("Ürünü seçin","warning");const te=!y.auto&&y.mode==="new"||y.mode==="existing"&&!((G=u.find(C=>C.id===y.productId))!=null&&G.barcode)&&!y.auto?y.manual:"";if(te){const C=Aa(r.format,te);if(!C.ok)return P(C.error,"warning")}if(!y.auto&&!te&&y.mode==="new")return P("Barkod değerini girin ya da “otomatik” seçin","warning");if(y.mode==="new"&&Number(y.qty)>0&&!y.warehouseId)return P("Başlangıç stoğu için depo seçin","warning");const K=U.innerHTML;U.disabled=!0,U.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const C={mode:y.mode,productId:y.productId,name:y.name,category:y.category,unit:y.unit,price:y.price,quantity:y.qty,warehouseId:y.warehouseId,barcode:te||void 0,autoPrefix:t.prefix||"2",format:r.format,sizeId:W.id,widthMm:W.w,heightMm:W.h},g=await I.post("/barcodes",C);if(!g.success)throw new Error(g.message||"Kaydedilemedi");const{barcode:$,product:f,labelId:x}=g.data;if(P(`Ürün endekslendi: ${f.name} · ${$}`,"success"),R){const A=Rt({...ee.spec,value:$,name:f.name,price:f.price,code:f.code},o.mode!=="browser"&&W.kind==="roll"?{dpi:o.dpi}:{});try{await pa([{layout:A,copies:r.copies}],W,o,{startCell:y.startCell}),I.post(`/barcodes/${x}/print`,{copies:r.copies}).catch(()=>{}),P(`${r.copies} etiket yazıcıya gönderildi`,"success")}catch(O){P(`Ürün kaydedildi ama yazdırılamadı: ${O.message}`,"error",6e3)}}await v(),k()}catch(C){P(C.message,"error"),U.disabled=!1,U.innerHTML=K}}T("#bc-save-print").addEventListener("click",R=>ie(!0,R.currentTarget)),T("#bc-save").addEventListener("click",R=>ie(!1,R.currentTarget)),V("new"),S(),_(),q()}async function w(){m.innerHTML=`
      <div class="card bc-card">
        <div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="bcr-q" type="search" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" /></div>
      </div>
      <div class="list-toolbar"><span id="bcr-count"></span>${Ee("bcr-export")}</div>
      <div id="bcr-list"><div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div></div>`;const E=N=>m.querySelector(N);let y="";async function T(){try{const N=await I.get("/barcodes"+(y?`?q=${encodeURIComponent(y)}`:""));if(!N.success)throw new Error(N.message);d=N.data}catch(N){E("#bcr-list").innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${h(N.message)}</div></div>`;return}E("#bcr-count").textContent=`${d.length} barkod`,E("#bcr-list").innerHTML=d.length?d.map(N=>{var q;return`
        <div class="bcr-item">
          <div class="bcr-main">
            <div class="bcr-name">${h(N.name||"(silinmiş ürün)")}</div>
            <div class="bcr-code">${h(N.barcode)}</div>
            <div class="bcr-meta"><span class="act-ref">${h(((q=ft[N.format])==null?void 0:q.label)||N.format)}</span> <span class="act-ref">${h(N.widthMm)}×${h(N.heightMm)} mm</span>
              <span>${h(N.createdBy||"")} · ${h(ma(N.createdAt))}</span></div>
            <div class="bcr-meta"><i class="ph ph-printer"></i> ${N.printCount?`${N.printCount} etiket yazdırıldı${N.lastPrintedAt?" · son: "+h(ma(N.lastPrintedAt)):""}`:"Henüz yazdırılmadı"}</div>
          </div>
          <button type="button" class="btn btn-secondary" data-print="${N.id}"><i class="ph ph-printer"></i> Yazdır</button>
        </div>`}).join(""):'<div class="empty-state"><div class="empty-icon"><i class="ph ph-barcode"></i></div><div class="empty-text">Henüz barkod oluşturulmadı</div></div>'}let M;E("#bcr-q").addEventListener("input",N=>{clearTimeout(M),M=setTimeout(()=>{y=N.target.value.trim(),T()},250)}),E("#bcr-export").addEventListener("click",()=>ye("Barkod kayitlari",[["Barkod","barcode"],["Ürün","name"],["Ürün kodu","code"],["Tür",N=>{var q;return((q=ft[N.format])==null?void 0:q.label)||N.format}],["Ölçü (mm)",N=>`${N.widthMm}×${N.heightMm}`],["Oluşturan","createdBy"],["Tarih",N=>ma(N.createdAt)],["Yazdırılan adet",N=>N.printCount||0]],d)),E("#bcr-list").addEventListener("click",async N=>{const q=N.target.closest("[data-print]");if(!q)return;const S=d.find(_=>String(_.id)===q.dataset.print);if(!S)return;const D=await Na({title:"Kaç etiket yazdırılsın?",label:`${S.name||S.barcode} · ${S.widthMm}×${S.heightMm} mm`,value:"1",required:!0,confirmLabel:"Yazdır",maxlength:5});if(D==null)return;const B=Math.max(1,Math.min(1e4,Math.floor(Number(D))||1)),z=xt.find(_=>_.id===S.sizeId)||Pt("custom",{w:S.widthMm,h:S.heightMm});try{const _=Rt({wMm:z.w,hMm:z.h,format:S.format,value:S.barcode,name:S.name,price:S.price,currency:"₺",code:S.code,company:F.companyName,show:r.show},o.mode!=="browser"&&z.kind==="roll"?{dpi:o.dpi}:{});await pa([{layout:_,copies:B}],z,o),I.post(`/barcodes/${S.id}/print`,{copies:B}).catch(()=>{}),P(`${B} etiket yazıcıya gönderildi`,"success"),T()}catch(_){P(_.message,"error",6e3)}}),T()}function L(){var S,D,B,z;const E=o,y=E.mode!=="browser";m.innerHTML=`
    <div class="card bc-card">
      <div class="sx-step"><i class="ph ph-plugs-connected"></i> Yazıcı bağlantısı <span class="bc-dim">(bu cihaz için)</span></div>
      <div class="bc-modes">
        ${[["browser","ph-desktop","Tarayıcı / sürücü","Bilgisayara veya telefona tanıtılmış her yazıcı. Etiket ölçüsü tam olarak ayarlanır."],["serial","ph-usb","Seri port (USB/Bluetooth)","Zebra/TSC/Xprinter gibi yazıcılara doğrudan ham komut. Chrome/Edge gerekir."],["agent","ph-hard-drives","Yerel yazdırma ajanı","Ağ (IP) yazıcısı veya bilgisayara bağlı USB yazıcı. Ajan programı o bilgisayarda çalışır."]].map(([_,V,Q,ie])=>`<label class="bc-mode-card ${E.mode===_?"on":""}"><input type="radio" name="pm" value="${_}" ${E.mode===_?"checked":""} /><i class="ph ${V}"></i><b>${Q}</b><small>${ie}</small></label>`).join("")}
      </div>
    </div>

    <div class="card bc-card" id="bcp-raw" ${y?"":"hidden"}>
      <div class="sx-step"><i class="ph ph-terminal-window"></i> Yazıcı dili ve ölçüler</div>
      <div class="sx-grid">
        <div class="sx-field"><label>Yazıcı dili</label><div class="input-field"><select id="bcp-lang" class="input-element"><option value="zpl">ZPL (Zebra ve uyumlular)</option><option value="tspl">TSPL (TSC, Xprinter, Gprinter...)</option></select></div></div>
        <div class="sx-field"><label>Çözünürlük</label><div class="input-field"><select id="bcp-dpi" class="input-element"><option value="203">203 dpi (8 nokta/mm)</option><option value="300">300 dpi (12 nokta/mm)</option><option value="600">600 dpi (24 nokta/mm)</option></select></div></div>
        <div class="sx-field"><label>Etiket türü</label><div class="input-field"><select id="bcp-media" class="input-element"><option value="gap">Aralıklı (boşluklu) etiket</option><option value="mark">Siyah işaretli</option><option value="continuous">Sürekli (rulo)</option></select></div></div>
        <div class="sx-field" id="bcp-gap-wrap"><label>Etiket arası boşluk (mm) <span class="sx-opt">TSPL</span></label><div class="input-field"><input id="bcp-gap" type="number" min="0" max="20" step="0.5" /></div></div>
        <div class="sx-field" id="bcp-dir-wrap"><label>Baskı yönü <span class="sx-opt">TSPL — ters çıkarsa değiştirin</span></label><div class="input-field"><select id="bcp-dir" class="input-element"><option value="1">Normal</option><option value="0">Ters (180°)</option></select></div></div>
      </div>
    </div>

    <div class="card bc-card" id="bcp-serial" ${E.mode==="serial"?"":"hidden"}>
      <div class="sx-step"><i class="ph ph-usb"></i> Seri port</div>
      <div class="bc-hint">${Ra()?"İlk yazdırmada tarayıcı port seçtirir; seçim hatırlanır. Bluetooth yazıcıyı önce cihaz eşleştirmesinden ekleyin (SPP/seri port).":"<b>Bu tarayıcı Web Serial desteklemiyor.</b> Chrome veya Edge (masaüstü / Android) kullanın ya da “Tarayıcı / sürücü” seçin."}</div>
      <div class="sx-field"><label>Baud hızı</label><div class="input-field"><select id="bcp-baud" class="input-element">${[9600,19200,38400,57600,115200,230400].map(_=>`<option>${_}</option>`).join("")}</select></div></div>
      <button type="button" class="btn btn-secondary" id="bcp-forget"><i class="ph ph-x-circle"></i> Kayıtlı portu unut</button>
    </div>

    <div class="card bc-card" id="bcp-agent" ${E.mode==="agent"?"":"hidden"}>
      <div class="sx-step"><i class="ph ph-hard-drives"></i> Yerel yazdırma ajanı</div>
      <div class="bc-hint">Ajan (print-agent) yazıcının bağlı olduğu bilgisayarda çalışır: <code>node agent.js</code>. Ayrıntılar paketin içindeki README.md dosyasında.</div>
      <div class="sx-grid">
        <div class="sx-field"><label>Ajan adresi</label><div class="input-field"><input id="bcp-aurl" type="text" placeholder="http://127.0.0.1:9101" /></div></div>
        <div class="sx-field"><label>Yazıcıya bağlantı</label><div class="input-field"><select id="bcp-atype" class="input-element"><option value="tcp">Ağ yazıcısı (IP, port 9100)</option><option value="printer">Yüklü yazıcı adı (USB)</option></select></div></div>
        <div class="sx-field" data-a="tcp"><label>Yazıcı IP adresi</label><div class="input-field"><input id="bcp-ahost" type="text" placeholder="192.168.1.50" /></div></div>
        <div class="sx-field" data-a="tcp"><label>Port</label><div class="input-field"><input id="bcp-aport" type="number" min="1" max="65535" /></div></div>
        <div class="sx-field" data-a="printer"><label>Yazıcı adı</label><div class="input-field"><input id="bcp-aprn" list="bcp-prn-list" type="text" placeholder="Zebra ZD220" /><datalist id="bcp-prn-list"></datalist></div></div>
      </div>
      <div class="bc-actions-row">
        <button type="button" class="btn btn-secondary" id="bcp-ping"><i class="ph ph-plugs"></i> Ajanı dene</button>
        <button type="button" class="btn btn-secondary" id="bcp-list" data-a="printer"><i class="ph ph-list"></i> Yazıcıları listele</button>
      </div>
      <div class="bc-hint" id="bcp-astatus"></div>
    </div>

    <div class="card bc-card">
      <div class="sx-step"><i class="ph ph-test-tube"></i> Deneme</div>
      <div class="bc-actions-row">
        <button type="button" class="btn btn-primary" id="bcp-test"><i class="ph ph-printer"></i> Test etiketi yazdır</button>
        <button type="button" class="btn btn-secondary" id="bcp-dl" ${y?"":"hidden"}><i class="ph ph-file-arrow-down"></i> Komutu dosya olarak indir</button>
      </div>
      <div class="bc-hint">Test, seçili etiket boyutunda (${h(Pt(r.size,{w:r.cw,h:r.ch}).label)}) örnek bir EAN-13 basar. Çıktı ters/kaymış ise ayarları buradan düzeltin.</div>
    </div>`;const T=_=>m.querySelector(_),M=()=>{Sr(i,o)};T("#bcp-lang").value=E.language,T("#bcp-dpi").value=String(E.dpi),T("#bcp-media").value=E.media,T("#bcp-gap").value=E.gap,T("#bcp-dir").value=String(E.direction),T("#bcp-baud").value=String(E.baud),T("#bcp-aurl").value=E.agentUrl,T("#bcp-atype").value=E.agentTarget,T("#bcp-ahost").value=E.agentHost,T("#bcp-aport").value=E.agentPort,T("#bcp-aprn").value=E.agentPrinter;const N=()=>{m.querySelectorAll("[data-a]").forEach(_=>{_.hidden=_.dataset.a!==o.agentTarget}),T("#bcp-gap-wrap").hidden=T("#bcp-dir-wrap").hidden=o.language!=="tspl"};N(),m.onchange=_=>{const V=_.target;if(V.name==="pm")return o.mode=V.value,M(),L();const ie={"bcp-lang":["language",String],"bcp-dpi":["dpi",Number],"bcp-media":["media",String],"bcp-gap":["gap",Number],"bcp-dir":["direction",Number],"bcp-baud":["baud",Number],"bcp-aurl":["agentUrl",R=>String(R).trim().replace(/\/$/,"")],"bcp-atype":["agentTarget",String],"bcp-ahost":["agentHost",R=>String(R).trim()],"bcp-aport":["agentPort",Number],"bcp-aprn":["agentPrinter",R=>String(R).trim()]}[V.id];ie&&(o[ie[0]]=ie[1](V.value),M(),N())},(S=T("#bcp-forget"))==null||S.addEventListener("click",async()=>{await Er(),P("Kayıtlı port unutuldu","success")}),(D=T("#bcp-ping"))==null||D.addEventListener("click",async()=>{const _=T("#bcp-astatus");_.textContent="Deneniyor...";try{const V=await jr(o);_.innerHTML=`<i class="ph ph-check-circle" style="color:var(--success)"></i> Ajan çalışıyor (sürüm ${h(V.version)}, ${h(V.platform)}).`}catch{_.innerHTML='<i class="ph ph-warning" style="color:var(--error)"></i> Ajana ulaşılamadı. Ajan çalışıyor mu? Adres doğru mu? Sitenizin adresi ajanın izinli listesinde mi?'}}),(B=T("#bcp-list"))==null||B.addEventListener("click",async()=>{const _=T("#bcp-astatus");try{const V=await qr(o);T("#bcp-prn-list").innerHTML=V.map(Q=>`<option value="${h(Q)}">`).join(""),_.textContent=V.length?`${V.length} yazıcı bulundu; kutuya tıklayıp seçin.`:"Yüklü yazıcı bulunamadı."}catch{_.textContent="Ajana ulaşılamadı."}});function q(_){const V=Pt(r.size,{w:r.cw,h:r.ch}),Q=Rt({wMm:V.w,hMm:V.h,format:"ean13",value:"200000000001",name:"TEST ETİKETİ Çş Ğü İö",price:12.5,currency:"₺",code:"PRD-TEST",company:F.companyName,show:{name:!0,price:!0,code:!0,company:!0,text:!0}},_?{dpi:_}:{});return{size:V,layout:Q}}T("#bcp-test").addEventListener("click",async _=>{const V=_.currentTarget;V.disabled=!0;try{const{size:Q,layout:ie}=q(o.mode!=="browser"?o.dpi:0);await pa([{layout:ie,copies:1}],Q,o),P("Test etiketi gönderildi","success")}catch(Q){P(Q.message,"error",6e3)}finally{V.disabled=!1}}),(z=T("#bcp-dl"))==null||z.addEventListener("click",()=>{const{layout:_}=q(o.dpi);Cr(_,o,1,"test-etiketi")})}return(async()=>(await v(),p(["create","records","printer"].includes(c)?c:"create")))(),e}const ae=(e,a="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:a,maximumFractionDigits:2}).format(Number(e)||0)}catch{return`${Number(e)||0} ${a}`}},Rr=e=>e?new Date(String(e).length<=10?`${e}T00:00:00`:e):null,Te=e=>{const a=Rr(e);return a&&!isNaN(a)?a.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—"},Ei=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,rt=()=>Ei(new Date),Br=e=>{const[a,t]=e.split("-");return new Date(Number(a),Number(t)-1,1).toLocaleDateString("tr-TR",{month:"short"})},Hr={TRY:"₺",USD:"$",EUR:"€",GBP:"£"},ti={installment:{icon:"ph-bank",label:"Kredi taksiti"},cheque_out:{icon:"ph-note-pencil",label:"Ödenecek çek/senet"},cheque_in:{icon:"ph-note",label:"Tahsil edilecek çek/senet"},supplier:{icon:"ph-truck",label:"Tedarikçi ödemesi"}},ai={pending:"Bekliyor",collected:"Tahsil edildi",paid:"Ödendi",bounced:"Karşılıksız / iade",cancelled:"İptal"},zr=[["annuity","Eşit taksit"],["equal_principal","Eşit anapara"],["bullet","Sonda anapara (aylık faiz)"]];function gt(e){return e==null?"":e<0?`<span class="fin-chip late"><i class="ph ph-warning"></i> ${-e} gün gecikti</span>`:e===0?'<span class="fin-chip soon"><i class="ph ph-clock-countdown"></i> Bugün</span>':`<span class="fin-chip ${e<=7?"soon":""}">${e} gün kaldı</span>`}const lt=(e,a="ph-tray")=>`<div class="empty-state fin-empty"><i class="ph ${a}"></i><p>${h(e)}</p></div>`,Kr=()=>'<div class="loading-spinner"></div>',ii=e=>`<div class="card fin-err"><i class="ph ph-warning-circle"></i> ${h(e)}</div>`;function Or({embedded:e=!1}={}){var G;const a=document.createElement("div");a.className=`page-finance page-container${e?" fin-embedded":""}`,e||a.appendChild(ue({title:((G=F.modules.finance)==null?void 0:G.label)||"Finans",gradientClass:"gradient-reports"}));const t=document.createElement("div");t.className="content-area",a.appendChild(t);const s=[["overview","ph-chart-line-up","Özet"],["accounts","ph-vault","Hesaplar"],["parties","ph-users-three","Cari"],["loans","ph-bank","Krediler"],["cheques","ph-note","Çek/Senet"],["ledger","ph-list-checks","Hareketler"]];t.innerHTML=`
    <div class="seg-tabs fin-tabs" role="tablist">${s.map(([C,g,$])=>`<button type="button" class="seg-tab" data-tab="${C}"><i class="ph ${g}"></i> <span>${$}</span></button>`).join("")}${e?"":'<a class="seg-tab fin-link" href="#/calendar"><i class="ph ph-calendar-dots"></i> <span>Takvim</span></a><a class="seg-tab fin-link" href="#/cashflow"><i class="ph ph-chart-bar"></i> <span>Nakit Akışı</span></a>'}</div>
    <div id="fin-view"></div>`;const i=t.querySelector("#fin-view");let r=null,n=Z.getQueryParams().tab||"overview",o=Z.getQueryParams().sub||"customers",c={accountId:"",direction:"",q:"",from:"",to:""},u=0;const l=()=>!!(r&&r.canManage);async function d(){var g;r=(await I.get("/finance/meta")).data;try{await wa(),ve("jt.users.manage")&&!t.querySelector('[data-tab="team"]')&&(t.querySelector(".fin-tabs").insertAdjacentHTML("beforeend",'<button type="button" class="seg-tab" data-tab="team"><i class="ph ph-lock-key"></i> <span>Yetkiler</span></button>'),(g=t.querySelector(`[data-tab="${n}"]`))==null||g.classList.add("active"))}catch{}return r}const m=C=>(r.accounts||[]).filter(g=>g.active&&(!C||g.currency===C)).map(g=>[g.id,`${g.name} · ${ae(g.balance,g.currency)}`]);function p(C){n=C,i.onclick=null,i.onchange=null,i.oninput=null,t.querySelectorAll(".seg-tab").forEach(f=>f.classList.toggle("active",f.dataset.tab===n));const g=++u;i.innerHTML=Kr();const $={overview:S,accounts:D,parties:z,loans:_,cheques:ie,ledger:R,team:U}[n]||S;Promise.resolve().then(async()=>{r||await d(),g===u&&await $(g),g===u&&K()}).catch(f=>{g===u&&(i.innerHTML=ii(f.message||"Finans verileri alınamadı."))})}t.querySelector(".seg-tabs").addEventListener("click",C=>{const g=C.target.closest("[data-tab]");g&&p(g.dataset.tab)});const v=()=>p(n),k=(C,g)=>P(C&&C.message||g,"success");async function w(C){try{const g=await C();g&&(k(g),await d(),v())}catch(g){P(g.message||"İşlem yapılamadı","error")}}const L=C=>{i.onclick=g=>{const $=g.target.closest("[data-act]");!$||!C[$.dataset.act]||C[$.dataset.act]($.dataset,$)}},b=({title:C,message:g,currency:$,amount:f,dateLabel:x="Tarih",confirmLabel:A="Kaydet",extra:O=[]})=>He({title:C,message:g,confirmLabel:A,icon:"ph-hand-coins",fields:[{name:"accountId",label:"Hesap",type:"select",options:m($),required:!0},{name:"amount",label:"Tutar",type:"number",value:f??"",min:0,half:!0,required:!0},{name:"date",label:x,type:"date",value:rt(),half:!0,required:!0},...O],validate:H=>H.accountId?H.amount>0?"":"Tutar sıfırdan büyük olmalı.":`${$||""} cinsinden bir hesap açmanız gerekir (Hesaplar sekmesi).`}),E=C=>w(async()=>{const g=await b({title:`Tahsilat · ${C.name}`,message:`Mevcut bakiye: ${ae(C.balance,C.currency)}`,currency:C.currency,amount:C.balance>0?C.balance:"",confirmLabel:"Tahsil et",extra:[{name:"note",label:"Not / yöntem",placeholder:"Havale, EFT, nakit …"}]});return g&&I.post(`/finance/customers/${encodeURIComponent(C.id)}/payment`,{accountId:g.accountId,amount:g.amount,date:g.date,note:g.note})}),y=(C,g)=>w(async()=>{const $=await b({title:`Ödeme · ${C.name}`,message:`Toplam borç: ${ae(C.balance,C.currency)}`,currency:C.currency,amount:g??(C.balance>0?C.balance:""),confirmLabel:"Öde",extra:[{name:"note",label:"Not",placeholder:"Fatura no, havale …"}]});return $&&I.post(`/finance/suppliers/${encodeURIComponent(C.id)}/payment`,{accountId:$.accountId,amount:$.amount,date:$.date,note:$.note})}),T=(C,g,$,f)=>w(async()=>{const x=await b({title:"Taksit ödemesi",message:`${g} · kalan ${ae(f,$)}`,currency:$,amount:f,confirmLabel:"Öde",dateLabel:"Ödeme tarihi"});return x&&I.post(`/finance/installments/${encodeURIComponent(C)}/pay`,{accountId:x.accountId,amount:x.amount,date:x.date})}),M=C=>w(async()=>{const g=C.kind==="payable",$=await b({title:g?"Çek/senet ödemesi":"Çek/senet tahsilatı",message:`${C.partyName||""} · ${ae(C.amount,C.currency)}`,currency:C.currency,amount:C.amount,confirmLabel:g?"Ödendi":"Tahsil edildi",dateLabel:"İşlem tarihi"});return $&&I.post(`/finance/cheques/${encodeURIComponent(C.id)}/settle`,{accountId:$.accountId,date:$.date})});function N(C,g,$,f){const x=C.map(H=>`<tr><td>${Te(H.date)}</td><td>${h(H.text)}</td><td class="num">${H.debit?ae(H.debit,$):""}</td><td class="num">${H.credit?ae(H.credit,$):""}</td><td class="num"><b>${ae(H.balance,$)}</b></td></tr>`).join(""),A=g?`<tr class="dim"><td>—</td><td>Devir bakiye</td><td></td><td></td><td class="num">${ae(g,$)}</td></tr>`:"";return`<div class="fin-tablewrap"><table class="fin-table"><thead><tr>${(f==="supplier"?["Tarih","Açıklama","Ödeme","Mal kabul (borç)","Kalan borç"]:["Tarih","Açıklama","Borç (satış)","Alacak (tahsilat/iade)","Bakiye"]).map((H,j)=>`<th class="${j>1?"num":""}">${H}</th>`).join("")}</tr></thead><tbody>${A}${x||'<tr><td colspan="5">Hareket yok.</td></tr>'}</tbody></table></div>`}async function q(C,g){try{const $=await I.get(`/finance/${C==="supplier"?"suppliers":"customers"}/${encodeURIComponent(g)}/statement`),f=C==="supplier"?$.data.supplier:$.data.customer,x=C==="supplier"?0:$.data.opening;await ka({title:`${f.name} · Ekstre`,icon:"ph-receipt",html:`<p>Güncel ${C==="supplier"?"borç":"bakiye"}: <b>${ae(f.balance,f.currency)}</b>${C==="customer"?` · vade ${f.paymentTerm} gün`:""}</p>${N($.data.lines,x,f.currency,C)}`,extra:[{label:"Dışa aktar",cls:"btn-secondary",icon:"ph-download-simple",value:"export"}]})==="export"&&ye(`${f.name} ekstre`,[["Tarih",O=>O.date],["Açıklama","text"],[C==="supplier"?"Ödeme":"Borç","debit"],[C==="supplier"?"Mal kabul":"Alacak","credit"],["Bakiye","balance"]],$.data.lines)}catch($){P($.message,"error")}}async function S(C){const[g,$,f]=await Promise.all([I.get("/finance/summary"),I.get("/finance/cashflow?months=6"),I.get("/finance/reminders")]);if(C!==u)return;const x=g.data,A=[...new Set([...x.cash,...x.receivables,...x.payables,...x.loans].map(Y=>Y.currency))],O=(Y,$e,xe="total")=>(Y.find(nt=>nt.currency===$e)||{})[xe]||0,H=(Y,$e="total")=>Y.length?Y.map(xe=>`<b>${ae(xe[$e],xe.currency)}</b>`).join(""):"<b>—</b>",j=Y=>Y.filter($e=>$e.overdue>.004).map($e=>`<small class="bad">Vadesi geçmiş: ${ae($e.overdue,$e.currency)}</small>`).join(""),J=A.map(Y=>`<b>${ae(O(x.cash,Y)+O(x.receivables,Y)-O(x.payables,Y)-O(x.loans,Y),Y)}</b>`).join(""),ne=x.upcoming,X=x.flow30.length?x.flow30.map(Y=>`<div class="fin-flow"><span class="in"><i class="ph ph-arrow-down-left"></i> ${ae(Y.in,Y.currency)}</span><span class="out"><i class="ph ph-arrow-up-right"></i> ${ae(Y.out,Y.currency)}</span><span class="net ${Y.in-Y.out<0?"bad":"good"}">Net ${ae(Y.in-Y.out,Y.currency)}</span></div>`).join(""):'<p class="hint">Önümüzdeki 30 günde vadesi gelen kalem yok.</p>',ce=Math.max(1,...$.data.months.map(Y=>Math.max(Y.in,Y.out))),le=$.data.months.map(Y=>`<div class="fin-bar"><div class="fin-bar-cols"><i class="in" style="height:${Math.round(Y.in/ce*100)}%" title="Giriş ${ae(Y.in)}"></i><i class="out" style="height:${Math.round(Y.out/ce*100)}%" title="Çıkış ${ae(Y.out)}"></i></div><span>${Br(Y.month)}</span></div>`).join(""),_e=$.data.expenseByCategory.slice(0,5),jt=Math.max(1,..._e.map(Y=>Y.total));i.innerHTML=`
      ${x.overdueCount||x.dueSoonCount?`<div class="fin-alert ${x.overdueCount?"late":"soon"}"><i class="ph ${x.overdueCount?"ph-warning":"ph-bell-ringing"}"></i><div>${x.overdueCount?`<b>${x.overdueCount} kredi/çek/tedarikçi kaleminin vadesi geçti.</b> `:""}${x.dueSoonCount?`${x.dueSoonCount} kalemin vadesi 7 gün içinde doluyor.`:""}</div></div>`:""}
      <div class="fin-kpis">
        <div class="fin-kpi"><i class="ph ph-vault"></i><span>Nakit (kasa + banka)</span>${H(x.cash)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Müşteri alacakları</span>${H(x.receivables)}${j(x.receivables)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Tedarikçi borçları</span>${H(x.payables)}${j(x.payables)}</div>
        <div class="fin-kpi"><i class="ph ph-bank"></i><span>Kredi borcu (kalan anapara)</span>${H(x.loans)}${j(x.loans)}</div>
        <div class="fin-kpi net"><i class="ph ph-scales"></i><span>Net durum <em>nakit + alacak − borç − kredi</em></span>${J||"<b>—</b>"}</div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vadesi yaklaşan ve geciken ödemeler</h3><span class="hint">30 gün</span></div>
        ${ne.length?`<div class="fin-list">${ne.map(Y=>`
          <div class="fin-row ${Y.daysLeft<0?"late":""}">
            <span class="fin-ico ${Y.direction}"><i class="ph ${ti[Y.kind].icon}"></i></span>
            <div class="fin-main"><div class="fin-title">${h(Y.title)}</div><div class="fin-sub">${h(Y.party||ti[Y.kind].label)} · ${Te(Y.dueDate)} ${gt(Y.daysLeft)}</div></div>
            <div class="fin-amt ${Y.direction}">${Y.direction==="in"?"+":"−"}${ae(Y.amount,Y.currency)}</div>
            ${l()?`<button class="btn btn-secondary btn-sm" data-act="quick" data-kind="${Y.kind}" data-id="${h(Y.id)}" data-cur="${Y.currency}" data-amt="${Y.amount}" data-title="${h(Y.title)}">${Y.direction==="in"?"Tahsil et":"Öde"}</button>`:""}
          </div>`).join("")}</div>`:lt("Yaklaşan ödeme yok. Harika!","ph-confetti")}
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>30 günlük nakit beklentisi</h3></div>${X}</div>
        <div class="card fin-card"><div class="fin-card-head"><h3>En yüksek alacaklar</h3></div>
          ${x.topDebtors.length?x.topDebtors.map(Y=>`<div class="fin-line"><span>${h(Y.name)}${Y.overdue>0?' <span class="fin-chip late">vadesi geçmiş</span>':""}</span><b>${ae(Y.balance,Y.currency)}</b></div>`).join(""):'<p class="hint">Açık müşteri bakiyesi yok.</p>'}
        </div>
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>Nakit akışı · son 6 ay</h3><span class="hint">${Hr[$.data.currency]||$.data.currency}</span></div>
          <div class="fin-bars">${le}</div><div class="fin-legend"><span class="in">■ Giriş</span><span class="out">■ Çıkış</span></div></div>
        <div class="card fin-card"><div class="fin-card-head"><h3>Gider dağılımı</h3></div>
          ${_e.length?_e.map(Y=>`<div class="fin-catrow"><div><span>${h(Y.category)}</span><b>${ae(Y.total,$.data.currency)}</b></div><i style="width:${Math.round(Y.total/jt*100)}%"></i></div>`).join(""):'<p class="hint">Bu dönemde gider kaydı yok.</p>'}
        </div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vade hatırlatmaları</h3></div>
        <p class="hint">Kredi taksiti, çek/senet ve tedarikçi ödemelerinin vadesi yaklaşınca finans yetkilerine <b>bildirim</b> düşer (zil simgesi). Vade geçince her gün tekrar hatırlatılır.</p>
        <div class="fin-remind"><label>Hatırlatma günleri <small>vadeden kaç gün önce (virgülle)</small><input id="fin-days" type="text" value="${h(r.remindDays)}" ${l()?"":"disabled"} /></label>
          ${l()?'<button class="btn btn-secondary" data-act="saveDays">Kaydet</button><button class="btn btn-secondary" data-act="runRemind"><i class="ph ph-bell-ringing"></i> Şimdi hatırlat</button>':""}</div>
        <p class="hint">Şu an hatırlatma kapsamındaki kalem: <b>${f.data.items.length}</b></p>
      </div>`,L({quick:Y=>{if(Y.kind==="installment")return T(Y.id,Y.title,Y.cur,Number(Y.amt));if(Y.kind==="supplier"){const $e=Y.id.split(":")[0];return w(async()=>{const nt=(await I.get("/finance/suppliers")).data.find(ji=>ji.id===$e);if(!nt)throw new Error("Tedarikçi bulunamadı.");return y(nt,Number(Y.amt)),null})}return w(async()=>{const xe=(await I.get("/finance/cheques")).data.find(nt=>nt.id===Y.id);if(!xe)throw new Error("Kayıt bulunamadı.");return M(xe),null})},saveDays:()=>w(()=>I.put("/finance/settings",{remindDays:i.querySelector("#fin-days").value})),runRemind:()=>w(()=>I.post("/finance/reminders/run",{}))})}async function D(C){const g=await I.get("/finance/accounts");if(C!==u)return;r.accounts=g.data;const $={};g.data.filter(f=>f.active).forEach(f=>{$[f.currency]=($[f.currency]||0)+f.balance}),i.innerHTML=`
      <div class="fin-toolbar">
        ${l()?`<button class="btn btn-primary" data-act="tx" data-type="in"><i class="ph ph-plus-circle"></i> Gelir</button>
        <button class="btn btn-primary" data-act="tx" data-type="out"><i class="ph ph-minus-circle"></i> Gider</button>
        <button class="btn btn-secondary" data-act="tx" data-type="transfer"><i class="ph ph-arrows-left-right"></i> Virman</button>
        <button class="btn btn-secondary" data-act="newAcc"><i class="ph ph-vault"></i> Hesap aç</button>`:""}
        ${Ee("fin-acc-export")}
      </div>
      <div class="fin-kpis">${Object.entries($).map(([f,x])=>`<div class="fin-kpi"><i class="ph ph-coins"></i><span>Toplam ${f}</span><b>${ae(x,f)}</b></div>`).join("")||""}</div>
      ${g.data.length?`<div class="fin-list">${g.data.map(f=>`
        <div class="card fin-acc ${f.active?"":"off"}">
          <span class="fin-ico"><i class="ph ${f.type==="cash"?"ph-money":"ph-bank"}"></i></span>
          <div class="fin-main"><div class="fin-title">${h(f.name)} ${f.active?"":'<span class="fin-chip">Kapalı</span>'}</div><div class="fin-sub">${f.type==="cash"?"Kasa":"Banka"} · ${f.currency}${f.iban?" · "+h(f.iban):""}</div></div>
          <div class="fin-amt ${f.balance<0?"out":""}">${ae(f.balance,f.currency)}</div>
          <div class="fin-acts"><button class="btn btn-secondary btn-sm" data-act="acc-ledger" data-id="${h(f.id)}">Hareketler</button>
          ${l()?`<button class="btn btn-secondary btn-sm" data-act="acc-toggle" data-id="${h(f.id)}" data-on="${f.active?1:0}">${f.active?"Kapat":"Aç"}</button>`:""}</div>
        </div>`).join("")}</div>`:lt("Henüz hesap yok. Önce bir kasa veya banka hesabı açın.","ph-vault")}`,i.querySelector("#fin-acc-export").onclick=()=>ye("Finans hesaplari",[["Hesap","name"],["Tür",f=>f.type==="cash"?"Kasa":"Banka"],["Para birimi","currency"],["IBAN","iban"],["Bakiye","balance"]],g.data),L({newAcc:()=>w(async()=>{const f=await He({title:"Hesap aç",icon:"ph-vault",fields:[{name:"name",label:"Hesap adı",required:!0,placeholder:"Örn. Ana Banka Hesabı"},{name:"type",label:"Tür",type:"select",options:[["bank","Banka"],["cash","Kasa"]],half:!0},{name:"currency",label:"Para birimi",type:"select",options:r.currencies.map(x=>[x,x]),half:!0},{name:"openingBalance",label:"Açılış bakiyesi",type:"number",value:0},{name:"iban",label:"IBAN (isteğe bağlı)"}]});return f&&I.post("/finance/accounts",f)}),"acc-toggle":f=>w(async()=>{const x=r.accounts.find(A=>A.id===f.id);return f.on==="1"&&!await Le({title:"Hesabı kapat",message:"Kapalı hesaba yeni işlem yapılamaz; geçmiş hareketler ve bakiye korunur.",confirmLabel:"Kapat"})?null:I.put(`/finance/accounts/${encodeURIComponent(f.id)}`,{name:x.name,iban:x.iban,active:f.on!=="1"})}),"acc-ledger":f=>{c={accountId:f.id,direction:"",q:"",from:"",to:""},p("ledger")},tx:f=>B(f.type)})}function B(C){return w(async()=>{const g=m();if(!g.length)throw new Error("Önce bir hesap açın.");const $=C==="transfer",f=await He({title:$?"Hesaplar arası virman":C==="in"?"Gelir kaydı":"Gider kaydı",icon:$?"ph-arrows-left-right":"ph-coins",fields:[{name:"accountId",label:$?"Kaynak hesap":"Hesap",type:"select",options:g,required:!0},...$?[{name:"toAccountId",label:"Hedef hesap",type:"select",options:g,value:g[1]?g[1][0]:"",required:!0}]:[{name:"category",label:"Kategori",type:"select",options:(C==="in"?r.inCategories:r.outCategories).map(x=>[x,x])}],{name:"amount",label:"Tutar",type:"number",min:0,half:!0,required:!0},{name:"date",label:"Tarih",type:"date",value:rt(),half:!0,required:!0},{name:"description",label:"Açıklama",placeholder:"İsteğe bağlı"}],validate:x=>x.amount>0?$&&x.accountId===x.toAccountId?"Kaynak ve hedef hesap farklı olmalı.":"":"Tutar sıfırdan büyük olmalı."});return f&&I.post("/finance/transactions",{...f,type:C})})}async function z(C){const g=o==="customers",$=await I.get(`/finance/${g?"customers":"suppliers"}`);if(C!==u)return;const f=$.data.slice().sort((j,J)=>J.balance-j.balance);i.innerHTML=`
      <div class="seg-tabs fin-sub"><button class="seg-tab ${g?"active":""}" data-act="sub" data-sub="customers"><i class="ph ph-users"></i> Müşteriler (alacak)</button><button class="seg-tab ${g?"":"active"}" data-act="sub" data-sub="suppliers"><i class="ph ph-truck"></i> Tedarikçiler (borç)</button></div>
      <div class="fin-toolbar"><div class="input-field fin-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="fin-q" type="text" placeholder="${g?"Müşteri":"Tedarikçi"} ara…" /></div><label class="fin-check"><input type="checkbox" id="fin-open" checked /> Yalnızca bakiyesi olanlar</label>${Ee("fin-party-export")}</div>
      <p class="hint">${g?"Bakiye, ERP satışlarından gelir; tahsilat yaptıkça düşer. Vade, müşteriye tanımlı ödeme süresidir (varsayılan 30 gün).":"Borç, satın almada mal kabul edilen tutardır (KDV dahil); vade = mal kabul tarihi + tedarikçi ödeme süresi."}</p>
      <div id="fin-plist" class="fin-list"></div>`;const x=i.querySelector("#fin-plist"),A=()=>{const j=i.querySelector("#fin-q").value.trim().toLocaleLowerCase("tr"),J=i.querySelector("#fin-open").checked,ne=f.filter(X=>(!j||X.name.toLocaleLowerCase("tr").includes(j))&&(!J||Math.abs(X.balance)>.004));x.innerHTML=ne.length?ne.map(X=>g?O(X):H(X)).join(""):lt("Kayıt bulunamadı.")},O=j=>{const J=j.aging,ne=Math.max(1,J.current+J.d30+J.d60+J.d90+J.older),X=(ce,le)=>ce>0?`<i class="${le}" style="width:${ce/ne*100}%" title="${ae(ce,j.currency)}"></i>`:"";return`<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${h(j.name)}</div>
          <div class="fin-sub">Vade ${j.paymentTerm} gün${j.lastPayment?" · son tahsilat "+Te(j.lastPayment):""}${j.lastSale?" · son satış "+Te(j.lastSale):""}</div>
          ${j.balance>0?`<div class="fin-aging">${X(J.current,"ok")}${X(J.d30,"w1")}${X(J.d60,"w2")}${X(J.d90,"w3")}${X(J.older,"w4")}</div>`:""}
          ${j.overdue>0?`<div class="fin-sub bad">Vadesi geçmiş: ${ae(j.overdue,j.currency)}</div>`:""}</div>
        <div class="fin-amt ${j.balance>0?"in":j.balance<0?"out":""}">${ae(j.balance,j.currency)}<small>${j.balance<0?"avans/alacaklı":"alacak"}</small></div>
        <div class="fin-acts">${l()?`<button class="btn btn-primary btn-sm" data-act="collect" data-id="${h(j.id)}">Tahsilat</button>`:""}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${h(j.id)}">Ekstre</button>${l()?`<button class="btn btn-secondary btn-sm" data-act="term" data-id="${h(j.id)}">Vade</button>`:""}</div></div>`},H=j=>`<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${h(j.name)}</div>
          <div class="fin-sub">Vade ${j.paymentTerm} gün · toplam alım ${ae(j.purchased,j.currency)}${j.lastPayment?" · son ödeme "+Te(j.lastPayment):""}</div>
          ${j.nextDue&&j.balance>0?`<div class="fin-sub">Sıradaki vade: ${Te(j.nextDue)} ${gt(Math.round((new Date(`${j.nextDue}T00:00:00`)-new Date(`${rt()}T00:00:00`))/864e5))}</div>`:""}
          ${j.overdue>0?`<div class="fin-sub bad">Vadesi geçmiş: ${ae(j.overdue,j.currency)}</div>`:""}</div>
        <div class="fin-amt ${j.balance>0?"out":""}">${ae(j.balance,j.currency)}<small>borç</small></div>
        <div class="fin-acts">${l()?`<button class="btn btn-primary btn-sm" data-act="paysup" data-id="${h(j.id)}" ${j.balance>0?"":"disabled"}>Öde</button>`:""}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${h(j.id)}">Ekstre</button></div></div>`;A(),i.querySelector("#fin-q").oninput=A,i.querySelector("#fin-open").onchange=A,i.querySelector("#fin-party-export").onclick=()=>g?ye("Musteri bakiyeleri",[["Müşteri","name"],["Bakiye","balance"],["Para birimi","currency"],["Vade (gün)","paymentTerm"],["Vadesi geçmiş","overdue"],["Güncel",j=>j.aging.current],["1-30 gün",j=>j.aging.d30],["31-60 gün",j=>j.aging.d60],["61-90 gün",j=>j.aging.d90],["90+ gün",j=>j.aging.older],["Son tahsilat","lastPayment"]],f):ye("Tedarikci borclari",[["Tedarikçi","name"],["Borç","balance"],["Para birimi","currency"],["Vade (gün)","paymentTerm"],["Vadesi geçmiş","overdue"],["Sıradaki vade","nextDue"],["Toplam alım","purchased"],["Ödenen","paid"]],f),L({sub:j=>{o=j.sub,p("parties")},collect:j=>E(f.find(J=>J.id===j.id)),paysup:j=>y(f.find(J=>J.id===j.id)),stmt:j=>q(g?"customer":"supplier",j.id),term:j=>w(async()=>{const J=f.find(X=>X.id===j.id),ne=await He({title:`Ödeme vadesi · ${J.name}`,icon:"ph-calendar-check",fields:[{name:"paymentTerm",label:"Vade (gün)",type:"number",value:J.paymentTerm,min:0,required:!0,hint:"Satıştan kaç gün sonra tahsil edilmeli"}]});return ne&&I.put(`/finance/customers/${encodeURIComponent(J.id)}/terms`,{paymentTerm:ne.paymentTerm})})})}async function _(C){const g=await I.get("/finance/loans");if(C!==u)return;const $=g.data;i.innerHTML=`
      <div class="fin-toolbar">${l()?'<button class="btn btn-primary" data-act="newLoan"><i class="ph ph-plus-circle"></i> Yeni kredi</button>':""}${Ee("fin-loan-export")}</div>
      ${$.length?`<div class="fin-list">${$.map(f=>{const x=f.installmentCount?Math.round(f.paidCount/f.installmentCount*100):0,A=f.nextDue?Math.round((new Date(`${f.nextDue}T00:00:00`)-new Date(`${rt()}T00:00:00`))/864e5):null;return`<div class="card fin-loan ${f.status==="closed"?"off":""}">
          <div class="fin-loan-head"><span class="fin-ico"><i class="ph ph-bank"></i></span><div class="fin-main"><div class="fin-title">${h(f.name)} ${f.status==="closed"?'<span class="fin-chip">Kapalı</span>':""}</div><div class="fin-sub">${h(f.lender||"Kurum belirtilmemiş")} · yıllık %${f.rate} · ${f.termMonths} ay</div></div>
            <div class="fin-amt out">${ae(f.outstandingPrincipal,f.currency)}<small>kalan anapara</small></div></div>
          <div class="fin-progress"><i style="width:${x}%"></i></div>
          <div class="fin-sub">${f.paidCount}/${f.installmentCount} taksit ödendi · çekilen ${ae(f.principal,f.currency)} · kalan toplam ödeme ${ae(f.remainingTotal,f.currency)}</div>
          ${f.status==="active"&&f.nextDue?`<div class="fin-next">Sıradaki taksit: <b>${ae(f.nextAmount,f.currency)}</b> · ${Te(f.nextDue)} ${gt(A)}${f.overdueCount>1?` <span class="fin-chip late">${f.overdueCount} taksit gecikmiş</span>`:""}</div>`:""}
          <div class="fin-acts">
            ${l()&&f.status==="active"&&f.nextDue?`<button class="btn btn-primary btn-sm" data-act="payNext" data-id="${h(f.id)}">Sıradaki taksidi öde</button>`:""}
            <button class="btn btn-secondary btn-sm" data-act="plan" data-id="${h(f.id)}">Taksit planı</button>
            ${l()?`<button class="btn btn-secondary btn-sm" data-act="loanClose" data-id="${h(f.id)}" data-open="${f.status==="closed"?1:0}">${f.status==="closed"?"Yeniden aç":"Kapat"}</button><button class="btn btn-secondary btn-sm" data-act="loanDel" data-id="${h(f.id)}">Sil</button>`:""}
          </div></div>`}).join("")}</div>`:lt('Kayıtlı kredi yok. "Yeni kredi" ile taksit planı otomatik oluşturulur.',"ph-bank")}`,i.querySelector("#fin-loan-export").onclick=()=>ye("Krediler",[["Kredi","name"],["Kurum","lender"],["Para birimi","currency"],["Çekilen","principal"],["Faiz (yıllık %)","rate"],["Vade (ay)","termMonths"],["Ödenen taksit","paidCount"],["Kalan anapara","outstandingPrincipal"],["Kalan toplam ödeme","remainingTotal"],["Sıradaki vade","nextDue"],["Sıradaki tutar","nextAmount"]],$),L({newLoan:()=>V(),payNext:f=>w(async()=>{const x=(await I.get(`/finance/loans/${encodeURIComponent(f.id)}`)).data,A=x.installments.find(O=>O.status!=="paid");if(!A)throw new Error("Ödenecek taksit kalmadı.");return T(A.id,`${x.name} · ${A.no}. taksit (${Te(A.dueDate)})`,x.currency,Math.round((A.amount-A.paidAmount)*100)/100),null}),plan:async f=>{try{const x=(await I.get(`/finance/loans/${encodeURIComponent(f.id)}`)).data,A=x.installments.map(H=>`<tr class="${H.status==="paid"?"dim":H.daysLeft<0?"late":""}${H.id===W?" fin-hl":""}"><td>${H.no}</td><td>${Te(H.dueDate)}</td><td class="num">${ae(H.principal,x.currency)}</td><td class="num">${ae(H.interest+H.tax,x.currency)}</td><td class="num"><b>${ae(H.amount,x.currency)}</b></td><td>${H.status==="paid"?`<span class="fin-chip ok">Ödendi ${Te(H.paidDate)}</span>`:H.paidAmount>0?`<span class="fin-chip soon">Kısmi ${ae(H.paidAmount,x.currency)}</span>`:gt(H.daysLeft)}</td></tr>`).join("");await ka({title:`${x.name} · Taksit planı`,icon:"ph-table",html:`<p>${x.installmentCount} taksit · toplam ödeme ${ae(x.totalPayment,x.currency)}</p><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>#</th><th>Vade</th><th class="num">Anapara</th><th class="num">Faiz+vergi</th><th class="num">Taksit</th><th>Durum</th></tr></thead><tbody>${A}</tbody></table></div>`,extra:[{label:"Dışa aktar",cls:"btn-secondary",icon:"ph-download-simple",value:"export"}]})==="export"&&ye(`${x.name} taksit plani`,[["No","no"],["Vade","dueDate"],["Anapara","principal"],["Faiz","interest"],["Vergi","tax"],["Taksit","amount"],["Ödenen","paidAmount"],["Durum",H=>H.status==="paid"?"Ödendi":"Bekliyor"]],x.installments)}catch(x){P(x.message,"error")}},loanClose:f=>w(()=>I.post(`/finance/loans/${encodeURIComponent(f.id)}/close`,{reopen:f.open==="1"})),loanDel:f=>w(async()=>await Le({title:"Krediyi sil",message:"Kredi ve taksit planı silinir (ödemesi yapılmamış olmalı). Bu işlem geri alınamaz.",confirmLabel:"Sil",danger:!0})?I.delete(`/finance/loans/${encodeURIComponent(f.id)}`):null)})}function V(){return w(async()=>{const C=new Date;C.setMonth(C.getMonth()+1);const g=await He({title:"Yeni kredi",icon:"ph-bank",wide:!0,confirmLabel:"Krediyi kaydet",fields:[{name:"name",label:"Kredi adı",required:!0,placeholder:"Örn. CNC Tezgâh Yatırım Kredisi"},{name:"lender",label:"Banka / kurum",half:!0},{name:"currency",label:"Para birimi",type:"select",options:r.currencies.map($=>[$,$]),half:!0},{name:"principal",label:"Kredi tutarı",type:"number",min:0,required:!0,half:!0},{name:"termMonths",label:"Vade (ay)",type:"number",min:1,value:12,required:!0,half:!0},{name:"rate",label:"Yıllık faiz %",type:"number",min:0,value:0,half:!0},{name:"taxRate",label:"Faiz vergisi % (BSMV+KKDF)",type:"number",min:0,value:0,half:!0},{name:"type",label:"Ödeme planı",type:"select",options:zr,half:!0},{name:"startDate",label:"Kullanım tarihi",type:"date",value:rt(),half:!0},{name:"firstDueDate",label:"İlk taksit tarihi",type:"date",value:Ei(C),half:!0},{name:"accountId",label:"Kredinin yattığı hesap",type:"select",options:[["","— hesaba işleme —"],...m()],half:!0}],footerHtml:'<div id="fin-loan-prev" class="fin-preview hint">Tutar ve vadeyi girince taksit özeti burada görünür.</div>',validate:$=>{var f;return $.principal>0?$.termMonths>=1?$.accountId&&((f=r.accounts.find(x=>x.id===$.accountId))==null?void 0:f.currency)!==$.currency?"Seçilen hesap kredi para biriminden farklı.":"":"Vade en az 1 ay olmalı.":"Kredi tutarı sıfırdan büyük olmalı."},onMount:$=>{let f;const x=O=>$.querySelector(`#df-${O}`).value,A=()=>{const O={name:"x",principal:x("principal"),rate:x("rate"),taxRate:x("taxRate"),termMonths:x("termMonths"),type:x("type"),startDate:x("startDate"),firstDueDate:x("firstDueDate"),currency:x("currency")},H=$.querySelector("#fin-loan-prev");if(!(Number(O.principal)>0)||!(Number(O.termMonths)>=1)){H.textContent="Tutar ve vadeyi girince taksit özeti burada görünür.";return}I.post("/finance/loans/preview",O).then(j=>{const J=j.data.schedule;H.innerHTML=`İlk taksit <b>${ae(J[0].amount,O.currency)}</b>${J.length>1&&Math.abs(J[J.length-1].amount-J[0].amount)>.05?` → son <b>${ae(J[J.length-1].amount,O.currency)}</b>`:""} · ${J.length} taksit · toplam ödeme <b>${ae(j.data.totalPayment,O.currency)}</b> · toplam faiz+vergi <b>${ae(j.data.totalInterest,O.currency)}</b>`}).catch(j=>{H.textContent=j.message})};$.addEventListener("input",()=>{clearTimeout(f),f=setTimeout(A,350)}),$.addEventListener("change",()=>{clearTimeout(f),f=setTimeout(A,100)})}});return g&&I.post("/finance/loans",{...g,accountId:g.accountId||void 0})})}let Q="pending";async function ie(C){const g=await I.get("/finance/cheques");if(C!==u)return;const $=g.data,f=Q==="pending"?$.filter(A=>A.status==="pending"):$,x=A=>{const O={};return $.filter(H=>H.status==="pending"&&H.kind===A).forEach(H=>{O[H.currency]=(O[H.currency]||0)+H.amount}),Object.entries(O).map(([H,j])=>`<b>${ae(j,H)}</b>`).join("")||"<b>—</b>"};i.innerHTML=`
      <div class="fin-toolbar">${l()?'<button class="btn btn-primary" data-act="newChq"><i class="ph ph-plus-circle"></i> Çek / senet ekle</button>':""}
        <div class="seg-tabs fin-sub"><button class="seg-tab ${Q==="pending"?"active":""}" data-act="filter" data-f="pending">Bekleyen</button><button class="seg-tab ${Q==="all"?"active":""}" data-act="filter" data-f="all">Tümü</button></div>${Ee("fin-chq-export")}</div>
      <div class="fin-kpis"><div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Tahsil edilecek (bekleyen)</span>${x("receivable")}</div><div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Ödenecek (bekleyen)</span>${x("payable")}</div></div>
      ${f.length?`<div class="fin-list">${f.map(A=>`
        <div class="card fin-row ${A.daysLeft!=null&&A.daysLeft<0?"late":""}">
          <span class="fin-ico ${A.kind==="payable"?"out":"in"}"><i class="ph ${A.kind==="payable"?"ph-note-pencil":"ph-note"}"></i></span>
          <div class="fin-main"><div class="fin-title">${h(A.partyName)} ${A.number?`<small>· ${h(A.number)}</small>`:""}</div>
            <div class="fin-sub">${A.kind==="payable"?"Ödenecek":"Alınan"} · ${A.bank?h(A.bank)+" · ":""}vade ${Te(A.dueDate)} ${A.status==="pending"?gt(A.daysLeft):`<span class="fin-chip ${A.status==="bounced"?"late":"ok"}">${ai[A.status]}${A.settledDate?" "+Te(A.settledDate):""}</span>`}</div></div>
          <div class="fin-amt ${A.kind==="payable"?"out":"in"}">${ae(A.amount,A.currency)}</div>
          ${l()&&A.status==="pending"?`<div class="fin-acts"><button class="btn btn-primary btn-sm" data-act="settle" data-id="${h(A.id)}">${A.kind==="payable"?"Ödendi":"Tahsil edildi"}</button><button class="btn btn-secondary btn-sm" data-act="bounce" data-id="${h(A.id)}">Karşılıksız</button><button class="btn btn-secondary btn-sm" data-act="chqDel" data-id="${h(A.id)}">Sil</button></div>`:""}
        </div>`).join("")}</div>`:lt("Çek/senet kaydı yok.","ph-note")}`,i.querySelector("#fin-chq-export").onclick=()=>ye("Cek ve senetler",[["Tür",A=>A.kind==="payable"?"Ödenecek":"Alınan"],["No","number"],["Karşı taraf","partyName"],["Banka","bank"],["Tutar","amount"],["Para birimi","currency"],["Vade","dueDate"],["Durum",A=>ai[A.status]||A.status]],$),L({filter:A=>{Q=A.f,p("cheques")},settle:A=>M($.find(O=>O.id===A.id)),bounce:A=>w(async()=>await Le({title:"Karşılıksız / iade",message:"Bu çek/senet karşılıksız çıktı veya iade edildi olarak işaretlenecek (hesap hareketi oluşmaz).",confirmLabel:"İşaretle",danger:!0})?I.post(`/finance/cheques/${encodeURIComponent(A.id)}/status`,{status:"bounced"}):null),chqDel:A=>w(async()=>await Le({title:"Kaydı sil",message:"Bekleyen çek/senet kaydı silinecek.",confirmLabel:"Sil",danger:!0})?I.delete(`/finance/cheques/${encodeURIComponent(A.id)}`):null),newChq:()=>w(async()=>{const[A,O]=await Promise.all([I.get("/finance/customers"),I.get("/finance/suppliers")]),H=[["","— serbest ad gir —"],...A.data.map(le=>[`c:${le.id}:${le.currency}`,`Müşteri · ${le.name}`]),...O.data.map(le=>[`s:${le.id}:${le.currency}`,`Tedarikçi · ${le.name}`])],j=await He({title:"Çek / senet ekle",icon:"ph-note",fields:[{name:"kind",label:"Tür",type:"select",options:[["receivable","Alınan (tahsil edilecek)"],["payable","Verilen (ödenecek)"]],half:!0},{name:"number",label:"Çek / senet no",half:!0},{name:"party",label:"Müşteri / tedarikçi",type:"select",options:H},{name:"partyName",label:"Serbest ad (keşideci / lehtar)",hint:"Yukarıdan seçmediyseniz"},{name:"amount",label:"Tutar",type:"number",min:0,required:!0,half:!0},{name:"currency",label:"Para birimi",type:"select",options:r.currencies.map(le=>[le,le]),half:!0},{name:"dueDate",label:"Vade tarihi",type:"date",value:rt(),required:!0,half:!0},{name:"bank",label:"Banka",half:!0}],validate:le=>le.amount>0?!le.party&&!le.partyName?"Bir müşteri/tedarikçi seçin veya ad yazın.":"":"Tutar sıfırdan büyük olmalı."});if(!j)return null;const[J,ne,X]=(j.party||"").split(":"),ce={kind:j.kind,number:j.number,amount:j.amount,dueDate:j.dueDate,bank:j.bank,currency:ne?X:j.currency,partyName:j.partyName};if(ne&&(J==="c"&&j.kind==="receivable"||J==="s"&&j.kind==="payable"))ce.partyId=ne;else if(ne){const le=H.find(_e=>_e[0]===j.party)[1].replace(/^(Müşteri|Tedarikçi) · /,"");ce.partyName=le}return I.post("/finance/cheques",ce)})})}async function R(C){const g=c,$=new URLSearchParams({limit:"500"});Object.entries(g).forEach(([j,J])=>{J&&$.set(j,J)});const f=await I.get(`/finance/transactions?${$}`);if(C!==u)return;const x=f.data,A={};x.forEach(j=>{A[j.currency]=A[j.currency]||{in:0,out:0},A[j.currency][j.direction]+=j.amount}),i.innerHTML=`
      <div class="card fin-filters">
        <label>Hesap<select id="lf-acc"><option value="">Tümü</option>${r.accounts.map(j=>`<option value="${h(j.id)}" ${g.accountId===j.id?"selected":""}>${h(j.name)}</option>`).join("")}</select></label>
        <label>Yön<select id="lf-dir"><option value="">Hepsi</option><option value="in" ${g.direction==="in"?"selected":""}>Giriş</option><option value="out" ${g.direction==="out"?"selected":""}>Çıkış</option></select></label>
        <label>Başlangıç<input id="lf-from" type="date" value="${h(g.from)}"></label>
        <label>Bitiş<input id="lf-to" type="date" value="${h(g.to)}"></label>
        <label class="wide">Ara<input id="lf-q" type="text" placeholder="Açıklama, kategori, cari…" value="${h(g.q)}"></label>
      </div>
      <div class="fin-toolbar"><span class="hint">${x.length} hareket${Object.entries(A).map(([j,J])=>` · ${j}: <b class="good">+${ae(J.in,j)}</b> <b class="bad">−${ae(J.out,j)}</b>`).join("")}</span>${Ee("fin-led-export")}</div>
      ${x.length?`<div class="fin-list">${x.map(j=>`
        <div class="card fin-row">
          <span class="fin-ico ${j.direction}"><i class="ph ${j.direction==="in"?"ph-arrow-down-left":"ph-arrow-up-right"}"></i></span>
          <div class="fin-main"><div class="fin-title">${h(j.category||(j.direction==="in"?"Giriş":"Çıkış"))}${j.partyName?` <small>· ${h(j.partyName)}</small>`:""}</div>
            <div class="fin-sub">${Te(j.date)} · ${h(j.accountName)}${j.description?" · "+h(j.description):""}${j.createdBy?" · "+h(j.createdBy):""}</div></div>
          <div class="fin-amt ${j.direction}">${j.direction==="in"?"+":"−"}${ae(j.amount,j.currency)}</div>
          ${l()?`<button class="btn btn-secondary btn-sm" data-act="void" data-id="${h(j.id)}" title="Hareketi iptal et; bağlı bakiye ve taksit geri alınır">İptal</button>`:""}
        </div>`).join("")}</div>`:lt("Bu filtreye uyan hareket yok.","ph-list-checks")}`;const O=()=>({accountId:i.querySelector("#lf-acc").value,direction:i.querySelector("#lf-dir").value,from:i.querySelector("#lf-from").value,to:i.querySelector("#lf-to").value,q:i.querySelector("#lf-q").value.trim()});let H;i.onchange=()=>{c=O(),p("ledger")},i.oninput=j=>{j.target.id==="lf-q"&&(clearTimeout(H),H=setTimeout(()=>{c=O(),p("ledger")},500))},i.querySelector("#fin-led-export").onclick=()=>ye("Finans hareketleri",[["Tarih","date"],["Hesap","accountName"],["Yön",j=>j.direction==="in"?"Giriş":"Çıkış"],["Tutar","amount"],["Para birimi","currency"],["Kategori","category"],["Cari / taraf","partyName"],["Açıklama","description"],["Kaydeden","createdBy"]],x),L({void:j=>w(async()=>await Le({title:"Hareketi iptal et",message:"Hesap bakiyesi düzeltilir; müşteri tahsilatı, taksit veya çek/senet ile bağlıysa onlar da eski haline döner.",confirmLabel:"İptal et",danger:!0})?I.post(`/finance/transactions/${encodeURIComponent(j.id)}/void`,{}):null)})}async function U(C){if(await wa(),C===u){if(!ve("jt.users.manage")){i.innerHTML=ii("Kullanıcı ve yetki yönetimi için yetkiniz yok.");return}i.innerHTML='<p class="hint" style="margin-bottom:10px">Kullanıcı ekleyin, rollerini seçin. <b>Finans Sorumlusu</b> rolü finans ekranlarını görür ve tahsilat/ödeme yapar; diğer roller Finans menüsünü görmez.</p><div class="page-jobs"><div id="jt-view" class="jt-view"></div></div>',await wt(i.querySelector("#jt-view"))}}let W=null,ee=(()=>{const C=Z.getQueryParams();return C.loan||C.customer||C.supplier||C.cheque||C.tx?C:null})();function te(C){C&&(C.scrollIntoView({behavior:"smooth",block:"center"}),C.classList.add("fin-focus"),setTimeout(()=>C.classList.remove("fin-focus"),2600))}function K(){var $,f;const C=ee;if(ee=null,!C)return;const g=(x,A)=>[...i.querySelectorAll(`[data-act="${x}"]`)].find(O=>O.dataset.id===A);if(n==="loans"&&C.loan){const x=g("plan",C.loan);if(!x){P("Kredi bulunamadı veya kapatılmış.","error");return}te(x.closest(".card")),W=C.inst||null,x.click()}else n==="parties"&&(C.customer||C.supplier)?(q(C.supplier?"supplier":"customer",C.supplier||C.customer),te(($=[...i.querySelectorAll("[data-id]")].find(x=>x.dataset.id===(C.supplier||C.customer)))==null?void 0:$.closest(".card, tr"))):(C.cheque||C.tx)&&te((f=[...i.querySelectorAll("[data-id]")].find(x=>x.dataset.id===(C.cheque||C.tx)))==null?void 0:f.closest(".card, tr"))}return p(s.some(C=>C[0]===n)||n==="team"?n:"overview"),a}const Fr=e=>{if(!e||!e.route)return"";const a=Object.entries(e.params||{}).filter(([,t])=>t!=null&&t!=="").map(([t,s])=>`${encodeURIComponent(t)}=${encodeURIComponent(s)}`).join("&");return a?`${e.route}?${a}`:e.route};function Ai(e){const a=Fr(e);a&&(window.location.hash===`#/${a}`?Z._handleRoute():Z.navigate(a))}const me=(e,a="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:a,maximumFractionDigits:2}).format(Number(e)||0)}catch{return`${Number(e)||0} ${a}`}},Ve=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,ct=(e,a)=>{const t=new Date(`${e}T00:00:00`);return t.setDate(t.getDate()+a),Ve(t)},Me=e=>e?new Date(`${String(e).slice(0,10)}T00:00:00`).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—",ha={loan_overdue:{cls:"ev-late",icon:"ph-warning-octagon",label:"Vadesi geçmiş kredi"},loan_upcoming:{cls:"ev-loan",icon:"ph-bank",label:"Yaklaşan kredi ödemesi"},loan_paid:{cls:"ev-done",icon:"ph-check-circle",label:"Ödenmiş taksit"},receivable:{cls:"ev-recv",icon:"ph-hand-coins",label:"Müşteri tahsilatı"},receivable_overdue:{cls:"ev-recv-late",icon:"ph-hand-coins",label:"Gecikmiş tahsilat"},other:{cls:"ev-other",icon:"ph-note",label:"Çek/senet · tedarikçi · planlı"}};function va(e){return e.type==="loan"?e.status==="paid"?"loan_paid":e.status==="overdue"?"loan_overdue":"loan_upcoming":e.type==="receivable"?e.status==="overdue"?"receivable_overdue":"receivable":"other"}const _r=(e,a="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:a,notation:"compact",maximumFractionDigits:1}).format(Number(e)||0)}catch{return me(e,a)}},Ur=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"],fe={month:null,hidden:new Set(["loan_paid"]),selected:null};function Gr(){const e=document.createElement("div");e.className="fa-page fa-calendar";const a=Z.getQueryParams();/^\d{4}-\d{2}$/.test(a.month||"")&&(fe.month=a.month),fe.month||(fe.month=Ve(new Date).slice(0,7));let t=null;const s=()=>{const[l,d]=fe.month.split("-").map(Number),m=new Date(l,d-1,1),p=ct(Ve(m),-((m.getDay()+6)%7));return{start:p,end:ct(p,41)}};async function i(){const{start:l,end:d}=s();e.querySelector(".fa-cal-body").innerHTML='<div class="loading-spinner"></div>';try{t=(await I.get(`/finance/calendar?from=${l}&to=${d}`)).data,c()}catch(m){e.querySelector(".fa-cal-body").innerHTML=`<div class="card fin-err">${h(m.message)}</div>`}}const r=()=>t.events.filter(l=>!fe.hidden.has(va(l))),n=l=>l.status==="overdue"&&l.date<s().start?t.today:l.date,o=l=>{const d=ha[va(l)];return`<button type="button" class="fa-ev ${d.cls}" data-ev="${h(l.id)}" title="${h(`${d.label} · ${l.title} · ${me(l.amount,l.currency)} · vade ${Me(l.date)}`)}"><i class="ph ${d.icon}"></i><span>${h(l.party.name||l.title)}</span><b>${_r(l.amount,l.currency)}</b></button>`};function c(){const{start:l}=s(),m=r().reduce((L,b)=>((L[n(b)]=L[n(b)]||[]).push(b),L),{}),p=t.totals,v=L=>Object.entries(L||{}).map(([b,E])=>me(E,b)).join(" + ")||me(0);e.querySelector(".fa-cal-sum").innerHTML=`
      <div class="fa-kpi ev-late"><small>Vadesi geçmiş kredi</small><b>${v(p.overdueLoans)}</b></div>
      <div class="fa-kpi ev-loan"><small>Yaklaşan kredi ödemesi</small><b>${v(p.upcomingLoans)}</b></div>
      <div class="fa-kpi ev-recv"><small>Tahsil edilecek</small><b>${v(p.receivables)}</b></div>`;const k=fe.month;let w="";for(let L=0;L<42;L++){const b=ct(l,L),E=(m[b]||[]).sort((y,T)=>(y.status==="overdue"?-1:0)-(T.status==="overdue"?-1:0));w+=`<div class="fa-day ${b.slice(0,7)!==k?"out":""} ${b===t.today?"today":""} ${b===fe.selected?"sel":""}" data-day="${b}">
        <span class="fa-dnum">${Number(b.slice(8))}</span>${E.slice(0,3).map(o).join("")}${E.length>3?`<span class="fa-more">+${E.length-3} daha</span>`:""}</div>`}e.querySelector(".fa-cal-body").innerHTML=`<div class="fa-grid">${Ur.map(L=>`<div class="fa-wd">${L}</div>`).join("")}${w}</div>`,e.querySelector(".fa-cal-title").textContent=new Date(`${k}-01T00:00:00`).toLocaleDateString("tr-TR",{month:"long",year:"numeric"}),u(m)}function u(l){const d=e.querySelector(".fa-agenda"),m=fe.selected,p=m?l[m]||[]:r().filter(v=>v.status!=="paid"&&v.date<=ct(t.today,14)).sort((v,k)=>v.date.localeCompare(k.date));d.innerHTML=`<h3>${m?Me(m):"Önümüzdeki 14 gün ve gecikenler"}</h3>${p.length?p.map(v=>{const k=ha[va(v)];return`<button type="button" class="fa-ag-row ${k.cls}" data-ev="${h(v.id)}"><i class="ph ${k.icon}"></i><span class="fa-ag-main"><b>${h(v.title)}</b><small>${h(k.label)} · ${h(v.erpRef.docType)} ${h(v.erpRef.docNo)} · vade ${Me(v.date)}</small></span><span class="fa-ag-amt ${v.direction}">${v.direction==="in"?"+":"−"}${me(v.amount,v.currency)}</span><i class="ph ph-caret-right"></i></button>`}).join(""):'<p class="hint">Bu gün için kayıt yok.</p>'}`}return e.innerHTML=`
    <div class="fa-toolbar">
      <div class="fa-cal-nav"><button class="icon-btn" data-nav="-1" aria-label="Önceki ay"><i class="ph ph-caret-left"></i></button><h2 class="fa-cal-title"></h2><button class="icon-btn" data-nav="1" aria-label="Sonraki ay"><i class="ph ph-caret-right"></i></button><button class="btn btn-secondary btn-sm" data-nav="0">Bugün</button></div>
      <div class="fa-legend">${Object.entries(ha).map(([l,d])=>`<label class="fa-leg ${d.cls}"><input type="checkbox" data-kind="${l}" ${fe.hidden.has(l)?"":"checked"}><i></i>${d.label}</label>`).join("")}</div>
    </div>
    <div class="fa-cal-sum fa-kpis"></div>
    <div class="fa-cal-wrap"><div class="card fa-cal-body"></div><aside class="card fa-agenda"></aside></div>`,e.addEventListener("click",l=>{const d=l.target.closest("[data-nav]");if(d){const k=Number(d.dataset.nav),[w,L]=fe.month.split("-").map(Number);return fe.month=k===0?Ve(new Date).slice(0,7):Ve(new Date(w,L-1+k,1)).slice(0,7),fe.selected=null,i()}const m=l.target.closest("[data-ev]"),p=m&&m.closest(".fa-day")&&matchMedia("(max-width: 900px)").matches;if(m&&!p){const k=t.events.find(w=>w.id===m.dataset.ev);k&&Ai(k.target);return}const v=l.target.closest("[data-day]");v&&t&&(fe.selected=fe.selected===v.dataset.day?null:v.dataset.day,c(),fe.selected&&matchMedia("(max-width: 900px)").matches&&e.querySelector(".fa-agenda").scrollIntoView({behavior:"smooth",block:"start"}))}),e.addEventListener("change",l=>{const d=l.target.dataset.kind;d&&(l.target.checked?fe.hidden.delete(d):fe.hidden.add(d),t&&c())}),i(),e}const Bt=()=>{const e=Ve(new Date);return{from:ct(e,-30),to:ct(e,60),groupBy:"week",currency:"TRY",direction:"",kind:"",category:"",q:""}},Yr=[["day","Gün"],["week","Hafta"],["month","Ay"]];function Vr(){const e=document.createElement("div");e.className="fa-page fa-cashflow";const a=Z.getQueryParams(),t={...Bt(),...Object.fromEntries(Object.entries(a).filter(([d])=>d in Bt()))};let s=null,i=null;const r=()=>{const d=Object.entries(t).filter(([m,p])=>p&&p!==Bt()[m]).map(([m,p])=>`${m}=${encodeURIComponent(p)}`).join("&");history.replaceState(null,"",`#/cashflow${d?`?${d}`:""}`)};async function n(){const d=e.querySelector(".fa-cf-body");d.innerHTML='<div class="loading-spinner"></div>',r();try{const m=Object.entries(t).filter(([,p])=>p).map(([p,v])=>`${p}=${encodeURIComponent(v)}`).join("&");[s,i]=await Promise.all([I.get(`/finance/cashflow/table?${m}`).then(p=>p.data),i||I.get("/finance/meta").then(p=>p.data)]),o()}catch(m){d.innerHTML=`<div class="card fin-err">${h(m.message)}</div>`}}function o(){const d=s.currency,m=e.querySelector('[name="category"]');m.innerHTML=`<option value="">Tüm kategoriler</option>${s.categories.map(b=>`<option ${b===t.category?"selected":""}>${h(b)}</option>`).join("")}`,e.querySelector('[data-act="plan"]').hidden=!i.canManage;const p=s.lowPoint;e.querySelector(".fa-cf-kpis").innerHTML=`
      <div class="fa-kpi"><small>Açılış (${Me(s.from)})</small><b>${me(s.opening,d)}</b></div>
      <div class="fa-kpi ev-recv"><small>Toplam giriş</small><b>+${me(s.totals.in,d)}</b></div>
      <div class="fa-kpi ev-late"><small>Toplam çıkış</small><b>−${me(s.totals.out,d)}</b></div>
      <div class="fa-kpi"><small>Kapanış (${Me(s.to)})</small><b>${me(s.closing,d)}</b></div>
      <div class="fa-kpi ${p&&p.balance<0?"ev-late":""}"><small>En düşük bakiye</small><b>${p?`${me(p.balance,d)}`:"—"}</b>${p?`<small>${Me(p.date)}</small>`:""}</div>`;const v=Math.max(1,...s.periods.map(b=>Math.max(b.in,b.out))),k=b=>s.groupBy==="month"?new Date(`${b}-01T00:00:00`).toLocaleDateString("tr-TR",{month:"short",year:"2-digit"}):s.groupBy==="week"?`${Me(b).slice(0,6)} hf.`:Me(b).slice(0,6),w=s.periods.map(b=>`<div class="fa-bar" title="${h(`${k(b.key)} · giriş ${me(b.in,d)} · çıkış ${me(b.out,d)} · bakiye ${me(b.closing,d)}`)}">
      <div class="fa-bar-cols"><i class="in ${b.forecastIn>=b.in&&b.in?"fc":""}" style="height:${b.in/v*100}%"></i><i class="out ${b.forecastOut>=b.out&&b.out?"fc":""}" style="height:${b.out/v*100}%"></i></div>
      <small>${k(b.key)}</small><em class="${b.closing<0?"neg":""}">${me(b.closing,d).replace(/,\d+/,"")}</em></div>`).join(""),L=s.rows.map(b=>`<tr class="${b.kind==="forecast"?"fc":""} ${b.target?"link":""}" data-id="${h(b.id)}">
      <td class="c-date">${Me(b.date)}${b.overdue?`<br><span class="fin-chip late">vade ${Me(b.dueDate)}</span>`:""}</td>
      <td class="c-kind">${b.kind==="forecast"?'<span class="fin-chip soon">Tahmin</span>':'<span class="fin-chip ok">Gerçekleşen</span>'}</td>
      <td class="c-desc"><b>${h(b.description||b.category)}</b><br><small>${h(b.category)}${b.account?` · ${h(b.account)}`:""}</small></td>
      <td class="c-party">${h(b.party.name||"")}</td>
      <td class="c-doc"><code>${h(b.erpRef.docType)} ${h(b.erpRef.docNo)}</code></td>
      <td class="num in c-amt">${b.direction==="in"?me(b.amount,d):""}</td>
      <td class="num out c-amt">${b.direction==="out"?me(b.amount,d):""}</td>
      <td class="num c-bal ${b.balance<0?"neg":""}"><b>${me(b.balance,d)}</b></td></tr>`).join("");e.querySelector(".fa-cf-body").innerHTML=`
      <div class="card fa-cf-chart"><div class="fin-card-head"><h3>Dönem özeti</h3><small><i class="dot in"></i> giriş <i class="dot out"></i> çıkış · soluk = tahmin · alt satır: dönem sonu bakiye</small></div><div class="fa-bars">${w||'<p class="hint">Kayıt yok</p>'}</div></div>
      <div class="card fa-cf-table"><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>Tarih</th><th>Tür</th><th>Açıklama</th><th>Cari</th><th>ERP belge</th><th class="num">Giriş</th><th class="num">Çıkış</th><th class="num">Bakiye</th></tr></thead>
      <tbody><tr class="dim c-open"><td>${Me(s.from)}</td><td colspan="6">Devreden bakiye</td><td class="num"><b>${me(s.opening,d)}</b></td></tr>${L||'<tr><td colspan="8" class="hint">Filtreye uyan kayıt yok.</td></tr>'}</tbody></table></div></div>`}async function c(d){const m=await He({title:d?"Planlı kalem":"Planlı kalem ekle",icon:"ph-calendar-plus",wide:!0,message:d&&d.status==="realized"?"Bu kalem gerçekleşmiş; değiştirmek için Hareketler'den ilgili kaydı iptal edin.":"Kira, maaş, vergi gibi henüz gerçekleşmemiş kalemler nakit akışı tahminine ve takvime girer.",confirmLabel:d?"Kaydet":"Ekle",fields:[{name:"direction",label:"Yön",type:"select",options:[["out","Çıkış (gider)"],["in","Giriş (gelir)"]],value:d?d.direction:"out",half:!0},{name:"date",label:"Tarih",type:"date",value:d?d.date:Ve(new Date),half:!0,required:!0},{name:"amount",label:"Tutar",type:"number",value:d?d.amount:"",half:!0,required:!0},{name:"currency",label:"Para birimi",type:"select",options:(i.currencies||["TRY"]).map(p=>[p,p]),value:d?d.currency:t.currency,half:!0},{name:"category",label:"Kategori",type:"select",options:[...new Set([...i.outCategories||[],...i.inCategories||[]])].map(p=>[p,p]),value:d?d.category:"Diğer gider"},{name:"description",label:"Açıklama",value:d?d.description:"",required:!0},{name:"erpDocType",label:"ERP belge türü",type:"select",options:[["","—"],["SF","SF · Satış faturası"],["AF","AF · Alış faturası"],["SIP","SIP · Sipariş"],["PLN","PLN · Planlı"]],value:d&&d.erpDocType||"",half:!0},{name:"erpDocNo",label:"ERP belge no",value:d&&d.erpDocNo||"",half:!0}]});if(m)try{const p=d?await I.put(`/finance/planned/${encodeURIComponent(d.id)}`,m):await I.post("/finance/planned",m);P(p.message,"success"),n()}catch(p){P(p.message,"error")}}async function u(d){try{const m=(await I.get("/finance/planned")).data.find(v=>v.id===d);if(!m)return P("Planlı kalem bulunamadı.","error");if(!i.canManage||m.status!=="planned")return c(m);const p=await qa({title:m.description||"Planlı kalem",message:`${Me(m.date)} · ${me(m.amount,m.currency)}`,icon:"ph-calendar-check",options:[{value:"edit",label:"Düzenle",icon:"ph-pencil-simple"},{value:"realize",label:"Gerçekleşti (hesaba işle)",icon:"ph-check-circle"},{value:"cancel",label:"İptal et",icon:"ph-x-circle"}]});if(p==="edit")return c(m);if(p==="cancel")return P((await I.put(`/finance/planned/${encodeURIComponent(d)}`,{status:"cancelled"})).message,"success"),n();if(p==="realize"){const v=(i.accounts||[]).filter(w=>w.active&&w.currency===m.currency).map(w=>[w.id,`${w.name} · ${me(w.balance,w.currency)}`]),k=await He({title:"Hesaba işle",icon:"ph-check-circle",confirmLabel:"İşle",fields:[{name:"accountId",label:"Hesap",type:"select",options:v,required:!0},{name:"date",label:"Tarih",type:"date",value:Ve(new Date),required:!0}]});if(!k)return;P((await I.put(`/finance/planned/${encodeURIComponent(d)}`,{status:"realized",...k})).message,"success"),n()}}catch(m){P(m.message,"error")}}e.innerHTML=`
    <form class="card fa-filters" autocomplete="off">
      <label>Başlangıç<input type="date" name="from" value="${h(t.from)}"></label>
      <label>Bitiş<input type="date" name="to" value="${h(t.to)}"></label>
      <label>Grupla<select name="groupBy">${Yr.map(([d,m])=>`<option value="${d}" ${t.groupBy===d?"selected":""}>${m}</option>`).join("")}</select></label>
      <label>Para birimi<select name="currency">${["TRY","USD","EUR","GBP"].map(d=>`<option ${t.currency===d?"selected":""}>${d}</option>`).join("")}</select></label>
      <label>Yön<select name="direction"><option value="">Giriş + çıkış</option><option value="in" ${t.direction==="in"?"selected":""}>Yalnız giriş</option><option value="out" ${t.direction==="out"?"selected":""}>Yalnız çıkış</option></select></label>
      <label>Kayıt<select name="kind"><option value="">Gerçekleşen + tahmin</option><option value="actual" ${t.kind==="actual"?"selected":""}>Gerçekleşen</option><option value="forecast" ${t.kind==="forecast"?"selected":""}>Tahmin</option></select></label>
      <label>Kategori<select name="category"></select></label>
      <label class="grow">Ara<input type="search" name="q" value="${h(t.q)}" placeholder="Cari, açıklama, belge no"></label>
      <div class="fa-filter-acts"><button type="button" class="btn btn-secondary btn-sm fa-more-filters" data-act="morefilters"><i class="ph ph-sliders-horizontal"></i> Filtreler</button><button type="button" class="btn btn-secondary btn-sm" data-act="reset" title="Filtreleri sıfırla"><i class="ph ph-arrow-counter-clockwise"></i><span> Sıfırla</span></button><button type="button" class="btn btn-primary btn-sm" data-act="plan" hidden><i class="ph ph-plus"></i><span> Planlı kalem</span></button>${Ee("fa-cf-export")}</div>
    </form>
    <div class="fa-cf-kpis fa-kpis"></div>
    <div class="fa-cf-body"></div>`;let l;return e.querySelector(".fa-filters").addEventListener("input",d=>{const m=d.target.name;m&&(t[m]=d.target.value,clearTimeout(l),l=setTimeout(n,m==="q"?350:0))}),e.querySelector(".fa-filters").addEventListener("submit",d=>d.preventDefault()),e.addEventListener("click",d=>{var v;const m=d.target.closest("[data-act]");if((m==null?void 0:m.dataset.act)==="reset")return Object.assign(t,Bt()),e.querySelectorAll(".fa-filters [name]").forEach(k=>{k.value=t[k.name]??""}),n();if((m==null?void 0:m.dataset.act)==="plan")return c(null);if((m==null?void 0:m.dataset.act)==="morefilters"){e.querySelector(".fa-filters").classList.toggle("open");return}if(d.target.closest("#fa-cf-export")&&s)return ye(`Nakit akışı ${s.from} - ${s.to}`,[["Tarih","date"],["Tür",k=>k.kind==="forecast"?"Tahmin":"Gerçekleşen"],["Açıklama","description"],["Kategori","category"],["Cari",k=>k.party.name],["Cari kodu",k=>k.party.id||""],["ERP belge",k=>`${k.erpRef.docType} ${k.erpRef.docNo}`],["Giriş",k=>k.direction==="in"?k.amount:""],["Çıkış",k=>k.direction==="out"?k.amount:""],["Bakiye","balance"]],s.rows);const p=d.target.closest("tr[data-id]");if(p&&s){const k=s.rows.find(w=>w.id===p.dataset.id);if(((v=k==null?void 0:k.target)==null?void 0:v.route)==="cashflow")return u(k.target.params.planned);k!=null&&k.target&&Ai(k.target)}}),n().then(()=>{a.planned&&i&&u(a.planned)}),e}Z.register("login",$s,{requiresAuth:!1,title:"Giriş"});Z.register("dashboard",zs,{requiresAuth:!0,title:"Ana Sayfa"});Z.register("operations",Jn,{requiresAuth:!0,title:"İşlemler"});Z.register("transfer",Os,{requiresAuth:!0,title:"Depolar Arası Transfer"});Z.register("vehicle-unload",Fs,{requiresAuth:!0,title:"Araba'dan Boşaltma"});Z.register("sales",Us,{requiresAuth:!0,title:"Satış İşlemleri"});Z.register("purchase",Vs,{requiresAuth:!0,title:"Alış İşlemleri"});Z.register("purchase-module",Qs,{requiresAuth:!0,title:"Satın Alma"});Z.register("stock-detail",In,{requiresAuth:!0,title:"Stok Detay"});Z.register("serial-detail",Pn,{requiresAuth:!0,title:"Seri Detay"});Z.register("stock-count",Rn,{requiresAuth:!0,title:"Stok Sayım"});Z.register("reports",Bn,{requiresAuth:!0,title:"Raporlar"});Z.register("customer-balance",Gn,{requiresAuth:!0,title:"Müşteri Bakiyeleri"});Z.register("copilot",Kn,{requiresAuth:!0,title:"AI CoPilot"});Z.register("settings",On,{requiresAuth:!0,title:"Ayarlar"});Z.register("raw-materials",Fn,{requiresAuth:!0,title:"Hammadde Takibi"});Z.register("recipes",_n,{requiresAuth:!0,title:"Ürün Reçeteleri"});Z.register("production",Un,{requiresAuth:!0,title:"Üretim Girişi"});Z.register("jobs",qn,{requiresAuth:!0,title:"İş & Durum Takip"});Z.register("help",Yn,{requiresAuth:!0,title:"Yardım"});Z.register("packing-list",Vn,{requiresAuth:!0,title:"Çeki Listesi"});Z.register("barcode",Pr,{requiresAuth:!0,title:"Barkod Oluştur"});Z.register("finance",Or,{requiresAuth:!0,title:"Finans"});const Mi=(e,a)=>()=>{const t=document.createElement("div");t.className="page-finance page-container fin-wms-screen",t.appendChild(ue({title:a,gradientClass:"gradient-reports"}));const s=document.createElement("div");return s.className="page-content",s.appendChild(e()),t.appendChild(s),t};Z.register("calendar",Mi(Gr,"Finans Takvimi"),{requiresAuth:!0,title:"Finans Takvimi"});Z.register("cashflow",Mi(Vr,"Nakit Akışı"),{requiresAuth:!0,title:"Nakit Akışı"});Z.register("activity",ir,{requiresAuth:!0,title:"Son İşlemler"});Z.register("serial-warehouse-balance",Qn,{requiresAuth:!0,title:"Seri Ambar Bakiye"});Z.setLayout((e,a,t)=>t.requiresAuth?Is(e,a):e);Z.addGuard(async(e,a)=>a.requiresAuth&&!ge.isLoggedIn()?(Z.navigate("login"),!1):e==="login"&&ge.isLoggedIn()||!Qr(e)?(Z.navigate("dashboard"),!1):!0);function Qr(e){var s,i;if(e==="calendar"||e==="cashflow")return!!((s=F.modules.finance)!=null&&s.enabled)&&St("finance");const a=Object.values(F.modules).find(r=>r.route===e);return a?a.enabled:["serial-warehouse-balance","serial-detail","packing-list","stock-detail","customer-balance","activity"].includes(e)?((i=F.modules.reports)==null?void 0:i.enabled)&&F.reportTypes.some(r=>r.route===e):!0}window.addEventListener("unhandledrejection",e=>{var t;const a=(t=e.reason)==null?void 0:t.message;a&&(e.preventDefault(),P(a,"error"))});async function si(){await hs(),I.baseUrl=I._getBaseUrl(),I.timeout=F.apiTimeout,localStorage.getItem(F.storageKeys.theme)==="dark"&&document.body.classList.add("dark-theme"),ge.checkSession(),vs({onUpdate:()=>Z._handleRoute(),onNavigate:a=>{a!=="login"&&!ge.isLoggedIn()&&Be.update({user:{name:"Demo Kullanıcı"},isAuthenticated:!0}),a==="login"&&Be.update({user:null,isAuthenticated:!1}),Z.getCurrentPath()===a?Z._handleRoute():Z.navigate(a)}}),cs(),di(()=>Z._handleRoute()),ys(),Z.init(),console.log(`${F.appName} başlatıldı (${F.slug})`)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",si):si();
