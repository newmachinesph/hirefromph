"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import labsData from "@/data/labs.json";
import { CopyButton } from "@/components/copy-button";
import { ExportButton } from "@/components/practice";
import { labToMarkdown } from "@/lib/markdown-export";
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { migrateKey } from "@/lib/storage";

const LABS_KEY = "hfph.labs.v1";

type Lab = (typeof labsData)["labs"][number];

const EASE = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_TONE: Record<string, "verified" | "caution" | "signal"> = {
  Beginner: "verified",
  Intermediate: "caution",
  Advanced: "signal",
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

/** The same answers as `buildDocument`, as Markdown. Still never our copy. */
function buildMarkdown(lab: Lab, labAnswers: Record<string, string>): string {
  return labToMarkdown(
    lab.name,
    lab.builder.steps.map((step) => ({
      label: step.label,
      body: labAnswers[step.id]?.trim() ?? "",
    })),
  );
}

export function BuildLabs() {
  const labs = labsData.labs;
  const categoryChips = [{ id: "all", label: "All" }, ...labsData.categories];

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("why");
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [checked, setChecked] = useState<Record<string, Record<number, boolean>>>({});
  const [hydrated, setHydrated] = useState(false);

  // Your words are the artifact — keep the draft across reloads, same as the
  // rest of the app persists progress. Load once, then save on change.
  useEffect(() => {
    migrateKey("devup.labs.v1", LABS_KEY);
    try {
      const raw = localStorage.getItem(LABS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          answers?: typeof answers;
          checked?: typeof checked;
        };
        /* eslint-disable react-hooks/set-state-in-effect */
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.checked) setChecked(parsed.checked);
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
      localStorage.setItem(LABS_KEY, JSON.stringify({ answers, checked }));
    } catch {
      /* storage full / disabled */
    }
  }, [answers, checked, hydrated]);

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
                  <Button
                    key={c.id}
                    size="sm"
                    variant={active ? "primary" : "outline"}
                    onClick={() => setActiveCategory(c.id)}
                    aria-label={`${c.label}, ${count} labs`}
                    iconEnd={
                      <span className={cn("tabular-nums", active ? "text-white/70" : "text-ink-faint")}>
                        {count}
                      </span>
                    }
                  >
                    {c.label}
                  </Button>
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
                    className="group flex h-full flex-col rounded-md border border-line bg-paper p-6 text-left transition-all duration-300 hover:border-ink"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-ink text-paper transition-colors group-hover:bg-primary">
                        <Icon name={lab.icon} size={20} />
                      </span>
                      <Badge tone={DIFFICULTY_TONE[lab.difficulty] ?? "neutral"}>
                        {lab.difficulty}
                      </Badge>
                    </div>
                    <h2 className="mt-5 font-display text-xl leading-tight">{lab.name}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                      {lab.outcome}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-xs font-medium text-ink-faint">{lab.time}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                        Open the lab
                        <Icon
                          name="arrow-right"
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
      <Button variant="link" onClick={onBack} icon={<Icon name="arrow-left" size={15} />}>
        Back to all labs
      </Button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-ink text-paper">
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
          <Badge tone={DIFFICULTY_TONE[lab.difficulty] ?? "neutral"}>{lab.difficulty}</Badge>
          <Badge>{lab.time}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabId)} className="mt-6">
        <TabList label={`${lab.name}, lab sections`}>
          {TABS.map((tab) => (
            <Tab key={tab.id} value={tab.id} icon={<Icon name={tab.icon} size={14} />}>
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanel value="why">
          <WhyTab lab={lab} />
        </TabPanel>
        <TabPanel value="study">
          <StudyTab lab={lab} />
        </TabPanel>
        <TabPanel value="anatomy">
          <AnatomyTab lab={lab} />
        </TabPanel>
        <TabPanel value="decisions">
          <DecisionsTab lab={lab} />
        </TabPanel>
        <TabPanel value="workshop">
          <WorkshopTab lab={lab} answers={answers} onAnswerChange={onAnswerChange} />
        </TabPanel>
        <TabPanel value="critique">
          <CritiqueTab lab={lab} checked={checked} onToggleChecked={onToggleChecked} />
        </TabPanel>
        <TabPanel value="buildreal">
          <BuildRealTab lab={lab} answers={answers} onGoToWorkshop={() => onTabChange("workshop")} />
        </TabPanel>
      </Tabs>
    </motion.div>
  );
}

function WhyTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl">
      <p className="text-kicker uppercase text-ink-faint">Why this, not a download</p>
      <p className="mt-3 text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
        {lab.whyBuild}
      </p>
    </div>
  );
}

