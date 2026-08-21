"use client";

import { useId, useMemo, useState } from "react";
import sim from "@/data/simulator.json";
import { Legend, Line } from "@/components/diagrams/charts";
import {
  Badge,
  Button,
  Callout,
  Card,
  ChoiceCard,
  DiagramFrame,
  Field,
  Heading,
  Icon,
  Input,
  Source,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  BASE,
  BASE_RANGE,
  DEFAULT_FX,
  MONTHS,
  NON_PAYMENT_RISK,
  aiMultiplier,
  baselineOf,
  clientsMultiplier,
  hourlyAt,
  languageMultiplier,
  monthlyBilled,
  monthlyEffective,
  ownershipMultiplier,
  type Ai,
  type Clients,
  type Config,
  type Craft,
  type Hours,
  type Language,
  type Ownership,
} from "@/lib/simulator-math";

/* ------------------------------------------------------------------ */
/*  THE MODEL                                                          */
/*  Projection math (types, constants, formulas) lives in             */
/*  lib/simulator-math.ts. All prose lives in data/simulator.json.    */
/* ------------------------------------------------------------------ */

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
    <Card padding="sm">
      <Field as="group" label={legend} hint={help}>
        <div className={cn("mt-2 grid gap-2", compact && "grid-cols-1 sm:grid-cols-3")}>
          {options.map((o) => (
            <ChoiceCard
              key={o.id}
              name={name}
              value={o.id}
              label={o.label}
              description={o.desc}
              checked={value === o.id}
              onChange={onChange}
            />
          ))}
        </div>
      </Field>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart, pure inline SVG. No library, no dependency.                */
/* ------------------------------------------------------------------ */

