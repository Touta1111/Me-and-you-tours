// Business Headquarters — internal console for staff (English; staff UI).
import { startScanner } from "./hq-scan.js";
import { api, ApiError, money, fdate, ftime, fdt, cairoDay, $, $$, esc, html, raw, H, toast, modal, confirmBox, act, errMsg, showFieldErrors, formData, route, go, current, startRouter, EXAMPLE, startRuntime, resetExample, root, setStrings, setLang, newKey } from "./core.js";
setStrings({ en: { cancel: "Cancel", err_other_tab: "The example app is open in another tab. Close it and reload.", err_offline: "You are offline.", err_generic: "Something went wrong.", varies: "Varies", h: "h", min: "min" } });
setLang("en");
let USER = null, PERMS = [];
const can = (p) => PERMS.includes(p);
const view = () => $("#view");
const ST = { CONFIRMED: "ok", IN_PROGRESS: "ok", COMPLETED: "ok", CANCELLED: "bad", EXPIRED: "bad", FAILED: "bad", REFUNDED: "", PARTIALLY_REFUNDED: "", REFUND_PENDING: "warn", CANCELLATION_REQUESTED: "warn", AVAILABILITY_REQUESTED: "warn", AWAITING_PARTNER: "warn", OFFER_READY: "warn", PAYMENT_PENDING: "info", PAYMENT_VERIFICATION: "info", CUSTOMER_ACCEPTED: "info", OFFER_SENT: "info", AWAITING_CUSTOMER_APPROVAL: "info" };
const badge = (s) => html`<span class="badge ${ST[s] || ""}">${String(s).replaceAll("_", " ").toLowerCase()}</span>`;
const nice = (s) => String(s ?? "").replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function shell(active) {
  const nav = [["#/", "Dashboard", "bookings.view"], ["#/today", "Today", "bookings.view"], ["#/bookings", "Bookings", "bookings.view"], ["#/checkin", "Check-in", "tickets.validate"], ["#/catalog", "Experiences", "bookings.view"],
    ["#/partners", "Partners", "bookings.view"], ["#/customers", "Customers (CRM)", "bookings.view"], ["#/support", "Support desk", "support.manage"], ["#/finance", "Finance", "finance.reports"], ["#/outbox", "Notifications", "bookings.view"],
    ["#/audit", "Audit log", "audit.view"], ["#/users", "Users", "users.manage"], ["#/settings", "Settings", "bookings.view"]].filter(([, , p]) => can(p));
  return html`<div class="cons"><aside class="side"><a class="brand" href="#/"><img src="${root("img/logo.png")}" alt="" width="40" height="40"><span><b>ME &amp; YOU</b><small>Business HQ</small></span></a>
    <nav aria-label="HQ">${nav.map(([h, l]) => html`<a href="${h}" ${active === h ? raw('aria-current="page"') : ""}>${l}</a>`)}</nav>
    <div class="who">${USER.title}<br>${USER.email}<br><button class="link" style="color:#fff" data-logout>Sign out</button>${EXAMPLE ? html`<br><button class="link" style="color:var(--gold)" data-reset>Reset example data</button>` : ""}</div></aside>
    <main class="main" id="view" tabindex="-1"></main></div>`;
}
function setView(content, title) { view().innerHTML = H(content); document.title = `${title} · Business HQ`; view().focus({ preventScroll: true }); }
const table = (cols, rows, onClick) => html`<div class="tw"><table><thead><tr>${cols.map((c) => html`<th class="${c.num ? "num" : ""}">${c.h}</th>`)}</tr></thead><tbody>${rows.length ? rows.map((r) => html`<tr class="${onClick ? "click" : ""}" ${onClick ? raw(`data-href="${esc(onClick(r))}" tabindex="0"`) : ""}>${cols.map((c) => html`<td class="${c.num ? "num" : ""}">${c.v(r)}</td>`)}</tr>`) : html`<tr><td colspan="${cols.length}" class="muted">Nothing here.</td></tr>`}</tbody></table></div>`;
function bindRows() { $$("tr[data-href]").forEach((tr) => { tr.onclick = () => go(tr.dataset.href); tr.onkeydown = (e) => { if (e.key === "Enter") go(tr.dataset.href); }; }); }
const exampleNote = () => (EXAMPLE ? html`<p class="note small">Example environment — all partners, prices, customers and bookings are example data. Payments run through the test provider.</p>` : "");

// ---------------------------------------------------------------- dashboard
route("/", async () => {
  const d = await api("GET", "/api/v1/hq/dashboard");
  const k = (n, label, href, alert) => html`<a class="kpi ${alert && n ? "alert" : ""}" href="${href}"><b>${n}</b><span>${label}</span></a>`;
  setView(html`<div class="spread"><div><p class="k">Business HQ</p><h1 style="font-size:34px">Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${USER.title}</h1></div><a class="btn" href="#/today">Today's tasks</a></div>${exampleNote()}
    <h3 style="margin-top:18px">What needs attention</h3>
    <div class="kpis">${k(d.new_requests, "New requests to review", "#/bookings?status=AVAILABILITY_REQUESTED", 1)}${k(d.offers_to_prepare, "Offers to prepare", "#/bookings?status=OFFER_READY", 1)}${k(d.awaiting_partner, "Waiting for partner", "#/bookings?status=AWAITING_PARTNER")}
      ${k(d.partner_overdue, "Partner response overdue", "#/bookings?status=AWAITING_PARTNER", 1)}${k(d.open_offers, "Open offers at customers", "#/bookings?status=OFFER_SENT,AWAITING_CUSTOMER_APPROVAL")}${k(d.payments_pending, "Payments in progress", "#/bookings?status=CUSTOMER_ACCEPTED,PAYMENT_PENDING,PAYMENT_VERIFICATION")}
      ${k(d.payments_to_review, "Payments to check", "#/outbox", 1)}${k(d.cancellations, "Cancellation requests", "#/bookings?status=CANCELLATION_REQUESTED", 1)}${k(d.refunds_pending, "Refunds to pay", "#/bookings?status=REFUND_PENDING", 1)}</div>
    <h3 style="margin-top:22px">Operations</h3>
    <div class="kpis">${k(d.upcoming, "Confirmed, next 7 days", "#/bookings?status=CONFIRMED")}${k(d.transfers_today, "Transfers today", "#/today")}${k(d.support_open, "Open support tickets", "#/support")}${k(d.support_overdue, "Support overdue", "#/support", 1)}${k(d.active_partners, "Active verified partners", "#/partners")}</div>
    ${d.finance_month ? html`<h3 style="margin-top:22px">This month (confirmed bookings)</h3>${d.finance_month.length ? d.finance_month.map((f) => html`<div class="kpis"><div class="kpi"><b>${money(f.gross, f.currency)}</b><span>Booking value (${f.bookings})</span></div><div class="kpi"><b>${money(f.partner_cost, f.currency)}</b><span>Partner costs</span></div>
      <div class="kpi"><b>${money(f.fees, f.currency)}</b><span>Payment fees</span></div><div class="kpi"><b>${money(f.tax, f.currency)}</b><span>Taxes</span></div><div class="kpi"><b>${money(f.margin, f.currency)}</b><span>Gross margin</span></div></div>`) : html`<p class="muted">No confirmed bookings this month.</p>`}` : ""}`, "Dashboard");
});

// ---------------------------------------------------------------- today
route("/today", async () => {
  const d = await api("GET", "/api/v1/hq/today");
  const list = (rows, empty) => rows.length ? table([{ h: "When", v: (r) => fdt(r.requested_start) }, { h: "Ref", v: (r) => r.reference }, { h: "Experience", v: (r) => r.activity }, { h: "Guest", v: (r) => `${r.customer} (${r.pax})` }, { h: "Partner", v: (r) => r.partner || "—" }, { h: "Status", v: (r) => badge(r.status) }], rows, (r) => `/bookings/${r.id}`) : html`<p class="muted">${empty}</p>`;
  setView(html`<p class="k">Daily overview · ${fdate(new Date(), { weekday: true, year: true })}</p><h1 style="font-size:34px">Today's tasks</h1>
    <h3>1. What must be confirmed today</h3>${list(d.to_confirm, "Nothing to confirm.")}
    <h3 style="margin-top:20px">2. Partners that must respond</h3>${list(d.partner_waiting, "No open partner requests.")}
    <h3 style="margin-top:20px">3. Customers departing today</h3>${list(d.departures, "No departures today.")}
    <h3 style="margin-top:20px">4. Transfers (next 36 hours)</h3>${list(d.transfers, "No transfers planned.")}
    <h3 style="margin-top:20px">5. Open problems</h3>${d.issues.length ? table([{ h: "Ticket", v: (r) => r.number }, { h: "From", v: (r) => r.name }, { h: "Topic", v: (r) => nice(r.topic) }, { h: "Urgency", v: (r) => nice(r.urgency) }, { h: "Due", v: (r) => html`<span class="${new Date(r.due_at) < Date.now() ? "badge bad" : ""}">${fdt(r.due_at)}</span>` }, { h: "Status", v: (r) => nice(r.status) }], d.issues) : html`<p class="muted">No open problems.</p>`}`, "Today");
  bindRows();
});

