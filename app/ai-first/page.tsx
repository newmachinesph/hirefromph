import type { Metadata } from "next";
import aifirst from "@/data/aifirst.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/ai-first";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "AI-First",
  description:
    "Every role runs on AI now. Coding agents, open-source and local models, AI image, AI video, and automation, taught as how to fold AI into your craft, with the four habits that turn it into leverage instead of slop. Every claim sourced.",
});

const TOC = [
  { id: "shift", label: "The shift" },
  { id: "fluency", label: "Fluency" },
  { id: "landscape", label: "The landscape" },
  { id: "craft", label: "In your craft" },
  { id: "adopt", label: "How to adopt" },
  { id: "guardrails", label: "Guardrails" },
  { id: "agentic", label: "Agentic terms" },
];

const COST_TONE: Record<string, "verified" | "info" | "caution" | "neutral"> = {
  free: "verified",
  "open-source": "verified",
  freemium: "info",
  "free-trial": "caution",
  paid: "neutral",
};
const COST_LABEL: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

type Tool = {
  name: string;
  url: string;
  cost: string;
  oneLiner: string;
  useInWork: string;
};

export default function AiFirstPage() {
  const { hero, shift, fluency, landscape, craft, adopt, guardrails, agentic, closing } = aifirst;

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
        <FreshnessNote date={aifirst.lastVerified} />
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/ai-first" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------------- SHIFT */}
            <section id="shift">
              <SectionHeading kicker={shift.kicker} title={shift.title} lead={shift.lead} />

              <StatStrip className="mt-12 grid gap-6 md:grid-cols-3">
                {shift.stats.map((s) => (
                  <Card key={s.label} padding="lg">
                    <Stat
                      value={s.value}
                      label={s.label}
                      sub={s.body}
                      source={{ label: s.source.label, url: s.source.url }}
                    />
                  </Card>
                ))}
              </StatStrip>

              <Callout tone="verified" className="mt-8">
                {shift.note}
              </Callout>
              <div className="mt-5">
                <Button
                  href={shift.crossref.href}
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={16} />}
                >
                  {shift.crossref.label}
                </Button>
              </div>
            </section>

            {/* ----------------------------------------------------- FLUENCY */}
            <section id="fluency">
              <SectionHeading kicker={fluency.kicker} title={fluency.title} lead={fluency.lead} />

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {fluency.skills.map((sk) => {
                  const a = accent(sk.accent);
                  return (
                    <Card key={sk.name} as="article" padding="lg">
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                            a.fill,
                          )}
                        >
                          <Icon name={sk.icon} size={20} />
                        </span>
                        <div>
                          <span className={cn("text-kicker uppercase", a.text)}>
                            Skill {sk.letter}
                          </span>
                          <Heading level={3} size="h4">
                            {sk.name}
                          </Heading>
                        </div>
                      </div>
                      <Text size="small" className="mt-5">
                        {sk.purpose}
                      </Text>
                      <Text
                        size="small"
                        tone="ink"
                        className={cn("mt-4 border-l-2 pl-4 font-medium", a.border)}
                      >
                        {sk.doThis}
                      </Text>
                    </Card>
                  );
                })}
              </div>

              <Callout className="mt-8">
                <Text size="small">{fluency.note}</Text>
                <Source label={fluency.source.label} url={fluency.source.url} className="mt-3" />
              </Callout>
            </section>

            {/* --------------------------------------------------- LANDSCAPE */}
            <section id="landscape">
              <SectionHeading
                kicker={landscape.kicker}
                title={landscape.title}
                lead={landscape.lead}
              />
              <Callout tone="info" className="mt-6">
                {landscape.note}
              </Callout>

              <div className="mt-12 flex flex-col gap-5">
                {landscape.categories.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article" padding="lg">
                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "grid h-12 w-12 shrink-0 place-items-center rounded-sm",
                                a.fill,
                              )}
                            >
                              <Icon name={c.icon} size={22} />
                            </span>
                            <Heading level={3} size="h3">
                              {c.name}
                            </Heading>
                          </div>
                          <Text size="small" className="mt-5">
                            {c.what}
                          </Text>
                          <div className={cn("mt-4 border-l-2 pl-4", a.border)}>
                            <Kicker>What it unlocks</Kicker>
                            <Text size="small" tone="ink" className="mt-1 font-medium">
                              {c.unlocks}
                            </Text>
                          </div>
                        </div>

                        <div>
                          <Kicker>A few real ones to try</Kicker>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {(c.tools as Tool[]).map((t) => (
                              <Card key={t.name} padding="sm" className="h-full">
                                <div className="flex items-center justify-between gap-2">
                                  <Text size="base" tone="ink" as="span" className="font-display">
                                    {t.name}
                                  </Text>
                                  <Badge tone={COST_TONE[t.cost] ?? "neutral"}>
                                    {COST_LABEL[t.cost] ?? t.cost}
                                  </Badge>
                                </div>
                                <Text size="caption" className="mt-2">
                                  {t.oneLiner}
                                </Text>
                                <Text size="caption" tone="faint" className="mt-2 flex-1">
                                  {t.useInWork}
                                </Text>
                                <a
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary"
                                >
                                  Open
                                  <Icon name="arrow-up-right" size={11} />
                                </a>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------------------------------- CRAFT */}
            <section id="craft">
              <SectionHeading kicker={craft.kicker} title={craft.title} lead={craft.lead} />
              <div className="mt-12 flex flex-col gap-3">
                {craft.rows.map((r) => (
                  <Card key={r.niche} as="article">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center sm:gap-8">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                          <Icon name={r.icon} size={18} />
                        </span>
                        <Heading level={3} size="h5">
                          {r.niche}
                        </Heading>
                      </div>
                      <Text size="small">{r.workflow}</Text>
                    </div>
                  </Card>
                ))}
              </div>
              <Callout tone="signal" className="mt-8">
                {craft.note}
              </Callout>
            </section>

            {/* ------------------------------------------------------- ADOPT */}
            <section id="adopt">
              <SectionHeading kicker={adopt.kicker} title={adopt.title} lead={adopt.lead} />
              <StepList className="mt-12">
                {adopt.steps.map((s) => (
                  <Step key={s.n} n={s.n} title={s.title}>
                    {s.desc}
                  </Step>
                ))}
              </StepList>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {adopt.crossrefs.map((c) => (
                  <Button
                    key={c.href}
                    href={c.href}
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={16} />}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </section>

            {/* -------------------------------------------------- GUARDRAILS */}
            <section id="guardrails">
              <SectionHeading
                kicker={guardrails.kicker}
                title={guardrails.title}
                lead={guardrails.lead}
              />
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {guardrails.items.map((it) => (
                  <Card key={it.title} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-primary-tint text-primary-deep">
                        <Icon name={it.icon} size={20} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {it.title}
                        </Heading>
                        <Text size="small" className="mt-2">
                          {it.desc}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  href={guardrails.crossref.href}
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={16} />}
                >
                  {guardrails.crossref.label}
                </Button>
              </div>
            </section>

            {/* ----------------------------------------------------- AGENTIC */}
            <section id="agentic">
              <SectionHeading kicker={agentic.kicker} title={agentic.title} lead={agentic.lead} />
              <CardGrid cols={3} className="mt-12">
                {agentic.items.map((it) => (
                  <Card key={it.term} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={it.icon} size={20} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5">
                      {it.term}
                    </Heading>
                    <Text size="small" className="mt-3 flex-1">
                      {it.desc}
                    </Text>
                  </Card>
                ))}
              </CardGrid>

              <Card padding="lg" className="mt-10">
                <Heading level={3} size="h3">
                  {agentic.why.title}
                </Heading>
                <Text size="body" className="mt-4 max-w-3xl">
                  {agentic.why.body}
                </Text>
                <Callout tone="signal" className="mt-5">
                  {agentic.note}
                </Callout>
                <Source
                  label={agentic.source.label}
                  url={agentic.source.url}
                  className="mt-5"
                />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={2} className="mt-10">
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
          <Button href="/prompts">Learn to direct AI</Button>
          <Button href="/resources" variant="outline">
            Get the free courses
          </Button>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/ai-first" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
