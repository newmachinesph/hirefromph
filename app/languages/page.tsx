import type { Metadata } from "next";
import languagesData from "@/data/languages.json";
import { FreshnessNote } from "@/components/freshness-note";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Button,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { PracticeFooter, Tldr } from "@/components/practice";

const HREF = "/languages";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Language Edge, A Second Language Thins the Field",
  description: languagesData.intro,
});

type Language = (typeof languagesData.languages)[number];
type Tone = "signal" | "caution" | "info";

/**
 * Premium tier -> accent. The emoji flags in the JSON are deliberately not
 * rendered (spec §9): a flag is decoration, and three of them read as an
 * unlabelled colour code to anyone using a screen reader.
 */
const PREMIUM_TONE: Record<string, Tone> = {
  Highest: "signal",
  High: "caution",
  Moderate: "info",
};

function learnTone(type: string): "verified" | "neutral" {
  return type.trim().toLowerCase().startsWith("free") ? "verified" : "neutral";
}

export default function LanguagesPage() {
  const [hero, ...rest] = languagesData.languages;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="The language edge"
        title="A second language"
        accent="thins the field."
        lead={languagesData.intro}
      >
        <FreshnessNote date={languagesData.lastVerified} />
        <Section spacing="none"><Tldr route="/languages" /></Section>
      </PageHero>

      {/* ---------------------------------------------------------- LANGUAGES */}
      <Section>
        <SectionHeading
          kicker="Highest paying first"
          title="Which language pays the most"
          lead={languagesData.premiumNote}
        />

        <Callout
          tone="verified"
          icon="graduation-cap"
          title={languagesData.startFree.title}
          className="mt-8 max-w-3xl"
        >
          <Text size="small" tone="ink">
            {languagesData.startFree.body}
          </Text>
          <div className="mt-2">
            <Button
              href={languagesData.startFree.url}
              external
              variant="link"
              iconEnd={<Icon name="arrow-up-right" size={13} />}
            >
              {languagesData.startFree.label}
            </Button>
          </div>
        </Callout>

        <div className="mt-10">
          <LanguageCard language={hero} featured />
        </div>

        <CardGrid cols={3} className="mt-6">
          {rest.map((lang) => (
            <LanguageCard key={lang.id} language={lang} />
          ))}
        </CardGrid>
      </Section>

      {/* ------------------------------------------------------- HOW TO START */}
      <Section band="tint">
        <SectionHeading align="center" kicker="Four steps" title="How to start, this week" />
        <StepList className="mt-12">
          {languagesData.howto.map((h, idx) => (
            <Step key={h.step} n={idx + 1} title={h.step}>
              {h.desc}
            </Step>
          ))}
        </StepList>
      </Section>

      {/* ------------------------------------------------------------ CALLOUT */}
      <Section>
        <Card padding="lg">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Kicker>The compounding move</Kicker>
              <Heading level={2} size="h3" className="mt-4 max-w-xl" balance>
                Stack a language on your niche for the biggest jump.
              </Heading>
              <Text className="mt-3 max-w-lg">
                A premium language plus a specialized niche is where Filipino online
                professionals see the largest rate increases, not either alone.
              </Text>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/level-up">See Level Up</Button>
              <Button href="/niches" variant="outline">
                Explore niches
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      <PracticeFooter route="/languages" />

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}

function LanguageCard({
  language,
  featured = false,
}: {
  language: Language;
  featured?: boolean;
}) {
  const tone = PREMIUM_TONE[language.premium] ?? "info";
  return (
    <Card as="article" padding={featured ? "lg" : "md"}>
      <div className="flex items-start justify-between gap-4">
        <Heading level={3} size={featured ? "h3" : "h4"} className="min-w-0">
          {language.name}
        </Heading>
        <Badge tone={tone}>{language.premium}</Badge>
      </div>

      <Text size={featured ? "lead" : "base"} tone="ink" className="mt-5 font-semibold">
        {language.payNote}
      </Text>
      <Text size="small" className="mt-3">
        {language.why}
      </Text>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {language.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>

      <Text size="caption" tone="faint" className="mt-4 flex items-center gap-1.5">
        <Icon name="clock" size={13} /> {language.effort}
      </Text>

      <div className="mt-6 border-t border-line pt-5">
        <Kicker>Where to learn, free &amp; paid</Kicker>
        <ul className="mt-3">
          {language.learn.map((school) => (
            <li
              key={school.name}
              className="flex flex-col gap-1.5 border-t border-line py-4 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text size="base" tone="ink" as="span" className="font-semibold">
                  {school.name}
                </Text>
                <Badge tone={learnTone(school.type)}>{school.type}</Badge>
              </div>
              <Text size="small">{school.detail}</Text>
              {school.url !== "#" && (
                <Button
                  href={school.url}
                  external
                  variant="link"
                  iconEnd={<Icon name="arrow-up-right" size={13} />}
                >
                  Visit site
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
