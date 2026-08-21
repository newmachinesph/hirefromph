import type { Metadata } from "next";
import doctrine from "@/data/doctrine.json";
import { MethodLoop } from "@/components/diagrams/method-loop";
import { SelfAudit } from "@/components/self-audit";
import {
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
  Toc,
} from "@/components/layout";
import {
  Accordion,
  AccordionItem,
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
    "We don't give you the file. We teach you to build it. Six laws, seven methods, and a self-audit, the resourcefulness curriculum behind everything on this platform.",
});

const TOC = [
  { id: "promise", label: "The promise" },
  { id: "audit", label: "Self-audit" },
  { id: "loop", label: "At a glance" },
  { id: "laws", label: "Six laws" },
  { id: "methods", label: "Seven methods" },
  { id: "unlearn", label: "Unlearn these" },
];

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
        actions={<Button href="#audit">Take the 2-minute self-audit</Button>}
      >
        <Section spacing="none"><Tldr route="/method" /></Section>
        <Toc items={TOC} mobile />
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-16">
            {/* ------------------------------------------------ THE PROMISE */}
            <section id="promise" className="scroll-mt-24">
              <Card padding="lg">
                <Kicker>The promise</Kicker>
                <Text size="lead" tone="ink" className="mt-4 font-display" balance>
                  {doctrine.promise}
                </Text>
                <Button href="/build" variant="outline" size="sm" className="mt-6">
                  Build your resume in the labs
                </Button>
              </Card>
            </section>

            {/* ------------------------------------------------- SELF-AUDIT */}
            <section id="audit" className="scroll-mt-24">
              <SectionHeading
                kicker="Check yourself"
                title={doctrine.selfAudit.title}
                lead={doctrine.selfAudit.intro}
              />
              <Card padding="lg" className="mt-10">
                <SelfAudit
                  statements={doctrine.selfAudit.statements}
                  levels={doctrine.selfAudit.levels}
                />
              </Card>
            </section>

            {/* --------------------------------------------------- THE LOOP */}
            <section id="loop" className="scroll-mt-24">
              <DiagramFrame
                title="Seven methods, one return loop"
                caption="There is no fixed order: start with whichever method fits the problem in front of you. The dashed arrow is the only connection between them: when UNSTICK runs out of road, you time-box and return to ASK."
              >
                <MethodLoop />
              </DiagramFrame>
            </section>

            {/* ------------------------------------------------------- LAWS */}
            <section id="laws" className="scroll-mt-24">
              <SectionHeading
                kicker="Six laws"
                title="The rules that make everything else make sense"
                lead="Not tips. Not suggestions. Every page on this platform obeys these six."
              />
              <Card padding="none" className="mt-10">
                <ol className="divide-y divide-line">
                  {doctrine.principles.map((p, idx) => {
                    const a = accent(PRINCIPLE_ACCENTS[idx]);
                    return (
                      <li key={p.n} className="flex gap-4 p-5 lg:px-8">
                        <span
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={p.icon} size={18} />
                        </span>
                        <div className="min-w-0">
                          <Heading level={3} size="h5">
                            <span className="mr-2 tabular-nums text-ink-faint">0{p.n}</span>
                            {p.title}
                          </Heading>
                          <Text size="small" className="mt-1.5">
                            {p.desc}
                          </Text>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </section>

            {/* ---------------------------------------------------- METHODS */}
            <section id="methods" className="scroll-mt-24">
              <SectionHeading
                kicker="The curriculum"
                title="Seven methods. Master these and you're never stuck."
                lead="This is the actual skill this platform teaches, not a niche, not a tool, but how to figure anything out. Read the summary, run the drill, and open the steps when you need them."
              />

              <Accordion type="multiple" className="mt-10">
                {doctrine.methods.map((m, index) => {
                  const a = accent(m.accent);
                  return (
                    <article key={m.id} id={`method-${m.id}`} className="scroll-mt-24 pt-10">
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm border",
                            a.soft,
                          )}
                        >
                          <Icon name={m.icon} size={20} />
                        </span>
                        <div className="min-w-0">
                          <span className={cn("text-kicker uppercase", a.text)}>
                            Method 0{index + 1} · {m.tagline}
                          </span>
                          <Heading level={3} size="h3" className="mt-1" balance>
                            {m.name}
                          </Heading>
                        </div>
                      </div>

                      <Text size="lead" tone="ink" className="mt-5 font-display" balance>
                        {m.summary}
                      </Text>

                      <Callout tone={m.accent as "signal"} title="Do this now" className="mt-5">
                        {m.drill}
                      </Callout>

                      <AccordionItem id={m.id} title={`The ${m.steps.length} steps`} className="mt-2">
                        <ol className="grid gap-4 sm:grid-cols-2">
                          {m.steps.map((step, i) => (
                            <li key={step.title} className="flex gap-3">
                              <span className="font-display text-h5 tabular-nums text-line-strong">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <Text size="base" tone="ink" as="span" className="font-semibold">
                                  {step.title}
                                </Text>
                                <Text size="small" className="mt-1">
                                  {step.desc}
                                </Text>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </AccordionItem>
                    </article>
                  );
                })}
              </Accordion>
            </section>

            {/* ---------------------------------------------- ANTI-PATTERNS */}
            <section id="unlearn" className="scroll-mt-24">
              <SectionHeading
                kicker="Unlearn these"
                title={doctrine.antiPatterns.title}
                lead={doctrine.antiPatterns.intro}
              />
              <Card padding="none" className="mt-10">
                <div className="grid grid-cols-1 gap-x-8 border-b border-line px-5 py-4 text-kicker uppercase text-ink-faint sm:grid-cols-2 lg:px-8">
                  <span>Spoon-fed habit</span>
                  <span className="hidden sm:block">Resourceful move</span>
                </div>
                <div className="divide-y divide-line">
                  {doctrine.antiPatterns.items.map((item) => (
                    <div
                      key={item.bad}
                      className="grid gap-2 p-5 sm:grid-cols-2 sm:gap-6 lg:p-8"
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
