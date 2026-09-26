import { Link } from "react-router";
import type { Project } from "../../content/types";
import { TechTile } from "../common/TechTile";

/**
 * One entry in the Work section.
 *
 * Snippet structure: a 621px-wide image, then a title row carrying the title and
 * the `01` label, then the summary, then the "Built with" stack tiles. The
 * snippet's `min-w-screen min-h-screen absolute left-0 top-[226px]` on the root is
 * the per-element export wrapper and is discarded, as is the root's `h-full`.
 *
 * Its separate CSS block — `display: flex; align-items: flex-start; gap: 24px;
 * align-self: stretch` — is the load-bearing part: the row is `items-start`, not
 * `items-stretch`. The `align-self: stretch` applies to the root within *its*
 * parent, not to the image within this row.
 *
 * ## Deviations from the snippet, each because its markup is not usable as-is
 *
 * 1. **The whole card is a link, not a `<button>`.** The snippet wraps the title
 *    and the "Project code" panel in `<button>` elements with `cursor-pointer`.
 *    A code block is not interactive, and a card that navigates is a link. The
 *    card is one `<a>` to `/projects/:id`; the two real outbound links inside it
 *    are nested `<a>`s placed outside it, so there is no interactive nesting.
 *
 * 2. **The code panel is a `<pre>`, not a button.** It is sample code, so it is
 *    preformatted text. The snippet clips it at 153px with
 *    `overflow-hidden text-ellipsis`, which hides the end of the sample with no
 *    way to reveal it; it is clamped here with a real max-height and the full text
 *    remains in the DOM and reachable by keyboard/selection.
 *
 * 3. **A missing image renders a labelled placeholder.** The design's four work
 *    images are not in the repository, so rather than reusing another page's
 *    asset the card shows the project title on a neutral panel.
 *
 * 4. **The panel border uses `--panel-border`, not the snippet's `#585667`.**
 *    That raw value is one of the six recorded palette corrections: at 1.95:1 it
 *    fails WCAG 1.4.11 against `--panel`. See docs/DESIGN_SYSTEM.md §2.3.
 *
 * 5. **The title and `01` use `#FFF`, not `--foreground`.** The snippet
 *    authors pure white for both, and `--foreground` is a deliberately softer
 *    `#e9e9ec`. `Hero` already uses `text-white` for the wordmark, so this is
 *    consistent rather than a new exception.
 *
 * ## Provenance of the values not in the snippet
 *
 * ## Provenance of the values the snippet does not state
 *
 * Neither the card title (32px) nor the `01` label (24px) states a
 * line-height in either export, so both are **DERIVED**: the title uses
 * `--leading-card-title: 1.1`, matching the 40px section headings' ratio, and
 * `01` uses `leading-lead` (32px), which is what Tailwind's own `text-2xl`
 * pairs with 24px in the first export. The panel label's 0.88px letter-spacing
 * is authored and carried inline as `tracking-[0.0733em]`, since tracking is not
 * otherwise tokenised in this project.
 *
 * ## Provenance
 *
 * The right column was supplied on its own as a third export (`Frame1548`) after
 * this refactor, isolating exactly the subtree below the artwork. It confirmed
 * the structure and corrected two things the earlier passes had wrong: the tiles
 * are **two** rows of three and two rather than one row, and the columns use
 * `align-items: flex-start` with `align-self: stretch` on the children rather
 * than an inherited stretch. It also revealed a `<div>` nested directly inside
 * the tile `<ul>`, which is invalid HTML — see the tile list below.
 *
 * ## Where the two exports disagree
 *
 * The card was supplied twice, in Figma's Tailwind and styled-components
 * formats. They agree on almost everything but not on:
 *
 * - **Border radius.** Both say 12 for the image and the panel. An earlier pass
 *   read `rounded-xl` (16px) off the Tailwind classes, which was wrong.
 * - **The tile label's tracking.** The Tailwind export has
 *   `tracking-[-0.0307em]`; the styled-components export has no `letterSpacing`
 *   for that element. The second is followed, as the more explicit record.
 * - **The stack glyph.** See `common/TechIcon.tsx` — one export has a React
 *   path, the other a flat `#61DAFB` rect.
 *
 * `projects.ts` also held a summary that was not the design's at all; it is now
 * the verbatim text from the snippet, first person included.
 */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  /** Zero-based position, for the `01` label the snippet puts in the title row. */
  index: number;
}) {
  const hasImage = Boolean(project.image);

  return (
    <article className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
      {hasImage ? (
        <img
          src={project.image}
          alt={project.imageAlt ?? ""}
          loading="lazy"
          decoding="async"
          // 621 x 494 at border-radius 12 — not `rounded-image` (24px, the
          // HERO image's) and not `rounded-xl`. `aspect-[621/494]` carries the
          // authored ratio at every width; with lg:w-[38.8125rem] it resolves to
          // exactly 621 x 494 at 1440, and it is what stops the placeholder
          // below from collapsing to a bar on narrow screens.
          className="aspect-[621/494] w-full rounded-lg object-cover lg:w-[38.8125rem] lg:shrink-0"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-[621/494] w-full items-center justify-center rounded-lg border border-panel-border bg-panel lg:w-[38.8125rem] lg:shrink-0"
        >
          <span className="font-heading text-section leading-section text-panel-foreground">
            {project.title}
          </span>
        </div>
      )}

      {/* align-items: flex-start, with `self-stretch` on each child — that is
          how StyledFrame1548 and its children are written. The card looked
          correct before only because the column defaulted to `align-items:
          stretch`, so the parent was doing the work the design assigns to
          `align-self`. Same for the two panels inside the tile row. */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-6">
        <div className="flex flex-col items-start gap-[1.125rem] self-stretch">
          {/* The `01` label belongs to the card's title row in the snippet —
              right-aligned against the title by `justify-between` — so it is
              rendered here rather than above the card by WorkSection. */}
          <div className="flex items-center justify-between self-stretch">
            <h3 className="font-heading text-card-title leading-card-title text-white">
              <Link
                to={`/projects/${project.id}`}
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {project.title}
              </Link>
            </h3>

            {/* 24px #FFF, per the snippet — not --foreground, which is a
                deliberately softer #e9e9ec. Its own fluid pair rather than
                --text-lead, which is Hero's authored 24px/32px and must not
                start scaling. The 0.75 ratio to the title is the design's. */}
            <span className="w-fit font-sans text-card-index leading-card-index text-white">
              {/* The frame prefixes this `//01`; the slashes are dropped on owner
                  request 2026-09-26, matching Services and the About frame. The
                  padding and the positional `index` are unchanged — the number
                  the design prints is still the one it prints. */}
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {project.summary ? (
            <p className="text-description leading-card-summary text-foreground self-stretch">
              {project.summary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 self-stretch lg:flex-row lg:items-start">
          {project.codeSample ? (
            <div className="flex-1 self-stretch overflow-hidden rounded-lg border border-panel-border bg-panel">
              <div className="flex items-center gap-2.5 self-stretch border-b border-panel-border px-4 py-3">
                <p className="w-[6.375rem] text-panel-label uppercase leading-panel-label tracking-[0.0733em] text-foreground">
                  Project code
                </p>
              </div>
              <div className="self-stretch px-4 py-2.5">
                <pre className="max-h-38 overflow-auto text-caption leading-caption text-code-foreground">
                  <code>{project.codeSample}</code>
                </pre>
              </div>
            </div>
          ) : null}

          {/* flex: 1 1 0 — the panel takes the row's full width, not a 358px cap.
              borderRadius 12. The snippet draws its hairline with
              `outline: 1px solid` + `outline-offset: -1px`, which is an inset
              border that does not consume layout; a real `border` is the same
              1px on the same edge and is the honest way to say so. */}
          <div className="flex flex-1 self-stretch flex-col items-start gap-3 overflow-hidden rounded-lg border border-panel-border bg-panel">
            <div className="flex items-center gap-2.5 self-stretch border-b border-panel-border px-4 py-3">
              {/* textTransform: uppercase and letter-spacing 0.88px (= 0.0733em
                  at 12px). Both are in the styled-components export; the label
                  renders as "BUILT WITH". */}
              <p className="w-[6.375rem] text-panel-label uppercase leading-panel-label tracking-[0.0733em] text-foreground">
                Built with
              </p>
            </div>

            {/* @container: the tile count must follow the PANEL's width, not the
                viewport's. The card's image is a fixed 621px, so between 1024px
                (where `lg` turns the row on) and 1061px the right column narrows
                to 179-215px and a third of it cannot hold `p-3` plus a 32px icon.
                A viewport breakpoint cannot see that; a container query can. */}
            <div className="@container flex items-center gap-2.5 self-stretch px-4 py-2.5">
              {/* The design's five tiles are TWO rows — three, then two — and each
                  row distributes its own width, so row 2's two tiles are half
                  the row each rather than two of three equal columns.

                  `flex-wrap` with a one-third basis inside a wide-enough container
                  reproduces that for any tool count without a chunking loop: three
                  tiles fill a row exactly
                  (3 x basis + 2 x 24px gap = 100%), and a shorter trailing row
                  grows to fill its own row, so a trailing pair lands at 50% each
                  — the same result the design's `space-between` + `flex: 1 1 0`
                  gives. A plain wrapping flex would leave the trailing tiles at
                  one third width; hardcoding a 3-per-row split would not. The
                  basis is a third only once the panel can hold three; below
                  `@[216px]` it is a half, which is what the 1024-1061px band
                  needs.

                  The design nests grid > row > tile; flex-wrap supplies the same
                  24px between rows and between tiles from the one `gap-6`. It
                  also keeps `li` as one tool per item, which nesting a row `div`
                  inside the `ul` would not. */}
              <ul className="flex flex-1 flex-wrap items-start gap-6">
                {/* Keyed by tool AND position, not by tool alone. The design's
                    stack is five entries all labelled "React.js", so a tool-only
                    key collides — React logs duplicate-key warnings and treats
                    the reconciliation as unsupported. The list is static content
                    that never reorders, so the index is a safe discriminator. */}
                {project.stack.map((tool, index) => (
                  <li
                    key={`${tool}-${index}`}
                    // Two across by default — safe at any panel width — and three
                    // once the panel body can hold 3 x 56px + 2 x 24px = 216px.
                    // At 1440 the panel body is 595px, so this resolves to the
                    // design's 3 + 2: a full row of three, then two at half width.
                    className="flex flex-1 basis-[calc((100%-1.5rem)/2)] @[216px]:basis-[calc((100%-3rem)/3)] flex-col items-center gap-2"
                  >
                    <TechTile tool={tool} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {project.repositoryUrl || project.liveUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            {project.repositoryUrl ? (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-pill px-4 py-2 text-caption leading-caption text-pill-foreground transition-opacity hover:opacity-85"
              >
                View Github Repo
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-panel-border bg-pill px-4 py-2 text-caption leading-caption text-pill-outline-label transition-opacity hover:opacity-85"
              >
                View Live Project
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
