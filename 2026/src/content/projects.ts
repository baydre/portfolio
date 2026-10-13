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
 * One part of that original claim did not survive: `WorkSection` DID change.
 * The owner asked for these five to auto-rotate, then corrected the first build
 * to a single slider over all six rather than IdCardify pinned above them. That
 * is a component change on top of the data change, and it is recorded in
 * `docs/INTERACTION_SPEC.md` §4.3, which had argued against exactly this
 * carousel until the request made it explicit.
 */

import type { Project } from "./types";

/**
 * The Work intro's approved copy (OWNER 2026-10-13): a distinct single
 * sentence that introduces the section without claiming agency services.
 * Previously `WorkSection` hardcoded a copy of `profile.description`, so the
 * hero and the section said the same thing twice — the two now differ, and the
 * section reads the content layer rather than an inline literal.
 */
export const workIntro =
  "A selection of software projects, infrastructure experiments, and digital products that reflect how I approach technical problems and turn ideas into working systems.";

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
   * REMOVED 2026-10-13: the design's "Built with" panel shows FIVE tiles, all
   * labelled "React.js" with identical glyphs — a Figma placeholder of the same
   * kind as the four identical project cards. It was kept as drawn so the
   * panel's tile-row geometry was real, but the decision review found that
   * modelling a placeholder as data still shipped "React.js" as an unverified
   * claim about someone else's product. The stack is now EMPTY, and both
   * `ProjectCard` and `ProjectPage` omit the whole panel for an empty stack —
   * the live URL `idCardify-Demo` (owner-confirmed repository NOT yet given) may
   * be linked once it is. Replace `stack` wholesale with the real stack; the
   * panel needs no further code change.
   */
  stack: [],
  /**
   * OPTIONAL and currently absent. The design shows a code panel on cards
   * `02`–`04` but not `01`, and the sample it shows is the same dummy
   * `function greet(name: string)` snippet on each. A real excerpt has not been
   * supplied, so the card renders without the panel. See `Project.codeSample`.
   *
   * Provisional because the design repeats this one project across all four
   * cards with identical copy; real case studies and the repository itself have
   * not been confirmed. (This used to be a `provisionalReason` string feeding
   * the Provisional pill's tooltip. The pill is removed at the owner's request,
   * so the reason lives here instead of in a field nothing renders.)
   */
  provisional: true,
};

/**
 * The five real projects, added 2026-09-27. They sit in the same slider as
 * IdCardify — array order is slide order, and `01`–`06` follow this order.
 *
 * Every field here is real and traceable, which is why these entries look
 * thinner than IdCardify's and why that is correct rather than unfinished:
 *
 * - `summary` (UPGRADED 2026-10-13): the owner's README-grounded description.
 *   The earlier summaries were each repository's own GitHub description
 *   verbatim ("A Backend Service for Digital Wallet Management"). The three-
 *   layer content model the owner set 2026-10-13 replaces those with one-sentence
 *   descriptions of what each project is and does, written from the public
 *   READMEs; `detail.engineering` and `detail.evidence` carry the depth the card
 *   must not. See `docs/DESIGN_SYSTEM.md` §9.
 * - `stack` holds only what the repository states — its detected language, plus
 *   technologies the description names in prose. No inferred frameworks.
 * - `repositoryUrl` is the real URL, verified public on 2026-09-27.
 * - `detail` holds the README-grounded Engineering details and Evidence. Added
 *   2026-10-13 for all five written works; it was absent alongside `image` for
 *   all six before then (the design's four work images were never supplied, and
 *   the Product Page was never designed). See §9.
 *
 * None of these is `provisional`. That flag means "placeholder content" — it is
 * set on IdCardify because its stack is five copies of "React.js", a Figma
 * placeholder. These have real copy, so flagging them would misreport them as
 * unfinished. What they still lack is `image`, and that is a shared gap
 * affecting all six equally.
 */

/**
 * `baydre/securepay-wallet` — Python, MIT, last pushed 2025-12-19.
 * DISPLAY TITLE corrected 2026-10-13 (was the bare repository name); id and
 * repositoryUrl are unchanged. FastAPI was added to the stack on the same pass:
 * the repository's README opens with it by name, so README + detected language
 * both substantiate it — it is no longer "language alone".
 *
 * SUMMARY 2026-10-13: the owner's suggested description, README-grounded — the
 * README's own first line names FastAPI, wallet operations, Paystack, and
 * transactions. `detail.engineering` and `detail.evidence` are built from the
 * README's feature list and project tree; the "production-ready" and
 * zero-downtime claims are recorded as the repository's claims in Evidence,
 * not as observed results.
 */
