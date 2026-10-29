import "server-only";
import { revalidateTag } from "next/cache";
import { CAMPAIGN_TAG } from "@/lib/campaigns";
import type { BaseRecord } from "./collections";

/** Collections whose changes move a campaign's public slot counter (approved advances live on invoices). */
const CAMPAIGN_INPUTS = new Set(["campaigns", "invoices", "projects"]);

/**
 * Runs after HQ saves or deletes records: keeps the website's live campaign counter in step. Never throws — a save
 * that went through must not be reported as failed because of a follow-up.
 */
export async function afterSave(name: string, changes: { prev: BaseRecord | null; saved: BaseRecord | null }[], by: string) {
  void changes;
  void by;
  try {
    if (CAMPAIGN_INPUTS.has(name)) revalidateTag(CAMPAIGN_TAG, { expire: 0 });
  } catch (e) {
    console.error("[after-save]", e instanceof Error ? e.message : e);
  }
}
