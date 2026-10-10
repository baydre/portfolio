import { useId, useState } from "react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
import { Label } from "../../app/components/ui/label";
import { Textarea } from "../../app/components/ui/textarea";
import { contactTopics } from "../../content/profile";
import { contactTransport } from "../../lib/contact";
import type {
  ContactFields,
  ContactStatus,
  ContactTransport,
} from "../../lib/contact/types";

/**
 * The contact form.
 *
 * Source: the owner-supplied contact snippet (2026-10-08) — a 732px-wide form
 * of four full-width rows, each `p-6 border-b` carrying one 16px line of
 * placeholder copy, an 18 × 18 `#ADABC3` chevron on the topic row, and a lime
 * Submit button. The refreshed snippet finally draws a submit control; it still
 * supplies no `<form>`, no field elements and no labels — a placeholder is not
 * an accessible name (WCAG 2.2 AA 3.3.2), so the form being a form happens
 * here.
 *
 * Owner decisions:
 * - 2026-09-26: real `idle → submitting → success | error`, never a fake
 *   success; Formspree behind a `ContactTransport` interface (see
 *   src/lib/contact/).
 * - 2026-10-08: labels leave the screen. The owner judged a visible label
 *   beside its identical placeholder a duplication and dictated "update it to
 *   what we have in the new snippet" — the rows are placeholder-only. This
 *   supersedes the visible-label decision of 2026-09-26. Each label is kept as
 *   `sr-only`, so 3.3.2's programmatic half and every accessible name (4.1.2)
 *   survive; only the pixels are gone, and `getByLabelText` still resolves.
 * - 2026-10-08: the submit control follows the new snippet's design — lime
 *   fill, label "Submit" ("Sending…" in flight). The width `max-w-[732px]` is
 *   the owner's chosen Option A; see `ContactSection`.
 *
 * Deviations from the snippet, all required for the form to be a form:
 * - `sr-only` `<label>` + `aria-describedby` for the hint, instead of
 *   placeholder-as-label
 * - a real `<select>` for the topic, instead of a bare chevron
 * - `aria-live` status regions, so a state change is announced
 * - the topic reads "What are you working on?" (owner correction of the
 *   snippet's "What are your working on?")
 *
 * Rows are transcribed from the snippet: `self-stretch p-6 border-b
 * border-field-border`, `gap-8` between them (the form's own class), with the
 * snippet's `text-base leading-4` — one 16px line — as the row text. The
 * snippet's arithmetic (24 + 16 + 24 = 64px) assumes a row is a bare text
 * line, which no real control can be: with `py-0 leading-4` Chromium collapses
 * the control to a 16px box and clips the text flush to its bottom edge
 * (`overflow: clip` on the native element — caught by screenshot, not by
 * inspection). The controls therefore carry an explicit 24px `h-6` box (the
 * 16px line plus 4px breathing room each side), making the rows 72px.
 * DERIVED. The underline lives on the ROW, so one border serves each
 * label-less row and its error message from inside the same box; focus lights
 * the row's border (`focus-within:border-field-chevron`) because a child
 * cannot restyle its parent's border.
 *
 * Validation is intentionally local and minimal: required-ness and an email
 * shape check. Client-side validation exists to give fast feedback, not to be
 * the authority — the transport re-validates server-side and its per-field
 * errors are merged back in.
 */
