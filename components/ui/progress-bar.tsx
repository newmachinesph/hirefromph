import { accent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

export type ProgressBarProps = {
  value: number;
  max?: number;
  /** Always required: it names the bar for assistive technology. */
  label: string;
  hideLabel?: boolean;
  showValue?: boolean;
  tone?: Accent;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  hideLabel = false,
  showValue = false,
  tone = "signal",
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center justify-between text-small text-ink-soft",
          hideLabel && "sr-only",
        )}
      >
        <span>{label}</span>
        {showValue && (
          <span className="tabular-nums text-ink-faint">
            {clamped} / {safeMax}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className="h-2 w-full overflow-hidden rounded-pill bg-band"
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-150 ease-out", accent(tone).fill)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
