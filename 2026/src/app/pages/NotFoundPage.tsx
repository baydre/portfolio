import { Link } from "react-router";
import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container-site py-24 text-center md:py-32">
      <h1 className="text-display leading-none text-white md:text-[8rem]">404</h1>
      <h2 className="mt-4 text-tagline text-foreground">Page not found</h2>
      <p className="mx-auto mt-6 max-w-md text-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      {/*
        `text-cta` is deliberately NOT used for the label size, even though
        `--text-cta` is the same 0.875rem as the variant's `text-sm`. tailwind-merge
        cannot tell a custom `--text-*` font-size token from a `text-*` colour
        utility, so it resolves `text-cta` against *both* groups and, being last,
        deletes the variant's `text-primary-foreground` along with the earlier
        `text-sm`. The label then inherited `--foreground` (#e9e9ec) onto a
        `--primary` (#e9e9ec) fill and rendered invisible. Take the size from the
        variant and only the authored `leading-cta` from a token — the fix
        `HireMeButton` and `ContactForm` already use.
      */}
      <Button asChild className="mt-8 h-auto rounded-md px-6 py-3 leading-cta">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
