// Partner portal — for excursion and transport partners (English). Server-side isolation: a partner only ever sees its own data.
import { api, money, fdate, ftime, fdt, cairoDay, $, $$, esc, html, raw, H, toast, modal, confirmBox, act, errMsg, showFieldErrors, formData, route, go, startRouter, EXAMPLE, startRuntime, resetExample, root, setStrings, setLang } from "./core.js";
import { startScanner } from "./hq-scan.js";
setStrings({ en: { cancel: "Cancel", err_other_tab: "The example app is open in another tab. Close it and reload.", err_offline: "You are offline.", err_generic: "Something went wrong.", varies: "Varies", h: "h", min: "min" } });
setLang("en");
let ME = null;
const view = () => $("#view");
const nice = (s) => String(s ?? "").replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const tone = { AWAITING_PARTNER: "warn", CONFIRMED: "ok", IN_PROGRESS: "ok", COMPLETED: "", CANCELLATION_REQUESTED: "bad" };
function shell(active) {
  const nav = [["#/", "Requests"], ["#/upcoming", "Upcoming"], ["#/checkin", "Check-in"], ["#/capacity", "Capacity & calendar"], ["#/statement", "Statement"], ["#/message", "Message HQ"]];
  return html`<div class="cons"><aside class="side"><a class="brand" href="#/"><img src="${root("img/logo.png")}" alt="" width="40" height="40"><span><b>ME &amp; YOU</b><small>Partner portal</small></span></a>
    <nav aria-label="Partner">${nav.map(([h, l]) => html`<a href="${h}" ${active === h ? raw('aria-current="page"') : ""}>${l}</a>`)}</nav>
    <div class="who">${ME.name}${ME.verified ? "" : " (not verified)"}<br><button class="link" style="color:#fff" data-logout>Sign out</button>${EXAMPLE ? html`<br><button class="link" style="color:var(--gold)" data-reset>Reset example data</button>` : ""}</div></aside><main class="main" id="view" tabindex="-1"></main></div>`;
}
const setView = (c, t) => { view().innerHTML = H(c); document.title = `${t} · Partner portal`; };
const card = (b, actions) => html`<div class="card pad"><div class="spread"><div><b>${b.activity}</b> · ${b.reference}<div class="small muted">${fdt(b.requested_start)} · ${b.adults} adults, ${b.children} children · lead guest ${b.lead_name}${b.lead_phone ? " · " + b.lead_phone : ""}</div></div><span class="badge ${tone[b.status] || "info"}">${nice(b.status)}</span></div>
  ${b.pickup_location ? html`<p class="small" style="margin:6px 0 0">Pickup: ${b.pickup_location}</p>` : ""}${b.notes ? html`<p class="small" style="margin:6px 0 0">Requests: ${b.notes}</p>` : ""}
  ${b.pickup_address ? html`<p class="small" style="margin:6px 0 0">Transfer: ${b.pickup_address} → ${b.transfer_destination}${b.flight_number ? " · flight " + b.flight_number : ""} · ${b.luggage} cases · ${b.child_seats} child seats · ride: ${nice(b.ride_status)}</p>` : ""}
  ${b.deadline_at && b.status === "AWAITING_PARTNER" ? html`<p class="small" style="margin:6px 0 0">Please answer before <b>${fdt(b.deadline_at)}</b></p>` : ""}<div class="row" style="margin-top:10px">${actions}</div></div>`;

