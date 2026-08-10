"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import tracks from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Props = {
  compact?: boolean;
  redirectTo?: string;
  onChosen?: (id: string) => void;
};

const accentRing: Record<string, string> = {
  signal: "hover:border-signal/60 data-[active=true]:border-signal data-[active=true]:bg-signal-tint",
  verified: "hover:border-verified/60 data-[active=true]:border-verified data-[active=true]:bg-verified-tint",
  caution: "hover:border-caution/60 data-[active=true]:border-caution data-[active=true]:bg-caution-tint",
  info: "hover:border-info/60 data-[active=true]:border-info data-[active=true]:bg-info-tint",
};

const iconTone: Record<string, string> = {
  signal: "bg-signal-tint text-signal-deep",
  verified: "bg-verified-tint text-verified",
  caution: "bg-caution-tint text-caution-text",
  info: "bg-info-tint text-info",
};

export function PathChooser({ compact = false, redirectTo, onChosen }: Props) {
  const { state, choosePath, hydrated } = usePath();
  const router = useRouter();

  function pick(id: string) {
    track("path_chosen", { track: id });
    choosePath(id);
    onChosen?.(id);
    if (redirectTo) router.push(redirectTo);
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {tracks.tracks.map((t) => {
        const active = hydrated && state.track === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            data-active={active}
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl border border-line bg-paper-2 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
              accentRing[t.accent],
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl",
                  iconTone[t.accent],
                )}
              >
                <Icon name={t.icon} size={20} />
              </span>
              {active && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-verified text-white">
                  <Check size={14} />
                </span>
              )}
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">{t.name}</h3>
              {!compact && (
                <p className="mt-1 text-sm leading-snug text-ink-soft">
                  {t.tagline}
                </p>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-sm font-semibold text-ink">{t.pay}</span>
              <Pill tone={t.accent as "signal"}>{t.demandLabel}</Pill>
            </div>
          </button>
        );
      })}
    </div>
  );
}
