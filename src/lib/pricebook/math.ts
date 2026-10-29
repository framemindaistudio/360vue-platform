/**
 * The arithmetic of the rate card and of quotes. Pure functions: used by the server when it saves, by the Rate Card
 * screen while the founders type, and by the quote builder, the quote print and the project screens.
 */
import type { Service, ServiceId } from "@/lib/content/catalog";
import type { BundleStep, SocialContract } from "./types";

/* ───────────────────────────── one service, configured ───────────────────────────── */

/**
 * groupId → the option ids chosen in it. An option sold by the unit (it has a `unit`, such as "/scene") is stored
 * with its quantity as "id*qty" (for example "extra-scene*5"); a bare id means a quantity of 1.
 */
export type Selections = Record<string, string[]>;

/** "extra-scene*5" → { id: "extra-scene", qty: 5 } */
export function parseChoice(entry: string): { id: string; qty: number } {
  const i = entry.lastIndexOf("*");
  if (i < 0) return { id: entry, qty: 1 };
  const qty = Math.round(Number(entry.slice(i + 1)));
  return { id: entry.slice(0, i), qty: Number.isFinite(qty) && qty > 0 ? Math.min(qty, 999) : 1 };
}
/** { id, qty } → the stored form */
export const choiceOf = (id: string, qty = 1) => (qty > 1 ? `${id}*${Math.round(qty)}` : id);
/** The chosen option ids of a group, without quantities. */
export const chosenIds = (sel: Selections, groupId: string) => (sel[groupId] ?? []).map((e) => parseChoice(e).id);
/** The quantity chosen for an option (0 when it is not chosen). */
export function qtyOf(sel: Selections, groupId: string, optionId: string) {
  const hit = (sel[groupId] ?? []).map(parseChoice).find((c) => c.id === optionId);
  return hit ? hit.qty : 0;
}

export interface PricedItem {
  group: string;
  label: string;
  price: number;
}

/** A ready package is chosen: the service's "package" group holds an option with a price (not "Build my own"). */
export function packageChosen(service: Service, selections: Selections) {
  const g = service.groups.find((x) => x.id === "package");
  const id = g ? chosenIds(selections, g.id)[0] : undefined;
  return !!g?.options.find((o) => o.id === id && o.price > 0);
}

/** The groups to show and charge: with a ready package chosen, the core groups it covers drop out. */
export function activeGroups(service: Service, selections: Selections) {
  return packageChosen(service, selections) ? service.groups.filter((g) => !g.core) : service.groups;
}

/** What a configured service costs: one row per chosen option (included options show at ₹0). */
export function priceService(service: Service, selections: Selections): { items: PricedItem[]; subtotal: number } {
  const items: PricedItem[] = [];
  for (const g of activeGroups(service, selections)) {
    const chosen = (selections[g.id] ?? []).map(parseChoice);
    const picked = g.options.filter((o) => chosen.some((c) => c.id === o.id));
    for (const o of g.mode === "one" ? picked.slice(0, 1) : picked) {
      const qty = o.unit ? (chosen.find((c) => c.id === o.id)?.qty ?? 1) : 1;
      items.push({ group: g.title, label: qty > 1 ? `${o.label} × ${qty}` : o.label, price: o.price * qty });
    }
  }
  return { items, subtotal: items.reduce((s, i) => s + i.price, 0) };
}

/** A sensible starting configuration: in every "choose one" group, the option marked popular / most common, else the first. */
export function defaultSelections(service: Service): Selections {
  const out: Selections = {};
  for (const g of service.groups) {
    if (g.mode !== "one") continue;
    const pick = g.options.find((o) => /popular|most common/i.test(o.badge ?? "")) ?? g.options[0];
    if (pick) out[g.id] = [pick.id];
  }
  return out;
}

export function contractFor(months: number, contracts: SocialContract[]) {
  return contracts.find((c) => c.months === months) ?? contracts[0] ?? { months: 1, label: "Month-to-month", discountPercent: 0 };
}

/** The bundle discount for buying `n` different services, in percent. */
export function bundlePercent(n: number, steps: BundleStep[]) {
  let pct = 0;
  for (const s of [...steps].sort((a, b) => a.services - b.services)) if (n >= s.services) pct = s.discountPercent;
  return pct;
}

/* ───────────────────────────── a quote ───────────────────────────── */

/**
 * One block of a quote. Its prices are COPIED in when the line is made (`items`, `amount`), so a quote never changes
 * when the rate card does. `selections` keeps what was chosen, so the line can be re-priced on purpose.
 */
