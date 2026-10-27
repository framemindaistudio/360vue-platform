import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Packages } from "@/components/site/Packages";
import { ParentCompany } from "@/components/site/ParentCompany";
import { site } from "@/lib/site";
import { CtaBand, PageHero, SectionHead } from "@/components/site/bits";
import { DIVISIONS } from "@/lib/site-content";
import { publicRateCard } from "@/lib/public-rates";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services & packages",
  description: "360° virtual tours, Google Street View publishing help, interactive floor plans and 3D experiences. Starter, Business and Premium tour packages.",
  alternates: { canonical: "/services" },
};
export const revalidate = 600;

export default async function ServicesPage() {
  const rates = await publicRateCard();
  const tours = rates.services.find((s) => s.id === "tours");
  const addons = (tours?.groups ?? []).filter((g) => g.id !== "package");
  return (
    <>
      <PageHero eyebrow="Services" title={<>One visit. <span className="text-gold-grad">Every angle.</span></>} intro="Tours come first, with immersive 3D work built around them. Photography, video and social media come from our parent company, FrameMind AI Studio, so one team can cover your website, your Maps listing and your social media." image="/media/camera.webp" />

      {DIVISIONS.map((d, i) => (
        <section key={d.id} id={d.id} className="scroll-mt-20 border-t border-cream/10 py-20 sm:py-28">
          <div className={`mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="reveal overflow-hidden rounded-3xl border border-cream/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${d.image}.webp`} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover sm:aspect-[4/3]" />
            </div>
            <div>
              <SectionHead eyebrow={`${d.name} · ${d.tag}`} title={d.title} />
              <ul className="reveal mt-8 space-y-3.5">
                {d.points.map((p) => (
                  <li key={p} className="flex gap-3 text-cream/75">
                    <Check className="mt-1 size-4 shrink-0 text-sunset" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              {d.id === "visuals" && (
                <p className="reveal mt-6 rounded-2xl border border-sunset/25 bg-sunset/5 px-5 py-4 text-sm leading-relaxed text-cream/70">
                  Photography, videography and social media are delivered in-house by our parent company,{" "}
                  <a href={site.parent.url} target="_blank" rel="noreferrer" className="font-semibold text-sunset hover:underline">
                    {site.parent.name}
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </section>
      ))}

      <section id="packages" className="scroll-mt-20 border-t border-cream/10 bg-night/60 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Tour packages" title="Starter, Business or Premium." intro="Proposed launch prices to validate with our first clients. Your quote states the exact scope." />
          <div className="mt-14">
            <Packages />
          </div>

          {addons.length > 0 && (
            <div className="mt-20 grid gap-6 lg:grid-cols-2">
              {addons.map((g) => (
                <div key={g.id} className="reveal rounded-3xl border border-cream/10 bg-midnight/70 p-7">
                  <h3 className="text-lg font-semibold text-cream">{g.title}</h3>
                  <ul className="mt-5 divide-y divide-cream/10">
                    {g.options.map((o) => (
                      <li key={o.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                        <span>
                          <span className="text-cream/85">{o.label}</span>
                          {o.detail && <span className="mt-0.5 block text-xs text-cream/45">{o.detail}</span>}
                        </span>
                        <span className="shrink-0 font-mono text-cream/70">
                          {o.price ? `from ${formatINR(o.price)}${o.unit ?? ""}` : "Included"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <p className="mt-6 text-center text-xs text-cream/40">All prices in Indian rupees, before GST. 3D work is quoted after a short call. Photography and video are quoted by FrameMind AI Studio.</p>
        </div>
      </section>

      <section className="border-t border-cream/10 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { t: "50% advance", d: "confirms the booking and the capture date." },
            { t: "50% before handover", d: "or activation, as agreed in the quote." },
            { t: "Hosting, written down", d: "its duration and any renewal are on the quote — never assumed." },
          ].map((x) => (
            <div key={x.t} className="reveal rounded-2xl border border-cream/10 p-6">
              <p className="font-display text-xl font-semibold text-gold-grad">{x.t}</p>
              <p className="mt-2 text-sm text-cream/60">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <ParentCompany />
      <CtaBand />
    </>
  );
}
