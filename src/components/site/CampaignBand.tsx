import Link from "next/link";
import { ArrowRight, BadgePercent, CalendarClock, Users } from "lucide-react";
import { discountOf, type PublicCampaign } from "@/lib/campaigns";
import type { PublicRates } from "@/lib/public-rates";
import { taxNote } from "@/lib/tax";
import { SERVICES } from "@/lib/content/catalog";

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

/** The lowest one-time plan price among the campaign's services, before and after the campaign discount. */
export function campaignFromPrice(c: PublicCampaign, rates: PublicRates) {
  const prices = c.serviceIds.flatMap((id) => rates.services.find((s) => s.id === id)?.groups.find((g) => g.id === "package")?.options.map((o) => o.price) ?? []).filter((p) => p > 0);
  if (!prices.length) return null;
  const was = Math.min(...prices);
  return { was, now: Math.round((was - discountOf(was, c.percent)) * 100) / 100 };
}

const covers = (c: PublicCampaign) =>
  c.serviceIds
    .map((id) => (id === "tours" ? "360° tour plans and add-ons" : (SERVICES.find((s) => s.id === id)?.name ?? id)))
    .join(", ");

/**
 * The live campaign (e.g. Founding 100) as a band on the home and pricing pages: the offer, the slots left (counted
 * from approved advances in HQ) and the from-price after the discount. Says plainly when every slot is taken.
 */
export function CampaignBand({ c, rates, compact = false }: { c: PublicCampaign; rates: PublicRates; compact?: boolean }) {
  const price = campaignFromPrice(c, rates);
  const pct = c.total ? Math.min(100, Math.round((c.used / c.total) * 100)) : 0;
  if (c.full) {
    return (
      <section className="border-y border-cream/10 bg-night/70 py-8">
        <p className="mx-auto max-w-3xl px-4 text-center text-sm text-cream/70">
          <span className="font-semibold text-sunset">{c.name}</span> is full — all {c.total} slots are taken. Thank you! Regular prices apply from here.
        </p>
      </section>
    );
  }
  return (
    <section aria-labelledby={`campaign-${c.id}`} className={`relative isolate overflow-hidden border-y border-sunset/25 bg-gradient-to-br from-bronze/25 via-night to-midnight ${compact ? "py-10" : "py-16 sm:py-20"}`}>
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[420px] rounded-full bg-sunset/15 blur-[120px]" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sunset">Exclusive launch campaign</p>
          <h2 id={`campaign-${c.id}`} className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-cream sm:text-6xl">
            {c.name} <span className="block text-gold-grad">{c.percent}% off</span>
          </h2>
          {(c.headline || c.tagline) && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/75">
              {c.headline}
              {c.headline && c.tagline ? " " : ""}
              {c.tagline}
            </p>
          )}
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5 text-cream/80">
              <Users className="size-5 shrink-0 text-sunset" aria-hidden /> First {c.total} projects only
            </li>
            <li className="flex items-center gap-2.5 text-cream/80">
              <BadgePercent className="size-5 shrink-0 text-sunset" aria-hidden /> {c.percent}% off {covers(c)}
            </li>
            <li className="flex items-center gap-2.5 text-cream/80">
              <CalendarClock className="size-5 shrink-0 text-sunset" aria-hidden /> {c.endDate ? `Until ${new Date(c.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} or the slots fill` : "Until all slots are filled"}
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-gold-grad px-7 py-3.5 text-sm font-semibold text-midnight shadow-[0_12px_40px_-10px_rgba(245,158,76,0.7)]">
              Claim your slot <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href={`/offers/${c.slug}`} className="inline-flex items-center rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream hover:border-sunset hover:text-sunset">
              Offer details
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-cream/15 bg-midnight/70 p-7 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/70">Slots left</p>
          <p className="mt-2 font-display text-6xl font-bold tabular text-cream">
            {c.left}
            <span className="text-2xl font-semibold text-cream/40"> / {c.total}</span>
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-cream/10" role="progressbar" aria-valuenow={c.used} aria-valuemin={0} aria-valuemax={c.total} aria-label={`${c.used} of ${c.total} slots taken`}>
            <div className="h-full rounded-full bg-gold-grad" style={{ width: `${Math.max(pct, 2)}%` }} />
          </div>
          <p className="mt-2 text-xs text-cream/45">Counted live as advances are confirmed.</p>
          {price && (
            <div className="mt-6 border-t border-cream/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/70">Tours starting from</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <span className="text-lg text-cream/40 line-through">{inr(price.was)}</span>
                <span className="font-display text-4xl font-bold text-gold-grad">{inr(price.now)}</span>
              </p>
              <p className="mt-1 text-xs text-cream/45">{taxNote(rates.gstOn)} · after {c.percent}% off</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
