# Interaction Specification

> **Status: MIXED.** The HomePage snippet has been supplied and it still
> specifies **no** interactions — the header and hero are static `<div>`s with no
> `onClick`, no hover state, no focus style and no responsive variant. The
> superseded export likewise specified none.
>
> So the navigation behaviour in §2 is **built but unconfirmed**: it exists
> because an unlabelled, stateless, un-focusable header fails WCAG 2.4.7 and
> 4.1.2, not because the design asked for it. Everything below is grouped by
> confidence so the confirmed parts can be locked in first.

---

## 1. Confidence legend

| Marker | Meaning |
| --- | --- |
| **[D]** | Design specifies it — implement as written |
| **[I]** | Implied by the design's structure; safe inference |
| **[P]** | Proposal — not in the design; needs confirmation |

---

## 2. Navigation

### 2.1 Desktop — geometry **[D]**, behaviour **[P]**

`AUTHORITATIVE` geometry, from the HomePage snippet: 84px side gutters, 22px
block padding, `space-between` layout, a left nav with a 12px gap, and a right
cluster — three social tiles then a filled **"Hire me"** button — with a 16px
gap. Nav entries are **Work, About, Contact**.

`DERIVED` behaviour, built but not specified by the design:

- Active route is visually distinct, via `NavLink`'s `isActive` — never local
  state. Implemented with an `underline-offset-8` underline.
- The nav has **no logo**, because the snippet has none. There is therefore no
  home link; the hero wordmark is the brand mark. A skip link precedes the
  header so keyboard users are not forced through the nav on every page.
- Routes navigate via react-router `<Link>`; section anchors render as plain
  `<a href="/#work">` so they scroll natively and work before hydration.
  `SmartLink` picks between them from `NavItem["kind"]`.
- The "Hire me" CTA is filled (`#E9E9EC` on `#131417`) and points at `/#contact`.
  **[D]** distinct in the design.
- The header is `sticky`. The snippet absolutely positions it at `top: 0`, which
  does not distinguish sticky from static; at rest the two are visually identical
  because they share the page background. **[P]** confirm.
- The "Hire me" CTA is a single `<a href="/#contact">` styled as the button,
  shared by the desktop cluster and the small-screen panel as `HireMeButton`. The
  snippet nests a `<div>` fill inside a `<button>`; collapsing to one element
  avoids a button-inside-a-link, and the padding/radius/weight come from the
  shadcn `default` variant, which already matches. `h-auto` is required because
  the variant pins `h-9` (36px) against the snippet's 36.3px content height.
  Its colour comes from the variant too, and must not be overridden with a
  custom `--text-*` size token: tailwind-merge resolves an unrecognised `text-*`
  class against both the font-size and text-colour groups, so `text-cta` deleted
  `text-primary-foreground` and left #e9e9ec text on a #e9e9ec fill. Pinned by
  `HireMeButton.test.tsx`.
  Note `rounded-md` is 8px here — `theme.css` remaps the radius scale, so
  `rounded-lg` would be 12px and wrong. **[D]**
- The rule between the socials and the CTA is a flat 1px `#666666` stroke at 40%
  opacity with a 1.1px blur, `align-self: stretch`. This comes from Figma's CSS
  export, which overrides the snippet's `<linearGradient>` — see
  `docs/DESIGN_SYSTEM.md` §6. The snippet's `min-h-screen absolute
  left-[168px] top-0` is canvas placement, not layout.
- Social tiles are 40 × 40, `#F0F2F5`, 8px radius, containing a 20px glyph. They
  are `<a>` elements with `sr-only` labels here; the snippet renders unlabelled
  `<div>`s, which is a WCAG 4.1.2 failure. **[D]** fix required.
- Social tile hover is an 80% opacity fade. **[P]** — the snippet specifies none.

### 2.2 Mobile — **[P]**

**The design has no mobile variant.** A menu has to be designed. Built as a
baseline, subject to confirmation:

