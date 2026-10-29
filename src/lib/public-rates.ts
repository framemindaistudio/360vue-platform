import "server-only";
import { unstable_cache } from "next/cache";
import { readPriceBook, startingBook } from "@/lib/hq/pricebook";
import { readSettings } from "@/lib/hq/records";
import type { RateCard } from "@/lib/pricebook/types";

/** The cache tag HQ expires when the rate card is saved (/api/hq/pricebook). */
export const RATECARD_TAG = "ratecard";

export type PublicRates = Pick<RateCard, "services" | "socialContracts" | "bundleSteps" | "gstPercent"> & {
  validityDays: number;
  /** false while 360VUE is not GST-registered: gstPercent is then 0 and the site says "no GST" */
  gstOn: boolean;
};

const pick = (r: RateCard, gstOn: boolean): PublicRates => ({
  services: r.services,
  socialContracts: r.socialContracts,
  bundleSteps: r.bundleSteps,
  gstPercent: gstOn ? r.gstPercent : 0,
  validityDays: r.terms.validityDays,
  gstOn,
});

/** Settings → Tax & bank → "GST registered". If settings cannot be read, show no GST rather than a wrong + 18%. */
async function gstRegistered() {
  try {
    return !!(await readSettings()).settings.gstRegistered;
  } catch {
    return false;
  }
}

/**
 * The prices the public website shows and the price configurator uses: services, plan lengths, the multi-service
 * discount, GST and how long a quote holds. Read from the private data repository once and cached, so visitors never
 * wait on the GitHub API; saving the rate card in HQ expires it at once, and it refreshes by itself every 10 minutes.
 * Costs, margins and the business plan are never part of it. When no rate card is saved, or it cannot be read, the
 * site shows the starting prices from the catalogue.
 */
export const publicRateCard = unstable_cache(
  async (): Promise<PublicRates> => {
    try {
      const [{ book, exists }, gstOn] = await Promise.all([readPriceBook(), gstRegistered()]);
      if (exists) return pick(book.rates, gstOn);
    } catch (e) {
      console.error("[website prices] could not read the rate card, showing the starting prices:", e instanceof Error ? e.message : e);
    }
    return pick(startingBook().rates, await gstRegistered());
  },
  ["public-ratecard-v3"],
  { tags: [RATECARD_TAG], revalidate: 600 },
);
