import { useLocation } from "react-router";
import { navItems, socialLinks } from "../../content/profile";
import { SocialLinks } from "../common/SocialLinks";
import { ClusterDivider } from "./ClusterDivider";
import { HireMeButton } from "./HireMeButton";
import { SmartLink } from "./SmartLink";

/**
 * The navigation bar row, matching the Figma `NavBar` component.
 *
 * AUTHORITATIVE geometry from the HomePage snippet:
 * `padding: 22px 84px`, `space-between`, `align-items: center`, a 12px gap
 * between nav items, and a 16px gap in the right cluster (social tiles, then
 * the filled "Hire me" button).
 *
 * Its height is 22 + 40 + 22 = 84px, and that is not incidental: the hero
 * derives its 56px clearance from it. The 40px comes from
 * `--spacing-nav-pad` (8px) twice plus `--leading-nav` (24px), so the nav item
 * height is deterministic. Removing the explicit line-height and falling back to
 * `normal` would move the header and break the hero's alignment with it.
 *
 * `min-h-header` pins that relationship from this side: the row can never render
 * shorter than `--header-height`, which is the same value `--hero-top-pad`
 * subtracts. Should the row ever grow taller the authored 140px offset is no
 * longer meaningful anyway, so it is allowed to.
 *
 * The right cluster — socials, the gradient rule, then the CTA — is the
 * snippet's `SocialsAndHireButton` fragment: a `flex items-center gap-4` row
 * with a `w-fit` group of three 40px tiles, then the rule, then the button. Its
 * `min-w-screen min-h-screen absolute left-[1087px] top-[22px]` wrapper is
 * Figma canvas placement for the extracted fragment, not layout, and is
 * discarded; `justify-between` on this row already puts the cluster flush right
 * at 84px.
 *
 * This component is the visual row only. The `<header>` landmark, the sticky
 * behaviour and the small-screen disclosure belong to `SiteHeader`, which
 * composes this.
 */
export function NavBar({ className }: { className?: string }) {
  const { pathname, hash } = useLocation();

  return (
    <div
      className={`container-site flex min-h-header items-center justify-between py-header-pad ${
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
                : pathname === "/" && hash === item.to.split("#")[1];

            return (
              <li key={item.to}>
                <SmartLink
                  item={item}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-sm p-nav-pad text-nav leading-nav transition-colors ${
                    active
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-cluster-gap">
        <SocialLinks links={socialLinks} />
        <ClusterDivider />
        <HireMeButton />
      </div>
    </div>
  );
}
