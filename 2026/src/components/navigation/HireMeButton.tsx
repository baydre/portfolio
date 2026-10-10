import { Button } from "../../app/components/ui/button";
import { ctaLabel } from "../../content/profile";
import { siteUrl } from "../../lib/site-url";

/**
 * The "Let's Build" call to action: the filled button at the end of the nav's
 * right cluster.
 *
 * Authored from the updated navbar snippet (2026-10-08):
 * `px-4 py-2 bg-lime-300 rounded-lg` wrapping a `text-[#171717] font-jura
 * text-sm font-medium leading-5` label.
 *
 * The snippet nests the label inside a `<div>` (the fill) inside a `<button>`.
 * Both layers collapse here into one element, and it is an `<a>` rather than a
 * `<button>`: the action is navigation to the contact section, so a button
 * would misrepresent it to assistive technology (WCAG 2.2 AA 4.1.2). `asChild`
 * puts the button's styling on the anchor, so the result is one `<a>`, not a
 * button nested in a link.
 *
 * Everything else comes from the shadcn `default` variant and its `default`
 * size, which already match the snippet: `rounded-md` (8px here — `theme.css`
 * remaps the radius scale, so `rounded-lg` would be 12px and wrong), `text-sm`
 * (14px), `font-medium`, `whitespace-nowrap`, `gap-2`, and `px-4 py-2`. Three
 * values override the variant:
 *
 * - `bg-lime-300` — the design's lime-300 (`#C7F464`, `--lime`), replacing the
 *   variant's `bg-primary`. The label keeps `text-primary-foreground`
 *   (`#131417`), the site's near-black on a light fill.
 * - `hover:bg-lime-hover` — the fill darkens on hover to `--lime-hover`
 *   (`#A9CF55`): owner instruction 2026-10-08, "update the hover color with a
 *   darker shade for the existing button color". Without a hover pin the
 *   variant's `hover:bg-primary/90` would shift the lime toward the page
 *   background; the darker shade is the requested feedback instead. The label
 *   pairing is gated in `verify-contrast.mjs` (10.34:1).
 * - `h-auto` and `leading-cta` — the variant pins `h-9` (36px) but the label's
 *   authored `1.45` line height needs the snippet's content height of 36.3px.
 *
 * The class list is pinned by `HireMeButton.test.tsx` (see the tailwind-merge
 * note there about `text-cta`, which must not reappear).
 *
 * The snippet's `px-4` is likewise *not* bound to `--space-cluster-gap`
 * (16px, same value). That token means the gap between cluster *items*; the
 * button's inset padding is a different thing that happens to measure the same,
 * and binding them would make one silently change the other.
 *
 * `onNavigate` exists for the small-screen panel, which has to close itself when
 * the CTA is followed. It is the same escape hatch `SmartLink` exposes, and it
 * is passed to the anchor directly rather than to a wrapping element: a
 * non-interactive parent carrying the click handler would swallow the control's
 * semantics and leave a `<span>` as the thing that closes the menu.
 */
export function HireMeButton({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Button
      asChild
      className={`h-auto leading-cta bg-lime-300 hover:bg-lime-hover ${className ?? ""}`}
    >
      <a href={siteUrl("/#contact")} onClick={onNavigate}>
        {ctaLabel}
      </a>
    </Button>
  );
}