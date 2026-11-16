"""Builds the D9 content pages (English) into me-and-you-tours/d9/."""
OUT = "/home/claude/me-and-you-tours/d9/"

def page(fn, title, desc, active, body, script, data=False):
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title} · D9 Luxury Suites</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0f1d26">
<link rel="icon" href="img/favicon.png"><link rel="apple-touch-icon" href="img/apple-touch-icon.png"><link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/d9.css"><link rel="stylesheet" href="assets/pages.css">
</head>
<body>
<main id="main">
{body}
</main>
<script src="assets/config.js"></script>
{'<script src="assets/experiences.js"></script>' if data else ''}
<script src="assets/site.js"></script>
<script>
(function(){{var D=window.D9,$=D.$,$$=D.$$,esc=D.esc;D.chrome("{active}");
{script}
}})();
</script>
</body>
</html>
"""
    open(OUT + fn, "w").write(html)

TODAY = "2026-11-16"

# ---------------------------------------------------------------- 1. Experiences catalogue
page("experiences.html", "Experiences", "Private boat days, snorkelling, desert evenings and day trips from Hurghada, arranged for D9 guests.", "experiences.html", """
<section class="pg-hero" style="min-height:min(56vh,480px)"><img src="img/x/giftunview.webp" alt="">
 <div class="wrap"><p class="eyebrow">D9 Experiences</p><h1>Explore the Red Sea, your way</h1>
 <p>Hand-picked private experiences from Hurghada. Choose what you like — we check the date and send you a clear offer before anything is booked.</p></div></section>
<section class="sec"><div class="wrap">
 <div class="fbar" id="cats" role="tablist" aria-label="Type of experience"></div>
 <form class="filters" id="flt" onsubmit="return false">
  <label>Destination<select class="inp" name="dest"><option value="">All destinations</option></select></label>
  <label>Date<input class="inp" type="date" name="date"></label>
  <label>Travellers<select class="inp" name="people"><option value="">Any</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>8</option><option>10</option><option>12</option></select></label>
  <label>Duration<select class="inp" name="dur"><option value="">Any length</option><option value="300">Up to 5 hours</option><option value="540">Up to 9 hours</option><option value="9999">Full day or longer</option></select></label>
  <label>Suitable for<select class="inp" name="age"><option value="">Everyone</option><option value="family">Families with children</option><option value="adults">Adults</option></select></label>
  <label>Price<select class="inp" name="price"><option value="">All</option><option value="request">Price on request</option></select></label>
 </form>
 <p class="fcount" id="count" aria-live="polite"></p>
 <div class="xgrid" id="grid"></div>
 <div class="note" style="margin-top:26px">All experiences are <b>private</b> (only your party) and are carried out by a licensed Egyptian tour operator. <b>Availability and price are confirmed personally</b> for your date — nothing is booked or charged until you accept the offer.</div>
</div></section>
<section class="sec alt"><div class="wrap split"><div><p class="eyebrow">Not sure what to choose?</p><h2>Ask our Travel Concierge</h2><p class="lead">Tell us your dates, budget and interests. We put together a personal plan for your stay.</p><a class="btn btn-dark" href="concierge.html">Plan my days</a></div><img src="img/x/jetty.webp" alt="" loading="lazy"></div></section>
""", """
var X=window.D9X,f=$("#flt"),cat=D.q.get("cat")||"";
var dests=[];X.forEach(function(x){if(dests.indexOf(x.destination)<0)dests.push(x.destination);});
f.dest.innerHTML+=dests.map(function(d){return '<option>'+esc(d)+'</option>';}).join('');
var cats=[["","All"]].concat(Object.keys(D.CATS).filter(function(k){return X.some(function(x){return x.cat===k;});}).map(function(k){return [k,D.CATS[k]];})).concat([["family","Family Activities"]]);
function drawCats(){$("#cats").innerHTML=cats.map(function(c){return '<button type="button" role="tab" class="chip'+(c[0]===cat?' on':'')+'" aria-selected="'+(c[0]===cat)+'" data-c="'+c[0]+'">'+esc(c[1])+'</button>';}).join('');
 $$("#cats .chip").forEach(function(b){b.onclick=function(){cat=b.getAttribute("data-c");drawCats();draw();history.replaceState(null,"",cat?"?cat="+cat:"experiences.html");};});}
