"use client";

import Link from "next/link";
import { JourneyStepper, PathChooser } from "@/components/journey";
import {
  CardGrid,
  PageFooterNav,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Journal, Streak } from "@/components/practice";
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Figure,
  Heading,
  Icon,
  ProgressBar,
  Select,
  Text,
  type BadgeTone,
} from "@/components/ui";
import roadmap from "@/data/roadmap.json";
import tracks from "@/data/tracks.json";
import { isAccent } from "@/lib/accent";
import { findNavNeighbours } from "@/lib/nav";
import { usePath } from "@/lib/path-context";
import { STAGES } from "@/lib/stages";
import { cn } from "@/lib/utils";

const HREF = "/path";

type Track = (typeof tracks.tracks)[number];
type LearnResource = Track["learn"][number];

const LEARN_ICON: Record<string, string> = {
  YouTube: "youtube",
  Course: "book-open",
  Template: "layout-template",
  Lab: "pencil-ruler",
};

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

/**
 * tracks.json carries no URLs, so the only hrefs we can honestly render are the
 * in-app ones the provider text names, e.g. "In-app (/build)". Everything else
 * is a course on the provider's own site, and the lead says so.
 */
function learnHref(resource: LearnResource): string | undefined {
  return /\((\/[a-z0-9-]+)\)/.exec(resource.provider)?.[1];
}

