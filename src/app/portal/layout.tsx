import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Client portal", template: "%s | 360VUE client portal" },
  robots: { index: false, follow: false },
};

/** The client portal: the site's dark, gold look, without the marketing navigation. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="vue-site min-h-dvh bg-midnight text-cream">{children}</div>;
}
