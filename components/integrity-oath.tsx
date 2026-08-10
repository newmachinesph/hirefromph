"use client";

import { useId } from "react";
import { AlertTriangle, Check, PenLine, RotateCcw, ShieldCheck } from "lucide-react";
import conduct from "@/data/conduct.json";
import { usePath } from "@/lib/path-context";
import { cn } from "@/lib/utils";

const { oath } = conduct;
const MIN_COMMITMENT = 80;

export function IntegrityOath() {
  const uid = useId();
  const { state, hydrated, updateOath, toggleOathClause } = usePath();

  // Gate on hydration: state.oath is empty until localStorage loads. Without
  // this, a returning signer sees the blank, unsigned form flash before their
  // ticked clauses, commitment, name, and "Signed by" panel paint in.
  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="animate-pulse rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 lg:p-10"
      >
        <div className="h-4 w-2/3 rounded bg-line" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-line/50" />
          ))}
        </div>
        <div className="mt-8 h-40 rounded-2xl bg-line/50" />
      </div>
    );
  }

  const { clauses, commitment, name, signedAt } = state.oath;

  const accepted = oath.clauses.filter((c) => clauses[c.id]).length;
  const allAccepted = accepted === oath.clauses.length;
  const commitmentLongEnough = commitment.trim().length >= MIN_COMMITMENT;
  const canSign = allAccepted && commitmentLongEnough && name.trim().length > 1;

  function sign() {
    if (!canSign) return;
    updateOath({ signedAt: new Date().toISOString() });
  }

  function unsign() {
    updateOath({ signedAt: null });
  }

  const signedDate = signedAt
    ? new Date(signedAt).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-6 shadow-[var(--shadow-lg)] lg:p-10">
      {/* ---------------------------------------------------------- CLAUSES */}
      <fieldset>
        <legend className="kicker">
          Step 1 · Read each one. Tick only what you can actually keep.
        </legend>
        <ul className="mt-5 flex flex-col gap-2">
          {oath.clauses.map((c, idx) => {
            const on = !!clauses[c.id];
            const id = `${uid}-${c.id}`;
            return (
              <li key={c.id}>
                <input
                  type="checkbox"
                  id={id}
                  checked={on}
                  onChange={() => toggleOathClause(c.id)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal",
                    on
                      ? "border-verified/40 bg-verified-tint"
                      : "border-line bg-paper hover:border-line-strong",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors",
                      on
                        ? "border-verified bg-verified text-white"
                        : "border-line-strong bg-paper-2",
                    )}
                  >
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-ink-faint">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-sm leading-relaxed",
                        on ? "text-ink" : "text-ink-soft",
                      )}
                    >
                      {c.text}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p
        className="mt-4 text-xs text-ink-faint"
        aria-live="polite"
        suppressHydrationWarning
      >
        {hydrated ? `${accepted} of ${oath.clauses.length} accepted.` : " "}{" "}
        {hydrated && !allAccepted && accepted > 0 && (
          <span className="text-signal-deep">
            Leaving one unticked is an honest answer. Write down what you&rsquo;d
            have to change to tick it.
          </span>
        )}
      </p>

      {/* ------------------------------------------------------ COMMITMENT */}
      <div className="mt-10 border-t border-line pt-8">
        <label htmlFor={`${uid}-commitment`} className="kicker">
          Step 2 · Now write the part we can&rsquo;t write for you
        </label>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {oath.commitmentPrompt}
        </p>
        <textarea
          id={`${uid}-commitment`}
          value={commitment}
          onChange={(e) => updateOath({ commitment: e.target.value })}
          rows={7}
          placeholder={oath.commitmentPlaceholder}
          className="mt-4 w-full rounded-2xl border border-line-strong bg-paper px-4 py-3.5 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink"
        />
        <p className="mt-2 text-xs text-ink-faint" suppressHydrationWarning>
          {commitment.trim().length} characters.{" "}
          {!commitmentLongEnough &&
            "A sentence you could never fail isn't a commitment, get specific about the moment it gets tested."}
        </p>
      </div>

      {/* ---------------------------------------------------- SELF-CRITIQUE */}
      <div className="mt-8 rounded-2xl border border-caution/30 bg-caution-tint/50 p-5">
        <p className="kicker flex items-center gap-1.5 text-caution-text">
          <AlertTriangle size={13} /> Step 3 · Judge your own draft
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {oath.selfCritique.map((q) => (
            <li key={q} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-caution-text" />
              {q}
            </li>
          ))}
        </ul>
      </div>

      {/* ------------------------------------------------------------- SIGN */}
      <div className="mt-10 border-t border-line pt-8">
        {signedAt ? (
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-verified/40 bg-verified-tint p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-verified text-white">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="font-display text-xl leading-tight text-ink">
                  Signed by {name.trim()}
                </p>
                <p className="mt-1 text-sm text-ink-soft" suppressHydrationWarning>
                  {signedDate} · {oath.signedNote}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={unsign}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-paper-2 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <RotateCcw size={14} /> Revise it
            </button>
          </div>
        ) : (
          <>
            <label htmlFor={`${uid}-name`} className="kicker">
              Step 4 · {oath.signPrompt}
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id={`${uid}-name`}
                type="text"
                value={name}
                onChange={(e) => updateOath({ name: e.target.value })}
                placeholder="Your full name"
                autoComplete="name"
                className="w-full rounded-full border border-line-strong bg-paper px-5 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus-visible:border-ink sm:max-w-xs"
              />
              <button
                type="button"
                onClick={sign}
                disabled={!canSign}
                className={cn(
                  "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
                  canSign
                    ? "bg-ink text-paper-2 hover:-translate-y-0.5 hover:bg-signal hover:shadow-[var(--shadow-signal)]"
                    : "cursor-not-allowed bg-paper-3 text-ink-faint",
                )}
              >
                <PenLine size={15} />
                Sign the oath
              </button>
            </div>
            {!canSign && (
              <p className="mt-3 text-xs text-ink-faint" aria-live="polite">
                {!allAccepted
                  ? "Accept every clause you can genuinely keep, all ten, before signing."
                  : !commitmentLongEnough
                    ? "Write your commitment in step 2 first. This is the part that actually holds."
                    : "Add your name to sign."}
              </p>
            )}
          </>
        )}
        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          {oath.signedNote} There is no account, no server, and no copy of this
          anywhere else. If that makes the oath feel less binding, sit with that, it&rsquo;s the whole lesson.
        </p>
      </div>
    </div>
  );
}
