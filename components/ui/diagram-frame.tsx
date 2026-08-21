import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DiagramFrameProps = {
  title: string;
  /** One sentence saying what to look at. */
  caption?: string;
  /** Anchor id; derived from the title when omitted. Server component — no useId. */
  id?: string;
  className?: string;
  children: ReactNode;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DiagramFrame({
  title,
  caption,
  id,
  className,
  children,
}: DiagramFrameProps) {
  const base = id ?? `diagram-${slugify(title)}`;
  const titleId = `${base}-title`;
  const descId = `${base}-desc`;

  return (
    <figure id={base} className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <p id={titleId} className="font-display text-h5 text-ink">
          {title}
        </p>
        {caption && (
          <p id={descId} className="text-small text-ink-soft">
            {caption}
          </p>
        )}
      </div>
      <div
        role="img"
        aria-labelledby={titleId}
        aria-describedby={caption ? descId : undefined}
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-line bg-paper p-4"
      >
        <div className="min-w-[32rem]">{children}</div>
      </div>
    </figure>
  );
}
