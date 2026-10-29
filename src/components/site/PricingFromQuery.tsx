"use client";

import { useSearchParams } from "next/navigation";
import { PriceConfigurator } from "./PriceConfigurator";
import type { PublicRates } from "@/lib/public-rates";
import type { PublicCampaign } from "@/lib/campaigns";

/** Opens the calculator on what a link asked for: /pricing?need=sky (SkyVUE only) or ?need=both. */
export function PricingFromQuery({ rates, campaign = null }: { rates: PublicRates; campaign?: PublicCampaign | null }) {
  const need = useSearchParams().get("need");
  const mode = need === "sky" || need === "both" ? need : "tour";
  return <PriceConfigurator key={mode} rates={rates} initialMode={mode} campaign={campaign} />;
}
