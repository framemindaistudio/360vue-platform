import type { Metadata } from "next";
import { requireUser } from "@/lib/hq/auth";
import { SALES_SIDE } from "@/lib/hq/roles";
import { CampaignsApp } from "@/components/hq/sales/CampaignsApp";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  await requireUser(SALES_SIDE);
  return <CampaignsApp />;
}
