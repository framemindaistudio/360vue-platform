import "server-only";
import { getRecord, listRecords, readSettings, upsertRecord } from "@/lib/hq/records";
import { invoiceTotalsWithPayments, PROJECT_STAGES, type BaseRecord } from "@/lib/hq/collections";
import { esc, isEmail, mailReady, sendMail } from "@/lib/hq/mail";
import { SERVICES } from "@/lib/content/catalog";
import { site } from "@/lib/site";
import { PortalError, readPortalAccounts, type PortalUser } from "./auth";

/*
 * The client portal's records and rules. A client reads only what is theirs and meant for them: their projects'
 * stage, capture day, preview and final tour links, published updates and approval requests, their invoices and
 * payments, hosting dates and their own support tickets — never internal notes, costs, team pay or other clients.
 */

type Rec = BaseRecord;
const s = (v: unknown) => (v === undefined || v === null ? "" : String(v)).trim();
const n = (v: unknown) => Number(v) || 0;
const now = () => new Date().toISOString();
const today = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

export { PortalError };
export const PORTAL_URL = () => `${site.website}/portal`;

/** The stages a client sees, in order (on hold / cancelled are shown as a notice instead). */
const CLIENT_STAGES = PROJECT_STAGES.filter((o) => !["on-hold", "cancelled"].includes(o.value)).map((o) => [o.value, o.label] as [string, string]);
const DELIVERED = new Set(["delivered", "support", "completed"]);
export const TICKET_KINDS: Record<string, string> = {
  support: "Support request",
  revision: "Revision / correction",
  "broken-link": "Tour link not working",
  billing: "Billing question",
  renewal: "Hosting renewal",
};

const history = (r: Rec | null | undefined) => (Array.isArray(r?.history) ? (r!.history as unknown[]) : []);
const event = (by: string, action: string, note?: string) => ({ at: now(), by, action, ...(note ? { note } : {}) });

export function hostingOf(p: Rec) {
  const until = s(p.supportUntil).slice(0, 10);
  if (p.hostingSuspended === true) return { until, status: "suspended" as const };
  if (!until) return { until, status: DELIVERED.has(s(p.stage)) ? ("active" as const) : ("not-started" as const) };
  const days = Math.round((Date.parse(until) - Date.parse(today())) / 86_400_000);
  return { until, status: days < 0 ? ("expired" as const) : days <= 30 ? ("expiring" as const) : ("active" as const), daysLeft: days };
}

function projectView(p: Rec, shoots: Rec[], updates: Rec[]) {
  const stage = s(p.stage) || "kickoff";
  const idx = CLIENT_STAGES.findIndex(([k]) => k === stage);
  const hosting = hostingOf(p);
  const delivered = DELIVERED.has(stage);
  const myShoots = shoots.filter((x) => s(x.projectId) === p.id && s(x.status) !== "cancelled").sort((a, b) => s(a.date).localeCompare(s(b.date)));
  const shoot = myShoots.find((x) => s(x.date) >= today()) ?? myShoots[myShoots.length - 1];
  return {
    id: p.id,
    ref: p.id.slice(-6).toUpperCase(),
    title: s(p.title),
    stage,
    stageLabel: PROJECT_STAGES.find((o) => o.value === stage)?.label ?? stage,
    onHold: stage === "on-hold" || stage === "cancelled",
    progress: idx < 0 ? 0 : Math.round(((idx + (stage === "completed" ? 1 : 0.5)) / CLIENT_STAGES.length) * 100),
    timeline: CLIENT_STAGES.map(([key, label], i) => ({ key, label, state: idx < 0 ? "upcoming" : i < idx || stage === "completed" ? "done" : i === idx ? "current" : "upcoming" })),
    services: (Array.isArray(p.services) ? (p.services as string[]) : [s(p.service)]).filter(Boolean).map((id) => SERVICES.find((x) => x.id === id)?.name ?? id),
    brief: s(p.brief),
    startDate: s(p.startDate),
    dueDate: s(p.dueDate),
    shoot: shoot ? { date: s(shoot.date), time: s(shoot.callTime), location: s(shoot.location), status: s(shoot.status), kind: s(shoot.kind) } : null,
    // the preview while production runs; the final link only once the project is delivered and hosting is not suspended
    previewUrl: !delivered ? s(p.stagingUrl) : "",
    liveUrl: delivered && hosting.status !== "suspended" ? s(p.liveUrl) : "",
    hosting,
    revisions: { allowed: n(p.revisionsAllowed), used: n(p.revisionsUsed) },
    updates: updates
      .filter((u) => s(u.projectId) === p.id)
      .sort((a, b) => s(b.createdAt).localeCompare(s(a.createdAt)))
      .map((u) => ({ id: u.id, title: s(u.title), body: s(u.body), previewUrl: s(u.previewUrl), kind: s(u.kind) || "update", needsApproval: u.needsApproval === true, approval: (u.approval as Rec | undefined) ?? null, createdAt: s(u.createdAt) })),
  };
}

