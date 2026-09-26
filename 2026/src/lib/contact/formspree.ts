/**
 * Formspree transport.
 *
 * Owner-confirmed 2026-09-26 as the initial delivery mechanism. It is
 * deliberately behind the `ContactTransport` interface so that moving to a
 * personal API later is a new file plus a one-line change in `index.ts`.
 *
 * Endpoint: POST https://formspree.io/f/{FORM_ID}
 * Docs:     https://formspree.io/help/#json-form
 *
 * Error mapping, so the UI can show something specific rather than "failed":
 *   400 with `errors[]`  → per-field messages, mapped onto FieldErrors
 *   422                   → Formspree rejected the payload (honeypot, etc.)
 *   429                   → rate limited
 *   5xx / network / JSON → generic failure with a retry affordance
 *
 * Provenance:  IMPLEMENTATION CHOICE (owner-confirmed). Not from the design.
 */

import { TransportError, type ContactFields, type ContactResult, type ContactTransport, type FieldErrors } from "./types";

const ENDPOINT = (formId: string) => `https://formspree.io/f/${formId}`;

/** Formspree's per-field error shape. */
interface FormspreeFieldError {
  field?: string;
  message?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Pull `{ field: message }` pairs out of a Formspree error body.
 *
 * Returns an empty object for any shape it does not recognise rather than
 * guessing — the caller falls back to the status-level message.
 */
const readFieldErrors = (body: unknown): FieldErrors => {
  if (!isRecord(body) || !Array.isArray(body.errors)) return {};
  const out: FieldErrors = {};

  for (const entry of body.errors as FormspreeFieldError[]) {
    const field = entry?.field;
    const message = entry?.message;
    if (typeof field !== "string" || typeof message !== "string") continue;
    // Only keys the form actually has; anything else is provider-internal.
    if (field === "name" || field === "email" || field === "topic" || field === "message") {
      out[field] = message;
    }
  }
  return out;
};

const readMessage = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const { error, message } = body as { error?: unknown; message?: unknown };
  if (typeof error === "string" && error) return error;
  if (typeof message === "string" && message) return message;
  return undefined;
};

export class FormspreeTransport implements ContactTransport {
  readonly name = "Formspree";

  constructor(private readonly formId: string) {}

  get configured(): boolean {
    return this.formId.length > 0;
  }

  async submit(fields: ContactFields): Promise<ContactResult> {
    if (!this.configured) {
      // Refusing here is the whole point of `configured`. A transport with no
      // endpoint must not silently accept input.
      return {
        ok: false,
        message:
          "This form is not connected yet. Add VITE_FORMSPREE_FORM_ID to .env to enable it.",
      };
    }

    // Formspree treats a populated `company` field as bot activity and returns
    // 200 without delivering. Sending it as a normal field is the documented
    // way to get that behaviour.
    let response: Response;
    try {
      response = await fetch(ENDPOINT(this.formId), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...fields, _subject: `Portfolio enquiry: ${fields.topic}` }),
      });
    } catch (cause) {
      throw new TransportError("Could not reach the form service.", cause);
    }

    // A 2xx that is not a parseable object is not a confirmed receipt.
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (response.ok) {
      if (isRecord(body)) return { ok: true };
      // 2xx with an unreadable body: we cannot confirm delivery, so we must not
      // claim success.
      return {
        ok: false,
        message:
          "The form service accepted the request but sent an unreadable response. Your message may not have been recorded — please try again.",
      };
    }

    const fieldErrors = readFieldErrors(body);
    const detail = readMessage(body);

    if (response.status === 429) {
      return {
        ok: false,
        message: "Too many submissions from this address. Please try again in a few minutes.",
      };
    }

    if (response.status === 400 || response.status === 422) {
      return {
        ok: false,
        message: detail ?? "Some details were rejected. Please check the form and try again.",
        ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
      };
    }

    return {
      ok: false,
      message:
        detail ??
        `The form service returned an error (${response.status}). Please try again.`,
    };
  }
}
