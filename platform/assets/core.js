// Shared front-end core: API client (server or self-contained example), router, formatting, DOM helpers.
const MODE = window.MYT_MODE || "server";
export const EXAMPLE = MODE === "example";
const ROOT = new URL("./", import.meta.url).href.replace(/assets\/$/, ""); // site root (works in sub-folders and on GitHub Pages)
// single-file edition: pictures are embedded and the other environments open from the published site
export const SINGLE = !!window.MYT_SINGLE;
export const root = (p = "") => {
  const k = p.replace(/^\//, "");
  if (SINGLE) return window.MYT_ASSETS?.[k] || (window.MYT_LINK_BASE || "") + k;
  return ROOT + k;
};

let runtime = null, runtimeReady = null, runtimeDone = false;
/** starts the in-browser booking system. The website does not wait for it: public pages are shown at once from
 *  prepared data (window.MYT_STATIC) and everything that books, pays or signs in waits until it is ready. */
export function startRuntime(onProgress) {
  if (!EXAMPLE) return Promise.resolve();
  if (!runtimeReady) runtimeReady = (async () => {
    if (!runtime) runtime = await import("./runtime.js");
    // the example database lives in this browser; one tab at a time keeps it consistent
    let got = true;
    try {
      if (navigator.locks) got = await new Promise((res, rej) => navigator.locks.request("myt-example-db", { ifAvailable: true }, (lock) => { res(!!lock); return lock ? new Promise(() => {}) : null; }).catch(rej));
    } catch { got = true; } // viewers without Web Locks: continue
    if (!got) throw Object.assign(new Error("OTHER_TAB"), { code: "OTHER_TAB" });
    await runtime.boot(onProgress);
    runtimeDone = true; window.MYT_READY = true;
  })();
  return runtimeReady;
}
export const runtimeIsReady = () => runtimeDone || !EXAMPLE;

// ---------------------------------------------------------------- prepared public data (example only)
const cairoOffsetMin = (d) => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Cairo", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(d).map((x) => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(d.getTime() / 60000) * 60000) / 60000; };
function freshSlots(dep) {
  // today's live places, rebuilt from the departure plan (the real database confirms them when booking)
  const out = [], now = Date.now();
  for (let i = 0; i <= 75; i++) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date(now + i * 86400000));
    for (const t of dep.times) {
      const guess = new Date(`${day}T${t}:00Z`);
      const at = new Date(guess.getTime() - cairoOffsetMin(guess) * 60000);
      if (at.getTime() > now + 2 * 3600000 && at.getTime() < now + 120 * 86400000) out.push({ starts_at: at.toISOString(), free: dep.capacity });
    }
  }
  return out;
}
function hasSession() { try { const j = JSON.parse(localStorage.getItem("myt_cookies") || "{}"); return !!j.myt_c; } catch { return false; } }
function fromStatic(path) {
  const S = window.MYT_STATIC; if (!S) return undefined;
  const u = new URL(path, "http://x"), q = Object.fromEntries(u.searchParams), l = q.lang || "en";
  if (u.pathname === "/api/v1/me") return hasSession() ? undefined : { customer: null };
  if (u.pathname === "/api/v1/config" || u.pathname.startsWith("/api/v1/terms/")) return S[u.pathname];
  const det = /^\/api\/v1\/catalog\/([^/]+)$/.exec(u.pathname);
  if (det) {
    const d = S[`/api/v1/catalog/${decodeURIComponent(det[1])}?lang=${l}`]; if (!d) return undefined;
    const dep = S.__departures?.[d.slug];
    return { ...d, slots: dep ? freshSlots(dep) : [], __prepared: true };
  }
  if (u.pathname === "/api/v1/catalog") {
    if (q.date) return undefined; // availability on a date: ask the real database
    let rows = S[`/api/v1/catalog?lang=${l}`]?.items; if (!rows) return undefined;
    const has = (k) => q[k] != null && q[k] !== "";
    if (has("category")) rows = rows.filter((r) => r.category === q.category);
    if (has("destination")) rows = rows.filter((r) => r.destination.toLowerCase() === q.destination.toLowerCase());
    if (has("q")) { const s = q.q.toLowerCase(); rows = rows.filter((r) => `${r.name} ${r.short_desc} ${r.destination} ${r.category}`.toLowerCase().includes(s)); }
    if (has("type")) rows = rows.filter((r) => r.private_or_group === q.type);
    if (has("level")) rows = rows.filter((r) => r.privacy_level === q.level);
    if (has("party")) rows = rows.filter((r) => (r.party_types || []).includes(q.party));
    if (has("kids")) rows = rows.filter((r) => r.child_friendly === true);
    if (has("maxHours")) rows = rows.filter((r) => r.duration_minutes != null && r.duration_minutes <= Number(q.maxHours) * 60);
    if (has("people")) rows = rows.filter((r) => (!r.max_capacity || r.max_capacity >= Number(q.people)) && r.min_participants <= Number(q.people));
    if (has("min")) rows = rows.filter((r) => r.from_minor >= Number(q.min) * 100);
    if (has("max")) rows = rows.filter((r) => r.from_minor <= Number(q.max) * 100);
    return { items: rows };
  }
  return undefined;
}
export async function resetExample() { if (runtime) await runtime.resetExample(); location.reload(); }

