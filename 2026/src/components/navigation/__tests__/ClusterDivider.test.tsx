import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClusterDivider } from "../ClusterDivider";

/**
 * The NavBar's right cluster, checked against Figma's CSS export for the
 * divider:
 *
 * ```json
 * {"width":"0","align-self":"stretch","stroke-width":"1px",
 *  "stroke":"rgba(102, 102, 102, 0.40)","filter":"blur(1.100000023841858px)"}
 * ```
 *
 * The element is a **flat 1px stroke**. Two earlier revisions of this file
 * instead reproduced the `<linearGradient>` from the snippet's `<defs>`, at 6px
 * wide — six times the authored width, and painted through a near-black centre
 * stop that made the rule appear as two thin segments. These assertions exist to
 * make that unrepeatable.
 */
describe("ClusterDivider", () => {
  function renderDivider() {
    const { container } = render(<ClusterDivider />);
    return container.firstElementChild as HTMLElement;
  }

  it("is hidden from assistive technology", () => {
    expect(renderDivider()).toHaveAttribute("aria-hidden", "true");
  });

  it("is 1px wide, because the whole visual width is the stroke", () => {
    // The CSS export's `width: 0` is the degenerate bounding box of a vertical
    // line, not the rendered width. A 6px gradient reconstruction was wrong.
    expect(renderDivider().className).toContain("w-px");
    expect(renderDivider().className).not.toMatch(/\bw-1\.5\b/);
    expect(renderDivider().className).not.toMatch(/\bw-\d+\b/);
  });

  it("paints the flat stroke the CSS export specifies", () => {
    const el = renderDivider();

    // jsdom normalises `rgb(r g b / a)` to `rgba(r, g, b, a)`.
    expect(el.style.backgroundColor).toBe("rgba(102, 102, 102, 0.4)");
  });

  it("carries no gradient, mask, or image paint", () => {
    const el = renderDivider();

    // The snippet's <linearGradient> is not what Figma renders.
    expect(el.style.backgroundImage).toBe("");
    expect(el.style.maskImage).toBe("");
    expect(el.style.webkitMaskImage).toBe("");
  });

  it("keeps no trace of the snippet's near-black centre stop", () => {
    // #1A1A11 is near-black on the #131417 header; painting the middle of the
    // rule with it made the rule read as two disconnected segments.
    expect(renderDivider().outerHTML).not.toContain("26, 26, 17");
  });

  it("blurs by the exported stdDeviation", () => {
    expect(renderDivider().style.filter).toBe("blur(1.1px)");
  });

  it("stretches to the cluster height rather than a fixed box", () => {
    const el = renderDivider();

    // `align-self: stretch` from the CSS export, not the snippet's `h-full`:
    // the row is `items-center`, so its height is content-derived and a
    // percentage height would be indefinite.
    expect(el.className).toContain("self-stretch");
    expect(el.className).not.toMatch(/\bh-\[/);
  });
});
