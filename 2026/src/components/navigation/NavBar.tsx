import { useLocation } from "react-router";
import { navItems, socialLinks } from "../../content/profile";
import { BrandLogo } from "../common/BrandLogo";
import { SocialLinks } from "../common/SocialLinks";
import { ClusterDivider } from "./ClusterDivider";
import { HireMeButton } from "./HireMeButton";
import { SmartLink } from "./SmartLink";

/**
 * The navigation bar row, matching the Figma `NavBar` component as resupplied
 * 2026-10-08.
 *
 * AUTHORITATIVE geometry from that snippet: `py-5` (20px block padding), a left
 * nav with a 12px gap, a `gap-40` (160px at 1440) to the 121 × 64 logo mark,
 * then a right cluster — three social tiles, the rule, then the filled "Let's
 * Build" button — with a 16px gap. The snippet's root is a fixed `w-[1440px]
 * px-20` frame; those are canvas placement, and the horizontal edge stays on
 * `container-site` (84px at 1440) so the header and the hero keep one content
 * column. The design's `px-20` is 80px and would desynchronise the two by 4px.
 *
 * The `gap-40` is `--space-nav-mark-gap`, a `clamp()` that resolves to the
 * authored 160px at 1440 and shrinks to 16px at 1024, because a fixed 160px
 * cannot fit the nav + logo + cluster inside a 1024px viewport. Laying
 * the row with the cluster as `flex-1 justify-end` rather than `justify-between`
 * is what lets the spare space grow the cluster instead of the gap.
 *
 * Height: 20 (block padding ×2) + 64 (logo mark) = 104px, and `min-h-header`
 * pins `--header-height` to the same value the hero subtracts. The nav items
 * are 40px tall (8px padding ×2 + 24px line) and centre in that 104px.
 *
 * Active style: `text-lime-300` (`--lime`, the design's lime-300 / #C7F464) at
 * `font-semibold`. The semi-bold weight is the WCAG 1.4.1 non-colour cue — the
 * design marks the active item with exactly that weight plus the colour, and it
 * draws no underline (the snippet ships none). Inactive items are
 * `--foreground` (the design's gray-200), with the lime reserved for the hover
 * so the hover state stays distinct from the muted rest and announces the
 * accent.
 *
 * The right cluster — socials, the rule, then the CTA — is the snippet's
 * `SocialsAndHireButton` fragment: a `flex items-center gap-4` row with a group
 * of three 40px tiles, then the rule, then the button.
 *
 * This component is the visual row only. The `<header>` landmark, the sticky
 * behaviour and the small-screen disclosure belong to `SiteHeader`, which
 * composes this.
 */
export function NavBar({ className }: { className?: string }) {
  const { pathname, hash } = useLocation();

  return (
    <div
      className={`container-site flex min-h-header items-center gap-nav-mark-gap py-header-pad ${
        className ?? ""
      }`}
    >
      <nav aria-label="Primary">
        <ul className="flex items-center gap-nav-gap">
          {navItems.map((item) => {
            // A section anchor is only "current" while its fragment is showing,
            // which react-router's NavLink cannot express — it compares
            // pathnames. So the active test is derived from the location here and
            // `SmartLink` picks the element.
            const active =
              item.kind === "route"
                ? pathname === item.to
                : pathname === "/" && hash.slice(1) === item.to.split("#")[1];

            return (
              <li key={item.to}>
                <SmartLink
                  item={item}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-sm p-nav-pad text-nav leading-nav transition-colors ${
                    active
                      ? "font-semibold text-lime-300"
                      : "text-foreground hover:text-lime-300"
                  }`}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <BrandLogo className="h-nav-mark w-auto" />

      <div className="flex flex-1 items-center justify-end gap-cluster-gap">
        <SocialLinks links={socialLinks} />
        <ClusterDivider />
        <HireMeButton />
      </div>
    </div>
  );
}