const idem = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
export class ApiError extends Error { constructor(status, body) { super(body?.message || "Error"); this.status = status; this.code = body?.error; this.fields = body?.fields; } }

/** opts: { body, idem: true (adds Idempotency-Key), key: reuse a key across retries } */
export async function api(method, path, opts = {}) {
  const headers = { "x-requested-with": "myt", "x-client": document.body.classList.contains("appshell") ? "app" : "web" };
  if (opts.idem) headers["idempotency-key"] = opts.key || idem();
  let status, body;
  if (EXAMPLE) {
    if (!runtimeDone && method === "GET") { const pre = fromStatic(path); if (pre !== undefined) return JSON.parse(JSON.stringify(pre)); }
    await startRuntime();
    ({ status, body } = await runtime.api(method, path, { body: opts.body, headers }));
  } else {
    const r = await fetch(path, { method, headers: { ...headers, ...(opts.body !== undefined ? { "content-type": "application/json" } : {}) }, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined, credentials: "same-origin" });
    status = r.status; body = await r.json().catch(() => ({}));
  }
  if (status >= 400) throw new ApiError(status, body);
  return body;
}
export const newKey = idem;

// ---------------------------------------------------------------- i18n & formatting
let STR = {}, LANG = "en";
export function setStrings(s) { STR = s; }
export function lang() { return LANG; }
export function setLang(l) {
  LANG = ["en", "nl", "de", "ar"].includes(l) ? l : "en";
  store.set("myt_lang", LANG);
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
}
export function initialLang() {
  const s = store.get("myt_lang", null); if (s) return s;
  const n = (navigator.language || "en").slice(0, 2);
  return ["nl", "de", "ar"].includes(n) ? n : "en";
}
/** t("key", {vars}) — falls back to English, then to the key itself: a missing translation never blocks a flow */
export function t(key, vars) {
  let s = STR[LANG]?.[key] ?? STR.en?.[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
  return s;
}
const locale = () => ({ en: "en-GB", nl: "nl-NL", de: "de-DE", ar: "ar-EG" })[LANG];
export const TZ = "Africa/Cairo";
export function money(minor, cur = "EGP") {
  if (minor == null) return "—";
  return new Intl.NumberFormat(locale(), { style: "currency", currency: cur, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
}
export function fdate(d, o = {}) { if (!d) return "—"; return new Intl.DateTimeFormat(locale(), { timeZone: TZ, day: "numeric", month: "short", year: o.year ? "numeric" : undefined, weekday: o.weekday ? "short" : undefined }).format(new Date(d)); }
export function ftime(d) { if (!d) return "—"; return new Intl.DateTimeFormat(locale(), { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(d)); }
export function fdt(d) { return d ? `${fdate(d, { weekday: true })} · ${ftime(d)}` : "—"; }
export function cairoDay(d) { return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d)); }
export function duration(min) { if (!min) return t("varies"); const h = Math.floor(min / 60), m = min % 60; return h ? `${h} ${t("h")}${m ? ` ${m} ${t("min")}` : ""}` : `${m} ${t("min")}`; }

// ---------------------------------------------------------------- DOM helpers
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export function esc(v) { return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
/** tagged template that escapes interpolations unless wrapped with raw() */
const RAW = Symbol("raw");
export const raw = (s) => ({ [RAW]: String(s ?? "") });
export function html(strings, ...vals) {
  let out = "";
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) {
      const v = vals[i];
      if (Array.isArray(v)) out += v.map((x) => (x && x[RAW] !== undefined ? x[RAW] : esc(x))).join("");
      else out += v && v[RAW] !== undefined ? v[RAW] : v === false || v == null ? "" : esc(v);
    }
  });
  return raw(out);
}
export const H = (r) => (r && r[RAW] !== undefined ? r[RAW] : esc(r));