var today=new Date().toISOString().slice(0,10);f.date.min=today;
if(D.q.get("dest"))f.dest.value=D.q.get("dest");
function draw(){var p=+f.people.value||0,du=+f.dur.value||0;
 var r=X.filter(function(x){
  if(cat==="family"){if(!x.family)return false;}else if(cat&&x.cat!==cat)return false;
  if(f.dest.value&&x.destination!==f.dest.value)return false;
  if(p&&p>x.maxGroup)return false;
  if(du===300&&x.minutes>300)return false; if(du===540&&x.minutes>540)return false; if(du===9999&&x.minutes<600)return false;
  if(f.age.value==="family"&&!x.family)return false;
  return true;});
 $("#count").textContent=r.length+(r.length===1?" experience":" experiences");
 $("#grid").innerHTML=r.length?r.map(function(x){var c=D.card(x);return f.date.value||p?c.replace('?x='+x.slug,'?x='+x.slug+(f.date.value?'&date='+f.date.value:'')+(p?'&people='+p:'')):c;}).join(''):'<div class="empty">No experiences match these filters. <a href="concierge.html">Ask the concierge</a> — we can often arrange something similar.</div>';
 D.reveal($("#grid"));}
$$("#flt select,#flt input").forEach(function(el){el.onchange=draw;});
drawCats();draw();
""", data=True)

# ---------------------------------------------------------------- 2. Experience detail
page("experience.html", "Experience", "Private experience in and around Hurghada for D9 guests.", "experiences.html", """
<div id="x"></div>
""", """
var X=window.D9X,x=X.filter(function(i){return i.slug===D.q.get("x");})[0];
if(!x){$("#x").innerHTML='<section class="pg-head"><div class="wrap"><h1>Experience not found</h1><p>This experience is no longer available.</p><a class="btn btn-gold" href="experiences.html">See all experiences</a></div></section>';return;}
document.title=x.title+" · D9 Luxury Suites";
function li(a){return a.map(function(s){return '<li>'+esc(s)+'</li>';}).join('');}
var today=new Date().toISOString().slice(0,10);
var parts=x.parties.map(function(p){return {COUPLE:"Couples",FAMILY:"Families",FRIENDS:"Friends",VIP:"VIP guests"}[p]||p;}).join(", ");
$("#x").innerHTML='<section class="pg-head"><div class="wrap"><p class="eyebrow"><a href="experiences.html" style="color:inherit;text-decoration:none">Experiences</a> · '+esc(D.CATS[x.cat])+'</p><h1>'+esc(x.title)+'</h1><p>'+esc(x.short)+'</p></div></section>'+
 '<section class="sec"><div class="wrap"><div class="gal rv">'+x.photos.slice(0,3).map(function(p,i){return '<img src="'+(i?D.small(p):p)+'" alt="'+esc(x.title)+'">';}).join('')+'</div>'+
 '<div class="facts rv"><div class="fact"><span>Duration</span><b>'+D.dur(x.minutes)+'</b></div><div class="fact"><span>Starts from</span><b>'+esc(x.start.join(" · "))+'</b></div><div class="fact"><span>Ends</span><b>'+esc(x.end)+'</b></div><div class="fact"><span>Group</span><b>Private · up to '+x.maxGroup+'</b></div><div class="fact"><span>Suitable for</span><b>'+(x.family?'All ages':'Adults')+(x.minAge?' (from '+x.minAge+')':'')+'</b></div><div class="fact"><span>Price</span><b>On request</b></div></div>'+
 '<div class="dgrid"><div>'+
 '<div class="blk rv"><h2>About this experience</h2>'+x.body.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+(x.highlights.length?'<ul class="tick">'+li(x.highlights)+'</ul>':'')+'</div>'+
 '<div class="blk rv"><h3>What is private — and what is shared</h3><p style="margin:0">'+esc(x.scope)+'</p></div>'+
 '<div class="blk rv"><h3>Included</h3><ul class="tick">'+li(x.included)+'</ul><h3 style="margin-top:16px">Not included / possible extra costs</h3><ul class="cross">'+li(x.notIncluded.concat(x.extras.map(function(e){return e+" (supplement, shown in your offer)";})))+'</ul></div>'+
 '<div class="blk rv"><h3>Who it suits</h3><p>'+esc(parts)+'. '+esc(x.access)+'</p><h3>Dates</h3><p style="margin:0">Dates are confirmed per request'+(x.times.length?' — usual start time '+esc(x.times.join(", "))+' (Cairo time)':'')+'. We never show availability we have not checked.</p></div>'+
 '<div class="blk rv"><h3>Safety</h3><p style="margin:0">'+esc(x.safety)+'</p></div>'+
 '<div class="blk rv"><h3>Cancellation</h3><p style="margin:0">The exact cancellation terms are stated in your offer, <b>before</b> you pay. Changes because of weather or sea conditions are decided by the operator for your safety; you then choose a new date or a refund as stated in the offer.</p></div>'+
 '<div class="blk rv"><h3>Who carries it out</h3><p style="margin:0">Arranged with <b>Me & You Tours Egypt</b> and carried out by a licensed Egyptian tour operator. The operator is responsible for the activity, its licences and insurance; the operator\\'s name is in your offer.</p></div>'+
 '</div><aside class="side"><form class="bookbox" id="rq"><h3>Request this experience</h3><p class="small muted">Free and without obligation. You receive an offer with the final price and conditions.</p>'+
 '<label>Preferred date<input class="inp" type="date" name="date" min="'+today+'" required></label>'+
 '<label>Adults<select class="inp" name="adults">'+[1,2,3,4,5,6,7,8,9,10].map(function(n){return '<option'+(n===2?' selected':'')+'>'+n+'</option>';}).join('')+'</select></label>'+
 '<label>Children<select class="inp" name="kids">'+[0,1,2,3,4,5,6].map(function(n){return '<option>'+n+'</option>';}).join('')+'</select></label>'+
 '<label>Your name<input class="inp" name="name" autocomplete="name" required></label>'+
 '<label>Staying at<select class="inp" name="stay"><option>D9 Luxury Suites</option><option>Other accommodation</option></select></label>'+
 '<label>Message (optional)<textarea class="inp" name="msg" style="min-height:70px"></textarea></label>'+
 '<p class="err" id="er"></p><button class="btn btn-gold">Send request via WhatsApp</button>'+
 '<a class="btn btn-ghost" style="color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4);margin-top:10px" target="_blank" rel="noopener" href="'+D.MYT+'#/x/'+x.slug+'">View on Me & You Tours Egypt ↗</a>'+
 '<p class="small muted" style="margin:12px 0 0">You start the conversation yourself; we only use your details to answer this request.</p></form></aside></div></div></section>'+
 '<section class="sec alt"><div class="wrap"><h2>You may also like</h2><div class="xgrid" id="more"></div></div></section>';
