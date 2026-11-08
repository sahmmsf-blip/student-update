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
    if(j&&/forbidden/.test(j.message||"")) throw new Error("لا تملك صلاحية هذا الإجراء");
    throw new Error("تعذّر إتمام العملية، حاول مرة أخرى");
  }
  return j;
}
const ERR={not_found:"البيانات غير مطابقة. تأكد من الرقم الوطني وتاريخ الميلاد.",locked:"تم تجاوز عدد المحاولات. حاول لاحقاً.",already_submitted:"تم تحديث بيانات هذا الطالب مسبقاً.",consent_required:"يجب الموافقة على التعهد للمتابعة.",invalid:"تحقق من الحقول المدخلة.",closed:"باب تحديث البيانات مغلق حالياً.",weak:"كلمة المرور يجب ألا تقل عن 10 أحرف.",bad_nid:"الرقم الوطني يجب أن يتكون من 10 أرقام."};

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
    <div class="credits"><div><span>المطوّر</span><b>أ. سهم العجارمة</b></div><div><span>المرشد التربوي</span><b>أ. إيهاب أبو دية</b><a href="tel:0786199363" dir="ltr">0786199363</a></div></div></div>
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
    kids=[{nid:r.nid,dob,name:r.name,birth_place:r.birth_place,grade:r.grade,section:r.section,nationality:r.nationality,status:r.data?r.data.status:"none",data:r.data,closed:r.closed}];
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
let kids=[], draft=null, adding=false;   // kids: {nid,dob,name,birth_place,grade,section,nationality,status,data,closed}
const eligible=()=>kids.filter(k=>k.status!=="submitted");
function parentStart(){ kids=[]; draft=null; adding=false; parentPage(); }
function roField(l,v){ return `<div class="field"><label>${l}</label><input class="inp" value="${esc(v||"—")}" disabled tabindex="-1"></div>`; }
function kidCard(k,i){
  const st=k.status==="submitted"?'<span class="pill p-ok">تم التحديث مسبقاً</span>':k.status==="reopened"?'<span class="pill p-re">أُعيد فتحه للتعديل</span>':'<span class="pill p-info">بيانات الطالب</span>';
  return `<div class="card ro"><div class="ro-t"><div class="av" style="width:36px;height:36px;border-radius:10px">${esc(initials(k.name))}</div>${esc(k.name)}${st}<button class="btn sm sec" data-rm="${i}" title="إزالة الطالب" aria-label="إزالة">✕</button></div>
   <div class="grid2">${roField("الرقم الوطني",k.nid)}${roField("تاريخ الميلاد",k.dob)}<div class="field"><label>مكان الولادة <b style="color:var(--bad)">*</b></label><input class="inp edit" data-bp="${i}" value="${esc(k.birth_place||"")}" placeholder="مثال: عمّان، إربد، الزرقاء…" maxlength="60" ${k.status==="submitted"?"disabled":""}><div class="errt" id="ebp${i}"></div></div>${roField("الجنسية",k.nationality)}${roField("الصف",k.grade)}${roField("الشعبة",k.section)}</div></div>`;
}
function lookupCard(){
  return `<div class="card"><h2>${kids.length?"إضافة طالب آخر":"أدخل بيانات الطالب"}</h2>
   <div class="sub">${kids.length?"ستبقى البيانات التي أدخلتها كما هي، وسيُضاف الطالب إليها.":"أدخل الرقم الوطني وتاريخ الميلاد لعرض بيانات الطالب."}</div>
   <div class="grid2"><div class="field"><label>الرقم الوطني للطالب</label><input class="inp" id="nid" inputmode="numeric" autocomplete="off" dir="ltr" maxlength="10" placeholder="10 أرقام"><div class="errt" id="e1"></div></div>
   <div class="field"><label>تاريخ ميلاد الطالب</label>${dateSel("dobK")}<div class="errt" id="e2"></div></div></div>
   <div id="lm"></div><div class="actions"><button class="btn" id="add">${kids.length?"إضافة الطالب":"بحث"}</button>${kids.length?'<button class="btn sec" id="cancelAdd">إلغاء</button>':""}</div></div>`;
}
function parentPage(msg){
  chrome("بوابة أولياء الأمور",{home:true});
  const el=eligible(), closed=kids.some(k=>k.closed), showLookup=!kids.length||adding;
  app.innerHTML=`<div class="wrap" style="padding-top:18px">
   ${closed?'<div class="alert warn">باب تحديث البيانات مغلق حالياً.</div>':""}
   ${kids.map(kidCard).join("")}
   ${showLookup?lookupCard():""}
   ${el.length&&!closed&&!showLookup?`<div class="card"><h2>بيانات التواصل</h2><div class="sub">${el.length>1?`سيتم تطبيق هذه البيانات على ${el.length} طلبة.`:"أدخل البيانات التالية بدقة."}</div>
     <div id="fm">${formBody(draft)}</div><div id="m">${msg?`<div class="alert err">${msg}</div>`:""}</div>
     <div class="actions"><button class="btn" id="sv">💾 حفظ</button><button class="btn sec" id="addk">＋ إضافة طالب آخر</button></div></div>`:""}
   ${!el.length&&kids.length&&!showLookup?`<div class="card"><div class="alert ok">جميع الطلبة المضافين تم تحديث بياناتهم مسبقاً. للتعديل تواصل مع المرشد التربوي.</div><div class="actions"><button class="btn" id="addk">＋ إضافة طالب آخر</button></div></div>`:""}
   </div>`;
  $$("[data-rm]").forEach(b=>b.onclick=()=>{kids.splice(+b.dataset.rm,1);parentPage()});
  $$("[data-bp]").forEach(inp=>inp.oninput=()=>{kids[+inp.dataset.bp].birth_place=inp.value; const e=$("#ebp"+inp.dataset.bp); if(e) e.textContent=""});
  if(showLookup){ $("#nid").oninput=e=>{e.target.value=digits(e.target.value,10)}; $("#add").onclick=addKid; $("#nid").onkeydown=e=>{if(e.key==="Enter")addKid()};
    if($("#cancelAdd")) $("#cancelAdd").onclick=()=>{adding=false;parentPage()}; }
  if($("#fm")){ wireForm(app); }
  if($("#addk")) $("#addk").onclick=()=>{ if($("#fm")) draft=readForm(app); adding=true; parentPage(); setTimeout(()=>$("#nid")&&$("#nid").scrollIntoView({behavior:"smooth",block:"center"}),50); };
  if($("#sv")) $("#sv").onclick=()=>{ const p=readForm(app); draft=p; let okBp=true; kids.forEach((k,i)=>{ if(k.status!=="submitted"&&String(k.birth_place||"").trim().length<2){ okBp=false; const e=$("#ebp"+i); if(e) e.textContent="أدخل مكان ولادة الطالب"; } });
    if(!validateForm(app,p)||!okBp) return $("#m").innerHTML='<div class="alert err">يرجى تصحيح الحقول المظلّلة بالأحمر، ومكان ولادة كل طالب</div>'; confirmSave(p); };
}
async function addKid(){
  const nid=digits($("#nid").value,10), dob=readDate("dobK"); let ok=true;
  $("#e1").textContent=isNid(nid)?"":(ok=false,"الرقم الوطني يجب أن يتكون من 10 أرقام");
  $("#e2").textContent=dob?"":(ok=false,"اختر تاريخ الميلاد كاملاً");
  if(!ok) return;
  if(kids.some(k=>k.nid===nid)) return $("#lm").innerHTML='<div class="alert warn">هذا الطالب مضاف مسبقاً.</div>';
  $("#add").disabled=true; $("#add").textContent="جارٍ التحقق…";
  try{
    const r=await rpc("parent_lookup",{p_nid:nid,p_dob:dob});
    if(r.error){ $("#add").disabled=false; $("#add").textContent=kids.length?"إضافة الطالب":"بحث"; return $("#lm").innerHTML=`<div class="alert err">${ERR[r.error]||"خطأ"}</div>`; }
    kids.push({nid,dob,name:r.name,birth_place:r.birth_place,grade:r.grade,section:r.section,nationality:r.nationality,status:r.data?r.data.status:"none",data:r.data,closed:r.closed});
    if(!draft&&r.data&&r.data.status!=="submitted") draft=r.data;
    adding=false; parentPage();
  }catch(e){ $("#add").disabled=false; $("#add").textContent=kids.length?"إضافة الطالب":"بحث"; $("#lm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; }
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
 <div class="grid2">${relField("sr","صلة القرابة",d.school_contact_relation)}${phoneField("sp","رقم هاتف ولي الأمر الثاني",d.school_contact_phone,d.school_contact_agyal,d.school_contact_whatsapp)}</div>`; }
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
  const w=modal(`<h2>تأكيد حفظ البيانات</h2>
   <div class="sub">سيتم حفظ بيانات التواصل لـ ${el.length>1?"الطلبة":"الطالب"}:</div>
   ${el.map(k=>`<div class="kid"><div class="av">${esc(initials(k.name))}</div><div><div class="nm">${esc(k.name)}</div><div class="mt">${esc([k.grade,k.section&&("شعبة "+k.section)].filter(Boolean).join(" · "))}</div></div></div>`).join("")}
   <div class="pledge"><b>تعهّد والتزام</b><br>${esc(SET.consent_text||"أتعهد بأنني المسؤول عن صحة جميع البيانات المدخلة، وأوافق على اعتمادها في سجلات المدرسة واستخدامها لأغراض العملية التعليمية والتواصل الرسمي.")}</div>
   <label class="chk consent"><input type="checkbox" id="pc"><span>أقرّ بأنني اطلعت على البيانات وأتعهد بصحتها وأتحمل المسؤولية عنها.</span></label>
   <div id="pm"></div><div class="actions"><button class="btn" id="py" disabled>✔ تأكيد الحفظ</button><button class="btn sec" id="pn">رجوع للتعديل</button></div>`);
  w.querySelector("#pc").onchange=e=>{w.querySelector("#py").disabled=!e.target.checked};
  w.querySelector("#pn").onclick=()=>w.remove();
  w.querySelector("#py").onclick=async()=>{
    const b=w.querySelector("#py"); b.disabled=true; b.textContent="جارٍ الحفظ…"; w.querySelector("#pm").innerHTML="";
    const fails=[];
    for(const k of el){
      try{ const body={...p,consent:true,birth_place:String(k.birth_place||"").trim()}; const r=await rpc("parent_submit",{p_nid:k.nid,p_dob:k.dob,p:body}); if(r.error) fails.push(`${k.name}: ${ERR[r.error]||r.error}`); else { k.status="submitted"; k.data={...body,status:"submitted"}; } }
      catch(e){ fails.push(`${k.name}: ${e.message}`); } }
    if(fails.length){ b.disabled=false; b.textContent="✔ تأكيد الحفظ"; w.querySelector("#pm").innerHTML=`<div class="alert err">${fails.map(esc).join("<br>")}</div>`; }
    else { w.remove(); parentDone(); }
  };
}
function parentDone(){
  draft=null;
  app.innerHTML=`<div class="wrap" style="padding-top:18px"><div class="card success"><div class="big">✓</div><h2>تم حفظ البيانات بنجاح</h2>
  <div class="sub">شكراً لتعاونكم. تم تحديث بيانات:</div>
  <div style="text-align:start">${kids.filter(k=>k.status==="submitted").map(k=>`<div class="kid"><div class="av">${esc(initials(k.name))}</div><div class="nm">${esc(k.name)}</div><div class="x"><span class="pill p-ok">تم</span></div></div>`).join("")}</div>
  <div class="actions" style="justify-content:center"><button class="btn" id="add2">＋ إضافة طالب آخر</button><button class="btn sec" id="fin">إنهاء</button></div></div></div>`;
  $("#add2").onclick=()=>{adding=true;parentPage()}; $("#fin").onclick=()=>{kids=[];draft=null;adding=false;go()};
}

/* =================== الإدارة (الدخول موحّد من النموذج الرئيسي) =================== */
let ALL=[], TAB="overview", F={q:"",status:"",grade:"",section:"",nat:"",ag:"",wa:""}, LIM=100;
const isAdmin=()=>staff&&staff.role==="admin";
const stOf=x=>!x.g?"no":(x.g.status==="reopened"?"re":"ok");
const STL={ok:"محدَّث",no:"لم يحدّث",re:"أُعيد فتحه"};

async function staffApp(){
  chrome((isAdmin()?"لوحة المطوّر · ":"لوحة المرشد · ")+staff.name,{out:true});
  app.innerHTML='<div class="empty">جارٍ تحميل البيانات…</div>';
  try{ ALL=await rpc("staff_list",{p_token:staff.token}); }catch(e){ return; }
  renderShell();
}
function renderShell(){
  const tabs=[["overview","📊","نظرة عامة"],["students","🎓","الطلبة"]];
  if(isAdmin()) tabs.push(["settings","⚙️","الإعدادات"],["users","👥","المستخدمون"],["audit","🧾","السجل"]);
  app.innerHTML=`<div class="shell"><nav class="side">${tabs.map(t=>`<button class="nav ${TAB===t[0]?"on":""}" data-t="${t[0]}"><span class="e">${t[1]}</span><span>${t[2]}</span></button>`).join("")}
   <button class="nav" id="pwb"><span class="e">🔑</span><span>كلمتي</span></button></nav><section class="main" id="main"></section></div>`;
  $$("[data-t]").forEach(b=>b.onclick=()=>{TAB=b.dataset.t;renderShell()}); $("#pwb").onclick=changePw;
  ({overview,students,settings,users,audit})[TAB]();
}
function group(list,fn){ const m=new Map(); list.forEach(x=>{const k=fn(x)||"غير محدد"; const o=m.get(k)||{k,t:0,d:0}; o.t++; if(x.g&&x.g.status==="submitted")o.d++; m.set(k,o)}); return [...m.values()].sort((a,b)=>b.t-a.t); }
function hbars(rows){ return rows.map(r=>{const p=r.t?Math.round(r.d*100/r.t):0; return `<div class="hb"><div class="t"><span>${esc(r.k)}</span><span>${r.d} / ${r.t} · ${p}%</span></div><div class="tr"><i style="width:${p}%"></i></div></div>`}).join("")||'<div class="empty">لا بيانات</div>'; }

function overview(){
  const tot=ALL.length, done=ALL.filter(x=>stOf(x)==="ok").length, re=ALL.filter(x=>stOf(x)==="re").length, no=tot-done-re;
  const pct=tot?Math.round(done*100/tot):0, ag=ALL.filter(x=>x.g&&(x.g.guardian_phone_agyal||x.g.school_contact_agyal)).length, wa=ALL.filter(x=>x.g&&(x.g.guardian_phone_whatsapp||x.g.school_contact_whatsapp)).length;
  const C=2*Math.PI*52, dd=C*done/(tot||1), rr=C*re/(tot||1);
  const days=[]; for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*864e5).toISOString().slice(0,10); days.push({d,n:0})}
  ALL.forEach(x=>{ if(x.g&&x.g.status==="submitted"){const d=(x.g.updated_at||"").slice(0,10); const o=days.find(a=>a.d===d); if(o)o.n++;} });
  const mx=Math.max(1,...days.map(d=>d.n));
  $("#main").innerHTML=`<h1>نظرة عامة</h1><div class="lead">متابعة تحديث بيانات أولياء الأمور لحظة بلحظة</div>
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
  <div class="cols"><div class="card"><h2>حسب الصف</h2>${hbars(group(ALL,x=>x.grade))}</div>
   <div class="card"><h2>حسب الجنسية</h2>${hbars(group(ALL,x=>x.nationality))}</div></div>`;
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
  $("#main").innerHTML=`<h1>الطلبة</h1><div class="lead">بحث وفلترة وتعديل وتصدير</div>
  <div class="filters"><input class="inp q" id="fq" type="search" placeholder="🔍 بحث بالاسم أو الرقم الوطني أو الهاتف" value="${esc(F.q)}">
   <select class="inp" id="fs"><option value="">كل الحالات</option>${Object.entries(STL).map(([k,v])=>`<option value="${k}" ${F.status===k?"selected":""}>${v}</option>`).join("")}</select>
   <select class="inp" id="fg">${opts(uniq("grade"),F.grade,"كل الصفوف")}</select>
   <select class="inp" id="fsec">${opts(uniq("section"),F.section,"كل الشعب")}</select>
   <select class="inp" id="fn">${opts(uniq("nationality"),F.nat,"كل الجنسيات")}</select>
   <select class="inp" id="fa"><option value="">أجيال OTP: الكل</option><option value="y" ${F.ag==="y"?"selected":""}>OTP أجيال</option><option value="n" ${F.ag==="n"?"selected":""}>لم يطلب</option></select>
   <select class="inp" id="fw"><option value="">واتساب: الكل</option><option value="y" ${F.wa==="y"?"selected":""}>للواتساب</option><option value="n" ${F.wa==="n"?"selected":""}>ليس للواتساب</option></select></div>
  <div class="bar-tools"><span class="pill p-info" id="cnt"></span><div class="sp" style="flex:1"></div>
   <button class="btn sm" id="ex">⬇ تصدير المحدَّثة</button><button class="btn sm sec" id="exf">⬇ تصدير النتائج الحالية</button>
   ${isAdmin()?'<button class="btn sm sec" id="imp">⬆ استيراد Excel</button><button class="btn sm sec" id="tpl">قالب الاستيراد</button><button class="btn sm" id="addst">+ طالب</button>':""}</div>
  <div id="m"></div><div class="tw"><table><thead><tr><th>الطالب</th><th>الصف</th><th>الجنسية</th><th>الحالة</th><th>ولي الأمر</th><th>شخص المتابعة</th><th>آخر تحديث</th><th></th></tr></thead><tbody id="tb"></tbody></table></div><div id="more"></div>`;
  const rf=()=>{LIM=100;rows()};
  $("#fq").oninput=e=>{F.q=e.target.value;rf()};
  [["fs","status"],["fg","grade"],["fsec","section"],["fn","nat"],["fa","ag"],["fw","wa"]].forEach(([id,k])=>$("#"+id).onchange=e=>{F[k]=e.target.value;rf()});
  $("#ex").onclick=()=>exportX(ALL.filter(x=>x.g),"البيانات_المحدثة"); $("#exf").onclick=()=>exportX(filtered(),"نتائج_الفلترة");
  if(isAdmin()){ $("#imp").onclick=importX; $("#tpl").onclick=template; $("#addst").onclick=()=>studentModal(); }
  rows();
}
function rows(){
  const list=filtered(); $("#cnt").textContent=`${list.length} طالب`;
  $("#tb").innerHTML=list.slice(0,LIM).map(x=>{const s=stOf(x),d=x.g;
    return `<tr><td><b>${esc(x.full_name)}</b><div class="s" dir="ltr" style="text-align:right">${esc(x.national_id)}</div></td>
    <td>${esc(x.grade||"—")}<div class="s">${x.section?"شعبة "+esc(x.section):""}</div></td><td>${esc(x.nationality||"—")}<div class="s">${x.birth_place?"مواليد "+esc(x.birth_place):""}</div></td>
    <td><span class="pill ${{ok:"p-ok",no:"p-no",re:"p-re"}[s]}">${STL[s]}</span></td>
    <td>${d?`${esc(d.guardian_name)}<div class="s">${esc(d.guardian_relation)}${d.guardian_occupation?" · "+esc(d.guardian_occupation):""} · <span dir="ltr">${esc(d.guardian_phone)}</span>${d.guardian_phone_whatsapp?" 💬":""}${d.guardian_phone_agyal?" 📩":""}</div>`:"—"}</td>
    <td>${d?`${esc(d.school_contact_name)}<div class="s">${esc(d.school_contact_relation)} · <span dir="ltr">${esc(d.school_contact_phone)}</span>${d.school_contact_whatsapp?" 💬":""}${d.school_contact_agyal?" 📩":""}</div>`:"—"}</td>
    <td class="s">${d?esc((d.updated_at||"").slice(0,16).replace("T"," "))+"<br>"+(d.updated_by==="parent"?"ولي الأمر":esc(d.updated_by)):"—"}</td>
    <td><div class="acts"><button class="btn sm sec" data-e="${esc(x.national_id)}">بيانات التواصل</button>
     ${d&&d.status==="submitted"?`<button class="btn sm warn" data-r="${esc(x.national_id)}">إعادة فتح</button>`:""}
     ${isAdmin()?`<button class="btn sm sec" data-s="${esc(x.national_id)}">الطالب</button>`:""}</div></td></tr>`}).join("")||'<tr><td colspan="8"><div class="empty">لا توجد نتائج مطابقة</div></td></tr>';
  $("#more").innerHTML=list.length>LIM?`<div style="text-align:center;margin-top:12px"><button class="btn sec" id="mb">عرض المزيد (${list.length-LIM})</button></div>`:"";
  if($("#mb")) $("#mb").onclick=()=>{LIM+=200;rows()};
  $$("[data-e]").forEach(b=>b.onclick=()=>contactModal(b.dataset.e));
  $$("[data-s]").forEach(b=>b.onclick=()=>studentModal(b.dataset.s));
  $$("[data-r]").forEach(b=>b.onclick=()=>confirmBox("إعادة فتح البيانات ليتمكن ولي الأمر من التعديل؟","إعادة فتح",async()=>{await rpc("staff_reopen",{p_token:staff.token,p_nid:b.dataset.r});toast("تمت إعادة الفتح");await reload()}));
}
async function reload(){ ALL=await rpc("staff_list",{p_token:staff.token}); renderShell(); }
function modal(html){ const w=document.createElement("div"); w.className="modal"; w.innerHTML=`<div class="card">${html}</div>`; w.onclick=e=>{if(e.target===w)w.remove()}; document.body.appendChild(w); return w; }
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

const GORDER=["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];
async function exportX(list,name){
  if(!list.length) return toast("لا توجد بيانات للتصدير");
  try{ await loadLib("lib/exceljs.min.js"); }catch(e){ return toast("تعذّر تحميل مكتبة التصدير"); }
  toast("جارٍ تجهيز الملف…");
  const wb=new ExcelJS.Workbook(); wb.creator=SET.school_name; wb.created=new Date();
  const FONT="Arial", BORDER={style:"thin",color:{argb:"FFDDD5BC"}}, BD={top:BORDER,left:BORDER,bottom:BORDER,right:BORDER};
  const short=s=>String(s||"بدون شعبة").replace("مسار أكاديمي","أكاديمي").replace("علوم وتكنولوجيا وهندسة","علوم وهندسة").replace("لغات وعلوم إنسانية واجتماعية","لغات وإنسانية");
  const gi=g=>{let i=GORDER.indexOf(g); if(i<0) i=GORDER.findIndex(x=>g&&g.includes(x)); return i<0?99:i};
  const groups=new Map();
  list.forEach(x=>{const k=(x.grade||"بدون صف")+"|"+(x.section||""); (groups.get(k)||groups.set(k,[]).get(k)).push(x)});
  const keys=[...groups.keys()].sort((a,b)=>{const [ga,sa]=a.split("|"),[gb,sb]=b.split("|"); return gi(ga)-gi(gb)||ga.localeCompare(gb,"ar")||sa.localeCompare(sb,"ar")});
  const used=new Set(), uniqueName=n=>{n=n.replace(/[\[\]:*?\/\\]/g,"").slice(0,31); let r=n,i=2; while(used.has(r)) r=n.slice(0,28)+" "+(i++); used.add(r); return r};
  const cols=[["م",5],["الرقم الوطني",15],["اسم الطالب",32],["تاريخ الميلاد",13],["مكان الولادة",14],["الجنسية",11],["الحالة",12],["ولي الأمر الأول",26],["صلة القرابة",12],["مهنة ولي الأمر",16],["هاتف ولي الأمر الأول",14],["واتساب (الأول)",11],["OTP أجيال (الأول)",12],["ولي الأمر الثاني",26],["صلة القرابة (الثاني)",13],["هاتف ولي الأمر الثاني",14],["واتساب (الثاني)",11],["OTP أجيال (الثاني)",12],["آخر تحديث",17]];
  const L=cols.length;
  const colL=n=>{let s="";while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  const stats=[];
  // ملخص
  const sum=wb.addWorksheet("ملخص",{views:[{rightToLeft:true,showGridLines:false}],properties:{tabColor:{argb:"FF4B5B2A"}}}); used.add("ملخص");
  const sheets=[];
  for(const k of keys){
    const rows=groups.get(k), [g,s]=k.split("|"), title=`${g}${s?" - "+short(s):""}`;
    const ws=wb.addWorksheet(uniqueName(`${g.replace("الحادي عشر","11").replace("الثاني عشر","12")} ${short(s)}`.trim()),{views:[{rightToLeft:true,state:"frozen",xSplit:3,ySplit:4}],properties:{tabColor:{argb:"FFA97C27"}},pageSetup:{orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9}});
    ws.columns=cols.map(c=>({width:c[1]}));
    const done=rows.filter(x=>x.g&&x.g.status==="submitted").length, re=rows.filter(x=>x.g&&x.g.status==="reopened").length;
    ws.mergeCells(1,1,1,L); const t=ws.getCell(1,1); t.value=`${SET.school_name} — ${title}`;
    t.font={name:FONT,size:15,bold:true,color:{argb:"FFFFFFFF"}}; t.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF3B4A1F"}}; t.alignment={horizontal:"center",vertical:"middle"}; ws.getRow(1).height=30;
    ws.mergeCells(2,1,2,L); const st=ws.getCell(2,1);
    st.value=`عدد الطلبة: ${rows.length}     |     تم التحديث: ${done}     |     لم يحدّث: ${rows.length-done-re}${re?`     |     أُعيد فتحه: ${re}`:""}     |     نسبة الإنجاز: ${rows.length?Math.round(done*100/rows.length):0}%     |     تاريخ التصدير: ${new Date().toLocaleDateString("en-GB")}`;
    st.font={name:FONT,size:11,bold:true,color:{argb:"FF3B4A1F"}}; st.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE7EAD9"}}; st.alignment={horizontal:"center",vertical:"middle"}; ws.getRow(2).height=24;
    ws.getRow(3).height=6;
    const h=ws.getRow(4); cols.forEach((c,i)=>{const cell=h.getCell(i+1); cell.value=c[0]; cell.font={name:FONT,size:11,bold:true,color:{argb:"FFFFFFFF"}}; cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF4B5B2A"}}; cell.alignment={horizontal:"center",vertical:"middle",wrapText:true}; cell.border=BD});
    h.height=34;
    rows.sort((a,b)=>a.full_name.localeCompare(b.full_name,"ar")).forEach((x,i)=>{
      const d=x.g, S=stOf(x), yn=v=>d?(v?"نعم":"لا"):"";
      const r=ws.addRow([i+1,x.national_id,x.full_name,x.birth_date,x.birth_place||"",x.nationality||"",STL[S],d?.guardian_name||"",d?.guardian_relation||"",d?.guardian_occupation||"",d?.guardian_phone||"",yn(d?.guardian_phone_whatsapp),yn(d?.guardian_phone_agyal),d?.school_contact_name||"",d?.school_contact_relation||"",d?.school_contact_phone||"",yn(d?.school_contact_whatsapp),yn(d?.school_contact_agyal),d?.updated_at?d.updated_at.slice(0,16).replace("T"," "):""]);
      r.height=22; const zebra=i%2?"FFF6F2E6":"FFFFFFFF";
      r.eachCell({includeEmpty:true},(c,n)=>{c.font={name:FONT,size:11}; c.border=BD; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:zebra}}; c.alignment={vertical:"middle",horizontal:[1,2,4,7,9,11,12,13,15,16,17,18,19].includes(n)?"center":"right"}; if([2,11,16].includes(n)) c.numFmt="@"});
      const sc=r.getCell(7), col={ok:["FFDCF5E7","FF0B7A43"],no:["FFFDE2E6","FFC0283F"],re:["FFFFEFD0","FFB45F06"]}[S];
      sc.fill={type:"pattern",pattern:"solid",fgColor:{argb:col[0]}}; sc.font={name:FONT,size:11,bold:true,color:{argb:col[1]}};
    });
    ws.autoFilter={from:{row:4,column:1},to:{row:4,column:L}};
    ws.headerFooter={oddFooter:"&C&P / &N"}; ws.pageSetup.printTitlesRow="4:4";
    stats.push({n:ws.name,title,total:rows.length,done,re});
  }
  // ورقة الملخص
  sum.columns=[{width:34},{width:12},{width:12},{width:12},{width:12},{width:14}];
  sum.mergeCells("A1:F1"); const t1=sum.getCell("A1"); t1.value=`${SET.school_name} — ملخص تحديث بيانات أولياء الأمور`; t1.font={name:FONT,size:16,bold:true,color:{argb:"FFFFFFFF"}}; t1.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF3B4A1F"}}; t1.alignment={horizontal:"center",vertical:"middle"}; sum.getRow(1).height=34;
  const hr=sum.getRow(3); ["الصف / الشعبة","العدد","تم التحديث","لم يحدّث","أُعيد فتحه","نسبة الإنجاز"].forEach((v,i)=>{const c=hr.getCell(i+1); c.value=v; c.font={name:FONT,bold:true,color:{argb:"FFFFFFFF"}}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF4B5B2A"}}; c.alignment={horizontal:"center",vertical:"middle"}; c.border=BD}); hr.height=26;
  stats.forEach((s,i)=>{ const r=sum.addRow([{text:s.title,hyperlink:`#'${s.n}'!A1`},s.total,s.done,s.total-s.done-s.re,s.re,s.total?s.done/s.total:0]); r.height=22;
    r.eachCell((c,n)=>{c.font={name:FONT,size:11,color:n===1?{argb:"FF4B5B2A"}:undefined,underline:n===1}; c.border=BD; c.alignment={horizontal:n===1?"right":"center",vertical:"middle"}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:i%2?"FFF6F2E6":"FFFFFFFF"}}}); r.getCell(6).numFmt="0%"; });
  const T=stats.reduce((a,s)=>({t:a.t+s.total,d:a.d+s.done,r:a.r+s.re}),{t:0,d:0,r:0});
  const tr=sum.addRow(["الإجمالي",T.t,T.d,T.t-T.d-T.r,T.r,T.t?T.d/T.t:0]); tr.height=26; tr.eachCell(c=>{c.font={name:FONT,size:12,bold:true,color:{argb:"FF3B4A1F"}}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE7EAD9"}}; c.border=BD; c.alignment={horizontal:"center",vertical:"middle"}}); tr.getCell(6).numFmt="0%";
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

function settings(){
  $("#main").innerHTML=`<h1>الإعدادات</h1><div class="lead">التحكم في بوابة أولياء الأمور</div><div class="card" style="max-width:720px">
   <div class="setrow"><div><b>استقبال التحديثات</b><div class="hint">عند الإغلاق لا يستطيع أولياء الأمور إرسال بيانات جديدة</div></div><label class="sw"><input type="checkbox" id="so" ${SET.form_open?"checked":""}><span></span></label></div>
   <div class="field"><label>آخر موعد للتحديث (اختياري)</label><input class="inp" type="date" id="sd" value="${esc(SET.deadline||"")}"></div>
   <div class="field"><label>اسم المدرسة</label><input class="inp" id="sn" value="${esc(SET.school_name)}"></div>
   <div class="field"><label>إعلان يظهر في الصفحة الرئيسية</label><textarea class="inp" id="sa" rows="2">${esc(SET.announcement)}</textarea></div>
   <div class="field"><label>نص التعهد</label><textarea class="inp" id="sc" rows="3">${esc(SET.consent_text)}</textarea></div>
   <div id="mm"></div><div class="actions"><button class="btn" id="sv">حفظ الإعدادات</button></div></div>`;
  $("#sv").onclick=async()=>{ try{ await rpc("staff_settings_save",{p_token:staff.token,p:{form_open:$("#so").checked,deadline:$("#sd").value,school_name:$("#sn").value,announcement:$("#sa").value,consent_text:$("#sc").value}});
    SET=await rpc("get_public_settings"); applySettings(); toast("تم حفظ الإعدادات"); }catch(e){ $("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}
async function users(){
  $("#main").innerHTML=`<h1>المستخدمون</h1><div class="lead">حسابات الإدارة والمرشد — الدخول بالرقم الوطني وتاريخ الميلاد ثم رمز سري</div><div id="ul" class="empty">جارٍ التحميل…</div>`;
  let U; try{ U=await rpc("staff_users_list",{p_token:staff.token}); }catch(e){ return; }
  $("#ul").className=""; $("#ul").innerHTML=`<div class="card">${U.map(u=>`<div class="kid"><div class="av">${esc(initials(u.display_name))}</div><div><div class="nm">${esc(u.display_name)}</div><div class="mt" dir="ltr" style="text-align:right">${u.nid_mask?esc(u.nid_mask):"لم يُحدَّد الرقم الوطني"} · ${u.role==="admin"?"مطوّر/أدمن":"مرشد تربوي"}</div></div>
    <div class="x"><button class="btn sm sec" data-u="${u.id}">تعديل</button></div></div>`).join("")}
    <div class="actions"><button class="btn" id="nu">+ مستخدم جديد</button></div></div>`;
  const edit=u=>{ const w=modal(`<h2>${u?"تعديل مستخدم":"مستخدم جديد"}</h2>
    <div class="field"><label>الاسم الظاهر</label><input class="inp" id="b2" value="${esc(u?.display_name||"")}"></div>
    <div class="field"><label>الرقم الوطني (10 أرقام)${u?" — اتركه فارغاً لعدم التغيير":""}</label><input class="inp" id="b1" dir="ltr" inputmode="numeric" maxlength="10" autocomplete="off"></div>
    <div class="field"><label>تاريخ الميلاد${u?" — اتركه فارغاً لعدم التغيير":""}</label>${dateSel("dobU")}</div>
    <div class="field"><label>الصلاحية</label><select class="inp" id="b3"><option value="counselor" ${u?.role==="counselor"?"selected":""}>مرشد تربوي</option><option value="admin" ${u?.role==="admin"?"selected":""}>مطوّر / أدمن</option></select></div>
    <div class="field"><label>الرمز السري ${u?"(اتركه فارغاً لعدم التغيير)":"(10 أحرف على الأقل)"}</label><input class="inp" id="b4" type="password" dir="ltr" autocomplete="new-password"></div>
    <div id="mm"></div><div class="actions"><button class="btn" id="sv">حفظ</button><button class="btn sec" id="cc">إلغاء</button></div>`);
    w.querySelector("#b1").oninput=e=>{e.target.value=digits(e.target.value,10)};
    w.querySelector("#cc").onclick=()=>w.remove();
    w.querySelector("#sv").onclick=async()=>{ try{ const nid=w.querySelector("#b1").value, dob=readDate("dobU");
      const r=await rpc("staff_user_save",{p_token:staff.token,p_id:u?u.id:null,p_nid:nid||null,p_dob:dob||null,p_display:w.querySelector("#b2").value,p_role:w.querySelector("#b3").value,p_pass:w.querySelector("#b4").value});
      if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]||"تحقق من الحقول"}</div>`; else { w.remove(); toast("تم الحفظ"); users(); } }catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } }; };
  $("#nu").onclick=()=>edit(null); $$("[data-u]").forEach(b=>b.onclick=()=>edit(U.find(u=>u.id==b.dataset.u)));
}
const ACT={login:"دخول موظف",login_fail:"محاولة دخول فاشلة",submit:"إرسال من ولي الأمر",edit:"تعديل بيانات تواصل",reopen:"إعادة فتح",clear:"مسح بيانات",import:"استيراد طلبة",student_save:"حفظ طالب",student_delete:"حذف طالب",settings:"تعديل الإعدادات",user_save:"حفظ مستخدم"};
async function audit(){
  $("#main").innerHTML=`<h1>سجل النشاط</h1><div class="lead">آخر 200 عملية</div><div class="empty">جارٍ التحميل…</div>`;
  let A; try{ A=await rpc("staff_audit",{p_token:staff.token}); }catch(e){ return; }
  const nm=n=>{const s=ALL.find(x=>x.national_id===n); return s?s.full_name:n||""};
  $("#main").innerHTML=`<h1>سجل النشاط</h1><div class="lead">آخر 200 عملية</div><div class="tw"><table><thead><tr><th>الوقت</th><th>المنفّذ</th><th>العملية</th><th>الطالب / ملاحظة</th></tr></thead><tbody>
   ${A.map(a=>`<tr><td class="s" dir="ltr" style="text-align:right">${esc((a.at||"").slice(0,16).replace("T"," "))}</td><td>${a.actor==="parent"?"ولي أمر":esc(a.actor)}</td><td>${esc(ACT[a.action]||a.action)}</td><td>${esc(nm(a.national_id)||a.note||"")}</td></tr>`).join("")||'<tr><td colspan="4"><div class="empty">لا يوجد نشاط</div></td></tr>'}</tbody></table></div>`;
}
function changePw(){
  const w=modal(`<h2>تغيير كلمة المرور</h2><div class="field"><label>كلمة المرور الجديدة (10 أحرف على الأقل)</label><input class="inp" id="np" type="password" dir="ltr" autocomplete="new-password"></div><div id="mm"></div>
   <div class="actions"><button class="btn" id="s3">حفظ</button><button class="btn sec" id="c3">إلغاء</button></div>`);
  w.querySelector("#c3").onclick=()=>w.remove();
  w.querySelector("#s3").onclick=async()=>{ try{ const r=await rpc("staff_change_password",{p_token:staff.token,p_new:w.querySelector("#np").value});
    if(r.error) w.querySelector("#mm").innerHTML=`<div class="alert err">${ERR[r.error]}</div>`; else { w.remove(); toast("تم تغيير كلمة المرور"); } }catch(e){ w.querySelector("#mm").innerHTML=`<div class="alert err">${esc(e.message)}</div>`; } };
}
go();
