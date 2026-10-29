"use client";

import { Check } from "lucide-react";
import { useRates, useSettings } from "@/components/hq/data";
import { Loading } from "@/components/hq/ui";
import { SKYVUE_LAUNCH, TERMS, type ServiceGroup, type ServiceOption } from "@/lib/content/catalog";
import { formatINR } from "@/lib/utils";
import { BackCover, BookletShell, C, Cover, FillPhoto, Gold, Inside, Kicker, type BookletMode } from "./Booklet";

const price = (o: ServiceOption) => (o.price ? `${formatINR(o.price)}${o.upTo ? `–${formatINR(o.upTo)}` : ""}` : "Included");

/** A priced line: name and detail on the left, the price on the right. */
function Row({ o, dark }: { o: ServiceOption; dark?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-[5mm] border-b py-[2.1mm]" style={{ borderColor: dark ? "rgba(249,245,237,0.12)" : C.line, breakInside: "avoid" }}>
      <div>
        <p className="text-[9.5pt] font-semibold leading-tight">{o.label}</p>
        {o.detail && <p className="mt-[0.8mm] text-[7.5pt] leading-[1.4]" style={{ opacity: 0.62 }}>{o.detail}</p>}
      </div>
      <p className="shrink-0 whitespace-nowrap text-right font-display text-[11pt] font-bold leading-tight" style={{ color: o.price ? C.gold : dark ? C.sand : C.bronze }}>
        {price(o)}
        {o.unit && o.price ? <span className="text-[7.5pt] font-medium" style={{ opacity: 0.75 }}>{o.unit}</span> : null}
      </p>
    </div>
  );
}

function GroupBlock({ g, dark, intro }: { g: ServiceGroup; dark?: boolean; intro?: string }) {
  return (
    <section className="mb-[6mm]">
      <h3 className="font-display text-[14pt] font-bold tracking-[-0.01em]">{g.title}</h3>
      {(intro || g.help) && <p className="mt-[1mm] text-[8pt] leading-[1.45]" style={{ opacity: 0.6 }}>{intro || g.help}</p>}
      <div className="mt-[2mm]">
        {g.options.map((o) => (
          <Row key={o.id} o={o} dark={dark} />
        ))}
      </div>
      {g.note && <p className="mt-[1.5mm] text-[7pt] italic" style={{ opacity: 0.55 }}>{g.note}</p>}
    </section>
  );
}

/** A plan as a big card. */
function PlanCard({ o, accent }: { o: ServiceOption; accent?: boolean }) {
  const [scenes, ...suits] = (o.detail ?? "").split("·").map((s) => s.trim());
  return (
    <div className="relative flex flex-col rounded-[4mm] border p-[5mm]" style={{ borderColor: accent ? C.gold : C.line, background: accent ? C.ink : "#ffffff", color: accent ? C.cream : C.ink }}>
      {o.badge && (
        <span className="absolute -top-[2.6mm] left-[5mm] rounded-full px-[2.5mm] py-[0.6mm] text-[6.5pt] font-bold uppercase tracking-[0.15em]" style={{ background: C.sunset, color: C.ink }}>
          {o.badge}
        </span>
      )}
      <p className="font-display text-[15pt] font-bold">{o.label}</p>
      <p className="mt-[1mm] text-[8pt] font-semibold uppercase tracking-[0.14em]" style={{ color: accent ? C.sand : C.bronze }}>{scenes}</p>
      <p className="mt-[4mm] font-display text-[24pt] font-bold leading-none" style={{ color: C.gold }}>{formatINR(o.price)}</p>
      {suits.length > 0 && <p className="mt-[3mm] text-[8.5pt] leading-[1.45]" style={{ opacity: 0.7 }}>{suits.join(" · ")}</p>}
    </div>
  );
}

