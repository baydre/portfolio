# Architecture

> **Status: target architecture. Not yet implemented.**
> The current source tree does not match this document. Sections marked
> *PLANNED* describe structure to build when the Figma snippets arrive. See §7 for
> the gap analysis.

---

## 1. Principles

1. **Routing is separate from page presentation.** One route table; pages render.
2. **Reusable components are separate from pages.** A page composes; it does not
   define shared UI.
3. **Portfolio content is separate from UI.** Data lives in `src/content/`, is
   typed, and reaches components through props.
4. **Generated Figma code is quarantined.** It is never imported by application
   code.
5. **Design tokens are centralised.** One file. No raw values in components.
6. **Assets are managed once.** No duplication, meaningful names, real extensions.
7. **Duplication is a defect.** Two copies of anything means one is missing.

---

## 2. Target structure

```text
src/
├── main.tsx                     # entry: mounts <App/>
├── vite-env.d.ts                # vite/client + figma:asset/* declaration
│
├── app/                         # ── APPLICATION SHELL ──────────────────
│   ├── App.tsx                  # provides the router
│   ├── routes.tsx               # the single route table (exported for tests)
│   ├── layouts/
│   │   └── Layout.tsx           # header + <Outlet/> + footer
│   ├── pages/                   # one file per route
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ResumePage.tsx
│   │   ├── ProjectPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── __tests__/               # route + page tests
│   └── components/
│       └── ui/                  # 48 shadcn/Radix primitives (currently unused)
│
├── components/                  # ── PORTFOLIO COMPONENTS (PLANNED) ─────
│   ├── common/                  # Section, SectionHeading, Container, Prose
│   ├── navigation/              # SiteHeader, SiteFooter, NavLink, MobileNav
│   ├── projects/                # ProjectCard, ProjectGrid, ProjectMeta,
│   │                            #   ProjectPager, ProjectGallery
│   ├── about/                   # ProfileSection (built 2026-09-26)
│   ├── resume/                  # ExperienceTimeline, EducationList,
│   │                            #   CertificationList, SkillMatrix
│   └── contact/                 # ContactForm, ContactCta
│
├── content/                     # ── CONTENT MODEL (PLANNED) ────────────
│   ├── profile.ts               # name, role, bio, contact, socials
│   ├── projects.ts              # Project[]
│   ├── experience.ts            # Experience[]
│   ├── education.ts             # Education[]
│   ├── skills.ts                # Skill[], grouped by category
│   ├── certifications.ts        # Certification[]
│   └── types.ts                 # the shared types
│
├── imports/                     # ── GENERATED REFERENCE (do not import) ─
│   │                            #   excluded from tsconfig + eslint
│   └── …
│
├── assets/                      # binary assets, meaningful filenames
├── styles/                      # index.css → tailwind, theme (tokens), fonts
└── test/                        # Vitest setup
```

### Layer rules

| Layer | May import | Must never |
| --- | --- | --- |
| `app/pages/` | `components/`, `content/`, `app/` | contain layout algorithms or data literals |
| `components/` | `components/`, `styles` | import from `app/` or `content/` directly\* |
| `content/` | nothing but types | contain JSX, CSS, or components |
| `imports/` | — | be imported by anything |

\* A component may import a *type* from `content/types.ts`; it must not import data.

**Direction of dependency:** `app/pages` → `components` → `styles`. Content flows
the other way, as props, downward-in from pages. `content/` never imports a
component.

---

## 3. The content model

Portfolio content must not be embedded in page components.

**This is a studio, not an individual.** The HomePage snippet describes
"BaydreAfrica designs and builds brands, websites, and software", so the model is
project- and service-shaped. The previous personal-portfolio model
(`experience`, `education`, `skills`, `certifications`) describes an individual
CV and is **not** appropriate here. What a studio actually needs is
`services`, `case studies`, `clients` and `testimonials` — the previous site
already had testimonial and counter imagery, which supports this.

Current state — three files exist, covering only what the design supplied:

```text
content/
├── types.ts        # Profile, NavItem, SocialLink, HeroImage
├── profile.ts      # wordmark, tagline, description, nav, socials, CTA label
└── projects.ts     # work index (titles recovered, copy still placeholder)
```

`experience.ts`, `education.ts`, `skills.ts` and `certifications.ts` are **not
created**. Do not create them speculatively. `ResumePage` still holds that
placeholder content inline until a decision is made about the resume route.

Do not invent marketing claims. Where a snippet gives copy, use it verbatim.
Where it does not, leave the gap visible rather than filling it with plausible
sounding text — the `Hero` currently carries a real `placehold.co` gap and a
local stand-in image for exactly this reason.

A `Service` type and a services list were **removed** again during
implementation: the snippet has no services section, so the type had no
consumer. Add it back when the section is designed.

```ts
// content/projects.ts — Project is declared alongside its data, because nothing
// else consumes it yet. Move it to types.ts if a second module needs it.
export interface Project {
  id: string;                 // URL segment: /projects/:id
  title: string;
  category: string;
  image: string;
  imageAlt: string;
}
```