// ---------------------------------------------------------------- bookings
const GROUPS = [["", "All"], ["AVAILABILITY_REQUESTED,OFFER_READY", "To handle"], ["AWAITING_PARTNER", "Waiting for partner"], ["OFFER_SENT,AWAITING_CUSTOMER_APPROVAL", "Offer sent"], ["CUSTOMER_ACCEPTED,PAYMENT_PENDING,PAYMENT_VERIFICATION", "Payment"], ["CONFIRMED,IN_PROGRESS", "Confirmed"], ["CANCELLATION_REQUESTED,REFUND_PENDING", "Cancellations/refunds"], ["COMPLETED", "Completed"], ["CANCELLED,EXPIRED,FAILED,REFUNDED,PARTIALLY_REFUNDED", "Closed"]];
route("/bookings", async (p, q) => {
  const params = new URLSearchParams(); if (q.status) params.set("status", q.status); if (q.q) params.set("q", q.q);
  const r = await api("GET", `/api/v1/hq/bookings?${params}`);
  setView(html`<h1 style="font-size:34px">Bookings</h1>
    <form class="toolbar" data-f><input class="inp" name="q" value="${q.q || ""}" placeholder="Search reference, name or e-mail" aria-label="Search"><button class="btn sm">Search</button></form>
    <div class="chips" style="margin-bottom:14px">${GROUPS.map(([s, l]) => html`<a class="chip ${(q.status || "") === s ? "on" : ""}" href="#/bookings${s ? "?status=" + s : ""}">${l}</a>`)}</div>
    ${table([{ h: "Ref", v: (b) => b.reference }, { h: "Experience", v: (b) => b.activity }, { h: "Start", v: (b) => fdt(b.requested_start) }, { h: "Guest", v: (b) => b.customer }, { h: "Pax", v: (b) => b.adults + b.children, num: 1 },
      { h: "Model", v: (b) => (b.booking_model === "INSTANT" ? "Live" : "Request") }, { h: "Total", v: (b) => money(b.total_minor, b.currency || "EGP"), num: 1 }, { h: "Paid", v: (b) => money(b.paid_minor, b.currency || "EGP"), num: 1 }, { h: "Deadline", v: (b) => (b.deadline_at ? fdt(b.deadline_at) : "—") }, { h: "Status", v: (b) => badge(b.status) }], r.items, (b) => `/bookings/${b.id}`)}`, "Bookings");
  $("[data-f]").onsubmit = (e) => { e.preventDefault(); const s = new URLSearchParams(); if (q.status) s.set("status", q.status); if (e.target.q.value) s.set("q", e.target.q.value); go(`/bookings?${s}`); };
  bindRows();
});

