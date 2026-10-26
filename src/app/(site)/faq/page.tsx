import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/site/bits";
import { FAQS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Hosting, Google Maps, privacy, turnaround and pricing — answers about 360VUE virtual tours.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const groups = [...new Set(FAQS.map((f) => f.group))];
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="FAQs" title={<>Straight <span className="text-gold-grad">answers.</span></>} intro="Hosting, Google Maps, privacy, turnaround and pricing. If your question is not here, ask us — we reply to every message." />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl space-y-14 px-4 sm:px-6 lg:px-8">
          {groups.map((g) => (
            <div key={g}>
              <h2 className="reveal text-[11px] font-semibold uppercase tracking-[0.3em] text-sunset">{g}</h2>
              <div className="mt-4 divide-y divide-cream/10 border-y border-cream/10">
                {FAQS.filter((f) => f.group === g).map((f) => (
                  <details key={f.q} className="reveal group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-cream">
                      {f.q}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-cream/20 text-sunset transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-cream/65">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
