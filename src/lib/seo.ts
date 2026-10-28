/**
 * Structured data (schema.org JSON-LD) shared by the public pages, so search engines know who 360VUE is, what it sells,
 * where it works and what it costs. Only facts we can stand behind go here: no street address until one is confirmed
 * (NEXT_PUBLIC_LOCATION), and no ratings or reviews unless they are real.
 */
import { site } from "@/lib/site";
import { AREA_SERVED } from "@/lib/locations";

export const ORG_ID = `${site.url}/#organization`;

export function organizationLd() {
  const sameAs = [site.socials.instagram, site.socials.youtube, site.socials.linkedin, site.parent.url].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: site.name,
    alternateName: ["360 VUE", "Three-Sixty View", "SkyVUE"],
    description:
      "360° virtual tours, SkyVUE drone 360° aerial views and Google Maps & Street View publishing for businesses and real estate across South India: Karnataka, Tamil Nadu, Kerala, Telangana, Andhra Pradesh and Puducherry.",
    url: site.url,
    logo: `${site.url}/brand/emblem-512.png`,
    image: `${site.url}/og-image.jpg`,
    telephone: site.contact.phone || undefined,
    email: site.contact.email || undefined,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    ...(site.location ? { address: { "@type": "PostalAddress", addressLocality: site.location, addressCountry: "IN" } } : {}),
    areaServed: AREA_SERVED.map((name) => ({ "@type": "State", name, containedInPlace: { "@type": "Country", name: "India" } })),
    knowsAbout: ["360° virtual tours", "Google Street View", "Drone 360° aerial photography", "Virtual tours for real estate", "Virtual tours for hotels and restaurants"],
    parentOrganization: { "@type": "Organization", name: site.parent.name, url: site.parent.url },
    founder: [{ "@type": "Person", name: "Hrishikesh Kulkarni" }, { "@type": "Person", name: "Chinmay R M" }],
    sameAs,
  };
}

export const ldScript = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
