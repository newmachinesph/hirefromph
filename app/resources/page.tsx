import type { Metadata } from "next";
import resources from "@/data/resources.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Stat,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/resources";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Free Resources",
  description:
    "The free shelf for Filipino online professionals: verified free courses, government programs, docs, and YouTube channels that get you hired, plus how to judge any free course before it takes your week, and how to turn study into proof.",
});

const COST_TONE: Record<string, "verified" | "info" | "caution" | "neutral"> = {
  free: "verified",
  "open-source": "verified",
  freemium: "info",
  "free-trial": "caution",
  paid: "neutral",
};
const COST_LABEL: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

type ShelfItem = { org: string; title: string; url: string; why: string; cost: string };
type Savings = { note: string; asOf: string; basis: { tool: string; monthly: number }[] };
type ShelfGroup = {
  id: string;
  title: string;
  note: string;
  items: ShelfItem[];
  savings?: Savings;
};

function SavingsCallout({ savings }: { savings: Savings }) {
  const monthly = savings.basis.reduce((sum, b) => sum + b.monthly, 0);
  return (
    <Callout tone="verified" className="mt-5">
      <Stat
        value={`$${monthly}/mo`}
        label={`about $${monthly * 12} a year, saved on tools alone`}
        sub={savings.note}
      />
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {savings.basis.map((b) => (
          <Text key={b.tool} size="caption" tone="faint" as="span">
            {b.tool} <span className="tabular-nums text-ink-soft">${b.monthly}</span>
          </Text>
        ))}
      </div>
      <Text size="caption" tone="faint" className="mt-2">
        {savings.asOf}
      </Text>
    </Callout>
  );
}

export default function ResourcesPage() {
  const { hero, judge, shelf, protocol, closing } = resources;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
        <FreshnessNote date={resources.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/resources" /></Section> */}
      </PageHero>

      {/* -------------------------------------------------------------- JUDGE */}
      <Section band="tint">
        <SectionHeading kicker={judge.kicker} title={judge.title} lead={judge.lead} />
        <CardGrid cols={3} className="mt-12">
          {judge.tests.map((t) => (
            <Card key={t.q} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={t.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-5" balance>
                {t.q}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {t.why}
              </Text>
            </Card>
          ))}
        </CardGrid>
        <Callout tone="signal" className="mt-8 max-w-2xl">
          {judge.note}
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- SHELF */}
      <Section>
        <SectionHeading kicker={shelf.kicker} title={shelf.title} lead={shelf.lead} />

        <div className="mt-12 flex flex-col gap-14">
          {(shelf.groups as ShelfGroup[]).map((g) => (
            <div key={g.id}>
              <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                <Heading level={3} size="h3">
                  {g.title}
                </Heading>
                <Text size="small" className="max-w-2xl">
                  {g.note}
                </Text>
              </div>

              {g.savings && <SavingsCallout savings={g.savings} />}

              <CardGrid cols={3} className="mt-7">
                {g.items.map((item) => (
                  <Card key={item.url} href={item.url} as="article">
                    <div className="flex items-center justify-between gap-2">
                      <Kicker>{item.org}</Kicker>
                      <Badge tone={COST_TONE[item.cost] ?? "verified"}>
                        {COST_LABEL[item.cost] ?? "Open"}
                      </Badge>
                    </div>
                    <Heading level={4} size="h5" className="mt-3" balance>
                      {item.title}
                    </Heading>
                    <Text size="small" className="mt-3 flex-1">
                      {item.why}
                    </Text>
                    <Text size="caption" tone="faint" className="mt-5 inline-flex items-center gap-1.5">
                      Open the resource
                      <Icon name="arrow-up-right" size={12} />
                    </Text>
                  </Card>
                ))}
              </CardGrid>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- PROTOCOL */}
      <Section band="tint">
        <SectionHeading kicker={protocol.kicker} title={protocol.title} lead={protocol.lead} />
        <StepList className="mt-14">
          {protocol.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {protocol.crossrefs.map((c) => (
            <Button
              key={c.href}
              href={c.href}
              variant="link"
              iconEnd={<Icon name="arrow-up-right" size={16} />}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section>
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={3} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href}>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/ai-first">Start with the AI layer</Button>
          <Button href="/tasks" variant="outline">
            Turn it into proof
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/resources" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
