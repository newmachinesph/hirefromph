import type { Metadata } from "next";
import { Clock, ExternalLink } from "lucide-react";
import languagesData from "@/data/languages.json";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/languages",
  title: "Language Premium, A Second Language Can Double Your Pay",
  description: languagesData.intro,
});

type Language = (typeof languagesData.languages)[number];
type Tone = "coral" | "amber" | "indigo";

const premiumTone: Record<string, Tone> = {
  Highest: "coral",
  High: "amber",
  Moderate: "indigo",
};
const accentBar: Record<Tone, string> = {
  coral: "bg-coral",
  amber: "bg-amber",
  indigo: "bg-indigo",
};

function learnTone(type: string): "emerald" | "neutral" {
  return type.trim().toLowerCase().startsWith("free") ? "emerald" : "neutral";
}

export default function Page() {
  const [hero, ...rest] = languagesData.languages;

  return (
    <>
      {/* HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>The rate multiplier</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            A second language can{" "}
            <span className="text-coral">double your pay.</span>
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] text-ink-soft">
            {languagesData.intro}
          </p>
        </Reveal>
      </section>

      {/* LANGUAGES */}
      <section className="container-x pb-16 lg:pb-24">
        <Reveal>
          <SectionHeading
            kicker="Highest paying first"
            title="Which language pays the most"
            lead={languagesData.premiumNote}
          />
        </Reveal>

        <div className="mt-10">
          <Reveal>
            <LanguageCard language={hero} featured />
          </Reveal>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {rest.map((lang, idx) => (
            <Reveal key={lang.id} i={idx}>
              <LanguageCard language={lang} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW TO START */}
      <section className="bg-paper-3/60 py-16 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Four steps"
              title="How to start, this week"
              align="center"
              className="mx-auto"
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {languagesData.howto.map((h, idx) => (
              <Reveal key={h.step} i={idx}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-sm text-paper-2">
                    {idx + 1}
                  </span>
                  <h3 className="mt-5 font-display text-lg leading-tight">
                    {h.step}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {h.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CALLOUT, stack it on a niche */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink px-8 py-14 text-paper-2 lg:px-16 lg:py-16">
            <div aria-hidden className="absolute inset-0 dotgrid opacity-[0.06]" />
            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Kicker className="text-paper-2/60">The compounding move</Kicker>
                <h2 className="mt-4 max-w-xl font-display text-[length:var(--text-h3)] leading-tight text-balance">
                  Stack a language on your niche for the biggest jump.
                </h2>
                <p className="mt-3 max-w-lg text-paper-2/75">
                  A premium language plus a specialized niche is where
                  Filipino online professionals see the largest rate
                  increases, not either alone.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <ButtonLink
                  href="/level-up"
                  className="bg-coral text-white hover:bg-white hover:!text-ink"
                >
                  See Level Up
                </ButtonLink>
                <ButtonLink href="/niches" variant="outline">
                  Explore niches
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function LanguageCard({
  language,
  featured = false,
}: {
  language: Language;
  featured?: boolean;
}) {
  const tone = premiumTone[language.premium] ?? "indigo";
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        featured ? "p-8 lg:p-12" : "p-7",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span aria-hidden className={featured ? "text-6xl" : "text-4xl"}>
            {language.flag}
          </span>
          <div>
            <h3
              className={cn(
                "font-display leading-tight",
                featured ? "text-3xl lg:text-4xl" : "text-xl",
              )}
            >
              {language.name}
            </h3>
            <div className="mt-2">
              <PremiumMeter score={language.premiumScore} tone={tone} />
            </div>
          </div>
        </div>
        <Pill tone={tone}>{language.premium}</Pill>
      </div>

      <p
        className={cn(
          "mt-5 font-semibold text-ink",
          featured ? "text-xl" : "text-base",
        )}
      >
        {language.payNote}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {language.why}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {language.roles.map((role) => (
          <span
            key={role}
            className="rounded-full bg-paper-3 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
          >
            {role}
          </span>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ink-faint">
        <Clock size={13} aria-hidden /> {language.effort}
      </p>

      <div className="mt-6 border-t border-line pt-5">
        <p className="kicker mb-1">Where to learn, free &amp; paid</p>
        <ul>
          {language.learn.map((school) => (
            <li
              key={school.name}
              className="flex flex-col gap-1.5 border-t border-line py-4 first:border-t-0 first:pt-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">{school.name}</span>
                <Pill tone={learnTone(school.type)}>{school.type}</Pill>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                {school.detail}
              </p>
              {school.url !== "#" && (
                <a
                  href={school.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1 text-sm font-semibold text-ink hover:text-coral"
                >
                  Visit site
                  <ExternalLink
                    size={13}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PremiumMeter({ score, tone }: { score: number; tone: Tone }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Premium score ${score} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full",
            i < score ? accentBar[tone] : "bg-line",
          )}
        />
      ))}
    </div>
  );
}
