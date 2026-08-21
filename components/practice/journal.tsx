"use client";

import { useEffect, useId, useState } from "react";
import { formatIsoDate } from "@/lib/dates";
import { Badge, Button, Field, Heading, Text, Textarea } from "@/components/ui";
import { useJournalWeek } from "./hooks";

/**
 * One reflection prompt per ISO week (spec §7.4.5).
 *
 * Twelve prompts rotate; the entry is keyed by ISO week, so a visitor gets one
 * box per week rather than an endless log. Nothing leaves the browser.
 */
export function Journal() {
  const baseId = useId();
  const { week, prompt, entry, save, hydrated } = useJournalWeek();
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  // Seed the box from storage once the week and the entry are known.
  useEffect(() => {
    if (!hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(entry?.text ?? "");
  }, [hydrated, entry?.text]);

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-5 rounded-lg border border-line-strong bg-paper p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={2} size="h4" id={`${baseId}-title`}>
          This week&rsquo;s question
        </Heading>
        {hydrated && <Badge tone="neutral">{week}</Badge>}
      </div>

      <Text size="lead" tone="ink">
        {prompt}
      </Text>

      <Field
        label="Your answer this week"
        hint="Saved in this browser only. Nobody else can read it."
      >
        <Textarea
          rows={5}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setSaved(false);
          }}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          disabled={!hydrated || draft.trim().length === 0}
          onClick={() => {
            save(draft.trim());
            setSaved(true);
          }}
        >
          Save this week
        </Button>
        <p role="status" className="text-small text-ink-faint">
          {saved
            ? "Saved."
            : entry
              ? `Last saved ${formatIsoDate(entry.updated)}.`
              : ""}
        </p>
      </div>
    </section>
  );
}
