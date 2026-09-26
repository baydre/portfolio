import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "../SiteHeader";

/**
 * The small-screen disclosure. The design has no mobile variant, so this is
 * `DERIVED` behaviour and the only thing worth asserting is the part that a
 * sighted mouse user would never notice.
 */
function renderHeader() {
  return render(
    <MemoryRouter>
      <SiteHeader />
    </MemoryRouter>,
  );
}

describe("SiteHeader disclosure", () => {
  it("exposes a labelled toggle wired to the panel it controls", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "primary-menu");
    expect(document.getElementById("primary-menu")).toHaveAttribute("hidden");
  });

  it("keeps the panel and its links out of the tab order while closed", () => {
    renderHeader();
    // `hidden` is what removes the links from the tab order. Without it the
    // closed menu would still be tabbable on a real device.
    const panel = document.getElementById("primary-menu");

    expect(panel).toHaveAttribute("hidden");
    expect(panel?.querySelectorAll("a").length).toBeGreaterThan(0);
    expect(panel?.querySelector("a")).not.toBeVisible();
  });

  it("opens and closes on click, updating aria-expanded", async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("primary-menu")).not.toHaveAttribute("hidden");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  /**
   * The regression this file exists for. Closing with Escape while focus is
   * inside the panel leaves focus on an element that `hidden` has just made
   * unfocusable, so the browser drops it to `<body>` and the next Tab restarts
   * from the top of the document. Focus must return to the toggle.
   */
  it("returns focus to the toggle when Escape closes the panel", async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });

    await user.click(toggle);
    const firstLink = document.querySelector<HTMLAnchorElement>(
      "#primary-menu a",
    );
    expect(firstLink).toBeTruthy();
    firstLink?.focus();
    expect(firstLink).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: /open menu/i })).toHaveFocus();
    expect(firstLink).not.toHaveFocus();
  });

  it("keeps focus inside the document when the panel is reopened", async () => {
    const user = userEvent.setup();
    renderHeader();
    const toggle = screen.getByRole("button", { name: /open menu/i });

    await user.click(toggle);
    await user.keyboard("{Escape}");
    await user.click(toggle);

    // Focus is still on the toggle, so the next Tab lands on the first link —
    // the panel is the element immediately after the button in DOM order, so no
    // focus trap is needed for an in-flow disclosure.
    await user.tab();
    expect(document.querySelector("#primary-menu a")).toHaveFocus();
  });
});
