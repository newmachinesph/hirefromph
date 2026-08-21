import type { ReactNode } from "react";
import { Figure, Heading, Kicker, Text } from "../ui/index";
import { cn } from "@/lib/utils";
import { Container } from "./container";

export type CtaBandProps = {
  kicker?: string;
  title: ReactNode;
  body?: ReactNode;
  actions: ReactNode;
  /**
   * The one navy band per page. The image sits at 20% behind it (spec §8.1.8).
   * Either a manifest image id, or an already-built node.
   */
  media?: { figureId: string } | { node: ReactNode };
  className?: string;
};

export function CtaBand({
  kicker,
  title,
  body,
  actions,
  media,
  className,
}: CtaBandProps) {
  return (
    <section className={cn("relative overflow-hidden bg-ink text-on-navy", className)}>
      {media && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {"figureId" in media ? (
            <Figure
              id={media.figureId}
              ratio="21/9"
              radius="none"
              sizes="100vw"
              className="h-full [&>div]:h-full [&>div]:bg-transparent [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:opacity-20 [&_figcaption]:absolute [&_figcaption]:right-4 [&_figcaption]:bottom-3 [&_figcaption]:text-on-navy/70"
            />
          ) : (
            media.node
          )}
        </div>
      )}
      <Container>
        <div className="relative flex flex-col items-start gap-6 py-20 lg:py-32">
          {kicker && <Kicker>{kicker}</Kicker>}
          <Heading level={2} size="display" tone="inherit" balance className="max-w-3xl">
            {title}
          </Heading>
          {body && (
            <Text size="lead" tone="inherit" className="max-w-xl">
              {body}
            </Text>
          )}
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
