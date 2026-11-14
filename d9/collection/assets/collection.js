/* D9 Premium Business Collection – shared behaviour */
(function () {
  var bar = document.querySelector(".bar"), stick = document.querySelector(".stick");
  function onScroll() {
    var y = window.scrollY || 0;
    if (bar) bar.classList.toggle("solid", y > 60);
    if (stick) stick.classList.toggle("on", y > window.innerHeight * 0.8);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add("in"); }); }

  // WhatsApp / e-mail call-to-action: uses the central D9 settings when present
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var t = a.getAttribute("data-wa");
    a.href = (window.D9 && window.D9.wa) ? window.D9.wa(t) : "https://wa.me/?text=" + encodeURIComponent(t);
    a.target = "_blank"; a.rel = "noopener";
  });

  // simple sheets (demo forms)
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); var s = document.getElementById(b.getAttribute("data-open")); if (s) s.classList.add("on"); });
  });
  document.querySelectorAll(".sheet").forEach(function (s) {
    s.addEventListener("click", function (e) { if (e.target === s || e.target.classList.contains("x")) s.classList.remove("on"); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.querySelectorAll(".sheet.on").forEach(function (s) { s.classList.remove("on"); }); });
})();
