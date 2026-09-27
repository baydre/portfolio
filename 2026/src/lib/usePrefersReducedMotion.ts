import * as React from "react";

/**
 * Whether the visitor has asked for reduced motion at the OS level.
 *
 * Follows the `useIsMobile` pattern — a `matchMedia` query that re-reads on
 * change rather than once on mount, so a visitor who turns the setting on
 * mid-session is obeyed immediately.
 *
 * Two differences from that hook, both deliberate:
 *
 * 1. **The initial value is read synchronously**, not in an effect. The media
 *    query is available on the very first render in this client-only SPA, so
 *    reading it there means the first paint already knows. `useIsMobile` sets up
 *    in an effect and therefore reports "not mobile" for one frame, which is
 *    harmless for a layout switch and NOT harmless for motion: it would let an
 *    auto-advancing carousel take a step against the visitor's wishes before the
 *    effect caught up. Defaulting to the real value avoids a single frame of
 *    unrequested animation.
 *
 * 2. **The `undefined`-then-resolve dance is dropped.** There is no value to
 *    report while the query is unknown, so the type is a plain boolean.
 *
 * No component may animate on its own without consulting this. `ProjectCarousel`
 * is the first consumer; the rule is in `docs/INTERACTION_SPEC.md` as a done
 * decision ("Anything animated | Honours `prefers-reduced-motion`").
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function read(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(read);

  React.useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    // Re-read on subscribe: the setting can flip between first render and this
    // effect running, and the effect is the later word.
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
