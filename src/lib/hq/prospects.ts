import "server-only";
import { store, StoreConflictError } from "@/lib/store";
import { CITIES, cityBySlug, stateOf } from "@/lib/locations";
import { upsertRecord } from "./records";
import { uid } from "@/lib/utils";
import { radiusOf } from "@/lib/osm-leads";

/*
 * Lead finder: businesses in each place 360VUE serves, to contact and turn into clients.
 *
 * Sources: Overture Maps places (© Overture Maps Foundation, CDLA-Permissive-2.0 — the best coverage of Indian
 * businesses, built offline with scripts/overture-leads.py and uploaded with scripts/upload-leads.py), and
 * OpenStreetMap (© OpenStreetMap contributors, ODbL) searched from the browser to top a list up. Both are free and
 * legal to store and use with attribution. Google Maps is not scraped: it breaks Google's terms, and the Places API forbids keeping its
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
  source: "openstreetmap" | "overture" | "csv" | "manual";
  /** Overture Maps place id (lists built with scripts/overture-leads.py) */
  overtureId?: string;
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

/** Where to search: the place's centre (looked up once, then kept in its file) and how far around it. */
export async function placeCenter(city: string, by: string) {
  const { file } = await readPlace(city);
  if (file.center) return { center: file.center, radius: radiusOf(city) };
  const center = await geocode(city);
  await writePlace(city, (f) => ({ ...f, center }), `Lead finder: locate ${cityBySlug(city)!.name}`, by);
  return { center, radius: radiusOf(city) };
}

/**
 * Save businesses the browser found on OpenStreetMap: add the ones not on the list yet (matched by OSM id, or by
 * name + phone), the most contactable first, up to 500 per place. Statuses and notes of existing entries are never
 * touched.
 */
export async function addFound(city: string, input: unknown, by: string) {
  if (!Array.isArray(input)) throw new Error("Nothing to add.");
  const now = new Date().toISOString();
  const clip = (v: unknown, n: number) => s(v).slice(0, n);
  const found: Prospect[] = input.slice(0, 3000).flatMap((x) => {
    const r = x as Record<string, unknown>;
    const name = clip(r.name, 160);
    const osmId = clip(r.osmId, 40);
    if (!name || !/^(node|way|relation)\/\d+$/.test(osmId)) return [];
    return [{ id: uid("pro"), name, category: clip(r.category, 60) || "Other", phone: clip(r.phone, 40), email: clip(r.email, 120), website: clip(r.website, 200), address: clip(r.address, 240), city, source: "openstreetmap" as const, osmId, lat: Number(r.lat) || undefined, lon: Number(r.lon) || undefined, status: "new" as const, notes: "", addedAt: now }];
  });
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
        if (p.osmId) have.add(p.osmId);
        added++;
      }
      return { ...f, fetchedAt: now, prospects: list };
    },
    `Lead finder: ${cityBySlug(city)!.name} from OpenStreetMap`,
    by,
  );
  return { added, total: next.prospects.length, received: found.length };
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

/** Add one business by hand (found on Google, Instagram, a walk past…). Refused if it is already on the list. */
export async function addManual(city: string, input: Record<string, unknown>, by: string) {
  const name = s(input.name).slice(0, 160);
  if (!name) throw new Error("Business not found: give it a name.");
  const phone = s(input.phone).slice(0, 40);
  const key = `${name.toLowerCase()}|${phone.replace(/\D/g, "").slice(-10)}`;
  let out: Prospect | null = null;
  await writePlace(
    city,
    (f) => {
      if (f.prospects.some((p) => `${p.name.toLowerCase()}|${p.phone.replace(/\D/g, "").slice(-10)}` === key || (phone && p.phone.replace(/\D/g, "").slice(-10) === phone.replace(/\D/g, "").slice(-10)))) throw new Error("Business not found: it is already on this list (same name or phone).");
      out = { id: uid("pro"), name, category: s(input.category).slice(0, 60) || "Homestay / guest house", phone, email: s(input.email).slice(0, 120), website: s(input.website).slice(0, 200), address: s(input.address).slice(0, 240), city, source: "manual", status: "new", notes: s(input.notes).slice(0, 1000), addedAt: new Date().toISOString(), updatedBy: by };
      return { ...f, prospects: [out, ...f.prospects] };
    },
    `Lead finder: ${name} added by hand`,
    by,
  );
  return out as unknown as Prospect;
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
