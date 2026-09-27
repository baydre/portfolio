import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AboutPage } from "../../../app/pages/AboutPage";
import {
  aboutBio,
  aboutContact,
  aboutHeadings,
  aboutPortrait,
  aboutSkillRoles,
  aboutSocialLinks,
  aboutTools,
} from "../../../content/about";
import { hasTechIcon } from "../../common/TechIcon";
import {
  siC,
  siDjango,
  siFastapi,
  siGit,
  siKicad,
  siLinux,
  siPython,
  siReact,
} from "simple-icons";
import { socialLinks } from "../../../content/profile";

/**
 * The About page, against the AboutPage frame.
 *
 * Two things are being protected here, and they are different in kind.
 *
 * The first is FIDELITY — the geometry and typography decisions that are easy to
 * "tidy" later and expensive to notice once they have drifted:
 *
 * - the portrait is 421px, not the `w-96` (384px) the Tailwind export claims;
 * - the biography is 18px on a 32px line and carries no `capitalize`;
 * - the four biography sentences are four elements, not one run joined by `<br/>`;
 * - the biography's paragraphs have no gap between them, because the frame's
 *   `<br/>` means the 32px line box was the only separation it had.
 *
 * The second is the removal of the old page's placeholders. The previous
 * `AboutPage` was not derived from any frame, and the things most likely to
 * creep back in are the parts that were visibly fake: a masked phone number, a
 * `placeholder@example.com` address, five identical tool tiles, and social links
 * pointing at `"#"`. Each of those is asserted absent.
 */
describe("About page — portrait", () => {
  const portrait = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    return container.querySelector("img") as HTMLImageElement;
  };

  it("renders the supplied 421 × 475 card, not the old AboutMe screenshot", () => {
    const img = portrait();

    expect(img.getAttribute("width")).toBe("421");
    expect(img.getAttribute("height")).toBe("475");
    expect(aboutPortrait.width).toBe(421);
    expect(aboutPortrait.height).toBe(475);
  });

  it("sets width and height as attributes so the copy column cannot reflow", () => {
    // Without both attributes the browser reserves 0 × 0 until the file loads,
    // and the whole right column — the biography, the tools, the roles — jumps.
    const img = portrait();

    expect(img.hasAttribute("width")).toBe(true);
    expect(img.hasAttribute("height")).toBe(true);
  });

  it("sizes the column from the token, not from the frame's lossy w-96", () => {
    // The export says `w-96` = 384px. The frame's own SVG is 421px wide. Figma
    // rounds layer bounds to its 4px grid and 421 is not on it, so 384 is the
    // lossy read. Reading this as a literal 24rem here would put it back.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const markup = container.innerHTML;

    expect(markup).toContain("w-portrait-w");
    expect(markup).not.toContain("w-96");
  });

  it("does not re-round the card, which carries its own 4px radius", () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const img = container.querySelector("img") as HTMLElement;

    expect(img.className).not.toContain("rounded");
  });
});

describe("About page — biography", () => {
  it("renders all four sentences as separate paragraphs", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(aboutBio).toHaveLength(4);

    for (const paragraph of aboutBio) {
      expect(screen.getByText(paragraph).tagName).toBe("P");
    }
  });

  it("stores the frame's copy verbatim, including its title case", () => {
    // The frame applies CSS `capitalize`, but its text is already title-cased, so
    // the class is a no-op that would additionally rewrite any lowercase term
    // after an apostrophe or hyphen. The string must stay exactly as authored.
    expect(aboutBio[0]).toMatch(/^Hi, I'm Yasir — A Software Developer/);
    expect(aboutBio[1]).toContain("Node.Js");
  });

  it("does not apply CSS capitalize", () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const bio = container.querySelector("h1 + div") as HTMLElement;

    expect(bio.className).not.toContain("capitalize");
  });

  it("sets 14px copy on the frame's 32px line, with the biography's own tracking", () => {
    // Owner instruction 2026-09-26, twice: 18 (the frame's `text-lg`) → 16 → 14.
    // The biography now shares `--text-caption` with the rest of the page's 14px
    // step rather than a dedicated token, which is deleted. Asserting the *shared*
    // token is deliberate — it fails if someone reinstates an About-specific size,
    // which is the mistake the token's own comment records.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const bio = container.querySelector("h1 + div") as HTMLElement;

    expect(bio.className).toContain("text-caption");
    expect(bio.className).not.toContain("text-about-bio");
    expect(bio.className).not.toContain("text-body");
    // The 32px line box and the 0.1em tracking are the frame's, and unchanged.
    expect(bio.className).toContain("leading-lead");
    expect(bio.className).toContain("tracking-about-bio");
  });

  it("puts no gap between paragraphs, because the frame's <br/> had none", () => {
    // The four sentences were separated by nothing but the 32px line box. A gap
    // here would be a silent fidelity change dressed up as readability.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const bio = container.querySelector("h1 + div") as HTMLElement;

    expect(bio.className).not.toMatch(/gap-|space-y-/);
  });

  it("underlines the heading with the project's rule token", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const heading = screen.getByRole("heading", { name: "About me" });

    expect(heading.className).toContain("border-rule");
    expect(heading.className).not.toContain("gray-200");
  });
});

