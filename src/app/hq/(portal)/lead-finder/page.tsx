import type { Metadata } from "next";
import { requireUser } from "@/lib/hq/auth";
import { SALES_SIDE } from "@/lib/hq/roles";
import { LeadFinder } from "@/components/hq/sales/LeadFinder";

export const metadata: Metadata = { title: "Lead finder" };

export default async function LeadFinderPage() {
  await requireUser(SALES_SIDE);
  return <LeadFinder />;
}
