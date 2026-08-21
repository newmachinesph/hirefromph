import type { Metadata } from "next";
import promptingData from "@/data/prompting.json";
import promptsData from "@/data/prompts.json";
import { PromptWorkshop } from "@/components/prompt-workshop";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import { Badge, Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/prompts";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "AI Leverage",
  description: promptingData.intro,
});

const TOC = [
  { id: "workshop", label: "Prompt workshop" },
  { id: "anatomy", label: "Anatomy" },
  { id: "principles", label: "Two more habits" },
  { id: "iteration", label: "Iteration loop" },
  { id: "where-to-point", label: "Where to point it" },
  { id: "judging", label: "Judging the output" },
  { id: "examples", label: "Worked examples" },
];

function partLabel(id: string): string {
  return promptingData.anatomy.find((a) => a.id === id)?.part ?? id;
}

function specimenPrompt(id: string) {
  return promptsData.prompts.find((p) => p.id === id);
}

export default function PromptsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={promptingData.kicker}
        title={promptingData.headline}
        lead={promptingData.intro}
        actions={<Button href="#workshop">Build yours now</Button>}
      >
        <Callout tone="signal" className="max-w-2xl">
          &ldquo;{promptingData.creed}&rdquo;
        </Callout>
        <Toc items={TOC} mobile />
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* --------------------------------------------------- WORKSHOP */}
            <section id="workshop" className="scroll-mt-24">
              <SectionHeading
                kicker="Prompt workshop"
                title="Build yours now"
                lead="Fill in what you know about your real situation. This assembles into your prompt, live, not ours. New to the parts? The anatomy below explains each one."
              />
              <Card padding="lg" className="mt-10">
                <PromptWorkshop
                  intro={promptingData.builder.intro}
                  fields={promptingData.builder.fields}
                  qualityLevels={promptingData.builder.qualityLevels}
                />
              </Card>
            </section>

            {/* ------------------------------------------------------ ANATOMY */}
            <section id="anatomy" className="scroll-mt-24">
              <SectionHeading
                kicker="The anatomy of a prompt"
                title="Eight parts. Learn them once, use them for good."
                lead="Every strong prompt is made of the same parts, most weak ones are just missing one. Study the difference, then take it back up to the workshop."
              />
              <CardGrid cols={2} className="mt-10">
                {promptingData.anatomy.map((item, idx) => (
                  <Card key={item.id} as="article">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-line-strong">
                        0{idx + 1}
                      </span>
                      <Heading level={3} size="h5">
                        {item.part}
                      </Heading>
                    </div>
                    <Text size="small" className="mt-3">
                      {item.purpose}
                    </Text>
                    <Card padding="sm" className="mt-3">
                      <Text size="small" tone="ink">
                        <span className="font-semibold text-ink">Rule, </span>
                        {item.rule}
                      </Text>
                    </Card>
                    <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-sm border border-primary/25 bg-primary-tint p-4">
                        <Text
                          size="caption"
                          className="flex items-center gap-1.5 font-semibold text-primary-deep"
                        >
                          <Icon name="x-circle" size={14} />
                          Weak
                        </Text>
                        <Text size="small" tone="ink" className="mt-2">
                          {item.weak}
                        </Text>
                      </div>
                      <div className="rounded-sm border border-verified/25 bg-verified-tint p-4">
                        <Text
                          size="caption"
                          className="flex items-center gap-1.5 font-semibold text-verified"
                        >
                          <Icon name="check-circle-2" size={14} />
                          Strong
                        </Text>
                        <Text size="small" tone="ink" className="mt-2">
                          {item.strong}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ---------------------------------------------------- PRINCIPLES */}
            <section id="principles" className="scroll-mt-24">
              <SectionHeading
                kicker="Two more habits"
                title="What the anatomy doesn't cover"
                lead="Everything else a good prompter does is already one of the eight parts. These two aren't."
              />
              <CardGrid cols={2} className="mt-10">
                {promptingData.principles.map((p) => (
                  <Card key={p.title} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={p.icon} size={20} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {p.title}
                        </Heading>
                        <Text size="small" className="mt-1.5">
                          {p.desc}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* --------------------------------------------------- ITERATION */}
            <section id="iteration" className="scroll-mt-24">
              <SectionHeading
                kicker="The iteration loop"
                title="Draft, run, diagnose, change one thing, re-run"
                lead="No prompt works on the first try. What separates people who improve fast is a procedure for the second try, not luck."
              />
              <ol className="mt-10 flex flex-col gap-4">
                {promptingData.iterate.map((step) => (
                  <li key={step.n}>
                    <Card as="article">
                      <div className="flex gap-5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-ink font-display text-sm text-on-navy">
                          {step.n}
                        </span>
                        <div className="flex-1">
                          <Heading level={3} size="h5">
                            {step.title}
                          </Heading>
                          <Text size="small" className="mt-1.5">
                            {step.desc}
                          </Text>
                          {"signals" in step && step.signals && (
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {step.signals.map((s) => (
                                <div
                                  key={s.symptom}
                                  className="rounded-sm border border-caution/25 bg-caution-tint p-3"
                                >
                                  <Text size="caption" className="font-semibold text-caution">
                                    {s.symptom}
                                  </Text>
                                  <Text size="caption" className="mt-1">
                                    → {s.cause}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>
            </section>

            {/* ----------------------------------------------- WHERE-TO-POINT */}
            <section id="where-to-point" className="scroll-mt-24">
              <SectionHeading
                kicker="Where to point it"
                title="What a remote career uses AI for"
                lead="Not finished prompts, situations. Use the anatomy above to build the exact prompt each one needs."
              />
              <CardGrid cols={3} className="mt-10">
                {promptingData.useCases.map((u) => {
                  const href = "href" in u ? u.href : undefined;
                  const hrefLabel = "hrefLabel" in u ? u.hrefLabel : undefined;
                  return (
                    <Card key={u.id} as="article" href={href}>
                      <span className="grid h-11 w-11 place-items-center rounded-sm bg-info-tint text-info">
                        <Icon name={u.icon} size={20} />
                      </span>
                      <Heading level={3} size="h5" className="mt-5">
                        {u.title}
                      </Heading>
                      <Text size="small" className="mt-2 flex-1">
                        {u.desc}
                      </Text>
                      {href && hrefLabel && (
                        <Text
                          size="small"
                          tone="ink"
                          className="mt-5 inline-flex items-center gap-1 font-semibold"
                        >
                          {hrefLabel}
                          <Icon name="arrow-right" size={15} />
                        </Text>
                      )}
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ----------------------------------------------------- JUDGING */}
            <section id="judging" className="scroll-mt-24">
              <SectionHeading
                kicker="Judging the output"
                title="A prompt isn't done when it runs. It's done when it survives your own critique."
              />
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <Card padding="lg">
                  <Heading level={3} size="h4">
                    Judge it before anyone else does
                  </Heading>
                  <ul className="mt-6 flex flex-col gap-5">
                    {promptingData.critique.map((c) => (
                      <li key={c.q}>
                        <Text size="small" tone="ink" className="flex items-start gap-2 font-semibold">
                          <Icon name="help-circle" size={16} className="mt-0.5 shrink-0 text-primary" />
                          {c.q}
                        </Text>
                        <Text size="small" className="mt-1.5 pl-6">
                          {c.why}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card padding="lg">
                  <Heading level={3} size="h4">
                    Kill AI-slop before a client sees it
                  </Heading>
                  <ul className="mt-6 flex flex-col gap-5">
                    {promptingData.slopChecklist.map((s) => (
                      <li key={s.tell}>
                        <Text size="small" tone="ink" className="flex items-start gap-2 font-semibold">
                          <Icon name="alert-triangle" size={16} className="mt-0.5 shrink-0 text-primary" />
                          {s.tell}
                        </Text>
                        <Text size="small" className="mt-1.5 pl-6">
                          <span className="font-semibold text-verified">Fix, </span>
                          {s.fix}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </section>

            {/* ----------------------------------------------------- EXAMPLES */}
            <section id="examples" className="scroll-mt-24">
              <SectionHeading
                kicker="Worked examples"
                title="Specimens to dissect, not to copy"
                lead={promptingData.specimensIntro}
              />
              <CardGrid cols={2} className="mt-10">
                {promptingData.specimens.map((specimen) => {
                  const prompt = specimenPrompt(specimen.promptId);
                  if (!prompt) return null;
                  return (
                    <Card key={specimen.promptId} as="article">
                      <div className="flex items-start justify-between gap-3">
                        <Heading level={3} size="h5">
                          {prompt.title}
                        </Heading>
                        <Badge className="shrink-0">Specimen</Badge>
                      </div>
                      <Text size="small" className="mt-2">
                        {prompt.desc}
                      </Text>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {specimen.usesParts.map((id) => (
                          <Badge key={id} tone="info">
                            {partLabel(id)}
                          </Badge>
                        ))}
                      </div>
                      <details className="group mt-4 rounded-sm border border-line-strong bg-band">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-kicker uppercase text-ink-faint [&::-webkit-details-marker]:hidden">
                          Read the full prompt
                          <span aria-hidden className="shrink-0 text-primary">
                            <span className="group-open:hidden">+</span>
                            <span className="hidden group-open:inline">–</span>
                          </span>
                        </summary>
                        <pre className="whitespace-pre-wrap border-t border-line px-4 py-4 font-mono text-xs leading-relaxed text-ink-faint">
                          {prompt.text}
                        </pre>
                      </details>
                      <Text size="small" className="mt-4">
                        <span className="font-semibold text-ink">Dissect, </span>
                        {specimen.note}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------------- CLOSE */}
      <Section>
        <CardGrid cols={2}>
          <Card href="/method">
            <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
              <Icon name="key-round" size={20} />
            </span>
            <Heading level={3} size="h3" className="mt-5">
              This is the same method, everywhere
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Anatomy, judgment, a workshop, self-critique, the seven-method framework this
              page is built from.
            </Text>
            <Text size="small" tone="ink" className="mt-6 inline-flex items-center gap-1 font-semibold">
              See the method
              <Icon name="arrow-right" size={15} />
            </Text>
          </Card>
          <Card href="/build">
            <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
              <Icon name="hammer" size={20} />
            </span>
            <Heading level={3} size="h3" className="mt-5">
              Now use it on a real deliverable
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Build Labs teach the same way, never a download, always a workshop you build
              yourself.
            </Text>
            <Text size="small" tone="ink" className="mt-6 inline-flex items-center gap-1 font-semibold">
              Open Build Labs
              <Icon name="arrow-right" size={15} />
            </Text>
          </Card>
        </CardGrid>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
