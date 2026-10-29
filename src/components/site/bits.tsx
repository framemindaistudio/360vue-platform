import Link from "next/link";
import { ArrowRight, Box, Briefcase, Building, Camera, Dumbbell, Globe, GraduationCap, Hotel, LandPlot, MapPin, Mountain, Navigation, PartyPopper, Plane, Rotate3d, Stethoscope, Store, TreePalm, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { Box, Briefcase, Building, Camera, Dumbbell, Globe, GraduationCap, Hotel, LandPlot, MapPin, Mountain, Navigation, PartyPopper, Plane, Rotate3d, Stethoscope, Store, TreePalm, UtensilsCrossed };

export function SiteIcon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Rotate3d;
  return <I className={className} strokeWidth={1.5} aria-hidden />;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-sunset", className)}>
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-sunset" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHead({ eyebrow, title, intro, center, className }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cn("reveal max-w-3xl", center && "mx-auto text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] text-cream sm:text-4xl lg:text-5xl">{title}</h2>
      {intro && <p className={cn("mt-5 text-pretty text-base leading-relaxed text-cream/60 sm:text-lg", center && "mx-auto")}>{intro}</p>}
    </div>
  );
}

export function GoldButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center justify-center gap-2 rounded-full bg-gold-grad px-7 py-3.5 text-sm font-semibold text-midnight shadow-[0_12px_40px_-10px_rgba(245,158,76,0.7)] transition-transform hover:-translate-y-0.5", className)}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export function GhostButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-sunset hover:text-sunset", className)}>
      {children}
    </Link>
  );
}

/** The page-top band used by every inner page. */
export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: React.ReactNode; intro: React.ReactNode; image?: string }) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/60 via-midnight/80 to-midnight" />
        </>
      )}
      <div className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[560px] rounded-full bg-bronze/25 blur-[140px]" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] text-cream sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-cream/65 sm:text-lg">{intro}</p>
      </div>
    </section>
  );
}

/** A closing call to action, the same on every page. */
export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/keyvisual.webp" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/30" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal max-w-2xl">
          <Eyebrow>Let customers look inside</Eyebrow>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.05] text-cream sm:text-5xl">
            Your space, from <span className="text-gold-grad">every angle.</span>
          </h2>
          <p className="mt-5 text-lg text-cream/65">Tell us about your space. You get a written scope, a capture date and a clear price before anything starts.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GoldButton href="/pricing">Pricing</GoldButton>
            <GhostButton href="/contact">Talk to us</GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}
