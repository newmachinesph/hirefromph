/* eslint-disable @next/next/no-img-element -- article photos are article-scoped static files; the figure sets explicit dimensions and loading=lazy */
import type { MDXComponents } from "mdx/types";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Callout, type CalloutProps } from "@/components/ui";
import { ASSET_ROOT, assetUrl, type Insight } from "@/lib/insights";
import { cn } from "@/lib/utils";

/**
 * The components an article body may use, bound to one article so `<Figure
 * src="x.svg">` resolves inside public/insights/<slug>/ and `<PullQuote n={0}>`
 * reads meta.pullQuotes. SVG figures are inlined so the page's fonts and
 * tokens apply; raster figures are plain <img>.
 */
export function articleComponents(insight: Insight): MDXComponents {
  const assetDir = join(ASSET_ROOT, insight.slug);

  function PullQuote({ n, children }: { n?: number; children?: ReactNode }) {
    const text = n !== undefined ? insight.pullQuotes[n] : undefined;
    return (
      <figure className="insight-pull">
        <blockquote>{text ?? children}</blockquote>
      </figure>
    );
  }

  function Figure({
    src,
    alt,
    caption,
    credit,
    wide = false,
    width,
    height,
  }: {
    src: string;
    alt: string;
    caption?: string;
    credit?: string;
    wide?: boolean;
    width?: number;
    height?: number;
  }) {
    const isSvg = src.toLowerCase().endsWith(".svg");
    const file = join(assetDir, src);
    const svg = isSvg && existsSync(file) ? readFileSync(file, "utf8") : null;
    return (
      <figure className={cn("insight-figure", wide && "insight-figure--wide", isSvg && "insight-figure--diagram")}>
        {svg ? (
          <div className="insight-figure__svg" role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <img src={assetUrl(insight.slug, src)} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        )}
        {(caption || credit) && (
          <figcaption>
            {caption}
            {credit && <span className="insight-figure__credit"> {credit}</span>}
          </figcaption>
        )}
      </figure>
    );
  }

  function Cite({ n }: { n: number }) {
    const source = insight.sources.find((s) => s.n === n);
    return (
      <a href={`#source-${n}`} className="insight-cite" aria-label={source ? `Source ${n}: ${source.publisher}` : `Source ${n}`}>
        [{n}]
      </a>
    );
  }

  function DataTable({ caption, children }: { caption?: string; children: ReactNode }) {
    return (
      <figure className="insight-table">
        <div className="insight-table__scroll">{children}</div>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }

  function Aside({ title, children }: { title?: string; children: ReactNode }) {
    return (
      <aside className="insight-aside">
        {title && <p className="insight-aside__title">{title}</p>}
        {children}
      </aside>
    );
  }

  function InsightCallout({
    tone = "neutral",
    title,
    children,
  }: {
    tone?: CalloutProps["tone"];
    title?: string;
    children: ReactNode;
  }) {
    return (
      <Callout tone={tone} title={title} className="insight-callout">
        {children}
      </Callout>
    );
  }

  function A({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }

  return { PullQuote, Figure, Cite, DataTable, Aside, Callout: InsightCallout, a: A };
}
