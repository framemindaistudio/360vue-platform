import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { PanoViewer, DEMO_SCENES } from "@/components/site/PanoViewer";
import { ReelCard } from "@/components/site/ReelCard";
import { HeroVideo } from "@/components/site/HeroVideo";
import { Packages } from "@/components/site/Packages";
import { ServiceStory } from "@/components/site/ServiceStory";
import { CtaBand, Eyebrow, GhostButton, GoldButton, SectionHead, SiteIcon } from "@/components/site/bits";
import { FAQS, FEATURES, INDUSTRIES } from "@/lib/site-content";
import { TERMS } from "@/lib/content/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "360VUE — 360° Virtual Tours, Photography & Immersive Experiences" },
  description: site.description,
  alternates: { canonical: "/" },
};

export const revalidate = 600;

const REELS = [
  { id: "capture", video: "/media/reel-capture.mp4", poster: "/media/capture-banquet-sm.webp", title: "We capture your space", text: "A planned capture day: every viewpoint at the same height, lit and levelled, private areas skipped." },
  { id: "walk", video: "/media/reel-walkthrough.mp4", poster: "/media/phone-tour-sm.webp", title: "Customers walk through", text: "Arrows between viewpoints, room labels and hotspots — on any phone, no app needed." },
  { id: "maps", video: "/media/reel-maps.mp4", poster: "/media/phone-maps-sm.webp", title: "Found on Google Maps", text: "Help publishing eligible panoramas to Street View, so your listing shows the inside." },
  { id: "showroom", video: "/media/reel-showroom.mp4", poster: "/media/showroom-virtual-sm.webp", title: "Beyond the tour", text: "Virtual showrooms, floor plans, photography, reels and 3D walkthroughs." },
];

const STEPS = TERMS.process;

