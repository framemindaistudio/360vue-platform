/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  360VUE CATALOGUE — WHAT 360VUE SELLS AND THE STARTING PRICES
 * ─────────────────────────────────────────────────────────────────────────────
 *  Priced the way the industry prices 360° tours: by SCENES (one scene = one 360° viewpoint). The website's
 *  configurator estimates scenes from the floor area, the number of floors and the number of rooms, then picks the
 *  smallest plan that covers them.
 *
 *  Benchmarks used (Oct 2026): Indian Google-Maps tour vendors at about ₹2,000 per area; a Bengaluru Trusted
 *  photographer at ₹8k (<500 sq ft) / ₹15k (<1,200 sq ft) / ₹20k (<3,600 sq ft, + ₹5k per extra floor); a Pune studio
 *  at ₹14,999 / ₹19,999 / ₹24,999 for 10 / 15 / 25 scenes; agencies at ₹30k–₹1.5L; UK scene tiers of £525 / £825 / £950
 *  for 10 / 20 / 30 scenes with a paid interactive layer; floor plans priced per floor; hosting billed yearly.
 *
 *  These are the STARTING values. Founders change prices in HQ → Money → Rate Card, which saves a full copy to the
 *  private data repository (data/ratecard.json); HQ and the website then read that copy.
 *
 *  Currency: INR, exclusive of GST.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ServiceId = "tours" | "aerial" | "spatial" | "hosting";

export interface ServiceOption {
  id: string;
  label: string;
  detail?: string;
  /** price in rupees before GST; 0 = included */
  price: number;
  badge?: string;
  /** the price is the base price of the service (no "+"); 0 is then not shown as "Included" */
  base?: boolean;
  /** a unit after the price, e.g. "/scene": the option is bought in a quantity */
  unit?: string;
  /** the public site shows a range ("₹5,000–₹8,000") instead of a single starting price */
  upTo?: number;
  /** a tour plan: the number of 360° scenes it includes (the configurator picks plans by it) */
  scenes?: number;
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
  division: "Tours" | "Sky" | "Spatial";
}

