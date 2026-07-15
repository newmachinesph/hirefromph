import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/level-up",
  title: "Level Up, Stage 4",
  description:
    "From good to indispensable. Specialize into a high-value niche, automate the repetitive, learn a premium language, and raise your rate.",
});

export default function Page() {
  return <StagePage id="level-up" />;
}
