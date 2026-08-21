import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/layout";
import { PracticeFooter, Tldr } from "@/components/practice";

export const metadata: Metadata = pageMeta({
  path: "/get-hired",
  title: "Get Hired, Stage 2",
  description:
    "Stage 2: source your own leads with search operators, score them for red flags, and log every application so no follow-up goes late.",
});

export default function Page() {
  return (
    <>
      <Section spacing="none"><Tldr route="/get-hired" /></Section>
      <StagePage id="get-hired" />
      <PracticeFooter route="/get-hired" />
    </>
  );
}
