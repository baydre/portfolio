import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { profile } from "../../../content/profile";
import { Hero } from "../Hero";

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  );
}

describe("Hero", () => {
  it("renders the wordmark as the only level-1 heading, verbatim from the design", () => {
    const { container } = renderHero();
    expect(profile.name).toBe("BaydreAfrica");
    expect(
      screen.getByRole("heading", { level: 1, name: "BaydreAfrica" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("renders the authored tagline and description", () => {
    renderHero();
    expect(
      screen.getByText("Built to work in the real world."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/designs and builds brands, websites, and software/),
    ).toBeInTheDocument();
  });

  it("uses a bundled image with intrinsic dimensions rather than an external placeholder", () => {
    const { container } = renderHero();
    // Queried directly rather than by role: the image carries an empty alt, so
    // it is correctly exposed as presentational and has no `img` role.
    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    const src = image?.getAttribute("src") ?? "";

    // Guards two regressions: shipping a third-party request, and reintroducing
    // the design's placehold.co URL.
    expect(src).not.toMatch(/^https?:/);
    expect(src).not.toMatch(/placehold\.co/);

    // Intrinsic width/height are required to avoid layout shift.
    expect(image).toHaveAttribute("width");
    expect(image).toHaveAttribute("height");
  });

  it("marks the placeholder hero image as decorative", () => {
    const { container } = renderHero();
    // The stand-in image carries no information, so it must not be announced.
    // Change this when the real hero image arrives and it does carry meaning.
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("does not promote the tagline to a heading", () => {
    const { container } = renderHero();
    // The tagline is a positioning statement, not a section heading. Making it
    // an <h2> would invent a document outline the design does not have.
    const headings = within(container).getAllByRole("heading");
    expect(headings).toHaveLength(1);
  });
});
