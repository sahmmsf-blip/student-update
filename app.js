const SB_URL="https://seoevtzbaiuyyfngygrs.supabase.co";
const SB_KEY="sb_publishable_NBPWcKdwQekQSvYMoSfk3g_1h9hPDuL";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const app=$("#app");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toEn=s=>String(s??"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).trim();
const digits=(s,n)=>toEn(s).replace(/\D/g,"").slice(0,n);
const isNid=v=>/^\d{10}$/.test(v), isPhone=v=>/^07\d{8}$/.test(v);
const initials=n=>(String(n||"?").trim()[0]||"?");
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}

let SET={school_name:"المدرسة",form_open:true,deadline:null,announcement:"",consent_text:""};
let staff=null; try{staff=JSON.parse(sessionStorage.getItem("st")||"null")}catch(e){}

async function rpc(fn,args){
  let r; try{ r=await fetch(`${SB_URL}/rest/v1/rpc/${fn}`,{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(args||{})}); }
  catch(e){ throw new Error("لا يوجد اتصال بالإنترنت"); }
  const j=await r.json().catch(()=>null);
  if(!r.ok){
    if(j&&/unauthorized/.test(j.message||"")){ logout(true); throw new Error("انتهت الجلسة، سجّل الدخول من جديد"); }
    if(j&&/password_change_required/.test(j.message||"")){ if(staff){staff.must_change=true; staffApp();} throw new Error("يلزم تغيير الرمز السري أولاً"); }
    if(j&&/forbidden/.test(j.message||"")) throw new Error("لا تملك صلاحية هذا الإجراء");
    throw new Error("تعذّر إتمام العملية، حاول مرة أخرى");
  }
  return j;
}
const ERR={not_found:"البيانات غير مطابقة. تأكد من الرقم الوطني وتاريخ الميلاد.",locked:"تم تجاوز عدد المحاولات. حاول لاحقاً.",already_submitted:"تم تحديث بيانات هذا الطالب مسبقاً.",consent_required:"يجب الموافقة على التعهد للمتابعة.",invalid:"تحقق من الحقول المدخلة.",closed:"باب تحديث البيانات مغلق حالياً.",weak:"الرمز السري يجب ألا يقل عن 8 أحرف (للرمز المؤقت من المسؤول 4 أحرف).",bad_nid:"الرقم الوطني يجب أن يتكون من 10 أرقام.",duplicate:"هذا الرقم الوطني مستخدم لمستخدم آخر.",not_submitted:"لا يمكن طلب تعديل قبل حفظ البيانات أولاً.",not_sibling:"هذا الطالب لا يشترك مع الطالب الأول في اسم الأب الثلاثي (اسم الأب والجد والعائلة)، فلا يمكن إضافته من هذا الدخول. إن كان أخاً له فتواصل مع المرشد التربوي في المدرسة لتصحيح الاسم، أو ادخل برقمه الوطني من الصفحة الرئيسية."};

function applySettings(){ $("#sch").textContent=SET.school_name||"تحديث بيانات الطلبة"; document.title=(SET.school_name||"")+" — تحديث بيانات الطلبة"; }
const ICON={
 id:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M15 9h3M15 13h3M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2"/></svg>',
 lock:'<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 bolt:'<svg class="i" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
 shield:'<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
 help:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/></svg>',
 arrow:'<svg class="i" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
 spark:'<svg class="i" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
 users:'<svg class="i" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.5 4.5 4.5"/></svg>',
 book:'<svg class="i" viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>'};
const MONTHS=["كانون الثاني","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول"];
function dateSel(id){ const y=new Date().getFullYear();
  return `<div class="dsel" id="${id}"><select class="inp" data-d="d" aria-label="اليوم"><option value="">اليوم</option>${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join("")}</select>
  <select class="inp" data-d="m" aria-label="الشهر"><option value="">الشهر</option>${MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("")}</select>
  <select class="inp" data-d="y" aria-label="السنة"><option value="">السنة</option>${Array.from({length:y-1939},(_,i)=>`<option>${y-i}</option>`).join("")}</select></div>`; }
function readDate(id){ const g=k=>document.querySelector(`#${id} [data-d=${k}]`).value; const d=g("d"),m=g("m"),y=g("y"); if(!d||!m||!y) return "";
  const iso=`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`; const t=new Date(iso+"T00:00:00Z"); return (t.getUTCDate()==+d&&t.getUTCMonth()+1==+m)?iso:""; }

function applySettings(){ $("#sch").textContent=SET.school_name||"تحديث بيانات الطلبة"; document.title=(SET.school_name||"")+" — تحديث بيانات الطلبة"; }
function chrome(role,{home=false,out=false}={}){ $("#role").textContent=role; $("#homeBtn").classList.toggle("hide",!home); $("#outBtn").classList.toggle("hide",!out); $("#navl").classList.toggle("hide",home||out); }
$("#homeBtn").onclick=()=>{kids=[];draft=null;adding=false;go()};
$("#outBtn").onclick=()=>logout();
function logout(silent){ if(staff){ const t=staff.token; rpc("staff_logout",{p_token:t}).catch(()=>{}); } staff=null; sessionStorage.removeItem("st"); clearTimeout(idleT); if(!silent) toast("تم تسجيل الخروج"); go(); }
let idleT; function armIdle(){ clearTimeout(idleT); if(staff) idleT=setTimeout(()=>{logout(true);toast("انتهت الجلسة لعدم النشاط")},30*60*1000); }
["click","keydown","touchstart"].forEach(e=>addEventListener(e,armIdle,{passive:true}));

function loadLib(src){ return new Promise((res,rej)=>{ if(document.querySelector(`script[data-lib="${src}"]`)) return res(); const sc=document.createElement("script"); sc.src=src; sc.dataset.lib=src; sc.onload=res; sc.onerror=()=>rej(new Error("تعذّر تحميل المكتبة")); document.head.appendChild(sc); }); }

