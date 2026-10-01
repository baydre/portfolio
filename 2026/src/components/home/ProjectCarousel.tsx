import * as React from "react";

import type { Project } from "../../content/types";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { ProjectCard } from "./ProjectCard";

/**
 * The Work section: one slider, all six projects taking turns on a 6s interval.
 *
 * Owner request, then two corrections, all 2026-09-27. The first build pinned
 * IdCardify above a carousel of the other five. The second removed the
 * Pause/Resume button and the previous/next arrows: if it is automatic, nobody
 * should have to click anything to see the work. The third removed the `1 / 6`
 * counter and the dot row, so there is now no visible chrome of any kind.
 *
 * ## Why this exists at all
 *
 * `docs/INTERACTION_SPEC.md` §4.3 argued against exactly this. The design is a
 * static list of four identical cards, nothing in the HomePage snippet rotates
 * anything, and the recorded baseline was "a static responsive grid — a carousel
 * is a significant accessibility cost (focus trapping, autoplay, slide
 * announcements) and must not be added just because it is possible."
 *
 * The owner asked for it explicitly on 2026-09-27, which is the condition that
 * ledger row was waiting on. The rest of this comment is the bill.
 *
 * ## Pausing, and the two ways it used to latch
 *
 * WCAG 2.2.2 requires a mechanism to pause auto-updating content. Three are
 * present, none of them a visible control:
 *
 *   1. **Pointer hover**, for a cursor.
 *   2. **Focus**, for a keyboard — so the mechanism is not hover-only.
 *   3. **Press and hold**, because a phone has no cursor. Pressing stops the
 *      rotation; releasing starts a full 6s turn of grace, because nobody reads
 *      with a finger still on the glass.
 *
 * The first two versions of this latched, and both failed the same way: an
 * engaged flag went true and nothing ever cleared it, so the carousel stopped
 * permanently for that visitor. Worth recording, because the symptom was "it
 * pauses when I hover, then never starts again" and neither cause is obvious
 * from that sentence.
 *
 * **A release has to be listened for on the window, not the element.** Reading
 * `onPointerUp` on the container only fires if the pointer is released over the
 * container. Press on the card to read it, slide off while still holding, release
 * outside — the event never arrives, `pressing` stays true, and the carousel is
 * dead until the page is reloaded. Pressing and sliding off to read is not an
 * exotic gesture; it is how everyone reads a long card. The press is now ended by
 * a window-level listener, so wherever the pointer ends up, it ends.
 *
 * **Hover is read from pointer events, not mouse events, and touch is excluded.**
 * On a phone, tapping fires a synthesised `mouseover`/`mouseenter` and then no
 * `mouseout`, because a finger does not "leave". React's `onMouseEnter` cannot
 * tell that apart from a real cursor arriving, so the first version set
 * `hovered = true` on the tap and nothing ever unset it — autoplay was dead on
 * mobile after the first touch, which is the opposite of what this section is for.
 * Pointer events carry `pointerType`, so hover-pause now only engages for `mouse`
 * and `pen`, and touch relies on press-and-hold instead.
 *
 * Recorded honestly: these are gestures, not a labelled control. A visitor has to
 * discover that hovering works, and a screen-reader user has to reach the slider
 * with a pointer to try one. That is a weaker reading of 2.2.2 than a visible
 * control, it is the owner's call, and this comment is the record of it.
 *
 * ## Why reduced motion renders a plain list
 *
 * With the dot row gone, suppressing autoplay would have been actively harmful:
 * a reduced-motion visitor would see exactly one project out of six, with no
 * motion and no way to reach the rest. So `prefers-reduced-motion: reduce` does
 * not produce a frozen one-slide carousel — it renders every project stacked, no
 * timer, no fade, nothing hidden. That is also the design's original shape, so
 * the fallback is the thing the design actually drew.
 *
 * ## Other costs, paid
 *
 * **Motion the visitor did not ask for.** No autoplay, no fade, no hidden slides
 * under reduced motion — the static branch above covers all three.
 *
 * **Focus trapping.** None, in the rotating branch: only the slide on screen is
 * exposed, the rest carry `hidden`, which removes them from the accessibility tree
 * and the tab order. Note the corollary — `hidden` is doing the work, so the `<li>`
 * must never be given a `display` utility, or `display: flex` would win over the
 * UA's `[hidden] { display: none }` and every card would become visible and
 * focusable again.
 *
 * **Slide announcements.** No `aria-live`. A polite live region behind a 6s timer
 * interrupts a screen reader every 6 seconds, forever. With the dot row gone there
 * is nothing to announce to and nothing announcing.
 *
 * **Rotation stealing focus or reading order.** It does not. The interval only
 * changes which slide is visible; the list stays in document order.
 */
