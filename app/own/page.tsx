import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/layout";
import { PracticeFooter, Tldr } from "@/components/practice";

export const metadata: Metadata = pageMeta({
  path: "/own",
  title: "Own, Stage 5",
  description:
    "Stage 5: move to direct clients, register with the BIR and pick the 8% option, then hold the door for whoever is coming up behind you.",
});

export default function Page() {
  return (
    <>
      <Section spacing="none"><Tldr route="/own" /></Section>
      <StagePage id="own" />
      <PracticeFooter route="/own" />
    </>
  );
}
