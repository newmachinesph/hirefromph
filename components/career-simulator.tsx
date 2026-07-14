"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, TriangleAlert } from "lucide-react";
import sim from "@/data/simulator.json";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  THE MODEL                                                          */
/*  Numbers live here (logic). All prose lives in data/simulator.json. */
/* ------------------------------------------------------------------ */

type Craft = "none" | "building" | "deep";
type Ai = "none" | "user" | "augmented";
type Ownership = "tasks" | "outcomes";
type Hours = 10 | 20 | 40;
type Language = "english" | "second";
type Clients = "local" | "foreign";

type Config = {
  craft: Craft;
  ai: Ai;
  ownership: Ownership;
  hours: Hours;
  language: Language;
  clients: Clients;
};

/** Base hourly USD, set by CRAFT and by nothing else. That is the thesis. */
const BASE: Record<Craft, number> = { none: 4, building: 9, deep: 22 };
const BASE_RANGE: Record<Craft, [number, number]> = {
  none: [3, 7],
  building: [8, 15],
  deep: [18, 35],
};

/** Everyone starts at the bottom of the generalist band. */
const START_RATE = 3;

/** Months to reach the full base rate. Deep skill is slow. We do not pretend otherwise. */
const CRAFT_RAMP: Record<Craft, number> = { none: 3, building: 18, deep: 30 };

/**
 * THE MOST IMPORTANT LINE IN THIS FILE.
 * The AI premium is conditional on craft. AI multiplies a craft; it cannot multiply zero.
 */
const AI_AUGMENTED: Record<Craft, number> = { none: 1.0, building: 1.15, deep: 1.4 };
const AI_USER = 1.05;

const OWNERSHIP_OUTCOMES = 1.25;
const LANGUAGE_SECOND = 1.2;
const CLIENTS_LOCAL = 0.45;

/** Premium phase-ins, skill and trust are not granted on day one. */
const AI_RAMP = 12;
const OWNERSHIP_RAMP = 18;

/** The reality tax. ILO: ~20 unpaid minutes per paid hour → you keep about two thirds. */
const UNPAID_KEEP = 0.67;
/** Fairwork: 31% of cloudworkers have experienced non-payment. Drawn as a band, never deducted. */
const NON_PAYMENT_RISK = 0.31;

const WEEKS_PER_MONTH = 4.33;
const MONTHS = 36;
const DEFAULT_FX = 58;

