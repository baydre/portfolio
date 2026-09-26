# Accessibility

**Target: WCAG 2.2 Level AA**, wherever it does not conflict with the Figma design.

Where the design and this document conflict, **stop and raise it.** Do not silently
ship an inaccessible design, and do not silently redesign a component to fix it.

---

## 1. Semantic HTML

The single highest-impact accessibility work. Get this right and most screen-reader
and keyboard problems disappear before they start.

| Purpose | Use | Never |
| --- | --- | --- |
| Navigate to a URL | `<a>` / react-router `Link` | `<div onClick>` |
| Perform an action | `<button>` | `<a href="#">` |
| Go to another route | `<Link>` / `<NavLink>` | `<a href="/about">` (full reload) |
| Leave the site | `<a href target="_blank" rel="noopener noreferrer">` | `<button>` that calls `window.open` |
| Group of items | `<ul>` / `<ol>` / `<li>` | stacked `<div>`s |
| Self-contained content | `<article>` | `<div>` |
| Thematic grouping | `<section>` + heading | `<div>` |
| Data table | `<table>` | `<div>` grid |
| Toggle | `<button aria-pressed>` or a checkbox | a styled `<div>` |

> **`<a>` is for navigation. `<button>` is for actions.** A link that triggers
> JavaScript but does not change location is a button. A button that navigates is
> a link. Getting this wrong breaks middle-click, open-in-new-tab, and screen
> reader link lists.

The Figma export models everything as rectangles. A rectangle in Figma is not a
`<div>`. Choosing the correct element is a design-to-code responsibility.

---

## 2. Keyboard

- **Every interactive element is reachable and operable by keyboard.** No positive
  `tabindex`.
- Logical order: DOM order must match visual order. Do not reorder with CSS to
  fix a layout — fix the DOM.
- No keyboard traps. A modal or menu must be dismissible with `Escape`.
- Custom widgets: either use a proven primitive (Radix is available) or implement
  the full WAI-ARIA pattern — including arrow-key navigation and the correct roles.
  A half-implemented menu is worse than a plain list of links.
- Skip-to-content link as the first focusable element, targeting `main`.
- Do not remove focus outlines.

---

## 3. Focus

- A **visible** focus indicator on every focusable element, meeting 3:1 contrast
  against adjacent colours (WCAG 2.2 SC 2.4.11 Focus Appearance).
- `:focus-visible` for the indicator; never suppress `:focus` entirely.
- Focus order follows reading order.
- On route change, move focus to the new page heading (or a skip target) so
  keyboard and screen-reader users are not left at the top of a stale page.
- Modals: focus enters on open, is trapped while open, returns to the trigger on
  close.
- Hover-only information must also be revealed on `:focus-visible`.

`theme.css` defines a `--ring` token. Use it for focus indicators rather than
inventing a colour.

---

## 4. Accessible names

- Every interactive control has a discernible name.
- Icon-only control: `aria-label`, **or** visually-hidden text. Never a bare icon.
- The footer currently renders social links with `aria-label={social}` on a
  lowercase network name and an `sr-only` duplicate. Prefer one clear label:
  `aria-label="LinkedIn"`.
- Links whose purpose is unclear from their text ("read more", "here") need
  context — either visible or visually hidden.
- Decorative images: `alt=""`. Meaningful images: describe the *content*, not the
  file.

---

## 5. Images

- `alt` is mandatory on every `<img>`. `alt=""` for decorative, never omit.
- A project card image beside a visible title is decorative → `alt=""`. The title
  already names the project; announcing both is noise.
- Do not bake text into images or SVGs. The export's `svg-*.ts` files contain
  `data:image/svg+xml,…` strings, some with embedded text — that text is invisible
  to assistive technology and untranslatable.
- Inline meaningful `<svg>` needs `role="img"` and a `<title>`, or
  `aria-hidden="true"` + `focusable="false"` if decorative.
- Do not use an image to convey text that should be text.

---

## 6. Forms

- Every input has a real `<label for>`. Placeholder text is **not** a label.
- Errors are text, adjacent to the field, referenced by `aria-describedby`, with
  `aria-invalid="true"`.
- Errors are never colour-only — add an icon or text.
- Required fields marked with `required` and described in text, not just `*`.
- Group related fields in `<fieldset>` with a `<legend>`.
- Buttons have clear, action-oriented labels.
- Preserve user input on failure. Never clear a form because a request failed.
- A success message uses `role="status"`; an error uses `role="alert"`.

---

## 7. Headings and structure

