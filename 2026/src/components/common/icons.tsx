import { siInstagram } from "simple-icons";
import type { SocialNetwork } from "../../content/types";

/**
 * Brand glyphs for the social tiles.
 *
 * The Figma snippet renders three identical placeholder squares and does not
 * identify the networks, so these icons are an assumption — see
 * docs/DESIGN_SYSTEM.md §7.
 *
 * Inlined rather than pulled from an icon package: the design needs exactly
 * three glyphs, and AGENTS.md §4 says not to add a dependency that an existing
 * one cannot justify. All paths are drawn on a 24 × 24 grid and inherit
 * `currentColor`.
 *
 * Four glyphs came from the design, and a fifth did not.
 *
 * `linkedin` / `github` / `x` are the design's own placeholder squares plus the
 * footer's naming. `instagram` and `youtube` have **no usable design provenance**:
 * the frame's working copy contains no path for either, and the About frame draws
 * no YouTube tile at all. Both therefore come from `simple-icons` (CC0, already a
 * dependency for the Tools row) rather than from a hand-drawn reconstruction —
 * see the `instagram` entry for the measurement that forced that change, and
 * `common/TechIcon.tsx` for the same trade-off made on KiCad. Both are verified to
 * fill their 24 × 24 box, optical centre (12.00, 12.00).
 *
 * The frame also drew Behance, and a phone tile that is not a network at all.
 * Both were dropped from the row on the owner's instruction 2026-09-26, and
 * Behance's glyph was removed with them rather than left here unused: it had no
 * other consumer, and neither the header nor the footer links Behance. The phone
 * is back as a CONTACT-CARD row glyph — see `ProfileSection`'s `ContactCard` —
 * which is a different component from this table and does not use `SocialIcon`.
 */

const paths: Record<SocialNetwork, string> = {
  linkedin:
    "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.03-1.85-3.03-1.86 0-2.14 1.44-2.14 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  github:
    "M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z",
  x: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z",
  /* Was AUTHORED, NOT TRANSCRIBED and is now from simple-icons, because the
     hand-reconstruction was MEASURABLY BROKEN.

     The 24 × 24 bbox of the old path was x 0.00–24.05, y **−8.13**–24.00 — it
     overshot the top of its own viewBox by 8 units, so the `<svg>`'s default
     `overflow: hidden` clipped the mark and it rendered sitting high and left in
     its tile. Cause: the reconstruction replaced the closing curve of the outer
     border (canonical `c-4.354-2.617-6.78-6.979-6.98`) with a duplicated copy of
     the top-right segment, so the subpath never returned to (12, 0) and ended at
     (20.03, −8.13). The "VERIFY VISUALLY / has not been seen rendered" caveat
     recorded against it was therefore not a formality — it was the only thing
     standing between a malformed path and the page.

     The frame still supplies no Instagram path, so this is not a loss of
     provenance: it is the same trade-off as KiCad (`TechIcon.tsx`) and YouTube
     below — for a brand mark, an existing CC0 source beats an unaudited redraw.
     Verified to fill 0–24 on both axes, optical centre (12.00, 12.00). */
  instagram: siInstagram.path,
  /* simple-icons `youtube`, CC0 — NOT the frame's own path, because the frame has
     none: YouTube is not one of the five tiles the About frame draws, it was added
     to the profile card on the owner's instruction 2026-09-26. So unlike the four
     above there is nothing to transcribe, and the project's existing brand-mark
     source (simple-icons, already a dependency for the Tools row) is used instead
     of hand-drawing a play button — see the KiCad decision in
     `common/TechIcon.tsx`. 24 × 24, single path. VERIFY VISUALLY. */
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

export function SocialIcon({
  network,
  className,
}: {
  network: SocialNetwork;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d={paths[network]} />
    </svg>
  );
}

/**
 * The footer's "View Work" arrow, transcribed from the design's own SVG.
 *
 * NO ICON LIBRARY SHIPS THIS GLYPH. Three were checked against the authored
 * geometry (15 × 15 grid, stroke-width 1.5) and every one mismatches on all
 * three measures once normalised to that grid:
 *
 * | Measure            | Design (15) | lucide `arrow-right` @15 |
 * | ------------------ | ----------- | ------------------------ |
 * | shaft length       | 11.25       | 8.75                     |
 * | chevron height     | 10.58       | 8.75                     |
 * | stroke width       | 1.5         | 2                        |
 *
 * - `lucide-react` IS installed, but its `arrow-right` is a 24-grid glyph at
 *   stroke-width 2 — proportionally shorter and stubbier, and heavier.
 * - `@radix-ui/react-icons` would be the closest on *grid* (Radix also draws on
 *   15 × 15 with round caps), but it is not installed, its `ArrowRight` is
 *   stroke-width 1 with a 10-unit shaft and 7-unit head, and adding a package to
 *   reproduce a glyph the design already provides contradicts AGENTS.md §4.
 * - `@mui/icons-material` is installed, but its arrows are 24-grid and either
 *   solid-filled or a different construction.
 *
 * So the path data is used verbatim, consistent with every other icon here.
 *
 * `currentColor`, not the authored `stroke="white"`: the link's own colour is
 * `text-foreground` (#E9E9EC) and the arrow sits 8px from that label, so
 * inheriting keeps the pair visually identical rather than a shade apart. The
 * palette deliberately moved off pure white, and hardcoding #FFF in a component
 * would put it back.
 */
export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.83691 2.21191L13.125 7.49996L7.83691 12.788" />
      <path d="M13.1249 7.5L1.875 7.5" />
    </svg>
  );
}