export const SERVICES: Service[] = [
  {
    id: "tours",
    name: "360° Virtual Tour",
    short: "Capture · Connect · Publish",
    division: "Tours",
    description:
      "An interactive 360° walkthrough of your space: every scene captured in high resolution, stitched, connected with navigation arrows, published to Google Maps and delivered as a link and website embed.",
    billing: "project",
    icon: "Rotate3d",
    included: [
      "Site survey and capture plan",
      "High-resolution 360° capture of every scene",
      "Stitching, colour correction and privacy blurring",
      "Navigation arrows between scenes, room labels",
      "Google Maps & Street View publishing (eligible content)",
      "Shareable link, website embed code, VR-ready",
      "12 months of tour hosting",
      "2 revision rounds · delivery in 5–7 working days",
    ],
    groups: [
      {
        id: "package",
        title: "Tour plan",
        mode: "one",
        help: "A scene is one 360° viewpoint — usually one per room, more for large halls.",
        options: [
          { id: "glance", label: "Glance", detail: "Up to 6 scenes · cafés, clinics, boutiques (about 1,000 sq ft)", price: 6999, base: true, scenes: 6 },
          { id: "walkthrough", label: "Walkthrough", detail: "Up to 12 scenes · restaurants, showrooms, offices (about 1,000–3,000 sq ft)", price: 12999, base: true, scenes: 12, badge: "Most popular" },
          { id: "showcase", label: "Showcase", detail: "Up to 20 scenes · banquet halls, large restaurants, villas (about 3,000–6,000 sq ft)", price: 19999, base: true, scenes: 20 },
          { id: "grand", label: "Grand Tour", detail: "Up to 35 scenes · hotels, resorts, campuses (about 6,000–12,000 sq ft)", price: 31999, base: true, scenes: 35 },
        ],
      },
      {
        id: "scale",
        title: "Size & levels",
        mode: "any",
        options: [
          { id: "extra-scene", label: "Extra scenes", detail: "Beyond the scenes in your plan", price: 799, unit: "/scene" },
          { id: "extra-floor", label: "Additional floors", detail: "Level switcher and stair connections for each floor after the first", price: 1499, unit: "/floor" },
          { id: "aerial", label: "SkyVUE aerial opening scene", detail: "A drone 360° from above, with landmark labels, as the first scene of your tour — same visit", price: 3999, unit: "/scene" },
        ],
      },
      {
        id: "interactive",
        title: "Interactive layer",
        mode: "any",
        options: [
          { id: "branding", label: "Branded intro", detail: "Your logo, colours and a welcome screen", price: 1499 },
          { id: "hotspots", label: "Info hotspots", detail: "Text, photos, menus or prices inside the tour — 10 per pack", price: 1999, unit: "/pack" },
          { id: "cta", label: "Call, WhatsApp & booking buttons", detail: "Visitors contact you from inside the tour", price: 1499 },
          { id: "floorplan", label: "Floor-plan mini-map", detail: "A clickable plan that shows where the visitor is", price: 2499, unit: "/floor" },
          { id: "audio", label: "Music or voice guide", detail: "Background music or a recorded welcome", price: 1999 },
        ],
      },
      {
        id: "publishing",
        title: "Publishing",
        mode: "any",
        options: [
          { id: "google", label: "Google Maps & Street View publishing", detail: "Included in every plan, for eligible content", price: 0 },
          { id: "embed", label: "Website embed set-up", detail: "We place the tour on your website with your developer", price: 999 },
          { id: "qr", label: "QR standee artwork", detail: "Print-ready QR code linking to your tour", price: 499 },
        ],
      },
      {
        id: "delivery",
        title: "Capture & delivery",
        mode: "any",
        note: "Travel within 25 km of our base is included; beyond that it is billed at actual cost.",
        options: [
          { id: "after-hours", label: "Early-morning or after-hours capture", detail: "Before you open or after you close", price: 1999 },
          { id: "twilight", label: "Twilight capture", detail: "A second visit after sunset, with the lights on", price: 2999 },
          { id: "express", label: "Express delivery", detail: "Live within 72 hours of the capture", price: 2999 },
        ],
      },
    ],
  },
  {
    id: "aerial",
    name: "SkyVUE Aerial 360°",
    short: "Drone 360° · Landmarks · Distances",
    division: "Sky",
    description:
      "An aerial 360° view from a drone, with the landmarks around you labelled and their distances shown — highway, school, hospital, lake, airport — so buyers and guests see where you are, not just what is inside. Standalone, or the opening scene of your tour.",
    billing: "project",
    icon: "Drone",
    included: [
      "Airspace check before booking (we fly only where it is permitted)",
      "Drone capture from up to 120 m, stitched into a full 360° sphere",
      "Landmark labels with distances, researched for your location",
      "Shareable link, website embed, Google Maps where eligible",
      "12 months of hosting · links into your ground tour",
    ],
    groups: [
      {
        id: "package",
        title: "SkyVUE plan",
        mode: "one",
        help: "One aerial scene is one drone position. Labels name what is around you and how far it is.",
        options: [
          { id: "sky-point", label: "SkyVUE Point", detail: "1 aerial scene, up to 10 landmark labels · plots, farmhouses, standalone buildings", price: 7999, base: true, scenes: 1 },
          { id: "sky-neighbourhood", label: "SkyVUE Neighbourhood", detail: "3 aerial scenes, up to 25 labels, floating 3D titles · apartments, resorts, hotels, schools", price: 14999, base: true, scenes: 3, badge: "Most popular" },
          { id: "sky-masterplan", label: "SkyVUE Masterplan", detail: "6 linked aerial scenes, up to 50 labels, plot and phase overlays · layouts, townships, campuses", price: 27999, base: true, scenes: 6 },
        ],
      },
      {
        id: "sky-extras",
        title: "SkyVUE extras",
        mode: "any",
        note: "Flights happen only where airspace permits under India's Drone Rules, 2021. Near airports and other restricted zones we apply for permission first, or tell you before booking if it is not possible. Dates depend on the weather.",
        options: [
          { id: "sky-extra-scene", label: "Extra aerial scenes", detail: "Another drone position, linked to the others", price: 2499, unit: "/scene" },
          { id: "sky-overlay", label: "Plot & boundary overlay", detail: "Plot numbers, boundaries, phases or amenities drawn onto the view", price: 4999 },
          { id: "sky-golden", label: "Golden-hour or sunrise flight", detail: "Warm, low light at the start or end of the day", price: 2999 },
          { id: "sky-progress", label: "Construction progress re-flight", detail: "The same positions re-flown and added to your tour, for buyers to follow progress", price: 5999, unit: "/visit" },
        ],
      },
    ],
  },
  {
    id: "spatial",
    name: "3D & Immersive",
    short: "Floor plans · Virtual showrooms · Digital twins",
    division: "Spatial",
    description: "Measured floor plans, virtual showrooms with shoppable product tags, 3D dollhouse walkthroughs and digital twins for commercial spaces. Scoped after a site visit.",
    billing: "project",
    icon: "Box",
    included: ["Scoping visit before the final quote", "A written scope of the space, the platform and the deliverables"],
    groups: [
      {
        id: "package",
        title: "Experience",
        mode: "one",
        help: "Starting prices. The final price follows a scoping visit.",
        options: [
          { id: "measured-plan", label: "Measured floor plan", detail: "2D plan with room names and dimensions, linked to your tour", price: 9999, base: true },
          { id: "virtual-showroom", label: "Virtual showroom", detail: "Products tagged with prices and enquiry buttons inside the tour", price: 24999, base: true },
          { id: "dollhouse", label: "3D dollhouse walkthrough", detail: "Measured 3D model with dollhouse view, up to 5,000 sq ft", price: 39999, base: true },
          { id: "digital-twin", label: "Digital twin", detail: "A measurable model for facilities and large commercial spaces", price: 74999, base: true },
        ],
      },
      {
        id: "extras",
        title: "Extras",
        mode: "any",
        options: [{ id: "extra-area", label: "Additional area (3D)", detail: "Every 1,000 sq ft beyond the plan", price: 4999, unit: "/1,000 sq ft" }],
      },
    ],
  },
  {
    id: "hosting",
    name: "Hosting & Care",
    short: "After your first free year",
    division: "Tours",
    description: "Every tour includes 12 months of hosting. After that, keep it online — with updates and visitor stats if you like. Your Google Maps listing stays live either way.",
    billing: "month",
    icon: "Server",
    included: ["Tour link and website embed kept live", "Help if the embed or link stops working"],
    groups: [
      {
        id: "package",
        title: "Plan",
        mode: "one",
        options: [
          { id: "host", label: "Host", detail: "Your tour kept online on its link and embed", price: 299, base: true },
          { id: "host-care", label: "Host + Care", detail: "Plus monthly hotspot, label and price updates, and visitor stats", price: 699, base: true, badge: "Most popular" },
          { id: "multi", label: "Multi-location", detail: "Up to 5 tours for one brand, with updates", price: 1999, base: true },
        ],
      },
    ],
  },
];