const securepayWallet: Project = {
  id: "securepay-wallet",
  title: "SecurePay Wallet",
  category: "Backend",
  summary:
    "A digital-wallet API built with FastAPI, supporting authenticated wallet operations, Paystack payment processing, transaction tracking, and permission-based API access.",
  stack: ["Python", "FastAPI"],
  repositoryUrl: "https://github.com/baydre/securepay-wallet",
  detail: {
    engineering: [
      "Dual authentication: Google OAuth 2.0 issues JWT sessions (30-minute expiry) for users, while per-user API keys (up to five) with granular read, deposit and transfer permissions serve programmatic clients.",
      "Deposits are paid through Paystack: webhooks verify an HMAC SHA-512 signature, and processing is idempotent so a replayed event cannot credit a wallet twice.",
      "PostgreSQL with SQLAlchemy, Pydantic v2 validation, bcrypt password hashing, SlowAPI rate limiting, and timezone-aware transactions.",
    ],
    evidence: [
      {
        label: "Project README",
        href: "https://github.com/baydre/securepay-wallet",
        note: "Documents the architecture, the dual-auth flow, webhook verification, API-key management and the automated pipeline.",
      },
      {
        label: "Source code",
        href: "https://github.com/baydre/securepay-wallet",
        note: "MIT, public on GitHub.",
      },
      {
        label: "Tests",
        note: "42 tests — 29 unit, 11 integration, 2 end-to-end — run automatically in GitHub Actions.",
      },
      {
        label: "Verification scope",
        note: "The README's 'production-ready' and zero-downtime deployment statements are the repository's own claims, not independently observed production results.",
      },
    ],
  },
};

/**
 * `baydre/SecureBridge` — Python, last pushed 2025-12-09. Topics are
 * `api-service`, `authentication-service`, `backend`, which describe the shape
 * of the thing rather than naming a technology, so they inform `category` and
 * are not rendered as tiles. FastAPI is in the stack because the README names it
 * by name (it is the framework behind the dual-auth system), on the same
 * README + detected-language basis as SecurePay Wallet.
 *
 * SUMMARY 2026-10-13: the owner's suggested description, README-grounded.
 * `detail` is built from the README's feature list; the "production-ready"
 * framing is recorded as a repository claim in Evidence.
 */
const secureBridge: Project = {
  id: "securebridge",
  title: "SecureBridge",
  category: "Authentication",
  summary:
    "An authentication service built with FastAPI that supports JWT-based user sessions and API-key access for service-to-service communication, with role-based permissions and API-key lifecycle management.",
  stack: ["Python", "FastAPI"],
  repositoryUrl: "https://github.com/baydre/SecureBridge",
  detail: {
    engineering: [
      "Two authentication methods in one middleware: JWT access and refresh tokens for human users, and API-key authentication for service-to-service communication, both resolvable on the same endpoint.",
      "Full API-key lifecycle: generate with custom permissions, set expiry with auto-expiry handling, revoke and renew, plus last-accessed tracking and encrypted storage.",
      "Role-based access control, bcrypt password hashing, CORS configuration and rate limiting support behind a clean-architecture split: routes, middleware, services and Pydantic schemas.",
    ],
    evidence: [
      {
        label: "Project README",
        href: "https://github.com/baydre/SecureBridge",
        note: "Documents the dual-auth design, the endpoint reference and configuration.",
      },
      {
        label: "Source code",
        href: "https://github.com/baydre/SecureBridge",
        note: "MIT, public on GitHub.",
      },
      {
        label: "Tests",
        note: "pytest suites covering authentication and API-key flows (test_auth, test_keys).",
      },
      {
        label: "Verification scope",
        note: "The README's 'production-ready' framing is the repository's own claim, not an observed deployment.",
      },
    ],
  },
};

/**
 * `baydre/network-in-a-box` — Python, last pushed 2025-11-12. Linux is in the
 * stack because the repository's own description ends "on Linux", not because
 * it was inferred from the account. DISPLAY TITLE corrected 2026-10-13 (was the
 * bare repository name); id and repositoryUrl are unchanged.
 *
 * SUMMARY 2026-10-13: the owner's suggested description, README-grounded.
 * `detail` comes from the README's features, architecture section and test
 * listing (13 integration tests).
 */
const networkInABox: Project = {
  id: "network-in-a-box",
  title: "Network in a Box",
  category: "Networking",
  summary:
    "A Python-based Linux networking tool for provisioning isolated virtual networks, including public and private subnets, NAT, security policies, and peering between virtual networks.",
  stack: ["Python", "Linux"],
  repositoryUrl: "https://github.com/baydre/network-in-a-box",
  detail: {
    engineering: [
      "Recreates cloud VPC primitives on a single Linux host using native tooling only (ip, iptables, bridge-utils): a central bridge, dedicated public/private network namespaces and a NAT gateway namespace.",
      "MD5-based deterministic interface naming avoids collisions, and persistent state with file locking plus orphaned-resource detection makes provisioning and teardown idempotent.",
      "JSON security policies act as cloud-like security groups, and VPC peering connects NAT gateways with static route injection for isolated multi-VPC environments.",
    ],
    evidence: [
      {
        label: "Project README",
        href: "https://github.com/baydre/network-in-a-box",
        note: "Documents the CLI, network architecture, and requirements (Ubuntu 18.04+, kernel 4.15+, root access).",
      },
      {
        label: "Source code",
        href: "https://github.com/baydre/network-in-a-box",
        note: "MIT, public on GitHub.",
      },
      {
        label: "Tests",
        note: "13 automated integration tests (test_suite.py) covering VPC creation, internet access, isolation, peering, policies, server deployment and cleanup.",
      },
    ],
  },
};

