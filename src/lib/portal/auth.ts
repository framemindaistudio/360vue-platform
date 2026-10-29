import "server-only";
import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { store, StoreConflictError } from "@/lib/store";
import { hashPassword, verifyScrypt } from "@/lib/hq/accounts";
import { passwordStamp } from "@/lib/hq/session";
import { site } from "@/lib/site";

/**
 * Client portal logins — a world apart from HQ's staff logins.
 *
 * • Their own file: secure/portal-accounts.json in the private data repository (scrypt hashes and invite-token
 *   hashes only; no HQ screen or API serves it).
 * • Invitation, not a password from us: after an advance is approved, HQ creates the login with a one-time link
 *   (valid 7 days). The client opens it and chooses their own password. The same link mechanism resets a password.
 * • Their own cookie and token audience. An HQ session is never a portal session, and a portal token carries no role.
 * • A client only ever reaches the projects listed on their own login; every portal API checks that on the server.
 */

export const PORTAL_COOKIE = "vue360_portal";
export const PORTAL_TTL_SECONDS = 60 * 60 * 24 * 14;
const AUDIENCE = "vue360-portal";
export const PORTAL_ACCOUNTS_PATH = "secure/portal-accounts.json";
export const INVITE_DAYS = 7;

/** A refusal the person can act on (shown as is, with its HTTP status). */
export class PortalError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export interface PortalAccount {
  /** the sign-in name: the client's email, lower-case */
  email: string;
  name: string;
  clientId: string;
  projectIds: string[];
  /** scrypt hash; empty until the client accepts the invitation */
  password: string;
  /** sha256 of the outstanding invite / reset link token, and when it stops working */
  inviteHash?: string;
  inviteExpires?: string;
  disabled?: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  activatedAt?: string;
  passwordChangedAt?: string;
  lastSignInAt?: string;
}

export interface PortalUser {
  email: string;
  name: string;
  clientId: string;
  projectIds: string[];
}

/* ───────────────────────────── the accounts file ───────────────────────────── */

const KEY = "__vue360PortalAccounts";
const g = globalThis as unknown as Record<string, { at: number; list: PortalAccount[]; sha?: string } | undefined>;

function clean(v: unknown): PortalAccount[] {
  return Array.isArray(v) ? v.filter((a): a is PortalAccount => !!a && typeof a.email === "string" && typeof a.password === "string" && typeof a.clientId === "string" && Array.isArray(a.projectIds)) : [];
}

export async function readPortalAccounts(fresh = false) {
  const c = g[KEY];
  if (!fresh && c && Date.now() - c.at < 20_000) return c;
  const { data, sha } = await store.readJSON<unknown>(PORTAL_ACCOUNTS_PATH, []);
  const next = { at: Date.now(), list: clean(data), sha };
  g[KEY] = next;
  return next;
}

/** Read fresh, change, write with the sha read; one retry if someone else saved in between. */
export async function updatePortalAccounts(change: (list: PortalAccount[]) => PortalAccount[], message: string, author: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { list, sha } = await readPortalAccounts(true);
    const before = JSON.stringify(list);
    const next = change(list.map((a) => ({ ...a, projectIds: [...a.projectIds] })));
    if (JSON.stringify(next) === before) return next;
    try {
      await store.write(PORTAL_ACCOUNTS_PATH, JSON.stringify(next, null, 2) + "\n", message, { sha, author });
      g[KEY] = undefined;
      return next;
    } catch (e) {
      if (e instanceof StoreConflictError && attempt === 0) continue;
      throw e;
    }
  }
  throw new StoreConflictError();
}

/** What HQ screens may show about a portal login (never a hash). */
export const publicAccount = (a: PortalAccount) => ({
  email: a.email,
  name: a.name,
  clientId: a.clientId,
  projectIds: a.projectIds,
  active: !!a.password,
  invitePending: !!a.inviteHash && !!a.inviteExpires && a.inviteExpires > new Date().toISOString(),
  inviteExpires: a.inviteExpires ?? "",
  disabled: !!a.disabled,
  createdAt: a.createdAt,
  createdBy: a.createdBy,
  activatedAt: a.activatedAt ?? "",
  lastSignInAt: a.lastSignInAt ?? "",
});

/* ───────────────────────────── invitations ───────────────────────────── */

const sha = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
export const inviteUrl = (email: string, token: string) => `${site.website}/portal/activate?e=${encodeURIComponent(email)}&t=${token}`;
export const isClientEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Give a client portal access to a project. A new login gets an invitation link; an existing one just gains the
 * project (pass `freshLink` to issue a new link anyway — that is how HQ resends an invite or resets a password).
 * The link token is returned once and stored only as a hash.
 */