describe("About page — heading structure", () => {
  it("promotes the frame's largest heading to the page's only h1", () => {
    // The frame has no page title — its three blocks are peers and "About me" is
    // simply the largest at 30px. Every other route in this app has a visible
    // h1 (the hero wordmark, "Yasir", the project title), and
    // `router.test.tsx` requires one h1 per route.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "About me" })).toBeDefined();
  });

  it("skips no heading level", () => {
    // The router asserts this for `/` only. The About frame is where it is
    // easiest to get wrong: the frame's three blocks are peers, so promoting one
    // to h1 has to pull the other two down to h2 and the role names to h3 — and
    // a 16px h2 above a 20px h3 is visually inverted even though it is correct.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName[1]),
    );

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(
        levels[i] - levels[i - 1],
        `heading level jumped from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it("does not label a section with the page's own h1", () => {
    // `aria-labelledby` pointing an `<section>` at the `<h1>` would describe the
    // whole page as a region named after itself.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const h1Id = container.querySelector("h1")?.id;

    expect(h1Id).toBe("about-heading");
    expect(
      container.querySelector(`section[aria-labelledby="${h1Id}"]`),
    ).toBeNull();
  });
});

describe("About page — sticky portrait card", () => {
  /**
   * Sticky is `lg`-up only, so the classes are asserted rather than a computed
   * style: jsdom applies no Tailwind, so `getComputedStyle` would report
   * `position: static` for the real thing too and the test would be vacuous.
   */
  /**
   * The sticky column.
   *
   * TWO levels up from the `<img>`, not one: the contact card introduced a
   * `@container relative` wrapper between the image and the column, so
   * `img.parentElement` is now that wrapper and the `lg:sticky` classes live one
   * level above it. Stated explicitly because getting this wrong does not throw —
   * it just asserts against the wrong element's classes and quietly stops testing
   * anything.
   */
  const leftColumn = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const portraitWrap = container.querySelector("img")
      ?.parentElement as HTMLElement;

    return portraitWrap.parentElement as HTMLElement;
  };

  it("sticks the portrait card at lg and up, clearing the sticky header", () => {
    // Owner request 2026-09-26, restoring the previous placeholder page's
    // sidebar behaviour. `top-24` is 96px against a `sticky top-0` header, so the
    // card comes to rest below the header rather than under it.
    const cls = leftColumn().getAttribute("class") ?? "";
    expect(cls).toContain("lg:sticky");
    expect(cls).toContain("lg:top-24");
  });

  it("sticks the portrait and the social row as one unit", () => {
    // The old card stuck both together. Sticking the image alone would leave the
    // social tiles stranded halfway up the viewport. Asserted as the column's two
    // direct children — the portrait wrapper and the row — so a third sibling
    // cannot slip in un-stuck.
    const kids = [...leftColumn().children];

    expect(kids).toHaveLength(2);
    expect(kids[0].querySelector("img")).not.toBeNull();
    expect(kids[1].tagName).toBe("UL");
  });

  it("has no ancestor that would stop the stick from working", () => {
    // `overflow: hidden` on any ancestor creates a scroll container, and a sticky
    // element inside a container that never scrolls does not stick. This is the
    // failure mode that makes sticky silently dead, and it is invisible in jsdom —
    // so the check is on the authored source, not the rendered tree.
    const css = readFileSync("src/styles/theme.css", "utf8");
    const containerSite = css.slice(
      css.indexOf("@utility container-site"),
      css.indexOf("}", css.indexOf("@utility container-site")),
    );
    expect(containerSite).not.toContain("overflow");
    expect(css).not.toContain("overflow-hidden");
  });

  it("keeps the left column shorter than the right, or there is nothing to stick", () => {
    // Sticky is constrained by the containing block. The parent is `items-start`,
    // so the left column takes its own height and the taller right column is what
    // it travels through. `items-stretch` here would silently kill the feature.
    const root = leftColumn().parentElement as HTMLElement;
    expect(root.getAttribute("class")).toContain("items-start");
    expect(root.getAttribute("class")).toContain("lg:flex-row");
  });
});

describe("About page — tools", () => {
  /**
   * The tools block only. A bare `ul li` query on this page returns the SOCIAL
   * row's tiles, which are also a `ul` of `li` — the two lists are structurally
   * identical and only the section wrapper tells them apart.
   */
  const toolsBlock = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    return container.querySelector(
      'section[aria-labelledby="about-tools-heading"]',
    ) as HTMLElement;
  };

  it("renders the owner's seven tools, not the frame's five React.js tiles", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(aboutTools).toEqual([
      "Python",
      "FastAPI",
      "Django",
      "React",
      "Git & GitHub",
      "Linux",
      "KiCad",
    ]);

    for (const tool of aboutTools) {
      expect(screen.getByText(tool)).toBeDefined();
    }
  });

  it("keeps FastAPI beside Python and KiCad last, because the order is the owner's", () => {
    // FastAPI after Python reads as a pair — same language, different layer — and
    // KiCad is last. Asserted because a future sort-by-alphabet or sort-by-glyph
    // pass would reorder the row without any other test failing.
    expect(aboutTools.indexOf("FastAPI")).toBe(aboutTools.indexOf("Python") + 1);
    expect(aboutTools[aboutTools.length - 1]).toBe("KiCad");
  });

  it("puts all seven tiles on ONE line above 536px, and never wraps above it", () => {
    // The class IS the arithmetic here: a basis of a fraction of the row does not
    // say how many tiles fit, so the per-line count has to be asserted against
    // the data rather than read off the markup.
    const item = toolsBlock().querySelector("li") as HTMLElement;
    const row = toolsBlock().querySelector("ul") as HTMLElement;

    // `flex-nowrap` is what makes it a single line; without it the seven tiles
    // wrap at any width. Asserted because it is the one class doing the work.
    expect(row.getAttribute("class")).toContain("@[536px]:flex-nowrap");
    // Still wraps below the threshold, where one line is not possible.
    expect(row.getAttribute("class")).toContain("flex-wrap");

    // 7 tiles + 6 gaps of `gap-6` (1.5rem) = 9rem; the basis subtracts exactly
    // those six gaps and divides by the tile count.
    const wide = "@[536px]:basis-[calc((100%-9rem)/7)]";
    expect(item.getAttribute("class")).toContain(wide);
    const perRow = Number(wide.match(/\/(\d+)\)/)?.[1]);
    expect(perRow).toBe(aboutTools.length);
    expect(aboutTools.length % perRow).toBe(0);

    // 7 x 56px tile + 6 x 24px gap is the width the single-line tier needs.
    expect(aboutTools.length * 56 + (aboutTools.length - 1) * 24).toBe(536);
  });

  it("drops the frame's 620px block width, which cannot hold seven tiles", () => {
    // `--size-about-tools` was the frame's own width, authored for five tiles.
    // Seven inside 620px is 68px each, 44px after the tile's `p-3` — narrower
    // than "Git & GitHub" on its own, so every label wrapped to three lines.
    // Asserted as a token removal so the dead value cannot come back.
    const block = toolsBlock();
    expect(block.getAttribute("class")).not.toContain("max-w-about-tools");

    const theme = readFileSync("src/styles/theme.css", "utf8");
    expect(theme).not.toContain("--size-about-tools");
  });

  it("gives every tool a mark", () => {
    // The About row rendered SEVEN EMPTY BOXES: the registry only knew the key
    // "React.js" while this row labels the same technology "React", so even the
    // one real mark missed its tile. `aliases` is the fix and this is the guard.
    for (const tool of aboutTools) {
      expect(hasTechIcon(tool)).toBe(true);
    }

    // One `svg` per tile — the box is filled, not just reserved.
    expect(toolsBlock().querySelectorAll(".bg-tech-tile svg")).toHaveLength(
      aboutTools.length,
    );
  });

  it("uses simple-icons' real brand paths, not hand-drawn approximations", () => {
    // All seven tools carry a genuine brand mark from the CC0 library. An
    // earlier pass used generic lucide metaphors (Braces for Python, Terminal for
    // Linux) which are not those brands' logos at all; this asserts the paths are
    // the library's, so a hand-rolled path cannot creep back in unnoticed.
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const pathFor = (tool: string) => {
      const li = [...toolsBlock().querySelectorAll("li")].find(
        (el) => el.textContent === tool,
      );
      return li?.querySelector("path")?.getAttribute("d") ?? "";
    };

    for (const [tool, icon] of [
      ["Python", siPython],
      ["Django", siDjango],
      ["FastAPI", siFastapi],
      ["React", siReact],
      ["Git & GitHub", siGit],
      ["Linux", siLinux],
      ["KiCad", siKicad],
    ] as const) {
      expect(pathFor(tool)).toBe(icon.path);
      expect(icon.path.length).toBeGreaterThan(200);
    }
  });

  it("corrects the three brand hexes that are invisible on the tile", () => {
    // simple-icons' own colours are unusable on `--tech-tile` (#313131): Django
    // at 1.13:1 and Python at 2.69:1 against a 3:1 requirement for a graphic.
    // The shipped fills raise lightness and keep hue, and each is gated in
    // verify-contrast.mjs against the vendor's original.
    const fillFor = (tool: string) => {
      const li = [...toolsBlock().querySelectorAll("li")].find(
        (el) => el.textContent === tool,
      );
      return li?.querySelector("svg")?.getAttribute("fill") ?? "";
    };

    expect(fillFor("Django")).toBe("#1e9769");
    expect(fillFor("Django")).not.toBe(`#${siDjango.hex}`);
    expect(fillFor("Python")).toBe("#458ac3");
    expect(fillFor("Python")).not.toBe(`#${siPython.hex}`);

    // The three that already passed are shipped unchanged.
    expect(fillFor("React")).toBe(`#${siReact.hex}`.toLowerCase());
    expect(fillFor("FastAPI")).toBe(`#${siFastapi.hex}`.toLowerCase());
    expect(fillFor("Linux")).toBe(`#${siLinux.hex}`.toLowerCase());
  });

  it("takes KiCad's path from simple-icons, with the fill corrected", () => {
    // `AI` was the last tool with no brand mark; KiCad replaced it and the lucide
    // tier went with it. The path is the library's — it was first inlined from an
    // owner-supplied `kicad.svg`, and the two were byte-identical, so the library
    // is used and the vendored file deleted rather than left unreferenced.
    const li = [...toolsBlock().querySelectorAll("li")].find(
      (el) => el.textContent === "KiCad",
    );
    expect(li?.querySelector("path")?.getAttribute("d")).toBe(siKicad.path);

    // The library's own hex is illegible on the tile, so the fill is corrected
    // while the path is not. Asserting both halves is the point: a fill "fixed"
    // by swapping the mark would be a silent redesign.
    expect(siKicad.hex).toBe("314CB0");
    expect(li?.querySelector("svg")?.getAttribute("fill")).toBe("#6a81d5");

    // The deleted asset is still recorded, so it can be re-fetched if needed.
    const docs = readFileSync("docs/DESIGN_SYSTEM.md", "utf8");
    expect(docs).toContain("thesvg");
  });

  it("no longer has a lucide tier, because every tool has a brand mark", () => {
    // Scoped to the import, not the file: the docstring explains WHY the lucide
    // tier is gone, so a file-wide search fails on its own explanation.
    const source = readFileSync("src/components/common/TechIcon.tsx", "utf8");
    expect(source).not.toMatch(/from "lucide-react"/);
    // Every tile is a filled brand mark; none is a stroked lucide glyph.
    for (const li of toolsBlock().querySelectorAll("li")) {
      const mark = li.querySelector("svg") as SVGSVGElement;
      expect(mark.getAttribute("fill")).not.toBe("none");
      expect(mark.getAttribute("stroke")).toBeNull();
    }
  });

  it("shows no duplicated tool", () => {
    // The frame's row was five identical "React.js" tiles — the same placeholder
    // defect as the Work cards' "Built with" panel. One `React` entry, once.
    //
    // Counted from the data, not hardcoded: the count changed 5 -> 7 when the
    // owner added two tools, and a literal here would have failed on a
    // correct-output change.
    const labels = [...toolsBlock().querySelectorAll("li p")].map(
      (p) => p.textContent,
    );
    const tools = labels.filter((label) => aboutTools.includes(label ?? ""));

    expect(tools).toHaveLength(aboutTools.length);
    expect(new Set(tools).size).toBe(aboutTools.length);
  });

  it("reserves the icon box for every tile, so a missing mark cannot collapse it", () => {
    // `TechIcon` returns null for a tool it cannot mark, and every tool on this
    // row can be marked now — but the box stays reserved regardless, because a
    // future unmapped tool must not come out half the height of its neighbours
    // with its label sitting 44px higher. That regression was invisible while
    // every Work stack entry was "React.js".
    const boxes = toolsBlock().querySelectorAll(".bg-tech-tile > span");

    expect(boxes).toHaveLength(aboutTools.length);
    for (const box of boxes) {
      expect(box.getAttribute("class") ?? "").toContain("h-8");
      expect(box.getAttribute("class") ?? "").toContain("w-8");
    }
  });
});

