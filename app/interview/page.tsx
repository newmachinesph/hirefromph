import type { Metadata } from "next";
import interview from "@/data/interview.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, Kicker, PageHero, SectionHeading } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { pageMeta } from "@/lib/meta";

// FAQPage from the genuine question -> approach pairs in `questions.items`.
// These are real Q&A: the interview question and how to answer it.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: interview.questions.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.approach },
  })),
};

export const metadata: Metadata = pageMeta({
  path: "/interview",
  title: "Interview Prep",
  description:
    "The STAR method, a bank of the questions you'll actually face, questions to ask them, remote interview formats, and the red flags of a scam interview. Learn the structure, then build your own answers from your own stories.",
});

export default function InterviewPage() {
  const { hero, star, workshop, questions, askThem, formats, redFlags, closing } =
    interview;

  return (
    <>
      <JsonLd data={faqLd} />
      {/* --------------------------------------------------------------- HERO */}
      <PageHero
        kicker={hero.kicker}
        title={
          <>
            {hero.line1}
            <br />
            <span className="text-coral">{hero.line2}</span>
          </>
        }
        titleWidth="max-w-4xl"
        lead={hero.intro}
      >
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {hero.creed}
          </blockquote>
        </Reveal>
      </PageHero>

      {/* --------------------------------------------------------------- STAR */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={star.kicker} title={star.title} lead={star.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {star.parts.map((p, idx) => (
              <Reveal key={p.letter} i={idx % 2}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 lg:p-8">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink font-display text-2xl text-paper-2">
                      {p.letter}
                    </span>
                    <div>
                      <h3 className="font-display text-xl leading-tight">{p.name}</h3>
                      <span className="text-ink-faint">
                        <Icon name={p.icon} size={15} />
                      </span>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
                  <p className="mt-4 rounded-xl bg-paper-3 p-4 text-sm italic leading-relaxed text-ink">
                    {p.example}
                  </p>
                  <p className="mt-4 border-l-2 border-coral pl-3 text-sm font-medium leading-relaxed text-ink">
                    {p.watch}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-3xl border-l-2 border-emerald pl-5 font-display text-xl leading-snug text-ink">
              {star.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ WORKSHOP */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={workshop.kicker} title={workshop.title} lead={workshop.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {workshop.themes.map((t, idx) => (
            <Reveal key={t.theme} i={idx % 4}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-coral-tint text-coral-deep">
                  <Icon name={t.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-base leading-snug">{t.theme}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{t.prompt}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {workshop.steps.map((s, idx) => (
            <Reveal key={s.n} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="font-display text-3xl text-line-strong">0{s.n}</span>
                <h3 className="mt-3 font-display text-lg leading-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-8">
            <ArrowLink href={workshop.crossref.href}>{workshop.crossref.label}</ArrowLink>
          </div>
        </Reveal>
      </section>

      {/* ----------------------------------------------------------- QUESTIONS */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={questions.kicker} title={questions.title} lead={questions.lead} />
          </Reveal>

          <div className="mt-12 flex flex-col gap-4">
            {questions.items.map((q, idx) => (
              <Reveal key={q.q} i={idx % 3}>
                <article className="grid gap-4 rounded-2xl border border-line bg-paper-2 p-6 sm:grid-cols-[auto_1fr] lg:p-8">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={q.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-snug text-ink">{q.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{q.approach}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ ASK THEM */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={askThem.kicker} title={askThem.title} lead={askThem.lead} />
        </Reveal>

        <div className="mt-10 max-w-3xl">
          <ul className="flex flex-col gap-3">
            {askThem.items.map((q) => (
              <Reveal key={q}>
                <li className="flex items-start gap-3 rounded-2xl border border-line bg-paper-2 p-5">
                  <span className="mt-0.5 shrink-0 text-coral">
                    <Icon name="message-circle" size={18} />
                  </span>
                  <span className="text-sm font-medium leading-relaxed text-ink">{q}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal i={1}>
            <p className="mt-6 border-l-2 border-coral pl-5 text-sm leading-relaxed text-ink-soft">
              {askThem.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- FORMATS */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={formats.kicker} title={formats.title} lead={formats.lead} />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {formats.items.map((f, idx) => (
              <Reveal key={f.name} i={idx % 2}>
                <article className="flex h-full gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-tint text-emerald">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-tight">{f.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- RED FLAGS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={redFlags.kicker} title={redFlags.title} lead={redFlags.lead} />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {redFlags.items.map((f, idx) => (
            <Reveal key={f.flag} i={idx % 2}>
              <article className="flex h-full flex-col rounded-2xl border border-coral/30 bg-coral-tint/30 p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-coral-deep">
                    <Icon name="shield-alert" size={20} />
                  </span>
                  <h3 className="font-display text-base leading-snug text-ink">{f.flag}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.why}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal i={1}>
          <a
            href={redFlags.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-xs font-semibold text-ink link-sweep"
          >
            {redFlags.source.label} ↗
          </a>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ CLOSING */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:p-12">
            <Kicker>{closing.kicker}</Kicker>
            <h2 className="mt-3 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {closing.title}
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">{closing.body}</p>
            <p className="mt-5 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
              {closing.point}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {closing.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-paper-3/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  <h3 className="font-display text-lg leading-tight text-ink group-hover:text-coral">
                    {l.label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
