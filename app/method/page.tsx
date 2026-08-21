import type { Metadata } from "next";
import type { ReactNode } from "react";
import doctrine from "@/data/doctrine.json";
import { MethodLoop } from "@/components/diagrams/method-loop";
import { SelfAudit } from "@/components/self-audit";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/method";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "The Method, we teach you to build it",
  description:
    "We don't give you the file. We teach you to build it. Six principles, seven methods, and a self-audit, the resourcefulness curriculum behind everything on this platform.",
});

const TOC = [
  { id: "promise", label: "The promise" },
  { id: "loop", label: "The loop" },
  { id: "laws", label: "Six laws" },
  { id: "methods", label: "Seven methods" },
  { id: "unlearn", label: "Unlearn these" },
  { id: "audit", label: "Self-audit" },
];

/** Turn *word* markers in the JSON copy into an emphasised inline span. */
function withEmphasis(text: string): ReactNode[] {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-semibold not-italic text-ink">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

const PRINCIPLE_ACCENTS = ["signal", "info", "verified", "caution", "info", "signal"];

const [titleLead, titleMain] = doctrine.title.split(". ");

export default function MethodPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={doctrine.kicker}
        title={`${titleLead}.`}
        accent={titleMain}
        lead={doctrine.creed}
      >
        <Section spacing="none"><Tldr route="/method" /></Section>
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* ------------------------------------------------ THE PROMISE */}
            <section id="promise" className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <Kicker>The promise</Kicker>
                <Text size="lead" tone="ink" className="mt-4 font-display" balance>
                  {doctrine.promise}
                </Text>
              </Card>
              <Callout tone="signal" title="Why it matters">
                {withEmphasis(doctrine.whyItMatters)}
              </Callout>
            </section>

            {/* --------------------------------------------------- THE LOOP */}
            <section id="loop">
              <DiagramFrame
                title="The method — seven ways to get unstuck"
                caption="Read left to right, then the second row right to left. The dashed arrow is the only one that goes backwards: when UNSTICK runs out of road, you time-box and return to ASK."
              >
                <MethodLoop />
              </DiagramFrame>
            </section>

            {/* ------------------------------------------------------- LAWS */}
            <section id="laws">
              <SectionHeading
                kicker="Six laws"
                title="The rules that make everything else make sense"
                lead="Not tips. Not suggestions. Every page on this platform obeys these six."
              />
              <CardGrid cols={3} className="mt-12">
                {doctrine.principles.map((p, idx) => {
                  const a = accent(PRINCIPLE_ACCENTS[idx]);
                  return (
                    <Card key={p.n} as="article" padding="lg">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-h2 text-line-strong">0{p.n}</span>
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={p.icon} size={20} />
                        </span>
                      </div>
                      <Heading level={3} size="h5" className="mt-5">
                        {p.title}
                      </Heading>
                      <Text size="small" className="mt-3 flex-1">
                        {p.desc}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ---------------------------------------------------- METHODS */}
            <section id="methods">
              <SectionHeading
                kicker="The curriculum"
                title="Seven methods. Master these and you're never stuck."
                lead="This is the actual skill this platform teaches, not a niche, not a tool, but how to figure anything out. Read each one, then run the drill."
              />

              <div className="mt-12 flex flex-col">
                {doctrine.methods.map((m, index) => {
                  const a = accent(m.accent);
                  return (
                    <article
                      key={m.id}
                      className={cn(
                        "grid gap-8 py-14 lg:grid-cols-[280px_1fr] lg:gap-14",
                        index > 0 && "border-t border-line",
                      )}
                    >
                      <div>
                        <span className={cn("text-kicker uppercase", a.text)}>
                          Method 0{index + 1}
                        </span>
                        <Heading level={3} size="h3" className="mt-3" balance>
                          {m.name}
                        </Heading>
                        <Text size="small" tone="soft" className="mt-3 font-medium">
                          {m.tagline}
                        </Text>
                        <span
                          className={cn(
                            "mt-6 inline-grid h-12 w-12 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={m.icon} size={22} />
                        </span>
                      </div>

                      <div>
                        <Text size="lead" tone="ink" className="font-display" balance>
                          {m.summary}
                        </Text>

                        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                          {m.steps.map((step, i) => (
                            <li key={step.title}>
                              <Card padding="sm" className="h-full">
                                <span className="font-display text-h4 text-line-strong">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <Text size="base" tone="ink" as="span" className="mt-2 font-semibold">
                                  {step.title}
                                </Text>
                                <Text size="small" className="mt-1.5">
                                  {step.desc}
                                </Text>
                              </Card>
                            </li>
                          ))}
                        </ol>

                        <Callout tone={m.accent as "signal"} title="Do this now" className="mt-6">
                          {m.drill}
                        </Callout>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------- ANTI-PATTERNS */}
            <section id="unlearn">
              <SectionHeading
                kicker="Unlearn these"
                title={doctrine.antiPatterns.title}
                lead={doctrine.antiPatterns.intro}
              />
              <Card padding="none" className="mt-12">
                <div className="grid grid-cols-1 gap-x-8 border-b border-line px-6 py-4 text-kicker uppercase text-ink-faint sm:grid-cols-2 lg:px-8">
                  <span>Spoon-fed habit</span>
                  <span className="hidden sm:block">Resourceful move</span>
                </div>
                <div className="divide-y divide-line">
                  {doctrine.antiPatterns.items.map((item) => (
                    <div
                      key={item.bad}
                      className="grid gap-3 p-6 sm:grid-cols-2 sm:gap-6 lg:p-8"
                    >
                      <div className="flex items-start gap-3">
                        <Icon name="x" size={16} className="mt-1 shrink-0 text-coral" />
                        <Text size="base" className="line-through decoration-coral/50 decoration-2">
                          {item.bad}
                        </Text>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="check" size={16} className="mt-1 shrink-0 text-verified" />
                        <Text size="base" tone="ink" className="font-medium">
                          {item.good}
                        </Text>
                      </div>
                      <Text size="small" tone="faint" className="italic sm:col-span-2">
                        {item.why}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* ------------------------------------------------- SELF-AUDIT */}
            <section id="audit">
              <SectionHeading
                kicker="Check yourself"
                title={doctrine.selfAudit.title}
                lead={doctrine.selfAudit.intro}
              />
              <Card padding="lg" className="mt-12">
                <SelfAudit
                  statements={doctrine.selfAudit.statements}
                  levels={doctrine.selfAudit.levels}
                />
              </Card>
            </section>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------------- CTA */}
      <Section band="tint">
        <SectionHeading
          align="center"
          kicker="The method, applied"
          title="Now build something from a blank page."
          lead="Reading the method changes nothing by itself. The labs are where you use it."
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/build">Open the build labs</Button>
          <Button href="/start" variant="outline">
            Start your path
          </Button>
        </div>
      </Section>

      <PracticeFooter route="/method" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
