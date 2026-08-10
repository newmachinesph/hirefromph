import { Check, ExternalLink, X } from "lucide-react";
import conduct from "@/data/conduct.json";
import { Icon } from "@/components/icon";
import { IntegrityOath } from "@/components/integrity-oath";
import { Reveal } from "@/components/reveal";
import { Kicker, PageHero, Pill, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/conduct",
  title: "Conduct & Integrity",
  description:
    "The documented behaviour that gets remote professionals fired, sued, and delisted, and the oath that keeps you out of it. Do's, don'ts, real cases, and an oath you write yourself.",
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

function Source({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-signal"
    >
      Source: {label}
      <ExternalLink size={11} className="opacity-60" />
    </a>
  );
}

export default function ConductPage() {
  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <PageHero
        kicker="Conduct · Integrity · The oath"
        title={
          <>
            Nobody is watching you work.
            <br />
            That is the entire test.
          </>
        }
        titleWidth="max-w-4xl"
        lead={conduct.intro}
      >
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-signal pl-5 font-display text-xl leading-snug text-ink">
            {conduct.creed}
          </blockquote>
        </Reveal>
        <Reveal i={4}>
          <p className="mt-8 max-w-2xl rounded-2xl border border-line bg-paper-2 p-5 text-sm leading-relaxed text-ink-soft">
            {conduct.whyItMatters}
          </p>
        </Reveal>
      </PageHero>

      {/* ------------------------------------------------------- PRINCIPLES */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Six principles · borrowed from the codes that govern real professions"
              title="These rules are older than remote work"
              lead="None of this was invented for freelancers. Engineers, doctors, and accountants have been bound by these exact clauses for decades, we've simply translated them into the situations you'll actually meet."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {conduct.principles.map((p, idx) => (
              <Reveal key={p.id} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={p.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl leading-tight">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-snug text-ink">
                    {p.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {p.body}
                  </p>
                  <div className="mt-5 border-t border-line pt-4">
                    <Source label={p.source.label} url={p.source.url} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-8 rounded-[var(--radius-lg)] border border-verified/30 bg-verified-tint p-8 lg:p-10">
              <h3 className="max-w-2xl font-display text-[length:var(--text-h3)] leading-snug text-ink">
                {conduct.philippineAnchor.title}
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
                {conduct.philippineAnchor.body}
              </p>
              <div className="mt-5">
                <Source
                  label={conduct.philippineAnchor.source.label}
                  url={conduct.philippineAnchor.source.url}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ CASES */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="The price list"
            title="What it actually costs when this goes wrong"
            lead={conduct.casesIntro}
          />
        </Reveal>

        <div className="mt-12 flex flex-col gap-5">
          {conduct.cases.map((c, idx) => (
            <Reveal key={c.id} i={idx % 3}>
              <article className="grid gap-6 rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 rounded-full ${accentBar[c.accent]}`}
                    />
                    <p className={`kicker ${accentText[c.accent]}`}>{c.tag}</p>
                  </div>
                  <h3 className="mt-4 font-display text-[length:var(--text-h3)] leading-snug text-balance">
                    {c.title}
                  </h3>
                  <p className="mt-3 font-mono text-xs tracking-wide text-ink-faint">
                    {c.when}
                  </p>
                  <div className="mt-5">
                    <Source label={c.source.label} url={c.source.url} />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-ink-soft">{c.what}</p>
                  <p className="rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed text-ink">
                    <strong className="font-semibold">The sting:</strong> {c.sting}
                  </p>
                  <p
                    className={`border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${
                      c.accent === "signal"
                        ? "border-signal"
                        : c.accent === "caution"
                          ? "border-caution"
                          : c.accent === "verified"
                            ? "border-verified"
                            : "border-info"
                    }`}
                  >
                    {c.lesson}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- DOS/DONTS */}
      <section className="bg-ink py-20 text-paper-2 lg:py-24">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">Do&rsquo;s and don&rsquo;ts</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              The line is never blurry in the moment.
              <br />
              It gets blurry in the retelling.
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">
              {conduct.dosDontsIntro}
            </p>
          </Reveal>

          <div className="mt-14 flex flex-col gap-5">
            {conduct.dosDonts.map((area, idx) => (
              <Reveal key={area.id} i={idx % 3}>
                <article className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-6 lg:p-8">
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${accentBar[area.accent]}`}
                    >
                      <Icon name={area.icon} size={20} />
                    </span>
                    <h3 className="font-display text-2xl leading-tight">
                      {area.area}
                    </h3>
                  </div>

                  <div className="mt-7 grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="kicker flex items-center gap-1.5 text-verified">
                        <Check size={13} strokeWidth={3} /> Do
                      </p>
                      <ul className="mt-4 flex flex-col gap-3">
                        {area.dos.map((d) => (
                          <li
                            key={d}
                            className="flex gap-3 text-sm leading-relaxed text-paper-2/80"
                          >
                            <Check
                              size={15}
                              strokeWidth={3}
                              aria-hidden
                              className="mt-0.5 shrink-0 text-verified"
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="kicker flex items-center gap-1.5 text-signal">
                        <X size={13} strokeWidth={3} /> Never
                      </p>
                      <ul className="mt-4 flex flex-col gap-3">
                        {area.donts.map((d) => (
                          <li
                            key={d}
                            className="flex gap-3 text-sm leading-relaxed text-paper-2/80"
                          >
                            <X
                              size={15}
                              strokeWidth={3}
                              aria-hidden
                              className="mt-0.5 shrink-0 text-signal"
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- OATH */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <Pill tone="verified">Nothing to download. Nothing uploaded.</Pill>
            <h2 className="mt-6 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              {conduct.oath.title}
            </h2>
            <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
              {conduct.oath.lead}
            </p>
          </div>
        </Reveal>

        <Reveal i={1} className="mx-auto mt-12 max-w-3xl">
          <IntegrityOath />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- HONESTY */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-8 lg:p-10">
            <Kicker>{conduct.honesty.title}</Kicker>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              {conduct.honesty.body}
            </p>
            <div className="mt-5">
              <Source
                label={conduct.honesty.source.label}
                url={conduct.honesty.source.url}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
