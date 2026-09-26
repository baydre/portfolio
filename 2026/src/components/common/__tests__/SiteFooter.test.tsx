import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { SiteFooter } from "../SiteFooter";
import { Hero } from "../../home/Hero";

/**
 * The footer's top edge.
 *
 * The design supplies the Contact frame (921px) and the Footer frame (728px) as
 * separate frames, with no divider between them. A `border-t` was drawing a rule
 * immediately below the contact form that no frame specifies. The 1px rule the
 * footer *does* have is the one inside it, below the role row — that one stays,
 * and is asserted here too so the two cannot be confused.
 */
describe("SiteFooter top edge", () => {
  const footerClasses = () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    return (container.querySelector("footer") as HTMLElement).className;
  };

  it("draws no rule above the footer", () => {
    expect(footerClasses()).not.toContain("border-t");
  });

  it("adds no top margin of its own, so every section boundary matches", () => {
    const classes = footerClasses();

    // Every other boundary on the page is Contact/Section `py-20` (80) against
    // `py-20` (80) = 160px. An `mt-20` here stacked a third 80px on top and made
    // this the only 240px gap on the page. Separation is the two `py-20`s.
    expect(classes).not.toContain("mt-20");
    expect(classes).not.toContain("mt-16");
    expect(classes).not.toContain("mt-10");
  });

  it("keeps the rule the design does specify, inside the footer", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const footer = container.querySelector("footer") as HTMLElement;

    // The authored 1px rule sits below the role row, inside the footer.
    expect(footer.querySelector(".bg-rule")).not.toBeNull();
  });

  it("draws the View Work arrow from the design's own SVG, not a text glyph", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const link = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.textContent ?? "").includes("View Work"),
    );
    const svg = link?.querySelector("svg");

    // The up-right "↗" that was here read as "leave this page", and a text "→"
    // is still not the design's glyph: the frame supplies a 15x15 two-path
    // arrow at stroke-width 1.5 that no icon package reproduces.
    expect(link?.textContent).not.toContain("\u2192");
    expect(link?.textContent).not.toContain("\u2197");
    expect(svg).not.toBeNull();
    expect(link?.textContent).toBe("View Work");

    // Authored geometry, verbatim.
    expect(svg?.getAttribute("viewBox")).toBe("0 0 15 15");
    expect(svg?.getAttribute("width")).toBe("15");
    expect(svg?.getAttribute("stroke-width")).toBe("1.5");
    expect(svg?.getAttribute("fill")).toBe("none");
    const d = Array.from(svg?.querySelectorAll("path") ?? []).map((el) =>
      el.getAttribute("d"),
    );
    expect(d).toEqual([
      "M7.83691 2.21191L13.125 7.49996L7.83691 12.788",
      "M13.1249 7.5L1.875 7.5",
    ]);
  });

  it("keeps the arrow decorative and coloured by the link", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const svg = container.querySelector('a[href="/#work"] svg') as SVGElement;

    // Decorative: the link's accessible name is the label alone.
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    // Inherits the link's #E9E9EC rather than the authored literal "white", so
    // the arrow and the label 8px away are the same colour.
    expect(svg.getAttribute("stroke")).toBe("currentColor");
  });

  it("draws no rule above the copyright and credit bar", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const footer = container.querySelector("footer") as HTMLElement;
    const credit = Array.from(footer.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("All rights reserved"),
    );

    // The design gives the copyright bar its own 66px frame and specifies no
    // divider, so the credit sits directly on the page background. Its wrapper
    // must carry no rule of its own.
    expect(credit).toBeDefined();
    expect((credit?.parentElement?.parentElement as HTMLElement).className).not.toContain(
      "border-t",
    );
  });
});

/**
 * The design's copyright bar, synced. The frame is 66px and pins a
 * `w-[1440px]` outer frame with a `w-[1272px]` row at `left-[84px] absolute`.
 * Copying that literally overflows every viewport under 1440px, so the bar is
 * responsive by construction instead: `container-site` is `width: 100%` capped at
 * 1440px with `margin-inline: auto`, and its `padding-inline: var(--gutter)`
 * resolves 24px -> 40px -> 84px, so the frame's 84 + 1272 + 84 falls out at the
 * design width and a correct gutter below it.
 */
