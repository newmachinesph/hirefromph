import { ExternalLink } from "lucide-react";
import aifirst from "@/data/aifirst.json";
import { FreshnessNote } from "@/components/freshness-note";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, PageHero, Pill, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/ai-first",
  title: "AI-First",
  description:
    "Every role runs on AI now. Coding agents, open-source and local models, AI image, AI video, and automation, taught as how to fold AI into your craft, with the four habits that turn it into leverage instead of slop. Every claim sourced.",
});

const accentText: Record<string, string> = {
  signal: "text-signal",
  caution: "text-caution-text",
  verified: "text-verified",
  info: "text-info",
};
const accentBar: Record<string, string> = {
  signal: "bg-signal",
  caution: "bg-caution",
  verified: "bg-verified",
  info: "bg-info",
};
const accentBorder: Record<string, string> = {
  signal: "border-signal",
  caution: "border-caution",
  verified: "border-verified",
  info: "border-info",
};

const costTone: Record<string, "verified" | "info" | "caution" | "neutral"> = {
  free: "verified",
  "open-source": "verified",
  freemium: "info",
  "free-trial": "caution",
  paid: "neutral",
};
const costLabel: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

function Source({ label, url }: { label: string; url: string }) {
  if (!label || !url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-start gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-signal"
    >
      <span className="text-balance">Source: {label}</span>
      <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-60" />
    </a>
  );
}