route("/bookings/:id", async ({ id }) => {
  const b = await api("GET", `/api/v1/hq/bookings/${id}`);
  const nx = new Set(b.next);
  const reload = () => go(`/bookings/${id}?t=${Date.now()}`);
  const v = { expectedVersion: b.version };
  setView(html`<a class="link" href="#/bookings">← Bookings</a>
    <div class="spread"><div><p class="k">${b.reference} · ${b.model === "INSTANT" ? "live capacity" : "on request"} · version ${b.version}</p><h1 style="font-size:32px;margin:0">${b.activity?.name}</h1></div>${badge(b.status)}</div>
    <div class="cols" style="margin-top:16px"><div class="stack">
      <div class="card pad"><h3>Actions</h3><div class="row">
        ${b.can.manage && nx.has("AWAITING_PARTNER") ? html`<button class="btn sm" data-a="forward">Forward to partner</button>` : ""}
        ${b.can.manage && nx.has("OFFER_READY") && ["AVAILABILITY_REQUESTED", "AWAITING_PARTNER"].includes(b.status) ? html`<button class="btn sm" data-a="avail-yes">Confirm availability (authorised staff)</button>` : ""}
        ${b.can.manage && nx.has("FAILED") && ["AVAILABILITY_REQUESTED", "AWAITING_PARTNER"].includes(b.status) ? html`<button class="btn ghost sm" data-a="avail-no">Not available</button>` : ""}
        ${b.can.offer && b.status === "OFFER_READY" ? html`<button class="btn sm" data-a="offer">Prepare &amp; send offer</button>` : ""}
        ${b.can.manage && ["EXPIRED", "FAILED"].includes(b.status) ? html`<button class="btn ghost sm" data-a="reopen">Re-check availability</button>` : ""}
        ${b.can.cancel && ["CONFIRMED", "CANCELLATION_REQUESTED"].includes(b.status) ? html`<button class="btn ghost sm" data-a="cancel">Decide cancellation</button>` : ""}
        ${b.can.refund && b.status === "REFUND_PENDING" ? html`<button class="btn sm" data-a="refund">Pay refund</button>` : ""}
        ${b.can.manage && ["CONFIRMED", "IN_PROGRESS"].includes(b.status) ? html`<button class="btn ghost sm" data-a="complete">Mark completed</button>` : ""}
        ${b.transfer && b.can.manage ? html`<button class="btn ghost sm" data-a="transfer">Transfer operations</button>` : ""}
      </div>${!b.next.length ? html`<p class="small muted">No further staff actions for this status.</p>` : ""}</div>
      <div class="card pad"><h3>Request</h3><dl class="kv"><dt>Start</dt><dd>${fdt(b.start)} (Cairo)</dd><dt>Party</dt><dd>${b.adults} adults, ${b.children} children</dd><dt>Pickup</dt><dd>${b.pickup || "—"}</dd><dt>Notes</dt><dd>${b.notes || "—"}</dd><dt>Source</dt><dd>${b.request?.source}</dd><dt>Partner</dt><dd>${b.partner?.name || "—"}</dd>
        ${b.deadline_at ? html`<dt>Deadline</dt><dd>${fdt(b.deadline_at)}</dd>` : ""}</dl></div>
      ${b.transfer ? html`<div class="card pad"><h3>Transfer</h3><dl class="kv"><dt>From</dt><dd>${b.transfer.pickup_address}</dd><dt>To</dt><dd>${b.transfer.destination}</dd><dt>Flight</dt><dd>${b.transfer.flight_number || "—"}</dd><dt>Luggage / seats</dt><dd>${b.transfer.luggage} / ${b.transfer.child_seats}</dd><dt>Pickup</dt><dd>${b.transfer.confirmed_pickup_at ? fdt(b.transfer.confirmed_pickup_at) : "not confirmed"}</dd><dt>Driver</dt><dd>${b.transfer.driver_info || "—"}</dd><dt>Ride</dt><dd>${nice(b.transfer.ride_status)}</dd></dl></div>` : ""}
      ${b.offer ? html`<div class="card pad"><h3>Offer rev ${b.offer.revision}</h3><p class="small muted">Valid until ${fdt(b.offer.valid_until)} · terms ${b.offer.terms_version} · policy ${b.offer.cancel_version}</p>
        <div class="tw"><table>${b.offer.price_snapshot.lines.map((l) => html`<tr><td>${l.code === "ADULT" ? "Adults" : l.code === "CHILD" ? "Children" : l.label} × ${l.qty}</td><td class="num">${money(l.amount_minor, b.offer.currency)}</td></tr>`)}<tr><td>Tax</td><td class="num">${money(b.offer.price_snapshot.tax_minor, b.offer.currency)}</td></tr><tr><th>Total</th><th class="num">${money(b.offer.total_minor, b.offer.currency)}</th></tr></table></div></div>` : ""}
      <div class="card pad"><h3>Status history</h3><ol class="timeline">${b.history.map((h) => html`<li class="done"><b>${nice(h.to_status)}</b> <span class="small muted">by ${h.actor_type.toLowerCase()} · ${fdt(h.at)}</span>${h.reason ? html`<div class="small">${h.reason}</div>` : ""}</li>`)}</ol></div>
    </div><div class="stack">
      <div class="card pad"><h3>Customer</h3><dl class="kv"><dt>Name</dt><dd><a href="#/customers/${b.customer.id}">${b.customer.name}</a></dd><dt>E-mail</dt><dd>${b.customer.email}</dd><dt>Phone</dt><dd>${b.customer.phone || "—"}</dd><dt>Language</dt><dd>${b.customer.lang}</dd></dl></div>
      <div class="card pad"><h3>Money</h3><dl class="kv"><dt>Total</dt><dd>${money(b.total_minor, b.currency || "EGP")}</dd><dt>Deposit</dt><dd>${money(b.deposit_minor, b.currency || "EGP")}</dd><dt>Paid</dt><dd>${money(b.paid_minor, b.currency || "EGP")}</dd><dt>Refunded</dt><dd>${money(b.refunded_minor, b.currency || "EGP")}</dd>
        ${b.status === "CANCELLATION_REQUESTED" || b.status === "REFUND_PENDING" ? html`<dt>Policy suggests</dt><dd>${money(b.suggested_refund_minor, b.currency || "EGP")}</dd>` : ""}</dl>
        ${b.payments_detail ? html`<h3 style="margin-top:12px">Payments</h3>${table([{ h: "Kind", v: (p) => p.kind }, { h: "Amount", v: (p) => money(p.amount_minor, p.currency), num: 1 }, { h: "Status", v: (p) => p.status }, { h: "Provider ref", v: (p) => p.provider_txn_id || p.provider_order_id || "—" }], b.payments_detail)}
          <h3 style="margin-top:12px">Provider callbacks</h3>${table([{ h: "Received", v: (e) => fdt(e.received_at) }, { h: "Verified", v: (e) => (e.verified ? "yes" : "NO") }, { h: "Result", v: (e) => e.result }], b.payment_events || [])}` : ""}
        ${b.refunds.length ? html`<h3 style="margin-top:12px">Refunds</h3>${table([{ h: "Date", v: (r) => fdate(r.created_at) }, { h: "Amount", v: (r) => money(r.amount_minor, b.currency), num: 1 }, { h: "Status", v: (r) => r.status }], b.refunds)}` : ""}
        ${b.invoices.length ? html`<h3 style="margin-top:12px">Invoices</h3>${table([{ h: "Number", v: (i) => i.number }, { h: "Kind", v: (i) => nice(i.kind) }, { h: "Amount", v: (i) => money(i.amount_minor, i.currency), num: 1 }], b.invoices)}` : ""}</div>
      ${b.commission ? html`<div class="card pad"><h3>Commission &amp; margin</h3><dl class="kv"><dt>Role</dt><dd>${nice(b.commission.sales_role)}</dd><dt>Gross</dt><dd>${money(b.commission.gross_minor, b.commission.currency)}</dd><dt>Partner cost</dt><dd>${money(b.commission.partner_cost_minor, b.commission.currency)}</dd><dt>Payment fee</dt><dd>${money(b.commission.payment_fee_minor, b.commission.currency)}</dd><dt>Tax</dt><dd>${money(b.commission.tax_minor, b.commission.currency)}</dd><dt>Margin</dt><dd><b>${money(b.commission.margin_minor, b.commission.currency)}</b></dd></dl></div>` : ""}
      ${b.ticket ? html`<div class="card pad"><h3>Ticket</h3><p>${b.ticket.status}</p></div>` : ""}
    </div></div>`, b.reference);

  const A = {
    forward: (btn) => act(btn, () => api("POST", `/api/v1/hq/bookings/${id}/forward`, { body: v }), "Forwarded to the partner").then(reload),
    "avail-yes": async (btn) => { if (await confirmBox("Confirm that the activity can be delivered on this date? Only do this when the partner has confirmed to you directly.", "Confirm availability")) act(btn, () => api("POST", `/api/v1/hq/bookings/${id}/availability`, { body: { ...v, available: true, note: "Confirmed by staff" } }), "Availability confirmed").then(reload); },
    "avail-no": () => { const m = modal(html`<h3>Not available</h3><form class="stack"><label class="f">Reason for the customer<input class="inp" name="note" required></label><div class="row"><button class="btn danger">Mark not available</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
      m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/bookings/${id}/availability`, { body: { ...v, available: false, note: e.target.note.value } }), "Customer informed"); m.close(); reload(); }; },
    offer: () => { const m = modal(html`<h3>Prepare offer</h3><p class="small muted">The price is calculated by the server from the current price version. Partner cost, tax and terms version are stored with it.</p><form class="stack"><label class="f">Valid for (hours)<input class="inp" type="number" name="validHours" value="24" min="1" max="168"></label><div class="row"><button class="btn">Send offer</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
      m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/bookings/${id}/offer`, { body: { ...v, validHours: Number(e.target.validHours.value) } }), "Offer sent"); m.close(); reload(); }; },
    reopen: (btn) => act(btn, () => api("POST", `/api/v1/hq/bookings/${id}/reopen`), "Re-opened").then(reload),
    cancel: () => { const m = modal(html`<h3>Cancellation decision</h3><p class="small">Paid ${money(b.paid_minor, b.currency)} · refunded ${money(b.refunded_minor, b.currency)} · the accepted policy suggests <b>${money(b.suggested_refund_minor, b.currency)}</b>.</p>
      <form class="stack"><label class="check"><input type="radio" name="d" value="approve" checked> Approve under the accepted policy</label><label class="check"><input type="radio" name="d" value="provider"> Cancelled by provider / partner (full refund)</label><label class="check"><input type="radio" name="d" value="refuse"> Refuse (booking stays confirmed)</label>
      <label class="f">Refund amount (EGP, optional override)<input class="inp" type="number" name="amount" min="0" step="0.01" value="${(b.suggested_refund_minor / 100).toFixed(2)}"></label><label class="f">Reason (kept as evidence)<input class="inp" name="reason" required></label>
      <div class="row"><button class="btn">Save decision</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
      m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target);
        const body = { ...v, approve: d.d !== "refuse", byProvider: d.d === "provider", reason: d.reason, ...(d.d === "approve" && d.amount != null ? { refundMinor: Math.round(Number(d.amount) * 100) } : {}) };
        try { await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/bookings/${id}/cancellation`, { body }), "Decision saved"); m.close(); reload(); } catch (err) { showFieldErrors(e.target, err); } }; },
    refund: () => { const due = b.paid_minor - b.refunded_minor; const key = newKey(); const m = modal(html`<h3>Pay refund</h3><p class="small">Refundable: <b>${money(due, b.currency)}</b>. The refund is executed at the payment provider; a double click cannot pay twice.</p>
      <form class="stack"><label class="f">Amount (EGP)<input class="inp" type="number" step="0.01" min="0.01" name="amount" value="${(due / 100).toFixed(2)}" max="${(due / 100).toFixed(2)}"></label><label class="f">Reason<input class="inp" name="reason" required value="Cancellation approved"></label><div class="row"><button class="btn">Execute refund</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
      m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); try { await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/bookings/${id}/refund`, { body: { amountMinor: Math.round(Number(d.amount) * 100), reason: d.reason }, idem: true, key }), "Refund executed"); m.close(); reload(); } catch {} }; },
    complete: async (btn) => { if (await confirmBox("Mark this booking as completed?", "Mark completed")) act(btn, () => api("POST", `/api/v1/hq/bookings/${id}/complete`), "Completed").then(reload); },
    transfer: async () => { const partners = (await api("GET", "/api/v1/hq/partners")).items.filter((p) => p.kind === "TRANSPORT" && p.verified && p.active);
      const m = modal(html`<h3>Transfer operations</h3><form class="stack"><label class="f">Carrier (licensed transport partner)<select class="inp" name="carrierPartnerId"><option value="">—</option>${partners.map((p) => html`<option value="${p.id}">${p.name}</option>`)}</select></label>
        <label class="f">Confirmed pickup (Cairo time)<input class="inp" type="datetime-local" name="pickup" value="${b.transfer.confirmed_pickup_at ? new Date(b.transfer.confirmed_pickup_at).toISOString().slice(0, 16) : ""}"></label><label class="f">Driver details (only when the carrier allows sharing)<input class="inp" name="driverInfo" value="${b.transfer.driver_info || ""}"></label>
        <label class="f">Ride status<select class="inp" name="rideStatus">${["PLANNED", "DRIVER_ASSIGNED", "ON_THE_WAY", "PICKED_UP", "DROPPED_OFF", "ISSUE", "CANCELLED"].map((s) => html`<option ${s === b.transfer.ride_status ? raw("selected") : ""}>${s}</option>`)}</select></label><label class="f">Issue note<input class="inp" name="issueNote"></label>
        <div class="row"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
      m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); const body = { carrierPartnerId: d.carrierPartnerId || null, driverInfo: d.driverInfo || null, rideStatus: d.rideStatus, issueNote: d.issueNote || null };
        if (d.pickup) body.confirmedPickupAt = new Date(d.pickup + ":00+02:00").toISOString();
        await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/bookings/${id}/transfer`, { body }), "Saved — every change is logged"); m.close(); reload(); }; },
  };
  $$("[data-a]").forEach((btn) => btn.onclick = () => Promise.resolve(A[btn.dataset.a](btn)).catch(() => {}));
});

