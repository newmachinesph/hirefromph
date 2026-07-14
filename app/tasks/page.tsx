import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import tasksData from "@/data/tasks.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { MicroTasks } from "@/components/micro-tasks";
import { ButtonLink, Kicker, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Micro-Tasks",
  description: tasksData.intro,
};

// One icon per step of the doctrine's four-step brief shape, data stays in tasks.json,
// this is just the visual language for it.
const stepIcons = ["list-checks", "book-open", "hammer", "trophy"];

export default function TasksPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>{tasksData.kicker}</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            {tasksData.headline}
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {tasksData.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <div className="mt-7 max-w-2xl rounded-2xl border border-line-strong bg-paper-3 px-6 py-5">
            <p className="kicker mb-2">The creed</p>
            <p className="font-display text-lg leading-snug text-ink text-balance">
              {tasksData.creed}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- HOW IT WORKS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="The shape of every task"
            title="Prerequisite → Resources → The Task → Prove it"
            lead="Every micro-task follows the same four-step brief, the same shape a real client hands a working professional."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tasksData.howItWorks.map((step, idx) => (
            <Reveal
              key={step.title}
              i={idx}
              className="relative flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6"
            >
              <span className="font-display text-3xl text-line-strong">0{idx + 1}</span>
              <span className="mt-4 grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                <Icon name={stepIcons[idx] ?? "sparkles"} size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg leading-tight">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              {idx < tasksData.howItWorks.length - 1 && (
                <ArrowRight
                  size={18}
                  aria-hidden
                  className="absolute top-1/2 -right-2.5 hidden -translate-y-1/2 text-line-strong lg:block"
                />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- GALLERY */}
      <section className="container-x pb-24 lg:pb-32">
        <MicroTasks />
      </section>

      {/* ---------------------------------------------------------- CLOSE BAND */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <div className="grid gap-8 rounded-[var(--radius-lg)] border border-line bg-paper-3/70 p-8 sm:grid-cols-2 lg:p-12">
            <div className="flex flex-col">
              <Kicker>Turn it into a portfolio</Kicker>
              <h2 className="mt-4 font-display text-2xl leading-tight text-balance">
                Every finished task is a portfolio piece
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                Learn the anatomy of a real portfolio, then assemble your finished micro-tasks into
                one.
              </p>
              <div className="mt-5">
                <ButtonLink href="/build" variant="outline">
                  Open the portfolio lab
                </ButtonLink>
              </div>
            </div>
            <div className="flex flex-col">
              <Kicker>Ready to apply</Kicker>
              <h2 className="mt-4 font-display text-2xl leading-tight text-balance">
                Take it straight to a client
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                Finished a few of these? You already have proof. Go find who needs it.
              </p>
              <div className="mt-5">
                <ButtonLink href="/apply">Find work</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
