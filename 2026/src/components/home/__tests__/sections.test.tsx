import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { projects } from "../../../content/projects";
import { secondaryServices, services } from "../../../content/services";
import { ProjectCard } from "../ProjectCard";
import { ServicesSection } from "../ServicesSection";
import { WorkSection } from "../WorkSection";

/**
 * The two homepage sections added from the full HomePage snippet.
 *
 * These assert the things the generated markup got wrong and that a reviewer
 * would otherwise have to check by eye: that the sections are real landmarks
 * with real headings, that the design's index numbering survives, and that
 * provisional content is visibly marked.
 */

const renderSection = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("WorkSection", () => {
  it("is a labelled region with a real heading", () => {
    renderSection(<WorkSection />);
    const section = screen.getByRole("region", { name: "Work" });
    // The snippet renders every heading as a <p>; this must be a heading.
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("anchors at #work and is offset for the sticky header", () => {
    renderSection(<WorkSection />);
    const section = document.querySelector("section#work");
    expect(section).not.toBeNull();
    // scroll-mt-header keeps the section heading clear of the sticky header.
    expect(section?.className).toContain("scroll-mt-header");
  });

  it("renders one numbered entry per project", () => {
    const { container } = renderSection(<WorkSection />);
    // Scoped to the ordered list: ProjectCard also contains a <ul> of stack
    // tiles, which a bare getAllByRole("listitem") would count.
    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    expect(list?.querySelectorAll(":scope > li")).toHaveLength(projects.length);
  });

  /**
   * Owner-confirmed 2026-09-26, reversed the same day: the Provisional pill is
   * removed. It sat between the title and the `01` label, but the design gives
   * that row exactly two children. The provenance is recorded in
   * `docs/DESIGN_SYSTEM.md` §6 and in `projects.ts` instead of in the UI.
   */
  it("gives the title row exactly the design's two children", () => {
    renderSection(<WorkSection />);
    const card = screen.getByRole("article");
    const title = within(card).getByRole("heading", { level: 3 });
    const index = within(card).getByText(/^\d{2}$/);

    // StyledHeadline is `justify-content: space-between` over the title and the
    // label. A third child — the pill — is not in the design.
    const row = title.parentElement as HTMLElement;
    expect(row).toBe(index.parentElement);
    expect(Array.from(row.children).map((c) => c.tagName)).toEqual(["H3", "SPAN"]);
    expect(screen.queryByText(/provisional/i)).toBeNull();
  });

  it("keeps the provisional flag on the data for the ProjectPage notice", () => {
    // The pill is gone, but `provisional` is still load-bearing: ProjectPage
    // prints a placeholder notice from it, so the flag must not be dropped.
    expect(projects.filter((p) => p.provisional)).not.toHaveLength(0);
  });

  it("links each project title to its detail route", () => {
    renderSection(<WorkSection />);
    for (const project of projects) {
      expect(
        screen.getByRole("link", { name: project.title }),
      ).toHaveAttribute("href", `/projects/${project.id}`);
    }
  });

  it("does not repeat a project's index as a second accessible name", () => {
    renderSection(<WorkSection />);
    // The per-project NN label is decorative; the heading carries the name.
    expect(screen.queryByText("01", { selector: "h3" })).toBeNull();
  });

  /**
   * The description is 156 characters at 24px in a 65ch measure, so it wraps to
   * three lines and its box is 96px tall. The heading's box is 44px. With the
   * default bottom-alignment both boxes bottom-align, which strands the heading
   * beside the description's *last* line instead of its first.
   */
  it("aligns the heading with the description's first line", () => {
    renderSection(<WorkSection />);
    const row = within(screen.getByRole("region", { name: "Work" }))
      .getByRole("heading", { level: 2 })
      .parentElement;

    expect(row?.className).toContain("lg:items-start");
    expect(row?.className).not.toContain("lg:items-end");
  });

  it("keeps the description free of the bottom-alignment nudge", () => {
    renderSection(<WorkSection />);
    const section = screen.getByRole("region", { name: "Work" });
    const description = within(section).getByText(/BaydreAfrica designs and builds/);

    // `lg:pb-1` only compensated for bottom-aligning; it would shift the text off
    // the first baseline once the boxes are top-aligned.
    expect(description.className).not.toContain("lg:pb-1");
  });

  /**
   * The Work header's description has an authored computed style:
   *
   *   { flex: "1 0 0", color: "#E9E9EC", font-family: "Jura",
   *     font-size: "20px", font-weight: "400", line-height: "40px" }
   *
   * All four differ from what was there. jsdom loads no stylesheet, so
   * getComputedStyle reports defaults; the built CSS is checked in the token
   * test below instead.
   */
  it("matches the description's authored computed style", () => {
    renderSection(<WorkSection />);
    const description = within(screen.getByRole("region", { name: "Work" })).getByText(
      /BaydreAfrica designs and builds/,
    );
    const classes = description.className.split(/\s+/);

    // font-size: 20px, line-height: 40px
    expect(classes).toContain("text-description");
    expect(classes).toContain("leading-description");
    // color: #E9E9EC — was --muted-foreground (#a8a7b0)
    expect(classes).toContain("text-foreground");
    expect(classes).not.toContain("text-muted-foreground");
    // flex: 1 0 0 — was a max-w-prose cap
    expect(classes).toEqual(
      expect.arrayContaining(["grow", "basis-0", "shrink-0"]),
    );
    expect(classes).not.toContain("max-w-prose");
    // The 24px/32px lead tokens belong to Hero and Contact, not here.
    expect(classes).not.toContain("text-lead");
    expect(classes).not.toContain("leading-lead");
  });

  it("resolves the description tokens to the authored 20px/40px", () => {
    // Read the real token file rather than restating the values, so retuning a
    // token cannot leave the test green against a stale copy.
    const theme = readFileSync("src/styles/theme.css", "utf8");

    expect(theme).toMatch(/--text-description:\s*1\.25rem/);
    expect(theme).toMatch(/--leading-description:\s*2\.5rem/);
  });

  /**
   * The Project card snippet fixes values the card previously got wrong:
   * `01` inside a `justify-between` title row, a 32px `#FFF` title, a
   * 20px/32px `#E9E9EC` summary, a 12px image, and stack tiles
   * built as an icon box above a centred label.
   */
  it("puts the NN label in the card's title row, right-aligned", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );
    // Bare digits: the frame's `//` prefix is dropped on owner request
    // 2026-09-26, so this also fails if the prefix ever comes back.
    const label = within(card).getByText(/^\d{2}$/);
    const row = label.parentElement;

    expect(row?.className).toContain("justify-between");
    // The label is a sibling of the title heading, not a wrapper above the card.
    expect(row?.querySelector("h3")).not.toBeNull();
    expect(within(card).getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("styles the card title and summary as the snippet specifies", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );

    // text-[32px] font-maisonNeue text-[#FFF]
    const title = within(card).getByRole("heading", { level: 3 });
    expect(title.className).toContain("text-card-title");
    expect(title.className).toContain("font-heading");
    expect(title.className).toContain("text-white");

    // text-[#E9E9EC] font-jura text-xl leading-8  (20px on a 32px line)
    const summary = within(card).getByText(/digital identity platform/i);
    expect(summary.className).toContain("text-description");
    expect(summary.className).toContain("leading-card-summary");
    expect(summary.className).toContain("text-foreground");
    expect(summary.className).not.toContain("text-muted-foreground");
  });

  it("uses the snippet's 12px card radius, not the hero image radius", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );

    // Both exports say borderRadius 12 for the image and the panel, and
    // --radius-lg is 12px. rounded-image (24px) is the HERO image's radius, and
    // rounded-xl (16px) was a misreading of the Tailwind classes.
    expect(card.querySelector(".rounded-lg")).not.toBeNull();
    expect(card.querySelector(".rounded-image")).toBeNull();
    expect(card.querySelector(".rounded-xl")).toBeNull();
  });

  it.each([
    ["placeholder", 'div[aria-hidden="true"]', 'div[aria-hidden="true"]'],
    ["img", "img", "img"],
  ])(
    "sizes the card %s to the snippet's 621 x 494 at a 12px radius",
    (_label, selector, expectedTag) => {
      // Rendered directly rather than through WorkSection, because the only
      // project has no artwork: the <img> branch is otherwise dead code in
      // tests and its sizing would be unguarded.
      const withArtwork =
        expectedTag === "img"
          ? { ...projects[0], image: "/work/idcardify.png" }
          : projects[0];
      renderSection(<ProjectCard project={withArtwork} index={0} />);
      const el = screen.getByRole("article").querySelector(selector);

      // lg:w-[38.8125rem] = 621px. Both exports fix the ratio, so it is carried as
      // aspect-[621/494] rather than a desktop-only height — which is what stops
      // the placeholder collapsing to a bar below `lg`. With the width this
      // resolves to exactly 621 x 494 at 1440.
      expect(el?.className).toContain("lg:w-[38.8125rem]");
      expect(el?.className).toContain("aspect-[621/494]");
      expect(el?.className).not.toContain("lg:h-[30.875rem]");
      expect(el?.className).toContain("rounded-lg");
      expect(el?.className).not.toContain("rounded-xl");
    },
  );

  it("uppercases and tracks the panel label as the export specifies", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );
    const label = within(card).getByText("Built with");

    // textTransform: uppercase, letter-spacing 0.88px = 0.0733em at 12px.
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-[0.0733em]");
  });

  /**
   * A Tailwind class for a token that does not exist renders as nothing, and
   * nothing catches it: `pnpm build`, `lint`, `typecheck` and the rest of this
   * suite were all green while `//01` sat on `line-height: normal` because
   * `--leading-card-index` had never been added. AGENTS.md forbids leaving a
   * line box to `normal`, so this pins the rule.
   */
  it("backs every custom text/leading class in the card with a token", () => {
    // Tailwind's own utilities, which are legitimately not design tokens.
    const builtins = new Set([
      "text-center", "text-white", "text-foreground", "text-muted-foreground",
      "text-code-foreground", "text-panel-foreground",
      "text-tech-tile-foreground", "text-pill-foreground",
      "text-pill-outline-label", "text-ellipsis",
    ]);
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const files = [
      "src/components/home/ProjectCard.tsx",
      "src/components/home/WorkSection.tsx",
      "src/components/common/TechIcon.tsx",
    ];

    const undefinedClasses = new Set<string>();
    for (const file of files) {
      // Comments mention class names as much as className strings do, and a
      // class in a comment renders nothing.
      const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const cls of source.match(/\b(?:text|leading)-[a-z0-9-]+/g) ?? []) {
        if (builtins.has(cls)) continue;
        if (!new RegExp(`^\\s*--${cls}:`, "m").test(theme)) {
          undefinedClasses.add(`${cls} (${file})`);
        }
      }
    }

    expect([...undefinedClasses]).toEqual([]);
  });

  it("uses 12px on the panel and 8px on the tile box", () => {
    renderSection(<WorkSection />);
    const card = screen.getByRole("article");
    // Scoped to the panel that owns the label — `card.querySelector(".bg-panel")`
    // would return the image placeholder, which is also bg-panel.
    const panel = within(card).getByText("Built with").closest(".bg-panel");
    const tile = within(card).getAllByText("React.js")[0].parentElement
      ?.querySelector("div");

    // --radius-lg is 12px and --radius-md is 8px. The design's raw CSS says
    // 12 for the panel and 8 for the tile; its Tailwind export says
    // `rounded-xl` and `rounded-lg`, which in Figma's own scale are those same
    // values but in standard Tailwind are 16px and 12px.
    expect(panel?.className).toContain("rounded-lg");
    expect(panel?.className).not.toContain("rounded-md");
    expect(tile?.className).toContain("rounded-md");
    expect(tile?.className).not.toContain("rounded-lg");
  });

  it("renders the design's 3 + 2 tile grid, not one stretched tile", () => {
    renderSection(<ProjectCard project={projects[0]} index={0} />);
    const card = screen.getByRole("article");
    const tiles = within(card).getAllByRole("listitem");
    const list = within(card).getByRole("list");

    // The design's panel shows five tiles, three in the first row and two in the
    // second. Each tile is `flex: 1 1 0`, so a single entry would grow to 100%
    // of the panel — one ~595px bar with a 32px icon in it, not a tile. This
    // is the assertion that would have caught the stack being collapsed to one
    // entry while the component still looked plausible in review.
    expect(tiles).toHaveLength(5);
    expect(projects[0].stack).toHaveLength(5);

    // Two across by default, three once the panel body can hold 3 x 56 + 2 x 24
    // = 216px. At 1440 the body is 595px, so the query matches and the grid is
    // the design's 3 + 2: a full row of three, then two at half width.
    expect(list.className).toContain("flex-wrap");
    for (const tile of tiles) {
      expect(tile.className).toContain("basis-[calc((100%-1.5rem)/2)]");
      expect(tile.className).toContain("@[216px]:basis-[calc((100%-3rem)/3)]");
      expect(tile.className).toContain("flex-1");
    }
  });

  it("scopes the tile count to the panel, not the viewport", () => {
    renderSection(<ProjectCard project={projects[0]} index={0} />);
    const card = screen.getByRole("article");
    // Reached via the list's parent rather than `.@container`: jsdom's selector
    // engine rejects the escaped `@` that Tailwind needs in real CSS.
    const body = within(card).getByRole("list").parentElement;

    // The card's image is a fixed 621px, so from 1024px — where `lg` turns the
    // row on — the right column is squeezed. At 1024 the panel body is 179px and
    // a third of it (43.7px) cannot hold `p-3` plus a 32px icon. A viewport
    // breakpoint cannot see that; only a container query on the panel can.
    expect(body?.className).toContain("@container");
  });

  it("builds each stack tile as an icon box above a centred label", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );
    const tile = within(card).getAllByText("React.js")[0];
    const box = tile.parentElement?.querySelector("div");

    expect(tile.className).toContain("text-center");
    expect(tile.className).toContain("leading-tile");
    expect(tile.className).toContain("text-tech-tile-foreground");
    // bg-tech-tile (#313131) on the icon box, at the raw CSS's 8px — which is
    // `rounded-md`, NOT `rounded-lg`. The tile box is 8 and the panel is 12;
    // conflating them was a real bug, and the design's Tailwind export invites
    // it by spelling the panel's 12px `rounded-xl`.
    expect(box?.className).toContain("bg-tech-tile");
    expect(box?.className).toContain("rounded-md");
    expect(box?.className).not.toContain("rounded-lg");
    // The glyph itself, and it is not announced twice.
    expect(box?.querySelector("svg")).not.toBeNull();
    expect(box?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps one li per tool and lets the tiles wrap, with no div inside ul", () => {
    renderSection(
      <ProjectCard
        project={{ ...projects[0], stack: ["React.js", "Vite", "TypeScript"] }}
        index={0}
      />,
    );
    const list = screen.getByRole("list");

    // The design nests grid > row > tile, which would put a <div> straight inside
    // the <ul> — invalid HTML, since a list may only contain <li>. flex-wrap
    // supplies the same 24px row and column gaps from one gap-6.
    const invalid = Array.from(list.children).filter((c) => c.tagName !== "LI");
    expect(invalid).toHaveLength(0);
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);

    // A trailing pair must still fill its own row. flex-1 on a one-half or
    // one-third basis grows the row's tiles to 100% of that row, which is what
    // the design's separate `space-between` row produces.
    const items = within(list).getAllByRole("listitem");
    for (const item of items) {
      expect(item.className).toContain("flex-1");
      expect(item.className).toContain("basis-[calc(");
    }
    expect(list.className).toContain("flex-wrap");
  });

  it("stretches the panels with self-stretch, not a stretched parent", () => {
    renderSection(<ProjectCard project={projects[0]} index={0} />);
    const card = screen.getByRole("article");

    // StyledFrame1548 and the panel are both `align-items: flex-start`, and it is
    // `align-self: stretch` on each child that makes them full width. Relying on
    // the column's default `stretch` renders the same but puts the work on the
    // parent, so a child dropped without a width would silently collapse.
    const column = card.lastElementChild as HTMLElement;
    expect(column.className).toContain("items-start");
    expect(column.className).toContain("flex-col");

    for (const child of Array.from(column.children)) {
      expect(child.className).toContain("self-stretch");
    }
  });

  it("emits no duplicate SVG clip-path ids across tiles", () => {
    renderSection(<WorkSection />);
    const card = within(screen.getByRole("region", { name: "Work" })).getByRole(
      "article",
    );
    // The snippet repeats clip0_323_427 / clip0_323_437 across its five tiles,
    // which puts duplicate ids in the document. TechIcon drops the no-op clip.
    expect(card.querySelectorAll("clipPath").length).toBe(0);
  });

  it("resolves the card tokens to the authored values", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");

    // Fluid, but the clamp's cap is the authored 32px.
    expect(theme).toMatch(
      /--text-card-title:\s*clamp\(1\.5rem,\s*2\.3vw,\s*2rem\)/,
    );
    expect(theme).toMatch(
      /--text-card-index:\s*clamp\(1\.125rem,\s*1\.7vw,\s*1\.5rem\)/,
    );
    expect(theme).toMatch(/--leading-card-index:\s*1\.3333/);
    expect(theme).toMatch(/--leading-card-summary:\s*2rem/);
    expect(theme).toMatch(/--text-panel-label:\s*0\.75rem/);
    expect(theme).toMatch(/--leading-panel-label:\s*1\.1rem/);
    expect(theme).toMatch(/--leading-tile:\s*1\.5rem/);
    // --radius-lg is the 12px both exports ask for on the image and the panel.
    expect(theme).toMatch(/--radius-lg:\s*12px/);
  });

  it("keeps the per-project numbering while dropping the section index", () => {
    renderSection(<WorkSection />);
    const heading = within(
      screen.getByRole("region", { name: "Work" }),
    ).getByRole("heading", { level: 2 });

    // The section-level `01` is gone (owner request, 2026-09-26): the heading
    // block is now just the h2 plus its description.
    expect(heading.textContent).toBe("Work");
    expect(heading.parentElement?.textContent).not.toMatch(/\d/);

    // The per-project `01`–`04` labels are content and still render, one per
    // card, with no `//` prefix (owner request, 2026-09-26).
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(projects.length);

    const labels = cards.map((card) =>
      Array.from(card.querySelectorAll(".text-card-index")).map(
        (el) => el.textContent,
      ),
    );

    // Exactly one index element per card, so the number is not also repeated
    // somewhere it would be read twice.
    expect(labels.map((l) => l.length)).toEqual(
      projects.map(() => 1),
    );
    for (const [i, [label]] of labels.entries()) {
      expect(label, `project ${i} index`).toMatch(/^\d{2}$/);
    }
  });
});

