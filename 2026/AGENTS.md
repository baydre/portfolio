# AGENTS.md

Instruction file for AI agents (OpenCode, Claude Code, Copilot, …) working in this
repository. Read this before changing anything.

---

## 1. Project objective

Build a **production-quality personal portfolio** from the authoritative Figma
design, preserving its visual intent while turning a static, generated design into
a genuinely interactive, responsive, accessible web application.

This repository is **not** a finished product. It is a Figma Make export that is
mid-transformation. Your work is judged on whether the result is maintainable and
faithful to the design — not on how much code you changed.

---

## 2. Source-of-truth hierarchy

When sources conflict, resolve in this order:

1. **The Figma design** (authoritative; supplied as snippets — see §3)
2. `docs/DESIGN_SYSTEM.md`
3. `docs/FIGMA_IMPLEMENTATION.md`
4. `docs/ARCHITECTURE.md`
5. `docs/COMPONENT_GUIDELINES.md`
6. `docs/INTERACTION_SPEC.md`
7. Existing application code
8. Agent assumptions

**Design intent wins over generated code.** If the Figma design and the existing
generated code disagree, the design is correct and the code is wrong.

Note the deliberate exception: `docs/ACCESSIBILITY.md` and `docs/QA_CHECKLIST.md`
are *constraints*, not style preferences. An explicit accessibility requirement
outranks a Figma detail that would produce an inaccessible result. Where the design
itself conflicts with WCAG 2.2 AA, stop and raise it — do not silently choose.

---

## 3. Current state: the HomePage snippet is authoritative

The **full HomePage snippet is authoritative** and has been implemented. It is
7329px across six frames: nav + hero (1090), Work (2562), Services (1962),
Contact (921), footer (728) and a 66px copyright bar.

- `docs/DESIGN_SYSTEM.md` §2–§5 are **authoritative** for the palette,
  typography, radii and layout. §2.3 records six accessibility corrections to the
  design's palette, and §3.1 the Maison Neue → Outfit substitution. Use those
  values, not the raw design hex values or family names.
- **Work, Services and Contact are homepage SECTIONS, not pages.** The design's
  own footer Navigate column lists Home, Work, Services and Contact, and the
  Figma file contains no work, services or contact screen. So `/work` and
  `/contact` do not exist; the header links `/#work` and `/#contact`.
  `router.test.tsx` asserts both halves of this.
- "Product Page" is the design file's term for `/projects/:projectId`. The
  application says "project". Owner-confirmed 2026-09-26 — do not rename.
- The **About frame is now authoritative.** Supplied 2026-09-26; `/about` is built
  from it and its profile section is transcribed in `src/content/about.ts`. The
  old placeholder page is gone, including its invented biography, its masked
  `+234**********` number and its five identical tool tiles. The frame's Tools row
  and Services row supplied no real content — five repeated `React.js` tiles and
  four language logos — so those two lists are **owner-supplied** and are marked
  as such. Everything else about the page that the frame does not show (the
  closing call-to-action panel) is still `ASSUMED`.
- The **portrait's contact card is built, its three values are not.** The frame's
  phone/email/location card is implemented as an HTML overlay over the photograph,
  not pasted in as the frame's vector outlines. It ships the frame's own
  placeholder labels and **no `href` on any row**, deliberately: a `tel:` to a
  made-up number and a `mailto:` to a placeholder are both worse than plain text.
  **Do not fill these in with a plausible-looking value** — the real phone number,
  email address and location are `PENDING` from the owner, and
  `ContactRow.href` is optional precisely so a placeholder cannot become a link.
  Likewise **GitHub and YouTube are on the profile card only**, by explicit
  instruction; YouTube must not be added to `profile.socialLinks`. Instagram and
  YouTube URLs were supplied 2026-09-26 and are stored **verbatim** — do not
  "normalise" Instagram's bare host or YouTube's `@bay_dre` handle to match the
  other networks. **GitHub is still an unverified guess** and is not confirmed by
  the other two having been supplied.
- The **Resume and Product Page** screens still have no design. They are built on
  assumptions, marked `ASSUMED` in the docs. Do not treat their structure as
  approved, and do not extend them speculatively.
- Everything in `src/imports/` is **superseded** by the HomePage snippet and
  must not be cited as the design. Its palette also failed contrast checks
  (`docs/DESIGN_SYSTEM.md` §7).
