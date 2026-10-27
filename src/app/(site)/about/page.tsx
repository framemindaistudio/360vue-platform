import type { Metadata } from "next";
import { CtaBand, PageHero, SectionHead } from "@/components/site/bits";
import { ReelCard } from "@/components/site/ReelCard";
import { ParentCompany } from "@/components/site/ParentCompany";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "360VUE (Three-Sixty View) is an immersive-media and virtual-tour brand helping businesses showcase their spaces through interactive 360° experiences.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { t: "Premium", d: "Every frame levelled, lit and checked. Cinematic, never cluttered." },
  { t: "Precise", d: "A written scope, planned viewpoints and the same eight steps every time." },
  { t: "Respectful", d: "Private areas stay private. People are asked, or removed." },
  { t: "Honest", d: "No promised rankings, no invented numbers. What we say is in the quote." },
];

export default function AboutPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "360VUE",
    alternateName: "Three-Sixty View",
    url: site.url,
    slogan: "See Every Angle.",
    founder: site.founders.map((f) => ({ "@type": "Person", name: f.name, jobTitle: f.role })),
    parentOrganization: { "@type": "Organization", name: site.parent.name, url: site.parent.url, founder: { "@type": "Person", name: site.parent.founder } },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero
        eyebrow="About 360VUE"
        title={<>Pronounced <span className="text-gold-grad">Three-Sixty View.</span></>}
        intro="360VUE is an immersive-media and visual technology business. We help businesses present their physical spaces as interactive digital experiences — so customers can explore inside before they visit in person."
        image="/media/keyvisual.webp"
      />

      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="reveal rounded-3xl border border-cream/10 bg-night/70 p-8 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sunset">Mission</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">{site.mission}</p>
          </div>
          <div className="reveal reveal-d1 rounded-3xl border border-cream/10 bg-night/70 p-8 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sunset">Vision</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug text-cream sm:text-3xl">{site.vision}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal relative overflow-hidden rounded-3xl border border-cream/10 bg-black">
            <ReelCard video="/media/logo-reveal.mp4" poster="/media/logo-reveal-poster.jpg" alt="The 360VUE shutter emblem revealed in light" className="aspect-video w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sunset">Our mark</p>
              <p className="mt-2 max-w-xl font-display text-xl font-semibold text-cream sm:text-2xl">A camera shutter, opening — every ribbon a different angle of the same space.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <SectionHead eyebrow="Our approach" title="Capture. Process. Connect. Deliver." intro="We combine careful on-site capture, high-quality image processing, interactive tour creation and dependable delivery, so businesses can present their spaces professionally online." />
          <ul className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <li key={v.t} className="reveal rounded-2xl border border-cream/10 p-6">
                <p className="font-display text-xl font-semibold text-gold-grad">{v.t}</p>
                <p className="mt-2 text-sm text-cream/60">{v.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-cream/10 bg-night/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Founders" title="The people behind the camera." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {site.founders.map((f) => (
              <li key={f.id} className="reveal flex items-center gap-6 rounded-3xl border border-cream/10 bg-midnight/70 p-7">
                <span className="grid size-20 shrink-0 place-items-center rounded-full bg-gold-grad font-display text-2xl font-bold text-midnight">{f.initials}</span>
                <div>
                  <p className="font-display text-2xl font-semibold text-cream">{f.name}</p>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-sunset">{f.role}, 360VUE</p>
                  {f.also && <p className="mt-1 text-sm text-cream/55">{f.also}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ParentCompany />
      <CtaBand />
    </>
  );
}
