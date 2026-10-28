import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Montserrat } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "360VUE — 360° Virtual Tours & Drone 360 in South India", template: "%s | 360VUE" },
  description: site.description,
  applicationName: "360VUE",
  // Google Search Console: paste the token from "HTML tag" verification into NEXT_PUBLIC_GSC_VERIFICATION
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "360VUE",
    title: "360VUE — See Every Angle.",
    description: site.description,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "360VUE — See Every Angle." }],
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: "360VUE — See Every Angle.", description: site.description, images: ["/og-image.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#0E0B08",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} ${montserrat.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
