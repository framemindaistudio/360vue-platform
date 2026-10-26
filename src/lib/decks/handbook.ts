/**
 * The 360VUE handbook: walked through with every new team member, intern or freelancer in their first week.
 * It points at the screens in HQ where each thing actually happens, so it stays true as the company changes.
 */
import { SERVICES, TERMS } from "@/lib/content/catalog";
import { site } from "@/lib/site";
import { SERVICE_ICON, THEME } from "./shared";
import type { Deck } from "./types";

export const handbookDeck: Deck = {
  id: "team-handbook",
  group: "team",
  title: "Welcome to 360VUE",
  audience: "New team members, interns and freelancers",
  blurb: "The first-week walkthrough: what 360VUE does, how a tour moves from enquiry to delivery, where everything lives in HQ, and the rules on privacy, client files and paperwork.",
  minutes: 25,
  theme: THEME,
  sources: ["360VUE company profile", "03_SOP"],
  slides: ({ client }) => [
    {
      kind: "cover",
      kicker: client ? `Welcome, ${client}` : "Your first week",
      title: "Welcome to 360VUE.",
      sub: "See every angle.",
      art: "/media/keyvisual.webp",
      notes: "Introduce the founders and who the new member will work with day to day.",
    },
    {
      kind: "cards",
      title: "What we do",
      cards: SERVICES.map((s) => ({ icon: SERVICE_ICON[s.id] ?? "Sparkles", title: s.name, text: s.short })),
    },
    {
      kind: "steps",
      title: "Every project, the same eight steps",
      steps: TERMS.process.map((p) => ({ title: p.title, detail: p.detail })),
      notes: "Each project has a unique ID, a client folder, a signed scope, an invoice record, source files, final exports and a delivery checklist.",
    },
    {
      kind: "flow",
      title: "How work moves through HQ",
      nodes: [
        { icon: "MessageCircle", title: "Enquiry", text: "Sales → Enquiries" },
        { icon: "Users", title: "Client", text: "Clients CRM" },
        { icon: "IndianRupee", title: "Quote", text: "priced from the Rate Card" },
        { icon: "Camera", title: "Capture", text: "Shoots: call sheet and gear" },
        { icon: "Upload", title: "Delivery", text: "Projects → Handover; Finance invoices" },
      ],
      sub: "Every step is a record; nothing lives only in WhatsApp",
    },
    {
      kind: "points",
      title: "On a capture day",
      points: [
        "Check the call sheet: access time, contact on site, restricted areas",
        "Batteries charged, cards formatted, lens cleaned, tripod levelled",
        "Same height and consistent exposure at every viewpoint; enough overlap to connect them",
        "Never capture an area the client marked private; ask people before they appear in a frame",
        "Back up the cards before leaving the site",
      ],
      icon: "Camera",
    },
    {
      kind: "cards",
      title: "Client files and privacy",
      cards: [
        { icon: "Lock", title: "Business storage only", text: "client files and credentials stay in 360VUE-controlled storage, never personal accounts" },
        { icon: "ShieldCheck", title: "Blur and remove", text: "identifiable people and sensitive details are removed before anything is delivered" },
        { icon: "Globe", title: "No promises on Google", text: "publishing never guarantees rankings or sales; never say it does" },
      ],
      notes: "Open Documents to Sign with them and send their joining papers before the end of the session.",
    },
    {
      kind: "points",
      title: "Getting paid",
      points: [
        "Staff and interns: the monthly payslip in Team & Payroll",
        "Freelancers: per capture day or deliverable, at the rate in your agreement",
        "Expenses and travel: a bill for every rupee, added in Finance → Expenses the same week",
      ],
      icon: "IndianRupee",
    },
    {
      kind: "closing",
      title: "Questions?",
      sub: "Plan the space. Capture it well. Deliver it tested.",
      points: [site.contact.email].filter(Boolean),
    },
  ],
};
