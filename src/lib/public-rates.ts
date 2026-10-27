import "server-only";
import { unstable_cache } from "next/cache";
import { readPriceBook, startingBook } from "@/lib/hq/pricebook";
import type { RateCard } from "@/lib/pricebook/types";

/** The cache tag HQ expires when the rate card is saved (/api/hq/pricebook). */
export const RATECARD_TAG = "ratecard";

export type PublicRates = Pick<RateCard, "services" | "socialContracts" | "bundleSteps" | "gstPercent"> & { validityDays: number };

const pick = (r: RateCard): PublicRates => ({
  services: r.services,
  socialContracts: r.socialContracts,
  bundleSteps: r.bundleSteps,
  gstPercent: r.gstPercent,
  validityDays: r.terms.validityDays,
});

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
      const { book, exists } = await readPriceBook();
      if (exists) return pick(book.rates);
    } catch (e) {
      console.error("[website prices] could not read the rate card, showing the starting prices:", e instanceof Error ? e.message : e);
    }
    return pick(startingBook().rates);
  },
  ["public-ratecard-v2"],
  { tags: [RATECARD_TAG], revalidate: 600 },
);