/** Plan lengths for monthly services (Hosting & Care) and their discount on the monthly fee. */
export const SOCIAL_CONTRACTS: { months: number; label: string; discountPercent: number; badge?: string }[] = [
  { months: 1, label: "Month to month", discountPercent: 0 },
  { months: 12, label: "12 months", discountPercent: 15, badge: "Best value" },
  { months: 24, label: "24 months", discountPercent: 25 },
];

/** Buying several services together (for example a tour with SkyVUE aerial, a measured floor plan or a virtual showroom).
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

/* ── How the configurator turns a space into scenes ─────────────────────── */

export const SQFT_PER_SQM = 10.7639;
/** One scene covers about this much open floor area; rooms and floors add their own. */
export const SQFT_PER_SCENE = 350;

/**
 * The scenes a space needs: one per room at least, and enough to cover the floor area; each floor after the first
 * adds a scene for its landing. Never fewer than 3.
 */
export function estimateScenes(o: { sqft: number; floors: number; rooms: number }) {
  const byArea = Math.ceil(Math.max(0, o.sqft) / SQFT_PER_SCENE);
  const byRooms = Math.max(0, Math.round(o.rooms));
  const landings = Math.max(0, Math.round(o.floors) - 1);
  return Math.max(3, Math.max(byArea, byRooms) + landings);
}

/* ── Commercial terms ─────────────────────────────────────────────────── */

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
    "The number of revision rounds is stated on the quote. Revisions cover the agreed scenes, hotspots, labels and edits. New areas, extra scenes, re-capture and other scope changes need written approval and are quoted before we start them.",
  clientResponsibilities:
    "You confirm access to the space on the agreed date, the property owner's permission where needed, which areas are restricted or private, and that the space is ready (lighting on, clutter cleared, people informed). Logos and brand assets for branding are provided by you.",
  handoff:
    "The agreed tour link, embed code and final exports. Use of the final deliverables passes to you once the project is paid in full, for the permitted use stated on the quote. 360VUE keeps the source files and may retain them for the period the quote states. Third-party platforms, fonts and music stay under their own licences.",
  pricesFinal:
    "Plan prices cover the number of scenes stated. The website's estimate comes from the area, floors and rooms you enter; the final price is confirmed in a written quote after we see the space, stating the scenes and areas, add-ons, hosting period, revision rounds, travel and timeline.",
  timelines: "The delivery timeline is stated on each quote and starts once the advance is received and the capture date is confirmed.",
  paymentTerms:
    "50% advance to confirm the booking. 50% before final handover or activation, as agreed in the quote. Work outside the scope needs written approval. Recurring hosting or maintenance is billed separately.",
  thirdParty:
    "Every tour includes 12 months of hosting; after that, a Hosting & Care plan keeps the link and embed online (your Google Maps listing stays live either way). Travel beyond 25 km, platform fees and permits are not included unless the quote lists them.",
  privacy:
    "We take care with private and sensitive areas. Identifiable people and unintended sensitive information are removed or blurred where necessary, and areas you mark as restricted are not captured.",
  google:
    "Google Maps and Street View publishing is included for eligible content. Google decides what it accepts and shows; publishing does not guarantee search rankings, visits or sales.",
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
