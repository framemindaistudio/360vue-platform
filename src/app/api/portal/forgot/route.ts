import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/hq/api";
import { mailReady, sendMail } from "@/lib/hq/mail";
import { INVITE_DAYS, inviteClient, readPortalAccounts } from "@/lib/portal/auth";
import { portalEmail } from "@/lib/portal/data";

/**
 * POST { email } → emails a reset link to an active portal login. Always answers the same way, so it never reveals
 * who has a login. Without email set up, it says to ask 360VUE for a new link.
 */
export async function POST(req: Request) {
  if (!rateLimit(`portal-forgot:${clientIp(req)}`, 5, 30 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  if (!mailReady()) return NextResponse.json({ ok: false, message: "Ask 360VUE on WhatsApp or by phone for a new sign-in link." });
  try {
    const email = String(((await req.json()) as { email?: string }).email ?? "").trim().toLowerCase();
    const a = (await readPortalAccounts(true)).list.find((x) => x.email === email && !x.disabled && x.password);
    if (a) {
      const g = await inviteClient({ email: a.email, name: a.name, clientId: a.clientId, projectId: "", freshLink: true }, `${a.email} (reset)`);
      if (g.url) {
        const text = `Hello ${a.name},\n\nUse the link below to choose a new password for your 360VUE client portal. It works for ${INVITE_DAYS} days. If you did not ask for this, you can ignore this email.`;
        await sendMail({ to: [a.email], subject: "Reset your 360VUE portal password", text: `${text}\n\n${g.url}`, html: portalEmail("Reset your password", text, { href: g.url, label: "Choose a new password" }) });
      }
    }
  } catch (e) {
    console.error("[portal forgot]", e instanceof Error ? e.message : e);
  }
  return NextResponse.json({ ok: true, message: "If that email has a portal login, a reset link is on its way." });
}
