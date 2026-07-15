import { ArrowRight, ExternalLink, ShieldOff } from "lucide-react";
import english from "@/data/english.json";
import { CommsLab } from "@/components/comms-lab";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/english",
  title: "English at Work",
  description:
    "Filipinos already write English better than most of the world. What costs you money is smaller: hedges, reflex apologies, and deference markers. Audit a real client message, learn four structures, and hear the honest priority order for speaking.",
});

const MAX_SCORE = 800;
const GLOBAL_AVG = 488;

const accentText: Record<string, string> = {
  coral: "text-coral-deep",
  amber: "text-amber-text",
  emerald: "text-emerald",
  indigo: "text-indigo",
};
const accentBar: Record<string, string> = {
  coral: "bg-coral",
  amber: "bg-amber",
  emerald: "bg-emerald",
  indigo: "bg-indigo",
};
const accentBorder: Record<string, string> = {
  coral: "border-coral",
  amber: "border-amber",
  emerald: "border-emerald",
  indigo: "border-indigo",
};

type Tone = "neutral" | "coral" | "emerald" | "amber" | "indigo";

function Source({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-coral"
    >
      Source: {label}
      <ExternalLink size={11} className="opacity-60" />
    </a>
  );
}

export default function EnglishPage() {
  const weakest = Math.min(...english.baseline.scores.map((s) => s.value));

  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>English · Pragmatics · Speaking</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-4xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Your English is not the problem.
            <br />
            The habits around it are.
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {english.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {english.creed}
          </blockquote>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- BASELINE */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
            <Reveal>
              <SectionHeading
                kicker={english.baseline.kicker}
                title={english.baseline.title}
              />
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-soft">
                {english.baseline.body}
              </p>
              <div className="mt-6">
                <Source
                  label={english.baseline.source.label}
                  url={english.baseline.source.url}
                />
              </div>
            </Reveal>

            <Reveal i={1}>
              <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <div className="flex items-baseline justify-between">
                  <p className="kicker">EF EPI 2025 · Philippines</p>
                  <p className="font-mono text-xs text-ink-faint">
                    out of {MAX_SCORE}
                  </p>
                </div>

                <ul className="mt-7 flex flex-col gap-6">
                  {english.baseline.scores.map((s) => {
                    const isWeakest = s.value === weakest;
                    return (
                      <li key={s.skill}>
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="flex items-baseline gap-2 text-sm font-semibold text-ink">
                            {s.skill}
                            {isWeakest && (
                              <span className="text-[11px] font-medium text-coral-deep">
                                weakest
                              </span>
                            )}
                          </p>
                          <p className="font-display text-lg leading-none text-ink">
                            {s.value}
                          </p>
                        </div>

                        <div className="relative mt-2.5 h-2.5 w-full rounded-full bg-line">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              isWeakest ? "bg-coral" : "bg-ink",
                            )}
                            style={{ width: `${(s.value / MAX_SCORE) * 100}%` }}
                          />
                          <span
                            aria-hidden
                            className="absolute top-[-4px] bottom-[-4px] w-px bg-ink-faint"
                            style={{ left: `${(GLOBAL_AVG / MAX_SCORE) * 100}%` }}
                          />
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                          {s.note}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-7 flex items-center gap-2 border-t border-line pt-5 text-xs text-ink-faint">
                  <span aria-hidden className="h-3 w-px bg-ink-faint" />
                  The vertical line is the global average, {GLOBAL_AVG}. Every one
                  of your four scores clears it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- THREE CAUSES */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={english.threeCauses.kicker}
            title={english.threeCauses.title}
            lead={english.threeCauses.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {english.threeCauses.causes.map((c, idx) => (
            <Reveal key={c.id} i={idx}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-[var(--radius-lg)] p-6 transition-all duration-300 lg:p-8",
                  c.yours
                    ? "border border-line bg-paper-2 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                    : "border-2 border-dashed border-indigo/40 bg-indigo-tint/50",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      accentText[c.accent],
                    )}
                  >
                    {c.n}
                  </span>
                  {c.yours ? (
                    <Pill tone={c.accent as Tone}>Yours to fix</Pill>
                  ) : (
                    <Pill tone="indigo">
                      <ShieldOff size={12} aria-hidden />
                      Not yours to fix
                    </Pill>
                  )}
                </div>

                <h3 className="mt-5 font-display text-[length:var(--text-h3)] leading-snug text-balance">
                  {c.title}
                </h3>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {c.what}
                </p>

                <p
                  className={cn(
                    "mt-5 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink",
                    accentBorder[c.accent],
                  )}
                >
                  {c.fix}
                </p>

                <div className="mt-5 border-t border-line pt-4">
                  <Source label={c.source.label} url={c.source.url} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- HONESTY */}
      <section className="bg-ink py-20 text-paper-2 lg:py-24">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">No spin</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {english.honesty.title}
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-5 lg:grid-cols-3">
            {english.honesty.points.map((p, idx) => (
              <Reveal key={p} i={idx} as="li">
                <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-6 lg:p-8">
                  <span className="font-mono text-xs font-semibold text-coral">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-paper-2/80">{p}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- BANLIST */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={english.banlist.kicker}
            title={english.banlist.title}
            lead={english.banlist.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {english.banlist.categories.map((c, idx) => (
            <Reveal key={c.id} i={idx % 3}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span
                  aria-hidden
                  className={cn("h-1 w-10 rounded-full", accentBar[c.accent])}
                />
                <h3 className="mt-5 font-display text-xl leading-tight">
                  {c.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.why}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- LAB */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={english.lab.kicker}
              title={english.lab.title}
              lead={english.lab.lead}
            />
          </Reveal>
          <Reveal i={1} className="mt-12">
            <CommsLab />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- FRAMEWORKS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={english.frameworks.kicker}
            title={english.frameworks.title}
            lead={english.frameworks.lead}
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-5">
          {english.frameworks.items.map((f, idx) => (
            <Reveal key={f.id} i={idx % 3}>
              <article className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                  {/* ---- what it is */}
                  <div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white",
                          accentBar[f.accent],
                        )}
                      >
                        <Icon name={f.icon} size={20} aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl leading-tight">
                          {f.name}
                        </h3>
                        <p className="text-xs text-ink-faint">{f.expand}</p>
                      </div>
                    </div>

                    <p className="mt-6 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                      Use it for
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {f.use}
                    </p>

                    <p
                      className={cn(
                        "mt-5 border-l-2 pl-4 text-sm leading-relaxed text-ink",
                        accentBorder[f.accent],
                      )}
                    >
                      {f.rule}
                    </p>

                    <ol className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
                      {f.anatomy.map((a, i) => (
                        <li key={a} className="flex gap-3 text-sm text-ink-soft">
                          <span
                            aria-hidden
                            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-paper-3 font-mono text-[10px] font-semibold text-ink"
                          >
                            {i + 1}
                          </span>
                          <span className="leading-snug">{a}</span>
                        </li>
                      ))}
                    </ol>

                    {f.source && (
                      <div className="mt-6">
                        <Source label={f.source.label} url={f.source.url} />
                      </div>
                    )}
                  </div>

                  {/* ---- before / after */}
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-coral/25 bg-coral-tint/60 p-5">
                      <p className="kicker text-coral-deep">Before, weak</p>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft italic">
                        {f.before}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-1 text-ink-faint">
                      <ArrowRight size={14} aria-hidden />
                      <span className="text-xs font-medium">
                        Same facts. Same person. Different shape.
                      </span>
                    </div>

                    <div className="flex-1 rounded-2xl border-2 border-emerald/40 bg-emerald-tint p-5 shadow-[var(--shadow-sm)]">
                      <p className="kicker text-emerald">After, strong</p>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line font-medium text-ink">
                        {f.after}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- ESTIMATING */}
      <section className="container-x pb-20 lg:pb-24">
        <Reveal>
          <div className="grid gap-8 rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:p-10">
            <div>
              <Kicker>{english.estimating.kicker}</Kicker>
              <h2 className="mt-5 font-display text-[length:var(--text-h3)] leading-snug text-balance">
                {english.estimating.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                {english.estimating.body}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-coral/25 bg-coral-tint/60 p-5">
                <p className="kicker text-coral-deep">Never</p>
                <p className="mt-2 font-display text-lg leading-snug text-ink-soft">
                  {english.estimating.bad}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-emerald/40 bg-emerald-tint p-5">
                <p className="kicker text-emerald">Always</p>
                <p className="mt-2 font-display text-lg leading-snug text-ink">
                  {english.estimating.good}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- SPEAKING */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={english.speaking.kicker}
              title={english.speaking.title}
              lead={english.speaking.lead}
            />
          </Reveal>

          <ol className="mt-12 flex flex-col gap-5">
            {english.speaking.priorities.map((p, idx) => (
              <Reveal key={p.n} i={idx % 3} as="li">
                <article className="grid gap-6 rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          accentBar[p.accent],
                        )}
                      />
                      <span className="font-mono text-xs font-semibold text-ink-faint">
                        {p.n}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          accentText[p.accent],
                        )}
                      >
                        Impact: {p.impact}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-[length:var(--text-h3)] leading-snug text-balance">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-ink-soft">{p.what}</p>
                    <p className="rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink">
                      <strong className="font-semibold">The drill:</strong> {p.drill}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>

          <Reveal i={1}>
            <div className="mt-8">
              <Source
                label={english.speaking.source.label}
                url={english.speaking.source.url}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- RESOURCES */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker={english.resources.kicker}
            title={english.resources.title}
            lead={english.resources.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {english.resources.items.map((r, idx) => (
            <Reveal key={r.name} i={idx % 3}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
                  r.tone === "coral"
                    ? "border-coral/40 bg-coral-tint/60"
                    : "border-line bg-paper-2",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl leading-tight">{r.name}</h3>
                  <Pill tone={r.tone as Tone}>
                    {r.tone === "emerald"
                      ? "Open"
                      : r.tone === "amber"
                        ? "Caveat"
                        : "Paid"}
                  </Pill>
                </div>

                <p
                  className={cn(
                    "mt-4 text-sm font-semibold leading-snug",
                    accentText[r.tone],
                  )}
                >
                  {r.cost}
                </p>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {r.what}
                </p>

                <p className="mt-4 border-l-2 border-line-strong pl-4 text-sm leading-relaxed text-ink">
                  {r.use}
                </p>

                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-ink transition-colors hover:text-coral"
                >
                  <span className="link-sweep">Open {r.name}</span>
                  <ExternalLink
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
