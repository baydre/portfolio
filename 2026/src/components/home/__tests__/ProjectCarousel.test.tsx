import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { projects } from "../../../content/projects";
import { ProjectCarousel } from "../ProjectCarousel";

/**
 * The Work slider: every project, taking turns on a 6s interval, with no visible
 * controls at all.
 *
 * Most of this file exists to hold the accessibility claims in `ProjectCarousel`'s
 * own comment to account. A carousel is the one component in this codebase that
 * can be *correct* in its markup and still be a wall of motion for someone who
 * did not ask for it, so the tests assert the absence of harm as directly as they
 * assert the presence of the rotation: no `aria-live`, no off-screen card in the
 * tab order, nothing moving under reduced motion, and no engaged flag that can
 * latch and stop the carousel for good.
 *
 * On `hidden` and jsdom: jsdom does not implement the UA stylesheet's
 * `[hidden] { display: none }`, so Testing Library's visibility-aware role
 * queries still report off-screen slides. The `hidden` ATTRIBUTE is therefore
 * asserted directly. That is not a workaround — it is the more precise
 * assertion, since it pins the mechanism rather than a computed consequence of
 * it.
 */

/** All six. The section is ONE slider, so nothing sits outside it. */
const slider = projects;

/** Force the `prefers-reduced-motion` answer, before the component mounts. */
function stubReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    media: query,
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

const renderCarousel = () =>
  render(
    <MemoryRouter>
      <ProjectCarousel projects={slider} />
    </MemoryRouter>,
  );

/** The slide `<li>`s, in document order. */
const slides = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("ol > li"));

/** Index of the slide that is currently on screen. */
const visibleIndex = (container: HTMLElement) =>
  slides(container).findIndex((li) => !li.hasAttribute("hidden"));

const region = () => screen.getByRole("region", { name: "More work" });

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

