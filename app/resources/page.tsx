import { ExternalLink } from "lucide-react";
import resources from "@/data/resources.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Free Resources",
  description:
    "The free shelf for Filipino online professionals: verified free courses, government programs, docs, and YouTube channels that actually move the needle, plus how to judge any free course before it takes your week, and how to turn study into proof.",
};

const costTone: Record<string, "emerald" | "indigo" | "amber" | "neutral"> = {
  free: "emerald",
  "open-source": "emerald",
  freemium: "indigo",
  "free-trial": "amber",
  paid: "neutral",
};
const costLabel: Record<string, string> = {
  free: "Open",
  "open-source": "Open source",
  freemium: "No-cost tier",
  "free-trial": "Trial",
  paid: "Paid",
};

type ShelfItem = { org: string; title: string; url: string; why: string; cost: string };

export default function ResourcesPage() {
  const { hero, judge, shelf, protocol, closing } = resources;

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

      {/* -------------------------------------------------------------- JUDGE */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={judge.kicker} title={judge.title} lead={judge.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {judge.tests.map((t, idx) => (
              <Reveal key={t.q} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug text-balance">{t.q}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{t.why}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-2xl font-display text-xl leading-snug text-coral">{judge.note}</p>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- SHELF */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={shelf.kicker} title={shelf.title} lead={shelf.lead} />
        </Reveal>

        <div className="mt-12 flex flex-col gap-14">
          {shelf.groups.map((g) => (
            <div key={g.id}>
              <Reveal>
                <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                  <h3 className="font-display text-[length:var(--text-h3)] leading-snug">{g.title}</h3>
                  <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{g.note}</p>
                </div>
              </Reveal>

              <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {(g.items as ShelfItem[]).map((item, idx) => (
                  <Reveal key={item.url} i={idx % 3}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="kicker">{item.org}</p>
                        <Pill tone={costTone[item.cost] ?? "emerald"}>
                          {costLabel[item.cost] ?? "Open"}
                        </Pill>
                      </div>
                      <h4 className="mt-3 font-display text-lg leading-snug text-balance text-ink transition-colors group-hover:text-coral">
                        {item.title}
                      </h4>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{item.why}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint transition-colors group-hover:text-coral">
                        Open the resource
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

      {/* ----------------------------------------------------------- PROTOCOL */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{protocol.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {protocol.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{protocol.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {protocol.steps.map((s, idx) => (
              <Reveal key={s.n} i={idx % 5}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="font-display text-4xl leading-none text-coral">0{s.n}</span>
                  <h3 className="mt-4 font-display text-lg leading-tight text-paper-2">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-2/70">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {protocol.crossrefs.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-paper-2 transition-colors hover:text-coral"
                >
                  <span className="link-sweep">{c.label}</span>
                  <ExternalLink size={14} className="opacity-70" />
                </a>
              ))}
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
            <p className="mt-6 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
              {closing.point}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {closing.links.map((l, idx) => (
                <Reveal key={l.href} i={idx % 3}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
                    <ArrowLink href={l.href}>{l.label}</ArrowLink>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/ai-first">Start with the AI layer</ButtonLink>
              <ButtonLink href="/tasks" variant="outline">
                Turn it into proof
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
