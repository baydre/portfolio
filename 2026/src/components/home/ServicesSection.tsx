import { services, servicesSectionDescription } from "../../content/services";
import { SectionIntro } from "../common/SectionIntro";
import { ServiceIcon } from "./ServiceIcon";

/**
 * The Services section of the homepage.
 *
 * Source: the HomePage snippet's Services frame — 1440 × 1962, `bg-neutral-900`.
 *
 * The frame is a 3 × 2 grid. The two rows are **not** one CSS grid: the design
 * puts a 1px `outline-gray-200` rule between them, separated by 48px from each
 * row, so the rows are two sibling flex rows with a rule between rather than two
 * grid rows. `ServicesRows` reproduces that.
 *
 * Card anatomy, in the design's order and with its own spacing:
 *
 *   01             24px Jura, `text-white`   — a sibling *above* the mark,
 *                                             not a label inside it
 *   mark           384 × 384 square, no border, no radius, `ServiceIcon`
 *   title          30px, `text-white`
 *   description    24px / 40px, `text-gray-200`
 *
 * with `p-4` on the card, `gap-8` between the card's parts, 32px between cards
 * and `border-r` on every card but the last in its row.
 *
 * The `01`–`//06` labels are content and are read as text. The frame prefixes
 * them `//`; those slashes are dropped on owner request (2026-09-26) — see
 * `content/services.ts`. The section-level `//02` index the frame also carries
 * is absent, also on owner request (2026-09-26).
 *
 * **The section description is 20px, not the frame's 24px.** Owner correction
2026-09-26: it matches the Work section description. Only that paragraph changes
— the heading stays 36px and the six card descriptions stay 24px, both as the
frame has them. This is why `descriptionSizeClassName` is passed at all.

`align="first-line"` puts the heading beside the *opening* line of the
 * description, as Work does. The default bottom-alignment was harmless while
 * this section had no description at all, but the frame's copy is two 24px/40px
 * lines, and bottom-aligning drops a 36px heading beside the *last* of them —
 * which reads as the header sitting too low. Work already asked for this.
 *
 * **The frame's per-card artwork is gone as of 2026-09-26, on owner request.**
 * Five of the six cards carried flat `gray-200` geometry transcribed from this
 * frame, and the sixth, `01` Web Design, carried *nothing* — it was a faint
 * 12%-opacity rect holding the slot open, which is a placeholder whatever it
 * is made of, and the other five read as placeholders too. Every card now renders
 * a real mark for its discipline via `ServiceIcon` (lucide, keyed by `title`).
 * The frame's `01` has no geometry to lose, so nothing about the grid changed
 * shape: the slot keeps its `aspect-square` so all six cards stay the height of
 * their row-mates and the two rows of titles stay flush.
 */
export function ServicesSection() {
  const [firstRow, secondRow] = [services.slice(0, 3), services.slice(3)];

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="container-site scroll-mt-header py-20"
    >
      {/*
        `pb-8` plus the intro's own `mt-8` is the frame's 64px (`gap-16`) between
        the heading row and the rule beneath it. The 64px below the rule is the
        `mt-16` on the grid. The frame's heading row is a fixed `h-24` (96px);
        that height is incidental to its two lines of copy, so the row is left
        content-sized rather than pinned.
      */}
      <SectionIntro
        title="Services"
        headingId="services-heading"
        titleSizeClassName="text-section-compact"
        // OWNER CORRECTION 2026-09-26: the section description is 20px, the same
        // as Work's, not the 24px (`text-2xl`) the frame shows. Only this
        // paragraph changes — the six card descriptions stay at the frame's 24px,
        // and the heading stays at 36px. `--text-description` + the intro's
        // `leading-description` is exactly Work's 20px/40px pairing.
        descriptionSizeClassName="text-description"
        gapClassName="lg:gap-[20rem]"
        align="first-line"
        className="pb-8"
      >
        {servicesSectionDescription}
      </SectionIntro>

      <div className="mt-16 flex flex-col gap-12">
        <ServicesRow services={firstRow} />
        {/* The frame's rule between the two rows. `--rule` rather than the literal
            gray-200 hex, so it keeps the corrected divider value. */}
        <div aria-hidden="true" className="h-px w-full bg-rule" />
        <ServicesRow services={secondRow} />
      </div>
    </section>
  );
}

/**
 * One row of three cards.
 *
 * `flex-1` per card with a 32px `gap-8` is the frame's own sizing, and the
 * trailing `border-r` is dropped on the last card because the frame omits it
 * there — `03` and `06` both carry no right border, and both are last in
 * their row.
 *
 * `items-stretch` equalises the cards. The frame is inconsistent about this: only
 * `04` and `05` carry an explicit `self-stretch`, and its row container is
 * `items-start`. Stretching is what the row clearly intends — three equal columns
 * divided by full-height rules — and without it the rules stop at each card's
 * own height and the row reads as broken.
 */
function ServicesRow({ services: row }: { services: typeof services }) {
  return (
    <ul className="flex flex-col items-stretch gap-8 lg:flex-row">
      {row.map((service, i) => (
        <li
          key={service.index}
          className={
            "flex flex-1 flex-col gap-8 p-4 " +
            // The last card in a row has no divider, per the frame.
            (i < row.length - 1 ? "border-r border-rule" : "")
          }
        >
          {/* `text-white` for the index and the title, `text-foreground` for the
              description: the frame draws its display type in #FFF and its body
              copy in the frame's gray-200, which is this palette's
              `--foreground` (#E9E9EC). Both clear AA on the background. */}
          <p className="font-body text-service-body leading-service text-white">
            {service.index}
          </p>

          {/* Keyed by `title`, not `index`: see `ServiceIcon`. A missing key
              renders nothing, and the suite asserts all six resolve, so a new
              service cannot ship with a blank slot. */}
          <ServiceIcon title={service.title} />

          {/* The frame wraps the title in a `justify-between items-center` row
              holding nothing else. It is a single-child wrapper, so it is not
              reproduced; the title is a plain heading. */}
          <h3 className="font-heading text-service leading-service text-white">
            {service.title}
          </h3>

          <p className="text-service-body leading-service-body text-foreground">
            {service.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