const INTERVAL_MS = 6000;

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const count = projects.length;
  const [active, setActive] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [within, setWithin] = React.useState(false);
  const [pressing, setPressing] = React.useState(false);
  const reduced = usePrefersReducedMotion();
  const labelId = React.useId();

  const releaseTimer = React.useRef<number | null>(null);

  const clearRelease = React.useCallback(() => {
    if (releaseTimer.current !== null) {
      window.clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  }, []);

  // Release means "start the grace timer", not "resume now" — see the file
  // comment. Idempotent, so a pointerup and a pointercancel both firing is fine.
  const endPress = React.useCallback(() => {
    clearRelease();
    releaseTimer.current = window.setTimeout(() => {
      releaseTimer.current = null;
      setPressing(false);
    }, INTERVAL_MS);
  }, [clearRelease]);

  // The fix for the latch: while a press is live, its end is watched on the
  // window, so a release anywhere on the page terminates it. Subscribing only
  // while `pressing` is true also means no listener is left behind afterwards.
  React.useEffect(() => {
    if (!pressing) return;
    const end = () => endPress();
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [pressing, endPress]);

  // Never leave a timer running past unmount.
  React.useEffect(() => clearRelease, [clearRelease]);

  const running = !reduced && !hovered && !within && !pressing;

  React.useEffect(() => {
    if (!running || count < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [running, count]);

  // After every hook, deliberately: an early return above these would change the
  // hook count when `count` went 0 -> non-zero, or when the OS motion preference
  // flipped mid-session, which React cannot reconcile.
  if (count === 0) return null;

  if (reduced) {
    // The static fallback. No `hidden`, no timer, no fade — everything is simply
    // present, which is the only way the content stays reachable once the manual
    // controls are gone.
    return (
      <div aria-labelledby={labelId} role="region">
        <h3 className="sr-only" id={labelId}>
          More work
        </h3>
        <ol className="mt-16 flex flex-col gap-16">
          {projects.map((project, i) => (
            <li key={project.id}>
              <ProjectCard project={project} index={i} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div
      aria-labelledby={labelId}
      aria-roledescription="carousel"
      role="region"
      onBlurCapture={(event) => {
        // `relatedTarget` is null when focus leaves the region entirely, which
        // is the only case that should resume rotation — moving between things
        // inside it must not restart the timer under the visitor.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setWithin(false);
        }
      }}
      onFocusCapture={() => setWithin(true)}
      // Pointer events, not mouse events, and touch excluded: see the file
      // comment. `pointerType` is the only thing that distinguishes a tap from a
      // cursor arriving, and getting it wrong silently killed autoplay on mobile.
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") setHovered(false);
      }}
      onPointerDown={() => {
        clearRelease();
        setPressing(true);
      }}
    >
      <h3 className="sr-only" id={labelId}>
        More work
      </h3>

      <ol className="mt-16 flex flex-col gap-16">
        {projects.map((project, i) => {
          const isActive = i === active;
          return (
            <li
              key={project.id}
              hidden={!isActive}
              className={
                isActive
                  ? "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
                  : undefined
              }
            >
              <ProjectCard project={project} index={i} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
