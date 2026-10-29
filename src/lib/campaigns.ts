/**
 * Launch campaigns (e.g. "Founding 100 — 40% off"): a discount on chosen services for a limited number of slots.
 *
 * A slot is used when a campaign project's advance has been approved — a payment on one of its invoices ticked as
 * matched to the bank statement (reconciled) in HQ → Finance, and not refunded. Each project counts once, however
 * many invoices or payments it has. Slots used before HQ tracked them can be entered as "used before".
 *
 * Shared by HQ, the server and the website, so it holds no secrets and no I/O.
 */

export const CAMPAIGN_TAG = "campaign";

/** What a quote stores about the campaign it was priced under (a snapshot: later edits never reprice old quotes). */
export interface CampaignLite {
  id: string;
  name: string;
  percent: number;
  /** service ids the discount applies to, e.g. ["tours"] = the tour plan and its add-ons */
  serviceIds: string[];
}

export interface PublicCampaign extends CampaignLite {
  slug: string;
  headline: string;
  tagline: string;
  terms: string;
  total: number;
  used: number;
  left: number;
  full: boolean;
  endDate: string;
}

type Rec = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v === undefined || v === null ? "" : String(v)).trim();
const n = (v: unknown) => Number(v) || 0;

export const lite = (c: Rec): CampaignLite => ({
  id: c.id,
  name: s(c.name),
  percent: Math.min(100, Math.max(0, n(c.discountPercent))),
  serviceIds: Array.isArray(c.serviceIds) && c.serviceIds.length ? (c.serviceIds as unknown[]).map(String) : ["tours"],
});

/** Live today: status "live", started, not past its end date. (Full campaigns are still "running" — the site says so.) */
export function isRunning(c: Rec, today: string) {
  if (s(c.status) !== "live") return false;
  const start = s(c.startDate).slice(0, 10);
  const end = s(c.endDate).slice(0, 10);
  return (!start || start <= today) && (!end || end >= today);
}

/** The discount a campaign gives on an amount (to the paisa, as the poster shows ₹4,199.40). */
export const discountOf = (amount: number, percent: number) => Math.round(amount * percent) / 100;

export interface CountedSlot {
  key: string;
  projectId: string;
  invoiceId: string;
  title: string;
  approvedAt: string;
  approvedBy: string;
}

/**
 * The slots a campaign has used: projects (or stand-alone invoices) on the campaign with an approved advance —
 * a reconciled, not refunded payment. The earliest approval decides the order.
 */
export function slotsOf(c: Rec, invoices: Rec[], projects: Rec[]) {
  const projectOf = new Map(projects.map((p) => [p.id, p]));
  const counted = new Map<string, CountedSlot>();
  for (const inv of invoices) {
    if (s(inv.status) === "cancelled") continue;
    const project = s(inv.projectId) ? projectOf.get(s(inv.projectId)) : undefined;
    const onCampaign = s(inv.campaignId) === c.id || s(project?.campaignId) === c.id;
    if (!onCampaign) continue;
    const approved = (Array.isArray(inv.payments) ? (inv.payments as Record<string, unknown>[]) : [])
      .filter((p) => p.reconciled === true && p.refunded !== true)
      .sort((a, b) => s(a.reconciledAt).localeCompare(s(b.reconciledAt)))[0];
    if (!approved) continue;
    const key = project?.id || inv.id;
    const at = s(approved.reconciledAt);
    const prev = counted.get(key);
    if (!prev || at < prev.approvedAt) {
      counted.set(key, { key, projectId: project?.id || "", invoiceId: inv.id, title: s(project?.title) || s(inv.customerName) || s(inv.number), approvedAt: at, approvedBy: s(approved.reconciledBy) });
    }
  }
  const list = [...counted.values()].sort((a, b) => a.approvedAt.localeCompare(b.approvedAt));
  const total = Math.max(0, Math.round(n(c.totalSlots)));
  const used = Math.round(n(c.usedBefore)) + list.length;
  return { total, used, left: Math.max(0, total - used), full: total > 0 && used >= total, counted: list };
}

export function toPublic(c: Rec, invoices: Rec[], projects: Rec[]): PublicCampaign {
  const slots = slotsOf(c, invoices, projects);
  return {
    ...lite(c),
    slug: s(c.slug) || "offer",
    headline: s(c.headline),
    tagline: s(c.tagline),
    terms: s(c.terms),
    total: slots.total,
    used: slots.used,
    left: slots.left,
    full: slots.full,
    endDate: s(c.endDate).slice(0, 10),
  };
}
