import type { Metadata } from "next";
import Link from "next/link";
import learning from "@/data/learning.json";
import { ForgettingCurve } from "@/components/diagrams/forgetting-curve";
import { StudyProtocol } from "@/components/study-protocol";
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
  Badge,
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  SourceList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, StudyTimer, Tldr } from "@/components/practice";
import { cn } from "@/lib/utils";

const HREF = "/learn";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "How to Learn",
  description: learning.description,
});

type Work = {
  id: string;
  name: string;
  what: string;
  why: string;
  how: string;
  effort: string;
  payoff: string;
  icon: string;
  accent: string;
};
type FeelsGoodItem = {
  id: string;
  habit: string;
  whyItFeelsGood: string;
  whyItFails: string;
  doInstead: string;
};
type FocusItem = {
  name: string;
  what: string;
  howTo: string;
  bestFor: string;
  watchOut: string;
};

/* The builder sits right after the evidence; everything under it is the
   reference the result links into, so each technique is explained once. */
const TOC = [
  { id: "myth", label: "The myth" },
  { id: "curve", label: "The curve" },
  { id: "protocol", label: "Your protocol" },
  { id: "works", label: "The eight techniques" },
  { id: "feels-good", label: "Feels productive" },
  { id: "focus", label: "Focus systems" },
];

const FEATURED_IDS = ["retrieval-practice", "spaced-repetition"];
const works = learning.works as Work[];

const INLINE_LINK =
  "font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-current";

