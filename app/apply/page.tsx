import type { Metadata } from "next";
import apply from "@/data/apply.json";
import findwork from "@/data/findwork.json";
import { VettingFlow } from "@/components/diagrams/vetting-flow";
import { CopyButton } from "@/components/copy-button";
import { FindWorkDirectory, VettingTool } from "@/components/find-work";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Callout,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Kicker,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/apply";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Find Work",
  description: findwork.intro,
});

export default function Page() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Find work"
        title="Don’t wait for a list."
        accent="Learn to find the work."
        lead={findwork.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {findwork.creed}
        </Callout>
        <Callout tone="caution" icon="alert-triangle" className="max-w-2xl">
          {apply.disclaimer}
        </Callout>
      </PageHero>

      {/* HOW TO SOURCE OPPORTUNITIES */}
      <Section>
        <SectionHeading
          kicker="The FIND method, applied"
          title="How to source opportunities yourself"
          lead="Five ways to find work before it's posted, before it's crowded, and long after this page is out of date."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {findwork.sourcing.map((method) => (
            <Card key={method.id} as="article">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-sm border",
                  accent(method.accent).soft,
                )}
              >
                <Icon name={method.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-4">
                {method.name}
              </Heading>
              <Text size="small" className="mt-2">
                {method.how}
              </Text>
              <Text size="small" tone="faint" className="mt-3">
                <span className="font-semibold text-ink-soft">Why it works: </span>
                {method.why}
              </Text>
              <div className="mt-4 flex flex-col gap-2">
                {method.example.map((ex) => (
                  <div
                    key={ex}
                    className="flex items-center justify-between gap-3 rounded-sm border border-line-strong bg-band px-3.5 py-2.5"
                  >
                    <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-caption text-ink-soft">
                      {ex}
                    </code>
                    <CopyButton value={ex} label="Copy" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* VETTING TOOL */}
      <Section band="tint">
        <SectionHeading
          kicker="The VET method, applied"
          title="Is this opportunity legit?"
          lead={findwork.vetting.intro}
        />

        <DiagramFrame
          title="Vetting an opportunity, gate by gate"
          caption="Read top to bottom. Every downward arrow is a no; a single yes exits right and ends the conversation."
          className="mt-12"
        >
          <VettingFlow />
        </DiagramFrame>

        <Card padding="lg" className="mt-10">
          <VettingTool />
        </Card>
      </Section>

      {/* RESEARCH BEFORE YOU APPLY */}
      <Section>
        <SectionHeading
          kicker="Before you hit apply"
          title="Research the client before you apply"
          lead="A generic application gets ignored. A specific one, that names their actual problem, gets a reply."
        />
        <StepList className="mt-10">
          {findwork.research.map((step, idx) => (
            <Step key={step.title} n={idx + 1} title={step.title}>
              {step.desc}
            </Step>
          ))}
        </StepList>
      </Section>

      {/* THE DIRECTORY, REFRAMED AS STUDY MATERIAL */}
      <Section>
        <SectionHeading
          kicker="Study material, not a shortcut"
          title="The directory below, study it, don't just click it"
          lead="These are real, working places Filipino online professionals get hired. Study the pattern across all of them, who they are, what they need, how they're structured, then use the method above to add your own. This list is a seed, not a substitute for knowing how to find work."
        />
      </Section>
      <FindWorkDirectory />

      {/* BUILD YOUR OWN DIRECTORY */}
      <Section band="tint">
        <SectionHeading
          kicker="The closing move"
          title="Build your own directory"
          lead={findwork.buildYourOwnDirectory.intro}
        />
        <CardGrid cols={3} className="mt-12">
          {findwork.buildYourOwnDirectory.steps.map((step, idx) => (
            <Card key={step.title} onBand>
              <span className="font-display text-h3 tabular-nums text-line-strong">
                0{idx + 1}
              </span>
              <Heading level={3} size="h5" className="mt-3">
                {step.title}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {step.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* CLOSE BAND */}
      <Section band="tint">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col">
            <Kicker>The method</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              Seven habits that make you resourceful, for good
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              FIND and VET, the two methods behind this page, are two of seven. See all of them.
            </Text>
            <div className="mt-5">
              <Button href="/method" variant="outline">
                See the full method
              </Button>
            </div>
          </div>
          <div className="flex flex-col">
            <Kicker>Stage 2</Kicker>
            <Heading level={2} size="h3" className="mt-4" balance>
              The full Get Hired playbook
            </Heading>
            <Text size="small" className="mt-2 flex-1">
              Assets, outreach, tracking, and closing the offer, systematically, not randomly.
            </Text>
            <div className="mt-5">
              <Button href="/get-hired">Go to Get Hired</Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
