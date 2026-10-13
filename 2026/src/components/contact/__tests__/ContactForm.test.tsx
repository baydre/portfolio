import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { twMerge } from "tailwind-merge";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ContactForm } from "../ContactForm";
import { ContactSection } from "../ContactSection";
import { TransportError, type ContactFields, type ContactResult, type ContactTransport } from "../../../lib/contact/types";

/**
 * The contact form's state machine.
 *
 * AGENTS.md §4: "Never fake functionality. A contact form that does not send is
 * not a contact form. Model the real state machine (idle → submitting → success
 * → error) and report honestly when a backend is missing."
 *
 * These tests use a stub transport, so they assert the UI never claims success
 * unless the transport confirms it. The transport's own HTTP handling is covered
 * separately in `formspree.test.ts`.
 */

function makeTransport(
  result: ContactResult | Error,
  { configured = true }: { configured?: boolean } = {},
): ContactTransport & { submit: ReturnType<typeof vi.fn> } {
  return {
    name: "Stub",
    configured,
    submit: vi.fn(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
}

/** Fills every field the design specifies. */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/your name/i), "Ada Lovelace");
  await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
  await user.type(screen.getByLabelText(/tell me a little/i), "A small analytics tool.");
  // The topic is a native <select>, so `selectOptions` is the right driver.
  // One of the eight owner-aligned options (2026-10-13).
  await user.selectOptions(
    screen.getByLabelText(/what are you working on/i),
    "Backend & API Engineering",
  );
}

describe("ContactForm", () => {
  it("gives every field an accessible name, hidden per the snippet's placeholder-only rows", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);

    // Owner decision 2026-10-08: the visible label duplicated the placeholder,
    // so the rows are placeholder-only. The label survives as `sr-only`, which
    // keeps WCAG 3.3.2's programmatic label and the accessible name (both
    // asserted via getByLabelText) wired without putting pixels back.
    const name = screen.getByLabelText(/your name/i);
    const email = screen.getByLabelText(/email address/i);
    const topic = screen.getByLabelText(/what are you working on/i);
    const message = screen.getByLabelText(/tell me a little/i);

    for (const control of [name, email, topic, message]) {
      const label = Array.from(document.querySelectorAll("label")).find(
        (el) => el.getAttribute("for") === control.id,
      );
      expect(label).toBeDefined();
      expect(label?.className).toContain("sr-only");
    }
  });

  it("carries the visible cue in the placeholders, verbatim from the snippet", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);

    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Tell me a little about your project"),
    ).toBeInTheDocument();
    // The topic's placeholder copy is the <select>'s placeholder option.
    expect(
      screen.getByRole("option", { name: "What are you working on?" }),
    ).toBeInTheDocument();
  });

  it("uses the corrected topic label, not the snippet's wording", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);
    expect(screen.getByLabelText(/what are you working on\?/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/what are your working on/i)).toBeNull();
  });

  it("does not submit an incomplete form, and reports each missing field", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: true });
    render(<ContactForm transport={transport} />);

    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/tell me a little about the project/i)).toBeInTheDocument();
    // Local pre-flight: no pointless round trip.
    expect(transport.submit).not.toHaveBeenCalled();
  });

  it("rejects a malformed email before sending", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: true });
    render(<ContactForm transport={transport} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.type(screen.getByLabelText(/tell me a little/i), "Hello.");
    await user.selectOptions(
      screen.getByLabelText(/what are you working on/i),
      "AI & Automation",
    );
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(transport.submit).not.toHaveBeenCalled();
  });

  it("passes the four fields through to the transport", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: true });
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    await waitFor(() => expect(transport.submit).toHaveBeenCalledTimes(1));
    expect(transport.submit).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ContactFields>>({
        name: "Ada Lovelace",
        email: "ada@example.com",
        topic: "Backend & API Engineering",
        message: "A small analytics tool.",
      }),
    );
  });

  it("shows a submitting state while in flight, then success on confirmation", async () => {
    const user = userEvent.setup();
    let release: (value: ContactResult) => void = () => {};
    const transport: ContactTransport = {
      name: "Stub",
      configured: true,
      submit: vi.fn(() => new Promise<ContactResult>((resolve) => (release = resolve))),
    };
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    // In flight: label changes, button disabled, no success yet.
    const button = await screen.findByRole("button", { name: /sending/i });
    expect(button).toBeDisabled();
    expect(screen.queryByText(/message sent/i)).toBeNull();

    release({ ok: true });

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
  });

  it("surfaces a transport-reported failure and does NOT claim success", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: false, message: "The form service is unavailable." });
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(
      await screen.findByText(/the form service is unavailable/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/message sent/i)).toBeNull();
  });

  it("surfaces a thrown transport error instead of swallowing it", async () => {
    const user = userEvent.setup();
    const transport = makeTransport(new TransportError("Could not reach the form service."));
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(await screen.findByText(/could not reach the form service/i)).toBeInTheDocument();
    expect(screen.queryByText(/message sent/i)).toBeNull();
  });

  it("maps per-field errors from the transport onto the right inputs", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({
      ok: false,
      message: "Some details were rejected.",
      fieldErrors: { email: "That domain is not accepted." },
    });
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    const email = await screen.findByLabelText(/email address/i);
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByText(/that domain is not accepted/i)).toBeInTheDocument();
  });

  /**
   * The load-bearing case. An unconfigured build must not be able to reach the
   * success state by any route, because nothing is actually sent.
   */
  it("explains itself and offers email when no endpoint is configured", () => {
    render(<ContactForm transport={makeTransport({ ok: true }, { configured: false })} />);
    expect(screen.getByText(/not connected yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /baydreafrica@gmail.com/i })).toBeInTheDocument();
  });

  it("allows retrying after a failure", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: false, message: "Try again." });
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /^submit$/i }));
    await screen.findByText(/try again/i);

    // Back to idle, with the send affordance restored.
    expect(screen.getByRole("button", { name: /^submit$/i })).toBeEnabled();
  });
});