export type QuoteLine =
  | { kind: "service"; key: string; serviceId: ServiceId; title: string; selections: Selections; items: PricedItem[]; amount: number; billing: "project" | "month"; months?: number; contractDiscountPercent?: number; note?: string }
  | { kind: "custom"; key: string; title: string; items: PricedItem[]; amount: number; billing: "project" | "month"; note?: string };

export interface QuoteMoney {
  /** one-time work before any discount */
  oneTime: number;
  /** monthly plans before any discount (hosting & care) */
  monthly: number;
  /** months the retainers run for (the longest contract on the quote) */
  months: number;
  /** distinct studio services on the quote (custom lines do not count) */
  serviceCount: number;
  /** a launch campaign (e.g. Founding 100) on the services it covers, before the bundle discount */
  campaignName: string;
  campaignPercent: number;
  campaignAmount: number;
  bundlePercent: number;
  bundleAmount: number;
  extraPercent: number;
  extraAmount: number;
  /** what 360VUE charges before GST: one-time + monthly × months, less discounts */
  taxable: number;
  gstPercent: number;
  gst: number;
  total: number;
  /** the monthly retainer after the contract and bundle discounts */
  monthlyNet: number;
}

/** Monthly lines are worked out per month (after their contract discount); everything else is one-time. */
export function quoteMoney(
  lines: QuoteLine[],
  o: { applyBundle: boolean; bundleSteps: BundleStep[]; extraPercent: number; gstPercent: number; campaign?: { name: string; percent: number; serviceIds: string[] } | null },
): QuoteMoney {
  let oneTime = 0;
  let monthly = 0;
  let months = 0;
  const services = new Set<string>();
  for (const l of lines) {
    if (l.kind === "service") services.add(l.serviceId);
    const isMonthly = (l.kind === "service" || l.kind === "custom") && l.billing === "month";
    if (isMonthly) {
      const m = l.kind === "service" ? Math.max(1, l.months ?? 1) : 1;
      monthly += l.amount;
      months = Math.max(months, m);
    } else oneTime += l.amount;
  }
  if (monthly > 0 && months === 0) months = 1;
  const gross = oneTime + monthly * months;
  // a campaign discounts the one-time lines of the services it covers (monthly hosting is never discounted)
  const cPct = o.campaign ? Math.min(100, Math.max(0, o.campaign.percent || 0)) : 0;
  const eligible = cPct
    ? lines.reduce((sum, l) => sum + (l.kind === "service" && l.billing !== "month" && o.campaign!.serviceIds.includes(l.serviceId) ? l.amount : 0), 0)
    : 0;
  const campaignAmount = Math.round(eligible * cPct) / 100;
  const bPct = o.applyBundle ? bundlePercent(services.size, o.bundleSteps) : 0;
  // the bundle discount is on one-time work only: monthly retainers already carry their contract-length discount
  const bundleAmount = Math.round(((oneTime - campaignAmount) * bPct) / 100);
  const extraPercent = Math.min(100, Math.max(0, o.extraPercent || 0));
  const extraAmount = Math.round(((gross - campaignAmount - bundleAmount) * extraPercent) / 100);
  const taxable = Math.max(0, Math.round((gross - campaignAmount - bundleAmount - extraAmount) * 100) / 100);
  const gst = Math.round((taxable * o.gstPercent) / 100);
  const keep = 1 - extraPercent / 100;
  return {
    oneTime,
    monthly,
    months,
    serviceCount: services.size,
    campaignName: cPct ? o.campaign!.name : "",
    campaignPercent: cPct,
    campaignAmount,
    bundlePercent: bPct,
    bundleAmount,
    extraPercent,
    extraAmount,
    taxable,
    gstPercent: o.gstPercent,
    gst,
    total: taxable + gst,
    monthlyNet: Math.round(monthly * keep),
  };
}

/** Price a monthly line (hosting & care): the monthly fee from the options, less the contract-length discount. */
export function socialMonthly(subtotal: number, months: number, contracts: SocialContract[]) {
  const c = contractFor(months, contracts);
  return { contract: c, monthly: Math.round(subtotal * (1 - c.discountPercent / 100)) };
}

/** Split an amount by milestone percentages; the last milestone takes the rounding so the parts add up exactly. */
export function splitMilestones(total: number, percents: number[]) {
  const parts = percents.map((p) => Math.round((total * p) / 100));
  const diff = total - parts.reduce((s, x) => s + x, 0);
  if (parts.length) parts[parts.length - 1] += diff;
  return parts;
}

/** A short, stable fingerprint of a value (FNV-1a over its JSON). Not a secret: it only tells two versions apart. */
export function fingerprint(value: unknown) {
  const text = JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
