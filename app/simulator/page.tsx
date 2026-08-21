import type { Metadata } from "next";
import sim from "@/data/simulator.json";
import { CareerSimulator } from "@/components/career-simulator";
import {
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
  SourceList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/simulator";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Career Simulator",
  description:
    "Time does not raise your rate. Set your craft, your AI, and what you sell, then watch 36 months of a generic task-taker and 36 months of a specialist diverge. A model, not a prediction, with every assumption tagged.",
});

export default function SimulatorPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={sim.hero.kicker}
        title={sim.hero.titleLine1}
        accent={sim.hero.titleLine2}
        lead={sim.hero.lead}
      >
        <Text size="small" className="max-w-2xl">
          {sim.intro}
        </Text>
      </PageHero>

      {/* ------------------------------------------------------- MODEL BANNER */}
      <Section spacing="none" className="pb-10">
        <Callout tone="caution" icon="alert-triangle" title={sim.banner.title}>
          <Text size="small" className="max-w-3xl">
            {sim.banner.body}
          </Text>
        </Callout>
      </Section>

      {/* -------------------------------------------------------- DATA HONESTY */}
      <Section spacing="none" className="pb-14">
        <Card padding="lg">
          <Badge>Vendor-grade, not survey-grade</Badge>
          <Heading level={2} size="h3" className="mt-5 max-w-3xl" balance>
            {sim.dataHonesty.title}
          </Heading>
          <Text size="small" className="mt-4 max-w-3xl">
            {sim.dataHonesty.body}
          </Text>
          <Callout tone="signal" className="mt-4 max-w-3xl">
            {sim.dataHonesty.disagreement}
          </Callout>
          <SourceList sources={sim.dataHonesty.sources} className="mt-5" />
        </Card>
      </Section>

      {/* ----------------------------------------------------------- SIMULATOR */}
      <Section spacing="none" className="pb-20 lg:pb-24">
        <Card padding="lg">
          <CareerSimulator />
        </Card>
      </Section>

      {/* --------------------------------------------------------------- OUTRO */}
      <Section band="tint">
        <SectionHeading kicker="Where this goes next" title={sim.outro.title} lead={sim.outro.body} />
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Button href="/reality" variant="outline">
            {sim.outro.realityLabel}
          </Button>
          <Button
            href="/niches"
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {sim.outro.nichesLabel}
          </Button>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
