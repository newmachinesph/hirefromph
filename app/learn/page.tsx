import type { Metadata } from "next";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import learning from "@/data/learning.json";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { StudyProtocol } from "@/components/study-protocol";
import { ButtonLink, Kicker, Pill, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  path: "/learn",
  title: "How to Learn",
  description: learning.intro,
});

type Work = {
  id: string;
  name: string;
  what: string;
  why: string;
  how: string;
  effort: string;
  payoff: string;
  icon: string;
  accent: string;
};
type FeelsGoodItem = {
  id: string;
  habit: string;
  whyItFeelsGood: string;
  whyItFails: string;
  doInstead: string;
};
type FocusItem = {
  name: string;
  what: string;
  howTo: string;
  bestFor: string;
  watchOut: string;
};

const accentText: Record<string, string> = {
  coral: "text-coral",
  emerald: "text-emerald",
  amber: "text-[#9a6b00]",
  indigo: "text-indigo",
};
const accentSoft: Record<string, string> = {
  coral: "bg-coral-tint text-coral-deep",
  emerald: "bg-emerald-tint text-emerald",
  amber: "bg-[#fdf3d9] text-[#9a6b00]",
  indigo: "bg-[#e9e9fd] text-indigo",
};

const FEATURED_IDS = ["retrieval-practice", "spaced-repetition"];
const works = learning.works as Work[];
const featuredWorks = works.filter((w) => FEATURED_IDS.includes(w.id));
const restWorks = works.filter((w) => !FEATURED_IDS.includes(w.id));

