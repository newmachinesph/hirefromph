import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "Start Right, Stage 1",
  description:
    "Your foundation as an online professional. Set up your workspace, learn the core skills, and build the mindset that lasts. No degree or capital needed.",
});

export default function Page() {
  return (
    <>
      {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/start" /></Section> */}
      <StagePage id="start" />
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/start" /> */}
    </>
  );
}
