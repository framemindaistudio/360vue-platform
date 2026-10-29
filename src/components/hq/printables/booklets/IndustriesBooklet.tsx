"use client";

import { Briefcase, Building, Check, Dumbbell, GraduationCap, Hotel, LandPlot, Mountain, PartyPopper, Stethoscope, Store, TreePalm, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { useRates } from "@/components/hq/data";
import { Loading } from "@/components/hq/ui";
import { SKYVUE_LAUNCH } from "@/lib/content/catalog";
import { INDUSTRIES, type Industry } from "@/lib/site-content";
import { formatINR } from "@/lib/utils";
import { BackCover, BookletShell, C, Cover, FillPhoto, Gold, Inside, Kicker, type BookletMode } from "./Booklet";

const ICONS: Record<string, LucideIcon> = { Briefcase, Building, Dumbbell, GraduationCap, Hotel, LandPlot, Mountain, PartyPopper, Stethoscope, Store, TreePalm, UtensilsCrossed };

function Card({ ind, i }: { ind: Industry; i: number }) {
  const I = ICONS[ind.icon] ?? Building;
  return (
    <article className="grid h-[78mm] grid-cols-[72mm_1fr] overflow-hidden rounded-[4mm]" style={{ background: "#ffffff", border: `0.25mm solid ${C.line}` }}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ind.image}-sm.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <span className="absolute left-[3.5mm] top-[3.5mm] grid size-[10mm] place-items-center rounded-[2.5mm]" style={{ background: "rgba(14,11,8,0.82)" }}>
          <I className="size-[5mm]" style={{ color: C.sunset }} strokeWidth={1.6} />
        </span>
        <span className="absolute bottom-[3mm] left-[3.5mm] font-display text-[20pt] font-bold leading-none" style={{ color: "rgba(249,245,237,0.92)" }}>
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col p-[5mm]">
        <h3 className="font-display text-[13pt] font-bold leading-tight">{ind.name}</h3>
        <p className="mt-[1.2mm] text-[9pt] font-semibold leading-snug" style={{ color: C.bronze }}>{ind.hook}</p>
        <p className="mt-[2mm] text-[8pt] leading-[1.45]" style={{ opacity: 0.68 }}>{ind.shows}</p>
        <p className="mt-auto border-t pt-[2mm] text-[6pt] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: C.line, opacity: 0.5 }}>Features they use most</p>
        <ul className="mt-[1.5mm] grid grid-cols-2 gap-x-[3mm] gap-y-[1mm]">
          {ind.uses.map((u) => (
            <li key={u} className="flex gap-[1.5mm] text-[7.4pt] leading-[1.3]">
              <Check className="mt-[0.3mm] size-[3mm] shrink-0" style={{ color: C.gold }} strokeWidth={2.6} /> {u}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

const FIT = [
  ["Customers choose by how it looks", "The room, the hall, the view or the shop floor is part of what they buy."],
  ["They visit before they buy", "Site visits, viewings, walk-ins — a tour does the first visit for them."],
  ["You have more than one space", "Several rooms, floors or areas that photos cannot connect."],
  ["Customers come from far", "Other cities, other states, abroad — or simply busy people deciding from home."],
];

export function IndustriesBooklet({ mode, preparedFor }: { mode: BookletMode; preparedFor?: string }) {
  const rates = useRates();
  if (!rates) return <Loading label="Loading the rate card…" />;
  const plans = rates.services.find((s) => s.id === "tours")?.groups.find((g) => g.id === "package")?.options ?? [];
  const sky = rates.services.find((s) => s.id === "aerial")?.groups.find((g) => g.id === "package")?.options ?? [];
  const spatial = rates.services.find((s) => s.id === "spatial")?.groups.find((g) => g.id === "package")?.options ?? [];
  const thirds = [0, 3, 6, 9].map((i) => INDUSTRIES.slice(i, i + 3));

  const pages: ((n: number) => React.ReactNode)[] = [
    () => (
      <Cover
        image="/media/booklet/cover-industries.webp"
        focus="50% 100%"
        kicker="Who it is for"
        title={<>Where the space<br /><Gold>is the decision.</Gold></>}
        sub="Twelve kinds of business a 360° tour pays off for — what each one shows, and the features it uses most."
        chips={["Stays & hotels", "Food & venues", "Property & land", "Retail, schools & more"]}
        preparedFor={preparedFor}
      />
    ),
    // 2 — is a tour right for you
    (n) => (
      <Inside n={n} section="Is a tour right for you?">
        <Kicker>The simple test</Kicker>
        <h2 className="mt-[4mm] font-display text-[26pt] font-bold leading-[1.04] tracking-[-0.02em]">
          If customers need to <Gold>see it to choose it,</Gold> a tour pays off.
        </h2>
        <div className="mt-[8mm] grid grid-cols-2 gap-[4mm]">
          {FIT.map(([t, d], i) => (
            <div key={t} className="rounded-[3.5mm] p-[5mm]" style={{ background: "#ffffff", border: `0.25mm solid ${C.line}` }}>
              <p className="font-display text-[18pt] font-bold leading-none" style={{ color: C.gold }}>{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-[2.5mm] text-[10.5pt] font-bold">{t}</p>
              <p className="mt-[1.2mm] text-[8.3pt] leading-[1.45]" style={{ opacity: 0.68 }}>{d}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-[7mm] min-h-[88mm] flex-1 overflow-hidden rounded-[4mm]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/restaurant.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(14,11,8,0.88), rgba(14,11,8,0.1) 75%)" }} />
          <div className="absolute bottom-[7mm] left-[7mm] max-w-[100mm]">
            <p className="font-display text-[17pt] font-bold leading-[1.15]" style={{ color: C.cream }}>
              Two or more ticks? <span style={{ color: C.sunset }}>You are losing customers to photos.</span>
            </p>
            <p className="mt-[2.5mm] text-[8.5pt] leading-[1.5]" style={{ color: "rgba(249,245,237,0.75)" }}>
              Over the next pages: twelve businesses, what they show and the features they lean on.
            </p>
          </div>
        </div>
      </Inside>
    ),
    // 3–6 — three industries per page
    ...thirds.map((list, ti) => function IndustryPage(n: number) { return (
      <Inside n={n} section={`Industries · ${ti * 3 + 1}–${ti * 3 + 3} of 12`}>
        <div className="flex h-full flex-col justify-between">
          {list.map((ind, i) => <Card key={ind.id} ind={ind} i={ti * 3 + i} />)}
        </div>
      </Inside>
    ); }),
    // 7 — which plan fits
    (n) => (
      <Inside n={n} section="Find your plan">
        <Kicker>Which plan fits your space</Kicker>
        <h2 className="mt-[4mm] font-display text-[24pt] font-bold leading-[1.04] tracking-[-0.02em]">
          Sized to your space, <Gold>priced in the open.</Gold>
        </h2>
        <div className="mt-[7mm] overflow-hidden rounded-[4mm]" style={{ border: `0.25mm solid ${C.line}` }}>
          {plans.map((o, i) => {
            const [scenes, ...suits] = (o.detail ?? "").split("·").map((s) => s.trim());
            return (
              <div key={o.id} className="grid grid-cols-[38mm_1fr_32mm] items-center gap-[4mm] px-[5mm] py-[4mm]" style={{ background: i % 2 ? "#ffffff" : "rgba(235,214,181,0.25)" }}>
                <div>
                  <p className="font-display text-[12pt] font-bold">{o.label}</p>
                  <p className="text-[7pt] font-semibold uppercase tracking-[0.12em]" style={{ color: C.bronze }}>{scenes}</p>
                </div>
                <p className="text-[8.5pt] leading-[1.4]" style={{ opacity: 0.75 }}>{suits.join(" · ")}</p>
                <p className="text-right font-display text-[15pt] font-bold" style={{ color: C.gold }}>{formatINR(o.price)}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-[6mm] grid grid-cols-2 gap-[5mm]">
          <div className="rounded-[4mm] p-[5mm]" style={{ background: C.ink, color: C.cream }}>
            <Kicker light>Land, resorts & campuses</Kicker>
            <p className="mt-[3mm] text-[11pt] font-bold">SkyVUE aerial 360°</p>
            <p className="mt-[1.5mm] text-[8pt] leading-[1.45]" style={{ color: "rgba(249,245,237,0.68)" }}>
              Plots, boundaries and nearby landmarks from 120 m up. Flights from {SKYVUE_LAUNCH}.
            </p>
            {sky[0] && <p className="mt-[3mm] font-display text-[15pt] font-bold" style={{ color: C.sunset }}>from {formatINR(Math.min(...sky.map((o) => o.price)))}</p>}
          </div>
          <div className="rounded-[4mm] p-[5mm]" style={{ background: C.ink, color: C.cream }}>
            <Kicker light>Developers & showrooms</Kicker>
            <p className="mt-[3mm] text-[11pt] font-bold">Floor plans, 3D & virtual showrooms</p>
            <p className="mt-[1.5mm] text-[8pt] leading-[1.45]" style={{ color: "rgba(249,245,237,0.68)" }}>
              Measured plans, 3D dollhouse walkthroughs and products you can tap to buy.
            </p>
            {spatial[0] && <p className="mt-[3mm] font-display text-[15pt] font-bold" style={{ color: C.sunset }}>from {formatINR(Math.min(...spatial.map((o) => o.price)))}</p>}
          </div>
        </div>
        <FillPhoto src="/media/aerial-resort.webp">
          <p className="font-display text-[16pt] font-bold leading-[1.15]">
            Every plan, <span style={{ color: C.sunset }}>the same promises.</span>
          </p>
          <p className="mt-[2mm] max-w-[140mm] text-[8.5pt] leading-[1.5]" style={{ color: "rgba(249,245,237,0.78)" }}>
            Google Maps publishing, a contact panel with a Call button, one link and website code, and 12 months of hosting — in every plan. The price list has every add-on.
          </p>
        </FillPhoto>
      </Inside>
    ),
    () => (
      <BackCover
        headline={<>Your business, <span style={{ color: C.sunset }}>open before you open.</span></>}
        line="Scan the code to see how a tour works for businesses like yours — then tell us about your space."
        qrPath="/industries"
        qrLabel="Your industry"
      />
    ),
  ];

  return <BookletShell title="Industries booklet" mode={mode} pages={pages} />;
}
