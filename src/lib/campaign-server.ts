import "server-only";
import { unstable_cache } from "next/cache";
import { listRecords } from "@/lib/hq/records";
import { CAMPAIGN_TAG, isRunning, toPublic, type PublicCampaign } from "@/lib/campaigns";

/** Today's date in India (campaign start and end dates are Indian dates). */
const todayIST = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

type Rec = Record<string, unknown> & { id: string };

async function load() {
  const [campaigns, invoices, projects] = await Promise.all([listRecords<Rec>("campaigns"), listRecords<Rec>("invoices"), listRecords<Rec>("projects")]);
  return { campaigns, invoices, projects };
}

/**
 * The campaign the website shows: the newest live one marked "show on the website". Slots left are counted from
 * approved advances, so the counter moves by itself. Cached; HQ expires it whenever a campaign, invoice or project
 * is saved, and it refreshes every 5 minutes anyway. Never fails the page: no campaign is shown instead.
 */
export const liveCampaign = unstable_cache(
  async (): Promise<PublicCampaign | null> => {
    try {
      const { campaigns, invoices, projects } = await load();
      const today = todayIST();
      const live = campaigns
        .filter((c) => c.showOnWebsite !== false && isRunning(c, today))
        .sort((a, b) => String(b.startDate || b.createdAt || "").localeCompare(String(a.startDate || a.createdAt || "")))[0];
      return live ? toPublic(live, invoices, projects) : null;
    } catch (e) {
      console.error("[campaign] could not read the live campaign:", e instanceof Error ? e.message : e);
      return null;
    }
  },
  ["live-campaign-v1"],
  { tags: [CAMPAIGN_TAG], revalidate: 300 },
);

/** A campaign's public page by its web address (live or full; drafts and paused ones are not public). */
export const campaignBySlug = unstable_cache(
  async (slug: string): Promise<PublicCampaign | null> => {
    try {
      const { campaigns, invoices, projects } = await load();
      const today = todayIST();
      const c = campaigns.find((x) => String(x.slug || "").toLowerCase() === slug.toLowerCase() && x.showOnWebsite !== false && isRunning(x, today));
      return c ? toPublic(c, invoices, projects) : null;
    } catch {
      return null;
    }
  },
  ["campaign-by-slug-v1"],
  { tags: [CAMPAIGN_TAG], revalidate: 300 },
);
