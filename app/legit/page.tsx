import legit from "@/data/legit.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, PageHero, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/legit",
  title: "Get Legit",
  description:
    "BIR registration, the 8% option, SSS/PhilHealth/Pag-IBIG as a self-employed professional, and the payment rails that protect your rate: every step linked to the official page.",
});

export default function LegitPage() {
  const { hero, why, bir, benefits, gettingPaid, closing } = legit;

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
      </PageHero>

      {/* ---------------------------------------------------------------- WHY */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={why.kicker} title={why.title} />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {why.items.map((it, idx) => (
              <Reveal key={it.title} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={it.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug">{it.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- BIR */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={bir.kicker} title={bir.title} lead={bir.lead} />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {bir.steps.map((s, idx) => (
            <Reveal key={s.n} i={idx % 2}>
              <article className="flex h-full gap-5 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal font-display text-lg text-white">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-lg leading-snug">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal i={1}>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            {bir.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-ink link-sweep"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-soft">{bir.note}</p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ BENEFITS */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker={benefits.kicker}
              title={benefits.title}
              lead={benefits.lead}
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {benefits.items.map((b, idx) => (
              <Reveal key={b.name} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-verified text-white">
                    <Icon name={b.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-snug">{b.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{b.what}</p>
                  <a
                    href={b.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-xs font-semibold text-ink link-sweep"
                  >
                    {b.source.label} ↗
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- GETTING PAID */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={gettingPaid.kicker}
            title={gettingPaid.title}
            lead={gettingPaid.lead}
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gettingPaid.rails.map((r, idx) => (
            <Reveal key={r.name} i={idx % 4}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                  <Icon name={r.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-base leading-snug">{r.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.shape}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-xs font-semibold text-ink link-sweep"
                >
                  Official site ↗
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal i={1}>
          <p className="mt-8 max-w-3xl border-l-2 border-signal pl-5 font-display text-lg leading-snug text-ink">
            {gettingPaid.note}
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ CLOSING */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:p-12">
            <Kicker>{closing.kicker}</Kicker>
            <h2 className="mt-4 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {closing.title}
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">{closing.body}</p>
            <p className="mt-5 font-display text-lg text-signal">{closing.point}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {closing.links.map((l) => (
                <div key={l.href} className="rounded-2xl border border-line bg-paper p-5">
                  <ArrowLink href={l.href}>{l.label}</ArrowLink>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <ButtonLink href="/plan">Fold it into your 30-day plan</ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
