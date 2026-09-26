import type { SocialLink } from "../../content/types";
import { SocialIcon } from "./icons";

/**
 * The three social tiles from the Figma header.
 *
 * Snippet geometry: 40 × 40 tile, `background: #F0F2F5`, `borderRadius: 8`,
 * wrapping a 20 × 20 icon box.
 *
 * The snippet renders the tiles as bare `<div>`s with no accessible name. They
 * are `<a>` elements here, with a `sr-only` label, because an unlabelled icon
 * link is unusable with a screen reader (WCAG 2.2 AA, 4.1.2 Name, Role, Value).
 */
export function SocialLinks({
  links,
  className,
}: {
  links: SocialLink[];
  className?: string;
}) {
  return (
    <ul className={`flex items-center gap-cluster-gap ${className ?? ""}`}>
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            data-unverified={link.unverified || undefined}
            className="flex size-10 items-center justify-center rounded-md bg-surface text-surface-foreground transition-opacity hover:opacity-80"
          >
            <SocialIcon network={link.network} className="size-5" />
            <span className="sr-only">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
