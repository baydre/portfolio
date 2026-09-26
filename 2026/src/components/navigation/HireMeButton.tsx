import { Button } from "../../app/components/ui/button";
import { hireMeLabel } from "../../content/profile";

/**
 * The "Hire me" call to action: the filled button at the end of the nav's right
 * cluster.
 *
 * Authored from the NavBar snippet's `SocialsAndHireButton` fragment:
 * `py-2 px-4 rounded-lg bg-[#E9E9EC]` wrapping a `text-[#131417] font-jura
 * text-sm font-medium leading-[1.45em]` label.
 *
 * The snippet nests that label inside a `<div>` (the fill) inside a `<button>`.
 * Both layers collapse here into one element, and it is an `<a>` rather than a
 * `<button>`: the action is navigation to the contact section, so a button would
 * misrepresent it to assistive technology (WCAG 2.2 AA 4.1.2). `asChild` puts
 * the button's styling on the anchor, so the result is one `<a>`, not a button
 * nested in a link.
 *
 * Everything else comes from the shadcn `default` variant and its `default`
 * size, which already match the snippet: `rounded-md` (8px here — `theme.css`
 * remaps the radius scale, so `rounded-lg` would be 12px and wrong), `text-sm`
 * (14px), `font-medium`, `whitespace-nowrap`, `gap-2`, and `px-4 py-2`. Only two
 * values override the variant:
 *
 * - `h-auto` — the variant pins `h-9` (36px) but the snippet's label is
 *   `14px × 1.45 = 20.3px` on `py-2`, i.e. 36.3px. A fixed height clips.
 * - `leading-cta` — the authored `1.45` line height, as a token.
 *
 * The size is deliberately taken from the variant's `text-sm` and **not** from
 * the `--text-cta` token, even though `--text-cta` is also 0.875rem. Passing
 * `text-cta` here broke the button: tailwind-merge cannot tell a custom
 * `--text-*` font-size token from a `text-*` colour utility, so it resolves
 * `text-cta` against *both* groups and — being last — dropped the variant's
 * `text-primary-foreground` along with the earlier `text-sm`. The button was
 * left with no colour of its own and inherited `--foreground` (#e9e9ec) on a
 * `--primary` (#e9e9ec) fill: the label rendered invisible while every
 * assertion about it still passed. `HireMeButton.test.tsx` now pins the class
 * list so that cannot recur.
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
    <Button asChild className={`h-auto leading-cta ${className ?? ""}`}>
      <a href="/#contact" onClick={onNavigate}>
        {hireMeLabel}
      </a>
    </Button>
  );
}
