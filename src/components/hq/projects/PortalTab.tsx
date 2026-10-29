"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, MessageCircle, Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/form";
import { api } from "@/components/hq/data";
import { site } from "@/lib/site";

type Rec = Record<string, unknown> & { id: string };
interface Account { email: string; name: string; active: boolean; invitePending: boolean; inviteExpires: string; disabled: boolean; activatedAt: string; lastSignInAt: string }
interface Ticket { id: string; kindLabel: string; subject: string; status: string; messages: { from: string; author: string; text: string; at: string }[] }
interface View { accounts: Account[]; updates: Rec[]; tickets: Ticket[]; mail: boolean }

const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const day = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

/**
 * The project's client portal, as HQ sees it: who can sign in (invite, resend, pause), updates and approval requests
 * published to the client (brief, capture date, preview), and the client's support tickets with replies.
 */
export function PortalTab({ project, client, canWrite }: { project: Rec; client?: Rec; canWrite: boolean }) {
  const [v, setV] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<{ url: string; emailed: boolean; whatsapp: string } | null>(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(() => {
    api<View>(`/api/hq/portal?project=${encodeURIComponent(project.id)}`)
      .then(setV)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the portal."));
  }, [project.id]);
  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: Record<string, unknown>) => {
    setError("");
    return api<Record<string, unknown>>("/api/hq/portal", { method: "POST", body: JSON.stringify({ project: project.id, ...body }) });
  };

  async function sendInvite(fresh: boolean) {
    setBusy("invite");
    try {
      const j = await post({ action: "invite", fresh });
      setInvite(j.url ? { url: s(j.url), emailed: j.emailed === true, whatsapp: s(j.whatsapp) } : null);
      if (!j.url) setError("This login is already active — the client signs in with their own password. Use “New link” to reset it.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not invite.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}

      {/* who can sign in */}
      <section className="rounded-[var(--radius-md)] border border-graphite/15 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="annot text-blueprint">Client portal access</p>
            <p className="mt-1 text-sm text-charcoal">
              Created automatically when you approve the advance (Finance → Payment approvals). Sign-in page: <a href={`${site.website}/portal`} target="_blank" rel="noreferrer" className="text-blueprint hover:underline">{site.website.replace(/^https?:\/\//, "")}/portal</a>
            </p>
          </div>
          {canWrite && (
            <Button size="sm" variant="secondary" disabled={busy === "invite"} onClick={() => sendInvite(false)}>
              {busy === "invite" ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Invite {s(client?.email) ? s(client?.email) : "client"}
            </Button>
          )}
        </div>
        {!s(client?.email) && <p className="mt-3 text-sm text-bad">The client has no email address. Add it in the CRM — it is their sign-in name.</p>}
        {invite && (
          <div className="mt-4 rounded border border-lime/50 bg-lime/10 p-4 text-sm">
            <p className="font-semibold">{invite.emailed ? "Invitation emailed. You can also send the link yourself:" : "Send the client this link (it works for 7 days):"}</p>
            <div className="mt-2 flex gap-2">
              <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1.5 text-xs">{invite.url}</code>
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(invite.url).catch(() => {})} aria-label="Copy link">
                <Copy className="size-4" />
              </Button>
              {invite.whatsapp && (
                <Button size="sm" variant="secondary" href={invite.whatsapp} external>
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}
        <ul className="mt-4 divide-y divide-graphite/10 text-sm">
          {v?.accounts.map((a) => (
            <li key={a.email} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <span>
                <span className="font-medium">{a.name}</span> <span className="text-charcoal">· {a.email}</span>
                <span className="block text-xs text-charcoal">
                  {a.disabled ? "Paused" : a.active ? `Active since ${day(a.activatedAt)}${a.lastSignInAt ? ` · last sign-in ${day(a.lastSignInAt)}` : ""}` : a.invitePending ? `Invited — link valid until ${day(a.inviteExpires)}` : "Invitation expired — send a new link"}
                </span>
              </span>
              {canWrite && (
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => sendInvite(true)}>
                    New link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await post({ action: a.disabled ? "resume" : "pause", email: a.email }).catch((e) => setError(e.message));
                      load();
                    }}
                  >
                    {a.disabled ? "Resume" : "Pause"}
                  </Button>
                </span>
              )}
            </li>
          ))}
          {v && v.accounts.length === 0 && <li className="py-2.5 text-charcoal">No portal login yet.</li>}
        </ul>
        {v && !v.mail && <p className="mt-3 text-xs text-blueprint">Email isn&apos;t connected (RESEND_API_KEY), so invitations and notifications aren&apos;t emailed — share links on WhatsApp.</p>}
      </section>

      {canWrite && <Publish project={project} onDone={load} post={post} />}

      {/* updates and approvals */}
      <section className="rounded-[var(--radius-md)] border border-graphite/15 p-5">
        <p className="annot text-blueprint">Published to the client</p>
        <ul className="mt-3 divide-y divide-graphite/10 text-sm">
          {v?.updates.map((u) => {
            const ap = u.approval as Rec | undefined;
            return (
              <li key={u.id} className="py-2.5">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{s(u.title)}</span>
                  <span className="text-xs text-charcoal">{day(s(u.createdAt))}</span>
                </div>
                {u.needsApproval === true && (
                  <p className={`mt-1 text-xs ${ap ? (s(ap.status) === "approved" ? "text-good" : "text-bad") : "text-blueprint"}`}>
                    {ap ? `${s(ap.status) === "approved" ? "Approved" : "Changes requested"} by ${s(ap.by)} on ${day(s(ap.at))}${s(ap.comment) ? ` — “${s(ap.comment)}”` : ""}` : "Waiting for the client's approval"}
                  </p>
                )}
              </li>
            );
          })}
          {v && v.updates.length === 0 && <li className="py-2.5 text-charcoal">Nothing published yet.</li>}
        </ul>
      </section>

      {/* tickets */}
      <section className="rounded-[var(--radius-md)] border border-graphite/15 p-5">
        <p className="annot text-blueprint">Client requests</p>
        <ul className="mt-3 space-y-4">
          {v?.tickets.map((t) => (
            <TicketBox key={t.id} t={t} canWrite={canWrite} post={post} onDone={load} />
          ))}
          {v && v.tickets.length === 0 && <li className="text-sm text-charcoal">No requests from the client.</li>}
        </ul>
      </section>
    </div>
  );
}

const TEMPLATES: Record<string, { title: string; body: string; approval: boolean }> = {
  update: { title: "", body: "", approval: false },
  brief: { title: "Please approve your project brief", body: "Here is what we'll capture: the spaces, the number of scenes and the special shots. Approve it, or tell us what to change.", approval: true },
  shoot: { title: "Please confirm your capture date", body: "Proposed capture day: [date] at [time]. Please keep the spaces ready and lit. Approve to confirm, or suggest another date.", approval: true },
  preview: { title: "Your tour preview is ready", body: "Walk through the preview and approve it, or list any corrections (within your included revision rounds).", approval: true },
};

function Publish({ project, onDone, post }: { project: Rec; onDone: () => void; post: (b: Record<string, unknown>) => Promise<Record<string, unknown>> }) {
  const [kind, setKind] = useState("update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(s(project.stagingUrl));
  const [needsApproval, setNeedsApproval] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const pick = (k: string) => {
    setKind(k);
    const t = TEMPLATES[k];
    setTitle(t.title);
    setBody(t.body);
    setNeedsApproval(t.approval);
  };
  return (
    <section className="rounded-[var(--radius-md)] border border-graphite/15 p-5">
      <p className="annot text-blueprint">Publish to the client</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="pt-kind">Type</Label>
          <Select id="pt-kind" value={kind} onChange={(e) => pick(e.target.value)}>
            <option value="update">Progress update</option>
            <option value="brief">Ask to approve the project brief</option>
            <option value="shoot">Ask to confirm the capture date</option>
            <option value="preview">Ask to approve the preview</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="pt-title">Title</Label>
          <Input id="pt-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pt-body">Message</Label>
          <Textarea id="pt-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="pt-preview">Preview link (optional, https://)</Label>
          <Input id="pt-preview" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Checkbox checked={needsApproval} onChange={(e) => setNeedsApproval(e.target.checked)} label="The client must approve or ask for changes" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          disabled={busy || !title.trim()}
          onClick={async () => {
            setBusy(true);
            setMsg("");
            try {
              await post({ action: "publish", title, body, previewUrl, needsApproval, kind });
              setMsg("Published — the client sees it in their portal.");
              pick("update");
              onDone();
            } catch (e) {
              setMsg(e instanceof Error ? e.message : "Could not publish.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Send className="size-4" /> Publish
        </Button>
        {msg && <span className="text-sm text-charcoal">{msg}</span>}
      </div>
    </section>
  );
}

function TicketBox({ t, canWrite, post, onDone }: { t: Ticket; canWrite: boolean; post: (b: Record<string, unknown>) => Promise<Record<string, unknown>>; onDone: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState(t.status);
  const [busy, setBusy] = useState(false);
  return (
    <li className="rounded border border-graphite/10 p-3 text-sm">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="font-medium">
          {t.subject} <span className="text-xs text-charcoal">· {t.kindLabel}</span>
        </span>
        <span className="text-xs uppercase tracking-wider text-blueprint">{t.status}</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {t.messages.map((m, i) => (
          <li key={i} className={`rounded px-2.5 py-1.5 ${m.from === "team" ? "bg-lime/10" : "bg-graphite/[0.04]"}`}>
            <span className="text-xs text-charcoal">
              {m.from === "team" ? m.author : `Client · ${m.author}`} · {day(m.at)}
            </span>
            <p className="whitespace-pre-line">{m.text}</p>
          </li>
        ))}
      </ul>
      {canWrite && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to the client…" className="min-w-0 flex-1" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="w-36">
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
          <Button
            size="sm"
            disabled={busy || (!text.trim() && status === t.status)}
            onClick={async () => {
              setBusy(true);
              await post({ action: "reply", ticket: t.id, text, status }).catch(() => {});
              setText("");
              setBusy(false);
              onDone();
            }}
          >
            Send
          </Button>
        </div>
      )}
    </li>
  );
}

export function PortalLink() {
  return (
    <a href="/portal" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blueprint hover:underline">
      Open the client portal <ExternalLink className="size-3" />
    </a>
  );
}