function StudyTab({ lab }: { lab: Lab }) {
  return (
    <div className="max-w-2xl space-y-5">
      <Card padding="md">
        <p className="text-kicker uppercase text-ink-faint">What to find</p>
        <p className="mt-2 text-base leading-relaxed text-ink">{lab.studyFirst.what}</p>
      </Card>
      <Card padding="md">
        <p className="text-kicker uppercase text-ink-faint">How to find it</p>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">{lab.studyFirst.how}</p>
      </Card>
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
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <caption className="sr-only">{`Anatomy of a ${lab.name}`}</caption>
          <thead>
            <tr className="bg-band/60 text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="px-5 py-3 font-medium">Part</th>
              <th scope="col" className="px-5 py-3 font-medium">Purpose</th>
              <th scope="col" className="px-5 py-3 font-medium">The rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lab.anatomy.map((a) => (
              <tr key={a.part} className="bg-paper align-top">
                <td className="px-5 py-4 font-display text-base leading-tight">{a.part}</td>
                <td className="px-5 py-4 text-ink-soft">{a.purpose}</td>
                <td className="px-5 py-4 text-ink-soft">{a.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <p className="text-kicker uppercase text-ink-faint">Build by these rules</p>
        <ul className="mt-3 space-y-2.5">
          {lab.principles.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
              <Icon name="check-circle-2" size={16} className="mt-0.5 shrink-0 text-verified" />
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
    <div className="max-w-2xl">
      <Accordion type="multiple">
        {lab.decisions.map((d) => (
          <AccordionItem key={d.q} id={d.q} title={d.q}>
            <Text size="small">{d.guide}</Text>
          </AccordionItem>
        ))}
      </Accordion>
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
              <Field key={step.id} label={step.label} hint={step.hint}>
                <Textarea
                  name={fieldId}
                  rows={3}
                  value={answers[step.id] ?? ""}
                  onChange={(e) => onAnswerChange(step.id, e.target.value)}
                  placeholder={step.placeholder}
                />
                <Text size="caption" tone="faint" className="italic">
                  Rule: {step.rule}
                </Text>
              </Field>
            );
          })}
        </div>

        {/* Live preview, assembled from what they wrote, nothing else */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-md border border-line-strong bg-paper">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-band/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="is-circle h-2.5 w-2.5 rounded-pill bg-primary/70" />
                  <span className="is-circle h-2.5 w-2.5 rounded-pill bg-caution/70" />
                  <span className="is-circle h-2.5 w-2.5 rounded-pill bg-verified/70" />
                </span>
                <p className="text-xs font-medium text-ink-faint">Live preview, your words</p>
              </div>
              {document.length > 0 ? (
                <div className="flex items-center gap-2">
                  <CopyButton value={document} label="Copy what I wrote" />
                  <ExportButton
                    title={lab.name}
                    kind="markdown"
                    filename={`${lab.id}.md`}
                    build={() => buildMarkdown(lab, answers)}
                  />
                </div>
              ) : (
                <p className="text-xs text-ink-faint">Write something first</p>
              )}
            </div>
            <div className="max-h-[520px] space-y-4 overflow-y-auto px-5 py-5">
              {lab.builder.steps.map((step) => {
                const value = answers[step.id]?.trim();
                return (
                  <div key={step.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <p className="text-kicker uppercase text-ink-faint mb-1">{step.label}</p>
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
      <Card padding="md">
        <p className="text-kicker uppercase text-ink-faint mb-3">Watch out for</p>
        <ul className="space-y-2.5">
          {lab.mistakes.map((m) => (
            <li key={m} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
              <Icon name="alert-triangle" size={16} className="mt-0.5 shrink-0 text-primary" />
              {m}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-kicker uppercase text-ink-faint">Judge your own draft</p>
        <Badge tone={doneCount === lab.critique.length ? "verified" : "neutral"}>
          {doneCount}/{lab.critique.length} checked
        </Badge>
      </div>
      <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-paper">
        {lab.critique.map((c, i) => {
          const fieldId = `${lab.id}-critique-${i}`;
          const isChecked = !!checked[i];
          return (
            <li key={c} className="p-4">
              <Checkbox
                id={fieldId}
                checked={isChecked}
                onChange={() => onToggleChecked(i)}
                label={
                  <span className={cn(isChecked && "text-ink-faint line-through")}>{c}</span>
                }
              />
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
      <Card padding="md">
        <p className="text-kicker uppercase text-ink-faint">Where to build it</p>
        <Heading level={3} size="h5" className="mt-2">
          {lab.buildIn.tool}
        </Heading>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{lab.buildIn.how}</p>
      </Card>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {hasDraft ? (
          <>
            <CopyButton value={document} label="Copy my draft" />
            <ExportButton
              title={lab.name}
              kind="markdown"
              filename={`${lab.id}.md`}
              build={() => buildMarkdown(lab, answers)}
            />
          </>
        ) : (
          <Button onClick={onGoToWorkshop} iconEnd={<Icon name="arrow-right" size={15} />}>
            Go write it in the Workshop
          </Button>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        What you copy here is yours, your words, from your situation. Rebuild it in{" "}
        {lab.buildIn.tool} rather than living inside this page; that&rsquo;s the version
        you&rsquo;ll send.
      </p>
    </div>
  );
}
