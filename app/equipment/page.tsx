import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import equipment from "@/data/equipment.json";
import frameworks from "@/data/frameworks.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { EquipmentChecker } from "@/components/equipment-checker";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/meta";

const SPEC_ICON_TONE = [
  "bg-coral-tint text-coral-deep",
  "bg-emerald-tint text-emerald",
  "bg-amber-tint text-amber-text",
  "bg-indigo-tint text-indigo",
];

export const metadata: Metadata = pageMeta({
  path: "/equipment",
  title: "Equipment Guide 2026",
  description: equipment.intro,
});

export default function EquipmentPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Equipment Guide 2026</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Get prepared, not perfect.
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {equipment.intro}
          </p>
        </Reveal>
        <Reveal i={3}>
          <blockquote className="mt-9 max-w-2xl rounded-2xl border border-line bg-paper-2 p-6">
            <p className="font-display text-xl leading-snug text-ink text-balance">
              &ldquo;{equipment.creed}&rdquo;
            </p>
          </blockquote>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- CHECKER */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Check what you have"
            title="Your setup, mapped to real ₱ prices"
            lead="Tick off what you already own, pick a tier for the rest, and watch your readiness, and your budget, update live."
          />
        </Reveal>
        <div className="mt-10">
          <EquipmentChecker categories={equipment.categories} />
        </div>
      </section>

      {/* ------------------------------------------------- WHAT ACTUALLY MATTERS */}
      <section className="border-y border-line bg-paper-3/60 py-14 lg:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Spec literacy"
              title="What actually matters"
              lead={frameworks.equipment.intro}
            />
          </Reveal>
          <Reveal i={1}>
            <blockquote className="mt-8 max-w-2xl rounded-2xl border border-line bg-paper-2 p-6">
              <p className="font-display text-xl leading-snug text-ink text-balance">
                &ldquo;{frameworks.equipment.creed}&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {frameworks.equipment.whatMatters.map((w, idx) => (
              <Reveal key={w.spec} i={idx % 2}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                        SPEC_ICON_TONE[idx % 4],
                      )}
                    >
                      <Icon name={w.icon} size={20} />
                    </span>
                    <h3 className="font-display text-lg leading-tight">
                      {w.spec}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    {w.whatMattersAndWhy}
                  </p>
                  <div className="mt-4 rounded-xl border border-line bg-paper p-4">
                    <p className="kicker">How to judge it</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink">
                      {w.howToJudge}
                    </p>
                  </div>
                  <div className="mt-3 rounded-xl border border-coral/25 bg-coral-tint/40 p-4">
                    <p className="kicker text-coral-deep">Don&rsquo;t overpay for</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink">
                      {w.dontOverpayFor}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- BUYING SMART */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="Buying smart"
            title="Buy secondhand safely, upgrade without regret"
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {frameworks.equipment.buyingSmart.map((b, idx) => (
            <Reveal key={b.title} i={idx % 2}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                  <Icon name={b.icon} size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg leading-tight">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {b.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- BUILDS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Three ways to start"
            title="Pick a build that fits your budget"
            lead={frameworks.equipment.referenceNote}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {equipment.builds.map((build, idx) => (
            <Reveal key={build.name} i={idx}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <h3 className="font-display text-xl">{build.name}</h3>
                <p className="mt-1 font-display text-3xl text-coral">
                  {build.total}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {build.desc}
                </p>
                <p className="mt-4 border-t border-line pt-4 text-xs font-medium text-ink-faint">
                  {build.for}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- CLOSE */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="emerald">
              <Sparkles size={13} /> Prepared beats perfect
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              Gear sorted. Now go build the career.
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/start">Start your path</ButtonLink>
              <ButtonLink href="/apply" variant="outline">
                Where to apply
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
