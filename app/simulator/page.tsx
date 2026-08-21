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
  Accordion,
  AccordionItem,
  Button,
  Callout,
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
    "Set your craft, your AI, and what you sell, then watch 36 months of a generic task-taker and a specialist diverge. A model, not a prediction.",
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
      />

      {/* One line of caution, then the long version behind a disclosure, so the
          first control lands on the second phone screen instead of the fourth. */}
      <Section spacing="none" className="pb-8">
        <Callout tone="caution" icon="alert-triangle">
          <Text size="small">{sim.banner.oneLine}</Text>
        </Callout>
        <Accordion className="mt-4">
          <AccordionItem id="estimates" title={sim.estimates.title}>
            <Text size="small" className="max-w-3xl">
              {sim.intro}
            </Text>
            <Heading level={3} size="h5" className="mt-6">
              {sim.banner.title}
            </Heading>
            <Text size="small" className="mt-2 max-w-3xl">
              {sim.banner.body}
            </Text>
            <Heading level={3} size="h5" className="mt-6 max-w-3xl" balance>
              {sim.dataHonesty.title}
            </Heading>
            <Text size="small" className="mt-2 max-w-3xl">
              {sim.dataHonesty.body}
            </Text>
            <Callout tone="signal" className="mt-4 max-w-3xl">
              {sim.dataHonesty.disagreement}
            </Callout>
            <SourceList sources={sim.dataHonesty.sources} className="mt-5" />
          </AccordionItem>
        </Accordion>
      </Section>

      {/* ----------------------------------------------------------- SIMULATOR */}
      {/* No outer Card: Card clips overflow, which would pin the component's
          mobile sticky summary to the card instead of the viewport. */}
      <Section spacing="none" className="pb-20 lg:pb-24">
        <CareerSimulator />
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