export default function HomePage() {
  return (
    <>
      {/* ── hero ─────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <HeroVideo className="absolute inset-0 -z-20 h-full w-full object-cover" src="/media/hero-walkthrough.mp4" poster="/media/hero-poster.webp" posterSmall="/media/hero-poster-sm.webp" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/75 to-midnight/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-transparent to-midnight/40" />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Eyebrow className="reveal">360° Tours · Photography · Immersive</Eyebrow>
            <h1 className="reveal reveal-d1 mt-6 text-[2.75rem] font-bold leading-[1] tracking-[-0.03em] text-cream sm:text-7xl lg:text-[5.25rem]">
              <span className="text-gold-grad">Real Spaces.</span>
              <br />
              <span className="text-gold-grad">Real Experiences.</span>
            </h1>
            <p className="reveal reveal-d2 mt-7 max-w-xl text-lg leading-relaxed text-cream/75">
              360° virtual tours and immersive experiences for your business — so customers can explore your space before they visit.
            </p>
            <div className="reveal reveal-d3 mt-9 flex flex-wrap gap-3">
              <GoldButton href="/contact">Get a Quote</GoldButton>
              <GhostButton href="#demo">View Demo</GhostButton>
            </div>
          </div>
        </div>

        {/* spinning 360° badge */}
        <div className="pointer-events-none absolute right-[6%] top-[30%] hidden lg:block" aria-hidden>
          <div className="relative grid size-40 place-items-center">
            <svg viewBox="0 0 160 160" className="vue-spin-slow absolute inset-0">
              <defs>
                <path id="ring" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
              </defs>
              <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(245,158,76,0.35)" strokeWidth="1" />
              <text fill="rgba(249,245,237,0.7)" fontSize="10.5" letterSpacing="5" fontFamily="var(--font-display)">
                <textPath href="#ring">SEE EVERY ANGLE · SEE EVERY ANGLE · </textPath>
              </text>
            </svg>
            <span className="font-display text-3xl font-bold text-cream">
              360<span className="text-sunset">°</span>
            </span>
          </div>
        </div>

        {/* industry strip, as on the brand board */}
        <div className="border-t border-cream/10 bg-midnight/60 backdrop-blur-md">
          <ul className="no-scrollbar mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-5 sm:justify-between sm:px-6 lg:px-8">
            {INDUSTRIES.map((i) => (
              <li key={i.id}>
                <Link href={`/industries#${i.id}`} className="flex shrink-0 items-center gap-2.5 text-xs font-medium text-cream/70 transition-colors hover:text-sunset">
                  <SiteIcon name={i.icon} className="size-5 text-sunset" />
                  {i.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <a href="#demo" className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 text-cream/50 hover:text-sunset sm:block" aria-label="Scroll to the demo">
          <ChevronDown className="vue-float size-6" />
        </a>
      </section>

      {/* ── live demo ─────────────────────────────────────── */}
      <section id="demo" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead eyebrow="Try it now" title={<>Don&apos;t describe your space. <span className="text-gold-grad">Let them walk in.</span></>} intro="Drag to look around, pinch or scroll to zoom. This is what your customers get — on your website, in a WhatsApp link and on your Maps listing." />
            <Link href="/portfolio" className="reveal inline-flex items-center gap-1.5 text-sm font-semibold text-sunset hover:underline">
              More demo tours <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="reveal mt-12 overflow-hidden rounded-3xl border border-cream/10 shadow-[0_40px_120px_-40px_rgba(245,158,76,0.35)]">
            <PanoViewer scenes={DEMO_SCENES} className="aspect-[4/5] w-full sm:aspect-[16/9]" />
          </div>
          <p className="mt-3 text-center text-xs text-cream/40">Demo of an illustrative space, not a client project.</p>
        </div>
      </section>

      {/* ── the problem, and how a tour solves it ───────────── */}
      <ServiceStory id="tours" images={["/media/phone-maps-sm.webp", "/media/pano-lobby-sm.webp", "/media/restaurant-sm.webp", "/media/phone-tour-sm.webp"]} eyebrow="Why a 360° tour" title={<>Photos don&apos;t sell a space. <span className="text-gold-grad">Walking through it does.</span></>} className="border-t border-cream/10" />

      {/* ── reels: how it works in the real world ───────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute left-[-10%] top-20 size-[520px] rounded-full bg-bronze/20 blur-[140px]" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="From capture to customer" title="From our camera to your customer's phone." intro="One visit to your space. Then your customers can see it anywhere they look for you." />
          <div className="no-scrollbar -mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {REELS.map((r, i) => (
              <article key={r.id} className={`reveal reveal-d${(i % 3) + 1} w-[72vw] shrink-0 snap-start sm:w-auto`}>
                <div className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-cream/10 bg-night">
                  <ReelCard video={r.video} poster={r.poster} alt={r.title} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight via-midnight/70 to-transparent p-5 pt-20">
                    <p className="font-mono text-[11px] text-sunset">0{i + 1}</p>
                    <h3 className="mt-1 text-lg font-semibold text-cream">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-snug text-cream/65">{r.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── features ─────────────────────────────────────── */}
      <section className="border-y border-cream/10 bg-night/60 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="What you get" title="More than a photography service." intro="Capture, processing, an interactive tour, online presentation and dependable delivery — handled end to end." />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-cream/10 bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="reveal bg-midnight p-7 sm:p-9">
                <span className="grid size-12 place-items-center rounded-2xl border border-sunset/30 bg-sunset/10">
                  <SiteIcon name={f.icon} className="size-6 text-sunset" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-cream">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SkyVUE aerial ─────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/aerial-hero.webp" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/80 to-midnight/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal max-w-xl">
            <Eyebrow>New · SkyVUE aerial 360°</Eyebrow>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] text-cream sm:text-5xl">
              Show where you are, <span className="text-gold-grad">from 120 m up.</span>
            </h2>
            <p className="mt-5 text-lg text-cream/70">
              A drone 360° of your property with the highway, schools, hospital and lake labelled with distances. Your buildings are labelled too: tap the clubhouse, the café or the entrance and its 360° opens, so people walk inside. All in one link.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href="/skyvue">Explore SkyVUE</GoldButton>
              <GhostButton href="/pricing?need=sky">See prices</GhostButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── industries ───────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead eyebrow="Industries" title="For spaces that help customers decide." />
            <Link href="/industries" className="reveal inline-flex items-center gap-1.5 text-sm font-semibold text-sunset hover:underline">
              All industries <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => (
              <Link key={ind.id} href={`/industries#${ind.id}`} className={`reveal reveal-d${(i % 3) + 1} group relative isolate block aspect-[4/3] overflow-hidden rounded-3xl border border-cream/10`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${ind.image}-sm.webp`} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
                <div className="flex h-full flex-col justify-end p-6">
                  <SiteIcon name={ind.icon} className="size-6 text-sunset" />
                  <h3 className="mt-3 text-xl font-semibold text-cream">{ind.name}</h3>
                  <p className="mt-1 text-sm text-cream/65">{ind.short}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── process ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-cream/10 bg-night/60 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div>
            <SectionHead eyebrow="How it works" title="The same eight steps, every project." intro="Written scope first. Private areas agreed before we arrive. Everything tested on a phone before you see it." />
            <div className="reveal mt-10 hidden overflow-hidden rounded-3xl border border-cream/10 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/camera-sm.webp" alt="A 360° camera on a tripod in a hotel lobby" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal rounded-2xl border border-cream/10 bg-midnight/70 p-6">
                <span className="font-display text-3xl font-bold text-gold-grad">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-cream">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-cream/55">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── packages ─────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead center eyebrow="Plans" title="Priced by scenes. No surprises." intro="Four plans, from a café to a campus. Enter your area, floors and rooms in the calculator for your exact price." />
          <div className="mt-14">
            <Packages />
          </div>
        </div>
      </section>

      {/* ── FAQ teaser ───────────────────────────────────── */}
      <section className="border-t border-cream/10 py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <SectionHead eyebrow="FAQs" title="Questions owners ask first." intro={<Link href="/faq" className="text-sunset hover:underline">See every answer →</Link>} />
          <div className="divide-y divide-cream/10 border-y border-cream/10">
            {FAQS.filter((_, i) => [0, 4, 6, 8].includes(i)).map((f) => (
              <details key={f.q} className="reveal group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-cream">
                  {f.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-cream/20 text-sunset transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
