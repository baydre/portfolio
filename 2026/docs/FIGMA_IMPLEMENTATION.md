# Figma → Implementation Method

How Figma concepts translate into this React application, and — just as
important — where that translation must **not** be taken literally.

> **Status: method is authoritative. Concrete values are PROVISIONAL.**
> The rules below apply regardless of which snippets arrive. Only the specific
> colours, type, and layout numbers are pending.

---

## 1. Core mapping

| Figma concept | React equivalent | Notes |
| --- | --- | --- |
| Frame | Page or `<section>` | A top-level Frame is a route; a nested Frame is usually just a section |
| Component | Reusable React component | The unit of reuse |
| Component set / Variant | Props (`variant`, `size`, `tone`) | **Not** separate components |
| Auto Layout | Flexbox or CSS Grid | Honour `direction`, `gap`, `padding`, alignment |
| Constraints | Responsive CSS | Fixed constraints become breakpoints |
| Variables / Styles | Design tokens (CSS custom properties) | One source, consumed via `@theme inline` |
| Prototype interaction | React state, router navigation, or native browser behaviour | Prefer the platform |
| Asset export | File in `src/assets/`, imported normally | Not a data-URI string |
| Text style | Type scale token + utility class | Not an inline `style` attribute |
| Effect | Token | Shadows, blurs → tokens |
| Mask / clip | CSS `overflow`, `clip-path`, `aspect-ratio` | |

### Worked example — a variant set

```text
Figma:  Button / Primary        Button / Secondary        Button / Ghost
React:  <Button variant="primary">  <Button variant="secondary">  <Button variant="ghost">
```

Three Figma variants become **one component with three prop values**. Three React
components would be wrong.

---

## 2. Figma Make's output is not the architecture

**This is the most important section in this document.**

Figma Make generates *a* working React rendering of a design. It optimises for
"reproduces the design quickly", not for "is a good codebase". Its output must be
treated as **a specification of what the design looks like**, and then rebuilt.

The current export in `src/imports/` demonstrates why, concretely:

| Evidence | Count | What it means |
| --- | --- | --- |
| Fixed pixel widths (`w-[734px]`, `w-[868px]`) | throughout | No fluid layout |
| Responsive breakpoints (`sm:`/`md:`/`lg:`) | **0** | Not responsive at all |
| `absolute` positioning | **147** | Design layers, not layout |
| Fractional `inset-[0_86.86%_0_0]` | many | Geometry leakage |
| `hover:` states | **0** | No interaction encoded |
| `onClick` / `useState` | **0** | Not interactive |
| Components named after layers (`Frame`, `Group`, `HeadersV`, `HeroResume`) | 6 | Layer names ≠ architecture |
| Identical banners copy-pasted across 3 screens | 3 | Duplication, not reuse |
| Arbitrary values (`44.905px`, `font-[510]`, `leading-[0]`) | many | Exported geometry, not intent |
| `max-w-*` usage | **1** in 3,758 lines | No container system |

A screen that renders correctly at one width is not a finished web page.

---

## 3. Do not

- **Duplicate components because they came from different Figma screens.** If the
  header appears in three frames, that is one `SiteHeader`, not three copies. The
  export contains a byte-identical CTA banner in all three screens; it must be
  extracted once.
- **Copy generated components because they exist.** Reuse is a design decision, not
  a convenience.
- **Use Figma layer names as component names.** `Frame`, `Group`, `Hero`,
  `Section2` and `Frame123` are not names. See `docs/COMPONENT_GUIDELINES.md`.
- **Over-apply absolute positioning.** Reach for it only for genuine overlay or
  decoration. Layout is flex/grid. The export's 147 `absolute` usages are not a
  pattern to follow.
- **Hardcode magic numbers.** `w-[734px]`, `rounded-[44.905px]` and
  `tracking-[-0.43px]` are Figma measurements. They belong in tokens or in a
  documented layout decision — see `docs/DESIGN_SYSTEM.md` §3, §5, §8.
- **Replace semantic HTML with generic containers.** A Figma rectangle is not a
  `<div>`. Use `<a>` for navigation, `<button>` for actions, real headings in
  order, `<ul>/<li>` for lists. See `docs/ACCESSIBILITY.md`.
- **Bake text into images or SVGs.** The export's `svg-*.ts` files export
  `data:image/svg+xml,...` strings with embedded text in some cases. Text must be
  real, selectable, translatable text.
- **Treat the export's DOM structure as given.** Generated nesting is frequently
  arbitrary; flatten it while preserving visual order.

---

