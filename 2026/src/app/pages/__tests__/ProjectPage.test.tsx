import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { projects } from "../../../content/projects";
import { routes } from "../../routes";

/**
 * The two evidence-grounded blocks the 2026-10-13 Work content model added to
 * the Product Page: Engineering details and Evidence.
 *
 * The README-grounded projects carry the data, so those blocks render on their
 * pages; IdCardify is provisional and carries neither, so they must not appear
 * and must not be filled with placeholder prose. Both halves are data-driven
 * claims about the CONTENT LAYER, so they are asserted against `projects` —
 * never a copy of the data — and `findProject` is exercised through the real
 * route table.
 */

const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
};

describe("ProjectPage evidence-grounded blocks", () => {
  it("renders Engineering details and Evidence from the README-grounded data", () => {
    const project = projects.find((p) => p.id === "securepay-wallet");
    expect(project?.detail?.engineering?.length, "seed data").toBeGreaterThan(0);
    expect(project?.detail?.evidence?.length, "seed data").toBeGreaterThan(0);

    renderAt(`/projects/${project!.id}`);

    const page = screen.getByRole("article");
    const engineering = within(page).getByRole("heading", {
      name: "Engineering details",
    });
    const section = engineering.closest("section") as HTMLElement;

    // Every bullet in the content layer is on the page.
    for (const point of project!.detail!.engineering!) {
      expect(within(section).getByText(point)).toBeInTheDocument();
    }

    const evidence = within(page).getByRole("heading", { name: "Evidence" });
    const evidenceSection = evidence.closest("section") as HTMLElement;
    for (const item of project!.detail!.evidence!) {
      // Labels with an href render as outbound links to the artifact.
      if (item.href) {
        expect(
          within(evidenceSection).getByRole("link", { name: item.label }),
        ).toHaveAttribute("href", item.href);
      } else {
        expect(within(evidenceSection).getByText(item.label)).toBeInTheDocument();
      }
      if (item.note) {
        expect(within(evidenceSection).getByText(item.note)).toBeInTheDocument();
      }
    }
  });

  it("omits both blocks for a project with no detail, instead of padding them", () => {
    const project = projects.find((p) => p.id === "idcardify");
    expect(project, "seed data").toBeDefined();
    expect(project!.detail, "IdCardify is provisional").toBeUndefined();

    renderAt(`/projects/${project!.id}`);

    const page = screen.getByRole("article");
    expect(
      within(page).queryByRole("heading", { name: "Engineering details" }),
    ).toBeNull();
    expect(
      within(page).queryByRole("heading", { name: "Evidence" }),
    ).toBeNull();
  });

  it("renders every README-grounded project's details from its own data", () => {
    // All five written works gained detail on 2026-10-13; a future edit that
    // drops one below the content model's floor would surface here.
    const withDetail = projects.filter((p) => p.detail);
    expect(withDetail.length).toBeGreaterThanOrEqual(5);

    for (const project of withDetail) {
      const { unmount } = renderAt(`/projects/${project.id}`);
      expect(project.detail!.engineering?.length ?? 0).toBeGreaterThan(0);
      expect(project.detail!.evidence?.length ?? 0).toBeGreaterThan(0);
      expect(
        screen.getByRole("heading", { name: project.title, level: 1 }),
      ).toBeInTheDocument();
      unmount();
    }
  });
});