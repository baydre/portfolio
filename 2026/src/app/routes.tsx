import { createBrowserRouter } from "react-router";
import { Layout } from "./layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProjectPage } from "./pages/ProjectPage";
import { ResumePage } from "./pages/ResumePage";
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
 * `/resume` is retained because the ResumePage content still exists, but it is
 * not linked from the nav: the design's header has exactly three items and none
 * is Resume. Removing the route and its content is a content decision, not an
 * implementation one.
 */
export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "resume", Component: ResumePage },
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
