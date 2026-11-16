"""Build d9/assets/experiences.js from the Me & You Tours Egypt catalog (single source of truth)."""
import json, shutil, re
SRC = "/home/claude/myt-platform/example/assets/prepared/en.json"
IMG = "/home/claude/myt-platform/public/img/"
OUT = "/home/claude/me-and-you-tours/d9/"
d = json.load(open(SRC))
CAT = {"BOAT": "boat", "DIVING_SNORKELLING": "snorkel", "DESERT": "desert", "CULTURE": "culture", "PRIVATE_TOUR": "daytrip"}
items = []
for x in d["/api/v1/catalog?lang=en"]["items"]:
    if x["category"] not in CAT: continue          # advisor packages + transfer handled by concierge
    det = d.get(f"/api/v1/catalog/{x['slug']}?lang=en", {})
    tx = det.get("texts", {})
    photos = []
    for p in x["photos"]:
        n = p.split("/")[-1]
        shutil.copy(IMG + n, OUT + "img/x/" + n)
        s = n.replace(".webp", "-s.webp")
        try: shutil.copy(IMG + s, OUT + "img/x/" + s)
        except FileNotFoundError: pass
        photos.append("img/x/" + n)
    full = tx.get("full_desc", "")
    paras = [p for p in full.split("\n\n") if p.strip()]
    hl = [l[2:].strip() for p in paras for l in p.split("\n") if l.startswith("• ")]
    body = [p for p in paras if not p.startswith("• ")]
    items.append({
        "slug": x["slug"], "cat": CAT[x["category"]], "title": x["name"], "short": x["short_desc"],
        "body": body, "highlights": hl, "destination": x["destination"],
        "start": x.get("pickup_options") or [x["location"]], "end": "Back at your starting point",
        "minutes": x["duration_minutes"], "minAge": x["min_age"], "maxGroup": x["max_capacity"],
        "family": x["child_friendly"], "private": x["private_or_group"] == "PRIVATE", "times": x.get("departure_times", []),
        "parties": x["party_types"], "included": tx.get("included", []), "notIncluded": tx.get("not_included", []),
        "extras": [s["label"] for s in det.get("surcharges", [])], "safety": tx.get("safety", ""),
        "access": tx.get("accessibility", ""), "scope": tx.get("private_scope", ""), "photos": photos,
    })
js = "/* Generated from the Me & You Tours Egypt catalog — do not edit by hand (run d9-sync-experiences.py). */\nwindow.D9X = " + json.dumps(items, ensure_ascii=False, indent=1) + ";\n"
open(OUT + "assets/experiences.js", "w").write(js)
for n in ["giftunview", "orangebay", "dolphins2", "jetty", "signpost", "marsaalam", "beachbar", "swing", "boats", "deck", "watertables"]:
    for suf in ("", "-s"):
        try: shutil.copy(IMG + n + suf + ".webp", OUT + "img/x/" + n + suf + ".webp")
        except FileNotFoundError: pass
print(len(items), [i["slug"] + ":" + i["cat"] for i in items])
