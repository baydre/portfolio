import { Pause, Play } from "lucide-react";
import * as React from "react";

import { Button } from "../../app/components/ui/button";
import type { Project } from "../../content/types";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";
import { ProjectCard } from "./ProjectCard";

/**
 * The Work section: one slider, all six projects taking turns on a 6s
 * interval.
 *
 * Owner request, then correction, both 2026-09-27. The first build pinned
 * IdCardify above a carousel of the other five. That is gone — this component
 * now receives the whole list, so the section reads as six projects rather
 * than one flagship with five supporting acts.
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
 * ledger row was waiting on. So the cost is paid deliberately rather than
 * accidentally, and the rest of this comment is the bill.
 *
 * ## What the accessibility cost actually is, and what is done about it
 *
 * **Autoplay with no stop control — WCAG 2.2.2 Pause, Stop, Hide.** The
 * rotation auto-advances every 6s, so it is "auto-updating information presented
 * in parallel with other content" and needs a mechanism to pause it. That is the
 * Pause/Resume button, always rendered, never collapsed into a hover-only
 * affordance. The section below is the projected card; a visitor who never sees
 * the carousel animate still reaches every project.
 *
 * **Motion the visitor did not ask for.** Auto-advance is suppressed entirely
 * under `prefers-reduced-motion: reduce` — not slowed, not shortened,
 * suppressed. The fade is gated on `motion-safe:` so it does not run either. The
 * visitor keeps the manual controls, so the content stays fully reachable
 * without any motion at all.
 *
 * **Focus trapping.** None. Only the slide on screen is exposed; the rest carry
 * the `hidden` attribute, which removes them from the accessibility tree and
 * from the tab order entirely. Tabbing walks the controls and then out of the
 * region, and never lands on an off-screen card. Note the corollary: the `hidden`
 * attribute is doing the work here, so the `<li>` must never be given a
 * `display` utility, or `display: flex` would win over the UA's
 * `[hidden] { display: none }` and the off-screen cards would become visible
 * and focusable again. `visibleClassName` exists to keep that rule in one place.
 *
 * **Slide announcements.** No `aria-live` region. An auto-advancing carousel
 * behind a polite live region interrupts a screen reader every 6 seconds, which
 * is the "slide announcements" cost the spec named, and it is worse than saying
 * nothing. Instead every project stays reachable and identifiable without
 * waiting for a rotation: each dot's accessible name is the project's own title,
 * so all five are discoverable from the control row, and the visible card is a
 * normal document region.
 *
 * **Rotation stealing focus or reading order.** It does not. The interval only
 * ever changes which slide is visible; focus is untouched, and the slide list is
 * in document order, so the reading order does not reshuffle under a screen
 * reader mid-sentence.
 *
 * **Pause on engagement.** Hovering the region or moving focus into it stops
 * the rotation for as long as the pointer or focus is there. Reading a card
 * while it slides out from under you is the failure this prevents, and it is
 * why rotation is expressed as `engaged` state rather than as a bare interval.
 *
 * ## The timer
 *
 * One `setInterval` on a single state update, in an effect that returns its own
 * cleanup, keyed on whether rotation is currently running. `tick` is a nonce in
 * the dependency list: manual navigation bumps it so the next advance is a full
 * 6s away rather than whatever remained of the previous slide's turn. Without it,
 * pressing "next" a moment before a scheduled advance skips the slide you just
 * asked for.
 */
const INTERVAL_MS = 6000;

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const count = projects.length;
  const [active, setActive] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [within, setWithin] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  const reduced = usePrefersReducedMotion();

  // Autoplay starts ON unless the visitor has already asked for reduced motion —
  // read on the FIRST render (see the hook) so there is no frame in which the
  // carousel takes a step the visitor did not consent to. And because `reduced`
  // is a live subscription rather than a snapshot, turning the OS setting on
  // mid-session stops the rotation immediately.
  //
  // Note what reduced motion does NOT do: it does not make the control inert. A
  // visitor who has deliberately pressed Resume has asked for the motion, so
  // `running` depends on the visitor's own `autoplay` choice and not on a frozen
  // "motion was disallowed at mount" flag — which would have left the button
  // looking functional while doing nothing, the worst of both.
  const [autoplay, setAutoplay] = React.useState(() => !reduced);
  React.useEffect(() => {
    if (reduced) setAutoplay(false);
  }, [reduced]);

  const running = autoplay && !hovered && !within;

  // Wrap rather than clamp, and modulo the live count so it survives the array
  // changing length. A clamp would strand the visitor on the last slide with
  // only a "previous" that works.
  const step = React.useCallback(
    (delta: number) => {
      setActive((current) => (current + delta + count) % count);
      setTick((n) => n + 1);
    },
    [count],
  );

  React.useEffect(() => {
    if (!running || count < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [running, count, tick]);

  const labelId = React.useId();

  // After every hook, deliberately: an early return above `useId` would change
  // the hook count when `count` went 0 -> non-zero, which React cannot reconcile.
  if (count === 0) return null;

  return (
    <div
      aria-labelledby={labelId}
      aria-roledescription="carousel"
      role="region"
      onBlurCapture={(event) => {
        // `relatedTarget` is null when focus leaves the region entirely, which
        // is the only case that should resume rotation — moving between controls
        // inside it must not restart the timer under the visitor.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setWithin(false);
        }
      }}
      onFocusCapture={() => setWithin(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
              // See the file comment: `hidden` is what keeps the off-screen
              // cards out of the a11y tree and the tab order, and it only works
              // while this element carries no `display` utility.
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

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          aria-label={
            running ? "Pause automatic rotation" : "Resume automatic rotation"
          }
          onClick={() => setAutoplay((on) => !on)}
          size="icon"
          type="button"
          variant="outline"
        >
          {running ? (
            <Pause aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          )}
        </Button>

        <Button
          aria-label="Previous project"
          onClick={() => step(-1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <span aria-hidden="true">←</span>
        </Button>

        <Button
          aria-label="Next project"
          onClick={() => step(1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <span aria-hidden="true">→</span>
        </Button>

        <p aria-live="off" className="text-sm text-muted-foreground">
          {active + 1} / {count}
        </p>

        <ul className="flex flex-wrap items-center gap-2">
          {projects.map((project, i) => (
            <li key={project.id}>
              <Button
                // The title, not the position, is what makes every project
                // discoverable without waiting for its turn — the dot row is the
                // only place all five are named at once.
                aria-label={`Show ${project.title}`}
                aria-current={i === active ? "true" : undefined}
                className="size-3 rounded-full p-0"
                onClick={() => {
                  setActive(i);
                  setTick((n) => n + 1);
                }}
                size="icon"
                type="button"
                variant="outline"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
