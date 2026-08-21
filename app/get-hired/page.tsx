import type { Metadata } from "next";
import { StagePage } from "@/components/journey";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/get-hired",
  title: "Get Hired, Stage 2",
  description:
    "Land your first client, systematically. Build assets that get replies, work the vetted directory of places to apply, track everything, and close the offer.",
});

export default function Page() {
  return <StagePage id="get-hired" />;
}
