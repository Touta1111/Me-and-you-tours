/* Stylised illustrations (not photos of the property). */
window.D9Art = (function () {
  function sky(id, a, b) { return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>'; }
  function palm(x, y, s, c) {
    c = c || "#0f1d26";
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c + '"><path d="M-3 0 Q2 -60 10 -120 L14 -120 Q8 -60 4 0Z"/>' +
      '<path d="M12 -120 Q-30 -135 -55 -105 Q-25 -122 12 -116Z"/><path d="M12 -120 Q50 -140 78 -108 Q45 -124 12 -115Z"/>' +
      '<path d="M12 -121 Q-10 -160 -40 -160 Q-12 -148 10 -118Z"/><path d="M12 -121 Q40 -165 70 -150 Q38 -150 14 -118Z"/>' +
      '<path d="M12 -120 Q20 -95 50 -80 Q22 -100 14 -117Z"/><path d="M12 -120 Q0 -92 -28 -78 Q-2 -100 10 -117Z"/></g>';
  }
  var A = {
    hero: function () {
      return '<svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + sky("hs", "#f3c58f", "#e98a6a") +
        '<defs><linearGradient id="hp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fb6c0"/><stop offset="1" stop-color="#0e5c63"/></linearGradient></defs>' +
        '<rect width="800" height="520" fill="url(#hs)"/><circle cx="560" cy="250" r="70" fill="#fbe3b5" opacity=".9"/>' +
        '<path d="M0 300 L120 255 L230 285 L330 240 L470 290 L600 260 L800 300 V520 H0Z" fill="#c9875f" opacity=".55"/>' +
        '<rect x="0" y="330" width="800" height="190" fill="#efe2cf"/><rect x="70" y="360" width="660" height="120" rx="18" fill="url(#hp)"/>' +
        '<path d="M100 400 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#bdeff2" stroke-width="3" fill="none" opacity=".7"/>' +
        '<path d="M140 440 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#bdeff2" stroke-width="2" fill="none" opacity=".5"/>' +
        palm(90, 360, 1.25) + palm(700, 365, 1.05) + palm(760, 350, .8) + '</svg>';
    },
    studio: function () {
      return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + sky("s1", "#f7efe2", "#eadcc5") +
        '<rect width="400" height="240" fill="url(#s1)"/><rect x="250" y="40" width="110" height="110" rx="8" fill="#9fd6dc"/><path d="M250 120 q28 -14 55 0 t55 0 V150 H250Z" fill="#3a9aa3"/>' +
        '<rect x="40" y="130" width="190" height="60" rx="10" fill="#fff"/><rect x="40" y="110" width="190" height="30" rx="10" fill="#d8c4a3"/>' +
        '<rect x="55" y="118" width="60" height="22" rx="8" fill="#fff"/><rect x="125" y="118" width="60" height="22" rx="8" fill="#fff"/><rect x="0" y="190" width="400" height="50" fill="#cbb594"/>' +
        '<circle cx="320" cy="200" r="0"/></svg>';
    },
    apt2: function () {
      return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + sky("s2", "#e8f4f3", "#cfe7e6") +
        '<rect width="400" height="240" fill="url(#s2)"/><rect x="40" y="70" width="140" height="120" rx="6" fill="#f6f1e8"/><rect x="200" y="50" width="160" height="140" rx="6" fill="#fffaf2"/>' +
        '<rect x="55" y="90" width="45" height="45" fill="#9fd6dc"/><rect x="120" y="90" width="45" height="45" fill="#9fd6dc"/><rect x="220" y="70" width="55" height="55" fill="#9fd6dc"/><rect x="290" y="70" width="55" height="55" fill="#9fd6dc"/>' +
        '<rect x="200" y="150" width="160" height="10" fill="#b08d57"/><rect x="0" y="190" width="400" height="50" fill="#efe2cf"/>' + palm(370, 195, .55, "#2b5b52") + '</svg>';
    },
    apt3: function () {
      return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + sky("s3", "#fbe9d3", "#f0cfa8") +
        '<rect width="400" height="240" fill="url(#s3)"/><rect x="60" y="60" width="280" height="140" rx="8" fill="#fffaf2"/>' +
        '<rect x="80" y="80" width="60" height="50" fill="#9fd6dc"/><rect x="170" y="80" width="60" height="50" fill="#9fd6dc"/><rect x="260" y="80" width="60" height="50" fill="#9fd6dc"/>' +
        '<rect x="60" y="150" width="280" height="12" fill="#b08d57"/><rect x="0" y="200" width="400" height="40" fill="#e3cfae"/><rect x="120" y="210" width="160" height="22" rx="8" fill="#3fb6c0"/>' + palm(40, 205, .6, "#2b5b52") + '</svg>';
    },
    romance: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#f7e4e1"/><path d="M200 190 C110 130 120 70 165 70 C185 70 197 85 200 98 C203 85 215 70 235 70 C280 70 290 130 200 190Z" fill="#c0546b"/><circle cx="90" cy="70" r="26" fill="#e9a7b3"/><circle cx="320" cy="60" r="22" fill="#f1c1c9"/><path d="M90 96 l-4 70 M320 82 l3 80" stroke="#b08d57" stroke-width="2"/></svg>'; },
    birthday: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#fdf0d8"/><rect x="140" y="130" width="120" height="70" rx="8" fill="#fff"/><rect x="140" y="130" width="120" height="18" fill="#e9a7b3"/><rect x="196" y="100" width="8" height="30" fill="#3fb6c0"/><path d="M200 86 q8 8 0 14 q-8 -6 0 -14Z" fill="#f0a033"/><circle cx="80" cy="70" r="24" fill="#3fb6c0"/><circle cx="325" cy="75" r="24" fill="#c9a46a"/><path d="M80 94 l4 80 M325 99 l-4 80" stroke="#6b6257" stroke-width="2"/></svg>'; },
    vip: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#e6eef2"/><path d="M60 120 L260 100 L320 70 L340 74 L300 112 L360 140 L350 150 L280 128 L200 160 L180 156 L220 124 L80 132Z" fill="#16303d"/><rect x="0" y="190" width="400" height="50" fill="#c9d6dc"/><rect x="40" y="170" width="120" height="30" rx="10" fill="#b08d57"/><circle cx="65" cy="202" r="10" fill="#0f1d26"/><circle cx="135" cy="202" r="10" fill="#0f1d26"/></svg>'; },
    comfort: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#f2ede4"/><rect x="110" y="110" width="180" height="16" rx="8" fill="#b08d57"/><circle cx="160" cy="95" r="20" fill="#fff" stroke="#d8c4a3" stroke-width="4"/><rect x="215" y="72" width="30" height="40" rx="6" fill="#fff" stroke="#d8c4a3" stroke-width="4"/><path d="M245 82 q16 0 16 14 q0 12 -16 12" fill="none" stroke="#d8c4a3" stroke-width="4"/><path d="M60 200 h280" stroke="#d8c4a3" stroke-width="6" stroke-linecap="round"/></svg>'; },
    sea: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#bfe6ea"/><rect y="110" width="400" height="130" fill="#2a8f98"/><path d="M0 130 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#bdeff2" stroke-width="3" fill="none"/><path d="M150 100 h110 l-20 22 h-75Z" fill="#fff"/><rect x="200" y="60" width="4" height="40" fill="#fff"/><path d="M204 62 l30 30 h-30Z" fill="#f6f1e8"/></svg>'; },
    desert: function () { return '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="240" fill="#f8d9a8"/><circle cx="310" cy="70" r="30" fill="#fff1cf"/><path d="M0 160 Q100 110 200 150 T400 140 V240 H0Z" fill="#d79a5e"/><path d="M0 190 Q120 150 250 185 T400 180 V240 H0Z" fill="#c07f45"/><path d="M90 168 l14 -20 l10 4 l6 -12 l8 0 l-2 14 l10 14Z" fill="#6b4a2b"/></svg>'; }
  };
  return A;
})();
