"use client";

import { BookOpen, Footprints, Map, MessageCircle, Palette, Search, ShoppingBag, Sparkles, type LucideIcon } from "lucide-react";
import { TERMS } from "@/lib/content/catalog";
import { FEATURE_GROUPS, HOW_LABEL, VISION, type FeatureGroup, type How } from "@/lib/content/tour-features";
import { BackCover, BookletShell, C, Cover, FillPhoto, Gold, Inside, Kicker, type BookletMode } from "./Booklet";

const ICONS: Record<string, LucideIcon> = { BookOpen, Footprints, Map, MessageCircle, Palette, Search, ShoppingBag, Sparkles };

const TAG: Record<How, { bg: string; fg: string }> = {
  included: { bg: "rgba(16,122,87,0.12)", fg: "#0f7a57" },
  addon: { bg: "rgba(217,149,63,0.16)", fg: "#9a5a31" },
  plan: { bg: "rgba(37,99,160,0.12)", fg: "#24609c" },
  request: { bg: "rgba(14,11,8,0.08)", fg: "#4a4038" },
};

function Tag({ how }: { how: How }) {
  return (
    <span className="inline-block shrink-0 rounded-full px-[2mm] py-[0.5mm] text-[5.8pt] font-bold uppercase tracking-[0.12em]" style={{ background: TAG[how].bg, color: TAG[how].fg }}>
      {HOW_LABEL[how]}
    </span>
  );
}

