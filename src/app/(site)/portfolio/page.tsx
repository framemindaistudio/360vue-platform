import type { Metadata } from "next";
import { PanoViewer, DEMO_SCENES } from "@/components/site/PanoViewer";
import { ReelCard } from "@/components/site/ReelCard";
import { CtaBand, PageHero, SectionHead } from "@/components/site/bits";

export const metadata: Metadata = {
  title: "Demo tours",
  description: "Try a 360° virtual tour: drag to look around a demo restaurant and hotel lobby, and see what a capture, a walkthrough and a Maps listing look like.",
  alternates: { canonical: "/portfolio" },
};

const GALLERY = [
  { src: "/media/restaurant", label: "Restaurant" },
  { src: "/media/hotel", label: "Hotel suite" },
  { src: "/media/showroom", label: "Showroom" },
  { src: "/media/realestate", label: "Residence" },
  { src: "/media/cafe", label: "Café" },
  { src: "/media/office", label: "Office" },
];

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Demo tours"
        title={<>Look around. <span className="text-gold-grad">Go on.</span></>}
        intro="These demos show how a 360VUE tour works. They are illustrative spaces, not client projects; client tours appear here only with the client's written permission."
      />
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal overflow-hidden rounded-3xl border border-cream/10 shadow-[0_40px_120px_-40px_rgba(245,158,76,0.35)]">
            <PanoViewer scenes={DEMO_SCENES} className="aspect-[4/5] w-full sm:aspect-[16/9]" />
          </div>
          <p className="mt-3 text-center text-xs text-cream/40">Drag or swipe to look around · switch spaces at the bottom left · full screen at the bottom right.</p>
        </div>
      </section>

      <section className="border-t border-cream/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="In the field" title="What a 360VUE project looks like." />
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { v: "/media/reel-capture.mp4", p: "/media/capture-banquet-sm.webp", t: "Capture day in a banquet hall" },
              { v: "/media/reel-walkthrough.mp4", p: "/media/phone-tour-sm.webp", t: "Walking through on a phone" },
              { v: "/media/reel-maps.mp4", p: "/media/phone-maps-sm.webp", t: "Opened from a Maps listing" },
              { v: "/media/reel-showroom.mp4", p: "/media/showroom-virtual-sm.webp", t: "A virtual showroom" },
            ].map((r) => (
              <figure key={r.v} className="reveal">
                <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-cream/10">
                  <ReelCard video={r.v} poster={r.p} alt={r.t} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <figcaption className="mt-2 text-sm text-cream/60">{r.t}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Gallery" title="Spaces worth walking through." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g) => (
              <figure key={g.src} className="reveal group overflow-hidden rounded-2xl border border-cream/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${g.src}-sm.webp`} alt={`Illustrative ${g.label.toLowerCase()}`} loading="lazy" className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <figcaption className="bg-night px-4 py-3 text-sm text-cream/60">{g.label} · illustrative</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
