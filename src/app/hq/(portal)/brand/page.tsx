import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/hq/auth";
import { PageHeader, Panel } from "@/components/hq/ui";

export const metadata: Metadata = { title: "Brand Kit" };

/** The logo kit: rendered in 4K (Higgsfield), the wordmark set in Montserrat. public/brand/kit/ holds the files. */
const LOGOS = [
  { file: "360vue-logo-dark-4k.png", name: "Primary — dark", note: "3840 × 3840 · on Midnight", bg: "bg-[#0e0b08]" },
  { file: "360vue-logo-light-4k.png", name: "Primary — light", note: "3840 × 3840 · on Cream", bg: "bg-[#f9f5ed]" },
  { file: "360vue-logo-mono-4k.png", name: "Monochrome", note: "3840 × 3840 · one colour", bg: "bg-[#ecebe6]" },
  { file: "360vue-logo-transparent-4k.png", name: "Primary — transparent", note: "3840 × 3840 · for dark backgrounds", bg: "bg-[#2a221a]" },
  { file: "360vue-horizontal-dark-4k.png", name: "Horizontal — dark", note: "Wide lock-up · on Midnight", bg: "bg-[#0e0b08]" },
  { file: "360vue-horizontal-on-dark-transparent-4k.png", name: "Horizontal — for dark", note: "Transparent · light letters", bg: "bg-[#2a221a]" },
  { file: "360vue-horizontal-on-light-transparent-4k.png", name: "Horizontal — for light", note: "Transparent · dark letters", bg: "bg-[#f9f5ed]" },
  { file: "360vue-emblem-4k.png", name: "Emblem", note: "4096 × 4096 · transparent", bg: "bg-[#2a221a]" },
  { file: "360vue-emblem-mono-4k.png", name: "Emblem — monochrome", note: "4096 × 4096 · transparent", bg: "bg-[#ecebe6]" },
];

const COLOURS = [
  { name: "Midnight", hex: "#0E0B08", use: "Backgrounds, the main identity" },
  { name: "Bronze", hex: "#9A5A31", use: "Accents on light, labels" },
  { name: "Sunset", hex: "#F59E4C", use: "Highlights, buttons" },
  { name: "Sand", hex: "#EBD6B5", use: "Tagline on dark, soft panels" },
  { name: "Champagne", hex: "#E6BD85", use: "Gold detail, the gradient" },
  { name: "Cream", hex: "#F9F5ED", use: "Light backgrounds, text on dark" },
];

const MEDIA = [
  "keyvisual", "restaurant", "hotel", "showroom", "realestate", "cafe", "gym", "office", "camera", "capture-banquet", "capture-cafe", "phone-tour", "phone-maps", "showroom-virtual", "aerial-resort",
];

export default async function BrandKitPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        icon="Gem"
        title="Brand Kit"
        description="The 360VUE logo in 4K, the colour system, type and the photos and films used on the website. Download any file; use the dark logo on Midnight and the light one on Cream."
      />
      <div className="space-y-6">
        <Panel title="Logo" subtitle="Rendered in 4K. The letters are Montserrat Bold; “VUE” is always the gold gradient.">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {LOGOS.map((l) => (
              <li key={l.file} className="overflow-hidden rounded-[var(--radius-md)] border border-graphite/12">
                <div className={`relative grid aspect-[4/3] place-items-center p-6 ${l.bg}`}>
                  <Image src={`/brand/kit/${l.file}`} alt={l.name} width={600} height={600} unoptimized className="max-h-full w-auto object-contain" />
                </div>
                <div className="flex items-center justify-between gap-3 bg-paper-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-blueprint">{l.note}</p>
                  </div>
                  <a href={`/brand/kit/${l.file}`} download className="inline-flex items-center gap-1.5 rounded-full border border-graphite/20 px-3 py-1.5 text-xs font-semibold hover:bg-graphite hover:text-paper">
                    <Download className="size-3.5" /> PNG
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Colours">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COLOURS.map((c) => (
                <li key={c.hex} className="overflow-hidden rounded-[var(--radius-md)] border border-graphite/12">
                  <div className="h-20" style={{ background: c.hex }} />
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="font-mono text-xs text-blueprint">{c.hex}</p>
                    <p className="mt-1 text-[11px] leading-snug text-charcoal">{c.use}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 h-10 rounded-[var(--radius-sm)] bg-gold-grad" aria-label="The gold gradient" />
            <p className="mt-1.5 text-[11px] text-blueprint">The gold gradient: #FAD696 → #E8A854 → #A4622C</p>
          </Panel>
          <Panel title="Type">
            <p className="font-display text-5xl font-bold tracking-tight">
              360<span className="text-gold-grad">VUE</span>
            </p>
            <p className="mt-2 font-display text-xs font-medium uppercase tracking-[0.42em] text-bronze">See every angle.</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="font-display font-semibold">Montserrat</dt>
                <dd className="text-charcoal">Headings and the wordmark. Bold, modern, premium.</dd>
              </div>
              <div>
                <dt className="font-semibold">DM Sans</dt>
                <dd className="text-charcoal">Body text. Clean and readable at every size.</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <Panel title="Photos and films" subtitle="Generated in 4K for the website. They show example spaces, not client work — never present them as a client's tour.">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {MEDIA.map((m) => (
              <li key={m}>
                <a href={`/media/${m}.webp`} download className="group block overflow-hidden rounded-[var(--radius-sm)] border border-graphite/12">
                  <Image src={`/media/${m}-sm.webp`} alt={m} width={600} height={338} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </a>
              </li>
            ))}
            {["hero-walkthrough.mp4", "logo-reveal.mp4", "reel-capture.mp4", "reel-walkthrough.mp4", "reel-maps.mp4", "reel-showroom.mp4"].map((v) => (
              <li key={v}>
                <a href={`/media/${v}`} download className="grid aspect-video place-items-center rounded-[var(--radius-sm)] border border-dashed border-graphite/25 text-xs font-semibold text-charcoal hover:border-graphite">
                  ▶ {v}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
