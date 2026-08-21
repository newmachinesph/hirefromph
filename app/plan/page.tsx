import type { Metadata } from "next";
import plan from "@/data/plan.json";
import { PlanWizard } from "@/components/plan-wizard";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Badge, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/plan";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Your 30-Day Plan",
  description: plan.intro,
});

const QUICK_FACTS: { icon: string; label: string; tone: "signal" | "caution" | "verified" }[] = [
  { icon: "door-open", label: "Open to all", tone: "signal" },
  { icon: "clock", label: plan.commitment, tone: "caution" },
  { icon: "save", label: "Progress saved automatically", tone: "verified" },
];

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "Answer 5 quick questions",
    desc: "Experience, track, hours, equipment, and language goals.",
    icon: "list-checks",
  },
  {
    n: 2,
    title: "Get your day-by-day plan",
    desc: "30 days, mapped out with exact tasks and the in-app tool for each.",
    icon: "calendar-check",
  },
  {
    n: 3,
    title: "Track daily, right here",
    desc: "Check off each day as you finish it. Nothing to export or print.",
    icon: "check-circle-2",
  },
];

export default function PlanPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Your 30-day plan"
        title="Thirty days. One clear plan."
        accent="Built around you."
        lead={plan.intro}
      >
        <div className="flex flex-wrap gap-3">
          {QUICK_FACTS.map((f) => (
            <Badge key={f.label} tone={f.tone}>
              <Icon name={f.icon} size={13} />
              {f.label}
            </Badge>
          ))}
        </div>
      </PageHero>

      <Section>
        <SectionHeading
          kicker="How it works"
          title="Five minutes to a plan that fits your life"
          lead="No generic checklist. Your answers shape every one of the 30 days."
        />
        <CardGrid cols={3} className="mt-10">
          {HOW_IT_WORKS.map((s) => (
            <Card key={s.n}>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-ink font-display text-small tabular-nums text-on-navy">
                  0{s.n}
                </span>
                <Icon name={s.icon} size={18} className="text-primary" />
              </div>
              <Heading level={3} size="h5" className="mt-5">
                {s.title}
              </Heading>
              <Text size="small" className="mt-2">
                {s.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

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
