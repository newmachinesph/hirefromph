import type { Metadata } from "next";
import plan from "@/data/plan.json";
import { PlanHoursBadge, PlanWizard } from "@/components/plan-wizard";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { Badge, Card, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/plan";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Your 30-Day Plan",
  description: plan.intro,
});

// Collapsed from three cards to one line so the first question sits on the
// first screen; the wizard's own progress bar carries the step count.
const HOW_IT_WORKS = [
  "Answer 5 quick questions",
  "Get your 30 days, with the in-app tool for each",
  "Tick days off here, progress saves in this browser",
];

export default function PlanPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Your 30-day plan"
        title="Thirty days. One clear plan."
        accent="Your track and hours filled in."
        lead={plan.intro}
      >
        <div className="flex flex-wrap gap-3">
          <Badge tone="signal">
            <Icon name="door-open" size={13} />
            No cost, no sign-up
          </Badge>
          <PlanHoursBadge />
          <Badge tone="verified">
            <Icon name="save" size={13} />
            Progress saved automatically
          </Badge>
        </div>
        <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {HOW_IT_WORKS.map((step, idx) => (
            <li key={step} className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-pill bg-ink font-display text-caption tabular-nums text-on-navy">
                {idx + 1}
              </span>
              <Text size="small" as="span">
                {step}
              </Text>
            </li>
          ))}
        </ol>
        <Text size="small" tone="faint" className="mt-4 max-w-2xl">
          {plan.shapedBy}
        </Text>
      </PageHero>

      <Section spacing="none" className="pb-24">
        <Card padding="lg">
          <PlanWizard />
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
