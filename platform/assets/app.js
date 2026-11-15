// Customer front-end: the booking website and the Me & You Travel App (same views, two shells).
import {
  api, ApiError, t, setStrings, setLang, lang, initialLang, money, fdate, ftime, fdt, cairoDay, duration, $, $$, esc, html, raw, H,
  toast, modal, confirmBox, act, errMsg, showFieldErrors, formData, route, go, current, startRouter, reveal, store, myRefs, favs, ICON,
  EXAMPLE, startRuntime, resetExample, root, newKey,
} from "./core.js";
import STR from "./i18n.js";

setStrings(STR);
setLang(initialLang());
const APP = document.body.classList.contains("appshell");
const view = () => $("#view");
let CONFIG = null, ME = undefined;
const img = (p) => root(p);
/** proof for a booking: the access code saved on this device, otherwise the signed-in account */
/** name of an experience in the interface language (bookings keep all translations) */
const nm = (o) => o?.names?.[lang()] || o?.name || o?.title || "";
/** writes into an element only if it is still on screen (async results may arrive after navigating away) */
const setHTML = (sel, content) => { const el = $(sel); if (el) el.innerHTML = content; };
const credBody = (ref) => { const c = myRefs.code(ref); return c ? { reference: ref, accessCode: c } : { reference: ref }; };

// ---------------------------------------------------------------- data helpers
async function config() { return (CONFIG ||= await api("GET", "/api/v1/config")); }
async function me(force = false) { if (ME === undefined || force) ME = (await api("GET", "/api/v1/me")).customer; return ME; }
const CAT_ICON = { BOAT: "⛵", DIVING_SNORKELLING: "🐬", DESERT: "🏜", CULTURE: "🏛", PRIVATE_TOUR: "✦", TRANSFER: "🚘", OTHER: "•" };
const catName = (c) => t("cat_" + c);
const STATUS_TONE = { CONFIRMED: "ok", IN_PROGRESS: "ok", COMPLETED: "ok", OFFER_SENT: "info", AWAITING_CUSTOMER_APPROVAL: "info", CUSTOMER_ACCEPTED: "warn", PAYMENT_PENDING: "warn", PAYMENT_VERIFICATION: "warn",
  AVAILABILITY_REQUESTED: "warn", AWAITING_PARTNER: "warn", OFFER_READY: "warn", CANCELLATION_REQUESTED: "warn", REFUND_PENDING: "warn", CANCELLED: "bad", EXPIRED: "bad", FAILED: "bad", REFUNDED: "", PARTIALLY_REFUNDED: "", DRAFT: "" };
const statusBadge = (s) => html`<span class="badge ${STATUS_TONE[s] || ""}"><span class="dot"></span>${t("st_" + s)}</span>`;

function card(x) {
  const on = favs.has(x.slug);
  const avail = x.availability === "AVAILABLE" ? html`<span class="badge ok">${t("live_places")}</span>` : x.availability === "SOLD_OUT" ? html`<span class="badge bad">${t("sold_out")}</span>` : html`<span class="badge">${t("on_request")}</span>`;
  return html`<article class="card xcard rv">
    <div class="ph"><img src="${img(x.photos?.[0] || "img/boats.webp")}" alt="" loading="lazy">${avail}
      <button class="fav" data-fav="${x.slug}" aria-pressed="${on}" aria-label="${t("save_fav")}">${raw(on ? ICON.heart : ICON.heartO)}</button></div>
    <a class="pad" href="#/x/${x.slug}" style="text-decoration:none;color:inherit;display:block">
      <p class="k">${catName(x.category)} · ${x.destination}</p>
      <h3>${x.name}</h3>
      <p class="muted small" style="margin:0 0 10px">${x.short_desc}</p>
      <div class="spread"><span class="small muted">${duration(x.duration_minutes)}${x.private_or_group === "PRIVATE" ? " · " + t("private") : ""}</span>
      <span class="price">${x.from_minor ? t("from_pp", { p: money(x.from_minor, x.currency) }) : t("price_on_offer")}</span></div>
    </a></article>`;
}
function bindFavs(rootEl = document) {
  $$("[data-fav]", rootEl).forEach((b) => b.onclick = (e) => {
    e.preventDefault(); const on = favs.toggle(b.dataset.fav);
    b.setAttribute("aria-pressed", on); b.innerHTML = on ? ICON.heart : ICON.heartO;
    toast(on ? t("fav_added") : t("fav_removed"));
  });
}

// ---------------------------------------------------------------- shells
function siteShell() {
  const p = current().path;
  const nav = [["#/experiences", t("nav_experiences")], ["#/transfers", t("nav_transfers")], ["#/planner", t("nav_planner")], ["#/trip", t("nav_trip")], ["#/bookings", t("nav_bookings")], ["#/support", t("nav_support")]];
  return html`
  ${EXAMPLE ? html`<div class="examplebar">${raw(t("example_bar"))} <button data-reset>${t("reset_example")}</button></div>` : ""}
  <header class="top"><div class="wrap">
    <a class="brand" href="#/"><img src="${img("img/logo.png")}" alt=""><span><b>ME &amp; YOU</b><small>Tours Egypt</small></span></a>
    <nav class="nav" aria-label="${t("main_nav")}">${nav.map(([h, l]) => html`<a href="${h}" ${p.startsWith(h.slice(1)) ? raw('aria-current="page"') : ""}>${l}</a>`)}</nav>
    <div class="acts">
      <select class="langsel" data-lang aria-label="${t("language")}">${["en", "nl", "de", "ar"].map((l) => html`<option value="${l}" ${l === lang() ? raw("selected") : ""}>${{ en: "EN", nl: "NL", de: "DE", ar: "عربي" }[l]}</option>`)}</select>
      <a class="iconbtn" href="#/favorites" aria-label="${t("favorites")}">${raw(ICON.heartO)}${favs.all().length ? html`<span class="cnt">${favs.all().length}</span>` : ""}</a>
      <a class="iconbtn" href="#/account" aria-label="${t("account")}">${raw(ICON.user)}</a>
      <button class="iconbtn burger" data-menu aria-label="${t("menu")}">${raw(ICON.menu)}</button>
    </div></div></header>
  <main id="view" tabindex="-1"></main>
  <footer class="site"><div class="wrap">
    <div class="cols4">
      <div><a class="brand" href="#/" style="color:#fff"><img src="${img("img/logo.png")}" alt=""><span><b>ME &amp; YOU</b><small style="color:var(--gold)">Tours Egypt</small></span></a>
        <p style="margin-top:12px">${t("footer_tag")}</p></div>
      <div><h4>${t("explore")}</h4><ul><li><a href="#/experiences">${t("nav_experiences")}</a></li><li><a href="#/experiences?type=PRIVATE">${t("private_tours")}</a></li><li><a href="#/transfers">${t("nav_transfers")}</a></li><li><a href="#/planner">${t("nav_planner")}</a></li></ul></div>
      <div><h4>${t("help")}</h4><ul><li><a href="#/bookings">${t("nav_bookings")}</a></li><li><a href="#/support">${t("nav_support")}</a></li><li><a href="#/faq">${t("faq")}</a></li><li><a href="#/contact">${t("contact")}</a></li><li><a href="#/about">${t("about")}</a></li></ul></div>
      <div><h4>${t("legal")}</h4><ul><li><a href="#/legal/PRIVACY">${t("privacy")}</a></li><li><a href="#/legal/BOOKING_TERMS">${t("booking_terms")}</a></li><li><a href="#/legal/CANCELLATION_POLICY">${t("cancel_policy")}</a></li>
        <li><a href="${root("app/")}">${t("open_app")}</a></li><li><a href="${root("hq/")}">Business HQ</a></li><li><a href="${root("partner/")}">${t("partner_portal")}</a></li></ul></div>
    </div>
    <p class="small" style="margin-top:26px;opacity:.75">Instagram: <a href="https://www.instagram.com/meandyoutoursegypt" target="_blank" rel="noopener">@meandyoutoursegypt</a> · ${t("made_by")}</p>
  </div></footer>`;
}
function appShell(title, { back = false, tab = "" } = {}) {
  const tabs = [["#/", "explore", t("tab_explore")], ["#/trip", "trip", t("tab_trip")], ["#/bookings", "ticket", t("tab_bookings")], ["#/support", "support", t("tab_support")], ["#/account", "user", t("tab_profile")]];
  return html`<div class="phone">
    ${EXAMPLE ? html`<div class="examplebar">${raw(t("example_bar_short"))}</div>` : ""}
    <header class="apptop">${back ? html`<button class="iconbtn" data-back aria-label="${t("back")}">${raw(ICON.back)}</button>` : html`<img src="${img("img/logo.png")}" alt="" width="36" height="36" style="border-radius:50%;margin:0 6px">`}
      <h1>${title}</h1><a class="iconbtn" href="#/notifications" aria-label="${t("notifications")}">${raw(ICON.bell)}</a></header>
    <main id="view" class="appbody" tabindex="-1"></main>
    <div class="tabbar"><nav aria-label="${t("main_nav")}">${tabs.map(([h, ic, l]) => html`<a href="${h}" ${tab === ic ? raw('aria-current="page"') : ""}>${raw(ICON[ic])}<span>${l}</span></a>`)}</nav></div></div>`;
}
const APP_META = { "/": ["tab_explore", "explore"], "/experiences": ["nav_experiences", "explore", 1], "/trip": ["tab_trip", "trip"], "/bookings": ["tab_bookings", "ticket"], "/support": ["tab_support", "support"], "/account": ["tab_profile", "user"] };
function mount(path) {
  const host = $("#shell");
  if (APP) {
    const base = "/" + (path.split("/")[1] || "");
    const m = APP_META[path] || APP_META[base] || [null, base === "/x" || base === "/book" || base === "/planner" || base === "/concierge" ? "explore" : base === "/booking" || base === "/ticket" || base === "/pay" ? "ticket" : "", 1];
    host.innerHTML = H(appShell(m[0] ? t(m[0]) : "", { back: !!m[2] || !APP_META[path], tab: m[1] }));
  } else host.innerHTML = H(siteShell());
  $("[data-lang]")?.addEventListener("change", (e) => { setLang(e.target.value); CONFIG = null; render(); });
  $("[data-reset]")?.addEventListener("click", async () => { if (await confirmBox(t("reset_confirm"), t("reset_example"), true)) resetExample(); });
  $("[data-back]")?.addEventListener("click", () => (history.length > 1 ? history.back() : go("/")));
  $("[data-menu]")?.addEventListener("click", openMenu);
}
function openMenu() {
  const d = document.createElement("div"); d.className = "drawer";
  d.innerHTML = H(html`<div role="dialog" aria-modal="true" aria-label="${t("menu")}"><div class="spread"><b>${t("menu")}</b><button class="iconbtn" data-x aria-label="${t("close")}">${raw(ICON.close)}</button></div>
    <nav>${[["#/", t("home")], ["#/experiences", t("nav_experiences")], ["#/experiences?type=PRIVATE", t("private_tours")], ["#/transfers", t("nav_transfers")], ["#/planner", t("nav_planner")], ["#/concierge", t("concierge")], ["#/trip", t("nav_trip")], ["#/bookings", t("nav_bookings")], ["#/support", t("nav_support")], ["#/faq", t("faq")], ["#/about", t("about")], ["#/contact", t("contact")], ["#/account", t("account")]].map(([h, l]) => html`<a href="${h}">${l}</a>`)}</nav></div>`);
  d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-x]") || e.target.closest("a")) d.remove(); });
  document.body.append(d); d.querySelector("[data-x]").focus();
}
function setView(content, title) {
  view().innerHTML = H(content);
  document.title = `${title ? title + " · " : ""}Me & You Tours Egypt`;
  bindFavs(view()); reveal(view());
  if (!APP) window.scrollTo(0, 0);
  view().focus({ preventScroll: true });
}
const loading = () => html`<div class="wrap" style="padding:40px 20px"><div class="skel" style="height:32px;width:50%"></div><div class="skel" style="height:220px;margin-top:16px"></div></div>`;
const pageHead = (k, title, sub) => html`<section class="s" style="padding-bottom:10px"><div class="wrap"><p class="k">${k}</p><h1>${title}</h1>${sub ? html`<p class="muted" style="max-width:62ch">${sub}</p>` : ""}</div></section>`;
const W = (inner) => (APP ? inner : html`<div class="wrap">${inner}</div>`);