- Text nav and right cluster hide below `md`; a menu button appears.
- The button toggles a panel with the same links in the same order, plus the
  social tiles and the CTA.
- `aria-expanded` and `aria-controls` reflect state; the toggle's accessible name
  changes between "Open menu" and "Close menu".
- `Escape` closes the panel; so does following any link in it, because the panel
  is reset on route change.
- **Focus is not currently moved into the panel or trapped while open.** That is
  a known gap — see `docs/ACCESSIBILITY.md` and the open questions in §9. It
  should be finished, or replaced with a `<dialog>`-based menu that traps focus
  natively.
- Do not hide navigation entirely on small screens.

### 2.3 Route transitions — **[P]**

No cross-fade or slide. Add only if requested. If added, respect reduced motion
(§7). A portfolio gains nothing from a 300ms fade on every navigation.

---

## 3. Project cards

Present on the homepage: an image, a category label, and a title.

| State | Behaviour | Conf. |
| --- | --- | --- |
| Rest | Card at rest | **[D]** |
| Hover | Slight scale on the card, a contained zoom on the image | **[P]** — the live `HomePage.tsx` does this; the design does not specify it |
| Focus | Visible focus ring on the whole card | **[P]** — required by `docs/ACCESSIBILITY.md` |
| Click | Navigate to `/projects/:slug` | **[D]** |

Implementation notes:

- The **entire card** is the link. One `<Link>` wrapping the card. Do not nest a
  second link inside it.
- The image is decorative given an adjacent title — use `alt=""` and let the
  title carry the name. This also avoids six screen-reader announcements of
  "ID Gentify".
- Hover must be reachable by keyboard. If hover reveals anything, the same state
  must appear on `:focus-visible`.
- **Current defect:** all six cards in `HomePage.tsx` share `id: "id-gentify"`, so
  every card links to the same route. Fixed by the content model.

---

## 4. Project detail page

### 4.1 Structure — **[D]**

The design's product page contains, in order: title, a project meta grid
(`Role`, `Duration`, `Client`, `Type`, plus a `Website link`), a
`Languages and Frameworks` section, a `Tools` section, `The Challenge`, and
`The Solution`.

**None of the meta grid exists in the live `ProjectPage.tsx`**, which instead has
a `Stack & Tools` grid. The design's version is the requirement.

### 4.2 Previous / next project — **[D]**

The design includes `Previous Project` and `Next Project`.

**This does not exist in the live app at all.** It is a required feature.

- Links to the adjacent projects by `slug` — from the content model, not from
  array position arithmetic at render time.
- At the first and last project, one side is absent (or disabled with a clear
  non-interactive state). Decide which; do not link to `/projects/undefined`.
- Real `<Link>` elements, reachable by keyboard, with discernible accessible names
  — "Previous project: ID Cardify", not bare "Previous".

### 4.3 Image gallery — **[D]** · and the Work carousel — **[D]**

The design shows multiple screenshots. Whether they are a grid, a carousel, or a
lightbox is **not specified** — the design is static.

**Gallery: unchanged, still a static responsive grid.** No gallery has been
built. The reasoning below is retained because it is what a carousel has to earn,
and one now has.

**Work section carousel: decided 2026-09-27, on the owner's explicit request.**
This subsection previously read "a carousel … must not be added just because it
is possible" and the ledger row read "static grid unless a carousel is explicitly
wanted". The owner asked for it, which is the condition that row was waiting on,
so the cost below is paid deliberately.

- **Scope.** One slider over all six projects, IdCardify included. The cards
  keep the frame's anatomy and the section's authored geometry; only how many
  are on screen at once changed.

  An earlier build of this pinned IdCardify as a static card above a carousel of
  the other five, on the reading that the design's first card was a featured one.
  The owner corrected it the same day: it presented the section as one real
  project plus five lesser ones, which is the opposite of what six real projects
  on a rotation should say. There is now no featured/rotating split, one ordered
  list, and the labels run `01`–`06` straight from the top.