describe("copyright bar is responsive, not fixed-width", () => {
  function bar() {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    return container;
  }

  it("uses the fluid container, carrying none of the frame's fixed widths", () => {
    const html = bar().innerHTML;

    // The three Figma artifacts that break below 1440px.
    expect(html).not.toContain("w-[1440px]");
    expect(html).not.toContain("w-[1272px]");
    expect(html).not.toContain("left-[84px]");
    expect(html).not.toContain("absolute");
  });

  it("stacks on a phone and only goes side-by-side from sm up", () => {
    const row = bar().querySelector(".container-site.flex") as HTMLElement;

    expect(row.className).toContain("flex-col");
    expect(row.className).toContain("sm:flex-row");
    expect(row.className).toContain("sm:justify-between");
  });
});

/**
 * The frame's copyright line is `text-xs` (12px) with `leading-4` (16px). It
 * shipped at 11px, which matched nothing in the frame.
 *
 * The leading is coupled to the size and could not be left alone:
 * `--leading-caption` is UNITLESS 1.45, and it only resolved to the design's 16px
 * because the size was 11px (11 x 1.45 = 15.95). At 12px it would give 17.4px. So
 * the size change necessarily brought a length-based leading with it.
 *
 * The credit line is ALREADY the frame's 10px and is deliberately untouched.
 */
describe("copyright bar typography", () => {
  it("sets the copyright line at the design's 12px", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const copyright = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("All rights reserved"),
    );

    expect(copyright?.className).toContain("text-micro");
    expect(copyright?.className).toContain("leading-copyright");
  });

  it("sets the credit to 12px, matching the copyright line", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const credit = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("Yasir Musa"),
    );

    // OWNER OVERRIDE 2026-09-26: the frame says `text-[10px]`, the owner asked
    // for 12px "for consistency", so this line now shares the copyright line's
    // size. Asserted as text-micro so the two cannot drift apart again.
    expect(credit?.className).toContain("text-micro");
    expect(credit?.className).not.toContain("text-tiny");
  });

  it("retires --text-tiny now that nothing is 10px", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");

    // 0.625rem existed only for the credit's original 10px.
    expect(theme).not.toContain("--text-tiny");
  });

  it("gives the credit the same 16px line box as the copyright line", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const credit = Array.from(container.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("Yasir Musa"),
    );

    // This was the deviation actually left on the "Yasir Musa" line:
    // `leading-caption` is unitless 1.45, so 10px text resolved to a 14.5px line
    // box where the frame's `leading-4` is 16px. Both bar lines now agree.
    expect(credit?.className).toContain("leading-copyright");
    expect(credit?.className).not.toContain("leading-caption");
  });

  it("declares both sizes and the 16px bar leading in the theme", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const value = (name: string) =>
      theme.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();

    // DESIGN text-xs = 12px and leading-4 = 16px. Both bar lines are 12px/16px.
    expect(value("--text-micro")).toBe("0.75rem");
    expect(value("--leading-copyright")).toBe("1rem");
  });
});

/**
 * OWNER CORRECTION 2026-09-26: the footer wordmark was changed to match the hero
 * wordmark in BOTH text and face, keeping only the footer's sizing. The snippet
 * shows a lowercase underscored "baydre_africa" in the body face, so both are
 * overrides of the design.
 *
 * The two are now the same string, read from one `profile.name` field. Asserted
 * against the hero directly rather than a copied class string, so "same as the
 * hero" is actually enforced and cannot drift.
 */
