"use client";

import { useMemo } from "react";
import { PrintShell } from "@/components/print/PrintShell";
import { useSettings } from "@/components/hq/data";
import { EmptyState, Loading } from "@/components/hq/ui";
import type { BaseRecord } from "@/lib/hq/collections";
import { site } from "@/lib/site";
import { Mark, Sheet, Tile } from "../PrintBits";
import { csv, str, type Q } from "../util";
import { usePrintPeople } from "../hooks";
import { Qr } from "../booklets/Booklet";

interface Contact {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  /** the full address the QR code opens */
  url: string;
}

const bare = (url: string) => url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");

/*
 * 360VUE's own card, from the brand board: midnight with gold. Both sides are full-bleed dark, so print on matt
 * card stock with "Background graphics" on. The gold of "VUE" is a solid colour here: gradient-clipped text can
 * print as a solid block.
 */
const MIDNIGHT = "#0E0B08";
const GOLD = "#E8A854";
const SAND = "#EBD6B5";
const CREAM = "#F9F5ED";

/** "360VUE" set in Montserrat, with "VUE" in gold. */
function Word({ pt, className }: { pt: number; className?: string }) {
  return (
    <span className={`font-display font-bold leading-none tracking-[0.01em] ${className ?? ""}`} style={{ fontSize: `${pt}pt`, color: CREAM }}>
      360<span style={{ color: GOLD }}>VUE</span>
    </span>
  );
}

/** Faint contour lines, like the textured card on the brand board. */
function Contours() {
  const rings = Array.from({ length: 11 }, (_, i) => 8 + i * 6);
  return (
    <svg viewBox="0 0 90 54" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {rings.map((r) => (
        <ellipse key={r} cx="22" cy="44" rx={r * 1.25} ry={r} fill="none" stroke={GOLD} strokeOpacity="0.12" strokeWidth="0.22" transform="rotate(-18 22 44)" />
      ))}
    </svg>
  );
}

const ICON: Record<string, React.ReactNode> = {
  phone: <path d="M5.5 2.5h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3L13.5 10l4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A14 14 0 0 1 4 4.1 1.5 1.5 0 0 1 5.5 2.5z" />,
  mail: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="M3 5.5l7 5.5 7-5.5" />
    </>
  ),
  web: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15M10 2.5c2.2 2.3 3.2 4.8 3.2 7.5s-1 5.2-3.2 7.5c-2.2-2.3-3.2-4.8-3.2-7.5s1-5.2 3.2-7.5z" />
    </>
  ),
};

/** Card sizes. The 89 x 51 mm card (3.5 x 2 in) is the online printers' template, cut with rounded corners. */
export const CARD_SIZES = {
  "90x54": { w: 90, h: 54, r: 0, label: "90 × 54 mm" },
  "89x51": { w: 89, h: 51, r: 10, label: "89 × 51 mm (3.5 × 2 in), rounded corners" },
} as const;
export type CardSize = keyof typeof CARD_SIZES;
type Size = (typeof CARD_SIZES)[CardSize];

/** Printers trim each card from a slightly larger sheet; artwork runs this far past the cut on every side. */
const BLEED = 3;

/**
 * One side of a card. `bleed` (mm) grows the artwork past the cut on every side, for printers that want each card as
 * its own page; the content stays where it would be on the trimmed card. With no bleed, the dashed line is the cut,
 * rounded when the size has rounded corners.
 */
function Card({ size, bleed, children, decor }: { size: Size; bleed: number; children: React.ReactNode; decor?: React.ReactNode }) {
  return (
    <Tile
      w={size.w + 2 * bleed}
      h={size.h + 2 * bleed}
      cut={!bleed}
      className="text-left"
      style={{ background: MIDNIGHT, borderRadius: bleed ? 0 : `${size.r}mm` }}
    >
      {decor}
      <div className="absolute" style={{ left: `${bleed}mm`, top: `${bleed}mm`, width: `${size.w}mm`, height: `${size.h}mm` }}>
        {children}
      </div>
    </Tile>
  );
}

/*
 * The front: who you are and how to reach you, with the website's QR code. People keep a card front-up, so the code
 * sits where it is seen and scanned without turning the card over; the back stays the brand side.
 * Everything that matters stays at least 4 mm inside the cut, and clear of the rounded corners on the 89 x 51 card.
 * The QR is 17 mm (16 mm on the smaller card) with a white quiet zone, so a phone reads it at arm's length.
 */
