import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { CITIES } from "@/lib/locations";
import { liveCampaign } from "@/lib/campaign-server";

/** Every public page. HQ, papers sent to sign and the APIs are not for search engines. */
const PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/skyvue", priority: 0.9, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.8, changeFrequency: "monthly" },
  ...CITIES.map((c) => ({ path: `/locations/${c.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "weekly" },
  { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = PAGES.map((p) => ({ url: `${site.url}${p.path}`, changeFrequency: p.changeFrequency, priority: p.priority }));
  // the live launch offer (e.g. /offers/founding-100), while it runs
  const c = await liveCampaign();
  return c && !c.full ? [...pages, { url: `${site.url}/offers/${c.slug}`, changeFrequency: "daily", priority: 0.9 }] : pages;
}
