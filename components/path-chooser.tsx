"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import tracks from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  redirectTo?: string;
  onChosen?: (id: string) => void;
};

const accentRing: Record<string, string> = {
  coral: "hover:border-coral/60 data-[active=true]:border-coral data-[active=true]:bg-coral-tint",
  emerald: "hover:border-emerald/60 data-[active=true]:border-emerald data-[active=true]:bg-emerald-tint",
  amber: "hover:border-amber/60 data-[active=true]:border-amber data-[active=true]:bg-amber-tint",
  indigo: "hover:border-indigo/60 data-[active=true]:border-indigo data-[active=true]:bg-indigo-tint",
};

const iconTone: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep",
  emerald: "bg-emerald-tint text-emerald",
  amber: "bg-amber-tint text-amber-text",
  indigo: "bg-indigo-tint text-indigo",
};

export function PathChooser({ compact = false, redirectTo, onChosen }: Props) {
  const { state, choosePath, hydrated } = usePath();
  const router = useRouter();

  function pick(id: string) {
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
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald text-white">
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
              <Pill tone={t.accent as "coral"}>{t.demandLabel}</Pill>
            </div>
          </button>
        );
      })}
    </div>
  );
}