// ---------------------------------------------------------------- check-in
route("/checkin", async () => {
  setView(html`<h1 style="font-size:34px">Ticket check-in</h1><p class="muted">Scan the QR code with the camera or paste the ticket code. Each scan is checked for signature, activity, date, status and earlier use, and logged.</p>
    <div class="grid g2"><div class="card pad stack"><video data-cam playsinline muted style="width:100%;border-radius:12px;background:#000;display:none"></video><button class="btn" data-scan>Scan with camera</button>
      <form data-code class="stack"><label class="f">Ticket code<textarea class="inp" name="code" required placeholder="MYT1.…"></textarea></label><label class="check"><input type="checkbox" name="allowOtherDate"> Allow another date (supervisor override)</label><button class="btn ghost">Check ticket</button></form></div>
    <div data-res></div></div>`, "Check-in");
  const show = (r) => { const ok = r.result === "ACCEPTED"; $("[data-res]").innerHTML = H(html`<div class="card pad" style="border:3px solid ${ok ? "var(--ok)" : "var(--bad)"}"><h2 style="color:${ok ? "var(--ok)" : "var(--bad)"}">${ok ? "✓ Accepted" : "✕ " + nice(r.result)}</h2>
    ${ok ? html`<dl class="kv"><dt>Booking</dt><dd>${r.reference}</dd><dt>Lead guest</dt><dd>${r.lead_name}</dd><dt>Participants</dt><dd>${r.participants}</dd><dt>Pickup</dt><dd>${r.pickup || "—"}</dd></dl>` : r.used_at ? html`<p>Already used at ${fdt(r.used_at)}</p>` : r.date ? html`<p>Ticket date: ${r.date}</p>` : ""}</div>`); };
  $("[data-code]").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); const r = await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/hq/checkin", { body: { code: d.code, allowOtherDate: !!d.allowOtherDate } })); show(r); };
  $("[data-scan]").onclick = () => startScanner($("[data-cam]"), (code) => { $("[data-code]").code.value = code; $("[data-code]").requestSubmit(); });
});

