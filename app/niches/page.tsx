import type { Metadata } from "next";
import tracks from "@/data/tracks.json";
import frameworks from "@/data/frameworks.json";
import salary from "@/data/salary.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { NicheExplorer } from "@/components/niche-explorer";
import { NicheScorer } from "@/components/niche-scorer";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

const CRITERION_ICON_TONE = [
  "bg-coral-tint text-coral-deep",
  "bg-emerald-tint text-emerald",
  "bg-[#fdf3d9] text-[#9a6b00]",
  "bg-[#e9e9fd] text-indigo",
];

export const metadata: Metadata = {
  title: "Niche Learning Hub",
  description:
    "Pick your lane and go deep. Explore 11 online-career niches, including new lanes like streaming, podcast production, and faith-based support, with pay bands, demand, skills, open courses, and how AI is changing each one.",
};

const steps = [
  {
    n: "01",
    title: "Pick a niche",
    desc: "Browse the 11 lanes below and see the pay, demand, and skills for each.",
    icon: "compass",
  },
  {
    n: "02",
    title: "Where to learn",
    desc: "Follow the courses, YouTube guides, and templates built for that niche.",
    icon: "graduation-cap",
  },
  {
    n: "03",
    title: "Get certified",
    desc: "Earn the certs clients actually look for, most at no cost.",
    icon: "award",
  },
  {
    n: "04",
    title: "Land clients",
    desc: "Apply with a niche-specific profile that stands out from generalists.",
    icon: "briefcase",
  },
];

export default function NichesPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Niche Learning Hub</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Pick your lane. Go deep.
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {tracks.intro}
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ EVALUATE ANY NICHE */}
      <section className="pb-14 lg:pb-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The method"
              title="How to evaluate any niche"
              lead={frameworks.niche.intro}
            />
          </Reveal>
          <Reveal i={1}>
            <blockquote className="mt-8 max-w-2xl rounded-2xl border border-line bg-paper-2 p-6">
              <p className="font-display text-xl leading-snug text-ink text-balance">
                &ldquo;{frameworks.niche.creed}&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {frameworks.niche.criteria.map((c, idx) => (
              <Reveal key={c.id} i={idx % 3}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-xl",
                        CRITERION_ICON_TONE[idx % 4],
                      )}
                    >
                      <Icon name={c.icon} size={20} />
                    </span>
                    <span className="mt-1 shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                      Weight ×{c.weight}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg leading-tight">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {c.question}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {c.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1} className="mt-14">
            <SectionHeading
              kicker="Answer it yourself"
              title="How to research each question"
              lead="Not vibes, not a course seller's confidence, five concrete moves that get you a real answer."
            />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {frameworks.niche.howToResearch.map((m, idx) => (
              <Reveal key={m.id} i={idx % 2}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={m.icon} size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-tight">
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {m.desc}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.answers.map((a) => {
                        const crit = frameworks.niche.criteria.find(
                          (c) => c.id === a,
                        );
                        return crit ? (
                          <Pill key={a} tone="neutral">
                            {crit.name}
                          </Pill>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1} className="mt-14">
            <SectionHeading
              kicker="Try it now"
              title="Score a niche yourself"
              lead="Any niche, including one we never listed. Rate it 1–5 across the seven questions above and get an honest, weighted verdict."
            />
          </Reveal>
          <Reveal i={2} className="mt-8">
            <NicheScorer />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- HOW IT WORKS */}
      <section className="border-y border-line bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="How it works"
              title="Four steps from curious to hired"
              align="center"
              className="mx-auto"
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <Reveal key={s.n} i={idx}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl text-line-strong">{s.n}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-paper-2">
                      <Icon name={s.icon} size={18} />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- NICHE EXPLORER */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="11 worked examples"
            title="Tap a niche to see the full breakdown"
            lead={
              <>
                {tracks.note} {frameworks.niche.examplesNote}
              </>
            }
          />
        </Reveal>
        <Reveal i={1}>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald/30 bg-emerald-tint p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald text-white">
              <Icon name="cpu" size={18} />
            </span>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-ink">
              {tracks.aiFraming}
            </p>
          </div>
        </Reveal>
        <Reveal i={2} className="mt-10">
          <NicheExplorer />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ END GOALS */}
      <section className="border-y border-line bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Where these lanes lead · not where you start"
              title={salary.emerging.title}
              lead={salary.emerging.lead}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salary.emerging.roles.map((r, idx) => (
              <Reveal key={r.role} i={idx % 3}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={r.icon} size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-snug">{r.role}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.blurb}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal i={1}>
            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {salary.emerging.note2}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ NEXT STEPS */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-line bg-ink px-8 py-10 text-paper-2">
              <p className="kicker text-paper-2/60">Next step</p>
              <h2 className="mt-3 font-display text-2xl leading-tight text-balance">
                Turn your niche into a 30-day plan.
              </h2>
              <div className="mt-6">
                <ButtonLink
                  href="/plan"
                  variant="primary"
                  className="bg-coral text-white hover:bg-white hover:!text-ink"
                >
                  Build my 30-day plan
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 px-8 py-10">
              <p className="kicker">Rate multiplier</p>
              <h2 className="mt-3 font-display text-2xl leading-tight text-balance text-ink">
                Add a premium language to your niche.
              </h2>
              <div className="mt-6">
                <ButtonLink href="/languages" variant="outline">
                  See the language premium
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
