import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StepList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ol className={cn("flex flex-col gap-5", className)}>{children}</ol>;
}

export function Step({
  n,
  title,
  children,
  className,
}: {
  n: number;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex gap-4", className)}>
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-primary-tint font-display text-small font-bold text-primary-deep"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-h5 text-ink">{title}</span>
        {children && <div className="text-body text-ink-soft">{children}</div>}
      </div>
    </li>
  );
}
