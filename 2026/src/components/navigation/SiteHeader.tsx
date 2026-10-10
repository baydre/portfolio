import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { navItems, socialLinks } from "../../content/profile";
import { BrandLogo } from "../common/BrandLogo";
import { SocialLinks } from "../common/SocialLinks";
import { HireMeButton } from "./HireMeButton";
import { NavBar } from "./NavBar";
import { SmartLink } from "./SmartLink";

/**
 * Site header: the `<header>` landmark and the small-screen disclosure, with
 * the visual row delegated to `NavBar`.
 *
 * The snippet supplies the navbar twice: as a standalone component, and
 * absolutely positioned at `top: 0` inside the 1440 frame. Absolute positioning
 * means it scrolls away with the frame. This implementation keeps it `sticky`
 * so the nav is reachable from the bottom of a long page.
 *
 * Because the header and the hero share a background, sticky is visually
 * indistinguishable from the snippet at rest — the border and backdrop blur that
 * an earlier revision had here are removed, because the design specifies
 * neither and they produced a visible seam over the hero.
 *
 * The design has no mobile variant, so below `lg` the row is replaced by a
 * disclosure — the nav + logo + right cluster cannot fit under the 1024px
 * content gutter, so the row hides and the brand mark and a menu button take
 * the 56px bar (see docs/INTERACTION_SPEC.md §2.2).
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the panel whenever the route changes, so following a link inside the
  // panel does not leave it hanging open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the panel and hands focus back to the button that opened it.
  //
  // Returning focus is not optional. The panel is removed from the layout with
  // `hidden`, so a link that held focus the instant Escape was pressed becomes
  // non-focusable and the browser drops focus to `<body>` — the keyboard user
  // loses their place and the next Tab restarts from the top of the document.
  // That is a WCAG 2.4.3 (Focus Order) failure, and it is invisible to a mouse.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-background">
      <NavBar className="hidden lg:flex" />

      <div className="container-site flex h-14 items-center justify-between lg:hidden">
        <BrandLogo className="h-8 w-auto" />
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((value) => !value)}
          className="flex size-10 items-center justify-center"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div id="primary-menu" hidden={!open} className="border-t border-border lg:hidden">
        <nav aria-label="Primary" className="container-site py-4">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.to}>
                <SmartLink
                  item={item}
                  onNavigate={() => setOpen(false)}
                  className="block rounded-sm p-nav-pad text-nav leading-nav text-foreground"
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-cluster-gap border-t border-border pt-4">
            <SocialLinks links={socialLinks} />
            <HireMeButton onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      </div>
    </header>
  );
}
