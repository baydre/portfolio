/**
 * Work index.
 *
 * Source: the HomePage snippet's Work frame (2562px), which shows four entries
 * numbered `01`–`04`.
 *
 * PROVISIONAL — one entry, not four.
 * All four cards in the design carry the SAME title ("IdCardify"), the SAME
 * summary paragraph, and five stack tiles that all read "React.js" with an
 * identical React glyph. The generated markup contains roughly thirty copies of
 * one SVG path with auto-incremented clip-path ids, which is one component
 * instance duplicated, not thirty distinct technologies. The first card is also
 * missing the "Project code" panel that the other three have, which reads as an
 * authoring slip rather than a featured-card treatment.
 *
 * Reading that as four separate projects would mean inventing three projects,
 * their copy, their stacks and their images. Owner-confirmed 2026-09-26: do not.
 * So the real, single known project is modelled once, flagged `provisional`, and
 * `WorkSection` renders a visible "Provisional" badge for it.
 *
 * This is a DATA change, not a component change: replacing this array with the
 * final four projects requires no edit to `ProjectCard` or the route table.
 *
 * ## SUPERSEDED 2026-09-27 — this is no longer a single entry
 *
 * The array now holds six. The owner supplied five real projects, so the
 * "one known project, do not invent the rest" constraint is satisfied for those
 * five and the `provisional` framing above applies only to IdCardify.
 *
 * One part of that original claim did not survive: `WorkSection` DID change,
 * because the owner asked for the five to auto-rotate while IdCardify stays
 * static. That is a component change on top of the data change, and it is
 * recorded in `docs/INTERACTION_SPEC.md` §4.3, which had argued against exactly
 * this carousel until the request made it explicit.
 */

import type { Project } from "./types";

/**
 * The single project recoverable from the design.
 *
 * `id` is derived from the design's own title so the URL is meaningful without
 * inventing a slug.
 */
const idCardify: Project = {
  id: "idcardify",
  title: "IdCardify",
  category: "Product",
  /**
   * Transcribed verbatim from the Project card snippet, including its first
   * person voice — the design's own words, not a paraphrase.
   */
  summary:
    "idCardify is a digital identity platform that helps organizations create, manage, and verify digital ID cards using QR codes. I worked on the product experience across identity management, QR verification, and administrative workflows.",
  /**
   * The design's "Built with" panel shows FIVE tiles, all labelled "React.js",
   * with identical glyphs — laid out three in the first row and two in the
   * second. This models that literally.
   *
   * It is a Figma placeholder of the same kind as the four identical project
   * cards and the three identical social tiles elsewhere in the design, and it
   * is kept as drawn for two reasons. Modelling it literally is what makes the
   * panel's authored geometry real: the tile row is `flex: 1 1 0` per tile, so a
   * single entry grows to 100% of the panel and renders as one 595px bar with a
   * 32px icon in the middle, which is not a tile. And repeating a *label*
   * fabricates no technical claim, unlike inventing "TypeScript, Tailwind,
   * Node" — which would be asserting things about someone else's product.
   *
   * Replace wholesale with the real stack; the panel needs no code change.
   */
  stack: ["React.js", "React.js", "React.js", "React.js", "React.js"],
  /**
   * OPTIONAL and currently absent. The design shows a code panel on cards
   * `02`–`04` but not `01`, and the sample it shows is the same dummy
   * `function greet(name: string)` snippet on each. A real excerpt has not been
   * supplied, so the card renders without the panel. See `Project.codeSample`.
   *
   * Provisional because the design repeats this one project across all four
   * cards with identical copy and an all-React.js stack; real case studies have
   * not been supplied. (This used to be a `provisionalReason` string feeding the
   * Provisional pill's tooltip. The pill is removed at the owner's request, so
   * the reason lives here instead of in a field nothing renders.)
   */
  provisional: true,
};

/**
 * The five rotating projects, added 2026-09-27.
 *
 * Every field here is real and traceable, which is why these entries look
 * thinner than IdCardify's and why that is correct rather than unfinished:
 *
 * - `summary` is each repository's OWN GitHub description, verbatim. Not a
 *   paraphrase and not a case study. Writing three sentences of marketing around
 *   "A Backend Service for Digital Wallet Management" would mean inventing
 *   architecture, users and outcomes that nobody has stated. The frame's card
 *   expects a paragraph; these deliver the sentence that actually exists.
 * - `stack` holds only what the repository states — its detected language, plus
 *   technologies the description names in prose. No inferred frameworks.
 * - `repositoryUrl` is the real URL, verified public on 2026-09-27.
 *
 * None of these is `provisional`. That flag means "placeholder content" — it is
 * set on IdCardify because its stack is five copies of "React.js", a Figma
 * placeholder. These have real copy, so flagging them would misreport them as
 * unfinished. What they DO lack is `image` and `detail`, and that is a shared
 * gap affecting all six equally: the design's four work images were never
 * supplied, and the Product Page was never designed. See §9.
 */

