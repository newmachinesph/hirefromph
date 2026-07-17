import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/own",
  title: "Own, Stage 5",
  description:
    "The career becomes yours. Go direct, get legit, grow into an end-goal role, then send the ladder back down.",
});

export default function Page() {
  return <StagePage id="own" />;
}
