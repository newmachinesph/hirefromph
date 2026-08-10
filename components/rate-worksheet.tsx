"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Trash2, Info } from "lucide-react";
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
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-signal">Price from live posts</p>
          <h3 className="mt-2 max-w-xl font-display text-[length:var(--text-h3)] leading-snug">
            Don&rsquo;t quote a number. Read it off the market.
          </h3>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Assumed FX
          <span className="text-ink-faint">₱</span>
          <input
            type="number"
            min={1}
            value={fx}
            onChange={(e) => setFx(Number(e.target.value) || DEFAULT_FX)}
            aria-label="Assumed pesos per US dollar"
            className="w-16 rounded-lg border border-line-strong bg-paper px-2 py-1 text-right font-mono text-sm"
          />
          <span className="text-ink-faint">/ $1</span>
        </label>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Paste in real listings you found for your role, each normalized to ₱/month
        at full-time hours. Five posts beat any salary guide, because they are what
        clients are actually paying right now.
      </p>

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
              className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-paper p-2 sm:grid-cols-[1fr_7rem_8rem_7rem_2rem] sm:items-center sm:border-transparent sm:bg-transparent sm:p-1"
            >
              <input
                value={p.role}
                onChange={(e) => update(p.id, { role: e.target.value })}
                placeholder="e.g. Bookkeeper"
                aria-label="Role"
                className="col-span-2 rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm sm:col-span-1"
              />
              <input
                type="number"
                min={0}
                value={p.amount || ""}
                onChange={(e) => update(p.id, { amount: Number(e.target.value) || 0 })}
                placeholder="0"
                aria-label="Rate amount"
                className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-right font-mono text-sm"
              />
              <select
                value={p.unit}
                onChange={(e) => update(p.id, { unit: e.target.value as RateUnit })}
                aria-label="Rate unit"
                className="rounded-lg border border-line-strong bg-paper px-2 py-1.5 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <span
                className={cn(
                  "text-right font-mono text-sm",
                  monthly === null ? "text-ink-faint" : "text-ink",
                )}
              >
                {monthly === null ? "—" : php(monthly)}
              </span>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Remove post"
                className="grid h-8 w-8 place-items-center justify-self-end rounded-lg text-ink-faint transition-colors hover:bg-paper-3 hover:text-signal"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <Plus size={15} /> Add a post you found
        </button>
        <button
          type="button"
          onClick={() => setPosts(SEED)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <RotateCcw size={15} /> Reset to examples
        </button>
      </div>

      {/* result */}
      {spread ? (
        <div className="mt-7 rounded-2xl border border-line bg-paper-3/60 p-6">
          <p className="kicker">
            Your evidence range · {spread.n} post{spread.n === 1 ? "" : "s"} with a stated rate
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Floor", value: spread.low },
              { label: "Middle", value: spread.median, hero: true },
              { label: "Ceiling", value: spread.high },
            ].map((c) => (
              <div
                key={c.label}
                className={cn(
                  "rounded-xl border p-4",
                  c.hero ? "border-signal bg-signal-tint/40" : "border-line bg-paper-2",
                )}
              >
                <p className="kicker text-ink-faint">{c.label}</p>
                <p className="mt-2 font-display text-xl leading-none sm:text-2xl">
                  {php(c.value)}
                </p>
                <p className="mt-1 font-mono text-[0.7rem] text-ink-faint">/month</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-l-2 border-signal pl-4 text-sm leading-relaxed text-ink">
            Just starting and can prove the skill? Aim near the{" "}
            <strong>middle</strong>, not the floor — the floor is where
            under-priced beginners cluster. Experienced with a portfolio? Ask
            between middle and ceiling, and let them talk you down, not up.
          </p>
        </div>
      ) : (
        <p className="mt-7 text-sm text-ink-faint">
          Add at least one post with a stated rate to see a range.
        </p>
      )}

      {hidden > 0 && (
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
          <Info size={14} className="mt-0.5 shrink-0" />
          {hidden} post{hidden === 1 ? "" : "s"} here state no rate, so{" "}
          {hidden === 1 ? "it" : "they"} can&rsquo;t price you. A hidden number is
          missing on purpose — never anchor your ask to one.
        </p>
      )}
    </div>
  );
}
