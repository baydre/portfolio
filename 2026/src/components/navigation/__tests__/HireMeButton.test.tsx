import { render } from "@testing-library/react";
import { twMerge } from "tailwind-merge";
import { describe, expect, it } from "vitest";
import { HireMeButton } from "../HireMeButton";

/**
 * The "Let's Build" CTA's appearance is supplied by the shadcn `default`
 * variant, overridden only by its explicit `bg-lime-300 hover:bg-lime-hover`.
 * That is what made the regression below possible: the button rendered with
 * `bg-primary text-primary-foreground` on its face, but the colour utility was
 * being silently deleted during `cn()` merging, so the label inherited
 * `--foreground` (#e9e9ec) onto a `--primary` (#e9e9ec) fill and disappeared.
 * Every behavioural assertion still passed. These assert the class list itself.
 */
describe("HireMeButton appearance", () => {
  function renderButton() {
    const { container } = render(<HireMeButton />);
    return container.firstElementChild as HTMLAnchorElement;
  }

  it("fills the button with the design's lime and keeps a dark label", () => {
    const el = renderButton();
    const classes = el.className.split(/\s+/);

    // #131417 label on a #c7f464 fill — the updated snippet's authored pair.
    expect(classes).toContain("text-primary-foreground");
    expect(classes).toContain("bg-lime-300");
    expect(classes).not.toContain("bg-primary");
  });

  it("hovers to the darker lime the owner asked for (2026-10-08)", () => {
    const classes = renderButton().className.split(/\s+/);

    // Owner instruction 2026-10-08: "update the hover color with a darker shade
    // for the existing button color" — `hover:bg-lime-hover`, not the rest
    // colour and not a faded primary. Without the pin, the default variant's
    // hover:bg-primary/90 would shift the fill toward the page background.
    expect(classes).toContain("hover:bg-lime-hover");
    expect(classes).not.toContain("hover:bg-primary/90");
    expect(classes).not.toContain("hover:bg-lime-300");
  });

  it("does not let a custom --text-* size token displace the colour", () => {
    const classes = renderButton().className.split(/\s+/);

    // tailwind-merge resolves an unrecognised `text-*` class against both the
    // font-size and text-colour groups, so passing `text-cta` deleted
    // `text-primary-foreground`. It must not reappear: `--text-cta` is the same
    // 0.875rem as the variant's `text-sm` anyway, so it bought nothing.
    expect(classes).not.toContain("text-cta");
    expect(classes).toContain("text-sm");
  });

  it("reproduces the same merge tailwind-merge would compute", () => {
    // Guards the ordering contract rather than a string: whatever is passed to
    // `Button` must survive a merge with the variant's own classes, including
    // the fill override that replaces the variant's bg-primary.
    const merged = twMerge(
      "text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90",
      "h-auto leading-cta bg-lime-300 hover:bg-lime-hover",
    );

    expect(merged).toContain("bg-lime-300");
    expect(merged).toContain("hover:bg-lime-hover");
    expect(merged).toContain("text-primary-foreground");
    expect(merged).not.toContain("bg-primary");
    expect(merged).not.toContain("hover:bg-lime-300");
  });

  it("uses the authored line height without a fixed height", () => {
    const classes = renderButton().className.split(/\s+/);

    expect(classes).toContain("leading-cta");
    // The variant pins h-9 (36px) against a 36.3px content height.
    expect(classes).toContain("h-auto");
    expect(classes).not.toContain("h-9");
  });

  it("uses the 8px radius, which theme.css remaps to rounded-md", () => {
    const classes = renderButton().className.split(/\s+/);

    // The snippet says `rounded-lg`, but the radius scale is remapped in
    // theme.css so `rounded-md` is 8px and `rounded-lg` would be 12px.
    expect(classes).toContain("rounded-md");
    expect(classes).not.toContain("rounded-lg");
  });
});