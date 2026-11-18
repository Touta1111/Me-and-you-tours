/* D9 Luxury Suites – central settings. Change these values in one place. */
window.D9 = {
  name: "D9 Luxury Suites",
  // Public address of the website (used for guest links made in the dashboard).
  siteUrl: "https://touta1111.github.io/Me-and-you-tours/d9/",
  // WhatsApp number in international format without + or spaces, e.g. "201001234567".
  // Leave empty until the owner confirms the number: links then open WhatsApp's own share screen.
  whatsapp: "",
  email: "",
  address: "Mubarak 6, Villa 165A, Hurghada, Red Sea, Egypt",
  lat: 27.153706,
  lng: 33.820584,
  checkIn: "14:00",
  checkOut: "12:00",
  rating: "9.1",
  // Wi-Fi details shown on the guest welcome page. Leave empty to show "details are on the card in your suite".
  wifi: { network: "", password: "" },
  listings: {
    lotus: "https://www.airbnb.com/rooms/1557931506615400653",
    lily: "https://www.airbnb.com/rooms/1557949932103529965",
    camellia: "https://www.airbnb.com/rooms/1557896630539047568"
  }
};
window.D9.wa = function (text) {
  var n = (window.D9.whatsapp || "").replace(/\D/g, "");
  return "https://wa.me/" + (n ? n : "") + "?text=" + encodeURIComponent(text || "");
};
window.D9.maps = "https://www.google.com/maps/search/?api=1&query=" + window.D9.lat + "," + window.D9.lng;
window.D9.store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  push: function (k, item) { var a = this.get(k, []); a.unshift(item); this.set(k, a); return a; }
};
window.D9.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
window.D9.toast = function (msg) {
  var t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
};
