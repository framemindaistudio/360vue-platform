import "server-only";
import { revalidateTag } from "next/cache";
import { getRecord, listRecords, upsertRecord } from "./records";
import { invoiceTotalsWithPayments, type BaseRecord } from "./collections";
import { mailReady, sendMail } from "./mail";
import { CAMPAIGN_TAG, slotsOf } from "@/lib/campaigns";
import { inviteClient, INVITE_DAYS, PortalError } from "@/lib/portal/auth";
import { portalEmail } from "@/lib/portal/data";
import { site } from "@/lib/site";

/*
 * Payment review: every payment recorded on an issued invoice waits here until a person has checked it against the
 * bank or payment gateway (never a screenshot alone). Approving it:
 *   1. marks it matched to the bank, stamped with who approved it and when (the receipt shows it);
 *   2. on a project's first approved payment (the advance): creates the client's portal login and sends the
 *      invitation — by email when email is set up, otherwise HQ shows the link to send on WhatsApp;
 *   3. adds a "ready to start" task for the team;
 *   4. on a campaign project, uses one of the campaign's slots (the website counter updates by itself).
 */

type Rec = BaseRecord;
const s = (v: unknown) => (v === undefined || v === null ? "" : String(v)).trim();
const n = (v: unknown) => Number(v) || 0;

const paymentsOf = (inv: Rec) => (Array.isArray(inv.payments) ? (inv.payments as Rec[]) : []);
const approvedOnProject = (invoices: Rec[], projectId: string) => invoices.some((i) => s(i.projectId) === projectId && paymentsOf(i).some((p) => p.reconciled === true && p.refunded !== true));

