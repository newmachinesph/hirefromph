"use client";

import { useState } from "react";
import {
  Callout,
  Card,
  Field,
  Icon,
  Kicker,
  Range,
  Source,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import { computeRate, unpaidShareToAddon } from "@/lib/rate-math";
import { DEFAULT_FX, UNPAID_KEEP } from "@/lib/simulator-math";

/**
 * Unpaid share of all working time, as a percent. Derived from the simulator's
 * keep-rate so the two tools cannot disagree: the ILO (2015–17 surveys)
 * measured ~20 unpaid minutes per paid hour, about a quarter of the time you work.
 */
export const DEFAULT_UNPAID_SHARE = Math.round((1 - UNPAID_KEEP) * 100);

export const UNPAID_SOURCE = {
  label: "ILO, Digital labour platforms and the future of work (2018), surveys 2015–2017",
  url: "https://www.ilo.org/media/414716/download",
};

/** A labelled slider. The value read-out is part of the label, per Field's contract. */
function SliderField({
  label,
  value,
  setValue,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={label}
        valueLabel={
          <span className="font-semibold text-primary">
            {prefix}
            {value.toLocaleString()}
            {suffix}
          </span>
        }
      />
    </Field>
  );
}

const peso = (n: number) => "₱" + Math.round(n).toLocaleString("en-PH");

export function RateCalculator() {
  const [rate, setRate] = useState(8); // $/hr billed
  const [hours, setHours] = useState(40); // billable hours/week
  const [fee, setFee] = useState(10); // platform fee %
  const [unpaidShare, setUnpaidShare] = useState(DEFAULT_UNPAID_SHARE); // % of all working time
  const [costs, setCosts] = useState(4000); // ₱/mo internet, power, tools
  const [tax, setTax] = useState(8); // %
  const [fx, setFx] = useState(DEFAULT_FX); // ₱ per $1

  const {
    afterFeeUsd,
    grossPhp,
    netPhp,
    totalHoursMonthly,
    effHourlyPhp,
    effHourlyUsd,
    shrink,
  } = computeRate({
    rate,
    hours,
    fee,
    unpaid: unpaidShareToAddon(unpaidShare),
    costs,
    tax,
    fx,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <SliderField label="Your billed rate" value={rate} setValue={setRate} min={2} max={60} prefix="$" suffix="/hr" />
        <SliderField label="Billable hours per week" value={hours} setValue={setHours} min={5} max={60} suffix=" hrs" />
        <SliderField
          label="Platform fee"
          value={fee}
          setValue={setFee}
          min={0}
          max={20}
          suffix="%"
          hint="Upwork and similar take a cut. 0 if the client is fully direct."
        />
        <SliderField
          label="Unpaid share of your working time"
          value={unpaidShare}
          setValue={setUnpaidShare}
          min={0}
          max={60}
          suffix="%"
          hint="Hunting for work, unpaid tests, proposals nobody answers. The ILO measured about 20 unpaid minutes for every paid hour: a quarter of the time you work."
        />
        <SliderField
          label="Monthly costs"
          value={costs}
          setValue={setCosts}
          min={0}
          max={20000}
          step={500}
          prefix="₱"
          hint="Internet, electricity, and the tools you pay for."
        />
        <SliderField
          label="Tax set-aside"
          value={tax}
          setValue={setTax}
          min={0}
          max={25}
          suffix="%"
          hint="The BIR 8% flat option is a common starting point."
        />
        <SliderField
          label="Exchange rate"
          value={fx}
          setValue={setFx}
          min={45}
          max={70}
          step={0.5}
          prefix="₱"
          suffix=" / $1"
        />
      </div>

      {/* outputs */}
      <div className="flex flex-col gap-4">
        <Callout tone="signal">
          <Kicker tone="signal">Your real hourly rate</Kicker>
          <StatStrip className="mt-2">
            <Stat
              value={`$${effHourlyUsd.toFixed(2)} / hr`}
              label={`About ${peso(effHourlyPhp)} an hour, take-home, across every hour you work.`}
            />
          </StatStrip>
          {shrink > 0 && (
            <Text size="small" tone="ink" className="mt-3 border-l-2 border-primary pl-3 font-medium">
              That is {shrink}% below your ${rate}/hr headline rate. That gap is the fees, the
              costs, the tax, and the unpaid time nobody bills for.
            </Text>
          )}
        </Callout>

        <StatStrip className="grid grid-cols-2 gap-4">
          {[
            { k: "Gross (after fee)", v: "$" + Math.round(afterFeeUsd).toLocaleString() + " / mo" },
            { k: "In pesos", v: peso(grossPhp) + " / mo" },
            { k: "After costs & tax", v: peso(netPhp) + " / mo" },
            { k: "Hours you really work", v: Math.round(totalHoursMonthly) + " / mo" },
          ].map((r) => (
            <Card key={r.k} padding="sm">
              <Stat value={r.v} label={r.k} />
            </Card>
          ))}
        </StatStrip>

        <Card padding="sm">
          <div className="flex items-start gap-2">
            <Icon name="scan-eye" size={16} weight="bold" className="mt-0.5 shrink-0 text-verified" />
            <div className="flex flex-col gap-2">
              <Text size="caption">
                An estimate, not a promise. The point is the shape: never compare a headline rate
                to a local salary before you subtract everything above.
              </Text>
              <Source label={UNPAID_SOURCE.label} url={UNPAID_SOURCE.url} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
