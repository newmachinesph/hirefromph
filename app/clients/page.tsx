import type { Metadata } from "next";
import clients from "@/data/clients.json";
import { AgencyVsDirect } from "@/components/diagrams/agency-vs-direct";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
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
  Source,
  Step,
  StepList,
  Text,
} from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/clients";

/** Pros and cons shown up front per road; the rest sit behind a disclosure. */
const ROAD_POINTS_SHOWN = 3;

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Own Your Clients",
  description:
    "Build a business of one. The independent-contractor mindset vs the employee mindset, a fair look at agency vs direct clients, the step-by-step way to land direct clients, and how to protect yourself like a real business.",
});

type DirectStep = {
  title: string;
  how: string;
  crossref?: { href: string; label: string } | null;
};

export default function ClientsPage() {
  const { hero, mindset, roads, getDirect, protect, closing } = clients;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker={hero.kicker}
        title={hero.line1}
        accent={hero.line2}
        lead={hero.intro}
      >
        <Callout tone="signal" className="max-w-2xl">
          {hero.creed}
        </Callout>
      </PageHero>

      {/* ------------------------------------------------------------ MINDSET */}
      <Section band="tint">
        <SectionHeading kicker={mindset.kicker} title={mindset.title} lead={mindset.lead} />

        <Card padding="none" className="mt-12" onBand>
          <div className="hidden grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-band sm:grid">
            <span className="p-4 text-kicker uppercase text-ink-faint">Dimension</span>
            <span className="p-4 text-kicker uppercase text-ink-faint">Employee</span>
            <span className="p-4 text-kicker uppercase text-verified">Independent contractor</span>
          </div>
          <ul className="divide-y divide-line">
            {mindset.rows.map((r) => (
              <li
                key={r.dimension}
                className="grid gap-2 p-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-0 sm:p-0"
              >
                <span className="font-display text-base leading-snug text-ink sm:p-4">
                  {r.dimension}
                </span>
                <span className="text-small leading-relaxed text-ink-faint sm:p-4">
                  <span className="mr-2 text-kicker uppercase text-ink-faint sm:hidden">
                    Employee ·
                  </span>
                  {r.employee}
                </span>
                <span className="text-small font-medium leading-relaxed text-ink sm:bg-verified-tint sm:p-4">
                  <span className="mr-2 text-kicker uppercase text-verified sm:hidden">
                    Contractor ·
                  </span>
                  {r.contractor}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Callout tone="verified" className="mt-8">
          <Text size="small" tone="ink" className="max-w-3xl font-medium">
            {mindset.note}
          </Text>
          <Source label={mindset.source.label} url={mindset.source.url} className="mt-3" />
        </Callout>
      </Section>

      {/* -------------------------------------------------------------- ROADS */}
      <Section>
        <SectionHeading kicker={roads.kicker} title={roads.title} lead={roads.lead} />

        <DiagramFrame
          title="Agency or direct: who holds the relationship"
          caption="Both lanes do the same four steps. Follow the last column: in the agency lane the client stays with the agency, in the direct lane the client is yours."
          className="mt-12"
        >
          <AgencyVsDirect />
        </DiagramFrame>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {[
            { id: "agency", road: roads.agency },
            { id: "direct", road: roads.direct },
          ].map(({ id, road }) => {
            const morePros = road.pros.slice(ROAD_POINTS_SHOWN);
            const moreCons = road.cons.slice(ROAD_POINTS_SHOWN);
            const moreCount = morePros.length + moreCons.length;
            return (
              <Card key={id} as="article" padding="lg">
                <Heading level={3} size="h3">
                  {road.title}
                </Heading>
                <Text size="small" className="mt-3">
                  {road.blurb}
                </Text>

                <RoadPoints kind="pros" items={road.pros.slice(0, ROAD_POINTS_SHOWN)} />
                <RoadPoints kind="cons" items={road.cons.slice(0, ROAD_POINTS_SHOWN)} />

                {moreCount > 0 && (
                  <Accordion className="mt-6">
                    <AccordionItem id={`${id}-more`} title={`${moreCount} more to weigh`}>
                      {morePros.length > 0 && <RoadPoints kind="pros" items={morePros} />}
                      {moreCons.length > 0 && <RoadPoints kind="cons" items={moreCons} />}
                    </AccordionItem>
                  </Accordion>
                )}
              </Card>
            );
          })}
        </div>

        <Callout tone="signal" className="mt-8 max-w-3xl">
          {roads.verdict}
        </Callout>
      </Section>

      {/* --------------------------------------------------------- GET DIRECT */}
      <Section band="tint">
        <SectionHeading kicker={getDirect.kicker} title={getDirect.title} lead={getDirect.lead} />

        <StepList className="mt-14">
          {(getDirect.steps as DirectStep[]).map((s, idx) => (
            <Step key={s.title} n={idx + 1} title={s.title}>
              <Text size="small">{s.how}</Text>
              {s.crossref && (
                <div className="mt-3">
                  <Button
                    href={s.crossref.href}
                    variant="link"
                    iconEnd={<Icon name="arrow-up-right" size={14} />}
                  >
                    {s.crossref.label}
                  </Button>
                </div>
              )}
            </Step>
          ))}
        </StepList>

        <Callout tone="verified" className="mt-10 max-w-3xl">
          {getDirect.note}
        </Callout>
      </Section>

      {/* ------------------------------------------------------------ PROTECT */}
      <Section>
        <SectionHeading kicker={protect.kicker} title={protect.title} lead={protect.lead} />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {protect.items.map((it) => (
            <Card key={it.title} as="article">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-on-navy">
                  <Icon name={it.icon} size={20} />
                </span>
                <Heading level={3} size="h5">
                  {it.title}
                </Heading>
              </div>
              <Text size="small" className="mt-4 flex-1">
                {it.desc}
              </Text>
              {it.crossref && (
                <div className="mt-5">
                  <Button href={it.crossref.href} variant="outline" size="sm">
                    {it.crossref.label}
                  </Button>
                </div>
              )}
              {it.source && (
                <div className="mt-5 border-t border-line pt-4">
                  <Source label={it.source.label} url={it.source.url} />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button
            href={protect.crossref.href}
            variant="link"
            iconEnd={<Icon name="arrow-up-right" size={16} />}
          >
            {protect.crossref.label}
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------------ CLOSING */}
      <Section band="tint">
        <SectionHeading kicker={closing.kicker} title={closing.title} lead={closing.body} />
        <Callout tone="signal" className="mt-6 max-w-2xl">
          {closing.point}
        </Callout>

        <CardGrid cols={2} className="mt-10">
          {closing.links.map((l) => (
            <Card key={l.href} href={l.href} onBand>
              <Heading level={3} size="h5">
                {l.label}
              </Heading>
              <Text size="small" className="mt-3 flex-1">
                {l.desc}
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}

function RoadPoints({ kind, items }: { kind: "pros" | "cons"; items: string[] }) {
  const isPro = kind === "pros";
  return (
    <div className="mt-6 flex flex-col gap-3">
      <Kicker tone={isPro ? "verified" : "coral"}>{isPro ? "Pros" : "Cons"}</Kicker>
      <ul className="flex flex-col gap-2.5">
        {items.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            <Icon
              name={isPro ? "check" : "x"}
              size={16}
              className={isPro ? "mt-0.5 shrink-0 text-verified" : "mt-0.5 shrink-0 text-coral"}
            />
            <Text size="small" tone={isPro ? "ink" : undefined} as="span">
              {p}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
