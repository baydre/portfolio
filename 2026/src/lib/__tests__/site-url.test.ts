import { describe, expect, it } from "vitest";
import { siteUrl } from "../site-url";

/**
 * `siteUrl` prefixes root-relative paths with Vite's `base`, which is what makes
 * in-page anchors survive a subpath deploy.
 *
 * These run with `BASE_URL` at its default of `/`, so `BASE` reduces to the empty
 * string and `siteUrl("/#work")` is `/#work` — which is why the existing
 * navigation href assertions still hold unchanged. That is the behaviour being
 * pinned here: **a root deployment must be byte-for-byte unaffected** by this
 * helper existing at all. If someone "simplifies" it to always return the input,
 * or to always prefix a slash, these fail.
 *
 * The subpath case cannot be exercised in this file, because `BASE_URL` is fixed
 * at module load. It is verified for real by the deploy build: `BASE_PATH=/portfolio/`
 * emits `/portfolio/assets/…` in `dist/index.html`. See the `BASE_PATH` note in
 * `vite.config.ts`.
 */
describe("siteUrl", () => {
  it("leaves a root deployment's paths exactly as authored", () => {
    // `vite dev`, `vite preview` and the test run all have base `/`.
    expect(siteUrl("/#work")).toBe("/#work");
    expect(siteUrl("/#contact")).toBe("/#contact");
    expect(siteUrl("/about")).toBe("/about");
  });

  it("defaults to the site root", () => {
    expect(siteUrl()).toBe("/");
  });

  it("accepts a path written without its leading slash", () => {
    expect(siteUrl("about")).toBe(siteUrl("/about"));
  });

  it("never doubles the separator", () => {
    // `BASE_URL` ends in a slash, so naively concatenating would give `//`.
    // The one case that actually reaches this in the app is an empty path.
    expect(siteUrl("/")).not.toContain("//");
  });

  it("returns an absolute URL untouched", () => {
    // A base must never corrupt a link that already points somewhere specific.
    // `mailto:` and `tel:` are the cases that matter here: the About contact
    // card links to both, and neither carries a `//`, so a guard that only
    // recognised `scheme://` would prefix them and break them.
    const cases = [
      "https://example.com/x",
      "http://example.com/x",
      "//example.com/x",
      "mailto:someone@example.com",
      "tel:+2348000000000",
    ];
    for (const url of cases) {
      expect(siteUrl(url), url).toBe(url);
    }
  });
});