export function ContactForm({
  transport = contactTransport,
  className,
}: {
  /**
   * Delivery mechanism. Defaults to the configured transport.
   *
   * Injected rather than imported directly so the state machine can be tested
   * against a stub without mocking the module graph — and so this component is
   * not coupled to Formspree, which is the point of the interface.
   */
  transport?: ContactTransport;
  className?: string;
}) {
  const uid = useId();
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});

  const submitting = status === "submitting";

  if (status === "success") {
    return (
      <div
        // Replaces the form, so focus moves here via the autoFocus below.
        autoFocus
        tabIndex={-1}
        role="status"
        className={`rounded-image border border-panel-border bg-panel p-8 ${className ?? ""}`}
      >
        <h3 className="font-heading text-service leading-service text-foreground">
          Message sent
        </h3>
        <p className="mt-3 text-body leading-body text-panel-foreground">
          Thanks — your message reached the form service and I will reply within
          24–48 hours.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-md"
        >
          Send another message
        </Button>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const fields: ContactFields = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      topic: String(data.get("topic") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""),
    };

    // Local pre-flight. The transport still re-validates; this only avoids a
    // pointless round trip and gives immediate feedback.
    const nextFieldErrors: Partial<Record<keyof ContactFields, string>> = {};
    if (!fields.name.trim()) nextFieldErrors.name = "Enter your name.";
    if (!fields.email.trim()) {
      nextFieldErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }
    if (!fields.topic) nextFieldErrors.topic = "Choose what you are working on.";
    if (!fields.message.trim()) {
      nextFieldErrors.message = "Tell me a little about the project.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Check the highlighted fields.");
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setError(null);
    setStatus("submitting");

    try {
      const result = await transport.submit(fields);

      if (result.ok) {
        // The ONLY path to the success state. Reached solely when the transport
        // confirms receipt.
        form.reset();
        setStatus("success");
        return;
      }

      setFieldErrors(result.fieldErrors ?? {});
      setError(result.message);
      setStatus("error");
    } catch (cause) {
      // TransportError: network failure, no response, unparseable body. Report
      // it as the failure it is; never as a success.
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong sending your message. Please try again.",
      );
      setStatus("error");
    }
  };

  const describedBy = (field: keyof ContactFields) =>
    fieldErrors[field] ? `${uid}-${field}-error` : undefined;

  // The snippet's row text style: `text-base leading-4` — one 16px line.
  // `md:text-body` pins the snippet's 16px against the shadcn primitives' own
  // `md:text-sm` (14px), which would otherwise win at `md` and up by being
  // later in the stylesheet.
  //
  // `h-6` (24px) is the load-bearing part. The snippet measures its rows at
  // 64px on the assumption that a row is a bare 16px text line, but a real
  // control cannot live in a 16px strip: with `py-0 leading-4` (and no
  // height) Chromium collapses the control to a 16px box and clips the
  // option/placeholder text flush to the box's bottom edge (`overflow: clip`
  // on the native control) — observed in a rendered screenshot, bottom gap
  // 0px. `h-6` forces a 24px box on every single-line control: the same 16px
  // line the snippet sets, with 4px of breathing room above and below; rows
  // render 72px instead of 64px. DERIVED.
  const fieldClass =
    "h-6 w-full rounded-none border-0 bg-transparent px-0 py-0 leading-4 text-body placeholder:text-field-placeholder focus-visible:ring-0 md:text-body";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex w-full max-w-[732px] flex-col gap-8 ${className ?? ""}`}
    >
      {/*
        Four rows, transcribed from the 2026-10-08 snippet: each field group is
        `self-stretch p-6 border-b border-field-border` inside the form's own
        `gap-8`. The underline is ON THE ROW, not on the control, so one border
        serves the row and its error message. Focus lights the ROW's border —
        a child cannot restyle a parent's border, and `focus-within` is the only
        mechanism that needs no wrapper per state.
      */}
      <div className="flex flex-col gap-2 self-stretch border-b border-field-border p-6 focus-within:border-field-chevron">
        <Label htmlFor={`${uid}-name`} className="sr-only">
          Your Name
        </Label>
        <Input
          id={`${uid}-name`}
          name="name"
          autoComplete="name"
          required
          placeholder="Your Name"
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={fieldClass}
        />
        {fieldErrors.name ? (
          <p id={`${uid}-name-error`} className="text-caption text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 self-stretch border-b border-field-border p-6 focus-within:border-field-chevron">
        <Label htmlFor={`${uid}-email`} className="sr-only">
          Email Address
        </Label>
        <Input
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email Address"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          className={fieldClass}
        />
        {fieldErrors.email ? (
          <p id={`${uid}-email-error`} className="text-caption text-destructive">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      {/*
        A NATIVE <select>, not the shadcn/Radix Select.

        The design shows an underlined row with placeholder copy and a chevron —
        seven fixed options, no search, no grouping, no multiple selection. A
        native control reproduces that exactly, is keyboard and screen-reader
        correct without ARIA, keeps working with JavaScript disabled, and avoids
        shipping a large composite widget for a fixed list. It also removes a
        jsdom gap (`hasPointerCapture` is unimplemented) that would otherwise
        force a test-environment polyfill for a behaviour jsdom cannot model.

        `appearance-none` drops the OS control; the chevron is a background image
        so it is decorative and carries no accessible text.
      */}
      <div className="flex flex-col gap-2 self-stretch border-b border-field-border p-6 focus-within:border-field-chevron">
        <Label htmlFor={`${uid}-topic`} className="sr-only">
          What are you working on?
        </Label>
        <select
          id={`${uid}-topic`}
          name="topic"
          required
          defaultValue=""
          aria-invalid={fieldErrors.topic ? true : undefined}
          aria-describedby={describedBy("topic")}
          className="h-6 w-full appearance-none rounded-none border-0 bg-transparent px-0 pt-0 pb-1 pr-8 leading-4 text-body text-foreground outline-none focus-visible:ring-0 [&:invalid]:text-field-placeholder"
          style={{
            // The 2026-10-08 snippet's chevron: 18 × 18, path
            // `M3.75 6.375L9.00004 11.625L14.2501 6.375`, stroke #ADABC3,
            // stroke-width 1.50001, round caps/joins — URL-encoded for url().
            // `pr-8` keeps the chosen option clear of it. Same 24px `h-6` box
            // as the text inputs (see `fieldClass`), so the row heights and
            // their underlines align. Unlike an input, Chromium draws the
            // closed select's option text ~3px low inside the box, so the
            // bottom padding (`pt-0 pb-1`) recentres it to the inputs'
            // optical centre (measured: 5.7/4.7px vs the 16px line, matching
            // the inputs' placement).
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18' fill='none' stroke='%23adabc3' stroke-width='1.50001' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.75 6.375L9.00004 11.625L14.2501 6.375'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0 center",
          }}
        >
          <option value="" disabled>
            What are you working on?
          </option>
          {contactTopics.map((topic) => (
            <option key={topic} value={topic} className="bg-background text-foreground">
              {topic}
            </option>
          ))}
        </select>
        {fieldErrors.topic ? (
          <p id={`${uid}-topic-error`} className="text-caption text-destructive">
            {fieldErrors.topic}
          </p>
        ) : null}
      </div>

      {/*
        The message field keeps `text-body`'s normal 1.6 line rhythm (it is a
        multi-line textarea, not the snippet's one-line row text), which the
        snippet says nothing about — DERIVED.
      */}
      <div className="flex flex-col gap-2 self-stretch border-b border-field-border p-6 focus-within:border-field-chevron">
        <Label htmlFor={`${uid}-message`} className="sr-only">
          Tell me a little about your project
        </Label>
        <Textarea
          id={`${uid}-message`}
          name="message"
          required
          rows={4}
          placeholder="Tell me a little about your project"
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          className="h-auto w-full resize-y rounded-none border-0 bg-transparent px-0 py-0 leading-body text-body placeholder:text-field-placeholder focus-visible:ring-0 md:text-body"
        />
        {fieldErrors.message ? (
          <p id={`${uid}-message-error`} className="text-caption text-destructive">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/*
        Honeypot. Hidden from sighted users and from assistive tech, so it cannot
        be tabbed to; a filled value is treated as bot activity by the transport.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/*
        One live region for the whole form. `role="status"` is polite, so a
        failure does not interrupt a screen-reader user mid-sentence.
      */}
      <div role="status" aria-live="polite" className="min-h-6">
        {status === "error" && error ? (
          <p className="text-caption text-destructive">{error}</p>
        ) : null}
      </div>

      {!transport.configured ? (
        <p className="text-caption leading-caption text-footer-label">
          This form is not connected yet. Until it is, please email{" "}
          <a href="mailto:baydreafrica@gmail.com" className="underline underline-offset-4">
            baydreafrica@gmail.com
          </a>
          .
        </p>
      ) : null}

      {/*
        The 2026-10-08 snippet's Submit button. `rounded-md`, `px-4 py-2` and
        `text-sm` come from the shadcn `default` variant, which already matches
        the snippet (theme.css remaps the radius scale, so the snippet's own
        `rounded-lg` class would be 12px — wrong; the same call as
        `HireMeButton`). Ours: the lime fill, the darker-lime hover
        (`--lime-hover` — owner 2026-10-08 asked for "a darker shade for the
        existing button color"), `font-semibold` over the variant's `font-medium`
        and `leading-5` so the label's 20px line makes the button's 36px content
        height with `px-4 py-2`; `w-fit` stops the flex column from stretching
        it.

        `text-cta` must NOT be passed for the label size: tailwind-merge cannot
        tell a custom `--text-*` font-size token from a `text-*` colour utility,
        so being last it would drop the variant's `text-primary-foreground` and
        leave the near-white `--foreground` on the lime fill. Take the size from
        the variant's `text-sm` — `HireMeButton` hit this exact bug; see its
        comment.
      */}
      <Button
        type="submit"
        disabled={submitting}
        className="h-auto w-fit bg-lime-300 hover:bg-lime-hover font-semibold leading-5"
      >
        {submitting ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}