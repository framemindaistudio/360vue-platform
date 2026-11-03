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

/*
 * The front: who you are and how to reach you, with the website's QR code. People keep a card front-up, so the code
 * sits where it is seen and scanned without turning the card over; the back stays the brand side.
 * Everything that matters stays at least 4 mm inside the cut. The QR is 17 mm with a white quiet zone, so a phone
 * reads it at arm's length.
 */
function Front({ c }: { c: Contact }) {
  const rows: [keyof typeof ICON, string][] = [
    ["phone", c.phone],
    ["mail", c.email],
    ["web", c.website],
  ];
  return (
    <Tile w={90} h={54} cut className="text-left" style={{ background: MIDNIGHT }}>
      {/* warm light from the lower left, and a thin gold line along the top */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 90% at 0% 100%, rgba(245,158,76,0.22), rgba(245,158,76,0) 70%)" }} aria-hidden />
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[0.9mm]" style={{ background: "linear-gradient(90deg, #A4622C, #FAD696 45%, #E8A854 70%, #9A5A31)" }} aria-hidden />

      {/* left: the logo, the person, the ways to reach them */}
      <div className="absolute bottom-[5.4mm] left-[6mm] top-[5.6mm] flex w-[52mm] flex-col">
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
          <span className="my-[2.4mm] block h-[0.3mm] w-[11mm]" style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(232,168,84,0))` }} />
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
      <span className="pointer-events-none absolute bottom-[8mm] top-[8mm] w-[0.2mm]" style={{ left: "62mm", background: "linear-gradient(180deg, rgba(232,168,84,0), rgba(232,168,84,0.55), rgba(232,168,84,0))" }} aria-hidden />

      {/* right: the website QR code */}
      {c.url && (
        <div className="absolute flex w-[21mm] flex-col items-center" style={{ left: "64.5mm", top: "9.5mm" }}>
          <div className="rounded-[1.4mm] bg-white p-[1mm]" style={{ boxShadow: "0 0 0 0.25mm rgba(232,168,84,0.6)" }}>
            <Qr url={c.url} mm={17} dark={MIDNIGHT} />
          </div>
          <p className="mt-[2mm] text-center font-display text-[4.6pt] font-semibold uppercase leading-[1.35] tracking-[0.22em]" style={{ color: SAND }}>
            Scan to see
            <br />
            our work
          </p>
        </div>
      )}
    </Tile>
  );
}

function Back() {
  return (
    <Tile w={90} h={54} cut style={{ background: MIDNIGHT }}>
      <Contours />
      <div className="pointer-events-none absolute inset-[2.6mm] rounded-[1mm] border" style={{ borderColor: "rgba(232,168,84,0.28)", borderWidth: "0.2mm" }} aria-hidden />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Mark mm={15} />
        <Word pt={15} className="mt-[2.2mm]" />
        <p className="mt-[1.6mm] font-display text-[4.8pt] font-semibold uppercase tracking-[0.5em]" style={{ color: SAND }}>
          See every angle.
        </p>
      </div>
      <p className="absolute inset-x-[7mm] bottom-[5mm] text-center font-display text-[4.4pt] uppercase tracking-[0.28em]" style={{ color: "rgba(235,214,181,0.6)" }}>
        Virtual Tours · Google Maps · Immersive Experiences
      </p>
    </Tile>
  );
}

export function VisitingCards({ q }: { q: Q }) {
  const { people: everyone, loading, error } = usePrintPeople();
  const { settings } = useSettings();

  const people = useMemo(() => {
    const ids = csv(q.ids);
    const pick: BaseRecord[] = ids.length ? ids.map((id) => everyone.find((r) => r.id === id)).filter((r): r is BaseRecord => !!r) : everyone;
    return pick;
  }, [everyone, q.ids]);

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

  return (
    <PrintShell title="Visiting cards (90 × 54 mm)" back="/hq/printables" toolbar={<span className="text-xs text-blueprint">{contacts.length} {contacts.length === 1 ? "person" : "people"} · 10 cards per A4{withBack ? " · front + back sheets" : ""}</span>}>
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="no-print rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>
      ) : !contacts.length ? (
        <EmptyState icon="Users" title="No one selected" description="Choose people in Print Studio. The founders are always listed; add others in HQ → Team & Payroll." />
      ) : (
        contacts.flatMap((c, i) => [
          <Sheet key={`f${i}`} className="flex items-center justify-center">
            <div className="grid grid-cols-2" style={{ width: "180mm" }}>
              {Array.from({ length: 10 }, (_, j) => (
                <Front key={j} c={c} />
              ))}
            </div>
          </Sheet>,
          ...(withBack
            ? [
                <Sheet key={`b${i}`} className="flex items-center justify-center">
                  <div className="grid grid-cols-2" style={{ width: "180mm" }}>
                    {Array.from({ length: 10 }, (_, j) => (
                      <Back key={j} />
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
