import Image from "next/image";
import { getVisual, type VisualEntry } from "@/lib/visuals";
import { cn } from "@/lib/utils";

export type FigureRatio = "4/5" | "3/2" | "16/9" | "1/1" | "21/9" | "3/1" | "hero";

/** Honesty doctrine (spec §7.1): every generated asset says so, visibly. */
export const ILLUSTRATIVE_CAPTION = "AI-generated image";

export type FigureProps = {
  /** Manifest id. Takes precedence over src/alt/width/height. */
  id?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  generated?: boolean;
  caption?: string;
  priority?: boolean;
  sizes?: string;
  ratio?: FigureRatio;
  radius?: "none" | "sm" | "md" | "lg";
  className?: string;
};

const RATIO: Record<FigureRatio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
  "3/1": "aspect-[3/1]",
  hero: "aspect-[3/2] lg:aspect-[4/5]",
};

const RADIUS = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
} as const;

export function Figure({
  id,
  src,
  alt,
  width,
  height,
  generated,
  caption,
  priority = false,
  sizes,
  ratio = "3/2",
  radius = "lg",
  className,
}: FigureProps) {
  const fromManifest: VisualEntry | undefined = id ? getVisual(id) : undefined;
  const inline: VisualEntry | undefined =
    !fromManifest && src && alt && width && height
      ? { id: src, src: { jpg: src }, width, height, alt, generated }
      : undefined;
  const entry = fromManifest ?? inline;

  const isGenerated = entry?.generated ?? generated ?? false;
  const descriptive = caption ?? entry?.caption;
  const captionParts = [descriptive, isGenerated ? ILLUSTRATIVE_CAPTION : null].filter(
    Boolean,
  );

  const captionNode =
    captionParts.length > 0 ? (
      <figcaption className="mt-2 text-caption text-ink-faint">
        {captionParts.join(" · ")}
      </figcaption>
    ) : null;

  // `relative` so callers can absolutely position the caption over the media
  // (CtaBand does this for the navy band).
  const root = cn("relative flex flex-col", className);

  if (!entry) {
    const label = alt ?? `Image not available: ${id ?? "unknown"}`;
    return (
      <figure className={root}>
        <div
          role="img"
          aria-label={label}
          className={cn(
            "grid w-full place-items-center border border-dashed border-line-strong bg-band p-6 text-center",
            RATIO[ratio],
            RADIUS[radius],
          )}
        >
          <span className="text-caption text-ink-faint">
            Image not available{id ? ` (${id})` : ""}
          </span>
        </div>
        {captionNode}
      </figure>
    );
  }

  return (
    <figure className={root}>
      <div className={cn("w-full overflow-hidden bg-band", RATIO[ratio], RADIUS[radius])}>
        <Image
          src={entry.src.avif ?? entry.src.webp ?? entry.src.jpg}
          alt={alt ?? entry.alt}
          width={entry.width}
          height={entry.height}
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 40vw, 100vw"}
          className="h-full w-full object-cover"
        />
      </div>
      {captionNode}
    </figure>
  );
}
