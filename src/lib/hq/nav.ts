import { ALL, LEADERSHIP, MEDIA_SIDE, OPS, SALES_SIDE, STAFF, type Role } from "./roles";

export interface HqNavItem {
  label: string;
  href: string;
  icon: string; // lucide-react export name
  roles: Role[];
  description: string;
}

export interface HqNavGroup {
  title: string;
  items: HqNavItem[];
}

/** The HQ sidebar. Every module route lives under /hq. */
export const hqNav: HqNavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Command Center", href: "/hq", icon: "LayoutDashboard", roles: ALL, description: "Pipeline, projects, cash and what's next" },
      { label: "Tasks", href: "/hq/tasks", icon: "ListChecks", roles: ALL, description: "Shared to-do board" },
      { label: "Activity Log", href: "/hq/activity", icon: "History", roles: LEADERSHIP, description: "Every change, who made it, when" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Enquiries", href: "/hq/leads", icon: "Inbox", roles: SALES_SIDE, description: "Website, WhatsApp, Instagram and referral enquiries" },
      { label: "Clients CRM", href: "/hq/crm", icon: "Building2", roles: SALES_SIDE, description: "Pipeline from lead to repeat client" },
      { label: "Quotes", href: "/hq/proposals", icon: "FileSignature", roles: SALES_SIDE, description: "Tour packages and add-ons from the rate card, print, book" },
    ],
  },
  {
    title: "Delivery",
    items: [
      { label: "Projects", href: "/hq/projects", icon: "FolderKanban", roles: ALL, description: "The eight-step tour workflow, milestones, handover" },
      { label: "Production", href: "/hq/production", icon: "Layers", roles: ALL, description: "Every deliverable from planned to delivered" },
      { label: "Capture Days", href: "/hq/shoots", icon: "Camera", roles: STAFF, description: "Call sheets, access, restricted areas, gear and backups" },
      { label: "Travel", href: "/hq/travel", icon: "Car", roles: STAFF, description: "Site visits, capture trips, travel costs" },
      { label: "Feedback & Testimonials", href: "/hq/reputation", icon: "MessageSquareHeart", roles: MEDIA_SIDE, description: "Feedback, testimonials, case studies" },
    ],
  },
  {
    title: "Brand & Social",
    items: [{ label: "Social Studio", href: "/hq/social", icon: "Megaphone", roles: MEDIA_SIDE, description: "Designs to download, content plan, captions" }],
  },
  {
    title: "Money",
    items: [
      { label: "Finance", href: "/hq/finance", icon: "ReceiptIndianRupee", roles: OPS, description: "P&L, invoices, expenses, income" },
      { label: "Rate Card", href: "/hq/prices", icon: "BadgeIndianRupee", roles: OPS, description: "Every package, add-on and price 360VUE quotes" },
      { label: "Team & Payroll", href: "/hq/team", icon: "Users", roles: STAFF, description: "People, salaries, freelance pay, payslips" },
      { label: "Business Planner", href: "/hq/planner", icon: "Calculator", roles: OPS, description: "Monthly costs, targets, the 90-day plan in numbers" },
    ],
  },
  {
    title: "Legal",
    items: [{ label: "Documents to Sign", href: "/hq/sign", icon: "Signature", roles: LEADERSHIP, description: "Offer letters, NDAs, client agreements, releases" }],
  },
  {
    title: "Kit",
    items: [
      { label: "Gear & Assets", href: "/hq/gear", icon: "Aperture", roles: STAFF, description: "360° cameras, tripods, lights, drones, computers" },
      { label: "Tools & Vendors", href: "/hq/tools", icon: "CreditCard", roles: STAFF, description: "Subscriptions, renewals, vendors, purchase orders" },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { label: "Presentations", href: "/hq/presentations", icon: "Presentation", roles: ALL, description: "Client pitch deck and team handbook" },
      { label: "Operations Library", href: "/hq/docs", icon: "FolderOpen", roles: ALL, description: "SOPs, playbooks, policies — versioned" },
      { label: "Printables", href: "/hq/printables", icon: "Printer", roles: ALL, description: "Letterhead, visiting cards, ID cards, rate card" },
      { label: "File Vault", href: "/hq/files", icon: "Archive", roles: STAFF, description: "Receipts, signed papers, permissions" },
      { label: "Brand Kit", href: "/hq/brand", icon: "Gem", roles: ALL, description: "4K logos, colours, type, photos and videos" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/hq/settings", icon: "Settings", roles: LEADERSHIP, description: "Company profile, numbering, logins, data" }],
  },
];

export function navForRole(role: Role) {
  return hqNav.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length);
}

export function findNavItem(href: string) {
  for (const g of hqNav) for (const i of g.items) if (i.href === href) return i;
  return undefined;
}
