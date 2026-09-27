import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { projects } from "../../../content/projects";
import { ProjectCarousel } from "../ProjectCarousel";

/**
 * The Work slider: every project, taking turns.
 *
 * Most of this file exists to hold the accessibility claims in
 * `ProjectCarousel`'s own comment to account. A carousel is the one component
 * in this codebase that can be *correct* in its markup and still be a wall of
 * motion for someone who did not ask for it, so the tests assert the absence of
 * harm as directly as they assert the presence of the rotation: no `aria-live`,
 * no off-screen card in the tab order, nothing moving under reduced motion, and a
 * stop control that is always there.
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
    // Only the first is on screen. The other four carry `hidden`, which removes
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
      const className = li.className ?? "";
      expect(className).not.toMatch(/\b(flex|grid|block|contents)\b/);
    }
  });

  it("offers a stop control, because autoplay needs one (WCAG 2.2.2)", () => {
    // Pause/Stop/Hide: content that updates automatically and runs for more than
    // five seconds must be pausable. The control is asserted by its role and
    // accessible name, and it is present while rotating — not only once paused.
    renderCarousel();
    const pause = screen.getByRole("button", {
      name: "Pause automatic rotation",
    });
    expect(pause).toBeInTheDocument();
    expect(pause).toHaveAttribute("type", "button");

    fireEvent.click(pause);
    expect(
      screen.getByRole("button", { name: "Resume automatic rotation" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Resume automatic rotation" }),
    );
    expect(
      screen.getByRole("button", { name: "Pause automatic rotation" }),
    ).toBeInTheDocument();
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
    // end with only a "previous" that works.
    advance(6000);
    expect(visibleIndex(container)).toBe(0);
  });

  it("does not advance while paused", () => {
    const { container } = renderCarousel();
    fireEvent.click(
      screen.getByRole("button", { name: "Pause automatic rotation" }),
    );

    advance(6000 * 3);
    expect(visibleIndex(container)).toBe(0);
  });

  it("does not advance under prefers-reduced-motion, from the first frame", () => {
    // Set before render: the hook reads the query synchronously on first render
    // specifically so a reduced-motion visitor never sees one step of rotation
    // before the correction lands. If the hook regressed to an effect-only read,
    // this test would still pass on the later frames but the first advance
    // would not be covered — hence asserting the position immediately.
    stubReducedMotion(true);
    const { container } = renderCarousel();

    expect(visibleIndex(container)).toBe(0);
    advance(6000 * 5);
    expect(visibleIndex(container)).toBe(0);
  });

  it("still advances when a reduced-motion visitor asks for it explicitly", () => {
    // Reduced motion suppresses autoplay; it does not remove the control. A
    // visitor who has deliberately pressed Resume has asked for the motion.
    stubReducedMotion(true);
    const { container } = renderCarousel();
    fireEvent.click(
      screen.getByRole("button", { name: "Resume automatic rotation" }),
    );

    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("stops while the pointer is over it, and resumes on leave", () => {
    // Reading a card while it slides out from under you is the failure this
    // prevents, so a hover pause is part of the feature rather than a nicety.
    const { container } = renderCarousel();
    const region = screen.getByRole("region", { name: "More work" });

    fireEvent.mouseEnter(region);
    advance(6000 * 2);
    expect(visibleIndex(container)).toBe(0);

    fireEvent.mouseLeave(region);
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("stops while focus is inside, and resumes when focus leaves", () => {
    // Same reasoning as hover, for a keyboard visitor reading a card. Moving
    // focus BETWEEN controls must not resume it — only leaving the region.
    const { container } = renderCarousel();
    const region = screen.getByRole("region", { name: "More work" });
    const next = screen.getByRole("button", { name: "Next project" });

    fireEvent.focus(next);
    advance(6000 * 2);
    expect(visibleIndex(container)).toBe(0);

    // Between two controls inside the region: still paused.
    fireEvent.blur(next, { relatedTarget: region });
    advance(6000);
    expect(visibleIndex(container)).toBe(0);

    // Out of the region entirely: resumes.
    fireEvent.blur(region, { relatedTarget: document.body });
    advance(6000);
    expect(visibleIndex(container)).toBe(1);
  });

  it("steps manually and wraps in both directions", () => {
    const { container } = renderCarousel();
    const next = screen.getByRole("button", { name: "Next project" });
    const prev = screen.getByRole("button", { name: "Previous project" });

    fireEvent.click(prev);
    expect(visibleIndex(container)).toBe(slider.length - 1);

    fireEvent.click(next);
    expect(visibleIndex(container)).toBe(0);
  });

  it("restarts the full 6s after a manual step", () => {
    // Without this, pressing "next" just before a scheduled advance skips the
    // slide the visitor asked for, because the old timer fires immediately.
    const { container } = renderCarousel();
    advance(5000);
    fireEvent.click(screen.getByRole("button", { name: "Next project" }));
    expect(visibleIndex(container)).toBe(1);

    // 1.1s of the new turn — the old timer would have fired by now.
    advance(1100);
    expect(visibleIndex(container)).toBe(1);
    advance(4900);
    expect(visibleIndex(container)).toBe(2);
  });

  it("names every project in the dot row, and marks the current one", () => {
    // The only place all five are named at once, so every project is
    // discoverable without waiting for its turn — the mitigation for having no
    // aria-live announcements.
    renderCarousel();
    for (const project of slider) {
      expect(
        screen.getByRole("button", { name: `Show ${project.title}` }),
      ).toBeInTheDocument();
    }
    const first = screen.getByRole("button", {
      name: `Show ${slider[0].title}`,
    });
    expect(first).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: `Show ${slider[1].title}` }),
    ).not.toHaveAttribute("aria-current");
  });

  it("jumps straight to a project from its dot", () => {
    const { container } = renderCarousel();
    fireEvent.click(
      screen.getByRole("button", { name: `Show ${slider[3].title}` }),
    );
    expect(visibleIndex(container)).toBe(3);
  });

  it("has no aria-live region, so rotation cannot interrupt a screen reader", () => {
    // A polite live region behind a 6s timer interrupts whatever is being read,
    // every 6s, forever. The design decision is to say nothing and rely on the
    // dot labels instead.
    const { container } = renderCarousel();
    // Asserted as "no ANNOUNCING live region" rather than "no aria-live
    // attribute": the counter below carries `aria-live="off"` deliberately, to
    // state that it is presentational rather than leaving that to be inferred.
    // An element that announces is the thing that must not exist.
    const announcing = Array.from(container.querySelectorAll("[aria-live]")).filter(
      (el) => el.getAttribute("aria-live") !== "off",
    );
    expect(announcing).toHaveLength(0);

    const counter = screen.getByText(`1 / ${slider.length}`);
    expect(counter).toHaveAttribute("aria-live", "off");
  });

  it("numbers the whole slider `01`–`06` with no featured card", () => {
    // The earlier build pinned IdCardify at `01` and numbered the carousel from
    // `02`, via a `startIndex` prop that existed only to continue that offset.
    // One slider has no offset to continue, so the prop is gone and the labels
    // must run straight from the top of the list. This is the test that would
    // catch the split quietly returning.
    const { container } = renderCarousel();
    expect(slider).toHaveLength(6);
    const indices = slides(container).map((li) =>
      li.querySelector(".text-card-index")?.textContent,
    );
    expect(indices).toEqual(
      slider.map((_, i) => String(i + 1).padStart(2, "0")),
    );
    expect(indices[0]).toBe("01");
  });

  it("labels itself a carousel for assistive tech", () => {
    renderCarousel();
    const region = screen.getByRole("region", { name: "More work" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    // Named by a real heading rather than a bare `aria-label`, so the region has
    // a heading in the document outline. Scoped to the region's OWN heading: each
    // project title is also an `h3`, so an unscoped `getByRole("heading")` finds
    // six of them.
    expect(
      within(region).getByRole("heading", { name: "More work" }),
    ).toBeInTheDocument();
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