- Exactly **one** `<h1>` per page, matching the page's subject.
- No skipped levels (`h1` → `h3`).
- Choose the level by **document outline**, never by font size. Styling comes from
  a utility class or token; the tag carries meaning.
- Landmarks: `header`/`banner`, `nav`, `main`, `footer`/`contentinfo`. One `main`.
- The live pages currently have a correct heading outline and one `h1` per page —
  preserve that.

---

## 8. Colour and contrast

WCAG 2.2 AA thresholds:

| Content | Minimum |
| --- | --- |
| Body text (< 24px) | 4.5:1 |
| Large text (≥ 24px, or ≥ 18.66px bold) | 3:1 |
| UI components and focus indicators | 3:1 |
| Graphics/diagrams | 3:1 |

- Verify contrast for **every** token pairing in `docs/DESIGN_SYSTEM.md` before it
  is used. Several provisional values are likely to fail:
  - `#8d8ba7` on `#f9f9ff` — muted text on the page background. Borderline for
    4.5:1; confirm by measurement, do not eyeball.
  - `#f7df1e` (yellow) — used as a rating/star colour. Almost certainly fails as
    text on a light background; fine as a graphic.
  - `text-white/60` and `text-white/20` on the dark `#0a0a0a` in the live pages —
    low-alpha white on near-black needs measurement.
- Never encode meaning in colour alone.
- Test focus indicators against the surface they appear on, not just the page
  background.

**Design tokens are unverified.** Colours in `docs/DESIGN_SYSTEM.md` are
`PROVISIONAL` and several come from a Figma export, not from a contrast audit.
Measure before shipping.

---

## 9. Motion

- Honour `prefers-reduced-motion: reduce` (see `docs/INTERACTION_SPEC.md` §7.3).
- No autoplaying motion over 5 seconds without a pause control (SC 2.2.2).
- No `auto`/decorative `prefers-reduced-motion` animation that flashes.
- Motion must never be the only way information is conveyed.
- Nothing essential may depend on an animation completing.

---

## 10. Zoom and reflow

- Usable at **400% zoom** (WCAG 1.4.10 Reflow) without horizontal scrolling or
  content loss, equivalent to a 1280px viewport at 320% .
- Support 200% text size (SC 1.4.4) without clipping or overlap.
- No horizontal scroll at 320px width.
- Do not use `maximum-scale` or `user-scalable=no` in the viewport meta. The
  current `index.html` correctly omits both — keep it that way.
- Use relative units (`rem`, `%`) for typography so it responds to user settings.
  The current `theme.css` pins `html { font-size: var(--font-size) }` to `16px`,
  which blocks user font-size preferences — review this.

---

## 11. Target size

- Interactive targets at least **24×24 CSS pixels** (SC 2.5.8), with sufficient
  spacing; 44×44 is the AAA target and better for touch.
- The live footer social links are `w-8 h-8` (32px) — pass AA, fail AAA. Note it.
- Do not rely on a small icon inside a large clickable wrapper without checking
  the actual hit area.

---

## 12. Screen reader considerations

- Test with VoiceOver (Safari), NVDA (Firefox/Chrome), and TalkBack (Chrome
  Android) at least once before launch.
- Hidden content uses `sr-only` or `hidden`. `display: none` and
  `visibility: hidden` correctly remove content from the accessibility tree —
  do not fake hiding with opacity alone.
- The current layout uses `aria-label` on a decorative logo grid plus a
  "Logo or name" text node; that needs to become a real accessible name.
- Nothing meaningful may be conveyed by a CSS pseudo-element alone.
- Live regions (`role="status"`, `role="alert"`) must exist in the DOM before
  content is injected into them, or the announcement is missed.

---

## 13. Status messages

- Loading: `aria-busy` on the region.
- Success: `role="status"` (polite).
- Error: `role="alert"` (assertive).
- Never move focus for a purely informational message; announce it politely.

---

## 14. Definition of done

A component or page is not accessible until:

- [ ] Semantic elements used correctly; no clickable `<div>`/`<span>`
- [ ] Full keyboard operation; no traps; logical order
- [ ] Visible focus indicator on every focusable element
- [ ] Every control has an accessible name
- [ ] Every `<img>` has `alt` (or `alt=""` if decorative)
- [ ] Every input has a `<label>`; errors are associated and not colour-only
- [ ] Heading outline is correct, one `<h1>` per page
- [ ] Landmarks present; one `main`
- [ ] Contrast measured and passing 4.5:1 / 3:1
- [ ] Reduced motion honoured
- [ ] Usable at 400% zoom and 320px width
- [ ] Screen-reader smoke-tested
- [ ] `docs/QA_CHECKLIST.md` accessibility section completed
