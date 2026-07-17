import type { Metadata } from "next";
import { Ban } from "lucide-react";
import labsData from "@/data/labs.json";
import { Reveal } from "@/components/reveal";
import { BuildLabs } from "@/components/build-labs";
import { PageHero, Pill } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/build",
  title: "Build Labs",
  description: labsData.intro,
});

export default function BuildPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero
        kicker="Build Labs"
        title={<>We don&rsquo;t hand you the file. We teach you to build it.</>}
        lead={labsData.intro}
      >
        <Reveal i={3}>
          <Pill tone="coral" className="mt-6">
            <Ban size={13} /> We hand out zero templates
          </Pill>
        </Reveal>
        <Reveal i={4}>
          <div className="mt-7 max-w-2xl rounded-2xl border border-line bg-paper-2 p-5">
            <p className="kicker mb-2">The creed</p>
            <p className="text-sm leading-relaxed text-ink-soft">{labsData.creed}</p>
          </div>
        </Reveal>
      </PageHero>

      {/* ------------------------------------------------------------ LAB GRID */}
      <section className="container-x pb-24 lg:pb-32">
        <BuildLabs />
      </section>
    </>
  );
}
