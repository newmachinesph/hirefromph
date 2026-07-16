import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import site from "@/data/site.json";
import stages from "@/data/stages.json";
import roadmap from "@/data/roadmap.json";
import tracks from "@/data/tracks.json";
import doctrine from "@/data/doctrine.json";
import { Reveal } from "@/components/reveal";
import { JourneyProgress } from "@/components/journey-progress";
import { PathChooser } from "@/components/path-chooser";
import { Icon } from "@/components/icon";
import {
  ArrowLink,
  ButtonLink,
  Kicker,
  Pill,
  SectionHeading,
} from "@/components/ui";

const toolkit = [
  { title: "Reality Check", desc: "What this career actually pays, what AI is really doing to it, and the numbers most sources leave out. Every claim sourced.", href: "/reality", icon: "scan-eye" },
  { title: "AI-First", desc: "Every role runs on AI now. Coding agents, open-source models, AI image and video, folded into your craft, not pasted from a prompt library.", href: "/ai-first", icon: "cpu" },
  { title: "Become Indispensable", desc: "How to be layoff-proof and the one clients fight to keep. The kinds of intelligence AI can't copy: creative, emotional, judgment, taste.", href: "/indispensable", icon: "gem" },
  { title: "Career Simulator", desc: "Model the next three years. Watch what happens to the person who stays generic, and to the one who doesn't.", href: "/simulator", icon: "trending-up" },
  { title: "English at Work", desc: "Your English is fine. The habits that make it read as junior are the fixable part, audit a real message you sent.", href: "/english", icon: "message-square" },
  { title: "Conduct & Integrity", desc: "What actually gets remote professionals fired, sued, and delisted, and an oath you write yourself.", href: "/conduct", icon: "shield-check" },
  { title: "The Method", desc: "Seven habits that make you self-sufficient: find, deconstruct, learn, vet, ask, unstick, give.", href: "/method", icon: "compass" },
  { title: "Micro-Tasks", desc: "Real jobs you can do today with no client. Each one finishes as a portfolio piece, proof, not promises.", href: "/tasks", icon: "target" },
  { title: "Build Labs", desc: "Learn the anatomy and the rules, then write your own resume, portfolio, and SOPs from a blank page.", href: "/build", icon: "pencil-ruler" },
  { title: "AI Leverage", desc: "Learn to write your own prompts, so you never need someone else's prompt library.", href: "/prompts", icon: "sparkles" },
  { title: "Learn Any Tool", desc: "The transferable method for mastering any software in a weekend, not a course.", href: "/tools", icon: "layout-grid" },
  { title: "Find Work", desc: "Source and vet opportunities yourself, search operators, red flags, your own pipeline.", href: "/apply", icon: "search" },
  { title: "Interview Prep", desc: "The STAR method, the questions you'll face, questions to ask them, and the red flags of a scam interview. Build your own answers.", href: "/interview", icon: "message-square" },
  { title: "Own Your Clients", desc: "Agency or direct? A fair look at both, and the step-by-step way to land direct clients you actually keep.", href: "/clients", icon: "handshake" },
  { title: "Salary Guide", desc: "What online work really pays, the roles clients are hiring for now, full-time vs hourly vs retainer, and how to price yourself. No hype.", href: "/salary", icon: "wallet" },
  { title: "Client Markets", desc: "US vs UK/EU vs Australia and beyond: pay, culture, industries, and the timezone and overlap-hours math for your UTC+8 life.", href: "/markets", icon: "globe" },
  { title: "The Resource Shelf", desc: "A curated shelf of real courses, docs, and channels that move the needle, plus how to judge any course before it takes your week.", href: "/resources", icon: "library" },
  { title: "30-Day Plan", desc: "A personalized, day-by-day path that turns all of it into daily reps.", href: "/plan", icon: "calendar-check" },
  { title: "Niche Rubric", desc: "A weighted rubric to evaluate any niche yourself. The 12 we list, including new lanes like medical VA and streaming, are worked examples.", href: "/niches", icon: "layers" },
  { title: "How to Learn", desc: "What the evidence actually supports, and why the most popular study habits quietly fail you.", href: "/learn", icon: "brain" },
  { title: "Application Tracker", desc: "A working pipeline with a follow-up radar. Most offers are lost to silence, not rejection.", href: "/tracker", icon: "table" },
  { title: "Language Premium", desc: "A second language can double your rate. Which ones pay, and where to learn them free in PH.", href: "/languages", icon: "languages" },
];

