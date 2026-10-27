"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = ["Restaurant / café", "Hotel / resort", "Banquet hall / venue", "Showroom / retail", "Real estate", "Gym / clinic / office", "Other"];
const SERVICES = [
  { id: "tours", label: "360° virtual tour" },
  { id: "spatial", label: "3D / virtual showroom" },
];
const PACKAGES: Record<string, string> = { starter: "Starter Tour", business: "Business Tour", premium: "Premium Experience" };

const field = "mt-1.5 h-12 w-full rounded-xl border border-cream/15 bg-midnight/70 px-4 text-[15px] text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-sunset";
const label = "text-xs font-semibold uppercase tracking-[0.16em] text-sand/70";

/** Get a Quote: lands in HQ → Enquiries through /api/public/submit. */
export function QuoteForm({ pkg }: { pkg?: string }) {
  const [services, setServices] = useState<string[]>(["tours"]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    setState("sending");
    setError("");
    const message = [get("type") && `Business type: ${get("type")}`, pkg && PACKAGES[pkg] && `Interested in: ${PACKAGES[pkg]}`, get("message")].filter(Boolean).join("\n");
    try {
      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "project",
          name: get("name"),
          phone: get("phone"),
          email: get("email"),
          organisation: get("organisation"),
          city: get("city"),
          spaceSize: get("spaceSize"),
          services,
          timeline: get("timeline"),
          message,
          page: "/contact",
          website: get("website"),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-sunset/30 bg-night/80 p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-sunset" />
        <h2 className="mt-5 text-2xl font-semibold text-cream">Thank you — we have it.</h2>
        <p className="mt-2 text-cream/60">We will get back to you with questions about your space and a written scope.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-cream/10 bg-night/80 p-6 sm:p-10" noValidate>
      {/* honeypot: hidden from people */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Your name *</span>
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block">
          <span className={label}>Business name</span>
          <input name="organisation" autoComplete="organization" className={field} />
        </label>
        <label className="block">
          <span className={label}>Phone / WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} placeholder="+91" />
        </label>
        <label className="block">
          <span className={label}>Email</span>
          <input name="email" type="email" autoComplete="email" className={field} />
        </label>
        <label className="block">
          <span className={label}>Type of business</span>
          <select name="type" className={field} defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>City / location</span>
          <input name="city" autoComplete="address-level2" className={field} />
        </label>
        <label className="block">
          <span className={label}>Approximate size</span>
          <input name="spaceSize" className={field} placeholder="e.g. 2,500 sq ft, 3 areas" />
        </label>
        <label className="block">
          <span className={label}>When do you need it?</span>
          <input name="timeline" className={field} placeholder="e.g. before our opening" />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className={label}>What you are interested in</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const on = services.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setServices((v) => (on ? v.filter((x) => x !== s.id) : [...v, s.id]))}
                className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", on ? "border-sunset bg-sunset text-midnight" : "border-cream/20 text-cream/75 hover:border-cream/50")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-cream/45">
          Photography, video, social media or a website? Those come from our parent company,{" "}
          <a href="https://www.framemindaistudio.com" target="_blank" rel="noreferrer" className="text-sunset hover:underline">
            FrameMind AI Studio
          </a>
          . Mention it below and we&apos;ll connect you.
        </p>
      </fieldset>

      <label className="mt-6 block">
        <span className={label}>Tell us about the space</span>
        <textarea name="message" rows={4} className={cn(field, "h-auto py-3")} placeholder="Which areas should customers see? Anything we should know?" />
      </label>

      {error && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-cream/40">We use these details only to reply about your enquiry.</p>
        <button type="submit" disabled={state === "sending"} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-grad px-8 py-3.5 text-sm font-semibold text-midnight disabled:opacity-60">
          {state === "sending" && <Loader2 className="size-4 animate-spin" />} Send enquiry
        </button>
      </div>
    </form>
  );
}
