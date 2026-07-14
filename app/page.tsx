import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import site from "@/data/site.json";
import stages from "@/data/stages.json";
import tracks from "@/data/tracks.json";
import doctrine from "@/data/doctrine.json";
import { Reveal } from "@/components/reveal";
import { PathChooser } from "@/components/path-chooser";
import { Icon } from "@/components/icon";
import {
  ArrowLink,
  ButtonLink,
  Kicker,
  Marquee,
  Pill,
  SectionHeading,
} from "@/components/ui";

const toolkit = [
  { title: "The Method", desc: "Six habits that make you self-sufficient: find, deconstruct, learn, vet, ask, unstick.", href: "/method", icon: "compass" },
  { title: "Micro-Tasks", desc: "Real jobs you can do today with no client. Each one finishes as a portfolio piece — proof, not promises.", href: "/tasks", icon: "target" },
  { title: "Build Labs", desc: "Learn the anatomy and the rules — then write your own resume, portfolio, and SOPs from a blank page.", href: "/build", icon: "pencil-ruler" },
  { title: "AI Leverage", desc: "Learn to write your own prompts, so you never need someone else's prompt library.", href: "/prompts", icon: "sparkles" },
  { title: "Learn Any Tool", desc: "The transferable method for mastering any software in a weekend, not a course.", href: "/tools", icon: "layout-grid" },
  { title: "Find Work", desc: "Source and vet opportunities yourself — search operators, red flags, your own pipeline.", href: "/apply", icon: "search" },
  { title: "30-Day Plan", desc: "A personalized, day-by-day path that turns all of it into daily reps.", href: "/plan", icon: "calendar-check" },
  { title: "Niche Rubric", desc: "A weighted rubric to evaluate any niche yourself. The 8 we list are just worked examples.", href: "/niches", icon: "layers" },
  { title: "How to Learn", desc: "What the evidence actually supports — and why the most popular study habits quietly fail you.", href: "/learn", icon: "brain" },
  { title: "Application Tracker", desc: "A working pipeline with a follow-up radar. Most offers are lost to silence, not rejection.", href: "/tracker", icon: "table" },
  { title: "Language Premium", desc: "A second language can double your rate. Which ones pay, and where to learn them free in PH.", href: "/languages", icon: "languages" },
];

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

