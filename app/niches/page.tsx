import type { Metadata } from "next";
import tracks from "@/data/tracks.json";
import frameworks from "@/data/frameworks.json";
import salary from "@/data/salary.json";
import { NicheExplorer } from "@/components/niche-explorer";
import { NicheScorer } from "@/components/niche-scorer";
import {
  CardGrid,
  CtaBand,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import { Badge, Button, Callout, Card, Heading, Icon, Kicker, Text } from "@/components/ui";
import { accent, type Accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/niches";

const ACCENT_CYCLE: Accent[] = ["signal", "verified", "caution", "info"];

const TOC = [
  { id: "method", label: "The method" },
  { id: "research", label: "How to research" },
  { id: "score", label: "Score it yourself" },
  { id: "how-it-works", label: "How it works" },
  { id: "explorer", label: "Niche explorer" },
  { id: "emerging", label: "Where it leads" },
];

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Niche Learning Hub",
  description:
    "Pick your lane and go deep. Explore 22 online-career niches, including newer lanes like AI agent operations, no-code app building, and logistics and freight support, with pay bands, demand, skills, open courses, and how AI is changing each one.",
});

const steps = [
  {
    n: "01",
    title: "Pick a niche",
    desc: "Browse the 22 lanes below and see the pay, demand, and skills for each.",
    icon: "compass",
  },
  {
    n: "02",
    title: "Where to learn",
    desc: "Follow the courses, YouTube guides, and templates built for that niche.",
    icon: "graduation-cap",
  },
  {
    n: "03",
    title: "Get certified",
    desc: "Earn the certs clients look for, most at no cost.",
    icon: "award",
  },
  {
    n: "04",
    title: "Land clients",
    desc: "Apply with a niche-specific profile that stands out from generalists.",
    icon: "briefcase",
  },
];

export default function NichesPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Niche Learning Hub"
        title="Pick your lane. Go deep."
        lead={tracks.intro}
      />

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------------- METHOD */}
            <section id="method">
              <SectionHeading
                kicker="The method"
                title="How to evaluate any niche"
                lead={frameworks.niche.intro}
              />
              <blockquote className="mt-8 max-w-2xl border-l-2 border-primary pl-5">
                <Text size="lead" tone="ink" className="font-display">
                  &ldquo;{frameworks.niche.creed}&rdquo;
                </Text>
              </blockquote>

              <CardGrid cols={3} className="mt-10">
                {frameworks.niche.criteria.map((c, idx) => {
                  const a = accent(ACCENT_CYCLE[idx % 4]);
                  return (
                    <Card key={c.id} as="article">
                      <div className="flex items-start justify-between gap-3">
                        <span className={cn("grid h-11 w-11 place-items-center rounded-sm", a.tint, a.text)}>
                          <Icon name={c.icon} size={20} />
                        </span>
                        <Text size="caption" tone="faint" className="mt-1 shrink-0 uppercase">
                          Weight ×{c.weight}
                        </Text>
                      </div>
                      <Heading level={3} size="h5" className="mt-5">
                        {c.name}
                      </Heading>
                      <Text size="small" tone="ink" className="mt-2 font-semibold">
                        {c.question}
                      </Text>
                      <Text size="small" className="mt-2 flex-1">
                        {c.why}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ----------------------------------------------------- RESEARCH */}
            <section id="research">
              <SectionHeading
                kicker="Answer it yourself"
                title="How to research each question"
                lead="Not vibes, not a course seller's confidence, five concrete moves that get you a real answer."
              />
              <CardGrid cols={2} className="mt-8">
                {frameworks.niche.howToResearch.map((m) => (
                  <Card key={m.id} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={m.icon} size={18} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {m.title}
                        </Heading>
                        <Text size="small" className="mt-2">
                          {m.desc}
                        </Text>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.answers.map((a) => {
                            const crit = frameworks.niche.criteria.find((c) => c.id === a);
                            return crit ? <Badge key={a}>{crit.name}</Badge> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* --------------------------------------------------------- SCORE */}
            <section id="score">
              <SectionHeading
                kicker="Try it now"
                title="Score a niche yourself"
                lead="Any niche, including one we never listed. Rate it 1–5 across the seven questions above and get an honest, weighted verdict."
              />
              <Card padding="lg" className="mt-8">
                <NicheScorer />
              </Card>
            </section>

            {/* ------------------------------------------------------ HOW IT WORKS */}
            <section id="how-it-works">
              <SectionHeading
                kicker="How it works"
                title="Four steps from curious to hired"
                align="center"
                className="mx-auto"
              />
              <CardGrid cols={4} className="mt-10">
                {steps.map((s) => (
                  <Card key={s.n} as="article">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl text-line-strong">{s.n}</span>
                      <span className="grid h-10 w-10 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={s.icon} size={18} />
                      </span>
                    </div>
                    <Heading level={3} size="h5" className="mt-5">
                      {s.title}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {s.desc}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* -------------------------------------------------------- EXPLORER */}
            <section id="explorer">
              <SectionHeading
                kicker={`${tracks.tracks.length} worked examples`}
                title="Tap a niche to see the full breakdown"
                lead={
                  <>
                    {tracks.note} {frameworks.niche.examplesNote}
                  </>
                }
              />
              <Callout tone="verified" icon="cpu" className="mt-8 max-w-3xl">
                <Text size="small" tone="ink" className="font-medium">
                  {tracks.aiFraming}
                </Text>
              </Callout>
              <Card padding="lg" className="mt-10">
                <NicheExplorer />
              </Card>
            </section>

            {/* -------------------------------------------------------- EMERGING */}
            <section id="emerging">
              <SectionHeading
                kicker="Where these lanes lead · not where you start"
                title={salary.emerging.title}
                lead={salary.emerging.lead}
              />
              <CardGrid cols={3} className="mt-10">
                {salary.emerging.roles.map((r) => (
                  <Card key={r.role} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={r.icon} size={18} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {r.role}
                        </Heading>
                        <Text size="small" className="mt-1.5">
                          {r.blurb}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>
              <Text size="small" className="mt-8 max-w-3xl">
                {salary.emerging.note2}
              </Text>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ NEXT STEP */}
      <CtaBand
        kicker="Next step"
        title="Turn your niche into a 30-day plan."
        actions={<Button href="/plan">Build my 30-day plan</Button>}
      />

      <Section>
        <Card padding="lg" className="max-w-xl">
          <Kicker>Rate multiplier</Kicker>
          <Heading level={2} size="h3" className="mt-3" balance>
            Add a premium language to your niche.
          </Heading>
          <div className="mt-6">
            <Button href="/languages" variant="outline">
              See the language premium
            </Button>
          </div>
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
