"use client";

import { useId, useMemo, useState } from "react";
import { ArrowDown, Check, ShieldCheck } from "lucide-react";
import english from "@/data/english.json";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- LOGIC */
/* These patterns are logic, not copy, the categories they map to live in
   data/english.json (banlist.categories). Word-boundaried and case-insensitive.
   `\bpo\b` deliberately will not match "possible" or "point". */
const PATTERNS: Record<string, RegExp> = {
  hedges:
    /\b(?:just|maybe|i think|i guess|sort of|kind of|a bit|somewhat|possibly|perhaps|might|hopefully|a little|quite|actually|basically|sana)\b/gi,
  apology:
    /\b(?:sorry|apolog(?:y|ies|ize)|my bad|pasensya|excuse me for|forgive me)\b/gi,
  deference:
    /\b(?:po|opo|sir|ma['’]?am|kindly|humbly|if it['’]?s not too much trouble|with all due respect)\b/gi,
  dated:
    /\b(?:revert back|kindly revert|as per|do the needful|for a while|please be informed|hereby|prior to|at your earliest convenience)\b/gi,
  filler:
    /\b(?:i just wanted to|i hope this (?:email )?finds you well|i hope you(?:['’]re| are) doing well|reach out|touch base|circle back|wanted to check in|let me know when you can)\b|thoughts\?/gi,
};

const CATEGORIES = english.banlist.categories;
const MAX_PHRASES_SHOWN = 6;

type Tone = "neutral" | "coral" | "emerald" | "amber" | "indigo";

type PhraseHit = { phrase: string; count: number };
type CategoryHit = {
  id: string;
  label: string;
  why: string;
  accent: string;
  total: number;
  phrases: PhraseHit[];
  hidden: number;
};
type ScanResult = { total: number; words: number; groups: CategoryHit[] };

function scan(text: string): ScanResult {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  let total = 0;
  const groups: CategoryHit[] = [];

  for (const cat of CATEGORIES) {
    const pattern = PATTERNS[cat.id];
    if (!pattern) continue;

    const counts = new Map<string, number>();
    let catTotal = 0;
    // matchAll clones the regex, so the module-level /g lastIndex is never mutated.
    for (const match of text.matchAll(pattern)) {
      const phrase = match[0].toLowerCase().replace(/\s+/g, " ");
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      catTotal += 1;
    }
    if (catTotal === 0) continue;

    const ranked = Array.from(counts, ([phrase, count]) => ({ phrase, count })).sort(
      (a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase),
    );

    total += catTotal;
    groups.push({
      id: cat.id,
      label: cat.label,
      why: cat.why,
      accent: cat.accent,
      total: catTotal,
      phrases: ranked.slice(0, MAX_PHRASES_SHOWN),
      hidden: Math.max(0, ranked.length - MAX_PHRASES_SHOWN),
    });
  }

  return { total, words, groups };
}

type Verdict = { label: string; note: string; tone: Tone };

function readDirectness({ total, words }: ScanResult): Verdict {
  if (words === 0)
    return {
      label: "Waiting",
      note: "Paste something in and the scan runs as you type.",
      tone: "neutral",
    };
  if (total === 0)
    return {
      label: "Direct",
      note: "Nothing flagged. This reads like the person in charge of the thing.",
      tone: "emerald",
    };

  const per50 = (total / words) * 50;
  if (per50 < 3)
    return {
      label: "Mostly direct",
      note: "A couple of soft spots. Cut them and nothing else has to change.",
      tone: "amber",
    };
  if (per50 < 6)
    return {
      label: "Softened",
      note: "Enough hedging that your point is negotiable before you've even made it.",
      tone: "coral",
    };
  return {
    label: "Buried",
    note: "The message is in there. The reader has to dig for it, and most won't.",
    tone: "coral",
  };
}

/* ------------------------------------------------------------------ VIEW */
const accentText: Record<string, string> = {
  coral: "text-coral-deep",
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
const verdictText: Record<Tone, string> = {
  neutral: "text-ink-faint",
  coral: "text-coral-deep",
  amber: "text-[#9a6b00]",
  emerald: "text-emerald",
  indigo: "text-indigo",
};

function Results({
  result,
  labelledBy,
  cleared,
}: {
  result: ScanResult;
  labelledBy: string;
  /** flags removed vs. the original message, only shown on the rewrite panel */
  cleared?: number;
}) {
  const verdict = readDirectness(result);

  return (
    <aside
      aria-live="polite"
      aria-labelledby={labelledBy}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-paper p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id={labelledBy} className="kicker">
            Flags found
          </p>
          <p className="mt-1 font-display text-4xl leading-none text-ink">
            {result.total}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {result.words} {result.words === 1 ? "word" : "words"} scanned
          </p>
        </div>
        <div className="text-right">
          <p className="kicker">Directness</p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              verdictText[verdict.tone],
            )}
          >
            {verdict.label}
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">{verdict.note}</p>

      {result.total === 0 ? (
        <div className="rounded-xl border border-emerald/30 bg-emerald-tint p-4">
          {typeof cleared === "number" && cleared > 0 && result.words > 0 && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald">
              <ShieldCheck size={14} aria-hidden />
              You cut {cleared} {cleared === 1 ? "flag" : "flags"}. That was you,
              not us.
            </p>
          )}
          <p className="text-sm font-semibold text-ink">
            {english.lab.cleanTitle}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            {english.lab.cleanBody}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4 border-t border-line pt-5">
          {result.groups.map((g) => (
            <li key={g.id}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn("h-2 w-2 shrink-0 rounded-full", accentBar[g.accent])}
                />
                <p className={cn("kicker", accentText[g.accent])}>{g.label}</p>
                <span className="ml-auto text-xs font-semibold text-ink">
                  {g.total}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {g.phrases.map((p) => (
                  <li
                    key={p.phrase}
                    className="rounded-md border border-line-strong bg-paper-2 px-2 py-1 font-mono text-[11px] text-ink"
                  >
                    {p.phrase}
                    {p.count > 1 && (
                      <span className="text-ink-faint"> ×{p.count}</span>
                    )}
                  </li>
                ))}
                {g.hidden > 0 && (
                  <li className="px-1 py-1 text-[11px] text-ink-faint">
                    +{g.hidden} more
                  </li>
                )}
              </ul>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{g.why}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export function CommsLab() {
  const uid = useId();
  const [original, setOriginal] = useState("");
  const [rewrite, setRewrite] = useState("");

  const originalResult = useMemo(() => scan(original), [original]);
  const rewriteResult = useMemo(() => scan(rewrite), [rewrite]);

  const cleared = Math.max(0, originalResult.total - rewriteResult.total);

  return (
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-lg)] lg:p-8">
      <Pill tone="emerald">
        <ShieldCheck size={13} aria-hidden />
        Runs in your browser. Nothing is uploaded, stored, or sent anywhere.
      </Pill>

      {/* ------------------------------------------------------ PASS 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${uid}-original`}
            className="text-sm font-semibold text-ink"
          >
            Paste a real message you sent a client
          </label>
          <textarea
            id={`${uid}-original`}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder={english.lab.placeholder}
            className="w-full resize-y rounded-2xl border border-line-strong bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
          />
        </div>

        <Results result={originalResult} labelledBy={`${uid}-r1`} />
      </div>

      {/* ------------------------------------------------------ PASS 2 */}
      <div className="mt-10 border-t border-line pt-10">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-paper-2"
          >
            <ArrowDown size={16} />
          </span>
          <p className="max-w-2xl font-display text-lg leading-snug text-ink">
            {english.lab.rewritePrompt}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${uid}-rewrite`}
              className="text-sm font-semibold text-ink"
            >
              Your rewrite, in your own words
            </label>
            <textarea
              id={`${uid}-rewrite`}
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={english.lab.rewritePlaceholder}
              className="w-full resize-y rounded-2xl border border-line-strong bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
            />
          </div>

          <Results
            result={rewriteResult}
            labelledBy={`${uid}-r2`}
            cleared={cleared}
          />
        </div>
      </div>

      {/* ----------------------------------------------- SELF-CRITIQUE */}
      <fieldset className="mt-10 rounded-2xl border border-line bg-paper p-6">
        <legend className="kicker px-2">
          Judge it yourself, five questions, no scores from us
        </legend>
        <ul className="mt-3 flex flex-col gap-3">
          {english.lab.selfCritique.map((q, idx) => {
            const id = `${uid}-critique-${idx}`;
            return (
              <li key={q}>
                <input type="checkbox" id={id} className="peer sr-only" />
                <label
                  htmlFor={id}
                  className="group flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft transition-colors hover:text-ink peer-checked:text-ink-faint peer-checked:line-through peer-checked:[&>span]:border-emerald peer-checked:[&>span]:bg-emerald peer-checked:[&>span]:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-coral"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line-strong bg-paper-2 text-transparent transition-colors group-hover:border-ink">
                    <Check size={13} strokeWidth={3} aria-hidden />
                  </span>
                  {q}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
