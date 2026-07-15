import { ExternalLink } from "lucide-react";
import indispensable from "@/data/indispensable.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/indispensable",
  title: "Become Indispensable",
  description:
    "How to become layoff-proof and the professional clients fight to keep. The many kinds of intelligence school never measured (creative, emotional, judgment, taste, adaptability) and the habits that make you impossible to replace in an AI world. Sourced.",
});

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

function Source({ label, url }: { label: string; url: string }) {
  if (!label || !url) return null;
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

export default function IndispensablePage() {
  const { hero, why, intelligences, soughtAfter, proof, closing } = indispensable;

  return (
    <>
      {/* --------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>{hero.kicker}</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-4xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            {hero.line1}
            <br />
            <span className="text-coral">{hero.line2}</span>
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {hero.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {hero.creed}
          </blockquote>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- WHY */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={why.kicker} title={why.title} lead={why.lead} />
          </Reveal>
          <Reveal i={1}>
            <div className="mt-10 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-line bg-paper-2 p-8 lg:p-10">
              <p className="max-w-3xl border-l-2 border-emerald pl-5 text-sm font-medium leading-relaxed text-ink">
                {why.callout}
              </p>
              <Source label={why.source.label} url={why.source.url} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- INTELLIGENCES */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={intelligences.kicker}
            title={intelligences.title}
            lead={intelligences.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {intelligences.items.map((it, idx) => (
            <Reveal key={it.name} i={idx % 3}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentBar[it.accent]} text-white`}
                  >
                    <Icon name={it.icon} size={20} />
                  </span>
                  <h3 className="font-display text-lg leading-tight">{it.name}</h3>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{it.what}</p>
                <p
                  className={`mt-4 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[it.accent]}`}
                >
                  <span className="kicker mb-1 block text-ink-faint">Build it</span>
                  {it.build}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <p className="mt-8 max-w-3xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {intelligences.note}
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ SOUGHT AFTER */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={soughtAfter.kicker}
              title={soughtAfter.title}
              lead={soughtAfter.lead}
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {soughtAfter.traits.map((t, idx) => (
              <Reveal key={t.title} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug">{t.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{t.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- PROOF */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{proof.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {proof.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{proof.body}</p>
          </Reveal>

          <Reveal i={1}>
            <div className="mt-12 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-5">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-paper-2/80">
                  <span aria-hidden className="h-3 w-3 rounded-sm bg-emerald" />
                  {proof.legend.freelancer}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-paper-2/80">
                  <span aria-hidden className="h-3 w-3 rounded-sm bg-white/25" />
                  {proof.legend.employee}
                </span>
              </div>

              <ul className="mt-6 flex flex-col divide-y divide-white/10">
                {proof.rows.map((r) => (
                  <li
                    key={r.label}
                    className="grid gap-2 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-6"
                  >
                    <p className="text-sm font-medium leading-snug text-paper-2">{r.label}</p>
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
                  href={proof.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1 text-xs font-medium text-paper-2/50 transition-colors hover:text-coral"
                >
                  <span className="text-balance">Source: {proof.source.label}</span>
                  <ExternalLink size={11} className="mt-0.5 shrink-0" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ CLOSING */}
      <section className="container-x py-20 lg:py-24">
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

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {closing.links.map((l, idx) => (
                <Reveal key={l.href} i={idx % 4}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
                    <ArrowLink href={l.href}>{l.label}</ArrowLink>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/ai-first">Multiply with AI</ButtonLink>
              <ButtonLink href="/tasks" variant="outline">
                Build your proof
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