```ts
// content/types.ts
export interface Project {
  slug: string;              // URL segment: /projects/:slug
  title: string;
  category: string;
  summary: string;
  coverImage: string;
  role: string;
  duration: string;
  client: string;
  type: string;
  websiteUrl?: string;
  gallery: string[];
  challenge: string[];
  solution: string;
  features: string[];
  stack: string[];
  prevSlug?: string;
  nextSlug?: string;
}
```

Usage — the page supplies data, the component knows nothing about the portfolio:

```tsx
// app/pages/ProjectPage.tsx
const project = projects.find((p) => p.slug === projectId);
if (!project) throw new Response("Not Found", { status: 404 });

return (
  <article>
    <ProjectHeader project={project} />
    <ProjectMeta project={project} />
    <ProjectGallery images={project.gallery} altPrefix={project.title} />
  </article>
);
```

```tsx
// components/projects/ProjectCard.tsx
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.slug}`} className="group block">
      <img src={project.coverImage} alt="" className="aspect-[3/4] object-cover" />
      <p>{project.category}</p>
      <h3>{project.title}</h3>
    </Link>
  );
}
```

**Current anti-pattern, to be fixed:** `src/app/pages/HomePage.tsx` hardcodes a
6-element `projects` array inside the component, in which all six entries share
`id: "id-gentify"` and the title "ID Gentify", so every card links to the same
route. `ResumePage.tsx` similarly hardcodes four identical jobs, four identical
degrees and three identical referees.

**Decision: do not create `src/content/` yet.** Per `AGENTS.md` §3, it is built
when the authoritative snippets arrive, so the shapes match the real design once
rather than being rewritten.

---

## 4. Routing

`src/app/routes.tsx` is the single source of truth. It exports the route table
separately from the router instance so tests can mount the real configuration:

```tsx
export const routes = [ /* … */ ];
export const router = createBrowserRouter(routes);
```

| Path | Page | Notes |
| --- | --- | --- |
| `/` | `HomePage` | index: Hero, Work, Services, Contact |
| `/about` | `AboutPage` | built from the **About frame** (2026-09-26): profile section + an `ASSUMED` closing panel |
| `/resume` | `ResumePage` | retained, **unlinked** — see below |
| `/projects/:projectId` | `ProjectPage` | dynamic; the design file calls this the "Product Page" |
| `*` | `NotFoundPage` | catch-all |

**Work, Services and Contact are homepage sections, not pages.** The evidence is
the design's own footer: its Navigate column lists **Home, Work, Services,
Contact**, and the Figma file contains no work, services or contact screen. The
supplied snippet emitted all three as `<button>` elements because Figma Make does
not distinguish a link from a button. So the header links `/#work` and
`/#contact`, the footer links `/#services` among others, and `/work` and
`/contact` no longer exist. Owner-confirmed 2026-09-26. `router.test.tsx` asserts
both that `/work` and `/contact` 404 and that the three sections exist, so this
cannot silently regress.

`NavItem` is therefore a discriminated union — `{ kind: "route", to }` or
`{ kind: "anchor", to }` — rather than one type with an optional hash. The union
means the router cannot be handed an anchor where it expects a path.
`SmartLink` is the only component that branches on it, and it renders anchors as
plain `<a href>` so they scroll natively, work before hydration, and stay
copyable and middle-clickable.

**"Product Page" vs "project".** The design file calls the detail screen a
Product Page. The application and the route call it a project, and
`/projects/:projectId` was explicitly kept rather than renamed to
`/products/:productId`. Owner-confirmed 2026-09-26.

**The nav follows the snippet, not the old site.** The design specifies
**Work / About / Contact** with a **"Hire me"** call to action. The previous
nav was Home / About / Resume / "Contact me". There is no Resume entry in the
design, so `/resume` is no longer linked from the header — but the route and its
content still exist, because deleting a page is a content decision. Confirm
whether a studio portfolio keeps a resume before removing it. Note the design's
own header and footer disagree: the header omits Services, which the footer lists.

Rules:

- Every page renders inside `Layout` (header + `<Outlet />` + footer). No page
  renders its own header or footer.
- Add a route here and nowhere else.
- Use `SmartLink` for anything from `navItems` / `footerNavItems`; it picks
  `<Link>` or `<a>` from the item's `kind`.
- Derive active state from `useLocation()`, never from local state. An anchor's
  active state is "current page AND matching fragment" — `NavLink` cannot express
  that, since it compares pathnames only.
- A dynamic route that cannot resolve its parameter should `throw new Response(…,
  { status: 404 })` so the catch-all handles it. `ProjectPage` currently ignores
  `projectId` entirely and always renders "ID Gentify" — placeholder behaviour to
  be replaced.

---

## 5. Styling

```text
src/styles/
├── index.css      # entry: @import fonts, tailwind, theme  (imported by main.tsx)
├── tailwind.css   # @import 'tailwindcss' source(none) + @source globs
├── theme.css      # ALL design tokens + @theme inline mapping
└── fonts.css      # @font-face declarations
```

