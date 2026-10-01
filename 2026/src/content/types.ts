/**
 * Content types for the site.
 *
 * Portfolio copy lives in `src/content/`, never inside components or pages —
 * see docs/ARCHITECTURE.md. Components take these as props so they can be
 * rendered from any source (static data, a CMS, or a future API).
 */

/**
 * The networks the site can link to.
 *
 * `linkedin` / `github` / `x` are the header-and-footer set, taken from the
 * design's "Connect" column. `instagram` and `youtube` are **About-page only**:
 * the About frame draws Instagram, the owner added YouTube to the profile card on
 * 2026-09-26, and neither the header nor the footer carries them. They are in the
 * union rather than a separate type because the GLYPH is shared — only the tile
 * geometry and the data that selects it differ between the two rows, and that
 * lives in the components.
 *
 * Being in this union is not what puts a network on a page. `SocialNetwork` is a
 * glyph key; membership in `socialLinks` (header/footer) or `aboutSocialLinks`
 * (profile card) is what renders one. YouTube is the case that keeps the two
 * apart: it is here, and it is deliberately absent from `socialLinks`.
 *
 * Behance — which the frame drew but which was dropped from the row on the
 * owner's instruction 2026-09-26 — is not in this union at all.
 */
export type SocialNetwork = "linkedin" | "github" | "x" | "instagram" | "youtube";

export interface SocialLink {
  /** Network identifier, used to select the icon. */
  network: SocialNetwork;
  /** Human-readable name. Used for the accessible label. */
  label: string;
  href: string;
  /**
   * True when `href` is still a guess rather than a confirmed profile URL.
   *
   * A review flag, not a render flag: it keeps guessed URLs greppable and obvious
   * in review. What renders a tile inert is an EMPTY `href` — a `<span>` rather
   * than an `<a>` — so a network with no known destination never becomes a link to
   * nowhere. An unverified entry with a real-looking `href` renders as a link, and
   * that is deliberate: `https://github.com/baydre` is the same guess in
   * `socialLinks` and `aboutSocialLinks`, and having one live and the other dead
   * would be the actual inconsistency.
   */
  unverified?: boolean;
}

/** The three rows of the profile card's contact card. */
export type ContactField = "phone" | "email" | "location";

export interface ContactRow {
  /** Which row this is, and which glyph it gets. */
  field: ContactField;
  /** The visible text. */
  label: string;
  /**
   * The destination, for the two rows that can have one: `tel:` for phone and
   * `mailto:` for email.
   *
   * **Optional on purpose.** A location is not a link, and a placeholder must not
   * be one either — `href` is absent until the owner supplies a real value, so
   * `tel:+000` and `mailto:placeholder` can never ship. Absent means plain text.
   */
  href?: string;
}

/**
 * The location / reply copy the design repeats in BOTH the Contact frame and the
 * footer — see docs/DESIGN_SYSTEM.md §9.
 *
 * Modelled as two parts rather than one string, and the split is deliberately
 * placed as LATE as possible: only the duration is atomic.
 *
 * The en-dash in "24–48" is a legal line-break point (UAX #14 class BA), so the
 * phrase was splitting as "24–" / "48 hours" and an NBSP could not have stopped
 * it — the phrase has to be an element that cannot wrap. But an earlier version
 * put `whitespace-nowrap` on the whole 52-character response-time SENTENCE, and
 * that over-corrected: at ~348px inside a ~397px column it could never join the
 * preceding line, so the paragraph was pinned to three lines. Narrowing the
 * atomic unit to the 11-character duration lets the sentence flow again.
 */
export interface LocationCopy {
  /**
   * Everything up to the duration, as one continuous run of text. Wraps freely
   * at word boundaries — the design's own wording, unbroken.
   */
  lead: string;
  /**
   * The duration alone, e.g. "24–48 hours." Held together by
   * `whitespace-nowrap` so it can never split.
   */
  duration: string;
}