let toastBox;
export function toast(msg, bad = false) {
  if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toasts"; toastBox.setAttribute("role", "status"); toastBox.setAttribute("aria-live", "polite"); document.body.append(toastBox); }
  const el = document.createElement("div"); el.className = "toast" + (bad ? " bad" : ""); el.textContent = msg; toastBox.append(el);
  setTimeout(() => el.remove(), 4200);
}
export function modal(content, { onClose } = {}) {
  const prev = document.activeElement;
  const m = document.createElement("div"); m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
  m.innerHTML = `<div tabindex="-1">${H(content)}</div>`;
  const close = () => { m.remove(); document.removeEventListener("keydown", key); prev?.focus?.(); onClose?.(); };
  const key = (e) => { if (e.key === "Escape") close(); };
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) close(); });
  document.addEventListener("keydown", key);
  document.body.append(m); m.firstElementChild.focus();
  return { el: m.firstElementChild, close };
}
export function confirmBox(text, okLabel, danger = false) {
  return new Promise((res) => {
    const m = modal(html`<h3>${text}</h3><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn ghost" data-close>${t("cancel")}</button><button class="btn ${danger ? "danger" : ""}" data-ok>${okLabel}</button></div>`, { onClose: () => res(false) });
    m.el.querySelector("[data-ok]").onclick = () => { res(true); m.close(); };
  });
}
/** run an async action on a button with busy state + error toast; returns the result or undefined */
export async function act(btn, fn, okMsg) {
  if (btn) { btn.classList.add("busy"); btn.disabled = true; }
  try { const r = await fn(); if (okMsg) toast(okMsg); return r; }
  catch (e) { toast(errMsg(e), true); throw e; }
  finally { if (btn) { btn.classList.remove("busy"); btn.disabled = false; } }
}
export function errMsg(e) {
  if (e?.code === "OTHER_TAB") return t("err_other_tab");
  if (e instanceof ApiError) return e.message;
  if (!navigator.onLine) return t("err_offline");
  return t("err_generic");
}
/** show field-level validation errors returned by the API under the matching inputs */
export function showFieldErrors(form, e) {
  $$("[aria-invalid]", form).forEach((x) => x.removeAttribute("aria-invalid"));
  $$(".err", form).forEach((x) => x.remove());
  let first = null;
  for (const f of e?.fields || []) {
    const inp = form.querySelector(`[name="${CSS.escape(f.path)}"]`) || form.querySelector(`[data-path="${CSS.escape(f.path)}"]`);
    if (!inp) continue;
    inp.setAttribute("aria-invalid", "true");
    const m = document.createElement("div"); m.className = "err"; m.id = `err-${f.path.replace(/\W/g, "-")}`; m.textContent = f.message;
    inp.setAttribute("aria-describedby", m.id);
    (inp.closest("label") || inp).after(m);
    first ||= inp;
  }
  first?.focus();
  return !!first;
}
export function formData(form) {
  const o = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if (el.type === "checkbox") { if (el.dataset.multi) { (o[el.name] ||= []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
    else if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
    else if (el.type === "number" || el.dataset.num) o[el.name] = el.value === "" ? null : Number(el.value);
    else o[el.name] = el.value.trim();
  }
  return o;
}

// ---------------------------------------------------------------- router (hash based: works on any static host)
const routes = [];
export function route(pattern, render) { const keys = []; const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$"); routes.push({ re, keys, render }); }
export function go(path) { if (location.hash === "#" + path) dispatch(); else location.hash = path; }
export function current() { const h = location.hash.slice(1) || "/"; const [p, q = ""] = h.split("?"); return { path: p, query: Object.fromEntries(new URLSearchParams(q)) }; }
let onRoute = null;
export function startRouter(cb) { onRoute = cb; addEventListener("hashchange", dispatch); dispatch(); }
async function dispatch() {
  const { path, query } = current();
  for (const r of routes) {
    const m = r.re.exec(path);
    if (m) { const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])); await onRoute(r.render, params, query, path); return; }
  }
  await onRoute(null, {}, query, path);
}
// in-page anchors must not trigger the router
document.addEventListener("click", (e) => {
  const a = e.target.closest?.("a[href^='#']");
  if (a && !a.getAttribute("href").startsWith("#/")) { e.preventDefault(); document.getElementById(a.getAttribute("href").slice(1))?.scrollIntoView({ behavior: "smooth" }); }
});

