import { contactBlurb, creditLink, footerNavItems, profile, socialLinks, viewWorkLabel } from "../../content/profile";
import { ArrowRightIcon } from "./icons";
import { LocationCopy } from "./LocationCopy";
import { SmartLink } from "../navigation/SmartLink";
import { siteUrl } from "../../lib/site-url";

/**
 * The site footer, from the HomePage snippet's Footer frame (728px) and the
 * copyright bar beneath it (66px).
 *
 * Layout: a top row with the role, the disciplines, and on the right the
 * availability note plus a "View Work" link; a 1px rule; then a
 * large `baydre_africa` wordmark at 160px; then a lower row with the Navigate
 * column, the Connect column, and the location copy.
 *
 * Provenance, since several details are the design's and would otherwise look
 * like mistakes:
 *
 * - The footer wordmark reads the same `profile.name` as the hero, so the design's
 *   lowercase `baydre_africa` is deliberately NOT reproduced. OWNER CORRECTION
 *   2026-09-26, two parts: the text became "BaydreAfrica" to match the hero, and
 *   the face became `font-display` to match it too. Only the sizing stays the
 *   footer's. Because the two are now the same string, the footer no longer keeps
 *   a separate `footerName` field — one field feeds both wordmarks, so they cannot
 *   drift apart. `SiteFooter.test.tsx` renders both and compares.
 * - The location paragraph is here because the design puts it in BOTH the Contact
 *   frame and the footer. With no heading above it, it reads as orphaned; flagged
 *   in docs/DESIGN_SYSTEM.md §9 rather than silently dropped.
 * - NO social ICON row in the footer (owner instruction, 2026-09-26). The Connect
 *   column is text links only. The `SocialLinks` component is untouched and still
 *   renders in `NavBar` and `SiteHeader`; only the footer's third instance is gone.
 * - The Navigate and Connect columns sit at 650px and 866px in a 1440 frame and
 *   stop around 1066px, leaving ~290px of empty space to the right gutter. The
 *   columns are laid out in normal flow here instead, which closes that gap. A
 *   third column was probably deleted from the design; no third column is
 *   invented.
 *
 * The credit reproduces the design's personal name verbatim; per the resupplied
 * 2026-10-09 snippet it reads a Jura line in the design's lime and links to the
 * Resume page — the size was reverted to 12px the same day (see the copyright
 * bar below). The owner also removed "Resume" from the NavBar item list that day
 * (`creditLink` is a standalone item, and `/resume`'s only entry point).
 * Flagged in docs/DESIGN_SYSTEM.md §9 until then as a possible leftover; that
 * concern is now CLOSED.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  // The footer credit links to the Resume page. It uses the dedicated
  // `creditLink` item (profile.ts), not `navItems` — the owner REMOVED "Resume"
  // from the NavBar item list 2026-10-09, so the header no longer links `/resume`
  // and this credit is the page's only entry point.

  return (
    // No rule above the footer, and no `mt-20` either. The design supplies the
    // Contact frame (921px) and the Footer frame (728px) as separate frames with
    // no divider between them. `mt-20` was padding out the separation the
    // deleted `border-t` used to provide, and with the rule gone it stacked on
    // top of the Contact section's own `py-20` and the footer's, making this
    // boundary 240px where every other one on the page is 160px:
    //
    //   Work -> Services  80 + 80 = 160
    //   Services -> Contact 80 + 80 = 160
    //   Contact -> Footer  80 + 80 = 160   (was 80 + 80 + 80 = 240)
    <footer>
      {/* The 1px rule the design does specify sits below the role row, inside
          the footer. */}
      <div className="container-site py-20">
        {/* The footer's top row, from a NEW snippet supplied 2026-10-09.
            Structure: the title over the discipline chips on the left, "Open for
            work" over "View Work" on the right, drawn across the row
            `flex-col gap-6 lg:flex-row lg:items-center lg:justify-between`.
            The snippet pins the left column at `w-64` (256px) — sized for its
            own "Software • Web • Brand" line — and the owner's longer
            disciplines would wrap mid-chip inside it, so the column runs at
            natural width instead (DERIVED).

            Typeface: the snippet sets the whole row (title, chips, availability)
            in Maison Neue → Outfit, `--font-heading`, at font-light, with the
            chips' 12px separator dots and the title in gray-200 text. This
            palette's near-white is `--foreground` (#e9e9ec, the corrected value
            every copy line uses), so the three text runs read it through
            `text-foreground`. The 12px dots are `--lime` (#C7F464, the design's
            own lime-300) via `currentColor` + `text-lime-300`. "View Work" is
            the snippet's Jura → `font-sans`, `font-medium`, `leading-4` line
            box, white text (`text-foreground`), underlined in lime-300, and the
            arrow is the existing `ArrowRightIcon` (15px) next to it. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-start gap-2">
            <p className="font-heading text-body font-light leading-nav text-foreground">
              {profile.role}
            </p>
            <ul className="flex flex-wrap items-center gap-2">
              {profile.disciplines.map((discipline, index) => (
                <li key={discipline} className="flex items-center gap-2">
                  {index > 0 ? <DisciplineDot /> : null}
                  <span className="font-heading text-body font-light leading-nav text-foreground">
                    {discipline}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <p className="font-heading text-body font-light leading-nav text-foreground">
              {profile.availability}
            </p>
            <a
              href={siteUrl("/#work")}
              className="inline-flex items-center gap-2 border-b border-lime-300 py-1.5 font-sans text-body font-medium leading-4 text-foreground transition-opacity hover:opacity-80"
            >
              {viewWorkLabel}
              {/* The design's own arrow geometry, not a text glyph and not an
                  icon-package icon — see `ArrowRightIcon` for why no library
                  matches it. `shrink-0` so the flex row cannot squash the 15px
                  box; decorative, so the link's name stays "View Work". */}
              <ArrowRightIcon className="shrink-0" />
            </a>
          </div>
        </div>

        <div aria-hidden="true" className="mt-10 h-px w-full bg-rule" />

        {/* The footer wordmark. OWNER CORRECTION 2026-09-26: the text is
            "BaydreAfrica" to match the hero, and the face is `font-display` so it
            matches in the typeface too. Both are overrides of the snippet, which
            shows a lowercase underscored "baydre_africa" in the body face.

            Only the SIZING is still the footer's own — `--text-footer-mark` with
            `--leading-footer-mark` (1.0) — so it reads as the footer's wordmark
            rather than a second hero. The size is an owner reduction from the
            snippet's 160px to 120px (2026-09-26), and it stays fluid: 120px at
            1440 tapering to a 40px floor, so the fixed 180px the hero uses — which
            cannot fit a 375px viewport — is never reached. */}
        <p
          aria-hidden="true"
          className="mt-16 font-display text-footer-mark leading-footer-mark text-foreground"
        >
          {profile.name}
        </p>

        {/* The lower row. The three tracks are EXPLICIT, not `grid-cols-3`.

            Equal tracks put Navigate at 521px and Connect at 959px, because the
            single 40px gap is shared by all three boundaries. The design puts
            Navigate at 650px and Connect at 866px, which a uniform gap cannot
            express: narrowing it would drag the location copy away from Navigate
            too. So the two leading tracks are sized as fractions of the content
            box (`--footer-locate-col`, `--footer-nav-col`) and Connect takes the
            remainder as 1fr.

            Verified at 1440 against the design:
              84 + 526 + 40 = 650  Navigate
              650 + 176 + 40 = 866  Connect
            Both are fractions, so they scale rather than pinning Figma pixels to
            a desktop-only breakpoint. Below `lg` this reverts to the 2- and
            1-column stacks. */}
        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[var(--footer-locate-col)_var(--footer-nav-col)_1fr]">
          <LocationCopy
            lead={contactBlurb.lead}
            duration={contactBlurb.duration}
            className="max-w-[26.6875rem] text-caption leading-caption text-footer-link"
          />

          <nav aria-label="Footer">
            <h2 className="text-caption leading-caption text-footer-label">Navigate</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {footerNavItems.map((item) => (
                <li key={item.to}>
                  <SmartLink
                    item={item}
                    className="rounded-sm text-caption leading-caption text-footer-link transition-colors hover:text-foreground"
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-caption leading-caption text-footer-label">Connect</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {socialLinks.map((link) => (
                <li key={link.network}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-unverified={link.unverified || undefined}
                    className="rounded-sm text-caption leading-caption text-footer-link transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The design's 66px copyright bar. RESPONSIVE BY CONSTRUCTION, and that is
          the whole reason the frame's geometry is not copied literally: the
          snippet pins a `w-[1440px]` frame and places a `w-[1272px]` row at
          `left-[84px] absolute`, which overflows any viewport under 1440px.
          `container-site` reproduces those two numbers without either — it is
          `width: 100%` capped at `--container-site` (1440px) with `margin-inline:
          auto`, and its `padding-inline: var(--gutter)` resolves to 24px on
          mobile, 40px at the mid breakpoint and 84px at 1440. So 84 + 1272 + 84
          at the design width, and a correct gutter at every width below it. The
          row also stacks (`flex-col` -> `sm:flex-row`) instead of jamming two
          runs of text onto one line on a phone. Nothing here is fixed-width. */}
      <div>
        <div className="container-site flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* DESIGN `text-xs` = 12px, `leading-4` = 16px. This line was 11px
              (`--text-micro` was 0.6875rem), which matched nothing in the frame.
              The leading had to be pinned at the same time: `--leading-caption`
              is unitless 1.45, and it only produced 16px BECAUSE the size was
              11px (11 x 1.45 = 15.95). At 12px it would give 17.4px. Size and
              leading are coupled here, so this is not the "size only" change on
              its own — flagging it rather than leaving a fresh mismatch. */}
          <p className="text-micro leading-copyright text-footer-link">
            &copy; {year} BaydreAfrica. All rights reserved.
          </p>
          {/* The credit, OWNER DESIGN 2026-10-09: "Yasir Musa" was resupplied as its
              own snippet — Jura 20px (`--text-description`), `font-normal`,
              `tracking-wide`, a 16px `leading-4` line box, in the design's lime
              (`text-lime-300` = `--lime` on `--background`, the pairing
              verify-contrast already gates) — and it now LINKS to the Resume
              page via `creditLink` (profile.ts): the owner removed "Resume"
              from the NavBar item list the same day, so this credit is
              `/resume`'s only entry point. OWNER REVERT same day: the 20px "is
              too obvious", so the size is back to the previous `--text-micro`
              (12px) — the copyright line's size — while the lime, the tracking
              and the link stay. The global `:focus-visible` ring in theme.css
              gives the link its focus state. */}
          <SmartLink
            item={creditLink}
            className="font-sans text-micro font-normal leading-4 tracking-wide text-lime-300"
          >
            {profile.credit}
          </SmartLink>
        </div>
      </div>
    </footer>
  );
}

/**
 * The 12px lime chip that separates the footer's discipline labels — from the
 * 2026-10-09 snippet (a 12 × 12 circle, `#C7F464`).
 *
 * It replaces the old `•` text glyph so the separator matches the new snippet's
 * dot, and it is re-used between every pair of labels rather than rendering one
 * leading dot. Decorative, so it is `aria-hidden` and skipped by focus; the fill
 * is `currentColor` so it tracks the theme's lime-300 token via `text-lime-300`
 * instead of repeating the hex.
 */
function DisciplineDot() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="text-lime-300"
    >
      <circle cx="6" cy="6" r="6" fill="currentColor" />
    </svg>
  );
}