// ---------------------------------------------------------------- catalogue
route("/catalog", async () => {
  const r = await api("GET", "/api/v1/hq/activities");
  setView(html`<div class="spread"><h1 style="font-size:34px">Experiences</h1>${can("catalog.edit") ? html`<button class="btn" data-new>New experience</button>` : ""}</div>${exampleNote()}
    ${table([{ h: "ID", v: (a) => a.code }, { h: "Name", v: (a) => a.name }, { h: "Category", v: (a) => nice(a.category) }, { h: "Partner", v: (a) => a.partner_name || "—" }, { h: "Model", v: (a) => (a.booking_model === "INSTANT" ? "Live capacity" : "On request") },
      { h: "Adult price", v: (a) => money(a.adult_minor, a.currency || "EGP"), num: 1 }, { h: "Future slots", v: (a) => a.future_slots, num: 1 }, { h: "Status", v: (a) => badge(a.publication_status) }], r.items, (a) => `/catalog/${a.id}`)}`, "Experiences");
  bindRows();
  $("[data-new]")?.addEventListener("click", () => activityForm(null));
});
async function activityForm(a) {
  const [partners, terms] = await Promise.all([api("GET", "/api/v1/hq/partners"), api("GET", "/api/v1/hq/terms")]);
  const pol = terms.items.filter((x) => x.kind === "CANCELLATION_POLICY");
  const m = modal(html`<h3>${a ? "Edit experience" : "New experience"}</h3><form class="stack" novalidate><div class="formgrid">
    <label class="f">Activity ID<input class="inp" name="code" value="${a?.code || ""}" placeholder="ACT-0010" required></label><label class="f">URL name<input class="inp" name="slug" value="${a?.slug || ""}" placeholder="sunset-cruise" required></label>
    <label class="f">Category<select class="inp" name="category">${["BOAT", "DIVING_SNORKELLING", "DESERT", "CULTURE", "PRIVATE_TOUR", "TRANSFER", "OTHER"].map((c) => html`<option ${a?.category === c ? raw("selected") : ""}>${c}</option>`)}</select></label>
    <label class="f">Destination<input class="inp" name="destination" value="${a?.destination || "Hurghada"}" required></label><label class="f">Location<input class="inp" name="location" value="${a?.location || ""}"></label>
    <label class="f">Executing partner<select class="inp" name="partnerId"><option value="">—</option>${partners.items.map((p) => html`<option value="${p.id}" ${a?.partner_id === p.id ? raw("selected") : ""}>${p.name}${p.verified ? "" : " (not verified)"}</option>`)}</select></label>
    <label class="f">Duration (minutes)<input class="inp" type="number" name="durationMinutes" value="${a?.duration_minutes || ""}"></label><label class="f">Departure times (comma separated)<input class="inp" name="departureTimes" value="${(a?.departure_times || []).join(", ")}" placeholder="08:30, 14:00"></label>
    <label class="f">Min. participants<input class="inp" type="number" name="minParticipants" value="${a?.min_participants || 1}"></label><label class="f">Max. capacity<input class="inp" type="number" name="maxCapacity" value="${a?.max_capacity || ""}"></label><label class="f">Min. age<input class="inp" type="number" name="minAge" value="${a?.min_age ?? ""}"></label>
    <label class="f">Private or group<select class="inp" name="privateOrGroup"><option ${a?.private_or_group === "PRIVATE" ? raw("selected") : ""}>PRIVATE</option><option ${a?.private_or_group === "GROUP" ? raw("selected") : ""}>GROUP</option></select></label>
    <label class="f">Booking model<span class="h">Live only when capacity is managed here</span><select class="inp" name="bookingModel"><option value="ON_REQUEST" ${a?.booking_model !== "INSTANT" ? raw("selected") : ""}>On request (partner confirms)</option><option value="INSTANT" ${a?.booking_model === "INSTANT" ? raw("selected") : ""}>Live capacity</option></select></label>
    <label class="f">Sales role<select class="inp" name="salesRole"><option value="INTERMEDIARY" ${a?.sales_role !== "ORGANIZER" ? raw("selected") : ""}>Intermediary</option><option value="ORGANIZER" ${a?.sales_role === "ORGANIZER" ? raw("selected") : ""}>Organizer</option></select></label>
    <label class="f">Cancellation policy<select class="inp" name="cancellationPolicyId">${pol.map((p) => html`<option value="${p.id}" ${a?.cancellation_policy_id === p.id ? raw("selected") : ""}>${p.version}${p.approved ? "" : " (not approved)"}</option>`)}</select></label>
    <label class="f">Pickup options (comma separated)<input class="inp" name="pickupOptions" value="${(a?.pickup_options || []).join(", ")}"></label><label class="f">Photos (paths, comma separated)<input class="inp" name="photos" value="${(a?.photos || []).join(", ")}"></label>
    <label class="check"><input type="checkbox" name="childFriendly" ${a?.child_friendly ? raw("checked") : ""}> Suitable for children</label></div>
    <div class="row"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
  m.el.querySelector("form").onsubmit = async (e) => {
    e.preventDefault(); const d = formData(e.target); const list = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
    const body = { ...d, partnerId: d.partnerId || null, durationMinutes: d.durationMinutes || null, maxCapacity: d.maxCapacity || null, minAge: d.minAge ?? null, minParticipants: d.minParticipants || 1, departureTimes: list(d.departureTimes), pickupOptions: list(d.pickupOptions), photos: list(d.photos), languages: ["en", "nl", "de", "ar"], childFriendly: !!d.childFriendly, cancellationPolicyId: d.cancellationPolicyId || null };
    try { const r = await act(e.target.querySelector(".btn"), () => api("POST", a ? `/api/v1/hq/activities/${a.id}` : "/api/v1/hq/activities", { body }), "Saved"); m.close(); go(`/catalog/${a ? a.id : r.id}?t=${Date.now()}`); } catch (err) { showFieldErrors(e.target, err); }
  };
}
route("/catalog/:id", async ({ id }) => {
  const a = await api("GET", `/api/v1/hq/activities/${id}`);
  const p = a.prices[0];
  const byLang = Object.fromEntries(a.texts.map((x) => [x.lang, x]));
  setView(html`<a class="link" href="#/catalog">← Experiences</a><div class="spread"><div><p class="k">${a.code} · ${a.slug}</p><h1 style="font-size:32px;margin:0">${byLang.en?.name || a.slug}</h1></div>${badge(a.publication_status)}</div>
    ${can("catalog.edit") ? html`<div class="row" style="margin:12px 0">${["PUBLISHED", "SALES_BLOCKED", "DRAFT", "DEACTIVATED"].filter((s) => s !== a.publication_status).map((s) => html`<button class="btn ${s === "PUBLISHED" ? "" : "ghost"} sm" data-st="${s}">${{ PUBLISHED: "Publish", SALES_BLOCKED: "Block sales temporarily", DRAFT: "Back to draft", DEACTIVATED: "Deactivate" }[s]}</button>`)}<button class="btn ghost sm" data-edit>Edit details</button></div>` : ""}
    <p class="small muted">${a.bookings} bookings reference this experience. Changes never alter accepted bookings: each offer stores the price, terms and texts that applied.</p>
    <div class="cols"><div class="stack">
      <div class="card pad"><h3>Texts per language</h3>${["en", "nl", "de", "ar"].map((l) => html`<details style="border-top:1px solid var(--line);padding:8px 0"><summary style="cursor:pointer"><b>${l.toUpperCase()}</b> ${byLang[l] ? byLang[l].name : html`<span class="badge warn">missing — English is shown</span>`}</summary>
        <form class="stack" data-text="${l}" style="margin-top:8px" ${l === "ar" ? raw('dir="rtl"') : ""}><label class="f">Name<input class="inp" name="name" value="${byLang[l]?.name || ""}" required></label><label class="f">Short description<input class="inp" name="shortDesc" value="${byLang[l]?.short_desc || ""}" required></label>
          <label class="f">Full description<textarea class="inp" name="fullDesc" required>${byLang[l]?.full_desc || ""}</textarea></label><label class="f">Included (one per line)<textarea class="inp" name="included">${(byLang[l]?.included || []).join("\n")}</textarea></label><label class="f">Not included (one per line)<textarea class="inp" name="notIncluded">${(byLang[l]?.not_included || []).join("\n")}</textarea></label>
          <label class="f">Safety<textarea class="inp" name="safety">${byLang[l]?.safety || ""}</textarea></label><label class="f">Accessibility / families<textarea class="inp" name="accessibility">${byLang[l]?.accessibility || ""}</textarea></label>${can("catalog.edit") ? html`<button class="btn sm">Save ${l.toUpperCase()}</button>` : ""}</form></details>`)}</div>
      <div class="card pad"><h3>Availability (${a.booking_model === "INSTANT" ? "live capacity" : "on request — slots are informational"})</h3>
        ${can("catalog.edit") ? html`<form class="formgrid" data-slots><label class="f">From<input class="inp" type="date" name="from" required value="${cairoDay(Date.now())}"></label><label class="f">To<input class="inp" type="date" name="to" required></label><label class="f">Times<input class="inp" name="times" value="${(a.departure_times || []).join(", ") || "09:00"}" required></label><label class="f">Capacity<input class="inp" type="number" name="capacity" value="${a.max_capacity || 10}" min="0"></label><button class="btn sm" style="align-self:end">Add / update slots</button></form>` : ""}
        ${table([{ h: "Start", v: (s) => fdt(s.starts_at) }, { h: "Capacity", v: (s) => s.capacity, num: 1 }, { h: "Held", v: (s) => s.held, num: 1 }, { h: "Booked", v: (s) => s.booked, num: 1 }, { h: "Free", v: (s) => s.capacity - s.held - s.booked, num: 1 }, { h: "", v: (s) => (can("catalog.edit") ? html`<button class="link" data-slot="${s.id}" data-c="${s.closed}">${s.closed ? "Re-open" : "Close"}</button>` : s.closed ? "closed" : "") }], a.slots.slice(0, 40))}</div>
    </div><div class="stack">
      <div class="card pad"><h3>Current price (version ${a.prices.length})</h3>${p ? html`<dl class="kv"><dt>Adult</dt><dd>${money(p.adult_minor, p.currency)}</dd><dt>Child (≤${p.child_max_age})</dt><dd>${money(p.child_minor, p.currency)}</dd><dt>Tax</dt><dd>${p.tax_rate_bp / 100}%</dd><dt>Deposit</dt><dd>${p.deposit_rate_bp / 100}%</dd><dt>Partner net adult</dt><dd>${money(p.partner_cost_adult_minor, p.currency)}</dd><dt>Partner net child</dt><dd>${money(p.partner_cost_child_minor, p.currency)}</dd><dt>Payment fee</dt><dd>${p.payment_fee_bp / 100}%</dd><dt>Surcharges</dt><dd>${p.surcharges.map((s) => `${s.label}: ${money(s.amount_minor, p.currency)} per ${s.per.toLowerCase()}`).join("; ") || "—"}</dd></dl>` : html`<p class="muted">No price yet.</p>`}
        ${can("prices.edit") ? html`<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">New price version</summary><form class="stack" data-price style="margin-top:8px"><div class="formgrid">
          <label class="f">Adult (EGP)<input class="inp" type="number" step="0.01" name="adult" value="${p ? p.adult_minor / 100 : ""}" required></label><label class="f">Child (EGP)<input class="inp" type="number" step="0.01" name="child" value="${p ? p.child_minor / 100 : ""}" required></label>
          <label class="f">Tax %<input class="inp" type="number" step="0.01" name="tax" value="${p ? p.tax_rate_bp / 100 : 0}"></label><label class="f">Deposit %<input class="inp" type="number" step="1" name="deposit" value="${p ? p.deposit_rate_bp / 100 : 100}"></label>
          <label class="f">Partner net adult (EGP)<input class="inp" type="number" step="0.01" name="pca" value="${p?.partner_cost_adult_minor != null ? p.partner_cost_adult_minor / 100 : ""}"></label><label class="f">Partner net child (EGP)<input class="inp" type="number" step="0.01" name="pcc" value="${p?.partner_cost_child_minor != null ? p.partner_cost_child_minor / 100 : ""}"></label>
          <label class="f">Payment fee %<input class="inp" type="number" step="0.01" name="fee" value="${p ? p.payment_fee_bp / 100 : 0}"></label></div><p class="small muted">Saving creates a new version; existing offers and bookings keep theirs.</p><button class="btn sm">Save new version</button></form></details>` : ""}</div>
      <div class="card pad"><h3>Details</h3><dl class="kv"><dt>Category</dt><dd>${nice(a.category)}</dd><dt>Destination</dt><dd>${a.destination}</dd><dt>Duration</dt><dd>${a.duration_minutes ? a.duration_minutes + " min" : "varies"}</dd><dt>Group</dt><dd>${a.min_participants}–${a.max_capacity || "—"} · ${nice(a.private_or_group)}</dd><dt>Min. age</dt><dd>${a.min_age ?? "—"}</dd><dt>Sales role</dt><dd>${nice(a.sales_role)}</dd><dt>Time zone</dt><dd>${a.timezone}</dd><dt>Photos</dt><dd>${a.photos.length}</dd></dl>
        <div class="row" style="margin-top:8px">${a.photos.slice(0, 4).map((ph) => html`<img src="${root(ph)}" alt="" style="width:72px;height:54px;object-fit:cover;border-radius:8px">`)}</div></div>
    </div></div>`, a.code);
  $("[data-edit]")?.addEventListener("click", () => activityForm(a));
  $$("[data-st]").forEach((b) => b.onclick = async () => { try { await act(b, () => api("POST", `/api/v1/hq/activities/${id}/status`, { body: { status: b.dataset.st } }), "Status changed"); go(`/catalog/${id}?t=${Date.now()}`); } catch {} });
  $$("[data-text]").forEach((f) => f.onsubmit = async (e) => { e.preventDefault(); const d = formData(f); const lines = (s) => (s ? s.split("\n").map((x) => x.trim()).filter(Boolean) : []);
    try { await act(f.querySelector(".btn"), () => api("POST", `/api/v1/hq/activities/${id}/texts`, { body: { lang: f.dataset.text, name: d.name, shortDesc: d.shortDesc, fullDesc: d.fullDesc, included: lines(d.included), notIncluded: lines(d.notIncluded), safety: d.safety || null, accessibility: d.accessibility || null } }), "Saved"); } catch (err) { showFieldErrors(f, err); } });
  $("[data-price]")?.addEventListener("submit", async (e) => { e.preventDefault(); const d = formData(e.target); const c = (x) => (x === null || x === "" ? null : Math.round(Number(x) * 100));
    await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/activities/${id}/price`, { body: { currency: p?.currency || "EGP", adultMinor: c(d.adult), childMinor: c(d.child), taxRateBp: Math.round(Number(d.tax || 0) * 100), depositRateBp: Math.round(Number(d.deposit || 100) * 100), partnerCostAdultMinor: c(d.pca), partnerCostChildMinor: c(d.pcc), paymentFeeBp: Math.round(Number(d.fee || 0) * 100), surcharges: p?.surcharges || [] } }), "New price version saved"); go(`/catalog/${id}?t=${Date.now()}`); });
  $("[data-slots]")?.addEventListener("submit", async (e) => { e.preventDefault(); const d = formData(e.target);
    const r = await act(e.target.querySelector(".btn"), () => api("POST", `/api/v1/hq/activities/${id}/slots`, { body: { from: d.from, to: d.to, times: d.times.split(",").map((x) => x.trim()), capacity: Number(d.capacity) } })); toast(`${r.count} slots added or updated`); go(`/catalog/${id}?t=${Date.now()}`); });
  $$("[data-slot]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", `/api/v1/hq/slots/${b.dataset.slot}`, { body: { closed: b.dataset.c !== "true" } }), "Saved"); go(`/catalog/${id}?t=${Date.now()}`); });
});