const accentText: Record<string, string> = {
  coral: "text-coral",
  amber: "text-amber-text",
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
              <Kicker>Developing upwards · Philippines</Kicker>
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
                We teach you the anatomy, the rules, and the judgment behind
                every professional deliverable — then{" "}
                <strong className="font-semibold text-ink">you build your own</strong>,
                from a blank page. What you build here, you can rebuild for any
                client, anywhere, forever. That skill is the career. Become an{" "}
                <strong className="font-semibold text-ink">online professional</strong>{" "}
                clients trust with outcomes, not just tasks. Yours, forever.
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
              <div className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-paper-2 p-4 text-sm text-ink-soft">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald" />
                <span>
                  <strong className="font-semibold text-ink">
                    Every claim here is sourced.
                  </strong>{" "}
                  We show you the{" "}
                  <Link href="/reality" className="font-semibold text-ink link-sweep">
                    real numbers on this career
                  </Link>
                  , with a link to the primary source every time — including the
                  numbers that might talk you out of it.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero visual, abstract "path" panel, no external images */}
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
                the front calm on purpose. Every workshop, lab, and method is
                here, but it opens{" "}
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
              kicker="Five stages · eleven steps"
              title="One clear line from zero to indispensable"
              lead="You never have to guess what's next. Each stage builds on the last."
              align="center"
              className="mx-auto"
            />
          </Reveal>

          <Reveal i={1}>
            <div className="mx-auto mt-12 max-w-3xl">
              <JourneyProgress />
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {st.summary}
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {roadmap.steps
                      .filter((s) => s.stage === st.num)
                      .map((s) => (
                        <li
                          key={s.n}
                          className="flex items-start gap-2.5 text-sm leading-snug text-ink"
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${accentBar[st.accent]}`}
                          >
                            {s.n}
                          </span>
                          {s.title}
                        </li>
                      ))}
                  </ul>
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
            lead="There is no folder of files to grab here. Every section teaches you how the thing is built, hands you the rules, and then makes you build it yourself, so you can rebuild it anywhere, for anyone, forever."
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
                  English is a national baseline in the Philippines, it gets you in
                  the door, but it doesn&rsquo;t price you above the person next to
                  you. A second language is one of the few edges that still does. We
                  show you which ones pay, and where to learn them free through TESDA
                  and partner institutes.
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
                  { flag: "🇯🇵", name: "Japanese", pay: "Highest premium" },
                  { flag: "🇰🇷", name: "Korean", pay: "Strong premium" },
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
                <ArrowLink href="/reality">See what this career really pays</ArrowLink>
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
              <Sparkles size={13} /> Open to everyone, forever
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
  // 5 ascending stages: [x, barTopY, fill, number, label]
  const bars = [
    { x: 30, y: 308, fill: "#0d9488", n: "01", label: "Start" },
    { x: 100, y: 262, fill: "#e39400", n: "02", label: "Get Hired" },
    { x: 170, y: 212, fill: "#2f9e46", n: "03", label: "Deliver" },
    { x: 240, y: 156, fill: "#2f6df0", n: "04", label: "Level Up" },
    { x: 310, y: 96, fill: "#0e1f1b", n: "05", label: "Own" },
  ];
  const baseline = 392;
  const barW = 54;
  // centres of each bar top, for the rising trend line
  const nodes = bars.map((b) => [b.x + barW / 2, b.y] as const);
  const trend = nodes.map(([x, y]) => `${x},${y}`).join(" ") + " 352,74";

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2 shadow-[var(--shadow-lg)] lg:aspect-auto lg:h-full">
      <div aria-hidden className="absolute inset-0 dotgrid opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/10 blur-2xl"
      />

      <svg
        viewBox="0 0 400 440"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="A rising staircase of career stages, from Start to Own, with an upward trend arrow, representing developing upwards."
      >
        {/* baseline */}
        <line x1="28" y1={baseline} x2="372" y2={baseline} stroke="#c3d5ce" strokeWidth="2" />

        {/* ascending stage bars */}
        {bars.map((b) => (
          <g key={b.n}>
            <rect
              x={b.x}
              y={b.y}
              width={barW}
              height={baseline - b.y}
              rx="0"
              fill={b.fill}
              opacity="0.16"
            />
            <rect x={b.x} y={b.y} width={barW} height="6" rx="0" fill={b.fill} />
            <text
              x={b.x + barW / 2}
              y={b.y + 34}
              textAnchor="middle"
              className="font-display"
              fontSize="26"
              fill={b.fill}
            >
              {b.n}
            </text>
            <text
              x={b.x + barW / 2}
              y={baseline + 22}
              textAnchor="middle"
              fontSize="12"
              fontFamily="var(--font-geist-sans), sans-serif"
              fill="#798a84"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* rising trend line */}
        <polyline
          points={trend}
          fill="none"
          stroke="#0d9488"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 9"
        />
        {/* arrowhead */}
        <path d="M352 74 L338 80 M352 74 L346 88" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* nodes */}
        {nodes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
        ))}
        {/* peak flag */}
        <g transform="translate(329 60)">
          <line x1="0" y1="0" x2="0" y2="44" stroke="#0e1f1b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M0 2 L26 9 L0 18 Z" fill="#0d9488" />
        </g>
      </svg>

      {/* overlay chips */}
      <div className="absolute left-6 top-6 rounded-2xl border border-line bg-ink px-4 py-3 text-paper-2">
        <p className="font-display text-3xl leading-none">11</p>
        <p className="text-[11px] text-paper-2/60">steps to the peak</p>
      </div>
      <div className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald-tint px-3 py-1 text-xs font-semibold text-emerald">
        Developing upwards
      </div>
    </div>
  );
}
