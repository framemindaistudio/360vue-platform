import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Building2, Check, Coffee, Globe, Home, Hotel, Plane, Rotate3d, Server, Store } from "lucide-react";
import { CampaignBand } from "@/components/site/CampaignBand";
import { CtaBand, SectionHead } from "@/components/site/bits";
import { campaignBySlug } from "@/lib/campaign-server";
import { publicRateCard } from "@/lib/public-rates";
import { SKYVUE_LAUNCH } from "@/lib/content/catalog";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await campaignBySlug((await params).slug);
  if (!c) return { title: "Offer", robots: { index: false } };
  return {
    title: `${c.name} — ${c.percent}% off 360° virtual tours`,
    description: `${c.percent}% off for the first ${c.total} tour projects — ${c.left} slots left. 360° virtual tours for hotels, homestays, cafés, real estate and commercial spaces across South India.`,
    alternates: { canonical: `/offers/${c.slug}` },
  };
}

const FOR = [
  { Icon: Hotel, t: "Hotels & resorts" },
  { Icon: Home, t: "Homestays & Airbnb" },
  { Icon: Coffee, t: "Cafés & restaurants" },
  { Icon: Building2, t: "Real estate & villas" },
  { Icon: Store, t: "Commercial spaces" },
];

export default async function OfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const [c, rates] = await Promise.all([campaignBySlug((await params).slug), publicRateCard()]);
  if (!c) notFound();
  const covers = (id: string) => c.serviceIds.includes(id);
  const services = [
    { Icon: Rotate3d, t: "360° virtual tours", d: "Room-to-room tours with navigation, info points and a contact panel.", id: "tours" },
    { Icon: Plane, t: "SkyVUE aerial 360°", d: `Drone 360° with landmarks and distances, joined to your tour in one link. Flights from ${SKYVUE_LAUNCH} — pre-book now.`, id: "aerial" },
    { Icon: Box, t: "3D & spatial experiences", d: "Measured floor plans, 3D dollhouse views, virtual showrooms and digital twins.", id: "spatial" },
    { Icon: Globe, t: "Publishing & integration", d: "Google Maps publishing, website embeds and QR artwork — included with every tour.", id: "included" },
    { Icon: Server, t: "Hosting & tour care", d: "12 months of hosting included; renewals and multi-location plans after that.", id: "hosting" },
  ];
  const terms =
    c.terms ||
    `${c.percent}% off ${covers("tours") ? "the 360° tour plan and its add-ons" : "eligible services"}, before tax, for the first ${c.total} projects whose advance payment is confirmed. One offer per property. Monthly hosting is not discounted. Cannot be combined with other offers.`;

  return (
    <>
      <div className="pt-16 sm:pt-[72px]" />
      <CampaignBand c={c} rates={rates} />

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Our services" title="One space. Multiple possibilities." intro={`The ${c.percent}% discount applies to the services marked “in the offer”.`} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ Icon, t, d, id }) => {
              const inOffer = covers(id);
              return (
                <div key={t} className={`reveal rounded-3xl border p-6 ${inOffer ? "border-sunset/50 bg-gradient-to-b from-bronze/25 to-night" : "border-cream/10 bg-night/70"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="size-7 text-sunset" strokeWidth={1.5} aria-hidden />
                    {inOffer ? (
                      <span className="rounded-full bg-gold-grad px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight">In the offer · {c.percent}% off</span>
                    ) : id === "included" ? (
                      <span className="rounded-full border border-cream/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/60">Included</span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-cream">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/60">{d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-cream/10 bg-night/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/70">Made for</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {FOR.map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-2.5 rounded-full border border-cream/15 px-5 py-2.5 text-sm text-cream/85">
                <Icon className="size-4 text-sunset" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHead eyebrow="How to claim your slot" title="Three steps." />
            <ol className="mt-8 space-y-5">
              {[
                ["Price your space", "Use the price calculator — the offer is applied automatically while slots are left. Download your quote."],
                ["We confirm the scope", "We call you, confirm the scenes and send your final quote with the offer on it."],
                ["Pay the advance", "Your slot is locked the moment we confirm your advance payment. Then we schedule your capture day."],
              ].map(([t, d], i) => (
                <li key={t} className="reveal flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-grad font-display text-sm font-bold text-midnight">{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-cream">{t}</span>
                    <span className="mt-1 block text-sm text-cream/60">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/pricing" className="mt-8 inline-flex rounded-full bg-gold-grad px-7 py-3.5 text-sm font-semibold text-midnight">
              Price my space
            </Link>
          </div>
          <div className="reveal self-start rounded-3xl border border-cream/10 bg-night/70 p-7">
            <h2 className="text-lg font-semibold text-cream">Offer terms</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/65">{terms}</p>
            <ul className="mt-5 space-y-2 text-sm text-cream/70">
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> Slots are counted live: {c.left} of {c.total} left right now.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {rates.gstOn ? "Prices are before GST." : "No GST is charged — 360VUE is not GST-registered yet."}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
