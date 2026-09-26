import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { twMerge } from "tailwind-merge";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "../NotFoundPage";

/**
 * The "Go home" button's appearance comes entirely from the shadcn `default`
 * variant, so nothing about it shows in this page's own class list. Passing
 * `text-cta` for the 14px label made tailwind-merge resolve it against *both*
 * the font-size and text-colour groups and, being last, delete the variant's
 * `text-primary-foreground` — leaving the label inheriting `--foreground`
 * (#e9e9ec) on a `--primary` (#e9e9ec) fill, invisible, with every check green.
 * The same bug was fixed in `HireMeButton` and `ContactForm`; this is the third
 * site. `NotFoundPage.test.tsx` pins the class list so it cannot recur.
 */
describe("NotFoundPage appearance", () => {
  function goHome() {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    return screen.getByRole("link", { name: "Go home" });
  }

  it("keeps the variant's dark-on-light colour pair", () => {
    const classes = goHome().className.split(/\s+/);

    // #131417 label on a #e9e9ec fill, 15.20:1.
    expect(classes).toContain("text-primary-foreground");
    expect(classes).toContain("bg-primary");
  });

  it("does not let a custom --text-* size token displace the colour", () => {
    const classes = goHome().className.split(/\s+/);

    expect(classes).not.toContain("text-cta");
    expect(classes).toContain("text-sm");
  });

  it("reproduces the same merge tailwind-merge would compute", () => {
    const merged = twMerge(
      "text-sm font-medium bg-primary text-primary-foreground",
      "mt-8 h-auto rounded-md px-6 py-3 leading-cta",
    );

    expect(merged).toContain("text-primary-foreground");
    expect(merged).toContain("text-sm");
  });
});
