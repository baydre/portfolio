/**
 * Root-relative URLs that survive a subpath deploy.
 *
 * The site is served from a subpath on GitHub Pages — `baydre.github.io/portfolio`
 * — because the repository is named `portfolio` and Pages publishes it at
 * `<user>.github.io/<repo>`. That makes the deployment root `/portfolio/`, not
 * `/`, and a hardcoded `href="/#work"` resolves against the *host* root
 * (`baydre.github.io/#work`), which is the 404 page. The link silently breaks:
 * it still looks right, it just goes somewhere else.
 *
 * `import.meta.env.BASE_URL` is Vite's own resolved `base`, so this needs no
 * environment variable of its own and cannot drift from `vite.config.ts`. It is
 * `/` under `vite dev`, `vite preview` and the test run, and `/portfolio/` in a
 * Pages build — so the same source produces a working site in all four.
 *
 * The trailing slash is stripped before joining, because `BASE_URL` always ends
 * in one and `/portfolio/` + `/#work` would give `/portfolio//#work`.
 */

/** Vite's resolved base, without its trailing slash: `/` → ``, `/portfolio/` → `/portfolio`. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Prefixes a root-relative path with the deployment base.
 *
 * Accepts the leading slash the site's own content already uses, so
 * `siteUrl("/#work")` works as written and callers do not have to know whether
 * the base is empty. The input is a *site* path, not a URL: anything that
 * already carries a scheme, or is protocol-relative, is returned untouched, so a
 * base cannot corrupt an absolute link.
 */
export function siteUrl(path = ""): string {
  // Any URI scheme, not just `//`-bearing ones — `mailto:` and `tel:` are
  // absolute URLs too, and the About contact card links to both. Requiring `//`
  // would let those through to be prefixed with the base, turning a working
  // `mailto:` into a 404-shaped path.
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path;

  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
