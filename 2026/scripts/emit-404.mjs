// Emits `404.html` as a copy of `index.html`, so that deep links work on hosts
// with no SPA fallback — which is exactly what GitHub Pages is.
//
// The problem: this is a client-routed app. `/about`, `/resume` and
// `/projects/:id` exist only in the router, never as files in `dist/`. GitHub
// Pages serves static files and has no rewrite rule, so a hard refresh or a
// pasted link on `/portfolio/about` is a server 404 — a broken page for a route
// that works perfectly when you click into it. The site looks fine and is
// unusable for anyone arriving from a search engine, a shared link, or a
// bookmark.
//
// The fix is the standard Pages workaround, and it is a copy rather than a
// redirect. A redirect would send the browser somewhere else and lose the
// requested path; a copy leaves the URL untouched, so the app boots at
// `/portfolio/about`, the router's basename strips `/portfolio`, and it renders
// the `about` route. The 404 document only ever appears for a path the app
// cannot match, where its own `*` → `NotFoundPage` route takes over — which is a
// better 404 than Pages' default, and the one place this file is genuinely a
// 404.
//
// This is a copy, not a hand-written file, so `index.html` stays the single
// source: the hashed asset filenames, the module script and the `<base>`-free
// absolute asset paths are all whatever the current build produced. That also
// means it is correct for a subpath deploy without this file knowing the
// subpath — the asset URLs inside are already absolute.
//
// Usage: node scripts/emit-404.mjs   (run by `pnpm build`; not standalone)

import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const index = join(dist, "index.html");
const notFound = join(dist, "404.html");

if (!existsSync(index)) {
  // Fail loudly. A silent no-op here would ship a site whose deep links 404,
  // and the symptom appears on the deployed site rather than in the build.
  console.error(`emit-404: ${index} not found — did the build run?`);
  process.exit(1);
}

copyFileSync(index, notFound);
console.log(`emit-404: wrote dist/404.html from dist/index.html`);
