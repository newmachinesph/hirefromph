import { DIAGRAMS, type DiagramId } from "@/components/diagrams";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Button,
  Card,
  DiagramFrame,
  Heading,
  Icon,
  Step,
  StepList,
  Text,
  type BadgeTone,
} from "@/components/ui";
import { isAccent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { routeDesc } from "@/lib/routes";
import { STAGES, TOTAL_STAGES, getStage, type Stage } from "@/lib/stages";
import { JourneyStepper } from "./journey-stepper";

/**
 * Title and one-sentence caption for each stage diagram. A diagram must say
 * what to look at (spec §7.2), and that sentence belongs with the page that
 * frames it, not with the SVG.
 */
const DIAGRAM_META: Record<DiagramId, { title: string; caption: string }> = {
  "journey-map": {
    title: "The path: five stages, eleven steps",
    caption: "Read it left to right. The ticks under each stage are its roadmap steps.",
  },
  "method-loop": {
    title: "The seven methods",
    caption: "FIND runs once. The middle five loop until the thing works.",
  },
  "hiring-funnel": {
    title: "Applications to offers",
    caption: "Each narrowing is a different skill. Work on the one that is losing you the most.",
  },
  "first-week-timeline": {
    title: "Your first week, day by day",
    caption: "Day one is questions. By Friday the client should see a written system.",
  },
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

function isDiagramId(value: string | undefined): value is DiagramId {
  return value !== undefined && value in DIAGRAMS;
}

export function StagePage({ id }: { id: string }) {
  const stage: Stage | undefined = getStage(id);
  if (!stage) throw new Error(`StagePage: unknown stage id "${id}"`);

  const nextStage = STAGES.find((candidate) => candidate.num === stage.num + 1);
  const neighbours = findNavNeighbours(stage.href);
  const first = stage.doFirst[0];
  const Diagram = isDiagramId(stage.diagram) ? DIAGRAMS[stage.diagram] : null;
  const meta = isDiagramId(stage.diagram) ? DIAGRAM_META[stage.diagram] : null;

  return (
    <>
      {/* 1 — HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(stage.href)}
        kicker={`Stage ${stage.num} of ${TOTAL_STAGES} · ${stage.steps}`}
        kickerTone={tone(stage.accent)}
        title={stage.title}
        lead={stage.summary}
        media={{ figureId: stage.image }}
        actions={
          <>
            <Button href={first.href} variant="primary" size="lg">
              {first.cta}
            </Button>
            {nextStage && (
              <Button href={nextStage.href} variant="outline" size="lg">
                Next: {nextStage.title}
              </Button>
            )}
          </>
        }
      >
        <Text size="small" tone="faint">
          {stage.role}
        </Text>
      </PageHero>

      {/* 2 — WHERE YOU ARE */}
      <Section spacing="none" className="border-y border-line py-8">
        <JourneyStepper current={stage.num} />
      </Section>

      {/* 3 — DO THESE FIRST */}
      <Section>
        <SectionHeading
          kicker="Do these first"
          title="Be systematic, not random"
          lead={stage.outcome}
        />
        <StepList className="mt-10 gap-6">
          {stage.doFirst.map((item, index) => (
            <Step key={`${item.href}-${item.title}`} n={index + 1} title={item.title}>
              <Card onBand className="mt-2">
                <Text size="small">{item.desc}</Text>
                <div className="mt-3">
                  <Button
                    href={item.href}
                    variant="link"
                    aria-label={`${item.cta}: ${item.title}`}
                    iconEnd={<Icon name="arrow-right" size={15} />}
                  >
                    {item.cta}
                  </Button>
                </div>
              </Card>
            </Step>
          ))}
        </StepList>
      </Section>

      {/* 4 — THE STAGE DIAGRAM (only where a picture beats a paragraph) */}
      {Diagram && meta && (
        <Section band="tint">
          <DiagramFrame title={meta.title} caption={meta.caption}>
            <Diagram />
          </DiagramFrame>
        </Section>
      )}

      {/* 5 — TOOLS FOR THIS STAGE */}
      <Section>
        <SectionHeading
          kicker="Tools for this stage"
          title="The only pages you need right now"
          lead="Work these four before moving on. Everything else keeps."
        />
        <CardGrid cols={4} as="ul" className="mt-10">
          {stage.tools.map((tool) => (
            <li key={`${tool.href}-${tool.label}`} className="flex">
              <Card href={tool.href} className="w-full">
                <Heading level={3} size="h5">
                  {tool.label}
                </Heading>
                <Text size="small" className="mt-2">
                  {routeDesc(tool.href) ?? "Open this page."}
                </Text>
                <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-primary">
                  Open
                  <Icon name="arrow-right" size={14} />
                </span>
              </Card>
            </li>
          ))}
        </CardGrid>
      </Section>

      {/* 6 — CLOSING */}
      <Section band="tint">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <Heading level={2} size="h2" balance>
            {stage.closing}
          </Heading>
          <blockquote className="border-l-2 border-primary pl-5">
            <Text size="lead" as="p">
              {stage.quote}
            </Text>
            <Text size="caption" tone="faint" as="p" className="mt-2">
              Hire From PH · {stage.subtitle}
            </Text>
          </blockquote>
          <div className="flex flex-wrap items-center gap-3">
            {nextStage ? (
              <Button href={nextStage.href} variant="primary">
                Continue to {nextStage.title}
              </Button>
            ) : (
              <Button href="/simulator" variant="primary">
                Model your next 3 years
              </Button>
            )}
            <Button href="/plan" variant="outline">
              Build a 30-day plan around this
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — WAYFINDING */}
      <Section>
        <PageFooterNav prev={neighbours.prev} next={neighbours.next} up={neighbours.up} />
      </Section>
    </>
  );
}
