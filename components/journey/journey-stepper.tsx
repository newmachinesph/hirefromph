"use client";

import Link from "next/link";
import { JourneyMap } from "@/components/diagrams/journey-map";
import { Button, DiagramFrame, Icon, ProgressBar, Text } from "@/components/ui";
import roadmap from "@/data/roadmap.json";
import { usePath } from "@/lib/path-context";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = roadmap.steps.length;

export type JourneyStepperVariant = "compact" | "full";

export type JourneyStepperProps = {
  /** `compact` (default) is the stepper row only; `full` adds the diagram, bar and link. */
  variant?: JourneyStepperVariant;
  /** Full variant only: render the five-stage row under the progress card. Pages that list the stages themselves pass false. */
  showRow?: boolean;
  /** 1-based stage to mark as current. Falls back to the visitor's saved stage. */
  current?: number;
  className?: string;
};

/**
 * The glue across the whole journey (spec §5.5). Merges the old JourneyProgress
 * card and the 11-column roadmap strip that used to live inside StagePage.
 *
 * Reads the same localStorage progress the /path dashboard writes, so a
 * beginner feels the site as one road. Before hydration the context is empty on
 * both sides of the render, so the markup matches and nothing flashes.
 */
export function JourneyStepper({
  variant = "compact",
  showRow = true,
  current,
  className,
}: JourneyStepperProps) {
  const { state, hydrated } = usePath();

  const doneCount = roadmap.steps.filter((step) => state.steps[step.n]).length;
  const started = hydrated && (doneCount > 0 || state.startedAt !== null);
  const activeStage = current ?? state.stage;

  const stepper = (
    <ol className="grid grid-cols-5 gap-2">
      {STAGES.map((stage) => {
        const stageSteps = roadmap.steps.filter((step) => step.stage === stage.num);
        const done =
          stageSteps.length > 0 && stageSteps.every((step) => state.steps[step.n]);
        const isCurrent = activeStage === stage.num;

        return (
          <li key={stage.num} className="min-w-0">
            <Link
              href={stage.href}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-col items-center gap-1.5 rounded-md px-1 py-2 text-center transition-colors duration-150 ease-out hover:bg-band"
            >
              <span
                aria-hidden
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-pill border text-small font-semibold",
                  done
                    ? "border-verified bg-verified-tint text-verified"
                    : isCurrent
                      ? "border-primary bg-primary-tint text-primary-deep"
                      : "border-line-strong text-ink-faint",
                )}
              >
                {done ? <Icon name="check-circle-2" size={16} weight="fill" /> : stage.num}
              </span>
              <span
                className={cn(
                  "text-caption leading-tight",
                  isCurrent ? "text-ink" : "text-ink-faint",
                )}
              >
                {stage.title}
              </span>
              {done && <span className="sr-only">done</span>}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "compact") {
    return (
      <nav aria-label="The five stages" className={className}>
        {stepper}
      </nav>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <DiagramFrame
        title="The path: five stages, eleven steps"
        caption="Read it left to right. The ticks under each stage are its roadmap steps."
      >
        <JourneyMap current={activeStage} />
      </DiagramFrame>

      <div className="flex flex-col gap-4 rounded-md border border-line-strong bg-paper p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text size="small" tone="faint">
            {started ? "Your progress" : "Nothing ticked yet"}
          </Text>
          <ProgressBar
            value={doneCount}
            max={TOTAL_STEPS}
            label="Roadmap steps complete"
            showValue
          />
        </div>
        <Button
          href="/path"
          variant="outline"
          size="md"
          iconEnd={<Icon name="arrow-right" size={16} />}
        >
          {started ? "Continue" : "Open your path"}
        </Button>
      </div>

      {showRow && <nav aria-label="The five stages">{stepper}</nav>}
    </div>
  );
}
