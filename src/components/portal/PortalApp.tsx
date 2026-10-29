"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { CalendarDays, Check, CheckCircle2, Copy, Download, ExternalLink, FileText, LayoutDashboard, LifeBuoy, Loader2, LogOut, MessageSquare, Rotate3d, Server, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/* ─────────────────────────── types (what /api/portal returns) ─────────────────────────── */

interface Update { id: string; title: string; body: string; previewUrl: string; kind: string; needsApproval: boolean; approval: { status: string; comment?: string; by?: string; at?: string } | null; createdAt: string }
interface Project {
  id: string; ref: string; title: string; stage: string; stageLabel: string; onHold: boolean; progress: number;
  timeline: { key: string; label: string; state: "done" | "current" | "upcoming" }[];
  services: string[]; brief: string; startDate: string; dueDate: string;
  shoot: { date: string; time: string; location: string; status: string; kind: string } | null;
  previewUrl: string; liveUrl: string;
  hosting: { until: string; status: "active" | "expiring" | "expired" | "suspended" | "not-started"; daysLeft?: number };
  revisions: { allowed: number; used: number };
  updates: Update[];
}
interface Invoice { id: string; number: string; date: string; dueDate: string; milestone: string; projectId: string; total: number; paid: number; balance: number; status: string; gst: boolean; payments: { date: string; amount: number; mode: string; confirmed: boolean }[] }
interface Ticket { id: string; kind: string; kindLabel: string; subject: string; status: string; projectId: string; createdAt: string; updatedAt: string; messages: { from: "client" | "team"; author: string; text: string; at: string }[] }
interface Home {
  me: { name: string; email: string; business: string };
  projects: Project[];
  invoices: Invoice[];
  outstanding: number;
  payTo: { upi: string; accountName: string; bank: string; account: string; ifsc: string } | null;
  tickets: Ticket[];
  pendingApprovals: (Update & { projectId: string; projectTitle: string })[];
  contact: { phone: string; email: string; whatsapp: string };
  ticketKinds: Record<string, string>;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const day = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const card = "rounded-3xl border border-cream/10 bg-night/70 p-6";
const btn = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50";
const gold = `${btn} bg-gold-grad text-midnight`;
const ghost = `${btn} border border-cream/20 text-cream hover:border-sunset hover:text-sunset`;
const field = "mt-1.5 w-full rounded-xl border border-cream/15 bg-midnight px-4 py-2.5 text-sm text-cream outline-none focus:border-sunset";

async function call<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Something went wrong.");
  return j as T;
}

const TABS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "projects", label: "Projects & tours", Icon: Rotate3d },
  { id: "billing", label: "Billing", Icon: Wallet },
  { id: "support", label: "Approvals & support", Icon: LifeBuoy },
  { id: "hosting", label: "Hosting", Icon: Server },
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ─────────────────────────── the app ─────────────────────────── */