var f=$("#rq");if(D.q.get("date")&&D.q.get("date")>=today)f.date.value=D.q.get("date");if(D.q.get("people"))f.adults.value=Math.min(10,+D.q.get("people"));
function txt(){return "Hello D9 Luxury Suites, I would like to request: "+x.title+"\\n• Date: "+(f.date.value||"flexible")+"\\n• Adults: "+f.adults.value+", children: "+f.kids.value+"\\n• Name: "+f.name.value.trim()+"\\n• Staying at: "+f.stay.value+(f.msg.value.trim()?"\\n• "+f.msg.value.trim():"");}
D.setWa("Hello D9 Luxury Suites, I have a question about: "+x.title);
f.onsubmit=function(e){e.preventDefault();if(!f.date.value||!f.name.value.trim()){$("#er").textContent="Please choose a date and fill in your name.";return;}$("#er").textContent="";
 D.request("experience_request",f.name.value.trim(),x.title+" · "+f.date.value+" · "+f.adults.value+" adults, "+f.kids.value+" children · "+f.stay.value+(f.msg.value.trim()?" · "+f.msg.value.trim():""));
 window.open(D.wa(txt()),"_blank","noopener");D.toast("Your request is ready in WhatsApp");};
$("#more").innerHTML=X.filter(function(i){return i.slug!==x.slug;}).sort(function(a,b){return (b.cat===x.cat)-(a.cat===x.cat);}).slice(0,3).map(D.card).join('');D.reveal(document);
""", data=True)

# ---------------------------------------------------------------- 3. Destination: Hurghada
page("hurghada.html", "Hurghada", "Why Hurghada: Red Sea islands, reefs, desert and easy day trips — with D9 as your base.", "hurghada.html", """
<section class="pg-hero"><img src="img/x/orangebay.webp" alt="Orange Bay, Giftun Islands">
 <div class="wrap"><p class="eyebrow">Destination</p><h1>Hurghada & the Red Sea</h1><p>Turquoise water, coral reefs and desert mountains — all within a short drive of your suite.</p>
 <a class="btn btn-gold" href="experiences.html?dest=Hurghada">See experiences in Hurghada</a></div></section>
<section class="sec"><div class="wrap">
 <div class="split"><div class="rv"><p class="eyebrow">Why Hurghada</p><h2>Sea, desert and history in one stay</h2>
 <p class="lead">Hurghada sits on Egypt's Red Sea coast. Boats leave from the city's marinas to the protected Giftun Islands; the Eastern Desert begins right behind the town; and Luxor's temples can be reached on a long day trip.</p>
 <ul class="tick"><li>Island days and snorkelling on the reefs</li><li>Desert evenings with the Bedouin</li><li>Day trips to El Gouna, Luxor and Cairo</li><li>Sunny weather most of the year</li></ul></div>
 <img class="rv" src="img/x/dolphins2.webp" alt="Dolphins in the Red Sea" loading="lazy"></div></div></section>