- Record gaps rather than guessing. A value that is not in a snippet is either
  `DERIVED` (a free implementation choice) or `ASSUMED` (a structural
  decision) — label it as such. `docs/DESIGN_SYSTEM.md` §9 lists every current
  gap by provenance.

Where the design **cannot** be implemented as drawn — no form controls, no submit
button, six failing colours, a heading role that would collapse the hierarchy —
`docs/DESIGN_SYSTEM.md` and `docs/INTERACTION_SPEC.md` record what was built
instead and why. Follow those records rather than re-deriving them.

`docs/FIGMA_IMPLEMENTATION.md` documents the method and is fully actionable.

## 4. Core rules

**Inspect before modifying.** Read the file, its callers, and its styles before
editing. Never edit a file you have not opened.

**Reuse before creating.** Search the codebase for an existing equivalent first.

**Prefer composition over duplication.** Two copies of markup is a bug.

**Keep pages thin.** A page composes components and supplies content. It should not
contain layout algorithms, data literals, or styling decisions.

**Separate content from presentation.** Portfolio data lives in `src/content/`
(see `docs/ARCHITECTURE.md`). Components receive data via typed props.

**Use TypeScript.** `strict` is on and the production build runs `tsc -b`. Do not
weaken `tsconfig.json` to make an error go away. Fix the code.

**Preserve existing functionality** unless changing it is the explicit task.

**Do not introduce dependencies without justification.** State what the dependency
replaces and why an existing one cannot do the job. Prefer the platform.

**Do not modify unrelated files.** Leave neighbouring problems alone and report them.

**Do not blindly preserve the Figma-generated architecture.** And equally:
**do not blindly rewrite it.** Read it, understand what it encodes about the
design, then decide.

**Preserve visual fidelity while improving implementation quality.** These are
compatible goals. A refactor that changes how the design looks is a bug.

**Do not invent interactions the design already specifies**, and do not invent
interactions the design is silent about without saying so. See
`docs/INTERACTION_SPEC.md`.

**Never fake functionality.** A contact form that does not send is not a contact
form. Model the real state machine (`idle → submitting → success → error`) and
report honestly when a backend is missing.

---

## 5. Generated / reference code

`src/imports/` is **generated reference code**. It is excluded from both
TypeScript and ESLint by design (`tsconfig.json` → `exclude`, `eslint.config.js`
→ `ignores`).

- Do not make large modifications there.
- Do not import from it. It is not application code.
- Do not treat its component names as a naming precedent — several are literally
  Figma layer names (`Frame`, `Group`, `HeadersV`, `HeroResume`).
- Its future is **undecided**: replaced, selectively migrated, or removed. That
  decision waits for the authoritative snippets.

Prefer extracting reusable components into the application's own component layer.
The current export contains genuinely useful patterns (a shared header, a repeated
CTA banner, a project meta grid, prev/next project navigation) that should be
rebuilt properly rather than copied.

---

## 6. Workflow

For any non-trivial task:

```
UNDERSTAND  →  what is being asked, and what is the design intent?
INSPECT     →  read the real files, routes, tokens, dependencies
PLAN        →  decide the approach; present it before large changes
IMPLEMENT   →  make the change, in the right layer
VALIDATE    →  run the checks below
REPORT      →  state what changed, what was verified, what is still open
```

**For large architectural changes, present the plan and get approval before
writing code.** Do not bundle a refactor with unrelated cleanup.

**Inspect before you assert.** Do not report a file's contents, a dependency's
usage, or a config's validity from memory or inference — read it or run it. If a
claim cannot be verified, label it unverified.

---

## 7. Validation

Run what exists, in this order, before reporting a task complete:

```bash
pnpm install     # dependency tree is consistent
pnpm build       # tsc -b && vite build — fails on type errors, by design
pnpm lint        # eslint . — must be 0 errors, 0 warnings
pnpm typecheck   # tsc -b --noEmit
pnpm test        # vitest run
pnpm verify:geometry   # run AFTER build — resolves the built CSS against the frame
pnpm verify:contrast  # asserts palette pairings and correction integrity
```

Notes:
- `pnpm build` intentionally runs the typechecker first. A build failure caused by
  a type error is the build working correctly. Fix the type error.
