import type { Metadata } from "next";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import wins from "@/data/wins.json";
import { Reveal } from "@/components/reveal";
import {
  ButtonLink,
  Kicker,
  Pill,
  SectionHeading,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Outcomes — real people, real progress",
  description:
    "Proof that this works. Every win here started with one person deciding to begin — see where they started and where they are now.",
};

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

const accents = ["coral", "emerald", "amber", "indigo"] as const;

export default function WinsPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Member outcomes</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Proof this works — one story at a time.
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {wins.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <p className="mt-4 max-w-2xl text-xs italic text-ink-faint">
            {wins.note}
          </p>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- STAT BAND */}
      <section className="container-x pb-10 lg:pb-16">
        <Reveal i={1}>
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
            {wins.stats.map((s, idx) => (
              <div key={s.label} className="bg-paper-2 p-8 text-center">
                <dt
                  className={cn(
                    "font-display text-5xl tracking-tight",
                    accentText[accents[idx % accents.length]],
                  )}
                >
                  {s.value}
                </dt>
                <dd className="mt-2 text-sm font-medium text-ink-soft">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ GALLERY */}
      <section className="container-x py-16 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="Real stories"
            title="Every one of these started exactly where you are"
            lead="No filters, no highlight reel — just people who picked a lane and kept going."
          />
        </Reveal>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {wins.wins.map((w, idx) => {
            const accent = accents[idx % accents.length];
            const featured = idx % 3 === 0;
            return (
              <Reveal
                key={w.name}
                i={idx % 6}
                className="mb-5 break-inside-avoid"
              >
                <article
                  className={cn(
                    "rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
                    featured ? accentSoft[accent] : "border-line bg-paper-2",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg text-white",
                        accentBar[accent],
                      )}
                    >
                      {w.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{w.name}</p>
                      <p className="text-xs text-ink-faint">{w.location}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Pill tone={accent}>{w.niche}</Pill>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-ink-faint">
                    <span>{w.before}</span>
                    <ArrowRight size={12} className="shrink-0" />
                    <span className="font-semibold text-ink">{w.after}</span>
                  </div>

                  <blockquote
                    className={cn(
                      "mt-5 font-display leading-snug text-ink text-balance",
                      featured ? "text-2xl" : "text-lg",
                    )}
                  >
                    &ldquo;{w.quote}&rdquo;
                  </blockquote>

                  <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <Clock size={12} />
                    in {w.months} months
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- CLOSE */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="emerald">
              <Sparkles size={13} /> Your turn
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              Your story starts here.
            </h2>
            <p className="mt-4 max-w-xl text-ink-soft">
              Every name above started with the same first step you&rsquo;re
              looking at right now.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/start">Start your path</ButtonLink>
              <ButtonLink href="/plan" variant="outline">
                Build my 30-day plan
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