/**
 * A navigation destination.
 *
 * The design is explicit that Work, Services and Contact are SECTIONS OF THE
 * HOMEPAGE, not pages: the footer's Navigate column lists all four as Home
 * sections, and no other screen in the Figma file has its own work or contact
 * listing. The header therefore links to `/work` and `/contact` in the supplied
 * snippet only because Figma Make emits every nav item as a `<button>`; the
 * intended behaviour is an in-page anchor.
 *
 * Modelled as a discriminated union rather than one optional-`hash` field so
 * the router cannot be handed an anchor where it expects a path, and vice versa.
 */
export type NavItem =
  /** A route handled by the router. */
  | { label: string; kind: "route"; to: string }
  /**
   * A path with a fragment, e.g. `/#work`.
   *
   * The path is always present rather than omitted, because these anchors are
   * shared across pages: the header and footer render on `/about` too, where
   * `/#work` must still resolve back to the homepage section.
   */
  | { label: string; kind: "anchor"; to: `${string}#${string}` };

export interface Profile {
  /** Wordmark. Rendered as the page's only level-1 heading. */
  /**
   * The wordmark, used by BOTH the hero and the footer wordmark.
   *
   * The design set the footer's copy as a distinct lowercase "baydre_africa", so
   * it used to be a separate `footerName` field. Owner-corrected 2026-09-26 to
   * match the hero, which made the second field a duplicate string that could
   * only ever drift — so the footer now reads this one field.
   */
  name: string;
  /** Short positioning line, set in the display face. */
  tagline: string;
  /** Supporting paragraph beside the tagline. */
  description: string;
  email: string;
  /** Full-bleed hero image. Replace once the real asset is supplied. */
  heroImage: HeroImage;
  /** Text alternative for the hero image. */
  heroImageAlt: string;
  /** Footer strapline above the wordmark, e.g. "Developer & Designer". */
  role: string;
  /** Disciplines listed beside the role, e.g. Software / Web / Brand. */
  disciplines: string[];
  /** Availability note in the footer. */
  availability: string;
  /**
   * Right-hand credit in the copyright bar. The design shows a personal name
   * here; see docs/DESIGN_SYSTEM.md §9 — it is reproduced verbatim because it is
   * in the design, but it is a credit line, not a copyright holder.
   */
  credit: string;
}

export interface HeroImage {
  src: string;
  /**
   * Width-descriptor list for `srcset`, so the browser fetches one derivative
   * sized to the device instead of the largest one committed. The hero sits in a
   * content column capped at 1272px, so 1280w is the 1x answer.
   *
   * Optional: `heroImageAlt` and the placeholder that preceded it had no
   * `srcset`, and a missing one must not become a hard requirement.
   */
  srcSet?: string;
  /** Intrinsic size of the SOURCE image, used to reserve the box before load. */
  width: number;
  height: number;
}

/* ------------------------------------------------------------- About page */

/**
 * One of the four technical skill ROLES in the About page's Services block.
 *
 * The frame supplies a numbered, 2 × 2 grid, but its own four entries are
 * languages (JavaScript, TypeScript, Python, Golang) drawn as single 120 × 120
 * brand logos. Owner-supplied content 2026-09-26 replaced those with roles that
 * each name a set of technologies, so the logo slot cannot survive the change:
 * a role has no single glyph. `stack` carries the per-role technology list and
 * is what the logo used to stand in for.
 *
 * `index` is the frame's own `01`–`04`, kept as content rather than derived from
 * position, for the same reason `Service.index` is — the numbering is a motif
 * the design draws by hand.
 */
export interface SkillRole {
  /** The frame's own index label, e.g. "01". */
  index: string;
  /** Short role name, e.g. "Backend Engineering". */
  title: string;
  /**
   * Technologies used in this role, in the owner's order.
   *
   * Comma-joined into one paragraph rather than rendered as a list: the frame's
   * card holds a single line of copy under the title, and a bulleted list would
   * add structure the design does not have.
   */
  stack: string[];
}

