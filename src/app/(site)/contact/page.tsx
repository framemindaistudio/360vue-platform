import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { QuoteForm } from "@/components/site/QuoteForm";
import { PageHero } from "@/components/site/bits";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get a quote",
  description: "Tell us about your space — business type, location and approximate size — and get a written scope and a clear price for a 360° virtual tour.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const { package: pkg } = await searchParams;
  const wa = whatsappLink("Hi 360VUE, I'd like a virtual tour of my space.");
  const direct = [
    wa && { Icon: MessageCircle, label: "WhatsApp", value: "Message us", href: wa },
    site.contact.phone && { Icon: Phone, label: "Call", value: site.contact.phone, href: `tel:${site.contact.phone.replace(/[^\d+]/g, "")}` },
    site.contact.email && { Icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <>
      <PageHero eyebrow="Get a quote" title={<>Tell us about <span className="text-gold-grad">your space.</span></>} intro="A few details are enough to start. You get a written scope, a capture date and a clear price before anything is booked." />
      <section className="pb-24">
        <div className={`mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8 ${direct.length ? "lg:grid-cols-[1.6fr_1fr]" : "max-w-4xl"}`}>
          <QuoteForm pkg={pkg} />
          {direct.length > 0 && (
            <aside className="space-y-4">
              {direct.map(({ Icon, label, value, href }) => (
                <a key={href} href={href} className="flex items-center gap-4 rounded-3xl border border-cream/10 bg-night/70 p-6 transition-colors hover:border-sunset/50">
                  <span className="grid size-12 place-items-center rounded-2xl bg-sunset/10 text-sunset">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-sand/60">{label}</span>
                    <span className="mt-0.5 block font-semibold text-cream">{value}</span>
                  </span>
                </a>
              ))}
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
