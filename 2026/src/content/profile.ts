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

import heroSrc from "../assets/hero-bg-2048.jpg";
import heroSrc1280 from "../assets/hero-bg-1280.jpg";
import heroSrc2048 from "../assets/hero-bg-2048.jpg";
import type { LocationCopy, NavItem, Profile, SocialLink } from "./types";

export const profile: Profile = {
  name: "BaydreAfrica",
  // The design sets this in the body face at 160px, deliberately unlike the
  // hero's "BaydreAfrica". Transcribed verbatim, not normalised.
  tagline: "Built to work in the real world.",
  // OWNER APPROVED 2026-10-13: drafted as part of the factual-integrity pass and
  // approved for shipping. The earlier "BaydreAfrica designs and builds brands,
  // websites, and software..." framed the site as a digital agency; this frames
  // it as a technologist's work. "Built to work in the real world." is kept.
  description:
    "Software, systems, and digital products built to solve practical problems. I explore engineering, AI, and emerging technologies through software development, experimentation, and digital prototypes.",
  email: "baydreafrica@gmail.com",
  // Owner-supplied 2026-09-27, replacing the placehold.co stand-in. The source
  // is 5530x3684 / 2.7 MB, so two derivatives are committed and the full-size
  // original is NOT imported: 1280w is the 1x fetch for the 1272px content
  // column and 2048w covers ~1.6x. That is 7-18x less to download.
  //
  // `width`/`height` are the intrinsic size of the SOURCE, not of a derivative,
  // because that ratio is what reserves the box before the bytes land. It is
  // 1.501:1, against the placeholder's 1.778:1 — visible only as a change in
  // how much `object-cover` trims, which is the design's own framing rule.
  heroImage: {
    src: heroSrc,
    srcSet: `${heroSrc1280} 1280w, ${heroSrc2048} 2048w`,
    width: 5530,
    height: 3684,
  },
  heroImageAlt: "",
  // OWNER REPLACEMENT 2026-10-09: the footer's top row is now transcribed from a
  // new snippet, and the owner's text supersedes the snippet's own labels. The
  // snippet still reads "Developer & Designer" / "Software • Web • Brand" in its
  // text nodes; the strings below are what the owner asked to ship instead (see
  // SiteFooter). Same address for `role` and `disciplines` as before — the footer
  // is their only consumer.
  role: "Technologist & Software Engineer",
  disciplines: ["Software", "AI", "Digital Prototypes"],
  availability: "Open for work",
  credit: "Yasir Musa",
};

/**
 * Primary navigation: Home, Work, About, Contact — the items the updated navbar
 * snippet (supplied 2026-10-08) shows. OWNER REMOVAL 2026-10-09: "Resume" left
 * the NavBar item list, so the header no longer lists it.
 *
 * Work and Contact are Home SECTIONS, not pages. The design's footer Navigate
 * column lists Home, Work, Services, Contact, and the Figma file contains no
 * separate work or contact screen. The supplied snippet emits all items as
 * `<div>` elements because Figma Make does not know what a link is; the
 * intended behaviour is that Work scrolls to `#work` and Contact to `#contact`.
 *
 * Home and About are real pages (routes). Resume is a page still — `ResumePage`
 * exists — but it now has NO path or entry point: the owner REMOVED "Resume"
 * from the NavBar item list 2026-10-09, and the footer's credit stopped linking
 * it on 2026-10-13 (UNPUBLISHED pending verified résumé content — see
 * `SiteFooter`). `Routing` lives in `routes.tsx`, so `/resume` renders the 404
 * page rather than either site of this record.
 *
 * Services is in the footer but not the header. The header's items are
 * reproduced exactly — see docs/ARCHITECTURE.md §"The nav follows the snippet".
 */
export const navItems: NavItem[] = [
  { label: "Home", kind: "route", to: "/" },
  { label: "Work", kind: "anchor", to: "/#work" },
  { label: "About", kind: "route", to: "/about" },
  { label: "Contact", kind: "anchor", to: "/#contact" },
];

/**
 * The footer credit's destination. Once `/resume` (OWNER DESIGN 2026-10-09), so
 * the "Yasir Musa" credit linked to the Resume page.
 *
 * **REMOVED 2026-10-13 — `/resume` is unpublished.** The route and its footer
 * link are gone until verified résumé content exists; the owner's decision was
 * recorded as a temporary content-integrity measure, not an abandonment of the
 * page. `SiteFooter` now renders the credit as inert lime text, and `routes.tsx`
 * no longer serves `/resume`. Keeping the NavItem would have been dead config
 * nothing renders.
 */

/**
 * Three social tiles.
 *
 * The header's three tiles are three IDENTICAL placeholder SVGs in the design and
 * do not identify their networks. This is now confirmed from the snippet rather
 * than inferred: all three are the same 20 × 20 three-dimensional box glyph,
 * byte-identical `d` path (`M10.0003 1.6665…`) and byte-identical
 * `fill="#5D5A88"`, differing in nothing but their position. The footer's
 * "Connect" column is the only evidence of what they stand for, and it names
 * them GitHub, LinkedIn, X — in that order, which is the reverse of the order
 * used here. The order below follows the header's, since the header is the
 * primary instance; see docs/DESIGN_SYSTEM.md §9.
 *
 * The real network glyphs are substituted for the placeholder cubes, on the
 * design's own glyph colour `#5D5A88` and 40 × 40 `#F3F4F6` tile — the values
 * the updated navbar snippet (2026-10-08) actually carries. The design's
 * `#5D5A88` is confirmed as the intended glyph colour by its use on all three
 * tiles.
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

/** The header call to action: "Let's Build" (the updated navbar snippet). */
export const ctaLabel = "Let’s Build";

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

/**
 * Options for the contact form's topic selector.
 *
 * OWNER-ALIGNED 2026-10-13: the old list ("Web Design", "Brand Development",
 * "Technical Writing", "Marketing Services"...) matched the frame's superseded
 * service set. The six primaries now paraphrase the owner-supplied services
 * verbatim (see `src/content/services.ts`), "Technology Consulting & Training"
 * is the one secondary service a technical enquiry is likely to be, and
 * "Something else" is the catch-all. No invented options.
 */
export const contactTopics: string[] = [
  "Custom Software Development",
  "Backend & API Engineering",
  "MVP & SaaS Development",
  "DevOps & Application Deployment",
  "AI & Automation",
  "IoT & Embedded Prototyping",
  "Technology Consulting & Training",
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
