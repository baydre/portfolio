import { projects } from "../../content/projects";
import { SectionIntro } from "../common/SectionIntro";
import { ProjectCarousel } from "./ProjectCarousel";

/**
 * The Work section of the homepage.
 *
 * Source: the HomePage snippet's Work frame, 2562px, containing four entries.
 * The snippet labels the section `//01` and each project `01`–`04`; only the
 * per-project labels remain, since the section-level index was removed on owner
 * request (2026-09-26).
 *
 * The frame shows four identical stacked cards and no motion. Both are
 * superseded: the entries are now six real projects, and the stack is one slider
 * that advances by itself (owner request and then correction, 2026-09-27). What
 * is retained from the frame is the card anatomy, the `01`–`06` per-project
 * labels, the Work-specific divider and the container geometry.
 *
 * The design's own gutter is inconsistent — `padding-left: 81px` against
 * `padding-right: 84px`, and content widths that drift between 1272, 1275 and
 * 1285px across the frames. Those are Figma measurement artefacts, so this uses
 * the same `container-site` (84px gutters, 1272px content) as the hero. The one
 * number the design clearly intends is 1440 − 168 = 1272, which is what
 * `verify:geometry` already pins for the hero.
 *
 * The divider is the design's darker Work rule. The other three frames use
 * `--rule`; Work as authored is 1.95:1 and fails WCAG 1.4.11, so
 * `--rule-work` is the corrected value. See docs/DESIGN_SYSTEM.md §7.
 *
 * There is no fixed height. The design's 2562px leaves a large empty tail below
 * the fourth card, which is frame padding, not content — a hardcoded height
 * would reserve that dead space at every viewport.
 *
 * The header is a 40px `#E9E9EC` heading in the display face, rendered as an
 * `<h2>`: the snippet uses a paragraph for every heading, which leaves the
 * section with no heading at all (WCAG 2.2 AA 1.3.1).
 *
 * `align="first-line"` puts the heading beside the *opening* line of the
 * description rather than beside its last one. The description wraps to two
 * lines at the design's 1440 canvas, so the default bottom-alignment left
 * "Work" stranded down beside "…who care about the difference." Services keeps
 * the default: it has no header snippet, and the bottom-aligned form is what
 * the composite frame supports.
 *
 * The Work header snippet's `min-w-screen min-h-screen absolute left-0 top-0
 * text-center` is the per-element export wrapper — the same one that puts
 * `absolute left-[201px] top-[161px]` on the hero — and is discarded whole.
 * `text-center` centres the text inside the extracted element's own full-width
 * box, which says nothing about where the element sits in the section. Reading
 * it as section layout once led to centring the header, which was wrong.
 */
export function WorkSection() {
  return (
    <section id="work" aria-labelledby="work-heading" className="container-site scroll-mt-header py-20">
      <SectionIntro
        title="Work"
        headingId="work-heading"
        ruleClassName="bg-rule-work"
        align="first-line"
      >
        BaydreAfrica designs and builds brands, websites, and software that hold
        up in the real world, not just on a moodboard. Work made to perform, for
        founders who care about the difference.
      </SectionIntro>

      {/*
        One slider, all six projects, advancing by itself every 6s. Owner
        correction 2026-09-27: an earlier build showed IdCardify pinned above a
        carousel of the other five, on the reading that the design's first card
        was a featured one. That split is gone — it presented the section as "one
        real project plus five lesser ones", which is the opposite of what six
        real projects on a 6s rotation should say. IdCardify now takes its turn
        with the rest, in its authored position, numbered `01`.

        Everything `ProjectCarousel` has to answer for is documented there: a
        pause control (WCAG 2.2.2), no motion under `prefers-reduced-motion`, no
        focus trap, and no `aria-live`.
      */}
      <ProjectCarousel projects={projects} />
    </section>
  );
}
