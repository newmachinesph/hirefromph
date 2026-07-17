import type { Metadata } from "next";
import plan from "@/data/plan.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { PageHero, Pill, SectionHeading } from "@/components/ui";
import { PlanWizard } from "@/components/plan-wizard";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/plan",
  title: "Your 30-Day Plan",
  description: plan.intro,
});

const quickFacts: { icon: string; label: string; tone: "coral" | "amber" | "emerald" }[] = [
  { icon: "sparkles", label: "Open to all", tone: "coral" },
  { icon: "clock", label: plan.commitment, tone: "amber" },
  { icon: "save", label: "Progress saved automatically", tone: "emerald" },
];

const howItWorks = [
  {
    n: "01",
    title: "Answer 5 quick questions",
    desc: "Experience, track, hours, equipment, and language goals.",
    icon: "list-checks",
  },
  {
    n: "02",
    title: "Get your day-by-day plan",
    desc: "30 days, mapped out with exact tasks and the in-app tool for each.",
    icon: "calendar-check",
  },
  {
    n: "03",
    title: "Track daily, right here",
    desc: "Check off each day as you finish it. Nothing to export or print.",
    icon: "check-circle-2",
  },
];

export default function PlanPage() {
  return (
    <>
      <PageHero
        kicker="Your 30-day plan"
        title={
          <span className="tracking-[-0.02em]">
            Thirty days. One clear plan.{" "}
            <span className="text-coral">Built around you.</span>
          </span>
        }
        lead={plan.intro}
        backdrop={
          <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-coral/10 blur-3xl" />
        }
      >
        <Reveal i={3}>
          <div className="mt-8 flex flex-wrap gap-3">
            {quickFacts.map((f) => (
              <Pill key={f.label} tone={f.tone}>
                <Icon name={f.icon} size={13} />
                {f.label}
              </Pill>
            ))}
          </div>
        </Reveal>
      </PageHero>

      <section className="container-x py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="How it works"
            title="Five minutes to a plan that fits your life"
            lead="No generic checklist. Your answers shape every one of the 30 days."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {howItWorks.map((s, idx) => (
            <Reveal key={s.n} i={idx}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm text-paper-2">
                    {s.n}
                  </span>
                  <Icon name={s.icon} size={18} className="text-coral" />
                </div>
                <h3 className="mt-5 font-display text-lg leading-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <PlanWizard />
        </Reveal>
      </section>
    </>
  );
}
