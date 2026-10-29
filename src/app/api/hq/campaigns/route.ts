import { NextResponse } from "next/server";
import { apiUser } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { listRecords } from "@/lib/hq/records";
import { SALES_SIDE } from "@/lib/hq/roles";
import { slotsOf } from "@/lib/campaigns";

type Rec = Record<string, unknown> & { id: string };

/**
 * GET → slot counts for every campaign: total, used, left and which projects used them (title, approval date, who
 * approved). Worked out here from invoices, so sales roles see the counts without receiving invoice amounts.
 */
export async function GET() {
  const { error } = await apiUser(SALES_SIDE);
  if (error) return error;
  try {
    const [campaigns, invoices, projects] = await Promise.all([listRecords<Rec>("campaigns"), listRecords<Rec>("invoices"), listRecords<Rec>("projects")]);
    const stats = Object.fromEntries(campaigns.map((c) => [c.id, slotsOf(c, invoices, projects)]));
    return NextResponse.json({ stats });
  } catch (e) {
    return apiError(e);
  }
}
