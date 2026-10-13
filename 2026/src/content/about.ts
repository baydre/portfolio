/**
 * About page content.
 *
 * PROVENANCE HAS CHANGED FOR THIS PAGE. `AGENTS.md` §3 lists About among the
 * screens with no design, built on assumptions. That is no longer true: the
 * AboutPage frame has been supplied, and this file is transcribed from it. The
 * two assumptions the old page carried — an invented biography and a fake
 * `+234**********` phone number — are gone rather than corrected, because the
 * frame simply does not contain them.
 *
 * Every value below is one of:
 *
 * - **verbatim** from the About frame (the biography, the four role labels, the
 *   section headings, the portrait);
 * - **owner-supplied** (the tool list and the per-role technology lists, which
 *   REPLACE frame content — see `aboutSkillRoles`; and the social row's three
 *   networks — see `aboutSocialLinks`);
 * - **PLACEHOLDER** (the contact card's three labels — see `aboutContact`).
 *
 * Nothing else. Per AGENTS.md §4, a placeholder must be recognisable as one.
 */

import portraitAsset from "../assets/profile.svg";
import type { ContactRow, SkillRole, SocialLink } from "./types";

/**
 * The portrait card: 421 × 475, the frame's own left column.
 *
 * `src/assets/profile.svg` is the frame's SVG, and it is only the PHOTO — a
 * base64 JPEG inside a `<pattern>`, behind one 421 × 475 `rx-4` rect. The
 * vector text the frame draws over it ("YASIR MUSA", "SOFTWARE ENGINEER",
 * "BAYDREAFRICA", and a blurred dark pill) is **not** in the file, so it is not
 * reproduced. Inventing an overlay to match a frame nobody can open would be a
 * worse outcome than rendering the photo the owner actually supplied; if the
 * overlay is wanted it needs its own asset.
 *
 * The alternative in the repository, `53f92258…png`, is the AboutMe SCREENSHOT
 * that the previous page used — a picture of the old page, not a portrait. It
 * is deliberately not referenced here.
 */
export const aboutPortrait = {
  src: portraitAsset,
  width: 421,
  height: 475,
  /**
   * The photograph is the only content of the card, and nothing in the frame
   * names the person in it, so the alt is empty: decorative. Supply real
   * alternative text before launch — see docs/DESIGN_SYSTEM.md §9.
   */
  alt: "",
} as const;

/**
 * PLACEHOLDER — the contact card that overlays the portrait's bottom-left corner.
 *
 * THE CARD IS REAL; ITS THREE LABELS ARE NOT. The owner asked for this card on
 * 2026-09-26 and supplied the frame's own markup, in which the card is drawn
 * inside `profile.svg`'s coordinate space as a 304 × 104 glass panel at `y=371`
 * holding three rows — phone, email, location. Two consequences:
 *
 * - **The labels below are the frame's placeholder strings, transcribed verbatim.**
 *   "Phone Number" / "Email Address" / "Location" is what the design draws, so
 *   showing them is faithful; inventing a plausible-looking number instead would
 *   not be, and would be the exact failure this file already corrected once
 *   (the old page's masked `+234**********`).
 * - **No row has an `href`, and that is the enforcement.** `ContactRow.href` is
 *   optional precisely so that a placeholder cannot become a link: a `tel:` to a
 *   made-up number dials a stranger, and a `mailto:` to a placeholder bounces mail
 *   to nobody. Supply the real values and add `tel:` / `mailto:` here; the card
 *   component links a row the moment an `href` is present and renders it as plain
 *   text until then. No component change is needed.
 *
 * **What is still unknown:** every one of the three actual values — the phone
 * number, the email address, and the location. None appears anywhere in the
 * repository, and none may be derived from the other site content: the footer
 * carries a location string, but that is the business's location for the Contact
 * section, not a claim about where this person can be reached. See
 * docs/DESIGN_SYSTEM.md §9.
 */
export const aboutContact: ContactRow[] = [
  { field: "phone", label: "Phone Number" },
  { field: "email", label: "Email Address" },
  { field: "location", label: "Location" },
];

/**
 * The biography. Four paragraphs.
 *
 * **REWRITTEN 2026-10-13.** The frame's copy was transcribed verbatim until the
 * factual-integrity pass, at which point its loaded claims were unverifiable
 * ("A Software Developer With A Passion For...", "Modern Technologies Like
 * React, Node.Js, And TypeScript", "several Web Applications — From Ecommerce
 * Platforms To Payment Systems"). The owner approved a DIRECTION for the
 * replacement — introduce the person as a technologist/software engineer, show
 * the engineering approach with evidence from the public work, name AI,
 * robotics, IoT and prototyping as areas of EXPLORATION, and close with a
 * commitment to learning and building. The draft below follows that direction;
 * every concrete claim cites something in this repository (the owner-supplied
 * skill roles, tools, and the public project repositories), and nothing stated
 * as experience rather than exploration is unverified.
 *
 * Kept from the frame: the four-sentence shape (four paragraphs, no `<br/>`,
 * no CSS `capitalize`).
 */