- **Interval 6s**, chosen by the owner.
- **WCAG 2.2.2 Pause, Stop, Hide — paid by gesture, not by a control.** The
  rotation auto-updates, so a pause mechanism is required. The owner's directive
  was that the section read as one automatic slider and that nobody has to click
  anything to see the work, so a visible Pause/Resume button and the
  previous/next arrows were **removed** (2026-09-27). What stops it instead:
  hovering the slider, focusing into it, or pressing and holding it; release
  starts a full 6s turn of grace. Hover and focus were already required for
  keyboard parity, and press-and-hold was added because **a phone has no cursor**
  — without it a touch user had no mechanism at all and the card slid away
  mid-read.

  Recorded honestly: gestures are a weaker reading of 2.2.2 than a labelled
  control, because they must be discovered and a screen-reader user has to reach
  the slider with a pointer to try one. The owner's call, not a claim of full
  conformance. The dot row is the one always-visible control that remains.
- **`prefers-reduced-motion` — paid.** Autoplay does not start at all when the
  preference is set, and the fade is gated on `motion-safe:`. Turning the setting
  on mid-session stops the rotation. A visitor who then presses Resume has asked
  for the motion explicitly and gets it — the preference suppresses the default,
  it does not remove the control.
- **No focus trap.** Off-screen slides carry the `hidden` attribute, so they are
  out of the accessibility tree and out of the tab order. Consequence, and the
  reason it is asserted in a test: the slide `<li>` must never take a `display`
  utility, or `display: flex` would beat the UA sheet's `[hidden] { display: none }`.
- **No slide announcements.** No `aria-live` region. A polite live region behind
  a 6s timer interrupts a screen reader every 6 seconds, which is the "slide
  announcements" cost named above and is worse than silence. Instead every
  project is named in the dot row's accessible labels, so all five are
  discoverable without waiting for a turn.
- **Pause on engagement.** Hovering the region or focusing into it stops rotation
  until the pointer or focus leaves, so a card cannot slide out from under
  someone reading it. Moving focus *between* controls inside the region does not
  resume it.
- **Rotation never steals focus** or reorders the document.
- **Not decided here:** the image gallery above, which remains a static grid.

### 4.4 External links — **[I]**

The meta grid's `Website link` points off-site.

- Render with `<a href target="_blank" rel="noopener noreferrer">`.
- Announce the destination — e.g. an "(opens in a new tab)" visually-hidden suffix.

### 4.5 The `projectId` parameter — **[D]**

`ProjectPage` currently ignores `projectId` and always renders the same
placeholder. It must look the project up from `content/projects.ts` and render
`NotFoundPage` for an unknown slug.

---

## 5. Resume

### 5.1 Download — **[P]**

No download affordance appears in the design. If added:

- A real file in `public/`, linked with a download attribute.
- Not a `data:` URI generated in the browser.

### 5.2 External certification links — **[P]**

If certifications link to issuer sites, same rules as §4.4.

### 5.3 Print stylesheet — **[P]**

A resume is a document people print and attach to applications. A print
stylesheet is cheap and high-value: hide nav and footer, force black-on-white,
expand link URLs, avoid page-breaks inside entries. Recommend adding.

### 5.4 Current defects to fix — **[D]**

`ResumePage.tsx` hardcodes four identical experience entries, four identical
education entries, and three identical referees. These are export artefacts, not
content, and must move to the content model.

---

## 6. Contact

### 6.1 What the design supplies

The Contact frame supplies **four underlined rows of placeholder text and a
chevron**. It contains no `<input>`, no `<select>`, no `<label>`, no submit
control, and no endpoint. The placeholder is doing the label's job, which fails
WCAG 2.2 AA 3.3.2 (Labels or Instructions) and leaves the form unusable with a
screen reader, since a placeholder is not an accessible name. There is also
nothing to click.

