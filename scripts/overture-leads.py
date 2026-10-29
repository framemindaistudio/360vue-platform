"""
Build lead-finder lists from Overture Maps places (overturemaps.org — open data, CDLA-Permissive-2.0; attribution:
"© Overture Maps Foundation"). Overture covers Indian businesses far better than OpenStreetMap and often has phone
numbers and websites. It is published as files, so this runs here (a laptop), not inside HQ.

  pip install duckdb
  python scripts/overture-leads.py hampi gokarna        # some places
  python scripts/overture-leads.py --all                 # every place on /locations

Writes out/overture/<city>.json — a list of businesses in the lead finder's format, most contactable first, up to 500
per place. Upload them with scripts/upload-leads.py (which keeps the statuses and notes already in HQ).
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone

import duckdb

RELEASE = os.environ.get("OVERTURE_RELEASE", "2026-10-21.0")
SRC = f"s3://overturemaps-us-west-2/release/{RELEASE}/theme=places/type=place/*"
OUT = os.path.join(os.path.dirname(__file__), "..", "out", "overture")
MAX = 500
UA = "360VUE-HQ/1.0 (lead finder; contact: framemindaistudio@gmail.com)"

# the places on /locations (slug → search name, state); kept in step with src/lib/locations.ts
PLACES = {
    "bengaluru": ("Bengaluru", "Karnataka"), "mysuru": ("Mysuru", "Karnataka"), "mangaluru": ("Mangaluru", "Karnataka"),
    "udupi-manipal": ("Udupi", "Karnataka"), "coorg": ("Madikeri", "Karnataka"), "chikkamagaluru": ("Chikkamagaluru", "Karnataka"),
    "hubballi-dharwad": ("Hubballi", "Karnataka"), "belagavi": ("Belagavi", "Karnataka"), "hampi": ("Hampi", "Karnataka"), "gokarna": ("Gokarna", "Karnataka"),
    "chennai": ("Chennai", "Tamil Nadu"), "coimbatore": ("Coimbatore", "Tamil Nadu"), "madurai": ("Madurai", "Tamil Nadu"),
    "tiruchirappalli": ("Tiruchirappalli", "Tamil Nadu"), "ooty": ("Ooty", "Tamil Nadu"), "kodaikanal": ("Kodaikanal", "Tamil Nadu"),
    "mahabalipuram": ("Mamallapuram", "Tamil Nadu"), "kanyakumari": ("Kanyakumari", "Tamil Nadu"), "rameswaram": ("Rameswaram", "Tamil Nadu"),
    "kochi": ("Kochi", "Kerala"), "thiruvananthapuram": ("Thiruvananthapuram", "Kerala"), "kozhikode": ("Kozhikode", "Kerala"),
    "thrissur": ("Thrissur", "Kerala"), "alappuzha": ("Alappuzha", "Kerala"), "munnar": ("Munnar", "Kerala"), "wayanad": ("Kalpetta", "Kerala"),
    "thekkady": ("Kumily", "Kerala"), "varkala": ("Varkala", "Kerala"), "kovalam": ("Kovalam", "Kerala"),
    "hyderabad": ("Hyderabad", "Telangana"), "warangal": ("Warangal", "Telangana"),
    "visakhapatnam": ("Visakhapatnam", "Andhra Pradesh"), "vijayawada": ("Vijayawada", "Andhra Pradesh"), "guntur": ("Guntur", "Andhra Pradesh"),
    "tirupati": ("Tirupati", "Andhra Pradesh"), "araku-valley": ("Araku Valley", "Andhra Pradesh"),
    "north-goa": ("Calangute", "Goa"), "panaji": ("Panaji", "Goa"), "south-goa": ("Margao", "Goa"),
    "puducherry": ("Puducherry", "Puducherry"),
}
# places where the map lookup lands on the district rather than the town: use the town's own centre
CENTERS = {"udupi-manipal": (13.3409, 74.7421), "belagavi": (15.8497, 74.4977)}
RADIUS_KM = {"bengaluru": 14, "chennai": 13, "hyderabad": 14, "kochi": 12, "coimbatore": 11, "north-goa": 13, "south-goa": 13, "coorg": 18, "chikkamagaluru": 16, "wayanad": 20, "munnar": 14, "araku-valley": 14, "ooty": 11}

# Overture category (snake_case) → the lead finder's kind of business. First match wins.
KINDS = [
    (r"resort", "Resort"),
    (r"^hotel|motel", "Hotel"),
    (r"guest_house|bed_and_breakfast|homestay|hostel|cottage|vacation_rental|holiday_rental|lodge|^inn$|villa", "Homestay / guest house"),
    (r"wedding|banquet|event_venue|convention|party|conference|marriage", "Event / banquet venue"),
    (r"cafe|coffee|tea_room|juice", "Café"),
    (r"bar$|^bar_|pub|lounge|nightclub|brewery", "Bar / pub"),
    (r"restaurant|food_court|dhaba|diner|eatery|biryani|pizza|bakery_cafe", "Restaurant"),
    (r"^hospital|hospital$|medical_center|nursing_home", "Hospital"),
    (r"clinic|dentist|dental|doctor|physiotherap|diagnostic|ayurved|homeopath|eye_care|optometrist|skin_care_clinic", "Clinic"),
    (r"college|university", "College"),
    (r"school|preschool|kindergarten|coaching|tutoring|education", "School"),
    (r"gym|fitness|yoga|sports_club|sports_center|martial_arts|dance_studio", "Gym / fitness"),
    (r"spa$|^spa|salon|beauty|hair|barber|massage", "Spa / salon"),
    (r"furniture|interior|home_decor|kitchen|tile|lighting|mattress|home_improvement|flooring", "Furniture / interiors showroom"),
    (r"jewel|clothing|boutique|fashion|saree|textile|department_store|shopping_mall|shopping_center|bridal", "Retail showroom"),
    (r"car_dealer|motorcycle_dealer|automotive_dealer|auto_dealer|vehicle_dealer", "Vehicle showroom"),
    (r"real_estate|property_management|apartment", "Real-estate agent"),
    (r"coworking|shared_office", "Co-working space"),
    (r"architect", "Architect"),
]
KIND_RE = [(re.compile(p), k) for p, k in KINDS]


def kind_of(cat):
    for rx, k in KIND_RE:
        if cat and rx.search(cat):
            return k
    return ""


# How well each kind of business fits a 360° tour (10 = best: people choose them by seeing the space).
FIT = {
    "Resort": 10, "Hotel": 10, "Event / banquet venue": 10, "Homestay / guest house": 9, "Real-estate agent": 9,
    "Restaurant": 8, "Café": 8, "Furniture / interiors showroom": 8, "Co-working space": 8, "Vehicle showroom": 7,
    "Retail showroom": 6, "Architect": 6, "Hospital": 6, "Gym / fitness": 6, "Clinic": 5, "College": 5, "Bar / pub": 5,
    "Spa / salon": 4, "School": 3,
}
# At most this many of one kind in a list of 500, so every kind 360VUE sells to gets a share.
CAP = {
    "Hotel": 70, "Resort": 40, "Homestay / guest house": 50, "Event / banquet venue": 50, "Real-estate agent": 40,
    "Restaurant": 50, "Café": 30, "Furniture / interiors showroom": 30, "Co-working space": 20, "Vehicle showroom": 20,
    "Retail showroom": 25, "Architect": 10, "Hospital": 25, "Gym / fitness": 15, "Clinic": 20, "College": 15, "Bar / pub": 10,
    "Spa / salon": 10, "School": 10,
}
# Big chains decide at head office, not at the outlet: they go to the bottom.
CHAIN_RE = re.compile(r"domino|mcdonald|kfc|pizza hut|subway|starbucks|cafe coffee day|burger king|baskin|naturals|lakme|apollo pharmacy|reliance|more supermarket|big bazaar|dmart|tanishq|kalyan jewel|malabar gold|titan|bata|pantaloons|max fashion|trends|zudio|westside|lenskart|oyo|treebo|fabhotel|haldiram|a2b|wow! momo|chai point|barbeque nation|vlcc|green trends|toni & guy|cult\.fit|gold's gym|anytime fitness", re.I)


def score(p):
    contact = (4 if p["phone"] else 0) + (2 if p["website"] else 0) + (2 if p["email"] else 0) + (1 if p["address"] else 0)
    return FIT.get(p["category"], 3) * 3 + contact + p["confidence"] - (25 if p.get("chain") else 0)


def rank(items):
    """Best fit first, local before chains, each kind capped so the list stays varied; leftovers fill any gap."""
    items = sorted(items, key=score, reverse=True)
    picked, used, rest = [], {}, []
    for p in items:
        cap = CAP.get(p["category"], 20)
        if not p.get("chain") and used.get(p["category"], 0) < cap and len(picked) < MAX:
            picked.append(p)
            used[p["category"]] = used.get(p["category"], 0) + 1
        else:
            rest.append(p)
    for p in rest:  # small places: fill up to 500 with what is left, still best first (chains last)
        if len(picked) >= MAX:
            break
        picked.append(p)
    return sorted(picked, key=score, reverse=True)


def geocode(name, state):
    q = urllib.parse.quote(f"{name}, {state}, India")
    req = urllib.request.Request(f"https://nominatim.openstreetmap.org/search?format=json&limit=1&q={q}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        hit = json.load(r)[0]
    time.sleep(1.1)  # Nominatim: at most one request a second
    return float(hit["lat"]), float(hit["lon"])


def connect():
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';")
    return con


def build(con, slug):
    name, state = PLACES[slug]
    lat, lon = CENTERS.get(slug) or geocode(name, state)
    r = RADIUS_KM.get(slug, 10)
    dlat = r / 111.0
    dlon = r / (111.0 * math.cos(math.radians(lat)))
    t0 = time.time()
    rows = con.execute(
        f"""
        SELECT names.primary AS name, taxonomy.primary AS cat, array_to_string(taxonomy.hierarchy, '/') AS hier, basic_category AS basic, phones, websites, emails,
               coalesce(brand.names.primary, brand.wikidata) AS brand,
               addresses[1].freeform AS street, addresses[1].locality AS locality, confidence, id,
               (bbox.xmin + bbox.xmax) / 2 AS lon, (bbox.ymin + bbox.ymax) / 2 AS lat
        FROM read_parquet('{SRC}', hive_partitioning = 1)
        WHERE bbox.xmin BETWEEN ? AND ? AND bbox.ymin BETWEEN ? AND ?
          AND names.primary IS NOT NULL AND confidence >= 0.5
          AND coalesce(operating_status, 'open') <> 'permanently_closed'
        """,
        [lon - dlon, lon + dlon, lat - dlat, lat + dlat],
    ).fetchall()
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    out, seen = [], set()
    for (nm, cat, hier, basic, phones, websites, emails, brand, street, locality, conf, oid, plon, plat) in rows:
        kind = kind_of(cat or "") or kind_of(basic or "") or kind_of(hier or "")
        if not kind:
            continue
        phone = (phones or [""])[0] or ""
        key = (nm.lower(), re.sub(r"\D", "", phone)[-10:])
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "name": nm[:160], "category": kind, "phone": phone[:40], "email": ((emails or [""])[0] or "")[:120],
            "website": ((websites or [""])[0] or "")[:200], "address": ", ".join(x for x in [street, locality] if x)[:240],
            "overtureId": oid, "lat": round(plat, 6), "lon": round(plon, 6), "confidence": round(conf or 0, 2), "addedAt": now,
            "chain": bool(brand) or bool(CHAIN_RE.search(nm)),
        })
    out = rank(out)
    for p in out:
        p.pop("chain", None)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, f"{slug}.json"), "w", encoding="utf8") as f:
        json.dump({"city": slug, "center": {"lat": lat, "lon": lon}, "release": RELEASE, "businesses": out}, f, ensure_ascii=False, indent=1)
    phones = sum(1 for p in out if p["phone"])
    print(f"{slug}: {len(rows)} places in the area, {len(out)} kept, {phones} with a phone ({time.time() - t0:.0f}s)", flush=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    slugs = list(PLACES) if args == ["--all"] else args
    bad = [s for s in slugs if s not in PLACES]
    if bad or not slugs:
        sys.exit(f"Unknown place(s): {bad}. Use slugs from /locations, or --all.")
    con = connect()
    for s in slugs:
        try:
            build(con, s)
        except Exception as e:  # keep going with the other places
            print(f"{s}: failed — {e}", flush=True)
