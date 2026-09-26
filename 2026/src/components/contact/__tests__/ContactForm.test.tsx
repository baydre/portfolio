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
  await user.selectOptions(screen.getByLabelText(/what are you working on/i), "Web Development");
}

describe("ContactForm", () => {
  it("labels every field visibly rather than relying on placeholders", () => {
    render(<ContactForm transport={makeTransport({ ok: true })} />);
    // WCAG 3.3.2: a placeholder is not an accessible name.
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what are you working on/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tell me a little/i)).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: /send message/i }));

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
    await user.selectOptions(screen.getByLabelText(/what are you working on/i), "Web Design");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(transport.submit).not.toHaveBeenCalled();
  });

  it("passes the four fields through to the transport", async () => {
    const user = userEvent.setup();
    const transport = makeTransport({ ok: true });
    render(<ContactForm transport={transport} />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(transport.submit).toHaveBeenCalledTimes(1));
    expect(transport.submit).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ContactFields>>({
        name: "Ada Lovelace",
        email: "ada@example.com",
        topic: "Web Development",
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
    await user.click(screen.getByRole("button", { name: /send message/i }));

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
    await user.click(screen.getByRole("button", { name: /send message/i }));

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
    await user.click(screen.getByRole("button", { name: /send message/i }));

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
    await user.click(screen.getByRole("button", { name: /send message/i }));

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
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await screen.findByText(/try again/i);

    // Back to idle, with the send affordance restored.
    expect(screen.getByRole("button", { name: /send message/i })).toBeEnabled();
  });
});

/**
 * The send button's appearance is supplied entirely by the shadcn `default`
 * variant, so nothing about it is visible in this component's own class list.
 * That is how the label went missing: passing `text-cta` made tailwind-merge
 * resolve it against *both* the font-size and text-colour groups and, being
 * last, delete the variant's `text-primary-foreground`. The label then inherited
 * `--foreground` (#e9e9ec) onto a `--primary` (#e9e9ec) fill and rendered
 * invisible — while every behavioural test in this file still passed.
 * `HireMeButton` hit the identical bug; see `ContactForm.tsx` and
 * `HireMeButton.tsx`.
 */
describe("ContactForm send button appearance", () => {
  function sendButton() {
    render(<ContactForm transport={makeTransport({ ok: true })} />);
    return screen.getByRole("button", { name: /send message/i });
  }

  it("keeps the variant's dark-on-light colour pair", () => {
    const classes = sendButton().className.split(/\s+/);

    // #131417 label on a #e9e9ec fill, 15.20:1.
    expect(classes).toContain("text-primary-foreground");
    expect(classes).toContain("bg-primary");
  });

  it("does not let a custom --text-* size token displace the colour", () => {
    const classes = sendButton().className.split(/\s+/);

    // `--text-cta` is the same 0.875rem as the variant's `text-sm`, so passing it
    // bought nothing and cost the colour.
    expect(classes).not.toContain("text-cta");
    expect(classes).toContain("text-sm");
  });

  it("reproduces the same merge tailwind-merge would compute", () => {
    const merged = twMerge(
      "text-sm font-medium bg-primary text-primary-foreground",
      "h-auto w-fit rounded-full px-8 py-3 leading-cta",
    );

    expect(merged).toContain("text-primary-foreground");
    expect(merged).toContain("text-sm");
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
