import {
  CodeXml,
  Compass,
  Fingerprint,
  LayoutTemplate,
  ScrollText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * The per-service mark.
 *
 * Replaces the `ServiceArtwork` that came before it, which drew each service's
 * panel from the HomePage snippet's Services frame: five of the six were
 * transcribed as flat `gray-200` geometry, and the sixth — `01` Web Design — had
 * **no** geometry in the frame at all and was filled in as a faint 12%-opacity
 * rect purely to hold the slot open. That one was a placeholder by construction,
 * and the other five read as placeholders too: the frame's shapes are abstract
 * decoration, not marks for "Brand Development" or "Technical Writing". The owner
 * asked on 2026-09-26 for the real icon in all six slots, so the geometry is gone
 * and each service now carries a mark that means something.
 *
 * ## Why lucide is the right library *here*
 *
 * The project already rejected lucide for the About page's technology marks, and
 * that rejection still stands: those are brands, and lucide deliberately carries
 * almost no brand logos, so nothing in it is Python or Django. These six are
 * **disciplines**, not brands. There is no "Web Development" logo to miss — a
 * palette and a code bracket are the conventional shorthand for exactly these
 * six, and lucide is a dependency already, drawn on the same 24-unit grid and
 * stroked rather than filled, so the six marks read as a set.
 *
 * ## Register: technical, mature, professional
 *
 * The owner reviewed this set on 2026-09-27 and asked for marks that feel
 * "technical, mature and professional". The first set was literal and it read
 * the wrong way: `Palette`, `Lightbulb` and `Megaphone` are the stock shorthand of
 * consumer creative and startup decks, and `Shapes` said nothing at all. The
 * problem was never that the glyphs were unclear — a palette for Web Design is
 * perfectly legible. It was that they sold *creativity* to a reader who is
 * deciding whether to trust a consultancy.
 *
 * So the set was re-picked on one rule: each mark is an **instrument, a
 * structure, or a measurement** — something a practitioner operates — rather
 * than an object, a spark, or an announcement. That register is what
 * "technical" looks like, and it survives being read at a glance:
 *
 * | Service            | Mark              | Instrument / structure          |
 * | ------------------ | ----------------- | ------------------------------- |
 * | Web Design         | `LayoutTemplate`  | the wireframe the layout follows |
 * | Web Development    | `CodeXml`         | the markup itself               |
 * | Brand Development  | `Fingerprint`     | a unique, identifying mark      |
 * | Technical Writing  | `ScrollText`      | a published, authored document   |
 * | Consultation       | `Compass`         | deliberate direction            |
 * | Marketing          | `TrendingUp`      | a measured result               |
 *
 * Two of these are deliberate overreads of the service name. `LayoutTemplate` is
 * an *engineering* artefact where a palette was an *artistic* one, and the
 * discipline being sold really is structure. `TrendingUp` is a metric where
 * `Megaphone` was a broadcast — marketing is bought for a number, not for noise.
 * `Compass` replaces `Lightbulb`, which was the worst of the original six: a bulb
 * is an idea, and an idea is the one thing a consultancy cannot be hired for.
 *
 * Rejected in the same pass: `Boxes` (a kit of parts, but generic), `Braces`
 * (duplicates `CodeXml`'s territory), `FileCode` (a file of code, which
 * misdescribes *writing*), `ClipboardList` (an assessment, which sounds like a
 * survey), `Target` (campaign-shaped), `NotebookPen` (stationery).
 *
 * ## Keyed by title, not by index
 *
 * The old artwork was keyed by `//01`–`//06`, which meant reordering `services`
 * would have silently reassigned a card's artwork to a different service. Keying
 * on the service's own `title` makes that impossible, and mirrors `TechIcon`,
 * which is keyed by the tool's label for the same reason. The cost is that a
 * renamed or added service has no icon, so `ServiceIcon` returns `null` for an
 * unknown key and the suite asserts that every service resolves — a new entry
 * fails the build instead of rendering a blank slot.
 *
 * ## Sizing
 *
 * The frame's slot is 384 × 384, and that size is load-bearing: the six cards sit
 * in two flex rows, so a card that loses its panel is shorter than its row-mates
 * and the row of titles goes ragged. The panel therefore keeps `aspect-square`
 * whatever the icon does inside it, and the icon takes half the slot's width
 * (`w-1/2`) so it scales with the card on the way down instead of overflowing a
 * narrow column. 192px in the frame's own terms — a large, quiet mark rather
 * than edge-to-edge decoration.
 *
 * `strokeWidth` is 1 rather than lucide's default 2. The 24-unit viewBox means
 * stroke width scales with the render: at 192px a default stroke lands 16px
 * wide, which is a slab rather than a line. At 1 it is 8px, which is the
 * weight the About page's role marks and the rest of this page's display type
 * are set at.
 */
const ICONS: Record<string, LucideIcon> = {
  // Web design is structure, not decoration: the wireframe is what the work
  // actually produces, and it is the engineering artefact the client reviews.
  "Web Design": LayoutTemplate,
  // The only one of the six that was already right. A bracket pair names the
  // markup specifically; a terminal would stand for using a computer.
  "Web Development": CodeXml,
  // Brand work is differentiation, so a unique identifying mark rather than a
  // kit of interchangeable parts. `Shapes` was a logo-shaped logo.
  "Brand Development": Fingerprint,
  // A finished, published document — the deliverable — rather than a file or a
  // pen, which describe the act of writing instead of the thing written.
  "Technical Writing": ScrollText,
  // Judgement and direction is what is being sold, not a flash of insight.
  "Consultation Services": Compass,
  // A measured outcome, which is what a client is paying for.
  "Marketing Services": TrendingUp,
};

export function ServiceIcon({ title }: { title: string }) {
  const Icon = ICONS[title];

  if (!Icon) return null;

  return (
    // The card's own `h3` already names the service, so the mark is decorative
    // and must stay out of the accessibility tree — a second, unlabelled
    // version of the heading is noise, not information.
    <div
      aria-hidden="true"
      className="flex aspect-square w-full items-center justify-center text-foreground"
    >
      <Icon className="h-1/2 w-1/2" strokeWidth={1} focusable="false" />
    </div>
  );
}
