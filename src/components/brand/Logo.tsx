import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The 360VUE logo.
 * variant: "wordmark" (emblem + 360VUE, set in Montserrat) · "mark" (the shutter emblem) · "full" (emblem over the
 * wordmark and SEE EVERY ANGLE., as on the brand board)
 * tone: "ink" (for light backgrounds: cream, paper, print) · "white" (for dark backgrounds: the site, the sidebar)
 *
 * The emblem is a transparent cut of the 4K render (public/brand/kit/ holds the full kit). The letters are live
 * text, so they stay sharp at every size and in print. "VUE" is always the gold gradient.
 */
const EMBLEM = "/brand/emblem-512.png";

export function Wordmark({ tone = "white", className, tagline = false }: { tone?: "ink" | "white"; className?: string; tagline?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-display font-bold tracking-[0.01em]", tone === "white" ? "text-cream" : "text-midnight")} style={{ fontSize: "1em" }}>
        360<span className="text-gold-grad">VUE</span>
      </span>
      {tagline && (
        <span className={cn("mt-[0.45em] font-display font-medium uppercase tracking-[0.42em]", tone === "white" ? "text-sand/80" : "text-bronze")} style={{ fontSize: "0.24em" }}>
          See every angle.
        </span>
      )}
    </span>
  );
}

export function Logo({
  variant = "wordmark",
  tone = "ink",
  className,
  href,
  priority,
  alt = "360VUE",
  tagline = false,
}: {
  variant?: "wordmark" | "mark" | "full";
  tone?: "ink" | "white";
  className?: string;
  href?: string;
  priority?: boolean;
  alt?: string;
  tagline?: boolean;
}) {
  const mark = (cls?: string) => (
    <Image src={EMBLEM} alt={variant === "mark" ? alt : ""} width={512} height={512} priority={priority} unoptimized className={cn("h-auto w-full select-none", cls)} draggable={false} />
  );

  const body =
    variant === "mark" ? (
      <span className={cn("block", className)}>{mark()}</span>
    ) : variant === "full" ? (
      <span className={cn("flex flex-col items-center text-[length:inherit]", className)} aria-label={alt}>
        <span className="block w-[3.2em]">{mark()}</span>
        <Wordmark tone={tone} tagline className="mt-[0.35em] items-center text-[1.6em]" />
      </span>
    ) : (
      <span className={cn("flex items-center gap-[0.4em] text-[length:inherit] leading-none", className)} aria-label={alt}>
        <span className="block aspect-square w-[1.9em] shrink-0">{mark()}</span>
        <Wordmark tone={tone} tagline={tagline} className="text-[1.15em]" />
      </span>
    );

  if (!href) return body;
  return (
    <Link href={href} aria-label="360VUE home" className="inline-block">
      {body}
    </Link>
  );
}
