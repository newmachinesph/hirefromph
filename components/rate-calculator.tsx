"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";

/** A field with a number input and an optional range slider. */
function Field({
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
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-sm font-semibold text-coral">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full accent-coral"
        aria-label={label}
      />
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

const peso = (n: number) =>
  "₱" + Math.round(n).toLocaleString("en-PH");

export function RateCalculator() {
  const [rate, setRate] = useState(8); // $/hr billed
  const [hours, setHours] = useState(40); // billable hours/week
  const [fee, setFee] = useState(10); // platform fee %
  const [unpaid, setUnpaid] = useState(30); // unpaid time %
  const [costs, setCosts] = useState(4000); // ₱/mo internet, power, tools
  const [tax, setTax] = useState(8); // %
  const [fx, setFx] = useState(58); // ₱ per $1

  const WEEKS = 4.33;
  const grossMonthlyUsd = rate * hours * WEEKS;
  const afterFeeUsd = grossMonthlyUsd * (1 - fee / 100);
  const grossPhp = afterFeeUsd * fx;
  const afterCostsPhp = grossPhp - costs;
  const taxPhp = Math.max(0, afterCostsPhp) * (tax / 100);
  const netPhp = afterCostsPhp - taxPhp;

  const totalHoursMonthly = hours * (1 + unpaid / 100) * WEEKS;
  const effHourlyPhp = totalHoursMonthly > 0 ? netPhp / totalHoursMonthly : 0;
  const effHourlyUsd = effHourlyPhp / fx;
  const shrink =
    rate > 0 ? Math.max(0, Math.round((1 - effHourlyUsd / rate) * 100)) : 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-paper-2 p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* inputs */}
        <div className="flex flex-col gap-5">
          <Field label="Your billed rate" value={rate} setValue={setRate} min={2} max={60} prefix="$" suffix="/hr" />
          <Field label="Billable hours per week" value={hours} setValue={setHours} min={5} max={60} suffix=" hrs" />
          <Field label="Platform fee" value={fee} setValue={setFee} min={0} max={20} suffix="%" hint="Upwork and similar take a cut. 0 if the client is fully direct." />
          <Field label="Unpaid time" value={unpaid} setValue={setUnpaid} min={0} max={60} suffix="%" hint="Hunting for work, unpaid tests, proposals nobody answers. Research puts this near a third." />
          <Field label="Monthly costs" value={costs} setValue={setCosts} min={0} max={20000} step={500} prefix="₱" hint="Internet, electricity, and the tools you pay for." />
          <Field label="Tax set-aside" value={tax} setValue={setTax} min={0} max={25} suffix="%" hint="The BIR 8% flat option is a common starting point." />
          <Field label="Exchange rate" value={fx} setValue={setFx} min={45} max={70} prefix="₱" suffix=" / $1" />
        </div>

        {/* outputs */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-coral/30 bg-coral-tint p-6">
            <p className="kicker text-coral-deep">Your real hourly rate</p>
            <p className="mt-2 font-display text-4xl leading-none text-ink">
              ${effHourlyUsd.toFixed(2)}
              <span className="text-xl text-ink-soft"> / hr</span>
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              About {peso(effHourlyPhp)} an hour, take-home, across every hour you
              actually work.
            </p>
            {shrink > 0 && (
              <p className="mt-3 border-l-2 border-coral pl-3 text-sm font-medium text-ink">
                That is {shrink}% below your ${rate}/hr headline rate. That gap is
                the fees, the costs, the tax, and the unpaid time nobody bills for.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { k: "Gross (after fee)", v: "$" + Math.round(afterFeeUsd).toLocaleString() + " / mo" },
              { k: "In pesos", v: peso(grossPhp) + " / mo" },
              { k: "After costs & tax", v: peso(netPhp) + " / mo" },
              { k: "Hours you really work", v: Math.round(totalHoursMonthly) + " / mo" },
            ].map((r) => (
              <div key={r.k} className="bg-paper-2 p-4">
                <dt className="text-xs text-ink-faint">{r.k}</dt>
                <dd className="mt-1 font-display text-lg leading-tight text-ink">{r.v}</dd>
              </div>
            ))}
          </dl>

          <p className="flex items-start gap-2 rounded-2xl border border-line bg-paper p-4 text-xs leading-relaxed text-ink-soft">
            <Icon name="scan-eye" size={16} className="mt-0.5 shrink-0 text-emerald" weight="bold" />
            An estimate, not a promise. The point is the shape: never compare a
            headline rate to a local salary before you subtract everything above.
          </p>
        </div>
      </div>
    </div>
  );
}
