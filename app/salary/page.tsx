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
  Accordion,
  AccordionItem,
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
import { DEFAULT_FX, DEFAULT_FX_SAMPLED } from "@/lib/simulator-math";
import { PracticeFooter, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/salary";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Salary Guide",
  description:
    "What online work really pays for Filipino professionals right now. Honest vendor-grade pay ranges, a worksheet that prices you from live OnlineJobs.ph posts, a real-rate calculator, how to price yourself, and full-time vs part-time vs hourly vs project vs retainer. Every number labeled for what it is.",
});

const TOC = [
  { id: "warning", label: "Warning label" },
  { id: "rates", label: "The ranges" },
  { id: "worksheet", label: "Price it yourself" },
  { id: "calculator", label: "Real rate" },
  { id: "price", label: "How to price" },
  { id: "engagement", label: "Engagement types" },
  { id: "roles", label: "Roles clients post for" },
];

type RoleItem = { role: string; icon: string; blurb: string };

function RoleList({ roles }: { roles: RoleItem[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {roles.map((r) => (
        <li key={r.role} className="flex items-start gap-3">
          <Icon name={r.icon} size={16} className="mt-1 shrink-0 text-ink-faint" />
          <Text size="small" as="span">
            <span className="font-medium text-ink">{r.role}.</span> {r.blurb}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export default function SalaryPage() {
  const { hero, warning, roles, inDemand, emerging, rates, engagement, price, closing } = salary;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
        actions={<Button href="#calculator">{hero.jumpLabel}</Button>}
      >
        <Toc items={TOC} mobile />
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
                      <div className="mt-3 flex flex-col gap-4">
                        <Stat value={t.monthly} label={rates.labels.monthly} />
                        <Stat value={t.hourly} label={rates.labels.hourly} />
                      </div>
                      <Text size="small" className="mt-5 flex-1">
                        {t.what}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
              <Text size="caption" tone="faint" className="mt-4 max-w-3xl">
                {rates.reconcileNote}
              </Text>

              <Card padding="lg" className="mt-6">
                <Heading level={3} size="h3" balance>
                  {rates.contradiction.title}
                </Heading>
                <Text size="small" className="mt-4 max-w-3xl">
                  {rates.contradiction.body}
                </Text>
                <Text size="caption" tone="faint" className="mt-3 max-w-3xl">
                  Dollar figures on this page convert at ≈₱{DEFAULT_FX} per $1, the{" "}
                  {DEFAULT_FX_SAMPLED} reference rate. The worksheet and calculator below start
                  from the same number and let you change it.
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
              <SectionHeading
                kicker="Price it yourself · from live posts"
                title="Five real posts beat any guide."
                lead="Paste in listings you found for your role. The worksheet normalizes each one to pesos a month and hands you a floor, a middle, and a ceiling you can defend in a negotiation."
              />
              <Card padding="lg" className="mt-12">
                <RateWorksheet />
              </Card>
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

            {/* -------------------------------------------------- ENGAGEMENT */}
            <section id="engagement">
              <SectionHeading
                kicker={engagement.kicker}
                title={engagement.title}
                lead={engagement.lead}
              />
              <Accordion type="multiple" className="mt-10">
                {engagement.types.map((t) => (
                  <AccordionItem
                    key={t.name}
                    id={t.name}
                    title={
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                          <Icon name={t.icon} size={16} />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span>{t.name}</span>
                          <Text as="span" size="caption" className="font-sans font-medium text-verified">
                            {t.best}
                          </Text>
                        </span>
                      </span>
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ul className="flex flex-col gap-2">
                        {t.pros.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <Icon name="check" size={15} className="mt-0.5 shrink-0 text-verified" />
                            <Text size="small" tone="ink" as="span">
                              {p}
                            </Text>
                          </li>
                        ))}
                      </ul>
                      <ul className="flex flex-col gap-2">
                        {t.cons.map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <Icon name="x" size={15} className="mt-0.5 shrink-0 text-coral" />
                            <Text size="small" as="span">
                              {c}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* ------------------------------------------------------- ROLES */}
            <section id="roles">
              <SectionHeading kicker={roles.kicker} title={roles.title} lead={roles.lead} />

              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div>
                  <Heading level={3} size="h5">
                    {roles.postingTitle}
                  </Heading>
                  <RoleList roles={inDemand.roles} />
                  <Source
                    label={inDemand.source.label}
                    url={inDemand.source.url}
                    className="mt-4"
                  />
                </div>
                <div>
                  <Heading level={3} size="h5">
                    {roles.emergingTitle}
                  </Heading>
                  <RoleList roles={emerging.roles} />
                  <Text size="small" className="mt-4 max-w-xl">
                    {emerging.note}
                  </Text>
                  <div className="mt-3">
                    <Button
                      href={emerging.note2Href}
                      variant="link"
                      iconEnd={<Icon name="arrow-up-right" size={16} />}
                    >
                      {emerging.note2}
                    </Button>
                  </div>
                  <Source
                    label={emerging.source.label}
                    url={emerging.source.url}
                    className="mt-4"
                  />
                </div>
              </div>

              <Callout tone="verified" className="mt-8 max-w-3xl">
                <Text size="lead" tone="ink" className="font-display">
                  {inDemand.note}
                </Text>
                <div className="mt-4">
                  <Button
                    href={roles.nichesLink.href}
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    {roles.nichesLink.label}
                  </Button>
                </div>
              </Callout>
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
          <Button href="#worksheet">Price yourself from live posts</Button>
          <Button href="/niches" variant="outline">
            Pick your lane
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
