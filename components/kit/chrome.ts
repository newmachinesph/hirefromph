/**
 * The root layout always mounts the skip link, SiteHeader, SiteFooter and
 * BackToTop as direct children of <body>, and a nested layout renders inside
 * <main> — it cannot unmount any of them. So the kit and deck shells hide them
 * for the documents they own, with one <style> element that is only ever
 * mounted on those routes.
 *
 * Child combinators (`body > header`) keep the rules from reaching anything
 * inside a sheet or a slide; kit and deck components use <div>s rather than
 * <header>/<footer> so that stays true. BackToTop is the only <button> the
 * shell puts on <body>.
 *
 * Inject with dangerouslySetInnerHTML, not as a text child: React escapes text
 * children, and an escaped `>` would break the selectors.
 */
export const HIDE_SITE_CHROME = `
body > header,
body > footer,
body > .skip-link,
body > button,
body > [role="region"][aria-label="Cookie notice"] { display: none !important; }
`;
