"use client";

import { useId } from "react";
import conduct from "@/data/conduct.json";
import { usePath } from "@/lib/path-context";
import { ExportButton } from "@/components/practice";
import { labToMarkdown } from "@/lib/markdown-export";
import {
  Button,
  Callout,
  Card,
  Checkbox,
  Field,
  Icon,
  Input,
  Textarea,
} from "@/components/ui";
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
        className="animate-pulse rounded-lg border border-line-strong bg-paper p-6 lg:p-10"
      >
        <div className="h-4 w-2/3 rounded-sm bg-line" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-md bg-line/50" />
          ))}
        </div>
        <div className="mt-8 h-40 rounded-md bg-line/50" />
      </div>
    );
  }

  const { clauses, commitment, name, signedAt } = state.oath;

  // The clauses the visitor ticked, in oath order. This is the record the
  // signature stands behind: "I can keep these N", not "I can keep all ten".
  const kept = oath.clauses
    .map((c, idx) => ({ ...c, n: idx + 1 }))
    .filter((c) => clauses[c.id]);
  const accepted = kept.length;
  const allAccepted = accepted === oath.clauses.length;
  const commitmentLongEnough = commitment.trim().length >= MIN_COMMITMENT;
  const canSign = accepted >= 1 && commitmentLongEnough && name.trim().length > 1;
  const signed = signedAt !== null;

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
    <div className="flex flex-col">
      {/* ---------------------------------------------------------- CLAUSES */}
      <Field
        as="group"
        label="Step 1 · Read each one. Tick only what you can keep."
        hint={signed ? "Signed. Press “Revise it” below to change what you ticked." : undefined}
      >
        <ul className="mt-5 flex flex-col gap-2">
          {oath.clauses.map((c, idx) => {
            const on = !!clauses[c.id];
            return (
              <li key={c.id}>
                <Card
                  padding="sm"
                  className={cn(on && "border-verified bg-verified-tint")}
                >
                  <Checkbox
                    id={`${uid}-${c.id}`}
                    checked={on}
                    disabled={signed}
                    onChange={() => toggleOathClause(c.id)}
                    label={
                      <span className="flex flex-col gap-1">
                        <span className="text-caption font-bold tabular-nums tracking-widest text-ink-faint">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={cn("text-small leading-relaxed", on ? "text-ink" : "text-ink-soft")}>
                          {c.text}
                        </span>
                      </span>
                    }
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      </Field>

      <p
        className="mt-4 text-xs text-ink-faint"
        aria-live="polite"
        suppressHydrationWarning
      >
        {hydrated ? `${accepted} of ${oath.clauses.length} accepted.` : " "}{" "}
        {hydrated && !allAccepted && accepted > 0 && (
          <span className="text-primary-deep">
            Leaving one unticked is an honest answer. Write down what you&rsquo;d
            have to change to tick it.
          </span>
        )}
      </p>

      {/* ------------------------------------------------------ COMMITMENT */}
      <div className="mt-10 border-t border-line pt-8">
        <Field
          label="Step 2 · Now write the part we can’t write for you"
          hint={oath.commitmentPrompt}
        >
          <Textarea
            value={commitment}
            onChange={(e) => updateOath({ commitment: e.target.value })}
            rows={7}
            placeholder={oath.commitmentPlaceholder}
          />
        </Field>
        <p className="mt-2 text-xs text-ink-faint" suppressHydrationWarning>
          {commitment.trim().length} characters.{" "}
          {!commitmentLongEnough &&
            "A sentence you could never fail isn't a commitment, get specific about the moment it gets tested."}
        </p>
      </div>

      {/* ---------------------------------------------------- SELF-CRITIQUE */}
      <Callout tone="caution" icon="alert-triangle" title="Step 3 · Judge your own draft" className="mt-8">
        <ul className="mt-3 flex flex-col gap-2">
          {oath.selfCritique.map((q) => (
            <li key={q} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-caution" />
              {q}
            </li>
          ))}
        </ul>
      </Callout>

      {/* ------------------------------------------------------------- SIGN */}
      <div className="mt-10 border-t border-line pt-8">
        {signed ? (
          <Callout tone="verified" className="flex-col items-stretch gap-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <Icon name="shield-check" size={20} />
                <div>
                  <p className="font-display text-xl leading-tight text-ink">
                    Signed by {name.trim()}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft" suppressHydrationWarning>
                    {signedDate} · {oath.signedNote}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft" data-testid="oath-kept">
                    Kept {accepted} of {oath.clauses.length}:{" "}
                    <span className="tabular-nums">
                      {kept.map((c) => String(c.n).padStart(2, "0")).join(", ")}
                    </span>
                    {!allAccepted && ". The unticked ones are the honest part."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ExportButton
                  title="my integrity oath"
                  kind="markdown"
                  filename="my-integrity-oath.md"
                  label="Save what I wrote"
                  build={() =>
                    labToMarkdown("My integrity oath", [
                      { label: "My commitment", body: commitment.trim() },
                      { label: "Signed", body: `${name.trim()} · ${signedDate}` },
                      {
                        label: "Clauses I can keep",
                        body: `${accepted} of ${oath.clauses.length}: ${kept
                          .map((c) => `${String(c.n).padStart(2, "0")} ${c.id}`)
                          .join(", ")}`,
                      },
                    ])
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unsign}
                  icon={<Icon name="rotate-ccw" size={14} />}
                >
                  Revise it
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-verified/30 pt-4">
              <span className="text-sm font-medium text-ink">Next:</span>
              <Button
                href="/legit"
                variant="link"
                iconEnd={<Icon name="arrow-right" size={15} />}
              >
                Get your contracts right
              </Button>
              <Button
                href="/get-hired"
                variant="link"
                iconEnd={<Icon name="arrow-right" size={15} />}
              >
                Go get hired
              </Button>
            </div>
          </Callout>
        ) : (
          <Field label={`Step 4 · ${oath.signPrompt}`}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                value={name}
                onChange={(e) => updateOath({ name: e.target.value })}
                placeholder="Your full name"
                autoComplete="name"
                className="sm:max-w-xs"
              />
              <Button
                onClick={sign}
                disabled={!canSign}
                icon={<Icon name="pen-line" size={15} />}
              >
                Sign the oath
              </Button>
            </div>
            {!canSign && (
              <p className="mt-3 text-xs text-ink-faint" aria-live="polite">
                {accepted === 0
                  ? "Tick at least one clause you can keep. You don't have to tick all ten."
                  : !commitmentLongEnough
                    ? "Write your commitment in step 2 first. This is the part that holds."
                    : "Add your name to sign."}
              </p>
            )}
          </Field>
        )}
        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          {oath.signedNote} There is no account, no server, and no copy of this
          anywhere else. If that makes the oath feel less binding, sit with that, it&rsquo;s the whole lesson.
        </p>
      </div>
    </div>
  );
}