function Front({ c, size, bleed }: { c: Contact; size: Size; bleed: number }) {
  const rows: [keyof typeof ICON, string][] = [
    ["phone", c.phone],
    ["mail", c.email],
    ["web", c.website],
  ];
  const small = size.h < 54;
  const qr = small ? 16 : 17;
  return (
    <Card
      size={size}
      bleed={bleed}
      decor={
        <>
          {/* warm light from the lower left, and a thin gold line along the top (into the bleed, so trimming never shows a gap) */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 90% at 0% 100%, rgba(245,158,76,0.22), rgba(245,158,76,0) 70%)" }} aria-hidden />
          <div className="pointer-events-none absolute left-0 right-0 top-0" style={{ height: `${bleed + 0.9}mm`, background: "linear-gradient(90deg, #A4622C, #FAD696 45%, #E8A854 70%, #9A5A31)" }} aria-hidden />
        </>
      }
    >
      {/* left: the logo, the person, the ways to reach them */}
      <div className="absolute flex flex-col" style={{ left: "6mm", top: small ? "5mm" : "5.6mm", bottom: small ? "4.8mm" : "5.4mm", width: `${size.w - 38}mm` }}>
        <div className="flex items-center gap-[1.5mm]">
          <Mark mm={6} />
          <Word pt={7.6} />
        </div>
        <div className="mt-auto">
          <p className="font-display text-[12.5pt] font-bold leading-[1.05] tracking-[-0.01em]" style={{ color: CREAM }}>
            {c.name}
          </p>
          <p className="mt-[1.1mm] font-display text-[5.4pt] font-semibold uppercase leading-tight tracking-[0.24em]" style={{ color: GOLD }}>
            {c.title}
          </p>
          <span className="block h-[0.3mm] w-[11mm]" style={{ margin: small ? "2mm 0" : "2.4mm 0", background: `linear-gradient(90deg, ${GOLD}, rgba(232,168,84,0))` }} />
          <ul className="space-y-[1mm] text-[6.4pt] leading-tight" style={{ color: "rgba(249,245,237,0.9)" }}>
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <li key={k} className="flex items-center gap-[1.7mm]">
                  <svg viewBox="0 0 20 20" className="shrink-0" style={{ width: "2.5mm", height: "2.5mm" }} fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {ICON[k]}
                  </svg>
                  <span className="truncate font-medium">{v}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* a gold hairline between the two halves */}
      <span className="pointer-events-none absolute w-[0.2mm]" style={{ left: `${size.w - 28}mm`, top: "8mm", bottom: "8mm", background: "linear-gradient(180deg, rgba(232,168,84,0), rgba(232,168,84,0.55), rgba(232,168,84,0))" }} aria-hidden />

      {/* right: the website QR code, centred in the right-hand column */}
      {c.url && (
        <div className="absolute flex w-[21mm] flex-col items-center" style={{ left: `${size.w - 25.5}mm`, top: `${(size.h - qr - 2 - 2 - 5) / 2}mm` }}>
          <div className="rounded-[1.4mm] bg-white p-[1mm]" style={{ boxShadow: "0 0 0 0.25mm rgba(232,168,84,0.6)" }}>
            <Qr url={c.url} mm={qr} dark={MIDNIGHT} />
          </div>
          <p className="mt-[2mm] text-center font-display text-[4.6pt] font-semibold uppercase leading-[1.35] tracking-[0.22em]" style={{ color: SAND }}>
            Scan to see
            <br />
            our work
          </p>
        </div>
      )}
    </Card>
  );
}

function Back({ size, bleed }: { size: Size; bleed: number }) {
  const small = size.h < 54;
  return (
    <Card size={size} bleed={bleed} decor={<Contours />}>
      <div
        className="pointer-events-none absolute inset-[2.6mm] border"
        style={{ borderColor: "rgba(232,168,84,0.28)", borderWidth: "0.2mm", borderRadius: `${Math.max(1, size.r - 2.6)}mm` }}
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: small ? "3mm" : 0 }}>
        <Mark mm={small ? 13.5 : 15} />
        <Word pt={small ? 14 : 15} className="mt-[2.2mm]" />
        <p className="mt-[1.6mm] font-display text-[4.8pt] font-semibold uppercase tracking-[0.5em]" style={{ color: SAND }}>
          See every angle.
        </p>
      </div>
      <p className="absolute inset-x-[7mm] text-center font-display text-[4.4pt] uppercase tracking-[0.28em]" style={{ bottom: small ? "4.6mm" : "5mm", color: "rgba(235,214,181,0.6)" }}>
        Virtual Tours · Google Maps · Immersive Experiences
      </p>
    </Card>
  );
}

