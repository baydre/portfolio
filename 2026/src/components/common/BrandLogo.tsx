import logoMark from "../../assets/baydre-logo.png";

/**
 * The navbar's 121 × 64 logo mark.
 *
 * The design carves the mark out of an SVGO file (`src/assets/baydre.svg`,
 * 640 KB) built around a 3244 × 1705 embedded PNG. Nothing in that SVG is
 * vector — it is a `<rect>` wrapping the raster — so the header references a
 * downscaled PNG (4× the displayed 121 × 64 = 483 × 256, ~76 KB) rasterised
 * from the SVG once at export time. The SVG stays as the design source.
 *
 * The header provides its own brand mark, but the mark itself is not a link in
 * the design; the Home nav item does not link to `/` either, so no click
 * target is invented here. `alt` names the site for screen readers.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoMark}
      width={121}
      height={64}
      alt="BaydreAfrica"
      className={`shrink-0 ${className ?? ""}`}
    />
  );
}