export function reveal(root = document) {
  const els = $$(".rv:not(.in)", root);
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
}

// ---------------------------------------------------------------- local storage helpers (device-only conveniences)
// Storage on this device. "Necessary" items keep the service working (your session, the bookings you made here,
// your storage choice). "Preference" items (language, favourites) are only kept between visits after you allow it.
const PREF_KEYS = new Set(["myt_lang", "myt_favs"]);
const isPref = (k) => PREF_KEYS.has(k) || k.startsWith("myt_form_");
const mem = {};
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
export const consent = {
  get() { try { return JSON.parse(ls.get("myt_consent") || "null"); } catch { return null; } },
  prefs() { return this.get()?.preferences === true; },
  set(preferences) {
    const c = { v: 1, necessary: true, preferences: !!preferences, at: new Date().toISOString() };
    ls.set("myt_consent", JSON.stringify(c)); mem.myt_consent = JSON.stringify(c);
    const keys = new Set([...PREF_KEYS, ...Object.keys(mem).filter(isPref)]);
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isPref(k)) keys.add(k); } } catch {}
    for (const k of keys) {
      if (preferences) { if (mem[k] != null) ls.set(k, mem[k]); }
      else { const v = ls.get(k); if (v != null) mem[k] = v; ls.del(k); }
    }
    return c;
  },
  deviceId() {
    let id = ls.get("myt_device") || mem.myt_device;
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join(""); ls.set("myt_device", id); mem.myt_device = id; }
    return id;
  },
};
export const store = {
  get(k, d) {
    const v = isPref(k) && !consent.prefs() ? mem[k] ?? null : ls.get(k) ?? mem[k] ?? null;
    if (v == null) return d; try { return JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    const s = JSON.stringify(v); mem[k] = s;
    if (!isPref(k) || consent.prefs()) ls.set(k, s);
  },
};
/** guest bookings remembered on this device: [{reference, accessCode}] */
export const myRefs = {
  all() { return store.get("myt_refs", []); },
  add(reference, accessCode) { const a = this.all().filter((x) => x.reference !== reference); a.unshift({ reference, accessCode }); store.set("myt_refs", a.slice(0, 30)); },
  remove(reference) { store.set("myt_refs", this.all().filter((x) => x.reference !== reference)); },
  code(reference) { return this.all().find((x) => x.reference === reference)?.accessCode; },
};
export const favs = {
  all() { return store.get("myt_favs", []); },
  has(slug) { return this.all().includes(slug); },
  toggle(slug) { const a = this.all(); const i = a.indexOf(slug); if (i >= 0) a.splice(i, 1); else a.push(slug); store.set("myt_favs", a); return i < 0; },
};

export const ICON = {
  heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.2 3 4.5 6.7 4.5c2 0 3.6 1.1 4.3 2.6.7-1.5 2.3-2.6 4.3-2.6 3.7 0 5.9 3.7 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  heartO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20s-7-4.3-9-8.6C1.6 8.1 3.6 5 6.8 5c1.9 0 3.5 1.1 4.2 2.6.7-1.5 2.3-2.6 4.2-2.6 3.2 0 5.2 3.1 3.8 6.4C19 15.7 12 20 12 20z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back: '<svg class="flip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg class="flip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  explore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  trip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M13 6v12" stroke-dasharray="2 2"/></svg>',
  support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 16V11a6 6 0 1112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 5.6L19 9.4l-5.2 1.8L12 17l-1.8-5.8L5 9.4l5.2-1.8zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M16 13h2M3 10h18"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3z"/><circle cx="7.5" cy="16" r="1.5"/><circle cx="16.5" cy="16" r="1.5"/></svg>',
};
