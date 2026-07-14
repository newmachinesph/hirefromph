"use client";

import { useState, type ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { usePath } from "@/lib/path-context";
import { PathChooser } from "@/components/path-chooser";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  title?: string;
  teaser?: string;
  /** what the user unlocks, e.g. "the full directory of 150+ places to apply" */
  unlocks?: string;
};

/**
 * Gates deep content behind a one-click path choice.
 * Before a path is chosen: a locked invitation with an inline chooser.
 * After: the deep content renders. Depth is available — but only once the
 * visitor commits to a direction, so nothing feels overwhelming up front.
 */
export function PathGate({ children, teaser, unlocks }: Props) {
  const { hasPath, hydrated } = usePath();
  const [expanded, setExpanded] = useState(false);

  // During SSR / first paint keep the locked state to avoid a hydration flash.
  const unlocked = hydrated && hasPath;

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview of what's underneath */}
      <div
        aria-hidden
        className="pointer-events-none max-h-[320px] overflow-hidden opacity-40 blur-[3px] select-none [mask-image:linear-gradient(to_bottom,black,transparent)]"
      >
        {children}
      </div>

      <div className="absolute inset-x-0 top-6 mx-auto max-w-xl">
        <div className="rounded-3xl border border-line-strong bg-paper-2/95 p-8 text-center shadow-[var(--shadow-lg)] backdrop-blur-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink text-paper-2">
            <Lock size={20} />
          </span>
          <h3 className="mt-4 font-display text-2xl leading-tight text-balance">
            Choose your path to unlock the depth
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            {teaser ??
              "We keep it calm up front on purpose. Pick the online career you're heading toward and"}{" "}
            {unlocks ? (
              <>
                unlock <span className="font-semibold text-ink">{unlocks}</span>,
                tailored to you.
              </>
            ) : (
              "the full toolkit opens — tailored to you."
            )}
          </p>

          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-coral-deep hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              Choose my path
            </button>
          ) : (
            <div
              className={cn(
                "mt-6 text-left transition-all",
                "animate-in fade-in",
              )}
            >
              <p className="kicker mb-3 text-center">Pick one — you can change later</p>
              <PathChooser compact />
            </div>
          )}
        </div>
      </div>
      {/* spacer so the absolute card has room */}
      <div className={expanded ? "h-[560px]" : "h-[300px]"} />
    </div>
  );
}
