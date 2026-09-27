import {
  siC,
  siDjango,
  siFastapi,
  siGit,
  siKicad,
  siLinux,
  siPython,
  siRaspberrypi,
  siReact,
} from "simple-icons";

/**
 * Marks for the Work cards' "Built with" tiles and the About Tools row.
 *
 * ## Paths come from simple-icons; only AI has no mark
 *
 * Every tool except `AI` has a real brand mark, and they are all taken from
 * **simple-icons** rather than drawn here. That library is CC0-1.0 — public
 * domain, so there is no attribution obligation and no trademark clearance to
 * reason about — and it is the reference set for exactly this: ~3,400 brand SVGs
 * on a common 24 × 24 grid, each with its documented brand hex. It is now a
 * dependency (`pnpm add simple-icons`, v16), which AGENTS.md §4 permits when the
 * justification is stated: it supplies 6 real brand marks that would otherwise be
 * hand-authored approximations of trademarked artwork, and it is the only asset
 * added by this change.
 *
 * An earlier pass used `lucide-react` metaphors — `Braces` for Python, `Rocket`
 * for Django, `Terminal` for Linux. That was the wrong library: lucide is a
 * *generic* UI icon set and deliberately carries almost no brand logos, so
 * nothing in it is a Python or a Django. The paths were the valuable part of the
 * idea and the metaphors were filler, and shipping filler as though it were
 * identity is worse than shipping nothing. No lucide import remains.
 *
 * ## Every tool has a real mark; the last gap closed 2026-09-26
 *
 * `AI` sat here until 2026-09-26 as the one entry with no brand mark — it names a
 * field, not a product, so there is no logo for it to have, and it took a lucide
 * `Brain` metaphor. The owner replaced it with **KiCad**, so the lucide tier is
 * gone entirely and this file has no icon-set dependency left at all.
 *
 * KiCad was first taken from an owner-supplied `kicad.svg` and inlined here. Its
 * path turned out to be **byte-identical** to `siKicad.path` — 3,141 characters,
 * same 24 × 24 grid, same `#314CB0` hex — so thesvg and simple-icons ship the
 * same mark. The library is used and the vendored file deleted rather than left
 * as an unreferenced copy that could drift. The owner's URL is recorded in
 * `docs/DESIGN_SYSTEM.md` if it is ever needed again.
 *
 * The one thing that does NOT come from the library is the fill: `#314CB0` is
 * 1.73:1 on `--tech-tile` and illegible, for the reason every correction below
 * exists.
 *
 * ## `Git & GitHub` is one tile, so it takes one mark
 *
 * The label names two things, which is a content problem the frame created. The
 * mark is `siGit`, the branch mark, because the label leads with Git and Git's
 * own logo is a branch. The octocat is a real mark and it is already in this
 * project at 24 × 24 in `common/icons.tsx` — where it stays, because there it
 * links the actual GitHub account, which is what an octocat should mean.
 *
 * ## Look-up is by the tool's own label, and BOTH React spellings are keys
 *
 * `projects.ts` says `"React.js"` and the About row says `"React"` — the same
 * technology under two names, because one is a package and one is a product. The
 * About row rendered **seven empty boxes** while both were live, because the
 * registry only knew `"React.js"`, so `brand["React"]` was `undefined` and even
 * React's tile came out empty.
 *
 * Both spellings are now explicit keys rather than one key plus an alias, because
 * they resolve to *different paths* — the design's for the Work cards, the
 * library's for the About row. An indirection would have hidden that. The guard
 * against a third spelling appearing is a test that loops every tool in
 * `aboutTools` and asserts `hasTechIcon`, rather than a lookup table here.
 *
 * ## Why React's fill is #61DAFB, which simple-icons also uses
 *
 * The card was supplied twice, in Figma's two export formats, and they differ:
 *
 * - The **Tailwind export** carries a real React logo — a 32 × 32 SVG path in
 *   `#61DAFB`, wrapped in `<g clip-path="url(#clip0_323_427)">`.
 * - The **styled-components export** carries no path at all. `StyledVector` is a
 *   `<div>` with `background: #61DAFB`, 32 × 28.5 at `top: 1.75px` — a flat
 *   cyan rectangle.
 *
 * The second is the lower-fidelity of the two: it has flattened the vector into
 * a filled rect, which is what Figma emits when it cannot resolve the layer. So
 * the React logo is used, on the same reasoning `common/icons.tsx` gives for the
 * social tiles — a real brand mark is strictly more use than a cyan blob, and
 * the tile's own label already says "React.js". `#61DAFB` is the one value both
 * exports agree on.
 *
 * ## Departures from the Tailwind export
 *
 * 1. **The `<clipPath>` wrapper is dropped.** The path's coordinates already
 *    span exactly 0 → 32, so the clip is a no-op — and an invalid one: the same
 *    two ids (`clip0_323_427`, `clip0_323_437`) repeat across the five tiles, so
 *    rendering more than one puts duplicate ids in the document and every
 *    reference resolves to the first. Dropping it removes the duplication and
 *    changes no pixels.
 *
 * 2. **The fill is kept per glyph, not `currentColor`.** Each brand's colour is
 *    part of its identity and `#61DAFB` is nowhere near the theme palette, so it
 *    is not expressed as a token.
 *
 * VERIFICATION NOTE: nothing here is hand-copied any more. Every path is
 * simple-icons' own, so the previous caveat about an unrendered transcription
 * applies to the *fill corrections* instead, and those are machine-checked by
 * `verify-contrast.mjs` rather than by eye.
 */