export default function LearnPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-coral/10 blur-3xl"
        />
        <div className="container-x relative pt-14 pb-10 lg:pt-20">
          <Reveal>
            <Kicker>{learning.kicker}</Kicker>
          </Reveal>
          <Reveal i={1}>
            <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              {learning.headline}
            </h1>
          </Reveal>
          <Reveal i={2}>
            <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
              {learning.intro}
            </p>
          </Reveal>
          <Reveal i={3}>
            <div className="mt-8 max-w-2xl rounded-2xl border border-line-strong bg-ink px-6 py-5 text-paper-2">
              <p className="font-display text-lg leading-snug text-balance">
                {learning.creed}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- MYTH, KILLED FIRST */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Killed first, on purpose"
            title="The myth we're not going to let slide"
            lead="This is the clearest worked example of the VET method on the whole platform: a belief that's popular, intuitive, and wrong. Debunking it up front is what earns the rest of this page its credibility."
          />
        </Reveal>
        <Reveal i={1} className="mt-10">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink px-7 py-12 text-paper-2 lg:px-14 lg:py-16">
            <div aria-hidden className="absolute inset-0 dotgrid opacity-[0.06]" />
            <div className="relative">
              <Pill tone="coral">
                <X size={13} /> Myth
              </Pill>
              <p className="mt-6 max-w-3xl font-display text-2xl leading-snug text-balance text-paper-2/55 decoration-coral decoration-4 line-through lg:text-3xl">
                {learning.myth.claim}
              </p>

              <div className="mt-10 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-3">
                <div>
                  <p className="kicker text-paper-2/45">
                    Why people believe it
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-paper-2/75">
                    {learning.myth.whyPeopleBelieveIt}
                  </p>
                </div>
                <div>
                  <p className="kicker text-emerald">
                    What the evidence says
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-paper-2/90">
                    {learning.myth.whatTheEvidenceSays}
                  </p>
                </div>
                <div>
                  <p className="kicker text-paper-2/45">Do this instead</p>
                  <p className="mt-3 text-sm leading-relaxed text-paper-2/75">
                    {learning.myth.whatToDoInstead}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex items-start gap-4 rounded-2xl border border-coral/30 bg-coral/10 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral text-white">
                  <Icon name="shield-check" size={18} />
                </span>
                <div>
                  <p className="kicker text-coral">VET lesson, who profits?</p>
                  <p className="mt-2 text-sm leading-relaxed text-paper-2">
                    {learning.myth.vetLesson}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------- WHAT ACTUALLY WORKS */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="The curriculum"
            title="What actually works"
            lead="Eight techniques with real evidence behind them, not tips, findings. The first two carry the most weight in the research, so lean on them the hardest."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {featuredWorks.map((w, idx) => (
            <Reveal key={w.id} i={idx}>
              <FeaturedWorkCard work={w} />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restWorks.map((w, idx) => (
            <Reveal key={w.id} i={idx % 3}>
              <CompactWorkCard work={w} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ FEELS PRODUCTIVE, ISN'T */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="The self-deception is the point"
              title="What feels productive but isn't"
              lead="Every habit below feels like studying while you're doing it. That feeling is exactly why it survives, it's comfortable, and comfort is not evidence."
            />
          </Reveal>
          <div className="mt-10 flex flex-col gap-4">
            {(learning.feelsGood as FeelsGoodItem[]).map((item, idx) => (
              <Reveal key={item.id} i={idx % 4}>
                <div className="grid overflow-hidden rounded-2xl border border-line lg:grid-cols-2">
                  <div className="bg-coral-tint p-6">
                    <div className="flex items-center gap-2">
                      <X size={16} className="shrink-0 text-coral" />
                      <p className="font-display text-lg leading-tight text-coral-deep text-balance">
                        {item.habit}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink">
                      <span className="font-semibold">
                        Feels like progress:{" "}
                      </span>
                      {item.whyItFeelsGood}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      <span className="font-semibold">Why it fails: </span>
                      {item.whyItFails}
                    </p>
                  </div>
                  <div className="bg-emerald-tint p-6">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="shrink-0 text-emerald" />
                      <p className="font-display text-lg leading-tight text-emerald">
                        Do this instead
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink">
                      {item.doInstead}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- FOCUS SYSTEMS */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="A different job entirely"
            title="Focus systems, not learning methods"
            lead="Everything above builds knowledge. Everything below manages your attention and your clock. Confusing the two is the most common mistake on this page's topic, pair one system from here with a few techniques from above, and you have a real session."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {(learning.focus as FocusItem[]).map((f, idx) => (
            <Reveal key={f.name} i={idx % 4}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                <h3 className="font-display text-xl leading-tight">
                  {f.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {f.what}
                </p>
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line-strong bg-paper-3/60 px-4 py-3">
                  <ArrowRight
                    size={15}
                    className="mt-0.5 shrink-0 text-indigo"
                  />
                  <p className="text-sm leading-relaxed text-ink">
                    <span className="font-semibold">How: </span>
                    {f.howTo}
                  </p>
                </div>
                <p className="mt-3 text-xs font-medium text-ink-faint">
                  <span className="text-ink">Best for: </span>
                  {f.bestFor}
                </p>
                <div className="mt-4 flex items-start gap-2 border-t border-line pt-4">
                  <Icon
                    name="alert-triangle"
                    size={14}
                    className="mt-0.5 shrink-0 text-[#9a6b00]"
                  />
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {f.watchOut}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- PROTOCOL BUILDER */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Build it yourself, from your own constraints"
              title="Your study protocol"
              lead={learning.protocol.intro}
              align="center"
              className="mx-auto"
            />
          </Reveal>
          <Reveal i={1} className="mt-12">
            <StudyProtocol />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- CLOSE */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="coral">
              <Sparkles size={13} /> Evidence, not vibes
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              Now go apply it to real work.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              A technique changes nothing until you run it on something real.
              The method page covers how to teach yourself any skill, the
              task board is where you put retrieval, spacing, and feedback to
              work today.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/method">See the full method</ButtonLink>
              <ButtonLink href="/tasks" variant="outline">
                Try the task board
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function FeaturedWorkCard({ work }: { work: Work }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-paper-2 p-7 lg:p-8">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
            accentSoft[work.accent],
          )}
        >
          <Icon name={work.icon} size={24} />
        </span>
        <div>
          <p className={cn("kicker", accentText[work.accent])}>
            Strongest evidence
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight">
            {work.name}
          </h3>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink">{work.what}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{work.why}</p>
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line-strong bg-paper-3/60 px-4 py-3">
        <ArrowRight
          size={15}
          className={cn("mt-0.5 shrink-0", accentText[work.accent])}
        />
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-semibold">How: </span>
          {work.how}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5 text-xs font-semibold">
        <span className="rounded-full border border-line-strong bg-paper-3 px-3 py-1 text-ink-soft">
          Effort: {work.effort}
        </span>
        <span
          className={cn(
            "rounded-full border px-3 py-1",
            accentSoft[work.accent],
          )}
        >
          Payoff: {work.payoff}
        </span>
      </div>
    </div>
  );
}

function CompactWorkCard({ work }: { work: Work }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl",
          accentSoft[work.accent],
        )}
      >
        <Icon name={work.icon} size={19} />
      </span>
      <h3 className="mt-4 font-display text-lg leading-tight">{work.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {work.what}
      </p>
      <p className="mt-3 flex-1 text-xs leading-relaxed text-ink-faint">
        {work.how}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[0.7rem] font-semibold text-ink-faint">
        <span>Effort: {work.effort}</span>
        <span aria-hidden>·</span>
        <span>Payoff: {work.payoff}</span>
      </div>
    </div>
  );
}