- `pnpm verify:geometry` reads `dist/assets/index-*.css`, so it is meaningless
  before a build. It checks the header/hero geometry resolves to the authored
  frame values *and* that the spacing utilities still reference their custom
  properties instead of repeating literals. See `docs/DESIGN_SYSTEM.md` §8.
- `pnpm verify:contrast` reads `src/styles/theme.css` and asserts 19 colour
  pairings meet WCAG 2.2 AA, **and** that every palette correction is lighter than
  the value it replaced with hue drift under 5°. A correction that redesigns a hue
  fails. See `docs/DESIGN_SYSTEM.md` §2.4.
- `pnpm typecheck` and `pnpm build` can disagree: `build` runs `tsc -b`, which
  typechecks test files that `--noEmit` may have skipped. **A green `typecheck`
  does not imply a green `build`.** Run both.
- Never make a check pass by disabling rules, loosening `strict`, adding
  `@ts-ignore`, or writing assertions that assert nothing.
- Tests must exercise real configuration. Do not copy a route table into a test
  file and assert against the copy.
- Do not write tests that exist only to increase a coverage number.

**Report validation results honestly.** If something failed, say so and include the
output. If something was not run, say that. Never claim a passing check you did
not execute.

---

## 8. Repository map

```text
2026/
├── AGENTS.md                  ← you are here
├── docs/                      ← authoritative documentation
├── index.html
├── scripts/
│   ├── verify-geometry.mjs    ← resolves the built CSS against the Figma frame
│   └── verify-contrast.mjs    ← asserts palette pairings + correction integrity
├── vite.config.ts             ← also holds the Vitest config
├── eslint.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── vite-env.d.ts          ← declares the figma:asset/* module
    ├── app/                   ← routing + pages (application code)
    │   ├── routes.tsx         ← single route table
    │   ├── layouts/
    │   ├── pages/
    │   ├── components/        ← 48 shadcn primitives; only Button is used
    │   └── __tests__/
    ├── content/               ← site copy, separated from components
    │   ├── types.ts
    │   ├── profile.ts
    │   ├── projects.ts
    │   └── services.ts
    ├── lib/                   ← non-UI logic
    │   └── contact/           ← ContactTransport interface + Formspree impl
    ├── components/            ← the real component layer
    │   ├── common/            ← Button (reused shadcn), SocialLinks, SiteFooter,
    │   │                        SectionIntro, ProvisionalBadge, icons
    │   ├── home/              ← Hero, WorkSection, ServicesSection, ProjectCard
    │   ├── contact/           ← ContactSection, ContactForm  (SHARED: the design's
    │   │                        Product Page carries an identical contact section)
    │   └── navigation/        ← NavBar (the snippet's row), SiteHeader (derived),
    │                            SmartLink (route vs anchor)
    ├── imports/               ← superseded generated code — do not import
    ├── assets/                ← Figma-exported binary assets
    ├── styles/                ← Tailwind entry + design tokens
    └── test/                  ← Vitest setup
```

`src/app/components/ui/` holds 48 shadcn primitives. Only `Button`, `Input`,
`Textarea` and `Label` are in use. Do not build a parallel primitive in
`src/components/common/` — extend the shadcn one and retint it through
`theme.css`. Reach for a **native element first**: the contact form uses a plain
`<select>` rather than the shadcn `Select`, because seven fixed options do not
justify a composite widget and the native control needs no ARIA.

Spacing values in `theme.css` are split into **authored primitives**
(`--space-*`, `--size-*`) and **derived values** (`--header-height`,
`--hero-top-pad`). Add new spacing as a primitive and express relationships as
`calc()`; never restate a value that is already implied by another. `pnpm
verify:geometry` enforces this for the header/hero pair.

---

## 9. Reference

| Document | Read it when |
| --- | --- |
| `docs/DESIGN_SYSTEM.md` | Choosing a colour, font, size, radius, or spacing value |
| `docs/FIGMA_IMPLEMENTATION.md` | Translating a Figma frame into React |
| `docs/ARCHITECTURE.md` | Deciding where a file belongs |
| `docs/COMPONENT_GUIDELINES.md` | Creating or modifying a component |
| `docs/INTERACTION_SPEC.md` | Implementing any interactive behaviour |
| `docs/ACCESSIBILITY.md` | Any markup, focus, or contrast decision |
| `docs/QA_CHECKLIST.md` | Before declaring work done |

`guidelines/Guidelines.md` is an unused Figma Make template. It is not a source of
instructions.
