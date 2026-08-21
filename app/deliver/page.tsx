import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/layout";
import { PracticeFooter, Tldr } from "@/components/practice";

export const metadata: Metadata = pageMeta({
  path: "/deliver",
  title: "Deliver, Stage 3",
  description:
    "Stage 3: run your first week like an audition. Write the SOPs and trackers your role needs, and send status updates a client can act on.",
});

export default function Page() {
  return (
    <>
      <Section spacing="none"><Tldr route="/deliver" /></Section>
      <StagePage id="deliver" />
      <PracticeFooter route="/deliver" />
    </>
  );
}
