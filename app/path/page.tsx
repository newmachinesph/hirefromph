"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import stages from "@/data/stages.json";
import roadmap from "@/data/roadmap.json";
import tracks from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { PathChooser } from "@/components/path-chooser";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

type Track = (typeof tracks.tracks)[number];

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
  coral: "bg-coral-tint text-coral-deep border-coral/25",
  amber: "bg-[#fdf3d9] text-[#9a6b00] border-amber/30",
  emerald: "bg-emerald-tint text-emerald border-emerald/25",
  indigo: "bg-[#e9e9fd] text-indigo border-indigo/25",
};
const iconTone: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep",
  emerald: "bg-emerald-tint text-emerald",
  amber: "bg-[#fdf3d9] text-[#9a6b00]",
  indigo: "bg-[#e9e9fd] text-indigo",
};

const learnIcon: Record<string, string> = {
  YouTube: "youtube",
  Course: "book-open",
  Template: "layout-template",
};

export default function PathPage() {
  const { state, hydrated, hasPath, clearPath, setStage, toggleStep } =
    usePath();

  const track: Track | undefined = state.track
    ? tracks.tracks.find((t) => t.id === state.track)
    : undefined;

  if (!hydrated) return <PathSkeleton />;
  if (!hasPath || !track) return <NoPathState />;

  const currentStage = stages.find((s) => s.num === state.stage);
  const stageAccent = currentStage?.accent ?? track.accent;
  const doneCount = roadmap.steps.filter((s) => state.steps[s.n]).length;
  const portfolioCount = Object.values(state.tasks).filter(Boolean).length;
  const applied = state.applications.length;
  const interviews = state.applications.filter(
    (a) => a.status === "interview" || a.status === "offer",
  ).length;

  const nextMoves = [
    {
      title: "Build proof with micro-tasks",
      desc: `Real ${track.name} jobs you can do today with no client. Each one is a portfolio piece.`,
      href: "/tasks",
      icon: "target",
    },
    {
      title: "Track your applications",
      desc: "A live pipeline with a follow-up radar, silence loses more offers than rejection.",
      href: "/tracker",
      icon: "table",
    },
    {
      title: `Build your ${track.name} 30-day plan`,
      desc: "A day-by-day path built around this niche.",
      href: "/plan",
      icon: "calendar-check",
    },
    {
      title: "Write your own prompts",
      desc: "Learn the anatomy of a prompt instead of pasting someone else's.",
      href: "/prompts",
      icon: "sparkles",
    },
    {
      title: "Find work yourself",
      desc: "Search operators, red flags, and your own opportunity pipeline.",
      href: "/apply",
      icon: "search",
    },
    {
      title: "Build your documents",
      desc: "Learn the anatomy, then write your own resume, SOPs, and trackers.",
      href: "/build",
      icon: "pencil-ruler",
    },
    {
      title: "Learn a premium language",
      desc: "Stack a language on top of this niche for more pay.",
      href: "/languages",
      icon: "languages",
    },
  ];

  function handleChangePath() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Change your path? This clears your saved progress on this track.",
      )
    ) {
      return;
    }
    clearPath();
  }

  return (
    <>
      {/* ---------------------------------------------------------------- HEADER */}
      <section className="container-x pt-14 pb-8 lg:pt-20">
        <Reveal>
          <Kicker>Your path</Kicker>
        </Reveal>
        <Reveal i={1}>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                  iconTone[track.accent],
                )}
              >
                <Icon name={track.icon} size={26} />
              </span>
              <div>
                <h1 className="font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
                  {track.name}
                </h1>
                <p className="mt-1 text-ink-soft">{track.tagline}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangePath}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-2 px-5 py-2.5 text-sm font-semibold text-ink-soft transition-all hover:border-ink hover:text-ink"
            >
              <RotateCcw size={15} />
              Change path
            </button>
          </div>
        </Reveal>
        <Reveal i={2}>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Pill tone={track.accent as "coral"}>{track.pay}</Pill>
            <Pill tone="neutral">{track.demandLabel} demand</Pill>
            <Pill tone="neutral">{track.difficulty}</Pill>
          </div>
        </Reveal>

        <Reveal i={3}>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {[
              { value: portfolioCount, label: "portfolio pieces", sub: "micro-tasks completed", href: "/tasks" },
              { value: applied, label: "applications sent", sub: "live pipeline", href: "/tracker" },
              { value: interviews, label: "interviews & offers", sub: "converting", href: "/tracker" },
              { value: `${doneCount}/9`, label: "roadmap steps", sub: "zero to indispensable", href: "#roadmap" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="group bg-paper-2 p-5 transition-colors hover:bg-paper-3/60"
              >
                <dt className="font-display text-3xl tracking-tight text-ink">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{s.label}</dd>
                <dd className="text-xs text-ink-faint">{s.sub}</dd>
              </Link>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- STAGE */}
      <section className="container-x py-10 lg:py-14">
        <Reveal>
          <SectionHeading
            kicker="Where you are"
            title="Your current stage"
            lead="Set your stage, or let it follow your roadmap progress below."
          />
        </Reveal>
        <Reveal i={1}>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {stages.map((st) => {
              const active = state.stage === st.num;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStage(st.num)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-semibold transition-all",
                    active
                      ? accentSoft[st.accent]
                      : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
                  )}
                >
                  {st.num}. {st.title}
                </button>
              );
            })}
          </div>
        </Reveal>

        {currentStage && (
          <Reveal i={2}>
            <div
              className={cn(
                "mt-6 rounded-2xl border p-6 lg:p-8",
                accentSoft[currentStage.accent],
              )}
            >
              <p className="kicker">{currentStage.kicker}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-ink">
                {currentStage.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {currentStage.summary}
              </p>
              <div className="mt-5">
                <ButtonLink href={currentStage.href}>
                  Open {currentStage.title}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ----------------------------------------------------------- ROADMAP */}
      <section
        id="roadmap"
        className="scroll-mt-24 bg-paper-3/60 py-14 lg:py-20"
      >
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Eleven steps, five stages"
              title="Your roadmap progress"
              lead={roadmap.intro}
            />
          </Reveal>

          <Reveal i={1}>
            <div className="mt-7">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-paper-3">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    accentBar[track.accent],
                  )}
                  style={{ width: `${(doneCount / roadmap.steps.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-soft">
                {doneCount}/{roadmap.steps.length} steps complete
              </p>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {roadmap.steps.map((step, idx) => {
              const inCurrentStage = step.stage === state.stage;
              const checked = !!state.steps[step.n];
              return (
                <Reveal key={step.n} i={idx % 9}>
                  <label
                    htmlFor={`step-${step.n}`}
                    className={cn(
                      "flex h-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      inCurrentStage
                        ? accentSoft[stageAccent]
                        : "border-line bg-paper-2",
                      checked && "opacity-70",
                    )}
                  >
                    <input
                      id={`step-${step.n}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStep(step.n)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-coral"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {step.n}. {step.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                        {step.desc}
                      </span>
                    </span>
                  </label>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- NEXT MOVES */}
      <section className="container-x py-14 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Your next moves"
            title="What to do right now"
            lead={`Curated for ${track.name}, start here.`}
          />
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-3">
          {track.learn.map((l, idx) => (
            <Reveal key={l.title} i={idx % 3} as="span">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper-2 px-4 py-2.5 text-sm">
                <Icon
                  name={learnIcon[l.type] ?? "sparkles"}
                  size={15}
                  className={accentText[track.accent]}
                />
                <span className="font-semibold text-ink">{l.title}</span>
                <span className="text-ink-faint">· {l.provider}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nextMoves.map((m, idx) => (
            <Reveal key={m.href} i={idx % 3}>
              <Link
                href={m.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
              >
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-xl",
                    iconTone[track.accent],
                  )}
                >
                  <Icon name={m.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-lg leading-tight">
                  {m.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {m.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Open
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

      {/* ------------------------------------------------------------ TOOLKIT */}
      <section className="container-x pb-24">
        <Reveal>
          <SectionHeading
            kicker="Your niche toolkit"
            title={`Master ${track.name}`}
          />
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div>
            <p className="kicker mb-3">Core skills</p>
            <div className="flex flex-wrap gap-2">
              {track.skills.map((s) => (
                <Pill key={s} tone="neutral">
                  {s}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="kicker mb-3">Tools you&rsquo;ll use</p>
            <div className="flex flex-wrap gap-2">
              {track.tools.map((t) => (
                <Pill key={t} tone={track.accent as "coral"}>
                  {t}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="kicker mb-3">Free certifications</p>
            <div className="flex flex-wrap gap-2">
              {track.certs.map((c) => (
                <Pill key={c} tone="emerald">
                  <Sparkles size={11} />
                  {c}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <Reveal i={1}>
          <div className="mt-8 rounded-2xl border border-line bg-paper-2 p-6">
            <p className="kicker mb-2">Who you&rsquo;ll work with</p>
            <p className="text-ink-soft">{track.clients}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function NoPathState() {
  return (
    <section className="container-x py-20 lg:py-28">
      <Reveal>
        <Kicker>Your path</Kicker>
      </Reveal>
      <Reveal i={1}>
        <h1 className="mt-5 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
          You haven&rsquo;t chosen a path yet.
        </h1>
      </Reveal>
      <Reveal i={2}>
        <p className="mt-5 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
          Pick a niche and this page becomes your personal hub, progress,
          next moves, and your toolkit, tailored to you.
        </p>
      </Reveal>
      <Reveal i={3} className="mt-10">
        <PathChooser redirectTo="/path" />
      </Reveal>
    </section>
  );
}

function PathSkeleton() {
  return (
    <div className="container-x py-20 lg:py-28" aria-hidden>
      <div className="h-4 w-32 animate-pulse rounded-full bg-paper-3" />
      <div className="mt-6 h-12 w-2/3 max-w-lg animate-pulse rounded-xl bg-paper-3" />
      <div className="mt-4 h-4 w-1/2 max-w-sm animate-pulse rounded bg-paper-3" />
      <div className="mt-10 h-40 w-full animate-pulse rounded-2xl bg-paper-3" />
      <div className="mt-4 h-40 w-full animate-pulse rounded-2xl bg-paper-3" />
    </div>
  );
}