describe("ServicesSection", () => {
  it("is a labelled region with a real heading", () => {
    renderSection(<ServicesSection />);
    const section = screen.getByRole("region", { name: "Services" });
    expect(within(section).getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("anchors at #services", () => {
    renderSection(<ServicesSection />);
    expect(document.querySelector("section#services")).not.toBeNull();
  });

  it("renders the six primary services, then the two secondary ones", () => {
    const { container } = renderSection(<ServicesSection />);
    // Scoped by tier rather than by position: both tiers render `h3`, so
    // "every level-3 heading in the section" is now all eight and would stop
    // saying anything about order within the grid.
    const headings = within(screen.getByRole("region", { name: "Services" }))
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);

    expect(headings).toEqual([...services, ...secondaryServices].map((s) => s.title));
    expect(services).toHaveLength(6);
    expect(secondaryServices).toHaveLength(2);

    // And the split is real, not just a concatenated list: the primary six are
    // in the two 3-column rows, the secondary pair in its own group below.
    const tiers = Array.from(container.querySelectorAll("ul[data-tier]"));
    expect(tiers.map((t) => t.getAttribute("data-tier"))).toEqual([
      "primary",
      "primary",
      "secondary",
    ]);
  });

  it("drops the section-level 02 while keeping the h2", () => {
    renderSection(<ServicesSection />);
    const heading = within(
      screen.getByRole("region", { name: "Services" }),
    ).getByRole("heading", { level: 2 });

    expect(heading.textContent).toBe("Services");
    expect(heading.parentElement?.textContent).not.toMatch(/\/\/\d/);
  });

  it("preserves the design's 01–06 numbering as content, not position", () => {
    renderSection(<ServicesSection />);
    // The slashes are dropped (owner request, 2026-09-26); the digits are the
    // design's own and are still authored per entry, not derived from position.
    expect(services.map((s) => s.index)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);
  });

  it("prints no // prefix anywhere in either section", () => {
    // One guard for the whole Home page, because the `//` was a shared motif and
    // dropping it from one section while leaving it in the other would be the
    // exact inconsistency the change exists to remove. Both sections are mounted
    // into one document so the check spans them together.
    renderSection(
      <div>
        <WorkSection />
        <ServicesSection />
      </div>,
    );

    for (const name of ["Work", "Services"]) {
      const region = screen.getByRole("region", { name });
      expect(region.textContent ?? "", `${name} still renders a //`).not.toMatch(
        /\/\//,
      );
    }
  });

  it("renders all six descriptions verbatim, none omitted", () => {
    const { container } = renderSection(<ServicesSection />);

    // The copy used to be withheld, and the test that covered that skipped any
    // service which had a description — so it passed while asserting nothing the
    // moment real copy arrived. Every service now has one, and all six are
    // checked against the transcribed string.
    for (const service of services) {
      expect(service.description, `${service.title} has no copy`).toBeTruthy();
    }

    const text = container.textContent ?? "";
    for (const service of services) {
      expect(text).toContain(service.description);
    }
  });

  it("orders each card as index, then title, then description", () => {
    const { container } = renderSection(<ServicesSection />);
    const card = container.querySelectorAll('ul[data-tier="primary"] > li')[1]; // 02

    // The frame's order was 0N, artwork, title, description. The artwork slot
    // was removed on 2026-09-27, so the card is now three children with the
    // title directly after the 0N label. The `div` is asserted ABSENT rather
    // than merely not listed: a reserved-but-empty slot would still stretch the
    // card to 384px, which is the thing that was removed.
    expect(Array.from(card?.children ?? []).map((c) => c.tagName.toLowerCase())).toEqual([
      "p", //   02
      "h3", //   title
      "p", //   description
    ]);
    expect(card?.querySelector("div")).toBeNull();
    expect(card?.querySelector("h3")?.textContent).toBe("Backend & API Engineering");
  });

  it("renders no icon or reserved graphic slot in any card", () => {
    const { container } = renderSection(<ServicesSection />);
    const cards = Array.from(container.querySelectorAll('ul[data-tier="primary"] > li'));
    expect(cards).toHaveLength(6);

    // Owner decision 2026-09-27: the per-service marks were removed, so a
    // pictogram must not come back. This is the inverse of the guard that used
    // to live here — that one failed a *blank* slot, this one fails a *filled*
    // one. Asserted on the whole card, so an icon anywhere in the anatomy is
    // caught, not just one in the slot's old position.
    for (const [i, card] of cards.entries()) {
      const label = services[i].title;
      expect(card.querySelector("svg"), `${label} has an svg mark`).toBeNull();
      expect(card.querySelector("img"), `${label} has an img mark`).toBeNull();
      // The reserved 384px box is the real regression: it is what made the cards
      // tall. `aspect-square` had no reason to survive the icon.
      expect(card.innerHTML, `${label} reserved a graphic slot`).not.toContain("aspect-square");
    }
  });

  it("gives every primary card the same anatomy, and keeps the tiers distinct", () => {
    const { container } = renderSection(<ServicesSection />);
    const shape = (li: Element) =>
      Array.from(li.children).map((k) => k.tagName.toLowerCase()).join(",");

    // This test originally existed because 01 had no artwork while the other
    // five did, so its three children did not match the others' four. With the
    // marks gone the primary cards are all the same three children, so the
    // asymmetry it was written to catch is gone with it — it now guards the flat
    // anatomy WITHIN a tier.
    //
    // Scoped, because the tiers are now deliberately not the same shape: the
    // primary cards are `p,h3,p` (index, title, description) and the secondary
    // pair is `h3` alone until the owner supplies their copy. Asserting one
    // shape across all eight would have forced the secondary services to grow a
    // fake index, which is the thing being avoided.
    const primary = Array.from(container.querySelectorAll('ul[data-tier="primary"] > li'));
    expect(new Set(primary.map(shape)).size).toBe(1);
    expect(shape(primary[0])).toBe("p,h3,p");

    const secondary = Array.from(container.querySelectorAll('ul[data-tier="secondary"] > li'));
    expect(new Set(secondary.map(shape)).size).toBe(1);
    expect(shape(secondary[0])).toBe("h3");
  });

  it("gives the secondary services no index label of their own", () => {
    const { container } = renderSection(<ServicesSection />);

    // The numbering is a motif shared with the Work section, and it is
    // deliberately NOT continued to `07`/`08`: numbering the secondary pair
    // would present them as the same kind of offer, merely later in the list.
    for (const card of container.querySelectorAll('ul[data-tier="secondary"] > li')) {
      const text = card.textContent ?? "";
      expect(text).not.toMatch(/\b0[1-8]\b/);
    }

    // And the primary indices are untouched, still 01–06, still content rather
    // than array position.
    const indices = Array.from(
      container.querySelectorAll('ul[data-tier="primary"] > li > p:first-child'),
    ).map((p) => p.textContent);
    expect(indices).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("uses two rows of three with the design's rule between them", () => {
    const { container } = renderSection(<ServicesSection />);
    const rows = Array.from(container.querySelectorAll('ul[data-tier="primary"]'));

    // Not one 6-cell grid: the frame puts a rule between the rows. Scoped to the
    // primary tier, because the secondary pair is a THIRD ul and is deliberately
    // not part of this grid.
    expect(rows).toHaveLength(2);
    expect(rows[0].children).toHaveLength(3);
    expect(rows[1].children).toHaveLength(3);
    // 32px between cards; 48px around the rule.
    expect(rows[0].className).toContain("gap-8");
    expect(container.querySelector(".bg-rule")).not.toBeNull();
  });

  it("drops the trailing divider on the last card of each row", () => {
    const { container } = renderSection(<ServicesSection />);
    const rows = Array.from(container.querySelectorAll('ul[data-tier="primary"]'));

    // The frame omits border-r on 03 and 06, which are last in their rows.
    for (const row of rows) {
      const cards = Array.from(row.children);
      cards.forEach((card, i) => {
        const hasBorder = card.className.includes("border-r");
        expect(hasBorder, `card ${i} of the row`).toBe(i < cards.length - 1);
      });
    }
  });

  it("resolves the service type to the frame's values, not a shared scale", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");

    // The card title is 30px under a 36px section heading. Both were 28px
    // before, which is what made a card outweigh its own section.
    expect(theme).toMatch(/--text-service:\s*1\.875rem/);
    expect(theme).toMatch(/--text-section-compact:\s*2\.25rem/);
    expect(theme).toMatch(/--text-service-body:\s*1\.5rem/);
    expect(theme).toMatch(/--leading-service-body:\s*2\.5rem/);
    // Work keeps its own 40px/20px scale; the two frames genuinely differ.
    expect(theme).toMatch(/--text-section:\s*clamp/);
    expect(theme).toMatch(/--text-description:\s*1\.25rem/);
  });

  it("tops the Services heading with its description, as Work does", () => {
    const { container } = renderSection(<ServicesSection />);
    const section = screen.getByRole("region", { name: "Services" });
    const row = section.querySelector("h2")?.parentElement;

    // `align="first-line"` -> `lg:items-start` plus the optical offset. The
    // default bottom-alignment put the 36px heading beside the *last* of the
    // description's two lines, which read as the header sitting too low.
    expect(row?.className).toContain("lg:items-start");
    expect(row?.className).not.toContain("lg:items-end");
    expect(section.querySelector("h2")?.className).toContain("lg:mt-[0.5rem]");
    expect(container).toBeTruthy();
  });

  it("states the Services description at Work's 20px, per owner correction", () => {
    renderSection(<ServicesSection />);
    const section = screen.getByRole("region", { name: "Services" });
    // The section's own description, beside the heading.
    const desc = Array.from(section.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").includes("Digital experiences"),
    );
    expect(desc).toBeDefined();

    // Owner correction 2026-09-26: 20px, matching Work — not the frame's 24px.
    expect(desc?.className).toContain("text-description");
    expect(desc?.className).not.toContain("text-service-body");
  });

  it("keeps the card copy at 24px, changing only the section description", () => {
    const { container } = renderSection(<ServicesSection />);
    const cards = Array.from(container.querySelectorAll('ul[data-tier="primary"] > li'));

    // "only" — the six 0N labels and six card descriptions stay at the frame's
    // 24px, and the heading stays 36px.
    for (const card of cards) {
      // index, title, description — the mark slot was removed on 2026-09-27, so
      // this skips one child, not two.
      const [index, , body] = Array.from(card.children);
      expect(index.className).toContain("text-service-body");
      expect(body.className).toContain("text-service-body");
    }
    const heading = screen.getByRole("heading", { level: 2, name: "Services" });
    expect(heading.className).toContain("text-section-compact");
  });
});