/**
 * The submit button's appearance. Rest and hover each carry their own colour
 * pair: the shadcn `default` variant supplies `text-primary-foreground` on the
 * lime fill (the same dark-on-light pair as "Let's Build"), and the hover is
 * the owner-requested darker lime `--lime-hover` (2026-10-08). These assert
 * the class list itself, because the old failure mode — the `text-cta` trap —
 * rendered the label invisible on a same-coloured fill while every behavioural
 * test still passed. `HireMeButton` hit the identical bug; see `ContactForm.tsx`
 * and `HireMeButton.tsx`.
 */
describe("ContactForm submit button appearance", () => {
  function sendButton() {
    render(<ContactForm transport={makeTransport({ ok: true })} />);
    return screen.getByRole("button", { name: /^submit$/i });
  }

  it("is labelled 'Submit' per the 2026-10-08 design, not 'Send message'", () => {
    expect(sendButton().textContent).toBe("Submit");
  });

  it("fills with the design's lime and keeps a dark label", () => {
    const classes = sendButton().className.split(/\s+/);

    // #131417 label on a #c7f464 fill — the same 14.52:1 pair as "Let's Build".
    expect(classes).toContain("text-primary-foreground");
    expect(classes).toContain("bg-lime-300");
    expect(classes).not.toContain("bg-primary");
  });

  it("hovers to the darker lime the owner asked for (2026-10-08)", () => {
    const classes = sendButton().className.split(/\s+/);

    // `--lime-hover` (#A9CF55) replaced both the old rest-colour hover and the
    // variant's hover:bg-primary/90. The label's 10.34:1 on it is gated in
    // verify-contrast.mjs.
    expect(classes).toContain("hover:bg-lime-hover");
    expect(classes).not.toContain("hover:bg-primary/90");
    expect(classes).not.toContain("hover:bg-lime-300");
  });

  it("does not let a custom --text-* size token displace the colour", () => {
    const classes = sendButton().className.split(/\s+/);

    // `--text-cta` is the same 0.875rem as the variant's `text-sm`, so passing
    // it bought nothing and cost the colour.
    expect(classes).not.toContain("text-cta");
    expect(classes).toContain("text-sm");
  });

  it("is the snippet's 36px-block geometry, not the old rounded pill", () => {
    const classes = sendButton().className.split(/\s+/);

    // The 2026-10-08 snippet: `px-4 py-2` with `text-sm leading-5` forms a 36px
    // block; the radius is the variant's `rounded-md` (8px — the snippet's own
    // `rounded-lg` would resolve to 12px via theme.css, same as HireMeButton).
    expect(classes).toContain("h-auto");
    expect(classes).toContain("w-fit");
    expect(classes).toContain("px-4");
    expect(classes).toContain("font-semibold");
    expect(classes).toContain("leading-5");
    expect(classes).toContain("rounded-md");
    expect(classes).not.toContain("rounded-lg");
    expect(classes).not.toContain("rounded-full");
    expect(classes).not.toContain("px-8");
  });

  it("reproduces the same merge tailwind-merge would compute", () => {
    const merged = twMerge(
      "text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-9 px-4 py-2",
      "h-auto w-fit bg-lime-300 hover:bg-lime-hover font-semibold leading-5",
    );

    expect(merged).toContain("text-primary-foreground");
    expect(merged).toContain("text-sm");
    expect(merged).toContain("bg-lime-300");
    expect(merged).toContain("hover:bg-lime-hover");
    expect(merged).not.toContain("bg-primary");
    expect(merged).not.toContain("hover:bg-primary/90");
    expect(merged).not.toContain("hover:bg-lime-300");
  });
});

