import type { Service } from "./types";

/**
 * Services offered.
 *
 * Source: the HomePage snippet's Services frame — 1440 × 1962, a 3 × 2 grid of six
 * services with a 1px rule between the two rows.
 *
 * The `index` labels and all six `title`s are transcribed from the design, which
 * numbers them `01`–`06`. That numbering is a deliberate motif the Work section
 * shares (`01`–`04`) and is content-controlled, not positional.
 *
 * The frame draws those numbers with a `//` prefix — `//01`–`//06` — and the Work
 * cards did the same. **The slashes are gone as of 2026-09-26, on owner request**,
 * from every number on the site: these six, the four project indices in
 * `ProjectCard`, and the `//01`/`//02` prose in the comments across the Home
 * page's components. The digits are the design's own; `//` was a typographic
 * flourish around them that read as a code comment marker and was being mistaken
 * for one, and the About page's frame never had it, so the two sections now
 * agree. The numbering itself is untouched — these are still the design's labels,
 * still content, still not derived from array position.
 *
 * All six `description`s are now transcribed verbatim from the same frame, as is
 * `sectionDescription`. They were previously withheld because inventing marketing
 * copy is worse than publishing none — see docs/DESIGN_SYSTEM.md §9.
 */
export const services: Service[] = [
  {
    index: "01",
    title: "Web Design",
    description:
      "Designing clear, engaging digital experiences that balance visual character with usability and purpose.",
  },
  {
    index: "02",
    title: "Web Development",
    description:
      "Building responsive, functional websites and web applications that are made to work across devices and real-world use cases.",
  },
  {
    index: "03",
    title: "Brand Development",
    description:
      "Developing visual identities and brand systems that give ideas a clear, consistent, and recognizable presence.",
  },
  {
    index: "04",
    title: "Technical Writing",
    description:
      "Turning complex technical ideas into clear, useful documentation and content that people can actually understand and use.",
  },
  {
    index: "05",
    title: "Consultation Services",
    description:
      "Helping teams and founders make better digital decisions through practical guidance on products, design, technology, and execution.",
  },
  {
    index: "06",
    title: "Marketing Services",
    description:
      "Creating digital marketing experiences and content that help brands communicate clearly, reach the right audience, and grow.",
  },
];

/**
 * The Services section's own description, beside the heading.
 *
 * Verbatim from the frame. It sits at 24px in the design against Work's 20px —
 * one of four values that differ between the two frames, which is why
 * `SectionIntro` takes the description size from the caller.
 */
export const servicesSectionDescription =
  "Digital experiences, brands, and technical solutions built with purpose — from the first idea to the final product.";
