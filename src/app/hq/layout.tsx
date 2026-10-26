import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "360VUE HQ", template: "%s · 360VUE HQ" },
  robots: { index: false, follow: false },
};

export default function HqRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