/**
 * The 2026-10-08 snippet's form geometry, asserted against the rendered tree so
 * none of it can drift back to the previous per-control underline rows: the
 * form pinned to 732px, rows `self-stretch p-6 border-b border-field-border`
 * with the underline ON THE ROW, a single 16px line of row text (`leading-4`),
 * and the snippet's 18px chevron.
 */
describe("ContactForm row geometry", () => {
  function fieldRow(control: HTMLElement): HTMLElement {
    let node: HTMLElement | null = control;
    while (node && !node.className.includes("border-field-border")) {
      node = node.parentElement;
    }
    expect(node).not.toBeNull();
    return node as HTMLElement;
  }

  it("pins the form to the snippet's 732px width, also filling below it", () => {
    const { container } = render(
      <ContactForm transport={makeTransport({ ok: true })} />,
    );
    const form = container.querySelector("form") as HTMLFormElement;

    expect(form.className).toContain("w-full");
    expect(form.className).toContain("max-w-[732px]");
    // Rows are separated by the form's own gap-8, per the snippet.
    expect(form.className).toContain("gap-8");
  });

  it("draws the underline on each row, in p-6 padding, with focus on the row", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);

    for (const control of [
      screen.getByLabelText(/your name/i),
      screen.getByLabelText(/email address/i),
      screen.getByLabelText(/what are you working on/i),
      screen.getByLabelText(/tell me a little/i),
    ]) {
      const row = fieldRow(control);
      expect(row.className).toContain("self-stretch");
      expect(row.className).toContain("p-6");
      expect(row.className).toContain("border-b");
      expect(row.className).toContain("border-field-border");
      // Focus lights the row's border, not the control's.
      expect(row.className).toContain("focus-within:border-field-chevron");
      expect(control.className).not.toContain("border-field-border");
    }
  });

  it("uses the snippet's 18px chevron in the field-chevron stroke colour", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);

    const select = screen.getByLabelText(
      /what are you working on/i,
    ) as HTMLSelectElement;
    const url = select.style.backgroundImage;

    expect(url).toContain("width='18'");
    expect(url).toContain("height='18'");
    expect(url).toContain("viewBox='0 0 18 18'");
    expect(url).toContain("stroke='%23adabc3'");
    expect(url).toContain("stroke-width='1.50001'");
    expect(url).toContain("M3.75 6.375L9.00004 11.625L14.2501 6.375");
  });
});

/**
 * The design's Contact frame sets the line under the 96px heading
 * `text-gray-200`, which in this design is #E9E9EC — Tailwind's own gray-200
 * (#e5e7eb) is not what Figma emitted. `ContactSection` had it on
 * `text-muted-foreground` (#A8A7B0) while the Work section description had
 * already been corrected to #E9E9EC from the Work frame's authored raw CSS, so
 * the two section intros disagreed. Pinned here so they cannot drift again.
 */
describe("ContactSection intro colour", () => {
  it("states the intro at full foreground, like the Work description", () => {
    render(
      <MemoryRouter>
        <ContactSection blurb={{ lead: "Lead.", duration: "24–48 hours." }} />
      </MemoryRouter>,
    );
    const section = screen.getByRole("region", { name: /turn the next idea/i });
    const intro = Array.from(section.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").startsWith("Have a project in mind?"),
    );

    expect(intro).toBeDefined();
    expect(intro?.className).toContain("text-foreground");
    expect(intro?.className).not.toContain("text-muted-foreground");
  });

  it("states the intro verbatim, not the superseded 177-character paragraph", () => {
    const intro = contactIntro();

    // The frame's own sentence. The superseded copy shared only the first 24
    // characters ("Have a project in mind? "), so a startsWith() check would
    // have passed against the wrong string; the tail is what distinguishes them.
    expect(intro).toBe(
      "Have a project in mind? Tell me what you're working on, what you need, and where you'd like to take it.",
    );
    expect(intro).not.toContain("Let's talk about it");
    expect(intro).not.toContain("Every project starts with a conversation");
  });
});

/** The paragraph under the 96px heading — `contactIntro`, verbatim. */
function contactIntro(): string {
  render(
    <MemoryRouter>
      <ContactSection blurb={{ lead: "Lead.", duration: "24–48 hours." }} />
    </MemoryRouter>,
  );
  const section = screen.getByRole("region", { name: /turn the next idea/i });
  return (
    Array.from(section.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").startsWith("Have a project in mind?"),
    )?.textContent ?? ""
  );
}

