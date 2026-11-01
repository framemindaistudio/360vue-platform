import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/hq/auth";
import { PageHeader, Panel } from "@/components/hq/ui";
import SIZES from "../../../../../public/brand/kit/sizes.json";

export const metadata: Metadata = { title: "Brand Kit" };

/**
 * The logo kit, built by scripts/brand-assets.py from the 4K icon shared with FrameMind AI Studio (the parent company):
 * the gold shutter rings with a mind inside. Only the wordmark differs: "360" + gold "VUE", set in Montserrat by the
 * script. public/brand/kit/ holds the 4K files, kit/preview/ light copies for this page, kit/sizes.json their real sizes.
 */
const LOGOS = [
  { file: "360vue-logo-dark-4k.png", name: "Primary — dark", note: "on Midnight", bg: "bg-[#0e0b08]" },
  { file: "360vue-logo-light-4k.png", name: "Primary — light", note: "on Cream", bg: "bg-[#f9f5ed]" },
  { file: "360vue-logo-mono-4k.png", name: "Monochrome", note: "one colour", bg: "bg-[#ecebe6]" },
  { file: "360vue-logo-transparent-4k.png", name: "Primary — transparent", note: "for dark backgrounds", bg: "bg-[#2a221a]" },
  { file: "360vue-horizontal-dark-4k.png", name: "Horizontal — dark", note: "wide lock-up on Midnight", bg: "bg-[#0e0b08]" },
  { file: "360vue-horizontal-on-dark-transparent-4k.png", name: "Horizontal — for dark", note: "transparent · light letters", bg: "bg-[#2a221a]" },
  { file: "360vue-horizontal-on-light-transparent-4k.png", name: "Horizontal — for light", note: "transparent · dark letters", bg: "bg-[#f9f5ed]" },
  { file: "360vue-emblem-4k.png", name: "Icon", note: "transparent · shared with FrameMind AI Studio", bg: "bg-[#2a221a]" },
  { file: "360vue-emblem-on-midnight-4k.png", name: "Icon — on Midnight", note: "with the warm glow · profile pictures, stickers", bg: "bg-[#0e0b08]" },
  { file: "360vue-emblem-mono-4k.png", name: "Icon — monochrome", note: "transparent · one-colour print", bg: "bg-[#ecebe6]" },
];

const fileSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
const sizeNote = (file: string) => {
  const s = (SIZES as Record<string, { w: number; h: number; bytes: number }>)[file];
  return s ? `${s.w} × ${s.h} px · ${fileSize(s.bytes)}` : "";
};

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
        description="The 360VUE logo in 4K, the colour system, type and the photos and films used on the website. The icon — gold shutter rings with a mind inside — is shared with our parent company, FrameMind AI Studio; only the wordmark differs. Use the dark logo on Midnight and the light one on Cream."
      />
      <div className="space-y-6">
        <Panel title="Logo" subtitle="4K files. The icon is the same as FrameMind AI Studio’s; the letters are Montserrat Bold and “VUE” is always the gold gradient. Never recolour or redraw the icon.">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {LOGOS.map((l) => (
              <li key={l.file} className="overflow-hidden rounded-[var(--radius-md)] border border-graphite/12">
                <div className={`relative grid aspect-[4/3] place-items-center p-6 ${l.bg}`}>
                  <Image src={`/brand/kit/preview/${l.file.replace(/\.png$/, ".webp")}`} alt={l.name} width={600} height={600} unoptimized className="max-h-full w-auto object-contain" />
                </div>
                <div className="flex items-center justify-between gap-3 bg-paper-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-blueprint">{sizeNote(l.file)} · {l.note}</p>
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
