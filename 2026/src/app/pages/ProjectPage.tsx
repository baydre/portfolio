import { Link, useParams } from "react-router";
import { ContactSection } from "../../components/contact/ContactSection";
import { NotFoundPage } from "./NotFoundPage";
import { findProject, projects } from "../../content/projects";

/**
 * A single project — the design file's "Product Page".
 *
 * Owner-confirmed 2026-09-26: the application calls these projects and the route
 * stays `/projects/:projectId`. "Product Page" is the design file's term for this
 * same screen.
 *
 * The page is data-driven and renders ONLY blocks present in the content layer.
 * The design's Product Page frame has four blocks — Description, Stack & Tools,
 * The Challenge, The Solution — plus the contact section and footer. The contact
 * section and footer are shared, so this composes `ContactSection`; `Layout`
 * already renders the footer.
 *
 * WHY THIS PAGE WAS REWRITTEN
 * The previous version ignored `useParams` entirely, so every URL under
 * `/projects/*` rendered the same hardcoded content, and that content was
 * fabricated: a project named "ID Gentify" that appears nowhere in the design, a
 * twelve-tool stack, "reduced verification time by 70%", "99.9% accuracy", four
 * screenshots of unknown provenance, and six "Key Features". None of it came from
 * the Figma file or from the client. A case study is a factual claim about
 * someone else's product; invented metrics are not a placeholder, they are a false
 * statement. All of it is gone.
 *
 * The Product Page snippet has not been supplied, so the layout below follows the
 * block order given in the design inventory and nothing more. Absent blocks are
 * omitted rather than filled — see `ProjectDetail`.
 */
export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? findProject(projectId) : undefined;

  // An unknown id is a real 404. The previous site linked all six cards to the
  // same id, so this case was reachable in practice.
  if (!project) return <NotFoundPage />;

  // Absent for every current project — see Project["detail"].
  const detail = project.detail;

  return (
    <>
      <article className="container-site py-20">
        <h1 className="font-heading text-section leading-section text-foreground">
          {project.title}
        </h1>

        <p className="mt-4 text-caption leading-caption text-footer-label">
          {project.category} &middot;{" "}
          <Link to="/#work" className="underline underline-offset-4 hover:text-foreground">
            Back to all work
          </Link>
        </p>

        {project.image ? (
          <img
            src={project.image}
            alt={project.imageAlt ?? ""}
            className="mt-12 w-full rounded-image object-cover"
          />
        ) : null}

        {/* Description */}
        {project.summary ? (
          <section aria-labelledby="project-description" className="mt-16">
            <h2
              id="project-description"
              className="font-heading text-service leading-service text-foreground"
            >
              Description
            </h2>
            <p className="mt-4 max-w-prose text-body leading-body text-muted-foreground">
              {project.summary}
            </p>
          </section>
        ) : null}

        {/* Stack & Tools. Falls back to the card's stack when no richer detail
            is supplied, so the block appears whenever the data supports it. */}
        {project.stack.length > 0 ? (
          <section aria-labelledby="project-stack" className="mt-16">
            <h2
              id="project-stack"
              className="font-heading text-service leading-service text-foreground"
            >
              Stack &amp; Tools
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {/* Keyed by tool AND position, matching ProjectCard: the design's
                  stack repeats "React.js" five times, so a tool-only key
                  collides and React treats reconciliation as unsupported. */}
              {project.stack.map((tool, index) => (
                <li
                  key={`${tool}-${index}`}
                  className="rounded-md bg-tech-tile px-3 py-2 text-caption leading-caption text-tech-tile-foreground"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* The Challenge / The Solution. Absent for every current project, so
            these blocks do not render. Shown here as the contract for the
            content layer rather than as placeholder prose. */}
        {detail?.challenge ? (
          <section aria-labelledby="project-challenge" className="mt-16">
            <h2
              id="project-challenge"
              className="font-heading text-service leading-service text-foreground"
            >
              The Challenge
            </h2>
            <p className="mt-4 max-w-prose text-body leading-body text-muted-foreground">
              {detail.challenge}
            </p>
          </section>
        ) : null}

        {detail?.solution ? (
          <section aria-labelledby="project-solution" className="mt-16">
            <h2
              id="project-solution"
              className="font-heading text-service leading-service text-foreground"
            >
              The Solution
            </h2>
            <p className="mt-4 max-w-prose text-body leading-body text-muted-foreground">
              {detail.solution}
            </p>
          </section>
        ) : null}

        {!project.provisional ? null : (
          <p className="mt-16 rounded-md border border-panel-border bg-panel p-6 text-caption leading-caption text-panel-foreground">
            This case study is a placeholder. The design file repeats one project
            across all four Work cards and supplies no Challenge or Solution copy,
            so those blocks are omitted rather than written.{" "}
            {projects.length === 1
              ? "Real projects have not been supplied yet."
              : null}
          </p>
        )}
      </article>

      <ContactSection />
    </>
  );
}