// ---------------------------------------------------------------- home / explore
route("/", async () => {
  const [cfg, cat] = await Promise.all([config(), api("GET", `/api/v1/catalog?lang=${lang()}`)]);
  const cats = cfg.categories;
  if (APP) {
    const who = await me();
    return setView(html`
      <div class="greet rv"><p class="k" style="color:var(--gold)">${greeting()}</p><h2>${who ? t("hello_name", { n: who.name.split(" ")[0] }) : t("explore_egypt")}</h2><p>${t("app_intro")}</p>
        <form class="row" data-search style="margin-top:12px"><input class="inp" name="q" placeholder="${t("search_ph")}" aria-label="${t("search")}" style="flex:1;margin:0"><button class="btn gold sm" aria-label="${t("search")}">${raw(ICON.search)}</button></form></div>
      <h3 style="margin-top:22px">${t("categories")}</h3>
      <div class="chips">${cats.map((c) => html`<a class="chip" href="#/experiences?cat=${c}">${CAT_ICON[c]} ${catName(c)}</a>`)}</div>
      <div class="row" style="margin:18px 0"><a class="btn dark sm" href="#/planner">${raw(ICON.sparkle)} ${t("plan_my_trip")}</a><a class="btn ghost sm" href="#/concierge">${t("concierge")}</a></div>
      <h3>${t("popular")}</h3><div class="grid g2">${cat.items.slice(0, 6).map(card)}</div>`, t("tab_explore"));
  }
  const featured = cat.items.filter((x) => x.category !== "TRANSFER").slice(0, 6);
  setView(html`
    <section class="hero"><div class="bg"><img src="${img("img/orangebay.webp")}" alt=""></div><div class="wrap">
      <p class="k" style="color:var(--gold)">Hurghada · Red Sea · Egypt</p>
      <h1>${t("hero_title")}</h1><p class="lead">${t("hero_sub")}</p>
      <div class="row"><a class="btn" href="#/experiences">${t("cta_explore")}</a><a class="btn light" href="#/planner">${t("plan_my_trip")}</a><a class="btn ghost" style="color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.6)" href="#/support">${t("cta_contact")}</a></div>
      <form class="searchbar" data-search>
        <div><label for="q">${t("search")}</label><input id="q" class="inp" name="q" placeholder="${t("search_ph")}"></div>
        <div><label for="d">${t("date")}</label><input id="d" class="inp" type="date" name="date" min="${cairoDay(Date.now())}"></div>
        <div><label for="p">${t("people")}</label><input id="p" class="inp" type="number" name="people" min="1" max="30" value="2"></div>
        <button class="btn dark">${t("search")}</button></form>
    </div></section>
    <section class="s"><div class="wrap"><div class="head"><p class="k">${t("what_we_do")}</p><h2>${t("what_we_do_title")}</h2></div>
      <div class="chips">${cats.map((c) => html`<a class="chip" href="#/experiences?cat=${c}">${CAT_ICON[c]} ${catName(c)}</a>`)}</div>
      <div class="grid g3" style="margin-top:20px">${featured.map(card)}</div>
      <p style="margin-top:20px"><a class="btn ghost" href="#/experiences">${t("all_experiences")}</a></p></div></section>
    <section class="s alt"><div class="wrap"><div class="head"><p class="k">${t("how_it_works")}</p><h2>${t("how_title")}</h2></div>
      <ol class="grid g4" style="list-style:none;padding:0;margin:0">${[1, 2, 3, 4, 5].map((i) => html`<li class="card pad rv"><b style="font:600 34px var(--serif);color:var(--gold)">0${i}</b><h3>${t("how" + i)}</h3><p class="muted small" style="margin:0">${t("how" + i + "_d")}</p></li>`)}</ol>
      <p class="note" style="margin-top:18px">${t("how_note")}</p></div></section>
    <section class="s"><div class="wrap grid g2" style="align-items:center">
      <div class="rv"><p class="k">Me &amp; You Travel App</p><h2>${t("app_promo_title")}</h2><p class="muted">${t("app_promo")}</p><a class="btn dark" href="${root("app/")}">${t("open_app")}</a></div>
      <div class="rv"><img src="${img("img/deck.webp")}" alt="" style="border-radius:22px;box-shadow:var(--shadow)"></div></div></section>`, t("home"));
  bindSearch();
});
function greeting() { const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", hour12: false }).format(new Date())); return t(h < 12 ? "good_morning" : h < 18 ? "good_afternoon" : "good_evening"); }
function bindSearch() {
  $$("[data-search]").forEach((f) => f.onsubmit = (e) => {
    e.preventDefault(); const d = formData(f); const q = new URLSearchParams(Object.entries(d).filter(([, v]) => v !== "" && v != null)); go(`/experiences?${q}`);
  });
}

// ---------------------------------------------------------------- catalogue with search & filters
route("/experiences", async (p, q) => {
  const cfg = await config();
  const params = new URLSearchParams({ lang: lang() });
  for (const k of ["q", "cat", "destination", "date", "people", "min", "max", "maxHours", "type", "kids"]) if (q[k]) params.set(k === "cat" ? "category" : k, q[k]);
  const res = await api("GET", `/api/v1/catalog?${params}`);
  const title = q.cat ? catName(q.cat) : q.type === "PRIVATE" ? t("private_tours") : t("all_experiences");
  const f = (k) => esc(q[k] || "");
  setView(html`${APP ? "" : pageHead(t("explore"), title, q.cat ? t("catdesc_" + q.cat) : t("list_sub"))}
    ${W(html`
    <div class="chips" style="margin-bottom:12px"><a class="chip ${!q.cat && !q.type ? "on" : ""}" href="#/experiences">${t("all")}</a>${cfg.categories.map((c) => html`<a class="chip ${q.cat === c ? "on" : ""}" href="#/experiences?cat=${c}">${CAT_ICON[c]} ${catName(c)}</a>`)}<a class="chip ${q.type === "PRIVATE" ? "on" : ""}" href="#/experiences?type=PRIVATE">${t("private_tours")}</a></div>
    <details class="card pad" ${APP ? "" : raw("open")} style="margin-bottom:16px"><summary style="cursor:pointer;font-weight:800;color:var(--ocean);min-height:32px">${t("filters")}</summary>
      <form data-filter class="formgrid" style="margin-top:12px">
        <label class="f">${t("search")}<input class="inp" name="q" value="${f("q")}" placeholder="${t("search_ph")}"></label>
        <label class="f">${t("destination")}<select class="inp" name="destination"><option value="">${t("any")}</option>${cfg.destinations.map((d) => html`<option ${q.destination === d ? raw("selected") : ""}>${d}</option>`)}</select></label>
        <label class="f">${t("date")}<span class="h">${t("date_filter_hint")}</span><input class="inp" type="date" name="date" value="${f("date")}" min="${cairoDay(Date.now())}"></label>
        <label class="f">${t("people")}<input class="inp" type="number" min="1" max="30" name="people" value="${f("people")}"></label>
        <label class="f">${t("price_min")}<input class="inp" type="number" min="0" step="50" name="min" value="${f("min")}"></label>
        <label class="f">${t("price_max")}<input class="inp" type="number" min="0" step="50" name="max" value="${f("max")}"></label>
        <label class="f">${t("max_duration")}<select class="inp" name="maxHours"><option value="">${t("any")}</option>${[4, 8, 12, 24].map((h) => html`<option value="${h}" ${q.maxHours == h ? raw("selected") : ""}>${t("up_to_h", { h })}</option>`)}</select></label>
        <label class="f">${t("private_or_group")}<select class="inp" name="type"><option value="">${t("any")}</option><option value="PRIVATE" ${q.type === "PRIVATE" ? raw("selected") : ""}>${t("private")}</option><option value="GROUP" ${q.type === "GROUP" ? raw("selected") : ""}>${t("group")}</option></select></label>
        <label class="check" style="align-self:end"><input type="checkbox" name="kids" ${q.kids ? raw("checked") : ""}> ${t("child_friendly")}</label>
        <input type="hidden" name="cat" value="${f("cat")}">
        <div class="row" style="align-self:end"><button class="btn">${t("show_results")}</button><a class="link" href="#/experiences">${t("clear")}</a></div>
      </form></details>
    <p class="muted small" role="status">${t("n_results", { n: res.items.length })}${q.date ? " · " + t("date_note") : ""}</p>
    ${res.items.length ? html`<div class="grid ${APP ? "g2" : "g3"}">${res.items.map(card)}</div>` : html`<div class="empty">${raw(ICON.search)}<p>${t("no_results")}</p><a class="btn ghost" href="#/experiences">${t("clear")}</a></div>`}
    <div style="height:40px"></div>`)}`, title);
  $("[data-filter]").onsubmit = (e) => { e.preventDefault(); const d = formData(e.target); const s = new URLSearchParams(); for (const [k, v] of Object.entries(d)) if (v !== "" && v != null && v !== false) s.set(k, v === true ? "1" : v); go(`/experiences?${s}`); };
});

// ---------------------------------------------------------------- experience detail + booking widget
route("/x/:slug", async ({ slug }) => {
  const x = await api("GET", `/api/v1/catalog/${encodeURIComponent(slug)}?lang=${lang()}`);
  const photos = x.media.length ? x.media.map((m) => m.url) : x.photos;
  const tx = x.texts || {};
  const instant = x.booking_model === "INSTANT";
  const firstDay = x.slots[0] ? cairoDay(x.slots[0].starts_at) : null;
  setView(html`${W(html`
    <nav class="small" style="padding:16px 0 8px"><a href="#/experiences">${t("all_experiences")}</a> › <a href="#/experiences?cat=${x.category}">${catName(x.category)}</a></nav>
    <div class="detail"><div>
      <p class="k">${catName(x.category)} · ${x.destination}</p><h1 style="font-size:clamp(30px,5vw,46px)">${x.name}</h1>
      <p class="muted" style="font-size:18px">${x.short_desc}</p>
      ${x.fallback_lang ? html`<p class="note small">${t("shown_in_english")}</p>` : ""}
      <div class="gal" style="margin:16px 0"><button data-lb="0" aria-label="${t("open_photo")}"><img src="${img(photos[0])}" alt="${x.name}"></button>
        <div class="side">${photos.slice(1, 3).map((p, i) => html`<button data-lb="${i + 1}" aria-label="${t("open_photo")}"><img src="${img(p)}" alt="" loading="lazy"></button>`)}</div></div>
      <div class="facts"><div><b>${t("duration")}</b>${duration(x.duration_minutes)}</div><div><b>${t("type")}</b>${x.private_or_group === "PRIVATE" ? t("private") : t("group")}</div>
        <div><b>${t("group_size")}</b>${x.min_participants}–${x.max_capacity || "—"}</div><div><b>${t("min_age")}</b>${x.min_age ? x.min_age : t("all_ages")}</div>
        <div><b>${t("availability")}</b>${instant ? t("live_places") : t("on_request")}</div><div><b>${t("languages")}</b>${x.languages.map((l) => l.toUpperCase()).join(" · ")}</div></div>
      <h2 style="margin-top:28px">${t("about_experience")}</h2><p class="prose">${tx.full_desc}</p>
      ${tx.included?.length ? html`<h3>${t("included")}</h3><ul>${tx.included.map((i) => html`<li>${i}</li>`)}</ul>` : ""}
      ${tx.not_included?.length ? html`<h3>${t("not_included")}</h3><ul>${tx.not_included.map((i) => html`<li>${i}</li>`)}</ul>` : ""}
      ${x.pickup_options?.length ? html`<h3>${t("pickup_options")}</h3><p>${x.pickup_options.join(" · ")}</p>` : ""}
      ${tx.safety ? html`<h3>${t("safety")}</h3><p>${tx.safety}</p>` : ""}
      ${tx.accessibility ? html`<h3>${t("families_access")}</h3><p>${tx.accessibility}</p>` : ""}
      <h3>${t("cancel_policy")}</h3><p class="prose small muted">${x.cancellation?.body || ""}</p>
    </div>
    <aside class="sticky"><div class="card pad" id="bk">
      <p class="k">${instant ? t("reserve_now") : t("request_availability")}</p>
      <div class="spread"><b style="font-size:22px;color:var(--ocean)">${t("from_pp", { p: money(Math.round(x.price.adult_minor * (1 + x.price.tax_rate_bp / 10000)), x.price.currency) })}</b>${instant ? html`<span class="badge ok">${t("live_places")}</span>` : html`<span class="badge">${t("on_request")}</span>`}</div>
      <p class="small muted">${instant ? t("instant_expl") : t("onrequest_expl")}</p>
      <form data-widget class="stack">
        ${instant ? html`<label class="f">${t("date")}<input class="inp" type="date" name="day" value="${firstDay || ""}" min="${firstDay || ""}" required></label><div data-slots></div>`
          : html`<div class="formgrid"><label class="f">${t("date")}<input class="inp" type="date" name="day" required min="${cairoDay(Date.now() + 86400000)}"></label>
          <label class="f">${t("start_time")}<select class="inp" name="time">${(x.departure_times.length ? x.departure_times : ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]).map((h) => html`<option>${h}</option>`)}</select></label></div>`}
        ${party()}
        <div data-quote class="pricebox"></div>
        <button class="btn block">${instant ? t("continue_reserve") : t("continue_request")}</button>
      </form>
      <p class="small muted" style="margin-top:10px">${t("no_charge_yet")}</p>
    </div></aside></div><div style="height:30px"></div>`)}`, x.name);

  // lightbox
  $$("[data-lb]").forEach((b) => b.onclick = () => lightbox(photos, Number(b.dataset.lb)));
  const form = $("[data-widget]");
  let chosen = null;
  const drawSlots = () => {
    if (!instant) return;
    const day = form.day.value, n = Number(form.adults.value) + Number(form.children.value);
    const list = x.slots.filter((s) => cairoDay(s.starts_at) === day);
    chosen = null;
    ($("[data-slots]") || {}).innerHTML = H(list.length ? html`<p class="small" style="margin:0 0 6px;font-weight:700">${t("choose_departure")}</p><div class="slots">${list.map((s) => html`<button type="button" class="slot" data-s="${s.starts_at}" ${s.free < n ? raw("disabled") : ""} aria-pressed="false">${ftime(s.starts_at)}<small>${s.free < n ? t("not_enough") : t("n_free", { n: s.free })}</small></button>`)}</div>`
      : html`<p class="note warn small">${t("no_departures_day")}</p>`);
    $$("[data-s]").forEach((b) => b.onclick = () => { $$("[data-s]").forEach((o) => o.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); chosen = b.dataset.s; });
    const first = $$("[data-s]:not([disabled])")[0]; first?.click();
  };
  const quote = debounce(async () => {
    try {
      const qt = await api("POST", "/api/v1/quote", { body: { activityId: x.id, adults: Number(form.adults.value), children: Number(form.children.value) } });
      ($("[data-quote]") || {}).innerHTML = H(priceLines(qt));
    } catch (e) { ($("[data-quote]") || {}).innerHTML = H(html`<p class="err">${e.message}</p>`); }
  }, 150);
  bindParty(form, () => { drawSlots(); quote(); });
  form.day.onchange = drawSlots;
  drawSlots(); quote();
  form.onsubmit = (e) => {
    e.preventDefault();
    let start;
    if (instant) { if (!chosen) return toast(t("pick_departure"), true); start = chosen; }
    else { if (!form.day.value) return toast(t("pick_date"), true); start = cairoToIso(form.day.value, form.time.value); }
    store.set("myt_draft", { slug, activityId: x.id, start, adults: Number(form.adults.value), children: Number(form.children.value) });
    go(`/book/${slug}`);
  };
});
function party(a = 2, c = 0) {
  return html`<div class="formgrid"><div><span class="f" style="display:block;font-weight:700;color:var(--ocean)">${t("adults")}</span><div class="stepper" data-step="adults"><button type="button" data-d="-1" aria-label="${t("fewer_adults")}">−</button><output>${a}</output><button type="button" data-d="1" aria-label="${t("more_adults")}">+</button><input type="hidden" name="adults" value="${a}"></div></div>
    <div><span class="f" style="display:block;font-weight:700;color:var(--ocean)">${t("children")}</span><div class="stepper" data-step="children"><button type="button" data-d="-1" aria-label="${t("fewer_children")}">−</button><output>${c}</output><button type="button" data-d="1" aria-label="${t("more_children")}">+</button><input type="hidden" name="children" value="${c}"></div></div></div>`;
}
function bindParty(form, onChange) {
  $$("[data-step]", form).forEach((s) => $$("button", s).forEach((b) => b.onclick = () => {
    const inp = $("input", s); const min = s.dataset.step === "adults" ? 1 : 0;
    const v = Math.max(min, Math.min(30, Number(inp.value) + Number(b.dataset.d))); inp.value = v; $("output", s).textContent = v; onChange?.();
  }));
}
function priceLines(q) {
  const label = (l) => (l.code === "ADULT" ? t("adults") : l.code === "CHILD" ? t("children") : l.label);
  return html`${q.lines.map((l) => html`<div class="l"><span>${label(l)} × ${l.qty}</span><span>${money(l.amount_minor, q.currency)}</span></div>`)}
    ${q.tax_minor ? html`<div class="l muted"><span>${t("taxes")} (${q.tax_rate_bp / 100}%)</span><span>${money(q.tax_minor, q.currency)}</span></div>` : ""}
    <div class="t"><span>${t("total")}</span><span>${money(q.total_minor, q.currency)}</span></div>
    ${q.deposit_minor < q.total_minor ? html`<div class="l small muted"><span>${t("deposit_option")}</span><span>${money(q.deposit_minor, q.currency)} + ${money(q.balance_minor, q.currency)}</span></div>` : ""}`;
}
function cairoToIso(day, hhmm) {
  for (const off of [2, 3]) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(`${day}T00:00:00Z`); d.setUTCHours(h - off, m);
    if (ftimeRaw(d) === hhmm && cairoDay(d) === day) return d.toISOString();
  }
  return new Date(`${day}T${hhmm}:00+02:00`).toISOString();
}
const ftimeRaw = (d) => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
function debounce(fn, ms) { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; }
function lightbox(list, i) {
  const d = document.createElement("div"); d.className = "lightbox"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
  const draw = () => { d.innerHTML = `<img src="${esc(img(list[i]))}" alt=""><button class="iconbtn cl" aria-label="${esc(t("close"))}">${ICON.close}</button>${list.length > 1 ? `<button class="iconbtn nv pv" aria-label="${esc(t("previous"))}">${ICON.back}</button><button class="iconbtn nv nx" aria-label="${esc(t("next"))}">${ICON.chev}</button>` : ""}`; };
  draw();
  const key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") { i = (i + 1) % list.length; draw(); } if (e.key === "ArrowLeft") { i = (i - 1 + list.length) % list.length; draw(); } };
  const close = () => { d.remove(); document.removeEventListener("keydown", key); };
  d.onclick = (e) => { if (e.target.closest(".pv")) { i = (i - 1 + list.length) % list.length; draw(); } else if (e.target.closest(".nx")) { i = (i + 1) % list.length; draw(); } else if (e.target === d || e.target.closest(".cl")) close(); };
  document.addEventListener("keydown", key); document.body.append(d); d.querySelector(".cl").focus();
}

