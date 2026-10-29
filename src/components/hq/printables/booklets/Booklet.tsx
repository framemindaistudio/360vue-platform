"use client";

/**
 * Folded booklets: A4 pages printed two-up on A3 sheets, folded and stapled down the middle (saddle stitch).
 *
 * A booklet is always a multiple of 4 pages (one A3 sheet, printed both sides, carries 4 A4 pages); a short one is
 * padded with "Notes" pages. Two ways to print it:
 *   • mode=print — A3 landscape sheets in booklet order (8 | 1, then 2 | 7 on the back…). Print double-sided,
 *     "flip on short edge", fold the stack in half and staple the fold.
 *   • mode=read  — the A4 pages one after another, for a PDF to send on WhatsApp or email.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { PrintShell } from "@/components/print/PrintShell";
import { useSettings } from "@/components/hq/data";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Wordmark } from "../PrintBits";

export type BookletMode = "print" | "read";

/** Brand colours as plain values, so they print exactly. */
export const C = {
  ink: "#0e0b08",
  night: "#17120d",
  paper: "#fbf7ef",
  cream: "#f9f5ed",
  sand: "#ebd6b5",
  gold: "#d9953f",
  sunset: "#f59e4c",
  bronze: "#9a5a31",
  line: "rgba(14,11,8,0.14)",
};

/** Saddle-stitch order: for each A3 sheet, the [left, right] page numbers on its front and back. */
export function impose(pageCount: number) {
  const sheets: { front: [number, number]; back: [number, number] }[] = [];
  for (let k = 0; k < pageCount / 4; k++) {
    sheets.push({ front: [pageCount - 2 * k, 2 * k + 1], back: [2 * k + 2, pageCount - 2 * k - 1] });
  }
  return sheets;
}

/** One A4 page, exactly 210 × 297 mm. */
export function Page({ children, dark, className, style }: { children: React.ReactNode; dark?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("relative h-[297mm] w-[210mm] shrink-0 overflow-hidden", className)}
      style={{ background: dark ? C.ink : C.paper, color: dark ? C.cream : C.ink, ...style }}
    >
      {children}
    </div>
  );
}

