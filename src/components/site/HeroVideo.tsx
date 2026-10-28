"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The home page's background clip. The still shows at once (sized for the screen); the 1.7 MB clip only starts
 * downloading after the page has finished loading, so on a slow phone connection the page's own scripts (the menu,
 * the buttons) are not stuck behind the video. Reduced-motion visitors keep the still.
 */
export function HeroVideo({ src, poster, posterSmall, className }: { src: string; poster: string; posterSmall: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = () => setLoad(true);
    if (document.readyState === "complete") {
      const t = setTimeout(start, 300);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    if (load) ref.current?.play().catch(() => {});
  }, [load]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} srcSet={`${posterSmall} 960w, ${poster} 1920w`} sizes="100vw" alt="" fetchPriority="high" decoding="async" className={className} aria-hidden />
      {load && (
        <video
          ref={ref}
          className={`${className ?? ""} transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onPlaying={() => setPlaying(true)}
          aria-hidden
        />
      )}
    </>
  );
}
