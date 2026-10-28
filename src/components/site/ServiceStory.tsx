import { Check } from "lucide-react";
import { SERVICES, type ServiceId } from "@/lib/content/catalog";
import { Eyebrow } from "./bits";

/**
 * The plain-language pitch for a service: the customer's problem, what we do about it, what a visitor does step by
 * step (with a picture for each step), and what the business gets. Text comes from the catalogue's `pitch`, so the
 * website, the downloadable quote and HQ proposals all say the same thing.
 */
export function ServiceStory({ id, images, eyebrow, title, className = "" }: { id: ServiceId; images: string[]; eyebrow: string; title: React.ReactNode; className?: string }) {
  const pitch = SERVICES.find((s) => s.id === id)?.pitch;
  if (!pitch) return null;
  return (
    <section className={`py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] text-cream sm:text-4xl lg:text-5xl">{title}</h2>
        </div>

        {/* problem → solution */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="reveal rounded-3xl border border-cream/10 bg-midnight/60 p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cream/45">The problem</p>
            <p className="mt-3 text-lg leading-relaxed text-cream/75">{pitch.problem}</p>
          </div>
          <div className="reveal rounded-3xl border border-sunset/40 bg-gradient-to-br from-bronze/25 to-night p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sunset">What we do</p>
            <p className="mt-3 text-lg leading-relaxed text-cream">{pitch.solution}</p>
          </div>
        </div>

        {/* what a visitor does */}
        <p className="reveal mt-14 text-[11px] font-semibold uppercase tracking-[0.25em] text-sand/70">How your customer uses it</p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pitch.journey.map((step, i) => (
            <li key={step} className="reveal overflow-hidden rounded-3xl border border-cream/10 bg-night/70">
              {images[i] && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[i]} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
                  <span className="absolute left-4 top-4 grid size-9 place-items-center rounded-full bg-gold-grad font-display text-sm font-bold text-midnight">{i + 1}</span>
                </div>
              )}
              <p className="p-5 text-sm leading-relaxed text-cream/80">{step}</p>
            </li>
          ))}
        </ol>

        {/* what the business gets */}
        <p className="reveal mt-14 text-[11px] font-semibold uppercase tracking-[0.25em] text-sand/70">What you get out of it</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {pitch.benefits.map((b) => (
            <li key={b} className="reveal flex gap-3 rounded-2xl border border-cream/10 bg-midnight/50 px-5 py-4 text-cream/85">
              <Check className="mt-0.5 size-5 shrink-0 text-sunset" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