/** Clamped smoothstep, legible easing, not a physics engine. */
function ease(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/** Phase a multiplier in from 1.0 to `target` over `months`. */
function phaseIn(target: number, months: number, at: number): number {
  return 1 + (target - 1) * ease(at / months);
}

function aiMultiplier(c: Config): number {
  if (c.ai === "none") return 1;
  if (c.ai === "user") return AI_USER;
  return AI_AUGMENTED[c.craft];
}

function ownershipMultiplier(c: Config): number {
  return c.ownership === "outcomes" ? OWNERSHIP_OUTCOMES : 1;
}

function languageMultiplier(c: Config): number {
  return c.language === "second" ? LANGUAGE_SECOND : 1;
}

function clientsMultiplier(c: Config): number {
  return c.clients === "local" ? CLIENTS_LOCAL : 1;
}

/** Effective hourly at a given month, with every multiplier applied in order. */
function hourlyAt(c: Config, month: number): number {
  const base =
    START_RATE +
    (BASE[c.craft] - START_RATE) * ease(month / CRAFT_RAMP[c.craft]);
  // "user" is available from day one, everyone already has ChatGPT. "augmented" is built, so it ramps.
  const ai =
    c.ai === "user" ? AI_USER : phaseIn(aiMultiplier(c), AI_RAMP, month);
  const own = phaseIn(ownershipMultiplier(c), OWNERSHIP_RAMP, month);
  return base * ai * own * languageMultiplier(c) * clientsMultiplier(c);
}

/** Monthly USD actually kept, after the unpaid-time tax. */
function monthlyEffective(c: Config, month: number): number {
  return hourlyAt(c, month) * c.hours * WEEKS_PER_MONTH * UNPAID_KEEP;
}

function monthlyBilled(c: Config, month: number): number {
  return hourlyAt(c, month) * c.hours * WEEKS_PER_MONTH;
}

/** The comparison line: generic task-taker, same hours, same client market. */
function baselineOf(c: Config): Config {
  return {
    craft: "none",
    ai: "none",
    ownership: "tasks",
    hours: c.hours,
    language: "english",
    clients: c.clients,
  };
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const peso = (n: number, fx: number) =>
  `₱${Math.round(n * fx).toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/*  JSON accessors (typed once, so strict TS is happy)                 */
/* ------------------------------------------------------------------ */

type SourceRef = { label: string; url: string };
const ITEMS = sim.multipliers.items as Record<
  string,
  { label: string; note: string }
>;
const SOURCES = sim.multipliers.sources as Record<string, SourceRef>;
const MILESTONES = [6, 12, 24, 36] as const;

function Source({ label, url }: SourceRef) {
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

/* ------------------------------------------------------------------ */
/*  Controls                                                           */
/* ------------------------------------------------------------------ */

type Option = { id: string; label: string; desc: string };

function ChoiceGroup({
  name,
  legend,
  help,
  options,
  value,
  onChange,
  compact,
}: {
  name: string;
  legend: string;
  help: string;
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-paper p-5">
      <legend className="kicker px-1">{legend}</legend>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">{help}</p>
      <div
        className={cn(
          "mt-4 grid gap-2",
          compact && "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {options.map((o) => {
          const id = `${name}-${o.id}`;
          const active = value === o.id;
          return (
            <div key={o.id}>
              <input
                type="radio"
                id={id}
                name={name}
                value={o.id}
                checked={active}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "flex h-full cursor-pointer gap-3 rounded-xl border p-3 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-coral",
                  active
                    ? "border-ink bg-paper-3"
                    : "border-line bg-paper-2 hover:border-line-strong",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
                    active ? "border-ink" : "border-line-strong",
                  )}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-coral" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-ink">
                    {o.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
                    {o.desc}
                  </span>
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart, pure inline SVG. No library, no dependency.                */
/* ------------------------------------------------------------------ */

const W = 780;
const H = 320;
const PAD = { l: 56, r: 18, t: 18, b: 34 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

function TrajectoryChart({
  rows,
  yMax,
  ariaLabel,
}: {
  rows: { m: number; base: number; path: number }[];
  yMax: number;
  ariaLabel: string;
}) {
  const x = (m: number) => PAD.l + (m / MONTHS) * IW;
  const y = (v: number) => PAD.t + IH - (v / yMax) * IH;

  const line = (key: "base" | "path") =>
    rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.m)},${y(r[key])}`).join(" ");

  // Risk band: from the path line down to (1 - 31%) of it. A warning, not a projection.
  const band = [
    ...rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.m)},${y(r.path)}`),
    ...[...rows]
      .reverse()
      .map((r) => `L${x(r.m)},${y(r.path * (1 - NON_PAYMENT_RISK))}`),
    "Z",
  ].join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const xTicks = [0, 6, 12, 18, 24, 30, 36];
  const last = rows[rows.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      className="h-auto w-full"
    >
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--line)"
            strokeWidth={1}
          />
          <text
            x={PAD.l - 10}
            y={y(v) + 4}
            textAnchor="end"
            fill="var(--ink-faint)"
            fontSize={11}
            fontFamily="var(--font-mono), monospace"
          >
            {usd(v)}
          </text>
        </g>
      ))}

      {xTicks.map((m) => (
        <text
          key={m}
          x={x(m)}
          y={H - 10}
          textAnchor="middle"
          fill="var(--ink-faint)"
          fontSize={11}
          fontFamily="var(--font-mono), monospace"
        >
          {m}
        </text>
      ))}

      <path d={band} fill="var(--coral)" opacity={0.1} />

      <path
        d={line("base")}
        fill="none"
        stroke="var(--ink-faint)"
        strokeWidth={2}
        strokeDasharray="7 4"
        strokeLinecap="round"
      />
      <path
        d={line("path")}
        fill="none"
        stroke="var(--coral)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={x(36)} cy={y(last.base)} r={4} fill="var(--ink-faint)" />
      <circle cx={x(36)} cy={y(last.path)} r={5} fill="var(--coral)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  The simulator                                                      */
/* ------------------------------------------------------------------ */

export function CareerSimulator() {
  const uid = useId();
  const [craft, setCraft] = useState<Craft>("none");
  const [ai, setAi] = useState<Ai>("none");
  const [ownership, setOwnership] = useState<Ownership>("tasks");
  const [hours, setHours] = useState<Hours>(20);
  const [language, setLanguage] = useState<Language>("english");
  const [clients, setClients] = useState<Clients>("foreign");
  const [fx, setFx] = useState(DEFAULT_FX);

  const config = useMemo<Config>(
    () => ({ craft, ai, ownership, hours, language, clients }),
    [craft, ai, ownership, hours, language, clients],
  );

  const model = useMemo(() => {
    const base = baselineOf(config);
    const rows = Array.from({ length: MONTHS + 1 }, (_, m) => ({
      m,
      base: monthlyEffective(base, m),
      path: monthlyEffective(config, m),
    }));

    const peak = Math.max(...rows.map((r) => Math.max(r.base, r.path)));
    const yMax = Math.max(200, Math.ceil((peak * 1.15) / 100) * 100);

    const at6 = monthlyEffective(config, 6);
    const at36 = monthlyEffective(config, 36);
    const growth = at6 > 0 ? at36 / at6 : 1;
    const gap = rows[36].base > 0 ? at36 / rows[36].base : 1;

    const tier =
      growth < 1.15
        ? "flatline"
        : growth < 1.6
          ? "creeping"
          : growth < 2.5
            ? "climbing"
            : "compounding";
    const verdict =
      sim.verdicts.find((v) => v.id === tier) ?? sim.verdicts[0];

    const aiKey =
      ai === "augmented" ? `ai-augmented-${craft}` : `ai-${ai}`;

    const multipliers = [
      {
        key: aiKey,
        value: aiMultiplier(config),
        // The +40% AI premium and its "you needed the expertise first" nuance are both sourced.
        // The partial premium for a half-built craft is our interpolation.
        sourced: aiKey === "ai-augmented-deep" || aiKey === "ai-augmented-none",
        sources:
          ai === "augmented"
            ? [SOURCES["upwork-skills"], SOURCES["axios-ai"]]
            : [],
      },
      {
        key: `ownership-${ownership}`,
        value: ownershipMultiplier(config),
        sourced: false,
        sources: ownership === "outcomes" ? [SOURCES["upwork-fwi"]] : [],
      },
      {
        key: `language-${language}`,
        value: languageMultiplier(config),
        sourced: false,
        sources: language === "second" ? [SOURCES["ef-epi"]] : [],
      },
      {
        key: `clients-${clients}`,
        value: clientsMultiplier(config),
        sourced: false,
        sources: [],
      },
    ];

    const noPremium = craft === "none" && ai === "augmented";

    const ariaLabel = `Line chart of monthly take-home in US dollars over 36 months. If you stay generic: ${usd(
      rows[6].base,
    )} at month 6, ${usd(rows[36].base)} at month 36. Your path: ${usd(
      at6,
    )} at month 6, ${usd(
      at36,
    )} at month 36. ${verdict.label} A shaded band below your path line marks the non-payment risk: roughly one in three workers are not paid at least once.`;

    return {
      rows,
      yMax,
      at6,
      at36,
      growth,
      gap,
      verdict,
      multipliers,
      noPremium,
      ariaLabel,
    };
  }, [config, ai, craft, clients, language, ownership]);

  const gapNote =
    model.gap < 1.1
      ? sim.gapNote.same
      : sim.gapNote.diverged.replace("{x}", model.gap.toFixed(1));

  const tableRows = [0, 6, 12, 18, 24, 30, 36];
  const [rangeLow, rangeHigh] = BASE_RANGE[craft];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
      {/* ------------------------------------------------------- CONTROLS */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
            {sim.controls.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {sim.controls.lead}
          </p>
        </div>

        <ChoiceGroup
          name={`${uid}-craft`}
          legend={sim.controls.craft.legend}
          help={sim.controls.craft.help}
          options={sim.controls.craft.options}
          value={craft}
          onChange={(v) => setCraft(v as Craft)}
        />
        <ChoiceGroup
          name={`${uid}-ai`}
          legend={sim.controls.ai.legend}
          help={sim.controls.ai.help}
          options={sim.controls.ai.options}
          value={ai}
          onChange={(v) => setAi(v as Ai)}
        />
        <ChoiceGroup
          name={`${uid}-ownership`}
          legend={sim.controls.ownership.legend}
          help={sim.controls.ownership.help}
          options={sim.controls.ownership.options}
          value={ownership}
          onChange={(v) => setOwnership(v as Ownership)}
        />
        <ChoiceGroup
          name={`${uid}-hours`}
          legend={sim.controls.hours.legend}
          help={sim.controls.hours.help}
          options={sim.controls.hours.options}
          value={String(hours)}
          onChange={(v) => setHours(Number(v) as Hours)}
          compact
        />
        <ChoiceGroup
          name={`${uid}-language`}
          legend={sim.controls.language.legend}
          help={sim.controls.language.help}
          options={sim.controls.language.options}
          value={language}
          onChange={(v) => setLanguage(v as Language)}
        />
        <ChoiceGroup
          name={`${uid}-clients`}
          legend={sim.controls.clients.legend}
          help={sim.controls.clients.help}
          options={sim.controls.clients.options}
          value={clients}
          onChange={(v) => setClients(v as Clients)}
        />

        <div className="rounded-2xl border border-line bg-paper p-5">
          <label htmlFor={`${uid}-fx`} className="kicker">
            {sim.fx.label}
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              id={`${uid}-fx`}
              type="number"
              min={30}
              max={120}
              step={0.5}
              value={fx}
              onChange={(e) => {
                const n = Number(e.target.value);
                setFx(Number.isFinite(n) && n > 0 ? n : DEFAULT_FX);
              }}
              className="w-28 rounded-xl border border-line-strong bg-paper-2 px-4 py-2.5 text-sm font-semibold text-ink outline-none focus-visible:border-ink"
            />
            <span className="text-sm text-ink-soft">{sim.fx.suffix}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            {sim.fx.note}
          </p>
        </div>
      </div>

      {/* -------------------------------------------------------- RESULTS */}
      <div className="flex flex-col gap-6">
        {/* Summary, announced on every change */}
        <div
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
              {sim.results.title}
            </h2>
            <Pill tone="amber">
              <TriangleAlert size={12} aria-hidden />
              {sim.results.modelPill}
            </Pill>
          </div>

          <p className="mt-5 font-display text-xl leading-snug text-balance text-ink">
            {model.verdict.label}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {model.verdict.body}
          </p>
          <p className="mt-4 max-w-2xl border-l-2 border-coral pl-4 text-sm font-medium leading-relaxed text-ink">
            {gapNote}
          </p>

          <p className="kicker mt-8">{sim.results.milestoneLabel}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MILESTONES.map((m) => (
              <div
                key={m}
                className="rounded-2xl border border-line bg-paper p-4"
              >
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  Month {m}
                </p>
                <p className="mt-2 font-display text-2xl leading-none text-ink">
                  {usd(monthlyEffective(config, m))}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-emerald">
                  {peso(monthlyEffective(config, m), fx)}
                </p>
                <p className="mt-2 text-[11px] leading-snug text-ink-faint">
                  {usd(monthlyBilled(config, m))} {sim.results.billedNote}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-xs text-ink-faint">
            <span>
              <span className="font-semibold text-ink-soft">
                {sim.results.hourlyLabel}:
              </span>{" "}
              ${hourlyAt(config, 36).toFixed(2)}/hr
            </span>
            <span>
              <span className="font-semibold text-ink-soft">
                {sim.results.rangeNote}:
              </span>{" "}
              ${rangeLow}–${rangeHigh}/hr
            </span>
          </div>
        </div>

        {/* AI-with-no-craft callout, the heart of the model */}
        {model.noPremium && (
          <div className="rounded-[var(--radius-lg)] border-2 border-coral bg-coral-tint p-6 lg:p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                aria-hidden
                className="mt-1 shrink-0 text-coral-deep"
              />
              <div className="min-w-0">
                <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-balance text-ink">
                  {sim.aiCallout.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {sim.aiCallout.body}
                </p>
                <blockquote className="mt-5 border-l-2 border-coral-deep pl-4">
                  <p className="font-display text-lg leading-snug text-ink">
                    {sim.aiCallout.quote}
                  </p>
                  <footer className="mt-2 text-xs font-medium text-ink-faint">
                    {sim.aiCallout.attribution}
                  </footer>
                </blockquote>
                <p className="mt-5 text-sm leading-relaxed text-ink-soft">
                  {sim.aiCallout.closer}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <Source {...SOURCES["upwork-skills"]} />
                  <Source {...SOURCES["axios-ai"]} />
                </div>
                <Link
                  href="/niches"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper-2 transition-colors hover:bg-coral-deep"
                >
                  {sim.aiCallout.cta}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <figure className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
          <figcaption>
            <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
              {sim.chart.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {sim.chart.lead}
            </p>
          </figcaption>

          {/* Legend, shape + text, never colour alone */}
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft">
            <li className="flex items-center gap-2">
              <svg width="26" height="8" aria-hidden className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="26"
                  y2="4"
                  stroke="var(--ink-faint)"
                  strokeWidth="2"
                  strokeDasharray="7 4"
                />
              </svg>
              {sim.chart.baselineLabel}
            </li>
            <li className="flex items-center gap-2">
              <svg width="26" height="8" aria-hidden className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="26"
                  y2="4"
                  stroke="var(--coral)"
                  strokeWidth="3"
                />
              </svg>
              <span className="font-semibold text-ink">
                {sim.chart.pathLabel}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-3 w-6 shrink-0 rounded-sm bg-coral/10"
              />
              {sim.chart.riskBandLabel}
            </li>
          </ul>

          <div className="mt-4">
            <TrajectoryChart
              rows={model.rows}
              yMax={model.yMax}
              ariaLabel={model.ariaLabel}
            />
          </div>
          <p className="mt-1 text-center font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            Months from today
          </p>

          <p className="mt-5 rounded-2xl border border-coral/25 bg-coral-tint p-4 text-xs leading-relaxed text-ink-soft">
            {sim.chart.riskBandNote}
          </p>

          {/* Data table, the chart must never be the only way to read this */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left text-sm">
              <caption className="pb-3 text-left text-xs leading-relaxed text-ink-faint">
                {sim.chart.tableCaption}
              </caption>
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="py-2 pr-3 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    {sim.chart.colMonth}
                  </th>
                  <th scope="col" className="py-2 pr-3 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    {sim.chart.colBaseline}
                  </th>
                  <th scope="col" className="py-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    {sim.chart.colPath}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((m) => (
                  <tr key={m} className="border-b border-line">
                    <th
                      scope="row"
                      className="py-2 pr-3 font-mono text-xs font-normal text-ink-faint"
                    >
                      {m}
                    </th>
                    <td className="py-2 pr-3 text-ink-soft">
                      {usd(model.rows[m].base)}
                    </td>
                    <td className="py-2 font-semibold text-ink">
                      {usd(model.rows[m].path)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>

        {/* Multiplier breakdown */}
        <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
          <h3 className="font-display text-[length:var(--text-h3)] leading-snug text-ink">
            {sim.multipliers.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {sim.multipliers.lead}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            <li className="rounded-2xl border border-line-strong bg-paper p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-ink">
                  {sim.multipliers.baseLabel}
                </p>
                <p className="font-display text-lg text-ink">
                  ${BASE[craft]}/hr
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Pill tone="amber">{sim.multipliers.tagAssumption}</Pill>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  Vendor-grade · directional · range ${rangeLow}&ndash;$
                  {rangeHigh}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {sim.multipliers.baseNote}
              </p>
            </li>

            {model.multipliers.map((row) => {
              const item = ITEMS[row.key];
              const neutral = row.value === 1;
              return (
                <li
                  key={row.key}
                  className={cn(
                    "rounded-2xl border p-4",
                    neutral ? "border-line bg-paper" : "border-line-strong bg-paper",
                  )}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-sm font-semibold text-ink">
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        "font-display text-lg",
                        row.value > 1 && "text-emerald",
                        row.value < 1 && "text-coral-deep",
                        neutral && "text-ink-faint",
                      )}
                    >
                      &times;{row.value.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Pill tone={row.sourced ? "emerald" : "amber"}>
                      {row.sourced
                        ? sim.multipliers.tagSourced
                        : sim.multipliers.tagAssumption}
                    </Pill>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                    {item.note}
                  </p>
                  {row.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      {row.sources.map((s) => (
                        <Source key={s.url} {...s} />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reality tax, never hidden, never optional */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-3/70 p-6">
            <h3 className="font-display text-lg leading-snug text-ink">
              {sim.realityTax.unpaid.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {sim.realityTax.unpaid.body}
            </p>
            <div className="mt-4">
              <Source {...sim.realityTax.unpaid.source} />
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-coral/30 bg-coral-tint p-6">
            <h3 className="font-display text-lg leading-snug text-ink">
              {sim.realityTax.nonPayment.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {sim.realityTax.nonPayment.body}
            </p>
            <div className="mt-4">
              <Source {...sim.realityTax.nonPayment.source} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
