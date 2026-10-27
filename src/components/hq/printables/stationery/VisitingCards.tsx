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

interface Contact {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
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

/** The gold sweep along the right edge of the front, as on the brand board. */
function Swoosh() {
  return (
    <svg viewBox="0 0 90 54" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="vc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FAD696" />
          <stop offset="0.5" stopColor="#E8A854" />
          <stop offset="1" stopColor="#9A5A31" />
        </linearGradient>
        <radialGradient id="vc-glow" cx="0.9" cy="0.85" r="0.6">
          <stop offset="0" stopColor="#F59E4C" stopOpacity="0.28" />
          <stop offset="1" stopColor="#F59E4C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="90" height="54" fill="url(#vc-glow)" />
      <path d="M90 14 C 84 24, 82.5 38, 85.5 54 L 90 54 Z" fill="url(#vc-gold)" opacity="0.95" />
      <path d="M90 4 C 81 18, 78.5 36, 81.5 54" fill="none" stroke="url(#vc-gold)" strokeWidth="0.28" opacity="0.75" />
      <path d="M90 9 C 82.5 21, 80.5 37, 83.5 54" fill="none" stroke="url(#vc-gold)" strokeWidth="0.16" opacity="0.45" />
    </svg>
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

function Front({ c }: { c: Contact }) {
  const rows: [keyof typeof ICON, string][] = [
    ["phone", c.phone],
    ["mail", c.email],
    ["web", c.website],
  ];
  return (
    <Tile w={90} h={54} cut className="text-left" style={{ background: MIDNIGHT }}>
      <Swoosh />
      {/* hairline frame */}
      <div className="pointer-events-none absolute inset-[2.6mm] rounded-[1mm] border" style={{ borderColor: "rgba(232,168,84,0.28)", borderWidth: "0.2mm" }} aria-hidden />
      <div className="absolute left-[7mm] top-[6.2mm] flex items-center gap-[1.6mm]">
        <Mark mm={6.4} />
        <Word pt={8.2} />
      </div>
      <div className="absolute bottom-[6.4mm] left-[7mm] right-[14mm]">
        <p className="font-display text-[12.5pt] font-bold leading-[1.05] tracking-[-0.01em]" style={{ color: CREAM }}>
          {c.name}
        </p>
        <p className="mt-[1mm] font-display text-[5.6pt] font-semibold uppercase leading-tight tracking-[0.26em]" style={{ color: GOLD }}>
          {c.title}
        </p>
        <span className="my-[2.6mm] block h-[0.3mm] w-[12mm]" style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(232,168,84,0))` }} />
        <ul className="space-y-[1mm] text-[6.6pt] leading-tight" style={{ color: "rgba(249,245,237,0.88)" }}>
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <li key={k} className="flex items-center gap-[1.8mm]">
                <svg viewBox="0 0 20 20" className="shrink-0" style={{ width: "2.6mm", height: "2.6mm" }} fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ICON[k]}
                </svg>
                <span className="truncate font-medium">{v}</span>
              </li>
            ))}
        </ul>
      </div>
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
