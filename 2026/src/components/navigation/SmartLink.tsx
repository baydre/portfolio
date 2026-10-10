import { Link } from "react-router";
import type { NavItem } from "../../content/types";

/**
 * Renders a `NavItem` as a router `<Link>`.
 *
 * `NavItem` is a discriminated union (`kind: "route" | "anchor"`) because the
 * two kinds navigate differently and the active-state test in `NavBar` depends
 * on which one an item is — a route is current when its path matches, a section
 * anchor only while its fragment is showing.
 *
 * Both kinds render the router's `<Link>` here, deliberately:
 *
 * - A route link needs client-side navigation, which is what `<Link>` does.
 * - A section anchor (`/#work`) needs the hash in `useLocation()` too. Rendering
 *   it as a bare `<a>` scrolls natively but the router never sees the hash, so
 *   the selected section never highlights. A previous revision used a native
 *   anchor for that reason ("scrolls before hydration"); the router's `<Link>`
 *   is still an `<a href>` in the DOM, so a hard click without JS is a normal
 *   full-page fragment navigation and works exactly as well, and the scroll is
 *   managed centrally by the layout's scroll manager — which also lands the
 *   target clear of the sticky header (`scroll-mt-header`) and resets the scroll
 *   between pages.
 *
 * This component is the single place both kinds are routed; the header, the
 * footer (whose `footerNavItems` are all anchors) and the small-screen panel
 * all use it.
 */
export function SmartLink({
  item,
  className,
  children,
  onNavigate,
  "aria-current": ariaCurrent,
}: {
  item: NavItem;
  className?: string;
  children?: React.ReactNode;
  /** Called after navigation, so a disclosure can close itself. */
  onNavigate?: () => void;
  /**
   * Passed through explicitly. Spreading arbitrary props onto a `<Link>` would
   * work, but naming it keeps the public surface honest — the attribute is a
   * real requirement of the nav (WCAG 1.4.1 / 4.1.2), not an incidental extra.
   */
  "aria-current"?: React.AriaAttributes["aria-current"];
}) {
  return (
    <Link
      to={item.to}
      className={className}
      onClick={onNavigate}
      aria-current={ariaCurrent}
    >
      {children ?? item.label}
    </Link>
  );
}