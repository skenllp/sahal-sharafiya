/* ===== EDIT THESE ===== */
var BRIDE = "Fathimathu Sharafiya";
var GROOM = "Sahal Khalid";
var BRIDE_SHORT = "Sharafiya";
var GROOM_SHORT = "Sahal";
var WEDDING = "2026-12-27T11:30:00+05:30";
var EVENT_HOURS = 3;            // 11:30 AM -> 2:30 PM IST (calendar end time)
var VENUE_ADDRESS = "Nakshathra Convention Centre, Kadathy, Muvattupuzha";
var DATE_TEXT = "";

/* ===== SHARED WISHES BOX (Firebase Firestore) =====
   Fill these two values to make wishes visible to every visitor.
   Leave them empty and the box runs in LOCAL DEMO MODE: wishes stay on the
   visitor's own device only (and the page says so). See README.md. */
var FIREBASE_API_KEY = "";
var FIREBASE_PROJECT_ID = "";
/* ====================== */
(function(){
  var names = GROOM_SHORT + " & " + BRIDE_SHORT; var full = GROOM + " & " + BRIDE;
  document.querySelectorAll("[data-full]").forEach(function(e){e.textContent=full});
  document.querySelectorAll("[data-names]").forEach(function(e){e.textContent=names});
  var n1 = document.querySelector("[data-n1]");
  var n2 = document.querySelector("[data-n2]");
  if(n1) n1.textContent = GROOM_SHORT;
  if(n2) n2.textContent = BRIDE_SHORT;
  if(DATE_TEXT) document.querySelector("[data-date]").textContent = DATE_TEXT;
  document.title = names + " – Nikkah Invitation";

  var env = document.getElementById("env");
  var music = document.getElementById("bgMusic");
  function openEnv(){
    env.classList.add("open");
    document.body.style.overflow="";
    if(music){music.play().catch(function(){});}
  }
  document.body.style.overflow="hidden";
  env.addEventListener("click",openEnv);
  env.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")openEnv()});


  var cd = document.querySelectorAll("#cd b");
  function tick(){
    if(!WEDDING) return;
    var d = new Date(WEDDING) - new Date();
    if(d<0) d=0;
    var v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];
    v.forEach(function(x,i){cd[i].textContent=String(x).padStart(2,"0")});
    var sb=cd[3];if(sb.dataset.s!==String(v[3])){sb.dataset.s=String(v[3]);sb.classList.remove("pop");void sb.offsetWidth;sb.classList.add("pop")}
  }
  tick(); setInterval(tick,1000);

  var io = new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add("in")})},{threshold:.15});
  document.querySelectorAll(".fade").forEach(function(e){io.observe(e)});

  (function(){
    /* Calendar month is derived from WEDDING (IST wall-clock fields are read from the ISO string,
       so the grid is identical no matter which timezone the guest's phone is in). */
    var m=WEDDING.match(/^(\d{4})-(\d{2})-(\d{2})/), Y=+m[1], M=+m[2]-1, D=+m[3];
    var g=document.getElementById("calg"),H="";
    ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(function(d){H+='<div class="h">'+d+'</div>'});
    var first=new Date(Date.UTC(Y,M,1)).getUTCDay(), n=new Date(Date.UTC(Y,M+1,0)).getUTCDate();
    for(var i=0;i<first;i++)H+='<div></div>';
    for(var d=1;d<=n;d++)H+='<div><div class="x'+(d===D?' on':'')+'">'+d+'</div></div>';
    g.innerHTML=H;

    function ics(t){return new Date(t).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}
    var start=new Date(WEDDING), end=new Date(start.getTime()+EVENT_HOURS*36e5);
    document.getElementById("addcal").href="https://calendar.google.com/calendar/render?action=TEMPLATE"
      +"&text="+encodeURIComponent(names+" – Nikkah")
      +"&dates="+ics(start)+"/"+ics(end)
      +"&ctz="+encodeURIComponent("Asia/Kolkata")
      +"&details="+encodeURIComponent("Nikkah ceremony of "+GROOM+" and "+BRIDE+".")
      +"&location="+encodeURIComponent(VENUE_ADDRESS);

    var c2=document.getElementById("cd2");
    function t2(){var d=new Date(WEDDING)-new Date();if(d<0)d=0;c2.innerHTML=Math.floor(d/864e5)+" days "+Math.floor(d/36e5)%24+" hours "+Math.floor(d/6e4)%60+" min <span class=\"sec\">"+Math.floor(d/1e3)%60+" sec</span>"}
    t2();setInterval(t2,1000);
  })();

  /* ---------- Wishes box ---------- */
  var wl=document.getElementById("wl"), stat=document.getElementById("wstat"), note=document.getElementById("wnote");
  var nameEl=document.getElementById("wn"), msgEl=document.getElementById("wm"), btn=document.getElementById("wsend");
  var LK="wishes_local";
  var SHARED=!!(FIREBASE_API_KEY && FIREBASE_PROJECT_ID);
  var FS=SHARED?"https://firestore.googleapis.com/v1/projects/"+encodeURIComponent(FIREBASE_PROJECT_ID)+"/databases/(default)/documents":"";
  var sending=false, lastSig="", lastAt=0;

  function setStat(t,err){stat.textContent=t||"";stat.className="wstat"+(err?" err":"")}
  function show(items){ /* textContent only: wishes are never parsed as HTML */
    wl.innerHTML="";
    items.forEach(function(w){var d=document.createElement("div");d.className="wish";var b=document.createElement("b");b.textContent=w.name;var p=document.createElement("p");p.textContent=w.msg;d.appendChild(b);d.appendChild(p);wl.appendChild(d)});
  }
  function local(){try{return JSON.parse(localStorage.getItem(LK)||"[]")}catch(e){return[]}}
  function clean(s,max){return String(s||"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim().slice(0,max)}

  function loadShared(){
    return fetch(FS+":runQuery?key="+encodeURIComponent(FIREBASE_API_KEY),{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({structuredQuery:{from:[{collectionId:"wishes"}],orderBy:[{field:{fieldPath:"t"},direction:"DESCENDING"}],limit:100}})})
    .then(function(r){if(!r.ok)throw new Error("load "+r.status);return r.json()})
    .then(function(rows){
      show(rows.filter(function(r){return r.document}).map(function(r){var f=r.document.fields||{};return{name:clean((f.name||{}).stringValue,60),msg:clean((f.msg||{}).stringValue,400)}}));
    });
  }
  function saveShared(w){
    return fetch(FS+"/wishes?key="+encodeURIComponent(FIREBASE_API_KEY),{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({fields:{name:{stringValue:w.name},msg:{stringValue:w.msg},t:{integerValue:String(w.t)}}})})
    .then(function(r){if(!r.ok)throw new Error("save "+r.status)});
  }

  if(SHARED){
    loadShared().catch(function(){setStat("Couldn't load wishes right now.",true)});
    setInterval(function(){if(!document.hidden)loadShared().catch(function(){})},30000);
  }else{
    note.hidden=false;
    note.textContent="Demo mode: wishes are saved on this device only and are not shared with other guests.";
    show(local());
  }

  btn.addEventListener("click",function(){
    if(sending)return;
    var name=clean(nameEl.value,60), msg=clean(msgEl.value,400);
    if(!name){setStat("Please enter your name.",true);nameEl.focus();return}
    if(!msg){setStat("Please write your wishes.",true);msgEl.focus();return}
    var sig=name.toLowerCase()+"|"+msg.toLowerCase(), now=Date.now();
    if(sig===lastSig&&now-lastAt<60000){setStat("This wish was already sent. Thank you!");return}
    var w={name:name,msg:msg,t:now};
    sending=true;btn.disabled=true;setStat("Sending…");
    var job;
    if(SHARED){job=saveShared(w).then(function(){return loadShared().catch(function(){})})}
    else{job=new Promise(function(res,rej){var a=local();a.unshift(w);try{localStorage.setItem(LK,JSON.stringify(a.slice(0,100)))}catch(e){return rej(e)}show(a);res()})}
    job.then(function(){
      lastSig=sig;lastAt=Date.now();msgEl.value="";
      setStat(SHARED?"Thank you! Your wishes have been sent.":"Saved on this device (demo mode).");
    }).catch(function(){
      setStat("Sorry, your wishes couldn't be sent. Please try again.",true);
    }).then(function(){sending=false;btn.disabled=false});
  });
})();
