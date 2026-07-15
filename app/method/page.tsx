import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Check, Sparkles, X } from "lucide-react";
import doctrine from "@/data/doctrine.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { SelfAudit } from "@/components/self-audit";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Method, we teach you to build it",
  description:
    "We don't give you the file. We teach you to build it. Six principles, seven methods, and a self-audit, the resourcefulness curriculum behind everything on this platform.",
};

const accentText: Record<string, string> = {
  coral: "text-coral",
  amber: "text-[#9a6b00]",
  emerald: "text-emerald",
  indigo: "text-indigo",
};
const accentBar: Record<string, string> = {
  coral: "bg-coral",
  amber: "bg-amber",
  emerald: "bg-emerald",
  indigo: "bg-indigo",
};
const accentSoft: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep border-coral/20",
  amber: "bg-[#fdf3d9] text-[#9a6b00] border-amber/25",
  emerald: "bg-emerald-tint text-emerald border-emerald/20",
  indigo: "bg-[#e9e9fd] text-indigo border-indigo/20",
};

/** Turn *word* markers from JSON copy into an emphasized inline span. */
function withEmphasis(text: string): ReactNode[] {
  return text.split(/\*(.+?)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="not-italic font-semibold text-white">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

const principleAccents = ["coral", "indigo", "emerald", "amber", "indigo", "coral"];
const principleSpans = [
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-6",
];

const [titleLead, titleMain] = doctrine.title.split(". ");

export default function MethodPage() {
  return (
    <>
      {/* ------------------------------------------------------ MANIFESTO HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-8%] h-[480px] w-[480px] rounded-full bg-coral/10 blur-3xl"
        />
        <div className="container-x relative pt-16 pb-4 lg:pt-24">
          <Reveal>
            <Kicker>{doctrine.kicker}</Kicker>
          </Reveal>
          <Reveal i={1}>
            <h1 className="mt-6 max-w-4xl text-balance">
              <span className="block font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-ink-faint">
                {titleLead}.
              </span>
              <span className="block font-display text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)] tracking-[-0.03em] text-ink">
                {titleMain.replace(" build it.", " ")}
                <span className="text-coral">build it.</span>
              </span>
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-8 max-w-2xl font-display text-2xl leading-snug text-ink-soft text-balance lg:text-[1.7rem]">
              {doctrine.creed}
            </p>
          </Reveal>
        </div>

        <div className="container-x pt-14 pb-20 lg:pb-28">
          <Reveal i={1}>
            <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-line lg:grid-cols-2">
              <div className="bg-paper-2 p-8 lg:p-12">
                <p className="kicker">The promise</p>
                <p className="mt-4 font-display text-xl leading-snug text-ink text-balance lg:text-2xl">
                  {doctrine.promise}
                </p>
              </div>
              <div className="bg-ink p-8 text-paper-2 lg:p-12">
                <p className="kicker text-paper-2/50">Why it matters</p>
                <p className="mt-4 font-display text-xl leading-snug text-balance lg:text-2xl">
                  {withEmphasis(doctrine.whyItMatters)}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- LAWS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Six laws"
            title="The rules that make everything else make sense"
            lead="Not tips. Not suggestions. Every page on this platform obeys these six."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {doctrine.principles.map((p, idx) => (
            <Reveal key={p.n} i={idx % 4} className={principleSpans[idx]}>
              <PrincipleCard
                principle={p}
                accent={principleAccents[idx]}
                dark={idx === 5}
                lead={idx === 0}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- METHODS */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The curriculum"
              title="Seven methods. Master these and you're never stuck."
              lead="This is the actual skill this platform teaches, not a niche, not a tool, but how to figure anything out. Read each one, then run the drill."
            />
          </Reveal>

          <div className="mt-14">
            {doctrine.methods.map((m, idx) => (
              <MethodBlock key={m.id} method={m} index={idx} first={idx === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- ANTI-PATTERNS */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="Unlearn these"
            title={doctrine.antiPatterns.title}
            lead={doctrine.antiPatterns.intro}
          />
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2">
          <div className="grid grid-cols-1 gap-x-8 gap-y-0 border-b border-line px-6 py-4 text-xs font-semibold tracking-wide text-ink-faint sm:grid-cols-2 lg:px-8">
            <span className="uppercase">Spoon-fed habit</span>
            <span className="hidden uppercase sm:block">Resourceful move</span>
          </div>
          <div className="divide-y divide-line">
            {doctrine.antiPatterns.items.map((item, idx) => (
              <Reveal key={item.bad} i={idx % 4}>
                <div className="grid gap-3 p-6 sm:grid-cols-2 sm:gap-6 lg:p-8">
                  <div className="flex items-start gap-3">
                    <X
                      size={16}
                      className="mt-1 shrink-0 text-coral"
                      aria-hidden
                    />
                    <p className="text-ink-soft line-through decoration-coral/50 decoration-2">
                      {item.bad}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check
                      size={16}
                      className="mt-1 shrink-0 text-emerald"
                      aria-hidden
                    />
                    <p className="font-medium text-ink">{item.good}</p>
                  </div>
                  <p className="text-sm italic text-ink-faint sm:col-span-2">
                    {item.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- SELF-AUDIT */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Check yourself"
              title={doctrine.selfAudit.title}
              lead={doctrine.selfAudit.intro}
            />
          </Reveal>
          <Reveal i={1} className="mt-12">
            <SelfAudit
              statements={doctrine.selfAudit.statements}
              levels={doctrine.selfAudit.levels}
            />
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="coral">
              <Sparkles size={13} /> The method, applied
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              Now build something from a blank page.
            </h2>
            <p className="mt-4 max-w-xl text-ink-soft">
              Reading the method changes nothing by itself. The labs are where
              you actually use it.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/build">Open the build labs</ButtonLink>
              <ButtonLink href="/start" variant="outline">
                Start your path
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

type Principle = {
  n: number;
  title: string;
  desc: string;
  icon: string;
};

function PrincipleCard({
  principle,
  accent,
  dark,
  lead,
}: {
  principle: Principle;
  accent: string;
  dark: boolean;
  lead: boolean;
}) {
  if (dark) {
    return (
      <div className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-ink p-7 text-paper-2 sm:flex-row sm:items-center lg:p-9">
        <div className="flex items-center gap-5">
          <span className="font-display text-5xl text-paper-2/25">
            0{principle.n}
          </span>
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10",
              accentText[accent],
            )}
          >
            <Icon name={principle.icon} size={22} />
          </span>
        </div>
        <div className="sm:max-w-xl">
          <h3 className="font-display text-xl leading-tight text-balance lg:text-2xl">
            {principle.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-paper-2/70">
            {principle.desc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        lead && "lg:p-9",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-display text-line-strong",
            lead ? "text-7xl" : "text-5xl",
          )}
        >
          0{principle.n}
        </span>
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
            accentSoft[accent],
          )}
        >
          <Icon name={principle.icon} size={20} />
        </span>
      </div>
      <h3
        className={cn(
          "mt-5 font-display leading-tight text-balance",
          lead ? "text-2xl lg:text-3xl" : "text-lg",
        )}
      >
        {principle.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {principle.desc}
      </p>
    </div>
  );
}

type Method = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  summary: string;
  steps: { title: string; desc: string }[];
  drill: string;
};

function MethodBlock({
  method,
  index,
  first,
}: {
  method: Method;
  index: number;
  first: boolean;
}) {
  return (
    <Reveal i={index % 3} as="article">
      <div
        className={cn(
          "grid gap-8 border-line py-14 lg:grid-cols-[280px_1fr] lg:gap-14 lg:py-16",
          !first && "border-t",
        )}
      >
        <div>
          <span className={cn("kicker", accentText[method.accent])}>
            Method 0{index + 1}
          </span>
          <h3 className="mt-3 font-display text-2xl leading-[1.05] tracking-tight text-balance sm:text-3xl">
            {method.name}
          </h3>
          <p className="mt-3 text-sm font-medium text-ink-soft">
            {method.tagline}
          </p>
          <span
            className={cn(
              "mt-6 inline-grid h-12 w-12 place-items-center rounded-xl border",
              accentSoft[method.accent],
            )}
          >
            <Icon name={method.icon} size={22} />
          </span>
          <span
            aria-hidden
            className={cn("mt-6 hidden h-1 w-16 rounded-full lg:block", accentBar[method.accent])}
          />
        </div>

        <div>
          <p className="font-display text-lg leading-relaxed text-ink text-balance lg:text-xl">
            {method.summary}
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {method.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-line bg-paper-2 p-5"
              >
                <span className="font-display text-2xl text-line-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-2 font-semibold leading-snug text-ink">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>

          <div
            className={cn(
              "mt-6 rounded-2xl border p-6",
              accentSoft[method.accent],
            )}
          >
            <p className="font-mono text-[0.72rem] tracking-[0.22em] uppercase opacity-70">
              Do this now
            </p>
            <p className="mt-2 font-display text-lg leading-snug text-balance">
              {method.drill}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
