"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { SiteIcon } from "./bits";

/** How long one slide takes, and how long it rests before the next. */
const MOVE_MS = 1100;
const HOLD_MS = 1500;
/** Ease-in-out (quart): starts slow, travels, settles — like a camera pan, not a conveyor belt. */
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

interface Item {
  id: string;
  name: string;
  icon: string;
}

/**
 * The industries under the home hero, sliding sideways one at a time. After each slide the first pill moves to the
 * end, so the strip never runs out. Pauses while hovered or focused and in background tabs; people who ask for
 * reduced motion get a still strip they can scroll.
 */
export function IndustryTicker({ items }: { items: Item[] }) {
  const [start, setStart] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const slide = () => {
      if (paused.current || document.hidden) {
        timer = window.setTimeout(slide, 600);
        return;
      }
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      el.style.transition = `transform ${MOVE_MS}ms ${EASE}`;
      el.style.transform = `translate3d(${-(first.offsetWidth + gap)}px,0,0)`;
      // a timer, not transitionend: it still fires if the tab was hidden mid-slide
      timer = window.setTimeout(() => {
        // re-order and snap back in the same frame, so nothing jumps
        flushSync(() => setStart((s) => (s + 1) % items.length));
        el.style.transition = "none";
        el.style.transform = "translate3d(0,0,0)";
        timer = window.setTimeout(slide, HOLD_MS);
      }, MOVE_MS);
    };
    timer = window.setTimeout(slide, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [items.length]);

  // twice over, so even the widest screen is always full
  const turn = [...items.slice(start), ...items.slice(0, start)];
  const row = [...turn.map((i) => ({ ...i, key: `a-${i.id}` })), ...turn.map((i) => ({ ...i, key: `b-${i.id}` }))];

  return (
    <div
      className="overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <ul ref={track} className="flex w-max gap-3 px-4 will-change-transform">
        {row.map((i, n) => (
          <li key={i.key} aria-hidden={n >= items.length || undefined}>
            <Link
              href={`/industries#${i.id}`}
              tabIndex={n >= items.length ? -1 : undefined}
              className="flex items-center gap-3 whitespace-nowrap rounded-full border border-cream/12 bg-night/60 px-5 py-3 text-[15px] font-medium text-cream/85 transition-colors hover:border-sunset/60 hover:text-sunset"
            >
              <SiteIcon name={i.icon} className="size-5 shrink-0 text-sunset" />
              {i.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
