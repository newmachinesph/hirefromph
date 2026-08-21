import type { Metadata } from "next";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { GlossaryBrowser } from "@/components/practice/glossary-browser";
import { GLOSSARY_LAST_VERIFIED, TERMS } from "@/lib/glossary";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { Text } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  path: "/glossary",
  title: "Glossary",
  description:
    "Plain definitions for every term this site uses, with a Tagalog gloss where one helps and a link to the guide that explains it.",
});

export default function GlossaryPage() {
  const neighbours = findNavNeighbours("/glossary");

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