## 4. Prioritise, in order

1. **Visual fidelity** — it must still look like the design.
2. **Responsive behaviour** — must work 375px → 1440px+.
3. **Reusable components** — duplication is a defect.
4. **Semantic HTML** — the document must make sense without CSS.
5. **Accessibility** — see `docs/ACCESSIBILITY.md`.
6. **Maintainability** — typed, composable, small.

These are not strictly ordered in practice: a change that improves 3–6 at the cost
of 1 is a redesign and needs explicit approval.

---

## 5. Translating layout

### Auto Layout → flex

```text
Figma:  Auto layout, vertical, gap 16, padding 24, align: center
CSS:    display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: center;
```

### Fixed widths → fluid with constraints

```text
Figma:  Fixed width 734px
CSS:    max-width: 734px; width: 100%;          ← fluid inside a bound
```

```text
Figma:  Fill container (horizontal)
CSS:    width: 100%;
```

```text
Figma:  Hug contents
CSS:    width: fit-content;  (or just let it size naturally)
```

### Fixed → responsive

| Figma | CSS |
| --- | --- |
| Separate desktop / mobile frames | One component, responsive CSS |
| Fixed horizontal row | `flex-wrap: wrap` or a grid with `minmax()` |
| Fixed multi-column grid | `grid-template-columns: repeat(auto-fit, minmax(<min>, 1fr))` |
| Hidden on mobile variant | Conditional rendering, not `display: none` |

### When there is no responsive design

**Some frames have only a desktop design.** Then responsiveness must be *designed*.
That is a design decision, not a mechanical translation. In that situation:

- Prefer CSS that degrades gracefully (wrap, scroll, stack).
- Preserve the design's proportions, type hierarchy, and spacing rhythm.
- Do not invent new components or content.
- Record the decision in the PR description and in `docs/INTERACTION_SPEC.md`.
- Raise it if the result is a genuinely different design.

---

## 6. Translating assets

```text
Figma "Export as PNG"  →  src/assets/<name>.png  →  import img from "./…"
```

Rules:

- **Use a meaningful filename.** The export produced content-hash names like
  `a74e1cbcd40c78bdfe5f0e5e84a0c63d59bd9eea.png`, which convey nothing.
- **Never duplicate an asset** across directories. The current export carries 9
  assets in *both* `src/assets/` and `src/imports/`, byte-identical, ~6.8 MB total
  — including one 4096×2731 / 5.5 MB file.
- **Verify the real format.** 7 of the 9 `.png` files in `src/assets/` are actually
  **JPEG**. Rename or re-encode.
- **Right-size before shipping.** A 5.5 MB image should not reach production.
- **Always write meaningful `alt` text** (or `alt=""` if purely decorative).
- The `figma:asset/<file>` virtual specifier is a Figma Make convenience declared in
  `src/vite-env.d.ts`. Prefer ordinary relative imports in application code.

---

## 7. Translating content

Copy in the Figma design is **placeholder content**, not the real portfolio — for
example "Logo or name", "Yasir Ahmed", `example@example.com`, and repeated
identical entries (4 identical jobs, 4 identical degrees, 3 identical referees).

Per the current project decision, this placeholder content **may** be used to
build the structure, and upgraded later. When doing so:

- Put it in `src/content/*.ts` — never inline in a page.
- Type it (`Project`, `Experience`, `Education`, …).
- Keep the shapes realistic so a later content swap needs no component changes.
- Never present placeholder data as real. It is visibly fake
  (`+234**********`, `Logo or name`); leave it obviously fake until replaced.

---

## 8. Process

1. **Inventory the frame** — sections, headings, repeated blocks, assets.
2. **Classify each block** — page section, reusable component, or content.
3. **Extract tokens** — add to `theme.css`; record in `docs/DESIGN_SYSTEM.md`.
4. **Build primitives** — smallest reusable pieces first, with variants.
5. **Compose** — assemble sections from primitives.
6. **Add behaviour** — per `docs/INTERACTION_SPEC.md`.
7. **Make responsive** — per §5, designing if the design does not specify.
8. **Verify** — `docs/QA_CHECKLIST.md`, including 375/390/768/1024/1280/1440.

---

## 9. Open items

- [ ] Authoritative Figma snippets (blocked — awaiting delivery)
- [ ] Homepage design: the current export has **no** `Homepage.tsx`, only 3 orphan
      images. Do not derive a homepage from the current export.
- [ ] Responsive rules per breakpoint — must be designed if not supplied.
- [ ] Final decision on `src/imports/`: replace, selectively migrate, or remove.
