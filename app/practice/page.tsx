import type { Metadata } from "next";
import { PageFooterNav, PageHero, Section } from "@/components/layout";
import { PracticeHub } from "@/components/practice/practice-hub";
import { pageMeta } from "@/lib/meta";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";

export const metadata: Metadata = pageMeta({
  path: "/practice",
  title: "Practice",
  description:
    "Flashcards and quizzes on a spacing schedule, so what you read on this site is still there in a month. Saved in your browser, sent nowhere.",
});

export default function PracticePage() {
  const neighbours = findNavNeighbours("/practice");

  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb("/practice")}
        kicker="Practice"
        title="Bring it back from memory."
        lead="Reading a page twice feels like learning. Recalling it a week later is learning. Everything here is saved in your browser and sent nowhere."
      />
      <Section>
        <PracticeHub />
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
