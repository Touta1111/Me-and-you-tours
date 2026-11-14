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
    const cards = $$(".grid3 .card"), bs = $$("button", fl);
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
      if (push) { const u = new URL(location); f === "all" ? u.searchParams.delete("f") : u.searchParams.set("f", f); history.replaceState(null, "", u); }
    }
    bs.forEach(b => b.addEventListener("click", () => apply(b.dataset.f, true)));
    const q = new URLSearchParams(location.search).get("f");
    if (q && bs.some(b => b.dataset.f === q)) apply(q, false);
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
    cmp.classList.add("open"); cmp.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    setTimeout(() => (cmpCtx ? $("[name=cdate]", cmp) : ta).focus(), 250);
  }
  function closeCmp() { if (!cmp || !cmp.classList.contains("open")) return; cmp.classList.remove("open"); cmp.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; cmpFocus && cmpFocus.focus(); }
  if (cmp) {
    $(".x", cmp).addEventListener("click", closeCmp);
    cmp.addEventListener("click", e => { if (e.target === cmp) closeCmp(); });
    const x = $(".extra", cmp);
    if (x) { x.addEventListener("input", () => { ta.value = expText(); }); x.addEventListener("click", () => setTimeout(() => { ta.value = expText(); }, 0)); }
    $("[data-wa]", cmp).addEventListener("click", () => { const u = waLink(ta.value); if (u) window.open(u, "_blank", "noopener"); });
    $("[data-ig]", cmp).addEventListener("click", async () => {
      const ok = await copy(ta.value);
      window.open(`https://ig.me/m/${CFG.instagram}`, "_blank", "noopener");
      say(ok ? T.copied : T.copiedOnly);
    });
    $("[data-mail]", cmp).addEventListener("click", () => { location.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Me & You Tours Egypt")}&body=${encodeURIComponent(ta.value)}`; });
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
    const pre = new URLSearchParams(location.search).get("x");
    if (pre) { const c = $(`input[name="acts"][value="${CSS.escape(pre)}"]`, form); if (c) c.checked = true; }
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