const ticketView = (t: Rec) => ({
  id: t.id,
  kind: s(t.kind) || "support",
  kindLabel: TICKET_KINDS[s(t.kind)] ?? "Support request",
  subject: s(t.subject),
  status: s(t.status) || "open",
  projectId: s(t.projectId),
  createdAt: s(t.createdAt),
  updatedAt: s(t.updatedAt),
  messages: (Array.isArray(t.messages) ? (t.messages as Rec[]) : []).map((m) => ({ from: s(m.from) === "team" ? "team" : "client", author: s(m.author), text: s(m.text), at: s(m.at) })),
});

/** Everything the signed-in client sees, across all their projects. */
export async function portalHome(user: PortalUser) {
  const [projects, clients, invoices, shoots, updates, tickets, { settings }] = await Promise.all([
    listRecords("projects"),
    listRecords("clients"),
    listRecords("invoices"),
    listRecords("shoots"),
    listRecords("portalUpdates"),
    listRecords("portalTickets"),
    readSettings(),
  ]);
  const mine = projects.filter((p) => user.projectIds.includes(p.id));
  const client = clients.find((c) => c.id === user.clientId);
  const myInvoices = invoices
    .filter((i) => (user.projectIds.includes(s(i.projectId)) || (!s(i.projectId) && s(i.clientId) === user.clientId)) && !["draft", "cancelled"].includes(s(i.status)))
    .sort((a, b) => s(b.date).localeCompare(s(a.date)))
    .map((i) => {
      const t = invoiceTotalsWithPayments(i);
      const pays = Array.isArray(i.payments) ? (i.payments as Rec[]) : [];
      return {
        id: i.id,
        number: s(i.number),
        date: s(i.date),
        dueDate: s(i.dueDate),
        milestone: s(i.milestone),
        projectId: s(i.projectId),
        total: t.total,
        paid: t.paid,
        balance: t.balance,
        status: s(i.status),
        gst: t.gstPercent > 0,
        payments: pays.filter((p) => p.refunded !== true).map((p) => ({ date: s(p.date), amount: n(p.amount), mode: s(p.mode), confirmed: p.reconciled === true })),
      };
    });
  const outstanding = myInvoices.reduce((sum, i) => sum + i.balance, 0);
  const views = mine.map((p) => projectView(p, shoots, updates));
  return {
    me: { name: user.name, email: user.email, business: s(client?.name) },
    projects: views,
    invoices: myInvoices,
    outstanding,
    payTo:
      outstanding > 0
        ? { upi: settings.upiId, accountName: settings.bankAccountName, bank: settings.bankName, account: settings.bankAccountNumber, ifsc: settings.bankIfsc }
        : null,
    tickets: tickets.filter((t) => s(t.clientId) === user.clientId || user.projectIds.includes(s(t.projectId))).sort((a, b) => s(b.updatedAt).localeCompare(s(a.updatedAt))).map(ticketView),
    pendingApprovals: views.flatMap((p) => p.updates.filter((u) => u.needsApproval && !u.approval).map((u) => ({ ...u, projectId: p.id, projectTitle: p.title }))),
    contact: { phone: site.contact.phone, email: site.contact.email, whatsapp: site.contact.whatsapp },
    ticketKinds: TICKET_KINDS,
  };
}