route("/", async () => {
  const r = (await api("GET", "/api/v1/partner/bookings")).items;
  const open = r.filter((b) => b.status === "AWAITING_PARTNER");
  const later = r.filter((b) => ["OFFER_READY", "OFFER_SENT", "AWAITING_CUSTOMER_APPROVAL", "CUSTOMER_ACCEPTED", "PAYMENT_PENDING"].includes(b.status));
  setView(html`<h1 style="font-size:32px">Availability requests</h1><p class="muted">Confirm only what you can really deliver. Customers are not charged until you have confirmed and they accept the final offer.</p>
    ${EXAMPLE ? html`<p class="note small">Example environment — example partner, bookings and amounts.</p>` : ""}
    <div class="stack">${open.length ? open.map((b) => card(b, html`<button class="btn sm" data-yes="${b.id}" data-v="${b.version}">Yes, we can deliver</button><button class="btn ghost sm" data-no="${b.id}" data-v="${b.version}">Not possible</button>`)) : html`<p class="muted">No open requests.</p>`}</div>
    <h3 style="margin-top:24px">Confirmed by you — waiting for the customer</h3><div class="stack">${later.length ? later.map((b) => card(b, "")) : html`<p class="muted">Nothing waiting.</p>`}</div>`, "Requests");
  $$("[data-yes]").forEach((b) => b.onclick = () => answer(b, true));
  $$("[data-no]").forEach((b) => b.onclick = () => answer(b, false));
});
function answer(btn, yes) {
  const m = modal(html`<h3>${yes ? "Confirm availability" : "Decline request"}</h3><form class="stack"><label class="f">${yes ? "Note for the team (optional)" : "Reason (shared with the customer)"}<input class="inp" name="note" ${yes ? "" : raw("required")}></label><div class="row"><button class="btn ${yes ? "" : "danger"}">${yes ? "Confirm" : "Decline"}</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const id = btn.dataset.yes || btn.dataset.no;
    try { await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/partner/bookings/${id}/availability`, { body: { available: yes, note: e.target.note.value || undefined, expectedVersion: Number(btn.dataset.v) } }), yes ? "Confirmed — HQ prepares the offer" : "Declined"); m.close(); go(`/?t=${Date.now()}`); } catch {} };
}
route("/upcoming", async () => {
  const r = (await api("GET", "/api/v1/partner/bookings")).items.filter((b) => ["CONFIRMED", "IN_PROGRESS", "CANCELLATION_REQUESTED", "COMPLETED"].includes(b.status));
  const days = [...new Set(r.map((b) => cairoDay(b.requested_start)))].sort();
  setView(html`<h1 style="font-size:32px">Upcoming</h1>${days.length ? days.map((d) => html`<h3 style="margin-top:18px">${fdate(d + "T12:00:00Z", { weekday: true })}</h3><div class="stack">${r.filter((b) => cairoDay(b.requested_start) === d).map((b) => card(b, html`
    ${["CONFIRMED", "IN_PROGRESS"].includes(b.status) ? html`<button class="btn ghost sm" data-done="${b.id}">Mark delivered</button>` : ""}
    ${b.pickup_address && ["CONFIRMED", "IN_PROGRESS"].includes(b.status) ? html`<select class="inp" data-ride="${b.id}" style="max-width:220px;margin:0" aria-label="Ride status">${["DRIVER_ASSIGNED", "ON_THE_WAY", "PICKED_UP", "DROPPED_OFF", "ISSUE"].map((s) => html`<option value="${s}" ${s === b.ride_status ? raw("selected") : ""}>${nice(s)}</option>`)}</select>` : ""}
    ${b.status === "CANCELLATION_REQUESTED" ? html`<span class="small muted">The customer asked to cancel; HQ decides.</span>` : ""}`))}</div>`) : html`<p class="muted">No confirmed bookings.</p>`}`, "Upcoming");
  $$("[data-done]").forEach((b) => b.onclick = async () => { if (await confirmBox("Mark this activity as delivered?", "Delivered")) { await act(b, () => api("POST", `/api/v1/partner/bookings/${b.dataset.done}/complete`), "Marked as delivered"); go(`/upcoming?t=${Date.now()}`); } });
  $$("[data-ride]").forEach((s) => s.onchange = async () => { const body = { rideStatus: s.value }; if (s.value === "DRIVER_ASSIGNED") { const info = prompt("Driver name and car (shared with the customer):"); if (info) body.driverInfo = info; } if (s.value === "ISSUE") body.issueNote = prompt("What is the issue?") || "Issue reported"; await act(null, () => api("POST", `/api/v1/partner/bookings/${s.dataset.ride}/ride`, { body }), "Ride status updated"); });
});
route("/checkin", async () => {
  const queue = JSON.parse(localStorage.getItem("myt_offline_scans") || "[]");
  setView(html`<h1 style="font-size:32px">Check-in</h1><p class="muted">Scan the guest's QR code. Without internet, scans are stored on this device and checked as soon as you are online again — the earliest scan counts.</p>
    <div class="grid g2"><div class="card pad stack"><video data-cam playsinline muted style="width:100%;border-radius:12px;background:#000;display:none"></video><button class="btn" data-scan>Scan with camera</button>
      <form data-code class="stack"><label class="f">Ticket code<textarea class="inp" name="code" required placeholder="MYT1.…"></textarea></label><button class="btn ghost">Check ticket</button></form>
      ${queue.length ? html`<p class="note warn small">${queue.length} offline scan(s) waiting to sync. <button class="link" data-sync>Sync now</button></p>` : ""}</div><div data-res></div></div>`, "Check-in");
  const show = (r) => { const ok = r.result === "ACCEPTED"; $("[data-res]").innerHTML = H(html`<div class="card pad" style="border:3px solid ${ok ? "var(--ok)" : "var(--bad)"}"><h2 style="color:${ok ? "var(--ok)" : "var(--bad)"}">${ok ? "✓ Accepted" : "✕ " + nice(r.result)}</h2>
    ${ok ? html`<dl class="kv"><dt>Booking</dt><dd>${r.reference}</dd><dt>Lead guest</dt><dd>${r.lead_name}</dd><dt>Participants</dt><dd>${r.participants}</dd><dt>Pickup</dt><dd>${r.pickup || "—"}</dd></dl>` : r.used_at ? html`<p>Already used at ${fdt(r.used_at)}</p>` : r.result === "WRONG_DATE" ? html`<p>This ticket is for ${r.date}.</p>` : r.result === "FORBIDDEN" ? html`<p>This ticket is not for your activities.</p>` : ""}</div>`); };
  const check = async (code, btn) => {
    if (!navigator.onLine) { queue.push({ code, at: new Date().toISOString() }); localStorage.setItem("myt_offline_scans", JSON.stringify(queue)); return show({ result: "STORED_OFFLINE" }); }
    show(await act(btn, () => api("POST", "/api/v1/partner/checkin", { body: { code } })));
  };
  $("[data-code]").onsubmit = (e) => { e.preventDefault(); check(e.target.code.value.trim(), e.target.querySelector(".btn")); };
  $("[data-scan]").onclick = () => startScanner($("[data-cam]"), (code) => check(code, null));
  $("[data-sync]")?.addEventListener("click", async (e) => { const res = []; for (const s of queue) res.push(await api("POST", "/api/v1/partner/checkin", { body: { code: s.code, offlineAt: s.at } }).catch((x) => ({ result: x.message }))); localStorage.setItem("myt_offline_scans", "[]"); toast(`${res.filter((r) => r.result === "ACCEPTED").length} accepted, ${res.filter((r) => r.result !== "ACCEPTED").length} refused`); go(`/checkin?t=${Date.now()}`); });
});
route("/capacity", async () => {
  const r = (await api("GET", "/api/v1/partner/activities")).items;
  setView(html`<h1 style="font-size:32px">Capacity &amp; calendar</h1><p class="muted">Places you open here can be reserved directly by customers. Capacity can never go below places already held or booked.</p>
    <p class="note">Me &amp; You Tours sells private service only: one party per departure. When a customer books a departure, the whole boat or car is reserved for that party — never add other guests to it.</p>
    ${r.map((a) => html`<div class="card pad" style="margin-bottom:14px"><div class="spread"><div><b>${a.name}</b> <span class="small muted">${a.code} · ${a.booking_model === "INSTANT" ? "live capacity" : "on request"}</span></div><span class="small">Your net rate: ${money(a.partner_cost_adult_minor, a.currency || "EGP")} adult · ${money(a.partner_cost_child_minor, a.currency || "EGP")} child</span></div>
      <div class="note ${a.privacy_level === "FULLY_PRIVATE" && !a.privacy_guaranteed ? "bad" : ""}" style="margin:10px 0"><b>Privacy level: ${nice(a.privacy_level)}</b>${a.private_scope ? html`<div class="small">${a.private_scope}</div>` : ""}
        <div class="row" style="margin-top:6px">${a.privacy_guaranteed ? html`<span class="badge ok">✓ You guaranteed exclusivity (${a.privacy_guarantee_ref})</span><button class="link" data-guar="${a.id}" data-g="false">Withdraw guarantee</button>`
          : html`<span class="small muted">If the activity and its facilities are truly exclusive for one party, you can guarantee it. Only then can it be sold as "Fully private".</span><button class="btn ghost sm" data-guar="${a.id}" data-g="true">I guarantee exclusivity</button>`}</div></div>
      <form class="formgrid" data-add="${a.id}" style="margin:10px 0"><label class="f">From<input class="inp" type="date" name="from" required value="${cairoDay(Date.now())}"></label><label class="f">To<input class="inp" type="date" name="to" required></label><label class="f">Times<input class="inp" name="times" value="${(a.departure_times || []).join(", ") || "09:00"}"></label><label class="f">Places<input class="inp" type="number" name="capacity" min="0" value="${a.max_capacity || 10}"></label><button class="btn sm" style="align-self:end">Open dates</button></form>
      <div class="tw"><table><tr><th>Start</th><th class="num">Places</th><th class="num">Held</th><th class="num">Booked</th><th></th></tr>${a.slots.slice(0, 30).map((s) => html`<tr><td>${fdt(s.starts_at)}${s.closed ? html` <span class="badge bad">closed</span>` : ""}</td><td class="num"><input class="inp" type="number" min="${s.held + s.booked}" value="${s.capacity}" data-cap="${s.id}" style="width:90px;margin:0;display:inline-block" aria-label="Places"></td><td class="num">${s.held}</td><td class="num">${s.booked}</td><td><button class="link" data-close-slot="${s.id}" data-c="${s.closed}">${s.closed ? "Re-open" : "Close"}</button></td></tr>`)}</table></div></div>`)}
    <p class="small muted">Prices to customers are set by Me &amp; You Tours. To change your net rate, send a message to HQ.</p>`, "Capacity");
  $$("[data-add]").forEach((f) => f.onsubmit = async (e) => { e.preventDefault(); const d = formData(f); try { const x = await act(f.querySelector(".btn"), () => api("POST", `/api/v1/partner/activities/${f.dataset.add}/slots`, { body: { from: d.from, to: d.to, times: d.times.split(",").map((s) => s.trim()), capacity: Number(d.capacity) } })); toast(`${x.count} dates opened or updated`); go(`/capacity?t=${Date.now()}`); } catch (err) { showFieldErrors(f, err); } });
  $$("[data-guar]").forEach((b) => b.onclick = async () => { try { await act(b, () => api("POST", `/api/v1/partner/activities/${b.dataset.guar}/privacy-guarantee`, { body: { granted: b.dataset.g === "true" } }), "Saved"); go(`/capacity?t=${Date.now()}`); } catch {} });
  $$("[data-cap]").forEach((i) => i.onchange = async () => { try { await act(null, () => api("POST", `/api/v1/partner/slots/${i.dataset.cap}`, { body: { capacity: Number(i.value) } }), "Capacity saved"); } catch { go(`/capacity?t=${Date.now()}`); } });
  $$("[data-close-slot]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", `/api/v1/partner/slots/${b.dataset.closeSlot}`, { body: { closed: b.dataset.c !== "true" } }), "Saved"); go(`/capacity?t=${Date.now()}`); });
});
route("/statement", async () => {
  const s = await api("GET", "/api/v1/partner/statement");
  const open = s.open.reduce((a, b) => a + b.partner_cost_minor, 0);
  setView(html`<h1 style="font-size:32px">Statement</h1><div class="kpis"><div class="kpi"><b>${money(open)}</b><span>To be settled (${s.open.length} bookings)</span></div></div>
    <h3 style="margin-top:18px">Bookings not yet settled</h3><div class="tw"><table><tr><th>Booking</th><th>Date</th><th>Status</th><th class="num">Your amount</th></tr>${s.open.map((o) => html`<tr><td>${o.reference}</td><td>${fdate(o.requested_start)}</td><td>${nice(o.status)}</td><td class="num">${money(o.partner_cost_minor, o.currency)}</td></tr>`)}</table></div>
    <h3 style="margin-top:18px">Settlements</h3><div class="tw"><table><tr><th>Period</th><th class="num">Amount</th><th>Status</th><th>Paid</th></tr>${s.settlements.map((x) => html`<tr><td>${fdate(x.period_start)} – ${fdate(x.period_end)}</td><td class="num">${money(x.amount_minor, x.currency)}</td><td>${nice(x.status)}</td><td>${x.paid_at ? fdate(x.paid_at) : "—"}</td></tr>`)}</table></div>`, "Statement");
});
route("/message", async () => {
  setView(html`<h1 style="font-size:32px">Message HQ</h1><form class="card pad stack" style="max-width:640px" data-msg><label class="f">Topic<select class="inp" name="topic"><option value="PARTNER_ISSUE">Problem / cannot deliver</option><option value="CHANGE">Change (dates, rates, capacity)</option><option value="OTHER">Other</option></select></label>
    <label class="f">Booking reference (optional)<input class="inp" name="reference"></label><label class="f">Urgency<select class="inp" name="urgency"><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select></label><label class="f">Message<textarea class="inp" name="message" required></textarea></label><button class="btn">Send</button></form>`, "Message HQ");
  $("[data-msg]").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); try { const r = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/partner/message", { body: { ...d, reference: d.reference || null } })); e.target.reset(); toast(`Sent as ${r.number}`); } catch (err) { showFieldErrors(e.target, err); } };
});