describe("About page — technical skills", () => {
  it("renders the owner's four role labels, in the frame's 01–04 order", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(aboutSkillRoles.map((role) => role.title)).toEqual([
      "Backend Engineering",
      "Full-Stack Development",
      "DevOps & Cloud",
      "IoT & Embedded Systems",
    ]);

    for (const role of aboutSkillRoles) {
      expect(screen.getByText(role.title)).toBeDefined();
      expect(screen.getByText(role.index)).toBeDefined();
    }
  });

  it("joins each role's technologies into one line rather than a list", () => {
    // The frame's card holds a single run of copy under the title; bullets would
    // add structure the design does not have.
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    for (const role of aboutSkillRoles) {
      expect(screen.getByText(role.stack.join(", ")).tagName).toBe("P");
    }
  });

  it("writes the backend stack as plain 'Django', with no DRF anywhere", () => {
    // This entry has been written three ways, and the current one is an owner
    // reversal rather than an accumulation — so the assertion is on the absence
    // of DRF in ANY form, not just the absence of a standalone "DRF" entry:
    //
    //   1. "Python, Django, DRF, FastAPI"  — separate entries, which read as
    //      four technologies where there are three.
    //   2. "Python, Django(DRF), FastAPI"  — owner instruction 2026-09-26,
    //      merging DRF into Django as the toolkit it is part of.
    //   3. "Python, Django, FastAPI"       — owner request 2026-09-27: drop
    //      the "(DRF)" qualifier entirely.
    //
    // Checked as DATA, not rendered text, because once joined the visible
    // strings of (1) and (2) are identical, so only the content file can
    // distinguish them. The regex is the part that matters: a bare `not
    // .toContain("DRF")` would still pass on "Django(DRF)", which is exactly
    // the form this reversal removed.
    //
    // The expected list also carries the owner's 2026-09-27 additions — C first,
    // Unit testing last — so the assertion pins the whole stack, and a future
    // reordering or a dropped entry fails here rather than passing silently.
    const backend = aboutSkillRoles[0];

    expect(backend.title).toBe("Backend Engineering");
    expect(backend.stack).toEqual([
      "C",
      "Python",
      "Django",
      "FastAPI",
      "REST APIs",
      "PostgreSQL",
      "Unit testing",
    ]);
    for (const entry of backend.stack) {
      expect(entry, `"${entry}" still mentions DRF`).not.toMatch(/DRF/i);
    }
    // Django is still a Tools tile in its own right — that row is separate data
    // and keeps its own `siDjango` mark, so changing the stack must not touch
    // it. The role's own mark is `stack[0]`, which is now "C" and NOT "Python"
    // (owner request 2026-09-27); Python keeps its own mark as a Tools tile.
    expect(aboutTools).toContain("Django");
    expect(aboutTools).toContain("Python");
  });

  it("places C first and Unit testing last, and CI/CD after Linux, on the owner's order", () => {
    // Owner request 2026-09-27, three positional amendments to two role stacks.
    // Asserted positionally rather than as whole arrays, because what the owner
    // specified was *where* each term goes — a bare `toContain` would pass on
    // C sitting anywhere, including last, which is the opposite of the request.
    const backend = aboutSkillRoles[0];
    const devops = aboutSkillRoles[2];

    // "C at the before Python" — C is not merely present, it LEADS.
    expect(backend.stack[0]).toBe("C");
    expect(backend.stack[1]).toBe("Python");
    // "Unit testing at the end" — genuinely last, not merely contained.
    expect(backend.stack[backend.stack.length - 1]).toBe("Unit testing");

    // "CI/CD after Linux" — immediately after, and Linux still leads. The
    // DevOps mark is `stack[0]`, so this must NOT disturb Linux's position or
    // the tile would lose the Tux glyph.
    expect(devops.stack[0]).toBe("Linux");
    expect(devops.stack[1]).toBe("CI/CD");
    // Added, not substituted: GitHub Actions is the tooling behind the practice
    // and the owner asked for a new term, not for the two to be merged.
    expect(devops.stack).toContain("GitHub Actions");
  });

  it("gives the Backend role the C mark, since its mark is stack[0]", () => {
    // The knock-on effect of putting C first, recorded as its own test because
    // it is a real coupling rather than an incidental one: `ProfileSection`
    // renders `<TechIcon tool={role.stack[0]}>`, so the role's logo is whatever
    // leads its stack. The owner moving C to the front therefore moved the
    // Backend tile's mark off Python, and the registry needs a matching entry or
    // the tile renders no glyph at all.
    const backend = aboutSkillRoles[0];
    expect(backend.stack[0]).toBe("C");
    expect(hasTechIcon("C")).toBe(true);

    // The rendered tile must actually draw it, not merely resolve the lookup.
    // Read from the Skills block's own `<li>` rather than through the `fillFor`
    // helper above, which is scoped to the Tools block — C has no Tools tile, and
    // the point here is which mark THIS tile carries.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;
    const tile = skills.querySelectorAll("li")[0];
    const mark = tile.querySelector("svg") as SVGSVGElement;
    expect(mark).not.toBeNull();
    expect(mark.getAttribute("fill")).toBe("#a8b9cc");

    // The mark is C's own simple-icons path, and its UNCORRECTED brand hex:
    // #a8b9cc is 9.19:1 on --background, so unlike Python, Django, Git and KiCad
    // this fill is published as-is rather than lightened to clear 3:1. Asserted
    // against the vendor hex so a future "corrected" C would fail here.
    expect(mark.innerHTML).toContain(siC.path.slice(0, 40));

    // And Python is no longer this tile's mark, though it remains a Tools tile.
    expect(aboutTools).toContain("Python");
    expect(aboutTools).not.toContain("C");
  });

  it("applies the owner's supplied frame markup: muted heading, white indices", () => {
    // The owner pasted the frame's own Technical Skills markup on 2026-09-26 and
    // asked for it to be applied. It shipped with the two colours INVERTED —
    // `text-white` heading, `text-muted-foreground` indices, against the frame's
    // Neutral-200 heading and white indices. That was flagged on arrival and left
    // unfixed pending a decision, which defeated the purpose of the snippet, so it
    // is now asserted directly.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;
    const heading = skills.querySelector("h2") as HTMLElement;
    const index = skills.querySelector("li p") as HTMLElement;

    expect(heading.className).toContain("text-muted-foreground");
    expect(heading.className).not.toContain("text-white");
    expect(index.className).toContain("text-white");
    expect(index.className).not.toContain("text-muted-foreground");
  });

  it("carries the frame's tile chrome: top rule, py-3, centred, 24px gaps", () => {
    // The owner pasted the frame's real Technical Skills snippet on 2026-09-26
    // with the instruction to apply it AND keep what is already in the codebase.
    // These are the frame's per-tile specifics, none of which were here before:
    // a Neutral-200 rule across the top of every tile, 12px of padding under it,
    // tile contents centred rather than flush left, and a 24px gap from the index
    // down to the title (it was 48px). Asserted because a well-meaning pass that
    // treats the role list as the design's own would revert all four.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;
    const tile = skills.querySelector("li") as HTMLElement;
    const index = tile.querySelector("p") as HTMLElement;
    const title = tile.querySelector("h3") as HTMLElement;

    // `border-muted-foreground`, NOT `border-rule`: --rule is #e9e9ec, a
    // near-white for the Services/Contact/Footer dividers, and the frame's tile
    // rule is the same Neutral-200 as its heading.
    expect(tile.className).toContain("border-t");
    expect(tile.className).toContain("border-muted-foreground");
    expect(tile.className).not.toContain("border-rule");
    expect(tile.className).toContain("py-3");
    expect(tile.className).toContain("items-center");
    expect(tile.className).toContain("gap-6");
    expect(tile.className).not.toContain("items-start");
    expect(tile.className).not.toContain("gap-12");

    // Index: the frame's `text-sm font-normal capitalize tracking-wider`, white.
    expect(index.className).toContain("text-caption");
    expect(index.className).toContain("font-normal");
    expect(index.className).toContain("capitalize");
    expect(index.className).toContain("tracking-wider");
    expect(index.className).toContain("text-left");
    expect(index.className).toContain("text-white");

    // Label: the frame's `text-xl font-normal capitalize tracking-widest`,
    // centred. 20px was already correct via `--text-description`.
    expect(title.className).toContain("font-normal");
    expect(title.className).toContain("capitalize");
    expect(title.className).toContain("tracking-widest");
    expect(title.className).toContain("text-center");
  });

  it("keeps the owner's role content, not the frame's four language cards", () => {
    // The other half of the same instruction: blend the frame, remove nothing.
    // The frame's tiles are four 120px language SVGs (JavaScript, TypeScript,
    // Python, Golang) with no body copy. This block is roles, so the frame's
    // CONTENT is not adopted — while the role title, the technology list and the
    // 2x2 arrangement all survive from what was already here.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;

    expect(skills.querySelectorAll("li")).toHaveLength(aboutSkillRoles.length);
    expect(skills.querySelector("ul")?.className).toContain("md:grid-cols-2");
    // One mark per tile, and no more — the frame drew exactly one.
    expect(skills.querySelectorAll("svg")).toHaveLength(aboutSkillRoles.length);
    // The comma-joined technology line has no counterpart in the frame, so it
    // must not have been dropped in the blend.
    for (const role of aboutSkillRoles) {
      const tile = [...skills.querySelectorAll("li")].find(
        (li) => li.querySelector("h3")?.textContent === role.title,
      ) as HTMLElement;

      expect(tile.lastElementChild?.textContent).toBe(role.stack.join(", "));
    }
  });

  it("is headed 'Technical Skills', not the frame's 'Services'", () => {
    // Owner override, 2026-09-26. "Services" was accurate while these were
    // languages; they are roles now, and a role is a capability rather than a
    // service being sold. Asserted so the frame's wording is not restored by a
    // later pass that treats the design as authoritative over the owner.
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(aboutHeadings.skills).toBe("Technical Skills");
    expect(
      screen.getByRole("heading", { name: aboutHeadings.skills, level: 2 }),
    ).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Services" })).toBeNull();
  });

  it("keeps the frame's four ROLES, not its four language tiles", () => {
    // Scoped to the Technical Skills block, and to its HEADINGS: the words "Python"
    // and "JavaScript" are legitimately on the page — one is an owner-supplied
    // tool, the other is inside a role's technology list — so a page-wide text
    // search for the frame's old languages would fail on correct output.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;

    // The frame's four tiles were the LANGUAGES, so none of them may be promoted
    // to a heading here — a role is not a language, and "Python" is legitimately
    // on the page as the lead technology of role 01, so a text search for the
    // languages across the whole block would fail on correct output. What must not
    // happen is the block reverting to the frame's own four cards, which is what
    // these headings rule out.
    const headings = [...skills.querySelectorAll("h3")].map((h) => h.textContent);
    expect(headings).toEqual(aboutSkillRoles.map((role) => role.title));

    for (const language of ["JavaScript", "TypeScript", "Python", "Golang"]) {
      expect(headings).not.toContain(language);
    }
  });

  it("gives every role a mark, taken from its own lead technology", () => {
    // Owner instruction 2026-09-26: add the icons to each skill. The mark is
    // `stack[0]` looked up through the shared `TechIcon` registry, so it is always
    // a technology the role itself claims — there is no `mark` field that could
    // name one it does not. Asserted per role, and by fill, because the failure
    // mode this project has already hit once is a silent EMPTY tile: the About row
    // rendered seven of them when "React" was missing from the registry.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;
    const tiles = [...skills.querySelectorAll("li")];

    expect(tiles).toHaveLength(aboutSkillRoles.length);

    for (const [i, role] of aboutSkillRoles.entries()) {
      const mark = tiles[i].querySelector("svg") as SVGSVGElement | null;

      // The guard: every role's lead technology resolves in the registry.
      expect(hasTechIcon(role.stack[0])).toBe(true);
      expect(mark).not.toBeNull();
      expect(mark?.getAttribute("fill")).toMatch(/^#[0-9a-f]{6}$/i);
      // Decorative: the role's name and its whole stack are already text on the
      // same tile, so announcing the mark would say the same thing twice.
      expect(mark?.getAttribute("aria-hidden")).toBe("true");
      // The frame's box, sized to fit rather than crop.
      expect(mark?.getAttribute("class")).toContain("size-28");
    }

    // Distinct marks — a lookup that silently returned one glyph for every role
    // would pass every assertion above.
    const fills = tiles.map((li) => li.querySelector("svg")?.getAttribute("fill"));
    expect(new Set(fills).size).toBe(aboutSkillRoles.length);
  });

  it("keeps the role title and its stack below the mark", () => {
    // The frame's tile is `index`, then a `w-44` block holding the mark and the
    // label at `gap-2`. That nesting is reproduced, so the label is not sitting
    // 24px under the mark like every other child of the tile.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const skills = container.querySelector(
      'section[aria-labelledby="about-skills-heading"]',
    ) as HTMLElement;
    const tile = skills.querySelector("li") as HTMLElement;
    const [index, block, stack] = [...tile.children] as HTMLElement[];

    expect(index.tagName).toBe("P");
    expect(block.querySelector("svg")).not.toBeNull();
    expect(block.querySelector("h3")?.textContent).toBe(aboutSkillRoles[0].title);
    expect(stack.tagName).toBe("P");
    expect(stack.textContent).toBe(aboutSkillRoles[0].stack.join(", "));
  });
});

