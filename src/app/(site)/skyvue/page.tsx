import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Check, Factory, GraduationCap, Hotel, MapPinned, PartyPopper, ShieldCheck, Trees, Wind } from "lucide-react";
import { COMBINED_DEMO_SCENES, PanoViewer } from "@/components/site/PanoViewer";
import { CtaBand, Eyebrow, GhostButton, GoldButton, SectionHead } from "@/components/site/bits";
import { ServiceStory } from "@/components/site/ServiceStory";
import { publicRateCard } from "@/lib/public-rates";

export const metadata: Metadata = {
  title: "SkyVUE — aerial 360° views with landmarks",
  description:
    "SkyVUE by 360VUE: drone 360° views with the landmarks around your property labelled and their distances shown — for plotted layouts, apartments, resorts, campuses and hotels. Standalone or as the opening scene of your tour.",
  alternates: { canonical: "/skyvue" },
};
export const revalidate = 600;

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const FOR = [
  { Icon: MapPinned, t: "Plotted layouts & villa projects", d: "Plot numbers, phases, roads and amenities marked on the view" },
  { Icon: Building2, t: "Apartments & townships", d: "Towers, clubhouse and the neighbourhood around them" },
  { Icon: Trees, t: "Resorts, farm stays & eco-lodges", d: "Pools, cottages, trails and the landscape" },
  { Icon: Hotel, t: "Hotels & banquet lawns", d: "Lawns, parking and access for event planners" },
  { Icon: GraduationCap, t: "Schools & campuses", d: "Blocks, grounds and transport for parents" },
  { Icon: Factory, t: "Factories & industrial parks", d: "Access roads, highways and logistics hubs" },
];

const LABELS = ["Highways & metro stations", "Schools & colleges", "Hospitals", "Malls & markets", "Airports & railway stations", "Lakes, parks & temples", "Plot numbers & phases", "Clubhouse & amenities"];

