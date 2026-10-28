import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/site/bits";
import { CITIES, STATES, citiesIn } from "@/lib/locations";
import { site } from "@/lib/site";
import { ORG_ID, ldScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "360° Virtual Tours Across South India",
  description:
    "360° virtual tours and drone 360° views in Karnataka, Tamil Nadu, Kerala, Telangana, Andhra Pradesh and Puducherry. Find your city and get a price.",
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Where 360VUE makes 360° virtual tours",
    itemListElement: CITIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `360° virtual tours in ${c.name}`, url: `${site.url}/locations/${c.slug}` })),
    provider: { "@id": ORG_ID },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <PageHero
        eyebrow="Locations"
        title={
          <>
            360° tours across <span className="text-gold-grad">South India.</span>
          </>
        }
        intro="We travel to you — Karnataka, Tamil Nadu, Kerala, Telangana, Andhra Pradesh and Puducherry. Find your city for local prices, what suits your kind of space, and the drone rules where you are."
        image="/media/aerial-hero.webp"
      />
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {STATES.map((s) => (
            <section key={s.slug} id={s.slug} className="reveal scroll-mt-24 rounded-3xl border border-cream/10 bg-night/70 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sunset">{s.local}</p>
              <h2 className="mt-2 text-2xl font-semibold text-cream">{s.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-cream/60">{s.intro}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {citiesIn(s.slug).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/locations/${c.slug}`} className="inline-flex rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/85 hover:border-sunset hover:text-sunset">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl px-4 text-center text-sm text-cream/50">
          Your town not listed? We still come to you anywhere in South India — travel and stay outside our base area are billed at actual cost and shown on your quote before you book.
        </p>
      </section>
      <CtaBand />
    </>
  );
}