/**
 * The Contact header block is two lines and they are NOT one family.
 *
 * The 96px statement is `font-heading` (Outfit) — owner decision 2026-09-26,
 * overriding the frame, which specifies Jura. At 96px Jura read as an outlier
 * against every other subheading on the site (the ProjectCard title, the
 * Services card titles, "Let's talk", the form's own heading), all of which are
 * `font-heading`.
 *
 * The line under it is `font-sans` (Jura), as the frame specifies and as the two
 * neighbouring sections' descriptions resolve to.
 *
 * An intermediate pass set BOTH lines to `font-heading`, from reading "the
 * subheading font like in the others" as the <h3> utility. That was wrong: the
 * others' *descriptions* are Jura. Corrected, and the description test below now
 * asserts the opposite of what it asserted then.
 *
 * The statement's family is deliberately NOT set in the `--font-heading` token,
 * because one value there re-skins the Work, Services and footer headings too.
 * The last describe block is the guard on that.
 */
describe("ContactSection header typography", () => {
  function header() {
    render(
      <MemoryRouter>
        <ContactSection blurb={{ lead: "Lead.", duration: "24–48 hours." }} />
      </MemoryRouter>,
    );
    const section = screen.getByRole("region", { name: /turn the next idea/i });
    const h2 = section.querySelector("h2") as HTMLElement;
    const p = Array.from(section.querySelectorAll("p")).find((el) =>
      (el.textContent ?? "").startsWith("Have a project in mind?"),
    ) as HTMLElement;
    return { h2, p };
  }

  it("sets the 96px statement in the subheading family, not the frame's Jura", () => {
    const { h2 } = header();

    expect(h2.className).toContain("font-heading");
    expect(h2.className).not.toContain("font-sans");
  });

  it("sets the description in Jura, like the frame and the other sections", () => {
    const { p } = header();

    // `SectionIntro`'s description carries no font class and inherits Jura; this
    // is the same family, stated explicitly rather than relied on via <body>.
    expect(p.className).toContain("font-sans");
    expect(p.className).not.toContain("font-heading");
  });

  it("splits the block across two families, deliberately", () => {
    const { h2, p } = header();

    // The frame puts both lines in one family; the owner decision splits them.
    // Asserted so the split is a recorded choice rather than an accident.
    const family = (el: HTMLElement) => el.className.match(/font-[a-z]+/)?.[0];
    expect(family(h2)).toBe("font-heading");
    expect(family(p)).toBe("font-sans");
  });

  it("leaves the single line uncapped, so it cannot wrap at the design width", () => {
    const { p } = header();

    // `max-w-prose` capped the measure at ~811px (65ch) and wrapped a line the
    // frame draws as ONE. Uncapped the sentence is ~1170px and fits the 1272px
    // container at 1440. Any width cap here reintroduces the wrap.
    expect(p.className).not.toMatch(/max-w-/);
    expect(p.className).not.toContain("prose");
  });

  it("keeps the frame's 12px gap between the two lines", () => {
    const { p } = header();

    // The frame's `gap-3`. `mt-3` is 0.75rem; `mt-8` was 2rem.
    expect(p.className).toContain("mt-3");
    expect(p.className).not.toContain("mt-8");
  });
});

/**
 * The scoping guard. `--font-heading` must still resolve to Outfit and must
 * still be the family on every other heading — if the Contact statement's
 * family were ever set by editing the token, these fail.
 */
describe("--font-heading is not re-skinned for the Contact statement", () => {
  it("still declares Outfit, not Jura, in the token itself", () => {
    const theme = readFileSync("src/styles/theme.css", "utf8");
    const token = theme.match(/--font-heading:\s*([^;]+);/)?.[1] ?? "";

    expect(token).toContain("Outfit");
    expect(token).not.toContain("Jura");
  });
});

/**
 * All three section descriptions now share one size. The Work and Services
 * descriptions were moved to `text-description` (20px) on owner request; the
 * contact intro was still `text-lead` (24px), so the three sections disagreed
 * about the same design role. Owner request 2026-09-26.
 *
 * A bonus effect, in the frame's favour: at 20px the sentence is ~975px rather
 * than ~1170px, so the single-line property has more headroom against the
 * 1272px container.
 */
describe("Contact intro matches the other section descriptions", () => {
  it("uses the shared 20px/40px description pairing", () => {
    render(
      <MemoryRouter>
        <ContactSection blurb={{ lead: "Lead.", duration: "24–48 hours." }} />
      </MemoryRouter>,
    );
    const section = screen.getByRole("region", { name: /turn the next idea/i });
    const intro = Array.from(section.querySelectorAll("p")).find((p) =>
      (p.textContent ?? "").startsWith("Have a project in mind?"),
    );

    // Exactly what `SectionIntro` puts on the Work and Services descriptions.
    expect(intro?.className).toContain("text-description");
    expect(intro?.className).toContain("leading-description");
    expect(intro?.className).not.toContain("text-lead");
    expect(intro?.className).not.toContain("leading-lead");
  });
});