/**
 * `baydre/blue-green-deployment-strategy` — Shell, MIT, last pushed
 * 2026-01-15, the owner's most recently touched of the five.
 *
 * The owner first listed this as "BG-Deployment-Strategy" and confirmed it is
 * this repository. DISPLAY TITLE 2026-10-13: the day the owner confirmed it, the
 * full repository name was used verbatim because "BG-Deployment-Strategy"
 * abbreviated it; the readable "Blue-Green Deployment Strategy" now does the
 * same job without reading as a slug (id and repositoryUrl stay the
 * repository's own). NGINX and Docker are in the stack because the description
 * names both by name.
 *
 * SUMMARY 2026-10-13: the owner's suggested description replaces the earlier
 * repo-description summary, which opened "Zero-downtime Blue/Green deployment…"
 * and thereby presented the README's headline claim as fact. The replacement
 * says "demonstration", and Evidence records the zero-downtime / AWS-EC2
 * statements as the repository's claims rather than observed results.
 */
const blueGreenDeployment: Project = {
  id: "blue-green-deployment-strategy",
  title: "Blue-Green Deployment Strategy",
  category: "DevOps",
  summary:
    "A containerized blue-green deployment demonstration using NGINX to route traffic between application instances, with automated failover verification, failure simulation, structured logging, and alert monitoring.",
  stack: ["Shell", "NGINX", "Docker"],
  repositoryUrl: "https://github.com/baydre/blue-green-deployment-strategy",
  detail: {
    engineering: [
      "NGINX defines two upstream pools — blue and green — each with a primary and a backup server; aggressive 2-second timeouts with proxy_next_upstream retry fail traffic over when the primary pool errors.",
      "Identical blue/green containers run behind the proxy, /chaos endpoints simulate failures, and verify-failover.sh checks for zero non-200 responses and ≥95% of traffic served by the backup pool.",
      "A Python alert watcher reads structured nginx logs (pool, release, timing) and posts failover, high-error-rate and recovery alerts to Slack; the stack runs under Docker Compose.",
    ],
    evidence: [
      {
        label: "Project README",
        href: "https://github.com/baydre/blue-green-deployment-strategy",
        note: "Documents the architecture, the acceptance criteria, the CI workflow (verify-failover.yml) and the operator runbook.",
      },
      {
        label: "Source code",
        href: "https://github.com/baydre/blue-green-deployment-strategy",
        note: "Public on GitHub.",
      },
      {
        label: "Tests",
        note: "verify-failover.sh and local-test.sh (12 phases) automate the documented failover acceptance criteria, and the CI workflow reruns them on every push.",
      },
      {
        label: "Verification scope",
        note: "The README's zero-downtime and 'deployed to AWS EC2' statements are the repository's own claims, not independently observed production results.",
      },
    ],
  },
};

/**
 * The owner's Ansible deployment work. **A GitHub Gist, not a repository** —
 * `repositoryUrl` carries the gist URL because that is where it lives, and the
 * field is documented as "external repository, if public" rather than
 * "git remote".
 *
 * SUMMARY 2026-10-13 — RECONCILED with the linked artifact. The previous
 * summary ("An automated deployment system using Ansible…", the owner's own
 * 2026-07 description) read the deployment as a running system, but the gist is
 * titled "Beginner's Guide to Multi-Environment Application Deployment with
 * Ansible" and contains a single Markdown file: it is DOCUMENTATION — a written
 * tutorial whose playbook, roles and templates are embedded in the guide as the
 * worked example, not a repository of automation code. The summary now says
 * "written guide", and `detail.evidence` states the same distinction. The
 * owner directed this reconciliation 2026-10-13.
 */
const ansibleDeployment: Project = {
  id: "ansible-deployment",
  title: "Ansible Deployment",
  category: "DevOps",
  summary:
    "A written guide to deploying an application to staging and production with Ansible — one environment-agnostic playbook, per-environment inventory and variables, Vault-managed secrets, and CloudWatch logging.",
  stack: ["Ansible"],
  repositoryUrl:
    "https://gist.github.com/baydre/7f8c53616bea8887603f3733a3d4c382",
  detail: {
    engineering: [
      "One environment-agnostic playbook (site.yml) driven by separate staging and production inventory files, with per-environment group_vars keeping the configuration single-sourced.",
      "Ansible Vault encrypts the deploy SSH key and per-environment secrets; the guide's roles cover common setup, application deployment with PM2, an Nginx reverse proxy with Certbot SSL, and CloudWatch logging.",
    ],
    evidence: [
      {
        label: "The guide (gist)",
        href: "https://gist.github.com/baydre/7f8c53616bea8887603f3733a3d4c382",
        note: "Documentation: a single Markdown tutorial containing the playbook, roles and templates to build the deployment yourself.",
      },
      {
        label: "Scope",
        note: "The gist is a worked example of the approach, not evidence that a live staging/production deployment was operated.",
      },
    ],
  },
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
