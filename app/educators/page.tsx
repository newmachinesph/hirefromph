import type { Metadata } from "next";
import { CardGrid, PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { Button, Callout, Card, Text } from "@/components/ui";
import { DECKS, MASTER_DECK_ID } from "@/lib/deck";
import {
  EDUCATORS_INTRO,
  EDUCATORS_LAST_VERIFIED,
  KIT_LICENSE,
  PUBLISHED_KIT_FILES,
  QUICK_START,
  SESSIONS,
} from "@/lib/educators";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";

export const metadata: Metadata = pageMeta({
  path: "/educators",
  title: "For educators",
  description:
    "Run a Hire From PH session from this material: a master deck, one short deck per session, run-sheets and one-page sheets. PDF and PowerPoint, CC BY 4.0.",
});

function deckFiles(id: string) {
  return {
    present: `/educators/deck/${id}`,
    pdf: `/kit/decks/${id}.pdf`,
    pptx: `/kit/decks/${id}.pptx`,
    presenter: `/kit/decks/${id}-presenter.pptx`,
  };
}

function DeckCard({
  id,
  title,
  subtitle,
  slides,
  minutes,
  onBand,
}: {
  id: string;
  title: string;
  subtitle: string;
  slides: number;
  minutes?: number;
  onBand?: boolean;
}) {
  const files = deckFiles(id);
  const length = minutes ? `${minutes} min · ${slides} slides` : `${slides} slides`;
  return (
    <Card as="li" padding="lg" onBand={onBand} className="flex flex-col gap-4">
      <div>
        <Text size="caption" tone="faint" className="uppercase tracking-wider">
          {id === MASTER_DECK_ID ? "Master deck" : "Session deck"} · {length}
        </Text>
        <h3 className="mt-2 font-display text-h4 font-bold">{title}</h3>
        <Text size="small" className="mt-2">
          {subtitle}
        </Text>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button href={files.present} size="sm">
          Present
        </Button>
        <Button href={files.pdf} variant="outline" size="sm" external>
          PDF
        </Button>
        <Button href={files.pptx} variant="outline" size="sm" external>
          PowerPoint
        </Button>
        <Button href={files.presenter} variant="ghost" size="sm" external>
          Presenter PPTX
        </Button>
      </div>
    </Card>
  );
}

export default function EducatorsPage() {
  const neighbours = findNavNeighbours("/educators");
  const master = DECKS.find((deck) => deck.id === MASTER_DECK_ID);
  const sessionDecks = DECKS.filter((deck) => deck.id !== MASTER_DECK_ID);
  const sheets = PUBLISHED_KIT_FILES.filter((file) => !file.sessionId);
  const runSheets = PUBLISHED_KIT_FILES.filter((file) => file.sessionId);

  return (
    <>
      <PageHero
        breadcrumb={getBreadcrumb("/educators")}
        kicker="For educators"
        title={EDUCATORS_INTRO.title}
        lead={EDUCATORS_INTRO.lead}
        actions={
          master && (
            <>
              <Button href={`/educators/deck/${master.id}`}>Open the master deck</Button>
              <Button href="#sessions" variant="outline">
                The three sessions
              </Button>
            </>
          )
        }
      >
        <Callout tone="neutral" className="mt-8 max-w-3xl">
          {EDUCATORS_INTRO.honestyNote}
        </Callout>
      </PageHero>

      <Section id="decks">
        <SectionHeading
          kicker="Decks"
          title="Present it in the browser, or take the file."
          lead="Every deck is the same content three ways: present it here, print the PDF, or open the PowerPoint and change the words. The presenter PowerPoint is the exact slides as images, for a room where the pictures must match."
        />
        <CardGrid as="ul" cols={2} className="mt-10">
          {master && (
            <DeckCard id={master.id} title={master.title} subtitle={master.subtitle} slides={master.slides.length} />
          )}
          {sessionDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              id={deck.id}
              title={deck.title}
              subtitle={deck.subtitle}
              slides={deck.slides.length}
              minutes={deck.minutes}
            />
          ))}
        </CardGrid>
        <Text size="caption" tone="faint" className="mt-6">
          In the presenter: arrow keys move, N shows the speaker notes, F goes fullscreen. The slide number sits in
          the address bar, so a refresh keeps your place.
        </Text>
      </Section>

      <Section band="tint" id="sessions">
        <SectionHeading
          kicker="Sessions"
          title="Three sessions, each one drills one method."
          lead="A run-sheet with the clock, the room setup, the prompts and the mistakes to expect. Open the deck beside it."
        />
        <CardGrid as="ul" cols={3} className="mt-10">
          {SESSIONS.map((session) => {
            const sheet = runSheets.find((file) => file.sessionId === session.id);
            const deck = sessionDecks.find((candidate) => candidate.id === `session-${session.id}`);
            return (
              <Card as="li" padding="lg" onBand key={session.id} className="flex flex-col gap-4">
                <div>
                  <Text size="caption" tone="faint" className="uppercase tracking-wider">
                    {session.method} · {session.minutes} minutes
                  </Text>
                  <h3 className="mt-2 font-display text-h4 font-bold">{session.title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {session.objectives.slice(0, 2).map((objective) => (
                      <li key={objective}>
                        <Text size="small" as="span">
                          {objective}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {deck && (
                    <Button href={`/educators/deck/${deck.id}`} size="sm">
                      Deck
                    </Button>
                  )}
                  {sheet && (
                    <Button href={`/kit/${sheet.slug}.pdf`} variant="outline" size="sm" external>
                      Run-sheet PDF
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </CardGrid>
      </Section>

      <Section id="sheets">
        <SectionHeading
          kicker="One-page sheets"
          title="The doctrine, the path and the seven methods on paper."
          lead="Print these for the tables. They say what the site says, with the sources on the sheet."
        />
        <CardGrid as="ul" cols={3} className="mt-10">
          {sheets.map((file) => (
            <Card as="li" padding="lg" key={file.slug} className="flex flex-col gap-3">
              <div>
                <Text size="caption" tone="faint" className="uppercase tracking-wider">
                  {file.format}
                </Text>
                <h3 className="mt-2 font-display text-h4 font-bold">{file.title}</h3>
                <Text size="small" className="mt-2">
                  {file.blurb}
                </Text>
              </div>
              <div className="mt-auto">
                <Button href={`/kit/${file.slug}.pdf`} variant="outline" size="sm" external>
                  PDF
                </Button>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section id="quick-start">
        <SectionHeading kicker="Quick start" title="Six steps before your first session." />
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QUICK_START.map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="font-display text-h3 font-bold text-primary" aria-hidden="true">
                {String(step.n).padStart(2, "0")}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <Text size="small" className="mt-1">
                  {step.desc}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="licence">
        <SectionHeading kicker="Licence" title={`${KIT_LICENSE.name}, with attribution.`} lead={KIT_LICENSE.summary} />
        <Text size="small" className="mt-6">
          Attribution line: <span className="font-semibold">{KIT_LICENSE.attribution}</span>.{" "}
          <a
            href={KIT_LICENSE.url}
            className="text-primary underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the licence
          </a>
          .
        </Text>
        <Text size="caption" tone="faint" className="mt-8">
          Material last verified {EDUCATORS_LAST_VERIFIED}. Who this is for: {EDUCATORS_INTRO.whoFor.join(" · ")}.
        </Text>
      </Section>

      <Section spacing="none">
        <PageFooterNav prev={neighbours.prev} next={neighbours.next} up={neighbours.up} className="pb-20" />
      </Section>
    </>
  );
}
