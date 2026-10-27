/**
 * What every 360VUE deck shares: the look, the service icons and prices read from the saved rate card
 * (HQ → Money → Rate Card), so a slide never carries a number typed into it.
 */
import { BUNDLE, SERVICES, SOCIAL_CONTRACTS, TERMS } from "@/lib/content/catalog";
import type { RateCard } from "@/lib/pricebook/types";
import { formatINR } from "@/lib/utils";
import type { DeckTheme, IconName } from "./types";

/** Midnight, bronze and sunset: the 360VUE palette. */
export const THEME: DeckTheme = { accent: "#9A5A31", tint: "#F6EBDD", level: 4, palette: ["#0E0B08", "#9A5A31", "#C9822F"] };

export const SERVICE_ICON: Record<string, IconName> = {
  tours: "RotateCw",
  spatial: "Box",
  hosting: "Globe",
};

/** The rate card the deck reads: the saved one, or the starting prices when it has not loaded. */
export function card(rates?: RateCard | null): RateCard {
  if (rates) return rates;
  return {
    gstPercent: TERMS.gstPercent,
    services: SERVICES,
    socialContracts: SOCIAL_CONTRACTS,
    bundleSteps: BUNDLE.steps,
    terms: { validityDays: TERMS.validityDays, revisionRounds: TERMS.revisionRounds, milestones: TERMS.defaultMilestones },
  };
}

/** The lowest price a service can be bought at: the cheapest option in every "choose one" group. */
export function startingPrice(serviceId: string, rates?: RateCard | null) {
  const s = card(rates).services.find((x) => x.id === serviceId);
  if (!s) return 0;
  return s.groups.filter((g) => g.mode === "one").reduce((sum, g) => sum + Math.min(...g.options.map((o) => o.price)), 0);
}

export const from = (n: number, monthly = false) => (n > 0 ? `from ${formatINR(n)}${monthly ? "/month" : ""}` : "quoted after the call");

/** "₹5,000–₹8,000" for a package with a range, else its single price. */
export const range = (price: number, upTo?: number) => (upTo && upTo > price ? `${formatINR(price)}–${formatINR(upTo)}` : formatINR(price));