export async function inviteClient(o: { email: string; name: string; clientId: string; projectId: string; freshLink?: boolean }, by: string) {
  const email = o.email.trim().toLowerCase();
  if (!isClientEmail(email)) throw new PortalError("Add the client's email address first — it is their sign-in name.");
  const now = new Date();
  let token = "";
  let created = false;
  let active = false;
  await updatePortalAccounts(
    (list) => {
      let a = list.find((x) => x.email === email);
      if (a && a.clientId !== o.clientId) throw new PortalError("That email already signs in for another client.");
      if (!a) {
        created = true;
        a = { email, name: o.name.trim().slice(0, 120) || email, clientId: o.clientId, projectIds: [], password: "", createdAt: now.toISOString(), createdBy: by, updatedAt: now.toISOString() };
        list.push(a);
      }
      if (o.projectId && !a.projectIds.includes(o.projectId)) a.projectIds.push(o.projectId);
      a.disabled = false;
      active = !!a.password;
      if (!active || o.freshLink) {
        token = crypto.randomBytes(24).toString("base64url");
        a.inviteHash = sha(token);
        a.inviteExpires = new Date(now.getTime() + INVITE_DAYS * 86_400_000).toISOString();
      }
      a.updatedAt = now.toISOString();
      return list;
    },
    `Client portal: ${created ? "invite" : "update"} ${email}`,
    by,
  );
  return { email, created, active, url: token ? inviteUrl(email, token) : "" };
}

/** The client accepts an invitation (or reset link) and chooses a password. Returns the account to sign in. */
export async function acceptInvite(emailRaw: string, token: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  if (password.length < 8 || password.length > 128) throw new PortalError("Use 8 to 128 characters.");
  if (!/[a-z]/i.test(password) || !/[0-9]/.test(password)) throw new PortalError("Use letters and at least one number.");
  if (password.toLowerCase().includes(email.split("@")[0])) throw new PortalError("Don't put your email name in your password.");
  let out: PortalAccount | null = null;
  await updatePortalAccounts(
    (list) => {
      const a = list.find((x) => x.email === email);
      const ok = a && a.inviteHash && a.inviteExpires && a.inviteExpires > new Date().toISOString() && crypto.timingSafeEqual(Buffer.from(a.inviteHash), Buffer.from(sha(token)));
      if (!a || !ok) throw new PortalError("This link has expired or was already used. Ask 360VUE for a new one.", 410);
      if (a.disabled) throw new PortalError("This login is paused. Contact 360VUE.", 403);
      const now = new Date().toISOString();
      a.password = hashPassword(password);
      delete a.inviteHash;
      delete a.inviteExpires;
      a.activatedAt = a.activatedAt || now;
      a.passwordChangedAt = now;
      a.lastSignInAt = now;
      a.updatedAt = now;
      out = { ...a };
      return list;
    },
    "Client portal: password set from invitation",
    email,
  );
  return out as unknown as PortalAccount;
}

/** Change a password while signed in. */
export async function changePortalPassword(user: PortalUser, current: string, next: string) {
  const a = (await readPortalAccounts(true)).list.find((x) => x.email === user.email);
  if (!a || !a.password || !verifyScrypt(a.password, current)) throw new PortalError("Your current password is not right.", 401);
  if (next.length < 8 || !/[a-z]/i.test(next) || !/[0-9]/.test(next)) throw new PortalError("Use at least 8 characters with letters and a number.");
  let out: PortalAccount | null = null;
  await updatePortalAccounts(
    (list) => {
      const x = list.find((y) => y.email === user.email)!;
      x.password = hashPassword(next);
      x.passwordChangedAt = x.updatedAt = new Date().toISOString();
      out = { ...x };
      return list;
    },
    "Client portal: password changed",
    user.email,
  );
  return out as unknown as PortalAccount;
}

/* ───────────────────────────── sessions ───────────────────────────── */

function key() {
  const s = process.env.HQ_SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "vue360-dev-only-secret-change-me-please-32+chars" : "");
  if (s.length < 32) throw new Error("HQ_SESSION_SECRET is not set (min 32 characters).");
  return new TextEncoder().encode(s);
}

export async function signPortalSession(a: PortalAccount) {
  return new SignJWT({ kind: "portal", pv: await passwordStamp(a.password) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(a.email)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${PORTAL_TTL_SECONDS}s`)
    .sign(key());
}

/** The signed-in client, re-checked against the accounts file (a paused login or a new password ends the session). */
export async function getPortalUser(): Promise<PortalUser | null> {
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], audience: AUDIENCE });
    if (payload.kind !== "portal" || !payload.sub) return null;
    const find = async (fresh: boolean) => (await readPortalAccounts(fresh)).list.find((x) => x.email === payload.sub);
    let a = await find(false);
    if (!a || !a.password || (await passwordStamp(a.password)) !== payload.pv) a = await find(true);
    if (!a || a.disabled || !a.password || (await passwordStamp(a.password)) !== payload.pv) return null;
    return { email: a.email, name: a.name, clientId: a.clientId, projectIds: a.projectIds };
  } catch {
    return null;
  }
}

/** For portal route handlers: the client, or a 401. */
export async function portalApiUser(): Promise<{ user: PortalUser; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const user = await getPortalUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  return { user };
}

export async function authenticatePortal(email: string, password: string): Promise<PortalAccount | null> {
  const a = (await readPortalAccounts(true)).list.find((x) => x.email === email.trim().toLowerCase());
  if (!a || !a.password) {
    verifyScrypt("scrypt:" + "0".repeat(32) + ":" + "0".repeat(64), password); // even out timing
    return null;
  }
  if (a.disabled || !verifyScrypt(a.password, password)) return null;
  return a;
}

export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: PORTAL_TTL_SECONDS };
