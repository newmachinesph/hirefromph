import type { Metadata } from "next";
import indispensable from "@/data/indispensable.json";
import { Bars } from "@/components/diagrams/charts";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Source,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/indispensable";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Become Indispensable",
  description:
    "How to become layoff-proof and the professional clients fight to keep. The many kinds of intelligence school never measured (creative, emotional, judgment, taste, adaptability) and the habits that make you impossible to replace in an AI world. Sourced.",
});

export default function IndispensablePage() {
  const { hero, why, intelligences, soughtAfter, proof, closing } = indispensable;

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
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/indispensable" /></Section> */}
      </PageHero>

      {/* ---------------------------------------------------------------- WHY */}
      <Section band="tint">
        <SectionHeading kicker={why.kicker} title={why.title} lead={why.lead} />
        <Card padding="lg" className="mt-10" onBand>
          <Text size="small" tone="ink" className="max-w-3xl border-l-2 border-verified pl-5 font-medium">
            {why.callout}
          </Text>
          <Source label={why.source.label} url={why.source.url} className="mt-4" />
        </Card>
      </Section>

      {/* ------------------------------------------------------ INTELLIGENCES */}
      <Section>
        <SectionHeading
          kicker={intelligences.kicker}
          title={intelligences.title}
          lead={intelligences.lead}
        />

        <CardGrid cols={3} className="mt-12">
          {intelligences.items.map((it) => {
            const a = accent(it.accent);
            return (
              <Card key={it.name} as="article">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                      a.fill,
                    )}
                  >
                    <Icon name={it.icon} size={20} />
                  </span>
                  <Heading level={3} size="h5">
                    {it.name}
                  </Heading>
                </div>
                <Text size="small" className="mt-4 flex-1">
                  {it.what}
                </Text>
                <div className={cn("mt-4 border-l-2 pl-4", a.border)}>
                  <Kicker>Build it</Kicker>
                  <Text size="small" tone="ink" className="mt-1 font-medium">
                    {it.build}
                  </Text>
                </div>
              </Card>
            );
          })}
        </CardGrid>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {intelligences.note}
        </Callout>
      </Section>

      {/* ------------------------------------------------------ SOUGHT AFTER */}
      <Section band="tint">
        <SectionHeading
          kicker={soughtAfter.kicker}
          title={soughtAfter.title}
          lead={soughtAfter.lead}
        />
        <CardGrid cols={3} className="mt-12">
          {soughtAfter.traits.map((t) => (
            <Card key={t.title} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={t.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {t.title}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {t.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* -------------------------------------------------------------- PROOF */}
      <Section>
        <SectionHeading kicker={proof.kicker} title={proof.title} lead={proof.body} />

        <DiagramFrame
          title="Freelancers and employees, side by side"
          caption="Read one row at a time: the solid bar is the freelancer share, the dashed bar the employee share. The gap, not the height, is the finding."
          className="mt-12"
        >
          <Bars
            data={proof.rows.map((r) => ({
              id: r.label,
              label: r.label,
              value: r.freelancer,
              compare: r.employee,
            }))}
            max={100}
            format={(v) => `${v}%`}
            seriesLabel={proof.legend.freelancer}
            compareLabel={proof.legend.employee}
            labelWidth={260}
          />
        </DiagramFrame>

        <Source label={proof.source.label} url={proof.source.url} className="mt-4" />
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
          <Button href="/ai-first">Multiply with AI</Button>
          <Button href="/tasks" variant="outline">
            Build your proof
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/indispensable" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