<section class="sec alt"><div class="wrap"><p class="eyebrow">Experiences</p><h2>What you can do here</h2><div class="xgrid" id="grid"></div></div></section>
<section class="sec"><div class="wrap"><p class="eyebrow">Practical</p><h2>Good to know</h2>
 <div class="facts">
  <div class="fact rv"><span>Airport</span><b>Hurghada International (HRG) — about 3.5 km from D9 in a straight line</b></div>
  <div class="fact rv"><span>Flight from Amsterdam</span><b>About 5 hours, direct</b></div>
  <div class="fact rv"><span>Time zone</span><b>Cairo time (EET/EEST)</b></div>
  <div class="fact rv"><span>Visa</span><b>Most EU visitors buy a visa on arrival (about USD 30) — check your own country's rules</b></div>
  <div class="fact rv"><span>Currency</span><b>Egyptian pound (EGP); cards accepted in many places, carry some cash</b></div>
  <div class="fact rv"><span>Emergency</span><b>Ambulance 123 · Police 122 · Tourist police 126</b></div>
 </div>
 <div class="blk rv"><h3>Travel times by road (indicative)</h3><p style="margin:0">Luxor about 4 h · Cairo about 5–7 h. Exact times depend on traffic, stops and checkpoints and are confirmed with each trip.</p></div>
 <div class="note rv">Travel advice can change. Before you travel, check your government's travel advice for Egypt.</div>
</div></section>
<section class="sec alt"><div class="wrap split"><img class="rv" src="img/x/jetty.webp" alt="" loading="lazy"><div class="rv"><p class="eyebrow">Your base</p><h2>Stay at D9, explore with ease</h2><p class="lead">Suites around a pool and garden, a personal host on WhatsApp and help with every excursion you want to take.</p><a class="btn btn-dark" href="book.html">Request your stay</a> <a class="btn btn-ghost" href="concierge.html">Plan my days</a></div></div></section>
""", """
$("#grid").innerHTML=window.D9X.filter(function(x){return x.destination==="Hurghada"||x.destination==="El Gouna";}).map(D.card).join('');D.reveal(document);
D.setWa("Hello D9 Luxury Suites, I am planning a trip to Hurghada and have a question.");
""", data=True)

# ---------------------------------------------------------------- 4. Travel Concierge
page("concierge.html", "Travel Concierge", "Personal help with excursions, restaurants, transfers and planning your days in Hurghada.", "concierge.html", """
<section class="pg-hero" style="min-height:min(54vh,460px)"><img src="img/x/deck.webp" alt="">
 <div class="wrap"><p class="eyebrow">Travel Concierge</p><h1>Tell us your wishes. We plan the rest.</h1><p>One request, one personal proposal — excursions, restaurants, transfers and tips that fit your budget and your people.</p></div></section>
<section class="sec"><div class="wrap">
 <ol class="steps"><li class="rv"><b>Share your wishes</b><br><span class="muted">Dates, people, budget and interests.</span></li><li class="rv"><b>We prepare a proposal</b><br><span class="muted">Our team checks dates and prices with licensed partners.</span></li><li class="rv"><b>You decide</b><br><span class="muted">Nothing is booked until you say yes.</span></li><li class="rv"><b>Enjoy</b><br><span class="muted">Your confirmed plans appear in My D9 Stay.</span></li></ol>
 <form class="blk" id="cf" style="margin-top:26px"><h2>Your concierge request</h2>
  <div class="formgrid">
   <label>Arrival<input class="inp" type="date" name="in" required></label>
   <label>Departure<input class="inp" type="date" name="out" required></label>
   <label>Adults<select class="inp" name="adults"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>8</option><option>10</option></select></label>
   <label>Children<select class="inp" name="kids"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
   <label>Where are you staying?<select class="inp" name="stay"><option>D9 Luxury Suites</option><option>Not booked yet</option><option>Other accommodation</option></select></label>
   <label>Budget for activities (per person)<select class="inp" name="budget"><option>Flexible</option><option>Up to €75</option><option>€75 – €150</option><option>€150 – €300</option><option>€300+</option></select></label>
   <div class="full"><b style="display:block;margin-bottom:8px">Interests</b><div class="checks" id="ints"></div></div>
   <div class="full"><b style="display:block;margin-bottom:8px">I would like help with</b><div class="checks" id="helps"></div></div>
   <label class="full"><span><input type="checkbox" name="priv" checked style="width:18px;height:18px;vertical-align:-3px;accent-color:var(--sea)"> I prefer private activities (only our party)</span></label>
   <label class="full">Special wishes<textarea class="inp" name="wish" placeholder="Birthday, anniversary, mobility needs, food preferences…"></textarea></label>
   <label>Your name<input class="inp" name="name" autocomplete="name" required></label>
   <label>Email or phone<input class="inp" name="contact" required></label>
  </div>
  <p class="err" id="er"></p>
  <button class="btn btn-gold">Send to the concierge via WhatsApp</button>
  <p class="small muted" style="margin:12px 0 0">We use your details only to prepare your proposal. You start the WhatsApp conversation yourself.</p>
 </form>
