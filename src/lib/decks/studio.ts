/**
 * The client meeting deck: what a café, hotel, showroom or property owner sees on the first call with 360VUE.
 * Wording follows the company profile; every price is read from the rate card. Nothing here claims clients,
 * results or testimonials 360VUE does not have. Add real case studies in HQ → Feedback & Testimonials first.
 */
import { TERMS } from "@/lib/content/catalog";
import { site } from "@/lib/site";
import { card, range, SERVICE_ICON, THEME } from "./shared";
import type { Deck } from "./types";

export const studioDeck: Deck = {
  id: "tour-pitch",
  group: "clients",
  title: "360VUE for your space",
  audience: "Restaurant, café, hotel, banquet, showroom and property owners",
  blurb: "The first-meeting deck: what a virtual tour is, where it is used, how a capture day runs, the three packages and the terms. Type the client's name and it appears on the cover.",
  minutes: 15,
  theme: THEME,
  sources: ["360VUE company profile", "03_SOP/Project workflow"],
  slides: ({ client, rates }) => {
    const rc = card(rates);
    const tours = rc.services.find((s) => s.id === "tours");
    const packages = tours?.groups.find((g) => g.id === "package")?.options ?? [];
    const ms = rc.terms.milestones;
    return [
      {
        kind: "cover",
        kicker: client ? `Prepared for ${client}` : "360° Virtual Tours · Photography · Immersive Experiences",
        title: "See every angle.",
        sub: [site.legalName, site.location].filter(Boolean).join(" · "),
        art: "/media/keyvisual.webp",
        notes: "Thank them for the time. The next 15 minutes: understand their space, show a live tour, and leave with a clear next step.",
      },
      {
        kind: "statement",
        big: "Let customers walk in before they walk in.",
        sub: "An interactive 360° tour of your space, on your website and on Google Maps",
        icon: "Eye",
        notes: "Open the demo tour on the website now and hand them the phone. Let them drag around before you say anything else.",
      },
      {
        kind: "statement",
        big: "First, tell us about your space.",
        sub: "How many rooms or areas · who visits · where customers find you today · by when",
        icon: "MessageCircle",
        notes: "Stop presenting. Ask, listen, and note the areas and approximate size in the CRM afterwards.",
      },
      {
        kind: "image",
        title: "What a tour does",
        src: "/media/restaurant.webp",
        points: [
          "Customers explore the entrance, seating, rooms and facilities online",
          "Embedded on your website, shared as a link, and published to Google Maps where eligible",
          "Navigation between viewpoints, room labels and a branded start where supported",
        ],
        notes: "Use their industry's example: a café's private dining, a hotel's rooms and banquet hall, a showroom's display floor.",
      },
      {
        kind: "cards",
        title: "What we do",
        cards: rc.services.map((s) => ({ icon: SERVICE_ICON[s.id] ?? "Sparkles", title: s.name, text: s.short })),
        sub: "Photography, video, social media and websites through our parent company, FrameMind AI Studio"
      },
      {
        kind: "steps",
        title: "How a project runs",
        steps: TERMS.process.slice(0, 4).map((p, i) => ({ title: p.title, detail: p.detail, icon: (["Phone", "ClipboardList", "Search", "Camera"] as const)[i] })),
        sub: "Then processing, tour assembly, quality checks and delivery",
        notes: "Stress site preparation: we confirm access, lighting and private areas before the capture day.",
      },
      {
        kind: "table",
        title: "Tour packages",
        head: ["Package", "Typical scope", "Indicative price"],
        rows: packages.map((p) => [p.label, p.detail ?? "", range(p.price, p.upTo)]),
        foot: "Proposed launch prices, before GST. Every quote states the viewpoints and areas included. Photography and video are quoted by our parent company, FrameMind AI Studio.",
        notes: "Configure their exact tour in the quote builder after the call. Never promise a number for a space you have not seen.",
      },
      {
        kind: "cards",
        title: "The terms, up front",
        cards: [
          { icon: "IndianRupee", title: "Payment", text: ms.map((m) => `${m.percent}% ${m.label.toLowerCase()}`).join(" · ") },
          { icon: "ListChecks", title: `${rc.terms.revisionRounds} revision rounds`, text: "on the agreed viewpoints and labels" },
          { icon: "Globe", title: "Hosting", text: "duration and any renewal are written on the quote" },
          { icon: "ShieldCheck", title: "Privacy", text: "restricted areas are skipped; people and sensitive details are removed" },
        ],
        notes: TERMS.google,
      },
      {
        kind: "steps",
        title: "Next steps",
        steps: [
          { title: "A written scope", detail: "areas, viewpoints and deliverables", icon: "ClipboardList" },
          { title: "The quote", detail: "line by line, from our rate card", icon: "IndianRupee" },
          { title: "Advance and date", detail: `${ms[0]?.percent ?? 50}% confirms the capture day`, icon: "CalendarDays" },
          { title: "Capture", detail: "then your tour, tested and delivered", icon: "Camera" },
        ],
        notes: "Agree the date they will hear from us and put it in the CRM as the next follow-up.",
      },
      {
        kind: "closing",
        title: "Thank you",
        sub: "360VUE — See every angle.",
        points: ["Questions?", site.contact.email, site.contact.phone, site.website.replace(/^https?:\/\//, "")].filter(Boolean),
      },
    ];
  },
};
