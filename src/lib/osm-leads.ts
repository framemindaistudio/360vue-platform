/**
 * Finding businesses on OpenStreetMap (© OpenStreetMap contributors, ODbL) for HQ's lead finder.
 *
 * The public Overpass servers are often busy, and one big search for a city can take a minute — longer than an
 * HQ request may run. So the browser runs five small searches (one per kind of business), each sent to every
 * server at once (the first answer wins), and sends what it found to HQ to save. Shared by the browser and the server.
 */

export const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/** Bigger cities and spread-out regions get a wider net (metres). */
export const RADIUS: Record<string, number> = { bengaluru: 16000, chennai: 15000, hyderabad: 16000, kochi: 13000, coimbatore: 12000, "north-goa": 15000, "south-goa": 15000, coorg: 20000, chikkamagaluru: 18000, wayanad: 22000, munnar: 15000, "araku-valley": 15000, ooty: 12000, kodaikanal: 10000, thekkady: 10000 };
export const radiusOf = (city: string) => RADIUS[city] ?? 10000;

/** The five searches, by kind of business. */
export const SEARCHES: { label: string; filters: string[] }[] = [
  { label: "Hotels, resorts & homestays", filters: ['["tourism"~"^(hotel|motel|resort|guest_house|chalet|apartment|hostel)$"]', '["leisure"="resort"]'] },
  { label: "Restaurants, cafés & venues", filters: ['["amenity"~"^(restaurant|cafe|bar|pub|nightclub|fast_food|events_venue|conference_centre)$"]'] },
  { label: "Hospitals, clinics & education", filters: ['["amenity"~"^(hospital|clinic|dentist|doctors|college|university|school|kindergarten)$"]'] },
  { label: "Showrooms, estate agents & offices", filters: ['["shop"~"^(furniture|interior_decoration|kitchen|bathroom_furnishing|lighting|tiles|bed|jewelry|clothes|boutique|department_store|mall|car|motorcycle)$"]', '["office"~"^(estate_agent|coworking|architect)$"]', '["amenity"="coworking_space"]'] },
  { label: "Gyms, spas & salons", filters: ['["leisure"~"^(fitness_centre|sports_centre|spa)$"]', '["shop"~"^(beauty|hairdresser)$"]'] },
];

export function searchQuery(i: number, lat: number, lon: number, r: number) {
  const parts = SEARCHES[i].filters.map((f) => `nw["name"]${f}(around:${r},${lat},${lon});`).join("");
  return `[out:json][timeout:55];(${parts});out center tags 1000;`;
}

/** OpenStreetMap tags → the kind of business, in 360VUE's words. */
const KINDS: [RegExp, string][] = [
  [/^tourism=(hotel|motel)$/, "Hotel"],
  [/^tourism=(resort)$|^leisure=resort$/, "Resort"],
  [/^tourism=(guest_house|chalet|apartment|hostel)$/, "Homestay / guest house"],
  [/^amenity=(restaurant|fast_food)$/, "Restaurant"],
  [/^amenity=(cafe)$/, "Café"],
  [/^amenity=(bar|pub|nightclub)$/, "Bar / pub"],
  [/^amenity=(events_venue|conference_centre)$/, "Event / banquet venue"],
  [/^amenity=(hospital)$/, "Hospital"],
  [/^amenity=(clinic|dentist|doctors)$/, "Clinic"],
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

export function kindOf(tags: Record<string, string>) {
  for (const k of ["tourism", "amenity", "leisure", "shop", "office"]) {
    if (!tags[k]) continue;
    const hit = KINDS.find(([re]) => re.test(`${k}=${tags[k]}`));
    if (hit) return hit[1];
  }
  return "";
}

export interface FoundBusiness {
  name: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  osmId: string;
  lat?: number;
  lon?: number;
}

type El = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
const first = (v: string | undefined) => (v ?? "").split(";")[0].trim();

/** Overpass elements → businesses worth calling (named, a kind we sell to). */
export function toBusinesses(elements: El[]): FoundBusiness[] {
  const out: FoundBusiness[] = [];
  for (const el of elements ?? []) {
    const t = el.tags ?? {};
    const category = kindOf(t);
    if (!t.name || !category) continue;
    out.push({
      name: t.name,
      category,
      phone: first(t["contact:phone"] || t.phone || t["contact:mobile"] || t.mobile),
      email: first(t["contact:email"] || t.email),
      website: first(t["contact:website"] || t.website),
      address: [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] || t["addr:neighbourhood"], t["addr:city"]].filter(Boolean).join(", "),
      osmId: `${el.type}/${el.id}`,
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
    });
  }
  return out;
}

/**
 * Run one search on every server at once and take the first good answer (the others are cancelled). Today's public
 * servers are often overloaded, so asking them one after another could take minutes; this way a search is never
 * slower than the fastest server that answers, and gives up after `limit` ms.
 */
export async function runSearch(query: string, limit = 60_000): Promise<FoundBusiness[]> {
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), limit);
  const errors: string[] = [];
  try {
    const els = await Promise.any(
      OVERPASS_SERVERS.map(async (url) => {
        try {
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `data=${encodeURIComponent(query)}`, signal: stop.signal });
          if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}`);
          const json = (await res.json()) as { elements?: El[] };
          if (!Array.isArray(json.elements)) throw new Error(`${new URL(url).host} no data`);
          return json.elements;
        } catch (e) {
          errors.push(e instanceof Error ? e.message : String(e));
          throw e;
        }
      }),
    );
    return toBusinesses(els);
  } catch {
    throw new Error(`All map servers are busy (${errors.slice(0, 2).join(", ") || "no answer in time"}).`);
  } finally {
    clearTimeout(timer);
    stop.abort();
  }
}