</div></section>
""", """
var INT=["Island & beach days","Snorkelling","Diving","Desert","History & temples","Food & restaurants","Relaxing","Family fun","Photography","Nightlife"];
var HELP=["Choosing excursions","A day-by-day plan","Restaurant tips","Airport transfer","Day trip to Luxor or Cairo","Surprise or celebration","Practical tips"];
function chk(id,a,pre){$(id).innerHTML=a.map(function(s){return '<label><input type="checkbox" value="'+esc(s)+'"'+(pre&&pre.indexOf(s)>=0?' checked':'')+'> '+esc(s)+'</label>';}).join('');}
chk("#ints",INT);chk("#helps",HELP,["Choosing excursions"]);
var f=$("#cf"),today=new Date().toISOString().slice(0,10);f["in"].min=today;f.out.min=today;f["in"].onchange=function(){f.out.min=f["in"].value||today;};
function picked(id){return $$(id+" input:checked").map(function(i){return i.value;});}
f.onsubmit=function(e){e.preventDefault();
 if(!f["in"].value||!f.out.value||!f.name.value.trim()||!f.contact.value.trim()){$("#er").textContent="Please fill in your dates, name and contact details.";return;}
 if(f.out.value<=f["in"].value){$("#er").textContent="Departure must be after arrival.";return;}$("#er").textContent="";
 var lines=["Dates: "+f["in"].value+" → "+f.out.value,"People: "+f.adults.value+" adults, "+f.kids.value+" children","Staying at: "+f.stay.value,"Budget p.p.: "+f.budget.value,"Interests: "+(picked("#ints").join(", ")||"open"),"Help with: "+(picked("#helps").join(", ")||"general advice"),"Private activities: "+(f.priv.checked?"yes":"no preference")];
 if(f.wish.value.trim())lines.push("Wishes: "+f.wish.value.trim());
 D.request("concierge",f.name.value.trim(),lines.join(" · ")+" · contact: "+f.contact.value.trim(),{checkin:f["in"].value,checkout:f.out.value});
 window.open(D.wa("Hello D9 Luxury Suites, I would like help from the Travel Concierge.\\n• "+lines.join("\\n• ")+"\\n• Name: "+f.name.value.trim()+"\\n• Contact: "+f.contact.value.trim()),"_blank","noopener");
 D.toast("Your concierge request is ready in WhatsApp");};
D.setWa("Hello D9 Luxury Suites, I would like personal travel advice.");
""")

# ---------------------------------------------------------------- 5. Suites (detail)
page("suite.html", "Suites", "Camellia studio, Lotus 2-bedroom and Lily 3-bedroom apartment at D9 Luxury Suites, Hurghada.", "suite.html", """
<section class="pg-head"><div class="wrap"><p class="eyebrow">Stay</p><h1>Suites & apartments</h1><p>From a cosy studio for two to an apartment for the whole family — around a shared pool and garden.</p>
<div class="fbar" id="tabs" style="margin-top:18px"></div></div></section>
<section class="sec"><div class="wrap" id="s"></div></section>
""", """
var U={camellia:{n:"Camellia Studio",k:"Studio",d:"A cosy studio for up to 3 guests with one bed and a private bathroom — ideal for couples.",beds:"1 bed",guests:"Up to 3",l:D.listings.camellia},
 lotus:{n:"Lotus · 2-bedroom apartment",k:"2 bedrooms",d:"Two bedrooms, three beds and a private balcony, with access to the shared pool.",beds:"3 beds",guests:"Ask us",l:D.listings.lotus},
 lily:{n:"Lily · 3-bedroom apartment",k:"3 bedrooms",d:"Space for families and friends: three bedrooms, four beds and room to cook and dine together.",beds:"4 beds · 1 bathroom",guests:"Ask us",l:D.listings.lily}};
