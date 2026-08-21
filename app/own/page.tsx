import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/own",
  title: "Own, Stage 5",
  description:
    "The career becomes yours. Go direct, get legit, grow into an end-goal role, then send the ladder back down.",
});

export default function Page() {
  return (
    <>
      {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/own" /></Section> */}
      <StagePage id="own" />
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/own" /> */}
    </>
  );
}
