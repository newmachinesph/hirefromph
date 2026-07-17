import { ExternalLink, Check, X } from "lucide-react";
import salary from "@/data/salary.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, PageHero, Pill, SectionHeading } from "@/components/ui";
import { RateCalculator } from "@/components/rate-calculator";
import { RateWorksheet } from "@/components/rate-worksheet";
import { FreshnessNote } from "@/components/freshness-note";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/salary",
  title: "Salary Guide",
  description:
    "What online work really pays for Filipino professionals right now. In-demand roles from live OnlineJobs.ph listings, honest vendor-grade pay ranges, full-time vs part-time vs hourly vs project vs retainer, and how to price yourself. Every number labeled for what it is.",
});

const accentText: Record<string, string> = {
  coral: "text-coral",
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

export default function SalaryPage() {
  const { hero, warning, inDemand, emerging, rates, engagement, price, closing } =
    salary;

  return (
    <>
      {/* --------------------------------------------------------------- HERO */}
      <PageHero
        kicker={hero.kicker}
        titleWidth="max-w-4xl"
        title={
          <>
            {hero.line1}
            <br />
            <span className="text-coral">{hero.line2}</span>
          </>
        }
        lead={hero.intro}
      >
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {hero.creed}
          </blockquote>
        </Reveal>
        <Reveal i={4}>
          <div className="mt-6">
            <FreshnessNote date={salary.lastVerified} />
          </div>
        </Reveal>
      </PageHero>

      {/* ------------------------------------------------------------ WARNING */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-amber/40 bg-amber-tint p-8 lg:p-10">
            <Pill tone="amber">Warning label</Pill>
            <h2 className="mt-5 max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
              {warning.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {warning.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- IN DEMAND */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={inDemand.kicker} title={inDemand.title} lead={inDemand.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inDemand.roles.map((r, idx) => (
              <Reveal key={r.role} i={idx % 4}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={r.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug text-balance">{r.role}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.blurb}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-8 flex flex-col gap-3">
              <p className="max-w-3xl border-l-2 border-emerald pl-5 font-display text-xl leading-snug text-ink">
                {inDemand.note}
              </p>
              <Source label={inDemand.source.label} url={inDemand.source.url} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- EMERGING */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={emerging.kicker} title={emerging.title} lead={emerging.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {emerging.roles.map((r, idx) => (
            <Reveal key={r.role} i={idx % 3}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-coral text-white">
                  <Icon name={r.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-lg leading-snug text-balance">{r.role}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.blurb}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <p className="mt-8 max-w-3xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {emerging.note}
          </p>
        </Reveal>
        <Reveal i={2}>
          <div className="mt-5 flex flex-col gap-3">
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-ink-soft">
              {emerging.note2}
            </p>
            <Source label={emerging.source.label} url={emerging.source.url} />
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- RATES */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={rates.kicker} title={rates.title} />
        </Reveal>
        <Reveal i={1}>
          <p className="mt-6 max-w-2xl text-sm font-medium leading-relaxed text-ink">
            {rates.monthlyNote}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {rates.tiers.map((t, idx) => (
            <Reveal key={t.level} i={idx % 3}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <span aria-hidden className={`h-1 w-10 rounded-full ${accentBar[t.accent]}`} />
                <p className={`mt-5 kicker ${accentText[t.accent]}`}>{t.level}</p>
                <p className="mt-3 font-display text-3xl leading-none">{t.monthly}</p>
                <p className="mt-2 font-mono text-xs text-ink-faint">{t.hourly}</p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">{t.what}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-5 rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-8 lg:p-10">
            <h3 className="max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-balance">
              {rates.contradiction.title}
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {rates.contradiction.body}
            </p>

            <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-2xl border border-line bg-paper-2 p-5 text-center">
                <p className="kicker">{rates.contradiction.a.label}</p>
                <p className="mt-3 font-display text-2xl leading-none text-ink">
                  {rates.contradiction.a.value}
                </p>
              </div>
              <p className="text-center font-display text-xl text-coral">vs</p>
              <div className="rounded-2xl border border-line bg-paper-2 p-5 text-center">
                <p className="kicker">{rates.contradiction.b.label}</p>
                <p className="mt-3 font-display text-2xl leading-none text-ink">
                  {rates.contradiction.b.value}
                </p>
              </div>
            </div>

            <p className="mt-7 max-w-3xl border-l-2 border-coral pl-5 text-sm font-medium leading-relaxed text-ink">
              {rates.contradiction.lesson}
            </p>

            <div className="mt-7 flex flex-col gap-2 border-t border-line pt-5">
              {rates.sources.map((s) => (
                <Source key={s.url} label={s.label} url={s.url} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- WORKSHEET */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <RateWorksheet />
        </Reveal>
      </section>

      {/* --------------------------------------------------------- ENGAGEMENT */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={engagement.kicker} title={engagement.title} lead={engagement.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {engagement.types.map((t, idx) => (
              <Reveal key={t.name} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                      <Icon name={t.icon} size={18} />
                    </span>
                    <h3 className="font-display text-lg leading-tight">{t.name}</h3>
                  </div>
                  <p className="mt-3 text-xs font-medium leading-relaxed text-emerald">{t.best}</p>

                  <ul className="mt-4 flex flex-col gap-2">
                    {t.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm leading-snug text-ink">
                        <Check size={15} className="mt-0.5 shrink-0 text-emerald" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-3 flex flex-col gap-2">
                    {t.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm leading-snug text-ink-soft">
                        <X size={15} className="mt-0.5 shrink-0 text-coral" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- PRICE */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{price.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {price.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{price.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {price.steps.map((s, idx) => (
              <Reveal key={s.n} i={idx % 5}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="font-display text-4xl leading-none text-coral">0{s.n}</span>
                  <h3 className="mt-4 font-display text-lg leading-tight text-paper-2">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-2/70">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- CALCULATOR */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Do the math yourself"
              title="Your real rate calculator."
              lead="Drag the sliders with your own numbers. Watch your headline rate shrink into what you actually take home, once the fees, the costs, the tax, and the unpaid time are counted. This is the honest number to plan your life around."
            />
          </Reveal>
          <Reveal i={1}>
            <div className="mt-12">
              <RateCalculator />
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
              <ButtonLink href="/niches">Pick your lane</ButtonLink>
              <ButtonLink href="/reality" variant="outline">
                See the full market data
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