// ---------------------------------------------------------------- partners
route("/partners", async () => {
  const r = await api("GET", "/api/v1/hq/partners");
  setView(html`<div class="spread"><h1 style="font-size:34px">Partners</h1>${can("partners.manage") ? html`<button class="btn" data-new>New partner</button>` : ""}</div>${exampleNote()}
    ${table([{ h: "Name", v: (p) => p.name }, { h: "Kind", v: (p) => nice(p.kind) }, { h: "Contact", v: (p) => p.contact_email || "—" }, { h: "Experiences", v: (p) => p.activities, num: 1 }, { h: "Accounts", v: (p) => p.accounts, num: 1 }, { h: "Verified", v: (p) => (p.verified ? html`<span class="badge ok">verified</span>` : html`<span class="badge warn">not verified</span>`) }, { h: "Active", v: (p) => (p.active ? "yes" : "no") },
      { h: "", v: (p) => (can("partners.manage") ? html`<button class="link" data-v="${p.id}" data-on="${p.verified}">${p.verified ? "Withdraw verification" : "Mark verified"}</button> <button class="link" data-acc="${p.id}">Add login</button>` : "") }], r.items)}
    <p class="small muted">Only verified partners can run published experiences. Verification means the licence and insurance were checked by staff.</p>`, "Partners");
  $("[data-new]")?.addEventListener("click", () => { const m = modal(html`<h3>New partner</h3><form class="stack"><label class="f">Name<input class="inp" name="name" required></label><label class="f">Kind<select class="inp" name="kind">${["EXCURSION", "TRANSPORT", "BOAT", "DIVING", "OTHER"].map((k) => html`<option>${k}</option>`)}</select></label><label class="f">Contact e-mail<input class="inp" type="email" name="contactEmail"></label><label class="f">Phone<input class="inp" name="contactPhone"></label><label class="f">Licence / registration<input class="inp" name="licenceNote"></label><div class="row"><button class="btn">Save</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); const d = formData(e.target); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/hq/partners", { body: { ...d, contactEmail: d.contactEmail || null } }), "Partner created (not verified yet)"); m.close(); go(`/partners?t=${Date.now()}`); } catch (err) { showFieldErrors(e.target, err); } }; });
  $$("[data-v]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", `/api/v1/hq/partners/${b.dataset.v}/verify`, { body: { verified: b.dataset.on !== "true" } }), "Saved"); go(`/partners?t=${Date.now()}`); });
  $$("[data-acc]").forEach((b) => b.onclick = () => { const m = modal(html`<h3>Partner login</h3><form class="stack"><label class="f">E-mail<input class="inp" type="email" name="email" required></label><label class="f">Job title<input class="inp" name="title" value="Partner operations" required></label><label class="f">Temporary password<span class="h">At least 12 characters, letters and numbers</span><input class="inp" name="password" required></label><div class="row"><button class="btn">Create</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/hq/users", { body: { ...formData(e.target), role: "PARTNER", partnerId: b.dataset.acc } }), "Login created"); m.close(); go(`/partners?t=${Date.now()}`); } catch (err) { showFieldErrors(e.target, err); } }; });
});

// ---------------------------------------------------------------- CRM
route("/customers", async (p, q) => {
  const r = await api("GET", `/api/v1/hq/customers${q.q ? "?q=" + encodeURIComponent(q.q) : ""}`);
  setView(html`<h1 style="font-size:34px">Customers</h1><form class="toolbar" data-f><input class="inp" name="q" value="${q.q || ""}" placeholder="Search name or e-mail" aria-label="Search"><button class="btn sm">Search</button></form>
    ${table([{ h: "Name", v: (c) => c.name }, { h: "E-mail", v: (c) => c.email }, { h: "Account", v: (c) => (c.has_account ? "yes" : "guest") }, { h: "Bookings", v: (c) => c.bookings, num: 1 }, { h: "Net paid", v: (c) => money(c.revenue_minor), num: 1 }, { h: "Last trip", v: (c) => (c.last_trip ? fdate(c.last_trip) : "—") }, { h: "Marketing", v: (c) => (c.marketing_consent ? "consent" : "—") }], r.items, (c) => `/customers/${c.id}`)}`, "Customers");
  $("[data-f]").onsubmit = (e) => { e.preventDefault(); go(`/customers?q=${encodeURIComponent(e.target.q.value)}`); };
  bindRows();
});
route("/customers/:id", async ({ id }) => {
  const c = await api("GET", `/api/v1/hq/customers/${id}`);
  setView(html`<a class="link" href="#/customers">← Customers</a><h1 style="font-size:32px">${c.name}</h1>
    <div class="cols"><div class="stack"><div class="card pad"><h3>Bookings</h3>${table([{ h: "Ref", v: (b) => b.reference }, { h: "Experience", v: (b) => b.activity }, { h: "Start", v: (b) => fdt(b.requested_start) }, { h: "Total", v: (b) => money(b.total_minor, b.currency || "EGP"), num: 1 }, { h: "Status", v: (b) => badge(b.status) }], c.bookings, (b) => `/bookings/${b.id}`)}</div>
      <div class="card pad"><h3>Support history</h3>${table([{ h: "Ticket", v: (s) => s.number }, { h: "Topic", v: (s) => nice(s.topic) }, { h: "Status", v: (s) => nice(s.status) }, { h: "Created", v: (s) => fdate(s.created_at) }], c.support)}</div>
      <div class="card pad"><h3>Contact history (notifications)</h3>${table([{ h: "When", v: (n) => fdt(n.created_at) }, { h: "Message", v: (n) => nice(n.template) }, { h: "Channel", v: (n) => n.channel }, { h: "Status", v: (n) => n.status }], c.contacts)}</div></div>
    <div class="stack"><div class="card pad"><h3>Profile</h3><dl class="kv"><dt>E-mail</dt><dd>${c.email}</dd><dt>Phone</dt><dd>${c.phone || "—"}</dd><dt>Language</dt><dd>${c.lang}</dd><dt>Account</dt><dd>${c.has_account ? "yes" : "guest"}</dd><dt>Marketing</dt><dd>${c.marketing_consent ? "consent given" : "no consent"}</dd><dt>Since</dt><dd>${fdate(c.created_at, { year: true })}</dd></dl></div>
      <div class="card pad"><h3>Preferences (shared by the customer)</h3><dl class="kv">${Object.entries(c.preferences || {}).map(([k, v]) => html`<dt>${nice(k)}</dt><dd>${Array.isArray(v) ? v.join(", ") : v}</dd>`)}</dl></div></div></div>`, c.name);
  bindRows();
});

// ---------------------------------------------------------------- support desk
route("/support", async () => {
  const r = await api("GET", "/api/v1/hq/support");
  setView(html`<h1 style="font-size:34px">Support desk</h1><p class="small muted">Flow: open → in review → assigned → waiting for partner → resolved → closed. Due times follow urgency (urgent 2 h, high 8 h, normal 24 h, low 72 h).</p>
    ${table([{ h: "Ticket", v: (s) => s.number }, { h: "From", v: (s) => s.name }, { h: "Booking", v: (s) => s.reference || "—" }, { h: "Topic", v: (s) => nice(s.topic) }, { h: "Urgency", v: (s) => html`<span class="badge ${s.urgency === "URGENT" ? "bad" : s.urgency === "HIGH" ? "warn" : ""}">${nice(s.urgency)}</span>` },
      { h: "Due", v: (s) => (["RESOLVED", "CLOSED"].includes(s.status) ? "—" : html`<span class="${new Date(s.due_at) < Date.now() ? "badge bad" : ""}">${fdt(s.due_at)}</span>`) }, { h: "Assignee", v: (s) => s.assignee || "—" }, { h: "Status", v: (s) => nice(s.status) }], r.items, (s) => `/support/${s.id}`)}`, "Support");
  bindRows();
});
route("/support/:id", async ({ id }) => {
  const s = await api("GET", `/api/v1/hq/support/${id}`);
  const flow = { OPEN: ["IN_REVIEW", "ASSIGNED", "RESOLVED"], IN_REVIEW: ["ASSIGNED", "WAITING_FOR_PARTNER", "RESOLVED"], ASSIGNED: ["WAITING_FOR_PARTNER", "RESOLVED"], WAITING_FOR_PARTNER: ["ASSIGNED", "RESOLVED"], RESOLVED: ["CLOSED", "IN_REVIEW"], CLOSED: [] }[s.status];
  setView(html`<a class="link" href="#/support">← Support desk</a><div class="spread"><h1 style="font-size:30px">${s.number} · ${nice(s.topic)}</h1><span class="badge">${nice(s.status)}</span></div>
    <p class="muted">${s.name} · ${s.email}${s.reference ? html` · booking <a href="#/bookings">${s.reference}</a>` : ""} · due ${fdt(s.due_at)}</p>
    <div class="cols"><div class="card pad"><div class="chat">${s.messages.map((m) => html`<div class="bubble ${m.author_type === "CUSTOMER" || m.author_type === "PARTNER" ? "" : "me"}" ${m.internal ? raw('style="background:#fff7e0;color:var(--ink);border-color:#e0a800"') : ""}><div class="small" style="opacity:.75">${m.author_type.toLowerCase()}${m.internal ? " · internal note" : ""} · ${fdt(m.at)}</div>${m.body}</div>`)}</div>
      <form class="stack" data-reply style="margin-top:14px"><label class="f">Reply<textarea class="inp" name="reply" required></textarea></label><label class="check"><input type="checkbox" name="internal"> Internal note (not visible to the customer)</label><button class="btn sm">Send</button></form></div>
    <div class="card pad stack"><h3>Handle</h3><button class="btn ghost sm" data-me>Assign to me</button>${flow.map((f) => html`<button class="btn ghost sm" data-s="${f}">→ ${nice(f)}</button>`)}
      <label class="f">Urgency<select class="inp" data-u>${["LOW", "NORMAL", "HIGH", "URGENT"].map((u) => html`<option ${u === s.urgency ? raw("selected") : ""}>${u}</option>`)}</select></label></div></div>`, s.number);
  const up = async (btn, body, msg) => { await act(btn, () => api("POST", `/api/v1/hq/support/${id}`, { body }), msg); go(`/support/${id}?t=${Date.now()}`); };
  $("[data-reply]").onsubmit = (e) => { e.preventDefault(); const d = formData(e.target); up(e.target.querySelector(".btn"), { reply: d.reply, internal: !!d.internal }, "Sent"); };
  $("[data-me]").onclick = (e) => up(e.currentTarget, { assignToMe: true, status: s.status === "OPEN" || s.status === "IN_REVIEW" ? "ASSIGNED" : undefined }, "Assigned");
  $$("[data-s]").forEach((b) => b.onclick = () => up(b, { status: b.dataset.s }, "Status changed"));
  $("[data-u]").onchange = (e) => up(null, { urgency: e.target.value }, "Urgency changed");
});

// ---------------------------------------------------------------- finance
route("/finance", async (p, q) => {
  const f = await api("GET", `/api/v1/hq/finance${q.month ? "?month=" + q.month : ""}`);
  setView(html`<div class="spread"><h1 style="font-size:34px">Finance</h1><form class="row" data-m><input class="inp" type="month" name="month" value="${f.month}" style="margin:0" aria-label="Month"><button class="btn sm">Show</button><button type="button" class="btn ghost sm" data-csv>Export CSV</button></form></div>${exampleNote()}
    <p class="small muted">As <b>intermediary</b> the company's revenue is its commission (booking value minus partner cost); as <b>organizer</b> the full booking value is revenue and partner costs are purchase costs. Each experience records which role applies.</p>
    ${f.summary.map((s) => html`<div class="kpis"><div class="kpi"><b>${money(s.gross, s.currency)}</b><span>Booking value (${s.bookings})</span></div><div class="kpi"><b>${money(s.intermediary_commission, s.currency)}</b><span>Commission (intermediary)</span></div><div class="kpi"><b>${money(s.organizer_gross, s.currency)}</b><span>Revenue as organizer</span></div>
      <div class="kpi"><b>${money(s.partner_cost, s.currency)}</b><span>Partner fees</span></div><div class="kpi"><b>${money(s.fees, s.currency)}</b><span>Payment costs</span></div><div class="kpi"><b>${money(s.tax, s.currency)}</b><span>Taxes</span></div><div class="kpi"><b>${money(s.margin, s.currency)}</b><span>Gross margin</span></div></div>`)}
    ${!f.summary.length ? html`<p class="muted">No confirmed bookings in this month.</p>` : ""}
    <div class="cols" style="margin-top:18px"><div class="stack">
      <div class="card pad"><h3>Money in / out</h3>${table([{ h: "", v: (r) => r.l }, { h: "Amount", v: (r) => r.v, num: 1 }, { h: "Count", v: (r) => r.n, num: 1 }], [...f.payments.map((x) => ({ l: "Payments received", v: money(x.received, x.currency), n: x.n })), ...f.refunds.map((x) => ({ l: "Refunds paid", v: money(x.refunded, x.currency), n: x.n })), ...f.outstanding.map((x) => ({ l: "Outstanding balances (confirmed)", v: money(x.outstanding, x.currency), n: x.n }))])}</div>
      <div class="card pad"><h3>Partner payables (not yet settled)</h3>${table([{ h: "Partner", v: (r) => r.name || "—" }, { h: "Bookings", v: (r) => r.bookings, num: 1 }, { h: "Payable", v: (r) => money(r.payable, r.currency), num: 1 }, { h: "", v: (r) => html`<button class="link" data-settle="${r.id}">Create settlement</button>` }], f.by_partner)}</div></div>
      <div class="card pad"><h3>Settlements</h3>${table([{ h: "Partner", v: (s) => s.partner }, { h: "Period", v: (s) => `${fdate(s.period_start)} – ${fdate(s.period_end)}` }, { h: "Amount", v: (s) => money(s.amount_minor, s.currency), num: 1 }, { h: "Status", v: (s) => s.status }, { h: "", v: (s) => (s.status === "DRAFT" ? html`<button class="link" data-ss="${s.id}" data-to="APPROVED">Approve</button>` : s.status === "APPROVED" ? html`<button class="link" data-ss="${s.id}" data-to="PAID">Mark paid</button>` : "") }], f.settlements)}</div></div>`, "Finance");
  $("[data-m]").onsubmit = (e) => { e.preventDefault(); go(`/finance?month=${e.target.month.value}`); };
  $("[data-csv]").onclick = async (e) => { const r = await act(e.currentTarget, () => api("GET", `/api/v1/hq/finance/export?month=${f.month}`)); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([r.csv], { type: "text/csv" })); a.download = r.filename; a.click(); };
  $$("[data-settle]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", "/api/v1/hq/finance/settlements", { body: { partnerId: b.dataset.settle, month: f.month } }), "Settlement created"); go(`/finance?month=${f.month}&t=${Date.now()}`); });
  $$("[data-ss]").forEach((b) => b.onclick = async () => { await act(b, () => api("POST", `/api/v1/hq/finance/settlements/${b.dataset.ss}`, { body: { status: b.dataset.to } }), "Saved"); go(`/finance?month=${f.month}&t=${Date.now()}`); });
});

