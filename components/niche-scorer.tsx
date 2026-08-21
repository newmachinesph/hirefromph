"use client";

import { useId, useMemo, useState } from "react";
import frameworks from "@/data/frameworks.json";
import {
  Callout,
  Field,
  Icon,
  Input,
  ProgressBar,
  Radio,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

type Criterion = (typeof frameworks.niche.criteria)[number];

const SCORE_VALUES = [1, 2, 3, 4, 5] as const;
const DEFAULT_SCORE = 3;

const VERDICT_TIERS = [
  {
    min: 80,
    label: "Strong niche, go deep",
    tone: "verified" as const,
    desc: "It clears the bar across the board. The main risk now is indecision, not the niche itself.",
  },
  {
    min: 60,
    label: "Workable, mind the weak spots",
    tone: "caution" as const,
    desc: "Solid enough to start. Look at whatever you scored low and have a plan for it before you commit fully.",
  },
  {
    min: 40,
    label: "Risky, proceed with eyes open",
    tone: "signal" as const,
    desc: "More than one fundamental is shaky. Not a hard no, but don't bet your first 90 days on this alone.",
  },
  {
    min: 0,
    label: "Reconsider this one",
    tone: "signal" as const,
    desc: "The fundamentals aren't there yet. Re-run this on a different niche before you invest real time.",
  },
];

function initScores(): Record<string, number> {
  const init: Record<string, number> = {};
  for (const c of frameworks.niche.criteria) init[c.id] = DEFAULT_SCORE;
  return init;
}

export function NicheScorer() {
  const uid = useId();
  const [nicheName, setNicheName] = useState("");
  const [scores, setScores] = useState<Record<string, number>>(initScores);

  const criteria = frameworks.niche.criteria as Criterion[];

  const { pct, tier, weakSpots } = useMemo(() => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = criteria.reduce(
      (sum, c) => sum + (scores[c.id] ?? DEFAULT_SCORE) * c.weight,
      0,
    );
    const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const pctValue = Math.round((weightedAvg / 5) * 100);
    const tierValue =
      VERDICT_TIERS.find((t) => pctValue >= t.min) ??
      VERDICT_TIERS[VERDICT_TIERS.length - 1];
    const weak = criteria.filter((c) => (scores[c.id] ?? DEFAULT_SCORE) <= 2);
    return { pct: pctValue, tier: tierValue, weakSpots: weak };
  }, [criteria, scores]);

  function setScore(id: string, value: number) {
    setScores((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="flex flex-col">
      <Field label="What niche are you evaluating?">
        <Input
          type="text"
          value={nicheName}
          onChange={(e) => setNicheName(e.target.value)}
          placeholder="e.g. AI prompt QA, pet content editing, whatever you're actually considering"
        />
      </Field>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="grid gap-4">
          {criteria.map((c, idx) => {
            const groupId = `${uid}-${c.id}`;
            const value = scores[c.id] ?? DEFAULT_SCORE;
            const low = value <= 2;
            const labelId = `${groupId}-label`;
            return (
              <div
                key={c.id}
                role="group"
                aria-labelledby={labelId}
                className={cn(
                  "rounded-md border p-4 transition-colors",
                  low ? "border-signal/40 bg-signal-tint/40" : "border-line bg-paper",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-sm",
                      accent(["signal", "verified", "caution", "info"][idx % 4]).soft,
                    )}
                  >
                    <Icon name={c.icon} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3
                        id={labelId}
                        className="font-display text-base leading-tight text-ink"
                      >
                        {c.name}
                      </h3>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                        Weight ×{c.weight}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-ink-soft">
                      {c.question}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 pl-12">
                  <Field as="group" label={`${c.name}: ${c.question}`} hideLabel>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SCORE_VALUES.map((n) => (
                        <Radio
                          key={n}
                          id={`${groupId}-${n}`}
                          name={groupId}
                          checked={value === n}
                          onChange={() => setScore(c.id, n)}
                          label={String(n)}
                        />
                      ))}
                    </div>
                  </Field>
                  <span className="block basis-full text-xs text-ink-faint sm:ml-2 sm:inline sm:basis-auto">
                    1 = weak · 5 = strong
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="flex flex-col gap-6 rounded-md border border-line bg-paper p-6 lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center" aria-live="polite">
            <ProgressBar
              value={pct}
              max={100}
              label={`${nicheName.trim() || "This niche"} scores ${pct} percent`}
              showValue
              tone={tier.tone}
            />
            <p className="mt-4 font-display text-lg leading-snug text-balance text-ink">
              {nicheName.trim() ? nicheName.trim() : "This niche"}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                tier.tone === "verified" && "text-verified",
                tier.tone === "caution" && "text-caution-text",
                tier.tone === "signal" && "text-signal-deep",
              )}
            >
              {tier.label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-faint">{tier.desc}</p>
          </div>

          <div className="border-t border-line pt-5">
            {weakSpots.length > 0 ? (
              <>
                <p className="kicker flex items-center gap-1.5 text-signal-deep">
                  <Icon name="alert-triangle" size={13} /> Watch out for
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {weakSpots.map((c) => (
                    <li key={c.id} className="text-xs leading-relaxed text-ink-soft">
                      <span className="font-semibold text-ink">{c.name}</span>, {" "}
                      {c.why}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Callout tone="verified">
                <Text size="caption">
                  No weak spots scored below a 3, nothing glaring to flag.
                </Text>
              </Callout>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
