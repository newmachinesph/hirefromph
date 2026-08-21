import type { Metadata } from "next";
import english from "@/data/english.json";
import { Bars } from "@/components/diagrams/charts";
import { CommsLab } from "@/components/comms-lab";
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
  Callout,
  Card,
  DiagramFrame,
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
import { cn } from "@/lib/utils";

const HREF = "/english";

/** The chart's domain, not styling: EF EPI is scored out of 800 with a published global mean. */
const MAX_SCORE = 800;
const GLOBAL_AVG = 488;

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "English at Work",
  description:
    "Filipinos already write English better than most of the world. What costs you money is smaller: hedges, reflex apologies, and deference markers. Audit a real client message, learn four structures, and hear the honest priority order for speaking.",
});

const TOC = [
  { id: "baseline", label: "The baseline" },
  { id: "causes", label: "Three causes" },
  { id: "honesty", label: "No spin" },
  { id: "banlist", label: "The banlist" },
  { id: "lab", label: "The lab" },
  { id: "frameworks", label: "Four structures" },
  { id: "speaking", label: "Speaking" },
  { id: "resources", label: "Resources" },
];

export default function EnglishPage() {
  const weakest = Math.min(...english.baseline.scores.map((s) => s.value));

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="English · Pragmatics · Speaking"
        title="Your English is not the problem."
        accent="The habits around it are."
        lead={english.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {english.creed}
        </Callout>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/english" /></Section> */}
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ---------------------------------------------------- BASELINE */}
            <section id="baseline">
              <SectionHeading
                kicker={english.baseline.kicker}
                title={english.baseline.title}
                lead={english.baseline.body}
              />

              <DiagramFrame
                title={`EF EPI 2025 · Philippines, out of ${MAX_SCORE}`}
                caption={`The dashed line is the global average, ${GLOBAL_AVG}. Every one of the four scores clears it; the highlighted bar is only the weakest of four strong results.`}
                className="mt-10"
              >
                <Bars
                  data={english.baseline.scores.map((s) => ({
                    id: s.skill,
                    label: s.skill,
                    value: s.value,
                    note: s.value === weakest ? "weakest of the four" : undefined,
                    focal: s.value === weakest,
                  }))}
                  max={MAX_SCORE}
                  reference={{ value: GLOBAL_AVG, label: "global average" }}
                  format={(v) => String(v)}
                />
              </DiagramFrame>

              <Source
                label={english.baseline.source.label}
                url={english.baseline.source.url}
                className="mt-4"
              />

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {english.baseline.scores.map((s) => (
                  <li key={s.skill}>
                    <Card padding="sm" className="h-full">
                      <div className="flex items-baseline justify-between gap-3">
                        <Text size="small" tone="ink" as="span" className="font-semibold">
                          {s.skill}
                        </Text>
                        <span className="font-display text-h5 tabular-nums text-ink">
                          {s.value}
                        </span>
                      </div>
                      <Text size="caption" className="mt-2">
                        {s.note}
                      </Text>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>

            {/* ------------------------------------------------ THREE CAUSES */}
            <section id="causes">
              <SectionHeading
                kicker={english.threeCauses.kicker}
                title={english.threeCauses.title}
                lead={english.threeCauses.lead}
              />

              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {english.threeCauses.causes.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article" padding="lg">
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("text-caption font-semibold tabular-nums", a.text)}>
                          {c.n}
                        </span>
                        {c.yours ? (
                          <Badge tone={c.accent as "signal"}>Yours to fix</Badge>
                        ) : (
                          <Badge tone="info">
                            <Icon name="shield-off" size={12} />
                            Not yours to fix
                          </Badge>
                        )}
                      </div>

                      <Heading level={3} size="h4" className="mt-5" balance>
                        {c.title}
                      </Heading>
                      <Text size="small" className="mt-4 flex-1">
                        {c.what}
                      </Text>
                      <Text
                        size="small"
                        tone="ink"
                        className={cn("mt-5 border-l-2 pl-4 font-medium", a.border)}
                      >
                        {c.fix}
                      </Text>
                      <div className="mt-5 border-t border-line pt-4">
                        <Source label={c.source.label} url={c.source.url} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* ----------------------------------------------------- HONESTY */}
            <section id="honesty">
              <SectionHeading kicker="No spin" title={english.honesty.title} />
              <StepList className="mt-12">
                {english.honesty.points.map((p, idx) => (
                  <Step key={p} n={idx + 1} title={p} />
                ))}
              </StepList>
            </section>

            {/* ----------------------------------------------------- BANLIST */}
            <section id="banlist">
              <SectionHeading
                kicker={english.banlist.kicker}
                title={english.banlist.title}
                lead={english.banlist.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {english.banlist.categories.map((c) => {
                  const a = accent(c.accent);
                  return (
                    <Card key={c.id} as="article">
                      <span aria-hidden className={cn("h-1 w-10 rounded-pill", a.fill)} />
                      <Heading level={3} size="h4" className="mt-5">
                        {c.label}
                      </Heading>
                      <Text size="small" className="mt-3">
                        {c.why}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* --------------------------------------------------------- LAB */}
            <section id="lab">
              <SectionHeading
                kicker={english.lab.kicker}
                title={english.lab.title}
                lead={english.lab.lead}
              />
              <Card padding="lg" className="mt-12">
                <CommsLab />
              </Card>
            </section>

            {/* -------------------------------------------------- FRAMEWORKS */}
            <section id="frameworks">
              <SectionHeading
                kicker={english.frameworks.kicker}
                title={english.frameworks.title}
                lead={english.frameworks.lead}
              />

              <div className="mt-12 flex flex-col gap-5">
                {english.frameworks.items.map((f) => {
                  const a = accent(f.accent);
                  return (
                    <Card key={f.id} as="article" padding="lg">
                      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                        <div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                                a.fill,
                              )}
                            >
                              <Icon name={f.icon} size={20} />
                            </span>
                            <div>
                              <Heading level={3} size="h4">
                                {f.name}
                              </Heading>
                              <Text size="caption" tone="faint">
                                {f.expand}
                              </Text>
                            </div>
                          </div>

                          <Kicker className="mt-6">Use it for</Kicker>
                          <Text size="small" className="mt-1.5">
                            {f.use}
                          </Text>

                          <Text
                            size="small"
                            tone="ink"
                            className={cn("mt-5 border-l-2 pl-4", a.border)}
                          >
                            {f.rule}
                          </Text>

                          <ol className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
                            {f.anatomy.map((line, i) => (
                              <li key={line} className="flex gap-3">
                                <span
                                  aria-hidden
                                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-band text-caption font-semibold tabular-nums text-ink"
                                >
                                  {i + 1}
                                </span>
                                <Text size="small" as="span">
                                  {line}
                                </Text>
                              </li>
                            ))}
                          </ol>

                          {f.source && (
                            <Source label={f.source.label} url={f.source.url} className="mt-6" />
                          )}
                        </div>

                        <div className="flex flex-col gap-4">
                          <Callout tone="coral" title="Before, weak">
                            <span className="whitespace-pre-line italic">{f.before}</span>
                          </Callout>

                          <div className="flex items-center gap-2 pl-1">
                            <Icon name="arrow-right" size={14} className="text-ink-faint" />
                            <Text size="caption" tone="faint">
                              Same facts. Same person. Different shape.
                            </Text>
                          </div>

                          <Callout tone="verified" title="After, strong" className="flex-1">
                            <span className="whitespace-pre-line font-medium text-ink">
                              {f.after}
                            </span>
                          </Callout>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* -------------------------------------------------- ESTIMATING */}
            <section id="estimating">
              <Card padding="lg">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <Kicker>{english.estimating.kicker}</Kicker>
                    <Heading level={2} size="h3" className="mt-5" balance>
                      {english.estimating.title}
                    </Heading>
                    <Text size="small" className="mt-4 max-w-md">
                      {english.estimating.body}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Callout tone="coral" title="Never">
                      {english.estimating.bad}
                    </Callout>
                    <Callout tone="verified" title="Always">
                      {english.estimating.good}
                    </Callout>
                  </div>
                </div>
              </Card>
            </section>

            {/* ---------------------------------------------------- SPEAKING */}
            <section id="speaking">
              <SectionHeading
                kicker={english.speaking.kicker}
                title={english.speaking.title}
                lead={english.speaking.lead}
              />

              <ol className="mt-12 flex flex-col gap-5">
                {english.speaking.priorities.map((p) => {
                  const a = accent(p.accent);
                  return (
                    <li key={p.n}>
                      <Card as="article" padding="lg">
                        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-caption font-semibold tabular-nums text-ink-faint">
                                {p.n}
                              </span>
                              <span className={cn("text-caption font-semibold", a.text)}>
                                Impact: {p.impact}
                              </span>
                            </div>
                            <Heading level={3} size="h3" className="mt-4" balance>
                              {p.title}
                            </Heading>
                          </div>

                          <div className="flex flex-col gap-4">
                            <Text size="small">{p.what}</Text>
                            <Card padding="sm">
                              <Text size="small" tone="ink">
                                <span className="font-semibold">The drill:</span> {p.drill}
                              </Text>
                            </Card>
                          </div>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ol>

              <Source
                label={english.speaking.source.label}
                url={english.speaking.source.url}
                className="mt-8"
              />
            </section>

            {/* --------------------------------------------------- RESOURCES */}
            <section id="resources">
              <SectionHeading
                kicker={english.resources.kicker}
                title={english.resources.title}
                lead={english.resources.lead}
              />
              <CardGrid cols={3} className="mt-12">
                {english.resources.items.map((r) => {
                  const a = accent(r.tone);
                  return (
                    <Card key={r.name} as="article">
                      <div className="flex items-start justify-between gap-3">
                        <Heading level={3} size="h4">
                          {r.name}
                        </Heading>
                        <Badge tone={r.tone as "signal"}>
                          {r.tone === "verified" ? "Open" : r.tone === "caution" ? "Caveat" : "Paid"}
                        </Badge>
                      </div>

                      <Text size="small" as="p" className={cn("mt-4 font-semibold", a.text)}>
                        {r.cost}
                      </Text>
                      <Text size="small" className="mt-4 flex-1">
                        {r.what}
                      </Text>
                      <Text size="small" tone="ink" className="mt-4 border-l-2 border-line-strong pl-4">
                        {r.use}
                      </Text>

                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-1.5 border-t border-line pt-4 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary"
                      >
                        Open {r.name}
                        <Icon name="arrow-up-right" size={14} />
                      </a>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>
          </div>
        </div>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/english" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