So the form is **implemented**, not copied. Owner-confirmed 2026-09-26: visible
labels, placeholders as supplementary guidance only, a real state machine, and
Formspree as the initial transport.

### 6.2 State machine

```
        ┌──────────────────────── retry ─────────────────────┐
        │                                                    │
   ┌────▼───┐  submit   ┌────────────┐  confirmed  ┌─────────┐
   │  idle  │──────────▶│ submitting │────────────▶│ success │
   └────┬───┘           └─────┬──────┘             └─────────┘
        │                     │ error                    │ "Send another"
        │                     ▼                          ▼
        │                ┌────────┐                    ┌──────┐
        └─ validation ──▶│ error  │                    │ idle │
                         └────────┘                    └──────┘
```

- **`idle → submitting`** only after local pre-flight passes (required fields, an
  email shape check). This avoids a pointless round trip; the transport still
  re-validates server-side and its per-field errors are merged back in.
- **`submitting → success`** is reachable **only** when the transport returns
  `{ ok: true }`, which the Formspree transport returns only for a 2xx *with a
  parseable body*. A 2xx whose body cannot be read is treated as a failure,
  because delivery is unconfirmed. This is the single most important property in
  the file and is asserted in `formspree.test.ts`.
- **`submitting → error`** covers a reported failure, a thrown `TransportError`
  (network, no response), a rate limit, and a server-side field rejection.
- **`error → idle`** on retry. The send affordance is restored and fields are kept.
- There is deliberately **no `success → idle` auto-reset**. A success state that
  clears itself is indistinguishable from a form that never sent.
- A `TransportError` is **caught and reported**, never swallowed into a success.

### 6.3 Accessibility

- Every field has a visible `<label>`; placeholders are supplementary.
- The topic control is a **native `<select>`**, not the shadcn/Radix Select. Seven
  fixed options with no search or grouping do not justify a composite widget; the
  native control is keyboard- and screen-reader-correct without ARIA, works
  without JavaScript, and avoids a jsdom gap (`hasPointerCapture` is
  unimplemented) that would otherwise force a test polyfill.
- One `role="status" aria-live="polite"` region announces every state change.
  Polite, so a failure does not interrupt a screen-reader user mid-sentence.
- `aria-invalid` plus `aria-describedby` wire each message to its input.
- A honeypot field (`company`) is `aria-hidden`, off-screen and `tabIndex={-1}`,
  so it cannot be reached by keyboard but is still submitted.
- Field errors and the failure message use `--destructive`, corrected to clear
  4.5:1 (`docs/DESIGN_SYSTEM.md` §2.3).
- The honeypot aside, focus is **not** moved to the success panel programmatically
  beyond its `autoFocus`; a full focus-management review is **[P]**.
- **Escape returns focus to the toggle.** Not cosmetic: the panel is removed with
  `hidden`, so a link holding focus becomes unfocusable and the browser drops
  focus to `<body>`, restarting the tab order from the top of the document
  (WCAG 2.4.3). Asserted in `SiteHeader.test.tsx`.

### 6.4 Transport

`ContactTransport` (`src/lib/contact/types.ts`) is an interface, not a Formspree
call, so the UI is written once and the mechanism can be replaced without touching
a component. `src/lib/contact/index.ts` is the only module that knows which
transport is in use — moving to a personal API is a change to that file alone.

- **Configured** when `VITE_FORMSPREE_FORM_ID` is set.
- **Unconfigured** otherwise: the form renders an explanation and the real
  `mailto:` address, and the transport refuses to submit locally rather than
  posting to a nonsense URL. It never reports success. This is deliberate — a
  deployed build with no form ID should say so.
- `ContactForm` takes its transport as an optional prop, defaulting to the
  configured one, so the state machine is tested against a stub without mocking
  the module graph.

## 7. Animation

### 7.1 Principles

