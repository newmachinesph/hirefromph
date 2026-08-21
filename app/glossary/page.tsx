import type { Metadata } from "next";
import { PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { GlossaryBrowser } from "@/components/practice/glossary-browser";
import { GLOSSARY_LAST_VERIFIED, TERMS } from "@/lib/glossary";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { Button, Icon, Text } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  path: "/glossary",
  title: "Glossary",
  description:
    "Plain definitions for every term this site uses, with a Tagalog gloss where one helps and a link to the guide that explains it.",
});

export default function GlossaryPage() {
  const neighbours = findNavNeighbours("/glossary");
  // The page has no referrer to send the reader back to, so the group's "up"
  // link stands in for "the guide you came from"; `prev` is the fallback.
  const back = neighbours.up ?? neighbours.prev;

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb("/glossary")}
        kicker="Glossary"
        title="Every term this site uses."
        lead={`${TERMS.length} definitions in plain English, each one linked to the guide that teaches it. Some carry a Tagalog gloss.`}
      />
      <Section>
        <GlossaryBrowser />
        <Text size="caption" tone="faint" className="mt-12">
          Definitions last checked {GLOSSARY_LAST_VERIFIED}.
        </Text>
      </Section>
      <Section band="tint">
        <SectionHeading
          kicker="Next"
          title="Found the word. Now use it."
          lead="Go back to the guide that sent you here, or test these terms as flashcards so they are still there in a month."
          action={
            <div className="flex flex-wrap gap-3">
              {back && (
                <Button href={back.href} variant="outline">
                  Back to {back.label}
                </Button>
              )}
              <Button href="/practice#decks" iconEnd={<Icon name="arrow-right" size={16} />}>
                Practice these terms
              </Button>
            </div>
          }
        />
      </Section>
      <Section spacing="none">
        <PageFooterNav
          prev={neighbours.prev}
          next={neighbours.next}
          up={neighbours.up}
          className="pb-20"
        />
      </Section>
    </>
  );
}