export default function AiFirstPage() {
  const { hero, shift, fluency, landscape, craft, adopt, guardrails, agentic, closing } =
    aifirst;

  return (
    <>
      {/* --------------------------------------------------------------- HERO */}
      <PageHero
        kicker={hero.kicker}
        title={
          <>
            {hero.line1}
            <br />
            <span className="text-signal">{hero.line2}</span>
          </>
        }
        titleWidth="max-w-4xl"
        lead={hero.intro}
      >
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-signal pl-5 font-display text-xl leading-snug text-ink">
            {hero.creed}
          </blockquote>
        </Reveal>
        <Reveal i={4}>
          <div className="mt-6">
            <FreshnessNote date={aifirst.lastVerified} />
          </div>
        </Reveal>
      </PageHero>

      {/* -------------------------------------------------------------- SHIFT */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={shift.kicker} title={shift.title} lead={shift.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {shift.stats.map((s, idx) => (
              <Reveal key={s.label} i={idx % 3}>
                <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                  <p className="font-display text-[length:var(--text-display)] leading-none text-verified">
                    {s.value}
                  </p>
                  <p className="mt-3 font-display text-lg leading-tight text-ink">
                    {s.label}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                  <div className="mt-6 border-t border-line pt-4">
                    <Source label={s.source.label} url={s.source.url} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-3xl border-l-2 border-verified pl-5 font-display text-xl leading-snug text-ink">
              {shift.note}
            </p>
          </Reveal>
          <Reveal i={2}>
            <div className="mt-5">
              <ArrowLink href={shift.crossref.href}>{shift.crossref.label}</ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ FLUENCY */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={fluency.kicker} title={fluency.title} lead={fluency.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {fluency.skills.map((sk, idx) => (
            <Reveal key={sk.name} i={idx % 2}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] lg:p-8">
                <div className="flex items-center gap-4">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentBar[sk.accent]} text-white`}
                  >
                    <Icon name={sk.icon} size={20} />
                  </span>
                  <div>
                    <p className={`kicker ${accentText[sk.accent]}`}>Skill {sk.letter}</p>
                    <h3 className="font-display text-xl leading-tight">{sk.name}</h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-ink-soft">{sk.purpose}</p>
                <p
                  className={`mt-4 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[sk.accent]}`}
                >
                  {sk.doThis}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-paper-3/60 p-6">
            <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{fluency.note}</p>
            <Source label={fluency.source.label} url={fluency.source.url} />
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- LANDSCAPE */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={landscape.kicker}
              title={landscape.title}
              lead={landscape.lead}
            />
          </Reveal>
          <Reveal i={1}>
            <p className="mt-6 max-w-3xl border-l-2 border-info pl-5 text-sm font-medium leading-relaxed text-ink">
              {landscape.note}
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-5">
            {landscape.categories.map((c, idx) => (
              <Reveal key={c.id} i={idx % 3}>
                <article className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${accentBar[c.accent]} text-white`}
                        >
                          <Icon name={c.icon} size={22} />
                        </span>
                        <h3 className="font-display text-[length:var(--text-h3)] leading-tight">
                          {c.name}
                        </h3>
                      </div>
                      <p className="mt-5 text-sm leading-relaxed text-ink-soft">{c.what}</p>
                      <p
                        className={`mt-4 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[c.accent]}`}
                      >
                        <span className="kicker mb-1 block text-ink-faint">What it unlocks</span>
                        {c.unlocks}
                      </p>
                    </div>

                    <div>
                      <p className="kicker text-ink-faint">A few real ones to try</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {c.tools.map(
                          (t: {
                            name: string;
                            url: string;
                            cost: string;
                            oneLiner: string;
                            useInWork: string;
                          }) => (
                            <a
                              key={t.name}
                              href={t.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[var(--shadow-sm)]"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-display text-base leading-tight text-ink transition-colors group-hover:text-signal">
                                  {t.name}
                                </span>
                                <Pill tone={costTone[t.cost] ?? "neutral"}>
                                  {costLabel[t.cost] ?? t.cost}
                                </Pill>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                                {t.oneLiner}
                              </p>
                              <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-faint">
                                {t.useInWork}
                              </p>
                              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint transition-colors group-hover:text-signal">
                                Open
                                <ExternalLink size={11} />
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CRAFT */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={craft.kicker} title={craft.title} lead={craft.lead} />
        </Reveal>

        <div className="mt-12 flex flex-col gap-3">
          {craft.rows.map((r, idx) => (
            <Reveal key={r.niche} i={idx % 3}>
              <article className="grid gap-4 rounded-2xl border border-line bg-paper-2 p-6 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center sm:gap-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={r.icon} size={18} />
                  </span>
                  <h3 className="font-display text-lg leading-tight">{r.niche}</h3>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{r.workflow}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <p className="mt-8 max-w-3xl border-l-2 border-signal pl-5 font-display text-xl leading-snug text-ink">
            {craft.note}
          </p>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- ADOPT */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{adopt.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {adopt.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{adopt.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {adopt.steps.map((s, idx) => (
              <Reveal key={s.n} i={idx % 5}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="font-display text-4xl leading-none text-signal">0{s.n}</span>
                  <h3 className="mt-4 font-display text-lg leading-tight text-paper-2">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-2/70">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {adopt.crossrefs.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-paper-2 transition-colors hover:text-signal"
                >
                  <span className="link-sweep">{c.label}</span>
                  <ExternalLink size={14} className="opacity-70" />
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- GUARDRAILS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={guardrails.kicker}
            title={guardrails.title}
            lead={guardrails.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {guardrails.items.map((it, idx) => (
            <Reveal key={it.title} i={idx % 2}>
              <article className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal-tint text-signal-deep">
                  <Icon name={it.icon} size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg leading-tight">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-6">
            <ArrowLink href={guardrails.crossref.href}>{guardrails.crossref.label}</ArrowLink>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ AGENTIC */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={agentic.kicker}
              title={agentic.title}
              lead={agentic.lead}
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agentic.items.map((it, idx) => (
              <Reveal key={it.term} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={it.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug">{it.term}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-10 rounded-2xl border border-line-strong bg-paper-2 p-8">
              <h3 className="font-display text-[length:var(--text-h3)] leading-snug">
                {agentic.why.title}
              </h3>
              <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft">{agentic.why.body}</p>
              <p className="mt-5 max-w-2xl border-l-2 border-signal pl-5 font-display text-lg leading-snug text-ink">
                {agentic.note}
              </p>
              <a
                href={agentic.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-xs font-semibold text-ink link-sweep"
              >
                {agentic.source.label} ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ CLOSING */}
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
            <p className="mt-6 max-w-2xl border-l-2 border-signal pl-5 font-display text-xl leading-snug text-ink">
              {closing.point}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {closing.links.map((l, idx) => (
                <Reveal key={l.href} i={idx % 2}>
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
              <ButtonLink href="/prompts">Learn to direct AI</ButtonLink>
              <ButtonLink href="/resources" variant="outline">
                Get the free courses
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
