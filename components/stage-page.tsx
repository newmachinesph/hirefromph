import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import stages from "@/data/stages.json";
import roadmap from "@/data/roadmap.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { ArrowLink, ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

const accentText: Record<string, string> = {
  coral: "text-coral",
  amber: "text-[#9a6b00]",
  emerald: "text-emerald",
  indigo: "text-indigo",
};
const accentBar: Record<string, string> = {
  coral: "bg-coral",
  amber: "bg-amber",
  emerald: "bg-emerald",
  indigo: "bg-indigo",
};
const accentSoft: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep border-coral/20",
  amber: "bg-[#fdf3d9] text-[#9a6b00] border-amber/25",
  emerald: "bg-emerald-tint text-emerald border-emerald/20",
  indigo: "bg-[#e9e9fd] text-indigo border-indigo/20",
};

type Stage = (typeof stages)[number];

export function StagePage({ id }: { id: string }) {
  const stage = stages.find((s) => s.id === id) as Stage;
  const prev = stages.find((s) => s.num === stage.num - 1);
  const next = stages.find((s) => s.num === stage.num + 1);
  const a = stage.accent;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-32 right-[-8%] h-[400px] w-[400px] rounded-full blur-3xl opacity-25",
            accentBar[a],
          )}
        />
        <div className="container-x relative grid gap-10 pt-14 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="flex flex-col justify-center">
            <Reveal>
              <div className="flex items-center gap-3">
                <Kicker>{stage.kicker}</Kicker>
                <Pill tone={a as "coral"}>{stage.steps}</Pill>
              </div>
            </Reveal>
            <Reveal i={1}>
              <p className={cn("mt-6 kicker text-base", accentText[a])}>
                {stage.role}
              </p>
              <h1 className="mt-2 font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] tracking-[-0.02em] text-balance">
                {stage.title}
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-5 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                {stage.summary}
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={stage.doFirst[0].href}>
                  {stage.doFirst[0].cta}
                </ButtonLink>
                {next && (
                  <ButtonLink href={next.href} variant="outline">
                    Next: {next.title}
                  </ButtonLink>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal i={2}>
            <figure
              className={cn(
                "relative flex h-full flex-col justify-between rounded-[var(--radius-lg)] border p-8",
                accentSoft[a],
              )}
            >
              <Quote size={40} className="opacity-40" />
              <blockquote className="font-display text-2xl leading-snug text-ink">
                {stage.quote}
              </blockquote>
              <figcaption className="mt-6 text-sm font-medium text-ink-soft">
                DevUp · {stage.subtitle}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* DO FIRST */}
      <section className="container-x py-16 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="Do these first"
            title="Be systematic, not random"
            lead={stage.outcome}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stage.doFirst.map((d, idx) => (
            <Reveal key={d.title} i={idx % 3}>
              <Link
                href={d.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm",
                      accentBar[a],
                      "text-white",
                    )}
                  >
                    {idx + 1}
                  </span>
                  <h3 className="font-display text-lg leading-tight">{d.title}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {d.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  {d.cta}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROADMAP STRIP */}
      <section className="bg-paper-3/60 py-16 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The complete roadmap"
              title="Where you are right now"
              lead={roadmap.intro}
            />
          </Reveal>
          {/* ponytail: literal col count must match roadmap length (11) — bump both if steps change */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-11">
            {roadmap.steps.map((step, idx) => {
              const isHere = step.stage === stage.num;
              const done = step.stage < stage.num;
              return (
                <Reveal key={step.n} i={idx % roadmap.steps.length}>
                  <div
                    className={cn(
                      "flex h-full flex-col rounded-xl border p-4 transition-colors",
                      isHere
                        ? cn(accentSoft[a], "shadow-[var(--shadow-sm)]")
                        : done
                          ? "border-line bg-paper-2 opacity-70"
                          : "border-dashed border-line-strong bg-transparent",
                    )}
                  >
                    <span className="font-display text-2xl leading-none">
                      {step.n}
                    </span>
                    <span className="mt-2 text-xs font-semibold leading-tight">
                      {step.title}
                    </span>
                    {isHere && (
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-wide">
                        You are here
                      </span>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOOLS FOR THIS STAGE */}
      <section className="container-x py-16 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="Everything you need, nothing you don't"
            title="Your tools for this stage"
            lead="These are the only resources you need right now. Focus here before moving on."
          />
        </Reveal>
        <div className="mt-10 flex flex-wrap gap-3">
          {stage.tools.map((t, idx) => (
            <Reveal key={t.label} i={idx % 4} as="span">
              <Link
                href={t.href}
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-2 px-5 py-3 text-sm font-semibold text-ink transition-all hover:border-ink hover:-translate-y-0.5"
              >
                <Icon name="arrow-up-right" size={15} className={accentText[a]} />
                {t.label}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CLOSING + NAV */}
      <section className="container-x pb-24">
        <Reveal>
          <div
            className={cn(
              "overflow-hidden rounded-[var(--radius-lg)] border p-10 text-center lg:p-16",
              accentSoft[a],
            )}
          >
            <h2 className="mx-auto max-w-2xl font-display text-[length:var(--text-h2)] leading-tight text-balance text-ink">
              {stage.closing}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {prev && (
                <Link
                  href={prev.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  ← {prev.title}
                </Link>
              )}
              {next ? (
                <ButtonLink href={next.href}>Continue to {next.title}</ButtonLink>
              ) : (
                <ButtonLink href="/simulator">Model your next 3 years</ButtonLink>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <ArrowLink href="/plan">Or build a full 30-day plan around this</ArrowLink>
        </div>
      </section>
    </>
  );
}