/* ───────────────────────────── what the client does ───────────────────────────── */

/** Approve an update (brief, capture date, preview…) or ask for changes. */
export async function respondToUpdate(user: PortalUser, updateId: string, decision: "approved" | "changes", comment: string) {
  const u = await getRecord("portalUpdates", updateId);
  if (!u || !user.projectIds.includes(s(u.projectId))) throw new PortalError("Update not found.", 404);
  if (u.needsApproval !== true) throw new PortalError("This update doesn't need an approval.");
  if (u.approval) throw new PortalError("You have already answered this one. Send a message if something changed.");
  if (decision === "changes" && !comment.trim()) throw new PortalError("Tell us what you'd like changed.");
  await upsertRecord(
    "portalUpdates",
    { ...u, approval: { status: decision, comment: comment.trim().slice(0, 3000), by: user.name, at: now() }, readByTeam: false, history: [...history(u), event(user.name, decision === "approved" ? "Approved by the client" : "Changes requested", comment.trim() || undefined)] },
    `${user.name} (client)`,
  );
}

/** Open a support ticket (support, revision, broken link, billing, renewal). */
export async function openTicket(user: PortalUser, input: { projectId?: string; kind?: string; subject?: string; text?: string }) {
  const projectId = s(input.projectId);
  if (projectId && !user.projectIds.includes(projectId)) throw new PortalError("Project not found.", 404);
  const kind = TICKET_KINDS[s(input.kind)] ? s(input.kind) : "support";
  const text = s(input.text).slice(0, 4000);
  if (!text) throw new PortalError("Tell us what you need.");
  const subject = s(input.subject).slice(0, 140) || TICKET_KINDS[kind];
  const t = await upsertRecord(
    "portalTickets",
    { kind, subject, status: "open", projectId, clientId: user.clientId, readByTeam: false, messages: [{ from: "client", author: user.name, text, at: now() }] },
    `${user.name} (client)`,
  );
  return ticketView(t);
}

export async function replyToTicket(user: PortalUser, ticketId: string, text: string) {
  const t = await getRecord("portalTickets", ticketId);
  if (!t || (s(t.clientId) !== user.clientId && !user.projectIds.includes(s(t.projectId)))) throw new PortalError("Ticket not found.", 404);
  const body = text.trim().slice(0, 4000);
  if (!body) throw new PortalError("Write a message first.");
  const messages = [...(Array.isArray(t.messages) ? (t.messages as Rec[]) : []), { from: "client", author: user.name, text: body, at: now() }];
  await upsertRecord("portalTickets", { ...t, messages, status: s(t.status) === "closed" ? "open" : s(t.status) || "open", readByTeam: false }, `${user.name} (client)`);
}

/** One of the client's own invoices, for the printable copy. */
export async function clientInvoice(user: PortalUser, invoiceId: string) {
  const inv = await getRecord("invoices", invoiceId);
  if (!inv || ["draft", "cancelled"].includes(s(inv.status))) throw new PortalError("Invoice not found.", 404);
  const ok = user.projectIds.includes(s(inv.projectId)) || (!s(inv.projectId) && s(inv.clientId) === user.clientId);
  if (!ok) throw new PortalError("Invoice not found.", 404);
  return { inv, settings: (await readSettings()).settings };
}

/* ───────────────────────────── the studio's side (HQ) ───────────────────────────── */

