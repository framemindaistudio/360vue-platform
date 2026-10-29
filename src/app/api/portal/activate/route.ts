import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/hq/api";
import { acceptInvite, cookieOptions, PORTAL_COOKIE, PortalError, signPortalSession } from "@/lib/portal/auth";

/** POST { email, token, password } → the client accepts their invitation (or reset link), chooses a password and is signed in. */
export async function POST(req: Request) {
  if (!rateLimit(`portal-activate:${clientIp(req)}`, 10, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
  try {
    const body = (await req.json()) as { email?: string; token?: string; password?: string };
    const a = await acceptInvite(String(body.email ?? ""), String(body.token ?? ""), String(body.password ?? ""));
    const res = NextResponse.json({ ok: true });
    res.cookies.set(PORTAL_COOKIE, await signPortalSession(a), cookieOptions);
    return res;
  } catch (e) {
    if (e instanceof PortalError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[portal activate]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