describe("About page — social row", () => {
  /**
   * The row of five tiles, as a `<ul>`.
   *
   * Scoped to the sticky column's own `<ul>` child, because there is now a second
   * three-row `<ul>` on the page: the contact card inside the portrait. Both are
   * "a ul of li under the portrait", and a bare `container.querySelector("ul")`
   * would return the contact card — three `li`s, no anchors — making every
   * assertion below pass or fail for the wrong reason.
   */
  const socialRow = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const portraitWrap = container.querySelector("img")
      ?.parentElement as HTMLElement;

    return portraitWrap.parentElement?.querySelector(
      ":scope > ul",
    ) as HTMLElement;
  };

  it("carries the owner's five networks, in the frame's order", () => {
    expect(aboutSocialLinks.map((link) => link.network)).toEqual([
      "linkedin",
      "x",
      "instagram",
      "github",
      "youtube",
    ]);
  });

  it("renders exactly five tiles", () => {
    expect(socialRow().querySelectorAll("li")).toHaveLength(5);
  });

  it("sizes both section heads above the 16px they used to be", () => {
    // Owner instruction 2026-09-26: increase the Tools and Technical Skills
    // header sizes. They were on `--text-body` (16px) while the 20px role titles
    // sat inside them, so the h2 was smaller than its own h3. `--text-about-section`
    // is 20px, which levels the h2 with the h3 and keeps it under the 30px h1.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    for (const id of ["about-tools-heading", "about-skills-heading"]) {
      const head = container.querySelector(`#${id}`) as HTMLElement;

      expect(head.tagName).toBe("H2");
      expect(head.className).toContain("text-about-section");
      expect(head.className).toContain("leading-about-section");
      // The 16px utility is what this replaces; failing on it catches a revert
      // that swaps the token back without touching anything else.
      expect(head.className).not.toContain("text-body");
      expect(head.className).not.toContain("leading-tile");
    }
  });

  it("left-aligns the row with the portrait's own left edge", () => {
    // Owner instruction 2026-09-26, after seeing it rendered: the row hangs off
    // the portrait's left edge rather than sitting centred beneath it. The sticky
    // column is a `flex-col`, so `align-items` decides this for the row — the
    // portrait wrapper is `w-full` and is unaffected either way, which is what
    // makes the column the right place to express it rather than `self-start` on
    // the `<ul>` alone. `self-end`/`ml-auto` would centre it just as visibly.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const column = container.querySelector("img")
      ?.parentElement?.parentElement as HTMLElement;

    expect(column.className).toContain("items-start");
    expect(column.className).not.toMatch(/items-center|items-end/);
    expect(column.className).toContain("flex-col");
  });

  it("adds YouTube to the PROFILE CARD only, never to the header or footer", () => {
    // The owner was explicit about the scope: GitHub and YouTube go on the Profile
    // Card. YouTube is the assertion that carries it, because the header and
    // footer are rendered from a different array and would pick the network up
    // silently the moment `youtube` was added to `socialLinks`.
    expect(aboutSocialLinks.some((link) => link.network === "youtube")).toBe(true);
    expect(socialLinks.some((link) => link.network === "youtube")).toBe(false);

    // The glyph exists too, so the tile carries a real mark rather than a gap.
    const icons = readFileSync("src/components/common/icons.tsx", "utf8");
    expect(icons).toMatch(/^\s*youtube:/m);
  });

  it("keeps GitHub in the header and footer set as well", () => {
    // Not a regression check for its own sake: it is the assertion that the two
    // lists are genuinely separate, which is why they are two arrays.
    expect(socialLinks.some((link) => link.network === "github")).toBe(true);
  });

  it("takes GitHub's address from the header and footer set, so the two cannot drift", () => {
    const card = aboutSocialLinks.find((link) => link.network === "github");
    const header = socialLinks.find((link) => link.network === "github");

    expect(card?.href).toBe(header?.href);
    // Still a guess, so still flagged. One address in two files, not two guesses.
    expect(card?.unverified).toBe(true);
  });

  it("links every network, because all five now have a destination", () => {
    for (const link of aboutSocialLinks) {
      expect(link.href).toMatch(/^https:\/\//);
    }

    expect(aboutSocialLinks.filter((link) => !link.href)).toEqual([]);
  });

  it("uses the owner's Instagram and YouTube addresses exactly as supplied", () => {
    // Owner-supplied 2026-09-26. Both are pinned verbatim, including the two
    // details a well-meaning "cleanup" would break: Instagram's bare host (no
    // `www.`) and YouTube's `@bay_dre` handle, which is NOT the `baydre_africa`
    // the other networks use.
    const byNetwork = Object.fromEntries(
      aboutSocialLinks.map((link) => [link.network, link]),
    );

    expect(byNetwork.instagram?.href).toBe(
      "https://instagram.com/baydre_africa",
    );
    expect(byNetwork.youtube?.href).toBe("https://www.youtube.com/@bay_dre");

    // Supplying a real address clears the review flag on both.
    expect(byNetwork.instagram?.unverified).toBeUndefined();
    expect(byNetwork.youtube?.unverified).toBeUndefined();
  });

  it("still leaves GitHub flagged, since no GitHub address was supplied", () => {
    // The owner gave Instagram and YouTube and not GitHub, so the inherited guess
    // is still a guess. Asserted so that supplying the other two URLs cannot be
    // read as having confirmed this one by implication.
    const github = aboutSocialLinks.find((link) => link.network === "github");

    expect(github?.unverified).toBe(true);
  });

  it("keeps the inert-tile branch, so a network without a URL is never a link", () => {
    // No entry is inert today — all five have addresses — so this branch is
    // currently unexercised by the data. It is kept and asserted on the source
    // because it is the guard that stopped a guessed Instagram and an absent
    // YouTube from becoming links, and because the next network added without a
    // URL is exactly when it matters. Asserted on the source rather than on a
    // fixture, because a fixture would be asserting the fixture.
    const source = readFileSync(
      "src/components/about/ProfileSection.tsx",
      "utf8",
    );

    expect(source).toMatch(/link\.href\s*\?/);
    // And the page never emits an empty or `#` href, whatever the data says.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const anchors = [...container.querySelectorAll("a")];
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      const href = a.getAttribute("href") ?? "";
      expect(href).not.toBe("");
      expect(href).not.toMatch(/^#/);
    }
  });

  it("marks every tile without a destination as unconfirmed in the content", () => {
    for (const link of aboutSocialLinks.filter((l) => !l.href)) {
      expect(link.unverified).toBe(true);
    }
  });

  it("keeps Behance out of the row, and keeps the phone out of the ROW", () => {
    // The phone is not absent from the page — it is a contact-card row, which is
    // where the frame put contact details. What must not come back is a handset
    // masquerading as a social network, so this is scoped to the row and not to
    // the document.
    const row = socialRow();

    expect(row.textContent).not.toMatch(/Behance/);
    expect(row.textContent).not.toMatch(/Phone/);
  });

  it("drops Behance from the shared network union and the glyph map too", () => {
    // Leaving the union member and the glyph in place after removing their only
    // consumer would be dead code, and a `SocialNetwork` value nothing renders
    // reads as support that does not exist.
    const socialNetworks: string[] = [
      "linkedin",
      "github",
      "x",
      "instagram",
      "youtube",
    ];
    expect(socialNetworks).not.toContain("behance");

    // Scoped to the union and the glyph map. The module docstrings mention
    // Behance deliberately, to record that it was removed, so a file-wide search
    // would fail on the documentation of its own removal.
    const types = readFileSync("src/content/types.ts", "utf8");
    const union = types.slice(
      types.indexOf("export type SocialNetwork"),
      types.indexOf(";", types.indexOf("export type SocialNetwork")),
    );
    expect(union).not.toMatch(/behance/);

    const icons = readFileSync("src/components/common/icons.tsx", "utf8");
    expect(icons).not.toMatch(/^\s*behance:/m);
  });
});

