"use client";

import { useId, useState } from "react";
import { getScenario, walk } from "@/lib/scenario";
import { Badge, Button, Callout, Heading, Icon, Step, StepList, Text } from "@/components/ui";

/**
 * A branching scenario (spec §7.4.2).
 *
 * The component owns nothing but the list of chosen indices; `walk` rebuilds
 * the path from the start on every render, so "back one step" is a slice and
 * there is no undo stack to fall out of sync.
 *
 * There is deliberately no score. Some forks are trade-offs, and the debrief
 * names the principle each one tested instead of grading it.
 */
export function Scenario({ scenarioId }: { scenarioId: string }) {
  const baseId = useId();
  const scenario = getScenario(scenarioId);
  const [choices, setChoices] = useState<number[]>([]);

  if (!scenario) return null;

  const state = walk(scenario, choices);
  const lastNote = state.steps.at(-1)?.choice?.note;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6 lg:p-8"
    >
      <div className="flex flex-col gap-3">
        <Badge tone="info" variant="outline">
          Scenario
        </Badge>
        <Heading level={2} size="h3" id={`${baseId}-title`}>
          {scenario.title}
        </Heading>
        <Text>{scenario.intro}</Text>
      </div>

      {lastNote && (
        <Callout tone="neutral" icon="quote">
          {lastNote}
        </Callout>
      )}

      <div className="rounded-md border border-line bg-band p-5">
        <Text tone="ink" className="whitespace-pre-line">
          {state.current.text}
        </Text>
      </div>

      {!state.finished && (
        <div role="group" aria-label="What do you do?" className="flex flex-col gap-3">
          {(state.current.choices ?? []).map((choice, index) => (
            // Raw <button>: a full-width decision row that wraps to several
            // lines, which none of Button's variants is shaped for.
            <button
              key={choice.next + choice.label}
              type="button"
              data-testid="scenario-choice"
              onClick={() => setChoices([...choices, index])}
              className="rounded-md border border-line-strong p-4 text-left text-base text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-band"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {state.finished && (
        <div data-testid="scenario-debrief" className="flex flex-col gap-5 border-t border-line pt-6">
          <Heading level={3} size="h5">
            The path you took
          </Heading>
          <StepList>
            {state.steps.map((step, index) => (
              <Step key={`${step.id}-${index}`} n={index + 1} title={step.choice?.label ?? ""}>
                <span data-testid="scenario-tested">{step.choice?.tests}</span>
              </Step>
            ))}
          </StepList>

          {state.current.debrief && <Text tone="ink">{state.current.debrief}</Text>}

          <div className="flex flex-wrap gap-3">
            <Button
              href={scenario.route}
              variant="secondary"
              iconEnd={<Icon name="arrow-up-right" size={14} />}
            >
              Read the rule in the guide
            </Button>
            <Button variant="ghost" onClick={() => setChoices([])}>
              Start over
            </Button>
          </div>
          <Text size="small">
            Walk it again down a different fork. Two of these paths are trade-offs, so the second
            run teaches more than the first.
          </Text>
        </div>
      )}

      {!state.finished && choices.length > 0 && (
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Button variant="ghost" size="sm" onClick={() => setChoices(choices.slice(0, -1))}>
            Back one step
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setChoices([])}>
            Start over
          </Button>
        </div>
      )}
    </section>
  );
}
