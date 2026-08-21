"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Card,
  Field,
  Heading,
  Icon,
  Input,
  Kicker,
  Select,
  Stat,
  StatStrip,
  Text,
} from "@/components/ui";
import {
  type Post,
  type RateUnit,
  toMonthlyPhp,
  spreadFromPosts,
} from "@/lib/worksheet-math";
import { cn } from "@/lib/utils";
import { migrateKey } from "@/lib/storage";

const KEY = "hfph.worksheet.v1";
const DEFAULT_FX = 60;

const UNITS: { value: RateUnit; label: string }[] = [
  { value: "php_month", label: "₱/mo" },
  { value: "php_fortnight", label: "₱/fortnight" },
  { value: "php_hour", label: "₱/hr" },
  { value: "usd_hour", label: "$/hr" },
];

// Six real listings from OnlineJobs.ph, July 2026 (range posts shown at their
// midpoint). The last states no rate — left in on purpose: a post that hides its
// number can't price you, and spotting that is the skill. Users replace these
// with posts they find themselves.
const SEED: Post[] = [
  { id: "seed-1", role: "Bookkeeper (full-time)", amount: 60000, unit: "php_month", source: "OnlineJobs.ph" },
  { id: "seed-2", role: "Virtual Medical Assistant", amount: 7, unit: "usd_hour", source: "OnlineJobs.ph" },
  { id: "seed-3", role: "Executive Assistant", amount: 10000, unit: "php_fortnight", source: "OnlineJobs.ph" },
  { id: "seed-4", role: "Media Buyer, Google Ads (₱30–40k)", amount: 35000, unit: "php_month", source: "OnlineJobs.ph" },
  { id: "seed-5", role: "Amazon Product Researcher (₱30–60k)", amount: 45000, unit: "php_month", source: "OnlineJobs.ph" },
  { id: "seed-6", role: "Social Media Manager (rate not stated)", amount: 0, unit: "php_month", source: "OnlineJobs.ph" },
];

const php = (n: number) =>
  "₱" + Math.round(n).toLocaleString("en-PH");

export function RateWorksheet() {
  const [fx, setFx] = useState(DEFAULT_FX);
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    migrateKey("devup.worksheet.v1", KEY);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { fx?: number; posts?: Post[] };
        /* eslint-disable react-hooks/set-state-in-effect */
        if (typeof parsed.fx === "number") setFx(parsed.fx);
        if (Array.isArray(parsed.posts)) setPosts(parsed.posts);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ fx, posts }));
    } catch {
      /* storage full / disabled */
    }
  }, [fx, posts, hydrated]);

  const spread = useMemo(() => spreadFromPosts(posts, fx), [posts, fx]);
  const hidden = posts.filter((p) => !(p.amount > 0)).length;

  function update(id: string, patch: Partial<Post>) {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function remove(id: string) {
    setPosts((ps) => ps.filter((p) => p.id !== id));
  }
  function add() {
    setPosts((ps) => [
      ...ps,
      { id: `p-${Date.now()}`, role: "", amount: 0, unit: "php_month" },
    ]);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker tone="signal">Price from live posts</Kicker>
          <Heading level={3} className="mt-2 max-w-xl leading-snug">
            Don&rsquo;t quote a number. Read it off the market.
          </Heading>
        </div>
        <Field label="Assumed pesos per US dollar" hideLabel className="w-auto">
          <div className="flex items-center gap-2">
            <Text size="small" as="span">
              Assumed FX ₱
            </Text>
            <Input
              type="number"
              min={1}
              value={fx}
              onChange={(e) => setFx(Number(e.target.value) || DEFAULT_FX)}
              aria-label="Assumed pesos per US dollar"
              className="w-20 text-right tabular-nums"
            />
            <Text size="small" as="span">
              / $1
            </Text>
          </div>
        </Field>
      </div>

      <Text size="small" className="mt-4 max-w-2xl leading-relaxed">
        Paste in real listings you found for your role, each normalized to ₱/month
        at full-time hours. Five posts beat any salary guide, because they are what
        clients are paying right now.
      </Text>

      {/* rows */}
      <div className="mt-6 space-y-2">
        <div className="hidden grid-cols-[1fr_7rem_8rem_7rem_2rem] gap-2 px-1 text-xs font-medium text-ink-faint sm:grid">
          <span>Role, as posted</span>
          <span className="text-right">Rate</span>
          <span>Per</span>
          <span className="text-right">₱/month</span>
          <span />
        </div>
        {posts.map((p) => {
          const monthly = toMonthlyPhp(p.amount, p.unit, fx);
          return (
            <div
              key={p.id}
              className="grid grid-cols-2 gap-2 rounded-sm border border-line bg-paper p-2 sm:grid-cols-[1fr_7rem_8rem_7rem_2rem] sm:items-center sm:border-transparent sm:bg-transparent sm:p-1"
            >
              <Input
                value={p.role}
                onChange={(e) => update(p.id, { role: e.target.value })}
                placeholder="e.g. Bookkeeper"
                aria-label="Role"
                className="col-span-2 sm:col-span-1"
              />
              <Input
                type="number"
                min={0}
                value={p.amount || ""}
                onChange={(e) => update(p.id, { amount: Number(e.target.value) || 0 })}
                placeholder="0"
                aria-label="Rate amount"
                className="text-right tabular-nums"
              />
              <Select
                value={p.unit}
                onChange={(e) => update(p.id, { unit: e.target.value as RateUnit })}
                aria-label="Rate unit"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
              <span
                className={cn(
                  "text-right text-small tabular-nums",
                  monthly === null ? "text-ink-faint" : "text-ink",
                )}
              >
                {monthly === null ? "—" : php(monthly)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(p.id)}
                aria-label="Remove post"
                className="justify-self-end"
                icon={<Icon name="trash" size={15} />}
              >
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={add} icon={<Icon name="plus" size={15} />}>
          Add a post you found
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPosts(SEED)}
          icon={<Icon name="rotate-ccw" size={15} />}
        >
          Reset to examples
        </Button>
      </div>

      {/* result */}
      {spread ? (
        <Card padding="md" className="mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <Kicker>Your evidence range</Kicker>
            <Badge>
              {spread.n} post{spread.n === 1 ? "" : "s"} with a stated rate
            </Badge>
          </div>
          <StatStrip className="mt-4">
            {[
              { label: "Floor", value: spread.low },
              { label: "Middle", value: spread.median, hero: true },
              { label: "Ceiling", value: spread.high },
            ].map((c) => (
              <Card
                key={c.label}
                padding="sm"
                className={c.hero ? "border-primary bg-primary-tint" : undefined}
              >
                <Stat value={php(c.value)} label={c.label} sub="/month" />
              </Card>
            ))}
          </StatStrip>
          <Callout tone="signal" className="mt-5">
            Just starting and can prove the skill? Aim near the{" "}
            <strong>middle</strong>, not the floor — the floor is where
            under-priced beginners cluster. Experienced with a portfolio? Ask
            between middle and ceiling, and let them talk you down, not up.
          </Callout>
        </Card>
      ) : (
        <Text size="small" tone="faint" className="mt-7">
          Add at least one post with a stated rate to see a range.
        </Text>
      )}

      {hidden > 0 && (
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
          <Icon name="info" size={14} className="mt-0.5 shrink-0" />
          {hidden} post{hidden === 1 ? "" : "s"} here state no rate, so{" "}
          {hidden === 1 ? "it" : "they"} can&rsquo;t price you. A hidden number is
          missing on purpose — never anchor your ask to one.
        </p>
      )}
    </div>
  );
}
