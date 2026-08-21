import type { Metadata } from "next";
import learning from "@/data/learning.json";
import { ForgettingCurve } from "@/components/diagrams/forgetting-curve";
import { StudyProtocol } from "@/components/study-protocol";
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
  description: learning.intro,
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

const TOC = [
  { id: "myth", label: "The myth" },
  { id: "curve", label: "The curve" },
  { id: "works", label: "What works" },
  { id: "feels-good", label: "Feels productive" },
  { id: "focus", label: "Focus systems" },
  { id: "protocol", label: "Your protocol" },
];

const FEATURED_IDS = ["retrieval-practice", "spaced-repetition"];
const works = learning.works as Work[];
const featuredWorks = works.filter((w) => FEATURED_IDS.includes(w.id));
const restWorks = works.filter((w) => !FEATURED_IDS.includes(w.id));

export default function LearnPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={learning.kicker}
        title={learning.headline}
        lead={learning.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {learning.creed}
        </Callout>
        <Section spacing="none"><Tldr route="/learn" /></Section>
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
                lead="This is the clearest worked example of the VET method on the whole platform: a belief that's popular, intuitive, and wrong. Debunking it up front is what earns the rest of this page its credibility."
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

            {/* ---------------------------------------- WHAT REALLY WORKS */}
            <section id="works">
              <SectionHeading
                kicker="The curriculum"
                title="What works"
                lead="Eight techniques with real evidence behind them, not tips, findings. The first two carry the most weight in the research, so lean on them the hardest."
              />

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {featuredWorks.map((w) => {
                  const a = accent(w.accent);
                  return (
                    <Card key={w.id} as="article" padding="lg">
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "grid h-14 w-14 shrink-0 place-items-center rounded-md",
                            a.tint,
                            a.text,
                          )}
                        >
                          <Icon name={w.icon} size={24} />
                        </span>
                        <div>
                          <span className={cn("text-kicker uppercase", a.text)}>
                            Strongest evidence
                          </span>
                          <Heading level={3} size="h4" className="mt-1">
                            {w.name}
                          </Heading>
                        </div>
                      </div>
                      <Text size="small" tone="ink" className="mt-5">
                        {w.what}
                      </Text>
                      <Text size="small" className="mt-3">
                        {w.why}
                      </Text>
                      <Callout tone={w.accent as "signal"} className="mt-5">
                        <span className="font-semibold">How: </span>
                        {w.how}
                      </Callout>
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                        <Badge>Effort: {w.effort}</Badge>
                        <Badge tone={w.accent as "signal"}>Payoff: {w.payoff}</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <CardGrid cols={3} className="mt-6">
                {restWorks.map((w) => {
                  const a = accent(w.accent);
                  return (
                    <Card key={w.id} as="article">
                      <span
                        className={cn(
                          "grid h-11 w-11 place-items-center rounded-sm",
                          a.tint,
                          a.text,
                        )}
                      >
                        <Icon name={w.icon} size={19} />
                      </span>
                      <Heading level={3} size="h5" className="mt-4">
                        {w.name}
                      </Heading>
                      <Text size="small" className="mt-2">
                        {w.what}
                      </Text>
                      <Text size="caption" tone="faint" className="mt-3 flex-1">
                        {w.how}
                      </Text>
                      <Text size="caption" tone="faint" className="mt-4 border-t border-line pt-4">
                        Effort: {w.effort} · Payoff: {w.payoff}
                      </Text>
                    </Card>
                  );
                })}
              </CardGrid>
            </section>

            {/* ----------------------------------- FEELS PRODUCTIVE, ISN'T */}
            <section id="feels-good">
              <SectionHeading
                kicker="The self-deception is the point"
                title="What feels productive but isn't"
                lead="Every habit below feels like studying while you're doing it. That feeling is exactly why it survives, it's comfortable, and comfort is not evidence."
              />
              <div className="mt-10 flex flex-col gap-4">
                {(learning.feelsGood as FeelsGoodItem[]).map((item) => (
                  <Card key={item.id} padding="none">
                    <div className="grid lg:grid-cols-2">
                      <div className="bg-coral-tint p-6">
                        <div className="flex items-center gap-2">
                          <Icon name="x" size={16} className="shrink-0 text-coral" />
                          <Heading level={3} size="h5" className="text-coral" balance>
                            {item.habit}
                          </Heading>
                        </div>
                        <Text size="small" tone="ink" className="mt-3">
                          <span className="font-semibold">Feels like progress: </span>
                          {item.whyItFeelsGood}
                        </Text>
                        <Text size="small" className="mt-2">
                          <span className="font-semibold">Why it fails: </span>
                          {item.whyItFails}
                        </Text>
                      </div>
                      <div className="bg-verified-tint p-6">
                        <div className="flex items-center gap-2">
                          <Icon name="check" size={16} className="shrink-0 text-verified" />
                          <Heading level={3} size="h5" className="text-verified">
                            Do this instead
                          </Heading>
                        </div>
                        <Text size="small" tone="ink" className="mt-3">
                          {item.doInstead}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* ----------------------------------------------- FOCUS SYSTEMS */}
            <section id="focus">
              <SectionHeading
                kicker="A different job entirely"
                title="Focus systems, not learning methods"
                lead="Everything above builds knowledge. Everything below manages your attention and your clock. Confusing the two is the most common mistake on this page's topic, pair one system from here with a few techniques from above, and you have a real session."
              />
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {(learning.focus as FocusItem[]).map((f) => (
                  <Card key={f.name} as="article">
                    <Heading level={3} size="h4">
                      {f.name}
                    </Heading>
                    <Text size="small" className="mt-2">
                      {f.what}
                    </Text>
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
                  </Card>
                ))}
              </div>
            </section>

            {/* -------------------------------------------- PROTOCOL BUILDER */}
            <section id="protocol">
              <SectionHeading
                align="center"
                kicker="Build it yourself, from your own constraints"
                title="Your study protocol"
                lead={learning.protocol.intro}
              />
              <Card padding="lg" className="mt-12">
                <StudyProtocol />
                <div className="mt-10">
                  <StudyTimer />
                </div>
              </Card>
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
