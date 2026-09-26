import { contactBlurb, contactIntro } from "../../content/profile";
import type { LocationCopy } from "../../content/types";
import { LocationCopy as LocationCopyText } from "../common/LocationCopy";
import { ContactForm } from "./ContactForm";

/**
 * The Contact section.
 *
 * Source: the HomePage snippet's Contact frame, 921px — a 96px heading, an intro
 * paragraph, a 1px rule, then a two-column body: the location/response copy on
 * the left at 427px, and the form on the right at 732px running to the right
 * gutter.
 *
 * The frame has TWO paragraphs, not one: `contactIntro` under the heading, and
 * `contactBlurb` beside the form. They are separate strings because the design
 * uses them in separate places — `contactBlurb` is repeated in the footer.
 *
 * SHARED COMPONENT. The Figma Product Page frame carries an identical contact
 * section, so this lives in `components/contact/` rather than
 * `components/home/` and is reused by the project detail route.
 *
 * The snippet positions the heading, the copy and the form with absolute offsets
 * inside a fixed-height frame; those are flow here. The two-column split is
 * reproduced at `lg` and above and collapses below it.
 */
export function ContactSection({
  intro = contactIntro,
  blurb = contactBlurb,
  className,
}: {
  intro?: string;
  blurb?: LocationCopy;
  className?: string;
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`container-site scroll-mt-header py-20 ${className ?? ""}`}
    >
      {/* `font-heading` (Outfit) — OWNER DECISION 2026-09-26, and it OVERRIDES the
          frame, which sets this line `font-['Jura']` along with the line below it.
          Reasoning on the record so it is not "corrected" back: the 96px statement
          was tried in Jura and reads as an outlier at that size against every other
          subheading on the site — the `ProjectCard` title, the Services card
          titles, "Let's talk", the form's own heading — all of which are
          `font-heading`. So the statement keeps the heading role.

          Note this is NOT uniform down the block: the line below is Jura, like
          the two neighbouring sections' descriptions. The frame treats the two
          lines as one family; the owner decision splits them. */}
      <h2
        id="contact-heading"
        className="max-w-[18ch] font-heading text-contact leading-contact text-foreground"
      >
        Let&rsquo;s turn the next idea into something real.
      </h2>

      {/* `font-sans` (Jura) and NO width cap — the line is a SINGLE LINE in the
          frame, and both of those are load-bearing:

          - `font-sans`, not `font-heading`. The frame says `font-['Jura']`, and
            the two neighbouring sections agree: `SectionIntro`'s description
            carries no font class and inherits Jura. An earlier pass here read
            "the subheading font like in the others" as `font-heading` (the <h3>
            utility) and set Outfit — wrong, because the others' *descriptions*
            are Jura. Corrected 2026-09-26.
          - No `max-w-prose`. That capped the measure at ~811px (65ch) and wrapped
            a line the frame draws as one. Uncapped the sentence is ~1170px and
            fits the 1272px container, so the cap was the only thing breaking it.

          Explicit `font-sans` rather than bare inheritance, so the family is
          legible here instead of depending on <body>; it computes to the same
          Jura the other descriptions resolve to.

          `text-foreground`, not `text-muted-foreground`: the frame sets this line
          `text-gray-200`, and in THIS design gray-200 is #E9E9EC — from the Work
          frame's authored raw CSS, where the same class resolved to #E9E9EC
          rather than Tailwind's #e5e7eb. The Work description was corrected to
          #E9E9EC on that evidence, so muted here was the odd one out; it also
          lifts contrast from 7.74:1 to 15.2:1. */}
      {/* `text-description` / `leading-description` = 20px/40px, matching the
          Work and Services section descriptions. Was `text-lead` (24px). Owner
          request 2026-09-26: all three section descriptions now share one size.

          Side effect, in the frame's favour: at 20px the sentence is ~975px
          rather than ~1170px, so the single-line property has more headroom
          against the 1272px container. */}
      <p className="mt-3 font-sans text-description leading-description text-foreground">
        {intro}
      </p>

      <div aria-hidden="true" className="mt-8 h-px w-full bg-rule" />

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[26.6875rem_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <h3 className="font-heading text-section leading-section text-foreground">
            Let&rsquo;s talk
          </h3>
          <LocationCopyText
            lead={blurb.lead}
            duration={blurb.duration}
            className="max-w-prose text-body leading-body text-muted-foreground"
          />
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
