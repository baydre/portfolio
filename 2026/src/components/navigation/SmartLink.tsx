import { Link } from "react-router";
import type { NavItem } from "../../content/types";

/**
 * Renders a `NavItem` as the right kind of link.
 *
 * `NavItem` is a discriminated union (`kind: "route" | "anchor"`) precisely
 * because the two need different elements:
 *
 * - **route** → react-router `<Link>`, for client-side navigation between pages.
 * - **anchor** → a plain `<a href="/#work">`. Deliberately NOT a router `<Link>`:
 *   an in-page fragment should scroll natively, work before hydration, and be
 *   copyable and middle-clickable. Wrapping a fragment in the router would also
 *   make `/about` → `/#work` a client navigation that may not scroll, because the
 *   router does not re-run the browser's fragment handling.
 *
 * This is the single place that distinction is implemented; both the header and
 * the footer use it.
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
  /** Called after an in-page anchor resolves, so a disclosure can close itself. */
  onNavigate?: () => void;
  /**
   * Passed through explicitly. Spreading arbitrary props onto an element that is
   * sometimes `<a>` and sometimes the router's `<Link>` would work, but naming it
   * keeps the public surface honest — the attribute is a real requirement of the
   * nav (WCAG 1.4.1 / 4.1.2), not an incidental extra.
   */
  "aria-current"?: React.AriaAttributes["aria-current"];
}) {
  if (item.kind === "route") {
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

  return (
    <a href={item.to} className={className} onClick={onNavigate} aria-current={ariaCurrent}>
      {children ?? item.label}
    </a>
  );
}
