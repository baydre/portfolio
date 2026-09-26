/**
 * Contact transport selection.
 *
 * This is the ONLY module that knows which transport is in use. Swapping
 * Formspree for a personal API is a change to this file alone — the form
 * component depends on `ContactTransport` and never on a provider.
 *
 * Owner-confirmed 2026-09-26: Formspree initially, no custom backend, and
 * `mailto:` must not be the primary mechanism.
 */

import { FormspreeTransport } from "./formspree";
import type { ContactTransport } from "./types";

/**
 * The Formspree form ID, e.g. `xpwzgkry`.
 *
 * Read from the environment rather than committed: it identifies an inbox, and an
 * unconfigured build must fail honestly rather than post somewhere unintended.
 * See `.env.example`.
 */
const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim() ?? "";

export const contactTransport: ContactTransport = new FormspreeTransport(formId);
