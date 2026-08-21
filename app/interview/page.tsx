import type { Metadata } from "next";
import interview from "@/data/interview.json";
import { FreshnessNote } from "@/components/freshness-note";
import { JsonLd } from "@/components/json-ld";
import { StarWriter } from "@/components/star-writer";
import { CardGrid, PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { Button, Callout, Card, Heading, Icon, Kicker, Source, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/interview";

type PageLink = { label: string; href: string };

/** Page references live in the JSON as `{label, href}`; items without any get none. */
function linksOf(item: object): PageLink[] {
  return "links" in item && Array.isArray(item.links) ? (item.links as PageLink[]) : [];
}

function LinkRow({ links }: { links: PageLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5">
      {links.map((l) => (
        <Button
          key={l.href}
          href={l.href}
          variant="link"
          iconEnd={<Icon name="arrow-up-right" size={15} />}
        >
          {l.label}
        </Button>
      ))}
    </div>
  );
}

// FAQPage from the genuine question -> approach pairs in `questions.items`.
// These are real Q&A: the interview question and how to answer it.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: interview.questions.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.approach },
  })),
};

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Interview Prep",
  description:
    "The STAR method, a bank of the questions you'll face, questions to ask them, remote interview formats, and the red flags of a scam interview. Learn the structure, then build your own answers from your own stories.",
});

export default function InterviewPage() {
  const { hero, star, workshop, questions, askThem, formats, redFlags, closing } = interview;

  return (
    <>
      <JsonLd data={faqLd} />
      {/* --------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
        actions={
          <Button href="#workshop" icon={<Icon name="pen-line" size={15} />}>
            Write your STAR stories
          </Button>
        }
      >
        <blockquote className="max-w-2xl border-l-2 border-primary pl-5">
          <Text size="lead" tone="ink" className="font-display">
            {hero.creed}
          </Text>
        </blockquote>
        <FreshnessNote date={interview.lastVerified} />
      </PageHero>

      {/* --------------------------------------------------------------- STAR */}
      <Section band="tint">
        <SectionHeading kicker={star.kicker} title={star.title} lead={star.lead} />
        <CardGrid cols={2} className="mt-12">
          {star.parts.map((p) => (
            <Card key={p.letter} as="article" padding="lg" onBand>
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-ink font-display text-2xl text-on-navy">
                  {p.letter}
                </span>
                <div>
                  <Heading level={3} size="h4">
                    {p.name}
                  </Heading>
                  <Icon name={p.icon} size={15} className="text-ink-faint" />
                </div>
              </div>
              <Text size="small" className="mt-5">
                {p.desc}
              </Text>
              <Card padding="sm" className="mt-4">
                <Text size="small" tone="ink" className="italic">
                  {p.example}
                </Text>
              </Card>
              <Text size="small" tone="ink" className="mt-4 border-l-2 border-primary pl-3 font-medium">
                {p.watch}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <Text size="lead" tone="ink" className="mt-8 max-w-3xl border-l-2 border-verified pl-5 font-display">
          {star.note}
        </Text>
      </Section>

      {/* ------------------------------------------------------------ WORKSHOP */}
      <Section id="workshop" className="scroll-mt-20">
        <SectionHeading kicker={workshop.kicker} title={workshop.title} lead={workshop.lead} />

        <CardGrid cols={4} className="mt-12">
          {workshop.themes.map((t) => (
            <Card key={t.theme} as="article">
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-primary-tint text-primary-deep">
                <Icon name={t.icon} size={20} />
              </span>
              <Heading level={3} size="h5" className="mt-5">
                {t.theme}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {t.prompt}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <Card padding="lg" className="mt-10">
          <StarWriter themes={workshop.themes} steps={workshop.steps} />
        </Card>

        <div className="mt-8">
          <Button
            href={workshop.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {workshop.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ----------------------------------------------------------- QUESTIONS */}
      <Section band="tint">
        <SectionHeading kicker={questions.kicker} title={questions.title} lead={questions.lead} />

        <div className="mt-12 flex flex-col gap-4">
          {questions.items.map((q) => (
            <Card key={q.q} as="article" padding="lg" onBand>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                  <Icon name={q.icon} size={20} />
                </span>
                <div>
                  <Heading level={3} size="h5">
                    {q.q}
                  </Heading>
                  <Text size="small" className="mt-2">
                    {q.approach}
                  </Text>
                  <LinkRow links={linksOf(q)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ ASK THEM */}
      <Section>
        <SectionHeading kicker={askThem.kicker} title={askThem.title} lead={askThem.lead} />

        <div className="mt-10 max-w-3xl">
          <ul className="flex flex-col gap-3">
            {askThem.items.map((q) => (
              <li key={q}>
                <Card as="article">
                  <div className="flex items-start gap-3">
                    <Icon name="message-circle" size={18} className="mt-0.5 shrink-0 text-primary" />
                    <Text size="small" tone="ink" className="font-medium" as="span">
                      {q}
                    </Text>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Text size="small" className="mt-6 border-l-2 border-primary pl-5">
            {askThem.note}
          </Text>
        </div>
      </Section>

      {/* ------------------------------------------------------------- FORMATS */}
      <Section band="tint">
        <SectionHeading kicker={formats.kicker} title={formats.title} lead={formats.lead} />

        <CardGrid cols={2} className="mt-12">
          {formats.items.map((f) => (
            <Card key={f.name} as="article" onBand>
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-verified-tint text-verified">
                  <Icon name={f.icon} size={20} />
                </span>
                <div>
                  <Heading level={3} size="h5">
                    {f.name}
                  </Heading>
                  <Text size="small" className="mt-2">
                    {f.desc}
                  </Text>
                  <LinkRow links={linksOf(f)} />
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ----------------------------------------------------------- RED FLAGS */}
      <Section>
        <Kicker tone="coral">{redFlags.kicker}</Kicker>
        <Callout tone="coral" title={redFlags.title} className="mt-4 max-w-3xl">
          {redFlags.lead}
        </Callout>

        <CardGrid cols={2} className="mt-8">
          {redFlags.items.map((f) => (
            <Card key={f.flag} as="article">
              <div className="flex items-start gap-3">
                <Icon name="shield-alert" size={20} className="mt-0.5 shrink-0 text-coral" />
                <Heading level={3} size="h5">
                  {f.flag}
                </Heading>
              </div>
              <Text size="small" className="mt-3">
                {f.why}
              </Text>
            </Card>
          ))}
        </CardGrid>
        <Source label={redFlags.source.label} url={redFlags.source.url} className="mt-6" />
        <div className="mt-4">
          <Button
            href={redFlags.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {redFlags.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section>
        <Card padding="lg">
          <Kicker>{closing.kicker}</Kicker>
          <Heading level={2} size="h2" className="mt-3 max-w-3xl" balance>
            {closing.title}
          </Heading>
          <Text size="base" className="mt-5 max-w-2xl">
            {closing.body}
          </Text>
          <Text size="lead" tone="ink" className="mt-5 max-w-2xl border-l-2 border-primary pl-5 font-display">
            {closing.point}
          </Text>

          <CardGrid cols={3} className="mt-10">
            {closing.links.map((l) => (
              <Card key={l.href} href={l.href}>
                <Heading level={3} size="h5">
                  {l.label}
                </Heading>
                <Text size="small" className="mt-2 flex-1">
                  {l.desc}
                </Text>
              </Card>
            ))}
          </CardGrid>
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
