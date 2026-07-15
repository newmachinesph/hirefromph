import type { Metadata } from "next";
import { ArrowUpRight, Sparkles, Target } from "lucide-react";
import tracks from "@/data/tracks.json";
import portfolio from "@/data/portfolio.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/portfolio",
  title: "Portfolio Ladder",
  description: portfolio.intro,
});

const accentSoft: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep border-coral/20",
  emerald: "bg-emerald-tint text-emerald border-emerald/20",
  amber: "bg-[#fdf3d9] text-[#9a6b00] border-amber/25",
  indigo: "bg-[#e9e9fd] text-indigo border-indigo/20",
};
// Literal classes so Tailwind's JIT can see them — a `hover:${var}` concat is
// invisible to the scanner and the class never gets generated.
const accentHover: Record<string, string> = {
  coral: "hover:text-coral",
  emerald: "hover:text-emerald",
  amber: "hover:text-[#9a6b00]",
  indigo: "hover:text-indigo",
};

// Tier → pill tone. One rung per column: Start (get in), Level up, Pro (differentiate).
const tierTone: Record<string, "emerald" | "amber" | "coral"> = {
  Start: "emerald",
  "Level up": "amber",
  Pro: "coral",
};

// Join by id so track name/icon/accent stay single-sourced in tracks.json.
const trackById = Object.fromEntries(tracks.tracks.map((t) => [t.id, t]));

export default function PortfolioPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>{portfolio.kicker}</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            {portfolio.headline}
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {portfolio.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <div className="mt-8 max-w-2xl rounded-2xl border border-line-strong bg-ink px-6 py-5 text-paper-2">
            <p className="font-display text-lg leading-snug text-balance">
              {portfolio.creed}
            </p>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- HOW IT WORKS */}
      <section className="container-x pb-16 lg:pb-24">
        <Reveal>
          <SectionHeading
            kicker="Three rungs, same craft"
            title="How the ladder works"
            lead={portfolio.tiersNote}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {portfolio.howItWorks.map((step, idx) => (
            <Reveal key={step.tier} i={idx}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <Pill tone={tierTone[step.tier] ?? "neutral"}>{step.tier}</Pill>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {step.meaning}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- TRACK LADDERS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Pick your lane, climb the rungs"
            title="The tool ladder for every niche"
            lead="Each niche has its own climb, from the free tool you start on today to the paid one that sets your rate apart. Every rung leaves you a portfolio piece."
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-16">
          {portfolio.tracks.map((entry) => {
            const meta = trackById[entry.id];
            if (!meta) return null;
            const a = meta.accent;
            return (
              <Reveal key={entry.id}>
                <div>
                  {/* Track header */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${accentSoft[a]}`}
                    >
                      <Icon name={meta.icon} size={22} />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl leading-tight">
                        {meta.name}
                      </h3>
                      <p className="text-sm text-ink-soft">{meta.tagline}</p>
                    </div>
                  </div>

                  {/* Three tiers */}
                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {entry.ladder.map((rung) => (
                      <div
                        key={rung.tier}
                        className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Pill tone={tierTone[rung.tier] ?? "neutral"}>
                            {rung.tier}
                          </Pill>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                          {rung.goal}
                        </p>

                        <ul className="mt-5 flex flex-1 flex-col gap-3 border-t border-line pt-4">
                          {rung.tools.map((tool) => (
                            <li key={tool.name}>
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`group inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors ${accentHover[a]}`}
                                >
                                  {tool.name}
                                  <ArrowUpRight
                                    size={13}
                                    className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                  />
                                </a>
                                <span className="shrink-0 rounded-full bg-paper-3 px-2 py-0.5 text-[10px] font-medium text-ink-faint">
                                  {tool.free}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                                {tool.what}
                              </p>
                            </li>
                          ))}
                        </ul>

                        <div
                          className={`mt-5 flex items-start gap-2 rounded-xl border p-3 ${accentSoft[a]}`}
                        >
                          <Target size={14} className="mt-0.5 shrink-0" />
                          <p className="text-xs leading-relaxed">
                            <span className="font-semibold">Portfolio piece: </span>
                            {rung.piece}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------- CLOSE */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="coral">
              <Sparkles size={13} /> Proof, not promises
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              A tool is only proof once you&rsquo;ve built something with it.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              The ladder tells you what to learn next. The micro-tasks turn each
              rung into a real deliverable you can show. Pick a lane, then go
              build the first piece.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/tasks">Build a portfolio piece</ButtonLink>
              <ButtonLink href="/niches" variant="outline">
                Pick your niche
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
