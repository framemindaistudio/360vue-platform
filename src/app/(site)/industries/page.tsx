import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaBand, PageHero, SiteIcon } from "@/components/site/bits";
import { INDUSTRIES } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Industries",
  description: "Virtual tours for restaurants and cafés, hotels and resorts, banquet halls, showrooms, real estate, gyms, clinics and offices.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={<>Where the space <span className="text-gold-grad">is the decision.</span></>}
        intro="We work with businesses whose physical environment matters when a customer chooses: an attractive, well-kept space, customers who visit in person, and several rooms or areas worth exploring."
        image="/media/hotel.webp"
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-24 sm:px-6 lg:px-8">
        {INDUSTRIES.map((ind, i) => (
          <section key={ind.id} id={ind.id} className="reveal scroll-mt-24 overflow-hidden rounded-3xl border border-cream/10 bg-night/70">
            <div className={`grid lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="relative min-h-[260px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ind.image}.webp`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl border border-sunset/30 bg-sunset/10">
                    <SiteIcon name={ind.icon} className="size-5 text-sunset" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sand/60">Priority · {ind.priority}</span>
                </div>
                <h2 className="mt-6 text-3xl font-semibold text-cream sm:text-4xl">{ind.name}</h2>
                <p className="mt-3 text-cream/65">{ind.short}</p>
                <ul className="mt-7 space-y-3">
                  {ind.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-cream/75">
                      <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
        <p className="text-center text-xs text-cream/40">Photographs are illustrative spaces, not client work.</p>
        <p className="reveal pt-6 text-center text-sm text-cream/60">
          Homestays, schools, hospitals, layouts, coworking, attractions and more —{" "}
          <Link href="/features#who" className="font-semibold text-sunset hover:underline">see all 12 kinds of business we work with, and the features each one uses</Link>.
        </p>
      </div>
      <CtaBand />
    </>
  );
}
