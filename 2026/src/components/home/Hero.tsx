import { profile } from "../../content/profile";

/**
 * Homepage hero, built from the Figma HomePage snippet.
 *
 * AUTHORITATIVE geometry, and how it is reached:
 *
 *   frame top            0
 *   header          0 →  84   22 + 40 + 22            (see NavBar)
 *   clearance        84 → 140   56                    (--hero-top-pad)
 *   wordmark        140 → 320   180 @ leading 1.0
 *   gap 48          320 → 368
 *   copy row        368 → 496   4 lines @ 32
 *   gap 24          496 → 520
 *   image           520 → 951   431
 *   frame is        1090        139px of clear space   (--hero-tail-pad)
 *
 * The clearance is 140 − 84, not 140. The snippet reaches it by absolutely
 * positioning the navbar over the frame; here the header is in normal flow, so
 * the hero must subtract the header's height rather than add to the offset.
 * `theme.css` documents the subtraction next to the tokens.
 *
 * Deviations from the snippet, all deliberate:
 * - The snippet absolutely positions the wordmark, copy row and image. They use
 *   flex/grid here so the page flows and reflows.
 * - 180px does not fit a 375px viewport, so the wordmark uses the fluid
 *   `text-display` clamp, which still resolves to exactly 180px at 1440px.
 * - The image height is scaled down below `lg` for the same reason.
 * - `placehold.co` is replaced with a local asset; see docs/DESIGN_SYSTEM.md §6.
 *
 * Do NOT restyle the tagline from a 24px Jura / `flex: 1 0 0` snippet. One was
 * applied here on 2026-09-26 and reverted the same day: it described the
 * *paragraph beside* the tagline, not the tagline, and the tagline's own styling
 * is 40px in the display face. The 20px/40px section-description correction in
 * `SectionIntro` is a separate, unrelated change.
 */
export function Hero() {
  return (
    <section className="container-site pt-hero-top pb-hero-tail">
      <div className="flex flex-col gap-copy-image-gap">
        <div className="flex flex-col gap-wordmark-gap">
          <h1 className="font-display text-display leading-wordmark text-white">
            {profile.name}
          </h1>

          <div className="flex flex-col gap-copy-image-gap lg:grid lg:grid-cols-[minmax(0,var(--tagline-col))_minmax(0,1fr)] lg:gap-hero-col-gap">
            <p className="font-display text-tagline text-foreground">
              {profile.tagline}
            </p>
            <p className="text-lead leading-lead text-foreground">
              {profile.description}
            </p>
          </div>
        </div>

        <img
          src={profile.heroImage.src}
          alt={profile.heroImageAlt}
          width={profile.heroImage.width}
          height={profile.heroImage.height}
          decoding="async"
          className="h-[220px] w-full rounded-image object-cover sm:h-[320px] lg:h-hero-image"
        />
      </div>
    </section>
  );
}
