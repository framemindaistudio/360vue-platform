import { NextResponse } from "next/server";
import { apiError, rateLimit } from "@/lib/hq/api";
import { changePortalPassword, cookieOptions, PORTAL_COOKIE, portalApiUser, signPortalSession } from "@/lib/portal/auth";
import { openTicket, PortalError, portalHome, replyToTicket, respondToUpdate } from "@/lib/portal/data";

/**
 * The client portal's data — only the signed-in client's own projects, invoices and tickets, decided on the server.
 * GET → everything for the dashboard · POST { action } → respond | ticket | reply | password
 */
export async function GET() {
  const { user, error } = await portalApiUser();
  if (error) return error;
  try {
    return NextResponse.json(await portalHome(user), { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  const { user, error } = await portalApiUser();
  if (error) return error;
  if (!rateLimit(`portal:${user.email}`, 60, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests — try again in a few minutes." }, { status: 429 });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    switch (body.action) {
      case "respond":
        await respondToUpdate(user, String(body.id ?? ""), body.decision === "approved" ? "approved" : "changes", String(body.comment ?? ""));
        return NextResponse.json({ ok: true });
      case "ticket":
        return NextResponse.json({ ticket: await openTicket(user, { projectId: String(body.projectId ?? ""), kind: String(body.kind ?? ""), subject: String(body.subject ?? ""), text: String(body.text ?? "") }) });
      case "reply":
        await replyToTicket(user, String(body.id ?? ""), String(body.text ?? ""));
        return NextResponse.json({ ok: true });
      case "password": {
        const a = await changePortalPassword(user, String(body.current ?? ""), String(body.next ?? ""));
        const res = NextResponse.json({ ok: true });
        // a new password ends other sessions; keep this one signed in
        res.cookies.set(PORTAL_COOKIE, await signPortalSession(a), cookieOptions);
        return res;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return fail(e);
  }
}

function fail(e: unknown) {
  if (e instanceof PortalError) return NextResponse.json({ error: e.message }, { status: e.status });
  return apiError(e);
}
