import type { Metadata } from "next";
import tools from "@/data/tools.json";
import learn from "@/data/learntools.json";
import { CopyButton } from "@/components/copy-button";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import { Badge, Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { accent, type Accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/tools";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Learn Any Tool",
  description: learn.intro,
});

const TOC = [
  { id: "method", label: "The 5-step method" },
  { id: "teardown", label: "The tool teardown" },
  { id: "evaluate", label: "Is it worth learning?" },
  { id: "landscape", label: "Tool landscape" },
  { id: "codes", label: "Codes for efficiency" },
  { id: "certs", label: "Free certifications" },
  { id: "drills", label: "Practice drills" },
];

const LEVEL_TONE: Record<string, Accent> = {
  Core: "verified",
  Intermediate: "caution",
  Advanced: "signal",
};

export default function ToolsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={learn.kicker}
        title={learn.headline}
        lead={learn.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {learn.creed}
        </Callout>
        <FreshnessNote date={tools.lastVerified} />
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* -------------------------------------------------------- METHOD */}
            <section id="method">
              <SectionHeading
                kicker="The 5-step method"
                title="How to learn any tool, fast"
                lead="Run these five steps on the next unfamiliar tool a client hands you. Same five steps, every time, regardless of what the tool is."
              />
              <div className="relative mt-10 flex flex-col gap-5">
                {learn.method.map((m, idx) => {
                  const a = accent(m.accent);
                  return (
                    <div key={m.n} className="relative">
                      {idx < learn.method.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute left-[27px] top-[68px] hidden h-[calc(100%+8px)] w-px bg-line-strong md:block"
                        />
                      )}
                      <Card as="article" className="relative">
                        <div className="flex flex-col gap-5 md:flex-row">
                          <span
                            className={cn(
                              "grid h-14 w-14 shrink-0 place-items-center rounded-md font-display text-xl",
                              a.tint,
                              a.text,
                            )}
                          >
                            {String(m.n).padStart(2, "0")}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon name={m.icon} size={17} className={a.text} />
                              <Heading level={3} size="h4">
                                {m.title}
                              </Heading>
                            </div>
                            <Text size="small" className="mt-2.5 max-w-2xl">
                              {m.desc}
                            </Text>
                            <div className="mt-4 flex items-start gap-2.5 rounded-sm border border-line-strong bg-band px-4 py-3">
                              <Icon name="arrow-right" size={15} className={cn("mt-0.5 shrink-0", a.text)} />
                              <Text size="small" tone="ink">
                                <span className="font-semibold">Do this: </span>
                                {m.doThis}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------------------------------ TEARDOWN */}
            <section id="teardown">
              <SectionHeading
                kicker="The reusable instrument"
                title="The tool teardown"
                lead={learn.teardown.intro}
              />
              <Card padding="none" className="mt-10">
                <div className="flex items-center gap-3 border-b border-line bg-band px-6 py-5">
                  <Icon name="clipboard-check" size={18} className="text-primary" />
                  <Text size="lead" tone="ink" className="font-display" as="span">
                    Run this on any tool before the tutorial
                  </Text>
                </div>
                <div className="divide-y divide-line">
                  {learn.teardown.questions.map((q, idx) => (
                    <div key={q.q} className="flex gap-5 px-6 py-5">
                      <Text size="caption" tone="faint" className="pt-0.5 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </Text>
                      <div>
                        <Text size="base" tone="ink" className="font-display" balance>
                          {q.q}
                        </Text>
                        <Text size="small" className="mt-1.5">
                          {q.why}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line-strong bg-primary-tint px-6 py-5">
                  <Text size="small" className="font-semibold text-primary-deep">
                    {learn.teardown.principle}
                  </Text>
                </div>
              </Card>
            </section>

            {/* ------------------------------------------------------- EVALUATE */}
            <section id="evaluate">
              <SectionHeading
                kicker="Spend your hours well"
                title="Is it even worth learning?"
                lead="Not every tool deserves front-loading. Run any candidate through these four questions before you sink an hour into it."
              />
              <CardGrid cols={2} className="mt-10">
                {learn.evaluate.map((e) => (
                  <Card key={e.title} as="article">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                        <Icon name={e.icon} size={19} />
                      </span>
                      <div>
                        <Heading level={3} size="h5">
                          {e.title}
                        </Heading>
                        <Text size="small" className="mt-1.5">
                          {e.desc}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ------------------------------------------------------- LANDSCAPE */}
            <section id="landscape">
              <SectionHeading
                kicker="Practice targets, not a curriculum"
                title="The tools the market asks for"
                lead="These are not a list to passively work through. They're what real job posts ask for, pick one, run the teardown on it, hit the 60-minute build. The tool is the gym, not the goal."
              />
              <CardGrid cols={2} className="mt-10">
                {tools.categories.map((cat) => {
                  const a = accent(cat.accent);
                  return (
                    <Card key={cat.id} as="article">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={cn("grid h-11 w-11 place-items-center rounded-sm", a.tint, a.text)}>
                            <Icon name={cat.icon} size={20} />
                          </span>
                          <Heading level={3} size="h4">
                            {cat.name}
                          </Heading>
                        </div>
                        <span aria-hidden className={cn("h-2.5 w-2.5 rounded-pill", a.fill)} />
                      </div>
                      <Text size="small" className="mt-4">
                        {cat.blurb}
                      </Text>
                      <ul className="mt-5 flex flex-1 flex-col gap-1 border-t border-line pt-4">
                        {cat.tools.map((tool) => (
                          <li
                            key={tool.name}
                            className="flex items-center justify-between gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-band"
                          >
                            <div className="min-w-0">
                              <Text size="small" tone="ink" className="truncate font-semibold" as="span">
                                {tool.name}
                              </Text>
                              <Text size="caption" tone="faint" className="truncate" as="p">
                                {tool.skill}
                              </Text>
                            </div>
                            <Badge tone={LEVEL_TONE[tool.level] ?? "neutral"} className="shrink-0">
                              {tool.level}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ----------------------------------------------------------- CODES */}
            <section id="codes">
              <SectionHeading
                kicker="Worked examples, not a library"
                title="Codes for efficiency"
                lead={learn.codeLiteracy.intro}
              />
              <div className="mt-8 grid gap-3 rounded-md border border-line-strong bg-band p-6 sm:grid-cols-2">
                {learn.codeLiteracy.questions.map((q) => (
                  <div key={q.q}>
                    <Text size="small" tone="ink" className="font-semibold">
                      {q.q}
                    </Text>
                    <Text size="caption" className="mt-1">
                      {q.desc}
                    </Text>
                  </div>
                ))}
              </div>

              <CardGrid cols={2} className="mt-8">
                {tools.codes.items.map((item) => (
                  <Card key={item.title} as="article">
                    <div className="flex items-center justify-between gap-3">
                      <Heading level={3} size="h5" balance>
                        {item.title}
                      </Heading>
                      <Badge tone="info" className="shrink-0">
                        {item.lang}
                      </Badge>
                    </div>
                    <pre className="mt-4 flex-1 overflow-x-auto rounded-sm border border-line-strong bg-band p-4">
                      <code className="whitespace-pre font-mono text-xs leading-relaxed text-ink">
                        {item.code}
                      </code>
                    </pre>
                    <div className="mt-4">
                      <CopyButton value={item.code} label="Copy code" />
                    </div>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ------------------------------------------------------------ CERTS */}
            <section id="certs">
              <SectionHeading
                kicker="Found by you, not handed to you"
                title="Certifications worth earning"
                lead={learn.freeCerts.intro}
              />
              <CardGrid cols={3} className="mt-10">
                {learn.freeCerts.steps.map((s) => (
                  <Card key={s.n} as="article">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-ink font-display text-sm text-on-navy">
                      {String(s.n).padStart(2, "0")}
                    </span>
                    <Heading level={3} size="h5" className="mt-5">
                      {s.title}
                    </Heading>
                    <Text size="small" className="mt-2">
                      {s.desc}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
            </section>

            {/* ----------------------------------------------------------- DRILLS */}
            <section id="drills">
              <SectionHeading
                kicker="Force a real artifact"
                title="Practice drills"
                lead="Reading the method changes nothing. Running it does. Pick one drill and start today."
              />
              <CardGrid cols={4} className="mt-10">
                {learn.practice.map((p) => (
                  <Card key={p.title} as="article">
                    <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                      <Icon name={p.icon} size={19} />
                    </span>
                    <Heading level={3} size="h5" className="mt-5">
                      {p.title}
                    </Heading>
                    <Text size="small" className="mt-2 flex-1">
                      {p.desc}
                    </Text>
                  </Card>
                ))}
              </CardGrid>
            </section>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- CLOSE */}
      <Section band="tint">
        <div className="flex flex-col items-center text-center">
          <Badge tone="signal">One method, every tool</Badge>
          <Heading level={2} size="display" className="mt-6 max-w-2xl" balance>
            This method isn&rsquo;t just for tools.
          </Heading>
          <Text size="small" className="mt-4 max-w-xl">
            The same five steps work on finding work, deconstructing a deliverable, or getting
            unstuck. See where else it applies, or go pick a niche to run it on first.
          </Text>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/method">See the full method</Button>
            <Button href="/niches" variant="outline">
              Explore niches
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
