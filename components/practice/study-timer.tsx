"use client";

import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import learning from "@/data/learning.json";
import { EMPTY_TIMER, PRACTICE_KEYS, parseTimerState, type TimerPhase } from "@/lib/practice-store";
import { Button, ChoiceCard, Field, Heading, Text } from "@/components/ui";
import { usePracticeSlot } from "./hooks";

export type SessionShape = {
  id: "short" | "medium" | "long";
  focusMinutes: number;
  breakMinutes: number;
};

/**
 * The minutes are here and the words are in `learning.json`. Parsing "25 min
 * focus / 5 min break" out of prose would break the first time the copy was
 * edited; `lib/practice-data.test.ts` asserts the two stay in step instead.
 */
export const SHAPES: readonly SessionShape[] = [
  { id: "short", focusMinutes: 15, breakMinutes: 3 },
  { id: "medium", focusMinutes: 25, breakMinutes: 5 },
  { id: "long", focusMinutes: 50, breakMinutes: 10 },
];

const COPY = learning.protocolRules.sessionShapes;

function minutesFor(shape: SessionShape, phase: TimerPhase): number {
  return phase === "focus" ? shape.focusMinutes : shape.breakMinutes;
}

function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * The three shape rows never depend on the running clock, only on which shape
 * is picked and whether a block is live. `memo` keeps this subtree out of the
 * render path the once-a-second tick otherwise walks through.
 */
const ShapePicker = memo(function ShapePicker({
  groupName,
  selectedId,
  disabled,
  onSelect,
}: {
  groupName: string;
  selectedId: SessionShape["id"];
  disabled: boolean;
  onSelect: (id: SessionShape["id"]) => void;
}) {
  return (
    <Field label="Session shape" as="group" className="gap-3">
      {SHAPES.map((candidate) => {
        const copy = COPY[candidate.id];
        return (
          <ChoiceCard
            key={candidate.id}
            name={groupName}
            value={candidate.id}
            label={copy.label}
            description={
              <>
                <span className="block">{copy.pattern}</span>
                <span className="block text-caption text-ink-faint">{copy.perDay}</span>
              </>
            }
            checked={selectedId === candidate.id}
            onChange={() => onSelect(candidate.id)}
            disabled={disabled}
          />
        );
      })}
    </Field>
  );
});

/**
 * The button row's own click handlers are wrapped in `useCallback` by the
 * parent so this stays skippable too: `hasValue`/`paused` are booleans that
 * only flip at start/pause/resume/reset, never on the once-a-second tick.
 */
const Controls = memo(function Controls({
  hasValue,
  paused,
  onStart,
  onPause,
  onResume,
  onReset,
}: {
  hasValue: boolean;
  paused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {!hasValue && (
        <Button variant="primary" onClick={onStart}>
          Start focus
        </Button>
      )}
      {hasValue && !paused && (
        <Button variant="outline" onClick={onPause}>
          Pause
        </Button>
      )}
      {hasValue && paused && (
        <Button variant="outline" onClick={onResume}>
          Resume
        </Button>
      )}
      {hasValue && (
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
});

/**
 * A focus/break timer with a visible plan (spec §7.4.6).
 *
 * The running block is stored as an *end timestamp* rather than a countdown,
 * so closing the tab and coming back resumes at the right second instead of
 * where the last tick left it.
 */
export function StudyTimer() {
  const baseId = useId();
  const { value, set, hydrated } = usePracticeSlot(PRACTICE_KEYS.timer, EMPTY_TIMER, parseTimerState);
  const [shapeId, setShapeId] = useState<SessionShape["id"]>("medium");
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState("");

  const shape = SHAPES.find((candidate) => candidate.id === (value?.shape ?? shapeId)) ?? SHAPES[1];

  // One interval for the whole component; it only runs while a block is live.
  useEffect(() => {
    if (!value || value.paused) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [value]);

  const startBlock = useCallback(
    (phase: TimerPhase, id: SessionShape["id"]) => {
      const next = SHAPES.find((candidate) => candidate.id === id) ?? SHAPES[1];
      set({
        shape: id,
        phase,
        endsAt: Date.now() + minutesFor(next, phase) * 60_000,
        paused: false,
        remainingMs: 0,
      });
      setNow(Date.now());
    },
    [set],
  );

  const remaining = value
    ? value.paused
      ? value.remainingMs
      : Math.max(0, value.endsAt - now)
    : 0;

  // Reduced to a boolean so the effect below only re-runs at the instant a
  // block actually ends, not on every one-second tick that ticks `now`.
  const hasRunOut = value !== null && !value.paused && remaining <= 0;

  // Roll focus into break (and break into focus) the moment a block runs out.
  useEffect(() => {
    if (!hasRunOut || !value) return;
    const nextPhase: TimerPhase = value.phase === "focus" ? "break" : "focus";
    // Reacting to a real-world timer running out, not deriving state from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnnouncement(nextPhase === "break" ? "Break time. Stand up." : "Back to focus.");
    startBlock(nextPhase, value.shape as SessionShape["id"]);
  }, [hasRunOut, value, startBlock]);

  // Stable handlers so `Controls` below can skip re-rendering on every tick.
  const handleStart = useCallback(() => startBlock("focus", shapeId), [startBlock, shapeId]);
  const handlePause = useCallback(() => {
    if (!value) return;
    set({ ...value, paused: true, remainingMs: Math.max(0, value.endsAt - Date.now()) });
  }, [value, set]);
  const handleResume = useCallback(() => {
    if (!value) return;
    set({ ...value, paused: false, endsAt: Date.now() + value.remainingMs });
  }, [value, set]);
  const handleReset = useCallback(() => {
    set(null);
    setAnnouncement("");
  }, [set]);

  // Never changes after mount, so the reconciler bails out of this subtree
  // on every tick instead of re-visiting two static, non-interactive nodes.
  const header = useMemo(
    () => (
      <div className="flex flex-col gap-2">
        <Heading level={2} size="h4" id={`${baseId}-title`}>
          Run one block now
        </Heading>
        <Text size="small">
          Pick the shape that matches your attention today, then start it. The clock keeps running
          if you switch tabs.
        </Text>
      </div>
    ),
    [baseId],
  );

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-6 rounded-lg border border-line-strong bg-paper p-6">
      {header}

      <ShapePicker
        groupName={`${baseId}-shape`}
        selectedId={shape.id}
        disabled={value !== null}
        onSelect={setShapeId}
      />

      {hydrated && value && (
        <div className="flex flex-col items-start gap-3">
          <p
            role="timer"
            aria-label={`Time left in this ${value.phase} block`}
            className="font-display text-hero tabular-nums text-ink"
          >
            {clock(remaining)}
          </p>
          <Text size="small">
            {value.phase === "focus" ? "Focus block" : "Break"} ·{" "}
            {minutesFor(shape, value.phase)} minutes
          </Text>
        </div>
      )}

      <p role="status" aria-live="polite" className="text-small text-ink-soft">
        {announcement}
      </p>

      <Controls
        hasValue={value !== null}
        paused={value?.paused ?? false}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
      />
    </section>
  );
}
