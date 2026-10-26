import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, configuredUsers } from "@/lib/hq/auth";
import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const SERVICES = ["360° Virtual Tours", "Google Maps", "Interior Photography", "Promotional Video", "3D Walkthroughs", "Digital Twins"];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/hq") ? next : "/hq";
  if (await getSession()) redirect(safeNext);
  const usersConfigured = configuredUsers().length > 0;

  return (
    <div className="relative grid min-h-dvh bg-graphite text-paper lg:grid-cols-[1.2fr_1fr]">
      {/* left: the brand */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-paper/10 p-12 lg:flex">
        <Image src="/media/keyvisual.webp" alt="" fill priority sizes="60vw" className="object-cover opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-graphite via-graphite/70 to-transparent" />
        <div className="relative w-52 text-[22px]">
          <Logo variant="wordmark" tone="white" priority />
        </div>
        <div className="relative">
          <p className="annot inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1 text-[10px] text-paper/60">
            <span className="size-1.5 rounded-full bg-lime" /> 360VUE HQ · Internal operations
          </p>
          <h1 className="mt-6 max-w-xl text-6xl font-semibold leading-[1.02] tracking-[-0.035em]">
            See every <span className="text-gold-grad">angle.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/55">
            Enquiries, quotes, capture days, tours, money and papers to sign — one portal, versioned in 360VUE&apos;s private GitHub.
          </p>
        </div>
        <ul className="relative flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <li key={s} className="annot rounded-full border border-paper/12 px-3 py-1 text-[9px] text-paper/45">
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* right: form */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-sm">
          <div className="mx-auto mb-10 w-48 text-[20px] lg:hidden">
            <Logo variant="wordmark" tone="white" priority />
          </div>
          <div className="relative rounded-[var(--radius-lg)] border border-paper/12 bg-paper/[0.03] p-7">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Team sign in</h2>
            <p className="mt-1 text-sm text-paper/55">For the 360VUE team only.</p>
            {usersConfigured ? (
              <LoginForm next={safeNext} />
            ) : (
              <div className="mt-6 rounded border border-warn/40 bg-warn/15 p-4 text-sm text-paper/85">
                <p className="font-semibold">HQ users are not configured yet.</p>
                <p className="mt-1 text-paper/65">
                  Add <code className="font-mono text-xs">HQ_USERS</code> and <code className="font-mono text-xs">HQ_SESSION_SECRET</code> to the environment (Vercel → Settings → Environment Variables). See the README.
                </p>
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center justify-between text-paper/40">
            <span className="annot text-[9px]">{site.tagline}</span>
            <a href={site.website} target="_blank" rel="noreferrer" className="annot text-[9px] hover:text-lime">
              360vue.website ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
