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
 * The design supplies FOUR underlined rows of placeholder text and a chevron. It
 * supplies no submit control, no field elements, and no labels — the placeholder
 * is doing the label's job, which fails WCAG 2.2 AA 3.3.2 (Labels or
 * Instructions) and leaves the form unusable with a screen reader, since a bare
 * placeholder is not an accessible name.
 *
 * Owner-confirmed 2026-09-26:
 * - visible labels, placeholders as supplementary guidance only
 * - real `idle → submitting → success | error`, never a fake success
 * - Formspree behind a `ContactTransport` interface (see src/lib/contact/)
 *
 * Deviations from the snippet, all required for the form to be a form:
 * - `<label>` + `aria-describedby` for the hint, instead of placeholder-as-label
 * - a real `<select>` for the topic, instead of a bare chevron
 * - a submit button, which the snippet omits entirely
 * - `aria-live` status regions, so a state change is announced
 * - the label reads "What are you working on?" (owner correction of the
 *   snippet's "What are your working on?")
 *
 * Validation is intentionally local and minimal: required-ness and an email
 * shape check. Client-side validation exists to give fast feedback, not to be the
 * authority — the transport re-validates server-side and its per-field errors are
 * merged back in.
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

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex flex-col gap-8 ${className ?? ""}`}>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-name`} className="text-caption text-foreground">
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
          className="h-auto rounded-none border-0 border-b border-field-border bg-transparent px-0 py-3 text-body placeholder:text-field-placeholder focus-visible:border-field-chevron focus-visible:ring-0"
        />
        {fieldErrors.name ? (
          <p id={`${uid}-name-error`} className="text-caption text-destructive">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-email`} className="text-caption text-foreground">
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
          className="h-auto rounded-none border-0 border-b border-field-border bg-transparent px-0 py-3 text-body placeholder:text-field-placeholder focus-visible:border-field-chevron focus-visible:ring-0"
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
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-topic`} className="text-caption text-foreground">
          What are you working on?
        </Label>
        <div className="relative">
          <select
            id={`${uid}-topic`}
            name="topic"
            required
            defaultValue=""
            aria-invalid={fieldErrors.topic ? true : undefined}
            aria-describedby={describedBy("topic")}
            className="h-auto w-full appearance-none rounded-none border-0 border-b border-field-border bg-transparent px-0 py-3 pr-8 text-body text-foreground outline-none focus-visible:border-field-chevron [&:invalid]:text-field-placeholder"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23adabc3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
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
        </div>
        {fieldErrors.topic ? (
          <p id={`${uid}-topic-error`} className="text-caption text-destructive">
            {fieldErrors.topic}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${uid}-message`} className="text-caption text-foreground">
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
          className="resize-y rounded-none border-0 border-b border-field-border bg-transparent px-0 py-3 text-body placeholder:text-field-placeholder focus-visible:border-field-chevron focus-visible:ring-0"
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
        `text-cta` is deliberately NOT used for the label size, even though
        `--text-cta` is 0.875rem — the same as the variant's `text-sm`. Passing
        `text-cta` breaks the button: tailwind-merge cannot tell a custom
        `--text-*` font-size token from a `text-*` colour utility, so it resolves
        `text-cta` against *both* groups and, being last, drops the variant's
        `text-primary-foreground` along with the earlier `text-sm`. The label is
        then left with no colour of its own and inherits `--foreground`
        (#e9e9ec) on the `--primary` (#e9e9ec) fill — invisible, while every
        assertion about the button still passes. `HireMeButton` hit this exact
        bug; see its comment. Take the size from the variant's `text-sm` and
        only the authored `leading-cta` from a token.
      */}
      <Button
        type="submit"
        disabled={submitting}
        className="h-auto w-fit rounded-full px-8 py-3 leading-cta"
      >
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
