import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { contactBlurb } from "../../../content/profile";
import { LocationCopy } from "../LocationCopy";

/**
 * Two bugs lived in this one paragraph, in opposite directions, and the second
 * fix has to not reintroduce the first.
 *
 * 1. "24–48 hours" split as "24–" / "48 hours". The break is legal: UAX #14
 *    classifies U+2013 EN DASH as BA (break after), so an NBSP cannot stop it.
 *    Only an unbreakable element does.
 * 2. Making the whole 52-character response-time SENTENCE unbreakable then
 *    over-corrected: at ~348px inside a ~397px column it could never join the
 *    preceding line, pinning the paragraph to three lines.
 *
 * So the atomic unit is now the 11-character duration and nothing wider, and the
 * sentence flows with the lead again.
 */
describe("LocationCopy", () => {
  const parts = {
    lead: "Based in Nigeria, working with founders and teams around the world. I reply to every serious enquiry within",
    duration: "24–48 hours.",
  };

  it("makes the duration, and only the duration, unbreakable", () => {
    const { container } = render(<LocationCopy {...parts} className="text-caption" />);
    const span = container.querySelector("span");

    expect(span?.className).toBe("whitespace-nowrap");
    // The atomic unit is the duration alone — NOT the whole sentence. This is
    // the assertion that fails if anyone widens the nowrap again.
    expect(span?.textContent).toBe("24–48 hours.");
    expect(span?.textContent).not.toContain("I reply");
  });

  it("flows the response sentence into the preceding line", () => {
    const { container } = render(<LocationCopy {...parts} />);
    const p = container.querySelector("p") as HTMLElement;
    const span = p.querySelector("span") as HTMLElement;

    // The sentence before the duration is a plain text node, so it can share a
    // line with the lead. A nowrap on the sentence would strand it on its own
    // line and cost the paragraph a third line.
    expect(p.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    expect(p.childNodes[0]?.textContent).toContain("I reply to every serious enquiry within");
    expect(p.childNodes[0]?.textContent).toContain("Based in Nigeria");
    expect(span.textContent).toBe(parts.duration);
  });

  it("renders exactly the original single string, one character of change", () => {
    const { container } = render(<LocationCopy {...parts} />);

    expect(container.querySelector("p")?.textContent).toBe(
      "Based in Nigeria, working with founders and teams around the world. I reply to every serious enquiry within 24–48 hours.",
    );
  });

  it("still keeps the dash inside the atomic unit", () => {
    const { container } = render(<LocationCopy {...contactBlurb} />);
    const span = container.querySelector("span")?.textContent ?? "";

    // The original bug was a break AFTER the en-dash, so asserting only that the
    // string appears would pass. The whole phrase must be one text node.
    expect(span).toBe("24–48 hours.");
  });
});
