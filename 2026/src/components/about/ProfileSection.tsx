import { Mail, MapPin, Phone } from "lucide-react";
import {
  aboutBio,
  aboutContact,
  aboutHeadings,
  aboutPortrait,
  aboutSkillRoles,
  aboutSocialLinks,
  aboutTools,
} from "../../content/about";
import type { ContactField } from "../../content/types";
import { SocialIcon } from "../common/icons";
import { TechIcon } from "../common/TechIcon";
import { TechTile } from "../common/TechTile";

/**
 * The About page's profile section.
 *
 * Source: the AboutPage frame — a two-column block, portrait and social tiles on
 * the left, and on the right three stacked blocks: "About me" with the
 * biography, "Tools", and "Technical Skills".
 *
 * ## The frame's geometry is reproduced as a two-column flex row, not a grid
 *
 * The frame wraps everything in `inline-flex` with a 40px gap, and its right
 * column is `flex-1`. The 40px gap is `--space-profile-col-gap`. The columns
 * then resolve exactly as the frame draws them: 421px portrait + 40px + 811px of
 * copy inside the 1272px content box.
 *
 * `items-start` and not `stretch`: the frame's left column is much shorter than
 * the right one, and stretching it would push the social row to the bottom of
 * the section instead of leaving it 12px under the portrait, where the frame
 * draws it.
 *
 * ## Three things the frame gets wrong
 *
 * 1. **`w-96`.** The Tailwind export sizes the portrait column `w-96` = 384px,
 *    but the frame's own SVG is `width="421"`. 421 is authored and 384 is the
 *    lossy read, so the column is `--size-portrait-w` and never `w-96`. At 1440
 *    the difference is 37px of copy width, which is more than a line of the
 *    biography.
 * 2. **`capitalize` on the biography.** Redundant — the text is already title
 *    case — and it would rewrite any lowercase technical term later added after
 *    an apostrophe or a hyphen. Dropped; see `content/about.ts`.
 * 3. **`<br/>` between the biography's four sentences.** Four hardcoded line
 *    breaks at one viewport width. They are four paragraphs and are rendered as
 *    four elements.
 *
 * ## The biography's paragraphs have NO gap between them
 *
 * The frame's `<br/>` means the sentences were separated by nothing but the
 * 32px line box, so that is reproduced exactly: four `<p>`s with no `gap` and no
 * margins, carrying `leading-lead` (32px). A paragraph break and a line wrap
 * therefore sit at the same 32px interval, which is what the frame shows. Adding
 * a gap would have looked like an improvement and been a fidelity change.
 *
 * ## "Technical Skills" holds roles, not logos
 *
 * The frame's four cards are a `01` index, a 120 × 120 brand logo, and a 20px
 * name. Owner-supplied content replaced the four languages with four roles, and
 * a role has no single glyph, so the logo slot became the role's technology list
 * — see `aboutSkillRoles` for why. The frame's 48px gaps between a card's parts
 * and between cards are kept, and the 2 × 2 grid becomes 1 column below `md`
 * because a 48px-gapped two-column grid cannot hold a six-item technology list
 * on a phone.
 */
