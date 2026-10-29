/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HQ COLLECTION REGISTRY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every operational record in 360VUE HQ lives in   data/<collection>.json
 *  (a JSON array committed to 360VUE's private GitHub data repository).
 *  The field definitions below drive:
 *    • the generic table + form UI   (components/hq/CollectionManager)
 *    • server-side validation        (lib/hq/records.ts)
 *    • role-based access             (read / write roles)
 *  Modules may store extra keys on a record (e.g. a project's milestones);
 *  unknown keys are preserved.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { ALL, LEADERSHIP, MEDIA_SIDE, OPS, OPS_MEDIA, OPS_STUDIO, SALES_SIDE, STAFF, type Role } from "./roles";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "percent"
  | "date"
  | "month"
  | "time"
  | "select"
  | "multiselect"
  | "boolean"
  | "email"
  | "phone"
  | "url"
  | "ref"
  | "tags"
  | "lineItems";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  /** for type "ref": target collection name */
  ref?: string;
  required?: boolean;
  placeholder?: string;
  /** text fields: common values offered as you type; anything else may still be typed */
  suggestions?: string[];
  /** text fields: also offer the names in this collection (e.g. "team"), so people added later appear */
  suggestFrom?: string;
  help?: string;
  /** form layout width on md+ screens */
  width?: "full" | "half" | "third";
  /** show as a column in the default table */
  table?: boolean;
  /** hide in the generic form (module manages it) */
  hidden?: boolean;
  /** pay and payout details: only founders / admins ever receive this field */
  leadershipOnly?: boolean;
  /** amounts of money: only the roles that see Finance (founder, admin, ops) receive this field */
  opsOnly?: boolean;
  /** contact numbers and internal notes: every role receives this field except the shared interns login */
  staffOnly?: boolean;
  default?: unknown;
}

export interface CollectionDef {
  name: string;
  label: string;
  singular: string;
  description: string;
  /** lucide icon name (resolved in the UI) */
  icon: string;
  titleField: string;
  subtitleField?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  read: Role[];
  write: Role[];
  fields: FieldDef[];
  /** the shared interns login receives only the records where this tick-box field is on */
  internsOnlyIf?: string;
  /** records that change only through their own audited API (e.g. Incentives): the generic save and delete refuse them */
  managed?: boolean;
  /** id prefix, e.g. "cli" → cli_k3z9x1a7f2 */
  idPrefix: string;
}

export interface BaseRecord {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  [key: string]: unknown;
}

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
  sac?: string;
}

const opts = (...values: (string | [string, string])[]): FieldOption[] =>
  values.map((v) => (Array.isArray(v) ? { value: v[0], label: v[1] } : { value: v, label: v.replace(/(^|-)(\w)/g, (_, s, c) => (s ? " " : "") + c.toUpperCase()) }));

/* ── Shared option lists ─────────────────────────────────────────────────── */

export const CLIENT_STAGES = opts(
  ["lead", "Lead"],
  ["contacted", "Contacted"],
  ["discovery", "Discovery call"],
  ["quoted", "Quote sent"],
  ["negotiation", "Negotiation"],
  ["won", "Won"],
  ["active", "Active client"],
  ["lost", "Lost"],
  ["nurture", "Nurture later"],
);

/** Every service 360VUE sells: the ones on its rate card. Photography and video are FrameMind AI Studio's. */
export const SERVICE_OPTS = opts(
  ["tours", "360° virtual tour"],
  ["aerial", "SkyVUE aerial 360°"],
  ["spatial", "3D / spatial"],
  ["hosting", "Hosting & care"],
  ["other", "Other"],
);

export const PROJECT_STAGES = opts(
  ["kickoff", "Booked"],
  ["survey", "Site preparation"],
  ["capture", "Capture"],
  ["processing", "Processing"],
  ["assembly", "Tour assembly"],
  ["qa", "Quality check"],
  ["review", "Client review"],
  ["delivered", "Delivery & handover"],
  ["support", "Hosting period"],
  ["completed", "Completed"],
  ["on-hold", "On hold"],
  ["cancelled", "Cancelled"],
);

export const EXPENSE_CATEGORIES = opts(
  "Software & subscriptions",
  "Hosting, domains & cloud",
  "Tour platform & hosting",
  "Freelancers & contractors",
  "Equipment & gear",
  "Gear rental",
  "Stock, music & font licences",
  "Travel & fuel",
  "Food & refreshments",
  "Accommodation",
  "Printing",
  "Salaries & stipends",
  "Marketing & ads",
  "Rent & workspace",
  "Internet & phone",
  "Legal & compliance",
  "Bank & payment charges",
  "Miscellaneous",
);

export const INCOME_STREAMS = opts(
  "Virtual tours",
  "SkyVUE aerial",
  "3D / spatial",
  "Hosting & care",
  "Partner / white-label work",
  "Other",
);

const PAY_MODES = opts(["upi", "UPI"], ["bank", "Bank transfer"], ["cheque", "Cheque"], ["card", "Card"], ["cash", "Cash"], ["gateway", "Payment gateway"], ["wise", "Wise (international)"]);
const SOURCES = opts("Website", "Lead finder", "Google Maps prospecting", "Referral partner", "Instagram", "LinkedIn", "WhatsApp", "Direct visit", "Cold outreach", "Event", "Existing network", "Repeat client", "Other");

