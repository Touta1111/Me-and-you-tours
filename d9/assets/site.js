/* D9 Luxury Suites – shared header, footer and helpers for the content pages. */
(function () {
  var D = window.D9;
  D.MYT = "https://touta1111.github.io/Me-and-you-tours/platform/";
  D.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  D.$ = function (s, el) { return (el || document).querySelector(s); };
  D.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  D.q = new URLSearchParams(location.search);
  D.CATS = {
    boat: "Private Boat Experiences", snorkel: "Snorkeling & Diving", desert: "Desert Adventures",
    culture: "Cultural Experiences", daytrip: "Private Day Trips"
  };
  D.dur = function (m) { if (!m) return "Varies"; if (m >= 600) return "Full day (" + Math.round(m / 60) + " h)"; var h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + r + " min" : ""); };
  D.small = function (src) { return src.replace(".webp", "-s.webp"); };
  /* Save a request in the D9 inbox (read by the dashboard) and return it. Requests are never confirmations. */
  D.request = function (type, name, detail, extra) {
    var rec = { id: D.uid(), created: new Date().toISOString(), type: type, name: name || "(website visitor)", suite: (extra && extra.suite) || "-", checkin: (extra && extra.checkin) || "", checkout: (extra && extra.checkout) || "", detail: detail, source: "website", lang: "en" };
    D.store.push("d9_inbox", rec);
    var mine = D.store.get("d9_my_requests", []); mine.unshift({ id: rec.id, created: rec.created, type: type, detail: detail }); D.store.set("d9_my_requests", mine.slice(0, 30));
    return rec;
  };
  var NAV = [["index.html", "Home"], ["suite.html", "Suites"], ["experiences.html", "Experiences"], ["hurghada.html", "Hurghada"], ["concierge.html", "Concierge"], ["reviews.html", "Reviews"], ["contact.html", "Contact"]];
  D.chrome = function (active) {
    var h = document.createElement("header"); h.className = "pg-top";
    h.innerHTML = '<div class="wrap pg-row"><a class="pg-brand" href="index.html"><img src="img/icon-192.png" alt="" width="34" height="34"><span>D9 <em>Luxury Suites</em></span></a>' +
      '<nav id="pgNav">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === active ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") + '<a class="btn btn-gold btn-sm" href="book.html">Book direct</a></nav>' +
      '<button class="pg-burger" id="pgBurger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button></div>';
    document.body.insertBefore(h, document.body.firstChild);
    D.$("#pgBurger").onclick = function () { var n = D.$("#pgNav"); n.classList.toggle("open"); this.setAttribute("aria-expanded", n.classList.contains("open")); };
    var f = document.createElement("footer"); f.className = "pg-foot";
    f.innerHTML = '<div class="wrap"><div class="pg-fgrid"><div><b class="pg-fb">D9 Luxury Suites</b><p class="muted small">' + D.esc(D.address) + '</p><a class="small" target="_blank" rel="noopener" href="' + D.maps + '">Open in Google Maps ↗</a></div>' +
      '<div><b>Stay</b><a href="suite.html">Suites</a><a href="book.html">Booking request</a><a href="welcome.html">My D9 Stay</a><a href="about.html">About D9</a></div>' +
      '<div><b>Explore</b><a href="experiences.html">Experiences</a><a href="hurghada.html">Hurghada</a><a href="concierge.html">Travel Concierge</a><a href="reviews.html">Reviews</a></div>' +
      '<div><b>Help</b><a href="contact.html">Contact & support</a><a href="contact.html#problem">Report a problem</a><a href="' + D.wa("Hello D9 Luxury Suites, I have a question.") + '" target="_blank" rel="noopener">WhatsApp</a></div></div>' +
      '<p class="credit small muted">Website by VormVivo Studios</p></div>';
    document.body.appendChild(f);
    var wa = document.createElement("a"); wa.className = "pg-wa"; wa.id = "pgWa"; wa.target = "_blank"; wa.rel = "noopener"; wa.setAttribute("aria-label", "Chat on WhatsApp");
    wa.href = D.wa("Hello D9 Luxury Suites, I have a question.");
    wa.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
    document.body.appendChild(wa);
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" }) : null;
    D.reveal = function (root) { D.$$(".rv:not(.in)", root).forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); }); };
    D.reveal(document);
  };
  D.setWa = function (text) { var a = D.$("#pgWa"); if (a) a.href = D.wa(text); };
  D.copyOrWa = function (text) { window.open(D.wa(text), "_blank", "noopener"); };
  D.card = function (x) {
    return '<a class="xc rv" href="experience.html?x=' + x.slug + '"><div class="xc-ph"><img loading="lazy" src="' + D.small(x.photos[0]) + '" alt=""><span class="xc-tag">' + D.esc(D.CATS[x.cat]) + "</span></div>" +
      '<div class="xc-b"><h3>' + D.esc(x.title) + '</h3><p class="muted">' + D.esc(x.short) + '</p><div class="xc-m"><span>⏱ ' + D.dur(x.minutes) + "</span><span>📍 " + D.esc(x.destination) + "</span>" + (x.private ? "<span>Private</span>" : "") + (x.family ? "<span>Family</span>" : "") + '</div><span class="xc-p">Price on request</span></div></a>';
  };
})();
