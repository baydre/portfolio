# Portfolio 2026

Site for **BaydreAfrica**, built with **Vite 6**, **React 18**, **TypeScript**,
**Tailwind CSS v4** and **React Router v7** (data mode).

> **Status: under construction.**
> This repository began as a [Figma Make](https://www.figma.com/) export and is
> being converted into a production-quality application. The Figma **HomePage**
> design is now implemented — header, hero, design tokens and self-hosted fonts.
> The remaining screens have not been designed yet, so the About, Work, Project
> and Contact pages are placeholders. See [`AGENTS.md`](AGENTS.md) for current
> state and [`docs/`](docs/) for the full documentation set.

## Requirements

- Node.js 20.19+ (developed against Node 26)
- pnpm 11+

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Typecheck, then build for production to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm test` | Vitest |

`pnpm build` runs `tsc -b` **before** Vite, so a TypeScript error fails the build.
This is intentional — do not work around it by relaxing `tsconfig.json`.

## Documentation

Start at [`AGENTS.md`](AGENTS.md) if you are an AI agent. For humans:

| Document | Purpose |
| --- | --- |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Design tokens and component inventory |
| [`docs/FIGMA_IMPLEMENTATION.md`](docs/FIGMA_IMPLEMENTATION.md) | How Figma maps to React |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Directory structure and layering |
| [`docs/COMPONENT_GUIDELINES.md`](docs/COMPONENT_GUIDELINES.md) | Writing components |
| [`docs/INTERACTION_SPEC.md`](docs/INTERACTION_SPEC.md) | Expected interactive behaviour |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) | WCAG 2.2 AA requirements |
| [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) | Definition of done |

`ARCHITECTURE.md` at the repository root is a pointer to `docs/ARCHITECTURE.md`.

## Source layout

```text
src/
├── app/          routing, layouts, pages, shadcn primitives
├── components/   the real component layer — header, hero, social links
├── content/      site copy, kept out of components and pages
├── imports/      superseded Figma-generated code — do not import
├── assets/       binary assets
├── styles/       Tailwind entry, design tokens, fonts
└── test/         Vitest setup
```

`src/imports/` is generated reference code, now **superseded** by the HomePage
design. It is excluded from TypeScript and ESLint and must not be imported.

## Attribution

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md).
