import Link from "next/link";
import { PathChooser } from "@/components/journey";
import {
  CardGrid,
  CtaBand,
  FeatureRow,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  Figure,
  Heading,
  Icon,
  Kicker,
  Stat,
  StatStrip,
  Step,
  StepList,
  Text,
  type BadgeTone,
} from "@/components/ui";
import faq from "@/data/faq.json";
import site from "@/data/site.json";
import { isAccent } from "@/lib/accent";
import { HOME, HOME_STATS } from "@/lib/home";
import { routeEntry } from "@/lib/routes";
import { STAGES } from "@/lib/stages";

function tone(accent: string): BadgeTone {
  return isAccent(accent) ? accent : "neutral";
}

/**
 * The homepage, spec §8.1: eight sections, ≤ 8 screens at 1280px.
 * Every string on this page comes from data/home.json, data/site.json,
 * data/faq.json, data/stages.json, or data/library.json — nothing is authored
 * in JSX, so the Phase 8 copy pass is a diff of data files.
 *
 * The five stages appear once, as the five cards in section 3. The stepper
 * and its progress card stay off this page: a cold visitor has no progress
 * to show, and the dashboard link in the section heading covers returning ones.
 */
export default function Home() {
  return (
    <>
      {/* 1 — HERO */}
      <PageHero
        kicker={HOME.hero.kicker}
        title={HOME.hero.title}
        accent={HOME.hero.accent}
        lead={HOME.hero.lead}
        media={{ figureId: "home-hero" }}
        actions={
          <>
            <Button href={HOME.hero.primary.href} variant="primary" size="lg">
              {HOME.hero.primary.label}
            </Button>
            <Button href={HOME.hero.secondary.href} variant="outline" size="lg">
              {HOME.hero.secondary.label}
            </Button>
          </>
        }
      >
        <StatStrip className="mt-2">
          {HOME_STATS.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} sub={stat.sub} />
          ))}
        </StatStrip>

        <Text size="caption" tone="faint">
          {HOME.hero.honesty}{" "}
          <Link
            href={HOME.hero.honestyLink.href}
            className="text-primary underline underline-offset-2"
          >
            {HOME.hero.honestyLink.label}
          </Link>
          .
        </Text>
      </PageHero>

      {/* 2 — HOW IT WORKS */}
      <Section id="how" className="scroll-mt-28">
        <SectionHeading
          kicker={HOME.howItWorks.kicker}
          title={HOME.howItWorks.title}
          lead={HOME.howItWorks.lead}
        />
        <FeatureRow items={HOME.howItWorks.items} className="mt-12" />
      </Section>

      {/* 3 — THE PATH */}
      <Section band="tint">
        <SectionHeading
          kicker={HOME.path.kicker}
          title={HOME.path.title}
          lead={HOME.path.lead}
          action={
            <Button href={HOME.path.action.href} variant="outline">
              {HOME.path.action.label}
            </Button>
          }
        />

        {/* Five stages read best as five columns; CardGrid tops out at four. */}
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <li key={stage.id} className="flex">
              <Card href={stage.href} onBand className="flex w-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-h4 text-ink-faint">
                    {String(stage.num).padStart(2, "0")}
                  </span>
                  <Badge tone={tone(stage.accent)} variant="outline">
                    {stage.steps}
                  </Badge>
                </div>
                <Heading level={3} size="h5" className="mt-5">
                  {stage.title}
                </Heading>
                <Text size="caption" tone="faint" className="mt-1">
                  {stage.role}
                </Text>
                <Text size="small" className="mt-3">
                  {stage.subtitle}
                </Text>
                <span className="mt-auto inline-flex items-center gap-1 pt-5 text-small font-medium text-primary">
                  Open
                  <Icon name="arrow-right" size={14} />
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4 — PICK YOUR LANE */}
      <Section>
        <SectionHeading
          kicker={HOME.lane.kicker}
          title={HOME.lane.title}
          lead={HOME.lane.lead}
        />
        <PathChooser
          limit={6}
          moreHref={HOME.lane.more.href}
          moreLabel={HOME.lane.more.label}
          redirectTo="/path"
          className="mt-12"
        />
      </Section>

      {/* 5 — WHAT YOU'LL BUILD */}
      <Section band="tint">
        <SectionHeading
          kicker={HOME.build.kicker}
          title={HOME.build.title}
          lead={HOME.build.lead}
          action={
            <Button href={HOME.build.action.href} variant="outline">
              {HOME.build.action.label}
            </Button>
          }
        />
        <CardGrid cols={3} as="ul" className="mt-12">
          {HOME.build.items.map((item) => {
            const entry = routeEntry(item.href);
            if (!entry) return null;
            return (
              <li key={item.href} className="flex">
                <Card href={item.href} onBand className="flex w-full flex-col">
                  <span className="grid h-11 w-11 place-items-center rounded-sm bg-tint text-primary">
                    <Icon name={item.icon} size={22} weight="duotone" />
                  </span>
                  <Heading level={3} size="h5" className="mt-4">
                    {entry.label}
                  </Heading>
                  <Text size="small" className="mt-2">
                    {entry.desc}
                  </Text>
                </Card>
              </li>
            );
          })}
        </CardGrid>
      </Section>

      {/* 6 — THE STANDARD */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Figure
            id="home-standard"
            ratio="3/2"
            radius="lg"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
          <div className="flex flex-col items-start gap-6">
            <Kicker>{site.standard.kicker}</Kicker>
            <Heading level={2} size="h2" balance>
              {site.standard.title}
            </Heading>
            <StepList>
              {site.standard.principles.map((principle, index) => (
                <Step key={principle.title} n={index + 1} title={principle.title}>
                  {principle.desc}
                </Step>
              ))}
            </StepList>
            <Button href={HOME.standard.action.href} variant="outline">
              {HOME.standard.action.label}
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — QUESTIONS */}
      <Section id="questions" className="scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            kicker={HOME.questions.kicker}
            title={HOME.questions.title}
            lead={HOME.questions.lead}
          />
          <Accordion type="single">
            {faq.items.map((item) => (
              <AccordionItem key={item.id} id={item.id} title={item.q}>
                <Text>{item.a}</Text>
                {item.href && (
                  <div className="mt-3">
                    <Button
                      href={item.href}
                      variant="link"
                      iconEnd={<Icon name="arrow-right" size={15} />}
                    >
                      {HOME.questions.links[item.id]}
                    </Button>
                  </div>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* 8 — CTA BAND */}
      <CtaBand
        title={HOME.cta.title}
        body={HOME.cta.body}
        media={{ figureId: "cta-band" }}
        actions={
          <Button href={HOME.cta.action.href} variant="secondary" size="lg">
            {HOME.cta.action.label}
          </Button>
        }
      />
    </>
  );
}