Current problems to resolve:

- `fonts.css` is **0 bytes** — no webfont is actually loaded.
- `globals.css` is **0 bytes** and is not imported at all. Delete it.
- `theme.css` holds the stock shadcn token set, unrelated to the Figma design, and
  the live pages bypass it with hardcoded hex values.
- The `.dark` block exists but the class is never applied.

Rules:

- Components use utility classes and tokens only. No inline `style` objects for
  static values.
- No raw hex, px, or rem literal in a component.
- One `@theme inline` block maps tokens to Tailwind utilities. Add to it, do not
  create a parallel system.

---

## 6. Assets

- One canonical copy each, in `src/assets/`, with a **meaningful filename**
  (the current content-hash names must be replaced).
- Extensions must match reality: 7 of 9 current `.png` files are actually JPEG.
- Prefer importing over the `figma:asset/*` specifier in application code.
- Every `<img>` needs `alt`; decorative images take `alt=""`.
- Right-size before shipping — the current 4096×2731 / 5.5 MB asset must not reach
  production.

---

## 7. Current state vs target

Measured against the current repository:

| Area | Current | Target | Gap |
| --- | --- | --- | --- |
| `components/` (portfolio) | **4 layers** — `common/`, `home/`, `contact/`, `navigation/` | as snippets arrive | about, resume, product layout |
| `content/` | **4 modules** — `types`, `profile`, `projects`, `services` | as snippets arrive | service copy, real projects |
| `app/components/ui/` | 48 shadcn files, **1 used** (`Button`) | keep, use deliberately | prune the other 47 |
| Reachable from `main.tsx` | was 14 of 66 | — | header/hero now reachable; ~50 still dead |
| Runtime dependencies used | **react, react-dom, react-router** only | — | ~40 declared, unused |
| `src/imports/` | 3,758 lines, **0 imported**, superseded | quarantine | remove once unreferenced |
| Routes | 5, all working | as design arrives | about is now built from its frame; resume has no design, Product Page layout unbuilt |
| Breakpoints in design | **0** | per breakpoint | must be designed |
| Fonts | 3 self-hosted variable families | as licensed | Maison Neue → Outfit, `TEMPORARY` |
| 5.4 MB asset | **no longer bundled** | — | fixed; still on disk |
| TypeScript | `strict`, builds | — | done |
| Lint / test | 52 tests, all green | — | done |
| Contrast | 19 pairings verified | all AA | done — `pnpm verify:contrast` |
| Contact form | real state machine, no backend configured | Formspree ID | set `VITE_FORMSPREE_FORM_ID` |

### Dead code inventory

- `src/imports/**` — 4 files, 3,758 lines, not imported by anything.
- `src/app/components/ui/**` — 48 shadcn primitives, not imported by any page.
  (They do typecheck and lint cleanly, so they are harmless, but they are unused
  weight. Decide: adopt deliberately, or remove.)
- `src/styles/globals.css` — 0 bytes, not imported.
- `src/assets/a74e1cbc….png` — 4096 × 2731, 5.4 MB. No longer referenced by any
  page, so it has dropped out of the bundle, but it is still on disk. Delete it
  once `src/imports/` is resolved.
- `src/app/components/figma/ImageWithFallback.tsx` — was imported twice and never
  rendered; those imports have been removed. Currently unreferenced.
- Unused dependencies (13): `@emotion/react`, `@emotion/styled`,
  `@mui/icons-material`, `@mui/material`, `@popperjs/core`, `canvas-confetti`,
  `date-fns`, `motion`, `react-dnd`, `react-dnd-html5-backend`, `react-popper`,
  `react-responsive-masonry`, `react-slick`. **Not removed** — pruning requires
  confirmation that nothing is planned, and `motion` in particular is a candidate
  for the animation work in `docs/INTERACTION_SPEC.md`.
- Duplicated assets: all 9 files exist byte-identically in both `src/assets/` and
  `src/imports/`.

**No dead code is deleted as part of the documentation/tooling phase.** The above
is an inventory for a later, deliberate cleanup.

---

## 8. Adding things — where does it go?

| Adding | Goes in | Not in |
| --- | --- | --- |
| A new page | `app/pages/` + a route in `app/routes.tsx` + a `Layout` nav entry | a new layout |
| A shared UI block | `components/<domain>/` | a page |
| Portfolio data | `content/` | a component or page |
| A design token | `styles/theme.css` | a component |
| A route | `app/routes.tsx` | anywhere else |
| An interaction | per `docs/INTERACTION_SPEC.md` | invented ad hoc |

---

## 9. Deferred

The following are **intentionally not implemented** and must not be started until
the authoritative Figma snippets arrive:

- [ ] `components/` portfolio component library
- [ ] `content/` model
- [ ] Homepage (the current export contains no `Homepage.tsx`)
- [ ] `theme.css` token rebuild
- [ ] Real font loading (`fonts.css`)
- [ ] Responsive implementation
- [ ] `src/imports/` migration or removal
- [ ] Dependency pruning
