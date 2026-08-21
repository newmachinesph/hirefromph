import type { ReactNode } from "react";
import { Heading, Kicker, Text, type HeadingLevel, type HeadingSize, type KickerTone } from "../ui/index";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  kicker?: string;
  kickerTone?: KickerTone;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-hand slot for the Learnora heading-left / button-right pattern. */
  action?: ReactNode;
  align?: "left" | "center";
  level?: HeadingLevel;
  size?: HeadingSize;
  id?: string;
  className?: string;
};

export function SectionHeading({
  kicker,
  kickerTone = "neutral",
  title,
  lead,
  action,
  align = "left",
  level = 2,
  size = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        className,
      )}
    >
      <div
        className={cn(
          "flex max-w-2xl flex-col gap-4",
          align === "center" && "items-center",
        )}
      >
        {kicker && <Kicker tone={kickerTone}>{kicker}</Kicker>}
        <Heading level={level} size={size} id={id} balance>
          {title}
        </Heading>
        {lead && <Text size="lead">{lead}</Text>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
