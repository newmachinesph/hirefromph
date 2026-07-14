import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";

export const metadata: Metadata = {
  title: "Start Right — Stage 1",
  description:
    "Your foundation as an online professional. Set up your workspace, learn the core skills, and build the mindset that lasts. No degree or capital needed.",
};

export default function Page() {
  return <StagePage id="start" />;
}