// ---------------------------------------------------------------- outbox, audit, users, settings
route("/outbox", async () => {
  const r = await api("GET", "/api/v1/hq/notifications");
  setView(html`<h1 style="font-size:34px">Notifications</h1><p class="small muted">Every message is queued once (deduplicated) in the same transaction as the change it reports. ${EXAMPLE ? "In the example environment nothing is sent outside the app." : "E-mail and WhatsApp are only sent through approved, configured providers."}</p>
    ${table([{ h: "When", v: (n) => fdt(n.created_at) }, { h: "Booking", v: (n) => n.reference || "—" }, { h: "Message", v: (n) => nice(n.template) }, { h: "Channel", v: (n) => n.channel }, { h: "To", v: (n) => n.recipient }, { h: "Status", v: (n) => n.status }], r.items)}`, "Notifications");
});
route("/audit", async () => {
  const r = await api("GET", "/api/v1/hq/audit");
  setView(html`<h1 style="font-size:34px">Audit log</h1><p class="small muted">Append-only: the database refuses changes or deletions.</p>
    ${table([{ h: "#", v: (a) => a.id, num: 1 }, { h: "When", v: (a) => fdt(a.at) }, { h: "Actor", v: (a) => a.actor_type.toLowerCase() }, { h: "Action", v: (a) => nice(a.action) }, { h: "Entity", v: (a) => `${a.entity} ${String(a.entity_id || "").slice(0, 8)}` }, { h: "Detail", v: (a) => html`<code style="font-size:12.5px">${JSON.stringify(a.detail).slice(0, 140)}</code>` }], r.items)}`, "Audit log");
});
route("/users", async () => {
  const r = await api("GET", "/api/v1/hq/users");
  setView(html`<div class="spread"><h1 style="font-size:34px">Users</h1><button class="btn" data-new>New staff user</button></div><p class="small muted">Staff are listed by job title only. MFA is required for staff in production.</p>
    ${table([{ h: "Title", v: (u) => u.display_title }, { h: "E-mail", v: (u) => u.email }, { h: "Role", v: (u) => nice(u.role) }, { h: "MFA", v: (u) => (u.mfa_enabled ? "on" : "off") }, { h: "Active", v: (u) => (u.active ? "yes" : "no") }], r.items)}`, "Users");
  $("[data-new]").onclick = () => { const m = modal(html`<h3>New staff user</h3><form class="stack"><label class="f">E-mail<input class="inp" type="email" name="email" required></label><label class="f">Job title<input class="inp" name="title" required></label><label class="f">Role<select class="inp" name="role">${["LOCAL_TRAVEL_REPRESENTATIVE", "OPERATIONS_MANAGER", "FINANCE", "OWNER"].map((x) => html`<option value="${x}">${nice(x)}</option>`)}</select></label><label class="f">Temporary password<input class="inp" name="password" required></label><div class="row"><button class="btn">Create</button><button type="button" class="btn ghost" data-close>Cancel</button></div></form>`);
    m.el.querySelector("form").onsubmit = async (e) => { e.preventDefault(); try { await act(e.target.querySelector(".btn"), () => api("POST", "/api/v1/hq/users", { body: formData(e.target) }), "User created"); m.close(); go(`/users?t=${Date.now()}`); } catch (err) { showFieldErrors(e.target, err); } }; };
});
route("/settings", async () => {
  const [s, terms] = await Promise.all([api("GET", "/api/v1/hq/settings"), api("GET", "/api/v1/hq/terms")]);
  const val = (k) => s.items.find((x) => x.key === k)?.value;
  const edit = can("settings.manage");
  setView(html`<h1 style="font-size:34px">Settings</h1>
    <div class="cols"><div class="card pad stack"><h3>Sales &amp; timing</h3>
      <form data-k="sales_enabled" class="spread"><span><b>Online sales</b><br><span class="small muted">When off, nobody can request or reserve.</span></span><label class="check"><input type="checkbox" name="v" ${val("sales_enabled") ? raw("checked") : ""} ${edit ? "" : raw("disabled")}> enabled</label></form>
      ${[["hold_minutes", "Seat hold (minutes)"], ["payment_window_minutes", "Payment window (minutes)"], ["offer_valid_hours", "Default offer validity (hours)"], ["partner_response_hours", "Partner response time (hours)"]].map(([k, l]) => html`<form data-k="${k}" class="row"><label class="f" style="flex:1">${l}<input class="inp" type="number" name="v" value="${val(k) ?? ""}" ${edit ? "" : raw("disabled")}></label>${edit ? html`<button class="btn sm" style="align-self:end">Save</button>` : ""}</form>`)}
      <form data-k="support_hours" class="row"><label class="f" style="flex:1">Support hours shown to customers<input class="inp" name="v" value="${val("support_hours") || ""}" ${edit ? "" : raw("disabled")}></label>${edit ? html`<button class="btn sm" style="align-self:end">Save</button>` : ""}</form></div>
    <div class="card pad"><h3>Terms versions</h3>${table([{ h: "Kind", v: (x) => nice(x.kind) }, { h: "Version", v: (x) => x.version }, { h: "Approved", v: (x) => (x.approved ? html`<span class="badge ok">approved</span>` : html`<span class="badge bad">not approved</span>`) }, { h: "Published", v: (x) => fdate(x.published_at) }], terms.items)}
      <p class="small muted">Experiences can only be published with an approved cancellation policy; offers always store the exact versions.</p></div></div>`, "Settings");
  $$("[data-k]").forEach((f) => {
    const send = async (btn) => { const k = f.dataset.k; const inp = f.v; const value = k === "sales_enabled" ? inp.checked : k === "support_hours" ? inp.value : Number(inp.value); try { await act(btn, () => api("POST", "/api/v1/hq/settings", { body: { key: k, value } }), "Saved"); } catch {} };
    f.onsubmit = (e) => { e.preventDefault(); send(f.querySelector(".btn")); };
    if (f.dataset.k === "sales_enabled") f.v.onchange = () => send(null);
  });
});

