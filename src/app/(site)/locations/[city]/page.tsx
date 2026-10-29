import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Plane, Rotate3d, ShieldCheck } from "lucide-react";
import { CtaBand, Eyebrow, GhostButton, GoldButton, SectionHead } from "@/components/site/bits";
import { CITIES, cityBySlug, stateOf } from "@/lib/locations";
import { publicRateCard } from "@/lib/public-rates";
import { SERVICES, SKYVUE_LAUNCH } from "@/lib/content/catalog";
import { site } from "@/lib/site";
import { ORG_ID, ldScript } from "@/lib/seo";
import { taxNote } from "@/lib/tax";

export const revalidate = 600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const c = cityBySlug((await params).city);
  if (!c) return {};
  const state = stateOf(c);
  const rates = await publicRateCard();
  const tourFrom = Math.min(...(rates.services.find((s) => s.id === "tours")?.groups.find((g) => g.id === "package")?.options.map((o) => o.price) ?? [0]));
  return {
    title: `360° Virtual Tours in ${c.name} — Drone 360`,
    description: `360° virtual tours, drone 360° aerial views and Google Maps publishing in ${c.name}, ${state.name}. From ${inr(tourFrom)}. Get your price online.`,
    keywords: [`360 virtual tour ${c.name}`, `virtual tour ${c.name}`, `360 degree tour ${c.name}`, `drone 360 ${c.name}`, `google street view ${c.name}`, ...(c.aka ?? []).map((a) => `360 virtual tour ${a}`)],
    alternates: { canonical: `/locations/${c.slug}` },
    openGraph: { title: `360° Virtual Tours in ${c.name} | 360VUE`, url: `/locations/${c.slug}` },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const c = cityBySlug((await params).city);
  if (!c) notFound();
  const state = stateOf(c);
  const rates = await publicRateCard();
  const from = (id: string) => Math.min(...(rates.services.find((s) => s.id === id)?.groups.find((g) => g.id === "package")?.options.map((o) => o.price) ?? [0]));
  const tourFrom = from("tours");
  const skyFrom = from("aerial");
  const tourDays = SERVICES.find((s) => s.id === "tours")?.included.find((x) => /working days/.test(x))?.match(/(\d+–\d+) working days/)?.[1] ?? "5–7";
  const nearby = c.nearby.map((s) => CITIES.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => !!x);
  const also = c.aka?.length ? ` (${c.aka.join(", ")})` : "";

  const faqs = [
    { q: `Do you make 360° virtual tours in ${c.name}?`, a: `Yes. 360VUE captures 360° virtual tours and SkyVUE drone 360° views across ${state.name}, including ${c.name}${also}. We come to you; travel and stay outside our base area are billed at actual cost and shown on your quote before you book.` },
    { q: `How much does a 360° virtual tour cost in ${c.name}?`, a: `Tours start at ${inr(tourFrom)} (${rates.gstOn ? "before GST" : "no GST is charged"}) for up to 6 scenes, which suits a café, clinic or boutique; larger spaces are priced by the number of scenes. SkyVUE aerial 360° starts at ${inr(skyFrom)}. Google Maps publishing and 12 months of hosting are included. Use the price calculator for your exact quote.` },
    { q: `Can you fly a drone for an aerial 360° in ${c.name}?`, a: `${c.airspace} Flights follow India's Drone Rules, 2021, and the date depends on safe weather.` },
    { q: "Will my tour show on Google Maps?", a: "We publish eligible 360° photos to Google Maps and Street View for your business listing as part of every plan. Google decides what it accepts and shows, so we cannot promise search rankings." },
    { q: "How long does it take?", a: `Usually one capture visit, and your tour is live in ${tourDays} working days after it. Express delivery within 72 hours is available.` },
  ];

  const url = `${site.url}/locations/${c.slug}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: `360° virtual tours in ${c.name}`,
      serviceType: "360° virtual tour",
      provider: { "@id": ORG_ID },
      areaServed: { "@type": "City", name: c.name, alternateName: c.aka, containedInPlace: { "@type": "State", name: state.name } },
      offers: [
        { "@type": "Offer", name: "360° virtual tour", priceCurrency: "INR", price: tourFrom, priceSpecification: { "@type": "PriceSpecification", minPrice: tourFrom, priceCurrency: "INR", valueAddedTaxIncluded: !rates.gstOn } },
        { "@type": "Offer", name: "SkyVUE aerial 360°", priceCurrency: "INR", price: skyFrom, priceSpecification: { "@type": "PriceSpecification", minPrice: skyFrom, priceCurrency: "INR", valueAddedTaxIncluded: !rates.gstOn } },
      ],
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Locations", item: `${site.url}/locations` },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />

      {/* hero */}
      <section className="relative isolate overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/keyvisual-sm.webp" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/60 via-midnight/85 to-midnight" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-cream/50">
            <Link href="/" className="hover:text-sunset">Home</Link> <span aria-hidden>/</span> <Link href="/locations" className="hover:text-sunset">Locations</Link> <span aria-hidden>/</span> <span className="text-cream/80">{c.name}</span>
          </nav>
          <Eyebrow className="mt-6">
            {state.name} · <span lang={state.lang}>{c.local}</span>
          </Eyebrow>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] text-cream sm:text-6xl">
            360° Virtual Tours in <span className="text-gold-grad">{c.name}</span>
          </h1>
          {c.aka?.length ? <p className="mt-3 text-sm text-cream/45">Also searched as {c.aka.join(", ")}</p> : null}
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-cream/70 sm:text-lg">{c.intro}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <GoldButton href="/pricing">Price your tour</GoldButton>
            <GhostButton href="/skyvue">See SkyVUE aerial</GhostButton>
          </div>
        </div>
      </section>

      {/* what we do here */}
      <section className="border-t border-cream/10 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow={`What we do in ${c.name}`} title="Let customers look inside — and see where you are." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              { Icon: Rotate3d, t: "360° virtual tour", p: `from ${inr(tourFrom)}`, d: "Every room in 360°, arrows to walk through, a contact panel with your phone and email, published on Google Maps and shared as one link.", href: "/services" },
              { Icon: Plane, t: "SkyVUE aerial 360°", p: `from ${inr(skyFrom)} · flights from ${SKYVUE_LAUNCH}`, d: c.sky, href: "/skyvue" },
              { Icon: MapPin, t: "Tour + SkyVUE in one link", p: "linking included", d: "Start from the sky with landmarks and distances labelled, tap a building and walk inside — one link to share.", href: "/pricing?need=both" },
            ].map(({ Icon, t, p, d, href }) => (
              <Link key={t} href={href} className="reveal group flex flex-col rounded-3xl border border-cream/10 bg-night/70 p-7 transition-colors hover:border-sunset/50">
                <Icon className="size-7 text-sunset" strokeWidth={1.5} aria-hidden />
                <h2 className="mt-5 text-xl font-semibold text-cream">{t}</h2>
                <p className="mt-1 text-sm font-semibold text-sunset">{p} <span className="font-normal text-cream/40">· {taxNote(rates.gstOn)}</span></p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/65">{d}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cream/80 group-hover:text-sunset">
                  Learn more <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* who it suits */}
      <section className="border-t border-cream/10 bg-night/60 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead eyebrow={`Made for ${c.name}`} title={`The spaces in ${c.name} that sell better in 360°`} />
            <ul className="reveal mt-8 space-y-3">
              {c.fits.map((f) => (
                <li key={f} className="flex gap-3 text-cream/80">
                  <Check className="mt-1 size-4 shrink-0 text-sunset" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Link href="/industries" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sunset hover:underline">
              See every industry we serve <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="reveal self-start rounded-3xl border border-sunset/30 bg-sunset/[0.06] p-7">
            <ShieldCheck className="size-7 text-sunset" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-4 text-lg font-semibold text-cream">Drone flights in {c.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">{c.airspace}</p>
            <p className="mt-3 text-xs leading-relaxed text-cream/45">We follow India&apos;s Drone Rules, 2021. Ground tours need no permission beyond yours.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-cream/10 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Questions" title={`360° tours in ${c.name}: quick answers`} />
          <div className="mt-10 divide-y divide-cream/10 border-y border-cream/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-cream">
                  <h3 className="text-base">{f.q}</h3>
                  <span className="mt-0.5 text-sunset transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cream/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* nearby */}
      <section className="border-t border-cream/10 bg-night/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/70">Also near {c.name}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link href={`/locations/${n.slug}`} className="inline-flex rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/80 hover:border-sunset hover:text-sunset">
                  360° tours in {n.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/locations" className="inline-flex rounded-full border border-sunset/40 px-4 py-2 text-sm font-semibold text-sunset hover:bg-sunset/10">
                All locations →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