describe("About page — the portrait's contact card", () => {
  /**
   * The glass panel that overlays the portrait's bottom-left corner.
   *
   * Reached as the portrait wrapper's last child, which is the absolutely
   * positioned panel — distinct from the wrapper itself (which carries the
   * `@container` the panel's `cqw` units resolve against) and from the social row
   * (a sibling of the wrapper, not a child of it).
   */
  const contactCard = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const portraitWrap = container.querySelector("img")
      ?.parentElement as HTMLElement;

    return portraitWrap.lastElementChild as HTMLElement;
  };

  it("overlays the portrait, at the frame's 304 × 104 in its 421 × 475 space", () => {
    const card = contactCard();
    const cls = card.getAttribute("class") ?? "";

    // 304 / 421 and 104 / 475, declared once in theme.css and referenced rather
    // than restated here — a literal in the class list would be a second source
    // of truth for the same ratio.
    expect(cls).toContain("w-[var(--contact-card-w)]");
    expect(cls).toContain("h-[var(--contact-card-h)]");
    expect(cls).toContain("absolute");
    expect(cls).toContain("bottom-0");
    expect(cls).toContain("left-0");

    const css = readFileSync("src/styles/theme.css", "utf8");
    expect(css).toContain("--contact-card-w: 72.209%");
    expect(css).toContain("--contact-card-h: 21.895%");
  });

  it("scales with the portrait instead of holding a fixed px size", () => {
    // The card is registered to the photograph, so at a phone's width the frame's
    // 15px labels must shrink with it. A container on the portrait wrapper is what
    // makes the panel's `cqw` units resolve against the portrait rather than the
    // page.
    const portraitWrap = contactCard().parentElement as HTMLElement;

    expect(portraitWrap.getAttribute("class")).toContain("@container");
    expect(portraitWrap.getAttribute("class")).toContain("relative");
  });

  it("reproduces the frame's glass: 10% white, a 10% border, 2px blur, 8px radius", () => {
    const cls = contactCard().getAttribute("class") ?? "";

    expect(cls).toContain("bg-contact-glass");
    expect(cls).toContain("border-contact-glass-border");
    expect(cls).toContain("backdrop-blur-[2px]");
    // `rounded-md` is 8px; the frame's `rx` is 8 and `--radius-lg` would be 12.
    expect(cls).toContain("rounded-md");
    expect(cls).toContain("overflow-hidden");
  });

  it("renders the frame's three rows, in order", () => {
    const rows = [...contactCard().querySelectorAll("li")];

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.textContent)).toEqual([
      "Phone Number",
      "Email Address",
      "Location",
    ]);
  });

  it("labels every row from the content file, not from the component", () => {
    // The frame bakes these three strings into the SVG as vector outlines, which is
    // why they live in `aboutContact` here: greppable, and impossible to mistake
    // for real data once the owner replaces them.
    expect(aboutContact.map((row) => row.field)).toEqual([
      "phone",
      "email",
      "location",
    ]);
    expect(contactCard().textContent).toBe(
      aboutContact.map((row) => row.label).join(""),
    );
  });

  it("links NO row while the labels are still the frame's placeholders", () => {
    // The enforcement behind `ContactRow.href` being optional: a `tel:` to a
    // made-up number dials a stranger and a `mailto:` to a placeholder bounces
    // mail to nobody, so no row may be a link until the owner supplies a value.
    expect(aboutContact.every((row) => row.href === undefined)).toBe(true);

    const card = contactCard();
    expect(card.querySelectorAll("a")).toHaveLength(0);
    expect(card.querySelectorAll("[href]")).toHaveLength(0);
  });

  it("would link a row the moment a real value is supplied", () => {
    // The other half of the same rule, so the assertion above cannot be satisfied
    // by a card that simply never links anything. Read against a copy of the data
    // rather than by re-rendering with a fixture, so the component's own branch
    // condition is what is under test.
    const source = readFileSync(
      "src/components/about/ProfileSection.tsx",
      "utf8",
    );

    expect(source).toMatch(/row\.href\s*\?\s*\(\s*<a/);
  });

  it("gives every row a real glyph, not an emoji", () => {
    // The old page drew 📞 ✉️ 📍 here. All three are lucide now: they are UI icons
    // rather than brand marks, which is the distinction that put KiCad on
    // simple-icons and these on lucide.
    const card = contactCard();

    expect(card.querySelectorAll("li")).toHaveLength(3);
    for (const row of card.querySelectorAll("li")) {
      expect(row.querySelector("svg")).not.toBeNull();
    }
    expect(card.textContent).not.toMatch(/📞|✉|📍/);
  });
});

