import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/layout";
import { PracticeFooter, Tldr } from "@/components/practice";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "Start Right, Stage 1",
  description:
    "Stage 1 for Filipinos with no experience: check your equipment, finish one micro-task with no client, and learn a study protocol you write yourself.",
});

export default function Page() {
  return (
    <>
      <Section spacing="none"><Tldr route="/start" /></Section>
      <StagePage id="start" />
      <PracticeFooter route="/start" />
    </>
  );
}
