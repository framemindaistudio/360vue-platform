import type { Metadata } from "next";
import { CtaBand, PageHero, SectionHead } from "@/components/site/bits";
import { TERMS } from "@/lib/content/catalog";

export const metadata: Metadata = {
  title: "How it works",
  description: "From the first call to a live tour: qualification, proposal, site preparation, 360° capture, processing, tour assembly, quality check and delivery.",
  alternates: { canonical: "/how-it-works" },
};

const PREP = [
  { t: "Lights on", d: "Every light working, blinds set the same way in every room." },
  { t: "Clutter cleared", d: "Bags, boxes, cables and paperwork out of sight." },
  { t: "People informed", d: "Staff and guests know a capture is happening." },
  { t: "Private areas listed", d: "Tell us what not to capture. We never do." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title={<>From first call to a <span className="text-gold-grad">live tour.</span></>} intro="Every project follows the same eight steps, so nothing depends on memory: a unique project ID, a client folder, a signed scope, an invoice record, source files, final exports and a delivery checklist." image="/media/capture-banquet.webp" />

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-gradient-to-b before:from-sunset before:via-bronze before:to-transparent sm:before:left-[35px]">
            {TERMS.process.map((s, i) => (
              <li key={s.title} className="reveal relative flex gap-5 sm:gap-7">
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-sunset/40 bg-midnight font-display text-lg font-bold text-sunset sm:size-[72px] sm:text-2xl">{i + 1}</span>
                <div className="flex-1 rounded-2xl border border-cream/10 bg-night/70 p-6">
                  <h2 className="text-xl font-semibold text-cream">{s.title}</h2>
                  <p className="mt-2 text-cream/60">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-cream/10 bg-night/60 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead eyebrow="Before we arrive" title="Getting your space ready." intro="A few things make the difference between a good tour and a great one." />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {PREP.map((p) => (
                <li key={p.t} className="reveal rounded-2xl border border-cream/10 bg-midnight/70 p-5">
                  <p className="font-semibold text-cream">{p.t}</p>
                  <p className="mt-1.5 text-sm text-cream/55">{p.d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal overflow-hidden rounded-3xl border border-cream/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/capture-cafe.webp" alt="A 360° camera on a monopod in an empty café" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { t: "Delivered", d: "A shareable link and an embed code for your website, plus the exports agreed in the quote." },
            { t: "Published", d: "Help publishing eligible panoramas to Google Street View, under Google's own rules." },
            { t: "Hosted", d: "Kept online for the period on your quote. Renewal is your choice, never automatic." },
          ].map((x) => (
            <div key={x.t} className="reveal rounded-3xl border border-cream/10 p-7">
              <p className="font-display text-2xl font-semibold text-gold-grad">{x.t}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/60">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
