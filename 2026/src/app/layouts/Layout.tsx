import { Outlet } from "react-router";
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
