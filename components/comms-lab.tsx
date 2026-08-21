"use client";

import { useEffect, useId, useMemo, useState } from "react";
import english from "@/data/english.json";
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Field,
  Icon,
  Kicker,
  Textarea,
} from "@/components/ui";
import { accent } from "@/lib/accent";
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

/* Longer stock phrases are claimed first and masked out, so "I just wanted to
   reach out" is two filler flags, not filler plus a hedge on "just", and
   "kindly revert" is one dated phrase, not dated plus deference. */
const SCAN_ORDER = ["filler", "dated", "apology", "deference", "hedges"] as const;

const CATEGORIES = english.banlist.categories;
const MAX_PHRASES_SHOWN = 6;
/** Below this, a clean scan says nothing about directness. */
export const MIN_WORDS_FOR_VERDICT = 20;

/** Debounce a value so screen-reader announcements fire after typing pauses,
    not on every keystroke. */
function useDebounced<T>(value: T, delay = 700): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type Tone = "neutral" | "signal" | "verified" | "caution" | "info";

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

/** Blank out a matched span, same length, so later passes cannot re-match it. */
function mask(text: string, index: number, length: number): string {
  return text.slice(0, index) + " ".repeat(length) + text.slice(index + length);
}

export function scan(text: string): ScanResult {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  // Pass 1: claim matches in priority order on a progressively masked copy.
  let remaining = text;
  const countsByCategory = new Map<string, Map<string, number>>();
  for (const id of SCAN_ORDER) {
    const pattern = PATTERNS[id];
    const counts = new Map<string, number>();
    // matchAll clones the regex, so the module-level /g lastIndex is never mutated.
    for (const match of remaining.matchAll(pattern)) {
      const phrase = match[0].toLowerCase().replace(/\s+/g, " ");
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      remaining = mask(remaining, match.index ?? 0, match[0].length);
    }
    if (counts.size > 0) countsByCategory.set(id, counts);
  }

  // Pass 2: report in the banlist's own order, the one the page teaches.
  let total = 0;
  const groups: CategoryHit[] = [];
  for (const cat of CATEGORIES) {
    const counts = countsByCategory.get(cat.id);
    if (!counts) continue;

    const ranked = Array.from(counts, ([phrase, count]) => ({ phrase, count })).sort(
      (a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase),
    );
    const catTotal = ranked.reduce((sum, p) => sum + p.count, 0);

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

export function readDirectness({ total, words }: ScanResult): Verdict {
  if (words === 0)
    return {
      label: "Waiting",
      note: "Paste something in and the scan runs as you type.",
      tone: "neutral",
    };
  if (total === 0 && words < MIN_WORDS_FOR_VERDICT)
    return {
      label: "Too short",
      note: `Nothing flagged, but under ${MIN_WORDS_FOR_VERDICT} words says nothing yet. Paste a full message.`,
      tone: "neutral",
    };
  if (total === 0)
    return {
      label: "Direct",
      note: "Nothing flagged. This reads like the person in charge of the thing.",
      tone: "verified",
    };

  const per50 = (total / words) * 50;
  if (per50 < 3)
    return {
      label: "Mostly direct",
      note: "A couple of soft spots. Cut them and nothing else has to change.",
      tone: "caution",
    };
  if (per50 < 6)
    return {
      label: "Softened",
      note: "Enough hedging that your point is negotiable before you've even made it.",
      tone: "signal",
    };
  return {
    label: "Buried",
    note: "The message is in there. The reader has to dig for it, and most won't.",
    tone: "signal",
  };
}

/* ------------------------------------------------------------------ VIEW */
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
    <Card as="section" padding="md" className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Kicker>Flags found</Kicker>
          <p id={labelledBy} className="mt-1 font-display text-h2 tabular-nums text-ink">
            {result.total}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {result.words} {result.words === 1 ? "word" : "words"} scanned
          </p>
        </div>
        <div className="text-right">
          <Kicker>Directness</Kicker>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              accent(verdict.tone).text,
            )}
          >
            {verdict.label}
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">{verdict.note}</p>

      {result.total === 0 ? (
        <Callout tone="verified">
          {typeof cleared === "number" && cleared > 0 && result.words > 0 && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-verified">
              <Icon name="shield-check" size={14} />
              You cut {cleared} {cleared === 1 ? "flag" : "flags"}. That was you,
              not us.
            </p>
          )}
          <p className="text-sm font-semibold text-ink">
            {english.lab.cleanTitle}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            {result.words >= MIN_WORDS_FOR_VERDICT
              ? english.lab.cleanBody
              : english.lab.cleanShortBody}
          </p>
        </Callout>
      ) : (
        <ul className="flex flex-col gap-4 border-t border-line pt-5">
          {result.groups.map((g) => (
            <li key={g.id}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn("h-2 w-2 shrink-0 rounded-full", accent(g.accent).fill)}
                />
                <p className={cn("text-kicker uppercase", accent(g.accent).text)}>{g.label}</p>
                <span className="ml-auto text-xs font-semibold text-ink">
                  {g.total}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {g.phrases.map((p) => (
                  <li key={p.phrase}>
                    <Badge className="font-mono tabular-nums">
                      {p.phrase}
                      {p.count > 1 && (
                        <span className="text-ink-faint"> ×{p.count}</span>
                      )}
                    </Badge>
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
    </Card>
  );
}

export function CommsLab() {
  const uid = useId();
  const [original, setOriginal] = useState("");
  const [rewrite, setRewrite] = useState("");

  const originalResult = useMemo(() => scan(original), [original]);
  const rewriteResult = useMemo(() => scan(rewrite), [rewrite]);

  const cleared = Math.max(0, originalResult.total - rewriteResult.total);

  // Announce a short debounced summary to screen readers instead of
  // re-reading the whole flag list on every keystroke.
  const liveOriginal = useDebounced(
    original.trim()
      ? `${originalResult.total} ${originalResult.total === 1 ? "flag" : "flags"} found. ${readDirectness(originalResult).label}.`
      : "",
  );
  const liveRewrite = useDebounced(
    rewrite.trim()
      ? `Rewrite: ${rewriteResult.total} ${rewriteResult.total === 1 ? "flag" : "flags"} found. ${readDirectness(rewriteResult).label}.`
      : "",
  );

  return (
    <div className="flex flex-col">
      <Badge tone="verified">
        <Icon name="shield-check" size={13} />
        Runs in your browser. Nothing is uploaded, stored, or sent anywhere.
      </Badge>

      <p aria-live="polite" className="sr-only">
        {liveOriginal}
      </p>
      <p aria-live="polite" className="sr-only">
        {liveRewrite}
      </p>

      {/* ------------------------------------------------------ PASS 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-3">
          <Field label="Paste a real message you sent a client">
            <Textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={english.lab.placeholder}
            />
          </Field>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOriginal(english.lab.sample)}
              icon={<Icon name="clipboard-paste" size={14} />}
            >
              {english.lab.sampleLabel}
            </Button>
          </div>
        </div>

        <Results result={originalResult} labelledBy={`${uid}-r1`} />
      </div>

      {/* ------------------------------------------------------ PASS 2 */}
      <div className="mt-10 border-t border-line pt-10">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-ink text-on-navy"
          >
            <Icon name="arrow-down" size={16} />
          </span>
          <p className="max-w-2xl font-display text-lg leading-snug text-ink">
            {english.lab.rewritePrompt}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <Field label="Your rewrite, in your own words">
            <Textarea
              value={rewrite}
              onChange={(e) => setRewrite(e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={english.lab.rewritePlaceholder}
            />
          </Field>

          <Results
            result={rewriteResult}
            labelledBy={`${uid}-r2`}
            cleared={cleared}
          />
        </div>
      </div>

      {/* ----------------------------------------------- SELF-CRITIQUE */}
      <Card padding="md" className="mt-10">
        <Field as="group" label="Judge it yourself, five questions, no scores from us">
          <ul className="mt-3 flex flex-col gap-3">
            {english.lab.selfCritique.map((q, idx) => (
              <li key={q}>
                <Checkbox id={`${uid}-critique-${idx}`} label={q} />
              </li>
            ))}
          </ul>
        </Field>
      </Card>
    </div>
  );
}
