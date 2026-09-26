import { aboutCta } from "../../content/about";
import { ProfileSection } from "../../components/about/ProfileSection";
import { SmartLink } from "../../components/navigation/SmartLink";

/**
 * About page.
 *
 * The page is now built from the **AboutPage frame**, supplied 2026-09-26. Until
 * then it was a placeholder: an invented grid with a fake phone number
 * (`+234**********`), a placeholder email, five identical "React.js" tool tiles,
 * four hardcoded colour swatches standing in for logos, a "Let's Build Something
 * Great Together!" panel and two `<button>`s with no handler. All of that is
 * gone. The frame supplies a portrait, a biography, five tools, four skill roles
 * and a social row; the biography that was hardcoded here turned out to be the
 * frame's own text word for word, and has moved to `content/about.ts` as
 * transcribed copy.
 *
 * Two blocks, in the frame's order:
 *
 *   ProfileSection  the frame's two-column profile block
 *   AboutCtaBanner  ASSUMED — the old page's closing panel, kept on the
 *                   owner's instruction. The frame has no such block. See
 *                   `aboutCta` for what that means for review.
 *
 * The page stays thin: it composes components and supplies content, and holds
 * no layout of its own beyond the page shell.
 */
export function AboutPage() {
  return (
    <div className="container-site py-20">
      {/*
        `scroll-mt-header` because the header is sticky and the page can be
        reached from a footer anchor on a sibling route. Same reason every other
        section carries it.
      */}
      <ProfileSection />

      <AboutCtaBanner />
    </div>
  );
}

/**
 * ASSUMED — see `content/about.ts` `aboutCta`.
 *
 * The heading and body are the previous page's invented copy, retained on the
 * owner's instruction, and are NOT transcribed from any frame. The two actions
 * are not invented: they are the site's own destinations, reached through
 * `SmartLink` for the in-page anchor so it scrolls natively rather than through
 * a client-side route change.
 *
 * `variant="outline"` for the secondary action: the old markup was
 * `bg-white/20`, a translucent fill, and `outline` is the nearest treatment the
 * design system already has. The gradient panel behind them is the other
 * unapproved part — `--secondary` and `--accent` are both marked DERIVED in
 * theme.css, because no panel in the HomePage frame uses them.
 */
function AboutCtaBanner() {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="mt-20 flex flex-col items-center gap-8 rounded-2xl bg-gradient-to-br from-secondary to-accent px-12 py-12 text-center"
    >
      <h2 id="about-cta-heading" className="text-section-compact leading-section text-foreground">
        {aboutCta.title}
      </h2>

      {/*
        One `<p>` per entry in `aboutCta.body`, which is why that field is an
        array: the owner asked for the "If …" sentence to begin on the second
        line, and this is the same trade the biography makes with the frame's
        `<br/>` — a paragraph breaks where it is meant to, and reflows with the
        text, where a `<br/>` would only be correct at one viewport width.

        The wrapper's `gap-2` is deliberate and is the owner's second and third
        corrections on this block (2026-09-26). Inheriting the section's `gap-8`
        put 32px between the two sentences, which on top of their 40px line box
        read as a 72px void; 12px was tried next and was still too much. `gap-2`
        is 8px — about 0.4em at this size.

        It is not `gap-0`, which is what the biography does between its five
        sentences. Zero would be self-defeating here: the biography's paragraphs
        are one continuous block whose line breaks are *meant* to disappear, while
        this break is the whole point of the change and has to stay visible as a
        deliberate second line.
      */}
      <div className="flex max-w-2xl flex-col gap-2">
        {aboutCta.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-description leading-description text-foreground"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <SmartLink
          item={aboutCta.primary}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        />

        {/*
          An external link, so a plain `<a>` with the usual `rel` — not
          `SmartLink`, which only models a route or an in-page anchor.
        */}
        <a
          href={aboutCta.secondary.href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {aboutCta.secondary.label}
        </a>
      </div>
    </section>
  );
}

/*
 * The two action class strings mirror `button.tsx`'s `default` and `outline`
 * variants at `size` `lg`, because `SmartLink` renders an `<a>`/`<Link>` rather
 * than a `<button>` and cannot carry the `Button` component's `asChild` slot.
 *
 * NO `text-cta` CLASS ON EITHER. The button base already sets `text-sm`, which is
 * that value, and adding the size utility alongside a colour utility makes
 * `tailwind-merge` drop the foreground — the known failure recorded in
 * `ContactForm.test.tsx`.
 */
