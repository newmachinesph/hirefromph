import type { Metadata } from "next";
import tracks from "@/data/tracks.json";
import portfolio from "@/data/portfolio.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
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
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/portfolio";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Portfolio Ladder",
  description: portfolio.intro,
});

/** Tier -> badge tone. One rung per column: Start (get in), Level up, Pro (differentiate). */
const TIER_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Start: "verified",
  "Level up": "caution",
  Pro: "signal",
};

/** Join by id so track name/icon/accent stay single-sourced in tracks.json. */
const trackById = Object.fromEntries(tracks.tracks.map((t) => [t.id, t]));

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
        />

        <div className="mt-12 flex flex-col gap-16">
          {portfolio.tracks.map((entry) => {
            const meta = trackById[entry.id];
            if (!meta) return null;
            const a = accent(meta.accent);
            return (
              <div key={entry.id}>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-md border",
                      a.soft,
                    )}
                  >
                    <Icon name={meta.icon} size={22} />
                  </span>
                  <div>
                    <Heading level={3} size="h4">
                      {meta.name}
                    </Heading>
                    <Text size="small">{meta.tagline}</Text>
                  </div>
                </div>

                <CardGrid cols={3} className="mt-6">
                  {entry.ladder.map((rung) => (
                    <Card key={rung.tier} onBand>
                      <Badge tone={TIER_TONE[rung.tier] ?? "neutral"}>{rung.tier}</Badge>
                      <Text size="small" className="mt-3">
                        {rung.goal}
                      </Text>

                      <ul className="mt-5 flex flex-1 flex-col gap-3 border-t border-line pt-4">
                        {rung.tools.map((tool) => (
                          <li key={tool.name}>
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "inline-flex items-center gap-1 text-small font-semibold text-ink transition-colors duration-150 ease-out",
                                  "hover:text-primary",
                                )}
                              >
                                {tool.name}
                                <Icon name="arrow-up-right" size={13} className="text-ink-faint" />
                              </a>
                              <Badge>{tool.free}</Badge>
                            </div>
                            <Text size="caption" tone="faint" className="mt-0.5">
                              {tool.what}
                            </Text>
                          </li>
                        ))}
                      </ul>

                      <div className={cn("mt-5 flex items-start gap-2 rounded-sm border p-3", a.soft)}>
                        <Icon name="target" size={14} className="mt-0.5 shrink-0" />
                        <Text size="caption" tone="inherit" as="span">
                          <span className="font-semibold">Portfolio piece: </span>
                          {rung.piece}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </CardGrid>
              </div>
            );
          })}
        </div>
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
          <Button href="/tasks">Build a portfolio piece</Button>
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
