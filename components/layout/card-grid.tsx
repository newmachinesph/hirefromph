import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const COLS: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function CardGrid({
  children,
  cols = 3,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  as?: "div" | "ul";
  className?: string;
}) {
  return (
    <Tag className={cn("grid grid-cols-1 gap-6", COLS[cols], className)}>{children}</Tag>
  );
}