describe("About page — removed placeholders", () => {
  const markup = () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    return container.innerHTML;
  };

  it("carries no masked phone number", () => {
    // The old page hardcoded `+234**********`. The frame now supplies a contact
    // card, but it supplies the card's LABELS and no values, so the fake number
    // is still deleted rather than migrated — the card ships with no `href` at
    // all, which is asserted in the contact-card block above.
    expect(markup()).not.toContain("+234");
    expect(markup()).not.toContain("example@example.com");
  });

  it("carries no emoji as iconography", () => {
    // The old tools row rendered `⚛️` and the old contact rows rendered `📞`,
    // `✉️` and `📍`. Real glyphs replaced all of them.
    expect(markup()).not.toMatch(/⚛|📞|✉|📍/);
  });

  it("carries no invented role, and no abstract colour swatch standing in for art", () => {
    // The old services grid drew `bg-yellow-400` / `bg-blue-500` blocks with the
    // first two letters of each technology on them.
    expect(markup()).not.toContain("bg-yellow-400");
    expect(markup()).not.toContain("bg-blue-500");
    expect(markup()).not.toContain("bg-cyan-400");
    expect(markup()).not.toContain("bg-blue-400");
  });
});

describe("About page — closing call to action", () => {
  it("keeps the panel the owner asked to retain", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Let's Build Something Great Together/i }),
    ).toBeDefined();
  });

  it("breaks the body so the 'If …' sentence starts on the second line", () => {
    // Owner instruction 2026-09-26. Asserted as two `<p>`s rather than a `<br/>`
    // for the reason the biography gives: a hardcoded break is only correct at the
    // width it was measured at. The copy itself is unchanged, so both sentences
    // are still present and still in order.
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    const cta = container.querySelector(
      'section[aria-labelledby="about-cta-heading"]',
    ) as HTMLElement;
    const items = [...cta.querySelectorAll("p")];
    const paragraphs = items.map((p) => p.textContent);

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toMatch(/^I'm open to collaborations/);
    expect(paragraphs[0]).not.toMatch(/\bIf you/);
    expect(paragraphs[1]).toMatch(/^If you're looking for a developer/);
    // No `<br/>` reintroduced — the paragraphs are the mechanism.
    expect(cta.querySelector("br")).toBeNull();

    // The two sentences are wrapped so their gap can be tightened without
    // touching the section's own `gap-8`, which still spaces the heading off this
    // block and the block off the two actions.
    const wrapper = items[0].parentElement as HTMLElement;

    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper.className).toContain("gap-2");
    expect(wrapper.className).not.toMatch(/gap-3|gap-8/);
    expect(cta.className).toContain("gap-8");
    expect(wrapper.querySelectorAll("p")).toHaveLength(2);
  });

  it("says X, not Twitter — the last place still using the old name", () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Connect on X/i })).toBeDefined();
    expect(container.innerHTML).not.toContain("Twitter");
  });

  it("gives both actions real destinations", () => {
    // The old panel's two `<button>`s had no handler at all. AGENTS.md §4: never
    // fake functionality.
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const contact = screen.getByRole("link", { name: /Contact me/i });
    const x = screen.getByRole("link", { name: /Connect on X/i });

    expect(contact.getAttribute("href")).toBe("/#contact");
    expect(x.getAttribute("href")).toBe("https://x.com/baydre_africa");
    expect(x.getAttribute("rel")).toContain("noopener");
  });

  it("does not use a button that pretends to do something", () => {
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});

/**
 * The About page's provenance, asserted against the repository rather than
 * against the rendered output.
 *
 * `AGENTS.md` §3 lists About among the screens that had no design and were built
 * on assumptions. The frame has since been supplied, so the docs must no longer
 * claim otherwise — a stale claim here would tell the next reader to treat the
 * frame as optional when it is now the source.
 */
describe("About page — documentation provenance", () => {
  const designSystem = readFileSync("docs/DESIGN_SYSTEM.md", "utf8");

  it("no longer lists About as having no design", () => {
    const stale = designSystem.match(
      /^.*\b(About|Resume|Product Page)\b.*\bno design\b.*$/gim,
    );

    expect(stale ?? []).toEqual([]);
  });
});