export default async function SkyVuePage() {
  const rates = await publicRateCard();
  const sky = rates.services.find((s) => s.id === "aerial");
  const plans = sky?.groups.find((g) => g.id === "package")?.options ?? [];
  const extras = sky?.groups.find((g) => g.id !== "package")?.options ?? [];
  const opening = rates.services.find((s) => s.id === "tours")?.groups.flatMap((g) => g.options).find((o) => o.id === "aerial");

  return (
    <>
      {/* hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/aerial-hero.webp" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/75 to-midnight/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-transparent to-midnight/40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>SkyVUE · Aerial 360°</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-cream sm:text-6xl lg:text-7xl">
            Show where you are, <span className="text-gold-grad">not just what&apos;s inside.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
            A drone 360° from up to 120 m, with the landmarks around you labelled and their distances shown. Drag to look around — the highway, the school, the lake, your plots.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <GoldButton href="/pricing?need=sky">Price your SkyVUE</GoldButton>
            <GhostButton href="#demo">Try the demo</GhostButton>
          </div>
        </div>
      </section>

      {/* demo */}
      <section id="demo" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Try it" title="Sky to inside, in one link." intro="Drag to look around a plotted layout from above: every landmark shows its distance. Then tap a gold hotspot to step down into the clubhouse lobby or café, and tap “Back to the sky” to fly up again." />
          <div className="reveal mt-12 overflow-hidden rounded-3xl border border-cream/10 shadow-[0_40px_120px_-40px_rgba(245,158,76,0.35)]">
            <PanoViewer scenes={COMBINED_DEMO_SCENES} className="aspect-[4/5] w-full sm:aspect-[16/9]" />
          </div>
          <p className="mt-3 text-center text-xs text-cream/40">Demo of an illustrative location; landmarks and distances are examples, not a real project.</p>
        </div>
      </section>

      {/* problem → how it works → what you get */}
      <ServiceStory id="aerial" images={["/media/aerial-hero-sm.webp", "/media/pano-aerial-sm.webp", "/media/pano-lobby-sm.webp", "/media/phone-tour-sm.webp"]} eyebrow="How SkyVUE works" title={<>From the sky, <span className="text-gold-grad">straight inside.</span></>} className="border-y border-cream/10 bg-night/60" />

      {/* who */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div>
            <SectionHead eyebrow="Made for" title="Properties people choose by location." />
            <div className="reveal mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/70">What we label</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {LABELS.map((l) => (
                  <li key={l} className="rounded-full border border-cream/15 px-3 py-1.5 text-xs text-cream/75">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {FOR.map(({ Icon, t, d }) => (
              <li key={t} className="reveal flex gap-4 rounded-2xl border border-cream/10 bg-night/70 p-5">
                <Icon className="mt-0.5 size-6 shrink-0 text-sunset" strokeWidth={1.5} aria-hidden />
                <span>
                  <span className="block font-semibold text-cream">{t}</span>
                  <span className="mt-1 block text-sm text-cream/55">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* plans */}
      <section id="plans" className="scroll-mt-20 border-t border-cream/10 bg-night/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="SkyVUE plans" title="From one view to the whole masterplan." intro="Every plan includes the airspace check, landmark research, a shareable link and 12 months of hosting." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => {
              const [what, fit] = (p.detail ?? "").split(" · ");
              const featured = !!p.badge;
              return (
                <article key={p.id} className={`reveal relative flex flex-col rounded-3xl border p-7 ${featured ? "border-sunset/50 bg-gradient-to-b from-bronze/30 via-night to-night" : "border-cream/10 bg-midnight/70"}`}>
                  {featured && <span className="mb-3 self-start rounded-full bg-gold-grad px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-midnight">{p.badge}</span>}
                  <h3 className="text-2xl font-semibold text-cream">{p.label}</h3>
                  <p className="mt-4 font-display text-3xl font-bold text-cream">{inr(p.price)}</p>
                  <p className="mt-1 text-xs text-cream/45">One-time · before GST</p>
                  <p className="mt-5 flex gap-2.5 text-sm text-cream/75">
                    <Check className="mt-0.5 size-4 shrink-0 text-sunset" aria-hidden /> {what}
                  </p>
                  {fit && <p className="mt-3 text-sm text-cream/50">For {fit}</p>}
                  <Link href="/pricing?need=sky" className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${featured ? "bg-gold-grad text-midnight" : "border border-cream/20 text-cream hover:border-sunset hover:text-sunset"}`}>
                    Get my quote <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="reveal rounded-3xl border border-cream/10 bg-midnight/70 p-7">
              <h3 className="text-lg font-semibold text-cream">Extras</h3>
              <ul className="mt-4 divide-y divide-cream/10">
                {extras.map((o) => (
                  <li key={o.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                    <span>
                      <span className="text-cream/85">{o.label}</span>
                      {o.detail && <span className="mt-0.5 block text-xs text-cream/45">{o.detail}</span>}
                    </span>
                    <span className="shrink-0 font-mono text-cream/70">{`${inr(o.price)}${o.unit ?? ""}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal rounded-3xl border border-sunset/30 bg-sunset/[0.06] p-7">
              <h3 className="text-lg font-semibold text-cream">Combine it with your 360° tour — one link</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/65">
                Take SkyVUE and a ground tour together and we join them in a single link, with hotspots from the aerial view into your space and back — linking costs nothing extra. Need just one aerial view? Add an aerial opening scene to your tour for {opening ? `${inr(opening.price)} per scene` : "a lower price"}; we fly on the same visit.
              </p>
              <Link href="/pricing?need=both" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sunset hover:underline">
                Price a tour with SkyVUE <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* safety */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { Icon: ShieldCheck, t: "Airspace checked first", d: "We check the zone before booking. Green zones fly; near airports and other restricted areas we apply for permission or tell you it is not possible." },
            { Icon: Wind, t: "Weather decides the day", d: "Wind and rain ground drones. If the day is not safe, we move the flight at no cost." },
            { Icon: PartyPopper, t: "People and privacy", d: "We fly over your property, not over crowds, and blur people and number plates before delivery." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="reveal rounded-3xl border border-cream/10 p-6">
              <Icon className="size-6 text-sunset" strokeWidth={1.5} aria-hidden />
              <p className="mt-4 font-semibold text-cream">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/55">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
