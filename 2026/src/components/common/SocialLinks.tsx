import type { SocialLink } from "../../content/types";
import { SocialIcon } from "./icons";

/**
 * The three social tiles from the Figma header.
 *
 * Snippet geometry (updated navbar, 2026-10-08): 40 × 40 tile,
 * `background: #F3F4F6` (`bg-gray-100`), `borderRadius: 8`, wrapping a
 * 20 × 20 icon box whose glyphs are `fill="#5D5A88"` (all three, identical
 * path colour).
 *
 * The snippet renders the tiles as bare `<div>`s with no accessible name. They
 * are `<a>` elements here, with a `sr-only` label, because an unlabelled icon
 * link is unusable with a screen reader (WCAG 2.2 AA, 4.1.2 Name, Role, Value).
 *
 * Hover: `bg-lime-300` (#C7F464) — the owner stated the design's hover colour
 * on 2026-10-08, replacing the earlier opacity fade (the snippet specifies no
 * hover at all).
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
            className="flex size-10 items-center justify-center rounded-md bg-surface text-surface-foreground transition-colors hover:bg-lime-300"
          >
            <SocialIcon network={link.network} className="size-5" />
            <span className="sr-only">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
