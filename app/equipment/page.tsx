import type { Metadata } from "next";
import equipment from "@/data/equipment.json";
import frameworks from "@/data/frameworks.json";
import { EquipmentChecker } from "@/components/equipment-checker";
import { FreshnessNote } from "@/components/freshness-note";
import { CardGrid, PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { Badge, Button, Card, Heading, Icon, Kicker, Source, SourceList, Text } from "@/components/ui";
import { accent, type Accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/equipment";

const ACCENT_CYCLE: Accent[] = ["signal", "verified", "caution", "info"];

/** The year comes from the data stamp, so the title rolls forward with each re-check. */
const GUIDE_TITLE = `Equipment Guide ${equipment.lastVerified.split("-")[0]}`;

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: GUIDE_TITLE,
  description: equipment.intro,
});

export default function EquipmentPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={GUIDE_TITLE}
        title="Get prepared, not perfect."
        lead={equipment.intro}
      >
        <Card className="max-w-2xl">
          <blockquote>
            <Text size="lead" tone="ink" className="font-display" balance>
              &ldquo;{equipment.creed}&rdquo;
            </Text>
          </blockquote>
        </Card>
        <FreshnessNote date={equipment.lastVerified} />
      </PageHero>

      {/* ------------------------------------------------------------- CHECKER */}
      <Section>
        <SectionHeading
          kicker="Check what you have"
          title="Build a rough budget for your setup"
          lead="Tick off what you own, choose a planning tier for the rest, and count in any optional item you want budgeted."
        />
        <div className="mt-8 rounded-md border border-line-strong bg-band p-6">
          <Kicker>How to read these numbers</Kicker>
          <Text size="small" className="mt-2 max-w-4xl">
            {equipment.pricingNote}
          </Text>
          <SourceList sources={equipment.priceReferences} className="mt-4" />
        </div>
        <Card padding="lg" className="mt-10">
          <EquipmentChecker categories={equipment.categories} />
        </Card>
      </Section>

      {/* ------------------------------------------------- WHAT ACTUALLY MATTERS */}
      <Section band="tint">
        <SectionHeading kicker="Spec literacy" title="What matters" lead={frameworks.equipment.intro} />

        <CardGrid cols={2} className="mt-10">
          {frameworks.equipment.whatMatters.map((w, idx) => {
            const a = accent(ACCENT_CYCLE[idx % 4]);
            return (
              <Card key={w.spec} as="article" onBand>
                <div className="flex items-start gap-3">
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-sm", a.tint, a.text)}>
                    <Icon name={w.icon} size={20} />
                  </span>
                  <Heading level={3} size="h5">
                    {w.spec}
                  </Heading>
                </div>
                <Text size="small" className="mt-4">
                  {w.whatMattersAndWhy}
                </Text>
                <Card padding="sm" className="mt-4">
                  <Kicker>How to judge it</Kicker>
                  <Text size="small" tone="ink" className="mt-1.5">
                    {w.howToJudge}
                  </Text>
                </Card>
                <div className="mt-3 rounded-sm border border-primary/25 bg-primary-tint/40 p-4">
                  <Kicker tone="signal">Don&rsquo;t overpay for</Kicker>
                  <Text size="small" tone="ink" className="mt-1.5">
                    {w.dontOverpayFor}
                  </Text>
                </div>
                {w.source && <Source label={w.source.label} url={w.source.url} className="mt-4" />}
              </Card>
            );
          })}
        </CardGrid>
      </Section>

      {/* -------------------------------------------------------- BUYING SMART */}
      <Section>
        <SectionHeading kicker="Buying smart" title="Buy secondhand safely, upgrade without regret" />
        <CardGrid cols={2} className="mt-10">
          {frameworks.equipment.buyingSmart.map((b) => (
            <Card key={b.title} as="article">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                  <Icon name={b.icon} size={18} />
                </span>
                <div>
                  <Heading level={3} size="h5">
                    {b.title}
                  </Heading>
                  <Text size="small" className="mt-2">
                    {b.desc}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------------- BUILDS */}
      <Section>
        <SectionHeading
          kicker="Three ways to start"
          title="Pick a build that fits your budget"
          lead={frameworks.equipment.referenceNote}
        />
        <CardGrid cols={3} className="mt-10">
          {equipment.builds.map((build) => (
            <Card key={build.name} as="article">
              <Heading level={3} size="h3">
                {build.name}
              </Heading>
              <Text as="p" tone="inherit" className="mt-1 font-display text-h3 text-primary">
                {build.total}
              </Text>
              <Text size="small" className="mt-4 flex-1">
                {build.desc}
              </Text>
              <Text size="caption" tone="faint" className="mt-4 border-t border-line pt-4">
                {build.for}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ---------------------------------------------------------------- CLOSE */}
      <Section band="tint">
        <div className="flex flex-col items-center text-center">
          <Badge tone="verified">Prepared beats perfect</Badge>
          <Heading level={2} size="display" className="mt-6 max-w-2xl" balance>
            Gear sorted. Now go build the career.
          </Heading>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/start">Start your path</Button>
            <Button href="/apply" variant="outline">
              Where to apply
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
