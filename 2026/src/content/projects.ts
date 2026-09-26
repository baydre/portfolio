/**
 * Work index.
 *
 * Source: the HomePage snippet's Work frame (2562px), which shows four entries
 * numbered `01`–`04`.
 *
 * PROVISIONAL — one entry, not four.
 * All four cards in the design carry the SAME title ("IdCardify"), the SAME
 * summary paragraph, and five stack tiles that all read "React.js" with an
 * identical React glyph. The generated markup contains roughly thirty copies of
 * one SVG path with auto-incremented clip-path ids, which is one component
 * instance duplicated, not thirty distinct technologies. The first card is also
 * missing the "Project code" panel that the other three have, which reads as an
 * authoring slip rather than a featured-card treatment.
 *
 * Reading that as four separate projects would mean inventing three projects,
 * their copy, their stacks and their images. Owner-confirmed 2026-09-26: do not.
 * So the real, single known project is modelled once, flagged `provisional`, and
 * `WorkSection` renders a visible "Provisional" badge for it.
 *
 * This is a DATA change, not a component change: replacing this array with the
 * final four projects requires no edit to `WorkSection`, `ProjectCard`, or the
 * route table.
 */

import type { Project } from "./types";

/**
 * The single project recoverable from the design.
 *
 * `id` is derived from the design's own title so the URL is meaningful without
 * inventing a slug.
 */
const idCardify: Project = {
  id: "idcardify",
  title: "IdCardify",
  category: "Product",
  /**
   * Transcribed verbatim from the Project card snippet, including its first
   * person voice — the design's own words, not a paraphrase.
   */
  summary:
    "idCardify is a digital identity platform that helps organizations create, manage, and verify digital ID cards using QR codes. I worked on the product experience across identity management, QR verification, and administrative workflows.",
  /**
   * The design's "Built with" panel shows FIVE tiles, all labelled "React.js",
   * with identical glyphs — laid out three in the first row and two in the
   * second. This models that literally.
   *
   * It is a Figma placeholder of the same kind as the four identical project
   * cards and the three identical social tiles elsewhere in the design, and it
   * is kept as drawn for two reasons. Modelling it literally is what makes the
   * panel's authored geometry real: the tile row is `flex: 1 1 0` per tile, so a
   * single entry grows to 100% of the panel and renders as one 595px bar with a
   * 32px icon in the middle, which is not a tile. And repeating a *label*
   * fabricates no technical claim, unlike inventing "TypeScript, Tailwind,
   * Node" — which would be asserting things about someone else's product.
   *
   * Replace wholesale with the real stack; the panel needs no code change.
   */
  stack: ["React.js", "React.js", "React.js", "React.js", "React.js"],
  /**
   * OPTIONAL and currently absent. The design shows a code panel on cards
   * `02`–`04` but not `01`, and the sample it shows is the same dummy
   * `function greet(name: string)` snippet on each. A real excerpt has not been
   * supplied, so the card renders without the panel. See `Project.codeSample`.
   *
   * Provisional because the design repeats this one project across all four
   * cards with identical copy and an all-React.js stack; real case studies have
   * not been supplied. (This used to be a `provisionalReason` string feeding the
   * Provisional pill's tooltip. The pill is removed at the owner's request, so
   * the reason lives here instead of in a field nothing renders.)
   */
  provisional: true,
};

export const projects: Project[] = [idCardify];

/**
 * Look up one project for the detail route.
 *
 * Returns `undefined` for an unknown id so the route can render a not-found
 * state. The previous site linked all six cards to the same id, so this
 * distinction is load-bearing.
 */
export const findProject = (id: string): Project | undefined =>
  projects.find((project) => project.id === id);