function TrajectoryChart({
  rows,
  yMax,
}: {
  rows: { m: number; base: number; path: number }[];
  yMax: number;
}) {
  return (
    <Line
      xDomain={[0, MONTHS]}
      yDomain={[0, yMax]}
      xTickCount={6}
      yTickCount={4}
      formatX={(m) => String(m)}
      formatY={(v) => usd(v)}
      xTitle="Months from today"
      band={{ seriesId: "path", drop: NON_PAYMENT_RISK }}
      series={[
        {
          id: "base",
          label: sim.chart.baselineLabel,
          dashed: true,
          points: rows.map((r) => ({ x: r.m, y: r.base })),
        },
        {
          id: "path",
          label: sim.chart.pathLabel,
          focal: true,
          points: rows.map((r) => ({ x: r.m, y: r.path })),
        },
      ]}
    />
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
  // Track the raw field text so the user can freely clear/type a partial value.
  const [fxText, setFxText] = useState(String(DEFAULT_FX));
  // Numeric FX for the projection: fall back to the default only while the text is invalid.
  const fxNum = Number(fxText);
  const fx = Number.isFinite(fxNum) && fxNum > 0 ? fxNum : DEFAULT_FX;

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
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start [&>*]:min-w-0">
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

        <Card padding="sm">
          <Field label={sim.fx.label} hint={sim.fx.note}>
            <div className="flex items-center gap-3">
              <Input
                id={`${uid}-fx`}
                type="number"
                min={30}
                max={120}
                step={0.5}
                value={fxText}
                onChange={(e) => setFxText(e.target.value)}
                onBlur={() => {
                  if (!(Number.isFinite(fxNum) && fxNum > 0)) setFxText(String(DEFAULT_FX));
                }}
                className="w-28"
              />
              <Text size="small" as="span">
                {sim.fx.suffix}
              </Text>
            </div>
          </Field>
        </Card>
      </div>

      {/* -------------------------------------------------------- RESULTS */}
      <div className="flex flex-col gap-6">
        {/* Summary, announced on every change */}
        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading level={2} size="h3">
              {sim.results.title}
            </Heading>
            <Badge tone="caution">
              <Icon name="alert-triangle" size={12} />
              {sim.results.modelPill}
            </Badge>
          </div>

          <p
            aria-live="polite"
            className="mt-5 font-display text-xl leading-snug text-balance text-ink"
          >
            {model.verdict.label}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {model.verdict.body}
          </p>
          <p className="mt-4 max-w-2xl border-l-2 border-signal pl-4 text-sm font-medium leading-relaxed text-ink">
            {gapNote}
          </p>

          <p className="kicker mt-8">{sim.results.milestoneLabel}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MILESTONES.map((m) => (
              <Card key={m} padding="sm">
                <Text size="caption" tone="faint" className="tabular-nums uppercase tracking-wider">
                  Month {m}
                </Text>
                <StatStrip className="mt-2">
                  <Stat
                    value={usd(monthlyEffective(config, m))}
                    label={peso(monthlyEffective(config, m), fx)}
                    sub={`${usd(monthlyBilled(config, m))} ${sim.results.billedNote}`}
                  />
                </StatStrip>
              </Card>
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
        </Card>

        {/* AI-with-no-craft callout, the heart of the model */}
        {model.noPremium && (
          <Callout tone="signal" icon="alert-triangle" title={sim.aiCallout.title}>
            <div className="min-w-0">
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {sim.aiCallout.body}
                </p>
                <blockquote className="mt-5 border-l-2 border-signal-deep pl-4">
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
                <div className="mt-5">
                  <Button href="/niches">{sim.aiCallout.cta}</Button>
                </div>
            </div>
          </Callout>
        )}

        {/* Chart */}
        <Card padding="lg" as="section">
          <Legend
            className="mb-5"
            items={[
              { id: "base", label: sim.chart.baselineLabel, kind: "dashed" },
              { id: "path", label: sim.chart.pathLabel, kind: "line", focal: true },
              { id: "risk", label: sim.chart.riskBandLabel, kind: "band" },
            ]}
          />

          {/* The generated sentence is richer than the frame's title, so it is kept
              for screen readers; the data table below is the full fallback. */}
          <p className="sr-only">{model.ariaLabel}</p>

          <DiagramFrame title={sim.chart.title} caption={sim.chart.lead}>
            <TrajectoryChart rows={model.rows} yMax={model.yMax} />
          </DiagramFrame>

          <Callout tone="signal" className="mt-5">
            <Text size="caption">{sim.chart.riskBandNote}</Text>
          </Callout>

          {/* Data table, the chart must never be the only way to read this */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left text-sm">
              <caption className="pb-3 text-left text-xs leading-relaxed text-ink-faint">
                {sim.chart.tableCaption}
              </caption>
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="py-2 pr-3 text-caption uppercase tracking-wider text-ink-faint tabular-nums">
                    {sim.chart.colMonth}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-caption uppercase tracking-wider text-ink-faint tabular-nums">
                    {sim.chart.colBaseline}
                  </th>
                  <th scope="col" className="py-2 text-caption uppercase tracking-wider text-ink-faint tabular-nums">
                    {sim.chart.colPath}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((m) => (
                  <tr key={m} className="border-b border-line">
                    <th
                      scope="row"
                      className="py-2 pr-3 text-caption tabular-nums text-ink-faint"
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
        </Card>

        {/* Multiplier breakdown */}
        <Card padding="lg">
          <Heading level={3} size="h3">
            {sim.multipliers.title}
          </Heading>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {sim.multipliers.lead}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            <Card as="li" padding="sm" onBand>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-ink">
                  {sim.multipliers.baseLabel}
                </p>
                <Text size="lead" tone="ink" as="span" className="font-display">
                  ${BASE[craft]}/hr
                </Text>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="caution">{sim.multipliers.tagAssumption}</Badge>
                <span className="text-caption uppercase tracking-wider text-ink-faint tabular-nums">
                  Vendor-grade · directional · range ${rangeLow}&ndash;$
                  {rangeHigh}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {sim.multipliers.baseNote}
              </p>
            </Card>

            {model.multipliers.map((row) => {
              const item = ITEMS[row.key];
              const neutral = row.value === 1;
              return (
                <Card key={row.key} as="li" padding="sm" onBand={!neutral}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-sm font-semibold text-ink">
                      {item.label}
                    </p>
                    <Text
                      size="lead"
                      tone="inherit"
                      as="span"
                      className={cn(
                        "font-display",
                        row.value > 1 && "text-verified",
                        row.value < 1 && "text-signal-deep",
                        neutral && "text-ink-faint",
                      )}
                    >
                      &times;{row.value.toFixed(2)}
                    </Text>
                  </div>
                  <div className="mt-2">
                    <Badge tone={row.sourced ? "verified" : "caution"}>
                      {row.sourced
                        ? sim.multipliers.tagSourced
                        : sim.multipliers.tagAssumption}
                    </Badge>
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
                </Card>
              );
            })}
          </ul>
        </Card>

        {/* Reality tax, never hidden, never optional */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card padding="md">
            <h3 className="font-display text-lg leading-snug text-ink">
              {sim.realityTax.unpaid.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {sim.realityTax.unpaid.body}
            </p>
            <div className="mt-4">
              <Source {...sim.realityTax.unpaid.source} />
            </div>
          </Card>
          <Callout tone="signal" title={sim.realityTax.nonPayment.title}>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {sim.realityTax.nonPayment.body}
            </p>
            <div className="mt-4">
              <Source {...sim.realityTax.nonPayment.source} />
            </div>
          </Callout>
        </div>
      </div>
    </div>
  );
}