export default function PathPage() {
  const { state, hydrated, hasPath, setStage, toggleStep } = usePath();

  const track: Track | undefined = state.track
    ? tracks.tracks.find((candidate) => candidate.id === state.track)
    : undefined;

  if (!hydrated) return <PathSkeleton />;
  if (!hasPath || !track) return <NoPathState />;

  const currentStage = STAGES.find((stage) => stage.num === state.stage) ?? STAGES[0];
  const firstStage = STAGES[0];
  const doneCount = roadmap.steps.filter((step) => state.steps[step.n]).length;
  const portfolioCount = Object.values(state.tasks).filter(Boolean).length;
  const applied = state.applications.length;
  const interviews = state.applications.filter(
    (application) => application.status === "interview" || application.status === "offer",
  ).length;
  const nothingRecorded = portfolioCount + applied + interviews + doneCount === 0;

  const counters = [
    {
      value: portfolioCount,
      label: "portfolio pieces",
      sub: "micro-tasks completed",
      href: "/tasks",
    },
    { value: applied, label: "applications sent", sub: "live pipeline", href: "/tracker" },
    {
      value: interviews,
      label: "interviews and offers",
      sub: "converting",
      href: "/tracker",
    },
    {
      value: `${doneCount}/${roadmap.steps.length}`,
      label: "roadmap steps",
      sub: "zero to independent",
      href: "#roadmap",
    },
  ];

  // In-app resources first, so "start with the lab" points at something clickable.
  const learn = [...track.learn].sort(
    (a, b) => Number(Boolean(learnHref(b))) - Number(Boolean(learnHref(a))),
  );

  const nextMoves = [
    {
      title: "Build proof with micro-tasks",
      desc: `Real ${track.name} jobs you can do today with no client. Each one is a portfolio piece.`,
      href: "/tasks",
      icon: "target",
    },
    {
      title: "Track your applications",
      desc: "A live pipeline with a follow-up radar, silence loses more offers than rejection.",
      href: "/tracker",
      icon: "table",
    },
    {
      title: `Your ${track.name} 30-day plan`,
      desc: `One proven 30-day sequence, with ${track.name}'s tools and your daily hours filled in.`,
      href: "/plan",
      icon: "calendar-check",
    },
    {
      title: "Write your own prompts",
      desc: "Learn the anatomy of a prompt instead of pasting someone else's.",
      href: "/prompts",
      icon: "pen-line",
    },
    {
      title: "Find work yourself",
      desc: "Search operators, red flags, and your own opportunity pipeline.",
      href: "/apply",
      icon: "search",
    },
    {
      title: "Build your documents",
      desc: "Learn the anatomy, then write your own resume, SOPs, and trackers.",
      href: "/build",
      icon: "pencil-ruler",
    },
    {
      title: "Learn a premium language",
      desc: "Stack a language on top of this niche for more pay.",
      href: "/languages",
      icon: "languages",
    },
  ];

  return (
    <>
      {/* HEADER */}
      <Section spacing="default">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-primary-tint text-primary-deep">
              <Icon name={track.icon} size={26} weight="duotone" />
            </span>
            <div className="min-w-0">
              <Text size="caption" tone="faint" className="uppercase tracking-wider">
                Your dashboard
              </Text>
              <Heading level={1} size="h2" balance>
                {track.name}
              </Heading>
              <Text tone="soft" className="mt-1">
                {track.tagline}
              </Text>
            </div>
          </div>
          <Button
            href="/niches"
            variant="outline"
            icon={<Icon name="rotate-ccw" size={16} />}
          >
            Change path
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Badge tone={tone(track.accent)}>{track.pay}</Badge>
          <Badge tone="neutral">{track.demandLabel} demand</Badge>
          <Badge tone="neutral">{track.difficulty}</Badge>
        </div>

        {nothingRecorded ? (
          <Text className="mt-8">
            Nothing recorded yet. Start with{" "}
            <Link href={firstStage.href} className="font-medium text-primary underline underline-offset-4">
              Stage 1: {firstStage.title}
            </Link>
            , then come back and tick its steps below.
          </Text>
        ) : (
          <CardGrid cols={4} as="ul" className="mt-8">
            {counters.map((counter) => (
              <li key={counter.label} className="flex">
                <Card href={counter.href} padding="sm" className="w-full">
                  <span className="font-display text-h3 tabular-nums text-ink">
                    {counter.value}
                  </span>
                  <Text size="small" className="mt-1">
                    {counter.label}
                  </Text>
                  <Text size="caption" tone="faint">
                    {counter.sub}
                  </Text>
                </Card>
              </li>
            ))}
          </CardGrid>
        )}

        {/* The stepper is the one rendering of the five stages: it carries the
            current marker and the done ticks. The select below only sets it. */}
        <JourneyStepper current={state.stage} className="mt-10" />

        <Callout
          tone={isAccent(currentStage.accent) ? currentStage.accent : "neutral"}
          title={`Where you are: ${currentStage.title}`}
          className="mt-6"
        >
          <Text size="small">{currentStage.summary}</Text>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <Button href={currentStage.href} variant="primary" size="sm">
              Open {currentStage.title}
            </Button>
            <Field label="Set your current stage" className="w-full max-w-xs">
              <Select
                value={String(state.stage)}
                onChange={(event) => setStage(Number(event.target.value))}
              >
                {STAGES.map((stage) => (
                  <option key={stage.id} value={String(stage.num)}>
                    {stage.num}. {stage.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Callout>

        <div className="mt-8">
          <Streak />
        </div>
      </Section>

      {/* ROADMAP */}
      <Section id="roadmap" band="tint" className="scroll-mt-28">
        <SectionHeading
          kicker="Eleven steps, five stages"
          title="Your roadmap progress"
          lead={roadmap.intro}
        />

        <ProgressBar
          value={doneCount}
          max={roadmap.steps.length}
          label="Roadmap steps complete"
          showValue
          className="mt-8"
        />

        <Field as="group" label="Roadmap steps" hideLabel className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.steps.map((step) => {
              const checked = Boolean(state.steps[step.n]);
              return (
                <Card
                  key={step.n}
                  padding="sm"
                  onBand
                  className={cn(checked && "bg-band")}
                >
                  <Checkbox
                    id={`step-${step.n}`}
                    checked={checked}
                    onChange={() => toggleStep(step.n)}
                    label={
                      <span>
                        <span className="block text-base font-medium text-ink">
                          {step.n}. {step.title}
                        </span>
                        <span className="mt-0.5 block text-caption text-ink-soft">
                          {step.desc}
                        </span>
                      </span>
                    }
                  />
                </Card>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* NEXT MOVES */}
      <Section>
        <SectionHeading
          kicker="Your next moves"
          title="What to do right now"
          lead={`Curated for ${track.name}. The in-app lab is a link; the courses live on the provider's own site, search the title there.`}
        />

        <ul className="mt-8 flex flex-wrap gap-2.5">
          {learn.map((resource) => {
            const href = learnHref(resource);
            const body = (
              <>
                <Icon name={LEARN_ICON[resource.type] ?? "book-open"} size={15} />
                <span className="font-medium text-ink">{resource.title}</span>
                <span className="text-ink-faint">· {resource.provider}</span>
              </>
            );
            const pill =
              "inline-flex items-center gap-2 rounded-pill border border-line-strong bg-paper px-4 py-2 text-small";
            return (
              <li key={resource.title}>
                {href ? (
                  <Link
                    href={href}
                    className={cn(pill, "transition-colors duration-150 ease-out hover:border-ink hover:bg-band")}
                  >
                    {body}
                    <Icon name="arrow-up-right" size={13} className="text-primary" />
                  </Link>
                ) : (
                  <span className={pill}>{body}</span>
                )}
              </li>
            );
          })}
        </ul>

        <CardGrid cols={3} as="ul" className="mt-8">
          {nextMoves.map((move) => (
            <li key={move.href} className="flex">
              <Card href={move.href} className="w-full">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-tint text-primary-deep">
                  <Icon name={move.icon} size={20} weight="duotone" />
                </span>
                <Heading level={3} size="h5" className="mt-5">
                  {move.title}
                </Heading>
                <Text size="small" className="mt-2">
                  {move.desc}
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

      {/* JOURNAL, after the tools: a weekly reflection is not the second thing to do */}
      <Section band="tint">
        <SectionHeading
          kicker="One question a week"
          title="What moved this week"
          lead="Twelve prompts, rotating. Saved in this browser, read by nobody else."
        />
        <div className="mt-8">
          <Journal />
        </div>
      </Section>

      {/* NICHE TOOLKIT */}
      <Section>
        <SectionHeading kicker="Your niche toolkit" title={`Master ${track.name}`} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div>
            <Text size="small" tone="faint">
              Core skills
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.skills.map((skill) => (
                <Badge key={skill} tone="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Text size="small" tone="faint">
              Tools you will use
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.tools.map((tool) => (
                <Badge key={tool} tone={tone(track.accent)}>
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Text size="small" tone="faint">
              Certifications
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {track.certs.map((cert) => (
                <Badge key={cert} tone="verified">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card padding="lg" className="mt-8">
          <Text size="small" tone="faint">
            Who you will work with
          </Text>
          <Text className="mt-2">{track.clients}</Text>
        </Card>
      </Section>

      {/* NEXT STEP */}
      <Section band="tint">
        <SectionHeading
          kicker="Next step"
          title={`Keep going on ${currentStage.title}`}
          lead="Open the stage you are in, or turn this path into a dated 30-day checklist."
        />
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href={currentStage.href} variant="primary">
            Open {currentStage.title}
          </Button>
          <Button
            href="/plan"
            variant="outline"
            iconEnd={<Icon name="arrow-right" size={16} />}
          >
            Build your 30-day plan
          </Button>
        </div>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}

/** No path chosen yet: the dashboard is an invitation, not an error. */
function NoPathState() {
  return (
    <Section spacing="hero">
      <EmptyState
        level={1}
        title="Pick a lane to start this page"
        body="Choose your niche and this page becomes your hub, with your progress and the next move on it."
        media={
          <Figure
            id="path-dashboard"
            ratio="3/2"
            radius="md"
            sizes="(min-width: 640px) 24rem, 100vw"
            className="w-full max-w-sm"
          />
        }
      />
      <PathChooser
        limit={6}
        moreHref="/niches"
        moreLabel="See all 22 niches"
        redirectTo="/path"
        className="mt-10"
      />
    </Section>
  );
}

/** Pre-hydration placeholder. Aria-hidden: there is nothing here to read yet. */
function PathSkeleton() {
  return (
    <Section spacing="hero">
      <div aria-hidden className="flex flex-col gap-4">
        <div className="h-4 w-32 animate-pulse rounded-pill bg-band" />
        <div className="h-12 w-2/3 max-w-lg animate-pulse rounded-md bg-band" />
        <div className="h-4 w-1/2 max-w-sm animate-pulse rounded-pill bg-band" />
        <div className="mt-6 h-40 w-full animate-pulse rounded-md bg-band" />
        <div className="h-40 w-full animate-pulse rounded-md bg-band" />
      </div>
    </Section>
  );
}
