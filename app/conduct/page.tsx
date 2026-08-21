import type { Metadata } from "next";
import conduct from "@/data/conduct.json";
import { IntegrityOath } from "@/components/integrity-oath";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import {
  Badge,
  Callout,
  Card,
  Heading,
  Icon,
  Kicker,
  Source,
  Text,
} from "@/components/ui";
import { accent } from "@/lib/accent";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";
import { cn } from "@/lib/utils";

const HREF = "/conduct";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Conduct & Integrity",
  description:
    "The documented behaviour that gets remote professionals fired, sued, and delisted, and the oath that keeps you out of it. Do's, don'ts, real cases, and an oath you write yourself.",
});

export default function ConductPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Conduct · Integrity · The oath"
        title="Nobody is watching you work."
        accent="That is the entire test."
        lead={conduct.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {conduct.creed}
        </Callout>
        <Text size="small" className="max-w-2xl">
          {conduct.whyItMatters}
        </Text>
        {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/conduct" /></Section> */}
      </PageHero>

      {/* --------------------------------------------------------- PRINCIPLES */}
      <Section band="tint">
        <SectionHeading
          kicker="Six principles · borrowed from the codes that govern real professions"
          title="These rules are older than remote work"
          lead="None of this was invented for freelancers. Engineers, doctors, and accountants have been bound by these exact clauses for decades, we've simply translated them into the situations you'll actually meet."
        />
        <CardGrid cols={3} className="mt-12">
          {conduct.principles.map((p) => (
            <Card key={p.id} as="article" onBand>
              <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-on-navy">
                <Icon name={p.icon} size={20} />
              </span>
              <Heading level={3} size="h4" className="mt-5">
                {p.name}
              </Heading>
              <Text size="small" tone="ink" className="mt-2 font-medium">
                {p.tagline}
              </Text>
              <Text size="small" className="mt-3 flex-1">
                {p.body}
              </Text>
              <div className="mt-5 border-t border-line pt-4">
                <Source label={p.source.label} url={p.source.url} />
              </div>
            </Card>
          ))}
        </CardGrid>

        <Callout tone="verified" title={conduct.philippineAnchor.title} className="mt-8">
          <Text size="small" className="max-w-3xl">
            {conduct.philippineAnchor.body}
          </Text>
          <Source
            label={conduct.philippineAnchor.source.label}
            url={conduct.philippineAnchor.source.url}
            className="mt-5"
          />
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- CASES */}
      <Section>
        <SectionHeading
          kicker="The price list"
          title="What it actually costs when this goes wrong"
          lead={conduct.casesIntro}
        />

        <div className="mt-12 flex flex-col gap-5">
          {conduct.cases.map((c) => {
            const a = accent(c.accent);
            return (
              <Card key={c.id} as="article" padding="lg">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <Badge tone={c.accent as "signal"} variant="outline">
                      {c.tag}
                    </Badge>
                    <Heading level={3} size="h3" className="mt-4" balance>
                      {c.title}
                    </Heading>
                    <Text size="caption" tone="faint" className="mt-3 tabular-nums">
                      {c.when}
                    </Text>
                    <Source label={c.source.label} url={c.source.url} className="mt-5" />
                  </div>

                  <div className="flex flex-col gap-4">
                    <Text size="small">{c.what}</Text>
                    <Card padding="sm">
                      <Text size="small" tone="ink">
                        <span className="font-semibold">The sting:</span> {c.sting}
                      </Text>
                    </Card>
                    <Text
                      size="small"
                      tone="ink"
                      className={cn("border-l-2 pl-4 font-medium", a.border)}
                    >
                      {c.lesson}
                    </Text>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------- DOS/DONTS */}
      <Section band="tint">
        <SectionHeading
          kicker="Do's and don'ts"
          title="The line is never blurry in the moment. It gets blurry in the retelling."
          lead={conduct.dosDontsIntro}
        />

        <div className="mt-14 flex flex-col gap-5">
          {conduct.dosDonts.map((area) => {
            const a = accent(area.accent);
            return (
              <Card key={area.id} as="article" padding="lg" onBand>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                      a.fill,
                    )}
                  >
                    <Icon name={area.icon} size={20} />
                  </span>
                  <Heading level={3} size="h4">
                    {area.area}
                  </Heading>
                </div>

                <div className="mt-7 grid gap-8 md:grid-cols-2">
                  <div>
                    <Kicker tone="verified">Do</Kicker>
                    <ul className="mt-4 flex flex-col gap-3">
                      {area.dos.map((d) => (
                        <li key={d} className="flex gap-3">
                          <Icon
                            name="check"
                            size={15}
                            className="mt-0.5 shrink-0 text-verified"
                          />
                          <Text size="small" as="span">
                            {d}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Kicker tone="coral">Never</Kicker>
                    <ul className="mt-4 flex flex-col gap-3">
                      {area.donts.map((d) => (
                        <li key={d} className="flex gap-3">
                          <Icon name="x" size={15} className="mt-0.5 shrink-0 text-coral" />
                          <Text size="small" as="span">
                            {d}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* --------------------------------------------------------------- OATH */}
      <Section>
        <SectionHeading
          align="center"
          title={conduct.oath.title}
          lead={conduct.oath.lead}
          size="display"
        />
        <div className="mt-6 flex justify-center">
          <Badge tone="verified">Nothing to download. Nothing uploaded.</Badge>
        </div>
        <Card padding="lg" className="mx-auto mt-12 max-w-3xl">
          <IntegrityOath />
        </Card>
      </Section>

      {/* ------------------------------------------------------------ HONESTY */}
      <Section band="tint" size="narrow">
        <Callout title={conduct.honesty.title}>
          <Text size="small">{conduct.honesty.body}</Text>
          <Source
            label={conduct.honesty.source.label}
            url={conduct.honesty.source.url}
            className="mt-5"
          />
        </Callout>
      </Section>

      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/conduct" /> */}

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
