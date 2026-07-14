import { ExternalLink, Check, X } from "lucide-react";
import clients from "@/data/clients.json";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, Kicker, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Own Your Clients",
  description:
    "Build a business of one. The independent-contractor mindset vs the employee mindset, a fair look at agency vs direct clients, the step-by-step way to land direct clients, and how to protect yourself like a real business.",
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

export default function ClientsPage() {
  const { hero, mindset, roads, getDirect, protect, closing } = clients;

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

      {/* ------------------------------------------------------------ MINDSET */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading kicker={mindset.kicker} title={mindset.title} lead={mindset.lead} />
          </Reveal>

          <Reveal i={1}>
            <div className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2">
              <div className="hidden grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-paper-3/70 sm:grid">
                <span className="p-4 kicker text-ink-faint">Dimension</span>
                <span className="p-4 kicker text-ink-faint">Employee</span>
                <span className="p-4 kicker text-emerald">Independent contractor</span>
              </div>
              <ul className="divide-y divide-line">
                {mindset.rows.map((r) => (
                  <li key={r.dimension} className="grid gap-2 p-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-0 sm:p-0">
                    <span className="font-display text-base leading-snug text-ink sm:p-4">
                      {r.dimension}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-faint sm:p-4">
                      <span className="kicker mr-2 text-ink-faint sm:hidden">Employee ·</span>
                      {r.employee}
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-ink sm:bg-emerald-tint/40 sm:p-4">
                      <span className="kicker mr-2 text-emerald sm:hidden">Contractor ·</span>
                      {r.contractor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal i={2}>
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald/30 bg-emerald-tint p-6">
              <p className="max-w-3xl text-sm font-medium leading-relaxed text-ink">
                {mindset.note}
              </p>
              <Source label={mindset.source.label} url={mindset.source.url} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- ROADS */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={roads.kicker} title={roads.title} lead={roads.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {[roads.agency, roads.direct].map((road, i) => (
            <Reveal key={road.title} i={i}>
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
                <h3 className="font-display text-[length:var(--text-h3)] leading-tight">
                  {road.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{road.blurb}</p>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="kicker text-emerald">Pros</p>
                  <ul className="flex flex-col gap-2.5">
                    {road.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                        <Check size={16} className="mt-0.5 shrink-0 text-emerald" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="kicker text-coral-deep">Cons</p>
                  <ul className="flex flex-col gap-2.5">
                    {road.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                        <X size={16} className="mt-0.5 shrink-0 text-coral" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <p className="mt-8 max-w-3xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            {roads.verdict}
          </p>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- GET DIRECT */}
      <section className="bg-ink py-20 text-paper-2 lg:py-28">
        <div className="container-x">
          <Reveal>
            <Kicker className="text-paper-2/60">{getDirect.kicker}</Kicker>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              {getDirect.title}
            </h2>
            <p className="mt-5 max-w-2xl text-paper-2/70">{getDirect.lead}</p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {getDirect.steps.map(
              (
                s: { title: string; how: string; crossref?: { href: string; label: string } },
                idx: number,
              ) => (
                <Reveal key={s.title} i={idx % 2}>
                  <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <span className="font-display text-3xl leading-none text-coral">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg leading-tight text-paper-2">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-paper-2/70">{s.how}</p>
                      {s.crossref && (
                        <a
                          href={s.crossref.href}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-coral transition-colors hover:text-paper-2"
                        >
                          <span className="link-sweep">{s.crossref.label}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>

          <Reveal i={1}>
            <p className="mt-10 max-w-3xl border-l-2 border-emerald pl-5 text-sm font-medium leading-relaxed text-paper-2/90">
              {getDirect.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ PROTECT */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading kicker={protect.kicker} title={protect.title} lead={protect.lead} />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {protect.items.map((it, idx) => (
            <Reveal key={it.title} i={idx % 2}>
              <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 lg:p-7">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={it.icon} size={20} />
                  </span>
                  <h3 className="font-display text-lg leading-tight">{it.title}</h3>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
                {it.source && (
                  <div className="mt-5 border-t border-line pt-4">
                    <Source label={it.source.label} url={it.source.url} />
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal i={1}>
          <div className="mt-6">
            <ArrowLink href={protect.crossref.href}>{protect.crossref.label}</ArrowLink>
          </div>
        </Reveal>
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

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {closing.links.map((l, idx) => (
                <Reveal key={l.href} i={idx % 2}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6">
                    <ArrowLink href={l.href}>{l.label}</ArrowLink>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/apply">Find clients yourself</ButtonLink>
              <ButtonLink href="/tracker" variant="outline">
                Build your pipeline
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
