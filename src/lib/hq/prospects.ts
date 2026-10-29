import "server-only";
import { store, StoreConflictError } from "@/lib/store";
import { CITIES, cityBySlug, stateOf } from "@/lib/locations";
import { upsertRecord } from "./records";
import { uid } from "@/lib/utils";

/*
 * Lead finder: businesses in each place 360VUE serves, to contact and turn into clients.
 *
 * Source: OpenStreetMap (© OpenStreetMap contributors, ODbL) through the Overpass API — free, and legal to store and
 * use with attribution. Google Maps is not scraped: it breaks Google's terms, and the Places API forbids keeping its
 * results as a list. Teams can also import their own CSV lists (Justdial, IndiaMART, events, referrals).
 *
 * Storage: one file per place (data/prospects/<city>.json), so each list stays small and quick to save.
 */

export const PROSPECT_STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["interested", "Interested"],
  ["follow-up", "Follow up later"],
  ["not-interested", "Not interested"],
  ["converted", "Converted to client"],
  ["do-not-contact", "Do not contact"],
] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number][0];

export interface Prospect {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  source: "openstreetmap" | "csv" | "manual";
  osmId?: string;
  lat?: number;
  lon?: number;
  status: ProspectStatus;
  notes: string;
  owner?: string;
  lastContactedAt?: string;
  clientId?: string;
  addedAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface PlaceFile {
  city: string;
  center?: { lat: number; lon: number };
  fetchedAt?: string;
  prospects: Prospect[];
}

export const MAX_PER_PLACE = 500;
const path = (city: string) => `data/prospects/${city}.json`;
const s = (v: unknown) => (v === undefined || v === null ? "" : String(v)).trim();

export async function readPlace(city: string) {
  if (!cityBySlug(city)) throw new Error("Unknown location.");
  const { data, sha } = await store.readJSON<PlaceFile>(path(city), { city, prospects: [] });
  return { file: { city, prospects: Array.isArray(data.prospects) ? data.prospects : [], center: data.center, fetchedAt: data.fetchedAt }, sha };
}

async function writePlace(city: string, change: (f: PlaceFile) => PlaceFile, message: string, by: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { file, sha } = await readPlace(city);
    const next = change(file);
    try {
      await store.write(path(city), JSON.stringify(next, null, 1) + "\n", message, { sha, author: by });
      return next;
    } catch (e) {
      if (!(e instanceof StoreConflictError) || attempt === 2) throw e;
    }
  }
  throw new StoreConflictError();
}

/** Counts per place and status, for the overview. */
export async function summary() {
  const out: Record<string, { total: number; byStatus: Record<string, number>; fetchedAt?: string }> = {};
  const entries = await store.list("data/prospects").catch(() => []);
  const have = new Set(entries.map((e) => e.name.replace(/\.json$/, "")));
  await Promise.all(
    CITIES.filter((c) => have.has(c.slug)).map(async (c) => {
      const { file } = await readPlace(c.slug);
      const byStatus: Record<string, number> = {};
      for (const p of file.prospects) byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      out[c.slug] = { total: file.prospects.length, byStatus, fetchedAt: file.fetchedAt };
    }),
  );
  return out;
}

/* ───────────────────────────── OpenStreetMap ───────────────────────────── */

const UA = "360VUE-HQ/1.0 (lead finder; contact: framemindaistudio@gmail.com)";

