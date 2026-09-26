import { TechIcon } from "./TechIcon";

/**
 * One technology tile: the tile box plus the label beneath it.
 *
 * Shared by the Work cards' "Built with" panel and the About page's Tools row.
 * The frame draws the same object in both places — `bg-tech-tile`, `rx-8`,
 * `p-3`, a 32 × 32 glyph, then a 14px label — so this is the one copy of it.
 *
 * ## What this deliberately does NOT include
 *
 * The wrapping `<li>` and its width behaviour. The two callers size tiles
 * completely differently and neither is derivable from the other:
 *
 * - **Work cards** wrap to two rows (3 + 2) inside a `@container` panel, so each
 *   tile is `flex-1` with a basis that changes at `@[216px]`.
 * - **About** is a single row of five inside a fixed 620px block, so each tile
 *   is `flex-1` with no basis and no wrapping.
 *
 * So layout stays at the call site and only the tile travels. See
 * `ProjectCard.tsx` and `components/about/ProfileSection.tsx`.
 *
 * ## The icon box is ALWAYS reserved
 *
 * `TechIcon` returns `null` for a tool it has no glyph for, and this component
 * used to render the glyph directly — so an unmapped tool produced a tile that
 * was `p-3` and a label with no 32px box inside it. Every Work stack entry is
 * "React.js", so that never showed. The About Tools row has four unmapped
 * entries out of five, and without a reserved box their tiles came out roughly
 * half the height of the React one and their labels sat 44px higher.
 *
 * The 32 × 32 box is therefore always present and the glyph is optional inside
 * it. Same approach, same reason, as `ServiceIcon` holding the slot at a
 * service graphic that has not been supplied.
 *
 * The glyph keeps `relative` + `overflow-hidden` from the Work panel, where the
 * design positions the vector absolutely inside a relative glyph frame.
 */
export function TechTile({ tool }: { tool: string }) {
  return (
    <>
      {/* border-radius 8, per the raw CSS. NOT `rounded-lg`: the panel around
          it is 12 and the tile box is 8, and they are easy to confuse because
          the panel's own radius is the one the Tailwind export spells
          `rounded-xl`. */}
      <div className="flex w-full flex-col items-center justify-center gap-2.5 rounded-md bg-tech-tile p-3">
        <span className="flex h-8 w-8 items-center justify-center">
          <TechIcon tool={tool} className="relative h-8 w-8 overflow-hidden" />
        </span>
      </div>
      <p className="w-full text-center text-caption leading-tile text-tech-tile-foreground">
        {tool}
      </p>
    </>
  );
}
