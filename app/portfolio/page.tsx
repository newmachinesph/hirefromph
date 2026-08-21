import type { Metadata } from "next";
import portfolio from "@/data/portfolio.json";
import { FreshnessNote } from "@/components/freshness-note";
import { PortfolioLadder } from "@/components/portfolio-ladder";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Badge, Button, Callout, Card, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";

const HREF = "/portfolio";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Portfolio Ladder",
  description:
    "A three-rung tool ladder for each of 22 niches: the free tool you start on, the workhorse clients expect, the paid one that sets your rate, with a portfolio piece per rung.",
});

/** Tier -> badge tone. One rung per column: Start (get in), Level up, Pro (differentiate). */
const TIER_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Start: "verified",
  "Level up": "caution",
  Pro: "signal",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={portfolio.kicker}
        title={portfolio.headline}
        lead={portfolio.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {portfolio.creed}
        </Callout>
        <FreshnessNote date={portfolio.lastVerified} />
        <Section spacing="none"><Tldr route="/portfolio" /></Section>
      </PageHero>

      {/* -------------------------------------------------------- HOW IT WORKS */}
      <Section>
        <SectionHeading
          kicker="Three rungs, same craft"
          title="How the ladder works"
          lead={portfolio.tiersNote}
        />
        <CardGrid cols={3} className="mt-10">
          {portfolio.howItWorks.map((step) => (
            <Card key={step.tier}>
              <Badge tone={TIER_TONE[step.tier] ?? "neutral"}>{step.tier}</Badge>
              <Text size="small" className="mt-4 flex-1">
                {step.meaning}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------- TRACK LADDERS */}
      <Section band="tint">
        <SectionHeading
          kicker="Pick your lane, climb the rungs"
          title="The tool ladder for every niche"
          lead="Each niche has its own climb, from the free tool you start on today to the paid one that sets your rate apart. Every rung leaves you a portfolio piece."
          action={<Button href="/tasks">Build a portfolio piece</Button>}
        />

        <PortfolioLadder />
      </Section>

      {/* --------------------------------------------------------------- CLOSE */}
      <Section>
        <SectionHeading
          align="center"
          kicker="Proof, not promises"
          title="A tool is only proof once you've built something with it."
          lead="The ladder tells you what to learn next. The micro-tasks turn each rung into a real deliverable you can show. Pick a lane, then go build the first piece."
          size="display"
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/tasks">Build the first piece</Button>
          <Button href="/niches" variant="outline">
            Pick your niche
          </Button>
        </div>
      </Section>

      <PracticeFooter route="/portfolio" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
