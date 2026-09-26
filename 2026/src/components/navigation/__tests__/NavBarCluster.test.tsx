import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { NavBar } from "../NavBar";

/**
 * The NavBar's right cluster: the socials, the rule, and the CTA, in the order
 * the snippet's `SocialsAndHireButton` fragment puts them. The divider's own
 * values are asserted in `ClusterDivider.test.tsx`.
 */
describe("NavBar right cluster", () => {
  function renderNav() {
    return render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    );
  }

  it("orders socials, then the rule, then the Hire me CTA", () => {
    const row = renderNav().container.firstElementChild as HTMLElement;
    // `:scope` is relative to the context node, so this is queried from the nav
    // row — the cluster is one level below it. `SocialLinks` carries its own
    // `gap-cluster-gap`, so a bare `.gap-cluster-gap` would match the wrong
    // element: the `ul` of tiles rather than the row holding it.
    const cluster = row.querySelector(":scope > .gap-cluster-gap");
    expect(cluster).toBeTruthy();

    const kinds = [...(cluster?.children ?? [])].map((child) => {
      // `querySelector` searches descendants only, and the social cluster *is*
      // the `ul`, so match on the element itself.
      if (child.tagName === "UL") return "socials";
      if (child.getAttribute("aria-hidden") === "true") return "divider";
      return "cta";
    });

    expect(kinds).toEqual(["socials", "divider", "cta"]);
  });

  it("renders the CTA as a labelled link to the contact section", () => {
    renderNav();
    const cta = screen.getByRole("link", { name: /hire me/i });

    expect(cta).toHaveAttribute("href", "/#contact");
  });
});
