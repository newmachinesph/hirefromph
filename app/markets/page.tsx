import type { Metadata } from "next";
import markets from "@/data/markets.json";
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
  Kicker,
  Source,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr, TimezoneOverlap } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/markets";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Client Markets & Time Zones",
  description:
    "Where your online clients are (US, UK & EU, Australia, Middle East, Canada, regional Asia), how each market differs in pay, culture, and industries, and the timezone and overlap-hours math for a Filipino professional on UTC+8.",
});

/** One labelled row of a region card. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-2">
      <Kicker className="border-0 px-0 py-0">{label}</Kicker>
      <Text size="small" as="span">
        {children}
      </Text>
    </div>
  );
}

export default function MarketsPage() {
  const { hero, overlap, regions, strategies, findIndustry, abroad, closing } = markets;

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
        <Section spacing="none"><Tldr route="/markets" /></Section>
      </PageHero>

      {/* ------------------------------------------------------------ OVERLAP */}
      <Section band="tint" id="overlap">
        <SectionHeading kicker={overlap.kicker} title={overlap.title} lead={overlap.lead} />
        <Callout tone="verified" className="mt-8 max-w-3xl">
          {overlap.note}
        </Callout>
        <TimezoneOverlap />
      </Section>

      {/* ------------------------------------------------------------ REGIONS */}
      <Section id="regions">
        <SectionHeading kicker={regions.kicker} title={regions.title} lead={regions.lead} />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {regions.items.map((r) => {
            const a = accent(r.accent);
            return (
              <Card key={r.name} as="article" padding="lg">
                <Heading level={3} size="h3">
                  {r.name}
                </Heading>
                <span aria-hidden className={cn("mt-4 h-1 w-12 rounded-pill", a.fill)} />

                <div className="mt-4 divide-y divide-line">
                  <Row label="Time zone">{r.tz}</Row>
                  <Row label="Vs PH">{r.offset}</Row>
                  <Row label="Overlap">{r.overlap}</Row>
                  <Row label="Pay">{r.pay}</Row>
                  <Row label="Style">{r.style}</Row>
                  <Row label="Industries">{r.industries}</Row>
                </div>

                <Text
                  size="small"
                  tone="ink"
                  className={cn("mt-5 border-l-2 pl-4 font-medium", a.border)}
                >
                  {r.verdict}
                </Text>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------- STRATEGIES */}
      <Section band="tint" id="strategies">
        <SectionHeading kicker={strategies.kicker} title={strategies.title} lead={strategies.lead} />

        <CardGrid cols={3} className="mt-14">
          {strategies.items.map((s) => (
            <Card key={s.name} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary text-white">
                <Icon name={s.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {s.name}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {s.desc}
              </Text>
              <div className="mt-4 border-l-2 border-primary pl-4">
                <Kicker>The trade-off</Kicker>
                <Text size="small" tone="ink" className="mt-1">
                  {s.tradeoff}
                </Text>
              </div>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-10">
          <Button
            href={strategies.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {strategies.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------ FIND INDUSTRY */}
      <Section id="find-industry">
        <SectionHeading
          kicker={findIndustry.kicker}
          title={findIndustry.title}
          lead={findIndustry.lead}
        />
        <StepList className="mt-12">
          {findIndustry.steps.map((s) => (
            <Step key={s.n} n={s.n} title={s.title}>
              {s.desc}
            </Step>
          ))}
        </StepList>
        <div className="mt-6">
          <Button
            href={findIndustry.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {findIndustry.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------------- ABROAD */}
      <Section band="tint" id="abroad">
        <SectionHeading kicker={abroad.kicker} title={abroad.title} lead={abroad.lead} />

        <CardGrid cols={3} className="mt-12">
          {abroad.items.map((v) => (
            <Card key={v.country} as="article" onBand>
              <Heading level={3} size="h5">
                {v.country}
              </Heading>
              <div className="mt-2">
                <Kicker tone="signal">{v.visa}</Kicker>
              </div>
              <Text size="small" className="mt-3 flex-1">
                {v.detail}
              </Text>
              <Source label={v.source.label} url={v.source.url} className="mt-4" />
            </Card>
          ))}
        </CardGrid>

        <Text size="small" className="mt-8 max-w-3xl">
          {abroad.note}
        </Text>
        <Callout tone="signal" className="mt-5 max-w-2xl">
          {abroad.point}
        </Callout>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section>
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={4} className="mt-10">
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
          <Button href="/salary">See what each market pays</Button>
          <Button href="/apply" variant="outline">
            Find clients yourself
          </Button>
        </div>
      </Section>

      <PracticeFooter route="/markets" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
