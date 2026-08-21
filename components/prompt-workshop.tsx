"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  Badge,
  Button,
  Card,
  Field,
  Icon,
  Kicker,
  ProgressBar,
  Text,
  Textarea,
} from "@/components/ui";
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

/**
 * Map the free-text `tone` string from data/prompting.json onto the shared
 * Badge/accent union so the component reuses the primitives without a cast.
 */
const TONE: Record<string, "neutral" | "signal" | "verified" | "caution"> = {
  neutral: "neutral",
  signal: "signal",
  caution: "caution",
  verified: "verified",
};

function buildPrompt(fields: BuilderField[], values: Record<string, string>): string {
  return fields
    .filter((f) => values[f.id]?.trim())
    .map((f) => `${f.label}: ${values[f.id].trim()}`)
    .join("\n\n");
}

/** Placeholders read "e.g. …"; the sample is whatever follows that prefix. */
function sampleValue(placeholder: string): string {
  return placeholder.replace(/^e\.g\.\s*/i, "").trim();
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

  function loadSample() {
    setValues(Object.fromEntries(fields.map((f) => [f.id, sampleValue(f.placeholder)])));
  }

  function clear() {
    setValues({});
  }

  return (
    <div>
      <Text size="small" className="max-w-2xl">
        {intro}
      </Text>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={loadSample}>
          Use the sample prompt
        </Button>
        {filledCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            icon={<Icon name="rotate-ccw" size={14} />}
          >
            Clear
          </Button>
        )}
      </div>

      {/*
        Below `lg` the meter and preview render first so the live assembly is
        on screen before the first field; from `lg` they sit to the right and
        stick while the reader scrolls the fields.
      */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="order-2 grid gap-5 sm:grid-cols-2 lg:order-1">
          {fields.map((f) => (
            <Field
              key={f.id}
              label={f.label}
              hint={f.hint}
              className={cn(f.id === "context" && "sm:col-span-2")}
            >
              <Textarea
                value={values[f.id] ?? ""}
                onChange={(e) => update(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={f.id === "context" ? 4 : 3}
              />
            </Field>
          ))}
        </div>

        <Card as="section" padding="md" className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <Kicker>Quality meter</Kicker>
                <Badge tone={TONE[level.tone] ?? "neutral"}>{level.label}</Badge>
              </div>
              <ProgressBar
                className="mt-3"
                value={filledCount}
                max={fields.length}
                label={`${filledCount} of ${fields.length} prompt parts filled`}
                hideLabel
                tone={TONE[level.tone] ?? "neutral"}
              />
              <Text size="caption" tone="faint" className="mt-2 font-medium tabular-nums">
                {filledCount}/{fields.length} parts
              </Text>
              <Text size="caption" className="mt-2">
                {level.note}
              </Text>
              {missingLabels.length > 0 && (
                <Text size="caption" tone="faint" className="mt-2">
                  Still missing:{" "}
                  <span className="font-semibold text-ink">{missingLabels.join(", ")}</span>
                </Text>
              )}
            </div>

            <pre className="min-h-[200px] overflow-auto whitespace-pre-wrap rounded-sm border border-line-strong bg-band p-4 text-caption leading-relaxed text-ink">
              {assembled || "Your prompt builds here as you fill in the fields."}
            </pre>

            {assembled ? (
              <CopyButton value={assembled} label="Copy my prompt" className="w-full justify-center" />
            ) : (
              <Text size="caption" tone="faint" className="text-center">
                Fill in at least one field to copy your prompt.
              </Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
