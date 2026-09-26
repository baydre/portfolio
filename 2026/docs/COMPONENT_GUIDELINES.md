# Component Guidelines

Rules for creating and modifying components.

---

## 1. Before you create a component

Work through this in order. Do not skip to step 4.

1. **Search.** Grep for the thing you are about to build. Check
   `src/components/`, `src/app/components/ui/`, and the Figma export.
2. **Can an existing component be extended?** Adding a `variant` or a prop is
   almost always better than a new file.
3. **Is it actually reusable?** Used once? It belongs in the page. Used twice? Make
   it a component. Used in two different screens? Definitely a component.
4. **Is it a real component, or a wrapper with one caller?** A component whose
   only job is to render a prop passed to it, used once, is indirection without
   value.
5. **Only then** — create it.

A component with one caller that adds no behaviour, no variants, and no
reusability is a premature abstraction. A component copy-pasted into three
screens is a duplication bug. The difference is intent.

---

## 2. Naming

Name for **what it is**, not what it looks like and not where it came from.

```text
ProjectCard          ExperienceTimeline     SocialLinks
ContactForm          SiteHeader             SiteFooter
SectionHeading       ToolGrid               ContactCta
ProjectPager         EducationList          ContactList
```

Never:

```text
BlueBox  Section2  Frame123  ComponentA  HomepageThing
Card2    Wrapper    StyledDiv  Thing
```

### Banned: Figma layer names

Figma Make names components after design layers. The current export contains
`Frame`, `Group`, `HeadersV`, `HeroResume`, `Link`. **None of these may enter the
application.** Layer names are an export artefact, not a domain model.

`Link` is additionally a real hazard — it collides with React Router's `Link` and
with the DOM `<a>`. Use `NavLinkItem` or `HeaderNavLink`.

### Plural by default

A component that renders a collection renders the collection. `ProjectGrid` takes
`projects: Project[]`; it does not take `project` and get mapped by every caller.

---

## 3. Component shape

### Typed props, always

```tsx
interface ProjectCardProps {
  project: Project;
  /** Renders the card in a wider format for the homepage hero. */
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  // …
}
```

- Export the props interface if callers may need it.
- Type props explicitly. Do not rely on inference from a default value.
- Prefer a domain type from `content/types.ts` over a loose shape.
- Discriminated unions for genuinely different shapes:

```tsx
type Media =
  | { kind: "image"; src: string; alt: string }
  | kind: "video"; src: string; poster: string; captions: string };
```

### Composable

Accept `children`; expose slots rather than baking in fixed content. Let the caller
decide order and nesting.

### Minimal state

No state in a component that renders static content. A card that needs a hover
state should use CSS. Reach for `useState` only for genuine interaction
(open/closed, selected, submitted). Derive rather than store: if a value can be
computed from props during render, do not put it in state.

### Single responsibility

If a component's name needs "and" — `HeaderAndFooter` — it is two components.

---

## 4. Variants

A Figma variant set is **one component with a prop**, never N components.

```tsx
// ✅
<Button variant="primary" size="lg" tone="danger" />
```

Use `class-variance-authority` — it is already a dependency and already used by
`src/app/components/ui/button.tsx`. Follow that file's pattern.

Rules:

- Variants must be exhaustive and typed (a union, not `string`).
- Every variant must be reachable and visually distinct.
- Do not add a variant that no design uses.
- Do not encode state in a variant *and* in conditional markup.

---

## 5. Accessibility is part of the component

Not a review step. See `docs/ACCESSIBILITY.md`.

- Semantic element first. `<button>` for actions, `<a>`/`react-router` `Link` for
  navigation, `<ul>/<li>` for lists, `<img alt>` for images.
- Interactive element for interactive things. A styled `<div onClick>` is a bug.
- Accessible name on every icon-only control (`aria-label` or visually-hidden
  text).
- Heading level chosen by document outline, not by font size.
- Never remove a focus ring without providing a visible replacement.
- `alt=""` for decorative images — not a missing `alt`.

---

## 6. Styling

- Tailwind utility classes. No CSS-in-JS, no inline `style` for static values.
- **No raw values** — no `#5d5a88`, no `18px`, no `rounded-[44.905px]` in a
  component. Use a token (`docs/DESIGN_SYSTEM.md`).
- Merge conflicting classes with the existing `cn()` helper in
  `src/app/components/ui/utils.ts` rather than overriding by repetition.
- Keep class strings readable; extract a `const` for a long or repeated set.
- Responsive by default. If a component only works at one width, it is not done.

---

## 7. Files

```text
components/<domain>/<ComponentName>.tsx
```

- One component per file (a tiny co-located helper is fine).
- No barrel `index.ts` re-export files. Import the file directly.
- Named exports. No default exports, except `app/App.tsx` (entry point) and
  `main.tsx`.
- Colocate a test as `<ComponentName>.test.tsx` only when there is real behaviour
  to assert.

---

## 8. Review checklist

Before opening a PR for a component:

- [ ] Searched for an existing equivalent; extended rather than duplicated
- [ ] Name is semantic, not a Figma layer name or a colour
- [ ] Props typed; variants exhaustive and design-backed
- [ ] Semantic HTML; interactive elements are `<a>`/`<button>`
- [ ] Accessible name; meaningful `alt`
- [ ] Focus visible; keyboard operable
- [ ] No raw hex/px values; tokens only
- [ ] Works at 375px and 1440px
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass
- [ ] No new dependency without stated justification

---

## 9. Existing inventory

`src/app/components/ui/` contains 48 shadcn/Radix primitives. They typecheck and
lint cleanly, but **none is currently used by any page**.

They are a menu, not a decision. Before using one, confirm it matches the design
and that its variants fit the tokens in `docs/DESIGN_SYSTEM.md` — several ship
with styling assumptions that may not survive token replacement.

`src/app/components/figma/ImageWithFallback.tsx` is unreferenced. Retain it only
if the final design needs graceful image failure; otherwise remove it in the
cleanup phase.
