/**
 * The heading block that opens the Work and Services frames.
 *
 * Snippet geometry: a 40px heading, a 24px description, and a 1px full-bleed
 * rule beneath, separated by a 344px gap with the description bottom-aligned
 * against the heading.
 *
 * The snippet implements every one of those as absolutely positioned elements at
 * fixed offsets inside a fixed-height frame. Here they are a flow layout, so the
 * block reflows and the 344px gap collapses on narrow viewports. The desktop
 * geometry is reproduced at `lg` and above.
 *
 * The rule's colour is passed in because the design is inconsistent here: the
 * Services rule is `--rule` (#e9e9ec) while the Work rule is darker. The Work
 * value as authored fails WCAG 1.4.11 at 1.95:1 and is corrected — see
 * docs/DESIGN_SYSTEM.md §7.
 *
 * The snippet also puts a `//NN` index label beside each heading, baseline-
 * aligned to it. **Those section-level labels are removed on owner request**
 * (2026-09-26), so this no longer takes an `index` prop and the wrapper that
 * paired the two is gone. The per-item `01`–`06` numbering inside the
 * Work and Services grids is content and is unaffected — that still uses
 * `text-index` via `WorkSection` and `ServicesSection`.
 *
 * The heading sits bottom-aligned with the description beside it, in a row with
 * a 344px gap at `lg` and above. The Work header's own snippet is
 * `<p class="… absolute left-0 top-0 text-center">Work</p>`, but that
 * `min-w-screen min-h-screen absolute left-0 top-0` wrapper is the same
 * per-element export wrapper the hero snippet uses, and is discarded whole. Its
 * `text-center` centres the text inside the *extracted element's* full-width box
 * and says nothing about where the element sits in the section. Reading it as
 * section layout led to centring the header, which was wrong — the heading stays
 * left, aligned with the description next to it.
 */
export function SectionIntro({
  title,
  headingId,
  children,
  ruleClassName = "bg-rule",
  align = "bottom",
  className,
  titleSizeClassName,
  descriptionSizeClassName,
  gapClassName,
}: {
  title: string;
  /**
   * `id` for the rendered `<h2>`, so the enclosing `<section>` can point
   * `aria-labelledby` at the real heading rather than at a second hidden copy.
   */
  headingId?: string;
  /** The description paragraph. */
  children?: React.ReactNode;
  ruleClassName?: string;
  /**
   * How the heading lines up with the description beside it.
   *
   * `"bottom"` (default) bottom-aligns the two boxes, which is the form
   * reconstructed from the composite frame. It suits a one-line description but
   * not a long one: the description is 20px on a 40px line, so a paragraph of
   * any length wraps to more lines than the heading's single 44px box, and
   * bottom-alignment then drops the heading beside the description's *last* line
   * instead of its first.
   *
   * `"first-line"` top-aligns the boxes so the heading sits beside the opening
   * line, and applies the optical offset described below.
   */
  align?: "bottom" | "first-line";
  className?: string;

  /**
   * Size overrides for the two frames that share this component.
   *
   * The Work and Services headings are **not** the same size — 40px against 36px
   * — and their descriptions differ too, 20px against 24px. The horizontal gap
   * between them differs as well, 344px against 320px. Rather than pick one
   * frame's values and quietly mis-render the other, the caller states which
   * frame it is building. All three are optional and default to the Work values,
   * so Work's call site is unchanged.
   */
  titleSizeClassName?: string;
  descriptionSizeClassName?: string;
  /** Replaces the `lg:gap-[21.5rem]` between heading and description. */
  gapClassName?: string;
}) {
  const toFirstLine = align === "first-line";

  const layout =
    "flex flex-col gap-6 lg:flex-row lg:justify-between " +
    (gapClassName ?? "lg:gap-[21.5rem]") +
    " " +
    (toFirstLine ? "lg:items-start" : "lg:items-end");

  return (
    <div className={className}>
      <div className={layout}>
        <h2
          id={headingId}
          className={
            "font-heading leading-section text-foreground " +
            (titleSizeClassName ?? "text-section") +
            // DERIVED, and the one value here that needs eyes on a real render.
            // Top-aligning the boxes puts the 40px heading's baseline below the
            // description's first baseline: the heading's 44px line box carries
            // 2px of half-leading, the description's 40px box carries 10px, and
            // the heading's glyphs are twice the size. 0.5rem cancels it.
            // Derived from font metrics, not measured in a browser, and sensitive
            // to Jura's real ascent value — confirm against the design before
            // treating it as fixed.
            (toFirstLine ? " lg:mt-[0.5rem]" : "")
          }
        >
          {title}
        </h2>

        {children ? (
          <p
            className={
              // `flex: 1 0 0` as authored: basis 0, grow into whatever the
              // heading and the gap leave over, never shrink. Basis 0 means the
              // two items' bases total 0, so shrink never engages and the row
              // cannot overflow on narrow viewports — the description simply
              // gets narrower. This replaces a `max-w-prose` cap, which made the
              // 344px gap emergent from natural widths rather than exact.
              "grow basis-0 shrink-0 leading-description text-foreground " +
              (descriptionSizeClassName ?? "text-description") +
              // The 4px nudge only made sense while bottom-aligning.
              (toFirstLine ? "" : " lg:pb-1")
            }
          >
            {children}
          </p>
        ) : null}
      </div>

      <div aria-hidden="true" className={`mt-8 h-px w-full ${ruleClassName}`} />
    </div>
  );
}