// ---------------------------------------------------------------- login & boot
function loginView(err) {
  $("#shell").innerHTML = H(html`<div class="login"><div class="card"><a class="brand" href="${root("")}"><img src="${root("img/logo.png")}" alt="" width="44" height="44"><span><b>ME &amp; YOU</b><small>Business HQ</small></span></a>
    <h1 style="font-size:28px;margin-top:16px">Staff sign-in</h1>${err ? html`<p class="note bad small">${err}</p>` : ""}
    <form class="stack" data-login><label class="f">E-mail<input class="inp" type="email" name="email" autocomplete="username" required></label><label class="f">Password<input class="inp" type="password" name="password" autocomplete="current-password" required></label>
      <label class="f" data-totp hidden>Authenticator code<input class="inp" name="totp" inputmode="numeric" autocomplete="one-time-code"></label><button class="btn">Sign in</button></form>
    ${EXAMPLE ? html`<div class="demo-acc"><p class="small muted" style="margin:6px 0 0">Example accounts (password <b>voorbeeld-2026</b>):</p>${[["owner@example.com", "Owner"], ["operations@example.com", "Operations Manager"], ["representative@example.com", "Local Travel Representative"], ["finance@example.com", "Finance Officer"]].map(([e, t]) => html`<button type="button" data-ex="${e}">${t} · ${e}</button>`)}</div>` : ""}
    <p class="small muted" style="margin-top:14px"><a href="${root("partner/")}">Partner portal</a> · <a href="${root("")}">Website</a></p></div></div>`);
  const f = $("[data-login]");
  f.onsubmit = async (e) => { e.preventDefault(); const d = formData(f); try { await act(f.querySelector(".btn"), () => api("POST", "/api/v1/auth/login", { body: { email: d.email, password: d.password, ...(d.totp ? { totp: d.totp } : {}) } })); start(); } catch (err) { if (err.code === "MFA_REQUIRED") $("[data-totp]").hidden = false; } };
  $$("[data-ex]").forEach((b) => b.onclick = () => { f.email.value = b.dataset.ex; f.password.value = "voorbeeld-2026"; f.requestSubmit(); });
}
let routerStarted = false;
async function start() {
  try { const r = await api("GET", "/api/v1/auth/me"); USER = r.user; PERMS = r.permissions; }
  catch (e) { if (e.status === 401) return loginView(); if (e.status === 403) return loginView("This account cannot use Business HQ. Partners use the partner portal."); throw e; }
  if (USER.role === "PARTNER") { await api("POST", "/api/v1/auth/logout"); return loginView("Partner accounts use the partner portal."); }
  const draw = async (fn, params, query, path) => {
    const base = "#/" + (path.split("/")[1] || "");
    $("#shell").innerHTML = H(shell(base === "#/" ? "#/" : base));
    $("[data-logout]").onclick = async () => { await api("POST", "/api/v1/auth/logout"); USER = null; loginView(); };
    $("[data-reset]")?.addEventListener("click", async () => { if (await confirmBox("Delete everything done in this example and start with fresh example data?", "Reset", true)) resetExample(); });
    try { if (!fn) return setView(html`<h1>Not found</h1>`, "Not found"); view().innerHTML = '<div class="skel" style="height:200px"></div>'; await fn(params, query); }
    catch (e) { if (e.status === 401) return loginView("Your session has expired. Please sign in again."); view().innerHTML = H(html`<div class="empty"><h2>Could not load this page</h2><p>${errMsg(e)}</p></div>`); }
  };
  if (!routerStarted) { routerStarted = true; startRouter(draw); } else window.dispatchEvent(new HashChangeEvent("hashchange"));
}
(async () => {
  try { await startRuntime((s) => { const el = $("#splash-msg"); if (el) el.textContent = s === "ready" ? "Ready" : "Preparing…"; }); }
  catch (e) { $("#splash").innerHTML = `<div><h1>Business HQ</h1><p>${esc(errMsg(e))}</p></div>`; return; }
  $("#splash")?.remove();
  start();
})();
