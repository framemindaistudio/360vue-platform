"use client";

import { useMemo, useState } from "react";
import { Check, Download, Loader2, Minus, Plus, Sparkles, X } from "lucide-react";
import { estimateScenes, SERVICES as CATALOG, SQFT_PER_SQM, type Service, type ServiceOption } from "@/lib/content/catalog";
import { choiceOf, priceService, type Selections } from "@/lib/pricebook/math";
import type { PublicRates } from "@/lib/public-rates";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { openQuoteDocument, type QuoteDoc } from "./quoteDocument";
import { discountOf, type PublicCampaign } from "@/lib/campaigns";
import { SKYVUE_LAUNCH } from "@/lib/content/catalog";

/** VUE-W-261027-K3QZ: the website quote number, also stored on the HQ enquiry. */
function newQuoteNo(d: Date) {
  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => "23456789ABCDEFGHJKMNPQRSTUVWXYZ"[b % 31]).join("");
  return `VUE-W-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${code}`;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;

const SPACE_TYPES = ["Restaurant / café", "Hotel / resort", "Banquet hall / venue", "Showroom / retail", "Real estate", "Gym / clinic / office", "Other"];

/** Starting rooms and area for each kind of space, so the first estimate is sensible before anyone types. */
const PRESETS: Record<string, { sqft: number; rooms: number; floors: number }> = {
  "Restaurant / café": { sqft: 1800, rooms: 5, floors: 1 },
  "Hotel / resort": { sqft: 8000, rooms: 16, floors: 2 },
  "Banquet hall / venue": { sqft: 5000, rooms: 6, floors: 1 },
  "Showroom / retail": { sqft: 2500, rooms: 4, floors: 1 },
  "Real estate": { sqft: 1500, rooms: 7, floors: 1 },
  "Gym / clinic / office": { sqft: 2000, rooms: 6, floors: 1 },
  Other: { sqft: 1500, rooms: 5, floors: 1 },
};

function Stepper({ value, onChange, min, max, label, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string; suffix?: string }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v) || min)));
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} className="grid size-9 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-sunset hover:text-sunset disabled:opacity-30" aria-label={`Fewer ${label}`}>
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => set(Number(e.target.value))}
        aria-label={label}
        className="h-9 w-16 rounded-xl border border-cream/15 bg-midnight/70 text-center font-display text-base font-semibold text-cream outline-none focus:border-sunset"
      />
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} className="grid size-9 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-sunset hover:text-sunset disabled:opacity-30" aria-label={`More ${label}`}>
        <Plus className="size-4" />
      </button>
      {suffix && <span className="ml-1 text-sm text-cream/50">{suffix}</span>}
    </div>
  );
}

function StepHead({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-grad font-display text-sm font-bold text-midnight">{n}</span>
      <div>
        <h2 className="font-display text-xl font-semibold text-cream sm:text-2xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-cream/55">{sub}</p>}
      </div>
    </div>
  );
}

const card = "rounded-3xl border border-cream/10 bg-night/80 p-5 sm:p-7";

const ONE_LINK = "One link: aerial and ground scenes joined with hotspots (no extra charge for linking)";

