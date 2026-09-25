/*! (c) Codendtec. Tüm hakları saklıdır. Bu yazılım ticari sırdır; izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz veya tersine mühendislikle çözülemez. All rights reserved. */(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();class Us{constructor(){this.routes={},this.currentRoute=null,this.guards=[],this.onRouteChange=null,this._lastHref=null;const t=()=>{location.href!==this._lastHref&&this._handleRoute()};window.addEventListener("hashchange",t),window.addEventListener("popstate",t),"scrollRestoration"in history&&(history.scrollRestoration="manual")}register(t,a,i={}){return this.routes[t]={handler:a,...i},this}setLayout(t){return this.layout=t,this}addGuard(t){return this.guards.push(t),this}navigate(t){window.location.hash=`#/${t}`}step(t={}){const a=Object.entries(t).filter(([,n])=>n!=null&&n!=="").map(([n,r])=>`${encodeURIComponent(n)}=${encodeURIComponent(r)}`).join("&"),i=`#/${this.getCurrentPath()}${a?`?${a}`:""}`;if(window.location.hash===i)return;const s=this._nextIdx();history.pushState({idx:s},"",i),this._lastHref=location.href,this._idx=s}_nextIdx(){let t=0;try{t=Number(sessionStorage.getItem("nav_seq"))||0,sessionStorage.setItem("nav_seq",String(t+1))}catch{t=Date.now()}return t+1}_markEntry(){(!history.state||history.state.idx==null)&&history.replaceState({...history.state||{},idx:this._nextIdx()},""),this._idx=history.state.idx;try{const t=Number(sessionStorage.getItem("nav_first"));(!t||this._idx<t)&&sessionStorage.setItem("nav_first",String(this._idx))}catch{}}back(){let t=0;try{t=Number(sessionStorage.getItem("nav_first"))||0}catch{}this._idx&&t&&this._idx>t?window.history.back():this.navigate("dashboard")}getCurrentPath(){return(window.location.hash.slice(2)||"login").split("?")[0]}getQueryParams(){const a=(window.location.hash.slice(2)||"").split("?")[1]||"",i={};return a&&a.split("&").forEach(s=>{const[n,r]=s.split("=");i[decodeURIComponent(n)]=decodeURIComponent(r||"")}),i}init(){this._handleRoute()}async _handleRoute(){this._lastHref=location.href,this._markEntry();const t=this.getCurrentPath(),a=this.routes[t];if(!a){this.navigate("login");return}for(const s of this.guards)if(!await s(t,a))return;this.currentRoute=t,this.onRouteChange&&this.onRouteChange(t,a);const i=typeof a=="function"?a:a.handler;if(typeof a=="object"?a.afterRender:a==null||a.afterRender,i){const s=document.getElementById("app");if(s){s.innerHTML="";let n=await i();this.layout&&(n=this.layout(n,t,a)),typeof n=="string"?s.innerHTML=n:n instanceof HTMLElement&&s.appendChild(n),a.afterRender&&a.afterRender(),this._scrollTop()}}}_scrollTop(){const t=()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0,document.body.scrollTop=0,document.querySelectorAll(".shell-content, #app").forEach(a=>{a.scrollTop=0})};t(),requestAnimationFrame(t)}}const W=new Us,Gs="Şirket",Ys="Mobil WMS",Vs="Mobil WMS",Qs="AI Destekli Mobil Depo ve Operasyon Yönetim Sistemi",Js="1.0.0",Ws="",Zs="",Xs={erpApiUrl:"/api",apiTimeout:1e4,useMockApi:!0},ei={primary:"#2F5BEA",primaryLight:"#4C74F0",primaryDark:"#1D3FB0",secondary:"#F2A516",secondaryLight:"#F7C04F",secondaryDark:"#C4830A",surface:"#0F2240"},ti={title:"Destek",text:"Depo takip sistemi kullanımıyla ilgili yardıma mı ihtiyacınız var?",phone:"",email:"",website:""},ai=[{id:"warehouse",title:"Depo İşlemleri"},{id:"trade",title:"Satış & Alış İşlemleri"},{id:"production",title:"Üretim İşlemleri"},{id:"ai",title:"Yapay Zeka Asistan"},{id:"other",title:"Diğer İşlemler"}],si={transfer:{enabled:!0,label:"Depolar Arası",icon:"ph-arrows-left-right",route:"transfer",color:"transfer",section:"warehouse",description:"Depolar arası stok transferi"},vehicleUnload:{enabled:!1,label:"Araba'dan",icon:"ph-truck",route:"vehicle-unload",color:"vehicle",section:"warehouse",description:"Araçtan depoya mal boşaltma (Pasif)"},sales:{enabled:!0,label:"Satış",icon:"ph-storefront",route:"sales",color:"sales",section:"trade",description:"Satış işlemleri"},purchase:{enabled:!0,label:"Satın Alma",icon:"ph-shopping-cart",route:"purchase-module",color:"purchase",section:"trade",description:"Tedarikçi ve sipariş (PO) yönetimi"},suppliers:{enabled:!1,label:"Tedarikçiler",icon:"ph-buildings",route:"suppliers",color:"purchase",section:"trade",description:"Tedarikçi kartları, kategori ve vade bilgileri"},"purchase-old":{enabled:!1,label:"Hızlı Alış",icon:"ph-download-simple",route:"purchase",color:"purchase",section:"trade",description:"Hızlı mal kabul işlemleri (Pasif)"},rawMaterials:{enabled:!0,label:"Hammadde Takibi",icon:"ph-flask",route:"raw-materials",color:"raw-materials",section:"production",description:"Hammadde stok takibi"},recipes:{enabled:!0,label:"Ürün Reçeteleri",icon:"ph-book-open",route:"recipes",color:"recipes",section:"production",description:"Ürün reçeteleri (BOM)"},production:{enabled:!0,label:"Üretim Girişi",icon:"ph-factory",route:"production",color:"production",section:"production",description:"Reçeteye göre üretim girişi"},jobTracking:{enabled:!1,label:"İş & Durum Takip",icon:"ph-kanban",route:"jobs",color:"jobs",section:"production",description:"Proje, sipariş ve iş takibi; süreç durumu, kişi performansı, yetkilendirme ve gecikme uyarıları (İş Takip destekli ayrı backend gerekir)"},copilot:{enabled:!0,label:"AI CoPilot",icon:"ph-sparkle",route:"copilot",color:"copilot",section:"ai",description:"Yapay zeka asistanı",display:"banner"},barcode:{enabled:!1,label:"Barkod Oluştur",icon:"ph-barcode",route:"barcode",color:"stock-count",section:"warehouse",description:"Ürün + barkod oluştur, etiket boyutu seç, yazıcıdan yazdır"},finance:{enabled:!1,label:"Finans",icon:"ph-bank",route:"finance",color:"purchase",section:"trade",description:"Kasa/banka, kredi, müşteri ve tedarikçi bakiyeleri, çek/senet ve vade hatırlatmaları (ERP'ye bağlı; finans destekli backend gerekir)"},stockCount:{enabled:!0,label:"Stok Sayım",icon:"ph-clipboard-text",route:"stock-count",color:"stock-count",section:"other",description:"Barkodlu stok sayımı"},stockDetail:{enabled:!1,label:"Stok Detay",icon:"ph-package",route:"stock-detail",color:"stock",section:"warehouse",description:"Ürün kartı, depo dağılımı, stok ekleme ve stok yönetimi"},reports:{enabled:!0,label:"Raporlar",icon:"ph-chart-bar",route:"reports",color:"reports",section:"other",description:"Rapor ekranları"},settings:{enabled:!0,label:"Ayarlar",icon:"ph-gear",route:"settings",color:"settings",section:"other",description:"Uygulama ayarları"},help:{enabled:!0,label:"Yardım",icon:"ph-question",route:"help",color:"help",section:"other",description:"Yardım ve destek ekranı"}},ii={prefix:"2",defaultFormat:"ean13",defaultSize:"50x30",showCompany:!1,printer:{mode:"browser",language:"zpl",dpi:203}},ni=[{id:"toptan",enabled:!0,label:"Toptan Satış",desc:"Büyük miktarlı satış işlemleri",icon:"ph-factory",color:"#4CAF50",badge:"TOPTAN"},{id:"perakende",enabled:!0,label:"Perakende Satış",desc:"Bireysel müşteri satış işlemleri",icon:"ph-buildings",color:"#5C6BC0",badge:"PERAKENDE"},{id:"ihracat",enabled:!0,label:"İhracat Satış",desc:"Uluslararası satış işlemleri",icon:"ph-globe-hemisphere-west",color:"#0097A7",badge:"İHRACAT"},{id:"b2b",enabled:!0,label:"İşletmeler Arası Satış",desc:"B2B satış ve transfer işlemleri",icon:"ph-briefcase",color:"#FFA726",badge:"B2B"},{id:"iade",enabled:!0,label:"Satış İade",desc:"Satış iade işlemleri",icon:"ph-arrow-u-down-left",color:"#EF5350",badge:"İADE"}],ri=[{id:"seriAmbar",enabled:!0,label:"Seri Ambar Bakiye",icon:"ph-clipboard-text",color:"blue",route:"serial-warehouse-balance"},{id:"seriDetay",enabled:!0,label:"Seri Detay",icon:"ph-magnifying-glass",color:"green",route:"serial-detail"},{id:"cekiListesi",enabled:!0,label:"Çeki Listesi",icon:"ph-note",color:"orange",route:"packing-list"},{id:"stokDetay",enabled:!0,label:"Stok Detay",icon:"ph-tag",color:"orange",route:"stock-detail"},{id:"musteriBakiye",enabled:!0,label:"Müşteri Bakiye",icon:"ph-credit-card",color:"purple",route:"customer-balance"},{id:"sonIslemler",enabled:!0,label:"Son İşlemler",icon:"ph-clock-counter-clockwise",color:"blue",route:"activity"}],li=["MT","MP","IT","CT"],oi=[{code:"USD",symbol:"$",label:"Dolar"},{code:"EUR",symbol:"€",label:"Euro"},{code:"TRY",symbol:"₺",label:"TL"}],ci="tr",di={requireApproval:!0,requireInvoiceForReceive:!0,allowPartialReceive:!0},pi={companyName:Gs,appName:Ys,shortName:Vs,appDescription:Qs,version:Js,logo:Ws,storagePrefix:Zs,api:Xs,theme:ei,support:ti,sections:ai,modules:si,barcode:ii,salesTypes:ni,reportTypes:ri,priceTypes:li,currencies:oi,language:ci,purchaseConfig:di},fs=e=>JSON.parse(JSON.stringify(e)),la=e=>e&&e.trim().startsWith("<")?e:`<i class="ph ${e||"ph-square"}"></i>`;function ui(e,t){const a=(e||"?").trim().charAt(0).toLocaleUpperCase("tr")||"?",i=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${t}"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="52" font-weight="700" fill="#fff">${a.replace(/[<&>"]/g,"")}</text></svg>`;return`data:image/svg+xml,${encodeURIComponent(i)}`}function oa(e=[],t){if(!Array.isArray(t))return fs(e);const a=new Map(t.map(n=>[n.id,n])),i=e.map(n=>({...n,...a.get(n.id)||{}}));t.forEach(n=>{e.some(r=>r.id===n.id)||i.push({...n})});const s=t.map(n=>n.id);return i.sort((n,r)=>{const d=s.indexOf(n.id),l=s.indexOf(r.id);return(d===-1?999:d)-(l===-1?999:l)}),i}function gs(e={}){const t=fs(pi),a=e||{},i=Array.isArray(a.moduleOrder)?a.moduleOrder.filter(b=>t.modules[b]):[],s=[...new Set([...i,...Object.keys(t.modules)])],n={};s.forEach(b=>{const v=t.modules[b],L={...v,...(a.modules||{})[b]||{}};L.labelOverridden=!!(a.modules&&a.modules[b]&&a.modules[b].label&&a.modules[b].label!==v.label),L.iconClass=L.icon,L.icon=la(L.icon),n[b]=L});const r=a.companyName||t.companyName,d=n.copilot;d&&(d.baseLabel=t.modules.copilot.label,(!d.label||d.label===t.modules.copilot.label)&&(d.label=`${r} ${d.baseLabel}`));const l=oa(t.sections,a.sections),p=oa(t.salesTypes,a.salesTypes).filter(b=>b.enabled!==!1).map(b=>({...b,iconClass:b.icon,icon:la(b.icon)})),c=oa(t.reportTypes,a.reportTypes).filter(b=>b.enabled!==!1).map(b=>({...b,iconClass:b.icon,icon:la(b.icon)})),o={...t.api,...a.api||{}},m=a.slug||"default",h=a.storagePrefix||t.storagePrefix||m;return{slug:m,companyName:r,appName:a.appName||t.appName,shortName:a.shortName||a.appName||t.shortName,appDescription:a.appDescription??t.appDescription,version:t.version,logoUrl:a.logo?a.logo.startsWith("data:")?a.logo:`./tenant/${a.logo}`:ui(a.companyName||t.companyName,{...t.theme,...a.theme||{}}.primary),logoZoom:Math.min(300,Math.max(40,Number(a.logoZoom)||100)),logoOffsetX:Math.min(50,Math.max(-50,Number(a.logoOffsetX)||0)),logoOffsetY:Math.min(50,Math.max(-50,Number(a.logoOffsetY)||0)),erpApiUrl:o.erpApiUrl,apiTimeout:o.apiTimeout,useMockApi:o.useMockApi,theme:{...t.theme,...a.theme||{}},support:{...t.support,...a.support||{}},sections:l,modules:n,salesTypes:p,reportTypes:c,barcode:{...t.barcode,...a.barcode||{},printer:{...(t.barcode||{}).printer,...(a.barcode||{}).printer||{}}},priceTypes:a.priceTypes||t.priceTypes,currencies:a.currencies||t.currencies,defaultBranch:a.defaultBranch??null,defaultWarehouse:a.defaultWarehouse??null,language:a.language||t.language,purchaseConfig:{...t.purchaseConfig,...a.purchaseConfig||{}},terms:{sale:"Satış",sales:"satış",saleIcon:"ph-shopping-cart",warehouses:"depolar arası",customer:"Müşteri",depotOf:"deposunun",...a.terms||{}},storageKeys:{token:`${h}_token`,user:`${h}_user`,apiUrl:`${h}_api_url`,theme:`${h}_theme`,settings:`${h}_settings`,notify:`${h}_notify`}}}const z=gs({});function ys(e){const t=gs(e);return Object.keys(z).forEach(a=>delete z[a]),Object.assign(z,t),z}function nt(e,t){var i;const a=(i=z.modules)==null?void 0:i[e];return a&&a.labelOverridden?a.label:t}function qt(e,t){var a;return((a=(z.reportTypes||[]).find(i=>i.id===e))==null?void 0:a.label)||t}class mi{constructor(){this._state={user:null,isAuthenticated:!1,currentPage:"login",apiUrl:"",notifications:[],loading:!1,branches:[],warehouses:[],selectedBranch:null,selectedWarehouse:null},this._listeners={}}get(t){return this._state[t]}set(t,a){const i=this._state[t];this._state[t]=a,this._notify(t,a,i)}update(t){Object.entries(t).forEach(([a,i])=>{this.set(a,i)})}subscribe(t,a){return this._listeners[t]||(this._listeners[t]=[]),this._listeners[t].push(a),()=>{this._listeners[t]=this._listeners[t].filter(i=>i!==a)}}_notify(t,a,i){this._listeners[t]&&this._listeners[t].forEach(s=>s(a,i))}reset(){this._state={user:null,isAuthenticated:!1,currentPage:"login",apiUrl:this._state.apiUrl,notifications:[],loading:!1,branches:[],warehouses:[],selectedBranch:null,selectedWarehouse:null}}}const ze=new mi,hi="modulepreload",bi=function(e,t){return new URL(e,t).href},Ja={},Ve=function(t,a,i){let s=Promise.resolve();if(a&&a.length>0){const r=document.getElementsByTagName("link"),d=document.querySelector("meta[property=csp-nonce]"),l=(d==null?void 0:d.nonce)||(d==null?void 0:d.getAttribute("nonce"));s=Promise.allSettled(a.map(p=>{if(p=bi(p,i),p in Ja)return;Ja[p]=!0;const c=p.endsWith(".css"),o=c?'[rel="stylesheet"]':"";if(!!i)for(let b=r.length-1;b>=0;b--){const v=r[b];if(v.href===p&&(!c||v.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${p}"]${o}`))return;const h=document.createElement("link");if(h.rel=c?"stylesheet":hi,c||(h.as="script"),h.crossOrigin="",h.href=p,l&&h.setAttribute("nonce",l),document.head.appendChild(h),c)return new Promise((b,v)=>{h.addEventListener("load",b),h.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${p}`)))})}))}function n(r){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=r,window.dispatchEvent(d),!d.defaultPrevented)throw r}return s.then(r=>{for(const d of r||[])d.status==="rejected"&&n(d.reason);return t().catch(n)})},vi=[{id:1,username:"admin",password:"1234",name:"Buhara Karataştan",role:"admin",branch:"101",branchName:"(MESIHPASA)NURVAR"},{id:2,username:"depocu",password:"1234",name:"Mehmet Kaya",role:"warehouse",branch:"102",branchName:"(AGAYOKUSU)NURVAR"},{id:3,username:"satici",password:"1234",name:"Fatma Demir",role:"sales",branch:"101",branchName:"(MESIHPASA)NURVAR"}],fi=[{id:"101",name:"(MESIHPASA)NURVAR",code:"101"},{id:"102",name:"(AGAYOKUSU)NURVAR",code:"102"},{id:"103",name:"KESTEL ŞUBE",code:"103"}],ca=[{id:"1014",name:"Ana Depo",code:"1014",branchId:"101"},{id:"1017",name:"TAŞÇI HAKAN DEPO",code:"1017",branchId:"101"},{id:"1020",name:"Ana Depo",code:"1020",branchId:"102"},{id:"1021",name:"Yedek Depo",code:"1021",branchId:"102"},{id:"1030",name:"Kestel Depo",code:"1030",branchId:"103"}],gi=[{id:"jn1016",code:"JN1016/01/012/D/295F102/AK",name:"PERDELİK TÜL KUMAŞ",desen:"JN1016",zemin:"01",varyant:"012",en:295,enUnit:"cm",netWeight:222.7,brutWeight:522.7,unit:"METER",collection:"PLAIN KOLEKSİYON",prices:{MT:{usd:7.2,eur:6.2,try:325,profitRate:30},MP:{usd:8.5,eur:7.3,try:385,profitRate:35},IT:{usd:6,eur:5.1,try:270,profitRate:25},CT:{usd:9,eur:7.8,try:410,profitRate:40}},hasSerial:!0},{id:"fa1827",code:"FA1827/33/017/D/280F80/BJ",name:"DÖŞEMELIK KUMAŞ",desen:"FA1827",zemin:"33",varyant:"017",en:280,enUnit:"cm",netWeight:180.5,brutWeight:410,unit:"METER",collection:"PREMIUM KOLEKSİYON",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22},CT:{usd:15.5,eur:13.4,try:700,profitRate:38}},hasSerial:!0},{id:"mb2045",code:"MB2045/05/003/D/310F120/WH",name:"FONFON PERDE",desen:"MB2045",zemin:"05",varyant:"003",en:310,enUnit:"cm",netWeight:150.2,brutWeight:340,unit:"METER",collection:"BASIC KOLEKSİYON",prices:{MT:{usd:5.8,eur:5,try:262,profitRate:25},MP:{usd:6.9,eur:5.95,try:312,profitRate:30},IT:{usd:4.8,eur:4.15,try:218,profitRate:20},CT:{usd:7.5,eur:6.45,try:340,profitRate:35}},hasSerial:!0}],yt=[{serialNo:"N19000041841",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:16.5,cell:"1014M3/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"JN1047/017/017 BEYAZ",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000041842",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:10.7,cell:"1014M3/01/03",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"JN1047/017/017 BEYAZ",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044948",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:24,cell:"1014M3/02/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044952",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:10.3,cell:"1014M3/02/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044953",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:17.5,cell:"1014M4/01/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044954",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:11.2,cell:"1014M4/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"N19000044955",stockId:"jn1016",stockCode:"JN1016/01/012/D/295F102/AK",stockName:"PERDELİK TÜL KUMAŞ",quantity:17.5,cell:"1014M4/01/03",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PLAIN KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:6.8,eur:5.9,try:310.2,profitRate:30},MP:{usd:8.1,eur:7,try:368,profitRate:35},IT:{usd:5.7,eur:4.9,try:258,profitRate:25}}},{serialNo:"H022400004087",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:19.5,cell:"1014M5/01/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0525031616",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:14,cell:"1014M5/01/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0826032796",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:35,cell:"1014M5/02/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0826032690",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:35,cell:"1014M5/02/02",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}},{serialNo:"NT0924022375",stockId:"fa1827",stockCode:"FA1827/33/017/D/280F80/BJ",stockName:"DÖŞEMELIK KUMAŞ",quantity:32,cell:"1014M5/03/01",warehouseId:"1014",warehouseName:"Ana Depo",branchId:"101",branchName:"(MESIHPASA)NURVAR",collection:"PREMIUM KOLEKSİYON",oldDesen:"-",prices:{MT:{usd:12.5,eur:10.8,try:565,profitRate:28},MP:{usd:14,eur:12.1,try:635,profitRate:32},IT:{usd:10,eur:8.6,try:450,profitRate:22}}}],yi=[{id:1,name:"ABC Tekstil Ltd.",code:"C001",balance:{usd:15240.5,eur:12800,try:685e3}},{id:2,name:"XYZ Mobilya A.Ş.",code:"C002",balance:{usd:8750,eur:7200,try:395e3}},{id:3,name:"Güneş Perde San.",code:"C003",balance:{usd:22100,eur:18500,try:998e3}},{id:4,name:"Yıldız Home Tekstil",code:"C004",balance:{usd:3400,eur:2900,try:153e3}}],Wa=[{name:"Mesihpaşa Usd Kasa",balance:142210.99,currency:"USD"},{name:"MESİHPAŞA KİRA GETİRİSİ",balance:104256,currency:"USD"},{name:"Kestel USD Kasa",balance:0,currency:"USD"},{name:"Mesihpaşa Euro Kasa",balance:85430.5,currency:"EUR"},{name:"Mesihpaşa TL Kasa",balance:215e4,currency:"TRY"}],Ee=[{id:"SUP001",code:"TED-001",name:"Güven Tekstil A.Ş.",contactPerson:"Ahmet Yılmaz",phone:"+90 212 555 0101",email:"ahmet@guvtekstil.com",address:"İkitelli OSB, İstanbul",taxNo:"1234567890",currency:"TRY",paymentTerm:30,category:"Tekstil",status:"active",totalOrders:12,totalAmount:485e3,createdAt:"2025-01-15"},{id:"SUP002",code:"TED-002",name:"Euro Fabric GmbH",contactPerson:"Klaus Müller",phone:"+49 30 555 0202",email:"k.muller@eurofabric.de",address:"Berlin, Germany",taxNo:"DE123456789",currency:"EUR",paymentTerm:45,category:"Tekstil",status:"active",totalOrders:8,totalAmount:92e3,createdAt:"2025-03-10"},{id:"SUP003",code:"TED-003",name:"Anadolu Hammadde Ltd.",contactPerson:"Fatma Arslan",phone:"+90 332 555 0303",email:"fatma@anadoluhmm.com",address:"Organize Sanayi, Konya",taxNo:"9876543210",currency:"TRY",paymentTerm:15,category:"Hammadde",status:"active",totalOrders:24,totalAmount:124e4,createdAt:"2024-11-05"},{id:"SUP004",code:"TED-004",name:"Global Ambalaj San.",contactPerson:"Mehmet Çetin",phone:"+90 262 555 0404",email:"mcetin@globalambalaj.com",address:"Gebze Sanayi, Kocaeli",taxNo:"1122334455",currency:"TRY",paymentTerm:30,category:"Ambalaj",status:"passive",totalOrders:5,totalAmount:87e3,createdAt:"2025-06-20"}],oe=[{id:"PO-2026-001",supplierId:"SUP001",supplierName:"Güven Tekstil A.Ş.",orderDate:"2026-09-01",expectedDate:"2026-09-15",status:"received",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"INV-2026-0412",notes:"Acil ihtiyaç",lines:[{id:"L1",productCode:"JN1016/01/012",productName:"PERDELİK TÜL KUMAŞ",unit:"METER",qty:500,receivedQty:500,unitPrice:325,taxRate:20,discount:5},{id:"L2",productCode:"FA1827/33/017",productName:"DÖŞEMELIK KUMAŞ",unit:"METER",qty:200,receivedQty:200,unitPrice:565,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:"Buhara Karataştan",approvedAt:"2026-09-02"},{id:"PO-2026-002",supplierId:"SUP003",supplierName:"Anadolu Hammadde Ltd.",orderDate:"2026-09-10",expectedDate:"2026-09-20",status:"approved",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"",notes:"",lines:[{id:"L1",productCode:"RAW-KAKAO",productName:"Toz Kakao",unit:"Kg",qty:1e3,receivedQty:0,unitPrice:145,taxRate:8,discount:0},{id:"L2",productCode:"RAW-SEKER",productName:"Toz Şeker",unit:"Kg",qty:2e3,receivedQty:0,unitPrice:48,taxRate:8,discount:2},{id:"L3",productCode:"RAW-SUT",productName:"Süt Tozu",unit:"Kg",qty:500,receivedQty:0,unitPrice:220,taxRate:8,discount:0}],createdBy:"Buhara Karataştan",approvedBy:"Buhara Karataştan",approvedAt:"2026-09-11"},{id:"PO-2026-003",supplierId:"SUP002",supplierName:"Euro Fabric GmbH",orderDate:"2026-09-12",expectedDate:"2026-09-30",status:"partial",currency:"EUR",exchangeRate:37.5,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"EF-INV-4521",notes:"İkinci parti Ekim'de gelecek",lines:[{id:"L1",productCode:"MB2045/05/003",productName:"FONFON PERDE",unit:"METER",qty:300,receivedQty:150,unitPrice:5,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:null,approvedAt:null},{id:"PO-2026-004",supplierId:"SUP004",supplierName:"Global Ambalaj San.",orderDate:"2026-09-15",expectedDate:"2026-09-22",status:"draft",currency:"TRY",exchangeRate:1,warehouseId:"1020",warehouseName:"Ana Depo",invoiceNo:"",notes:"Fiyat teklifi bekleniyor",lines:[{id:"L1",productCode:"RAW-AMBALAJ",productName:"5kg Kova Ambalaj",unit:"Adet",qty:500,receivedQty:0,unitPrice:85,taxRate:20,discount:10}],createdBy:"Mehmet Kaya",approvedBy:null,approvedAt:null},{id:"PO-2026-005",supplierId:"SUP001",supplierName:"Güven Tekstil A.Ş.",orderDate:"2026-08-20",expectedDate:"2026-09-05",status:"cancelled",currency:"TRY",exchangeRate:1,warehouseId:"1014",warehouseName:"Ana Depo",invoiceNo:"",notes:"Tedarikçi iptal etti",lines:[{id:"L1",productCode:"JN1016/01/012",productName:"PERDELİK TÜL KUMAŞ",unit:"METER",qty:100,receivedQty:0,unitPrice:325,taxRate:20,discount:0}],createdBy:"Buhara Karataştan",approvedBy:null,approvedAt:null}],ki={draft:{label:"Taslak",color:"#9E9E9E",icon:"ph-pencil-simple"},pending:{label:"Onay Bekliyor",color:"#FF9800",icon:"ph-clock"},approved:{label:"Onaylandı",color:"#2196F3",icon:"ph-check-circle"},ordered:{label:"Sipariş Verildi",color:"#9C27B0",icon:"ph-package"},partial:{label:"Kısmi Teslim",color:"#FF5722",icon:"ph-arrows-split"},received:{label:"Teslim Alındı",color:"#4CAF50",icon:"ph-check-fat"},cancelled:{label:"İptal",color:"#F44336",icon:"ph-x-circle"}};function ks(e){const t=(e.qty||0)*(e.unitPrice||0),a=t*((e.discount||0)/100);return t-a}function Ut(e){return(e.lines||[]).reduce((t,a)=>t+ks(a),0)}function Sa(e){return(e.lines||[]).reduce((t,a)=>{const i=ks(a);return t+i*((a.taxRate||0)/100)},0)}function Rt(e){return Ut(e)+Sa(e)}function $i(e=400){return new Promise(t=>setTimeout(t,e+Math.random()*300))}async function $s(e,t,a){var i;if(await $i(),t==="/auth/login"&&e==="POST"){const s=vi.find(n=>n.username===a.username&&n.password===a.password);if(s){const{password:n,...r}=s;return{success:!0,data:{token:"mock-token-"+Date.now(),user:r}}}return{success:!1,message:"Kullanıcı adı veya şifre hatalı"}}if(t==="/auth/logout")return{success:!0};if(t==="/branches"&&e==="GET")return{success:!0,data:fi};if(t.startsWith("/warehouses")&&e==="GET"){const s=t.split("/");if(s.length>2){const n=t.split("branchId=")[1];return n?{success:!0,data:ca.filter(r=>r.branchId===n)}:{success:!0,data:ca.filter(r=>r.id===s[2])}}return{success:!0,data:ca}}if(t.startsWith("/stocks/")&&e==="GET"){const s=decodeURIComponent(t.split("/stocks/")[1]).toLowerCase(),n=gi.filter(r=>r.id.toLowerCase().includes(s)||r.code.toLowerCase().includes(s)||r.name.toLowerCase().includes(s)||r.desen.toLowerCase().includes(s));return n.length>0?{success:!0,data:n[0],results:n}:{success:!1,message:"Stok bulunamadı"}}if(t.startsWith("/serials/")&&e==="GET"){const s=t.split("/"),n=s[2];if(s[3]==="others"){const l=yt.find(p=>p.serialNo===n);if(l){const p=yt.filter(o=>o.stockId===l.stockId&&o.serialNo!==n),c=p.reduce((o,m)=>o+m.quantity,0);return{success:!0,data:{items:p,totalCount:p.length,totalQuantity:Math.round(c*100)/100}}}return{success:!0,data:{items:[],totalCount:0,totalQuantity:0}}}const r=yt.find(l=>l.serialNo===n);if(r)return{success:!0,data:r};const d=yt.filter(l=>l.serialNo.includes(n));return d.length>0?{success:!0,data:d[0],results:d}:{success:!1,message:"Seri numarası bulunamadı"}}if(t==="/transfers"&&e==="POST")return{success:!0,data:{transferId:"TRF-"+Date.now(),processId:3,status:"completed",barcodeCount:((i=a.barcodes)==null?void 0:i.length)||0},message:"Transfer işlemi başarıyla tamamlandı"};if(t==="/sales"&&e==="POST")return{success:!0,data:{saleId:"SL-"+Date.now(),status:"completed"},message:"Satış işlemi başarıyla kaydedildi"};if(t==="/sales/types"&&e==="GET")return{success:!0,data:["toptan","perakende","ihracat","b2b","iade"]};if(t==="/purchases"&&e==="POST")return{success:!0,data:{purchaseId:"PR-"+Date.now(),status:"completed"},message:"Alış işlemi başarıyla kaydedildi"};if(t==="/stock-count"&&e==="POST")return{success:!0,data:{countId:"SC-"+Date.now(),status:"completed"},message:"Sayım verisi başarıyla kaydedildi"};if(t==="/reports/customer-balance"&&e==="GET")return{success:!0,data:yi};if(t==="/reports/cash-balance"&&e==="GET")return{success:!0,data:Wa};if(t==="/copilot/chat"&&e==="POST"){const s=(a.message||"").toLowerCase().trim();let n="";if(s.includes("merhaba")||s.includes("selam"))n="Merhaba! Size nasıl yardımcı olabilirim?";else if(s.includes("kasa")&&s.includes("dolar")){const r=Wa.filter(l=>l.currency==="USD");let d="<table><tr><th>Kasa Adı</th><th>Bakiye (USD)</th></tr>";r.forEach(l=>{d+=`<tr><td>${l.name}</td><td>$${l.balance.toLocaleString("tr-TR")}</td></tr>`}),d+="</table>",n=`Kasa dolar bakiyeniz aşağıdaki gibidir:
${d}
Başka bir konuda yardımcı olabilir miyim?`}else if(s.includes("fa1827")||s.includes("fa 1827")){const r=yt.filter(c=>c.stockId==="fa1827"),d=r.reduce((c,o)=>c+o.quantity,0),l=Math.max(...r.map(c=>c.quantity));let p="<table><tr><th>Seri No</th><th>Depo Kod</th><th>Bakiye (metre)</th></tr>";r.forEach(c=>{p+=`<tr><td>${c.serialNo}</td><td>${c.warehouseId}</td><td>${c.quantity}</td></tr>`}),p+="</table>",n=`Fa1827/33 deseni için depo bilgileri aşağıdaki gibidir:

- <b>Toplam Miktar:</b> ${d} metre
- <b>En Büyük Seri Miktarı:</b> ${l} metre

Her bir seri için ayrıntılar:
${p}
Başka bir konuda yardımcı olabilir miyim?`}else s.includes("stok")||s.includes("ürün")?n='Hangi stok kodu veya desen hakkında bilgi almak istersiniz? Örneğin: "JN1016 stok bilgisi" veya "FA1827/33 deseni hangi depoda?"':s.includes("satış")||s.includes("satılan")?n="Bugün satılan mallarla ilgili bilgi almak için sistemdeki satış raporlarına bakmam gerekiyor. Ancak şu anda bu bilgiye doğrudan erişimim yok. Lütfen satış raporlarınızı kontrol edin veya sistem yöneticinizle iletişime geçin. Başka bir konuda yardımcı olabilir miyim?":n=`Bu konuda size yardımcı olmak isterdim. Şu konularda sorularınızı yanıtlayabilirim:

• Stok ve seri sorgulama
• Kasa bakiye bilgileri
• Desen bazlı depo bilgileri

Nasıl yardımcı olabilirim?`;return{success:!0,data:{message:n,timestamp:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}}}if(t==="/suppliers"&&e==="GET")return{success:!0,data:Ee};if(t.startsWith("/suppliers/")&&e==="GET"){const s=t.split("/suppliers/")[1],n=Ee.find(r=>r.id===s);return n?{success:!0,data:n}:{success:!1,message:"Tedarikçi bulunamadı"}}if(t==="/suppliers"&&e==="POST"){const s={...a,id:"SUP"+String(Ee.length+1).padStart(3,"0"),code:"TED-"+String(Ee.length+1).padStart(3,"0"),totalOrders:0,totalAmount:0,createdAt:new Date().toISOString().slice(0,10)};return Ee.push(s),{success:!0,data:s,message:"Tedarikçi eklendi"}}if(t.startsWith("/suppliers/")&&e==="PUT"){const s=t.split("/suppliers/")[1],n=Ee.findIndex(r=>r.id===s);return n===-1?{success:!1,message:"Tedarikçi bulunamadı"}:(Ee[n]={...Ee[n],...a},{success:!0,data:Ee[n],message:"Tedarikçi güncellendi"})}if(t.startsWith("/suppliers/")&&e==="DELETE"){const s=t.split("/suppliers/")[1],n=Ee.findIndex(r=>r.id===s);return n===-1?{success:!1,message:"Tedarikçi bulunamadı"}:(Ee[n].status="passive",{success:!0,message:"Tedarikçi pasife alındı"})}if(t==="/purchase-orders"&&e==="GET"){let s=[...oe];return a&&a.status&&(s=s.filter(r=>r.status===a.status)),a&&a.supplierId&&(s=s.filter(r=>r.supplierId===a.supplierId)),{success:!0,data:s.map(r=>({...r,totalNet:Ut(r),totalTax:Sa(r),totalGross:Rt(r)}))}}if(t.startsWith("/purchase-orders/")&&!t.includes("/receive")&&e==="GET"){const s=t.split("/purchase-orders/")[1],n=oe.find(r=>r.id===s);return n?{success:!0,data:{...n,totalNet:Ut(n),totalTax:Sa(n),totalGross:Rt(n)}}:{success:!1,message:"Sipariş bulunamadı"}}if(t==="/purchase-orders"&&e==="POST"){const s=new Date().getFullYear(),n=String(oe.length+1).padStart(3,"0"),r={...a,id:`PO-${s}-${n}`,status:a.status||"draft",createdAt:new Date().toISOString().slice(0,10)};oe.push(r);const d=Ee.find(l=>l.id===r.supplierId);return d&&d.totalOrders++,{success:!0,data:r,message:"Satın alma siparişi oluşturuldu"}}if(t.startsWith("/purchase-orders/")&&e==="PUT"){const s=t.split("/purchase-orders/")[1].split("/")[0],n=oe.findIndex(r=>r.id===s);return n===-1?{success:!1,message:"Sipariş bulunamadı"}:(oe[n]={...oe[n],...a},{success:!0,data:oe[n],message:"Sipariş güncellendi"})}if(t.startsWith("/purchase-orders/")&&t.endsWith("/approve")&&e==="POST"){const s=t.split("/purchase-orders/")[1].replace("/approve",""),n=oe.findIndex(r=>r.id===s);return n===-1?{success:!1,message:"Sipariş bulunamadı"}:["draft","pending"].includes(oe[n].status)?(oe[n].status="approved",oe[n].approvedBy=a.approvedBy||"Kullanıcı",oe[n].approvedAt=new Date().toISOString().slice(0,10),{success:!0,data:oe[n],message:"Sipariş onaylandı"}):{success:!1,message:"Bu sipariş onaylanamaz"}}if(t.startsWith("/purchase-orders/")&&t.endsWith("/cancel")&&e==="POST"){const s=t.split("/purchase-orders/")[1].replace("/cancel",""),n=oe.findIndex(r=>r.id===s);return n===-1?{success:!1,message:"Sipariş bulunamadı"}:["received","cancelled"].includes(oe[n].status)?{success:!1,message:"Bu sipariş iptal edilemez"}:(oe[n].status="cancelled",oe[n].cancelReason=a.reason||"",{success:!0,data:oe[n],message:"Sipariş iptal edildi"})}if(t.startsWith("/purchase-orders/")&&t.endsWith("/receive")&&e==="POST"){const s=t.split("/purchase-orders/")[1].replace("/receive",""),n=oe.findIndex(c=>c.id===s);if(n===-1)return{success:!1,message:"Sipariş bulunamadı"};const r=oe[n];if(!["approved","ordered","partial"].includes(r.status))return{success:!1,message:"Bu sipariş için mal kabul yapılamaz"};(a.receivedLines||[]).forEach(c=>{const o=r.lines.find(m=>m.id===c.lineId);o&&(o.receivedQty=Math.min((o.receivedQty||0)+c.qty,o.qty))}),r.invoiceNo=a.invoiceNo||r.invoiceNo,r.receiptDate=new Date().toISOString().slice(0,10);const l=r.lines.every(c=>c.receivedQty>=c.qty);r.status=l?"received":"partial";const p=Ee.find(c=>c.id===r.supplierId);return p&&(p.totalAmount+=Ut(r)),{success:!0,data:r,message:l?"Tüm kalemler teslim alındı":"Kısmi teslim kaydedildi"}}if(t==="/purchase-reports/summary"&&e==="GET"){const s=oe.length,n={};Object.keys(ki).forEach(l=>{n[l]=0}),oe.forEach(l=>{n[l.status]=(n[l.status]||0)+1});const r=oe.filter(l=>l.status!=="cancelled").reduce((l,p)=>l+Rt(p),0),d=oe.filter(l=>l.status==="received").reduce((l,p)=>l+Rt(p),0);return{success:!0,data:{total:s,byStatus:n,totalAmount:r,receivedAmount:d}}}return{success:!1,message:"Endpoint bulunamadı: "+t}}const Pt=Object.freeze(Object.defineProperty({__proto__:null,mockApiHandler:$s},Symbol.toStringTag,{value:"Module"})),Ta=new Set;let Ze=null,kt="online";const Gt=()=>navigator.onLine===!1;function ws(e){return Ta.add(e),()=>Ta.delete(e)}function wi(){return Ze||(Ze=document.createElement("div"),Ze.className="net-bar",Ze.setAttribute("role","status"),document.body.appendChild(Ze),Ze)}function Oe(e,t=""){if(e===kt&&e!=="server")return;const a=wi();e==="online"?kt!=="online"&&(a.className="net-bar show ok",a.innerHTML='<i class="ph ph-wifi-high"></i> Bağlantı geri geldi',setTimeout(()=>{a.className="net-bar"},2500),Ta.forEach(i=>{try{i()}catch{}})):e==="offline"?(a.className="net-bar show",a.innerHTML='<i class="ph ph-wifi-slash"></i> Çevrimdışısınız — kayıtlar gönderilemez'):e==="server"&&(a.className="net-bar show warn",a.innerHTML=`<i class="ph ph-plugs"></i> Sunucuya ulaşılamıyor${t?` — ${t}`:""}`,clearTimeout(Oe._t),Oe._t=setTimeout(()=>{kt==="server"&&(a.className="net-bar",kt="online")},6e3)),kt=e}function xi(){window.addEventListener("offline",()=>Oe("offline")),window.addEventListener("online",()=>Oe("online")),Gt()&&Oe("offline")}class Si{constructor(){this.baseUrl=this._getBaseUrl(),this.timeout=z.apiTimeout}_getBaseUrl(){return localStorage.getItem(z.storageKeys.apiUrl)||z.erpApiUrl||""}resetBaseUrl(){localStorage.removeItem(z.storageKeys.apiUrl),this.baseUrl=z.erpApiUrl||""}setBaseUrl(t){this.baseUrl=t,localStorage.setItem(z.storageKeys.apiUrl,t)}getBaseUrl(){return this.baseUrl}_getHeaders(){const t={"Content-Type":"application/json"};document.documentElement.classList.contains("in-preview")&&(t["X-Preview-Tenant"]=z.slug),this.tenantId&&(t["X-Tenant-Id"]=this.tenantId);const a=localStorage.getItem(z.storageKeys.token);return a&&(t.Authorization=`Bearer ${a}`),t}async request(t,a,i=null,s=0){if(z.useMockApi&&!z.erpApiUrl)return $s(t,a,i);if(Gt()&&t!=="GET")throw new Error("Çevrimdışısınız. Bağlantı gelince tekrar deneyin.");const n=`${this.baseUrl}${a}`,r={method:t,headers:this._getHeaders()};i&&(t==="POST"||t==="PUT"||t==="PATCH")&&(r.body=JSON.stringify(i));try{const d=new AbortController,l=setTimeout(()=>d.abort(),this.timeout);r.signal=d.signal;const p=await fetch(n,r);if(clearTimeout(l),p.status===401&&a!=="/auth/login")throw ze.update({user:null,isAuthenticated:!1}),localStorage.removeItem(z.storageKeys.token),localStorage.removeItem(z.storageKeys.user),window.location.hash="#/login",new Error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");if(!p.ok){const c=await p.json().catch(()=>({}));throw p.status>=500&&Oe("server",`sunucu hatası (${p.status})`),(/^\/(stock-adjust|activity|notifications|finance)/.test(a)||t==="DELETE"&&/^\/products\//.test(a))&&(p.status===404||p.status===403&&(!c.message||c.message==="Bu işlem için yetkiniz yok."))?new Error("Sunucudaki backend dosyaları eski görünüyor (yeni özellik bulunamadı). Backend zip’inin TÜM dosyalarını (server.js, jobTracking.js, activity.js, copilot.js …) uygulama klasörüne yükleyip Node uygulamasını Yeniden Başlatın."):new Error(c.message||(p.status===403?"Bu işlem için yetkiniz yok.":p.status===404?"İstenen kayıt bulunamadı.":`Sunucu hatası (${p.status})`))}return p.status!==204&&Oe("online"),await p.json()}catch(d){const l=d.name==="AbortError",p=l||d instanceof TypeError||/Failed to fetch|NetworkError|Load failed/i.test(d.message||"");if(p&&t==="GET"&&s===0&&!Gt())return await new Promise(c=>setTimeout(c,900)),this.request(t,a,i,1);throw p?Gt()?(Oe("offline"),new Error("Çevrimdışısınız. Bağlantınızı kontrol edin.")):(Oe("server",l?"yanıt gecikti":""),new Error(l?"Sunucu yanıt vermedi (zaman aşımı). Bağlantıyı kontrol edip tekrar deneyin.":"Sunucuya ulaşılamıyor. Adresi ve bağlantınızı kontrol edin.")):d}}get(t){return this.request("GET",t)}post(t,a){return this.request("POST",t,a)}put(t,a){return this.request("PUT",t,a)}delete(t){return this.request("DELETE",t)}async getRawMaterials(){if(z.useMockApi&&!z.erpApiUrl){const{mockApi:t}=await Ve(async()=>{const{mockApi:a}=await Promise.resolve().then(()=>Pt);return{mockApi:a}},void 0,import.meta.url);return t.getRawMaterials()}return this.get("/raw-materials")}async getRecipes(){if(z.useMockApi&&!z.erpApiUrl){const{mockApi:t}=await Ve(async()=>{const{mockApi:a}=await Promise.resolve().then(()=>Pt);return{mockApi:a}},void 0,import.meta.url);return t.getRecipes()}return this.get("/recipes")}async produceItem(t,a){if(z.useMockApi&&!z.erpApiUrl){const{mockApi:i}=await Ve(async()=>{const{mockApi:s}=await Promise.resolve().then(()=>Pt);return{mockApi:s}},void 0,import.meta.url);return i.produceItem(t,a)}return this.post("/production",{productId:t,quantity:a})}async getBranches(){return this.get("/branches")}async getWarehouses(){return this.get("/warehouses")}async getCustomers(){return this.get("/customers")}async makeSale(t,a,i,s,n,r,d,l){return this.post("/sales",{customerId:t,warehouseId:a,productId:i,quantity:s,type:n,...r?{orderId:r,lineId:d}:{},...l?{note:l}:{}})}async getProducts(){return this.get("/products")}async addPurchase(t,a,i,s){return this.post("/purchase",{barcode:t,name:a,quantity:i,warehouseId:s})}async login(t,a){if(z.useMockApi&&!z.erpApiUrl){const{mockApi:i}=await Ve(async()=>{const{mockApi:s}=await Promise.resolve().then(()=>Pt);return{mockApi:s}},void 0,import.meta.url);return i.login(t,a)}return this.post("/auth/login",{username:t,password:a})}}const C=new Si,ke={async login(e,t){try{const a=await C.post("/auth/login",{username:e,password:t});if(a.success){const{token:i,user:s}=a.data;return localStorage.setItem(z.storageKeys.token,i),localStorage.setItem(z.storageKeys.user,JSON.stringify(s)),ze.update({user:s,isAuthenticated:!0}),{success:!0,user:s}}return{success:!1,message:a.message||"Giriş başarısız"}}catch(a){return{success:!1,message:a.message||"Bağlantı hatası"}}},async logout(){try{await C.post("/auth/logout")}catch{}localStorage.removeItem(z.storageKeys.token),localStorage.removeItem(z.storageKeys.user),ze.reset(),W.navigate("login")},checkSession(){const e=localStorage.getItem(z.storageKeys.token),t=localStorage.getItem(z.storageKeys.user);if(e&&t)try{const a=JSON.parse(t);return ze.update({user:a,isAuthenticated:!0}),!0}catch{return this.logout(),!1}return!1},getUser(){return ze.get("user")},isLoggedIn(){return ze.get("isAuthenticated")},getUserInitial(){const e=ze.get("user");return e&&e.name?e.name.charAt(0).toUpperCase():"K"}};function da(e,t){let a=document.querySelector(`meta[name="${e}"]`);a||(a=document.createElement("meta"),a.name=e,document.head.appendChild(a)),a.content=t}function Ti(e){let t=document.querySelector('link[rel="icon"]');t||(t=document.createElement("link"),t.rel="icon",document.head.appendChild(t)),t.href=e}function xs(e){const t=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(e||"");if(!t)return null;const[a,i,s]=t.slice(1).map(n=>parseInt(n,16)/255).map(n=>n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4));return .2126*a+.7152*i+.0722*s}function Li(e){const t=xs(e);return t==null?"#fff":t>.5?"#1A1D26":"#fff"}function Ei(e){const t=xs(e.secondary);return t!=null&&t<.55?e.secondaryDark||e.secondary:e.primaryLight||e.primary}function Ss(){const e=z.theme,t=document.documentElement.style,a={"--primary":e.primary,"--primary-light":e.primaryLight,"--primary-dark":e.primaryDark,"--secondary":e.secondary,"--secondary-light":e.secondaryLight,"--secondary-dark":e.secondaryDark,"--accent":e.secondary,"--accent-light":e.secondaryLight,"--surface-dark":e.surface};Object.entries(a).forEach(([s,n])=>n&&t.setProperty(s,n)),t.setProperty("--on-primary",Li(e.primary)),t.setProperty("--accent-2",Ei(e));const i=["transfer","vehicle","sales","purchase","stock","reports","help","copilot"];if(e.brandAccents){const s=[e.primary,e.primaryDark||e.primary,e.primaryLight||e.primary];i.forEach((n,r)=>{const d=s[r%s.length];t.setProperty(`--color-${n}`,d),t.setProperty(`--color-${n}-light`,`color-mix(in srgb, ${d} 10%, #fff)`)}),t.setProperty("--color-settings","#5B6474"),t.setProperty("--color-stock-detail-header",e.primary),t.setProperty("--color-serial-header",e.primaryDark||e.primary),document.body.classList.add("brand-accents")}else i.concat(["settings","stock-detail-header","serial-header"]).forEach(s=>{t.removeProperty(`--color-${s}`),t.removeProperty(`--color-${s}-light`)}),document.body.classList.remove("brand-accents");t.setProperty("--logo-zoom",String(z.logoZoom/100)),t.setProperty("--logo-x",`${z.logoOffsetX}%`),t.setProperty("--logo-y",`${z.logoOffsetY}%`),document.title=z.appName,da("theme-color",e.surface||e.primary),da("description",z.appDescription),da("apple-mobile-web-app-title",z.shortName),Ti(z.logoUrl)}async function Ai(){let e={};try{const t=await fetch("./tenant.json",{cache:"no-store"});t.ok?e=await t.json():console.warn("tenant.json bulunamadı, varsayılan ayarlar kullanılıyor.")}catch(t){console.warn("tenant.json okunamadı, varsayılan ayarlar kullanılıyor.",t)}return ys(e),Ss(),z}function ji({onUpdate:e,onNavigate:t}){window.parent!==window&&(document.documentElement.classList.add("in-preview"),window.addEventListener("message",a=>{a.origin!==window.location.origin||!a.data||typeof a.data!="object"||(a.data.type==="tenant-preview"?(ys(a.data.tenant||{}),Ss(),e==null||e()):a.data.type==="preview-navigate"&&(t==null||t(a.data.route)))}),window.parent.postMessage({type:"preview-ready"},window.location.origin))}function pa(e,{maskable:t=!1}={}){return new Promise(a=>{var l,p;const i=document.createElement("canvas");i.width=i.height=e;const s=i.getContext("2d"),n=((l=z.theme)==null?void 0:l.surface)||((p=z.theme)==null?void 0:p.primary)||"#0F2240";if(s.fillStyle=n,t)s.fillRect(0,0,e,e);else{const c=e*.22;s.beginPath(),s.roundRect?s.roundRect(0,0,e,e,c):s.rect(0,0,e,e),s.fill()}const r=()=>a(i.toDataURL("image/png")),d=new Image;d.crossOrigin="anonymous",d.onload=()=>{const c=t?e*.22:e*.16,o=e-c*2,m=Math.min(o/d.width,o/d.height),h=d.width*m,b=d.height*m;s.drawImage(d,(e-h)/2,(e-b)/2,h,b),r()},d.onerror=()=>{s.fillStyle="#fff",s.font=`700 ${e*.45}px Inter, system-ui, sans-serif`,s.textAlign="center",s.textBaseline="middle",s.fillText((z.companyName||"?").trim().charAt(0).toLocaleUpperCase("tr"),e/2,e/2+e*.02),r()},d.src=z.logoUrl})}async function Mi(){var d,l,p;const[e,t,a]=await Promise.all([pa(192),pa(512),pa(512,{maskable:!0})]),i={name:z.appName,short_name:z.shortName||z.appName,description:z.appDescription,start_url:"./",scope:"./",display:"standalone",orientation:"portrait",background_color:((d=z.theme)==null?void 0:d.surface)||"#0F2240",theme_color:((l=z.theme)==null?void 0:l.surface)||((p=z.theme)==null?void 0:p.primary)||"#0F2240",lang:"tr",icons:[{src:e,sizes:"192x192",type:"image/png",purpose:"any"},{src:t,sizes:"512x512",type:"image/png",purpose:"any"},{src:a,sizes:"512x512",type:"image/png",purpose:"maskable"}]},s=URL.createObjectURL(new Blob([JSON.stringify(i)],{type:"application/manifest+json"}));let n=document.querySelector('link[rel="manifest"]');n||(n=document.createElement("link"),n.rel="manifest",document.head.appendChild(n)),n.href=s;let r=document.querySelector('link[rel="apple-touch-icon"]');r||(r=document.createElement("link"),r.rel="apple-touch-icon",document.head.appendChild(r)),r.href=e}let at=null;const qi=()=>!!at;async function Ni(){if(!at)return!1;at.prompt();const{outcome:e}=await at.userChoice;return at=null,window.dispatchEvent(new CustomEvent("pwa-install-state")),e==="accepted"}function Ci(){Mi().catch(()=>{}),window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),at=t,window.dispatchEvent(new CustomEvent("pwa-install-state"))}),window.addEventListener("appinstalled",()=>{at=null,window.dispatchEvent(new CustomEvent("pwa-install-state"))});const e=window.parent!==window;"serviceWorker"in navigator&&!e&&localStorage.getItem("sw_off")!=="1"?window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})}):"serviceWorker"in navigator&&navigator.serviceWorker.getRegistrations().then(t=>t.forEach(a=>a.unregister()))}let Ii=0;function R(e,t="info",a=3e3){const i=document.getElementById("toast-container");if(!i)return;const s=`toast-${++Ii}`,n={success:'<i class="ph-bold ph-check"></i>',error:'<i class="ph-bold ph-x"></i>',warning:'<i class="ph-bold ph-warning"></i>',info:'<i class="ph-bold ph-info"></i>'},r=document.createElement("div");r.className=`toast ${t}`,r.id=s,r.innerHTML=`
    <div class="toast-icon">${n[t]||n.info}</div>
    <div class="toast-message"></div>
  `,r.querySelector(".toast-message").textContent=String(e??""),i.appendChild(r),setTimeout(()=>{r.classList.add("toast-exit"),setTimeout(()=>{r.remove()},250)},a)}const u=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function Di(){const e=document.createElement("div");e.className="page-login page-container";const t=C.getBaseUrl();return e.innerHTML=`
    <div class="login-logo-area">
      <div class="login-logo" style="background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; width: 110px; height: 110px; border-radius: 50%; padding: 15px;">
        <img src="${z.logoUrl}" alt="${z.companyName} Logo" style="width: 100%; height: 100%; object-fit: contain;" />
      </div>
      <h1 class="login-app-name">${z.appName}</h1>
      <p class="login-app-desc">${z.appDescription}</p>
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
            <input type="url" id="api-url-input" placeholder="http://sunucu:port" value="${u(t)}" />
          </div>
        </div>
        <button class="btn btn-outline btn-block" id="save-api-url" style="margin-top: 12px;">
          <i class="ph ph-floppy-disk"></i> Sunucu Adresini Kaydet
        </button>
      </div>
    </div>
  `,setTimeout(()=>{const a=e.querySelector("#toggle-password"),i=e.querySelector("#login-password");a&&i&&a.addEventListener("click",()=>{i.type=i.type==="password"?"text":"password",a.innerHTML=i.type==="password"?'<i class="ph ph-eye"></i>':'<i class="ph ph-eye-closed"></i>'});const s=e.querySelector("#server-toggle"),n=e.querySelector("#server-panel"),r=e.querySelector("#server-toggle-arrow");s&&n&&s.addEventListener("click",()=>{n.classList.toggle("open"),r&&(r.innerHTML=n.classList.contains("open")?'<i class="ph ph-caret-up"></i>':'<i class="ph ph-caret-down"></i>')});const d=e.querySelector("#save-api-url");d&&d.addEventListener("click",()=>{const o=e.querySelector("#api-url-input");o&&o.value.trim()?(C.setBaseUrl(o.value.trim()),R("Sunucu adresi kaydedildi","success")):o&&(C.resetBaseUrl(),o.value=C.getBaseUrl(),R("Varsayılan sunucu adresine dönüldü","success"))});const l=e.querySelector("#login-btn"),p=e.querySelector("#login-username");async function c(){var b,v;const o=(b=p==null?void 0:p.value)==null?void 0:b.trim(),m=(v=i==null?void 0:i.value)==null?void 0:v.trim();if(!o||!m){R("Kullanıcı adı ve şifre gerekli","warning");return}l.disabled=!0,l.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';const h=await ke.login(o,m);h.success?(R(`Hoş geldiniz, ${h.user.name}!`,"success"),h.user.mustChangePassword&&setTimeout(()=>R(`Varsayılan şifre kullanılıyor. ${z.passwordHint||"Ayarlar > Şifre Değiştir bölümünden"} güncelleyin.`,"warning",8e3),600),W.navigate("dashboard")):(R(h.message,"error"),l.disabled=!1,l.textContent="Giriş Yap")}l&&l.addEventListener("click",c),i&&i.addEventListener("keydown",o=>{o.key==="Enter"&&c()}),p&&p.addEventListener("keydown",o=>{o.key==="Enter"&&(i==null||i.focus())})},0),e}const Ri={finance:"fin.view"};function At(e){const t=Ri[e];if(!t)return!0;try{const a=JSON.parse(localStorage.getItem(z.storageKeys.user)||"null");return!a||!Array.isArray(a.permissions)?!0:a.role==="admin"||a.permissions.includes(t)}catch{return!0}}const Pi=e=>String(e||"").toLocaleLowerCase("tr").replace(/İ/g,"i"),La=e=>Pi(e).replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c"),Bi=[["overview","Genel Bakış","ph-squares-four","özet durum panel"],["projects","Projeler","ph-folders","proje sorumlu"],["orders","Siparişler","ph-clipboard-text","sipariş miktar giden sevk"],["jobs","İşler","ph-list-checks","iş emri süreç aşama durum"],["performance","Performans","ph-chart-line-up","kişi performans zamanında tamamlama"],["alerts","Uyarılar","ph-bell-ringing","gecikme uyarı"],["team","Ekip & Yetki","ph-users-three","kullanıcı rol yetki personel"]];function Hi(){const e=z.modules,t=s=>{var n;return((n=e[s])==null?void 0:n.enabled)&&At(s)},a=[],i=(s,n,r,d,l="",p="Modüller")=>a.push({label:s,hint:n,icon:r,route:d,group:p,hay:La(`${s} ${n} ${l}`)});return Object.entries(e).filter(([s,n])=>n.enabled&&At(s)).map(([,s])=>s).forEach(s=>i(s.label,s.description||"",s.icon,s.route,"","Modüller")),t("sales")&&z.salesTypes.forEach(s=>i(s.label,"Satış türü",s.icon,`sales?type=${encodeURIComponent(s.id)}`,`satis ${s.badge||""}`,"Satış")),t("reports")&&z.reportTypes.forEach(s=>i(s.label,"Rapor",s.icon,s.route,"rapor","Raporlar")),z.reportTypes.some(s=>s.route==="stock-detail")&&(i("Stok Yönetimi","Tüm stoğu görüntüle, artır / azalt, ürün sil","ph-sliders-horizontal","stock-detail?tab=manage","stok artir azalt duzelt ekle ürün sil silme depo miktar sayim düzeltme","Stok"),i("Barkod / Stok sorgula","Ürün, barkod veya depo stoğu ara","ph-barcode","stock-detail","barkod urun kod sorgu ara","Stok")),t("reports")&&z.reportTypes.some(s=>s.route==="activity")&&i("Son İşlemler","Kim, ne zaman, ne yaptı — Excel veya PDF olarak indirilebilir","ph-clock-counter-clockwise","activity","pdf excel islem kayit log hareket gecmis kim ne zaman denetim","Raporlar"),t("barcode")&&(i("Barkod › Kayıtlar","Oluşturulan barkodlar, tekrar yazdır","ph-list-magnifying-glass","barcode?tab=records","barkod dizin gecmis etiket tekrar yazdir","Barkod"),i("Barkod › Yazıcı ayarı","Zebra, TSC, ağ veya USB yazıcı bağlantısı","ph-printer","barcode?tab=printer","yazici etiket zpl tspl ajan bluetooth usb","Barkod")),t("finance")&&[["Finans › Özet","Nakit, alacak, borç, kredi ve vadesi yaklaşanlar","ph-chart-line-up","finance","finans nakit bakiye alacak borc kredi vade ozet"],["Finans › Hesaplar","Kasa ve banka hesapları, gelir / gider / virman","ph-vault","finance?tab=accounts","kasa banka hesap gelir gider virman"],["Finans › Müşteri bakiyeleri ve tahsilat","Cari bakiye, vade yaşlandırma, tahsilat, ekstre","ph-users-three","finance?tab=parties","musteri cari bakiye tahsilat ekstre alacak vade"],["Finans › Tedarikçi borçları ve ödeme","Mal kabulden doğan borçlar ve ödemeler","ph-truck","finance?tab=parties&sub=suppliers","tedarikci borc odeme ekstre cari"],["Finans › Krediler","Kredi taksit planı ve ödemeleri, vade hatırlatma","ph-bank","finance?tab=loans","kredi taksit faiz banka vade hatirlatma"],["Finans › Çek / Senet","Alınan ve verilen çek/senet takibi","ph-note","finance?tab=cheques","cek senet vade tahsil"],["Finans › Hareketler","Tüm finans hareketleri, Excel / PDF","ph-list-checks","finance?tab=ledger","hareket ekstre excel pdf"]].forEach(([s,n,r,d,l])=>i(s,n,r,d,l,"Finans")),t("jobTracking")&&Bi.forEach(([s,n,r,d])=>i(`İş Takip › ${n}`,"İş & Durum Takip",r,`jobs?tab=${s}`,d,"İş Takip")),t("purchase")&&(t("suppliers")||i("Satın Alma › Tedarikçiler","Tedarikçi kartları","ph-handshake","purchase-module?tab=suppliers","tedarikci firma","Satın Alma"),i("Satın Alma › Siparişler (PO)","Satın alma siparişleri","ph-receipt","purchase-module?tab=orders","po siparis mal kabul talep gemi","Satın Alma"),i("Satın Alma › Yeni sipariş","Yeni satın alma siparişi / gemi talebi","ph-plus-circle","purchase-module?tab=orders&new=1","yeni siparis talep","Satın Alma"),i("Satın Alma › Özet","Aylık alım, gemi / kategori / tedarikçi bazlı harcama, gecikenler","ph-chart-bar","purchase-module?tab=summary","ozet harcama rapor geciken","Satın Alma")),t("suppliers")&&i("Tedarikçiler","Tedarikçi kartları, kategori, vade, açık siparişler","ph-buildings","suppliers","tedarikci firma vade kategori","Tedarikçiler"),t("settings")&&(i("Şifre değiştir","Ayarlar","ph-key","settings","sifre parola guvenlik hesap","Ayarlar"),i("Önbelleği temizle","Ayarlar › Sorun Giderme","ph-broom","settings","cache onbellek yenile guncelle","Ayarlar"),i("Uygulamayı yükle","Ayarlar › Ana ekrana ekle","ph-download-simple","settings","pwa kur telefon ana ekran","Ayarlar"),i("Koyu tema","Görünüm","ph-moon","settings","tema karanlik gece","Ayarlar")),a}function zi(e,t=8){const a=La(e).split(/\s+/).filter(Boolean);return a.length?Hi().map(i=>{if(!a.every(r=>i.hay.includes(r)))return null;const s=La(i.label),n=(s.startsWith(a[0])?0:s.includes(a[0])?1:2)+(i.group==="Modüller"?0:.5);return{it:i,score:n}}).filter(Boolean).sort((i,s)=>i.score-s.score).slice(0,t).map(i=>i.it):[]}const Ki=e=>String(e).trim().startsWith("<")?e:`<i class="ph ${u(e)}"></i>`;function Ts(e,{host:t=e.parentElement,onPick:a}={}){t.classList.add("has-search-results");const i=document.createElement("div");i.className="search-results",i.hidden=!0,i.setAttribute("role","listbox"),t.appendChild(i);let s=[],n=0;const r=()=>{i.hidden=!0},d=()=>{var c;i.querySelectorAll(".sr-item").forEach((o,m)=>o.classList.toggle("on",m===n)),(c=i.querySelector(".sr-item.on"))==null||c.scrollIntoView({block:"nearest"})},l=c=>{const o=s[c];o&&(r(),e.value="",e.blur(),a==null||a(o),W.navigate(o.route))},p=()=>{const c=e.value.trim();if(!c)return r();if(s=zi(c,9),n=0,!s.length){i.innerHTML='<div class="sr-empty"><i class="ph ph-magnifying-glass"></i> Sonuç bulunamadı</div>',i.hidden=!1;return}let o="";i.innerHTML=s.map((m,h)=>{const b=m.group!==o?`<div class="sr-group">${u(m.group)}</div>`:"";return o=m.group,`${b}<button type="button" class="sr-item" role="option" data-i="${h}">
        <span class="sr-ico">${Ki(m.icon)}</span>
        <span class="sr-text"><b>${u(m.label)}</b><small>${u(m.hint)}</small></span>
        <i class="ph ph-arrow-elbow-down-left sr-go"></i>
      </button>`}).join(""),i.hidden=!1,d()};e.addEventListener("input",p),e.addEventListener("focus",p),e.addEventListener("keydown",c=>{if(c.key==="Escape"){r(),e.blur();return}i.hidden||!s.length||(c.key==="ArrowDown"?(c.preventDefault(),n=(n+1)%s.length,d()):c.key==="ArrowUp"?(c.preventDefault(),n=(n-1+s.length)%s.length,d()):c.key==="Enter"&&(c.preventDefault(),l(n)))}),i.addEventListener("mousedown",c=>{const o=c.target.closest(".sr-item");o&&(c.preventDefault(),l(Number(o.dataset.i)))}),i.addEventListener("click",c=>{const o=c.target.closest(".sr-item");o&&l(Number(o.dataset.i))}),document.addEventListener("click",c=>{t.contains(c.target)||r()})}const be={items:[],unread:0,seen:null,timer:null,started:!1},Oi=e=>{const t=Math.max(0,(Date.now()-new Date(e).getTime())/1e3);return t<60?"şimdi":t<3600?`${Math.floor(t/60)} dk önce`:t<86400?`${Math.floor(t/3600)} sa önce`:new Date(e).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})},Fi={job_assigned:"ph-user-plus",job_done:"ph-check-circle"};function Ls(){document.querySelectorAll("[data-notif-badge]").forEach(e=>{e.textContent=be.unread>99?"99+":String(be.unread),e.hidden=be.unread===0})}async function tt(){if(!(!ke.isLoggedIn()||document.hidden))try{const e=await C.get("/notifications");if(!e.success)return;const t=e.data.items||[],a=t.reduce((s,n)=>Math.max(s,n.id),0);be.seen===null&&(be.seen=a);const i=t.filter(s=>s.id>be.seen&&!s.readAt);be.seen=Math.max(be.seen,a),be.items=t,be.unread=e.data.unread||0,Ls(),Te&&Ea(),i.slice(0,3).forEach(s=>{if(R(`${s.title}`,"info"),"Notification"in window&&Notification.permission==="granted")try{new Notification(s.title,{body:s.body,icon:void 0,tag:"wms-"+s.id})}catch{}})}catch{}}function _i(){be.started||(be.started=!0,tt(),be.timer=setInterval(tt,3e4),document.addEventListener("visibilitychange",()=>{document.hidden||tt()}),ws(tt),window.addEventListener("storage",()=>tt()))}function Ui(){be.items=[],be.unread=0,be.seen=null,Ls()}let Te=null;async function Za(e){try{await C.post("/notifications/read",e?{id:e}:{})}catch{}await tt()}function Ea(){if(!Te)return;const e="Notification"in window&&Notification.permission==="default";Te.querySelector(".np-body").innerHTML=`
    ${e?'<button type="button" class="np-ask" data-act="ask"><i class="ph ph-bell-ringing"></i> Bildirimleri bu cihazda aç</button>':""}
    ${be.items.length?be.items.map(t=>`
      <button type="button" class="np-item ${t.readAt?"":"unread"}" data-id="${t.id}" data-link="${u(t.link||"")}">
        <span class="np-ico"><i class="ph ${Fi[t.type]||"ph-bell"}"></i></span>
        <span class="np-text"><b>${u(t.title)}</b><small>${u(t.body)}</small><em>${u(Oi(t.createdAt))}</em></span>
      </button>`).join(""):'<div class="np-empty"><i class="ph ph-bell-slash"></i>Henüz bildirim yok</div>'}`,Te.querySelector('[data-act="all"]').hidden=be.unread===0}function Gi(){if(Te)return St();Te=document.createElement("div"),Te.className="np-wrap",Te.innerHTML=`
    <div class="np-bg"></div>
    <div class="np-panel" role="dialog" aria-label="Bildirimler">
      <div class="np-head"><b>Bildirimler</b>
        <button type="button" class="np-link" data-act="all">Tümünü okundu yap</button>
        <button type="button" class="np-x" data-act="close" aria-label="Kapat"><i class="ph ph-x"></i></button></div>
      <div class="np-body"></div>
    </div>`,document.body.appendChild(Te),Ea(),tt(),Te.addEventListener("click",async e=>{var i;if(e.target.classList.contains("np-bg"))return St();const t=(i=e.target.closest("[data-act]"))==null?void 0:i.dataset.act;if(t==="close")return St();if(t==="all")return Za();if(t==="ask")return await Notification.requestPermission(),Ea();const a=e.target.closest(".np-item");if(a){const s=a.dataset.link;await Za(Number(a.dataset.id)),St(),s&&W.navigate(s.split("&job=")[0])}}),document.addEventListener("keydown",Es)}const Es=e=>{e.key==="Escape"&&St()};function St(){document.removeEventListener("keydown",Es),Te==null||Te.remove(),Te=null}function As(){const e=Object.entries(z.modules).filter(([a,i])=>i.enabled&&At(a)),t=["settings","help"];return[...e.filter(([a])=>!t.includes(a)),...e.filter(([a])=>t.includes(a))]}function Yi(e){return z.reportTypes.some(t=>t.route===e)?"reports":e}function Vi(){const e=z.appName||"",t=z.companyName||"",a=t&&e.startsWith(t)?e.slice(t.length).trim():"";return a?`<div class="brand-text"><div class="brand-name brand-name-1">${u(t)}</div><div class="brand-sub">${u(a)}</div></div>`:`<div class="brand-name">${u(e)}</div>`}function Qi({compact:e=!1}={}){return`
    <div class="brand ${e?"brand-compact":""}">
      <div class="brand-logo"><img src="${z.logoUrl}" alt="${u(z.companyName)}" /></div>
      ${Vi()}
    </div>`}function Ji(e,t){const a=document.createElement("div");a.className="shell";const i=Yi(t),s=ke.getUser(),n=As(),r=p=>{var c;return(c=z.modules[p])==null?void 0:c.enabled},d=[{route:"dashboard",icon:"ph-house",label:"Ana Sayfa"},{route:"operations",icon:"ph-squares-four",label:"İşlemler"},r("copilot")&&{route:"copilot",icon:"ph-sparkle",label:z.modules.copilot.baseLabel||"AI CoPilot"},{action:"notif",icon:"ph-bell",label:"Bildirim",badge:!0},r("settings")&&{route:"settings",icon:"ph-user",label:"Profil"}].filter(Boolean);a.innerHTML=`
    <header class="shell-topbar">
      ${Qi()}
      <label class="topbar-search">
        <i class="ph ph-magnifying-glass"></i>
        <input type="search" placeholder="Modül veya menü ara…" data-action="search" />
      </label>
      <button class="icon-btn notif-btn" data-action="notif" title="Bildirimler" aria-label="Bildirimler"><i class="ph ph-bell"></i><b class="notif-badge" data-notif-badge hidden>0</b></button>
      <button class="icon-btn" data-action="theme" title="Tema"><i class="ph ${document.body.classList.contains("dark-theme")?"ph-sun":"ph-moon"}"></i></button>
    </header>

    <aside class="shell-sidebar">
      <nav class="side-nav">
        <a class="side-link ${i==="dashboard"?"active":""}" data-route="dashboard"><i class="ph ph-house"></i><span>Ana Sayfa</span></a>
        ${n.map(([,p])=>`
        <a class="side-link ${i===p.route?"active":""}" data-route="${p.route}" data-label="${u(p.label.toLocaleLowerCase("tr"))}">
          ${p.icon}<span>${u(p.label)}</span>
        </a>`).join("")}
      </nav>
      <div class="side-user">
        <div class="avatar">${u(ke.getUserInitial())}</div>
        <div class="side-user-name">${u((s==null?void 0:s.name)||"Kullanıcı")}</div>
        <button class="icon-btn" data-action="logout" title="Çıkış"><i class="ph ph-sign-out"></i></button>
      </div>
    </aside>

    <main class="shell-content"></main>

    <nav class="shell-tabbar">
      ${d.map(p=>`
      <a class="tab ${p.route&&i===p.route?"active":""}" ${p.route?`data-route="${p.route}"`:`data-action="${p.action}"`}>
        <i class="ph ${p.route&&i===p.route?"ph-fill":""} ${p.icon}"></i>${p.badge?'<b class="notif-badge" data-notif-badge hidden>0</b>':""}<span>${u(p.label)}</span>
      </a>`).join("")}
    </nav>`;const l=a.querySelector(".shell-content");return typeof e=="string"?l.innerHTML=e:e&&l.appendChild(e),a.addEventListener("click",p=>{var m;const c=p.target.closest("[data-route]");if(c&&!c.closest(".shell-content")){p.preventDefault(),W.navigate(c.dataset.route);return}const o=(m=p.target.closest("[data-action]"))==null?void 0:m.dataset.action;if(o==="logout"&&(Ui(),ke.logout()),o==="notif"&&Gi(),o==="theme"){document.body.classList.toggle("dark-theme");const h=document.body.classList.contains("dark-theme");localStorage.setItem(z.storageKeys.theme,h?"dark":"light"),p.target.closest("button").innerHTML=`<i class="ph ${h?"ph-sun":"ph-moon"}"></i>`}}),Ts(a.querySelector('[data-action="search"]'),{host:a.querySelector(".topbar-search")}),_i(),a}const Wi=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],Bt=["var(--primary)","#F0A93B","#22A06B","#0EA5E9","#64748B","#A855F7"],st=e=>e==null?"—":Number(e).toLocaleString("tr-TR");function Zi(e){if(!(e!=null&&e.length)||e.every(o=>!o.value))return'<div class="chart-empty">Henüz hareket kaydı yok</div>';const t=560,a=220,i={l:36,b:24,t:8},s=Math.max(...e.map(o=>o.value)),n=Math.pow(10,Math.floor(Math.log10(s||1))),r=Math.max(Math.ceil(s/n)*n,4),d=(t-i.l)/e.length,l=o=>a-i.b-o/r*(a-i.b-i.t),p=[0,.25,.5,.75,1].map(o=>`
    <line x1="${i.l}" x2="${t}" y1="${l(r*o)}" y2="${l(r*o)}" class="grid" />
    <text x="${i.l-6}" y="${l(r*o)+4}" text-anchor="end" class="axis">${st(Math.round(r*o))}</text>`).join(""),c=e.map((o,m)=>{const h=i.l+m*d+d*.2,b=a-i.b-l(o.value),v=Wi[Number(o.month.slice(5,7))-1];return`<rect x="${h}" y="${l(o.value)}" width="${d*.6}" height="${Math.max(b,0)}" rx="3" class="bar"><title>${v}: ${st(o.value)}</title></rect>
      <text x="${h+d*.3}" y="${a-6}" text-anchor="middle" class="axis">${v}</text>`}).join("");return`<svg viewBox="0 0 ${t} ${a}" class="chart-svg" role="img" aria-label="Aylık stok hareketleri">${p}${c}</svg>`}function Xi(e){const t=(e||[]).reduce((d,l)=>d+l.value,0);if(!t)return'<div class="chart-empty">Henüz depo hareketi yok</div>';const a=60,i=2*Math.PI*a;let s=0;const n=e.map((d,l)=>{const p=d.value/t*i,c=`<circle r="${a}" cx="80" cy="80" fill="none" stroke="${Bt[l%Bt.length]}" stroke-width="26"
      stroke-dasharray="${p} ${i-p}" stroke-dashoffset="${-s}" transform="rotate(-90 80 80)"><title>${u(d.name)}: ${st(d.value)}</title></circle>`;return s+=p,c}).join(""),r=e.map((d,l)=>`
    <li><span class="dot" style="background:${Bt[l%Bt.length]}"></span>${u(d.name)}<b>%${Math.round(d.value/t*100)}</b></li>`).join("");return`<div class="donut-wrap"><svg viewBox="0 0 160 160" class="donut">${n}</svg><ul class="legend">${r}</ul></div>`}function en(){const e=new Date().getHours();return e<6?"İyi geceler":e<12?"Günaydın":e<18?"İyi günler":"İyi akşamlar"}function tn(){var n;const e=document.createElement("div");e.className="page-dashboard dash";const t=As().filter(([r])=>!["settings","help","copilot"].includes(r)),a=z.modules.copilot,[i,...s]=z.appName.split(" ");return e.innerHTML=`
    <div class="dash-mhead">
      <div class="brand">
        <div class="brand-logo"><img src="${z.logoUrl}" alt="${u(z.companyName)}" /></div>
        <div class="brand-name">${u(i)}${s.length?`<br>${u(s.join(" "))}`:""}</div>
      </div>
      <button class="bell" id="bell-btn" title="Kritik stoklar"><i class="ph ph-bell"></i><span class="bell-badge" hidden></span></button>
    </div>
    <div class="bell-pop" id="bell-pop" hidden></div>

    <section class="dash-overview">
      <h2 class="dash-h">Genel Bakış</h2>
      <div class="dash-hero">
        <div><h2>${en()}, ${u((((n=ke.getUser())==null?void 0:n.name)||"Kullanıcı").split(" ")[0])}</h2><p>${u(z.companyName)} ${u(z.terms.depotOf)} bugünkü durumu</p></div>
        <span class="dash-hero-chip"><i class="ph ph-calendar-blank"></i>${new Date().toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})}</span>
      </div>
      <div class="kpis">
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Toplam Stok</div><span class="kpi-ico"><i class="ph ph-package"></i></span></div><div class="kpi-value" data-kpi="totalStock">—</div><div class="kpi-sub" data-kpi-sub="productCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü ${u(z.terms.sale)}</div><span class="kpi-ico"><i class="ph ${u(z.terms.saleIcon)}"></i></span></div><div class="kpi-value" data-kpi="todaySales">—</div><div class="kpi-sub" data-kpi-sub="salesCount"></div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Bugünkü Transfer</div><span class="kpi-ico"><i class="ph ph-arrows-left-right"></i></span></div><div class="kpi-value" data-kpi="todayTransfers">—</div><div class="kpi-sub">${u(z.terms.warehouses)}</div></div>
        <div class="kpi"><div class="kpi-head"><div class="kpi-label">Kritik Stok</div><span class="kpi-ico"><i class="ph ph-warning"></i></span></div><div class="kpi-value" data-kpi="lowStockCount">—</div><div class="kpi-sub warn">10 adet ve altı</div></div>
      </div>
      <div class="charts">
        <div class="panel"><h3>Stok Hareketleri</h3><div id="bar-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
        <div class="panel"><h3>Depo Dağılımı</h3><div id="donut-chart"><div class="chart-empty">Yükleniyor…</div></div></div>
      </div>
      <h2 class="dash-h">Hızlı İşlemler</h2>
    </section>

    <div class="tiles">
      ${t.map(([r,d])=>`
        <a class="tile" data-route="${d.route}" id="mod-${r}">
          <span class="tile-icon">${d.icon}</span>
          <span class="tile-label">${u(d.label)}</span>
        </a>`).join("")}
    </div>

    ${a!=null&&a.enabled?`
    <a class="copilot-banner" data-route="${a.route}">
      <span class="cb-icon">${a.icon}</span>
      <span class="cb-text"><b>${u(a.label)}</b><small>Depo verilerinizle konuşun</small></span>
      <i class="ph ph-caret-right"></i>
    </a>`:""}
  `,e.addEventListener("click",r=>{const d=r.target.closest("[data-route]");if(d)return W.navigate(d.dataset.route);if(r.target.closest("#bell-btn")){const l=e.querySelector("#bell-pop");l.hidden=!l.hidden}}),an(e),e}async function an(e){var p,c,o,m;let t=null;try{const h=await C.get("/dashboard/stats");t=(h==null?void 0:h.data)||null}catch(h){console.warn("Panel istatistikleri alınamadı:",h.message)}e.querySelectorAll("[data-kpi]").forEach(h=>{h.textContent=st(t==null?void 0:t[h.dataset.kpi])});const a={productCount:h=>`${st(h)} ürün çeşidi`,salesCount:h=>`toplam ${st(h)} ${z.terms.sales}`};e.querySelectorAll("[data-kpi-sub]").forEach(h=>{const b=t==null?void 0:t[h.dataset.kpiSub];h.textContent=b==null?"":a[h.dataset.kpiSub](b)}),e.querySelector("#bar-chart").innerHTML=t?Zi(t.monthly):'<div class="chart-empty">Veri alınamadı</div>',e.querySelector("#donut-chart").innerHTML=t?Xi(t.warehouseDist):'<div class="chart-empty">Veri alınamadı</div>';const i=(t==null?void 0:t.lowStock)||[];let s=[];if((p=z.modules.jobTracking)!=null&&p.enabled)try{const h=(c=await C.get("/jt/alerts"))==null?void 0:c.data;s=((h==null?void 0:h.alerts)||[]).filter(b=>b.severity!=="info").slice(0,5),s.total=(((o=h==null?void 0:h.counts)==null?void 0:o.critical)||0)+(((m=h==null?void 0:h.counts)==null?void 0:m.warning)||0)}catch{}const n=e.querySelector(".bell-badge"),r=localStorage.getItem(z.storageKeys.notify)!=="off";r||(e.querySelector("#bell-btn").title="Bildirimler kapalı (Ayarlar'dan açabilirsiniz)");const d=((t==null?void 0:t.lowStockCount)||0)+(s.total||0);r&&d&&(n.hidden=!1,n.textContent=d>9?"9+":d);const l=s.length?`<h4>İş takip uyarıları</h4><ul>${s.map(h=>`<li><span>${u(h.title)}</span></li>`).join("")}</ul><a class="bell-link" data-route="${z.modules.jobTracking.route}">Tümünü gör</a>`:"";e.querySelector("#bell-pop").innerHTML=r?l||i.length?`${l}${i.length?`<h4>Kritik stoklar</h4><ul>${i.map(h=>`<li><span>${u(h.name)}</span><b>${st(h.stock)} ${u(h.unit||"")}</b></li>`).join("")}</ul>`:""}`:"<h4>Bildirim yok</h4><p>Kritik seviyede ürün bulunmuyor.</p>":"<h4>Bildirimler kapalı</h4><p>Ayarlar sayfasından açabilirsiniz.</p>"}function ce({title:e,gradientClass:t="gradient-primary",showBack:a=!0,actions:i=[]}){const s=document.createElement("header");s.className=`app-header ${t}`;let n="";return i.length>0&&(n=`<div class="header-actions">
      ${i.map((r,d)=>`<button class="header-action-btn" id="header-action-${d}" title="${r.title||""}">${r.icon}</button>`).join("")}
    </div>`),s.innerHTML=`
    <div class="app-header-inner">
      ${a?'<button class="header-back" id="header-back-btn"><i class="ph ph-arrow-left"></i></button>':"<div></div>"}
      <h1 class="header-title">${e}</h1>
      ${n||"<div></div>"}
    </div>
  `,setTimeout(()=>{const r=s.querySelector("#header-back-btn");r&&r.addEventListener("click",()=>W.back()),i.forEach((d,l)=>{const p=s.querySelector(`#header-action-${l}`);p&&d.onClick&&p.addEventListener("click",d.onClick)})},0),s}let $t=null;function vt(e,t){if($t){try{$t()}catch{}$t=null}const a=document.getElementById("modal-container");if(!a)return console.error("modal-container bulunamadı"),()=>{};a.classList.add("active"),a.innerHTML=`
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
  `;let i=null,s=null,n=!1;function r(){if(n)return;if(n=!0,$t=null,s){try{s.stop()}catch{}s=null}const l=document.getElementById("scanner-video");l&&l.srcObject&&(l.srcObject.getTracks().forEach(p=>p.stop()),l.srcObject=null),a.classList.remove("active"),a.innerHTML=""}$t=r,setTimeout(()=>{var o,m;(o=document.getElementById("scanner-close-btn"))==null||o.addEventListener("click",r),(m=document.getElementById("scanner-backdrop"))==null||m.addEventListener("click",r);const l=document.getElementById("scanner-manual-input"),p=document.getElementById("scanner-manual-btn");function c(){var b;const h=(b=l==null?void 0:l.value)==null?void 0:b.trim();h&&(r(),e(h))}p==null||p.addEventListener("click",c),l==null||l.addEventListener("keydown",h=>{h.key==="Enter"&&c()}),l==null||l.addEventListener("focus",()=>{l.style.borderColor="#4ECDC4"}),l==null||l.addEventListener("blur",()=>{l.style.borderColor="#E5E7EB"}),d()},50);async function d(){const l=document.getElementById("scanner-video"),p=document.getElementById("scanner-loading");if(!l)return;let c;try{c=await Ve(()=>import("./index-qJOHp8th.js"),[],import.meta.url)}catch{p&&(p.innerHTML='<i class="ph ph-warning"></i> Barkod okuyucu yüklenemedi.<br>Manuel barkod girişi kullanın.');return}try{i=new c.BrowserMultiFormatReader;const o=(m,h)=>{if(!n&&m){const b=m.getText();b&&b.length>0&&(navigator.vibrate&&navigator.vibrate(100),r(),e(b))}};try{s=await i.decodeFromConstraints({audio:!1,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}},l,o)}catch(m){console.warn("Rear camera failed, trying any camera:",m.message);try{s=await i.decodeFromConstraints({audio:!1,video:!0},l,o)}catch(h){console.error("All cameras failed:",h.message),p&&(p.innerHTML='<i class="ph ph-warning"></i> Kamera açılamadı.<br>Manuel barkod girişi kullanın.');return}}p&&(p.style.display="none")}catch(o){console.error("ZXing init error:",o),p&&(p.innerHTML='<i class="ph ph-warning"></i> Tarayıcı başlatılamadı.<br>Manuel giriş kullanın.')}}return r}function ft(e,t){if(!e)return{flush:()=>!1};e.setAttribute("enterkeyhint","done"),e.setAttribute("autocomplete","off"),e.setAttribute("autocapitalize","off"),e.setAttribute("spellcheck","false");const a=()=>{const s=e.value.trim();return s?(e.value="",t(s),!0):!1};e.addEventListener("keydown",s=>{(s.key==="Enter"||s.keyCode===13)&&(s.preventDefault(),a())}),e.addEventListener("beforeinput",s=>{s.inputType==="insertLineBreak"&&(s.preventDefault(),a())});const i=e.closest(".barcode-input-row, .search-input-row");if(i&&!i.querySelector(".barcode-add-btn")){const s=document.createElement("button");s.type="button",s.className="barcode-add-btn",s.setAttribute("aria-label","Barkodu ekle"),s.innerHTML='<i class="ph ph-plus"></i>',s.addEventListener("mousedown",n=>n.preventDefault()),s.addEventListener("click",()=>{a()||e.focus()}),i.insertBefore(s,i.querySelector(".camera-btn")||null)}return{flush:a}}function sn(){const e=document.createElement("div");e.className="page-transfer page-container",ke.getUser();const t=ce({title:nt("transfer","Depolar Arası Transfer"),gradientClass:"gradient-transfer"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);let i=[],s=0;return setTimeout(async()=>{var l,p;try{const c=await C.get("/branches");if(c.success){const m=e.querySelector("#target-branch");c.data.forEach(h=>{const b=document.createElement("option");b.value=h.id,b.textContent=`${h.code} - ${h.name}`,m.appendChild(b)})}const o=await C.get("/warehouses");if(o.success){const m=e.querySelector("#target-warehouse"),h=e.querySelector("#source-warehouse");m.addEventListener("change",()=>{const b=o.data.find(L=>L.id===m.value),v=e.querySelector("#target-branch");b!=null&&b.branchId&&v&&(v.value=b.branchId)}),o.data.forEach(b=>{const v=document.createElement("option");v.value=b.id,v.textContent=`${b.code} - ${b.name}`,m.appendChild(v);const L=document.createElement("option");L.value=b.id,L.textContent=`${b.code} - ${b.name}`,h.appendChild(L)})}}catch{}const n=e.querySelector("#barcode-input");n&&ft(n,r),(l=e.querySelector("#camera-btn"))==null||l.addEventListener("click",()=>{vt(c=>{r(c)})}),(p=e.querySelector("#submit-transfer"))==null||p.addEventListener("click",async()=>{var h,b,v,L,q;if(i.length===0){R("Lütfen en az bir barkod okutun","warning");return}const c=(h=e.querySelector("#source-warehouse"))==null?void 0:h.value,o=(b=e.querySelector("#target-warehouse"))==null?void 0:b.value;if(!c||!o){R("Lütfen kaynak ve hedef depoyu seçin","warning");return}if(c===o){R("Kaynak ve hedef depo aynı olamaz","warning");return}const m=e.querySelector("#submit-transfer");m.disabled=!0,m.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';try{const g=await C.post("/transfers",{targetBranch:(v=e.querySelector("#target-branch"))==null?void 0:v.value,targetWarehouse:(L=e.querySelector("#target-warehouse"))==null?void 0:L.value,sourceWarehouse:(q=e.querySelector("#source-warehouse"))==null?void 0:q.value,barcodes:i});g.success?(R(g.message||"Transfer tamamlandı!","success"),i=[],s=0,d()):R(g.message||"Hata oluştu","error")}catch(g){R(g.message,"error")}m.disabled=!1,m.innerHTML='<i class="ph ph-cloud-arrow-up"></i> Transferi Gönder'});function r(c){var m;((m=e.querySelector("#cancel-barcode"))==null?void 0:m.checked)?(i=i.filter(h=>h!==c),R(`Barkod iptal edildi: ${c}`,"warning")):(i.push(c),R(`Barkod eklendi: ${c}`,"success")),s=i.length,d(),e.querySelector("#last-barcode").textContent=c}function d(){e.querySelector("#barcode-count").textContent=s;const c=e.querySelector("#scanned-list");c.innerHTML=i.length?'<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>'+i.map((o,m)=>`
            <div class="scan-item">
              <span class="scan-no">${m+1}</span>
              <span class="scan-code">${u(o)}</span>
              <button type="button" class="scan-rm" data-code="${u(o)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join(""):'<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>'}e.querySelector("#scanned-list").addEventListener("click",async c=>{const o=c.target.closest("[data-code]");if(o){i=i.filter(m=>m!==o.dataset.code),s=i.length,d();return}if(c.target.closest("#clear-scans")){const{confirmDialog:m}=await Ve(async()=>{const{confirmDialog:h}=await Promise.resolve().then(()=>js);return{confirmDialog:h}},void 0,import.meta.url);if(!await m({title:"Liste temizlensin mi?",message:`${i.length} okutulmuş barkod silinecek.`,confirmLabel:"Temizle",danger:!0}))return;i=[],s=0,d(),e.querySelector("#last-barcode").textContent="—"}}),d()},0),e}function nn(){const e=document.createElement("div");e.className="page-vehicle-unload page-container";const t=ce({title:nt("vehicleUnload","Araba'dan Boşaltma"),gradientClass:"gradient-serial"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);let i=[];return setTimeout(async()=>{var l,p;const s=e.querySelector("#vu-vehicle-info"),n=e.querySelector("#vu-vehicle-label");s.addEventListener("input",()=>{n.textContent=s.value.trim()||"—"});try{const c=await C.get("/warehouses");if(c.success){const o=e.querySelector("#vu-warehouse");c.data.forEach(m=>{const h=document.createElement("option");h.value=m.id,h.textContent=`${m.code} - ${m.name}`,o.appendChild(h)})}}catch{}const r=e.querySelector("#vu-barcode-input");ft(r,c=>{i.push(c),R(`Barkod eklendi: ${c}`,"success"),d()}),(l=e.querySelector("#vu-camera-btn"))==null||l.addEventListener("click",()=>{vt(c=>{i.push(c),R(`Barkod eklendi: ${c}`,"success"),d()})}),(p=e.querySelector("#vu-submit"))==null||p.addEventListener("click",async()=>{var o,m,h;if(i.length===0){R("Lütfen en az bir barkod okutun","warning");return}if(!((o=e.querySelector("#vu-warehouse"))!=null&&o.value)){R("Lütfen depoyu seçin","warning");return}const c=e.querySelector("#vu-submit");c.disabled=!0,c.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:#fff;"></div>';try{const b=await C.post("/vehicle-unload",{warehouseId:(m=e.querySelector("#vu-warehouse"))==null?void 0:m.value,vehicleInfo:(h=e.querySelector("#vu-vehicle-info"))==null?void 0:h.value,barcodes:i});b.success?(R(b.message,"success"),i=[],d()):R(b.message||"Hata oluştu","error")}catch(b){R("Gönderim hatası: "+b.message,"error")}c.disabled=!1,c.innerHTML='<i class="ph ph-cloud-arrow-up"></i> Depoya Kaydet'}),e.querySelector("#vu-scanned-list").addEventListener("click",async c=>{const o=c.target.closest("[data-code]");if(o){i=i.filter(m=>m!==o.dataset.code),d();return}if(c.target.closest("#vu-clear-scans")){const{confirmDialog:m}=await Ve(async()=>{const{confirmDialog:h}=await Promise.resolve().then(()=>js);return{confirmDialog:h}},void 0,import.meta.url);if(!await m({title:"Liste temizlensin mi?",message:`${i.length} okutulmuş barkod silinecek.`,confirmLabel:"Temizle",danger:!0}))return;i=[],d()}}),d();function d(){e.querySelector("#vu-barcode-count").textContent=i.length;const c=e.querySelector("#vu-scanned-list");c.innerHTML=i.length?'<div class="scan-list-head"><span>Okutulanlar</span><button type="button" class="jt-link" id="vu-clear-scans"><i class="ph ph-trash"></i> Listeyi temizle</button></div>'+i.map((o,m)=>`
            <div class="scan-item">
              <span class="scan-no">${m+1}</span>
              <span class="scan-code">${u(o)}</span>
              <button type="button" class="scan-rm" data-code="${u(o)}" title="Listeden çıkar" aria-label="Listeden çıkar"><i class="ph ph-x"></i></button>
            </div>`).join(""):'<div class="scan-empty"><i class="ph ph-barcode"></i> Henüz barkod okutulmadı</div>'}},0),e}const ua=e=>Number(e||0).toLocaleString("tr-TR",{maximumFractionDigits:2})+" ₺",Xa={toptan:{intro:"Büyük hacimli, vadeli satışlar. Birden fazla ürünü tek seferde ekleyin.",customerLabel:"Alıcı firma",warehouseLabel:"Çıkış deposu",submit:"Toptan satışı tamamla",submitIcon:"ph-truck",scan:!1,link:!0,qtyHint:"Koli / palet adedi",fields:[{id:"docNo",label:"İrsaliye / Fatura no",icon:"ph-file-text",placeholder:"Örn: IRS-2026-0142"},{id:"terms",label:"Vade",type:"select",icon:"ph-calendar-check",options:["Peşin","15 gün","30 gün","45 gün","60 gün","90 gün"],value:"30 gün"}]},perakende:{intro:"Hızlı satış: barkodu okutun, ürün sepete girsin. Aynı barkod tekrar okutulunca adet artar.",customerLabel:"Müşteri",warehouseLabel:"Satış deposu",submit:"Satışı tamamla",submitIcon:"ph-shopping-bag",scan:!0,scanFirst:!0,link:!1,qtyHint:"Adet",fields:[{id:"payment",label:"Ödeme yöntemi",type:"chips",options:["Nakit","Kredi kartı","Havale / EFT"],value:"Nakit",required:!0}]},ihracat:{intro:"Yurt dışı sevkiyatı: hedef ülke, teslim şekli ve konteyner bilgisini girin.",customerLabel:"Yurt dışı alıcı",warehouseLabel:"Çıkış deposu",submit:"İhracat satışını tamamla",submitIcon:"ph-airplane-tilt",scan:!1,link:!0,qtyHint:"Adet",fields:[{id:"country",label:"Hedef ülke",icon:"ph-globe-hemisphere-west",placeholder:"Örn: Almanya",required:!0},{id:"incoterm",label:"Teslim şekli (Incoterm)",type:"select",icon:"ph-handshake",options:["EXW","FCA","FOB","CIF","CFR","DAP","DDP"],value:"FOB"},{id:"container",label:"Konteyner / Plaka no",icon:"ph-truck-trailer",placeholder:"İsteğe bağlı"}]},b2b:{intro:"İşletmeler arası satış: karşı işletme, sipariş numarası ve teslim tarihi ile kayıt.",customerLabel:"Karşı işletme",warehouseLabel:"Çıkış deposu",submit:"B2B satışını tamamla",submitIcon:"ph-briefcase",scan:!1,link:!0,qtyHint:"Adet",fields:[{id:"po",label:"Sipariş (PO) no",icon:"ph-hash",placeholder:"Karşı tarafın sipariş numarası"},{id:"due",label:"Teslim tarihi",type:"date",icon:"ph-calendar-blank"}]},iade:{intro:"Müşteriden dönen ürünü stoğa geri alın. Tutar müşterinin bakiyesinden düşülür.",customerLabel:"İade eden müşteri",warehouseLabel:"İade giriş deposu",submit:"İadeyi kabul et",submitIcon:"ph-arrow-u-down-left",scan:!0,link:!1,isReturn:!0,qtyHint:"İade adedi",fields:[{id:"reason",label:"İade nedeni",type:"select",icon:"ph-chat-teardrop-text",options:["Hasarlı ürün","Yanlış ürün gönderildi","Son kullanma tarihi","Fazla / mükerrer sipariş","Kalite şikayeti","Diğer"],required:!0},{id:"condition",label:"Ürün durumu",type:"chips",options:["Sağlam","Hasarlı"],value:"Sağlam"},{id:"docNo",label:"İade irsaliye no",icon:"ph-file-text",placeholder:"İsteğe bağlı"}]},sevkiyat:{intro:"Gemi talebine göre ambardan malzeme çıkışı. Barkod okutabilir veya listeden ekleyebilirsiniz.",customerLabel:"Sevk edilen gemi",warehouseLabel:"Çıkış ambarı",submit:"Sevkiyatı tamamla",submitIcon:"ph-boat",scan:!0,link:!1,noPrice:!0,customerFilter:e=>/^GM/.test(String(e.id)),qtyHint:"Miktar",doneText:"Sevkiyat tamamlandı",fields:[{id:"req",label:"Gemi talep no",icon:"ph-clipboard-text",placeholder:"Örn: RQ-FRC-2026-041"},{id:"port",label:"Teslim limanı",type:"select",icon:"ph-anchor",options:["Tuzla","Aliağa","Dilovası","Yarımca","Ambarlı","Mersin","Yurt dışı liman (acente)"],value:"Tuzla",required:!0},{id:"delivery",label:"Teslim şekli",type:"chips",options:["Rıhtımda teslim","Lançla teslim","Acente üzerinden"],value:"Rıhtımda teslim"}]}},es={intro:"Satış bilgilerini girin.",customerLabel:"Müşteri",warehouseLabel:"Çıkış deposu",submit:"Satışı tamamla",submitIcon:"ph-check-circle",scan:!0,link:!0,qtyHint:"Adet",fields:[]},rn=(e,t)=>`color-mix(in srgb, ${e}, #000 ${Math.abs(t)}%)`;function ln(){var p;const e=document.createElement("div");e.className="page-sales page-container";const t=((p=z.modules.sales)==null?void 0:p.label)||"Satış İşlemleri",a=ce({title:t,gradientClass:"gradient-sales"});e.appendChild(a);const i=document.createElement("div");i.className="content-area",e.appendChild(i);const s=z.salesTypes;function n(){var c;a.style.background="",(c=a.querySelector(".app-header-title, h1, .header-title"))==null||c.replaceChildren(t)}const r=()=>{n(),i.innerHTML=`
      <div class="section-title animate-fade-in-up"><h2>Satış türü seçin</h2></div>
      <div class="sales-type-list">
        ${s.map((c,o)=>{const m=Xa[c.id]||es;return`
          <div class="menu-card sx-type animate-fade-in-up stagger-${Math.min(o+1,5)}" data-type="${u(c.id)}" style="--sx:${u(c.color)}" tabindex="0" role="button">
            <div class="menu-icon" style="background:${u(c.color)}1a;color:${u(c.color)};">${c.icon}</div>
            <div class="menu-content">
              <div class="menu-title">${u(c.label)} <span class="badge" style="background:${u(c.color)}1f;color:${u(c.color)};font-size:10px;">${u(c.badge)}</span></div>
              <div class="menu-desc">${u(m.intro)}</div>
            </div>
            <div class="menu-arrow" style="background:${u(c.color)}12;color:${u(c.color)};"><i class="ph ph-caret-right"></i></div>
          </div>`}).join("")}
      </div>`,i.querySelectorAll(".sx-type").forEach(c=>{const o=()=>d(s.find(m=>m.id===c.dataset.type));c.addEventListener("click",o),c.addEventListener("keydown",m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),o())})})},d=async c=>{var ae,P,U,Q,ee,se,re;const o=Xa[c.id]||es,m=c.color||"var(--primary)";s.length>1&&(a.style.background=`linear-gradient(135deg, ${m}, ${rn(m,-28)})`,(ae=a.querySelector(".app-header-title, h1, .header-title"))==null||ae.replaceChildren(c.label)),i.innerHTML='<div style="display:flex;justify-content:center;padding:48px;"><div class="loading-spinner"></div></div>';let h=[],b=[],v=[],L=[],q=[];try{const[K,G,y]=await Promise.all([C.getCustomers(),C.getWarehouses(),C.getProducts()]);h=K.success?K.data:[],o.customerFilter&&(h=h.filter(o.customerFilter)),b=G.success?G.data:[],v=y.success?y.data:[];try{const k=await C.get("/warehouse-balances");L=k.success?k.data:[]}catch{}if(o.link&&((P=z.modules.jobTracking)!=null&&P.enabled))try{q=((await C.get("/jt/orders")).data||[]).filter(w=>!["shipped","cancelled"].includes(w.state)).flatMap(w=>w.lines.filter($=>$.remaining>0).map($=>({orderId:w.id,lineId:$.id,productId:$.productId,customerId:w.customerId,label:`${w.orderNo} · ${$.productName} (kalan ${$.remaining})`,remaining:$.remaining})))}catch{}}catch(K){i.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${u(K.message||"Veri yüklenemedi. Sunucu bağlantısını kontrol edin.")}</div></div>`;return}let g=[];const E={};(o.fields||[]).forEach(K=>{E[K.id]=K.value||""});const f=K=>v.find(G=>G.id===K),x=()=>i.querySelector("#sx-wh").value,A=K=>{var y,k;const G=x();return G&&L.length?((y=L.find(w=>w.productId===K&&w.warehouseId===G))==null?void 0:y.qty)||0:((k=f(K))==null?void 0:k.stock)||0},j=K=>g.filter(G=>G.productId===K).reduce((G,y)=>G+y.qty,0),M=()=>o.isReturn?v:v.filter(K=>A(K.id)-j(K.id)>0),S=K=>{const G=K.required?'<span class="sx-req">*</span>':"";if(K.type==="chips")return`<div class="sx-field"><label>${u(K.label)} ${G}</label>
          <div class="sx-chips" data-f="${K.id}">${K.options.map(k=>`<button type="button" class="sx-chip ${k===K.value?"on":""}" data-v="${u(k)}">${u(k)}</button>`).join("")}</div></div>`;const y=K.type==="select"?`<select class="input-element" data-f="${K.id}">${K.required?'<option value="">Seçiniz...</option>':""}${K.options.map(k=>`<option ${k===K.value?"selected":""}>${u(k)}</option>`).join("")}</select>`:`<input class="input-element" data-f="${K.id}" type="${K.type==="date"?"date":"text"}" placeholder="${u(K.placeholder||"")}" maxlength="80" />`;return`<div class="sx-field"><label>${u(K.label)} ${G}</label><div class="input-field"><span class="input-icon"><i class="ph ${K.icon||"ph-note"}"></i></span>${y}</div></div>`};i.innerHTML=`
      ${s.length>1?`
      <div class="sx-banner animate-fade-in-down" style="--sx:${u(m)}">
        <button type="button" class="sx-back" id="sx-back" aria-label="Geri"><i class="ph ph-arrow-left"></i></button>
        <div class="sx-banner-icon">${c.icon}</div>
        <div class="sx-banner-text"><b>${u(c.label)}</b><span>${u(o.intro)}</span></div>
      </div>`:`
      <div class="sx-intro animate-fade-in-down"><i class="ph ph-info"></i> ${u(o.intro)}</div>`}

      <div class="card sx-card animate-fade-in-up" style="--sx:${u(m)}">
        <div class="sx-step"><i class="ph ph-users"></i> ${u(o.customerLabel)} ve depo</div>
        <div class="sx-grid">
          <div class="sx-field"><label>${u(o.customerLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-users"></i></span>
              <select id="sx-customer" class="input-element"><option value="">Seçiniz...</option>${h.map(K=>`<option value="${u(K.id)}">${u(K.name)}</option>`).join("")}</select></div></div>
          <div class="sx-field"><label>${u(o.warehouseLabel)}</label>
            <div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="sx-wh" class="input-element"><option value="">Seçiniz...</option>${b.map(K=>`<option value="${u(K.id)}">${u(K.name)}</option>`).join("")}</select></div></div>
        </div>
        ${(o.fields||[]).length?`<div class="sx-grid">${o.fields.map(S).join("")}</div>`:""}
      </div>

      <div class="card sx-card animate-fade-in-up stagger-1" style="--sx:${u(m)}">
        <div class="sx-step"><i class="ph ph-package"></i> ${o.scanFirst?"Ürünleri okutun":"Ürün ekle"}</div>
        ${o.scan?`
        <div class="barcode-input-row">
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span>
            <input type="text" id="sx-scan" placeholder="Barkod veya ürün kodu" /></div>
          <button type="button" class="camera-btn" id="sx-camera" aria-label="Kamera ile okut"><i class="ph ph-camera"></i></button>
        </div>`:""}
        ${o.scanFirst?"":`
        ${q.length?`<div class="sx-field"><label>Sipariş kalemi <span class="sx-opt">(isteğe bağlı — giden miktara işlenir)</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-kanban"></i></span><select id="sx-order" class="input-element"><option value="">Siparişe bağlama</option></select></div></div>`:""}
        <div class="sx-add">
          <div class="input-field sx-add-prod"><span class="input-icon"><i class="ph ph-package"></i></span>
            <select id="sx-product" class="input-element"></select></div>
          <div class="input-field sx-add-qty"><span class="input-icon"><i class="ph ph-hash"></i></span>
            <input type="number" id="sx-qty" min="1" step="1" inputmode="numeric" placeholder="${u(o.qtyHint)}" /></div>
          <button type="button" class="btn sx-add-btn" id="sx-add"><i class="ph ph-plus"></i> Ekle</button>
        </div>`}
        <div class="sx-hint" id="sx-hint"></div>
        <div id="sx-lines"></div>
      </div>

      <div class="sx-total animate-fade-in-up stagger-2" id="sx-total" style="--sx:${u(m)}"></div>
      <button type="button" id="sx-submit" class="btn btn-block btn-lg sx-submit" style="--sx:${u(m)}">
        <i class="ph ${o.submitIcon}"></i> ${u(o.submit)}
      </button>`;const N=K=>i.querySelector(K);function B(){const K=N("#sx-product");if(!K)return;const G=K.value,y=M();K.innerHTML=`<option value="">${y.length?o.noPrice?"Malzeme seçin...":"Ürün seçin...":o.isReturn?"Ürün yok":`Bu ${o.noPrice?"ambarda sevk edilebilir malzeme":"depoda satılabilir ürün"} yok`}</option>`+y.map(w=>`<option value="${u(w.id)}">${u(w.name)}${o.isReturn?"":` — ${A(w.id)-j(w.id)} ${u(w.unit||"")}`}</option>`).join(""),y.some(w=>w.id===G)&&(K.value=G);const k=N("#sx-hint");!o.isReturn&&x()&&!y.length&&!g.length?(k.innerHTML='<i class="ph ph-info"></i> Seçili depoda stok yok. Başka bir depo seçin veya Stok Detay › Stok Yönetimi’nden stok ekleyin.',k.classList.add("show")):!o.isReturn&&!x()?(k.innerHTML='<i class="ph ph-info"></i> Önce depoyu seçin; yalnızca o depoda stoku olan ürünler listelenir.',k.classList.add("show")):(k.classList.remove("show"),k.textContent="")}function O(){var k;const K=N("#sx-order");if(!K)return;const G=(k=N("#sx-product"))==null?void 0:k.value,y=q.filter(w=>!G||w.productId===G);K.innerHTML='<option value="">Siparişe bağlama</option>'+y.map(w=>`<option value="${u(w.orderId)}|${u(w.lineId)}">${u(w.label)}</option>`).join("")}function F(){const K=N("#sx-lines");K.innerHTML=g.length?g.map((k,w)=>{const $=f(k.productId),T=o.isReturn?1/0:A(k.productId);return`
        <div class="sx-line" data-i="${w}">
          <div class="sx-line-info">
            <div class="sx-line-name">${u(($==null?void 0:$.name)||k.productId)}</div>
            <div class="sx-line-sub">${o.noPrice?`${u(($==null?void 0:$.code)||"")} · ${k.qty} ${u(($==null?void 0:$.unit)||"")}`:`${ua($==null?void 0:$.price)} × ${k.qty}`}${k.orderId?' · <i class="ph ph-kanban"></i> siparişe bağlı':""}</div>
          </div>
          <div class="sx-stepper">
            <button type="button" data-act="dec" aria-label="Azalt"><i class="ph ph-minus"></i></button>
            <input type="number" min="1" value="${k.qty}" data-role="qty" inputmode="numeric" aria-label="Adet" />
            <button type="button" data-act="inc" aria-label="Artır" ${k.qty>=T?"disabled":""}><i class="ph ph-plus"></i></button>
          </div>
          ${o.noPrice?"":`<div class="sx-line-amt">${ua((($==null?void 0:$.price)||0)*k.qty)}</div>`}
          <button type="button" class="sx-rm" data-act="rm" aria-label="Kaldır"><i class="ph ph-x"></i></button>
        </div>`}).join(""):`<div class="sx-empty"><i class="ph ph-shopping-cart-simple"></i> ${o.isReturn?"İade edilecek ürün eklenmedi":o.noPrice?"Sevk listesi boş":"Sepet boş"}</div>`;const G=g.reduce((k,w)=>k+w.qty,0),y=g.reduce((k,w)=>{var $;return k+((($=f(w.productId))==null?void 0:$.price)||0)*w.qty},0);N("#sx-total").innerHTML=`
        <div><span>Kalem</span><b>${g.length}</b></div>
        <div><span>Toplam adet</span><b>${G}</b></div>
        ${o.noPrice?"":`<div class="sx-total-amt"><span>${o.isReturn?"Bakiyeden düşülecek":"Genel toplam"}</span><b>${ua(y)}</b></div>`}`,B()}function V(K,G,y){const k=f(K);if(!k)return R("Ürün bulunamadı","error");if(G=Math.floor(Number(G)),!(G>0))return R("Geçerli bir adet girin","warning");if(!o.isReturn){if(!x())return R("Önce depoyu seçin","warning");const T=A(K)-j(K);if(G>T)return R(`"${k.name}" için bu depoda en fazla ${Math.max(0,T)} adet eklenebilir`,"warning")}const w=y?`${K}|${y.lineId}`:K,$=g.find(T=>(T.key||T.productId)===w);$?$.qty+=G:g.push({key:w,productId:K,qty:G,...y||{}}),F()}(U=N("#sx-back"))==null||U.addEventListener("click",r),N("#sx-wh").addEventListener("change",()=>{o.isReturn||(g=g.filter(K=>A(K.productId)>0).map(K=>({...K,qty:Math.min(K.qty,A(K.productId))}))),F()}),i.querySelectorAll(".sx-chips").forEach(K=>K.addEventListener("click",G=>{const y=G.target.closest(".sx-chip");y&&(K.querySelectorAll(".sx-chip").forEach(k=>k.classList.toggle("on",k===y)),E[K.dataset.f]=y.dataset.v)})),i.querySelectorAll("select[data-f], input[data-f]").forEach(K=>K.addEventListener("input",()=>{E[K.dataset.f]=K.value}));const J=N("#sx-add");if(J==null||J.addEventListener("click",()=>{var k;const K=N("#sx-product").value;if(!K)return R("Ürün seçin","warning");const[G,y]=(((k=N("#sx-order"))==null?void 0:k.value)||"").split("|");V(K,N("#sx-qty").value||1,G?{orderId:G,lineId:y}:null),N("#sx-qty").value="",N("#sx-product").value="",O()}),(Q=N("#sx-qty"))==null||Q.addEventListener("keydown",K=>{K.key==="Enter"&&(K.preventDefault(),J.click())}),(ee=N("#sx-product"))==null||ee.addEventListener("change",O),(se=N("#sx-order"))==null||se.addEventListener("change",()=>{const K=q.find(G=>`${G.orderId}|${G.lineId}`===N("#sx-order").value);K&&(M().some(G=>G.id===K.productId)&&(N("#sx-product").value=K.productId),N("#sx-customer").value=K.customerId||N("#sx-customer").value,N("#sx-qty").value||(N("#sx-qty").value=K.remaining))}),o.scan){const K=y=>v.find(k=>k.barcode===y||String(k.code||"").toLowerCase()===y.toLowerCase()),G=y=>{const k=K(y);if(!k)return R(`"${y}" kodlu ürün bulunamadı`,"error");V(k.id,1)};ft(N("#sx-scan"),G),(re=N("#sx-camera"))==null||re.addEventListener("click",()=>vt(G))}N("#sx-lines").addEventListener("click",K=>{const G=K.target.closest("[data-act]");if(!G)return;const y=Number(G.closest(".sx-line").dataset.i),k=g[y];k&&(G.dataset.act==="rm"?g.splice(y,1):G.dataset.act==="inc"?(o.isReturn||k.qty<A(k.productId))&&k.qty++:G.dataset.act==="dec"&&(k.qty--,k.qty<1&&g.splice(y,1)),F())}),N("#sx-lines").addEventListener("change",K=>{const G=K.target.closest('[data-role="qty"]');if(!G)return;const y=g[Number(G.closest(".sx-line").dataset.i)];let k=Math.floor(Number(G.value));if(k>0||(k=1),!o.isReturn){const w=A(y.productId);k>w&&(R(`Bu depoda en fazla ${w} adet var`,"warning"),k=w)}y.qty=k,F()}),N("#sx-submit").addEventListener("click",async()=>{var _;const K=N("#sx-submit"),G=N("#sx-customer").value,y=x();if(!G)return R(`${o.customerLabel} seçin`,"warning");if(!y)return R(`${o.warehouseLabel} seçin`,"warning");if(!g.length)return R("En az bir ürün ekleyin","warning");const k=(o.fields||[]).find(H=>H.required&&!String(E[H.id]||"").trim());if(k)return R(`${k.label} zorunludur`,"warning");const w=(o.fields||[]).filter(H=>String(E[H.id]||"").trim()).map(H=>`${H.label}: ${String(E[H.id]).trim()}`).join(" · "),$=K.innerHTML;K.disabled=!0,K.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';const T=[];let D=0;try{for(const H of[...g])try{const I=await C.makeSale(G,y,H.productId,H.qty,c.id,H.orderId,H.lineId,w);if(!I.success)throw new Error(I.message||"Hata oluştu");g=g.filter(Z=>Z!==H),D++}catch(I){T.push(`${((_=f(H.productId))==null?void 0:_.name)||H.productId}: ${I.message}`)}}finally{K.disabled=!1,K.innerHTML=$}if(!T.length)R(o.isReturn?`İade kabul edildi (${D} kalem). Stok geri eklendi.`:`${o.doneText||"Satış tamamlandı"} (${D} kalem).`,"success"),d(c);else{R(T[0],"error");try{const[H,I]=await Promise.all([C.getProducts(),C.get("/warehouse-balances")]);H.success&&(v=H.data),I.success&&(L=I.data)}catch{}F(),D&&R(`${D} kalem kaydedildi, ${T.length} kalem kaydedilemedi.`,"warning")}}),F(),O()},l=s.find(c=>c.id===W.getQueryParams().type);return l?d(l):s.length===1?d(s[0]):r(),e}const on=["Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj","Genel"],cn=["Adet","Kova","Kutu","Şişe","Bidon","Paket","Kg","Litre"];function dn(){const e=document.createElement("div");e.className="page-purchase page-container";const t=ce({title:"Alış İşlemleri",gradientClass:"gradient-transfer"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);let i=[];return setTimeout(async()=>{var o,m;const s=e.querySelector("#pu-barcode-input"),n=e.querySelector("#pu-new-product-form");let r=[];try{const h=await C.get("/products");h.success&&(r=h.data)}catch{}function d(h){const b=r.find(v=>v.barcode===h);b?l(h,b.name,b):p(h),s.value=""}function l(h,b,v){var L,q;n.style.display="block",n.innerHTML=`
        <div class="card" style="padding:16px; border-left: 4px solid var(--success);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--success);">
            <i class="ph ph-check-circle"></i> Ürün Bulundu: ${b}
          </div>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
            Mevcut Stok: ${v.stock} ${u(v.unit)} | Kategori: ${u(v.category)}
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <input type="number" class="input-element" value="1" min="1" id="pu-qty-input" style="flex:1;" placeholder="Miktar" />
            <button class="btn btn-primary" id="pu-qty-add" style="flex:1;">
              <i class="ph ph-plus"></i> Listeye Ekle
            </button>
          </div>
        </div>
      `,(L=e.querySelector("#pu-qty-add"))==null||L.addEventListener("click",()=>{const g=parseInt(e.querySelector("#pu-qty-input").value);if(!g||g<=0)return R("Geçerli miktar girin","warning");i.push({code:h,name:b,qty:g,category:v.category,unit:v.unit,isNew:!1}),R(`${b} x${g} eklendi`,"success"),n.style.display="none",c()}),(q=e.querySelector("#pu-qty-input"))==null||q.focus()}function p(h){var b,v;n.style.display="block",n.innerHTML=`
        <div class="card" style="padding:16px; border-left: 4px solid var(--warning);">
          <div style="font-weight:600; margin-bottom:8px; color:var(--warning);">
            <i class="ph ph-warning-circle"></i> Yeni Ürün: ${h}
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
                ${on.map(L=>`<option value="${L}">${L}</option>`).join("")}
              </select>
            </div>
            <div style="flex:1;">
              <label style="font-size:13px; font-weight:600;">Birim</label>
              <select class="input-element" id="pu-new-unit">
                ${cn.map(L=>`<option value="${L}">${L}</option>`).join("")}
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
      `,(b=e.querySelector("#pu-new-add"))==null||b.addEventListener("click",()=>{const L=e.querySelector("#pu-new-name").value.trim(),q=e.querySelector("#pu-new-category").value,g=e.querySelector("#pu-new-unit").value,E=parseInt(e.querySelector("#pu-new-qty").value);if(!L)return R("Ürün adı zorunludur","warning");if(!E||E<=0)return R("Geçerli miktar girin","warning");i.push({code:h,name:L,qty:E,category:q,unit:g,isNew:!0}),R(`${L} x${E} eklendi (Yeni Ürün)`,"success"),n.style.display="none",c()}),(v=e.querySelector("#pu-new-name"))==null||v.focus()}ft(s,d),(o=e.querySelector("#pu-camera-btn"))==null||o.addEventListener("click",()=>{vt(h=>{d(h)})}),(m=e.querySelector("#pu-submit"))==null||m.addEventListener("click",async()=>{if(i.length===0){R("Lütfen en az bir ürün ekleyin","warning");return}const h=e.querySelector("#pu-submit");h.disabled=!0,h.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Kaydediliyor...';try{let b=0;for(const L of i)(await C.post("/purchase",{barcode:L.code,name:L.name,quantity:L.qty,category:L.category,unit:L.unit,warehouseId:null})).success&&b++;R(`${b}/${i.length} ürün başarıyla stoğa eklendi!`,"success"),i=[],c();const v=await C.get("/products");v.success&&(r=v.data)}catch(b){R("Kayıt sırasında hata: "+b.message,"error")}finally{h.disabled=!1,h.innerHTML='<i class="ph ph-floppy-disk"></i> Alış Kaydını Tamamla'}});function c(){var b;const h=e.querySelector("#pu-items-list");if(i.length===0){h.innerHTML="";return}h.innerHTML=`
        <div style="font-weight:600; font-size:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span><i class="ph ph-list-bullets"></i> Eklenen Ürünler (${i.length})</span>
          <button id="pu-clear-all" style="font-size:12px; color:var(--error); background:none; border:none; cursor:pointer; font-weight:600;">Temizle</button>
        </div>
      `+i.map((v,L)=>`
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${L*40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: ${v.isNew?"rgba(255,152,0,0.1)":"rgba(76,175,80,0.1)"}; color: ${v.isNew?"#FF9800":"#4CAF50"};">
            <i class="ph ph-${v.isNew?"plus-circle":"package"}"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${u(v.name)}</div>
            <div class="list-subtitle">${u(v.code)} · ${v.qty} ${u(v.unit)} · ${u(v.category)}</div>
          </div>
          <button class="remove-item-btn" data-idx="${L}" style="background:none; border:none; color:var(--error); cursor:pointer; font-size:18px; padding:4px;">
            <i class="ph ph-x-circle"></i>
          </button>
        </div>
      `).join(""),h.querySelectorAll(".remove-item-btn").forEach(v=>{v.addEventListener("click",()=>{const L=parseInt(v.dataset.idx);i.splice(L,1),c()})}),(b=h.querySelector("#pu-clear-all"))==null||b.addEventListener("click",()=>{i=[],c()})}},0),e}const ge=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let ma=0;function Nt({title:e,message:t="",body:a="",icon:i="",tone:s="",actions:n,wide:r=!1,onMount:d=null}){return new Promise(l=>{const p=document.activeElement,c=document.createElement("div");c.className="app-dialog-wrap",c.innerHTML=`
      <div class="app-dialog-bg"></div>
      <div class="app-dialog ${s}${r?" wide":""}" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        ${i?`<span class="app-dialog-icon"><i class="ph ${ge(i)}"></i></span>`:""}
        <h3 id="dlg-title">${ge(e)}</h3>
        ${t?`<p>${ge(t)}</p>`:""}
        ${a}
        <div class="app-dialog-actions">
          ${n.map((h,b)=>`<button type="button" class="btn ${h.cls||"btn-secondary"}" data-i="${b}">${h.icon?`<i class="ph ${ge(h.icon)}"></i> `:""}${ge(h.label)}</button>`).join("")}
        </div>
      </div>`,document.body.appendChild(c),document.body.classList.add("jt-lock"),ma++;const o=h=>{c.isConnected&&(c.classList.add("closing"),setTimeout(()=>{c.remove(),--ma<=0&&(ma=0,document.body.classList.remove("jt-lock")),p&&p.focus&&p.focus()},180),document.removeEventListener("keydown",m,!0),l(h))};function m(h){var b;if(c.isConnected&&(h.key==="Escape"&&(h.preventDefault(),o(((b=n.find(v=>v.cancel))==null?void 0:b.value)??null)),h.key==="Tab")){const v=[...c.querySelectorAll("button, input, select, textarea")].filter(g=>!g.disabled);if(!v.length)return;const L=v[0],q=v[v.length-1];h.shiftKey&&document.activeElement===L?(h.preventDefault(),q.focus()):!h.shiftKey&&document.activeElement===q&&(h.preventDefault(),L.focus())}}document.addEventListener("keydown",m,!0),c.querySelector(".app-dialog-bg").addEventListener("click",()=>{var h;return o(((h=n.find(b=>b.cancel))==null?void 0:h.value)??null)}),c.querySelectorAll("[data-i]").forEach(h=>h.addEventListener("click",()=>{const b=n[Number(h.dataset.i)];if(b.onBefore){const v=b.onBefore(c);if(v===!1)return;o(v===void 0?b.value:v);return}o(b.value)})),d&&d(c),setTimeout(()=>{var h;return(h=c.querySelector("input, textarea, select")||c.querySelector(".btn-primary, .btn-danger")||c.querySelector("button"))==null?void 0:h.focus()},60)})}function Ha({title:e,message:t="",options:a,icon:i="ph-download-simple",cancelLabel:s="Vazgeç"}){return Nt({title:e,message:t,icon:i,actions:[{label:s,cls:"btn-secondary",value:null,cancel:!0},...a.map((n,r)=>({label:n.label,icon:n.icon,cls:r===0?"btn-primary":"btn-secondary",value:n.value}))]})}function Se({title:e,message:t="",confirmLabel:a="Evet",cancelLabel:i="Vazgeç",danger:s=!1,icon:n}){return Nt({title:e,message:t,icon:n||(s?"ph-warning":"ph-question"),tone:s?"danger":"",actions:[{label:i,cls:"btn-secondary",value:!1,cancel:!0},{label:a,cls:s?"btn-danger":"btn-primary",value:!0}]})}function za({title:e,message:t="",label:a="",value:i="",placeholder:s="",multiline:n=!1,required:r=!1,confirmLabel:d="Kaydet",maxlength:l=300}){const p=n?`<textarea id="dlg-input" rows="3" maxlength="${l}" placeholder="${ge(s)}">${ge(i)}</textarea>`:`<input id="dlg-input" type="text" maxlength="${l}" value="${ge(i)}" placeholder="${ge(s)}" />`;return Nt({title:e,message:t,icon:"ph-pencil-simple",body:`<label class="app-dialog-field">${a?`<span>${ge(a)}</span>`:""}${p}<em class="app-dialog-err" hidden>Bu alan boş bırakılamaz.</em></label>`,actions:[{label:"Vazgeç",cls:"btn-secondary",value:null,cancel:!0},{label:d,cls:"btn-primary",onBefore:c=>{const o=c.querySelector("#dlg-input").value.trim();return r&&!o?(c.querySelector(".app-dialog-err").hidden=!1,c.querySelector("#dlg-input").focus(),!1):o}}]})}function Ke({title:e,message:t="",fields:a,confirmLabel:i="Kaydet",icon:s="ph-pencil-simple",validate:n,onMount:r,wide:d=!1,footerHtml:l=""}){const p=o=>{const m=`df-${o.name}`;if(o.type==="select")return`<select id="${m}">${(o.options||[]).map(([b,v])=>`<option value="${ge(b)}" ${String(o.value??"")===String(b)?"selected":""}>${ge(v)}</option>`).join("")}</select>`;if(o.type==="textarea")return`<textarea id="${m}" rows="2" maxlength="${o.maxlength||300}" placeholder="${ge(o.placeholder||"")}">${ge(o.value??"")}</textarea>`;const h=o.type==="number"?"number":o.type==="date"?"date":o.type==="password"?"password":"text";return`<input id="${m}" type="${h}" ${h==="number"?`inputmode="decimal" step="${o.step||"any"}" min="${o.min??""}"`:""} maxlength="${o.maxlength||120}" value="${ge(o.value??"")}" placeholder="${ge(o.placeholder||"")}" autocomplete="off" />`},c=`<div class="app-form">${a.map(o=>`<label class="app-dialog-field ${o.half?"half":""}"><span>${ge(o.label)}${o.required?" *":""}${o.hint?` <small>${ge(o.hint)}</small>`:""}</span>${p(o)}</label>`).join("")}</div>${l}<em class="app-dialog-err" id="df-err" hidden></em>`;return Nt({title:e,message:t,icon:s,wide:d,onMount:r,body:c,actions:[{label:"Vazgeç",cls:"btn-secondary",value:null,cancel:!0},{label:i,cls:"btn-primary",onBefore:o=>{const m={},h=o.querySelector("#df-err");for(const v of a){const L=o.querySelector(`#df-${v.name}`).value.trim();if(v.required&&!L)return h.textContent=`${v.label} boş bırakılamaz.`,h.hidden=!1,o.querySelector(`#df-${v.name}`).focus(),!1;m[v.name]=v.type==="number"&&L!==""?Number(String(L).replace(",",".")):L}const b=n&&n(m);return b?(h.textContent=b,h.hidden=!1,!1):m}}]})}function Aa({title:e,html:t,okLabel:a="Kapat",icon:i="ph-list-bullets",extra:s=[]}){return Nt({title:e,icon:i,wide:!0,body:t,actions:[...s,{label:a,cls:"btn-primary",value:!0,cancel:!0}]})}const js=Object.freeze(Object.defineProperty({__proto__:null,choiceDialog:Ha,confirmDialog:Se,formDialog:Ke,htmlDialog:Aa,promptDialog:za},Symbol.toStringTag,{value:"Module"})),ht={draft:{label:"Taslak",color:"#9E9E9E",bg:"#9E9E9E18",icon:"ph-pencil-simple"},pending:{label:"Onay Bekliyor",color:"#FF9800",bg:"#FF980018",icon:"ph-clock"},approved:{label:"Onaylandı",color:"#2196F3",bg:"#2196F318",icon:"ph-check-circle"},ordered:{label:"Sipariş Verildi",color:"#9C27B0",bg:"#9C27B018",icon:"ph-package"},partial:{label:"Kısmi Teslim",color:"#FF5722",bg:"#FF572218",icon:"ph-arrows-split"},received:{label:"Teslim Alındı",color:"#4CAF50",bg:"#4CAF5018",icon:"ph-check-fat"},cancelled:{label:"İptal",color:"#F44336",bg:"#F4433618",icon:"ph-x-circle"}},Qt={routine:{label:"Rutin",color:"#64748B",icon:"ph-calendar-blank"},priority:{label:"Öncelikli",color:"#E08A00",icon:"ph-lightning"},urgent:{label:"Acil — gemi bekliyor",color:"#D93A3A",icon:"ph-warning-octagon"}},pn=["Tuzla","Aliağa","Dilovası","Yarımca","Ambarlı","Mersin","İskenderun","Yurt dışı liman (acente)"],un=["Makine Yedek Parça","Pompa & Valf","Filtre","Madeni Yağ","Boya & Kaplama","Tank Temizlik Kimyasalı","Emniyet & Yangın","Güverte & Halat","Kumanya & Kamara","Elektrik & Seyir","Liman & Acente","Hizmet","Diğer"],mn=["Tekstil","Hammadde","Ambalaj","Makine & Ekipman","Hizmet","Diğer"],Ne=()=>{var e;return!!((e=z.purchaseConfig)!=null&&e.maritime)},hn=()=>{var e;return((e=z.purchaseConfig)==null?void 0:e.supplierCategories)||(Ne()?un:mn)},Ct=()=>new Date().toISOString().slice(0,10),jt=e=>!["received","cancelled"].includes(e.status),dt=e=>jt(e)&&["approved","ordered","partial"].includes(e.status)&&e.expectedDate&&e.expectedDate<Ct(),Ht=e=>(e.totalGross||0)*(e.currency==="TRY"?1:Number(e.exchangeRate)||1);function Le(e,t="TRY"){if(e==null)return"-";try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:t,maximumFractionDigits:0}).format(e)}catch{return`${Math.round(e)} ${t}`}}function pt(e){if(!e)return"-";const[t,a,i]=String(e).slice(0,10).split("-");return`${i}.${a}.${t}`}const Ka=e=>Math.round((new Date(`${String(e).slice(0,10)}T00:00:00`)-new Date(`${Ct()}T00:00:00`))/864e5),gt=()=>'<div class="loading-spinner" style="margin-top:32px;"></div>',sa='<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>';function bn(){const e=document.createElement("div");e.className="page-purchase-module page-container",e.appendChild(ce({title:nt("purchase","Satın Alma"),gradientClass:"gradient-purchase"}));const t=document.createElement("div");return t.className="content-area",t.innerHTML=gt(),e.appendChild(t),setTimeout(()=>vn(t),0),e}function vn(e){var d;const t=!!((d=z.modules.suppliers)!=null&&d.enabled),a=[["orders","ph-list-numbers","Siparişler"],...t?[]:[["suppliers","ph-buildings","Tedarikçiler"]],["summary","ph-chart-bar","Özet"]],i=W.getQueryParams(),s=a.some(l=>l[0]===i.tab)?i.tab:"orders";e.innerHTML=`
    <div class="pm-tabs">${a.map(([l,p,c])=>`<button class="pm-tab ${l===s?"active":""}" data-tab="${l}"><i class="ph ${p}"></i> ${c}</button>`).join("")}
      ${t?`<a class="pm-tab pm-tab-link" href="#/suppliers"><i class="ph ph-buildings"></i> ${u(z.modules.suppliers.label||"Tedarikçiler")} <i class="ph ph-arrow-up-right"></i></a>`:""}</div>
    <div id="pm-panel"></div>`;const n=e.querySelector("#pm-panel");e.querySelectorAll(".pm-tab[data-tab]").forEach(l=>l.addEventListener("click",()=>{l.classList.contains("active")||(W.step({tab:l.dataset.tab}),e.querySelectorAll(".pm-tab").forEach(p=>p.classList.toggle("active",p===l)),r(l.dataset.tab,{}))}));const r=(l,p)=>l==="suppliers"?Cs(n):l==="summary"?$n(n):p.po?Oa(n,p.po):p.new?Ns(n):fn(n,p);r(s,i)}async function fn(e,t={}){e.innerHTML=gt();try{let p=function(o,m){var g;const h=ht[o.status]||ht.draft,b=Qt[o.urgency]||null,v=Ms(o),L=dt(o),q=o.expectedDate?Ka(o.expectedDate):null;return`
      <div class="pm-order-card pm2-card animate-fade-in-up stagger-${Math.min(m+1,5)} ${L?"is-late":""}" data-id="${u(o.id)}" tabindex="0" role="button">
        <div class="pm2-card-top">
          <div class="pm2-id"><i class="ph ph-file-text"></i> ${u(o.id)}${Ne()&&b&&o.urgency!=="routine"?`<span class="pm2-urg" style="--u:${b.color}"><i class="ph ${b.icon}"></i> ${b.label}</span>`:""}</div>
          <span class="pm-status-badge" style="background:${h.bg}; color:${h.color};"><i class="ph ${h.icon}"></i> ${h.label}</span>
        </div>
        <div class="pm2-supplier">${u(o.supplierName)}</div>
        ${Ne()?`
        <div class="pm2-chips">
          ${o.vesselName?`<span class="pm2-chip pm2-vessel"><i class="ph ph-boat"></i> ${u(o.vesselName)}</span>`:'<span class="pm2-chip"><i class="ph ph-warehouse"></i> Ambar stoğu</span>'}
          ${o.requisitionNo?`<span class="pm2-chip"><i class="ph ph-clipboard-text"></i> ${u(o.requisitionNo)}</span>`:""}
          ${o.port?`<span class="pm2-chip"><i class="ph ph-anchor"></i> ${u(o.port)}</span>`:""}
        </div>`:""}
        <div class="pm2-meta">
          <span title="Sipariş tarihi"><i class="ph ph-calendar"></i> ${pt(o.orderDate)}</span>
          <span title="Beklenen teslim" class="${L?"pm2-late":""}"><i class="ph ph-truck"></i> ${pt(o.expectedDate)}${jt(o)&&q!=null?` · ${L?`${-q} gün gecikti`:q===0?"bugün":`${q} gün`}`:""}</span>
          <span><i class="ph ph-package"></i> ${((g=o.lines)==null?void 0:g.length)||0} kalem</span>
          <b class="pm2-total">${Le(o.totalGross||0,o.currency)}</b>
        </div>
        ${v>0&&v<100?`<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:${v}%; background:${h.color};"></div></div><div class="pm2-progress-txt">Teslim alınan: %${v}</div>`:""}
      </div>`},c=function(){var h;const o=i.filter(l);e.innerHTML=`
        <div class="pm2-kpis">${d.map(([b,v,L,q,g])=>`<div class="pm2-kpi" style="--k:${v}" title="${u(g)}"><span class="pm2-kpi-ic"><i class="ph ${b}"></i></span><div><b>${L}</b><small>${u(q)}</small></div></div>`).join("")}</div>
        <div class="pm2-toolbar">
          <div class="input-field pm2-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
            <input type="search" class="input-element" id="pm-q" placeholder="${Ne()?"Sipariş no, tedarikçi, gemi, talep no veya liman ara…":"Sipariş no, tedarikçi veya fatura no ara…"}" value="${u(s.q)}" /></div>
          ${Ne()&&n.length?`<div class="input-field pm2-vessel-filter"><span class="input-icon"><i class="ph ph-boat"></i></span>
            <select class="input-element" id="pm-vessel"><option value="">Tüm talepler</option><option value="__stock" ${s.vessel==="__stock"?"selected":""}>Ambar stoğu</option>${n.map(([b,v])=>`<option value="${u(b)}" ${s.vessel===b?"selected":""}>${u(v)}</option>`).join("")}</select></div>`:""}
          <button class="btn btn-primary btn-sm" id="pm-new-order"><i class="ph ph-plus"></i> Yeni satın alma</button>
        </div>
        <div class="pm-filter-bar">
          ${["","late","draft","pending","approved","ordered","partial","received","cancelled"].map(b=>{const v=b==="late"?{label:"Geciken",icon:"ph-warning",color:"#D93A3A"}:b?ht[b]:null,L=b==="late"?i.filter(dt).length:b?i.filter(q=>q.status===b).length:i.length;return b&&!L&&s.status!==b?"":`<button class="pm-filter-btn ${s.status===b?"active":""}" data-status="${b}">${v?`<i class="ph ${v.icon}" style="color:${v.color};"></i> `:'<i class="ph ph-funnel"></i> '}<span>${v?v.label:"Tümü"}</span><span class="pm-filter-count">${L}</span></button>`}).join("")}
        </div>
        <div class="pm2-list">${o.length?o.map(p).join(""):'<div class="pm-empty"><i class="ph ph-package" style="font-size:48px; color:var(--text-secondary); opacity:.4;"></i><p style="color:var(--text-secondary); margin-top:12px;">Bu filtreye uyan sipariş yok</p></div>'}</div>`;const m=e.querySelector("#pm-q");m.addEventListener("input",()=>{s.q=m.value.trim().toLocaleLowerCase("tr");const b=m.selectionStart;c();const v=e.querySelector("#pm-q");v.focus(),v.setSelectionRange(b,b)}),(h=e.querySelector("#pm-vessel"))==null||h.addEventListener("change",b=>{s.vessel=b.target.value,c()}),e.querySelectorAll(".pm-filter-btn").forEach(b=>b.addEventListener("click",()=>{s.status=b.dataset.status,c()})),e.querySelectorAll(".pm2-card").forEach(b=>{const v=()=>{W.step({tab:"orders",po:b.dataset.id}),Oa(e,b.dataset.id)};b.addEventListener("click",v),b.addEventListener("keydown",L=>{L.key==="Enter"&&v()})}),e.querySelector("#pm-new-order").addEventListener("click",()=>{W.step({tab:"orders",new:1}),Ns(e,{fromList:!0})})};const a=await C.get("/purchase-orders"),i=a.success?a.data:[],s={status:t.status||"",vessel:t.vessel||"",q:""},n=[...new Map(i.filter(o=>o.vesselId).map(o=>[o.vesselId,o.vesselName])).entries()].sort((o,m)=>String(o[1]).localeCompare(String(m[1]),"tr")),r=i.filter(jt),d=[["ph-folder-open","#2196F3",r.length,"Açık sipariş","Teslim alınmamış, iptal edilmemiş"],["ph-clock","#FF9800",i.filter(o=>["draft","pending"].includes(o.status)).length,"Onay bekleyen","Taslak ve onaydaki siparişler"],["ph-warning","#D93A3A",i.filter(dt).length,"Geciken teslimat","Beklenen teslim tarihi geçti"],Ne()?["ph-lightning","#8B5CF6",r.filter(o=>o.urgency==="urgent").length,"Acil talep","Gemi veya ambar acil bekliyor"]:["ph-calendar-check","#4CAF50",i.filter(o=>String(o.orderDate).slice(0,7)===Ct().slice(0,7)).length,"Bu ay açılan","Bu ay oluşturulan siparişler"]],l=o=>(!s.status||o.status===s.status||s.status==="late"&&dt(o))&&(!s.vessel||(s.vessel==="__stock"?!o.vesselId:o.vesselId===s.vessel))&&(!s.q||[o.id,o.supplierName,o.vesselName,o.requisitionNo,o.port,o.invoiceNo].some(m=>String(m||"").toLocaleLowerCase("tr").includes(s.q)));c()}catch(a){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${u(a.message)}</div>`}}function Ms(e){if(!e.lines||e.lines.length===0)return 0;const t=e.lines.reduce((i,s)=>i+(s.qty||0),0),a=e.lines.reduce((i,s)=>i+(s.receivedQty||0),0);return t>0?Math.round(a/t*100):0}function qs(e){const t=(e.qty||0)*(e.unitPrice||0);return t-t*((e.discount||0)/100)}async function Oa(e,t){var i,s,n,r;e.innerHTML=gt();const a=()=>W.back();try{const d=await C.get(`/purchase-orders/${encodeURIComponent(t)}`);if(!d.success)throw new Error(d.message);const l=d.data,p=ht[l.status]||ht.draft,c=Qt[l.urgency]||Qt.routine,o=["draft","pending"].includes(l.status),m=["approved","ordered","partial"].includes(l.status)||((i=z.purchaseConfig)==null?void 0:i.requireApproval)===!1&&["draft","pending"].includes(l.status),h=!["received","cancelled"].includes(l.status),b=Ms(l),v=dt(l),L=[["draft","Talep / Taslak","ph-clipboard-text"],["approved","Onay","ph-check-circle"],["ordered","Sipariş","ph-paper-plane-tilt"],["received","Mal Kabul","ph-package"]],q={draft:0,pending:0,approved:1,ordered:2,partial:2.5,received:3,cancelled:-1}[l.status]??0,g=[...Ne()?[[l.vesselName?"ph-boat":"ph-warehouse","Talep kaynağı",l.vesselName?`${l.vesselName} (gemi talebi)`:"Ambar stoğu"],["ph-clipboard-text","Talep no",l.requisitionNo||"-"],["ph-anchor","Teslim yeri",l.port||"-"],[c.icon,"Aciliyet",c.label]]:[],["ph-calendar","Sipariş tarihi",pt(l.orderDate)],["ph-truck","Beklenen teslim",`${pt(l.expectedDate)}${v?` · ${-Ka(l.expectedDate)} gün gecikti`:""}`],["ph-warehouse","Teslim ambarı",l.warehouseName||"-"],["ph-currency-circle-dollar","Para birimi",`${l.currency}${l.currency!=="TRY"&&l.exchangeRate?` · kur ${l.exchangeRate}`:""}`],...l.invoiceNo?[["ph-file-text","Fatura / irsaliye",l.invoiceNo]]:[],...l.receiptDate?[["ph-calendar-check","Mal kabul tarihi",pt(l.receiptDate)]]:[],...l.createdBy?[["ph-user","Talebi açan",l.createdBy]]:[],...l.approvedBy?[["ph-user-check","Onaylayan",`${l.approvedBy} · ${pt(l.approvedAt)}`]]:[]];e.innerHTML=`
      <button class="btn btn-outline btn-sm" id="pm-back" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Geri</button>
      <div class="card pm2-detail-head ${v?"is-late":""}">
        <div>
          <div class="pm2-id" style="font-size:18px;"><i class="ph ph-file-text"></i> ${u(l.id)}
            ${Ne()&&l.urgency&&l.urgency!=="routine"?`<span class="pm2-urg" style="--u:${c.color}"><i class="ph ${c.icon}"></i> ${c.label}</span>`:""}</div>
          <div class="pm2-supplier" style="font-size:14px;">${u(l.supplierName)}</div>
        </div>
        <div class="pm2-detail-total"><span class="pm-status-badge" style="background:${p.bg}; color:${p.color}; font-size:13px; padding:6px 14px;"><i class="ph ${p.icon}"></i> ${p.label}</span>
          <b>${Le(l.totalGross,l.currency)}</b></div>
      </div>
      ${l.status==="cancelled"?`<div class="card fin-err" style="margin:12px 0;"><i class="ph ph-x-circle"></i> Bu sipariş iptal edildi${l.cancelReason?`: ${u(l.cancelReason)}`:"."}</div>`:`
      <div class="pm2-flow">${L.map(([f,x,A],j)=>`<div class="pm2-step ${q>=j?"done":""} ${Math.ceil(q)===j&&q%1?"half":""}"><span><i class="ph ${A}"></i></span><small>${x}</small></div>`).join('<i class="pm2-flow-line"></i>')}</div>`}
      <div class="pm2-meta-grid">${g.map(([f,x,A])=>`<div class="pm2-meta-item"><i class="ph ${f}"></i><span>${u(x)}</span><b>${u(A)}</b></div>`).join("")}
        ${l.notes?`<div class="pm2-meta-item" style="grid-column:1/-1;"><i class="ph ph-note"></i><span>Not</span><b>${u(l.notes)}</b></div>`:""}</div>
      ${b>0?`<div style="margin:4px 0 16px;"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;"><span>Teslim alınan</span><b>%${b}</b></div>
        <div class="pm-progress-bar pm-progress-bar-lg"><div class="pm-progress-fill" style="width:${b}%; background:${p.color};"></div></div></div>`:""}
      <div class="card" style="margin-bottom:16px; overflow:hidden;">
        <div class="pm2-card-title"><i class="ph ph-list-bullets"></i> Sipariş kalemleri <small>${l.lines.length} kalem</small></div>
        <div style="overflow-x:auto;">
          <table class="pm-table">
            <thead><tr><th>Malzeme</th><th class="right">Miktar</th><th class="right">Teslim</th><th class="right">B. Fiyat</th><th class="right">İsk.</th><th class="right">KDV</th><th class="right">Toplam</th></tr></thead>
            <tbody>${l.lines.map(f=>{const x=qs(f),A=x*((f.taxRate||0)/100),j=f.receivedQty>=f.qty;return`<tr><td><div style="font-weight:600; font-size:13px;">${u(f.productName)}</div><div style="font-size:11px; color:var(--text-secondary);">${u(f.productCode)}</div></td>
                <td class="right">${f.qty} ${u(f.unit)}</td><td class="right"><span style="color:${j?"#4CAF50":"#FF9800"}; font-weight:600;">${f.receivedQty||0} ${u(f.unit)}</span></td>
                <td class="right">${Le(f.unitPrice,l.currency)}</td><td class="right">%${f.discount||0}</td><td class="right">%${f.taxRate||0}</td>
                <td class="right" style="font-weight:700;">${Le(x+A,l.currency)}</td></tr>`}).join("")}</tbody>
            <tfoot>
              <tr><td colspan="6" style="text-align:right; padding:10px 16px; font-weight:600;">Ara toplam</td><td class="right" style="font-weight:600;">${Le(l.totalNet,l.currency)}</td></tr>
              <tr><td colspan="6" style="text-align:right; padding:6px 16px; color:var(--text-secondary);">KDV</td><td class="right" style="color:var(--text-secondary);">${Le(l.totalTax,l.currency)}</td></tr>
              <tr style="background:var(--bg-elevated, #f8f9fa);"><td colspan="6" style="text-align:right; padding:12px 16px; font-weight:700; font-size:16px;">Genel toplam</td><td class="right" style="font-weight:700; font-size:16px; color:var(--primary);">${Le(l.totalGross,l.currency)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="pm-action-row">
        ${o?'<button class="btn btn-primary" id="pm-approve-order"><i class="ph ph-check"></i> Onayla</button>':""}
        ${m?'<button class="btn btn-success" id="pm-receive-order"><i class="ph ph-package"></i> Mal kabul</button>':""}
        ${h?'<button class="btn btn-danger" id="pm-cancel-order"><i class="ph ph-x"></i> İptal et</button>':""}
      </div>
      <div id="pm-receive-form" style="display:none; margin-top:16px;"></div>`,e.querySelector("#pm-back").addEventListener("click",a);const E=()=>Oa(e,t);(s=e.querySelector("#pm-approve-order"))==null||s.addEventListener("click",async f=>{var j;const x=f.currentTarget;x.disabled=!0,x.innerHTML=sa;const A=await C.post(`/purchase-orders/${encodeURIComponent(t)}/approve`,{approvedBy:((j=ke.getUser())==null?void 0:j.name)||"Kullanıcı"}).catch(M=>({success:!1,message:M.message}));R(A.message||(A.success?"Onaylandı":"Hata"),A.success?"success":"error"),A.success?E():(x.disabled=!1,x.innerHTML='<i class="ph ph-check"></i> Onayla')}),(n=e.querySelector("#pm-cancel-order"))==null||n.addEventListener("click",async()=>{if(!await Se({title:"Sipariş iptal edilsin mi?",message:"İptal edilen sipariş için mal kabul yapılamaz.",confirmLabel:"Siparişi iptal et",danger:!0}))return;const f=await C.post(`/purchase-orders/${encodeURIComponent(t)}/cancel`,{reason:"Kullanıcı tarafından iptal edildi"}).catch(x=>({success:!1,message:x.message}));R(f.message||"Hata",f.success?"success":"error"),f.success&&E()}),(r=e.querySelector("#pm-receive-order"))==null||r.addEventListener("click",()=>{const f=e.querySelector("#pm-receive-form");f.style.display="block",gn(f,l,E),f.scrollIntoView({behavior:"smooth",block:"start"})})}catch(d){e.innerHTML=`<button class="btn btn-outline btn-sm" id="pm-back-err" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Siparişlere dön</button><div style="color:var(--error); padding:20px;">Hata: ${u(d.message)}</div>`,e.querySelector("#pm-back-err").addEventListener("click",a)}}function gn(e,t,a){const i=z.purchaseConfig||{},s=i.requireInvoiceForReceive!==!1,n=i.allowPartialReceive!==!1;e.innerHTML=`
    <div class="card" style="border-left:4px solid #4CAF50; padding:16px;">
      <div style="font-weight:700; font-size:15px; margin-bottom:14px; color:#4CAF50;"><i class="ph ph-package"></i> Mal kabul — ${u(t.warehouseName||"ambar")}</div>
      <div class="form-group" style="margin-bottom:12px;">
        <label style="font-size:13px; font-weight:600;">İrsaliye / fatura no${s?" *":""}</label>
        <input type="text" class="input-element" id="receive-invoice" placeholder="Örn: FTR-2026-0142" value="${u(t.invoiceNo||"")}" />
      </div>
      <div style="font-weight:600; font-size:13px; margin-bottom:10px;">Teslim alınan miktarlar</div>
      ${n?"":'<div style="font-size:12px; color:var(--warning); margin-bottom:10px;"><i class="ph ph-info"></i> Kısmi mal kabul kapalı: kalan miktarın tamamı teslim alınır.</div>'}
      ${t.lines.map(r=>{const d=(r.qty||0)-(r.receivedQty||0);return`<div class="pm-receive-line"><div class="pm-receive-line-info"><div style="font-weight:600; font-size:13px;">${u(r.productName)}</div>
            <div style="font-size:11px; color:var(--text-secondary);">Sipariş: ${r.qty} ${u(r.unit)} · Önceki teslim: ${r.receivedQty||0} · Kalan: ${d}</div></div>
          <input type="number" class="input-element receive-qty-input" data-line-id="${u(r.id)}" min="0" max="${d}" value="${d}" style="width:90px; text-align:center;" ${d<=0||!n?"disabled":""} />
          <span style="font-size:12px; color:var(--text-secondary); min-width:40px;">${u(r.unit)}</span></div>`}).join("")}
      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="receive-cancel-btn"><i class="ph ph-x"></i> Vazgeç</button>
        <button class="btn btn-success" id="receive-submit-btn"><i class="ph ph-check"></i> Mal kabulü kaydet</button>
      </div>
    </div>`,e.querySelector("#receive-cancel-btn").addEventListener("click",()=>{e.style.display="none"}),e.querySelector("#receive-submit-btn").addEventListener("click",async()=>{const r=e.querySelector("#receive-invoice").value.trim();if(s&&!r)return R("İrsaliye / fatura numarası zorunludur","warning");const d=[];if(e.querySelectorAll(".receive-qty-input").forEach(c=>{const o=n?parseFloat(c.value)||0:parseFloat(c.max)||0;o>0&&d.push({lineId:c.dataset.lineId,qty:o})}),!d.length)return R("En az bir kalem için miktar girin","warning");const l=e.querySelector("#receive-submit-btn");l.disabled=!0,l.innerHTML=`${sa} Kaydediliyor...`;const p=await C.post(`/purchase-orders/${encodeURIComponent(t.id)}/receive`,{invoiceNo:r,receivedLines:d,allowUnapproved:i.requireApproval===!1}).catch(c=>({success:!1,message:c.message}));p.success?(R(p.message,"success"),a()):(R(p.message||"Hata oluştu","error"),l.disabled=!1,l.innerHTML='<i class="ph ph-check"></i> Mal kabulü kaydet')})}async function Ns(e,{fromList:t=!1}={}){const a=()=>t?W.back():W.navigate("purchase-module?tab=orders");e.innerHTML=gt();try{const[i,s,n,r,d]=await Promise.all([C.get("/suppliers"),C.get("/warehouses"),C.get("/products").catch(()=>({})),C.get("/raw-materials").catch(()=>({})),Ne()?C.get("/customers").catch(()=>({})):Promise.resolve({})]),l=i.success?i.data.filter(f=>f.status==="active"):[],p=s.success?s.data:[],c=d.success?d.data.filter(f=>/^GM/.test(String(f.id))):[],o=[...n.success?n.data.map(f=>({code:f.code,name:f.name,unit:f.unit,price:f.price||0,cat:f.category})):[],...r.success?r.data.map(f=>({code:f.code,name:f.name,unit:f.unit,price:0})):[]],m=()=>({id:"l"+Date.now()+Math.floor(Math.random()*99),productCode:"",productName:"",unit:"Adet",qty:1,unitPrice:0,taxRate:20,discount:0});let h=[m()],b="routine";e.innerHTML=`
      <button class="btn btn-outline btn-sm" id="pm-back-new" style="margin-bottom:14px;"><i class="ph ph-arrow-left"></i> Siparişlere dön</button>
      ${Ne()?`
      <div class="card pm2-form-card">
        <div class="pm2-card-title"><i class="ph ph-clipboard-text"></i> Talep bilgisi</div>
        <div class="pm-form-grid">
          <div class="form-group"><label>Talep kaynağı</label><select class="input-element" id="po-vessel"><option value="">Ambar stoğu (depoya alım)</option><optgroup label="Gemi talebi">${c.map(f=>`<option value="${u(f.id)}">${u(f.name)}</option>`).join("")}</optgroup></select>
            <small class="pm2-hint">Mal teslim ambarına girer; gemi seçilirse sipariş o geminin talebi olarak izlenir.</small></div>
          <div class="form-group"><label>Talep no</label><input type="text" class="input-element" id="po-req" maxlength="40" placeholder="Örn: RQ-FRC-2026-041 / AMB-2026-012" /></div>
          <div class="form-group"><label>Teslim yeri</label><select class="input-element" id="po-port"><option value="">Teslim ambarı</option>${pn.map(f=>`<option>${u(f)}</option>`).join("")}</select></div>
        </div>
        <label class="pm2-label">Aciliyet</label>
        <div class="sx-chips pm2-urgency">${Object.entries(Qt).map(([f,x])=>`<button type="button" class="sx-chip ${f===b?"on":""}" data-u="${f}" style="--u:${x.color}"><i class="ph ${x.icon}"></i> ${x.label}</button>`).join("")}</div>
      </div>`:""}
      <div class="card pm2-form-card">
        <div class="pm2-card-title"><i class="ph ph-buildings"></i> Tedarikçi ve teslimat</div>
        <div class="pm-form-grid">
          <div class="form-group"><label>Tedarikçi *</label><select class="input-element" id="po-supplier"><option value="">Seçiniz...</option>
            ${l.map(f=>`<option value="${u(f.id)}" data-currency="${u(f.currency)}" data-term="${u(f.paymentTerm)}">${u(f.name)}${f.category?` — ${u(f.category)}`:""}</option>`).join("")}</select>
            <small class="pm2-hint" id="po-sup-hint"></small></div>
          <div class="form-group"><label>Beklenen teslim *</label><input type="date" class="input-element" id="po-expected-date" value="${new Date(Date.now()+7*864e5).toISOString().slice(0,10)}" /></div>
          <div class="form-group"><label>Teslim ambarı *</label><select class="input-element" id="po-warehouse"><option value="">Seçiniz...</option>${p.map(f=>`<option value="${u(f.id)}">${u(f.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Para birimi</label><select class="input-element" id="po-currency"><option value="TRY">₺ TRY</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option></select></div>
        </div>
        <div class="form-group"><label>Not</label><input type="text" class="input-element" id="po-notes" maxlength="300" placeholder="${Ne()?"Örn: Gemi Aliağa demirinde, acente üzerinden lançla teslim":"İsteğe bağlı not"}" /></div>
      </div>
      <div class="card" style="margin-bottom:16px; overflow:hidden;">
        <div class="pm2-card-title" style="justify-content:space-between;"><span><i class="ph ph-list-bullets"></i> Sipariş kalemleri</span><button class="btn btn-outline btn-sm" id="add-po-line"><i class="ph ph-plus"></i> Kalem ekle</button></div>
        <datalist id="po-catalog-codes">${o.map(f=>`<option value="${u(f.code)}">${u(f.name)}</option>`).join("")}</datalist>
        <datalist id="po-catalog-names">${o.map(f=>`<option value="${u(f.name)}">${u(f.code)}${f.cat?` · ${u(f.cat)}`:""}</option>`).join("")}</datalist>
        <div class="pm2-line-head"><span>Kod</span><span>Malzeme</span><span>Birim</span><span>Miktar</span><span>B. fiyat</span><span>KDV %</span><span>İsk. %</span><span></span></div>
        <div id="po-lines-container" style="padding:4px 16px 12px;"></div>
        <div style="padding:12px 16px; border-top:1px solid var(--border); text-align:right;"><div id="po-totals"></div></div>
      </div>
      <div class="pm-action-row">
        <button class="btn btn-outline" id="po-save-draft"><i class="ph ph-floppy-disk"></i> Taslak kaydet</button>
        <button class="btn btn-primary" id="po-save-submit"><i class="ph ph-paper-plane-tilt"></i> Onaya gönder</button>
      </div>`;const v=f=>e.querySelector(f),L=v("#po-lines-container"),q=()=>{L.innerHTML=h.map(f=>`
        <div class="pm-line-row" data-line-id="${f.id}">
          <div class="pm-line-fields">
            <input type="text" class="input-element" placeholder="Kod" value="${u(f.productCode)}" data-field="productCode" list="po-catalog-codes" autocomplete="off" aria-label="Malzeme kodu" />
            <input type="text" class="input-element" placeholder="Malzeme adı *" value="${u(f.productName)}" data-field="productName" list="po-catalog-names" autocomplete="off" style="flex:2;" aria-label="Malzeme adı" />
            <input type="text" class="input-element" placeholder="Birim" value="${u(f.unit)}" data-field="unit" style="width:70px;" aria-label="Birim" />
            <input type="number" class="input-element" placeholder="Miktar" value="${f.qty}" min="0.01" step="0.01" data-field="qty" style="width:90px;" aria-label="Miktar" />
            <input type="number" class="input-element" placeholder="B.Fiyat" value="${f.unitPrice}" min="0" step="0.01" data-field="unitPrice" style="width:100px;" aria-label="Birim fiyat" />
            <input type="number" class="input-element" placeholder="KDV%" value="${f.taxRate}" min="0" max="100" data-field="taxRate" style="width:70px;" aria-label="KDV oranı" />
            <input type="number" class="input-element" placeholder="İsk.%" value="${f.discount}" min="0" max="100" data-field="discount" style="width:70px;" aria-label="İskonto" />
          </div>
          ${h.length>1?`<button class="pm-remove-line-btn" data-line-id="${f.id}" title="Kalemi sil"><i class="ph ph-x-circle"></i></button>`:""}
        </div>`).join(""),g()},g=()=>{let f=0,x=0;h.forEach(j=>{const M=qs(j);f+=M,x+=M*((j.taxRate||0)/100)});const A=v("#po-currency").value||"TRY";v("#po-totals").innerHTML=`<div style="font-size:13px; color:var(--text-secondary);">Ara toplam: ${Le(f,A)} · KDV: ${Le(x,A)}</div>
        <div style="font-size:16px; font-weight:700; color:var(--primary); margin-top:4px;">Genel toplam: ${Le(f+x,A)}</div>`};L.addEventListener("input",f=>{const x=f.target.closest("input[data-field]");if(!x)return;const A=x.closest(".pm-line-row"),j=h.find(S=>S.id===A.dataset.lineId);if(!j)return;const M=x.dataset.field;if(j[M]=["qty","unitPrice","taxRate","discount"].includes(M)?parseFloat(x.value)||0:x.value,M==="productCode"||M==="productName"){const S=o.find(N=>(M==="productCode"?N.code:N.name)===x.value);S&&(Object.assign(j,{productCode:S.code,productName:S.name,unit:S.unit}),!j.unitPrice&&S.price&&(j.unitPrice=S.price),A.querySelectorAll("input[data-field]").forEach(N=>{N!==x&&j[N.dataset.field]!==void 0&&(N.value=j[N.dataset.field])}))}g()}),L.addEventListener("click",f=>{const x=f.target.closest(".pm-remove-line-btn");x&&(h=h.filter(A=>A.id!==x.dataset.lineId),q())}),v("#add-po-line").addEventListener("click",()=>{h.push(m()),q()}),v("#po-currency").addEventListener("change",g),v("#po-supplier").addEventListener("change",f=>{const x=f.target.selectedOptions[0];x&&x.dataset.currency&&(v("#po-currency").value=x.dataset.currency==="TL"?"TRY":x.dataset.currency),v("#po-sup-hint").textContent=x&&x.value?`${x.dataset.currency||"TRY"} · ${Number(x.dataset.term)?`${x.dataset.term} gün vade`:"peşin"}`:"",g()}),e.querySelectorAll(".pm2-urgency .sx-chip").forEach(f=>f.addEventListener("click",()=>{if(b=f.dataset.u,e.querySelectorAll(".pm2-urgency .sx-chip").forEach(x=>x.classList.toggle("on",x===f)),b==="urgent"){const x=v("#po-expected-date");x.value>new Date(Date.now()+2*864e5).toISOString().slice(0,10)&&(x.value=new Date(Date.now()+2*864e5).toISOString().slice(0,10))}})),v("#pm-back-new").addEventListener("click",a);async function E(f){var V,J,ae,P,U;const x=v("#po-supplier"),A=v("#po-warehouse"),j=((V=v("#po-vessel"))==null?void 0:V.value)||"";if(!x.value)return R("Tedarikçi seçin","warning");if(!A.value)return R("Teslim ambarını seçin","warning");const M=v("#po-expected-date").value;if(!M)return R("Beklenen teslim tarihini girin","warning");const S=h.filter(Q=>Q.productName&&Q.qty>0);if(!S.length)return R("En az bir malzeme kalemi ekleyin","warning");const N=v(f==="draft"?"#po-save-draft":"#po-save-submit"),B=N.innerHTML;N.disabled=!0,N.innerHTML=sa;const O=ke.getUser(),F=await C.post("/purchase-orders",{supplierId:x.value,supplierName:((J=l.find(Q=>Q.id===x.value))==null?void 0:J.name)||"",orderDate:Ct(),expectedDate:M,warehouseId:A.value,warehouseName:((ae=A.selectedOptions[0])==null?void 0:ae.text)||"",currency:v("#po-currency").value||"TRY",notes:v("#po-notes").value||"",status:f,vesselId:j,requisitionNo:((P=v("#po-req"))==null?void 0:P.value)||"",port:((U=v("#po-port"))==null?void 0:U.value)||"",urgency:b,lines:S.map((Q,ee)=>({...Q,id:"L"+(ee+1),receivedQty:0})),createdBy:(O==null?void 0:O.name)||"Kullanıcı"}).catch(Q=>({success:!1,message:Q.message}));F.success?(R(F.message,"success"),a()):(R(F.message||"Hata oluştu","error"),N.disabled=!1,N.innerHTML=B)}v("#po-save-draft").addEventListener("click",()=>E("draft")),v("#po-save-submit").addEventListener("click",()=>E("pending")),q()}catch(i){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${u(i.message)}</div>`}}async function Cs(e){e.innerHTML=gt();try{let d=function(){const l=[...new Set(i.map(m=>m.category).filter(Boolean))].sort((m,h)=>m.localeCompare(h,"tr")),p=i.filter(m=>(!n.status||m.status===n.status)&&(!n.cat||m.category===n.cat)&&(!n.q||[m.name,m.contactPerson,m.code,m.email,m.address].some(h=>String(h||"").toLocaleLowerCase("tr").includes(n.q)))),c=i.filter(m=>m.status==="active");e.innerHTML=`
        <div class="pm2-kpis">
          <div class="pm2-kpi" style="--k:#2196F3"><span class="pm2-kpi-ic"><i class="ph ph-buildings"></i></span><div><b>${c.length}</b><small>Aktif tedarikçi</small></div></div>
          <div class="pm2-kpi" style="--k:#8B5CF6"><span class="pm2-kpi-ic"><i class="ph ph-tag"></i></span><div><b>${l.length}</b><small>Kategori</small></div></div>
          <div class="pm2-kpi" style="--k:#E08A00"><span class="pm2-kpi-ic"><i class="ph ph-folder-open"></i></span><div><b>${s.filter(jt).length}</b><small>Açık sipariş</small></div></div>
          <div class="pm2-kpi" style="--k:#0E7A74"><span class="pm2-kpi-ic"><i class="ph ph-globe-hemisphere-west"></i></span><div><b>${c.filter(m=>m.currency&&!["TRY","TL"].includes(m.currency)).length}</b><small>Yurt dışı (döviz)</small></div></div>
        </div>
        <div class="pm2-toolbar">
          <div class="input-field pm2-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input type="search" class="input-element" id="sup-search" placeholder="Tedarikçi, yetkili, kod veya şehir ara…" value="${u(n.q)}" /></div>
          <div class="input-field pm2-vessel-filter"><span class="input-icon"><i class="ph ph-funnel"></i></span><select class="input-element" id="sup-status">
            <option value="active" ${n.status==="active"?"selected":""}>Aktif</option><option value="passive" ${n.status==="passive"?"selected":""}>Pasif</option><option value="" ${n.status?"":"selected"}>Tümü</option></select></div>
          <button class="btn btn-primary btn-sm" id="sup-add-btn"><i class="ph ph-plus"></i> Yeni tedarikçi</button>
        </div>
        <div class="pm-filter-bar"><button class="pm-filter-btn ${n.cat?"":"active"}" data-cat=""><i class="ph ph-squares-four"></i> <span>Tüm kategoriler</span></button>
          ${l.map(m=>`<button class="pm-filter-btn ${n.cat===m?"active":""}" data-cat="${u(m)}"><span>${u(m)}</span><span class="pm-filter-count">${i.filter(h=>h.category===m&&(!n.status||h.status===n.status)).length}</span></button>`).join("")}</div>
        ${n.showForm?yn(n.editId,i):""}
        ${p.length?`<div class="pm2-sup-grid">${p.map((m,h)=>{const b=r(m.id);return`<div class="pm-supplier-card pm2-sup animate-fade-in-up stagger-${Math.min(h+1,5)}" data-id="${u(m.id)}">
            <div class="pm2-sup-head">
              <div class="pm-supplier-avatar" style="background:${m.status==="active"?"color-mix(in srgb, var(--primary) 12%, transparent)":"#9E9E9E18"}; color:${m.status==="active"?"var(--primary)":"#9E9E9E"};">${u(m.name.charAt(0).toLocaleUpperCase("tr"))}</div>
              <div style="min-width:0; flex:1;"><div class="pm-supplier-name">${u(m.name)}</div><div class="pm2-sup-sub">${u(m.code||"")}${m.category?` · ${u(m.category)}`:""}</div></div>
              <button class="icon-btn sup-edit-btn" data-id="${u(m.id)}" title="Düzenle" aria-label="Düzenle"><i class="ph ph-pencil"></i></button>
            </div>
            <div class="pm2-sup-lines">
              ${m.contactPerson?`<span><i class="ph ph-user"></i> ${u(m.contactPerson)}</span>`:""}
              ${m.phone?`<span><i class="ph ph-phone"></i> ${u(m.phone)}</span>`:""}
              ${m.email?`<span><i class="ph ph-envelope-simple"></i> ${u(m.email)}</span>`:""}
              ${m.address?`<span><i class="ph ph-map-pin"></i> ${u(m.address)}</span>`:""}
            </div>
            <div class="pm2-sup-foot">
              <span class="pm2-chip"><i class="ph ph-currency-circle-dollar"></i> ${u(m.currency||"TRY")}</span>
              <span class="pm2-chip"><i class="ph ph-calendar-check"></i> ${Number(m.paymentTerm)?`${m.paymentTerm} gün vade`:"Peşin"}</span>
              <span class="pm2-chip"><i class="ph ph-list-numbers"></i> ${m.totalOrders||0} sipariş</span>
              ${b.length?`<span class="pm2-chip pm2-vessel"><i class="ph ph-folder-open"></i> ${b.length} açık</span>`:""}
              ${m.status!=="active"?'<span class="pm2-chip" style="color:#9E9E9E;"><i class="ph ph-archive"></i> Pasif</span>':""}
            </div>
          </div>`}).join("")}</div>`:'<div class="pm-empty"><i class="ph ph-buildings" style="font-size:48px; opacity:.3;"></i><p style="color:var(--text-secondary); margin-top:12px;">Tedarikçi bulunamadı</p></div>'}`;const o=e.querySelector("#sup-search");o.addEventListener("input",()=>{n.q=o.value.trim().toLocaleLowerCase("tr");const m=o.selectionStart;d();const h=e.querySelector("#sup-search");h.focus(),h.setSelectionRange(m,m)}),e.querySelector("#sup-status").addEventListener("change",m=>{n.status=m.target.value,d()}),e.querySelectorAll(".pm-filter-btn[data-cat]").forEach(m=>m.addEventListener("click",()=>{n.cat=m.dataset.cat,d()})),e.querySelector("#sup-add-btn").addEventListener("click",()=>{var m;n.showForm=!n.showForm,n.editId=null,d(),n.showForm&&((m=e.querySelector("#sup-form-card"))==null||m.scrollIntoView({behavior:"smooth"}))}),e.querySelectorAll(".sup-edit-btn").forEach(m=>m.addEventListener("click",h=>{var b;h.stopPropagation(),n.editId=m.dataset.id,n.showForm=!0,d(),(b=e.querySelector("#sup-form-card"))==null||b.scrollIntoView({behavior:"smooth"})})),n.showForm&&kn(e,n.editId,i,async m=>{if(m){const h=await C.get("/suppliers");h.success&&(i=h.data)}n.showForm=!1,n.editId=null,d()})};const[t,a]=await Promise.all([C.get("/suppliers"),C.get("/purchase-orders").catch(()=>({}))]);let i=t.success?t.data:[];const s=a.success?a.data:[],n={q:"",cat:"",status:"active",showForm:!1,editId:null},r=l=>s.filter(p=>p.supplierId===l&&jt(p));d()}catch(t){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${u(t.message)}</div>`}}function yn(e,t){const a=e?t.find(n=>n.id===e):null,i=hn(),s=a!=null&&a.category&&!i.includes(a.category)?[a.category,...i]:i;return`
    <div class="card pm-form-card" id="sup-form-card" style="margin-bottom:16px; padding:20px; border-left:4px solid var(--primary);">
      <h3 style="margin:0 0 16px; font-size:15px; color:var(--primary);"><i class="ph ph-${e?"pencil":"plus-circle"}"></i> ${e?"Tedarikçiyi düzenle":"Yeni tedarikçi"}</h3>
      <div class="pm-form-grid">
        <div class="form-group"><label>Firma adı *</label><input type="text" class="input-element" id="sup-name" value="${u((a==null?void 0:a.name)||"")}" placeholder="Firma ünvanı" /></div>
        <div class="form-group"><label>Yetkili kişi</label><input type="text" class="input-element" id="sup-contact" value="${u((a==null?void 0:a.contactPerson)||"")}" placeholder="Ad Soyad" /></div>
        <div class="form-group"><label>Telefon</label><input type="text" class="input-element" id="sup-phone" value="${u((a==null?void 0:a.phone)||"")}" placeholder="+90 5XX XXX XX XX" /></div>
        <div class="form-group"><label>E-posta</label><input type="email" class="input-element" id="sup-email" value="${u((a==null?void 0:a.email)||"")}" placeholder="ornek@firma.com" /></div>
        <div class="form-group"><label>Vergi no</label><input type="text" class="input-element" id="sup-taxno" value="${u((a==null?void 0:a.taxNo)||"")}" /></div>
        <div class="form-group"><label>Kategori</label><select class="input-element" id="sup-category">${s.map(n=>`<option ${((a==null?void 0:a.category)||"Diğer")===n?"selected":""}>${u(n)}</option>`).join("")}</select></div>
        <div class="form-group"><label>Para birimi</label><select class="input-element" id="sup-currency">${["TRY","USD","EUR"].map(n=>`<option ${((a==null?void 0:a.currency)||"TRY")===n?"selected":""}>${n}</option>`).join("")}</select></div>
        <div class="form-group"><label>Ödeme vadesi</label><select class="input-element" id="sup-term">${[0,7,15,30,45,60,90].map(n=>`<option value="${n}" ${Number((a==null?void 0:a.paymentTerm)??30)===n?"selected":""}>${n===0?"Peşin":n+" gün"}</option>`).join("")}</select></div>
      </div>
      <div class="form-group"><label>Adres</label><input type="text" class="input-element" id="sup-address" value="${u((a==null?void 0:a.address)||"")}" placeholder="İlçe, şehir / ülke" /></div>
      <div class="pm-action-row" style="margin-top:16px;">
        <button class="btn btn-outline" id="sup-form-cancel"><i class="ph ph-x"></i> Vazgeç</button>
        ${e?`<button class="btn btn-outline" id="sup-form-passive" style="margin-right:auto; color:var(--error); border-color:var(--error);"><i class="ph ph-archive"></i> ${(a==null?void 0:a.status)==="passive"?"Aktife al":"Pasife al"}</button>`:""}
        <button class="btn btn-primary" id="sup-form-save"><i class="ph ph-floppy-disk"></i> Kaydet</button>
      </div>
    </div>`}function kn(e,t,a,i){var n;const s=a.find(r=>r.id===t)||{};e.querySelector("#sup-form-cancel").addEventListener("click",()=>i(!1)),(n=e.querySelector("#sup-form-passive"))==null||n.addEventListener("click",async()=>{const r=s.status!=="passive";if(!(r&&!await Se({title:"Tedarikçi pasife alınsın mı?",message:"Pasif tedarikçi yeni siparişlerde görünmez; geçmiş siparişleri etkilenmez.",confirmLabel:"Pasife al",danger:!0})))try{const d=await C.put(`/suppliers/${encodeURIComponent(t)}`,{...s,status:r?"passive":"active"});d.success?(R(r?"Tedarikçi pasife alındı":"Tedarikçi aktife alındı","success"),i(!0)):R(d.message||"Hata","error")}catch(d){R(d.message,"error")}}),e.querySelector("#sup-form-save").addEventListener("click",async()=>{const r=o=>{var m;return(m=e.querySelector(o))==null?void 0:m.value.trim()},d=r("#sup-name");if(!d)return R("Firma adı zorunludur","warning");const l={name:d,contactPerson:r("#sup-contact"),phone:r("#sup-phone"),email:r("#sup-email"),taxNo:r("#sup-taxno"),category:r("#sup-category"),currency:r("#sup-currency"),paymentTerm:parseInt(r("#sup-term"),10)||0,address:r("#sup-address"),status:s.status||"active"},p=e.querySelector("#sup-form-save");p.disabled=!0,p.innerHTML=sa;let c;try{c=t?await C.put(`/suppliers/${encodeURIComponent(t)}`,l):await C.post("/suppliers",l)}catch(o){c={success:!1,message:o.message}}c.success?(R(c.message||"Kaydedildi","success"),i(!0)):(R(c.message||"Hata","error"),p.disabled=!1,p.innerHTML='<i class="ph ph-floppy-disk"></i> Kaydet')})}async function $n(e){e.innerHTML=gt();try{const[t,a]=await Promise.all([C.get("/purchase-orders"),C.get("/suppliers")]),i=t.success?t.data:[],s=a.success?a.data:[],n=i.filter(v=>v.status!=="cancelled"),r=n.reduce((v,L)=>v+Ht(L),0),d=n.filter(v=>String(v.orderDate).slice(0,4)===Ct().slice(0,4)).reduce((v,L)=>v+Ht(L),0),l=v=>Object.entries(n.reduce((L,q)=>{const g=v(q);return g&&(L[g]=(L[g]||0)+Ht(q)),L},{})).sort((L,q)=>q[1]-L[1]),p=Object.fromEntries(s.map(v=>[v.id,v.category])),c=(v,L)=>{var g;const q=((g=v[0])==null?void 0:g[1])||1;return v.length?v.slice(0,6).map(([E,f])=>`<div class="pm2-bar"><div class="pm2-bar-top"><span>${u(E)}</span><b>${Le(f)}</b></div>
        <div class="pm-progress-bar"><div class="pm-progress-fill" style="width:${Math.max(3,Math.round(f/q*100))}%; background:${L};"></div></div></div>`).join(""):'<div style="color:var(--text-secondary); text-align:center; padding:20px;">Veri yok</div>'},o=[];for(let v=5;v>=0;v--){const L=new Date;L.setDate(1),L.setMonth(L.getMonth()-v),o.push(L.toISOString().slice(0,7))}const m=o.map(v=>n.filter(L=>String(L.orderDate).slice(0,7)===v).reduce((L,q)=>L+Ht(q),0)),h=Math.max(1,...m),b=i.filter(dt);e.innerHTML=`
      <div class="pm2-kpis">
        <div class="pm2-kpi" style="--k:var(--primary)"><span class="pm2-kpi-ic"><i class="ph ph-coins"></i></span><div><b>${Le(d)}</b><small>Bu yıl alım (TL karşılığı)</small></div></div>
        <div class="pm2-kpi" style="--k:#2196F3"><span class="pm2-kpi-ic"><i class="ph ph-list-numbers"></i></span><div><b>${n.length}</b><small>Sipariş (iptal hariç)</small></div></div>
        <div class="pm2-kpi" style="--k:#4CAF50"><span class="pm2-kpi-ic"><i class="ph ph-check-fat"></i></span><div><b>${i.filter(v=>v.status==="received").length}</b><small>Teslim alındı</small></div></div>
        <div class="pm2-kpi" style="--k:#D93A3A"><span class="pm2-kpi-ic"><i class="ph ph-warning"></i></span><div><b>${b.length}</b><small>Geciken teslimat</small></div></div>
      </div>
      <div class="pm2-sum-grid">
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-chart-bar"></i> Aylık alım <small>TL karşılığı, son 6 ay</small></div>
          <div class="pm2-cols">${o.map((v,L)=>`<div class="pm2-col" title="${Le(m[L])}"><div class="pm2-col-bar" style="height:${Math.max(2,Math.round(m[L]/h*100))}%"></div><small>${new Date(`${v}-01T00:00:00`).toLocaleDateString("tr-TR",{month:"short"})}</small></div>`).join("")}</div></div>
        ${Ne()?`<div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-boat"></i> Gemi bazlı alım</div>${c(l(v=>v.vesselName),"var(--primary)")}</div>`:""}
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-tag"></i> Malzeme kategorisi</div>${c(l(v=>p[v.supplierId]),"#0E7A74")}</div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-buildings"></i> Tedarikçi bazlı alım</div>${c(l(v=>v.supplierName),"#8B5CF6")}</div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-chart-pie"></i> Sipariş durumu</div>
          <div class="pm-status-grid">${Object.entries(ht).map(([v,L])=>`<div class="pm-status-item"><span class="pm-status-dot" style="background:${L.color};"></span><span style="flex:1; font-size:13px;">${L.label}</span><b>${i.filter(q=>q.status===v).length}</b></div>`).join("")}</div></div>
        <div class="card pm2-panel"><div class="pm2-card-title"><i class="ph ph-warning"></i> Geciken teslimatlar</div>
          ${b.length?b.map(v=>`<a class="pm2-late-row" href="#/purchase-module?tab=orders&po=${encodeURIComponent(v.id)}"><b>${u(v.id)}</b><span>${u(v.supplierName)}${v.vesselName?` · ${u(v.vesselName)}`:""}</span><em>${-Ka(v.expectedDate)} gün</em></a>`).join(""):'<div style="color:var(--text-secondary); padding:12px 0;"><i class="ph ph-check-circle" style="color:#4CAF50;"></i> Geciken teslimat yok</div>'}</div>
      </div>
      <div class="pm2-note"><i class="ph ph-info"></i> Döviz siparişleri sipariş kuruyla TL karşılığına çevrilerek toplanır. Toplam (iptal hariç): <b>${Le(r)}</b></div>`}catch(t){e.innerHTML=`<div style="color:var(--error); padding:20px;">Hata: ${u(t.message)}</div>`}}const wn=(()=>{const e=new Uint32Array(256);for(let t=0;t<256;t++){let a=t;for(let i=0;i<8;i++)a=a&1?3988292384^a>>>1:a>>>1;e[t]=a>>>0}return e})();function xn(e){let t=4294967295;for(let a=0;a<e.length;a++)t=wn[(t^e[a])&255]^t>>>8;return(t^4294967295)>>>0}function Sn(e){const t=new TextEncoder,a=[],i=[];let s=0;const n=m=>[m&255,m>>>8&255],r=m=>[m&255,m>>>8&255,m>>>16&255,m>>>24&255],d=0,l=33;for(const m of e){const h=t.encode(m.name),b=xn(m.data),v=m.data.length,L=[...r(67324752),...n(20),...n(0),...n(0),...n(d),...n(l),...r(b),...r(v),...r(v),...n(h.length),...n(0)];a.push(new Uint8Array(L),h,m.data),i.push([...r(33639248),...n(20),...n(20),...n(0),...n(0),...n(d),...n(l),...r(b),...r(v),...r(v),...n(h.length),...n(0),...n(0),...n(0),...n(0),...r(0),...r(s)]),i.push(h),s+=L.length+h.length+v}const p=[];let c=0;for(const m of i){const h=m instanceof Uint8Array?m:new Uint8Array(m);p.push(h),c+=h.length}const o=new Uint8Array([...r(101010256),...n(0),...n(0),...n(e.length),...n(e.length),...r(c),...r(s),...n(0)]);return new Blob([...a,...p,o],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}function Tn(e){let t="";for(const a of e){const i=a.codePointAt(0);(i>=32||i===9||i===10||i===13)&&(t+=a)}return t}const ja=e=>Tn(String(e??"")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function ts(e){let t="";for(let a=e+1;a>0;a=Math.floor((a-1)/26))t=String.fromCharCode(65+(a-1)%26)+t;return t}const Ln=e=>typeof e=="number"&&Number.isFinite(e);function En(e,t){const a=e.map(([r],d)=>{let l=String(r).length;for(const p of t){const c=typeof e[d][1]=="function"?e[d][1](p):p[e[d][1]],o=c==null?0:String(c).length;o>l&&(l=o)}return Math.min(52,Math.max(9,l+2))}),i=(r,d,l,p)=>{const c=`${ts(r)}${d}`;return p?`<c r="${c}" s="1" t="inlineStr"><is><t xml:space="preserve">${ja(l)}</t></is></c>`:l==null||l===""?`<c r="${c}"/>`:Ln(l)?`<c r="${c}"><v>${l}</v></c>`:`<c r="${c}" t="inlineStr"><is><t xml:space="preserve">${ja(l)}</t></is></c>`},s=`<row r="1">${e.map(([r],d)=>i(d,1,r,!0)).join("")}</row>`,n=t.map((r,d)=>`<row r="${d+2}">${e.map(([,l],p)=>{const c=typeof l=="function"?l(r):r[l];return i(p,d+2,c)}).join("")}</row>`).join("");return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0" rightToLeft="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${a.map((r,d)=>`<col min="${d+1}" max="${d+1}" width="${r}" customWidth="1"/>`).join("")}</cols>
<sheetData>${s}${n}</sheetData>
<autoFilter ref="A1:${ts(e.length-1)}${t.length+1}"/>
</worksheet>`}const An=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F3A5F"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;function jn(e,t,a){const i=new TextEncoder,s=ja(String(e).replace(/[\\/?*[\]:]/g," ").slice(0,31))||"Liste",n=[{name:"[Content_Types].xml",data:i.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`)},{name:"_rels/.rels",data:i.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`)},{name:"xl/workbook.xml",data:i.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${s}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`)},{name:"xl/_rels/workbook.xml.rels",data:i.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`)},{name:"xl/styles.xml",data:i.encode(An)},{name:"xl/worksheets/sheet1.xml",data:i.encode(En(t,a))}];return Sn(n)}const as=()=>{const e=new Date,t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}_${t(e.getHours())}${t(e.getMinutes())}`},ss=e=>String(e||"liste").toLocaleLowerCase("tr").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60),is=(e,t)=>{const a=document.createElement("a");a.href=URL.createObjectURL(e),a.download=t,document.body.appendChild(a),a.click(),setTimeout(()=>{URL.revokeObjectURL(a.href),a.remove()},1e3)};async function we(e,t,a,i){if(!a||!a.length)return R("Aktarılacak kayıt yok","warning");const s=await Ha({title:"Dışa aktar",message:`${a.length} kayıt hangi biçimde indirilsin?`,options:[{label:"Excel",value:"xlsx",icon:"ph-file-xls"},{label:"PDF",value:"pdf",icon:"ph-file-pdf"}]});if(s)try{if(s==="pdf"){R("PDF hazırlanıyor…","info");const{buildPdf:n}=await Ve(async()=>{const{buildPdf:r}=await import("./pdf-B5CLklZO.js");return{buildPdf:r}},[],import.meta.url);is(await n(e,t,a),`${ss(e)}_${as()}.pdf`),R(`${a.length} satır PDF olarak indirildi`,"success")}else is(jn(e,t,a),`${ss(e)}_${as()}.xlsx`),R(`${a.length} satır Excel'e aktarıldı`,"success")}catch(n){R("Dosya oluşturulamadı: "+(n.message||""),"error")}}const je=(e="export-xlsx",t="Dışa aktar")=>`<button class="btn btn-secondary btn-export" id="${e}" title="Excel veya PDF olarak indir"><i class="ph ph-download-simple"></i> <span>${t}</span></button>`,ue={me:null,perms:[],meta:null,alertCounts:{critical:0,warning:0,info:0}},fe=e=>ue.perms.includes(e);async function Ma(e=!1){if(ue.me&&ue.meta&&!e)return ue;const t=await C.get("/jt/me");ue.me=t.data.user,ue.perms=t.data.permissions||[];const a=await C.get("/jt/meta");return ue.meta=a.data,ue}const ne=e=>e==null||Number.isNaN(Number(e))?"—":Number(e).toLocaleString("tr-TR"),ia=e=>e?new Date(String(e).length<=10?`${e}T00:00:00`:e):null,Ce=e=>{const t=ia(e);return t?t.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"}):"—"},qa=e=>{const t=ia(e);return t?t.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—"},Yt=e=>{const t=ia(e);return t?t.toLocaleString("tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—"},bt=()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`},Fa=(e,t)=>{const a=ia(e);return a.setDate(a.getDate()+t),`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`};function Mn(e){const t=new Date(`${e}T23:59:59`).getTime();return Math.ceil((t-Date.now())/864e5)}function na(e,t=!1){if(t)return`<span class="jt-due">${Ce(e)}</span>`;const a=Mn(e);return a<0?`<span class="jt-due late"><i class="ph ph-warning"></i> ${Ce(e)} · ${-a} gün gecikti</span>`:a===0?`<span class="jt-due soon"><i class="ph ph-clock-countdown"></i> ${Ce(e)} · bugün</span>`:`<span class="jt-due ${a<=3?"soon":""}">${Ce(e)} · ${a} gün kaldı</span>`}const Jt={planned:{label:"Planlandı",cls:"planned",icon:"ph-clock"},in_progress:{label:"Devam ediyor",cls:"progress",icon:"ph-play-circle"},blocked:{label:"Engelli",cls:"blocked",icon:"ph-hand-palm"},done:{label:"Tamamlandı",cls:"done",icon:"ph-check-circle"},cancelled:{label:"İptal",cls:"cancelled",icon:"ph-prohibit"}},rt={low:"Düşük",medium:"Normal",high:"Yüksek",urgent:"Acil"},_a={active:"Aktif",planned:"Planlanıyor",on_hold:"Beklemede",completed:"Tamamlandı",cancelled:"İptal"},Na={open:"Bekliyor",in_production:"Üretimde",partially_shipped:"Kısmen sevk",shipped:"Sevk edildi",cancelled:"İptal"},ha={admin:"ph-shield-star",manager:"ph-briefcase",planner:"ph-calendar-check",supervisor:"ph-hard-hat",operator:"ph-wrench",quality:"ph-seal-check",logistics:"ph-truck",viewer:"ph-eye"};function ra(e){if(e.overdue)return`<span class="jt-badge late"><i class="ph ph-warning"></i> ${e.overdueDays} gün gecikti</span>`;const t=Jt[e.status]||Jt.planned,a=e.status==="done"&&e.onTime===!1?` · ${e.delayDays} gün geç`:"";return`<span class="jt-badge ${t.cls}"><i class="ph ${t.icon}"></i> ${t.label}${a}</span>`}const _e=(e,t="")=>`<span class="jt-badge ${t}">${u(e)}</span>`;function We(e,t=""){const a=Math.max(0,Math.min(100,Math.round(e||0)));return`<div class="jt-bar ${t}"><i style="width:${a}%"></i></div>`}function It(e,t){const a=e?Math.min(100,Math.round(t/e*100)):0;return`<div class="jt-dual"><div class="jt-bar ship"><i style="width:${a}%"></i></div><small>${ne(t)} / ${ne(e)} <b>%${a}</b></small></div>`}function Ua(e,t=32){const a=String(e||"?").split(/\s+/).map(s=>s[0]).slice(0,2).join("").toLocaleUpperCase("tr");let i=0;for(const s of String(e||""))i=(i*31+s.charCodeAt(0))%360;return`<span class="jt-avatar" style="width:${t}px;height:${t}px;font-size:${Math.round(t*.38)}px;background:hsl(${i} 45% 42%)">${u(a)}</span>`}const it=(e,t="")=>`<span class="jt-person">${Ua(e,30)}<span><b>${u(e||"Atanmamış")}</b>${t?`<small>${u(t)}</small>`:""}</span></span>`;function Is(e,t=54){if(e==null)return`<span class="jt-ring empty" style="width:${t}px;height:${t}px">—</span>`;const a=20,i=2*Math.PI*a,s=e>=80?"var(--success)":e>=60?"var(--warning)":"var(--error)";return`<span class="jt-ring" style="width:${t}px;height:${t}px"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${a}" class="bg"/><circle cx="24" cy="24" r="${a}" stroke="${s}" stroke-dasharray="${e/100*i} ${i}" transform="rotate(-90 24 24)"/></svg><b>${e}</b></span>`}const De=(e,t)=>`<div class="jt-empty"><i class="ph ${e}"></i><p>${u(t)}</p></div>`,Me=e=>`<div class="jt-empty error"><i class="ph ph-plugs"></i><p>${u((e==null?void 0:e.message)||"Veri alınamadı")}</p></div>`,Ie=()=>'<div class="jt-loading"><div class="loading-spinner"></div></div>';let ba=0;function Re({title:e,subtitle:t="",body:a="",wide:i=!1,onClose:s}){const n=document.createElement("div");n.className="jt-sheet-wrap",n.innerHTML=`
    <div class="jt-sheet-bg"></div>
    <section class="jt-sheet ${i?"wide":""}" role="dialog" aria-modal="true" aria-label="${u(e)}">
      <header><div><h3>${u(e)}</h3>${t?`<p>${t}</p>`:""}</div><button class="jt-x" aria-label="Kapat"><i class="ph ph-x"></i></button></header>
      <div class="jt-sheet-body">${a}</div>
    </section>`,document.body.appendChild(n),document.body.classList.add("jt-lock"),ba++;const r=()=>{n.isConnected&&(n.classList.add("closing"),setTimeout(()=>{n.remove(),--ba<=0&&(ba=0,document.body.classList.remove("jt-lock"))},200),s==null||s())};return n.querySelector(".jt-sheet-bg").addEventListener("click",r),n.querySelector(".jt-x").addEventListener("click",r),n.addEventListener("keydown",d=>{d.key==="Escape"&&r()}),{el:n,body:n.querySelector(".jt-sheet-body"),close:r,setTitle:d=>{n.querySelector("h3").textContent=d}}}async function xe(e,t){e&&(e.disabled=!0);try{return await t()}catch(a){R(a.message||"İşlem başarısız","error")}finally{e&&(e.disabled=!1)}}const ve=(e,t,a)=>`${a?`<option value="">${u(a)}</option>`:""}${e.map(([i,s])=>`<option value="${u(i)}" ${String(i)===String(t)?"selected":""}>${u(s)}</option>`).join("")}`,ie=(e,t,a="")=>`<label class="jt-field"><span>${u(e)}${a?` <small>${u(a)}</small>`:""}</span>${t}</label>`,qn={critical:["ph-warning-octagon","Kritik"],warning:["ph-warning","Uyarı"],info:["ph-info","Bilgi"]};function Nn(e){const i={l:28,b:24,t:10},s=Math.max(4,...e.map(p=>p.onTime+p.late)),n=(520-i.l)/e.length,r=p=>190-i.b-p/s*(190-i.b-i.t),d=[0,.5,1].map(p=>`<line x1="${i.l}" x2="520" y1="${r(s*p)}" y2="${r(s*p)}" class="grid"/><text x="${i.l-6}" y="${r(s*p)+4}" text-anchor="end" class="axis">${Math.round(s*p)}</text>`).join(""),l=e.map((p,c)=>{const o=i.l+c*n+n*.22,m=n*.56,h=190-i.b-r(p.onTime),b=190-i.b-r(p.late);return`<rect x="${o}" y="${r(p.onTime)}" width="${m}" height="${Math.max(h,0)}" rx="3" class="on"><title>${p.label}: ${p.onTime} zamanında</title></rect>
      <rect x="${o}" y="${r(p.onTime)-b}" width="${m}" height="${Math.max(b,0)}" rx="3" class="late"><title>${p.label}: ${p.late} geç</title></rect>
      <text x="${o+m/2}" y="183" text-anchor="middle" class="axis">${u(p.label)}</text>`}).join("");return`<svg viewBox="0 0 520 190" class="jt-chart" role="img" aria-label="Haftalık tamamlanan işler">${d}${l}</svg>`}async function Cn(e,t){e.innerHTML=Ie();let a;try{a=(await C.get("/jt/dashboard")).data}catch(r){e.innerHTML=Me(r);return}t.setAlertCounts(a.alertCounts);const i=a.kpi,s=i.orderedQty?Math.round(i.shippedQty/i.orderedQty*100):0,n=(r,d,l,p,c="",o="")=>`
    <div class="jt-kpi ${c} ${o?"link":""}" ${o?`data-go="${o}"`:""}>
      <span class="ico"><i class="ph ${r}"></i></span>
      <div><small>${d}</small><b>${l}</b><em>${p}</em></div>
    </div>`;e.innerHTML=`
    <div class="jt-kpis">
      ${n("ph-package","Açık sipariş",ne(i.openOrders),`${ne(i.orderedQty)} adet sipariş`,"","orders")}
      ${n("ph-truck","Giden miktar",ne(i.shippedQty),`%${s} sevk edildi`,s>=60?"good":"","orders")}
      ${n("ph-gear-six","Devam eden iş",ne(i.activeJobs),`${ne(i.plannedJobs)} planlı iş`,"","jobs")}
      ${n("ph-warning","Geciken iş",ne(i.overdueJobs),`${ne(i.blockedJobs)} engelli`,i.overdueJobs?"bad":"good","late")}
      ${n("ph-target","Zamanında tamamlama",i.onTimePct==null?"—":`%${i.onTimePct}`,"son 90 gün",i.onTimePct==null?"":i.onTimePct>=80?"good":i.onTimePct>=60?"warn":"bad","performance")}
      ${n("ph-calendar-x","Geciken sipariş",ne(i.overdueOrders),"termini geçmiş",i.overdueOrders?"bad":"good","orders")}
      ${n("ph-folders","Aktif proje",ne(i.activeProjects),"devam eden","","projects")}
      ${n("ph-check-circle","Tamamlanan iş",ne(i.completedJobs),"toplam","","jobs")}
    </div>

    <section class="jt-card">
      <div class="jt-card-h"><h3>Süreç akışı</h3><small>Hangi süreçte kaç iş var</small></div>
      <div class="jt-flow">
        ${a.byProcess.map(r=>{const d=r.planned+r.inProgress+r.blocked+r.done||1,l=(p,c)=>p?`<i class="${c}" style="width:${p/d*100}%"></i>`:"";return`<button class="jt-stage" data-process="${u(r.id)}" style="--c:${u(r.color)}">
            <span class="ico"><i class="ph ${u(r.icon)}"></i></span>
            <b>${u(r.name)}</b>
            <span class="num">${r.inProgress+r.blocked}<small>aktif</small></span>
            <span class="jt-stack">${l(r.done,"done")}${l(r.inProgress,"progress")}${l(r.blocked,"blocked")}${l(r.planned,"planned")}</span>
            <span class="meta"><span>${r.done} biten</span><span>${r.planned} bekleyen</span></span>
            ${r.overdue?`<span class="jt-chip late"><i class="ph ph-warning"></i> ${r.overdue} geciken</span>`:'<span class="jt-chip ok">Gecikme yok</span>'}
            <em>${ne(r.openQty)} adet kaldı</em>
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
        ${Nn(a.weeks)}
      </section>
    </div>

    <div class="jt-cols">
      <section class="jt-card">
        <div class="jt-card-h"><h3>Dikkat gerektiren siparişler</h3></div>
        ${a.attention.length?a.attention.map(r=>`
          <button class="jt-row" data-order="${u(r.id)}">
            <span class="jt-row-main"><b>${u(r.orderNo)}</b><small>${u(r.customerName)}</small></span>
            <span class="jt-row-side">
              ${r.overdueDays?`<span class="jt-badge late">${r.overdueDays} gün gecikti</span>`:""}
              ${r.lateJobs?`<span class="jt-badge blocked">${r.lateJobs} geciken iş</span>`:""}
              <small>Üretim %${r.progress} · Sevk %${r.shippedPct}</small>
            </span>
          </button>`).join(""):De("ph-seal-check","Geciken sipariş veya iş yok.")}
      </section>
      <section class="jt-card">
        <div class="jt-card-h"><h3>Son uyarılar</h3><button class="jt-link" data-go="alerts">Tümü</button></div>
        ${a.alerts.length?a.alerts.map(r=>{var d,l;return`
          <button class="jt-alert ${r.severity}" data-link="${u(((d=r.link)==null?void 0:d.type)||"")}:${u(((l=r.link)==null?void 0:l.id)||"")}">
            <i class="ph ${qn[r.severity][0]}"></i><span><b>${u(r.title)}</b><small>${u(r.message)}</small></span>
          </button>`}).join(""):De("ph-bell-slash","Açık uyarı yok.")}
      </section>
    </div>`,C.get("/jt/orders").then(r=>{const d=r.data.filter(p=>p.state!=="shipped"&&p.state!=="cancelled").sort((p,c)=>p.dueDate.localeCompare(c.dueDate)).slice(0,6),l=e.querySelector("#jt-ov-orders");l&&(l.innerHTML=d.length?d.map(p=>`
      <button class="jt-row col" data-order="${u(p.id)}">
        <span class="jt-row-line"><b>${u(p.orderNo)}</b><small>${u(p.customerName)} · termin ${Ce(p.dueDate)}</small></span>
        <span class="jt-mini"><small>Üretim %${p.progress}</small>${We(p.progress)}</span>
        ${It(p.orderedQty,p.shippedQty)}
      </button>`).join(""):De("ph-package","Açık sipariş yok."))}).catch(()=>{}),e.onclick=r=>{const d=r.target.closest("[data-go],[data-process],[data-order],[data-link]");if(d){if(d.dataset.go)return t.go(d.dataset.go==="late"?"jobs":d.dataset.go,d.dataset.go==="late"?{late:!0}:{});if(d.dataset.process)return t.go("jobs",{processId:d.dataset.process});if(d.dataset.order)return t.openOrder(d.dataset.order);d.dataset.link&&t.openLink(d.dataset.link)}}}const In=Object.freeze(Object.defineProperty({__proto__:null,render:Cn},Symbol.toStringTag,{value:"Module"})),Dn=[["active","Aktif"],["all","Tümü"],["completed","Tamamlanan"]];let zt="active";async function Tt(e,t){e.innerHTML=Ie();let a;try{a=(await C.get("/jt/projects")).data}catch(s){e.innerHTML=Me(s);return}const i=a.filter(s=>zt==="all"||(zt==="active"?["active","planned","on_hold"].includes(s.status):s.status==="completed"));e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${Dn.map(([s,n])=>`<button class="${zt===s?"active":""}" data-filter="${s}">${n}</button>`).join("")}</div>
      ${fe("jt.projects.manage")?'<button class="btn btn-primary jt-add" id="jt-new-project"><i class="ph ph-plus"></i> Yeni proje</button>':""}
    </div>
    <div class="jt-grid">
      ${i.length?i.map(s=>`
        <article class="jt-project" data-project="${u(s.id)}" tabindex="0">
          <header>
            <span class="code">${u(s.code)}</span>
            ${s.overdue?'<span class="jt-badge late"><i class="ph ph-warning"></i> Terminde değil</span>':_e(_a[s.status]||s.status,s.status==="completed"?"done":s.status==="on_hold"?"blocked":"progress")}
          </header>
          <h4>${u(s.name)}</h4>
          <p class="cust">${u(s.customerName||"—")}</p>
          <div class="jt-mgr">${it(s.managerName,s.managerTitle||"Proje sorumlusu")}</div>
          <div class="jt-prog"><span><small>İlerleme</small><b>%${s.progress}</b></span>${We(s.progress,s.lateJobs?"warn":"")}</div>
          ${It(s.orderedQty,s.shippedQty)}
          <footer>
            <span>${na(s.dueDate,s.status==="completed")}</span>
            <span class="stats">
              <em title="Geciken iş" class="${s.lateJobs?"bad":""}"><i class="ph ph-warning"></i> ${s.lateJobs}</em>
              <em title="Zamanında tamamlama"><i class="ph ph-target"></i> ${s.onTimePct==null?"—":"%"+s.onTimePct}</em>
              <em title="İş sayısı"><i class="ph ph-list-checks"></i> ${s.jobsDone}/${s.jobCount}</em>
            </span>
          </footer>
        </article>`).join(""):De("ph-folders","Bu filtrede proje yok.")}
    </div>`,e.onclick=s=>{const n=s.target.closest("[data-filter]");if(n)return zt=n.dataset.filter,Tt(e,t);if(s.target.closest("#jt-new-project"))return Ga(t,null,()=>Tt(e,t));const r=s.target.closest("[data-project]");r&&Wt(r.dataset.project,t,()=>Tt(e,t))},e.onkeydown=s=>{if(s.key==="Enter"){const n=s.target.closest("[data-project]");n&&Wt(n.dataset.project,t,()=>Tt(e,t))}}}async function Wt(e,t,a){const i=Re({title:"Proje",body:Ie(),wide:!0});let s;try{s=(await C.get(`/jt/projects/${encodeURIComponent(e)}`)).data}catch(l){i.body.innerHTML=Me(l);return}i.setTitle(s.name);const n=s.jobs.filter(l=>l.overdue).sort((l,p)=>p.overdueDays-l.overdueDays),r=s.jobs.filter(l=>!l.overdue&&l.status!=="done").slice(0,12),d=l=>`<button class="jt-row" data-job="${u(l.id)}"><span class="jt-row-main"><b>${u(l.jobNo)} · ${u(l.title)}</b><small>${u(l.assigneeName||"Atanmamış")} · bitiş ${Ce(l.plannedEnd)}</small></span><span class="jt-row-side">${ra(l)}</span></button>`;i.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${_e(_a[s.status]||s.status,s.status==="completed"?"done":"progress")} ${_e(rt[s.priority]||s.priority)} <span class="code">${u(s.code)}</span></div>
      <p>${u(s.description||"")}</p>
    </div>
    <div class="jt-mgr-card">
      ${it(s.managerName,s.managerTitle||"Proje sorumlusu")}
      <span class="contact">${s.managerPhone?`<a href="tel:${u(String(s.managerPhone).replace(/\s/g,""))}"><i class="ph ph-phone"></i> ${u(s.managerPhone)}</a>`:""}${s.managerEmail?`<a href="mailto:${u(s.managerEmail)}"><i class="ph ph-envelope-simple"></i> ${u(s.managerEmail)}</a>`:""}</span>
      <span class="dates"><small>Müşteri</small><b>${u(s.customerName||"—")}</b><small>${qa(s.startDate)} → ${qa(s.dueDate)}</small></span>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş</small><b>${ne(s.orderedQty)}</b></div>
      <div><small>Giden</small><b>${ne(s.shippedQty)}</b></div>
      <div><small>Geciken iş</small><b class="${n.length?"bad":""}">${n.length}</b></div>
      <div><small>Bitiş</small><b>${na(s.dueDate,s.status==="completed")}</b></div>
    </div>
    <h4 class="jt-h">Süreç bazında ilerleme</h4>
    <div class="jt-proc-bars">${s.byProcess.map(l=>`<div><span>${u(l.name)}</span>${We(l.progress,l.late?"warn":"")}<small>${l.done}/${l.total}${l.late?` · <em class="bad">${l.late} geç</em>`:""}</small></div>`).join("")}</div>
    <h4 class="jt-h">Siparişler</h4>
    ${s.orders.length?s.orders.map(l=>`<button class="jt-row col" data-order="${u(l.id)}"><span class="jt-row-line"><b>${u(l.orderNo)}</b><small>termin ${Ce(l.dueDate)}${l.overdueDays?` · <em class="bad">${l.overdueDays} gün gecikti</em>`:""}</small></span>${It(l.orderedQty,l.shippedQty)}</button>`).join(""):De("ph-package","Bu projede sipariş yok.")}
    <h4 class="jt-h">Ekip</h4>
    <div class="jt-team">${s.team.length?s.team.map(l=>`<span class="jt-team-m">${it(l.name)}<small>${l.done}/${l.jobs} iş${l.late?` · <em class="bad">${l.late} geç</em>`:""}</small></span>`).join(""):"<small>Atanmış kişi yok.</small>"}</div>
    <h4 class="jt-h">Geciken ve devam eden işler</h4>
    ${[...n,...r].length?[...n,...r].slice(0,20).map(d).join(""):De("ph-check-circle","Açık iş yok.")}
    ${fe("jt.projects.manage")?'<div class="jt-actions"><button class="btn btn-secondary" id="jt-edit-project"><i class="ph ph-pencil-simple"></i> Projeyi düzenle</button></div>':""}`,i.body.onclick=l=>{const p=l.target.closest("[data-job]");if(p)return t.openJob(p.dataset.job);const c=l.target.closest("[data-order]");if(c)return t.openOrder(c.dataset.order);l.target.closest("#jt-edit-project")&&(i.close(),Ga(t,s,a))}}async function Ga(e,t,a){const i=ue.meta.users.filter(r=>["manager","admin","planner","supervisor"].includes(r.role)),s=!!t,n=Re({title:s?"Projeyi düzenle":"Yeni proje",body:`
    <form class="jt-form" id="pf">
      ${ie("Proje adı",`<input name="name" required maxlength="120" value="${u((t==null?void 0:t.name)||"")}" />`)}
      <div class="jt-2">
        ${ie("Müşteri",s?`<input value="${u(t.customerName||"")}" disabled />`:`<select name="customerId">${ve(ue.meta.customers.map(r=>[r.id,r.name]),"","Seçin")}</select>`)}
        ${ie("Proje sorumlusu",`<select name="managerId">${ve(i.map(r=>[r.id,`${r.name} — ${r.roleLabel||r.role}`]),t==null?void 0:t.managerId,"Seçin")}</select>`)}
      </div>
      <div class="jt-2">
        ${s?"":ie("Başlangıç",`<input type="date" name="startDate" required value="${bt()}" />`)}
        ${ie("Bitiş (termin)",`<input type="date" name="dueDate" required value="${u((t==null?void 0:t.dueDate)||Fa(bt(),60))}" />`)}
      </div>
      <div class="jt-2">
        ${ie("Öncelik",`<select name="priority">${ve(Object.entries(rt),(t==null?void 0:t.priority)||"medium")}</select>`)}
        ${s?ie("Durum",`<select name="status">${ve(Object.entries(_a),t.status)}</select>`):"<span></span>"}
      </div>
      ${ie("Açıklama",`<textarea name="description" rows="3" maxlength="500">${u((t==null?void 0:t.description)||"")}</textarea>`)}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button></div>
    </form>`});n.body.querySelector("[data-close]").onclick=n.close,n.body.querySelector("#pf").onsubmit=r=>{r.preventDefault();const d=Object.fromEntries(new FormData(r.target));xe(r.submitter,async()=>{const l=s?await C.put(`/jt/projects/${encodeURIComponent(t.id)}`,d):await C.post("/jt/projects",d);R(l.message||"Kaydedildi","success"),n.close(),a==null||a()})}}const Rn=Object.freeze(Object.defineProperty({__proto__:null,openProject:Wt,projectForm:Ga,render:Tt},Symbol.toStringTag,{value:"Module"})),Pn=[["open","Açık"],["late","Geciken"],["shipped","Sevk edildi"],["all","Tümü"]];let va="open";async function Lt(e,t){e.innerHTML=Ie();let a;try{a=(await C.get("/jt/orders")).data}catch(r){e.innerHTML=Me(r);return}const i={open:r=>!["shipped","cancelled"].includes(r.state),late:r=>r.overdue||r.lateJobs>0,shipped:r=>r.state==="shipped",all:()=>!0}[va],s=a.filter(i),n=s.reduce((r,d)=>({ordered:r.ordered+d.orderedQty,shipped:r.shipped+d.shippedQty}),{ordered:0,shipped:0});e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${Pn.map(([r,d])=>`<button class="${va===r?"active":""}" data-filter="${r}">${d}</button>`).join("")}</div>
      <span class="jt-sum"><b>${ne(n.ordered)}</b> sipariş · <b>${ne(n.shipped)}</b> giden</span>
      ${je("jt-export-orders")}
      ${fe("jt.orders.manage")?'<button class="btn btn-primary jt-add" id="jt-new-order"><i class="ph ph-plus"></i> Yeni sipariş</button>':""}
    </div>
    <div class="jt-table-wrap">
      <table class="jt-table">
        <thead><tr><th>Sipariş</th><th>Müşteri / proje</th><th>Termin</th><th>Sipariş → giden</th><th>Üretim</th><th>Durum</th></tr></thead>
        <tbody>
          ${s.map(r=>`
            <tr data-order="${u(r.id)}" tabindex="0" class="${r.overdue?"late":""}">
              <td data-label="Sipariş"><b>${u(r.orderNo)}</b><small>${r.lines.length} kalem</small></td>
              <td data-label="Müşteri"><b>${u(r.customerName)}</b><small>${u(r.projectCode||"")} ${u(r.projectName||"")}</small></td>
              <td data-label="Termin">${na(r.dueDate,r.state==="shipped")}</td>
              <td data-label="Giden">${It(r.orderedQty,r.shippedQty)}</td>
              <td data-label="Üretim"><div class="jt-mini">${We(r.progress,r.lateJobs?"warn":"")}<small>%${r.progress}${r.lateJobs?` · <em class="bad">${r.lateJobs} geç iş</em>`:""}</small></div></td>
              <td data-label="Durum">${_e(Na[r.state]||r.state,r.state==="shipped"?"done":r.overdue?"late":r.state==="in_production"?"progress":"planned")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      ${s.length?"":De("ph-package","Bu filtrede sipariş yok.")}
    </div>`,e.onclick=r=>{const d=r.target.closest("[data-filter]");if(d)return va=d.dataset.filter,Lt(e,t);if(r.target.closest("#jt-export-orders"))return we("Siparisler",[["Sipariş no","orderNo"],["Müşteri","customerName"],["Proje","projectCode"],["Sipariş tarihi","orderDate"],["Termin","dueDate"],["Durum",p=>Na[p.state]||p.state],["Sipariş miktarı",p=>p.orderedQty],["Giden miktar",p=>p.shippedQty],["Sevk %",p=>p.shippedPct],["Üretim %",p=>p.progress],["Geciken iş",p=>p.lateJobs],["Gecikme (gün)",p=>p.overdueDays||0],["Tutar",p=>Math.round(p.totalValue||0)]],s);if(r.target.closest("#jt-new-order"))return Ds(t,()=>Lt(e,t));const l=r.target.closest("[data-order]");l&&Zt(l.dataset.order,t,()=>Lt(e,t))},e.onkeydown=r=>{if(r.key==="Enter"){const d=r.target.closest("[data-order]");d&&Zt(d.dataset.order,t,()=>Lt(e,t))}}}async function Zt(e,t,a){const i=Re({title:"Sipariş",body:Ie(),wide:!0});let s;try{s=(await C.get(`/jt/orders/${encodeURIComponent(e)}`)).data}catch(r){i.body.innerHTML=Me(r);return}i.setTitle(`${s.orderNo} · ${s.customerName}`);const n=Math.max(0,s.orderedQty-s.shippedQty);i.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${_e(Na[s.state]||s.state,s.state==="shipped"?"done":s.overdue?"late":"progress")} ${_e(rt[s.priority]||s.priority)} ${s.projectName?`<span class="code">${u(s.projectCode)} · ${u(s.projectName)}</span>`:""}</div>
      <p>Sipariş ${qa(s.orderDate)} · Termin ${na(s.dueDate,s.state==="shipped")}</p>
    </div>
    <div class="jt-mini-kpis">
      <div><small>Sipariş edilen</small><b>${ne(s.orderedQty)}</b></div>
      <div><small>Giden (ERP)</small><b>${ne(s.shippedQty)}</b></div>
      <div><small>Kalan</small><b class="${n&&s.overdue?"bad":""}">${ne(n)}</b></div>
      <div><small>Üretim ilerlemesi</small><b>%${s.progress}</b></div>
    </div>
    ${s.lines.map(r=>{const d=s.jobs.filter(l=>l.lineId===r.id);return`<section class="jt-line">
        <header>
          <div><b>${u(r.productName)}</b><small>${u(r.productCode||"")} · ERP stoğu: ${ne(r.stock)} ${u(r.unit||"")}</small></div>
          <div class="jt-line-q"><span><small>Sipariş</small><b>${ne(r.qty)}</b></span><span><small>Giden</small><b>${ne(r.shippedQty)}</b></span><span><small>Kalan</small><b>${ne(r.remaining)}</b></span></div>
        </header>
        ${It(r.qty,r.shippedQty)}
        ${r.materialShort?`<div class="jt-warnbox"><i class="ph ph-warning"></i> Hammadde yetersiz olabilir: ${r.materials.filter(l=>l.short).map(l=>`${u(l.name)} (gereken ${ne(l.required)}, stok ${ne(l.stock)} ${u(l.unit)})`).join("; ")}</div>`:""}
        <div class="jt-chain">${d.length?d.map(l=>{var p;return`
          <button class="jt-step ${l.overdue?"late":((p=Jt[l.status])==null?void 0:p.cls)||""}" data-job="${u(l.id)}" title="${u(l.title)}">
            <i class="ph ${u(l.processIcon||"ph-gear")}"></i><b>${u(l.processName.split(" ")[0])}</b><small>${l.status==="done"?"✓":`%${l.progress}`}</small><em>${u((l.assigneeName||"Atanmamış").split(" ")[0])}</em>
          </button>`}).join(""):"<small>Bu kalem için iş planlanmamış.</small>"}
        </div>
        ${fe("jt.jobs.create")&&s.state!=="cancelled"?`<button class="jt-link" data-newjob="${u(r.id)}"><i class="ph ph-plus"></i> Bu kaleme iş ekle</button>`:""}
      </section>`}).join("")}
    <h4 class="jt-h">Sevkiyatlar (ERP satış kayıtları)</h4>
    ${s.shipments.length?`<table class="jt-table compact"><thead><tr><th>Tarih</th><th>Ürün</th><th class="r">Adet</th></tr></thead><tbody>${s.shipments.map(r=>`<tr><td>${Yt(r.date)}</td><td>${u(r.productName)}</td><td class="r">${ne(r.quantity)}</td></tr>`).join("")}</tbody></table>`:'<small class="muted">Henüz sevkiyat yok. ERP’de Satış ekranından bu siparişe bağlı çıkış yapıldığında burada görünür.</small>'}
    ${s.notes?`<h4 class="jt-h">Not</h4><p>${u(s.notes)}</p>`:""}
    ${fe("jt.orders.manage")&&s.state!=="cancelled"&&s.state!=="shipped"?'<div class="jt-actions"><button class="btn btn-secondary danger" id="jt-cancel-order"><i class="ph ph-prohibit"></i> Siparişi iptal et</button></div>':""}`,i.body.onclick=r=>{const d=r.target.closest("[data-job]");if(d)return t.openJob(d.dataset.job);const l=r.target.closest("[data-newjob]");if(l)return i.close(),t.newJob({orderId:s.id,lineId:l.dataset.newjob},a);const p=r.target.closest("#jt-cancel-order");p&&xe(p,async()=>{await Se({title:`${s.orderNo} iptal edilsin mi?`,message:"Siparişin tamamlanmamış işleri de iptal olur. Bu işlem geri alınamaz.",confirmLabel:"Siparişi iptal et",danger:!0})&&(await C.post(`/jt/orders/${encodeURIComponent(s.id)}/cancel`,{}),R("Sipariş iptal edildi","success"),i.close(),a==null||a())})}}async function Ds(e,t){let a=[];try{a=(await C.get("/jt/projects")).data.filter(d=>["active","planned"].includes(d.status))}catch{}const i=ue.meta.products,s=()=>`<div class="jt-line-edit"><select name="pid">${ve(i.map(d=>[d.id,`${d.code} — ${d.name}`]),"","Ürün seçin")}</select><input type="number" name="qty" min="1" step="1" placeholder="Adet" /><button type="button" class="jt-x" data-rm aria-label="Kalemi sil"><i class="ph ph-trash"></i></button></div>`,n=Re({title:"Yeni sipariş",body:`
    <form class="jt-form" id="of">
      <div class="jt-2">
        ${ie("Müşteri",`<select name="customerId" required>${ve(ue.meta.customers.map(d=>[d.id,d.name]),"","Seçin")}</select>`)}
        ${ie("Proje",`<select name="projectId">${ve(a.map(d=>[d.id,`${d.code} — ${d.name}`]),"","Projesiz")}</select>`)}
      </div>
      <div class="jt-2">
        ${ie("Sipariş tarihi",`<input type="date" name="orderDate" required value="${bt()}" />`)}
        ${ie("Termin",`<input type="date" name="dueDate" required value="${Fa(bt(),30)}" />`)}
      </div>
      ${ie("Öncelik",`<select name="priority">${ve(Object.entries(rt),"medium")}</select>`)}
      <div class="jt-lines"><span class="jt-lbl">Kalemler</span><div id="of-lines">${s()}</div><button type="button" class="jt-link" id="of-add"><i class="ph ph-plus"></i> Kalem ekle</button></div>
      ${ie("Not",'<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Siparişi oluştur</button></div>
    </form>`}),r=n.body.querySelector("#of-lines");n.body.querySelector("[data-close]").onclick=n.close,n.body.querySelector("#of-add").onclick=()=>r.insertAdjacentHTML("beforeend",s()),r.onclick=d=>{const l=d.target.closest("[data-rm]");l&&r.children.length>1&&l.parentElement.remove()},n.body.querySelector("#of").onsubmit=d=>{d.preventDefault();const l=Object.fromEntries(new FormData(d.target)),p=[...r.children].map(c=>({productId:c.querySelector("[name=pid]").value,qty:Number(c.querySelector("[name=qty]").value)})).filter(c=>c.productId&&c.qty>0);if(!p.length)return R("En az bir ürün ve adet girin","warning");xe(d.submitter,async()=>{const c=await C.post("/jt/orders",{...l,lines:p});R(`${c.data.orderNo} oluşturuldu`,"success"),n.close(),t==null||t()})}}const Bn=Object.freeze(Object.defineProperty({__proto__:null,openOrder:Zt,orderForm:Ds,render:Lt},Symbol.toStringTag,{value:"Module"})),me={status:"open",processId:"",projectId:"",mine:!1,late:!1,q:""},Rs=e=>Object.assign(me,{status:"open",processId:"",projectId:"",mine:!1,late:!1,q:""},e);async function Ps(e,t){e.innerHTML=Ie();const a=new URLSearchParams;me.status==="open"?a.set("open","1"):me.status!=="all"&&a.set("status",me.status),me.processId&&a.set("processId",me.processId),me.projectId&&a.set("projectId",me.projectId),me.mine&&a.set("assigneeId","me"),me.late&&a.set("late","1");let i;try{i=(await C.get(`/jt/jobs?${a}`)).data}catch(l){e.innerHTML=Me(l);return}const s=me.q.trim().toLocaleLowerCase("tr");s&&(i=i.filter(l=>`${l.jobNo} ${l.title} ${l.assigneeName||""} ${l.orderNo||""} ${l.productName||""}`.toLocaleLowerCase("tr").includes(s))),[...new Map(i.map(l=>[l.projectId,l.projectCode])).entries()].filter(([l])=>l);const n=ue.meta.processes;e.innerHTML=`
    <div class="jt-toolbar wrap">
      <div class="jt-chips">${[["open","Açık"],["in_progress","Devam eden"],["blocked","Engelli"],["done","Biten"],["all","Tümü"]].map(([l,p])=>`<button class="${me.status===l?"active":""}" data-status="${l}">${p}</button>`).join("")}</div>
      <label class="jt-toggle"><input type="checkbox" id="f-late" ${me.late?"checked":""}/> Gecikenler</label>
      <label class="jt-toggle"><input type="checkbox" id="f-mine" ${me.mine?"checked":""}/> Bana atananlar</label>
      <select id="f-proc" aria-label="Süreç">${ve(n.map(l=>[l.id,l.name]),me.processId,"Tüm süreçler")}</select>
      <input type="search" id="f-q" placeholder="İş, kişi, sipariş ara…" value="${u(me.q)}" />
      ${je("jt-export")}
      ${fe("jt.jobs.create")?'<button class="btn btn-primary jt-add" id="jt-new-job"><i class="ph ph-plus"></i> Yeni iş</button>':""}
    </div>
    <div class="jt-count">${i.length} iş</div>
    <div class="jt-grid jobs">
      ${i.length?i.slice(0,200).map(l=>`
        <article class="jt-job ${l.overdue?"late":""}" data-job="${u(l.id)}" tabindex="0" style="--pc:${u(l.processColor||"#64748B")}">
          <header><span class="proc"><i class="ph ${u(l.processIcon||"ph-gear")}"></i>${u(l.processName)}</span>${ra(l)}</header>
          <h4>${u(l.title)}</h4>
          <p class="sub">${u(l.jobNo)} ${l.orderNo?"· "+u(l.orderNo):""} ${l.priority==="urgent"||l.priority==="high"?`· <em class="bad">${rt[l.priority]}</em>`:""}</p>
          <div class="jt-prog"><span><small>${ne(l.doneQty)} / ${ne(l.plannedQty)}</small><b>%${l.progress}</b></span>${We(l.progress,l.overdue?"bad":l.status==="done"?"good":"")}</div>
          <footer>${it(l.assigneeName,l.projectCode||"")}<span class="date"><small>Bitiş</small><b>${Ce(l.plannedEnd)}</b></span></footer>
        </article>`).join(""):De("ph-list-checks","Bu filtrede iş yok.")}
    </div>`;const r=()=>Ps(e,t);e.onclick=l=>{const p=l.target.closest("[data-status]");if(p)return me.status=p.dataset.status,r();if(l.target.closest("#jt-export"))return we("Is listesi",[["İş no","jobNo"],["Başlık","title"],["Süreç","processName"],["Proje","projectCode"],["Sipariş","orderNo"],["Ürün","productName"],["Sorumlu","assigneeName"],["Durum",o=>{var m;return((m=Jt[o.status])==null?void 0:m.label)||o.status}],["Planlanan",o=>o.plannedQty],["Yapılan",o=>o.doneQty],["Fire",o=>o.scrapQty],["İlerleme %",o=>o.progress],["Başlangıç","plannedStart"],["Bitiş","plannedEnd"],["Gecikme (gün)",o=>o.overdueDays||0]],i);if(l.target.closest("#jt-new-job"))return Ya(t,{},r);const c=l.target.closest("[data-job]");c&&Mt(c.dataset.job,t,r)},e.onkeydown=l=>{if(l.key==="Enter"){const p=l.target.closest("[data-job]");p&&Mt(p.dataset.job,t,r)}},e.querySelector("#f-late").onchange=l=>{me.late=l.target.checked,r()},e.querySelector("#f-mine").onchange=l=>{me.mine=l.target.checked,r()},e.querySelector("#f-proc").onchange=l=>{me.processId=l.target.value,r()};let d;e.querySelector("#f-q").oninput=l=>{me.q=l.target.value,clearTimeout(d),d=setTimeout(()=>{r().then(()=>{const p=e.querySelector("#f-q");p.focus(),p.setSelectionRange(p.value.length,p.value.length)})},250)}}async function Mt(e,t,a){const i=Re({title:"İş",body:Ie(),wide:!0});let s;try{s=(await C.get(`/jt/jobs/${encodeURIComponent(e)}`)).data}catch(m){i.body.innerHTML=Me(m);return}i.setTitle(`${s.jobNo} · ${s.title}`);const n=ue.me&&s.assigneeId===ue.me.id,r=fe("jt.jobs.update.any")||fe("jt.jobs.update.own")&&n,d=s.status!=="done"&&s.status!=="cancelled",l=ue.meta.users.filter(m=>["operator","quality","logistics","supervisor"].includes(m.role)),p={progress:"ph-plus-circle",status:"ph-flag",assign:"ph-user-switch",comment:"ph-chat-text"};i.body.innerHTML=`
    <div class="jt-detail-head">
      <div>${ra(s)} ${_e(rt[s.priority]||s.priority)} <span class="code" style="color:${u(s.processColor)}"><i class="ph ${u(s.processIcon||"ph-gear")}"></i> ${u(s.processName)}</span></div>
      ${s.blockedReason&&s.status==="blocked"?`<div class="jt-warnbox"><i class="ph ph-hand-palm"></i> Engel: ${u(s.blockedReason)}</div>`:""}
    </div>
    <div class="jt-info">
      <div><small>Sorumlu</small>${it(s.assigneeName)}</div>
      <div><small>Proje</small><b>${u(s.projectCode||"—")}</b><small>${u(s.projectName||"")}</small></div>
      <div><small>Sipariş</small>${s.orderId?`<button class="jt-link" data-order="${u(s.orderId)}">${u(s.orderNo)}</button>`:"<b>—</b>"}<small>${u(s.productName||"")}</small></div>
      <div><small>Planlanan</small><b>${Ce(s.plannedStart)} → ${Ce(s.plannedEnd)}</b><small>${s.actualStart?"Başladı: "+Yt(s.actualStart):"Henüz başlamadı"}</small></div>
      <div><small>Gerçekleşen bitiş</small><b>${s.actualEnd?Yt(s.actualEnd):"—"}</b>${s.onTime===!1?`<small class="bad">${s.delayDays} gün geç</small>`:s.onTime?'<small class="ok">Zamanında</small>':""}</div>
      ${s.product?`<div><small>ERP stoğu</small><b>${ne(s.product.stock)} ${u(s.product.unit||"")}</b><small>${u(s.product.code)}</small></div>`:""}
    </div>
    <div class="jt-progress-box">
      <div class="jt-prog big"><span><small>Yapılan / planlanan</small><b>${ne(s.doneQty)} / ${ne(s.plannedQty)} <em>%${s.progress}</em></b></span>${We(s.progress,s.overdue?"bad":s.status==="done"?"good":"")}</div>
      <small class="muted">Fire: ${ne(s.scrapQty)} adet</small>
    </div>
    ${r&&d?`
    <form class="jt-form inline" id="jt-progress">
      <h4 class="jt-h">İlerleme gir</h4>
      <div class="jt-3">
        ${ie("Yapılan adet",'<input type="number" name="qty" min="1" step="1" required placeholder="Örn. 50" />')}
        ${ie("Fire",'<input type="number" name="scrap" min="0" step="1" value="0" />')}
        ${ie("Not",'<input type="text" name="note" maxlength="200" placeholder="isteğe bağlı" />')}
      </div>
      <div class="jt-actions left">
        <button class="btn btn-primary" type="submit"><i class="ph ph-floppy-disk"></i> Kaydet</button>
        ${s.status==="planned"||s.status==="blocked"?'<button type="button" class="btn btn-secondary" data-st="in_progress"><i class="ph ph-play"></i> Başlat</button>':""}
        ${s.status!=="blocked"?'<button type="button" class="btn btn-secondary" data-st="blocked"><i class="ph ph-hand-palm"></i> Engel bildir</button>':""}
        <button type="button" class="btn btn-secondary" data-st="done"><i class="ph ph-check"></i> Tamamla</button>
        ${fe("jt.jobs.update.any")?'<button type="button" class="btn btn-secondary danger" data-st="cancelled"><i class="ph ph-prohibit"></i> İptal</button>':""}
      </div>
    </form>`:""}
    ${fe("jt.jobs.assign")&&d?`
    <div class="jt-assign"><h4 class="jt-h">Sorumlu ata</h4>
      <div class="jt-inline"><select id="jt-assignee">${ve(l.map(m=>[m.id,`${m.name} — ${m.title||m.roleLabel}`]),s.assigneeId,"Kişi seçin")}</select><button class="btn btn-secondary" id="jt-assign-btn">Ata</button></div>
    </div>`:""}
    <h4 class="jt-h">Hareketler</h4>
    <ol class="jt-timeline">${s.logs.map(m=>`<li><i class="ph ${p[m.type]||"ph-dot"}"></i><div><b>${u(m.userName||"Sistem")}</b> ${m.type==="progress"?`+${ne(m.qty)} adet${m.scrap?` (fire ${ne(m.scrap)})`:""}`:""} ${m.note?`<span>${u(m.note)}</span>`:""}<small>${Yt(m.createdAt)}</small></div></li>`).join("")||"<li><div><small>Kayıt yok</small></div></li>"}</ol>
    <form class="jt-inline comment" id="jt-comment"><input name="note" maxlength="300" placeholder="Not ekle…" required /><button class="btn btn-secondary" type="submit">Gönder</button></form>`;const c=()=>{i.close(),a==null||a(),setTimeout(()=>Mt(e,t,a),250)};i.body.onclick=m=>{const h=m.target.closest("[data-order]");if(h)return i.close(),t.openOrder(h.dataset.order);const b=m.target.closest("[data-st]");b&&xe(b,async()=>{let L="";b.dataset.st==="blocked"&&(L=await za({title:"Engel bildir",message:"İş neden ilerleyemiyor? Bu not sorumluya ve uyarılara yansır.",label:"Engelin nedeni",placeholder:"Örn. Kaynak teli bekleniyor",required:!0,multiline:!0,confirmLabel:"Engeli kaydet"}),!L)||b.dataset.st==="cancelled"&&!await Se({title:"İş iptal edilsin mi?",message:"İptal edilen iş listelerden kalkar ve uyarı üretmez.",confirmLabel:"İşi iptal et",danger:!0})||(await C.post(`/jt/jobs/${encodeURIComponent(e)}/status`,{status:b.dataset.st,note:L}),R("Durum güncellendi","success"),c())});const v=m.target.closest("#jt-assign-btn");v&&xe(v,async()=>{const L=i.body.querySelector("#jt-assignee").value;if(!L)return R("Kişi seçin","warning");await C.post(`/jt/jobs/${encodeURIComponent(e)}/assign`,{userId:Number(L)}),R("Atandı","success"),c()})};const o=i.body.querySelector("#jt-progress");o&&(o.onsubmit=m=>{m.preventDefault();const h=Object.fromEntries(new FormData(o));xe(m.submitter,async()=>{const b=await C.post(`/jt/jobs/${encodeURIComponent(e)}/progress`,{qty:Number(h.qty),scrap:Number(h.scrap||0),note:h.note});R(b.message,"success"),c()})}),i.body.querySelector("#jt-comment").onsubmit=m=>{m.preventDefault();const h=Object.fromEntries(new FormData(m.target));xe(m.submitter,async()=>{await C.post(`/jt/jobs/${encodeURIComponent(e)}/comment`,h),c()})}}async function Ya(e,t={},a){let i=[];try{i=(await C.get("/jt/orders")).data.filter(p=>!["shipped","cancelled"].includes(p.state))}catch{}const s=ue.meta.users.filter(p=>["operator","quality","logistics","supervisor"].includes(p.role)),n=Re({title:"Yeni iş",body:`
    <form class="jt-form" id="jf">
      ${ie("Sipariş",`<select name="orderId" id="jf-order">${ve(i.map(p=>[p.id,`${p.orderNo} — ${p.customerName}`]),t.orderId,"Siparişsiz iş")}</select>`)}
      ${ie("Sipariş kalemi",'<select name="lineId" id="jf-line"><option value="">—</option></select>')}
      ${ie("Süreç",`<select name="processId" required>${ve(ue.meta.processes.map(p=>[p.id,p.name]),"","Seçin")}</select>`)}
      ${ie("Başlık",'<input name="title" maxlength="160" placeholder="boş bırakılırsa süreç + ürün adı kullanılır" />')}
      <div class="jt-2">
        ${ie("Planlanan adet",'<input type="number" name="plannedQty" min="1" step="1" required />')}
        ${ie("Öncelik",`<select name="priority">${ve(Object.entries(rt),"medium")}</select>`)}
      </div>
      <div class="jt-2">
        ${ie("Başlangıç",`<input type="date" name="plannedStart" required value="${bt()}" />`)}
        ${ie("Bitiş",`<input type="date" name="plannedEnd" required value="${Fa(bt(),3)}" />`)}
      </div>
      ${fe("jt.jobs.assign")?ie("Sorumlu",`<select name="assigneeId">${ve(s.map(p=>[p.id,`${p.name} — ${p.title||p.roleLabel}`]),"","Sonra ata")}</select>`):""}
      ${ie("Not",'<textarea name="notes" rows="2" maxlength="300"></textarea>')}
      <div class="jt-actions"><button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">İşi oluştur</button></div>
    </form>`}),r=n.body.querySelector("#jf-order"),d=n.body.querySelector("#jf-line"),l=async()=>{if(d.innerHTML='<option value="">—</option>',!r.value)return;const p=(await C.get(`/jt/orders/${encodeURIComponent(r.value)}`)).data;if(d.innerHTML=ve(p.lines.map(c=>[c.id,`${c.productName} (${ne(c.qty)})`]),t.lineId,"Kalem seçin"),!n.body.querySelector("[name=plannedQty]").value&&t.lineId){const c=p.lines.find(o=>o.id===t.lineId);c&&(n.body.querySelector("[name=plannedQty]").value=c.qty)}};r.onchange=()=>{t.lineId="",l()},d.onchange=()=>{var c;const p=(c=d.selectedOptions[0])==null?void 0:c.textContent.match(/\(([\d.]+)\)$/);p&&(n.body.querySelector("[name=plannedQty]").value=p[1].replace(/\./g,""))},t.orderId&&l(),n.body.querySelector("[data-close]").onclick=n.close,n.body.querySelector("#jf").onsubmit=p=>{p.preventDefault();const c=Object.fromEntries(new FormData(p.target));c.plannedQty=Number(c.plannedQty),c.assigneeId?c.assigneeId=Number(c.assigneeId):delete c.assigneeId,xe(p.submitter,async()=>{const o=await C.post("/jt/jobs",c);R(`${o.data.jobNo} oluşturuldu`,"success"),n.close(),a==null||a()})}}const Hn=Object.freeze(Object.defineProperty({__proto__:null,jobForm:Ya,openJob:Mt,render:Ps,setFilter:Rs},Symbol.toStringTag,{value:"Module"}));let ut=90,Ye="score";const zn={score:"Skor",onTimePct:"Zamanında %",completed:"Tamamlanan",overdueJobs:"Geciken",openJobs:"Açık iş"},Xt=(e,t=80,a=60)=>e==null?"":e>=t?"good":e>=a?"warn":"bad";async function Ca(e,t){e.innerHTML=Ie();let a;try{a=(await C.get(`/jt/performance?days=${ut}`)).data}catch(r){e.innerHTML=Me(r);return}const i=fe("jt.performance.all"),s=[...a.rows].sort((r,d)=>Ye==="overdueJobs"||Ye==="openJobs"?d[Ye]-r[Ye]:(d[Ye]??-1)-(r[Ye]??-1));e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">${[30,90,180].map(r=>`<button class="${ut===r?"active":""}" data-days="${r}">Son ${r} gün</button>`).join("")}</div>
      ${i?`<select id="jt-sort" aria-label="Sırala">${Object.entries(zn).map(([r,d])=>`<option value="${r}" ${r===Ye?"selected":""}>Sırala: ${d}</option>`).join("")}</select>`:""}
      ${je("jt-export-perf")}
    </div>
    <div class="jt-mini-kpis wide">
      <div><small>Kişi</small><b>${a.summary.people}</b></div>
      <div><small>Tamamlanan iş</small><b>${ne(a.summary.completed)}</b></div>
      <div><small>Zamanında tamamlama</small><b class="${Xt(a.summary.onTimePct)}">${a.summary.onTimePct==null?"—":"%"+a.summary.onTimePct}</b></div>
      <div><small>Skor nasıl hesaplanır?</small><b class="tiny">%60 zamanında · %20 düşük fire · %20 gecikmiş açık iş yükü</b></div>
    </div>
    ${s.length?`
    <div class="jt-table-wrap"><table class="jt-table perf">
      <thead><tr><th>Kişi</th><th class="c">Skor</th><th>Zamanında</th><th class="r">Biten</th><th class="r">Geç</th><th class="r">Ort. gecikme</th><th class="r">Açık / geciken</th><th class="r">Fire</th><th class="r">Üretilen</th></tr></thead>
      <tbody>${s.map(r=>`<tr data-user="${r.id}" tabindex="0">
        <td data-label="Kişi">${it(r.name,r.title||r.roleLabel)}</td>
        <td data-label="Skor" class="c">${Is(r.score,46)}</td>
        <td data-label="Zamanında"><div class="jt-mini">${We(r.onTimePct,Xt(r.onTimePct))}<small>${r.onTimePct==null?"—":"%"+r.onTimePct}</small></div></td>
        <td data-label="Biten" class="r">${r.completed}</td>
        <td data-label="Geç" class="r ${r.late?"bad":""}">${r.late}</td>
        <td data-label="Ort. gecikme" class="r">${r.avgDelayDays?r.avgDelayDays+" gün":"—"}</td>
        <td data-label="Açık / geciken" class="r">${r.openJobs} / <b class="${r.overdueJobs?"bad":""}">${r.overdueJobs}</b></td>
        <td data-label="Fire" class="r">${r.scrapPct?"%"+r.scrapPct:"—"}</td>
        <td data-label="Üretilen" class="r">${ne(r.producedQty)}</td>
      </tr>`).join("")}</tbody></table></div>`:De("ph-gauge","Bu dönemde performans verisi yok.")}`,e.onclick=r=>{const d=r.target.closest("[data-days]");if(d)return ut=Number(d.dataset.days),Ca(e,t);if(r.target.closest("#jt-export-perf"))return we(`Performans son ${ut} gun`,[["Kişi","name"],["Unvan","title"],["Bölüm","department"],["Rol","roleLabel"],["Skor",p=>p.score],["Zamanında %",p=>p.onTimePct],["Tamamlanan",p=>p.completed],["Geç biten",p=>p.late],["Ort. gecikme (gün)",p=>p.avgDelayDays],["Açık iş",p=>p.openJobs],["Geciken açık iş",p=>p.overdueJobs],["Fire %",p=>p.scrapPct],["Üretilen",p=>p.producedQty]],s);const l=r.target.closest("[data-user]");l&&ea(l.dataset.user,t)},e.onkeydown=r=>{if(r.key==="Enter"){const d=r.target.closest("[data-user]");d&&ea(d.dataset.user,t)}};const n=e.querySelector("#jt-sort");n&&(n.onchange=()=>{Ye=n.value,Ca(e,t)})}function Kn(e){const i=Math.max(3,...e.map(n=>n.done)),s=360/e.length;return`<svg viewBox="0 0 360 138" class="jt-chart small">${e.map((n,r)=>{const d=r*s+s*.2,l=s*.6,p=n.done/i*120,c=n.onTime/i*120;return`<rect x="${d}" y="${120-p}" width="${l}" height="${p}" rx="3" class="late"><title>${n.month}: ${n.done} iş</title></rect><rect x="${d}" y="${120-c}" width="${l}" height="${c}" rx="3" class="on"><title>${n.onTime} zamanında</title></rect><text x="${d+l/2}" y="134" text-anchor="middle" class="axis">${n.month.slice(5)}</text>`}).join("")}</svg>`}async function ea(e,t){const a=Re({title:"Kişi performansı",body:Ie(),wide:!0});let i;try{i=(await C.get(`/jt/performance/${encodeURIComponent(e)}?days=${ut}`)).data}catch(s){a.body.innerHTML=Me(s);return}a.setTitle(i.name),a.body.innerHTML=`
    <div class="jt-perf-head">${Is(i.score,76)}<div>${it(i.name,`${i.title||""} · ${i.department||""}`)}<small class="muted">Son ${ut} gün · ${u(i.roleLabel||"")}</small></div></div>
    <div class="jt-mini-kpis wide">
      <div><small>Zamanında</small><b class="${Xt(i.onTimePct)}">${i.onTimePct==null?"—":"%"+i.onTimePct}</b></div>
      <div><small>Tamamlanan</small><b>${i.completed}</b></div>
      <div><small>Geç biten</small><b class="${i.late?"bad":""}">${i.late}</b></div>
      <div><small>Ort. gecikme</small><b>${i.avgDelayDays?i.avgDelayDays+" gün":"—"}</b></div>
      <div><small>Açık iş</small><b>${i.openJobs}</b></div>
      <div><small>Geciken açık iş</small><b class="${i.overdueJobs?"bad":""}">${i.overdueJobs}</b></div>
      <div><small>Fire oranı</small><b>${i.scrapPct?"%"+i.scrapPct:"—"}</b></div>
      <div><small>Üretilen adet</small><b>${ne(i.producedQty)}</b></div>
    </div>
    <div class="jt-cols tight">
      <section class="jt-card flat"><div class="jt-card-h"><h3>Aylık tamamlanan iş</h3><span class="jt-legend"><i class="on"></i>zamanında <i class="late"></i>toplam</span></div>${Kn(i.monthly)}</section>
      <section class="jt-card flat"><div class="jt-card-h"><h3>Süreç bazında</h3></div>
        ${i.byProcess.length?i.byProcess.map(s=>`<div class="jt-proc-bars single"><span>${u(s.name)}</span>${We(s.done?s.onTime/s.done*100:0,Xt(s.done?s.onTime/s.done*100:null))}<small>${s.onTime}/${s.done} zamanında</small></div>`).join(""):'<small class="muted">Tamamlanmış iş yok.</small>'}
      </section>
    </div>
    <h4 class="jt-h">Son işler</h4>
    ${i.jobs.map(s=>`<button class="jt-row" data-job="${u(s.id)}"><span class="jt-row-main"><b>${u(s.jobNo)} · ${u(s.title)}</b><small>${u(s.projectCode||"")} · bitiş ${Ce(s.plannedEnd)}</small></span><span class="jt-row-side">${ra(s)}</span></button>`).join("")||De("ph-list-checks","İş yok.")}`,a.body.onclick=s=>{const n=s.target.closest("[data-job]");n&&t.openJob(n.dataset.job)}}const On=Object.freeze(Object.defineProperty({__proto__:null,openUser:ea,render:Ca},Symbol.toStringTag,{value:"Module"})),Fn={critical:["ph-warning-octagon","Kritik"],warning:["ph-warning","Uyarı"],info:["ph-info","Bilgi"]};let Xe="all",fa=!1;async function Vt(e,t){e.innerHTML=Ie();let a;try{a=(await C.get(`/jt/alerts${fa?"?all=1":""}`)).data}catch(n){e.innerHTML=Me(n);return}t.setAlertCounts(a.counts);const i=a.alerts.filter(n=>Xe==="all"||n.severity===Xe),s=a.counts;e.innerHTML=`
    <div class="jt-toolbar">
      <div class="jt-chips">
        <button class="${Xe==="all"?"active":""}" data-sev="all">Tümü <em>${s.critical+s.warning+s.info}</em></button>
        <button class="${Xe==="critical"?"active":""}" data-sev="critical">Kritik <em class="bad">${s.critical}</em></button>
        <button class="${Xe==="warning"?"active":""}" data-sev="warning">Uyarı <em>${s.warning}</em></button>
        <button class="${Xe==="info"?"active":""}" data-sev="info">Bilgi <em>${s.info}</em></button>
      </div>
      <label class="jt-toggle"><input type="checkbox" id="f-acked" ${fa?"checked":""}/> Kapatılanları göster</label>
    </div>
    <div class="jt-alerts">
      ${i.length?i.map(n=>{var r,d;return`
        <article class="jt-alert-card ${n.severity} ${n.acked?"acked":""}">
          <i class="ph ${Fn[n.severity][0]}"></i>
          <div class="body" data-link="${u(((r=n.link)==null?void 0:r.type)||"")}:${u(((d=n.link)==null?void 0:d.id)||"")}">
            <b>${u(n.title)}</b>
            <p>${u(n.message)}</p>
            <small>${n.assigneeName?"Sorumlu: "+u(n.assigneeName)+" · ":""}${n.dueDate?"Tarih: "+Ce(n.dueDate):""}${n.acked?" · kapatıldı":""}</small>
          </div>
          ${fe("jt.alerts.ack")&&!n.acked?`<button class="btn btn-secondary jt-ack" data-ack="${u(n.key)}" title="Uyarıyı kapat"><i class="ph ph-check"></i> Kapat</button>`:""}
        </article>`}).join(""):De("ph-bell-slash","Açık uyarı yok. Her şey planlandığı gibi.")}
    </div>`,e.onclick=n=>{const r=n.target.closest("[data-sev]");if(r)return Xe=r.dataset.sev,Vt(e,t);const d=n.target.closest("[data-ack]");if(d)return xe(d,async()=>{await C.post("/jt/alerts/ack",{key:d.dataset.ack}),R("Uyarı kapatıldı","success"),Vt(e,t)});const l=n.target.closest("[data-link]");l&&t.openLink(l.dataset.link)},e.querySelector("#f-acked").onchange=n=>{fa=n.target.checked,Vt(e,t)}}const _n=Object.freeze(Object.defineProperty({__proto__:null,render:Vt},Symbol.toStringTag,{value:"Module"}));async function Va(e,t){e.innerHTML=Ie();let a,i,s=null;try{[a,i]=(await Promise.all([C.get("/jt/users"),C.get("/jt/roles")])).map(c=>c.data),s=await C.get("/jt/units").then(c=>c.data).catch(()=>null)}catch(c){e.innerHTML=Me(c);return}const{roles:n,permissions:r}=i,d=!!i.customRoles,l=(s==null?void 0:s.units)||[],p=()=>Va(e);e.innerHTML=`
    <div class="jt-toolbar"><h3 class="jt-title">Kullanıcılar</h3><button class="btn btn-primary jt-add" id="jt-new-user"><i class="ph ph-user-plus"></i> Yeni kullanıcı</button></div>
    <div class="jt-table-wrap"><table class="jt-table">
      <thead><tr><th>Kişi</th><th>Kullanıcı adı</th><th>Rol</th><th>Birim</th><th>Durum</th></tr></thead>
      <tbody>${a.map(c=>`<tr data-user="${c.id}" tabindex="0" class="${c.active?"":"off"}">
        <td data-label="Kişi"><span class="jt-person">${Ua(c.name,30)}<span><b>${u(c.name)}</b><small>${u(c.title||"")}</small></span></span></td>
        <td data-label="Kullanıcı adı"><code>${u(c.username)}</code></td>
        <td data-label="Rol"><span class="jt-role"><i class="ph ${ha[c.role]||"ph-user"}"></i> ${u(c.roleLabel||c.role)}</span></td>
        <td data-label="Birim">${u(c.department||"—")}</td>
        <td data-label="Durum">${c.active?_e("Aktif","done"):_e("Pasif","cancelled")}</td></tr>`).join("")}</tbody></table></div>

    ${s?Un(s):""}

    ${d?`<div class="jt-toolbar"><h3 class="jt-title">Roller</h3><button class="btn btn-primary jt-add" id="jt-new-role"><i class="ph ph-plus-circle"></i> Yeni rol</button></div>
    <div class="jt-role-cards">${n.map(c=>`<button type="button" class="jt-role-card" data-role-card="${u(c.id)}" ${c.id==="admin"?"disabled":""}>
      <span class="jt-role-card-head"><i class="ph ${ha[c.id]||"ph-user-circle-gear"}"></i><b>${u(c.label)}</b>${c.builtin?"":'<span class="jt-role-tag">Özel</span>'}</span>
      <small>${u(c.description||"Açıklama yok")}</small>
      <span class="jt-role-card-foot"><i class="ph ph-users"></i> ${c.userCount||0} kullanıcı · ${c.permissions.length} yetki</span></button>`).join("")}</div>`:""}

    <div class="jt-toolbar"><h3 class="jt-title">Roller ve yetkiler</h3><small class="muted">Bir rolün yetkilerini değiştirince o roldeki herkes için geçerli olur. Yönetici rolü sabittir.</small></div>
    <div class="jt-table-wrap"><table class="jt-table matrix">
      <thead><tr><th>Yetki</th>${n.map(c=>`<th class="c"><i class="ph ${ha[c.id]||"ph-user"}"></i><small>${u(c.label)}</small></th>`).join("")}</tr></thead>
      <tbody>${r.map(c=>`<tr><td>${u(c.label)}<small><code>${u(c.id)}</code></small></td>${n.map(o=>`<td class="c"><input type="checkbox" data-role="${u(o.id)}" data-perm="${u(c.id)}" ${o.permissions.includes(c.id)?"checked":""} ${o.id==="admin"||c.id==="jt.view"?"disabled":""} aria-label="${u(o.label)}: ${u(c.label)}" /></td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`,e.onclick=c=>{if(c.target.closest("#jt-new-user"))return ga(null,n,l,p);if(c.target.closest("#jt-new-role"))return rs(null,r,p);if(c.target.closest("#jt-new-unit"))return ns(null,l,a,p);const o=c.target.closest("[data-role-card]");if(o)return rs(n.find(b=>b.id===o.dataset.roleCard),r,p);const m=c.target.closest("[data-unit]");if(m)return ns(l.find(b=>b.id===m.dataset.unit),l,a,p);const h=c.target.closest("[data-user]");h&&ga(a.find(b=>String(b.id)===h.dataset.user),n,l,p)},e.onkeydown=c=>{if(c.key==="Enter"){const o=c.target.closest("[data-user]");o&&ga(a.find(m=>String(m.id)===o.dataset.user),n,l,p)}},e.onchange=c=>{const o=c.target.closest("[data-perm]");if(!o)return;const m=n.find(b=>b.id===o.dataset.role),h=new Set(m.permissions);o.checked?h.add(o.dataset.perm):h.delete(o.dataset.perm),xe(o,async()=>{try{await C.put(`/jt/roles/${encodeURIComponent(m.id)}`,{permissions:[...h]}),m.permissions=[...h],R("Yetki güncellendi","success")}catch(b){throw o.checked=!o.checked,b}})}}function Un({units:e,unassigned:t}){const a=r=>e.filter(d=>(d.parentId||null)===r),i=new Set(e.map(r=>r.id)),s=e.filter(r=>!r.parentId||!i.has(r.parentId)),n=(r,d)=>`<li class="jt-unit" style="--depth:${d}">
    <button type="button" class="jt-unit-row" data-unit="${u(r.id)}">
      <i class="ph ${d?"ph-arrow-elbow-down-right":"ph-buildings"}"></i>
      <span class="jt-unit-main"><b>${u(r.name)}</b><small>${r.managerName?`Yönetici: ${u(r.managerName)}`:"Yönetici atanmadı"}${r.description?` · ${u(r.description)}`:""}</small></span>
      <span class="jt-unit-count" title="Üye sayısı"><i class="ph ph-users"></i> ${r.members.length}</span>
    </button>
    ${r.members.length?`<div class="jt-unit-members">${r.members.map(l=>`<span class="jt-unit-member">${Ua(l.name,22)}<span>${u(l.name)}<small>${u(l.title||l.roleLabel||"")}</small></span></span>`).join("")}</div>`:""}
    ${a(r.id).length?`<ul>${a(r.id).map(l=>n(l,d+1)).join("")}</ul>`:""}
  </li>`;return`<div class="jt-toolbar"><h3 class="jt-title">Birimler ve hiyerarşi</h3><button class="btn btn-primary jt-add" id="jt-new-unit"><i class="ph ph-tree-structure"></i> Yeni birim</button></div>
    <ul class="jt-unit-tree">${s.map(r=>n(r,0)).join("")}</ul>
    ${t.length?`<p class="muted small jt-unit-note"><i class="ph ph-info"></i> Birime atanmamış: ${t.map(r=>u(r.name)).join(", ")}</p>`:""}`}function ns(e,t,a,i){const s=!!e,n=new Set;if(s){const l=p=>{n.add(p),t.filter(c=>c.parentId===p).forEach(c=>l(c.id))};l(e.id)}const r=Re({title:s?e.name:"Yeni birim",body:`
    <form class="jt-form" id="unf">
      ${ie("Birim adı",`<input name="name" required minlength="2" maxlength="60" value="${u((e==null?void 0:e.name)||"")}" />`)}
      <div class="jt-2">
        ${ie("Üst birim",`<select name="parentId"><option value="">— En üst birim —</option>${ve(t.filter(l=>!n.has(l.id)).map(l=>[l.id,l.name]),(e==null?void 0:e.parentId)||"")}</select>`)}
        ${ie("Birim yöneticisi",`<select name="managerId"><option value="">— Seçilmedi —</option>${ve(a.filter(l=>l.active).map(l=>[String(l.id),l.name]),e!=null&&e.managerId?String(e.managerId):"")}</select>`)}
      </div>
      ${ie("Açıklama",`<input name="description" maxlength="200" value="${u((e==null?void 0:e.description)||"")}" />`)}
      ${s&&e.members.length?`<p class="muted small">Bu birimde ${e.members.length} kullanıcı var. Adı değiştirirseniz kullanıcıların bölümü de güncellenir.</p>`:""}
      <div class="jt-actions">
        ${s?'<button type="button" class="btn btn-secondary" id="unf-del"><i class="ph ph-trash"></i> Sil</button>':""}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>`});r.body.querySelector("[data-close]").onclick=r.close,r.body.querySelector("#unf").onsubmit=l=>{l.preventDefault();const p=Object.fromEntries(new FormData(l.target));xe(l.submitter,async()=>{s?await C.put(`/jt/units/${encodeURIComponent(e.id)}`,p):await C.post("/jt/units",p),r.close(),R(s?"Birim güncellendi":"Birim oluşturuldu","success"),i==null||i()})};const d=r.body.querySelector("#unf-del");d&&(d.onclick=()=>xe(d,async()=>{await Se({title:"Birim silinsin mi?",message:`${e.name} birimi silinecek.`,confirmLabel:"Sil",danger:!0})&&(await C.delete(`/jt/units/${encodeURIComponent(e.id)}`),r.close(),R("Birim silindi","success"),i==null||i())}))}function rs(e,t,a){const i=!!e,s=new Set((e==null?void 0:e.permissions)||["jt.view","erp.read"]),n=Re({title:i?e.label:"Yeni rol",body:`
    <form class="jt-form" id="rf">
      ${ie("Rol adı",`<input name="label" required minlength="2" maxlength="60" value="${u((e==null?void 0:e.label)||"")}" placeholder="ör. Liman Temsilcisi" />`)}
      ${ie("Açıklama",`<input name="description" maxlength="200" value="${u((e==null?void 0:e.description)||"")}" placeholder="Bu rol ne iş yapar?" />`)}
      <fieldset class="jt-perm-list"><legend>Yetkiler</legend>
        ${t.map(d=>`<label class="jt-toggle"><input type="checkbox" name="perm" value="${u(d.id)}" ${s.has(d.id)?"checked":""} ${d.id==="jt.view"?"disabled":""}/> ${u(d.label)}</label>`).join("")}
      </fieldset>
      <div class="jt-actions">
        ${i?`<button type="button" class="btn btn-secondary" id="rf-del" ${e.userCount?`title="Bu rolde ${e.userCount} kullanıcı var"`:""}><i class="ph ph-trash"></i> Sil</button>`:""}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>`});n.body.querySelector("[data-close]").onclick=n.close,n.body.querySelector("#rf").onsubmit=d=>{d.preventDefault();const l=new FormData(d.target),p={label:l.get("label"),description:l.get("description"),permissions:["jt.view",...l.getAll("perm")]};xe(d.submitter,async()=>{i?await C.put(`/jt/roles/${encodeURIComponent(e.id)}`,p):await C.post("/jt/roles",p),n.close(),R(i?"Rol güncellendi":"Rol oluşturuldu","success"),a==null||a()})};const r=n.body.querySelector("#rf-del");r&&(r.onclick=()=>xe(r,async()=>{await Se({title:"Rol silinsin mi?",message:`${e.label} rolü silinecek.`,confirmLabel:"Sil",danger:!0})&&(await C.delete(`/jt/roles/${encodeURIComponent(e.id)}`),n.close(),R("Rol silindi","success"),a==null||a())}))}function ga(e,t,a,i){const s=!!e,n=Re({title:s?e.name:"Yeni kullanıcı",body:`
    <form class="jt-form" id="uf">
      <div class="jt-2">
        ${ie("Ad soyad",`<input name="name" required maxlength="80" value="${u((e==null?void 0:e.name)||"")}" />`)}
        ${ie("Kullanıcı adı",`<input name="username" required minlength="3" maxlength="40" pattern="[a-z0-9._-]+" value="${u((e==null?void 0:e.username)||"")}" ${s?"disabled":""} placeholder="ad.soyad" />`)}
      </div>
      <div class="jt-2">
        ${ie("Rol",`<select name="role">${ve(t.map(l=>[l.id,l.label]),(e==null?void 0:e.role)||"operator")}</select>`)}
        ${a.length?ie("Birim",`<select name="department"><option value="">— Seçilmedi —</option>${ve([...a.map(l=>[l.name,l.name]),...e!=null&&e.department&&!a.some(l=>l.name===e.department)?[[e.department,e.department]]:[]],(e==null?void 0:e.department)||"")}</select>`):ie("Bölüm",`<input name="department" maxlength="60" value="${u((e==null?void 0:e.department)||"")}" />`)}
      </div>
      <div class="jt-2">
        ${ie("Unvan",`<input name="title" maxlength="80" value="${u((e==null?void 0:e.title)||"")}" />`)}
        ${ie("Telefon",`<input name="phone" maxlength="30" value="${u((e==null?void 0:e.phone)||"")}" />`)}
      </div>
      ${ie("E-posta",`<input type="email" name="email" maxlength="80" value="${u((e==null?void 0:e.email)||"")}" />`)}
      ${s?`<label class="jt-toggle"><input type="checkbox" name="active" ${e.active?"checked":""}/> Hesap aktif</label>`:'<p class="muted small">Kayıttan sonra tek seferlik geçici şifre gösterilir; kullanıcı ilk girişte şifresini değiştirmelidir.</p>'}
      <div class="jt-actions">
        ${s?'<button type="button" class="btn btn-secondary" id="uf-reset"><i class="ph ph-key"></i> Şifreyi sıfırla</button>':""}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>`});n.body.querySelector("[data-close]").onclick=n.close;const r=(l,p)=>{const c=Re({title:p,body:`<div class="jt-secret"><p><b>${u(l.data.username)}</b> için geçici şifre:</p><code>${u(l.data.temporaryPassword)}</code><p class="muted small">Bu şifre yalnızca şimdi gösterilir. Kullanıcıya güvenli bir yolla iletin; ilk girişte değiştirmesi istenecek.</p><div class="jt-actions"><button class="btn btn-primary" data-close>Tamam</button></div></div>`});c.body.querySelector("[data-close]").onclick=c.close};n.body.querySelector("#uf").onsubmit=l=>{l.preventDefault();const p=Object.fromEntries(new FormData(l.target));s&&(p.active=l.target.active.checked),xe(l.submitter,async()=>{const c=s?await C.put(`/jt/users/${e.id}`,p):await C.post("/jt/users",p);n.close(),i==null||i(),s?R("Kullanıcı güncellendi","success"):r(c,"Kullanıcı oluşturuldu")})};const d=n.body.querySelector("#uf-reset");d&&(d.onclick=()=>xe(d,async()=>{if(!await Se({title:"Şifre sıfırlansın mı?",message:`${e.name} için yeni bir geçici şifre oluşturulacak. Eski şifresi çalışmaz.`,confirmLabel:"Şifreyi sıfırla",danger:!0}))return;const p=await C.post(`/jt/users/${e.id}/reset-password`,{});n.close(),r(p,"Şifre sıfırlandı")}))}const Gn=Object.freeze(Object.defineProperty({__proto__:null,render:Va},Symbol.toStringTag,{value:"Module"})),Yn=[["overview","Özet","ph-squares-four",()=>!0],["projects","Projeler","ph-folders",()=>!0],["orders","Siparişler","ph-package",()=>!0],["jobs","İşler","ph-list-checks",()=>!0],["performance","Performans","ph-gauge",()=>fe("jt.performance.all")||fe("jt.performance.own")],["alerts","Uyarılar","ph-bell-ringing",()=>!0],["team","Ekip & Yetki","ph-lock-key",()=>fe("jt.users.manage")]],Vn={overview:In,projects:Rn,orders:Bn,jobs:Hn,performance:On,alerts:_n,team:Gn};function Qn(){var c;const e=document.createElement("div");e.className="page-container page-jobs",e.appendChild(ce({title:((c=z.modules.jobTracking)==null?void 0:c.label)||"İş & Durum Takip",showBack:!0,gradientClass:"gradient-stock"}));const t=document.createElement("div");t.className="content-area",t.innerHTML=Ie(),e.appendChild(t);let i=W.getQueryParams().tab||sessionStorage.getItem("jt_tab")||"overview",s=null;const n={go(o,m={}){o==="jobs"&&Rs(m),d(o)},openJob:(o,m)=>Mt(o,n,m||l),openOrder:(o,m)=>Zt(o,n,m||l),openProject:(o,m)=>Wt(o,n,m||l),openUser:o=>ea(o,n),newJob:(o,m)=>Ya(n,o,m||l),openLink(o){const[m,h]=String(o).split(":");h&&(m==="job"?n.openJob(h):m==="order"?n.openOrder(h):m==="project"?n.openProject(h):m==="user"&&n.openUser(h))},setAlertCounts(o){ue.alertCounts=o;const m=(o.critical||0)+(o.warning||0),h=e.querySelector('[data-tab="alerts"] .jt-badge-n');h&&(h.textContent=m,h.hidden=!m,h.classList.toggle("crit",!!o.critical))}};function r(){const o=Yn.filter(m=>m[3]());o.some(m=>m[0]===i)||(i="overview"),t.innerHTML=`
      <div class="jt-user"><span><i class="ph ph-user-circle"></i> ${u(ue.me.name)} <em>${u(ue.me.roleLabel||ue.me.role)}</em></span></div>
      <nav class="jt-tabs" role="tablist">${o.map(([m,h,b])=>`<button role="tab" class="${m===i?"active":""}" data-tab="${m}"><i class="ph ${b}"></i><span>${h}</span>${m==="alerts"?'<b class="jt-badge-n" hidden></b>':""}</button>`).join("")}</nav>
      <div id="jt-view" class="jt-view"></div>`,n.setAlertCounts(ue.alertCounts),t.querySelector(".jt-tabs").onclick=m=>{const h=m.target.closest("[data-tab]");h&&d(h.dataset.tab)}}function d(o){i=o,sessionStorage.setItem("jt_tab",i),t.querySelectorAll(".jt-tabs button").forEach(h=>h.classList.toggle("active",h.dataset.tab===i));const m=t.querySelector("#jt-view");m&&(m.onclick=null,Vn[i].render(m,n))}const l=()=>d(i);async function p(){if(!e.isConnected){clearInterval(s);return}try{const o=(await C.get("/jt/alerts")).data;n.setAlertCounts(o.counts);const m=new Set(JSON.parse(sessionStorage.getItem("jt_seen")||"[]")),h=o.alerts.filter(b=>b.severity==="critical"&&!m.has(b.key));h.length&&m.size&&R(`${h.length} yeni kritik uyarı: ${h[0].title}`,"warning",6e3),o.alerts.forEach(b=>m.add(b.key)),sessionStorage.setItem("jt_seen",JSON.stringify([...m].slice(-300)))}catch{}}return(async()=>{try{if(await Ma(!0),!fe("jt.view")){t.innerHTML=Me({message:"İş takip modülünü görme yetkiniz yok."});return}r(),d(i),p(),s=setInterval(p,6e4)}catch(o){const m=/404|Bulunamad/i.test(o.message||"");t.innerHTML=Me({message:m?"Bu şirketin backend’i İş Takip modülünü desteklemiyor. Yönetim Paneli > Bağlantı bölümünden doğru API adresini seçin veya modülü kapatın.":o.message})}})(),e}const Kt=e=>Number(e||0).toLocaleString("tr-TR");async function Jn(e){e.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';let t=[],a=[],i=[],s="",n="",r=!1;const d=new Set;async function l(){const[q,g,E]=await Promise.all([C.get("/products"),C.get("/warehouses"),C.get("/warehouse-balances")]);t=q.success?q.data:[],a=g.success?g.data:[],i=E.success?E.data:[]}try{await l()}catch(q){e.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${u(q.message)}</div></div>`;return}e.innerHTML=`
    <div class="sm-toolbar">
      <div class="input-field sm-search">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="search" id="sm-q" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" />
      </div>
      <div class="input-field sm-wh">
        <span class="input-icon"><i class="ph ph-warehouse"></i></span>
        <select id="sm-wh" class="input-element">
          <option value="">Tüm depolar</option>
          ${a.map(q=>`<option value="${u(q.id)}">${u(q.name)}</option>`).join("")}
        </select>
      </div>
      <label class="sm-check"><input type="checkbox" id="sm-stocked" /> Yalnızca stoklu ürünler</label>
    </div>
    <div class="sm-summary" id="sm-summary"></div>
    <div id="sm-list"></div>`;const p=e.querySelector("#sm-list"),c=e.querySelector("#sm-summary"),o=(q,g)=>{var E;return((E=i.find(f=>f.productId===q&&f.warehouseId===g))==null?void 0:E.qty)||0},m=q=>n?[a.find(g=>g.id===n)].filter(Boolean):a.filter(g=>o(q.id,g.id)>0);function h(q,g){const E=o(q.id,g.id);return`
      <div class="sm-row" data-wid="${u(g.id)}">
        <span class="sm-wh-name"><i class="ph ph-warehouse"></i> ${u(g.name)}</span>
        <div class="sm-stepper">
          <button type="button" data-act="dec" aria-label="Azalt" ${E<=0?"disabled":""}><i class="ph ph-minus"></i></button>
          <input type="number" min="0" step="1" value="${E}" data-role="qty" inputmode="numeric" aria-label="Depodaki miktar" />
          <button type="button" data-act="inc" aria-label="Artır"><i class="ph ph-plus"></i></button>
        </div>
      </div>`}function b(){const q=s.toLocaleLowerCase("tr");let g=t.filter(f=>!q||[f.name,f.code,f.barcode].some(x=>String(x||"").toLocaleLowerCase("tr").includes(q)));r&&(g=g.filter(f=>f.stock>0));const E=g.reduce((f,x)=>f+(x.stock||0),0);if(c.innerHTML=`<b>${Kt(g.length)}</b> ürün · toplam <b>${Kt(E)}</b> adet stok`,!g.length){p.innerHTML='<div class="empty-state"><div class="empty-icon"><i class="ph ph-package"></i></div><div class="empty-text">Ürün bulunamadı</div></div>';return}p.innerHTML=g.map(f=>{const x=m(f),A=a.filter(j=>!x.some(M=>M.id===j.id));return`
      <div class="sm-card" data-pid="${u(f.id)}">
        <div class="sm-head">
          <div class="sm-title">
            <div class="sm-name">${u(f.name)}</div>
            <div class="sm-meta">${u(f.code||"")}${f.barcode?" · "+u(f.barcode):""}${f.category?" · "+u(f.category):""}</div>
          </div>
          <div class="sm-total ${f.stock<=0?"zero":""}"><b>${Kt(f.stock)}</b><span>${u(f.unit||"Adet")}</span></div>
          <button type="button" class="sm-del" data-act="delete" title="Ürünü sil" aria-label="Ürünü sil"><i class="ph ph-trash"></i></button>
        </div>
        ${x.length?x.map(j=>h(f,j)).join(""):'<div class="sm-empty">Hiçbir depoda stok yok.</div>'}
        ${A.length?`
        <div class="sm-add">
          <select data-role="add-wh" aria-label="Depo seç">
            <option value="">Başka depoya stok ekle…</option>
            ${A.map(j=>`<option value="${u(j.id)}">${u(j.name)}</option>`).join("")}
          </select>
          <input type="number" data-role="add-qty" min="1" step="1" placeholder="Adet" inputmode="numeric" />
          <button type="button" class="btn btn-secondary" data-act="add"><i class="ph ph-plus"></i> Ekle</button>
        </div>`:""}
      </div>`}).join("")}async function v(q,g,E){const f=q+"|"+g;if(!d.has(f)){d.add(f);try{const x=await C.post("/stock-adjust",{productId:q,warehouseId:g,...E});if(!x.success)throw new Error(x.message||"Güncellenemedi");const{before:A,after:j}=x.data,M=t.find(N=>N.id===q);M&&(M.stock=Math.max(0,(M.stock||0)+(j-A)));const S=i.find(N=>N.productId===q&&N.warehouseId===g);S?S.qty=j:i.push({productId:q,warehouseId:g,qty:j}),R(x.message,"success")}catch(x){R(x.message,"error")}finally{d.delete(f),b()}}}p.addEventListener("click",async q=>{const g=q.target.closest("[data-act]");if(!g)return;const E=g.closest(".sm-card"),f=E.dataset.pid,x=t.find(j=>j.id===f),A=g.dataset.act;if(A==="inc"||A==="dec")v(f,g.closest(".sm-row").dataset.wid,{delta:A==="inc"?1:-1});else if(A==="add"){const j=E.querySelector('[data-role="add-wh"]').value,M=parseInt(E.querySelector('[data-role="add-qty"]').value,10);if(!j)return R("Depo seçin","warning");if(!(M>0))return R("Geçerli bir adet girin","warning");v(f,j,{delta:M})}else if(A==="delete"){const j=(x.stock||0)>0;if(!await Se({title:"Ürün silinsin mi?",message:j?`"${x.name}" ürününde ${Kt(x.stock)} adet stok var. Silerseniz stok kaydı da silinir. Bu işlem geri alınamaz.`:`"${x.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,confirmLabel:"Sil",danger:!0}))return;try{const S=await C.delete(`/products/${encodeURIComponent(f)}${j?"?force=1":""}`);if(!S.success)throw new Error(S.message);t=t.filter(N=>N.id!==f),i=i.filter(N=>N.productId!==f),R(S.message,"success"),b()}catch(S){R(S.message,"error")}}}),p.addEventListener("change",q=>{const g=q.target.closest('[data-role="qty"]');if(!g)return;const E=g.closest(".sm-card").dataset.pid,f=g.closest(".sm-row").dataset.wid,x=parseInt(g.value,10);if(!(x>=0))return R("Geçerli bir miktar girin","warning"),b();x!==o(E,f)&&v(E,f,{setTo:x,reason:"Elle düzeltme"})}),p.addEventListener("keydown",q=>{q.key==="Enter"&&q.target.matches("input")&&(q.preventDefault(),q.target.blur())});let L;e.querySelector("#sm-q").addEventListener("input",q=>{clearTimeout(L),L=setTimeout(()=>{s=q.target.value.trim(),b()},150)}),e.querySelector("#sm-wh").addEventListener("change",q=>{n=q.target.value,b()}),e.querySelector("#sm-stocked").addEventListener("change",q=>{r=q.target.checked,b()}),b()}const Wn=["Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj","Genel"],Zn=["Adet","Kova","Kutu","Şişe","Bidon","Paket","Kg","Litre"];function Xn(){const e=document.createElement("div");e.className="page-stock-detail page-container";const t=ce({title:nt("stockDetail",qt("stokDetay","Stok Detay")),gradientClass:"gradient-stock"});e.appendChild(t);const a=document.createElement("div");return a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a),setTimeout(async()=>{var g;const i=e.querySelector("#stock-search-input"),s=e.querySelector("#stock-search-btn"),n=e.querySelector("#btn-scan-barcode"),r=e.querySelector("#warehouse-select"),d=e.querySelector("#stock-result-area");let l=[],p=[],c=[];try{const[E,f,x]=await Promise.all([C.getWarehouses(),C.get("/products"),C.get("/warehouse-balances")]);E.success&&(p=E.data),f.success&&(l=f.data),x.success&&(c=x.data),r.innerHTML='<option value="">Tüm Depolar</option>'+p.map(A=>`<option value="${A.id}">${u(A.name)}</option>`).join("")}catch(E){console.error("Veri yükleme hatası:",E)}async function o(){try{const[E,f]=await Promise.all([C.get("/products"),C.get("/warehouse-balances")]);E.success&&(l=E.data),f.success&&(c=f.data)}catch{}}function m(E){var A;const f=E||((A=i==null?void 0:i.value)==null?void 0:A.trim()),x=r.value;d.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>',setTimeout(()=>{let j=l;if(f){const M=f.toLowerCase();j=j.filter(S=>S.code&&S.code.toLowerCase().includes(M)||S.barcode&&S.barcode===f||S.name&&S.name.toLowerCase().includes(M))}j.length>0?b(j,d,x):h(f,d,x)},200)}function h(E,f,x){f.innerHTML=`
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
                ${Wn.map(j=>`<option value="${j}">${j}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label style="font-weight:600; font-size:13px; margin-bottom:4px; display:block;">Birim</label>
              <select class="input-element" id="new-prod-unit">
                ${Zn.map(j=>`<option value="${j}">${j}</option>`).join("")}
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
      `;const A=e.querySelector("#btn-save-new-prod");A==null||A.addEventListener("click",async()=>{const j=e.querySelector("#new-prod-barcode").value,M=e.querySelector("#new-prod-name").value.trim(),S=e.querySelector("#new-prod-category").value,N=e.querySelector("#new-prod-unit").value,B=e.querySelector("#new-prod-qty").value;if(!M)return R("Lütfen ürün adı girin","warning");if(!B||B<=0)return R("Geçerli miktar girin","warning");A.disabled=!0,A.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const O=await C.post("/purchase",{barcode:j,name:M,quantity:B,warehouseId:x,category:S,unit:N});O.success?(R(O.message,"success"),await o(),m(j)):(R(O.message||"Hata oluştu","error"),A.disabled=!1,A.innerHTML='<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet')}catch(O){R("Kayıt hatası: "+O.message,"error"),A.disabled=!1,A.innerHTML='<i class="ph ph-plus-circle"></i> Yeni Ürünü Kaydet'}})}function b(E,f,x){var M;const A=(M=p.find(S=>S.id===x))==null?void 0:M.name,j=(S,N)=>{var B;return((B=c.find(O=>O.productId===S&&O.warehouseId===N))==null?void 0:B.qty)||0};f.innerHTML=E.map((S,N)=>`
        <div class="stock-result-card animate-fade-in-up stagger-${N%5+1}" style="margin-top: 16px;">
          <div class="stock-result-header">
            <div class="stock-icon"><i class="ph ph-package"></i></div>
            <div>
              <div class="stock-name">${u(S.name)}</div>
              <div class="stock-code">${u(S.code)}</div>
            </div>
          </div>

          <div class="stock-chips">
            <span class="stock-chip varyant"><i class="ph ph-barcode"></i> ${S.barcode||"Barkod Yok"}</span>
            <span class="stock-chip zemin"><i class="ph ph-tag"></i> ${S.category||"Belirtilmedi"}</span>
            <span class="stock-chip net" style="background: var(--color-stock); color:white;">
              <i class="ph ph-archive"></i> ${x?"Toplam Stok":"Stok"}: ${S.stock} ${u(S.unit)}
            </span>
            ${x?`<span class="stock-chip" style="background: var(--success); color:white;"><i class="ph ph-warehouse"></i> ${A}: ${j(S.id,x)} ${u(S.unit)}</span>`:""}
          </div>
          ${x?"":`<div class="sd-meta"><i class="ph ph-warehouse"></i> <span>${c.filter(B=>B.productId===S.id).map(B=>`${u(B.warehouseName)}: <b>${B.qty}</b>`).join(" &nbsp;•&nbsp; ")||"Depo kaydı yok"}</span></div>`}
          ${S.price?`<div class="sd-meta"><i class="ph ph-currency-circle-dollar"></i> <span>Birim Fiyat: ${S.price.toLocaleString("tr-TR")} ₺</span></div>`:""}

          <div class="sd-add">
            <div class="sd-add-title"><i class="ph ph-package"></i> Mal Kabul / Stok Ekle</div>
            <div class="sd-add-row">
              <input type="number" id="add-qty-${S.id}" class="sd-qty" value="1" min="1" inputmode="numeric" aria-label="Eklenecek miktar" />
              <button class="btn btn-primary" id="btn-add-${S.id}">
                <i class="ph ph-plus-circle"></i> Ekle
              </button>
            </div>
          </div>
        </div>
      `).join(""),E.forEach(S=>{const N=f.querySelector(`#btn-add-${S.id}`);N==null||N.addEventListener("click",async()=>{var O;const B=f.querySelector(`#add-qty-${S.id}`).value;if(!B||B<=0)return R("Geçerli miktar girin","warning");N.disabled=!0,N.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const F=await C.post("/purchase",{barcode:S.barcode,name:S.name,quantity:B,warehouseId:x});F.success?(R(F.message,"success"),await o(),m(((O=i==null?void 0:i.value)==null?void 0:O.trim())||"")):(R(F.message||"Hata","error"),N.disabled=!1,N.innerHTML='<i class="ph ph-plus-circle"></i> Ekle')}catch(F){R("Hata: "+F.message,"error"),N.disabled=!1,N.innerHTML='<i class="ph ph-plus-circle"></i> Ekle'}})})}s==null||s.addEventListener("click",()=>m()),ft(i,E=>{i.value=E,m(E)});const v=e.querySelector("#view-query"),L=e.querySelector("#view-manage");let q=!1;e.querySelectorAll(".seg-tab").forEach(E=>E.addEventListener("click",()=>{e.querySelectorAll(".seg-tab").forEach(x=>x.classList.toggle("active",x===E));const f=E.dataset.view==="manage";v.hidden=f,L.hidden=!f,f?(Jn(L),q=!0):q&&o().then(()=>m())})),r==null||r.addEventListener("change",()=>m()),n==null||n.addEventListener("click",()=>{vt(E=>{R("Barkod Okundu: "+E,"success"),i.value=E,m(E)})}),m(),W.getQueryParams().tab==="manage"&&((g=e.querySelector('.seg-tab[data-view="manage"]'))==null||g.click())},0),e}function er(){const e=document.createElement("div");e.className="page-serial-detail page-container";const t=ce({title:qt("seriDetay","Seri Detay"),gradientClass:"gradient-serial"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a),setTimeout(()=>{const s=e.querySelector("#serial-search-input"),n=e.querySelector("#serial-search-btn");async function r(){var p;const d=(p=s==null?void 0:s.value)==null?void 0:p.trim();if(!d){R("Lütfen seri numarası girin","warning");return}const l=e.querySelector("#serial-result-area");l.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';try{const c=await C.get(`/serials/${encodeURIComponent(d)}`);c.success&&c.data?await i(c.data,l):l.innerHTML=`
            <div class="empty-state">
              <div class="empty-icon"><i class="ph ph-magnifying-glass"></i></div>
              <div class="empty-text">${u(c.message||"Seri bulunamadı")}</div>
            </div>
          `}catch(c){l.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${u(c.message)}</div></div>`}}n==null||n.addEventListener("click",r),s==null||s.addEventListener("keydown",d=>{d.key==="Enter"&&r()})},0);async function i(s,n){let r="MT",d={items:[],totalCount:0,totalQuantity:0};try{const p=await C.get(`/serials/${encodeURIComponent(s.serialNo)}/others`);p.success&&(d=p.data)}catch{}function l(){var c;const p=(c=s.prices)==null?void 0:c[r];n.innerHTML=`
        <!-- Seri Bilgi Kartı -->
        <div class="serial-info-card gradient-serial animate-fade-in-up">
          <div class="serial-info-inner">
            <div class="serial-no-row">
              <div class="serial-no-icon"><i class="ph ph-device-mobile"></i></div>
              <div>
                <div class="serial-no-label">Seri No</div>
                <div class="serial-no-value">${u(s.serialNo)}</div>
              </div>
            </div>
            <div class="serial-details-grid">
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-package"></i></span>
                <span class="detail-label">Miktar:</span>
                <span class="detail-value">${s.quantity}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-map-pin"></i></span>
                <span class="detail-label">Hücre:</span>
                <span class="detail-value">${u(s.cell)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-factory"></i></span>
                <span class="detail-label">Depo:</span>
                <span class="detail-value">${u(s.warehouseId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-office-chair"></i></span>
                <span class="detail-label">Şube:</span>
                <span class="detail-value">${u(s.branchId)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-folder-open"></i></span>
                <span class="detail-label">Koleksiyon:</span>
                <span class="detail-value">${u(s.collection)}</span>
              </div>
              <div class="serial-detail-row">
                <span class="detail-icon"><i class="ph ph-palette"></i></span>
                <span class="detail-label">Eski Desen:</span>
                <span class="detail-value">${u(s.oldDesen)}</span>
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
              ${Object.keys(s.prices||{}).map(o=>`
                <div class="tab-item ${r===o?"active":""}" data-tab="${o}" style="${r===o?"background: var(--secondary);":""}">${o}</div>
              `).join("")}
            </div>

            ${p?`
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                <span><i class="ph ph-currency-circle-dollar"></i></span>
                <span style="font-weight: 600;">Fiyat Tipi: ${r}</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Kar Oranı</span>
                  <span style="font-weight: 800; color: var(--text-primary);">%${p.profitRate.toFixed(1)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(39,174,96,0.06); border-radius: 10px; border: 1px solid rgba(39,174,96,0.15);">
                  <span style="font-weight: 600; color: var(--color-usd);">Dolar</span>
                  <span style="font-weight: 800; color: var(--color-usd);">$${p.usd}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(230,126,34,0.06); border-radius: 10px; border: 1px solid rgba(230,126,34,0.15);">
                  <span style="font-weight: 600; color: var(--color-eur);">Euro</span>
                  <span style="font-weight: 800; color: var(--color-eur);">€${p.eur}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(231,76,60,0.06); border-radius: 10px; border: 1px solid rgba(231,76,60,0.15);">
                  <span style="font-weight: 600; color: var(--color-try);">TL</span>
                  <span style="font-weight: 800; color: var(--color-try);">${p.try} ₺</span>
                </div>
              </div>
            </div>
            `:""}
          </div>
        </div>

        <!-- Depodaki Diğer Seriler -->
        ${d.totalCount>0?`
        <div class="other-series-section animate-fade-in-up stagger-2">
          <div class="other-series-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span><i class="ph ph-map-pin"></i></span>
              <span class="series-count">Depodaki Diğer Seriler (${d.totalCount})</span>
            </div>
          </div>

          <div class="series-summary">
            <span class="summary-label"><i class="ph ph-package"></i> Toplam ${d.totalCount} Seri</span>
            <span class="summary-badge">Miktar: ${d.totalQuantity.toFixed(2)}</span>
          </div>

          <div class="series-list">
            ${d.items.map((o,m)=>`
              <div class="list-item" style="animation: fadeInUp 200ms ease ${m*60}ms forwards; opacity: 0;">
                <div class="list-icon" style="background: rgba(108,99,255,0.08); color: var(--primary);"><i class="ph ph-device-mobile"></i></div>
                <div class="list-content">
                  <div class="list-title">${u(o.serialNo)}</div>
                  <div class="list-subtitle">Miktar: ${o.quantity}</div>
                </div>
                <div class="list-action">▾</div>
              </div>
            `).join("")}
          </div>
        </div>
        `:""}
      `,n.querySelectorAll(".tab-item").forEach(o=>{o.addEventListener("click",()=>{r=o.dataset.tab,l()})})}l()}return e}const Be=e=>String(e??"").replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function tr(){const e=document.createElement("div");e.className="page-stock-count page-container";const t=ce({title:nt("stockCount","Stok Sayım"),gradientClass:"gradient-primary"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);const i=new Map;return setTimeout(async()=>{var c,o,m;const s=e.querySelector("#sc-warehouse");try{const h=await C.get("/warehouses");h.success&&(s.innerHTML='<option value="">Depo Seçin</option>'+h.data.map(b=>`<option value="${Be(b.id)}">${Be(b.code)} - ${Be(b.name)}</option>`).join(""))}catch{}const n=h=>{i.set(h,(i.get(h)||0)+1),R(`Okunan: ${h}`,"success"),e.querySelector("#sc-result").innerHTML="",p()},r=e.querySelector("#sc-barcode-input"),d=ft(r,n);(c=e.querySelector("#sc-camera-btn"))==null||c.addEventListener("click",()=>vt(n)),(o=e.querySelector("#sc-clear"))==null||o.addEventListener("click",()=>{i.clear(),e.querySelector("#sc-result").innerHTML="",e.querySelector("#sc-diff").textContent=0,p()}),e.querySelector("#sc-items-list").addEventListener("click",h=>{const b=h.target.closest("button[data-code]");if(!b)return;const v=b.dataset.code;if(b.dataset.act==="inc")i.set(v,(i.get(v)||0)+1);else if(b.dataset.act==="dec"){const L=(i.get(v)||0)-1;L>0?i.set(v,L):i.delete(v)}else i.delete(v);p()}),(m=e.querySelector("#sc-submit"))==null||m.addEventListener("click",async()=>{const h=s.value;if(!h){R("Lütfen sayım yapılacak depoyu seçin","warning");return}if(d.flush(),i.size===0){R("Lütfen en az bir ürün okutun","warning");return}const b=e.querySelector("#sc-submit");b.disabled=!0,b.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const v=await C.post("/stock-count",{warehouseId:h,items:[...i].map(([L,q])=>({code:L,counted:q}))});v.success?(R(v.message,"success"),l(v.data),i.clear(),p(),e.querySelector("#sc-total").textContent=v.data.total||0,e.querySelector("#sc-ok").textContent=v.data.matched||0,e.querySelector("#sc-diff").textContent=v.data.diff||0):R(v.message||"Hata oluştu","error")}catch(v){R("Kayıt hatası: "+v.message,"error")}b.disabled=!1,b.innerHTML='<i class="ph ph-cloud-arrow-up" style="margin-right:5px;"></i>Sayımı Kaydet'});function l(h){const b=(h==null?void 0:h.details)||[];b.length&&(e.querySelector("#sc-result").innerHTML=`
        <div class="card animate-fade-in-up" style="padding: 14px;">
          <div style="font-weight: 700; margin-bottom: 8px;"><i class="ph ph-list-checks"></i> Sayım Sonucu</div>
          ${b.map(v=>`
            <div style="display:flex; justify-content:space-between; gap:10px; padding:8px 0; border-top:1px solid var(--divider); font-size:13px;">
              <div style="min-width:0;">
                <div style="font-weight:600;">${Be(v.name||v.code)}</div>
                <div style="color:var(--text-secondary);">${Be(v.code)}${v.known?"":" · sistemde kayıtlı değil"}</div>
              </div>
              <div style="text-align:right; white-space:nowrap;">
                <div>Sayılan: <b>${v.counted}</b> / Sistem: <b>${v.system}</b></div>
                <div style="font-weight:700; color:${v.diff===0?"var(--success)":"var(--error)"};">${v.diff===0?"Eşleşti":(v.diff>0?"+":"")+v.diff+" fark"}</div>
              </div>
            </div>`).join("")}
        </div>`)}function p(){const h=[...i.values()].reduce((v,L)=>v+L,0);e.querySelector("#sc-total").textContent=h,e.querySelector("#sc-ok").textContent=i.size;const b=e.querySelector("#sc-items-list");b.innerHTML=[...i].map(([v,L],q)=>`
        <div class="list-item" style="margin-bottom: 6px; animation: fadeInUp 200ms ease ${q*40}ms forwards; opacity: 0;">
          <div class="list-icon" style="background: var(--color-stock-light); color: var(--color-stock);"><i class="ph ph-clipboard-text"></i></div>
          <div class="list-content">
            <div class="list-title">${Be(v)}</div>
            <div class="list-subtitle">Sayılan adet: ${L}</div>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <button data-act="dec" data-code="${Be(v)}" aria-label="Azalt" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-minus"></i></button>
            <button data-act="inc" data-code="${Be(v)}" aria-label="Arttır" style="width:28px;height:28px;border-radius:6px;background:var(--bg-input);cursor:pointer;"><i class="ph ph-plus"></i></button>
            <button data-act="del" data-code="${Be(v)}" aria-label="Sil" style="width:28px;height:28px;border-radius:6px;background:var(--error-light);color:var(--error);cursor:pointer;"><i class="ph ph-x"></i></button>
          </div>
        </div>
      `).join("")}},0),e}function ar(){const e=document.createElement("div");e.className="page-reports page-container";const t=ce({title:nt("reports","Raporlar"),gradientClass:"gradient-reports"});e.appendChild(t);const a=document.createElement("div");a.className="content-area";const i=z.reportTypes;return a.innerHTML=`
    <div class="report-grid">
      ${i.map((s,n)=>`
        <div class="report-card animate-fade-in-up stagger-${n+1}" data-color="${s.color}" data-route="${s.route}" id="report-${s.id}">
          <div class="report-icon">${s.icon}</div>
          <div class="report-name">${u(s.label)}</div>
        </div>
      `).join("")}
    </div>
  `,e.appendChild(a),setTimeout(()=>{e.querySelectorAll(".report-card").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.route;n&&W.navigate(n)})})},0),e}const sr=new Set(["B","STRONG","I","EM","BR","P","SPAN","UL","LI","TABLE","THEAD","TBODY","TR","TH","TD","SMALL"]);function ir(e){const t=new DOMParser().parseFromString(`<body>${String(e??"")}</body>`,"text/html"),a=i=>{[...i.children].forEach(s=>{if(!sr.has(s.tagName)&&s.tagName!=="I"){s.replaceWith(document.createTextNode(s.textContent));return}[...s.attributes].forEach(n=>{n.name==="class"&&/^[\w\s-]*$/.test(n.value)||n.name==="style"&&/^color:\s*#[0-9a-f]{3,8};?$/i.test(n.value)||s.removeAttribute(n.name)}),a(s)})};return a(t.body),t.body.innerHTML}function nr(){var p;const e=document.createElement("div");e.className="page-copilot page-container",ke.getUser();const t=ce({title:((p=z.modules.copilot)==null?void 0:p.label)||"AI CoPilot",gradientClass:"gradient-copilot",actions:[{icon:'<i class="ph ph-arrows-clockwise"></i>',title:"Yenile",onClick:()=>location.reload()}]});e.appendChild(t);const a=document.createElement("div");a.className="chat-container",a.id="chat-container",e.appendChild(a);const i=document.createElement("div");i.className="chat-input-area",i.innerHTML=`
    <div class="input-field" style="flex: 1;">
      <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." />
    </div>
    <button class="chat-send-btn" id="chat-send-btn"><i class="ph-fill ph-paper-plane-tilt"></i></button>
  `,e.appendChild(i);const s=[];let n={},r=!1;function d(c,o="bot",m=!1,h=[]){const b=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});s.forEach(v=>{v.suggestions=[]}),s.push({text:c,type:o,time:b,html:m,suggestions:h}),l()}function l(){const c=e.querySelector("#chat-container");c.innerHTML=s.map(o=>`
      <div class="chat-message ${o.type}">
        <div class="chat-avatar">
          ${o.type==="user"?'<i class="ph ph-user"></i>':'<i class="ph ph-sparkle"></i>'}
        </div>
        <div class="chat-bubble">
          ${o.typing?'<div class="typing"><i></i><i></i><i></i></div>':o.html?ir(o.text):`<p>${u(o.text)}</p>`}
          ${o.suggestions&&o.suggestions.length?`<div class="chat-chips">${o.suggestions.map(m=>`<button type="button" class="chat-chip" data-q="${u(m)}">${u(m)}</button>`).join("")}</div>`:""}
          ${o.typing?"":`<div class="chat-time">${o.time}</div>`}
        </div>
      </div>
    `).join(""),c.scrollTop=c.scrollHeight}return setTimeout(()=>{d(`Merhaba! Ben ${z.companyName} AI CoPilot. Stok, satış, müşteri, hammadde, satın alma, üretim ve iş takibi hakkında soru sorabilirsiniz; uygulamanın nasıl kullanılacağını da anlatırım.`,"bot",!1,["Stok durumu","Bu ay satışlar","Azalan ürünler","Neler sorabilirim?"]);const c=e.querySelector("#chat-input"),o=e.querySelector("#chat-send-btn");async function m(h){var v;const b=(v=typeof h=="string"?h:c==null?void 0:c.value)==null?void 0:v.trim();if(!(!b||r)){r=!0,o==null||o.setAttribute("disabled",""),d(b,"user"),typeof h!="string"&&(c.value=""),s.push({typing:!0,type:"bot",html:!1,text:"",suggestions:[]}),l();try{const L=await C.post("/copilot/chat",{message:b,company:z.companyName,context:n});s.pop(),L.success?(n=L.data.context||{},d(L.data.message,"bot",!0,L.data.suggestions||[])):d("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.")}catch(L){s.pop(),d(L.message||"Bağlantı hatası oluştu. Lütfen tekrar deneyin.")}finally{r=!1,o==null||o.removeAttribute("disabled"),c==null||c.focus({preventScroll:!0})}}}o==null||o.addEventListener("click",()=>m()),c==null||c.addEventListener("keydown",h=>{h.key==="Enter"&&!h.isComposing&&(h.preventDefault(),m())}),e.querySelector("#chat-container").addEventListener("click",h=>{const b=h.target.closest(".chat-chip");b&&m(b.dataset.q)})},300),e}function rr(){const e=document.createElement("div");e.className="page-settings page-container";const t=ce({title:"Ayarlar",gradientClass:"gradient-primary"});e.appendChild(t);const a=ke.getUser(),i=C.getBaseUrl(),s=document.createElement("div");return s.className="content-area",s.innerHTML=`
    <!-- Kullanıcı Bilgileri -->
    <div class="settings-group animate-fade-in-up">
      <div class="settings-group-title">Kullanıcı Bilgileri</div>
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(108,99,255,0.1); color: var(--primary);"><i class="ph ph-user"></i></div>
          <span class="settings-label">Kullanıcı</span>
          <span class="settings-value">${u((a==null?void 0:a.name)||"-")}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(76,175,80,0.1); color: var(--color-sales);"><i class="ph ph-office-chair"></i></div>
          <span class="settings-label">Şube</span>
          <span class="settings-value">${u((a==null?void 0:a.branchName)||"-")}</span>
        </div>
        <div class="settings-item">
          <div class="settings-icon" style="background: rgba(255,152,0,0.1); color: var(--color-purchase);"><i class="ph ph-key"></i></div>
          <span class="settings-label">Rol</span>
          <span class="settings-value">${u((a==null?void 0:a.role)||"-")}</span>
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
            <input type="url" id="settings-api-url" value="${u(i)}" placeholder="http://sunucu:port" />
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
          <span class="settings-value">${z.version}</span>
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
      ${z.appName} v${z.version}<br>
      © 2026 Tüm Hakları Saklıdır
    </div>
  `,e.appendChild(s),setTimeout(()=>{var m,h,b,v,L;const n=e.querySelector("#install-group"),r=()=>{n.hidden=!qi()};r(),window.addEventListener("pwa-install-state",r),(m=e.querySelector("#install-app"))==null||m.addEventListener("click",async()=>{await Ni()&&R("Uygulama ana ekrana eklendi","success"),r()}),(h=e.querySelector("#clear-cache"))==null||h.addEventListener("click",async()=>{var g,E;if(await Se({title:"Önbellek temizlensin mi?",message:"Uygulama dosyaları yeniden indirilir ve sayfa yenilenir. Kayıtlı verileriniz ve oturumunuz etkilenmez.",confirmLabel:"Temizle ve yenile"})){try{(await((E=(g=navigator.serviceWorker)==null?void 0:g.getRegistrations)==null?void 0:E.call(g))||[]).forEach(x=>{var A;return(A=x.active)==null?void 0:A.postMessage("clear-cache")}),window.caches&&(await caches.keys()).forEach(x=>caches.delete(x))}catch{}location.reload()}}),(b=e.querySelector("#pw-save"))==null||b.addEventListener("click",async()=>{const q=e.querySelector("#pw-current"),g=e.querySelector("#pw-new");if(!q.value||!g.value)return R("Mevcut ve yeni şifreyi girin","warning");try{const E=await C.post("/auth/change-password",{currentPassword:q.value,newPassword:g.value});R(E.message||"Şifre değiştirildi","success"),q.value="",g.value=""}catch(E){R(E.message||"Şifre değiştirilemedi","error")}}),(v=e.querySelector("#save-settings-url"))==null||v.addEventListener("click",()=>{var E;const q=e.querySelector("#settings-api-url"),g=(E=q==null?void 0:q.value)==null?void 0:E.trim();g?(C.setBaseUrl(g),R("API URL kaydedildi","success")):(C.resetBaseUrl(),q.value=C.getBaseUrl(),R("Varsayılan sunucu adresine dönüldü","success"))});const d=e.querySelector("#notify-checkbox");if(d){const q=z.storageKeys.notify;d.checked=localStorage.getItem(q)!=="off",d.addEventListener("change",()=>{localStorage.setItem(q,d.checked?"on":"off"),R(d.checked?"Bildirimler açıldı":"Bildirimler kapatıldı","success")})}(L=e.querySelector("#settings-logout"))==null||L.addEventListener("click",()=>{ke.logout()});const l=e.querySelector("#theme-checkbox"),p=e.querySelector("#theme-icon"),c=e.querySelector("#theme-label"),o=document.body.classList.contains("dark-theme");l&&(l.checked=o),p&&(p.className=o?"ph ph-sun":"ph ph-moon"),c&&(c.textContent=o?"Aydınlık Temaya Geç":"Karanlık Temaya Geç"),l==null||l.addEventListener("change",()=>{const q=l.checked;document.body.classList.toggle("dark-theme",q),localStorage.setItem(z.storageKeys.theme,q?"dark":"light"),p&&(p.className=q?"ph ph-sun":"ph ph-moon"),c&&(c.textContent=q?"Aydınlık Temaya Geç":"Karanlık Temaya Geç"),R(q?"Karanlık tema açıldı":"Aydınlık tema açıldı","success")})},0),e}function lr(){const e=document.createElement("div");e.className="page-container";const t=ce({title:"Hammadde Takibi",showBack:!0,gradientClass:"gradient-stock"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="rm-search" placeholder="Hammadde ara..." />
      </div>
    </div>
    <div id="rm-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(a);const i=a.querySelector("#rm-list"),s=a.querySelector("#rm-search");let n=[];const r=async()=>{const p=await C.getRawMaterials();p.success?(n=p.data,d(n)):i.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'},d=p=>{if(p.length===0){i.innerHTML='<div class="empty-state">Hammadde bulunamadı.</div>';return}i.innerHTML=p.map((c,o)=>{const m=Math.min(100,Math.round(c.stock/c.minStock*100)),b=c.stock<=c.minStock?"var(--error)":"var(--success)";return`
        <div class="list-item animate-fade-in-up stagger-${o%5+1}">
          <div class="list-icon" style="background: rgba(139, 195, 74, 0.1); color: #8bc34a;">
            <i class="ph ph-flask"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${u(c.name)}</div>
            <div class="list-subtitle">${u(c.code)}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Stok Durumu</span>
                <span style="color:${b}; font-weight:600;">${c.stock} ${u(c.unit)}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${m>100?100:m}%; background: ${b};"></div>
              </div>
            </div>
          </div>
          <button class="icon-btn rm-adjust-btn" data-id="${c.id}" data-name="${u(c.name)}" title="Stok Düzenle" style="background:#f4f5f7; border-radius:6px; padding:8px;">
            <i class="ph ph-plus-minus" style="font-size:18px; color:var(--primary);"></i>
          </button>
        </div>
      `}).join(""),i.querySelectorAll(".rm-adjust-btn").forEach(c=>{c.addEventListener("click",()=>{l(c.dataset.id,c.dataset.name)})})},l=(p,c)=>{const o=document.createElement("div");o.className="modal-overlay",o.style.cssText="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center;",o.innerHTML=`
      <div class="card animate-fade-in-up" style="width:90%; max-width:400px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        <h3 style="margin:0 0 16px; font-size:16px;">Hammadde Stok Hareketi</h3>
        <div style="font-weight:600; color:var(--primary); margin-bottom:12px;">${c}</div>
        
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
    `,document.body.appendChild(o),o.querySelector("#adj-cancel").addEventListener("click",()=>o.remove()),o.querySelector("#adj-save").addEventListener("click",async()=>{const m=o.querySelector("#adj-type").value,h=parseFloat(o.querySelector("#adj-qty").value),b=o.querySelector("#adj-note").value.trim();if(!h||h<=0)return R("Lütfen geçerli bir miktar girin.","warning");const v=o.querySelector("#adj-save");v.disabled=!0,v.innerHTML="Kaydediliyor...";try{const L=await C.post("/raw-materials/adjust",{rawMaterialId:p,type:m,quantity:h,note:b});L.success?(o.remove(),r()):(R(L.message||"Kayıt yapılamadı","error"),v.disabled=!1,v.innerHTML="Kaydet")}catch(L){R(L.message||"Sunucu hatası","error"),v.disabled=!1,v.innerHTML="Kaydet"}})};return s.addEventListener("input",p=>{const c=p.target.value.toLowerCase(),o=n.filter(m=>m.name.toLowerCase().includes(c)||m.code.toLowerCase().includes(c));d(o)}),setTimeout(r,0),e}function or(){const e=document.createElement("div");e.className="page-container";const t=ce({title:"Ürün Reçeteleri",showBack:!0,gradientClass:"gradient-sales"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
    <div id="recipes-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(a);const i=a.querySelector("#recipes-list"),s=async()=>{const r=await C.getRecipes(),d=await C.getRawMaterials();r.success&&d.success?n(r.data,d.data):i.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'},n=(r,d)=>{if(r.length===0){i.innerHTML='<div class="empty-state">Reçete bulunamadı.</div>';return}i.innerHTML=r.map((l,p)=>{const c=l.materials.map(o=>{const m=d.find(h=>h.id===o.rawMaterialId);return`
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
            <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${u(m?m.name:"Bilinmeyen")}</span>
            <span style="font-weight:500;">${o.quantity} ${u(m?m.unit:"")}</span>
          </div>
        `}).join("");return`
        <div class="list-item animate-fade-in-up stagger-${p%5+1}" style="flex-direction:column; align-items:stretch;">
          <div style="display:flex; align-items:center; margin-bottom: 12px;">
            <div class="list-icon" style="background: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="ph ph-book-open"></i>
            </div>
            <div class="list-content" style="margin-left:12px;">
              <div class="list-title">${u(l.name)}</div>
              <div class="list-subtitle">Ürün ID: ${u(l.productId)}</div>
            </div>
          </div>
          <div style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
            <div style="font-size:11px; font-weight:600; color:var(--primary); margin-bottom:8px; text-transform:uppercase;">Reçete İçeriği (1 Birim İçin)</div>
            ${c}
          </div>
        </div>
      `}).join("")};return setTimeout(s,0),e}function cr(){const e=document.createElement("div");e.className="page-container";const t=ce({title:"Üretim İşlemi",showBack:!0,gradientClass:"gradient-transfer"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);const i=a.querySelector("#prod-product"),s=a.querySelector("#prod-quantity"),n=a.querySelector("#recipe-preview"),r=a.querySelector("#recipe-preview-content"),d=a.querySelector("#prod-btn");let l=[],p=[];const c=async()=>{const m=await C.getRecipes(),h=await C.getRawMaterials();m.success&&h.success?(l=m.data,p=h.data,i.innerHTML='<option value="">Ürün Seçiniz...</option>'+l.map(b=>`<option value="${u(b.productId)}">${u(b.name.replace(" Reçetesi",""))}</option>`).join("")):i.innerHTML='<option value="">Hata oluştu</option>'},o=()=>{const m=i.value,h=parseInt(s.value)||0;if(!m||h<=0){n.style.display="none";return}const b=l.find(v=>v.productId===m);if(!b){n.style.display="none";return}r.innerHTML=b.materials.map(v=>{const L=p.find(f=>f.id===v.rawMaterialId),q=v.quantity*h,E=L&&L.stock>=q?"var(--success)":"var(--error)";return`
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
          <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${u(L?L.name:"Bilinmeyen")}</span>
          <span style="font-weight:600; color:${E};">${q.toFixed(2)} ${u(L?L.unit:"")}</span>
        </div>
      `}).join(""),n.style.display="block"};return i.addEventListener("change",o),s.addEventListener("input",o),d.addEventListener("click",async()=>{const m=i.value,h=parseInt(s.value)||0;if(!m)return R("Ürün seçmediniz","warning");if(h<=0)return R("Geçerli bir miktar girin","warning");d.disabled=!0,d.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-color:#fff;border-top-color:transparent;"></div>';const b=await C.produceItem(m,h);d.disabled=!1,d.innerHTML='<i class="ph ph-play"></i> Üretimi Başlat',b.success?(R(b.message,"success"),s.value=1,i.value="",n.style.display="none",C.getRawMaterials().then(v=>{v.success&&(p=v.data)})):R(b.message,"error")}),setTimeout(c,0),e}function dr(){const e=document.createElement("div");e.className="page-container";const t=ce({title:"Müşteri Bakiyeleri",showBack:!0,gradientClass:"gradient-reports"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="cb-search" placeholder="Müşteri ara..." />
      </div>
    </div>
    <div class="list-toolbar"><span></span>${je("cb-export")}</div>
    <div id="cb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(a);const i=a.querySelector("#cb-list");a.querySelector("#cb-export").addEventListener("click",()=>{const l=(s.value||"").toLowerCase(),p=n.filter(c=>!l||String(c.name||"").toLowerCase().includes(l));we("Musteri bakiyeleri",[["Müşteri","name"],["Bakiye",c=>c.balance],["Para birimi","currency"]],p)});const s=a.querySelector("#cb-search");let n=[];const r=async()=>{try{const l=await C.getCustomers();l.success?(n=l.data,d(n)):i.innerHTML='<div class="empty-state">Veri yüklenemedi.</div>'}catch{i.innerHTML='<div class="empty-state">Sunucu bağlantısı hatası.</div>'}},d=l=>{if(l.length===0){i.innerHTML='<div class="empty-state">Müşteri bulunamadı.</div>';return}i.innerHTML=l.map((p,c)=>{const o=p.balance<0,m=p.balance===0,h=o?"var(--error)":m?"var(--text-secondary)":"var(--success)";return`
        <div class="list-item animate-fade-in-up stagger-${c%5+1}">
          <div class="list-icon" style="background: rgba(103, 58, 183, 0.1); color: #673ab7;">
            <i class="ph ph-user-circle"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${u(p.name)}</div>
            <div class="list-subtitle">Müşteri ID: ${p.id}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Bakiye</span>
                <span style="color:${h}; font-weight:700; font-size: 16px;">
                  ${p.balance.toLocaleString("tr-TR")} ${u(p.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      `}).join("")};return s.addEventListener("input",l=>{const p=l.target.value.toLowerCase(),c=n.filter(o=>o.name.toLowerCase().includes(p));d(c)}),setTimeout(r,0),e}function pr(){var d;const e=document.createElement("div");e.className="page-container";const t=ce({title:"Yardım & Destek"});e.appendChild(t);const a=document.createElement("div");a.className="content-area";const i=l=>String(l??"").replace(/[&<>"]/g,p=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[p]),s=z.support,r=[s.phone&&{icon:"ph-phone",text:s.phone,href:`tel:${s.phone.replace(/\s/g,"")}`},s.email&&{icon:"ph-envelope-simple",text:s.email,href:`mailto:${s.email}`},s.website&&{icon:"ph-globe",text:s.website,href:/^https?:/.test(s.website)?s.website:`https://${s.website}`}].filter(Boolean).map(l=>`
      <a href="${i(l.href)}" target="_blank" rel="noopener noreferrer" class="card" style="display:flex; align-items:center; gap:10px; padding:12px 14px; color:var(--text-primary); text-decoration:none;">
        <i class="ph ${l.icon}" style="font-size:20px; color:var(--primary);"></i><span>${i(l.text)}</span>
      </a>`).join("");return a.innerHTML=`
    <div class="card animate-fade-in-up" style="padding: 24px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px; color: var(--primary);"><i class="ph ph-lifebuoy"></i></div>
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${i(s.title)}</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        ${i(s.text)}
      </p>
      ${r?`<div style="display:flex; flex-direction:column; gap:8px; max-width:300px; margin:0 auto 16px; text-align:left;">${r}</div>`:""}
      
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch; max-width: 300px; margin: 0 auto;">
        ${(d=z.modules.copilot)!=null&&d.enabled?`<button class="btn btn-primary" data-help="copilot" style="background: var(--primary);">
          <i class="ph ph-sparkle"></i> CoPilot'a Sor
        </button>`:""}
        <button class="btn btn-outline" data-help="back">
          Geri Dön
        </button>
      </div>
    </div>
  `,a.addEventListener("click",l=>{var c;const p=(c=l.target.closest("[data-help]"))==null?void 0:c.dataset.help;p==="copilot"&&(window.location.hash="#/copilot"),p==="back"&&window.history.back()}),e.appendChild(a),e}const Pe=e=>String(e??"").replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]),ls=e=>e?e.split("-").reverse().join("."):"-";function ur(){const e=document.createElement("div");e.className="page-container";const t=ce({title:qt("cekiListesi","Çeki Listesi"),showBack:!0,gradientClass:"gradient-stock"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
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
  `,e.appendChild(a);const i=a.querySelector("#pl-list"),s=a.querySelector("#pl-search"),n=a.querySelector("#btn-complete-packing"),r=a.querySelector("#pl-shipment"),d=a.querySelector("#pl-meta"),l=a.querySelector("#pl-progress");let p=[],c=null,o=[];const m=L=>{c=p.find(q=>q.key===L)||null,o=c?c.items.map(q=>({...q,id:q.productId,targetQuantity:q.quantity,packedQuantity:0,packed:!1})):[],d.innerHTML=c?`
      <div><div style="color: var(--text-secondary);">${Pe(z.terms.customer)}</div><div style="font-weight: 500;">${Pe(c.customerName)}</div></div>
      <div><div style="color: var(--text-secondary);">Sevkiyat Tarihi</div><div style="font-weight: 500;">${ls(c.date)}</div></div>`:"",s.value="",v()},h=async()=>{try{const L=await C.get("/shipments");if(p=L.success?L.data:[],p.length===0){r.innerHTML='<option value="">Bekleyen sevkiyat yok</option>',i.innerHTML='<div class="empty-state">Paketlenecek sevkiyat bulunamadı. Satış yapıldığında burada görünür.</div>',n.disabled=!0;return}n.disabled=!1,r.innerHTML=p.map(q=>`<option value="${Pe(q.key)}">${Pe(q.customerName)} — ${ls(q.date)} (${q.items.length} kalem)</option>`).join(""),m(p[0].key)}catch{i.innerHTML='<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>'}},b=()=>{const L=o.filter(q=>q.packed).length;l.textContent=o.length?`${L} / ${o.length} kalem tamam`:""},v=()=>{b();const L=s.value.trim().toLowerCase(),q=o.filter(g=>!L||[g.name,g.code,g.barcode].some(E=>String(E||"").toLowerCase().includes(L)));if(q.length===0){i.innerHTML='<div class="empty-state">Ürün bulunamadı.</div>';return}i.innerHTML=q.map((g,E)=>`
      <div class="list-item animate-fade-in-up stagger-${E%5+1}" style="opacity: ${g.packed?"0.65":"1"}; transition: all 0.3s;">
        <div class="list-icon" style="background: ${g.packed?"var(--success)":"rgba(255, 152, 0, 0.1)"}; color: ${g.packed?"#fff":"#FF9800"};">
          <i class="ph ${g.packed?"ph-check":"ph-package"}"></i>
        </div>
        <div class="list-content" style="flex: 1;">
          <div class="list-title" style="text-decoration: ${g.packed?"line-through":"none"};">${Pe(g.name)}</div>
          <div class="list-subtitle">${Pe(g.code)} | Hedef: ${g.targetQuantity} ${Pe(g.unit)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn-decrement" data-id="${Pe(g.id)}" aria-label="Azalt" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-minus"></i></button>
          <span style="font-weight: 600; min-width: 28px; text-align: center;">${g.packedQuantity}</span>
          <button class="btn-increment" data-id="${Pe(g.id)}" aria-label="Arttır" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); cursor: pointer;"><i class="ph ph-plus"></i></button>
          <button class="btn-fill" data-id="${Pe(g.id)}" title="Tamamını paketle" aria-label="Tamamını paketle" style="width: 30px; height: 30px; border-radius: 6px; border: none; background: var(--primary); color: #fff; cursor: pointer;"><i class="ph ph-checks"></i></button>
        </div>
      </div>
    `).join("")};return i.addEventListener("click",L=>{const q=L.target.closest("button[data-id]");if(!q)return;const g=o.find(E=>E.id===q.dataset.id);if(g){if(q.classList.contains("btn-increment")&&g.packedQuantity<g.targetQuantity)g.packedQuantity++;else if(q.classList.contains("btn-decrement")&&g.packedQuantity>0)g.packedQuantity--;else if(q.classList.contains("btn-fill"))g.packedQuantity=g.targetQuantity;else return;g.packed=g.packedQuantity>=g.targetQuantity,v()}}),r.addEventListener("change",()=>m(r.value)),s.addEventListener("input",v),n.addEventListener("click",async()=>{var L;if(c){if(!o.every(q=>q.packed)){R("Eksik paketlenen ürünler var!","warning");return}n.disabled=!0;try{const q=await C.post("/packing-lists",{shipmentKey:c.key,customerId:c.customerId,customerName:c.customerName,createdBy:((L=ke.getUser())==null?void 0:L.name)||"",items:o.map(g=>({productId:g.productId,code:g.code,name:g.name,quantity:g.packedQuantity,unit:g.unit}))});q.success?(R("Çeki listesi başarıyla tamamlandı!","success"),await h()):(R(q.message||"Kaydedilemedi","error"),n.disabled=!1)}catch(q){R("Hata: "+q.message,"error"),n.disabled=!1}}}),setTimeout(h,0),e}const et=e=>String(e??"").replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function mr(){const e=document.createElement("div");e.className="page-container";const t=ce({title:qt("seriAmbar","Seri Ambar Bakiye"),showBack:!0,gradientClass:"gradient-transfer"});e.appendChild(t);const a=document.createElement("div");a.className="content-area",a.innerHTML=`
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="swb-search" placeholder="Stok kodu, barkod veya ürün adı ara..." />
      </div>
    </div>

    <div id="swb-tabs" class="filter-tabs animate-fade-in-down stagger-1" style="display: flex; gap: 10px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 5px;"></div>

    <div class="list-toolbar">
      <div id="swb-summary" style="font-size: 13px; color: var(--text-secondary);"></div>
      ${je("swb-export")}
    </div>

    <div id="swb-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `,e.appendChild(a);const i=a.querySelector("#swb-list"),s=a.querySelector("#swb-search"),n=a.querySelector("#swb-tabs"),r=a.querySelector("#swb-summary");let d=[],l=[],p="all";const c=v=>"padding: 6px 14px; border-radius: 20px; border: none; white-space: nowrap; cursor: pointer; font-weight: 600; font-size: 13px; "+(v?"background: var(--primary); color: #fff;":"background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow-sm);"),o=()=>{n.innerHTML=[{id:"all",name:"Tümü"},...l.map(v=>({id:v.id,name:`Şube ${v.code||v.id}`}))].map(v=>`<button class="filter-tab ${p===v.id?"active":""}" data-branch="${et(v.id)}" style="${c(p===v.id)}">${et(v.name)}</button>`).join("")};let m=[];const h=()=>{const v=s.value.trim().toLowerCase(),L=d.filter(g=>(p==="all"||g.branchId===p)&&(!v||[g.code,g.barcode,g.name,g.warehouseName].some(E=>String(E||"").toLowerCase().includes(v))));m=L;const q=L.reduce((g,E)=>g+E.qty,0);if(r.innerHTML=L.length?`<b>${L.length}</b> kayıt · toplam <b>${q.toLocaleString("tr-TR")}</b> adet`:"",L.length===0){i.innerHTML='<div class="empty-state">Bakiye bulunamadı.</div>';return}i.innerHTML=L.map((g,E)=>`
      <div class="list-item animate-fade-in-up stagger-${E%5+1}">
        <div class="list-icon" style="background: rgba(33, 150, 243, 0.1); color: #2196F3;">
          <i class="ph ph-barcode"></i>
        </div>
        <div class="list-content">
          <div class="list-title">${et(g.barcode||g.code)}</div>
          <div class="list-subtitle">${et(g.code)} - ${et(g.name)}</div>
          <div style="display: flex; gap: 12px; margin-top: 5px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
            <span><i class="ph ph-warehouse"></i> ${et(g.warehouseName||g.warehouseId)}</span>
            <span style="font-weight: 600; color: var(--text-primary);"><i class="ph ph-stack"></i> ${g.qty.toLocaleString("tr-TR")} ${et(g.unit)}</span>
          </div>
        </div>
      </div>
    `).join("")},b=async()=>{try{const[v,L]=await Promise.all([C.get("/warehouse-balances"),C.get("/branches")]);if(d=v.success?v.data:[],l=L.success?L.data:[],o(),d.length===0){i.innerHTML='<div class="empty-state">Seri bakiye verisi bulunamadı.</div>';return}h()}catch{i.innerHTML='<div class="empty-state">Veri yüklenemedi. Sunucu bağlantısını kontrol edin.</div>'}};return n.addEventListener("click",v=>{const L=v.target.closest("[data-branch]");L&&(p=L.dataset.branch,o(),h())}),s.addEventListener("input",h),a.querySelector("#swb-export").addEventListener("click",()=>we("Seri ambar bakiye",[["Stok kodu","code"],["Barkod","barcode"],["Ürün","name"],["Kategori","category"],["Depo","warehouseName"],["Şube","branchName"],["Miktar",v=>v.qty],["Birim","unit"]],m)),setTimeout(b,0),e}function hr(){const e=document.createElement("div");e.className="page-operations dash";const t=Object.values(z.modules),a=i=>{const s=t.findIndex(n=>n.section===i.id&&n.enabled);return s===-1?999:s};return e.innerHTML='<label class="op-search"><i class="ph ph-magnifying-glass"></i><input type="search" placeholder="Modül veya menü ara…" autocomplete="off" /></label>'+[...z.sections].sort((i,s)=>a(i)-a(s)).map(i=>{const s=Object.entries(z.modules).filter(([n,r])=>r.section===i.id&&r.enabled&&At(n)).map(([,n])=>n);return s.length?`
      <h2 class="dash-h">${u(i.title)}</h2>
      <div class="op-list">
        ${s.map(n=>`
          <a class="op-item" data-route="${n.route}">
            <span class="tile-icon">${n.icon}</span>
            <span class="op-text"><b>${u(n.label)}</b><small>${u(n.description||"")}</small></span>
            <i class="ph ph-caret-right"></i>
          </a>`).join("")}
      </div>`:""}).join(""),Ts(e.querySelector(".op-search input"),{host:e.querySelector(".op-search")}),e.addEventListener("click",i=>{const s=i.target.closest("[data-route]");s&&W.navigate(s.dataset.route)}),e}const br={Satış:"ph-storefront",Alış:"ph-shopping-cart",Depo:"ph-warehouse",Üretim:"ph-factory","İş Takip":"ph-kanban",Kullanıcı:"ph-user-gear"},vr={Satış:"#22A06B",Alış:"#F0A93B",Depo:"#0EA5E9",Üretim:"#A855F7","İş Takip":"#E5484D",Kullanıcı:"#64748B"},Fe=e=>String(e).padStart(2,"0"),Qe=e=>`${e.getFullYear()}-${Fe(e.getMonth()+1)}-${Fe(e.getDate())}`,fr=e=>{const t=new Date(e);return isNaN(t)?"":`${Fe(t.getDate())}.${Fe(t.getMonth()+1)}.${t.getFullYear()} ${Fe(t.getHours())}:${Fe(t.getMinutes())}`},gr=e=>{const t=new Date(e),a=new Date,i=new Date(Date.now()-864e5);return Qe(t)===Qe(a)?"Bugün":Qe(t)===Qe(i)?"Dün":t.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric",weekday:"long"})},os=[["today","Bugün"],["yesterday","Dün"],["7","Son 7 gün"],["30","Son 30 gün"],["month","Bu ay"],["lastmonth","Geçen ay"],["all","Tümü"],["custom","Özel aralık"]],Bs=e=>{const[t,a,i]=e.split("-").map(Number);return new Date(t,a-1,i,0,0,0,0)},yr=e=>{const t=Bs(e);return t.setDate(t.getDate()+1),t};function kr(e,t){const a=new Date,i=Qe(a),s=n=>{const r=new Date;return r.setDate(r.getDate()-n),Qe(r)};switch(e){case"today":return{from:i,to:i};case"yesterday":return{from:s(1),to:s(1)};case"7":return{from:s(6),to:i};case"30":return{from:s(29),to:i};case"month":return{from:`${a.getFullYear()}-${Fe(a.getMonth()+1)}-01`,to:i};case"lastmonth":{const n=new Date(a.getFullYear(),a.getMonth()-1,1),r=new Date(a.getFullYear(),a.getMonth(),0);return{from:Qe(n),to:Qe(r)}}case"custom":return t;default:return{}}}function $r(){const e=document.createElement("div");e.className="page-activity page-container",e.appendChild(ce({title:qt("sonIslemler","Son İşlemler"),gradientClass:"gradient-reports"}));const t=document.createElement("div");t.className="content-area",e.appendChild(t);const a={period:"today",from:"",to:"",userId:"",category:"",q:""};let i=[],s=[],n=[];t.innerHTML=`
    <div class="act-filters card">
      <div class="act-chips" id="act-period">${os.map(([h,b])=>`<button type="button" class="sx-chip ${h===a.period?"on":""}" data-p="${h}">${b}</button>`).join("")}</div>
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
    <div class="list-toolbar"><span id="act-count"></span>${je("act-export")}</div>
    <div id="act-list"></div>`;const r=h=>t.querySelector(h),d=r("#act-list");async function l(){d.innerHTML='<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';const h=kr(a.period,{from:a.from,to:a.to}),b=new URLSearchParams;h.from&&b.set("from",Bs(h.from).toISOString()),h.to&&b.set("to",yr(h.to).toISOString()),a.userId&&b.set("userId",a.userId),a.category&&b.set("category",a.category),a.q&&b.set("q",a.q),b.set("limit","2000");try{const v=await C.get("/activity?"+b.toString());if(!v.success)throw new Error(v.message||"Kayıtlar okunamadı");i=v.data.items,s.length||(s=v.data.users),n.length||(n=v.data.categories),p(),c()}catch(v){d.innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${u(v.message)}</div></div>`}}function p(){const h=r("#act-user"),b=r("#act-cat");h.options.length<=1&&s.forEach(v=>h.add(new Option(v.name,v.id))),b.options.length<=1&&n.forEach(v=>b.add(new Option(v,v)))}function c(){if(r("#act-count").textContent=`${i.length.toLocaleString("tr-TR")} işlem`,!i.length){d.innerHTML='<div class="empty-state"><div class="empty-icon"><i class="ph ph-clock-counter-clockwise"></i></div><div class="empty-text">Bu filtrelerde işlem kaydı yok</div></div>';return}let h="";d.innerHTML=i.map(b=>{const v=gr(b.ts),L=v!==h?`<div class="act-day">${u(v)}</div>`:"";h=v;const q=vr[b.category]||"#64748B",g=new Date(b.ts);return`${L}
      <div class="act-item">
        <span class="act-ico" style="--c:${q}"><i class="ph ${br[b.category]||"ph-circle"}"></i></span>
        <div class="act-body">
          <div class="act-title"><b>${u(b.typeLabel)}</b>${b.refLabel?`<span class="act-ref">${u(b.refLabel)}</span>`:""}</div>
          <div class="act-text">${u(b.text)}</div>
          <div class="act-meta"><i class="ph ph-user"></i> ${u(b.userName||"—")} <span>·</span> <i class="ph ph-clock"></i> ${Fe(g.getHours())}:${Fe(g.getMinutes())}</div>
        </div>
      </div>`}).join("")}r("#act-period").addEventListener("click",h=>{const b=h.target.closest("[data-p]");b&&(a.period=b.dataset.p,r("#act-period").querySelectorAll(".sx-chip").forEach(v=>v.classList.toggle("on",v===b)),r("#act-custom").hidden=a.period!=="custom",!(a.period==="custom"&&!(a.from&&a.to))&&l())});const o=()=>{if(a.from=r("#act-from").value,a.to=r("#act-to").value,a.from&&a.to){if(a.to<a.from)return R("Bitiş tarihi başlangıçtan önce olamaz","warning");l()}};r("#act-from").addEventListener("change",o),r("#act-to").addEventListener("change",o),r("#act-user").addEventListener("change",h=>{a.userId=h.target.value,l()}),r("#act-cat").addEventListener("change",h=>{a.category=h.target.value,l()});let m;return r("#act-q").addEventListener("input",h=>{clearTimeout(m),m=setTimeout(()=>{a.q=h.target.value.trim(),l()},300)}),r("#act-export").addEventListener("click",()=>{var b;const h=((b=os.find(([v])=>v===a.period))==null?void 0:b[1])||"";we(`Son islemler ${h}`,[["Tarih",v=>fr(v.ts)],["Çalışan","userName"],["Kategori","category"],["İşlem","typeLabel"],["Açıklama","text"],["Referans","refLabel"]],i)}),l(),e}var ta=function(){var e=function(g,E){var f=236,x=17,A=g,j=a[E],M=null,S=0,N=null,B=[],O={},F=function(y,k){S=A*4+17,M=function(w){for(var $=new Array(w),T=0;T<w;T+=1){$[T]=new Array(w);for(var D=0;D<w;D+=1)$[T][D]=null}return $}(S),V(0,0),V(S-7,0),V(0,S-7),P(),ae(),Q(y,k),A>=7&&U(y),N==null&&(N=re(A,j,B)),ee(N,k)},V=function(y,k){for(var w=-1;w<=7;w+=1)if(!(y+w<=-1||S<=y+w))for(var $=-1;$<=7;$+=1)k+$<=-1||S<=k+$||(0<=w&&w<=6&&($==0||$==6)||0<=$&&$<=6&&(w==0||w==6)||2<=w&&w<=4&&2<=$&&$<=4?M[y+w][k+$]=!0:M[y+w][k+$]=!1)},J=function(){for(var y=0,k=0,w=0;w<8;w+=1){F(!0,w);var $=s.getLostPoint(O);(w==0||y>$)&&(y=$,k=w)}return k},ae=function(){for(var y=8;y<S-8;y+=1)M[y][6]==null&&(M[y][6]=y%2==0);for(var k=8;k<S-8;k+=1)M[6][k]==null&&(M[6][k]=k%2==0)},P=function(){for(var y=s.getPatternPosition(A),k=0;k<y.length;k+=1)for(var w=0;w<y.length;w+=1){var $=y[k],T=y[w];if(M[$][T]==null)for(var D=-2;D<=2;D+=1)for(var _=-2;_<=2;_+=1)D==-2||D==2||_==-2||_==2||D==0&&_==0?M[$+D][T+_]=!0:M[$+D][T+_]=!1}},U=function(y){for(var k=s.getBCHTypeNumber(A),w=0;w<18;w+=1){var $=!y&&(k>>w&1)==1;M[Math.floor(w/3)][w%3+S-8-3]=$}for(var w=0;w<18;w+=1){var $=!y&&(k>>w&1)==1;M[w%3+S-8-3][Math.floor(w/3)]=$}},Q=function(y,k){for(var w=j<<3|k,$=s.getBCHTypeInfo(w),T=0;T<15;T+=1){var D=!y&&($>>T&1)==1;T<6?M[T][8]=D:T<8?M[T+1][8]=D:M[S-15+T][8]=D}for(var T=0;T<15;T+=1){var D=!y&&($>>T&1)==1;T<8?M[8][S-T-1]=D:T<9?M[8][15-T-1+1]=D:M[8][15-T-1]=D}M[S-8][8]=!y},ee=function(y,k){for(var w=-1,$=S-1,T=7,D=0,_=s.getMaskFunction(k),H=S-1;H>0;H-=2)for(H==6&&(H-=1);;){for(var I=0;I<2;I+=1)if(M[$][H-I]==null){var Z=!1;D<y.length&&(Z=(y[D]>>>T&1)==1);var X=_($,H-I);X&&(Z=!Z),M[$][H-I]=Z,T-=1,T==-1&&(D+=1,T=7)}if($+=w,$<0||S<=$){$-=w,w=-w;break}}},se=function(y,k){for(var w=0,$=0,T=0,D=new Array(k.length),_=new Array(k.length),H=0;H<k.length;H+=1){var I=k[H].dataCount,Z=k[H].totalCount-I;$=Math.max($,I),T=Math.max(T,Z),D[H]=new Array(I);for(var X=0;X<D[H].length;X+=1)D[H][X]=255&y.getBuffer()[X+w];w+=I;var le=s.getErrorCorrectPolynomial(Z),de=r(D[H],le.getLength()-1),pe=de.mod(le);_[H]=new Array(le.getLength()-1);for(var X=0;X<_[H].length;X+=1){var Ue=X+pe.getLength()-_[H].length;_[H][X]=Ue>=0?pe.getAt(Ue):0}}for(var Dt=0,X=0;X<k.length;X+=1)Dt+=k[X].totalCount;for(var Y=new Array(Dt),$e=0,X=0;X<$;X+=1)for(var H=0;H<k.length;H+=1)X<D[H].length&&(Y[$e]=D[H][X],$e+=1);for(var X=0;X<T;X+=1)for(var H=0;H<k.length;H+=1)X<_[H].length&&(Y[$e]=_[H][X],$e+=1);return Y},re=function(y,k,w){for(var $=d.getRSBlocks(y,k),T=l(),D=0;D<w.length;D+=1){var _=w[D];T.put(_.getMode(),4),T.put(_.getLength(),s.getLengthInBits(_.getMode(),y)),_.write(T)}for(var H=0,D=0;D<$.length;D+=1)H+=$[D].dataCount;if(T.getLengthInBits()>H*8)throw"code length overflow. ("+T.getLengthInBits()+">"+H*8+")";for(T.getLengthInBits()+4<=H*8&&T.put(0,4);T.getLengthInBits()%8!=0;)T.putBit(!1);for(;!(T.getLengthInBits()>=H*8||(T.put(f,8),T.getLengthInBits()>=H*8));)T.put(x,8);return se(T,$)};O.addData=function(y,k){k=k||"Byte";var w=null;switch(k){case"Numeric":w=p(y);break;case"Alphanumeric":w=c(y);break;case"Byte":w=o(y);break;case"Kanji":w=m(y);break;default:throw"mode:"+k}B.push(w),N=null},O.isDark=function(y,k){if(y<0||S<=y||k<0||S<=k)throw y+","+k;return M[y][k]},O.getModuleCount=function(){return S},O.make=function(){if(A<1){for(var y=1;y<40;y++){for(var k=d.getRSBlocks(y,j),w=l(),$=0;$<B.length;$++){var T=B[$];w.put(T.getMode(),4),w.put(T.getLength(),s.getLengthInBits(T.getMode(),y)),T.write(w)}for(var D=0,$=0;$<k.length;$++)D+=k[$].dataCount;if(w.getLengthInBits()<=D*8)break}A=y}F(!1,J())},O.createTableTag=function(y,k){y=y||2,k=typeof k>"u"?y*4:k;var w="";w+='<table style="',w+=" border-width: 0px; border-style: none;",w+=" border-collapse: collapse;",w+=" padding: 0px; margin: "+k+"px;",w+='">',w+="<tbody>";for(var $=0;$<O.getModuleCount();$+=1){w+="<tr>";for(var T=0;T<O.getModuleCount();T+=1)w+='<td style="',w+=" border-width: 0px; border-style: none;",w+=" border-collapse: collapse;",w+=" padding: 0px; margin: 0px;",w+=" width: "+y+"px;",w+=" height: "+y+"px;",w+=" background-color: ",w+=O.isDark($,T)?"#000000":"#ffffff",w+=";",w+='"/>';w+="</tr>"}return w+="</tbody>",w+="</table>",w},O.createSvgTag=function(y,k,w,$){var T={};typeof arguments[0]=="object"&&(T=arguments[0],y=T.cellSize,k=T.margin,w=T.alt,$=T.title),y=y||2,k=typeof k>"u"?y*4:k,w=typeof w=="string"?{text:w}:w||{},w.text=w.text||null,w.id=w.text?w.id||"qrcode-description":null,$=typeof $=="string"?{text:$}:$||{},$.text=$.text||null,$.id=$.text?$.id||"qrcode-title":null;var D=O.getModuleCount()*y+k*2,_,H,I,Z,X="",le;for(le="l"+y+",0 0,"+y+" -"+y+",0 0,-"+y+"z ",X+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',X+=T.scalable?"":' width="'+D+'px" height="'+D+'px"',X+=' viewBox="0 0 '+D+" "+D+'" ',X+=' preserveAspectRatio="xMinYMin meet"',X+=$.text||w.text?' role="img" aria-labelledby="'+K([$.id,w.id].join(" ").trim())+'"':"",X+=">",X+=$.text?'<title id="'+K($.id)+'">'+K($.text)+"</title>":"",X+=w.text?'<description id="'+K(w.id)+'">'+K(w.text)+"</description>":"",X+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',X+='<path d="',I=0;I<O.getModuleCount();I+=1)for(Z=I*y+k,_=0;_<O.getModuleCount();_+=1)O.isDark(I,_)&&(H=_*y+k,X+="M"+H+","+Z+le);return X+='" stroke="transparent" fill="black"/>',X+="</svg>",X},O.createDataURL=function(y,k){y=y||2,k=typeof k>"u"?y*4:k;var w=O.getModuleCount()*y+k*2,$=k,T=w-k;return q(w,w,function(D,_){if($<=D&&D<T&&$<=_&&_<T){var H=Math.floor((D-$)/y),I=Math.floor((_-$)/y);return O.isDark(I,H)?0:1}else return 1})},O.createImgTag=function(y,k,w){y=y||2,k=typeof k>"u"?y*4:k;var $=O.getModuleCount()*y+k*2,T="";return T+="<img",T+=' src="',T+=O.createDataURL(y,k),T+='"',T+=' width="',T+=$,T+='"',T+=' height="',T+=$,T+='"',w&&(T+=' alt="',T+=K(w),T+='"'),T+="/>",T};var K=function(y){for(var k="",w=0;w<y.length;w+=1){var $=y.charAt(w);switch($){case"<":k+="&lt;";break;case">":k+="&gt;";break;case"&":k+="&amp;";break;case'"':k+="&quot;";break;default:k+=$;break}}return k},G=function(y){var k=1;y=typeof y>"u"?k*2:y;var w=O.getModuleCount()*k+y*2,$=y,T=w-y,D,_,H,I,Z,X={"██":"█","█ ":"▀"," █":"▄","  ":" "},le={"██":"▀","█ ":"▀"," █":" ","  ":" "},de="";for(D=0;D<w;D+=2){for(H=Math.floor((D-$)/k),I=Math.floor((D+1-$)/k),_=0;_<w;_+=1)Z="█",$<=_&&_<T&&$<=D&&D<T&&O.isDark(H,Math.floor((_-$)/k))&&(Z=" "),$<=_&&_<T&&$<=D+1&&D+1<T&&O.isDark(I,Math.floor((_-$)/k))?Z+=" ":Z+="█",de+=y<1&&D+1>=T?le[Z]:X[Z];de+=`
`}return w%2&&y>0?de.substring(0,de.length-w-1)+Array(w+1).join("▀"):de.substring(0,de.length-1)};return O.createASCII=function(y,k){if(y=y||1,y<2)return G(k);y-=1,k=typeof k>"u"?y*2:k;var w=O.getModuleCount()*y+k*2,$=k,T=w-k,D,_,H,I,Z=Array(y+1).join("██"),X=Array(y+1).join("  "),le="",de="";for(D=0;D<w;D+=1){for(H=Math.floor((D-$)/y),de="",_=0;_<w;_+=1)I=1,$<=_&&_<T&&$<=D&&D<T&&O.isDark(H,Math.floor((_-$)/y))&&(I=0),de+=I?Z:X;for(H=0;H<y;H+=1)le+=de+`
`}return le.substring(0,le.length-1)},O.renderTo2dContext=function(y,k){k=k||2;for(var w=O.getModuleCount(),$=0;$<w;$++)for(var T=0;T<w;T++)y.fillStyle=O.isDark($,T)?"black":"white",y.fillRect($*k,T*k,k,k)},O};e.stringToBytesFuncs={default:function(g){for(var E=[],f=0;f<g.length;f+=1){var x=g.charCodeAt(f);E.push(x&255)}return E}},e.stringToBytes=e.stringToBytesFuncs.default,e.createStringToBytes=function(g,E){var f=function(){for(var A=v(g),j=function(){var ae=A.read();if(ae==-1)throw"eof";return ae},M=0,S={};;){var N=A.read();if(N==-1)break;var B=j(),O=j(),F=j(),V=String.fromCharCode(N<<8|B),J=O<<8|F;S[V]=J,M+=1}if(M!=E)throw M+" != "+E;return S}(),x=63;return function(A){for(var j=[],M=0;M<A.length;M+=1){var S=A.charCodeAt(M);if(S<128)j.push(S);else{var N=f[A.charAt(M)];typeof N=="number"?(N&255)==N?j.push(N):(j.push(N>>>8),j.push(N&255)):j.push(x)}}return j}};var t={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},a={L:1,M:0,Q:3,H:2},i={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},s=function(){var g=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],E=1335,f=7973,x=21522,A={},j=function(M){for(var S=0;M!=0;)S+=1,M>>>=1;return S};return A.getBCHTypeInfo=function(M){for(var S=M<<10;j(S)-j(E)>=0;)S^=E<<j(S)-j(E);return(M<<10|S)^x},A.getBCHTypeNumber=function(M){for(var S=M<<12;j(S)-j(f)>=0;)S^=f<<j(S)-j(f);return M<<12|S},A.getPatternPosition=function(M){return g[M-1]},A.getMaskFunction=function(M){switch(M){case i.PATTERN000:return function(S,N){return(S+N)%2==0};case i.PATTERN001:return function(S,N){return S%2==0};case i.PATTERN010:return function(S,N){return N%3==0};case i.PATTERN011:return function(S,N){return(S+N)%3==0};case i.PATTERN100:return function(S,N){return(Math.floor(S/2)+Math.floor(N/3))%2==0};case i.PATTERN101:return function(S,N){return S*N%2+S*N%3==0};case i.PATTERN110:return function(S,N){return(S*N%2+S*N%3)%2==0};case i.PATTERN111:return function(S,N){return(S*N%3+(S+N)%2)%2==0};default:throw"bad maskPattern:"+M}},A.getErrorCorrectPolynomial=function(M){for(var S=r([1],0),N=0;N<M;N+=1)S=S.multiply(r([1,n.gexp(N)],0));return S},A.getLengthInBits=function(M,S){if(1<=S&&S<10)switch(M){case t.MODE_NUMBER:return 10;case t.MODE_ALPHA_NUM:return 9;case t.MODE_8BIT_BYTE:return 8;case t.MODE_KANJI:return 8;default:throw"mode:"+M}else if(S<27)switch(M){case t.MODE_NUMBER:return 12;case t.MODE_ALPHA_NUM:return 11;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 10;default:throw"mode:"+M}else if(S<41)switch(M){case t.MODE_NUMBER:return 14;case t.MODE_ALPHA_NUM:return 13;case t.MODE_8BIT_BYTE:return 16;case t.MODE_KANJI:return 12;default:throw"mode:"+M}else throw"type:"+S},A.getLostPoint=function(M){for(var S=M.getModuleCount(),N=0,B=0;B<S;B+=1)for(var O=0;O<S;O+=1){for(var F=0,V=M.isDark(B,O),J=-1;J<=1;J+=1)if(!(B+J<0||S<=B+J))for(var ae=-1;ae<=1;ae+=1)O+ae<0||S<=O+ae||J==0&&ae==0||V==M.isDark(B+J,O+ae)&&(F+=1);F>5&&(N+=3+F-5)}for(var B=0;B<S-1;B+=1)for(var O=0;O<S-1;O+=1){var P=0;M.isDark(B,O)&&(P+=1),M.isDark(B+1,O)&&(P+=1),M.isDark(B,O+1)&&(P+=1),M.isDark(B+1,O+1)&&(P+=1),(P==0||P==4)&&(N+=3)}for(var B=0;B<S;B+=1)for(var O=0;O<S-6;O+=1)M.isDark(B,O)&&!M.isDark(B,O+1)&&M.isDark(B,O+2)&&M.isDark(B,O+3)&&M.isDark(B,O+4)&&!M.isDark(B,O+5)&&M.isDark(B,O+6)&&(N+=40);for(var O=0;O<S;O+=1)for(var B=0;B<S-6;B+=1)M.isDark(B,O)&&!M.isDark(B+1,O)&&M.isDark(B+2,O)&&M.isDark(B+3,O)&&M.isDark(B+4,O)&&!M.isDark(B+5,O)&&M.isDark(B+6,O)&&(N+=40);for(var U=0,O=0;O<S;O+=1)for(var B=0;B<S;B+=1)M.isDark(B,O)&&(U+=1);var Q=Math.abs(100*U/S/S-50)/5;return N+=Q*10,N},A}(),n=function(){for(var g=new Array(256),E=new Array(256),f=0;f<8;f+=1)g[f]=1<<f;for(var f=8;f<256;f+=1)g[f]=g[f-4]^g[f-5]^g[f-6]^g[f-8];for(var f=0;f<255;f+=1)E[g[f]]=f;var x={};return x.glog=function(A){if(A<1)throw"glog("+A+")";return E[A]},x.gexp=function(A){for(;A<0;)A+=255;for(;A>=256;)A-=255;return g[A]},x}();function r(g,E){if(typeof g.length>"u")throw g.length+"/"+E;var f=function(){for(var A=0;A<g.length&&g[A]==0;)A+=1;for(var j=new Array(g.length-A+E),M=0;M<g.length-A;M+=1)j[M]=g[M+A];return j}(),x={};return x.getAt=function(A){return f[A]},x.getLength=function(){return f.length},x.multiply=function(A){for(var j=new Array(x.getLength()+A.getLength()-1),M=0;M<x.getLength();M+=1)for(var S=0;S<A.getLength();S+=1)j[M+S]^=n.gexp(n.glog(x.getAt(M))+n.glog(A.getAt(S)));return r(j,0)},x.mod=function(A){if(x.getLength()-A.getLength()<0)return x;for(var j=n.glog(x.getAt(0))-n.glog(A.getAt(0)),M=new Array(x.getLength()),S=0;S<x.getLength();S+=1)M[S]=x.getAt(S);for(var S=0;S<A.getLength();S+=1)M[S]^=n.gexp(n.glog(A.getAt(S))+j);return r(M,0).mod(A)},x}var d=function(){var g=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],E=function(A,j){var M={};return M.totalCount=A,M.dataCount=j,M},f={},x=function(A,j){switch(j){case a.L:return g[(A-1)*4+0];case a.M:return g[(A-1)*4+1];case a.Q:return g[(A-1)*4+2];case a.H:return g[(A-1)*4+3];default:return}};return f.getRSBlocks=function(A,j){var M=x(A,j);if(typeof M>"u")throw"bad rs block @ typeNumber:"+A+"/errorCorrectionLevel:"+j;for(var S=M.length/3,N=[],B=0;B<S;B+=1)for(var O=M[B*3+0],F=M[B*3+1],V=M[B*3+2],J=0;J<O;J+=1)N.push(E(F,V));return N},f}(),l=function(){var g=[],E=0,f={};return f.getBuffer=function(){return g},f.getAt=function(x){var A=Math.floor(x/8);return(g[A]>>>7-x%8&1)==1},f.put=function(x,A){for(var j=0;j<A;j+=1)f.putBit((x>>>A-j-1&1)==1)},f.getLengthInBits=function(){return E},f.putBit=function(x){var A=Math.floor(E/8);g.length<=A&&g.push(0),x&&(g[A]|=128>>>E%8),E+=1},f},p=function(g){var E=t.MODE_NUMBER,f=g,x={};x.getMode=function(){return E},x.getLength=function(M){return f.length},x.write=function(M){for(var S=f,N=0;N+2<S.length;)M.put(A(S.substring(N,N+3)),10),N+=3;N<S.length&&(S.length-N==1?M.put(A(S.substring(N,N+1)),4):S.length-N==2&&M.put(A(S.substring(N,N+2)),7))};var A=function(M){for(var S=0,N=0;N<M.length;N+=1)S=S*10+j(M.charAt(N));return S},j=function(M){if("0"<=M&&M<="9")return M.charCodeAt(0)-48;throw"illegal char :"+M};return x},c=function(g){var E=t.MODE_ALPHA_NUM,f=g,x={};x.getMode=function(){return E},x.getLength=function(j){return f.length},x.write=function(j){for(var M=f,S=0;S+1<M.length;)j.put(A(M.charAt(S))*45+A(M.charAt(S+1)),11),S+=2;S<M.length&&j.put(A(M.charAt(S)),6)};var A=function(j){if("0"<=j&&j<="9")return j.charCodeAt(0)-48;if("A"<=j&&j<="Z")return j.charCodeAt(0)-65+10;switch(j){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+j}};return x},o=function(g){var E=t.MODE_8BIT_BYTE,f=e.stringToBytes(g),x={};return x.getMode=function(){return E},x.getLength=function(A){return f.length},x.write=function(A){for(var j=0;j<f.length;j+=1)A.put(f[j],8)},x},m=function(g){var E=t.MODE_KANJI,f=e.stringToBytesFuncs.SJIS;if(!f)throw"sjis not supported.";(function(j,M){var S=f(j);if(S.length!=2||(S[0]<<8|S[1])!=M)throw"sjis not supported."})("友",38726);var x=f(g),A={};return A.getMode=function(){return E},A.getLength=function(j){return~~(x.length/2)},A.write=function(j){for(var M=x,S=0;S+1<M.length;){var N=(255&M[S])<<8|255&M[S+1];if(33088<=N&&N<=40956)N-=33088;else if(57408<=N&&N<=60351)N-=49472;else throw"illegal char at "+(S+1)+"/"+N;N=(N>>>8&255)*192+(N&255),j.put(N,13),S+=2}if(S<M.length)throw"illegal char at "+(S+1)},A},h=function(){var g=[],E={};return E.writeByte=function(f){g.push(f&255)},E.writeShort=function(f){E.writeByte(f),E.writeByte(f>>>8)},E.writeBytes=function(f,x,A){x=x||0,A=A||f.length;for(var j=0;j<A;j+=1)E.writeByte(f[j+x])},E.writeString=function(f){for(var x=0;x<f.length;x+=1)E.writeByte(f.charCodeAt(x))},E.toByteArray=function(){return g},E.toString=function(){var f="";f+="[";for(var x=0;x<g.length;x+=1)x>0&&(f+=","),f+=g[x];return f+="]",f},E},b=function(){var g=0,E=0,f=0,x="",A={},j=function(S){x+=String.fromCharCode(M(S&63))},M=function(S){if(!(S<0)){if(S<26)return 65+S;if(S<52)return 97+(S-26);if(S<62)return 48+(S-52);if(S==62)return 43;if(S==63)return 47}throw"n:"+S};return A.writeByte=function(S){for(g=g<<8|S&255,E+=8,f+=1;E>=6;)j(g>>>E-6),E-=6},A.flush=function(){if(E>0&&(j(g<<6-E),g=0,E=0),f%3!=0)for(var S=3-f%3,N=0;N<S;N+=1)x+="="},A.toString=function(){return x},A},v=function(g){var E=g,f=0,x=0,A=0,j={};j.read=function(){for(;A<8;){if(f>=E.length){if(A==0)return-1;throw"unexpected end of file./"+A}var S=E.charAt(f);if(f+=1,S=="=")return A=0,-1;if(S.match(/^\s$/))continue;x=x<<6|M(S.charCodeAt(0)),A+=6}var N=x>>>A-8&255;return A-=8,N};var M=function(S){if(65<=S&&S<=90)return S-65;if(97<=S&&S<=122)return S-97+26;if(48<=S&&S<=57)return S-48+52;if(S==43)return 62;if(S==47)return 63;throw"c:"+S};return j},L=function(g,E){var f=g,x=E,A=new Array(g*E),j={};j.setPixel=function(B,O,F){A[O*f+B]=F},j.write=function(B){B.writeString("GIF87a"),B.writeShort(f),B.writeShort(x),B.writeByte(128),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(0),B.writeByte(255),B.writeByte(255),B.writeByte(255),B.writeString(","),B.writeShort(0),B.writeShort(0),B.writeShort(f),B.writeShort(x),B.writeByte(0);var O=2,F=S(O);B.writeByte(O);for(var V=0;F.length-V>255;)B.writeByte(255),B.writeBytes(F,V,255),V+=255;B.writeByte(F.length-V),B.writeBytes(F,V,F.length-V),B.writeByte(0),B.writeString(";")};var M=function(B){var O=B,F=0,V=0,J={};return J.write=function(ae,P){if(ae>>>P)throw"length over";for(;F+P>=8;)O.writeByte(255&(ae<<F|V)),P-=8-F,ae>>>=8-F,V=0,F=0;V=ae<<F|V,F=F+P},J.flush=function(){F>0&&O.writeByte(V)},J},S=function(B){for(var O=1<<B,F=(1<<B)+1,V=B+1,J=N(),ae=0;ae<O;ae+=1)J.add(String.fromCharCode(ae));J.add(String.fromCharCode(O)),J.add(String.fromCharCode(F));var P=h(),U=M(P);U.write(O,V);var Q=0,ee=String.fromCharCode(A[Q]);for(Q+=1;Q<A.length;){var se=String.fromCharCode(A[Q]);Q+=1,J.contains(ee+se)?ee=ee+se:(U.write(J.indexOf(ee),V),J.size()<4095&&(J.size()==1<<V&&(V+=1),J.add(ee+se)),ee=se)}return U.write(J.indexOf(ee),V),U.write(F,V),U.flush(),P.toByteArray()},N=function(){var B={},O=0,F={};return F.add=function(V){if(F.contains(V))throw"dup key:"+V;B[V]=O,O+=1},F.size=function(){return O},F.indexOf=function(V){return B[V]},F.contains=function(V){return typeof B[V]<"u"},F};return j},q=function(g,E,f){for(var x=L(g,E),A=0;A<E;A+=1)for(var j=0;j<g;j+=1)x.setPixel(j,A,f(j,A));var M=h();x.write(M);for(var S=b(),N=M.toByteArray(),B=0;B<N.length;B+=1)S.writeByte(N[B]);return S.flush(),"data:image/gif;base64,"+S};return e}();(function(){ta.stringToBytesFuncs["UTF-8"]=function(e){function t(a){for(var i=[],s=0;s<a.length;s++){var n=a.charCodeAt(s);n<128?i.push(n):n<2048?i.push(192|n>>6,128|n&63):n<55296||n>=57344?i.push(224|n>>12,128|n>>6&63,128|n&63):(s++,n=65536+((n&1023)<<10|a.charCodeAt(s)&1023),i.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|n&63))}return i}return t(e)}})();ta.stringToBytes=ta.stringToBytesFuncs["UTF-8"];const wt={ean13:{label:"EAN-13",hint:"12 rakam girin, 13. hane (kontrol) otomatik eklenir",linear:!0},ean8:{label:"EAN-8",hint:"7 rakam girin, 8. hane (kontrol) otomatik eklenir",linear:!0},code128:{label:"Code 128",hint:"Harf, rakam ve işaret (Türkçe karakter hariç)",linear:!0},code39:{label:"Code 39",hint:"Büyük harf, rakam ve - . $ / + % boşluk",linear:!0},qr:{label:"QR Kod",hint:"Her türlü metin; Türkçe karakter kullanılabilir",linear:!1}},Ia=["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"],Da=Ia.map(e=>[...e].map(t=>t==="0"?"1":"0").join("")),wr=Da.map(e=>[...e].reverse().join("")),xr=["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];function cs(e){let t=0;for(let a=0;a<e.length;a++){const i=Number(e[e.length-1-a]);t+=i*(a%2===0?3:1)}return String((10-t%10)%10)}const Sr=["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"],Tr=104,ds=105,Lr=100,Er=99,Ar=106;function jr(e){const t=[];return[...e].forEach((a,i)=>{for(let s=0;s<Number(a);s++)t.push(i%2===0?1:0)}),t}function Mr(e){const t=String(e),a=l=>t.charCodeAt(l)>=48&&t.charCodeAt(l)<=57,i=l=>{let p=0;for(;l+p<t.length&&a(l+p);)p++;return p},s=[];let n=null,r=0;for(;r<t.length;){const l=i(r);n===null?l===t.length&&l>=2||l>=4?(n="C",s.push(ds)):(n="B",s.push(Tr)):n==="B"&&(l>=6||l>=4&&r+l===t.length)?(n="C",s.push(Er)):n==="C"&&l<2&&(n="B",s.push(Lr)),n==="C"?(s.push(Number(t.slice(r,r+2))),r+=2):(s.push(t.charCodeAt(r)-32),r+=1)}let d=s[0];for(let l=1;l<s.length;l++)d+=s[l]*l;return s.push(d%103,Ar),s}const Hs={0:"nnnwwnwnn",1:"wnnwnnnnw",2:"nnwwnnnnw",3:"wnwwnnnnn",4:"nnnwwnnnw",5:"wnnwwnnnn",6:"nnwwwnnnn",7:"nnnwnnwnw",8:"wnnwnnwnn",9:"nnwwnnwnn",A:"wnnnnwnnw",B:"nnwnnwnnw",C:"wnwnnwnnn",D:"nnnnwwnnw",E:"wnnnwwnnn",F:"nnwnwwnnn",G:"nnnnnwwnw",H:"wnnnnwwnn",I:"nnwnnwwnn",J:"nnnnwwwnn",K:"wnnnnnnww",L:"nnwnnnnww",M:"wnwnnnnwn",N:"nnnnwnnww",O:"wnnnwnnwn",P:"nnwnwnnwn",Q:"nnnnnnwww",R:"wnnnnnwwn",S:"nnwnnnwwn",T:"nnnnwnwwn",U:"wwnnnnnnw",V:"nwwnnnnnw",W:"wwwnnnnnn",X:"nwnnwnnnw",Y:"wwnnwnnnn",Z:"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn",$:"nwnwnwnnn","/":"nwnwnnnwn","+":"nwnnnwnwn","%":"nnnwnwnwn"};function Ra(e,t){const a=String(t??"").trim();if(!a)return{ok:!1,error:"Barkod değeri boş."};switch(e){case"ean13":{if(!/^\d{12,13}$/.test(a))return{ok:!1,error:"EAN-13 için 12 veya 13 rakam girin."};const i=a.slice(0,12),s=cs(i);return a.length===13&&a[12]!==s?{ok:!1,error:`Kontrol hanesi hatalı (doğrusu ${s}). 12 rakam girerseniz otomatik eklenir.`}:{ok:!0,value:i+s}}case"ean8":{if(!/^\d{7,8}$/.test(a))return{ok:!1,error:"EAN-8 için 7 veya 8 rakam girin."};const i=a.slice(0,7),s=cs(i);return a.length===8&&a[7]!==s?{ok:!1,error:`Kontrol hanesi hatalı (doğrusu ${s}). 7 rakam girerseniz otomatik eklenir.`}:{ok:!0,value:i+s}}case"code128":return a.length>48?{ok:!1,error:"Code 128 için en fazla 48 karakter."}:[...a].some(i=>i.charCodeAt(0)<32||i.charCodeAt(0)>126)?{ok:!1,error:"Code 128 Türkçe/özel karakter içeremez. QR Kod kullanın."}:{ok:!0,value:a};case"code39":{const i=a.toUpperCase();return i.length>30?{ok:!1,error:"Code 39 için en fazla 30 karakter."}:[...i].some(s=>s==="*"||!(s in Hs))?{ok:!1,error:"Code 39 yalnızca A-Z, 0-9 ve - . $ / + % boşluk destekler."}:{ok:!0,value:i}}case"qr":return a.length>300?{ok:!1,error:"QR için en fazla 300 karakter."}:{ok:!0,value:a};default:return{ok:!1,error:"Bilinmeyen barkod türü."}}}function qr(e,t){const a=Ra(e,t);if(!a.ok)throw new Error(a.error);const i=a.value;if(e==="ean13"){const r=xr[Number(i[0])];let d="101";for(let l=1;l<=6;l++)d+=(r[l-1]==="L"?Ia:wr)[Number(i[l])];d+="01010";for(let l=7;l<=12;l++)d+=Da[Number(i[l])];return d+="101",{kind:"linear",bits:[...d].map(Number),text:i,ean:{lead:i[0],left:i.slice(1,7),right:i.slice(7)}}}if(e==="ean8"){let r="101";for(let d=0;d<4;d++)r+=Ia[Number(i[d])];r+="01010";for(let d=4;d<8;d++)r+=Da[Number(i[d])];return r+="101",{kind:"linear",bits:[...r].map(Number),text:i,ean:{lead:"",left:i.slice(0,4),right:i.slice(4)}}}if(e==="code128"){const r=[];return Mr(i).forEach(d=>r.push(...jr(Sr[d]))),{kind:"linear",bits:r,text:i}}if(e==="code39"){const r=[],d=`*${i}*`;return[...d].forEach((l,p)=>{[...Hs[l]].forEach((c,o)=>{const m=c==="w"?3:1;for(let h=0;h<m;h++)r.push(o%2===0?1:0)}),p<d.length-1&&r.push(0)}),{kind:"linear",bits:r,text:i}}const s=ta(0,i.length>120?"L":"M");return s.addData(i),s.make(),{kind:"matrix",size:s.getModuleCount(),cell:(r,d)=>s.isDark(d,r),text:i}}const Et=[{id:"25x15",label:"25 × 15 mm",w:25,h:15,kind:"roll",note:"Küçük ürün / takı"},{id:"30x20",label:"30 × 20 mm",w:30,h:20,kind:"roll",note:"Küçük ürün"},{id:"40x20",label:"40 × 20 mm",w:40,h:20,kind:"roll",note:"Standart raf / ürün"},{id:"40x30",label:"40 × 30 mm",w:40,h:30,kind:"roll",note:"Standart ürün"},{id:"50x25",label:"50 × 25 mm",w:50,h:25,kind:"roll",note:"Standart ürün"},{id:"50x30",label:"50 × 30 mm",w:50,h:30,kind:"roll",note:"En yaygın"},{id:"60x40",label:"60 × 40 mm",w:60,h:40,kind:"roll",note:"Koli / kutu"},{id:"80x50",label:"80 × 50 mm",w:80,h:50,kind:"roll",note:"Koli"},{id:"100x50",label:"100 × 50 mm",w:100,h:50,kind:"roll",note:"Büyük koli"},{id:"100x70",label:"100 × 70 mm",w:100,h:70,kind:"roll",note:"Palet / koli"},{id:"100x100",label:"100 × 100 mm",w:100,h:100,kind:"roll",note:"Palet"},{id:"100x150",label:"100 × 150 mm",w:100,h:150,kind:"roll",note:"Sevkiyat / palet"},{id:"A4-24",label:"A4 yaprak · 24’lü (3×8)",w:70,h:37,kind:"sheet",page:{w:210,h:297},cols:3,rows:8,ml:0,mt:0,gx:0,gy:0,note:"70 × 37 mm"},{id:"A4-65",label:"A4 yaprak · 65’li (5×13)",w:38,h:21.2,kind:"sheet",page:{w:210,h:297},cols:5,rows:13,ml:10,mt:10.7,gx:2.5,gy:0,note:"38 × 21,2 mm"},{id:"A4-12",label:"A4 yaprak · 12’li (2×6)",w:99,h:42,kind:"sheet",page:{w:210,h:297},cols:2,rows:6,ml:6,mt:21,gx:0,gy:0,note:"99 × 42 mm"}];function Ot(e,t){if(e==="custom"){const a=Math.min(200,Math.max(10,Number(t&&t.w)||50)),i=Math.min(300,Math.max(8,Number(t&&t.h)||30));return{id:"custom",label:`Özel ${a} × ${i} mm`,w:a,h:i,kind:"roll"}}return Et.find(a=>a.id===e)||Et.find(a=>a.id==="50x30")}const ps=(e,t,a)=>Math.min(a,Math.max(t,e)),Nr=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);function aa(e,t,a){let i=0;for(const s of String(e))i+=/[A-ZÇĞİÖŞÜ0-9%@#&MW]/.test(s)?.64:/[il.,:;'|! ]/.test(s)?.27:/[mw]/.test(s)?.8:.52;return i*t*(a?1.06:1)}function He(e,t,a,i){const s=String(e||"");if(aa(s,t,i)<=a)return s;let n=s;for(;n.length>1&&aa(n+"…",t,i)>a;)n=n.slice(0,-1);return n.trimEnd()+"…"}function ya(e,t,a,i,s){const n=String(e||"").split(/\s+/).filter(Boolean),r=[];let d="";for(const p of n){const c=d?`${d} ${p}`:p;if(aa(c,t,s)<=a)d=c;else if(d&&r.push(d),d=p,r.length===i-1)break}return d&&r.length<i&&r.push(d),r.join(" ").length<n.join(" ").length&&r.length&&(r[r.length-1]=He(r[r.length-1]+"…",t,a,s)),r.map(p=>He(p,t,a,s))}const Cr=(e,t)=>e==null||e===""||Number.isNaN(Number(e))?"":`${Number(e).toLocaleString("tr-TR",{minimumFractionDigits:Number(e)%1?2:0,maximumFractionDigits:2})} ${t||"₺"}`;function Ft(e,t={}){const a=Number(e.wMm),i=Number(e.hMm),s={name:!0,price:!0,code:!0,company:!1,text:!0,...e.show||{}},n=qr(e.format,e.value),r=[],d=[],l=t.dpi||0,p=l?25.4/l:0,c=U=>p?Math.round(U/p)*p:U,o=ps(Math.min(a,i)*.07,1,3),m=a-2*o,h=i-2*o,b=ps(i*.1,1.7,4.2),v=s.price?Cr(e.price,e.currency):"",L=s.code&&e.code||"",q=(U,Q,ee,se)=>r.push({t:"r",x:U,y:Q,w:ee,h:se}),g=(U,Q,ee,se,re="l",K=!1)=>r.push({t:"t",x:U,y:Q,s:se,text:ee,a:re,b:K});if(n.kind==="matrix"){const Q=n.size+6,ee=a>=1.45*i,se=(re,K,G)=>{let y=G/Q;p&&(y=Math.max(1,Math.floor(y/p))*p);const k=y*Q,w=c(re+(G-k)/2+3*y),$=c(K+(G-k)/2+3*y);y<.25&&!p&&d.push("QR kod bu boyutta çok küçük; okunmayabilir.");for(let T=0;T<n.size;T++){let D=0;for(;D<n.size;){if(!n.cell(D,T)){D++;continue}let _=1;for(;D+_<n.size&&n.cell(D+_,T);)_++;q(w+D*y,$+T*y,_*y,y),D+=_}}return y};if(ee){const re=h;se(o,o,re)<.25&&p&&d.push("QR kod bu çözünürlükte çok küçük; okunmayabilir.");const G=o+re+o,y=a-G-o,k=[];s.company&&e.company&&k.push({s:He(e.company,b*.75,y),size:b*.75,b:!1}),s.name&&e.name&&ya(e.name,b,y,i>=30?3:2,!0).forEach(T=>k.push({s:T,size:b,b:!0})),v&&k.push({s:v,size:b*1.3,b:!0}),L&&k.push({s:He(L,b*.8,y),size:b*.8,b:!1});const w=k.reduce((T,D)=>T+D.size*1.2,0);let $=o+(h-w)/2;k.forEach(T=>{$+=T.size*1.05,g(G,$,T.s,T.size,"l",T.b),$+=T.size*.15})}else{const re=[];s.company&&e.company&&i>=30&&re.push({s:He(e.company,b*.75,m),size:b*.75,b:!1}),s.name&&e.name&&ya(e.name,b,m,i>=45?2:1,!0).forEach($=>re.push({s:$,size:b,b:!0})),v&&re.push({s:v,size:b*1.25,b:!0});const K=L?[{s:He(L,b*.8,m),size:b*.8}]:[],G=re.reduce(($,T)=>$+T.size*1.2,0),y=K.reduce(($,T)=>$+T.size*1.2,0),k=Math.min(m,h-G-y);let w=o;re.forEach($=>{w+=$.size*1.05,g(a/2,w,$.s,$.size,"m",$.b),w+=$.size*.15}),k<8&&d.push("Etiket QR kod için fazla küçük."),se(o+(m-k)/2,w+.3,k),w+=k+.3,K.forEach($=>{w+=$.size*1.05,g(a/2,w,$.s,$.size,"m")})}return{w:a,h:i,ops:r,warnings:d,enc:n}}const E=n.bits.length,f=10,x=.5,A=b*.9,j=Math.max(6,i*.26),M=U=>{const Q=[];s.company&&e.company&&i>=25&&!U.company&&Q.push({k:"company",h:b*.75*1.2});const ee=i>=42?2:1,se=v&&!U.price&&a>=35&&s.name&&e.name;s.name&&e.name&&!U.name&&Q.push({k:"name",h:b*1.2*(U.oneLine?1:ee),lines:U.oneLine?1:ee,inline:se}),v&&!U.price&&!se&&Q.push({k:"price",h:b*1.3*1.2});const re=s.text&&!U.human?A*1.25:0,K=L&&!U.code&&L!==n.text?b*.8*1.2:0,G=Q.reduce((y,k)=>y+k.h+x,0)+re+K;return{rows:Q,humanRow:re,codeRow:K,barH:h-G-x*0,priceInline:se}},S=[{},{company:!0},{company:!0,oneLine:!0},{company:!0,oneLine:!0,code:!0},{company:!0,oneLine:!0,code:!0,price:!0},{company:!0,name:!0,code:!0,price:!0},{company:!0,name:!0,code:!0,price:!0,human:!0}];let N=M(S[0]);for(const U of S)if(N=M(U),N.barH>=j)break;N.barH<4&&(N.barH=Math.max(3,N.barH),d.push("Etiket bu içerik için fazla küçük; barkod yüksekliği yetersiz."));let B=m/(E+2*f);if(B=Math.min(B,.7),p){const U=Math.floor(B/p);U<1?(d.push("Barkod bu genişlikte yazıcı çözünürlüğüne sığmıyor."),B=p):B=U*p}else B=Math.floor(B*100)/100;B<.19&&d.push(`Barkod çizgileri çok ince (${B.toFixed(2)} mm); okuyucu zorlanabilir. Daha büyük etiket veya daha kısa değer seçin.`);const O=E*B,F=Math.min(N.barH,Math.max(O*.6,j),40),V=N.rows.reduce((U,Q)=>U+Q.h+x,0)+F+x+N.humanRow+N.codeRow;let J=o+Math.max(0,(h-V)/2);N.rows.forEach(U=>{if(U.k==="company"&&(J+=b*.75*1.05,g(a/2,J,He(e.company,b*.75,m),b*.75,"m"),J+=b*.75*.15+x),U.k==="name"){const Q=U.inline?aa(v,b*1.15,!0)+1:0;ya(e.name,b,m-Q,U.lines,!0).forEach((se,re)=>{J+=b*1.05,g(o,J,se,b,"l",!0),U.inline&&re===0&&g(a-o,J,v,b*1.15,"r",!0),J+=b*.15}),J+=x}U.k==="price"&&(J+=b*1.3*1.05,g(a-o,J,v,b*1.3,"r",!0),J+=b*1.3*.15+x)});const ae=c(o+(m-O)/2),P=c(J);for(let U=0;U<E;){if(!n.bits[U]){U++;continue}let Q=1;for(;U+Q<E&&n.bits[U+Q];)Q++;q(ae+U*B,P,Q*B,c(F)),U+=Q}if(J=P+c(F)+x,N.humanRow){J+=A*1;const U=n.ean?n.ean.lead?`${n.ean.lead}  ${n.ean.left}  ${n.ean.right}`:`${n.ean.left}  ${n.ean.right}`:n.text;g(a/2,J,He(U,A,m),A,"m"),J+=A*.25}return N.codeRow&&(J+=b*.8*1.05,g(a/2,J,He(L,b*.8,m),b*.8,"m")),{w:a,h:i,ops:r,warnings:d,enc:n,xdim:B}}function Pa(e,{border:t=!1}={}){const{w:a,h:i,ops:s}=e,n=d=>Math.round(d*1e3)/1e3;let r="";for(const d of s)d.t==="r"?r+=`<rect x="${n(d.x)}" y="${n(d.y)}" width="${n(d.w)}" height="${n(d.h)}"/>`:r+=`<text x="${n(d.x)}" y="${n(d.y)}" font-size="${n(d.s)}" text-anchor="${d.a==="m"?"middle":d.a==="r"?"end":"start"}"${d.b?' font-weight="700"':""}>${Nr(d.text)}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${i}" width="${a}mm" height="${i}mm" fill="#000" font-family="Arial, Helvetica, sans-serif" shape-rendering="crispEdges" text-rendering="geometricPrecision"><rect x="0" y="0" width="${a}" height="${i}" fill="#fff"${t?' stroke="#bbb" stroke-width="0.2"':""}/>${r}</svg>`}function Ir(e,t){const a=t/25.4,i=Math.round(e.w*a),s=Math.round(e.h*a),r=(typeof OffscreenCanvas<"u"?new OffscreenCanvas(i,s):Object.assign(document.createElement("canvas"),{width:i,height:s})).getContext("2d",{willReadFrequently:!0});r.fillStyle="#fff",r.fillRect(0,0,i,s),r.fillStyle="#000";for(const c of e.ops)if(c.t==="r"){const o=Math.round(c.x*a),m=Math.round((c.x+c.w)*a),h=Math.round(c.y*a),b=Math.round((c.y+c.h)*a);r.fillRect(o,h,Math.max(1,m-o),Math.max(1,b-h))}else r.font=`${c.b?"700 ":""}${Math.max(6,c.s*a)}px Arial, Helvetica, sans-serif`,r.textAlign=c.a==="m"?"center":c.a==="r"?"right":"left",r.textBaseline="alphabetic",r.fillText(c.text,c.x*a,c.y*a);const d=r.getImageData(0,0,i,s).data,l=Math.ceil(i/8),p=new Uint8Array(l*s);for(let c=0;c<s;c++)for(let o=0;o<i;o++){const m=(c*i+o)*4;.299*d[m]+.587*d[m+1]+.114*d[m+2]<150&&(p[c*l+(o>>3)]|=128>>(o&7))}return{wPx:i,hPx:s,rowBytes:l,data:p}}function Dr(e,t,{startCell:a=0}={}){const i=[];e.forEach(n=>{for(let r=0;r<Math.max(1,n.copies|0);r++)i.push(Pa(n.layout))});const s="html,body{margin:0;padding:0;background:#fff}svg{display:block}";if(t.kind==="sheet"){const n=t.cols*t.rows,r=[],d=Array(a).fill("").concat(i);for(let p=0;p<d.length;p+=n)r.push(d.slice(p,p+n));const l=r.map(p=>`<div class="pg">${p.map((c,o)=>{if(!c)return"";const m=o%t.cols,h=Math.floor(o/t.cols),b=t.ml+m*(t.w+t.gx),v=t.mt+h*(t.h+t.gy);return`<div class="cell" style="left:${b}mm;top:${v}mm">${c}</div>`}).join("")}</div>`).join("");return`<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${t.page.w}mm ${t.page.h}mm;margin:0}${s}.pg{position:relative;width:${t.page.w}mm;height:${t.page.h}mm;page-break-after:always;overflow:hidden}.cell{position:absolute;width:${t.w}mm;height:${t.h}mm;overflow:hidden}</style>${l}`}return`<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${t.w}mm ${t.h}mm;margin:0}${s}.l{width:${t.w}mm;height:${t.h}mm;overflow:hidden;page-break-after:always;break-after:page}.l:last-child{page-break-after:auto;break-after:auto}</style>`+i.map(n=>`<div class="l">${n}</div>`).join("")}const Ba=new TextEncoder,Rr=(...e)=>{const t=new Uint8Array(e.reduce((i,s)=>i+s.length,0));let a=0;return e.forEach(i=>{t.set(i,a),a+=i.length}),t},us="0123456789ABCDEF";function Pr(e){let t="";for(let a=0;a<e.length;a++)t+=us[e[a]>>4]+us[e[a]&15];return t}function Br(e,{copies:t=1,media:a="gap",darkness:i=0}={}){const s=e.data.length,r=`^XA^CI28^MN${a==="continuous"?"N":a==="mark"?"M":"Y"}^PW${e.wPx}^LL${e.hPx}^LH0,0${i?`~SD${i}`:""}^FO0,0^GFA,${s},${s},${e.rowBytes},${Pr(e.data)}^FS^PQ${Math.max(1,t|0)},0,1,N^XZ`;return Ba.encode(r)}function Hr(e,{copies:t=1,wMm:a,hMm:i,gapMm:s=3,direction:n=1,speed:r=4,density:d=8,media:l="gap"}={}){const p=new Uint8Array(e.data.length);for(let h=0;h<p.length;h++)p[h]=~e.data[h]&255;const c=l==="continuous"?"GAP 0 mm,0 mm":l==="mark"?`BLINE ${s} mm,0 mm`:`GAP ${s} mm,0 mm`,o=Ba.encode(`SIZE ${a} mm,${i} mm\r
${c}\r
SPEED ${r}\r
DENSITY ${d}\r
DIRECTION ${n}\r
REFERENCE 0,0\r
CLS\r
BITMAP 0,0,${e.rowBytes},${e.hPx},0,`),m=Ba.encode(`\r
PRINT ${Math.max(1,t|0)},1\r
`);return Rr(o,p,m)}function zs(e,t,a){const i=Ir(e,t.dpi||203);return t.language==="tspl"?Hr(i,{copies:a,wMm:e.w,hMm:e.h,gapMm:t.gap??3,direction:t.direction??1,media:t.media||"gap"}):Br(i,{copies:a,media:t.media||"gap"})}const zr={mode:"browser",language:"zpl",dpi:203,media:"gap",gap:3,direction:1,baud:115200,agentUrl:"http://127.0.0.1:9101",agentTarget:"tcp",agentHost:"",agentPort:9100,agentPrinter:""};function Kr(e,t={}){let a={};try{a=JSON.parse(localStorage.getItem(e)||"{}")}catch{}return{...zr,...t,...a}}function Or(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Fr(e,t,a){return new Promise(i=>{const s=Dr(e,t,a),n=document.createElement("iframe");n.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden",document.body.appendChild(n);const r=n.contentWindow.document;r.open(),r.write(s),r.close(),setTimeout(()=>{try{n.contentWindow.focus(),n.contentWindow.print()}finally{setTimeout(()=>{n.remove(),i()},1500)}},250)})}const Qa=()=>typeof navigator<"u"&&"serial"in navigator;async function _r(e,{baud:t=115200}={}){if(!Qa())throw new Error("Bu tarayıcı Web Serial desteklemiyor (Chrome/Edge kullanın).");let a=(await navigator.serial.getPorts())[0];a||(a=await navigator.serial.requestPort()),await a.open({baudRate:t});try{const i=a.writable.getWriter();try{for(let s=0;s<e.length;s+=4096)await i.write(e.subarray(s,s+4096))}finally{i.releaseLock()}}finally{await a.close()}}async function Ur(){if(Qa())for(const e of await navigator.serial.getPorts())try{await e.forget()}catch{}}const Gr=e=>{let t="";for(let a=0;a<e.length;a+=32768)t+=String.fromCharCode(...e.subarray(a,a+32768));return btoa(t)};function Yr(e){return e.agentTarget==="printer"?{type:"printer",name:e.agentPrinter}:{type:"tcp",host:e.agentHost,port:Number(e.agentPort)||9100}}async function Vr(e){return(await fetch(`${e.agentUrl}/health`,{signal:AbortSignal.timeout(2500)})).json()}async function Qr(e){return(await(await fetch(`${e.agentUrl}/printers`,{signal:AbortSignal.timeout(6e3)})).json()).printers||[]}async function Jr(e,t,a="Etiket"){let i;try{i=await fetch(`${t.agentUrl}/print`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target:Yr(t),data:Gr(e),jobName:a}),signal:AbortSignal.timeout(2e4)})}catch{throw new Error("Yazdırma ajanına ulaşılamadı. Ajanın bu bilgisayarda çalıştığından ve adresin doğru olduğundan emin olun.")}const s=await i.json().catch(()=>({}));if(!i.ok||s.success===!1)throw new Error(s.message||`Ajan hatası (${i.status})`)}async function ka(e,t,a,{startCell:i=0}={}){if(a.mode==="browser"||t.kind==="sheet"){if(a.mode!=="browser"&&t.kind==="sheet")throw new Error("A4 yaprak etiketler yalnızca “Tarayıcı / sürücü” ile yazdırılır.");return Fr(e,t,{startCell:i})}for(const s of e){const n=zs(s.layout,a,Math.max(1,s.copies|0));if(a.mode==="serial")await _r(n,{baud:a.baud});else if(a.mode==="agent")await Jr(n,a,t.label);else throw new Error("Bilinmeyen yazıcı bağlantısı.")}}function Wr(e,t,a,i="etiket"){const s=zs(e,t,a),n=document.createElement("a");n.href=URL.createObjectURL(new Blob([s],{type:"application/octet-stream"})),n.download=`${i}.${t.language==="tspl"?"tspl":"zpl"}`,document.body.appendChild(n),n.click(),setTimeout(()=>{URL.revokeObjectURL(n.href),n.remove()},1e3)}const Zr=["Genel","Pastacılık Katkı","Şurup","Aroma","Ezme","Jöle & Jel","Çikolata","Ambalaj"],Xr=["Adet","Kutu","Koli","Paket","Kg","Litre","Metre","Çift"],$a=e=>{const t=new Date(e);return isNaN(t)?"":t.toLocaleString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})};function el(){var g;const e=document.createElement("div");e.className="page-barcode page-container",e.appendChild(ce({title:((g=z.modules.barcode)==null?void 0:g.label)||"Barkod Oluştur",gradientClass:"gradient-stock"}));const t=document.createElement("div");t.className="content-area",e.appendChild(t);const a=z.barcode||{},i=`${z.storageKeys.settings}_barcode_ui`,s=`${z.storageKeys.settings}_printer`;let n={format:a.defaultFormat||"ean13",size:a.defaultSize||"50x30",cw:50,ch:30,show:{name:!0,price:!0,code:!0,company:!!a.showCompany,text:!0},copies:1};try{n={...n,...JSON.parse(localStorage.getItem(i)||"{}")}}catch{}const r=()=>{try{localStorage.setItem(i,JSON.stringify(n))}catch{}};let d=Kr(s,a.printer||{}),l=W.getQueryParams().tab||"create",p=[],c=[],o=[];t.innerHTML=`
    <div class="seg-tabs" role="tablist">
      <button type="button" class="seg-tab" data-tab="create"><i class="ph ph-barcode"></i> Oluştur</button>
      <button type="button" class="seg-tab" data-tab="records"><i class="ph ph-list-magnifying-glass"></i> Kayıtlar</button>
      <button type="button" class="seg-tab" data-tab="printer"><i class="ph ph-printer"></i> Yazıcı</button>
    </div>
    <div id="bc-view"></div>`;const m=t.querySelector("#bc-view");function h(E){l=E,m.onclick=null,m.onchange=null,t.querySelectorAll(".seg-tab").forEach(f=>f.classList.toggle("active",f.dataset.tab===l)),l==="create"?v():l==="records"?L():q()}t.querySelector(".seg-tabs").addEventListener("click",E=>{const f=E.target.closest("[data-tab]");f&&h(f.dataset.tab)});async function b(){try{const[E,f]=await Promise.all([C.getProducts(),C.getWarehouses()]);p=E.success?E.data:[],c=f.success?f.data:[]}catch{}}function v(){const E=[...new Set([...Zr,...p.map(P=>P.category).filter(Boolean)])],f={mode:"new",productId:"",auto:!0,autoValue:"",manual:"",name:"",category:"Genel",unit:"Adet",price:"",qty:"",warehouseId:"",startCell:0};m.innerHTML=`
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
                <select id="bc-cat" class="input-element">${E.map(P=>`<option>${u(P)}</option>`).join("")}</select></div></div>
              <div class="sx-field"><label>Birim</label><div class="input-field"><span class="input-icon"><i class="ph ph-scales"></i></span>
                <select id="bc-unit" class="input-element">${Xr.map(P=>`<option>${u(P)}</option>`).join("")}</select></div></div>
              <div class="sx-field"><label>Birim fiyat (₺)</label><div class="input-field"><span class="input-icon"><i class="ph ph-currency-circle-dollar"></i></span>
                <input id="bc-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0,00" /></div></div>
              <div class="sx-field"><label>Başlangıç stoğu <span class="sx-opt">(isteğe bağlı)</span></label><div class="input-field"><span class="input-icon"><i class="ph ph-hash"></i></span>
                <input id="bc-qty" type="number" min="0" step="1" inputmode="numeric" placeholder="0" /></div></div>
            </div>
            <div class="sx-field" id="bc-wh-wrap" hidden><label>Stoğun gireceği depo</label><div class="input-field"><span class="input-icon"><i class="ph ph-warehouse"></i></span>
              <select id="bc-wh" class="input-element"><option value="">Seçiniz...</option>${c.map(P=>`<option value="${u(P.id)}">${u(P.name)}</option>`).join("")}</select></div></div>
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
          <div class="sx-chips" id="bc-formats">${Object.entries(wt).map(([P,U])=>`<button type="button" class="sx-chip ${P===n.format?"on":""}" data-f="${P}">${U.label}</button>`).join("")}</div>
          <div class="bc-hint" id="bc-fhint"></div>
          <label class="bc-switch"><input type="checkbox" id="bc-auto" checked /> <span>Barkodu otomatik ver</span></label>
          <div class="input-field"><span class="input-icon"><i class="ph ph-barcode"></i></span><input id="bc-value" type="text" maxlength="300" autocomplete="off" /></div>
          <div class="bc-err" id="bc-verr" hidden></div>
        </div>

        <div class="card bc-card">
          <div class="sx-step"><i class="ph ph-ruler"></i> Etiket</div>
          <div class="sx-field"><label>Boyut</label><div class="input-field"><span class="input-icon"><i class="ph ph-frame-corners"></i></span>
            <select id="bc-size" class="input-element">
              <optgroup label="Rulo etiket (termal yazıcı)">${Et.filter(P=>P.kind==="roll").map(P=>`<option value="${P.id}">${u(P.label)} — ${u(P.note)}</option>`).join("")}</optgroup>
              <optgroup label="A4 etiket yaprağı (lazer/inkjet)">${Et.filter(P=>P.kind==="sheet").map(P=>`<option value="${P.id}">${u(P.label)} — ${u(P.note)}</option>`).join("")}</optgroup>
              <option value="custom">Özel ölçü…</option>
            </select></div></div>
          <div class="sx-grid" id="bc-custom" hidden>
            <div class="sx-field"><label>Genişlik (mm)</label><div class="input-field"><input id="bc-cw" type="number" min="10" max="200" step="0.5" /></div></div>
            <div class="sx-field"><label>Yükseklik (mm)</label><div class="input-field"><input id="bc-ch" type="number" min="8" max="300" step="0.5" /></div></div>
          </div>
          <div class="bc-toggles">
            ${[["name","Ürün adı"],["price","Fiyat"],["code","Ürün kodu"],["company","Firma adı"],["text","Barkod altı yazı"]].map(([P,U])=>`<label class="bc-switch"><input type="checkbox" data-show="${P}" ${n.show[P]?"checked":""} /> <span>${U}</span></label>`).join("")}
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

    </div>`;const x=P=>m.querySelector(P);x("#bc-size").value=n.size,x("#bc-cw").value=n.cw,x("#bc-ch").value=n.ch,x("#bc-copies").value=n.copies;let A=null;const j=()=>{if(f.mode==="existing"){const P=p.find(U=>U.id===f.productId);return P?P.barcode||(f.auto?f.autoValue:f.manual):""}return f.auto?f.autoValue:f.manual};async function M(){if(f.auto){try{const P=await C.get(`/barcodes/next?format=${n.format}&prefix=${encodeURIComponent(a.prefix||"2")}`);P.success&&(f.autoValue=P.data.barcode)}catch{}S(),F()}}function S(){const P=x("#bc-value"),U=f.mode==="existing"?p.find(ee=>ee.id===f.productId):null,Q=!!(U&&U.barcode);x("#bc-auto").disabled=Q,x(".bc-switch:has(#bc-auto)").classList.toggle("dis",Q),P.readOnly=Q||f.auto,P.value=Q?U.barcode:f.auto?f.autoValue:f.manual,P.placeholder=f.auto?"Otomatik":wt[n.format].hint,x("#bc-fhint").textContent=Q?`Bu ürünün mevcut barkodu kullanılır (${U.barcode}).`:wt[n.format].hint}function N(){return{ean13:"2000000000015",ean8:"2000001",code128:"P00000001",code39:"P00000001",qr:"P00000001"}[n.format]}function B(){return Ot(n.size,{w:n.cw,h:n.ch})}function O(P){const U=B(),Q=f.mode==="existing"?p.find(re=>re.id===f.productId):null,ee=j()||N(),se=Ra(n.format,ee);return{size:U,valid:se,spec:{wMm:U.w,hMm:U.h,format:n.format,value:se.ok?se.value:N(),name:Q?Q.name:f.name||"Ürün adı",price:Q?Q.price:f.price===""?null:Number(f.price),currency:"₺",code:Q?Q.code:"",company:z.companyName,show:n.show}}}function F(){const{size:P,valid:U,spec:Q}=O(),ee=x("#bc-verr"),se=!!j();ee.hidden=!(se&&!U.ok),ee.textContent=U.ok?"":U.error;try{A=Ft(Q),x("#bc-canvas").innerHTML=Pa(A,{border:!0});const K=x("#bc-canvas svg"),G=Math.min(420,x("#bc-canvas").clientWidth||380),y=Math.min(G/P.w,170/P.h);K.style.width=`${P.w*y}px`,K.style.height=`${P.h*y}px`;const k=x("#bc-warn");k.hidden=!A.warnings.length,k.innerHTML=A.warnings.map(w=>`<i class="ph ph-warning"></i> ${u(w)}`).join("<br>")}catch(K){A=null,x("#bc-canvas").innerHTML=`<div class="bc-dim">${u(K.message)}</div>`}x("#bc-dim").textContent=P.kind==="sheet"?`${P.w} × ${P.h} mm (yaprakta ${P.cols*P.rows} etiket)`:`${P.w} × ${P.h} mm`,x("#bc-start-wrap").hidden=P.kind!=="sheet",x("#bc-custom").hidden=n.size!=="custom";const re=d.mode!=="browser"&&P.kind==="roll";x("#bc-printer-hint").innerHTML=`<i class="ph ph-printer"></i> ${re?`${d.language.toUpperCase()} · ${d.dpi} dpi · ${{serial:"Seri port",agent:"Yerel ajan"}[d.mode]}`:"Tarayıcı / sürücü ile yazdırma"} <a href="#" data-goto="printer">değiştir</a>`}function V(P){f.mode=P,m.querySelectorAll("[data-mode]").forEach(U=>U.classList.toggle("on",U.dataset.mode===P)),x("#bc-new").hidden=P!=="new",x("#bc-existing").hidden=P!=="existing",x("#bc-save-print").innerHTML=P==="new"?'<i class="ph ph-printer"></i> Ürünü kaydet ve yazdır':'<i class="ph ph-printer"></i> Etiketi yazdır',P==="existing"&&J(),S(),F()}function J(){const P=(x("#bc-psearch").value||"").toLocaleLowerCase("tr").trim(),U=p.filter(ee=>!P||[ee.name,ee.code,ee.barcode].some(se=>String(se||"").toLocaleLowerCase("tr").includes(P))).slice(0,200),Q=x("#bc-product");Q.innerHTML=`<option value="">${U.length?"Ürün seçin...":"Ürün bulunamadı"}</option>`+U.map(ee=>`<option value="${u(ee.id)}">${u(ee.name)}${ee.barcode?" — "+u(ee.barcode):" — barkodsuz"}</option>`).join(""),U.some(ee=>ee.id===f.productId)?Q.value=f.productId:f.productId=""}m.onclick=P=>{const U=P.target.closest("[data-goto]");if(U)return P.preventDefault(),h(U.dataset.goto);const Q=P.target.closest("[data-mode]");if(Q)return V(Q.dataset.mode);const ee=P.target.closest("[data-f]");ee&&(n.format=ee.dataset.f,r(),m.querySelectorAll("[data-f]").forEach(se=>se.classList.toggle("on",se===ee)),f.autoValue="",S(),F(),M())},x("#bc-name").addEventListener("input",P=>{f.name=P.target.value,F()}),x("#bc-cat").addEventListener("change",P=>{f.category=P.target.value}),x("#bc-unit").addEventListener("change",P=>{f.unit=P.target.value}),x("#bc-price").addEventListener("input",P=>{f.price=P.target.value,F()}),x("#bc-qty").addEventListener("input",P=>{f.qty=P.target.value,x("#bc-wh-wrap").hidden=!(Number(f.qty)>0)}),x("#bc-wh").addEventListener("change",P=>{f.warehouseId=P.target.value}),x("#bc-psearch").addEventListener("input",J),x("#bc-product").addEventListener("change",P=>{f.productId=P.target.value,S(),F()}),x("#bc-auto").addEventListener("change",P=>{f.auto=P.target.checked,f.auto&&M(),S(),F()}),x("#bc-value").addEventListener("input",P=>{f.auto||(f.manual=P.target.value,F())}),x("#bc-size").addEventListener("change",P=>{n.size=P.target.value,r(),F()}),x("#bc-cw").addEventListener("input",P=>{n.cw=Number(P.target.value)||50,r(),F()}),x("#bc-ch").addEventListener("input",P=>{n.ch=Number(P.target.value)||30,r(),F()}),x("#bc-copies").addEventListener("input",P=>{n.copies=Math.max(1,Math.min(1e4,Math.floor(Number(P.target.value)||1))),r()}),x("#bc-start").addEventListener("input",P=>{f.startCell=Math.max(0,(Math.floor(Number(P.target.value))||1)-1)}),m.querySelectorAll("[data-show]").forEach(P=>P.addEventListener("change",()=>{n.show[P.dataset.show]=P.checked,r(),F()})),x("#bc-svg").addEventListener("click",()=>{if(!A)return;const P=document.createElement("a");P.href=URL.createObjectURL(new Blob([Pa(A)],{type:"image/svg+xml"})),P.download=`barkod_${j()||N()}.svg`,document.body.appendChild(P),P.click(),setTimeout(()=>{URL.revokeObjectURL(P.href),P.remove()},800)});async function ae(P,U){var K;const Q=B(),ee=O();if(f.mode==="new"&&!f.name.trim())return R("Ürün adını girin","warning");if(f.mode==="existing"&&!f.productId)return R("Ürünü seçin","warning");const se=!f.auto&&f.mode==="new"||f.mode==="existing"&&!((K=p.find(G=>G.id===f.productId))!=null&&K.barcode)&&!f.auto?f.manual:"";if(se){const G=Ra(n.format,se);if(!G.ok)return R(G.error,"warning")}if(!f.auto&&!se&&f.mode==="new")return R("Barkod değerini girin ya da “otomatik” seçin","warning");if(f.mode==="new"&&Number(f.qty)>0&&!f.warehouseId)return R("Başlangıç stoğu için depo seçin","warning");const re=U.innerHTML;U.disabled=!0,U.innerHTML='<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div>';try{const G={mode:f.mode,productId:f.productId,name:f.name,category:f.category,unit:f.unit,price:f.price,quantity:f.qty,warehouseId:f.warehouseId,barcode:se||void 0,autoPrefix:a.prefix||"2",format:n.format,sizeId:Q.id,widthMm:Q.w,heightMm:Q.h},y=await C.post("/barcodes",G);if(!y.success)throw new Error(y.message||"Kaydedilemedi");const{barcode:k,product:w,labelId:$}=y.data;if(R(`Ürün endekslendi: ${w.name} · ${k}`,"success"),P){const T=Ft({...ee.spec,value:k,name:w.name,price:w.price,code:w.code},d.mode!=="browser"&&Q.kind==="roll"?{dpi:d.dpi}:{});try{await ka([{layout:T,copies:n.copies}],Q,d,{startCell:f.startCell}),C.post(`/barcodes/${$}/print`,{copies:n.copies}).catch(()=>{}),R(`${n.copies} etiket yazıcıya gönderildi`,"success")}catch(D){R(`Ürün kaydedildi ama yazdırılamadı: ${D.message}`,"error",6e3)}}await b(),v()}catch(G){R(G.message,"error"),U.disabled=!1,U.innerHTML=re}}x("#bc-save-print").addEventListener("click",P=>ae(!0,P.currentTarget)),x("#bc-save").addEventListener("click",P=>ae(!1,P.currentTarget)),V("new"),S(),F(),M()}async function L(){m.innerHTML=`
      <div class="card bc-card">
        <div class="input-field"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="bcr-q" type="search" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" /></div>
      </div>
      <div class="list-toolbar"><span id="bcr-count"></span>${je("bcr-export")}</div>
      <div id="bcr-list"><div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div></div>`;const E=j=>m.querySelector(j);let f="";async function x(){try{const j=await C.get("/barcodes"+(f?`?q=${encodeURIComponent(f)}`:""));if(!j.success)throw new Error(j.message);o=j.data}catch(j){E("#bcr-list").innerHTML=`<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${u(j.message)}</div></div>`;return}E("#bcr-count").textContent=`${o.length} barkod`,E("#bcr-list").innerHTML=o.length?o.map(j=>{var M;return`
        <div class="bcr-item">
          <div class="bcr-main">
            <div class="bcr-name">${u(j.name||"(silinmiş ürün)")}</div>
            <div class="bcr-code">${u(j.barcode)}</div>
            <div class="bcr-meta"><span class="act-ref">${u(((M=wt[j.format])==null?void 0:M.label)||j.format)}</span> <span class="act-ref">${u(j.widthMm)}×${u(j.heightMm)} mm</span>
              <span>${u(j.createdBy||"")} · ${u($a(j.createdAt))}</span></div>
            <div class="bcr-meta"><i class="ph ph-printer"></i> ${j.printCount?`${j.printCount} etiket yazdırıldı${j.lastPrintedAt?" · son: "+u($a(j.lastPrintedAt)):""}`:"Henüz yazdırılmadı"}</div>
          </div>
          <button type="button" class="btn btn-secondary" data-print="${j.id}"><i class="ph ph-printer"></i> Yazdır</button>
        </div>`}).join(""):'<div class="empty-state"><div class="empty-icon"><i class="ph ph-barcode"></i></div><div class="empty-text">Henüz barkod oluşturulmadı</div></div>'}let A;E("#bcr-q").addEventListener("input",j=>{clearTimeout(A),A=setTimeout(()=>{f=j.target.value.trim(),x()},250)}),E("#bcr-export").addEventListener("click",()=>we("Barkod kayitlari",[["Barkod","barcode"],["Ürün","name"],["Ürün kodu","code"],["Tür",j=>{var M;return((M=wt[j.format])==null?void 0:M.label)||j.format}],["Ölçü (mm)",j=>`${j.widthMm}×${j.heightMm}`],["Oluşturan","createdBy"],["Tarih",j=>$a(j.createdAt)],["Yazdırılan adet",j=>j.printCount||0]],o)),E("#bcr-list").addEventListener("click",async j=>{const M=j.target.closest("[data-print]");if(!M)return;const S=o.find(F=>String(F.id)===M.dataset.print);if(!S)return;const N=await za({title:"Kaç etiket yazdırılsın?",label:`${S.name||S.barcode} · ${S.widthMm}×${S.heightMm} mm`,value:"1",required:!0,confirmLabel:"Yazdır",maxlength:5});if(N==null)return;const B=Math.max(1,Math.min(1e4,Math.floor(Number(N))||1)),O=Et.find(F=>F.id===S.sizeId)||Ot("custom",{w:S.widthMm,h:S.heightMm});try{const F=Ft({wMm:O.w,hMm:O.h,format:S.format,value:S.barcode,name:S.name,price:S.price,currency:"₺",code:S.code,company:z.companyName,show:n.show},d.mode!=="browser"&&O.kind==="roll"?{dpi:d.dpi}:{});await ka([{layout:F,copies:B}],O,d),C.post(`/barcodes/${S.id}/print`,{copies:B}).catch(()=>{}),R(`${B} etiket yazıcıya gönderildi`,"success"),x()}catch(F){R(F.message,"error",6e3)}}),x()}function q(){var S,N,B,O;const E=d,f=E.mode!=="browser";m.innerHTML=`
    <div class="card bc-card">
      <div class="sx-step"><i class="ph ph-plugs-connected"></i> Yazıcı bağlantısı <span class="bc-dim">(bu cihaz için)</span></div>
      <div class="bc-modes">
        ${[["browser","ph-desktop","Tarayıcı / sürücü","Bilgisayara veya telefona tanıtılmış her yazıcı. Etiket ölçüsü tam olarak ayarlanır."],["serial","ph-usb","Seri port (USB/Bluetooth)","Zebra/TSC/Xprinter gibi yazıcılara doğrudan ham komut. Chrome/Edge gerekir."],["agent","ph-hard-drives","Yerel yazdırma ajanı","Ağ (IP) yazıcısı veya bilgisayara bağlı USB yazıcı. Ajan programı o bilgisayarda çalışır."]].map(([F,V,J,ae])=>`<label class="bc-mode-card ${E.mode===F?"on":""}"><input type="radio" name="pm" value="${F}" ${E.mode===F?"checked":""} /><i class="ph ${V}"></i><b>${J}</b><small>${ae}</small></label>`).join("")}
      </div>
    </div>

    <div class="card bc-card" id="bcp-raw" ${f?"":"hidden"}>
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
      <div class="bc-hint">${Qa()?"İlk yazdırmada tarayıcı port seçtirir; seçim hatırlanır. Bluetooth yazıcıyı önce cihaz eşleştirmesinden ekleyin (SPP/seri port).":"<b>Bu tarayıcı Web Serial desteklemiyor.</b> Chrome veya Edge (masaüstü / Android) kullanın ya da “Tarayıcı / sürücü” seçin."}</div>
      <div class="sx-field"><label>Baud hızı</label><div class="input-field"><select id="bcp-baud" class="input-element">${[9600,19200,38400,57600,115200,230400].map(F=>`<option>${F}</option>`).join("")}</select></div></div>
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
        <button type="button" class="btn btn-secondary" id="bcp-dl" ${f?"":"hidden"}><i class="ph ph-file-arrow-down"></i> Komutu dosya olarak indir</button>
      </div>
      <div class="bc-hint">Test, seçili etiket boyutunda (${u(Ot(n.size,{w:n.cw,h:n.ch}).label)}) örnek bir EAN-13 basar. Çıktı ters/kaymış ise ayarları buradan düzeltin.</div>
    </div>`;const x=F=>m.querySelector(F),A=()=>{Or(s,d)};x("#bcp-lang").value=E.language,x("#bcp-dpi").value=String(E.dpi),x("#bcp-media").value=E.media,x("#bcp-gap").value=E.gap,x("#bcp-dir").value=String(E.direction),x("#bcp-baud").value=String(E.baud),x("#bcp-aurl").value=E.agentUrl,x("#bcp-atype").value=E.agentTarget,x("#bcp-ahost").value=E.agentHost,x("#bcp-aport").value=E.agentPort,x("#bcp-aprn").value=E.agentPrinter;const j=()=>{m.querySelectorAll("[data-a]").forEach(F=>{F.hidden=F.dataset.a!==d.agentTarget}),x("#bcp-gap-wrap").hidden=x("#bcp-dir-wrap").hidden=d.language!=="tspl"};j(),m.onchange=F=>{const V=F.target;if(V.name==="pm")return d.mode=V.value,A(),q();const ae={"bcp-lang":["language",String],"bcp-dpi":["dpi",Number],"bcp-media":["media",String],"bcp-gap":["gap",Number],"bcp-dir":["direction",Number],"bcp-baud":["baud",Number],"bcp-aurl":["agentUrl",P=>String(P).trim().replace(/\/$/,"")],"bcp-atype":["agentTarget",String],"bcp-ahost":["agentHost",P=>String(P).trim()],"bcp-aport":["agentPort",Number],"bcp-aprn":["agentPrinter",P=>String(P).trim()]}[V.id];ae&&(d[ae[0]]=ae[1](V.value),A(),j())},(S=x("#bcp-forget"))==null||S.addEventListener("click",async()=>{await Ur(),R("Kayıtlı port unutuldu","success")}),(N=x("#bcp-ping"))==null||N.addEventListener("click",async()=>{const F=x("#bcp-astatus");F.textContent="Deneniyor...";try{const V=await Vr(d);F.innerHTML=`<i class="ph ph-check-circle" style="color:var(--success)"></i> Ajan çalışıyor (sürüm ${u(V.version)}, ${u(V.platform)}).`}catch{F.innerHTML='<i class="ph ph-warning" style="color:var(--error)"></i> Ajana ulaşılamadı. Ajan çalışıyor mu? Adres doğru mu? Sitenizin adresi ajanın izinli listesinde mi?'}}),(B=x("#bcp-list"))==null||B.addEventListener("click",async()=>{const F=x("#bcp-astatus");try{const V=await Qr(d);x("#bcp-prn-list").innerHTML=V.map(J=>`<option value="${u(J)}">`).join(""),F.textContent=V.length?`${V.length} yazıcı bulundu; kutuya tıklayıp seçin.`:"Yüklü yazıcı bulunamadı."}catch{F.textContent="Ajana ulaşılamadı."}});function M(F){const V=Ot(n.size,{w:n.cw,h:n.ch}),J=Ft({wMm:V.w,hMm:V.h,format:"ean13",value:"200000000001",name:"TEST ETİKETİ Çş Ğü İö",price:12.5,currency:"₺",code:"PRD-TEST",company:z.companyName,show:{name:!0,price:!0,code:!0,company:!0,text:!0}},F?{dpi:F}:{});return{size:V,layout:J}}x("#bcp-test").addEventListener("click",async F=>{const V=F.currentTarget;V.disabled=!0;try{const{size:J,layout:ae}=M(d.mode!=="browser"?d.dpi:0);await ka([{layout:ae,copies:1}],J,d),R("Test etiketi gönderildi","success")}catch(J){R(J.message,"error",6e3)}finally{V.disabled=!1}}),(O=x("#bcp-dl"))==null||O.addEventListener("click",()=>{const{layout:F}=M(d.dpi);Wr(F,d,1,"test-etiketi")})}return(async()=>(await b(),h(["create","records","printer"].includes(l)?l:"create")))(),e}const te=(e,t="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:t,maximumFractionDigits:2}).format(Number(e)||0)}catch{return`${Number(e)||0} ${t}`}},tl=e=>e?new Date(String(e).length<=10?`${e}T00:00:00`:e):null,Ae=e=>{const t=tl(e);return t&&!isNaN(t)?t.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—"},Ks=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,ot=()=>Ks(new Date),al=e=>{const[t,a]=e.split("-");return new Date(Number(t),Number(a)-1,1).toLocaleDateString("tr-TR",{month:"short"})},sl={TRY:"₺",USD:"$",EUR:"€",GBP:"£"},ms={installment:{icon:"ph-bank",label:"Kredi taksiti"},cheque_out:{icon:"ph-note-pencil",label:"Ödenecek çek/senet"},cheque_in:{icon:"ph-note",label:"Tahsil edilecek çek/senet"},supplier:{icon:"ph-truck",label:"Tedarikçi ödemesi"}},hs={pending:"Bekliyor",collected:"Tahsil edildi",paid:"Ödendi",bounced:"Karşılıksız / iade",cancelled:"İptal"},il=[["annuity","Eşit taksit"],["equal_principal","Eşit anapara"],["bullet","Sonda anapara (aylık faiz)"]];function xt(e){return e==null?"":e<0?`<span class="fin-chip late"><i class="ph ph-warning"></i> ${-e} gün gecikti</span>`:e===0?'<span class="fin-chip soon"><i class="ph ph-clock-countdown"></i> Bugün</span>':`<span class="fin-chip ${e<=7?"soon":""}">${e} gün kaldı</span>`}const ct=(e,t="ph-tray")=>`<div class="empty-state fin-empty"><i class="ph ${t}"></i><p>${u(e)}</p></div>`,nl=()=>'<div class="loading-spinner"></div>',bs=e=>`<div class="card fin-err"><i class="ph ph-warning-circle"></i> ${u(e)}</div>`;function rl({embedded:e=!1}={}){var G;const t=document.createElement("div");t.className=`page-finance page-container${e?" fin-embedded":""}`,e||t.appendChild(ce({title:((G=z.modules.finance)==null?void 0:G.label)||"Finans",gradientClass:"gradient-reports"}));const a=document.createElement("div");a.className="content-area",t.appendChild(a);const i=[["overview","ph-chart-line-up","Özet"],["accounts","ph-vault","Hesaplar"],["parties","ph-users-three","Cari"],["loans","ph-bank","Krediler"],["cheques","ph-note","Çek/Senet"],["ledger","ph-list-checks","Hareketler"]];a.innerHTML=`
    <div class="seg-tabs fin-tabs" role="tablist">${i.map(([y,k,w])=>`<button type="button" class="seg-tab" data-tab="${y}"><i class="ph ${k}"></i> <span>${w}</span></button>${y==="overview"&&!e?'<a class="seg-tab fin-link" href="#/calendar"><i class="ph ph-calendar-dots"></i> <span>Takvim</span></a><a class="seg-tab fin-link" href="#/cashflow"><i class="ph ph-chart-bar"></i> <span>Nakit Akışı</span></a>':""}`).join("")}</div>
    <div id="fin-view"></div>`;const s=a.querySelector("#fin-view");let n=null,r=W.getQueryParams().tab||"overview",d=W.getQueryParams().sub||"customers",l={accountId:"",direction:"",q:"",from:"",to:""},p=0;const c=()=>!!(n&&n.canManage);async function o(){var k;n=(await C.get("/finance/meta")).data;try{await Ma(),fe("jt.users.manage")&&!a.querySelector('[data-tab="team"]')&&(a.querySelector(".fin-tabs").insertAdjacentHTML("beforeend",'<button type="button" class="seg-tab" data-tab="team"><i class="ph ph-lock-key"></i> <span>Yetkiler</span></button>'),(k=a.querySelector(`[data-tab="${r}"]`))==null||k.classList.add("active"))}catch{}return n}const m=y=>(n.accounts||[]).filter(k=>k.active&&(!y||k.currency===y)).map(k=>[k.id,`${k.name} · ${te(k.balance,k.currency)}`]);function h(y){r=y,s.onclick=null,s.onchange=null,s.oninput=null,a.querySelectorAll(".seg-tab").forEach($=>$.classList.toggle("active",$.dataset.tab===r));const k=++p;s.innerHTML=nl();const w={overview:N,accounts:B,parties:F,loans:V,cheques:P,ledger:U,team:Q}[r]||N;Promise.resolve().then(async()=>{n||await o(),k===p&&await w(k),k===p&&K()}).catch($=>{k===p&&(s.innerHTML=bs($.message||"Finans verileri alınamadı."))})}const b=(y,k={})=>{W.step({tab:y,...k}),h(y)};a.querySelector(".seg-tabs").addEventListener("click",y=>{const k=y.target.closest("[data-tab]");k&&k.dataset.tab!==r&&b(k.dataset.tab)});const v=()=>h(r),L=(y,k)=>R(y&&y.message||k,"success");async function q(y){try{const k=await y();k&&(L(k),await o(),v())}catch(k){R(k.message||"İşlem yapılamadı","error")}}const g=y=>{s.onclick=k=>{const w=k.target.closest("[data-act]");!w||!y[w.dataset.act]||y[w.dataset.act](w.dataset,w)}},E=({title:y,message:k,currency:w,amount:$,dateLabel:T="Tarih",confirmLabel:D="Kaydet",extra:_=[]})=>Ke({title:y,message:k,confirmLabel:D,icon:"ph-hand-coins",fields:[{name:"accountId",label:"Hesap",type:"select",options:m(w),required:!0},{name:"amount",label:"Tutar",type:"number",value:$??"",min:0,half:!0,required:!0},{name:"date",label:T,type:"date",value:ot(),half:!0,required:!0},..._],validate:H=>H.accountId?H.amount>0?"":"Tutar sıfırdan büyük olmalı.":`${w||""} cinsinden bir hesap açmanız gerekir (Hesaplar sekmesi).`}),f=y=>q(async()=>{const k=await E({title:`Tahsilat · ${y.name}`,message:`Mevcut bakiye: ${te(y.balance,y.currency)}`,currency:y.currency,amount:y.balance>0?y.balance:"",confirmLabel:"Tahsil et",extra:[{name:"note",label:"Not / yöntem",placeholder:"Havale, EFT, nakit …"}]});return k&&C.post(`/finance/customers/${encodeURIComponent(y.id)}/payment`,{accountId:k.accountId,amount:k.amount,date:k.date,note:k.note})}),x=(y,k)=>q(async()=>{const w=await E({title:`Ödeme · ${y.name}`,message:`Toplam borç: ${te(y.balance,y.currency)}`,currency:y.currency,amount:k??(y.balance>0?y.balance:""),confirmLabel:"Öde",extra:[{name:"note",label:"Not",placeholder:"Fatura no, havale …"}]});return w&&C.post(`/finance/suppliers/${encodeURIComponent(y.id)}/payment`,{accountId:w.accountId,amount:w.amount,date:w.date,note:w.note})}),A=(y,k,w,$)=>q(async()=>{const T=await E({title:"Taksit ödemesi",message:`${k} · kalan ${te($,w)}`,currency:w,amount:$,confirmLabel:"Öde",dateLabel:"Ödeme tarihi"});return T&&C.post(`/finance/installments/${encodeURIComponent(y)}/pay`,{accountId:T.accountId,amount:T.amount,date:T.date})}),j=y=>q(async()=>{const k=y.kind==="payable",w=await E({title:k?"Çek/senet ödemesi":"Çek/senet tahsilatı",message:`${y.partyName||""} · ${te(y.amount,y.currency)}`,currency:y.currency,amount:y.amount,confirmLabel:k?"Ödendi":"Tahsil edildi",dateLabel:"İşlem tarihi"});return w&&C.post(`/finance/cheques/${encodeURIComponent(y.id)}/settle`,{accountId:w.accountId,date:w.date})});function M(y,k,w,$){const T=y.map(H=>`<tr><td>${Ae(H.date)}</td><td>${u(H.text)}</td><td class="num">${H.debit?te(H.debit,w):""}</td><td class="num">${H.credit?te(H.credit,w):""}</td><td class="num"><b>${te(H.balance,w)}</b></td></tr>`).join(""),D=k?`<tr class="dim"><td>—</td><td>Devir bakiye</td><td></td><td></td><td class="num">${te(k,w)}</td></tr>`:"";return`<div class="fin-tablewrap"><table class="fin-table"><thead><tr>${($==="supplier"?["Tarih","Açıklama","Ödeme","Mal kabul (borç)","Kalan borç"]:["Tarih","Açıklama","Borç (satış)","Alacak (tahsilat/iade)","Bakiye"]).map((H,I)=>`<th class="${I>1?"num":""}">${H}</th>`).join("")}</tr></thead><tbody>${D}${T||'<tr><td colspan="5">Hareket yok.</td></tr>'}</tbody></table></div>`}async function S(y,k){try{const w=await C.get(`/finance/${y==="supplier"?"suppliers":"customers"}/${encodeURIComponent(k)}/statement`),$=y==="supplier"?w.data.supplier:w.data.customer,T=y==="supplier"?0:w.data.opening;await Aa({title:`${$.name} · Ekstre`,icon:"ph-receipt",html:`<p>Güncel ${y==="supplier"?"borç":"bakiye"}: <b>${te($.balance,$.currency)}</b>${y==="customer"?` · vade ${$.paymentTerm} gün`:""}</p>${M(w.data.lines,T,$.currency,y)}`,extra:[{label:"Dışa aktar",cls:"btn-secondary",icon:"ph-download-simple",value:"export"}]})==="export"&&we(`${$.name} ekstre`,[["Tarih",_=>_.date],["Açıklama","text"],[y==="supplier"?"Ödeme":"Borç","debit"],[y==="supplier"?"Mal kabul":"Alacak","credit"],["Bakiye","balance"]],w.data.lines)}catch(w){R(w.message,"error")}}async function N(y){const[k,w,$]=await Promise.all([C.get("/finance/summary"),C.get("/finance/cashflow?months=6"),C.get("/finance/reminders")]);if(y!==p)return;const T=k.data,D=[...new Set([...T.cash,...T.receivables,...T.payables,...T.loans].map(Y=>Y.currency))],_=(Y,$e,Ge="total")=>(Y.find(lt=>lt.currency===$e)||{})[Ge]||0,H=(Y,$e="total")=>Y.length?Y.map(Ge=>`<b>${te(Ge[$e],Ge.currency)}</b>`).join(""):"<b>—</b>",I=Y=>Y.filter($e=>$e.overdue>.004).map($e=>`<small class="bad">Vadesi geçmiş: ${te($e.overdue,$e.currency)}</small>`).join(""),Z=D.map(Y=>`<b>${te(_(T.cash,Y)+_(T.receivables,Y)-_(T.payables,Y)-_(T.loans,Y),Y)}</b>`).join(""),X=T.upcoming,le=T.flow30.length?T.flow30.map(Y=>`<div class="fin-flow"><span class="in"><i class="ph ph-arrow-down-left"></i> ${te(Y.in,Y.currency)}</span><span class="out"><i class="ph ph-arrow-up-right"></i> ${te(Y.out,Y.currency)}</span><span class="net ${Y.in-Y.out<0?"bad":"good"}">Net ${te(Y.in-Y.out,Y.currency)}</span></div>`).join(""):'<p class="hint">Önümüzdeki 30 günde vadesi gelen kalem yok.</p>',de=Math.max(1,...w.data.months.map(Y=>Math.max(Y.in,Y.out))),pe=w.data.months.map(Y=>`<div class="fin-bar"><div class="fin-bar-cols"><i class="in" style="height:${Math.round(Y.in/de*100)}%" title="Giriş ${te(Y.in)}"></i><i class="out" style="height:${Math.round(Y.out/de*100)}%" title="Çıkış ${te(Y.out)}"></i></div><span>${al(Y.month)}</span></div>`).join(""),Ue=w.data.expenseByCategory.slice(0,5),Dt=Math.max(1,...Ue.map(Y=>Y.total));s.innerHTML=`
      ${T.overdueCount||T.dueSoonCount?`<div class="fin-alert ${T.overdueCount?"late":"soon"}"><i class="ph ${T.overdueCount?"ph-warning":"ph-bell-ringing"}"></i><div>${T.overdueCount?`<b>${T.overdueCount} kredi/çek/tedarikçi kaleminin vadesi geçti.</b> `:""}${T.dueSoonCount?`${T.dueSoonCount} kalemin vadesi 7 gün içinde doluyor.`:""}</div></div>`:""}
      <div class="fin-kpis">
        <div class="fin-kpi"><i class="ph ph-vault"></i><span>Nakit (kasa + banka)</span>${H(T.cash)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Müşteri alacakları</span>${H(T.receivables)}${I(T.receivables)}</div>
        <div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Tedarikçi borçları</span>${H(T.payables)}${I(T.payables)}</div>
        <div class="fin-kpi"><i class="ph ph-bank"></i><span>Kredi borcu (kalan anapara)</span>${H(T.loans)}${I(T.loans)}</div>
        <div class="fin-kpi net"><i class="ph ph-scales"></i><span>Net durum <em>nakit + alacak − borç − kredi</em></span>${Z||"<b>—</b>"}</div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vadesi yaklaşan ve geciken ödemeler</h3><span class="hint">30 gün</span></div>
        ${X.length?`<div class="fin-list">${X.map(Y=>`
          <div class="fin-row ${Y.daysLeft<0?"late":""}">
            <span class="fin-ico ${Y.direction}"><i class="ph ${ms[Y.kind].icon}"></i></span>
            <div class="fin-main"><div class="fin-title">${u(Y.title)}</div><div class="fin-sub">${u(Y.party||ms[Y.kind].label)} · ${Ae(Y.dueDate)} ${xt(Y.daysLeft)}</div></div>
            <div class="fin-amt ${Y.direction}">${Y.direction==="in"?"+":"−"}${te(Y.amount,Y.currency)}</div>
            ${c()?`<button class="btn btn-secondary btn-sm" data-act="quick" data-kind="${Y.kind}" data-id="${u(Y.id)}" data-cur="${Y.currency}" data-amt="${Y.amount}" data-title="${u(Y.title)}">${Y.direction==="in"?"Tahsil et":"Öde"}</button>`:""}
          </div>`).join("")}</div>`:ct("Yaklaşan ödeme yok. Harika!","ph-confetti")}
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>30 günlük nakit beklentisi</h3></div>${le}</div>
        <div class="card fin-card"><div class="fin-card-head"><h3>En yüksek alacaklar</h3></div>
          ${T.topDebtors.length?T.topDebtors.map(Y=>`<div class="fin-line"><span>${u(Y.name)}${Y.overdue>0?' <span class="fin-chip late">vadesi geçmiş</span>':""}</span><b>${te(Y.balance,Y.currency)}</b></div>`).join(""):'<p class="hint">Açık müşteri bakiyesi yok.</p>'}
        </div>
      </div>

      <div class="fin-two">
        <div class="card fin-card"><div class="fin-card-head"><h3>Nakit akışı · son 6 ay</h3><span class="hint">${sl[w.data.currency]||w.data.currency}</span></div>
          <div class="fin-bars">${pe}</div><div class="fin-legend"><span class="in">■ Giriş</span><span class="out">■ Çıkış</span></div></div>
        <div class="card fin-card"><div class="fin-card-head"><h3>Gider dağılımı</h3></div>
          ${Ue.length?Ue.map(Y=>`<div class="fin-catrow"><div><span>${u(Y.category)}</span><b>${te(Y.total,w.data.currency)}</b></div><i style="width:${Math.round(Y.total/Dt*100)}%"></i></div>`).join(""):'<p class="hint">Bu dönemde gider kaydı yok.</p>'}
        </div>
      </div>

      <div class="card fin-card"><div class="fin-card-head"><h3>Vade hatırlatmaları</h3></div>
        <p class="hint">Kredi taksiti, çek/senet ve tedarikçi ödemelerinin vadesi yaklaşınca finans yetkilerine <b>bildirim</b> düşer (zil simgesi). Vade geçince her gün tekrar hatırlatılır.</p>
        <div class="fin-remind"><label>Hatırlatma günleri <small>vadeden kaç gün önce (virgülle)</small><input id="fin-days" type="text" value="${u(n.remindDays)}" ${c()?"":"disabled"} /></label>
          ${c()?'<button class="btn btn-secondary" data-act="saveDays">Kaydet</button><button class="btn btn-secondary" data-act="runRemind"><i class="ph ph-bell-ringing"></i> Şimdi hatırlat</button>':""}</div>
        <p class="hint">Şu an hatırlatma kapsamındaki kalem: <b>${$.data.items.length}</b></p>
      </div>`,g({quick:Y=>{if(Y.kind==="installment")return A(Y.id,Y.title,Y.cur,Number(Y.amt));if(Y.kind==="supplier"){const $e=Y.id.split(":")[0];return q(async()=>{const lt=(await C.get("/finance/suppliers")).data.find(_s=>_s.id===$e);if(!lt)throw new Error("Tedarikçi bulunamadı.");return x(lt,Number(Y.amt)),null})}return q(async()=>{const Ge=(await C.get("/finance/cheques")).data.find(lt=>lt.id===Y.id);if(!Ge)throw new Error("Kayıt bulunamadı.");return j(Ge),null})},saveDays:()=>q(()=>C.put("/finance/settings",{remindDays:s.querySelector("#fin-days").value})),runRemind:()=>q(()=>C.post("/finance/reminders/run",{}))})}async function B(y){const k=await C.get("/finance/accounts");if(y!==p)return;n.accounts=k.data;const w={};k.data.filter($=>$.active).forEach($=>{w[$.currency]=(w[$.currency]||0)+$.balance}),s.innerHTML=`
      <div class="fin-toolbar">
        ${c()?`<button class="btn btn-primary" data-act="tx" data-type="in"><i class="ph ph-plus-circle"></i> Gelir</button>
        <button class="btn btn-primary" data-act="tx" data-type="out"><i class="ph ph-minus-circle"></i> Gider</button>
        <button class="btn btn-secondary" data-act="tx" data-type="transfer"><i class="ph ph-arrows-left-right"></i> Virman</button>
        <button class="btn btn-secondary" data-act="newAcc"><i class="ph ph-vault"></i> Hesap aç</button>`:""}
        ${je("fin-acc-export")}
      </div>
      <div class="fin-kpis">${Object.entries(w).map(([$,T])=>`<div class="fin-kpi"><i class="ph ph-coins"></i><span>Toplam ${$}</span><b>${te(T,$)}</b></div>`).join("")||""}</div>
      ${k.data.length?`<div class="fin-list">${k.data.map($=>`
        <div class="card fin-acc ${$.active?"":"off"}">
          <span class="fin-ico"><i class="ph ${$.type==="cash"?"ph-money":"ph-bank"}"></i></span>
          <div class="fin-main"><div class="fin-title">${u($.name)} ${$.active?"":'<span class="fin-chip">Kapalı</span>'}</div><div class="fin-sub">${$.type==="cash"?"Kasa":"Banka"} · ${$.currency}${$.iban?" · "+u($.iban):""}</div></div>
          <div class="fin-amt ${$.balance<0?"out":""}">${te($.balance,$.currency)}</div>
          <div class="fin-acts"><button class="btn btn-secondary btn-sm" data-act="acc-ledger" data-id="${u($.id)}">Hareketler</button>
          ${c()?`<button class="btn btn-secondary btn-sm" data-act="acc-toggle" data-id="${u($.id)}" data-on="${$.active?1:0}">${$.active?"Kapat":"Aç"}</button>`:""}</div>
        </div>`).join("")}</div>`:ct("Henüz hesap yok. Önce bir kasa veya banka hesabı açın.","ph-vault")}`,s.querySelector("#fin-acc-export").onclick=()=>we("Finans hesaplari",[["Hesap","name"],["Tür",$=>$.type==="cash"?"Kasa":"Banka"],["Para birimi","currency"],["IBAN","iban"],["Bakiye","balance"]],k.data),g({newAcc:()=>q(async()=>{const $=await Ke({title:"Hesap aç",icon:"ph-vault",fields:[{name:"name",label:"Hesap adı",required:!0,placeholder:"Örn. Ana Banka Hesabı"},{name:"type",label:"Tür",type:"select",options:[["bank","Banka"],["cash","Kasa"]],half:!0},{name:"currency",label:"Para birimi",type:"select",options:n.currencies.map(T=>[T,T]),half:!0},{name:"openingBalance",label:"Açılış bakiyesi",type:"number",value:0},{name:"iban",label:"IBAN (isteğe bağlı)"}]});return $&&C.post("/finance/accounts",$)}),"acc-toggle":$=>q(async()=>{const T=n.accounts.find(D=>D.id===$.id);return $.on==="1"&&!await Se({title:"Hesabı kapat",message:"Kapalı hesaba yeni işlem yapılamaz; geçmiş hareketler ve bakiye korunur.",confirmLabel:"Kapat"})?null:C.put(`/finance/accounts/${encodeURIComponent($.id)}`,{name:T.name,iban:T.iban,active:$.on!=="1"})}),"acc-ledger":$=>{l={accountId:$.id,direction:"",q:"",from:"",to:""},h("ledger")},tx:$=>O($.type)})}function O(y){return q(async()=>{const k=m();if(!k.length)throw new Error("Önce bir hesap açın.");const w=y==="transfer",$=await Ke({title:w?"Hesaplar arası virman":y==="in"?"Gelir kaydı":"Gider kaydı",icon:w?"ph-arrows-left-right":"ph-coins",fields:[{name:"accountId",label:w?"Kaynak hesap":"Hesap",type:"select",options:k,required:!0},...w?[{name:"toAccountId",label:"Hedef hesap",type:"select",options:k,value:k[1]?k[1][0]:"",required:!0}]:[{name:"category",label:"Kategori",type:"select",options:(y==="in"?n.inCategories:n.outCategories).map(T=>[T,T])}],{name:"amount",label:"Tutar",type:"number",min:0,half:!0,required:!0},{name:"date",label:"Tarih",type:"date",value:ot(),half:!0,required:!0},{name:"description",label:"Açıklama",placeholder:"İsteğe bağlı"}],validate:T=>T.amount>0?w&&T.accountId===T.toAccountId?"Kaynak ve hedef hesap farklı olmalı.":"":"Tutar sıfırdan büyük olmalı."});return $&&C.post("/finance/transactions",{...$,type:y})})}async function F(y){const k=d==="customers",w=await C.get(`/finance/${k?"customers":"suppliers"}`);if(y!==p)return;const $=w.data.slice().sort((I,Z)=>Z.balance-I.balance);s.innerHTML=`
      <div class="seg-tabs fin-sub"><button class="seg-tab ${k?"active":""}" data-act="sub" data-sub="customers"><i class="ph ph-users"></i> Müşteriler (alacak)</button><button class="seg-tab ${k?"":"active"}" data-act="sub" data-sub="suppliers"><i class="ph ph-truck"></i> Tedarikçiler (borç)</button></div>
      <div class="fin-toolbar"><div class="input-field fin-search"><span class="input-icon"><i class="ph ph-magnifying-glass"></i></span><input id="fin-q" type="text" placeholder="${k?"Müşteri":"Tedarikçi"} ara…" /></div><label class="fin-check"><input type="checkbox" id="fin-open" checked /> Yalnızca bakiyesi olanlar</label>${je("fin-party-export")}</div>
      <p class="hint">${k?"Bakiye, ERP satışlarından gelir; tahsilat yaptıkça düşer. Vade, müşteriye tanımlı ödeme süresidir (varsayılan 30 gün).":"Borç, satın almada mal kabul edilen tutardır (KDV dahil); vade = mal kabul tarihi + tedarikçi ödeme süresi."}</p>
      <div id="fin-plist" class="fin-list"></div>`;const T=s.querySelector("#fin-plist"),D=()=>{const I=s.querySelector("#fin-q").value.trim().toLocaleLowerCase("tr"),Z=s.querySelector("#fin-open").checked,X=$.filter(le=>(!I||le.name.toLocaleLowerCase("tr").includes(I))&&(!Z||Math.abs(le.balance)>.004));T.innerHTML=X.length?X.map(le=>k?_(le):H(le)).join(""):ct("Kayıt bulunamadı.")},_=I=>{const Z=I.aging,X=Math.max(1,Z.current+Z.d30+Z.d60+Z.d90+Z.older),le=(de,pe)=>de>0?`<i class="${pe}" style="width:${de/X*100}%" title="${te(de,I.currency)}"></i>`:"";return`<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${u(I.name)}</div>
          <div class="fin-sub">Vade ${I.paymentTerm} gün${I.lastPayment?" · son tahsilat "+Ae(I.lastPayment):""}${I.lastSale?" · son satış "+Ae(I.lastSale):""}</div>
          ${I.balance>0?`<div class="fin-aging">${le(Z.current,"ok")}${le(Z.d30,"w1")}${le(Z.d60,"w2")}${le(Z.d90,"w3")}${le(Z.older,"w4")}</div>`:""}
          ${I.overdue>0?`<div class="fin-sub bad">Vadesi geçmiş: ${te(I.overdue,I.currency)}</div>`:""}</div>
        <div class="fin-amt ${I.balance>0?"in":I.balance<0?"out":""}">${te(I.balance,I.currency)}<small>${I.balance<0?"avans/alacaklı":"alacak"}</small></div>
        <div class="fin-acts">${c()?`<button class="btn btn-primary btn-sm" data-act="collect" data-id="${u(I.id)}">Tahsilat</button>`:""}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${u(I.id)}">Ekstre</button>${c()?`<button class="btn btn-secondary btn-sm" data-act="term" data-id="${u(I.id)}">Vade</button>`:""}</div></div>`},H=I=>`<div class="card fin-party">
        <div class="fin-main"><div class="fin-title">${u(I.name)}</div>
          <div class="fin-sub">Vade ${I.paymentTerm} gün · toplam alım ${te(I.purchased,I.currency)}${I.lastPayment?" · son ödeme "+Ae(I.lastPayment):""}</div>
          ${I.nextDue&&I.balance>0?`<div class="fin-sub">Sıradaki vade: ${Ae(I.nextDue)} ${xt(Math.round((new Date(`${I.nextDue}T00:00:00`)-new Date(`${ot()}T00:00:00`))/864e5))}</div>`:""}
          ${I.overdue>0?`<div class="fin-sub bad">Vadesi geçmiş: ${te(I.overdue,I.currency)}</div>`:""}</div>
        <div class="fin-amt ${I.balance>0?"out":""}">${te(I.balance,I.currency)}<small>borç</small></div>
        <div class="fin-acts">${c()?`<button class="btn btn-primary btn-sm" data-act="paysup" data-id="${u(I.id)}" ${I.balance>0?"":"disabled"}>Öde</button>`:""}<button class="btn btn-secondary btn-sm" data-act="stmt" data-id="${u(I.id)}">Ekstre</button></div></div>`;D(),s.querySelector("#fin-q").oninput=D,s.querySelector("#fin-open").onchange=D,s.querySelector("#fin-party-export").onclick=()=>k?we("Musteri bakiyeleri",[["Müşteri","name"],["Bakiye","balance"],["Para birimi","currency"],["Vade (gün)","paymentTerm"],["Vadesi geçmiş","overdue"],["Güncel",I=>I.aging.current],["1-30 gün",I=>I.aging.d30],["31-60 gün",I=>I.aging.d60],["61-90 gün",I=>I.aging.d90],["90+ gün",I=>I.aging.older],["Son tahsilat","lastPayment"]],$):we("Tedarikci borclari",[["Tedarikçi","name"],["Borç","balance"],["Para birimi","currency"],["Vade (gün)","paymentTerm"],["Vadesi geçmiş","overdue"],["Sıradaki vade","nextDue"],["Toplam alım","purchased"],["Ödenen","paid"]],$),g({sub:I=>{d!==I.sub&&(d=I.sub,b("parties",{sub:d}))},collect:I=>f($.find(Z=>Z.id===I.id)),paysup:I=>x($.find(Z=>Z.id===I.id)),stmt:I=>S(k?"customer":"supplier",I.id),term:I=>q(async()=>{const Z=$.find(le=>le.id===I.id),X=await Ke({title:`Ödeme vadesi · ${Z.name}`,icon:"ph-calendar-check",fields:[{name:"paymentTerm",label:"Vade (gün)",type:"number",value:Z.paymentTerm,min:0,required:!0,hint:"Satıştan kaç gün sonra tahsil edilmeli"}]});return X&&C.put(`/finance/customers/${encodeURIComponent(Z.id)}/terms`,{paymentTerm:X.paymentTerm})})})}async function V(y){const k=await C.get("/finance/loans");if(y!==p)return;const w=k.data;s.innerHTML=`
      <div class="fin-toolbar">${c()?'<button class="btn btn-primary" data-act="newLoan"><i class="ph ph-plus-circle"></i> Yeni kredi</button>':""}${je("fin-loan-export")}</div>
      ${w.length?`<div class="fin-list">${w.map($=>{const T=$.installmentCount?Math.round($.paidCount/$.installmentCount*100):0,D=$.nextDue?Math.round((new Date(`${$.nextDue}T00:00:00`)-new Date(`${ot()}T00:00:00`))/864e5):null;return`<div class="card fin-loan ${$.status==="closed"?"off":""}">
          <div class="fin-loan-head"><span class="fin-ico"><i class="ph ph-bank"></i></span><div class="fin-main"><div class="fin-title">${u($.name)} ${$.status==="closed"?'<span class="fin-chip">Kapalı</span>':""}</div><div class="fin-sub">${u($.lender||"Kurum belirtilmemiş")} · yıllık %${$.rate} · ${$.termMonths} ay</div></div>
            <div class="fin-amt out">${te($.outstandingPrincipal,$.currency)}<small>kalan anapara</small></div></div>
          <div class="fin-progress"><i style="width:${T}%"></i></div>
          <div class="fin-sub">${$.paidCount}/${$.installmentCount} taksit ödendi · çekilen ${te($.principal,$.currency)} · kalan toplam ödeme ${te($.remainingTotal,$.currency)}</div>
          ${$.status==="active"&&$.nextDue?`<div class="fin-next">Sıradaki taksit: <b>${te($.nextAmount,$.currency)}</b> · ${Ae($.nextDue)} ${xt(D)}${$.overdueCount>1?` <span class="fin-chip late">${$.overdueCount} taksit gecikmiş</span>`:""}</div>`:""}
          <div class="fin-acts">
            ${c()&&$.status==="active"&&$.nextDue?`<button class="btn btn-primary btn-sm" data-act="payNext" data-id="${u($.id)}">Sıradaki taksidi öde</button>`:""}
            <button class="btn btn-secondary btn-sm" data-act="plan" data-id="${u($.id)}">Taksit planı</button>
            ${c()?`<button class="btn btn-secondary btn-sm" data-act="loanClose" data-id="${u($.id)}" data-open="${$.status==="closed"?1:0}">${$.status==="closed"?"Yeniden aç":"Kapat"}</button><button class="btn btn-secondary btn-sm" data-act="loanDel" data-id="${u($.id)}">Sil</button>`:""}
          </div></div>`}).join("")}</div>`:ct('Kayıtlı kredi yok. "Yeni kredi" ile taksit planı otomatik oluşturulur.',"ph-bank")}`,s.querySelector("#fin-loan-export").onclick=()=>we("Krediler",[["Kredi","name"],["Kurum","lender"],["Para birimi","currency"],["Çekilen","principal"],["Faiz (yıllık %)","rate"],["Vade (ay)","termMonths"],["Ödenen taksit","paidCount"],["Kalan anapara","outstandingPrincipal"],["Kalan toplam ödeme","remainingTotal"],["Sıradaki vade","nextDue"],["Sıradaki tutar","nextAmount"]],w),g({newLoan:()=>J(),payNext:$=>q(async()=>{const T=(await C.get(`/finance/loans/${encodeURIComponent($.id)}`)).data,D=T.installments.find(_=>_.status!=="paid");if(!D)throw new Error("Ödenecek taksit kalmadı.");return A(D.id,`${T.name} · ${D.no}. taksit (${Ae(D.dueDate)})`,T.currency,Math.round((D.amount-D.paidAmount)*100)/100),null}),plan:async $=>{try{const T=(await C.get(`/finance/loans/${encodeURIComponent($.id)}`)).data,D=T.installments.map(H=>`<tr class="${H.status==="paid"?"dim":H.daysLeft<0?"late":""}${H.id===ee?" fin-hl":""}"><td>${H.no}</td><td>${Ae(H.dueDate)}</td><td class="num">${te(H.principal,T.currency)}</td><td class="num">${te(H.interest+H.tax,T.currency)}</td><td class="num"><b>${te(H.amount,T.currency)}</b></td><td>${H.status==="paid"?`<span class="fin-chip ok">Ödendi ${Ae(H.paidDate)}</span>`:H.paidAmount>0?`<span class="fin-chip soon">Kısmi ${te(H.paidAmount,T.currency)}</span>`:xt(H.daysLeft)}</td></tr>`).join("");await Aa({title:`${T.name} · Taksit planı`,icon:"ph-table",html:`<p>${T.installmentCount} taksit · toplam ödeme ${te(T.totalPayment,T.currency)}</p><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>#</th><th>Vade</th><th class="num">Anapara</th><th class="num">Faiz+vergi</th><th class="num">Taksit</th><th>Durum</th></tr></thead><tbody>${D}</tbody></table></div>`,extra:[{label:"Dışa aktar",cls:"btn-secondary",icon:"ph-download-simple",value:"export"}]})==="export"&&we(`${T.name} taksit plani`,[["No","no"],["Vade","dueDate"],["Anapara","principal"],["Faiz","interest"],["Vergi","tax"],["Taksit","amount"],["Ödenen","paidAmount"],["Durum",H=>H.status==="paid"?"Ödendi":"Bekliyor"]],T.installments)}catch(T){R(T.message,"error")}},loanClose:$=>q(()=>C.post(`/finance/loans/${encodeURIComponent($.id)}/close`,{reopen:$.open==="1"})),loanDel:$=>q(async()=>await Se({title:"Krediyi sil",message:"Kredi ve taksit planı silinir (ödemesi yapılmamış olmalı). Bu işlem geri alınamaz.",confirmLabel:"Sil",danger:!0})?C.delete(`/finance/loans/${encodeURIComponent($.id)}`):null)})}function J(){return q(async()=>{const y=new Date;y.setMonth(y.getMonth()+1);const k=await Ke({title:"Yeni kredi",icon:"ph-bank",wide:!0,confirmLabel:"Krediyi kaydet",fields:[{name:"name",label:"Kredi adı",required:!0,placeholder:"Örn. CNC Tezgâh Yatırım Kredisi"},{name:"lender",label:"Banka / kurum",half:!0},{name:"currency",label:"Para birimi",type:"select",options:n.currencies.map(w=>[w,w]),half:!0},{name:"principal",label:"Kredi tutarı",type:"number",min:0,required:!0,half:!0},{name:"termMonths",label:"Vade (ay)",type:"number",min:1,value:12,required:!0,half:!0},{name:"rate",label:"Yıllık faiz %",type:"number",min:0,value:0,half:!0},{name:"taxRate",label:"Faiz vergisi % (BSMV+KKDF)",type:"number",min:0,value:0,half:!0},{name:"type",label:"Ödeme planı",type:"select",options:il,half:!0},{name:"startDate",label:"Kullanım tarihi",type:"date",value:ot(),half:!0},{name:"firstDueDate",label:"İlk taksit tarihi",type:"date",value:Ks(y),half:!0},{name:"accountId",label:"Kredinin yattığı hesap",type:"select",options:[["","— hesaba işleme —"],...m()],half:!0}],footerHtml:'<div id="fin-loan-prev" class="fin-preview hint">Tutar ve vadeyi girince taksit özeti burada görünür.</div>',validate:w=>{var $;return w.principal>0?w.termMonths>=1?w.accountId&&(($=n.accounts.find(T=>T.id===w.accountId))==null?void 0:$.currency)!==w.currency?"Seçilen hesap kredi para biriminden farklı.":"":"Vade en az 1 ay olmalı.":"Kredi tutarı sıfırdan büyük olmalı."},onMount:w=>{let $;const T=_=>w.querySelector(`#df-${_}`).value,D=()=>{const _={name:"x",principal:T("principal"),rate:T("rate"),taxRate:T("taxRate"),termMonths:T("termMonths"),type:T("type"),startDate:T("startDate"),firstDueDate:T("firstDueDate"),currency:T("currency")},H=w.querySelector("#fin-loan-prev");if(!(Number(_.principal)>0)||!(Number(_.termMonths)>=1)){H.textContent="Tutar ve vadeyi girince taksit özeti burada görünür.";return}C.post("/finance/loans/preview",_).then(I=>{const Z=I.data.schedule;H.innerHTML=`İlk taksit <b>${te(Z[0].amount,_.currency)}</b>${Z.length>1&&Math.abs(Z[Z.length-1].amount-Z[0].amount)>.05?` → son <b>${te(Z[Z.length-1].amount,_.currency)}</b>`:""} · ${Z.length} taksit · toplam ödeme <b>${te(I.data.totalPayment,_.currency)}</b> · toplam faiz+vergi <b>${te(I.data.totalInterest,_.currency)}</b>`}).catch(I=>{H.textContent=I.message})};w.addEventListener("input",()=>{clearTimeout($),$=setTimeout(D,350)}),w.addEventListener("change",()=>{clearTimeout($),$=setTimeout(D,100)})}});return k&&C.post("/finance/loans",{...k,accountId:k.accountId||void 0})})}let ae="pending";async function P(y){const k=await C.get("/finance/cheques");if(y!==p)return;const w=k.data,$=ae==="pending"?w.filter(D=>D.status==="pending"):w,T=D=>{const _={};return w.filter(H=>H.status==="pending"&&H.kind===D).forEach(H=>{_[H.currency]=(_[H.currency]||0)+H.amount}),Object.entries(_).map(([H,I])=>`<b>${te(I,H)}</b>`).join("")||"<b>—</b>"};s.innerHTML=`
      <div class="fin-toolbar">${c()?'<button class="btn btn-primary" data-act="newChq"><i class="ph ph-plus-circle"></i> Çek / senet ekle</button>':""}
        <div class="seg-tabs fin-sub"><button class="seg-tab ${ae==="pending"?"active":""}" data-act="filter" data-f="pending">Bekleyen</button><button class="seg-tab ${ae==="all"?"active":""}" data-act="filter" data-f="all">Tümü</button></div>${je("fin-chq-export")}</div>
      <div class="fin-kpis"><div class="fin-kpi"><i class="ph ph-arrow-circle-down"></i><span>Tahsil edilecek (bekleyen)</span>${T("receivable")}</div><div class="fin-kpi"><i class="ph ph-arrow-circle-up"></i><span>Ödenecek (bekleyen)</span>${T("payable")}</div></div>
      ${$.length?`<div class="fin-list">${$.map(D=>`
        <div class="card fin-row ${D.daysLeft!=null&&D.daysLeft<0?"late":""}">
          <span class="fin-ico ${D.kind==="payable"?"out":"in"}"><i class="ph ${D.kind==="payable"?"ph-note-pencil":"ph-note"}"></i></span>
          <div class="fin-main"><div class="fin-title">${u(D.partyName)} ${D.number?`<small>· ${u(D.number)}</small>`:""}</div>
            <div class="fin-sub">${D.kind==="payable"?"Ödenecek":"Alınan"} · ${D.bank?u(D.bank)+" · ":""}vade ${Ae(D.dueDate)} ${D.status==="pending"?xt(D.daysLeft):`<span class="fin-chip ${D.status==="bounced"?"late":"ok"}">${hs[D.status]}${D.settledDate?" "+Ae(D.settledDate):""}</span>`}</div></div>
          <div class="fin-amt ${D.kind==="payable"?"out":"in"}">${te(D.amount,D.currency)}</div>
          ${c()&&D.status==="pending"?`<div class="fin-acts"><button class="btn btn-primary btn-sm" data-act="settle" data-id="${u(D.id)}">${D.kind==="payable"?"Ödendi":"Tahsil edildi"}</button><button class="btn btn-secondary btn-sm" data-act="bounce" data-id="${u(D.id)}">Karşılıksız</button><button class="btn btn-secondary btn-sm" data-act="chqDel" data-id="${u(D.id)}">Sil</button></div>`:""}
        </div>`).join("")}</div>`:ct("Çek/senet kaydı yok.","ph-note")}`,s.querySelector("#fin-chq-export").onclick=()=>we("Cek ve senetler",[["Tür",D=>D.kind==="payable"?"Ödenecek":"Alınan"],["No","number"],["Karşı taraf","partyName"],["Banka","bank"],["Tutar","amount"],["Para birimi","currency"],["Vade","dueDate"],["Durum",D=>hs[D.status]||D.status]],w),g({filter:D=>{ae=D.f,h("cheques")},settle:D=>j(w.find(_=>_.id===D.id)),bounce:D=>q(async()=>await Se({title:"Karşılıksız / iade",message:"Bu çek/senet karşılıksız çıktı veya iade edildi olarak işaretlenecek (hesap hareketi oluşmaz).",confirmLabel:"İşaretle",danger:!0})?C.post(`/finance/cheques/${encodeURIComponent(D.id)}/status`,{status:"bounced"}):null),chqDel:D=>q(async()=>await Se({title:"Kaydı sil",message:"Bekleyen çek/senet kaydı silinecek.",confirmLabel:"Sil",danger:!0})?C.delete(`/finance/cheques/${encodeURIComponent(D.id)}`):null),newChq:()=>q(async()=>{const[D,_]=await Promise.all([C.get("/finance/customers"),C.get("/finance/suppliers")]),H=[["","— serbest ad gir —"],...D.data.map(pe=>[`c:${pe.id}:${pe.currency}`,`Müşteri · ${pe.name}`]),..._.data.map(pe=>[`s:${pe.id}:${pe.currency}`,`Tedarikçi · ${pe.name}`])],I=await Ke({title:"Çek / senet ekle",icon:"ph-note",fields:[{name:"kind",label:"Tür",type:"select",options:[["receivable","Alınan (tahsil edilecek)"],["payable","Verilen (ödenecek)"]],half:!0},{name:"number",label:"Çek / senet no",half:!0},{name:"party",label:"Müşteri / tedarikçi",type:"select",options:H},{name:"partyName",label:"Serbest ad (keşideci / lehtar)",hint:"Yukarıdan seçmediyseniz"},{name:"amount",label:"Tutar",type:"number",min:0,required:!0,half:!0},{name:"currency",label:"Para birimi",type:"select",options:n.currencies.map(pe=>[pe,pe]),half:!0},{name:"dueDate",label:"Vade tarihi",type:"date",value:ot(),required:!0,half:!0},{name:"bank",label:"Banka",half:!0}],validate:pe=>pe.amount>0?!pe.party&&!pe.partyName?"Bir müşteri/tedarikçi seçin veya ad yazın.":"":"Tutar sıfırdan büyük olmalı."});if(!I)return null;const[Z,X,le]=(I.party||"").split(":"),de={kind:I.kind,number:I.number,amount:I.amount,dueDate:I.dueDate,bank:I.bank,currency:X?le:I.currency,partyName:I.partyName};if(X&&(Z==="c"&&I.kind==="receivable"||Z==="s"&&I.kind==="payable"))de.partyId=X;else if(X){const pe=H.find(Ue=>Ue[0]===I.party)[1].replace(/^(Müşteri|Tedarikçi) · /,"");de.partyName=pe}return C.post("/finance/cheques",de)})})}async function U(y){const k=l,w=new URLSearchParams({limit:"500"});Object.entries(k).forEach(([I,Z])=>{Z&&w.set(I,Z)});const $=await C.get(`/finance/transactions?${w}`);if(y!==p)return;const T=$.data,D={};T.forEach(I=>{D[I.currency]=D[I.currency]||{in:0,out:0},D[I.currency][I.direction]+=I.amount}),s.innerHTML=`
      <div class="card fin-filters">
        <label>Hesap<select id="lf-acc"><option value="">Tümü</option>${n.accounts.map(I=>`<option value="${u(I.id)}" ${k.accountId===I.id?"selected":""}>${u(I.name)}</option>`).join("")}</select></label>
        <label>Yön<select id="lf-dir"><option value="">Hepsi</option><option value="in" ${k.direction==="in"?"selected":""}>Giriş</option><option value="out" ${k.direction==="out"?"selected":""}>Çıkış</option></select></label>
        <label>Başlangıç<input id="lf-from" type="date" value="${u(k.from)}"></label>
        <label>Bitiş<input id="lf-to" type="date" value="${u(k.to)}"></label>
        <label class="wide">Ara<input id="lf-q" type="text" placeholder="Açıklama, kategori, cari…" value="${u(k.q)}"></label>
      </div>
      <div class="fin-toolbar"><span class="hint">${T.length} hareket${Object.entries(D).map(([I,Z])=>` · ${I}: <b class="good">+${te(Z.in,I)}</b> <b class="bad">−${te(Z.out,I)}</b>`).join("")}</span>${je("fin-led-export")}</div>
      ${T.length?`<div class="fin-list">${T.map(I=>`
        <div class="card fin-row">
          <span class="fin-ico ${I.direction}"><i class="ph ${I.direction==="in"?"ph-arrow-down-left":"ph-arrow-up-right"}"></i></span>
          <div class="fin-main"><div class="fin-title">${u(I.category||(I.direction==="in"?"Giriş":"Çıkış"))}${I.partyName?` <small>· ${u(I.partyName)}</small>`:""}</div>
            <div class="fin-sub">${Ae(I.date)} · ${u(I.accountName)}${I.description?" · "+u(I.description):""}${I.createdBy?" · "+u(I.createdBy):""}</div></div>
          <div class="fin-amt ${I.direction}">${I.direction==="in"?"+":"−"}${te(I.amount,I.currency)}</div>
          ${c()?`<button class="btn btn-secondary btn-sm" data-act="void" data-id="${u(I.id)}" title="Hareketi iptal et; bağlı bakiye ve taksit geri alınır">İptal</button>`:""}
        </div>`).join("")}</div>`:ct("Bu filtreye uyan hareket yok.","ph-list-checks")}`;const _=()=>({accountId:s.querySelector("#lf-acc").value,direction:s.querySelector("#lf-dir").value,from:s.querySelector("#lf-from").value,to:s.querySelector("#lf-to").value,q:s.querySelector("#lf-q").value.trim()});let H;s.onchange=()=>{l=_(),h("ledger")},s.oninput=I=>{I.target.id==="lf-q"&&(clearTimeout(H),H=setTimeout(()=>{l=_(),h("ledger")},500))},s.querySelector("#fin-led-export").onclick=()=>we("Finans hareketleri",[["Tarih","date"],["Hesap","accountName"],["Yön",I=>I.direction==="in"?"Giriş":"Çıkış"],["Tutar","amount"],["Para birimi","currency"],["Kategori","category"],["Cari / taraf","partyName"],["Açıklama","description"],["Kaydeden","createdBy"]],T),g({void:I=>q(async()=>await Se({title:"Hareketi iptal et",message:"Hesap bakiyesi düzeltilir; müşteri tahsilatı, taksit veya çek/senet ile bağlıysa onlar da eski haline döner.",confirmLabel:"İptal et",danger:!0})?C.post(`/finance/transactions/${encodeURIComponent(I.id)}/void`,{}):null)})}async function Q(y){if(await Ma(),y===p){if(!fe("jt.users.manage")){s.innerHTML=bs("Kullanıcı ve yetki yönetimi için yetkiniz yok.");return}s.innerHTML='<p class="hint" style="margin-bottom:10px">Kullanıcı ekleyin, rollerini seçin. <b>Finans Sorumlusu</b> rolü finans ekranlarını görür ve tahsilat/ödeme yapar; diğer roller Finans menüsünü görmez.</p><div class="page-jobs"><div id="jt-view" class="jt-view"></div></div>',await Va(s.querySelector("#jt-view"))}}let ee=null,se=(()=>{const y=W.getQueryParams();return y.loan||y.customer||y.supplier||y.cheque||y.tx?y:null})();function re(y){y&&(y.scrollIntoView({behavior:"smooth",block:"center"}),y.classList.add("fin-focus"),setTimeout(()=>y.classList.remove("fin-focus"),2600))}function K(){var w,$;const y=se;if(se=null,!y)return;const k=(T,D)=>[...s.querySelectorAll(`[data-act="${T}"]`)].find(_=>_.dataset.id===D);if(r==="loans"&&y.loan){const T=k("plan",y.loan);if(!T){R("Kredi bulunamadı veya kapatılmış.","error");return}re(T.closest(".card")),ee=y.inst||null,T.click()}else r==="parties"&&(y.customer||y.supplier)?(S(y.supplier?"supplier":"customer",y.supplier||y.customer),re((w=[...s.querySelectorAll("[data-id]")].find(T=>T.dataset.id===(y.supplier||y.customer)))==null?void 0:w.closest(".card, tr"))):(y.cheque||y.tx)&&re(($=[...s.querySelectorAll("[data-id]")].find(T=>T.dataset.id===(y.cheque||y.tx)))==null?void 0:$.closest(".card, tr"))}return h(i.some(y=>y[0]===r)||r==="team"?r:"overview"),t}function ll(){const e=document.createElement("div");e.className="page-purchase-module page-suppliers page-container",e.appendChild(ce({title:nt("suppliers","Tedarikçiler"),gradientClass:"gradient-purchase"}));const t=document.createElement("div");t.className="content-area";const a=document.createElement("div");return t.appendChild(a),e.appendChild(t),setTimeout(()=>Cs(a),0),e}const ol=e=>{if(!e||!e.route)return"";const t=Object.entries(e.params||{}).filter(([,a])=>a!=null&&a!=="").map(([a,i])=>`${encodeURIComponent(a)}=${encodeURIComponent(i)}`).join("&");return t?`${e.route}?${t}`:e.route};function Os(e){const t=ol(e);t&&(window.location.hash===`#/${t}`?W._handleRoute():W.navigate(t))}const he=(e,t="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:t,maximumFractionDigits:2}).format(Number(e)||0)}catch{return`${Number(e)||0} ${t}`}},Je=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,mt=(e,t)=>{const a=new Date(`${e}T00:00:00`);return a.setDate(a.getDate()+t),Je(a)},qe=e=>e?new Date(`${String(e).slice(0,10)}T00:00:00`).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"—",wa={loan_overdue:{cls:"ev-late",icon:"ph-warning-octagon",label:"Vadesi geçmiş kredi"},loan_upcoming:{cls:"ev-loan",icon:"ph-bank",label:"Yaklaşan kredi ödemesi"},loan_paid:{cls:"ev-done",icon:"ph-check-circle",label:"Ödenmiş taksit"},receivable:{cls:"ev-recv",icon:"ph-hand-coins",label:"Müşteri tahsilatı"},receivable_overdue:{cls:"ev-recv-late",icon:"ph-hand-coins",label:"Gecikmiş tahsilat"},other:{cls:"ev-other",icon:"ph-note",label:"Çek/senet · tedarikçi · planlı"}};function xa(e){return e.type==="loan"?e.status==="paid"?"loan_paid":e.status==="overdue"?"loan_overdue":"loan_upcoming":e.type==="receivable"?e.status==="overdue"?"receivable_overdue":"receivable":"other"}const cl=(e,t="TRY")=>{try{return new Intl.NumberFormat("tr-TR",{style:"currency",currency:t,notation:"compact",maximumFractionDigits:1}).format(Number(e)||0)}catch{return he(e,t)}},dl=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"],ye={month:null,hidden:new Set(["loan_paid"]),selected:null};function pl(){const e=document.createElement("div");e.className="fa-page fa-calendar";const t=W.getQueryParams();/^\d{4}-\d{2}$/.test(t.month||"")&&(ye.month=t.month),ye.month||(ye.month=Je(new Date).slice(0,7));let a=null;const i=()=>{const[c,o]=ye.month.split("-").map(Number),m=new Date(c,o-1,1),h=mt(Je(m),-((m.getDay()+6)%7));return{start:h,end:mt(h,41)}};async function s(){const{start:c,end:o}=i();e.querySelector(".fa-cal-body").innerHTML='<div class="loading-spinner"></div>';try{a=(await C.get(`/finance/calendar?from=${c}&to=${o}`)).data,l()}catch(m){e.querySelector(".fa-cal-body").innerHTML=`<div class="card fin-err">${u(m.message)}</div>`}}const n=()=>a.events.filter(c=>!ye.hidden.has(xa(c))),r=c=>c.status==="overdue"&&c.date<i().start?a.today:c.date,d=c=>{const o=wa[xa(c)];return`<button type="button" class="fa-ev ${o.cls}" data-ev="${u(c.id)}" title="${u(`${o.label} · ${c.title} · ${he(c.amount,c.currency)} · vade ${qe(c.date)}`)}"><i class="ph ${o.icon}"></i><span>${u(c.party.name||c.title)}</span><b>${cl(c.amount,c.currency)}</b></button>`};function l(){const{start:c}=i(),m=n().reduce((q,g)=>((q[r(g)]=q[r(g)]||[]).push(g),q),{}),h=a.totals,b=q=>Object.entries(q||{}).map(([g,E])=>he(E,g)).join(" + ")||he(0);e.querySelector(".fa-cal-sum").innerHTML=`
      <div class="fa-kpi ev-late"><small>Vadesi geçmiş kredi</small><b>${b(h.overdueLoans)}</b></div>
      <div class="fa-kpi ev-loan"><small>Yaklaşan kredi ödemesi</small><b>${b(h.upcomingLoans)}</b></div>
      <div class="fa-kpi ev-recv"><small>Tahsil edilecek</small><b>${b(h.receivables)}</b></div>`;const v=ye.month;let L="";for(let q=0;q<42;q++){const g=mt(c,q),E=(m[g]||[]).sort((f,x)=>(f.status==="overdue"?-1:0)-(x.status==="overdue"?-1:0));L+=`<div class="fa-day ${g.slice(0,7)!==v?"out":""} ${g===a.today?"today":""} ${g===ye.selected?"sel":""}" data-day="${g}">
        <span class="fa-dnum">${Number(g.slice(8))}</span>${E.slice(0,3).map(d).join("")}${E.length>3?`<span class="fa-more">+${E.length-3} daha</span>`:""}</div>`}e.querySelector(".fa-cal-body").innerHTML=`<div class="fa-grid">${dl.map(q=>`<div class="fa-wd">${q}</div>`).join("")}${L}</div>`,e.querySelector(".fa-cal-title").textContent=new Date(`${v}-01T00:00:00`).toLocaleDateString("tr-TR",{month:"long",year:"numeric"}),p(m)}function p(c){const o=e.querySelector(".fa-agenda"),m=ye.selected,h=m?c[m]||[]:n().filter(b=>b.status!=="paid"&&b.date<=mt(a.today,14)).sort((b,v)=>b.date.localeCompare(v.date));o.innerHTML=`<h3>${m?qe(m):"Önümüzdeki 14 gün ve gecikenler"}</h3>${h.length?h.map(b=>{const v=wa[xa(b)];return`<button type="button" class="fa-ag-row ${v.cls}" data-ev="${u(b.id)}"><i class="ph ${v.icon}"></i><span class="fa-ag-main"><b>${u(b.title)}</b><small>${u(v.label)} · ${u(b.erpRef.docType)} ${u(b.erpRef.docNo)} · vade ${qe(b.date)}</small></span><span class="fa-ag-amt ${b.direction}">${b.direction==="in"?"+":"−"}${he(b.amount,b.currency)}</span><i class="ph ph-caret-right"></i></button>`}).join(""):'<p class="hint">Bu gün için kayıt yok.</p>'}`}return e.innerHTML=`
    <div class="fa-toolbar">
      <div class="fa-cal-nav"><button class="icon-btn" data-nav="-1" aria-label="Önceki ay"><i class="ph ph-caret-left"></i></button><h2 class="fa-cal-title"></h2><button class="icon-btn" data-nav="1" aria-label="Sonraki ay"><i class="ph ph-caret-right"></i></button><button class="btn btn-secondary btn-sm" data-nav="0">Bugün</button></div>
      <div class="fa-legend">${Object.entries(wa).map(([c,o])=>`<label class="fa-leg ${o.cls}"><input type="checkbox" data-kind="${c}" ${ye.hidden.has(c)?"":"checked"}><i></i>${o.label}</label>`).join("")}</div>
    </div>
    <div class="fa-cal-sum fa-kpis"></div>
    <div class="fa-cal-wrap"><div class="card fa-cal-body"></div><aside class="card fa-agenda"></aside></div>`,e.addEventListener("click",c=>{const o=c.target.closest("[data-nav]");if(o){const v=Number(o.dataset.nav),[L,q]=ye.month.split("-").map(Number);return ye.month=v===0?Je(new Date).slice(0,7):Je(new Date(L,q-1+v,1)).slice(0,7),ye.selected=null,s()}const m=c.target.closest("[data-ev]"),h=m&&m.closest(".fa-day")&&matchMedia("(max-width: 900px)").matches;if(m&&!h){const v=a.events.find(L=>L.id===m.dataset.ev);v&&Os(v.target);return}const b=c.target.closest("[data-day]");b&&a&&(ye.selected=ye.selected===b.dataset.day?null:b.dataset.day,l(),ye.selected&&matchMedia("(max-width: 900px)").matches&&e.querySelector(".fa-agenda").scrollIntoView({behavior:"smooth",block:"start"}))}),e.addEventListener("change",c=>{const o=c.target.dataset.kind;o&&(c.target.checked?ye.hidden.delete(o):ye.hidden.add(o),a&&l())}),s(),e}const _t=()=>{const e=Je(new Date);return{from:mt(e,-30),to:mt(e,60),groupBy:"week",currency:"TRY",direction:"",kind:"",category:"",q:""}},ul=[["day","Gün"],["week","Hafta"],["month","Ay"]];function ml(){const e=document.createElement("div");e.className="fa-page fa-cashflow";const t=W.getQueryParams(),a={..._t(),...Object.fromEntries(Object.entries(t).filter(([o])=>o in _t()))};let i=null,s=null;const n=()=>{const o=Object.entries(a).filter(([m,h])=>h&&h!==_t()[m]).map(([m,h])=>`${m}=${encodeURIComponent(h)}`).join("&");history.replaceState(null,"",`#/cashflow${o?`?${o}`:""}`)};async function r(){const o=e.querySelector(".fa-cf-body");o.innerHTML='<div class="loading-spinner"></div>',n();try{const m=Object.entries(a).filter(([,h])=>h).map(([h,b])=>`${h}=${encodeURIComponent(b)}`).join("&");[i,s]=await Promise.all([C.get(`/finance/cashflow/table?${m}`).then(h=>h.data),s||C.get("/finance/meta").then(h=>h.data)]),d()}catch(m){o.innerHTML=`<div class="card fin-err">${u(m.message)}</div>`}}function d(){const o=i.currency,m=e.querySelector('[name="category"]');m.innerHTML=`<option value="">Tüm kategoriler</option>${i.categories.map(g=>`<option ${g===a.category?"selected":""}>${u(g)}</option>`).join("")}`,e.querySelector('[data-act="plan"]').hidden=!s.canManage;const h=i.lowPoint;e.querySelector(".fa-cf-kpis").innerHTML=`
      <div class="fa-kpi"><small>Açılış (${qe(i.from)})</small><b>${he(i.opening,o)}</b></div>
      <div class="fa-kpi ev-recv"><small>Toplam giriş</small><b>+${he(i.totals.in,o)}</b></div>
      <div class="fa-kpi ev-late"><small>Toplam çıkış</small><b>−${he(i.totals.out,o)}</b></div>
      <div class="fa-kpi"><small>Kapanış (${qe(i.to)})</small><b>${he(i.closing,o)}</b></div>
      <div class="fa-kpi ${h&&h.balance<0?"ev-late":""}"><small>En düşük bakiye</small><b>${h?`${he(h.balance,o)}`:"—"}</b>${h?`<small>${qe(h.date)}</small>`:""}</div>`;const b=Math.max(1,...i.periods.map(g=>Math.max(g.in,g.out))),v=g=>i.groupBy==="month"?new Date(`${g}-01T00:00:00`).toLocaleDateString("tr-TR",{month:"short",year:"2-digit"}):i.groupBy==="week"?`${qe(g).slice(0,6)} hf.`:qe(g).slice(0,6),L=i.periods.map(g=>`<div class="fa-bar" title="${u(`${v(g.key)} · giriş ${he(g.in,o)} · çıkış ${he(g.out,o)} · bakiye ${he(g.closing,o)}`)}">
      <div class="fa-bar-cols"><i class="in ${g.forecastIn>=g.in&&g.in?"fc":""}" style="height:${g.in/b*100}%"></i><i class="out ${g.forecastOut>=g.out&&g.out?"fc":""}" style="height:${g.out/b*100}%"></i></div>
      <small>${v(g.key)}</small><em class="${g.closing<0?"neg":""}">${he(g.closing,o).replace(/,\d+/,"")}</em></div>`).join(""),q=i.rows.map(g=>`<tr class="${g.kind==="forecast"?"fc":""} ${g.target?"link":""}" data-id="${u(g.id)}">
      <td class="c-date">${qe(g.date)}${g.overdue?`<br><span class="fin-chip late">vade ${qe(g.dueDate)}</span>`:""}</td>
      <td class="c-kind">${g.kind==="forecast"?'<span class="fin-chip soon">Tahmin</span>':'<span class="fin-chip ok">Gerçekleşen</span>'}</td>
      <td class="c-desc"><b>${u(g.description||g.category)}</b><br><small>${u(g.category)}${g.account?` · ${u(g.account)}`:""}</small></td>
      <td class="c-party">${u(g.party.name||"")}</td>
      <td class="c-doc"><code>${u(g.erpRef.docType)} ${u(g.erpRef.docNo)}</code></td>
      <td class="num in c-amt">${g.direction==="in"?he(g.amount,o):""}</td>
      <td class="num out c-amt">${g.direction==="out"?he(g.amount,o):""}</td>
      <td class="num c-bal ${g.balance<0?"neg":""}"><b>${he(g.balance,o)}</b></td></tr>`).join("");e.querySelector(".fa-cf-body").innerHTML=`
      <div class="card fa-cf-chart"><div class="fin-card-head"><h3>Dönem özeti</h3><small><i class="dot in"></i> giriş <i class="dot out"></i> çıkış · soluk = tahmin · alt satır: dönem sonu bakiye</small></div><div class="fa-bars">${L||'<p class="hint">Kayıt yok</p>'}</div></div>
      <div class="card fa-cf-table"><div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>Tarih</th><th>Tür</th><th>Açıklama</th><th>Cari</th><th>ERP belge</th><th class="num">Giriş</th><th class="num">Çıkış</th><th class="num">Bakiye</th></tr></thead>
      <tbody><tr class="dim c-open"><td>${qe(i.from)}</td><td colspan="6">Devreden bakiye</td><td class="num"><b>${he(i.opening,o)}</b></td></tr>${q||'<tr><td colspan="8" class="hint">Filtreye uyan kayıt yok.</td></tr>'}</tbody></table></div></div>`}async function l(o){const m=await Ke({title:o?"Planlı kalem":"Planlı kalem ekle",icon:"ph-calendar-plus",wide:!0,message:o&&o.status==="realized"?"Bu kalem gerçekleşmiş; değiştirmek için Hareketler'den ilgili kaydı iptal edin.":"Kira, maaş, vergi gibi henüz gerçekleşmemiş kalemler nakit akışı tahminine ve takvime girer.",confirmLabel:o?"Kaydet":"Ekle",fields:[{name:"direction",label:"Yön",type:"select",options:[["out","Çıkış (gider)"],["in","Giriş (gelir)"]],value:o?o.direction:"out",half:!0},{name:"date",label:"Tarih",type:"date",value:o?o.date:Je(new Date),half:!0,required:!0},{name:"amount",label:"Tutar",type:"number",value:o?o.amount:"",half:!0,required:!0},{name:"currency",label:"Para birimi",type:"select",options:(s.currencies||["TRY"]).map(h=>[h,h]),value:o?o.currency:a.currency,half:!0},{name:"category",label:"Kategori",type:"select",options:[...new Set([...s.outCategories||[],...s.inCategories||[]])].map(h=>[h,h]),value:o?o.category:"Diğer gider"},{name:"description",label:"Açıklama",value:o?o.description:"",required:!0},{name:"erpDocType",label:"ERP belge türü",type:"select",options:[["","—"],["SF","SF · Satış faturası"],["AF","AF · Alış faturası"],["SIP","SIP · Sipariş"],["PLN","PLN · Planlı"]],value:o&&o.erpDocType||"",half:!0},{name:"erpDocNo",label:"ERP belge no",value:o&&o.erpDocNo||"",half:!0}]});if(m)try{const h=o?await C.put(`/finance/planned/${encodeURIComponent(o.id)}`,m):await C.post("/finance/planned",m);R(h.message,"success"),r()}catch(h){R(h.message,"error")}}async function p(o){try{const m=(await C.get("/finance/planned")).data.find(b=>b.id===o);if(!m)return R("Planlı kalem bulunamadı.","error");if(!s.canManage||m.status!=="planned")return l(m);const h=await Ha({title:m.description||"Planlı kalem",message:`${qe(m.date)} · ${he(m.amount,m.currency)}`,icon:"ph-calendar-check",options:[{value:"edit",label:"Düzenle",icon:"ph-pencil-simple"},{value:"realize",label:"Gerçekleşti (hesaba işle)",icon:"ph-check-circle"},{value:"cancel",label:"İptal et",icon:"ph-x-circle"}]});if(h==="edit")return l(m);if(h==="cancel")return R((await C.put(`/finance/planned/${encodeURIComponent(o)}`,{status:"cancelled"})).message,"success"),r();if(h==="realize"){const b=(s.accounts||[]).filter(L=>L.active&&L.currency===m.currency).map(L=>[L.id,`${L.name} · ${he(L.balance,L.currency)}`]),v=await Ke({title:"Hesaba işle",icon:"ph-check-circle",confirmLabel:"İşle",fields:[{name:"accountId",label:"Hesap",type:"select",options:b,required:!0},{name:"date",label:"Tarih",type:"date",value:Je(new Date),required:!0}]});if(!v)return;R((await C.put(`/finance/planned/${encodeURIComponent(o)}`,{status:"realized",...v})).message,"success"),r()}}catch(m){R(m.message,"error")}}e.innerHTML=`
    <form class="card fa-filters" autocomplete="off">
      <label>Başlangıç<input type="date" name="from" value="${u(a.from)}"></label>
      <label>Bitiş<input type="date" name="to" value="${u(a.to)}"></label>
      <label>Grupla<select name="groupBy">${ul.map(([o,m])=>`<option value="${o}" ${a.groupBy===o?"selected":""}>${m}</option>`).join("")}</select></label>
      <label>Para birimi<select name="currency">${["TRY","USD","EUR","GBP"].map(o=>`<option ${a.currency===o?"selected":""}>${o}</option>`).join("")}</select></label>
      <label>Yön<select name="direction"><option value="">Giriş + çıkış</option><option value="in" ${a.direction==="in"?"selected":""}>Yalnız giriş</option><option value="out" ${a.direction==="out"?"selected":""}>Yalnız çıkış</option></select></label>
      <label>Kayıt<select name="kind"><option value="">Gerçekleşen + tahmin</option><option value="actual" ${a.kind==="actual"?"selected":""}>Gerçekleşen</option><option value="forecast" ${a.kind==="forecast"?"selected":""}>Tahmin</option></select></label>
      <label>Kategori<select name="category"></select></label>
      <label class="grow">Ara<input type="search" name="q" value="${u(a.q)}" placeholder="Cari, açıklama, belge no"></label>
      <div class="fa-filter-acts"><button type="button" class="btn btn-secondary btn-sm fa-more-filters" data-act="morefilters"><i class="ph ph-sliders-horizontal"></i> Filtreler</button><button type="button" class="btn btn-secondary btn-sm" data-act="reset" title="Filtreleri sıfırla"><i class="ph ph-arrow-counter-clockwise"></i><span> Sıfırla</span></button><button type="button" class="btn btn-primary btn-sm" data-act="plan" hidden><i class="ph ph-plus"></i><span> Planlı kalem</span></button>${je("fa-cf-export")}</div>
    </form>
    <div class="fa-cf-kpis fa-kpis"></div>
    <div class="fa-cf-body"></div>`;let c;return e.querySelector(".fa-filters").addEventListener("input",o=>{const m=o.target.name;m&&(a[m]=o.target.value,clearTimeout(c),c=setTimeout(r,m==="q"?350:0))}),e.querySelector(".fa-filters").addEventListener("submit",o=>o.preventDefault()),e.addEventListener("click",o=>{var b;const m=o.target.closest("[data-act]");if((m==null?void 0:m.dataset.act)==="reset")return Object.assign(a,_t()),e.querySelectorAll(".fa-filters [name]").forEach(v=>{v.value=a[v.name]??""}),r();if((m==null?void 0:m.dataset.act)==="plan")return l(null);if((m==null?void 0:m.dataset.act)==="morefilters"){e.querySelector(".fa-filters").classList.toggle("open");return}if(o.target.closest("#fa-cf-export")&&i)return we(`Nakit akışı ${i.from} - ${i.to}`,[["Tarih","date"],["Tür",v=>v.kind==="forecast"?"Tahmin":"Gerçekleşen"],["Açıklama","description"],["Kategori","category"],["Cari",v=>v.party.name],["Cari kodu",v=>v.party.id||""],["ERP belge",v=>`${v.erpRef.docType} ${v.erpRef.docNo}`],["Giriş",v=>v.direction==="in"?v.amount:""],["Çıkış",v=>v.direction==="out"?v.amount:""],["Bakiye","balance"]],i.rows);const h=o.target.closest("tr[data-id]");if(h&&i){const v=i.rows.find(L=>L.id===h.dataset.id);if(((b=v==null?void 0:v.target)==null?void 0:b.route)==="cashflow")return p(v.target.params.planned);v!=null&&v.target&&Os(v.target)}}),r().then(()=>{t.planned&&s&&p(t.planned)}),e}W.register("login",Di,{requiresAuth:!1,title:"Giriş"});W.register("dashboard",tn,{requiresAuth:!0,title:"Ana Sayfa"});W.register("operations",hr,{requiresAuth:!0,title:"İşlemler"});W.register("transfer",sn,{requiresAuth:!0,title:"Depolar Arası Transfer"});W.register("vehicle-unload",nn,{requiresAuth:!0,title:"Araba'dan Boşaltma"});W.register("sales",ln,{requiresAuth:!0,title:"Satış İşlemleri"});W.register("purchase",dn,{requiresAuth:!0,title:"Alış İşlemleri"});W.register("purchase-module",bn,{requiresAuth:!0,title:"Satın Alma"});W.register("stock-detail",Xn,{requiresAuth:!0,title:"Stok Detay"});W.register("serial-detail",er,{requiresAuth:!0,title:"Seri Detay"});W.register("stock-count",tr,{requiresAuth:!0,title:"Stok Sayım"});W.register("reports",ar,{requiresAuth:!0,title:"Raporlar"});W.register("customer-balance",dr,{requiresAuth:!0,title:"Müşteri Bakiyeleri"});W.register("copilot",nr,{requiresAuth:!0,title:"AI CoPilot"});W.register("settings",rr,{requiresAuth:!0,title:"Ayarlar"});W.register("raw-materials",lr,{requiresAuth:!0,title:"Hammadde Takibi"});W.register("recipes",or,{requiresAuth:!0,title:"Ürün Reçeteleri"});W.register("production",cr,{requiresAuth:!0,title:"Üretim Girişi"});W.register("jobs",Qn,{requiresAuth:!0,title:"İş & Durum Takip"});W.register("help",pr,{requiresAuth:!0,title:"Yardım"});W.register("packing-list",ur,{requiresAuth:!0,title:"Çeki Listesi"});W.register("barcode",el,{requiresAuth:!0,title:"Barkod Oluştur"});W.register("finance",rl,{requiresAuth:!0,title:"Finans"});W.register("suppliers",ll,{requiresAuth:!0,title:"Tedarikçiler"});const Fs=(e,t)=>()=>{const a=document.createElement("div");a.className="page-finance page-container fin-wms-screen",a.appendChild(ce({title:t,gradientClass:"gradient-reports"}));const i=document.createElement("div");return i.className="page-content",i.appendChild(e()),a.appendChild(i),a};W.register("calendar",Fs(pl,"Finans Takvimi"),{requiresAuth:!0,title:"Finans Takvimi"});W.register("cashflow",Fs(ml,"Nakit Akışı"),{requiresAuth:!0,title:"Nakit Akışı"});W.register("activity",$r,{requiresAuth:!0,title:"Son İşlemler"});W.register("serial-warehouse-balance",mr,{requiresAuth:!0,title:"Seri Ambar Bakiye"});W.setLayout((e,t,a)=>a.requiresAuth?Ji(e,t):e);W.addGuard(async(e,t)=>t.requiresAuth&&!ke.isLoggedIn()?(W.navigate("login"),!1):e==="login"&&ke.isLoggedIn()||!hl(e)?(W.navigate("dashboard"),!1):!0);function hl(e){var i,s;if(e==="calendar"||e==="cashflow")return!!((i=z.modules.finance)!=null&&i.enabled)&&At("finance");const t=Object.values(z.modules).find(n=>n.route===e);return t&&t.enabled?!0:t&&!["stock-detail"].includes(e)?!1:["serial-warehouse-balance","serial-detail","packing-list","stock-detail","customer-balance","activity"].includes(e)?((s=z.modules.reports)==null?void 0:s.enabled)&&z.reportTypes.some(n=>n.route===e):!0}window.addEventListener("unhandledrejection",e=>{var a;const t=(a=e.reason)==null?void 0:a.message;t&&(e.preventDefault(),R(t,"error"))});async function vs(){await Ai(),C.baseUrl=C._getBaseUrl(),C.timeout=z.apiTimeout,localStorage.getItem(z.storageKeys.theme)==="dark"&&document.body.classList.add("dark-theme"),ke.checkSession(),ji({onUpdate:()=>W._handleRoute(),onNavigate:t=>{t!=="login"&&!ke.isLoggedIn()&&ze.update({user:{name:"Demo Kullanıcı"},isAuthenticated:!0}),t==="login"&&ze.update({user:null,isAuthenticated:!1}),W.getCurrentPath()===t?W._handleRoute():W.navigate(t)}}),xi(),ws(()=>W._handleRoute()),Ci(),W.init(),console.log(`${z.appName} başlatıldı (${z.slug})`)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",vs):vs();
