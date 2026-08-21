import type { ReactNode } from "react";
import { KIT_LICENSE } from "@/lib/educators";
import { cn } from "@/lib/utils";

export type KitPageSize = "a4" | "a4-landscape" | "slide";

/**
 * `@page` is document-scoped — the paper size cannot be set per element — so
 * sheet 1 declares it for the whole route and later sheets inherit it.
 * Margin is 0 because .kit-page draws its own 14mm padding, which is what lets
 * the route decide where each page ends.
 */
const PAGE_RULE: Record<KitPageSize, string> = {
  a4: "@page { size: A4 portrait; margin: 0; }",
  "a4-landscape": "@page { size: A4 landscape; margin: 0; }",
  // 13.333in × 7.5in, the standard 16:9 slide.
  slide: "@page { size: 338.6mm 190.5mm; margin: 0; }",
};

const SIZE_CLASS: Record<KitPageSize, string> = {
  a4: "",
  "a4-landscape": "kit-page--landscape",
  slide: "kit-page--slide",
};

export type KitPageProps = {
  size?: KitPageSize;
  /** 1-based sheet number within this document. */
  n: number;
  /** Total sheets in this document. */
  of: number;
  /** Navy ground, for the title slide. */
  navy?: boolean;
  className?: string;
  children: ReactNode;
};

export function KitPage({
  size = "a4",
  n,
  of,
  navy = false,
  className,
  children,
}: KitPageProps) {
  return (
    <>
      {n === 1 && <style dangerouslySetInnerHTML={{ __html: PAGE_RULE[size] }} />}
      <section
        className={cn("kit-page", SIZE_CLASS[size], navy && "kit-page--navy", className)}
      >
        <div className="kit-body kit-stack">{children}</div>
        <div className="kit-foot">
          <span>{KIT_LICENSE.attribution}</span>
          <span className="kit-num">
            {n} / {of}
          </span>
        </div>
      </section>
    </>
  );
}
