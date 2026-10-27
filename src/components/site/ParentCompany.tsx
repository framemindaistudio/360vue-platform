import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/site/bits";
import { site } from "@/lib/site";

/**
 * FrameMind AI Studio, 360VUE's parent company: who it is, who founded it, and the services it delivers in-house.
 * The list is a summary; FrameMind's own website is the accurate source, so every mention links there.
 */
export function ParentCompany({ id = "framemind" }: { id?: string }) {
  const p = site.parent;
  return (
    <section id={id} className="scroll-mt-24 border-t border-cream/10 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl border border-cream/10 bg-night/80 p-7 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 size-[380px] rounded-full bg-sunset/10 blur-[110px]" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <Eyebrow>Parent company</Eyebrow>
              <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] text-cream sm:text-4xl">
                360VUE is a <span className="text-gold-grad">{p.name}</span> company.
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-cream/65">
                {p.name} is our parent company, founded by {p.founder}, who is also a co-founder of 360VUE. 360VUE focuses on 360° virtual tours and
                immersive experiences. Photography, videography, social media management, websites, software, automations and FrameMind&apos;s other
                services are delivered in-house by {p.name}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={p.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-gold-grad px-6 py-3 text-sm font-semibold text-midnight">
                  Visit {p.name} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </a>
                <a href={p.pricingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream hover:border-sunset hover:text-sunset">
                  Services &amp; pricing <ArrowUpRight className="size-4" aria-hidden />
                </a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand/60">Delivered in-house by {p.name}</p>
              <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 sm:grid-cols-2">
                {p.services.map((s) => (
                  <li key={s.name} className="bg-midnight/90 px-5 py-4">
                    <p className="font-semibold text-cream">{s.name}</p>
                    <p className="mt-0.5 text-sm text-cream/55">{s.line}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-cream/45">
                For the full, current list of services and prices, see{" "}
                <a href={p.url} target="_blank" rel="noreferrer" className="text-sunset hover:underline">
                  framemindaistudio.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
