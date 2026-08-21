import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/level-up",
  title: "Level Up, Stage 4",
  description:
    "Stage 4: pick one niche and go deep. Automate what repeats, add a premium language, and raise your rate on evidence you can show.",
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