export async function hqPortalView(projectId: string) {
  const [accounts, updates, tickets] = await Promise.all([readPortalAccounts(true), listRecords("portalUpdates"), listRecords("portalTickets")]);
  const p = await getRecord("projects", projectId);
  return {
    accounts: accounts.list.filter((a) => a.projectIds.includes(projectId)),
    updates: updates.filter((u) => s(u.projectId) === projectId).sort((a, b) => s(b.createdAt).localeCompare(s(a.createdAt))),
    tickets: tickets.filter((t) => s(t.projectId) === projectId || (!s(t.projectId) && p && s(t.clientId) === s(p.clientId))).sort((a, b) => s(b.updatedAt).localeCompare(s(a.updatedAt))).map(ticketView),
  };
}

export async function publishUpdate(projectId: string, input: { title: string; body: string; previewUrl?: string; needsApproval?: boolean; kind?: string }, by: string) {
  const p = await getRecord("projects", projectId);
  if (!p) throw new PortalError("Project not found.", 404);
  const title = s(input.title).slice(0, 160);
  if (!title) throw new PortalError("Give the update a title.");
  const previewUrl = s(input.previewUrl);
  if (previewUrl && !/^https:\/\//i.test(previewUrl)) throw new PortalError("A preview link must start with https://");
  const u = await upsertRecord(
    "portalUpdates",
    { projectId, title, body: s(input.body).slice(0, 5000), previewUrl, kind: s(input.kind) || "update", needsApproval: input.needsApproval === true, publishedBy: by, history: [event(by, "Published")] },
    by,
  );
  await notifyClient(p, input.needsApproval ? `Please review: ${title}` : `Project update: ${title}`, `${s(input.body)}${previewUrl ? `\n\nPreview: ${previewUrl}` : ""}${input.needsApproval ? "\n\nOpen your portal to approve it or ask for changes." : ""}`);
  return u;
}

export async function teamReply(ticketId: string, text: string, status: string | undefined, by: string) {
  const t = await getRecord("portalTickets", ticketId);
  if (!t) throw new PortalError("Ticket not found.", 404);
  const body = text.trim().slice(0, 4000);
  const messages = [...(Array.isArray(t.messages) ? (t.messages as Rec[]) : []), ...(body ? [{ from: "team", author: by, text: body, at: now() }] : [])];
  const next = status && ["open", "in-progress", "resolved", "closed"].includes(status) ? status : body ? "in-progress" : s(t.status);
  await upsertRecord("portalTickets", { ...t, messages, status: next, readByTeam: true }, by);
  const p = s(t.projectId) ? await getRecord("projects", s(t.projectId)) : null;
  if (body) await notifyClient(p ?? { id: "", title: s(t.subject), clientId: s(t.clientId) }, `Reply from ${site.name}: ${s(t.subject)}`, body);
}

/* ───────────────────────────── emails to the client ───────────────────────────── */

/** Email the client's active portal logins, when email is set up. Never fails the action that called it. */
async function notifyClient(project: Rec, subject: string, text: string) {
  if (!mailReady()) return;
  try {
    const to = (await readPortalAccounts())
      .list.filter((a) => !a.disabled && a.password && (project.id ? a.projectIds.includes(project.id) : a.clientId === s(project.clientId)))
      .map((a) => a.email)
      .filter(isEmail);
    if (!to.length) return;
    await sendMail({ to, subject: `${subject}${s(project.title) ? ` — ${s(project.title)}` : ""}`, text: `${text}\n\nOpen your portal: ${PORTAL_URL()}`, html: portalEmail(subject, text) });
  } catch (e) {
    console.error("[portal] could not email the client:", e instanceof Error ? e.message : e);
  }
}

export function portalEmail(heading: string, text: string, button?: { href: string; label: string }) {
  const b = button ?? { href: PORTAL_URL(), label: "Open your 360VUE portal" };
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111"><h2 style="font-size:18px">${esc(heading)}</h2><p style="white-space:pre-line;line-height:1.5">${esc(text)}</p><p><a href="${esc(b.href)}" style="display:inline-block;background:#0E0B08;color:#F9F5ED;padding:12px 18px;text-decoration:none;border-radius:999px">${esc(b.label)}</a></p><p style="color:#777;font-size:12px">${esc(site.name)} · See every angle.</p></div>`;
}