var cur=U[D.q.get("u")]?D.q.get("u"):"camellia";
function draw(){var u=U[cur];
 $("#tabs").innerHTML=Object.keys(U).map(function(k){return '<button class="chip'+(k===cur?' on':'')+'" data-u="'+k+'" style="'+(k===cur?'':'background:transparent;color:#fff;border-color:rgba(255,255,255,.35)')+'">'+esc(U[k].n.split(" ·")[0])+'</button>';}).join('');
 $$("#tabs .chip").forEach(function(b){b.onclick=function(){cur=b.getAttribute("data-u");history.replaceState(null,"","?u="+cur);draw();};});
 $("#s").innerHTML='<div class="dgrid"><div><div class="blk"><p class="eyebrow">'+esc(u.k)+'</p><h2>'+esc(u.n)+'</h2><p class="lead">'+esc(u.d)+'</p>'+
 '<div class="facts"><div class="fact"><span>Beds</span><b>'+esc(u.beds)+'</b></div><div class="fact"><span>Guests</span><b>'+esc(u.guests)+'</b></div><div class="fact"><span>Check-in</span><b>From '+D.checkIn+'</b></div><div class="fact"><span>Check-out</span><b>Until '+D.checkOut+'</b></div></div></div>'+
 '<div class="blk"><h3>In and around your suite</h3><ul class="tick"><li>Air-conditioning</li><li>Kitchen facilities</li><li>Free Wi-Fi</li><li>Shared outdoor pool, garden and terrace</li><li>Personal host on WhatsApp</li></ul></div>'+
 '<div class="blk"><h3>Make it special</h3><p>Add a Romantic Experience, Birthday Experience, VIP Arrival or comfort upgrades (breakfast in your suite, early check-in or late check-out when available) to your request. Prices on request.</p></div>'+
 '<div class="note">Photos of this suite are being prepared. Until then you can see the suite and its reviews on <a target="_blank" rel="noopener" href="'+u.l+'">Airbnb ↗</a>.</div></div>'+
 '<aside class="side"><div class="bookbox"><h3>Book '+esc(u.n.split(" ·")[0])+' direct</h3><p class="muted small">We confirm availability and your rate personally. Nothing is booked or charged until you confirm.</p><a class="btn btn-gold" href="book.html?suite='+encodeURIComponent(u.n)+'">Request this suite</a><a class="btn btn-wa" style="margin-top:10px" target="_blank" rel="noopener" href="'+D.wa("Hello D9 Luxury Suites, I have a question about "+u.n+".")+'">Ask on WhatsApp</a></div></aside></div>';
 D.setWa("Hello D9 Luxury Suites, I have a question about "+u.n+".");}
draw();
""")

# ---------------------------------------------------------------- 6. Booking request
page("book.html", "Booking request", "Send a direct booking request to D9 Luxury Suites, Hurghada.", "book.html", """
<section class="pg-head"><div class="wrap"><p class="eyebrow">Book direct</p><h1>Send a booking request</h1><p>We check availability and send you the price and a secure payment link. Nothing is booked or charged until you confirm.</p></div></section>
<section class="sec"><div class="wrap"><div class="dgrid"><form class="blk" id="bf"><div class="formgrid">
 <label>Suite<select class="inp" name="suite"><option>No preference</option><option>Camellia Studio</option><option>Lotus · 2-bedroom apartment</option><option>Lily · 3-bedroom apartment</option></select></label>
 <label>Guests<select class="inp" name="guests"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select></label>
 <label>Check-in<input class="inp" type="date" name="in" required></label>
 <label>Check-out<input class="inp" type="date" name="out" required></label>
 <div class="full"><b style="display:block;margin-bottom:8px">Extras (price on request)</b><div class="checks" id="ex"></div></div>
 <label>Your name<input class="inp" name="name" autocomplete="name" required></label>
 <label>Email or phone<input class="inp" name="contact" required></label>
 <label class="full">Message (optional)<textarea class="inp" name="msg"></textarea></label>
 </div><p class="err" id="er"></p><button class="btn btn-gold">Send request via WhatsApp</button></form>
 <aside class="side"><div class="blk"><h3>How it works</h3><ol style="margin:0;padding-inline-start:20px"><li>You send this request.</li><li>We check the dates and reply with your rate.</li><li>You confirm and pay through a secure payment link.</li><li>You receive your personal My D9 Stay page.</li></ol></div>
 <div class="blk"><h3>Good to know</h3><ul style="margin:0;padding-inline-start:20px"><li>Check-in from 14:00, check-out until 12:00</li><li>No pets, no parties or events</li><li>Cancellation terms are stated in your confirmation</li><li>We never ask for card details via WhatsApp or email</li></ul></div></aside></div></div></section>
