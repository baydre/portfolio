import type { LocationCopy } from "../../content/types";

/**
 * The location / reply copy, shared by the Contact section's left column and the
 * footer's first column — the design repeats this text in both frames, so
 * rendering it twice is the design's intent, not duplication. The markup is
 * shared here so the two copies cannot drift (AGENTS.md §4: two copies of markup
 * is a bug).
 *
 * Only `duration` is `whitespace-nowrap`, and that narrowness is the whole point.
 * Two wider versions were tried and both were wrong:
 *
 * 1. No protection at all — "24–48 hours" split as "24–" / "48 hours", because
 *    UAX #14 classifies U+2013 EN DASH as BA (break after). An NBSP cannot fix
 *    that either; it stops a break at the space, not after the dash.
 * 2. `whitespace-nowrap` on the whole 52-character response-time sentence — an
 *    over-correction. At ~348px inside a ~397px column it could never join the
 *    preceding line, pinning the paragraph to three lines.
 *
 * So the sentence flows with the lead and only the 11-character duration is
 * atomic, which is the smallest unit that satisfies the requirement.
 */
export function LocationCopy({
  lead,
  duration,
  className,
}: LocationCopy & { className?: string }) {
  return (
    <p className={className}>
      {lead} <span className="whitespace-nowrap">{duration}</span>
    </p>
  );
}
