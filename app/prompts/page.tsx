import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Quote,
  XCircle,
} from "lucide-react";
import promptingData from "@/data/prompting.json";
import promptsData from "@/data/prompts.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { PromptWorkshop } from "@/components/prompt-workshop";
import { Kicker, Pill, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "AI Leverage",
  description: promptingData.intro,
};

function partLabel(id: string): string {
  return promptingData.anatomy.find((a) => a.id === id)?.part ?? id;
}

function specimenPrompt(id: string) {
  return promptsData.prompts.find((p) => p.id === id);
}

export default function PromptsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[440px] w-[440px] rounded-full bg-coral/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-56 left-[-8%] h-[360px] w-[360px] rounded-full bg-indigo/10 blur-3xl"
        />
        <div className="container-x relative pt-14 pb-10 lg:pt-20">
          <Reveal>
            <Kicker>{promptingData.kicker}</Kicker>
          </Reveal>
          <Reveal i={1}>
            <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              {promptingData.headline}
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
              {promptingData.intro}
            </p>
          </Reveal>
          <Reveal i={3}>
            <blockquote className="relative mt-10 max-w-2xl rounded-[var(--radius-lg)] border border-coral/20 bg-coral-tint px-8 py-8">
              <Quote size={26} className="text-coral/50" aria-hidden />
              <p className="mt-3 font-display text-[length:var(--text-h3)] leading-snug text-ink text-balance">
                &ldquo;{promptingData.creed}&rdquo;
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ ANATOMY */}
      <section className="container-x py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="The anatomy of a prompt"
            title="Eight parts. Learn them once, use them forever."
            lead="Every strong prompt is made of the same parts, most weak ones are just missing one. Study the difference below, then build with it."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {promptingData.anatomy.map((item, idx) => (
            <Reveal key={item.id} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl text-line-strong">
                    0{idx + 1}
                  </span>
                  <h3 className="font-display text-lg leading-tight">{item.part}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.purpose}</p>
                <p className="mt-3 rounded-xl border border-line bg-paper p-3 text-xs leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Rule, </span>
                  {item.rule}
                </p>
                <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-coral/25 bg-coral-tint p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-coral-deep">
                      <XCircle size={14} aria-hidden />
                      Weak
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{item.weak}</p>
                  </div>
                  <div className="rounded-xl border border-emerald/25 bg-emerald-tint p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald">
                      <CheckCircle2 size={14} aria-hidden />
                      Strong
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{item.strong}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- PRINCIPLES */}
      <section className="bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Principles"
              title="Six habits that separate a real prompt from a lucky one"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promptingData.principles.map((p, idx) => (
              <Reveal key={p.title} i={idx % 3}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-base leading-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- ITERATE LOOP */}
      <section className="container-x py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="The iteration loop"
            title="Draft, run, diagnose, change one thing, re-run"
            lead="No prompt works on the first try. What separates people who improve fast is a procedure for the second try, not luck."
          />
        </Reveal>
        <ol className="mt-10 space-y-4">
          {promptingData.iterate.map((step) => (
            <Reveal key={step.n} i={step.n % 4} as="li">
              <div className="flex gap-5 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-display text-sm text-paper-2">
                  {step.n}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg leading-tight">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
                  {"signals" in step && step.signals && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {step.signals.map((s) => (
                        <div
                          key={s.symptom}
                          className="rounded-xl border border-amber/25 bg-[#fdf3d9] p-3 text-xs leading-relaxed"
                        >
                          <p className="font-semibold text-[#9a6b00]">{s.symptom}</p>
                          <p className="mt-1 text-ink-soft">→ {s.cause}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------- USE CASES */}
      <section className="bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Where to point it"
              title="What a remote career actually uses AI for"
              lead="Not finished prompts, situations. Use the anatomy above to build the exact prompt each one needs."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promptingData.useCases.map((u, idx) => (
              <Reveal key={u.id} i={idx % 3}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9e9fd] text-indigo">
                    <Icon name={u.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-tight">{u.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{u.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- THE WORKSHOP */}
      <section id="workshop" className="container-x scroll-mt-24 py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Prompt workshop"
            title="Build yours now"
            lead="Fill in what you know about your real situation. This assembles into your prompt, live, not ours."
          />
        </Reveal>
        <Reveal i={1} className="mt-10">
          <PromptWorkshop
            intro={promptingData.builder.intro}
            fields={promptingData.builder.fields}
            qualityLevels={promptingData.builder.qualityLevels}
          />
        </Reveal>
      </section>

      {/* --------------------------------------------------------- CRITIQUE */}
      <section className="bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Judging the output"
              title="A prompt isn't done when it runs. It's done when it survives your own critique."
            />
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal i={0}>
              <div className="h-full rounded-[var(--radius-lg)] border border-line bg-paper-2 p-7 lg:p-8">
                <h3 className="font-display text-xl leading-tight">
                  Judge it before anyone else does
                </h3>
                <ul className="mt-6 space-y-5">
                  {promptingData.critique.map((c) => (
                    <li key={c.q}>
                      <p className="flex items-start gap-2 text-sm font-semibold text-ink">
                        <CircleHelp size={16} className="mt-0.5 shrink-0 text-coral" aria-hidden />
                        {c.q}
                      </p>
                      <p className="mt-1.5 pl-6 text-sm leading-relaxed text-ink-soft">{c.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="h-full rounded-[var(--radius-lg)] border border-line bg-paper-2 p-7 lg:p-8">
                <h3 className="font-display text-xl leading-tight">
                  Kill AI-slop before a client sees it
                </h3>
                <ul className="mt-6 space-y-5">
                  {promptingData.slopChecklist.map((s) => (
                    <li key={s.tell}>
                      <p className="flex items-start gap-2 text-sm font-semibold text-ink">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-coral" aria-hidden />
                        {s.tell}
                      </p>
                      <p className="mt-1.5 pl-6 text-sm leading-relaxed text-ink-soft">
                        <span className="font-semibold text-emerald">Fix, </span>
                        {s.fix}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- SPECIMENS */}
      <section className="container-x py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Worked examples"
            title="Specimens to dissect, not to copy"
            lead={promptingData.specimensIntro}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {promptingData.specimens.map((specimen, idx) => {
            const prompt = specimenPrompt(specimen.promptId);
            if (!prompt) return null;
            return (
              <Reveal key={specimen.promptId} i={idx % 4}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg leading-tight">{prompt.title}</h3>
                    <span className="shrink-0 rounded-full border border-line-strong bg-paper-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                      Specimen
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{prompt.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {specimen.usesParts.map((id) => (
                      <Pill key={id} tone="indigo">
                        {partLabel(id)}
                      </Pill>
                    ))}
                  </div>
                  <pre className="mt-4 max-h-32 overflow-hidden whitespace-pre-wrap rounded-xl border border-line-strong bg-paper-3 p-4 font-mono text-xs leading-relaxed text-ink-faint">
                    {prompt.text}
                  </pre>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">Dissect, </span>
                    {specimen.note}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------- CLOSE */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/method"
              className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-2 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
            >
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2 transition-colors group-hover:bg-coral">
                  <Icon name="key-round" size={20} />
                </span>
                <h3 className="mt-5 font-display text-xl">This is the same method, everywhere</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Anatomy, judgment, a workshop, self-critique, the six-method framework this
                  page is built from.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                See the method
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/build"
              className="group flex flex-col justify-between rounded-2xl border border-line bg-paper-2 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
            >
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2 transition-colors group-hover:bg-coral">
                  <Icon name="hammer" size={20} />
                </span>
                <h3 className="mt-5 font-display text-xl">Now use it on a real deliverable</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Build Labs teach the same way, never a download, always a workshop you build
                  yourself.
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                Open Build Labs
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