/** An inside page: a running head with the section and the 360VUE mark, the page number at the foot. */
export function Inside({ n, section, children, dark }: { n: number; section: string; children: React.ReactNode; dark?: boolean }) {
  const even = n % 2 === 0;
  return (
    <Page dark={dark}>
      <div className={cn("absolute inset-x-[14mm] top-[10mm] flex items-center justify-between text-[6.5pt] font-semibold uppercase tracking-[0.3em]", even && "flex-row-reverse")} style={{ color: dark ? C.sand : C.bronze }}>
        <span className="flex items-center gap-[2.5mm]">
          <span className="inline-block h-px w-[8mm]" style={{ background: C.gold }} />
          {section}
        </span>
        <span style={{ opacity: 0.8 }}>360VUE</span>
      </div>
      <div className="absolute inset-x-[14mm] bottom-[14mm] top-[19mm] flex flex-col">{children}</div>
      <div className={cn("absolute inset-x-[14mm] bottom-[7mm] flex items-center justify-between text-[6.5pt] tracking-[0.15em]", even && "flex-row-reverse")} style={{ color: dark ? "rgba(249,245,237,0.5)" : "rgba(14,11,8,0.45)" }}>
        <span>{site.website.replace(/^https?:\/\//, "")}</span>
        <span className="font-display text-[9pt] font-bold" style={{ color: C.gold }}>{String(n).padStart(2, "0")}</span>
      </div>
    </Page>
  );
}

/** A photo that fills whatever height is left on a page, with an optional caption over its foot. */
export function FillPhoto({ src, children, min = 40 }: { src: string; children?: React.ReactNode; min?: number }) {
  return (
    <div className="relative mt-[6mm] flex-1 overflow-hidden rounded-[4mm]" style={{ minHeight: `${min}mm` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
      {children && (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(14,11,8,0) 35%, rgba(14,11,8,0.88) 100%)" }} />
          <div className="absolute inset-x-[7mm] bottom-[6mm]" style={{ color: C.cream }}>{children}</div>
        </>
      )}
    </div>
  );
}

/** Small uppercase label with a gold rule. */
export function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className="flex items-center gap-[2.5mm] text-[7pt] font-semibold uppercase tracking-[0.3em]" style={{ color: light ? C.sunset : C.bronze }}>
      <span className="inline-block h-px w-[8mm]" style={{ background: light ? C.sunset : C.gold }} />
      {children}
    </p>
  );
}

/** Gold text that prints as a flat gold (gradients clipped to text can print as a box). */
export function Gold({ children }: { children: React.ReactNode }) {
  return <span style={{ color: C.gold }}>{children}</span>;
}

/**
 * A full-bleed photographic cover. The art is 2:3 and the page a little wider, so full-bleed art loses some height:
 * `focus` (object-position) picks which part stays — "50% 100%" crops the top and lifts the subject. When the subject
 * is too tall for the space between the logo and the title, `art` draws it smaller instead ({ width % of the page,
 * top in mm }) with its edges faded into the dark page.
 */
export function Cover({ image, kicker, title, sub, chips, preparedFor, focus = "50% 50%", art, titlePt = 40 }: { image: string; kicker: string; title: React.ReactNode; sub: string; chips?: string[]; preparedFor?: string; focus?: string; art?: { width: number; top: number }; titlePt?: number }) {
  return (
    <Page dark>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute left-1/2 h-auto max-w-none -translate-x-1/2"
          style={{ width: `${art.width}%`, top: `${art.top}mm`, maskImage: "radial-gradient(ellipse 58% 52% at 50% 46%, #000 72%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 58% 52% at 50% 46%, #000 72%, transparent 100%)" }}
          loading="eager"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focus }} loading="eager" />
      )}
      {/* the cover art leaves dark space at the top (logo) and the foot (title); this only deepens those bands */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(14,11,8,0.45) 0%, rgba(14,11,8,0) 18%, rgba(14,11,8,0) 56%, rgba(14,11,8,0.8) 70%, #0e0b08 86%)" }} />
      <div className="absolute left-[16mm] top-[16mm]">
        <Wordmark mm={58} white />
      </div>
      {/* the spinning 360° ring from the website, standing still */}
      <svg viewBox="0 0 160 160" className="absolute right-[14mm] top-[12mm] h-[34mm] w-[34mm]" aria-hidden>
        <defs>
          <path id="bk-ring" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
        </defs>
        <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(245,158,76,0.55)" strokeWidth="1" />
        <text fill="rgba(249,245,237,0.85)" fontSize="10.5" letterSpacing="5">
          <textPath href="#bk-ring">SEE EVERY ANGLE · SEE EVERY ANGLE · </textPath>
        </text>
        <text x="80" y="90" textAnchor="middle" fill="#f9f5ed" fontSize="28" fontWeight="700">
          360<tspan fill={C.sunset}>°</tspan>
        </text>
      </svg>
      <div className="absolute inset-x-[16mm] bottom-[18mm]">
        <Kicker light>{kicker}</Kicker>
        <h1 className="mt-[5mm] font-display font-bold leading-[0.98] tracking-[-0.03em]" style={{ color: C.cream, fontSize: `${titlePt}pt` }}>
          {title}
        </h1>
        <p className="mt-[5mm] max-w-[150mm] text-[11.5pt] leading-[1.5]" style={{ color: "rgba(249,245,237,0.8)" }}>
          {sub}
        </p>
        {chips && (
          <div className="mt-[7mm] flex flex-wrap gap-[2mm]">
            {chips.map((c) => (
              <span key={c} className="rounded-full border px-[3.5mm] py-[1.2mm] text-[7.5pt] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: "rgba(245,158,76,0.5)", color: C.sand }}>
                {c}
              </span>
            ))}
          </div>
        )}
        {preparedFor && (
          <p className="mt-[7mm] border-t pt-[3mm] text-[9pt]" style={{ borderColor: "rgba(249,245,237,0.2)", color: "rgba(249,245,237,0.75)" }}>
            Prepared for <strong style={{ color: C.cream }}>{preparedFor}</strong>
          </p>
        )}
      </div>
    </Page>
  );
}

