import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routes } from "../routes";

/**
 * Deployment wiring: the two things that make a client-routed SPA survive being
 * served from `https://<user>.github.io/<repo>` rather than from a domain root.
 *
 * Both are quiet failures when they are wrong. A missing `404.html` means deep
 * links 404 on the server while every in-app click works, so the site looks
 * healthy until someone shares a URL. A missing router basename means the app
 * boots and then falls through to `NotFoundPage` on every deep link. Neither
 * throws, and neither is visible in `pnpm build`.
 */
describe("Pages deployment wiring", () => {
  it("mounts the router under Vite's base, not the host root", () => {
    // `BASE_URL` is `/` here, so the basename must reduce to the empty string —
    // which is react-router's own default, and what keeps every existing route
    // test valid. The `/portfolio/` case cannot run in this file because
    // `BASE_URL` is fixed at module load; it is verified for real by the deploy
    // build, which emits `/portfolio/assets/…`.
    const source = readFileSync("src/app/routes.tsx", "utf8");

    expect(source).toContain("import.meta.env.BASE_URL");
    // Guard against the basename being hardcoded, which is the actual bug this
    // exists to prevent: `basename: "/portfolio"` would break local dev.
    expect(source).not.toMatch(/basename:\s*["']/);
  });

  it("emits 404.html from the build so deep links resolve", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    // Wired into `build` rather than left to the deploy workflow, so a local
    // `pnpm build` is byte-for-byte what gets published and the two cannot
    // drift.
    expect(pkg.scripts.build).toContain("scripts/emit-404.mjs");
  });

  it("reads the deployment base from the environment, not a hardcoded string", () => {
    const config = readFileSync("vite.config.ts", "utf8");

    expect(config).toContain("process.env.BASE_PATH");
    // `/portfolio/` belongs in the deploy workflow's BASE_PATH and nowhere else,
    // because a literal here is invisible to a custom-domain change. Matched as
    // an assignment rather than a bare substring, so the comment explaining that
    // exact value can still mention it.
    expect(config).not.toMatch(/base:\s*["']/);
  });

  it("keeps the routes table a plain route list for tests to mount", () => {
    // `routes` is exported separately from the router so tests can use
    // `createMemoryRouter`. Adding a basename here would break that.
    expect(Array.isArray(routes)).toBe(true);
    expect(routes[0].path).toBe("/");
  });
});
