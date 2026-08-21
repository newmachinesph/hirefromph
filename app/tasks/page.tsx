import type { Metadata } from "next";
import tasksData from "@/data/tasks.json";
import { MicroTasks } from "@/components/micro-tasks";
import { JsonLd } from "@/components/json-ld";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Button, Callout, Card, Heading, Icon, Kicker, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { BASE_URL } from "@/app/sitemap";

const HREF = "/tasks";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Micro-Tasks",
  description: tasksData.intro,
});

// ItemList of every micro-task, derived from the data so it can't drift.
const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Hire From PH micro-tasks",
  description: tasksData.intro,
  url: `${BASE_URL}/tasks`,
  numberOfItems: tasksData.tasks.length,
  itemListElement: tasksData.tasks.map((task, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: task.title,
  })),
};

// One icon per step of the doctrine's four-step brief shape; data stays in tasks.json.
const STEP_ICONS = ["list-checks", "book-open", "hammer", "trophy"];

export default function TasksPage() {
  return (
    <>
      <JsonLd data={itemListLd} />

      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={tasksData.kicker}
        title={tasksData.headline}
        lead={tasksData.intro}
      >
        <Callout title="The creed" className="max-w-2xl">
          {tasksData.creed}
        </Callout>
      </PageHero>

      <Section>
        <SectionHeading
          kicker="The shape of every task"
          title="Prerequisite → Resources → The Task → Prove it"
          lead="Every micro-task follows the same four-step brief, the same shape a real client hands a working professional."
        />
        <CardGrid cols={4} className="mt-12">
          {tasksData.howItWorks.map((step, idx) => (
            <Card key={step.title} as="article">
              <span className="font-display text-h3 tabular-nums text-line-strong">
                0{idx + 1}
              </span>
              <span className="mt-4 grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={STEP_ICONS[idx] ?? "list-checks"} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-4">
                {step.title}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {step.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section spacing="none" className="pb-24 lg:pb-32">
        <Card padding="lg">
          <MicroTasks />
        </Card>
      </Section>

      <Section band="tint">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col">
            <Kicker>Turn it into a portfolio</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              Every finished task is a portfolio piece
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Learn the anatomy of a real portfolio, then assemble your finished micro-tasks into
              one.
            </Text>
            <div className="mt-5">
              <Button href="/build" variant="outline">
                Open the portfolio lab
              </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <Kicker>Ready to apply</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              Take it straight to a client
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Finished a few of these? You already have proof. Go find who needs it.
            </Text>
            <div className="mt-5">
              <Button href="/apply">Find work</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
