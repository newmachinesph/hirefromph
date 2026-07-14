"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import labsData from "@/data/labs.json";
import { Icon } from "@/components/icon";
import { CopyButton } from "@/components/copy-button";
import { Pill } from "@/components/ui";
import { cn } from "@/lib/utils";

type Lab = (typeof labsData)["labs"][number];

const EASE = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_TONE: Record<string, "emerald" | "amber" | "coral"> = {
  Beginner: "emerald",
  Intermediate: "amber",
  Advanced: "coral",
};

const TABS = [
  { id: "why", label: "Why Build It", icon: "help-circle" },
  { id: "study", label: "Study First", icon: "search" },
  { id: "anatomy", label: "Anatomy", icon: "layers" },
  { id: "decisions", label: "Decisions", icon: "git-branch" },
  { id: "workshop", label: "The Workshop", icon: "hammer" },
  { id: "critique", label: "Critique Your Work", icon: "check-square" },
  { id: "buildreal", label: "Build It For Real", icon: "rocket" },
] as const;

type TabId = (typeof TABS)[number]["id"];


/** Assembles the user's own answers into plain text, never our copy. */
function buildDocument(lab: Lab, laAnswers: Record<string, string>): string {
  return lab.builder.steps
    .map((step) => {
      const value = laAnswers[step.id]?.trim();
      return value ? `${step.label.toUpperCase()}\n${value}` : null;
    })
    .filter((s): s is string => Boolean(s))
    .join("\n\n");
}

