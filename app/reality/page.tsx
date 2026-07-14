import { ExternalLink } from "lucide-react";
import reality from "@/data/reality.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Reality Check",
  description:
    "What the evidence actually says about remote and online work for Filipinos in 2026–2027. The unpaid third of your hours, the non-payment rate, what AI really cut, where demand is genuinely growing, every number with its source, and an honest list of what nobody knows.",
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
const accentBorder: Record<string, string> = {
  coral: "border-coral",
  amber: "border-amber",
  emerald: "border-emerald",
  indigo: "border-indigo",
};

/* ---------------------------------------------------------------- Source */

function Source({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-start gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-coral"
    >
      <span className="text-balance">Source: {label}</span>
      <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-60" />
    </a>
  );
}

/* ------------------------------------------------------------ Bar charts */

function fmt(value: number): string {
  const sign = value > 0 ? "+" : "−";
  return `${sign}${Math.abs(value)}%`;
}

/** Diverging bar, zero in the middle. Negative left (coral), positive right (emerald). */
function ChangeBar({
  label,
  value,
  max,
  note,
}: {
  label: string;
  value: number;
  max: number;
  note: string;
}) {
  const width = (Math.abs(value) / max) * 50;
  const up = value > 0;
  return (
    <li className="grid gap-2 py-1 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center sm:gap-6">
      <div>
        <p className="text-sm font-medium leading-snug text-ink">{label}</p>
        {note && <p className="mt-0.5 text-xs leading-snug text-emerald">{note}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-line bg-paper">
          <span
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong"
          />
          <span
            aria-hidden
            className={`absolute inset-y-1 rounded-sm ${up ? "bg-emerald" : "bg-coral"}`}
            style={
              up
                ? { left: "50%", width: `${width}%` }
                : { right: "50%", width: `${width}%` }
            }
          />
        </div>
        <span
          className={`w-14 shrink-0 text-right font-mono text-xs font-semibold ${up ? "text-emerald" : "text-coral"}`}
        >
          {fmt(value)}
        </span>
      </div>
    </li>
  );
}

/** Simple left-to-right growth bar. */
function GrowthBar({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  accent: string;
}) {
  const width = Math.max((value / max) * 100, 5);
  return (
    <li className="grid gap-1.5 py-1.5 sm:grid-cols-[minmax(0,17rem)_1fr] sm:items-center sm:gap-6">
      <p className="text-sm font-medium leading-snug text-ink">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-7 flex-1 overflow-hidden rounded-lg border border-line bg-paper">
          <span
            aria-hidden
            className={`block h-full rounded-r-sm ${accentBar[accent]}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold text-ink">
          +{value}%
        </span>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ Page */

export default function RealityPage() {
  const { ai, growth, thesis, pay, unknown, reading, closing } = reality;

  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Reality check · 2026 → 2027 · every number sourced</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-4xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            {reality.heroTitle.line1}
            <br />
            {reality.heroTitle.line2}
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {reality.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {reality.creed}
          </blockquote>
        </Reveal>
        <Reveal i={4}>
          <p className="mt-8 max-w-2xl rounded-2xl border border-line bg-paper-2 p-5 text-sm leading-relaxed text-ink-soft">
            {reality.whyItMatters}
          </p>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- READ A NUMBER */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={reality.readANumber.kicker}
              title={reality.readANumber.title}
              lead={reality.readANumber.lead}
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {reality.readANumber.tests.map((t, idx) => (
              <Reveal key={t.id} i={idx % 2}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl leading-snug text-balance">
                    {t.q}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {t.why}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-2xl font-display text-xl leading-snug text-coral">
              {reality.readANumber.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ MYTHS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="Expectation vs reality"
            title="Seven things you were told. Seven things the data says."
            lead={reality.mythsIntro}
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-5">
          {reality.myths.map((m, idx) => (
            <Reveal key={m.id} i={idx % 3}>
              <article className="grid gap-6 rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 rounded-full ${accentBar[m.accent]}`}
                    />
                    <p className={`kicker ${accentText[m.accent]}`}>{m.tag}</p>
                  </div>
                  <p className="mt-4 font-display text-lg leading-snug text-ink-faint line-through decoration-coral/50 decoration-2">
                    {m.myth}
                  </p>
                  <h3 className="mt-4 font-display text-[length:var(--text-h3)] leading-snug text-balance">
                    {m.headline}
                  </h3>
                  <div className="mt-5 flex flex-col gap-2">
                    <Source label={m.source.label} url={m.source.url} />
                    {m.source2 && (
                      <Source label={m.source2.label} url={m.source2.url} />
                    )}
                    {m.sourceNote && (
                      <p className="max-w-sm text-xs leading-relaxed text-ink-faint">
                        {m.sourceNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-ink-soft">{m.body}</p>
                  <p className="rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink">
                    <strong className="font-semibold">The sting:</strong> {m.sting}
                  </p>
                  <p
                    className={`border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[m.accent]}`}
                  >
                    {m.lesson}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- AI */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={ai.kicker} title={ai.title} lead={ai.lead} />
          </Reveal>
          <Reveal i={1}>
            <p className="mt-6 max-w-2xl border-l-2 border-indigo pl-5 text-sm font-medium leading-relaxed text-ink">
              {ai.framing}
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-5">
            {ai.charts.map((chart, idx) => {
              const max = Math.max(
                ...chart.items.map((it) => Math.abs(it.value)),
                chart.baseline ? Math.abs(chart.baseline.value) : 0,
              );
              return (
                <Reveal key={chart.id} i={idx % 3}>
                  <figure className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                    <figcaption>
                      <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-balance">
                        {chart.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
                        {chart.note}
                      </p>
                    </figcaption>

                    {chart.baseline && (
                      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo/25 bg-[#e9e9fd] px-3 py-1 text-xs font-medium text-indigo">
                        <span
                          aria-hidden
                          className="h-3 w-0 border-l-2 border-dashed border-indigo"
                        />
                        {chart.baseline.label}
                      </p>
                    )}

                    <ul className="mt-6 flex flex-col divide-y divide-line">
                      {chart.items.map((it) => (
                        <ChangeBar
                          key={it.label}
                          label={it.label}
                          value={it.value}
                          max={max}
                          note={it.note}
                        />
                      ))}
                    </ul>

                    <div className="mt-6 border-t border-line pt-4">
                      <Source label={chart.source.label} url={chart.source.url} />
                    </div>
                  </figure>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-balance">
                  {ai.peerReviewed.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {ai.peerReviewed.body}
                </p>
                <div className="mt-6">
                  <Source
                    label={ai.peerReviewed.source.label}
                    url={ai.peerReviewed.source.url}
                  />
                </div>
              </article>
            </Reveal>
            <Reveal i={1}>
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-balance">
                  {ai.wef.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {ai.wef.body}
                </p>
                <div className="mt-6">
                  <Source label={ai.wef.source.label} url={ai.wef.source.url} />
                </div>
              </article>
            </Reveal>
          </div>

          {/* counter-evidence */}
          <Reveal i={1}>
            <div className="mt-5 rounded-[var(--radius-lg)] border border-emerald/30 bg-emerald-tint p-8 lg:p-10">
              <Kicker className="text-emerald">{ai.counter.kicker}</Kicker>
              <h3 className="mt-5 max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
                {ai.counter.title}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
                {ai.counter.body}
              </p>
              <p className="mt-5 max-w-3xl border-l-2 border-emerald pl-5 text-sm font-medium leading-relaxed text-ink">
                {ai.counter.conclusion}
              </p>
              <div className="mt-6">
                <Source
                  label={ai.counter.source.label}
                  url={ai.counter.source.url}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- GROWTH */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={growth.kicker}
            title={growth.title}
            lead={growth.lead}
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-5">
          {growth.groups.map((g, idx) => {
            const max = Math.max(...g.items.map((it) => it.value));
            return (
              <Reveal key={g.id} i={idx % 3}>
                <figure className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                  <figcaption className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${accentBar[g.accent]}`}
                      />
                      <h3 className="font-display text-[length:var(--text-h3)] leading-snug">
                        {g.title}
                      </h3>
                    </div>
                    <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">
                      {g.note}
                    </p>
                  </figcaption>

                  <ul className="mt-6 flex flex-col divide-y divide-line">
                    {g.items.map((it) => (
                      <GrowthBar
                        key={it.label}
                        label={it.label}
                        value={it.value}
                        max={max}
                        accent={g.accent}
                      />
                    ))}
                  </ul>

                  {g.extra && (
                    <p
                      className={`mt-6 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[g.accent]}`}
                    >
                      {g.extra}
                    </p>
                  )}

                  <div className="mt-6 border-t border-line pt-4">
                    <Source label={g.source.label} url={g.source.url} />
                  </div>
                </figure>
              </Reveal>
            );
          })}

          <Reveal i={1}>
            <article className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-8 lg:p-10">
              <h3 className="max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance">
                {growth.linkedin.title}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
                {growth.linkedin.body}
              </p>
              <div className="mt-6">
                <Source
                  label={growth.linkedin.source.label}
                  url={growth.linkedin.source.url}
                />
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- THESIS */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{thesis.kicker}</Kicker>
            <h2 className="mt-5 max-w-4xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {thesis.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{thesis.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <div className="flex h-full flex-col justify-center rounded-[var(--radius-lg)] border border-emerald/40 bg-emerald/10 p-8">
                <p className="font-display text-[length:var(--text-display)] leading-none text-emerald">
                  {thesis.premium.stat}
                </p>
                <p className="mt-3 font-display text-2xl leading-tight text-paper-2">
                  {thesis.premium.label}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-paper-2/70">
                  {thesis.premium.body}
                </p>
                <div className="mt-6">
                  <a
                    href={thesis.premium.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 text-xs font-medium text-paper-2/50 transition-colors hover:text-coral"
                  >
                    <span className="text-balance">
                      Source: {thesis.premium.source.label}
                    </span>
                    <ExternalLink size={11} className="mt-0.5 shrink-0" />
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal i={1}>
              <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
                <h3 className="font-display text-2xl leading-tight text-balance">
                  {thesis.nuance.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-paper-2/70">
                  {thesis.nuance.body}
                </p>
                <blockquote className="mt-6 border-l-2 border-coral pl-5">
                  <p className="font-display text-xl leading-snug text-paper-2">
                    &ldquo;{thesis.nuance.quote}&rdquo;
                  </p>
                  <footer className="mt-3 kicker text-paper-2/50">
                    {thesis.nuance.attribution}
                  </footer>
                </blockquote>
                <div className="mt-6">
                  <a
                    href={thesis.nuance.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 text-xs font-medium text-paper-2/50 transition-colors hover:text-coral"
                  >
                    <span className="text-balance">
                      Source: {thesis.nuance.source.label}
                    </span>
                    <ExternalLink size={11} className="mt-0.5 shrink-0" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal i={1}>
            <p className="mt-10 max-w-4xl border-l-2 border-emerald pl-6 font-display text-[length:var(--text-h3)] leading-snug text-paper-2">
              {thesis.conclusion}
            </p>
          </Reveal>

          {/* proof, freelancers vs employees */}
          <Reveal i={2}>
            <div className="mt-12 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
              <h3 className="max-w-2xl font-display text-2xl leading-tight text-balance">
                {thesis.proof.title}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-paper-2/70">
                {thesis.proof.body}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-paper-2/80">
                  <span aria-hidden className="h-3 w-3 rounded-sm bg-emerald" />
                  {thesis.proof.legend.freelancer}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-paper-2/80">
                  <span aria-hidden className="h-3 w-3 rounded-sm bg-white/25" />
                  {thesis.proof.legend.employee}
                </span>
              </div>

              <ul className="mt-6 flex flex-col divide-y divide-white/10">
                {thesis.proof.rows.map((r) => (
                  <li
                    key={r.label}
                    className="grid gap-2 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-6"
                  >
                    <p className="text-sm font-medium leading-snug text-paper-2">
                      {r.label}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <div className="h-4 flex-1 overflow-hidden rounded-md bg-white/5">
                          <span
                            aria-hidden
                            className="block h-full rounded-r-sm bg-emerald"
                            style={{ width: `${r.freelancer}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right font-mono text-xs font-semibold text-emerald">
                          {r.freelancer}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 flex-1 overflow-hidden rounded-md bg-white/5">
                          <span
                            aria-hidden
                            className="block h-full rounded-r-sm bg-white/25"
                            style={{ width: `${r.employee}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right font-mono text-xs font-semibold text-paper-2/60">
                          {r.employee}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <a
                  href={thesis.proof.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 text-xs font-medium text-paper-2/50 transition-colors hover:text-coral"
                >
                  <span className="text-balance">
                    Source: {thesis.proof.source.label}
                  </span>
                  <ExternalLink size={11} className="mt-0.5 shrink-0" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- PAY */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={pay.kicker} title={pay.title} />
        </Reveal>

        <Reveal i={1}>
          <div className="mt-10 rounded-[var(--radius-lg)] border border-amber/40 bg-[#fdf3d9] p-8 lg:p-10">
            <Pill tone="amber">Warning label</Pill>
            <h3 className="mt-5 max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
              {pay.warning.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {pay.warning.body}
            </p>
          </div>
        </Reveal>

        <Reveal i={2}>
          <p className="mt-10 max-w-2xl text-sm font-medium leading-relaxed text-ink">
            {pay.tiersNote}
          </p>
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {pay.tiers.map((t, idx) => (
            <Reveal key={t.id} i={idx % 3}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span
                  aria-hidden
                  className={`h-1 w-10 rounded-full ${accentBar[t.accent]}`}
                />
                <p className={`mt-5 kicker ${accentText[t.accent]}`}>{t.level}</p>
                <p className="mt-3 font-display text-3xl leading-none">{t.hourly}</p>
                <p className="mt-2 font-mono text-xs text-ink-faint">{t.monthly}</p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">
                  {t.what}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-5 rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-8 lg:p-10">
            <h3 className="max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance">
              {pay.disagreement.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {pay.disagreement.body}
            </p>

            <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-2xl border border-line bg-paper-2 p-5 text-center">
                <p className="kicker">{pay.disagreement.a.label}</p>
                <p className="mt-3 font-display text-2xl leading-none text-ink">
                  {pay.disagreement.a.value}
                </p>
              </div>
              <p className="text-center font-display text-xl text-coral">vs</p>
              <div className="rounded-2xl border border-line bg-paper-2 p-5 text-center">
                <p className="kicker">{pay.disagreement.b.label}</p>
                <p className="mt-3 font-display text-2xl leading-none text-ink">
                  {pay.disagreement.b.value}
                </p>
              </div>
            </div>

            <p className="mt-7 max-w-3xl border-l-2 border-coral pl-5 text-sm font-medium leading-relaxed text-ink">
              {pay.disagreement.lesson}
            </p>

            <div className="mt-7 flex flex-col gap-2 border-t border-line pt-5">
              {pay.sources.map((s) => (
                <Source key={s.url} label={s.label} url={s.url} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- UNKNOWN */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={unknown.kicker}
              title={unknown.title}
              lead={unknown.lead}
            />
          </Reveal>

          <div className="mt-12 flex flex-col gap-4">
            {unknown.items.map((u, idx) => (
              <Reveal key={u.id} i={idx % 3}>
                <article className="grid gap-5 rounded-2xl border border-line bg-paper-2 p-6 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-8">
                  <div>
                    <p className="font-display text-lg leading-snug text-ink-faint line-through decoration-coral/50 decoration-2">
                      {u.claim}
                    </p>
                    <p className="mt-3">
                      <Pill tone="coral">{u.verdict}</Pill>
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">{u.why}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-2xl font-display text-xl leading-snug text-coral">
              {unknown.close}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- READING */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={reading.kicker}
            title={reading.title}
            lead={reading.lead}
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-14">
          {reading.groups.map((g) => (
            <div key={g.id}>
              <Reveal>
                <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                  <h3 className="font-display text-[length:var(--text-h3)] leading-snug">
                    {g.title}
                  </h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {g.note}
                  </p>
                </div>
              </Reveal>

              <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {g.items.map((item, idx) => (
                  <Reveal key={item.url} i={idx % 3}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-[var(--shadow-md)]"
                    >
                      <p className="kicker">{item.org}</p>
                      <h4 className="mt-3 font-display text-lg leading-snug text-balance text-ink transition-colors group-hover:text-coral">
                        {item.title}
                      </h4>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                        {item.why}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint transition-colors group-hover:text-coral">
                        Open the source
                        <ExternalLink size={12} />
                      </span>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- CLOSING */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:p-12">
            <Kicker>{closing.kicker}</Kicker>
            <h2 className="mt-6 max-w-4xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {closing.title}
            </h2>
            <p className="mt-6 max-w-3xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
              {closing.body}
            </p>
            <p className="mt-6 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
              {closing.point}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closing.links.map((l, idx) => (
                <Reveal key={l.href} i={idx % 3}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
                    <ArrowLink href={l.href}>{l.label}</ArrowLink>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                      {l.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/tasks">Start building proof</ButtonLink>
              <ButtonLink href="/niches" variant="outline">
                Pick your lane
              </ButtonLink>
            </div>

            <p className="mt-10 max-w-2xl border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">
              {closing.last}
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