export function PricingBooklet({ mode, preparedFor }: { mode: BookletMode; preparedFor?: string }) {
  const rates = useRates();
  const { settings } = useSettings();
  if (!rates) return <Loading label="Loading the rate card…" />;

  const svc = (id: string) => rates.services.find((s) => s.id === id);
  const grp = (sid: string, gid: string) => svc(sid)?.groups.find((g) => g.id === gid);
  const tours = svc("tours");
  const plans = grp("tours", "package")?.options ?? [];
  const sky = svc("aerial");
  const spatial = svc("spatial");
  const hosting = svc("hosting");
  const gst = settings.gstRegistered ? `All prices are in Indian rupees, before GST (${rates.gstPercent}%), which is shown separately on the invoice.` : "All prices are in Indian rupees. No GST is charged: 360VUE is not GST-registered yet.";
  const extraScene = grp("tours", "scale")?.options.find((o) => o.id === "extra-scene");

  const pages: ((n: number) => React.ReactNode)[] = [
    // 1 — cover
    () => (
      <Cover
        image="/media/pano-lobby.webp"
        kicker="Price list"
        title={<>Clear prices.<br /><Gold>Every angle.</Gold></>}
        sub="360° virtual tours, SkyVUE aerial views and 3D walkthroughs — every plan and add-on with its price, written down before anything starts."
        chips={["360° tours", "SkyVUE aerial", "3D & floor plans", "Hosting & care"]}
        preparedFor={preparedFor}
      />
    ),
    // 2 — how pricing works
    (n) => (
      <Inside n={n} section="How our pricing works">
        <Kicker>Three steps, no surprises</Kicker>
        <h2 className="mt-[4mm] font-display text-[26pt] font-bold leading-[1.04] tracking-[-0.02em]">
          You pay for the <Gold>views</Gold>, not for guesswork.
        </h2>
        <div className="mt-[8mm] grid grid-cols-3 gap-[4mm]">
          {[
            ["01", "Pick a plan", "Plans are priced by scenes. One scene is one 360° viewpoint — usually one per room, more for big halls."],
            ["02", "Add what you need", "WhatsApp buttons, info points, videos, languages… each add-on has its own fixed price."],
            ["03", "Get it in writing", `A written quote with scope, capture date and total. It holds for ${rates.terms.validityDays} days.`],
          ].map(([k, t, d]) => (
            <div key={k} className="rounded-[3.5mm] p-[5mm]" style={{ background: "#ffffff", border: `0.3mm solid ${C.line}` }}>
              <p className="font-display text-[22pt] font-bold leading-none" style={{ color: C.gold }}>{k}</p>
              <p className="mt-[3mm] text-[11pt] font-bold">{t}</p>
              <p className="mt-[1.5mm] text-[8.5pt] leading-[1.5]" style={{ opacity: 0.68 }}>{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-[9mm] grid grid-cols-[1.25fr_1fr] gap-[6mm]">
          <div className="rounded-[4mm] p-[6mm]" style={{ background: C.ink, color: C.cream }}>
            <Kicker light>In every tour, at no extra cost</Kicker>
            <ul className="mt-[4mm] space-y-[2.4mm]">
              {(tours?.included ?? []).map((t) => (
                <li key={t} className="flex gap-[2.5mm] text-[9pt] leading-[1.4]">
                  <Check className="mt-[0.6mm] size-[3.6mm] shrink-0" style={{ color: C.sunset }} strokeWidth={2.4} /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[4mm]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/phone-tour-sm.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          </div>
        </div>
        <p className="mt-[6mm] text-[8pt] leading-[1.5]" style={{ opacity: 0.6 }}>
          {gst} {TERMS.pricesFinal}
        </p>
      </Inside>
    ),
    // 3 — tour plans
    (n) => (
      <Inside n={n} section="360° tour plans">
        <Kicker>360° virtual tours</Kicker>
        <h2 className="mt-[4mm] font-display text-[26pt] font-bold leading-[1.04] tracking-[-0.02em]">
          From a café to a <Gold>campus.</Gold>
        </h2>
        <p className="mt-[3mm] max-w-[160mm] text-[10pt] leading-[1.55]" style={{ opacity: 0.7 }}>
          {tours?.description}
        </p>
        <div className="mt-[9mm] grid grid-cols-2 gap-[5mm]">
          {plans.map((o) => (
            <PlanCard key={o.id} o={o} accent={!!o.badge} />
          ))}
        </div>
        <div className="mt-[8mm] flex items-center gap-[6mm] rounded-[4mm] border p-[5mm]" style={{ borderColor: C.gold, background: "rgba(217,149,63,0.08)" }}>
          <p className="font-display text-[28pt] font-bold leading-none" style={{ color: C.gold }}>+</p>
          <p className="text-[9.5pt] leading-[1.5]">
            <strong>Bigger space?</strong> Add scenes one by one{extraScene ? ` at ${formatINR(extraScene.price)} each` : ""}. Tell us the area, floors and rooms and we work out the exact count — about one scene per 350 sq ft of open space, at least one per room.
          </p>
        </div>
      </Inside>
    ),
    // 4 — add to your tour
    (n) => (
      <Inside n={n} section="Add-ons">
        <Kicker>Make it work harder</Kicker>
        <h2 className="mt-[4mm] font-display text-[24pt] font-bold leading-[1.04] tracking-[-0.02em]">
          Add only what <Gold>you need.</Gold>
        </h2>
        <div className="mt-[6mm]">
          {grp("tours", "interactive") && <GroupBlock g={grp("tours", "interactive")!} />}
          {grp("tours", "scale") && <GroupBlock g={grp("tours", "scale")!} />}
        </div>
      </Inside>
    ),
    // 5 — publishing, capture, finishing
    (n) => (
      <Inside n={n} section="Add-ons">
        <div className="relative -mx-[14mm] -mt-[9mm] mb-[7mm] h-[58mm] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/capture-cafe.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(14,11,8,0.85), rgba(14,11,8,0.1))" }} />
          <div className="absolute bottom-[7mm] left-[14mm]">
            <Kicker light>Capture, finishing &amp; publishing</Kicker>
            <p className="mt-[3mm] font-display text-[20pt] font-bold leading-tight" style={{ color: C.cream }}>
              Polished before you <span style={{ color: C.sunset }}>see it.</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-[7mm]">
          <div>
            {grp("tours", "publishing") && <GroupBlock g={grp("tours", "publishing")!} />}
            {grp("tours", "retouch") && <GroupBlock g={grp("tours", "retouch")!} />}
          </div>
          <div>{grp("tours", "delivery") && <GroupBlock g={grp("tours", "delivery")!} />}</div>
        </div>
        <FillPhoto src="/media/capture-banquet.webp">
          <p className="text-[7pt] font-semibold uppercase tracking-[0.25em]" style={{ color: C.sunset }}>Good to know</p>
          <div className="mt-[2.5mm] grid grid-cols-3 gap-[5mm] text-[8pt] leading-[1.45]">
            <p><strong style={{ color: C.sand }}>Google Maps is free.</strong> Publishing to Maps and Street View comes with every plan.</p>
            <p><strong style={{ color: C.sand }}>A year of hosting.</strong> Your link and website embed stay live for 12 months, included.</p>
            <p><strong style={{ color: C.sand }}>Travel included</strong> within 25 km of our base; beyond that at actual cost, on the quote.</p>
          </div>
        </FillPhoto>
      </Inside>
    ),
    // 6 — SkyVUE
    (n) => (
      <Inside n={n} section="SkyVUE aerial 360°" dark>
        <div className="relative -mx-[14mm] -mt-[9mm] mb-[7mm] h-[78mm] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/aerial-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(14,11,8,0.1), #0e0b08)" }} />
          <div className="absolute bottom-[4mm] left-[14mm] right-[14mm]">
            <Kicker light>SkyVUE · flights from {SKYVUE_LAUNCH}</Kicker>
            <h2 className="mt-[3mm] font-display text-[24pt] font-bold leading-[1.04]" style={{ color: C.cream }}>
              Show where you are, <span style={{ color: C.sunset }}>from 120 m up.</span>
            </h2>
          </div>
        </div>
        <p className="text-[9pt] leading-[1.55]" style={{ color: "rgba(249,245,237,0.72)" }}>{sky?.description}</p>
        <div className="mt-[5mm] grid grid-cols-3 gap-[3.5mm]">
          {(sky?.groups.find((g) => g.id === "package")?.options ?? []).map((o) => {
            const [what, ...suits] = (o.detail ?? "").split("·").map((s) => s.trim());
            return (
              <div key={o.id} className="relative rounded-[3.5mm] border p-[4mm]" style={{ borderColor: o.badge ? C.gold : "rgba(249,245,237,0.15)", background: C.night }}>
                {o.badge && <span className="absolute -top-[2.4mm] left-[4mm] rounded-full px-[2mm] py-[0.4mm] text-[6pt] font-bold uppercase tracking-[0.14em]" style={{ background: C.sunset, color: C.ink }}>{o.badge}</span>}
                <p className="text-[10.5pt] font-bold" style={{ color: C.cream }}>{o.label.replace("SkyVUE ", "")}</p>
                <p className="mt-[2mm] font-display text-[17pt] font-bold leading-none" style={{ color: C.gold }}>{formatINR(o.price)}</p>
                <p className="mt-[2.5mm] text-[7.5pt] leading-[1.45]" style={{ color: "rgba(249,245,237,0.62)" }}>{[what, ...suits].join(" · ")}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-[5mm]" style={{ color: C.cream }}>
          {sky?.groups.filter((g) => g.id !== "package").map((g) => <GroupBlock key={g.id} g={g} dark />)}
        </div>
      </Inside>
    ),
    // 7 — 3D, hosting, bundles
    (n) => (
      <Inside n={n} section="3D, hosting & savings">
        <div className="grid grid-cols-2 gap-x-[7mm]">
          <div>
            <Kicker>360VUE Spatial</Kicker>
            <h2 className="mt-[3mm] font-display text-[18pt] font-bold leading-[1.08]">3D, floor plans &amp; <Gold>showrooms</Gold></h2>
            <div className="mt-[3mm]">{spatial?.groups.map((g) => <GroupBlock key={g.id} g={g} />)}</div>
          </div>
          <div>
            <Kicker>After the first free year</Kicker>
            <h2 className="mt-[3mm] font-display text-[18pt] font-bold leading-[1.08]">Hosting &amp; <Gold>care</Gold></h2>
            <p className="mt-[2mm] text-[8pt] leading-[1.45]" style={{ opacity: 0.62 }}>{hosting?.description}</p>
            <div className="mt-[3mm]">
              {(hosting?.groups[0]?.options ?? []).map((o) => (
                <Row key={o.id} o={{ ...o, unit: "/month" }} />
              ))}
            </div>
            {rates.socialContracts.length > 0 && (
              <p className="mt-[3mm] text-[8pt] leading-[1.5]" style={{ opacity: 0.7 }}>
                <strong>Pay ahead, pay less:</strong> {rates.socialContracts.filter((c) => c.discountPercent).map((c) => `${c.label} ${c.discountPercent}% off`).join(" · ")}
              </p>
            )}
          </div>
        </div>
        {rates.bundleSteps.length > 0 && (
          <div className="mt-[8mm] rounded-[4mm] p-[6mm]" style={{ background: C.ink, color: C.cream }}>
            <Kicker light>Book together, save more</Kicker>
            <p className="mt-[3mm] text-[9pt] leading-[1.5]" style={{ color: "rgba(249,245,237,0.72)" }}>
              Take a tour with SkyVUE, a floor plan or a virtual showroom, and the one-time work costs less:
            </p>
            <div className="mt-[4mm] flex gap-[4mm]">
              {rates.bundleSteps.map((b, i, all) => (
                <div key={b.services} className="flex-1 rounded-[3mm] border p-[4mm] text-center" style={{ borderColor: "rgba(245,158,76,0.4)" }}>
                  <p className="font-display text-[22pt] font-bold leading-none" style={{ color: C.sunset }}>{b.discountPercent}%</p>
                  <p className="mt-[1.5mm] text-[8pt] uppercase tracking-[0.14em]" style={{ color: C.sand }}>{i === all.length - 1 ? `${b.services}+` : b.services} services</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-[7mm] grid grid-cols-2 gap-[6mm] text-[7.5pt] leading-[1.5]" style={{ opacity: 0.7 }}>
          <p><strong>Payment.</strong> {TERMS.paymentTerms}</p>
          <p><strong>Revisions.</strong> {TERMS.revisionPolicy}</p>
        </div>
        <FillPhoto src="/media/realestate.webp" min={30} />
      </Inside>
    ),
    // 8 — back cover
    () => (
      <BackCover
        headline={<>Your exact price, <span style={{ color: C.sunset }}>in two minutes.</span></>}
        line="Scan the code, enter your area, floors and rooms, tick the add-ons you want and see your total — then book a capture date."
        qrPath="/pricing"
        qrLabel="Price your tour"
      />
    ),
  ];

  return <BookletShell title="Pricing booklet" mode={mode} pages={pages} />;
}
