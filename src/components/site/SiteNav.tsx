"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open
            ? "border-b border-cream/10 bg-midnight/85 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-[17px] sm:text-[19px]"
            aria-label="360VUE home"
          >
            <Logo tone="white" priority />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const active =
                pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-medium transition-colors xl:px-3.5",
                    active ? "text-sunset" : "text-cream/75 hover:text-cream",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden whitespace-nowrap rounded-full bg-gold-grad px-5 py-2.5 text-[13px] font-semibold text-midnight shadow-[0_8px_30px_-8px_rgba(245,158,76,0.6)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Get a Quote
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full border border-cream/15 text-cream lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu: outside the header, because the header's backdrop blur would trap a fixed panel inside its own 64px box */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-midnight transition-opacity duration-300 sm:top-[72px] lg:hidden",
          open ? "opacity-100" : "pointer-events-none invisible opacity-0",
        )}
      >
        <nav className="flex flex-col px-6 py-8" aria-label="Mobile">
          {[{ href: "/", label: "Home" }, ...NAV].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={cn(
                "border-b border-cream/10 py-4 font-display text-2xl font-semibold",
                pathname === n.href ? "text-sunset" : "text-cream",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-8 rounded-full bg-gold-grad py-4 text-center font-semibold text-midnight"
          >
            Get a Quote
          </Link>
        </nav>
      </div>
    </>
  );
}