export async function pendingPayments() {
  const [invoices, projects, clients, campaigns] = await Promise.all([listRecords("invoices"), listRecords("projects"), listRecords("clients"), listRecords("campaigns")]);
  const out = [];
  for (const inv of invoices) {
    if (["draft", "cancelled"].includes(s(inv.status))) continue;
    const t = invoiceTotalsWithPayments(inv);
    for (const p of paymentsOf(inv)) {
      if (p.reconciled === true || p.refunded === true) continue;
      const project = projects.find((x) => x.id === s(inv.projectId));
      const client = clients.find((x) => x.id === (s(inv.clientId) || s(project?.clientId)));
      const campaignId = s(inv.campaignId) || s(project?.campaignId);
      out.push({
        invoiceId: inv.id,
        invoiceNumber: s(inv.number),
        milestone: s(inv.milestone),
        paymentId: s(p.id),
        date: s(p.date),
        amount: n(p.amount),
        tds: n(p.tds),
        mode: s(p.mode),
        reference: s(p.reference),
        note: s(p.note),
        clarification: (p.clarification as Rec | undefined) ?? null,
        invoiceTotal: t.total,
        invoiceBalance: t.balance,
        customerName: s(inv.customerName),
        projectId: s(project?.id),
        projectTitle: s(project?.title),
        clientName: s(client?.name),
        clientEmail: s(client?.email),
        firstOnProject: project ? !approvedOnProject(invoices, project.id) : false,
        campaign: campaignId ? s(campaigns.find((c) => c.id === campaignId)?.name) : "",
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

async function setPayment(invoiceId: string, paymentId: string, change: (p: Rec) => Rec, by: string) {
  const inv = await getRecord("invoices", invoiceId);
  if (!inv) throw new PortalError("Invoice not found.", 404);
  const pays = paymentsOf(inv);
  const i = pays.findIndex((p) => s(p.id) === paymentId);
  if (i < 0) throw new PortalError("Payment not found on this invoice.", 404);
  const next = pays.map((p, j) => (j === i ? change({ ...p }) : p));
  return upsertRecord("invoices", { ...inv, payments: next }, by);
}

export async function clarifyPayment(invoiceId: string, paymentId: string, note: string, by: string) {
  if (!note.trim()) throw new PortalError("Say what needs clarifying (it stays with the payment).");
  await setPayment(invoiceId, paymentId, (p) => ({ ...p, clarification: { note: note.trim().slice(0, 1000), by, at: new Date().toISOString() } }), by);
}

export async function approvePayment(invoiceId: string, paymentId: string, by: string) {
  const before = await listRecords("invoices");
  const inv = before.find((x) => x.id === invoiceId);
  if (!inv) throw new PortalError("Invoice not found.", 404);
  const pay = paymentsOf(inv).find((p) => s(p.id) === paymentId);
  if (!pay) throw new PortalError("Payment not found on this invoice.", 404);
  if (pay.reconciled === true) throw new PortalError("This payment is already approved.");
  const projectId = s(inv.projectId);
  const first = projectId ? !approvedOnProject(before, projectId) : false;

  // 1 · approve (who and when are stamped here, on the server)
  await setPayment(invoiceId, paymentId, (p) => {
    const out: Rec = { ...p, reconciled: true, reconciledBy: by, reconciledAt: new Date().toISOString() };
    delete out.clarification;
    return out;
  }, by);

  const result: {
    receiptUrl: string;
    onboarding: null | { email: string; url: string; emailed: boolean; alreadyActive: boolean; missingEmail: boolean; phone: string; clientName: string; whatsapp: string; error?: string };
    campaign: null | { name: string; used: number; total: number; left: number };
    task: boolean;
  } = { receiptUrl: `/hq/print/receipt/${invoiceId}`, onboarding: null, campaign: null, task: false };

  const project = projectId ? await getRecord("projects", projectId) : null;
  const client = (await listRecords("clients")).find((c) => c.id === (s(inv.clientId) || s(project?.clientId)));

  // 2 · the client portal, on the project's first approved payment
  if (project && first) {
    const email = s(client?.email).toLowerCase();
    const onboarding = { email, url: "", emailed: false, alreadyActive: false, missingEmail: !email, phone: s(client?.phone), clientName: s(client?.contactName) || s(client?.name) || s(inv.customerName), whatsapp: "" };
    if (email && client) {
      try {
        const g = await inviteClient({ email, name: onboarding.clientName, clientId: client.id, projectId: project.id }, by);
        onboarding.url = g.url;
        onboarding.alreadyActive = g.active && !g.url;
        if (g.url && onboarding.phone) onboarding.whatsapp = whatsappInvite(onboarding.phone, onboarding.clientName, g.url);
        if (g.url && mailReady()) {
          const text = `Hello ${onboarding.clientName},\n\nThank you — we've received your advance for "${s(project.title)}". Your 360VUE client portal is ready: follow your project, confirm your capture date, see your invoices and receipts, and get your tour link and QR code when it's delivered.\n\nOpen the link below to choose your password. It works for ${INVITE_DAYS} days.`;
          await sendMail({ to: [email], subject: `Your 360VUE client portal — ${s(project.title)}`, text: `${text}\n\n${g.url}`, html: portalEmail("Your 360VUE client portal is ready", text, { href: g.url, label: "Set your password" }) });
          onboarding.emailed = true;
        }
      } catch (e) {
        Object.assign(onboarding, { error: e instanceof Error ? e.message : "Could not create the portal login." });
      }
    }
    result.onboarding = onboarding;

    // 3 · tell the team the project can start
    try {
      await upsertRecord(
        "tasks",
        { title: `Advance approved — schedule capture: ${s(project.title)}`, status: "todo", priority: "high", area: "Projects", projectId: project.id, description: `Advance on invoice ${s(inv.number)} approved by ${by}. Confirm the capture date with the client and publish it in the portal for approval.` },
        by,
      );
      result.task = true;
    } catch {
      /* the approval stands even if the task could not be added */
    }
  }

  // 4 · campaign slot
  const campaignId = s(inv.campaignId) || s(project?.campaignId);
  if (campaignId) {
    const [campaign, invoices, projects] = await Promise.all([getRecord("campaigns", campaignId), listRecords("invoices"), listRecords("projects")]);
    if (campaign) {
      const st = slotsOf(campaign, invoices, projects);
      result.campaign = { name: s(campaign.name), used: st.used, total: st.total, left: st.left };
    }
  }
  try {
    revalidateTag(CAMPAIGN_TAG, { expire: 0 });
  } catch {
    /* outside a request (tests) */
  }
  return result;
}

/** A WhatsApp link that sends the client their invitation (when email isn't set up, or as well). */
export function whatsappInvite(phone: string, name: string, url: string) {
  const digits = phone.replace(/\D/g, "");
  const to = digits.length === 10 ? `91${digits}` : digits;
  const text = `Hello ${name}, thank you for your advance! Your ${site.name} client portal is ready. Open this link to set your password (valid ${INVITE_DAYS} days): ${url}`;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