type Glyph = {
  /** SVG path data. simple-icons is on a 24 × 24 grid. */
  d: string;
  /**
   * The fill, which is the brand hex.
   *
   * NOT simple-icons' own `hex` for three of the six. Those values are
   * invisible on `--tech-tile` (#313131): Django's #092E20 measures 1.13:1 and
   * Python's #3776AB 2.69:1, against a 3:1 requirement for a graphic. The
   * shipped values raise lightness and preserve hue, and every one of them is
   * gated in `verify-contrast.mjs` with the original kept under `SUPERSEDED`, so
   * the departure from the vendor's colour is auditable rather than silent.
   */
  fill: string;
};

/**
 * The corrected brand hexes, mirroring the tokens in `theme.css`.
 *
 * **`"React.js"` is the one key that is NOT from simple-icons**, and it is
 * deliberate. The Work cards are frame-derived, so their React glyph stays the
 * path the design itself supplied — transcribed from the Tailwind export, on the
 * export's 32 × 32 grid. simple-icons' React is the same logo on a 24 × 24 grid,
 * so substituting it would change how the mark sits inside its 32px box, and no
 * browser is available here to check that. Changing a frame-derived, already
 * reviewed component on an unverifiable hunch is the worse risk, so the About
 * row gets the library mark and the Work cards keep the design's.
 *
 * The cost is that React exists twice in this file, in two coordinate systems.
 * Unifying them needs one browser check — compare the two at 32px and keep
 * whichever sits correctly — so it is left as a noted follow-up rather than
 * guessed at.
 */