describe("footer wordmark matches the hero wordmark's face", () => {
  const fontOf = (root: HTMLElement, text: string) =>
    Array.from(root.querySelectorAll("p, h1")).find((el) => el.textContent === text)
      ?.className.match(/font-[\w-]+/)?.[0];

  it("gives the footer wordmark the same text and font as the hero's", () => {
    const { container: hero } = render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
    const { container: footer } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(fontOf(hero, "BaydreAfrica")).toBe("font-display");
    expect(fontOf(footer, "BaydreAfrica")).toBe("font-display");
    expect(fontOf(footer, "BaydreAfrica")).toBe(fontOf(hero, "BaydreAfrica"));
  });

  it("drops the design's lowercase underscored wordmark", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    // Scoped to element TEXT, not innerHTML: the X profile URL is
    // `x.com/baydre_africa` and legitimately contains the same characters.
    const words = Array.from(container.querySelectorAll("p, h1")).map(
      (el) => el.textContent,
    );
    expect(words).toContain("BaydreAfrica");
    expect(words).not.toContain("baydre_africa");
  });

  it("reads one profile field, so the two wordmarks cannot drift apart", () => {
    const profile = readFileSync("src/content/profile.ts", "utf8");

    // The duplicate field is gone. Matched on the key, not the bare string, for
    // the same reason as above — `x.com/baydre_africa` is meant to contain it.
    expect(profile).not.toMatch(/footerName/);
    expect(profile).not.toMatch(/name:\s*"baydre_africa"/);
  });

  it("keeps the footer wordmark at the footer's sizing, not the hero's 180px", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    const mark = Array.from(container.querySelectorAll("p")).find(
      (p) => p.textContent === "BaydreAfrica",
    );

    // Own sizing, NOT the hero's text-display / 180px.
    expect(mark?.className).toContain("text-footer-mark");
    expect(mark?.className).toContain("leading-footer-mark");
    expect(mark?.className).not.toContain("text-display");
  });

  it("caps the wordmark at 120px and keeps a 40px floor", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const clamp = theme
      .match(/--text-footer-mark:\s*clamp\(([^)]+)\)/)
      ?.[1]
      .split(",")
      .map((part) => part.trim());

    // Owner reduction from the snippet's 160px, 2026-09-26.
    // rem floor 2.5 = 40px, rem ceiling 7.5 = 120px.
    expect(clamp).toEqual(["2.5rem", "8.333vw", "7.5rem"]);

    // The slope is not arbitrary: it is 120/1440, so the fluid ramp still reaches
    // its ceiling exactly at the design width, which is the convention the
    // original 160px / 11.111vw pair used. Anything looser would cap early and
    // leave the wordmark under-sized between that point and 1440.
    expect(8.333).toBeCloseTo((120 / 1440) * 100, 1);

    // The floor is what keeps this responsive — the hero's 180px cannot fit a
    // 375px viewport, and 40px "BaydreAfrica" is ~264px against 327px of content.
    expect(8.333 * 3.75).toBeLessThan(40);
  });
});

/**
 * OWNER-CONFIRMED 2026-09-26. The X and LinkedIn URLs were both wrong before: X
 * pointed at `/baydreafrica` (no underscore) and LinkedIn at a *company* page
 * rather than the personal profile. GitHub was not supplied and stays flagged.
 *
 * Asserted against literal URLs, not against a copy of the data, so a wrong URL
 * in `profile.ts` fails here.
 */
describe("social links carry the owner-confirmed URLs", () => {
  const linkFor = (label: string) =>
    Array.from(document.querySelectorAll(`a`)).find(
      (a) => a.textContent === label,
    ) as HTMLAnchorElement;

  beforeEach(() => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
  });

  it("points X at the underscored handle", () => {
    expect(linkFor("X").getAttribute("href")).toBe("https://x.com/baydre_africa");
  });

  it("points LinkedIn at the personal profile, not the company page", () => {
    expect(linkFor("LinkedIn").getAttribute("href")).toBe(
      "https://linkedin.com/in/yasir-musa-baydre-africa",
    );
  });

  it("clears the unverified flag on the two confirmed links only", () => {
    expect(linkFor("X")).not.toHaveAttribute("data-unverified");
    expect(linkFor("LinkedIn")).not.toHaveAttribute("data-unverified");
    // GitHub was never supplied — still a guess, still flagged.
    expect(linkFor("GitHub")).toHaveAttribute("data-unverified");
  });
});

/**
 * OWNER INSTRUCTION 2026-09-26: no social icon row in the footer. The Connect
 * column is text links only.
 *
 * `SocialLinks` itself is NOT dead — `NavBar` and `SiteHeader` still render it, and
 * the footer links are still very much present as text. Both halves of that are
 * asserted, because "remove the icons" must not quietly become "remove the links".
 */
