import { ExternalLink } from "lucide-react";
import markets from "@/data/markets.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Client Markets & Time Zones",
  description:
    "Where your online clients are (US, UK & EU, Australia, Middle East, Canada, regional Asia), how each market differs in pay, culture, and industries, and the timezone and overlap-hours math for a Filipino professional on UTC+8.",
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-2">
      <span className="kicker text-ink-faint">{label}</span>
      <span className="text-sm leading-relaxed text-ink-soft">{children}</span>
    </div>
  );
}

export default function MarketsPage() {
  const { hero, overlap, regions, strategies, findIndustry, abroad, closing } = markets;

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

      {/* ------------------------------------------------------------ OVERLAP */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={overlap.kicker} title={overlap.title} lead={overlap.lead} />
          </Reveal>
          <Reveal i={1}>
            <p className="mt-8 max-w-3xl border-l-2 border-emerald pl-5 font-display text-xl leading-snug text-ink">
              {overlap.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ REGIONS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={regions.kicker} title={regions.title} lead={regions.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {regions.items.map((r, idx) => (
            <Reveal key={r.name} i={idx % 2}>
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{r.flag}</span>
                  <h3 className="font-display text-[length:var(--text-h3)] leading-tight">{r.name}</h3>
                </div>
                <span aria-hidden className={`mt-4 h-1 w-12 rounded-full ${accentBar[r.accent]}`} />

                <div className="mt-4 divide-y divide-line">
                  <Row label="Time zone">{r.tz}</Row>
                  <Row label="Vs PH">{r.offset}</Row>
                  <Row label="Overlap">{r.overlap}</Row>
                  <Row label="Pay">{r.pay}</Row>
                  <Row label="Style">{r.style}</Row>
                  <Row label="Industries">{r.industries}</Row>
                </div>

                <p
                  className={`mt-5 border-l-2 pl-4 text-sm font-medium leading-relaxed text-ink ${accentBorder[r.accent]}`}
                >
                  {r.verdict}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- STRATEGIES */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{strategies.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {strategies.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{strategies.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {strategies.items.map((s, idx) => (
              <Reveal key={s.name} i={idx % 3}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-coral text-white">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-tight text-paper-2">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-2/70">{s.desc}</p>
                  <p className="mt-4 border-l-2 border-coral pl-4 text-sm leading-relaxed text-paper-2/90">
                    <span className="kicker mb-1 block text-paper-2/50">The trade-off</span>
                    {s.tradeoff}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <div className="mt-10">
              <a
                href={strategies.crossref.href}
                className="group inline-flex items-center gap-1 text-sm font-semibold text-paper-2 transition-colors hover:text-coral"
              >
                <span className="link-sweep">{strategies.crossref.label}</span>
                <ExternalLink size={14} className="opacity-70" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ FIND INDUSTRY */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker={findIndustry.kicker}
            title={findIndustry.title}
            lead={findIndustry.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {findIndustry.steps.map((s, idx) => (
            <Reveal key={s.n} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <span className="font-display text-4xl leading-none text-coral">0{s.n}</span>
                <h3 className="mt-4 font-display text-lg leading-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-6">
            <ArrowLink href={findIndustry.crossref.href}>{findIndustry.crossref.label}</ArrowLink>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- ABROAD */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <Kicker>{abroad.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {abroad.title}
            </h2>
            <p className="mt-5 max-w-2xl text-ink-soft">{abroad.lead}</p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {abroad.items.map((v, idx) => (
              <Reveal key={v.country} i={idx % 3}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <p className="text-3xl" aria-hidden>{v.flag}</p>
                  <h3 className="mt-4 font-display text-lg leading-snug">{v.country}</h3>
                  <p className="kicker mt-1 text-coral">{v.visa}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{v.detail}</p>
                  <a
                    href={v.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-xs font-semibold text-ink link-sweep"
                  >
                    {v.source.label} ↗
                  </a>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal i={1}>
            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-soft">{abroad.note}</p>
            <p className="mt-5 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
              {abroad.point}
            </p>
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
              <ButtonLink href="/salary">See what each market pays</ButtonLink>
              <ButtonLink href="/apply" variant="outline">
                Find clients yourself
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
