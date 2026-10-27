import Link from "next/link";
import { Check } from "lucide-react";
import { publicRateCard } from "@/lib/public-rates";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const price = (p: number, upTo?: number) => (upTo && upTo > p ? `${formatINR(p)}–${formatINR(upTo)}` : `${formatINR(p)}+`);

/** What each package typically includes, from the profile's scope column. */
const SCOPE: Record<string, string[]> = {
  starter: ["Small space", "Basic interactive tour", "Shareable link"],
  business: ["Multiple viewpoints", "Navigation between viewpoints", "Web-ready delivery and embed code"],
  premium: ["Larger space", "Custom hotspots", "Photography or video with FrameMind AI Studio"],
};

/** The three tour packages, read from HQ's rate card (the founders change prices there). */
export async function Packages({ compact = false }: { compact?: boolean }) {
  const rates = await publicRateCard();
  const tours = rates.services.find((s) => s.id === "tours");
  const pkgs = tours?.groups.find((g) => g.id === "package")?.options ?? [];
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3">
        {pkgs.map((p, i) => {
          const featured = !!p.badge;
          return (
            <article
              key={p.id}
              className={cn(
                "reveal relative flex flex-col overflow-hidden rounded-3xl border p-7 sm:p-8",
                `reveal-d${i + 1}`,
                featured ? "border-sunset/50 bg-gradient-to-b from-bronze/30 via-night to-night shadow-[0_30px_80px_-30px_rgba(245,158,76,0.45)]" : "border-cream/10 bg-night/80",
              )}
            >
              {featured && <span className="absolute right-6 top-6 rounded-full bg-gold-grad px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-midnight">{p.badge}</span>}
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sand/70">Package {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-2xl font-semibold text-cream">{p.label}</h3>
              <p className="mt-2 text-sm text-cream/55">{p.detail}</p>
              <p className="mt-6 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl">{price(p.price, p.upTo)}</p>
              <p className="mt-1 text-xs text-cream/45">Indicative · before GST</p>
              {!compact && (
                <ul className="mt-6 space-y-2.5 text-sm text-cream/75">
                  {(SCOPE[p.id] ?? []).map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/contact?package=${p.id}`}
                className={cn("mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5", featured ? "bg-gold-grad text-midnight" : "border border-cream/20 text-cream hover:border-sunset hover:text-sunset")}
              >
                Get a quote
              </Link>
            </article>
          );
        })}
      </div>
      <p className="reveal mt-6 text-center text-xs leading-relaxed text-cream/45">
        Proposed launch prices. Every quote states the viewpoints and areas included, branding, embedding and Google publishing help, hosting duration, revision rounds, travel and timeline.
      </p>
    </div>
  );
}
