import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "default" | "narrow" | "wide";

const MAX: Record<ContainerSize, string> = {
  default: "max-w-(--maxw)",
  narrow: "max-w-(--maxw-narrow)",
  wide: "max-w-(--maxw-wide)",
};

export function Container({
  children,
  size = "default",
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  size?: ContainerSize;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
  className?: string;
}) {
  return (
    <Tag className={cn("mx-auto w-full px-(--gutter)", MAX[size], className)}>
      {children}
    </Tag>
  );
}
