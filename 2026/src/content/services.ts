import type { SecondaryService, Service } from "./types";

/**
 * The six primary services.
 *
 * Source: the HomePage snippet's Services frame — 1440 × 1962, a 3 × 2 grid with a
 * 1px rule between the two rows. The **layout** is still the frame's and is
 * unchanged: two rows of three, the 48px gaps, and the `border-r` divider on every
 * card but the last in its row.
 *
 * The **content is no longer the frame's.** All six titles and descriptions below
 * are **OWNER-SUPPLIED, 2026-09-27**, replacing the frame's six titles and their
 * verbatim descriptions in one pass:
 *
 * | Was (frame)                    | Is (owner copy)                      |
 * | ------------------------------ | ------------------------------------ |
 * | `01` Web Design                | `01` Custom Software Development     |
 * | `02` Web Development           | `02` Backend & API Engineering       |
 * | `03` Brand Development         | `03` MVP & SaaS Development          |
 * | `04` Technical Writing         | `04` DevOps & Application Deployment |
 * | `05` Consultation Services     | `05` AI & Automation                 |
 * | `06` Marketing Services        | `06` IoT & Embedded Prototyping      |
 *
 * The `01`–`06` labels are unchanged and still content, not array position — the
 * Work section shares the motif at `01`–`04`. The `//` prefix the frame draws is
 * still dropped, on owner request 2026-09-26, from every number on the site.
 *
 * Descriptions are transcribed verbatim from the owner's message, including the
 * `and`/`&` punctuation and the capitalisation of "Raspberry Pi/Arduino". None
 * were rewritten, and the owner's wording is not marketing-invented: it reads as
 * a list of deliverables rather than as a promise, which is the point.
 */
export const services: Service[] = [
  {
    index: "01",
    title: "Custom Software Development",
    description:
      "Full-stack web applications, backend systems, APIs, dashboards and internal tools.",
  },
  {
    index: "02",
    title: "Backend & API Engineering",
    description:
      "Python/Django, REST APIs, PostgreSQL, authentication, integrations and business logic.",
  },
  {
    index: "03",
    title: "MVP & SaaS Development",
    description:
      "Technical planning, architecture, development and deployment of MVPs and SaaS products.",
  },
  {
    index: "04",
    title: "DevOps & Application Deployment",
    description:
      "VPS deployment, Docker, NGINX, CI/CD, staging environments, SSL and production setup.",
  },
  {
    index: "05",
    title: "AI & Automation",
    description:
      "AI-powered features, API integrations, workflow automation and intelligent business processes.",
  },
  {
    index: "06",
    title: "IoT & Embedded Prototyping",
    description:
      "IoT systems, Raspberry Pi/Arduino, sensor integration, edge computing and hardware/software prototypes.",
  },
];

/**
 * The two secondary services, rendered as a quieter tier beneath the primary six.
 *
 * **OWNER-SUPPLIED 2026-09-27**, as "Digital Marketing" and "Technical Consulting &
 * Training". They are deliberately NOT in `services` and deliberately NOT in the
 * frame's 3 × 2 grid — see `ServicesSection` for why, and for why they carry no
 * `01`–`06` index.
 *
 * **Both descriptions are `PENDING` from the owner.** The owner supplied titles
 * only. `description` is optional on the type and the section omits the paragraph
 * when empty rather than rendering a placeholder or inventing marketing copy.
 * Do not fill these in without being asked — inventing service copy is worse than
 * publishing none, the same rule that held back the primary descriptions until the
 * owner supplied them.
 */
export const secondaryServices: SecondaryService[] = [
  {
    title: "Digital Marketing",
  },
  {
    title: "Technical Consulting & Training",
  },
];

/**
 * The Services section's own description, beside the heading.
 *
 * Verbatim from the frame. **It is now inconsistent with the six services it
 * introduces** and is left as supplied rather than rewritten, because it is the
 * frame's copy and inventing replacement marketing prose is not this file's call.
 *
 * It still offers "Digital experiences, brands, and technical solutions", and
 * there is no longer a brand or digital-experience service in the list — the six
 * are now software, backend, MVP, DevOps, AI and IoT. Pending an owner decision;
 * see docs/DESIGN_SYSTEM.md §9. Note that the copy problem is confined to this
 * one paragraph: all six card descriptions are owner-supplied and current.
 */
export const servicesSectionDescription =
  "Digital experiences, brands, and technical solutions built with purpose — from the first idea to the final product.";
