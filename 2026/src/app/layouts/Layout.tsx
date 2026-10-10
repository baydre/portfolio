import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { SiteFooter } from "../../components/common/SiteFooter";
import { SiteHeader } from "../../components/navigation/SiteHeader";

/**
 * Application shell: header, main landmark, footer.
 *
 * The previous footer here was a generic three-column bar built from the old
 * template. It is replaced by `SiteFooter`, which is the footer the design
 * actually specifies — role and disciplines, availability and "View Work", the
 * 160px wordmark, the Navigate and Connect columns, and the copyright bar.
 *
 * The skip link targets `#main`, which the design's footer Navigate column also
 * links to as "Home", so the two agree.
 */
export function Layout() {
  // The router drives scroll, so pages are not "connected": a new pathname
  // resets to the top, and a fragment lands on the section instead of a stale
  // scroll offset or the skip of the previous native-anchor-only navigation.
  // `key` is react-router's per-navigation token — it changes on every push,
  // including a hash-only one, so re-clicking a section scrolls again.
  const { key, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    try {
      // scrollIntoView honours the section's own `scroll-mt-header`
      // (--header-height), so the sticky header never covers the landing point.
      if (target) target.scrollIntoView({ block: "start" });
      else window.scrollTo(0, 0);
    } catch {
      // jsdom implements neither scrollIntoView nor scrollTo; the browser does.
    }
  }, [key, hash]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