describe("footer has social text links but no icon row", () => {
  const socialNetworks = ["X", "LinkedIn", "GitHub"];

  it("keeps the social links as text in the Connect column", () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    for (const network of socialNetworks) {
      expect(screen.getByRole("link", { name: network })).toBeInTheDocument();
    }
  });

  it("renders no icon links, only the text ones", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );
    // Every social anchor in the footer is a text link; the icon variant renders
    // an <svg> per link, so a leftover row would double every href.
    for (const network of socialNetworks) {
      expect(hrefs.filter((h) => h?.includes(network === "X" ? "x.com" : network.toLowerCase()))).toHaveLength(1);
    }
  });

  it("drops the icon row but keeps the 'View Work' arrow", () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    // The removed row rendered one SVG per social link — 3 of them. The footer
    // legitimately keeps exactly one SVG: the "View Work" arrow.
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(
      container.querySelector("svg")?.closest("a")?.textContent,
    ).toContain("View Work");
  });

  it("leaves the shared SocialLinks component in use elsewhere", () => {
    const source = readFileSync("src/components/common/SocialLinks.tsx", "utf8");

    // Guards against deleting a shared component along with one of its instances.
    expect(source).toContain("export function SocialLinks");
    expect(readFileSync("src/components/navigation/NavBar.tsx", "utf8")).toContain("SocialLinks");
    expect(readFileSync("src/components/navigation/SiteHeader.tsx", "utf8")).toContain(
      "SocialLinks",
    );
  });
});

/**
 * The lower row's horizontal column positions.
 *
 * OWNER INSTRUCTION 2026-09-26: match the design's explicit tracks — Navigate at
 * ~650px and Connect at ~866px in a 1440 frame, with the location copy at 84px.
 *
 * `grid-cols-3` cannot express this. Equal tracks put Navigate at 521px and
 * Connect at 959px, because the one 40px gap is shared by all three boundaries;
 * narrowing that gap to close the Navigate→Connect distance would drag the
 * location copy away from Navigate at the same time. So the two leading tracks
 * are sized as fractions of the content box and Connect takes the 1fr remainder.
 */
describe("lower row matches the design's column positions", () => {
  const row = () => {
    const { container } = render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );
    return container.querySelector(".mt-16.grid") as HTMLElement;
  };

  it("uses explicit tracks, not three equal columns", () => {
    const className = row().className;

    expect(className).toContain("lg:grid-cols-[var(--footer-locate-col)_var(--footer-nav-col)_1fr]");
    expect(className).not.toContain("lg:grid-cols-3");
  });

  it("sizes the two leading tracks from primitives, not literals", () => {
    // The custom properties must be referenced, so the tracks stay resynable from
    // theme.css rather than hard-coding Figma pixels into a class.
    expect(row().className).not.toMatch(/grid-cols-\[\d/);
  });

  it("declares track fractions that resolve to the design's positions", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const pct = (name: string) =>
      Number(theme.match(new RegExp(`${name}:\\s*([\\d.]+)%`))?.[1]);

    const locate = pct("--footer-locate-col");
    const nav = pct("--footer-nav-col");

    // Content box at 1440 is 1272px (1440 - 2 x 84px gutter); 40px gaps.
    const content = 1272;
    const gap = 40;
    const locateOrigin = 84 + (content * locate) / 100 + gap;
    const connectOrigin = locateOrigin + (content * nav) / 100 + gap;

    // DESIGN: Navigate 650, Connect 866.
    expect(Math.round(locateOrigin)).toBe(650);
    expect(Math.round(connectOrigin)).toBe(866);

    // The separation the owner asked for, origin-to-origin: 216px, down from the
    // 437px that `grid-cols-3` produced. (That 216 is the 176px track plus the
    // 40px gap — NOT the gap itself, which is still 40px.)
    expect(Math.round(connectOrigin - locateOrigin)).toBe(216);
    // The 40px gap between the two columns is unchanged.
    expect(Math.round(connectOrigin - 650 - (content * nav) / 100)).toBe(40);
  });

  it("leaves a positive 1fr remainder so the row cannot overflow", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const pct = (name: string) =>
      Number(theme.match(new RegExp(`${name}:\\s*([\\d.]+)%`))?.[1]);
    const fixed = pct("--footer-locate-col") + pct("--footer-nav-col");

    // Two 40px gaps must still fit alongside the percentage tracks.
    expect(fixed).toBeLessThan(100);
    for (const content of [1272, 1200, 944, 820]) {
      expect(content * (1 - fixed / 100) - 80).toBeGreaterThan(0);
    }
  });
});