export const aboutBio: string[] = [
  "I'm Yasir — a technologist and software engineer who builds software, systems, and digital products aimed at practical problems.",
  "My engineering work is out in the open: backend services and APIs in Python and FastAPI, a digital-wallet backend and a dual authentication system, deployment workflows on Docker and NGINX, and a zero-downtime blue/green strategy that routes traffic through an intelligent reverse proxy.",
  "I also explore robotics, IoT, and embedded systems — Raspberry Pi, Arduino, NVIDIA Jetson, and KiCad appear in my experiments — and I prototype early ideas with AI-assisted development.",
  "I stay committed to learning and building useful technology, and this portfolio grows with me: new projects, experiments, and disciplines stay welcome as they emerge.",
];

/**
 * The Tools row — owner-supplied 2026-09-26, extended to seven 2026-09-26.
 *
 * The frame's Tools row is FIVE tiles that all read "React.js" with the same
 * glyph, which is the same placeholder defect as the Work cards' "Built with"
 * panel (`src/content/projects.ts`). The frame therefore supplies no tool
 * information at all, and the list below is the owner's, replacing it.
 *
 * **SEVEN entries, and the row no longer matches the frame's five slots.** The
 * count grew after the frame was transcribed, so the tile basis in
 * `ProfileSection` moved from 5-across to 4-across: 5-across would have stranded
 * two tiles on a second row, and 4 gives 4 + 3. The block is still capped at
 * `--size-about-tools` (620px), which is unchanged and still the frame's width —
 * the row got denser, not wider, and the tiles are now 137px rather than 105px,
 * which is the first point at which "Git & GitHub" fits on one line.
 *
 * Order is the owner's and is significant: `FastAPI` sits directly after `Python`
 * as a pair, and `KiCad` is last.
 *
 * `AI` was here until 2026-09-26 and was replaced by `KiCad` on the owner's
 * instruction. That swap also removed the last entry with no brand mark, so every
 * tool here has a real one and `TechIcon` has no metaphor tier left.
 *
 * All seven marks come from simple-icons. KiCad's was first inlined from an
 * owner-supplied `kicad.svg`, which proved byte-identical to `siKicad.path`.
 */
export const aboutTools: string[] = [
  "Python",
  "FastAPI",
  "Django",
  "React",
  "Git & GitHub",
  "Linux",
  "KiCad",
];

/**
 * The three block headings, verbatim from the frame except where noted.
 *
 * These were inline literals in `ProfileSection` until 2026-09-26, which broke
 * `AGENTS.md` §4's "separate content from presentation" for the one piece of
 * copy on the page most likely to be reworded. They moved here when the owner
 * renamed the third one.
 *
 * **`skills` is `OWNER OVERRIDE`.** The frame reads "Services", which was
 * accurate when its four cards were languages but not once they became roles —
 * a role is a capability, not a service being sold. The owner renamed it to
 * "Technical Skills" 2026-09-26.
 */
export const aboutHeadings = {
  /** Also the page's only `h1`; see `ProfileSection`. */
  about: "About me",
  tools: "Tools",
  skills: "Technical Skills",
} as const;

/**
 * The Technical Skills block: four skill ROLES, owner-supplied 2026-09-26.
 *
 * The frame's own four entries are LANGUAGES — JavaScript, TypeScript, Python,
 * Golang — each drawn as a single 120 × 120 brand logo under a `01`–`04`
 * index. The owner replaced those with roles, and the owner's own preferred
 * labels are the `title`s below (they drafted longer ones and shortened these
 * four).
 *
 * **The logo slot does not survive the change.** A role has no single glyph, so
 * the 120 × 120 artwork is replaced by `stack` — the technologies the role
 * actually uses — as one comma-joined line. That is a structural departure from
 * the frame and it is deliberate: keeping a logo box would mean attaching a
 * technology's mark to a role that is not that technology.
 *
 * The frame's `01`–`04` indices are kept as authored. The block's heading is not
 * — see `aboutHeadings`.
 *
 * Note the frame's stack does not agree with the biography: the biography says
 * TypeScript, and no role lists it. That is still true after the owner's
 * 2026-09-27 amendments below, and is still left for them to reconcile — copy is
 * the owner's, not this file's. Those amendments are additions only: no entry
 * was removed, reordered against the owner's instruction, or reworded.
 */
