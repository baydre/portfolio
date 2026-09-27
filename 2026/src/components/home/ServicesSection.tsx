import {
  secondaryServices,
  services,
  servicesSectionDescription,
} from "../../content/services";
import { SectionIntro } from "../common/SectionIntro";
import type { SecondaryService } from "../../content/types";

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
 *   01             24px Jura, `text-white`
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
 * **There is no per-card artwork. This is the third state of this slot, and
 * the history matters — do not re-add a mark without reading it.**
 *
 * *Frame as supplied.* Five of the six cards carried flat `gray-200` geometry
 * transcribed from this frame; the sixth, `01` Web Design, carried *nothing* and
 * was a faint 12%-opacity rect holding the slot open. A placeholder whatever it
 * was made of, and the other five read as placeholders too.
 *
 * *2026-09-26, owner request.* The geometry was deleted and replaced with a real
 * lucide mark per service, keyed by `title` (`ServiceIcon`, since removed).
 *
 * *2026-09-27, owner request.* **The marks were removed.** Six cards each
 * carrying a 192px pictogram read as illustration rather than as a consultancy's
 * capabilities, and the pictogram was the loudest thing in a section whose real
 * argument is the written description. The cards are now **index, title,
 * description** — no graphic slot, no `aspect-square` box, nothing reserved.
 *
 * Removing the slot is what makes the cards compact: they go from ~384px tall to
 * roughly the height of their copy. `items-stretch` on the row still equalises
 * them, so the `border-r` rules still run the full height of the row.
 *
 * ## The two tiers, and why the grid is not resized
 *
 * The six primary services are all **owner-supplied copy as of 2026-09-27** (the
 * frame's own six titles and descriptions were replaced wholesale — see
 * `content/services.ts` for the before/after table), and the owner added two
 * **secondary** services: Digital Marketing, and Technical Consulting & Training.
 *
 * The tempting implementation is to make it a 4 × 2 grid, or a 3 + 3 + 2 stack.
 * Both are wrong here, for the same reason:
 *
 * - The frame is a 3 × 2 grid with a `border-r` on every card but the last in its
 *   row, and a 1px rule between the rows. Four columns or a trailing pair of two
 *   means either discarding that geometry or leaving a rule drawn beside a cell
 *   that is empty. A `3 + 3 + 2` stack reads as a mistake, not as a layout.
 * - Nothing in the frame supports a fourth column or an eighth cell, so either
 *   choice is a redesign dressed up as a data change. The AGENTS.md rule is that
 *   a Figma detail the design is silent about must be *recorded*, not invented —
 *   and "how should eight cards reflow" is precisely such a detail.
 *
 * So the frame's grid is left exactly as supplied and the secondary pair is
 * rendered as its **own group below**, separated by the same kind of rule. That
 * makes "secondary" structural rather than a matter of opinion: they are not in
 * the numbered grid at all, and they are read after it, not beside it.
 *
 * They carry **no `01`–`06` index.** The numbering is a deliberate motif shared
 * with the Work section, and continuing it to `07`/`08` would present the two as
 * the same kind of offer, merely later in the list — which is the opposite of what
 * "secondary" means. If the owner wants them numbered, that is a one-line change
 * to `secondaryServices` plus the same treatment in the row below.
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
        {/* The secondary tier. The same 1px rule separates it from the primary
            grid, so the two tiers read as siblings rather than as one list of
            eight — and the pair is `flex-col` on small screens and two columns
            from `lg`, matching the primary rows' responsive behaviour without
            borrowing their three-column geometry. */}
        <div aria-hidden="true" className="h-px w-full bg-rule" />
        <SecondaryServicesRow services={secondaryServices} />
      </div>
    </section>
  );
}

/**
 * The secondary tier: the two services the owner listed as secondary.
 *
 * Quieter than the primary cards in four specific ways, each of which carries
 * meaning rather than taste:
 *
 * - **No `01`–`06` index.** See the note on the section — numbering them `07`/`08`
 *   would rank them as equals of the six.
 * - **No card padding and no `border-r` column dividers.** The frame's dividers
 *   are three-column furniture; two columns of quiet list items do not need them,
 *   and a stray divider beside a 2-item row reads as a missing third cell.
 * - **Title is `h3` but the description is body size.** Same heading level as the
 *   primary cards, so the document outline is unchanged, but at the smaller
 *   `text-service-body` the copy is plainly supporting rather than leading.
 * - **Titles sit on the project's own `gap-8` rhythm**, matching the primary
 *   cards' internal spacing so the block does not read as a different site.
 *
 * `description` is rendered only when present. Both are currently owner-pending,
 * so this renders the two titles alone and the section says nothing invented.
 */
function SecondaryServicesRow({ services }: { services: SecondaryService[] }) {
  return (
    <ul data-tier="secondary" className="flex flex-col gap-8 lg:flex-row">
      {services.map((service) => (
        <li key={service.title} className="flex flex-1 flex-col gap-2">
          <h3 className="font-heading text-service leading-service text-white">
            {service.title}
          </h3>
          {service.description && (
            <p className="text-service-body leading-service-body text-foreground">
              {service.description}
            </p>
          )}
        </li>
      ))}
    </ul>
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
    // `data-tier` is not a test hook bolted on afterwards: the two tiers render
    // the same element types, and without a way to tell them apart in the DOM
    // "select every service card" silently means "all eight", and any CSS scoped
    // to the card would hit the secondary pair too. The attribute is also what
    // makes the tier visible to anyone reading the rendered page in devtools.
    <ul
      data-tier="primary"
      className="flex flex-col items-stretch gap-8 lg:flex-row"
    >
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
