import "server-only";
import { unstable_cache } from "next/cache";
import { readPriceBook } from "@/lib/hq/pricebook";
import { SERVICES, SOCIAL_CONTRACTS } from "@/lib/content/catalog";
import type { RateCard } from "@/lib/pricebook/types";

/** The cache tag HQ expires when the rate card is saved (/api/hq/pricebook). */
export const RATECARD_TAG = "ratecard";

export type PublicRates = Pick<RateCard, "services" | "socialContracts">;

/**
 * The prices the public website shows: the services and hosting plan lengths of HQ's rate card. Read from the private
 * data repository once and cached, so visitors never wait on the GitHub API; saving the rate card in HQ expires it at
 * once, and it refreshes by itself every 10 minutes. Costs, margins and the business plan are never part of it. When
 * no rate card is saved, or it cannot be read, the site shows the starting prices from the catalogue.
 */
export const publicRateCard = unstable_cache(
  async (): Promise<PublicRates> => {
    try {
      const { book, exists } = await readPriceBook();
      if (exists) return { services: book.rates.services, socialContracts: book.rates.socialContracts };
    } catch (e) {
      console.error("[website prices] could not read the rate card, showing the starting prices:", e instanceof Error ? e.message : e);
    }
    return { services: SERVICES, socialContracts: SOCIAL_CONTRACTS };
  },
  ["public-ratecard"],
  { tags: [RATECARD_TAG], revalidate: 600 },
);
