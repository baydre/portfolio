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
 *   section headings, the social networks, the portrait);
 * - **owner-supplied** 2026-09-26 (the tool list and the per-role technology
 *   lists, which REPLACE frame content — see `aboutSkillRoles`);
 * - **PLACEHOLDER** (the contact card's three labels — see `aboutContact`);
 * - **ASSUMED** (the closing call-to-action, which the frame does not contain at
 *   all — see `aboutCta`).
 *
 * Nothing else. Per AGENTS.md §4, a placeholder must be recognisable as one, so
 * the assumed block is labelled in its own docstring rather than presented as
 * design copy.
 */

import portraitAsset from "../assets/profile.svg";
import type { ContactRow, NavItem, SkillRole, SocialLink } from "./types";

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
 * The biography. Four paragraphs, verbatim from the frame.
 *
 * These sentences were already in the repository, hardcoded in `AboutPage`, and
 * they match the frame word for word — so this is a PROVENANCE UPGRADE, not new
 * copy: what was invented is now transcribed.
 *
 * Two details the frame gets wrong, and what is done about them:
 *
 * 1. **No CSS `capitalize`.** The frame applies Tailwind's `capitalize` to this
 *    run, but the text is ALREADY in title case in the source string — every
 *    word's first letter is capitalised. `capitalize` would therefore be a no-op
 *    on the words and would additionally force a capital after every apostrophe
 *    and hyphen, so "I'm" survives but "User-Friendly" and any lowercase
 *    technical term the owner later adds would be silently rewritten. The
 *    string is stored as authored and capitalisation is left to the copy.
 * 2. **Paragraphs, not `<br/>`.** The frame joins the four sentences with
 *    `<br/>`, i.e. it hardcodes line breaks at one viewport width. They are four
 *    separate sentences and read as four paragraphs, so they are four elements;
 *    a `<br/>` at 375px would strand a line.
 */
export const aboutBio: string[] = [
  "Hi, I'm Yasir — A Software Developer With A Passion For Building Clean, Efficient, And User-Friendly Experiences.",
  "I'm A Results-Driven Software Developer Who Enjoys Creating Seamless User Interfaces Using Modern Technologies Like React, Node.Js, And TypeScript.",
  "Over The Past Few Years, I've Worked On Several Web Applications — From Ecommerce Platforms To Payment Systems — Focusing On Performance, Accessibility, And Visual Clarity.",
  "Outside Of Coding, I'm Passionate About Design And Product Thinking, Which Helps Me Collaborate Better With Designers And Understand User Needs More Deeply.",
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
 * TypeScript, and no role lists it. Both are left exactly as supplied. Copy is
 * the owner's to reconcile, not this file's.
 */
export const aboutSkillRoles: SkillRole[] = [
  {
    index: "01",
    title: "Backend Engineering",
    stack: ["Python", "Django", "FastAPI", "REST APIs", "PostgreSQL"],
  },
  {
    index: "02",
    title: "Full-Stack Development",
    stack: ["React", "JavaScript", "Vite", "Tailwind CSS", "API integration"],
  },
  {
    index: "03",
    title: "DevOps & Cloud",
    stack: ["Linux", "GitHub Actions", "NGINX", "Docker", "VPS/cloud deployment"],
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
 * The About social row: LinkedIn, X, Instagram — in the frame's order.
 *
 * A SEPARATE list from `profile.socialLinks`, which serves the header and
 * footer. The two genuinely differ, so sharing one array would have been wrong:
 *
 * - The frame's row has no YouTube, and `socialLinks` does not either.
 * - The frame's row has Instagram, which appears in neither the header nor the
 *   footer.
 *
 * The frame also orders its tiles differently from the footer's Connect column,
 * and the frame's order is followed here because this row is the primary
 * instance of itself.
 *
 * **THE ROW IS NOW FIVE TILES AGAIN, BUT NOT THE FRAME'S FIVE.** It was three
 * from 2026-09-26 until later the same day, when the owner asked for GitHub and
 * YouTube to be added to the profile card. So the count matches the frame's by
 * coincidence, and the contents do not: the frame drew four networks plus a
 * phone, and this row is three of those networks, GitHub, and YouTube. Still not
 * rendered:
 *
 * - **Behance.** No confirmed URL, and `behance` has been removed from the
 *   `SocialNetwork` union and from `common/icons.tsx` rather than left as an
 *   unused glyph — it had no other consumer, and the header and footer rows do
 *   not include Behance. Re-adding it is a one-line data change plus the glyph.
 * - **The phone tile.** The frame's fifth tile is not a network at all: its two
 *   half-paths meet on a vertical centre line, which draws a handset. It is
 *   where the old page's fake `+234**********` row used to live. No number was
 *   ever supplied, so the tile is gone rather than left inert and empty. The
 *   phone now appears where the frame actually put contact details — inside
 *   `aboutContact`'s card, over the portrait — not as a social tile.
 *
 * * **Instagram and YouTube URLs are owner-supplied 2026-09-26** and both tiles are
 * therefore live:
 *
 * - **LinkedIn, X** — live, owner-confirmed 2026-09-26.
 * - **Instagram** — live, `https://instagram.com/baydre_africa`, owner-supplied
 *   2026-09-26. This clears the `unverified` flag it carried while guessed, and
 *   with it the last of the row's inert tiles except YouTube's predecessor.
 * - **YouTube** — live, `https://www.youtube.com/@bay_dre`, owner-supplied
 *   2026-09-26. The `@bay_dre` handle is the owner's, and is spelled exactly as
 *   given: it is NOT the `baydre_africa` of the other networks, so it is stored
 *   verbatim rather than "corrected" to match them.
 * - **GitHub** — live, and STILL flagged `unverified`. The owner supplied Instagram
 *   and YouTube but not a GitHub address, so the inherited guess stands. Its
 *   `href` is reused verbatim from `profile.socialLinks`, so the card and the
 *   header/footer row cannot drift; confirming it clears the flag in both files.
 *
 * `unverified` is a review flag throughout, not a render flag: what renders a tile
 * inert is an EMPTY `href`. See `content/types.ts`.
 */
export const aboutSocialLinks: SocialLink[] = [
  {
    network: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/yasir-musa-baydre-africa",
  },
  {
    network: "x",
    label: "X",
    href: "https://x.com/baydre_africa",
  },
  {
    network: "instagram",
    label: "Instagram",
    // Owner-supplied 2026-09-26. Bare host, exactly as given — not normalised to
    // `www.`, which the owner did not write and which this site's other social
    // URLs do not use either.
    href: "https://instagram.com/baydre_africa",
  },
  {
    network: "github",
    label: "GitHub",
    // The same value, and the same `unverified` flag, as `profile.socialLinks`.
    // One address in two places, not two independent guesses. STILL A GUESS: the
    // owner gave Instagram and YouTube on 2026-09-26 and no GitHub address.
    href: "https://github.com/baydre",
    unverified: true,
  },
  {
    network: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@bay_dre",
  },
];

/**
 * ASSUMED — the closing call-to-action. NOT IN THE DESIGN.
 *
 * The frame ends at the skill roles. This block is the previous page's, kept on
 * the owner's instruction 2026-09-26 ("keep this for now"), and it carries three
 * things the design never had: a gradient panel, a heading, and a body
 * paragraph. None of that copy is transcribed from any frame.
 *
 * Two corrections were made to the markup while keeping the block:
 *
 * - "Connect on Twitter" → **"Connect on X"**. The design renamed the network
 *   to X everywhere it appears — the footer Connect column, the header tiles —
 *   and this was the last place still saying Twitter.
 * - Both actions are now real destinations (`/#contact` and the confirmed X
 *   profile) rather than `<button>`s with no handler, and they reuse `Button`
 *   rather than hand-rolled classes.
 *
 * The gradient is `from-secondary to-accent`, both of which theme.css marks
 * DERIVED because no panel in the HomePage snippet uses them. Treat the whole
 * block as unapproved until a frame exists for it.
 */
export const aboutCta = {
  title: "Let's Build Something Great Together!",
  /**
   * Two paragraphs, not one string: the owner asked on 2026-09-26 for the "If …"
   * sentence to start on the second line, and then that the space between the two
   * be reduced — the section's own `gap-8` put 32px there, which on top of a
   * 40px line box read as a 72px void. Rendered as two `<p>`s rather than a
   * `<br/>` for the same reason the biography uses five — a hardcoded break only
   * lands where the author measured it, while paragraphs reflow. The gap is
   * `gap-2` on a wrapper div in `AboutPage`, not on the section, so the heading
   * and the actions keep their `gap-8`. The copy is unchanged; only where it
   * breaks and how far it sits from the line above.
   */
  body: [
    "I'm open to collaborations, new opportunities, and exciting projects.",
    "If you're looking for a developer who blends technical expertise with UX thinking — let's connect.",
  ],
  /**
   * A full `NavItem`, not a bare path, so `SmartLink` can render it and so the
   * label and the destination cannot drift apart the way two separate fields
   * would let them. `/#contact` is an in-page anchor, which the union models.
   */
  primary: {
    kind: "anchor",
    to: "/#contact",
    label: "Contact me",
  } satisfies NavItem,
  /**
   * NOT a `NavItem`. That union deliberately models only the site's own routes
   * and its in-page fragments — `SmartLink`'s docstring gives the reason, and an
   * external profile is a third thing: it leaves the site and opens a new tab.
   */
  secondary: { href: "https://x.com/baydre_africa", label: "Connect on X" },
} as const;
