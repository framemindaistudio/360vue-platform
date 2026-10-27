/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  360VUE CATALOGUE — WHAT 360VUE SELLS AND THE STARTING PRICES
 * ─────────────────────────────────────────────────────────────────────────────
 *  The three tour packages and their price ranges come from the company profile ("proposed launch prices to
 *  validate with real clients"). Add-on, spatial and hosting prices are STARTING DEFAULTS only,
 *  for the founders to confirm: change them in HQ → Money → Rate Card, which saves a full copy to the private data
 *  repository (data/ratecard.json). HQ then reads that copy at run time, so to change a price, change it in HQ.
 *
 *  Currency: INR, exclusive of GST.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ServiceId = "tours" | "spatial" | "hosting";

export interface ServiceOption {
  id: string;
  label: string;
  detail?: string;
  /** price in rupees before GST; 0 = included */
  price: number;
  badge?: string;
  /** the price is the base price of the service (no "+"); 0 is then not shown as "Included" */
  base?: boolean;
  /** a unit after the price, e.g. "/viewpoint" */
  unit?: string;
  /** the public site shows a range ("₹5,000–₹8,000") instead of a single starting price */
  upTo?: number;
}

export interface ServiceGroup {
  id: string;
  title: string;
  /** "one": choose exactly one (radio) · "any": choose any number (checkboxes) */
  mode: "one" | "any";
  help?: string;
  note?: string;
  /** part of the core spec: hidden and not charged while a ready package (group id "package") is chosen */
  core?: boolean;
  options: ServiceOption[];
}

export interface Service {
  id: ServiceId;
  name: string;
  short: string;
  description: string;
  /** "project": a one-time price · "month": a monthly plan (hosting & care) */
  billing: "project" | "month";
  /** what is always included */
  included: string[];
  groups: ServiceGroup[];
  /** icon for HQ screens (a lucide-react export name) */
  icon: string;
  /** the division of 360VUE it belongs to */
  division: "Tours" | "Spatial";
}

export const SERVICES: Service[] = [
  {
    id: "tours",
    name: "360° Virtual Tour",
    short: "Capture · Stitch · Connect · Deliver",
    division: "Tours",
    description:
      "Spherical 360° photographs at planned viewpoints, stitched and connected into an interactive walkthrough with navigation hotspots and room labels, delivered as an embeddable tour or shareable link.",
    billing: "project",
    icon: "Rotate3d",
    included: [
      "Site survey and capture plan before the shoot",
      "360° capture at each agreed viewpoint",
      "Stitching, correction and export of every panorama",
      "Viewpoints connected with navigation hotspots",
      "Quality check on desktop and mobile",
      "Shareable link and website embed code",
    ],
    groups: [
      {
        id: "package",
        title: "Tour package",
        mode: "one",
        help: "Proposed launch prices. Every quote states the number of viewpoints and areas.",
        options: [
          { id: "starter", label: "Starter Tour", detail: "Small space, basic interactive tour", price: 5000, upTo: 8000, base: true },
          { id: "business", label: "Business Tour", detail: "Multiple viewpoints, navigation and web-ready delivery", price: 10000, upTo: 18000, base: true, badge: "Most chosen" },
          { id: "premium", label: "Premium Experience", detail: "Larger space, custom hotspots, additional photography or video", price: 20000, upTo: 35000, base: true },
        ],
      },
      {
        id: "publishing",
        title: "Branding & publishing",
        mode: "any",
        options: [
          { id: "branded-start", label: "Branded starting screen", detail: "Logo, colours and welcome screen where the platform supports it", price: 1500 },
          { id: "info-hotspots", label: "Information hotspots", detail: "Text, photo or link points inside the tour", price: 2000 },
          { id: "web-embed", label: "Website embedding help", detail: "We place the tour on your website with your developer", price: 1500 },
          { id: "street-view", label: "Google Street View publishing help", detail: "For eligible panoramic content. No ranking or sales outcome is promised.", price: 2500 },
          { id: "floor-plan", label: "Floor-plan navigation", detail: "A simple plan with clickable viewpoints", price: 4000 },
        ],
      },
      {
        id: "extras",
        title: "Extra scope",
        mode: "any",
        options: [
          { id: "extra-viewpoint", label: "Additional viewpoint", detail: "Beyond those in the package", price: 500, unit: "/viewpoint" },
          { id: "extra-area", label: "Additional area or floor", price: 3000, unit: "/area" },
          { id: "revision", label: "Extra revision round", price: 1000, unit: "/round" },
          { id: "rush", label: "Priority delivery", detail: "Ahead of the standard timeline", price: 2500 },
          { id: "re-shoot", label: "Seasonal or after-renovation re-capture", detail: "Same viewpoints, new photographs", price: 4000 },
        ],
      },
    ],
  },
  {
    id: "spatial",
    name: "Spatial & Immersive",
    short: "3D walkthroughs · Virtual showrooms · Digital twins",
    division: "Spatial",
    description: "Interactive 3D walkthroughs, virtual showrooms, interactive floor plans and digital twins for selected commercial spaces. Scoped and quoted per project.",
    billing: "project",
    icon: "Box",
    included: ["Scoping session before any quote", "A written scope of the space, the platform and what is delivered"],
    groups: [
      {
        id: "package",
        title: "Experience",
        mode: "one",
        help: "Starting prices. The final price follows a scoping visit.",
        options: [
          { id: "interactive-plan", label: "Interactive floor plan", price: 12000, base: true },
          { id: "virtual-showroom", label: "Virtual showroom", detail: "Products tagged inside a tour", price: 35000, base: true },
          { id: "3d-walkthrough", label: "Interactive 3D walkthrough", price: 50000, base: true },
          { id: "digital-twin", label: "Digital twin", detail: "Selected commercial spaces", price: 90000, base: true },
        ],
      },
    ],
  },
  {
    id: "hosting",
    name: "Hosting & Care",
    short: "Hosting · Updates · Multi-location",
    division: "Tours",
    description: "Keeps a delivered tour online and up to date: hosting, small content updates and support, billed separately from the project.",
    billing: "month",
    icon: "Server",
    included: ["Tour hosting and link kept live", "Help if the embed or link stops working"],
    groups: [
      {
        id: "package",
        title: "Plan",
        mode: "one",
        options: [
          { id: "host-basic", label: "Hosting", detail: "One tour kept online", price: 500, base: true },
          { id: "host-care", label: "Hosting + updates", detail: "Hosting plus small hotspot and label changes each month", price: 1200, base: true },
          { id: "host-multi", label: "Multi-location", detail: "Several tours for one business, one plan", price: 3000, base: true },
        ],
      },
    ],
  },
];

/** Plan lengths for monthly services (Hosting & Care) and their discount on the monthly fee. */
export const SOCIAL_CONTRACTS: { months: number; label: string; discountPercent: number; badge?: string }[] = [
  { months: 1, label: "Month to month", discountPercent: 0 },
  { months: 6, label: "6 months", discountPercent: 5 },
  { months: 12, label: "12 months", discountPercent: 10, badge: "Best value" },
];

/** Buying several services together (for example a tour with an interactive floor plan or virtual showroom).
 *  Photography and video are quoted by the parent company, FrameMind AI Studio, not here. */
export const BUNDLE = {
  /** number of services → discount percent (the last step covers that many or more) */
  steps: [
    { services: 2, discountPercent: 5 },
    { services: 3, discountPercent: 8 },
  ],
};

/** The bundle discount for buying `n` different services, in percent. */
export function bundleDiscountFor(n: number, steps = BUNDLE.steps) {
  let pct = 0;
  for (const s of [...steps].sort((a, b) => a.services - b.services)) if (n >= s.services) pct = s.discountPercent;
  return pct;
}

/* ── Commercial terms, from the company profile ─────────────────────────── */

export const TERMS = {
  gstPercent: 18,
  /** the profile's payment policy: 50% to confirm the booking, 50% before final handover or activation */
  defaultMilestones: [
    { label: "Advance — to confirm the booking", percent: 50 },
    { label: "Before final handover or activation", percent: 50 },
  ],
  validityDays: 15,
  revisionRounds: 2,
  revisionPolicy:
    "The number of revision rounds is stated on the quote. Revisions cover the agreed viewpoints, hotspots, labels and edits. New areas, extra viewpoints, re-capture and other scope changes need written approval and are quoted before we start them.",
  clientResponsibilities:
    "You confirm access to the space on the agreed date, the property owner's permission where needed, which areas are restricted or private, and that the space is ready (lighting on, clutter cleared, people informed). Logos and brand assets for branding are provided by you.",
  handoff:
    "The agreed tour link, embed code and final exports. Use of the final deliverables passes to you once the project is paid in full, for the permitted use stated on the quote. 360VUE keeps the source files and may retain them for the period the quote states. Third-party platforms, fonts and music stay under their own licences.",
  pricesFinal:
    "Package prices are proposed launch prices for the scope described. The final price is confirmed in a written quote that states the viewpoints and areas included, branding, embedding and publishing help, hosting duration, revision rounds, travel and timeline.",
  timelines: "The delivery timeline is stated on each quote and starts once the advance is received and the capture date is confirmed.",
  paymentTerms:
    "50% advance to confirm the booking. 50% before final handover or activation, as agreed in the quote. Work outside the scope needs written approval. Recurring hosting or maintenance is billed separately.",
  thirdParty:
    "Hosting is not unlimited: its duration and any renewal charge are stated on the quote. Platform fees, travel beyond the stated radius and any permits are not included unless the quote lists them.",
  privacy:
    "We take care with private and sensitive areas. Identifiable people and unintended sensitive information are removed or blurred where necessary, and areas you mark as restricted are not captured.",
  google:
    "Google Street View publishing help is for eligible content only. Publishing does not guarantee search rankings, visits or sales.",
  delays: "If access, approvals or payments are late, the schedule moves by the same time. A capture cancelled at short notice may be re-scheduled with a travel charge, as the quote states.",
  discounts: "Discounts apply to our service fees only, not to third-party costs, taxes or travel, and do not combine: a quote gets either the multi-service or the plan-length discount, whichever is higher.",
  tax: "All prices are in Indian rupees and exclude GST, which is added at the applicable rate and shown separately on the invoice.",
  process: [
    { title: "Lead qualification", detail: "We understand the business, the space, its size, location, budget and what you need delivered." },
    { title: "Proposal and approval", detail: "A written scope, quotation, schedule, payment terms and usage conditions." },
    { title: "Site preparation", detail: "Access, lighting, restricted areas, privacy requirements and capture positions confirmed." },
    { title: "360° capture", detail: "Each planned viewpoint photographed with consistent positioning, exposure and overlap." },
    { title: "Processing", detail: "Panoramas stitched, inspected, corrected and exported; sensitive details removed." },
    { title: "Tour assembly", detail: "Viewpoints connected, navigation and branding added, the delivery platform set up." },
    { title: "Quality assurance", detail: "Navigation, image clarity, mobile display, loading and links all tested." },
    { title: "Delivery and closure", detail: "Balance collected, links and files delivered, sign-off, and a review request." },
  ],
};

export const serviceById = (id: string) => SERVICES.find((s) => s.id === id);
export const SERVICE_OPTIONS = SERVICES.map((s) => ({ value: s.id, label: s.name }));
