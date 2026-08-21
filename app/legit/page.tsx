import type { Metadata } from "next";
import legit from "@/data/legit.json";
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
  Heading,
  Icon,
  Source,
  SourceList,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";

const HREF = "/legit";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Get Legit",
  description:
    "BIR registration, the 8% option, SSS/PhilHealth/Pag-IBIG as a self-employed professional, and the payment rails that protect your rate: every step linked to the official page.",
});

export default function LegitPage() {
  const { hero, why, bir, benefits, gettingPaid, closing } = legit;

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
        <Section spacing="none"><Tldr route="/legit" /></Section>
      </PageHero>

      {/* ---------------------------------------------------------------- WHY */}
      <Section band="tint">
        <SectionHeading kicker={why.kicker} title={why.title} />
        <CardGrid cols={3} className="mt-12">
          {why.items.map((it) => (
            <Card key={it.title} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={it.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {it.title}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {it.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ---------------------------------------------------------------- BIR */}
      <Section>
        <SectionHeading kicker={bir.kicker} title={bir.title} lead={bir.lead} />

        <StepList className="mt-12">
          {bir.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>

        <SourceList sources={bir.sources} className="mt-8" />
        <Text size="small" className="mt-5 max-w-3xl">
          {bir.note}
        </Text>
      </Section>

      {/* ----------------------------------------------------------- BENEFITS */}
      <Section band="tint">
        <SectionHeading kicker={benefits.kicker} title={benefits.title} lead={benefits.lead} />
        <CardGrid cols={3} className="mt-12">
          {benefits.items.map((b) => (
            <Card key={b.name} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-verified-fill text-ink">
                <Icon name={b.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {b.name}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {b.what}
              </Text>
              <Source label={b.source.label} url={b.source.url} className="mt-4" />
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* -------------------------------------------------------- GETTING PAID */}
      <Section>
        <SectionHeading
          kicker={gettingPaid.kicker}
          title={gettingPaid.title}
          lead={gettingPaid.lead}
        />
        <CardGrid cols={4} className="mt-12">
          {gettingPaid.rails.map((r) => (
            <Card key={r.name} as="article">
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={r.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {r.name}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {r.shape}
              </Text>
              <div className="mt-4">
                <Button
                  href={r.url}
                  external
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={14} />}
                >
                  Official site
                </Button>
              </div>
            </Card>
          ))}
        </CardGrid>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {gettingPaid.note}
        </Callout>
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

        <div className="mt-10">
          <Button href="/plan">Fold it into your 30-day plan</Button>
        </div>
      </Section>

      <PracticeFooter route="/legit" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
