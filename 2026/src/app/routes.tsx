import { createBrowserRouter } from "react-router";
import { Layout } from "./layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProjectPage } from "./pages/ProjectPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * The single source of truth for application routing.
 *
 * Exported separately from the router instance so that tests can mount this
 * exact table with `createMemoryRouter` instead of duplicating it.
 *
 * IA follows the Figma file, in which Work, Services and Contact are SECTIONS OF
 * THE HOMEPAGE, not pages. The evidence is the design's own footer: its Navigate
 * column lists Home, Work, Services and Contact, and the Figma file contains no
 * work, services or contact screen. The header reaches them as `/#work` and
 * `/#contact` anchors — see `NavItem` in src/content/types.ts.
 *
 * So `/work` and `/contact` are gone, along with the pages that stood behind
 * them. `/projects/:projectId` is the detail route; "Product Page" is the design
 * file's term for that same screen, and the application calls it a project.
 * Owner-confirmed 2026-09-26.
 *
 * `/resume` is UNPUBLISHED on 2026-10-13 (removed from the route table, so an
 * unknown-path request for it falls through to the 404 page): the Résumé page
 * content still exists in `ResumePage`, but it carries too many contradictory
 * and placeholder claims to repair safely through editing, and the owner chose
 * to stop serving it until verified résumé information is available — a
 * temporary content-integrity measure, not an abandonment of the page. The
 * header never listed Resume after the owner removed it from the NavBar item
 * list 2026-10-09, and the footer's "Yasir Musa" credit stopped linking
 * `/resume` the same day this route left.
 */
export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "projects/:projectId", Component: ProjectPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
];

/**
 * The router is mounted under Vite's `base`, not the host root.
 *
 * A GitHub Pages build of this repo is served from `/portfolio/`, so
 * `/portfolio/about` has to resolve to the `about` route. Without a basename the
 * router would read `about` as the whole path, miss every route, and fall
 * through to `NotFoundPage` on every deep link.
 *
 * `BASE_URL` carries a trailing slash (`/portfolio/`) and react-router wants the
 * basename without one, hence the strip. It is `""` for a root deployment, which
 * is react-router's own default.
 *
 * Deep links only reach the app at all because the build also emits `404.html`;
 * see `scripts/emit-404.mjs`. Pages has no SPA fallback, so without it a
 * hard refresh on `/about` is a server 404 rather than a client render.
 */
export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