export function PortalApp() {
  const [data, setData] = useState<Home | null>(null);
  const [state, setState] = useState<"loading" | "signin" | "ready" | "error">("loading");
  const [tab, setTab] = useState<Tab>("overview");

  const load = useCallback(async () => {
    const res = await fetch("/api/portal", { cache: "no-store" });
    if (res.status === 401) return setState("signin");
    if (!res.ok) return setState("error");
    setData(await res.json());
    setState("ready");
  }, []);
  useEffect(() => {
    // load() only sets state after the network answers, never synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setState("error"));
  }, [load]);

  if (state === "loading") return <Centered><Loader2 className="size-6 animate-spin text-sunset" aria-label="Loading" /></Centered>;
  if (state === "signin") return <SignIn onDone={() => load()} />;
  if (state === "error" || !data) return <Centered><p className="text-cream/70">We couldn&apos;t load your portal. Please refresh in a minute.</p></Centered>;

  const signOut = async () => {
    await fetch("/api/portal/auth", { method: "DELETE" });
    setData(null);
    setState("signin");
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-cream/10 bg-midnight/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="text-[18px]">
            <Logo tone="white" />
          </span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-cream/60 sm:inline">{data.me.email}</span>
            <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 text-cream/80 hover:text-sunset">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Portal sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {TABS.map(({ id, label, Icon }) => {
            const count = id === "support" ? data.pendingApprovals.length : id === "billing" && data.outstanding > 0 ? 1 : 0;
            return (
              <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === id ? "bg-sunset/15 text-sunset" : "text-cream/70 hover:text-cream"}`}>
                <Icon className="size-4" aria-hidden /> {label}
                {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-sunset text-[10px] font-bold text-midnight">{id === "billing" ? "!" : count}</span>}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === "overview" && <Overview d={data} go={setTab} />}
        {tab === "projects" && <Projects d={data} />}
        {tab === "billing" && <Billing d={data} />}
        {tab === "support" && <Support d={data} reload={load} />}
        {tab === "hosting" && <Hosting d={data} />}
        <Account />
      </main>
      <footer className="border-t border-cream/10 py-6 text-center text-xs text-cream/40">
        Need help? Call {data.contact.phone} · {data.contact.email}
      </footer>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-dvh place-items-center px-4">{children}</main>;
}

/* ─────────────────────────── sign in ─────────────────────────── */

function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/portal/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(j.error || "Could not sign in.");
    onDone();
  }
  async function forgot() {
    setError("");
    if (!email) return setError("Type your email first, then tap “Forgot password”.");
    const j = await (await fetch("/api/portal/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })).json().catch(() => ({}));
    setNote(j.message || j.error || "");
  }
  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-cream/10 bg-night/80 p-8">
        <div className="text-[22px]">
          <Logo tone="white" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Client portal</h1>
        <p className="mt-2 text-sm text-cream/60">Your projects, tour links, invoices and support — in one place.</p>
        <label className="mt-6 block text-sm">
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        {note && <p className="mt-4 rounded-xl border border-sunset/30 bg-sunset/10 px-3 py-2 text-sm text-cream/80">{note}</p>}
        <button type="submit" disabled={busy} className={`${gold} mt-6 w-full py-3.5`}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Sign in
        </button>
        <button type="button" onClick={forgot} className="mt-4 w-full text-center text-sm text-cream/60 hover:text-sunset">
          Forgot password?
        </button>
        <p className="mt-6 text-center text-xs text-cream/40">First time? Use the link in your invitation from 360VUE.</p>
      </form>
    </Centered>
  );
}

/* ─────────────────────────── 1 · overview ─────────────────────────── */

function Overview({ d, go }: { d: Home; go: (t: Tab) => void }) {
  const active = d.projects.filter((p) => !["completed", "cancelled"].includes(p.stage));
  const shoots = d.projects.filter((p) => p.shoot && p.shoot.date >= new Date().toISOString().slice(0, 10));
  const delivered = d.projects.filter((p) => p.liveUrl);
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sunset">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Hello, {d.me.name.split(" ")[0] || "there"}</h1>
        {d.me.business && <p className="mt-1 text-cream/60">{d.me.business}</p>}
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active projects" value={String(active.length)} onClick={() => go("projects")} />
        <Stat label="To pay" value={inr(d.outstanding)} tone={d.outstanding > 0 ? "warn" : undefined} onClick={() => go("billing")} />
        <Stat label="Waiting for you" value={String(d.pendingApprovals.length)} tone={d.pendingApprovals.length ? "warn" : undefined} onClick={() => go("support")} />
        <Stat label="Tours delivered" value={String(delivered.length)} onClick={() => go("hosting")} />
      </div>
      {d.pendingApprovals.length > 0 && (
        <section className={`${card} border-sunset/40`}>
          <h2 className="font-semibold">Needs your approval</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {d.pendingApprovals.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3">
                <span>
                  {u.title} <span className="text-cream/45">· {u.projectTitle}</span>
                </span>
                <button type="button" onClick={() => go("support")} className="text-sunset hover:underline">
                  Review →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-semibold">Your projects</h2>
          {active.length === 0 && <p className="mt-3 text-sm text-cream/55">No active projects.</p>}
          <ul className="mt-3 space-y-4">
            {active.map((p) => (
              <li key={p.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{p.title}</span>
                  <span className="text-cream/55">{p.onHold ? "On hold" : p.stageLabel}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-cream/10">
                  <div className="h-full rounded-full bg-gold-grad" style={{ width: `${Math.max(p.progress, 4)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className={card}>
          <h2 className="font-semibold">Coming up</h2>
          {shoots.length === 0 && d.outstanding === 0 && <p className="mt-3 text-sm text-cream/55">Nothing scheduled right now.</p>}
          <ul className="mt-3 space-y-3 text-sm">
            {shoots.map((p) => (
              <li key={p.id} className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden />
                <span>
                  Capture day for <b>{p.title}</b>: {day(p.shoot!.date)}
                  {p.shoot!.time ? ` at ${p.shoot!.time}` : ""}
                </span>
              </li>
            ))}
            {d.invoices
              .filter((i) => i.balance > 0)
              .map((i) => (
                <li key={i.id} className="flex gap-3">
                  <Wallet className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden />
                  <span>
                    Invoice {i.number}: {inr(i.balance)} due{i.dueDate ? ` by ${day(i.dueDate)}` : ""}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>
      {delivered.length > 0 && (
        <section className={card}>
          <h2 className="font-semibold">Your tours</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {delivered.map((p) => (
              <li key={p.id}>
                <a href={p.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-cream/10 px-4 py-3 hover:border-sunset">
                  <span className="font-medium">{p.title}</span>
                  <ExternalLink className="size-4 text-sunset" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, tone, onClick }: { label: string; value: string; tone?: "warn"; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${card} text-left transition-colors hover:border-sunset/50 ${tone ? "border-sunset/40" : ""}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-cream/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular ${tone ? "text-sunset" : ""}`}>{value}</p>
    </button>
  );
}

/* ─────────────────────────── 2 · projects & tours ─────────────────────────── */

function Projects({ d }: { d: Home }) {
  if (!d.projects.length) return <p className="text-cream/60">No projects yet.</p>;
  return (
    <div className="space-y-6">
      {d.projects.map((p) => (
        <section key={p.id} className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/45">Project #{p.ref}</p>
              <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
              {p.services.length > 0 && <p className="mt-1 text-sm text-cream/55">{p.services.join(" · ")}</p>}
            </div>
            <span className="rounded-full border border-sunset/40 px-3 py-1 text-xs font-semibold text-sunset">{p.onHold ? "On hold" : p.stageLabel}</span>
          </div>
          <ol className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Progress">
            {p.timeline.map((t) => (
              <li key={t.key} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${t.state === "current" ? "bg-sunset/15 font-semibold text-sunset" : t.state === "done" ? "text-cream/75" : "text-cream/35"}`}>
                {t.state === "done" ? <Check className="size-3.5 shrink-0" aria-hidden /> : <span className={`size-2 shrink-0 rounded-full ${t.state === "current" ? "bg-sunset" : "bg-cream/25"}`} />}
                {t.label}
              </li>
            ))}
          </ol>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-cream/45">Capture day</dt>
              <dd className="mt-0.5">{p.shoot ? `${day(p.shoot.date)}${p.shoot.time ? `, ${p.shoot.time}` : ""}` : "To be confirmed"}</dd>
            </div>
            <div>
              <dt className="text-cream/45">Expected delivery</dt>
              <dd className="mt-0.5">{p.dueDate ? day(p.dueDate) : "After capture"}</dd>
            </div>
            <div>
              <dt className="text-cream/45">Revision rounds</dt>
              <dd className="mt-0.5">{p.revisions.allowed ? `${p.revisions.used} of ${p.revisions.allowed} used` : "As agreed"}</dd>
            </div>
          </dl>
          {p.brief && (
            <details className="mt-5 rounded-2xl border border-cream/10 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-medium">Project brief</summary>
              <p className="mt-2 whitespace-pre-line text-cream/70">{p.brief}</p>
            </details>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {p.previewUrl && (
              <a href={p.previewUrl} target="_blank" rel="noreferrer" className={ghost}>
                Open the preview <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noreferrer" className={gold}>
                Open your tour <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </div>
          {p.liveUrl && <Share url={p.liveUrl} title={p.title} />}
          {p.updates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Updates</h3>
              <ul className="mt-2 space-y-3">
                {p.updates.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-cream/10 px-4 py-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium">{u.title}</span>
                      <span className="shrink-0 text-xs text-cream/45">{day(u.createdAt)}</span>
                    </div>
                    {u.body && <p className="mt-1 whitespace-pre-line text-cream/65">{u.body}</p>}
                    {u.previewUrl && (
                      <a href={u.previewUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sunset hover:underline">
                        Preview <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    )}
                    {u.approval && (
                      <p className="mt-2 text-xs text-cream/50">
                        {u.approval.status === "approved" ? "✓ You approved this" : "You asked for changes"} {u.approval.at ? `on ${day(u.approval.at)}` : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

/** The final tour's share link, QR code and website embed code. */
function Share({ url, title }: { url: string; title: string }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 512, color: { dark: "#0E0B08", light: "#FFFFFF" } }).then(setQr).catch(() => setQr(""));
  }, [url]);
  const embed = `<iframe src="${url}" title="${title.replace(/"/g, "&quot;")} — 360° tour" width="100%" height="600" style="border:0" allow="fullscreen; xr-spatial-tracking" allowfullscreen></iframe>`;
  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard blocked: the text is visible to copy by hand */
    }
  };
  return (
    <div className="mt-6 grid gap-5 rounded-2xl border border-cream/10 p-4 sm:grid-cols-[160px_1fr]">
      {qr ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code for the ${title} tour`} className="w-40 rounded-xl bg-white p-2" />
          <a href={qr} download={`${title.replace(/[^\w]+/g, "-")}-tour-QR.png`} className="mt-2 inline-flex items-center gap-1 text-xs text-sunset hover:underline">
            <Download className="size-3.5" aria-hidden /> Download QR
          </a>
        </div>
      ) : (
        <div />
      )}
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-cream/45">Share link</p>
          <div className="mt-1 flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-midnight px-3 py-2 text-xs">{url}</code>
            <button type="button" onClick={() => copy("link", url)} className={ghost} aria-label="Copy share link">
              {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
        <div>
          <p className="text-cream/45">Website embed code</p>
          <div className="mt-1 flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-midnight px-3 py-2 text-xs">{embed}</code>
            <button type="button" onClick={() => copy("embed", embed)} className={ghost} aria-label="Copy embed code">
              {copied === "embed" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-cream/40">Paste it into your website where the tour should appear.</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── 3 · billing ─────────────────────────── */

function Billing({ d }: { d: Home }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}>
          <p className="text-xs uppercase tracking-[0.2em] text-cream/50">Invoiced</p>
          <p className="mt-2 text-2xl font-semibold tabular">{inr(d.invoices.reduce((s, i) => s + i.total, 0))}</p>
        </div>
        <div className={card}>
          <p className="text-xs uppercase tracking-[0.2em] text-cream/50">Paid</p>
          <p className="mt-2 text-2xl font-semibold tabular">{inr(d.invoices.reduce((s, i) => s + i.paid, 0))}</p>
        </div>
        <div className={`${card} ${d.outstanding > 0 ? "border-sunset/40" : ""}`}>
          <p className="text-xs uppercase tracking-[0.2em] text-cream/50">Balance due</p>
          <p className={`mt-2 text-2xl font-semibold tabular ${d.outstanding > 0 ? "text-sunset" : ""}`}>{inr(d.outstanding)}</p>
        </div>
      </div>
      {d.payTo && (
        <section className={`${card} border-sunset/40`}>
          <h2 className="font-semibold">How to pay</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {d.payTo.upi && <Pair k="UPI" v={d.payTo.upi} />}
            {d.payTo.accountName && <Pair k="Account name" v={d.payTo.accountName} />}
            {d.payTo.bank && <Pair k="Bank" v={d.payTo.bank} />}
            {d.payTo.account && <Pair k="Account number" v={d.payTo.account} />}
            {d.payTo.ifsc && <Pair k="IFSC" v={d.payTo.ifsc} />}
          </dl>
          <p className="mt-3 text-xs text-cream/50">Mention the invoice number with your payment. We confirm it here once it reaches our bank.</p>
        </section>
      )}
      <section className={card}>
        <h2 className="font-semibold">Invoices &amp; receipts</h2>
        {d.invoices.length === 0 && <p className="mt-3 text-sm text-cream/55">No invoices yet.</p>}
        <ul className="mt-3 divide-y divide-cream/10">
          {d.invoices.map((i) => (
            <li key={i.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {i.number} <span className="text-cream/45">· {day(i.date)}</span>
                  </p>
                  {i.milestone && <p className="text-sm text-cream/55">{i.milestone}</p>}
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold tabular">{inr(i.total)}</p>
                  <p className={i.balance > 0 ? "text-sunset" : "text-cream/50"}>{i.balance > 0 ? `${inr(i.balance)} due${i.dueDate ? ` by ${day(i.dueDate)}` : ""}` : "Paid"}</p>
                </div>
              </div>
              {i.payments.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-cream/55">
                  {i.payments.map((p, k) => (
                    <li key={k}>
                      {day(p.date)} · {inr(p.amount)}
                      {p.mode ? ` · ${p.mode}` : ""} · {p.confirmed ? "✓ confirmed" : "being verified"}
                    </li>
                  ))}
                </ul>
              )}
              <a href={`/api/portal/invoice?id=${encodeURIComponent(i.id)}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-sunset hover:underline">
                <FileText className="size-4" aria-hidden /> View / download PDF
              </a>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-cream/55">Question about a bill? Raise a billing question under Approvals &amp; support.</p>
    </div>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-cream/45">{k}</dt>
      <dd className="font-mono text-cream">{v}</dd>
    </div>
  );
}

/* ─────────────────────────── 4 · approvals & support ─────────────────────────── */

function Support({ d, reload }: { d: Home; reload: () => Promise<void> }) {
  const [kind, setKind] = useState("support");
  const [projectId, setProjectId] = useState(d.projects[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function raise(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await call({ action: "ticket", kind, projectId, subject, text });
      setSubject("");
      setText("");
      setSent(true);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className="font-semibold">Waiting for your approval</h2>
        {d.pendingApprovals.length === 0 && <p className="mt-3 text-sm text-cream/55">Nothing to approve right now.</p>}
        <ul className="mt-3 space-y-4">
          {d.pendingApprovals.map((u) => (
            <Approval key={u.id} u={u} reload={reload} />
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Ask for help</h2>
        <form onSubmit={raise} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            What is it about?
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={field}>
              {Object.entries(d.ticketKinds).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          {d.projects.length > 0 && (
            <label className="text-sm">
              Project
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={field}>
                {d.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="text-sm sm:col-span-2">
            Subject (optional)
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={140} className={field} />
          </label>
          <label className="text-sm sm:col-span-2">
            Details
            <textarea required rows={4} value={text} onChange={(e) => setText(e.target.value)} className={field} placeholder={kind === "revision" ? "Which scene, and what should change?" : kind === "broken-link" ? "Which link, and what happens when you open it?" : ""} />
          </label>
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          {sent && <p className="text-sm text-sunset sm:col-span-2">Sent — we&apos;ll reply here.</p>}
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className={gold}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Send
            </button>
          </div>
        </form>
      </section>

      <section className={card}>
        <h2 className="font-semibold">Your requests</h2>
        {d.tickets.length === 0 && <p className="mt-3 text-sm text-cream/55">No requests yet.</p>}
        <ul className="mt-3 space-y-4">
          {d.tickets.map((t) => (
            <TicketThread key={t.id} t={t} reload={reload} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function Approval({ u, reload }: { u: Update & { projectTitle: string }; reload: () => Promise<void> }) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function answer(decision: "approved" | "changes") {
    setBusy(true);
    setError("");
    try {
      await call({ action: "respond", id: u.id, decision, comment });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
      setBusy(false);
    }
  }
  return (
    <li className="rounded-2xl border border-sunset/30 p-4">
      <p className="text-xs text-cream/45">{u.projectTitle}</p>
      <p className="mt-1 font-semibold">{u.title}</p>
      {u.body && <p className="mt-1 whitespace-pre-line text-sm text-cream/70">{u.body}</p>}
      {u.previewUrl && (
        <a href={u.previewUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-sunset hover:underline">
          Open the preview <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
      <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comments or corrections (needed if you ask for changes)" className={field} />
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => answer("approved")} className={gold}>
          <CheckCircle2 className="size-4" aria-hidden /> Approve
        </button>
        <button type="button" disabled={busy} onClick={() => answer("changes")} className={ghost}>
          Ask for changes
        </button>
      </div>
    </li>
  );
}

function TicketThread({ t, reload }: { t: Ticket; reload: () => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await call({ action: "reply", id: t.id, text });
      setText("");
      await reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="rounded-2xl border border-cream/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          {t.subject} <span className="text-xs text-cream/45">· {t.kindLabel}</span>
        </p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs ${t.status === "resolved" || t.status === "closed" ? "bg-cream/10 text-cream/60" : "bg-sunset/15 text-sunset"}`}>{t.status.replace("-", " ")}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {t.messages.map((m, i) => (
          <li key={i} className={`rounded-xl px-3 py-2 text-sm ${m.from === "team" ? "bg-sunset/10" : "bg-midnight"}`}>
            <p className="text-xs text-cream/45">
              {m.from === "team" ? `360VUE · ${m.author}` : "You"} · {day(m.at)}
            </p>
            <p className="mt-0.5 whitespace-pre-line text-cream/80">{m.text}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={reply} className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply…" className={`${field} mt-0`} />
        <button type="submit" disabled={busy || !text.trim()} className={ghost} aria-label="Send reply">
          <MessageSquare className="size-4" aria-hidden />
        </button>
      </form>
    </li>
  );
}

/* ─────────────────────────── 5 · hosting ─────────────────────────── */

const HOSTING: Record<string, { label: string; tone: string; note: string }> = {
  active: { label: "Active", tone: "text-emerald-300", note: "Your tour is online." },
  expiring: { label: "Renewal due soon", tone: "text-sunset", note: "Renew before the date below to keep your tour online without a break." },
  expired: { label: "Renewal due", tone: "text-red-300", note: "Your hosting period has ended. Renew to keep your tour online." },
  suspended: { label: "Suspended", tone: "text-red-300", note: "Your tour is offline until the renewal is paid. Your invoices, receipts and support stay available here." },
  "not-started": { label: "Starts at delivery", tone: "text-cream/60", note: "12 months of hosting start when your tour is delivered." },
};

function Hosting({ d }: { d: Home }) {
  const [busy, setBusy] = useState("");
  const [done, setDone] = useState("");
  async function renew(p: Project) {
    setBusy(p.id);
    try {
      await call({ action: "ticket", kind: "renewal", projectId: p.id, subject: `Renew hosting — ${p.title}`, text: `Please send a renewal invoice for ${p.title}${p.hosting.until ? ` (hosting until ${day(p.hosting.until)})` : ""}.` });
      setDone(p.id);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-6">
      {d.projects.map((p) => {
        const h = HOSTING[p.hosting.status];
        return (
          <section key={p.id} className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <span className={`text-sm font-semibold ${h.tone}`}>{h.label}</span>
            </div>
            <p className="mt-2 text-sm text-cream/65">{h.note}</p>
            {p.hosting.until && <p className="mt-2 text-sm">Hosting until: <b>{day(p.hosting.until)}</b></p>}
            {["expiring", "expired", "suspended"].includes(p.hosting.status) && (
              <button type="button" disabled={busy === p.id || done === p.id} onClick={() => renew(p)} className={`${gold} mt-4`}>
                {done === p.id ? "Renewal requested — we'll send the invoice" : "Request renewal"}
              </button>
            )}
            {p.liveUrl && <Share url={p.liveUrl} title={p.title} />}
            <p className="mt-4 text-xs text-cream/40">Visitor statistics will appear here once our tour host provides them for your tour.</p>
          </section>
        );
      })}
      {d.projects.length === 0 && <p className="text-cream/60">No tours yet.</p>}
    </div>
  );
}

/* ─────────────────────────── account ─────────────────────────── */

function Account() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await call({ action: "password", current, next });
      setMsg("Password changed.");
      setCurrent("");
      setNext("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not change it.");
    }
  }
  return (
    <section className="mt-10 border-t border-cream/10 pt-6">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm text-cream/60 hover:text-sunset">
        {open ? "Hide" : "Change my password"}
      </button>
      {open && (
        <form onSubmit={save} className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
          <input type="password" autoComplete="current-password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} required />
          <input type="password" autoComplete="new-password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className={field} required minLength={8} />
          <button type="submit" className={`${ghost} sm:col-span-2 sm:justify-self-start`}>
            Save new password
          </button>
          {msg && <p className="text-sm text-cream/70 sm:col-span-2">{msg}</p>}
        </form>
      )}
    </section>
  );
}
