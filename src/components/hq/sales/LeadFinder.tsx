"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe, Loader2, MapPinned, MessageCircle, Phone, Search, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/hq/ui";
import { api, useHq } from "@/components/hq/data";
import { CITIES, STATES } from "@/lib/locations";
import { runSearch, searchQuery, SEARCHES, type FoundBusiness } from "@/lib/osm-leads";
import { cn } from "@/lib/utils";

interface Prospect {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  source: string;
  status: string;
  notes: string;
  lastContactedAt?: string;
  clientId?: string;
}
type Summary = Record<string, { total: number; byStatus: Record<string, number>; fetchedAt?: string }>;

const STATUSES: [string, string][] = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["interested", "Interested"],
  ["follow-up", "Follow up later"],
  ["not-interested", "Not interested"],
  ["converted", "Converted to client"],
  ["do-not-contact", "Do not contact"],
];
const tone: Record<string, string> = { interested: "text-good", converted: "text-good", "not-interested": "text-charcoal", "do-not-contact": "text-bad", contacted: "text-blueprint", "follow-up": "text-blueprint" };
const waLink = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  const to = d.length === 10 ? `91${d}` : d.startsWith("0") ? `91${d.slice(1)}` : d;
  return to.length >= 11 ? `https://wa.me/${to}` : "";
};
const day = (d?: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");

/**
 * HQ → Lead finder: businesses in every place 360VUE serves (from OpenStreetMap, or your own CSV lists). Call or
 * WhatsApp them, keep a status, and convert the interested ones into CRM clients — then quote, invoice, approve the
 * advance, and their portal opens.
 */
export function LeadFinder() {
  const { store } = useHq();
  const [summary, setSummary] = useState<Summary>({});
  const [city, setCity] = useState(CITIES[0].slug);
  const [list, setList] = useState<Prospect[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [cat, setCat] = useState("");
  const [contactable, setContactable] = useState(true);

  const loadSummary = useCallback(() => {
    api<{ summary: Summary }>("/api/hq/prospects")
      .then((j) => setSummary(j.summary))
      .catch(() => {});
  }, []);
  const loadCity = useCallback((slug: string) => {
    api<{ place: { prospects: Prospect[]; fetchedAt?: string } }>(`/api/hq/prospects?city=${slug}`)
      .then((j) => {
        setList(j.place.prospects);
        setFetchedAt(j.place.fetchedAt ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load."));
  }, []);
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);
  useEffect(() => {
    loadCity(city);
  }, [city, loadCity]);

  const post = (body: Record<string, unknown>) => api<Record<string, unknown>>("/api/hq/prospects", { method: "POST", body: JSON.stringify({ city, ...body }) });

  async function findOnMap() {
    setBusy("fetch");
    setError("");
    setMsg("");
    try {
      // 1 · where to search (HQ looks the place up once)
      const { center, radius } = (await post({ action: "center" })) as unknown as { center: { lat: number; lon: number }; radius: number };
      // 2 · five small searches from this browser, each trying the map servers in turn (no time limit from HQ)
      const found: FoundBusiness[] = [];
      const skipped: string[] = [];
      for (let i = 0; i < SEARCHES.length; i++) {
        setMsg(`Searching OpenStreetMap — ${SEARCHES[i].label} (${i + 1} of ${SEARCHES.length})…${found.length ? ` ${found.length} found so far.` : ""}`);
        try {
          found.push(...(await runSearch(searchQuery(i, center.lat, center.lon, radius))));
        } catch {
          skipped.push(SEARCHES[i].label);
        }
      }
      if (!found.length && skipped.length === SEARCHES.length) throw new Error("The OpenStreetMap servers are all busy right now. Try again in a few minutes.");
      // 3 · HQ saves the new ones
      setMsg(`Saving ${found.length} businesses…`);
      const j = await post({ action: "add", found });
      setMsg(
        `Found ${found.length} businesses on the map; ${j.added} new added (${j.total} on the list).` +
          (skipped.length ? ` Skipped because the map servers were busy: ${skipped.join(", ")} — run it again later to add them.` : ""),
      );
      loadCity(city);
      loadSummary();
    } catch (e) {
      setMsg("");
      setError(e instanceof Error ? e.message : "Could not search the map.");
    } finally {
      setBusy("");
    }
  }

  async function importFile(file: File) {
    setBusy("import");
    setError("");
    try {
      const j = await post({ action: "import", csv: await file.text() });
      setMsg(`Imported ${j.added} businesses${j.skipped ? ` (${j.skipped} already on the list)` : ""}.`);
      loadCity(city);
      loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import.");
    } finally {
      setBusy("");
    }
  }

  async function change(p: Prospect, patch: Partial<Prospect>) {
    setList((l) => l?.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) ?? null);
    try {
      await post({ action: "update", id: p.id, ...patch });
      loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      loadCity(city);
    }
  }

  async function convert(p: Prospect) {
    setBusy(p.id);
    try {
      const j = await post({ action: "convert", id: p.id });
      setList((l) => l?.map((x) => (x.id === p.id ? { ...x, status: "converted", clientId: String(j.clientId) } : x)) ?? null);
      setMsg(`${p.name} is now a client in the CRM. Next: discovery call and a quote.`);
      loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert.");
    } finally {
      setBusy("");
    }
  }

  const categories = useMemo(() => [...new Set((list ?? []).map((p) => p.category))].sort(), [list]);
  const shown = (list ?? []).filter(
    (p) =>
      (!status || p.status === status) &&
      (!cat || p.category === cat) &&
      (!contactable || p.phone || p.email || p.website) &&
      (!q || `${p.name} ${p.address} ${p.phone}`.toLowerCase().includes(q.toLowerCase())),
  );
  const c = CITIES.find((x) => x.slug === city)!;
  const sum = summary[city];

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        icon="MapPinned"
        title="Lead finder"
        description="Businesses in every place on the website's Locations page — hotels, homestays, cafés, restaurants, hospitals, colleges, showrooms, venues and more — to call, WhatsApp and convert into clients. Found on OpenStreetMap or imported from your own lists."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* places */}
        <aside className="max-h-[70vh] overflow-y-auto rounded-[var(--radius-md)] border border-graphite/15 bg-white">
          {STATES.map((st) => (
            <div key={st.slug}>
              <p className="sticky top-0 bg-paper-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blueprint">{st.name}</p>
              <ul>
                {CITIES.filter((x) => x.state === st.slug).map((x) => {
                  const s = summary[x.slug];
                  return (
                    <li key={x.slug}>
                      <button type="button" onClick={() => {
                          setList(null);
                          setCity(x.slug);
                        }} className={cn("flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-graphite/[0.04]", city === x.slug && "bg-lime/15 font-semibold")}>
                        <span>{x.name}</span>
                        <span className="tabular text-xs text-charcoal">{s ? `${s.byStatus.converted ?? 0}/${s.total}` : "—"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* the place */}
        <section>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-graphite">{c.name}</h2>
              <p className="text-sm text-charcoal">
                {sum ? `${sum.total} businesses · ${sum.byStatus.contacted ?? 0} contacted · ${sum.byStatus.interested ?? 0} interested · ${sum.byStatus.converted ?? 0} clients` : "No list yet."}
                {fetchedAt ? ` · map checked ${day(fetchedAt)}` : ""}
              </p>
            </div>
            {store.writable && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={findOnMap} disabled={!!busy}>
                  {busy === "fetch" ? <Loader2 className="size-4 animate-spin" /> : <MapPinned className="size-4" />} Find businesses on the map
                </Button>
                <label className={cn("inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-graphite/20 px-3 text-sm font-semibold hover:bg-graphite/5", busy && "pointer-events-none opacity-50")}>
                  {busy === "import" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Import CSV
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
                </label>
              </div>
            )}
          </div>
          {store.writable && <AddBusiness key={city} onAdd={async (business) => {
            await post({ action: "manual", business });
            setMsg(`${String(business.name)} added to ${c.name}.`);
            loadCity(city);
            loadSummary();
          }} />}
          <p className="mt-1 text-xs text-charcoal">CSV columns: name (required), phone, email, website, category, address, notes. Business data © Overture Maps Foundation and © OpenStreetMap contributors. Lists come preloaded from Overture; “Find businesses on the map” tops them up from OpenStreetMap (its public servers are sometimes busy — try again later if so).</p>
          {msg && <p className="mt-3 rounded border border-lime/50 bg-lime/10 px-3 py-2 text-sm">{msg}</p>}
          {error && <p className="mt-3 rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-charcoal" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, area, phone" className="pl-8" aria-label="Search" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
              <option value="">Every status</option>
              {STATUSES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </Select>
            <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Kind of business">
              <option value="">Every kind</option>
              {categories.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={contactable} onChange={(e) => setContactable(e.target.checked)} className="accent-graphite" /> Only businesses with a phone, email or website
          </label>

          {!list && <p className="mt-6 text-sm text-charcoal">Loading…</p>}
          {list && list.length === 0 && <p className="mt-6 rounded border border-graphite/15 bg-paper-50 p-5 text-sm text-charcoal">No businesses yet for {c.name}. Use “Find businesses on the map”, or import your own list.</p>}
          {list && list.length > 0 && <p className="mt-4 text-xs text-charcoal">Showing {shown.length} of {list.length}</p>}

          <ul className="mt-2 divide-y divide-graphite/10 rounded-[var(--radius-md)] border border-graphite/15 bg-white">
            {shown.slice(0, 300).map((p) => (
              <li key={p.id} className="grid gap-3 p-3 text-sm md:grid-cols-[1.4fr_1fr_auto]">
                <div className="min-w-0">
                  <p className="font-semibold text-graphite">{p.name}</p>
                  <p className="text-xs text-charcoal">
                    {p.category}
                    {p.address ? ` · ${p.address}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {p.phone && (
                      <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 text-blueprint hover:underline">
                        <Phone className="size-3" /> {p.phone}
                      </a>
                    )}
                    {p.phone && waLink(p.phone) && (
                      <a href={waLink(p.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blueprint hover:underline">
                        <MessageCircle className="size-3" /> WhatsApp
                      </a>
                    )}
                    {p.website && (
                      <a href={/^https?:/.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blueprint hover:underline">
                        <Globe className="size-3" /> Website
                      </a>
                    )}
                    {p.email && <a href={`mailto:${p.email}`} className="text-blueprint hover:underline">{p.email}</a>}
                  </div>
                </div>
                <div>
                  <Select value={p.status} disabled={!store.writable || p.status === "converted"} onChange={(e) => change(p, { status: e.target.value })} aria-label={`Status of ${p.name}`} className={cn("h-8 text-xs", tone[p.status])}>
                    {STATUSES.map(([k, l]) => (
                      <option key={k} value={k} disabled={k === "converted"}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <Input defaultValue={p.notes} disabled={!store.writable} onBlur={(e) => e.target.value !== p.notes && change(p, { notes: e.target.value })} placeholder="Notes (call outcome, next step)" className="mt-1.5 h-8 text-xs" aria-label={`Notes on ${p.name}`} />
                  {p.lastContactedAt && <p className="mt-1 text-[11px] text-charcoal">Last contact {day(p.lastContactedAt)}</p>}
                </div>
                <div className="flex items-start">
                  {p.clientId ? (
                    <Button size="sm" variant="ghost" href={`/hq/crm/${p.clientId}`}>
                      Open in CRM <ExternalLink className="size-3" />
                    </Button>
                  ) : (
                    store.writable &&
                    p.status !== "do-not-contact" && (
                      <Button size="sm" variant="secondary" disabled={busy === p.id} onClick={() => convert(p)}>
                        {busy === p.id ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Convert to client
                      </Button>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
          {shown.length > 300 && <p className="mt-2 text-xs text-charcoal">Showing the first 300 — narrow it down with the search or filters.</p>}
        </section>
      </div>
    </div>
  );
}

const KIND_OPTIONS = ["Homestay / guest house", "Hotel", "Resort", "Event / banquet venue", "Restaurant", "Café", "Real-estate agent", "Furniture / interiors showroom", "Retail showroom", "Vehicle showroom", "Co-working space", "Hospital", "Clinic", "College", "School", "Gym / fitness", "Spa / salon", "Bar / pub", "Architect", "Other"];

/** Add one business by hand — for stays and shops your team finds on Google, Instagram or in person. */
function AddBusiness({ onAdd }: { onAdd: (b: Record<string, string>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [b, setB] = useState<Record<string, string>>({ category: KIND_OPTIONS[0] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setB((x) => ({ ...x, [k]: e.target.value }));
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 text-sm font-semibold text-blueprint hover:underline">
        + Add a business by hand
      </button>
    );
  return (
    <form
      className="mt-3 grid gap-2 rounded-[var(--radius-md)] border border-graphite/15 bg-paper-50 p-3 sm:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        try {
          await onAdd(b);
          setB({ category: KIND_OPTIONS[0] });
          setOpen(false);
        } catch (x) {
          setErr(x instanceof Error ? x.message.replace(/^Business not found: /, "") : "Could not add it.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Input required placeholder="Business name *" value={b.name ?? ""} onChange={set("name")} aria-label="Business name" />
      <Select value={b.category} onChange={set("category")} aria-label="Kind of business">
        {KIND_OPTIONS.map((k) => (
          <option key={k}>{k}</option>
        ))}
      </Select>
      <Input placeholder="Phone / WhatsApp" value={b.phone ?? ""} onChange={set("phone")} aria-label="Phone" />
      <Input placeholder="Area / address" value={b.address ?? ""} onChange={set("address")} aria-label="Address" />
      <Input placeholder="Website or Instagram" value={b.website ?? ""} onChange={set("website")} aria-label="Website" />
      <Input placeholder="Notes (where you found it)" value={b.notes ?? ""} onChange={set("notes")} aria-label="Notes" />
      {err && <p className="text-sm text-bad sm:col-span-3">{err}</p>}
      <div className="flex gap-2 sm:col-span-3">
        <Button size="sm" type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Add to the list
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
