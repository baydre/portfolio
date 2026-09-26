/**
 * The vertical rule between the social cluster and the "Hire me" button.
 *
 * ## Authoritative source
 *
 * Figma's own CSS export for this element is:
 *
 * ```json
 * {"width":"0","align-self":"stretch","stroke-width":"1px",
 *  "stroke":"rgba(102, 102, 102, 0.40)","filter":"blur(1.100000023841858px)"}
 * ```
 *
 * That is a **flat 1px stroke**, and it is what this renders. The five
 * properties map over like so:
 *
 * | CSS export      | implementation                          |
 * | --------------- | --------------------------------------- |
 * | `width: 0`      | a vertical line has a degenerate bbox, so the box width is 0 and *all* of the visible width is `stroke-width` → `w-px` |
 * | `stroke-width`  | `w-px`                                   |
 * | `stroke`        | `background-color`, flat                 |
 * | `align-self`    | `self-stretch`                           |
 * | `filter`        | `filter: blur(1.1px)`                    |
 *
 * ## The gradient in the snippet is not real
 *
 * The snippet also contains a `<linearGradient>` with
 * `#666666` @ 0.4 → `#1A1A11` → `#666666` @ 0.4, and a
 * `<filter id="filter0_f_297_467">` whose `feFlood`/`feBlend` pair is a no-op.
 * **Neither is part of the rendered element.** Figma's CSS export resolves the
 * paint to a flat `rgba(102, 102, 102, 0.40)` and keeps only the Gaussian blur,
 * dropping the gradient entirely.
 *
 * Two revisions of this file got this wrong by treating the snippet's `<defs>`
 * as authoritative:
 *
 * 1. One reproduced the gradient as a 6px-wide, 7-stop CSS gradient, mapping
 *    the snippet's 45-unit y-coordinates onto percentages. That was six times
 *    too wide, painted an invisible near-black (`#1A1A11` on the `#131417`
 *    header) through the middle so the rule read as two thin segments, and it
 *    mistook a 0.4-opacity stop for a full-opacity one.
 * 2. The next replaced that centre stop with opaque `#666666` and raised the
 *    blur to 2px, on the reasoning that a 1.1px blur was "imperceptible". Both
 *    were changes to a gradient that should never have been drawn.
 *
 * The `align-self: stretch` in the CSS export is the one thing the snippet's
 * `h-full` got right, and it is why `self-stretch` is used rather than
 * `h-full`: the cluster row is `align-items: center`, so its height is
 * content-derived and a percentage height would be indefinite.
 *
 * The design's values are reproduced exactly. If the rule needs to read heavier
 * against the header, `OPACITY` and `BLUR_PX` below are the two knobs — but that
 * is a deliberate departure from Figma, not a correction of it.
 */

/** `stroke: rgba(102, 102, 102, 0.40)`. */
const STROKE = "rgb(102 102 102 / 0.4)";

/** `filter: blur(1.100000023841858px)` — 1.1 as float32. */
const BLUR_PX = 1.1;

export function ClusterDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-px shrink-0 self-stretch ${className ?? ""}`}
      style={{ backgroundColor: STROKE, filter: `blur(${BLUR_PX}px)` }}
    />
  );
}
