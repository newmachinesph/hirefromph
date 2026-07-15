"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import stages from "@/data/stages.json";
import roadmap from "@/data/roadmap.json";
import { usePath } from "@/lib/path-context";
import { cn } from "@/lib/utils";

const TOTAL = roadmap.steps.length;

/** The glue: a compact "you are here" across the whole journey. Reads the same
 * localStorage progress the /path page writes, so a beginner feels the site as
 * one road instead of a pile of separate pages. Renders nothing until hydrated
 * to keep server and client markup identical. */
export function JourneyProgress() {
  const { state, hydrated } = usePath();
  if (!hydrated) return null;

  const doneCount = roadmap.steps.filter((s) => state.steps[s.n]).length;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const started = doneCount > 0 || state.startedAt !== null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-coral">
            {started ? "Your journey" : "The journey"}
          </p>
          <p className="mt-2 font-display text-2xl leading-none">
            {started ? (
              <>
                {doneCount}{" "}
                <span className="text-ink-faint">of {TOTAL} steps done</span>
              </>
            ) : (
              <span className="text-ink-faint">Zero to independent, 11 steps</span>
            )}
          </p>
        </div>
        <Link
          href="/path"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper-2 transition-all hover:-translate-y-0.5 hover:bg-coral"
        >
          {started ? "Continue" : "Open your path"}
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* progress bar */}
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
        <div
          className="h-full rounded-full bg-coral transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* five stage markers */}
      <ol className="mt-5 grid grid-cols-5 gap-2">
        {stages.map((st) => {
          const stageSteps = roadmap.steps.filter((s) => s.stage === st.num);
          const stageDone =
            stageSteps.length > 0 &&
            stageSteps.every((s) => state.steps[s.n]);
          const isCurrent = state.stage === st.num;
          return (
            <li key={st.num} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  stageDone
                    ? "border-coral bg-coral text-white"
                    : isCurrent
                      ? "border-coral text-coral"
                      : "border-line-strong text-ink-faint",
                )}
              >
                {stageDone ? <Check size={14} /> : st.num}
              </span>
              <span
                className={cn(
                  "text-[0.7rem] leading-tight",
                  isCurrent ? "text-ink" : "text-ink-faint",
                )}
              >
                {st.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