// ---------------------------------------------------------------- booking flow (date → travellers → details → review)
route("/book/:slug", async ({ slug }) => {
  const draft = store.get("myt_draft", null);
  if (!draft || draft.slug !== slug) return go(`/x/${slug}`);
  const [x, who] = await Promise.all([api("GET", `/api/v1/catalog/${encodeURIComponent(slug)}?lang=${lang()}`), me()]);
  const transfer = x.category === "TRANSFER";
  const trips = who ? (await api("GET", "/api/v1/me/trips")).items : [];
  let step = 1;
  const key = newKey(); // same key for every retry of this submission: no duplicate bookings
  const draw = () => {
    setView(html`${W(html`<div style="max-width:720px;margin:0 auto;padding:18px 0 40px">
      <a class="link" href="#/x/${slug}">← ${x.name}</a>
      <h1 style="font-size:clamp(28px,4vw,38px);margin-top:6px">${x.booking_model === "INSTANT" ? t("reserve_title") : t("request_title")}</h1>
      <div class="progress" aria-label="${t("step_n", { n: step, m: 3 })}">${[1, 2, 3].map((i) => html`<span class="${i <= step ? "on" : ""}"></span>`)}</div>
      <div class="card pad" style="margin-bottom:14px"><div class="spread"><div><b>${x.name}</b><div class="small muted">${fdt(draft.start)} · ${t("party_n", { a: draft.adults, c: draft.children })}</div></div><a class="link" href="#/x/${slug}">${t("change")}</a></div></div>
      <form data-book novalidate class="card pad stack">
        <div ${step !== 1 ? raw("hidden") : ""}>
          <h3>${t("your_details")}</h3>
          <div class="formgrid">
            <label class="f">${t("full_name")}<input class="inp" name="customer.name" autocomplete="name" value="${who?.name || ""}" required></label>
            <label class="f">${t("email")}<input class="inp" type="email" name="customer.email" autocomplete="email" value="${who?.email || ""}" required></label>
            <label class="f">${t("phone")}<span class="h">${t("phone_hint")}</span><input class="inp" type="tel" name="customer.phone" autocomplete="tel" value="${who?.phone || ""}"></label>
            ${transfer ? "" : html`<label class="f">${t("pickup")}<span class="h">${t("pickup_hint")}</span><input class="inp" name="pickup" list="pick" placeholder="${t("pickup_ph")}"><datalist id="pick">${x.pickup_options.map((p) => html`<option>${p}</option>`)}</datalist></label>`}
          </div>
          ${transfer ? html`<h3 style="margin-top:16px">${t("transfer_details")}</h3><div class="formgrid">
            <label class="f">${t("pickup_address")}<input class="inp" name="transfer.pickupAddress" list="pick" required><datalist id="pick">${x.pickup_options.map((p) => html`<option>${p}</option>`)}</datalist></label>
            <label class="f">${t("destination")}<input class="inp" name="transfer.destination" list="pick" required></label>
            <label class="f">${t("flight_no")}<span class="h">${t("if_relevant")}</span><input class="inp" name="transfer.flightNumber" maxlength="12"></label>
            <label class="f">${t("luggage")}<input class="inp" type="number" min="0" max="30" name="transfer.luggage" value="2"></label>
            <label class="f">${t("child_seats")}<input class="inp" type="number" min="0" max="6" name="transfer.childSeats" value="${draft.children}"></label></div>` : ""}
          <label class="f" style="margin-top:14px">${t("practical_requests")}<span class="h">${t("practical_hint")}</span><textarea class="inp" name="notes" maxlength="1000"></textarea></label>
          ${trips.length ? html`<label class="f">${t("add_to_trip")}<select class="inp" name="tripId"><option value="">${t("no_trip")}</option>${trips.map((tr) => html`<option value="${tr.id}">${tr.title} (${fdate(tr.starts_on)} – ${fdate(tr.ends_on)})</option>`)}</select></label>` : ""}
          <p class="small muted">${t("no_passport")}</p>
          <button class="btn block" type="button" data-next>${t("continue")}</button>
        </div>
        <div ${step !== 2 ? raw("hidden") : ""}>
          <h3>${t("review")}</h3>
          <div data-quote class="pricebox"><div class="skel" style="height:80px"></div></div>
          <div class="note ${x.booking_model === "INSTANT" ? "" : "warn"}" style="margin-top:12px">${x.booking_model === "INSTANT" ? t("review_instant") : t("review_request")}</div>
          <label class="check"><input type="checkbox" name="privacyAccepted" data-path="privacyAccepted"> <span>${raw(t("privacy_accept", { link: `<a href="#/legal/PRIVACY" target="_blank">${esc(t("privacy"))}</a>` }))}</span></label>
          <div class="row"><button class="btn ghost" type="button" data-prev>${t("back")}</button><button class="btn" data-submit>${x.booking_model === "INSTANT" ? t("reserve_places") : t("send_request")}</button></div>
        </div>
      </form></div>`)}`, x.name);
    const form = $("[data-book]");
    const saved = store.get("myt_form_" + slug, {});
    for (const [k, v] of Object.entries(saved)) { const el = form.elements[k]; if (el && el.type !== "checkbox" && !el.value) el.value = v; }
    form.oninput = () => store.set("myt_form_" + slug, Object.fromEntries([...form.elements].filter((e) => e.name && e.type !== "checkbox" && e.type !== "hidden").map((e) => [e.name, e.value])));
    $("[data-next]")?.addEventListener("click", () => {
      const miss = [...form.querySelectorAll("[required]")].filter((i) => !i.value.trim());
      const email = form.elements["customer.email"];
      if (email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) miss.push(email);
      if (miss.length) { showFieldErrors(form, { fields: miss.map((i) => ({ path: i.name, message: i.type === "email" && i.value ? t("err_email") : t("err_required") })) }); return; }
      step = 2; draw(); loadQuote();
    });
    $("[data-prev]")?.addEventListener("click", () => { step = 1; draw(); });
    form.onsubmit = async (e) => {
      e.preventDefault();
      const d = formData(form);
      const body = { activityId: x.id, startAt: draft.start, adults: draft.adults, children: draft.children, pickup: d.pickup || null, notes: d.notes || null, tripId: d.tripId || null,
        customer: { name: d["customer.name"], email: d["customer.email"], phone: d["customer.phone"] || null, lang: lang() }, privacyAccepted: d.privacyAccepted === true ? true : false,
        transfer: transfer ? { pickupAddress: d["transfer.pickupAddress"], destination: d["transfer.destination"], flightNumber: d["transfer.flightNumber"] || null, luggage: Number(d["transfer.luggage"] || 0), childSeats: Number(d["transfer.childSeats"] || 0) } : null };
      const btn = $("[data-submit]");
      try {
        const r = await act(btn, () => api("POST", "/api/v1/bookings", { body, idem: true, key }));
        myRefs.add(r.reference, r.accessCode);
        store.set("myt_form_" + slug, {}); store.set("myt_draft", null);
        store.set("myt_new", r.reference);
        go(`/booking/${r.reference}`);
      } catch (err) {
        if (err.fields) { const toStep1 = err.fields.some((f) => f.path !== "privacyAccepted"); if (toStep1 && step === 2) { step = 1; draw(); } showFieldErrors($("[data-book]"), err); }
      }
    };
  };
  const loadQuote = async () => {
    try { const q = await api("POST", "/api/v1/quote", { body: { activityId: x.id, adults: draft.adults, children: draft.children } }); ($("[data-quote]") || {}).innerHTML = H(html`${priceLines(q)}<p class="small muted" style="margin:6px 0 0">${t("price_server_note")}</p>`); }
    catch (e) { ($("[data-quote]") || {}).innerHTML = H(html`<p class="err">${e.message}</p>`); }
  };
  draw();
});

