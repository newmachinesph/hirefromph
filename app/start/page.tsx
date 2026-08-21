import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "Start Right, Stage 1",
  description:
    "Stage 1 for Filipinos with no experience: check your equipment, finish one micro-task with no client, and learn a study protocol you write yourself.",
});

export default function Page() {
  return <StagePage id="start" />;
}