function Group({ g, i }: { g: FeatureGroup; i: number }) {
  const I = ICONS[g.icon] ?? Sparkles;
  return (
    <section className="mb-[7mm]">
      <div className="flex items-start gap-[4mm]">
        <span className="grid size-[11mm] shrink-0 place-items-center rounded-[3mm]" style={{ background: C.ink }}>
          <I className="size-[5.5mm]" style={{ color: C.sunset }} strokeWidth={1.6} />
        </span>
        <div>
          <p className="text-[7pt] font-semibold uppercase tracking-[0.25em]" style={{ color: C.bronze }}>
            {String(i + 1).padStart(2, "0")} · {g.eyebrow}
          </p>
          <h2 className="mt-[1.2mm] font-display text-[15pt] font-bold leading-[1.12] tracking-[-0.01em]">{g.title}</h2>
        </div>
      </div>
      <div className="mt-[4mm] grid grid-cols-2 gap-[2.5mm]">
        {g.features.map((f, fi) => (
          <div key={f.title} className={`rounded-[2.5mm] p-[3.2mm] ${g.features.length % 2 && fi === g.features.length - 1 ? "col-span-2" : ""}`} style={{ background: "#ffffff", border: `0.25mm solid ${C.line}` }}>
            <div className="flex items-start justify-between gap-[2mm]">
              <p className="text-[9pt] font-bold leading-tight">{f.title}</p>
              <Tag how={f.how} />
            </div>
            <p className="mt-[1.2mm] text-[7.6pt] leading-[1.42]" style={{ opacity: 0.68 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STORY = [
  ["Friday, 10:40 pm", "Ananya is planning a long weekend for her parents' anniversary. Three stays look the same in photos. One has a link that says “Walk around”."],
  ["10:42 pm", "The tour opens high above the river. She sees the stay, the boulders, and how far the temple is. She taps the cottage and drops onto its veranda."],
  ["10:47 pm", "She walks through the room, checks the bathroom, opens the dinner menu and watches a short video of the sunset deck. She sends the link to her brother: “This one?”"],
  ["10:55 pm", "He replies “Book it.” She taps WhatsApp inside the tour. The owner gets a message saying which cottage she was looking at."],
];

const PREP = [
  ["Lights on", "Every light working, blinds set the same way in every room."],
  ["Clutter cleared", "Bags, boxes, cables and paperwork out of sight."],
  ["People informed", "Staff and guests know a capture is happening."],
  ["Private areas listed", "Tell us what not to capture. We never do."],
];

export function FeaturesBooklet({ mode, preparedFor }: { mode: BookletMode; preparedFor?: string }) {
  const total = FEATURE_GROUPS.reduce((n, g) => n + g.features.length, 0);
  const pairs = [0, 2, 4, 6].map((i) => FEATURE_GROUPS.slice(i, i + 2));

  const pages: ((n: number) => React.ReactNode)[] = [
    () => (
      <Cover
        image="/media/booklet/cover-features.webp"
        kicker="Tour features"
        title={<>Not a photo gallery.<br /><Gold>A front door, open 24×7.</Gold></>}
        titlePt={36}
        art={{ width: 80, top: 20 }}
        sub={`A 360VUE tour lets customers walk through your space, ask it questions and reach you — from any phone, at any hour. Here are all ${total} things it can do.`}
        chips={["Walk room to room", "WhatsApp from the tour", "Google Maps", "Aerial to inside"]}
        preparedFor={preparedFor}
      />
    ),
    // 2 — story + vision
    (n) => (
      <Inside n={n} section="Why a tour">
        <Kicker>Fifteen minutes on a Friday night</Kicker>
        <h2 className="mt-[4mm] font-display text-[26pt] font-bold leading-[1.04] tracking-[-0.02em]">
          The booking happened <Gold>before anyone visited.</Gold>
        </h2>
        <p className="mt-[3mm] max-w-[165mm] text-[10pt] leading-[1.55]" style={{ opacity: 0.7 }}>
          This is how people choose now: late at night, on a phone, comparing you with three others. The business that lets them look around wins the booking.
        </p>
        <ol className="relative mt-[7mm] space-y-[5mm] border-l-[0.4mm] pl-[7mm]" style={{ borderColor: C.gold }}>
          {STORY.map(([t, d]) => (
            <li key={t} className="relative">
              <span className="absolute -left-[9.3mm] top-[1mm] size-[3.6mm] rounded-full" style={{ background: C.gold, boxShadow: `0 0 0 1.2mm ${C.paper}` }} />
              <p className="font-mono text-[8pt] font-semibold" style={{ color: C.bronze }}>{t}</p>
              <p className="mt-[1mm] text-[9.5pt] leading-[1.5]">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-[3mm] text-[7pt] italic" style={{ opacity: 0.45 }}>An illustrative story, not a client case.</p>
        <FillPhoto src="/media/aerial-resort.webp" min={30} />
        <div className="mt-[6mm] rounded-[4mm] p-[6mm]" style={{ background: C.ink, color: C.cream }}>
          <Kicker light>Our vision</Kicker>
          <p className="mt-[3mm] font-display text-[17pt] font-bold leading-[1.15]" style={{ color: C.sunset }}>{VISION.line}</p>
          <div className="mt-[4mm] grid grid-cols-2 gap-x-[6mm] gap-y-[3mm]">
            {VISION.beats.map((b) => (
              <div key={b.title}>
                <p className="text-[8.5pt] font-bold" style={{ color: C.cream }}>{b.title}</p>
                <p className="mt-[0.8mm] text-[7.6pt] leading-[1.45]" style={{ color: "rgba(249,245,237,0.65)" }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Inside>
    ),
    // 3–6 — two feature groups per page
    ...pairs.map((pair, pi) => function FeaturePage(n: number) { return (
      <Inside n={n} section={`Features · ${pi * 2 + 1}–${pi * 2 + 2} of 8`}>
        {pi === 0 && (
          <div className="mb-[5mm] flex flex-wrap items-center gap-[2mm] text-[7pt]" style={{ opacity: 0.8 }}>
            <span className="mr-[1mm] font-semibold">How you get each feature:</span>
            {(["included", "addon", "plan"] as How[]).map((h) => <Tag key={h} how={h} />)}
          </div>
        )}
        {pair.map((g, gi) => <Group key={g.id} g={g} i={pi * 2 + gi} />)}
        {pi >= 2 && (
          <FillPhoto src={pi === 2 ? "/media/showroom-virtual.webp" : "/media/phone-maps.webp"}>
            <p className="font-display text-[17pt] font-bold leading-[1.15]">
              {pi === 2 ? <>Your shop floor, <span style={{ color: C.sunset }}>open at midnight.</span></> : <>Found on Google Maps. <span style={{ color: C.sunset }}>Walked from the sofa.</span></>}
            </p>
            <p className="mt-[2mm] max-w-[130mm] text-[8.5pt] leading-[1.5]" style={{ color: "rgba(249,245,237,0.75)" }}>
              {pi === 2 ? "Customers browse, tap a product and send you a WhatsApp about exactly that piece." : "One capture works on your Maps listing, your website, Instagram, WhatsApp and every printed QR code."}
            </p>
          </FillPhoto>
        )}
      </Inside>
    ); }),
    // 7 — how it works
    (n) => (
      <Inside n={n} section="How it works">
        <Kicker>From first call to a live tour</Kicker>
        <h2 className="mt-[4mm] font-display text-[24pt] font-bold leading-[1.04] tracking-[-0.02em]">
          The same eight steps, <Gold>every project.</Gold>
        </h2>
        <ol className="mt-[7mm] grid grid-cols-2 gap-[3mm]">
          {TERMS.process.map((s, i) => (
            <li key={s.title} className="flex gap-[3.5mm] rounded-[3mm] p-[4mm]" style={{ background: "#ffffff", border: `0.25mm solid ${C.line}` }}>
              <span className="font-display text-[18pt] font-bold leading-none" style={{ color: C.gold }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[9.5pt] font-bold">{s.title}</p>
                <p className="mt-[1mm] text-[7.8pt] leading-[1.45]" style={{ opacity: 0.68 }}>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-[7mm] grid flex-1 grid-cols-[1fr_1.1fr] gap-[5mm]">
          <div className="relative overflow-hidden rounded-[4mm]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/camera-sm.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          </div>
          <div className="rounded-[4mm] p-[5mm]" style={{ background: C.ink, color: C.cream }}>
            <Kicker light>Before we arrive</Kicker>
            <ul className="mt-[3mm] space-y-[2.5mm]">
              {PREP.map(([t, d]) => (
                <li key={t}>
                  <p className="text-[9pt] font-bold" style={{ color: C.sand }}>{t}</p>
                  <p className="text-[7.8pt] leading-[1.4]" style={{ color: "rgba(249,245,237,0.65)" }}>{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Inside>
    ),
    () => (
      <BackCover
        headline={<>See it for yourself, <span style={{ color: C.sunset }}>on your phone.</span></>}
        line="Scan the code to walk through a live demo, see every feature and price the tour for your own space."
        qrPath="/features"
        qrLabel="Every feature"
      />
    ),
  ];

  return <BookletShell title="Features booklet" mode={mode} pages={pages} />;
}