// ---------------------------------------------------------------- booking detail: offer, acceptance, payment, ticket, cancellation
const STEPS = ["AVAILABILITY_REQUESTED", "OFFER_SENT", "CUSTOMER_ACCEPTED", "CONFIRMED", "COMPLETED"];
function progressIndex(s) {
  if (["AVAILABILITY_REQUESTED", "AWAITING_PARTNER", "OFFER_READY"].includes(s)) return 0;
  if (["OFFER_SENT", "AWAITING_CUSTOMER_APPROVAL"].includes(s)) return 1;
  if (["CUSTOMER_ACCEPTED", "PAYMENT_PENDING", "PAYMENT_VERIFICATION"].includes(s)) return 2;
  if (["CONFIRMED", "IN_PROGRESS", "CANCELLATION_REQUESTED"].includes(s)) return 3;
  if (s === "COMPLETED") return 4;
  return -1;
}
route("/booking/:ref", async ({ ref }, q) => {
  if (q.code) myRefs.add(ref, q.code.toUpperCase());
  const code = myRefs.code(ref);
  if (!code && !(await me())) return go(`/bookings?ref=${encodeURIComponent(ref)}`);
  const cb = credBody(ref);
  let b;
  try { b = await api("POST", "/api/v1/bookings/lookup", { body: cb }); }
  catch (e) { if (e.status === 404) { myRefs.remove(ref); return go(`/bookings?ref=${encodeURIComponent(ref)}`); } throw e; }
  const isNew = store.get("myt_new") === ref; if (isNew) store.set("myt_new", null);
  const o = b.offer, idx = progressIndex(b.status);
  const canCancel = ["AVAILABILITY_REQUESTED", "AWAITING_PARTNER", "OFFER_READY", "OFFER_SENT", "AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_ACCEPTED", "PAYMENT_PENDING", "CONFIRMED"].includes(b.status);
  const openPay = b.payments.find((p) => p.open);
  const offerValid = o && new Date(o.valid_until) > new Date();
  setView(html`${W(html`<div style="max-width:780px;margin:0 auto;padding:18px 0 40px" class="stack">
    ${isNew ? html`<div class="note ok"><b>${b.model === "INSTANT" ? t("new_instant") : t("new_request")}</b><br>${t("save_code")} <b style="font-size:18px;letter-spacing:.08em">${code || ""}</b> · ${t("ref")} <b>${ref}</b></div>` : ""}
    <div class="spread"><div><p class="k">${t("booking")} ${b.reference}</p><h1 style="font-size:clamp(28px,4vw,40px);margin:0">${nm(b.activity)}</h1></div>${statusBadge(b.status)}</div>
    <p class="muted" style="margin:0">${fdt(b.start)} · ${t("party_n", { a: b.adults, c: b.children })}${b.pickup ? " · " + b.pickup : ""}</p>
    ${idx >= 0 ? html`<ol class="progress" style="list-style:none;padding:0" aria-label="${t("progress")}">${STEPS.map((s, i) => html`<span class="${i <= idx ? "on" : ""}" title="${t("pstep_" + i)}"></span>`)}</ol><p class="small muted" style="margin-top:-10px">${t("pstep_" + idx)}</p>` : ""}
    <div class="card pad">${raw(H(statusExplainer(b)))}</div>
    ${b.transfer ? html`<div class="card pad"><h3>${t("transfer_details")}</h3><dl class="kv"><dt>${t("pickup_address")}</dt><dd>${b.transfer.pickup_address}</dd><dt>${t("destination")}</dt><dd>${b.transfer.destination}</dd>
      ${b.transfer.flight_number ? html`<dt>${t("flight_no")}</dt><dd>${b.transfer.flight_number}</dd>` : ""}<dt>${t("luggage")}</dt><dd>${b.transfer.luggage}</dd><dt>${t("child_seats")}</dt><dd>${b.transfer.child_seats}</dd>
      <dt>${t("confirmed_pickup")}</dt><dd>${b.transfer.confirmed_pickup_at ? fdt(b.transfer.confirmed_pickup_at) : t("not_yet_confirmed")}</dd>
      ${b.transfer.driver_info ? html`<dt>${t("driver")}</dt><dd>${b.transfer.driver_info}</dd>` : ""}<dt>${t("ride_status")}</dt><dd>${t("ride_" + b.transfer.ride_status)}</dd></dl></div>` : ""}
    ${o && ["OFFER_SENT", "AWAITING_CUSTOMER_APPROVAL"].includes(b.status) ? html`<div class="card pad" id="offer">
      <div class="spread"><h2 style="margin:0">${t("your_offer")}</h2><span class="badge ${offerValid ? "info" : "bad"}">${offerValid ? t("valid_until", { d: fdt(o.valid_until) }) : t("expired")}</span></div>
      <div class="pricebox" style="margin:14px 0">${priceLines(o.price_snapshot)}</div>
      <p class="small">${t("offer_terms_intro")} <a href="#/legal/BOOKING_TERMS" target="_blank">${t("booking_terms")} (${o.terms_version})</a> · <a href="#/legal/CANCELLATION_POLICY" target="_blank">${t("cancel_policy")} (${o.cancel_version})</a></p>
      <ul class="small muted">${o.refund_rules.map((r) => html`<li>${t("rule_line", { h: r.hours_before, p: r.refund_bp / 100 })}</li>`)}<li>${t("rule_rest")}</li></ul>
      <label class="check"><input type="checkbox" data-terms> <span>${t("accept_terms_box")}</span></label>
      <button class="btn block" data-accept ${offerValid ? "" : raw("disabled")}>${t("accept_offer")}</button></div>` : ""}
    ${["CUSTOMER_ACCEPTED", "PAYMENT_PENDING"].includes(b.status) ? html`<div class="card pad" id="pay"><h2>${t("payment")}</h2>
      <div class="pricebox" style="margin-bottom:12px"><div class="t"><span>${t("total")}</span><span>${money(b.total_minor, b.currency)}</span></div></div>
      ${b.deadline_at ? html`<p class="small muted">${t("pay_before", { d: fdt(b.deadline_at) })}</p>` : ""}
      ${b.payments.some((p) => p.status === "FAILED") ? html`<p class="note bad small">${t("pay_failed_retry")}</p>` : ""}
      <div class="stack">${b.deposit_minor < b.total_minor ? html`<label class="check"><input type="radio" name="kind" value="DEPOSIT"> <span>${t("pay_deposit", { d: money(b.deposit_minor, b.currency), r: money(b.total_minor - b.deposit_minor, b.currency) })}</span></label>` : ""}
        <label class="check"><input type="radio" name="kind" value="FULL" checked> <span>${t("pay_full", { d: money(b.total_minor, b.currency) })}</span></label>
        <button class="btn block" data-pay>${openPay ? t("continue_payment") : t("pay_now")}</button>
        <p class="small muted">${EXAMPLE ? t("pay_example_note") : t("pay_provider_note")}</p></div></div>` : ""}
    ${b.status === "CONFIRMED" && b.paid_minor < b.total_minor ? html`<div class="card pad"><h3>${t("balance_due")}</h3><p>${money(b.total_minor - b.paid_minor, b.currency)}</p><button class="btn" data-balance>${t("pay_balance")}</button></div>` : ""}
    ${b.ticket ? html`<div class="card pad"><div class="spread"><h3 style="margin:0">${t("ticket")}</h3><a class="btn sm" href="#/ticket/${ref}">${raw(ICON.ticket)} ${t("open_ticket")}</a></div><p class="small muted" style="margin:8px 0 0">${t("ticket_offline")}</p></div>` : ""}
    ${b.status === "EXPIRED" ? html`<div class="card pad"><p>${t("expired_expl")}</p><button class="btn" data-recheck>${t("recheck")}</button></div>` : ""}
    ${b.refunds.length || ["REFUND_PENDING", "REFUNDED", "PARTIALLY_REFUNDED"].includes(b.status) ? html`<div class="card pad"><h3>${t("refund_status")}</h3>
      <dl class="kv"><dt>${t("paid")}</dt><dd>${money(b.paid_minor, b.currency)}</dd><dt>${t("refunded")}</dt><dd>${money(b.refunded_minor, b.currency)}</dd></dl>
      ${b.refunds.map((r) => html`<p class="small">${fdate(r.created_at)} · ${money(r.amount_minor, b.currency)} · ${t("rf_" + r.status)}</p>`)}
      ${b.status === "REFUND_PENDING" ? html`<p class="note small">${t("refund_pending_expl")}</p>` : ""}</div>` : ""}
    ${b.status === "COMPLETED" ? html`<form class="card pad stack" data-review><h3>${t("leave_review")}</h3><div class="chips" role="radiogroup" aria-label="${t("leave_review")}">${[1, 2, 3, 4, 5].map((n) => html`<label class="chip"><input type="radio" name="rating" value="${n}" ${n === 5 ? raw("checked") : ""} style="accent-color:var(--gold)"> ${"★".repeat(n)}<span class="sr">${t("stars", { n })}</span></label>`)}</div>
      <label class="f">${t("review_text")}<textarea class="inp" name="body" maxlength="2000"></textarea></label><p class="small muted">${t("review_note")}</p><div class="row"><button class="btn">${t("send_review")}</button><a class="link" href="#/planner">${t("plan_next")}</a></div></form>` : ""}
    <details class="card pad"><summary style="cursor:pointer;font-weight:800;color:var(--ocean)">${t("history")}</summary><ol class="timeline" style="margin-top:12px">${b.history.map((h, i) => html`<li class="${i === b.history.length - 1 ? "cur" : "done"}"><b>${t("st_" + h.to_status)}</b><div class="small muted">${fdt(h.at)}</div></li>`)}</ol></details>
    ${b.paid_minor ? html`<button class="link" data-invoices>${t("invoices")}</button>` : ""}
    <div class="row">${canCancel ? html`<button class="btn ghost" data-cancel>${b.status === "CONFIRMED" ? t("request_cancellation") : t("cancel_booking")}</button>` : ""}
      <a class="btn ghost" href="#/support?ref=${ref}">${t("ask_question")}</a>${ME ? "" : html`<a class="link" href="#/account?claim=${ref}">${t("save_to_account")}</a>`}</div>
  </div>`)}`, `${t("booking")} ${ref}`);

  const reload = () => go(`/booking/${ref}?t=${Date.now()}`);
  $("[data-review]")?.addEventListener("submit", async (e) => { e.preventDefault(); const d = formData(e.target);
    try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/bookings/review", { body: { ...cb, rating: Number(d.rating), body: d.body || null } }), t("review_thanks")); e.target.remove(); } catch {} });
  $("[data-accept]")?.addEventListener("click", async (e) => {
    if (!$("[data-terms]").checked) return toast(t("accept_terms_first"), true);
    try { await act(e.currentTarget, () => api("POST", "/api/v1/bookings/accept", { body: { ...cb, offerId: o.id, termsId: o.terms_id, cancelPolicyId: o.cancel_policy_id, termsAccepted: true } }), t("accepted")); }
    catch (err) { if (err.code === "OFFER_CHANGED" || err.code === "TERMS_CHANGED" || err.code === "OFFER_EXPIRED") return reload(); return; }
    reload();
  });
  $("[data-pay]")?.addEventListener("click", async (e) => {
    const kind = $("input[name=kind]:checked")?.value || "FULL";
    const r = await act(e.currentTarget, () => api("POST", "/api/v1/bookings/pay", { body: { ...cb, kind } }));
    openCheckout(r.checkoutUrl);
  });
  $("[data-balance]")?.addEventListener("click", async (e) => { const r = await act(e.currentTarget, () => api("POST", "/api/v1/bookings/pay", { body: cb })); openCheckout(r.checkoutUrl); });
  $("[data-recheck]")?.addEventListener("click", async (e) => { await act(e.currentTarget, () => api("POST", "/api/v1/bookings/recheck", { body: cb }), t("recheck_sent")); reload(); });
  $("[data-cancel]")?.addEventListener("click", async (e) => {
    const confirmed = b.status === "CONFIRMED";
    if (!(await confirmBox(confirmed ? t("confirm_cancel_request") : t("confirm_cancel"), confirmed ? t("request_cancellation") : t("cancel_booking"), true))) return;
    await act(e.currentTarget, () => api("POST", "/api/v1/bookings/cancel", { body: cb }), confirmed ? t("cancel_requested") : t("cancelled"));
    reload();
  });
  $("[data-invoices]")?.addEventListener("click", async () => {
    const r = await api("POST", "/api/v1/bookings/invoices", { body: cb });
    modal(html`<h3>${t("invoices")}</h3><div class="tw"><table><tr><th>${t("number")}</th><th>${t("date")}</th><th class="num">${t("amount")}</th></tr>${r.items.map((i) => html`<tr><td>${i.number}${i.kind === "CREDIT_NOTE" ? " (" + t("credit_note") + ")" : ""}</td><td>${fdate(i.issued_at)}</td><td class="num">${money(i.amount_minor, i.currency)}</td></tr>`)}</table></div><p class="small muted">${t("example_invoice_note")}</p><button class="btn" data-close>${t("close")}</button>`);
  });
});
function openCheckout(url) {
  // sandbox checkout lives inside this app; a real provider page opens in the same tab
  const hash = url.split("#")[1];
  if (hash) go(hash); else location.href = url;
}
function statusExplainer(b) {
  const s = b.status;
  const msg = {
    AVAILABILITY_REQUESTED: t("ex_requested"), AWAITING_PARTNER: t("ex_partner"), OFFER_READY: t("ex_offer_ready"), OFFER_SENT: t("ex_offer"), AWAITING_CUSTOMER_APPROVAL: t("ex_offer"),
    CUSTOMER_ACCEPTED: t("ex_accepted"), PAYMENT_PENDING: t("ex_payment"), PAYMENT_VERIFICATION: t("ex_verifying"), CONFIRMED: t("ex_confirmed"), IN_PROGRESS: t("ex_inprogress"), COMPLETED: t("ex_completed"),
    CANCELLATION_REQUESTED: t("ex_cancel_req"), CANCELLED: t("ex_cancelled"), REFUND_PENDING: t("ex_refund_pending"), REFUNDED: t("ex_refunded"), PARTIALLY_REFUNDED: t("ex_part_refunded"), EXPIRED: t("ex_expired"), FAILED: t("ex_failed"),
  }[s] || "";
  return html`<p style="margin:0"><b>${t("what_now")}</b> ${msg}</p>`;
}

// sandbox payment page (example / test mode only)
route("/pay/:id", async ({ id }) => {
  let p;
  try { p = await api("GET", `/api/v1/sandbox/${id}`); } catch (e) { return setView(html`${W(html`<div class="empty"><p>${t("pay_page_unavailable")}</p></div>`)}`); }
  setView(html`${W(html`<div style="max-width:460px;margin:30px auto" class="card pad stack">
    <span class="badge warn">${t("test_mode")}</span><h2>${t("test_payment")}</h2>
    <p>${t("booking")} <b>${p.reference}</b><br>${t("amount")} <b>${money(p.amount_minor, p.currency)}</b></p>
    <p class="small muted">${t("test_payment_expl")}</p>
    ${p.status === "PENDING" ? html`<button class="btn block" data-o="pay">${t("sim_success")}</button><button class="btn ghost block" data-o="decline">${t("sim_decline")}</button>` : html`<p class="note">${t("payment_status")}: ${p.status}</p>`}
    <a class="link" href="#/booking/${p.reference}">${t("back_to_booking")}</a></div>`)}`, t("test_payment"));
  $$("[data-o]").forEach((b) => b.onclick = async () => {
    const r = await act(b, () => api("POST", `/api/v1/sandbox/${id}/${b.dataset.o}`));
    toast(r.result === "CONFIRMED" ? t("pay_ok") : r.result === "PAYMENT_FAILED" ? t("pay_declined") : r.result);
    go(`/booking/${p.reference}`);
  });
});

// ---------------------------------------------------------------- ticket (works offline once opened)
route("/ticket/:ref", async ({ ref }) => {
  let tk = null;
  try { if (myRefs.code(ref) || (navigator.onLine && (await me()))) { tk = await api("POST", "/api/v1/bookings/ticket", { body: credBody(ref) }); store.set("myt_ticket_" + ref, tk); } }
  catch (e) { if (!(e instanceof ApiError) || e.status >= 500) tk = null; else if (e.status === 404) { toast(e.message, true); return go(`/booking/${ref}`); } }
  if (!tk) tk = store.get("myt_ticket_" + ref, null);
  if (!tk) return setView(html`${W(html`<div class="empty"><p>${t("ticket_unavailable")}</p><a class="btn" href="#/bookings">${t("nav_bookings")}</a></div>`)}`);
  const b = tk.booking;
  setView(html`${W(html`<div style="display:grid;justify-items:center;padding:20px 0 40px">
    <article class="ticket" aria-label="${t("ticket")}"><div class="tt">
      <div class="spread"><span style="font:600 18px var(--serif);letter-spacing:.06em">ME &amp; YOU <span style="color:var(--gold)">TOURS EGYPT</span></span><span class="badge ${tk.ticket.status === "VALID" ? "ok" : "bad"}">${t("tk_" + tk.ticket.status)}</span></div>
      <h3 style="margin-top:14px">${nm(b.activity)}</h3>
      <div class="kv"><div><b>${t("ref")}</b>${b.reference}</div><div><b>${t("lead_guest")}</b>${b.lead_name}</div><div><b>${t("date")}</b>${fdate(b.start, { weekday: true })}</div><div><b>${t("start_time")}</b>${ftime(b.start)}</div>
        <div><b>${t("participants")}</b>${b.adults + b.children}</div><div><b>${t("pickup")}</b>${b.pickup || t("see_booking")}</div></div></div>
      <div class="cut"></div><div class="qr">${raw(tk.qr_svg)}</div>
      <div class="tt" style="padding-top:0"><p class="small" style="opacity:.85;margin:0">${t("ticket_instr")}</p><p class="small" style="opacity:.7;margin:8px 0 0">${t("ticket_terms_short")}</p></div></article>
    <div class="row noprint" style="margin-top:16px"><button class="btn ghost" data-print>${t("download_pdf")}</button><a class="btn ghost" href="#/booking/${ref}">${t("booking_details")}</a><a class="btn ghost" href="#/support?ref=${ref}">${t("contact")}</a></div>
  </div>`)}`, t("ticket"));
  $("[data-print]").onclick = () => window.print();
});

// ---------------------------------------------------------------- My Bookings
route("/bookings", async (p, q) => {
  const who = await me();
  const acc = who ? (await api("GET", "/api/v1/me/bookings")).items : [];
  const local = [];
  for (const r of myRefs.all()) {
    if (acc.some((a) => a.reference === r.reference)) continue;
    try { local.push(await api("POST", "/api/v1/bookings/lookup", { body: r })); } catch (e) { if (e.status === 404) myRefs.remove(r.reference); }
  }
  const all = [...acc, ...local].sort((a, b) => new Date(b.start) - new Date(a.start));
  const upcoming = all.filter((b) => new Date(b.start) > Date.now() - 86400000 && !["CANCELLED", "EXPIRED", "FAILED", "REFUNDED"].includes(b.status));
  const past = all.filter((b) => !upcoming.includes(b));
  const row = (b) => html`<a class="card pad xcard" href="#/booking/${b.reference}" style="display:block"><div class="spread"><div><b>${nm(b.activity)}</b><div class="small muted">${fdt(b.start)} · ${b.reference}</div></div>${statusBadge(b.status)}</div></a>`;
  setView(html`${APP ? "" : pageHead(t("nav_bookings"), t("my_bookings_title"), t("my_bookings_sub"))}${W(html`<div class="stack" style="padding-bottom:40px">
    ${all.length ? html`<h3>${t("upcoming")}</h3>${upcoming.length ? upcoming.map(row) : html`<p class="muted">${t("none_upcoming")}</p>`}${past.length ? html`<h3 style="margin-top:20px">${t("booking_history")}</h3>${past.map(row)}` : ""}`
      : html`<div class="empty">${raw(ICON.ticket)}<p>${t("no_bookings_device")}</p><a class="btn" href="#/experiences">${t("cta_explore")}</a></div>`}
    <form data-lookup class="card pad stack" style="margin-top:16px"><h3>${t("find_booking")}</h3><p class="small muted">${t("find_booking_sub")}</p>
      <div class="formgrid"><label class="f">${t("ref")}<input class="inp" name="reference" value="${q.ref || ""}" placeholder="MYT-26-001234" autocapitalize="characters" required></label><label class="f">${t("access_code")}<input class="inp" name="accessCode" autocapitalize="characters" autocomplete="off" required></label></div>
      <button class="btn">${t("open_booking")}</button></form>
    ${who ? "" : html`<p class="small muted">${t("account_tip")} <a href="#/account">${t("sign_in")}</a></p>`}</div>`)}`, t("nav_bookings"));
  $("[data-lookup]").onsubmit = async (e) => {
    e.preventDefault(); const d = formData(e.target);
    const btn = e.target.querySelector("button");
    try { await act(btn, () => api("POST", "/api/v1/bookings/lookup", { body: { reference: d.reference.toUpperCase(), accessCode: d.accessCode.toUpperCase() } })); myRefs.add(d.reference.toUpperCase(), d.accessCode.toUpperCase()); go(`/booking/${d.reference.toUpperCase()}`); } catch {}
  };
});

// ---------------------------------------------------------------- travel wallet
route("/wallet", async () => {
  const who = await me();
  const list = who ? (await api("GET", "/api/v1/me/bookings")).items : [];
  for (const r of myRefs.all()) if (!list.some((b) => b.reference === r.reference)) { try { list.push(await api("POST", "/api/v1/bookings/lookup", { body: r })); } catch {} }
  const cur = list.find((b) => b.currency)?.currency || "EGP";
  const paid = list.reduce((s, b) => s + (b.paid_minor || 0) - (b.refunded_minor || 0), 0);
  const open = list.filter((b) => b.status === "CONFIRMED").reduce((s, b) => s + Math.max(0, (b.total_minor || 0) - (b.paid_minor || 0)), 0);
  const withTicket = list.filter((b) => b.ticket && b.ticket.status !== "VOID").sort((a, b) => new Date(a.start) - new Date(b.start));
  setView(html`${APP ? "" : pageHead(t("nav_trip"), t("wallet"), t("wallet_sub"))}${W(html`<div class="stack" style="padding-bottom:40px">${APP ? html`<p class="muted">${t("wallet_sub")}</p>` : ""}
    <div class="kpis"><div class="kpi"><b>${money(paid, cur)}</b><span>${t("total_paid")}</span></div><div class="kpi"><b>${money(open, cur)}</b><span>${t("to_pay")}</span></div></div>
    <h3>${t("ticket")}</h3>${withTicket.length ? withTicket.map((b) => html`<a class="card pad xcard" href="#/ticket/${b.reference}" style="display:block"><div class="spread"><div><b>${nm(b.activity)}</b><div class="small muted">${fdt(b.start)} · ${b.reference}</div></div><span class="badge ${b.ticket.status === "VALID" ? "ok" : ""}">${t("tk_" + b.ticket.status)}</span></div></a>`) : html`<p class="muted">${t("no_tickets_yet")}</p>`}
    <h3>${t("payment")}</h3><div class="tw"><table>${list.filter((b) => b.paid_minor || b.total_minor).map((b) => html`<tr><td>${nm(b.activity)}<div class="small muted">${b.reference}</div></td><td class="num">${money(b.paid_minor - b.refunded_minor, b.currency || cur)}</td><td class="num">${statusBadge(b.status)}</td></tr>`)}</table></div></div>`)}`, t("wallet"));
});

// ---------------------------------------------------------------- My Trip
route("/trip", async (p, q) => {
  const who = await me();
  let trip = null, trips = [];
  if (who) {
    trips = (await api("GET", "/api/v1/me/trips")).items;
    const pick = trips.find((x) => x.id === q.id) || trips.find((x) => cairoDay(Date.now()) >= x.starts_on.slice(0, 10) && cairoDay(Date.now()) <= x.ends_on.slice(0, 10)) || trips[0];
    if (pick) { trip = await api("GET", `/api/v1/me/trips/${pick.id}`); store.set("myt_trip_cache", trip); }
  } else {
    // guests: built from the bookings saved on this device
    const items = [];
    for (const r of myRefs.all()) { try { const b = await api("POST", "/api/v1/bookings/lookup", { body: r }); items.push({ title: nm(b.activity), names: b.activity?.names, starts_at: b.start, reference: b.reference, booking_status: b.status, pickup_location: b.pickup, kind: "BOOKING", state: progressIndex(b.status) >= 3 ? "CONFIRMED" : ["CANCELLED", "EXPIRED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED", "REFUND_PENDING"].includes(b.status) ? "CANCELLED" : "PENDING" }); } catch {} }
    if (items.length) { const days = items.map((i) => cairoDay(i.starts_at)).sort(); trip = { title: t("my_trip"), starts_on: days[0], ends_on: days[days.length - 1], items, guest: true }; }
  }
  if (!trip && !navigator.onLine) trip = store.get("myt_trip_cache", null);
  if (!trip) return setView(html`${APP ? "" : pageHead(t("nav_trip"), t("my_trip"), t("trip_sub"))}${W(html`<div class="empty">${raw(ICON.trip)}<p>${who ? t("no_trip_yet") : t("trip_guest")}</p>
    ${who ? html`<button class="btn" data-newtrip>${t("create_trip")}</button>` : html`<div class="row" style="justify-content:center"><a class="btn" href="#/account">${t("sign_in")}</a><a class="btn ghost" href="#/experiences">${t("cta_explore")}</a></div>`}</div>`)}`, t("my_trip")), bindNewTrip();
  const start = new Date(trip.starts_on.slice(0, 10) + "T12:00:00Z"), end = new Date(trip.ends_on.slice(0, 10) + "T12:00:00Z");
  const days = []; for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) days.push(d.toISOString().slice(0, 10));
  const today = cairoDay(Date.now());
  let sel = q.day || (days.includes(today) ? today : days.find((d) => d >= today) || days[0]);
  const items = trip.items.filter((i) => i.starts_at);
  const nextUp = items.filter((i) => i.state === "CONFIRMED" && new Date(i.starts_at) > Date.now()).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];
  const drawDay = () => {
    const list = items.filter((i) => cairoDay(i.starts_at) === sel).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    ($("[data-agenda]") || {}).innerHTML = H(list.length ? html`<ul class="agenda">${list.map((i) => html`<li class="${i.state}"><time>${ftime(i.starts_at)}</time><div>
      <div class="spread"><b>${nm(i)}</b><span class="badge ${{ CONFIRMED: "ok", PENDING: "warn", SUGGESTED: "", CANCELLED: "bad", OWN_PLAN: "info" }[i.state]}">${t("state_" + i.state)}</span></div>
      ${i.state === "CONFIRMED" && (i.confirmed_pickup_at || i.pickup_location) ? html`<div class="small">${raw(ICON.pin)} ${t("pickup")}: ${i.confirmed_pickup_at ? ftime(i.confirmed_pickup_at) + " · " : ""}${i.pickup_location || ""}</div>` : ""}
      ${i.note ? html`<div class="small muted">${i.note}</div>` : ""}
      <div class="row" style="margin-top:6px">${i.reference ? html`<a class="link" href="#/booking/${i.reference}">${t("details")}</a>` : ""}${i.state === "CONFIRMED" && i.reference ? html`<a class="link" href="#/ticket/${i.reference}">${t("ticket")}</a>` : ""}
        ${i.pickup_location ? html`<a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(i.pickup_location)}">${t("navigate")}</a>` : ""}
        ${i.state === "CONFIRMED" ? html`<button class="link" data-ics="${i.reference || i.title}">${t("add_calendar")}</button>` : ""}
        ${i.id && i.kind !== "BOOKING" ? html`<button class="link" data-del="${i.id}">${t("remove")}</button>` : ""}</div></div></li>`)}</ul>`
      : html`<p class="empty">${t("free_day")}</p>`);
    $$("[data-ics]").forEach((b) => b.onclick = () => { const i = list.find((x) => (x.reference || x.title) === b.dataset.ics); downloadIcs(i); });
    $$("[data-del]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", `/api/v1/me/trips/${trip.id}/items/${b.dataset.del}/delete`), t("removed")); go(`/trip?id=${trip.id}&day=${sel}&r=${Date.now()}`); });
  };
  setView(html`${APP ? "" : pageHead(t("nav_trip"), trip.title, `${fdate(trip.starts_on)} – ${fdate(trip.ends_on, { year: true })}`)}${W(html`<div class="stack" style="padding-bottom:40px">
    <div class="greet"><p class="k" style="color:var(--gold)">${greeting()}</p><h2>${nextUp ? t("trip_continues") : t("trip_title_short")}</h2>
      ${nextUp ? html`<p style="margin:0">${t("next_up")}: <b>${nm(nextUp)}</b> · ${fdt(nextUp.starts_at)}</p>` : html`<p style="margin:0">${t("no_confirmed_next")}</p>`}</div>
    ${trips.length > 1 ? html`<label class="f">${t("trip")}<select class="inp" data-tripsel>${trips.map((x) => html`<option value="${x.id}" ${x.id === trip.id ? raw("selected") : ""}>${x.title}</option>`)}</select></label>` : ""}
    <div class="daystrip" role="tablist" aria-label="${t("trip_calendar")}">${days.map((d) => { const has = items.some((i) => cairoDay(i.starts_at) === d && i.state !== "CANCELLED"); const dt = new Date(d + "T12:00:00Z"); return html`<button class="day" role="tab" data-day="${d}" aria-pressed="${d === sel}" aria-selected="${d === sel}"><small>${new Intl.DateTimeFormat(lang(), { weekday: "short", timeZone: "UTC" }).format(dt)}</small><b>${dt.getUTCDate()}</b>${has ? html`<i class="pip"></i>` : ""}</button>`; })}</div>
    <div class="row small"><span class="badge ok">${t("state_CONFIRMED")}</span><span class="badge warn">${t("state_PENDING")}</span><span class="badge">${t("state_SUGGESTED")}</span><span class="badge info">${t("state_OWN_PLAN")}</span><span class="badge bad">${t("state_CANCELLED")}</span></div>
    <h3 data-dayh>${fdate(sel + "T12:00:00Z", { weekday: true })}</h3><div data-agenda></div>
    ${trip.guest ? html`<p class="note small">${t("trip_guest_note")}</p>` : html`<div class="row"><button class="btn sm" data-addplan>${t("add_own_plan")}</button><button class="btn ghost sm" data-share>${raw(ICON.share)} ${t("share_trip")}</button><button class="btn ghost sm" data-newtrip>${t("create_trip")}</button><a class="btn ghost sm" href="#/planner">${t("nav_planner")}</a><a class="btn ghost sm" href="#/wallet">${raw(ICON.wallet)} ${t("wallet")}</a></div>`}
    <details class="card pad"><summary style="cursor:pointer;font-weight:800;color:var(--ocean)">${t("week_overview")}</summary>
      <div class="tw" style="margin-top:10px"><table>${days.map((d) => html`<tr><th style="width:120px">${fdate(d + "T12:00:00Z", { weekday: true })}</th><td>${items.filter((i) => cairoDay(i.starts_at) === d).map((i) => html`<div>${ftime(i.starts_at)} ${nm(i)} <span class="small muted">(${t("state_" + i.state)})</span></div>`)}</td></tr>`)}</table></div></details>
    <div class="card pad"><h3>${t("contact_on_trip")}</h3><p class="small">${(await config()).support_hours || ""}</p><a class="btn ghost sm" href="#/support">${t("nav_support")}</a></div>
  </div>`)}`, t("my_trip"));
  drawDay();
  $$("[data-day]").forEach((b) => b.onclick = () => { sel = b.dataset.day; $$("[data-day]").forEach((x) => { x.setAttribute("aria-pressed", x === b); x.setAttribute("aria-selected", x === b); }); $("[data-dayh]").textContent = fdate(sel + "T12:00:00Z", { weekday: true }); drawDay(); });
  $("[data-tripsel]")?.addEventListener("change", (e) => go(`/trip?id=${e.target.value}`));
  $("[data-addplan]")?.addEventListener("click", () => {
    const m = modal(html`<h3>${t("add_own_plan")}</h3><form class="stack" data-plan><label class="f">${t("what")}<input class="inp" name="title" required maxlength="120"></label>
      <div class="formgrid"><label class="f">${t("date")}<input class="inp" type="date" name="day" value="${sel}" min="${days[0]}" max="${days[days.length - 1]}" required></label><label class="f">${t("start_time")}<input class="inp" type="time" name="time" value="19:00" required></label></div>
      <label class="f">${t("note")}<input class="inp" name="note" maxlength="500"></label><p class="small muted">${t("own_plan_note")}</p><div class="row"><button class="btn">${t("save")}</button><button type="button" class="btn ghost" data-close>${t("cancel")}</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target);
      try { await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/me/trips/${trip.id}/items`, { body: { title: d.title, startsAt: cairoToIso(d.day, d.time), note: d.note || null } }), t("saved")); m.close(); go(`/trip?id=${trip.id}&day=${d.day}&r=${Date.now()}`); } catch (err) { showFieldErrors(e.target, err); } };
  });
  $("[data-share]")?.addEventListener("click", async (e) => {
    const r = await act(e.currentTarget, () => api("POST", `/api/v1/me/trips/${trip.id}/share`));
    const url = `${location.href.split("#")[0]}#/shared/${r.token}`;
    if (navigator.share) navigator.share({ title: trip.title, url }).catch(() => {}); else { navigator.clipboard?.writeText(url); modal(html`<h3>${t("share_trip")}</h3><p class="small">${t("share_expl")}</p><input class="inp" readonly value="${url}"><button class="btn" data-close style="margin-top:12px">${t("close")}</button>`); }
  });
  bindNewTrip();
});
function bindNewTrip() {
  $$("[data-newtrip]").forEach((b) => b.onclick = () => {
    const m = modal(html`<h3>${t("create_trip")}</h3><form class="stack"><label class="f">${t("trip_name")}<input class="inp" name="title" required maxlength="80" value="${t("my_trip")}"></label><label class="f">${t("destination")}<input class="inp" name="destination" value="Hurghada" required></label>
      <div class="formgrid"><label class="f">${t("arrival")}<input class="inp" type="date" name="startsOn" required></label><label class="f">${t("departure")}<input class="inp" type="date" name="endsOn" required></label></div><p class="small muted">${t("trip_autolink")}</p>
      <div class="row"><button class="btn">${t("save")}</button><button type="button" class="btn ghost" data-close>${t("cancel")}</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); try { const r = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/trips", { body: formData(e.target) }), t("saved")); m.close(); go(`/trip?id=${r.id}`); } catch (err) { showFieldErrors(e.target, err); } };
  });
}
function downloadIcs(i) {
  const s = new Date(i.starts_at), e = new Date(s.getTime() + 3 * 3600000);
  const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Me and You Tours Egypt//EN", "BEGIN:VEVENT", `UID:${i.reference || Date.now()}@meandyoutours`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${nm(i)}`, `LOCATION:${i.pickup_location || ""}`, "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${i.title}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = `${(i.reference || "plan")}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
route("/shared/:token", async ({ token }) => {
  const tr = await api("GET", `/api/v1/shared-trip/${encodeURIComponent(token)}`);
  setView(html`${pageHead(t("shared_trip"), tr.title, `${tr.destination} · ${fdate(tr.starts_on)} – ${fdate(tr.ends_on, { year: true })}`)}${W(html`<ul class="agenda" style="padding-bottom:40px">${tr.items.map((i) => html`<li class="${i.state}"><time>${i.starts_at ? fdate(i.starts_at) : ""}</time><div><b>${i.title}</b> <span class="small muted">${i.starts_at ? ftime(i.starts_at) : ""} · ${t("state_" + i.state)}</span></div></li>`)}</ul>`)}`, tr.title);
});

// ---------------------------------------------------------------- transfers
route("/transfers", async () => {
  const cat = await api("GET", `/api/v1/catalog?lang=${lang()}&category=TRANSFER`);
  const x = cat.items[0];
  setView(html`${APP ? "" : pageHead(t("nav_transfers"), t("transfers_title"), t("transfers_sub"))}${W(html`<div class="grid g2" style="padding-bottom:40px;align-items:start">
    <div class="stack"><img src="${img("img/signpost.webp")}" alt="" style="border-radius:20px">
      <ul class="small"><li>${t("tr_point1")}</li><li>${t("tr_point2")}</li><li>${t("tr_point3")}</li><li>${t("tr_point4")}</li></ul></div>
    ${x ? html`<div class="card pad stack"><h3>${x.name}</h3><p class="muted small">${x.short_desc}</p>
      <form data-tr class="stack"><div class="formgrid"><label class="f">${t("date")}<input class="inp" type="date" name="day" required min="${cairoDay(Date.now() + 86400000)}"></label>
        <label class="f">${t("pickup_time")}<input class="inp" type="time" name="time" value="10:00" required></label></div>${party(2, 0)}
        <button class="btn block">${t("continue_request")}</button></form><p class="small muted">${t("no_charge_yet")}</p></div>` : html`<p class="note">${t("transfers_unavailable")}</p>`}</div>`)}`, t("nav_transfers"));
  const f = $("[data-tr]"); if (!f) return;
  bindParty(f);
  f.onsubmit = (e) => { e.preventDefault(); if (!f.day.value) return toast(t("pick_date"), true); store.set("myt_draft", { slug: x.slug, activityId: x.id, start: cairoToIso(f.day.value, f.time.value), adults: Number(f.adults.value), children: Number(f.children.value) }); go(`/book/${x.slug}`); };
});

// ---------------------------------------------------------------- personal travel planner
route("/planner", async () => {
  const saved = store.get("myt_plan", null);
  const who = await me();
  const interests = ["sea", "snorkelling", "desert", "history", "culture", "relax", "adventure", "active"];
  setView(html`${APP ? "" : pageHead(t("nav_planner"), t("planner_title"), t("planner_sub"))}${W(html`<div class="stack" style="padding-bottom:40px">
    <form data-pl class="card pad stack"><div class="formgrid">
      <label class="f">${t("destination")}<select class="inp" name="destination"><option>Hurghada</option></select></label>
      <label class="f">${t("arrival")}<input class="inp" type="date" name="startsOn" required min="${cairoDay(Date.now())}" value="${saved?.input?.startsOn || ""}"></label>
      <label class="f">${t("departure")}<input class="inp" type="date" name="endsOn" required min="${cairoDay(Date.now())}" value="${saved?.input?.endsOn || ""}"></label>
      <label class="f">${t("travellers")}<input class="inp" type="number" name="travellers" min="1" max="30" value="${saved?.input?.travellers || 2}"></label>
      <label class="f">${t("of_which_children")}<input class="inp" type="number" name="children" min="0" max="30" value="${saved?.input?.children || 0}"></label>
      <label class="f">${t("budget_pp")}<span class="h">${t("budget_hint")}</span><input class="inp" type="number" name="budgetPerPersonEgp" min="0" step="100" value="${saved?.input?.budgetPerPersonEgp || ""}"></label>
      <label class="f">${t("rest_days")}<input class="inp" type="number" name="restDays" min="0" max="14" value="${saved?.input?.restDays ?? 1}"></label></div>
      <fieldset class="fieldset"><legend class="f" style="font-weight:700;color:var(--ocean)">${t("interests")}</legend><div class="chips" style="margin-top:6px">${interests.map((i) => html`<label class="chip"><input type="checkbox" name="interests" data-multi value="${i}" ${saved?.input?.interests?.includes(i) ? raw("checked") : ""} style="accent-color:var(--turq)"> ${t("int_" + i)}</label>`)}</div></fieldset>
      <label class="check"><input type="checkbox" name="privateOnly" ${saved?.input?.privateOnly ? raw("checked") : ""}> ${t("private_only")}</label>
      <label class="f">${t("mobility")}<span class="h">${t("mobility_hint")}</span><input class="inp" name="mobility" maxlength="300" value="${saved?.input?.mobility || ""}"></label>
      <button class="btn">${raw(ICON.sparkle)} ${t("make_plan")}</button></form>
    <div data-plan></div></div>`)}`, t("nav_planner"));
  const drawPlan = (plan, input) => {
    ($("[data-plan]") || {}).innerHTML = H(html`<div class="card pad stack"><div class="spread"><h2 style="margin:0">${t("draft_plan")}</h2><span class="badge">${t("state_SUGGESTED")}</span></div>
      <p class="note small">${t("plan_note")}</p>
      <ol class="timeline">${plan.days.map((d, i) => html`<li class="${d.items.length ? "done" : ""}"><b>${fdate(d.date + "T12:00:00Z", { weekday: true })}</b> · <span class="small muted">${t("pd_" + d.type)}</span>
        ${d.items.map((it) => html`<div class="card pad" style="margin-top:8px"><div class="spread"><div><b>${it.name}</b><div class="small muted">${catName(it.category)} · ${duration(it.duration_minutes)} · ${t("from_pp", { p: money(it.from_minor) })} · ${it.booking_model === "INSTANT" ? t("live_places") : t("on_request")}</div></div>
          <div class="row"><button class="link" data-swap="${i}">${t("replace")}</button><a class="link" href="#/x/${it.slug}" data-req="${it.slug}" data-day="${d.date}">${t("request_availability")}</a></div></div></div>`)}</li>`)}</ol>
      <p class="spread"><span>${t("indicative_total")}</span><b>${money(plan.indicative_total_minor)}</b></p>
      <div class="row"><button class="btn ghost sm" data-shareplan>${raw(ICON.share)} ${t("share_plan")}</button>${who ? html`<button class="btn sm" data-saveplan>${t("save_to_trip")}</button>` : html`<a class="link" href="#/account">${t("sign_in_to_save")}</a>`}</div></div>`);
    $$("[data-swap]").forEach((b) => b.onclick = async () => {
      const cat = (await api("GET", `/api/v1/catalog?lang=${lang()}`)).items.filter((x) => x.category !== "TRANSFER");
      const day = plan.days[Number(b.dataset.swap)];
      const cur = day.items[0]; const i = cat.findIndex((x) => x.slug === cur?.slug); const nx = cat[(i + 1) % cat.length];
      day.items = [{ activity_id: nx.id, slug: nx.slug, name: nx.name, category: nx.category, duration_minutes: nx.duration_minutes, booking_model: nx.booking_model, from_minor: nx.from_minor }];
      day.type = "ACTIVITY"; store.set("myt_plan", { plan, input }); drawPlan(plan, input);
    });
    $("[data-shareplan]").onclick = () => { const text = plan.days.map((d) => `${d.date}: ${d.items.map((i) => i.name).join(", ") || t("pd_" + d.type)}`).join("\n"); if (navigator.share) navigator.share({ title: t("draft_plan"), text }).catch(() => {}); else { navigator.clipboard?.writeText(text); toast(t("copied")); } };
    $("[data-saveplan]")?.addEventListener("click", async (e) => {
      const r = await act(e.currentTarget, () => api("POST", "/api/v1/me/trips", { body: { title: t("planned_trip"), destination: input.destination || "Hurghada", startsOn: input.startsOn, endsOn: input.endsOn } }));
      for (const d of plan.days) for (const it of d.items) await api("POST", `/api/v1/me/trips/${r.id}/items`, { body: { kind: "SUGGESTION", title: it.name, startsAt: cairoToIso(d.date, "09:00"), note: t("suggestion_note") } });
      toast(t("saved")); go(`/trip?id=${r.id}`);
    });
  };
  if (saved?.plan) drawPlan(saved.plan, saved.input);
  $("[data-pl]").onsubmit = async (e) => {
    e.preventDefault(); const d = formData(e.target);
    const body = { ...d, travellers: Number(d.travellers), children: Number(d.children || 0), restDays: Number(d.restDays || 0), budgetPerPersonEgp: d.budgetPerPersonEgp ? Number(d.budgetPerPersonEgp) : undefined, interests: d.interests || [], lang: lang() };
    try { const plan = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/planner", { body })); store.set("myt_plan", { plan, input: body }); drawPlan(plan, body); $("[data-plan]").scrollIntoView({ behavior: "smooth" }); } catch (err) { showFieldErrors(e.target, err); }
  };
});

// ---------------------------------------------------------------- concierge (instant answers + human hand-off)
route("/concierge", async () => {
  const hist = store.get("myt_chat", []);
  setView(html`${APP ? "" : pageHead(t("concierge"), t("concierge_title"), t("concierge_sub"))}${W(html`<div style="max-width:720px;margin:0 auto;padding-bottom:40px" class="stack">
    <div class="note small">${t("concierge_note")}</div>
    <div class="chat" data-chat aria-live="polite"></div>
    <div class="chips">${["q_booking", "q_pay", "q_pickup", "q_kids", "q_weather", "q_cancel"].map((k) => html`<button class="chip" data-q="${t(k)}">${t(k)}</button>`)}</div>
    <form data-ask class="row"><input class="inp" name="m" placeholder="${t("ask_ph")}" style="flex:1;margin:0" aria-label="${t("ask_ph")}" maxlength="500"><button class="btn">${t("send")}</button></form>
    <a class="btn ghost" href="#/support">${t("talk_to_person")}</a></div>`)}`, t("concierge"));
  const box = $("[data-chat]");
  const push = (who, content) => { hist.push({ who, content }); store.set("myt_chat", hist.slice(-30)); draw(); };
  const draw = () => { box.innerHTML = hist.length ? hist.map((m) => `<div class="bubble ${m.who === "me" ? "me" : ""}">${m.content}</div>`).join("") : `<div class="bubble">${esc(t("concierge_hello"))}</div>`; box.lastElementChild?.scrollIntoView({ block: "nearest" }); };
  draw();
  const ask = async (m) => {
    push("me", esc(m));
    const refs = myRefs.all()[0];
    const r = await api("POST", "/api/v1/concierge", { body: { message: m, lang: lang(), ...(refs ? { reference: refs.reference, accessCode: refs.accessCode } : {}) } });
    let a = "";
    if (r.kind === "FAQ") a = `<b>${esc(r.answer.q[lang()] || r.answer.q.en)}</b><br>${esc(r.answer.a[lang()] || r.answer.a.en)}`;
    else if (r.kind === "BOOKING") a = `${esc(t("your_booking"))} <b>${esc(r.answer.reference)}</b>: ${esc(t("st_" + r.answer.status))} · ${esc(fdt(r.answer.start))}${r.answer.pickup ? " · " + esc(r.answer.pickup) : ""}. <a href="#/booking/${esc(r.answer.reference)}">${esc(t("details"))}</a>`;
    else if (r.kind === "POLICY" && r.answer) a = `${esc(t("policy_summary"))}<ul>${r.answer.refund_rules.map((x) => `<li>${esc(t("rule_line", { h: x.hours_before, p: x.refund_bp / 100 }))}</li>`).join("")}<li>${esc(t("rule_rest"))}</li></ul>`;
    else if (r.kind === "EXPERIENCES") a = `${esc(t("these_may_fit"))}<br>${r.answer.map((x) => `<a href="#/x/${esc(x.slug)}">${esc(x.name)}</a>`).join("<br>")}`;
    else a = esc(t("dont_know"));
    if (r.handoff) a += `<br><a href="#/support">${esc(t("talk_to_person"))}</a>`;
    push("bot", a);
  };
  $("[data-ask]").onsubmit = (e) => { e.preventDefault(); const m = e.target.m.value.trim(); if (!m) return; e.target.m.value = ""; ask(m).catch((err) => toast(errMsg(err), true)); };
  $$("[data-q]").forEach((b) => b.onclick = () => ask(b.dataset.q).catch((err) => toast(errMsg(err), true)));
});

// ---------------------------------------------------------------- support
route("/support", async (p, q) => {
  const who = await me();
  const mine = who ? (await api("GET", "/api/v1/me/support")).items : [];
  const cfg = await config();
  setView(html`${APP ? "" : pageHead(t("nav_support"), t("support_title"), cfg.support_hours || "")}${W(html`<div class="grid g2" style="align-items:start;padding-bottom:40px">
    <form data-sup class="card pad stack" novalidate><h3>${t("new_question")}</h3>
      <div class="formgrid"><label class="f">${t("full_name")}<input class="inp" name="name" value="${who?.name || ""}" required></label><label class="f">${t("email")}<input class="inp" type="email" name="email" value="${who?.email || ""}" required></label></div>
      <div class="formgrid"><label class="f">${t("topic")}<select class="inp" name="topic">${["QUESTION", "SPECIAL_REQUEST", "CHANGE", "CANCELLATION", "PAYMENT", "COMPLAINT", "OTHER"].map((k) => html`<option value="${k}">${t("topic_" + k)}</option>`)}</select></label>
        <label class="f">${t("urgency")}<select class="inp" name="urgency">${["NORMAL", "HIGH", "URGENT", "LOW"].map((k) => html`<option value="${k}">${t("urg_" + k)}</option>`)}</select></label></div>
      <label class="f">${t("ref")}<span class="h">${t("if_relevant")}</span><input class="inp" name="reference" value="${q.ref || ""}"></label>
      <label class="f">${t("message")}<textarea class="inp" name="message" required maxlength="4000"></textarea></label>
      <p class="small muted">${t("support_reply_note")}</p><button class="btn">${t("send")}</button></form>
    <div class="stack">
      <div class="card pad"><h3>${t("concierge")}</h3><p class="small muted">${t("concierge_sub")}</p><a class="btn ghost sm" href="#/concierge">${t("open_concierge")}</a></div>
      ${who ? html`<div class="card pad"><h3>${t("support_history")}</h3>${mine.length ? mine.map((s) => html`<details style="border-top:1px solid var(--line);padding:10px 0"><summary class="spread" style="cursor:pointer"><b>${s.number} · ${t("topic_" + s.topic)}</b><span class="badge">${t("sup_" + s.status)}</span></summary>
        <div class="chat" style="margin-top:8px">${s.messages.map((m) => html`<div class="bubble ${m.author_type === "CUSTOMER" ? "me" : ""}">${m.body}<div class="small" style="opacity:.7">${fdt(m.at)}</div></div>`)}</div>
        <form class="row" data-reply="${s.id}" style="margin-top:8px"><input class="inp" name="body" placeholder="${t("reply")}" style="flex:1;margin:0" required><button class="btn sm">${t("send")}</button></form></details>`) : html`<p class="muted small">${t("no_tickets")}</p>`}</div>`
      : html`<form data-suplook class="card pad stack"><h3>${t("follow_ticket")}</h3><div class="formgrid"><label class="f">${t("ticket_no")}<input class="inp" name="number" placeholder="SUP-00012" required></label><label class="f">${t("email")}<input class="inp" type="email" name="email" required></label></div><button class="btn ghost">${t("open_ticket_btn")}</button><div data-supres></div></form>`}
    </div></div>`)}`, t("nav_support"));
  $("[data-sup]").onsubmit = async (e) => {
    e.preventDefault(); const d = formData(e.target);
    try { const r = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/support", { body: { ...d, reference: d.reference || null } })); e.target.reset(); modal(html`<h3>${t("ticket_created", { n: r.number })}</h3><p>${t("ticket_created_expl")}</p><button class="btn" data-close>${t("close")}</button>`); if (who) go(`/support?r=${Date.now()}`); }
    catch (err) { showFieldErrors(e.target, err); }
  };
  $$("[data-reply]").forEach((f) => f.onsubmit = async (e) => { e.preventDefault(); await act(f.querySelector(".btn"), () => api("POST", `/api/v1/me/support/${f.dataset.reply}/reply`, { body: formData(f) }), t("sent")); go(`/support?r=${Date.now()}`); });
  $("[data-suplook]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { const s = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/support/lookup", { body: formData(e.target) }));
      ($("[data-supres]") || {}).innerHTML = H(html`<p><b>${s.number}</b> · ${t("sup_" + s.status)}</p><div class="chat">${s.messages.map((m) => html`<div class="bubble ${m.author_type === "CUSTOMER" ? "me" : ""}">${m.body}</div>`)}</div>`); } catch {}
  });
});

// ---------------------------------------------------------------- content pages
route("/about", async () => setView(html`${pageHead(t("about"), t("about_title"), t("about_sub"))}${W(html`<div class="grid g2" style="padding-bottom:40px;align-items:center"><div><p>${t("about_p1")}</p><p>${t("about_p2")}</p><p>${t("about_p3")}</p><a class="btn" href="#/experiences">${t("cta_explore")}</a></div><img src="${img("img/jetty.webp")}" alt="" style="border-radius:22px"></div>`)}`, t("about")));
route("/contact", async () => { const cfg = await config(); setView(html`${pageHead(t("contact"), t("contact_title"), cfg.support_hours || "")}${W(html`<div class="grid g3" style="padding-bottom:40px">
  <div class="card pad"><h3>${t("nav_support")}</h3><p class="small muted">${t("contact_support")}</p><a class="btn sm" href="#/support">${t("new_question")}</a></div>
  <div class="card pad"><h3>Instagram</h3><p class="small muted">${t("contact_insta")}</p><a class="btn ghost sm" href="https://www.instagram.com/meandyoutoursegypt" target="_blank" rel="noopener">@meandyoutoursegypt</a></div>
  <div class="card pad"><h3>${t("concierge")}</h3><p class="small muted">${t("concierge_sub")}</p><a class="btn ghost sm" href="#/concierge">${t("open_concierge")}</a></div></div>`)}`, t("contact")); });
route("/faq", async () => {
  const faq = [["how_works", "ex_faq1"], ["q_pay", "ex_faq2"], ["q_pickup", "ex_faq3"], ["q_kids", "ex_faq4"], ["q_weather", "ex_faq5"], ["q_cancel", "ex_faq6"], ["faq_q7", "ex_faq7"], ["faq_q8", "ex_faq8"]];
  setView(html`${pageHead(t("faq"), t("faq_title"))}${W(html`<div style="max-width:780px;padding-bottom:40px">${faq.map(([q, a]) => html`<details class="card pad" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800;color:var(--ocean);min-height:32px">${t(q)}</summary><p style="margin:10px 0 0">${t(a)}</p></details>`)}<a class="btn ghost" href="#/concierge">${t("open_concierge")}</a></div>`)}`, t("faq"));
});
route("/legal/:kind", async ({ kind }) => {
  const doc = await api("GET", `/api/v1/terms/${kind}`);
  const name = { PRIVACY: t("privacy"), BOOKING_TERMS: t("booking_terms"), CANCELLATION_POLICY: t("cancel_policy") }[kind];
  setView(html`${pageHead(t("legal"), name, `${t("version")} ${doc.version} · ${fdate(doc.published_at, { year: true })}`)}${W(html`<div class="card pad prose" style="max-width:780px;margin-bottom:40px">${doc.body}</div>`)}`, name);
});
route("/favorites", async () => {
  const cat = await api("GET", `/api/v1/catalog?lang=${lang()}`);
  const list = cat.items.filter((x) => favs.has(x.slug));
  setView(html`${APP ? "" : pageHead(t("favorites"), t("favorites"))}${W(html`<div style="padding-bottom:40px">${list.length ? html`<div class="grid g3">${list.map(card)}</div>` : html`<div class="empty">${raw(ICON.heartO)}<p>${t("no_favs")}</p><a class="btn" href="#/experiences">${t("cta_explore")}</a></div>`}</div>`)}`, t("favorites"));
});

// ---------------------------------------------------------------- account
route("/account", async (p, q) => {
  const who = await me(true);
  if (!who) {
    setView(html`${APP ? "" : pageHead(t("account"), t("account_title"), t("account_sub"))}${W(html`<div class="grid g2" style="align-items:start;padding-bottom:40px">
      <form data-login class="card pad stack"><h3>${t("sign_in")}</h3><label class="f">${t("email")}<input class="inp" type="email" name="email" autocomplete="email" required></label><label class="f">${t("password")}<input class="inp" type="password" name="password" autocomplete="current-password" required></label>
        <button class="btn">${t("sign_in")}</button><a class="link" href="#/reset">${t("forgot_password")}</a>
        ${EXAMPLE ? html`<div class="demo-acc"><button type="button" data-demo>${t("example_traveller")}: traveller@example.com · voorbeeld-2026</button></div>` : ""}</form>
      <form data-reg class="card pad stack" novalidate><h3>${t("create_account")}</h3><p class="small muted">${t("account_benefits")}</p>
        <label class="f">${t("full_name")}<input class="inp" name="name" autocomplete="name" required></label><label class="f">${t("email")}<input class="inp" type="email" name="email" required></label>
        <label class="f">${t("password")}<span class="h">${t("password_hint")}</span><input class="inp" type="password" name="password" autocomplete="new-password" required minlength="12"></label>
        <label class="check"><input type="checkbox" name="privacyAccepted" data-path="privacyAccepted"> <span>${raw(t("privacy_accept", { link: `<a href="#/legal/PRIVACY" target="_blank">${esc(t("privacy"))}</a>` }))}</span></label>
        <button class="btn">${t("create_account")}</button><p class="small muted">${t("guest_ok")}</p></form></div>`)}`, t("account"));
    const after = async () => { ME = undefined; await me(true); if (q.claim && myRefs.code(q.claim)) await api("POST", "/api/v1/me/bookings/claim", { body: { reference: q.claim, accessCode: myRefs.code(q.claim) } }).catch(() => {}); for (const r of myRefs.all()) await api("POST", "/api/v1/me/bookings/claim", { body: r }).catch(() => {}); go(q.claim ? `/booking/${q.claim}` : "/trip"); };
    $("[data-login]").onsubmit = async (e) => { e.preventDefault(); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/login", { body: formData(e.target) }), t("welcome_back")); await after(); } catch {} };
    $("[data-demo]")?.addEventListener("click", () => { const f = $("[data-login]"); f.email.value = "traveller@example.com"; f.password.value = "voorbeeld-2026"; f.requestSubmit(); });
    $("[data-reg]").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/register", { body: { ...d, privacyAccepted: d.privacyAccepted === true ? true : false, lang: lang() } }), t("account_created")); await after(); } catch (err) { showFieldErrors(e.target, err); } };
    return;
  }
  const full = await api("GET", "/api/v1/me");
  const prefs = full.notification_preferences || { email: true, whatsapp: false, push: false, reminders: true, marketing: false };
  const tp = who.preferences || {};
  setView(html`${APP ? "" : pageHead(t("account"), who.name, who.email)}${W(html`<div class="grid g2" style="align-items:start;padding-bottom:40px">
    <div class="stack">
      <nav class="card pad listnav"><a href="#/bookings">${t("booking_history")} ${raw(ICON.chev)}</a><a href="#/trip">${t("my_trip")} ${raw(ICON.chev)}</a><a href="#/wallet">${t("wallet")} ${raw(ICON.chev)}</a><a href="#/favorites">${t("favorites")} ${raw(ICON.chev)}</a><a href="#/notifications">${t("notifications")} ${raw(ICON.chev)}</a><a href="#/support">${t("support_history")} ${raw(ICON.chev)}</a><button data-lang2>${t("language")}: ${lang().toUpperCase()} ${raw(ICON.chev)}</button></nav>
      <form data-prof class="card pad stack"><h3>${t("profile")}</h3><label class="f">${t("full_name")}<input class="inp" name="name" value="${who.name}"></label><label class="f">${t("phone")}<input class="inp" name="phone" value="${who.phone || ""}"></label><button class="btn sm">${t("save")}</button></form>
      <form data-tp class="card pad stack"><h3>${t("travel_prefs")}</h3>
        <fieldset class="fieldset"><legend class="small muted">${t("interests")}</legend><div class="chips">${["sea", "snorkelling", "desert", "history", "culture", "relax", "adventure"].map((i) => html`<label class="chip"><input type="checkbox" name="interests" data-multi value="${i}" ${tp.interests?.includes(i) ? raw("checked") : ""}> ${t("int_" + i)}</label>`)}</div></fieldset>
        <label class="f">${t("pace")}<select class="inp" name="pace">${["RELAXED", "BALANCED", "ACTIVE"].map((k) => html`<option value="${k}" ${tp.pace === k ? raw("selected") : ""}>${t("pace_" + k)}</option>`)}</select></label>
        <label class="f">${t("mobility")}<input class="inp" name="mobility" value="${tp.mobility || ""}"></label><label class="f">${t("dietary")}<input class="inp" name="dietary" value="${tp.dietary || ""}"></label><button class="btn sm">${t("save")}</button></form>
    </div><div class="stack">
      <form data-np class="card pad stack"><h3>${t("notif_prefs")}</h3>${["email", "whatsapp", "push", "reminders"].map((k) => html`<label class="check"><input type="checkbox" name="${k}" ${prefs[k] ? raw("checked") : ""}> ${t("np_" + k)}</label>`)}
        <h3 style="margin-top:8px">${t("privacy_settings")}</h3><label class="check"><input type="checkbox" name="marketing" ${prefs.marketing ? raw("checked") : ""}> ${t("np_marketing")}</label><p class="small muted">${t("np_note")}</p><button class="btn sm">${t("save")}</button></form>
      <div class="card pad stack"><h3>${t("your_data")}</h3><p class="small muted">${t("your_data_expl")}</p><a class="link" href="#/legal/PRIVACY">${t("privacy")}</a>
        <div class="row"><button class="btn ghost sm" data-logout>${t("sign_out")}</button><button class="btn danger sm" data-delete>${t("delete_account")}</button></div></div>
      ${EXAMPLE ? html`<div class="card pad"><h3>${t("example_env")}</h3><p class="small muted">${t("example_env_expl")}</p><button class="btn ghost sm" data-reset2>${t("reset_example")}</button></div>` : ""}
    </div></div>`)}`, t("account"));
  $("[data-prof]").onsubmit = async (e) => { e.preventDefault(); await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/profile", { body: formData(e.target) }), t("saved")); ME = undefined; };
  $("[data-tp]").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/profile", { body: { preferences: { interests: d.interests || [], pace: d.pace, mobility: d.mobility, dietary: d.dietary } } }), t("saved")); };
  $("[data-np]").onsubmit = async (e) => { e.preventDefault(); await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/notification-preferences", { body: formData(e.target) }), t("saved")); };
  $("[data-logout]").onclick = async () => { await api("POST", "/api/v1/me/logout"); ME = undefined; toast(t("signed_out")); go("/"); };
  $("[data-reset2]")?.addEventListener("click", async () => { if (await confirmBox(t("reset_confirm"), t("reset_example"), true)) resetExample(); });
  $("[data-lang2]").onclick = () => { const m = modal(html`<h3>${t("language")}</h3><div class="listnav">${[["en", "English"], ["nl", "Nederlands"], ["de", "Deutsch"], ["ar", "العربية"]].map(([l, n]) => html`<button data-l="${l}">${n}${l === lang() ? " ✓" : ""}</button>`)}</div>`); $$("[data-l]", m.el).forEach((b) => b.onclick = () => { setLang(b.dataset.l); CONFIG = null; m.close(); render(); }); };
  $("[data-delete]").onclick = () => {
    const m = modal(html`<h3>${t("delete_account")}</h3><p>${t("delete_expl")}</p><form class="stack"><label class="f">${t("password")}<input class="inp" type="password" name="password" required></label><div class="row"><button class="btn danger">${t("delete_account")}</button><button type="button" class="btn ghost" data-close>${t("cancel")}</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/delete", { body: formData(e.target) }), t("account_deleted")); m.close(); ME = undefined; go("/"); } catch {} };
  };
});
route("/reset", async (p, q) => {
  setView(html`${APP ? "" : pageHead(t("account"), t("forgot_password"))}${W(html`<div style="max-width:520px;padding-bottom:40px" class="stack">
    <form data-r1 class="card pad stack"><p class="small muted">${t("reset_sub")}</p><label class="f">${t("email")}<input class="inp" type="email" name="email" required></label><button class="btn">${t("send_link")}</button><div data-r1res></div></form>
    <form data-r2 class="card pad stack" ${q.token ? "" : raw("hidden")}><h3>${t("new_password")}</h3><input type="hidden" name="token" value="${q.token || ""}"><label class="f">${t("password")}<span class="h">${t("password_hint")}</span><input class="inp" type="password" name="password" required minlength="12" autocomplete="new-password"></label><button class="btn">${t("save")}</button></form></div>`)}`, t("forgot_password"));
  $("[data-r1]").onsubmit = async (e) => {
    e.preventDefault(); const r = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/password-reset", { body: formData(e.target) }));
    $("[data-r1res]").innerHTML = H(html`<p class="note ok small">${r.message}</p>${r.demo_reset_token ? html`<p class="note small">${t("example_reset_note")} <a href="#/reset?token=${r.demo_reset_token}">${t("open_reset_link")}</a></p>` : ""}`);
  };
  $("[data-r2]").onsubmit = async (e) => { e.preventDefault(); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/me/password-reset/confirm", { body: formData(e.target) }), t("password_changed")); go("/account"); } catch (err) { showFieldErrors(e.target, err); } };
});
route("/notifications", async () => {
  const who = await me();
  const list = who ? (await api("GET", "/api/v1/me/notifications")).items : [];
  setView(html`${APP ? "" : pageHead(t("notifications"), t("notifications"))}${W(html`<div class="stack" style="padding-bottom:40px">${!who ? html`<div class="empty">${raw(ICON.bell)}<p>${t("notif_guest")}</p><a class="btn" href="#/account">${t("sign_in")}</a></div>`
    : list.length ? list.map((n) => html`<div class="card pad"><div class="spread"><b>${t("nt_" + n.template)}</b><span class="small muted">${fdt(n.created_at)}</span></div>${n.payload?.reference ? html`<a class="link" href="#/booking/${n.payload.reference}">${n.payload.reference}</a>` : ""}<div class="small muted">${t("delivery")}: ${t("ns_" + n.status)}</div></div>`) : html`<div class="empty">${raw(ICON.bell)}<p>${t("no_notifications")}</p></div>`}</div>`)}`, t("notifications"));
});

// app-only first-run screens
route("/welcome", async () => {
  setView(html`<div class="stack" style="padding:20px 4px"><img src="${img("img/orangebay.webp")}" alt="" style="border-radius:22px;aspect-ratio:4/3;object-fit:cover"><h1 style="font-size:36px">${t("hero_title")}</h1><p class="muted">${t("hero_sub")}</p>
    <label class="f">${t("language")}<select class="inp" data-wl>${[["en", "English"], ["nl", "Nederlands"], ["de", "Deutsch"], ["ar", "العربية"]].map(([l, n]) => html`<option value="${l}" ${l === lang() ? raw("selected") : ""}>${n}</option>`)}</select></label>
    <a class="btn block" href="#/account" data-seen>${t("sign_in")} / ${t("create_account")}</a><a class="btn ghost block" href="#/" data-seen>${t("continue_guest")}</a></div>`, t("welcome"));
  $("[data-wl]").onchange = (e) => { setLang(e.target.value); render(); };
  $$("[data-seen]").forEach((a) => a.addEventListener("click", () => store.set("myt_seen_welcome", true)));
});

// ---------------------------------------------------------------- boot
async function render(fn, params = {}, query = {}, path = current().path) {
  if (fn === undefined) { const c = current(); return startRouterOnce(); }
  mount(path);
  try {
    if (!fn) return setView(html`${W(html`<div class="empty"><h2>${t("not_found")}</h2><a class="btn" href="#/">${t("home")}</a></div>`)}`, t("not_found"));
    view().innerHTML = H(loading());
    await fn(params, query);
  } catch (e) {
    console.error(e);
    view().innerHTML = H(html`${W(html`<div class="empty"><h2>${t("something_wrong")}</h2><p>${errMsg(e)}</p><button class="btn" data-retry>${t("try_again")}</button></div>`)}`);
    $("[data-retry]")?.addEventListener("click", () => render(fn, params, query, path));
  }
}
let started = false;
function startRouterOnce() { if (started) { dispatchAgain(); return; } started = true; startRouter((fn, params, query, path) => render(fn, params, query, path)); }
function dispatchAgain() { window.dispatchEvent(new HashChangeEvent("hashchange")); }

(async function boot() {
  const splash = $("#splash");
  try {
    await startRuntime((s) => { const el = $("#splash-msg"); if (el) el.textContent = t("boot_" + s.replace(/\s/g, "_")); });
  } catch (e) {
    if (splash) splash.innerHTML = `<div><h1>Me &amp; You</h1><p>${esc(errMsg(e))}</p><button class="btn" onclick="location.reload()">${esc(t("try_again"))}</button></div>`;
    return;
  }
  if (APP && !store.get("myt_seen_welcome", false) && (!location.hash || location.hash === "#/")) location.hash = "#/welcome";
  splash?.remove();
  startRouterOnce();
  if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register(root("sw.js")).catch(() => {});
})();