/**
 * /hq/print/stationery/visiting-cards?ids=…&size=90x54|89x51&layout=sheet|single&back=1|0
 *  · sheet  — 10 cards per A4, with dashed cut lines: for a local printer or a guillotine.
 *  · single — one card per page, exactly the card plus 3 mm bleed on every side, front then back: the PDF online
 *             printers ask for (upload it to their 3.5 × 2 in template).
 */
export function VisitingCards({ q }: { q: Q }) {
  const { people: everyone, loading, error } = usePrintPeople();
  const { settings } = useSettings();

  const people = useMemo(() => {
    const ids = csv(q.ids);
    const pick: BaseRecord[] = ids.length ? ids.map((id) => everyone.find((r) => r.id === id)).filter((r): r is BaseRecord => !!r) : everyone;
    return pick;
  }, [everyone, q.ids]);

  const size = CARD_SIZES[(q.size as CardSize) in CARD_SIZES ? (q.size as CardSize) : "90x54"];
  const single = q.layout === "single";
  const site0 = settings.website || (/localhost|127\.0\.0\.1/.test(site.url) ? "" : site.url);
  const contacts: Contact[] = people.map((m) => ({
    name: str(m.name),
    title: !str(m.role) || /360vue/i.test(str(m.role)) ? str(m.role) || "360VUE" : `${str(m.role)} · 360VUE`,
    phone: str(m.phone) || settings.phone || site.contact.phone,
    email: str(m.email) || settings.email || site.contact.email,
    website: bare(site0),
    url: site0 ? (/^https?:\/\//i.test(site0) ? site0 : `https://${site0}`) : "",
  }));
  const withBack = q.back !== "0";
  const pw = size.w + 2 * BLEED;
  const ph = size.h + 2 * BLEED;

  const note = single
    ? `${contacts.length} ${contacts.length === 1 ? "person" : "people"} · ${size.label} · one card per page with ${BLEED} mm bleed (${pw} × ${ph} mm)${withBack ? " · front, then back" : ""}`
    : `${contacts.length} ${contacts.length === 1 ? "person" : "people"} · ${size.label} · 10 cards per A4${withBack ? " · front + back sheets" : ""}`;

  return (
    <PrintShell title={`Visiting cards (${size.label})`} back="/hq/printables" toolbar={<span className="text-xs text-blueprint">{note}</span>}>
      {/* a page exactly the card plus bleed (the last @page rule wins over the A4 default) */}
      {single && <style>{`@page { size: ${pw}mm ${ph}mm; margin: 0; }`}</style>}
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="no-print rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>
      ) : !contacts.length ? (
        <EmptyState icon="Users" title="No one selected" description="Choose people in Print Studio. The founders are always listed; add others in HQ → Team & Payroll." />
      ) : single ? (
        contacts.flatMap((c, i) => [
          <div key={`f${i}`} className="print-page shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)]">
            <Front c={c} size={size} bleed={BLEED} />
          </div>,
          ...(withBack
            ? [
                <div key={`b${i}`} className="print-page shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)]">
                  <Back size={size} bleed={BLEED} />
                </div>,
              ]
            : []),
        ])
      ) : (
        contacts.flatMap((c, i) => [
          <Sheet key={`f${i}`} className="flex items-center justify-center">
            <div className="grid grid-cols-2" style={{ width: `${2 * size.w}mm` }}>
              {Array.from({ length: 10 }, (_, j) => (
                <Front key={j} c={c} size={size} bleed={0} />
              ))}
            </div>
          </Sheet>,
          ...(withBack
            ? [
                <Sheet key={`b${i}`} className="flex items-center justify-center">
                  <div className="grid grid-cols-2" style={{ width: `${2 * size.w}mm` }}>
                    {Array.from({ length: 10 }, (_, j) => (
                      <Back key={j} size={size} bleed={0} />
                    ))}
                  </div>
                </Sheet>,
              ]
            : []),
        ])
      )}
    </PrintShell>
  );
}
