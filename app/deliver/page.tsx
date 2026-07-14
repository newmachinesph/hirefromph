import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";

export const metadata: Metadata = {
  title: "Deliver, Stage 3",
  description:
    "Impress your client and become reliable. Onboard like a pro, systemize your work with SOPs and trackers, and communicate so clients trust you with more.",
};

export default function Page() {
  return <StagePage id="deliver" />;
}
