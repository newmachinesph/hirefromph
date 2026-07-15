import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import apply from "@/data/apply.json";
import findwork from "@/data/findwork.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { CopyButton } from "@/components/copy-button";
import { FindWorkDirectory, VettingTool } from "@/components/find-work";
import { ButtonLink, Kicker, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/apply",
  title: "Find Work",
  description: findwork.intro,
});

const accentBg: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep",
  indigo: "bg-indigo-tint text-indigo",
  amber: "bg-amber-tint text-amber-text",
  emerald: "bg-emerald-tint text-emerald",
};

export default function Page() {
  return (
    <>
      {/* HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Find work</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Don&rsquo;t wait for a list.{" "}
            <span className="text-coral">Learn to find the work.</span>
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] text-ink-soft">
            {findwork.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <p className="mt-6 max-w-2xl rounded-2xl border border-line-strong bg-paper-3 px-6 py-5 font-display text-lg leading-snug text-ink text-balance">
            {findwork.creed}
          </p>
        </Reveal>

        <Reveal i={4}>
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-amber/30 bg-amber-tint px-6 py-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/25 text-amber-text">
              <AlertTriangle size={20} aria-hidden />
            </span>
            <p className="text-sm font-medium leading-relaxed text-[#6b4d00]">
              {apply.disclaimer}
            </p>
          </div>
        </Reveal>
      </section>

      {/* HOW TO SOURCE OPPORTUNITIES */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="The FIND method, applied"
            title="How to source opportunities yourself"
            lead="Five ways to find work before it's posted, before it's crowded, and long after this page is out of date."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {findwork.sourcing.map((method, idx) => (
            <Reveal key={method.id} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl ${accentBg[method.accent]}`}
                >
                  <Icon name={method.icon} size={20} />
                </span>
                <h3 className="mt-4 font-display text-xl leading-tight">
                  {method.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {method.how}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-faint">
                  <strong className="font-semibold text-ink-soft">
                    Why it works:{" "}
                  </strong>
                  {method.why}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {method.example.map((ex) => (
                    <div
                      key={ex}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line-strong bg-paper-3 px-3.5 py-2.5"
                    >
                      <code className="flex-1 overflow-x-auto whitespace-pre font-mono text-xs text-ink-soft">
                        {ex}
                      </code>
                      <CopyButton value={ex} label="Copy" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VETTING TOOL */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The VET method, applied"
              title="Is this opportunity legit?"
              lead={findwork.vetting.intro}
            />
          </Reveal>
          <div className="mt-12">
            <VettingTool />
          </div>
        </div>
      </section>

      {/* RESEARCH BEFORE YOU APPLY */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="Before you hit apply"
            title="Research the client before you apply"
            lead="A generic application gets ignored. A specific one, that names their actual problem, gets a reply."
          />
        </Reveal>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {findwork.research.map((step, idx) => (
            <Reveal key={step.title} i={idx % 4} as="li">
              <div className="flex h-full gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="font-display text-2xl text-line-strong">
                  0{idx + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* THE DIRECTORY, REFRAMED AS STUDY MATERIAL */}
      <section className="container-x pb-10">
        <Reveal>
          <SectionHeading
            kicker="Study material, not a shortcut"
            title="The directory below, study it, don't just click it"
            lead="These are real, working places Filipino online professionals get hired. Study the pattern across all of them, who they are, what they need, how they're structured, then use the method above to add your own. This list is a seed, not a substitute for knowing how to find work."
          />
        </Reveal>
      </section>
      <FindWorkDirectory />

      {/* BUILD YOUR OWN DIRECTORY */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The closing move"
              title="Build your own directory"
              lead={findwork.buildYourOwnDirectory.intro}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {findwork.buildYourOwnDirectory.steps.map((step, idx) => (
              <Reveal key={step.title} i={idx % 3}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
                  <span className="font-display text-2xl text-line-strong">
                    0{idx + 1}
                  </span>
                  <h3 className="mt-3 font-display text-lg leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSE BAND */}
      <section className="container-x py-20 lg:pb-28">
        <Reveal>
          <div className="grid gap-8 rounded-[var(--radius-lg)] border border-line bg-paper-3/70 p-8 sm:grid-cols-2 lg:p-12">
            <div className="flex flex-col">
              <Kicker>The method</Kicker>
              <h2 className="mt-4 font-display text-2xl leading-tight text-balance">
                Seven habits that make you resourceful, forever
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                FIND and VET, the two methods behind this page, are two of
                seven. See all of them.
              </p>
              <div className="mt-5">
                <ButtonLink href="/method" variant="outline">
                  See the full method
                </ButtonLink>
              </div>
            </div>
            <div className="flex flex-col">
              <Kicker>Stage 2</Kicker>
              <h2 className="mt-4 font-display text-2xl leading-tight text-balance">
                The full Get Hired playbook
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                Assets, outreach, tracking, and closing the offer, systematically, not randomly.
              </p>
              <div className="mt-5">
                <ButtonLink href="/get-hired">Go to Get Hired</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
