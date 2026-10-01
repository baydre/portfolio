# Design System

> **Status: PARTIALLY AUTHORITATIVE.**
> The Figma **HomePage snippet has been supplied** and is the source of truth for
> everything in §2–§5. Those values are final unless the client says otherwise.
>
> The **About frame has since been supplied** (2026-09-26) and covers §6.1. Work,
> Project, Contact and Resume remain sections or screens with no frame of their
> own — Work, Project and Contact are homepage sections, so the HomePage snippet
> already covers them. **Resume** is the one screen still built entirely on
> **assumptions**, marked `ASSUMED` below and not covered by any design.
>
> The previous Figma Make export in `src/imports/` is **SUPERSEDED**. Its values
> are recorded in §7 for reference only and must not be cited as the design.

---

## How to read this document

| Label | Meaning |
| --- | --- |
| `AUTHORITATIVE` | Measured directly from the supplied HomePage snippet. Use it. |
| `DERIVED` | Not in the snippet. Chosen to complete the token set. Change freely. |
| `ASSUMED` | No design exists yet. An implementation decision, not a design value. |
| `PENDING` | Cannot be decided until a further snippet arrives. |

Contrast ratios are measured, not estimated (`scripts` in this repo's history
contain the calculation; recompute rather than trusting a stale number).

---

## 1. Token method

Design tokens are CSS custom properties in `src/styles/theme.css`, exposed to
Tailwind through `@theme inline`.

Rules:

1. **Name by role, not by appearance.** `--color-surface`, never `--color-light-grey`.
2. **No raw values in components.** A component may not contain `#E9E9EC` or
   `180px`. If a value is needed, it needs a token. The one deliberate exception
   is a fluid `clamp()` in `@theme`, because it cannot live in `:root` and be
   responsive at the same time.
3. Raw values are permitted **only** inside `theme.css`.

---

## 2. Colour

`AUTHORITATIVE` — all five values are from the snippet. Every pair was measured
against the `#131417` ground.

| Token | Value | Role | Contrast on `#131417` |
| --- | --- | --- | --- |
| `--background` | `#131417` | page ground | — |
| `--foreground` | `#E9E9EC` | body + nav copy | **15.20:1** |
| `--foreground` | `#FFFFFF` | the wordmark only | **18.42:1** |
| `--surface` | `#F0F2F5` | social tile | **16.42:1** |
| `--surface-foreground` | `#344054` | icon glyph on that tile | **9.33:1** on `#F0F2F5` |
| `--primary` | `#E9E9EC` | "Hire me" fill | — |
| `--primary-foreground` | `#131417` | "Hire me" label | **15.20:1** on `#E9E9EC` |

**The palette is excellent.** Every text pair clears WCAG AA (4.5:1) by more than
3×, and the wordmark clears AAA. No adjustment needed.

### 2.1 Derived values

`DERIVED` — the snippet is flat. It contains **no borders, panels, muted text or
hover states**, but the shadcn token contract requires them, so they were filled
in. Treat these as free parameters.

| Token | Value | Contrast on ground | Verdict |
| --- | --- | --- | --- |
| `--muted-foreground` | `#A8A7B0` | **7.74:1** | PASS for body text |
| `--secondary` / `--muted` | `#1C1D22` | 1.09:1 | see below |
| `--accent` | `#23242A` | 1.19:1 | see below |
| `--border` | `rgb(233 233 236 / 0.14)` | 1.36:1 | see below |
| `--destructive` | `#D4183D` | — | carried over, unverified |

**Known limitation — read before using these for a control boundary.**
`--secondary`, `--accent` and `--border` are all **below the 3:1 required by
WCAG 1.4.11 Non-text Contrast**. They are currently used only for decorative
separation (header/footer rules, hover tints, card fills), which 1.4.11 exempts
because the boundary is not required to understand the content. **If any of these
becomes a load-bearing boundary — an input border, a checkbox, a switch — it must
be raised to at least 3:1 first.** The obvious correction is a lighter border,
around `#6F6E80`, at the cost of departing from the design's flat look.

### 2.2 Theming

`AUTHORITATIVE` — the design is **dark only**. There is no light theme.

The `.dark` class block was **removed** from `theme.css`; because the dark
palette is `:root` itself, any `dark:` utility in the unused shadcn primitives
still resolves correctly. Do not reintroduce it.

---

### 2.3 Accessibility corrections to the design's palette

`ACCESSIBILITY` — the design specifies six colours that fail WCAG 2.2 AA. Where
the design itself conflicts with an accessibility requirement, `AGENTS.md` §2
requires raising it rather than silently choosing. These were raised, agreed, and
corrected (owner-confirmed 2026-09-26).

Each correction raises **HSL lightness only**, preserving hue and saturation, to
the smallest value that clears its requirement *with headroom* — so float
rounding in a browser cannot drop it back below. No hue was redesigned.

| Token | Usage | Design | Corrected | On | Was | Now | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--rule-work` | Work divider rule | `#4c4444` | `#706565` | `#131417` | 1.95 | **3.28** | 3.00 — WCAG 1.4.11 |
| `--code-foreground` | Project-code sample | `#b44247` | `#d38689` | `#2d2f33` | 2.43 | **4.82** | 4.50 — WCAG 1.4.3 |
| `--panel-border` | Card border | `#585667` | `#7d7b90` | `#2d2f33` | 1.88 | **3.26** | 3.00 — WCAG 1.4.11 |
| `--footer-label` | Navigate / Connect labels | `#6b6560` | `#88817b` | `#131417` | 3.21 | **4.80** | 4.50 — WCAG 1.4.3 |

Two more were required by **building a real form**, which the design does not
contain. A form has a real control boundary and a real error state, so both are
accessibility-relevant:

| Token | Usage | Design | Corrected | On | Was | Now | Requirement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--field-border` | Form field underline | `#585667` | `#676578` | `#131417` | 2.58 | **3.25** | 3.00 — WCAG 1.4.11 |
| `--destructive` | Form error text | `#d4183d` | `#ea4363` | `#131417` | 3.51 | **4.81** | 4.50 — WCAG 1.4.3 |

Note `#585667` needed **two different corrections** because it is used on two
different backgrounds (`#2d2f33` for the card border, `#131417` for the form
underline), so it is two tokens rather than one value that passes nowhere.

**One knock-on change.** Lightening `--destructive` to clear 4.5:1 as *text*
dropped white-on-red to 3.83:1, so `--destructive-foreground` changed from
`#ffffff` to `#131417`. A dark label on a light fill is the pattern the design
already uses twice — the "Hire me" button and the "View Github Repo" pill — so
this follows the design rather than inventing a third treatment. This was caught
by the verifier below, not by inspection.

### 2.4 How contrast is verified

`pnpm verify:contrast` (`scripts/verify-contrast.mjs`) reads the actual token
values out of `src/styles/theme.css` and asserts two things:

1. **Every declared usage pairing** meets its requirement — 19 pairings, each
   measured against the background the colour is actually used on, not against
   the page background by default.
2. **Every correction is a correction** — that it is lighter than the value it
   replaced and that its hue has not drifted more than 5°. A wholesale hue change
   would be a redesign, not an accessibility fix, and would fail here.

Like `verify:geometry`, this exists because a comment does not stop a later edit
from reintroducing a failing value. Both scripts are run before a task is reported
complete; see `AGENTS.md` §7.

## 3. Typography

`AUTHORITATIVE` sizes, `DERIVED` responsive behaviour.

| Role | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Wordmark (`h1`) | Fraunces | 180px | 400 | 1.0 |
| Tagline | *substituted* | 40px | 400 | tight |
| Body / lead | Jura | 24px | 400 | 32px |
| Navigation | Jura | 16px | 400 | — |
| Button | Jura | 14px | 500 | 20.30px (1.45) |

Tokens: `text-display`, `text-tagline`, `text-lead`, `text-nav`, `text-cta`,
`leading-lead`, `leading-cta`.

### 3.1 The font decision

The design specifies **three** families in **three distinct roles**. None may be
an alias of another, because the design's hierarchy depends on all three being
separable.

| Role | Design | Shipped | Provenance |
| --- | --- | --- | --- |
| Wordmark only | Fraunces | Fraunces (`opsz`) | `DESIGN` |
| Section headings, service titles, footer labels | **Maison Neue** | **Outfit** | `TEMPORARY SUBSTITUTE` |
| Body and UI copy | Jura | Jura | `DESIGN` |

- **Jura** — self-hosted via `@fontsource-variable/jura` (weights 300–700).
- **Fraunces** — self-hosted via `@fontsource-variable/fraunces/opsz.css`. The
  optical-size axis is loaded deliberately: at 180px the text optical size scaled
  up looks thin and cheap, and `opsz` is what makes a display cut of a variable
  serif look correct. Used for the 180px wordmark **only**.
- **Maison Neue** — **not shipped.** Commercial Klim Type Foundry face, cannot be
  redistributed without a licence. Owner-confirmed 2026-09-26: no licence
  purchase at this stage.
- **Outfit** — self-hosted via `@fontsource-variable/outfit` (SIL OFL 1.1).
  `TEMPORARY SUBSTITUTE` for Maison Neue.

**Why Outfit and not Fraunces.** Fraunces was the earlier substitution, and it is
wrong now that section headings exist. The design already assigns Fraunces to the
wordmark; substituting it for the heading role too would render "Work" and
"Services" identically to "BaydreAfrica", collapsing the hierarchy the design is
built on. The substitute must be distinct from *both* existing faces:

- **Outfit** is the same broad class as Maison Neue (geometric sans), so it
  occupies the same role without changing the design's texture.
- It separates from **Jura**, which is wider, rounder and more humanist. Two
  sans-serifs that close in shape would be the other way to lose the hierarchy.
- It separates from **Fraunces** by category.
- It is variable, self-hosted, and OFL — no licence obligation.

**This is a replaceable token, not a dependency.** To restore the real face:
licence Maison Neue, add its `@font-face` in `src/styles/fonts.css`, and change
`--font-heading` in `theme.css`. No component references a family name directly,
so no component changes. See `src/styles/fonts.css` for the same note in full.

### 3.2 Responsive type

`DERIVED` — the snippet is a single fixed 1440px frame with no breakpoints, so
the two large sizes are fluid:

| Token | Value | At 375px | At 1440px |
| --- | --- | --- | --- |
| `text-display` | `clamp(2.75rem, 12vw, 11.25rem)` | 45px | **180px** (cap) |
| `text-tagline` | `clamp(1.5rem, 3.4vw, 2.5rem)` | 24px | **40px** (cap) |

Both resolve to the authored value at 1440px, so desktop fidelity is exact.
`PENDING`: confirmation of the small-screen design.

### 3.3 Base font size

`DERIVED` — `html { font-size: 100% }`, not a fixed `16px`. The previous value
overrode the user's browser font-size preference, which fails WCAG 1.4.4 Resize
Text. All sizing downstream is `rem`.

---

## 4. Radii

`AUTHORITATIVE` — exactly two values in the snippet.

| Token | Value | Applied to |
| --- | --- | --- |
| `--radius` (`rounded-md`) | 8px | nav item, social tile, button |
| `--radius-image` (`rounded-image`) | 24px | hero image, cards |

The shadcn scale around `--radius` is retained (`sm` 4 / `md` 8 / `lg` 12 /
`xl` 16) so the 48 existing primitives still resolve sensibly.

---

## 5. Layout

`AUTHORITATIVE` — 1440px frame, 84px side gutters.

```
1440 − (84 × 2) = 1272 content width
```

1272 is exactly the hero's authored width, which confirms the gutter maths.

| Token | Value |
| --- | --- |
| `--container-site` | 1440px |
| `--spacing-gutter` | 24px → 40px (≥768) → 84px (≥1024) |

The responsive gutter values below 1024px are `DERIVED`; the snippet has no
mobile design.

Hero internals: 48px wordmark-to-copy gap, 24px copy-to-image gap, 478px tagline
column, 106px column gap, 688px paragraph column, 431px image height. All
`AUTHORITATIVE`.

### 5.1 The header/hero relationship is a formula, not a constant

The authored wordmark position is **140px from the frame top**. The header, by
contrast, occupies normal flow directly above the hero. Padding the hero by the
full 140 would count the header twice and land the wordmark at 224px.

`theme.css` therefore keeps only the spacing primitives as literals and derives
everything else:

```
--header-height = (header block padding × 2) + (nav item padding × 2) + nav line
                = (22 × 2) + (8 × 2) + 24
                = 84px

--hero-top-pad  = --hero-offset − --header-height
                = 140 − 84
                = 56px

wordmark top    = --header-height + --hero-top-pad = 84 + 56 = 140px  ← authored
```

Two consequences worth preserving:

- Changing the header padding, the nav padding, or the nav line box moves the
  hero with it. The hero cannot drift from the header.
- `--hero-top-pad` is a *hero-relative* value, not the authored frame offset. The
  snippet positions its navbar absolutely over the frame, so its hero padding is
  56; ours is in flow, so the arithmetic is identical but the expression differs.

The Tailwind spacing utilities are thin aliases of the same custom properties
(`--spacing-hero-top: var(--hero-top-pad)`, `--spacing-header-pad:
var(--space-header-pad)`, and so on) so no value is written twice. `pnpm
verify:geometry` resolves the chain from the **built** CSS at a 1440px viewport
and asserts both the numbers and the indirection; see §8.

---

## 6. Components built so far

