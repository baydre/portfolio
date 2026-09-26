/**
 * Site content.
 *
 * Copy is taken from the Figma HomePage snippet. Nothing here is invented
 * marketing copy: if a value is not in the snippet it is either a real value
 * recovered from the previous site or is explicitly flagged as unverified.
 *
 * AGENTS.md §4: "Never fake functionality." The same principle applies to
 * content — a placeholder must be recognisable as a placeholder.
 */

import heroAsset from "figma:asset/c24501893257f415ae9c63024548048fcb48b651.png";
import type { LocationCopy, NavItem, Profile, SocialLink } from "./types";

export const profile: Profile = {
  name: "BaydreAfrica",
  // The design sets this in the body face at 160px, deliberately unlike the
  // hero's "BaydreAfrica". Transcribed verbatim, not normalised.
  tagline: "Built to work in the real world.",
  description:
    "BaydreAfrica designs and builds brands, websites, and software that hold up in the real world, not just on a moodboard. Work made to perform, for founders who care about the difference.",
  email: "baydreafrica@gmail.com",
  // PENDING: the snippet's hero is an external placehold.co URL. This local
  // asset stands in until the real image is supplied. See docs/DESIGN_SYSTEM.md.
  heroImage: {
    src: heroAsset,
    width: 2560,
    height: 1440,
  },
  heroImageAlt: "",
  role: "Developer & Designer",
  disciplines: ["Software", "Web", "Brand"],
  availability: "Open for work",
  credit: "Yasir Musa",
};

/**
 * Primary navigation: Work, About, Contact — the three items the header shows.
 *
 * Work and Contact are Home SECTIONS, not pages. The design's footer Navigate
 * column lists Home, Work, Services, Contact, and the Figma file contains no
 * separate work or contact screen. The supplied snippet emits all three as
 * `<button>` elements because Figma Make does not know what a link is; the
 * intended behaviour is that Work scrolls to `#work` and Contact to `#contact`.
 *
 * About is a real page and keeps a router path.
 *
 * Services is in the footer but not the header. The header's three items are
 * reproduced exactly — see docs/ARCHITECTURE.md §3 for the open question of
 * whether Services should be promoted into the header.
 */
export const navItems: NavItem[] = [
  { label: "Work", kind: "anchor", to: "/#work" },
  { label: "About", kind: "route", to: "/about" },
  { label: "Contact", kind: "anchor", to: "/#contact" },
];

/**
 * Three social tiles.
 *
 * The header's three tiles are three IDENTICAL placeholder SVGs in the design and
 * do not identify their networks. This is now confirmed from the snippet rather
 * than inferred: all three are the same 20 × 20 three-dimensional box glyph,
 * byte-identical `d` path (`M10.0003 1.6665…`) and byte-identical
 * `fill="#344054"`, differing in nothing but their position. The footer's
 * "Connect" column is the only evidence of what they stand for, and it names
 * them GitHub, LinkedIn, X — in that order, which is the reverse of the order
 * used here. The order below follows the header's, since the header is the
 * primary instance; see docs/DESIGN_SYSTEM.md §9.
 *
 * The real network glyphs are substituted for the placeholder cube, on the
 * design's own `--surface-foreground` (#344054) and 40 × 40 `#F0F2F5` tile. The
 * design's `#344054` is confirmed as the intended glyph colour by its use on all
 * three tiles.
 *
 * The GitHub account is the one confirmed handle: the previous site linked to
 * baydre.github.io. The other two URLs are still guesses and are marked
 * `unverified`.
 */
export const socialLinks: SocialLink[] = [
  {
    network: "linkedin",
    label: "LinkedIn",
    // Owner-confirmed 2026-09-26. This is a personal profile, not the company
    // page the earlier guess pointed at.
    href: "https://linkedin.com/in/yasir-musa-baydre-africa",
  },
  {
    // Still a guess: the owner supplied X and LinkedIn only. Recorded rather than
    // dropped, and still flagged so it stays obvious in review.
    network: "github",
    label: "GitHub",
    href: "https://github.com/baydre",
    unverified: true,
  },
  {
    network: "x",
    label: "X",
    // Owner-confirmed 2026-09-26, including the underscore in the handle.
    href: "https://x.com/baydre_africa",
  },
];

/** The header call to action. */
export const hireMeLabel = "Hire me";

/**
 * Footer Navigate column: Home, Work, Services, Contact.
 *
 * All four are Home anchors — this column is what establishes that Work,
 * Services and Contact are sections rather than pages.
 */
export const footerNavItems: NavItem[] = [
  { label: "Home", kind: "anchor", to: "/#main" },
  { label: "Work", kind: "anchor", to: "/#work" },
  { label: "Services", kind: "anchor", to: "/#services" },
  { label: "Contact", kind: "anchor", to: "/#contact" },
];

/** "Open for work" is paired with a "View Work" link in the footer. */
export const viewWorkLabel = "View Work";

/** Options for the contact form's topic selector. */
export const contactTopics: string[] = [
  "Web Design",
  "Web Development",
  "Brand Development",
  "Technical Writing",
  "Consultation Services",
  "Marketing Services",
  "Something else",
];

/**
 * The contact section's two distinct paragraphs. They are NOT interchangeable:
 *
 * - `contactIntro` sits directly under the 96px heading, in the wider measure.
 * - `contactBlurb` sits in the narrow left column beside the form, and the
 *   design repeats it in the footer.
 *
 * Both are transcribed from the design's Contact frame. Verify wording against
 * the Figma frame before launch — see docs/DESIGN_SYSTEM.md §9.
 *
 * `contactIntro` WAS WRONG until 2026-09-26. It had been transcribed as a
 * 177-character, three-sentence paragraph beginning "Have a project in mind?
 * Let's talk about it...". The frame's own text for this line, re-read from the
 * supplied snippet, is the 103-character single sentence below — the two share
 * only their first 24 characters, so the divergence was never a wording
 * preference but a different string. The frame is authoritative; this is now
 * verbatim. `contactBlurb` has not been re-checked against the frame the same
 * way, so it stays flagged `PENDING`.
 *
 * `contactBlurb` is an object, not a string: `lead` plus `duration`, split as
 * late as possible so only the duration is unbreakable. The words are identical
 * to the original single string — a test asserts the full sentence — but the
 * en-dash in "24–48" is a legal break point, so the duration has to be its own
 * element. See `LocationCopy` in ./types.
 */
export const contactIntro =
  "Have a project in mind? Tell me what you're working on, what you need, and where you'd like to take it.";

export const contactBlurb: LocationCopy = {
  lead: "Based in Nigeria, working with founders and teams around the world. I reply to every serious enquiry within",
  duration: "24–48 hours.",
};