/**
 * `baydre/securepay-wallet` — Python, MIT, last pushed 2025-12-19.
 * No topics, so the stack is the language alone rather than a guess.
 */
const securepayWallet: Project = {
  id: "securepay-wallet",
  title: "securepay-wallet",
  category: "Backend",
  summary: "A Backend Service for Digital Wallet Management",
  stack: ["Python"],
  repositoryUrl: "https://github.com/baydre/securepay-wallet",
};

/**
 * `baydre/SecureBridge` — Python, last pushed 2025-12-09. Topics are
 * `api-service`, `authentication-service`, `backend`, which describe the shape
 * of the thing rather than naming a technology, so they inform `category` and
 * are not rendered as tiles.
 */
const secureBridge: Project = {
  id: "securebridge",
  title: "SecureBridge",
  category: "Authentication",
  summary: "Dual Authentication System for Users and Services",
  stack: ["Python"],
  repositoryUrl: "https://github.com/baydre/SecureBridge",
};

/**
 * `baydre/network-in-a-box` — Python, last pushed 2025-11-12. Linux is in the
 * stack because the repository's own description ends "on Linux", not because
 * it was inferred from the account.
 */
const networkInABox: Project = {
  id: "network-in-a-box",
  title: "network-in-a-box",
  category: "Networking",
  summary: "Virtual Private Cloud (VPC) on Linux",
  stack: ["Python", "Linux"],
  repositoryUrl: "https://github.com/baydre/network-in-a-box",
};

/**
 * `baydre/blue-green-deployment-strategy` — Shell, MIT, last pushed
 * 2026-01-15, the owner's most recently touched of the five.
 *
 * The owner first listed this as "BG-Deployment-Strategy" and confirmed it is
 * this repository, so the repository name is used verbatim as the title rather
 * than the abbreviation. NGINX and Docker are in the stack because the
 * description names both by name.
 */
const blueGreenDeployment: Project = {
  id: "blue-green-deployment-strategy",
  title: "blue-green-deployment-strategy",
  category: "DevOps",
  summary:
    "Zero-downtime Blue/Green deployment using Nginx as an intelligent reverse proxy and Docker Compose for service orchestration.",
  stack: ["Shell", "NGINX", "Docker"],
  repositoryUrl: "https://github.com/baydre/blue-green-deployment-strategy",
};

/**
 * The owner's Ansible deployment work. **A GitHub Gist, not a repository** —
 * `repositoryUrl` carries the gist URL because that is where it lives, and the
 * field is documented as "external repository, if public" rather than
 * "git remote".
 *
 * The summary is the OWNER's own description, supplied 2026-07 in response to a
 * question, and is used verbatim. Note the divergence worth flagging: the gist
 * itself is titled "Beginner's Guide to Multi-Environment Application Deployment
 * with Ansible" and contains a single Markdown file, so the gist reads as a
 * written guide while the owner's description describes a deployable system.
 * Both statements are the owner's; neither is invented here, and the owner's
 * framing is the one shown.
 */
const ansibleDeployment: Project = {
  id: "ansible-deployment",
  title: "Ansible Deployment",
  category: "DevOps",
  summary:
    "An automated deployment system using Ansible that can deploy an application to both staging and production environments.",
  stack: ["Ansible"],
  repositoryUrl:
    "https://gist.github.com/baydre/7f8c53616bea8887603f3733a3d4c382",
};

export const projects: Project[] = [
  idCardify,
  securepayWallet,
  secureBridge,
  networkInABox,
  blueGreenDeployment,
  ansibleDeployment,
];

/**
 * Look up one project for the detail route.
 *
 * Returns `undefined` for an unknown id so the route can render a not-found
 * state. The previous site linked all six cards to the same id, so this
 * distinction is load-bearing.
 */
export const findProject = (id: string): Project | undefined =>
  projects.find((project) => project.id === id);
