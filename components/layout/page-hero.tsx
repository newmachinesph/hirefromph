import type { ReactNode } from "react";
import { Figure, Heading, Kicker, Text, type FigureRatio, type KickerTone } from "../ui/index";
import { cn } from "@/lib/utils";
import { Breadcrumb, type Crumb } from "./breadcrumb";
import { Section } from "./section";

/** Either a manifest image id, or an already-built node (a diagram component). */
export type PageHeroMedia = { figureId: string } | { node: ReactNode };

export type PageHeroProps = {
  breadcrumb?: Crumb[];
  kicker?: string;
  kickerTone?: KickerTone;
  title: ReactNode;
  /** Trailing headline segment coloured in primary (spec §4.1). */
  accent?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  media?: PageHeroMedia;
  /**
   * Overrides the figure's aspect ratio for a `figureId` media (default
   * `"hero"`, 3:2 -> 4:5 on lg). Set this when the source asset's own ratio
   * doesn't match `"hero"` — e.g. a wide banner shot at 3:1.
   */
  mediaRatio?: FigureRatio;
  /**
   * Guides and workshops pass `compact`: `display` headline, standard section
   * rhythm. The homepage and stage pages use the default: `hero` headline,
   * 128px rhythm.
   */
  compact?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PageHero({
  breadcrumb,
  kicker,
  kickerTone = "neutral",
  title,
  accent,
  lead,
  actions,
  media,
  mediaRatio,
  compact = false,
  className,
  children,
}: PageHeroProps) {
  return (
    <Section spacing={compact ? "default" : "hero"} className={className}>
      <div
        className={cn(
          "grid gap-10",
          media && "lg:grid-cols-[1.1fr_0.9fr] lg:items-center",
        )}
      >
        <div className="flex flex-col items-start gap-5">
          {breadcrumb && <Breadcrumb items={breadcrumb} />}
          {kicker && <Kicker tone={kickerTone}>{kicker}</Kicker>}
          <Heading level={1} size={compact ? "display" : "hero"} accent={accent} balance>
            {title}
          </Heading>
          {lead && (
            <Text size="lead" className="max-w-2xl">
              {lead}
            </Text>
          )}
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          {children}
        </div>

        {media &&
          ("figureId" in media ? (
            <Figure
              id={media.figureId}
              ratio={mediaRatio ?? "hero"}
              radius="lg"
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          ) : (
            <div className="min-w-0">{media.node}</div>
          ))}
      </div>
    </Section>
  );
}