beforeEach(() => {
  vi.useFakeTimers();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ProjectCarousel", () => {
  it("renders every project, one visible and the rest hidden", () => {
    const { container } = renderCarousel();
    const all = slides(container);

    expect(all).toHaveLength(slider.length);
    // Only the first is on screen. The other five carry `hidden`, which removes
    // them from the accessibility tree AND the tab order — the property that
    // keeps this from being a focus trap.
    expect(visibleIndex(container)).toBe(0);
    expect(all.filter((li) => !li.hasAttribute("hidden"))).toHaveLength(1);
    for (const li of all.slice(1)) {
      expect(li).toHaveAttribute("hidden");
    }
  });

  it("never puts a display utility on a slide, which would defeat `hidden`", () => {
    // The footgun the component comment warns about. `hidden` only works because
    // the UA sheet's `[hidden] { display: none }` is not overridden — and a
    // single `flex` or `grid` on the <li> would beat it, making every off-screen
    // card visible and focusable again. Cheap to assert, silent to regress.
    const { container } = renderCarousel();
    for (const li of slides(container)) {
      expect(li.className ?? "").not.toMatch(/\b(flex|grid|block|contents)\b/);
    }
  });

  it("has no controls at all", () => {
    // The Play/Pause button, the previous/next arrows, the `1 / 6` counter and
    // the dot row were all removed on the owner's instruction: the section is
    // automatic and the visitor should not have to click anything. Asserted as an
    // ABSENCE, which is the only way to stop a "helpful" control being re-added by
    // a later change that assumed the others were still there.
    renderCarousel();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByText(/^\d+\s*\/\s*\d+$/)).toBeNull();
  });

  it("advances every 6s, wrapping past the end", () => {
    const { container } = renderCarousel();
    const last = slider.length - 1;
    expect(visibleIndex(container)).toBe(0);

    advance(6000);
    expect(visibleIndex(container)).toBe(1);

    // On to the last slide. Counted from where we already are, not from the
    // start: one tick has elapsed, so `last - 1` more reaches the end.
    advance(6000 * (last - 1));
    expect(visibleIndex(container)).toBe(last);

    // And once more wraps to the first rather than stranding the visitor on the
    // end with no way forward.
    advance(6000);
    expect(visibleIndex(container)).toBe(0);
  });

  it("numbers the whole slider `01`–`06` with no featured card", () => {
    // An earlier build pinned IdCardify at `01` and numbered the rest from `02`.
    // One slider has no offset to continue, so this is the test that would catch
    // that split quietly returning.
    const { container } = renderCarousel();
    expect(slider).toHaveLength(6);
    const indices = slides(container).map((li) =>
      li.querySelector(".text-card-index")?.textContent,
    );
    expect(indices).toEqual(
      slider.map((_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  // ── the two latch bugs ───────────────────────────────────────────────────
  // Both failed the same way and for the same reason: an engaged flag went true
  // and nothing ever cleared it, so the carousel stopped permanently. The
  // reported symptom was "it pauses when I hover, then never starts again".

  it("resumes when the pointer is released OUTSIDE the carousel", () => {
    // Regression. `onPointerUp` on the container only fires if the pointer comes
    // up over the container. Press on a card to read it, slide off still
    // holding, release outside — the event never arrived, `pressing` stayed true,
    // and the carousel was dead until reload. This is how anyone reads a long
    // card, not an exotic gesture.
    const { container } = renderCarousel();
    fireEvent.pointerDown(region());
    fireEvent.pointerUp(document.body);

    // Two advances, not one `advance(12000)`. The grace timer expires INSIDE the
    // first advance, and its state change only reaches the effect that creates
    // the interval when `act` returns — by which point the clock has already
    // passed 12000, so a single combined advance misses that tick and looks like
    // the bug this test exists to catch. Separate advances mirror real elapsed
    // time: grace ends at 6s, first advance at 12s.
    advance(6000);
    expect(visibleIndex(container)).toBe(0);
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("keeps autoplaying for a touch pointer, which never gets hover-pause", () => {
    // Regression. A tap fires a synthesised mouseenter with no matching
    // mouseleave, because a finger does not "leave" — and React's onMouseEnter
    // cannot tell that from a real cursor. `hovered` latched true and autoplay
    // was dead on mobile after the first touch. Pointer events carry
    // `pointerType`, so touch must be excluded from hover-pause and rely on
    // press-and-hold instead.
    const { container } = renderCarousel();
    fireEvent.pointerEnter(region(), { pointerType: "touch" });

    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("does pause for a mouse pointer, and resumes when it leaves", () => {
    const { container } = renderCarousel();
    fireEvent.pointerEnter(region(), { pointerType: "mouse" });

    advance(6000 * 2);
    expect(visibleIndex(container)).toBe(0);

    fireEvent.pointerLeave(region(), { pointerType: "mouse" });
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  // ── the three pause mechanisms ───────────────────────────────────────────

  it("stops on press and holds a full turn after release", () => {
    // The touch path. Release does NOT resume immediately: the visitor gets a
    // whole 6s turn to finish reading, because nobody reads with a finger still
    // on the glass.
    const { container } = renderCarousel();
    fireEvent.pointerDown(region());
    advance(6000 * 2);
    expect(visibleIndex(container)).toBe(0);

    fireEvent.pointerUp(region());
    advance(5900);
    expect(visibleIndex(container)).toBe(0);

    // Grace expires and rotation resumes — but the interval is created at that
    // moment, so the new turn is a full 6s away rather than an instant advance.
    advance(200);
    expect(visibleIndex(container)).toBe(0);
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("releases the hold on a cancelled pointer, rather than sticking", () => {
    // `pointercancel` replaces `pointerup` when a system gesture takes over. Miss
    // it and a cancelled touch leaves `pressing` true forever, which is the same
    // permanent stall as the release-outside bug.
    const { container } = renderCarousel();
    fireEvent.pointerDown(region());
    fireEvent.pointerCancel(region());

    advance(6000); // grace expires, interval starts, not yet due
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("stops while focus is inside, and resumes only when focus leaves", () => {
    // A hover-only pause would leave a keyboard user with no mechanism at all.
    // Moving focus BETWEEN things inside must not resume it either.
    const { container } = renderCarousel();
    const link = within(region()).getAllByRole("link")[0];

    fireEvent.focus(link);
    advance(6000 * 2);
    expect(visibleIndex(container)).toBe(0);

    // Still inside the region: stays paused.
    fireEvent.blur(link, { relatedTarget: region() });
    advance(6000);
    expect(visibleIndex(container)).toBe(0);

    // Out of the region entirely: resumes.
    fireEvent.blur(region(), { relatedTarget: document.body });
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("adds and removes exactly one window listener pair per press", () => {
    // The window listeners exist only while a press is live. What actually goes
    // wrong if that is botched is accumulation — a stale listener firing
    // setState after every later pointerup on the page — so this counts adds and
    // removes rather than asserting on effect-cleanup timing, which is brittle
    // and proves less.
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const pointers = (spy: typeof add) =>
      spy.mock.calls.filter(([type]) => type.startsWith("pointer")).length;

    const { unmount } = renderCarousel();

    fireEvent.pointerDown(region());
    expect(pointers(add)).toBe(2); // pointerup + pointercancel
    expect(pointers(remove)).toBe(0);

    fireEvent.pointerUp(region());
    advance(6000); // grace expires; give the cleanup its own act to flush in
    advance(6000);
    expect(pointers(remove)).toBe(2);

    // A second press must add one more pair, not a second copy of the first.
    fireEvent.pointerDown(region());
    expect(pointers(add)).toBe(4);

    // Unmounting with a press outstanding must not strand the listeners.
    unmount();
    expect(pointers(add)).toBe(pointers(remove));
  });

  // ── reduced motion ───────────────────────────────────────────────────────

  it("renders every project as a plain static list under reduced motion", () => {
    // Not a frozen one-slide carousel. Once the manual controls are gone,
    // suppressing autoplay alone would show a reduced-motion visitor one project
    // out of six with no way to reach the rest. So the preference produces the
    // design's original shape: everything present, no timer, no fade, nothing
    // hidden.
    stubReducedMotion(true);
    const { container } = renderCarousel();

    expect(slides(container)).toHaveLength(slider.length);
    for (const li of slides(container)) {
      expect(li).not.toHaveAttribute("hidden");
      expect(li.className ?? "").not.toMatch(/animate|fade/);
    }
    for (const project of slider) {
      expect(container.textContent).toContain(project.title);
    }
  });

  it("does not advance at all under reduced motion", () => {
    stubReducedMotion(true);
    const { container } = renderCarousel();
    advance(6000 * 6);
    expect(visibleIndex(container)).toBe(0);
  });

  it("is not a carousel to a screen reader when it is a static list", () => {
    // `aria-roledescription="carousel"` on something that does not rotate is a
    // lie to assistive tech, so the static branch drops it.
    stubReducedMotion(true);
    renderCarousel();
    expect(region()).not.toHaveAttribute("aria-roledescription");
  });

  // ── structure ────────────────────────────────────────────────────────────

  it("has no announcing live region, so rotation cannot interrupt a reader", () => {
    // A polite live region behind a 6s timer interrupts whatever is being read,
    // every 6s, forever.
    const { container } = renderCarousel();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("labels itself a carousel for assistive tech", () => {
    renderCarousel();
    const el = region();
    expect(el).toHaveAttribute("aria-roledescription", "carousel");
    // Named by a real heading rather than a bare `aria-label`, so the region has a
    // heading in the document outline. Scoped to the region's OWN heading: each
    // project title is also an `h3`, so an unscoped query finds six of them.
    expect(within(el).getByRole("heading", { name: "More work" })).toBeInTheDocument();
  });

  it("renders nothing at all for an empty list, without throwing", () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectCarousel projects={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