""", """
var EX=["Romantic Experience","Birthday Experience","VIP Arrival (airport transfer)","Breakfast in the suite","Early check-in / late check-out","Help with excursions"];
$("#ex").innerHTML=EX.map(function(s){return '<label><input type="checkbox" value="'+esc(s)+'"> '+esc(s)+'</label>';}).join('');
var f=$("#bf"),today=new Date().toISOString().slice(0,10);f["in"].min=today;f.out.min=today;f["in"].onchange=function(){f.out.min=f["in"].value||today;};
if(D.q.get("suite"))f.suite.value=D.q.get("suite");
f.onsubmit=function(e){e.preventDefault();var n=f.name.value.trim(),c=f.contact.value.trim();
 if(!n||!c||!f["in"].value||!f.out.value){$("#er").textContent="Please fill in your name, contact details and dates.";return;}
 if(f.out.value<=f["in"].value){$("#er").textContent="Check-out must be after check-in.";return;}$("#er").textContent="";
 var ex=$$("#ex input:checked").map(function(i){return i.value;}),nights=Math.round((Date.parse(f.out.value)-Date.parse(f["in"].value))/864e5);
 var rec={id:D.uid(),created:new Date().toISOString(),type:"booking_request",suite:f.suite.value,checkin:f["in"].value,checkout:f.out.value,nights:nights,guests:f.guests.value,name:n,contact:c,extras:ex,message:f.msg.value.trim(),lang:"en",source:"website"};
 D.store.push("d9_inbox",rec);var mine=D.store.get("d9_my_requests",[]);mine.unshift({id:rec.id,created:rec.created,type:"booking_request",detail:rec.suite+" · "+rec.checkin+" → "+rec.checkout});D.store.set("d9_my_requests",mine);
 window.open(D.wa("Hello D9 Luxury Suites, I would like to request a booking:\\n• Suite: "+f.suite.value+"\\n• Check-in: "+f["in"].value+"\\n• Check-out: "+f.out.value+" ("+nights+" nights)\\n• Guests: "+f.guests.value+"\\n• Name: "+n+"\\n• Contact: "+c+"\\n• Extras: "+(ex.join(", ")||"none")+(rec.message?"\\n• "+rec.message:"")),"_blank","noopener");D.toast("Your request is ready in WhatsApp");};
""")

# ---------------------------------------------------------------- 7. Reviews
page("reviews.html", "Reviews", "Guest reviews of D9 Luxury Suites — with sources and check dates.", "reviews.html", f"""
<section class="pg-head"><div class="wrap"><p class="eyebrow">Reviews</p><h1>What our guests say</h1><p>We only show scores we have checked ourselves, with the source and the date we checked. Read every review on the platform where it was written.</p></div></section>
<section class="sec"><div class="wrap">
 <div class="grid g2">
  <div class="score rv"><b>4.38</b><div><b style="font-family:var(--sans);font-size:1rem;color:var(--ink)">out of 5 · Airbnb</b><br><span class="muted small">Lily · 3-bedroom apartment · 8 reviews · checked {TODAY}</span><br><a class="small" target="_blank" rel="noopener" id="rLily" href="#">Read the reviews on Airbnb ↗</a></div></div>
  <div class="score rv"><b>—</b><div><b style="font-family:var(--sans);font-size:1rem;color:var(--ink)">Booking.com</b><br><span class="muted small">Score to be confirmed from the D9 extranet</span><br><span class="small muted">Shown here as soon as it is verified.</span></div></div>
  <div class="score rv"><b>—</b><div><b style="font-family:var(--sans);font-size:1rem;color:var(--ink)">Lotus & Camellia · Airbnb</b><br><span class="muted small">To be checked</span><br><a class="small" target="_blank" rel="noopener" id="rLotus" href="#">Lotus on Airbnb ↗</a> · <a class="small" target="_blank" rel="noopener" id="rCam" href="#">Camellia on Airbnb ↗</a></div></div>
  <div class="score rv"><b>—</b><div><b style="font-family:var(--sans);font-size:1rem;color:var(--ink)">Google</b><br><span class="muted small">Google Business Profile not yet linked</span></div></div>
 </div>
 <div class="blk rv" style="margin-top:22px"><h2>Guest quotes</h2><p class="muted" style="margin:0">Quotes are added only with the guest's permission, with first name, month of stay and a link to the original review. No quotes have been added yet.</p></div>
 <div class="blk rv"><h3>Stayed with us?</h3><p>We would love to hear how it was — on the platform where you booked, so other travellers can read it too.</p><a class="btn btn-dark btn-sm" href="contact.html">Share feedback with us directly</a></div>
