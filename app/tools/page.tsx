import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import tools from "@/data/tools.json";
import learn from "@/data/learntools.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { CopyButton } from "@/components/copy-button";
import { ButtonLink, PageHero, Pill, SectionHeading } from "@/components/ui";
import { FreshnessNote } from "@/components/freshness-note";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/tools",
  title: "Learn Any Tool",
  description: learn.intro,
});

const accentSoft: Record<string, string> = {
  signal: "bg-signal-tint text-signal-deep",
  verified: "bg-verified-tint text-verified",
  caution: "bg-caution-tint text-caution-text",
  info: "bg-info-tint text-info",
};
const accentText: Record<string, string> = {
  signal: "text-signal",
  verified: "text-verified",
  caution: "text-caution-text",
  info: "text-info",
};
const accentBar: Record<string, string> = {
  signal: "bg-signal",
  verified: "bg-verified",
  caution: "bg-caution",
  info: "bg-info",
};
const levelTone: Record<string, "neutral" | "signal" | "verified" | "caution" | "info"> = {
  Core: "verified",
  Intermediate: "caution",
  Advanced: "signal",
};

export default function ToolsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <PageHero kicker={learn.kicker} title={learn.headline} lead={learn.intro}>
        <Reveal i={3}>
          <div className="mt-8 max-w-2xl rounded-2xl border border-line-strong bg-ink px-6 py-5 text-paper-2">
            <p className="font-display text-lg leading-snug text-balance">
              {learn.creed}
            </p>
          </div>
        </Reveal>
        <Reveal i={4}>
          <div className="mt-6">
            <FreshnessNote date={tools.lastVerified} />
          </div>
        </Reveal>
      </PageHero>

      {/* ------------------------------------------------------------ METHOD */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="The 5-step method"
            title="How to learn any tool, fast"
            lead="Run these five steps on the next unfamiliar tool a client hands you. Same five steps, every time, regardless of what the tool is."
          />
        </Reveal>
        <div className="relative mt-10 flex flex-col gap-5">
          {learn.method.map((m, idx) => (
            <Reveal key={m.n} i={idx % 4} className="relative">
              {idx < learn.method.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[27px] top-[68px] hidden h-[calc(100%+8px)] w-px bg-line-strong md:block"
                />
              )}
              <div className="relative flex flex-col gap-5 rounded-2xl border border-line bg-paper-2 p-6 md:flex-row md:p-8">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl ${accentSoft[m.accent]}`}
                >
                  {String(m.n).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon name={m.icon} size={17} className={accentText[m.accent]} />
                    <h3 className="font-display text-xl leading-tight">{m.title}</h3>
                  </div>
                  <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {m.desc}
                  </p>
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line-strong bg-paper-3/60 px-4 py-3">
                    <ArrowRight
                      size={15}
                      className={`mt-0.5 shrink-0 ${accentText[m.accent]}`}
                    />
                    <p className="text-sm leading-relaxed text-ink">
                      <span className="font-semibold">Do this: </span>
                      {m.doThis}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- TEARDOWN */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="The reusable instrument"
            title="The tool teardown"
            lead={learn.teardown.intro}
          />
        </Reveal>
        <Reveal i={1} className="mt-10">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line-strong bg-paper-2">
            <div className="flex items-center gap-3 border-b border-line bg-ink px-6 py-5 text-paper-2">
              <Icon name="clipboard-check" size={18} className="text-signal" />
              <span className="font-display text-lg">
                Run this on any tool before the tutorial
              </span>
            </div>
            <div className="divide-y divide-line">
              {learn.teardown.questions.map((q, idx) => (
                <div key={q.q} className="flex gap-5 px-6 py-5">
                  <span className="pt-0.5 font-mono text-xs text-ink-faint">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-base leading-snug text-balance">
                      {q.q}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {q.why}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line-strong bg-signal-tint px-6 py-5">
              <p className="text-sm font-semibold leading-relaxed text-signal-deep">
                {learn.teardown.principle}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- EVALUATE */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Spend your hours well"
            title="Is it even worth learning?"
            lead="Not every tool deserves front-loading. Run any candidate through these four questions before you sink an hour into it."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {learn.evaluate.map((e, idx) => (
            <Reveal key={e.title} i={idx % 4}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                  <Icon name={e.icon} size={19} />
                </span>
                <div>
                  <h3 className="font-display text-lg leading-tight">{e.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {e.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- TOOL LANDSCAPE */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Practice targets, not a curriculum"
            title="The tools the market actually asks for"
            lead="These are not a list to passively work through. They're what real job posts ask for, pick one, run the teardown on it, hit the 60-minute build. The tool is the gym, not the goal."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {tools.categories.map((cat, idx) => (
            <Reveal key={cat.id} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl ${accentSoft[cat.accent]}`}
                    >
                      <Icon name={cat.icon} size={20} />
                    </span>
                    <h3 className="font-display text-xl leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 rounded-full ${accentBar[cat.accent]}`}
                  />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {cat.blurb}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-1 border-t border-line pt-4">
                  {cat.tools.map((tool) => (
                    <li
                      key={tool.name}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-paper-3/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {tool.name}
                        </p>
                        <p className="truncate text-xs text-ink-faint">
                          {tool.skill}
                        </p>
                      </div>
                      <Pill
                        tone={levelTone[tool.level] ?? "neutral"}
                        className="shrink-0"
                      >
                        {tool.level}
                      </Pill>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ CODES */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Worked examples, not a library"
            title="Codes for efficiency"
            lead={learn.codeLiteracy.intro}
          />
        </Reveal>

        <Reveal i={1} className="mt-8">
          <div className="grid gap-3 rounded-2xl border border-line-strong bg-paper-3/60 p-6 sm:grid-cols-2">
            {learn.codeLiteracy.questions.map((q) => (
              <div key={q.q}>
                <p className="text-sm font-semibold text-ink">{q.q}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {q.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {tools.codes.items.map((item, idx) => (
            <Reveal key={item.title} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg leading-tight text-balance">
                    {item.title}
                  </h3>
                  <Pill tone="info" className="shrink-0">
                    {item.lang}
                  </Pill>
                </div>
                <pre className="mt-4 flex-1 overflow-x-auto rounded-xl border border-line-strong bg-ink p-4">
                  <code className="whitespace-pre font-mono text-xs leading-relaxed text-paper-2">
                    {item.code}
                  </code>
                </pre>
                <div className="mt-4">
                  <CopyButton value={item.code} label="Copy code" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- FREE CERTS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Found by you, not handed to you"
            title="Certifications worth earning"
            lead={learn.freeCerts.intro}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {learn.freeCerts.steps.map((s, idx) => (
            <Reveal key={s.n} i={idx}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-sm text-paper-2">
                  {String(s.n).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-lg leading-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- PRACTICE */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Force a real artifact"
            title="Practice drills"
            lead="Reading the method changes nothing. Running it does. Pick one drill and start today."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {learn.practice.map((p, idx) => (
            <Reveal key={p.title} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                  <Icon name={p.icon} size={19} />
                </span>
                <h3 className="mt-5 font-display text-lg leading-tight">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- CLOSE */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="signal">
              <Sparkles size={13} /> One method, every tool
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              This method isn&rsquo;t just for tools.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              The same five steps work on finding work, deconstructing a
              deliverable, or getting unstuck. See where else it applies, or go pick a niche to run it on first.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/method">See the full method</ButtonLink>
              <ButtonLink href="/niches" variant="outline">
                Explore niches
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
