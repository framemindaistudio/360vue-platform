/**
 * Projects: the shared logic behind the project list, the project page, capture days and the dashboard.
 * Pure functions only.
 */
import { PROJECT_STAGES, SERVICE_OPTS, invoiceTotals, type BaseRecord } from "@/lib/hq/collections";
import { isoDate, uid } from "@/lib/utils";

export type Rec = BaseRecord;

export const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
export const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
export const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);

/* ─────────────────────────── dates ─────────────────────────── */

export const isIso = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v);
export function parseIso(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function addDays(iso: string, n: number) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
export function daysBetween(from: string, to: string) {
  return Math.round((parseIso(to).getTime() - parseIso(from).getTime()) / 86_400_000);
}
export const longDate = (iso: unknown) => (isIso(iso) ? parseIso(str(iso)).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—");
export const shortDate = (iso: unknown) => (isIso(iso) ? parseIso(str(iso)).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—");

/* ─────────────────────────── stages & services ─────────────────────────── */

export const STAGE_ORDER = PROJECT_STAGES.map((s) => s.value);
export const OPEN_STAGES = ["kickoff", "survey", "capture", "processing", "assembly", "qa", "review", "delivered"];
export const stageLabel = (v: unknown) => PROJECT_STAGES.find((s) => s.value === v)?.label ?? (v ? String(v) : "Kick-off");
export const serviceLabel = (v: unknown) => SERVICE_OPTS.find((s) => s.value === v)?.label ?? (v ? String(v) : "—");
export const isClosed = (p: Rec) => ["completed", "cancelled"].includes(str(p.stage));
export const isLive = (p: Rec) => OPEN_STAGES.includes(str(p.stage) || "kickoff");
export const servicesOf = (p: Rec) => {
  const all = list(p.services);
  const main = str(p.service);
  return main && !all.includes(main) ? [main, ...all] : all.length ? all : main ? [main] : [];
};

export const SERVICE_ICON: Record<string, string> = {
  tours: "Rotate3d",
  spatial: "Box",
  hosting: "Server",
  other: "Layers",
};

export type DueState = "none" | "done" | "overdue" | "today" | "soon" | "later";
export function dueState(p: Rec, today: string | null): DueState {
  if (isClosed(p) || ["support"].includes(str(p.stage))) return "done";
  const d = str(p.dueDate).slice(0, 10);
  if (!d || !today) return "none";
  if (d < today) return "overdue";
  if (d === today) return "today";
  return daysBetween(today, d) <= 7 ? "soon" : "later";
}

/* ─────────────────────────── checklist ─────────────────────────── */

export interface CheckItem {
  id: string;
  phase: string;
  label: string;
  done: boolean;
  doneBy?: string;
  doneOn?: string;
}

type Tpl = [phase: string, label: string][];

const KICKOFF: Tpl = [
  ["1 · Qualification", "Business, space, size, location, budget and deliverables noted"],
  ["2 · Proposal", "Written scope, quote, schedule and usage conditions sent"],
  ["2 · Proposal", "Quote accepted and advance received"],
  ["2 · Proposal", "Project ID, client folder and signed scope in place"],
];
const SITE: Tpl = [
  ["3 · Site preparation", "Access date and time confirmed with the contact on site"],
  ["3 · Site preparation", "Property owner's permission confirmed"],
  ["3 · Site preparation", "Restricted and private areas listed"],
  ["3 · Site preparation", "Lighting, readiness and capture positions agreed"],
];
const HANDOVER: Tpl = [
  ["8 · Delivery", "Balance collected"],
  ["8 · Delivery", "Links, embed code and files delivered"],
  ["8 · Delivery", "Client sign-off received"],
  ["8 · Delivery", "Review or referral requested"],
];

/** 360VUE's working checklist for each service: the eight steps of the delivery workflow, as real tasks. */
export const CHECKLISTS: Record<string, Tpl> = {
  tours: [
    ...KICKOFF,
    ...SITE,
    ["4 · Capture", "Batteries, cards, lens and tripod checked"],
    ["4 · Capture", "Every planned viewpoint captured (same height, consistent exposure, overlap)"],
    ["4 · Capture", "Captures backed up twice before leaving the site"],
    ["5 · Processing", "Panoramas stitched and inspected"],
    ["5 · Processing", "Exposure, horizon and colour corrected"],
    ["5 · Processing", "People and sensitive details removed or blurred"],
    ["6 · Tour assembly", "Viewpoints connected with navigation hotspots"],
    ["6 · Tour assembly", "Room labels, branding and information hotspots added"],
    ["6 · Tour assembly", "Delivery platform set up (link, embed, hosting period)"],
    ["7 · Quality check", "Navigation and links tested"],
    ["7 · Quality check", "Image clarity and loading checked"],
    ["7 · Quality check", "Mobile display checked"],
    ["7 · Quality check", "Google publishing requirements checked (if included)"],
    ...HANDOVER,
  ],
  spatial: [
    ...KICKOFF,
    ["3 · Site preparation", "Scoping visit done and platform chosen"],
    ...SITE.slice(1),
    ["4 · Capture", "Space captured as the scope sets out"],
    ["6 · Tour assembly", "Model, plan or showroom assembled"],
    ["6 · Tour assembly", "Products, rooms or zones tagged"],
    ["7 · Quality check", "Tested on desktop and mobile"],
    ...HANDOVER,
  ],
  hosting: [
    ["Plan", "Hosting period and renewal date recorded"],
    ["Plan", "Monthly or advance billing set up"],
    ["Care", "Link and embed checked each month"],
    ["Care", "Requested label or hotspot changes made"],
    ["Renewal", "Renewal reminder sent before the period ends"],
  ],
};

export function checklistFor(services: string[]): CheckItem[] {
  const seen = new Set<string>();
  const out: CheckItem[] = [];
  for (const s of services.length ? services : ["tours"]) {
    for (const [phase, label] of CHECKLISTS[s] ?? []) {
      const key = `${phase}|${label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: uid("chk"), phase, label, done: false });
    }
  }
  return out;
}

export function checklistOf(p: Rec): CheckItem[] {
  return Array.isArray(p.checklist) ? (p.checklist as CheckItem[]).filter((c) => c && typeof c.label === "string") : [];
}

export function progressOf(p: Rec) {
  const items = checklistOf(p);
  if (!items.length) return null;
  return items.filter((i) => i.done).length / items.length;
}

/* ─────────────────────────── what the client provides ─────────────────────────── */

export interface ClientInput {
  id: string;
  label: string;
  received: boolean;
  receivedOn?: string;
  note?: string;
}

export const CLIENT_INPUTS: Record<string, string[]> = {
  tours: ["Access on the capture date and a contact on site", "Property owner's permission (if the client does not own the space)", "List of restricted or private areas", "Logo for the branded starting screen", "Room and area names for the labels", "Website developer's contact for the embed", "Google Business Profile access (an invite, not a password), if publishing is included"],
  spatial: ["Floor plans or measurements, if available", "Product list for tagging", "Access for the scoping visit"],
  hosting: ["Billing contact", "Where the tour is embedded"],
};

export function inputsFor(services: string[]): ClientInput[] {
  const seen = new Set<string>();
  const out: ClientInput[] = [];
  for (const s of services) for (const label of CLIENT_INPUTS[s] ?? []) if (!seen.has(label)) {
    seen.add(label);
    out.push({ id: uid("in"), label, received: false });
  }
  return out;
}

export function inputsOf(p: Rec): ClientInput[] {
  return Array.isArray(p.inputs) ? (p.inputs as ClientInput[]).filter((c) => c && typeof c.label === "string") : [];
}

/* ─────────────────────────── milestones & money ─────────────────────────── */

export interface ProjectMilestone {
  id: string;
  label: string;
  percent: number;
  amount: number;
  status: "due" | "invoiced" | "paid";
  invoiceId?: string;
  dueDate?: string;
  paidOn?: string;
}

export function milestonesOf(p: Rec): ProjectMilestone[] {
  return Array.isArray(p.milestones) ? (p.milestones as ProjectMilestone[]).filter((m) => m && typeof m.label === "string").map((m) => ({ ...m, amount: num(m.amount), percent: num(m.percent), status: m.status ?? "due" })) : [];
}

/** Agreed, invoiced and received for a project (invoices are the record; the milestones say what is still to bill). */
export function projectMoney(p: Rec, invoices: Rec[]) {
  const mine = invoices.filter((i) => i.projectId === p.id && str(i.status) !== "cancelled");
  const invoiced = mine.reduce((s, i) => s + invoiceTotals(i).taxable, 0);
  const received = mine.reduce((s, i) => s + invoiceTotals(i).paid, 0);
  const agreed = num(p.agreedAmount);
  return { agreed, invoiced, received: Math.max(received, num(p.amountReceived)), toInvoice: Math.max(0, agreed - invoiced), invoices: mine };
}

/* ─────────────────────────── handover ─────────────────────────── */

export const HANDOVER_STEPS = [
  { id: "files", label: "Tour link, embed code and final exports delivered" },
  { id: "docs", label: "Permitted use and hosting period written down for the client" },
  { id: "access", label: "Tour placed on the website / Google, where included" },
  { id: "walkthrough", label: "Walkthrough of the tour done with the client" },
  { id: "payment", label: "Final payment received" },
  { id: "support", label: "Hosting end date and renewal explained" },
  { id: "feedback", label: "Feedback form sent" },
  { id: "testimonial", label: "Testimonial requested (with consent to publish)" },
  { id: "portfolio", label: "Permission to show the tour in the portfolio" },
] as const;

export type HandoverState = Partial<Record<(typeof HANDOVER_STEPS)[number]["id"], boolean>>;
export const handoverOf = (p: Rec): HandoverState => (p.handover && typeof p.handover === "object" ? (p.handover as HandoverState) : {});