| Component | Source | Notes |
| --- | --- | --- |
| `NavBar` | snippet | desktop row: nav, socials, gradient rule, CTA — extracted from the header |
| `ClusterDivider` | snippet | the gradient rule between socials and CTA; `HireMeButton` is the CTA |
| `SiteHeader` | `DERIVED` | sticky header, mobile disclosure, Escape/route-change close |
| `SmartLink` | `DERIVED` | renders a `NavItem` as `<Link>` or `<a>`; the only place that distinction lives |
| `Hero` | snippet | + fluid type, flex/grid instead of absolute positioning |
| `WorkSection` / `ProjectCard` | snippet | + real heading, card is a link not a button, `<pre>` for the code panel |
| `ServicesSection` | snippet | + real heading, two rows with the frame's rule between them. The frame's per-card artwork was replaced on 2026-09-26 and then **removed** on 2026-09-27 — the cards carry no mark and no reserved slot |
| `ContactSection` / `ContactForm` | snippet + `ACCESSIBILITY` | snippet has no form; see below |
| `SiteFooter` | snippet | replaces the previous generic footer |
| `SectionIntro` | `DERIVED` | shared heading block for Work/Services; size and gap come from the caller because the two frames differ |
| `SocialLinks` | snippet | + `<a>` elements with accessible names |
| `TechTile` | snippet | shared by the Work stack panel and the About Tools row; always reserves the 32px icon box |
| `ProfileSection` | About frame (2026-09-26) | + Tools/Technical Skills owner content, no `capitalize`, `<p>` not `<br/>`, inert tile for the unconfirmed link, three social tiles not five, not sticky |
| `Button` | shadcn primitive, **reused** | retinted via tokens, not rewritten |

The snippet renders the header and hero as one absolute-positioned block, so there
is no separate header component to copy. `NavBar` was extracted to match the
snippet's own composition and to give the desktop row a single owner; `SiteHeader`
adds the `DERIVED` behaviour the snippet lacks — a sticky landmark, a mobile
disclosure, and dismissal on Escape or route change. Escape returns focus to the
toggle button, so closing the panel never orphans focus (`SiteHeader.test.tsx`).
The panel is **not** focus-trapped: it expands in flow rather than overlaying, and
sits immediately after its toggle in DOM order, so Tab enters it naturally and a
trap would violate WCAG 2.1.2 instead of helping.

**`contactIntro` was the wrong string.** The Contact frame's own text for the
line under the 96px heading is:

> Have a project in mind? Tell me what you're working on, what you need, and
> where you'd like to take it.

What shipped was a 177-character, three-sentence paragraph ("...Let's talk about
it. I work with founders and teams to turn rough ideas into clear brands and
working software. Every project starts with a conversation."). The two share only
their first 24 characters, so this was never a wording preference but a
different string that had been recorded as transcribed from the frame. The frame
is authoritative and the copy is now verbatim. Worth noting how it survived: a
`startsWith("Have a project in mind?")` assertion — the obvious way to test it —
passes against **both** strings. The test pins the full sentence and the tail.

**The Contact header block is two families, and the description is a single
line.** The frame sets *both* lines `font-['Jura']`:

> Let's turn the next idea into something real.
> Have a project in mind? Tell me what you're working on, what you need, and
> where you'd like to take it.

Built, they differ — and both differences are deliberate:

| Line | Frame | Built | Why |
| --- | --- | --- | --- |
| 96px statement | `font-['Jura']` | `font-heading` (Outfit) | owner override, 2026-09-26 |
| intro | `font-['Jura']` | `font-sans` (Jura) | frame, honoured |
| gap | `gap-3` | `mt-3` = 12px | frame, honoured |
| statement size / colour | 96px, `#E9E9EC` | 96px, `#E9E9EC` | frame |
| intro size / colour | 24px, `#E9E9EC` | 24px, `#E9E9EC` | frame |

- **The statement is Outfit.** Rendered in Jura and reverted: at 96px it read as
  an outlier against every other subheading on the site, all of which are
  `font-heading` — the `ProjectCard` title, the Services card titles, "Let's
  talk", the form's own heading.
- **The intro is Jura**, as the frame says and as the two neighbouring sections'
  descriptions resolve to (`SectionIntro`'s `<p>` carries no font class and
  inherits Jura). An intermediate pass set this to `font-heading`, from reading
  "the subheading font like in the others" as the `<h3>` utility rather than the
  others' *descriptions*. Corrected 2026-09-26.

**The intro is one line, and `max-w-prose` was what stopped it being one.** The
cap resolved to ~811px (65ch) and wrapped a line the frame draws as a single line;
uncapped, the 103-character sentence is ~1170px and fits the 1272px container at
1440. `ContactForm.test.tsx` asserts no width cap survives on that element, since
any cap reintroduces the wrap. Below the design width it wraps normally, which is
the responsive behaviour, not a defect.

The measure is long — ~95 characters at 24px, past the 45–75ch usually
recommended. That is the frame's call, the same call as Work's ~80-character
description, and is recorded rather than corrected.

**The statement's family is not set in the `--font-heading` token.** One value
there re-skins the Work, Services and footer headings along with it, so the
exception is expressed on the element. `ContactForm.test.tsx` asserts both
halves: the element carries `font-heading`, and the token still resolves to
Outfit.

**The Contact intro is `#E9E9EC`, not muted.** The frame sets it `text-gray-200`,
and in this design gray-200 is `#E9E9EC` — taken from the Work frame's authored
raw CSS, where the same class name resolved to `#E9E9EC` rather than Tailwind's
own `#e5e7eb`. The Work section description had already been corrected to
`#E9E9EC` on that evidence, so `ContactSection` was the one holding the older
`#A8A7B0`. Both section intros now agree, and contrast improves from 7.74:1 to
**15.2:1**.

**No rule above the footer, and no extra margin either.** The design supplies the
Contact frame (921px) and the Footer frame (728px) as separate frames with no
divider between them. A `border-t border-rule` on `<footer>` drew a line
immediately below the contact form that no frame specifies; it is removed. The
`mt-20` that went with it is removed too — it was padding out the separation the
rule used to provide, and with the rule gone it stacked a third 80px onto the
Contact section's `py-20` and the footer's, making this the only 240px boundary on
a page where every other one is 160px:

| Boundary | Before | After |
| --- | --- | --- |
| Work → Services | 80 + 80 = 160 | 160 |
| Services → Contact | 80 + 80 = 160 | 160 |
| Contact → Footer | 80 + **80** + 80 = **240** | 160 |

The 1px rule the footer *does* have is the one inside it, below the role row.

**The copyright bar is responsive by construction, and the frame's geometry is
deliberately not copied.** The frame pins a `w-[1440px]` outer frame and places a
`w-[1272px]` content row at `left-[84px] absolute`. Taken literally that overflows
every viewport under 1440px. `container-site` produces the same numbers with
neither artifact: `width: 100%` capped at `--container-site` (1440px) with
`margin-inline: auto`, and `padding-inline: var(--gutter)` which resolves
**24px → 40px → 84px**. So the frame's `84 + 1272 + 84` falls out at the design
width and a correct gutter at every width below it. The row also stacks
(`flex-col` → `sm:flex-row`) rather than putting two runs of text on one line of a
phone. `SiteFooter.test.tsx` asserts the three Figma artifacts are absent and the
stacking breakpoint is present.

**The copyright line is 12px, and the credit was already 10px.** The frame's
copyright bar is `text-xs` (12px) with `leading-4` (16px) on the copyright line
and `text-[10px]` (10px) with `leading-4` on the credit.

| Line | Frame | Was | Now |
| --- | --- | --- | --- |
| Line | Frame | Before | Now |
| --- | --- | --- | --- |
| `© … All rights reserved.` | 12px / 16px | 11px / 15.95px | **12px / 16px** |
| `Yasir Musa` | 10px / 16px | 10px / 14.5px | **12px / 16px** |

Both bar lines are now **12px / 16px**. The credit's move from the frame's
`text-[10px]` to 12px is an **owner override (2026-09-26, "for consistency")**, not
a design-derived value. `--text-tiny` (0.625rem) was retired — that credit line was
its only consumer.

`--text-micro` was `0.6875rem` (11px), which matched nothing in the frame; it is
now `0.75rem`.

**The credit's size is an owner override, and its leading was a real bug.**
`--leading-caption` is *unitless* 1.45, so it resolves against each element's own
size rather than the frame's `leading-4`. It happened to give the copyright's 16px
at 11px (11 × 1.45 = 15.95) and gave the credit only 14.5px. Both bar lines now use
the length-based `--leading-copyright: 1rem` (16px). Chasing the copyright's
11px → 12px change is what exposed this; the credit inherited the same latent error
from the same token.

**Deviations in this bar still recorded, not fixed:** the frame's
`tracking-tight` (copyright) and `tracking-wide` (credit) are not implemented, and
the bar is 48px tall against the frame's 66px (`py-4` where the frame has `py-6`).

**The footer wordmark's FACE is an owner override (2026-09-26).** The snippet sets
`baydre_africa` in the body face; the owner asked for it to match the hero
wordmark, so it now uses `font-display` (Fraunces) like the hero's `BaydreAfrica`
at 180px. Only the *sizing* stays the footer's — `--text-footer-mark` and
`--leading-footer-mark` (1.0) — so it still reads as the footer's wordmark.
`SiteFooter.test.tsx` asserts the two wordmarks resolve to the same `font-*` class
by rendering both, so "same as the hero" cannot silently drift.

**The footer's wordmark text is also an owner override.** It was a separate
`footerName` field holding the snippet's lowercase `baydre_africa`, which existed
only to be deliberately different from the hero. With the text now matching, that
field was deleted rather than left as a second copy of the same string: both
wordmarks read `profile.name`, so they cannot drift.

**The wordmark was reduced from the snippet's 160px to 120px** (owner, 2026-09-26):

```
--text-footer-mark: clamp(2.5rem, 8.333vw, 7.5rem);   /* 40px … 120px */
```

The slope is not arbitrary. It is `120/1440`, so the fluid ramp reaches its ceiling
exactly at the design width — the same convention the original
`clamp(3rem, 11.1vw, 10rem)` used with `160/1440 = 11.111vw`. A looser slope would
cap early and leave the wordmark under-sized between that width and 1440. The 40px
floor is what keeps it responsive: the hero's 180px cannot fit a 375px viewport,
whereas 40px "BaydreAfrica" is ~264px against 327px of content. A test pins all
three components so the ramp cannot be quietly broken.

**Social URLs were owner-confirmed on 2026-09-26 and two were wrong.** LinkedIn
pointed at a *company* page (`/company/baydreafrica`) rather than the personal
profile, and X was missing the underscore (`/baydreafrica`). Now:

| Network | URL | Status |
| --- | --- | --- |
| LinkedIn | `linkedin.com/in/yasir-musa-baydre-africa` | confirmed, `unverified` cleared |
| X | `x.com/baydre_africa` | confirmed, `unverified` cleared |
| GitHub | `github.com/baydre` | **still `unverified`** — not supplied |

GitHub remains a guess and keeps its `data-unverified` flag; the `SocialLink`
type documents the flag as the marker for unconfirmed profile URLs.

**The footer has no social icon row** (owner instruction, 2026-09-26). The Connect
column is text links only. `SocialLinks` is a shared component and was not deleted
or modified — `NavBar` and `SiteHeader` still render it; only the footer's instance
is gone. Tests assert both halves, so "remove the icons" cannot silently become
"remove the links", and the footer still keeps its one legitimate SVG (the
"View Work" arrow).

**The Navigate → Connect columns now sit at the design's positions** (owner
instruction, 2026-09-26). They were 437px apart origin-to-origin and are now
**216px**:

| Column | Was | Now | Design |
| --- | --- | --- | --- |
| Location copy | 84px | 84px | 84px |
| Navigate | 521px | **650px** | 650px |
| Connect | 959px | **866px** | 866px |

`grid-cols-3` could not express this. Equal tracks share one 40px gap across all
three boundaries, so narrowing the Navigate→Connect distance would have dragged the
location copy away from Navigate at the same time. The two leading tracks are
therefore sized as **fractions of the content box**, with Connect taking the
remainder:

```css
--footer-locate-col: 41.352%;  /* 526/1272 */
--footer-nav-col:    13.836%;  /* 176/1272 */
```

```
lg:grid-cols-[var(--footer-locate-col)_var(--footer-nav-col)_1fr]
```

Fractions rather than Figma pixels, so the proportions hold below 1440 instead of
pinning desktop geometry to a `lg` breakpoint: at 1280 the columns land at
576/782, at 1024 at 470/641. The two tracks sum to 55.19% and the third is `1fr`,
so the row cannot overflow at any width — a test asserts the remainder stays
positive from a 1272px content box down to 820px. Below `lg` it reverts to the
2- and 1-column stacks. The 40px gap between the columns is unchanged; the 216px is
origin-to-origin, i.e. the 176px track plus that gap.

**The footer's "View Work" arrow is the design's own SVG, and no icon library
ships it.** The glyph was `↗` (reads as "leave this page" — wrong for a link to
`/#work`), then a text `→`, and neither is the design's mark. The frame supplies
it directly: a 15 × 15 two-path arrow at stroke-width 1.5, round caps and joins.

Three libraries were checked against that geometry. Every one mismatches on all
three measures once normalised to the 15 grid:

| Measure | Design (15) | `lucide-react` @15 |
| --- | --- | --- |
| shaft length | 11.25 | 8.75 |
| chevron height | 10.58 | 8.75 |
| stroke width | 1.5 | 2 |