export const aboutSkillRoles: SkillRole[] = [
  {
    index: "01",
    title: "Backend Engineering",
    // **Amended by the owner 2026-09-27**, twice the same day. C was added
    // first, then moved behind Python at the owner's request, so the settled
    // order is C second — the mark follows `stack[0]` and is Python again. See
    // `ProfileSection`: a role's mark is its own FIRST technology, so the logo
    // tracks this ordering rather than being pinned to a language independently
    // of it. `C` keeps its entry in the `TechIcon` registry either way, so the
    // "every role's mark resolves" guard holds if the order is revisited.
    stack: [
      "Python",
      "C",
      "Django",
      "FastAPI",
      "REST APIs",
      "PostgreSQL",
      "Unit testing",
    ],
  },
  {
    index: "02",
    title: "Full-Stack Development",
    stack: ["React", "JavaScript", "Vite", "Tailwind CSS", "API integration"],
  },
  {
    index: "03",
    title: "DevOps & Cloud",
    // CI/CD inserted after Linux, owner 2026-09-27. Unlike the C change this one
    // does NOT move the mark: `stack[0]` is still Linux, so the DevOps tile keeps
    // the Tux glyph. "GitHub Actions" is left where it was rather than folded
    // into the new entry — they are the tooling and the practice, and the owner
    // asked to add a term, not to merge two.
    stack: [
      "Linux",
      "CI/CD",
      "GitHub Actions",
      "NGINX",
      "Docker",
      "VPS/cloud deployment",
    ],
  },
  {
    index: "04",
    title: "IoT & Embedded Systems",
    stack: [
      "Raspberry Pi/Compute Module",
      "Arduino",
      "NVIDIA Jetson",
      "sensors",
      "embedded Linux",
      "KiCad",
    ],
  },
];

/**
 * The About social row: Instagram, Discord, YouTube — the owner's replacement
 * set, supplied 2026-10-08 and amended 2026-10-09.
 *
 * A SEPARATE list from `profile.socialLinks`, which serves the header and
 * footer. The two genuinely differ, so sharing one array would have been wrong:
 * the card's three above are About-only, while the header/footer row is the
 * design's LinkedIn / GitHub / X.
 *
 * The row WAS LinkedIn, X, Instagram, GitHub, YouTube — two owner-confirmed
 * (LinkedIn, X), two owner-supplied (Instagram, YouTube) and one inherited guess
 * (GitHub). On 2026-10-08 the owner replaced the whole set with Facebook,
 * Instagram, Telegram, Discord, YouTube. **On 2026-10-09 the owner removed
 * Facebook and Telegram** (their tiles are gone and so are their glyph keys —
 * see `content/types.ts`), leaving Instagram, Discord, YouTube.
 *
 * STATUS of the three:
 *
 * - **Instagram** — live, `https://instagram.com/baydre_africa`, owner-supplied
 *   2026-09-26. Bare host, exactly as given.
 * - **YouTube** — live, `https://www.youtube.com/@bay_dre`, owner-supplied
 *   2026-09-26. The `@bay_dre` handle is the owner's, and is spelled exactly as
 *   given: it is NOT the `baydre_africa` of the other networks. It stays ABOUT
 *   ONLY — the header and footer must not pick it up.
 * - **Discord** — the owner supplied the username **`@baydre_africa`** on
 *   2026-10-09. A Discord USERNAME is not a URL: Discord links profiles by
 *   numeric user ID (`https://discord.com/users/<id>`) and servers by invite
 *   (`https://discord.gg/<code>`), so there is no linkable value to store.
 *   `href` therefore stays empty and `unverified` stays flagged, and the tile
 *   renders INERT ("link not confirmed yet") rather than as a relative link to
 *   `@baydre_africa` — the exact "link to nowhere" the repo refuses to ship
 *   (see `ContactRow.href` and AGENTS.md §4). The handle is recorded here, not
 *   guessed around; supplying an invite link or a user ID turns the tile into a
 *   live link with no component change.
 *
 * `unverified` is a review flag throughout, not a render flag: what renders a tile
 * inert is an EMPTY `href`. See `content/types.ts`.
 */
export const aboutSocialLinks: SocialLink[] = [
  {
    network: "instagram",
    label: "Instagram",
    // Owner-supplied 2026-09-26. Bare host, exactly as given — not normalised to
    // `www.`, which the owner did not write and which this site's other social
    // URLs do not use either.
    href: "https://instagram.com/baydre_africa",
  },
  {
    network: "discord",
    label: "Discord",
    // Owner-supplied handle `@baydre_africa` (2026-10-09). Not linkable as a
    // username — see the STATUS note above — so `href` is empty and the tile
    // renders inert rather than pointing at a relative path.
    href: "",
    unverified: true,
  },
  {
    network: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@bay_dre",
  },
];

