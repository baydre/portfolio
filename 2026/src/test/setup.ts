import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

/*
 * This project runs Vitest with `globals: false` (tests import `describe`,
 * `it`, `expect` explicitly). Testing Library only auto-registers its
 * cleanup hook when a global `afterEach` exists, so unmount between tests
 * explicitly here. Without this, renders accumulate within a file and
 * role-based queries match multiple elements.
 */
afterEach(cleanup);

/*
 * jsdom implements neither `matchMedia` nor the `change` event on
 * `MediaQueryList`, so any component reading a media query throws on mount. Both
 * `useIsMobile` and `usePrefersReducedMotion` call it inside an effect, so this
 * is a missing browser API rather than a component defect.
 *
 * The stub is deliberately controllable: `prefersReducedMotion.matches` is
 * mutated by the carousel's own tests, and reset to `false` before each test so
 * one test's reduced-motion state cannot leak into the next — a leak that would
 * silently disable autoplay and make those assertions pass for the wrong reason.
 */
let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
  window.matchMedia = (query: string): MediaQueryList => {
    const list = {
      media: query,
      // Only the reduced-motion query is meaningful here; every other query
      // reports "no match", which is the safe default for a viewport-agnostic
      // test run.
      get matches() {
        return query.includes("prefers-reduced-motion") ? reducedMotion : false;
      },
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
    return list as unknown as MediaQueryList;
  };
});

/** Set the stubbed `prefers-reduced-motion` result for the current test. */
export function setPrefersReducedMotion(value: boolean) {
  reducedMotion = value;
}