export default function Home() {
  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-coral/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-emerald/10 blur-3xl"
        />
        <div className="container-x relative grid gap-12 pt-16 pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24 lg:pb-16">
          <div className="flex flex-col justify-center">
            <Reveal>
              <Kicker>Developing upwards · Free · Philippines</Kicker>
            </Reveal>
            <Reveal i={1}>
              <h1 className="mt-6 font-display text-[length:var(--text-hero)] leading-[var(--text-hero--line-height)] tracking-[-0.03em] text-balance">
                Build the online
                <br />
                career you{" "}
                <span className="relative whitespace-nowrap text-coral">
                  actually own
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 9C60 3 140 3 298 8"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
            </Reveal>
            <Reveal i={2}>
              <p className="mt-8 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                We hand out zero templates. Instead we teach you the anatomy, the
                rules, and the judgment — then{" "}
                <strong className="font-semibold text-ink">you build your own</strong>,
                from a blank page. Become a resourceful{" "}
                <strong className="font-semibold text-ink">online professional</strong>{" "}
                — not an assistant, a professional. Free, permanently.
              </p>
            </Reveal>
            <Reveal i={3}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/start">Start your path</ButtonLink>
                <ButtonLink href="/plan" variant="outline">
                  Build my 30-day plan
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal i={4}>
              <div className="mt-10 flex items-center gap-4 text-sm text-ink-soft">
                <div className="flex -space-x-2">
                  {["coral", "emerald", "amber", "indigo"].map((c) => (
                    <span
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 border-paper ${accentBar[c]}`}
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-ink">12,000+</strong> Filipinos already
                  started —{" "}
                  <span className="inline-flex items-center gap-0.5 align-middle">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className="fill-amber text-amber" />
                    ))}
                  </span>
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero visual — abstract "path" panel, no external images */}
          <Reveal i={2} className="relative">
            <HeroPanel />
          </Reveal>
        </div>

        {/* Stat row */}
        <div className="container-x">
          <Reveal i={1}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label} className="bg-paper-2 p-6">
                  <dt className="font-display text-4xl tracking-tight text-ink">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{s.label}</dd>
                  <dd className="text-xs text-ink-faint">{s.sub}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <div className="mt-16">
        <Marquee
          items={[
            "Bookkeeping",
            "Executive Ops",
            "Social Media",
            "Automation",
            "Customer Success",
            "Project Management",
            "Real Estate",
            "Creative & Content",
          ]}
        />
      </div>

      {/* ---------------------------------------------------- CHOOSE YOUR PATH */}
      <section id="path" className="container-x scroll-mt-24 py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <SectionHeading
              kicker="The one decision that changes everything"
              title={
                <>
                  Choose your path.
                  <br />
                  Then the depth unlocks.
                </>
              }
              lead={tracks.intro}
            />
          </Reveal>
          <Reveal i={1}>
            <div className="rounded-2xl border border-line bg-paper-2 p-6">
              <p className="text-sm leading-relaxed text-ink-soft">
                <Sparkles size={16} className="mb-1 inline text-coral" /> We keep
                the front calm on purpose. Everything is here — 1,000+ guides,
                tools, and templates — but it opens{" "}
                <strong className="text-ink">as you need it</strong>, tailored to
                the lane you pick. No overwhelm, no 40-tab rabbit holes.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal i={1} className="mt-10">
          <PathChooser redirectTo="/path" />
        </Reveal>
        <Reveal i={2} className="mt-6">
          <p className="text-center text-sm text-ink-faint">
            Not sure yet?{" "}
            <Link href="/niches" className="font-semibold text-ink link-sweep">
              Explore every niche
            </Link>{" "}
            or{" "}
            <Link href="/plan" className="font-semibold text-ink link-sweep">
              take the 5-question quiz
            </Link>
            .
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------- THE JOURNEY */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Four stages · nine steps"
              title="One clear line from zero to indispensable"
              lead="You never have to guess what's next. Each stage builds on the last."
              align="center"
              className="mx-auto"
            />
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {stages.map((st, idx) => (
              <Reveal key={st.id} i={idx}>
                <Link
                  href={st.href}
                  className="group flex h-full flex-col rounded-3xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl text-line-strong transition-colors group-hover:text-ink">
                      0{st.num}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${accentBar[st.accent]}`}
                    />
                  </div>
                  <p className={`mt-6 kicker ${accentText[st.accent]}`}>
                    {st.role}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-tight">
                    {st.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {st.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-xs font-medium text-ink-faint">
                      {st.steps}
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-ink transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- THE METHOD */}
      <section className="container-x py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <SectionHeading
              kicker={doctrine.kicker}
              title={doctrine.title}
              lead={doctrine.creed}
            />
            <div className="mt-8">
              <ButtonLink href="/method">Learn the method</ButtonLink>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {doctrine.methods.map((m, idx) => (
              <Reveal key={m.id} i={idx % 2}>
                <Link
                  href="/method"
                  className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-paper-2 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentBar[m.accent]} text-white`}
                  >
                    <Icon name={m.icon} size={18} />
                  </span>
                  <span>
                    <span className="block font-mono text-sm font-bold tracking-[0.14em] text-ink">
                      {m.name}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-ink-soft">
                      {m.tagline}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- TOOLKIT */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <SectionHeading
            kicker="Everything teaches. Nothing spoon-feeds."
            title="Workshops, not downloads"
            lead="There is no folder of files to grab here. Every section teaches you how the thing is built, hands you the rules, and then makes you build it yourself — so you can rebuild it anywhere, for anyone, forever."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {toolkit.map((t, idx) => (
            <Reveal key={t.href} i={idx % 3}>
              <Link
                href={t.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-paper-2 transition-colors group-hover:bg-coral">
                  <Icon name={t.icon} size={20} />
                </span>
                <h3 className="mt-5 font-display text-xl">{t.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {t.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Open
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ LANGUAGE PREMIUM */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink px-8 py-14 text-paper-2 lg:px-16 lg:py-20">
            <div aria-hidden className="absolute inset-0 dotgrid opacity-[0.06]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <Kicker className="text-paper-2/60">The rate multiplier</Kicker>
                <h2 className="mt-5 font-display text-[length:var(--text-h2)] leading-tight text-balance">
                  A second language can{" "}
                  <span className="text-coral">double your pay.</span>
                </h2>
                <p className="mt-5 max-w-lg text-paper-2/75">
                  Bilingual Filipino professionals earn ₱70k–₱90k/month in Japanese
                  roles. We show you exactly which languages pay most — and where to
                  learn them free, through TESDA and partner institutes.
                </p>
                <div className="mt-8">
                  <ButtonLink
                    href="/languages"
                    variant="primary"
                    className="bg-coral text-white hover:bg-white hover:!text-ink"
                  >
                    See the language premium
                  </ButtonLink>
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  { flag: "🇯🇵", name: "Japanese", pay: "₱70k–₱90k/mo" },
                  { flag: "🇰🇷", name: "Korean", pay: "₱50k+/mo" },
                  { flag: "🇨🇳", name: "Mandarin", pay: "Trade premium" },
                ].map((l) => (
                  <div
                    key={l.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                  >
                    <span className="flex items-center gap-3 font-display text-lg">
                      <span className="text-2xl">{l.flag}</span>
                      {l.name}
                    </span>
                    <span className="text-sm font-semibold text-coral">{l.pay}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------- THE STANDARD */}
      <section className="container-x pb-20 lg:pb-28">
        <div className="grid gap-12 rounded-[var(--radius-lg)] border border-line bg-paper-2 p-8 lg:grid-cols-[1fr_1fr] lg:p-14">
          <Reveal>
            <div className="flex flex-col justify-center">
              <Kicker>{site.standard.kicker}</Kicker>
              <h2 className="mt-5 font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
                {site.standard.title}
              </h2>
              <p className="mt-5 max-w-md text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                {site.standard.body}
              </p>
              <div className="mt-7">
                <ArrowLink href="/wins">See the outcomes it produces</ArrowLink>
              </div>
            </div>
          </Reveal>
          <div className="flex flex-col gap-3">
            {site.standard.principles.map((p, idx) => (
              <Reveal key={p.title} i={idx}>
                <div className="flex items-start gap-4 rounded-2xl border border-line bg-paper p-6">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2">
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-paper-3/70 px-6 py-16 text-center">
            <Pill tone="coral">
              <Sparkles size={13} /> 100% free, forever
            </Pill>
            <h2 className="mt-6 max-w-2xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
              You don&rsquo;t need to be perfect. You just need to start.
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/start">Take the first step</ButtonLink>
              <ButtonLink href="#path" variant="outline">
                Choose my path
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function HeroPanel() {
  const cards = [
    { n: "04", label: "Level Up", w: "w-[92%]", tone: "bg-indigo/10 text-indigo border-indigo/20" },
    { n: "03", label: "Deliver", w: "w-[84%]", tone: "bg-emerald/10 text-emerald border-emerald/20" },
    { n: "02", label: "Get Hired", w: "w-[76%]", tone: "bg-amber/10 text-[#9a6b00] border-amber/25" },
    { n: "01", label: "Start", w: "w-[68%]", tone: "bg-coral/10 text-coral-deep border-coral/20" },
  ];
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2 shadow-[var(--shadow-lg)] lg:aspect-auto lg:h-full">
      <div aria-hidden className="absolute inset-0 dotgrid opacity-60" />
      <div className="relative flex h-full flex-col justify-end gap-3 p-6">
        {cards.map((c, i) => (
          <div
            key={c.n}
            className={`flex items-center justify-between rounded-2xl border bg-paper-2/80 px-5 py-4 backdrop-blur-sm ${c.w} ${c.tone}`}
            style={{ marginLeft: `${i * 6}%` }}
          >
            <span className="font-display text-2xl">{c.n}</span>
            <span className="text-sm font-semibold">{c.label}</span>
          </div>
        ))}
        <div className="absolute right-6 top-6 rounded-2xl border border-line bg-ink px-4 py-3 text-paper-2">
          <p className="font-display text-3xl leading-none">₱0</p>
          <p className="text-[11px] text-paper-2/60">to begin</p>
        </div>
      </div>
    </div>
  );
}