/** Where the place is (Nominatim, once per place; kept in the file). */
async function geocode(city: string) {
  const c = cityBySlug(city)!;
  const q = `${c.name.replace(/\s*\(.*\)$/, "").replace(/ & .*/, "")}, ${stateOf(c).name}, India`;
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA, Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Could not locate ${c.name} on the map (${res.status}).`);
  const [hit] = (await res.json()) as { lat: string; lon: string }[];
  if (!hit) throw new Error(`Could not locate ${c.name} on the map.`);
  return { lat: Number(hit.lat), lon: Number(hit.lon) };
}

/** OpenStreetMap tags → the kind of business, in 360VUE's words. Only kinds that buy tours are fetched. */
const KINDS: [RegExp, string][] = [
  [/^tourism=(hotel|motel)$/, "Hotel"],
  [/^tourism=(resort)$|^leisure=resort$/, "Resort"],
  [/^tourism=(guest_house|chalet|apartment|hostel)$/, "Homestay / guest house"],
  [/^amenity=(restaurant|fast_food)$/, "Restaurant"],
  [/^amenity=(cafe)$/, "Café"],
  [/^amenity=(bar|pub|nightclub)$/, "Bar / pub"],
  [/^amenity=(events_venue|conference_centre)$/, "Event / banquet venue"],
  [/^amenity=(hospital)$/, "Hospital"],
  [/^amenity=(clinic|dentist|doctors)$|^healthcare=/, "Clinic"],
  [/^amenity=(college|university)$/, "College"],
  [/^amenity=(school|kindergarten)$/, "School"],
  [/^leisure=(fitness_centre|sports_centre)$/, "Gym / fitness"],
  [/^leisure=(spa)$|^shop=(beauty|hairdresser)$/, "Spa / salon"],
  [/^shop=(furniture|interior_decoration|kitchen|bathroom_furnishing|lighting|tiles|bed)$/, "Furniture / interiors showroom"],
  [/^shop=(jewelry|clothes|boutique|department_store|mall)$/, "Retail showroom"],
  [/^shop=(car|motorcycle)$/, "Vehicle showroom"],
  [/^office=(estate_agent)$/, "Real-estate agent"],
  [/^office=(coworking)$|^amenity=(coworking_space)$/, "Co-working space"],
  [/^office=(architect)$/, "Architect"],
];

function kindOf(tags: Record<string, string>) {
  for (const k of ["tourism", "amenity", "leisure", "shop", "office", "healthcare"]) {
    if (!tags[k]) continue;
    const hit = KINDS.find(([re]) => re.test(`${k}=${tags[k]}`));
    if (hit) return hit[1];
  }
  return "";
}

const QUERY = (lat: number, lon: number, r: number) => `[out:json][timeout:60];
(
  nwr["name"]["tourism"~"^(hotel|motel|resort|guest_house|chalet|apartment|hostel)$"](around:${r},${lat},${lon});
  nwr["name"]["amenity"~"^(restaurant|cafe|bar|pub|nightclub|fast_food|events_venue|conference_centre|hospital|clinic|dentist|doctors|college|university|school|kindergarten|coworking_space)$"](around:${r},${lat},${lon});
  nwr["name"]["leisure"~"^(fitness_centre|sports_centre|spa|resort)$"](around:${r},${lat},${lon});
  nwr["name"]["shop"~"^(furniture|interior_decoration|kitchen|bathroom_furnishing|lighting|tiles|bed|jewelry|clothes|boutique|department_store|mall|car|motorcycle|beauty)$"](around:${r},${lat},${lon});
  nwr["name"]["office"~"^(estate_agent|coworking|architect)$"](around:${r},${lat},${lon});
  nwr["name"]["healthcare"](around:${r},${lat},${lon});
);
out center tags 4000;`;

/** Bigger cities get a wider net. */
const RADIUS: Record<string, number> = { bengaluru: 18000, chennai: 16000, hyderabad: 18000, kochi: 14000, coimbatore: 12000, "north-goa": 15000, "south-goa": 15000, coorg: 20000, chikkamagaluru: 18000, wayanad: 22000, munnar: 15000, "araku-valley": 15000, ooty: 12000, kodaikanal: 10000, thekkady: 10000 };

/**
 * Fetch businesses near a place from OpenStreetMap and add the ones not on the list yet (matched by OSM id, or by
 * name + phone). Businesses with a phone or website come first; the list stops at 500. Statuses and notes of
 * existing entries are never touched.
 */
export async function fetchFromOsm(city: string, by: string) {
  const { file } = await readPlace(city);
  const center = file.center ?? (await geocode(city));
  const r = RADIUS[city] ?? 10000;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: `data=${encodeURIComponent(QUERY(center.lat, center.lon, r))}`,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`OpenStreetMap is busy (${res.status}). Try again in a minute.`);
  const json = (await res.json()) as { elements: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
  const now = new Date().toISOString();
  const found: Prospect[] = [];
  for (const el of json.elements ?? []) {
    const t = el.tags ?? {};
    const category = kindOf(t);
    if (!t.name || !category) continue;
    const phone = s(t["contact:phone"] || t.phone || t["contact:mobile"] || t.mobile).split(";")[0].trim();
    const website = s(t["contact:website"] || t.website).split(";")[0].trim();
    const email = s(t["contact:email"] || t.email).split(";")[0].trim();
    const address = [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] || t["addr:neighbourhood"], t["addr:city"]].filter(Boolean).join(", ");
    found.push({
      id: uid("pro"),
      name: t.name,
      category,
      phone,
      email,
      website,
      address,
      city,
      source: "openstreetmap",
      osmId: `${el.type}/${el.id}`,
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
      status: "new",
      notes: "",
      addedAt: now,
    });
  }
  // most contactable first
  const score = (p: Prospect) => (p.phone ? 4 : 0) + (p.website ? 2 : 0) + (p.email ? 2 : 0) + (p.address ? 1 : 0);
  found.sort((a, b) => score(b) - score(a));
  let added = 0;
  const next = await writePlace(
    city,
    (f) => {
      const have = new Set(f.prospects.map((p) => p.osmId).filter(Boolean));
      const keys = new Set(f.prospects.map((p) => `${p.name.toLowerCase()}|${p.phone.replace(/\D/g, "").slice(-10)}`));
      const list = [...f.prospects];
      for (const p of found) {
        if (list.length >= MAX_PER_PLACE) break;
        const key = `${p.name.toLowerCase()}|${p.phone.replace(/\D/g, "").slice(-10)}`;
        if ((p.osmId && have.has(p.osmId)) || keys.has(key)) continue;
        list.push(p);
        keys.add(key);
        added++;
      }
      return { ...f, center, fetchedAt: now, prospects: list };
    },
    `Lead finder: ${cityBySlug(city)!.name} from OpenStreetMap`,
    by,
  );
  return { added, total: next.prospects.length, foundOnMap: found.length };
}

/* ───────────────────────────── your own lists ───────────────────────────── */

/** Split one CSV line, honouring quotes. */
function cells(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

/** Import a CSV with a header row: name (required), phone, email, website, category, address, notes. */
export async function importCsv(city: string, csv: string, by: string) {
  const lines = csv.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("The file needs a header row and at least one business.");
  const head = cells(lines[0]).map((h) => h.toLowerCase());
  const col = (names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
  const ix = { name: col(["name", "business"]), phone: col(["phone", "mobile", "contact"]), email: col(["email"]), website: col(["website", "url"]), category: col(["category", "type"]), address: col(["address", "area"]), notes: col(["notes", "remark"]) };
  if (ix.name < 0) throw new Error("No “name” column found in the header row.");
  const now = new Date().toISOString();
  const rows = lines.slice(1, 2001).map(cells);
  let added = 0;
  let skipped = 0;
  const next = await writePlace(
    city,
    (f) => {
      const keys = new Set(f.prospects.map((p) => `${p.name.toLowerCase()}|${p.phone.replace(/\D/g, "").slice(-10)}`));
      const list = [...f.prospects];
      for (const r of rows) {
        const get = (i: number) => (i >= 0 ? s(r[i]) : "");
        const name = get(ix.name).slice(0, 160);
        if (!name) continue;
        const phone = get(ix.phone).slice(0, 40);
        const key = `${name.toLowerCase()}|${phone.replace(/\D/g, "").slice(-10)}`;
        if (keys.has(key) || list.length >= 2000) {
          skipped++;
          continue;
        }
        keys.add(key);
        list.push({ id: uid("pro"), name, category: get(ix.category).slice(0, 60) || "Other", phone, email: get(ix.email).slice(0, 120), website: get(ix.website).slice(0, 200), address: get(ix.address).slice(0, 240), city, source: "csv", status: "new", notes: get(ix.notes).slice(0, 1000), addedAt: now });
        added++;
      }
      return { ...f, prospects: list };
    },
    `Lead finder: CSV import for ${cityBySlug(city)!.name}`,
    by,
  );
  return { added, skipped, total: next.prospects.length };
}

/* ───────────────────────────── working the list ───────────────────────────── */

export async function updateProspect(city: string, id: string, patch: { status?: string; notes?: string; owner?: string }, by: string) {
  let out: Prospect | null = null;
  await writePlace(
    city,
    (f) => {
      const p = f.prospects.find((x) => x.id === id);
      if (!p) throw new Error("Business not found.");
      if (patch.status && PROSPECT_STATUSES.some(([k]) => k === patch.status)) {
        if (patch.status !== p.status && ["contacted", "interested", "follow-up", "not-interested"].includes(patch.status)) p.lastContactedAt = new Date().toISOString();
        p.status = patch.status as ProspectStatus;
      }
      if (patch.notes !== undefined) p.notes = s(patch.notes).slice(0, 2000);
      if (patch.owner !== undefined) p.owner = s(patch.owner).slice(0, 80);
      p.updatedAt = new Date().toISOString();
      p.updatedBy = by;
      out = { ...p };
      return f;
    },
    `Lead finder: update ${id}`,
    by,
  );
  return out as unknown as Prospect;
}

/** Turn a business into a CRM client (stage "Contacted" or later), keeping the link both ways. */
export async function convertProspect(city: string, id: string, by: string) {
  const { file } = await readPlace(city);
  const p = file.prospects.find((x) => x.id === id);
  if (!p) throw new Error("Business not found.");
  if (p.clientId) return { clientId: p.clientId, already: true };
  const c = cityBySlug(city)!;
  const client = await upsertRecord(
    "clients",
    {
      name: p.name,
      stage: "contacted",
      industry: p.category,
      phone: p.phone,
      email: p.email,
      website: p.website,
      address: p.address,
      city: c.name,
      country: "India",
      source: "Lead finder",
      notes: [p.notes, `From the lead finder: ${c.name}.`].filter(Boolean).join("\n"),
    },
    by,
  );
  await writePlace(
    city,
    (f) => {
      const x = f.prospects.find((y) => y.id === id);
      if (x) Object.assign(x, { status: "converted", clientId: client.id, updatedAt: new Date().toISOString(), updatedBy: by });
      return f;
    },
    `Lead finder: ${p.name} converted to client`,
    by,
  );
  return { clientId: client.id, already: false };
}
