import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CtaBand, GhostButton, GoldButton, PageHero, SiteIcon } from "@/components/site/bits";
import { INDUSTRIES } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Industries — who a 360° virtual tour is for",
  description:
    "360° virtual tours for homestays and resorts, hotels, restaurants, wedding venues, real-estate developers, plotted layouts, showrooms, schools, hospitals, gyms, offices and tourism — and the features each one uses.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={<>If customers need to <span className="text-gold-grad">see it to choose it,</span> a tour pays off.</>}
        intro="Twelve kinds of business we work with — what each one shows in its tour, and the features it uses most."
        image="/media/hotel.webp"
      />

      {/* quick jump: every industry on one line */}
      <nav aria-label="Industries" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <li key={ind.id}>
              <a href={`#${ind.id}`} className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-3.5 py-2 text-xs font-medium text-cream/75 transition-colors hover:border-sunset hover:text-sunset">
                <SiteIcon name={ind.icon} className="size-4 text-sunset" />
                {ind.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {INDUSTRIES.map((ind, i) => (
          <article key={ind.id} id={ind.id} className={`reveal reveal-d${(i % 3) + 1} flex scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-cream/10 bg-night/70`}>
            <div className="relative aspect-[16/10]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ind.image}-sm.webp`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
              <span className="absolute bottom-4 left-5 grid size-11 place-items-center rounded-2xl border border-sunset/40 bg-midnight/80 backdrop-blur">
                <SiteIcon name={ind.icon} className="size-5 text-sunset" />
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-semibold text-cream">{ind.name}</h2>
              <p className="mt-1.5 text-sm font-medium text-sand">{ind.hook}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">{ind.shows}</p>
              <p className="mt-5 border-t border-cream/10 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/40">Features they use most</p>
              <ul className="mt-3 space-y-2">
                {ind.uses.map((u) => (
                  <li key={u} className="flex gap-2 text-[13px] text-cream/75">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-sunset" aria-hidden /> {u}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-cream/60">Not on the list? If your space helps people decide, it is a fit.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <GoldButton href="/pricing">Price your space</GoldButton>
          <GhostButton href="/features">See every feature</GhostButton>
        </div>
        <p className="mt-8 text-xs text-cream/40">Photographs are illustrative spaces, not client work.</p>
      </div>
      <CtaBand />
    </>
  );
}
