"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A vertical clip that plays muted while it is on screen, with its still as the poster (and as the fallback if the
 * clip cannot play). Nothing autoplays off screen, so a page of clips stays light.
 */
export function ReelCard({ video, poster, alt, className }: { video: string; poster: string; alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [failed]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={alt} className={className} loading="lazy" />;
  }
  return <video ref={ref} className={className} src={near ? video : undefined} poster={near ? poster : undefined} muted loop playsInline preload="none" aria-label={alt} onError={() => setFailed(true)} />;
}