/* ------------------------------------------------------------------ Services */

/**
 * One entry in the Services grid.
 *
 * The design numbers these `01`–`06` and lays them out 3×2. `index` is the
 * authored number, not a position, so the order is content-controlled. The
 * frame prefixes them `//`; those slashes were dropped on owner request
 * 2026-09-26, matching `SkillRole.index` above and the About frame.
 */
export interface Service {
  /** The design's own index label, e.g. "01". The frame's `//` prefix is dropped — see above. */
  index: string;
  title: string;
  /**
   * OPTIONAL while the verbatim copy is pending — see `services.ts`. The design
   * supplies one per service; the section omits the paragraph when empty rather
   * than rendering a placeholder.
   */
  description?: string;
}

/* ------------------------------------------------------------------ Projects */

/**
 * A project, as shown in the Work section and on its own detail page.
 *
 * Naming: the application calls these "projects" and the route is
 * `/projects/:projectId`. "Product Page" is the design file's term for the same
 * screen. Owner-confirmed 2026-09-26 — do not rename to "product".
 */
export interface Project {
  /** URL segment. Must be unique — it is the `/projects/:projectId` param. */
  id: string;
  title: string;
  /** Short discipline label, e.g. "Product". */
  category: string;
  /**
   * Card artwork.
   *
   * OPTIONAL because the design's four work images (`/Frame1539.png` and its
   * three siblings) are not in the repository, and every image that IS present is
   * already claimed by another page. The previous data reused the AboutMe
   * screenshot as a project image, which is why it is not repeated here.
   * `ProjectCard` renders a neutral placeholder panel carrying the project's
   * index label when this is absent.
   */
  image?: string;
  /** Text alternative. Empty string marks the image as decorative. */
  imageAlt?: string;
  /** Card copy in the Work section. */
  summary: string;
  /** Tools named in the "Built with" tile row. */
  stack: string[];
  /**
   * The design's "Project code" panel: a short code excerpt.
   *
   * OPTIONAL because the supplied HomePage snippet omits the panel on the first
   * card only, which reads as an authoring inconsistency rather than a
   * distinction. A project without this renders the panel-less layout.
   */
  codeSample?: string;
  /**
   * Marked true while the entry still carries placeholder content. The Work
   * section renders a visible "Provisional" badge for these, so unfinished
   * content is recognisable in the UI and in review rather than passing as
   * finished. Owner-confirmed 2026-09-26.
   */
  /**
   * The content is structurally complete but not final.
   *
   * Owner-confirmed 2026-09-26: the *pill* that used to render this is removed
   * at the owner's request — it polluted the card's title row, which the design
   * gives to exactly two elements, the title and the `01` label. The flag
   * stays, because `ProjectPage` still uses it to print the placeholder notice in
   * prose, and the reason for each project lives in `projects.ts`.
   */
  provisional?: boolean;
  /** External repository, if public. */
  repositoryUrl?: string;
  /** Live deployment, if public. */
  liveUrl?: string;
  /**
   * The case-study body, rendered on the detail route.
   *
   * Optional as a whole: the Product Page snippet has not been supplied and no
   * project has Challenge/Solution copy, so this is absent today. `ProjectPage`
   * renders a block only when the corresponding field is present.
   */
  detail?: ProjectDetail;
}

/* ------------------------------------------------------- Project detail page */

/**
 * The case-study body of a Project detail page.
 *
 * The design's Product Page frame has four blocks: Description, Stack & Tools,
 * The Challenge, The Solution. Every field is optional so a provisional project
 * can render without inventing copy — `ProjectDetail` reports which blocks are
 * present and the page omits the rest.
 */
export interface ProjectDetail {
  /** "Description" block. */
  description?: string;
  /** "Stack & Tools" block. Extends the card's `stack` when richer. */
  tools?: string[];
  /** "The Challenge" block. */
  challenge?: string;
  /** "The Solution" block. */
  solution?: string;
}