async function go(){
  try{ SET=await rpc("get_public_settings"); }catch(e){}
  applySettings();
  if(staff){ armIdle(); return staffApp(); }
  chrome("بوابة أولياء الأمور");
  const closed=!SET.form_open||(SET.deadline&&SET.deadline<new Date().toISOString().slice(0,10));
  app.innerHTML=`
  <header class="ptitle"><span class="eyebrow">مديرية التربية والتعليم للواء وادي السير</span>
    <h1>بوابة <em>تحديث بيانات</em> الطلبة</h1>
    <p class="lead">حدّث بيانات التواصل الخاصة بك وبابنك أو أبنائك بإدخال واحد، لتصل إليك رسائل المدرسة وتتابع الطالب بشكل صحيح.</p></header>
  <div class="banner"><div class="note"><div class="note-ic">${ICON.users}</div><div class="note-tx">
    <b>تنبيه هام لأولياء الأمور</b>
    <p>لديكم أكثر من ابن في المدرسة؟ يكفي إدخال <u>الرقم الوطني لأحد الأبناء</u> وتاريخ ميلاده، ثم من داخل الصفحة اضغطوا <em>«إضافة طالب آخر»</em> لإضافة بقية أبنائكم وتحديث بياناتهم جميعاً بإدخال واحد، دون الحاجة إلى تسجيل دخول جديد.</p>
    <div class="note-steps"><span><i>1</i>أدخلوا رقم أحد الأبناء</span><span><i>2</i>اضغطوا «إضافة طالب آخر»</span><span><i>3</i>احفظوا مرة واحدة</span></div></div></div></div>
  <div class="banner"><div class="b"><div class="ic">${closed?ICON.lock:ICON.spark}</div><div><b>${closed?"باب تحديث البيانات مغلق حالياً":esc(SET.announcement||"حدّث بيانات التواصل لابنك مرة واحدة فقط")}</b><span>هذه البيانات تُجمع لأغراض العملية التعليمية والتواصل الرسمي بين المدرسة وولي الأمر فقط</span></div></div></div>
  <section class="hero2"><div class="txt">
    <div class="chips"><span>${ICON.bolt}دقيقتان فقط</span><span>${ICON.shield}بيانات محمية</span><span>${ICON.book}للأغراض التعليمية</span></div>
    <div class="credits"><div><span>المطوّر</span><b>أ. سهم العجارمة</b></div><div><span>مدير المدرسة</span><b>أ. ناجح المحاميد</b></div><div><span>المرشد التربوي</span><b>أ. إيهاب أبو دية</b></div></div></div>
   <div class="lcard" id="lc">${loginForm()}</div></section>
  <section class="wrap" id="how" style="max-width:1240px;padding:10px 18px 0"><div class="card"><h2>كيف تعمل؟</h2><div class="sub">ثلاث خطوات بسيطة</div>
    <div class="grid2" style="grid-template-columns:repeat(3,1fr)">
     <div class="kid" style="display:block"><b>١ — أدخل بيانات الطالب</b><div class="mt">الرقم الوطني للطالب وتاريخ ميلاده.</div></div>
     <div class="kid" style="display:block"><b>٢ — حدّث بيانات التواصل</b><div class="mt">اسمك ومهنتك وهاتفك، وشخص آخر للمتابعة.</div></div>
     <div class="kid" style="display:block"><b>٣ — أكّد وتعهّد</b><div class="mt">راجع البيانات ثم أكّد صحتها وسيتم حفظها.</div></div></div></div>
   <div class="card" id="privacy"><h2>الخصوصية والأمان</h2><div class="sub">تُحفظ بياناتك في قاعدة بيانات مشفّرة لدى المدرسة، ولا يطّلع عليها إلا المخوّلون من الإدارة والمرشد التربوي، ولا تُستخدم لأي غرض خارج العملية التعليمية.</div></div></section>
  <footer>مديرية التربية والتعليم للواء وادي السير · ${esc(SET.school_name)}<br>البيانات للاستخدام المدرسي والأغراض التعليمية فقط</footer>`;
  wireLogin();
}
let LG={nid:"",dob:""};
function loginForm(msg){
  return `<div class="lhead"><div class="ic">${ICON.id}</div><div><h2>تسجيل الدخول</h2><small>بالرقم الوطني للطالب وتاريخ ميلاده</small></div></div>
  <div class="field"><label for="nid">الرقم الوطني للطالب</label><input class="inp" id="nid" inputmode="numeric" autocomplete="off" dir="ltr" maxlength="10" placeholder="10 أرقام"><div class="hint"><span id="cn">0/10</span></div><div class="errt" id="e1"></div></div>
  <div class="field"><label>تاريخ ميلاد الطالب</label>${dateSel("dobS")}<div class="errt" id="e2"></div></div>
  <div id="lm">${msg||""}</div>
  <div class="actions" style="margin-top:18px"><button class="btn block" id="lg">دخول ${ICON.arrow}</button></div>
  <div class="help"><button type="button" id="hb">${ICON.help} لا أستطيع الدخول؟</button></div><div id="tipbox"></div>
  <div class="secure">${ICON.lock} اتصال مشفّر · البيانات محمية</div>`;
}
function wireLogin(){
  const n=$("#nid"); n.oninput=()=>{n.value=digits(n.value,10); $("#cn").textContent=n.value.length+"/10"};
  $("#lg").onclick=loginGo; n.onkeydown=e=>{if(e.key==="Enter")loginGo()};
  $("#hb").onclick=()=>{$("#tipbox").innerHTML=`<div class="tip">تأكد من كتابة الرقم الوطني للطالب (وليس ولي الأمر) واختيار تاريخ ميلاد الطالب كما في الهوية. إذا استمرت المشكلة تواصل مع المدرسة.</div>`};
}
async function loginGo(){
  const nid=digits($("#nid").value,10), dob=readDate("dobS"); let ok=true;
  $("#e1").textContent=isNid(nid)?"":(ok=false,"الرقم الوطني يجب أن يتكون من 10 أرقام");
  $("#e2").textContent=dob?"":(ok=false,"اختر تاريخ الميلاد كاملاً");
  if(!ok) return;
  const b=$("#lg"); b.disabled=true; b.textContent="جارٍ التحقق…";
  try{
    const r=await rpc("login_start",{p_nid:nid,p_dob:dob});
    if(r.error){ b.disabled=false; b.innerHTML="دخول "+ICON.arrow; return $("#lm").innerHTML=`<div class="alert err">${ERR[r.error]||"خطأ"}</div>`; }
    if(r.kind==="staff"){ LG={nid,dob}; return staffPin(); }
    kids=[{nid:r.nid,dob,name:r.name,birth_place:r.birth_place,grade:r.grade,section:r.section,nationality:r.nationality,status:r.data?r.data.status:"none",data:r.data,closed:r.closed,pending:!!r.pending,edit:false}];
    draft=(r.data&&r.data.status!=="submitted")?r.data:null; adding=false; parentPage();
  }catch(e){ b.disabled=false; b.innerHTML="دخول "+ICON.arrow; $("#lm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; }
}
function staffPin(){
  $("#lc").innerHTML=`<div class="lhead"><div class="ic">${ICON.lock}</div><div><h2>تحقق إضافي</h2><small>أدخل الرمز السري</small></div></div>
  <div class="field"><label for="pw">الرمز السري</label><input class="inp" id="pw" type="password" dir="ltr" autocomplete="current-password"></div>
  <div id="lm"></div><div class="actions" style="margin-top:18px"><button class="btn block" id="lg">متابعة ${ICON.arrow}</button></div>
  <div class="help"><button type="button" id="bk">رجوع</button></div><div class="secure">${ICON.lock} اتصال مشفّر · البيانات محمية</div>`;
  $("#pw").focus(); $("#bk").onclick=()=>{LG={nid:"",dob:""};go()};
  const run=async()=>{ const b=$("#lg"); b.disabled=true;
    try{ const r=await rpc("staff_login2",{p_nid:LG.nid,p_dob:LG.dob,p_pass:$("#pw").value}); LG={nid:"",dob:""};
      if(r.error){ b.disabled=false; return $("#lm").innerHTML=`<div class="alert err">${ERR[r.error]||"خطأ"}</div>`; }
      staff=r; sessionStorage.setItem("st",JSON.stringify(r)); go(); }
    catch(e){ b.disabled=false; $("#lm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
  $("#lg").onclick=run; $("#pw").onkeydown=e=>{if(e.key==="Enter")run()};
}

/* =================== ولي الأمر =================== */
let kids=[], draft=null, adding=false, lastTime=null;   // kids: {nid,dob,name,birth_place,grade,section,nationality,status,data,closed,pending,edit,last}
const eligible=()=>kids.filter(k=>k.edit||(k.status!=="submitted"&&!k.closed));
function parentStart(){ kids=[]; draft=null; adding=false; parentPage(); }
function roField(l,v){ return `<div class="field"><label>${l}</label><input class="inp" value="${esc(v||"—")}" disabled tabindex="-1"></div>`; }
function kidCard(k,i){
  let st, act="";
  if(k.edit){ st='<span class="pill p-re">طلب تعديل — يحتاج موافقة المرشد</span>'; act=`<button class="btn sm sec" data-ce="${i}">إلغاء التعديل</button>`; }
  else if(k.status==="submitted"){ st=k.pending?'<span class="pill p-re">طلب تعديل بانتظار الموافقة</span>':'<span class="pill p-ok">تم التحديث</span>'; act=`<button class="btn sm warn" data-ed="${i}">${k.pending?"طلب تعديل جديد":"طلب تعديل"}</button>`; }
  else if(k.status==="reopened") st='<span class="pill p-re">أُعيد فتحه للتعديل</span>';
  else st='<span class="pill p-info">بيانات الطالب</span>';
  const canBp=k.edit||k.status!=="submitted";
  return `<div class="card ro"><div class="ro-t"><div class="av" style="width:36px;height:36px;border-radius:10px">${esc(initials(k.name))}</div>${esc(k.name)}${st}${act}<button class="btn sm sec" data-rm="${i}" title="إزالة الطالب" aria-label="إزالة">✕</button></div>
   <div class="grid2">${roField("الرقم الوطني",k.nid)}${roField("تاريخ الميلاد",k.dob)}<div class="field"><label>مكان الولادة <b style="color:var(--bad)">*</b></label><input class="inp edit" data-bp="${i}" value="${esc(k.birth_place||"")}" placeholder="مثال: عمّان، إربد، الزرقاء…" maxlength="60" ${canBp?"":"disabled"}><div class="errt" id="ebp${i}"></div></div>${roField("الجنسية",k.nationality)}${roField("الصف",k.grade)}${roField("الشعبة",k.section)}</div></div>`;
}
function lookupCard(){
  return `<div class="card"><h2>${kids.length?"إضافة طالب آخر":"أدخل بيانات الطالب"}</h2>
   <div class="sub">${kids.length?"ستبقى البيانات التي أدخلتها كما هي. يُشترط أن يشترك الطالب مع الطالب الأول في اسم الأب الثلاثي (اسم الأب والجد والعائلة).":"أدخل الرقم الوطني وتاريخ الميلاد لعرض بيانات الطالب."}</div>
   <div class="grid2"><div class="field"><label>الرقم الوطني للطالب</label><input class="inp" id="nid" inputmode="numeric" autocomplete="off" dir="ltr" maxlength="10" placeholder="10 أرقام"><div class="errt" id="e1"></div></div>
   <div class="field"><label>تاريخ ميلاد الطالب</label>${dateSel("dobK")}<div class="errt" id="e2"></div></div></div>
   <div id="lm"></div><div class="actions"><button class="btn" id="add">${kids.length?"إضافة الطالب":"بحث"}</button>${kids.length?'<button class="btn sec" id="cancelAdd">إلغاء</button>':""}</div></div>`;
}
function parentPage(msg){
  chrome("بوابة أولياء الأمور",{home:true});
  const el=eligible(), showLookup=!kids.length||adding, closedWarn=kids.some(k=>k.closed&&k.status!=="submitted"&&!k.edit), allEdit=el.length>0&&el.every(k=>k.edit);
  app.innerHTML=`<div class="wrap" style="padding-top:18px">
   ${closedWarn?'<div class="alert warn">باب تحديث البيانات مغلق حالياً.</div>':""}
   ${kids.map(kidCard).join("")}
   ${showLookup?lookupCard():""}
   ${el.length&&!showLookup?`<div class="card"><h2>${allEdit?"طلب تعديل بيانات التواصل":"بيانات التواصل"}</h2><div class="sub">${el.length>1?`سيتم تطبيق هذه البيانات على ${el.length} طلبة.`:"أدخل البيانات التالية بدقة."}</div>
     ${el.some(k=>k.edit)?'<div class="notice"><span>ℹ️</span><span>التعديل يُرسل كطلب إلى المرشد التربوي، ولا تُعتمد البيانات الجديدة في سجلات المدرسة إلا بعد موافقته. وقد يتصل بالرقم القديم أو الجديد للتأكد.</span></div>':""}
     <div id="fm">${formBody(draft)}</div><div id="m">${msg?`<div class="alert err">${msg}</div>`:""}</div>
     <div class="actions"><button class="btn" id="sv">${allEdit?"📨 إرسال طلب التعديل":"💾 حفظ"}</button><button class="btn sec" id="addk">＋ إضافة طالب آخر</button></div></div>`:""}
   ${!el.length&&kids.length&&!showLookup?`<div class="card"><div class="alert ok">بيانات الطلبة المضافين محدَّثة. لتعديلها اضغط «طلب تعديل» في بطاقة الطالب، وسيصل الطلب للمرشد التربوي للموافقة عليه.</div><div class="actions"><button class="btn" id="addk">＋ إضافة طالب آخر</button></div></div>`:""}
   </div>`;
  $$("[data-rm]").forEach(b=>b.onclick=()=>{ if($("#fm")) draft=readForm(app); kids.splice(+b.dataset.rm,1); parentPage(); });
  $$("[data-bp]").forEach(inp=>inp.oninput=()=>{kids[+inp.dataset.bp].birth_place=inp.value; const e=$("#ebp"+inp.dataset.bp); if(e) e.textContent=""});
  $$("[data-ed]").forEach(b=>b.onclick=()=>{ const k=kids[+b.dataset.ed]; k.edit=true; if($("#fm")) draft=readForm(app); else if(!draft&&k.data) draft={...k.data}; parentPage(); });
  $$("[data-ce]").forEach(b=>b.onclick=()=>{ if($("#fm")) draft=readForm(app); kids[+b.dataset.ce].edit=false; parentPage(); });
  if(showLookup){ $("#nid").oninput=e=>{e.target.value=digits(e.target.value,10)}; $("#add").onclick=addKid; $("#nid").onkeydown=e=>{if(e.key==="Enter")addKid()};
    if($("#cancelAdd")) $("#cancelAdd").onclick=()=>{adding=false;parentPage()}; }
  if($("#fm")){ wireForm(app); }
  if($("#addk")) $("#addk").onclick=()=>{ if($("#fm")) draft=readForm(app); adding=true; parentPage(); setTimeout(()=>$("#nid")&&$("#nid").scrollIntoView({behavior:"smooth",block:"center"}),50); };
  if($("#sv")) $("#sv").onclick=()=>{ const p=readForm(app); draft=p; let okBp=true; kids.forEach((k,i)=>{ if(el.includes(k)&&String(k.birth_place||"").trim().length<2){ okBp=false; const e=$("#ebp"+i); if(e) e.textContent="أدخل مكان ولادة الطالب"; } });
    if(!validateForm(app,p)||!okBp) return $("#m").innerHTML='<div class="alert err">يرجى تصحيح الحقول المظلّلة بالأحمر، ومكان ولادة كل طالب</div>'; confirmSave(p); };
}
async function addKid(){
  const nid=digits($("#nid").value,10), dob=readDate("dobK"); let ok=true;
  $("#e1").textContent=isNid(nid)?"":(ok=false,"الرقم الوطني يجب أن يتكون من 10 أرقام");
  $("#e2").textContent=dob?"":(ok=false,"اختر تاريخ الميلاد كاملاً");
  if(!ok) return;
  if(kids.some(k=>k.nid===nid)) return $("#lm").innerHTML='<div class="alert warn">هذا الطالب مضاف مسبقاً.</div>';
  const btn=$("#add"), label=btn.textContent; btn.disabled=true; btn.textContent="جارٍ التحقق…";
  try{
    const ref=kids[0];
    const r=ref?await rpc("parent_sibling",{p_nid:nid,p_dob:dob,p_ref_nid:ref.nid,p_ref_dob:ref.dob}):await rpc("parent_lookup",{p_nid:nid,p_dob:dob});
    if(r.error){ btn.disabled=false; btn.textContent=label; return $("#lm").innerHTML=`<div class="alert err">${ERR[r.error]||"خطأ"}</div>`; }
    kids.push({nid,dob,name:r.name,birth_place:r.birth_place,grade:r.grade,section:r.section,nationality:r.nationality,status:r.data?r.data.status:"none",data:r.data,closed:r.closed,pending:!!r.pending,edit:false});
    if(!draft&&r.data&&r.data.status!=="submitted") draft=r.data;
    adding=false; parentPage();
  }catch(e){ btn.disabled=false; btn.textContent=label; $("#lm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; }
}
const RELS=["أب","أم","أخ","أخت","عم","عمة","خال","خالة","جد","جدة","أخرى"];
function relField(id,label,v){
  const known=RELS.includes(v), val=v||"";
  return `<div class="field"><label>${label}</label><select class="inp" id="${id}">
   <option value="">اختر…</option>${RELS.map(r=>`<option ${(known&&r===val)||(!known&&val&&r==="أخرى")?"selected":""}>${r}</option>`).join("")}</select>
   <input class="inp ${(!known&&val)?"":"hide"}" id="${id}_o" placeholder="اكتب صلة القرابة" value="${(!known&&val)?esc(val):""}" style="margin-top:8px"><div class="errt" id="e_${id}"></div></div>`;
}
function phoneField(id,label,v,ag,wa){
  return `<div class="field"><label>${label}</label><input class="inp" id="${id}" inputmode="numeric" dir="ltr" maxlength="10" placeholder="07XXXXXXXX" value="${esc(v||"")}">
   <div class="hint">رقم أردني يبدأ بـ 07 ويتكون من 10 أرقام</div><div class="errt" id="e_${id}"></div>
   <label class="chk wa"><input type="checkbox" id="${id}_wa" ${wa?"checked":""}><span><b>واتساب</b> — استخدام هذا الرقم لمجموعات الواتساب</span></label>
   <label class="chk aj"><input type="checkbox" id="${id}_ag" ${ag?"checked":""}><span><b>أجيال OTP</b> — استخدام هذا الرقم لاستقبال رسائل كود الدخول (OTP) على منصة أجيال</span></label></div>`;
}
function nameField(id,label,v){ return `<div class="field"><label>${label}</label><input class="inp" id="${id}" value="${esc(v||"")}" placeholder="الاسم الثلاثي على الأقل"><div class="errt" id="e_${id}"></div></div>`; }
function formBody(d){ d=d||{}; return `
 <div class="sec-t" style="margin-top:6px"><i>👤</i>ولي الأمر الأول</div>
 ${nameField("gn","اسم ولي الأمر الأول",d.guardian_name)}
 <div class="grid2">${relField("gr","صلة القرابة",d.guardian_relation)}
  <div class="field"><label>مهنة ولي الأمر</label><input class="inp" id="go" value="${esc(d.guardian_occupation||"")}" placeholder="موظف، معلم، أعمال حرة، متقاعد…"><div class="errt" id="e_go"></div></div></div>
 ${phoneField("gp","رقم هاتف ولي الأمر الأول",d.guardian_phone,d.guardian_phone_agyal,d.guardian_phone_whatsapp)}
 <div class="sec-t"><i>👥</i>ولي الأمر الثاني <span class="s" style="font-weight:400">(في حال غياب ولي الأمر الأول — لمتابعة الطالب في المدرسة)</span></div>
 ${nameField("sn","اسم ولي الأمر الثاني",d.school_contact_name)}
 ${relField("sr","صلة القرابة",d.school_contact_relation)}
 ${phoneField("sp","رقم هاتف ولي الأمر الثاني",d.school_contact_phone,d.school_contact_agyal,d.school_contact_whatsapp)}`; }
function wireForm(root){
  ["gp","sp"].forEach(id=>{const e=root.querySelector("#"+id); e.oninput=()=>{e.value=digits(e.value,10)}});
  ["gr","sr"].forEach(id=>{const s=root.querySelector("#"+id); s.onchange=()=>root.querySelector("#"+id+"_o").classList.toggle("hide",s.value!=="أخرى")});
}
function readForm(root){
  const rel=id=>{const v=root.querySelector("#"+id).value; return v==="أخرى"?root.querySelector("#"+id+"_o").value.trim():v;};
  return {guardian_name:root.querySelector("#gn").value.trim(),guardian_relation:rel("gr"),guardian_occupation:root.querySelector("#go").value.trim(),guardian_phone:digits(root.querySelector("#gp").value,10),guardian_phone_agyal:root.querySelector("#gp_ag").checked,guardian_phone_whatsapp:root.querySelector("#gp_wa").checked,
    school_contact_name:root.querySelector("#sn").value.trim(),school_contact_relation:rel("sr"),school_contact_phone:digits(root.querySelector("#sp").value,10),school_contact_agyal:root.querySelector("#sp_ag").checked,school_contact_whatsapp:root.querySelector("#sp_wa").checked};
}
function validateForm(root,p){
  const set=(id,m)=>{const e=root.querySelector("#e_"+id); if(e)e.textContent=m||""; const i=root.querySelector("#"+id); if(i)i.classList.toggle("bad",!!m)};
  let ok=true; const chk=(id,c,m)=>{set(id,c?"":m); if(!c)ok=false};
  const full=s=>s.split(/\s+/).filter(Boolean).length>=2&&s.length>=5;
  chk("gn",full(p.guardian_name),"أدخل الاسم الكامل (كلمتان على الأقل)");
  chk("gr",p.guardian_relation.length>=2,"اختر صلة القرابة");
  chk("go",p.guardian_occupation.length>=2,"أدخل مهنة ولي الأمر");
  chk("gp",isPhone(p.guardian_phone),"الرقم يجب أن يبدأ بـ 07 ويتكون من 10 أرقام");
  chk("sn",full(p.school_contact_name),"أدخل الاسم الكامل (كلمتان على الأقل)");
  chk("sr",p.school_contact_relation.length>=2,"اختر صلة القرابة");
  chk("sp",isPhone(p.school_contact_phone),"الرقم يجب أن يبدأ بـ 07 ويتكون من 10 أرقام");
  return ok;
}
function confirmSave(p){
  const el=eligible();
  const w=modal(`<h2>تأكيد ${el.every(k=>k.edit)?"إرسال طلب التعديل":"حفظ البيانات"}</h2>
   <div class="sub">سيتم ${el.every(k=>k.edit)?"إرسال طلب التعديل":"حفظ بيانات التواصل"} لـ ${el.length>1?"الطلبة":"الطالب"}:</div>
   ${el.map(k=>`<div class="kid"><div class="av">${esc(initials(k.name))}</div><div><div class="nm">${esc(k.name)}</div><div class="mt">${esc([k.grade,k.section&&("شعبة "+k.section)].filter(Boolean).join(" · "))}</div></div>${k.edit?'<div class="x"><span class="pill p-re">طلب تعديل</span></div>':""}</div>`).join("")}
   <div class="pledge"><b>تعهّد والتزام</b><br>${esc(SET.consent_text||"أتعهد بأنني المسؤول عن صحة جميع البيانات المدخلة، وأوافق على اعتمادها في سجلات المدرسة واستخدامها لأغراض العملية التعليمية والتواصل الرسمي.")}</div>
   <label class="chk consent"><input type="checkbox" id="pc"><span>أقرّ بأنني اطلعت على البيانات وأتعهد بصحتها وأتحمل المسؤولية عنها.</span></label>
   <div id="pm"></div><div class="actions"><button class="btn" id="py" disabled>✔ تأكيد</button><button class="btn sec" id="pn">رجوع للتعديل</button></div>`);
  w.querySelector("#pc").onchange=e=>{w.querySelector("#py").disabled=!e.target.checked};
  w.querySelector("#pn").onclick=()=>w.remove();
  w.querySelector("#py").onclick=async()=>{
    const b=w.querySelector("#py"); b.disabled=true; b.textContent="جارٍ الإرسال…"; w.querySelector("#pm").innerHTML="";
    const fails=[];
    for(const k of el){
      try{
        const isEdit=k.status==="submitted", body={...p,consent:true,birth_place:String(k.birth_place||"").trim()};
        const r=await rpc(isEdit?"parent_request_edit":"parent_submit",{p_nid:k.nid,p_dob:k.dob,p:body});
        if(r.error) fails.push(`${k.name}: ${ERR[r.error]||r.error}`);
        else if(isEdit){ k.pending=true; k.edit=false; k.last="edit"; k.sent=body; }
        else { k.status="submitted"; k.data={...body,status:"submitted"}; k.edit=false; k.last="save"; k.sent=body; }
      }catch(e){ fails.push(`${k.name}: ${e.message}`); } }
    if(fails.length){ b.disabled=false; b.textContent="✔ تأكيد"; w.querySelector("#pm").innerHTML=`<div class="alert err">${fails.map(esc).join("<br>")}</div>`; }
    else { w.remove(); lastTime=new Date(); parentDone(); }
  };
}
function printEl(cls){ document.body.classList.add(cls); const done=()=>{document.body.classList.remove(cls); window.removeEventListener("afterprint",done)}; window.addEventListener("afterprint",done); setTimeout(()=>window.print(),50); }
function parentDone(){
  draft=null;
  const sent=kids.filter(k=>k.last), anyEdit=sent.some(k=>k.last==="edit"), when=lastTime||new Date();
  const dt=when.toLocaleString("ar-JO",{dateStyle:"full",timeStyle:"short"});
  const row=(l,v)=>`<tr><th>${l}</th><td>${esc(v||"—")}</td></tr>`;
  const flags=(wa,ag)=>[wa?"واتساب":"",ag?"OTP أجيال":""].filter(Boolean).join(" + ")||"—";
  const body=sent.length?sent[sent.length-1].sent:null;
  app.innerHTML=`<div class="wrap" style="padding-top:18px"><div class="card success noprint"><div class="big">✓</div><h2>${anyEdit&&!sent.some(k=>k.last==="save")?"تم إرسال طلب التعديل":"تم حفظ البيانات بنجاح"}</h2>
  <div class="sub">${anyEdit?"سيصل طلب التعديل إلى المرشد التربوي، وتظهر البيانات الجديدة بعد موافقته. ":""}يمكنكم طباعة الإيصال أو تصويره كإثبات.</div></div>
  <div class="card receipt" id="receipt">
   <div class="rc-head"><img src="img/moe.jpg" alt=""><div class="rc-t">المملكة الأردنية الهاشمية<br><b>وزارة التربية والتعليم</b><br>مديرية التربية والتعليم للواء وادي السير<br><b>${esc(SET.school_name)}</b></div><img src="img/school.jpg" alt=""></div>
   <h2 style="text-align:center;margin:12px 0 2px">إيصال ${anyEdit&&!sent.some(k=>k.last==="save")?"طلب تعديل":"تحديث"} بيانات الطلبة</h2>
   <div class="s" style="text-align:center;margin-bottom:12px">${esc(dt)}</div>
   ${sent.map(k=>`<div class="rc-kid"><b>${esc(k.name)}</b><div class="rc-line"><span>الرقم الوطني: <i dir="ltr">${esc(k.nid)}</i></span><span>الصف: ${esc([k.grade,k.section].filter(Boolean).join(" - "))}</span><span>مكان الولادة: ${esc(k.birth_place||"—")}</span></div><div class="rc-st ${k.last==="edit"?"w":""}">${k.last==="edit"?"طلب تعديل بانتظار موافقة المرشد":"تم الحفظ"}</div></div>`).join("")}
   ${body?`<table class="rc kv" style="margin-top:12px"><tbody>
    <tr><th colspan="2" class="sec">ولي الأمر الأول</th></tr>${row("الاسم",body.guardian_name)}${row("صلة القرابة",body.guardian_relation)}${row("المهنة",body.guardian_occupation)}${row("الهاتف",body.guardian_phone)}${row("استخدام الرقم",flags(body.guardian_phone_whatsapp,body.guardian_phone_agyal))}
    <tr><th colspan="2" class="sec">ولي الأمر الثاني</th></tr>${row("الاسم",body.school_contact_name)}${row("صلة القرابة",body.school_contact_relation)}${row("الهاتف",body.school_contact_phone)}${row("استخدام الرقم",flags(body.school_contact_whatsapp,body.school_contact_agyal))}</tbody></table>`:""}
   <p class="s" style="margin-top:12px;text-align:center">أقرّ ولي الأمر بصحة البيانات أعلاه وتحمّله مسؤوليتها. هذا الإيصال لا يحتاج إلى ختم.${anyEdit?" طلبات التعديل تُعتمد بعد موافقة المرشد التربوي.":""}</p>
  </div>
  <div class="actions noprint" style="justify-content:center"><button class="btn" id="prt">🖨 طباعة الإيصال</button><button class="btn sec" id="add2">＋ إضافة طالب آخر</button><button class="btn sec" id="fin">إنهاء</button></div></div>`;
  $("#prt").onclick=()=>printEl("pr-receipt"); $("#add2").onclick=()=>{adding=true;parentPage()}; $("#fin").onclick=()=>{kids=[];draft=null;adding=false;go()};
}

/* =================== الإدارة (الدخول موحّد من النموذج الرئيسي) =================== */
let ALL=[], REQ=[], TAB="overview", F={q:"",status:"",grade:"",section:"",nat:"",ag:"",wa:""}, LIM=100;
const isAdmin=()=>staff&&staff.role==="admin";
const isMgr=()=>staff&&(staff.role==="admin"||staff.role==="counselor");
const isTeacher=()=>staff&&staff.role==="teacher";
const ROLE_L={admin:"المطوّر",counselor:"المرشد التربوي",teacher:"مربي الصف"};
const stOf=x=>!x.g?"no":(x.g.status==="reopened"?"re":"ok");
const STL={ok:"محدَّث",no:"لم يحدّث",re:"أُعيد فتحه"};
const shortSec=s=>String(s||"بدون شعبة").replace("مسار أكاديمي","أكاديمي").replace("علوم وتكنولوجيا وهندسة","علوم وهندسة").replace("لغات وعلوم إنسانية واجتماعية","لغات وإنسانية");
const GORDER=["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];
const gIdx=g=>{let i=GORDER.indexOf(g); if(i<0) i=GORDER.findIndex(x=>g&&g.includes(x)); return i<0?99:i};

/* مطابقة الأخوة (نفس منطق قاعدة البيانات) */
const nrm=s=>String(s||"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/\s/g,"");
const restName=n=>{const t=String(n||"").trim().split(/\s+/); return t.length<2?"":nrm(t.slice(1).join(" "))};
function sameFamily(a,b){ const ra=restName(a), rb=restName(b); if(!ra||!rb) return false; if(ra===rb) return true; return Math.min(ra.length,rb.length)>=9&&(ra.endsWith(rb)||rb.endsWith(ra)); }

async function staffApp(){
  const role=isTeacher()?`مربي الصف · ${staff.grade||""} ${shortSec(staff.section)}`:ROLE_L[staff.role];
  chrome(`${role} · ${staff.name}`,{out:true});
  if(staff.must_change) return forcePw();
  app.innerHTML='<div class="empty">جارٍ تحميل البيانات…</div>';
  try{ ALL=await rpc("staff_list",{p_token:staff.token}); if(isMgr()) REQ=await rpc("staff_requests_list",{p_token:staff.token}); else REQ=[]; }catch(e){ return; }
  renderShell();
}
async function reload(){ ALL=await rpc("staff_list",{p_token:staff.token}); if(isMgr()) REQ=await rpc("staff_requests_list",{p_token:staff.token}); renderShell(); }
function forcePw(){
  app.innerHTML='<div class="empty">يلزم اختيار رمز سري خاص بك قبل المتابعة…</div>';
  const w=modal(`<h2>اختيار رمز سري جديد</h2><div class="sub">لأمان بيانات الطلبة، اختر رمزاً سرياً خاصاً بك قبل المتابعة (8 أحرف أو أرقام على الأقل، ولا يُقبل الرمز المؤقت).</div>
   <div class="field"><label>الرمز السري الجديد</label><input class="inp" id="np" type="password" dir="ltr" autocomplete="new-password"></div>
   <div class="field"><label>تأكيد الرمز</label><input class="inp" id="np2" type="password" dir="ltr" autocomplete="new-password"></div><div id="mm"></div>
   <div class="actions"><button class="btn" id="s3">حفظ ومتابعة</button><button class="btn sec" id="c3">خروج</button></div>`,{lock:true});
  w.querySelector("#c3").onclick=()=>{w.remove();logout()};
  const run=async()=>{ const a=w.querySelector("#np").value, b=w.querySelector("#np2").value;
    if(a!==b) return w.querySelector("#mm").innerHTML='<div class="alert err">الرمزان غير متطابقين</div>';
    try{ const r=await rpc("staff_change_password",{p_token:staff.token,p_new:a});
      if(r.error) return w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]}</div>`;
      staff.must_change=false; sessionStorage.setItem("st",JSON.stringify(staff)); w.remove(); toast("تم حفظ الرمز السري"); staffApp(); }
    catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
  w.querySelector("#s3").onclick=run; w.querySelector("#np2").onkeydown=e=>{if(e.key==="Enter")run()};
}
function tabsFor(){
  const t=[["overview","📊","نظرة عامة"],["students","🎓","الطلبة"]];
  if(isMgr()) t.push(["requests","📨","طلبات التعديل"],["quality","🔍","جودة البيانات"],["share","🔗","الرابط وQR"]);
  if(isAdmin()) t.push(["settings","⚙️","الإعدادات"],["users","👥","المستخدمون"],["audit","🧾","السجل"]);
  return t;
}
function renderShell(){
  const tabs=tabsFor(); if(!tabs.some(t=>t[0]===TAB)) TAB="overview";
  const pend=REQ.filter(r=>r.status==="pending").length;
  app.innerHTML=`<div class="shell"><nav class="side">${tabs.map(t=>`<button class="nav ${TAB===t[0]?"on":""}" data-t="${t[0]}"><span class="e">${t[1]}</span><span>${t[2]}</span>${t[0]==="requests"&&pend?`<span class="bdg">${pend}</span>`:""}</button>`).join("")}
   <button class="nav" id="pwb"><span class="e">🔑</span><span>كلمتي</span></button></nav><section class="main" id="main"></section></div>`;
  $$("[data-t]").forEach(b=>b.onclick=()=>{TAB=b.dataset.t;renderShell()}); $("#pwb").onclick=changePw;
  ({overview,students,requests,quality,share,settings,users,audit})[TAB]();
}
function group(list,fn){ const m=new Map(); list.forEach(x=>{const k=fn(x)||"غير محدد"; const o=m.get(k)||{k,t:0,d:0}; o.t++; if(x.g&&x.g.status==="submitted")o.d++; m.set(k,o)}); return [...m.values()].sort((a,b)=>b.t-a.t); }
function hbars(rows){ return rows.map(r=>{const p=r.t?Math.round(r.d*100/r.t):0; return `<div class="hb"><div class="t"><span>${esc(r.k)}</span><span>${r.d} / ${r.t} · ${p}%</span></div><div class="tr"><i style="width:${p}%"></i></div></div>`}).join("")||'<div class="empty">لا بيانات</div>'; }
function lastBackup(){ try{ return localStorage.getItem("lastBackup"); }catch(e){ return null; } }

function overview(){
  const tot=ALL.length, done=ALL.filter(x=>stOf(x)==="ok").length, re=ALL.filter(x=>stOf(x)==="re").length, no=tot-done-re;
  const pct=tot?Math.round(done*100/tot):0, ag=ALL.filter(x=>x.g&&(x.g.guardian_phone_agyal||x.g.school_contact_agyal)).length, wa=ALL.filter(x=>x.g&&(x.g.guardian_phone_whatsapp||x.g.school_contact_whatsapp)).length;
  const C=2*Math.PI*52, dd=C*done/(tot||1), rr=C*re/(tot||1);
  const days=[]; for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*864e5).toISOString().slice(0,10); days.push({d,n:0})}
  ALL.forEach(x=>{ if(x.g&&x.g.status==="submitted"){const d=(x.g.updated_at||"").slice(0,10); const o=days.find(a=>a.d===d); if(o)o.n++;} });
  const mx=Math.max(1,...days.map(d=>d.n));
  const pendN=REQ.filter(r=>r.status==="pending").length, lb=lastBackup(), lbDays=lb?Math.floor((Date.now()-new Date(lb).getTime())/864e5):null;
  const alerts=(isMgr()&&pendN?`<div class="alert warn alrow"><span>📨 لديك <b>${pendN}</b> طلب تعديل بانتظار الموافقة</span><button class="btn sm" id="goreq">مراجعة الطلبات</button></div>`:"")
    +(isAdmin()&&(lbDays===null||lbDays>=7)?`<div class="alert info alrow"><span>💾 ${lb?`آخر نسخة احتياطية قبل ${lbDays} يوماً — يُنصح بنسخة أسبوعية`:"لم تحفظ نسخة احتياطية بعد — يُنصح بنسخة أسبوعية"}</span><button class="btn sm" id="bkNow">حفظ نسخة احتياطية الآن</button></div>`:"");
  const todo=ALL.filter(x=>stOf(x)!=="ok");
  $("#main").innerHTML=`<h1>${isTeacher()?`شعبتي: ${esc(staff.grade||"")} ${esc(shortSec(staff.section))}`:"نظرة عامة"}</h1><div class="lead">متابعة تحديث بيانات أولياء الأمور لحظة بلحظة</div>
  ${alerts}<div id="lockbox"></div>
  <div class="kpis"><div class="kpi"><div class="l">إجمالي الطلبة</div><div class="v">${tot}</div></div>
   <div class="kpi"><div class="l">تم التحديث</div><div class="v" style="color:var(--ok)">${done}</div><div class="d">${pct}% من الطلبة</div></div>
   <div class="kpi"><div class="l">لم يحدّثوا بعد</div><div class="v" style="color:var(--bad)">${no}</div></div>
   <div class="kpi"><div class="l">أرقام OTP أجيال</div><div class="v">${ag}</div><div class="d">${wa} طالباً أرقامهم لمجموعات الواتساب${re?` · ${re} أُعيد فتحها`:""}</div></div></div>
  <div class="cols"><div class="card"><h2>نسبة الإنجاز</h2><div class="donut">
    <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface2)" stroke-width="14"/>
     <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ok)" stroke-width="14" stroke-dasharray="${dd} ${C}" transform="rotate(-90 60 60)" stroke-linecap="round"/>
     <circle cx="60" cy="60" r="52" fill="none" stroke="var(--warn)" stroke-width="14" stroke-dasharray="${rr} ${C}" stroke-dashoffset="${-dd}" transform="rotate(-90 60 60)"/>
     <text x="60" y="68" text-anchor="middle" font-size="24" font-weight="800" fill="currentColor">${pct}%</text></svg>
    <div class="lg"><div><i style="background:var(--ok)"></i>محدَّث: ${done}</div><div><i style="background:var(--warn)"></i>أُعيد فتحه: ${re}</div><div><i style="background:var(--surface2);border:1px solid var(--line)"></i>لم يحدّث: ${no}</div></div></div></div>
   <div class="card"><h2>التحديثات خلال 14 يوماً</h2><div class="spark" style="margin-top:22px">${days.map(d=>`<div style="height:${Math.max(3,d.n*100/mx)}%">${d.n?`<span>${d.n}</span>`:""}</div>`).join("")}</div>
    <div class="axis">${days.map(d=>`<span>${d.d.slice(8)}</span>`).join("")}</div></div></div>
  ${isTeacher()?`<div class="card"><h2>الطلبة الذين لم يحدّثوا بياناتهم (${todo.length})</h2>${todo.length?todo.map(x=>`<div class="kid" style="margin-top:6px"><div class="av">${esc(initials(x.full_name))}</div><div><div class="nm">${esc(x.full_name)}</div><div class="mt" dir="ltr" style="text-align:right">${esc(x.national_id)}</div></div></div>`).join(""):'<div class="alert ok">جميع طلاب شعبتك حدّثوا بياناتهم ✅</div>'}</div>`
   :`<div class="cols"><div class="card"><h2>حسب الصف</h2>${hbars(group(ALL,x=>x.grade).sort((a,b)=>gIdx(a.k)-gIdx(b.k)))}</div>
   <div class="card"><h2>حسب الجنسية</h2>${hbars(group(ALL,x=>x.nationality))}</div></div>
   <div class="card"><h2>حسب الشعبة</h2>${hbars(group(ALL,x=>(x.grade||"—")+" — "+shortSec(x.section)).sort((a,b)=>gIdx(a.k.split(" — ")[0])-gIdx(b.k.split(" — ")[0])||a.k.localeCompare(b.k,"ar")))}</div>`}`;
  if($("#goreq")) $("#goreq").onclick=()=>{TAB="requests";renderShell()};
  if($("#bkNow")) $("#bkNow").onclick=backupAll;
  if(isMgr()) loadLocked();
}
async function loadLocked(){
  let r; try{ r=await rpc("staff_locked",{p_token:staff.token}); }catch(e){ return; }
  const box=$("#lockbox"); if(!box||(!r.nids.length&&!r.ips.length)) return;
  box.innerHTML=`<div class="card"><h2>🔒 محاولات دخول فاشلة</h2><div class="sub">عند تجاوز الحد يُقفل الدخول مؤقتاً. يمكنك فك القفل لولي أمر لم يستطع الدخول.</div>
   ${r.nids.map(n=>`<div class="kid"><div class="av">${esc(initials(n.name||"؟"))}</div><div><div class="nm">${esc(n.name||"رقم غير مسجّل")}</div><div class="mt" dir="ltr" style="text-align:right">${esc(n.nid)} · ${n.fails} محاولة</div></div><div class="x">${n.locked?'<span class="pill p-re">مقفل</span> ':""}<button class="btn sm" data-un="${esc(n.nid)}">فك القفل</button></div></div>`).join("")}
   ${r.ips.map(i=>`<div class="kid"><div class="av">IP</div><div><div class="nm">جهاز / عنوان مقفل</div><div class="mt" dir="ltr" style="text-align:right">${esc(i.ip)} · ${i.fails} محاولة</div></div><div class="x"><button class="btn sm" data-ui="${esc(i.ip)}">فك القفل</button></div></div>`).join("")}
   <div class="actions"><button class="btn sm sec" id="unAll">فك قفل الجميع</button></div></div>`;
  const un=async(kind,val)=>{ try{ await rpc("staff_unlock",{p_token:staff.token,p_kind:kind,p_value:val}); toast("تم فك القفل"); loadLocked().then(()=>{ if(!$("#lockbox .card")) box.innerHTML=""; }); box.innerHTML=""; await loadLocked(); }catch(e){ toast(e.message); } };
  $$("[data-un]").forEach(b=>b.onclick=()=>un("nid",b.dataset.un)); $$("[data-ui]").forEach(b=>b.onclick=()=>un("ip",b.dataset.ui));
  $("#unAll").onclick=()=>confirmBox("فك قفل جميع الأرقام والأجهزة؟","فك القفل",()=>un("all",""));
}

function uniq(k){ return [...new Set(ALL.map(x=>x[k]).filter(Boolean))].sort(); }
function filtered(){
  const q=toEn(F.q).toLowerCase();
  return ALL.filter(x=>(!F.status||stOf(x)===F.status)&&(!F.grade||x.grade===F.grade)&&(!F.section||x.section===F.section)&&(!F.nat||x.nationality===F.nat)
    &&(!F.ag||(F.ag==="y"?(x.g&&(x.g.guardian_phone_agyal||x.g.school_contact_agyal)):!(x.g&&(x.g.guardian_phone_agyal||x.g.school_contact_agyal))))
    &&(!F.wa||((F.wa==="y")===!!(x.g&&(x.g.guardian_phone_whatsapp||x.g.school_contact_whatsapp))))
    &&(!q||x.full_name.toLowerCase().includes(q)||x.national_id.includes(q)||(x.g&&(x.g.guardian_phone.includes(q)||x.g.school_contact_phone.includes(q)||x.g.guardian_name.toLowerCase().includes(q)))));
}
const opts=(arr,cur,ph)=>`<option value="">${ph}</option>`+arr.map(v=>`<option ${v===cur?"selected":""}>${esc(v)}</option>`).join("");
function students(){
  $("#main").innerHTML=`<h1>${isTeacher()?"طلاب شعبتي":"الطلبة"}</h1><div class="lead">${isTeacher()?"اطلاع وتصدير لشعبتك فقط":"بحث وفلترة وتعديل وتصدير"}</div>
  <div class="filters"><input class="inp q" id="fq" type="search" placeholder="🔍 بحث بالاسم أو الرقم الوطني أو الهاتف" value="${esc(F.q)}">
   <select class="inp" id="fs"><option value="">كل الحالات</option>${Object.entries(STL).map(([k,v])=>`<option value="${k}" ${F.status===k?"selected":""}>${v}</option>`).join("")}</select>
   ${isTeacher()?"":`<select class="inp" id="fg">${opts(uniq("grade"),F.grade,"كل الصفوف")}</select>
   <select class="inp" id="fsec">${opts(uniq("section"),F.section,"كل الشعب")}</select>
   <select class="inp" id="fn">${opts(uniq("nationality"),F.nat,"كل الجنسيات")}</select>`}
   <select class="inp" id="fa"><option value="">أجيال OTP: الكل</option><option value="y" ${F.ag==="y"?"selected":""}>OTP أجيال</option><option value="n" ${F.ag==="n"?"selected":""}>لم يطلب</option></select>
   <select class="inp" id="fw"><option value="">واتساب: الكل</option><option value="y" ${F.wa==="y"?"selected":""}>للواتساب</option><option value="n" ${F.wa==="n"?"selected":""}>ليس للواتساب</option></select></div>
  <div class="bar-tools"><span class="pill p-info" id="cnt"></span><div class="sp" style="flex:1"></div>
   <button class="btn sm" id="ex">⬇ تصدير إلى Excel</button>
   ${isAdmin()?'<button class="btn sm sec" id="imp">⬆ استيراد Excel</button><button class="btn sm sec" id="tpl">قالب الاستيراد</button><button class="btn sm" id="addst">+ طالب</button>':""}</div>
  <div id="m"></div><div class="tw"><table><thead><tr><th>الطالب</th><th>الصف</th><th>الجنسية</th><th>الحالة</th><th>ولي الأمر الأول</th><th>ولي الأمر الثاني</th><th>آخر تحديث</th>${isTeacher()?"":"<th></th>"}</tr></thead><tbody id="tb"></tbody></table></div><div id="more"></div>`;
  const rf=()=>{LIM=100;rows()};
  $("#fq").oninput=e=>{F.q=e.target.value;rf()};
  [["fs","status"],["fg","grade"],["fsec","section"],["fn","nat"],["fa","ag"],["fw","wa"]].forEach(([id,k])=>{ if($("#"+id)) $("#"+id).onchange=e=>{F[k]=e.target.value;rf()}; });
  $("#ex").onclick=exportMenu;
  if(isAdmin()){ $("#imp").onclick=importX; $("#tpl").onclick=template; $("#addst").onclick=()=>studentModal(); }
  rows();
}
function rows(){
  const list=filtered(); $("#cnt").textContent=`${list.length} طالب`;
  $("#tb").innerHTML=list.slice(0,LIM).map(x=>{const s=stOf(x),d=x.g;
    return `<tr><td><b>${esc(x.full_name)}</b><div class="s" dir="ltr" style="text-align:right">${esc(x.national_id)}</div></td>
    <td>${esc(x.grade||"—")}<div class="s">${x.section?"شعبة "+esc(x.section):""}</div></td><td>${esc(x.nationality||"—")}<div class="s">${x.birth_place?"مواليد "+esc(x.birth_place):""}</div></td>
    <td><span class="pill ${{ok:"p-ok",no:"p-no",re:"p-re"}[s]}">${STL[s]}</span>${x.pending?'<div style="margin-top:4px"><span class="pill p-re">طلب تعديل</span></div>':""}</td>
    <td>${d?`${esc(d.guardian_name)}<div class="s">${esc(d.guardian_relation)}${d.guardian_occupation?" · "+esc(d.guardian_occupation):""} · <a href="tel:${esc(d.guardian_phone)}" dir="ltr">${esc(d.guardian_phone)}</a>${d.guardian_phone_whatsapp?" 💬":""}${d.guardian_phone_agyal?" 📩":""}</div>`:"—"}</td>
    <td>${d?`${esc(d.school_contact_name)}<div class="s">${esc(d.school_contact_relation)} · <a href="tel:${esc(d.school_contact_phone)}" dir="ltr">${esc(d.school_contact_phone)}</a>${d.school_contact_whatsapp?" 💬":""}${d.school_contact_agyal?" 📩":""}</div>`:"—"}</td>
    <td class="s">${d?esc((d.updated_at||"").slice(0,16).replace("T"," "))+"<br>"+(String(d.updated_by||"").startsWith("parent")?"ولي الأمر":esc(d.updated_by)):"—"}</td>
    ${isTeacher()?"":`<td><div class="acts"><button class="btn sm sec" data-e="${esc(x.national_id)}">بيانات التواصل</button>
     ${d&&d.status==="submitted"?`<button class="btn sm warn" data-r="${esc(x.national_id)}">إعادة فتح</button>`:""}
     ${isAdmin()?`<button class="btn sm sec" data-s="${esc(x.national_id)}">الطالب</button>`:""}</div></td>`}</tr>`}).join("")||`<tr><td colspan="8"><div class="empty">لا توجد نتائج مطابقة</div></td></tr>`;
  $("#more").innerHTML=list.length>LIM?`<div style="text-align:center;margin-top:12px"><button class="btn sec" id="mb">عرض المزيد (${list.length-LIM})</button></div>`:"";
  if($("#mb")) $("#mb").onclick=()=>{LIM+=200;rows()};
  $$("[data-e]").forEach(b=>b.onclick=()=>contactModal(b.dataset.e));
  $$("[data-s]").forEach(b=>b.onclick=()=>studentModal(b.dataset.s));
  $$("[data-r]").forEach(b=>b.onclick=()=>confirmBox("إعادة فتح البيانات ليتمكن ولي الأمر من التعديل؟","إعادة فتح",async()=>{await rpc("staff_reopen",{p_token:staff.token,p_nid:b.dataset.r});toast("تمت إعادة الفتح");await reload()}));
}
function modal(html,opt){ const w=document.createElement("div"); w.className="modal"; w.innerHTML=`<div class="card">${html}</div>`; w.onclick=e=>{if(!(opt&&opt.lock)&&e.target===w)w.remove()}; document.body.appendChild(w); return w; }
function confirmBox(text,label,fn){ const w=modal(`<h2>تأكيد</h2><div class="sub">${esc(text)}</div><div class="actions"><button class="btn" id="y">${label}</button><button class="btn sec" id="n">إلغاء</button></div>`);
  w.querySelector("#n").onclick=()=>w.remove(); w.querySelector("#y").onclick=async()=>{try{await fn();w.remove()}catch(e){toast(e.message);w.remove()}}; }
function contactModal(nid){
  const x=ALL.find(a=>a.national_id===nid);
  const w=modal(`<h2>${esc(x.full_name)}</h2><div class="sub" dir="ltr" style="text-align:right">${esc(nid)}</div><div class="field"><label>مكان الولادة</label><input class="inp" id="bpm" value="${esc(x.birth_place||"")}" maxlength="60"></div>${formBody(x.g)}<div id="mm"></div>
   <div class="actions"><button class="btn" id="s2">حفظ</button><button class="btn sec" id="c2">إلغاء</button>${x.g&&isAdmin()?'<button class="btn dng" id="cl" style="margin-inline-start:auto">مسح البيانات</button>':""}</div>`);
  wireForm(w); w.querySelector("#c2").onclick=()=>w.remove();
  if(w.querySelector("#cl")) w.querySelector("#cl").onclick=()=>confirmBox("سيتم حذف بيانات التواصل لهذا الطالب نهائياً.","حذف",async()=>{await rpc("staff_clear",{p_token:staff.token,p_nid:nid});w.remove();toast("تم المسح");await reload()});
  w.querySelector("#s2").onclick=async()=>{ const p=readForm(w); p.birth_place=w.querySelector("#bpm").value.trim(); if(!validateForm(w,p)) return;
    try{ const r=await rpc("staff_save",{p_token:staff.token,p_nid:nid,p}); if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]||r.error}</div>`; else { w.remove(); toast("تم الحفظ"); await reload(); } }
    catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}
function studentModal(nid){
  const x=nid?ALL.find(a=>a.national_id===nid):{};
  const w=modal(`<h2>${nid?"تعديل الطالب":"إضافة طالب"}</h2>
   <div class="field"><label>الرقم الوطني (10 أرقام)</label><input class="inp" id="a1" dir="ltr" maxlength="10" inputmode="numeric" value="${esc(x.national_id||"")}" ${nid?"disabled":""}></div>
   <div class="field"><label>الاسم الرباعي</label><input class="inp" id="a2" value="${esc(x.full_name||"")}"></div>
   <div class="grid2"><div class="field"><label>تاريخ الميلاد</label><input class="inp" id="a3" type="date" value="${esc(x.birth_date||"")}"></div>
    <div class="field"><label>مكان الولادة</label><input class="inp" id="a7" value="${esc(x.birth_place||"")}"></div>
    <div class="field"><label>الجنسية</label><input class="inp" id="a4" value="${esc(x.nationality||"")}" placeholder="أردني، سوري…"></div>
    <div class="field"><label>الصف</label><input class="inp" id="a5" value="${esc(x.grade||"")}"></div>
    <div class="field"><label>الشعبة</label><input class="inp" id="a6" value="${esc(x.section||"")}"></div></div>
   <div id="mm"></div><div class="actions"><button class="btn" id="sv">حفظ</button><button class="btn sec" id="cc">إلغاء</button>
   ${nid?'<button class="btn dng" id="dl" style="margin-inline-start:auto">حذف الطالب</button>':""}</div>`);
  w.querySelector("#a1").oninput=e=>{e.target.value=digits(e.target.value,10)};
  w.querySelector("#cc").onclick=()=>w.remove();
  if(nid) w.querySelector("#dl").onclick=()=>confirmBox("سيتم حذف الطالب وبياناته نهائياً.","حذف",async()=>{await rpc("staff_student_delete",{p_token:staff.token,p_nid:nid});w.remove();toast("تم الحذف");await reload()});
  w.querySelector("#sv").onclick=async()=>{ const p={national_id:w.querySelector("#a1").value,full_name:w.querySelector("#a2").value,birth_date:w.querySelector("#a3").value,birth_place:w.querySelector("#a7").value,nationality:w.querySelector("#a4").value,grade:w.querySelector("#a5").value,section:w.querySelector("#a6").value};
    if(!isNid(p.national_id)) return w.querySelector("#mm").innerHTML='<div class="alert err">الرقم الوطني يجب أن يتكون من 10 أرقام</div>';
    try{ const r=await rpc("staff_student_save",{p_token:staff.token,p}); if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]||"تحقق من الحقول"}</div>`; else { w.remove(); toast("تم الحفظ"); await reload(); } }
    catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}

/* =================== طلبات التعديل =================== */
const REQF=[["guardian_name","اسم ولي الأمر الأول"],["guardian_relation","صلة القرابة"],["guardian_occupation","المهنة"],["guardian_phone","هاتف ولي الأمر الأول","tel"],["guardian_phone_whatsapp","واتساب (الأول)","yn"],["guardian_phone_agyal","OTP أجيال (الأول)","yn"],
  ["school_contact_name","ولي الأمر الثاني"],["school_contact_relation","صلة القرابة (الثاني)"],["school_contact_phone","هاتف ولي الأمر الثاني","tel"],["school_contact_whatsapp","واتساب (الثاني)","yn"],["school_contact_agyal","OTP أجيال (الثاني)","yn"],["birth_place","مكان الولادة"]];
function reqVal(v,t){ if(v===undefined||v===null||v==="") return "—"; if(t==="yn") return v?"نعم":"لا"; if(t==="tel") return `<a href="tel:${esc(v)}" dir="ltr">${esc(v)}</a>`; return esc(v); }
function reqCard(r){
  const old=k=>k==="birth_place"?r.old_birth_place:(r.old?r.old[k]:undefined);
  const trs=REQF.map(([k,l,t])=>{ const o=old(k), n=r.new[k], ch=String(o??"")!==String(n??""); return `<tr class="${ch?"chg":""}"><th>${l}</th><td>${reqVal(o,t)}</td><td>${reqVal(n,t)}${ch?' <span class="pill p-re">تغيّر</span>':""}</td></tr>`; }).join("");
  return `<div class="card"><div class="ro-t"><div class="av" style="width:36px;height:36px;border-radius:10px">${esc(initials(r.name))}</div>${esc(r.name)}<span class="pill p-info">${esc(r.grade||"")} ${esc(shortSec(r.section))}</span></div>
   <div class="s" style="margin:4px 0 10px">أُرسل ${esc((r.created_at||"").slice(0,16).replace("T"," "))} — للتحقق اتصل بالرقم القديم أو الجديد</div>
   <div class="tw" style="max-height:none"><table class="rq"><thead><tr><th>الحقل</th><th>الحالي</th><th>المطلوب</th></tr></thead><tbody>${trs}</tbody></table></div>
   <div class="actions"><button class="btn" data-ap="${r.id}">✔ اعتماد التعديل</button><button class="btn dng" data-rj="${r.id}">✖ رفض</button></div></div>`;
}
function requests(){
  const P=REQ.filter(r=>r.status==="pending"), D=REQ.filter(r=>r.status!=="pending");
  $("#main").innerHTML=`<h1>طلبات التعديل</h1><div class="lead">يطلب ولي الأمر تعديل بياناته بعد الحفظ، ولا تُعتمد في السجلات إلا بموافقتك.</div>
   ${P.map(reqCard).join("")||'<div class="card"><div class="empty">لا توجد طلبات معلّقة ✅</div></div>'}
   ${D.length?`<h2 style="margin:20px 0 8px">آخر القرارات</h2><div class="tw"><table><thead><tr><th>الطالب</th><th>القرار</th><th>بواسطة</th><th>التاريخ</th><th>ملاحظة</th></tr></thead><tbody>${D.map(r=>`<tr><td>${esc(r.name)}</td><td><span class="pill ${r.status==="approved"?"p-ok":"p-no"}">${r.status==="approved"?"تم الاعتماد":"مرفوض"}</span></td><td>${esc(r.decided_by||"")}</td><td class="s">${esc((r.decided_at||"").slice(0,16).replace("T"," "))}</td><td class="s">${esc(r.note||"")}</td></tr>`).join("")}</tbody></table></div>`:""}`;
  $$("[data-ap]").forEach(b=>b.onclick=()=>confirmBox("اعتماد التعديل وتحديث بيانات الطالب في السجلات؟","اعتماد",async()=>{ await rpc("staff_request_decide",{p_token:staff.token,p_id:+b.dataset.ap,p_approve:true,p_note:""}); toast("تم اعتماد التعديل"); await reload(); }));
  $$("[data-rj]").forEach(b=>{ b.onclick=()=>{ const w=modal(`<h2>رفض طلب التعديل</h2><div class="field"><label>سبب الرفض (اختياري)</label><textarea class="inp" id="rn" rows="3"></textarea></div><div id="mm"></div><div class="actions"><button class="btn dng" id="ok">رفض الطلب</button><button class="btn sec" id="no">إلغاء</button></div>`);
    w.querySelector("#no").onclick=()=>w.remove();
    w.querySelector("#ok").onclick=async()=>{ try{ await rpc("staff_request_decide",{p_token:staff.token,p_id:+b.dataset.rj,p_approve:false,p_note:w.querySelector("#rn").value}); w.remove(); toast("تم رفض الطلب"); await reload(); }catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } }; }; });
}

/* =================== جودة البيانات =================== */
function quality(){
  const m=new Map();
  ALL.forEach(x=>{ if(!x.g) return; [["ولي الأمر الأول",x.g.guardian_name,x.g.guardian_phone],["ولي الأمر الثاني",x.g.school_contact_name,x.g.school_contact_phone]].forEach(([who,nm,ph])=>{ if(!ph) return; (m.get(ph)||m.set(ph,[]).get(ph)).push({x,who,nm}); }); });
  const dups=[]; m.forEach((arr,ph)=>{ const studs=[...new Map(arr.map(a=>[a.x.national_id,a.x])).values()]; if(studs.length<2) return; dups.push({ph,arr,studs,sib:studs.every(s=>sameFamily(s.full_name,studs[0].full_name))}); });
  const sus=dups.filter(d=>!d.sib).sort((a,b)=>b.studs.length-a.studs.length), sibs=dups.filter(d=>d.sib);
  const same=ALL.filter(x=>x.g&&x.g.guardian_phone&&x.g.guardian_phone===x.g.school_contact_phone);
  const stuLine=(x,extra)=>`<div class="kid" style="margin-top:6px"><div class="av">${esc(initials(x.full_name))}</div><div><div class="nm">${esc(x.full_name)}</div><div class="mt">${esc(x.grade||"")} ${esc(shortSec(x.section))}${extra?" · "+esc(extra):""}</div></div><div class="x"><button class="btn sm sec" data-e="${esc(x.national_id)}">فتح</button></div></div>`;
  $("#main").innerHTML=`<h1>جودة البيانات</h1><div class="lead">كشف الأرقام المكررة لمراجعتها والتأكد من صحتها</div>
   <div class="kpis"><div class="kpi"><div class="l">أرقام مشتبه بها</div><div class="v" style="color:var(--bad)">${sus.length}</div><div class="d">رقم واحد لطلبة غير إخوة</div></div>
    <div class="kpi"><div class="l">أرقام مشتركة بين إخوة</div><div class="v">${sibs.length}</div><div class="d">طبيعي</div></div>
    <div class="kpi"><div class="l">نفس الرقم لولي الأمر الأول والثاني</div><div class="v" style="color:var(--warn)">${same.length}</div><div class="d">قد يعني غياب رقم آخر</div></div></div>
   <div class="card"><h2>أرقام مشتبه بها (طلبة ليسوا إخوة)</h2><div class="sub">قد تكون خطأ إدخال، أو قريب يتابع أكثر من طالب.</div>
    ${sus.map(d=>`<div style="border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;margin-top:10px"><b><a href="tel:${esc(d.ph)}" dir="ltr">${esc(d.ph)}</a></b> <span class="pill p-re">${d.studs.length} طلاب</span>${d.studs.map(x=>stuLine(x,d.arr.filter(a=>a.x===x).map(a=>a.who+": "+a.nm).join(" / "))).join("")}</div>`).join("")||'<div class="alert ok">لا توجد أرقام مشتبه بها ✅</div>'}</div>
   <div class="card"><h2>نفس الرقم في الخانتين</h2>${same.map(x=>stuLine(x,x.g.guardian_phone)).join("")||'<div class="alert ok">لا يوجد ✅</div>'}</div>`;
  $$("[data-e]").forEach(b=>b.onclick=()=>contactModal(b.dataset.e));
}

/* =================== الرابط ورمز QR =================== */
const siteUrl=()=>location.origin+location.pathname.replace(/index\.html$/,"");
async function qrSvg(url){ await loadLib("lib/qrcode.js"); const qr=qrcode(0,"M"); qr.addData(url); qr.make(); return qr.createSvgTag({cellSize:8,margin:2,scalable:true}); }
function shareMsg(url){ return `السلام عليكم ورحمة الله،\nنرجو من أولياء أمور طلبة ${SET.school_name} تحديث بيانات التواصل عبر الرابط التالي.\nولمن لديه أكثر من ابن: يكفي إدخال الرقم الوطني لأحد الأبناء، ثم الضغط على «إضافة طالب آخر» من داخل الصفحة.\n${url}`; }
async function share(){
  const url=siteUrl();
  $("#main").innerHTML=`<h1>الرابط ورمز QR</h1><div class="lead">وزّع الرابط على أولياء الأمور بالواتساب، أو اطبع ورقة تعميم فيها رمز QR</div>
   <div class="cols"><div class="card"><h2>رابط الموقع</h2><input class="inp" id="lnk" dir="ltr" value="${esc(url)}">
    <div class="hint">يمكنك تعديل الرابط إن كان للموقع نطاق خاص</div>
    <div class="field"><label>نص رسالة الواتساب</label><textarea class="inp" id="msg" rows="6">${esc(shareMsg(url))}</textarea></div>
    <div class="actions"><button class="btn" id="cpy">نسخ الرابط</button><button class="btn sec" id="cpm">نسخ الرسالة</button><a class="btn sec" id="wa" href="#" target="_blank" rel="noopener noreferrer">إرسال عبر واتساب</a></div></div>
    <div class="card" style="text-align:center"><h2>رمز QR</h2><div id="qr" class="qrbox"><div class="empty">جارٍ التوليد…</div></div>
     <div class="actions" style="justify-content:center"><button class="btn" id="dlq">⬇ تنزيل الصورة</button><button class="btn sec" id="pf">🖨 طباعة ورقة تعميم</button></div></div></div>`;
  const upd=async()=>{ const u=$("#lnk").value.trim(); try{ $("#qr").innerHTML=await qrSvg(u); }catch(e){ $("#qr").innerHTML='<div class="alert err">تعذّر توليد الرمز</div>'; } $("#wa").href="https://wa.me/?text="+encodeURIComponent($("#msg").value.replace(/https?:\/\/\S+$/,u)); };
  $("#lnk").oninput=()=>{ $("#msg").value=shareMsg($("#lnk").value.trim()); upd(); }; $("#msg").oninput=upd; upd();
  const copy=async t=>{ try{ await navigator.clipboard.writeText(t); toast("تم النسخ"); }catch(e){ toast("تعذّر النسخ، حدّد النص وانسخه يدوياً"); } };
  $("#cpy").onclick=()=>copy($("#lnk").value); $("#cpm").onclick=()=>copy($("#msg").value);
  $("#dlq").onclick=async()=>{ try{ const svg=await qrSvg($("#lnk").value.trim()); const img=new Image(); img.onload=()=>{ const c=document.createElement("canvas"); c.width=c.height=900; const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,900,900); g.drawImage(img,0,0,900,900); c.toBlob(b=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="QR_تحديث_البيانات.png"; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500); }); };
    img.src=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"})); }catch(e){ toast("تعذّر تنزيل الصورة"); } };
  $("#pf").onclick=async()=>{ const u=$("#lnk").value.trim(); let f=$("#flyer"); if(f) f.remove(); f=document.createElement("div"); f.id="flyer";
    f.innerHTML=`<div class="fl-head"><img src="img/moe.jpg" alt=""><div class="fl-t">المملكة الأردنية الهاشمية<br><b>وزارة التربية والتعليم</b><br>مديرية التربية والتعليم للواء وادي السير<br><b>${esc(SET.school_name)}</b></div><img src="img/school.jpg" alt=""></div>
     <h1>بوابة تحديث بيانات الطلبة</h1><p class="fl-sub">نرجو من أولياء الأمور الكرام تحديث بيانات التواصل لأبنائهم، لأغراض العملية التعليمية والتواصل الرسمي مع المدرسة.</p>
     <div class="fl-body"><div class="fl-qr">${await qrSvg(u)}<div>امسح الرمز بكاميرا الهاتف</div></div><div class="fl-steps"><h3>كيف أحدّث بيانات ابني؟</h3><ol><li>امسح رمز QR أو افتح الرابط أدناه.</li><li>أدخل <b>الرقم الوطني للطالب</b> وتاريخ ميلاده.</li><li>لديك أكثر من ابن؟ اضغط <b>«إضافة طالب آخر»</b> من داخل الصفحة.</li><li>أدخل بيانات التواصل ثم اضغط «حفظ» وأكّد التعهد.</li></ol></div></div>
     <div class="fl-url" dir="ltr">${esc(u)}</div><div class="fl-foot">للاستفسار: التواصل مع المرشد التربوي أ. إيهاب أبو دية في المدرسة</div>`;
    document.body.appendChild(f); printEl("pr-flyer"); };
}

/* =================== التصدير إلى Excel =================== */
function exportMenu(){
  const items=[["upd","البيانات المحدَّثة","الطلبة الذين حدّثوا بياناتهم، بكل التفاصيل"],["cur","نتائج الفلترة الحالية","ما تراه الآن في الجدول"],["todo","غير المحدّثين — قوائم متابعة","لكل شعبة ورقة فيها عمود ملاحظات، لتسليمها لمربي الصف"],["wa","أرقام الواتساب","الأرقام التي اختارها أولياء الأمور لمجموعات الواتساب، مرتبة حسب الشعبة"],["otp","أرقام OTP أجيال","الأرقام المخصصة لرسائل كود الدخول على منصة أجيال"],["all","كل الطلبة","النسخة الكاملة (المحدَّث وغير المحدَّث)"]];
  const w=modal(`<h2>تصدير إلى Excel</h2><div class="sub">كل شعبة في ورقة مستقلة، منسّقة وجاهزة للطباعة، وفي رأس كل ورقة فلتر وبحث.</div>${items.map(([k,t,d])=>`<button class="optb" data-x="${k}"><b>${t}</b><span>${d}</span></button>`).join("")}<div class="actions"><button class="btn sec" id="cx">إغلاق</button></div>`);
  w.querySelector("#cx").onclick=()=>w.remove();
  w.querySelectorAll("[data-x]").forEach(b=>b.onclick=async()=>{ w.remove(); await exportKind(b.dataset.x); });
}
const FULL_COLS=[["الرقم الوطني",15],["اسم الطالب",32],["تاريخ الميلاد",13],["مكان الولادة",14],["الجنسية",11],["الحالة",12],["ولي الأمر الأول",26],["صلة القرابة",12],["مهنة ولي الأمر",16],["هاتف ولي الأمر الأول",14],["واتساب (الأول)",11],["OTP أجيال (الأول)",12],["ولي الأمر الثاني",26],["صلة القرابة (الثاني)",13],["هاتف ولي الأمر الثاني",14],["واتساب (الثاني)",11],["OTP أجيال (الثاني)",12],["آخر تحديث",17]];
function fullRow(x){ const d=x.g, yn=v=>d?(v?"نعم":"لا"):"";
  return [[x.national_id,x.full_name,x.birth_date,x.birth_place||"",x.nationality||"",STL[stOf(x)],d?.guardian_name||"",d?.guardian_relation||"",d?.guardian_occupation||"",d?.guardian_phone||"",yn(d?.guardian_phone_whatsapp),yn(d?.guardian_phone_agyal),d?.school_contact_name||"",d?.school_contact_relation||"",d?.school_contact_phone||"",yn(d?.school_contact_whatsapp),yn(d?.school_contact_agyal),d?.updated_at?d.updated_at.slice(0,16).replace("T"," "):""]]; }
async function exportKind(k){
  const fullOpt={cols:FULL_COLS,rowFn:fullRow,statusCol:5,center:[0,2,5,7,9,10,11,13,14,15,16,17],text:[0,9,14]};
  if(k==="upd") return exportBook({...fullOpt,list:ALL.filter(x=>x.g),name:"البيانات_المحدثة"});
  if(k==="cur") return exportBook({...fullOpt,list:filtered(),name:"نتائج_الفلترة"});
  if(k==="all") return exportBook({...fullOpt,list:ALL,name:"كل_الطلبة"});
  if(k==="todo") return exportBook({list:ALL.filter(x=>stOf(x)!=="ok"),name:"غير_المحدثين_حسب_الشعبة",cols:[["الرقم الوطني",15],["اسم الطالب",34],["تاريخ الميلاد",13],["الجنسية",11],["الحالة",13],["ملاحظات المعلم",36],["تاريخ التواصل",15]],
    rowFn:x=>[[x.national_id,x.full_name,x.birth_date,x.nationality||"",STL[stOf(x)],"",""]],statusCol:4,center:[0,2,3,4,6],text:[0]});
  if(k==="wa"||k==="otp"){ const wa=k==="wa";
    const has=d=>d&&(wa?(d.guardian_phone_whatsapp||d.school_contact_whatsapp):(d.guardian_phone_agyal||d.school_contact_agyal));
    return exportBook({list:ALL.filter(x=>has(x.g)),name:wa?"أرقام_الواتساب_حسب_الشعبة":"أرقام_OTP_أجيال_حسب_الشعبة",countRows:true,
      cols:[["اسم الطالب",34],["صاحب الرقم",28],["صلة القرابة",13],["رقم الهاتف",15],["واتساب",10],["OTP أجيال",11]],center:[2,3,4,5],text:[3],
      rowFn:x=>{ const d=x.g, out=[]; const yn=v=>v?"نعم":"لا";
        if(wa?d.guardian_phone_whatsapp:d.guardian_phone_agyal) out.push([x.full_name,d.guardian_name,d.guardian_relation,d.guardian_phone,yn(d.guardian_phone_whatsapp),yn(d.guardian_phone_agyal)]);
        if(wa?d.school_contact_whatsapp:d.school_contact_agyal) out.push([x.full_name,d.school_contact_name,d.school_contact_relation,d.school_contact_phone,yn(d.school_contact_whatsapp),yn(d.school_contact_agyal)]);
        return out; }}); }
}
async function backupAll(){
  const cols=[["الصف",12],["الشعبة",22],...FULL_COLS,["طلب تعديل معلّق",14]];
  await exportBook({list:ALL,name:"نسخة_احتياطية_"+new Date().toISOString().slice(0,10),flat:true,cols,statusCol:7,center:[0,2,3,5,7,9,11,12,13,15,16,17,18,19],text:[2,11,16],
    rowFn:x=>[[x.grade||"",x.section||"",...fullRow(x)[0],x.pending?"نعم":""]]});
  try{ localStorage.setItem("lastBackup",new Date().toISOString()); }catch(e){}
  if(TAB==="overview"||TAB==="settings") renderShell();
}
async function exportBook(o){
  const {list,name,cols,rowFn,statusCol=-1,center=[],text=[]}=o;
  if(!list.length) return toast("لا توجد بيانات للتصدير");
  try{ await loadLib("lib/exceljs.min.js"); }catch(e){ return toast("تعذّر تحميل مكتبة التصدير"); }
  toast("جارٍ تجهيز الملف…");
  const wb=new ExcelJS.Workbook(); wb.creator=SET.school_name; wb.created=new Date();
  const FONT="Arial", BORDER={style:"thin",color:{argb:"FFDDD5BC"}}, BD={top:BORDER,left:BORDER,bottom:BORDER,right:BORDER};
  const fill=a=>({type:"pattern",pattern:"solid",fgColor:{argb:a}});
  const groups=new Map();
  if(o.flat) groups.set("كل الطلبة|",list); else list.forEach(x=>{const k=(x.grade||"بدون صف")+"|"+(x.section||""); (groups.get(k)||groups.set(k,[]).get(k)).push(x)});
  const keys=[...groups.keys()].sort((a,b)=>{const [ga,sa]=a.split("|"),[gb,sb]=b.split("|"); return gIdx(ga)-gIdx(gb)||ga.localeCompare(gb,"ar")||sa.localeCompare(sb,"ar")});
  const used=new Set(), uniqueName=n=>{n=n.replace(/[\[\]:*?\/\\]/g,"").slice(0,31); let r=n,i=2; while(used.has(r)) r=n.slice(0,28)+" "+(i++); used.add(r); return r};
  const L=cols.length+1, stats=[];
  const sum=o.flat?null:wb.addWorksheet("ملخص",{views:[{rightToLeft:true,showGridLines:false}],properties:{tabColor:{argb:"FF4B5B2A"}}}); used.add("ملخص");
  for(const k of keys){
    const rowsList=[...groups.get(k)].sort((a,b)=>a.full_name.localeCompare(b.full_name,"ar")), [g,s]=k.split("|");
    const data=[]; rowsList.forEach(x=>rowFn(x).forEach(c=>data.push({x,c})));
    if(!data.length) continue;
    const title=o.flat?"كل الطلبة":`${g}${s?" - "+shortSec(s):""}`;
    const ws=wb.addWorksheet(uniqueName(o.flat?"كل الطلبة":`${g.replace("الحادي عشر","11").replace("الثاني عشر","12")} ${shortSec(s)}`.trim()),{views:[{rightToLeft:true,state:"frozen",xSplit:3,ySplit:4}],properties:{tabColor:{argb:"FFA97C27"}},pageSetup:{orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9}});
    ws.columns=[{width:5},...cols.map(c=>({width:c[1]}))];
    const done=rowsList.filter(x=>x.g&&x.g.status==="submitted").length, re=rowsList.filter(x=>x.g&&x.g.status==="reopened").length;
    ws.mergeCells(1,1,1,L); const t=ws.getCell(1,1); t.value=`${SET.school_name} — ${title}`;
    t.font={name:FONT,size:15,bold:true,color:{argb:"FFFFFFFF"}}; t.fill=fill("FF3B4A1F"); t.alignment={horizontal:"center",vertical:"middle"}; ws.getRow(1).height=30;
    ws.mergeCells(2,1,2,L); const st=ws.getCell(2,1);
    st.value=`عدد الطلبة: ${rowsList.length}     |     تم التحديث: ${done}     |     لم يحدّث: ${rowsList.length-done-re}${re?`     |     أُعيد فتحه: ${re}`:""}${o.countRows?`     |     عدد الأرقام: ${data.length}`:""}     |     نسبة الإنجاز: ${rowsList.length?Math.round(done*100/rowsList.length):0}%     |     تاريخ التصدير: ${new Date().toLocaleDateString("en-GB")}`;
    st.font={name:FONT,size:11,bold:true,color:{argb:"FF3B4A1F"}}; st.fill=fill("FFE7EAD9"); st.alignment={horizontal:"center",vertical:"middle"}; ws.getRow(2).height=24;
    ws.getRow(3).height=6;
    const h=ws.getRow(4); ["م",...cols.map(c=>c[0])].forEach((v,i)=>{const cell=h.getCell(i+1); cell.value=v; cell.font={name:FONT,size:11,bold:true,color:{argb:"FFFFFFFF"}}; cell.fill=fill("FF4B5B2A"); cell.alignment={horizontal:"center",vertical:"middle",wrapText:true}; cell.border=BD});
    h.height=34;
    data.forEach((d,i)=>{
      const r=ws.addRow([i+1,...d.c]); r.height=22; const zebra=i%2?"FFF6F2E6":"FFFFFFFF";
      r.eachCell({includeEmpty:true},(c,n)=>{ const ci=n-2; c.font={name:FONT,size:11}; c.border=BD; c.fill=fill(zebra); c.alignment={vertical:"middle",horizontal:(n===1||center.includes(ci))?"center":"right"}; if(text.includes(ci)) c.numFmt="@"; });
      if(statusCol>=0){ const S=stOf(d.x), sc=r.getCell(statusCol+2), col={ok:["FFDCF5E7","FF0B7A43"],no:["FFFDE2E6","FFC0283F"],re:["FFFFEFD0","FFB45F06"]}[S]; sc.fill=fill(col[0]); sc.font={name:FONT,size:11,bold:true,color:{argb:col[1]}}; }
    });
    ws.autoFilter={from:{row:4,column:1},to:{row:4,column:L}};
    ws.headerFooter={oddFooter:"&C&P / &N"}; ws.pageSetup.printTitlesRow="4:4";
    stats.push({n:ws.name,title,total:rowsList.length,done,re,rows:data.length});
  }
  if(!stats.length) return toast("لا توجد بيانات للتصدير");
  if(sum){
    const heads=["الصف / الشعبة","عدد الطلبة","تم التحديث","لم يحدّث","أُعيد فتحه","نسبة الإنجاز"]; if(o.countRows) heads.push("عدد الأرقام");
    sum.columns=heads.map((_,i)=>({width:i===0?34:13}));
    sum.mergeCells(1,1,1,heads.length); const t1=sum.getCell(1,1); t1.value=`${SET.school_name} — ملخص ${name.replace(/_/g," ")}`; t1.font={name:FONT,size:16,bold:true,color:{argb:"FFFFFFFF"}}; t1.fill=fill("FF3B4A1F"); t1.alignment={horizontal:"center",vertical:"middle"}; sum.getRow(1).height=34;
    const hr=sum.getRow(3); heads.forEach((v,i)=>{const c=hr.getCell(i+1); c.value=v; c.font={name:FONT,bold:true,color:{argb:"FFFFFFFF"}}; c.fill=fill("FF4B5B2A"); c.alignment={horizontal:"center",vertical:"middle"}; c.border=BD}); hr.height=26;
    stats.forEach((s,i)=>{ const vals=[{text:s.title,hyperlink:`#'${s.n}'!A1`},s.total,s.done,s.total-s.done-s.re,s.re,s.total?s.done/s.total:0]; if(o.countRows) vals.push(s.rows);
      const r=sum.addRow(vals); r.height=22;
      r.eachCell((c,n)=>{c.font={name:FONT,size:11,color:n===1?{argb:"FF4B5B2A"}:undefined,underline:n===1}; c.border=BD; c.alignment={horizontal:n===1?"right":"center",vertical:"middle"}; c.fill=fill(i%2?"FFF6F2E6":"FFFFFFFF")}); r.getCell(6).numFmt="0%"; });
    const T=stats.reduce((a,s)=>({t:a.t+s.total,d:a.d+s.done,r:a.r+s.re,n:a.n+s.rows}),{t:0,d:0,r:0,n:0});
    const tv=["الإجمالي",T.t,T.d,T.t-T.d-T.r,T.r,T.t?T.d/T.t:0]; if(o.countRows) tv.push(T.n);
    const tr=sum.addRow(tv); tr.height=26; tr.eachCell(c=>{c.font={name:FONT,size:12,bold:true,color:{argb:"FF3B4A1F"}}; c.fill=fill("FFE7EAD9"); c.border=BD; c.alignment={horizontal:"center",vertical:"middle"}}); tr.getCell(6).numFmt="0%";
  }
  const buf=await wb.xlsx.writeBuffer(); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
  a.download=name+".xlsx"; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500); toast("تم تنزيل الملف");
}
async function template(){ await loadLib("lib/xlsx.full.min.js"); const ws=XLSX.utils.aoa_to_sheet([["الرقم الوطني","اسم الطالب","تاريخ الميلاد","مكان الولادة","الجنسية","الصف","الشعبة"],["2000000000","محمد أحمد خالد علي","2012-03-25","عمّان","أردني","السابع","أ"]]);
  ws["!cols"]=[{wch:16},{wch:28},{wch:14},{wch:14},{wch:12},{wch:10},{wch:8}]; const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"الطلبة"); XLSX.writeFile(wb,"قالب_الطلبة.xlsx"); }
function fixDate(v){
  if(v instanceof Date) return new Date(v.getTime()+12*36e5).toISOString().slice(0,10);
  if(typeof v==="number"){ const o=XLSX.SSF.parse_date_code(v); return o?`${o.y}-${String(o.m).padStart(2,"0")}-${String(o.d).padStart(2,"0")}`:""; }
  v=toEn(v); let m=v.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/); if(m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  m=v.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/); if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`; return ""; }
function importX(){
  const i=document.createElement("input"); i.type="file"; i.accept=".xlsx,.xls,.csv";
  i.onchange=async()=>{ try{
    await loadLib("lib/xlsx.full.min.js");
    const wb=XLSX.read(await i.files[0].arrayBuffer(),{type:"array",cellDates:true}); const js=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true});
    const R=js.slice(1).filter(r=>r&&r[0]).map(r=>({national_id:toEn(r[0]).replace(/\D/g,""),full_name:String(r[1]||"").trim(),birth_date:fixDate(r[2]),birth_place:String(r[3]||"").trim(),nationality:String(r[4]||"").trim(),grade:String(r[5]||"").trim(),section:String(r[6]||"").trim()}));
    const badN=R.filter(r=>!isNid(r.national_id)).length, badD=R.filter(r=>!r.birth_date||!r.full_name).length;
    if(badN||badD) return $("#m").innerHTML=`<div class="alert err">لم يتم الاستيراد: ${badN?badN+" رقم وطني ليس 10 أرقام. ":""}${badD?badD+" سطر ينقصه اسم أو تاريخ ميلاد صحيح.":""} استخدم «قالب الاستيراد».</div>`;
    const r=await rpc("staff_import_students",{p_token:staff.token,p_rows:R}); if(r.error) return $("#m").innerHTML=`<div class="alert err">${ERR[r.error]}</div>`;
    toast(`تم استيراد ${r.count} طالب`); await reload();
  }catch(e){ $("#m").innerHTML=`<div class="alert err">تعذّر قراءة الملف: ${esc(e.message)}</div>`; } };
  i.click();
}

/* =================== الإعدادات والمستخدمون والسجل =================== */
function settings(){
  const lb=lastBackup(), lbTxt=lb?new Date(lb).toLocaleString("ar-JO",{dateStyle:"medium",timeStyle:"short"}):"لم تُحفظ بعد";
  $("#main").innerHTML=`<h1>الإعدادات</h1><div class="lead">التحكم في بوابة أولياء الأمور</div><div class="card" style="max-width:720px">
   <div class="setrow"><div><b>استقبال التحديثات</b><div class="hint">عند الإغلاق لا يستطيع أولياء الأمور إرسال بيانات جديدة (طلبات التعديل تبقى متاحة)</div></div><label class="sw"><input type="checkbox" id="so" ${SET.form_open?"checked":""}><span></span></label></div>
   <div class="field"><label>آخر موعد للتحديث (اختياري)</label><input class="inp" type="date" id="sd" value="${esc(SET.deadline||"")}"></div>
   <div class="field"><label>اسم المدرسة</label><input class="inp" id="sn" value="${esc(SET.school_name)}"></div>
   <div class="field"><label>إعلان يظهر في الصفحة الرئيسية</label><textarea class="inp" id="sa" rows="2">${esc(SET.announcement)}</textarea></div>
   <div class="field"><label>نص التعهد</label><textarea class="inp" id="sc" rows="3">${esc(SET.consent_text)}</textarea></div>
   <div id="mm"></div><div class="actions"><button class="btn" id="sv">حفظ الإعدادات</button></div></div>
   <div class="card" style="max-width:720px"><h2>💾 النسخ الاحتياطي</h2><div class="sub">احفظ نسخة كاملة من البيانات في ملف Excel على جهازك مرة كل أسبوع. آخر نسخة: <b>${esc(lbTxt)}</b></div><div class="actions"><button class="btn" id="bk">حفظ نسخة احتياطية الآن</button></div></div>`;
  $("#bk").onclick=backupAll;
  $("#sv").onclick=async()=>{ try{ await rpc("staff_settings_save",{p_token:staff.token,p:{form_open:$("#so").checked,deadline:$("#sd").value,school_name:$("#sn").value,announcement:$("#sa").value,consent_text:$("#sc").value}});
    SET=await rpc("get_public_settings"); applySettings(); toast("تم حفظ الإعدادات"); }catch(e){ $("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}
function setDate(id,iso){ if(!iso) return; const [y,m,d]=iso.split("-"); const q=k=>document.querySelector(`#${id} [data-d=${k}]`); q("d").value=String(+d); q("m").value=String(+m); q("y").value=y; }
async function users(){
  $("#main").innerHTML=`<h1>المستخدمون</h1><div class="lead">الإدارة والمرشد ومربّو الصفوف — الدخول بالرقم الوطني وتاريخ الميلاد ثم رمز سري</div><div id="ul" class="empty">جارٍ التحميل…</div>`;
  let U; try{ U=await rpc("staff_users_list",{p_token:staff.token}); }catch(e){ return; }
  const row=u=>`<div class="kid"><div class="av">${esc(initials(u.display_name))}</div><div><div class="nm">${esc(u.display_name)}</div><div class="mt" dir="ltr" style="text-align:right">${u.nid?esc(u.nid):"لم يُحدَّد الرقم الوطني"} · ${ROLE_L[u.role]}${u.role==="teacher"?` · ${esc(u.grade||"")} ${esc(shortSec(u.section))}`:""}</div></div>
    <div class="x">${u.must_change?'<span class="pill p-re">لم يغيّر الرمز</span> ':""}<button class="btn sm sec" data-u="${u.id}">تعديل</button></div></div>`;
  const T=U.filter(u=>u.role==="teacher").sort((a,b)=>gIdx(a.grade)-gIdx(b.grade)||String(a.section).localeCompare(String(b.section),"ar")), O=U.filter(u=>u.role!=="teacher");
  $("#ul").className=""; $("#ul").innerHTML=`<div class="card"><h2>الإدارة والمرشد</h2>${O.map(row).join("")}</div><div class="card"><h2>مربّو الصفوف (${T.length})</h2>${T.map(row).join("")||'<div class="empty">لا يوجد</div>'}
    <div class="actions"><button class="btn" id="nu">+ مستخدم جديد</button></div></div>`;
  const edit=u=>{ const grades=[...new Set(ALL.map(x=>x.grade).filter(Boolean))].sort((a,b)=>gIdx(a)-gIdx(b));
    const secOf=g=>[...new Set(ALL.filter(x=>x.grade===g).map(x=>x.section).filter(Boolean))].sort();
    const w=modal(`<h2>${u?"تعديل مستخدم":"مستخدم جديد"}</h2>
    <div class="field"><label>الاسم الظاهر (اسم المربي أو المسؤول)</label><input class="inp" id="b2" value="${esc(u?.display_name||"")}"></div>
    <div class="field"><label>الصلاحية</label><select class="inp" id="b3"><option value="teacher" ${(!u||u.role==="teacher")?"selected":""}>مربي صف (اطلاع وتصدير لشعبته)</option><option value="counselor" ${u?.role==="counselor"?"selected":""}>مرشد تربوي</option><option value="admin" ${u?.role==="admin"?"selected":""}>مطوّر / أدمن</option></select></div>
    <div id="tgrp" class="grid2"><div class="field"><label>الصف</label><select class="inp" id="b5"><option value="">اختر…</option>${grades.map(g=>`<option ${u?.grade===g?"selected":""}>${esc(g)}</option>`).join("")}</select></div>
     <div class="field"><label>الشعبة</label><select class="inp" id="b6"></select></div></div>
    <div class="field"><label>الرقم الوطني (10 أرقام)</label><input class="inp" id="b1" dir="ltr" inputmode="numeric" maxlength="10" autocomplete="off" value="${esc(u?.nid||"")}"></div>
    <div class="field"><label>تاريخ الميلاد</label>${dateSel("dobU")}</div>
    <div class="field"><label>الرمز السري ${u?"(اتركه فارغاً لعدم التغيير)":"(مؤقت — يُطلب من المستخدم تغييره عند أول دخول)"}</label><input class="inp" id="b4" type="text" dir="ltr" autocomplete="off" placeholder="${u?"":"مثال: 1234"}">
     <div class="actions" style="margin-top:6px"><button class="btn sm sec" id="r1234" type="button">تعيين الرمز المؤقت 1234</button></div></div>
    <div id="mm"></div><div class="actions"><button class="btn" id="sv">حفظ</button><button class="btn sec" id="cc">إلغاء</button></div>`);
    setDate("dobU",u?.dob);
    const fillSec=()=>{ const g=w.querySelector("#b5").value; w.querySelector("#b6").innerHTML='<option value="">اختر…</option>'+secOf(g).map(s=>`<option ${u?.section===s&&u?.grade===g?"selected":""}>${esc(s)}</option>`).join(""); };
    const showT=()=>w.querySelector("#tgrp").classList.toggle("hide",w.querySelector("#b3").value!=="teacher");
    w.querySelector("#b3").onchange=showT; w.querySelector("#b5").onchange=fillSec; fillSec(); showT();
    w.querySelector("#b1").oninput=e=>{e.target.value=digits(e.target.value,10)};
    w.querySelector("#r1234").onclick=()=>{w.querySelector("#b4").value="1234"};
    w.querySelector("#cc").onclick=()=>w.remove();
    w.querySelector("#sv").onclick=async()=>{ try{ const nid=w.querySelector("#b1").value, dob=readDate("dobU"), role=w.querySelector("#b3").value;
      if(!u&&(!nid||!dob)) return w.querySelector("#mm").innerHTML='<div class="alert err">أدخل الرقم الوطني وتاريخ الميلاد</div>';
      const r=await rpc("staff_user_save",{p_token:staff.token,p_id:u?u.id:null,p_nid:nid||null,p_dob:dob||null,p_display:w.querySelector("#b2").value,p_role:role,p_pass:w.querySelector("#b4").value,p_grade:role==="teacher"?w.querySelector("#b5").value:null,p_section:role==="teacher"?w.querySelector("#b6").value:null});
      if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]||"تحقق من الحقول"}</div>`; else { w.remove(); toast("تم الحفظ"); users(); } }catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } }; };
  $("#nu").onclick=()=>edit(null); $$("[data-u]").forEach(b=>b.onclick=()=>edit(U.find(u=>u.id==b.dataset.u)));
}
const ACT={login:"دخول موظف",login_fail:"محاولة دخول فاشلة",submit:"إرسال من ولي الأمر",edit:"تعديل بيانات تواصل",reopen:"إعادة فتح",clear:"مسح بيانات",import:"استيراد طلبة",student_save:"حفظ طالب",student_delete:"حذف طالب",settings:"تعديل الإعدادات",user_save:"حفظ مستخدم",edit_request:"طلب تعديل من ولي الأمر",edit_approve:"اعتماد طلب تعديل",edit_reject:"رفض طلب تعديل",unlock:"فك قفل",pw_change:"تغيير رمز سري"};
async function audit(){
  $("#main").innerHTML=`<h1>سجل النشاط</h1><div class="lead">آخر 200 عملية</div><div class="empty">جارٍ التحميل…</div>`;
  let A; try{ A=await rpc("staff_audit",{p_token:staff.token}); }catch(e){ return; }
  const nm=n=>{const s=ALL.find(x=>x.national_id===n); return s?s.full_name:n||""};
  $("#main").innerHTML=`<h1>سجل النشاط</h1><div class="lead">آخر 200 عملية</div><div class="tw"><table><thead><tr><th>الوقت</th><th>المنفّذ</th><th>العملية</th><th>الطالب / ملاحظة</th></tr></thead><tbody>
   ${A.map(a=>`<tr><td class="s" dir="ltr" style="text-align:right">${esc((a.at||"").slice(0,16).replace("T"," "))}</td><td>${a.actor==="parent"?"ولي أمر":esc(a.actor)}</td><td>${esc(ACT[a.action]||a.action)}</td><td>${esc(nm(a.national_id)||a.note||"")}</td></tr>`).join("")||'<tr><td colspan="4"><div class="empty">لا يوجد نشاط</div></td></tr>'}</tbody></table></div>`;
}
function changePw(){
  const w=modal(`<h2>تغيير كلمة المرور</h2><div class="field"><label>كلمة المرور الجديدة (8 أحرف على الأقل)</label><input class="inp" id="np" type="password" dir="ltr" autocomplete="new-password"></div><div id="mm"></div>
   <div class="actions"><button class="btn" id="s3">حفظ</button><button class="btn sec" id="c3">إلغاء</button></div>`);
  w.querySelector("#c3").onclick=()=>w.remove();
  w.querySelector("#s3").onclick=async()=>{ try{ const r=await rpc("staff_change_password",{p_token:staff.token,p_new:w.querySelector("#np").value});
    if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]}</div>`; else { w.remove(); toast("تم تغيير كلمة المرور"); } }catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}
go();
