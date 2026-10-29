"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/** The page an invitation (or password-reset) link opens: the client chooses their own password and is signed in. */
export function ActivateForm() {
  const q = useSearchParams();
  const router = useRouter();
  const email = q.get("e") || "";
  const token = q.get("t") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      const res = await fetch("/api/portal/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, token, password }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Could not set your password.");
      router.replace("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set your password.");
      setBusy(false);
    }
  }

  const input = "mt-1.5 w-full rounded-xl border border-cream/15 bg-night px-4 py-3 text-cream outline-none focus:border-sunset";
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-cream/10 bg-night/80 p-8">
        <div className="text-[22px]">
          <Logo tone="white" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Set your password</h1>
        {!email || !token ? (
          <p className="mt-3 text-sm text-cream/65">This link is incomplete. Open the full link from your invitation, or ask 360VUE for a new one.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-cream/60">
              Welcome to your 360VUE client portal. You&apos;ll sign in as <strong className="text-cream">{email}</strong>.
            </p>
            <label className="mt-6 block text-sm">
              New password
              <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            </label>
            <label className="mt-4 block text-sm">
              Type it again
              <input type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
            </label>
            <p className="mt-2 text-xs text-cream/45">At least 8 characters, with letters and a number.</p>
            {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-6 py-3.5 font-semibold text-midnight disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Set password and open my portal
            </button>
          </>
        )}
      </form>
    </main>
  );
}