export default function LearnPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={learning.kicker}
        title={learning.headline}
        lead={learning.intro}
        actions={
          <Button href="#protocol" icon={<Icon name="pen-line" size={15} />}>
            Build my study protocol
          </Button>
        }
      >
        <Callout tone="signal" className="max-w-2xl">
          {learning.creed}
        </Callout>
        <Section spacing="none"><Tldr route="/learn" /></Section>
        <Toc items={TOC} mobile />
      </PageHero>

      <Section>
        <div className="grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <Toc items={TOC} />

          <div className="flex min-w-0 flex-col gap-20">
            {/* -------------------------------------------- MYTH, KILLED FIRST */}
            <section id="myth">
              <SectionHeading
                kicker="Killed first, on purpose"
                title="The myth we're not going to let slide"
                lead={
                  <>
                    The clearest worked example of{" "}
                    <Link href="/method" className={INLINE_LINK}>
                      the VET method
                    </Link>{" "}
                    on the whole platform: a belief that is popular, intuitive,
                    and wrong. Debunking it up front is what earns the rest of
                    this page its credibility.
                  </>
                }
              />

              <Card padding="lg" className="mt-10">
                <Badge tone="coral" variant="outline">
                  <Icon name="x" size={13} /> Myth
                </Badge>
                <Heading
                  level={3}
                  size="h3"
                  className="mt-6 max-w-3xl text-ink-faint line-through decoration-coral decoration-2"
                  balance
                >
                  {learning.myth.claim}
                </Heading>

                <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-3">
                  <div>
                    <Kicker>Why people believe it</Kicker>
                    <Text size="small" className="mt-3">
                      {learning.myth.whyPeopleBelieveIt}
                    </Text>
                  </div>
                  <div>
                    <Kicker tone="verified">What the evidence says</Kicker>
                    <Text size="small" tone="ink" className="mt-3">
                      {learning.myth.whatTheEvidenceSays}
                    </Text>
                  </div>
                  <div>
                    <Kicker>Do this instead</Kicker>
                    <Text size="small" className="mt-3">
                      {learning.myth.whatToDoInstead}
                    </Text>
                  </div>
                </div>

                <Callout
                  tone="signal"
                  icon="shield-check"
                  title="VET lesson, who profits?"
                  className="mt-10"
                >
                  {learning.myth.vetLesson}
                </Callout>
              </Card>
            </section>

            {/* ------------------------------------------------------- CURVE */}
            <section id="curve">
              <DiagramFrame
                title={learning.forgettingCurve.title}
                caption={learning.forgettingCurve.caption}
              >
                <ForgettingCurve />
              </DiagramFrame>
              <SourceList sources={learning.forgettingCurve.sources} className="mt-4" />
            </section>

            {/* -------------------------------------------- PROTOCOL BUILDER */}
            <section id="protocol" className="scroll-mt-28">
              <SectionHeading
                align="center"
                kicker="Build it yourself, from your own constraints"
                title="Your study protocol"
                lead={learning.protocol.intro}
              />
              <Card padding="lg" className="mt-12">
                <StudyProtocol
                  afterResult={
                    <Accordion>
                      <AccordionItem id="session" title="Start a session">
                        <StudyTimer />
                      </AccordionItem>
                    </Accordion>
                  }
                />
              </Card>
            </section>

            {/* ------------------------------------- THE EIGHT TECHNIQUES */}
            <section id="works">
              <SectionHeading
                kicker="The reference"
                title="The eight techniques"
                lead="Real evidence behind every one, findings, not tips. Your protocol names three of them; the two with the strongest evidence start open."
              />

              <Accordion type="multiple" defaultOpen={FEATURED_IDS} className="mt-10">
                {works.map((w) => {
                  const a = accent(w.accent);
                  const featured = FEATURED_IDS.includes(w.id);
                  return (
                    <div key={w.id} id={`technique-${w.id}`} className="scroll-mt-28">
                      <AccordionItem
                        id={w.id}
                        title={
                          <span className="flex flex-wrap items-center gap-3">
                            <span
                              className={cn(
                                "grid h-9 w-9 shrink-0 place-items-center rounded-sm",
                                a.tint,
                                a.text,
                              )}
                            >
                              <Icon name={w.icon} size={18} />
                            </span>
                            {w.name}
                            {featured && (
                              <Badge tone={w.accent as "signal"}>Strongest evidence</Badge>
                            )}
                          </span>
                        }
                      >
                        <Text size="small" tone="ink">
                          {w.what}
                        </Text>
                        <Text size="small" className="mt-3">
                          {w.why}
                        </Text>
                        <Callout tone={w.accent as "signal"} className="mt-5">
                          <span className="font-semibold">How: </span>
                          {w.how}
                        </Callout>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <Badge>Effort: {w.effort}</Badge>
                          <Badge tone={w.accent as "signal"}>Payoff: {w.payoff}</Badge>
                        </div>
                      </AccordionItem>
                    </div>
                  );
                })}
              </Accordion>
            </section>

            {/* ----------------------------------- FEELS PRODUCTIVE, ISN'T */}
            <section id="feels-good">
              <SectionHeading
                kicker="The self-deception is the point"
                title="What feels productive but isn't"
                lead="Every habit below feels like studying while you're doing it. That feeling is exactly why it survives: it's comfortable, and comfort is not evidence. Your protocol already names the three to stop first."
              />
              <Accordion className="mt-10">
                {(learning.feelsGood as FeelsGoodItem[]).map((item) => (
                  <AccordionItem
                    key={item.id}
                    id={item.id}
                    title={
                      <span className="flex items-center gap-2">
                        <Icon name="x" size={16} className="shrink-0 text-coral" />
                        {item.habit}
                      </span>
                    }
                  >
                    <Text size="small" tone="ink">
                      <span className="font-semibold">Feels like progress: </span>
                      {item.whyItFeelsGood}
                    </Text>
                    <Text size="small" className="mt-2">
                      <span className="font-semibold">Why it fails: </span>
                      {item.whyItFails}
                    </Text>
                    <Callout tone="verified" title="Do this instead" className="mt-4">
                      {item.doInstead}
                    </Callout>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* ----------------------------------------------- FOCUS SYSTEMS */}
            <section id="focus">
              <Kicker>A different job entirely</Kicker>
              <Heading level={2} size="h4" className="mt-3">
                Focus systems, not learning methods
              </Heading>
              <Text size="small" className="mt-3 max-w-2xl">
                The techniques above build knowledge. These manage your attention
                and your clock. The builder already picked your session shape;
                the rest are here if your day changes.
              </Text>
              <Accordion className="mt-6">
                {(learning.focus as FocusItem[]).map((f) => (
                  <AccordionItem key={f.name} id={f.name} title={f.name}>
                    <Text size="small">{f.what}</Text>
                    <Callout tone="info" className="mt-4">
                      <span className="font-semibold">How: </span>
                      {f.howTo}
                    </Callout>
                    <Text size="caption" tone="faint" className="mt-3">
                      <span className="font-medium text-ink">Best for: </span>
                      {f.bestFor}
                    </Text>
                    <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
                      <Icon
                        name="alert-triangle"
                        size={14}
                        className="mt-0.5 shrink-0 text-caution"
                      />
                      <Text size="caption">{f.watchOut}</Text>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------- CLOSE */}
      <Section band="tint">
        <SectionHeading
          align="center"
          kicker="Evidence, not vibes"
          title="Now go apply it to real work."
          lead="A technique changes nothing until you run it on something real. The method page covers how to teach yourself any skill, the task board is where you put retrieval, spacing, and feedback to work today."
        />
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/method">See the full method</Button>
          <Button href="/tasks" variant="outline">
            Try the task board
          </Button>
        </div>
      </Section>

      <PracticeFooter route="/learn" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
