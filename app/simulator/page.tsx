import { ExternalLink, TriangleAlert } from "lucide-react";
import sim from "@/data/simulator.json";
import { CareerSimulator } from "@/components/career-simulator";
import { Reveal } from "@/components/reveal";
import { ArrowLink, ButtonLink, PageHero, Pill, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/simulator",
  title: "Career Simulator",
  description:
    "Time does not raise your rate. Set your craft, your AI, and what you sell, then watch 36 months of a generic task-taker and 36 months of a specialist diverge. A model, not a prediction, with every assumption tagged.",
});

function Source({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-coral"
    >
      Source: {label}
      <ExternalLink size={11} aria-hidden className="opacity-60" />
    </a>
  );
}

export default function SimulatorPage() {
  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <PageHero
        kicker={sim.hero.kicker}
        titleWidth="max-w-4xl"
        title={
          <>
            {sim.hero.titleLine1}
            <br />
            {sim.hero.titleLine2}
          </>
        }
        lead={sim.hero.lead}
      >
        <Reveal i={3}>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {sim.intro}
          </p>
        </Reveal>
      </PageHero>

      {/* ----------------------------------------------------- MODEL BANNER */}
      <section className="container-x pb-10">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border-2 border-amber bg-amber-tint p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <TriangleAlert
                size={20}
                aria-hidden
                className="mt-0.5 shrink-0 text-amber-text"
              />
              <div className="min-w-0">
                <h2 className="font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
                  {sim.banner.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">
                  {sim.banner.body}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------- DATA HONESTY */}
      <section className="container-x pb-14">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-8 lg:p-10">
            <Pill tone="neutral">Vendor-grade, not survey-grade</Pill>
            <h2 className="mt-5 max-w-3xl font-display text-[length:var(--text-h3)] leading-snug text-balance">
              {sim.dataHonesty.title}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
              {sim.dataHonesty.body}
            </p>
            <p className="mt-4 max-w-3xl border-l-2 border-coral pl-5 text-sm leading-relaxed text-ink">
              {sim.dataHonesty.disagreement}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              {sim.dataHonesty.sources.map((s) => (
                <Source key={s.url} label={s.label} url={s.url} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------- SIMULATOR */}
      <section className="container-x pb-20 lg:pb-24">
        <Reveal>
          <CareerSimulator />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ OUTRO */}
      <section className="bg-ink py-20 text-paper-2 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Where this goes next"
              title={sim.outro.title}
              className="[&_h2]:text-paper-2"
            />
          </Reveal>
          <Reveal i={1}>
            <p className="mt-5 max-w-2xl text-paper-2/70">{sim.outro.body}</p>
          </Reveal>
          <Reveal i={2}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/reality" variant="outline" className="border-paper-2/30 bg-transparent text-paper-2 hover:border-paper-2">
                {sim.outro.realityLabel}
              </ButtonLink>
              <ArrowLink href="/niches" className="text-paper-2 hover:text-coral">
                {sim.outro.nichesLabel}
              </ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
