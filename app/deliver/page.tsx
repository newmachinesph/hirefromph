import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/deliver",
  title: "Deliver, Stage 3",
  description:
    "Impress your client and become reliable. Onboard like a pro, systemize your work with SOPs and trackers, and communicate so clients trust you with more.",
});

export default function Page() {
  return (
    <>
      {/* practice: Phase 6 replaces this line with <Section spacing="none"><Tldr route="/deliver" /></Section> */}
      <StagePage id="deliver" />
      {/* practice: Phase 6 replaces this line with <PracticeFooter route="/deliver" /> */}
    </>
  );
}
