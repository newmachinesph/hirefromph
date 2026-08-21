import type { Metadata } from "next";
import salary from "@/data/salary.json";
import { RateCalculator } from "@/components/rate-calculator";
import { RateWorksheet } from "@/components/rate-worksheet";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  SourceList,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/salary";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Salary Guide",
  description:
    "What online work really pays for Filipino professionals right now. In-demand roles from live OnlineJobs.ph listings, honest vendor-grade pay ranges, full-time vs part-time vs hourly vs project vs retainer, and how to price yourself. Every number labeled for what it is.",
});

const TOC = [
  { id: "warning", label: "Warning label" },
  { id: "in-demand", label: "In demand" },
  { id: "emerging", label: "Emerging" },
  { id: "rates", label: "The ranges" },
  { id: "worksheet", label: "Price it yourself" },
  { id: "engagement", label: "Engagement types" },
  { id: "price", label: "How to price" },
  { id: "calculator", label: "Real rate" },
];

export default function SalaryPage() {
  const { hero, warning, inDemand, emerging, rates, engagement, price, closing } = salary;

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
        <FreshnessNote date={salary.lastVerified} />
        <Section spacing="none"><Tldr route="/salary" /></Section>
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ----------------------------------------------------- WARNING */}
            <section id="warning">
              <Callout tone="caution" title={warning.title}>
                <Badge tone="caution">Warning label</Badge>
                <Text size="small" className="mt-4 max-w-3xl">
                  {warning.body}
                </Text>
              </Callout>
            </section>

            {/* --------------------------------------------------- IN DEMAND */}
            <section id="in-demand">
              <SectionHeading
                kicker={inDemand.kicker}
                title={inDemand.title}
                lead={inDemand.lead}
              />
              <CardGrid cols={4} className="mt-12">
                {inDemand.roles.map((r) => (
                  <Card key={r.role} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={r.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5" balance>
                      {r.role}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {r.blurb}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
              <Callout tone="verified" className="mt-8">
                <Text size="lead" tone="ink" className="font-display">
                  {inDemand.note}
                </Text>
                <Source
                  label={inDemand.source.label}
                  url={inDemand.source.url}
                  className="mt-3"
                />
              </Callout>
            </section>

            {/* ---------------------------------------------------- EMERGING */}
            <section id="emerging">
              <SectionHeading
                kicker={emerging.kicker}
                title={emerging.title}
                lead={emerging.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {emerging.roles.map((r) => (
                  <Card key={r.role} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary text-white">
                      <Icon name={r.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5" balance>
                      {r.role}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {r.blurb}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
              <Callout tone="signal" className="mt-8 max-w-3xl">
                {emerging.note}
              </Callout>
              <Text size="small" tone="ink" className="mt-5 max-w-3xl font-medium">
                {emerging.note2}
              </Text>
              <Source
                label={emerging.source.label}
                url={emerging.source.url}
                className="mt-3"
              />
            </section>

            {/* ------------------------------------------------------- RATES */}
            <section id="rates">
              <SectionHeading kicker={rates.kicker} title={rates.title} />
              <Text size="small" tone="ink" className="mt-6 max-w-2xl font-medium">
                {rates.monthlyNote}
              </Text>

              <CardGrid cols={3} className="mt-10">
                {rates.tiers.map((t) => {
                  const a = accent(t.accent);
                  return (
                    <Card key={t.level} as="article">
                      <span aria-hidden className={cn("h-1 w-10 rounded-pill", a.fill)} />
                      <div className="mt-5">
                        <Kicker tone={t.accent as "signal"}>{t.level}</Kicker>
                      </div>
                      <StatStrip className="mt-3">
                        <Stat value={t.monthly} label={t.hourly} />
                      </StatStrip>
                      <Text size="small" className="mt-5 flex-1">
                        {t.what}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>

              <Card padding="lg" className="mt-6">
                <Heading level={3} size="h3" balance>
                  {rates.contradiction.title}
                </Heading>
                <Text size="small" className="mt-4 max-w-3xl">
                  {rates.contradiction.body}
                </Text>

                <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <Card padding="sm" className="text-center">
                    <StatStrip className="justify-center">
                      <Stat
                        value={rates.contradiction.a.value}
                        label={rates.contradiction.a.label}
                      />
                    </StatStrip>
                  </Card>
                  <Text size="lead" tone="inherit" className="text-center font-display text-primary">
                    vs
                  </Text>
                  <Card padding="sm" className="text-center">
                    <StatStrip className="justify-center">
                      <Stat
                        value={rates.contradiction.b.value}
                        label={rates.contradiction.b.label}
                      />
                    </StatStrip>
                  </Card>
                </div>

                <Callout tone="signal" className="mt-7 max-w-3xl">
                  {rates.contradiction.lesson}
                </Callout>

                <SourceList sources={rates.sources} className="mt-7 border-t border-line pt-5" />
              </Card>
            </section>

            {/* --------------------------------------------------- WORKSHEET */}
            <section id="worksheet">
              <Card padding="lg">
                <RateWorksheet />
              </Card>
            </section>

            {/* -------------------------------------------------- ENGAGEMENT */}
            <section id="engagement">
              <SectionHeading
                kicker={engagement.kicker}
                title={engagement.title}
                lead={engagement.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {engagement.types.map((t) => (
                  <Card key={t.name} as="article">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={t.icon} size={18} />
                      </span>
                      <Heading level={3} size="h5">
                        {t.name}
                      </Heading>
                    </div>
                    <Text size="caption" className="mt-3 font-medium text-verified">
                      {t.best}
                    </Text>

                    <ul className="mt-4 flex flex-col gap-2">
                      {t.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2">
                          <Icon name="check" size={15} className="mt-0.5 shrink-0 text-verified" />
                          <Text size="small" tone="ink" as="span">
                            {p}
                          </Text>
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-3 flex flex-col gap-2">
                      {t.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2">
                          <Icon name="x" size={15} className="mt-0.5 shrink-0 text-coral" />
                          <Text size="small" as="span">
                            {c}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ------------------------------------------------------- PRICE */}
            <section id="price">
              <SectionHeading kicker={price.kicker} title={price.title} lead={price.lead} />
              <StepList className="mt-14">
                {price.steps.map((s) => (
                  <Step key={s.n} n={s.n} title={s.title}>
                    {s.desc}
                  </Step>
                ))}
              </StepList>
            </section>

            {/* -------------------------------------------------- CALCULATOR */}
            <section id="calculator">
              <SectionHeading
                kicker="Do the math yourself"
                title="Your real rate calculator."
                lead="Drag the sliders with your own numbers. Watch your headline rate shrink into what you take home, once the fees, the costs, the tax, and the unpaid time are counted. This is the honest number to plan your life around."
              />
              <Card padding="lg" className="mt-12">
                <RateCalculator />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={4} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
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
          <Button href="/niches">Pick your lane</Button>
          <Button href="/reality" variant="outline">
            See the full market data
          </Button>
        </div>
      </Section>

      <PracticeFooter route="/salary" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
