"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

export type BuilderField = {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
};

export type QualityLevel = {
  count: number;
  label: string;
  tone: string;
  note: string;
};

type Props = {
  intro: string;
  fields: BuilderField[];
  qualityLevels: QualityLevel[];
};

// Map the free-text `tone` string from data/prompting.json to Pill's tone
// union so we can reuse the shared component without an `any` cast.
const PILL_TONE: Record<string, "neutral" | "signal" | "verified" | "caution" | "info"> = {
  neutral: "neutral",
  signal: "signal",
  caution: "caution",
  verified: "verified",
};

const BAR_TONE: Record<string, string> = {
  neutral: "bg-line-strong",
  signal: "bg-signal",
  caution: "bg-caution",
  verified: "bg-verified",
};

function buildPrompt(fields: BuilderField[], values: Record<string, string>): string {
  return fields
    .filter((f) => values[f.id]?.trim())
    .map((f) => `${f.label}: ${values[f.id].trim()}`)
    .join("\n\n");
}

export function PromptWorkshop({ intro, fields, qualityLevels }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const filledCount = fields.filter((f) => values[f.id]?.trim()).length;
  const missingLabels = fields.filter((f) => !values[f.id]?.trim()).map((f) => f.label);
  const level = qualityLevels.find((l) => l.count === filledCount) ?? qualityLevels[0];
  const assembled = buildPrompt(fields, values);

  function update(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div>
      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{intro}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.id}
              className={cn("flex flex-col", f.id === "context" && "sm:col-span-2")}
            >
              <label htmlFor={`workshop-${f.id}`} className="text-sm font-semibold text-ink">
                {f.label}
              </label>
              <p id={`workshop-${f.id}-hint`} className="mt-1 text-xs leading-relaxed text-ink-faint">
                {f.hint}
              </p>
              <textarea
                id={`workshop-${f.id}`}
                value={values[f.id] ?? ""}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={f.id === "context" ? 4 : 3}
                aria-describedby={`workshop-${f.id}-hint`}
                className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-paper-2 p-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-ink"
              />
            </div>
          ))}
        </div>

        <aside className="flex flex-col gap-5 rounded-2xl border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:sticky lg:top-24">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="kicker">Quality meter</p>
              <Pill tone={PILL_TONE[level.tone] ?? "neutral"}>{level.label}</Pill>
            </div>
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuenow={filledCount}
              aria-valuemin={0}
              aria-valuemax={fields.length}
              aria-label={`${filledCount} of ${fields.length} prompt parts filled`}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500 ease-out",
                  BAR_TONE[level.tone] ?? "bg-line-strong",
                )}
                style={{ width: `${(filledCount / fields.length) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-ink-faint">
              {filledCount}/{fields.length} parts
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{level.note}</p>
            {missingLabels.length > 0 && (
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                Still missing: <span className="font-semibold text-ink">{missingLabels.join(", ")}</span>
              </p>
            )}
          </div>

          <pre className="min-h-[200px] overflow-auto whitespace-pre-wrap rounded-xl border border-line-strong bg-paper-3 p-4 font-mono text-xs leading-relaxed text-ink">
            {assembled || "Your prompt builds here as you fill in the fields on the left."}
          </pre>

          {assembled ? (
            <CopyButton value={assembled} label="Copy my prompt" className="w-full justify-center" />
          ) : (
            <p className="text-center text-xs text-ink-faint">
              Fill in at least one field to copy your prompt.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
