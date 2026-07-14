"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { usePath } from "@/lib/path-context";
import { Icon } from "@/components/icon";
import { Pill } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type Tier = { tier: string; item: string; price: string };
type Category = {
  id: string;
  name: string;
  icon: string;
  essential: boolean;
  note: string;
  tiers: Tier[];
};

const DEFAULT_TIER_INDEX = 1;

/** Parse the low end of a "₱9,000–₱15,000" / "₱1,300–₱1,700/mo" / "₱0" string. */
function parseLowPrice(price: string): number {
  const match = price.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function isMonthly(price: string): boolean {
  return /\/mo/i.test(price);
}

export function EquipmentChecker({ categories }: { categories: Category[] }) {
  const { state } = usePath();
  const [tierIndex, setTierIndex] = useState<Record<string, number>>({});

  const getTierIndex = (cat: Category) =>
    tierIndex[cat.id] ?? Math.min(DEFAULT_TIER_INDEX, cat.tiers.length - 1);

  const essentials = categories.filter((c) => c.essential);
  const readyCount = essentials.filter((c) => state.equipment[c.id]).length;
  const totalEssentials = essentials.length;
  const pct =
    totalEssentials > 0 ? Math.round((readyCount / totalEssentials) * 100) : 0;
  const allReady = totalEssentials > 0 && readyCount === totalEssentials;

  const remaining = totalEssentials - readyCount;
  const message = allReady
    ? "You're ready to apply!"
    : readyCount === 0
      ? "Let's get you prepared — check off what you already have."
      : `${remaining} essential${remaining === 1 ? "" : "s"} left to go.`;

  const estimateTotal = categories.reduce((sum, cat) => {
    if (state.equipment[cat.id]) return sum;
    const tier = cat.tiers[getTierIndex(cat)] ?? cat.tiers[0];
    if (isMonthly(tier.price)) return sum;
    return sum + parseLowPrice(tier.price);
  }, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="grid gap-5 sm:grid-cols-2">
        {categories.map((category, idx) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={idx}
            tierIndex={getTierIndex(category)}
            onTierChange={(i) =>
              setTierIndex((prev) => ({ ...prev, [category.id]: i }))
            }
          />
        ))}
      </div>

      <aside className="flex flex-col gap-6 rounded-2xl border border-line bg-paper-2 p-6 shadow-[var(--shadow-md)] lg:sticky lg:top-24">
        <div
          className="flex flex-col items-center text-center"
          aria-live="polite"
        >
          <div
            role="img"
            aria-label={`${readyCount} of ${totalEssentials} essentials ready`}
            className="grid h-24 w-24 place-items-center rounded-full transition-[background] duration-500"
            style={{
              background: `conic-gradient(var(--emerald) ${pct}%, var(--line) ${pct}% 100%)`,
            }}
          >
            <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-paper-2">
              <span className="font-display text-xl text-ink">
                {readyCount}/{totalEssentials}
              </span>
            </div>
          </div>
          <p
            className={cn(
              "mt-4 text-sm font-semibold text-balance",
              allReady ? "text-emerald" : "text-ink",
            )}
          >
            {message}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {readyCount} of {totalEssentials} essentials ready
          </p>
        </div>

        <div className="border-t border-line pt-5">
          <p className="kicker">Estimated to prepare</p>
          <p className="mt-2 font-display text-3xl text-ink">
            ₱{estimateTotal.toLocaleString("en-PH")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">
            One-time estimate for what you haven&rsquo;t checked off yet, at
            your chosen tiers. Monthly costs (like internet) aren&rsquo;t
            counted here — check each card for the /mo price.
          </p>
        </div>
      </aside>
    </div>
  );
}

function CategoryCard({
  category,
  index,
  tierIndex,
  onTierChange,
}: {
  category: Category;
  index: number;
  tierIndex: number;
  onTierChange: (i: number) => void;
}) {
  const { state, toggleEquipment } = usePath();
  const owned = !!state.equipment[category.id];
  const tier = category.tiers[tierIndex] ?? category.tiers[0];

  return (
    <Reveal i={index % 4}>
      <div
        className={cn(
          "flex h-full flex-col rounded-2xl border p-6 transition-all duration-300",
          owned
            ? "border-emerald/40 bg-emerald-tint"
            : "border-line bg-paper-2 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                category.essential
                  ? "bg-coral-tint text-coral-deep"
                  : "bg-[#e9e9fd] text-indigo",
              )}
            >
              <Icon name={category.icon} size={20} />
            </span>
            <div>
              <h3 className="font-display text-lg leading-tight">
                {category.name}
              </h3>
              <Pill
                tone={category.essential ? "coral" : "neutral"}
                className="mt-1.5"
              >
                {category.essential ? "Essential" : "Optional"}
              </Pill>
            </div>
          </div>
          {owned && (
            <CheckCircle2
              size={22}
              className="shrink-0 text-emerald"
              aria-hidden
            />
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {category.note}
        </p>

        <fieldset className="mt-5">
          <legend className="kicker mb-2">Pick a tier</legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-full border border-line-strong bg-paper-3 p-1">
            {category.tiers.map((t, i) => {
              const id = `${category.id}-tier-${i}`;
              return (
                <div key={t.tier}>
                  <input
                    type="radio"
                    id={id}
                    name={`tier-${category.id}`}
                    checked={i === tierIndex}
                    onChange={() => onTierChange(i)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={id}
                    className="block cursor-pointer rounded-full px-2 py-1.5 text-center text-xs font-semibold text-ink-soft transition-colors hover:text-ink peer-checked:bg-ink peer-checked:text-paper-2"
                  >
                    {t.tier}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-3 flex-1 rounded-xl border border-line bg-paper p-3">
          <p className="text-sm font-medium text-ink">{tier.item}</p>
          <p className="mt-1 text-sm font-semibold text-coral-deep">
            {tier.price}
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-2.5 border-t border-line pt-4 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={owned}
            onChange={() => toggleEquipment(category.id)}
            className="h-4 w-4 accent-emerald"
          />
          I already have this
        </label>
      </div>
    </Reveal>
  );
}
