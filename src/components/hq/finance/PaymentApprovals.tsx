"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, MessageCircle, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/hq/ui";
import { api, useHq } from "@/components/hq/data";
import { formatINR } from "@/lib/utils";

interface Pending {
  invoiceId: string;
  invoiceNumber: string;
  milestone: string;
  paymentId: string;
  date: string;
  amount: number;
  tds: number;
  mode: string;
  reference: string;
  note: string;
  clarification: { note: string; by: string; at: string } | null;
  invoiceTotal: number;
  invoiceBalance: number;
  customerName: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  firstOnProject: boolean;
  campaign: string;
}
interface Result {
  receiptUrl: string;
  onboarding: null | { email: string; url: string; emailed: boolean; alreadyActive: boolean; missingEmail: boolean; phone: string; clientName: string; whatsapp: string; error?: string };
  campaign: null | { name: string; used: number; total: number; left: number };
  task: boolean;
}

const day = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

/**
 * HQ → Payment approvals: every payment recorded on an issued invoice waits here until someone has checked it in the
 * bank or payment gateway. Approving the advance starts the client's journey (portal invite, team task, campaign slot).
 */
export function PaymentApprovals() {
  const { store } = useHq();
  const [list, setList] = useState<Pending[] | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Record<string, Result>>({});

  const load = useCallback(() => {
    api<{ payments: Pending[] }>("/api/hq/payments")
      .then((j) => setList(j.payments))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load payments."));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        eyebrow="Money"
        icon="ShieldCheck"
        title="Payment approvals"
        description="Check each payment in the bank statement or payment gateway — never a screenshot alone — then approve it. Approving a project's advance marks it received, makes the receipt, creates the client's portal login and invitation, adds a task for the team, and uses a campaign slot if the project is on one."
      />
      {error && <p className="mb-4 rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}

      {Object.entries(done).map(([key, r]) => (
        <ResultCard key={key} r={r} />
      ))}

      {!list && !error && <p className="text-sm text-charcoal">Loading…</p>}
      {list && list.length === 0 && (
        <p className="rounded-[var(--radius-md)] border border-graphite/15 bg-paper-50 p-6 text-sm text-charcoal">
          Nothing to review. Payments appear here when you record them on an invoice (Finance → Invoices → open → Record payment).
        </p>
      )}
      <ul className="space-y-4">
        {list?.map((p) => (
          <PendingCard
            key={`${p.invoiceId}:${p.paymentId}`}
            p={p}
            canWrite={store.writable}
            onApproved={(r) => {
              setDone((d) => ({ ...d, [`${p.invoiceId}:${p.paymentId}`]: r }));
              load();
            }}
            onChanged={load}
          />
        ))}
      </ul>
    </div>
  );
}

function PendingCard({ p, canWrite, onApproved, onChanged }: { p: Pending; canWrite: boolean; onApproved: (r: Result) => void; onChanged: () => void }) {
  const [busy, setBusy] = useState<"" | "approve" | "clarify">("");
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const act = async (action: "approve" | "clarify") => {
    setBusy(action);
    setError("");
    try {
      const r = await api<Result>("/api/hq/payments", { method: "POST", body: JSON.stringify({ action, invoiceId: p.invoiceId, paymentId: p.paymentId, note }) });
      if (action === "approve") onApproved(r);
      else {
        setAsking(false);
        onChanged();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy("");
    }
  };
  return (
    <li className="rounded-[var(--radius-md)] border border-graphite/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="annot text-blueprint">Awaiting approval{p.firstOnProject ? " · first payment on this project (advance)" : ""}</p>
          <h2 className="mt-1 text-lg font-semibold text-graphite">{p.projectTitle || p.customerName}</h2>
          <p className="text-sm text-charcoal">
            {p.clientName || p.customerName}
            {p.campaign ? ` · ${p.campaign}` : ""}
          </p>
        </div>
        <p className="text-right">
          <span className="block text-2xl font-semibold tabular text-graphite">{formatINR(p.amount, { decimals: true })}</span>
          <span className="text-xs text-charcoal">reported {day(p.date)}</span>
        </p>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-charcoal">Invoice</dt>
          <dd>
            <a href={`/hq/finance?tab=invoices&id=${p.invoiceId}`} className="font-medium text-blueprint hover:underline">
              {p.invoiceNumber || "draft"}
            </a>
            {p.milestone && <span className="block text-xs text-charcoal">{p.milestone}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-charcoal">Invoice total</dt>
          <dd className="tabular">{formatINR(p.invoiceTotal, { decimals: true })}</dd>
        </div>
        <div>
          <dt className="text-charcoal">Method · reference</dt>
          <dd>
            {p.mode || "—"}
            {p.reference ? ` · ${p.reference}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-charcoal">Balance after this</dt>
          <dd className="tabular">{formatINR(Math.max(0, p.invoiceBalance), { decimals: true })}</dd>
        </div>
      </dl>
      {p.tds > 0 && <p className="mt-2 text-xs text-charcoal">TDS deducted by the client: {formatINR(p.tds, { decimals: true })}</p>}
      {p.clarification && (
        <p className="mt-3 rounded bg-graphite/[0.04] px-3 py-2 text-sm text-charcoal">
          Clarification asked by {p.clarification.by} on {day(p.clarification.at)}: “{p.clarification.note}”
        </p>
      )}
      {p.firstOnProject && !p.clientEmail && <p className="mt-3 text-sm text-bad">The client has no email in the CRM — add it first, or the portal login can&apos;t be created on approval.</p>}
      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      {canWrite && (
        <div className="mt-4 flex flex-wrap items-start gap-2">
          <Button size="sm" disabled={!!busy} onClick={() => act("approve")}>
            {busy === "approve" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Approve payment
          </Button>
          {!asking ? (
            <Button size="sm" variant="ghost" onClick={() => setAsking(true)}>
              Request clarification
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:max-w-lg">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What doesn't match? (e.g. amount differs from the bank, reference not found)" />
              <span className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={!!busy || !note.trim()} onClick={() => act("clarify")}>
                  Save note
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>
                  Cancel
                </Button>
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function ResultCard({ r }: { r: Result }) {
  const o = r.onboarding;
  return (
    <section className="mb-4 rounded-[var(--radius-md)] border border-lime/60 bg-lime/10 p-5 text-sm">
      <p className="flex items-center gap-2 font-semibold text-graphite">
        <CheckCircle2 className="size-5 text-good" aria-hidden /> Payment approved
      </p>
      <ul className="mt-2 space-y-1.5 text-charcoal">
        <li>
          Receipt ready —{" "}
          <a href={r.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blueprint hover:underline">
            <ReceiptText className="size-3.5" /> open receipt
          </a>
        </li>
        {r.task && <li>Task added for the team: schedule the capture day.</li>}
        {r.campaign && (
          <li>
            {r.campaign.name}: {r.campaign.used} of {r.campaign.total} slots used — <b>{r.campaign.left} left</b> on the website now.
          </li>
        )}
        {o && o.missingEmail && <li className="text-bad">No client email, so no portal login was created. Add the email in the CRM, then use the project&apos;s Client portal tab.</li>}
        {o && o.error && <li className="text-bad">Portal login: {o.error}</li>}
        {o && o.alreadyActive && <li>The client already has an active portal login — this project was added to it.</li>}
        {o && o.url && (
          <li>
            <span className="font-semibold text-graphite">{o.emailed ? `Portal invitation emailed to ${o.email}.` : `Portal login created for ${o.email}. Send them this link (valid 7 days):`}</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1.5 text-xs">{o.url}</code>
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(o.url).catch(() => {})} aria-label="Copy link">
                <Copy className="size-4" />
              </Button>
              {o.whatsapp && (
                <Button size="sm" variant="secondary" href={o.whatsapp} external>
                  <MessageCircle className="size-4" /> Send on WhatsApp <ExternalLink className="size-3" />
                </Button>
              )}
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
