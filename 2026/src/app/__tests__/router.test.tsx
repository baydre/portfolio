import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { projects } from "../../content/projects";
import { routes } from "../routes";

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

/**
 * The header and the footer both render the primary nav, so link queries are
 * scoped to a landmark. An unscoped `getByRole("link", { name: "Work" })`
 * would silently depend on there being only one of them.
 */
function header() {
  return within(screen.getByRole("banner"));
}

function footer() {
  return within(screen.getByRole("contentinfo"));
}

describe("application router", () => {
  it("renders the homepage hero at the index route", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { level: 1, name: "BaydreAfrica" }),
    ).toBeInTheDocument();
  });

  it("renders the About page at /about", () => {
    renderAt("/about");
    expect(
      screen.getByRole("heading", { level: 1, name: /about me/i }),
    ).toBeInTheDocument();
  });

  it("renders a project detail page for a known project id", () => {
    const project = projects[0];
    renderAt(`/projects/${project.id}`);
    expect(
      screen.getByRole("heading", { level: 1, name: project.title }),
    ).toBeInTheDocument();
  });

  /**
   * The previous ProjectPage ignored useParams, so every id rendered the same
   * hardcoded content. This asserts the lookup actually discriminates.
   */
  it("renders the 404 page for an unknown project id", () => {
    renderAt("/projects/no-such-project");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
  });
});

/**
 * IA regression guard.
 *
 * The Figma file's footer Navigate column lists Home, Work, Services and
 * Contact, and contains no work, services or contact screen — so those are
 * homepage SECTIONS. `/work` and `/contact` existed only because Figma Make
 * emits nav items as buttons. They are removed, and these tests fail if anything
 * reintroduces them as routes.
 */
describe("section-not-page information architecture", () => {
  it("does not serve a route at /work", () => {
    renderAt("/work");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
  });

  it("does not serve a route at /contact", () => {
    renderAt("/contact");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
  });

  it("exposes work, services and contact as same-page sections on the homepage", () => {
    renderAt("/");
    for (const id of ["work", "services", "contact"]) {
      expect(document.querySelector(`section#${id}`), `missing #${id}`).not.toBeNull();
    }
  });
});

describe("catch-all route", () => {
  it("renders the 404 page for an unknown path", () => {
    renderAt("/this-route-does-not-exist");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
    expect(
      screen.getByRole("heading", { level: 2, name: /page not found/i }),
    ).toBeInTheDocument();
  });
});

describe("site header", () => {
  it("links Work and Contact to homepage sections, and About to its page", () => {
    renderAt("/");
    const nav = within(header().getByRole("navigation", { name: "Primary" }));

    // Anchors, not routes.
    expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/#work");
    expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/#contact");
    expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("renders the Hire me call to action pointing at the contact section", () => {
    renderAt("/");
    expect(header().getByRole("link", { name: "Hire me" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("marks the current page in the navigation", () => {
    renderAt("/about");
    expect(header().getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("gives every social tile an accessible name", () => {
    renderAt("/");
    // The Figma snippet renders these as unlabelled <div>s, which is a WCAG
    // 4.1.2 failure. Each must be exposed as a named link.
    for (const name of ["LinkedIn", "GitHub", "X"]) {
      expect(header().getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("opens and closes the mobile menu, reflecting state on the toggle", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const banner = header();

    const toggle = banner.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(banner.getByRole("button", { name: /close menu/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(banner.getByRole("button", { name: /close menu/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("site footer", () => {
  it("lists the four design sections in the Navigate column", () => {
    renderAt("/");
    const nav = within(footer().getByRole("navigation", { name: "Footer" }));
    for (const [name, href] of [
      ["Home", "/#main"],
      ["Work", "/#work"],
      ["Services", "/#services"],
      ["Contact", "/#contact"],
    ] as const) {
      expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("links View Work to the work section", () => {
    renderAt("/");
    expect(footer().getByRole("link", { name: /view work/i })).toHaveAttribute(
      "href",
      "/#work",
    );
  });

  it("names the social networks in the Connect column", () => {
    renderAt("/");
    for (const name of ["GitHub", "LinkedIn", "X"]) {
      expect(footer().getAllByRole("link", { name }).length).toBeGreaterThan(0);
    }
  });
});

describe("page structure", () => {
  it("exposes exactly one level-1 heading per page", () => {
    for (const path of ["/", "/about", "/resume", `/projects/${projects[0].id}`]) {
      const { container, unmount } = renderAt(path);
      expect(
        container.querySelectorAll("h1"),
        `expected one h1 on ${path}`,
      ).toHaveLength(1);
      unmount();
    }
  });

  /**
   * The design supplies NO headings at all — every heading, including the 96px
   * contact line, is a <p>. This asserts the structure that replaced it: exactly
   * one h1, and no level skipped on the way down.
   */
  it("exposes a valid heading hierarchy with no skipped levels", () => {
    const { container } = renderAt("/");
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );

    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);

    for (let i = 1; i < levels.length; i += 1) {
      expect(
        levels[i] - levels[i - 1],
        `heading level jumped from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("provides a skip link ahead of the main landmark", () => {
    renderAt("/");
    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip).toHaveAttribute("href", "#main");
    expect(document.querySelector("main#main")).not.toBeNull();
  });
});
