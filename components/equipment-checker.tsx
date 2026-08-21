"use client";

import { useState } from "react";
import { usePath } from "@/lib/path-context";
import {
  Badge,
  Card,
  Checkbox,
  Field,
  Heading,
  Icon,
  Kicker,
  ProgressBar,
  Radio,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
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

/** Parse the first amount in a rough range so the checker can show a low-end plan. */
function parseLowPrice(price: string): number {
  const match = price.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function isMonthly(price: string): boolean {
  return /\/mo/i.test(price);
}

export function EquipmentChecker({ categories }: { categories: Category[] }) {
  const { state, hydrated } = usePath();
  const [tierIndex, setTierIndex] = useState<Record<string, number>>({});

  // Gate on hydration: state.equipment is empty until localStorage loads, so a
  // returning user would otherwise see every item unchecked and the full
  // (inflated) cost estimate flash before their real progress paints in.
  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-md border border-line bg-paper"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-md border border-line bg-paper" />
      </div>
    );
  }

  const getTierIndex = (cat: Category) =>
    tierIndex[cat.id] ?? Math.min(DEFAULT_TIER_INDEX, cat.tiers.length - 1);

  const essentials = categories.filter((c) => c.essential);
  const readyCount = essentials.filter((c) => state.equipment[c.id]).length;
  const totalEssentials = essentials.length;
  const allReady = totalEssentials > 0 && readyCount === totalEssentials;

  const remaining = totalEssentials - readyCount;
  const message = allReady
    ? "You're ready to apply!"
    : readyCount === 0
      ? "Let's get you prepared, check off what you already have."
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
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            tierIndex={getTierIndex(category)}
            onTierChange={(i) =>
              setTierIndex((prev) => ({ ...prev, [category.id]: i }))
            }
          />
        ))}
      </div>

      <Card as="section" padding="md" className="gap-6 lg:sticky lg:top-24">
        <div
          className="flex flex-col items-center text-center"
          aria-live="polite"
        >
          <ProgressBar
            value={readyCount}
            max={totalEssentials}
            label={`${readyCount} of ${totalEssentials} essentials ready`}
            showValue
            tone="verified"
          />
          <p
            className={cn(
              "mt-4 text-sm font-semibold text-balance",
              allReady ? "text-verified" : "text-ink",
            )}
          >
            {message}
          </p>
          <Kicker tone={allReady ? "verified" : "neutral"} className="mt-1">
            {readyCount} of {totalEssentials} essentials ready
          </Kicker>
        </div>

        <div className="border-t border-line pt-5">
          <StatStrip>
            <Stat
              value={`₱${estimateTotal.toLocaleString("en-PH")}`}
              label="Low-end planning total"
              sub="Adds the first amount in each rough one-time range you have not checked off. It is a planning floor, not a quote. Monthly service costs are excluded; check each card for any /mo allowance."
            />
          </StatStrip>
        </div>
      </Card>
    </div>
  );
}

function CategoryCard({
  category,
  tierIndex,
  onTierChange,
}: {
  category: Category;
  tierIndex: number;
  onTierChange: (i: number) => void;
}) {
  const { state, toggleEquipment } = usePath();
  const owned = !!state.equipment[category.id];
  const tier = category.tiers[tierIndex] ?? category.tiers[0];

  return (
    <Card
      padding="md"
      className={cn("h-full", owned && "border-verified bg-verified-tint")}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
            category.essential
              ? "bg-primary-tint text-primary-deep"
              : "bg-info-tint text-info",
          )}
        >
          <Icon name={category.icon} size={20} />
        </span>
        <div>
          <Heading level={3} size="h5">
            {category.name}
          </Heading>
          <Badge
            tone={category.essential ? "signal" : "neutral"}
            className="mt-1.5"
          >
            {category.essential ? "Essential" : "Optional"}
          </Badge>
        </div>
      </div>

      <Text size="small" className="mt-3 leading-relaxed">
        {category.note}
      </Text>

      <Field as="group" label="Pick a tier" className="mt-5">
        <div className="grid grid-cols-3 gap-2">
          {category.tiers.map((t, i) => (
            <Radio
              key={t.tier}
              id={`${category.id}-tier-${i}`}
              name={`tier-${category.id}`}
              checked={i === tierIndex}
              onChange={() => onTierChange(i)}
              label={t.tier}
            />
          ))}
        </div>
      </Field>

      <div className="mt-3 flex-1 rounded-sm border border-line bg-paper p-3">
        <p className="text-sm font-medium text-ink">{tier.item}</p>
        <p className="mt-1 text-sm font-semibold text-primary-deep">
          {tier.price}
        </p>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <Checkbox
          checked={owned}
          onChange={() => toggleEquipment(category.id)}
          label="I already have this"
        />
      </div>
    </Card>
  );
}