export function ProfileSection() {
  return (
    <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-profile-col-gap">
      {/*
        STICKY, from `lg` up — owner request 2026-09-26, restoring the behaviour
        the previous placeholder `AboutPage` had on its sidebar card.

        The portrait and the social row travel together as one sticky unit, which
        is what the old card did; sticking the image alone would strand the social
        tiles halfway up the viewport.

        `top-24` (96px) clears `SiteHeader`, which is itself `sticky top-0` — the
        portrait must come to rest below it, not under it.

        Two things this depends on, both verified rather than assumed:

        - **No `overflow` on any ancestor.** `overflow: hidden` creates a scroll
          container, and a sticky element inside one that never scrolls simply
          does not stick. `container-site` sets only margin/width/max-width/
          padding, so the chain is clear.
        - **`items-start` on the parent, above.** Sticky is constrained by the
          containing block, so the flex item must be shorter than the flex
          container — which it is, because the right column is far taller. If the
          parent were `items-stretch` the left column would be as tall as the
          right one and there would be nothing to stick through.

        `lg` and up only: below that the two columns stack, the left column is no
        shorter than what follows it, and sticky would have nothing to do.
      */}
      <div className="flex w-full flex-col items-start gap-3 lg:sticky lg:top-24 lg:w-portrait-w lg:shrink-0">
        {/*
          `profile.svg` is the frame's own card and already carries its own 4px
          radius, so it is not re-rounded here. Width and height are set as
          attributes so the browser reserves 421 × 475 before the file loads —
          without them the whole right column reflows when the image arrives.

          The wrapper is `@container relative` for two reasons that both come from
          the contact card below: `relative` to anchor the card to this box rather
          than the page, and `@container` so the card can size itself in `cqw`
          against the PORTRAIT's width. A card with fixed px type would keep 15px
          labels while the portrait shrank to a phone's width, which is how the
          frame's own overlay becomes unreadable below `lg`.
        */}
        <div className="@container relative w-full">
          <img
            src={aboutPortrait.src}
            alt={aboutPortrait.alt}
            width={aboutPortrait.width}
            height={aboutPortrait.height}
            className="block h-auto w-full"
          />

          <ContactCard />
        </div>

        <AboutSocialRow />
      </div>

      <div className="flex w-full flex-1 flex-col items-start gap-12">
        {/* ---- About me ------------------------------------------------- */}
        {/*
          The h1, and the page's only one. The frame has no page title of its
          own — its three blocks are peers, and "About me" is simply the largest
          of them at 30px — so it is promoted to the page's level-1 heading, which
          is also what the previous page did with it and what `router.test.tsx`
          requires of every route.

          It is a plain `<div>` and not a `<section>`: a region labelled by the
          page's own title is not a section of the page, and `aria-labelledby`
          pointing an `<section>` at the `<h1>` misdescribes it.

          The frame's rule is `self-stretch` with `px-2.5 pb-2` — a full-width
          divider inset 10px from the heading's own left edge, sitting 8px under
          it. `border-rule` rather than a gray-200 literal, so it keeps the
          corrected divider value like every other rule in the project.
        */}
        <div className="flex w-full flex-col items-start gap-4">
          <h1
            id="about-heading"
            className="w-full border-b border-rule px-2.5 pb-2 text-about-heading leading-section text-white"
          >
            {aboutHeadings.about}
          </h1>

          {/*
            The biography copy, at **`--text-caption` (14px)**.

            The frame sets this `text-lg`, and this element has been walked down
            twice on the owner's instruction of 2026-09-26: 18 → 16 → 14. Each step
            landed on a value the scale already had, so no About-specific token was
            introduced and `--text-about-bio` is **deleted** rather than left
            declared — a second name for an existing size is a second place to
            change it. The same reasoning removed `--size-about-tools`.

            `--leading-lead` (32px) and `--tracking-about-bio` (0.1em) are
            unchanged, because only the size was asked for. That is now worth
            naming: **32px on 14px is a 2.29 line-height**, against the frame's
            1.78 at its own 18px, so the copy is now markedly airier than the
            frame and the tracking is 1.4px per character. `--leading-body` (1.6,
            i.e. 22.4px) is the natural companion if that is tightened next.

            The frame's colour is `text-white`; this is `--foreground` (`#e9e9ec`),
            which is what the rest of the page's copy uses.
          */}
          <div className="text-caption leading-lead tracking-about-bio text-foreground">
            {aboutBio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* ---- Tools ---------------------------------------------------- */}
        {/*
          `@container` on the block, not a viewport breakpoint: the frame fixes
          this block at 620px, so below `lg` the copy column narrows while the
          viewport may still be wide — between 1024px and 1164px a 620px block
          is only just fitting, and only a container query can see that. Same
          reason `ProjectCard`'s stack panel uses one.
        */}
        <section
          aria-labelledby="about-tools-heading"
          className="@container flex w-full flex-col items-start gap-2"
        >
          <h2
            id="about-tools-heading"
            className="text-about-section leading-about-section font-medium text-muted-foreground"
          >
            {aboutHeadings.tools}
          </h2>

          {/*
            ONE LINE of seven tiles, per the owner, 2026-09-26.

            This took two changes, because the frame's geometry could not
            accommodate it:

            1. **The 620px cap is gone.** `--size-about-tools` is the frame's own
               block width, authored for a FIVE-tile graphic that did not fill the
               copy column. Seven tiles inside 620px is 68px each, 44px after the
               tile's own `p-3` — `Git & GitHub` alone is wider, so every label
               would have wrapped to three lines inside a 32px icon slot. The
               block now fills the column, which is 811px at `lg`, giving 95px
               tiles and 71px of content. The token is removed rather than left
               unused, and `verify:geometry` no longer asserts it.
            2. **`flex-wrap` becomes `flex-nowrap` above 536px** — 7 x 56px tile +
               6 x 24px gap. Below that a single line is not physically possible,
               so the row keeps wrapping two-across, as it did before.

            The basis is `1/7` with `flex-1`, so the tiles divide the row exactly
            with no rounding gap at the end. Same technique as the Work stack
            panel.
          */}
          <ul className="flex w-full flex-wrap items-stretch gap-6 @[536px]:flex-nowrap">
            {aboutTools.map((tool) => (
              <li
                key={tool}
                className="flex basis-[calc((100%-1.5rem)/2)] flex-1 basis-1/7 flex-col items-center gap-2 @[536px]:basis-[calc((100%-9rem)/7)]"
              >
                <TechTile tool={tool} />
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Technical Skills ------------------------------------------ */}
        {/*
          A BLEND of the frame's own markup and the owner's role content, per the
          owner's instruction on 2026-09-26: apply the Figma snippet, and do not
          remove what is already here. The frame's snippet in full:

              self-stretch inline-flex flex-col justify-start items-start gap-3
                text-Neutral-Color-Color-200 text-base font-medium leading-6
                  "Technical Skills"
                self-stretch inline-flex justify-start items-center gap-36
                  flex-1 inline-flex flex-col justify-start items-end gap-8
                    self-stretch inline-flex justify-start items-center gap-12
                      flex-1 py-3 border-t border-Neutral-Color-Color-200
                            inline-flex flex-col justify-center items-center gap-6
                        text-white text-sm font-normal capitalize tracking-wider
                          "01"
                        w-44 flex flex-col justify-center items-center gap-2
                          size-28 → 120px logo
                          text-white text-xl font-normal capitalize
                            tracking-widest  "JavaScript"
                      … 02, then a second row of 03, 04

          ## What the frame supplied and this block now has

          | Frame      | Built                                    |
          | ---------- | ---------------------------------------- |
          | `gap-3`    | `gap-3` on the section — already matched |
          | Neutral-200 heading | `text-muted-foreground` (`#a8a7b0`) |
          | `font-medium` heading | `font-medium` — already matched |
          | `border-t` per tile, Neutral-200 | `border-t border-muted-foreground` |
          | `py-3` per tile | `py-3` |
          | tile `items-center` | `items-center` (was `items-start`) |
          | `gap-6` index → body | `gap-6` (was `gap-12`) |
          | index `text-sm` (14px) | `text-caption` — was `text-index` (16px) |
          | index `font-normal` | `font-normal` — was `font-medium` |
          | index `capitalize tracking-wider` | both added |
          | index flush left (`self-stretch justify-start`) | `self-stretch text-left` |
          | label `text-xl` (20px) | `text-description` — already 20px |
          | label `font-normal capitalize` | both added (h3 defaults to bold) |
          | label `text-center` | `text-center` on the h3 and the stack |
          | `gap-8` between rows, `gap-12` between tiles | `gap-8` / `md:gap-x-12` — already matched |

          `border-muted-foreground` rather than `border-rule`: `--rule` is
          `#e9e9ec`, a near-white meant for the Services/Contact/Footer dividers,
          and the frame's tile rule is explicitly the same Neutral-200 as its
          heading — a much greyer line. Using `--rule` here would have been a
          plausible-looking substitute that is roughly three times lighter.

          `gap-8` / `md:gap-x-12` is the frame's `gap-8` between its two rows and
          `gap-12` between the two tiles in a row, reached through a `grid` rather
          than nested `flex-1` divs. The grid was already here and already produced
          the frame's 2 × 2 arrangement, and it additionally collapses to one
          column on narrow screens, which the frame's fixed `flex-1` cannot do.

          ## What the frame's snippet does NOT supply, and stays as it was

          The frame's tiles are **language logos** — four 120px SVGs labelled
          JavaScript / TypeScript / Python / Golang, inside a fixed `w-44` block,
          with no body copy. This block is the owner's **roles**, so the frame's
          *content* is not adopted and none of it is removed either: the role
          title stays as the `h3` and the comma-joined technology list stays as a
          third line, because that list is the only place that content exists.

          Three things are deliberately different:

          1. **The mark is the role's own lead technology, not a logo for the
             role.** An earlier version of this comment argued that a role has no
             single glyph and refused to add one — the reasoning was sound but it
             was answering a question the owner had not been asked, and the owner
             asked for the icons on 2026-09-26. The argument also turned out to be
             too strong: the frame's own tiles pair a mark with a label, so what
             it actually shows is *a technology that represents the card*, not
             *the card's identity in one glyph*. Taking `stack[0]` as the mark
             makes that explicit and keeps it honest — the mark is of a technology
             the role genuinely lists, the role's real name is on the tile as text,
             and `TechIcon` is `aria-hidden` so nothing is announced twice.
             "IoT & Embedded Systems" therefore shows Raspberry Pi, which is the
             first thing that role lists, not KiCad, which was the easier pick
             because its mark was already in the registry.
          2. **The fixed `w-44` label block is gone.** The frame's 176px is sized
             for one short word; role titles here run to ~20 characters, so a
             fixed width would wrap them mid-phrase. The block is `w-full` and the
             label is centred, which is the same visual intent.
          3. **The mark is 112px, not 120px.** The frame draws a 120px `<svg>`
             inside a `size-28` (112px) `overflow-hidden` box, cropping 4px off the
             right and bottom of every mark. Reproduced literally that clips the
             Python and Raspberry Pi glyphs; 112px is the box the frame reserved.

          ## The heading is 20px, not the frame's `text-base` 16px

          The owner asked for these two header sizes to be increased on 2026-09-26,
          and 16px was also *smaller* than the 20px role titles underneath it. The
          later instruction was to keep what is in the codebase, so the increase
          stands: `--text-about-section` / `--leading-about-section`.

          `tracking-widest` on the label IS applied, even though the frame pairs it
          with short language names — it was specified, and at 20px in a 2-column
          grid the longest role still fits on one line. Drop `tracking-widest` from
          the h3 if it reads loose.

          ## The brand fills are corrected against `--background`, not `--tech-tile`

          These four marks sit on the page, because the role tiles have no surface
          of their own, unlike the Tools tiles. Raspberry Pi's simple-icons hex
          `#a22846` is 2.57:1 there, so it was raised to `#c83156` (3.53:1) by
          lightness only, hue and saturation preserved — recorded in `SUPERSEDED`
          in `scripts/verify-contrast.mjs` like every other brand correction, and
          asserted as its own pairing so the two surfaces cannot be confused again.
        */}
        <section
          aria-labelledby="about-skills-heading"
          className="flex w-full flex-col items-start gap-3"
        >
          <h2
            id="about-skills-heading"
            className="text-about-section leading-about-section font-medium text-muted-foreground"
          >
            {aboutHeadings.skills}
          </h2>

          <ul className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12">
            {aboutSkillRoles.map((role) => (
              <li
                key={role.index}
                className="flex flex-col items-center gap-6 border-t border-muted-foreground py-3"
              >
                <p className="self-stretch text-left text-caption leading-tile font-normal capitalize tracking-wider text-white">
                  {role.index}
                </p>
                {/*
                  The mark is `stack[0]` — the role's OWN first technology — looked
                  up through the same `TechIcon` registry the Tools row uses, so it
                  is a real brand mark on a 24 × 24 grid rather than a metaphor,
                  and there is no second icon source to keep in step.

                  Deriving it from `stack[0]` instead of adding a `mark` field is
                  deliberate: a separate field could name a technology the role does
                  not claim, whereas this cannot. It also means the mark is honest
                  about what it is — the lead technology *of* the role, not a logo
                  *for* the role, which is why `TechIcon` is `aria-hidden` and the
                  role's own name and full stack are both already on the tile as
                  text. A test loops every role and asserts `hasTechIcon(stack[0])`,
                  so a new role cannot ship an empty box — which is exactly how the
                  About row once rendered seven empty tiles.

                  `size-28`, not the frame's 120px: the frame draws a 120px `<svg>`
                  inside a `size-28` (112px) `overflow-hidden` box, which crops 4px
                  off the right and bottom of every mark. Reproduced, that clips the
                  Python and Raspberry Pi marks; 112px is the box the frame actually
                  reserved.
                */}
                <div className="flex w-full flex-col items-center gap-2">
                  <TechIcon tool={role.stack[0]} className="size-28" />
                  <h3 className="text-center text-description leading-card-title font-normal capitalize tracking-widest text-white">
                    {role.title}
                  </h3>
                </div>
                {/* Comma-joined into one line, not a list: the frame's card holds
                    a single run of copy, and bullets would add structure it does
                    not have. The list is still the data, so a role's technologies
                    can be restyled without being re-typed. */}
                <p className="self-stretch text-center text-body leading-body text-foreground">
                  {role.stack.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/**
 * The contact card that overlays the portrait's bottom-left corner.
 *
 * ## Why this is HTML and not the SVG the owner supplied
 *
 * The frame draws this card INSIDE `profile.svg`, as a 304 × 104 glass panel at
 * `y=371` in the portrait's own 421 × 475 coordinate space, with the three rows'
 * text converted to vector outlines. Pasting that in would have been the smaller
 * diff and the wrong one, for four reasons:
 *
 * 1. **The text is not text.** The export carries "Phone Number" / "Email Address"
 *    / "Location" as `<path>` outlines, so it is invisible to search, to
 *    translation, to zoom, and to a screen reader — and the alt text would then
 *    have to describe all three rows in a sentence.
 * 2. **A placeholder becomes indistinguishable from real data.** An owner reading
 *    the page cannot tell a baked-in placeholder from a real number, which is
 *    precisely the failure the old page made with `+234**********`. Here the three
 *    labels come from `aboutContact`, so they are greppable, and a row with no
 *    `href` is visibly not a link.
 * 3. **Phone and email could never be tappable.** `tel:` and `mailto:` need real
 *    elements, and the card links a row the moment `aboutContact` supplies an
 *    `href` — no component change when the owner fills the values in.
 * 4. **The glass cannot be shared with the photograph if it is inside it.** The
 *    panel's 10%-white fill plus `backdrop-blur` is the design's own effect and
 *    does work as a sibling overlay, so the photograph is not modified.
 *
 * The geometry is the frame's, in `cqw` so it tracks the portrait: 304/421 = 72.2%
 * wide, 104/475 = 21.9% tall, 8px radius, 2px backdrop blur, 13px inset, 9px
 * between rows, 20px glyphs, 15px labels. At `lg` the container is exactly
 * `--size-portrait-w` (421px), so 1cqw = 4.21px and the card lands on the
 * authored 304 × 104.
 */
function ContactCard() {
  return (
    <div
      className="absolute bottom-0 left-0 flex h-[var(--contact-card-h)] w-[var(--contact-card-w)] flex-col justify-center overflow-hidden rounded-md border border-contact-glass-border bg-contact-glass px-[3.1cqw] backdrop-blur-[2px]"
    >
      {/*
        `rounded-md`, not `rounded-lg`: the frame's `rx` is 8 and this theme's
        `--radius-lg` is 12. The social tile above uses `rounded-lg` and is
        therefore NOT the frame's 8 — noted in theme.css, and left alone as an
        unrelated pre-existing discrepancy.

        `overflow-hidden` is what makes the blur behave: `backdrop-filter` samples
        the backdrop, and a rounded box that does not clip would blur the square
        region behind the corners too.
      */}
      <ul className="flex flex-col gap-[2.14cqw]">
        {aboutContact.map((row) => {
          const Glyph = contactGlyphs[row.field];

          return (
            <li key={row.field} className="flex items-center gap-[1.81cqw]">
              {/*
                `strokeWidth` is 1.8, not lucide's default 2, and not the frame's
                1.5 either. lucide draws on a 24-unit grid and this renders at
                4.75cqw = 20px, so the stroke lands at `strokeWidth / 24 * 20`:
                1.8 gives the frame's 1.5px exactly, where 2 would give 1.67px.
              */}
              <Glyph
                aria-hidden="true"
                strokeWidth={1.8}
                className="size-[4.75cqw] shrink-0 text-contact-icon"
              />

              {/*
                No `href` on this row means no link — see `aboutContact`. This is
                the branch every row takes until the owner supplies real values,
                and it is why no `tel:` or `mailto:` can reach the page by
                accident.
              */}
              {row.href ? (
                <a
                  href={row.href}
                  className="text-[3.56cqw] leading-none text-contact-foreground hover:underline"
                >
                  {row.label}
                </a>
              ) : (
                <span className="text-[3.56cqw] leading-none text-contact-foreground">
                  {row.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One glyph per row, keyed by the content's `field`. */
const contactGlyphs = {
  phone: Phone,
  email: Mail,
  location: MapPin,
} as const satisfies Record<ContactField, typeof Phone>;

/**
 * The row of social tiles under the portrait.
 *
 * ## Its own component, not `SocialLinks`
 *
 * `common/SocialLinks` is the header/footer row: 40 × 40 tiles filled with
 * `--surface` (#F0F2F5) carrying a dark glyph. This row is 36 × 36, outlined in
 * `--border`, with a light glyph — a different object that happens to contain
 * the same `SocialIcon` glyphs. Reusing the component would have meant a variant
 * prop for a second geometry used once, so the glyph is shared and the tile is
 * not.
 *
 * ## A tile with no destination is NOT a link
 *
 * Of the five networks rendered, two — Instagram and YouTube — have no confirmed
 * URL, so they render as a `<span>`: dimmed, not focusable, and not announced as a
 * link. An `<a>` with an empty or invented `href` is a link to nowhere, and
 * `href="#"` is a link to the top of the page; both are worse than an honest
 * inert tile. The frame's shape is kept so the row still reads as designed while
 * the unknown part is visibly incomplete.
 *
 * Note this keys off an EMPTY `href`, not off `unverified`: GitHub is unverified
 * and still renders as a live link, because the same guessed address already
 * links from the header and footer and one address should not appear live in one
 * place and dead in another. See `content/about.ts` and `content/types.ts`.
 *
 * ## The row is five tiles, and the frame's five were not these
 *
 * It was three, then GitHub and YouTube were added to the profile card on
 * 2026-09-26, so the count matches the frame's by coincidence only. Behance and
 * the frame's phone tile remain dropped — the phone has moved into `ContactCard`,
 * where the frame actually put contact details. See `content/about.ts`.
 */
function AboutSocialRow() {
  const tile =
    "flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-opacity";

  return (
    <ul className="flex items-center gap-4">
      {aboutSocialLinks.map((link) => {
        const glyph = <SocialIcon network={link.network} className="size-5" />;

        return (
          <li key={link.network} className="flex">
            {link.href ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`${tile} hover:opacity-80`}
              >
                {glyph}
                <span className="sr-only">{link.label}</span>
              </a>
            ) : (
              <span
                className={`${tile} cursor-not-allowed opacity-50`}
                title={`${link.label} — link not confirmed yet`}
              >
                {glyph}
                <span className="sr-only">{link.label} — link not confirmed yet</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