/** A QR code drawn as crisp SVG. */
export function Qr({ url, mm = 30, dark = C.ink, light = "#ffffff" }: { url: string; mm?: number; dark?: string; light?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark, light } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(""));
    return () => {
      alive = false;
    };
  }, [url, dark, light]);
  return <div className="[&>svg]:h-full [&>svg]:w-full" style={{ width: `${mm}mm`, height: `${mm}mm` }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** The back cover: how to reach us, with a QR code to the page that continues the booklet online. */
export function BackCover({ headline, line, qrPath, qrLabel }: { headline: React.ReactNode; line: string; qrPath: string; qrLabel: string }) {
  const { settings } = useSettings();
  const phone = settings.phone || site.contact.phone;
  const email = settings.email || site.contact.email;
  const web = site.website.replace(/^https?:\/\//, "");
  const addr = [settings.addressLine1, settings.city, settings.state].filter(Boolean).join(", ");
  return (
    <Page dark>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/keyvisual.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="eager" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0e0b08 0%, rgba(14,11,8,0.82) 45%, #0e0b08 100%)" }} />
      <div className="absolute inset-x-[16mm] top-[24mm]">
        <Kicker light>Let customers look inside</Kicker>
        <h2 className="mt-[5mm] font-display text-[30pt] font-bold leading-[1.02] tracking-[-0.02em]" style={{ color: C.cream }}>
          {headline}
        </h2>
        <p className="mt-[5mm] max-w-[150mm] text-[11pt] leading-[1.55]" style={{ color: "rgba(249,245,237,0.75)" }}>
          {line}
        </p>
      </div>

      <div className="absolute inset-x-[16mm] top-[118mm] grid grid-cols-3 gap-[4mm]">
        {[
          ["1", "Tell us about your space", "Call, WhatsApp, or price your tour on our website."],
          ["2", "Get a written quote", "Scope, capture date and price — before anything starts."],
          ["3", "Go live in a week", "Your tour on Google Maps, your website and WhatsApp."],
        ].map(([n, t, d]) => (
          <div key={n} className="rounded-[3mm] border p-[4mm]" style={{ borderColor: "rgba(249,245,237,0.14)", background: "rgba(23,18,13,0.75)" }}>
            <p className="font-display text-[20pt] font-bold leading-none" style={{ color: C.gold }}>{n}</p>
            <p className="mt-[2.5mm] text-[9.5pt] font-semibold" style={{ color: C.cream }}>{t}</p>
            <p className="mt-[1.2mm] text-[8pt] leading-[1.45]" style={{ color: "rgba(249,245,237,0.6)" }}>{d}</p>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-[16mm] bottom-[20mm] flex items-end justify-between gap-[8mm]">
        <div>
          <Wordmark mm={62} white />
          <div className="mt-[7mm] space-y-[1.6mm] text-[10.5pt]" style={{ color: C.cream }}>
            {phone && <p><span className="inline-block w-[16mm] text-[7pt] uppercase tracking-[0.2em]" style={{ color: C.sand }}>Call</span>{phone}</p>}
            {email && <p><span className="inline-block w-[16mm] text-[7pt] uppercase tracking-[0.2em]" style={{ color: C.sand }}>Email</span>{email}</p>}
            <p><span className="inline-block w-[16mm] text-[7pt] uppercase tracking-[0.2em]" style={{ color: C.sand }}>Web</span>{web}</p>
            {addr && <p className="text-[8.5pt]" style={{ color: "rgba(249,245,237,0.6)" }}><span className="inline-block w-[16mm] text-[7pt] uppercase tracking-[0.2em]" style={{ color: C.sand }}>Visit</span>{addr}</p>}
          </div>
          <p className="mt-[7mm] text-[7pt] tracking-[0.08em]" style={{ color: "rgba(249,245,237,0.45)" }}>
            360VUE is a {site.parent.name} company.
          </p>
        </div>
        <div className="text-center">
          <div className="rounded-[3mm] p-[2.5mm]" style={{ background: "#ffffff" }}>
            <Qr url={`${site.website}${qrPath}`} mm={32} />
          </div>
          <p className="mt-[2.5mm] text-[7pt] font-semibold uppercase tracking-[0.2em]" style={{ color: C.sand }}>{qrLabel}</p>
        </div>
      </div>
    </Page>
  );
}

/** A blank notes page, used to make the page count a multiple of 4. */
function NotesPage({ n }: { n: number }) {
  return (
    <Inside n={n} section="Notes">
      <div className="h-full" style={{ backgroundImage: `repeating-linear-gradient(transparent 0, transparent 9mm, ${C.line} 9mm, ${C.line} calc(9mm + 0.25mm))` }} />
    </Inside>
  );
}

/**
 * Lays the pages out for printing. `pages` render one A4 page each, given their page number (1-based).
 * The last page is the back cover; notes pages are added before it when the count is not a multiple of 4.
 */
export function BookletShell({ title, mode, pages }: { title: string; mode: BookletMode; pages: ((n: number) => React.ReactNode)[] }) {
  const all = [...pages];
  const back = all.pop()!;
  while ((all.length + 1) % 4) all.push((n) => <NotesPage n={n} />);
  all.push(back);
  const count = all.length;
  const page = (n: number) => <div key={n}>{all[n - 1](n)}</div>;
  const params = useSearchParams();
  const other = (m: BookletMode) => {
    const p = new URLSearchParams(params.toString());
    p.set("mode", m);
    return `?${p.toString()}`;
  };

  const toolbar = (
    <span className="text-xs text-blueprint">
      {count} pages ·{" "}
      {mode === "print" ? (
        <>
          {count / 4} A3 sheet{count / 4 === 1 ? "" : "s"}, both sides — print double-sided, <strong>flip on short edge</strong>, scale 100%, then fold and staple.{" "}
          <a className="underline" href={other("read")}>A4 pages instead</a>
        </>
      ) : (
        <>
          A4 pages in reading order, for a PDF. <a className="underline" href={other("print")}>A3 booklet sheets instead</a>
        </>
      )}
    </span>
  );

  if (mode === "read") {
    return (
      <PrintShell title={title} back="/hq/printables" toolbar={toolbar}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="print-page shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)]">
            {page(i + 1)}
          </div>
        ))}
      </PrintShell>
    );
  }

  return (
    <PrintShell title={title} back="/hq/printables" toolbar={toolbar} paper="A3 landscape">
      {impose(count).flatMap((s, i) =>
        (["front", "back"] as const).map((side) => (
          <div key={`${i}-${side}`} className="print-page relative flex h-[297mm] w-[420mm] shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)]">
            {page(s[side][0])}
            {page(s[side][1])}
            {/* fold guide, screen only */}
            <span className="no-print pointer-events-none absolute inset-y-0 left-1/2 w-0 border-l border-dashed border-white/40" />
            <span className="no-print absolute -top-[6mm] left-0 text-[9px] font-semibold uppercase tracking-[0.2em] text-blueprint">
              Sheet {i + 1} · {side} · pages {s[side][0]} | {s[side][1]}
            </span>
          </div>
        )),
      )}
    </PrintShell>
  );
}
