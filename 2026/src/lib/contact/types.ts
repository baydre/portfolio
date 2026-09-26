/**
 * Contact form contract.
 *
 * The transport is an interface, not a Formspree call, so the UI is written once
 * and the delivery mechanism can be swapped without touching a component.
 * Owner-confirmed 2026-09-26: Formspree initially, with a personal API later
 * requiring no UI rewrite.
 *
 * See docs/INTERACTION_SPEC.md §4 for the state machine this drives.
 */

/**
 * Form lifecycle.
 *
 * `idle → submitting → success | error`, and `error → idle` on retry. There is
 * deliberately no `success → idle` auto-reset: a success state that silently
 * clears itself is indistinguishable from a form that never sent.
 */
export type ContactStatus = "idle" | "submitting" | "success" | "error";

/** What the form collects. Matches the four fields in the design. */
export interface ContactFields {
  /** "Your Name" */
  name: string;
  /** "Email Address" */
  email: string;
  /** "What are you working on?" — a service/topic selection. */
  topic: string;
  /** "Tell me a little about your project" */
  message: string;
  /**
   * Honeypot. Must stay empty; a filled value means a bot submitted the form.
   * Kept in the payload shape so every transport receives it.
   */
  company?: string;
}

/** Per-field messages, keyed by `ContactFields` key. */
export type FieldErrors = Partial<Record<keyof ContactFields, string>>;

/**
 * Outcome of one submission attempt.
 *
 * A discriminated union so no caller can read `message` off a success or ignore
 * an error — the exhaustive `switch` in the form is the point.
 */
export type ContactResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

/**
 * A delivery mechanism.
 *
 * Implementations must never resolve `{ ok: true }` unless the remote service has
 * confirmed receipt. Returning success on a network failure is the single
 * failure mode this interface exists to make hard to write.
 */
export interface ContactTransport {
  /** Identifies the mechanism in diagnostics, e.g. "Formspree". */
  readonly name: string;
  /**
   * False when no endpoint is configured. The form uses this to refuse
   * submission up front and say so, instead of failing opaquely at send time.
   */
  readonly configured: boolean;
  submit(fields: ContactFields): Promise<ContactResult>;
}

/** Thrown by transports for unexpected conditions (network, malformed JSON). */
export class TransportError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TransportError";
  }
}