export function PriceConfigurator({ rates, initialMode = "tour", campaign = null }: { rates: PublicRates; initialMode?: "tour" | "sky" | "both"; campaign?: PublicCampaign | null }) {
  const tour = rates.services.find((s) => s.id === "tours") as Service | undefined;
  const spatial = rates.services.find((s) => s.id === "spatial") as Service | undefined;
  const hosting = rates.services.find((s) => s.id === "hosting") as Service | undefined;
  const sky = rates.services.find((s) => s.id === "aerial") as Service | undefined;
  const skyPlans = sky?.groups.find((g) => g.id === "package")?.options ?? [];
  const skyExtras = sky?.groups.find((g) => g.id !== "package" && g.mode === "any");
  const plans = useMemo(() => [...(tour?.groups.find((g) => g.id === "package")?.options ?? [])].sort((a, b) => (a.scenes ?? 0) - (b.scenes ?? 0)), [tour]);
  const addonGroups = (tour?.groups ?? []).filter((g) => g.id !== "package" && g.mode === "any");
  const extraScene = tour?.groups.flatMap((g) => g.options.map((o) => ({ g: g.id, o }))).find((x) => x.o.id === "extra-scene");
  const extraFloor = tour?.groups.flatMap((g) => g.options.map((o) => ({ g: g.id, o }))).find((x) => x.o.id === "extra-floor");

  /* ── the space ── */
  const [type, setType] = useState(SPACE_TYPES[0]);
  const [unit, setUnit] = useState<"sqft" | "sqm">("sqft");
  const [sqft, setSqft] = useState(PRESETS[SPACE_TYPES[0]].sqft);
  const [floors, setFloors] = useState(1);
  const [rooms, setRooms] = useState(PRESETS[SPACE_TYPES[0]].rooms);
  const [scenesOverride, setScenesOverride] = useState<number | null>(null);

  const estimated = estimateScenes({ sqft, floors, rooms });
  const scenes = scenesOverride ?? estimated;
  const recommended = plans.find((p) => (p.scenes ?? 0) >= scenes) ?? plans[plans.length - 1];
  const [planPick, setPlanPick] = useState<string | null>(null);
  const plan = plans.find((p) => p.id === planPick) ?? recommended;
  const extraScenes = Math.max(0, scenes - (plan?.scenes ?? 0));
  const extraFloors = Math.max(0, floors - 1);

  /* ── add-ons: option id → quantity (0 = off) ── */
  const [addons, setAddons] = useState<Record<string, number>>({ google: 1 });
  const setAddon = (id: string, qty: number) => setAddons((a) => ({ ...a, [id]: Math.max(0, qty) }));
  const defaultQty = (o: ServiceOption) => (o.unit === "/floor" ? floors : 1);

  /* ── what they need: a ground tour, SkyVUE aerial, or both ── */
  const [mode, setMode] = useState<"tour" | "sky" | "both">(initialMode);
  const withTour = mode !== "sky";
  const withSky = mode !== "tour" && !!sky;
  const [skyPick, setSkyPick] = useState<string>("sky-neighbourhood");
  const [skyAddons, setSkyAddons] = useState<Record<string, number>>({});

  /* ── 3D and hosting ── */
  const [spatialPick, setSpatialPick] = useState<string>("");
  const [hostPick, setHostPick] = useState<string>("");
  const [hostMonths, setHostMonths] = useState(12);

  /* ── price ── */
  const tourSelections: Selections = useMemo(() => {
    const sel: Selections = { package: plan ? [plan.id] : [] };
    const push = (g: string, v: string) => (sel[g] = [...(sel[g] ?? []), v]);
    if (extraScene && extraScenes > 0) push(extraScene.g, choiceOf(extraScene.o.id, extraScenes));
    if (extraFloor && extraFloors > 0) push(extraFloor.g, choiceOf(extraFloor.o.id, extraFloors));
    for (const g of addonGroups)
      for (const o of g.options) {
        if (o.id === "extra-scene" || o.id === "extra-floor") continue;
        if (o.id === "aerial" && withSky) continue;
        const q = addons[o.id] ?? 0;
        if (q > 0) push(g.id, choiceOf(o.id, o.unit ? q : 1));
      }
    return sel;
  }, [plan, extraScene, extraScenes, extraFloor, extraFloors, addonGroups, addons, withSky]);

  const skyPlan = skyPlans.find((o) => o.id === skyPick) ?? skyPlans[1] ?? skyPlans[0];
  const skySelections: Selections = {
    package: skyPlan ? [skyPlan.id] : [],
    ...(skyExtras ? { [skyExtras.id]: skyExtras.options.filter((o) => (skyAddons[o.id] ?? 0) > 0).map((o) => choiceOf(o.id, o.unit ? skyAddons[o.id] : 1)) } : {}),
  };

  const tourPrice = tour && withTour ? priceService(tour, tourSelections) : { items: [], subtotal: 0 };
  const skyPrice = sky && withSky ? priceService(sky, skySelections) : { items: [], subtotal: 0 };
  const spatialOpt = withTour ? spatial?.groups.find((g) => g.id === "package")?.options.find((o) => o.id === spatialPick) : undefined;
  const spatialPrice = spatialOpt ? spatialOpt.price : 0;
  const services = (withTour ? 1 : 0) + (withSky ? 1 : 0) + (spatialOpt ? 1 : 0);
  let bundlePct = 0;
  for (const s of [...rates.bundleSteps].sort((a, b) => a.services - b.services)) if (services >= s.services) bundlePct = s.discountPercent;
  const oneTime = tourPrice.subtotal + skyPrice.subtotal + spatialPrice;
  // a live campaign (e.g. Founding 100) takes its percent off the services it covers, before the multi-service discount
  const offer = campaign && !campaign.full && campaign.percent > 0 ? campaign : null;
  const eligible = offer ? (offer.serviceIds.includes("tours") ? tourPrice.subtotal : 0) + (offer.serviceIds.includes("aerial") ? skyPrice.subtotal : 0) + (offer.serviceIds.includes("spatial") ? spatialPrice : 0) : 0;
  const campaignOff = offer ? discountOf(eligible, offer.percent) : 0;
  const discount = Math.round(((oneTime - campaignOff) * bundlePct) / 100);
  const taxable = Math.round((oneTime - campaignOff - discount) * 100) / 100;
  const gst = Math.round((taxable * rates.gstPercent) / 100);
  const total = taxable + gst;

  const hostOpt = hosting?.groups.find((g) => g.id === "package")?.options.find((o) => o.id === hostPick);
  const contract = rates.socialContracts.find((c) => c.months === hostMonths) ?? rates.socialContracts[0];
  const hostMonthly = hostOpt ? Math.round(hostOpt.price * (1 - (contract?.discountPercent ?? 0) / 100)) : 0;

  const lines = [
    ...tourPrice.items.filter((i) => i.price > 0 || i.group === "Tour plan").map((i) => ({ label: i.group === "Tour plan" ? `${i.label} plan · up to ${plan?.scenes} scenes` : i.label, price: i.price })),
    ...skyPrice.items.map((i) => ({ label: i.group === "SkyVUE plan" ? `${i.label} · ${skyPlan?.scenes} aerial scene${skyPlan?.scenes === 1 ? "" : "s"}` : i.label, price: i.price })),
    ...(spatialOpt ? [{ label: `${spatialOpt.label} (from)`, price: spatialOpt.price }] : []),
  ];
  const included = tourPrice.items.filter((i) => i.price === 0 && i.group !== "Tour plan").map((i) => i.label);

  /* ── download ── */
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const areaLabel = unit === "sqft" ? `${sqft.toLocaleString("en-IN")} sq ft` : `${Math.round(sqft / SQFT_PER_SQM).toLocaleString("en-IN")} sq m (${sqft.toLocaleString("en-IN")} sq ft)`;
  const spaceLine = withTour
    ? `${type} · ${areaLabel} · ${floors} floor${floors === 1 ? "" : "s"} · ${rooms} room${rooms === 1 ? "" : "s"}/areas · ${scenes} scenes${withSky ? " + SkyVUE aerial" : ""}`
    : "SkyVUE aerial 360°";

  async function download(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[+\d][\d\s-]{7,15}$/.test(phone.trim())) return setError("Please enter a valid phone number.");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Please enter a valid email, or leave it empty.");
    const today = new Date();
    const quoteNo = newQuoteNo(today);
    const doc: QuoteDoc = {
      quoteNo,
      date: today,
      validityDays: rates.validityDays,
      name: name.trim(),
      business: business.trim(),
      phone: phone.trim(),
      email: email.trim(),
      space: spaceLine,
      lines,
      included: [...(withTour && withSky ? [ONE_LINK] : []), ...(withTour ? tour?.included ?? [] : []), ...(withSky ? (sky?.included ?? []).filter((x) => !withTour || !/^Contact panel|^With a ground tour/.test(x)) : []), ...included.filter((x) => !/google/i.test(x))],
      discount: discount ? { label: `Multi-service discount (${bundlePct}%)`, amount: discount } : null,
      campaignDiscount: campaignOff ? { label: `${offer!.name} — ${offer!.percent}% off (${offer!.left} of ${offer!.total} slots left)`, amount: campaignOff } : null,
      taxable,
      gstPercent: rates.gstPercent,
      gst,
      total,
      hosting: hostOpt ? `${hostOpt.label} at ${inr(hostMonthly)}/month${rates.gstOn ? " + GST" : ""} (${contract?.label} plan)` : "",
      stories: [...(withTour ? [tour] : []), ...(withSky ? [sky] : [])]
        .map((s) => (s ? CATALOG.find((c) => c.id === s.id) : undefined))
        .filter((s): s is NonNullable<typeof s> => !!s?.pitch)
        .map((s) => ({ name: s.name, ...s.pitch! })),
      optional: [
        ...(withTour ? addonGroups.filter((g) => g.id === "interactive").flatMap((g) => g.options).filter((o) => !(addons[o.id] ?? 0) && o.price > 0) : []),
        ...(withSky ? (skyExtras?.options ?? []).filter((o) => !(skyAddons[o.id] ?? 0)) : []),
      ].map((o) => ({ label: o.label, detail: o.detail, price: o.price, unit: o.unit })),
    };
    // open the window now, while the click still counts as the user's: a window opened after an await is blocked
    const win = window.open("", "_blank");
    setBusy(true);
    try {
      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "project",
          name: doc.name,
          phone: doc.phone,
          email: doc.email,
          organisation: doc.business,
          services: [...(withTour ? ["tours"] : []), ...(withSky ? ["aerial"] : []), ...(spatialOpt ? ["spatial"] : []), ...(hostOpt ? ["hosting"] : [])],
          spaceSize: withTour ? `${areaLabel}, ${floors} floor${floors === 1 ? "" : "s"}, ${rooms} rooms/areas, ${scenes} scenes` : "SkyVUE aerial only",
          estimate: taxable,
          quoteNo,
          ...(campaignOff ? { campaignId: offer!.id } : {}),
          config: {
            ...(withTour ? { tours: { selections: tourSelections } } : {}),
            ...(withSky ? { aerial: { selections: skySelections } } : {}),
            ...(spatialOpt ? { spatial: { selections: { package: [spatialOpt.id] } } } : {}),
            ...(hostOpt ? { hosting: { selections: { package: [hostOpt.id] }, months: hostMonths } } : {}),
          },
          message: [`Quote ${quoteNo} downloaded from the website.`, `Space: ${spaceLine}.`, ...lines.map((l) => `• ${l.label}: ${inr(l.price)}`), `Total: ${inr(taxable)}${rates.gstOn ? ` + GST = ${inr(total)}` : " (no GST)"}`, doc.hosting].filter(Boolean).join("\n"),
          page: "/pricing",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "We could not save your quote. Please try again.");
      openQuoteDocument(doc, win);
      track("generate_lead", { currency: "INR", value: taxable, lead_source: "price_calculator", need: mode, plan: withTour ? plan?.label : skyPlan?.label, scenes: withTour ? scenes : skyPlan?.scenes });
      setSent(true);
      setAsking(false);
    } catch (err) {
      win?.close();
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!tour || !plans.length) return <p className="text-cream/60">Pricing is being updated. Please use Get a Quote.</p>;

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_400px] lg:items-start lg:pb-0">
      <div className="space-y-6">
        {/* what they need */}
        {sky && (
          <section className={card}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand/70">What do you need?</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3" role="group" aria-label="What do you need">
              {[
                { id: "tour", t: "360° virtual tour", d: "Walk through the inside of your space" },
                { id: "sky", t: "SkyVUE aerial only", d: "Your location from above, with landmarks" },
                { id: "both", t: "Tour + SkyVUE, one link", d: "Sky and inside joined with hotspots" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id as typeof mode)}
                  className={cn("rounded-2xl border p-4 text-left transition-colors", mode === m.id ? "border-sunset bg-sunset/[0.08]" : "border-cream/12 hover:border-cream/35")}
                >
                  <span className="block font-display font-semibold text-cream">{m.t}</span>
                  <span className="mt-0.5 block text-xs text-cream/50">{m.d}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 1 · space */}
        {withTour && (
        <section className={card}>
          <StepHead n={1} title="Tell us about your space" sub="We estimate how many 360° scenes it needs. A scene is one viewpoint — usually one per room, more for large halls." />
          <div className="mt-6 flex flex-wrap gap-2">
            {SPACE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === type}
                onClick={() => {
                  setType(t);
                  const p = PRESETS[t];
                  setSqft(p.sqft);
                  setRooms(p.rooms);
                  setFloors(p.floors);
                  setScenesOverride(null);
                  setPlanPick(null);
                }}
                className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", t === type ? "border-sunset bg-sunset text-midnight" : "border-cream/20 text-cream/75 hover:border-cream/50")}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand/70">Floor area</p>
              <div className="flex rounded-full border border-cream/15 p-0.5 text-xs font-semibold" role="group" aria-label="Unit">
                {(["sqft", "sqm"] as const).map((u) => (
                  <button key={u} type="button" onClick={() => setUnit(u)} aria-pressed={unit === u} className={cn("rounded-full px-3 py-1.5", unit === u ? "bg-cream text-midnight" : "text-cream/65")}>
                    {u === "sqft" ? "sq ft" : "sq m"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="range"
                min={200}
                max={20000}
                step={100}
                value={Math.min(20000, sqft)}
                onChange={(e) => {
                  setSqft(Number(e.target.value));
                  setScenesOverride(null);
                  setPlanPick(null);
                }}
                aria-label="Floor area"
                className="w-full accent-[#f59e4c]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={unit === "sqft" ? sqft : Math.round(sqft / SQFT_PER_SQM)}
                  onChange={(e) => {
                    const v = Math.max(0, Number(e.target.value) || 0);
                    setSqft(Math.min(500000, Math.round(unit === "sqft" ? v : v * SQFT_PER_SQM)));
                    setScenesOverride(null);
                    setPlanPick(null);
                  }}
                  aria-label={`Floor area in ${unit === "sqft" ? "square feet" : "square metres"}`}
                  className="h-10 w-28 rounded-xl border border-cream/15 bg-midnight/70 px-3 text-right font-display font-semibold text-cream outline-none focus:border-sunset"
                />
                <span className="w-10 text-sm text-cream/50">{unit === "sqft" ? "sq ft" : "sq m"}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-cream/40">{unit === "sqft" ? `≈ ${Math.round(sqft / SQFT_PER_SQM).toLocaleString("en-IN")} sq m` : `≈ ${sqft.toLocaleString("en-IN")} sq ft`} · the total of all floors you want captured</p>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand/70">Floors</p>
              <Stepper label="floors" value={floors} min={1} max={20} onChange={(v) => { setFloors(v); setScenesOverride(null); setPlanPick(null); }} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand/70">Rooms & areas</p>
              <Stepper label="rooms and areas" value={rooms} min={1} max={150} onChange={(v) => { setRooms(v); setScenesOverride(null); setPlanPick(null); }} />
              <p className="mt-1.5 text-xs text-cream/40">Entrance, halls, rooms, kitchen, terrace — every area worth showing</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-sunset/30 bg-sunset/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-cream">
                <Sparkles className="size-4 text-sunset" aria-hidden /> We estimate <span className="font-display text-2xl text-gold-grad">{estimated}</span> scenes
              </p>
              <p className="mt-1 text-xs text-cream/50">From the area, rooms and floors. Change it if you know better — we confirm it before capture.</p>
            </div>
            <Stepper label="scenes" value={scenes} min={1} max={400} onChange={(v) => { setScenesOverride(v); setPlanPick(null); }} suffix="scenes" />
          </div>
        </section>

        )}

        {/* 2 · plan */}
        {withTour && (
        <section className={card}>
          <StepHead n={2} title="Choose your plan" sub="We picked the plan that covers your scenes. Scenes beyond a plan are added at the per-scene rate." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {plans.map((p) => {
              const on = p.id === plan?.id;
              const fits = (p.scenes ?? 0) >= scenes;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanPick(p.id)}
                  aria-pressed={on}
                  className={cn("relative rounded-2xl border p-5 text-left transition-all", on ? "border-sunset bg-gradient-to-b from-bronze/30 to-night shadow-[0_20px_60px_-30px_rgba(245,158,76,0.6)]" : "border-cream/12 hover:border-cream/35")}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display text-lg font-semibold text-cream">{p.label}</span>
                    {p.id === recommended?.id ? (
                      <span className="rounded-full bg-gold-grad px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight">Recommended</span>
                    ) : p.badge ? (
                      <span className="rounded-full border border-cream/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/60">{p.badge}</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block font-display text-2xl font-bold text-cream">{inr(p.price)}</span>
                  <span className="mt-1 block text-sm text-cream/55">{p.detail}</span>
                  {!fits && on && extraScene && <span className="mt-2 block text-xs text-sunset">+ {extraScenes} extra scene{extraScenes === 1 ? "" : "s"} at {inr(extraScene.o.price)} each</span>}
                  {on && <Check className="absolute bottom-4 right-4 size-5 text-sunset" aria-hidden />}
                </button>
              );
            })}
          </div>
          {extraFloors > 0 && extraFloor && (
            <p className="mt-4 text-sm text-cream/60">
              {extraFloors} additional floor{extraFloors === 1 ? "" : "s"} at {inr(extraFloor.o.price)} each — level switcher and stair connections.
            </p>
          )}
          <ul className="mt-6 grid gap-2 text-sm text-cream/70 sm:grid-cols-2">
            {tour.included.map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {x}
              </li>
            ))}
          </ul>
        </section>

        )}

        {/* 3 · add-ons */}
        {withTour && (
        <section className={card}>
          <StepHead n={3} title="Add more to your tour" sub="Every tour already has a contact panel (your logo, phone, email and a Call button). Tick extras like WhatsApp buttons, info points or videos; set how many where it says per pack, floor or scene." />
          <div className="mt-6 space-y-7">
            {addonGroups.map((g) => {
              const opts = g.options.filter((o) => o.id !== "extra-scene" && o.id !== "extra-floor" && !(o.id === "aerial" && withSky));
              if (!opts.length) return null;
              return (
                <div key={g.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand/70">{g.title}</p>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {opts.map((o) => {
                      const q = addons[o.id] ?? 0;
                      const on = q > 0 || o.price === 0;
                      const locked = o.price === 0;
                      return (
                        <div key={o.id} className={cn("rounded-2xl border p-4 transition-colors", on ? "border-sunset/60 bg-sunset/[0.06]" : "border-cream/12")}>
                          <label className={cn("flex items-start gap-3", !locked && "cursor-pointer")}>
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={locked}
                              onChange={(e) => setAddon(o.id, e.target.checked ? defaultQty(o) : 0)}
                              className="mt-1 size-4 accent-[#f59e4c]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-cream">{o.label}</span>
                              {o.detail && <span className="mt-0.5 block text-xs leading-snug text-cream/50">{o.detail}</span>}
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-cream/80">{o.price ? `${inr(o.price)}${o.unit ?? ""}` : "Included"}</span>
                          </label>
                          {o.unit && q > 0 && (
                            <div className="mt-3 flex justify-end">
                              <Stepper label={o.label} value={q} min={1} max={99} onChange={(v) => setAddon(o.id, v)} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {g.note && <p className="mt-2 text-xs text-cream/40">{g.note}</p>}
                </div>
              );
            })}
          </div>
        </section>

        )}

        {/* SkyVUE */}
        {withSky && sky && (
          <section className={card}>
            <StepHead n={withTour ? 4 : 1} title={`SkyVUE aerial 360° — from ${SKYVUE_LAUNCH}`} sub="Pre-book now: flights start in January 2027. Your property from up to 120 m. Nearby places are labelled with distances, and your buildings and amenities are labelled too — with a ground tour, tapping one opens its 360°." />
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {skyPlans.map((p) => {
                const on = p.id === skyPlan?.id;
                const [what, fit] = (p.detail ?? "").split(" · ");
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSkyPick(p.id)}
                    className={cn("relative rounded-2xl border p-5 text-left transition-all", on ? "border-sunset bg-gradient-to-b from-bronze/30 to-night" : "border-cream/12 hover:border-cream/35")}
                  >
                    {p.badge && <span className="mb-2 inline-block rounded-full bg-gold-grad px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight">{p.badge}</span>}
                    <span className="block font-display text-lg font-semibold text-cream">{p.label.replace("SkyVUE ", "")}</span>
                    <span className="mt-1 block font-display text-2xl font-bold text-cream">{inr(p.price)}</span>
                    <span className="mt-1 block text-sm text-cream/60">{what}</span>
                    {fit && <span className="mt-1 block text-xs text-cream/40">{fit}</span>}
                    {on && <Check className="absolute right-4 top-4 size-5 text-sunset" aria-hidden />}
                  </button>
                );
              })}
            </div>
            {skyExtras && (
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {skyExtras.options.map((o) => {
                  const q = skyAddons[o.id] ?? 0;
                  return (
                    <div key={o.id} className={cn("rounded-2xl border p-4 transition-colors", q > 0 ? "border-sunset/60 bg-sunset/[0.06]" : "border-cream/12")}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" checked={q > 0} onChange={(e) => setSkyAddons((a) => ({ ...a, [o.id]: e.target.checked ? 1 : 0 }))} className="mt-1 size-4 accent-[#f59e4c]" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-cream">{o.label}</span>
                          {o.detail && <span className="mt-0.5 block text-xs leading-snug text-cream/50">{o.detail}</span>}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-cream/80">{`${inr(o.price)}${o.unit ?? ""}`}</span>
                      </label>
                      {o.unit && q > 0 && (
                        <div className="mt-3 flex justify-end">
                          <Stepper label={o.label} value={q} min={1} max={24} onChange={(v) => setSkyAddons((a) => ({ ...a, [o.id]: v }))} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <ul className="mt-6 grid gap-2 text-sm text-cream/70 sm:grid-cols-2">
              {sky.included.map((x) => (
                <li key={x} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {x}
                </li>
              ))}
            </ul>
            {withTour && (
              <p className="mt-6 flex gap-3 rounded-2xl border border-sunset/40 bg-sunset/[0.07] px-4 py-3.5 text-sm leading-relaxed text-cream/80">
                <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden />
                <span>
                  <strong className="text-cream">One link, sky to inside.</strong> Your aerial scenes and your ground tour are joined in a single link: tap a hotspot on the aerial view to step into the lobby, café or flat, and tap &ldquo;Back to the sky&rdquo; to fly up again. No extra charge for linking.
                </span>
              </p>
            )}
            {skyExtras?.note && <p className="mt-4 text-xs leading-relaxed text-cream/40">{skyExtras.note}</p>}
          </section>
        )}

        {/* 4 · 3D (needs a ground tour) */}
        {spatial && withTour && (
          <section className={card}>
            <StepHead n={(withTour ? 4 : 2) + (withTour && withSky ? 1 : 0)} title="Add a 3D experience" sub="Optional. Starting prices — we confirm them after a short scoping visit." />
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[{ id: "", label: "No, thanks", detail: "Just the 360° tour", price: 0 } as ServiceOption, ...(spatial.groups.find((g) => g.id === "package")?.options ?? [])].map((o) => (
                <button
                  key={o.id || "none"}
                  type="button"
                  aria-pressed={spatialPick === o.id}
                  onClick={() => setSpatialPick(o.id)}
                  className={cn("rounded-2xl border p-4 text-left transition-colors", spatialPick === o.id ? "border-sunset bg-sunset/[0.06]" : "border-cream/12 hover:border-cream/35")}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-cream">{o.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-cream/80">{o.price ? `from ${inr(o.price)}` : ""}</span>
                  </span>
                  {o.detail && <span className="mt-0.5 block text-xs text-cream/50">{o.detail}</span>}
                </button>
              ))}
            </div>
            {spatialOpt && bundlePct > 0 && <p className="mt-3 text-sm text-sunset">Multi-service discount applied: {bundlePct}% off the one-time work.</p>}
          </section>
        )}

        {/* 5 · hosting */}
        {hosting && (
          <section className={card}>
            <StepHead n={withTour ? 4 + (withSky ? 1 : 0) + (spatial ? 1 : 0) : 2} title="After your first free year" sub="Every tour includes 12 months of hosting. Your Google Maps listing stays live either way. Decide later if you like." />
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[{ id: "", label: "Decide later", detail: "We'll remind you before the year ends", price: 0 } as ServiceOption, ...(hosting.groups.find((g) => g.id === "package")?.options ?? [])].map((o) => (
                <button
                  key={o.id || "later"}
                  type="button"
                  aria-pressed={hostPick === o.id}
                  onClick={() => setHostPick(o.id)}
                  className={cn("rounded-2xl border p-4 text-left transition-colors", hostPick === o.id ? "border-sunset bg-sunset/[0.06]" : "border-cream/12 hover:border-cream/35")}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-cream">{o.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-cream/80">{o.price ? `${inr(o.price)}/mo` : ""}</span>
                  </span>
                  {o.detail && <span className="mt-0.5 block text-xs text-cream/50">{o.detail}</span>}
                </button>
              ))}
            </div>
            {hostOpt && (
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Plan length">
                {rates.socialContracts.map((c) => (
                  <button key={c.months} type="button" onClick={() => setHostMonths(c.months)} aria-pressed={hostMonths === c.months} className={cn("rounded-full border px-4 py-2 text-sm", hostMonths === c.months ? "border-sunset bg-sunset text-midnight" : "border-cream/20 text-cream/75")}>
                    {c.label}
                    {c.discountPercent ? ` · ${c.discountPercent}% off` : ""}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl border border-sunset/30 bg-gradient-to-b from-bronze/25 via-night to-night shadow-[0_40px_120px_-50px_rgba(245,158,76,0.6)]">
          <div className="border-b border-cream/10 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sunset">Your estimate</p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight text-cream">{inr(taxable)}</p>
            <p className="text-sm text-cream/55">{rates.gstOn ? `+ ${rates.gstPercent}% GST = ${inr(total)}` : "No GST — 360VUE is not GST-registered yet"}</p>
            <p className="mt-3 text-xs leading-relaxed text-cream/45">{spaceLine}</p>
          </div>
          <ul className="divide-y divide-cream/10 px-6 text-sm">
            {lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-4 py-2.5">
                <span className="text-cream/75">{l.label}</span>
                <span className="tabular shrink-0 font-semibold text-cream">{inr(l.price)}</span>
              </li>
            ))}
            {campaignOff > 0 && (
              <li className="flex justify-between gap-4 py-2.5 text-sunset">
                <span>
                  {offer!.name} — {offer!.percent}% off
                  <span className="block text-xs text-cream/45">
                    {offer!.left} of {offer!.total} slots left
                  </span>
                </span>
                <span className="tabular shrink-0 font-semibold">− {inr(campaignOff)}</span>
              </li>
            )}
            {discount > 0 && (
              <li className="flex justify-between gap-4 py-2.5 text-sunset">
                <span>Multi-service discount ({bundlePct}%)</span>
                <span className="tabular shrink-0 font-semibold">− {inr(discount)}</span>
              </li>
            )}
            {withTour && withSky && (
              <li className="flex justify-between gap-4 py-2.5 text-cream/50">
                <span>One link: aerial + ground joined with hotspots</span>
                <span className="shrink-0">Included</span>
              </li>
            )}
            <li className="flex justify-between gap-4 py-2.5 text-cream/50">
              <span>Google Maps publishing · 12 months hosting</span>
              <span className="shrink-0">Included</span>
            </li>
            {hostOpt && (
              <li className="flex justify-between gap-4 py-2.5 text-cream/60">
                <span>{hostOpt.label} from month 13</span>
                <span className="tabular shrink-0">{inr(hostMonthly)}/mo</span>
              </li>
            )}
          </ul>
          <div className="space-y-3 p-6">
            <p className="text-xs text-cream/45">50% to book your capture date, 50% before handover. Final price confirmed after we see the space.</p>
            {sent ? (
              <p className="rounded-2xl border border-sunset/30 bg-sunset/10 p-4 text-sm text-cream">Your quote opened in a new tab — save it as PDF. We have it too and will call you shortly.</p>
            ) : null}
            <button type="button" onClick={() => setAsking(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad py-3.5 text-sm font-semibold text-midnight shadow-[0_12px_40px_-10px_rgba(245,158,76,0.7)]">
              <Download className="size-4" aria-hidden /> Download quote (PDF)
            </button>
            <p className="text-center text-[11px] text-cream/40">Photography, video or a website? Our parent company, FrameMind AI Studio, quotes those.</p>
          </div>
        </div>
      </aside>

      {/* on phones the estimate panel is far below: keep the price and the button in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-midnight/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-bold leading-tight text-cream">{inr(taxable)}</p>
            <p className="truncate text-[11px] text-cream/50">
              {rates.gstOn ? "+ GST" : "No GST"} · {withTour ? `${plan?.label} · ${scenes} scenes` : skyPlan?.label}
            </p>
          </div>
          <button type="button" onClick={() => setAsking(true)} className="flex shrink-0 items-center gap-2 rounded-full bg-gold-grad px-5 py-3 text-sm font-semibold text-midnight">
            <Download className="size-4" aria-hidden /> Get PDF quote
          </button>
        </div>
      </div>

      {/* name and phone before the download */}
      {asking && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-midnight/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Your details for the quote">
          <form onSubmit={download} className="relative w-full max-w-md rounded-3xl border border-cream/15 bg-night p-6 sm:p-8" noValidate>
            <button type="button" onClick={() => setAsking(false)} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-cream/60 hover:text-cream" aria-label="Close">
              <X className="size-5" />
            </button>
            <h2 className="font-display text-2xl font-semibold text-cream">Who is this quote for?</h2>
            <p className="mt-1 text-sm text-cream/55">Your name goes on the PDF. We&apos;ll call to confirm the details.</p>
            <div className="mt-6 space-y-4">
              {[
                { l: "Your name *", v: name, s: setName, t: "text", a: "name" },
                { l: "Phone / WhatsApp *", v: phone, s: setPhone, t: "tel", a: "tel", p: "+91" },
                { l: "Business name", v: business, s: setBusiness, t: "text", a: "organization" },
                { l: "Email", v: email, s: setEmail, t: "email", a: "email" },
              ].map((f) => (
                <label key={f.l} className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/70">{f.l}</span>
                  <input type={f.t} value={f.v} autoComplete={f.a} placeholder={f.p} onChange={(e) => f.s(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-cream/15 bg-midnight/70 px-4 text-cream outline-none focus:border-sunset" />
                </label>
              ))}
            </div>
            {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad py-3.5 text-sm font-semibold text-midnight disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Get my quote
            </button>
            <p className="mt-3 text-center text-[11px] text-cream/40">We use these details only to reply about your quote.</p>
          </form>
        </div>
      )}
    </div>
  );
}
