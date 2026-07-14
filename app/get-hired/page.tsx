import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";

export const metadata: Metadata = {
  title: "Get Hired — Stage 2",
  description:
    "Land your first client, systematically. Build assets that get replies, work the directory of 150+ places to apply, track everything, and close the offer.",
};

export default function Page() {
  return <StagePage id="get-hired" />;
}
