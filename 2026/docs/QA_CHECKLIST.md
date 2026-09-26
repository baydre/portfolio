# QA Checklist

Definition of done. A task is complete when the applicable sections pass and the
results have been reported honestly.

Sections that do not apply to a change may be skipped — **saying so** is required.
Silently skipping is not.

---

## 1. Build & tooling

Run in order from the repository root (`2026/`):

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

- [ ] `pnpm install` completes with no lockfile mismatch
- [ ] `pnpm build` succeeds — it runs `tsc -b` first, so a type error fails the
      build **by design**. Do not "fix" it by weakening `tsconfig.json`.
- [ ] `pnpm lint` reports **0 errors and 0 warnings**
- [ ] `pnpm typecheck` clean
- [ ] `pnpm test` passes, and new tests fail when the behaviour they cover is
      broken
- [ ] No new dependency added without a stated justification
- [ ] No `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` added to silence a
      real problem
- [ ] `pnpm-lock.yaml` committed alongside any `package.json` change

---

## 2. Routing

- [ ] `/` renders the home page
- [ ] `/about` renders About
- [ ] `/resume` renders Resume
- [ ] `/projects/:projectId` renders the correct project for a valid id
- [ ] `/projects/<unknown-id>` renders 404, not a broken page
- [ ] An unmatched path renders 404
- [ ] Header and footer appear on **every** page, including 404
- [ ] Active nav item matches the current route
- [ ] In-app links use router navigation (no full page reload)
- [ ] Browser back / forward work
- [ ] Direct navigation to a deep link works on refresh (dev server *and* preview)

---

## 3. Responsive

Test every changed view at each width. Check for horizontal overflow, clipped
text, overlapping elements, and unreadable text.

| Width | Target device |
| --- | --- |
| 375px | small phone |
| 390px | modern phone |
| 768px | tablet portrait |
| 1024px | tablet landscape / small laptop |
| 1280px | laptop |
| 1440px | desktop |

- [ ] No horizontal scrollbar at 375px
- [ ] No horizontal scrollbar at 320px
- [ ] Navigation is usable (see `docs/INTERACTION_SPEC.md` §2.2)
- [ ] Multi-column grids collapse to one column
- [ ] Images scale and do not overflow
- [ ] Tap targets ≥ 24×24px
- [ ] Fixed-position elements (e.g. a sticky header) do not cover content
- [ ] Long unbroken strings (emails, URLs) wrap or truncate deliberately

---

## 4. Visual fidelity

- [ ] Typography: family, size, weight, line height, letter spacing match the
      design
- [ ] Colours match tokens — **no hardcoded hex** in a component
- [ ] Spacing and padding match
- [ ] Corner radii match
- [ ] Borders and shadows match (the design has one shadow value; confirm it is
      the only one)
- [ ] Images are not stretched — correct `object-fit` and aspect ratio
- [ ] Alignment, padding and gutters are consistent between sibling sections
- [ ] Icon sizing and stroke weight consistent
- [ ] Any deviation from the design is **documented and approved**, not silent

---

## 5. Interaction

- [ ] Every link goes somewhere real — no `href="#"`
- [ ] Every button does something — no dead buttons
- [ ] Project card: whole card clickable; one link, not nested links
- [ ] Project card navigates to the **matching** project
- [ ] Previous / Next project links work; absent at the ends
- [ ] External links open safely (`target="_blank"` + `rel="noopener noreferrer"`)
- [ ] Hover states appear
- [ ] Focus states appear and are clearly visible
- [ ] Mobile menu opens, closes, and is keyboard-dismissible
- [ ] Contact form: `idle → submitting → success / error` behaves correctly
- [ ] Contact form **never** shows success without a real success response
- [ ] Input is preserved on error
- [ ] Nothing is permanently loading or permanently disabled
- [ ] Animations honour `prefers-reduced-motion`

---

## 6. Accessibility

Full detail in `docs/ACCESSIBILITY.md`.

- [ ] Semantic HTML; no clickable `<div>` / `<span>`
- [ ] Whole page operable by keyboard alone
- [ ] Logical tab order; no traps
- [ ] Visible focus indicator on every focusable element
- [ ] Every control has an accessible name
- [ ] Every image has `alt` (or `alt=""`)
- [ ] Every input has a real `<label>`
- [ ] Errors are text, associated via `aria-describedby`, not colour-only
- [ ] One `<h1>` per page; no skipped heading levels
- [ ] Landmarks present; one `<main>`
- [ ] Contrast measured: 4.5:1 body, 3:1 large text and UI
- [ ] Reduced motion honoured
- [ ] Usable at 400% zoom
- [ ] Screen-reader smoke test completed (VoiceOver / NVDA / TalkBack)

---

## 7. Content

- [ ] No leftover placeholder text (`Logo or name`, `example@example.com`,
      `+234**********`, "Yasir Ahmed" if not the real name)
- [ ] No duplicated filler entries (identical jobs, degrees, or referees)
- [ ] All portfolio content lives in `src/content/`, not in page components
- [ ] Dates, durations and names are consistent
- [ ] Links point to real destinations

---

## 8. Repository hygiene

- [ ] No debugging leftovers (`console.log`, commented-out code, `.only` tests)
- [ ] `dist/`, `node_modules/`, `.env*` are not staged
- [ ] Changes are limited to the task — no unrelated "while I was here" edits
- [ ] `src/imports/` untouched unless the task explicitly concerned it
- [ ] New files are in the layer the architecture specifies
      (`docs/ARCHITECTURE.md` §8)
- [ ] Documentation updated if behaviour or a decision changed

---

## 9. Report

Before declaring done:

- [ ] State which commands were run and their actual results
- [ ] State what was **not** verified, and why
- [ ] State what remains open or is deferred
- [ ] Do not claim a check you did not run
