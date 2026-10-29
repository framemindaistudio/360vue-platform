"""
Upload lead lists built by scripts/overture-leads.py into HQ's lead finder (the private data repository), place by
place. Businesses already on a list keep their status, notes and owner; new ones are added (matched by Overture id,
or by name + phone), the most contactable first, up to 500 per place.

  python scripts/upload-leads.py hampi gokarna      # some places
  python scripts/upload-leads.py --all              # every file in out/overture
  python scripts/upload-leads.py --all --replace    # also drop untouched entries the new list no longer has

With --replace, entries nobody has worked on (status "new", no notes, owner or client) are replaced by the new
list; anything the team has touched always stays.

Needs the GitHub CLI signed in with access to the data repository (DATA_REPO, default framemindaistudio/360vue-hq-data).
"""
import base64, json, os, re, subprocess, sys, uuid
from datetime import datetime, timezone

REPO = os.environ.get("DATA_REPO", "framemindaistudio/360vue-hq-data")
OUT = os.path.join(os.path.dirname(__file__), "..", "out", "overture")
MAX = 500


def gh(*args, data=None):
    r = subprocess.run(["gh", "api", *args], input=data, capture_output=True, text=True, encoding="utf8")
    return r.returncode, r.stdout, r.stderr


def key(p):
    return f"{p['name'].lower()}|{re.sub(r'\\D', '', p.get('phone', ''))[-10:]}"


def touched(p):
    return p.get("status", "new") != "new" or p.get("notes") or p.get("owner") or p.get("clientId") or p.get("source") in ("csv", "manual")


def upload(slug, replace=False):
    built = json.load(open(os.path.join(OUT, f"{slug}.json"), encoding="utf8"))
    path = f"data/prospects/{slug}.json"
    code, out, _ = gh(f"repos/{REPO}/contents/{path}")
    sha, current = None, {"city": slug, "prospects": []}
    if code == 0:
        meta = json.loads(out)
        sha = meta["sha"]
        current = json.loads(base64.b64decode(meta["content"]).decode("utf8"))
    prospects = current.get("prospects", [])
    dropped = 0
    if replace:
        keep = [p for p in prospects if touched(p)]
        dropped = len(prospects) - len(keep)
        prospects = keep
    have_ids = {p.get("overtureId") for p in prospects if p.get("overtureId")}
    have_keys = {key(p) for p in prospects}
    added = 0
    for b in built["businesses"]:
        if len(prospects) >= MAX:
            break
        if b["overtureId"] in have_ids or key(b) in have_keys:
            continue
        prospects.append({
            "id": "pro_" + uuid.uuid4().hex[:12], "name": b["name"], "category": b["category"], "phone": b["phone"], "email": b["email"],
            "website": b["website"], "address": b["address"], "city": slug, "source": "overture", "overtureId": b["overtureId"],
            "lat": b["lat"], "lon": b["lon"], "status": "new", "notes": "", "addedAt": b["addedAt"],
        })
        have_ids.add(b["overtureId"])
        have_keys.add(key(b))
        added += 1
    if not added and not dropped:
        print(f"{slug}: nothing new ({len(prospects)} on the list)")
        return
    current.update({"city": slug, "center": current.get("center") or built["center"], "fetchedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "prospects": prospects})
    body = json.dumps(current, ensure_ascii=False, indent=1) + "\n"
    payload = {"message": f"Lead finder: {slug} from Overture Maps ({added} added)\n\nby Claude via 360VUE HQ", "content": base64.b64encode(body.encode("utf8")).decode()}
    if sha:
        payload["sha"] = sha
    code, out, err = gh("-X", "PUT", f"repos/{REPO}/contents/{path}", "--input", "-", data=json.dumps(payload))
    if code != 0:
        print(f"{slug}: upload failed — {err.strip()[:200]}")
        return
    print(f"{slug}: {added} added{f', {dropped} untouched replaced' if replace else ''} ({len(prospects)} on the list, {sum(1 for p in prospects if p.get('phone'))} with a phone)")


if __name__ == "__main__":
    args = sys.argv[1:]
    replace = "--replace" in args
    args = [a for a in args if a != "--replace"]
    slugs = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith(".json")) if args == ["--all"] else args
    for s in slugs:
        try:
            upload(s, replace)
        except Exception as e:
            print(f"{s}: failed — {e}")