- **`lucide-react`** is installed but its `arrow-right` is a 24-grid glyph at
  stroke-width 2 — proportionally shorter, stubbier and heavier.
- **`@radix-ui/react-icons`** would be closest on *grid* (Radix also draws on
  15 × 15 with round caps) but is not installed, ships stroke-width 1 with a
  10-unit shaft and 7-unit head, and adding a package to reproduce a glyph the
  design already hands over contradicts AGENTS.md §4.
- **`@mui/icons-material`** is installed, but its arrows are 24-grid and either
  solid-filled or differently constructed.

So `ArrowRightIcon` in `src/components/common/icons.tsx` uses the authored path
data verbatim — consistent with `SocialIcon`, `TechIcon` and
`SiteHeader`, every other icon in the project. `SiteFooter.test.tsx` pins the
`viewBox`, the stroke width and both `d` strings, so a swap to a library glyph
fails the suite rather than passing as a near-miss.

**No icon library is used anywhere in this codebase.** `lucide-react` and
`@mui/icons-material` are dependencies only because the unused shadcn `ui/`
primitives import them; no shipped component does. The design supplies no icon
geometry beyond the frames transcribed so far, and hand-authored SVG keeps the
paths auditable against the frame.

**A custom `text-*` size token silently deletes a button's colour.** The send
button's appearance comes entirely from the shadcn `default` variant, so nothing
about it is visible in `ContactForm`'s own class list — which is how this
happened. `text-cta` was passed for the 14px label; tailwind-merge cannot tell a
custom `--text-*` font-size token from a `text-*` colour utility, so it resolved
`text-cta` against *both* groups and, being last, deleted the variant's
`text-primary-foreground` along with the earlier `text-sm`. The label inherited
`--foreground` (#e9e9ec) onto a `--primary` (#e9e9ec) fill and rendered
invisible, while all seven checks stayed green. The size now comes from the
variant's `text-sm` (the same 0.875rem) and only `leading-cta` from a token.
`HireMeButton` hit the identical bug and is the precedent.

**Three buttons had this bug, not one.** `HireMeButton` first, then
`ContactForm`'s send button and `NotFoundPage`'s "Go home" — all three passed
`text-cta` to the same shadcn `default` variant and all three rendered their
label invisible while every check stayed green. All three now take the size from
the variant's `text-sm` and only `leading-cta` from a token, and each has a test
asserting the merged class list still holds `text-primary-foreground`.

**No rule above the copyright bar.** The design gives it its own 66px frame
beneath the 728px footer frame and specifies no divider, so the copyright and
the credit sit directly on the page background. A `border-t border-rule` there is
removed, like the one above the footer. The footer's one authored rule — below
the role row — stays.

**The contact form does not exist in the design.** The Contact frame supplies four
underlined rows of placeholder text and a chevron — no field elements, no labels,
and no submit control. What is implemented instead is a real form with visible
labels, a native `<select>`, a submit button, and a real
`idle → submitting → success | error` state machine behind a `ContactTransport`
interface. A placeholder-as-label fails WCAG 3.3.2, and a form with no submit
button does not send anything, so this is `ACCESSIBILITY` + functionality rather
than interpretation of the design. See `docs/INTERACTION_SPEC.md` §4.

Accessibility additions the snippet does not contain — each required, none
optional: semantic `<a>`/`<button>`/`<h1>`/`<h2>`/`<h3>`, accessible names on icon
links, a skip link, visible focus rings, hover and active navigation states, one
`h1` per page, visible form labels, and `aria-live` status regions.

**Section headers.** Each section opens with a 40px `#E9E9EC` heading in the
display face, beside its description in a row 344px wide, above a full-bleed 1px
rule. `SectionIntro` reproduces that at `lg` and above and stacks it below that.

> **The snippets' positional wrapper is not layout.** Work's header snippet is
> `<p class="… min-w-screen min-h-screen absolute left-0 top-0 text-center">Work</p>`.
> The `min-w-screen min-h-screen absolute left-0 top-0` is the *per-element
> export wrapper* — the same one that puts `absolute left-[201px] top-[161px]` on
> the hero — and is discarded, exactly like the fixed frame heights elsewhere.
> Its `text-center` centres the text inside the extracted element's own
> full-width box; it does not position the element within the section. Reading
> it as section layout once led to centring the Work header, which was wrong:
> the heading belongs on the left, aligned with the description beside it.

**Heading/description alignment** is `align` on `SectionIntro`:

| Value | Behaviour | Used by |
| --- | --- | --- |
| `"bottom"` (default) | Bottom-aligns the two boxes, with a compensating `lg:pb-1` on the description. | Services |
| `"first-line"` | Top-aligns the boxes so the heading sits beside the description's **opening** line, plus a derived `lg:mt-[0.5rem]`. | Work |

The distinction matters because the description always wraps past the heading's
single 44px line box, so bottom-aligning strands the heading beside the
paragraph's *last* line instead of its first.

### The section description

The Work header's description has an **authored computed style**, which is the
authoritative record for it:

```json
{ "flex": "1 0 0", "color": "#E9E9EC", "font-family": "Jura",
  "font-size": "20px", "font-style": "normal", "font-weight": "400",
  "line-height": "40px /* 200% */" }
```

Four of those corrected the implementation:

| Property | Was | Now | Token |
| --- | --- | --- | --- |
| `color` | `--muted-foreground` `#a8a7b0` | `#E9E9EC` | `text-foreground` |
| `font-size` | 24px | **20px** | `text-description` |
| `line-height` | 32px | **40px** | `leading-description` |
| `flex` | `max-width: 65ch` | **`1 0 0`** | `grow basis-0 shrink-0` |

Notes:

- **New tokens, not retuned ones.** `--text-lead`/`--leading-lead` (24px/32px)
  are shared with `Hero` and `ContactSection`, so the description needed its own
  `--text-description` / `--leading-description` pair.
- **`flex: 1 0 0` replaces the `max-w-prose` cap.** Basis `0` + grow means the
  description's width is exactly whatever the heading and the 344px gap leave
  over — which makes that gap *exact* rather than emergent from natural widths.
  It cannot overflow either: the items' bases total 0, so `flex-shrink` never
  engages and the description just gets narrower. At the 1440 canvas it renders
  ~818px, i.e. roughly an 80-character measure, which is longer than the 45–75ch
  usually recommended. That is the design's call, not a defect, but it is the
  reason the measure is recorded here.
- **Contrast improves.** `#E9E9EC` on the `#131417` section surface is **15.2:1**,
  against the 4.5:1 that 20px normal weight requires. The previous `#A8A7B0` was
  7.74:1. `--muted-foreground` stays in use elsewhere, so the token is not
  orphaned.

> **DERIVED — still needs a browser.** The `lg:mt-[0.5rem]` on the heading was
> recomputed for the new 20px/40px description (the 40px line box carries 10px
> of half-leading against the heading box's 2px, and the heading's glyphs are
> twice the size), but it remains an estimate from font metrics rather than a
> measurement, and it is sensitive to Jura's real ascent value. It is the one
> value in `SectionIntro` not verified against the design.

### The Figma Tailwind export is not standard Tailwind

The card and its panel were each supplied in both of Figma's export formats, and
the Tailwind form **disagrees with the raw CSS on almost every value**:

| Property | Figma's Tailwind class | Standard Tailwind | Raw CSS (authoritative) |
| --- | --- | --- | --- |
| Panel radius | `rounded-xl` | 16px | **12px** |
| Tile box radius | `rounded-lg` | 12px | **8px** |
| Label width | `w-24` | 96px | **102px** |
| Label line-height | `leading-4` | 16px | **17.6px** |
| Label tracking | `tracking-wide` | 0.025em | **0.88px** |
| Label colour | `text-gray-200` | `#e5e7eb` | **#E9E9EC** |
| Panel background | `bg-zinc-800` | `#27272a` | **#2D2F33** |
| Tile background | `bg-zinc-800` | `#27272a` | **#313131** |

Two things follow. Figma's scale is **not** Tailwind's — `w-24` is 102px, and
`rounded-xl` is 12px — so its class names cannot be read as pixel values. And it
is **lossy on colour**: it collapses `#2D2F33` and `#313131` into one
`bg-zinc-800`, which would make the panel and the tile boxes the same colour.

**The raw CSS is authoritative; the Tailwind form is only useful for structure.**
This is not a stylistic preference — reading `rounded-xl` as 16px is what
introduced the 16px radius error, and reading it again would have re-broken the
8px tile box.

### The project card

The card was supplied **twice**, in Figma's two export formats, and the second
pass corrected three errors the first one introduced. The values below are the
ones both exports agree on; where they disagree the disagreement is recorded
rather than silently resolved.

| Property | Value | Notes |
| --- | --- | --- |
| Row | `flex items-start gap-24px` | `align-items: flex-start` is load-bearing. The card was `items-stretch`. |
| Artwork | `621 × 494`, `border-radius: 12` | Both fixed in the design, so the height is asserted, not left to the intrinsic image. |
| Title | 32px, `#FFF`, display face | **DERIVED** line-height — see below. |
| `01` | 24px, `#FFF`, Jura, right-aligned | Rendered by `ProjectCard`; it is content, so `aria-hidden` would be wrong. The frame prints `//01`; the slashes are dropped on owner request 2026-09-26. |
| Summary | 20px/32px, `#E9E9EC` | `text-description` + `leading-card-summary`. |
| Panel | `flex: 1 1 0`, `#2D2F33`, `border-radius: 12` | Takes the row's full width. An earlier pass capped it at 358px; the design does not. |
| "Built with" | 12px/17.6px, **uppercase**, `0.88px` tracking, `width: 102px` | Renders as `BUILT WITH`. |
| Tile label | 14px/24px, `#F9F9FF`, centred | |
| Tile box | `padding: 12`, `#313131`, **`border-radius: 8`** | `rounded-md`. The panel is 12 and the tile box is **8** — conflating them was a real bug. Icon 32 × 32 above the label, 8px apart. |
| Tiles | rows 24px apart, `flex: 1 1 0` each | The design's five tiles are **two** rows — three, then two — and each row distributes its own width. The row count is a container query, not a viewport breakpoint; see "The tile count follows the panel" below. |
| Column alignment | `align-items: flex-start` + `align-self: stretch` per child | The stretch is on the **children**, not inherited from a stretched parent. |

**The tile rows are reproduced with one `flex-wrap`, not nested row elements.**
The design nests grid → row → tile, and its second row holds two tiles at
`justify-content: space-between`, so each is *half* the row rather than two of
three equal columns. Reproducing that needs a row element per row — which would
put a `<div>` directly inside the `<ul>`, invalid HTML, since a list may only
contain `<li>`.

`flex-wrap` with a half-row basis, upgraded to a third inside a 216px container,
and `flex-1` gives the same result with `li` as one tool per item:

| Tiles | Row split | Each tile |
| --- | --- | --- |
| 3 | one row | `(100% − 2 × 24px) / 3` — exactly the design's full row |
| 2 | one row | `(100% − 24px) / 2` — the design's `space-between` half |
| 5 | **3 + 2** | the design's own split |

A full row is `3 × basis + 2 × gap = 100%`, so growth never engages; a shorter
trailing row has free space, so its tiles grow to fill *that* row. The one
`gap-6` supplies both the 24px row gap and the 24px column gap.

**Alignment is written the way the design writes it.** `StyledFrame1548`, the
title group, the panel and the tile grid are all `align-items: flex-start`, and
it is `align-self: stretch` on their children that makes them full width. An
earlier pass rendered the same pixels by relying on the column's *default*
`stretch` plus `w-full`, which puts the work on the parent — a child added later
without an explicit width would collapse silently. Now written as
`items-start` + `self-stretch`.


Three things the first pass got wrong, all caught by reading the second export:

1. **Radius.** Both exports say `borderRadius: 12` for the artwork and the panel.
   The first pass read `rounded-xl` (16px) off the Tailwind class names. It is
   `rounded-lg` — which is why `--radius-lg` is 12px. `rounded-image` (24px)
   remains the **hero** image's radius and is used nowhere on this card.
2. **The summary copy was not the design's.** `projects.ts` held an AI-written
   paraphrase. It now carries the snippet's verbatim text, first person included
   ("I worked on the product experience across …") — the owner's own words.
3. **`textTransform: uppercase` and `letterSpacing: 0.88px` were missing** from
   the "Built with" label, so it rendered as `Built with` with no tracking. Both
   are now applied; `0.88px` is carried as `tracking-[0.0733em]`, which at 12px
   is 0.8796px.

The panel's hairline is drawn in the design with
`outline: 1px solid` + `outline-offset: -1px`. That is an inset border, so a real
`border` renders the same 1px on the same edge without the offset trick.

> **DERIVED — the title's and `01`'s line-heights.** Neither export states a
> line-height for the 32px title or the 24px `01` label. The title uses
> `--leading-card-title: 1.1`, matching the 40px section headings' ratio; `01`
> uses `leading-lead` (32px), which is what Tailwind's own `text-2xl` pairs with
> 24px in the first export. Both are estimates and want a browser.

> **The design disagrees with itself about the stack glyph.** The Tailwind export
> carries a real React logo path in `#61DAFB`; the styled-components export has no
> path at all — `StyledVector` is a `<div>` with `background: #61DAFB`. The second
> is the lower-fidelity of the two, having flattened the vector into a filled
> rect, so the logo is used, on the same reasoning `common/icons.tsx` gives for
> the social tiles. `#61DAFB` is the one value both agree on. The path is
> transcribed from the snippet and **unverified** — no browser is available. If
> it renders wrong, the flat rectangle is the fallback the design itself supplies.

**The panel border is `--panel-border`, not the literal `#585667`.** Both exports
write the raw value as a CSS var with `#585667` as its fallback, but that hex is
one of the six recorded corrections in §2.3 — at 1.95:1 it fails WCAG 1.4.11
against the `#2D2F33` panel fill. Taking the literal would reintroduce a
documented accessibility bug, so the token is used instead.

**The five tiles are rendered as five tiles.** The design shows five tiles all
labelled "React.js" with identical glyphs, three then two, and `projects.ts`
models that literally. This is deliberate and is *not* a shortcut.

- **It is the design's own placeholder.** The Work frame repeats one project
  across four cards and one social link across three, all with identical copy.
  Five identical tool tiles belong to that same family.
- **It is what makes the panel's authored geometry real.** Every tile is
  `flex: 1 1 0`, so a single entry grows to 100% of the panel and renders as one
  ~595px bar with a 32px icon in the middle — which is not a tile, and is what an
  earlier pass shipped while looking plausible in review. A regression test now
  pins all five.
- **It fabricates no technical claim.** Repeating a *label* invents nothing,
  unlike writing "TypeScript, Tailwind, Node" — that would assert things about
  someone else's product. Replace wholesale with the real stack; the panel needs
  no code change.

Because the stack can legitimately contain duplicates, both `ProjectCard` and
`ProjectPage` key each `<li>` by `` `${tool}-${index}` ``. A tool-only key
collides, and React treats duplicate-key reconciliation as unsupported.

**The tile count follows the panel, not the viewport.** The tile row is a
container query, because the card's image is a fixed 621px and no viewport
breakpoint can see the space the panel actually has:

| Viewport | Card | Panel body | Per row | Rows | Narrowest tile |
| --- | --- | --- | --- | --- | --- |
| 375 | stacked | 295px | 3 | 3 + 2 | 82.3px |
| 768 | stacked | 656px | 3 | 3 + 2 | 202.7px |
| **1024** | **row** | **179px** | **2** | 2 + 2 + 1 | **77.5px** |
| 1061 | row | 216px | 3 | 3 + 2 | 56.0px |
| 1280 | row | 435px | 3 | 3 + 2 | 129.0px |
| 1440 | row | 595px | 3 | 3 + 2 | 182.3px |

`lg` turns the card row on at 1024px, which leaves a 1024–1061px band where the
right column is only 179–215px wide; a third of that is ~44px, which cannot hold
`p-3` (24px) plus a 32px icon. So the default basis is **half** the row and three
across engages at `@[216px]` — the point where the panel can hold
`3 × 56 + 2 × 24 = 216px`. At 1440 the panel body is 595px, so the query matches
and the grid is the design's own 3 + 2. `sections.test.tsx` asserts the
`@container` ancestor as well as both basis classes.

`@[216px]` measures the panel's content box, which is the `<ul>`'s width, so it
tracks real available space rather than the viewport.

The `<img>` branch is exercised by `sections.test.tsx` with an injected artwork
path — the only project has no artwork — so both branches stay covered.

**The nav's right cluster.** The snippet's `SocialsAndHireButton` fragment is
`flex items-center gap-4` — a `w-fit` group of three 40px tiles, the rule, then
the button — wrapped in `min-w-screen min-h-screen absolute left-[1087px]
top-[22px]`. That wrapper is Figma canvas placement for the extracted fragment,
not layout, and is discarded; `justify-between` already puts the cluster flush
right at 84px.

The **rule** is a vertical line, and Figma's own CSS export for it is
authoritative:

```json
{"width":"0","align-self":"stretch","stroke-width":"1px",
 "stroke":"rgba(102, 102, 102, 0.40)","filter":"blur(1.100000023841858px)"}
```

A **flat 1px stroke** at 40% opacity with a 1.1px blur, stretched to the cluster
height. `width: 0` is the degenerate bounding box of a vertical line, so the box
contributes nothing and the entire visible width is the 1px stroke.

> **The `<linearGradient>` in the snippet is not rendered.** Figma's CSS export
> resolves the paint to a flat `rgba(102, 102, 102, 0.40)` and drops the
> gradient; it keeps only the Gaussian blur and discards the snippet's no-op
> `feFlood`/`feBlend` pair. Two revisions of `ClusterDivider.tsx` got this wrong
> by treating the `<defs>` as authoritative — one drew it as a 6px seven-stop
> gradient (six times the authored width) and a second replaced the gradient's
> `#1A1A11` centre stop and raised the blur, both changes to a gradient that
> should never have been drawn. The 1.1px blur is not "imperceptible"; it is
> what the design specifies, and on a 1px line that is the whole look.
>
> `align-self: stretch` is the one thing the snippet's `h-full` got right, and
> is why `ClusterDivider` uses `self-stretch`: the cluster row is
> `align-items: center`, so its height is content-derived and a percentage height
> would be indefinite.

**Structural values deliberately not reproduced.** The snippet's frames each carry
a hardcoded height (1090, 2562, 1962, 921, 728, 66) and `overflow: hidden`. Every
one is taller than its content — the Work frame reserves several hundred pixels of
empty tail below its last card — so those are frame padding, not layout, and a
fixed height would reserve that dead space at every viewport. The whole page is
also wrapped in `absolute left-[201px] top-[161px] min-w-screen`, which is the
Figma canvas offset for the artboard on the page, not a layout instruction. All
discarded; sections are normal flow. The one number that *is* reproduced is
`1440 − (84 × 2) = 1272`, which `verify:geometry` pins.

---

### The services frame

1440 × 1962, `bg-neutral-900`. The frame is **not** one 6-cell grid: it puts a
1px `outline-gray-200` rule between the two rows, 48px from each, so the
implementation is two sibling `ul` rows with a rule between them rather than two
grid rows. Collapsing it into a single grid was the earlier reading, and it lost
the rule.

Card anatomy, in the frame's order:

| Part | Frame | Token |
| --- | --- | --- |
| `01` | 24px Jura, `#FFF` | `text-service-body` + `text-white` |
| Title | 30px, `#FFF` | `text-service` (1.875rem) + `text-white` |
| Description | 24px / 40px, `#E9E9EC` | `text-service-body` + `leading-service-body` |

Card box: `p-4`, `gap-8` between its parts, 32px between cards, `border-r` on
every card but the last in its row. The frame is inconsistent about row
stretching — only `04` and `05` carry an explicit `self-stretch` while the row
container is `items-start` — but `items-stretch` is clearly intended, since
without it the dividers stop at each card's own height and the row reads broken.

**The section heading is 36px, not the 40px Work uses.** This is the fourth
separate way the two frames disagree (heading size, description size, horizontal
gap, and the card scale), and it is why `SectionIntro` takes `titleSizeClassName`,
`descriptionSizeClassName` and `gapClassName` from the caller instead of assuming
one scale. All three default to the Work values, so the Work call site is
unchanged.

| Frame | Heading | Description | Row gap | Card title |
| --- | --- | --- | --- | --- |
| Work | 40px `clamp` | 20px | 344px | 32px `clamp` |
| Services | **36px** `--text-section-compact` | **20px** — owner correction, was 24px | **320px** | **30px** `--text-service` |

**The Services description is 20px, matching Work.** Owner correction 2026-09-26;
the frame shows `text-2xl` (24px) and this departs from it deliberately. Only that
one paragraph changes — the heading stays at the frame's 36px and the six card
descriptions and `0N` labels stay at its 24px. `--text-description` plus the
intro's `leading-description` is exactly Work's 20px/40px pairing.

This also closes a reported inversion. The service card title and the Services
heading were both 28px, so a card out-weighed its own section. They are now 30px
under 36px.

**`align="first-line"`, not the default.** Services had no description while the
copy was pending, which made `SectionIntro`'s default bottom-alignment harmless.
With the frame's copy restored it is two 24px/40px lines, and bottom-aligning
drops the 36px heading beside the *last* of them — 40.4px down — so the header
reads as sitting too low. Work already passed `align="first-line"`; Services now
does too, putting the heading beside the opening line with the same 8px optical
offset.

**Every card keeps the 384px slot, `01` included.** The frame gives `01` no
artwork element at all, but reserving the space is what keeps the row even: with
the slot, all six titles start on the same line; without it, `01` is a 40px-shorter
card. `sections.test.tsx` asserts that every card's children are the same
`p, div, h3, p` sequence, so a card cannot quietly lose its slot again.

### The `//` prefix is gone (owner request, 2026-09-26)

The frame prints its index labels `//01`–`//06` in Services and `//01`–`//04` on
the project cards, and the About page's `SkillRole` indices were transcribed from
a frame that has **no** slashes — so the two halves of the site disagreed. The
owner asked for the slashes removed everywhere, and they are: `services.ts` and
`ProjectCard` now print `01`–`06` and `01`–`04`.

**The digits are untouched.** These remain the design's own authored labels —
still one value per entry in `services.ts`, still not derived from array position,
still `index`/`01`-style content rather than something the layout computes. Only
the two-character flourish around them is gone, and it went because `//` is a code
comment marker: on a page that talks about `//01` in a code block, printing
`//01` in display type invited reading it as a comment rather than as a number.
The section-level `//01`/`//02` labels were already removed earlier the same day,
so this removes the last of them.

`sections.test.tsx` asserts no `//` survives in the rendered text of either
section, and that every project card's index matches `^\d{2}$` — a bare two-digit
number, so the prefix cannot quietly return.

### Service marks replace the frame's artwork (owner request, 2026-09-26)

### The service copy is the owner's, not the frame's

**As of 2026-09-27 all six titles and descriptions are OWNER-SUPPLIED.** The
frame's six titles and their verbatim descriptions are gone. The *layout* is
untouched — still the frame's 3 × 2 grid, the 48px gaps, the `border-r` on every
card but the last in its row, and the 1px rule between the rows.

| Was (frame) | Is (owner copy) |
| --- | --- |
| `01` Web Design | `01` Custom Software Development |
| `02` Web Development | `02` Backend & API Engineering |
| `03` Brand Development | `03` MVP & SaaS Development |
| `04` Technical Writing | `04` DevOps & Application Deployment |
| `05` Consultation Services | `05` AI & Automation |
| `06` Marketing Services | `06` IoT & Embedded Prototyping |

The `01`–`06` labels are still the frame's and are still content rather than array
position. Descriptions are transcribed verbatim from the owner's message,
including the `&` in titles, the `and`/`&` split in bodies, and the
capitalisation of "Raspberry Pi/Arduino".

**The list is exactly these six.** Digital Marketing and Technology Consulting &
Training are secondary services, printed as **one line of text under the grid** —
not as a second tier of cards. An earlier pass built them as a tier (its own
group, a third row, no index labels) and that was withdrawn the same day; the
line is what was actually wanted. So the section is the frame's 3 x 2 grid and
the one 1px rule the frame puts between its rows, with a single paragraph after
it. No extra grid, no extra divider, no reserved geometry.

The line is owner-supplied copy: "Secondary Services: Digital Marketing,
Technology Consulting & Training.", set **above a 1px `bg-rule`** — the grid
container now holds two rules, the frame's between its rows and this one — and
closed with a **full stop**, on owner request 2026-09-27.

It is set in **two faces at one size**: the label in the heading face, the items in
Jura, both 24px via `--text-service-body`, at `leading-service-body` (40px) and
`text-foreground` rather than the titles' white.

**The label uses `font-heading`, not Maison Neue — because Maison Neue is not
shipped.** The owner asked for it here explicitly. It is a commercial Klim Type
Foundry face and the project substitutes **Outfit** (OFL) for exactly this role,
owner-confirmed 2026-09-26 and marked `TEMPORARY`; §2 records the substitution.
`font-heading` is also the token the six service titles already use, so the label
matches the cards above it rather than introducing a fourth family. If Maison Neue
is ever licensed, `--font-heading` is the single token to change — no component
names a family directly.

The full stop lives in the component, not on the last item: it closes the rendered
sentence, and baking it into the data would carry it into any other use of those
strings.

**It is set in `font-sans`, and must not be set in `font-body`.** `--font-sans`
*is* Jura. `font-body` is **not a defined class in this project** — no such
utility is emitted, so it is a silent no-op. The six card indices (`01`–`06`)
still carry it and render in Jura only by inheritance from `body { @apply
font-sans }`, which is why it went unnoticed. Reported, not fixed: it is outside
this task's scope, and §9 carries it as a `PARTIAL` gap.

The label is stored separately from the two items rather than as one opaque
string, so it can be set apart from the list without editing prose. The owner
wrote "Technology Consulting & Training" here, having earlier written
"Technical"; the later wording is kept verbatim pending a correction.

This is a change of *register* worth naming: the frame's copy was design-agency
language ("developing visual identities", "helping teams make better digital
decisions") and the replacement is engineering-deliverable language — a list of
what gets built, not an adjective about it. The section's own description was
**not** updated with it and is now the one stale paragraph; see §9.

### There is no per-service mark

**The Services cards carry no artwork.** The card is `01`, title, description —
three children, no graphic slot, no reserved box. This is the third state of that
slot and the history is recorded because it has reversed twice.

*Frame as supplied.* Five of the six cards carried a 384 × 384 panel of flat
`gray-200` geometry, transcribed exactly — offsets, sizes, rotation angles. The
sixth, `01` Web Design, carried **no** geometry in the frame and was filled with
a 12%-opacity rect whose only job was holding the slot open. A placeholder
whatever it was made of, and the other five read as placeholders too: abstract
decoration is not a mark for "Brand Development" or "Technical Writing".

*2026-09-26, owner request — the first replacement.* The geometry was deleted and
`ServiceIcon` supplied a real lucide mark per service, keyed by `title`.

*2026-09-27, owner request — a re-pick, then removal.* The first set (`Palette`,
`Shapes`, `FileText`, `Lightbulb`, `Megaphone`) was reviewed and called out for
reading as consumer-creative and startup-deck shorthand rather than technical and
mature. It was re-picked on the rule that every mark is an **instrument, a
structure, or a measurement** — `LayoutTemplate`, `CodeXml`, `Fingerprint`,
`ScrollText`, `Compass`, `TrendingUp`. **The marks were then removed entirely.**

The reason was not legibility. Six cards each carrying a 192px pictogram read as
illustration rather than as a consultancy's capabilities, and the pictogram was
the loudest element in a section whose actual argument is the written
description. `ServiceIcon` is deleted; nothing is imported into the section.

**The slot did not survive the removal.** The 384 × 384 `aspect-square` wrapper
existed to hold the mark, so removing the mark removes the box: the cards drop
from ~384px tall to roughly the height of their own copy. A reserved-but-empty
slot would have kept them tall, which is the thing that is gone. The suite
asserts `aspect-square` appears nowhere in a Services card, and that no card
contains an `svg` or `img`.

This reverses two earlier owner decisions, and the section-specific nature of
the request matters: About's **Tools** row and its **role** marks are brand
glyphs from `TechIcon` and are untouched, as are the header's contact marks and
`SocialIcon`. `TechTile` keeps its 32 × 32 reserved box, which is a different
case — it reserves a box precisely so a *missing* brand glyph cannot shorten a
tile.

## 6.1 The About frame

Supplied 2026-09-26, and the first frame for a page other than the homepage. It
arrives with the `AGENTS.md` §3 caveat already answered for `/about`: the screen
is no longer assumption-built, so its provenance is per-value rather than
per-page. `src/content/about.ts` carries that provenance in full; this section
records only what is a *system* decision.

### Two columns, and the frame contradicts itself about one of them

A flex row: 421px portrait, `--space-profile-col-gap` (40px), then `flex-1` copy.
At 1440 that resolves to 421 + 40 + 811 inside the 1272px content box, which
`pnpm verify:geometry` now asserts.

The frame's Tailwind export sizes the portrait column `w-96` — 384px — while the
SVG inside it is `width="421"`. **421 is authored and 384 is the lossy read**:
Figma rounds layer bounds to its 4px spacing grid and 421 is not on it, which is
the same failure already recorded for `w-24` → 102px in the Work frame. The
column is sized from `--size-portrait-w`, never from the utility class, and the
geometry check fails if anyone "corrects" the token to match `w-96`.

### `items-start`, not `stretch`

The frame's left column is much shorter than the right one. Stretching it would
push the social row to the bottom of the section instead of leaving it 12px under
the portrait.

### The social row is left-aligned to the portrait, not centred under it

The portrait wrapper is `w-full`, so the sticky column's own `align-items` only
actually decides one thing: where the five-tile row sits. It is **`items-start`**,
which hangs the row off the portrait's left edge — the owner's instruction on
2026-09-26, given after seeing it rendered. `items-center` is what shipped first
and it read as detached from the portrait, since a 36px-tall row floating in the
middle of a `portrait-w` column has no edge to line up with.

Expressed on the column rather than as `self-start` on the `<ul>` because that is
where the decision is made, and because `self-end`/`ml-auto` centre it just as
visibly — a change to this needs to touch the column. Asserted directly, so a
well-meaning `items-center` back on the parent fails the suite.

Note this is orthogonal to the glyphs: each tile centres its own 20px mark, and
all five marks fill the 24 × 24 box (Instagram's had to be replaced — see
`common/icons.tsx`).

### Three things the frame gets wrong

| Frame says | Built instead | Why |
| --- | --- | --- |
| `capitalize` on the biography | nothing | the text is **already** title-cased, so the class is a no-op on the words — and it would additionally force a capital after every apostrophe and hyphen, silently rewriting any lowercase technical term added later |
| `<br/>` between the biography's four sentences | four `<p>` | four hardcoded line breaks at one viewport width |
| `font-['Jura']` on everything | Jura (the default body face) | the export names the family literally; nothing to substitute |

The frame's own `text-3xl`/`text-lg`/`text-xl` read as 30/18/20px, but the same
export is unreliable on sizes elsewhere, so each is checked against a token
before use. **Only three type values are genuinely new** — `--text-about-heading`
(30px) and `--tracking-about-bio` (0.1em) — plus
`--text-about-section` / `--leading-about-section` (20px / 28px), added later the
same day when the owner asked for the Tools and Technical Skills subheads to be
increased. **`--text-about-bio` no longer exists**: the frame sets the biography
`text-lg` (18px) and it shipped on its own token, but the owner walked it down
twice on 2026-09-26 — 18 → 16 → **14px** — and 14px is `--text-caption`, so the
biography uses that and the token is deleted rather than left declared at a value
the scale already carries. `--text-caption` is now the 14px step for the
biography as well as for labels and footer links. Its 32px line box is
`--leading-lead`; tile labels reuse `--text-caption` +
`--leading-tile` as they already did on the Work cards, and the 20px role titles
reuse `--text-description`. Re-declaring an existing size under an About-specific
name would have created a second source for it.

**The biography now sits at a 2.29 line-height** — 32px of line box on 14px of
type, against the frame's 1.78 at its own 18px — because the size was lowered
twice and the leading was never touched, as neither instruction asked for it. It
is the loosest thing in the About page. `--leading-body` (1.6, i.e. 22.4px) is
the natural companion if it is tightened next.

**The biography's paragraphs have no gap between them.** The frame's `<br/>` means
the 32px line box was the only separation it had, so a paragraph break and a line
wrap sit at the same 32px interval. A gap there would look like an improvement and
be a fidelity change.

### The portrait is a photo, and the frame supplied two overlays of which we took one

`src/assets/profile.svg` is the frame's own 421 × 475 SVG and contains **only the
photograph** — a base64 JPEG inside a `<pattern>` behind one `rx-4` rect. The
repository's other candidate, `53f92258…png`, is the AboutMe **screenshot** the
previous page used — a picture of the old page, not a portrait. It is deliberately
unreferenced.

The frame draws **two** text overlays over that photo, and the owner has since
supplied markup for them. They are treated very differently:

**1. The name and role — still not reproduced.** "YASIR MUSA", "SOFTWARE ENGINEER",
"BAYDREAFRICA" and a blurred dark pill appear in the frame but are **not in the
supplied markup either**, so there is nothing to transcribe. Inventing an overlay
to match a frame nobody can open is a worse outcome than rendering the photo the
owner supplied. It needs its own asset or its own copy.

**2. The contact card — built, as HTML.** The supplied markup does contain the
phone / email / location card, as a 304 × 104 glass panel at `y=371` in the
portrait's coordinate space. It is reproduced as a **sibling overlay div**, not
pasted into the SVG — see "The contact card is HTML, not the SVG's outlines" below.

### The contact card is HTML, not the SVG's outlines

The frame draws the card's three labels as **vector `<path>` outlines**. Pasting
that in would have been the smaller diff and the wrong one, for four reasons:

1. **The text is not text** — invisible to search, translation, zoom and assistive
   technology, with the alt text then having to describe all three rows in a
   sentence.
2. **A placeholder becomes indistinguishable from real data.** The card ships the
   frame's own placeholder strings, so an owner reading the page could not tell a
   baked-in placeholder from a real number. That is the exact failure the old page
   made with `+234**********`. In `content/about.ts` the labels are greppable, and
   `ContactRow.href` is **optional** precisely so a placeholder cannot become a
   link: no `tel:` to a made-up number, no `mailto:` to a placeholder. Every row is
   plain text until the owner supplies a value, at which point the same component
   links it with no change.
3. **Phone and email must be tappable**, and `tel:` / `mailto:` need real elements.
4. **The glass is preserved.** The panel is 10%-white fill plus `backdrop-blur`, and
   that works over an unmodified photograph as a sibling element, so the asset is
   left exactly as the frame exported it.

**Geometry, in `cqw` so the card tracks the portrait.** 304/421 = 72.209% wide,
104/475 = 21.895% tall, `rx` 8, blur 2px, 13px inset, 9px between rows, 20px
glyphs, 15px labels. The portrait wrapper is a `@container`, so at `lg` — where the
column is exactly `--size-portrait-w`, 421px — 1cqw = 4.21px and the card lands on
the authored 304 × 104. Fixed px type would have kept 15px labels while the portrait
shrank to a phone's width.

**The three row glyphs are lucide, not the frame's outlines.** `Phone`, `Mail` and
`MapPin` at `strokeWidth={1.8}`, which lands at 1.5px in a 20px box on lucide's
24-unit grid. These are **UI icons, not brand marks** — that is the distinction
that put KiCad on simple-icons and these on lucide. Their `strokeWidth` is derived,
not the frame's literal 1.5, and **nothing here has been seen rendered**: no browser
is available in this environment.

**The card's colours are deliberately NOT in `verify:contrast`.** Every other
pairing in `theme.css` is text on a known solid background, so its ratio is
computable. This one is 10%-opacity white glass over a *photograph*: the effective
backdrop changes with every pixel behind it, so no single ratio exists to assert, and
a pair added to the gate would be a number that could never fail while teaching the
gate nothing. Stated instead: near-white on glass, the same relationship as
`--tech-tile-foreground` on `--tech-tile`, unchecked against the rendered photo.

### A tile with no destination is not a link

**The row is five tiles, and the frame's five were not these.** The frame drew four
networks plus a **phone** tile — that fifth glyph is two half-paths meeting on a
vertical centre line, which draws a handset, so it is not a network and was never a
`SocialLink`, having no `network` to fill that field. It was dropped on the owner's
instruction 2026-09-26 along with **Behance**, taking the row to three tiles. Later
the same day the owner asked for **GitHub and YouTube to be added to the profile
card**, so the count is back to five by coincidence only. `behance` was dropped from
the `SocialNetwork` union and from `common/icons.tsx` rather than left as an unused
glyph: it had no other consumer, and neither the header nor the footer links Behance.
The phone has not come back as a tile — it is a contact-card row now, which is where
the frame put contact details.

**YouTube is on the profile card ONLY.** The owner's scope was explicit, and it is
asserted from both sides: `aboutSocialLinks` contains `youtube` and
`profile.socialLinks` does not. The header and footer are rendered from the latter,
so they would pick the network up silently the day anyone added it there. `youtube`
is in the `SocialNetwork` union — that union is a *glyph* key, and membership in one
of the two arrays is what puts a network on a page.

**Inertness follows an EMPTY `href`, not the `unverified` flag.** `unverified` is a
review flag: it keeps a guessed URL greppable. The owner supplied **Instagram**
(`https://instagram.com/baydre_africa`) and **YouTube**
(`https://www.youtube.com/@bay_dre`) on 2026-09-26, which cleared the flag on both
and left the row with **no inert tile at all** for the first time. Both addresses
are stored **verbatim**, including Instagram's bare host and YouTube's `@bay_dre`
handle — which is *not* the `baydre_africa` the other networks use, so normalising
either one to match the others would break a real link. The inert branch in
`AboutSocialRow` is kept for the next network that arrives without a URL, and
asserted on the source rather than on a fixture. Of the five:

- **LinkedIn, X** — live, owner-confirmed.
- **Instagram, YouTube** — live, owner-supplied 2026-09-26.
- **GitHub** — live, and **still flagged `unverified`**: the owner gave the other
  two and no GitHub address, so the inherited guess stands. Its `href` is reused
  verbatim from `profile.socialLinks`, so the card and the header/footer cannot
  drift, and one confirmation clears the flag in both files. Supplying Instagram
  and YouTube does **not** confirm it by implication.

`href="#"` is a link to the top of the page and an invented URL is a link to
somewhere wrong — both are worse than an inert tile that keeps the frame's shape
and admits the gap. The page is asserted never to emit an empty or `#` href.

`/about`'s social row is a **separate array** from `profile.socialLinks` because the
two genuinely differ: the frame's row adds Instagram and, now, YouTube.

`common/SocialLinks` is still not reused for this row — it is 40 × 40 tiles filled
with `--surface` carrying a dark glyph, and this row is 36 × 36, outlined, with a
light glyph. Same `SocialIcon` glyphs, different object. Sharing the component would
have meant a variant prop for a second geometry used once.

### Two of the five glyphs here are authored, not transcribed

`instagram` in `common/icons.tsx` is marked AUTHORED, NOT TRANSCRIBED. The frame
draws a real brand path for it, but that path is not in the working copy of the
frame, so it was rebuilt from the mark's official construction on the shared 24 × 24
grid — which is how the first three glyphs got here too, the frame having supplied
only three identical placeholder squares. Behance was in the same position and was
removed with the tile.

`youtube` is the same idea with a stronger case: the frame draws **no** YouTube
glyph at all, so there is nothing to transcribe. Its path comes from `simple-icons`
(CC0, already a dependency for the Tools row) rather than a hand-drawn play button —
the identical trade-off made for KiCad, where an existing CC0 brand source beats an
unaudited redraw. **Neither glyph has been seen rendered**; no browser is available
in this environment.

### Tools and Technical Skills carry owner content, not frame content

Both of the frame's two lower blocks are placeholders, and both were replaced with
owner-supplied lists on 2026-09-26:

- **Tools** — the frame's row is five tiles all reading "React.js" with one glyph,
  the same defect as the Work cards' "Built with" panel. It supplies no tool
  information at all. The entries are the owner's, and there are now **seven** of
  them, not five, so the row's authored proportions no longer hold — see
  "Seven tools, four across" below.
- **Technical Skills** — the frame's four cards are *languages* (JavaScript,
  TypeScript, Python, Golang) as single 120 × 120 logos under `01`–`04`. The
  owner's four are *roles*. The frame's **content** is not adopted — no card is
  promoted back to a language — but its **mark slot is**: each role tile carries
  a real brand mark, added on the owner's instruction of 2026-09-26 ("add the
  icons to each skills"). That mark is the role's **own lead technology**,
  `stack[0]`, looked up through the shared `TechIcon` registry; see "The mark is
  the lead technology, not a logo for the role" below. The frame's `01`–`04`
  indices are kept as authored. Its **heading is not** — the
  owner renamed "Services" to **"Technical Skills"** on 2026-09-26, because
  "Services" was accurate while these were languages and a role is a capability
  rather than a service being sold. The three block headings now live in
  `content/about.ts` as `aboutHeadings`; they were inline literals until this
  rename, which is what made it a one-value change.

### The frame's Technical Skills snippet, blended

The owner pasted the frame's real Technical Skills markup on 2026-09-26 with the
instruction to **apply it and remove nothing**. That is a blend, not a port: the
frame's tiles are language *logos*, and the content here is *roles*, so the logos
stay out while every piece of the frame's **chrome** goes in.

Adopted from the frame:

| Frame | Built |
| --- | --- |
| heading `Neutral-Color-200`, `font-medium` | `text-muted-foreground` (`#a8a7b0`), `font-medium` |
| per-tile `border-t border-Neutral-Color-200` | `border-t border-muted-foreground` |
| per-tile `py-3` | `py-3` |
| tile `justify-center items-center` | `items-center` (was `items-start`) |
| `gap-6` index → title | `gap-6` (was `gap-12`) |
| index `text-sm` `font-normal` `capitalize` `tracking-wider`, white | `text-caption` `font-normal` `capitalize` `tracking-wider text-white`, flush left |
| label `text-xl` `font-normal` `capitalize` `tracking-widest` `text-center` | `text-description` `font-normal` `capitalize` `tracking-widest text-center` |
| `gap-8` between rows, `gap-12` between tiles | `gap-8` / `md:gap-x-12` |
| `self-stretch` outer column, `gap-3` | `w-full`, `gap-3` |

**The tile rule is `border-muted-foreground`, not `border-rule`.** `--rule` is
`#e9e9ec` — a near-white for the Services/Contact/Footer dividers — while the
frame's tile rule is the *same Neutral-200 as its own heading*, a much greyer
line. Substituting `--rule` would have been a plausible-looking match roughly
three times too light.

**The 2 × 2 arrangement comes from a `grid`, not the frame's nested `flex-1`
divs.** The grid was already here, already produced the frame's arrangement, and
additionally collapses to one column on narrow screens, which `flex-1` cannot do.

Deliberately **not** taken from the frame:

1. **The four 120px language SVGs.** JavaScript / TypeScript / Python / Golang
   stay out — a role is not one technology. Their slot is the technology list.
2. **The fixed `w-44` on the label.** 176px is sized for one short word; role
   titles here run to ~20 characters and would wrap mid-phrase.
3. **`text-base` (16px) on the heading.** The owner asked for these two header
   sizes to be *increased* on 2026-09-26, and 16px was smaller than the 20px role
   titles beneath it. `--text-about-section` (20px) stands.

`tracking-widest` on the label **is** applied even though the frame pairs it with
short language names; at 20px in a 2-column grid the longest role still fits on
one line. It is the first thing to drop if it reads loose.

`--text-index` is now **unused** — the About indices moved to `--text-caption`
(14px) to match the frame's `text-sm`. It is kept, being a general step on the
scale rather than an About token, and is marked in `theme.css`.

### The mark is the lead technology, not a logo for the role

Each role tile carries one real brand mark, drawn through the **same
`common/TechIcon.tsx` registry the Tools row uses** — no second icon source, no
new dependency, no lucide tier.

The mark is **`stack[0]`**, the role's own first technology:

| Role | Mark | Fill |
| --- | --- | --- |
| 01 Backend Engineering | `siPython` | `#458ac3` |
| 02 Full-Stack Development | `siReact` | `#61dafb` |
| 03 DevOps & Cloud | `siLinux` | `#fcc624` |
| 04 IoT & Embedded Systems | `siRaspberrypi` | `#c83156` |

**Deriving it from `stack[0]` instead of adding a `mark` field is the point.** A
separate field could name a technology the role does not claim; this cannot. It
is also the honest reading of the frame, which pairs a mark with a label — what
it shows is *a technology that represents the card*, not *the card's identity in
one glyph*. So the mark is `aria-hidden` (the role's name and its entire stack
are already text on the same tile), and "IoT & Embedded Systems" shows Raspberry
Pi — the first thing that role lists — rather than KiCad, which was the easier
pick because its mark was already in the registry.

This reverses an earlier decision here, which was that a role has no single glyph
and so gets no mark. The reasoning was sound but it answered a question nobody
had been asked, and the owner asked for the icons.

A test loops every role asserting `hasTechIcon(role.stack[0])`, that exactly one
mark renders, and that the four fills are **distinct**. The guard is the point:
the About Tools row once rendered **seven empty tiles** because "React" was
missing from the registry, and a lookup that returned the wrong glyph would pass
every other assertion.

**The four role fills are corrected against `--background`, not `--tech-tile`.**
The role tiles have no surface of their own, so the marks sit on the page. That
is why Python, React and Linux pass with more room than they have on the Tools
tiles, and why Raspberry Pi needed its own correction: simple-icons' `#a22846` is
**2.57:1** there, raised to **`#c83156` (3.53:1)** by lightness only, hue Δ0.1°.
Both surfaces are asserted in `verify:contrast.mjs` so they cannot be confused
again, and the raw value is in `SUPERSEDED` like every other brand correction.

**The mark is `size-28` (112px), not the frame's 120px.** The frame draws a 120px
`<svg>` inside a `size-28` `overflow-hidden` box, which crops 4px off the right
and bottom of every mark — reproduced literally, that clips the Python and
Raspberry Pi glyphs. 112px is the box the frame actually reserved.

The frame's `gap-2` between mark and label is reproduced by nesting the mark and
the `h3` in one `flex flex-col items-center gap-2` block, so the label does not
sit 24px under the mark like the tile's other children.

### Seven tools, one line, and the 620px cap removed

The owner's Tools row is **seven** entries on **one line**, against the frame's
five. That needed two changes, because the frame's geometry cannot hold it:

**1. `--size-about-tools` (620px) is REMOVED.** That token is the frame's own block
width, authored for a five-tile graphic that did not fill the copy column. Seven
tiles inside 620px is 68px each, and 44px after the tile's own `p-3` — narrower than
the `Git & GitHub` label alone, so every label would have wrapped to three lines
inside a 32px icon slot. The block now fills the column, which is 811px at `lg`,
giving 95px tiles and 71px of content. The token and its `--spacing-about-tools`
utility are deleted rather than left unused, and `verify-geometry` no longer asserts
it. This is the one place the About layout stops being derivable from the frame.

**2. `flex-wrap` → `flex-nowrap` above 536px.** That threshold is 7 × 56px tile +
6 × 24px gap. Below it a single line is not physically possible, so the row keeps
wrapping two-across. The basis is `(100% − 9rem) / 7` with `flex-1`, so the tiles
divide the row exactly and leave no rounding gap at the end.

Intermediate states on the way here, both discarded: a 4-across basis (7 = 4 + 3,
the only divisor leaving a full second row) when the ask was for fewer rows, and
5-across, which is what the frame's five tiles used. The per-line count is not
readable from a fractional basis, so both halves are asserted in
`ProfileSection.test.tsx` — the `nowrap` class, and `aboutTools.length % perRow === 0`.

### Tool marks: simple-icons, and three brand hexes that had to be corrected

`TechIcon` draws its paths from **simple-icons**, now a dependency
(`pnpm add simple-icons`, v16.32.0). Justification, per AGENTS.md §4: it supplies
six real brand marks that would otherwise be hand-authored approximations of
trademarked artwork, and it is CC0-1.0 — public domain, so there is no attribution
obligation or trademark clearance to reason about. It is the reference set for
this: ~3,400 brand SVGs on a common grid, each with a documented brand hex.

An earlier pass used `lucide-react` metaphors — `Braces` for Python, `Terminal` for
Linux, `Rocket` for Django. **That was the wrong library.** lucide is a generic UI
icon set and deliberately carries almost no brand logos, so nothing in it is a
Python or a Django; the paths were the valuable part of the idea and the metaphors
were filler. Shipping filler as though it were identity is worse than shipping
nothing. lucide is kept for the one entry that genuinely has no brand.

| Tool | Source | Shipped fill | Note |
| --- | --- | --- | --- |
| Python | `siPython` | `#458ac3` | **CORRECTED** from `#3776ab` |
| Django | `siDjango` | `#1e9769` | **CORRECTED** from `#092e20` — was 1.13:1, invisible |
| FastAPI | `siFastapi` | `#009688` | 3.54:1, unchanged |
| React | `siReact` | `#61dafb` | 8.01:1, unchanged |
| Git & GitHub | `siGit` | `#f14639` | **CORRECTED** from `#f03c2e` |
| Linux | `siLinux` | `#fcc624` | 8.20:1, Tux, unchanged |
| KiCad | `siKicad` | `#6a81d5` | **CORRECTED** from `#314cb0` |

**KiCad came from the owner's own file first, and the library won on the evidence.**
`AI` was the last entry with no brand mark — a field has no logo — and was replaced
on 2026-09-26 by **KiCad**, which closed the last gap: the **lucide tier is gone
entirely** and `TechIcon` has no icon-set dependency left at all.

KiCad was initially inlined from an owner-supplied `kicad.svg`
(`cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/kicad/default.svg`). That
file's path turned out to be **byte-identical to `siKicad.path`** — 3,141 characters,
same 24 × 24 grid, same `#314CB0` hex — so thesvg and simple-icons ship the same
mark. The library is used and the vendored file **deleted** rather than left as an
unreferenced copy that could drift. The owner's URL is recorded here so it can be
re-fetched; a test asserts it stays recorded.

**Four brand hexes had to be corrected.** simple-icons' own colours are unusable
on `--tech-tile` (#313131): Django's `#092E20` measures **1.13:1** and Python's
`#3776AB` **2.69:1**, against the 3:1 requirement for a graphic. Each shipped value
raises lightness and preserves hue, and all three are gated in
`verify-contrast.mjs` with the vendor's original kept under `SUPERSEDED` — so the
departure from a third party's colour is auditable rather than silent. The gate
now covers 25 pairings and verifies 9 corrections.

**`Git & GitHub` is one tile, so it takes one mark** — `siGit`, the branch mark,
because the label leads with Git. The octocat is a real mark already in
`common/icons.tsx` and stays there, where it links the actual GitHub account.

**`"React.js"` is deliberately NOT the library's React.** The Work cards are
frame-derived, so their glyph stays the path the design supplied, on the export's
32 × 32 grid. simple-icons' React is the same logo on 24 × 24, so substituting it
would change how the mark sits in its 32px box with no browser here to check.
Changing reviewed, frame-derived UI on an unverifiable hunch is the worse risk.
The cost is React existing twice in two coordinate systems; unifying them needs
one browser comparison, so it is a noted follow-up rather than a guess.

**A real bug this exposed.** The About row rendered **seven empty boxes**,
including React's. Look-up is by the tool's own label, and the two rows spell React
differently: `projects.ts` says `"React.js"`, the About row says `"React"`. The
registry only knew `"React.js"`, so `brand["React"]` was `undefined`. Both
spellings are now explicit keys, and a test loops every tool in `aboutTools`
asserting `hasTechIcon` — a page's choice of label no longer decides whether its
icon appears.

**Bundle cost: +9 kB raw, +4.3 kB gzip.** `simple-icons` is 16 MB unpacked, but it
is `sideEffects: false` and the six imports tree-shake; verified against the built
bundle that exactly 6 of ~3,400 icons are present.

Note `AI` names a field rather than a product, and the biography does not mention
it. Left as supplied, like the TypeScript mismatch below.

The frame's stack and its biography disagree — the biography says TypeScript, no
role lists it. Both are left exactly as supplied; copy is the owner's to
reconcile.

### `TechTile` is shared, and reserves its icon box

The Tools tiles are the same object as the Work cards' "Built with" tiles, so
`common/TechTile` is now the single copy. Only the tile travels: the two callers
size tiles completely differently (Work wraps 3 + 2 inside a `@container` panel,
About is one row of five in a 620px block) so the wrapping `<li>` stays at the
call site.

`TechIcon` returns `null` for a tool it has no glyph for. `TechTile` therefore
**always** renders the 32 × 32 box and treats the glyph as optional inside it.
Before this, an unmapped tool produced a tile with no icon box — roughly half the
height of a glyphed one, its label 44px higher. That was invisible while every
Work stack entry was "React.js", and would have been very visible on a Tools row
where four entries of five have no glyph. The Services section reached the same
problem and resolved it the other way — by removing the slot rather than
reserving it — so the two are no longer examples of one decision.

## 7. SUPERSEDED — the previous Figma Make export

Recorded so the values are not rediscovered and mistaken for the design.
Measured for reference:

| Value | Role in old export | Contrast on `#f9f9ff` | Verdict |
| --- | --- | --- | --- |
| `#8d8ba7` | muted text | **3.14:1** | **fails** AA for body text |
| `#f7df1e` | rating stars | **1.29:1** | **fails** AA; fine as a graphic only |
| `#313131` | body text | 12.40:1 | pass |
| `#5d5a88` | brand violet | — | not carried over |
| `#61dafb` | accent | — | not carried over |

The old export was **light** (`#f9f9ff`); the authoritative design is **dark**
(`#131417`). It specified Inter, DM Sans and SF Pro; the authoritative design
specifies Jura and Fraunces. The old export is a different design, not an earlier
draft of this one.

---

## 8. How the geometry is verified

`pnpm verify:geometry` (`scripts/verify-geometry.mjs`) parses the **built**
stylesheet, resolves the custom-property cascade as a browser would at a 1440px
viewport, and checks two things:

1. **The numbers** — header 84, clearance 56, wordmark 140, content 1272,
   paragraph column 688, image 431, and the authored gaps.
2. **The indirection** — that `pt-hero-top`, `py-header-pad`, `p-nav-pad`,
   `gap-nav-gap`, `gap-cluster-gap`, `pb-hero-tail`, `container-site` and the
   remaining spacing utilities reference their custom properties rather than
   repeating a literal.

The second check is the one that matters. Re-hardcoding
`--spacing-hero-top: 3.5rem` would leave every number in check 1 passing —
because the literal happens to equal the derived value today — while breaking
the link to the formula. That is the exact drift this system is built to prevent,
so it is asserted rather than assumed.

Run it after `pnpm build`; it reads `dist/assets/index-*.css`.

---

### Provisional content is recorded, not rendered

Owner-confirmed 2026-09-26: provisional work content must be **visibly**
provisional, so it cannot be mistaken for a shipped case study. That was
implemented as a `ProvisionalBadge` pill beside the card title and the
`/projects/:id` heading.

**Reversed by the owner the same day.** The pill rendered *between* the title and
the `01` label, but the design gives that row exactly two children
(`justify-content: space-between` over the title and the index), so the pill was
intruding on the authored layout. The pill, the component and the
`provisionalReason` field that existed only to feed its tooltip are all removed.

What survives is the record, in the places a developer actually reads:
`Project.provisional` still gates the `ProjectPage` placeholder notice, and each
project's reason is in a comment in `src/content/projects.ts`. **A visitor is no
longer told any of this is placeholder** — the design shows no such marker, and
that is the owner's call to make, but it is a real loss of the honesty guarantee
and worth remembering if the Work section ever ships invented content.

### The card at every width

The card is a component that renders at all viewports, so its **display** type
scales and its body/UI type does not — the same split the rest of the token set
already uses (`--text-body`, `--text-caption`, `--text-panel-label` are all fixed).

| Width | `--text-section` | card title | `01` | title/section |
| --- | --- | --- | --- | --- |
| 375 | 28px | 24px | 18px | 0.86 |
| 1024 | 30.7px | 24px | 18px | 0.78 |
| 1440 | **40px** | **32px** | **24px** | **0.80** |

A fixed 32px card title was **larger than the fluid section heading at every
width below 1176px** — the card out-weighed its own section. Both clamps
overshoot their cap at 1440, so the authored 32px and 24px are exact there, and
the design's 24/32 = **0.75** ratio between `01` and the title holds at every
width. `--leading-card-index` is the unitless 1.3333 so it tracks the fluid size;
an absolute `2rem` would leave an 18px label on a 32px line.

The artwork is `aspect-[621/494]` at every width rather than a desktop-only
height. With `lg:w-[38.8125rem]` that still resolves to exactly 621 × 494 at
1440, and it fixes the placeholder, which had no height below `lg` and collapsed
into a ~40px bar.

**A class with no token renders as nothing, and nothing catches it.** While
`--leading-card-index` was missing, `pnpm build`, `lint`, `typecheck` and the
test suite were all green while `01` sat on `line-height: normal` — which
AGENTS.md forbids. `sections.test.tsx` now asserts that every custom
`text-*`/`leading-*` class in the card has a token behind it.

## 8.1 Deployment

Published to GitHub Pages by `.github/workflows/deploy.yml` at the repository
root, building `2026/` and uploading `2026/dist`. The 2023 static site is not
published; it was archived to stay browsable in the repository, and this
repository's Pages site is now the 2026 app.

Three settings make a client-routed app work from a subpath, and **all three fail
quietly** — none of them throws, and `pnpm build` passes while the site is broken
in production.

| Setting | Value | Where | If it is wrong |
| --- | --- | --- | --- |
| Vite `base` | `BASE_PATH=/portfolio/` | workflow `env` | assets 404 from the host root; page renders blank |
| Router `basename` | derived from `import.meta.env.BASE_URL` | `src/app/routes.tsx` | app boots, then every deep link falls through to `NotFoundPage` |
| `404.html` | copy of `index.html` | `scripts/emit-404.mjs`, in `pnpm build` | `/about` and `/projects/:id` are server 404s on refresh or a shared link, while in-app clicks still work |

The subpath is required because Pages serves a project site from
`https://<user>.github.io/<repo>` and this repo is `portfolio`. **The base is a
build-time environment value, never a literal in the code**, so adding a custom
domain is a one-value change in the workflow (`BASE_PATH=/`); the router basename
and every in-page anchor derive from it and need no edit.

`404.html` is a **copy**, not a redirect: a redirect loses the requested path,
whereas a copy leaves the URL alone so the app boots at `/portfolio/about` and the
basename strips the prefix. It is emitted by `pnpm build` rather than by the
workflow, so a local build is byte-for-byte what ships and the two cannot drift.

### In-page anchors

`SmartLink`, `HireMeButton` and `SiteFooter` resolve their `/#fragment` hrefs
through `siteUrl()` in `src/lib/site-url.ts`. A raw `href="/#work"` resolves
against the *host* root, so under `/portfolio/` it would land on the 404 page —
a link that still looks correct and goes somewhere else. `siteUrl` reads
`BASE_URL`, so there is no second source of truth to drift, and it returns
`mailto:`/`tel:`/absolute URLs untouched.

The helper was written after a test caught it prefixing `mailto:`: the first
guard matched only `scheme://`, and `mailto:` has a scheme but no `//`. The
About contact card links to both `mailto:` and `tel:`, so that would have been a
live break, not a theoretical one.

### `environment: github-pages` is mandatory

The deploy job declares `environment: github-pages`, and it cannot be removed.
`actions/deploy-pages` attaches the Pages deployment to the job's *environment
deployment* and fails with `Missing environment` when there is none.

This is recorded because it was got wrong once. The environment was dropped in
the belief that it was only there to surface the `page_url` output, and that
`deploy-pages` authenticates purely through the job's OIDC token. The second half
is true; the first does not follow. Dropping it did not make the deploy
independent of the environment's protection rules — it made the deploy
impossible.

The protection rules are real and are the other half of the picture: declaring
the environment subjects the job to that environment's branch allowlist, so a
push to a branch not on it is rejected with *"not allowed to deploy to
github-pages due to environment protection rules"*. `on.push` is therefore
`master`-only, and widening the allowlist is a repository setting (Settings →
Environments → github-pages → Deployment branches and tags) that no workflow
file can perform.

### One manual step

Pages must be set to build from **GitHub Actions** — Settings → Pages → Source.
A workflow cannot do this for itself; until it is set, the build and upload
succeed and the deploy job fails.

## 9. Still open

Content and asset gaps, by provenance. `DESIGN` is from the Figma source,
`TEMPORARY` is an implementation decision that can be revisited, `PENDING` needs
input from the owner or a new snippet.

| Item | State | Notes |
| --- | --- | --- |
| Pages source | **`PENDING`, manual** | The workflow cannot set this itself. Settings → Pages → Source → **GitHub Actions**, or `gh api -X PUT repos/:owner/:repo/pages -f build_type=workflow`. Until then the artifact builds and uploads but `deploy-pages` fails. See §8.1. |
| Custom domain | `OPEN` | The site currently publishes to `baydre.github.io/portfolio/`, which is why `base` is `/portfolio/`. A domain means changing one value — the workflow's `BASE_PATH` — to `/`. Nothing in the code hardcodes the subpath. |
| ~~About page structure~~ | **CLOSED** | The About frame was supplied 2026-09-26 and the placeholder page — invented biography, masked `+234**********`, five identical tool tiles, colour swatches for logos, two handler-less `<button>`s — is deleted. See §6.1. |
| About tools list | `OWNER SUPPLIED` | The frame's Tools row is five identical "React.js" tiles and carries no information. The five entries are the owner's. Only React has a glyph; the other four tiles reserve the icon box and render label-only. Supplying real brand paths is a data change to `TechIcon`. |
| About tools row | `OWNER SUPPLIED`, `ADAPTED` | Seven owner entries on **one line** (`AI` → `KiCad` 2026-09-26) against the frame's five identical "React.js" placeholders. Required deleting `--size-about-tools` (620px could not hold seven) and `flex-nowrap` above 536px; 811px column gives 95px tiles. `FastAPI` pairs with `Python`, `AI` is last. |
| About tool marks | `ADAPTED` | All seven marks are real brand paths from **simple-icons** (CC0, added as a dependency with justification; +9 kB raw, tree-shaken to 7 icons). `AI` → `KiCad` on 2026-09-26 removed the last markless entry and the whole lucide tier. KiCad was first inlined from an owner-supplied `kicad.svg`, later found byte-identical to `siKicad.path`, so the library is used and the file deleted. **Four brand hexes corrected** — Django 1.13:1 and KiCad 1.73:1 were effectively invisible on the tile — each hue-preserving and gated in `verify-contrast.mjs` (26 pairings, 10 corrections). `"React.js"` stays on the design's 32 × 32 path so the frame-derived Work cards are unchanged. Fixed a real bug: the registry keyed `"React.js"` while this row says `"React"`, so all seven boxes were empty. |
| About sticky portrait | `OWNER REQUEST` | The portrait card (image + social row) is `lg:sticky lg:top-24`, restoring the previous placeholder page's sidebar behaviour. `top-24` clears the `sticky top-0` header. Depends on no `overflow` ancestor and on the parent staying `items-start`; both asserted, because either silently kills the feature. |
| About skill roles | `OWNER SUPPLIED` | The frame's four cards are languages as 120 × 120 logos; the owner's four are roles with technology lists. The frame's `01`–`04` are kept; its "Services" heading is **owner-renamed "Technical Skills"** (2026-09-26), since a role is a capability, not a service. Headings now live in `aboutHeadings`. The frame's stack and its biography disagree about TypeScript; both left as supplied. **Each role also carries a mark — `stack[0]`'s real brand glyph, owner-requested 2026-09-26**; see "The mark is the lead technology, not a logo for the role". |
| About portrait | `PARTIAL` | `src/assets/profile.svg` is the frame's own card but holds **only the photograph**. The frame overlays two text layers on it and the owner has now supplied markup for both: the **contact card is built** (see the next row), while the name and role — "YASIR MUSA", "SOFTWARE ENGINEER", "BAYDREAFRICA" plus a blurred pill — are **still absent from the supplied markup** and so are not reproduced. `alt` is empty because nothing names the person in it — supply real alternative text before launch. **Not viewed**: no browser and no image input in this environment. |
| About contact card | `PARTIAL` | The card is **built** as a 304 × 104 glass overlay at the portrait's bottom-left, in `cqw` against a `@container` on the portrait wrapper so it scales with the photo. Built as HTML, not pasted from the frame, because the frame's three labels are vector outlines. Its **three values are `PENDING`** — the card ships the frame's own placeholder strings ("Phone Number", "Email Address", "Location") and no `href` at all, so no `tel:` or `mailto:` can ship by accident. Supplying a value in `aboutContact` makes the row a link with no component change. Its colours are **deliberately not gated** by `verify:contrast`: glass over a photograph has no computable ratio. Glyphs are lucide at a derived `strokeWidth`; **never rendered** — no browser here. |
| About social URLs | `PARTIAL` | The row is **five** tiles — LinkedIn, X, Instagram, GitHub, YouTube — after the owner asked for GitHub and YouTube on the profile card on 2026-09-26. The count matches the frame's five by coincidence only: the frame drew four networks plus a **phone** tile, which was removed with Behance and has instead become a contact-card row. **YouTube is on the profile card only**, asserted absent from `profile.socialLinks`, so it cannot reach the header or footer. LinkedIn and X are owner-confirmed; **Instagram and YouTube are owner-supplied** (2026-09-26) and stored verbatim — bare host, and the `@bay_dre` handle that differs from the other networks. All five tiles are live links, so the row has no inert tile for the first time; the inert branch is kept for the next URL-less network. **GitHub is still `unverified`** — no address was supplied for it, and giving the other two does not confirm it. |
| Instagram and YouTube glyphs | `UNVERIFIED` | Both AUTHORED, not transcribed — see §6.1. Instagram was rebuilt from the mark's official construction; the frame's own path was not in the working copy. **YouTube has no frame path at all**, so it comes from **simple-icons** (CC0) — the same trade-off as KiCad. Neither has ever been rendered. Behance was in the same position and was removed with its tile. |
| About biography tracking | `CONFIRMED` | The frame sets the biography `tracking-widest` = 0.1em, which is **1.4px at 14px** — unusually loose for a face this design otherwise sets tight. It was long marked `UNVERIFIED` because the frame had not been seen; the owner supplied the frame's own markup on 2026-09-26 and it does specify `tracking-widest`, so the value is confirmed rather than assumed. Held in `--tracking-about-bio`; deleting that one declaration returns the copy to default tracking. |
| About skill stacks | `OWNER AMENDED` | Three positional amendments, 2026-09-27: `C` added to **Backend Engineering** and **Unit testing** added **last**; `CI/CD` added **after Linux** on `DevOps & Cloud`. C was placed FIRST, then reversed the same day at the owner's request to sit **behind Python**, so the settled backend order is `Python, C, Django, FastAPI, REST APIs, PostgreSQL, Unit testing`. Additions only — no entry removed or reworded. `GitHub Actions` was left beside the new `CI/CD` entry rather than merged into it: they are the tooling and the practice, and the request was to add a term, not to combine two. |
| Backend role mark follows `stack[0]` | `CLOSED` | A real coupling, not an incidental one, and it moved twice in one day. A role's mark is `stack[0]` (`ProfileSection` renders `<TechIcon tool={role.stack[0]}>`), so the tile's logo is whatever LEADS its stack. C was put first, which moved the logo off Python onto C; the owner then put Python back in front, which moved it back. The mark therefore tracks the owner's ordering rather than being pinned to a language independently of it — the settled mark is **Python**, at its corrected fill `#458ac3`. `--brand-python` is gated on BOTH `--tech-tile` (its Tools tile) and `--background` (its role tile): two real surfaces, not a duplicate. |
| `--brand-c` is not a corrected value | `CLOSED` | simple-icons' C is `#a8b9cc`, which is **9.19:1** on `--background` — far above the 3:1 a graphic needs. So unlike Python, Django, Git and KiCad it is **not** lightened, and is absent from the integrity map that asserts corrections are lightness-only under 5° hue drift. C is `stack[1]`, so nothing draws it today; the token and its gate are kept anyway, on the surface a role mark would use, because the `TechIcon` entry is deliberately retained so a C-first order cannot break the tile. |
| About closing call-to-action | `ASSUMED` | Not in the frame. The previous page's panel, kept on the owner's instruction 2026-09-26 ("keep this for now"). Its heading and body are not transcribed from anything, and its gradient uses `--secondary` and `--accent`, both DERIVED. Its two actions were repaired to real destinations. Treat as unapproved until a frame exists. |
| ~~Six service descriptions~~ | **SUPERSEDED** | Closed 2026-09-26 by transcribing all six verbatim from the frame, plus the section description. **Superseded 2026-09-27**: all six titles and descriptions are now **OWNER-SUPPLIED** copy and none of them is the frame's. The `index` labels `01`–`06` are the frame's and are unchanged. See "The service copy is the owner's, not the frame's". |
| Secondary services line | **CLOSED** | Owner-supplied 2026-09-27, amended twice the same day. Final form: a 1px `bg-rule` above the line (the grid container now holds two `bg-rule`s, the frame's between its rows and this one), the label set in the heading face, and a closing **full stop** added. The label is `font-heading` (**Outfit**), NOT Maison Neue — that face is commercial Klim and unlicensed, and §2 records Outfit as its `TEMPORARY` substitute for this role; it is also the token the six service titles already use, so the label matches the cards rather than adding a fourth family. Items remain Jura at 24px. The full stop is composed in the component, not stored on the last item. |
| `font-body` is not a defined class | **PARTIAL** | The six Services card indices (`01`–`06`) carry `font-body`, but no such utility is emitted — `@theme inline` maps `--font-sans` and `--font-heading` only. The indices render in Jura by inheritance from `body { @apply font-sans }`, so this is a silent no-op rather than a visible fault. The secondary-services line deliberately uses `font-sans`. Left unfixed as out of scope; the fix is to change `font-body` to `font-sans` in `ServicesSection`. |
| `servicesSectionDescription` is stale | **PENDING** | Still the frame's verbatim paragraph, and it no longer matches the services it introduces: it offers "Digital experiences, brands, and technical solutions" and there is no longer a brand or digital-experience service. Left as supplied rather than rewritten — inventing marketing prose is not this file's call. Needs one owner decision. |
| ~~Service illustrations~~ | **CLOSED** | The frame's per-card artwork was **deleted** on owner request 2026-09-26 and replaced by `ServiceIcon`, six lucide marks keyed by title. That set was reviewed the same day as consumer-creative shorthand, re-picked as six "instrument, structure or measurement" marks, and then **removed entirely** on owner request 2026-09-27: six 192px pictograms read as illustration, not as capabilities. Five panels of transcribed `gray-200` geometry and one 12%-opacity holding rect were placeholders, and `01` (Web Design) was a placeholder *by construction*, having no geometry in the frame at all. `ServiceArtwork.tsx` and `ServiceIcon.tsx` are both removed. The 384 × 384 **slot is gone with the mark** — cards are index, title, description, and the suite fails if `aspect-square` or any `svg`/`img` reappears in one. See "There is no per-service mark". |
| ~~Service artwork sizes~~ | **MOOT** | The `UNVERIFIED` Tailwind-utility size readings only ever described the deleted geometry. Nothing depends on them now — the icon scales from a 24-unit lucide grid. |
| ~~`02` diagonal line~~ | **MOOT** | The one deliberate `ADAPTED` departure — a `w-40 h-0` div drawn as a 1px stroke — described deleted geometry. |
| Home page `//` numbering | **CLOSED** | The frame prints `//01`–`//06` and `//01`–`//04`; the About frame's `SkillRole` indices have no slashes, so the two halves of the site disagreed. The owner asked for the slashes removed everywhere on 2026-09-26 and they are. **The digits are untouched** — still the design's own authored labels, still one value per entry, still not derived from array position. The `//` went because it is a code comment marker, which on a page that discusses `//01` in a code block invited reading the display type as a comment. Asserted: no `//` in either section's rendered text, and every project index matches `^\d{2}$`. |
| Services content width | `ADAPTED` | The frame's wrapper is `w-[1285px] left-[71px]` while its own divider is `w-[1272px]`. 1285 − 1272 = 13px, and only the 1272 reading lands on the 84px gutter every other frame uses, so `container-site` is kept. Same 13px reappears as the artwork overflow below. |
| Service artwork width | `ADAPTED` | The frame's artwork is a fixed 384px, but a 1272 content width makes the card's content box 369.67px — the authored 384 would have to bleed 14.33px into the card's padding. `w-full` renders 369.67px (3.7% under) and never overflows; a fixed 384px overflows the card outright below ~1400px. |
| ~~Four real projects~~ | **SUPERSEDED** | Closed 2026-09-27. The frame's four identical IdCardify cards are no longer the shape of the section. What replaced it is recorded on the two rows below. |
| Hero photograph and favicon | **CLOSED** | Both owner-supplied 2026-09-27, replacing the `placehold.co` stand-in. The photograph is 5530×3684 / 2.7 MB, so two derivatives are committed (1280w 155 KB, 2048w 357 KB — 7–18× smaller) and the source is deliberately **not** imported; `srcset` + `sizes` picks one per device. `width`/`height` carry the *source* ratio (1.501:1, against the placeholder's 1.778:1) because that is what reserves the box before the bytes land, and `object-cover` absorbs the difference. The favicon source is 158×173 — **not square** — so each size is padded, never cropped, since a crop could cut the subject; `apple-touch-icon` is padded on `--background` because iOS renders transparency as black.
| Five real projects added | **CLOSED** | 2026-09-27, on the owner's names. Each entry is built from verifiable public data rather than authored copy: `summary` is the repository's own GitHub description, **verbatim**; `stack` holds only the detected language plus technologies the description names in prose; `repositoryUrl` was confirmed public. So these read thinner than IdCardify and that is correct — writing case-study prose around `A Backend Service for Digital Wallet Management` would mean inventing architecture, users and outcomes nobody has stated. None is flagged `provisional`: that flag means placeholder content, which IdCardify's five `React.js` tiles are, and these are not. |
| Ansible Deployment is a Gist, not a repository | **CLOSED** | `repositoryUrl` carries a gist URL, because that is where the work lives; the field is documented as "external repository, if public" rather than as a git remote. The summary is the **owner's** description, supplied on request. Worth flagging: the gist is itself titled "Beginner's Guide to Multi-Environment Application Deployment with Ansible" and holds a single Markdown file, so the gist reads as a written guide while the owner's description describes a deployable system. Both are the owner's; neither is invented, and the owner's framing is what ships. |
| `BG-Deployment-Strategy` is `blue-green-deployment-strategy` | **CLOSED** | Owner-confirmed 2026-09-27. The full repository name is used as the title rather than the abbreviation, and NGINX and Docker are in its stack because its own description names both. |
| Work carousel | **CLOSED** | Owner request 2026-09-27, corrected three times the same day: a single slider over all six on a 6s interval; then the Play/Pause and previous/next buttons removed; then the `1 / 6` counter and dot row removed. Nothing visible is left to click — it advances by itself and stops for hover, focus, or press-and-hold. Two of those three latched in the first attempts and both presented as the same symptom, "it pauses, then never resumes": a press released *outside* the container never ended because the listener was on the element, and hover could not tell a tap from a cursor, so a phone latched it permanently and autoplay was dead after the first touch. Fixed with a window-level pointerup and `pointerType` checks; both pinned by regression tests. Removing the manual controls also made suppressing autoplay actively harmful, so `prefers-reduced-motion` now renders all six stacked with no timer, no fade and nothing hidden — the design's own shape. All of it is itemised in `INTERACTION_SPEC.md` §4.3 |
| Four more brand marks for the Work projects | **CLOSED** | Shell, NGINX, Docker and Ansible, all from simple-icons like every other mark and all named because a repository states them. Three are **uncorrected** — Shell 9.15:1, Docker 4.13:1, NGINX 3.36:1 on `--tech-tile` already clear the 3:1 a graphic needs. Ansible is the fifth lightness-only correction: `#ee0000` is 2.87:1 there, lightened to `#ff2d2d` (3.51:1) with hue 0.0° and saturation 1.000 both unchanged. Their surface is `--tech-tile` like the other card marks, NOT the `--background` the About role marks sit on. |
| Four real projects | `PENDING` | The Work frame repeats one project across all four cards with identical copy and an all-`React.js` stack. One entry is modelled and flagged `provisional` in the data, and its five-tile `React.js` stack is kept as drawn so the panel's authored geometry is real. Replacing `src/content/projects.ts` is a data change only. |
| Stack glyph | `PENDING` | The card's two exports disagree: the Tailwind one has a React logo path, the styled-components one a flat `#61DAFB` rect. The logo is used and is **unverified** — see §6. Real brand SVGs are needed per tool. |
| Work card imagery | `PENDING` | The design's `/Frame1539*.png` are not in the repository. Every local PNG is already claimed by another page, so a labelled placeholder renders instead. |
| Product Page layout | `PENDING` | Block order is known (Description, Stack & Tools, The Challenge, The Solution) but no snippet was supplied. `ProjectPage` renders only blocks present in the data. |
| Hero image | `PENDING` | Design uses an external placeholder URL. A local asset stands in. |
| Social networks and URLs | `PARTIAL` | The footer's Connect column names GitHub, LinkedIn and X — the first evidence of what the header's three identical placeholder tiles are. Order differs between header and footer; header order is used. **LinkedIn and X URLs are owner-confirmed** (2026-09-26, including the underscore in the X handle). GitHub remains a guess and stays flagged `unverified`. The About frame adds Instagram, which the header and footer do not have; Behance was in the frame too and has since been removed; YouTube is on the profile card only — see §6.1. |
| Footer credit line | `PENDING` | The design shows a personal name beside the copyright. Reproduced verbatim. Confirm it is a credit and not leftover content. |
| Orphaned footer paragraph | `PENDING` | The location copy appears in both the Contact frame and the footer. In the footer it has no heading above it. Reproduced as designed; may be a design duplication. |
| Footer column gap | `PENDING` | Navigate and Connect stop ~290px short of the right gutter, suggesting a deleted third column. Laid out in normal flow, which closes the gap. No third column invented. |
| Header nav vs footer nav | Open | Header has Work/About/Contact; footer has Home/Work/Services/Contact. Services is unlinked in the header. Reproduced as designed. |
| Maison Neue | `TEMPORARY` | Substituted with Outfit. Revisit only if a licence is bought. |
| Formspree form ID | `TEMPORARY` | Transport is an interface (`src/lib/contact/`); swapping to a personal API is one file. Set `VITE_FORMSPREE_FORM_ID` — until then the form refuses to submit and says why. |
| Contact header block | `OWNER OVERRIDE` | Set in Outfit; the frame specifies Jura for both lines. See above. |
| Footer copy at 2 lines | `UNVERIFIED` | See above — within ~1.3% of fitting the 397px column; needs a browser. |
| Reply-window line break | `FIXED` | "24–48 hours" split after the en-dash; now a `whitespace-nowrap` element. See above. |
| Contact section copy | `PARTIAL` | `contactIntro` proofread against the frame 2026-09-26 and **corrected** — see below. `contactBlurb` still unverified. |
| Mobile and tablet layout | `PENDING` | No responsive design supplied. See §3.2 and §5. |
| Sticky vs absolute header | Open | The design positions the navbar absolutely over the frame. Kept `sticky` so nav is reachable on a long page; visually identical at rest. |
| Resume route | Open | Content exists, design does not, and the header's three items do not include it. Route retained, unlinked. |
| Mobile-menu focus management | Open | Focus is not moved into the disclosure on open, nor trapped while open. |
