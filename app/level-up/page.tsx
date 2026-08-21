import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/level-up",
  title: "Level Up, Stage 4",
  description:
    "From good to indispensable. Specialize into a high-value niche, automate the repetitive, learn a premium language, and raise your rate.",
});

export default function Page() {
  return (
    <>
      {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/level-up" /></Section> */}
      <StagePage id="level-up" />
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/level-up" /> */}
    </>
  );
}
