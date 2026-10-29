import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { publicRateCard } from "@/lib/public-rates";
import { taxNote } from "@/lib/tax";
import { cn } from "@/lib/utils";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** The tour plans, read from HQ's rate card (the founders change prices there). Each links into the configurator. */
export async function Packages() {
  const rates = await publicRateCard();
  const tours = rates.services.find((s) => s.id === "tours");
  const plans = [...(tours?.groups.find((g) => g.id === "package")?.options ?? [])].sort((a, b) => (a.scenes ?? 0) - (b.scenes ?? 0));
  const extra = tours?.groups.flatMap((g) => g.options).find((o) => o.id === "extra-scene");
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((p, i) => {
          const featured = !!p.badge;
          const [scope, fit] = (p.detail ?? "").split(" · ");
          return (
            <article
              key={p.id}
              className={cn(
                "reveal relative flex flex-col overflow-hidden rounded-3xl border p-6 sm:p-7",
                `reveal-d${(i % 3) + 1}`,
                featured ? "border-sunset/50 bg-gradient-to-b from-bronze/30 via-night to-night shadow-[0_30px_80px_-30px_rgba(245,158,76,0.45)]" : "border-cream/10 bg-night/80",
              )}
            >
              {featured && <span className="absolute right-5 top-5 rounded-full bg-gold-grad px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-midnight">{p.badge}</span>}
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sand/70">{scope || `Plan ${i + 1}`}</p>
              <h3 className="mt-3 text-2xl font-semibold text-cream">{p.label}</h3>
              <p className="mt-5 font-display text-3xl font-bold tracking-tight text-cream">{inr(p.price)}</p>
              <p className="mt-1 text-xs text-cream/45">One-time · {taxNote(rates.gstOn)}</p>
              {fit && <p className="mt-4 text-sm leading-relaxed text-cream/60">{fit}</p>}
              <ul className="mt-5 space-y-2 text-sm text-cream/75">
                {["Google Maps publishing", "12 months hosting", "Link + website embed"].map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {x}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={cn("mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5", featured ? "bg-gold-grad text-midnight" : "border border-cream/20 text-cream hover:border-sunset hover:text-sunset")}
              >
                Price my space <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
      <p className="reveal mt-6 text-center text-xs leading-relaxed text-cream/45">
        Priced by scenes — one scene is one 360° viewpoint.{extra ? ` Bigger spaces add scenes at ${inr(extra.price)} each.` : ""} Enter your area, floors and rooms in the{" "}
        <Link href="/pricing" className="text-sunset hover:underline">
          price calculator
        </Link>{" "}
        for your exact quote.
      </p>
    </div>
  );
}