function loginView(err) {
  $("#shell").innerHTML = H(html`<div class="login"><div class="card"><a class="brand" href="${root("")}"><img src="${root("img/logo.png")}" alt="" width="44" height="44"><span><b>ME &amp; YOU</b><small>Partner portal</small></span></a>
    <h1 style="font-size:28px;margin-top:16px">Partner sign-in</h1>${err ? html`<p class="note bad small">${err}</p>` : ""}
    <form class="stack" data-login><label class="f">E-mail<input class="inp" type="email" name="email" autocomplete="username" required></label><label class="f">Password<input class="inp" type="password" name="password" autocomplete="current-password" required></label><button class="btn">Sign in</button></form>
    ${EXAMPLE ? html`<div class="demo-acc"><p class="small muted" style="margin:6px 0 0">Example partner accounts (password <b>voorbeeld-2026</b>):</p>${["boat", "desert", "culture", "transport"].map((k) => html`<button type="button" data-ex="${k}.partner@example.com">Example ${k} partner · ${k}.partner@example.com</button>`)}</div>` : ""}
    <p class="small muted" style="margin-top:14px"><a href="${root("hq/")}">Business HQ</a> · <a href="${root("")}">Website</a></p></div></div>`);
  const f = $("[data-login]");
  f.onsubmit = async (e) => { e.preventDefault(); try { await act(f.querySelector(".btn"), () => api("POST", "/api/v1/auth/login", { body: formData(f) })); start(); } catch {} };
  $$("[data-ex]").forEach((b) => b.onclick = () => { f.email.value = b.dataset.ex; f.password.value = "voorbeeld-2026"; f.requestSubmit(); });
}
let started = false;
async function start() {
  try { ME = await api("GET", "/api/v1/partner/me"); }
  catch (e) { if (e.status === 401) return loginView(); if (e.status === 403) { await api("POST", "/api/v1/auth/logout"); return loginView("Staff accounts use Business HQ."); } throw e; }
  const draw = async (fn, params, query, path) => {
    $("#shell").innerHTML = H(shell("#/" + (path.split("/")[1] || "")));
    $("[data-logout]").onclick = async () => { await api("POST", "/api/v1/auth/logout"); loginView(); };
    $("[data-reset]")?.addEventListener("click", async () => { if (await confirmBox("Reset all example data?", "Reset", true)) resetExample(); });
    try { if (!fn) return setView(html`<h1>Not found</h1>`, "Not found"); await fn(params, query); }
    catch (e) { if (e.status === 401) return loginView("Your session has expired."); view().innerHTML = H(html`<div class="empty"><h2>Could not load</h2><p>${errMsg(e)}</p></div>`); }
  };
  if (!started) { started = true; startRouter(draw); } else window.dispatchEvent(new HashChangeEvent("hashchange"));
}
(async () => {
  try { await startRuntime(); } catch (e) { $("#splash").innerHTML = `<div><h1>Partner portal</h1><p>${esc(errMsg(e))}</p></div>`; return; }
  $("#splash")?.remove(); start();
})();
