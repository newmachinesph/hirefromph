import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = {
  ...pageMeta({
    path: "/path",
    title: "Your Career Path",
    description:
      "Your private, personalized Hire From PH dashboard for roadmap progress, next moves, and niche-specific tools.",
  }),
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PathLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