export const collections: CollectionDef[] = [
  /* ── Sales ───────────────────────────────────────────────────────────── */
  {
    name: "clients",
    label: "Clients",
    singular: "Client",
    description: "Every business in the pipeline — restaurants, hotels, showrooms, properties — from first lead to repeat client.",
    icon: "Building2",
    titleField: "name",
    subtitleField: "city",
    sortField: "updatedAt",
    sortDir: "desc",
    idPrefix: "cli",
    read: SALES_SIDE,
    write: OPS,
    fields: [
      { key: "name", label: "Client / company name", type: "text", required: true, table: true, width: "full" },
      { key: "stage", label: "Stage", type: "select", options: CLIENT_STAGES, default: "lead", table: true, width: "third" },
      { key: "clientType", label: "Type", type: "select", options: opts("Independent business", "Chain / group", "Property developer", "Real-estate agent / broker", "Agency / partner", "Institution", "Individual owner"), width: "third" },
      { key: "industry", label: "Industry", type: "text", suggestions: ["Restaurant / café", "Hotel / resort", "Banquet hall / venue", "Showroom / retail", "Real estate", "Gym / fitness", "Clinic / healthcare", "Office / co-working", "School / institution"], width: "third" },
      { key: "contactName", label: "Key contact", type: "text", table: true, width: "half" },
      { key: "contactRole", label: "Contact role", type: "text", placeholder: "e.g. Owner, Marketing manager, General manager", width: "half" },
      { key: "phone", label: "Phone", type: "phone", table: true, width: "third" },
      { key: "email", label: "Email", type: "email", width: "third" },
      { key: "website", label: "Website", type: "url", width: "third" },
      { key: "instagram", label: "Instagram / social", type: "text", width: "third" },
      { key: "city", label: "City", type: "text", table: true, width: "third" },
      { key: "country", label: "Country", type: "text", default: "India", width: "third" },
      { key: "address", label: "Billing address", type: "textarea", width: "full" },
      { key: "gstin", label: "GSTIN", type: "text", width: "third" },
      { key: "services", label: "Interested in", type: "multiselect", options: SERVICE_OPTS, width: "full" },
      { key: "budgetBand", label: "Budget", type: "select", options: opts("< ₹8K", "₹8K–₹18K", "₹18K–₹35K", "₹35K–₹1L", "> ₹1L", "Not shared"), width: "third" },
      { key: "dealValue", label: "Expected deal value", type: "currency", table: true, opsOnly: true, width: "third" },
      { key: "source", label: "Lead source", type: "select", options: SOURCES, width: "third" },
      { key: "owner", label: "Owner", type: "text", placeholder: "Who is closing this client", width: "third" },
      { key: "lastContact", label: "Last contact", type: "date", width: "third" },
      { key: "nextFollowUp", label: "Next follow-up", type: "date", table: true, width: "third" },
      { key: "lostReason", label: "Lost / nurture reason", type: "text", width: "full" },
      { key: "tags", label: "Tags", type: "tags", width: "full" },
      { key: "notes", label: "Notes", type: "textarea", staffOnly: true, width: "full" },
    ],
  },
  {
    name: "activities",
    label: "Activities",
    singular: "Activity",
    description: "Calls, discovery calls, meetings and follow-ups logged against clients.",
    icon: "PhoneCall",
    titleField: "summary",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "act",
    read: SALES_SIDE,
    write: OPS,
    fields: [
      { key: "clientId", label: "Client", type: "ref", ref: "clients", required: true, table: true, width: "half" },
      { key: "type", label: "Type", type: "select", options: opts("Call", "Discovery call", "Meeting", "Demo", "Email", "WhatsApp", "Quote", "Note"), table: true, width: "third" },
      { key: "date", label: "Date", type: "date", table: true, width: "third" },
      { key: "summary", label: "Summary", type: "text", required: true, table: true, width: "full" },
      { key: "outcome", label: "Outcome", type: "select", options: opts("Positive", "Neutral", "Negative", "No response"), table: true, width: "third" },
      { key: "nextStep", label: "Next step", type: "text", width: "half" },
      { key: "nextDate", label: "Next step date", type: "date", width: "third" },
      { key: "by", label: "Logged by", type: "text", width: "third" },
      { key: "details", label: "Details", type: "textarea", width: "full" },
    ],
  },
  {
    name: "leads",
    label: "Enquiries",
    singular: "Enquiry",
    description: "Every enquiry — from the website form, WhatsApp, Instagram, calls or referrals — before it becomes a client.",
    icon: "Inbox",
    titleField: "name",
    subtitleField: "organisation",
    sortField: "createdAt",
    sortDir: "desc",
    idPrefix: "lead",
    read: SALES_SIDE,
    write: OPS,
    fields: [
      { key: "kind", label: "Type", type: "select", options: opts(["project", "Tour / project enquiry"], ["contact", "General contact"], ["partner", "Partner / referral"], ["careers", "Job / internship application"]), default: "project", table: true, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts(["new", "New"], ["in-progress", "In progress"], ["converted", "Converted"], ["closed", "Closed"], ["spam", "Spam"]), default: "new", table: true, width: "third" },
      { key: "channel", label: "Came in through", type: "select", options: opts("Website form", "WhatsApp", "Instagram DM", "LinkedIn", "Phone call", "Email", "Referral", "Direct visit", "Event", "Other"), width: "third" },
      { key: "name", label: "Name", type: "text", required: true, table: true, width: "half" },
      { key: "organisation", label: "Business", type: "text", table: true, width: "half" },
      { key: "role", label: "Role", type: "text", width: "third" },
      { key: "phone", label: "Phone", type: "phone", table: true, width: "third" },
      { key: "email", label: "Email", type: "email", width: "third" },
      { key: "city", label: "City", type: "text", table: true, width: "third" },
      { key: "services", label: "Services", type: "multiselect", options: SERVICE_OPTS, width: "full" },
      { key: "budget", label: "Budget mentioned", type: "text", width: "third" },
      { key: "timeline", label: "Timeline", type: "text", placeholder: "e.g. Live before the grand opening", width: "third" },
      { key: "spaceSize", label: "Approximate space size", type: "text", placeholder: "e.g. 2,500 sq ft, 3 areas", width: "third" },
      { key: "estimate", label: "Website estimate", type: "currency", width: "third", help: "What the price configurator showed them (after any campaign discount). New quote opens with the same choices." },
      { key: "campaignId", label: "Campaign", type: "ref", ref: "campaigns", width: "third", help: "The offer they priced under on the website. A new quote from this enquiry opens with it." },
      { key: "quoteNo", label: "Website quote no.", type: "text", width: "third" },
      // the configurator's selections per service (read by New quote): set only by the website
      { key: "config", label: "Configured selections", type: "text", hidden: true },
      { key: "message", label: "Message", type: "textarea", width: "full" },
      { key: "page", label: "Submitted from", type: "text", width: "half" },
      { key: "clientId", label: "Converted to client", type: "ref", ref: "clients", width: "half" },
      { key: "ownerId", label: "Lead owner (team)", type: "ref", ref: "team", width: "half", help: "Who brought the lead in." },
    ],
  },
  {
    name: "proposals",
    label: "Quotes",
    singular: "Quote",
    description: "Quotes built from the rate card — configured service by service, printable, and turned into projects when accepted.",
    icon: "FileSignature",
    titleField: "number",
    subtitleField: "clientId",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "qte",
    read: SALES_SIDE,
    write: OPS,
    fields: [
      { key: "number", label: "Quote no.", type: "text", table: true, width: "third" },
      { key: "date", label: "Date", type: "date", table: true, width: "third" },
      { key: "validUntil", label: "Valid until", type: "date", width: "third" },
      { key: "clientId", label: "Client", type: "ref", ref: "clients", required: true, table: true, width: "half" },
      { key: "title", label: "Project title", type: "text", placeholder: "e.g. Café — 360° tour + photos", table: true, width: "half" },
      { key: "services", label: "Services", type: "multiselect", options: SERVICE_OPTS, width: "full" },
      { key: "discountPercent", label: "Extra discount %", type: "percent", width: "third" },
      { key: "extraItems", label: "Extra line items", type: "lineItems", width: "full" },
      { key: "total", label: "Total (ex-GST)", type: "currency", opsOnly: true, table: true, width: "third", help: "Worked out by the quote builder" },
      { key: "status", label: "Status", type: "select", options: opts("draft", "sent", "accepted", "rejected", "expired"), default: "draft", table: true, width: "third" },
      { key: "notes", label: "Notes / special terms", type: "textarea", width: "full" },
      // the configured services (which options in which groups), milestones and timeline live on the record:
      // lines, milestones, timelineWeeks, includeTerms — managed by the quote builder
    ],
  },

  /* ── Delivery ────────────────────────────────────────────────────────── */
  {
    name: "portalUpdates",
    label: "Client updates",
    singular: "Client update",
    description: "Progress updates, previews and approval requests (brief, capture date, preview) published to a client in the portal.",
    icon: "Megaphone",
    titleField: "title",
    subtitleField: "projectId",
    sortField: "createdAt",
    sortDir: "desc",
    idPrefix: "upd",
    read: STAFF,
    write: OPS,
    managed: true,
    fields: [
      { key: "title", label: "Update", type: "text", table: true },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", table: true },
    ],
  },
  {
    name: "portalTickets",
    label: "Client tickets",
    singular: "Client ticket",
    description: "Support requests, revision requests, broken links and billing questions clients raise in the portal.",
    icon: "LifeBuoy",
    titleField: "subject",
    subtitleField: "status",
    sortField: "updatedAt",
    sortDir: "desc",
    idPrefix: "tkt",
    read: STAFF,
    write: OPS,
    managed: true,
    fields: [
      { key: "subject", label: "Subject", type: "text", table: true },
      { key: "kind", label: "Kind", type: "text", table: true },
      { key: "status", label: "Status", type: "text", table: true },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", table: true },
      { key: "clientId", label: "Client", type: "ref", ref: "clients" },
    ],
  },
  {
    name: "campaigns",
    label: "Campaigns",
    singular: "Campaign",
    description: "Launch offers like Founding 100 — a discount on chosen services for a limited number of slots, counted live on the website.",
    icon: "Megaphone",
    titleField: "name",
    subtitleField: "status",
    sortField: "startDate",
    sortDir: "desc",
    idPrefix: "cmp",
    read: SALES_SIDE,
    write: OPS,
    fields: [
      { key: "name", label: "Campaign name", type: "text", required: true, placeholder: "Founding 100", table: true, width: "half" },
      { key: "status", label: "Status", type: "select", options: opts("draft", "live", "paused", "ended"), default: "draft", table: true, width: "third", help: "Only one live campaign shows on the website at a time (the newest)." },
      { key: "slug", label: "Web address", type: "text", placeholder: "founding-100", width: "third", help: "The offer page: 360vue.website/offers/<this>" },
      { key: "discountPercent", label: "Discount %", type: "percent", required: true, default: 40, table: true, width: "third" },
      { key: "serviceIds", label: "Discount applies to", type: "multiselect", options: SERVICE_OPTS, default: ["tours"], width: "full", help: "360° virtual tour = the tour plan and all its add-ons. Monthly hosting is never discounted." },
      { key: "totalSlots", label: "Slots", type: "number", default: 100, table: true, width: "third", help: "How many clients get the offer" },
      { key: "usedBefore", label: "Slots used before HQ tracked them", type: "number", default: 0, width: "third", help: "Usually 0. Every approved advance on a campaign project is counted automatically." },
      { key: "showOnWebsite", label: "Show on the website", type: "boolean", default: true, width: "third" },
      { key: "startDate", label: "Starts", type: "date", width: "third" },
      { key: "endDate", label: "Ends (optional)", type: "date", width: "third", help: "Leave empty to run until the slots are filled" },
      { key: "headline", label: "Headline", type: "text", placeholder: "Be among our first 100 tour projects", width: "full" },
      { key: "tagline", label: "Line under the headline", type: "text", placeholder: "Give your property a powerful digital presence with 360VUE.", width: "full" },
      { key: "terms", label: "Offer terms (shown on the website and quotes)", type: "textarea", width: "full", placeholder: "40% off eligible service charges before tax, for the first 100 tour projects to pay their advance. One offer per property. Cannot be combined with other discounts." },
      { key: "notes", label: "Internal notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "projects",
    label: "Projects",
    singular: "Project",
    description: "Every client project — milestones, deliverables, revisions, handover and support.",
    icon: "FolderKanban",
    titleField: "title",
    subtitleField: "clientId",
    sortField: "dueDate",
    sortDir: "asc",
    idPrefix: "prj",
    read: ALL,
    write: OPS,
    fields: [
      { key: "title", label: "Project", type: "text", required: true, placeholder: "e.g. Café — 360° virtual tour", table: true, width: "full" },
      { key: "campaignId", label: "Campaign", type: "ref", ref: "campaigns", width: "half", help: "Sold under a campaign (e.g. Founding 100): its approved advance uses a slot." },
      { key: "clientId", label: "Client", type: "ref", ref: "clients", table: true, width: "half" },
      { key: "service", label: "Main service", type: "select", options: SERVICE_OPTS, default: "tours", table: true, width: "half" },
      { key: "services", label: "All services in it", type: "multiselect", options: SERVICE_OPTS, width: "full" },
      { key: "stage", label: "Stage", type: "select", options: PROJECT_STAGES, default: "kickoff", table: true, width: "third" },
      { key: "priority", label: "Priority", type: "select", options: opts("low", "normal", "high", "urgent"), default: "normal", width: "third" },
      { key: "lead", label: "Project lead", type: "text", table: true, width: "third" },
      { key: "team", label: "Team on it", type: "tags", width: "full" },
      { key: "startDate", label: "Start", type: "date", width: "third" },
      { key: "dueDate", label: "Delivery date", type: "date", table: true, width: "third" },
      { key: "supportUntil", label: "Hosting until", type: "date", width: "third" },
      { key: "quoteId", label: "From quote", type: "ref", ref: "proposals", width: "half" },
      { key: "agreedAmount", label: "Agreed amount (ex-GST)", type: "currency", opsOnly: true, table: true, width: "third" },
      { key: "amountReceived", label: "Received so far", type: "currency", opsOnly: true, width: "third" },
      { key: "revisionsAllowed", label: "Revision rounds included", type: "number", default: 2, width: "third" },
      { key: "revisionsUsed", label: "Revision rounds used", type: "number", default: 0, width: "third" },
      { key: "clientContact", label: "Client contact", type: "text", width: "third" },
      { key: "clientContactPhone", label: "Contact phone", type: "phone", staffOnly: true, width: "third" },
      { key: "brief", label: "Brief", type: "textarea", width: "full" },
      { key: "driveUrl", label: "Shared folder (Drive)", type: "url", width: "half" },
      { key: "figmaUrl", label: "Tour editor link", type: "url", width: "half" },
      { key: "repoUrl", label: "Raw captures backup", type: "url", staffOnly: true, width: "half" },
      { key: "taskPrefix", label: "Task ID prefix", type: "text", width: "third", placeholder: "e.g. JHM", help: "Task IDs look like JHM-12. Set before the first task; leave empty to use the project's initials." },
      { key: "stagingUrl", label: "Preview link (for client review)", type: "url", width: "half" },
      { key: "liveUrl", label: "Live tour link", type: "url", width: "half" },
      { key: "hostingSuspended", label: "Hosting suspended", type: "boolean", width: "third", help: "Tick when the tour is set to Inactive in Panocool for an unpaid renewal. The client still signs in and sees invoices; the portal shows that hosting is suspended and how to renew." },
      { key: "feedbackScore", label: "Client rating (1–5)", type: "number", width: "third" },
      { key: "notes", label: "Internal notes", type: "textarea", staffOnly: true, width: "full" },
      // milestones, checklist, handover and the content list are kept on the record by the project screens
    ],
  },
  {
    name: "shoots",
    label: "Shoots",
    singular: "Capture day",
    description: "Capture days for tours, photography and video: call sheet, access, crew, gear, restricted areas and backups.",
    icon: "Camera",
    titleField: "title",
    subtitleField: "projectId",
    sortField: "date",
    sortDir: "asc",
    idPrefix: "sht",
    read: STAFF,
    write: OPS_MEDIA,
    fields: [
      { key: "title", label: "Capture day", type: "text", required: true, placeholder: "e.g. Café — 360° capture", table: true, width: "full" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", table: true, width: "half" },
      { key: "kind", label: "Type", type: "select", options: opts("360° tour", "SkyVUE aerial (drone)", "Tour + aerial", "Scoping visit", "Re-capture", "Progress re-flight", "Floor plan / 3D"), default: "360° tour", table: true, width: "half" },
      { key: "date", label: "Date", type: "date", required: true, table: true, width: "third" },
      { key: "callTime", label: "Crew call time", type: "time", default: "08:00", width: "third" },
      { key: "wrapTime", label: "Wrap by", type: "time", width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("tentative", "confirmed", "shot", "postponed", "cancelled"), default: "tentative", table: true, width: "third" },
      { key: "location", label: "Location", type: "text", table: true, width: "half" },
      { key: "mapLink", label: "Map link", type: "url", width: "half" },
      { key: "distanceKm", label: "Distance from base (km, one way)", type: "number", width: "third" },
      { key: "director", label: "Capture lead", type: "text", width: "third" },
      { key: "crew", label: "Crew", type: "tags", width: "full" },
      { key: "gear", label: "Gear to carry", type: "tags", width: "full", help: "Names from Gear & Assets, or anything else" },
      { key: "onSiteContact", label: "On-site contact", type: "text", width: "half" },
      { key: "onSitePhone", label: "On-site phone", type: "phone", staffOnly: true, width: "half" },
      { key: "dronePermission", label: "Drone permission", type: "select", options: opts("Not needed", "Pending", "Granted", "Not allowed"), default: "Not needed", width: "third" },
      { key: "releasesCollected", label: "Owner permission and releases collected", type: "boolean", width: "third" },
      { key: "backupDone", label: "Captures backed up (2 copies)", type: "boolean", width: "third" },
      { key: "shotList", label: "Viewpoints / shot list", type: "textarea", width: "full", placeholder: "Entrance\nMain hall — 3 viewpoints\nPrivate dining\nTerrace" },
      { key: "restricted", label: "Restricted or private areas (do not capture)", type: "textarea", width: "full" },
      { key: "notes", label: "Notes (parking, lighting, best time of day…)", type: "textarea", width: "full" },
    ],
  },
  {
    name: "deliverables",
    label: "Production",
    singular: "Deliverable",
    description: "Every deliverable promised to a client — tours, panoramas, photo sets, reels, floor plans — from planned to delivered.",
    icon: "Layers",
    titleField: "title",
    subtitleField: "projectId",
    sortField: "dueDate",
    sortDir: "asc",
    idPrefix: "dlv",
    read: ALL,
    write: OPS_MEDIA,
    fields: [
      { key: "projectId", label: "Project", type: "ref", ref: "projects", table: true, width: "half" },
      {
        key: "type",
        label: "Deliverable",
        type: "select",
        options: opts("Virtual tour", "Aerial 360° scene", "Landmark labels", "Panorama set", "Google Street View upload", "Website embed", "Floor plan", "3D walkthrough", "Virtual showroom", "Document", "Other"),
        table: true,
        width: "half",
      },
      { key: "title", label: "Title", type: "text", required: true, table: true, width: "full" },
      { key: "status", label: "Status", type: "select", options: opts(["planned", "Planned"], ["in-progress", "In progress"], ["internal-review", "Internal review"], ["client-review", "With client"], ["revisions", "Revisions"], ["approved", "Approved"], ["delivered", "Delivered"]), default: "planned", table: true, width: "third" },
      { key: "dueDate", label: "Due", type: "date", table: true, width: "third" },
      { key: "assignee", label: "Assignee", type: "text", table: true, width: "third" },
      { key: "round", label: "Revision round", type: "number", default: 0, width: "third" },
      { key: "link", label: "Link (Drive / Figma / preview / YouTube)", type: "url", width: "full" },
      { key: "notes", label: "Notes / client feedback", type: "textarea", width: "full" },
    ],
  },
  {
    name: "contentCalendar",
    label: "Content plan",
    singular: "Post",
    description: "Every post for 360VUE's channels and for each founder's own profile.",
    icon: "CalendarHeart",
    titleField: "title",
    sortField: "date",
    sortDir: "asc",
    idPrefix: "post",
    read: MEDIA_SIDE,
    write: OPS_MEDIA,
    fields: [
      { key: "account", label: "Posted from", type: "select", options: opts("360VUE", "Hrishikesh (personal)", "Chinmay (personal)"), default: "360VUE", table: true, width: "third" },
      { key: "date", label: "Publish date", type: "date", table: true, width: "third" },
      { key: "platform", label: "Platform", type: "select", options: opts("Instagram", "LinkedIn", "YouTube", "Facebook", "X", "Threads", "WhatsApp"), table: true, width: "third" },
      { key: "format", label: "Format", type: "select", options: opts("Reel", "Post", "Carousel", "Story", "Short", "Long video", "Article"), table: true, width: "third" },
      { key: "title", label: "Title / hook", type: "text", required: true, table: true, width: "full" },
      { key: "pillar", label: "Content pillar", type: "select", options: opts("Tour demo", "Client work", "Before / after", "Behind the scenes", "Capture tips", "Case study", "Industry spotlight", "Founder story", "Testimonials", "Offers", "Announcements", "Hiring", "Festival & days"), width: "half" },
      { key: "status", label: "Status", type: "select", options: opts("idea", "scripted", "designed", "shot", "edited", "scheduled", "published"), default: "idea", table: true, width: "half" },
      { key: "caption", label: "Caption", type: "textarea", width: "full" },
      { key: "link", label: "Published link", type: "url", width: "full" },
      { key: "owner", label: "Owner", type: "text", width: "half" },
      // a design saved from Social Studio → Create: which design and what was typed, so it can be opened again
      { key: "design", label: "Design", type: "text", hidden: true },
    ],
  },
  {
    name: "trips",
    label: "Travel",
    singular: "Trip",
    description: "Every trip — capture days, site visits, client meetings — vehicle, distance and costs.",
    icon: "Car",
    titleField: "to",
    subtitleField: "date",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "trp",
    read: STAFF,
    write: OPS,
    fields: [
      { key: "purpose", label: "Purpose", type: "select", options: opts("Capture day", "Site visit / survey", "Client meeting", "Sales visit", "Event", "Other"), default: "Capture day", table: true, width: "third" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", width: "third" },
      { key: "shootId", label: "Shoot", type: "ref", ref: "shoots", width: "third" },
      { key: "date", label: "Date", type: "date", required: true, table: true, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("planned", "done", "cancelled"), default: "planned", table: true, width: "third" },
      { key: "from", label: "From", type: "text", default: "Base", width: "third" },
      { key: "to", label: "To", type: "text", required: true, table: true, width: "half" },
      { key: "distanceKm", label: "Round-trip distance (km)", type: "number", table: true, width: "half" },
      { key: "vehicle", label: "Vehicle", type: "select", options: opts("Own car", "Two-wheeler", "Rented car + driver", "Cab", "Bus / train", "Flight"), width: "third" },
      { key: "billedToClient", label: "Billed to the client", type: "boolean", width: "third", help: "Outstation shoots: travel and stay are on the client" },
      { key: "team", label: "Team travelling", type: "tags", width: "full" },
      { key: "fuelCost", label: "Fuel", type: "currency", width: "third" },
      { key: "vehicleRent", label: "Vehicle / tickets", type: "currency", width: "third" },
      { key: "tollParking", label: "Toll & parking", type: "currency", width: "third" },
      { key: "accommodation", label: "Accommodation", type: "currency", width: "third" },
      { key: "food", label: "Food", type: "currency", width: "third" },
      { key: "otherCost", label: "Other", type: "currency", width: "third" },
      { key: "departTime", label: "Depart", type: "time", width: "third" },
      { key: "returnTime", label: "Return", type: "time", width: "third" },
      { key: "notes", label: "Notes (route, stay, contacts)", type: "textarea", width: "full" },
    ],
  },
  {
    name: "tasks",
    label: "Tasks",
    singular: "Task",
    description: "360VUE's shared to-do board.",
    icon: "ListChecks",
    titleField: "title",
    sortField: "dueDate",
    sortDir: "asc",
    idPrefix: "tsk",
    read: ALL,
    write: ALL,
    internsOnlyIf: "forInterns",
    fields: [
      { key: "title", label: "Task", type: "text", required: true, table: true, width: "full" },
      { key: "status", label: "Status", type: "select", options: opts(["todo", "To do"], ["doing", "Doing"], ["blocked", "Blocked"], ["done", "Done"]), default: "todo", table: true, width: "third" },
      { key: "priority", label: "Priority", type: "select", options: opts("low", "medium", "high", "urgent"), default: "medium", table: true, width: "third" },
      { key: "area", label: "Area", type: "select", options: opts("Sales", "Outreach", "Projects", "Capture", "Processing", "Social", "Partners", "Finance", "Admin", "Hiring"), table: true, width: "third" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", width: "half" },
      { key: "assignee", label: "Assignee", type: "text", table: true, width: "half" },
      { key: "dueDate", label: "Due", type: "date", table: true, width: "half" },
      { key: "description", label: "Details", type: "textarea", width: "full" },
      { key: "forInterns", label: "Show this task to interns", type: "boolean", default: false, width: "full", help: "The interns login sees only the tasks ticked here. Leave it off for anything about money, people or a client deal." },
    ],
  },



  /* ── Money ───────────────────────────────────────────────────────────── */
  {
    name: "invoices",
    label: "Invoices",
    singular: "Invoice",
    description: "Invoices to clients (tax invoices once GST-registered), with payments received.",
    icon: "ReceiptIndianRupee",
    titleField: "number",
    subtitleField: "customerName",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "inv",
    read: OPS,
    write: OPS,
    fields: [
      { key: "number", label: "Invoice no.", type: "text", table: true, width: "third", help: "Auto-assigned from Settings if left empty" },
      { key: "date", label: "Invoice date", type: "date", required: true, table: true, width: "third" },
      { key: "dueDate", label: "Due date", type: "date", width: "third" },
      { key: "clientId", label: "Client", type: "ref", ref: "clients", width: "half" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", width: "half" },
      { key: "milestone", label: "Milestone billed", type: "text", placeholder: "e.g. Advance — to confirm the booking (50%)", width: "full" },
      { key: "campaignId", label: "Campaign", type: "ref", ref: "campaigns", width: "half", help: "Set automatically from the project. When an advance on this invoice is approved (matched to the bank), it uses one of the campaign's slots." },
      { key: "leadId", label: "Lead (for commission)", type: "ref", ref: "leads", width: "half", help: "The registered lead this work came from. Payments on this invoice then count toward that lead owner's commission, once the founder has accepted the lead." },
      { key: "excludedAmount", label: "Pass-through / reimbursable charges (₹, before GST)", type: "currency", width: "half", help: "Third-party costs billed at cost (hosting, ad spend, travel). They never count toward incentives." },
      { key: "customerName", label: "Bill to (name)", type: "text", required: true, table: true, width: "half" },
      { key: "customerGstin", label: "Customer GSTIN", type: "text", width: "half" },
      { key: "customerAddress", label: "Billing address", type: "textarea", width: "full" },
      { key: "placeOfSupply", label: "Place of supply (state)", type: "text", width: "half" },
      { key: "chargeGst", label: "Charge GST", type: "boolean", width: "third", help: "Off while 360VUE is not GST-registered: no GST is added and it prints as an invoice, not a tax invoice. New invoices follow Settings → Tax & bank." },
      { key: "gstPercent", label: "GST %", type: "percent", default: 18, width: "third" },
      { key: "discount", label: "Discount (₹)", type: "currency", width: "third" },
      { key: "items", label: "Line items", type: "lineItems", width: "full" },
      { key: "status", label: "Status", type: "select", options: opts("draft", "sent", "partially-paid", "paid", "overdue", "cancelled"), default: "draft", table: true, width: "third" },
      { key: "total", label: "Total", type: "currency", table: true, width: "third", help: "Calculated from line items (plus GST when it is charged)" },
      { key: "amountPaid", label: "Amount received", type: "currency", table: true, width: "third" },
      { key: "notes", label: "Notes on invoice", type: "textarea", width: "full" },
    ],
  },
  {
    name: "expenses",
    label: "Expenses",
    singular: "Expense",
    description: "Every rupee spent — categorised, linked to projects, with receipts.",
    icon: "Wallet",
    titleField: "description",
    subtitleField: "category",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "exp",
    read: OPS,
    write: OPS,
    fields: [
      { key: "date", label: "Date", type: "date", required: true, table: true, width: "third" },
      { key: "category", label: "Category", type: "select", options: EXPENSE_CATEGORIES, required: true, table: true, width: "third" },
      { key: "amount", label: "Amount (₹, incl. tax)", type: "currency", required: true, table: true, width: "third" },
      { key: "description", label: "Description", type: "text", required: true, table: true, width: "full" },
      { key: "vendor", label: "Paid to", type: "text", width: "half" },
      { key: "projectId", label: "Project (if a direct cost)", type: "ref", ref: "projects", width: "half" },
      { key: "paidBy", label: "Paid by", type: "text", suggestions: ["Company account", "Hrishikesh", "Chinmay", "Cash box"], suggestFrom: "team", placeholder: "Company account, or who paid", table: true, width: "third" },
      { key: "mode", label: "Mode", type: "select", options: PAY_MODES, width: "third" },
      { key: "gstAmount", label: "GST in bill (₹)", type: "currency", width: "third" },
      { key: "billable", label: "Re-bill to the client", type: "boolean", width: "third" },
      { key: "reimbursable", label: "Needs reimbursement", type: "boolean", width: "third" },
      { key: "reimbursed", label: "Reimbursed", type: "boolean", width: "third" },
      { key: "receipt", label: "Receipt (vault path or link)", type: "text", width: "full" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "income",
    label: "Other Income",
    singular: "Receipt",
    description: "Money received outside invoices — small jobs, hosting renewals and partner work paid directly.",
    icon: "IndianRupee",
    titleField: "description",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "inc",
    read: OPS,
    write: OPS,
    fields: [
      { key: "date", label: "Date", type: "date", required: true, table: true, width: "third" },
      { key: "stream", label: "Revenue stream", type: "select", options: INCOME_STREAMS, table: true, width: "third" },
      { key: "amount", label: "Amount (₹)", type: "currency", required: true, table: true, width: "third" },
      { key: "description", label: "Description", type: "text", required: true, table: true, width: "full" },
      { key: "from", label: "Received from", type: "text", width: "half" },
      { key: "mode", label: "Mode", type: "select", options: PAY_MODES, width: "half" },
      { key: "reference", label: "Reference / UTR", type: "text", width: "half" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "team",
    label: "Team",
    singular: "Member",
    description: "Founders, capture operators, editors, sales, freelancers and interns.",
    icon: "Users",
    titleField: "name",
    subtitleField: "role",
    sortField: "name",
    sortDir: "asc",
    idPrefix: "tm",
    read: STAFF,
    write: LEADERSHIP,
    fields: [
      { key: "name", label: "Full name", type: "text", required: true, table: true, width: "half" },
      {
        key: "role",
        label: "Role",
        type: "text",
        suggestions: ["Founder", "Business Development Executive", "UI/UX Designer", "Full-stack Developer", "Automation Engineer", "AI Coach", "Photographer", "Videographer / Editor", "Social Media Manager", "Operations", "Intern"],
        placeholder: "e.g. 360° Capture Intern",
        help: "Type the exact role: it is printed on offer letters and ID cards.",
        table: true,
        width: "half",
      },
      { key: "founderId", label: "Founder", type: "select", options: opts(["hrishikesh", "Hrishikesh Kulkarni"], ["chinmay", "Chinmay R M"]), width: "third", help: "Links this record to a founder in the company profile: visiting cards, ID cards and the website use it. Only one record per founder." },
      { key: "login", label: "HQ login", type: "text", placeholder: "e.g. chinmay", width: "third", help: "The username this person signs in to HQ with (Settings → Logins)." },
      { key: "type", label: "Engagement", type: "select", options: opts("Full-time", "Part-time", "Freelance", "Intern"), default: "Intern", table: true, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("onboarding", "active", "inactive"), default: "active", table: true, width: "third" },
      { key: "joinDate", label: "Joined", type: "date", width: "third" },
      {
        key: "internshipEnds",
        label: "Internship ends (interns only)",
        type: "date",
        width: "third",
        leadershipOnly: true,
        help: "An internship is a fixed term of real training — keep it to 3–6 months. Before it ends: confirm them as staff (at least minimum wage), move them to freelance, or close it with the internship certificate.",
      },
      { key: "phone", label: "Phone", type: "phone", table: true, width: "third" },
      { key: "email", label: "Email", type: "email", width: "third" },
      { key: "city", label: "City", type: "text", width: "third" },
      { key: "address", label: "Address (printed on letters and agreements)", type: "textarea", width: "full", leadershipOnly: true },
      { key: "monthlyPay", label: "Monthly salary / stipend", type: "currency", width: "third", leadershipOnly: true },
      { key: "unitRate", label: "Freelance rate", type: "currency", width: "third", leadershipOnly: true, help: "Per day, per deliverable or per session — say which in the payslip" },
      {
        key: "compensationBasis",
        label: "Pay basis",
        type: "select",
        options: opts(["stipend", "Stipend (intern) + incentives"], ["fixed", "Fixed salary"], ["fixed-incentive", "Fixed salary + incentives"], ["freelance", "Freelance fees"], ["incentive-only", "Incentives only (no fixed pay)"]),
        default: "stipend",
        width: "third",
        leadershipOnly: true,
        help: "How this person is paid. Employees need at least minimum wage as fixed pay; incentives come on top.",
      },
      { key: "incentiveEligible", label: "Takes part in team incentives", type: "boolean", default: true, width: "third", leadershipOnly: true },
      { key: "incentiveFrom", label: "Incentives from (date)", type: "date", width: "third", leadershipOnly: true, help: "Joined mid-quarter? The bonus counts from here." },
      { key: "payoutDetails", label: "Payout (UPI ID / bank last 4)", type: "text", width: "third", help: "Avoid storing full account numbers", leadershipOnly: true },
      { key: "skills", label: "Skills & tools", type: "tags", width: "full" },
      { key: "portfolio", label: "Portfolio / GitHub / Behance", type: "url", width: "half" },
      { key: "githubUsername", label: "GitHub username", type: "text", width: "third", help: "HQ invites this account to the client repositories this person works on." },
      { key: "codeReviewer", label: "Can review and approve code", type: "boolean", width: "third", leadershipOnly: true, help: "Tech Lead and senior developers. Merging to main stays with the founder and admins." },
      { key: "agreementSigned", label: "Agreement / NDA signed", type: "boolean", width: "third" },
      { key: "ipAssigned", label: "IP assignment signed", type: "boolean", width: "third" },
      { key: "emergencyContact", label: "Emergency contact", type: "text", width: "full" },
      { key: "photo", label: "Profile photo", type: "text", hidden: true },
      { key: "photoUpdatedAt", label: "Photo updated", type: "text", hidden: true },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "payroll",
    label: "Payroll",
    singular: "Payslip",
    description: "Monthly pay runs — salaries, freelance units, deductions, payslips.",
    icon: "BadgeIndianRupee",
    titleField: "memberId",
    subtitleField: "month",
    sortField: "month",
    sortDir: "desc",
    idPrefix: "pay",
    read: LEADERSHIP,
    write: LEADERSHIP,
    fields: [
      { key: "month", label: "Month", type: "month", required: true, table: true, width: "third" },
      { key: "memberId", label: "Team member", type: "ref", ref: "team", required: true, table: true, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("pending", "paid", "on-hold"), default: "pending", table: true, width: "third" },
      { key: "fixedPay", label: "Fixed pay", type: "currency", width: "third" },
      { key: "units", label: "Freelance units", type: "number", width: "third", help: "Days, deliverables or sessions" },
      { key: "unitRate", label: "Rate per unit", type: "currency", width: "third" },
      { key: "unitLabel", label: "Unit", type: "select", options: opts("day", "deliverable", "session", "hour", "project"), default: "day", width: "third" },
      { key: "allowances", label: "Travel & other allowances", type: "currency", width: "third" },
      { key: "bonus", label: "Bonus / incentive", type: "currency", width: "third" },
      { key: "deductions", label: "Deductions / advances", type: "currency", width: "third" },
      { key: "tds", label: "TDS", type: "currency", width: "third" },
      { key: "netPay", label: "Net pay", type: "currency", table: true, width: "third", help: "Calculated" },
      { key: "paidOn", label: "Paid on", type: "date", width: "third" },
      { key: "mode", label: "Mode", type: "select", options: PAY_MODES, width: "third" },
      { key: "reference", label: "Reference / UTR", type: "text", width: "third" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },

  /* ── Gear, tools & vendors ───────────────────────────────────────────── */
  {
    name: "gear",
    label: "Gear & Assets",
    singular: "Item",
    description: "360° cameras, tripods, lights, drones, computers and accessories — who has what, and its condition.",
    icon: "Aperture",
    titleField: "name",
    subtitleField: "category",
    sortField: "name",
    sortDir: "asc",
    idPrefix: "gr",
    read: STAFF,
    write: OPS,
    fields: [
      { key: "name", label: "Item", type: "text", required: true, table: true, width: "half" },
      { key: "category", label: "Category", type: "select", options: opts("360° camera", "Drone", "Camera body", "Lens", "Tripod & levelling", "Lighting", "Stabiliser & rig", "Storage & media", "Batteries & power", "Computer", "Monitor & display", "Accessory", "Cleaning & cases"), table: true, width: "half" },
      { key: "assetTag", label: "Asset tag", type: "text", placeholder: "e.g. VUE-CAM-01", table: true, width: "third" },
      { key: "serial", label: "Serial no.", type: "text", staffOnly: true, width: "third" },
      { key: "qty", label: "Quantity", type: "number", default: 1, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts(["available", "Available"], ["out", "Out on a capture"], ["with-member", "With a team member"], ["repair", "In repair"], ["retired", "Retired / sold"]), default: "available", table: true, width: "third" },
      { key: "holder", label: "With / location", type: "text", placeholder: "e.g. Gear case A / Hrishikesh", table: true, width: "third" },
      { key: "condition", label: "Condition", type: "select", options: opts("New", "Good", "Fair", "Needs service"), default: "Good", width: "third" },
      { key: "purchaseDate", label: "Bought on", type: "date", width: "third" },
      { key: "purchaseCost", label: "Cost", type: "currency", opsOnly: true, width: "third" },
      { key: "warrantyUntil", label: "Warranty until", type: "date", width: "third" },
      { key: "vendorId", label: "Bought from", type: "ref", ref: "vendors", width: "half" },
      { key: "insured", label: "Insured", type: "boolean", width: "half" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "subscriptions",
    label: "Tools & Subscriptions",
    singular: "Subscription",
    description: "Every paid tool — stitching, tour platform, hosting, storage, editing — with its cost and renewal date. Never store passwords here.",
    icon: "CreditCard",
    titleField: "tool",
    subtitleField: "category",
    sortField: "renewalDate",
    sortDir: "asc",
    idPrefix: "sub",
    read: STAFF,
    write: OPS,
    fields: [
      { key: "tool", label: "Tool", type: "text", required: true, table: true, width: "half" },
      { key: "category", label: "Category", type: "select", options: opts("Stitching & editing", "Tour platform & hosting", "Domains & website", "Video & photo", "Storage & backup", "Productivity", "Marketing", "Finance", "Other"), table: true, width: "half" },
      { key: "plan", label: "Plan", type: "text", width: "third" },
      { key: "seats", label: "Seats", type: "number", width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("active", "trial", "paused", "cancelled"), default: "active", table: true, width: "third" },
      { key: "cycle", label: "Billing cycle", type: "select", options: opts("monthly", "yearly", "one-time", "usage"), default: "monthly", width: "third" },
      { key: "cost", label: "Cost per cycle", type: "currency", opsOnly: true, table: true, width: "third" },
      { key: "currency", label: "Billed in", type: "select", options: opts("INR", "USD", "EUR"), default: "INR", width: "third" },
      { key: "renewalDate", label: "Renews on", type: "date", table: true, width: "third" },
      { key: "owner", label: "Account owner", type: "text", width: "third" },
      { key: "billedTo", label: "Paid with", type: "text", placeholder: "e.g. Company card ••4421", staffOnly: true, width: "third" },
      { key: "projectId", label: "For a client project", type: "ref", ref: "projects", width: "half", help: "Hosting or tools the client should be billed for" },
      { key: "url", label: "Dashboard link", type: "url", width: "half" },
      { key: "notes", label: "Notes", type: "textarea", width: "full", help: "No passwords. Keep logins in a password manager." },
    ],
  },
  {
    name: "vendors",
    label: "Vendors",
    singular: "Vendor",
    description: "Freelancers, rental houses, printers, hosting and service providers.",
    icon: "Store",
    titleField: "name",
    subtitleField: "category",
    sortField: "name",
    sortDir: "asc",
    idPrefix: "ven",
    read: OPS,
    write: OPS,
    fields: [
      { key: "name", label: "Vendor", type: "text", required: true, table: true, width: "half" },
      { key: "category", label: "Category", type: "select", options: opts("Freelancer", "Gear rental", "Gear purchase", "Printing", "Hosting & domains", "Travel & stay", "Studio / location", "Talent & voice", "Music & stock", "Services", "Other"), table: true, width: "half" },
      { key: "contactName", label: "Contact person", type: "text", width: "third" },
      { key: "phone", label: "Phone", type: "phone", table: true, width: "third" },
      { key: "email", label: "Email", type: "email", width: "third" },
      { key: "website", label: "Website", type: "url", width: "half" },
      { key: "city", label: "City", type: "text", table: true, width: "half" },
      { key: "gstin", label: "GSTIN", type: "text", width: "third" },
      { key: "paymentTerms", label: "Payment terms", type: "text", width: "third" },
      { key: "rating", label: "Rating (1–5)", type: "number", table: true, width: "third" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },
  {
    name: "purchases",
    label: "Purchase Orders",
    singular: "Purchase",
    description: "Orders placed with vendors — gear, rentals, printing, freelance work.",
    icon: "ShoppingCart",
    titleField: "poNumber",
    subtitleField: "vendorId",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "po",
    read: OPS,
    write: OPS,
    fields: [
      { key: "poNumber", label: "PO no.", type: "text", table: true, width: "third" },
      { key: "date", label: "Order date", type: "date", required: true, table: true, width: "third" },
      { key: "expectedDate", label: "Expected", type: "date", width: "third" },
      { key: "vendorId", label: "Vendor", type: "ref", ref: "vendors", table: true, width: "half" },
      { key: "projectId", label: "For project", type: "ref", ref: "projects", width: "half" },
      { key: "status", label: "Status", type: "select", options: opts("draft", "ordered", "received", "cancelled"), default: "draft", table: true, width: "third" },
      { key: "items", label: "Items", type: "lineItems", width: "full" },
      { key: "shipping", label: "Shipping", type: "currency", width: "third" },
      { key: "total", label: "Total", type: "currency", table: true, width: "third", help: "Calculated" },
      { key: "paid", label: "Paid", type: "boolean", table: true, width: "third" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
    ],
  },

  /* ── Reputation ──────────────────────────────────────────────────────── */
  {
    name: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Quotes from clients — with written consent before they are used anywhere.",
    icon: "Quote",
    titleField: "name",
    subtitleField: "organisation",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "tst",
    read: MEDIA_SIDE,
    write: OPS_MEDIA,
    fields: [
      { key: "name", label: "Name", type: "text", required: true, table: true, width: "half" },
      { key: "role", label: "Role", type: "text", placeholder: "Owner, General manager, Marketing head…", table: true, width: "half" },
      { key: "organisation", label: "Business", type: "text", table: true, width: "half" },
      { key: "date", label: "Date", type: "date", width: "half" },
      { key: "quote", label: "Quote", type: "textarea", required: true, width: "full" },
      { key: "rating", label: "Rating (1–5)", type: "number", default: 5, width: "third" },
      { key: "service", label: "Service", type: "select", options: SERVICE_OPTS, width: "third" },
      { key: "published", label: "Used on the website", type: "boolean", table: true, width: "third" },
      { key: "photo", label: "Photo path / URL", type: "text", width: "half" },
      { key: "videoUrl", label: "Video URL", type: "url", width: "half" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", width: "half" },
      { key: "consent", label: "Written consent to publish", type: "boolean", width: "half" },
    ],
  },
  {
    name: "feedback",
    label: "Feedback",
    singular: "Response",
    description: "Feedback from clients at delivery.",
    icon: "MessageSquareHeart",
    titleField: "respondent",
    subtitleField: "projectId",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "fb",
    read: ALL,
    write: OPS_STUDIO,
    fields: [
      { key: "projectId", label: "Project", type: "ref", ref: "projects", table: true, width: "half" },
      { key: "learnerId", label: "Learner", type: "ref", ref: "learners", width: "half" },
      { key: "date", label: "Date", type: "date", table: true, width: "third" },
      { key: "respondent", label: "Respondent", type: "select", options: opts("Business owner", "Client team", "Partner", "Other"), table: true, width: "third" },
      { key: "name", label: "Name (optional)", type: "text", width: "third" },
      { key: "rating", label: "Rating (1–5)", type: "number", table: true, width: "third" },
      { key: "onTime", label: "Delivered on time", type: "boolean", width: "third" },
      { key: "wouldRecommend", label: "Would recommend / hire again", type: "boolean", table: true, width: "third" },
      { key: "liked", label: "What they liked", type: "textarea", width: "full" },
      { key: "improve", label: "What to improve", type: "textarea", width: "full" },
    ],
  },
  {
    name: "caseStudies",
    label: "Case Studies",
    singular: "Case study",
    description: "Real projects, real results — written up for pitches, decks and the website.",
    icon: "BookOpenCheck",
    titleField: "title",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "cs",
    read: MEDIA_SIDE,
    write: OPS_MEDIA,
    fields: [
      { key: "title", label: "Title", type: "text", required: true, table: true, width: "full" },
      { key: "clientId", label: "Client", type: "ref", ref: "clients", table: true, width: "half" },
      { key: "projectId", label: "Project", type: "ref", ref: "projects", width: "half" },
      { key: "date", label: "Date", type: "date", table: true, width: "third" },
      { key: "services", label: "Services", type: "multiselect", options: SERVICE_OPTS, width: "full" },
      { key: "challenge", label: "Challenge", type: "textarea", width: "full" },
      { key: "solution", label: "What 360VUE did", type: "textarea", width: "full" },
      { key: "results", label: "Results", type: "textarea", width: "full" },
      { key: "metrics", label: "Key numbers", type: "tags", width: "full", help: "Only numbers the client confirmed" },
      { key: "mediaLinks", label: "Links", type: "tags", width: "full" },
      { key: "published", label: "Published", type: "boolean", table: true, width: "third" },
    ],
  },

  /* ── Documents to sign ───────────────────────────────────────────────── */
  {
    name: "signDocs",
    label: "Documents to sign",
    singular: "Document",
    description: "Offer letters, NDAs, client agreements, statements of work and releases: who each one is for and who has signed.",
    icon: "Signature",
    titleField: "title",
    subtitleField: "partyName",
    sortField: "date",
    sortDir: "desc",
    idPrefix: "sgn",
    // offer letters carry pay, and agreements carry the amounts agreed with a client: founders and admins only
    read: LEADERSHIP,
    write: LEADERSHIP,
    fields: [
      { key: "ref", label: "Reference", type: "text", table: true, width: "third" },
      { key: "title", label: "Document", type: "text", required: true, table: true, width: "full" },
      { key: "template", label: "Template", type: "text", hidden: true },
      { key: "templateVersion", label: "Wording version", type: "text", hidden: true },
      { key: "partyKind", label: "For", type: "select", options: opts(["team", "Team member"], ["client", "Client"], ["vendor", "Vendor / freelancer"], ["other", "Someone else"]), width: "third" },
      { key: "partyId", label: "Record", type: "text", hidden: true },
      { key: "partyName", label: "Name", type: "text", table: true, width: "half" },
      { key: "date", label: "Date on the paper", type: "date", table: true, width: "third" },
      { key: "status", label: "Status", type: "select", options: opts("draft", "issued", "void"), default: "draft", table: true, width: "third" },
      { key: "issuedOn", label: "Printed or sent on", type: "date", width: "third" },
      { key: "dueBy", label: "Sign and return by", type: "date", width: "third" },
      { key: "partySigned", label: "Signed by them", type: "boolean", table: true, width: "third" },
      { key: "partySignedOn", label: "Signed by them on", type: "date", width: "third" },
      { key: "studioSigned", label: "Signed by 360VUE", type: "boolean", table: true, width: "third" },
      { key: "studioSignedOn", label: "Signed by 360VUE on", type: "date", width: "third" },
      { key: "scan", label: "Signed scan (File Vault)", type: "text", width: "full" },
      { key: "notes", label: "Notes", type: "textarea", width: "full" },
      // kept with the record by the Documents to Sign screen: party, values, signatories, company (see lib/sign/context.ts)
    ],
  },
];

export const collectionMap: Record<string, CollectionDef> = Object.fromEntries(collections.map((c) => [c.name, c]));

export function getCollection(name: string): CollectionDef | undefined {
  // own keys only: "constructor" or "__proto__" must not resolve to a built-in
  return Object.hasOwn(collectionMap, name) ? collectionMap[name] : undefined;
}

export function collectionPath(name: string) {
  return `data/${name}.json`;
}

export function lineItemsTotal(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((s: number, it: Partial<LineItem>) => s + (Number(it?.qty) || 0) * (Number(it?.rate) || 0), 0);
}

/** Invoice maths: subtotal → discount → GST → total. */
export function invoiceTotals(inv: Record<string, unknown>) {
  const subtotal = lineItemsTotal(inv.items);
  const discount = Number(inv.discount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  // "Charge GST" off (not registered) means no GST at all; invoices saved before the switch existed keep their rate
  const gstPercent = inv.chargeGst === false ? 0 : inv.gstPercent === undefined || inv.gstPercent === "" ? 18 : Number(inv.gstPercent) || 0;
  const gst = Math.round(taxable * gstPercent) / 100;
  const total = Math.round((taxable + gst) * 100) / 100;
  const paid = Number(inv.amountPaid) || 0;
  return { subtotal, discount, taxable, gstPercent, gst, cgst: gst / 2, sgst: gst / 2, total, paid, balance: Math.max(0, total - paid) };
}

/** Invoice totals counting the recorded payment entries (net received + TDS, refunds excluded) when there are any. */
export function invoiceTotalsWithPayments(inv: Record<string, unknown>) {
  const pays = Array.isArray(inv.payments) ? (inv.payments as Record<string, unknown>[]).filter((p) => p && p.refunded !== true) : [];
  if (!pays.length) return invoiceTotals(inv);
  const paid = pays.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.tds) || 0), 0);
  return invoiceTotals({ ...inv, amountPaid: Math.round(paid * 100) / 100 });
}

export function payrollNet(p: Record<string, unknown>) {
  const n = (k: string) => Number(p[k]) || 0;
  return n("fixedPay") + n("units") * n("unitRate") + n("allowances") + n("bonus") - n("deductions") - n("tds");
}

export function tripTotal(t: Record<string, unknown>) {
  return ["fuelCost", "vehicleRent", "tollParking", "accommodation", "food", "otherCost"].reduce((s, k) => s + (Number(t[k]) || 0), 0);
}
