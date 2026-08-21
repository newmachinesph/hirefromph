import type { Metadata } from "next";

const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Hire From PH — build the online career you keep",
};

/**
 * Per-page metadata. Sets canonical + OpenGraph/Twitter to the page's own
 * route so subpages don't inherit the homepage's canonical/og. Next merges
 * metadata shallowly and REPLACES the whole `openGraph` object per segment,
 * so siteName/locale/type live here (not the layout) or they'd be dropped.
 * `title` still flows through the layout's "%s · Hire From PH" template for <title>.
 */
export function pageMeta({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Hire From PH",
      locale: "en_PH",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
