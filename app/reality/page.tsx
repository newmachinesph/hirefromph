import type { Metadata } from "next";
import reality from "@/data/reality.json";
import { Bars } from "@/components/diagrams/charts";
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
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Stat,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/reality";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Reality Check",
  description:
    "What the evidence says about remote and online work for Filipinos right now. The unpaid quarter of your hours, the non-payment rate, what AI really cut, where demand is growing, every number with its source, and an honest list of what nobody knows.",
});

const TOC = [
  { id: "myths", label: "Seven myths" },
  { id: "proof", label: "What AI cut" },
  { id: "growth", label: "Where it grows" },
  { id: "thesis", label: "The thesis" },
  { id: "unknown", label: "What nobody knows" },
  { id: "reading", label: "Read it yourself" },
];

/** The chart's number format: signed percent, minus sign not hyphen. */
function fmt(value: number): string {
  const sign = value > 0 ? "+" : "−";
  return `${sign}${Math.abs(value)}%`;
}

export default function RealityPage() {
  const { method, ai, growth, thesis, unknown, reading, closing } = reality;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Reality check · every number sourced"
        title={reality.heroTitle.line1}
        accent={reality.heroTitle.line2}
        lead={reality.intro}
      >
        <Toc items={TOC} mobile />
        <Callout tone="signal" className="max-w-2xl">
          {reality.creed}
        </Callout>
        <FreshnessNote date={reality.lastVerified} />
        <Section spacing="none"><Tldr route="/reality" /></Section>
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------------ METHOD */}
            <Callout tone="info" title={method.title} className="max-w-3xl">
              <Kicker>{method.kicker}</Kicker>
              <Text size="small" className="mt-4">
                {method.body}
              </Text>
              <div className="mt-4">
                <Button
                  href={method.link.href}
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={16} />}
                >
                  {method.link.label}
                </Button>
              </div>
            </Callout>

            {/* ------------------------------------------------------- MYTHS */}
            <section id="myths">
              <SectionHeading
                kicker="Expectation vs reality"
                title="Seven things you were told. Seven things the data says."
                lead={reality.mythsIntro}
              />

              <Accordion type="multiple" className="mt-12">
                {reality.myths.map((m) => {
                  const a = accent(m.accent);
                  return (
                    <AccordionItem
                      key={m.id}
                      id={m.id}
                      title={
                        <span className="flex flex-col gap-2 pr-2">
                          <span>
                            <Badge tone={m.accent as "signal"} variant="outline">
                              {m.tag}
                            </Badge>
                          </span>
                          <Text
                            as="span"
                            size="lead"
                            tone="faint"
                            className="font-display line-through decoration-coral/50 decoration-2"
                          >
                            {m.myth}
                          </Text>
                          <Text as="span" size="small" tone="ink" className="font-sans font-normal">
                            <span className="font-semibold">The sting:</span> {m.sting}
                          </Text>
                        </span>
                      }
                    >
                      <article className="flex flex-col gap-4">
                        <Heading level={3} size="h4" balance>
                          {m.headline}
                        </Heading>
                        <Text size="small">{m.body}</Text>
                        <Text
                          size="small"
                          tone="ink"
                          className={cn("border-l-2 pl-4 font-medium", a.border)}
                        >
                          {m.lesson}
                        </Text>
                        <div className="flex flex-col gap-2">
                          <Source label={m.source.label} url={m.source.url} />
                          {m.source2 && <Source label={m.source2.label} url={m.source2.url} />}
                          {m.sourceNote && (
                            <Text size="caption" tone="faint" className="max-w-xl">
                              {m.sourceNote}
                            </Text>
                          )}
                        </div>
                      </article>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </section>

            {/* ------------------------------------------------------- PROOF */}
            <section id="proof">
              <SectionHeading kicker={ai.kicker} title={ai.title} lead={ai.lead} />
              <Callout tone="info" className="mt-6 max-w-2xl">
                {ai.framing}
              </Callout>

              <div className="mt-12 flex flex-col gap-10">
                {ai.charts.map((chart) => {
                  const max = Math.max(
                    ...chart.items.map((it) => Math.abs(it.value)),
                    chart.baseline ? Math.abs(chart.baseline.value) : 0,
                  );
                  return (
                    <div key={chart.id}>
                      <DiagramFrame title={chart.title} caption={chart.note}>
                        <Bars
                          diverging
                          max={max}
                          format={fmt}
                          labelWidth={260}
                          data={chart.items.map((it) => ({
                            id: it.label,
                            label: it.label,
                            value: it.value,
                            note: it.note || undefined,
                          }))}
                          reference={
                            chart.baseline
                              ? { value: chart.baseline.value, label: chart.baseline.label }
                              : undefined
                          }
                        />
                      </DiagramFrame>
                      <Source label={chart.source.label} url={chart.source.url} className="mt-4" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {ai.peerReviewed.title}
                  </Heading>
                  <Text size="small" className="mt-4 flex-1">
                    {ai.peerReviewed.body}
                  </Text>
                  <Source
                    label={ai.peerReviewed.source.label}
                    url={ai.peerReviewed.source.url}
                    className="mt-6"
                  />
                </Card>
                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {ai.wef.title}
                  </Heading>
                  <Text size="small" className="mt-4 flex-1">
                    {ai.wef.body}
                  </Text>
                  <Source label={ai.wef.source.label} url={ai.wef.source.url} className="mt-6" />
                </Card>
              </div>

              <Callout tone="verified" title={ai.counter.title} className="mt-6">
                <Kicker tone="verified">{ai.counter.kicker}</Kicker>
                <Text size="small" className="mt-4 max-w-3xl">
                  {ai.counter.body}
                </Text>
                <Text size="small" tone="ink" className="mt-5 max-w-3xl font-medium">
                  {ai.counter.conclusion}
                </Text>
                <Source
                  label={ai.counter.source.label}
                  url={ai.counter.source.url}
                  className="mt-5"
                />
              </Callout>
            </section>

            {/* ------------------------------------------------------ GROWTH */}
            <section id="growth">
              <SectionHeading kicker={growth.kicker} title={growth.title} lead={growth.lead} />

              <div className="mt-12 flex flex-col gap-10">
                {growth.groups.map((g) => {
                  const a = accent(g.accent);
                  const max = Math.max(...g.items.map((it) => it.value));
                  return (
                    <div key={g.id}>
                      <DiagramFrame title={g.title} caption={g.note}>
                        <Bars
                          max={max}
                          format={(v) => `+${v}%`}
                          labelWidth={280}
                          data={g.items.map((it, idx) => ({
                            id: it.label,
                            label: it.label,
                            value: it.value,
                            focal: idx === 0,
                          }))}
                        />
                      </DiagramFrame>
                      {g.extra && (
                        <Text
                          size="small"
                          tone="ink"
                          className={cn("mt-6 border-l-2 pl-4 font-medium", a.border)}
                        >
                          {g.extra}
                        </Text>
                      )}
                      <Source label={g.source.label} url={g.source.url} className="mt-4" />
                    </div>
                  );
                })}

                <Card as="article" padding="lg">
                  <Heading level={3} size="h3" balance>
                    {growth.linkedin.title}
                  </Heading>
                  <Text size="small" className="mt-4 max-w-3xl">
                    {growth.linkedin.body}
                  </Text>
                  <Source
                    label={growth.linkedin.source.label}
                    url={growth.linkedin.source.url}
                    className="mt-6"
                  />
                </Card>
              </div>
            </section>

            {/* ------------------------------------------------------ THESIS */}
            <section id="thesis">
              <SectionHeading kicker={thesis.kicker} title={thesis.title} lead={thesis.lead} />

              <div className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <Card padding="lg">
                  <Stat
                    value={thesis.premium.stat}
                    label={thesis.premium.label}
                    sub={thesis.premium.body}
                    source={{
                      label: thesis.premium.source.label,
                      url: thesis.premium.source.url,
                    }}
                  />
                </Card>

                <Card padding="lg">
                  <Heading level={3} size="h4" balance>
                    {thesis.nuance.title}
                  </Heading>
                  <Text size="small" className="mt-4">
                    {thesis.nuance.body}
                  </Text>
                  <blockquote className="mt-6 border-l-2 border-primary pl-5">
                    <Text size="lead" tone="ink" className="font-display">
                      &ldquo;{thesis.nuance.quote}&rdquo;
                    </Text>
                    <footer className="mt-3">
                      <Kicker>{thesis.nuance.attribution}</Kicker>
                    </footer>
                  </blockquote>
                  <Source
                    label={thesis.nuance.source.label}
                    url={thesis.nuance.source.url}
                    className="mt-6"
                  />
                </Card>
              </div>

              <Callout tone="verified" className="mt-10 max-w-4xl">
                {thesis.conclusion}
              </Callout>

              <Card padding="lg" className="mt-12">
                <Heading level={3} size="h4" balance>
                  {thesis.proof.title}
                </Heading>
                <Text size="small" className="mt-4 max-w-3xl">
                  {thesis.proof.body}
                </Text>
                <Source
                  label={thesis.proof.source.label}
                  url={thesis.proof.source.url}
                  className="mt-4"
                />
                <div className="mt-6">
                  <Button
                    href="/indispensable"
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    See the full freelancer vs employee breakdown on Become Indispensable
                  </Button>
                </div>
              </Card>
            </section>

            {/* ----------------------------------------------------- UNKNOWN */}
            <section id="unknown">
              <SectionHeading kicker={unknown.kicker} title={unknown.title} lead={unknown.lead} />

              <div className="mt-12 flex flex-col gap-4">
                {unknown.items.map((u) => (
                  <Card key={u.id} as="article">
                    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-8">
                      <div>
                        <Text
                          size="lead"
                          tone="faint"
                          className="font-display line-through decoration-coral/50 decoration-2"
                        >
                          {u.claim}
                        </Text>
                        <div className="mt-3">
                          <Badge tone="coral">{u.verdict}</Badge>
                        </div>
                      </div>
                      <Text size="small">{u.why}</Text>
                    </div>
                  </Card>
                ))}
              </div>

              <Callout tone="signal" className="mt-8 max-w-2xl">
                {unknown.close}
              </Callout>
            </section>

            {/* ----------------------------------------------------- READING */}
            <section id="reading">
              <SectionHeading kicker={reading.kicker} title={reading.title} lead={reading.lead} />

              <div className="mt-12 flex flex-col gap-14">
                {reading.groups.map((g) => (
                  <div key={g.id}>
                    <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                      <Heading level={3} size="h3">
                        {g.title}
                      </Heading>
                      <Text size="small" className="max-w-2xl">
                        {g.note}
                      </Text>
                    </div>

                    <CardGrid cols={3} className="mt-7">
                      {g.items.map((item) => (
                        <Card key={item.url} href={item.url} as="article">
                          <Kicker>{item.org}</Kicker>
                          <Heading level={4} size="h5" className="mt-3" balance>
                            {item.title}
                          </Heading>
                          <Text size="small" className="mt-3 flex-1">
                            {item.why}
                          </Text>
                          <Text
                            size="caption"
                            tone="faint"
                            className="mt-5 inline-flex items-center gap-1.5"
                          >
                            Open the source
                            <Icon name="arrow-up-right" size={12} />
                          </Text>
                        </Card>
                      ))}
                    </CardGrid>
                  </div>
                ))}
              </div>

              <Card className="mt-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Text size="small" className="max-w-xl">
                    Looking for open courses, government programs, and YouTube channels to
                    build the skills? We keep the whole shelf, and how to judge any course, on
                    one page.
                  </Text>
                  <Button
                    href="/resources"
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    Open the Resources shelf
                  </Button>
                </div>
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

        <CardGrid cols={3} className="mt-10">
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
          <Button href="/tasks">Start building proof</Button>
          <Button href="/niches" variant="outline">
            Pick your lane
          </Button>
        </div>

        <Text size="small" className="mt-10 max-w-2xl border-t border-line-strong pt-6">
          {closing.last}
        </Text>
      </Section>

      <PracticeFooter route="/reality" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
