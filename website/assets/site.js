/* Me & You Tours Egypt — interactions. No trackers, no external requests. */
(() => {
  "use strict";
  const T = window.T || {};
  const CFG = Object.assign({ whatsapp: "", email: "", instagram: "meandyoutoursegypt" }, window.MYT_CONFIG || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rtl = document.documentElement.dir === "rtl";

  /* ---------- toast ---------- */
  const toast = $(".toast");
  let tt;
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 4200); }

  /* ---------- header / bars ---------- */
  const hdr = $(".hdr"), mbar = $(".mbar"), light = document.body.classList.contains("page-light");
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    if (hdr) {
      hdr.classList.toggle("solid", y > 30 || light);
      hdr.classList.toggle("hide", y > 500 && y > lastY + 4 && !document.body.classList.contains("lock"));
      if (y < lastY - 4) hdr.classList.remove("hide");
    }
    if (mbar) mbar.classList.toggle("show", y > 260 || light);
    lastY = y;
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- menu ---------- */
  const mm = $(".mm"), burger = $(".burger");
  function menu(open) {
    if (!mm) return;
    mm.classList.toggle("open", open); mm.setAttribute("aria-hidden", String(!open));
    burger && burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("lock", open); document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => $(".close", mm).focus(), 300); else burger && burger.focus();
  }
  burger && burger.addEventListener("click", () => menu(true));
  mm && $(".close", mm).addEventListener("click", () => menu(false));
  mm && $$("nav a", mm).forEach(a => a.addEventListener("click", () => menu(false)));

  /* ---------- language dropdown ---------- */
  $$(".lang").forEach(l => {
    const b = $("button", l);
    b.addEventListener("click", e => { e.stopPropagation(); const o = !l.classList.contains("open"); l.classList.toggle("open", o); b.setAttribute("aria-expanded", String(o)); });
    document.addEventListener("click", () => { l.classList.remove("open"); b.setAttribute("aria-expanded", "false"); });
  });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    menu(false); closeLb(); closeCmp(); $$(".lang.open").forEach(l => l.classList.remove("open"));
  });

  /* ---------- reveal ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 }) : null;
  $$(".rv,.mask,.step,.map").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  /* ---------- hero portal slideshow ---------- */
  $$(".portal[data-slides]").forEach(p => {
    const imgs = $$(".arch img", p), dots = $$(".dots button", p), place = $(".place b", p);
    if (imgs.length < 2) return;
    let i = 0, timer;
    function show(n) {
      imgs[i].classList.remove("on"); dots[i] && dots[i].classList.remove("on");
      i = (n + imgs.length) % imgs.length;
      const im = imgs[i];
      if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
      // restart zoom
      im.classList.remove("on"); void im.offsetWidth; im.classList.add("on");
      if (dots[i]) { dots[i].classList.remove("on"); void dots[i].offsetWidth; dots[i].classList.add("on"); }
      if (place) { place.style.opacity = 0; setTimeout(() => { place.textContent = im.dataset.place || ""; place.style.opacity = 1; }, 300); }
    }
    function play() { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 6000); }
    dots.forEach((d, n) => d.addEventListener("click", () => { show(n); play(); }));
    document.addEventListener("visibilitychange", () => document.hidden ? clearInterval(timer) : play());
    dots[0] && dots[0].classList.add("on");
    // preload the next slides after first paint
    addEventListener("load", () => setTimeout(() => imgs.forEach(im => { if (im.dataset.src) { const x = new Image(); x.src = im.dataset.src; } }), 600));
    play();
  });

  /* ---------- Hurghada clock ---------- */
  const clk = $(".clock b");
  if (clk) {
    const f = new Intl.DateTimeFormat(document.documentElement.lang, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });
    const tick = () => { clk.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  /* ---------- parallax ---------- */
  const par = $$("[data-par]");
  if (par.length && !reduce) {
    let ticking = false;
    const run = () => {
      ticking = false;
      const vh = innerHeight;
      par.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0,${(p * -parseFloat(el.dataset.par || 40)).toFixed(1)}px,0) scale(1.15)`;
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- rails ---------- */
  $$("[data-rail]").forEach(nav => {
    const rail = document.getElementById(nav.dataset.rail);
    $$("button", nav).forEach(b => b.addEventListener("click", () => {
      const dir = (b.dataset.dir === "next" ? 1 : -1) * (rtl ? -1 : 1);
      rail.scrollBy({ left: dir * rail.clientWidth * .8, behavior: reduce ? "auto" : "smooth" });
    }));
  });

  /* ---------- steps route draw ---------- */
  const route = $(".steps .route .draw");
  if (route) {
    const len = route.getTotalLength();
    route.style.strokeDasharray = len; route.style.strokeDashoffset = len;
    const wrap = route.closest(".steps");
    const upd = () => {
      const r = wrap.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .3)));
      route.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    };
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* ---------- map ---------- */
  const map = $(".mapw");
  if (map) {
    const card = $(".mapcard", map), pins = $$(".pin", map), btns = $$(".places button", map);
    function pick(id) {
      const pin = pins.find(p => p.dataset.id === id); if (!pin) return;
      pins.forEach(p => p.classList.toggle("on", p === pin));
      btns.forEach(b => b.classList.toggle("on", b.dataset.id === id));
      $("img", card).src = pin.dataset.img; $("img", card).alt = pin.dataset.name;
      $("b", card).textContent = pin.dataset.name; $("span", card).textContent = pin.dataset.note;
    }
    pins.forEach(p => { p.addEventListener("click", () => pick(p.dataset.id)); p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(p.dataset.id); } }); });
    btns.forEach(b => b.addEventListener("click", () => pick(b.dataset.id)));
  }

  /* ---------- lightbox ---------- */
  const lb = $(".lb");
  let group = [], gi = 0, lastFocus;
  function openLb(list, n) {
    if (!lb) return; group = list; gi = n; lastFocus = document.activeElement; showLb();
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; $(".x", lb).focus();
  }
  function showLb() { const b = group[gi]; $("img", lb).src = b.dataset.full; $("img", lb).alt = b.dataset.alt || ""; $("p", lb).textContent = b.dataset.alt || ""; }
  function closeLb() { if (!lb || !lb.classList.contains("open")) return; lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); }
  if (lb) {
    $(".x", lb).addEventListener("click", closeLb);
    $(".pv", lb).addEventListener("click", () => { gi = (gi - 1 + group.length) % group.length; showLb(); });
    $(".nx", lb).addEventListener("click", () => { gi = (gi + 1) % group.length; showLb(); });
    lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
    addEventListener("keydown", e => { if (!lb.classList.contains("open")) return; if (e.key === "ArrowRight") $(rtl ? ".pv" : ".nx", lb).click(); if (e.key === "ArrowLeft") $(rtl ? ".nx" : ".pv", lb).click(); });
    $$("[data-lbg]").forEach(g => { const items = $$("button[data-full]", g); items.forEach((b, n) => b.addEventListener("click", () => openLb(items, n))); });
  }

  /* ---------- explorer filters ---------- */
  const fl = $(".filters");
  if (fl) {
    const cards = $$(".grid3:not(.qgrid) > .cardw"), bs = $$("button", fl);
    function apply(f, push) {
      const first = new Map(cards.map(c => [c, c.getBoundingClientRect()]));
      bs.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === f)));
      cards.forEach(c => c.classList.toggle("hide", f !== "all" && !c.dataset.c.split(" ").includes(f)));
      if (!reduce) cards.forEach(c => {
        if (c.classList.contains("hide")) return;
        const a = first.get(c), b = c.getBoundingClientRect();
        if (!a.width) { c.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.22,.8,.2,1)" }); return; }
        c.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px)` }, { transform: "none" }], { duration: 600, easing: "cubic-bezier(.22,.8,.2,1)" });
      });
      if (push) { try { history.replaceState(null, "", f === "all" ? location.pathname : "#" + f); } catch (e) {} }
    }
    bs.forEach(b => b.addEventListener("click", () => apply(b.dataset.f, true)));
    const q = location.hash.slice(1) || new URLSearchParams(location.search).get("f");
    if (q && bs.some(b => b.dataset.f === q)) apply(q, false);
    addEventListener("hashchange", () => { const h = location.hash.slice(1); if (bs.some(b => b.dataset.f === h)) apply(h, false); });
  }

  /* ---------- composer ---------- */
  const cmp = $(".cmp");
  let cmpFocus, cmpCtx = null;
  const ta = cmp && $("textarea", cmp);
  function waLink(text) { return CFG.whatsapp ? `https://wa.me/${CFG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : null; }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) { ta.focus(); ta.select(); try { return document.execCommand("copy"); } catch (x) { return false; } }
  }
  function expText() {
    const f = cmpCtx, x = $(".extra", cmp);
    if (!f || !x) return ta.value;
    const d = $("[name=cdate]", x).value, a = $("[name=cad]", x).value, k = $("[name=cki]", x).value, n = $("[name=cname]", x).value.trim();
    let t = T.waExp.replace("{x}", f.name);
    const lines = [];
    if (d) lines.push(`${T.lDate}: ${fmtDate(d)}`);
    lines.push(`${T.lAdults}: ${a}` + (+k ? ` · ${T.lChildren}: ${k}` : ""));
    if (n) lines.push(`${T.lName}: ${n}`);
    return t + "\n\n" + lines.join("\n");
  }
  function openCmp(text, ctx) {
    if (!cmp) return;
    cmpCtx = ctx || null; cmpFocus = document.activeElement;
    const x = $(".extra", cmp);
    if (x) x.hidden = !cmpCtx;
    ta.value = cmpCtx ? expText() : text;
    $("[data-wa]", cmp).hidden = !CFG.whatsapp;
    $("[data-mail]", cmp).hidden = !CFG.email;
    cmp.classList.add("open"); cmp.setAttribute("aria-hidden", "false"); cmp.dispatchEvent(new Event("cmp:open")); document.body.style.overflow = "hidden";
    setTimeout(() => (cmpCtx ? $("[name=cdate]", cmp) : ta).focus(), 250);
  }
  function closeCmp() { if (!cmp || !cmp.classList.contains("open")) return; cmp.classList.remove("open"); cmp.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; cmpFocus && cmpFocus.focus(); }
  if (cmp) {
    $(".x", cmp).addEventListener("click", closeCmp);
    cmp.addEventListener("click", e => { if (e.target === cmp) closeCmp(); });
    const x = $(".extra", cmp);
    if (x) { x.addEventListener("input", () => { ta.value = expText(); ta.dispatchEvent(new Event("input")); }); x.addEventListener("click", () => setTimeout(() => { ta.value = expText(); ta.dispatchEvent(new Event("input")); }, 0)); }
    const wa = $("[data-wa]", cmp), ig = $("[data-ig]", cmp), ml = $("[data-mail]", cmp);
    const refresh = () => {
      if (CFG.whatsapp) wa.href = waLink(ta.value);
      if (CFG.email) ml.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Me & You Tours Egypt")}&body=${encodeURIComponent(ta.value)}`;
    };
    ta.addEventListener("input", refresh); cmp.addEventListener("cmp:open", refresh);
    wa.addEventListener("click", refresh);
    ig.href = `https://ig.me/m/${CFG.instagram}`;
    ig.addEventListener("click", () => { copy(ta.value).then(ok => say(ok ? T.copied : T.copiedOnly)); });
    if (CFG.email) { const sh = $("[data-mailaddr]", cmp); if (sh) { sh.hidden = false; sh.textContent = CFG.email; } }
    $("[data-copy]", cmp).addEventListener("click", async () => { if (await copy(ta.value)) say(T.copiedOnly); });
  }
  $$("[data-msg]").forEach(b => b.addEventListener("click", e => {
    e.preventDefault();
    if (b.dataset.exp) openCmp("", { name: b.dataset.exp }); else openCmp(b.dataset.msg || T.waDefault);
  }));
  $$(".stepper").forEach(s => {
    const o = $("output", s), inp = $("input", s), min = +s.dataset.min || 0, max = +s.dataset.max || 30;
    $$("button", s).forEach(b => b.addEventListener("click", () => {
      const v = Math.min(max, Math.max(min, +inp.value + (b.dataset.d === "+" ? 1 : -1)));
      inp.value = v; o.textContent = v; inp.dispatchEvent(new Event("input", { bubbles: true }));
    }));
  });

  /* ---------- helpers for forms ---------- */
  function fmtDate(v) { if (!v) return ""; const [y, m, d] = v.split("-").map(Number); return new Intl.DateTimeFormat(document.documentElement.lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d)); }
  function err(el, msg) {
    const f = el.closest(".field"), e = f && $(".err", f);
    if (msg) { el.setAttribute && el.setAttribute("aria-invalid", "true"); if (e) e.textContent = msg; }
    else { el.removeAttribute && el.removeAttribute("aria-invalid"); if (e) e.textContent = ""; }
    return !msg;
  }
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $$("input[type=date]").forEach(d => d.min = today);


  /* ===================== v3 ===================== */
  function wishGet() { try { return JSON.parse(localStorage.getItem("myt-wish") || "[]").filter(s => T.exps && T.exps[s]); } catch (e) { return window.__wish || []; } }
  function wishSet(a) { window.__wish = a; try { localStorage.setItem("myt-wish", JSON.stringify(a)); } catch (e) {} }
  window.wishGet = wishGet;

  /* progress bar */
  const pb = $(".pbar i");
  if (pb) {
    const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; pb.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* wishlist */
  const wl = $(".wl"), wbtn = $(".wishbtn");
  function wishRender() {
    const a = wishGet();
    if (wbtn) { $(".cnt", wbtn).textContent = a.length; wbtn.classList.toggle("has", a.length > 0); }
    $$("[data-wish]").forEach(h => {
      const on = a.includes(h.dataset.wish);
      h.setAttribute("aria-pressed", String(on));
      const nm = T.exps[h.dataset.wish] ? T.exps[h.dataset.wish].n : "";
      h.setAttribute("aria-label", `${on ? T.wishRm : T.wishAdd}: ${nm}`);
    });
    if (!wl) return;
    const list = $(".wl-list", wl), base = wl.dataset.base, ex = wl.dataset.exp, art = wl.dataset.art === "1";
    list.innerHTML = "";
    a.forEach(s => {
      const li = document.createElement("li"), e = T.exps[s];
      li.innerHTML = `<img src="${base}img/${e.i}-s.webp" alt="" width="64" height="64"><a href="${ex}${s}/${art ? "index.html" : ""}"></a><button type="button" aria-label="${T.wishRm}: ${e.n}">×</button>`;
      $("a", li).textContent = e.n;
      $("button", li).addEventListener("click", () => { wishSet(wishGet().filter(x => x !== s)); wishRender(); say(T.removed); });
      list.appendChild(li);
    });
    $(".wl-empty", wl).hidden = a.length > 0;
    $(".wl-acts", wl).hidden = a.length === 0;
  }
  function wlOpen(o) {
    if (!wl) return;
    wl.classList.toggle("open", o); wl.setAttribute("aria-hidden", String(!o)); wbtn && wbtn.setAttribute("aria-expanded", String(o));
    document.body.style.overflow = o ? "hidden" : "";
    if (o) setTimeout(() => $(".x", wl).focus(), 200); else wbtn && wbtn.focus();
  }
  if (wl) {
    wbtn && wbtn.addEventListener("click", () => wlOpen(true));
    $(".x", wl).addEventListener("click", () => wlOpen(false));
    wl.addEventListener("click", e => { if (e.target === wl) wlOpen(false); });
    addEventListener("keydown", e => { if (e.key === "Escape" && wl.classList.contains("open")) wlOpen(false); });
    $("[data-wl-send]", wl).addEventListener("click", () => { const a = wishGet(); wlOpen(false); openCmp(T.wishMsg + "\n" + a.map(s => "• " + T.exps[s].n).join("\n")); });
  }
  $$("[data-wish]").forEach(h => h.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    const s = h.dataset.wish; let a = wishGet(); const on = a.includes(s);
    a = on ? a.filter(x => x !== s) : a.concat(s); wishSet(a); wishRender();
    if (!on) { h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); if (wbtn) { wbtn.classList.remove("bump"); void wbtn.offsetWidth; wbtn.classList.add("bump"); } }
    say(on ? T.removed : T.saved);
  }));
  wishRender();

  /* fine-pointer effects: card spotlight + tilt, magnetic buttons, portal parallax */
  if (!reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".card").forEach(c => {
      c.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
        c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 7}deg) translateY(-6px)`;
      });
      c.addEventListener("pointerleave", () => { c.style.transform = ""; });
    });
    $$(".hero .btn, .final .btn, .cteaser .btn").forEach(b => {
      b.classList.add("mag");
      b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
    const hero = $(".hero"), por = hero && $(".portal", hero);
    if (por) {
      por.classList.add("tilt");
      hero.addEventListener("pointermove", e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; por.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translate3d(${x * 14}px,${y * 10}px,0)`; });
      hero.addEventListener("pointerleave", () => { por.style.transform = ""; });
    }
  }

  /* quiz */
  $$("[data-quiz]").forEach(q => {
    const steps = $$(".qstep", q), res = $(".qres", q), bar = $(".qbar i", q), score = {};
    let i = 0;
    function show(n) { i = n; steps.forEach((s, k) => s.classList.toggle("on", k === n)); bar.style.transform = `scaleX(${n / steps.length})`; }
    $$(".qopt", q).forEach(o => o.addEventListener("click", () => {
      const w = JSON.parse(o.dataset.w || "{}"); Object.entries(w).forEach(([k, v]) => score[k] = (score[k] || 0) + v);
      if (i < steps.length - 1) { show(i + 1); $("h3", steps[i]).focus({ preventScroll: true }); return; }
      steps.forEach(s => s.classList.remove("on")); bar.style.transform = "scaleX(1)";
      const cards = $$(".qcard", q);
      const ranked = cards.map(c => ({ c, s: c.dataset.c.split(" ").reduce((a, k) => a + (score[k] || 0), 0) })).sort((a, b) => b.s - a.s);
      cards.forEach(c => c.hidden = true);
      const top = ranked.slice(0, 3);
      top.forEach((r, k) => { r.c.hidden = false; r.c.style.order = k; if (!reduce) r.c.animate([{ opacity: 0, transform: "translateY(30px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: k * 120, easing: "cubic-bezier(.22,.8,.2,1)", fill: "backwards" }); });
      const plan = $("[data-quiz-plan]", q); if (plan) plan.href = plan.href.split("#")[0] + "#" + top[0].c.dataset.slug;
      res.hidden = false; $("h3", res).focus({ preventScroll: true });
    }));
    $("[data-quiz-again]", q).addEventListener("click", () => { Object.keys(score).forEach(k => delete score[k]); res.hidden = true; show(0); $("h3", steps[0]).focus({ preventScroll: true }); });
    show(0);
  });

  /* tabs (trip ideas) */
  const tabs = $$("[data-tab]");
  if (tabs.length) {
    function sel(id, focus) {
      tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === id)));
      $$(".itin").forEach(p => { const on = p.id === "it-" + id; p.hidden = !on; p.classList.toggle("on", on); if (on) $$(".rv", p).forEach(r => io ? io.observe(r) : r.classList.add("in")); });
      if (focus) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
      tlUpd();
    }
    tabs.forEach((t, k) => {
      t.addEventListener("click", () => sel(t.dataset.tab, true));
      t.addEventListener("keydown", e => { const d = (e.key === "ArrowRight") !== rtl ? 1 : (e.key === "ArrowLeft") !== rtl ? -1 : 0; if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; const n = tabs[(k + (e.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1) + tabs.length) % tabs.length]; n.focus(); sel(n.dataset.tab, true); });
    });
    const h = location.hash.slice(1); if (tabs.some(t => t.dataset.tab === h)) sel(h, false);
    addEventListener("hashchange", () => { const h2 = location.hash.slice(1); if (tabs.some(t => t.dataset.tab === h2)) sel(h2, false); });
  }
  function tlUpd() {
    $$(".itin.on .tl").forEach(tl => {
      const r = tl.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height));
      tl.style.setProperty("--tp", p.toFixed(3));
      $$(".tl-d", tl).forEach(d => { if (d.getBoundingClientRect().top < innerHeight * .72) d.classList.add("in"); });
    });
  }
  if ($(".tl")) { addEventListener("scroll", () => requestAnimationFrame(tlUpd), { passive: true }); tlUpd(); }

  /* months */
  const mos = $$(".mo");
  if (mos.length) {
    const mr = $(".mread"), num = $("[data-count]", mr);
    let cur = +num.textContent;
    function count(to) {
      if (reduce) { num.textContent = to; cur = to; return; }
      const from = cur, t0 = performance.now();
      const step = now => { const k = Math.min(1, (now - t0) / 600); num.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); else cur = to; };
      requestAnimationFrame(step);
    }
    mos.forEach(m => m.addEventListener("click", () => {
      mos.forEach(x => { x.classList.toggle("on", x === m); x.setAttribute("aria-pressed", String(x === m)); });
      $(".mname", mr).textContent = $("span", m).textContent; count(+m.dataset.sea);
      $$("[data-sd]").forEach(p => p.hidden = p.dataset.sd !== m.dataset.s);
    }));
    const mg = $(".months"); if (io && mg) io.observe(mg);
  }

  /* packing list */
  const packs = $$("[data-pack]");
  if (packs.length) {
    let saved = {}; try { saved = JSON.parse(localStorage.getItem("myt-pack") || "{}"); } catch (e) {}
    const done = $("[data-packdone]"), meter = $(".pmeter em");
    const upd = () => { const n = packs.filter(c => c.checked).length; if (done) done.textContent = n; if (meter) meter.style.transform = `scaleX(${n / packs.length})`; };
    packs.forEach(c => { c.checked = !!saved[c.dataset.pack]; c.addEventListener("change", () => { saved[c.dataset.pack] = c.checked; try { localStorage.setItem("myt-pack", JSON.stringify(saved)); } catch (e) {} upd(); }); });
    upd();
  }

  /* phrase cards + speech */
  const canSpeak = "speechSynthesis" in window;
  let arVoice = null;
  function findVoice() { if (!canSpeak) return; arVoice = speechSynthesis.getVoices().find(v => /^ar/i.test(v.lang)) || null; $$("[data-say]").forEach(s => s.hidden = !arVoice); }
  if (canSpeak) { findVoice(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", findVoice); }
  $$(".flip").forEach(f => f.addEventListener("click", e => {
    const s = e.target.closest("[data-say]");
    if (s && arVoice) { e.stopPropagation(); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s.dataset.say); u.voice = arVoice; u.lang = arVoice.lang; u.rate = .85; speechSynthesis.speak(u); } catch (x) {} return; }
    f.classList.toggle("on"); f.setAttribute("aria-pressed", String(f.classList.contains("on")));
  }));
  $$(".flip").forEach(f => f.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === f) { e.preventDefault(); f.click(); } }));

  /* ---------- trip builder ---------- */
  const bd = $(".builder");
  if (bd) {
    const form = $("form", bd), steps = $$(".bstep", bd), bars = $$(".progress i", bd), prev = $("[data-prev]", bd), next = $("[data-next]", bd), count = $("[data-count]", bd);
    let s = 0;
    const v = n => { const el = form.elements[n]; return el ? el.value.trim() : ""; };
    const checked = n => $$(`input[name="${n}"]:checked`, form).map(i => i.dataset.label);
    function summary() {
      const set = (k, val) => { const dd = $(`[data-s="${k}"]`, bd); if (!dd) return; dd.textContent = val || "—"; dd.classList.toggle("empty", !val); };
      const a = v("arrive"), d = v("depart");
      let nights = "";
      if (a && d && d > a) nights = ` · ${Math.round((Date.parse(d) - Date.parse(a)) / 864e5)} ${T.nights}`;
      set("dates", a ? fmtDate(a) + (d ? " → " + fmtDate(d) : "") + nights : "");
      set("stay", v("stay"));
      const ad = +v("adults"), ch = +v("children");
      set("who", `${ad} ${T.lAdults.toLowerCase()}` + (ch ? ` · ${ch} ${T.lChildren.toLowerCase()}` + (v("ages") ? ` (${v("ages")})` : "") : ""));
      set("budget", checked("budget").join(""));
      set("int", checked("int").join(", "));
      set("acts", checked("acts").join(", "));
      set("style", checked("style").join(""));
    }
    function validate(n) {
      let ok = true;
      if (n === 0) {
        const a = form.elements.arrive, d = form.elements.depart;
        ok = err(a, a.value ? "" : T.required) && ok;
        ok = err(d, !d.value ? T.required : (a.value && d.value <= a.value ? T.dateOrder : "")) && ok;
        ok = err(form.elements.stay, v("stay") ? "" : T.required) && ok;
      }
      if (n === 2) { const fs = $("fieldset[data-int]", form); const has = checked("int").length > 0; ok = err(fs, has ? "" : T.pickOne); }
      if (n === 3) ok = err(form.elements.cname, v("cname") ? "" : T.required);
      if (!ok) { const bad = $("[aria-invalid=true]", steps[n]); bad && bad.focus && bad.focus(); }
      return ok;
    }
    function go(n, focus = true) {
      s = n; steps.forEach((st, k) => st.classList.toggle("on", k === s));
      bars.forEach((b, k) => b.classList.toggle("done", k <= s));
      prev.hidden = s === 0; next.textContent = s === steps.length - 1 ? T.create : T.next;
      count.textContent = `${T.step} ${s + 1} ${T.of} ${steps.length}`;
      const h = $("h3", steps[s]); if (focus && h) h.focus({ preventScroll: true });
      const top = bd.getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top) scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
    prev.addEventListener("click", () => go(Math.max(0, s - 1)));
    next.addEventListener("click", () => {
      if (!validate(s)) return;
      if (s < steps.length - 1) return go(s + 1);
      const L = Object.fromEntries(Object.entries(T.b).map(([k, x]) => [k, x.replace(/[?؟]$/, "")]));
      const lines = [T.waPlan, "", `${L.dates}: ${$('[data-s="dates"]', bd).textContent}`, `${L.stay}: ${v("stay")}`, `${L.who}: ${$('[data-s="who"]', bd).textContent}`,
        `${L.budget}: ${checked("budget").join("") || "—"}`, `${L.int}: ${checked("int").join(", ")}`];
      if (checked("acts").length) lines.push(`${L.acts}: ${checked("acts").join(", ")}`);
      lines.push(`${L.style}: ${checked("style").join("") || "—"}`);
      if (v("wishes")) lines.push(`${L.wishes}: ${v("wishes")}`);
      lines.push("", `${T.lName}: ${v("cname")}`);
      openCmp(lines.join("\n"));
    });
    form.addEventListener("input", e => { summary(); if (e.target.getAttribute("aria-invalid")) err(e.target, ""); });
    form.addEventListener("change", e => { summary(); const fs = e.target.closest("fieldset[aria-invalid]"); if (fs) err(fs, ""); });
    form.addEventListener("submit", e => { e.preventDefault(); next.click(); });
    const pre = location.hash.slice(1) || new URLSearchParams(location.search).get("x");
    const tick = slug => { const c = $(`input[name="acts"][value="${CSS.escape(slug)}"]`, form); if (c) c.checked = true; };
    function prefill(h, reset) {
      const known = h === "wishlist" || (T.itins && T.itins[h]) || (T.exps && T.exps[h]);
      if (!known) return;
      if (reset) $$('input[name="acts"]', form).forEach(c => c.checked = false);
      const w = form.elements.wishes;
      if (h === "wishlist") wishGet().forEach(tick);
      else if (T.itins[h]) { T.itins[h].a.forEach(tick); if (w && (!w.value || w.value.startsWith(T.basedOn))) w.value = `${T.basedOn}: ${T.itins[h].n}`; }
      else tick(h);
      summary();
    }
    prefill(pre, false);
    addEventListener("hashchange", () => prefill(location.hash.slice(1), true));
    summary(); go(0, false);
  }

  /* ---------- simple request forms (transfer, contact) ---------- */
  $$("form[data-compose]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach(el => { ok = err(el, el.value.trim() ? "" : T.required) && ok; });
      if (!ok) { const b = $("[aria-invalid=true]", form); b && b.focus(); return; }
      const lines = [form.dataset.intro, ""];
      $$("[data-l]", form).forEach(el => {
        let val = el.type === "checkbox" ? (el.checked ? "✓" : "") : el.value.trim();
        if (el.type === "date") val = fmtDate(val);
        if (el.tagName === "SELECT") val = el.options[el.selectedIndex].text;
        if (val && !(el.type === "number" && val === "0")) lines.push(`${el.dataset.l.replace(/[?؟]$/, "")}: ${val}`);
      });
      openCmp(lines.join("\n"));
    });
    form.addEventListener("input", e => { if (e.target.getAttribute("aria-invalid")) err(e.target, ""); });
  });
})();
