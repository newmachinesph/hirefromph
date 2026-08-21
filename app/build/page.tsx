import type { Metadata } from "next";
import labsData from "@/data/labs.json";
import { BuildLabs } from "@/components/build-labs";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { Badge, Callout, Card, Icon } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/build";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Build Labs",
  description: labsData.intro,
});

export default function BuildPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Build Labs"
        title="We don’t hand you the file."
        accent="We teach you to build it."
        lead={labsData.intro}
      >
        <Badge tone="signal">
          <Icon name="ban" size={13} /> We hand out zero templates
        </Badge>
        <Callout title="The creed" className="max-w-2xl">
          {labsData.creed}
        </Callout>
      </PageHero>

      <Section spacing="none" className="pb-24 lg:pb-32">
        <Card padding="lg">
          <BuildLabs />
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
