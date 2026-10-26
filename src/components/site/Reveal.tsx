"use client";

import { useEffect } from "react";

/**
 * Fades in every `.reveal` element as it scrolls into view. Content is visible without JavaScript: the hidden
 * state only applies once this runs (html.js-reveal), and a timer shows everything after 3 seconds regardless,
 * so a background tab or a slow observer can never leave text invisible.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("js-reveal");
    const show = (el: Element) => el.classList.add("in");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    const failsafe = window.setTimeout(() => document.querySelectorAll(".reveal").forEach(show), 3000);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(failsafe);
      root.classList.remove("js-reveal");
    };
  }, []);
  return null;
}
