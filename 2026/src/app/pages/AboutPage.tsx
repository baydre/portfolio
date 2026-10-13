import { ContactSection } from "../../components/contact/ContactSection";
import { ProfileSection } from "../../components/about/ProfileSection";

/**
 * About page.
 *
 * The page is built from the **AboutPage frame**, supplied 2026-09-26. The
 * frame supplies a portrait, a biography, five tools, four skill roles and a
 * social row; the biography that was hardcoded earlier turned out to be the
 * frame's own text word for word, and lives in `content/about.ts` as
 * transcribed copy.
 *
 * Two blocks, in the frame's order:
 *
 *   ProfileSection  the frame's two-column profile block, inside the page
 *                   shell's container (it has no container of its own)
 *   ContactSection  the SHARED contact section from `components/contact/`, the
 *                   same block the homepage closes with. The frame has no
 *                   closing block of its own; the old page's invented "Let's
 *                   Build Something Great Together!" panel (ASSUMED, owner-kept
 *                   2026-09-26) was removed 2026-10-08 on the owner's request so
 *                   the two pages share one contact treatment. `ContactSection`
 *                   carries its own `container-site`, so it sits outside the
 *                   page shell's wrapper to keep every section on one column.
 *
 * The page stays thin: it composes components and supplies content, and holds
 * no layout of its own beyond the profile block's container.
 */
export function AboutPage() {
  return (
    <>
      <div className="container-site py-section-y">
        <ProfileSection />
      </div>

      <ContactSection />
    </>
  );
}