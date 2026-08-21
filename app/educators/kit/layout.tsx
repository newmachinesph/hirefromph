import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The root layout always mounts the skip link, SiteHeader, SiteFooter and
 * BackToTop as direct children of <body>, and a nested layout renders inside
 * <main> — it cannot unmount any of them. So the kit shell hides them for the
 * documents it owns, with one <style> element that is only ever mounted on a
 * kit route.
 *
 * Child combinators (`body > header`) keep the rules from reaching anything
 * inside a sheet; kit components use <div>s rather than <header>/<footer> so
 * that stays true. BackToTop is the only <button> the shell puts on <body>.
 *
 * dangerouslySetInnerHTML, not a text child: React escapes text children, and
 * an escaped `>` would break the selectors.
 */
const HIDE_SITE_CHROME = `
body > header,
body > footer,
body > .skip-link,
body > button { display: none !important; }
`;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KitLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      <div data-kit className="kit">
        {children}
      </div>
    </>
  );
}
