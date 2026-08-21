import type { ReactNode } from "react";
import { ACCENT, isAccent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export type CalloutTone = "neutral" | Accent;

export type CalloutProps = {
  children: ReactNode;
  tone?: CalloutTone;
  title?: ReactNode;
  /** Kebab name from ICON_NAMES. Decorative — the title carries the meaning. */
  icon?: string;
  className?: string;
};

export function Callout({
  children,
  tone = "neutral",
  title,
  icon,
  className,
}: CalloutProps) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-5",
        a ? a.soft : "border-line-strong bg-band text-ink-soft",
        className,
      )}
    >
      {icon && (
        <span className="mt-0.5 shrink-0">
          <Icon name={icon} size={20} />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="font-display text-h5">{title}</p>}
        <div className="text-base">{children}</div>
      </div>
    </div>
  );
}
