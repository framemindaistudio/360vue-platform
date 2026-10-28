import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealOnScroll } from "@/components/site/Reveal";
import { Analytics } from "@/components/site/Analytics";
import { ldScript, organizationLd } from "@/lib/seo";

/** The public website: dark, cinematic, gold on midnight. HQ lives at /hq with its own layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vue-site min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(organizationLd())} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-sunset focus:px-4 focus:py-2 focus:text-midnight">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <RevealOnScroll />
      <Analytics />
    </div>
  );
}
