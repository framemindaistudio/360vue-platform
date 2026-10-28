/**
 * 360VUE — the company profile the website and HQ print on pages, documents, papers, cards and emails.
 *
 * `url` is the address the deployment answers on: the public website at / and HQ at /hq (links in emails, QR codes
 * and papers sent to sign point here). Contact details come from env vars (NEXT_PUBLIC_CONTACT_EMAIL and friends) so
 * they can change without a code change. Anything left empty is simply not shown: nothing here is guessed.
 */
const PROD_URL = "https://www.360vue.website";
const DEV_URL = "http://localhost:3012";

export const site = {
  name: "360VUE",
  /** the legal entity name is not decided yet (the founders' structure is still to be confirmed): set it when it is */
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "360VUE",
  expansion: "360VUE",
  pronounced: "Three-Sixty View",
  tagline: "See Every Angle.",
  line: "360° Virtual Tours · Photography · Immersive Experiences",
  pillars: ["360° Virtual Tours", "SkyVUE Aerial 360°", "Google Maps Publishing", "3D & Digital Twins"],
  headline: "Real spaces. Real experiences.",
  description:
    "360VUE makes 360° virtual tours, SkyVUE drone 360° aerial views and Google Maps listings for restaurants, hotels, banquet halls, showrooms, hospitals, colleges and real estate across South India — Bengaluru, Chennai, Hyderabad, Kochi and beyond.",
  mission: "Help businesses showcase their spaces online through high-quality, interactive visual experiences.",
  vision: "Become a trusted provider of virtual tours and immersive visual experiences for businesses across India, with the potential to serve international clients.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? PROD_URL : DEV_URL)).replace(/\/+$/, ""),
  website: (process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? PROD_URL : DEV_URL)).replace(/\/+$/, ""),
  location: process.env.NEXT_PUBLIC_LOCATION || "",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "framemindaistudio@gmail.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 78993 04889",
    /** digits only, with country code, e.g. 919800000000 */
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || "917899304889").replace(/\D/g, ""),
  },
  socials: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE || "",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN || "",
  },
  /** the company itself (shared HQ screens credit "the company" by this name) */
  studio: {
    name: "360VUE",
    url: `${PROD_URL}/`,
  },
  /**
   * The parent company. Its services (photography, videography, social media, websites, software, automations…) are
   * delivered in-house by FrameMind AI Studio; its own website is the accurate list, so the site links there.
   */
  parent: {
    name: "FrameMind AI Studio",
    url: "https://www.framemindaistudio.com",
    pricingUrl: "https://www.framemindaistudio.com/pricing",
    founder: "Chinmay R M",
    services: [
      { name: "Photography", line: "Brand, product and event shoots" },
      { name: "Videography", line: "Brand films, reels and event videos" },
      { name: "Social Media Management", line: "Planning, creatives and publishing" },
      { name: "Websites", line: "Design, development and launch" },
      { name: "Brand Identity", line: "Logos, guidelines and assets" },
      { name: "Custom Software", line: "Dashboards, platforms and tools" },
      { name: "Automations", line: "Workflows, AI and integrations" },
      { name: "1:1 AI Coaching", line: "Learn AI one to one, online or offline" },
    ],
  },
  /** the founders; the rest of the team lives in HQ → Team & Payroll */
  founders: [
    {
      id: "hrishikesh",
      name: "Hrishikesh Kulkarni",
      role: "Founder",
      /** another role shown under the name on the website (empty: none) */
      also: "",
      focus: "",
      bio: "",
      initials: "HK",
      photo: "",
    },
    {
      id: "chinmay",
      name: "Chinmay R M",
      role: "Co-Founder",
      also: "Founder, FrameMind AI Studio",
      focus: "",
      bio: "",
      initials: "CR",
      photo: "",
    },
  ],
};

export function whatsappLink(message: string) {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
