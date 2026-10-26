import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NAV } from "@/lib/site-content";
import { site, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const wa = whatsappLink("Hi 360VUE, I'd like a virtual tour of my space.");
  const contact = [
    site.contact.phone && { label: site.contact.phone, href: `tel:${site.contact.phone.replace(/[^\d+]/g, "")}` },
    site.contact.email && { label: site.contact.email, href: `mailto:${site.contact.email}` },
    wa && { label: "WhatsApp", href: wa },
  ].filter(Boolean) as { label: string; href: string }[];
  const socials = [
    site.socials.instagram && { label: "Instagram", href: site.socials.instagram },
    site.socials.linkedin && { label: "LinkedIn", href: site.socials.linkedin },
    site.socials.youtube && { label: "YouTube", href: site.socials.youtube },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="site-footer relative overflow-hidden border-t border-cream/10 bg-night">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-sunset/10 blur-[140px]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="text-[22px]">
            <Logo tone="white" tagline />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/60">360° virtual tours, photography and immersive experiences for businesses whose space is part of the decision.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/70">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-cream/70 hover:text-sunset">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sand/70">Talk to us</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/contact" className="text-cream/70 hover:text-sunset">
                Get a quote
              </Link>
            </li>
            {contact.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="text-cream/70 hover:text-sunset">
                  {c.label}
                </a>
              </li>
            ))}
            {socials.map((c) => (
              <li key={c.href}>
                <a href={c.href} target="_blank" rel="noreferrer" className="text-cream/70 hover:text-sunset">
                  {c.label}
                </a>
              </li>
            ))}
            {site.location && <li className="text-cream/50">{site.location}</li>}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} 360VUE · See Every Angle.</p>
          <p>Photographs and demo tours on this site show illustrative spaces, not client work.</p>
        </div>
      </div>
    </footer>
  );
}