export function BuildLabs() {
  const labs = labsData.labs;
  const categoryChips = [{ id: "all", label: "All" }, ...labsData.categories];

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("why");
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [checked, setChecked] = useState<Record<string, Record<number, boolean>>>({});

  const filtered =
    activeCategory === "all"
      ? labs
      : labs.filter((l) => l.category === activeCategory);
  const selectedLab = labs.find((l) => l.id === selectedLabId) ?? null;

  function openLab(id: string) {
    setSelectedLabId(id);
    setActiveTab("why");
  }

  function updateAnswer(labId: string, stepId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [labId]: { ...prev[labId], [stepId]: value },
    }));
  }

  function toggleChecked(labId: string, index: number) {
    setChecked((prev) => ({
      ...prev,
      [labId]: { ...prev[labId], [index]: !prev[labId]?.[index] },
    }));
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {!selectedLab ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((c) => {
                const active = activeCategory === c.id;
                const count =
                  c.id === "all"
                    ? labs.length
                    : labs.filter((l) => l.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                      active
                        ? "border-ink bg-ink text-paper-2"
                        : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {c.label}
                    <span className={active ? "text-paper-2/60" : "text-ink-faint"}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((lab) => (
                  <motion.button
                    key={lab.id}
                    layout
                    type="button"
                    onClick={() => openLab(lab.id)}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-paper-2 transition-colors group-hover:bg-coral">
                        <Icon name={lab.icon} size={20} />
                      </span>
                      <Pill tone={DIFFICULTY_TONE[lab.difficulty] ?? "neutral"}>
                        {lab.difficulty}
                      </Pill>
                    </div>
                    <h3 className="mt-5 font-display text-xl leading-tight">{lab.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                      {lab.outcome}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-xs font-medium text-ink-faint">{lab.time}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                        Open the lab
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
              <p className="mt-10 text-center text-sm text-ink-faint">
                No labs in this category yet.
              </p>
            )}
          </motion.div>
        ) : (
          <LabDetail
            key={selectedLab.id}
            lab={selectedLab}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            answers={answers[selectedLab.id] ?? {}}
            onAnswerChange={(stepId, value) => updateAnswer(selectedLab.id, stepId, value)}
            checked={checked[selectedLab.id] ?? {}}
            onToggleChecked={(idx) => toggleChecked(selectedLab.id, idx)}
            onBack={() => setSelectedLabId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type LabDetailProps = {
  lab: Lab;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  answers: Record<string, string>;
  onAnswerChange: (stepId: string, value: string) => void;
  checked: Record<number, boolean>;
  onToggleChecked: (index: number) => void;
  onBack: () => void;
};

function LabDetail({
  lab,
  activeTab,
  onTabChange,
  answers,
  onAnswerChange,
  checked,
  onToggleChecked,
  onBack,
}: LabDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        Back to all labs
      </button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-paper-2">
            <Icon name={lab.icon} size={24} />
          </span>
          <div>
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{lab.name}</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">
              {lab.outcome}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill tone={DIFFICULTY_TONE[lab.difficulty] ?? "neutral"}>{lab.difficulty}</Pill>
          <Pill>{lab.time}</Pill>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={`${lab.name}, lab sections`}
        className="mt-6 flex gap-2 overflow-x-auto pb-2"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                active
                  ? "border-ink bg-ink text-paper-2"
                  : "border-line-strong bg-paper-2 text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-8"
        >
          {activeTab === "why" && <WhyTab lab={lab} />}
          {activeTab === "study" && <StudyTab lab={lab} />}
          {activeTab === "anatomy" && <AnatomyTab lab={lab} />}
          {activeTab === "decisions" && <DecisionsTab lab={lab} />}
          {activeTab === "workshop" && (
            <WorkshopTab lab={lab} answers={answers} onAnswerChange={onAnswerChange} />
          )}
          {activeTab === "critique" && (
            <CritiqueTab
              lab={lab}
              checked={checked}
              onToggleChecked={onToggleChecked}
            />
          )}
          {activeTab === "buildreal" && (
            <BuildRealTab lab={lab} answers={answers} onGoToWorkshop={() => onTabChange("workshop")} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function WhyTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl">
      <p className="kicker">Why this, not a download</p>
      <p className="mt-3 text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
        {lab.whyBuild}
      </p>
    </div>
  );
}

function StudyTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <p className="kicker">What to find</p>
        <p className="mt-2 text-base leading-relaxed text-ink">{lab.studyFirst.what}</p>
      </div>
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <p className="kicker">How to find it</p>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">{lab.studyFirst.how}</p>
      </div>
      <p className="text-xs italic text-ink-faint">
        Any examples you find are material to study and extract rules from, not to copy or
        rename. Do this before you open the workshop.
      </p>
    </div>
  );
}

function AnatomyTab({ lab }: { lab: Lab }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">{`Anatomy of a ${lab.name}`}</caption>
          <thead>
            <tr className="bg-paper-3/60 text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="px-5 py-3 font-medium">Part</th>
              <th scope="col" className="px-5 py-3 font-medium">Purpose</th>
              <th scope="col" className="px-5 py-3 font-medium">The rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lab.anatomy.map((a) => (
              <tr key={a.part} className="bg-paper-2 align-top">
                <td className="px-5 py-4 font-display text-base leading-tight">{a.part}</td>
                <td className="px-5 py-4 text-ink-soft">{a.purpose}</td>
                <td className="px-5 py-4 text-ink-soft">{a.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <p className="kicker">Build by these rules</p>
        <ul className="mt-3 space-y-2.5">
          {lab.principles.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DecisionsTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl space-y-3">
      {lab.decisions.map((d) => (
        <details
          key={d.q}
          className="group rounded-2xl border border-line bg-paper-2 p-5 open:border-ink"
        >
          <summary className="cursor-pointer list-none font-display text-lg leading-snug marker:content-none">
            {d.q}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.guide}</p>
        </details>
      ))}
    </div>
  );
}

function WorkshopTab({
  lab,
  answers,
  onAnswerChange,
}: {
  lab: Lab;
  answers: Record<string, string>;
  onAnswerChange: (stepId: string, value: string) => void;
}) {
  const document = buildDocument(lab, answers);

  return (
    <div>
      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{lab.builder.intro}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* The form, the user's own words */}
        <div className="space-y-5">
          {lab.builder.steps.map((step) => {
            const fieldId = `${lab.id}-${step.id}`;
            return (
              <div key={step.id}>
                <label htmlFor={fieldId} className="font-display text-base leading-tight">
                  {step.label}
                </label>
                <p id={`${fieldId}-hint`} className="mt-1 text-xs text-ink-faint">
                  {step.hint}
                </p>
                <textarea
                  id={fieldId}
                  name={fieldId}
                  rows={3}
                  value={answers[step.id] ?? ""}
                  onChange={(e) => onAnswerChange(step.id, e.target.value)}
                  placeholder={step.placeholder}
                  aria-describedby={`${fieldId}-hint ${fieldId}-rule`}
                  className="mt-2 w-full resize-y rounded-xl border border-line-strong bg-paper-2 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint/70 focus:border-ink focus:outline-none"
                />
                <p id={`${fieldId}-rule`} className="mt-1.5 text-xs italic text-ink-faint">
                  Rule: {step.rule}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live preview, assembled from what they wrote, nothing else */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line-strong bg-paper-2 shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-paper-3/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald/70" />
                </span>
                <p className="text-xs font-medium text-ink-faint">Live preview, your words</p>
              </div>
              <CopyButton value={document} label="Copy what I wrote" />
            </div>
            <div className="max-h-[520px] space-y-4 overflow-y-auto px-5 py-5">
              {lab.builder.steps.map((step) => {
                const value = answers[step.id]?.trim();
                return (
                  <div key={step.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <p className="kicker mb-1">{step.label}</p>
                    {value ? (
                      <p className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink">
                        {value}
                      </p>
                    ) : (
                      <p className="text-[13px] italic text-ink-faint">Not written yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            This preview is built only from what you typed, never from a pre-written example.
            When it looks right, copy it and open the <strong className="text-ink-soft">Build It For Real</strong> tab.
          </p>
        </div>
      </div>
    </div>
  );
}

function CritiqueTab({
  lab,
  checked,
  onToggleChecked,
}: {
  lab: Lab;
  checked: Record<number, boolean>;
  onToggleChecked: (index: number) => void;
}) {
  const doneCount = lab.critique.filter((_, i) => checked[i]).length;

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <p className="kicker mb-3">Watch out for</p>
        <ul className="space-y-2.5">
          {lab.mistakes.map((m) => (
            <li key={m} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-coral" />
              {m}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="kicker">Judge your own draft</p>
        <Pill tone={doneCount === lab.critique.length ? "emerald" : "neutral"}>
          {doneCount}/{lab.critique.length} checked
        </Pill>
      </div>
      <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper-2">
        {lab.critique.map((c, i) => {
          const fieldId = `${lab.id}-critique-${i}`;
          const isChecked = !!checked[i];
          return (
            <li key={c} className="flex items-start gap-3 p-4">
              <input
                type="checkbox"
                id={fieldId}
                checked={isChecked}
                onChange={() => onToggleChecked(i)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald"
              />
              <label
                htmlFor={fieldId}
                className={cn(
                  "flex-1 cursor-pointer text-sm leading-relaxed",
                  isChecked ? "text-ink-faint line-through" : "text-ink",
                )}
              >
                {c}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BuildRealTab({
  lab,
  answers,
  onGoToWorkshop,
}: {
  lab: Lab;
  answers: Record<string, string>;
  onGoToWorkshop: () => void;
}) {
  const document = buildDocument(lab, answers);
  const hasDraft = document.length > 0;

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <p className="kicker">Where to actually build it</p>
        <h3 className="mt-2 font-display text-xl leading-tight">{lab.buildIn.tool}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{lab.buildIn.how}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {hasDraft ? (
          <CopyButton value={document} label="Copy my draft" />
        ) : (
          <button
            type="button"
            onClick={onGoToWorkshop}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper-2 transition-all hover:-translate-y-0.5 hover:bg-coral"
          >
            Go write it in the Workshop
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        What you copy here is yours, your words, from your situation. Rebuild it in{" "}
        {lab.buildIn.tool} rather than living inside this page; that&rsquo;s the version
        you&rsquo;ll actually send.
      </p>
    </div>
  );
}