- **Animation is not a goal.** It must serve orientation, feedback, or emphasis.
- Nothing animates on load without a reason. No entrance animations on content
  the user came to read.
- Durations 150–300ms for feedback, ease-out. Longer for larger transitions.
- Animate `transform` and `opacity`. Animating layout properties causes jank.
- Never animate on scroll by default. If scroll effects are added, they must be
  subtle, must not hide content, and must degrade to "visible".

### 7.2 Candidates

| Effect | Conf. |
| --- | --- |
| Card hover scale / image zoom | **[P]** |
| Menu open/close | **[P]** |
| Route transition | **[P]** |
| Scroll-reveal | **[P]** — recommend **against** by default |
| `canvas-confetti` | **[P]** — installed, unused. Recommend **against**: decorative, distracting, and an accessibility risk |

`motion` (Framer Motion) is declared but unused. Do not reach for it reflexively —
CSS transitions cover hover and menu states. Add it only when a real interaction
needs it.

### 7.3 Reduced motion — **[D]**

Non-negotiable.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This snippet belongs in `src/styles/`. Under reduced motion, content must still
be visible and reachable — reduced motion means *less* movement, never *no*
content.

---

## 8. Interaction requirements by element

| Element | Requirement | Conf. |
| --- | --- | --- |
| Header nav link | Real navigation; distinct active state | **[D]** |
| `Contact me` (header + CTA) | Must do something real | **[D]** |
| Project card | Whole card is one link; hover mirrored on focus | **[D]** / **[P]** |
| Previous / Next project | Real links; absent at the ends | **[D]** |
| Website link | `target="_blank"` + `rel="noopener noreferrer"` + announced | **[I]** |
| Social link | External link, accessible name | **[I]** |
| Contact submit | Four-state machine, never faked | **[D]** |
| Mobile menu | Disclosure pattern, `aria-expanded`, `Escape`, focus return | **[P]** |
| Gallery | Static grid unless a carousel is explicitly wanted | **[P]** |
| Work carousel | Explicitly wanted 2026-09-27; corrected twice — one slider over all six, buttons removed, pauses on hover/focus/press; reduced-motion, no trap, no `aria-live` | **[D]** |
| Anything animated | Honours `prefers-reduced-motion` | **[D]** |

---

## 9. Open questions for the design source

Answered by the HomePage snippet: the nav entries, the "Hire me" label, the
header geometry, the social tile treatment, and the three type sizes.

Still open:

1. The LinkedIn and X URLs. The footer's Connect column now names GitHub,
   LinkedIn and X — the first evidence of what the header's three identical
   placeholder squares are — but only the GitHub handle is confirmed. Both other
   URLs are flagged `unverified` in `content/profile.ts`.
2. The real hero image, the six service illustrations (one is an empty div in the
   export), and the four work images. Local placeholders stand in.
4. Whether the header is sticky or static.
5. Whether `/resume` survives, given the design has no Resume nav entry. Note the
   design's header and footer disagree about Services.
6. Whether "Maison Neue" is ever licensed. Currently substituted with Outfit
   (`TEMPORARY`); see `docs/DESIGN_SYSTEM.md` §3.1.
7. The Product Page layout, and real Challenge/Solution copy. The block order is
   known but no snippet was supplied.
8. Focus management for the form's success panel (§6.3).

---

## 10. Superseded

This document previously described the `src/imports/` export, which is now
**superseded** by the HomePage snippet. Its "0 interactions measured" findings
still hold and are the reason §2 is marked `[P]` rather than `[D]`.

1. Does the header stay fixed while scrolling, or scroll away?
2. Is there a mobile navigation design, or must one be designed?
3. How are project screenshots presented — grid, carousel, or lightbox?
4. What should `Contact me` actually do? Is there a form, a mail service, or an
   external link?
5. Do certifications link anywhere?
6. Are hover effects intended on cards at all?
7. Is the header `Contact me` a link to a contact section, or a separate page?
8. Should the header be visible on the 404 page?
