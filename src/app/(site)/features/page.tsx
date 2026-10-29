import type { Metadata } from "next";
import { BookOpen, Footprints, Map, MessageCircle, Palette, Search, ShoppingBag, Sparkles, type LucideIcon } from "lucide-react";
import { CtaBand, Eyebrow, GhostButton, GoldButton, PageHero, SectionHead } from "@/components/site/bits";
import { FEATURE_GROUPS, HOW_LABEL, VISION, type How } from "@/lib/content/tour-features";

export const metadata: Metadata = {
  title: "Tour features — what your 360° virtual tour can do",
  description:
    "Every feature of a 360VUE virtual tour: room-to-room walking, info points, videos, WhatsApp and booking buttons, floor plans, drone aerial views with plot overlays, product hotspots, languages and Google Maps publishing.",
  alternates: { canonical: "/features" },
};

const ICONS: Record<string, LucideIcon> = { BookOpen, Footprints, Map, MessageCircle, Palette, Search, ShoppingBag, Sparkles };

function Icon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Sparkles;
  return <I className={className} strokeWidth={1.5} aria-hidden />;
}

const HOW_STYLE: Record<How, string> = {
  included: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  addon: "border-sunset/35 bg-sunset/10 text-sunset",
  plan: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  request: "border-cream/20 bg-cream/5 text-cream/60",
};

function HowTag({ how }: { how: How }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${HOW_STYLE[how]}`}>{HOW_LABEL[how]}</span>;
}

const STORY = [
  { time: "Friday, 10:40 pm", text: "Ananya is planning a long weekend for her parents' anniversary. Three stays look the same in photos. One has a link that says \"Walk around\"." },
  { time: "10:42 pm", text: "The tour opens high above the river. She can see the stay, the boulders and how far the temple is. She taps the cottage and drops down onto its veranda." },
  { time: "10:47 pm", text: "She walks through the room, checks the bathroom, opens the dinner menu and watches a short video of the sunset deck. She sends the link to her brother: \"This one?\"" },
  { time: "10:55 pm", text: "He replies \"Book it.\" She taps WhatsApp inside the tour. The owner gets a message that says which cottage she was looking at." },
];

export default function FeaturesPage() {
  const total = FEATURE_GROUPS.reduce((n, g) => n + g.features.length, 0);
  return (
    <>
      <PageHero
        eyebrow="Tour features"
        title={<>Not a photo gallery. <span className="text-gold-grad">A front door that never closes.</span></>}
        intro={`A 360VUE tour lets customers walk through your space, ask it questions and reach you — from any phone, at any hour. Here are all ${total} things it can do.`}
        image="/media/pano-lobby.webp"
      />

      {/* ── a story ─────────────────────────────────────────── */}
      <section className="border-y border-cream/10 bg-night/60 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div className="reveal">
            <Eyebrow>Fifteen minutes on a Friday night</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] text-cream sm:text-4xl lg:text-5xl">
              The booking happened <span className="text-gold-grad">before anyone visited.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
              This is how people choose now: late at night, on a phone, comparing you with three others. The business that lets them look around wins the booking.
            </p>
            <p className="mt-4 text-xs text-cream/40">An illustrative story, not a client case.</p>
          </div>
          <ol className="relative space-y-6 border-l border-sunset/30 pl-7">
            {STORY.map((s, i) => (
              <li key={s.time} className={`reveal reveal-d${(i % 3) + 1} relative`}>
                <span className="absolute -left-[33px] top-1.5 size-3 rounded-full bg-gold-grad ring-4 ring-midnight" aria-hidden />
                <p className="font-mono text-xs text-sunset">{s.time}</p>
                <p className="mt-1.5 text-pretty leading-relaxed text-cream/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── jump list + legend ─────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Everything a tour can do" title="Eight jobs your tour does for you." intro="Each feature is marked with how you get it. Every add-on has a fixed price on the pricing page — pick what you need and see your total." />
          <div className="reveal mt-8 flex flex-wrap gap-2">
            {(Object.keys(HOW_LABEL) as How[]).filter((h) => FEATURE_GROUPS.some((g) => g.features.some((f) => f.how === h))).map((h) => (
              <HowTag key={h} how={h} />
            ))}
          </div>
          <nav aria-label="Feature groups" className="reveal mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_GROUPS.map((g, i) => (
              <a key={g.id} href={`#${g.id}`} className="group flex items-center gap-3 rounded-2xl border border-cream/10 bg-night/60 p-4 transition-colors hover:border-sunset/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-sunset/30 bg-sunset/10">
                  <Icon name={g.icon} className="size-5 text-sunset" />
                </span>
                <span>
                  <span className="block font-mono text-[10px] text-cream/40">0{i + 1}</span>
                  <span className="block text-sm font-semibold text-cream group-hover:text-sunset">{g.eyebrow}</span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── feature groups ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-24 sm:px-6 lg:px-8">
        {FEATURE_GROUPS.map((g, gi) => (
          <section key={g.id} id={g.id} className="reveal scroll-mt-24 rounded-3xl border border-cream/10 bg-night/60 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.6fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl border border-sunset/30 bg-sunset/10">
                    <Icon name={g.icon} className="size-5 text-sunset" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sand/70">
                    0{gi + 1} · {g.eyebrow}
                  </span>
                </div>
                <h2 className="mt-5 text-balance text-2xl font-semibold leading-tight text-cream sm:text-3xl">{g.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">{g.intro}</p>
              </div>
              <ul className="grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 sm:grid-cols-2">
                {g.features.map((f, fi) => (
                  <li key={f.title} className={`bg-midnight p-5 ${g.features.length % 2 && fi === g.features.length - 1 ? "sm:col-span-2" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-cream">{f.title}</h3>
                      <HowTag how={f.how} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-cream/60">{f.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
        <div className="reveal flex flex-wrap justify-center gap-3 pt-4">
          <GoldButton href="/pricing">Build your tour &amp; see the price</GoldButton>
          <GhostButton href="/industries">Who it is for</GhostButton>
        </div>
      </div>

      {/* ── vision ──────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute right-[-10%] top-10 -z-10 size-[520px] rounded-full bg-bronze/25 blur-[140px]" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="reveal max-w-3xl">
            <Eyebrow>Our vision</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.08] text-cream sm:text-5xl">
              <span className="text-gold-grad">{VISION.line}</span>
            </h2>
          </div>
          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VISION.beats.map((b, i) => (
              <li key={b.title} className={`reveal reveal-d${(i % 3) + 1} rounded-2xl border border-cream/10 bg-night/70 p-6`}>
                <span className="font-display text-3xl font-bold text-gold-grad">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-cream">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-cream/60">{b.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
