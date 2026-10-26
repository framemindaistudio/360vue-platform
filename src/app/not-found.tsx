import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0e0b08] px-6 text-center text-[#f9f5ed]">
      <Logo variant="mark" tone="white" className="w-20" />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-[#f59e4c]">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">This angle doesn&apos;t exist.</h1>
      <p className="mt-4 max-w-md text-sm text-[#f9f5ed]/60">The link may be old or the address mistyped.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-gold-grad px-6 py-3 text-sm font-semibold text-[#0e0b08]">
          Back to 360VUE
        </Link>
        <Link href="/hq" className="rounded-full border border-[#f9f5ed]/25 px-6 py-3 text-sm font-semibold">
          HQ
        </Link>
      </div>
    </div>
  );
}
