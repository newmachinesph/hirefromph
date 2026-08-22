import type { MDXComponents } from "mdx/types";

/**
 * Required by @next/mdx (App Router). Markdown elements are styled by the
 * `.prose-insight` block in app/globals.css. The article-scoped components
 * (PullQuote, Figure, Cite, …) need the article's meta, so the page binds them
 * per article with `articleComponents()` from components/insights/mdx.tsx and
 * passes them as the `components` prop; nothing global lives here.
 */
export function useMDXComponents(): MDXComponents {
  return {};
}