</div></section>
""", """
$("#rLily").href=D.listings.lily;$("#rLotus").href=D.listings.lotus;$("#rCam").href=D.listings.camellia;
""")

# ---------------------------------------------------------------- 8. Contact & support
page("contact.html", "Contact & support", "Contact D9 Luxury Suites by WhatsApp, ask for travel advice or report a problem.", "contact.html", """
<section class="pg-head"><div class="wrap"><p class="eyebrow">Contact & support</p><h1>We are here for you</h1><p>Before, during and after your stay — start a WhatsApp chat or use one of the forms below.</p></div></section>
<section class="sec"><div class="wrap">
 <div class="grid g3">
  <a class="blk rv" style="text-decoration:none;color:inherit" id="c1" target="_blank" rel="noopener"><h3>💬 General question</h3><p class="muted" style="margin:0">Availability, rates, directions.</p></a>
  <a class="blk rv" style="text-decoration:none;color:inherit" href="concierge.html"><h3>🧭 Personal travel advice</h3><p class="muted" style="margin:0">Excursions, restaurants, planning.</p></a>
  <a class="blk rv" style="text-decoration:none;color:inherit" id="c3" target="_blank" rel="noopener"><h3>🔁 Change my booking</h3><p class="muted" style="margin:0">Dates, guests or extras.</p></a>
 </div>
 <form class="blk rv" id="problem" style="margin-top:20px"><h2>Report a problem during your stay</h2><p class="muted">We respond as quickly as possible. For an emergency, call 123 (ambulance) or 122 (police) first.</p>
  <div class="formgrid"><label>Your name<input class="inp" name="name" required></label><label>Suite<select class="inp" name="suite"><option>Camellia Studio</option><option>Lotus · 2-bedroom apartment</option><option>Lily · 3-bedroom apartment</option><option>Other</option></select></label>
  <label>Type<select class="inp" name="type"><option>Air-conditioning</option><option>Wi-Fi</option><option>Water / bathroom</option><option>Cleaning</option><option>Noise</option><option>Safety</option><option>Something else</option></select></label>
  <label>How urgent?<select class="inp" name="urg"><option>Today</option><option>Urgent — now</option><option>When convenient</option></select></label>
  <label class="full">What happened?<textarea class="inp" name="desc" required></textarea></label></div>
  <p class="err" id="er"></p><button class="btn btn-dark">Send via WhatsApp</button></form>
 <div class="blk rv"><h3>Address</h3><p id="ad"></p><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" id="mp">Open in Google Maps ↗</a></div>
</div></section>
""", """
$("#c1").href=D.wa("Hello D9 Luxury Suites, I have a question.");$("#c3").href=D.wa("Hello D9 Luxury Suites, I would like to change my booking.\\n• Name:\\n• Current dates:\\n• Change:");
$("#ad").textContent=D.address;$("#mp").href=D.maps;
var f=$("#problem");f.onsubmit=function(e){e.preventDefault();if(!f.name.value.trim()||!f.desc.value.trim()){$("#er").textContent="Please fill in your name and what happened.";return;}$("#er").textContent="";
 var d=f.type.value+" · "+f.urg.value+" · "+f.desc.value.trim();D.request("problem",f.name.value.trim(),d,{suite:f.suite.value});
 window.open(D.wa("Hello D9 Luxury Suites, I want to report a problem.\\n• Name: "+f.name.value.trim()+"\\n• Suite: "+f.suite.value+"\\n• Type: "+f.type.value+" ("+f.urg.value+")\\n• "+f.desc.value.trim()),"_blank","noopener");D.toast("Your message is ready in WhatsApp");};
if(location.hash==="#problem")setTimeout(function(){f.scrollIntoView();},300);
""")

# ---------------------------------------------------------------- 9. About
page("about.html", "About D9", "About D9 Luxury Suites in Hurghada: the suites, facilities and services.", "about.html", """
<section class="pg-head"><div class="wrap"><p class="eyebrow">About D9</p><h1>More than a stay</h1><p>D9 Luxury Suites is a small residence of suites and apartments around a pool and garden in the Mubarak 6 area of Hurghada.</p></div></section>
<section class="sec"><div class="wrap">
 <div class="grid g2">
  <div class="blk rv"><h2>The accommodation</h2><p>Three bookable units on our website — the Camellia studio, the Lotus 2-bedroom and the Lily 3-bedroom apartment — with more units available on request.</p><a href="suite.html">See the suites →</a></div>
  <div class="blk rv"><h2>Facilities</h2><ul class="tick"><li>Shared outdoor pool, garden and terrace</li><li>Air-conditioning and free Wi-Fi</li><li>Kitchen facilities in the apartments</li><li>Check-in 14:00 – 00:00, check-out until 12:00</li></ul></div>
  <div class="blk rv"><h2>The guest experience</h2><p>A personal host on WhatsApp, a personal My D9 Stay page with your stay details, and help with excursions through our partner Me & You Tours Egypt.</p></div>
  <div class="blk rv"><h2>Services on request</h2><ul class="tick"><li>Romantic and Birthday Experiences</li><li>VIP Arrival with airport transfer</li><li>Breakfast in the suite, early check-in / late check-out when available</li><li>Personal Travel Concierge</li></ul></div>
 </div>
 <div class="blk rv"><h2>Contact</h2><p id="ad"></p><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" id="wa">Chat on WhatsApp</a> <a class="btn btn-ghost btn-sm" href="contact.html">All contact options</a></div>
</div></section>
""", """
$("#ad").textContent=D.address;$("#wa").href=D.wa("Hello D9 Luxury Suites, I have a question.");
""")
print("pages built")