const brand: Record<string, Glyph> = {
  "React.js": {
    d: "M18.9733 16.0053C18.9733 16.7958 18.6594 17.5539 18.1006 18.1129C17.5418 18.672 16.7838 18.9863 15.9933 18.9866C15.2026 18.9866 14.4443 18.6725 13.8852 18.1134C13.3261 17.5543 13.012 16.796 13.012 16.0053C13.012 15.2148 13.3259 14.4567 13.8847 13.8976C14.4436 13.3386 15.2015 13.0243 15.992 13.024C16.7827 13.024 17.541 13.3381 18.1001 13.8972C18.6592 14.4563 18.9733 15.2146 18.9733 16.0053ZM22.504 1.75195C20.7093 1.75195 18.3613 3.03195 15.9867 5.24795C13.6133 3.04395 11.264 1.77862 9.47067 1.77862C8.924 1.77862 8.42667 1.90262 7.996 2.14929C6.16267 3.20662 5.752 6.50129 6.69867 10.636C2.64 11.8893 0 13.8933 0 16.0053C0 18.1253 2.65333 20.1346 6.724 21.3786C5.78533 25.5293 6.204 28.8293 8.04133 29.8853C8.468 30.1346 8.96133 30.252 9.51067 30.252C11.304 30.252 13.6533 28.972 16.028 26.7533C18.4013 28.9586 20.7507 30.224 22.544 30.224C23.0907 30.224 23.588 30.104 24.0187 29.8573C25.8507 28.8013 26.2627 25.5066 25.316 21.3706C29.36 20.128 32 18.12 32 16.0053C32 13.8853 29.3467 11.876 25.276 10.6293C26.2147 6.48262 25.796 3.17995 23.9587 2.12262C23.5347 1.87729 23.0427 1.75329 22.504 1.75195ZM22.4973 3.20529V3.21329C22.7973 3.21329 23.0387 3.27195 23.2413 3.38262C24.1293 3.89195 24.5147 5.82929 24.2147 8.32129C24.1427 8.93462 24.0253 9.58129 23.8813 10.2413C22.6013 9.92662 21.2067 9.68529 19.7387 9.52929C18.8587 8.32262 17.9453 7.22662 17.0253 6.26662C19.148 4.29329 21.1413 3.21062 22.4987 3.20662L22.4973 3.20529ZM9.47067 3.23195C10.82 3.23195 12.8227 4.30929 14.9507 6.27195C14.036 7.23195 13.124 8.32129 12.2573 9.52795C10.7813 9.68395 9.38533 9.92529 8.10667 10.2453C7.95733 9.59195 7.84667 8.95995 7.768 8.35195C7.46133 5.86129 7.84 3.92529 8.72 3.40929C8.97333 3.28929 9.25333 3.23862 9.47067 3.23195ZM15.98 7.29862C16.5867 7.92262 17.1933 8.62129 17.7933 9.38395C17.2067 9.35729 16.6067 9.33862 16 9.33862C15.3867 9.33862 14.78 9.35195 14.1867 9.38395C14.7733 8.62129 15.38 7.92395 15.98 7.29862ZM16 10.8C16.9867 10.8 17.9693 10.8453 18.936 10.924C19.4773 11.7 20.0053 12.528 20.5133 13.404C21.0093 14.2573 21.46 15.124 21.8707 15.9986C21.46 16.872 21.0093 17.7453 20.52 18.5986C20.0133 19.4786 19.4893 20.316 18.9467 21.092C17.976 21.176 16.992 21.2226 16 21.2226C15.0133 21.2226 14.0307 21.176 13.064 21.0986C12.5227 20.3226 11.9947 19.4933 11.4867 18.6186C10.9907 17.7653 10.54 16.8986 10.1293 16.024C10.5333 15.148 10.9907 14.2733 11.48 13.4186C11.9867 12.5386 12.5107 11.704 13.0533 10.928C14.024 10.8426 15.008 10.7973 16 10.7973V10.8ZM11.1533 11.1386C10.8333 11.6413 10.5133 12.156 10.2147 12.6853C9.91467 13.2053 9.63467 13.728 9.368 14.2506C9.01467 13.376 8.71467 12.504 8.46667 11.6546C9.32 11.4546 10.22 11.276 11.1533 11.1386ZM20.8333 11.1386C21.76 11.276 22.6533 11.4453 23.508 11.6546C23.268 12.4973 22.968 13.364 22.628 14.232C22.3613 13.712 22.0813 13.188 21.7747 12.6666C21.4747 12.144 21.1547 11.6346 20.8347 11.1386H20.8333ZM24.9173 12.0386C25.5627 12.2386 26.176 12.4613 26.7507 12.7026C29.06 13.6893 30.5533 14.98 30.5533 16.004C30.5467 17.028 29.0533 18.324 26.744 19.304C26.184 19.544 25.5707 19.76 24.9373 19.9613C24.564 18.684 24.076 17.3533 23.4707 15.988C24.0707 14.632 24.5507 13.308 24.9173 12.036V12.0386ZM7.05733 12.044C7.428 13.324 7.91733 14.6533 8.524 16.0173C7.924 17.3733 7.44133 18.6973 7.076 19.9693C6.43067 19.7693 5.81733 19.5453 5.24933 19.3026C2.94 18.32 1.44667 17.028 1.44667 16.004C1.44667 14.98 2.94 13.6813 5.24933 12.7026C5.80933 12.4626 6.42267 12.2466 7.05733 12.044ZM22.628 17.7506C22.9813 18.6266 23.2813 19.5 23.5293 20.348C22.676 20.5573 21.7747 20.7346 20.8413 20.868C21.1613 20.368 21.4813 19.852 21.7813 19.324C22.0813 18.804 22.36 18.2733 22.628 17.7506ZM9.368 17.7773C9.63467 18.3 9.91467 18.8213 10.2213 19.344C10.528 19.864 10.8413 20.3733 11.1613 20.868C10.2347 20.732 9.34133 20.5613 8.48667 20.3533C8.72667 19.5133 9.028 18.644 9.36667 17.776L9.368 17.7773ZM23.8933 21.76C24.0427 22.4173 24.16 23.0506 24.232 23.6573C24.5387 26.148 24.16 28.084 23.28 28.6013C23.084 28.7213 22.8293 28.772 22.5293 28.772C21.18 28.772 19.1773 27.696 17.0493 25.732C17.964 24.772 18.876 23.684 19.7427 22.4786C21.2187 22.3213 22.6147 22.08 23.8933 21.76ZM8.12 21.7733C9.4 22.0853 10.7947 22.3266 12.2627 22.4826C13.1427 23.6893 14.056 24.7853 14.976 25.744C12.8493 27.7213 10.8533 28.804 9.496 28.804C9.20267 28.7973 8.95467 28.7373 8.75867 28.628C7.87067 28.1213 7.48533 26.1826 7.78533 23.6906C7.85733 23.0773 7.976 22.432 8.12 21.7733ZM14.2 22.6266C14.7867 22.6533 15.3867 22.672 15.9933 22.672C16.6067 22.672 17.2133 22.6586 17.8067 22.6266C17.22 23.3893 16.6133 24.0866 16.0133 24.7133C15.4067 24.0866 14.8 23.3893 14.2 22.6266Z",
    fill: "#61dafb",
  },
  React: { d: siReact.path, fill: "#61dafb" },
  Python: { d: siPython.path, fill: "#458ac3" },
  Django: { d: siDjango.path, fill: "#1e9769" },
  FastAPI: { d: siFastapi.path, fill: "#009688" },
  "Git & GitHub": { d: siGit.path, fill: "#f14639" },
  Linux: { d: siLinux.path, fill: "#fcc624" },
  KiCad: { d: siKicad.path, fill: "#6a81d5" },
  /**
   * The IoT role's mark. Keyed on the role's own first stack entry rather than a
   * short alias, because this registry is looked up BY LABEL and the About role
   * tiles pass `stack[0]` — see `about.ts`. It is also the reason the mark is
   * honest: it is a technology the role actually lists, not a metaphor.
   */
  "Raspberry Pi/Compute Module": { d: siRaspberrypi.path, fill: "#c83156" },
  /**
   * The Backend role's mark since 2026-09-27, when the owner put C first in that
   * role's stack and the mark — which is `stack[0]` — followed it. Keyed on the
   * bare letter because that is the entry's own text, and looked up BY LABEL
   * like every other key here.
   *
   * simple-icons' C hex `#a8b9cc` is UNCHANGED, not one of the corrected brand
   * values: it is 9.19:1 on `--background`, far above the 3:1 a graphic needs,
   * so the raw brand colour is used as published. See the `--brand-c` token.
   */
  C: { d: siC.path, fill: "#a8b9cc" },
};

/**
 * Whether `tool` uses the design's 32 × 32 grid or simple-icons' 24 × 24.
 *
 * Only `"React.js"` — the Work cards' key — is on the design grid. A wrong
 * viewBox does not throw, it silently rescales, so this is explicit.
 */
const DESIGN_GRID = "React.js";

/** True when `tool` has a mark, so callers can reserve the box. */
export function hasTechIcon(tool: string): boolean {
  return tool in brand;
}

/**
 * The mark for `tool`, or `null` when unmapped.
 *
 * Always `aria-hidden`: the tile's own label carries the name, so announcing the
 * glyph as well would read the technology twice.
 */
export function TechIcon({
  tool,
  className,
}: {
  tool: string;
  className?: string;
}) {
  const glyph = brand[tool];
  if (!glyph) return null;

  return (
    <svg
      viewBox={tool === DESIGN_GRID ? "0 0 32 32" : "0 0 24 24"}
      aria-hidden="true"
      focusable="false"
      className={className}
      fill={glyph.fill}
    >
      <path d={glyph.d} />
    </svg>
  );
}
